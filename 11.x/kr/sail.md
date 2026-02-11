# 라라벨 Sail

- [소개](#introduction)
- [설치 및 설정](#installation)
    - [기존 애플리케이션에 Sail 설치하기](#installing-sail-into-existing-applications)
    - [Sail 이미지 재빌드하기](#rebuilding-sail-images)
    - [쉘 별칭(Alias) 설정하기](#configuring-a-shell-alias)
- [Sail 시작 및 중지](#starting-and-stopping-sail)
- [명령어 실행하기](#executing-sail-commands)
    - [PHP 명령어 실행하기](#executing-php-commands)
    - [Composer 명령어 실행하기](#executing-composer-commands)
    - [Artisan 명령어 실행하기](#executing-artisan-commands)
    - [Node / NPM 명령어 실행하기](#executing-node-npm-commands)
- [데이터베이스와 상호작용하기](#interacting-with-sail-databases)
    - [MySQL](#mysql)
    - [MongoDB](#mongodb)
    - [Redis](#redis)
    - [Valkey](#valkey)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
- [파일 스토리지](#file-storage)
- [테스트 실행하기](#running-tests)
    - [Laravel Dusk](#laravel-dusk)
- [이메일 미리보기](#previewing-emails)
- [컨테이너 CLI](#sail-container-cli)
- [PHP 버전](#sail-php-versions)
- [Node 버전](#sail-node-versions)
- [사이트 공유하기](#sharing-your-site)
- [Xdebug로 디버깅하기](#debugging-with-xdebug)
  - [Xdebug CLI 사용법](#xdebug-cli-usage)
  - [Xdebug 브라우저 사용법](#xdebug-browser-usage)
- [커스터마이징](#sail-customization)

<a name="introduction"></a>
## 소개

[Laravel Sail](https://github.com/laravel/sail)은 라라벨의 기본 Docker 개발 환경과 상호작용하기 위한 경량 명령줄 인터페이스(Command-line Interface)입니다. Sail은 Docker 경험이 없어도 PHP, MySQL, Redis를 사용하여 라라벨 애플리케이션을 구축할 수 있는 훌륭한 출발점을 제공합니다.

핵심적으로 Sail은 프로젝트 루트에 저장된 `docker-compose.yml` 파일과 `sail` 스크립트로 구성됩니다. `sail` 스크립트는 `docker-compose.yml` 파일에 정의된 Docker 컨테이너와 상호작용하기 위한 편리한 메서드를 제공하는 CLI입니다.

Laravel Sail은 macOS, Linux, Windows([WSL2](https://docs.microsoft.com/en-us/windows/wsl/about) 사용)에서 지원됩니다.

<a name="installation"></a>
## 설치 및 설정

Laravel Sail은 모든 새 라라벨 애플리케이션에 자동으로 설치되므로 즉시 사용할 수 있습니다. 새 라라벨 애플리케이션을 생성하는 방법을 알아보려면 운영 체제에 맞는 라라벨 [설치 문서](/docs/{{version}}/installation#docker-installation-using-sail)를 참조하세요. 설치 과정에서 애플리케이션이 상호작용할 Sail 지원 서비스를 선택하게 됩니다.

<a name="installing-sail-into-existing-applications"></a>
### 기존 애플리케이션에 Sail 설치하기

기존 라라벨 애플리케이션에서 Sail을 사용하려면 Composer 패키지 매니저를 사용하여 Sail을 설치하면 됩니다. 물론, 이 단계는 기존 로컬 개발 환경에서 Composer 의존성을 설치할 수 있다고 가정합니다.

```bash
composer require laravel/sail --dev
```

Sail이 설치된 후 `sail:install` Artisan 명령어를 실행할 수 있습니다. 이 명령어는 Sail의 `docker-compose.yml` 파일을 애플리케이션 루트에 퍼블리시하고, Docker 서비스에 연결하는 데 필요한 환경 변수로 `.env` 파일을 수정합니다:

```bash
php artisan sail:install
```

마지막으로 Sail을 시작할 수 있습니다. Sail 사용 방법을 계속 배우려면 이 문서의 나머지 부분을 계속 읽어주세요.

```bash
./vendor/bin/sail up
```

> [!WARNING]  
> Linux용 Docker Desktop을 사용하는 경우 다음 명령어를 실행하여 `default` Docker 컨텍스트를 사용해야 합니다: `docker context use default`.

<a name="adding-additional-services"></a>
#### 추가 서비스 추가하기

기존 Sail 설치에 추가 서비스를 추가하려면 `sail:add` Artisan 명령어를 실행하면 됩니다.

```bash
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### Devcontainers 사용하기

[Devcontainer](https://code.visualstudio.com/docs/remote/containers) 내에서 개발하려면 `sail:install` 명령어에 `--devcontainer` 옵션을 제공할 수 있습니다. `--devcontainer` 옵션은 `sail:install` 명령어가 기본 `.devcontainer/devcontainer.json` 파일을 애플리케이션 루트에 퍼블리시하도록 지시합니다.

```bash
php artisan sail:install --devcontainer
```

<a name="rebuilding-sail-images"></a>
### Sail 이미지 재빌드하기

때때로 Sail 이미지를 완전히 재빌드하여 이미지의 모든 패키지와 소프트웨어가 최신 상태인지 확인하고 싶을 수 있습니다. `build` 명령어를 사용하여 이를 수행할 수 있습니다.

```bash
docker compose down -v

sail build --no-cache

sail up
```

<a name="configuring-a-shell-alias"></a>
### 쉘 별칭(Alias) 설정하기

기본적으로 Sail 명령어는 모든 새 라라벨 애플리케이션에 포함된 `vendor/bin/sail` 스크립트를 사용하여 호출됩니다.

```bash
./vendor/bin/sail up
```

그러나 Sail 명령어를 실행할 때마다 `vendor/bin/sail`을 반복해서 입력하는 대신, Sail의 명령어를 더 쉽게 실행할 수 있도록 쉘 별칭을 설정할 수 있습니다.

```bash
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
```

이를 항상 사용할 수 있도록 하려면 홈 디렉토리의 쉘 설정 파일(예: `~/.zshrc` 또는 `~/.bashrc`)에 이 내용을 추가한 다음 쉘을 재시작하면 됩니다.

쉘 별칭이 설정되면 단순히 `sail`을 입력하여 Sail 명령어를 실행할 수 있습니다. 이 문서의 나머지 예제에서는 이 별칭이 설정되어 있다고 가정합니다.

```bash
sail up
```

<a name="starting-and-stopping-sail"></a>
## Sail 시작 및 중지

Laravel Sail의 `docker-compose.yml` 파일은 라라벨 애플리케이션을 구축하는 데 함께 작동하는 다양한 Docker 컨테이너를 정의합니다. 이러한 각 컨테이너는 `docker-compose.yml` 파일의 `services` 설정 내의 항목입니다. `laravel.test` 컨테이너는 애플리케이션을 서빙하는 주요 애플리케이션 컨테이너입니다.

Sail을 시작하기 전에 로컬 컴퓨터에서 다른 웹 서버나 데이터베이스가 실행되고 있지 않은지 확인해야 합니다. 애플리케이션의 `docker-compose.yml` 파일에 정의된 모든 Docker 컨테이너를 시작하려면 `up` 명령어를 실행해야 합니다.

```bash
sail up
```

모든 Docker 컨테이너를 백그라운드에서 시작하려면 Sail을 "분리(detached)" 모드로 시작할 수 있습니다.

```bash
sail up -d
```

애플리케이션의 컨테이너가 시작되면 웹 브라우저에서 http://localhost로 프로젝트에 접근할 수 있습니다.

모든 컨테이너를 중지하려면 Control + C를 눌러 컨테이너 실행을 중지하면 됩니다. 또는 컨테이너가 백그라운드에서 실행 중인 경우 `stop` 명령어를 사용할 수 있습니다.

```bash
sail stop
```

<a name="executing-sail-commands"></a>
## 명령어 실행하기

Laravel Sail을 사용할 때 애플리케이션은 Docker 컨테이너 내에서 실행되며 로컬 컴퓨터와 격리됩니다. 그러나 Sail은 임의의 PHP 명령어, Artisan 명령어, Composer 명령어, Node / NPM 명령어 등 애플리케이션에 대해 다양한 명령어를 실행하는 편리한 방법을 제공합니다.

**라라벨 문서를 읽을 때 Sail을 참조하지 않는 Composer, Artisan, Node / NPM 명령어를 자주 볼 수 있습니다.** 이러한 예제는 해당 도구가 로컬 컴퓨터에 설치되어 있다고 가정합니다. 로컬 라라벨 개발 환경에 Sail을 사용하는 경우 Sail을 사용하여 해당 명령어를 실행해야 합니다.

```bash
# 로컬에서 Artisan 명령어 실행...
php artisan queue:work

# Laravel Sail 내에서 Artisan 명령어 실행...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### PHP 명령어 실행하기

PHP 명령어는 `php` 명령어를 사용하여 실행할 수 있습니다. 물론, 이러한 명령어는 애플리케이션에 설정된 PHP 버전을 사용하여 실행됩니다. Laravel Sail에서 사용할 수 있는 PHP 버전에 대해 자세히 알아보려면 [PHP 버전 문서](#sail-php-versions)를 참조하세요.

```bash
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Composer 명령어 실행하기

Composer 명령어는 `composer` 명령어를 사용하여 실행할 수 있습니다. Laravel Sail의 애플리케이션 컨테이너에는 Composer가 설치되어 있습니다.

```bash
sail composer require laravel/sanctum
```

<a name="installing-composer-dependencies-for-existing-projects"></a>
#### 기존 애플리케이션의 Composer 의존성 설치하기

팀과 함께 애플리케이션을 개발하는 경우, 처음에 라라벨 애플리케이션을 생성한 사람이 아닐 수 있습니다. 따라서 애플리케이션의 리포지토리를 로컬 컴퓨터에 클론한 후에는 Sail을 포함한 애플리케이션의 Composer 의존성이 설치되어 있지 않습니다.

애플리케이션의 디렉토리로 이동하여 다음 명령어를 실행하면 애플리케이션의 의존성을 설치할 수 있습니다. 이 명령어는 PHP와 Composer가 포함된 작은 Docker 컨테이너를 사용하여 애플리케이션의 의존성을 설치합니다:

```bash
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php84-composer:latest \
    composer install --ignore-platform-reqs
```

`laravelsail/phpXX-composer` 이미지를 사용할 때는 애플리케이션에서 사용할 것과 동일한 PHP 버전(`80`, `81`, `82`, `83` 또는 `84`)을 사용해야 합니다.

<a name="executing-artisan-commands"></a>
### Artisan 명령어 실행하기

Laravel Artisan 명령어는 `artisan` 명령어를 사용하여 실행할 수 있습니다.

```bash
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Node / NPM 명령어 실행하기

Node 명령어는 `node` 명령어를 사용하여 실행할 수 있고, NPM 명령어는 `npm` 명령어를 사용하여 실행할 수 있습니다.

```bash
sail node --version

sail npm run dev
```

원한다면 NPM 대신 Yarn을 사용할 수 있습니다.

```bash
sail yarn
```

<a name="interacting-with-sail-databases"></a>
## 데이터베이스와 상호작용하기

<a name="mysql"></a>
### MySQL

눈치채셨겠지만, 애플리케이션의 `docker-compose.yml` 파일에는 MySQL 컨테이너에 대한 항목이 포함되어 있습니다. 이 컨테이너는 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용하여 컨테이너를 중지하고 다시 시작해도 데이터베이스에 저장된 데이터가 유지됩니다.

또한 MySQL 컨테이너가 처음 시작될 때 두 개의 데이터베이스를 생성합니다. 첫 번째 데이터베이스는 `DB_DATABASE` 환경 변수 값을 사용하여 이름이 지정되며 로컬 개발용입니다. 두 번째는 `testing`이라는 전용 테스트 데이터베이스로, 테스트가 개발 데이터를 방해하지 않도록 보장합니다.

컨테이너를 시작한 후 애플리케이션의 `.env` 파일에서 `DB_HOST` 환경 변수를 `mysql`로 설정하여 애플리케이션 내에서 MySQL 인스턴스에 연결할 수 있습니다.

로컬 머신에서 애플리케이션의 MySQL 데이터베이스에 연결하려면 [TablePlus](https://tableplus.com)와 같은 그래픽 데이터베이스 관리 애플리케이션을 사용할 수 있습니다. 기본적으로 MySQL 데이터베이스는 `localhost` 포트 3306에서 접근할 수 있으며, 접근 자격 증명은 `DB_USERNAME` 및 `DB_PASSWORD` 환경 변수 값에 해당합니다. 또는 `DB_PASSWORD` 환경 변수 값을 암호로 사용하는 `root` 사용자로 연결할 수도 있습니다.

<a name="mongodb"></a>
### MongoDB

Sail 설치 시 [MongoDB](https://www.mongodb.com/) 서비스를 설치하기로 선택한 경우, 애플리케이션의 `docker-compose.yml` 파일에는 [검색 인덱스](https://www.mongodb.com/docs/atlas/atlas-search/)와 같은 Atlas 기능이 포함된 MongoDB 문서 데이터베이스를 제공하는 [MongoDB Atlas Local](https://www.mongodb.com/docs/atlas/cli/current/atlas-cli-local-cloud/) 컨테이너에 대한 항목이 포함됩니다. 이 컨테이너는 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용하여 컨테이너를 중지하고 다시 시작해도 데이터베이스에 저장된 데이터가 유지됩니다.

컨테이너를 시작한 후 애플리케이션의 `.env` 파일에서 `MONGODB_URI` 환경 변수를 `mongodb://mongodb:27017`로 설정하여 애플리케이션 내에서 MongoDB 인스턴스에 연결할 수 있습니다. 인증은 기본적으로 비활성화되어 있지만, `mongodb` 컨테이너를 시작하기 전에 `MONGODB_USERNAME` 및 `MONGODB_PASSWORD` 환경 변수를 설정하여 인증을 활성화할 수 있습니다. 그런 다음 연결 문자열에 자격 증명을 추가합니다.

```ini
MONGODB_USERNAME=user
MONGODB_PASSWORD=laravel
MONGODB_URI=mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@mongodb:27017
```

MongoDB를 애플리케이션과 원활하게 통합하려면 [MongoDB에서 관리하는 공식 패키지](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/)를 설치할 수 있습니다.

로컬 머신에서 애플리케이션의 MongoDB 데이터베이스에 연결하려면 [Compass](https://www.mongodb.com/products/tools/compass)와 같은 그래픽 인터페이스를 사용할 수 있습니다. 기본적으로 MongoDB 데이터베이스는 `localhost` 포트 `27017`에서 접근할 수 있습니다.

<a name="redis"></a>
### Redis

애플리케이션의 `docker-compose.yml` 파일에는 [Redis](https://redis.io) 컨테이너에 대한 항목도 포함되어 있습니다. 이 컨테이너는 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용하여 컨테이너를 중지하고 다시 시작해도 Redis 인스턴스에 저장된 데이터가 유지됩니다. 컨테이너를 시작한 후 애플리케이션의 `.env` 파일에서 `REDIS_HOST` 환경 변수를 `redis`로 설정하여 애플리케이션 내에서 Redis 인스턴스에 연결할 수 있습니다.

로컬 머신에서 애플리케이션의 Redis 데이터베이스에 연결하려면 [TablePlus](https://tableplus.com)와 같은 그래픽 데이터베이스 관리 애플리케이션을 사용할 수 있습니다. 기본적으로 Redis 데이터베이스는 `localhost` 포트 6379에서 접근할 수 있습니다.

<a name="valkey"></a>
### Valkey

Sail 설치 시 Valkey 서비스를 설치하기로 선택한 경우, 애플리케이션의 `docker-compose.yml` 파일에는 [Valkey](https://valkey.io/)에 대한 항목이 포함됩니다. 이 컨테이너는 [Docker 볼륨](https://docs.docker.com/storage/volumes/)을 사용하여 컨테이너를 중지하고 다시 시작해도 Valkey 인스턴스에 저장된 데이터가 유지됩니다. 애플리케이션의 `.env` 파일에서 `REDIS_HOST` 환경 변수를 `valkey`로 설정하여 애플리케이션에서 이 컨테이너에 연결할 수 있습니다.

로컬 머신에서 애플리케이션의 Valkey 데이터베이스에 연결하려면 [TablePlus](https://tableplus.com)와 같은 그래픽 데이터베이스 관리 애플리케이션을 사용할 수 있습니다. 기본적으로 Valkey 데이터베이스는 `localhost` 포트 6379에서 접근할 수 있습니다.

<a name="meilisearch"></a>
### Meilisearch

Sail 설치 시 [Meilisearch](https://www.meilisearch.com) 서비스를 설치하기로 선택한 경우, 애플리케이션의 `docker-compose.yml` 파일에는 [Laravel Scout](/docs/{{version}}/scout)와 통합된 이 강력한 검색 엔진에 대한 항목이 포함됩니다. 컨테이너를 시작한 후 `MEILISEARCH_HOST` 환경 변수를 `http://meilisearch:7700`으로 설정하여 애플리케이션 내에서 Meilisearch 인스턴스에 연결할 수 있습니다.

로컬 머신에서 웹 브라우저의 `http://localhost:7700`으로 이동하여 Meilisearch의 웹 기반 관리 패널에 접근할 수 있습니다.

<a name="typesense"></a>
### Typesense

Sail 설치 시 [Typesense](https://typesense.org) 서비스를 설치하기로 선택한 경우, 애플리케이션의 `docker-compose.yml` 파일에는 [Laravel Scout](/docs/{{version}}/scout#typesense)와 네이티브로 통합된 이 초고속 오픈소스 검색 엔진에 대한 항목이 포함됩니다. 컨테이너를 시작한 후 다음 환경 변수를 설정하여 애플리케이션 내에서 Typesense 인스턴스에 연결할 수 있습니다.

```ini
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

로컬 머신에서 `http://localhost:8108`을 통해 Typesense의 API에 접근할 수 있습니다.

<a name="file-storage"></a>
## 파일 스토리지

프로덕션 환경에서 애플리케이션을 실행할 때 Amazon S3를 사용하여 파일을 저장할 계획이라면, Sail 설치 시 [MinIO](https://min.io) 서비스를 설치하는 것이 좋습니다. MinIO는 프로덕션 S3 환경에서 "테스트" 스토리지 버킷을 생성하지 않고도 라라벨의 `s3` 파일 스토리지 드라이버를 사용하여 로컬에서 개발할 수 있는 S3 호환 API를 제공합니다. Sail 설치 시 MinIO를 설치하기로 선택하면 애플리케이션의 `docker-compose.yml` 파일에 MinIO 설정 섹션이 추가됩니다.

기본적으로 애플리케이션의 `filesystems` 설정 파일에는 이미 `s3` 디스크에 대한 디스크 설정이 포함되어 있습니다. 이 디스크를 사용하여 Amazon S3와 상호작용하는 것 외에도, 설정을 제어하는 관련 환경 변수를 간단히 수정하여 MinIO와 같은 S3 호환 파일 스토리지 서비스와 상호작용하는 데 사용할 수 있습니다. 예를 들어, MinIO를 사용할 때 파일시스템 환경 변수 설정은 다음과 같이 정의해야 합니다.

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

라라벨의 Flysystem 통합이 MinIO를 사용할 때 적절한 URL을 생성하려면 `AWS_URL` 환경 변수를 정의하여 애플리케이션의 로컬 URL과 일치하고 URL 경로에 버킷 이름이 포함되도록 해야 합니다:

```ini
AWS_URL=http://localhost:9000/local
```

`http://localhost:8900`에서 사용할 수 있는 MinIO 콘솔을 통해 버킷을 생성할 수 있습니다. MinIO 콘솔의 기본 사용자 이름은 `sail`이고 기본 비밀번호는 `password`입니다.

> [!WARNING]  
> MinIO를 사용할 때 `temporaryUrl` 메서드를 통한 임시 스토리지 URL 생성은 지원되지 않습니다.

<a name="running-tests"></a>
## 테스트 실행하기

라라벨은 기본적으로 훌륭한 테스트 지원을 제공하며, Sail의 `test` 명령어를 사용하여 애플리케이션의 [기능 및 유닛 테스트](/docs/{{version}}/testing)를 실행할 수 있습니다. Pest / PHPUnit에서 허용하는 모든 CLI 옵션도 `test` 명령어에 전달할 수 있습니다.

```bash
sail test

sail test --group orders
```

Sail `test` 명령어는 `test` Artisan 명령어를 실행하는 것과 동일합니다.

```bash
sail artisan test
```

기본적으로 Sail은 테스트가 데이터베이스의 현재 상태를 방해하지 않도록 전용 `testing` 데이터베이스를 생성합니다. 기본 라라벨 설치에서 Sail은 테스트를 실행할 때 이 데이터베이스를 사용하도록 `phpunit.xml` 파일도 설정합니다.

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](/docs/{{version}}/dusk)는 표현력 있고 사용하기 쉬운 브라우저 자동화 및 테스트 API를 제공합니다. Sail 덕분에 로컬 컴퓨터에 Selenium이나 다른 도구를 설치하지 않고도 이러한 테스트를 실행할 수 있습니다. 시작하려면 애플리케이션의 `docker-compose.yml` 파일에서 Selenium 서비스의 주석을 해제하세요.

```yaml
selenium:
    image: 'selenium/standalone-chrome'
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

다음으로, 애플리케이션의 `docker-compose.yml` 파일에서 `laravel.test` 서비스에 `selenium`에 대한 `depends_on` 항목이 있는지 확인하세요.

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

마지막으로 Sail을 시작하고 `dusk` 명령어를 실행하여 Dusk 테스트 스위트를 실행할 수 있습니다.

```bash
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Apple Silicon에서의 Selenium

로컬 머신에 Apple Silicon 칩이 있는 경우 `selenium` 서비스는 `selenium/standalone-chromium` 이미지를 사용해야 합니다.

```yaml
selenium:
    image: 'selenium/standalone-chromium'
    extra_hosts:
        - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

<a name="previewing-emails"></a>
## 이메일 미리보기

Laravel Sail의 기본 `docker-compose.yml` 파일에는 [Mailpit](https://github.com/axllent/mailpit)에 대한 서비스 항목이 포함되어 있습니다. Mailpit은 로컬 개발 중에 애플리케이션이 보낸 이메일을 가로채고 브라우저에서 이메일 메시지를 미리 볼 수 있는 편리한 웹 인터페이스를 제공합니다. Sail을 사용할 때 Mailpit의 기본 호스트는 `mailpit`이며 포트 1025를 통해 사용할 수 있습니다.

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Sail이 실행 중일 때 http://localhost:8025에서 Mailpit 웹 인터페이스에 접근할 수 있습니다.

<a name="sail-container-cli"></a>
## 컨테이너 CLI

때로는 애플리케이션의 컨테이너 내에서 Bash 세션을 시작하고 싶을 수 있습니다. `shell` 명령어를 사용하여 애플리케이션의 컨테이너에 연결하면 파일과 설치된 서비스를 검사하고 컨테이너 내에서 임의의 쉘 명령어를 실행할 수 있습니다.

```bash
sail shell

sail root-shell
```

새로운 [Laravel Tinker](https://github.com/laravel/tinker) 세션을 시작하려면 `tinker` 명령어를 실행하면 됩니다.

```bash
sail tinker
```

<a name="sail-php-versions"></a>
## PHP 버전

Sail은 현재 PHP 8.4, 8.3, 8.2, 8.1 또는 PHP 8.0을 통해 애플리케이션을 서빙하는 것을 지원합니다. Sail에서 사용하는 기본 PHP 버전은 현재 PHP 8.4입니다. 애플리케이션을 서빙하는 데 사용되는 PHP 버전을 변경하려면 애플리케이션의 `docker-compose.yml` 파일에서 `laravel.test` 컨테이너의 `build` 정의를 업데이트해야 합니다.

```yaml
# PHP 8.4
context: ./vendor/laravel/sail/runtimes/8.4

# PHP 8.3
context: ./vendor/laravel/sail/runtimes/8.3

# PHP 8.2
context: ./vendor/laravel/sail/runtimes/8.2

# PHP 8.1
context: ./vendor/laravel/sail/runtimes/8.1

# PHP 8.0
context: ./vendor/laravel/sail/runtimes/8.0
```

또한 애플리케이션에서 사용하는 PHP 버전을 반영하도록 `image` 이름을 업데이트할 수 있습니다. 이 옵션도 애플리케이션의 `docker-compose.yml` 파일에 정의되어 있습니다.

```yaml
image: sail-8.2/app
```

애플리케이션의 `docker-compose.yml` 파일을 업데이트한 후 컨테이너 이미지를 재빌드해야 합니다.

```bash
sail build --no-cache

sail up
```

<a name="sail-node-versions"></a>
## Node 버전

Sail은 기본적으로 Node 20을 설치합니다. 이미지를 빌드할 때 설치되는 Node 버전을 변경하려면 애플리케이션의 `docker-compose.yml` 파일에서 `laravel.test` 서비스의 `build.args` 정의를 업데이트하면 됩니다.

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '18'
```

애플리케이션의 `docker-compose.yml` 파일을 업데이트한 후 컨테이너 이미지를 재빌드해야 합니다.

```bash
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## 사이트 공유하기

때로는 동료에게 사이트를 미리 보여주거나 애플리케이션과 웹훅 통합을 테스트하기 위해 사이트를 공개적으로 공유해야 할 수 있습니다. 사이트를 공유하려면 `share` 명령어를 사용할 수 있습니다. 이 명령어를 실행하면 애플리케이션에 접근하는 데 사용할 수 있는 무작위 `laravel-sail.site` URL이 발급됩니다.

```bash
sail share
```

`share` 명령어를 통해 사이트를 공유할 때 애플리케이션의 `bootstrap/app.php` 파일에서 `trustProxies` 미들웨어 메서드를 사용하여 애플리케이션의 신뢰할 수 있는 프록시를 설정해야 합니다. 그렇지 않으면 `url` 및 `route`와 같은 URL 생성 헬퍼가 URL 생성 중에 사용해야 하는 올바른 HTTP 호스트를 결정할 수 없습니다.

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
    })

공유 사이트의 서브도메인을 선택하려면 `share` 명령어를 실행할 때 `subdomain` 옵션을 제공하면 됩니다.

```bash
sail share --subdomain=my-sail-site
```

> [!NOTE]  
> `share` 명령어는 [BeyondCode](https://beyondco.de)의 오픈소스 터널링 서비스인 [Expose](https://github.com/beyondcode/expose)로 구동됩니다.

<a name="debugging-with-xdebug"></a>
## Xdebug로 디버깅하기

Laravel Sail의 Docker 설정에는 PHP용 인기 있고 강력한 디버거인 [Xdebug](https://xdebug.org/) 지원이 포함되어 있습니다. Xdebug를 활성화하려면 [Sail 설정을 퍼블리시](#sail-customization)했는지 확인하세요. 그런 다음 애플리케이션의 `.env` 파일에 다음 변수를 추가하여 Xdebug를 설정합니다.

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

다음으로, 퍼블리시된 `php.ini` 파일에 지정된 모드에서 Xdebug가 활성화되도록 다음 설정이 포함되어 있는지 확인하세요.

```ini
[xdebug]
xdebug.mode=${XDEBUG_MODE}
```

`php.ini` 파일을 수정한 후 `php.ini` 파일에 대한 변경 사항이 적용되도록 Docker 이미지를 재빌드하는 것을 잊지 마세요.

```bash
sail build --no-cache
```

#### Linux 호스트 IP 설정

내부적으로 `XDEBUG_CONFIG` 환경 변수는 `client_host=host.docker.internal`로 정의되어 Mac 및 Windows(WSL2)에서 Xdebug가 올바르게 설정됩니다. 로컬 머신이 Linux를 실행하고 있고 Docker 20.10 이상을 사용하는 경우 `host.docker.internal`을 사용할 수 있으며 수동 설정이 필요하지 않습니다.

20.10 이전의 Docker 버전에서는 Linux에서 `host.docker.internal`이 지원되지 않으므로 호스트 IP를 수동으로 정의해야 합니다. 이렇게 하려면 `docker-compose.yml` 파일에서 커스텀 네트워크를 정의하여 컨테이너에 고정 IP를 설정합니다.

```yaml
networks:
  custom_network:
    ipam:
      config:
        - subnet: 172.20.0.0/16

services:
  laravel.test:
    networks:
      custom_network:
        ipv4_address: 172.20.0.2
```

고정 IP를 설정한 후 애플리케이션의 .env 파일 내에서 SAIL_XDEBUG_CONFIG 변수를 정의합니다.

```ini
SAIL_XDEBUG_CONFIG="client_host=172.20.0.2"
```

<a name="xdebug-cli-usage"></a>
### Xdebug CLI 사용법

Artisan 명령어를 실행할 때 디버깅 세션을 시작하기 위해 `sail debug` 명령어를 사용할 수 있습니다.

```bash
# Xdebug 없이 Artisan 명령어 실행...
sail artisan migrate

# Xdebug와 함께 Artisan 명령어 실행...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Xdebug 브라우저 사용법

웹 브라우저를 통해 애플리케이션과 상호작용하면서 애플리케이션을 디버깅하려면 웹 브라우저에서 Xdebug 세션을 시작하기 위해 [Xdebug에서 제공하는 지침](https://xdebug.org/docs/step_debug#web-application)을 따르세요.

PhpStorm을 사용하는 경우 [제로 설정 디버깅](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html)에 관한 JetBrains의 문서를 검토하세요.

> [!WARNING]  
> Laravel Sail은 애플리케이션을 서빙하기 위해 `artisan serve`에 의존합니다. `artisan serve` 명령어는 라라벨 버전 8.53.0부터 `XDEBUG_CONFIG` 및 `XDEBUG_MODE` 변수만 허용합니다. 이전 버전의 라라벨(8.52.0 이하)은 이러한 변수를 지원하지 않으며 디버그 연결을 수락하지 않습니다.

<a name="sail-customization"></a>
## 커스터마이징

Sail은 단지 Docker이므로 거의 모든 것을 자유롭게 커스터마이징할 수 있습니다. Sail 자체의 Dockerfile을 퍼블리시하려면 `sail:publish` 명령어를 실행하면 됩니다.

```bash
sail artisan sail:publish
```

이 명령어를 실행하면 Laravel Sail에서 사용하는 Dockerfile 및 기타 설정 파일이 애플리케이션 루트 디렉토리의 `docker` 디렉토리에 배치됩니다. Sail 설치를 커스터마이징한 후 애플리케이션의 `docker-compose.yml` 파일에서 애플리케이션 컨테이너의 이미지 이름을 변경할 수 있습니다. 그런 다음 `build` 명령어를 사용하여 애플리케이션의 컨테이너를 재빌드합니다. 단일 머신에서 여러 라라벨 애플리케이션을 개발하기 위해 Sail을 사용하는 경우 애플리케이션 이미지에 고유한 이름을 지정하는 것이 특히 중요합니다.

```bash
sail build --no-cache
```

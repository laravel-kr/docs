# 설치하기

- [Laravel 소개](#meet-laravel)
    - [왜 Laravel인가?](#why-laravel)
- [Laravel 프로젝트 생성하기](#creating-a-laravel-project)
- [초기 설정](#initial-configuration)
    - [환경 기반 설정](#environment-based-configuration)
    - [데이터베이스와 마이그레이션](#databases-and-migrations)
    - [디렉토리 설정](#directory-configuration)
- [Sail을 사용한 Docker 설치](#docker-installation-using-sail)
    - [macOS에서 Sail 사용하기](#sail-on-macos)
    - [Windows에서 Sail 사용하기](#sail-on-windows)
    - [Linux에서 Sail 사용하기](#sail-on-linux)
    - [Sail 서비스 선택하기](#choosing-your-sail-services)
- [IDE 지원](#ide-support)
- [Laravel과 AI](#laravel-and-ai)
    - [Laravel Boost 설치하기](#installing-laravel-boost)
- [다음 단계](#next-steps)
    - [풀스택 프레임워크로서의 Laravel](#laravel-the-fullstack-framework)
    - [API 백엔드로서의 Laravel](#laravel-the-api-backend)

<a name="meet-laravel"></a>
## Laravel 소개

Laravel은 표현력이 뛰어나고 우아한 문법을 갖춘 웹 애플리케이션 프레임워크입니다. 웹 프레임워크는 애플리케이션을 생성하기 위한 구조와 시작점을 제공하여, 여러분이 놀라운 것을 만드는 데 집중할 수 있도록 세부 사항을 처리해 드립니다.

Laravel은 철저한 의존성 주입(Dependency Injection), 표현력 있는 데이터베이스 추상화 레이어, 큐(Queue)와 예약된 작업, 단위 테스트 및 통합 테스트 등 강력한 기능을 제공하면서 놀라운 개발자 경험을 제공하기 위해 노력합니다.

PHP 웹 프레임워크를 처음 접하시든 수년간의 경험이 있으시든, Laravel은 여러분과 함께 성장할 수 있는 프레임워크입니다. 웹 개발자로서 첫 발을 내딛는 것을 도와드리거나, 전문 지식을 한 단계 끌어올릴 수 있도록 도움을 드리겠습니다. 여러분이 무엇을 만들어낼지 정말 기대됩니다.

> [!NOTE]
> Laravel을 처음 접하시나요? [Laravel Bootcamp](https://bootcamp.laravel.com)에서 프레임워크를 직접 체험하며 첫 번째 Laravel 애플리케이션을 만들어 보세요.

<a name="why-laravel"></a>
### 왜 Laravel인가?

웹 애플리케이션을 구축할 때 사용할 수 있는 다양한 도구와 프레임워크가 있습니다. 그러나 Laravel이 현대적인 풀스택 웹 애플리케이션을 구축하기 위한 최고의 선택이라고 믿습니다.

#### 점진적인 프레임워크

우리는 Laravel을 "점진적인" 프레임워크라고 부르고 싶습니다. 이는 Laravel이 여러분과 함께 성장한다는 것을 의미합니다. 웹 개발의 첫 발을 막 내딛는 중이라면, Laravel의 방대한 문서 라이브러리, 가이드, [비디오 튜토리얼](https://laracasts.com)이 부담스럽지 않게 기초를 배울 수 있도록 도와줄 것입니다.

시니어 개발자라면, Laravel은 [의존성 주입](/docs/{{version}}/container), [단위 테스트](/docs/{{version}}/testing), [큐](/docs/{{version}}/queues), [실시간 이벤트](/docs/{{version}}/broadcasting) 등을 위한 강력한 도구를 제공합니다. Laravel은 전문적인 웹 애플리케이션 구축에 최적화되어 있으며, 엔터프라이즈급 워크로드를 처리할 준비가 되어 있습니다.

#### 확장 가능한 프레임워크

Laravel은 놀라울 정도로 확장 가능합니다. PHP의 확장 친화적인 특성과 Redis와 같은 빠른 분산 캐시 시스템에 대한 Laravel의 내장 지원 덕분에, Laravel을 사용한 수평적 확장은 매우 쉽습니다. 실제로 Laravel 애플리케이션은 월간 수억 건의 요청을 처리할 수 있도록 쉽게 확장되었습니다.

극한의 확장이 필요하신가요? [Laravel Vapor](https://vapor.laravel.com)와 같은 플랫폼을 사용하면 AWS의 최신 서버리스 기술을 통해 거의 무제한적인 규모로 Laravel 애플리케이션을 실행할 수 있습니다.

#### 커뮤니티 프레임워크

Laravel은 PHP 생태계의 최고의 패키지들을 결합하여 가장 견고하고 개발자 친화적인 프레임워크를 제공합니다. 또한, 전 세계의 수천 명의 재능 있는 개발자들이 [프레임워크에 기여](https://github.com/laravel/framework)해 왔습니다. 누가 알겠습니까, 어쩌면 여러분도 Laravel 기여자가 될 수 있을지도요.

<a name="creating-a-laravel-project"></a>
## Laravel 프로젝트 생성하기

첫 번째 Laravel 프로젝트를 생성하기 전에, 로컬 컴퓨터에 PHP와 [Composer](https://getcomposer.org)가 설치되어 있는지 확인하세요. macOS에서 개발하는 경우, [Laravel Herd](https://herd.laravel.com)를 통해 몇 분 만에 PHP와 Composer를 설치할 수 있습니다. 또한, [Node와 NPM 설치](https://nodejs.org)를 권장합니다.

PHP와 Composer를 설치한 후, Composer의 `create-project` 명령어를 통해 새로운 Laravel 프로젝트를 생성할 수 있습니다.

```nothing
composer create-project "laravel/laravel:^10.0" example-app
```

또는 Composer를 통해 [Laravel 설치 프로그램](https://github.com/laravel/installer)을 전역으로 설치하여 새로운 Laravel 프로젝트를 생성할 수 있습니다.

```nothing
composer global require laravel/installer

laravel new example-app
```

프로젝트가 생성되면, Laravel Artisan의 `serve` 명령어를 사용하여 Laravel의 로컬 개발 서버를 시작하세요.

```nothing
cd example-app

php artisan serve
```

Artisan 개발 서버를 시작하면, 웹 브라우저에서 [http://localhost:8000](http://localhost:8000)으로 애플리케이션에 접근할 수 있습니다. 이제 [Laravel 생태계에서 다음 단계를 시작할](#next-steps) 준비가 되었습니다. 물론, [데이터베이스를 설정](#databases-and-migrations)하는 것도 좋습니다.

> [!NOTE]
> Laravel 애플리케이션을 개발할 때 빠르게 시작하고 싶다면, [스타터 킷](/docs/{{version}}/starter-kits) 중 하나를 사용하는 것을 고려해 보세요. Laravel의 스타터 킷은 새로운 Laravel 애플리케이션을 위한 백엔드 및 프론트엔드 인증 스캐폴딩을 제공합니다.

<a name="initial-configuration"></a>
## 초기 설정

Laravel 프레임워크의 모든 설정 파일은 `config` 디렉토리에 저장됩니다. 각 옵션은 문서화되어 있으므로, 파일을 자유롭게 살펴보고 사용 가능한 옵션들을 익혀보세요.

Laravel은 기본적으로 거의 추가 설정이 필요하지 않습니다. 바로 개발을 시작하실 수 있습니다! 그러나 `config/app.php` 파일과 해당 문서를 검토해 보시는 것이 좋습니다. 이 파일에는 애플리케이션에 따라 변경하고 싶을 수 있는 `timezone`이나 `locale`과 같은 여러 옵션이 포함되어 있습니다.

<a name="environment-based-configuration"></a>
### 환경 기반 설정

Laravel의 많은 설정 옵션 값은 애플리케이션이 로컬 컴퓨터에서 실행되는지 프로덕션 웹 서버에서 실행되는지에 따라 달라질 수 있으므로, 많은 중요한 설정 값은 애플리케이션 루트에 있는 `.env` 파일을 사용하여 정의됩니다.

`.env` 파일은 애플리케이션의 소스 컨트롤에 커밋하면 안 됩니다. 왜냐하면 애플리케이션을 사용하는 각 개발자/서버마다 다른 환경 설정이 필요할 수 있기 때문입니다. 또한, 침입자가 소스 컨트롤 저장소에 접근할 경우 민감한 자격 증명이 노출되어 보안 위험이 될 수 있습니다.

> [!NOTE]
> `.env` 파일과 환경 기반 설정에 대한 자세한 내용은 전체 [설정 문서](/docs/{{version}}/configuration#environment-configuration)를 확인하세요.

<a name="databases-and-migrations"></a>
### 데이터베이스와 마이그레이션

이제 Laravel 애플리케이션을 생성했으니, 아마도 데이터베이스에 데이터를 저장하고 싶을 것입니다. 기본적으로 애플리케이션의 `.env` 설정 파일은 Laravel이 MySQL 데이터베이스와 상호작용하며, `127.0.0.1`에서 데이터베이스에 접근하도록 지정합니다.

> [!NOTE]
> macOS에서 개발 중이고 MySQL, Postgres 또는 Redis를 로컬에 설치해야 하는 경우, [DBngin](https://dbngin.com/)을 사용하는 것을 고려해 보세요.

MySQL이나 Postgres를 로컬 머신에 설치하고 싶지 않다면, 언제든지 [SQLite](https://www.sqlite.org/index.html) 데이터베이스를 사용할 수 있습니다. SQLite는 작고, 빠르고, 자체 포함된 데이터베이스 엔진입니다. 시작하려면, `.env` 설정 파일을 업데이트하여 Laravel의 `sqlite` 데이터베이스 드라이버를 사용하도록 하세요. 다른 데이터베이스 설정 옵션은 제거해도 됩니다.

```ini
DB_CONNECTION=sqlite # [tl! add]
DB_CONNECTION=mysql # [tl! remove]
DB_HOST=127.0.0.1 # [tl! remove]
DB_PORT=3306 # [tl! remove]
DB_DATABASE=laravel # [tl! remove]
DB_USERNAME=root # [tl! remove]
DB_PASSWORD= # [tl! remove]
```

SQLite 데이터베이스를 설정한 후, 애플리케이션의 [데이터베이스 마이그레이션](/docs/{{version}}/migrations)을 실행하여 애플리케이션의 데이터베이스 테이블을 생성할 수 있습니다.

```shell
php artisan migrate
```

애플리케이션에 대한 SQLite 데이터베이스가 존재하지 않으면, Laravel은 데이터베이스를 생성할 것인지 물어봅니다. 일반적으로 SQLite 데이터베이스 파일은 `database/database.sqlite`에 생성됩니다.

<a name="directory-configuration"></a>
### 디렉토리 설정

Laravel은 항상 웹 서버에 설정된 "웹 디렉토리"의 루트에서 제공되어야 합니다. "웹 디렉토리"의 하위 디렉토리에서 Laravel 애플리케이션을 제공하려고 하면 안 됩니다. 그렇게 하면 애플리케이션 내에 존재하는 민감한 파일이 노출될 수 있습니다.

<a name="docker-installation-using-sail"></a>
## Sail을 사용한 Docker 설치

선호하는 운영 체제에 관계없이 Laravel을 최대한 쉽게 시작할 수 있도록 하고 싶습니다. 그래서 로컬 머신에서 Laravel 프로젝트를 개발하고 실행하기 위한 다양한 옵션이 있습니다. 나중에 이러한 옵션들을 살펴볼 수 있지만, Laravel은 [Docker](https://www.docker.com)를 사용하여 Laravel 프로젝트를 실행하기 위한 내장 솔루션인 [Sail](/docs/{{version}}/sail)을 제공합니다.

Docker는 로컬 머신에 설치된 소프트웨어나 설정을 방해하지 않는 작고 가벼운 "컨테이너"에서 애플리케이션과 서비스를 실행하는 도구입니다. 이는 웹 서버나 데이터베이스와 같은 복잡한 개발 도구를 로컬 머신에 설정하거나 구성하는 것에 대해 걱정할 필요가 없다는 것을 의미합니다. 시작하려면 [Docker Desktop](https://www.docker.com/products/docker-desktop)만 설치하면 됩니다.

Laravel Sail은 Laravel의 기본 Docker 구성과 상호작용하기 위한 경량 커맨드 라인 인터페이스입니다. Sail은 사전 Docker 경험 없이도 PHP, MySQL, Redis를 사용하여 Laravel 애플리케이션을 구축하기 위한 훌륭한 시작점을 제공합니다.

> [!NOTE]
> 이미 Docker 전문가이신가요? 걱정하지 마세요! Sail에 대한 모든 것은 Laravel에 포함된 `docker-compose.yml` 파일을 사용하여 커스터마이징할 수 있습니다.

<a name="sail-on-macos"></a>
### macOS에서 Sail 사용하기

Mac에서 개발하고 있고 [Docker Desktop](https://www.docker.com/products/docker-desktop)이 이미 설치되어 있다면, 간단한 터미널 명령어를 사용하여 새로운 Laravel 프로젝트를 생성할 수 있습니다. 예를 들어, "example-app"이라는 디렉토리에 새로운 Laravel 애플리케이션을 생성하려면 터미널에서 다음 명령어를 실행하면 됩니다.

```shell
curl -s "https://laravel.build/example-app" | bash
```

물론, 이 URL에서 "example-app"을 원하는 이름으로 변경할 수 있습니다 - 애플리케이션 이름에는 영숫자, 대시, 밑줄만 포함되어야 합니다. Laravel 애플리케이션의 디렉토리는 명령어를 실행한 디렉토리 내에 생성됩니다.

Sail 설치는 Sail의 애플리케이션 컨테이너가 로컬 머신에서 빌드되는 동안 몇 분이 걸릴 수 있습니다.

프로젝트가 생성된 후, 애플리케이션 디렉토리로 이동하여 Laravel Sail을 시작할 수 있습니다. Laravel Sail은 Laravel의 기본 Docker 구성과 상호작용하기 위한 간단한 커맨드 라인 인터페이스를 제공합니다.

```shell
cd example-app

./vendor/bin/sail up
```

애플리케이션의 Docker 컨테이너가 시작되면, 웹 브라우저에서 http://localhost 로 애플리케이션에 접근할 수 있습니다.

> [!NOTE]
> Laravel Sail에 대해 더 자세히 알아보려면, [전체 문서](/docs/{{version}}/sail)를 확인하세요.

<a name="sail-on-windows"></a>
### Windows에서 Sail 사용하기

Windows 머신에서 새로운 Laravel 애플리케이션을 생성하기 전에, [Docker Desktop](https://www.docker.com/products/docker-desktop)을 설치해야 합니다. 그 다음, Windows Subsystem for Linux 2 (WSL2)가 설치되고 활성화되어 있는지 확인해야 합니다. WSL을 사용하면 Windows 10에서 Linux 바이너리 실행 파일을 네이티브로 실행할 수 있습니다. WSL2를 설치하고 활성화하는 방법에 대한 정보는 Microsoft의 [개발자 환경 문서](https://docs.microsoft.com/en-us/windows/wsl/install-win10)에서 찾을 수 있습니다.

> [!NOTE]
> WSL2를 설치하고 활성화한 후, Docker Desktop이 [WSL2 백엔드를 사용하도록 설정](https://docs.docker.com/docker-for-windows/wsl/)되어 있는지 확인해야 합니다.

다음으로, 첫 번째 Laravel 프로젝트를 생성할 준비가 되었습니다. [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab)을 실행하고 WSL2 Linux 운영 체제를 위한 새 터미널 세션을 시작하세요. 그 다음, 간단한 터미널 명령어를 사용하여 새로운 Laravel 프로젝트를 생성할 수 있습니다. 예를 들어, "example-app"이라는 디렉토리에 새로운 Laravel 애플리케이션을 생성하려면 터미널에서 다음 명령어를 실행하면 됩니다.

```shell
curl -s https://laravel.build/example-app | bash
```

물론, 이 URL에서 "example-app"을 원하는 이름으로 변경할 수 있습니다 - 애플리케이션 이름에는 영숫자, 대시, 밑줄만 포함되어야 합니다. Laravel 애플리케이션의 디렉토리는 명령어를 실행한 디렉토리 내에 생성됩니다.

Sail 설치는 Sail의 애플리케이션 컨테이너가 로컬 머신에서 빌드되는 동안 몇 분이 걸릴 수 있습니다.

프로젝트가 생성된 후, 애플리케이션 디렉토리로 이동하여 Laravel Sail을 시작할 수 있습니다. Laravel Sail은 Laravel의 기본 Docker 구성과 상호작용하기 위한 간단한 커맨드 라인 인터페이스를 제공합니다.

```shell
cd example-app

./vendor/bin/sail up
```

애플리케이션의 Docker 컨테이너가 시작되면, 웹 브라우저에서 http://localhost 로 애플리케이션에 접근할 수 있습니다.

> [!NOTE]
> Laravel Sail에 대해 더 자세히 알아보려면, [전체 문서](/docs/{{version}}/sail)를 확인하세요.

#### WSL2 내에서 개발하기

물론, WSL2 설치 내에서 생성된 Laravel 애플리케이션 파일을 수정할 수 있어야 합니다. 이를 위해 Microsoft의 [Visual Studio Code](https://code.visualstudio.com) 에디터와 [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)용 퍼스트파티 확장을 사용하는 것을 권장합니다.

이 도구들이 설치되면, Windows Terminal을 사용하여 애플리케이션의 루트 디렉토리에서 `code .` 명령어를 실행하여 모든 Laravel 프로젝트를 열 수 있습니다.

<a name="sail-on-linux"></a>
### Linux에서 Sail 사용하기

Linux에서 개발하고 있고 [Docker Compose](https://docs.docker.com/compose/install/)가 이미 설치되어 있다면, 간단한 터미널 명령어를 사용하여 새로운 Laravel 프로젝트를 생성할 수 있습니다.

먼저, Linux용 Docker Desktop을 사용하고 있다면 다음 명령어를 실행해야 합니다. Linux용 Docker Desktop을 사용하지 않는 경우 이 단계를 건너뛸 수 있습니다.

```shell
docker context use default
```

그런 다음, "example-app"이라는 디렉토리에 새로운 Laravel 애플리케이션을 생성하려면 터미널에서 다음 명령어를 실행하면 됩니다.

```shell
curl -s https://laravel.build/example-app | bash
```

물론, 이 URL에서 "example-app"을 원하는 이름으로 변경할 수 있습니다 - 애플리케이션 이름에는 영숫자, 대시, 밑줄만 포함되어야 합니다. Laravel 애플리케이션의 디렉토리는 명령어를 실행한 디렉토리 내에 생성됩니다.

Sail 설치는 Sail의 애플리케이션 컨테이너가 로컬 머신에서 빌드되는 동안 몇 분이 걸릴 수 있습니다.

프로젝트가 생성된 후, 애플리케이션 디렉토리로 이동하여 Laravel Sail을 시작할 수 있습니다. Laravel Sail은 Laravel의 기본 Docker 구성과 상호작용하기 위한 간단한 커맨드 라인 인터페이스를 제공합니다.

```shell
cd example-app

./vendor/bin/sail up
```

애플리케이션의 Docker 컨테이너가 시작되면, 웹 브라우저에서 http://localhost 로 애플리케이션에 접근할 수 있습니다.

> [!NOTE]
> Laravel Sail에 대해 더 자세히 알아보려면, [전체 문서](/docs/{{version}}/sail)를 확인하세요.

<a name="choosing-your-sail-services"></a>
### Sail 서비스 선택하기

Sail을 통해 새로운 Laravel 애플리케이션을 생성할 때, `with` 쿼리 문자열 변수를 사용하여 새 애플리케이션의 `docker-compose.yml` 파일에 어떤 서비스를 설정할지 선택할 수 있습니다. 사용 가능한 서비스로는 `mysql`, `pgsql`, `mariadb`, `redis`, `memcached`, `meilisearch`, `typesense`, `minio`, `selenium`, `mailpit`이 있습니다.

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis" | bash
```

어떤 서비스를 설정할지 지정하지 않으면, `mysql`, `redis`, `meilisearch`, `mailpit`, `selenium`으로 구성된 기본 스택이 설정됩니다.

URL에 `devcontainer` 파라미터를 추가하여 기본 [Devcontainer](/docs/{{version}}/sail#using-devcontainers)를 설치하도록 Sail에 지시할 수 있습니다.

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis&devcontainer" | bash
```

<a name="ide-support"></a>
## IDE 지원

Laravel 애플리케이션을 개발할 때 원하는 코드 에디터를 자유롭게 사용할 수 있습니다. 그러나 [PhpStorm](https://www.jetbrains.com/phpstorm/laravel/)은 [Laravel Pint](https://www.jetbrains.com/help/phpstorm/using-laravel-pint.html)를 포함하여 Laravel과 그 생태계에 대한 광범위한 지원을 제공합니다.

또한, 커뮤니티에서 관리하는 [Laravel Idea](https://laravel-idea.com/) PhpStorm 플러그인은 코드 생성, Eloquent 구문 완성, 유효성 검사 규칙 완성 등 다양한 유용한 IDE 보강 기능을 제공합니다.

<a name="laravel-and-ai"></a>
## Laravel과 AI

[Laravel Boost](https://github.com/laravel/boost)는 AI 코딩 에이전트와 Laravel 애플리케이션 사이의 격차를 해소하는 강력한 도구입니다. Boost는 AI 에이전트에게 Laravel 전용 컨텍스트, 도구, 가이드라인을 제공하여 Laravel 규칙을 따르는 더 정확한 버전별 코드를 생성할 수 있게 합니다.

Laravel 애플리케이션에 Boost를 설치하면, AI 에이전트는 사용 중인 패키지 확인, 데이터베이스 쿼리, Laravel 문서 검색, 브라우저 로그 읽기, 테스트 생성, Tinker를 통한 코드 실행 등 15가지 이상의 전문 도구에 접근할 수 있게 됩니다.

또한, Boost는 AI 에이전트에게 설치된 패키지 버전에 맞는 17,000개 이상의 벡터화된 Laravel 생태계 문서에 대한 접근을 제공합니다. 이는 에이전트가 프로젝트에서 사용하는 정확한 버전에 맞춘 가이드를 제공할 수 있음을 의미합니다.

Boost에는 또한 에이전트가 프레임워크 규칙을 따르고, 적절한 테스트를 작성하며, Laravel 코드를 생성할 때 일반적인 함정을 피하도록 돕는 Laravel에서 관리하는 AI 가이드라인이 포함되어 있습니다.

<a name="installing-laravel-boost"></a>
### Laravel Boost 설치하기

Boost는 PHP 8.1 이상을 실행하는 Laravel 10, 11, 12 애플리케이션에 설치할 수 있습니다. 시작하려면 Boost를 개발 의존성으로 설치하세요:

```shell
composer require laravel/boost --dev
```

설치 후, 대화형 설치 프로그램을 실행하세요:

```shell
php artisan boost:install
```

설치 프로그램은 IDE와 AI 에이전트를 자동으로 감지하여 프로젝트에 적합한 기능을 선택할 수 있게 합니다. Boost는 기존 프로젝트 규칙을 존중하며 기본적으로 강제적인 스타일 규칙을 적용하지 않습니다.

> [!NOTE]
> Boost에 대해 더 알아보려면 [GitHub의 Laravel Boost 저장소](https://github.com/laravel/boost)를 확인하세요.

<a name="next-steps"></a>
## 다음 단계

이제 Laravel 프로젝트를 생성했으니, 다음에 무엇을 배울지 궁금할 수 있습니다. 먼저, 다음 문서를 읽어 Laravel이 어떻게 작동하는지 익히는 것을 강력히 권장합니다.

<div class="content-list" markdown="1">

- [요청 라이프사이클](/docs/{{version}}/lifecycle)
- [설정](/docs/{{version}}/configuration)
- [디렉토리 구조](/docs/{{version}}/structure)
- [프론트엔드](/docs/{{version}}/frontend)
- [서비스 컨테이너](/docs/{{version}}/container)
- [파사드](/docs/{{version}}/facades)

</div>

Laravel을 어떻게 사용하고 싶은지에 따라 여정의 다음 단계가 결정됩니다. Laravel을 사용하는 다양한 방법이 있으며, 아래에서 프레임워크의 두 가지 주요 사용 사례를 살펴보겠습니다.

> [!NOTE]
> Laravel을 처음 접하시나요? [Laravel Bootcamp](https://bootcamp.laravel.com)에서 프레임워크를 직접 체험하며 첫 번째 Laravel 애플리케이션을 만들어 보세요.

<a name="laravel-the-fullstack-framework"></a>
### 풀스택 프레임워크로서의 Laravel

Laravel은 풀스택 프레임워크로 사용될 수 있습니다. "풀스택" 프레임워크란 Laravel을 사용하여 애플리케이션으로의 요청을 라우팅하고 [Blade 템플릿](/docs/{{version}}/blade) 또는 [Inertia](https://inertiajs.com)와 같은 단일 페이지 애플리케이션 하이브리드 기술을 통해 프론트엔드를 렌더링한다는 것을 의미합니다. 이것이 Laravel 프레임워크를 사용하는 가장 일반적인 방법이며, 우리의 의견으로는 Laravel을 가장 생산적으로 사용하는 방법입니다.

이 방식으로 Laravel을 사용할 계획이라면, [프론트엔드 개발](/docs/{{version}}/frontend), [라우팅](/docs/{{version}}/routing), [뷰](/docs/{{version}}/views) 또는 [Eloquent ORM](/docs/{{version}}/eloquent)에 대한 문서를 확인해 보세요. 또한, [Livewire](https://livewire.laravel.com)나 [Inertia](https://inertiajs.com)와 같은 커뮤니티 패키지에 대해 배우는 것도 좋습니다. 이러한 패키지를 사용하면 Laravel을 풀스택 프레임워크로 사용하면서 단일 페이지 JavaScript 애플리케이션이 제공하는 많은 UI 이점을 누릴 수 있습니다.

Laravel을 풀스택 프레임워크로 사용하는 경우, [Vite](/docs/{{version}}/vite)를 사용하여 애플리케이션의 CSS와 JavaScript를 컴파일하는 방법을 배우는 것도 강력히 권장합니다.

> [!NOTE]
> 애플리케이션 구축을 빠르게 시작하고 싶다면, 공식 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits) 중 하나를 확인해 보세요.

<a name="laravel-the-api-backend"></a>
### API 백엔드로서의 Laravel

Laravel은 JavaScript 단일 페이지 애플리케이션이나 모바일 애플리케이션의 API 백엔드로도 사용될 수 있습니다. 예를 들어, [Next.js](https://nextjs.org) 애플리케이션의 API 백엔드로 Laravel을 사용할 수 있습니다. 이 맥락에서, Laravel을 사용하여 애플리케이션에 [인증](/docs/{{version}}/sanctum) 및 데이터 저장/검색을 제공하면서, 큐, 이메일, 알림 등 Laravel의 강력한 서비스를 활용할 수 있습니다.

이 방식으로 Laravel을 사용할 계획이라면, [라우팅](/docs/{{version}}/routing), [Laravel Sanctum](/docs/{{version}}/sanctum), [Eloquent ORM](/docs/{{version}}/eloquent)에 대한 문서를 확인해 보세요.

> [!NOTE]
> Laravel 백엔드와 Next.js 프론트엔드의 스캐폴딩을 빠르게 시작해야 하나요? Laravel Breeze는 [API 스택](/docs/{{version}}/starter-kits#breeze-and-next)과 [Next.js 프론트엔드 구현](https://github.com/laravel/breeze-next)을 제공하여 몇 분 만에 시작할 수 있습니다.

# Laravel Octane

- [소개](#introduction)
- [설치](#installation)
- [서버 요구 사항](#server-prerequisites)
    - [FrankenPHP](#frankenphp)
    - [RoadRunner](#roadrunner)
    - [Swoole](#swoole)
- [애플리케이션 서비스하기](#serving-your-application)
    - [HTTPS로 애플리케이션 서비스하기](#serving-your-application-via-https)
    - [Nginx를 통해 애플리케이션 서비스하기](#serving-your-application-via-nginx)
    - [파일 변경 감시하기](#watching-for-file-changes)
    - [워커 수 지정하기](#specifying-the-worker-count)
    - [최대 요청 수 지정하기](#specifying-the-max-request-count)
    - [워커 다시 로드하기](#reloading-the-workers)
    - [서버 중지하기](#stopping-the-server)
- [의존성 주입과 Octane](#dependency-injection-and-octane)
    - [컨테이너 주입](#container-injection)
    - [요청 주입](#request-injection)
    - [설정 저장소 주입](#configuration-repository-injection)
- [메모리 누수 관리](#managing-memory-leaks)
- [동시 작업](#concurrent-tasks)
- [틱과 인터벌](#ticks-and-intervals)
- [Octane 캐시](#the-octane-cache)
- [테이블](#tables)

<a name="introduction"></a>
## 소개

[Laravel Octane](https://github.com/laravel/octane)은 [FrankenPHP](https://frankenphp.dev/), [Open Swoole](https://openswoole.com/), [Swoole](https://github.com/swoole/swoole-src), [RoadRunner](https://roadrunner.dev)를 포함한 고성능 애플리케이션 서버를 사용하여 애플리케이션의 성능을 극대화합니다. Octane은 애플리케이션을 한 번 부팅하고 메모리에 유지한 다음 초고속으로 요청을 처리합니다.

<a name="installation"></a>
## 설치

Octane은 Composer 패키지 매니저를 통해 설치할 수 있습니다.

```shell
composer require laravel/octane
```

Octane을 설치한 후, `octane:install` Artisan 명령어를 실행하여 Octane의 설정 파일을 애플리케이션에 설치할 수 있습니다.

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## 서버 요구 사항

> [!WARNING]  
> Laravel Octane은 [PHP 8.1+](https://php.net/releases/)이 필요합니다.

<a name="frankenphp"></a>
### FrankenPHP

> [!WARNING]
> FrankenPHP의 Octane 통합은 베타 버전이므로 프로덕션에서 사용할 때 주의해야 합니다.

[FrankenPHP](https://frankenphp.dev)는 Go로 작성된 PHP 애플리케이션 서버로, 조기 힌트(early hints)와 Zstandard 압축과 같은 최신 웹 기능을 지원합니다. Octane을 설치하고 FrankenPHP를 서버로 선택하면, Octane이 자동으로 FrankenPHP 바이너리를 다운로드하고 설치합니다.

<a name="frankenphp-via-laravel-sail"></a>
#### Laravel Sail을 통한 FrankenPHP

[Laravel Sail](/docs/{{version}}/sail)을 사용하여 애플리케이션을 개발할 계획이라면, 다음 명령어를 실행하여 Octane과 FrankenPHP를 설치해야 합니다.

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane
```

다음으로, `octane:install` Artisan 명령어를 사용하여 FrankenPHP 바이너리를 설치해야 합니다.

```shell
./vendor/bin/sail artisan octane:install --server=frankenphp
```

마지막으로, 애플리케이션의 `docker-compose.yml` 파일에서 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가합니다. 이 환경 변수는 Sail이 PHP 개발 서버 대신 Octane을 사용하여 애플리케이션을 서비스하는 데 사용할 명령어를 포함합니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=frankenphp --host=0.0.0.0 --admin-port=2019 --port=80" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

HTTPS, HTTP/2, HTTP/3을 활성화하려면 대신 다음과 같이 수정합니다.

```yaml
services:
  laravel.test:
    ports:
        - '${APP_PORT:-80}:80'
        - '${VITE_PORT:-5173}:${VITE_PORT:-5173}'
        - '443:443' # [tl! add]
        - '443:443/udp' # [tl! add]
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --host=localhost --port=443 --admin-port=2019 --https" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

일반적으로 FrankenPHP Sail 애플리케이션은 `https://localhost`를 통해 접근해야 합니다. `https://127.0.0.1`을 사용하려면 추가 설정이 필요하며 [권장되지 않습니다](https://frankenphp.dev/docs/known-issues/#using-https127001-with-docker).

<a name="frankenphp-via-docker"></a>
#### Docker를 통한 FrankenPHP

FrankenPHP의 공식 Docker 이미지를 사용하면 성능이 향상되고 FrankenPHP 정적 설치에 포함되지 않은 추가 확장 기능을 사용할 수 있습니다. 또한 공식 Docker 이미지는 Windows와 같이 FrankenPHP가 기본적으로 지원하지 않는 플랫폼에서 FrankenPHP를 실행할 수 있도록 지원합니다. FrankenPHP의 공식 Docker 이미지는 로컬 개발과 프로덕션 사용 모두에 적합합니다.

다음 Dockerfile을 FrankenPHP 기반 Laravel 애플리케이션을 컨테이너화하는 시작점으로 사용할 수 있습니다.

```dockerfile
FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl
    # 여기에 다른 PHP 확장 기능을 추가하세요...

COPY . /app

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
```

그런 다음 개발 중에 다음 Docker Compose 파일을 활용하여 애플리케이션을 실행할 수 있습니다.

```yaml
# compose.yaml
services:
  frankenphp:
    build:
      context: .
    entrypoint: php artisan octane:frankenphp --max-requests=1
    ports:
      - "8000:8000"
    volumes:
      - .:/app
```

Docker에서 FrankenPHP를 실행하는 방법에 대한 자세한 내용은 [공식 FrankenPHP 문서](https://frankenphp.dev/docs/docker/)를 참조하세요.

<a name="roadrunner"></a>
### RoadRunner

[RoadRunner](https://roadrunner.dev)는 Go를 사용하여 빌드된 RoadRunner 바이너리로 구동됩니다. RoadRunner 기반 Octane 서버를 처음 시작할 때, Octane이 RoadRunner 바이너리를 다운로드하고 설치할 것인지 제안합니다.

<a name="roadrunner-via-laravel-sail"></a>
#### Laravel Sail을 통한 RoadRunner

[Laravel Sail](/docs/{{version}}/sail)을 사용하여 애플리케이션을 개발할 계획이라면, 다음 명령어를 실행하여 Octane과 RoadRunner를 설치해야 합니다.

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner-cli spiral/roadrunner-http
```

다음으로, Sail 쉘을 시작하고 `rr` 실행 파일을 사용하여 RoadRunner 바이너리의 최신 Linux 빌드를 가져와야 합니다.

```shell
./vendor/bin/sail shell

# Sail 쉘 내에서...
./vendor/bin/rr get-binary
```

그런 다음, 애플리케이션의 `docker-compose.yml` 파일에서 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가합니다. 이 환경 변수는 Sail이 PHP 개발 서버 대신 Octane을 사용하여 애플리케이션을 서비스하는 데 사용할 명령어를 포함합니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port=80" # [tl! add]
```

마지막으로, `rr` 바이너리가 실행 가능한지 확인하고 Sail 이미지를 빌드합니다.

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

Swoole 애플리케이션 서버를 사용하여 Laravel Octane 애플리케이션을 서비스하려면 Swoole PHP 확장 기능을 설치해야 합니다. 일반적으로 이 작업은 PECL을 통해 수행할 수 있습니다.

```shell
pecl install swoole
```

<a name="openswoole"></a>
#### Open Swoole

Open Swoole 애플리케이션 서버를 사용하여 Laravel Octane 애플리케이션을 서비스하려면 Open Swoole PHP 확장 기능을 설치해야 합니다. 일반적으로 이 작업은 PECL을 통해 수행할 수 있습니다.

```shell
pecl install openswoole
```

Open Swoole과 함께 Laravel Octane을 사용하면 동시 작업, 틱, 인터벌 등 Swoole이 제공하는 것과 동일한 기능을 사용할 수 있습니다.

<a name="swoole-via-laravel-sail"></a>
#### Laravel Sail을 통한 Swoole

> [!WARNING]  
> Sail을 통해 Octane 애플리케이션을 서비스하기 전에, 최신 버전의 Laravel Sail이 있는지 확인하고 애플리케이션의 루트 디렉토리에서 `./vendor/bin/sail build --no-cache`를 실행하세요.

또는 Laravel의 공식 Docker 기반 개발 환경인 [Laravel Sail](/docs/{{version}}/sail)을 사용하여 Swoole 기반 Octane 애플리케이션을 개발할 수 있습니다. Laravel Sail에는 기본적으로 Swoole 확장 기능이 포함되어 있습니다. 그러나 Sail에서 사용하는 `docker-compose.yml` 파일은 여전히 조정해야 합니다.

시작하려면, 애플리케이션의 `docker-compose.yml` 파일에서 `laravel.test` 서비스 정의에 `SUPERVISOR_PHP_COMMAND` 환경 변수를 추가합니다. 이 환경 변수는 Sail이 PHP 개발 서버 대신 Octane을 사용하여 애플리케이션을 서비스하는 데 사용할 명령어를 포함합니다.

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port=80" # [tl! add]
```

마지막으로, Sail 이미지를 빌드합니다.

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Swoole 설정

Swoole은 필요한 경우 `octane` 설정 파일에 추가할 수 있는 몇 가지 추가 설정 옵션을 지원합니다. 이러한 옵션은 거의 수정할 필요가 없기 때문에 기본 설정 파일에는 포함되어 있지 않습니다.

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
],
```

<a name="serving-your-application"></a>
## 애플리케이션 서비스하기

Octane 서버는 `octane:start` Artisan 명령어를 통해 시작할 수 있습니다. 기본적으로 이 명령어는 애플리케이션의 `octane` 설정 파일의 `server` 설정 옵션에 지정된 서버를 사용합니다.

```shell
php artisan octane:start
```

기본적으로 Octane은 포트 8000에서 서버를 시작하므로, 웹 브라우저에서 `http://localhost:8000`을 통해 애플리케이션에 접근할 수 있습니다.

<a name="serving-your-application-via-https"></a>
### HTTPS로 애플리케이션 서비스하기

기본적으로 Octane을 통해 실행되는 애플리케이션은 `http://`로 시작하는 링크를 생성합니다. 애플리케이션의 `config/octane.php` 설정 파일에서 사용되는 `OCTANE_HTTPS` 환경 변수는 HTTPS를 통해 애플리케이션을 서비스할 때 `true`로 설정할 수 있습니다. 이 설정 값이 `true`로 설정되면, Octane은 Laravel이 생성하는 모든 링크에 `https://` 접두사를 붙이도록 지시합니다.

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### Nginx를 통해 애플리케이션 서비스하기

> [!NOTE]  
> 자체 서버 설정을 관리할 준비가 되지 않았거나 강력한 Laravel Octane 애플리케이션을 실행하는 데 필요한 모든 다양한 서비스를 설정하는 것이 익숙하지 않다면, [Laravel Forge](https://forge.laravel.com)를 확인해 보세요.

프로덕션 환경에서는 Nginx나 Apache와 같은 전통적인 웹 서버 뒤에서 Octane 애플리케이션을 서비스해야 합니다. 이렇게 하면 웹 서버가 이미지와 스타일시트 같은 정적 자산을 서비스하고 SSL 인증서 종료를 관리할 수 있습니다.

아래의 Nginx 설정 예제에서, Nginx는 사이트의 정적 자산을 서비스하고 포트 8000에서 실행 중인 Octane 서버로 요청을 프록시합니다.

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name domain.com;
    server_tokens off;
    root /home/forge/domain.com/public;

    index index.php;

    charset utf-8;

    location /index.php {
        try_files /not_exists @octane;
    }

    location / {
        try_files $uri $uri/ @octane;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;
    error_log  /var/log/nginx/domain.com-error.log error;

    error_page 404 /index.php;

    location @octane {
        set $suffix "";

        if ($uri = /index.php) {
            set $suffix ?$query_string;
        }

        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_pass http://127.0.0.1:8000$suffix;
    }
}
```

<a name="watching-for-file-changes"></a>
### 파일 변경 감시하기

애플리케이션은 Octane 서버가 시작될 때 한 번 메모리에 로드되므로, 브라우저를 새로 고침해도 애플리케이션 파일의 변경 사항이 반영되지 않습니다. 예를 들어, `routes/web.php` 파일에 추가된 라우트 정의는 서버가 재시작될 때까지 반영되지 않습니다. 편의를 위해 `--watch` 플래그를 사용하여 애플리케이션 내의 파일 변경 시 Octane이 자동으로 서버를 재시작하도록 지시할 수 있습니다.

```shell
php artisan octane:start --watch
```

이 기능을 사용하기 전에 로컬 개발 환경에 [Node](https://nodejs.org)가 설치되어 있는지 확인해야 합니다. 또한 프로젝트 내에 [Chokidar](https://github.com/paulmillr/chokidar) 파일 감시 라이브러리를 설치해야 합니다.

```shell
npm install --save-dev chokidar
```

애플리케이션의 `config/octane.php` 설정 파일 내의 `watch` 설정 옵션을 사용하여 감시해야 할 디렉토리와 파일을 설정할 수 있습니다.

<a name="specifying-the-worker-count"></a>
### 워커 수 지정하기

기본적으로 Octane은 머신이 제공하는 각 CPU 코어에 대해 애플리케이션 요청 워커를 시작합니다. 이 워커들은 애플리케이션에 들어오는 HTTP 요청을 처리하는 데 사용됩니다. `octane:start` 명령어를 호출할 때 `--workers` 옵션을 사용하여 시작할 워커 수를 수동으로 지정할 수 있습니다.

```shell
php artisan octane:start --workers=4
```

Swoole 애플리케이션 서버를 사용하는 경우, 시작할 ["태스크 워커"](#concurrent-tasks) 수도 지정할 수 있습니다.

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>
### 최대 요청 수 지정하기

불필요한 메모리 누수를 방지하기 위해 Octane은 500개의 요청을 처리한 후 워커를 정상적으로 재시작합니다. 이 숫자를 조정하려면 `--max-requests` 옵션을 사용할 수 있습니다.

```shell
php artisan octane:start --max-requests=250
```

<a name="reloading-the-workers"></a>
### 워커 다시 로드하기

`octane:reload` 명령어를 사용하여 Octane 서버의 애플리케이션 워커를 정상적으로 재시작할 수 있습니다. 일반적으로 이 작업은 배포 후에 수행하여 새로 배포된 코드가 메모리에 로드되고 이후 요청을 처리하는 데 사용됩니다.

```shell
php artisan octane:reload
```

<a name="stopping-the-server"></a>
### 서버 중지하기

`octane:stop` Artisan 명령어를 사용하여 Octane 서버를 중지할 수 있습니다.

```shell
php artisan octane:stop
```

<a name="checking-the-server-status"></a>
#### 서버 상태 확인하기

`octane:status` Artisan 명령어를 사용하여 Octane 서버의 현재 상태를 확인할 수 있습니다.

```shell
php artisan octane:status
```

<a name="dependency-injection-and-octane"></a>
## 의존성 주입(Dependency Injection)과 Octane

Octane은 애플리케이션을 한 번 부팅하고 요청을 처리하는 동안 메모리에 유지하므로, 애플리케이션을 빌드할 때 고려해야 할 몇 가지 주의 사항이 있습니다. 예를 들어, 애플리케이션의 서비스 프로바이더의 `register` 및 `boot` 메서드는 요청 워커가 처음 부팅될 때 한 번만 실행됩니다. 이후 요청에서는 동일한 애플리케이션 인스턴스가 재사용됩니다.

이를 고려하여, 애플리케이션 서비스 컨테이너(Service Container)나 요청(Request)을 객체의 생성자에 주입할 때 특별히 주의해야 합니다. 그렇게 하면 해당 객체가 이후 요청에서 오래된 버전의 컨테이너나 요청을 가지고 있을 수 있습니다.

Octane은 요청 간에 모든 퍼스트 파티 프레임워크 상태를 자동으로 재설정합니다. 그러나 Octane은 애플리케이션에서 생성된 전역 상태를 항상 재설정하는 방법을 알지 못합니다. 따라서 Octane 친화적인 방식으로 애플리케이션을 빌드하는 방법을 알고 있어야 합니다. 아래에서는 Octane을 사용할 때 문제를 일으킬 수 있는 가장 일반적인 상황에 대해 설명합니다.

<a name="container-injection"></a>
### 컨테이너 주입

일반적으로, 애플리케이션 서비스 컨테이너(Service Container)나 HTTP 요청(Request) 인스턴스를 다른 객체의 생성자에 주입하는 것을 피해야 합니다. 예를 들어, 다음 바인딩은 싱글톤으로 바인딩된 객체에 전체 애플리케이션 서비스 컨테이너를 주입합니다.

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app);
    });
}
```

이 예제에서, 애플리케이션 부팅 과정 중에 `Service` 인스턴스가 해결되면, 컨테이너가 서비스에 주입되고 해당 컨테이너는 이후 요청에서도 `Service` 인스턴스에 의해 유지됩니다. 이것은 특정 애플리케이션에서는 문제가 되지 **않을 수도** 있지만, 부팅 주기 후반이나 이후 요청에 의해 추가된 바인딩이 컨테이너에서 예상치 못하게 누락될 수 있습니다.

해결 방법으로, 바인딩을 싱글톤으로 등록하지 않거나, 항상 현재 컨테이너 인스턴스를 해결하는 컨테이너 리졸버 클로저를 서비스에 주입할 수 있습니다.

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app);
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance());
});
```

전역 `app` 헬퍼와 `Container::getInstance()` 메서드는 항상 최신 버전의 애플리케이션 컨테이너를 반환합니다.

<a name="request-injection"></a>
### 요청 주입

일반적으로, 애플리케이션 서비스 컨테이너(Service Container)나 HTTP 요청(Request) 인스턴스를 다른 객체의 생성자에 주입하는 것을 피해야 합니다. 예를 들어, 다음 바인딩은 싱글톤으로 바인딩된 객체에 전체 요청 인스턴스를 주입합니다.

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app['request']);
    });
}
```

이 예제에서, 애플리케이션 부팅 과정 중에 `Service` 인스턴스가 해결되면, HTTP 요청이 서비스에 주입되고 해당 요청은 이후 요청에서도 `Service` 인스턴스에 의해 유지됩니다. 따라서 모든 헤더, 입력, 쿼리 문자열 데이터 및 기타 모든 요청 데이터가 올바르지 않게 됩니다.

해결 방법으로, 바인딩을 싱글톤으로 등록하지 않거나, 항상 현재 요청 인스턴스를 해결하는 요청 리졸버 클로저를 서비스에 주입할 수 있습니다. 또는 가장 권장되는 방법은 런타임에 객체의 메서드 중 하나에 객체가 필요로 하는 특정 요청 정보를 전달하는 것입니다.

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app['request']);
});

$this->app->singleton(Service::class, function (Application $app) {
    return new Service(fn () => $app['request']);
});

// 또는...

$service->method($request->input('name'));
```

전역 `request` 헬퍼는 항상 애플리케이션이 현재 처리 중인 요청을 반환하므로 애플리케이션 내에서 안전하게 사용할 수 있습니다.

> [!WARNING]  
> 컨트롤러 메서드와 라우트 클로저에서 `Illuminate\Http\Request` 인스턴스를 타입 힌트하는 것은 허용됩니다.

<a name="configuration-repository-injection"></a>
### 설정 저장소 주입

일반적으로, 설정 저장소(Configuration Repository) 인스턴스를 다른 객체의 생성자에 주입하는 것을 피해야 합니다. 예를 들어, 다음 바인딩은 싱글톤으로 바인딩된 객체에 설정 저장소를 주입합니다.

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app->make('config'));
    });
}
```

이 예제에서, 요청 간에 설정 값이 변경되면, 해당 서비스는 원래 저장소 인스턴스에 의존하고 있기 때문에 새로운 값에 접근할 수 없습니다.

해결 방법으로, 바인딩을 싱글톤으로 등록하지 않거나, 클래스에 설정 저장소 리졸버 클로저를 주입할 수 있습니다.

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app->make('config'));
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance()->make('config'));
});
```

전역 `config`는 항상 최신 버전의 설정 저장소를 반환하므로 애플리케이션 내에서 안전하게 사용할 수 있습니다.

<a name="managing-memory-leaks"></a>
### 메모리 누수 관리

Octane은 요청 간에 애플리케이션을 메모리에 유지한다는 점을 기억하세요. 따라서 정적으로 유지되는 배열에 데이터를 추가하면 메모리 누수가 발생합니다. 예를 들어, 다음 컨트롤러는 애플리케이션에 대한 각 요청이 정적 `$data` 배열에 계속 데이터를 추가하므로 메모리 누수가 있습니다.

```php
use App\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * 들어오는 요청을 처리합니다.
 */
public function index(Request $request): array
{
    Service::$data[] = Str::random(10);

    return [
        // ...
    ];
}
```

애플리케이션을 빌드할 때 이러한 종류의 메모리 누수를 만들지 않도록 특별히 주의해야 합니다. 로컬 개발 중에 애플리케이션의 메모리 사용량을 모니터링하여 애플리케이션에 새로운 메모리 누수가 도입되지 않도록 하는 것이 좋습니다.

<a name="concurrent-tasks"></a>
## 동시 작업(Concurrent Tasks)

> [!WARNING]  
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때, 경량 백그라운드 태스크를 통해 작업을 동시에 실행할 수 있습니다. Octane의 `concurrently` 메서드를 사용하여 이를 수행할 수 있습니다. 이 메서드를 PHP 배열 구조 분해와 결합하여 각 작업의 결과를 가져올 수 있습니다.

```php
use App\Models\User;
use App\Models\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

Octane에 의해 처리되는 동시 작업은 Swoole의 "태스크 워커"를 활용하며, 들어오는 요청과는 완전히 다른 프로세스 내에서 실행됩니다. 동시 작업을 처리하는 데 사용할 수 있는 워커의 수는 `octane:start` 명령어의 `--task-workers` 지시어에 의해 결정됩니다.

```shell
php artisan octane:start --workers=4 --task-workers=6
```

`concurrently` 메서드를 호출할 때, Swoole의 태스크 시스템 제한으로 인해 1024개 이상의 태스크를 제공하면 안 됩니다.

<a name="ticks-and-intervals"></a>
## 틱과 인터벌(Ticks and Intervals)

> [!WARNING]  
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때, 지정된 초 단위로 실행될 "틱" 작업을 등록할 수 있습니다. `tick` 메서드를 통해 "틱" 콜백을 등록할 수 있습니다. `tick` 메서드에 제공되는 첫 번째 인자는 티커의 이름을 나타내는 문자열이어야 합니다. 두 번째 인자는 지정된 간격으로 호출될 콜러블이어야 합니다.

이 예제에서는 10초마다 호출될 클로저를 등록합니다. 일반적으로 `tick` 메서드는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드 내에서 호출해야 합니다.

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10);
```

`immediate` 메서드를 사용하면, Octane 서버가 처음 부팅될 때 틱 콜백을 즉시 호출하고, 이후 N초마다 호출하도록 Octane에 지시할 수 있습니다.

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10)
        ->immediate();
```

<a name="the-octane-cache"></a>
## Octane 캐시

> [!WARNING]  
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때, 초당 최대 200만 회의 읽기 및 쓰기 속도를 제공하는 Octane 캐시 드라이버를 활용할 수 있습니다. 따라서 이 캐시 드라이버는 캐싱 레이어에서 극단적인 읽기/쓰기 속도가 필요한 애플리케이션에 탁월한 선택입니다.

이 캐시 드라이버는 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)에 의해 구동됩니다. 캐시에 저장된 모든 데이터는 서버의 모든 워커에서 사용할 수 있습니다. 그러나 서버가 재시작되면 캐시된 데이터는 플러시됩니다.

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> [!NOTE]  
> Octane 캐시에 허용되는 최대 항목 수는 애플리케이션의 `octane` 설정 파일에서 정의할 수 있습니다.

<a name="cache-intervals"></a>
### 캐시 인터벌

Laravel의 캐시 시스템에서 제공하는 일반적인 메서드 외에도, Octane 캐시 드라이버는 인터벌 기반 캐시를 제공합니다. 이러한 캐시는 지정된 간격으로 자동으로 새로 고침되며, 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드 내에서 등록해야 합니다. 예를 들어, 다음 캐시는 5초마다 새로 고침됩니다.

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5);
```

<a name="tables"></a>
## 테이블(Tables)

> [!WARNING]  
> 이 기능은 [Swoole](#swoole)이 필요합니다.

Swoole을 사용할 때, 자체적인 임의의 [Swoole 테이블](https://www.swoole.co.uk/docs/modules/swoole-table)을 정의하고 상호 작용할 수 있습니다. Swoole 테이블은 극도의 성능 처리량을 제공하며, 이 테이블의 데이터는 서버의 모든 워커에서 접근할 수 있습니다. 그러나 서버가 재시작되면 그 안의 데이터는 손실됩니다.

테이블은 애플리케이션의 `octane` 설정 파일 내 `tables` 설정 배열에서 정의해야 합니다. 최대 1000개의 행을 허용하는 예제 테이블이 이미 설정되어 있습니다. 문자열 열의 최대 크기는 아래와 같이 열 유형 뒤에 열 크기를 지정하여 설정할 수 있습니다.

```php
'tables' => [
    'example:1000' => [
        'name' => 'string:1000',
        'votes' => 'int',
    ],
],
```

테이블에 접근하려면 `Octane::table` 메서드를 사용할 수 있습니다.

```php
use Laravel\Octane\Facades\Octane;

Octane::table('example')->set('uuid', [
    'name' => 'Nuno Maduro',
    'votes' => 1000,
]);

return Octane::table('example')->get('uuid');
```

> [!WARNING]  
> Swoole 테이블에서 지원하는 열 유형은 `string`, `int`, `float`입니다.

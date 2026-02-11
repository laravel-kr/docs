# Laravel Reverb

- [소개](#introduction)
- [설치](#installation)
- [설정](#configuration)
    - [애플리케이션 자격 증명](#application-credentials)
    - [허용된 출처](#allowed-origins)
    - [추가 애플리케이션](#additional-applications)
    - [SSL](#ssl)
- [서버 실행](#running-server)
    - [디버깅](#debugging)
    - [재시작](#restarting)
- [프로덕션에서 Reverb 실행](#production)
    - [열린 파일](#open-files)
    - [이벤트 루프](#event-loop)
    - [웹 서버](#web-server)
    - [포트](#ports)
    - [프로세스 관리](#process-management)
    - [스케일링](#scaling)
<a name="introduction"></a>
## 소개

[Laravel Reverb](https://github.com/laravel/reverb)는 매우 빠르고 확장 가능한 실시간 WebSocket 통신을 Laravel 애플리케이션에 직접 제공하며, Laravel의 기존 기존의 이벤트 브로드캐스팅 도구 모음와 원활하게 통합됩니다.

<a name="installation"></a>
## 설치

`install:broadcasting` Artisan 명령어를 사용하여 Reverb를 설치할 수 있습니다.

```
php artisan install:broadcasting
```

<a name="configuration"></a>
## 설정

내부적으로 `install:broadcasting` Artisan 명령어는 `reverb:install` 명령어를 실행하며, 이는 합리적인 기본 설정 옵션을 사용하여 Reverb를 자동으로 구성합니다. 설정을 변경하고 싶다면 Reverb의 환경 변수를 업데이트하거나 `config/reverb.php` 설정 파일을 수정하여 변경할 수 있습니다.

<a name="application-credentials"></a>
### 애플리케이션 자격 증명

Reverb에 연결을 설정하려면 클라이언트와 서버 간에 Reverb "애플리케이션" 자격 증명을 교환해야 합니다. 이러한 자격 증명은 서버에서 설정되며 클라이언트의 요청을 검증하는 데 사용됩니다. 다음 환경 변수를 사용하여 이러한 자격 증명을 정의할 수 있습니다.

```ini
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
```

<a name="allowed-origins"></a>
### 허용된 출처

`config/reverb.php` 설정 파일의 `apps` 섹션 내 `allowed_origins` 설정 값을 업데이트하여 클라이언트 요청이 허용되는 출처를 정의할 수도 있습니다. 허용된 출처 목록에 없는 출처에서 오는 요청은 거부됩니다. `*`를 사용하여 모든 출처를 허용할 수 있습니다.

```php
'apps' => [
    [
        'id' => 'my-app-id',
        'allowed_origins' => ['laravel.com'],
        // ...
    ]
]
```

<a name="additional-applications"></a>
### 추가 애플리케이션

일반적으로 Reverb는 설치된 애플리케이션에 대한 WebSocket 서버를 제공합니다. 그러나 단일 Reverb 설치로 둘 이상의 애플리케이션을 제공하는 것도 가능합니다.

예를 들어, Reverb를 통해 여러 애플리케이션에 WebSocket 연결을 제공하는 단일 Laravel 애플리케이션을 유지하고 싶을 수 있습니다. 이는 애플리케이션의 `config/reverb.php` 설정 파일에서 여러 `apps`를 정의하여 달성할 수 있습니다.

```php
'apps' => [
    [
        'app_id' => 'my-app-one',
        // ...
    ],
    [
        'app_id' => 'my-app-two',
        // ...
    ],
],
```

<a name="ssl"></a>
### SSL

대부분의 경우, 보안 WebSocket 연결은 요청이 Reverb 서버로 프록시되기 전에 업스트림 웹 서버(Nginx 등)에서 처리됩니다.

그러나 로컬 개발 중과 같은 경우에는 Reverb 서버가 직접 보안 연결을 처리하는 것이 유용할 수 있습니다. [Laravel Herd](https://herd.laravel.com)의 보안 사이트 기능을 사용하거나 [Laravel Valet](/docs/{{version}}/valet)를 사용하고 애플리케이션에 대해 [secure 명령어](/docs/{{version}}/valet#securing-sites)를 실행한 경우, 사이트용으로 생성된 Herd / Valet 인증서를 사용하여 Reverb 연결을 보호할 수 있습니다. 이를 위해 `REVERB_HOST` 환경 변수를 사이트의 호스트명으로 설정하거나 Reverb 서버를 시작할 때 hostname 옵션을 명시적으로 전달하세요.

```sh
php artisan reverb:start --host="0.0.0.0" --port=8080 --hostname="laravel.test"
```

Herd와 Valet 도메인은 `localhost`로 확인되므로, 위 명령어를 실행하면 Reverb 서버가 `wss://laravel.test:8080`에서 보안 WebSocket 프로토콜(`wss`)을 통해 접근 가능해집니다.

애플리케이션의 `config/reverb.php` 설정 파일에서 `tls` 옵션을 정의하여 인증서를 수동으로 선택할 수도 있습니다. `tls` 옵션 배열 내에서 [PHP의 SSL 컨텍스트 옵션](https://www.php.net/manual/en/context.ssl.php)이 지원하는 모든 옵션을 제공할 수 있습니다.

```php
'options' => [
    'tls' => [
        'local_cert' => '/path/to/cert.pem'
    ],
],
```

<a name="running-server"></a>
## 서버 실행

Reverb 서버는 `reverb:start` Artisan 명령어를 사용하여 시작할 수 있습니다.

```sh
php artisan reverb:start
```

기본적으로 Reverb 서버는 `0.0.0.0:8080`에서 시작되어 모든 네트워크 인터페이스에서 접근 가능합니다.

사용자 정의 호스트 또는 포트를 지정해야 하는 경우, 서버를 시작할 때 `--host` 및 `--port` 옵션을 사용하여 지정할 수 있습니다.

```sh
php artisan reverb:start --host=127.0.0.1 --port=9000
```

또는 애플리케이션의 `.env` 설정 파일에서 `REVERB_SERVER_HOST` 및 `REVERB_SERVER_PORT` 환경 변수를 정의할 수 있습니다.

`REVERB_SERVER_HOST` 및 `REVERB_SERVER_PORT` 환경 변수를 `REVERB_HOST` 및 `REVERB_PORT`와 혼동해서는 안 됩니다. 전자는 Reverb 서버 자체를 실행할 호스트와 포트를 지정하고, 후자는 Laravel에 브로드캐스트 메시지를 보낼 위치를 알려줍니다. 예를 들어, 프로덕션 환경에서 공개 Reverb 호스트명의 포트 `443`에서 `0.0.0.0:8080`에서 작동하는 Reverb 서버로 요청을 라우팅할 수 있습니다. 이 시나리오에서 환경 변수는 다음과 같이 정의됩니다.

```ini
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

REVERB_HOST=ws.laravel.com
REVERB_PORT=443
```

<a name="debugging"></a>
### 디버깅

성능 향상을 위해 Reverb는 기본적으로 디버그 정보를 출력하지 않습니다. Reverb 서버를 통과하는 데이터 스트림을 보려면 `reverb:start` 명령어에 `--debug` 옵션을 제공하세요.

```sh
php artisan reverb:start --debug
```

<a name="restarting"></a>
### 재시작

Reverb는 장시간 실행되는 프로세스이므로 `reverb:restart` Artisan 명령어를 통해 서버를 재시작하지 않으면 코드 변경 사항이 반영되지 않습니다.

`reverb:restart` 명령어는 서버를 중지하기 전에 모든 연결이 정상적으로 종료되도록 합니다. Supervisor와 같은 프로세스 관리자로 Reverb를 실행하는 경우, 모든 연결이 종료된 후 프로세스 관리자가 서버를 자동으로 재시작합니다.

```sh
php artisan reverb:restart
```

<a name="production"></a>
## 프로덕션에서 Reverb 실행

WebSocket 서버의 장시간 실행 특성으로 인해 Reverb 서버가 서버에서 사용 가능한 리소스에 대해 최적의 연결 수를 효과적으로 처리할 수 있도록 서버 및 호스팅 환경에 일부 최적화를 수행해야 할 수 있습니다.

> [!NOTE]  
> 사이트가 [Laravel Forge](https://forge.laravel.com)에 의해 관리되는 경우, "애플리케이션" 패널에서 직접 Reverb에 맞게 서버를 자동으로 최적화할 수 있습니다. Reverb 통합을 활성화하면 Forge가 필요한 확장 프로그램을 설치하고 허용되는 연결 수를 늘리는 등 서버가 프로덕션에 준비되도록 합니다.

<a name="open-files"></a>
### 열린 파일

각 WebSocket 연결은 클라이언트 또는 서버가 연결을 끊을 때까지 메모리에 유지됩니다. Unix 및 Unix 계열 환경에서 각 연결은 파일로 표현됩니다. 그러나 운영 체제와 애플리케이션 수준 모두에서 허용되는 열린 파일 수에 제한이 있는 경우가 많습니다.

<a name="operating-system"></a>
#### 운영 체제

Unix 기반 운영 체제에서는 `ulimit` 명령어를 사용하여 허용되는 열린 파일 수를 확인할 수 있습니다.

```sh
ulimit -n
```

이 명령어는 다양한 사용자에 대해 허용되는 열린 파일 제한을 표시합니다. `/etc/security/limits.conf` 파일을 편집하여 이러한 값을 업데이트할 수 있습니다. 예를 들어, `forge` 사용자의 최대 열린 파일 수를 10,000으로 업데이트하면 다음과 같습니다.

```ini
# /etc/security/limits.conf
forge        soft  nofile  10000
forge        hard  nofile  10000
```

<a name="event-loop"></a>
### 이벤트 루프

내부적으로 Reverb는 ReactPHP 이벤트 루프를 사용하여 서버에서 WebSocket 연결을 관리합니다. 기본적으로 이 이벤트 루프는 추가 확장이 필요 없는 `stream_select`로 구동됩니다. 그러나 `stream_select`는 일반적으로 1,024개의 열린 파일로 제한됩니다. 따라서 1,000개 이상의 동시 연결을 처리할 계획이라면 동일한 제한이 없는 대체 이벤트 루프를 사용해야 합니다.

Reverb는 사용 가능한 경우 자동으로 `ext-uv` 기반 루프로 전환합니다. 이 PHP 확장 프로그램은 PECL을 통해 설치할 수 있습니다.

```sh
pecl install uv
```

<a name="web-server"></a>
### 웹 서버

대부분의 경우 Reverb는 서버의 외부에 노출되지 않는 포트에서 실행됩니다. 따라서 Reverb로 트래픽을 라우팅하려면 리버스 프록시를 구성해야 합니다. Reverb가 호스트 `0.0.0.0` 및 포트 `8080`에서 실행되고 서버가 Nginx 웹 서버를 사용한다고 가정하면, 다음 Nginx 사이트 구성을 사용하여 Reverb 서버에 대한 리버스 프록시를 정의할 수 있습니다.

```nginx
server {
    ...

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";

        proxy_pass http://0.0.0.0:8080;
    }

    ...
}
```


일반적으로 웹 서버는 서버 과부하를 방지하기 위해 허용되는 연결 수를 제한하도록 구성됩니다. Nginx 웹 서버에서 허용되는 연결 수를 10,000으로 늘리려면 `nginx.conf` 파일의 `worker_rlimit_nofile` 및 `worker_connections` 값을 업데이트해야 합니다.

```nginx
user forge;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
worker_rlimit_nofile 10000;

events {
  worker_connections 10000;
  multi_accept on;
}
```

위 구성은 프로세스당 최대 10,000개의 Nginx 워커를 생성할 수 있도록 합니다. 또한 이 구성은 Nginx의 열린 파일 제한을 10,000으로 설정합니다.

<a name="ports"></a>
### 포트

Unix 기반 운영 체제는 일반적으로 서버에서 열 수 있는 포트 수를 제한합니다. 다음 명령어를 통해 현재 허용되는 범위를 확인할 수 있습니다.

 ```sh
cat /proc/sys/net/ipv4/ip_local_port_range
# 32768	60999
```

위 출력은 각 연결에 사용 가능한 포트가 필요하므로 서버가 최대 28,231(60,999 - 32,768)개의 연결을 처리할 수 있음을 보여줍니다. 허용되는 연결 수를 늘리기 위해 [수평 확장](#scaling)을 권장하지만, 서버의 `/etc/sysctl.conf` 설정 파일에서 허용되는 포트 범위를 업데이트하여 사용 가능한 열린 포트 수를 늘릴 수 있습니다.

<a name="process-management"></a>
### 프로세스 관리

대부분의 경우 Reverb 서버가 지속적으로 실행되도록 Supervisor와 같은 프로세스 관리자를 사용해야 합니다. Supervisor를 사용하여 Reverb를 실행하는 경우, Supervisor가 Reverb 서버에 대한 연결을 처리하는 데 필요한 파일을 열 수 있도록 서버의 `supervisor.conf` 파일의 `minfds` 설정을 업데이트해야 합니다.

```ini
[supervisord]
...
minfds=10000
```

<a name="scaling"></a>
### 스케일링

단일 서버가 허용하는 것보다 더 많은 연결을 처리해야 하는 경우 Reverb 서버를 수평으로 확장할 수 있습니다. Redis의 발행/구독(publish/subscribe) 기능을 활용하여 Reverb는 여러 서버에서 연결을 관리할 수 있습니다. 애플리케이션의 Reverb 서버 중 하나가 메시지를 수신하면 해당 서버는 Redis를 사용하여 들어오는 메시지를 다른 모든 서버에 게시합니다.

수평 확장을 활성화하려면 애플리케이션의 `.env` 설정 파일에서 `REVERB_SCALING_ENABLED` 환경 변수를 `true`로 설정해야 합니다.

```env
REVERB_SCALING_ENABLED=true
```

다음으로, 모든 Reverb 서버가 통신할 전용 중앙 Redis 서버가 있어야 합니다. Reverb는 [애플리케이션에 구성된 기본 Redis 연결](/docs/{{version}}/redis#configuration)을 사용하여 모든 Reverb 서버에 메시지를 게시합니다.

Reverb의 스케일링 옵션을 활성화하고 Redis 서버를 구성한 후에는 Redis 서버와 통신할 수 있는 여러 서버에서 `reverb:start` 명령어를 호출하기만 하면 됩니다. 이러한 Reverb 서버는 서버 간에 들어오는 요청을 균등하게 분산하는 로드 밸런서 뒤에 배치되어야 합니다.

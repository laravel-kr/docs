# 라라벨 Valet

- [소개](#introduction)
- [설치](#installation)
    - [Valet 업그레이드](#upgrading-valet)
- [사이트 서빙](#serving-sites)
    - ["Park" 명령어](#the-park-command)
    - ["Link" 명령어](#the-link-command)
    - [TLS로 사이트 보안 설정](#securing-sites)
    - [기본 사이트 서빙](#serving-a-default-site)
    - [사이트별 PHP 버전](#per-site-php-versions)
- [사이트 공유](#sharing-sites)
    - [로컬 네트워크에서 사이트 공유](#sharing-sites-on-your-local-network)
- [사이트별 환경 변수](#site-specific-environment-variables)
- [서비스 프록시](#proxying-services)
- [커스텀 Valet 드라이버](#custom-valet-drivers)
    - [로컬 드라이버](#local-drivers)
- [기타 Valet 명령어](#other-valet-commands)
- [Valet 디렉터리와 파일](#valet-directories-and-files)
    - [디스크 접근](#disk-access)

<a name="introduction"></a>
## 소개

> [!NOTE]
> macOS나 Windows에서 라라벨 애플리케이션을 더 쉽게 개발할 수 있는 방법을 찾고 계신가요? [Laravel Herd](https://herd.laravel.com)를 확인해 보세요. Herd에는 Valet, PHP, Composer 등 라라벨 개발을 시작하는 데 필요한 모든 것이 포함되어 있습니다.

[Laravel Valet](https://github.com/laravel/valet)은 미니멀리스트를 위한 macOS 개발 환경입니다. 라라벨 Valet은 여러분의 Mac이 시작될 때 항상 백그라운드에서 [Nginx](https://www.nginx.com/)를 실행하도록 설정합니다. 그런 다음 [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq)를 사용하여 Valet은 `*.test` 도메인의 모든 요청을 로컬 머신에 설치된 사이트로 프록시합니다.

다시 말해, Valet은 약 7MB의 RAM만 사용하는 매우 빠른 라라벨 개발 환경입니다. Valet은 [Sail](/docs/{{version}}/sail)이나 [Homestead](/docs/{{version}}/homestead)를 완전히 대체하는 것은 아니지만, 유연한 기본 기능을 원하거나, 극도로 빠른 속도를 선호하거나, RAM이 제한된 머신에서 작업하는 경우 훌륭한 대안이 됩니다.

기본적으로 Valet은 다음을 포함하여 다양한 프레임워크와 CMS를 지원합니다:

<style>
    #valet-support > ul {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        line-height: 1.9;
    }
</style>

<div id="valet-support" markdown="1">

- [Laravel](https://laravel.com)
- [Bedrock](https://roots.io/bedrock/)
- [CakePHP 3](https://cakephp.org)
- [ConcreteCMS](https://www.concretecms.com/)
- [Contao](https://contao.org/en/)
- [Craft](https://craftcms.com)
- [Drupal](https://www.drupal.org/)
- [ExpressionEngine](https://www.expressionengine.com/)
- [Jigsaw](https://jigsaw.tighten.co)
- [Joomla](https://www.joomla.org/)
- [Katana](https://github.com/themsaid/katana)
- [Kirby](https://getkirby.com/)
- [Magento](https://magento.com/)
- [OctoberCMS](https://octobercms.com/)
- [Sculpin](https://sculpin.io/)
- [Slim](https://www.slimframework.com)
- [Statamic](https://statamic.com)
- Static HTML
- [Symfony](https://symfony.com)
- [WordPress](https://wordpress.org)
- [Zend](https://framework.zend.com)

</div>

또한, 자신만의 [커스텀 드라이버](#custom-valet-drivers)로 Valet을 확장할 수 있습니다.

<a name="installation"></a>
## 설치

> [!WARNING]
> Valet은 macOS와 [Homebrew](https://brew.sh/)가 필요합니다. 설치 전에 Apache나 Nginx 같은 다른 프로그램이 로컬 머신의 80번 포트에 바인딩되어 있지 않은지 확인해야 합니다.

시작하려면 먼저 `update` 명령어를 사용하여 Homebrew가 최신 상태인지 확인해야 합니다:

```shell
brew update
```

다음으로, Homebrew를 사용하여 PHP를 설치해야 합니다:

```shell
brew install php
```

PHP를 설치한 후에는 [Composer 패키지 매니저](https://getcomposer.org)를 설치할 준비가 되었습니다. 또한, `$HOME/.composer/vendor/bin` 디렉터리가 시스템의 "PATH"에 있는지 확인해야 합니다. Composer가 설치되면 Laravel Valet을 전역 Composer 패키지로 설치할 수 있습니다:

```shell
composer global require laravel/valet
```

마지막으로 Valet의 `install` 명령어를 실행할 수 있습니다. 이 명령어는 Valet과 DnsMasq를 설정하고 설치합니다. 또한, Valet이 의존하는 데몬들이 시스템 시작 시 실행되도록 설정됩니다:

```shell
valet install
```

Valet이 설치되면 `ping foobar.test`와 같은 명령어를 사용하여 터미널에서 아무 `*.test` 도메인에 핑을 보내보세요. Valet이 올바르게 설치되었다면 이 도메인이 `127.0.0.1`에서 응답하는 것을 확인할 수 있습니다.

Valet은 머신이 부팅될 때마다 필요한 서비스를 자동으로 시작합니다.

<a name="php-versions"></a>
#### PHP 버전

> [!NOTE]
> 전역 PHP 버전을 수정하는 대신, `isolate` [명령어](#per-site-php-versions)를 통해 Valet이 사이트별 PHP 버전을 사용하도록 지시할 수 있습니다.

Valet은 `valet use php@version` 명령어를 사용하여 PHP 버전을 전환할 수 있습니다. Valet은 지정된 PHP 버전이 아직 설치되지 않은 경우 Homebrew를 통해 설치합니다:

```shell
valet use php@8.2

valet use php
```

프로젝트 루트에 `.valetrc` 파일을 생성할 수도 있습니다. `.valetrc` 파일에는 사이트가 사용해야 하는 PHP 버전이 포함되어야 합니다:

```shell
php=php@8.2
```

이 파일이 생성되면 `valet use` 명령어를 실행하기만 하면 됩니다. 명령어는 파일을 읽어 사이트가 선호하는 PHP 버전을 결정합니다.

> [!WARNING]
> Valet은 여러 PHP 버전이 설치되어 있더라도 한 번에 하나의 PHP 버전만 서빙합니다.

<a name="database"></a>
#### 데이터베이스

애플리케이션에 데이터베이스가 필요한 경우 [DBngin](https://dbngin.com)을 확인해 보세요. MySQL, PostgreSQL, Redis를 포함하는 무료 올인원 데이터베이스 관리 도구를 제공합니다. DBngin이 설치되면 `root` 사용자 이름과 빈 문자열을 비밀번호로 사용하여 `127.0.0.1`에서 데이터베이스에 연결할 수 있습니다.

<a name="resetting-your-installation"></a>
#### 설치 초기화

Valet 설치가 제대로 실행되지 않는 문제가 있는 경우, `composer global require laravel/valet` 명령어를 실행한 후 `valet install`을 실행하면 설치가 초기화되고 다양한 문제를 해결할 수 있습니다. 드문 경우지만 `valet uninstall --force`를 실행한 후 `valet install`을 실행하여 Valet을 "하드 리셋"해야 할 수도 있습니다.

<a name="upgrading-valet"></a>
### Valet 업그레이드

터미널에서 `composer global require laravel/valet` 명령어를 실행하여 Valet 설치를 업데이트할 수 있습니다. 업그레이드 후에는 `valet install` 명령어를 실행하여 Valet이 필요한 경우 설정 파일에 추가적인 업그레이드를 수행할 수 있도록 하는 것이 좋습니다.

<a name="upgrading-to-valet-4"></a>
#### Valet 4로 업그레이드

Valet 3에서 Valet 4로 업그레이드하는 경우, 다음 단계에 따라 Valet 설치를 올바르게 업그레이드하세요:

<div class="content-list" markdown="1">

- 사이트의 PHP 버전을 커스터마이징하기 위해 `.valetphprc` 파일을 추가한 경우, 각 `.valetphprc` 파일의 이름을 `.valetrc`로 변경하세요. 그런 다음 `.valetrc` 파일의 기존 내용 앞에 `php=`를 추가하세요.
- 새로운 드라이버 시스템의 네임스페이스, 확장자, 타입 힌트, 반환 타입 힌트에 맞게 커스텀 드라이버를 업데이트하세요. Valet의 [SampleValetDriver](https://github.com/laravel/valet/blob/d7787c025e60abc24a5195dc7d4c5c6f2d984339/cli/stubs/SampleValetDriver.php)를 예제로 참고할 수 있습니다.
- PHP 7.1 - 7.4를 사용하여 사이트를 서빙하는 경우에도, Valet이 일부 스크립트를 실행하는 데 사용할 8.0 이상 버전의 PHP를 Homebrew를 통해 설치해야 합니다. 이 버전이 기본으로 연결된 버전이 아니더라도 말입니다.

</div>

<a name="serving-sites"></a>
## 사이트 서빙

Valet이 설치되면 라라벨 애플리케이션 서빙을 시작할 준비가 되었습니다. Valet은 애플리케이션 서빙을 돕는 두 가지 명령어를 제공합니다: `park`와 `link`.

<a name="the-park-command"></a>
### `park` 명령어

`park` 명령어는 애플리케이션이 포함된 머신의 디렉터리를 등록합니다. 디렉터리가 Valet에 "파킹"되면 해당 디렉터리 내의 모든 디렉터리는 웹 브라우저에서 `http://<directory-name>.test`로 접근할 수 있습니다:

```shell
cd ~/Sites

valet park
```

이것이 전부입니다. 이제 "파킹"된 디렉터리 내에 생성하는 모든 애플리케이션은 `http://<directory-name>.test` 규칙을 사용하여 자동으로 서빙됩니다. 따라서 파킹된 디렉터리에 "laravel"이라는 디렉터리가 포함되어 있다면, 해당 디렉터리 내의 애플리케이션은 `http://laravel.test`에서 접근할 수 있습니다. 또한, Valet은 와일드카드 서브도메인을 사용하여 사이트에 접근할 수 있도록 자동으로 허용합니다(`http://foo.laravel.test`).

<a name="the-link-command"></a>
### `link` 명령어

`link` 명령어도 라라벨 애플리케이션을 서빙하는 데 사용할 수 있습니다. 이 명령어는 전체 디렉터리가 아닌 디렉터리 내의 단일 사이트를 서빙하려는 경우에 유용합니다:

```shell
cd ~/Sites/laravel

valet link
```

`link` 명령어를 사용하여 애플리케이션이 Valet에 연결되면 디렉터리 이름을 사용하여 애플리케이션에 접근할 수 있습니다. 따라서 위 예제에서 연결된 사이트는 `http://laravel.test`에서 접근할 수 있습니다. 또한, Valet은 와일드카드 서브도메인을 사용하여 사이트에 접근할 수 있도록 자동으로 허용합니다(`http://foo.laravel.test`).

다른 호스트 이름으로 애플리케이션을 서빙하려면 `link` 명령어에 호스트 이름을 전달할 수 있습니다. 예를 들어, 다음 명령어를 실행하여 `http://application.test`에서 애플리케이션을 사용할 수 있도록 만들 수 있습니다:

```shell
cd ~/Sites/laravel

valet link application
```

물론, `link` 명령어를 사용하여 서브도메인에서 애플리케이션을 서빙할 수도 있습니다:

```shell
valet link api.application
```

`links` 명령어를 실행하여 연결된 모든 디렉터리 목록을 표시할 수 있습니다:

```shell
valet links
```

`unlink` 명령어를 사용하여 사이트의 심볼릭 링크를 제거할 수 있습니다:

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### TLS로 사이트 보안 설정

기본적으로 Valet은 HTTP를 통해 사이트를 서빙합니다. 그러나 HTTP/2를 사용하여 암호화된 TLS로 사이트를 서빙하려면 `secure` 명령어를 사용할 수 있습니다. 예를 들어, 사이트가 Valet에서 `laravel.test` 도메인으로 서빙되고 있다면 다음 명령어를 실행하여 보안을 설정해야 합니다:

```shell
valet secure laravel
```

사이트의 "보안을 해제"하고 일반 HTTP로 트래픽을 다시 서빙하려면 `unsecure` 명령어를 사용하세요. `secure` 명령어와 마찬가지로 이 명령어도 보안을 해제하려는 호스트 이름을 받습니다:

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### 기본 사이트 서빙

알 수 없는 `test` 도메인을 방문할 때 `404` 대신 "기본" 사이트를 서빙하도록 Valet을 설정하고 싶을 수 있습니다. 이를 위해 기본 사이트로 서빙되어야 하는 사이트의 경로를 포함하는 `default` 옵션을 `~/.config/valet/config.json` 설정 파일에 추가할 수 있습니다:

    "default": "/Users/Sally/Sites/example-site",

<a name="per-site-php-versions"></a>
### 사이트별 PHP 버전

기본적으로 Valet은 전역 PHP 설치를 사용하여 사이트를 서빙합니다. 그러나 다양한 사이트에서 여러 PHP 버전을 지원해야 하는 경우 `isolate` 명령어를 사용하여 특정 사이트가 사용해야 하는 PHP 버전을 지정할 수 있습니다. `isolate` 명령어는 현재 작업 디렉터리에 있는 사이트에 대해 지정된 PHP 버전을 사용하도록 Valet을 설정합니다:

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

사이트 이름이 포함된 디렉터리 이름과 일치하지 않는 경우 `--site` 옵션을 사용하여 사이트 이름을 지정할 수 있습니다:

```shell
valet isolate php@8.0 --site="site-name"
```

편의를 위해 `valet php`, `composer`, `which-php` 명령어를 사용하여 사이트에 설정된 PHP 버전을 기반으로 적절한 PHP CLI나 도구로 호출을 프록시할 수 있습니다:

```shell
valet php
valet composer
valet which-php
```

`isolated` 명령어를 실행하여 모든 격리된 사이트와 해당 PHP 버전 목록을 표시할 수 있습니다:

```shell
valet isolated
```

사이트를 Valet의 전역 설치된 PHP 버전으로 되돌리려면 사이트의 루트 디렉터리에서 `unisolate` 명령어를 호출할 수 있습니다:

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## 사이트 공유

Valet에는 로컬 사이트를 전 세계와 공유하는 명령어가 포함되어 있어 모바일 기기에서 사이트를 테스트하거나 팀원 및 클라이언트와 공유하는 쉬운 방법을 제공합니다.

기본적으로 Valet은 ngrok 또는 Expose를 통해 사이트 공유를 지원합니다. 사이트를 공유하기 전에 `share-tool` 명령어를 사용하여 `ngrok`, `expose` 또는 `cloudflared`를 지정하여 Valet 설정을 업데이트해야 합니다:

```shell
valet share-tool ngrok
```

도구를 선택했는데 Homebrew(ngrok 및 cloudflared의 경우)나 Composer(Expose의 경우)를 통해 설치되지 않은 경우 Valet이 자동으로 설치하라는 메시지를 표시합니다. 물론, 두 도구 모두 사이트 공유를 시작하기 전에 ngrok 또는 Expose 계정을 인증해야 합니다.

사이트를 공유하려면 터미널에서 사이트 디렉터리로 이동하여 Valet의 `share` 명령어를 실행하세요. 공개적으로 접근 가능한 URL이 클립보드에 복사되어 브라우저에 직접 붙여넣거나 팀과 공유할 준비가 됩니다:

```shell
cd ~/Sites/laravel

valet share
```

사이트 공유를 중지하려면 `Control + C`를 누르세요.

> [!WARNING]
> 커스텀 DNS 서버(예: `1.1.1.1`)를 사용하는 경우 ngrok 공유가 올바르게 작동하지 않을 수 있습니다. 이 경우 Mac의 시스템 설정을 열고 네트워크 설정으로 이동하여 고급 설정을 열고 DNS 탭으로 이동하여 첫 번째 DNS 서버로 `127.0.0.1`을 추가하세요.

<a name="sharing-sites-via-ngrok"></a>
#### Ngrok을 통한 사이트 공유

ngrok을 사용하여 사이트를 공유하려면 [ngrok 계정 생성](https://dashboard.ngrok.com/signup)과 [인증 토큰 설정](https://dashboard.ngrok.com/get-started/your-authtoken)이 필요합니다. 인증 토큰이 있으면 해당 토큰으로 Valet 설정을 업데이트할 수 있습니다:

```shell
valet set-ngrok-token YOUR_TOKEN_HERE
```

> [!NOTE]
> `valet share --region=eu`와 같이 추가적인 ngrok 매개변수를 share 명령어에 전달할 수 있습니다. 자세한 내용은 [ngrok 문서](https://ngrok.com/docs)를 참조하세요.

<a name="sharing-sites-via-expose"></a>
#### Expose를 통한 사이트 공유

Expose를 사용하여 사이트를 공유하려면 [Expose 계정 생성](https://expose.dev/register)과 [인증 토큰을 통한 Expose 인증](https://expose.dev/docs/getting-started/getting-your-token)이 필요합니다.

지원하는 추가 명령줄 매개변수에 대한 정보는 [Expose 문서](https://expose.dev/docs)를 참조하세요.

<a name="sharing-sites-on-your-local-network"></a>
### 로컬 네트워크에서 사이트 공유

Valet은 기본적으로 들어오는 트래픽을 내부 `127.0.0.1` 인터페이스로 제한하여 개발 머신이 인터넷으로부터의 보안 위험에 노출되지 않도록 합니다.

로컬 네트워크의 다른 기기가 머신의 IP 주소를 통해 Valet 사이트에 접근할 수 있도록 허용하려면(예: `192.168.1.10/application.test`), 해당 사이트의 적절한 Nginx 설정 파일을 수동으로 편집하여 `listen` 디렉티브의 제한을 제거해야 합니다. 80번과 443번 포트에 대한 `listen` 디렉티브에서 `127.0.0.1:` 접두사를 제거해야 합니다.

프로젝트에서 `valet secure`를 실행하지 않은 경우 `/usr/local/etc/nginx/valet/valet.conf` 파일을 편집하여 모든 비-HTTPS 사이트에 대한 네트워크 접근을 열 수 있습니다. 그러나 HTTPS로 프로젝트 사이트를 서빙하는 경우(사이트에 대해 `valet secure`를 실행한 경우) `~/.config/valet/Nginx/app-name.test` 파일을 편집해야 합니다.

Nginx 설정을 업데이트한 후 `valet restart` 명령어를 실행하여 설정 변경 사항을 적용하세요.

<a name="site-specific-environment-variables"></a>
## 사이트별 환경 변수

다른 프레임워크를 사용하는 일부 애플리케이션은 서버 환경 변수에 의존할 수 있지만 프로젝트 내에서 해당 변수를 설정하는 방법을 제공하지 않습니다. Valet을 사용하면 프로젝트 루트에 `.valet-env.php` 파일을 추가하여 사이트별 환경 변수를 설정할 수 있습니다. 이 파일은 배열에 지정된 각 사이트에 대해 전역 `$_SERVER` 배열에 추가될 사이트/환경 변수 쌍의 배열을 반환해야 합니다:

```php
<?php

return [
    // laravel.test 사이트에 대해 $_SERVER['key']를 "value"로 설정...
    'laravel' => [
        'key' => 'value',
    ],

    // 모든 사이트에 대해 $_SERVER['key']를 "value"로 설정...
    '*' => [
        'key' => 'value',
    ],
];
```

<a name="proxying-services"></a>
## 서비스 프록시

때때로 Valet 도메인을 로컬 머신의 다른 서비스로 프록시하고 싶을 수 있습니다. 예를 들어, Valet을 실행하면서 Docker에서 별도의 사이트를 실행해야 할 수 있습니다. 그러나 Valet과 Docker는 동시에 80번 포트에 바인딩할 수 없습니다.

이를 해결하기 위해 `proxy` 명령어를 사용하여 프록시를 생성할 수 있습니다. 예를 들어, `http://elasticsearch.test`의 모든 트래픽을 `http://127.0.0.1:9200`으로 프록시할 수 있습니다:

```shell
# HTTP를 통한 프록시...
valet proxy elasticsearch http://127.0.0.1:9200

# TLS + HTTP/2를 통한 프록시...
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

`unproxy` 명령어를 사용하여 프록시를 제거할 수 있습니다:

```shell
valet unproxy elasticsearch
```

`proxies` 명령어를 사용하여 프록시된 모든 사이트 설정 목록을 표시할 수 있습니다:

```shell
valet proxies
```

<a name="custom-valet-drivers"></a>
## 커스텀 Valet 드라이버

Valet에서 기본적으로 지원하지 않는 프레임워크나 CMS에서 실행되는 PHP 애플리케이션을 서빙하기 위해 자신만의 Valet "드라이버"를 작성할 수 있습니다. Valet을 설치하면 `SampleValetDriver.php` 파일이 포함된 `~/.config/valet/Drivers` 디렉터리가 생성됩니다. 이 파일에는 커스텀 드라이버를 작성하는 방법을 보여주는 샘플 드라이버 구현이 포함되어 있습니다. 드라이버를 작성하려면 `serves`, `isStaticFile`, `frontControllerPath` 세 가지 메서드만 구현하면 됩니다.

세 메서드 모두 `$sitePath`, `$siteName`, `$uri` 값을 인수로 받습니다. `$sitePath`는 머신에서 서빙되는 사이트의 전체 경로입니다(예: `/Users/Lisa/Sites/my-project`). `$siteName`은 도메인의 "호스트"/"사이트 이름" 부분입니다(`my-project`). `$uri`는 들어오는 요청 URI입니다(`/foo/bar`).

커스텀 Valet 드라이버를 완성한 후 `FrameworkValetDriver.php` 명명 규칙을 사용하여 `~/.config/valet/Drivers` 디렉터리에 배치하세요. 예를 들어, WordPress용 커스텀 valet 드라이버를 작성하는 경우 파일 이름은 `WordPressValetDriver.php`여야 합니다.

커스텀 Valet 드라이버가 구현해야 하는 각 메서드의 샘플 구현을 살펴보겠습니다.

<a name="the-serves-method"></a>
#### `serves` 메서드

`serves` 메서드는 드라이버가 들어오는 요청을 처리해야 하는 경우 `true`를 반환해야 합니다. 그렇지 않으면 메서드는 `false`를 반환해야 합니다. 따라서 이 메서드 내에서 주어진 `$sitePath`가 서빙하려는 유형의 프로젝트를 포함하는지 확인해야 합니다.

예를 들어, `WordPressValetDriver`를 작성한다고 가정해 보겠습니다. `serves` 메서드는 다음과 같을 수 있습니다:

```php
/**
 * 드라이버가 요청을 서빙하는지 결정합니다.
 */
public function serves(string $sitePath, string $siteName, string $uri): bool
{
    return is_dir($sitePath.'/wp-admin');
}
```

<a name="the-isstaticfile-method"></a>
#### `isStaticFile` 메서드

`isStaticFile`은 들어오는 요청이 이미지나 스타일시트 같은 "정적" 파일인지 결정해야 합니다. 파일이 정적이면 메서드는 디스크의 정적 파일에 대한 전체 경로를 반환해야 합니다. 들어오는 요청이 정적 파일이 아니면 메서드는 `false`를 반환해야 합니다:

```php
/**
 * 들어오는 요청이 정적 파일인지 결정합니다.
 *
 * @return string|false
 */
public function isStaticFile(string $sitePath, string $siteName, string $uri)
{
    if (file_exists($staticFilePath = $sitePath.'/public/'.$uri)) {
        return $staticFilePath;
    }

    return false;
}
```

> [!WARNING]
> `isStaticFile` 메서드는 들어오는 요청에 대해 `serves` 메서드가 `true`를 반환하고 요청 URI가 `/`가 아닌 경우에만 호출됩니다.

<a name="the-frontcontrollerpath-method"></a>
#### `frontControllerPath` 메서드

`frontControllerPath` 메서드는 애플리케이션의 "프론트 컨트롤러"(일반적으로 "index.php" 파일 또는 동등한 파일)에 대한 전체 경로를 반환해야 합니다:

```php
/**
 * 애플리케이션의 프론트 컨트롤러에 대한 전체 경로를 가져옵니다.
 */
public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
{
    return $sitePath.'/public/index.php';
}
```

<a name="local-drivers"></a>
### 로컬 드라이버

단일 애플리케이션에 대한 커스텀 Valet 드라이버를 정의하려면 애플리케이션의 루트 디렉터리에 `LocalValetDriver.php` 파일을 생성하세요. 커스텀 드라이버는 기본 `ValetDriver` 클래스를 확장하거나 `LaravelValetDriver`와 같은 기존 애플리케이션별 드라이버를 확장할 수 있습니다:

```php
use Valet\Drivers\LaravelValetDriver;

class LocalValetDriver extends LaravelValetDriver
{
    /**
     * 드라이버가 요청을 서빙하는지 결정합니다.
     */
    public function serves(string $sitePath, string $siteName, string $uri): bool
    {
        return true;
    }

    /**
     * 애플리케이션의 프론트 컨트롤러에 대한 전체 경로를 가져옵니다.
     */
    public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
    {
        return $sitePath.'/public_html/index.php';
    }
}
```

<a name="other-valet-commands"></a>
## 기타 Valet 명령어

<div class="overflow-auto">

| 명령어 | 설명 |
| --- | --- |
| `valet list` | 모든 Valet 명령어 목록을 표시합니다. |
| `valet diagnose` | Valet 디버깅을 돕기 위한 진단 정보를 출력합니다. |
| `valet directory-listing` | 디렉터리 목록 동작을 결정합니다. 기본값은 "off"로, 디렉터리에 대해 404 페이지를 렌더링합니다. |
| `valet forget` | "파킹"된 디렉터리에서 이 명령어를 실행하여 파킹된 디렉터리 목록에서 제거합니다. |
| `valet log` | Valet 서비스가 작성한 로그 목록을 봅니다. |
| `valet paths` | 모든 "파킹"된 경로를 봅니다. |
| `valet restart` | Valet 데몬을 재시작합니다. |
| `valet start` | Valet 데몬을 시작합니다. |
| `valet stop` | Valet 데몬을 중지합니다. |
| `valet trust` | Valet 명령어가 비밀번호 입력 없이 실행되도록 Brew와 Valet에 대한 sudoers 파일을 추가합니다. |
| `valet uninstall` | Valet을 제거합니다: 수동 제거 지침을 표시합니다. `--force` 옵션을 전달하면 Valet의 모든 리소스를 적극적으로 삭제합니다. |

</div>

<a name="valet-directories-and-files"></a>
## Valet 디렉터리와 파일

Valet 환경 문제를 해결하는 동안 다음 디렉터리와 파일 정보가 도움이 될 수 있습니다:

#### `~/.config/valet`

Valet의 모든 설정을 포함합니다. 이 디렉터리의 백업을 유지하는 것이 좋습니다.

#### `~/.config/valet/dnsmasq.d/`

이 디렉터리는 DNSMasq의 설정을 포함합니다.

#### `~/.config/valet/Drivers/`

이 디렉터리는 Valet의 드라이버를 포함합니다. 드라이버는 특정 프레임워크/CMS가 어떻게 서빙되는지 결정합니다.

#### `~/.config/valet/Nginx/`

이 디렉터리는 Valet의 모든 Nginx 사이트 설정을 포함합니다. 이 파일들은 `install`과 `secure` 명령어를 실행할 때 다시 빌드됩니다.

#### `~/.config/valet/Sites/`

이 디렉터리는 [연결된 프로젝트](#the-link-command)에 대한 모든 심볼릭 링크를 포함합니다.

#### `~/.config/valet/config.json`

이 파일은 Valet의 마스터 설정 파일입니다.

#### `~/.config/valet/valet.sock`

이 파일은 Valet의 Nginx 설치에서 사용하는 PHP-FPM 소켓입니다. PHP가 제대로 실행 중인 경우에만 존재합니다.

#### `~/.config/valet/Log/fpm-php.www.log`

이 파일은 PHP 오류에 대한 사용자 로그입니다.

#### `~/.config/valet/Log/nginx-error.log`

이 파일은 Nginx 오류에 대한 사용자 로그입니다.

#### `/usr/local/var/log/php-fpm.log`

이 파일은 PHP-FPM 오류에 대한 시스템 로그입니다.

#### `/usr/local/var/log/nginx`

이 디렉터리는 Nginx 접근 및 오류 로그를 포함합니다.

#### `/usr/local/etc/php/X.X/conf.d`

이 디렉터리는 다양한 PHP 설정에 대한 `*.ini` 파일을 포함합니다.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

이 파일은 PHP-FPM 풀 설정 파일입니다.

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`

이 파일은 사이트에 대한 SSL 인증서를 빌드하는 데 사용되는 기본 Nginx 설정입니다.

<a name="disk-access"></a>
### 디스크 접근

macOS 10.14부터 [일부 파일과 디렉터리에 대한 접근이 기본적으로 제한됩니다](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf). 이러한 제한에는 데스크탑, 문서, 다운로드 디렉터리가 포함됩니다. 또한, 네트워크 볼륨과 이동식 볼륨 접근도 제한됩니다. 따라서 Valet은 사이트 폴더가 이러한 보호된 위치 외부에 있는 것을 권장합니다.

그러나 이러한 위치 중 하나에서 사이트를 서빙하려면 Nginx에 "전체 디스크 접근" 권한을 부여해야 합니다. 그렇지 않으면 특히 정적 자산을 서빙할 때 Nginx에서 서버 오류나 기타 예측할 수 없는 동작이 발생할 수 있습니다. 일반적으로 macOS는 자동으로 Nginx에 이러한 위치에 대한 전체 접근 권한을 부여하라는 메시지를 표시합니다. 또는 `시스템 환경설정` > `보안 및 개인 정보 보호` > `개인 정보 보호`로 이동하여 `전체 디스크 접근`을 선택하여 수동으로 설정할 수 있습니다. 그런 다음 메인 창에서 `nginx` 항목을 활성화하세요.

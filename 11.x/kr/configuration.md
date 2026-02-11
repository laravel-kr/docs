# 설정(Configuration)

- [소개](#introduction)
- [환경 설정](#environment-configuration)
    - [환경 변수 타입](#environment-variable-types)
    - [환경 설정 조회하기](#retrieving-environment-configuration)
    - [현재 환경 확인하기](#determining-the-current-environment)
    - [환경 파일 암호화](#encrypting-environment-files)
- [설정 값에 접근하기](#accessing-configuration-values)
- [설정 캐싱](#configuration-caching)
- [설정 퍼블리싱](#configuration-publishing)
- [디버그 모드](#debug-mode)
- [점검(유지보수) 모드](#maintenance-mode)

<a name="introduction"></a>
## 소개

Laravel 프레임워크의 모든 설정 파일은 `config` 디렉토리에 저장됩니다. 각 옵션은 문서화되어 있으므로, 파일을 살펴보면서 사용 가능한 옵션들을 익히시기 바랍니다.

이 설정 파일들을 통해 데이터베이스 연결 정보, 메일 서버 정보, 그리고 애플리케이션 URL과 암호화 키와 같은 다양한 핵심 설정 값들을 구성할 수 있습니다.

<a name="the-about-command"></a>
#### `about` 명령어

Laravel은 `about` Artisan 명령어를 통해 애플리케이션의 설정, 드라이버, 환경에 대한 개요를 표시할 수 있습니다.

```bash
php artisan about
```

애플리케이션 개요 출력의 특정 섹션만 관심이 있다면, `--only` 옵션을 사용하여 해당 섹션만 필터링할 수 있습니다.

```bash
php artisan about --only=environment
```

또는, 특정 설정 파일의 값을 자세히 살펴보려면 `config:show` Artisan 명령어를 사용할 수 있습니다.

```bash
php artisan config:show database
```

<a name="environment-configuration"></a>
## 환경 설정

애플리케이션이 실행되는 환경에 따라 다른 설정 값을 가지는 것이 유용한 경우가 많습니다. 예를 들어, 로컬에서는 프로덕션 서버와 다른 캐시 드라이버를 사용하고 싶을 수 있습니다.

이를 쉽게 하기 위해 Laravel은 [DotEnv](https://github.com/vlucas/phpdotenv) PHP 라이브러리를 활용합니다. 새로운 Laravel 설치에서, 애플리케이션의 루트 디렉토리에는 많은 공통 환경 변수를 정의하는 `.env.example` 파일이 포함되어 있습니다. Laravel 설치 과정에서 이 파일은 자동으로 `.env`로 복사됩니다.

Laravel의 기본 `.env` 파일에는 애플리케이션이 로컬에서 실행되는지 프로덕션 웹 서버에서 실행되는지에 따라 달라질 수 있는 몇 가지 공통 설정 값이 포함되어 있습니다. 이 값들은 `config` 디렉토리 내의 설정 파일에서 Laravel의 `env` 함수를 사용하여 읽어들입니다.

팀과 함께 개발하는 경우, 애플리케이션과 함께 `.env.example` 파일을 계속 포함하고 업데이트하는 것이 좋습니다. 예제 설정 파일에 플레이스홀더 값을 넣어두면, 팀의 다른 개발자들이 애플리케이션을 실행하는 데 어떤 환경 변수가 필요한지 명확하게 알 수 있습니다.

> [!NOTE]  
> `.env` 파일의 모든 변수는 서버 수준 또는 시스템 수준 환경 변수와 같은 외부 환경 변수로 재정의될 수 있습니다.

<a name="environment-file-security"></a>
#### 환경 파일 보안

`.env` 파일은 애플리케이션의 소스 컨트롤에 커밋되어서는 안 됩니다. 애플리케이션을 사용하는 각 개발자/서버마다 다른 환경 설정이 필요할 수 있기 때문입니다. 또한, 침입자가 소스 컨트롤 저장소에 접근하게 될 경우 민감한 자격 증명이 노출될 수 있으므로 보안상 위험합니다.

그러나 Laravel의 내장 [환경 암호화](#encrypting-environment-files)를 사용하여 환경 파일을 암호화할 수 있습니다. 암호화된 환경 파일은 소스 컨트롤에 안전하게 저장할 수 있습니다.

<a name="additional-environment-files"></a>
#### 추가 환경 파일

애플리케이션의 환경 변수를 로드하기 전에, Laravel은 `APP_ENV` 환경 변수가 외부에서 제공되었는지 또는 `--env` CLI 인자가 지정되었는지 확인합니다. 그런 경우, Laravel은 `.env.[APP_ENV]` 파일이 존재하면 해당 파일을 로드하려고 시도합니다. 존재하지 않으면 기본 `.env` 파일이 로드됩니다.

<a name="environment-variable-types"></a>
### 환경 변수 타입

`.env` 파일의 모든 변수는 일반적으로 문자열로 파싱되므로, `env()` 함수에서 더 다양한 타입을 반환할 수 있도록 몇 가지 예약된 값이 만들어졌습니다.

<div class="overflow-auto">

| `.env` 값 | `env()` 값 |
| ------------ | ------------- |
| true         | (bool) true   |
| (true)       | (bool) true   |
| false        | (bool) false  |
| (false)      | (bool) false  |
| empty        | (string) ''   |
| (empty)      | (string) ''   |
| null         | (null) null   |
| (null)       | (null) null   |

</div>

공백이 포함된 값으로 환경 변수를 정의해야 하는 경우, 값을 큰따옴표로 감싸면 됩니다.

```ini
APP_NAME="My Application"
```

<a name="retrieving-environment-configuration"></a>
### 환경 설정 조회하기

`.env` 파일에 나열된 모든 변수는 애플리케이션이 요청을 받을 때 `$_ENV` PHP 슈퍼 글로벌에 로드됩니다. 그러나 설정 파일에서 이 변수들의 값을 조회하려면 `env` 함수를 사용할 수 있습니다. 실제로 Laravel 설정 파일을 살펴보면, 많은 옵션이 이미 이 함수를 사용하고 있는 것을 확인할 수 있습니다.

```php
'debug' => env('APP_DEBUG', false),
```

`env` 함수에 전달되는 두 번째 값은 "기본값"입니다. 주어진 키에 대한 환경 변수가 존재하지 않으면 이 값이 반환됩니다.

<a name="determining-the-current-environment"></a>
### 현재 환경 확인하기

현재 애플리케이션 환경은 `.env` 파일의 `APP_ENV` 변수를 통해 결정됩니다. `App` [파사드(Facade)](/docs/{{version}}/facades)의 `environment` 메서드를 통해 이 값에 접근할 수 있습니다.

```php
use Illuminate\Support\Facades\App;

$environment = App::environment();
```

`environment` 메서드에 인자를 전달하여 환경이 주어진 값과 일치하는지 확인할 수도 있습니다. 환경이 주어진 값 중 하나와 일치하면 메서드는 `true`를 반환합니다.

```php
if (App::environment('local')) {
    // 환경이 local입니다
}

if (App::environment(['local', 'staging'])) {
    // 환경이 local 또는 staging입니다...
}
```

> [!NOTE]  
> 현재 애플리케이션 환경 감지는 서버 수준의 `APP_ENV` 환경 변수를 정의하여 재정의할 수 있습니다.

<a name="encrypting-environment-files"></a>
### 환경 파일 암호화

암호화되지 않은 환경 파일은 절대로 소스 컨트롤에 저장해서는 안 됩니다. 그러나 Laravel은 환경 파일을 암호화하여 애플리케이션의 나머지 부분과 함께 소스 컨트롤에 안전하게 추가할 수 있도록 합니다.

<a name="encryption"></a>
#### 암호화

환경 파일을 암호화하려면 `env:encrypt` 명령어를 사용할 수 있습니다.

```bash
php artisan env:encrypt
```

`env:encrypt` 명령어를 실행하면 `.env` 파일이 암호화되어 `.env.encrypted` 파일에 암호화된 내용이 저장됩니다. 복호화 키는 명령어 출력에 표시되며 안전한 비밀번호 관리자에 저장해야 합니다. 직접 암호화 키를 제공하려면 명령어 실행 시 `--key` 옵션을 사용할 수 있습니다.

```bash
php artisan env:encrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

> [!NOTE]  
> 제공되는 키의 길이는 사용되는 암호화 암호에서 요구하는 키 길이와 일치해야 합니다. 기본적으로 Laravel은 32자 키가 필요한 `AES-256-CBC` 암호를 사용합니다. 명령어 실행 시 `--cipher` 옵션을 전달하여 Laravel의 [암호화기(Encrypter)](/docs/{{version}}/encryption)가 지원하는 모든 암호를 자유롭게 사용할 수 있습니다.

애플리케이션에 `.env`와 `.env.staging`과 같이 여러 환경 파일이 있는 경우, `--env` 옵션을 통해 환경 이름을 제공하여 암호화할 환경 파일을 지정할 수 있습니다.

```bash
php artisan env:encrypt --env=staging
```

<a name="decryption"></a>
#### 복호화

환경 파일을 복호화하려면 `env:decrypt` 명령어를 사용할 수 있습니다. 이 명령어는 복호화 키가 필요하며, Laravel은 `LARAVEL_ENV_ENCRYPTION_KEY` 환경 변수에서 이 키를 가져옵니다.

```bash
php artisan env:decrypt
```

또는, `--key` 옵션을 통해 명령어에 직접 키를 제공할 수 있습니다.

```bash
php artisan env:decrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

`env:decrypt` 명령어가 실행되면, Laravel은 `.env.encrypted` 파일의 내용을 복호화하여 `.env` 파일에 복호화된 내용을 저장합니다.

사용자 정의 암호화 암호를 사용하려면 `env:decrypt` 명령어에 `--cipher` 옵션을 제공할 수 있습니다.

```bash
php artisan env:decrypt --key=qUWuNRdfuImXcKxZ --cipher=AES-128-CBC
```

애플리케이션에 `.env`와 `.env.staging`과 같이 여러 환경 파일이 있는 경우, `--env` 옵션을 통해 환경 이름을 제공하여 복호화할 환경 파일을 지정할 수 있습니다.

```bash
php artisan env:decrypt --env=staging
```

기존 환경 파일을 덮어쓰려면 `env:decrypt` 명령어에 `--force` 옵션을 제공할 수 있습니다.

```bash
php artisan env:decrypt --force
```

<a name="accessing-configuration-values"></a>
## 설정 값에 접근하기

애플리케이션 어디에서나 `Config` 파사드(Facade) 또는 전역 `config` 함수를 사용하여 설정 값에 쉽게 접근할 수 있습니다. 설정 값은 파일 이름과 접근하려는 옵션을 포함하는 "점" 구문을 사용하여 접근할 수 있습니다. 설정 옵션이 존재하지 않을 경우 반환될 기본값도 지정할 수 있습니다.

```php
use Illuminate\Support\Facades\Config;

$value = Config::get('app.timezone');

$value = config('app.timezone');

// 설정 값이 존재하지 않으면 기본값을 조회합니다...
$value = config('app.timezone', 'Asia/Seoul');
```

런타임에 설정 값을 설정하려면 `Config` 파사드(Facade)의 `set` 메서드를 호출하거나 `config` 함수에 배열을 전달하면 됩니다.

```php
Config::set('app.timezone', 'America/Chicago');

config(['app.timezone' => 'America/Chicago']);
```

정적 분석을 지원하기 위해 `Config` 파사드(Facade)는 타입이 지정된 설정 조회 메서드도 제공합니다. 조회된 설정 값이 예상 타입과 일치하지 않으면 예외가 발생합니다.

```php
Config::string('config-key');
Config::integer('config-key');
Config::float('config-key');
Config::boolean('config-key');
Config::array('config-key');
```

<a name="configuration-caching"></a>
## 설정 캐싱

애플리케이션의 속도를 높이려면 `config:cache` Artisan 명령어를 사용하여 모든 설정 파일을 단일 파일로 캐시해야 합니다. 이렇게 하면 애플리케이션의 모든 설정 옵션이 프레임워크에서 빠르게 로드할 수 있는 단일 파일로 결합됩니다.

일반적으로 프로덕션 배포 과정의 일부로 `php artisan config:cache` 명령어를 실행해야 합니다. 애플리케이션 개발 과정에서 설정 옵션이 자주 변경되어야 하므로 로컬 개발 중에는 이 명령어를 실행하지 않아야 합니다.

설정이 캐시되면, 요청이나 Artisan 명령어 중에 애플리케이션의 `.env` 파일이 프레임워크에 의해 로드되지 않습니다. 따라서 `env` 함수는 외부의 시스템 수준 환경 변수만 반환합니다.

이러한 이유로 애플리케이션의 설정(`config`) 파일 내에서만 `env` 함수를 호출해야 합니다. Laravel의 기본 설정 파일을 살펴보면 이에 대한 많은 예시를 확인할 수 있습니다. [위에서 설명한](#accessing-configuration-values) `config` 함수를 사용하여 애플리케이션 어디에서나 설정 값에 접근할 수 있습니다.

캐시된 설정을 삭제하려면 `config:clear` 명령어를 사용할 수 있습니다.

```bash
php artisan config:clear
```

> [!WARNING]  
> 배포 과정에서 `config:cache` 명령어를 실행하는 경우, 설정 파일 내에서만 `env` 함수를 호출하고 있는지 확인해야 합니다. 설정이 캐시되면 `.env` 파일이 로드되지 않으므로, `env` 함수는 외부의 시스템 수준 환경 변수만 반환합니다.

<a name="configuration-publishing"></a>
## 설정 퍼블리싱

대부분의 Laravel 설정 파일은 이미 애플리케이션의 `config` 디렉토리에 퍼블리시되어 있습니다. 그러나 `cors.php`나 `view.php`와 같은 특정 설정 파일은 대부분의 애플리케이션에서 수정할 필요가 없기 때문에 기본적으로 퍼블리시되지 않습니다.

그러나 `config:publish` Artisan 명령어를 사용하여 기본적으로 퍼블리시되지 않은 설정 파일을 퍼블리시할 수 있습니다.

```bash
php artisan config:publish

php artisan config:publish --all
```

<a name="debug-mode"></a>
## 디버그 모드

`config/app.php` 설정 파일의 `debug` 옵션은 오류에 대한 정보가 사용자에게 실제로 얼마나 표시되는지를 결정합니다. 기본적으로 이 옵션은 `.env` 파일에 저장된 `APP_DEBUG` 환경 변수의 값을 따르도록 설정되어 있습니다.

> [!WARNING]  
> 로컬 개발 시에는 `APP_DEBUG` 환경 변수를 `true`로 설정해야 합니다. **프로덕션 환경에서는 이 값이 항상 `false`여야 합니다. 프로덕션에서 변수가 `true`로 설정되면, 민감한 설정 값이 애플리케이션의 최종 사용자에게 노출될 위험이 있습니다.**

<a name="maintenance-mode"></a>
## 점검(유지보수) 모드

애플리케이션이 점검 모드일 때, 애플리케이션으로 들어오는 모든 요청에 대해 커스텀 뷰가 표시됩니다. 이를 통해 애플리케이션을 업데이트하거나 유지보수를 수행하는 동안 애플리케이션을 쉽게 "비활성화"할 수 있습니다. 점검 모드 확인은 애플리케이션의 기본 미들웨어(Middleware) 스택에 포함되어 있습니다. 애플리케이션이 점검 모드에 있으면 503 상태 코드와 함께 `Symfony\Component\HttpKernel\Exception\HttpException` 인스턴스가 발생합니다.

점검 모드를 활성화하려면 `down` Artisan 명령어를 실행합니다.

```bash
php artisan down
```

모든 점검 모드 응답과 함께 `Refresh` HTTP 헤더를 보내려면 `down` 명령어 실행 시 `refresh` 옵션을 제공할 수 있습니다. `Refresh` 헤더는 브라우저가 지정된 초 후에 자동으로 페이지를 새로고침하도록 지시합니다.

```bash
php artisan down --refresh=15
```

`down` 명령어에 `retry` 옵션을 제공할 수도 있으며, 이 값은 `Retry-After` HTTP 헤더의 값으로 설정됩니다. 브라우저는 일반적으로 이 헤더를 무시합니다.

```bash
php artisan down --retry=60
```

<a name="bypassing-maintenance-mode"></a>
#### 점검 모드 우회하기

비밀 토큰을 사용하여 점검 모드를 우회하도록 허용하려면 `secret` 옵션을 사용하여 점검 모드 우회 토큰을 지정할 수 있습니다.

```bash
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

애플리케이션을 점검 모드로 전환한 후, 이 토큰과 일치하는 애플리케이션 URL로 이동하면 Laravel이 브라우저에 점검 모드 우회 쿠키를 발급합니다.

```bash
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```

Laravel이 비밀 토큰을 자동으로 생성하도록 하려면 `with-secret` 옵션을 사용할 수 있습니다. 애플리케이션이 점검 모드가 되면 비밀이 표시됩니다.

```bash
php artisan down --with-secret
```

이 숨겨진 라우트에 접근하면, 애플리케이션의 `/` 라우트로 리디렉션됩니다. 쿠키가 브라우저에 발급되면, 점검 모드가 아닌 것처럼 애플리케이션을 정상적으로 탐색할 수 있습니다.

> [!NOTE]  
> 점검 모드 비밀은 일반적으로 영숫자 문자와 선택적으로 대시로 구성되어야 합니다. URL에서 특별한 의미를 가지는 `?`나 `&`와 같은 문자는 사용하지 않아야 합니다.

<a name="maintenance-mode-on-multiple-servers"></a>
#### 다중 서버에서의 점검 모드

기본적으로 Laravel은 파일 기반 시스템을 사용하여 애플리케이션이 점검 모드인지 확인합니다. 이는 점검 모드를 활성화하려면 애플리케이션을 호스팅하는 각 서버에서 `php artisan down` 명령어를 실행해야 함을 의미합니다.

또는 Laravel은 점검 모드를 처리하는 캐시 기반 방법을 제공합니다. 이 방법은 한 서버에서만 `php artisan down` 명령어를 실행하면 됩니다. 이 접근 방식을 사용하려면 애플리케이션의 `.env` 파일에서 점검 모드 변수를 수정합니다. 모든 서버에서 접근할 수 있는 캐시 `store`를 선택해야 합니다. 이렇게 하면 모든 서버에서 점검 모드 상태가 일관되게 유지됩니다.

```ini
APP_MAINTENANCE_DRIVER=cache
APP_MAINTENANCE_STORE=database
```

<a name="pre-rendering-the-maintenance-mode-view"></a>
#### 점검 모드 뷰 사전 렌더링

배포 중에 `php artisan down` 명령어를 사용하면, Composer 의존성이나 다른 인프라 구성 요소가 업데이트되는 동안 사용자가 애플리케이션에 접근하면 여전히 오류가 발생할 수 있습니다. 이는 Laravel 프레임워크의 상당 부분이 부팅되어야 애플리케이션이 점검 모드인지 확인하고 템플릿 엔진을 사용하여 점검 모드 뷰를 렌더링할 수 있기 때문입니다.

이러한 이유로 Laravel은 요청 사이클의 가장 처음에 반환될 점검 모드 뷰를 사전 렌더링할 수 있습니다. 이 뷰는 애플리케이션의 의존성이 로드되기 전에 렌더링됩니다. `down` 명령어의 `render` 옵션을 사용하여 원하는 템플릿을 사전 렌더링할 수 있습니다.

```bash
php artisan down --render="errors::503"
```

<a name="redirecting-maintenance-mode-requests"></a>
#### 점검 모드 요청 리디렉션

점검 모드에서 Laravel은 사용자가 접근하려는 모든 애플리케이션 URL에 대해 점검 모드 뷰를 표시합니다. 원하는 경우, 모든 요청을 특정 URL로 리디렉션하도록 Laravel에 지시할 수 있습니다. 이는 `redirect` 옵션을 사용하여 수행할 수 있습니다. 예를 들어, 모든 요청을 `/` URI로 리디렉션하고 싶을 수 있습니다.

```bash
php artisan down --redirect=/
```

<a name="disabling-maintenance-mode"></a>
#### 점검 모드 비활성화

점검 모드를 비활성화하려면 `up` 명령어를 사용합니다.

```bash
php artisan up
```

> [!NOTE]  
> `resources/views/errors/503.blade.php`에 자체 템플릿을 정의하여 기본 점검 모드 템플릿을 커스터마이즈할 수 있습니다.

<a name="maintenance-mode-queues"></a>
#### 점검 모드와 큐

애플리케이션이 점검 모드에 있는 동안에는 [큐(Queue)에 등록된 작업](/docs/{{version}}/queues)이 처리되지 않습니다. 애플리케이션이 점검 모드에서 벗어나면 작업은 정상적으로 처리됩니다.

<a name="alternatives-to-maintenance-mode"></a>
#### 점검 모드의 대안

점검 모드는 애플리케이션에 몇 초간의 다운타임을 필요로 하므로, Laravel을 사용한 무중단 배포를 달성하기 위해 [Laravel Vapor](https://vapor.laravel.com)와 [Envoyer](https://envoyer.io)와 같은 대안을 고려해보세요.

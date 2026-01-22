# Laravel Sanctum

- [소개](#introduction)
    - [작동 방식](#how-it-works)
- [설치](#installation)
- [설정](#configuration)
    - [기본 모델 오버라이딩](#overriding-default-models)
- [API 토큰 인증](#api-token-authentication)
    - [API 토큰 발급](#issuing-api-tokens)
    - [토큰 기능(Abilities)](#token-abilities)
    - [라우트 보호](#protecting-routes)
    - [토큰 폐기](#revoking-tokens)
    - [토큰 만료](#token-expiration)
- [SPA 인증](#spa-authentication)
    - [설정](#spa-configuration)
    - [인증하기](#spa-authenticating)
    - [라우트 보호](#protecting-spa-routes)
    - [비공개 브로드캐스트 채널 인가](#authorizing-private-broadcast-channels)
- [모바일 애플리케이션 인증](#mobile-application-authentication)
    - [API 토큰 발급](#issuing-mobile-api-tokens)
    - [라우트 보호](#protecting-mobile-api-routes)
    - [토큰 폐기](#revoking-mobile-api-tokens)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Sanctum](https://github.com/laravel/sanctum)은 SPA(싱글 페이지 애플리케이션), 모바일 애플리케이션, 그리고 간단한 토큰 기반 API를 위한 가벼운 인증 시스템을 제공합니다. Sanctum을 사용하면 애플리케이션의 각 사용자가 자신의 계정에 대해 여러 개의 API 토큰을 생성할 수 있습니다. 이 토큰에는 토큰이 수행할 수 있는 작업을 지정하는 기능(abilities) / 스코프(scopes)를 부여할 수 있습니다.

<a name="how-it-works"></a>
### 작동 방식

Laravel Sanctum은 두 가지 별개의 문제를 해결하기 위해 존재합니다. 라이브러리에 대해 더 깊이 살펴보기 전에 각각에 대해 논의해 보겠습니다.

<a name="how-it-works-api-tokens"></a>
#### API 토큰

첫째, Sanctum은 OAuth의 복잡함 없이 사용자에게 API 토큰을 발급하는 데 사용할 수 있는 간단한 패키지입니다. 이 기능은 GitHub 및 기타 "개인 액세스 토큰"을 발급하는 애플리케이션에서 영감을 받았습니다. 예를 들어, 애플리케이션의 "계정 설정"에 사용자가 자신의 계정에 대한 API 토큰을 생성할 수 있는 화면이 있다고 상상해 보세요. Sanctum을 사용하여 이러한 토큰을 생성하고 관리할 수 있습니다. 이러한 토큰은 일반적으로 매우 긴 만료 시간(수년)을 가지지만, 사용자가 언제든지 수동으로 폐기할 수 있습니다.

Laravel Sanctum은 단일 데이터베이스 테이블에 사용자 API 토큰을 저장하고, 유효한 API 토큰이 포함되어야 하는 `Authorization` 헤더를 통해 들어오는 HTTP 요청을 인증함으로써 이 기능을 제공합니다.

<a name="how-it-works-spa-authentication"></a>
#### SPA 인증

둘째, Sanctum은 Laravel 기반 API와 통신해야 하는 싱글 페이지 애플리케이션(SPA)을 인증하는 간단한 방법을 제공하기 위해 존재합니다. 이러한 SPA는 Laravel 애플리케이션과 동일한 저장소에 존재할 수도 있고, Next.js나 Nuxt를 사용하여 생성된 SPA처럼 완전히 별도의 저장소일 수도 있습니다.

이 기능을 위해 Sanctum은 어떤 종류의 토큰도 사용하지 않습니다. 대신, Sanctum은 Laravel의 내장 쿠키 기반 세션 인증 서비스를 사용합니다. 일반적으로 Sanctum은 이를 수행하기 위해 Laravel의 `web` 인증 가드를 활용합니다. 이는 CSRF 보호, 세션 인증의 이점을 제공하며, XSS를 통한 인증 자격 증명 누출로부터 보호합니다.

Sanctum은 들어오는 요청이 자체 SPA 프론트엔드에서 발생한 경우에만 쿠키를 사용하여 인증을 시도합니다. Sanctum이 들어오는 HTTP 요청을 검사할 때, 먼저 인증 쿠키를 확인하고, 쿠키가 없으면 Sanctum은 유효한 API 토큰을 찾기 위해 `Authorization` 헤더를 검사합니다.

> [!NOTE]
> Sanctum을 API 토큰 인증에만 사용하거나 SPA 인증에만 사용해도 전혀 문제없습니다. Sanctum을 사용한다고 해서 제공하는 두 기능을 모두 사용해야 하는 것은 아닙니다.

<a name="installation"></a>
## 설치

`install:api` Artisan 명령을 통해 Laravel Sanctum을 설치할 수 있습니다.

```shell
php artisan install:api
```

다음으로, Sanctum을 사용하여 SPA를 인증할 계획이라면, 이 문서의 [SPA 인증](#spa-authentication) 섹션을 참조하세요.

<a name="configuration"></a>
## 설정

<a name="overriding-default-models"></a>
### 기본 모델 오버라이딩

일반적으로 필요하지 않지만, Sanctum이 내부적으로 사용하는 `PersonalAccessToken` 모델을 자유롭게 확장할 수 있습니다.

```php
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ...
}
```

그런 다음, Sanctum이 제공하는 `usePersonalAccessTokenModel` 메서드를 통해 Sanctum에 커스텀 모델을 사용하도록 지시할 수 있습니다. 일반적으로 애플리케이션의 `AppServiceProvider` 파일의 `boot` 메서드에서 이 메서드를 호출해야 합니다.

```php
use App\Models\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
}
```

<a name="api-token-authentication"></a>
## API 토큰 인증

> [!NOTE]
> 자체 퍼스트파티 SPA를 인증하기 위해 API 토큰을 사용해서는 안 됩니다. 대신 Sanctum의 내장 [SPA 인증 기능](#spa-authentication)을 사용하세요.

<a name="issuing-api-tokens"></a>
### API 토큰 발급

Sanctum을 사용하면 애플리케이션에 대한 API 요청을 인증하는 데 사용할 수 있는 API 토큰 / 개인 액세스 토큰을 발급할 수 있습니다. API 토큰을 사용하여 요청할 때, 토큰은 `Authorization` 헤더에 `Bearer` 토큰으로 포함되어야 합니다.

사용자를 위한 토큰 발급을 시작하려면, User 모델에서 `Laravel\Sanctum\HasApiTokens` 트레이트를 사용해야 합니다.

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

토큰을 발급하려면 `createToken` 메서드를 사용할 수 있습니다. `createToken` 메서드는 `Laravel\Sanctum\NewAccessToken` 인스턴스를 반환합니다. API 토큰은 데이터베이스에 저장되기 전에 SHA-256 해싱을 사용하여 해시되지만, `NewAccessToken` 인스턴스의 `plainTextToken` 속성을 사용하여 토큰의 평문 값에 액세스할 수 있습니다. 토큰이 생성된 직후에 이 값을 사용자에게 표시해야 합니다.

```php
use Illuminate\Http\Request;

Route::post('/tokens/create', function (Request $request) {
    $token = $request->user()->createToken($request->token_name);

    return ['token' => $token->plainTextToken];
});
```

`HasApiTokens` 트레이트가 제공하는 `tokens` Eloquent 관계를 사용하여 사용자의 모든 토큰에 액세스할 수 있습니다.

```php
foreach ($user->tokens as $token) {
    // ...
}
```

<a name="token-abilities"></a>
### 토큰 기능(Abilities)

Sanctum을 사용하면 토큰에 "기능(abilities)"을 할당할 수 있습니다. 기능은 OAuth의 "스코프(scopes)"와 유사한 목적을 수행합니다. `createToken` 메서드의 두 번째 인수로 문자열 기능 배열을 전달할 수 있습니다.

```php
return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

Sanctum으로 인증된 들어오는 요청을 처리할 때, `tokenCan` 또는 `tokenCant` 메서드를 사용하여 토큰이 주어진 기능을 가지고 있는지 확인할 수 있습니다.

```php
if ($user->tokenCan('server:update')) {
    // ...
}

if ($user->tokenCant('server:update')) {
    // ...
}
```

<a name="token-ability-middleware"></a>
#### 토큰 기능 미들웨어(Token Ability Middleware)

Sanctum에는 들어오는 요청이 주어진 기능이 부여된 토큰으로 인증되었는지 확인하는 데 사용할 수 있는 두 개의 미들웨어도 포함되어 있습니다. 시작하려면 애플리케이션의 `bootstrap/app.php` 파일에서 다음 미들웨어 별칭을 정의하세요.

```php
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'abilities' => CheckAbilities::class,
        'ability' => CheckForAnyAbility::class,
    ]);
})
```

`abilities` 미들웨어는 들어오는 요청의 토큰이 나열된 모든 기능을 가지고 있는지 확인하기 위해 라우트에 할당될 수 있습니다.

```php
Route::get('/orders', function () {
    // 토큰이 "check-status"와 "place-orders" 기능을 모두 가지고 있음...
})->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

`ability` 미들웨어는 들어오는 요청의 토큰이 나열된 기능 중 *최소 하나*를 가지고 있는지 확인하기 위해 라우트에 할당될 수 있습니다.

```php
Route::get('/orders', function () {
    // 토큰이 "check-status" 또는 "place-orders" 기능을 가지고 있음...
})->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### 퍼스트파티 UI에서 시작된 요청

편의를 위해, 들어오는 인증된 요청이 퍼스트파티 SPA에서 온 것이고 Sanctum의 내장 [SPA 인증](#spa-authentication)을 사용하는 경우 `tokenCan` 메서드는 항상 `true`를 반환합니다.

그러나 이것이 반드시 애플리케이션이 사용자가 해당 작업을 수행하도록 허용해야 한다는 것을 의미하지는 않습니다. 일반적으로 애플리케이션의 [인가 정책(authorization policies)](/docs/{{version}}/authorization#creating-policies)은 토큰이 기능을 수행할 수 있는 권한이 부여되었는지 확인하고, 사용자 인스턴스 자체가 해당 작업을 수행할 수 있도록 허용되어야 하는지 확인합니다.

예를 들어, 서버를 관리하는 애플리케이션을 상상해 보면, 이는 토큰이 서버 업데이트를 수행할 수 있는 권한이 있는지 **그리고** 서버가 해당 사용자에게 속해 있는지 확인하는 것을 의미할 수 있습니다.

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

처음에는 `tokenCan` 메서드가 호출되고 퍼스트파티 UI에서 시작된 요청에 대해 항상 `true`를 반환하도록 허용하는 것이 이상하게 보일 수 있습니다. 그러나 API 토큰을 항상 사용할 수 있고 `tokenCan` 메서드를 통해 검사할 수 있다고 가정할 수 있어 편리합니다. 이 접근 방식을 취하면, 요청이 애플리케이션의 UI에서 트리거되었는지 아니면 API의 서드파티 소비자 중 하나에 의해 시작되었는지 걱정하지 않고 애플리케이션의 인가 정책 내에서 항상 `tokenCan` 메서드를 호출할 수 있습니다.

<a name="protecting-routes"></a>
### 라우트 보호

모든 들어오는 요청이 인증되도록 라우트를 보호하려면, `routes/web.php` 및 `routes/api.php` 라우트 파일 내의 보호된 라우트에 `sanctum` 인증 가드를 연결해야 합니다. 이 가드는 들어오는 요청이 상태 저장(stateful), 쿠키 인증 요청으로 인증되거나, 요청이 서드파티에서 온 경우 유효한 API 토큰 헤더를 포함하고 있는지 확인합니다.

애플리케이션의 `routes/web.php` 파일 내에서 `sanctum` 가드를 사용하여 라우트를 인증하는 것을 권장하는 이유가 궁금할 수 있습니다. Sanctum은 먼저 Laravel의 일반적인 세션 인증 쿠키를 사용하여 들어오는 요청을 인증하려고 시도한다는 것을 기억하세요. 해당 쿠키가 없으면 Sanctum은 요청의 `Authorization` 헤더에 있는 토큰을 사용하여 요청을 인증하려고 시도합니다. 또한 Sanctum을 사용하여 모든 요청을 인증하면, 현재 인증된 사용자 인스턴스에서 항상 `tokenCan` 메서드를 호출할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="revoking-tokens"></a>
### 토큰 폐기

`Laravel\Sanctum\HasApiTokens` 트레이트가 제공하는 `tokens` 관계를 사용하여 데이터베이스에서 토큰을 삭제함으로써 토큰을 "폐기"할 수 있습니다.

```php
// 모든 토큰 폐기...
$user->tokens()->delete();

// 현재 요청을 인증하는 데 사용된 토큰 폐기...
$request->user()->currentAccessToken()->delete();

// 특정 토큰 폐기...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="token-expiration"></a>
### 토큰 만료

기본적으로 Sanctum 토큰은 만료되지 않으며 [토큰을 폐기](#revoking-tokens)해야만 무효화할 수 있습니다. 그러나 애플리케이션의 API 토큰에 대한 만료 시간을 구성하려면, 애플리케이션의 `sanctum` 설정 파일에 정의된 `expiration` 구성 옵션을 통해 구성할 수 있습니다. 이 구성 옵션은 발급된 토큰이 만료된 것으로 간주될 때까지의 시간(분)을 정의합니다.

```php
'expiration' => 525600,
```

각 토큰의 만료 시간을 독립적으로 지정하려면, `createToken` 메서드의 세 번째 인수로 만료 시간을 제공하면 됩니다.

```php
return $user->createToken(
    'token-name', ['*'], now()->addWeek()
)->plainTextToken;
```

애플리케이션에 토큰 만료 시간을 구성한 경우, 애플리케이션의 만료된 토큰을 정리하기 위해 [작업을 스케줄링](/docs/{{version}}/scheduling)할 수도 있습니다. 다행히 Sanctum에는 이를 수행하는 데 사용할 수 있는 `sanctum:prune-expired` Artisan 명령이 포함되어 있습니다. 예를 들어, 최소 24시간 동안 만료된 모든 만료된 토큰 데이터베이스 레코드를 삭제하도록 스케줄된 작업을 구성할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>
## SPA 인증

Sanctum은 또한 Laravel 기반 API와 통신해야 하는 싱글 페이지 애플리케이션(SPA)을 인증하는 간단한 방법을 제공하기 위해 존재합니다. 이러한 SPA는 Laravel 애플리케이션과 동일한 저장소에 존재할 수도 있고, 완전히 별도의 저장소일 수도 있습니다.

이 기능을 위해 Sanctum은 어떤 종류의 토큰도 사용하지 않습니다. 대신, Sanctum은 Laravel의 내장 쿠키 기반 세션 인증 서비스를 사용합니다. 이 인증 접근 방식은 CSRF 보호, 세션 인증의 이점을 제공하며, XSS를 통한 인증 자격 증명 누출로부터 보호합니다.

> [!WARNING]
> 인증하려면 SPA와 API가 동일한 최상위 도메인을 공유해야 합니다. 그러나 다른 서브도메인에 배치될 수 있습니다. 또한 요청과 함께 `Accept: application/json` 헤더와 `Referer` 또는 `Origin` 헤더를 전송해야 합니다.

<a name="spa-configuration"></a>
### 설정

<a name="configuring-your-first-party-domains"></a>
#### 퍼스트파티 도메인 구성

먼저, SPA가 요청을 보낼 도메인을 구성해야 합니다. `sanctum` 설정 파일의 `stateful` 구성 옵션을 사용하여 이러한 도메인을 구성할 수 있습니다. 이 구성 설정은 API에 요청할 때 Laravel 세션 쿠키를 사용하여 "상태 저장(stateful)" 인증을 유지할 도메인을 결정합니다.

퍼스트파티 상태 저장 도메인을 설정하는 데 도움이 되도록, Sanctum은 구성에 포함할 수 있는 두 가지 헬퍼 함수를 제공합니다. 먼저, `Sanctum::currentApplicationUrlWithPort()`는 `APP_URL` 환경 변수에서 현재 애플리케이션 URL을 반환하고, `Sanctum::currentRequestHost()`는 런타임에 현재 요청의 호스트로 대체되는 플레이스홀더를 상태 저장 도메인 목록에 삽입하여 동일한 도메인의 모든 요청이 상태 저장으로 간주되도록 합니다.

> [!WARNING]
> 포트를 포함하는 URL(`127.0.0.1:8000`)을 통해 애플리케이션에 액세스하는 경우, 도메인과 함께 포트 번호를 포함해야 합니다.

<a name="sanctum-middleware"></a>
#### Sanctum 미들웨어

다음으로, SPA에서 들어오는 요청이 Laravel의 세션 쿠키를 사용하여 인증할 수 있도록 하면서, 서드파티 또는 모바일 애플리케이션의 요청이 API 토큰을 사용하여 인증할 수 있도록 Laravel에 지시해야 합니다. 이는 애플리케이션의 `bootstrap/app.php` 파일에서 `statefulApi` 미들웨어 메서드를 호출하여 쉽게 수행할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->statefulApi();
})
```

<a name="cors-and-cookies"></a>
#### CORS와 쿠키

별도의 서브도메인에서 실행되는 SPA에서 애플리케이션으로 인증하는 데 문제가 있는 경우, CORS(Cross-Origin Resource Sharing) 또는 세션 쿠키 설정을 잘못 구성했을 가능성이 높습니다.

`config/cors.php` 설정 파일은 기본적으로 퍼블리시되지 않습니다. Laravel의 CORS 옵션을 커스터마이즈해야 하는 경우, `config:publish` Artisan 명령을 사용하여 전체 `cors` 설정 파일을 퍼블리시해야 합니다.

```shell
php artisan config:publish cors
```

다음으로, 애플리케이션의 CORS 구성이 `True` 값으로 `Access-Control-Allow-Credentials` 헤더를 반환하는지 확인해야 합니다. 이는 애플리케이션의 `config/cors.php` 설정 파일 내에서 `supports_credentials` 옵션을 `true`로 설정하여 수행할 수 있습니다.

또한 애플리케이션의 전역 `axios` 인스턴스에서 `withCredentials` 및 `withXSRFToken` 옵션을 활성화해야 합니다. 일반적으로 이 작업은 `resources/js/bootstrap.js` 파일에서 수행해야 합니다. 프론트엔드에서 HTTP 요청을 만들기 위해 Axios를 사용하지 않는 경우, 자체 HTTP 클라이언트에서 동등한 구성을 수행해야 합니다.

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

마지막으로, 애플리케이션의 세션 쿠키 도메인 구성이 루트 도메인의 모든 서브도메인을 지원하는지 확인해야 합니다. 애플리케이션의 `config/session.php` 설정 파일 내에서 도메인 앞에 `.`을 붙여 이를 수행할 수 있습니다.

```php
'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### 인증하기

<a name="csrf-protection"></a>
#### CSRF 보호

SPA를 인증하려면, SPA의 "로그인" 페이지에서 먼저 `/sanctum/csrf-cookie` 엔드포인트에 요청을 보내 애플리케이션에 대한 CSRF 보호를 초기화해야 합니다.

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // 로그인...
});
```

이 요청 중에 Laravel은 현재 CSRF 토큰을 포함하는 `XSRF-TOKEN` 쿠키를 설정합니다. 이 토큰은 URL 디코딩되어 후속 요청의 `X-XSRF-TOKEN` 헤더에 전달되어야 하며, Axios 및 Angular HttpClient와 같은 일부 HTTP 클라이언트 라이브러리는 자동으로 이 작업을 수행합니다. JavaScript HTTP 라이브러리가 값을 설정하지 않는 경우, 이 라우트에서 설정한 `XSRF-TOKEN` 쿠키의 URL 디코딩된 값과 일치하도록 `X-XSRF-TOKEN` 헤더를 수동으로 설정해야 합니다.

<a name="logging-in"></a>
#### 로그인

CSRF 보호가 초기화되면, Laravel 애플리케이션의 `/login` 라우트에 `POST` 요청을 해야 합니다. 이 `/login` 라우트는 [수동으로 구현](/docs/{{version}}/authentication#authenticating-users)하거나 [Laravel Fortify](/docs/{{version}}/fortify)와 같은 헤드리스 인증 패키지를 사용할 수 있습니다.

로그인 요청이 성공하면, 인증되며 애플리케이션의 라우트에 대한 후속 요청은 Laravel 애플리케이션이 클라이언트에 발급한 세션 쿠키를 통해 자동으로 인증됩니다. 또한 애플리케이션이 이미 `/sanctum/csrf-cookie` 라우트에 요청했으므로, JavaScript HTTP 클라이언트가 `XSRF-TOKEN` 쿠키의 값을 `X-XSRF-TOKEN` 헤더에 전송하는 한 후속 요청은 자동으로 CSRF 보호를 받아야 합니다.

물론 사용자의 세션이 활동 부족으로 인해 만료되면, Laravel 애플리케이션에 대한 후속 요청은 401 또는 419 HTTP 오류 응답을 받을 수 있습니다. 이 경우 사용자를 SPA의 로그인 페이지로 리디렉션해야 합니다.

> [!WARNING]
> 자체 `/login` 엔드포인트를 작성할 수 있지만, [Laravel이 제공하는 표준 세션 기반 인증 서비스](/docs/{{version}}/authentication#authenticating-users)를 사용하여 사용자를 인증해야 합니다. 일반적으로 이는 `web` 인증 가드를 사용하는 것을 의미합니다.

<a name="protecting-spa-routes"></a>
### 라우트 보호

모든 들어오는 요청이 인증되도록 라우트를 보호하려면, `routes/api.php` 파일 내의 API 라우트에 `sanctum` 인증 가드를 연결해야 합니다. 이 가드는 들어오는 요청이 SPA에서 상태 저장 인증 요청으로 인증되거나, 요청이 서드파티에서 온 경우 유효한 API 토큰 헤더를 포함하고 있는지 확인합니다.

```php
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="authorizing-private-broadcast-channels"></a>
### 비공개 브로드캐스트 채널 인가

SPA가 [비공개 / 프레즌스 브로드캐스트 채널](/docs/{{version}}/broadcasting#authorizing-channels)로 인증해야 하는 경우, 애플리케이션의 `bootstrap/app.php` 파일에 포함된 `withRouting` 메서드에서 `channels` 항목을 제거해야 합니다. 대신 `withBroadcasting` 메서드를 호출하여 애플리케이션의 브로드캐스팅 라우트에 대한 올바른 미들웨어를 지정할 수 있습니다.

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        // ...
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']],
    )
```

다음으로, Pusher의 인가 요청이 성공하려면, [Laravel Echo](/docs/{{version}}/broadcasting#client-side-installation)를 초기화할 때 커스텀 Pusher `authorizer`를 제공해야 합니다. 이를 통해 애플리케이션은 [크로스 도메인 요청에 적절하게 구성된](#cors-and-cookies) `axios` 인스턴스를 사용하도록 Pusher를 구성할 수 있습니다.

```js
window.Echo = new Echo({
    broadcaster: "pusher",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios.post('/api/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
})
```

<a name="mobile-application-authentication"></a>
## 모바일 애플리케이션 인증

Sanctum 토큰을 사용하여 모바일 애플리케이션의 API 요청을 인증할 수도 있습니다. 모바일 애플리케이션 요청을 인증하는 프로세스는 서드파티 API 요청을 인증하는 것과 유사하지만, API 토큰을 발급하는 방법에 약간의 차이가 있습니다.

<a name="issuing-mobile-api-tokens"></a>
### API 토큰 발급

시작하려면, 사용자의 이메일 / 사용자명, 비밀번호 및 기기 이름을 받아 해당 자격 증명을 새 Sanctum 토큰으로 교환하는 라우트를 만드세요. 이 엔드포인트에 제공되는 "기기 이름"은 정보 제공 목적이며 원하는 값이면 됩니다. 일반적으로 기기 이름 값은 "Nuno의 iPhone 12"와 같이 사용자가 인식할 수 있는 이름이어야 합니다.

일반적으로, 모바일 애플리케이션의 "로그인" 화면에서 토큰 엔드포인트에 요청합니다. 엔드포인트는 평문 API 토큰을 반환하며, 이 토큰은 모바일 기기에 저장되어 추가 API 요청에 사용될 수 있습니다.

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

Route::post('/sanctum/token', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_name' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    return $user->createToken($request->device_name)->plainTextToken;
});
```

모바일 애플리케이션이 토큰을 사용하여 애플리케이션에 API 요청을 할 때, `Authorization` 헤더에 `Bearer` 토큰으로 토큰을 전달해야 합니다.

> [!NOTE]
> 모바일 애플리케이션에 토큰을 발급할 때, [토큰 기능](#token-abilities)을 지정할 수도 있습니다.

<a name="protecting-mobile-api-routes"></a>
### 라우트 보호

이전에 문서화된 대로, 라우트에 `sanctum` 인증 가드를 연결하여 모든 들어오는 요청이 인증되도록 라우트를 보호할 수 있습니다.

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="revoking-mobile-api-tokens"></a>
### 토큰 폐기

사용자가 모바일 기기에 발급된 API 토큰을 폐기할 수 있도록 하려면, 웹 애플리케이션 UI의 "계정 설정" 부분에 "폐기" 버튼과 함께 이름으로 나열할 수 있습니다. 사용자가 "폐기" 버튼을 클릭하면, 데이터베이스에서 토큰을 삭제할 수 있습니다. `Laravel\Sanctum\HasApiTokens` 트레이트가 제공하는 `tokens` 관계를 통해 사용자의 API 토큰에 액세스할 수 있다는 것을 기억하세요.

```php
// 모든 토큰 폐기...
$user->tokens()->delete();

// 특정 토큰 폐기...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## 테스트

테스트 중에 `Sanctum::actingAs` 메서드를 사용하여 사용자를 인증하고 토큰에 부여할 기능을 지정할 수 있습니다.

```php tab=Pest
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('task list can be retrieved', function () {
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Sanctum\Sanctum;

public function test_task_list_can_be_retrieved(): void
{
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
}
```

토큰에 모든 기능을 부여하려면, `actingAs` 메서드에 제공된 기능 목록에 `*`를 포함하세요.

```php
Sanctum::actingAs(
    User::factory()->create(),
    ['*']
);
```

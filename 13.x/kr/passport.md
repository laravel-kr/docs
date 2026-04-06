# Laravel Passport

- [소개](#introduction)
    - [Passport 또는 Sanctum?](#passport-or-sanctum)
- [설치](#installation)
    - [Passport 배포하기](#deploying-passport)
    - [Passport 업그레이드](#upgrading-passport)
- [설정](#configuration)
    - [토큰 수명](#token-lifetimes)
    - [기본 모델 오버라이드](#overriding-default-models)
    - [라우트 오버라이드](#overriding-routes)
- [인가 코드 그랜트](#authorization-code-grant)
    - [클라이언트 관리](#managing-clients)
    - [토큰 요청하기](#requesting-tokens)
    - [토큰 관리하기](#managing-tokens)
    - [토큰 갱신하기](#refreshing-tokens)
    - [토큰 폐기하기](#revoking-tokens)
    - [토큰 정리하기](#purging-tokens)
- [PKCE를 사용한 인가 코드 그랜트](#code-grant-pkce)
    - [클라이언트 생성하기](#creating-a-auth-pkce-grant-client)
    - [토큰 요청하기](#requesting-auth-pkce-grant-tokens)
- [디바이스 인가 그랜트](#device-authorization-grant)
    - [디바이스 코드 그랜트 클라이언트 생성하기](#creating-a-device-authorization-grant-client)
    - [토큰 요청하기](#requesting-device-authorization-grant-tokens)
- [패스워드 그랜트](#password-grant)
    - [패스워드 그랜트 클라이언트 생성하기](#creating-a-password-grant-client)
    - [토큰 요청하기](#requesting-password-grant-tokens)
    - [모든 스코프 요청하기](#requesting-all-scopes)
    - [사용자 프로바이더 커스터마이징](#customizing-the-user-provider)
    - [사용자명 필드 커스터마이징](#customizing-the-username-field)
    - [비밀번호 유효성 검사 커스터마이징](#customizing-the-password-validation)
- [암시적 그랜트](#implicit-grant)
- [클라이언트 자격증명 그랜트](#client-credentials-grant)
- [개인용 액세스 토큰](#personal-access-tokens)
    - [개인용 액세스 클라이언트 생성하기](#creating-a-personal-access-client)
    - [사용자 프로바이더 커스터마이징](#customizing-the-user-provider-for-pat)
    - [개인용 액세스 토큰 관리하기](#managing-personal-access-tokens)
- [라우트 보호하기](#protecting-routes)
    - [미들웨어를 통한 보호](#via-middleware)
    - [액세스 토큰 전달하기](#passing-the-access-token)
- [토큰 스코프](#token-scopes)
    - [스코프 정의하기](#defining-scopes)
    - [기본 스코프](#default-scope)
    - [토큰에 스코프 할당하기](#assigning-scopes-to-tokens)
    - [스코프 확인하기](#checking-scopes)
- [SPA 인증](#spa-authentication)
- [이벤트](#events)
- [테스팅](#testing)

<a name="introduction"></a>
## 소개

[Laravel Passport](https://github.com/laravel/passport)는 몇 분 만에 Laravel 애플리케이션을 위한 완전한 OAuth2 서버 구현을 제공합니다. Passport는 Andy Millington과 Simon Hamp가 관리하는 [League OAuth2 서버](https://github.com/thephpleague/oauth2-server) 위에 구축되었습니다.

> [!NOTE]
> 이 문서는 여러분이 이미 OAuth2에 익숙하다고 가정합니다. OAuth2에 대해 잘 모르신다면, 계속하기 전에 OAuth2의 일반적인 [용어](https://oauth2.thephpleague.com/terminology/)와 기능에 대해 먼저 숙지하시기 바랍니다.

<a name="passport-or-sanctum"></a>
### Passport 또는 Sanctum?

시작하기 전에, 여러분의 애플리케이션이 Laravel Passport나 [Laravel Sanctum](/docs/{{version}}/sanctum) 중 어느 것이 더 적합한지 결정해야 할 수 있습니다. 애플리케이션이 반드시 OAuth2를 지원해야 한다면 Laravel Passport를 사용해야 합니다.

그러나 단일 페이지 애플리케이션(SPA), 모바일 애플리케이션을 인증하거나 API 토큰을 발급하려는 경우에는 [Laravel Sanctum](/docs/{{version}}/sanctum)을 사용해야 합니다. Laravel Sanctum은 OAuth2를 지원하지 않지만, 훨씬 간단한 API 인증 개발 경험을 제공합니다.

<a name="installation"></a>
## 설치

`install:api` Artisan 명령어를 통해 Laravel Passport를 설치할 수 있습니다.

```shell
php artisan install:api --passport
```

이 명령어는 OAuth2 클라이언트와 액세스 토큰을 저장하는 데 필요한 테이블을 생성하기 위해 데이터베이스 마이그레이션을 발행하고 실행합니다. 또한 이 명령어는 보안 액세스 토큰을 생성하는 데 필요한 암호화 키를 생성합니다.

`install:api` 명령어를 실행한 후, `App\Models\User` 모델에 `Laravel\Passport\HasApiTokens` 트레이트와 `Laravel\Passport\Contracts\OAuthenticatable` 인터페이스를 추가하세요. 이 트레이트는 인증된 사용자의 토큰과 스코프를 검사할 수 있는 몇 가지 헬퍼 메서드를 모델에 제공합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

마지막으로, 애플리케이션의 `config/auth.php` 설정 파일에서 `api` 인증 가드를 정의하고 `driver` 옵션을 `passport`로 설정해야 합니다. 이렇게 하면 애플리케이션이 들어오는 API 요청을 인증할 때 Passport의 `TokenGuard`를 사용하도록 지시합니다.

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],
```

<a name="deploying-passport"></a>
### Passport 배포하기

애플리케이션 서버에 Passport를 처음 배포할 때, `passport:keys` 명령어를 실행해야 할 가능성이 높습니다. 이 명령어는 Passport가 액세스 토큰을 생성하는 데 필요한 암호화 키를 생성합니다. 생성된 키는 일반적으로 소스 컨트롤에 보관하지 않습니다.

```shell
php artisan passport:keys
```

필요한 경우, Passport의 키를 로드할 경로를 정의할 수 있습니다. 이를 위해 `Passport::loadKeysFrom` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```php
/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
}
```

<a name="loading-keys-from-the-environment"></a>
#### 환경 변수에서 키 로드하기

또는 `vendor:publish` Artisan 명령어를 사용하여 Passport의 설정 파일을 발행할 수 있습니다.

```shell
php artisan vendor:publish --tag=passport-config
```

설정 파일이 발행된 후, 환경 변수로 정의하여 애플리케이션의 암호화 키를 로드할 수 있습니다.

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="upgrading-passport"></a>
### Passport 업그레이드

Passport의 새로운 메이저 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/passport/blob/master/UPGRADE.md)를 주의 깊게 검토하는 것이 중요합니다.

<a name="configuration"></a>
## 설정

<a name="token-lifetimes"></a>
### 토큰 수명

기본적으로 Passport는 1년 후에 만료되는 장기 액세스 토큰을 발급합니다. 더 길거나 짧은 토큰 수명을 설정하려면 `tokensExpireIn`, `refreshTokensExpireIn`, `personalAccessTokensExpireIn` 메서드를 사용할 수 있습니다. 이러한 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```php
use Carbon\CarbonInterval;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Passport::tokensExpireIn(CarbonInterval::days(15));
    Passport::refreshTokensExpireIn(CarbonInterval::days(30));
    Passport::personalAccessTokensExpireIn(CarbonInterval::months(6));
}
```

> [!WARNING]
> Passport의 데이터베이스 테이블에 있는 `expires_at` 컬럼은 읽기 전용이며 표시 목적으로만 사용됩니다. 토큰을 발급할 때 Passport는 서명되고 암호화된 토큰 내에 만료 정보를 저장합니다. 토큰을 무효화해야 하는 경우 [토큰을 폐기](#revoking-tokens)해야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Passport에서 내부적으로 사용하는 모델을 자유롭게 확장할 수 있습니다. 자신만의 모델을 정의하고 해당 Passport 모델을 확장하면 됩니다.

```php
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

모델을 정의한 후, `Laravel\Passport\Passport` 클래스를 통해 Passport에게 커스텀 모델을 사용하도록 지시할 수 있습니다. 일반적으로 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 Passport에게 커스텀 모델에 대해 알려야 합니다.

```php
use App\Models\Passport\AuthCode;
use App\Models\Passport\Client;
use App\Models\Passport\DeviceCode;
use App\Models\Passport\RefreshToken;
use App\Models\Passport\Token;
use Laravel\Passport\Passport;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Passport::useTokenModel(Token::class);
    Passport::useRefreshTokenModel(RefreshToken::class);
    Passport::useAuthCodeModel(AuthCode::class);
    Passport::useClientModel(Client::class);
    Passport::useDeviceCodeModel(DeviceCode::class);
}
```

<a name="overriding-routes"></a>
### 라우트 오버라이드

때때로 Passport에서 정의한 라우트를 커스터마이징하고 싶을 수 있습니다. 이를 위해 먼저 애플리케이션의 `AppServiceProvider`의 `register` 메서드에 `Passport::ignoreRoutes`를 추가하여 Passport가 등록한 라우트를 무시해야 합니다.

```php
use Laravel\Passport\Passport;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    Passport::ignoreRoutes();
}
```

그런 다음, [라우트 파일](https://github.com/laravel/passport/blob/master/routes/web.php)에서 Passport가 정의한 라우트를 애플리케이션의 `routes/web.php` 파일에 복사하고 원하는 대로 수정할 수 있습니다.

```php
Route::group([
    'as' => 'passport.',
    'prefix' => config('passport.path', 'oauth'),
    'namespace' => '\Laravel\Passport\Http\Controllers',
], function () {
    // Passport 라우트...
});
```

<a name="authorization-code-grant"></a>
## 인가 코드 그랜트(Authorization Code Grant)

인가 코드를 통한 OAuth2 사용은 대부분의 개발자가 OAuth2에 익숙한 방식입니다. 인가 코드를 사용할 때, 클라이언트 애플리케이션은 사용자를 여러분의 서버로 리다이렉트하고, 거기서 사용자는 클라이언트에게 액세스 토큰을 발급하라는 요청을 승인하거나 거부합니다.

시작하려면 Passport에게 "인가" 뷰를 반환하는 방법을 알려줘야 합니다.

모든 인가 뷰의 렌더링 로직은 `Laravel\Passport\Passport` 클래스에서 사용 가능한 적절한 메서드를 사용하여 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```php
use Inertia\Inertia;
use Laravel\Passport\Passport;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    // 뷰 이름을 제공하여...
    Passport::authorizationView('auth.oauth.authorize');

    // 클로저를 제공하여...
    Passport::authorizationView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Authorize', [
            'request' => $parameters['request'],
            'authToken' => $parameters['authToken'],
            'client' => $parameters['client'],
            'user' => $parameters['user'],
            'scopes' => $parameters['scopes'],
        ])
    );
}
```

Passport는 자동으로 이 뷰를 반환하는 `/oauth/authorize` 라우트를 정의합니다. `auth.oauth.authorize` 템플릿에는 인가를 승인하기 위해 `passport.authorizations.approve` 라우트로 POST 요청을 보내는 폼과 인가를 거부하기 위해 `passport.authorizations.deny` 라우트로 DELETE 요청을 보내는 폼이 포함되어야 합니다. `passport.authorizations.approve`와 `passport.authorizations.deny` 라우트는 `state`, `client_id`, `auth_token` 필드를 기대합니다.

<a name="managing-clients"></a>
### 클라이언트 관리

애플리케이션의 API와 상호 작용해야 하는 애플리케이션을 개발하는 개발자들은 "클라이언트"를 생성하여 애플리케이션을 여러분의 애플리케이션에 등록해야 합니다. 일반적으로 이것은 애플리케이션의 이름과 사용자가 인가 요청을 승인한 후 리다이렉트할 수 있는 URI를 제공하는 것으로 구성됩니다.

<a name="managing-first-party-clients"></a>
#### 퍼스트 파티 클라이언트

클라이언트를 생성하는 가장 간단한 방법은 `passport:client` Artisan 명령어를 사용하는 것입니다. 이 명령어는 퍼스트 파티 클라이언트를 생성하거나 OAuth2 기능을 테스트하는 데 사용할 수 있습니다. `passport:client` 명령어를 실행하면 Passport가 클라이언트에 대한 추가 정보를 요청하고 클라이언트 ID와 시크릿을 제공합니다.

```shell
php artisan passport:client
```

클라이언트에 대해 여러 리다이렉트 URI를 허용하려면 `passport:client` 명령어에서 URI를 요청할 때 쉼표로 구분된 목록을 사용하여 지정할 수 있습니다. 쉼표가 포함된 URI는 URI 인코딩되어야 합니다.

```shell
https://third-party-app.com/callback,https://example.com/oauth/redirect
```

<a name="managing-third-party-clients"></a>
#### 서드 파티 클라이언트

애플리케이션의 사용자는 `passport:client` 명령어를 사용할 수 없으므로, `Laravel\Passport\ClientRepository` 클래스의 `createAuthorizationCodeGrantClient` 메서드를 사용하여 지정된 사용자에 대한 클라이언트를 등록할 수 있습니다.

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

// 지정된 사용자에게 속하는 OAuth 앱 클라이언트 생성...
$client = app(ClientRepository::class)->createAuthorizationCodeGrantClient(
    user: $user,
    name: 'Example App',
    redirectUris: ['https://third-party-app.com/callback'],
    confidential: false,
    enableDeviceFlow: true
);

// 사용자에게 속한 모든 OAuth 앱 클라이언트 조회...
$clients = $user->oauthApps()->get();
```

`createAuthorizationCodeGrantClient` 메서드는 `Laravel\Passport\Client` 인스턴스를 반환합니다. `$client->id`를 클라이언트 ID로, `$client->plainSecret`을 클라이언트 시크릿으로 사용자에게 표시할 수 있습니다.

<a name="requesting-tokens"></a>
### 토큰 요청하기

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### 인가를 위한 리다이렉트

클라이언트가 생성되면, 개발자는 클라이언트 ID와 시크릿을 사용하여 애플리케이션에서 인가 코드와 액세스 토큰을 요청할 수 있습니다. 먼저, 사용하는 애플리케이션은 다음과 같이 애플리케이션의 `/oauth/authorize` 라우트로 리다이렉트 요청을 해야 합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
        'state' => $state,
        // 'prompt' => '', // "none", "consent", 또는 "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

`prompt` 파라미터는 Passport 애플리케이션의 인증 동작을 지정하는 데 사용될 수 있습니다.

`prompt` 값이 `none`이면, 사용자가 이미 Passport 애플리케이션에서 인증되지 않은 경우 Passport는 항상 인증 오류를 발생시킵니다. 값이 `consent`이면, 모든 스코프가 이전에 사용하는 애플리케이션에 부여되었더라도 Passport는 항상 인가 승인 화면을 표시합니다. 값이 `login`이면, 이미 기존 세션이 있더라도 Passport 애플리케이션은 항상 사용자에게 애플리케이션에 다시 로그인하도록 요청합니다.

`prompt` 값이 제공되지 않으면, 사용자가 이전에 요청된 스코프에 대해 사용하는 애플리케이션에 대한 액세스를 인가하지 않은 경우에만 인가 요청을 받게 됩니다.

> [!NOTE]
> `/oauth/authorize` 라우트는 이미 Passport에 의해 정의되어 있습니다. 이 라우트를 수동으로 정의할 필요가 없습니다.

<a name="approving-the-request"></a>
#### 요청 승인하기

인가 요청을 받으면, Passport는 `prompt` 파라미터의 값(있는 경우)에 따라 자동으로 응답하고 사용자가 인가 요청을 승인하거나 거부할 수 있는 템플릿을 표시할 수 있습니다. 요청을 승인하면, 사용하는 애플리케이션이 지정한 `redirect_uri`로 다시 리다이렉트됩니다. `redirect_uri`는 클라이언트가 생성될 때 지정한 `redirect` URL과 일치해야 합니다.

때때로 퍼스트 파티 클라이언트를 인가할 때와 같이 인가 프롬프트를 건너뛰고 싶을 수 있습니다. 이는 [`Client` 모델을 확장](#overriding-default-models)하고 `skipsAuthorization` 메서드를 정의하여 수행할 수 있습니다. `skipsAuthorization`이 `true`를 반환하면 클라이언트가 승인되고, 사용하는 애플리케이션이 인가를 위해 리다이렉트할 때 `prompt` 파라미터를 명시적으로 설정하지 않는 한 사용자는 즉시 `redirect_uri`로 다시 리다이렉트됩니다.

```php
<?php

namespace App\Models\Passport;

use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * 클라이언트가 인가 프롬프트를 건너뛰어야 하는지 결정합니다.
     *
     * @param  \Laravel\Passport\Scope[]  $scopes
     */
    public function skipsAuthorization(Authenticatable $user, array $scopes): bool
    {
        return $this->firstParty();
    }
}
```

<a name="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### 인가 코드를 액세스 토큰으로 변환하기

사용자가 인가 요청을 승인하면, 사용하는 애플리케이션으로 다시 리다이렉트됩니다. 소비자는 먼저 리다이렉트 전에 저장된 값과 `state` 파라미터를 비교하여 확인해야 합니다. state 파라미터가 일치하면 소비자는 액세스 토큰을 요청하기 위해 애플리케이션에 `POST` 요청을 발행해야 합니다. 요청에는 사용자가 인가 요청을 승인할 때 애플리케이션이 발급한 인가 코드가 포함되어야 합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class,
        'Invalid state value.'
    );

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'code' => $request->code,
    ]);

    return $response->json();
});
```

이 `/oauth/token` 라우트는 `access_token`, `refresh_token`, `expires_in` 속성을 포함하는 JSON 응답을 반환합니다. `expires_in` 속성은 액세스 토큰이 만료될 때까지의 초 수를 포함합니다.

> [!NOTE]
> `/oauth/authorize` 라우트와 마찬가지로 `/oauth/token` 라우트는 Passport에 의해 정의됩니다. 이 라우트를 수동으로 정의할 필요가 없습니다.

<a name="managing-tokens"></a>
### 토큰 관리하기

`Laravel\Passport\HasApiTokens` 트레이트의 `tokens` 메서드를 사용하여 사용자의 인가된 토큰을 조회할 수 있습니다. 예를 들어, 이것은 사용자에게 서드 파티 애플리케이션과의 연결을 추적할 수 있는 대시보드를 제공하는 데 사용될 수 있습니다.

```php
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// 사용자의 모든 유효한 토큰 조회...
$tokens = $user->tokens()
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get();

// 서드 파티 OAuth 앱 클라이언트에 대한 모든 사용자 연결 조회...
$connections = $tokens->load('client')
    ->reject(fn (Token $token) => $token->client->firstParty())
    ->groupBy('client_id')
    ->map(fn (Collection $tokens) => [
        'client' => $tokens->first()->client,
        'scopes' => $tokens->pluck('scopes')->flatten()->unique()->values()->all(),
        'tokens_count' => $tokens->count(),
    ])
    ->values();
```

<a name="refreshing-tokens"></a>
### 토큰 갱신하기

애플리케이션이 짧은 수명의 액세스 토큰을 발급하는 경우, 사용자는 액세스 토큰이 발급될 때 제공된 리프레시 토큰을 통해 액세스 토큰을 갱신해야 합니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'refresh_token',
    'refresh_token' => 'the-refresh-token',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // 기밀 클라이언트에만 필요......
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

이 `/oauth/token` 라우트는 `access_token`, `refresh_token`, `expires_in` 속성을 포함하는 JSON 응답을 반환합니다. `expires_in` 속성은 액세스 토큰이 만료될 때까지의 초 수를 포함합니다.

<a name="revoking-tokens"></a>
### 토큰 폐기하기

`Laravel\Passport\Token` 모델의 `revoke` 메서드를 사용하여 토큰을 폐기할 수 있습니다. `Laravel\Passport\RefreshToken` 모델의 `revoke` 메서드를 사용하여 토큰의 리프레시 토큰을 폐기할 수 있습니다.

```php
use Laravel\Passport\Passport;
use Laravel\Passport\Token;

$token = Passport::token()->find($tokenId);

// 액세스 토큰 폐기...
$token->revoke();

// 토큰의 리프레시 토큰 폐기...
$token->refreshToken?->revoke();

// 사용자의 모든 토큰 폐기...
User::find($userId)->tokens()->each(function (Token $token) {
    $token->revoke();
    $token->refreshToken?->revoke();
});
```

<a name="purging-tokens"></a>
### 토큰 정리하기

토큰이 폐기되거나 만료되면 데이터베이스에서 정리하고 싶을 수 있습니다. Passport에 포함된 `passport:purge` Artisan 명령어가 이를 수행할 수 있습니다.

```shell
# 폐기되고 만료된 토큰, 인가 코드, 디바이스 코드 정리...
php artisan passport:purge

# 6시간 이상 만료된 토큰만 정리...
php artisan passport:purge --hours=6

# 폐기된 토큰, 인가 코드, 디바이스 코드만 정리...
php artisan passport:purge --revoked

# 만료된 토큰, 인가 코드, 디바이스 코드만 정리...
php artisan passport:purge --expired
```

애플리케이션의 `routes/console.php` 파일에서 [스케줄 작업](/docs/{{version}}/scheduling)을 설정하여 일정에 따라 토큰을 자동으로 정리할 수도 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('passport:purge')->hourly();
```

<a name="code-grant-pkce"></a>
## PKCE를 사용한 인가 코드 그랜트(Authorization Code Grant With PKCE)

"코드 교환을 위한 증명 키"(PKCE)를 사용하는 인가 코드 그랜트는 단일 페이지 애플리케이션이나 모바일 애플리케이션이 API에 액세스하기 위해 인증하는 안전한 방법입니다. 이 그랜트는 클라이언트 시크릿이 기밀로 저장될 것이라고 보장할 수 없거나, 공격자에 의해 인가 코드가 가로채지는 위협을 완화하기 위해 사용해야 합니다. 인가 코드를 액세스 토큰으로 교환할 때 "코드 검증자"와 "코드 챌린지"의 조합이 클라이언트 시크릿을 대체합니다.

<a name="creating-a-auth-pkce-grant-client"></a>
### 클라이언트 생성하기

애플리케이션이 PKCE를 사용한 인가 코드 그랜트를 통해 토큰을 발급하기 전에, PKCE가 활성화된 클라이언트를 생성해야 합니다. `passport:client` Artisan 명령어에 `--public` 옵션을 사용하여 이를 수행할 수 있습니다.

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### 토큰 요청하기

<a name="code-verifier-code-challenge"></a>
#### 코드 검증자와 코드 챌린지

이 인가 그랜트는 클라이언트 시크릿을 제공하지 않으므로, 개발자는 토큰을 요청하기 위해 코드 검증자와 코드 챌린지의 조합을 생성해야 합니다.

코드 검증자는 [RFC 7636 사양](https://tools.ietf.org/html/rfc7636)에 정의된 대로 문자, 숫자, `"-"`, `"."`, `"_"`, `"~"` 문자를 포함하는 43에서 128자 사이의 무작위 문자열이어야 합니다.

코드 챌린지는 URL 및 파일명 안전 문자를 가진 Base64 인코딩 문자열이어야 합니다. 후행 `'='` 문자는 제거되어야 하고 줄 바꿈, 공백 또는 기타 추가 문자가 없어야 합니다.

```php
$encoded = base64_encode(hash('sha256', $codeVerifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### 인가를 위한 리다이렉트

클라이언트가 생성되면, 클라이언트 ID와 생성된 코드 검증자 및 코드 챌린지를 사용하여 애플리케이션에서 인가 코드와 액세스 토큰을 요청할 수 있습니다. 먼저, 사용하는 애플리케이션은 애플리케이션의 `/oauth/authorize` 라우트로 리다이렉트 요청을 해야 합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $request->session()->put(
        'code_verifier', $codeVerifier = Str::random(128)
    );

    $codeChallenge = strtr(rtrim(
        base64_encode(hash('sha256', $codeVerifier, true))
    , '='), '+/', '-_');

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
        'state' => $state,
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
        // 'prompt' => '', // "none", "consent", 또는 "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="code-grant-pkce-converting-authorization-codes-to-access-tokens"></a>
#### 인가 코드를 액세스 토큰으로 변환하기

사용자가 인가 요청을 승인하면, 사용하는 애플리케이션으로 다시 리다이렉트됩니다. 소비자는 표준 인가 코드 그랜트에서와 같이 리다이렉트 전에 저장된 값과 `state` 파라미터를 비교하여 확인해야 합니다.

state 파라미터가 일치하면, 소비자는 액세스 토큰을 요청하기 위해 애플리케이션에 `POST` 요청을 발행해야 합니다. 요청에는 사용자가 인가 요청을 승인할 때 애플리케이션이 발급한 인가 코드와 함께 원래 생성된 코드 검증자가 포함되어야 합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    $codeVerifier = $request->session()->pull('code_verifier');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class
    );

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'code_verifier' => $codeVerifier,
        'code' => $request->code,
    ]);

    return $response->json();
});
```

<a name="device-authorization-grant"></a>
## 디바이스 인가 그랜트(Device Authorization Grant)

OAuth2 디바이스 인가 그랜트는 TV나 게임 콘솔과 같이 브라우저가 없거나 입력이 제한된 장치가 "디바이스 코드"를 교환하여 액세스 토큰을 얻을 수 있게 합니다. 디바이스 플로우를 사용할 때, 디바이스 클라이언트는 사용자에게 컴퓨터나 스마트폰과 같은 보조 장치를 사용하여 서버에 연결하고 제공된 "사용자 코드"를 입력하여 액세스 요청을 승인하거나 거부하도록 안내합니다.

시작하려면 Passport에게 "사용자 코드"와 "인가" 뷰를 반환하는 방법을 알려줘야 합니다.

모든 인가 뷰의 렌더링 로직은 `Laravel\Passport\Passport` 클래스에서 사용 가능한 적절한 메서드를 사용하여 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```php
use Inertia\Inertia;
use Laravel\Passport\Passport;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    // 뷰 이름을 제공하여...
    Passport::deviceUserCodeView('auth.oauth.device.user-code');
    Passport::deviceAuthorizationView('auth.oauth.device.authorize');

    // 클로저를 제공하여...
    Passport::deviceUserCodeView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Device/UserCode')
    );

    Passport::deviceAuthorizationView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Device/Authorize', [
            'request' => $parameters['request'],
            'authToken' => $parameters['authToken'],
            'client' => $parameters['client'],
            'user' => $parameters['user'],
            'scopes' => $parameters['scopes'],
        ])
    );

    // ...
}
```

Passport는 자동으로 이러한 뷰를 반환하는 라우트를 정의합니다. `auth.oauth.device.user-code` 템플릿에는 `passport.device.authorizations.authorize` 라우트로 GET 요청을 보내는 폼이 포함되어야 합니다. `passport.device.authorizations.authorize` 라우트는 `user_code` 쿼리 파라미터를 기대합니다.

`auth.oauth.device.authorize` 템플릿에는 인가를 승인하기 위해 `passport.device.authorizations.approve` 라우트로 POST 요청을 보내는 폼과 인가를 거부하기 위해 `passport.device.authorizations.deny` 라우트로 DELETE 요청을 보내는 폼이 포함되어야 합니다. `passport.device.authorizations.approve`와 `passport.device.authorizations.deny` 라우트는 `state`, `client_id`, `auth_token` 필드를 기대합니다.

<a name="creating-a-device-authorization-grant-client"></a>
### 디바이스 인가 그랜트 클라이언트 생성하기

애플리케이션이 디바이스 인가 그랜트를 통해 토큰을 발급하기 전에, 디바이스 플로우가 활성화된 클라이언트를 생성해야 합니다. `passport:client` Artisan 명령어에 `--device` 옵션을 사용하여 이를 수행할 수 있습니다. 이 명령어는 퍼스트 파티 디바이스 플로우 활성화 클라이언트를 생성하고 클라이언트 ID와 시크릿을 제공합니다.

```shell
php artisan passport:client --device
```

또한, `ClientRepository` 클래스의 `createDeviceAuthorizationGrantClient` 메서드를 사용하여 지정된 사용자에게 속하는 서드 파티 클라이언트를 등록할 수 있습니다.

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

$client = app(ClientRepository::class)->createDeviceAuthorizationGrantClient(
    user: $user,
    name: 'Example Device',
    confidential: false,
);
```

<a name="requesting-device-authorization-grant-tokens"></a>
### 토큰 요청하기

<a name="device-code"></a>
#### 디바이스 코드 요청하기

클라이언트가 생성되면, 개발자는 클라이언트 ID를 사용하여 애플리케이션에서 디바이스 코드를 요청할 수 있습니다. 먼저, 사용하는 장치는 디바이스 코드를 요청하기 위해 애플리케이션의 `/oauth/device/code` 라우트로 `POST` 요청을 해야 합니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/device/code', [
    'client_id' => 'your-client-id',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

이것은 `device_code`, `user_code`, `verification_uri`, `interval`, `expires_in` 속성을 포함하는 JSON 응답을 반환합니다. `expires_in` 속성은 디바이스 코드가 만료될 때까지의 초 수를 포함합니다. `interval` 속성은 속도 제한 오류를 피하기 위해 `/oauth/token` 라우트를 폴링할 때 사용하는 장치가 요청 사이에 기다려야 하는 초 수를 포함합니다.

> [!NOTE]
> `/oauth/device/code` 라우트는 이미 Passport에 의해 정의되어 있습니다. 이 라우트를 수동으로 정의할 필요가 없습니다.

<a name="user-code"></a>
#### 검증 URI와 사용자 코드 표시하기

디바이스 코드 요청이 획득되면, 사용하는 장치는 사용자에게 다른 장치를 사용하여 제공된 `verification_uri`를 방문하고 인가 요청을 승인하기 위해 `user_code`를 입력하도록 안내해야 합니다.

<a name="polling-token-request"></a>
#### 토큰 요청 폴링

사용자가 별도의 장치를 사용하여 액세스를 부여(또는 거부)하므로, 사용하는 장치는 사용자가 요청에 응답했는지 확인하기 위해 애플리케이션의 `/oauth/token` 라우트를 폴링해야 합니다. 사용하는 장치는 속도 제한 오류를 피하기 위해 디바이스 코드를 요청할 때 JSON 응답에 제공된 최소 폴링 `interval`을 사용해야 합니다.

```php
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;

$interval = 5;

do {
    Sleep::for($interval)->seconds();

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'urn:ietf:params:oauth:grant-type:device_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret', // 기밀 클라이언트에만 필요...
        'device_code' => 'the-device-code',
    ]);

    if ($response->json('error') === 'slow_down') {
        $interval += 5;
    }
} while (in_array($response->json('error'), ['authorization_pending', 'slow_down']));

return $response->json();
```

사용자가 인가 요청을 승인하면, 이것은 `access_token`, `refresh_token`, `expires_in` 속성을 포함하는 JSON 응답을 반환합니다. `expires_in` 속성은 액세스 토큰이 만료될 때까지의 초 수를 포함합니다.

<a name="password-grant"></a>
## 패스워드 그랜트(Password Grant)

> [!WARNING]
> 더 이상 패스워드 그랜트 토큰 사용을 권장하지 않습니다. 대신 [OAuth2 서버에서 현재 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 선택해야 합니다.

OAuth2 패스워드 그랜트는 모바일 애플리케이션과 같은 다른 퍼스트 파티 클라이언트가 이메일 주소/사용자명과 비밀번호를 사용하여 액세스 토큰을 얻을 수 있게 합니다. 이를 통해 사용자가 전체 OAuth2 인가 코드 리다이렉트 플로우를 거치지 않고도 퍼스트 파티 클라이언트에 안전하게 액세스 토큰을 발급할 수 있습니다.

패스워드 그랜트를 활성화하려면 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `enablePasswordGrant` 메서드를 호출하세요.

```php
/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Passport::enablePasswordGrant();
}
```

<a name="creating-a-password-grant-client"></a>
### 패스워드 그랜트 클라이언트 생성하기

애플리케이션이 패스워드 그랜트를 통해 토큰을 발급하기 전에, 패스워드 그랜트 클라이언트를 생성해야 합니다. `passport:client` Artisan 명령어에 `--password` 옵션을 사용하여 이를 수행할 수 있습니다.

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### 토큰 요청하기

그랜트를 활성화하고 패스워드 그랜트 클라이언트를 생성하면, 사용자의 이메일 주소와 비밀번호로 `/oauth/token` 라우트에 `POST` 요청을 발행하여 액세스 토큰을 요청할 수 있습니다. 이 라우트는 이미 Passport에 의해 등록되어 있으므로 수동으로 정의할 필요가 없습니다. 요청이 성공하면 서버로부터 JSON 응답으로 `access_token`과 `refresh_token`을 받게 됩니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // 기밀 클라이언트에만 필요...
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

> [!NOTE]
> 액세스 토큰은 기본적으로 장기간 유효합니다. 그러나 필요한 경우 [최대 액세스 토큰 수명을 자유롭게 설정](#configuration)할 수 있습니다.

<a name="requesting-all-scopes"></a>
### 모든 스코프 요청하기

패스워드 그랜트 또는 클라이언트 자격증명 그랜트를 사용할 때, 애플리케이션이 지원하는 모든 스코프에 대해 토큰을 인가하고 싶을 수 있습니다. `*` 스코프를 요청하여 이를 수행할 수 있습니다. `*` 스코프를 요청하면, 토큰 인스턴스의 `can` 메서드는 항상 `true`를 반환합니다. 이 스코프는 `password` 또는 `client_credentials` 그랜트를 사용하여 발급된 토큰에만 할당될 수 있습니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // 기밀 클라이언트에만 필요...
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => '*',
]);
```

<a name="customizing-the-user-provider"></a>
### 사용자 프로바이더 커스터마이징

애플리케이션이 둘 이상의 [인증 사용자 프로바이더](/docs/{{version}}/authentication#introduction)를 사용하는 경우, `artisan passport:client --password` 명령어를 통해 클라이언트를 생성할 때 `--provider` 옵션을 제공하여 패스워드 그랜트 클라이언트가 사용하는 사용자 프로바이더를 지정할 수 있습니다. 지정된 프로바이더 이름은 애플리케이션의 `config/auth.php` 설정 파일에 정의된 유효한 프로바이더와 일치해야 합니다. 그런 다음 [미들웨어를 사용하여 라우트를 보호](#multiple-authentication-guards)하여 가드에 지정된 프로바이더의 사용자만 인가되도록 할 수 있습니다.

<a name="customizing-the-username-field"></a>
### 사용자명 필드 커스터마이징

패스워드 그랜트를 사용하여 인증할 때, Passport는 인증 가능한 모델의 `email` 속성을 "사용자명"으로 사용합니다. 그러나 모델에 `findForPassport` 메서드를 정의하여 이 동작을 커스터마이징할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Bridge\Client;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * 주어진 사용자명으로 사용자 인스턴스를 찾습니다.
     */
    public function findForPassport(string $username, Client $client): User
    {
        return $this->where('username', $username)->first();
    }
}
```

<a name="customizing-the-password-validation"></a>
### 비밀번호 유효성 검사 커스터마이징

패스워드 그랜트를 사용하여 인증할 때, Passport는 모델의 `password` 속성을 사용하여 주어진 비밀번호를 검증합니다. 모델에 `password` 속성이 없거나 비밀번호 유효성 검사 로직을 커스터마이징하려면 모델에 `validateForPassportPasswordGrant` 메서드를 정의할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Passport 패스워드 그랜트를 위해 사용자의 비밀번호를 검증합니다.
     */
    public function validateForPassportPasswordGrant(string $password): bool
    {
        return Hash::check($password, $this->password);
    }
}
```

<a name="implicit-grant"></a>
## 암시적 그랜트(Implicit Grant)

> [!WARNING]
> 더 이상 암시적 그랜트 토큰 사용을 권장하지 않습니다. 대신 [OAuth2 서버에서 현재 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 선택해야 합니다.

암시적 그랜트는 인가 코드 그랜트와 유사하지만, 인가 코드를 교환하지 않고 토큰이 클라이언트에 반환됩니다. 이 그랜트는 클라이언트 자격증명이 안전하게 저장될 수 없는 JavaScript 또는 모바일 애플리케이션에 가장 일반적으로 사용됩니다. 그랜트를 활성화하려면 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `enableImplicitGrant` 메서드를 호출하세요.

```php
/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Passport::enableImplicitGrant();
}
```

애플리케이션이 암시적 그랜트를 통해 토큰을 발급하기 전에, 암시적 그랜트 클라이언트를 생성해야 합니다. `passport:client` Artisan 명령어에 `--implicit` 옵션을 사용하여 이를 수행할 수 있습니다.

```shell
php artisan passport:client --implicit
```

그랜트가 활성화되고 암시적 클라이언트가 생성되면, 개발자는 클라이언트 ID를 사용하여 애플리케이션에서 액세스 토큰을 요청할 수 있습니다. 사용하는 애플리케이션은 다음과 같이 애플리케이션의 `/oauth/authorize` 라우트로 리다이렉트 요청을 해야 합니다.

```php
use Illuminate\Http\Request;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'token',
        'scope' => 'user:read orders:create',
        'state' => $state,
        // 'prompt' => '', // "none", "consent", 또는 "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

> [!NOTE]
> `/oauth/authorize` 라우트는 이미 Passport에 의해 정의되어 있습니다. 이 라우트를 수동으로 정의할 필요가 없습니다.

<a name="client-credentials-grant"></a>
## 클라이언트 자격증명 그랜트(Client Credentials Grant)

클라이언트 자격증명 그랜트는 머신 대 머신 인증에 적합합니다. 예를 들어, API를 통해 유지 관리 작업을 수행하는 스케줄 작업에서 이 그랜트를 사용할 수 있습니다.

애플리케이션이 클라이언트 자격증명 그랜트를 통해 토큰을 발급하기 전에, 클라이언트 자격증명 그랜트 클라이언트를 생성해야 합니다. `passport:client` Artisan 명령어에 `--client` 옵션을 사용하여 이를 수행할 수 있습니다.

```shell
php artisan passport:client --client
```

다음으로, `Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner` 미들웨어를 라우트에 할당하세요.

```php
use Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner;

Route::get('/orders', function (Request $request) {
    // 액세스 토큰이 유효하고 클라이언트가 리소스 소유자입니다...
})->middleware(EnsureClientIsResourceOwner::class);
```

특정 스코프로 라우트에 대한 액세스를 제한하려면 `using` 메서드에 필요한 스코프 목록을 제공할 수 있습니다.

```php
Route::get('/orders', function (Request $request) {
    // 액세스 토큰이 유효하고, 클라이언트가 리소스 소유자이며, "servers:read"와 "servers:create" 스코프를 모두 가지고 있습니다...
})->middleware(EnsureClientIsResourceOwner::using('servers:read', 'servers:create'));
```

> [!WARNING]
> [기반이 되는 OAuth2 서버](https://oauth2.thephpleague.com/database-setup/#:~:text=Please%20note%20that,the%20bearer%20token.)는 클라이언트 자격 증명 토큰의 `sub` 클레임을 클라이언트의 식별자로 설정합니다. 기본적으로 Passport는 클라이언트에 UUID를 사용하므로 사용자의 정수 기본 키와 충돌할 수 없습니다. 그러나 `Passport::$clientUuids`를 `false`로 설정한 경우, 클라이언트 자격 증명 토큰이 클라이언트의 ID와 일치하는 사용자를 의도치 않게 해석할 수 있습니다. 이러한 경우 이 미들웨어를 사용해도 들어오는 토큰이 클라이언트 자격 증명 토큰인지 보장할 수 없습니다.

<a name="retrieving-tokens"></a>
### 토큰 조회하기

이 그랜트 타입을 사용하여 토큰을 조회하려면 `oauth/token` 엔드포인트로 요청하세요.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'client_credentials',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret',
    'scope' => 'servers:read servers:create',
]);

return $response->json()['access_token'];
```

<a name="personal-access-tokens"></a>
## 개인용 액세스 토큰(Personal Access Tokens)

때때로 사용자는 일반적인 인가 코드 리다이렉트 플로우를 거치지 않고 자신에게 액세스 토큰을 발급하고 싶어할 수 있습니다. 애플리케이션의 UI를 통해 사용자가 자신에게 토큰을 발급할 수 있게 하면 사용자가 API를 실험하는 데 유용하거나 일반적으로 액세스 토큰을 발급하는 더 간단한 접근 방식으로 활용될 수 있습니다.

> [!NOTE]
> 애플리케이션이 주로 개인용 액세스 토큰을 발급하기 위해 Passport를 사용한다면, API 액세스 토큰을 발급하기 위한 Laravel의 경량 퍼스트 파티 라이브러리인 [Laravel Sanctum](/docs/{{version}}/sanctum) 사용을 고려해 보세요.

<a name="creating-a-personal-access-client"></a>
### 개인용 액세스 클라이언트 생성하기

애플리케이션이 개인용 액세스 토큰을 발급하기 전에, 개인용 액세스 클라이언트를 생성해야 합니다. `passport:client` Artisan 명령어에 `--personal` 옵션을 사용하여 이를 수행할 수 있습니다. 이미 `passport:install` 명령어를 실행했다면 이 명령어를 실행할 필요가 없습니다.

```shell
php artisan passport:client --personal
```

<a name="customizing-the-user-provider-for-pat"></a>
### 사용자 프로바이더 커스터마이징

애플리케이션이 둘 이상의 [인증 사용자 프로바이더](/docs/{{version}}/authentication#introduction)를 사용하는 경우, `artisan passport:client --personal` 명령어를 통해 클라이언트를 생성할 때 `--provider` 옵션을 제공하여 개인용 액세스 그랜트 클라이언트가 사용하는 사용자 프로바이더를 지정할 수 있습니다. 지정된 프로바이더 이름은 애플리케이션의 `config/auth.php` 설정 파일에 정의된 유효한 프로바이더와 일치해야 합니다. 그런 다음 [미들웨어를 사용하여 라우트를 보호](#multiple-authentication-guards)하여 가드에 지정된 프로바이더의 사용자만 인가되도록 할 수 있습니다.

<a name="managing-personal-access-tokens"></a>
### 개인용 액세스 토큰 관리하기

개인용 액세스 클라이언트를 생성하면, `App\Models\User` 모델 인스턴스의 `createToken` 메서드를 사용하여 주어진 사용자에 대한 토큰을 발급할 수 있습니다. `createToken` 메서드는 첫 번째 인자로 토큰의 이름을, 두 번째 인자로 선택적 [스코프](#token-scopes) 배열을 받습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// 스코프 없이 토큰 생성...
$token = $user->createToken('My Token')->accessToken;

// 스코프를 가진 토큰 생성...
$token = $user->createToken('My Token', ['user:read', 'orders:create'])->accessToken;

// 모든 스코프를 가진 토큰 생성...
$token = $user->createToken('My Token', ['*'])->accessToken;

// 사용자에게 속한 모든 유효한 개인용 액세스 토큰 조회...
$tokens = $user->tokens()
    ->with('client')
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get()
    ->filter(fn (Token $token) => $token->client->hasGrantType('personal_access'));
```

<a name="protecting-routes"></a>
## 라우트 보호하기

<a name="via-middleware"></a>
### 미들웨어를 통한 보호

Passport에는 들어오는 요청에서 액세스 토큰을 검증하는 [인증 가드](/docs/{{version}}/authentication#adding-custom-guards)가 포함되어 있습니다. `api` 가드가 `passport` 드라이버를 사용하도록 설정하면, 유효한 액세스 토큰이 필요한 라우트에 `auth:api` 미들웨어만 지정하면 됩니다.

```php
Route::get('/user', function () {
    // API 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('auth:api');
```

> [!WARNING]
> [클라이언트 자격증명 그랜트](#client-credentials-grant)를 사용하는 경우, `auth:api` 미들웨어 대신 [`Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner` 미들웨어](#client-credentials-grant)를 사용하여 라우트를 보호해야 합니다.

<a name="multiple-authentication-guards"></a>
#### 다중 인증 가드

애플리케이션이 완전히 다른 Eloquent 모델을 사용할 수 있는 다양한 유형의 사용자를 인증하는 경우, 애플리케이션의 각 사용자 프로바이더 유형에 대해 가드 설정을 정의해야 할 것입니다. 이를 통해 특정 사용자 프로바이더를 위한 요청을 보호할 수 있습니다. 예를 들어, `config/auth.php` 설정 파일에 다음 가드 설정이 있다면:

```php
'guards' => [
    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],

    'api-customers' => [
        'driver' => 'passport',
        'provider' => 'customers',
    ],
],
```

다음 라우트는 `customers` 사용자 프로바이더를 사용하는 `api-customers` 가드를 활용하여 들어오는 요청을 인증합니다.

```php
Route::get('/customer', function () {
    // ...
})->middleware('auth:api-customers');
```

> [!NOTE]
> Passport와 함께 여러 사용자 프로바이더를 사용하는 방법에 대한 자세한 내용은 [개인용 액세스 토큰 문서](#customizing-the-user-provider-for-pat)와 [패스워드 그랜트 문서](#customizing-the-user-provider)를 참조하세요.

<a name="passing-the-access-token"></a>
### 액세스 토큰 전달하기

Passport로 보호된 라우트를 호출할 때, 애플리케이션의 API 소비자는 요청의 `Authorization` 헤더에 `Bearer` 토큰으로 액세스 토큰을 지정해야 합니다. 예를 들어, `Http` 파사드를 사용할 때:

```php
use Illuminate\Support\Facades\Http;

$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Authorization' => "Bearer $accessToken",
])->get('https://passport-app.test/api/user');

return $response->json();
```

<a name="token-scopes"></a>
## 토큰 스코프(Token Scopes)

스코프를 사용하면 API 클라이언트가 계정에 대한 액세스 인가를 요청할 때 특정 권한 집합을 요청할 수 있습니다. 예를 들어, 이커머스 애플리케이션을 구축하는 경우, 모든 API 소비자가 주문을 할 수 있는 기능이 필요한 것은 아닙니다. 대신 소비자에게 주문 배송 상태에 대한 액세스만 요청하도록 허용할 수 있습니다. 즉, 스코프를 사용하면 애플리케이션 사용자가 서드 파티 애플리케이션이 자신을 대신하여 수행할 수 있는 작업을 제한할 수 있습니다.

<a name="defining-scopes"></a>
### 스코프 정의하기

애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `Passport::tokensCan` 메서드를 사용하여 API의 스코프를 정의할 수 있습니다. `tokensCan` 메서드는 스코프 이름과 스코프 설명의 배열을 받습니다. 스코프 설명은 원하는 대로 작성할 수 있으며 인가 승인 화면에서 사용자에게 표시됩니다.

```php
/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Passport::tokensCan([
        'user:read' => 'Retrieve the user info',
        'orders:create' => 'Place orders',
        'orders:read:status' => 'Check order status',
    ]);
}
```

<a name="default-scope"></a>
### 기본 스코프

클라이언트가 특정 스코프를 요청하지 않으면, `defaultScopes` 메서드를 사용하여 Passport 서버가 토큰에 기본 스코프를 첨부하도록 설정할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```php
use Laravel\Passport\Passport;

Passport::tokensCan([
    'user:read' => 'Retrieve the user info',
    'orders:create' => 'Place orders',
    'orders:read:status' => 'Check order status',
]);

Passport::defaultScopes([
    'user:read',
    'orders:create',
]);
```

<a name="assigning-scopes-to-tokens"></a>
### 토큰에 스코프 할당하기

<a name="when-requesting-authorization-codes"></a>
#### 인가 코드 요청 시

인가 코드 그랜트를 사용하여 액세스 토큰을 요청할 때, 소비자는 원하는 스코프를 `scope` 쿼리 문자열 파라미터로 지정해야 합니다. `scope` 파라미터는 공백으로 구분된 스코프 목록이어야 합니다.

```php
Route::get('/redirect', function () {
    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="when-issuing-personal-access-tokens"></a>
#### 개인용 액세스 토큰 발급 시

`App\Models\User` 모델의 `createToken` 메서드를 사용하여 개인용 액세스 토큰을 발급하는 경우, 메서드의 두 번째 인자로 원하는 스코프 배열을 전달할 수 있습니다.

```php
$token = $user->createToken('My Token', ['orders:create'])->accessToken;
```

<a name="checking-scopes"></a>
### 스코프 확인하기

Passport에는 들어오는 요청이 주어진 스코프가 부여된 토큰으로 인증되었는지 확인하는 데 사용할 수 있는 두 개의 미들웨어가 포함되어 있습니다.

<a name="check-for-all-scopes"></a>
#### 모든 스코프 확인

`Laravel\Passport\Http\Middleware\CheckToken` 미들웨어는 들어오는 요청의 액세스 토큰이 나열된 모든 스코프를 가지고 있는지 확인하기 위해 라우트에 할당될 수 있습니다.

```php
use Laravel\Passport\Http\Middleware\CheckToken;

Route::get('/orders', function () {
    // 액세스 토큰이 "orders:read"와 "orders:create" 스코프를 모두 가지고 있습니다...
})->middleware(['auth:api', CheckToken::using('orders:read', 'orders:create')]);
```

<a name="check-for-any-scopes"></a>
#### 스코프 중 하나 확인

`Laravel\Passport\Http\Middleware\CheckTokenForAnyScope` 미들웨어는 들어오는 요청의 액세스 토큰이 나열된 스코프 중 *적어도 하나*를 가지고 있는지 확인하기 위해 라우트에 할당될 수 있습니다.

```php
use Laravel\Passport\Http\Middleware\CheckTokenForAnyScope;

Route::get('/orders', function () {
    // 액세스 토큰이 "orders:read" 또는 "orders:create" 스코프를 가지고 있습니다...
})->middleware(['auth:api', CheckTokenForAnyScope::using('orders:read', 'orders:create')]);
```

<a name="scope-attributes"></a>
#### 스코프 속성(Scope Attributes)

애플리케이션이 [컨트롤러 미들웨어 속성](/docs/{{version}}/controllers#middleware-attributes)을 사용하는 경우, `Laravel\Passport\Attributes\AuthorizeToken` 속성을 Passport의 스코프 미들웨어에 대한 편리한 단축키로 사용할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Laravel\Passport\Attributes\AuthorizeToken;

#[AuthorizeToken('orders:read')]
#[AuthorizeToken('orders:create', only: ['store'])]
class OrderController
{
    #[AuthorizeToken(['orders:read', 'orders:create'], anyScope: true)]
    public function index()
    {
        // 액세스 토큰이 "orders:read" 또는 "orders:create" 스코프를 가지고 있습니다...
    }

    public function store()
    {
        // 액세스 토큰이 "orders:read"와 "orders:create" 스코프를 모두 가지고 있습니다...
    }
}
```

기본적으로 `AuthorizeToken` 속성은 주어진 모든 스코프를 요구합니다. `anyScope: true`를 전달하면 토큰이 주어진 스코프 중 하나 이상을 가지고 있을 때 요청이 허용됩니다.

<a name="checking-scopes-on-a-token-instance"></a>
#### 토큰 인스턴스에서 스코프 확인하기

액세스 토큰으로 인증된 요청이 애플리케이션에 들어오면, 인증된 `App\Models\User` 인스턴스의 `tokenCan` 메서드를 사용하여 토큰이 주어진 스코프를 가지고 있는지 확인할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('orders:create')) {
        // ...
    }
});
```

<a name="additional-scope-methods"></a>
#### 추가 스코프 메서드

`scopeIds` 메서드는 정의된 모든 ID/이름의 배열을 반환합니다.

```php
use Laravel\Passport\Passport;

Passport::scopeIds();
```

`scopes` 메서드는 정의된 모든 스코프를 `Laravel\Passport\Scope` 인스턴스 배열로 반환합니다.

```php
Passport::scopes();
```

`scopesFor` 메서드는 주어진 ID/이름과 일치하는 `Laravel\Passport\Scope` 인스턴스 배열을 반환합니다.

```php
Passport::scopesFor(['user:read', 'orders:create']);
```

`hasScope` 메서드를 사용하여 주어진 스코프가 정의되었는지 확인할 수 있습니다.

```php
Passport::hasScope('orders:create');
```

<a name="spa-authentication"></a>
## SPA 인증

API를 구축할 때 JavaScript 애플리케이션에서 자체 API를 사용할 수 있으면 매우 유용할 수 있습니다. 이러한 API 개발 접근 방식을 통해 자신의 애플리케이션이 세계와 공유하는 동일한 API를 사용할 수 있습니다. 동일한 API가 웹 애플리케이션, 모바일 애플리케이션, 서드 파티 애플리케이션, 그리고 다양한 패키지 관리자에서 발행할 수 있는 모든 SDK에서 사용될 수 있습니다.

일반적으로 JavaScript 애플리케이션에서 API를 사용하려면 액세스 토큰을 애플리케이션에 수동으로 전송하고 각 요청과 함께 전달해야 합니다. 그러나 Passport에는 이를 처리할 수 있는 미들웨어가 포함되어 있습니다. 애플리케이션의 `bootstrap/app.php` 파일에서 `web` 미들웨어 그룹에 `CreateFreshApiToken` 미들웨어를 추가하기만 하면 됩니다.

```php
use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        CreateFreshApiToken::class,
    ]);
})
```

> [!WARNING]
> `CreateFreshApiToken` 미들웨어가 미들웨어 스택에서 마지막으로 나열되도록 해야 합니다.

이 미들웨어는 나가는 응답에 `laravel_token` 쿠키를 첨부합니다. 이 쿠키에는 Passport가 JavaScript 애플리케이션의 API 요청을 인증하는 데 사용할 암호화된 JWT가 포함되어 있습니다. JWT의 수명은 `session.lifetime` 설정 값과 동일합니다. 이제 브라우저가 모든 후속 요청과 함께 쿠키를 자동으로 전송하므로, 액세스 토큰을 명시적으로 전달하지 않고도 애플리케이션의 API에 요청할 수 있습니다.

```js
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a name="customizing-the-cookie-name"></a>
#### 쿠키 이름 커스터마이징

필요한 경우 `Passport::cookie` 메서드를 사용하여 `laravel_token` 쿠키의 이름을 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```php
/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Passport::cookie('custom_name');
}
```

<a name="csrf-protection"></a>
#### CSRF 보호

이 인증 방법을 사용할 때 요청에 유효한 CSRF 토큰 헤더가 포함되어 있는지 확인해야 합니다. 스켈레톤 애플리케이션과 모든 스타터 킷에 포함된 기본 Laravel JavaScript 스캐폴딩에는 [Axios](https://github.com/axios/axios) 인스턴스가 포함되어 있으며, 이 인스턴스는 동일 출처 요청에서 암호화된 `XSRF-TOKEN` 쿠키 값을 사용하여 `X-XSRF-TOKEN` 헤더를 자동으로 전송합니다.

> [!NOTE]
> `X-XSRF-TOKEN` 대신 `X-CSRF-TOKEN` 헤더를 전송하려면 `csrf_token()`이 제공하는 암호화되지 않은 토큰을 사용해야 합니다.

<a name="events"></a>
## 이벤트

Passport는 액세스 토큰과 리프레시 토큰을 발급할 때 이벤트를 발생시킵니다. 데이터베이스에서 다른 액세스 토큰을 정리하거나 폐기하기 위해 [이러한 이벤트를 수신](/docs/{{version}}/events)할 수 있습니다.

<div class="overflow-auto">

| 이벤트 이름                                    |
| --------------------------------------------- |
| `Laravel\Passport\Events\AccessTokenCreated`  |
| `Laravel\Passport\Events\AccessTokenRevoked`  |
| `Laravel\Passport\Events\RefreshTokenCreated` |

</div>

<a name="testing"></a>
## 테스팅

Passport의 `actingAs` 메서드를 사용하여 현재 인증된 사용자와 해당 스코프를 지정할 수 있습니다. `actingAs` 메서드의 첫 번째 인자는 사용자 인스턴스이고 두 번째 인자는 사용자의 토큰에 부여해야 할 스코프 배열입니다.

```php tab=Pest
use App\Models\User;
use Laravel\Passport\Passport;

test('orders can be created', function () {
    Passport::actingAs(
        User::factory()->create(),
        ['orders:create']
    );

    $response = $this->post('/api/orders');

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Passport\Passport;

public function test_orders_can_be_created(): void
{
    Passport::actingAs(
        User::factory()->create(),
        ['orders:create']
    );

    $response = $this->post('/api/orders');

    $response->assertStatus(201);
}
```

Passport의 `actingAsClient` 메서드를 사용하여 현재 인증된 클라이언트와 해당 스코프를 지정할 수 있습니다. `actingAsClient` 메서드의 첫 번째 인자는 클라이언트 인스턴스이고 두 번째 인자는 클라이언트의 토큰에 부여해야 할 스코프 배열입니다.

```php tab=Pest
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

test('servers can be retrieved', function () {
    Passport::actingAsClient(
        Client::factory()->create(),
        ['servers:read']
    );

    $response = $this->get('/api/servers');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

public function test_servers_can_be_retrieved(): void
{
    Passport::actingAsClient(
        Client::factory()->create(),
        ['servers:read']
    );

    $response = $this->get('/api/servers');

    $response->assertStatus(200);
}
```

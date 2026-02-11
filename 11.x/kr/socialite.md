# Laravel Socialite

- [소개](#introduction)
- [설치](#installation)
- [Socialite 업그레이드](#upgrading-socialite)
- [설정](#configuration)
- [인증](#authentication)
    - [라우팅](#routing)
    - [인증 및 저장](#authentication-and-storage)
    - [액세스 스코프](#access-scopes)
    - [Slack 봇 스코프](#slack-bot-scopes)
    - [선택적 매개변수](#optional-parameters)
- [사용자 정보 조회](#retrieving-user-details)

<a name="introduction"></a>
## 소개

Laravel은 일반적인 폼 기반 인증 외에도, [Laravel Socialite](https://github.com/laravel/socialite)를 사용하여 OAuth 제공자를 통해 간단하고 편리하게 인증할 수 있는 방법을 제공합니다. Socialite는 현재 Facebook, X, LinkedIn, Google, GitHub, GitLab, Bitbucket, Slack을 통한 인증을 지원합니다.

> [!NOTE]
> 다른 플랫폼용 어댑터는 커뮤니티 기반의 [Socialite Providers](https://socialiteproviders.com/) 웹사이트에서 확인할 수 있습니다.

<a name="installation"></a>
## 설치

Socialite를 시작하려면 Composer 패키지 매니저를 사용하여 프로젝트의 의존성에 패키지를 추가하세요.

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
## Socialite 업그레이드

Socialite의 새로운 메이저 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/socialite/blob/master/UPGRADE.md)를 꼼꼼히 검토하는 것이 중요합니다.

<a name="configuration"></a>
## 설정

Socialite를 사용하기 전에, 애플리케이션에서 사용할 OAuth 제공자의 자격 증명을 추가해야 합니다. 일반적으로 이러한 자격 증명은 인증에 사용할 서비스의 대시보드에서 "개발자 애플리케이션"을 생성하여 얻을 수 있습니다.

이러한 자격 증명은 애플리케이션의 `config/services.php` 설정 파일에 배치해야 하며, 애플리케이션에서 필요로 하는 제공자에 따라 `facebook`, `x`, `linkedin-openid`, `google`, `github`, `gitlab`, `bitbucket`, `slack`, 또는 `slack-openid` 키를 사용해야 합니다.

```php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => 'http://example.com/callback-url',
],
```

> [!NOTE]
> `redirect` 옵션에 상대 경로가 포함된 경우, 자동으로 완전한 URL로 변환됩니다.

<a name="authentication"></a>
## 인증

<a name="routing"></a>
### 라우팅

OAuth 제공자를 사용하여 사용자를 인증하려면 두 개의 라우트가 필요합니다. 하나는 사용자를 OAuth 제공자로 리디렉션하는 것이고, 다른 하나는 인증 후 제공자로부터 콜백을 받는 것입니다. 아래 예제 라우트는 두 라우트의 구현을 보여줍니다.

```php
use Laravel\Socialite\Facades\Socialite;

Route::get('/auth/redirect', function () {
    return Socialite::driver('github')->redirect();
});

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // $user->token
});
```

`Socialite` 파사드가 제공하는 `redirect` 메서드는 사용자를 OAuth 제공자로 리디렉션하는 것을 처리하며, `user` 메서드는 들어오는 요청을 검사하고 인증 요청을 승인한 후 제공자로부터 사용자 정보를 조회합니다.

<a name="authentication-and-storage"></a>
### 인증 및 저장

OAuth 제공자로부터 사용자를 조회한 후, 해당 사용자가 애플리케이션의 데이터베이스에 존재하는지 확인하고 [사용자를 인증](/docs/{{version}}/authentication#authenticate-a-user-instance)할 수 있습니다. 사용자가 애플리케이션의 데이터베이스에 존재하지 않는 경우, 일반적으로 데이터베이스에 사용자를 나타내는 새 레코드를 생성합니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

Route::get('/auth/callback', function () {
    $githubUser = Socialite::driver('github')->user();

    $user = User::updateOrCreate([
        'github_id' => $githubUser->id,
    ], [
        'name' => $githubUser->name,
        'email' => $githubUser->email,
        'github_token' => $githubUser->token,
        'github_refresh_token' => $githubUser->refreshToken,
    ]);

    Auth::login($user);

    return redirect('/dashboard');
});
```

> [!NOTE]
> 특정 OAuth 제공자에서 사용할 수 있는 사용자 정보에 대한 자세한 내용은 [사용자 정보 조회](#retrieving-user-details) 문서를 참조하세요.

<a name="access-scopes"></a>
### 액세스 스코프(Access Scopes)

사용자를 리디렉션하기 전에, `scopes` 메서드를 사용하여 인증 요청에 포함되어야 할 "스코프(scopes)"를 지정할 수 있습니다. 이 메서드는 이전에 지정된 모든 스코프를 여러분이 지정한 스코프와 병합합니다.

```php
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('github')
    ->scopes(['read:user', 'public_repo'])
    ->redirect();
```

`setScopes` 메서드를 사용하여 인증 요청의 모든 기존 스코프를 덮어쓸 수 있습니다.

```php
return Socialite::driver('github')
    ->setScopes(['read:user', 'public_repo'])
    ->redirect();
```

<a name="slack-bot-scopes"></a>
### Slack 봇 스코프(Slack Bot Scopes)

Slack의 API는 [다양한 유형의 액세스 토큰](https://api.slack.com/authentication/token-types)을 제공하며, 각각 고유한 [권한 스코프](https://api.slack.com/scopes) 세트를 가지고 있습니다. Socialite는 다음 두 가지 Slack 액세스 토큰 유형 모두와 호환됩니다.

<div class="content-list" markdown="1">

- 봇(Bot) (`xoxb-` 접두사)
- 사용자(User) (`xoxp-` 접두사)

</div>

기본적으로, `slack` 드라이버는 `user` 토큰을 생성하며, 드라이버의 `user` 메서드를 호출하면 사용자의 정보를 반환합니다.

봇 토큰은 주로 애플리케이션이 사용자가 소유한 외부 Slack 워크스페이스에 알림을 보내야 하는 경우에 유용합니다. 봇 토큰을 생성하려면 사용자를 Slack으로 리디렉션하여 인증하기 전에 `asBotUser` 메서드를 호출하세요.

```php
return Socialite::driver('slack')
    ->asBotUser()
    ->setScopes(['chat:write', 'chat:write.public', 'chat:write.customize'])
    ->redirect();
```

또한, Slack이 인증 후 사용자를 애플리케이션으로 다시 리디렉션한 후 `user` 메서드를 호출하기 전에 `asBotUser` 메서드를 호출해야 합니다.

```php
$user = Socialite::driver('slack')->asBotUser()->user();
```

봇 토큰을 생성할 때, `user` 메서드는 여전히 `Laravel\Socialite\Two\User` 인스턴스를 반환하지만, `token` 속성만 채워집니다. 이 토큰은 [인증된 사용자의 Slack 워크스페이스에 알림을 보내기](/docs/{{version}}/notifications#notifying-external-slack-workspaces) 위해 저장될 수 있습니다.

<a name="optional-parameters"></a>
### 선택적 매개변수(Optional Parameters)

많은 OAuth 제공자가 리디렉션 요청에서 다른 선택적 매개변수를 지원합니다. 요청에 선택적 매개변수를 포함하려면, 연관 배열과 함께 `with` 메서드를 호출하세요.

```php
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('google')
    ->with(['hd' => 'example.com'])
    ->redirect();
```

> [!WARNING]
> `with` 메서드를 사용할 때, `state`나 `response_type`과 같은 예약된 키워드를 전달하지 않도록 주의하세요.

<a name="retrieving-user-details"></a>
## 사용자 정보 조회

사용자가 애플리케이션의 인증 콜백 라우트로 다시 리디렉션된 후, Socialite의 `user` 메서드를 사용하여 사용자의 정보를 조회할 수 있습니다. `user` 메서드가 반환하는 사용자 객체는 사용자에 대한 정보를 자체 데이터베이스에 저장하는 데 사용할 수 있는 다양한 속성과 메서드를 제공합니다.

인증하는 OAuth 제공자가 OAuth 1.0 또는 OAuth 2.0을 지원하는지에 따라 이 객체에서 사용할 수 있는 속성과 메서드가 다를 수 있습니다.

```php
use Laravel\Socialite\Facades\Socialite;

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // OAuth 2.0 제공자...
    $token = $user->token;
    $refreshToken = $user->refreshToken;
    $expiresIn = $user->expiresIn;

    // OAuth 1.0 제공자...
    $token = $user->token;
    $tokenSecret = $user->tokenSecret;

    // 모든 제공자...
    $user->getId();
    $user->getNickname();
    $user->getName();
    $user->getEmail();
    $user->getAvatar();
});
```

<a name="retrieving-user-details-from-a-token-oauth2"></a>
#### 토큰으로 사용자 정보 조회

사용자에 대한 유효한 액세스 토큰이 이미 있는 경우, Socialite의 `userFromToken` 메서드를 사용하여 사용자 정보를 조회할 수 있습니다.

```php
use Laravel\Socialite\Facades\Socialite;

$user = Socialite::driver('github')->userFromToken($token);
```

iOS 애플리케이션을 통해 Facebook Limited Login을 사용하는 경우, Facebook은 액세스 토큰 대신 OIDC 토큰을 반환합니다. 액세스 토큰과 마찬가지로, OIDC 토큰을 `userFromToken` 메서드에 제공하여 사용자 정보를 조회할 수 있습니다.

<a name="stateless-authentication"></a>
#### 상태 비저장 인증(Stateless Authentication)

`stateless` 메서드는 세션 상태 확인을 비활성화하는 데 사용할 수 있습니다. 이는 쿠키 기반 세션을 사용하지 않는 상태 비저장 API에 소셜 인증을 추가할 때 유용합니다.

```php
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('google')->stateless()->user();
```

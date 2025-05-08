# 인증(Authentication)

- [소개](#introduction)
    - [스타터 킷](#starter-kits)
    - [데이터베이스 고려사항](#introduction-database-considerations)
    - [에코시스템 개요](#ecosystem-overview)
- [인증 빠른 시작](#authentication-quickstart)
    - [스타터 킷 설치](#install-a-starter-kit)
    - [인증된 사용자 가져오기](#retrieving-the-authenticated-user)
    - [라우트 보호하기](#protecting-routes)
    - [로그인 제한](#login-throttling)
- [수동 사용자 인증](#authenticating-users)
    - [사용자 기억하기](#remembering-users)
    - [기타 인증 방법](#other-authentication-methods)
- [HTTP 기본 인증](#http-basic-authentication)
    - [무상태 HTTP 기본 인증](#stateless-http-basic-authentication)
- [로그아웃](#logging-out)
    - [다른 장치에서 세션 무효화](#invalidating-sessions-on-other-devices)
- [비밀번호 확인](#password-confirmation)
    - [설정](#password-confirmation-configuration)
    - [라우팅](#password-confirmation-routing)
    - [라우트 보호하기](#password-confirmation-protecting-routes)
- [커스텀 가드 추가](#adding-custom-guards)
    - [클로저 요청 가드](#closure-request-guards)
- [커스텀 사용자 제공자 추가](#adding-custom-user-providers)
    - [User Provider 계약](#the-user-provider-contract)
    - [Authenticatable 계약](#the-authenticatable-contract)
- [자동 비밀번호 재해싱](#automatic-password-rehashing)
- [소셜 인증](/docs/{{version}}/socialite)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션은 사용자가 애플리케이션에 인증하고 "로그인"할 수 있는 방법을 제공합니다. 이러한 기능을 구현하는 것은 복잡하고 잠재적으로 위험할 수 있으므로, Laravel은 인증을 빠르고 안전하게 구현할 수 있는 도구들을 제공합니다.

Laravel의 인증 시스템은 "가드(guards)"와 "제공자(providers)"로 구성되어 있습니다. 가드는 각 요청에서 사용자가 어떻게 인증되는지를 정의하며, 예를 들어 Laravel은 세션 저장소와 쿠키를 사용하는 `session` 가드를 제공합니다.

제공자는 영속 저장소에서 사용자를 어떻게 조회할지 정의합니다. Laravel은 [Eloquent](/docs/{{version}}/eloquent)와 데이터베이스 쿼리 빌더를 이용한 사용자 조회를 기본 지원하며, 필요시 추가 제공자를 정의할 수 있습니다.

애플리케이션의 인증 구성 파일은 `config/auth.php`에 있습니다. 이 파일에는 Laravel의 인증 서비스 동작을 조정할 수 있는 여러 문서화된 옵션이 포함되어 있습니다.

> [!NOTE]
> 가드와 제공자는 "역할(roles)"이나 "권한(permissions)"과는 다릅니다. 권한을 통한 사용자 액션 허용 방식은 [권한 문서](/docs/{{version}}/authorization)를 참고하세요.

<a name="starter-kits"></a>
### 스타터 킷

빠르게 시작하고 싶으신가요? 새로운 Laravel 애플리케이션에서 [스타터 킷](/docs/{{version}}/starter-kits)을 설치하세요. 데이터베이스를 마이그레이션한 후, 브라우저에서 `/register` 또는 할당된 URL로 이동하면 전체 인증 시스템이 자동으로 구축됩니다!

**최종 애플리케이션에서 스타터 킷을 사용하지 않더라도, 설치해보는 것은 Laravel의 인증 기능을 실제로 구현하는 방법을 배우는 좋은 기회가 될 수 있습니다.** 스타터 킷은 인증 컨트롤러, 라우트, 뷰를 포함하므로 해당 코드를 살펴보면 인증 기능 구현 방식을 이해할 수 있습니다.

<a name="introduction-database-considerations"></a>
### 데이터베이스 고려사항

Laravel은 기본적으로 `app/Models` 디렉터리에 `App\Models\User` [Eloquent 모델](/docs/{{version}}/eloquent)을 포함하고 있으며, 이는 기본 Eloquent 인증 드라이버와 함께 사용할 수 있습니다.

Eloquent를 사용하지 않는 경우, Laravel의 쿼리 빌더를 사용하는 `database` 인증 제공자를 사용할 수 있습니다. MongoDB를 사용하는 경우, [MongoDB의 공식 Laravel 사용자 인증 문서](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/user-authentication/)를 확인하세요.

`App\Models\User` 모델용 데이터베이스 스키마를 만들 때, 비밀번호 컬럼의 길이는 최소 60자 이상이어야 합니다. Laravel의 기본 `users` 테이블 마이그레이션은 이보다 큰 길이로 해당 컬럼을 생성합니다.

또한, `users` (또는 그에 상응하는) 테이블에는 nullable 문자열 타입의 `remember_token` 컬럼(길이 100)이 포함되어야 합니다. 이 컬럼은 사용자가 로그인 시 "로그인 유지" 옵션을 선택했을 때 토큰을 저장하는 데 사용됩니다. Laravel의 기본 `users` 테이블 마이그레이션에는 이미 이 컬럼이 포함되어 있습니다.

<a name="ecosystem-overview"></a>
### 에코시스템 개요

Laravel은 인증과 관련된 여러 패키지를 제공합니다. 계속 진행하기 전에 Laravel의 일반적인 인증 에코시스템을 검토하고 각 패키지의 목적에 대해 알아보겠습니다.

먼저 인증이 어떻게 작동하는지를 생각해봅시다. 웹 브라우저를 사용할 경우, 사용자는 로그인 폼을 통해 사용자 이름과 비밀번호를 입력합니다. 이 자격 증명이 정확하다면 애플리케이션은 해당 사용자에 대한 정보를 [세션](/docs/{{version}}/session)에 저장합니다. 브라우저에 발급된 쿠키에는 세션 ID가 포함되어 있어 이후 요청에서 올바른 세션과 사용자를 연동할 수 있습니다. 세션 쿠키가 수신되면 애플리케이션은 세션 ID를 기준으로 세션 데이터를 검색하고 인증 정보를 확인하여 해당 사용자를 "인증됨"으로 간주합니다.

원격 서비스가 API에 접근하기 위해 인증이 필요한 경우, 일반적으로 쿠키를 사용하지 않습니다. 대신, 원격 서비스는 요청마다 API 토큰을 함께 전송합니다. 애플리케이션은 이 토큰을 유효한 API 토큰 테이블과 대조하여 요청을 해당 사용자로 인증할 수 있습니다.

<a name="laravels-built-in-browser-authentication-services"></a>
#### Laravel의 내장 브라우저 인증 서비스

Laravel은 `Auth` 및 `Session` 파사드를 통해 접근 가능한 내장 인증 및 세션 서비스를 제공합니다. 이 기능은 웹 브라우저에서 시작된 요청에 대해 쿠키 기반 인증을 제공합니다. 사용자의 자격 증명을 검증하고 인증하는 메서드를 제공하며, 인증 데이터를 자동으로 세션에 저장하고 세션 쿠키를 발급합니다. 이 문서에서는 이러한 서비스 사용법을 다룹니다.

**애플리케이션 스타터 킷**

이 문서에서 설명한 것처럼, 이러한 인증 서비스를 직접 활용하여 애플리케이션 고유의 인증 계층을 구축할 수 있습니다. 하지만 보다 빠르게 시작하고자 한다면, 전체 인증 계층을 현대적이고 강력하게 구축할 수 있는 [무료 스타터 킷](/docs/{{version}}/starter-kits)을 사용하는 것이 좋습니다.

<a name="laravels-api-authentication-services"></a>
#### Laravel의 API 인증 서비스

Laravel은 API 토큰 관리를 돕고 해당 토큰으로 수행된 요청을 인증하기 위한 두 가지 선택적 패키지를 제공합니다: [Passport](/docs/{{version}}/passport) 및 [Sanctum](/docs/{{version}}/sanctum). 이들 라이브러리는 Laravel의 내장 쿠키 기반 인증 시스템과 상호 배타적이지 않습니다. 이들은 주로 API 토큰 기반 인증을 다루며, 내장 인증 서비스는 브라우저 기반 인증에 중점을 둡니다. 많은 애플리케이션에서는 이 둘을 함께 사용합니다.

**Passport**

Passport는 다양한 OAuth2 "그랜트 타입"을 제공하는 OAuth2 인증 제공자입니다. 전반적으로 복잡하지만 강력한 API 인증 기능을 제공합니다. 그러나 대부분의 애플리케이션은 OAuth2 사양의 복잡한 기능이 필요하지 않으며, 이로 인해 사용자와 개발자가 혼란을 겪는 경우가 많습니다. 특히 SPA나 모바일 애플리케이션에서 OAuth2 인증 제공자인 Passport를 사용하는 방법에 대해 혼란이 있었습니다.

**Sanctum**

OAuth2의 복잡성과 이에 따른 개발자 혼란을 해소하기 위해, Laravel은 보다 단순하고 일관된 인증 패키지를 개발하였습니다. 그것이 바로 [Laravel Sanctum](/docs/{{version}}/sanctum)입니다. 이 패키지는 웹 브라우저 기반 요청과 API 토큰 기반 요청을 모두 처리할 수 있도록 설계되었습니다.

Laravel Sanctum은 웹과 API 인증을 통합 관리할 수 있는 하이브리드 패키지입니다. Sanctum은 요청을 수신하면 먼저 세션 쿠키가 있는지 확인하여 인증된 세션을 참조합니다. 이를 위해 Laravel의 내장 인증 서비스를 호출합니다. 세션 기반 인증이 아닐 경우, API 토큰을 검사하여 해당 토큰으로 요청을 인증합니다. 자세한 작동 방식은 Sanctum의 ["작동 방식"](/docs/{{version}}/sanctum#how-it-works) 문서를 참고하세요.

<a name="summary-choosing-your-stack"></a>
#### 요약 및 스택 선택

정리하면, 브라우저를 통해 접근되고 모놀리식 Laravel 애플리케이션을 구축하는 경우에는 Laravel의 내장 인증 서비스를 사용하면 됩니다.

다음으로, 애플리케이션이 외부에서 소비되는 API를 제공한다면 [Passport](/docs/{{version}}/passport) 또는 [Sanctum](/docs/{{version}}/sanctum) 중 하나를 선택해 API 토큰 인증을 제공할 수 있습니다. 일반적으로는 단순하고 완전한 API, SPA, 모바일 인증 솔루션인 Sanctum이 권장됩니다. 이 패키지는 "스코프"나 "권한"도 지원합니다.

Laravel 백엔드를 기반으로 하는 SPA를 구축 중이라면 [Sanctum](/docs/{{version}}/sanctum)을 사용해야 합니다. 이 경우 [인증 라우트를 직접 구현](#authenticating-users)하거나 [Laravel Fortify](/docs/{{version}}/fortify)를 사용하여 등록, 비밀번호 재설정, 이메일 인증 등의 기능을 처리할 수 있습니다.

OAuth2 사양의 모든 기능이 반드시 필요한 경우에만 Passport를 고려하세요.

빠르게 시작하고 싶다면, Laravel 내장 인증 시스템이 적용된 [스타터 킷](/docs/{{version}}/starter-kits)을 사용해 새 Laravel 애플리케이션을 시작하는 것을 권장합니다.

<a name="authentication-quickstart"></a>
## 인증 빠른 시작

> [!WARNING]
> 이 문서는 [Laravel 애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 통해 사용자를 인증하는 방법을 설명합니다. 이 스타터 킷은 빠르게 시작할 수 있도록 UI 스캐폴딩을 포함하고 있습니다. Laravel의 인증 시스템을 직접 통합하고 싶다면 [수동 사용자 인증](#authenticating-users) 문서를 참고하세요.

<a name="install-a-starter-kit"></a>
### 스타터 킷 설치

먼저, [Laravel 애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 설치해야 합니다. 이 스타터 킷은 인증을 포함한 새 Laravel 애플리케이션의 아름답고 완전한 시작점을 제공합니다.

<a name="retrieving-the-authenticated-user"></a>
### 인증된 사용자 가져오기

스타터 킷을 사용해 애플리케이션을 생성하고 사용자가 회원가입 및 인증할 수 있게 된 후에는, 현재 인증된 사용자와 상호작용해야 할 일이 자주 발생합니다. 수신된 요청을 처리할 때, `Auth` 파사드의 `user` 메서드를 통해 인증된 사용자에 접근할 수 있습니다:

```php
use Illuminate\Support\Facades\Auth;

// 현재 인증된 사용자 가져오기...
$user = Auth::user();

// 현재 인증된 사용자의 ID 가져오기...
$id = Auth::id();
```

또는 사용자가 인증된 후에는, `Illuminate\Http\Request` 인스턴스를 통해 사용자 정보에 접근할 수도 있습니다. 주입 가능한 클래스는 컨트롤러 메서드에 자동으로 전달되므로, `Illuminate\Http\Request` 객체를 타입힌트로 지정하면 요청의 `user` 메서드를 통해 언제든지 인증된 사용자에 접근할 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * 기존 항공편 정보를 업데이트합니다.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        // ...

        return redirect('/flights');
    }
}
```

<a name="determining-if-the-current-user-is-authenticated"></a>
#### 현재 사용자가 인증되었는지 확인하기

수신된 HTTP 요청을 보낸 사용자가 인증되었는지 확인하려면, `Auth` 파사드의 `check` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 인증되었을 경우 `true`를 반환합니다:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // 사용자가 로그인한 상태입니다...
}
```
> [!NOTE]
> `check` 메서드를 사용하여 사용자가 인증되었는지를 확인할 수는 있지만, 일반적으로는 특정 라우트나 컨트롤러에 접근을 허용하기 전에 미들웨어를 사용하여 사용자가 인증되었는지 검증하는 것이 일반적입니다. 이에 대한 자세한 내용은 [라우트 보호하기](/docs/{{version}}/authentication#protecting-routes) 문서를 참고하세요.

<a name="protecting-routes"></a>
### 라우트 보호하기

[라우트 미들웨어](/docs/{{version}}/middleware)를 사용하면 특정 라우트에 인증된 사용자만 접근할 수 있도록 제한할 수 있습니다. Laravel은 `Illuminate\Auth\Middleware\Authenticate` 클래스에 대한 [미들웨어 별칭](/docs/{{version}}/middleware#middleware-aliases)인 `auth` 미들웨어를 기본 제공하므로, 단순히 이 미들웨어를 라우트에 지정하기만 하면 됩니다:

```php
Route::get('/flights', function () {
    // 인증된 사용자만 접근 가능...
})->middleware('auth');
```

<a name="redirecting-unauthenticated-users"></a>
#### 비인증 사용자 리디렉션

`auth` 미들웨어가 비인증 사용자를 감지하면, 해당 사용자를 `login`이라는 [네임드 라우트](/docs/{{version}}/routing#named-routes)로 리디렉션합니다. 이 동작은 애플리케이션의 `bootstrap/app.php` 파일 내에서 `redirectGuestsTo` 메서드를 사용하여 변경할 수 있습니다:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware) {
    $middleware->redirectGuestsTo('/login');

    // 클로저 방식 사용 시...
    $middleware->redirectGuestsTo(fn (Request $request) => route('login'));
})
```

<a name="redirecting-authenticated-users"></a>
#### 인증 사용자 리디렉션

`guest` 미들웨어가 인증된 사용자를 감지하면 해당 사용자를 `dashboard` 또는 `home`이라는 네임드 라우트로 리디렉션합니다. 이 동작도 `bootstrap/app.php`에서 `redirectUsersTo` 메서드를 통해 변경할 수 있습니다:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware) {
    $middleware->redirectUsersTo('/panel');

    // 클로저 방식 사용 시...
    $middleware->redirectUsersTo(fn (Request $request) => route('panel'));
})
```

<a name="specifying-a-guard"></a>
#### 가드 지정하기

`auth` 미들웨어를 라우트에 적용할 때, 어떤 "가드"를 사용할지 지정할 수 있습니다. 지정하는 가드는 `auth.php` 설정 파일 내 `guards` 배열에 정의된 키 중 하나여야 합니다:

```php
Route::get('/flights', function () {
    // admin 가드 인증된 사용자만 접근 가능...
})->middleware('auth:admin');
```

<a name="login-throttling"></a>
### 로그인 제한(Throttling)

[스타터 킷](/docs/{{version}}/starter-kits)을 사용 중이라면, 로그인 시도에 자동으로 레이트 제한이 적용됩니다. 기본적으로는 일정 횟수 이상 로그인에 실패한 경우, 1분 동안 로그인 시도를 할 수 없습니다. 제한은 사용자 이메일(또는 사용자명)과 IP 주소에 따라 다르게 적용됩니다.

> [!NOTE]
> 애플리케이션의 다른 라우트에도 레이트 제한을 적용하고 싶다면, [레이트 제한 문서](/docs/{{version}}/routing#rate-limiting)를 참고하세요.

<a name="authenticating-users"></a>
## 수동 사용자 인증

Laravel의 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)에 포함된 인증 스캐폴딩을 꼭 사용할 필요는 없습니다. 이를 사용하지 않기로 결정한 경우, Laravel의 인증 클래스를 직접 사용하여 사용자 인증을 처리해야 합니다. 걱정 마세요. 아주 간단합니다!

우리는 `Auth` [파사드](/docs/{{version}}/facades)를 통해 Laravel의 인증 서비스에 접근할 것입니다. 따라서 먼저 클래스 상단에 `Auth` 파사드를 import해야 합니다. 그 다음, `attempt` 메서드를 확인해보겠습니다. 이 메서드는 일반적으로 애플리케이션의 "로그인" 폼으로부터 인증 시도를 처리하는 데 사용됩니다. 인증이 성공하면, [세션 고정(session fixation)](https://en.wikipedia.org/wiki/Session_fixation)을 방지하기 위해 사용자의 [세션](/docs/{{version}}/session)을 재생성해야 합니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * 인증 시도 처리
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'email' => '입력하신 자격 증명은 저희 기록과 일치하지 않습니다.',
        ])->onlyInput('email');
    }
}
```

`attempt` 메서드는 키/값 쌍으로 이루어진 배열을 첫 번째 인자로 받습니다. 이 값들은 데이터베이스에서 사용자를 조회하는 데 사용됩니다. 위 예시에서는 `email` 컬럼의 값으로 사용자를 조회하며, 해당 사용자가 발견되면 데이터베이스에 저장된 해시된 비밀번호와 입력받은 `password` 값을 비교합니다. 이때 입력받은 비밀번호는 직접 해시하지 않아도 됩니다. Laravel이 자동으로 입력값을 해시한 후 데이터베이스의 값과 비교합니다. 두 해시 값이 일치하면 인증된 세션이 시작됩니다.

Laravel의 인증 서비스는 인증 가드의 "provider" 설정에 따라 사용자를 조회합니다. 기본 `config/auth.php` 구성 파일에서는 Eloquent 사용자 제공자가 지정되어 있으며, 이는 `App\Models\User` 모델을 사용해 사용자를 조회합니다. 애플리케이션의 요구에 따라 이 설정을 변경할 수 있습니다.

`attempt` 메서드는 인증이 성공하면 `true`를 반환하며, 실패할 경우 `false`를 반환합니다.

또한, `redirect()`의 `intended` 메서드는 인증 미들웨어에 가로채이기 전 사용자가 접근하려 했던 경로로 다시 리디렉션합니다. 해당 경로가 없다면 대체 URI를 지정할 수도 있습니다.

<a name="specifying-additional-conditions"></a>
#### 추가 조건 지정하기

원한다면 이메일 및 비밀번호 외에도 인증 조건을 더 추가할 수 있습니다. 단순히 `attempt` 메서드에 전달하는 배열에 쿼리 조건을 추가하면 됩니다. 예를 들어 사용자가 "active" 상태여야 하는 경우 다음과 같이 사용할 수 있습니다:

```php
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // 인증 성공...
}
```
복잡한 쿼리 조건이 필요한 경우, 자격 증명 배열 내에 클로저를 전달할 수 있습니다. 이 클로저는 쿼리 인스턴스를 인자로 받아 애플리케이션 요구에 맞게 쿼리를 커스터마이즈할 수 있습니다:

```php
use Illuminate\Database\Eloquent\Builder;

if (Auth::attempt([
    'email' => $email,
    'password' => $password,
    fn (Builder $query) => $query->has('activeSubscription'),
])) {
    // 인증 성공...
}
```

> [!WARNING]
> 위 예시에서 `email`은 필수 항목이 아니며 단지 예시일 뿐입니다. 데이터베이스 테이블에서 사용자명을 의미하는 컬럼명을 사용하세요.

`attemptWhen` 메서드는 두 번째 인자로 클로저를 받아, 사용자를 실제 인증하기 전에 보다 정밀한 조건 검사를 수행할 수 있도록 해줍니다. 이 클로저는 사용자의 인스턴스를 인자로 받아, 인증 여부를 나타내는 `true` 또는 `false`를 반환해야 합니다:

```php
if (Auth::attemptWhen([
    'email' => $email,
    'password' => $password,
], function (User $user) {
    return $user->isNotBanned();
})) {
    // 인증 성공...
}
```

<a name="accessing-specific-guard-instances"></a>
#### 특정 가드 인스턴스 접근

`Auth` 파사드의 `guard` 메서드를 통해, 인증 시 사용할 특정 가드 인스턴스를 지정할 수 있습니다. 이를 통해 애플리케이션의 다른 영역에서 서로 다른 사용자 테이블 또는 인증 모델을 사용할 수 있습니다.

`guard` 메서드에 전달되는 가드 이름은 `auth.php` 설정 파일의 `guards` 배열에 정의된 키 중 하나여야 합니다:

```php
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

<a name="remembering-users"></a>
### 사용자 기억하기 (Remember Me)

많은 웹 애플리케이션은 로그인 폼에 "로그인 유지" 체크박스를 제공합니다. 애플리케이션에서 이 기능을 제공하고 싶다면, `attempt` 메서드의 두 번째 인자로 boolean 값을 전달하면 됩니다.

이 값이 `true`이면, Laravel은 사용자가 수동으로 로그아웃하지 않는 한 무기한 인증 상태를 유지합니다. `users` 테이블에는 문자열 타입의 `remember_token` 컬럼이 포함되어 있어야 하며, 이 토큰은 "로그인 유지" 기능을 위해 사용됩니다. Laravel의 기본 `users` 테이블 마이그레이션에는 이미 이 컬럼이 포함되어 있습니다:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // 사용자가 로그인 유지 상태로 인증됨...
}
```

"로그인 유지" 기능을 제공하는 경우, 현재 인증된 사용자가 해당 기능을 통해 인증되었는지 확인하려면 `viaRemember` 메서드를 사용할 수 있습니다:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::viaRemember()) {
    // remember me를 통해 인증된 사용자...
}
```

<a name="other-authentication-methods"></a>
### 기타 인증 방법

<a name="authenticate-a-user-instance"></a>
#### 사용자 인스턴스를 통한 인증

기존 사용자 인스턴스를 현재 인증된 사용자로 설정하려면, 해당 인스턴스를 `Auth` 파사드의 `login` 메서드에 전달하면 됩니다. 전달되는 인스턴스는 `Illuminate\Contracts\Auth\Authenticatable` [계약](/docs/{{version}}/contracts)을 구현해야 합니다. Laravel의 기본 `App\Models\User` 모델은 이미 이 인터페이스를 구현하고 있습니다. 이 방식은 사용자가 회원가입 직후 등 유효한 사용자 인스턴스를 이미 확보하고 있는 상황에서 유용합니다:

```php
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

`login` 메서드의 두 번째 인자로 boolean 값을 전달할 수도 있습니다. 이 값은 인증 세션에서 "로그인 유지" 기능의 활성 여부를 나타냅니다:

```php
Auth::login($user, $remember = true);
```

필요한 경우, `login` 메서드를 호출하기 전에 사용할 인증 가드를 지정할 수 있습니다:

```php
Auth::guard('admin')->login($user);
```

<a name="authenticate-a-user-by-id"></a>
#### 사용자 ID로 인증하기

데이터베이스 레코드의 기본 키(primary key)를 사용하여 사용자를 인증하려면, `loginUsingId` 메서드를 사용할 수 있습니다. 이 메서드는 인증할 사용자의 기본 키 값을 받습니다:

```php
Auth::loginUsingId(1);
```

이 메서드의 `remember` 인자에 boolean 값을 전달하여 "로그인 유지" 여부를 설정할 수도 있습니다:

```php
Auth::loginUsingId(1, remember: true);
```

<a name="authenticate-a-user-once"></a>
#### 단일 요청에 한해 인증하기

`once` 메서드를 사용하면 사용자를 단 한 번의 요청 동안만 애플리케이션에 인증할 수 있습니다. 이 메서드를 사용할 경우 세션이나 쿠키는 사용되지 않습니다:

```php
if (Auth::once($credentials)) {
    // ...
}
```

<a name="http-basic-authentication"></a>
## HTTP 기본 인증

[HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication)은 별도의 "로그인" 페이지를 설정하지 않고도 애플리케이션 사용자를 빠르게 인증하는 방법을 제공합니다. 시작하려면 `auth.basic` [미들웨어](/docs/{{version}}/middleware)를 라우트에 적용하면 됩니다. 이 미들웨어는 Laravel 프레임워크에 기본 포함되어 있으므로, 따로 정의할 필요는 없습니다.

```php
Route::get('/profile', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('auth.basic');
```

위와 같이 라우트에 미들웨어를 연결하면, 해당 라우트에 브라우저로 접근할 때 자동으로 사용자 인증을 요구하게 됩니다. 기본적으로 `auth.basic` 미들웨어는 `users` 테이블의 `email` 컬럼을 사용자명으로 간주합니다.

<a name="a-note-on-fastcgi"></a>
#### FastCGI에 대한 참고 사항

PHP FastCGI와 Apache를 함께 사용해 Laravel 애플리케이션을 제공하는 경우, HTTP 기본 인증이 제대로 작동하지 않을 수 있습니다. 이러한 문제를 해결하려면 애플리케이션의 `.htaccess` 파일에 아래 코드를 추가하세요:

```apache
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

<a name="stateless-http-basic-authentication"></a>
### 무상태 HTTP 기본 인증

세션에 사용자 식별자 쿠키를 설정하지 않고 HTTP 기본 인증을 사용할 수도 있습니다. 이 방식은 특히 API 요청을 인증하기 위해 HTTP 인증을 사용하는 경우 유용합니다. 이를 구현하려면 `onceBasic` 메서드를 호출하는 [미들웨어](/docs/{{version}}/middleware)를 정의하세요. `onceBasic` 메서드가 응답을 반환하지 않으면, 요청은 애플리케이션의 다음 처리 단계로 전달됩니다:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateOnceWithBasicAuth
{
    /**
     * 들어오는 요청을 처리합니다.
     */
    public function handle(Request $request, Closure $next): Response
    {
        return Auth::onceBasic() ?: $next($request);
    }
}
```

그 다음, 해당 미들웨어를 라우트에 연결합니다:

```php
Route::get('/api/user', function () {
    // 인증된 사용자만 접근할 수 있습니다...
})->middleware(AuthenticateOnceWithBasicAuth::class);
```

<a name="logging-out"></a>
## 로그아웃 처리

사용자를 수동으로 로그아웃시키려면, `Auth` 파사드의 `logout` 메서드를 사용하세요. 이 메서드는 사용자의 세션에서 인증 정보를 제거하므로 이후 요청은 인증되지 않게 됩니다.

또한 `logout` 호출 이후에는 사용자의 세션을 무효화하고 [CSRF 토큰](/docs/{{version}}/csrf)을 재생성하는 것이 좋습니다. 일반적으로 로그아웃 후 사용자를 애플리케이션의 루트로 리디렉션합니다:

```php
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * 사용자를 애플리케이션에서 로그아웃합니다.
 */
public function logout(Request $request): RedirectResponse
{
    Auth::logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    return redirect('/');
}
```

<a name="invalidating-sessions-on-other-devices"></a>
### 다른 기기에서의 세션 무효화

Laravel은 사용자가 현재 기기를 제외한 다른 기기에서 로그인된 세션을 무효화하고 "로그아웃"시킬 수 있는 기능도 제공합니다. 이 기능은 보통 사용자가 비밀번호를 변경하거나 업데이트할 때, 다른 기기의 세션은 무효화하고 현재 기기는 인증 상태로 유지하고자 할 때 사용됩니다.

먼저, 세션 인증이 필요한 라우트에 `Illuminate\Session\Middleware\AuthenticateSession` 미들웨어가 포함되어 있는지 확인해야 합니다. 일반적으로 이 미들웨어는 라우트 그룹에 적용하여 애플리케이션의 대부분의 라우트에 적용되도록 합니다. Laravel에서는 `auth.session`이라는 [미들웨어 별칭](/docs/{{version}}/middleware#middleware-aliases)으로 이 미들웨어를 연결할 수 있습니다:

```php
Route::middleware(['auth', 'auth.session'])->group(function () {
    Route::get('/', function () {
        // ...
    });
});
```

이제 `Auth` 파사드의 `logoutOtherDevices` 메서드를 사용할 수 있습니다. 이 메서드는 사용자의 현재 비밀번호를 확인해야 하며, 이 값은 애플리케이션에서 입력 폼을 통해 받아야 합니다:

```php
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

`logoutOtherDevices` 메서드가 호출되면, 사용자의 다른 모든 세션은 완전히 무효화되어, 이전에 인증되었던 모든 가드에서 로그아웃됩니다.

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션을 만들다 보면, 어떤 작업은 수행 전에 사용자가 비밀번호를 다시 입력하도록 요구하고 싶을 수 있습니다. Laravel은 이 과정을 쉽게 처리할 수 있는 내장 미들웨어를 제공합니다. 이 기능을 구현하려면 두 개의 라우트를 정의해야 합니다. 하나는 사용자에게 비밀번호 확인을 요청하는 뷰를 보여주는 라우트이고, 다른 하나는 입력된 비밀번호를 확인한 후 사용자를 의도한 위치로 리디렉션하는 라우트입니다.

> [!NOTE]
> 아래 문서는 Laravel의 비밀번호 확인 기능을 직접 통합하는 방법을 설명합니다. 하지만 더 빠르게 시작하고 싶다면 [Laravel 스타터 킷](/docs/{{version}}/starter-kits)에는 이 기능이 기본 포함되어 있습니다!

<a name="password-confirmation-configuration"></a>
### 설정

사용자가 비밀번호를 확인하면, 기본적으로는 이후 3시간 동안 다시 비밀번호를 입력하지 않아도 됩니다. 이 시간 간격은 애플리케이션의 `config/auth.php` 설정 파일에서 `password_timeout` 값을 변경하여 조정할 수 있습니다.

<a name="password-confirmation-routing"></a>
### 라우팅

<a name="the-password-confirmation-form"></a>
#### 비밀번호 확인 폼

먼저, 사용자의 비밀번호 확인을 요청하는 뷰를 표시할 라우트를 정의합니다:

```php
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

예상하신 것처럼, 이 라우트에서 반환하는 뷰에는 `password` 필드를 포함하는 폼이 있어야 합니다. 또한 이 뷰에는 사용자가 애플리케이션의 보호된 영역에 진입하고 있으며 비밀번호를 확인해야 한다는 내용을 안내하는 텍스트도 포함할 수 있습니다.

<a name="confirming-the-password"></a>
#### 비밀번호 확인 처리

다음으로, "비밀번호 확인" 뷰로부터 제출된 폼 요청을 처리할 라우트를 정의합니다. 이 라우트는 비밀번호 유효성을 검증하고, 사용자를 의도한 위치로 리디렉션하는 역할을 합니다:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;

Route::post('/confirm-password', function (Request $request) {
    if (! Hash::check($request->password, $request->user()->password)) {
        return back()->withErrors([
            'password' => ['입력한 비밀번호가 기록과 일치하지 않습니다.']
        ]);
    }

    $request->session()->passwordConfirmed();

    return redirect()->intended();
})->middleware(['auth', 'throttle:6,1']);
```

이 라우트를 더 자세히 살펴보면, 먼저 요청의 `password` 필드가 실제로 인증된 사용자의 비밀번호와 일치하는지를 확인합니다. 유효한 경우 Laravel 세션에 비밀번호가 확인되었음을 알리는 `passwordConfirmed` 메서드를 호출합니다. 이 메서드는 사용자의 세션에 타임스탬프를 설정하여 Laravel이 마지막 비밀번호 확인 시점을 알 수 있도록 합니다. 이후 사용자는 의도된 위치로 리디렉션됩니다.

<a name="password-confirmation-protecting-routes"></a>
### 비밀번호 확인이 필요한 라우트 보호하기

비밀번호 확인이 필요한 작업을 수행하는 라우트에는 `password.confirm` 미들웨어를 적용해야 합니다. 이 미들웨어는 Laravel에 기본 포함되어 있으며, 사용자의 의도된 목적지를 세션에 저장한 뒤 `password.confirm` [네임드 라우트](/docs/{{version}}/routing#named-routes)로 리디렉션합니다:

```php
Route::get('/settings', function () {
    // ...
})->middleware(['password.confirm']);

Route::post('/settings', function () {
    // ...
})->middleware(['password.confirm']);
```

<a name="adding-custom-guards"></a>
## 커스텀 가드 추가하기

`Auth` 파사드의 `extend` 메서드를 사용하면 사용자 정의 인증 가드를 만들 수 있습니다. 이 코드는 [서비스 프로바이더](/docs/{{version}}/providers) 내에 작성해야 합니다. Laravel은 기본적으로 `AppServiceProvider`를 제공하므로, 여기에 코드를 작성하면 됩니다:

```php
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    public function boot(): void
    {
        Auth::extend('jwt', function (Application $app, string $name, array $config) {
            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

위 예시에서 볼 수 있듯이, `extend` 메서드에 전달되는 콜백은 `Illuminate\Contracts\Auth\Guard` 인터페이스를 구현하는 객체를 반환해야 합니다. 이 인터페이스는 커스텀 가드를 정의하기 위해 필요한 몇 가지 메서드를 포함합니다. 가드를 정의한 후에는 `auth.php` 설정 파일의 `guards` 항목에서 참조할 수 있습니다:

```php
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

<a name="closure-request-guards"></a>
### 클로저 기반 요청 가드

HTTP 요청 기반의 사용자 정의 인증 시스템을 가장 간단하게 구현하는 방법은 `Auth::viaRequest` 메서드를 사용하는 것입니다. 이 메서드를 통해 단일 클로저로 인증 로직을 정의할 수 있습니다.

`viaRequest` 메서드는 `AppServiceProvider`의 `boot` 메서드 내에서 호출하며, 첫 번째 인자는 드라이버 이름이고 두 번째 인자는 요청을 인자로 받아 사용자 인스턴스를 반환하거나 인증 실패 시 `null`을 반환하는 클로저입니다:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

public function boot(): void
{
    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', (string) $request->token)->first();
    });
}
```

이제 이 드라이버를 `auth.php` 설정 파일의 `guards` 항목에 추가할 수 있습니다:

```php
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

라우트에 인증 미들웨어를 지정할 때 이 가드를 사용할 수 있습니다:

```php
Route::middleware('auth:api')->group(function () {
    // ...
});
```

<a name="adding-custom-user-providers"></a>
## 커스텀 사용자 제공자 추가하기

전통적인 관계형 데이터베이스가 아닌 다른 방식으로 사용자를 저장하는 경우, Laravel에 사용자 정의 인증 제공자를 확장해 주어야 합니다. 이를 위해 `Auth` 파사드의 `provider` 메서드를 사용하여 커스텀 제공자를 정의합니다. 이 메서드는 `Illuminate\Contracts\Auth\UserProvider` 인터페이스를 구현하는 인스턴스를 반환해야 합니다:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoUserProvider;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Auth::provider('mongo', function (Application $app, array $config) {
            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

제공자를 등록한 후에는 `auth.php` 설정 파일에서 새 드라이버를 사용하는 `provider`를 정의합니다:

```php
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

마지막으로 이 제공자를 `guards` 설정에서 참조합니다:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
```

<a name="the-user-provider-contract"></a>
### 사용자 제공자(User Provider) 계약

`Illuminate\Contracts\Auth\UserProvider` 인터페이스는 MySQL, MongoDB 등의 영속적 저장소에서 `Illuminate\Contracts\Auth\Authenticatable` 인터페이스 구현체를 가져오는 역할을 합니다. 이 두 인터페이스를 통해 사용자 데이터 저장 방식이나 인증된 사용자를 표현하는 클래스 종류에 상관없이 Laravel의 인증 메커니즘이 동일하게 작동할 수 있습니다.

아래는 `Illuminate\Contracts\Auth\UserProvider` 계약입니다:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface UserProvider
{
    public function retrieveById($identifier);
    public function retrieveByToken($identifier, $token);
    public function updateRememberToken(Authenticatable $user, $token);
    public function retrieveByCredentials(array $credentials);
    public function validateCredentials(Authenticatable $user, array $credentials);
    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false);
}
```

- `retrieveById`: 일반적으로 MySQL의 auto-increment ID와 같은 사용자 키를 받아 해당하는 `Authenticatable` 인스턴스를 반환합니다.
- `retrieveByToken`: 고유 `$identifier`와 "로그인 유지" `$token`으로 사용자를 검색합니다. 일반적으로 `remember_token` 컬럼을 기반으로 합니다.
- `updateRememberToken`: `$user` 인스턴스의 `remember_token` 값을 새로운 `$token`으로 갱신합니다.
- `retrieveByCredentials`: `Auth::attempt`에 전달된 자격 증명 배열을 받아 해당하는 사용자를 검색합니다. 이 메서드는 비밀번호 확인을 수행해서는 안 됩니다.
- `validateCredentials`: 주어진 `$user`와 `$credentials`를 비교하여 사용자 인증을 수행합니다. 예: `Hash::check` 사용.
- `rehashPasswordIfRequired`: 비밀번호 재해시가 필요한 경우 이를 수행합니다. 예: `Hash::needsRehash` 후 `Hash::make` 사용.

<a name="the-authenticatable-contract"></a>
### 인증 가능(Authenticatable) 계약

이제 `UserProvider`에서 반환되어야 하는 `Authenticatable` 인터페이스를 살펴보겠습니다. 사용자 제공자는 `retrieveById`, `retrieveByToken`, `retrieveByCredentials`에서 이 인터페이스를 구현한 객체를 반환해야 합니다.

```php
<?php

namespace Illuminate\Contracts\Auth;

interface Authenticatable
{
    public function getAuthIdentifierName();
    public function getAuthIdentifier();
    public function getAuthPasswordName();
    public function getAuthPassword();
    public function getRememberToken();
    public function setRememberToken($value);
    public function getRememberTokenName();
}
```

- `getAuthIdentifierName`: 사용자의 기본 키 컬럼명을 반환합니다.
- `getAuthIdentifier`: 사용자의 기본 키 값을 반환합니다.
- `getAuthPasswordName`: 비밀번호 컬럼명을 반환합니다.
- `getAuthPassword`: 해시된 비밀번호 값을 반환합니다.
- `getRememberToken` / `setRememberToken` / `getRememberTokenName`: "로그인 유지" 토큰 관련 메서드입니다.

이 인터페이스 덕분에 ORM이나 저장 방식에 관계없이 인증 시스템을 원하는 사용자 클래스로 연동할 수 있습니다. Laravel에는 기본적으로 이 인터페이스를 구현한 `App\Models\User` 클래스가 포함되어 있습니다.

<a name="automatic-password-rehashing"></a>
## 자동 비밀번호 재해시

Laravel의 기본 비밀번호 해시 알고리즘은 bcrypt입니다. bcrypt의 "워크 팩터"는 `config/hashing.php` 파일이나 `BCRYPT_ROUNDS` 환경변수에서 조정할 수 있습니다.

CPU/GPU 성능 향상에 따라 워크 팩터를 점진적으로 높이는 것이 좋습니다. Laravel은 워크 팩터가 변경되었을 때, 사용자가 로그인할 때 자동으로 비밀번호를 재해시합니다. 이 동작은 Laravel 스타터 킷 또는 `attempt` 메서드를 사용할 때 자동 수행됩니다.

기본적으로 이 동작은 애플리케이션에 영향을 주지 않으며, 원한다면 다음 명령어로 `hashing` 설정 파일을 퍼블리시 후 재해시 동작을 비활성화할 수 있습니다:

```shell
php artisan config:publish hashing
```

`rehash_on_login` 설정 값을 `false`로 변경하면 됩니다:

```php
'rehash_on_login' => false,
```

<a name="events"></a>
## 이벤트

Laravel은 인증 과정 중 다양한 [이벤트](/docs/{{version}}/events)를 디스패치합니다. 아래 이벤트에 대해 [리스너](/docs/{{version}}/events)를 정의할 수 있습니다:

| 이벤트 이름 |
| --- |
| `Illuminate\Auth\Events\Registered` |
| `Illuminate\Auth\Events\Attempting` |
| `Illuminate\Auth\Events\Authenticated` |
| `Illuminate\Auth\Events\Login` |
| `Illuminate\Auth\Events\Failed` |
| `Illuminate\Auth\Events\Validated` |
| `Illuminate\Auth\Events\Verified` |
| `Illuminate\Auth\Events\Logout` |
| `Illuminate\Auth\Events\CurrentDeviceLogout` |
| `Illuminate\Auth\Events\OtherDeviceLogout` |
| `Illuminate\Auth\Events\Lockout` |
| `Illuminate\Auth\Events\PasswordReset` |
# Laravel Fortify

- [소개](#introduction)
    - [Fortify란 무엇인가?](#what-is-fortify)
    - [Fortify를 언제 사용해야 하나요?](#when-should-i-use-fortify)
- [설치](#installation)
    - [Fortify 기능](#fortify-features)
    - [뷰 비활성화](#disabling-views)
- [인증](#authentication)
    - [사용자 인증 커스터마이징](#customizing-user-authentication)
    - [인증 파이프라인 커스터마이징](#customizing-the-authentication-pipeline)
    - [리다이렉트 커스터마이징](#customizing-authentication-redirects)
- [2단계 인증](#two-factor-authentication)
    - [2단계 인증 활성화](#enabling-two-factor-authentication)
    - [2단계 인증으로 인증하기](#authenticating-with-two-factor-authentication)
    - [2단계 인증 비활성화](#disabling-two-factor-authentication)
- [회원가입](#registration)
    - [회원가입 커스터마이징](#customizing-registration)
- [비밀번호 재설정](#password-reset)
    - [비밀번호 재설정 링크 요청](#requesting-a-password-reset-link)
    - [비밀번호 재설정하기](#resetting-the-password)
    - [비밀번호 재설정 커스터마이징](#customizing-password-resets)
- [이메일 인증](#email-verification)
    - [라우트 보호](#protecting-routes)
- [비밀번호 확인](#password-confirmation)

<a name="introduction"></a>
## 소개

[Laravel Fortify](https://github.com/laravel/fortify)는 Laravel을 위한 프론트엔드에 구애받지 않는 인증 백엔드 구현체입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 Laravel의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 등록합니다. Fortify를 설치한 후 `route:list` Artisan 명령어를 실행하면 Fortify가 등록한 라우트를 확인할 수 있습니다.

Fortify는 자체 사용자 인터페이스를 제공하지 않기 때문에, Fortify가 등록한 라우트에 요청을 보내는 여러분만의 사용자 인터페이스와 함께 사용하도록 설계되었습니다. 이 문서의 나머지 부분에서 이러한 라우트에 요청을 보내는 방법에 대해 정확히 설명하겠습니다.

> [!NOTE]
> Fortify는 Laravel의 인증 기능 구현을 빠르게 시작할 수 있도록 도와주는 패키지입니다. **반드시 사용해야 하는 것은 아닙니다.** [인증](/docs/{{version}}/authentication), [비밀번호 재설정](/docs/{{version}}/passwords), [이메일 인증](/docs/{{version}}/verification) 문서에서 제공하는 내용을 따라 Laravel의 인증 서비스와 직접 상호작용할 수 있습니다.

<a name="what-is-fortify"></a>
### Fortify란 무엇인가?

앞서 언급했듯이, Laravel Fortify는 Laravel을 위한 프론트엔드에 구애받지 않는 인증 백엔드 구현체입니다. Fortify는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등 Laravel의 모든 인증 기능을 구현하는 데 필요한 라우트와 컨트롤러를 등록합니다.

**Laravel의 인증 기능을 사용하기 위해 반드시 Fortify를 사용할 필요는 없습니다.** [인증](/docs/{{version}}/authentication), [비밀번호 재설정](/docs/{{version}}/passwords), [이메일 인증](/docs/{{version}}/verification) 문서에서 제공하는 내용을 따라 Laravel의 인증 서비스와 직접 상호작용할 수 있습니다.

Laravel을 처음 접하신다면 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 먼저 살펴보시길 권장합니다. Laravel의 애플리케이션 스타터 킷은 내부적으로 Fortify를 사용하여 [Tailwind CSS](https://tailwindcss.com)로 구축된 사용자 인터페이스를 포함한 인증 스캐폴딩을 애플리케이션에 제공합니다. 이를 통해 Laravel의 인증 기능을 학습하고 익숙해질 수 있습니다.

Laravel Fortify는 본질적으로 애플리케이션 스타터 킷의 라우트와 컨트롤러를 가져와서 사용자 인터페이스를 포함하지 않는 패키지로 제공합니다. 이를 통해 특정 프론트엔드 의견에 얽매이지 않으면서도 애플리케이션 인증 레이어의 백엔드 구현을 빠르게 스캐폴딩할 수 있습니다.

<a name="when-should-i-use-fortify"></a>
### Fortify를 언제 사용해야 하나요?

Laravel Fortify를 언제 사용하는 것이 적절한지 궁금할 수 있습니다. 먼저, Laravel의 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits) 중 하나를 사용하고 있다면 Laravel의 모든 애플리케이션 스타터 킷이 Fortify를 사용하며 이미 완전한 인증 구현을 제공하므로 Laravel Fortify를 설치할 필요가 없습니다.

애플리케이션 스타터 킷을 사용하지 않고 애플리케이션에 인증 기능이 필요한 경우 두 가지 옵션이 있습니다: 애플리케이션의 인증 기능을 직접 구현하거나 Laravel Fortify를 사용하여 이러한 기능의 백엔드 구현을 제공받는 것입니다.

Fortify를 설치하기로 선택하면, 사용자 인터페이스는 이 문서에서 자세히 설명하는 Fortify의 인증 라우트에 요청을 보내 사용자를 인증하고 등록합니다.

Fortify를 사용하는 대신 Laravel의 인증 서비스와 직접 상호작용하기로 선택한 경우 [인증](/docs/{{version}}/authentication), [비밀번호 재설정](/docs/{{version}}/passwords), [이메일 인증](/docs/{{version}}/verification) 문서에서 제공하는 내용을 따르면 됩니다.

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify와 Laravel Sanctum

일부 개발자들은 [Laravel Sanctum](/docs/{{version}}/sanctum)과 Laravel Fortify의 차이점에 대해 혼란스러워합니다. 두 패키지는 서로 다르지만 관련된 문제를 해결하기 때문에, Laravel Fortify와 Laravel Sanctum은 상호 배타적이거나 경쟁하는 패키지가 아닙니다.

Laravel Sanctum은 API 토큰 관리와 세션 쿠키 또는 토큰을 사용한 기존 사용자 인증에만 관심이 있습니다. Sanctum은 사용자 등록, 비밀번호 재설정 등을 처리하는 라우트를 제공하지 않습니다.

API를 제공하거나 단일 페이지 애플리케이션(SPA)의 백엔드 역할을 하는 애플리케이션의 인증 레이어를 직접 구축하려는 경우, Laravel Fortify(사용자 등록, 비밀번호 재설정 등)와 Laravel Sanctum(API 토큰 관리, 세션 인증)을 모두 활용할 수 있습니다.

<a name="installation"></a>
## 설치

시작하려면 Composer 패키지 관리자를 사용하여 Fortify를 설치하세요:

```shell
composer require laravel/fortify
```

다음으로, `fortify:install` Artisan 명령어를 사용하여 Fortify의 리소스를 퍼블리시하세요:

```shell
php artisan fortify:install
```

이 명령어는 Fortify의 액션을 `app/Actions` 디렉토리에 퍼블리시하며, 해당 디렉토리가 없으면 생성됩니다. 또한, `FortifyServiceProvider`, 설정 파일 및 필요한 모든 데이터베이스 마이그레이션이 퍼블리시됩니다.

다음으로, 데이터베이스를 마이그레이션해야 합니다:

```shell
php artisan migrate
```

<a name="fortify-features"></a>
### Fortify 기능

`fortify` 설정 파일에는 `features` 설정 배열이 포함되어 있습니다. 이 배열은 Fortify가 기본적으로 노출할 백엔드 라우트/기능을 정의합니다. 대부분의 Laravel 애플리케이션에서 제공하는 기본 인증 기능인 다음 기능만 활성화하는 것을 권장합니다:

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### 뷰 비활성화

기본적으로 Fortify는 로그인 화면이나 회원가입 화면과 같은 뷰를 반환하도록 의도된 라우트를 정의합니다. 그러나 JavaScript 기반 단일 페이지 애플리케이션을 구축하는 경우 이러한 라우트가 필요하지 않을 수 있습니다. 이러한 이유로 애플리케이션의 `config/fortify.php` 설정 파일에서 `views` 설정 값을 `false`로 설정하여 이러한 라우트를 완전히 비활성화할 수 있습니다:

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### 뷰 비활성화와 비밀번호 재설정

Fortify의 뷰를 비활성화하고 애플리케이션에 비밀번호 재설정 기능을 구현하는 경우에도 애플리케이션의 "비밀번호 재설정" 뷰를 표시하는 `password.reset`이라는 이름의 라우트를 정의해야 합니다. 이는 Laravel의 `Illuminate\Auth\Notifications\ResetPassword` 알림이 `password.reset` 명명된 라우트를 통해 비밀번호 재설정 URL을 생성하기 때문에 필요합니다.

<a name="authentication"></a>
## 인증

시작하려면 Fortify에 "로그인" 뷰를 반환하는 방법을 알려줘야 합니다. Fortify는 헤드리스 인증 라이브러리임을 기억하세요. 이미 완성된 Laravel 인증 기능의 프론트엔드 구현을 원한다면 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 사용해야 합니다.

모든 인증 뷰의 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 사용할 수 있는 적절한 메서드를 사용하여 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다. Fortify가 이 뷰를 반환하는 `/login` 라우트를 정의합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Fortify::loginView(function () {
        return view('auth.login');
    });

    // ...
}
```

로그인 템플릿에는 `/login`으로 POST 요청을 보내는 폼이 포함되어야 합니다. `/login` 엔드포인트는 문자열 `email` / `username`과 `password`를 기대합니다. 이메일/사용자명 필드의 이름은 `config/fortify.php` 설정 파일의 `username` 값과 일치해야 합니다. 또한, 사용자가 Laravel이 제공하는 "로그인 상태 유지" 기능을 사용하려는 경우 불리언 `remember` 필드를 제공할 수 있습니다.

로그인 시도가 성공하면 Fortify는 애플리케이션의 `fortify` 설정 파일에서 `home` 설정 옵션을 통해 구성된 URI로 리다이렉트합니다. 로그인 요청이 XHR 요청인 경우 200 HTTP 응답이 반환됩니다.

요청이 성공하지 못한 경우 사용자는 로그인 화면으로 다시 리다이렉트되고 유효성 검사 오류는 공유된 `$errors` [Blade 템플릿 변수](/docs/{{version}}/validation#quick-displaying-the-validation-errors)를 통해 사용할 수 있습니다. 또는 XHR 요청의 경우 유효성 검사 오류는 422 HTTP 응답과 함께 반환됩니다.

<a name="customizing-user-authentication"></a>
### 사용자 인증 커스터마이징

Fortify는 제공된 자격 증명과 애플리케이션에 구성된 인증 가드를 기반으로 자동으로 사용자를 검색하고 인증합니다. 그러나 로그인 자격 증명이 인증되는 방법과 사용자가 검색되는 방법을 완전히 커스터마이징하고 싶을 수 있습니다. 다행히 Fortify는 `Fortify::authenticateUsing` 메서드를 사용하여 이를 쉽게 수행할 수 있습니다.

이 메서드는 들어오는 HTTP 요청을 받는 클로저를 허용합니다. 클로저는 요청에 첨부된 로그인 자격 증명의 유효성을 검사하고 연결된 사용자 인스턴스를 반환할 책임이 있습니다. 자격 증명이 유효하지 않거나 사용자를 찾을 수 없는 경우 클로저는 `null` 또는 `false`를 반환해야 합니다. 일반적으로 이 메서드는 `FortifyServiceProvider`의 `boot` 메서드에서 호출해야 합니다:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Fortify::authenticateUsing(function (Request $request) {
        $user = User::where('email', $request->email)->first();

        if ($user &&
            Hash::check($request->password, $user->password)) {
            return $user;
        }
    });

    // ...
}
```

<a name="authentication-guard"></a>
#### 인증 가드(Authentication Guard)

애플리케이션의 `fortify` 설정 파일에서 Fortify가 사용하는 인증 가드를 커스터마이징할 수 있습니다. 그러나 구성된 가드가 `Illuminate\Contracts\Auth\StatefulGuard`의 구현체인지 확인해야 합니다. Laravel Fortify를 사용하여 SPA를 인증하려는 경우 [Laravel Sanctum](https://laravel.com/docs/sanctum)과 함께 Laravel의 기본 `web` 가드를 사용해야 합니다.

<a name="customizing-the-authentication-pipeline"></a>
### 인증 파이프라인 커스터마이징

Laravel Fortify는 호출 가능한 클래스의 파이프라인을 통해 로그인 요청을 인증합니다. 원한다면 로그인 요청이 통과해야 하는 클래스의 커스텀 파이프라인을 정의할 수 있습니다. 각 클래스는 들어오는 `Illuminate\Http\Request` 인스턴스를 받고, [미들웨어](/docs/{{version}}/middleware)처럼 파이프라인의 다음 클래스로 요청을 전달하기 위해 호출되는 `$next` 변수를 받는 `__invoke` 메서드를 가져야 합니다.

커스텀 파이프라인을 정의하려면 `Fortify::authenticateThrough` 메서드를 사용할 수 있습니다. 이 메서드는 로그인 요청이 통과할 클래스 배열을 반환해야 하는 클로저를 허용합니다. 일반적으로 이 메서드는 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

아래 예제는 직접 수정할 때 시작점으로 사용할 수 있는 기본 파이프라인 정의를 포함합니다:

```php
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\CanonicalizeUsername;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

Fortify::authenticateThrough(function (Request $request) {
    return array_filter([
            config('fortify.limiters.login') ? null : EnsureLoginIsNotThrottled::class,
            config('fortify.lowercase_usernames') ? CanonicalizeUsername::class : null,
            Features::enabled(Features::twoFactorAuthentication()) ? RedirectIfTwoFactorAuthenticatable::class : null,
            AttemptToAuthenticate::class,
            PrepareAuthenticatedSession::class,
    ]);
});
```

#### 인증 쓰로틀링(Authentication Throttling)

기본적으로 Fortify는 `EnsureLoginIsNotThrottled` 미들웨어를 사용하여 인증 시도를 쓰로틀링합니다. 이 미들웨어는 사용자명과 IP 주소 조합에 고유한 시도를 쓰로틀링합니다.

일부 애플리케이션은 IP 주소만으로 쓰로틀링하는 것과 같이 인증 시도를 쓰로틀링하는 다른 접근 방식이 필요할 수 있습니다. 따라서 Fortify는 `fortify.limiters.login` 설정 옵션을 통해 자체 [레이트 리미터](/docs/{{version}}/routing#rate-limiting)를 지정할 수 있습니다. 물론 이 설정 옵션은 애플리케이션의 `config/fortify.php` 설정 파일에 있습니다.

> [!NOTE]
> 쓰로틀링, [2단계 인증](/docs/{{version}}/fortify#two-factor-authentication), 외부 웹 애플리케이션 방화벽(WAF)을 혼합하여 사용하면 합법적인 애플리케이션 사용자에게 가장 강력한 방어를 제공합니다.

<a name="customizing-authentication-redirects"></a>
### 리다이렉트 커스터마이징

로그인 시도가 성공하면 Fortify는 애플리케이션의 `fortify` 설정 파일에서 `home` 설정 옵션을 통해 구성된 URI로 리다이렉트합니다. 로그인 요청이 XHR 요청인 경우 200 HTTP 응답이 반환됩니다. 사용자가 애플리케이션에서 로그아웃하면 `/` URI로 리다이렉트됩니다.

이 동작에 대한 고급 커스터마이징이 필요한 경우 Laravel [서비스 컨테이너](/docs/{{version}}/container)에 `LoginResponse`와 `LogoutResponse` 계약의 구현체를 바인딩할 수 있습니다. 일반적으로 이는 애플리케이션의 `App\Providers\FortifyServiceProvider` 클래스의 `register` 메서드에서 수행해야 합니다:

```php
use Laravel\Fortify\Contracts\LogoutResponse;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    $this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
        public function toResponse($request)
        {
            return redirect('/');
        }
    });
}
```

<a name="two-factor-authentication"></a>
## 2단계 인증(Two-Factor Authentication)

Fortify의 2단계 인증 기능이 활성화되면 사용자는 인증 과정 중에 6자리 숫자 토큰을 입력해야 합니다. 이 토큰은 Google Authenticator와 같은 TOTP 호환 모바일 인증 애플리케이션에서 검색할 수 있는 시간 기반 일회용 비밀번호(TOTP)를 사용하여 생성됩니다.

시작하기 전에 먼저 애플리케이션의 `App\Models\User` 모델이 `Laravel\Fortify\TwoFactorAuthenticatable` 트레이트를 사용하는지 확인해야 합니다:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use Notifiable, TwoFactorAuthenticatable;
}
```

다음으로, 사용자가 2단계 인증 설정을 관리할 수 있는 화면을 애플리케이션 내에 구축해야 합니다. 이 화면에서는 사용자가 2단계 인증을 활성화 및 비활성화하고, 2단계 인증 복구 코드를 재생성할 수 있어야 합니다.

> 기본적으로 `fortify` 설정 파일의 `features` 배열은 Fortify의 2단계 인증 설정이 수정 전에 비밀번호 확인을 요구하도록 지시합니다. 따라서 계속하기 전에 애플리케이션에 Fortify의 [비밀번호 확인](#password-confirmation) 기능을 구현해야 합니다.

<a name="enabling-two-factor-authentication"></a>
### 2단계 인증 활성화

2단계 인증 활성화를 시작하려면 애플리케이션에서 Fortify가 정의한 `/user/two-factor-authentication` 엔드포인트로 POST 요청을 보내야 합니다. 요청이 성공하면 사용자는 이전 URL로 다시 리다이렉트되고 `status` 세션 변수가 `two-factor-authentication-enabled`로 설정됩니다. 템플릿 내에서 이 `status` 세션 변수를 감지하여 적절한 성공 메시지를 표시할 수 있습니다. 요청이 XHR 요청인 경우 `200` HTTP 응답이 반환됩니다.

2단계 인증 활성화를 선택한 후에도 사용자는 유효한 2단계 인증 코드를 제공하여 2단계 인증 구성을 "확인"해야 합니다. 따라서 "성공" 메시지에서 사용자에게 2단계 인증 확인이 여전히 필요하다고 안내해야 합니다:

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        아래에서 2단계 인증 설정을 완료하세요.
    </div>
@endif
```

다음으로, 사용자가 인증 애플리케이션에 스캔할 수 있도록 2단계 인증 QR 코드를 표시해야 합니다. Blade를 사용하여 애플리케이션의 프론트엔드를 렌더링하는 경우 사용자 인스턴스에서 사용할 수 있는 `twoFactorQrCodeSvg` 메서드를 사용하여 QR 코드 SVG를 검색할 수 있습니다:

```php
$request->user()->twoFactorQrCodeSvg();
```

JavaScript 기반 프론트엔드를 구축하는 경우 `/user/two-factor-qr-code` 엔드포인트에 XHR GET 요청을 보내 사용자의 2단계 인증 QR 코드를 검색할 수 있습니다. 이 엔드포인트는 `svg` 키가 포함된 JSON 객체를 반환합니다.

<a name="confirming-two-factor-authentication"></a>
#### 2단계 인증 확인

사용자의 2단계 인증 QR 코드를 표시하는 것 외에도 사용자가 유효한 인증 코드를 입력하여 2단계 인증 구성을 "확인"할 수 있는 텍스트 입력 필드를 제공해야 합니다. 이 코드는 Fortify가 정의한 `/user/confirmed-two-factor-authentication` 엔드포인트로 POST 요청을 통해 Laravel 애플리케이션에 제공해야 합니다.

요청이 성공하면 사용자는 이전 URL로 다시 리다이렉트되고 `status` 세션 변수가 `two-factor-authentication-confirmed`로 설정됩니다:

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        2단계 인증이 확인되고 성공적으로 활성화되었습니다.
    </div>
@endif
```

2단계 인증 확인 엔드포인트에 대한 요청이 XHR 요청을 통해 이루어진 경우 `200` HTTP 응답이 반환됩니다.

<a name="displaying-the-recovery-codes"></a>
#### 복구 코드 표시

사용자의 2단계 복구 코드도 표시해야 합니다. 이러한 복구 코드는 사용자가 모바일 장치에 대한 접근 권한을 잃은 경우 인증할 수 있게 해줍니다. Blade를 사용하여 애플리케이션의 프론트엔드를 렌더링하는 경우 인증된 사용자 인스턴스를 통해 복구 코드에 접근할 수 있습니다:

```php
(array) $request->user()->recoveryCodes()
```

JavaScript 기반 프론트엔드를 구축하는 경우 `/user/two-factor-recovery-codes` 엔드포인트에 XHR GET 요청을 보낼 수 있습니다. 이 엔드포인트는 사용자의 복구 코드가 포함된 JSON 배열을 반환합니다.

사용자의 복구 코드를 재생성하려면 애플리케이션에서 `/user/two-factor-recovery-codes` 엔드포인트로 POST 요청을 보내야 합니다.

<a name="authenticating-with-two-factor-authentication"></a>
### 2단계 인증으로 인증하기

인증 과정 중에 Fortify는 자동으로 사용자를 애플리케이션의 2단계 인증 챌린지 화면으로 리다이렉트합니다. 그러나 애플리케이션이 XHR 로그인 요청을 하는 경우, 성공적인 인증 시도 후 반환되는 JSON 응답에는 `two_factor` 불리언 속성이 있는 JSON 객체가 포함됩니다. 이 값을 검사하여 애플리케이션의 2단계 인증 챌린지 화면으로 리다이렉트해야 하는지 여부를 알 수 있습니다.

2단계 인증 기능 구현을 시작하려면 Fortify에 2단계 인증 챌린지 뷰를 반환하는 방법을 알려줘야 합니다. Fortify의 모든 인증 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 사용할 수 있는 적절한 메서드를 사용하여 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Fortify::twoFactorChallengeView(function () {
        return view('auth.two-factor-challenge');
    });

    // ...
}
```

Fortify가 이 뷰를 반환하는 `/two-factor-challenge` 라우트를 정의합니다. `two-factor-challenge` 템플릿에는 `/two-factor-challenge` 엔드포인트로 POST 요청을 보내는 폼이 포함되어야 합니다. `/two-factor-challenge` 액션은 유효한 TOTP 토큰을 포함하는 `code` 필드 또는 사용자의 복구 코드 중 하나를 포함하는 `recovery_code` 필드를 기대합니다.

로그인 시도가 성공하면 Fortify는 애플리케이션의 `fortify` 설정 파일에서 `home` 설정 옵션을 통해 구성된 URI로 사용자를 리다이렉트합니다. 로그인 요청이 XHR 요청인 경우 204 HTTP 응답이 반환됩니다.

요청이 성공하지 못한 경우 사용자는 2단계 챌린지 화면으로 다시 리다이렉트되고 유효성 검사 오류는 공유된 `$errors` [Blade 템플릿 변수](/docs/{{version}}/validation#quick-displaying-the-validation-errors)를 통해 사용할 수 있습니다. 또는 XHR 요청의 경우 유효성 검사 오류는 422 HTTP 응답과 함께 반환됩니다.

<a name="disabling-two-factor-authentication"></a>
### 2단계 인증 비활성화

2단계 인증을 비활성화하려면 애플리케이션에서 `/user/two-factor-authentication` 엔드포인트로 DELETE 요청을 보내야 합니다. Fortify의 2단계 인증 엔드포인트는 호출 전에 [비밀번호 확인](#password-confirmation)이 필요함을 기억하세요.

<a name="registration"></a>
## 회원가입

애플리케이션의 회원가입 기능 구현을 시작하려면 Fortify에 "register" 뷰를 반환하는 방법을 알려줘야 합니다. Fortify는 헤드리스 인증 라이브러리임을 기억하세요. 이미 완성된 Laravel 인증 기능의 프론트엔드 구현을 원한다면 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 사용해야 합니다.

모든 Fortify의 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 사용할 수 있는 적절한 메서드를 사용하여 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Fortify::registerView(function () {
        return view('auth.register');
    });

    // ...
}
```

Fortify가 이 뷰를 반환하는 `/register` 라우트를 정의합니다. `register` 템플릿에는 Fortify가 정의한 `/register` 엔드포인트로 POST 요청을 보내는 폼이 포함되어야 합니다.

`/register` 엔드포인트는 문자열 `name`, 문자열 이메일 주소/사용자명, `password`, `password_confirmation` 필드를 기대합니다. 이메일/사용자명 필드의 이름은 애플리케이션의 `fortify` 설정 파일에 정의된 `username` 설정 값과 일치해야 합니다.

회원가입 시도가 성공하면 Fortify는 애플리케이션의 `fortify` 설정 파일에서 `home` 설정 옵션을 통해 구성된 URI로 사용자를 리다이렉트합니다. 요청이 XHR 요청인 경우 201 HTTP 응답이 반환됩니다.

요청이 성공하지 못한 경우 사용자는 회원가입 화면으로 다시 리다이렉트되고 유효성 검사 오류는 공유된 `$errors` [Blade 템플릿 변수](/docs/{{version}}/validation#quick-displaying-the-validation-errors)를 통해 사용할 수 있습니다. 또는 XHR 요청의 경우 유효성 검사 오류는 422 HTTP 응답과 함께 반환됩니다.

<a name="customizing-registration"></a>
### 회원가입 커스터마이징

사용자 유효성 검사 및 생성 프로세스는 Laravel Fortify를 설치할 때 생성된 `App\Actions\Fortify\CreateNewUser` 액션을 수정하여 커스터마이징할 수 있습니다.

<a name="password-reset"></a>
## 비밀번호 재설정

<a name="requesting-a-password-reset-link"></a>
### 비밀번호 재설정 링크 요청

애플리케이션의 비밀번호 재설정 기능 구현을 시작하려면 Fortify에 "비밀번호 분실" 뷰를 반환하는 방법을 알려줘야 합니다. Fortify는 헤드리스 인증 라이브러리임을 기억하세요. 이미 완성된 Laravel 인증 기능의 프론트엔드 구현을 원한다면 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 사용해야 합니다.

모든 Fortify의 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 사용할 수 있는 적절한 메서드를 사용하여 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Fortify::requestPasswordResetLinkView(function () {
        return view('auth.forgot-password');
    });

    // ...
}
```

Fortify가 이 뷰를 반환하는 `/forgot-password` 엔드포인트를 정의합니다. `forgot-password` 템플릿에는 `/forgot-password` 엔드포인트로 POST 요청을 보내는 폼이 포함되어야 합니다.

`/forgot-password` 엔드포인트는 문자열 `email` 필드를 기대합니다. 이 필드/데이터베이스 컬럼의 이름은 애플리케이션의 `fortify` 설정 파일의 `email` 설정 값과 일치해야 합니다.

<a name="handling-the-password-reset-link-request-response"></a>
#### 비밀번호 재설정 링크 요청 응답 처리

비밀번호 재설정 링크 요청이 성공하면 Fortify는 사용자를 `/forgot-password` 엔드포인트로 다시 리다이렉트하고 비밀번호를 재설정하는 데 사용할 수 있는 안전한 링크가 포함된 이메일을 사용자에게 보냅니다. 요청이 XHR 요청인 경우 200 HTTP 응답이 반환됩니다.

성공적인 요청 후 `/forgot-password` 엔드포인트로 다시 리다이렉트된 후 `status` 세션 변수를 사용하여 비밀번호 재설정 링크 요청 시도의 상태를 표시할 수 있습니다.

`$status` 세션 변수의 값은 애플리케이션의 `passwords` [언어 파일](/docs/{{version}}/localization)에 정의된 번역 문자열 중 하나와 일치합니다. 이 값을 커스터마이징하고 싶고 Laravel의 언어 파일을 퍼블리시하지 않은 경우 `lang:publish` Artisan 명령어를 통해 할 수 있습니다:

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

요청이 성공하지 못한 경우 사용자는 비밀번호 재설정 링크 요청 화면으로 다시 리다이렉트되고 유효성 검사 오류는 공유된 `$errors` [Blade 템플릿 변수](/docs/{{version}}/validation#quick-displaying-the-validation-errors)를 통해 사용할 수 있습니다. 또는 XHR 요청의 경우 유효성 검사 오류는 422 HTTP 응답과 함께 반환됩니다.

<a name="resetting-the-password"></a>
### 비밀번호 재설정하기

애플리케이션의 비밀번호 재설정 기능 구현을 완료하려면 Fortify에 "비밀번호 재설정" 뷰를 반환하는 방법을 알려줘야 합니다.

모든 Fortify의 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 사용할 수 있는 적절한 메서드를 사용하여 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다:

```php
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Fortify::resetPasswordView(function (Request $request) {
        return view('auth.reset-password', ['request' => $request]);
    });

    // ...
}
```

Fortify가 이 뷰를 표시하는 라우트를 정의합니다. `reset-password` 템플릿에는 `/reset-password`로 POST 요청을 보내는 폼이 포함되어야 합니다.

`/reset-password` 엔드포인트는 문자열 `email` 필드, `password` 필드, `password_confirmation` 필드, 그리고 `request()->route('token')` 값을 포함하는 `token`이라는 숨겨진 필드를 기대합니다. "email" 필드/데이터베이스 컬럼의 이름은 애플리케이션의 `fortify` 설정 파일에 정의된 `email` 설정 값과 일치해야 합니다.

<a name="handling-the-password-reset-response"></a>
#### 비밀번호 재설정 응답 처리

비밀번호 재설정 요청이 성공하면 Fortify는 사용자가 새 비밀번호로 로그인할 수 있도록 `/login` 라우트로 다시 리다이렉트합니다. 또한 로그인 화면에서 재설정의 성공 상태를 표시할 수 있도록 `status` 세션 변수가 설정됩니다:

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

요청이 XHR 요청인 경우 200 HTTP 응답이 반환됩니다.

요청이 성공하지 못한 경우 사용자는 비밀번호 재설정 화면으로 다시 리다이렉트되고 유효성 검사 오류는 공유된 `$errors` [Blade 템플릿 변수](/docs/{{version}}/validation#quick-displaying-the-validation-errors)를 통해 사용할 수 있습니다. 또는 XHR 요청의 경우 유효성 검사 오류는 422 HTTP 응답과 함께 반환됩니다.

<a name="customizing-password-resets"></a>
### 비밀번호 재설정 커스터마이징

비밀번호 재설정 프로세스는 Laravel Fortify를 설치할 때 생성된 `App\Actions\ResetUserPassword` 액션을 수정하여 커스터마이징할 수 있습니다.

<a name="email-verification"></a>
## 이메일 인증

회원가입 후 사용자가 애플리케이션에 계속 접근하기 전에 이메일 주소를 인증하도록 할 수 있습니다. 시작하려면 `fortify` 설정 파일의 `features` 배열에서 `emailVerification` 기능이 활성화되어 있는지 확인하세요. 다음으로, `App\Models\User` 클래스가 `Illuminate\Contracts\Auth\MustVerifyEmail` 인터페이스를 구현하는지 확인해야 합니다.

이 두 가지 설정 단계가 완료되면 새로 등록된 사용자는 이메일 주소 소유권을 인증하라는 이메일을 받게 됩니다. 그러나 사용자가 이메일의 인증 링크를 클릭해야 한다는 것을 알려주는 이메일 인증 화면을 Fortify에 어떻게 표시할지 알려줘야 합니다.

모든 Fortify 뷰의 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 사용할 수 있는 적절한 메서드를 사용하여 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Fortify::verifyEmailView(function () {
        return view('auth.verify-email');
    });

    // ...
}
```

Fortify는 Laravel의 내장 `verified` 미들웨어에 의해 사용자가 `/email/verify` 엔드포인트로 리다이렉트될 때 이 뷰를 표시하는 라우트를 정의합니다.

`verify-email` 템플릿에는 이메일 주소로 전송된 이메일 인증 링크를 클릭하라는 안내 메시지가 포함되어야 합니다.

<a name="resending-email-verification-links"></a>
#### 이메일 인증 링크 재전송

원한다면 애플리케이션의 `verify-email` 템플릿에 `/email/verification-notification` 엔드포인트로 POST 요청을 트리거하는 버튼을 추가할 수 있습니다. 이 엔드포인트가 요청을 받으면 새로운 인증 이메일 링크가 사용자에게 이메일로 전송되어, 이전 링크가 실수로 삭제되거나 분실된 경우 새 인증 링크를 받을 수 있습니다.

인증 링크 이메일 재전송 요청이 성공하면 Fortify는 사용자를 `status` 세션 변수와 함께 `/email/verify` 엔드포인트로 다시 리다이렉트하여 작업이 성공했음을 알리는 정보 메시지를 사용자에게 표시할 수 있습니다. 요청이 XHR 요청인 경우 202 HTTP 응답이 반환됩니다:

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        새 이메일 인증 링크가 발송되었습니다!
    </div>
@endif
```

<a name="protecting-routes"></a>
### 라우트 보호

라우트 또는 라우트 그룹에서 사용자가 이메일 주소를 인증했는지 확인하도록 지정하려면 Laravel의 내장 `verified` 미들웨어를 라우트에 연결해야 합니다. `verified` 미들웨어 별칭은 Laravel에서 자동으로 등록되며 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 미들웨어의 별칭 역할을 합니다:

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션을 구축하는 동안 때때로 작업이 수행되기 전에 사용자에게 비밀번호 확인을 요구해야 하는 작업이 있을 수 있습니다. 일반적으로 이러한 라우트는 Laravel의 내장 `password.confirm` 미들웨어로 보호됩니다.

비밀번호 확인 기능 구현을 시작하려면 Fortify에 애플리케이션의 "비밀번호 확인" 뷰를 반환하는 방법을 알려줘야 합니다. Fortify는 헤드리스 인증 라이브러리임을 기억하세요. 이미 완성된 Laravel 인증 기능의 프론트엔드 구현을 원한다면 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 사용해야 합니다.

모든 Fortify의 뷰 렌더링 로직은 `Laravel\Fortify\Fortify` 클래스에서 사용할 수 있는 적절한 메서드를 사용하여 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\FortifyServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다:

```php
use Laravel\Fortify\Fortify;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Fortify::confirmPasswordView(function () {
        return view('auth.confirm-password');
    });

    // ...
}
```

Fortify가 이 뷰를 반환하는 `/user/confirm-password` 엔드포인트를 정의합니다. `confirm-password` 템플릿에는 `/user/confirm-password` 엔드포인트로 POST 요청을 보내는 폼이 포함되어야 합니다. `/user/confirm-password` 엔드포인트는 사용자의 현재 비밀번호를 포함하는 `password` 필드를 기대합니다.

비밀번호가 사용자의 현재 비밀번호와 일치하면 Fortify는 사용자가 접근하려고 했던 라우트로 리다이렉트합니다. 요청이 XHR 요청인 경우 201 HTTP 응답이 반환됩니다.

요청이 성공하지 못한 경우 사용자는 비밀번호 확인 화면으로 다시 리다이렉트되고 유효성 검사 오류는 공유된 `$errors` Blade 템플릿 변수를 통해 사용할 수 있습니다. 또는 XHR 요청의 경우 유효성 검사 오류는 422 HTTP 응답과 함께 반환됩니다.

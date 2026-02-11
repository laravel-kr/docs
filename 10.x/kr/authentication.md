# 인증(Authentication)

- [소개](#introduction)
    - [스타터 킷](#starter-kits)
    - [데이터베이스 고려사항](#introduction-database-considerations)
    - [생태계 개요](#ecosystem-overview)
- [인증 빠른 시작](#authentication-quickstart)
    - [스타터 킷 설치](#install-a-starter-kit)
    - [인증된 사용자 조회](#retrieving-the-authenticated-user)
    - [라우트 보호하기](#protecting-routes)
    - [로그인 제한](#login-throttling)
- [수동으로 사용자 인증하기](#authenticating-users)
    - [사용자 기억하기](#remembering-users)
    - [기타 인증 메서드](#other-authentication-methods)
- [HTTP 기본 인증](#http-basic-authentication)
    - [상태 비저장 HTTP 기본 인증](#stateless-http-basic-authentication)
- [로그아웃](#logging-out)
    - [다른 기기의 세션 무효화](#invalidating-sessions-on-other-devices)
- [비밀번호 확인](#password-confirmation)
    - [설정](#password-confirmation-configuration)
    - [라우팅](#password-confirmation-routing)
    - [라우트 보호하기](#password-confirmation-protecting-routes)
- [커스텀 가드 추가](#adding-custom-guards)
    - [클로저 요청 가드](#closure-request-guards)
- [커스텀 사용자 프로바이더 추가](#adding-custom-user-providers)
    - [사용자 프로바이더 Contract](#the-user-provider-contract)
    - [Authenticatable Contract](#the-authenticatable-contract)
- [소셜 인증](/docs/{{version}}/socialite)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

많은 웹 애플리케이션은 사용자가 애플리케이션에 인증하고 "로그인"할 수 있는 방법을 제공합니다. 이 기능을 웹 애플리케이션에 구현하는 것은 복잡하고 잠재적으로 위험한 작업일 수 있습니다. 이러한 이유로 Laravel은 인증을 빠르고 안전하며 쉽게 구현하는 데 필요한 도구를 제공하기 위해 노력합니다.

Laravel의 인증 기능의 핵심은 "가드(guards)"와 "프로바이더(providers)"로 구성됩니다. 가드는 각 요청에 대해 사용자를 어떻게 인증할지 정의합니다. 예를 들어, Laravel은 세션 저장소와 쿠키를 사용하여 상태를 유지하는 `session` 가드를 제공합니다.

프로바이더는 영구 저장소에서 사용자를 어떻게 조회할지 정의합니다. Laravel은 [Eloquent](/docs/{{version}}/eloquent)와 데이터베이스 쿼리 빌더를 사용하여 사용자를 조회하는 기능을 기본 제공합니다. 그러나 애플리케이션에 필요한 경우 추가적인 프로바이더를 자유롭게 정의할 수 있습니다.

애플리케이션의 인증 설정 파일은 `config/auth.php`에 위치합니다. 이 파일에는 Laravel 인증 서비스의 동작을 조정하기 위한 잘 문서화된 여러 옵션이 포함되어 있습니다.

> [!NOTE]  
> 가드와 프로바이더를 "역할(roles)"과 "권한(permissions)"과 혼동하지 마세요. 권한을 통한 사용자 작업 인가에 대해 더 알아보려면 [인가](/docs/{{version}}/authorization) 문서를 참조하세요.

<a name="starter-kits"></a>
### 스타터 킷

빠르게 시작하고 싶으신가요? 새로운 Laravel 애플리케이션에 [Laravel 애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 설치하세요. 데이터베이스를 마이그레이션한 후 브라우저에서 `/register` 또는 애플리케이션에 할당된 다른 URL로 이동하세요. 스타터 킷이 전체 인증 시스템의 스캐폴딩을 처리해 줄 것입니다!

**최종 Laravel 애플리케이션에서 스타터 킷을 사용하지 않기로 결정하더라도, [Laravel Breeze](/docs/{{version}}/starter-kits#laravel-breeze) 스타터 킷을 설치하면 실제 Laravel 프로젝트에서 Laravel의 모든 인증 기능을 어떻게 구현하는지 배울 수 있는 훌륭한 기회가 될 수 있습니다.** Laravel Breeze는 인증 컨트롤러, 라우트, 뷰를 생성해 주므로, 이러한 파일 내의 코드를 살펴보면 Laravel의 인증 기능이 어떻게 구현될 수 있는지 배울 수 있습니다.

<a name="introduction-database-considerations"></a>
### 데이터베이스 고려사항

기본적으로 Laravel은 `app/Models` 디렉토리에 `App\Models\User` [Eloquent 모델](/docs/{{version}}/eloquent)을 포함합니다. 이 모델은 기본 Eloquent 인증 드라이버와 함께 사용할 수 있습니다.

애플리케이션이 Eloquent를 사용하지 않는 경우, Laravel 쿼리 빌더를 사용하는 `database` 인증 프로바이더를 사용할 수 있습니다. 애플리케이션이 MongoDB를 사용하는 경우, MongoDB의 공식 [Laravel 사용자 인증 문서](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/user-authentication/) 를 확인하세요.

`App\Models\User` 모델의 데이터베이스 스키마를 구축할 때, 비밀번호 컬럼이 최소 60자 이상인지 확인하세요. 물론, 새로운 Laravel 애플리케이션에 포함된 `users` 테이블 마이그레이션은 이미 이 길이를 초과하는 컬럼을 생성합니다.

또한, `users` (또는 동등한) 테이블에 100자의 nullable, string `remember_token` 컬럼이 포함되어 있는지 확인해야 합니다. 이 컬럼은 애플리케이션에 로그인할 때 "로그인 상태 유지(remember me)" 옵션을 선택한 사용자의 토큰을 저장하는 데 사용됩니다. 마찬가지로, 새로운 Laravel 애플리케이션에 포함된 기본 `users` 테이블 마이그레이션에는 이미 이 컬럼이 포함되어 있습니다.

<a name="ecosystem-overview"></a>
### 생태계 개요

Laravel은 인증과 관련된 여러 패키지를 제공합니다. 계속하기 전에 Laravel의 일반적인 인증 생태계를 검토하고 각 패키지의 의도된 목적에 대해 논의하겠습니다.

먼저, 인증이 어떻게 작동하는지 살펴보겠습니다. 웹 브라우저를 사용할 때, 사용자는 로그인 폼을 통해 사용자 이름과 비밀번호를 제공합니다. 이 자격 증명이 올바르면, 애플리케이션은 인증된 사용자에 대한 정보를 사용자의 [세션](/docs/{{version}}/session)에 저장합니다. 브라우저에 발급된 쿠키에는 세션 ID가 포함되어 있어 애플리케이션에 대한 후속 요청이 사용자를 올바른 세션과 연결할 수 있습니다. 세션 쿠키가 수신되면, 애플리케이션은 세션 ID를 기반으로 세션 데이터를 조회하고, 인증 정보가 세션에 저장되었음을 확인한 후 사용자를 "인증됨"으로 간주합니다.

원격 서비스가 API에 접근하기 위해 인증해야 할 때, 웹 브라우저가 없기 때문에 쿠키는 일반적으로 인증에 사용되지 않습니다. 대신, 원격 서비스는 각 요청마다 API에 API 토큰을 보냅니다. 애플리케이션은 들어오는 토큰을 유효한 API 토큰 테이블과 비교하여 검증하고, 해당 API 토큰과 연결된 사용자가 수행한 것으로 요청을 "인증"할 수 있습니다.

<a name="laravels-built-in-browser-authentication-services"></a>
#### Laravel의 내장 브라우저 인증 서비스

Laravel은 일반적으로 `Auth`와 `Session` 파사드를 통해 접근하는 내장 인증 및 세션 서비스를 포함합니다. 이 기능들은 웹 브라우저에서 시작된 요청에 대해 쿠키 기반 인증을 제공합니다. 사용자의 자격 증명을 확인하고 사용자를 인증할 수 있는 메서드를 제공합니다. 또한, 이 서비스들은 적절한 인증 데이터를 사용자의 세션에 자동으로 저장하고 사용자의 세션 쿠키를 발급합니다. 이 서비스들을 사용하는 방법에 대한 설명은 이 문서에 포함되어 있습니다.

**애플리케이션 스타터 킷**

이 문서에서 논의한 대로, 이러한 인증 서비스와 수동으로 상호작용하여 애플리케이션의 자체 인증 레이어를 구축할 수 있습니다. 그러나 더 빠르게 시작할 수 있도록, 전체 인증 레이어의 견고하고 현대적인 스캐폴딩을 제공하는 [무료 패키지](/docs/{{version}}/starter-kits)를 출시했습니다. 이 패키지들은 [Laravel Breeze](/docs/{{version}}/starter-kits#laravel-breeze), [Laravel Jetstream](/docs/{{version}}/starter-kits#laravel-jetstream), [Laravel Fortify](/docs/{{version}}/fortify)입니다.

_Laravel Breeze_는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 확인을 포함하여 Laravel의 모든 인증 기능을 간단하고 최소한으로 구현한 것입니다. Laravel Breeze의 뷰 레이어는 [Tailwind CSS](https://tailwindcss.com)로 스타일링된 간단한 [Blade 템플릿](/docs/{{version}}/blade)으로 구성됩니다. 시작하려면 Laravel의 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits) 문서를 확인하세요.

_Laravel Fortify_는 이 문서에서 찾을 수 있는 많은 기능을 구현하는 Laravel용 헤드리스 인증 백엔드입니다. 쿠키 기반 인증뿐만 아니라 이중 인증(two-factor authentication)이나 이메일 인증 등의 다른 기능도 포함됩니다. Fortify는 Laravel Jetstream의 인증 백엔드를 제공하거나, Laravel과 인증해야 하는 SPA에 인증을 제공하기 위해 [Laravel Sanctum](/docs/{{version}}/sanctum)과 독립적으로 결합하여 사용할 수 있습니다.

_[Laravel Jetstream](https://jetstream.laravel.com)_은 [Tailwind CSS](https://tailwindcss.com), [Livewire](https://livewire.laravel.com), 그리고/또는 [Inertia](https://inertiajs.com)로 구동되는 아름답고 현대적인 UI와 함께 Laravel Fortify의 인증 서비스를 사용하고 노출하는 강력한 애플리케이션 스타터 킷입니다. Laravel Jetstream에는 이중 인증, 팀 지원, 브라우저 세션 관리, 프로필 관리, API 토큰 인증을 제공하기 위한 [Laravel Sanctum](/docs/{{version}}/sanctum)과의 내장 통합에 대한 선택적 지원이 포함되어 있습니다. Laravel의 API 인증 제공 사항은 아래에서 논의됩니다.

<a name="laravels-api-authentication-services"></a>
#### Laravel의 API 인증 서비스

Laravel은 API 토큰 관리 및 API 토큰으로 이루어진 요청 인증을 지원하는 두 가지 선택적 패키지를 제공합니다: [Passport](/docs/{{version}}/passport)와 [Sanctum](/docs/{{version}}/sanctum). 이 라이브러리와 Laravel의 내장 쿠키 기반 인증 라이브러리는 상호 배타적이지 않습니다. 이 라이브러리들은 주로 API 토큰 인증에 초점을 맞추고, 내장 인증 서비스는 쿠키 기반 브라우저 인증에 초점을 맞춥니다. 많은 애플리케이션이 Laravel의 내장 쿠키 기반 인증 서비스와 Laravel의 API 인증 패키지 중 하나를 모두 사용할 것입니다.

**Passport**

Passport는 다양한 OAuth2 "부여 유형(grant types)"을 제공하는 OAuth2 인증 프로바이더로, 다양한 유형의 토큰을 발급할 수 있습니다. 일반적으로 이것은 API 인증을 위한 견고하고 복잡한 패키지입니다. 그러나 대부분의 애플리케이션은 OAuth2 스펙이 제공하는 복잡한 기능을 필요로 하지 않으며, 이는 사용자와 개발자 모두에게 혼란을 줄 수 있습니다. 또한, 개발자들은 Passport와 같은 OAuth2 인증 프로바이더를 사용하여 SPA 애플리케이션이나 모바일 애플리케이션을 인증하는 방법에 대해 역사적으로 혼란스러워했습니다.

**Sanctum**

OAuth2의 복잡성과 개발자의 혼란에 대응하여, 웹 브라우저에서의 퍼스트파티 웹 요청과 토큰을 통한 API 요청을 모두 처리할 수 있는 더 간단하고 간소화된 인증 패키지를 구축했습니다. 이 목표는 [Laravel Sanctum](/docs/{{version}}/sanctum)의 출시로 실현되었으며, API와 함께 퍼스트파티 웹 UI를 제공하거나, 백엔드 Laravel 애플리케이션과 별도로 존재하는 단일 페이지 애플리케이션(SPA)으로 구동되거나, 모바일 클라이언트를 제공하는 애플리케이션에 권장되는 인증 패키지로 간주해야 합니다.

Laravel Sanctum은 애플리케이션의 전체 인증 프로세스를 관리할 수 있는 하이브리드 웹/API 인증 패키지입니다. Sanctum 기반 애플리케이션이 요청을 수신하면, Sanctum은 먼저 요청에 인증된 세션을 참조하는 세션 쿠키가 포함되어 있는지 확인합니다. Sanctum은 앞서 논의한 Laravel의 내장 인증 서비스를 호출하여 이를 수행합니다. 요청이 세션 쿠키를 통해 인증되지 않는 경우, Sanctum은 요청에서 API 토큰을 검사합니다. API 토큰이 있으면, Sanctum은 해당 토큰을 사용하여 요청을 인증합니다. 이 프로세스에 대해 더 알아보려면 Sanctum의 ["작동 방식"](/docs/{{version}}/sanctum#how-it-works) 문서를 참조하세요.

Laravel Sanctum은 대부분의 웹 애플리케이션의 인증 요구에 가장 적합하다고 판단하여 [Laravel Jetstream](https://jetstream.laravel.com) 애플리케이션 스타터 킷에 포함시킨 API 패키지입니다.

<a name="summary-choosing-your-stack"></a>
#### 요약 및 스택 선택

요약하면, 애플리케이션이 브라우저를 사용하여 접근되고 모놀리식 Laravel 애플리케이션을 구축하는 경우, 애플리케이션은 Laravel의 내장 인증 서비스를 사용할 것입니다.

다음으로, 애플리케이션이 서드파티에서 사용할 API를 제공하는 경우, [Passport](/docs/{{version}}/passport) 또는 [Sanctum](/docs/{{version}}/sanctum) 중에서 선택하여 애플리케이션에 API 토큰 인증을 제공할 것입니다. 일반적으로 Sanctum은 API 인증, SPA 인증, 모바일 인증을 위한 간단하고 완전한 솔루션이므로 가능한 경우 선호해야 하며, "스코프(scopes)" 또는 "능력(abilities)"에 대한 지원도 포함합니다.

Laravel 백엔드로 구동되는 단일 페이지 애플리케이션(SPA)을 구축하는 경우, [Laravel Sanctum](/docs/{{version}}/sanctum)을 사용해야 합니다. Sanctum을 사용할 때, [자체 백엔드 인증 라우트를 수동으로 구현](#authenticating-users)하거나 등록, 비밀번호 재설정, 이메일 확인 등의 기능을 위한 라우트와 컨트롤러를 제공하는 헤드리스 인증 백엔드 서비스인 [Laravel Fortify](/docs/{{version}}/fortify)를 활용해야 합니다.

애플리케이션이 OAuth2 스펙이 제공하는 모든 기능을 절대적으로 필요로 할 때 Passport를 선택할 수 있습니다.

그리고 빠르게 시작하고 싶다면, Laravel의 내장 인증 서비스와 Laravel Sanctum의 선호하는 인증 스택을 이미 사용하는 새로운 Laravel 애플리케이션을 빠르게 시작하는 방법으로 [Laravel Breeze](/docs/{{version}}/starter-kits#laravel-breeze)를 추천합니다.

<a name="authentication-quickstart"></a>
## 인증 빠른 시작

> [!WARNING]  
> 이 문서의 이 부분은 [Laravel 애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 통한 사용자 인증에 대해 다루며, 빠르게 시작할 수 있도록 UI 스캐폴딩을 포함합니다. Laravel의 인증 시스템과 직접 통합하려면 [수동으로 사용자 인증하기](#authenticating-users) 문서를 확인하세요.

<a name="install-a-starter-kit"></a>
### 스타터 킷 설치

먼저, [Laravel 애플리케이션 스타터 킷을 설치](/docs/{{version}}/starter-kits)해야 합니다. 현재 스타터 킷인 Laravel Breeze와 Laravel Jetstream은 새로운 Laravel 애플리케이션에 인증을 통합하기 위한 아름답게 디자인된 시작점을 제공합니다.

Laravel Breeze는 로그인, 회원가입, 비밀번호 재설정, 이메일 인증, 비밀번호 확인을 포함하여 Laravel의 모든 인증 기능을 최소한으로 간단하게 구현한 것입니다. Laravel Breeze의 뷰 레이어는 [Tailwind CSS](https://tailwindcss.com)로 스타일링된 간단한 [Blade 템플릿](/docs/{{version}}/blade)으로 구성됩니다. 또한 Breeze는 [Livewire](https://livewire.laravel.com) 또는 [Inertia](https://inertiajs.com) 기반의 스캐폴딩 옵션을 제공하며, Inertia 기반 스캐폴딩에는 Vue 또는 React를 선택할 수 있습니다.

[Laravel Jetstream](https://jetstream.laravel.com)은 [Livewire](https://livewire.laravel.com) 또는 [Inertia and Vue](https://inertiajs.com)를 사용하여 애플리케이션의 스캐폴딩을 지원하는 더 강력한 애플리케이션 스타터 킷입니다. 또한 Jetstream은 이중 인증, 팀, 프로필 관리, 브라우저 세션 관리, [Laravel Sanctum](/docs/{{version}}/sanctum)을 통한 API 지원, 계정 삭제 등의 선택적 지원을 제공합니다.

<a name="retrieving-the-authenticated-user"></a>
### 인증된 사용자 조회

인증 스타터 킷을 설치하고 사용자가 애플리케이션에 등록하고 인증할 수 있게 한 후, 현재 인증된 사용자와 상호작용해야 하는 경우가 많습니다. 들어오는 요청을 처리하는 동안, `Auth` 파사드의 `user` 메서드를 통해 인증된 사용자에 접근할 수 있습니다.

```php
use Illuminate\Support\Facades\Auth;

// 현재 인증된 사용자 조회...
$user = Auth::user();

// 현재 인증된 사용자의 ID 조회...
$id = Auth::id();
```

또는, 사용자가 인증되면 `Illuminate\Http\Request` 인스턴스를 통해 인증된 사용자에 접근할 수 있습니다. 타입 힌트된 클래스는 컨트롤러 메서드에 자동으로 주입됩니다. `Illuminate\Http\Request` 객체를 타입 힌트하면, 요청의 `user` 메서드를 통해 애플리케이션의 모든 컨트롤러 메서드에서 인증된 사용자에 편리하게 접근할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * 기존 항공편의 항공편 정보 업데이트.
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
#### 현재 사용자가 인증되었는지 확인

들어오는 HTTP 요청을 만드는 사용자가 인증되었는지 확인하려면 `Auth` 파사드의 `check` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 인증된 경우 `true`를 반환합니다.

```php
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // 사용자가 로그인되어 있습니다...
}
```

> [!NOTE]  
> `check` 메서드를 사용하여 사용자가 인증되었는지 확인할 수 있지만, 일반적으로 미들웨어를 사용하여 사용자가 특정 라우트/컨트롤러에 접근하기 전에 인증되었는지 확인합니다. 이에 대해 더 알아보려면 [라우트 보호하기](/docs/{{version}}/authentication#protecting-routes) 문서를 확인하세요.

<a name="protecting-routes"></a>
### 라우트 보호하기

[라우트 미들웨어](/docs/{{version}}/middleware)를 사용하여 인증된 사용자만 특정 라우트에 접근할 수 있도록 할 수 있습니다. Laravel은 `Illuminate\Auth\Middleware\Authenticate` 클래스의 [미들웨어 별칭](/docs/{{version}}/middleware#middleware-aliases)인 `auth` 미들웨어를 제공합니다. 이 미들웨어는 이미 Laravel 내부에서 별칭이 지정되어 있으므로, 라우트 정의에 미들웨어를 첨부하기만 하면 됩니다.

```php
Route::get('/flights', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('auth');
```

<a name="redirecting-unauthenticated-users"></a>
#### 인증되지 않은 사용자 리디렉션

`auth` 미들웨어가 인증되지 않은 사용자를 감지하면, 사용자를 `login` [이름이 지정된 라우트](/docs/{{version}}/routing#named-routes)로 리디렉션합니다. 애플리케이션의 `app/Http/Middleware/Authenticate.php` 파일에서 `redirectTo` 함수를 수정하여 이 동작을 변경할 수 있습니다.

    use Illuminate\Http\Request;

    /**
     * Get the path the user should be redirected to.
     */
    protected function redirectTo(Request $request): string
    {
        return route('login');
    }

<a name="specifying-a-guard"></a>
#### 가드 지정

라우트에 `auth` 미들웨어를 첨부할 때, 사용자를 인증하는 데 사용할 "가드"를 지정할 수도 있습니다. 지정된 가드는 `auth.php` 설정 파일의 `guards` 배열에 있는 키 중 하나에 해당해야 합니다.

```php
Route::get('/flights', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('auth:admin');
```

<a name="login-throttling"></a>
### 로그인 제한

Laravel Breeze 또는 Laravel Jetstream [스타터 킷](/docs/{{version}}/starter-kits)을 사용하는 경우, 로그인 시도에 자동으로 속도 제한이 적용됩니다. 기본적으로 여러 번 시도 후 올바른 자격 증명을 제공하지 못하면 사용자는 1분 동안 로그인할 수 없습니다. 제한은 사용자의 사용자 이름/이메일 주소와 IP 주소에 고유합니다.

> [!NOTE]  
> 애플리케이션의 다른 라우트에 속도 제한을 적용하려면 [속도 제한 문서](/docs/{{version}}/routing#rate-limiting)를 확인하세요.

<a name="authenticating-users"></a>
## 수동으로 사용자 인증하기

Laravel의 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)에 포함된 인증 스캐폴딩을 사용할 필요가 없습니다. 이 스캐폴딩을 사용하지 않기로 선택하면, Laravel 인증 클래스를 직접 사용하여 사용자 인증을 관리해야 합니다. 걱정하지 마세요, 아주 간단합니다!

`Auth` [파사드](/docs/{{version}}/facades)를 통해 Laravel의 인증 서비스에 접근하므로, 클래스 상단에서 `Auth` 파사드를 가져와야 합니다. 다음으로, `attempt` 메서드를 확인해 보겠습니다. `attempt` 메서드는 일반적으로 애플리케이션의 "로그인" 폼에서 인증 시도를 처리하는 데 사용됩니다. 인증이 성공하면, [세션 고정](https://en.wikipedia.org/wiki/Session_fixation)을 방지하기 위해 사용자의 [세션](/docs/{{version}}/session)을 재생성해야 합니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * 인증 시도 처리.
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
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }
}
```

`attempt` 메서드는 첫 번째 인수로 키/값 쌍의 배열을 받습니다. 배열의 값은 데이터베이스 테이블에서 사용자를 찾는 데 사용됩니다. 따라서 위 예제에서 사용자는 `email` 컬럼의 값으로 조회됩니다. 사용자가 발견되면, 데이터베이스에 저장된 해시된 비밀번호가 배열을 통해 메서드에 전달된 `password` 값과 비교됩니다. 프레임워크가 데이터베이스의 해시된 비밀번호와 비교하기 전에 값을 자동으로 해시하므로, 들어오는 요청의 `password` 값을 해시해서는 안 됩니다. 두 해시된 비밀번호가 일치하면 사용자에 대한 인증된 세션이 시작됩니다.

Laravel의 인증 서비스는 인증 가드의 "프로바이더" 설정을 기반으로 데이터베이스에서 사용자를 조회합니다. 기본 `config/auth.php` 설정 파일에서는 Eloquent 사용자 프로바이더가 지정되어 있으며, 사용자를 조회할 때 `App\Models\User` 모델을 사용하도록 지시됩니다. 애플리케이션의 필요에 따라 설정 파일에서 이러한 값을 변경할 수 있습니다.

`attempt` 메서드는 인증이 성공하면 `true`를 반환합니다. 그렇지 않으면 `false`가 반환됩니다.

Laravel의 리디렉터가 제공하는 `intended` 메서드는 인증 미들웨어에 의해 차단되기 전에 사용자가 접근하려던 URL로 사용자를 리디렉션합니다. 의도한 목적지를 사용할 수 없는 경우를 대비하여 이 메서드에 대체 URI를 제공할 수 있습니다.

<a name="specifying-additional-conditions"></a>
#### 추가 조건 지정

원한다면, 사용자의 이메일과 비밀번호 외에 인증 쿼리에 추가 쿼리 조건을 추가할 수 있습니다. 이를 수행하려면, `attempt` 메서드에 전달되는 배열에 쿼리 조건을 추가하기만 하면 됩니다. 예를 들어, 사용자가 "활성"으로 표시되어 있는지 확인할 수 있습니다.

```php
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // 인증 성공...
}
```

복잡한 쿼리 조건의 경우, 자격 증명 배열에 클로저를 제공할 수 있습니다. 이 클로저는 쿼리 인스턴스와 함께 호출되어, 애플리케이션의 필요에 따라 쿼리를 커스터마이징할 수 있습니다.

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
> 이 예제에서 `email`은 필수 옵션이 아니며, 단지 예제로 사용되었습니다. 데이터베이스 테이블에서 "사용자 이름"에 해당하는 컬럼 이름을 사용해야 합니다.

두 번째 인수로 클로저를 받는 `attemptWhen` 메서드는 실제로 사용자를 인증하기 전에 잠재적 사용자에 대해 더 광범위한 검사를 수행하는 데 사용할 수 있습니다. 클로저는 잠재적 사용자를 받고 사용자가 인증될 수 있는지 여부를 나타내는 `true` 또는 `false`를 반환해야 합니다.

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

`Auth` 파사드의 `guard` 메서드를 통해, 사용자를 인증할 때 어떤 가드 인스턴스를 사용할지 지정할 수 있습니다. 이를 통해 완전히 별도의 인증 가능한 모델이나 사용자 테이블을 사용하여 애플리케이션의 별도 부분에 대한 인증을 관리할 수 있습니다.

`guard` 메서드에 전달되는 가드 이름은 `auth.php` 설정 파일에 구성된 가드 중 하나에 해당해야 합니다.

```php
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

<a name="remembering-users"></a>
### 사용자 기억하기

많은 웹 애플리케이션은 로그인 폼에 "로그인 상태 유지(remember me)" 체크박스를 제공합니다. 애플리케이션에 "로그인 상태 유지" 기능을 제공하려면, `attempt` 메서드에 두 번째 인수로 불리언 값을 전달할 수 있습니다.

이 값이 `true`이면, Laravel은 사용자가 수동으로 로그아웃할 때까지 무기한으로 인증된 상태를 유지합니다. `users` 테이블에는 "로그인 상태 유지" 토큰을 저장하는 데 사용되는 문자열 `remember_token` 컬럼이 포함되어야 합니다. 새로운 Laravel 애플리케이션에 포함된 `users` 테이블 마이그레이션에는 이미 이 컬럼이 포함되어 있습니다.

```php
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // 사용자가 기억되고 있습니다...
}
```

애플리케이션이 "로그인 상태 유지" 기능을 제공하는 경우, `viaRemember` 메서드를 사용하여 현재 인증된 사용자가 "로그인 상태 유지" 쿠키를 사용하여 인증되었는지 확인할 수 있습니다.

```php
use Illuminate\Support\Facades\Auth;

if (Auth::viaRemember()) {
    // ...
}
```

<a name="other-authentication-methods"></a>
### 기타 인증 메서드

<a name="authenticate-a-user-instance"></a>
#### 사용자 인스턴스 인증

기존 사용자 인스턴스를 현재 인증된 사용자로 설정해야 하는 경우, 사용자 인스턴스를 `Auth` 파사드의 `login` 메서드에 전달할 수 있습니다. 주어진 사용자 인스턴스는 `Illuminate\Contracts\Auth\Authenticatable` [contract](/docs/{{version}}/contracts)의 구현이어야 합니다. Laravel에 포함된 `App\Models\User` 모델은 이미 이 인터페이스를 구현합니다. 이 인증 방법은 사용자가 애플리케이션에 등록한 직후와 같이 이미 유효한 사용자 인스턴스가 있을 때 유용합니다.

```php
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

`login` 메서드에 두 번째 인수로 불리언 값을 전달할 수 있습니다. 이 값은 인증된 세션에 "로그인 상태 유지" 기능이 필요한지 여부를 나타냅니다. 이것은 세션이 무기한으로 인증되거나 사용자가 애플리케이션에서 수동으로 로그아웃할 때까지 인증된다는 것을 의미합니다.

```php
Auth::login($user, $remember = true);
```

필요한 경우, `login` 메서드를 호출하기 전에 인증 가드를 지정할 수 있습니다.

```php
Auth::guard('admin')->login($user);
```

<a name="authenticate-a-user-by-id"></a>
#### ID로 사용자 인증

데이터베이스 레코드의 기본 키를 사용하여 사용자를 인증하려면 `loginUsingId` 메서드를 사용할 수 있습니다. 이 메서드는 인증하려는 사용자의 기본 키를 받습니다.

```php
Auth::loginUsingId(1);
```

`loginUsingId` 메서드의 두 번째 인수에 불리언 값을 전달할 수 있습니다. 이 값은 인증된 세션에 "로그인 상태 유지" 기능이 필요한지 여부를 나타냅니다. 이것은 세션이 무기한으로 인증되거나 사용자가 애플리케이션에서 수동으로 로그아웃할 때까지 인증된다는 것을 의미합니다.

```php
Auth::loginUsingId(1, $remember = true);
```

<a name="authenticate-a-user-once"></a>
#### 단일 요청에 대해 사용자 인증

`once` 메서드를 사용하여 단일 요청에 대해 애플리케이션에서 사용자를 인증할 수 있습니다. 이 메서드를 호출할 때 세션이나 쿠키가 사용되지 않습니다.

```php
if (Auth::once($credentials)) {
    // ...
}
```

<a name="http-basic-authentication"></a>
## HTTP 기본 인증

[HTTP 기본 인증](https://en.wikipedia.org/wiki/Basic_access_authentication)은 전용 "로그인" 페이지를 설정하지 않고도 애플리케이션 사용자를 인증하는 빠른 방법을 제공합니다. 시작하려면, 라우트에 `auth.basic` [미들웨어](/docs/{{version}}/middleware)를 첨부하세요. `auth.basic` 미들웨어는 Laravel 프레임워크에 포함되어 있으므로 정의할 필요가 없습니다.

```php
Route::get('/profile', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware('auth.basic');
```

미들웨어가 라우트에 첨부되면, 브라우저에서 라우트에 접근할 때 자동으로 자격 증명을 입력하라는 메시지가 표시됩니다. 기본적으로 `auth.basic` 미들웨어는 `users` 데이터베이스 테이블의 `email` 컬럼이 사용자의 "사용자 이름"이라고 가정합니다.

<a name="a-note-on-fastcgi"></a>
#### FastCGI에 대한 참고사항

PHP FastCGI와 Apache를 사용하여 Laravel 애플리케이션을 서비스하는 경우, HTTP 기본 인증이 올바르게 작동하지 않을 수 있습니다. 이러한 문제를 해결하려면 애플리케이션의 `.htaccess` 파일에 다음 줄을 추가할 수 있습니다.

```apache
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

<a name="stateless-http-basic-authentication"></a>
### 상태 비저장 HTTP 기본 인증

세션에 사용자 식별자 쿠키를 설정하지 않고 HTTP 기본 인증을 사용할 수도 있습니다. 이것은 주로 HTTP 인증을 사용하여 애플리케이션의 API에 대한 요청을 인증하도록 선택한 경우에 유용합니다. 이를 수행하려면, `onceBasic` 메서드를 호출하는 [미들웨어를 정의](/docs/{{version}}/middleware)하세요. `onceBasic` 메서드가 응답을 반환하지 않으면, 요청이 애플리케이션으로 더 전달될 수 있습니다.

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
     * 들어오는 요청 처리.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return Auth::onceBasic() ?: $next($request);
    }

}
```

다음으로, 라우트에 미들웨어를 첨부하세요.

```php
Route::get('/api/user', function () {
    // 인증된 사용자만 이 라우트에 접근할 수 있습니다...
})->middleware(AuthenticateOnceWithBasicAuth::class);
```

<a name="logging-out"></a>
## 로그아웃

애플리케이션에서 수동으로 사용자를 로그아웃하려면 `Auth` 파사드가 제공하는 `logout` 메서드를 사용할 수 있습니다. 이렇게 하면 사용자의 세션에서 인증 정보가 제거되어 후속 요청이 인증되지 않습니다.

`logout` 메서드를 호출하는 것 외에도, 사용자의 세션을 무효화하고 [CSRF 토큰](/docs/{{version}}/csrf)을 재생성하는 것이 권장됩니다. 사용자를 로그아웃한 후, 일반적으로 사용자를 애플리케이션의 루트로 리디렉션합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * 애플리케이션에서 사용자 로그아웃.
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
### 다른 기기의 세션 무효화

Laravel은 현재 기기의 세션을 무효화하지 않고 다른 기기에서 활성화된 사용자의 세션을 무효화하고 "로그아웃"하는 메커니즘도 제공합니다. 이 기능은 일반적으로 사용자가 비밀번호를 변경하거나 업데이트할 때 현재 기기는 인증된 상태를 유지하면서 다른 기기의 세션을 무효화하려는 경우에 활용됩니다.

시작하기 전에, 세션 인증을 받아야 하는 라우트에 `Illuminate\Session\Middleware\AuthenticateSession` 미들웨어가 포함되어 있는지 확인해야 합니다. 일반적으로 이 미들웨어를 라우트 그룹 정의에 배치하여 애플리케이션 라우트의 대부분에 적용할 수 있도록 해야 합니다. 기본적으로 `AuthenticateSession` 미들웨어는 `auth.session` 라우트 미들웨어 별칭(애플리케이션의 HTTP 커널에 정의된)을 사용하여 라우트에 첨부할 수 있습니다.

```php
Route::middleware(['auth', 'auth.session'])->group(function () {
    Route::get('/', function () {
        // ...
    });
});
```

그런 다음, `Auth` 파사드가 제공하는 `logoutOtherDevices` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 현재 비밀번호를 확인하도록 요구하며, 애플리케이션은 입력 폼을 통해 이를 받아야 합니다.

```php
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

`logoutOtherDevices` 메서드가 호출되면, 사용자의 다른 세션이 완전히 무효화됩니다. 즉, 이전에 인증되었던 모든 가드에서 "로그아웃"됩니다.

<a name="password-confirmation"></a>
## 비밀번호 확인

애플리케이션을 구축하는 동안, 때때로 작업이 수행되기 전이나 사용자가 애플리케이션의 민감한 영역으로 리디렉션되기 전에 사용자에게 비밀번호를 확인하도록 요구하는 작업이 있을 수 있습니다. Laravel은 이 프로세스를 쉽게 만드는 내장 미들웨어를 포함합니다. 이 기능을 구현하려면 두 개의 라우트를 정의해야 합니다: 하나는 사용자에게 비밀번호를 확인하도록 요청하는 뷰를 표시하는 라우트이고, 다른 하나는 비밀번호가 유효한지 확인하고 사용자를 의도한 목적지로 리디렉션하는 라우트입니다.

> [!NOTE]  
> 다음 문서는 Laravel의 비밀번호 확인 기능과 직접 통합하는 방법에 대해 논의합니다. 그러나 더 빠르게 시작하려면 [Laravel 애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)이 이 기능에 대한 지원을 포함합니다!

<a name="password-confirmation-configuration"></a>
### 설정

비밀번호를 확인한 후, 사용자는 3시간 동안 다시 비밀번호를 확인하라는 메시지를 받지 않습니다. 그러나 애플리케이션의 `config/auth.php` 설정 파일 내의 `password_timeout` 설정 값을 변경하여 사용자에게 비밀번호를 다시 요청하기 전의 시간을 구성할 수 있습니다.

<a name="password-confirmation-routing"></a>
### 라우팅

<a name="the-password-confirmation-form"></a>
#### 비밀번호 확인 폼

먼저, 사용자에게 비밀번호를 확인하도록 요청하는 뷰를 표시하는 라우트를 정의합니다.

```php
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

예상할 수 있듯이, 이 라우트에서 반환되는 뷰에는 `password` 필드가 포함된 폼이 있어야 합니다. 또한, 사용자가 애플리케이션의 보호된 영역에 들어가고 있으며 비밀번호를 확인해야 한다고 설명하는 텍스트를 뷰에 포함해도 좋습니다.

<a name="confirming-the-password"></a>
#### 비밀번호 확인

다음으로, "비밀번호 확인" 뷰에서 폼 요청을 처리하는 라우트를 정의합니다. 이 라우트는 비밀번호를 검증하고 사용자를 의도한 목적지로 리디렉션하는 역할을 합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;

Route::post('/confirm-password', function (Request $request) {
    if (! Hash::check($request->password, $request->user()->password)) {
        return back()->withErrors([
            'password' => ['The provided password does not match our records.']
        ]);
    }

    $request->session()->passwordConfirmed();

    return redirect()->intended();
})->middleware(['auth', 'throttle:6,1']);
```

계속하기 전에, 이 라우트를 더 자세히 살펴보겠습니다. 먼저, 요청의 `password` 필드가 실제로 인증된 사용자의 비밀번호와 일치하는지 확인합니다. 비밀번호가 유효하면, 사용자가 비밀번호를 확인했음을 Laravel의 세션에 알려야 합니다. `passwordConfirmed` 메서드는 사용자가 마지막으로 비밀번호를 확인한 시점을 Laravel이 확인하는 데 사용할 수 있는 타임스탬프를 사용자의 세션에 설정합니다. 마지막으로, 사용자를 의도한 목적지로 리디렉션할 수 있습니다.

<a name="password-confirmation-protecting-routes"></a>
### 라우트 보호하기

최근 비밀번호 확인이 필요한 작업을 수행하는 모든 라우트에 `password.confirm` 미들웨어가 할당되어 있는지 확인해야 합니다. 이 미들웨어는 Laravel의 기본 설치에 포함되어 있으며, 비밀번호를 확인한 후 해당 위치로 리디렉션할 수 있도록 세션에 사용자의 의도한 목적지를 자동으로 저장합니다. 세션에 사용자의 의도한 목적지를 저장한 후, 미들웨어는 사용자를 `password.confirm` [이름이 지정된 라우트](/docs/{{version}}/routing#named-routes)로 리디렉션합니다.

```php
Route::get('/settings', function () {
    // ...
})->middleware(['password.confirm']);

Route::post('/settings', function () {
    // ...
})->middleware(['password.confirm']);
```

<a name="adding-custom-guards"></a>
## 커스텀 가드 추가

`Auth` 파사드의 `extend` 메서드를 사용하여 자체 인증 가드를 정의할 수 있습니다. `extend` 메서드에 대한 호출을 [서비스 프로바이더](/docs/{{version}}/providers) 내에 배치해야 합니다. Laravel은 이미 `AppServiceProvider`를 제공하므로, 해당 프로바이더에 코드를 배치할 수 있습니다.

```php
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    // ...

    /**
     * 애플리케이션 서비스 부트스트랩.
     */
    public function boot(): void
    {
        Auth::extend('jwt', function (Application $app, string $name, array $config) {
            // Illuminate\Contracts\Auth\Guard 인스턴스 반환...

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

위 예제에서 볼 수 있듯이, `extend` 메서드에 전달된 콜백은 `Illuminate\Contracts\Auth\Guard`의 구현을 반환해야 합니다. 이 인터페이스에는 커스텀 가드를 정의하기 위해 구현해야 하는 몇 가지 메서드가 포함되어 있습니다. 커스텀 가드가 정의되면, `auth.php` 설정 파일의 `guards` 설정에서 가드를 참조할 수 있습니다.

```php
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

<a name="closure-request-guards"></a>
### 클로저 요청 가드

커스텀 HTTP 요청 기반 인증 시스템을 구현하는 가장 간단한 방법은 `Auth::viaRequest` 메서드를 사용하는 것입니다. 이 메서드를 사용하면 단일 클로저를 사용하여 인증 프로세스를 빠르게 정의할 수 있습니다.

시작하려면, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 내에서 `Auth::viaRequest` 메서드를 호출하세요. `viaRequest` 메서드는 첫 번째 인수로 인증 드라이버 이름을 받습니다. 이 이름은 커스텀 가드를 설명하는 모든 문자열이 될 수 있습니다. 메서드에 전달되는 두 번째 인수는 들어오는 HTTP 요청을 받고 사용자 인스턴스를 반환하거나, 인증이 실패하면 `null`을 반환하는 클로저여야 합니다.

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * 애플리케이션 서비스 부트스트랩.
 */
public function boot(): void
{
    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', (string) $request->token)->first();
    });
}
```

커스텀 인증 드라이버가 정의되면, `auth.php` 설정 파일의 `guards` 설정 내에서 드라이버로 구성할 수 있습니다.

```php
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

마지막으로, 라우트에 인증 미들웨어를 할당할 때 가드를 참조할 수 있습니다.

```php
Route::middleware('auth:api')->group(function () {
    // ...
});
```

<a name="adding-custom-user-providers"></a>
## 커스텀 사용자 프로바이더 추가

사용자를 저장하기 위해 전통적인 관계형 데이터베이스를 사용하지 않는 경우, 자체 인증 사용자 프로바이더로 Laravel을 확장해야 합니다. `Auth` 파사드의 `provider` 메서드를 사용하여 커스텀 사용자 프로바이더를 정의합니다. 사용자 프로바이더 리졸버는 `Illuminate\Contracts\Auth\UserProvider`의 구현을 반환해야 합니다.

```php
<?php

namespace App\Providers;

use App\Extensions\MongoUserProvider;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    // ...

    /**
     * 애플리케이션 서비스 부트스트랩.
     */
    public function boot(): void
    {
        Auth::provider('mongo', function (Application $app, array $config) {
            // Illuminate\Contracts\Auth\UserProvider 인스턴스 반환...

            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

`provider` 메서드를 사용하여 프로바이더를 등록한 후, `auth.php` 설정 파일에서 새 사용자 프로바이더로 전환할 수 있습니다. 먼저, 새 드라이버를 사용하는 `provider`를 정의합니다.

```php
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

마지막으로, `guards` 설정에서 이 프로바이더를 참조할 수 있습니다.

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
```

<a name="the-user-provider-contract"></a>
### 사용자 프로바이더 Contract

`Illuminate\Contracts\Auth\UserProvider` 구현은 MySQL, MongoDB 등과 같은 영구 저장소 시스템에서 `Illuminate\Contracts\Auth\Authenticatable` 구현을 가져오는 역할을 합니다. 이 두 인터페이스를 통해 사용자 데이터가 어떻게 저장되든 또는 인증된 사용자를 나타내는 데 어떤 유형의 클래스가 사용되든 상관없이 Laravel 인증 메커니즘이 계속 작동할 수 있습니다.

`Illuminate\Contracts\Auth\UserProvider` contract를 살펴보겠습니다.

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

`retrieveById` 함수는 일반적으로 MySQL 데이터베이스의 자동 증가 ID와 같이 사용자를 나타내는 키를 받습니다. ID와 일치하는 `Authenticatable` 구현을 검색하여 메서드에서 반환해야 합니다.

`retrieveByToken` 함수는 고유한 `$identifier`와 일반적으로 `remember_token`과 같은 데이터베이스 컬럼에 저장된 "로그인 상태 유지" `$token`으로 사용자를 검색합니다. 이전 메서드와 마찬가지로, 일치하는 토큰 값을 가진 `Authenticatable` 구현을 이 메서드에서 반환해야 합니다.

`updateRememberToken` 메서드는 `$user` 인스턴스의 `remember_token`을 새 `$token`으로 업데이트합니다. 성공적인 "로그인 상태 유지" 인증 시도 시 또는 사용자가 로그아웃할 때 새 토큰이 사용자에게 할당됩니다.

`retrieveByCredentials` 메서드는 애플리케이션에서 인증을 시도할 때 `Auth::attempt` 메서드에 전달된 자격 증명 배열을 받습니다. 그런 다음 메서드는 해당 자격 증명과 일치하는 사용자에 대해 기본 영구 저장소를 "쿼리"해야 합니다. 일반적으로 이 메서드는 `$credentials['username']` 값과 일치하는 "사용자 이름"을 가진 사용자 레코드를 검색하는 "where" 조건으로 쿼리를 실행합니다. 메서드는 `Authenticatable`의 구현을 반환해야 합니다. **이 메서드는 비밀번호 검증이나 인증을 시도해서는 안 됩니다.**

`validateCredentials` 메서드는 주어진 `$user`를 `$credentials`와 비교하여 사용자를 인증해야 합니다. 예를 들어, 이 메서드는 일반적으로 `Hash::check` 메서드를 사용하여 `$user->getAuthPassword()` 값을 `$credentials['password']` 값과 비교합니다. 이 메서드는 비밀번호가 유효한지 여부를 나타내는 `true` 또는 `false`를 반환해야 합니다.

<a name="the-authenticatable-contract"></a>
### Authenticatable Contract

이제 `UserProvider`의 각 메서드를 살펴보았으니, `Authenticatable` contract를 살펴보겠습니다. 사용자 프로바이더는 `retrieveById`, `retrieveByToken`, `retrieveByCredentials` 메서드에서 이 인터페이스의 구현을 반환해야 합니다.

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

이 인터페이스는 간단합니다. `getAuthIdentifierName` 메서드는 사용자의 "기본 키" 컬럼 이름을 반환해야 하고 `getAuthIdentifier` 메서드는 사용자의 "기본 키"를 반환해야 합니다. MySQL 백엔드를 사용하는 경우, 이것은 사용자 레코드에 할당된 자동 증가 기본 키일 것입니다. `getAuthPasswordName` 메서드는 사용자의 비밀번호 컬럼 이름을 반환해야 합니다. `getAuthPassword` 메서드는 사용자의 해시된 비밀번호를 반환해야 합니다.

이 인터페이스를 통해 사용하는 ORM이나 저장소 추상화 레이어에 관계없이 인증 시스템이 모든 "사용자" 클래스와 작동할 수 있습니다. 기본적으로 Laravel은 이 인터페이스를 구현하는 `App\Models\User` 클래스를 `app/Models` 디렉토리에 포함합니다.

<a name="events"></a>
## 이벤트

Laravel은 인증 프로세스 중에 다양한 [이벤트](/docs/{{version}}/events)를 발생시킵니다. 다음 이벤트에 대해 [리스너를 정의](/docs/{{version}}/events)할 수 있습니다.

<div class="overflow-auto">

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

</div>

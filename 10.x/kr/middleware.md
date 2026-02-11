# 미들웨어(Middleware)

- [소개](#introduction)
- [미들웨어 정의하기](#defining-middleware)
- [미들웨어 등록하기](#registering-middleware)
    - [글로벌 미들웨어](#global-middleware)
    - [라우트에 미들웨어 할당하기](#assigning-middleware-to-routes)
    - [미들웨어 그룹](#middleware-groups)
    - [미들웨어 정렬하기](#sorting-middleware)
- [미들웨어 파라미터](#middleware-parameters)
- [종료 가능한 미들웨어](#terminable-middleware)

<a name="introduction"></a>
## 소개

미들웨어는 애플리케이션으로 들어오는 HTTP 요청을 검사하고 필터링하는 편리한 메커니즘을 제공합니다. 예를 들어, Laravel은 애플리케이션 사용자가 인증되었는지 확인하는 미들웨어를 포함하고 있습니다. 사용자가 인증되지 않은 경우, 미들웨어는 사용자를 애플리케이션의 로그인 화면으로 리다이렉트합니다. 그러나 사용자가 인증된 경우, 미들웨어는 요청이 애플리케이션으로 더 깊이 진행되도록 허용합니다.

인증 외에도 다양한 작업을 수행하기 위해 추가적인 미들웨어를 작성할 수 있습니다. 예를 들어, 로깅 미들웨어는 애플리케이션으로 들어오는 모든 요청을 기록할 수 있습니다. Laravel 프레임워크에는 인증 및 CSRF 보호를 위한 미들웨어를 포함하여 여러 미들웨어가 포함되어 있습니다. 이러한 모든 미들웨어는 `app/Http/Middleware` 디렉토리에 위치합니다.

<a name="defining-middleware"></a>
## 미들웨어 정의하기

새로운 미들웨어를 생성하려면 `make:middleware` Artisan 명령어를 사용하세요:

```shell
php artisan make:middleware EnsureTokenIsValid
```

이 명령어는 `app/Http/Middleware` 디렉토리 안에 새로운 `EnsureTokenIsValid` 클래스를 생성합니다. 이 미들웨어에서는 제공된 `token` 입력이 지정된 값과 일치하는 경우에만 라우트에 대한 접근을 허용합니다. 그렇지 않으면 사용자를 `home` URI로 리다이렉트합니다:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTokenIsValid
{
    /**
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->input('token') !== 'my-secret-token') {
            return redirect('home');
        }

        return $next($request);
    }
}
```

보시다시피, 주어진 `token`이 비밀 토큰과 일치하지 않으면, 미들웨어는 클라이언트에게 HTTP 리다이렉트를 반환합니다. 그렇지 않으면 요청이 애플리케이션으로 더 깊이 전달됩니다. 요청을 애플리케이션 더 깊숙이 전달하려면(미들웨어가 "통과"하도록 허용), `$request`와 함께 `$next` 콜백을 호출해야 합니다.

미들웨어를 HTTP 요청이 애플리케이션에 도달하기 전에 통과해야 하는 일련의 "레이어"로 생각하는 것이 가장 좋습니다. 각 레이어는 요청을 검사하고 완전히 거부할 수도 있습니다.

> [!NOTE]
> 모든 미들웨어는 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)를 통해 해석되므로, 미들웨어의 생성자에서 필요한 의존성을 타입힌트할 수 있습니다.

<a name="middleware-and-responses"></a>
#### 미들웨어와 응답

물론 미들웨어는 요청을 애플리케이션 더 깊숙이 전달하기 전이나 후에 작업을 수행할 수 있습니다. 예를 들어, 다음 미들웨어는 요청이 애플리케이션에서 처리되기 **전에** 어떤 작업을 수행합니다:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BeforeMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // 작업 수행

        return $next($request);
    }
}
```

그러나 이 미들웨어는 요청이 애플리케이션에서 처리된 **후에** 작업을 수행합니다:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AfterMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // 작업 수행

        return $response;
    }
}
```

<a name="registering-middleware"></a>
## 미들웨어 등록하기

<a name="global-middleware"></a>
### 글로벌 미들웨어

애플리케이션에 대한 모든 HTTP 요청 중에 미들웨어를 실행하려면, `app/Http/Kernel.php` 클래스의 `$middleware` 속성에 미들웨어 클래스를 나열하세요.

<a name="assigning-middleware-to-routes"></a>
### 라우트에 미들웨어 할당하기

특정 라우트에 미들웨어를 할당하려면, 라우트를 정의할 때 `middleware` 메서드를 호출할 수 있습니다:

    use App\Http\Middleware\Authenticate;

    Route::get('/profile', function () {
        // ...
    })->middleware(Authenticate::class);

`middleware` 메서드에 미들웨어 이름의 배열을 전달하여 라우트에 여러 미들웨어를 할당할 수 있습니다:

    Route::get('/', function () {
        // ...
    })->middleware([First::class, Second::class]);

편의를 위해 애플리케이션의 `app/Http/Kernel.php` 파일에서 미들웨어에 별칭을 할당할 수 있습니다. 기본적으로 이 클래스의 `$middlewareAliases` 속성에는 Laravel에 포함된 미들웨어에 대한 항목이 포함되어 있습니다. 이 목록에 자신의 미들웨어를 추가하고 원하는 별칭을 할당할 수 있습니다:

    // App\Http\Kernel 클래스 내에서...

    protected $middlewareAliases = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
        'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
    ];

HTTP 커널에서 미들웨어 별칭이 정의되면, 라우트에 미들웨어를 할당할 때 별칭을 사용할 수 있습니다:

    Route::get('/profile', function () {
        // ...
    })->middleware('auth');

<a name="excluding-middleware"></a>
#### 미들웨어 제외하기

라우트 그룹에 미들웨어를 할당할 때, 가끔 그룹 내의 개별 라우트에 미들웨어가 적용되지 않도록 해야 할 수 있습니다. `withoutMiddleware` 메서드를 사용하여 이를 수행할 수 있습니다:

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::middleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/', function () {
        // ...
    });

    Route::get('/profile', function () {
        // ...
    })->withoutMiddleware([EnsureTokenIsValid::class]);
});
```

전체 라우트 정의 [그룹](/docs/{{version}}/routing#route-groups)에서 주어진 미들웨어 세트를 제외할 수도 있습니다:

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/profile', function () {
        // ...
    });
});
```

`withoutMiddleware` 메서드는 라우트 미들웨어만 제거할 수 있으며 [글로벌 미들웨어](#global-middleware)에는 적용되지 않습니다.

<a name="middleware-groups"></a>
### 미들웨어 그룹

때로는 여러 미들웨어를 단일 키 아래에 그룹화하여 라우트에 더 쉽게 할당하고 싶을 수 있습니다. HTTP 커널의 `$middlewareGroups` 속성을 사용하여 이를 수행할 수 있습니다.

Laravel에는 웹 및 API 라우트에 적용할 수 있는 일반적인 미들웨어가 포함된 사전 정의된 `web` 및 `api` 미들웨어 그룹이 있습니다. 이러한 미들웨어 그룹은 애플리케이션의 `App\Providers\RouteServiceProvider` 서비스 프로바이더에 의해 해당하는 `web` 및 `api` 라우트 파일 내의 라우트에 자동으로 적용됩니다:

    /**
     * 애플리케이션의 라우트 미들웨어 그룹.
     *
     * @var array
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

미들웨어 그룹은 개별 미들웨어와 동일한 구문을 사용하여 라우트 및 컨트롤러 액션에 할당할 수 있습니다. 미들웨어 그룹은 한 번에 여러 미들웨어를 라우트에 더 편리하게 할당할 수 있게 합니다:

    Route::get('/', function () {
        // ...
    })->middleware('web');

    Route::middleware(['web'])->group(function () {
        // ...
    });

> [!NOTE]
> 기본적으로 `web` 및 `api` 미들웨어 그룹은 `App\Providers\RouteServiceProvider`에 의해 애플리케이션의 해당하는 `routes/web.php` 및 `routes/api.php` 파일에 자동으로 적용됩니다.

<a name="sorting-middleware"></a>
### 미들웨어 정렬하기

드물지만, 미들웨어가 특정 순서로 실행되어야 하지만 라우트에 할당될 때 순서를 제어할 수 없는 경우가 있습니다. 이 경우 `app/Http/Kernel.php` 파일의 `$middlewarePriority` 속성을 사용하여 미들웨어 우선순위를 지정할 수 있습니다. 이 속성은 기본적으로 HTTP 커널에 존재하지 않을 수 있습니다. 존재하지 않는 경우 아래의 기본 정의를 복사할 수 있습니다:

    /**
     * 우선순위로 정렬된 미들웨어 목록.
     *
     * 이것은 비전역 미들웨어가 항상 주어진 순서대로 실행되도록 강제합니다.
     *
     * @var string[]
     */
    protected $middlewarePriority = [
        \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
        \Illuminate\Routing\Middleware\ThrottleRequests::class,
        \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
        \Illuminate\Contracts\Session\Middleware\AuthenticatesSessions::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\Auth\Middleware\Authorize::class,
    ];

<a name="middleware-parameters"></a>
## 미들웨어 파라미터

미들웨어는 추가 파라미터도 받을 수 있습니다. 예를 들어, 애플리케이션이 주어진 작업을 수행하기 전에 인증된 사용자가 주어진 "역할(role)"을 가지고 있는지 확인해야 하는 경우, 역할 이름을 추가 인수로 받는 `EnsureUserHasRole` 미들웨어를 만들 수 있습니다.

추가 미들웨어 파라미터는 `$next` 인수 다음에 미들웨어로 전달됩니다:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user()->hasRole($role)) {
            // 리다이렉트...
        }

        return $next($request);
    }
}
```

미들웨어 파라미터는 라우트를 정의할 때 미들웨어 이름과 파라미터를 `:`로 구분하여 지정할 수 있습니다:

    Route::put('/post/{id}', function (string $id) {
        // ...
    })->middleware('role:editor');

여러 파라미터는 쉼표로 구분할 수 있습니다:

    Route::put('/post/{id}', function (string $id) {
        // ...
    })->middleware('role:editor,publisher');

<a name="terminable-middleware"></a>
## 종료 가능한 미들웨어(Terminable Middleware)

때때로 미들웨어가 HTTP 응답이 브라우저로 전송된 후에 작업을 수행해야 할 수 있습니다. 미들웨어에 `terminate` 메서드를 정의하고 웹 서버가 FastCGI를 사용하는 경우, 응답이 브라우저로 전송된 후 `terminate` 메서드가 자동으로 호출됩니다:

```php
<?php

namespace Illuminate\Session\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TerminatingMiddleware
{
    /**
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    /**
     * 응답이 브라우저로 전송된 후 작업을 처리합니다.
     */
    public function terminate(Request $request, Response $response): void
    {
        // ...
    }
}
```

`terminate` 메서드는 요청과 응답 모두를 받아야 합니다. 종료 가능한 미들웨어를 정의한 후에는, `app/Http/Kernel.php` 파일에서 라우트 또는 글로벌 미들웨어 목록에 추가해야 합니다.

미들웨어에서 `terminate` 메서드를 호출할 때, Laravel은 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에서 미들웨어의 새로운 인스턴스를 해석합니다. `handle`과 `terminate` 메서드가 호출될 때 동일한 미들웨어 인스턴스를 사용하려면, 컨테이너의 `singleton` 메서드를 사용하여 컨테이너에 미들웨어를 등록하세요. 일반적으로 이것은 `AppServiceProvider`의 `register` 메서드에서 수행해야 합니다:

```php
use App\Http\Middleware\TerminatingMiddleware;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    $this->app->singleton(TerminatingMiddleware::class);
}
```

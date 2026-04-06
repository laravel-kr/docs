# 라우팅(Routing)

- [기본 라우팅](#basic-routing)
    - [기본 라우트 파일](#the-default-route-files)
    - [리다이렉트 라우트](#redirect-routes)
    - [뷰 라우트](#view-routes)
    - [라우트 목록 확인](#listing-your-routes)
    - [라우팅 커스터마이징](#routing-customization)
- [라우트 파라미터](#route-parameters)
    - [필수 파라미터](#required-parameters)
    - [선택적 파라미터](#parameters-optional-parameters)
    - [정규 표현식 제약조건](#parameters-regular-expression-constraints)
- [이름이 지정된 라우트](#named-routes)
- [라우트 그룹](#route-groups)
    - [미들웨어](#route-group-middleware)
    - [컨트롤러](#route-group-controllers)
    - [서브도메인 라우팅](#route-group-subdomain-routing)
    - [라우트 접두사](#route-group-prefixes)
    - [라우트 이름 접두사](#route-group-name-prefixes)
- [라우트 모델 바인딩](#route-model-binding)
    - [암시적 바인딩](#implicit-binding)
    - [암시적 Enum 바인딩](#implicit-enum-binding)
    - [명시적 바인딩](#explicit-binding)
- [대체 라우트](#fallback-routes)
- [속도 제한](#rate-limiting)
    - [속도 제한자 정의](#defining-rate-limiters)
    - [라우트에 속도 제한자 연결](#attaching-rate-limiters-to-routes)
- [Form 메소드 스푸핑](#form-method-spoofing)
- [현재 라우트 액세스](#accessing-the-current-route)
- [교차 출처 리소스 공유 (CORS)](#cors)
- [라우트 캐싱](#route-caching)

<a name="basic-routing"></a>
## 기본 라우팅(Basic Routing)

가장 기본적인 Laravel 라우트는 URI와 클로저(Closure)를 받으며, 복잡한 라우팅 설정 파일 없이도 라우트와 동작을 정의할 수 있는 매우 간단하고 표현력 있는 방법을 제공합니다:

```php
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

<a name="the-default-route-files"></a>
### 기본 라우트 파일(The Default Route Files)

모든 Laravel 라우트는 `routes` 디렉토리에 위치한 라우트 파일에 정의됩니다. 이 파일들은 애플리케이션의 `bootstrap/app.php` 파일에 지정된 설정을 사용하여 Laravel에 의해 자동으로 로드됩니다. `routes/web.php` 파일은 웹 인터페이스를 위한 라우트를 정의합니다. 이 라우트들은 세션 상태 및 CSRF 보호와 같은 기능을 제공하는 `web` [미들웨어 그룹](/docs/{{version}}/middleware#laravels-default-middleware-groups)에 할당됩니다.

대부분의 애플리케이션에서는 `routes/web.php` 파일에서 라우트를 정의하는 것으로 시작합니다. `routes/web.php`에 정의된 라우트는 브라우저에서 정의된 라우트의 URL을 입력하여 액세스할 수 있습니다. 예를 들어, 브라우저에서 `http://example.com/user`로 이동하여 다음 라우트에 액세스할 수 있습니다:

```php
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

<a name="api-routes"></a>
#### API 라우트(API Routes)

애플리케이션이 상태 비저장(stateless) API도 제공하는 경우, `install:api` Artisan 명령어를 사용하여 API 라우팅을 활성화할 수 있습니다:

```shell
php artisan install:api
```

`install:api` 명령어는 서드파티 API 소비자, SPA 또는 모바일 애플리케이션을 인증하는 데 사용할 수 있는 강력하면서도 간단한 API 토큰 인증 가드를 제공하는 [Laravel Sanctum](/docs/{{version}}/sanctum)을 설치합니다. 또한 `install:api` 명령어는 `routes/api.php` 파일을 생성합니다:

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

물론, 공개적으로 접근 가능해야 하는 라우트에서는 `auth:sanctum` 미들웨어를 생략할 수 있습니다.

`routes/api.php`의 라우트는 상태 비저장이며 `api` [미들웨어 그룹](/docs/{{version}}/middleware#laravels-default-middleware-groups)에 할당됩니다. 또한 `/api` URI 접두사가 이 라우트들에 자동으로 적용되므로, 파일의 모든 라우트에 수동으로 적용할 필요가 없습니다. 애플리케이션의 `bootstrap/app.php` 파일을 수정하여 접두사를 변경할 수 있습니다:

```php
->withRouting(
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api/admin',
    // ...
)
```

<a name="available-router-methods"></a>
#### 사용 가능한 라우터 메소드(Available Router Methods)

라우터를 사용하면 모든 HTTP 동사에 응답하는 라우트를 등록할 수 있습니다:

```php
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

때로는 여러 HTTP 동사에 응답하는 라우트를 등록해야 할 수도 있습니다. `match` 메소드를 사용하여 그렇게 할 수 있습니다. 또는 `any` 메소드를 사용하여 모든 HTTP 동사에 응답하는 라우트를 등록할 수도 있습니다:

```php
Route::match(['get', 'post'], '/', function () {
    // ...
});

Route::any('/', function () {
    // ...
});
```

> [!NOTE]
> 동일한 URI를 공유하는 여러 라우트를 정의할 때, `get`, `post`, `put`, `patch`, `delete`, `options` 메소드를 사용하는 라우트는 `any`, `match`, `redirect` 메소드를 사용하는 라우트보다 먼저 정의해야 합니다. 이렇게 하면 들어오는 요청이 올바른 라우트와 매칭됩니다.

<a name="dependency-injection"></a>
#### 의존성 주입(Dependency Injection)

라우트의 콜백 시그니처에서 라우트에 필요한 의존성을 타입 힌트할 수 있습니다. 선언된 의존성은 Laravel [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에 의해 자동으로 해결되어 콜백에 주입됩니다. 예를 들어, `Illuminate\Http\Request` 클래스를 타입 힌트하면 현재 HTTP 요청이 라우트 콜백에 자동으로 주입됩니다:

```php
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

<a name="csrf-protection"></a>
#### CSRF 보호(CSRF Protection)

`web` 라우트 파일에 정의된 `POST`, `PUT`, `PATCH`, `DELETE` 라우트를 가리키는 HTML 폼은 CSRF 토큰 필드를 포함해야 합니다. 그렇지 않으면 요청이 거부됩니다. CSRF 보호에 대한 자세한 내용은 [CSRF 문서](/docs/{{version}}/csrf)에서 확인할 수 있습니다:

```blade
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

<a name="redirect-routes"></a>
### 리다이렉트 라우트(Redirect Routes)

다른 URI로 리다이렉트하는 라우트를 정의하는 경우, `Route::redirect` 메소드를 사용할 수 있습니다. 이 메소드는 간단한 리다이렉트를 수행하기 위해 전체 라우트나 컨트롤러를 정의할 필요가 없는 편리한 단축키를 제공합니다:

```php
Route::redirect('/here', '/there');
```

기본적으로 `Route::redirect`는 `302` 상태 코드를 반환합니다. 선택적 세 번째 파라미터를 사용하여 상태 코드를 커스터마이징할 수 있습니다:

```php
Route::redirect('/here', '/there', 301);
```

또는 `Route::permanentRedirect` 메소드를 사용하여 `301` 상태 코드를 반환할 수 있습니다:

```php
Route::permanentRedirect('/here', '/there');
```

> [!WARNING]
> 리다이렉트 라우트에서 라우트 파라미터를 사용할 때, 다음 파라미터는 Laravel에 의해 예약되어 있으므로 사용할 수 없습니다: `destination` 및 `status`.

<a name="view-routes"></a>
### 뷰 라우트(View Routes)

라우트가 [뷰](/docs/{{version}}/views)만 반환해야 하는 경우, `Route::view` 메소드를 사용할 수 있습니다. `redirect` 메소드처럼, 이 메소드는 전체 라우트나 컨트롤러를 정의할 필요가 없는 간단한 단축키를 제공합니다. `view` 메소드는 첫 번째 인수로 URI를, 두 번째 인수로 뷰 이름을 받습니다. 또한 선택적 세 번째 인수로 뷰에 전달할 데이터 배열을 제공할 수 있습니다:

```php
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> [!WARNING]
> 뷰 라우트에서 라우트 파라미터를 사용할 때, 다음 파라미터는 Laravel에 의해 예약되어 있으므로 사용할 수 없습니다: `view`, `data`, `status`, `headers`.

<a name="listing-your-routes"></a>
### 라우트 목록 확인(Listing Your Routes)

`route:list` Artisan 명령어는 애플리케이션에 정의된 모든 라우트의 개요를 쉽게 제공할 수 있습니다:

```shell
php artisan route:list
```

기본적으로 각 라우트에 할당된 라우트 미들웨어는 `route:list` 출력에 표시되지 않습니다. 그러나 명령어에 `-v` 옵션을 추가하여 Laravel에 라우트 미들웨어와 미들웨어 그룹 이름을 표시하도록 지시할 수 있습니다:

```shell
php artisan route:list -v

# 미들웨어 그룹 확장...
php artisan route:list -vv
```

Laravel에 특정 URI로 시작하는 라우트만 표시하도록 지시할 수도 있습니다:

```shell
php artisan route:list --path=api
```

또한 `route:list` 명령어를 실행할 때 `--except-vendor` 옵션을 제공하여 서드파티 패키지에 의해 정의된 라우트를 숨기도록 Laravel에 지시할 수 있습니다:

```shell
php artisan route:list --except-vendor
```

마찬가지로, `route:list` 명령어를 실행할 때 `--only-vendor` 옵션을 제공하여 서드파티 패키지에 의해 정의된 라우트만 표시하도록 Laravel에 지시할 수 있습니다:

```shell
php artisan route:list --only-vendor
```

<a name="routing-customization"></a>
### 라우팅 커스터마이징(Routing Customization)

기본적으로 애플리케이션의 라우트는 `bootstrap/app.php` 파일에 의해 구성되고 로드됩니다:

```php
<?php

use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )->create();
```

그러나 때때로 애플리케이션 라우트의 하위 집합을 포함하는 완전히 새로운 파일을 정의하고 싶을 수 있습니다. 이를 수행하려면 `withRouting` 메소드에 `then` 클로저를 제공할 수 있습니다. 이 클로저 내에서 애플리케이션에 필요한 추가 라우트를 등록할 수 있습니다:

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    then: function () {
        Route::middleware('api')
            ->prefix('webhooks')
            ->name('webhooks.')
            ->group(base_path('routes/webhooks.php'));
    },
)
```

또는 `withRouting` 메소드에 `using` 클로저를 제공하여 라우트 등록을 완전히 제어할 수도 있습니다. 이 인수가 전달되면 프레임워크에 의해 HTTP 라우트가 등록되지 않으며, 모든 라우트를 수동으로 등록할 책임이 있습니다:

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    commands: __DIR__.'/../routes/console.php',
    using: function () {
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    },
)
```

<a name="route-parameters"></a>
## 라우트 파라미터(Route Parameters)

<a name="required-parameters"></a>
### 필수 파라미터(Required Parameters)

때때로 라우트 내에서 URI의 세그먼트를 캡처해야 할 수 있습니다. 예를 들어, URL에서 사용자의 ID를 캡처해야 할 수 있습니다. 라우트 파라미터를 정의하여 그렇게 할 수 있습니다:

```php
Route::get('/user/{id}', function (string $id) {
    return 'User '.$id;
});
```

라우트에서 필요한 만큼 많은 라우트 파라미터를 정의할 수 있습니다:

```php
Route::get('/posts/{post}/comments/{comment}', function (string $postId, string $commentId) {
    // ...
});
```

라우트 파라미터는 항상 `{}` 중괄호로 감싸지며 알파벳 문자로 구성되어야 합니다. 밑줄(`_`)도 라우트 파라미터 이름 내에서 허용됩니다. 라우트 파라미터는 순서에 따라 라우트 콜백/컨트롤러에 주입됩니다 - 라우트 콜백/컨트롤러 인수의 이름은 중요하지 않습니다.

<a name="parameters-and-dependency-injection"></a>
#### 파라미터와 의존성 주입(Parameters and Dependency Injection)

라우트에 Laravel 서비스 컨테이너가 라우트의 콜백에 자동으로 주입해야 하는 의존성이 있는 경우, 의존성 뒤에 라우트 파라미터를 나열해야 합니다:

```php
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, string $id) {
    return 'User '.$id;
});
```

<a name="parameters-optional-parameters"></a>
### 선택적 파라미터(Optional Parameters)

가끔 URI에 항상 존재하지 않을 수 있는 라우트 파라미터를 지정해야 할 수 있습니다. 파라미터 이름 뒤에 `?` 표시를 배치하여 그렇게 할 수 있습니다. 라우트의 해당 변수에 기본값을 지정해야 합니다:

```php
Route::get('/user/{name?}', function (?string $name = null) {
    return $name;
});

Route::get('/user/{name?}', function (?string $name = 'John') {
    return $name;
});
```

<a name="parameters-regular-expression-constraints"></a>
### 정규 표현식 제약조건(Regular Expression Constraints)

라우트 인스턴스에서 `where` 메소드를 사용하여 라우트 파라미터의 형식을 제한할 수 있습니다. `where` 메소드는 파라미터 이름과 파라미터가 어떻게 제한되어야 하는지를 정의하는 정규 표현식을 받습니다:

```php
Route::get('/user/{name}', function (string $name) {
    // ...
})->where('name', '[A-Za-z]+');

Route::get('/user/{id}', function (string $id) {
    // ...
})->where('id', '[0-9]+');

Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->where(['id' => '[0-9]+', 'name' => '[a-z]+']);
```

편의를 위해 일부 자주 사용되는 정규 표현식 패턴에는 라우트에 패턴 제약조건을 빠르게 추가할 수 있는 헬퍼 메소드가 있습니다:

```php
Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->whereNumber('id')->whereAlpha('name');

Route::get('/user/{name}', function (string $name) {
    // ...
})->whereAlphaNumeric('name');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUuid('id');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUlid('id');

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', ['movie', 'song', 'painting']);

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', CategoryEnum::cases());
```

들어오는 요청이 라우트 패턴 제약조건과 일치하지 않으면 404 HTTP 응답이 반환됩니다.

<a name="parameters-global-constraints"></a>
#### 전역 제약조건(Global Constraints)

라우트 파라미터가 주어진 정규 표현식에 항상 제한되도록 하려면 `pattern` 메소드를 사용할 수 있습니다. 이러한 패턴은 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메소드에서 정의해야 합니다:

```php
use Illuminate\Support\Facades\Route;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Route::pattern('id', '[0-9]+');
}
```

패턴이 정의되면 해당 파라미터 이름을 사용하는 모든 라우트에 자동으로 적용됩니다:

```php
Route::get('/user/{id}', function (string $id) {
    // {id}가 숫자인 경우에만 실행됩니다...
});
```

<a name="parameters-encoded-forward-slashes"></a>
#### 인코딩된 슬래시(Encoded Forward Slashes)

Laravel 라우팅 컴포넌트는 `/`를 제외한 모든 문자가 라우트 파라미터 값 내에 존재할 수 있도록 허용합니다. `where` 조건 정규 표현식을 사용하여 `/`가 플레이스홀더의 일부가 되도록 명시적으로 허용해야 합니다:

```php
Route::get('/search/{search}', function (string $search) {
    return $search;
})->where('search', '.*');
```

> [!WARNING]
> 인코딩된 슬래시는 마지막 라우트 세그먼트 내에서만 지원됩니다.

<a name="named-routes"></a>
## 이름이 지정된 라우트(Named Routes)

이름이 지정된 라우트는 특정 라우트에 대한 URL 또는 리다이렉트를 편리하게 생성할 수 있게 합니다. 라우트 정의에 `name` 메소드를 체이닝하여 라우트의 이름을 지정할 수 있습니다:

```php
Route::get('/user/profile', function () {
    // ...
})->name('profile');
```

컨트롤러 액션에 대한 라우트 이름도 지정할 수 있습니다:

```php
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> [!WARNING]
> 라우트 이름은 항상 고유해야 합니다.

<a name="generating-urls-to-named-routes"></a>
#### 이름이 지정된 라우트에 대한 URL 생성(Generating URLs to Named Routes)

주어진 라우트에 이름을 할당하면, Laravel의 `route` 및 `redirect` 헬퍼 함수를 통해 URL이나 리다이렉트를 생성할 때 라우트의 이름을 사용할 수 있습니다:

```php
// URL 생성...
$url = route('profile');

// 리다이렉트 생성...
return redirect()->route('profile');

return to_route('profile');
```

이름이 지정된 라우트가 파라미터를 정의하는 경우, `route` 함수의 두 번째 인수로 파라미터를 전달할 수 있습니다. 주어진 파라미터는 생성된 URL의 올바른 위치에 자동으로 삽입됩니다:

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1]);
```

배열에 추가 파라미터를 전달하면, 해당 키/값 쌍이 생성된 URL의 쿼리 문자열에 자동으로 추가됩니다:

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// http://example.com/user/1/profile?photos=yes
```

> [!NOTE]
> 때때로 현재 로케일과 같은 URL 파라미터에 대한 요청 전체 기본값을 지정하고 싶을 수 있습니다. 이를 수행하려면 [URL::defaults 메소드](/docs/{{version}}/urls#default-values)를 사용할 수 있습니다.

<a name="inspecting-the-current-route"></a>
#### 현재 라우트 검사(Inspecting the Current Route)

현재 요청이 주어진 이름의 라우트로 라우팅되었는지 확인하려면, Route 인스턴스에서 `named` 메소드를 사용할 수 있습니다. 예를 들어, 라우트 미들웨어에서 현재 라우트 이름을 확인할 수 있습니다:

```php
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * 들어오는 요청을 처리합니다.
 *
 * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
 */
public function handle(Request $request, Closure $next): Response
{
    if ($request->route()->named('profile')) {
        // ...
    }

    return $next($request);
}
```

<a name="route-groups"></a>
## 라우트 그룹(Route Groups)

라우트 그룹을 사용하면 미들웨어와 같은 라우트 속성을 각 개별 라우트에 정의할 필요 없이 많은 수의 라우트에서 공유할 수 있습니다.

중첩된 그룹은 부모 그룹과 속성을 지능적으로 "병합"하려고 시도합니다. 미들웨어와 `where` 조건은 병합되고, 이름과 접두사는 추가됩니다. 네임스페이스 구분자와 URI 접두사의 슬래시는 적절한 곳에 자동으로 추가됩니다.

<a name="route-group-middleware"></a>
### 미들웨어(Middleware)

그룹 내의 모든 라우트에 [미들웨어](/docs/{{version}}/middleware)를 할당하려면, 그룹을 정의하기 전에 `middleware` 메소드를 사용할 수 있습니다. 미들웨어는 배열에 나열된 순서대로 실행됩니다:

```php
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // first와 second 미들웨어를 사용합니다...
    });

    Route::get('/user/profile', function () {
        // first와 second 미들웨어를 사용합니다...
    });
});
```

<a name="route-group-controllers"></a>
### 컨트롤러(Controllers)

라우트 그룹이 모두 동일한 [컨트롤러](/docs/{{version}}/controllers)를 사용하는 경우, `controller` 메소드를 사용하여 그룹 내의 모든 라우트에 대한 공통 컨트롤러를 정의할 수 있습니다. 그런 다음 라우트를 정의할 때 호출하는 컨트롤러 메소드만 제공하면 됩니다:

```php
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

<a name="route-group-subdomain-routing"></a>
### 서브도메인 라우팅(Subdomain Routing)

라우트 그룹은 서브도메인 라우팅을 처리하는 데에도 사용할 수 있습니다. 서브도메인은 라우트 URI처럼 라우트 파라미터를 할당받을 수 있으므로, 라우트나 컨트롤러에서 사용하기 위해 서브도메인의 일부를 캡처할 수 있습니다. 그룹을 정의하기 전에 `domain` 메소드를 호출하여 서브도메인을 지정할 수 있습니다:

```php
Route::domain('{account}.example.com')->group(function () {
    Route::get('/user/{id}', function (string $account, string $id) {
        // ...
    });
});
```

<a name="route-group-prefixes"></a>
### 라우트 접두사(Route Prefixes)

`prefix` 메소드를 사용하여 그룹의 각 라우트에 주어진 URI를 접두사로 붙일 수 있습니다. 예를 들어, 그룹 내의 모든 라우트 URI에 `admin` 접두사를 붙이고 싶을 수 있습니다:

```php
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // "/admin/users" URL과 매칭됩니다
    });
});
```

<a name="route-group-name-prefixes"></a>
### 라우트 이름 접두사(Route Name Prefixes)

`name` 메소드를 사용하여 그룹의 각 라우트 이름에 주어진 문자열을 접두사로 붙일 수 있습니다. 예를 들어, 그룹 내의 모든 라우트 이름에 `admin` 접두사를 붙이고 싶을 수 있습니다. 주어진 문자열은 지정된 그대로 라우트 이름에 접두사로 붙으므로, 접두사에 후행 `.` 문자를 제공해야 합니다:

```php
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // 라우트에 "admin.users" 이름이 할당됩니다...
    })->name('users');
});
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩(Route Model Binding)

라우트나 컨트롤러 액션에 모델 ID를 주입할 때, 종종 해당 ID에 해당하는 모델을 검색하기 위해 데이터베이스를 쿼리합니다. Laravel 라우트 모델 바인딩은 모델 인스턴스를 라우트에 직접 자동으로 주입하는 편리한 방법을 제공합니다. 예를 들어, 사용자의 ID를 주입하는 대신 주어진 ID와 일치하는 전체 `User` 모델 인스턴스를 주입할 수 있습니다.

<a name="implicit-binding"></a>
### 암시적 바인딩(Implicit Binding)

Laravel은 라우트나 컨트롤러 액션에 정의된 Eloquent 모델 중 타입 힌트된 변수 이름이 라우트 세그먼트 이름과 일치하는 것을 자동으로 해결합니다. 예를 들어:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

`$user` 변수가 `App\Models\User` Eloquent 모델로 타입 힌트되어 있고 변수 이름이 `{user}` URI 세그먼트와 일치하므로, Laravel은 요청 URI의 해당 값과 일치하는 ID를 가진 모델 인스턴스를 자동으로 주입합니다. 데이터베이스에서 일치하는 모델 인스턴스를 찾을 수 없으면 404 HTTP 응답이 자동으로 생성됩니다.

물론, 암시적 바인딩은 컨트롤러 메소드를 사용할 때도 가능합니다. 다시 한번, `{user}` URI 세그먼트가 `App\Models\User` 타입 힌트를 포함하는 컨트롤러의 `$user` 변수와 일치함을 주목하세요:

```php
use App\Http\Controllers\UserController;
use App\Models\User;

// 라우트 정의...
Route::get('/users/{user}', [UserController::class, 'show']);

// 컨트롤러 메소드 정의...
public function show(User $user)
{
    return view('user.profile', ['user' => $user]);
}
```

<a name="implicit-soft-deleted-models"></a>
#### 소프트 삭제된 모델(Soft Deleted Models)

일반적으로 암시적 모델 바인딩은 [소프트 삭제](/docs/{{version}}/eloquent#soft-deleting)된 모델을 검색하지 않습니다. 그러나 라우트 정의에 `withTrashed` 메소드를 체이닝하여 암시적 바인딩이 이러한 모델을 검색하도록 지시할 수 있습니다:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
})->withTrashed();
```

<a name="customizing-the-default-key-name"></a>
#### 키 커스터마이징(Customizing the Key)

때때로 `id` 이외의 컬럼을 사용하여 Eloquent 모델을 해결하고 싶을 수 있습니다. 그렇게 하려면 라우트 파라미터 정의에서 컬럼을 지정할 수 있습니다:

```php
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

주어진 모델 클래스를 검색할 때 모델 바인딩이 `id` 이외의 데이터베이스 컬럼을 항상 사용하도록 하려면, Eloquent 모델에서 `getRouteKeyName` 메소드를 오버라이드할 수 있습니다:

```php
/**
 * 모델의 라우트 키를 가져옵니다.
 */
public function getRouteKeyName(): string
{
    return 'slug';
}
```

<a name="implicit-model-binding-scoping"></a>
#### 커스텀 키와 스코핑(Custom Keys and Scoping)

단일 라우트 정의에서 여러 Eloquent 모델을 암시적으로 바인딩할 때, 두 번째 Eloquent 모델이 이전 Eloquent 모델의 자식이어야 하도록 스코프를 지정하고 싶을 수 있습니다. 예를 들어, 특정 사용자의 블로그 포스트를 슬러그로 검색하는 이 라우트 정의를 고려해 보세요:

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

커스텀 키 암시적 바인딩을 중첩 라우트 파라미터로 사용할 때, Laravel은 부모에서 중첩 모델을 검색하기 위해 관계 이름을 추측하는 규칙을 사용하여 쿼리를 자동으로 스코프합니다. 이 경우, `User` 모델이 `Post` 모델을 검색하는 데 사용할 수 있는 `posts`(라우트 파라미터 이름의 복수형)라는 관계를 가지고 있다고 가정합니다.

원하는 경우 커스텀 키가 제공되지 않은 경우에도 Laravel이 "자식" 바인딩을 스코프하도록 지시할 수 있습니다. 그렇게 하려면 라우트를 정의할 때 `scopeBindings` 메소드를 호출할 수 있습니다:

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

또는 전체 라우트 정의 그룹이 스코프 바인딩을 사용하도록 지시할 수 있습니다:

```php
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

마찬가지로, `withoutScopedBindings` 메소드를 호출하여 Laravel이 바인딩을 스코프하지 않도록 명시적으로 지시할 수 있습니다:

```php
Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
})->withoutScopedBindings();
```

<a name="customizing-missing-model-behavior"></a>
#### 누락된 모델 동작 커스터마이징(Customizing Missing Model Behavior)

일반적으로 암시적으로 바인딩된 모델을 찾을 수 없으면 404 HTTP 응답이 생성됩니다. 그러나 라우트를 정의할 때 `missing` 메소드를 호출하여 이 동작을 커스터마이징할 수 있습니다. `missing` 메소드는 암시적으로 바인딩된 모델을 찾을 수 없을 때 호출될 클로저를 받습니다:

```php
use App\Http\Controllers\LocationsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::get('/locations/{location:slug}', [LocationsController::class, 'show'])
    ->name('locations.view')
    ->missing(function (Request $request) {
        return Redirect::route('locations.index');
    });
```

<a name="implicit-enum-binding"></a>
### 암시적 Enum 바인딩(Implicit Enum Binding)

PHP 8.1은 [Enum](https://www.php.net/manual/en/language.enumerations.backed.php)에 대한 지원을 도입했습니다. 이 기능을 보완하기 위해, Laravel은 라우트 정의에서 [문자열 기반 Enum](https://www.php.net/manual/en/language.enumerations.backed.php)을 타입 힌트할 수 있게 하며, Laravel은 해당 라우트 세그먼트가 유효한 Enum 값에 해당하는 경우에만 라우트를 호출합니다. 그렇지 않으면 404 HTTP 응답이 자동으로 반환됩니다. 예를 들어, 다음 Enum이 주어졌을 때:

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

`{category}` 라우트 세그먼트가 `fruits` 또는 `people`인 경우에만 호출되는 라우트를 정의할 수 있습니다. 그렇지 않으면 Laravel은 404 HTTP 응답을 반환합니다:

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

<a name="explicit-binding"></a>
### 명시적 바인딩(Explicit Binding)

모델 바인딩을 사용하기 위해 Laravel의 암시적, 규칙 기반 모델 해결을 사용할 필요는 없습니다. 라우트 파라미터가 모델에 어떻게 대응하는지 명시적으로 정의할 수도 있습니다. 명시적 바인딩을 등록하려면, 라우터의 `model` 메소드를 사용하여 주어진 파라미터에 대한 클래스를 지정합니다. `AppServiceProvider` 클래스의 `boot` 메소드 시작 부분에서 명시적 모델 바인딩을 정의해야 합니다:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Route::model('user', User::class);
}
```

다음으로, `{user}` 파라미터를 포함하는 라우트를 정의합니다:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    // ...
});
```

모든 `{user}` 파라미터를 `App\Models\User` 모델에 바인딩했으므로, 해당 클래스의 인스턴스가 라우트에 주입됩니다. 예를 들어, `users/1`에 대한 요청은 ID가 `1`인 데이터베이스의 `User` 인스턴스를 주입합니다.

데이터베이스에서 일치하는 모델 인스턴스를 찾을 수 없으면 404 HTTP 응답이 자동으로 생성됩니다.

<a name="customizing-the-resolution-logic"></a>
#### 해결 로직 커스터마이징(Customizing the Resolution Logic)

고유한 모델 바인딩 해결 로직을 정의하려면 `Route::bind` 메소드를 사용할 수 있습니다. `bind` 메소드에 전달하는 클로저는 URI 세그먼트의 값을 받고, 라우트에 주입해야 하는 클래스의 인스턴스를 반환해야 합니다. 다시 한번, 이 커스터마이징은 애플리케이션의 `AppServiceProvider`의 `boot` 메소드에서 수행해야 합니다:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Route::bind('user', function (string $value) {
        return User::where('name', $value)->firstOrFail();
    });
}
```

또는 Eloquent 모델에서 `resolveRouteBinding` 메소드를 오버라이드할 수 있습니다. 이 메소드는 URI 세그먼트의 값을 받고, 라우트에 주입해야 하는 클래스의 인스턴스를 반환해야 합니다:

```php
/**
 * 바인딩된 값에 대한 모델을 검색합니다.
 *
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveRouteBinding($value, $field = null)
{
    return $this->where('name', $value)->firstOrFail();
}
```

라우트가 [암시적 바인딩 스코핑](#implicit-model-binding-scoping)을 사용하는 경우, `resolveChildRouteBinding` 메소드가 부모 모델의 자식 바인딩을 해결하는 데 사용됩니다:

```php
/**
 * 바인딩된 값에 대한 자식 모델을 검색합니다.
 *
 * @param  string  $childType
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveChildRouteBinding($childType, $value, $field)
{
    return parent::resolveChildRouteBinding($childType, $value, $field);
}
```

<a name="fallback-routes"></a>
## 대체 라우트(Fallback Routes)

`Route::fallback` 메소드를 사용하여 다른 라우트가 들어오는 요청과 일치하지 않을 때 실행될 라우트를 정의할 수 있습니다. 일반적으로 처리되지 않은 요청은 애플리케이션의 예외 핸들러를 통해 "404" 페이지를 자동으로 렌더링합니다. 그러나 일반적으로 `routes/web.php` 파일 내에서 `fallback` 라우트를 정의하므로, `web` 미들웨어 그룹의 모든 미들웨어가 라우트에 적용됩니다. 필요에 따라 이 라우트에 추가 미들웨어를 자유롭게 추가할 수 있습니다:

```php
Route::fallback(function () {
    // ...
});
```

<a name="rate-limiting"></a>
## 속도 제한(Rate Limiting)

<a name="defining-rate-limiters"></a>
### 속도 제한자 정의(Defining Rate Limiters)

Laravel에는 주어진 라우트 또는 라우트 그룹의 트래픽 양을 제한하는 데 활용할 수 있는 강력하고 커스터마이징 가능한 속도 제한 서비스가 포함되어 있습니다. 시작하려면 애플리케이션의 필요를 충족하는 속도 제한자 설정을 정의해야 합니다.

속도 제한자는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메소드 내에서 정의할 수 있습니다:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
}
```

속도 제한자는 `RateLimiter` 파사드의 `for` 메소드를 사용하여 정의합니다. `for` 메소드는 속도 제한자 이름과 속도 제한자에 할당된 라우트에 적용해야 하는 제한 설정을 반환하는 클로저를 받습니다. 제한 설정은 `Illuminate\Cache\RateLimiting\Limit` 클래스의 인스턴스입니다. 이 클래스는 제한을 빠르게 정의할 수 있는 유용한 "빌더" 메소드를 포함합니다. 속도 제한자 이름은 원하는 문자열이면 됩니다:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000);
    });
}
```

들어오는 요청이 지정된 속도 제한을 초과하면 429 HTTP 상태 코드의 응답이 Laravel에 의해 자동으로 반환됩니다. 속도 제한에 의해 반환되어야 하는 자체 응답을 정의하려면 `response` 메소드를 사용할 수 있습니다:

```php
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function (Request $request, array $headers) {
        return response('Custom response...', 429, $headers);
    });
});
```

속도 제한자 콜백은 들어오는 HTTP 요청 인스턴스를 받으므로, 들어오는 요청이나 인증된 사용자에 따라 적절한 속도 제한을 동적으로 구축할 수 있습니다:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()?->vipCustomer()
        ? Limit::none()
        : Limit::perHour(10);
});
```

<a name="segmenting-rate-limits"></a>
#### 속도 제한 세분화(Segmenting Rate Limits)

때때로 임의의 값으로 속도 제한을 세분화하고 싶을 수 있습니다. 예를 들어, 사용자가 IP 주소당 분당 100번 주어진 라우트에 액세스하도록 허용하고 싶을 수 있습니다. 이를 수행하려면 속도 제한을 구축할 때 `by` 메소드를 사용할 수 있습니다:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
        ? Limit::none()
        : Limit::perMinute(100)->by($request->ip());
});
```

다른 예를 사용하여 이 기능을 설명하자면, 인증된 사용자 ID당 분당 100번 또는 게스트의 경우 IP 주소당 분당 10번으로 라우트 액세스를 제한할 수 있습니다:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(100)->by($request->user()->id)
        : Limit::perMinute(10)->by($request->ip());
});
```

<a name="multiple-rate-limits"></a>
#### 다중 속도 제한(Multiple Rate Limits)

필요한 경우 주어진 속도 제한자 설정에 대해 속도 제한 배열을 반환할 수 있습니다. 각 속도 제한은 배열에 배치된 순서에 따라 라우트에 대해 평가됩니다:

```php
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

동일한 `by` 값으로 세분화된 여러 속도 제한을 할당하는 경우, 각 `by` 값이 고유한지 확인해야 합니다. 이를 달성하는 가장 쉬운 방법은 `by` 메소드에 주어진 값에 접두사를 붙이는 것입니다:

```php
RateLimiter::for('uploads', function (Request $request) {
    return [
        Limit::perMinute(10)->by('minute:'.$request->user()->id),
        Limit::perDay(1000)->by('day:'.$request->user()->id),
    ];
});
```

<a name="response-base-rate-limiting"></a>
#### 응답 기반 속도 제한(Response-Based Rate Limiting)

들어오는 요청에 대한 속도 제한 외에도, Laravel은 `after` 메소드를 사용하여 응답을 기반으로 속도를 제한할 수 있습니다. 이는 유효성 검사 오류, 404 응답 또는 기타 특정 HTTP 상태 코드와 같은 특정 응답만 속도 제한에 포함하려는 경우에 유용합니다.

`after` 메소드는 응답을 받아 해당 응답이 속도 제한에 포함되어야 하면 `true`를, 무시되어야 하면 `false`를 반환하는 클로저를 받습니다. 이는 연속적인 404 응답을 제한하여 열거 공격(enumeration attacks)을 방지하거나, 유효성 검사에 실패한 요청이 속도 제한을 소모하지 않도록 하여 성공적인 작업만 스로틀링하는 엔드포인트에 특히 유용합니다.

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

RateLimiter::for('resource-not-found', function (Request $request) {
    return Limit::perMinute(10)
        ->by($request->user()?->id ?: $request->ip())
        ->after(function (Response $response) {
            // 열거를 방지하기 위해 404 응답만 속도 제한에 포함...
            return $response->status() === 404;
        });
});
```

<a name="attaching-rate-limiters-to-routes"></a>
### 라우트에 속도 제한자 연결(Attaching Rate Limiters to Routes)

속도 제한자는 `throttle` [미들웨어](/docs/{{version}}/middleware)를 사용하여 라우트 또는 라우트 그룹에 연결할 수 있습니다. throttle 미들웨어는 라우트에 할당하려는 속도 제한자의 이름을 받습니다:

```php
Route::middleware(['throttle:uploads'])->group(function () {
    Route::post('/audio', function () {
        // ...
    });

    Route::post('/video', function () {
        // ...
    });
});
```

<a name="throttling-with-redis"></a>
#### Redis를 사용한 스로틀링(Throttling With Redis)

기본적으로 `throttle` 미들웨어는 `Illuminate\Routing\Middleware\ThrottleRequests` 클래스에 매핑됩니다. 그러나 애플리케이션의 캐시 드라이버로 Redis를 사용하는 경우, Redis를 사용하여 속도 제한을 관리하도록 Laravel에 지시할 수 있습니다. 그렇게 하려면 애플리케이션의 `bootstrap/app.php` 파일에서 `throttleWithRedis` 메소드를 사용해야 합니다. 이 메소드는 `throttle` 미들웨어를 `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` 미들웨어 클래스에 매핑합니다:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->throttleWithRedis();
    // ...
})
```

<a name="form-method-spoofing"></a>
## Form 메소드 스푸핑(Form Method Spoofing)

HTML 폼은 `PUT`, `PATCH`, `DELETE` 액션을 지원하지 않습니다. 따라서 HTML 폼에서 호출되는 `PUT`, `PATCH`, `DELETE` 라우트를 정의할 때, 폼에 숨겨진 `_method` 필드를 추가해야 합니다. `_method` 필드와 함께 전송된 값은 HTTP 요청 메소드로 사용됩니다:

```blade
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

편의를 위해 `@method` [Blade 지시문](/docs/{{version}}/blade)을 사용하여 `_method` 입력 필드를 생성할 수 있습니다:

```blade
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

<a name="accessing-the-current-route"></a>
## 현재 라우트 액세스(Accessing the Current Route)

`Route` 파사드의 `current`, `currentRouteName`, `currentRouteAction` 메소드를 사용하여 들어오는 요청을 처리하는 라우트에 대한 정보에 액세스할 수 있습니다:

```php
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

라우터 및 라우트 클래스에서 사용할 수 있는 모든 메소드를 검토하려면 [Route 파사드의 기본 클래스](https://api.laravel.com/docs/{{version}}/Illuminate/Routing/Router.html) 및 [Route 인스턴스](https://api.laravel.com/docs/{{version}}/Illuminate/Routing/Route.html)에 대한 API 문서를 참조할 수 있습니다.

<a name="cors"></a>
## 교차 출처 리소스 공유 (CORS)

Laravel은 설정한 값으로 CORS `OPTIONS` HTTP 요청에 자동으로 응답할 수 있습니다. `OPTIONS` 요청은 애플리케이션의 전역 미들웨어 스택에 자동으로 포함된 `HandleCors` [미들웨어](/docs/{{version}}/middleware)에 의해 자동으로 처리됩니다.

때때로 애플리케이션에 대한 CORS 설정 값을 커스터마이징해야 할 수 있습니다. `config:publish` Artisan 명령어를 사용하여 `cors` 설정 파일을 게시하여 그렇게 할 수 있습니다:

```shell
php artisan config:publish cors
```

이 명령어는 애플리케이션의 `config` 디렉토리에 `cors.php` 설정 파일을 배치합니다.

> [!NOTE]
> CORS 및 CORS 헤더에 대한 자세한 정보는 [MDN 웹 문서의 CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)를 참조하세요.

<a name="route-caching"></a>
## 라우트 캐싱(Route Caching)

애플리케이션을 프로덕션에 배포할 때, Laravel의 라우트 캐시를 활용해야 합니다. 라우트 캐시를 사용하면 애플리케이션의 모든 라우트를 등록하는 데 걸리는 시간이 크게 줄어듭니다. 라우트 캐시를 생성하려면 `route:cache` Artisan 명령어를 실행하세요:

```shell
php artisan route:cache
```

이 명령어를 실행한 후, 캐시된 라우트 파일이 모든 요청에서 로드됩니다. 새 라우트를 추가하면 새로운 라우트 캐시를 생성해야 합니다. 이 때문에 프로젝트 배포 중에만 `route:cache` 명령어를 실행해야 합니다.

`route:clear` 명령어를 사용하여 라우트 캐시를 지울 수 있습니다:

```shell
php artisan route:clear
```

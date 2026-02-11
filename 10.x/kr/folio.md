# Laravel Folio

- [소개](#introduction)
- [설치](#installation)
    - [페이지 경로 / URI](#page-paths-uris)
    - [서브도메인 라우팅](#subdomain-routing)
- [라우트 생성](#creating-routes)
    - [중첩 라우트](#nested-routes)
    - [인덱스 라우트](#index-routes)
- [라우트 파라미터](#route-parameters)
- [라우트 모델 바인딩](#route-model-binding)
    - [소프트 삭제된 모델](#soft-deleted-models)
- [렌더 훅](#render-hooks)
- [이름이 지정된 라우트](#named-routes)
- [미들웨어](#middleware)
- [라우트 캐싱](#route-caching)

<a name="introduction"></a>
## 소개

[Laravel Folio](https://github.com/laravel/folio)는 Laravel 애플리케이션에서 라우팅을 단순화하도록 설계된 강력한 페이지 기반 라우터입니다. Laravel Folio를 사용하면 애플리케이션의 `resources/views/pages` 디렉토리 내에 Blade 템플릿을 생성하는 것만으로 라우트를 손쉽게 만들 수 있습니다.

예를 들어, `/greeting` URL에서 접근할 수 있는 페이지를 만들려면 애플리케이션의 `resources/views/pages` 디렉토리에 `greeting.blade.php` 파일을 생성하기만 하면 됩니다.

```php
<div>
    Hello World
</div>
```

<a name="installation"></a>
## 설치

시작하려면 Composer 패키지 관리자를 사용하여 프로젝트에 Folio를 설치하세요.

```bash
composer require laravel/folio
```

Folio를 설치한 후 `folio:install` Artisan 명령어를 실행할 수 있습니다. 이 명령어는 애플리케이션에 Folio의 서비스 프로바이더를 설치합니다. 이 서비스 프로바이더는 Folio가 라우트/페이지를 검색할 디렉토리를 등록합니다.

```bash
php artisan folio:install
```

<a name="page-paths-uris"></a>
### 페이지 경로 / URI

기본적으로 Folio는 애플리케이션의 `resources/views/pages` 디렉토리에서 페이지를 제공하지만, Folio 서비스 프로바이더의 `boot` 메서드에서 이러한 디렉토리를 커스터마이징할 수 있습니다.

예를 들어, 동일한 Laravel 애플리케이션에서 여러 Folio 경로를 지정하는 것이 편리할 때가 있습니다. 애플리케이션의 "admin" 영역에 대해 별도의 Folio 페이지 디렉토리를 가지고, 나머지 애플리케이션 페이지에는 다른 디렉토리를 사용하고 싶을 수 있습니다.

`Folio::path`와 `Folio::uri` 메서드를 사용하여 이를 수행할 수 있습니다. `path` 메서드는 들어오는 HTTP 요청을 라우팅할 때 Folio가 페이지를 스캔할 디렉토리를 등록하고, `uri` 메서드는 해당 페이지 디렉토리의 "기본 URI"를 지정합니다.

```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages/guest'))->uri('/');

Folio::path(resource_path('views/pages/admin'))
    ->uri('/admin')
    ->middleware([
        '*' => [
            'auth',
            'verified',

            // ...
        ],
    ]);
```

<a name="subdomain-routing"></a>
### 서브도메인 라우팅

들어오는 요청의 서브도메인을 기반으로 페이지를 라우팅할 수도 있습니다. 예를 들어, `admin.example.com`의 요청을 나머지 Folio 페이지와 다른 페이지 디렉토리로 라우팅하고 싶을 수 있습니다. `Folio::path` 메서드를 호출한 후 `domain` 메서드를 호출하여 이를 수행할 수 있습니다.

```php
use Laravel\Folio\Folio;

Folio::domain('admin.example.com')
    ->path(resource_path('views/pages/admin'));
```

`domain` 메서드를 사용하면 도메인이나 서브도메인의 일부를 파라미터로 캡처할 수도 있습니다. 이 파라미터는 페이지 템플릿에 주입됩니다.

```php
use Laravel\Folio\Folio;

Folio::domain('{account}.example.com')
    ->path(resource_path('views/pages/admin'));
```

<a name="creating-routes"></a>
## 라우트 생성

Folio에 마운트된 디렉토리에 Blade 템플릿을 배치하여 Folio 라우트를 생성할 수 있습니다. 기본적으로 Folio는 `resources/views/pages` 디렉토리를 마운트하지만, Folio 서비스 프로바이더의 `boot` 메서드에서 이러한 디렉토리를 커스터마이징할 수 있습니다.

Blade 템플릿이 Folio 마운트 디렉토리에 배치되면 브라우저를 통해 즉시 접근할 수 있습니다. 예를 들어, `pages/schedule.blade.php`에 배치된 페이지는 브라우저에서 `http://example.com/schedule`로 접근할 수 있습니다.

모든 Folio 페이지/라우트 목록을 빠르게 확인하려면 `folio:list` Artisan 명령어를 실행할 수 있습니다.

```bash
php artisan folio:list
```

<a name="nested-routes"></a>
### 중첩 라우트

Folio 디렉토리 내에 하나 이상의 디렉토리를 생성하여 중첩 라우트를 만들 수 있습니다. 예를 들어, `/user/profile`을 통해 접근 가능한 페이지를 만들려면 `pages/user` 디렉토리 내에 `profile.blade.php` 템플릿을 생성하세요.

```bash
php artisan make:folio user/profile

# pages/user/profile.blade.php → /user/profile
```

<a name="index-routes"></a>
### 인덱스 라우트

때때로 특정 페이지를 디렉토리의 "인덱스"로 만들고 싶을 수 있습니다. Folio 디렉토리 내에 `index.blade.php` 템플릿을 배치하면 해당 디렉토리의 루트에 대한 모든 요청이 해당 페이지로 라우팅됩니다.

```bash
php artisan make:folio index
# pages/index.blade.php → /

php artisan make:folio users/index
# pages/users/index.blade.php → /users
```

<a name="route-parameters"></a>
## 라우트 파라미터

종종 들어오는 요청 URL의 세그먼트를 페이지에 주입하여 상호작용해야 할 것입니다. 예를 들어, 표시되는 프로필의 사용자 "ID"에 접근해야 할 수 있습니다. 이를 수행하려면 페이지 파일명의 세그먼트를 대괄호로 캡슐화하면 됩니다.

```bash
php artisan make:folio "users/[id]"

# pages/users/[id].blade.php → /users/1
```

캡처된 세그먼트는 Blade 템플릿 내에서 변수로 접근할 수 있습니다.

```html
<div>
    User {{ $id }}
</div>
```

여러 세그먼트를 캡처하려면 캡슐화된 세그먼트 앞에 세 개의 점 `...`을 접두사로 붙일 수 있습니다.

```bash
php artisan make:folio "users/[...ids]"

# pages/users/[...ids].blade.php → /users/1/2/3
```

여러 세그먼트를 캡처할 때 캡처된 세그먼트는 배열로 페이지에 주입됩니다.

```html
<ul>
    @foreach ($ids as $id)
        <li>User {{ $id }}</li>
    @endforeach
</ul>
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

페이지 템플릿 파일명의 와일드카드 세그먼트가 애플리케이션의 Eloquent 모델 중 하나와 일치하면, Folio는 Laravel의 라우트 모델 바인딩(Route Model Binding) 기능을 자동으로 활용하여 해결된 모델 인스턴스를 페이지에 주입하려고 시도합니다.

```bash
php artisan make:folio "users/[User]"

# pages/users/[User].blade.php → /users/1
```

캡처된 모델은 Blade 템플릿 내에서 변수로 접근할 수 있습니다. 모델의 변수명은 "카멜 케이스(camel case)"로 변환됩니다.

```html
<div>
    User {{ $user->id }}
</div>
```

#### 키 커스터마이징

때때로 `id` 외의 컬럼을 사용하여 바인딩된 Eloquent 모델을 해결하고 싶을 수 있습니다. 그렇게 하려면 페이지 파일명에 컬럼을 지정하면 됩니다. 예를 들어, 파일명이 `[Post:slug].blade.php`인 페이지는 `id` 컬럼 대신 `slug` 컬럼을 통해 바인딩된 모델을 해결하려고 시도합니다.

Windows에서는 모델명과 키를 구분하기 위해 `-`를 사용해야 합니다: `[Post-slug].blade.php`.

#### 모델 위치

기본적으로 Folio는 애플리케이션의 `app/Models` 디렉토리 내에서 모델을 검색합니다. 그러나 필요한 경우 템플릿 파일명에 완전한 모델 클래스명을 지정할 수 있습니다.

```bash
php artisan make:folio "users/[.App.Models.User]"

# pages/users/[.App.Models.User].blade.php → /users/1
```

<a name="soft-deleted-models"></a>
### 소프트 삭제된 모델

기본적으로 소프트 삭제된 모델은 암시적 모델 바인딩을 해결할 때 검색되지 않습니다. 그러나 원한다면 페이지 템플릿 내에서 `withTrashed` 함수를 호출하여 Folio가 소프트 삭제된 모델을 검색하도록 지시할 수 있습니다.

```php
<?php

use function Laravel\Folio\{withTrashed};

withTrashed();

?>

<div>
    User {{ $user->id }}
</div>
```

<a name="render-hooks"></a>
## 렌더 훅

기본적으로 Folio는 페이지의 Blade 템플릿 콘텐츠를 들어오는 요청에 대한 응답으로 반환합니다. 그러나 페이지 템플릿 내에서 `render` 함수를 호출하여 응답을 커스터마이징할 수 있습니다.

`render` 함수는 Folio가 렌더링하는 `View` 인스턴스를 받는 클로저를 받아들여, 뷰에 추가 데이터를 추가하거나 전체 응답을 커스터마이징할 수 있게 합니다. `View` 인스턴스를 받는 것 외에도 추가 라우트 파라미터나 모델 바인딩도 `render` 클로저에 제공됩니다.

```php
<?php

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

use function Laravel\Folio\render;

render(function (View $view, Post $post) {
    if (! Auth::user()->can('view', $post)) {
        return response('Unauthorized', 403);
    }

    return $view->with('photos', $post->author->photos);
}); ?>

<div>
    {{ $post->content }}
</div>

<div>
    This author has also taken {{ count($photos) }} photos.
</div>
```

<a name="named-routes"></a>
## 이름이 지정된 라우트

`name` 함수를 사용하여 주어진 페이지의 라우트에 이름을 지정할 수 있습니다.

```php
<?php

use function Laravel\Folio\name;

name('users.index');
```

Laravel의 이름이 지정된 라우트와 마찬가지로 `route` 함수를 사용하여 이름이 할당된 Folio 페이지에 대한 URL을 생성할 수 있습니다.

```php
<a href="{{ route('users.index') }}">
    All Users
</a>
```

페이지에 파라미터가 있는 경우 단순히 `route` 함수에 값을 전달할 수 있습니다.

```php
route('users.show', ['user' => $user]);
```

<a name="middleware"></a>
## 미들웨어

페이지 템플릿 내에서 `middleware` 함수를 호출하여 특정 페이지에 미들웨어를 적용할 수 있습니다.

```php
<?php

use function Laravel\Folio\{middleware};

middleware(['auth', 'verified']);

?>

<div>
    Dashboard
</div>
```

또는 `Folio::path` 메서드를 호출한 후 `middleware` 메서드를 체이닝하여 페이지 그룹에 미들웨어를 할당할 수 있습니다.

미들웨어가 적용되어야 할 페이지를 지정하려면 미들웨어 배열에 적용되어야 할 페이지의 해당 URL 패턴을 키로 사용할 수 있습니다. `*` 문자는 와일드카드 문자로 사용할 수 있습니다.

```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        // ...
    ],
]);
```

미들웨어 배열에 클로저를 포함하여 인라인 익명 미들웨어를 정의할 수 있습니다.

```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        function (Request $request, Closure $next) {
            // ...

            return $next($request);
        },
    ],
]);
```

<a name="route-caching"></a>
## 라우트 캐싱

Folio를 사용할 때는 항상 [Laravel의 라우트 캐싱 기능](/docs/{{version}}/routing#route-caching)을 활용해야 합니다. Folio는 `route:cache` Artisan 명령어를 감지하여 Folio 페이지 정의와 라우트 이름이 최대 성능을 위해 적절하게 캐싱되도록 합니다.

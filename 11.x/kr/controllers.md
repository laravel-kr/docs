# 컨트롤러(Controllers)

- [소개](#introduction)
- [컨트롤러 작성하기](#writing-controllers)
    - [기본 컨트롤러](#basic-controllers)
    - [단일 액션 컨트롤러](#single-action-controllers)
- [컨트롤러 미들웨어](#controller-middleware)
- [리소스 컨트롤러](#resource-controllers)
    - [부분 리소스 라우트](#restful-partial-resource-routes)
    - [중첩 리소스](#restful-nested-resources)
    - [리소스 라우트 이름 지정](#restful-naming-resource-routes)
    - [리소스 라우트 파라미터 이름 지정](#restful-naming-resource-route-parameters)
    - [리소스 라우트 스코핑](#restful-scoping-resource-routes)
    - [리소스 URI 지역화](#restful-localizing-resource-uris)
    - [리소스 컨트롤러 보완](#restful-supplementing-resource-controllers)
    - [싱글톤 리소스 컨트롤러](#singleton-resource-controllers)
- [의존성 주입과 컨트롤러](#dependency-injection-and-controllers)

<a name="introduction"></a>
## 소개

라우트 파일에서 모든 요청 처리 로직을 클로저로 정의하는 대신, "컨트롤러(controller)" 클래스를 사용하여 이 동작을 구성할 수 있습니다. 컨트롤러는 관련된 요청 처리 로직을 단일 클래스로 그룹화할 수 있습니다. 예를 들어, `UserController` 클래스는 사용자 표시, 생성, 수정, 삭제를 포함하여 사용자와 관련된 모든 들어오는 요청을 처리할 수 있습니다. 기본적으로 컨트롤러는 `app/Http/Controllers` 디렉토리에 저장됩니다.

<a name="writing-controllers"></a>
## 컨트롤러 작성하기

<a name="basic-controllers"></a>
### 기본 컨트롤러

새 컨트롤러를 빠르게 생성하려면 `make:controller` Artisan 명령어를 실행하면 됩니다. 기본적으로 애플리케이션의 모든 컨트롤러는 `app/Http/Controllers` 디렉토리에 저장됩니다.

```shell
php artisan make:controller UserController
```

기본 컨트롤러의 예제를 살펴보겠습니다. 컨트롤러는 들어오는 HTTP 요청에 응답하는 여러 개의 public 메서드를 가질 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 주어진 사용자의 프로필을 표시합니다.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

컨트롤러 클래스와 메서드를 작성한 후, 다음과 같이 컨트롤러 메서드에 대한 라우트를 정의할 수 있습니다.

```php
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

들어오는 요청이 지정된 라우트 URI와 일치하면, `App\Http\Controllers\UserController` 클래스의 `show` 메서드가 호출되고 라우트 파라미터가 메서드에 전달됩니다.

> [!NOTE]
> 컨트롤러가 반드시 기본 클래스를 상속해야 하는 것은 **아닙니다**. 하지만 모든 컨트롤러에서 공유해야 하는 메서드를 포함하는 기본 컨트롤러 클래스를 상속하는 것이 편리할 때가 있습니다.

<a name="single-action-controllers"></a>
### 단일 액션 컨트롤러

컨트롤러 액션이 특별히 복잡한 경우, 전체 컨트롤러 클래스를 그 단일 액션에 전용으로 사용하는 것이 편리할 수 있습니다. 이를 위해 컨트롤러 내에 단일 `__invoke` 메서드를 정의할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

class ProvisionServer extends Controller
{
    /**
     * 새 웹 서버를 프로비저닝합니다.
     */
    public function __invoke()
    {
        // ...
    }
}
```

단일 액션 컨트롤러에 대한 라우트를 등록할 때, 컨트롤러 메서드를 지정할 필요가 없습니다. 대신, 라우터에 컨트롤러 이름만 전달하면 됩니다.

```php
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

`make:controller` Artisan 명령어의 `--invokable` 옵션을 사용하여 invokable 컨트롤러를 생성할 수 있습니다.

```shell
php artisan make:controller ProvisionServer --invokable
```

> [!NOTE]
> 컨트롤러 스텁은 [스텁 퍼블리싱](/docs/{{version}}/artisan#stub-customization)을 사용하여 커스터마이징할 수 있습니다.

<a name="controller-middleware"></a>
## 컨트롤러 미들웨어

[미들웨어(Middleware)](/docs/{{version}}/middleware)는 라우트 파일에서 컨트롤러의 라우트에 할당할 수 있습니다.

```php
Route::get('/profile', [UserController::class, 'show'])->middleware('auth');
```

또는 컨트롤러 클래스 내에서 미들웨어를 지정하는 것이 편리할 수 있습니다. 이렇게 하려면 컨트롤러가 `HasMiddleware` 인터페이스를 구현해야 하며, 이 인터페이스는 컨트롤러에 정적 `middleware` 메서드가 있어야 함을 지정합니다. 이 메서드에서 컨트롤러의 액션에 적용할 미들웨어 배열을 반환할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UserController implements HasMiddleware
{
    /**
     * 컨트롤러에 할당할 미들웨어를 가져옵니다.
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('log', only: ['index']),
            new Middleware('subscribed', except: ['store']),
        ];
    }

    // ...
}
```

컨트롤러 미들웨어를 클로저로 정의할 수도 있으며, 이는 전체 미들웨어 클래스를 작성하지 않고도 인라인 미들웨어를 정의하는 편리한 방법을 제공합니다.

```php
use Closure;
use Illuminate\Http\Request;

/**
 * 컨트롤러에 할당할 미들웨어를 가져옵니다.
 */
public static function middleware(): array
{
    return [
        function (Request $request, Closure $next) {
            return $next($request);
        },
    ];
}
```

> [!WARNING]
> `Illuminate\Routing\Controllers\HasMiddleware`를 구현하는 컨트롤러는 `Illuminate\Routing\Controller`를 확장해서는 안 됩니다.

<a name="resource-controllers"></a>
## 리소스 컨트롤러

애플리케이션의 각 Eloquent 모델을 "리소스(resource)"로 생각한다면, 애플리케이션의 각 리소스에 대해 동일한 액션 집합을 수행하는 것이 일반적입니다. 예를 들어, 애플리케이션에 `Photo` 모델과 `Movie` 모델이 포함되어 있다고 가정해 보겠습니다. 사용자가 이러한 리소스를 생성, 조회, 수정 또는 삭제할 가능성이 높습니다.

이러한 일반적인 사용 사례 때문에, Laravel 리소스 라우팅은 한 줄의 코드로 일반적인 생성, 조회, 수정, 삭제("CRUD") 라우트를 컨트롤러에 할당합니다. 시작하려면 `make:controller` Artisan 명령어의 `--resource` 옵션을 사용하여 이러한 액션을 처리하는 컨트롤러를 빠르게 생성할 수 있습니다.

```shell
php artisan make:controller PhotoController --resource
```

이 명령어는 `app/Http/Controllers/PhotoController.php`에 컨트롤러를 생성합니다. 컨트롤러에는 사용 가능한 각 리소스 작업에 대한 메서드가 포함됩니다. 다음으로, 컨트롤러를 가리키는 리소스 라우트를 등록할 수 있습니다.

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

이 단일 라우트 선언은 리소스에 대한 다양한 액션을 처리하기 위한 여러 라우트를 생성합니다. 생성된 컨트롤러에는 이미 이러한 각 액션에 대한 메서드 스텁이 있습니다. `route:list` Artisan 명령어를 실행하면 언제든지 애플리케이션의 라우트에 대한 빠른 개요를 얻을 수 있다는 것을 기억하세요.

`resources` 메서드에 배열을 전달하여 여러 리소스 컨트롤러를 한 번에 등록할 수도 있습니다.

```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```


<a name="actions-handled-by-resource-controllers"></a>
#### 리소스 컨트롤러가 처리하는 액션

<div class="overflow-auto">

| Verb      | URI                    | Action  | Route Name     |
| --------- | ---------------------- | ------- | -------------- |
| GET       | `/photos`              | index   | photos.index   |
| GET       | `/photos/create`       | create  | photos.create  |
| POST      | `/photos`              | store   | photos.store   |
| GET       | `/photos/{photo}`      | show    | photos.show    |
| GET       | `/photos/{photo}/edit` | edit    | photos.edit    |
| PUT/PATCH | `/photos/{photo}`      | update  | photos.update  |
| DELETE    | `/photos/{photo}`      | destroy | photos.destroy |

</div>

<a name="customizing-missing-model-behavior"></a>
#### 누락된 모델 동작 커스터마이징

일반적으로 암시적으로 바인딩된 리소스 모델을 찾을 수 없는 경우 404 HTTP 응답이 생성됩니다. 그러나 리소스 라우트를 정의할 때 `missing` 메서드를 호출하여 이 동작을 커스터마이징할 수 있습니다. `missing` 메서드는 리소스의 라우트에서 암시적으로 바인딩된 모델을 찾을 수 없는 경우 호출될 클로저를 받습니다.

```php
use App\Http\Controllers\PhotoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::resource('photos', PhotoController::class)
    ->missing(function (Request $request) {
        return Redirect::route('photos.index');
    });
```

<a name="soft-deleted-models"></a>
#### 소프트 삭제된 모델

일반적으로 암시적 모델 바인딩은 [소프트 삭제](/docs/{{version}}/eloquent#soft-deleting)된 모델을 조회하지 않으며, 대신 404 HTTP 응답을 반환합니다. 그러나 리소스 라우트를 정의할 때 `withTrashed` 메서드를 호출하여 프레임워크가 소프트 삭제된 모델을 허용하도록 지시할 수 있습니다.

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->withTrashed();
```

인수 없이 `withTrashed`를 호출하면 `show`, `edit`, `update` 리소스 라우트에서 소프트 삭제된 모델을 허용합니다. `withTrashed` 메서드에 배열을 전달하여 이러한 라우트의 하위 집합을 지정할 수 있습니다.

```php
Route::resource('photos', PhotoController::class)->withTrashed(['show']);
```

<a name="specifying-the-resource-model"></a>
#### 리소스 모델 지정

[라우트 모델 바인딩](/docs/{{version}}/routing#route-model-binding)을 사용하고 있고 리소스 컨트롤러의 메서드가 모델 인스턴스를 타입힌트하도록 하려면, 컨트롤러를 생성할 때 `--model` 옵션을 사용할 수 있습니다.

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

<a name="generating-form-requests"></a>
#### 폼 요청 생성

리소스 컨트롤러를 생성할 때 `--requests` 옵션을 제공하여 컨트롤러의 저장 및 수정 메서드에 대한 [폼 요청 클래스](/docs/{{version}}/validation#form-request-validation)를 생성하도록 Artisan에 지시할 수 있습니다.

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

<a name="restful-partial-resource-routes"></a>
### 부분 리소스 라우트

리소스 라우트를 선언할 때, 기본 액션의 전체 집합 대신 컨트롤러가 처리해야 하는 액션의 하위 집합을 지정할 수 있습니다.

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->only([
    'index', 'show'
]);

Route::resource('photos', PhotoController::class)->except([
    'create', 'store', 'update', 'destroy'
]);
```

<a name="api-resource-routes"></a>
#### API 리소스 라우트

API에서 사용될 리소스 라우트를 선언할 때, 일반적으로 `create` 및 `edit`와 같이 HTML 템플릿을 제공하는 라우트를 제외하고 싶을 것입니다. 편의를 위해 `apiResource` 메서드를 사용하여 이 두 라우트를 자동으로 제외할 수 있습니다.

```php
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

`apiResources` 메서드에 배열을 전달하여 여러 API 리소스 컨트롤러를 한 번에 등록할 수 있습니다.

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

`create` 또는 `edit` 메서드를 포함하지 않는 API 리소스 컨트롤러를 빠르게 생성하려면, `make:controller` 명령어를 실행할 때 `--api` 스위치를 사용하세요.

```shell
php artisan make:controller PhotoController --api
```

<a name="restful-nested-resources"></a>
### 중첩 리소스

때로는 중첩된 리소스에 대한 라우트를 정의해야 할 수 있습니다. 예를 들어, 사진 리소스에는 사진에 첨부될 수 있는 여러 댓글이 있을 수 있습니다. 리소스 컨트롤러를 중첩하려면 라우트 선언에서 "점" 표기법을 사용할 수 있습니다.

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

이 라우트는 다음과 같은 URI로 접근할 수 있는 중첩된 리소스를 등록합니다.

```text
/photos/{photo}/comments/{comment}
```

<a name="scoping-nested-resources"></a>
#### 중첩 리소스 스코핑

Laravel의 [암시적 모델 바인딩](/docs/{{version}}/routing#implicit-model-binding-scoping) 기능은 해결된 자식 모델이 부모 모델에 속하는지 확인하도록 중첩된 바인딩을 자동으로 스코핑할 수 있습니다. 중첩된 리소스를 정의할 때 `scoped` 메서드를 사용하면 자동 스코핑을 활성화하고 자식 리소스를 어떤 필드로 검색할지 Laravel에 지시할 수 있습니다. 이를 수행하는 방법에 대한 자세한 내용은 [리소스 라우트 스코핑](#restful-scoping-resource-routes) 문서를 참조하세요.

<a name="shallow-nesting"></a>
#### 얕은 중첩

자식 ID가 이미 고유 식별자이므로 URI 내에 부모 ID와 자식 ID가 모두 있을 필요가 없는 경우가 많습니다. 자동 증가 기본 키와 같은 고유 식별자를 사용하여 URI 세그먼트에서 모델을 식별할 때 "얕은 중첩(shallow nesting)"을 사용할 수 있습니다.

```php
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

이 라우트 정의는 다음 라우트를 정의합니다.

<div class="overflow-auto">

| Verb      | URI                               | Action  | Route Name             |
| --------- | --------------------------------- | ------- | ---------------------- |
| GET       | `/photos/{photo}/comments`        | index   | photos.comments.index  |
| GET       | `/photos/{photo}/comments/create` | create  | photos.comments.create |
| POST      | `/photos/{photo}/comments`        | store   | photos.comments.store  |
| GET       | `/comments/{comment}`             | show    | comments.show          |
| GET       | `/comments/{comment}/edit`        | edit    | comments.edit          |
| PUT/PATCH | `/comments/{comment}`             | update  | comments.update        |
| DELETE    | `/comments/{comment}`             | destroy | comments.destroy       |

</div>

<a name="restful-naming-resource-routes"></a>
### 리소스 라우트 이름 지정

기본적으로 모든 리소스 컨트롤러 액션에는 라우트 이름이 있습니다. 그러나 원하는 라우트 이름과 함께 `names` 배열을 전달하여 이러한 이름을 재정의할 수 있습니다.

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

<a name="restful-naming-resource-route-parameters"></a>
### 리소스 라우트 파라미터 이름 지정

기본적으로 `Route::resource`는 리소스 이름의 "단수화된" 버전을 기반으로 리소스 라우트의 라우트 파라미터를 생성합니다. `parameters` 메서드를 사용하여 리소스별로 쉽게 재정의할 수 있습니다. `parameters` 메서드에 전달되는 배열은 리소스 이름과 파라미터 이름의 연관 배열이어야 합니다.

```php
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

위의 예제는 리소스의 `show` 라우트에 대해 다음 URI를 생성합니다.

```text
/users/{admin_user}
```

<a name="restful-scoping-resource-routes"></a>
### 리소스 라우트 스코핑

Laravel의 [스코프된 암시적 모델 바인딩](/docs/{{version}}/routing#implicit-model-binding-scoping) 기능은 해결된 자식 모델이 부모 모델에 속하는지 확인하도록 중첩된 바인딩을 자동으로 스코핑할 수 있습니다. 중첩된 리소스를 정의할 때 `scoped` 메서드를 사용하면 자동 스코핑을 활성화하고 자식 리소스를 어떤 필드로 검색할지 Laravel에 지시할 수 있습니다.

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

이 라우트는 다음과 같은 URI로 접근할 수 있는 스코프된 중첩 리소스를 등록합니다.

```text
/photos/{photo}/comments/{comment:slug}
```

중첩된 라우트 파라미터로 커스텀 키 암시적 바인딩을 사용할 때, Laravel은 부모의 관계 이름을 추측하는 규칙을 사용하여 부모로 중첩된 모델을 검색하도록 쿼리를 자동으로 스코핑합니다. 이 경우 `Photo` 모델에 `Comment` 모델을 검색하는 데 사용할 수 있는 `comments`(라우트 파라미터 이름의 복수형)라는 이름의 관계가 있다고 가정합니다.

<a name="restful-localizing-resource-uris"></a>
### 리소스 URI 지역화

기본적으로 `Route::resource`는 영어 동사와 복수형 규칙을 사용하여 리소스 URI를 생성합니다. `create` 및 `edit` 액션 동사를 지역화해야 하는 경우, `Route::resourceVerbs` 메서드를 사용할 수 있습니다. 이는 애플리케이션의 `App\Providers\AppServiceProvider` 내 `boot` 메서드 시작 부분에서 수행할 수 있습니다.

```php
/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);
}
```

Laravel의 복수형 변환기는 [필요에 따라 구성할 수 있는 여러 다른 언어를 지원합니다](/docs/{{version}}/localization#pluralization-language). 동사와 복수형 언어가 커스터마이징되면, `Route::resource('publicacion', PublicacionController::class)`와 같은 리소스 라우트 등록은 다음 URI를 생성합니다.

```text
/publicacion/crear

/publicacion/{publicaciones}/editar
```

<a name="restful-supplementing-resource-controllers"></a>
### 리소스 컨트롤러 보완

기본 리소스 라우트 집합 외에 리소스 컨트롤러에 추가 라우트를 추가해야 하는 경우, `Route::resource` 메서드를 호출하기 전에 해당 라우트를 정의해야 합니다. 그렇지 않으면 `resource` 메서드에 의해 정의된 라우트가 의도치 않게 보조 라우트보다 우선할 수 있습니다.

```php
use App\Http\Controller\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

> [!NOTE]
> 컨트롤러를 집중적으로 유지하세요. 일반적인 리소스 액션 집합 외부의 메서드가 자주 필요하다면, 컨트롤러를 두 개의 더 작은 컨트롤러로 분할하는 것을 고려하세요.

<a name="singleton-resource-controllers"></a>
### 싱글톤 리소스 컨트롤러

때로는 애플리케이션에 단일 인스턴스만 있을 수 있는 리소스가 있습니다. 예를 들어, 사용자의 "프로필"은 편집하거나 수정할 수 있지만, 사용자는 둘 이상의 "프로필"을 가질 수 없습니다. 마찬가지로 이미지는 단일 "썸네일"을 가질 수 있습니다. 이러한 리소스를 "싱글톤 리소스(singleton resources)"라고 하며, 리소스의 인스턴스가 하나만 존재할 수 있음을 의미합니다. 이러한 시나리오에서는 "싱글톤" 리소스 컨트롤러를 등록할 수 있습니다.

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

위의 싱글톤 리소스 정의는 다음 라우트를 등록합니다. 보시다시피 리소스의 인스턴스가 하나만 존재할 수 있으므로 싱글톤 리소스에는 "생성" 라우트가 등록되지 않으며, 등록된 라우트는 식별자를 허용하지 않습니다.

<div class="overflow-auto">

| Verb      | URI             | Action | Route Name     |
| --------- | --------------- | ------ | -------------- |
| GET       | `/profile`      | show   | profile.show   |
| GET       | `/profile/edit` | edit   | profile.edit   |
| PUT/PATCH | `/profile`      | update | profile.update |

</div>

싱글톤 리소스는 표준 리소스 내에 중첩될 수도 있습니다.

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

이 예제에서 `photos` 리소스는 모든 [표준 리소스 라우트](#actions-handled-by-resource-controllers)를 받습니다. 그러나 `thumbnail` 리소스는 다음 라우트를 가진 싱글톤 리소스가 됩니다.

<div class="overflow-auto">

| Verb      | URI                              | Action | Route Name              |
| --------- | -------------------------------- | ------ | ----------------------- |
| GET       | `/photos/{photo}/thumbnail`      | show   | photos.thumbnail.show   |
| GET       | `/photos/{photo}/thumbnail/edit` | edit   | photos.thumbnail.edit   |
| PUT/PATCH | `/photos/{photo}/thumbnail`      | update | photos.thumbnail.update |

</div>

<a name="creatable-singleton-resources"></a>
#### 생성 가능한 싱글톤 리소스

때때로 싱글톤 리소스에 대한 생성 및 저장 라우트를 정의하고 싶을 수 있습니다. 이를 위해 싱글톤 리소스 라우트를 등록할 때 `creatable` 메서드를 호출할 수 있습니다.

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```

이 예제에서 다음 라우트가 등록됩니다. 보시다시피 생성 가능한 싱글톤 리소스에는 `DELETE` 라우트도 등록됩니다.

<div class="overflow-auto">

| Verb      | URI                                | Action  | Route Name               |
| --------- | ---------------------------------- | ------- | ------------------------ |
| GET       | `/photos/{photo}/thumbnail/create` | create  | photos.thumbnail.create  |
| POST      | `/photos/{photo}/thumbnail`        | store   | photos.thumbnail.store   |
| GET       | `/photos/{photo}/thumbnail`        | show    | photos.thumbnail.show    |
| GET       | `/photos/{photo}/thumbnail/edit`   | edit    | photos.thumbnail.edit    |
| PUT/PATCH | `/photos/{photo}/thumbnail`        | update  | photos.thumbnail.update  |
| DELETE    | `/photos/{photo}/thumbnail`        | destroy | photos.thumbnail.destroy |

</div>

Laravel이 싱글톤 리소스에 대해 `DELETE` 라우트를 등록하되 생성 또는 저장 라우트는 등록하지 않도록 하려면 `destroyable` 메서드를 활용할 수 있습니다.

```php
Route::singleton(...)->destroyable();
```

<a name="api-singleton-resources"></a>
#### API 싱글톤 리소스

`apiSingleton` 메서드는 API를 통해 조작될 싱글톤 리소스를 등록하는 데 사용할 수 있으며, 따라서 `create` 및 `edit` 라우트가 불필요해집니다.

```php
Route::apiSingleton('profile', ProfileController::class);
```

물론 API 싱글톤 리소스도 `creatable`일 수 있으며, 이는 리소스에 대해 `store` 및 `destroy` 라우트를 등록합니다.

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```

<a name="dependency-injection-and-controllers"></a>
## 의존성 주입과 컨트롤러

<a name="constructor-injection"></a>
#### 생성자 주입

Laravel [서비스 컨테이너(Service Container)](/docs/{{version}}/container)는 모든 Laravel 컨트롤러를 해결하는 데 사용됩니다. 결과적으로 컨트롤러가 생성자에서 필요로 할 수 있는 모든 의존성을 타입힌트할 수 있습니다. 선언된 의존성은 자동으로 해결되어 컨트롤러 인스턴스에 주입됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * 새 컨트롤러 인스턴스를 생성합니다.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}
}
```

<a name="method-injection"></a>
#### 메서드 주입

생성자 주입 외에도 컨트롤러 메서드에서 의존성을 타입힌트할 수 있습니다. 메서드 주입의 일반적인 사용 사례는 `Illuminate\Http\Request` 인스턴스를 컨트롤러 메서드에 주입하는 것입니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 새 사용자를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->name;

        // 사용자를 저장합니다...

        return redirect('/users');
    }
}
```

컨트롤러 메서드가 라우트 파라미터의 입력도 기대하는 경우, 다른 의존성 뒤에 라우트 인수를 나열하세요. 예를 들어, 라우트가 다음과 같이 정의된 경우:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

다음과 같이 컨트롤러 메서드를 정의하여 여전히 `Illuminate\Http\Request`를 타입힌트하고 `id` 파라미터에 접근할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 주어진 사용자를 수정합니다.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // 사용자를 수정합니다...

        return redirect('/users');
    }
}
```

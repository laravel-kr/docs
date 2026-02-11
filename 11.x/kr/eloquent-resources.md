# Eloquent: API 리소스(API Resources)

- [소개](#introduction)
- [리소스 생성하기](#generating-resources)
- [개념 개요](#concept-overview)
    - [리소스 컬렉션](#resource-collections)
- [리소스 작성하기](#writing-resources)
    - [데이터 래핑](#data-wrapping)
    - [페이지네이션](#pagination)
    - [조건부 속성](#conditional-attributes)
    - [조건부 관계](#conditional-relationships)
    - [메타 데이터 추가하기](#adding-meta-data)
- [리소스 응답](#resource-responses)

<a name="introduction"></a>
## 소개

API를 구축할 때 Eloquent 모델과 실제로 애플리케이션 사용자에게 반환되는 JSON 응답 사이에 위치하는 변환 레이어가 필요할 수 있습니다. 예를 들어, 일부 사용자에게만 특정 속성을 표시하고 다른 사용자에게는 표시하지 않거나, 모델의 JSON 표현에 항상 특정 관계를 포함하고 싶을 수 있습니다. Eloquent의 리소스 클래스를 사용하면 모델과 모델 컬렉션을 JSON으로 표현력 있고 쉽게 변환할 수 있습니다.

물론 `toJson` 메서드를 사용하여 Eloquent 모델이나 컬렉션을 JSON으로 변환할 수도 있습니다. 하지만 Eloquent 리소스는 모델과 그 관계의 JSON 직렬화에 대해 더 세밀하고 강력한 제어를 제공합니다.

<a name="generating-resources"></a>
## 리소스 생성하기

리소스 클래스를 생성하려면 `make:resource` Artisan 명령어를 사용할 수 있습니다. 기본적으로 리소스는 애플리케이션의 `app/Http/Resources` 디렉토리에 배치됩니다. 리소스는 `Illuminate\Http\Resources\Json\JsonResource` 클래스를 확장합니다.

```shell
php artisan make:resource UserResource
```

<a name="generating-resource-collections"></a>
#### 리소스 컬렉션(Resource Collections)

개별 모델을 변환하는 리소스를 생성하는 것 외에도, 모델 컬렉션을 변환하는 리소스를 생성할 수 있습니다. 이를 통해 JSON 응답에 주어진 리소스의 전체 컬렉션과 관련된 링크 및 기타 메타 정보를 포함할 수 있습니다.

리소스 컬렉션을 생성하려면 리소스를 만들 때 `--collection` 플래그를 사용해야 합니다. 또는 리소스 이름에 `Collection`이라는 단어를 포함하면 Laravel이 컬렉션 리소스를 생성해야 함을 인식합니다. 컬렉션 리소스는 `Illuminate\Http\Resources\Json\ResourceCollection` 클래스를 확장합니다.

```shell
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a name="concept-overview"></a>
## 개념 개요

> [!NOTE]
> 이것은 리소스와 리소스 컬렉션에 대한 높은 수준의 개요입니다. 리소스가 제공하는 사용자 정의 및 기능에 대해 더 깊이 이해하려면 이 문서의 다른 섹션을 읽어보시기 바랍니다.

리소스를 작성할 때 사용할 수 있는 모든 옵션을 살펴보기 전에, Laravel에서 리소스가 어떻게 사용되는지 높은 수준에서 먼저 살펴보겠습니다. 리소스 클래스는 JSON 구조로 변환해야 하는 단일 모델을 나타냅니다. 예를 들어, 다음은 간단한 `UserResource` 리소스 클래스입니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 리소스를 배열로 변환합니다.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

모든 리소스 클래스는 리소스가 라우트나 컨트롤러 메서드에서 응답으로 반환될 때 JSON으로 변환되어야 하는 속성 배열을 반환하는 `toArray` 메서드를 정의합니다.

`$this` 변수에서 직접 모델 속성에 접근할 수 있다는 점에 주목하세요. 이는 리소스 클래스가 편리한 접근을 위해 속성과 메서드 접근을 기본 모델로 자동으로 프록시하기 때문입니다. 리소스가 정의되면 라우트나 컨트롤러에서 반환할 수 있습니다. 리소스는 생성자를 통해 기본 모델 인스턴스를 받습니다.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return new UserResource(User::findOrFail($id));
});
```

<a name="resource-collections"></a>
### 리소스 컬렉션(Resource Collections)

리소스 컬렉션이나 페이지네이션된 응답을 반환하는 경우, 라우트나 컨트롤러에서 리소스 인스턴스를 생성할 때 리소스 클래스에서 제공하는 `collection` 메서드를 사용해야 합니다.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

이 방법은 컬렉션과 함께 반환해야 하는 사용자 정의 메타 데이터를 추가하는 것을 허용하지 않습니다. 리소스 컬렉션 응답을 사용자 정의하려면 컬렉션을 나타내는 전용 리소스를 생성해야 합니다.

```shell
php artisan make:resource UserCollection
```

리소스 컬렉션 클래스가 생성되면 응답에 포함되어야 하는 메타 데이터를 쉽게 정의할 수 있습니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * 리소스 컬렉션을 배열로 변환합니다.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

리소스 컬렉션을 정의한 후 라우트나 컨트롤러에서 반환할 수 있습니다.

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

<a name="preserving-collection-keys"></a>
#### 컬렉션 키 보존하기(Preserving Collection Keys)

라우트에서 리소스 컬렉션을 반환할 때 Laravel은 컬렉션의 키를 숫자 순서로 재설정합니다. 그러나 리소스 클래스에 `preserveKeys` 속성을 추가하여 컬렉션의 원래 키를 보존해야 하는지 여부를 지정할 수 있습니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 리소스의 컬렉션 키를 보존해야 하는지 여부를 나타냅니다.
     *
     * @var bool
     */
    public $preserveKeys = true;
}
```

`preserveKeys` 속성이 `true`로 설정되면 컬렉션이 라우트나 컨트롤러에서 반환될 때 컬렉션 키가 보존됩니다.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all()->keyBy->id);
});
```

<a name="customizing-the-underlying-resource-class"></a>
#### 기본 리소스 클래스 사용자 정의하기(Customizing the Underlying Resource Class)

일반적으로 리소스 컬렉션의 `$this->collection` 속성은 컬렉션의 각 항목을 해당 단일 리소스 클래스에 매핑한 결과로 자동으로 채워집니다. 단일 리소스 클래스는 클래스 이름에서 후행 `Collection` 부분을 제외한 컬렉션의 클래스 이름으로 가정됩니다. 또한 개인 취향에 따라 단일 리소스 클래스에 `Resource` 접미사가 붙을 수도 있고 붙지 않을 수도 있습니다.

예를 들어, `UserCollection`은 주어진 사용자 인스턴스를 `UserResource` 리소스에 매핑하려고 시도합니다. 이 동작을 사용자 정의하려면 리소스 컬렉션의 `$collects` 속성을 재정의할 수 있습니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * 이 리소스가 수집하는 리소스.
     *
     * @var string
     */
    public $collects = Member::class;
}
```

<a name="writing-resources"></a>
## 리소스 작성하기

> [!NOTE]
> [개념 개요](#concept-overview)를 읽지 않았다면, 이 문서를 진행하기 전에 읽어보시기를 강력히 권장합니다.

리소스는 주어진 모델을 배열로 변환하기만 하면 됩니다. 따라서 각 리소스에는 모델의 속성을 애플리케이션의 라우트나 컨트롤러에서 반환할 수 있는 API 친화적인 배열로 변환하는 `toArray` 메서드가 포함되어 있습니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 리소스를 배열로 변환합니다.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

리소스가 정의되면 라우트나 컨트롤러에서 직접 반환할 수 있습니다.

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toUserResource();
});
```

<a name="relationships"></a>
#### 관계(Relationships)

응답에 관련 리소스를 포함하려면 리소스의 `toArray` 메서드에서 반환되는 배열에 추가할 수 있습니다. 이 예제에서는 `PostResource` 리소스의 `collection` 메서드를 사용하여 사용자의 블로그 게시물을 리소스 응답에 추가합니다.

```php
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;

/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->posts),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

> [!NOTE]
> 이미 로드된 관계만 포함하려면 [조건부 관계](#conditional-relationships)에 대한 문서를 확인하세요.

<a name="writing-resource-collections"></a>
#### 리소스 컬렉션(Resource Collections)

리소스가 단일 모델을 배열로 변환하는 반면, 리소스 컬렉션은 모델 컬렉션을 배열로 변환합니다. 그러나 모든 리소스가 즉석에서 "임시" 리소스 컬렉션을 생성하는 `collection` 메서드를 제공하기 때문에 각 모델에 대해 리소스 컬렉션 클래스를 반드시 정의할 필요는 없습니다.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

그러나 컬렉션과 함께 반환되는 메타 데이터를 사용자 정의해야 하는 경우에는 자체 리소스 컬렉션을 정의해야 합니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * 리소스 컬렉션을 배열로 변환합니다.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

단일 리소스와 마찬가지로 리소스 컬렉션도 라우트나 컨트롤러에서 직접 반환할 수 있습니다.

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

<a name="data-wrapping"></a>
### 데이터 래핑(Data Wrapping)

기본적으로 리소스 응답이 JSON으로 변환될 때 가장 바깥쪽 리소스는 `data` 키로 래핑됩니다. 예를 들어, 일반적인 리소스 컬렉션 응답은 다음과 같습니다.

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ]
}
```

가장 바깥쪽 리소스의 래핑을 비활성화하려면 기본 `Illuminate\Http\Resources\Json\JsonResource` 클래스에서 `withoutWrapping` 메서드를 호출해야 합니다. 일반적으로 이 메서드는 `AppServiceProvider` 또는 애플리케이션에 대한 모든 요청에서 로드되는 다른 [서비스 프로바이더](/docs/{{version}}/providers)에서 호출해야 합니다.

```php
<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 등록합니다.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();
    }
}
```

> [!WARNING]
> `withoutWrapping` 메서드는 가장 바깥쪽 응답에만 영향을 미치며, 자체 리소스 컬렉션에 수동으로 추가한 `data` 키는 제거하지 않습니다.

<a name="wrapping-nested-resources"></a>
#### 중첩된 리소스 래핑(Wrapping Nested Resources)

리소스의 관계가 어떻게 래핑되는지 결정할 수 있는 완전한 자유가 있습니다. 중첩 여부에 관계없이 모든 리소스 컬렉션이 `data` 키로 래핑되기를 원한다면, 각 리소스에 대해 리소스 컬렉션 클래스를 정의하고 컬렉션을 `data` 키 내에서 반환해야 합니다.

이렇게 하면 가장 바깥쪽 리소스가 두 개의 `data` 키로 래핑되는 것이 아닌지 궁금할 수 있습니다. 걱정하지 마세요. Laravel은 리소스가 실수로 이중 래핑되지 않도록 하므로, 변환 중인 리소스 컬렉션의 중첩 수준에 대해 걱정할 필요가 없습니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CommentsCollection extends ResourceCollection
{
    /**
     * 리소스 컬렉션을 배열로 변환합니다.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['data' => $this->collection];
    }
}
```

<a name="data-wrapping-and-pagination"></a>
#### 데이터 래핑과 페이지네이션(Data Wrapping and Pagination)

리소스 응답을 통해 페이지네이션된 컬렉션을 반환할 때 `withoutWrapping` 메서드가 호출되었더라도 Laravel은 리소스 데이터를 `data` 키로 래핑합니다. 이는 페이지네이션된 응답이 항상 페이지네이터의 상태에 대한 정보를 포함하는 `meta`와 `links` 키를 포함하기 때문입니다.

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="pagination"></a>
### 페이지네이션(Pagination)

Laravel 페이지네이터 인스턴스를 리소스의 `collection` 메서드나 사용자 정의 리소스 컬렉션에 전달할 수 있습니다.

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::paginate());
});
```

페이지네이션된 응답은 항상 페이지네이터의 상태에 대한 정보를 포함하는 `meta`와 `links` 키를 포함합니다.

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="customizing-the-pagination-information"></a>
#### 페이지네이션 정보 사용자 정의(Customizing the Pagination Information)

페이지네이션 응답의 `links` 또는 `meta` 키에 포함되는 정보를 사용자 정의하려면 리소스에 `paginationInformation` 메서드를 정의할 수 있습니다. 이 메서드는 `$paginated` 데이터와 `links` 및 `meta` 키를 포함하는 배열인 `$default` 정보 배열을 받습니다.

```php
/**
 * 리소스의 페이지네이션 정보를 사용자 정의합니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  array  $paginated
 * @param  array  $default
 * @return array
 */
public function paginationInformation($request, $paginated, $default)
{
    $default['links']['custom'] = 'https://example.com';

    return $default;
}
```

<a name="conditional-attributes"></a>
### 조건부 속성(Conditional Attributes)

때로는 특정 조건이 충족될 때만 리소스 응답에 속성을 포함하고 싶을 수 있습니다. 예를 들어, 현재 사용자가 "관리자"인 경우에만 값을 포함하고 싶을 수 있습니다. Laravel은 이러한 상황에서 도움이 되는 다양한 헬퍼 메서드를 제공합니다. `when` 메서드는 조건부로 리소스 응답에 속성을 추가하는 데 사용할 수 있습니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'secret' => $this->when($request->user()->isAdmin(), 'secret-value'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

이 예제에서 `secret` 키는 인증된 사용자의 `isAdmin` 메서드가 `true`를 반환하는 경우에만 최종 리소스 응답에 반환됩니다. 메서드가 `false`를 반환하면 `secret` 키가 클라이언트에 전송되기 전에 리소스 응답에서 제거됩니다. `when` 메서드를 사용하면 배열을 구성할 때 조건문에 의존하지 않고도 표현력 있게 리소스를 정의할 수 있습니다.

`when` 메서드는 두 번째 인수로 클로저도 허용하여, 주어진 조건이 `true`인 경우에만 결과 값을 계산할 수 있습니다.

```php
'secret' => $this->when($request->user()->isAdmin(), function () {
    return 'secret-value';
}),
```

`whenHas` 메서드는 기본 모델에 실제로 속성이 존재하는 경우 속성을 포함하는 데 사용할 수 있습니다.

```php
'name' => $this->whenHas('name'),
```

또한 `whenNotNull` 메서드는 속성이 null이 아닌 경우 리소스 응답에 속성을 포함하는 데 사용할 수 있습니다.

```php
'name' => $this->whenNotNull($this->name),
```

<a name="merging-conditional-attributes"></a>
#### 조건부 속성 병합(Merging Conditional Attributes)

때로는 동일한 조건에 따라 리소스 응답에 포함되어야 하는 여러 속성이 있을 수 있습니다. 이 경우 `mergeWhen` 메서드를 사용하여 주어진 조건이 `true`인 경우에만 응답에 속성을 포함할 수 있습니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        $this->mergeWhen($request->user()->isAdmin(), [
            'first-secret' => 'value',
            'second-secret' => 'value',
        ]),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

다시 말해, 주어진 조건이 `false`이면 이러한 속성은 클라이언트에 전송되기 전에 리소스 응답에서 제거됩니다.

> [!WARNING]
> `mergeWhen` 메서드는 문자열 키와 숫자 키가 혼합된 배열 내에서 사용해서는 안 됩니다. 또한 순차적으로 정렬되지 않은 숫자 키가 있는 배열 내에서도 사용해서는 안 됩니다.

<a name="conditional-relationships"></a>
### 조건부 관계(Conditional Relationships)

조건부로 속성을 로드하는 것 외에도, 모델에 관계가 이미 로드되었는지 여부에 따라 리소스 응답에 조건부로 관계를 포함할 수 있습니다. 이를 통해 컨트롤러에서 모델에 로드할 관계를 결정하고 리소스에서는 실제로 로드된 경우에만 쉽게 포함할 수 있습니다. 궁극적으로 이를 통해 리소스 내에서 "N+1" 쿼리 문제를 더 쉽게 피할 수 있습니다.

`whenLoaded` 메서드는 조건부로 관계를 로드하는 데 사용할 수 있습니다. 불필요하게 관계를 로드하는 것을 피하기 위해 이 메서드는 관계 자체 대신 관계의 이름을 받습니다.

```php
use App\Http\Resources\PostResource;

/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->whenLoaded('posts')),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

이 예제에서 관계가 로드되지 않은 경우 `posts` 키는 클라이언트에 전송되기 전에 리소스 응답에서 제거됩니다.

<a name="conditional-relationship-counts"></a>
#### 조건부 관계 카운트(Conditional Relationship Counts)

관계를 조건부로 포함하는 것 외에도, 모델에 관계의 카운트가 로드되었는지 여부에 따라 리소스 응답에 관계 "카운트"를 조건부로 포함할 수 있습니다.

```php
new UserResource($user->loadCount('posts'));
```

`whenCounted` 메서드는 리소스 응답에 관계의 카운트를 조건부로 포함하는 데 사용할 수 있습니다. 이 메서드는 관계의 카운트가 없는 경우 불필요하게 속성을 포함하는 것을 피합니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts_count' => $this->whenCounted('posts'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

이 예제에서 `posts` 관계의 카운트가 로드되지 않은 경우 `posts_count` 키는 클라이언트에 전송되기 전에 리소스 응답에서 제거됩니다.

`avg`, `sum`, `min`, `max`와 같은 다른 유형의 집계도 `whenAggregated` 메서드를 사용하여 조건부로 로드할 수 있습니다.

```php
'words_avg' => $this->whenAggregated('posts', 'words', 'avg'),
'words_sum' => $this->whenAggregated('posts', 'words', 'sum'),
'words_min' => $this->whenAggregated('posts', 'words', 'min'),
'words_max' => $this->whenAggregated('posts', 'words', 'max'),
```

<a name="conditional-pivot-information"></a>
#### 조건부 피벗 정보(Conditional Pivot Information)

리소스 응답에 관계 정보를 조건부로 포함하는 것 외에도, `whenPivotLoaded` 메서드를 사용하여 다대다 관계의 중간 테이블에서 데이터를 조건부로 포함할 수 있습니다. `whenPivotLoaded` 메서드는 첫 번째 인수로 피벗 테이블의 이름을 받습니다. 두 번째 인수는 모델에서 피벗 정보를 사용할 수 있는 경우 반환할 값을 반환하는 클로저여야 합니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoaded('role_user', function () {
            return $this->pivot->expires_at;
        }),
    ];
}
```

관계가 [사용자 정의 중간 테이블 모델](/docs/{{version}}/eloquent-relationships#defining-custom-intermediate-table-models)을 사용하는 경우, `whenPivotLoaded` 메서드의 첫 번째 인수로 중간 테이블 모델의 인스턴스를 전달할 수 있습니다.

```php
'expires_at' => $this->whenPivotLoaded(new Membership, function () {
    return $this->pivot->expires_at;
}),
```

중간 테이블이 `pivot` 이외의 접근자를 사용하는 경우 `whenPivotLoadedAs` 메서드를 사용할 수 있습니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoadedAs('subscription', 'role_user', function () {
            return $this->subscription->expires_at;
        }),
    ];
}
```

<a name="adding-meta-data"></a>
### 메타 데이터 추가하기(Adding Meta Data)

일부 JSON API 표준에서는 리소스 및 리소스 컬렉션 응답에 메타 데이터를 추가해야 합니다. 이는 종종 리소스 또는 관련 리소스에 대한 `links`나 리소스 자체에 대한 메타 데이터와 같은 것을 포함합니다. 리소스에 대한 추가 메타 데이터를 반환해야 하는 경우 `toArray` 메서드에 포함하세요. 예를 들어, 리소스 컬렉션을 변환할 때 `links` 정보를 포함할 수 있습니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'data' => $this->collection,
        'links' => [
            'self' => 'link-value',
        ],
    ];
}
```

리소스에서 추가 메타 데이터를 반환할 때 페이지네이션된 응답을 반환할 때 Laravel이 자동으로 추가하는 `links` 또는 `meta` 키를 실수로 덮어쓸 걱정을 할 필요가 없습니다. 정의한 추가 `links`는 페이지네이터가 제공하는 링크와 병합됩니다.

<a name="top-level-meta-data"></a>
#### 최상위 메타 데이터(Top Level Meta Data)

때로는 리소스가 반환되는 가장 바깥쪽 리소스인 경우에만 특정 메타 데이터를 리소스 응답에 포함하고 싶을 수 있습니다. 일반적으로 이는 응답 전체에 대한 메타 정보를 포함합니다. 이 메타 데이터를 정의하려면 리소스 클래스에 `with` 메서드를 추가하세요. 이 메서드는 리소스가 변환되는 가장 바깥쪽 리소스인 경우에만 리소스 응답에 포함될 메타 데이터 배열을 반환해야 합니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * 리소스 컬렉션을 배열로 변환합니다.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }

    /**
     * 리소스 배열과 함께 반환되어야 하는 추가 데이터를 가져옵니다.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'key' => 'value',
            ],
        ];
    }
}
```

<a name="adding-meta-data-when-constructing-resources"></a>
#### 리소스 생성 시 메타 데이터 추가하기(Adding Meta Data When Constructing Resources)

라우트나 컨트롤러에서 리소스 인스턴스를 생성할 때 최상위 데이터를 추가할 수도 있습니다. 모든 리소스에서 사용할 수 있는 `additional` 메서드는 리소스 응답에 추가되어야 하는 데이터 배열을 받습니다.

```php
return (new UserCollection(User::all()->load('roles')))
    ->additional(['meta' => [
        'key' => 'value',
    ]]);
```

<a name="resource-responses"></a>
## 리소스 응답(Resource Responses)

이미 읽었듯이 리소스는 라우트와 컨트롤러에서 직접 반환할 수 있습니다.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return new UserResource(User::findOrFail($id));
});
```

그러나 때로는 클라이언트에 전송되기 전에 나가는 HTTP 응답을 사용자 정의해야 할 수 있습니다. 이를 수행하는 두 가지 방법이 있습니다. 첫째, 리소스에 `response` 메서드를 체인할 수 있습니다. 이 메서드는 `Illuminate\Http\JsonResponse` 인스턴스를 반환하여 응답의 헤더를 완전히 제어할 수 있습니다.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user', function () {
    return (new UserResource(User::find(1)))
        ->response()
        ->header('X-Value', 'True');
});
```

또는 리소스 자체 내에서 `withResponse` 메서드를 정의할 수 있습니다. 이 메서드는 리소스가 응답에서 가장 바깥쪽 리소스로 반환될 때 호출됩니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 리소스를 배열로 변환합니다.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
        ];
    }

    /**
     * 리소스에 대한 나가는 응답을 사용자 정의합니다.
     */
    public function withResponse(Request $request, JsonResponse $response): void
    {
        $response->header('X-Value', 'True');
    }
}
```

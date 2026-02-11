# 인가(Authorization)

- [소개](#introduction)
- [게이트(Gates)](#gates)
    - [게이트 작성하기](#writing-gates)
    - [액션 인가하기](#authorizing-actions-via-gates)
    - [게이트 응답](#gate-responses)
    - [게이트 검사 가로채기](#intercepting-gate-checks)
    - [인라인 인가](#inline-authorization)
- [정책 생성하기](#creating-policies)
    - [정책 생성하기](#generating-policies)
    - [정책 등록하기](#registering-policies)
- [정책 작성하기](#writing-policies)
    - [정책 메서드](#policy-methods)
    - [정책 응답](#policy-responses)
    - [모델 없는 메서드](#methods-without-models)
    - [게스트 사용자](#guest-users)
    - [정책 필터](#policy-filters)
- [정책을 사용한 액션 인가](#authorizing-actions-using-policies)
    - [User 모델을 통한 인가](#via-the-user-model)
    - [Gate 파사드를 통한 인가](#via-the-gate-facade)
    - [미들웨어를 통한 인가](#via-middleware)
    - [Blade 템플릿을 통한 인가](#via-blade-templates)
    - [추가 컨텍스트 제공하기](#supplying-additional-context)
- [인가 & Inertia](#authorization-and-inertia)

<a name="introduction"></a>
## 소개

Laravel은 내장된 [인증](/docs/{{version}}/authentication) 서비스 외에도, 특정 리소스에 대한 사용자 액션을 인가하는 간단한 방법을 제공합니다. 예를 들어, 사용자가 인증되었더라도 애플리케이션에서 관리하는 특정 Eloquent 모델이나 데이터베이스 레코드를 수정하거나 삭제할 권한이 없을 수 있습니다. Laravel의 인가 기능은 이러한 유형의 인가 검사를 쉽고 체계적으로 관리할 수 있는 방법을 제공합니다.

Laravel은 액션을 인가하는 두 가지 주요 방법을 제공합니다: [게이트(Gates)](#gates)와 [정책(Policies)](#creating-policies). 게이트와 정책은 라우트와 컨트롤러와 같다고 생각하면 됩니다. 게이트는 간단한 클로저 기반의 인가 접근 방식을 제공하고, 정책은 컨트롤러처럼 특정 모델이나 리소스 주변의 로직을 그룹화합니다. 이 문서에서는 먼저 게이트를 살펴본 다음 정책을 알아보겠습니다.

애플리케이션을 구축할 때 게이트만 사용하거나 정책만 사용하도록 선택할 필요는 없습니다. 대부분의 애플리케이션은 게이트와 정책을 혼합하여 사용할 것이며, 이는 전혀 문제가 되지 않습니다! 게이트는 관리자 대시보드 조회와 같이 특정 모델이나 리소스와 관련이 없는 액션에 가장 적합합니다. 반면에 정책은 특정 모델이나 리소스에 대한 액션을 인가하려는 경우에 사용해야 합니다.

<a name="gates"></a>
## 게이트(Gates)

<a name="writing-gates"></a>
### 게이트 작성하기

> [!WARNING]
> 게이트는 Laravel의 인가 기능의 기본을 배우는 좋은 방법입니다. 그러나 견고한 Laravel 애플리케이션을 구축할 때는 인가 규칙을 체계화하기 위해 [정책](#creating-policies)을 사용하는 것을 고려해야 합니다.

게이트는 사용자가 특정 액션을 수행할 권한이 있는지 확인하는 단순한 클로저입니다. 일반적으로 게이트는 `Gate` 파사드를 사용하여 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내에서 정의됩니다. 게이트는 항상 첫 번째 인수로 사용자 인스턴스를 받으며, 관련 Eloquent 모델과 같은 추가 인수를 선택적으로 받을 수 있습니다.

이 예제에서는 사용자가 주어진 `App\Models\Post` 모델을 수정할 수 있는지 확인하는 게이트를 정의합니다. 게이트는 사용자의 `id`와 게시글을 작성한 사용자의 `user_id`를 비교하여 이를 수행합니다:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * 애플리케이션의 모든 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Gate::define('update-post', function (User $user, Post $post) {
        return $user->id === $post->user_id;
    });
}
```

컨트롤러처럼 게이트도 클래스 콜백 배열을 사용하여 정의할 수 있습니다:

```php
use App\Policies\PostPolicy;
use Illuminate\Support\Facades\Gate;

/**
 * 애플리케이션의 모든 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Gate::define('update-post', [PostPolicy::class, 'update']);
}
```

<a name="authorizing-actions-via-gates"></a>
### 액션 인가하기

게이트를 사용하여 액션을 인가하려면 `Gate` 파사드가 제공하는 `allows` 또는 `denies` 메서드를 사용해야 합니다. 현재 인증된 사용자를 이 메서드에 전달할 필요가 없습니다. Laravel이 자동으로 사용자를 게이트 클로저에 전달합니다. 인가가 필요한 액션을 수행하기 전에 애플리케이션의 컨트롤러 내에서 게이트 인가 메서드를 호출하는 것이 일반적입니다:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * 주어진 게시글을 수정합니다.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        if (! Gate::allows('update-post', $post)) {
            abort(403);
        }

        // 게시글 수정...

        return redirect('/posts');
    }
}
```

현재 인증된 사용자가 아닌 다른 사용자가 액션을 수행할 권한이 있는지 확인하려면 `Gate` 파사드의 `forUser` 메서드를 사용할 수 있습니다:

```php
if (Gate::forUser($user)->allows('update-post', $post)) {
    // 사용자가 게시글을 수정할 수 있습니다...
}

if (Gate::forUser($user)->denies('update-post', $post)) {
    // 사용자가 게시글을 수정할 수 없습니다...
}
```

`any` 또는 `none` 메서드를 사용하여 여러 액션을 한 번에 인가할 수 있습니다:

```php
if (Gate::any(['update-post', 'delete-post'], $post)) {
    // 사용자가 게시글을 수정하거나 삭제할 수 있습니다...
}

if (Gate::none(['update-post', 'delete-post'], $post)) {
    // 사용자가 게시글을 수정하거나 삭제할 수 없습니다...
}
```

<a name="authorizing-or-throwing-exceptions"></a>
#### 인가 또는 예외 던지기

액션을 인가하려 할 때 사용자가 주어진 액션을 수행할 권한이 없으면 자동으로 `Illuminate\Auth\Access\AuthorizationException`을 던지고 싶다면, `Gate` 파사드의 `authorize` 메서드를 사용할 수 있습니다. `AuthorizationException` 인스턴스는 Laravel에 의해 자동으로 403 HTTP 응답으로 변환됩니다:

```php
Gate::authorize('update-post', $post);

// 액션이 인가되었습니다...
```

<a name="gates-supplying-additional-context"></a>
#### 추가 컨텍스트 제공하기

권한 인가 게이트 메서드(`allows`, `denies`, `check`, `any`, `none`, `authorize`, `can`, `cannot`)와 인가 [Blade 지시어](#via-blade-templates)(`@can`, `@cannot`, `@canany`)는 두 번째 인수로 배열을 받을 수 있습니다. 이 배열 요소들은 게이트 클로저에 매개변수로 전달되며, 인가 결정을 내릴 때 추가 컨텍스트로 사용할 수 있습니다:

```php
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::define('create-post', function (User $user, Category $category, bool $pinned) {
    if (! $user->canPublishToGroup($category->group)) {
        return false;
    } elseif ($pinned && ! $user->canPinPosts()) {
        return false;
    }

    return true;
});

if (Gate::check('create-post', [$category, $pinned])) {
    // 사용자가 게시글을 생성할 수 있습니다...
}
```

<a name="gate-responses"></a>
### 게이트 응답

지금까지 단순한 불리언 값을 반환하는 게이트만 살펴보았습니다. 그러나 때때로 오류 메시지를 포함한 더 상세한 응답을 반환하고 싶을 수 있습니다. 이를 위해 게이트에서 `Illuminate\Auth\Access\Response`를 반환할 수 있습니다:

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::deny('You must be an administrator.');
});
```

게이트에서 인가 응답을 반환하더라도 `Gate::allows` 메서드는 여전히 단순한 불리언 값을 반환합니다. 그러나 `Gate::inspect` 메서드를 사용하면 게이트에서 반환한 전체 인가 응답을 얻을 수 있습니다:

```php
$response = Gate::inspect('edit-settings');

if ($response->allowed()) {
    // 액션이 인가되었습니다...
} else {
    echo $response->message();
}
```

액션이 인가되지 않으면 `AuthorizationException`을 던지는 `Gate::authorize` 메서드를 사용할 때, 인가 응답에서 제공한 오류 메시지가 HTTP 응답으로 전파됩니다:

```php
Gate::authorize('edit-settings');

// 액션이 인가되었습니다...
```

<a name="customizing-gate-response-status"></a>
#### HTTP 응답 상태 커스터마이징

게이트를 통해 액션이 거부되면 `403` HTTP 응답이 반환됩니다. 그러나 때때로 대안적인 HTTP 상태 코드를 반환하는 것이 유용할 수 있습니다. `Illuminate\Auth\Access\Response` 클래스의 `denyWithStatus` 정적 생성자를 사용하여 실패한 인가 검사에 대해 반환되는 HTTP 상태 코드를 커스터마이징할 수 있습니다:

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::denyWithStatus(404);
});
```

`404` 응답을 통해 리소스를 숨기는 것은 웹 애플리케이션에서 매우 일반적인 패턴이므로, 편의를 위해 `denyAsNotFound` 메서드가 제공됩니다:

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::denyAsNotFound();
});
```

<a name="intercepting-gate-checks"></a>
### 게이트 검사 가로채기

때로는 특정 사용자에게 모든 권한을 부여하고 싶을 수 있습니다. `before` 메서드를 사용하여 다른 모든 인가 검사 전에 실행되는 클로저를 정의할 수 있습니다:

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::before(function (User $user, string $ability) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`before` 클로저가 null이 아닌 결과를 반환하면 해당 결과가 인가 검사의 결과로 간주됩니다.

`after` 메서드를 사용하여 다른 모든 인가 검사 후에 실행되는 클로저를 정의할 수 있습니다:

```php
use App\Models\User;

Gate::after(function (User $user, string $ability, bool|null $result, mixed $arguments) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

게이트나 정책이 `null`을 반환하지 않는 한, `after` 클로저가 반환한 값은 인가 검사의 결과를 재정의하지 않습니다.

<a name="inline-authorization"></a>
### 인라인 인가

때때로 해당 액션에 해당하는 전용 게이트를 작성하지 않고 현재 인증된 사용자가 특정 액션을 수행할 권한이 있는지 확인하고 싶을 수 있습니다. Laravel은 `Gate::allowIf` 및 `Gate::denyIf` 메서드를 통해 이러한 유형의 "인라인" 인가 검사를 수행할 수 있습니다. 인라인 인가는 정의된 ["before" 또는 "after" 인가 훅](#intercepting-gate-checks)을 실행하지 않습니다:

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::allowIf(fn (User $user) => $user->isAdministrator());

Gate::denyIf(fn (User $user) => $user->banned());
```

액션이 인가되지 않았거나 현재 인증된 사용자가 없는 경우, Laravel은 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 던집니다. `AuthorizationException` 인스턴스는 Laravel의 예외 핸들러에 의해 자동으로 403 HTTP 응답으로 변환됩니다.

<a name="creating-policies"></a>
## 정책 생성하기

<a name="generating-policies"></a>
### 정책 생성하기

정책(Policies)은 특정 모델이나 리소스 주변의 인가 로직을 체계화하는 클래스입니다. 예를 들어, 애플리케이션이 블로그라면, `App\Models\Post` 모델과 게시글 생성이나 수정과 같은 사용자 액션을 인가하는 해당 `App\Policies\PostPolicy`가 있을 수 있습니다.

`make:policy` Artisan 명령을 사용하여 정책을 생성할 수 있습니다. 생성된 정책은 `app/Policies` 디렉토리에 배치됩니다. 이 디렉토리가 애플리케이션에 없으면 Laravel이 자동으로 생성합니다:

```shell
php artisan make:policy PostPolicy
```

`make:policy` 명령은 빈 정책 클래스를 생성합니다. 리소스 조회, 생성, 수정, 삭제와 관련된 예제 정책 메서드가 포함된 클래스를 생성하려면 명령 실행 시 `--model` 옵션을 제공할 수 있습니다:

```shell
php artisan make:policy PostPolicy --model=Post
```

<a name="registering-policies"></a>
### 정책 등록하기

<a name="policy-discovery"></a>
#### 정책 자동 탐색

기본적으로 Laravel은 모델과 정책이 표준 Laravel 명명 규칙을 따르는 한 자동으로 정책을 탐색합니다. 구체적으로, 정책은 모델이 포함된 디렉토리 또는 그 상위에 있는 `Policies` 디렉토리에 있어야 합니다. 예를 들어, 모델이 `app/Models` 디렉토리에 있고 정책이 `app/Policies` 디렉토리에 있을 수 있습니다. 이 상황에서 Laravel은 `app/Models/Policies`를 확인한 다음 `app/Policies`를 확인합니다. 또한 정책 이름은 모델 이름과 일치하고 `Policy` 접미사가 있어야 합니다. 따라서 `User` 모델은 `UserPolicy` 정책 클래스에 해당합니다.

자체 정책 탐색 로직을 정의하려면 `Gate::guessPolicyNamesUsing` 메서드를 사용하여 커스텀 정책 탐색 콜백을 등록할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출해야 합니다:

```php
use Illuminate\Support\Facades\Gate;

Gate::guessPolicyNamesUsing(function (string $modelClass) {
    // 주어진 모델에 대한 정책 클래스 이름을 반환...
});
```

<a name="manually-registering-policies"></a>
#### 수동으로 정책 등록하기

`Gate` 파사드를 사용하여 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 내에서 정책과 해당 모델을 수동으로 등록할 수 있습니다:

```php
use App\Models\Order;
use App\Policies\OrderPolicy;
use Illuminate\Support\Facades\Gate;

/**
 * 애플리케이션의 모든 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Gate::policy(Order::class, OrderPolicy::class);
}
```

<a name="writing-policies"></a>
## 정책 작성하기

<a name="policy-methods"></a>
### 정책 메서드

정책 클래스가 등록되면 인가하는 각 액션에 대한 메서드를 추가할 수 있습니다. 예를 들어, 주어진 `App\Models\User`가 주어진 `App\Models\Post` 인스턴스를 수정할 수 있는지 확인하는 `update` 메서드를 `PostPolicy`에 정의해 보겠습니다.

`update` 메서드는 `User`와 `Post` 인스턴스를 인수로 받고, 사용자가 주어진 `Post`를 수정할 권한이 있는지 나타내는 `true` 또는 `false`를 반환해야 합니다. 따라서 이 예제에서는 사용자의 `id`가 게시글의 `user_id`와 일치하는지 확인합니다:

```php
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * 주어진 게시글을 사용자가 수정할 수 있는지 확인합니다.
     */
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
```

인가하는 다양한 액션에 필요한 추가 메서드를 정책에 계속 정의할 수 있습니다. 예를 들어, 다양한 `Post` 관련 액션을 인가하기 위해 `view` 또는 `delete` 메서드를 정의할 수 있지만, 정책 메서드에 원하는 이름을 자유롭게 지정할 수 있다는 점을 기억하세요.

Artisan 콘솔을 통해 정책을 생성할 때 `--model` 옵션을 사용했다면, `viewAny`, `view`, `create`, `update`, `delete`, `restore`, `forceDelete` 액션에 대한 메서드가 이미 포함되어 있습니다.

> [!NOTE]
> 모든 정책은 Laravel [서비스 컨테이너(Service Container)](/docs/{{version}}/container)를 통해 해결되므로, 정책의 생성자에서 필요한 의존성을 타입힌트하면 자동으로 주입됩니다.

<a name="policy-responses"></a>
### 정책 응답

지금까지 단순한 불리언 값을 반환하는 정책 메서드만 살펴보았습니다. 그러나 때때로 오류 메시지를 포함한 더 상세한 응답을 반환하고 싶을 수 있습니다. 이를 위해 정책 메서드에서 `Illuminate\Auth\Access\Response` 인스턴스를 반환할 수 있습니다:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * 주어진 게시글을 사용자가 수정할 수 있는지 확인합니다.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::deny('You do not own this post.');
}
```

정책에서 인가 응답을 반환하더라도 `Gate::allows` 메서드는 여전히 단순한 불리언 값을 반환합니다. 그러나 `Gate::inspect` 메서드를 사용하면 게이트에서 반환한 전체 인가 응답을 얻을 수 있습니다:

```php
use Illuminate\Support\Facades\Gate;

$response = Gate::inspect('update', $post);

if ($response->allowed()) {
    // 액션이 인가되었습니다...
} else {
    echo $response->message();
}
```

액션이 인가되지 않으면 `AuthorizationException`을 던지는 `Gate::authorize` 메서드를 사용할 때, 인가 응답에서 제공한 오류 메시지가 HTTP 응답으로 전파됩니다:

```php
Gate::authorize('update', $post);

// 액션이 인가되었습니다...
```

<a name="customizing-policy-response-status"></a>
#### HTTP 응답 상태 커스터마이징

정책 메서드를 통해 액션이 거부되면 `403` HTTP 응답이 반환됩니다. 그러나 때때로 대안적인 HTTP 상태 코드를 반환하는 것이 유용할 수 있습니다. `Illuminate\Auth\Access\Response` 클래스의 `denyWithStatus` 정적 생성자를 사용하여 실패한 인가 검사에 대해 반환되는 HTTP 상태 코드를 커스터마이징할 수 있습니다:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * 주어진 게시글을 사용자가 수정할 수 있는지 확인합니다.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::denyWithStatus(404);
}
```

`404` 응답을 통해 리소스를 숨기는 것은 웹 애플리케이션에서 매우 일반적인 패턴이므로, 편의를 위해 `denyAsNotFound` 메서드가 제공됩니다:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * 주어진 게시글을 사용자가 수정할 수 있는지 확인합니다.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::denyAsNotFound();
}
```

<a name="methods-without-models"></a>
### 모델 없는 메서드

일부 정책 메서드는 현재 인증된 사용자의 인스턴스만 받습니다. 이 상황은 `create` 액션을 인가할 때 가장 일반적입니다. 예를 들어, 블로그를 만드는 경우 사용자가 게시글을 생성할 권한이 있는지 확인하고 싶을 수 있습니다. 이러한 상황에서 정책 메서드는 사용자 인스턴스만 받을 것으로 예상해야 합니다:

```php
/**
 * 주어진 사용자가 게시글을 생성할 수 있는지 확인합니다.
 */
public function create(User $user): bool
{
    return $user->role == 'writer';
}
```

<a name="guest-users"></a>
### 게스트 사용자

기본적으로, 들어오는 HTTP 요청이 인증된 사용자에 의해 시작되지 않은 경우 모든 게이트와 정책은 자동으로 `false`를 반환합니다. 그러나 "optional" 타입힌트를 선언하거나 사용자 인수 정의에 `null` 기본값을 제공하여 이러한 인가 검사가 게이트와 정책으로 전달되도록 할 수 있습니다:

```php
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * 주어진 게시글을 사용자가 수정할 수 있는지 확인합니다.
     */
    public function update(?User $user, Post $post): bool
    {
        return $user?->id === $post->user_id;
    }
}
```

<a name="policy-filters"></a>
### 정책 필터

특정 사용자에게 주어진 정책 내의 모든 액션을 인가하고 싶을 수 있습니다. 이를 위해 정책에 `before` 메서드를 정의하세요. `before` 메서드는 정책의 다른 메서드보다 먼저 실행되어, 의도한 정책 메서드가 실제로 호출되기 전에 액션을 인가할 수 있는 기회를 제공합니다. 이 기능은 애플리케이션 관리자가 모든 액션을 수행할 수 있도록 인가하는 데 가장 일반적으로 사용됩니다:

```php
use App\Models\User;

/**
 * 사전 인가 검사를 수행합니다.
 */
public function before(User $user, string $ability): bool|null
{
    if ($user->isAdministrator()) {
        return true;
    }

    return null;
}
```

특정 유형의 사용자에 대해 모든 인가 검사를 거부하려면 `before` 메서드에서 `false`를 반환할 수 있습니다. `null`이 반환되면 인가 검사는 정책 메서드로 넘어갑니다.

> [!WARNING]
> 클래스에 검사 중인 권한 이름과 일치하는 이름의 메서드가 포함되어 있지 않으면 정책 클래스의 `before` 메서드가 호출되지 않습니다.

<a name="authorizing-actions-using-policies"></a>
## 정책을 사용한 액션 인가

<a name="via-the-user-model"></a>
### User 모델을 통한 인가

Laravel 애플리케이션에 포함된 `App\Models\User` 모델에는 액션을 인가하는 데 유용한 두 가지 메서드인 `can`과 `cannot`이 있습니다. `can`과 `cannot` 메서드는 인가하려는 액션의 이름과 관련 모델을 받습니다. 예를 들어, 사용자가 주어진 `App\Models\Post` 모델을 수정할 권한이 있는지 확인해 보겠습니다. 일반적으로 이것은 컨트롤러 메서드 내에서 수행됩니다:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * 주어진 게시글을 수정합니다.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        if ($request->user()->cannot('update', $post)) {
            abort(403);
        }

        // 게시글 수정...

        return redirect('/posts');
    }
}
```

주어진 모델에 [정책이 등록](#registering-policies)되어 있으면, `can` 메서드는 자동으로 적절한 정책을 호출하고 불리언 결과를 반환합니다. 모델에 정책이 등록되어 있지 않으면, `can` 메서드는 주어진 액션 이름과 일치하는 클로저 기반 게이트를 호출하려고 시도합니다.

<a name="user-model-actions-that-dont-require-models"></a>
#### 모델이 필요하지 않은 액션

`create`와 같이 모델 인스턴스가 필요하지 않은 정책 메서드에 해당하는 액션이 있다는 점을 기억하세요. 이러한 상황에서는 `can` 메서드에 클래스 이름을 전달할 수 있습니다. 클래스 이름은 액션을 인가할 때 어떤 정책을 사용할지 결정하는 데 사용됩니다:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * 게시글을 생성합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->cannot('create', Post::class)) {
            abort(403);
        }

        // 게시글 생성...

        return redirect('/posts');
    }
}
```

<a name="via-the-gate-facade"></a>
### `Gate` 파사드를 통한 인가

`App\Models\User` 모델에 제공되는 유용한 메서드 외에도, `Gate` 파사드의 `authorize` 메서드를 통해 항상 액션을 인가할 수 있습니다.

`can` 메서드와 마찬가지로, 이 메서드는 인가하려는 액션의 이름과 관련 모델을 받습니다. 액션이 인가되지 않으면 `authorize` 메서드는 `Illuminate\Auth\Access\AuthorizationException` 예외를 던지며, Laravel 예외 핸들러가 자동으로 403 상태 코드의 HTTP 응답으로 변환합니다:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * 주어진 블로그 게시글을 수정합니다.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        // 현재 사용자가 블로그 게시글을 수정할 수 있습니다...

        return redirect('/posts');
    }
}
```

<a name="controller-actions-that-dont-require-models"></a>
#### 모델이 필요하지 않은 액션

앞서 논의한 것처럼, `create`와 같은 일부 정책 메서드는 모델 인스턴스가 필요하지 않습니다. 이러한 상황에서는 `authorize` 메서드에 클래스 이름을 전달해야 합니다. 클래스 이름은 액션을 인가할 때 어떤 정책을 사용할지 결정하는 데 사용됩니다:

```php
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * 새 블로그 게시글을 생성합니다.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function create(Request $request): RedirectResponse
{
    Gate::authorize('create', Post::class);

    // 현재 사용자가 블로그 게시글을 생성할 수 있습니다...

    return redirect('/posts');
}
```

<a name="via-middleware"></a>
### 미들웨어를 통한 인가

Laravel은 들어오는 요청이 라우트나 컨트롤러에 도달하기 전에 액션을 인가할 수 있는 미들웨어를 포함합니다. 기본적으로, `Illuminate\Auth\Middleware\Authorize` 미들웨어는 Laravel이 자동으로 등록하는 `can` [미들웨어 별칭](/docs/{{version}}/middleware#middleware-aliases)을 사용하여 라우트에 연결할 수 있습니다. 사용자가 게시글을 수정할 수 있는지 인가하기 위해 `can` 미들웨어를 사용하는 예제를 살펴보겠습니다:

```php
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // 현재 사용자가 게시글을 수정할 수 있습니다...
})->middleware('can:update,post');
```

이 예제에서는 `can` 미들웨어에 두 개의 인수를 전달합니다. 첫 번째는 인가하려는 액션의 이름이고, 두 번째는 정책 메서드에 전달할 라우트 매개변수입니다. 이 경우 [암시적 모델 바인딩](/docs/{{version}}/routing#implicit-binding)을 사용하고 있으므로, `App\Models\Post` 모델이 정책 메서드에 전달됩니다. 사용자가 주어진 액션을 수행할 권한이 없으면, 미들웨어에 의해 403 상태 코드의 HTTP 응답이 반환됩니다.

편의를 위해 `can` 메서드를 사용하여 라우트에 `can` 미들웨어를 연결할 수도 있습니다:

```php
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // 현재 사용자가 게시글을 수정할 수 있습니다...
})->can('update', 'post');
```

<a name="middleware-actions-that-dont-require-models"></a>
#### 모델이 필요하지 않은 액션

다시 말하지만, `create`와 같은 일부 정책 메서드는 모델 인스턴스가 필요하지 않습니다. 이러한 상황에서는 미들웨어에 클래스 이름을 전달할 수 있습니다. 클래스 이름은 액션을 인가할 때 어떤 정책을 사용할지 결정하는 데 사용됩니다:

```php
Route::post('/post', function () {
    // 현재 사용자가 게시글을 생성할 수 있습니다...
})->middleware('can:create,App\Models\Post');
```

문자열 미들웨어 정의 내에서 전체 클래스 이름을 지정하는 것은 번거로울 수 있습니다. 따라서 `can` 메서드를 사용하여 라우트에 `can` 미들웨어를 연결하는 것을 선택할 수 있습니다:

```php
use App\Models\Post;

Route::post('/post', function () {
    // 현재 사용자가 게시글을 생성할 수 있습니다...
})->can('create', Post::class);
```

<a name="via-blade-templates"></a>
### Blade 템플릿을 통한 인가

Blade 템플릿을 작성할 때 사용자가 특정 액션을 수행할 권한이 있는 경우에만 페이지의 일부를 표시하고 싶을 수 있습니다. 예를 들어, 사용자가 실제로 게시글을 수정할 수 있는 경우에만 블로그 게시글의 수정 폼을 표시하고 싶을 수 있습니다. 이 상황에서 `@can` 및 `@cannot` 지시어를 사용할 수 있습니다:

```blade
@can('update', $post)
    <!-- 현재 사용자가 게시글을 수정할 수 있습니다... -->
@elsecan('create', App\Models\Post::class)
    <!-- 현재 사용자가 새 게시글을 생성할 수 있습니다... -->
@else
    <!-- ... -->
@endcan

@cannot('update', $post)
    <!-- 현재 사용자가 게시글을 수정할 수 없습니다... -->
@elsecannot('create', App\Models\Post::class)
    <!-- 현재 사용자가 새 게시글을 생성할 수 없습니다... -->
@endcannot
```

이러한 지시어는 `@if` 및 `@unless` 문을 작성하는 편리한 단축키입니다. 위의 `@can` 및 `@cannot` 문은 다음 문과 동일합니다:

```blade
@if (Auth::user()->can('update', $post))
    <!-- 현재 사용자가 게시글을 수정할 수 있습니다... -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- 현재 사용자가 게시글을 수정할 수 없습니다... -->
@endunless
```

주어진 액션 배열에서 사용자가 하나라도 수행할 권한이 있는지 확인할 수도 있습니다. 이를 위해 `@canany` 지시어를 사용하세요:

```blade
@canany(['update', 'view', 'delete'], $post)
    <!-- 현재 사용자가 게시글을 수정, 조회 또는 삭제할 수 있습니다... -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- 현재 사용자가 게시글을 생성할 수 있습니다... -->
@endcanany
```

<a name="blade-actions-that-dont-require-models"></a>
#### 모델이 필요하지 않은 액션

대부분의 다른 인가 메서드와 마찬가지로, 액션에 모델 인스턴스가 필요하지 않은 경우 `@can` 및 `@cannot` 지시어에 클래스 이름을 전달할 수 있습니다:

```blade
@can('create', App\Models\Post::class)
    <!-- 현재 사용자가 게시글을 생성할 수 있습니다... -->
@endcan

@cannot('create', App\Models\Post::class)
    <!-- 현재 사용자가 게시글을 생성할 수 없습니다... -->
@endcannot
```

<a name="supplying-additional-context"></a>
### 추가 컨텍스트 제공하기

정책을 사용하여 액션을 인가할 때, 다양한 인가 함수 및 헬퍼의 두 번째 인수로 배열을 전달할 수 있습니다. 배열의 첫 번째 요소는 어떤 정책을 호출할지 결정하는 데 사용되고, 나머지 배열 요소는 정책 메서드에 매개변수로 전달되어 인가 결정을 내릴 때 추가 컨텍스트로 사용할 수 있습니다. 예를 들어, 추가 `$category` 매개변수가 포함된 다음 `PostPolicy` 메서드 정의를 고려하세요:

```php
/**
 * 주어진 게시글을 사용자가 수정할 수 있는지 확인합니다.
 */
public function update(User $user, Post $post, int $category): bool
{
    return $user->id === $post->user_id &&
           $user->canUpdateCategory($category);
}
```

인증된 사용자가 주어진 게시글을 수정할 수 있는지 확인할 때, 다음과 같이 이 정책 메서드를 호출할 수 있습니다:

```php
/**
 * 주어진 블로그 게시글을 수정합니다.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function update(Request $request, Post $post): RedirectResponse
{
    Gate::authorize('update', [$post, $request->category]);

    // 현재 사용자가 블로그 게시글을 수정할 수 있습니다...

    return redirect('/posts');
}
```

<a name="authorization-and-inertia"></a>
## 인가 & Inertia

인가는 항상 서버에서 처리해야 하지만, 애플리케이션의 UI를 올바르게 렌더링하기 위해 프론트엔드 애플리케이션에 인가 데이터를 제공하는 것이 편리할 수 있습니다. Laravel은 Inertia 기반 프론트엔드에 인가 정보를 노출하기 위한 필수 규칙을 정의하지 않습니다.

그러나 Laravel의 Inertia 기반 [스타터 키트](/docs/{{version}}/starter-kits) 중 하나를 사용하는 경우, 애플리케이션에 이미 `HandleInertiaRequests` 미들웨어가 포함되어 있습니다. 이 미들웨어의 `share` 메서드 내에서 애플리케이션의 모든 Inertia 페이지에 제공될 공유 데이터를 반환할 수 있습니다. 이 공유 데이터는 사용자에 대한 인가 정보를 정의하는 데 편리한 위치가 될 수 있습니다:

```php
<?php

namespace App\Http\Middleware;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    // ...

    /**
     * 기본적으로 공유되는 props를 정의합니다.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request)
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => [
                    'post' => [
                        'create' => $request->user()->can('create', Post::class),
                    ],
                ],
            ],
        ];
    }
}
```

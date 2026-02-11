# Laravel Pennant

- [소개](#introduction)
- [설치](#installation)
- [설정](#configuration)
- [기능 정의하기](#defining-features)
    - [클래스 기반 기능](#class-based-features)
- [기능 확인하기](#checking-features)
    - [조건부 실행](#conditional-execution)
    - [`HasFeatures` 트레이트](#the-has-features-trait)
    - [블레이드 디렉티브](#blade-directive)
    - [미들웨어](#middleware)
    - [인메모리 캐시](#in-memory-cache)
- [스코프](#scope)
    - [스코프 지정하기](#specifying-the-scope)
    - [기본 스코프](#default-scope)
    - [Nullable 스코프](#nullable-scope)
    - [스코프 식별하기](#identifying-scope)
    - [스코프 직렬화](#serializing-scope)
- [리치 기능 값](#rich-feature-values)
- [여러 기능 조회하기](#retrieving-multiple-features)
- [즉시 로딩](#eager-loading)
- [값 업데이트](#updating-values)
    - [일괄 업데이트](#bulk-updates)
    - [기능 삭제](#purging-features)
- [테스트](#testing)
- [커스텀 Pennant 드라이버 추가하기](#adding-custom-pennant-drivers)
    - [드라이버 구현하기](#implementing-the-driver)
    - [드라이버 등록하기](#registering-the-driver)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

[Laravel Pennant](https://github.com/laravel/pennant)는 간단하고 가벼운 기능 플래그(Feature Flag) 패키지입니다. 기능 플래그를 사용하면 새로운 애플리케이션 기능을 점진적으로 자신 있게 출시하고, 새로운 인터페이스 디자인을 A/B 테스트하고, 트렁크 기반 개발 전략을 보완하는 등 다양한 작업을 수행할 수 있습니다.

<a name="installation"></a>
## 설치

먼저 Composer 패키지 관리자를 사용하여 프로젝트에 Pennant를 설치합니다.

```shell
composer require laravel/pennant
```

다음으로, `vendor:publish` Artisan 명령어를 사용하여 Pennant 설정 및 마이그레이션 파일을 퍼블리시해야 합니다.

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

마지막으로, 애플리케이션의 데이터베이스 마이그레이션을 실행해야 합니다. 이렇게 하면 Pennant가 `database` 드라이버를 구동하는 데 사용하는 `features` 테이블이 생성됩니다.

```shell
php artisan migrate
```

<a name="configuration"></a>
## 설정

Pennant의 에셋을 퍼블리시한 후, 설정 파일은 `config/pennant.php`에 위치합니다. 이 설정 파일을 통해 Pennant가 해결된 기능 플래그 값을 저장하는 데 사용할 기본 저장 메커니즘을 지정할 수 있습니다.

Pennant는 `array` 드라이버를 통해 인메모리 배열에 해결된 기능 플래그 값을 저장하는 것을 지원합니다. 또는 Pennant는 `database` 드라이버를 통해 관계형 데이터베이스에 해결된 기능 플래그 값을 영구적으로 저장할 수 있으며, 이것이 Pennant가 사용하는 기본 저장 메커니즘입니다.

<a name="defining-features"></a>
## 기능 정의하기

기능을 정의하려면 `Feature` 파사드가 제공하는 `define` 메서드를 사용할 수 있습니다. 기능의 이름과 기능의 초기 값을 해결하기 위해 호출될 클로저를 제공해야 합니다.

일반적으로 기능은 `Feature` 파사드를 사용하여 서비스 프로바이더에서 정의됩니다. 클로저는 기능 확인을 위한 "스코프"를 받습니다. 가장 일반적으로 스코프는 현재 인증된 사용자입니다. 이 예제에서는 애플리케이션 사용자에게 새로운 API를 점진적으로 출시하기 위한 기능을 정의합니다.

```php
<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Lottery;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Feature::define('new-api', fn (User $user) => match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        });
    }
}
```

보시다시피, 기능에 대해 다음과 같은 규칙이 있습니다.

- 모든 내부 팀 멤버는 새로운 API를 사용해야 합니다.
- 트래픽이 많은 고객은 새로운 API를 사용하면 안 됩니다.
- 그 외의 경우, 기능은 100분의 1 확률로 사용자에게 무작위로 할당됩니다.

주어진 사용자에 대해 `new-api` 기능을 처음 확인할 때, 클로저의 결과가 스토리지 드라이버에 저장됩니다. 다음에 동일한 사용자에 대해 기능을 확인하면 값이 스토리지에서 검색되고 클로저가 호출되지 않습니다.

편의를 위해 기능 정의가 로터리만 반환하는 경우 클로저를 완전히 생략할 수 있습니다.

    Feature::define('site-redesign', Lottery::odds(1, 1000));

<a name="class-based-features"></a>
### 클래스 기반 기능

Pennant를 사용하면 클래스 기반 기능을 정의할 수도 있습니다. 클로저 기반 기능 정의와 달리, 클래스 기반 기능은 서비스 프로바이더에 등록할 필요가 없습니다. 클래스 기반 기능을 생성하려면 `pennant:feature` Artisan 명령어를 호출할 수 있습니다. 기본적으로 기능 클래스는 애플리케이션의 `app/Features` 디렉토리에 배치됩니다.

```shell
php artisan pennant:feature NewApi
```

기능 클래스를 작성할 때는 주어진 스코프에 대해 기능의 초기 값을 해결하기 위해 호출될 `resolve` 메서드만 정의하면 됩니다. 다시 말하지만, 스코프는 일반적으로 현재 인증된 사용자입니다.

```php
<?php

namespace App\Features;

use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * 기능의 초기 값을 해결합니다.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

> [!NOTE] 기능 클래스는 [컨테이너](/docs/{{version}}/container)를 통해 해결되므로, 필요할 때 기능 클래스의 생성자에 의존성을 주입할 수 있습니다.

#### 저장되는 기능 이름 커스터마이징

기본적으로 Pennant는 기능 클래스의 완전한 클래스 이름을 저장합니다. 저장되는 기능 이름을 애플리케이션의 내부 구조에서 분리하려면 기능 클래스에 `$name` 속성을 지정할 수 있습니다. 이 속성의 값이 클래스 이름 대신 저장됩니다.

```php
<?php

namespace App\Features;

class NewApi
{
    /**
     * 기능의 저장 이름입니다.
     *
     * @var string
     */
    public $name = 'new-api';

    // ...
}
```

<a name="checking-features"></a>
## 기능 확인하기

기능이 활성화되어 있는지 확인하려면 `Feature` 파사드에서 `active` 메서드를 사용할 수 있습니다. 기본적으로 기능은 현재 인증된 사용자에 대해 확인됩니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * 리소스 목록을 표시합니다.
     */
    public function index(Request $request): Response
    {
        return Feature::active('new-api')
                ? $this->resolveNewApiResponse($request)
                : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

기본적으로 기능은 현재 인증된 사용자에 대해 확인되지만, 다른 사용자나 [스코프](#scope)에 대해 기능을 쉽게 확인할 수 있습니다. 이를 위해 `Feature` 파사드가 제공하는 `for` 메서드를 사용합니다.

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

Pennant는 기능이 활성화되어 있는지 여부를 판단할 때 유용할 수 있는 몇 가지 추가 편의 메서드도 제공합니다.

```php
// 주어진 모든 기능이 활성화되어 있는지 확인...
Feature::allAreActive(['new-api', 'site-redesign']);

// 주어진 기능 중 하나라도 활성화되어 있는지 확인...
Feature::someAreActive(['new-api', 'site-redesign']);

// 기능이 비활성화되어 있는지 확인...
Feature::inactive('new-api');

// 주어진 모든 기능이 비활성화되어 있는지 확인...
Feature::allAreInactive(['new-api', 'site-redesign']);

// 주어진 기능 중 하나라도 비활성화되어 있는지 확인...
Feature::someAreInactive(['new-api', 'site-redesign']);
```

> [!NOTE]
> Artisan 명령어나 큐 작업과 같이 HTTP 컨텍스트 외부에서 Pennant를 사용할 때는 일반적으로 [기능의 스코프를 명시적으로 지정](#specifying-the-scope)해야 합니다. 또는 인증된 HTTP 컨텍스트와 인증되지 않은 컨텍스트 모두를 고려하는 [기본 스코프](#default-scope)를 정의할 수 있습니다.

<a name="checking-class-based-features"></a>
#### 클래스 기반 기능 확인하기

클래스 기반(class-based) 기능의 경우, 기능을 확인할 때 클래스 이름을 제공해야 합니다.

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * 리소스 목록을 표시합니다.
     */
    public function index(Request $request): Response
    {
        return Feature::active(NewApi::class)
                ? $this->resolveNewApiResponse($request)
                : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

<a name="conditional-execution"></a>
### 조건부 실행

`when` 메서드는 기능이 활성화된 경우 주어진 클로저를 유연하게 실행하는 데 사용할 수 있습니다. 또한 기능이 비활성화된 경우 실행될 두 번째 클로저를 제공할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * 리소스 목록을 표시합니다.
     */
    public function index(Request $request): Response
    {
        return Feature::when(NewApi::class,
            fn () => $this->resolveNewApiResponse($request),
            fn () => $this->resolveLegacyApiResponse($request),
        );
    }

    // ...
}
```

`unless` 메서드는 `when` 메서드의 반대로, 기능이 비활성화된 경우 첫 번째 클로저를 실행합니다.

```php
return Feature::unless(NewApi::class,
    fn () => $this->resolveLegacyApiResponse($request),
    fn () => $this->resolveNewApiResponse($request),
);
```

<a name="the-has-features-trait"></a>
### `HasFeatures` 트레이트

Pennant의 `HasFeatures` 트레이트를 애플리케이션의 `User` 모델(또는 기능이 있는 다른 모델)에 추가하여 모델에서 직접 기능을 확인하는 유연하고 편리한 방법을 제공할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Pennant\Concerns\HasFeatures;

class User extends Authenticatable
{
    use HasFeatures;

    // ...
}
```

트레이트가 모델에 추가되면 `features` 메서드를 호출하여 기능을 쉽게 확인할 수 있습니다.

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

물론 `features` 메서드는 기능과 상호작용하기 위한 다른 많은 편리한 메서드에 대한 액세스를 제공합니다.

```php
// 값...
$value = $user->features()->value('purchase-button')
$values = $user->features()->values(['new-api', 'purchase-button']);

// 상태...
$user->features()->active('new-api');
$user->features()->allAreActive(['new-api', 'server-api']);
$user->features()->someAreActive(['new-api', 'server-api']);

$user->features()->inactive('new-api');
$user->features()->allAreInactive(['new-api', 'server-api']);
$user->features()->someAreInactive(['new-api', 'server-api']);

// 조건부 실행...
$user->features()->when('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);

$user->features()->unless('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);
```

<a name="blade-directive"></a>
### 블레이드 디렉티브

Blade에서 기능 확인을 원활하게 하기 위해 Pennant는 `@feature` 디렉티브를 제공합니다.

```blade
@feature('site-redesign')
    <!-- 'site-redesign'이 활성화됨 -->
@else
    <!-- 'site-redesign'이 비활성화됨 -->
@endfeature
```

<a name="middleware"></a>
### 미들웨어

Pennant에는 라우트가 호출되기 전에 현재 인증된 사용자가 기능에 액세스할 수 있는지 확인하는 데 사용할 수 있는 [미들웨어](/docs/{{version}}/middleware)도 포함되어 있습니다. 라우트에 미들웨어를 할당하고 라우트에 액세스하는 데 필요한 기능을 지정할 수 있습니다. 지정된 기능 중 하나라도 현재 인증된 사용자에 대해 비활성화되어 있으면 라우트에서 `400 Bad Request` HTTP 응답이 반환됩니다. 정적 `using` 메서드에 여러 기능을 전달할 수 있습니다.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a name="customizing-the-response"></a>
#### 응답 커스터마이징

나열된 기능 중 하나가 비활성화되어 있을 때 미들웨어가 반환하는 응답을 커스터마이징하려면 `EnsureFeaturesAreActive` 미들웨어가 제공하는 `whenInactive` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드 내에서 호출해야 합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    EnsureFeaturesAreActive::whenInactive(
        function (Request $request, array $features) {
            return new Response(status: 403);
        }
    );

    // ...
}
```

<a name="in-memory-cache"></a>
### 인메모리 캐시

기능을 확인할 때 Pennant는 결과의 인메모리 캐시를 생성합니다. `database` 드라이버를 사용하는 경우, 단일 요청 내에서 동일한 기능 플래그를 다시 확인해도 추가 데이터베이스 쿼리가 트리거되지 않습니다. 이것은 또한 요청 기간 동안 기능이 일관된 결과를 갖도록 보장합니다.

인메모리 캐시를 수동으로 플러시해야 하는 경우 `Feature` 파사드가 제공하는 `flushCache` 메서드를 사용할 수 있습니다.

```php
Feature::flushCache();
```

<a name="scope"></a>
## 스코프

<a name="specifying-the-scope"></a>
### 스코프 지정하기

논의한 바와 같이 기능은 일반적으로 현재 인증된 사용자에 대해 확인됩니다. 그러나 이것이 항상 필요에 맞지 않을 수 있습니다. 따라서 `Feature` 파사드의 `for` 메서드를 통해 주어진 기능을 확인할 스코프를 지정할 수 있습니다.

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

물론 기능 스코프는 "사용자"에 제한되지 않습니다. 개별 사용자가 아닌 전체 팀에 출시하는 새로운 결제 경험을 구축했다고 상상해 보세요. 아마도 오래된 팀이 새로운 팀보다 더 느린 출시를 갖기를 원할 것입니다. 기능 해결 클로저는 다음과 같이 보일 수 있습니다.

```php
use App\Models\Team;
use Carbon\Carbon;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('billing-v2', function (Team $team) {
    if ($team->created_at->isAfter(new Carbon('1st Jan, 2023'))) {
        return true;
    }

    if ($team->created_at->isAfter(new Carbon('1st Jan, 2019'))) {
        return Lottery::odds(1 / 100);
    }

    return Lottery::odds(1 / 1000);
});
```

정의한 클로저가 `User`가 아닌 `Team` 모델을 기대한다는 것을 알 수 있습니다. 이 기능이 사용자의 팀에 대해 활성화되어 있는지 확인하려면 `Feature` 파사드가 제공하는 `for` 메서드에 팀을 전달해야 합니다.

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect()->to('/billing/v2');
}

// ...
```

<a name="default-scope"></a>
### 기본 스코프

Pennant가 기능을 확인하는 데 사용하는 기본 스코프를 커스터마이징할 수도 있습니다. 예를 들어, 모든 기능이 사용자 대신 현재 인증된 사용자의 팀에 대해 확인될 수 있습니다. 기능을 확인할 때마다 `Feature::for($user->team)`을 호출하는 대신 팀을 기본 스코프로 지정할 수 있습니다. 일반적으로 이것은 애플리케이션의 서비스 프로바이더 중 하나에서 수행해야 합니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Feature::resolveScopeUsing(fn ($driver) => Auth::user()?->team);

        // ...
    }
}
```

`for` 메서드를 통해 스코프가 명시적으로 제공되지 않으면 기능 확인은 이제 현재 인증된 사용자의 팀을 기본 스코프로 사용합니다.

```php
Feature::active('billing-v2');

// 이제 다음과 동일합니다...

Feature::for($user->team)->active('billing-v2');
```

<a name="nullable-scope"></a>
### Nullable 스코프

기능을 확인할 때 제공하는 스코프가 `null`이고 기능의 정의가 nullable 타입 또는 유니온 타입에 `null`을 포함하여 `null`을 지원하지 않는 경우, Pennant는 자동으로 기능의 결과 값으로 `false`를 반환합니다.

따라서 기능에 전달하는 스코프가 잠재적으로 `null`이고 기능의 값 리졸버가 호출되기를 원한다면 기능 정의에서 이를 고려해야 합니다. `null` 스코프는 Artisan 명령어, 큐 작업 또는 인증되지 않은 라우트 내에서 기능을 확인하는 경우 발생할 수 있습니다. 이러한 컨텍스트에서는 일반적으로 인증된 사용자가 없으므로 기본 스코프가 `null`이 됩니다.

항상 [기능 스코프를 명시적으로 지정](#specifying-the-scope)하지 않는 경우 스코프의 타입이 "nullable"인지 확인하고 기능 정의 로직 내에서 `null` 스코프 값을 처리해야 합니다.

```php
use App\Models\User;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('new-api', fn (User $user) => match (true) {// [tl! remove]
Feature::define('new-api', fn (User|null $user) => match (true) {// [tl! add]
    $user === null => true,// [tl! add]
    $user->isInternalTeamMember() => true,
    $user->isHighTrafficCustomer() => false,
    default => Lottery::odds(1 / 100),
});
```

<a name="identifying-scope"></a>
### 스코프 식별하기

Pennant의 내장 `array` 및 `database` 스토리지 드라이버는 모든 PHP 데이터 타입과 Eloquent 모델에 대한 스코프 식별자를 올바르게 저장하는 방법을 알고 있습니다. 그러나 애플리케이션이 타사 Pennant 드라이버를 활용하는 경우 해당 드라이버는 Eloquent 모델이나 애플리케이션의 다른 커스텀 타입에 대한 식별자를 올바르게 저장하는 방법을 모를 수 있습니다.

이러한 점을 고려하여 Pennant를 사용하면 애플리케이션에서 Pennant 스코프로 사용되는 객체에 `FeatureScopeable` 계약을 구현하여 저장을 위한 스코프 값의 형식을 지정할 수 있습니다.

예를 들어, 단일 애플리케이션에서 내장 `database` 드라이버와 타사 "Flag Rocket" 드라이버라는 두 가지 다른 기능 드라이버를 사용한다고 상상해 보세요. "Flag Rocket" 드라이버는 Eloquent 모델을 올바르게 저장하는 방법을 모릅니다. 대신 `FlagRocketUser` 인스턴스가 필요합니다. `FeatureScopeable` 계약에 의해 정의된 `toFeatureIdentifier`를 구현하여 애플리케이션에서 사용하는 각 드라이버에 제공되는 저장 가능한 스코프 값을 커스터마이징할 수 있습니다.

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * 주어진 드라이버의 기능 스코프 식별자로 객체를 캐스팅합니다.
     */
    public function toFeatureIdentifier(string $driver): mixed
    {
        return match($driver) {
            'database' => $this,
            'flag-rocket' => FlagRocketUser::fromId($this->flag_rocket_id),
        };
    }
}
```

<a name="serializing-scope"></a>
### 스코프 직렬화

기본적으로 Pennant는 Eloquent 모델과 연결된 기능을 저장할 때 완전한 클래스 이름을 사용합니다. 이미 [Eloquent morph map](/docs/{{version}}/eloquent-relationships#custom-polymorphic-types)을 사용하고 있다면 Pennant도 morph map을 사용하여 저장된 기능을 애플리케이션 구조에서 분리하도록 선택할 수 있습니다.

이를 달성하려면 서비스 프로바이더에서 Eloquent morph map을 정의한 후 `Feature` 파사드의 `useMorphMap` 메서드를 호출할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Pennant\Feature;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);

Feature::useMorphMap();
```

<a name="rich-feature-values"></a>
## 리치 기능 값

지금까지 기능이 이진 상태, 즉 "활성" 또는 "비활성"인 것을 주로 보여주었지만, Pennant를 사용하면 리치 값도 저장할 수 있습니다.

예를 들어, 애플리케이션의 "지금 구매" 버튼에 대해 세 가지 새로운 색상을 테스트한다고 상상해 보세요. 기능 정의에서 `true` 또는 `false`를 반환하는 대신 문자열을 반환할 수 있습니다.

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

`value` 메서드를 사용하여 `purchase-button` 기능의 값을 검색할 수 있습니다.

```php
$color = Feature::value('purchase-button');
```

Pennant에 포함된 Blade 디렉티브를 사용하면 기능의 현재 값에 따라 조건부로 콘텐츠를 쉽게 렌더링할 수 있습니다.

```blade
@feature('purchase-button', 'blue-sapphire')
    <!-- 'blue-sapphire'가 활성화됨 -->
@elsefeature('purchase-button', 'seafoam-green')
    <!-- 'seafoam-green'이 활성화됨 -->
@elsefeature('purchase-button', 'tart-orange')
    <!-- 'tart-orange'가 활성화됨 -->
@endfeature
```

> [!NOTE] 리치 값을 사용할 때 기능이 `false` 이외의 값을 가질 때 "활성"으로 간주된다는 것을 알아야 합니다.

[조건부 `when`](#conditional-execution) 메서드를 호출할 때 기능의 리치 값이 첫 번째 클로저에 제공됩니다.

```php
Feature::when('purchase-button',
    fn ($color) => /* ... */,
    fn () => /* ... */,
);
```

마찬가지로 조건부 `unless` 메서드를 호출할 때 기능의 리치 값이 선택적 두 번째 클로저에 제공됩니다.

```php
Feature::unless('purchase-button',
    fn () => /* ... */,
    fn ($color) => /* ... */,
);
```

<a name="retrieving-multiple-features"></a>
## 여러 기능 조회하기

`values` 메서드를 사용하면 주어진 스코프에 대한 여러 기능을 검색할 수 있습니다.

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

또는 `all` 메서드를 사용하여 주어진 스코프에 대해 정의된 모든 기능의 값을 검색할 수 있습니다.

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

그러나 클래스 기반(class-based) 기능은 동적으로 등록되며 명시적으로 확인되기 전까지 Pennant에 알려지지 않습니다. 이는 현재 요청 중에 이미 확인되지 않은 경우 애플리케이션의 클래스 기반 기능이 `all` 메서드가 반환하는 결과에 나타나지 않을 수 있음을 의미합니다.

`all` 메서드를 사용할 때 기능 클래스가 항상 포함되도록 하려면 Pennant의 기능 검색 기능을 사용할 수 있습니다. 시작하려면 애플리케이션의 서비스 프로바이더 중 하나에서 `discover` 메서드를 호출합니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Feature::discover();

        // ...
    }
}
```

`discover` 메서드는 애플리케이션의 `app/Features` 디렉토리에 있는 모든 기능 클래스를 등록합니다. `all` 메서드는 이제 현재 요청 중에 확인되었는지 여부에 관계없이 이러한 클래스를 결과에 포함합니다.

```php
Feature::all();

// [
//     'App\Features\NewApi' => true,
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

<a name="eager-loading"></a>
## 즉시 로딩

Pennant는 단일 요청에 대해 해결된 모든 기능의 인메모리 캐시를 유지하지만 여전히 성능 문제가 발생할 수 있습니다. 이를 완화하기 위해 Pennant는 기능 값을 즉시 로드하는 기능을 제공합니다.

이를 설명하기 위해 루프 내에서 기능이 활성화되어 있는지 확인한다고 상상해 보세요.

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

데이터베이스 드라이버를 사용한다고 가정하면 이 코드는 루프의 각 사용자에 대해 데이터베이스 쿼리를 실행합니다 - 잠재적으로 수백 개의 쿼리를 실행합니다. 그러나 Pennant의 `load` 메서드를 사용하면 사용자 또는 스코프 컬렉션에 대한 기능 값을 즉시 로드하여 이 잠재적인 성능 병목 현상을 제거할 수 있습니다.

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

아직 로드되지 않은 경우에만 기능 값을 로드하려면 `loadMissing` 메서드를 사용할 수 있습니다.

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

<a name="updating-values"></a>
## 값 업데이트

기능의 값이 처음 해결되면 기본 드라이버가 결과를 스토리지에 저장합니다. 이것은 종종 요청 간에 사용자에게 일관된 경험을 보장하는 데 필요합니다. 그러나 때때로 기능의 저장된 값을 수동으로 업데이트하고 싶을 수 있습니다.

이를 위해 `activate` 및 `deactivate` 메서드를 사용하여 기능을 "켜거나" "끌" 수 있습니다.

```php
use Laravel\Pennant\Feature;

// 기본 스코프에 대해 기능 활성화...
Feature::activate('new-api');

// 주어진 스코프에 대해 기능 비활성화...
Feature::for($user->team)->deactivate('billing-v2');
```

`activate` 메서드에 두 번째 인수를 제공하여 기능에 대한 리치 값을 수동으로 설정할 수도 있습니다.

```php
Feature::activate('purchase-button', 'seafoam-green');
```

Pennant에게 기능의 저장된 값을 잊도록 지시하려면 `forget` 메서드를 사용할 수 있습니다. 기능이 다시 확인되면 Pennant는 기능 정의에서 기능의 값을 해결합니다.

```php
Feature::forget('purchase-button');
```

<a name="bulk-updates"></a>
### 일괄 업데이트

저장된 기능 값을 일괄 업데이트하려면 `activateForEveryone` 및 `deactivateForEveryone` 메서드를 사용할 수 있습니다.

예를 들어, 이제 `new-api` 기능의 안정성에 확신이 있고 체크아웃 흐름에 가장 적합한 `'purchase-button'` 색상을 결정했다면 - 모든 사용자에 대해 저장된 값을 적절히 업데이트할 수 있습니다.

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

또는 모든 사용자에 대해 기능을 비활성화할 수 있습니다.

```php
Feature::deactivateForEveryone('new-api');
```

> [!NOTE] 이것은 Pennant의 스토리지 드라이버에 의해 저장된 해결된 기능 값만 업데이트합니다. 애플리케이션에서 기능 정의도 업데이트해야 합니다.

<a name="purging-features"></a>
### 기능 삭제

때때로 스토리지에서 전체 기능을 삭제하는 것이 유용할 수 있습니다. 이것은 일반적으로 애플리케이션에서 기능을 제거했거나 모든 사용자에게 출시하려는 기능 정의를 조정한 경우에 필요합니다.

`purge` 메서드를 사용하여 기능에 대해 저장된 모든 값을 제거할 수 있습니다.

```php
// 단일 기능 삭제...
Feature::purge('new-api');

// 여러 기능 삭제...
Feature::purge(['new-api', 'purchase-button']);
```

스토리지에서 _모든_ 기능을 삭제하려면 인수 없이 `purge` 메서드를 호출할 수 있습니다.

```php
Feature::purge();
```

애플리케이션의 배포 파이프라인의 일부로 기능을 삭제하는 것이 유용할 수 있으므로 Pennant에는 스토리지에서 제공된 기능을 삭제하는 `pennant:purge` Artisan 명령어가 포함되어 있습니다.

```shell
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

주어진 기능 목록을 _제외한_ 모든 기능을 삭제할 수도 있습니다. 예를 들어, "new-api" 및 "purchase-button" 기능의 값을 스토리지에 유지하면서 다른 모든 기능을 삭제하고 싶다고 상상해 보세요. 이를 위해 해당 기능 이름을 `--except` 옵션에 전달할 수 있습니다.

```shell
php artisan pennant:purge --except=new-api --except=purchase-button
```

편의를 위해 `pennant:purge` 명령어는 `--except-registered` 플래그도 지원합니다. 이 플래그는 서비스 프로바이더에 명시적으로 등록된 기능을 제외한 모든 기능을 삭제해야 함을 나타냅니다.

```shell
php artisan pennant:purge --except-registered
```

<a name="testing"></a>
## 테스트

기능 플래그와 상호작용하는 코드를 테스트할 때 테스트에서 기능 플래그의 반환 값을 제어하는 가장 쉬운 방법은 단순히 기능을 다시 정의하는 것입니다. 예를 들어, 애플리케이션의 서비스 프로바이더 중 하나에 다음 기능이 정의되어 있다고 상상해 보세요.

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

테스트에서 기능의 반환 값을 수정하려면 테스트 시작 부분에서 기능을 다시 정의할 수 있습니다. 다음 테스트는 서비스 프로바이더에 `Arr::random()` 구현이 여전히 있더라도 항상 통과합니다.

```php
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define('purchase-button', 'seafoam-green');

    $this->assertSame('seafoam-green', Feature::value('purchase-button'));
}
```

클래스 기반(class-based) 기능에도 동일한 접근 방식을 사용할 수 있습니다.

```php
use App\Features\NewApi;
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define(NewApi::class, true);

    $this->assertTrue(Feature::value(NewApi::class));
}
```

기능이 `Lottery` 인스턴스를 반환하는 경우 몇 가지 유용한 [테스트 헬퍼를 사용할 수 있습니다](/docs/{{version}}/helpers#testing-lotteries).

<a name="store-configuration"></a>
#### 스토어 설정

애플리케이션의 `phpunit.xml` 파일에서 `PENNANT_STORE` 환경 변수를 정의하여 테스트 중에 Pennant가 사용할 스토어를 설정할 수 있습니다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit colors="true">
    <!-- ... -->
    <php>
        <env name="PENNANT_STORE" value="array"/>
        <!-- ... -->
    </php>
</phpunit>
```

<a name="adding-custom-pennant-drivers"></a>
## 커스텀 Pennant 드라이버 추가하기

<a name="implementing-the-driver"></a>
#### 드라이버 구현하기

Pennant의 기존 스토리지 드라이버가 애플리케이션의 요구에 맞지 않는 경우 자체 스토리지 드라이버를 작성할 수 있습니다. 커스텀 드라이버는 `Laravel\Pennant\Contracts\Driver` 인터페이스를 구현해야 합니다.

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;

class RedisFeatureDriver implements Driver
{
    public function define(string $feature, callable $resolver): void {}
    public function defined(): array {}
    public function getAll(array $features): array {}
    public function get(string $feature, mixed $scope): mixed {}
    public function set(string $feature, mixed $scope, mixed $value): void {}
    public function setForAllScopes(string $feature, mixed $value): void {}
    public function delete(string $feature, mixed $scope): void {}
    public function purge(array|null $features): void {}
}
```

이제 Redis 연결을 사용하여 이러한 각 메서드를 구현하기만 하면 됩니다. 이러한 각 메서드를 구현하는 방법의 예는 [Pennant 소스 코드](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php)의 `Laravel\Pennant\Drivers\DatabaseDriver`를 참조하세요.

> [!NOTE]
> Laravel은 확장을 포함할 디렉토리를 제공하지 않습니다. 원하는 곳에 자유롭게 배치할 수 있습니다. 이 예에서는 `RedisFeatureDriver`를 포함하기 위해 `Extensions` 디렉토리를 만들었습니다.

<a name="registering-the-driver"></a>
#### 드라이버 등록하기

드라이버가 구현되면 Laravel에 등록할 준비가 된 것입니다. Pennant에 추가 드라이버를 추가하려면 `Feature` 파사드가 제공하는 `extend` 메서드를 사용할 수 있습니다. 애플리케이션의 [서비스 프로바이더](/docs/{{version}}/providers) 중 하나의 `boot` 메서드에서 `extend` 메서드를 호출해야 합니다.

```php
<?php

namespace App\Providers;

use App\Extensions\RedisFeatureDriver;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

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
        Feature::extend('redis', function (Application $app) {
            return new RedisFeatureDriver($app->make('redis'), $app->make('events'), []);
        });
    }
}
```

드라이버가 등록되면 애플리케이션의 `config/pennant.php` 설정 파일에서 `redis` 드라이버를 사용할 수 있습니다.

```php
'stores' => [

    'redis' => [
        'driver' => 'redis',
        'connection' => null,
    ],

    // ...

],
```

<a name="events"></a>
## 이벤트

Pennant는 애플리케이션 전체에서 기능 플래그를 추적하는 데 유용할 수 있는 다양한 이벤트를 디스패치합니다.

### `Laravel\Pennant\Events\RetrievingKnownFeature`

이 이벤트는 요청 중에 특정 스코프에 대해 알려진 기능이 처음 검색될 때 디스패치됩니다. 이 이벤트는 애플리케이션 전체에서 사용되는 기능 플래그에 대한 메트릭을 만들고 추적하는 데 유용할 수 있습니다.

### `Laravel\Pennant\Events\RetrievingUnknownFeature`

이 이벤트는 요청 중에 특정 스코프에 대해 알 수 없는 기능이 처음 검색될 때 디스패치됩니다. 이 이벤트는 기능 플래그를 제거하려고 했지만 애플리케이션 전체에 실수로 참조를 남긴 경우 유용할 수 있습니다.

예를 들어, 이 이벤트가 발생할 때 이를 수신하여 `report`하거나 예외를 던지는 것이 유용할 수 있습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

use Laravel\Pennant\Events\RetrievingUnknownFeature;

class EventServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션의 기타 이벤트를 등록합니다.
     */
    public function boot(): void
    {
        Event::listen(function (RetrievingUnknownFeature $event) {
            report("Resolving unknown feature [{$event->feature}].");
        });
    }
}
```

### `Laravel\Pennant\Events\DynamicallyDefiningFeature`

이 이벤트는 요청 중에 클래스 기반(class-based) 기능이 처음으로 동적으로 확인될 때 디스패치됩니다.

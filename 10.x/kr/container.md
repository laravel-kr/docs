# 서비스 컨테이너(Service Container)

- [소개](#introduction)
    - [설정 없는 의존성 해결](#zero-configuration-resolution)
    - [컨테이너를 사용해야 하는 경우](#when-to-use-the-container)
- [바인딩](#binding)
    - [바인딩 기초](#binding-basics)
    - [인터페이스와 구현체 바인딩](#binding-interfaces-to-implementations)
    - [컨텍스트 바인딩](#contextual-binding)
    - [프리미티브 바인딩](#binding-primitives)
    - [타입이 지정된 가변 인자 바인딩](#binding-typed-variadics)
    - [태깅](#tagging)
    - [바인딩 확장](#extending-bindings)
- [의존성 해결](#resolving)
    - [make 메소드](#the-make-method)
    - [자동 주입](#automatic-injection)
- [메소드 호출과 주입](#method-invocation-and-injection)
- [컨테이너 이벤트](#container-events)
- [PSR-11](#psr-11)

<a name="introduction"></a>
## 소개

Laravel 서비스 컨테이너(Service Container)는 클래스의 의존성을 관리하고 의존성 주입(Dependency Injection)을 수행하는 강력한 도구입니다. 의존성 주입이란 멋진 표현이지만, 본질적으로 이것은 클래스의 의존성이 생성자 또는 경우에 따라 "세터(setter)" 메소드를 통해 클래스에 "주입"된다는 것을 의미합니다.

간단한 예제를 살펴보겠습니다:

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Repositories\UserRepository;
    use App\Models\User;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * 새로운 컨트롤러 인스턴스를 생성합니다.
         */
        public function __construct(
            protected UserRepository $users,
        ) {}

        /**
         * 주어진 사용자의 프로필을 표시합니다.
         */
        public function show(string $id): View
        {
            $user = $this->users->find($id);

            return view('user.profile', ['user' => $user]);
        }
    }

이 예제에서 `UserController`는 데이터 소스에서 사용자를 조회해야 합니다. 따라서 사용자를 검색할 수 있는 서비스를 **주입**할 것입니다. 이 맥락에서 `UserRepository`는 대부분 [Eloquent](/docs/{{version}}/eloquent)를 사용하여 데이터베이스에서 사용자 정보를 가져올 것입니다. 그러나 리포지토리가 주입되기 때문에 다른 구현으로 쉽게 교체할 수 있습니다. 또한 애플리케이션을 테스트할 때 `UserRepository`의 더미 구현을 쉽게 "목(mock)"으로 만들거나 생성할 수 있습니다.

Laravel 서비스 컨테이너에 대한 깊은 이해는 강력하고 큰 규모의 애플리케이션을 구축하는 데 필수적이며, Laravel 코어 자체에 기여하는 데도 중요합니다.

<a name="zero-configuration-resolution"></a>
### 설정 없는 의존성 해결(Zero Configuration Resolution)

클래스에 의존성이 없거나 다른 구체적인 클래스(인터페이스가 아닌)에만 의존하는 경우, 컨테이너에 해당 클래스를 어떻게 해결해야 하는지 알려줄 필요가 없습니다. 예를 들어, `routes/web.php` 파일에 다음 코드를 작성할 수 있습니다:

```php
<?php

class Service
{
    // ...
}

Route::get('/', function (Service $service) {
    die($service::class);
});
```

이 예제에서 애플리케이션의 `/` 라우트에 접근하면 `Service` 클래스가 자동으로 해결되어 라우트 핸들러에 주입됩니다. 이것은 획기적인 변화입니다. 복잡한 설정 파일에 대해 걱정하지 않고 의존성 주입을 활용하여 애플리케이션을 개발할 수 있다는 것을 의미합니다.

다행히도, Laravel 애플리케이션을 구축할 때 작성하는 많은 클래스들은 [컨트롤러](/docs/{{version}}/controllers), [이벤트 리스너](/docs/{{version}}/events), [미들웨어](/docs/{{version}}/middleware) 등을 포함하여 컨테이너를 통해 의존성을 자동으로 받습니다. 또한 [큐 작업](/docs/{{version}}/queues)의 `handle` 메소드에서 의존성을 타입 힌트로 지정할 수 있습니다. 자동화된 설정 없는 의존성 주입의 힘을 한번 경험하면 그것 없이 개발하는 것이 불가능하게 느껴질 것입니다.

<a name="when-to-use-the-container"></a>
### 컨테이너를 사용해야 하는 경우

설정 없는 의존성 해결 덕분에, 컨테이너와 수동으로 상호작용하지 않고도 라우트, 컨트롤러, 이벤트 리스너 등에서 의존성을 타입 힌트로 지정하는 경우가 많습니다. 예를 들어, 현재 요청에 쉽게 접근할 수 있도록 라우트 정의에서 `Illuminate\Http\Request` 객체를 타입 힌트로 지정할 수 있습니다. 이 코드를 작성하기 위해 컨테이너와 상호작용할 필요가 없지만, 컨테이너는 뒤에서 이러한 의존성의 주입을 관리하고 있습니다:

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

많은 경우, 자동 의존성 주입과 [파사드](/docs/{{version}}/facades) 덕분에 컨테이너에서 수동으로 바인딩하거나 해결하지 않고도 Laravel 애플리케이션을 구축할 수 있습니다. **그렇다면 언제 컨테이너와 수동으로 상호작용해야 할까요?** 두 가지 상황을 살펴보겠습니다.

첫째, 인터페이스를 구현하는 클래스를 작성하고 라우트나 클래스 생성자에서 해당 인터페이스를 타입 힌트로 지정하려면 [컨테이너에 해당 인터페이스를 어떻게 해결해야 하는지 알려주어야 합니다](#binding-interfaces-to-implementations). 둘째, 다른 Laravel 개발자들과 공유할 [Laravel 패키지를 작성](/docs/{{version}}/packages)하는 경우 패키지의 서비스를 컨테이너에 바인딩해야 할 수 있습니다.

<a name="binding"></a>
## 바인딩(Binding)

<a name="binding-basics"></a>
### 바인딩 기초

<a name="simple-bindings"></a>
#### 단순 바인딩

거의 모든 서비스 컨테이너 바인딩은 [서비스 프로바이더](/docs/{{version}}/providers) 내에서 등록되므로, 대부분의 예제는 해당 컨텍스트에서 컨테이너를 사용하는 방법을 보여줍니다.

서비스 프로바이더 내에서는 항상 `$this->app` 속성을 통해 컨테이너에 접근할 수 있습니다. 등록하려는 클래스 또는 인터페이스 이름과 클래스의 인스턴스를 반환하는 클로저를 전달하여 `bind` 메소드를 사용하여 바인딩을 등록할 수 있습니다:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

리졸버(resolver)의 인자로 컨테이너 자체를 받는다는 점에 유의하세요. 그런 다음 컨테이너를 사용하여 구축 중인 객체의 하위 의존성을 해결할 수 있습니다.

언급한 것처럼, 일반적으로 서비스 프로바이더 내에서 컨테이너와 상호작용하지만, 서비스 프로바이더 외부에서 컨테이너와 상호작용하려면 `App` [파사드](/docs/{{version}}/facades)를 통해 할 수 있습니다:

```php
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\App;

App::bind(Transistor::class, function (Application $app) {
    // ...
});
```

주어진 타입에 대해 바인딩이 아직 등록되지 않은 경우에만 컨테이너 바인딩을 등록하려면 `bindIf` 메소드를 사용할 수 있습니다:

```php
$this->app->bindIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

> [!NOTE]  
> 클래스가 어떤 인터페이스에도 의존하지 않는다면 컨테이너에 클래스를 바인딩할 필요가 없습니다. 컨테이너는 리플렉션(reflection)을 사용하여 이러한 객체를 자동으로 해결할 수 있으므로, 이러한 객체를 어떻게 구축해야 하는지 알려줄 필요가 없습니다.

<a name="binding-a-singleton"></a>
#### 싱글톤 바인딩

`singleton` 메소드는 한 번만 해결되어야 하는 클래스나 인터페이스를 컨테이너에 바인딩합니다. 싱글톤 바인딩이 한번 해결되면, 컨테이너에 대한 후속 호출에서 동일한 객체 인스턴스가 반환됩니다:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->singleton(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

주어진 타입에 대해 바인딩이 아직 등록되지 않은 경우에만 싱글톤 컨테이너 바인딩을 등록하려면 `singletonIf` 메소드를 사용할 수 있습니다:

```php
$this->app->singletonIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-scoped"></a>
#### 스코프드 싱글톤 바인딩

`scoped` 메소드는 주어진 Laravel 요청/작업 수명 주기 내에서 한 번만 해결되어야 하는 클래스나 인터페이스를 컨테이너에 바인딩합니다. 이 메소드는 `singleton` 메소드와 유사하지만, `scoped` 메소드를 사용하여 등록된 인스턴스는 Laravel 애플리케이션이 새로운 "수명 주기"를 시작할 때마다 플러시됩니다. 예를 들어 [Laravel Octane](/docs/{{version}}/octane) 워커가 새 요청을 처리하거나 Laravel [큐 워커](/docs/{{version}}/queues)가 새 작업을 처리할 때가 이에 해당합니다:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->scoped(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="binding-instances"></a>
#### 인스턴스 바인딩

`instance` 메소드를 사용하여 기존 객체 인스턴스를 컨테이너에 바인딩할 수도 있습니다. 주어진 인스턴스는 컨테이너에 대한 후속 호출에서 항상 반환됩니다:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

<a name="binding-interfaces-to-implementations"></a>
### 인터페이스와 구현체 바인딩

서비스 컨테이너의 매우 강력한 기능 중 하나는 인터페이스를 특정 구현체에 바인딩하는 기능입니다. 예를 들어, `EventPusher` 인터페이스와 `RedisEventPusher` 구현체가 있다고 가정해 보겠습니다. 이 인터페이스의 `RedisEventPusher` 구현체를 코딩한 후, 다음과 같이 서비스 컨테이너에 등록할 수 있습니다:

```php
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

이 구문은 컨테이너에게 클래스가 `EventPusher`의 구현체를 필요로 할 때 `RedisEventPusher`를 주입해야 한다고 알려줍니다. 이제 컨테이너에 의해 해결되는 클래스의 생성자에서 `EventPusher` 인터페이스를 타입 힌트로 지정할 수 있습니다. Laravel 애플리케이션 내의 컨트롤러, 이벤트 리스너, 미들웨어 및 기타 다양한 타입의 클래스는 항상 컨테이너를 사용하여 해결된다는 점을 기억하세요:

```php
use App\Contracts\EventPusher;

/**
 * 새로운 클래스 인스턴스를 생성합니다.
 */
public function __construct(
    protected EventPusher $pusher
) {}
```

<a name="contextual-binding"></a>
### 컨텍스트 바인딩(Contextual Binding)

동일한 인터페이스를 사용하는 두 개의 클래스가 있지만 각 클래스에 다른 구현체를 주입하고 싶을 수 있습니다. 예를 들어, 두 컨트롤러가 `Illuminate\Contracts\Filesystem\Filesystem` [컨트랙트](/docs/{{version}}/contracts)의 서로 다른 구현체에 의존할 수 있습니다. Laravel은 이 동작을 정의하기 위한 간단하고 유창한 인터페이스를 제공합니다:

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\VideoController;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

$this->app->when(PhotoController::class)
    ->needs(Filesystem::class)
    ->give(function () {
        return Storage::disk('local');
    });

$this->app->when([VideoController::class, UploadController::class])
    ->needs(Filesystem::class)
    ->give(function () {
        return Storage::disk('s3');
    });
```

<a name="binding-primitives"></a>
### 프리미티브 바인딩(Binding Primitives)

때때로 주입된 클래스를 받는 클래스가 있지만, 정수와 같은 프리미티브 값도 주입받아야 할 수 있습니다. 컨텍스트 바인딩을 사용하여 클래스가 필요로 하는 모든 값을 쉽게 주입할 수 있습니다:

```php
use App\Http\Controllers\UserController;

$this->app->when(UserController::class)
    ->needs('$variableName')
    ->give($value);
```

때때로 클래스가 [태그된](#tagging) 인스턴스의 배열에 의존할 수 있습니다. `giveTagged` 메소드를 사용하여 해당 태그가 있는 모든 컨테이너 바인딩을 쉽게 주입할 수 있습니다:

```php
$this->app->when(ReportAggregator::class)
    ->needs('$reports')
    ->giveTagged('reports');
```

애플리케이션의 설정 파일에서 값을 주입해야 하는 경우 `giveConfig` 메소드를 사용할 수 있습니다:

```php
$this->app->when(ReportAggregator::class)
    ->needs('$timezone')
    ->giveConfig('app.timezone');
```

<a name="binding-typed-variadics"></a>
### 타입이 지정된 가변 인자 바인딩(Binding Typed Variadics)

경우에 따라 가변 생성자 인자를 사용하여 타입이 지정된 객체의 배열을 받는 클래스가 있을 수 있습니다:

```php
<?php

use App\Models\Filter;
use App\Services\Logger;

class Firewall
{
    /**
     * 필터 인스턴스들.
     *
     * @var array
     */
    protected $filters;

    /**
     * 새로운 클래스 인스턴스를 생성합니다.
     */
    public function __construct(
        protected Logger $logger,
        Filter ...$filters,
    ) {
        $this->filters = $filters;
    }
}
```

컨텍스트 바인딩을 사용하여 `give` 메소드에 해결된 `Filter` 인스턴스의 배열을 반환하는 클로저를 제공하여 이 의존성을 해결할 수 있습니다:

```php
$this->app->when(Firewall::class)
    ->needs(Filter::class)
    ->give(function (Application $app) {
          return [
              $app->make(NullFilter::class),
              $app->make(ProfanityFilter::class),
              $app->make(TooLongFilter::class),
          ];
    });
```

편의를 위해, `Firewall`이 `Filter` 인스턴스를 필요로 할 때마다 컨테이너에 의해 해결될 클래스 이름의 배열을 제공할 수도 있습니다:

```php
$this->app->when(Firewall::class)
    ->needs(Filter::class)
    ->give([
        NullFilter::class,
        ProfanityFilter::class,
        TooLongFilter::class,
    ]);
```

<a name="variadic-tag-dependencies"></a>
#### 가변 인자 태그 의존성

때때로 클래스가 특정 클래스로 타입 힌트된 가변 의존성을 가질 수 있습니다(`Report ...$reports`). `needs`와 `giveTagged` 메소드를 사용하여 주어진 의존성에 대해 해당 [태그](#tagging)가 있는 모든 컨테이너 바인딩을 쉽게 주입할 수 있습니다:

```php
$this->app->when(ReportAggregator::class)
    ->needs(Report::class)
    ->giveTagged('reports');
```

<a name="tagging"></a>
### 태깅(Tagging)

경우에 따라 특정 "카테고리"의 모든 바인딩을 해결해야 할 수 있습니다. 예를 들어, 여러 다른 `Report` 인터페이스 구현체의 배열을 받는 리포트 분석기를 구축한다고 가정해 보겠습니다. `Report` 구현체를 등록한 후 `tag` 메소드를 사용하여 태그를 할당할 수 있습니다:

```php
$this->app->bind(CpuReport::class, function () {
    // ...
});

$this->app->bind(MemoryReport::class, function () {
    // ...
});

$this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

서비스에 태그가 지정되면 컨테이너의 `tagged` 메소드를 통해 쉽게 모두 해결할 수 있습니다:

```php
$this->app->bind(ReportAnalyzer::class, function (Application $app) {
    return new ReportAnalyzer($app->tagged('reports'));
});
```

<a name="extending-bindings"></a>
### 바인딩 확장(Extending Bindings)

`extend` 메소드를 사용하면 해결된 서비스를 수정할 수 있습니다. 예를 들어, 서비스가 해결될 때 서비스를 데코레이트하거나 구성하는 추가 코드를 실행할 수 있습니다. `extend` 메소드는 확장하는 서비스 클래스와 수정된 서비스를 반환해야 하는 클로저라는 두 개의 인자를 받습니다. 클로저는 해결 중인 서비스와 컨테이너 인스턴스를 받습니다:

```php
$this->app->extend(Service::class, function (Service $service, Application $app) {
    return new DecoratedService($service);
});
```

<a name="resolving"></a>
## 의존성 해결(Resolving)

<a name="the-make-method"></a>
### `make` 메소드

`make` 메소드를 사용하여 컨테이너에서 클래스 인스턴스를 해결할 수 있습니다. `make` 메소드는 해결하려는 클래스 또는 인터페이스의 이름을 받습니다:

```php
use App\Services\Transistor;

$transistor = $this->app->make(Transistor::class);
```

클래스의 일부 의존성이 컨테이너를 통해 해결될 수 없는 경우, `makeWith` 메소드에 연관 배열로 전달하여 주입할 수 있습니다. 예를 들어, `Transistor` 서비스에 필요한 `$id` 생성자 인자를 수동으로 전달할 수 있습니다:

```php
use App\Services\Transistor;

$transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

`bound` 메소드를 사용하여 클래스나 인터페이스가 컨테이너에 명시적으로 바인딩되었는지 확인할 수 있습니다:

```php
if ($this->app->bound(Transistor::class)) {
    // ...
}
```

서비스 프로바이더 외부에서 `$app` 변수에 접근할 수 없는 코드 위치에 있는 경우, `App` [파사드](/docs/{{version}}/facades) 또는 `app` [헬퍼](/docs/{{version}}/helpers#method-app)를 사용하여 컨테이너에서 클래스 인스턴스를 해결할 수 있습니다:

```php
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

$transistor = App::make(Transistor::class);

$transistor = app(Transistor::class);
```

Laravel 컨테이너 인스턴스 자체를 컨테이너에 의해 해결되는 클래스에 주입하려면 클래스의 생성자에서 `Illuminate\Container\Container` 클래스를 타입 힌트로 지정할 수 있습니다:

```php
use Illuminate\Container\Container;

/**
 * 새로운 클래스 인스턴스를 생성합니다.
 */
public function __construct(
    protected Container $container
) {}
```

<a name="automatic-injection"></a>
### 자동 주입(Automatic Injection)

또한 중요한 것은 [컨트롤러](/docs/{{version}}/controllers), [이벤트 리스너](/docs/{{version}}/events), [미들웨어](/docs/{{version}}/middleware) 등을 포함하여 컨테이너에 의해 해결되는 클래스의 생성자에서 의존성을 타입 힌트로 지정할 수 있다는 것입니다. 또한 [큐 작업](/docs/{{version}}/queues)의 `handle` 메소드에서 의존성을 타입 힌트로 지정할 수 있습니다. 실제로 대부분의 객체는 이 방법으로 컨테이너에 의해 해결되어야 합니다.

예를 들어, 컨트롤러의 생성자에서 애플리케이션에 정의된 리포지토리를 타입 힌트로 지정할 수 있습니다. 리포지토리는 자동으로 해결되어 클래스에 주입됩니다:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;
use App\Models\User;

class UserController extends Controller
{
    /**
     * 새로운 컨트롤러 인스턴스를 생성합니다.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}

    /**
     * 주어진 ID의 사용자를 표시합니다.
     */
    public function show(string $id): User
    {
        $user = $this->users->findOrFail($id);

        return $user;
    }
}
```

<a name="method-invocation-and-injection"></a>
## 메소드 호출과 주입(Method Invocation and Injection)

때때로 컨테이너가 해당 메소드의 의존성을 자동으로 주입하면서 객체 인스턴스의 메소드를 호출하고 싶을 수 있습니다. 예를 들어, 다음 클래스가 있다고 가정합니다:

```php
<?php

namespace App;

use App\Repositories\UserRepository;

class UserReport
{
    /**
     * 새로운 사용자 리포트를 생성합니다.
     */
    public function generate(UserRepository $repository): array
    {
        return [
            // ...
        ];
    }
}
```

다음과 같이 컨테이너를 통해 `generate` 메소드를 호출할 수 있습니다:

```php
use App\UserReport;
use Illuminate\Support\Facades\App;

$report = App::call([new UserReport, 'generate']);
```

`call` 메소드는 모든 PHP 콜러블을 허용합니다. 컨테이너의 `call` 메소드는 의존성을 자동으로 주입하면서 클로저를 호출하는 데에도 사용할 수 있습니다:

```php
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\App;

$result = App::call(function (UserRepository $repository) {
    // ...
});
```

<a name="container-events"></a>
## 컨테이너 이벤트(Container Events)

서비스 컨테이너는 객체를 해결할 때마다 이벤트를 발생시킵니다. `resolving` 메소드를 사용하여 이 이벤트를 수신할 수 있습니다:

```php
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;

$this->app->resolving(Transistor::class, function (Transistor $transistor, Application $app) {
    // 컨테이너가 "Transistor" 타입의 객체를 해결할 때 호출됩니다...
});

$this->app->resolving(function (mixed $object, Application $app) {
    // 컨테이너가 모든 타입의 객체를 해결할 때 호출됩니다...
});
```

보시다시피, 해결 중인 객체가 콜백에 전달되어 객체가 소비자에게 전달되기 전에 객체에 추가 속성을 설정할 수 있습니다.

<a name="psr-11"></a>
## PSR-11

Laravel의 서비스 컨테이너는 [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md) 인터페이스를 구현합니다. 따라서 PSR-11 컨테이너 인터페이스를 타입 힌트로 지정하여 Laravel 컨테이너의 인스턴스를 얻을 수 있습니다:

```php
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    // ...
});
```

주어진 식별자를 해결할 수 없는 경우 예외가 발생합니다. 식별자가 바인딩된 적이 없는 경우 예외는 `Psr\Container\NotFoundExceptionInterface`의 인스턴스가 됩니다. 식별자가 바인딩되었지만 해결할 수 없는 경우 `Psr\Container\ContainerExceptionInterface`의 인스턴스가 발생합니다.

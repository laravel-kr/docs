# 서비스 프로바이더(Service Providers)

- [소개](#introduction)
- [서비스 프로바이더 작성하기](#writing-service-providers)
    - [Register 메서드](#the-register-method)
    - [Boot 메서드](#the-boot-method)
- [프로바이더 등록하기](#registering-providers)
- [지연 프로바이더](#deferred-providers)

<a name="introduction"></a>
## 소개

서비스 프로바이더(Service Providers)는 모든 Laravel 애플리케이션 부트스트래핑의 중심입니다. 여러분의 애플리케이션뿐만 아니라 Laravel의 모든 핵심 서비스들도 서비스 프로바이더를 통해 부트스트랩됩니다.

그런데 "부트스트랩"이란 무엇을 의미할까요? 일반적으로 서비스 컨테이너 바인딩, 이벤트 리스너, 미들웨어, 심지어 라우트까지 **등록**하는 것을 의미합니다. 서비스 프로바이더는 애플리케이션을 설정하는 중심 장소입니다.

Laravel은 메일러, 큐, 캐시 등 핵심 서비스를 부트스트랩하기 위해 내부적으로 수십 개의 서비스 프로바이더를 사용합니다. 이러한 프로바이더 중 상당수는 "지연(deferred)" 프로바이더입니다. 즉, 모든 요청에서 로드되지 않고 실제로 해당 서비스가 필요할 때만 로드됩니다.

모든 사용자 정의 서비스 프로바이더는 `bootstrap/providers.php` 파일에 등록됩니다. 다음 문서에서 자신만의 서비스 프로바이더를 작성하고 Laravel 애플리케이션에 등록하는 방법을 배우게 됩니다.

> [!NOTE]
> Laravel이 요청을 처리하고 내부적으로 어떻게 작동하는지 더 알고 싶다면, Laravel [요청 라이프사이클](/docs/{{version}}/lifecycle) 문서를 확인하세요.

<a name="writing-service-providers"></a>
## 서비스 프로바이더 작성하기

모든 서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 확장합니다. 대부분의 서비스 프로바이더에는 `register`와 `boot` 메서드가 포함되어 있습니다. `register` 메서드 내에서는 **[서비스 컨테이너](/docs/{{version}}/container)에 바인딩하는 작업만** 해야 합니다. `register` 메서드 내에서 이벤트 리스너, 라우트 또는 기타 기능을 등록하려고 시도해서는 안 됩니다.

Artisan CLI를 사용하여 `make:provider` 명령으로 새 프로바이더를 생성할 수 있습니다. Laravel은 자동으로 새 프로바이더를 애플리케이션의 `bootstrap/providers.php` 파일에 등록합니다.

```shell
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### Register 메서드

앞서 언급했듯이, `register` 메서드 내에서는 [서비스 컨테이너](/docs/{{version}}/container)에 바인딩하는 작업만 해야 합니다. `register` 메서드 내에서 이벤트 리스너, 라우트 또는 기타 기능을 등록하려고 시도해서는 안 됩니다. 그렇지 않으면 아직 로드되지 않은 서비스 프로바이더가 제공하는 서비스를 실수로 사용하게 될 수 있습니다.

기본적인 서비스 프로바이더를 살펴보겠습니다. 서비스 프로바이더의 모든 메서드 내에서 항상 서비스 컨테이너에 접근할 수 있는 `$app` 속성을 사용할 수 있습니다.

```php
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 등록합니다.
     */
    public function register(): void
    {
        $this->app->singleton(Connection::class, function (Application $app) {
            return new Connection(config('riak'));
        });
    }
}
```

이 서비스 프로바이더는 `register` 메서드만 정의하고, 이 메서드를 사용하여 서비스 컨테이너에 `App\Services\Riak\Connection`의 구현을 정의합니다. Laravel의 서비스 컨테이너에 익숙하지 않다면, [해당 문서](/docs/{{version}}/container)를 확인하세요.

<a name="the-bindings-and-singletons-properties"></a>
#### `bindings`와 `singletons` 속성

서비스 프로바이더가 많은 간단한 바인딩을 등록하는 경우, 각 컨테이너 바인딩을 수동으로 등록하는 대신 `bindings`와 `singletons` 속성을 사용할 수 있습니다. 프레임워크가 서비스 프로바이더를 로드할 때 자동으로 이러한 속성을 확인하고 바인딩을 등록합니다.

```php
<?php

namespace App\Providers;

use App\Contracts\DowntimeNotifier;
use App\Contracts\ServerProvider;
use App\Services\DigitalOceanServerProvider;
use App\Services\PingdomDowntimeNotifier;
use App\Services\ServerToolsProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 등록해야 할 모든 컨테이너 바인딩입니다.
     *
     * @var array
     */
    public $bindings = [
        ServerProvider::class => DigitalOceanServerProvider::class,
    ];

    /**
     * 등록해야 할 모든 컨테이너 싱글톤입니다.
     *
     * @var array
     */
    public $singletons = [
        DowntimeNotifier::class => PingdomDowntimeNotifier::class,
        ServerProvider::class => ServerToolsProvider::class,
    ];
}
```

<a name="the-boot-method"></a>
### Boot 메서드

그렇다면 서비스 프로바이더 내에서 [뷰 컴포저](/docs/{{version}}/views#view-composers)를 등록해야 한다면 어떻게 해야 할까요? 이것은 `boot` 메서드 내에서 수행해야 합니다. **이 메서드는 다른 모든 서비스 프로바이더가 등록된 후에 호출됩니다**. 즉, 프레임워크에 의해 등록된 다른 모든 서비스에 접근할 수 있습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        View::composer('view', function () {
            // ...
        });
    }
}
```

<a name="boot-method-dependency-injection"></a>
#### Boot 메서드 의존성 주입

서비스 프로바이더의 `boot` 메서드에 의존성을 타입힌트할 수 있습니다. [서비스 컨테이너](/docs/{{version}}/container)가 필요한 의존성을 자동으로 주입합니다.

```php
use Illuminate\Contracts\Routing\ResponseFactory;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(ResponseFactory $response): void
{
    $response->macro('serialized', function (mixed $value) {
        // ...
    });
}
```

<a name="registering-providers"></a>
## 프로바이더 등록하기

모든 서비스 프로바이더는 `bootstrap/providers.php` 설정 파일에 등록됩니다. 이 파일은 애플리케이션의 서비스 프로바이더 클래스 이름을 포함하는 배열을 반환합니다.

```php
<?php

return [
    App\Providers\AppServiceProvider::class,
];
```

`make:provider` Artisan 명령을 실행하면, Laravel이 생성된 프로바이더를 `bootstrap/providers.php` 파일에 자동으로 추가합니다. 그러나 프로바이더 클래스를 수동으로 생성한 경우, 배열에 프로바이더 클래스를 수동으로 추가해야 합니다.

```php
<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\ComposerServiceProvider::class, // [tl! add]
];
```

<a name="deferred-providers"></a>
## 지연 프로바이더(Deferred Providers)

프로바이더가 [서비스 컨테이너](/docs/{{version}}/container)에 바인딩만 등록하는 경우, 등록된 바인딩 중 하나가 실제로 필요할 때까지 등록을 지연하도록 선택할 수 있습니다. 이러한 프로바이더의 로딩을 지연하면 매 요청마다 파일 시스템에서 로드되지 않으므로 애플리케이션의 성능이 향상됩니다.

Laravel은 지연된 서비스 프로바이더가 제공하는 모든 서비스 목록과 해당 서비스 프로바이더 클래스 이름을 컴파일하고 저장합니다. 그런 다음, 이러한 서비스 중 하나를 해결하려고 할 때만 Laravel이 서비스 프로바이더를 로드합니다.

프로바이더의 로딩을 지연하려면, `\Illuminate\Contracts\Support\DeferrableProvider` 인터페이스를 구현하고 `provides` 메서드를 정의하세요. `provides` 메서드는 프로바이더가 등록하는 서비스 컨테이너 바인딩을 반환해야 합니다.

```php
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Support\DeferrableProvider;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider implements DeferrableProvider
{
    /**
     * 애플리케이션 서비스를 등록합니다.
     */
    public function register(): void
    {
        $this->app->singleton(Connection::class, function (Application $app) {
            return new Connection($app['config']['riak']);
        });
    }

    /**
     * 프로바이더가 제공하는 서비스를 가져옵니다.
     *
     * @return array<int, string>
     */
    public function provides(): array
    {
        return [Connection::class];
    }
}
```

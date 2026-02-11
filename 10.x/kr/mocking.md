# 모킹(Mocking)

- [소개](#introduction)
- [객체 모킹](#mocking-objects)
- [파사드 모킹](#mocking-facades)
    - [파사드 스파이](#facade-spies)
- [시간과 상호작용하기](#interacting-with-time)

<a name="introduction"></a>
## 소개

Laravel 애플리케이션을 테스트할 때, 특정 테스트 중에 애플리케이션의 일부 기능이 실제로 실행되지 않도록 "모킹"하고 싶을 수 있습니다. 예를 들어, 이벤트를 발생시키는 컨트롤러를 테스트할 때, 테스트 중에 이벤트 리스너가 실제로 실행되지 않도록 모킹할 수 있습니다. 이를 통해 이벤트 리스너의 실행을 걱정하지 않고 컨트롤러의 HTTP 응답만 테스트할 수 있으며, 이벤트 리스너는 별도의 테스트 케이스에서 테스트할 수 있습니다.

Laravel은 이벤트, 작업(Job) 및 기타 파사드를 모킹하기 위한 유용한 메서드를 기본으로 제공합니다. 이러한 헬퍼는 주로 Mockery 위에 편의 레이어를 제공하므로 복잡한 Mockery 메서드 호출을 수동으로 만들 필요가 없습니다.

<a name="mocking-objects"></a>
## 객체 모킹

Laravel의 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)를 통해 애플리케이션에 주입될 객체를 모킹할 때, 모킹된 인스턴스를 `instance` 바인딩으로 컨테이너에 바인딩해야 합니다. 이렇게 하면 컨테이너가 객체를 직접 생성하는 대신 모킹된 인스턴스를 사용하도록 지시합니다.

```php
use App\Service;
use Mockery;
use Mockery\MockInterface;

public function test_something_can_be_mocked(): void
{
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->shouldReceive('process')->once();
        })
    );
}
```

이를 더 편리하게 하기 위해, Laravel의 기본 테스트 케이스 클래스에서 제공하는 `mock` 메서드를 사용할 수 있습니다. 예를 들어, 다음 예제는 위의 예제와 동일합니다.

```php
use App\Service;
use Mockery\MockInterface;

$mock = $this->mock(Service::class, function (MockInterface $mock) {
    $mock->shouldReceive('process')->once();
});
```

객체의 일부 메서드만 모킹해야 할 때는 `partialMock` 메서드를 사용할 수 있습니다. 모킹되지 않은 메서드는 호출될 때 정상적으로 실행됩니다.

```php
use App\Service;
use Mockery\MockInterface;

$mock = $this->partialMock(Service::class, function (MockInterface $mock) {
    $mock->shouldReceive('process')->once();
});
```

마찬가지로, 객체를 [스파이(spy)](http://docs.mockery.io/en/latest/reference/spies.html)하고 싶다면, Laravel의 기본 테스트 케이스 클래스는 `Mockery::spy` 메서드에 대한 편리한 래퍼로 `spy` 메서드를 제공합니다. 스파이는 모킹과 유사하지만, 스파이와 테스트 중인 코드 간의 모든 상호작용을 기록하여 코드 실행 후 어서션(assertion)을 수행할 수 있습니다.

```php
use App\Service;

$spy = $this->spy(Service::class);

// ...

$spy->shouldHaveReceived('process');
```

<a name="mocking-facades"></a>
## 파사드 모킹

전통적인 정적 메서드 호출과 달리, [파사드(Facade)](/docs/{{version}}/facades)([실시간 파사드(Real-Time Facades)](/docs/{{version}}/facades#real-time-facades) 포함)는 모킹할 수 있습니다. 이는 전통적인 정적 메서드보다 큰 장점을 제공하며, 전통적인 의존성 주입을 사용했을 때와 동일한 테스트 가능성을 제공합니다. 테스트할 때, 컨트롤러 중 하나에서 발생하는 Laravel 파사드 호출을 모킹하고 싶을 때가 많습니다. 예를 들어, 다음 컨트롤러 액션을 고려해 보세요.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * Retrieve a list of all users of the application.
     */
    public function index(): array
    {
        $value = Cache::get('key');

        return [
            // ...
        ];
    }
}
```

[Mockery](https://github.com/padraic/mockery) 모킹 인스턴스를 반환하는 `shouldReceive` 메서드를 사용하여 `Cache` 파사드 호출을 모킹할 수 있습니다. 파사드는 실제로 Laravel [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에 의해 리졸브되고 관리되기 때문에, 일반적인 정적 클래스보다 훨씬 더 높은 테스트 가능성을 가집니다. 예를 들어, `Cache` 파사드의 `get` 메서드 호출을 모킹해 보겠습니다.

```php
<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    public function test_get_index(): void
    {
        Cache::shouldReceive('get')
                    ->once()
                    ->with('key')
                    ->andReturn('value');

        $response = $this->get('/users');

        // ...
    }
}
```

> [!WARNING]
> `Request` 파사드를 모킹해서는 안 됩니다. 대신, 테스트를 실행할 때 `get` 및 `post`와 같은 [HTTP 테스트 메서드](/docs/{{version}}/http-tests)에 원하는 입력을 전달하세요. 마찬가지로, `Config` 파사드를 모킹하는 대신, 테스트에서 `Config::set` 메서드를 호출하세요.

<a name="facade-spies"></a>
### 파사드 스파이

파사드를 [스파이(spy)](http://docs.mockery.io/en/latest/reference/spies.html)하고 싶다면, 해당 파사드에서 `spy` 메서드를 호출할 수 있습니다. 스파이는 모킹과 유사하지만, 스파이와 테스트 중인 코드 간의 모든 상호작용을 기록하여 코드 실행 후 어서션을 수행할 수 있습니다.

```php
use Illuminate\Support\Facades\Cache;

public function test_values_are_be_stored_in_cache(): void
{
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->once()->with('name', 'Taylor', 10);
}
```

<a name="interacting-with-time"></a>
## 시간과 상호작용하기

테스트할 때, `now` 또는 `Illuminate\Support\Carbon::now()`와 같은 헬퍼가 반환하는 시간을 수정해야 할 때가 있습니다. 다행히도, Laravel의 기본 기능 테스트 클래스는 현재 시간을 조작할 수 있는 헬퍼를 포함하고 있습니다.

```php
use Illuminate\Support\Carbon;

public function test_time_can_be_manipulated(): void
{
    // 미래로 이동...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // 과거로 이동...
    $this->travel(-5)->hours();

    // 특정 시간으로 이동...
    $this->travelTo(now()->subHours(6));

    // 현재 시간으로 돌아오기...
    $this->travelBack();
}
```

다양한 시간 여행 메서드에 클로저를 제공할 수도 있습니다. 클로저는 지정된 시간에 시간이 고정된 상태로 호출됩니다. 클로저가 실행된 후, 시간은 정상적으로 다시 진행됩니다.

```php
$this->travel(5)->days(function () {
    // 5일 후 미래에서 무언가를 테스트...
});

$this->travelTo(now()->subDays(10), function () {
    // 특정 시점에서 무언가를 테스트...
});
```

`freezeTime` 메서드는 현재 시간을 고정하는 데 사용할 수 있습니다. 마찬가지로, `freezeSecond` 메서드는 현재 시간을 고정하지만 현재 초의 시작 부분에서 고정합니다.

```php
use Illuminate\Support\Carbon;

// 시간을 고정하고 클로저 실행 후 정상 시간으로 복귀...
$this->freezeTime(function (Carbon $time) {
    // ...
});

// 현재 초에서 시간을 고정하고 클로저 실행 후 정상 시간으로 복귀...
$this->freezeSecond(function (Carbon $time) {
    // ...
})
```

예상하듯이, 위에서 논의한 모든 메서드는 주로 토론 포럼에서 비활성 게시물을 잠그는 것과 같은 시간에 민감한 애플리케이션 동작을 테스트하는 데 유용합니다.

```php
use App\Models\Thread;

public function test_forum_threads_lock_after_one_week_of_inactivity()
{
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    $this->assertTrue($thread->isLockedByInactivity());
}
```

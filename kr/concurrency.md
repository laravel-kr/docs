# 동시성(Concurrency)

- [소개](#introduction)
- [동시에 작업 실행하기](#running-concurrent-tasks)
- [동시 작업 지연 실행하기](#deferring-concurrent-tasks)

<a name="introduction"></a>
## 소개

때때로 서로 의존하지 않는 여러 개의 느린 작업을 실행해야 할 수 있습니다. 많은 경우 작업을 동시에 실행함으로써 상당한 성능 향상을 실현할 수 있습니다. Laravel의 `Concurrency` 파사드(Facade)는 클로저(Closure)를 동시에 실행하기 위한 간단하고 편리한 API를 제공합니다.

<a name="how-it-works"></a>
#### 동작 원리

Laravel은 주어진 클로저를 직렬화하고 숨겨진 Artisan CLI 명령으로 전달하여 동시성을 구현합니다. 이 명령은 클로저를 역직렬화하고 자체 PHP 프로세스 내에서 호출합니다. 클로저가 호출된 후, 결과 값은 부모 프로세스로 다시 직렬화되어 전달됩니다.

`Concurrency` 파사드는 세 가지 드라이버를 지원합니다: `process`(기본값), `fork`, 그리고 `sync`.

`fork` 드라이버는 기본 `process` 드라이버에 비해 향상된 성능을 제공하지만, PHP는 웹 요청 중 포킹(forking)을 지원하지 않기 때문에 PHP의 CLI 컨텍스트 내에서만 사용할 수 있습니다. `fork` 드라이버를 사용하기 전에 `spatie/fork` 패키지를 설치해야 합니다:

```shell
composer require spatie/fork
```

`sync` 드라이버는 모든 동시성을 비활성화하고 부모 프로세스 내에서 주어진 클로저를 순차적으로 실행하고 싶을 때 주로 테스트 중에 유용합니다.

<a name="running-concurrent-tasks"></a>
## 동시에 작업 실행하기

동시 작업을 실행하려면 `Concurrency` 파사드의 `run` 메서드를 호출할 수 있습니다. `run` 메서드는 자식 PHP 프로세스에서 동시에 실행되어야 하는 클로저 배열을 받습니다:

```php
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;

[$userCount, $orderCount] = Concurrency::run([
    fn () => DB::table('users')->count(),
    fn () => DB::table('orders')->count(),
]);
```

특정 드라이버를 사용하려면 `driver` 메서드를 사용할 수 있습니다:

```php
$results = Concurrency::driver('fork')->run(...);
```

또는, 기본 동시성 드라이버를 변경하려면 `config:publish` Artisan 명령을 통해 `concurrency` 설정 파일을 퍼블리시하고 파일 내의 `default` 옵션을 업데이트해야 합니다:

```shell
php artisan config:publish concurrency
```

<a name="deferring-concurrent-tasks"></a>
## 동시 작업 지연 실행하기

클로저 배열을 동시에 실행하고 싶지만 해당 클로저가 반환하는 결과에는 관심이 없다면, `defer` 메서드 사용을 고려해야 합니다. `defer` 메서드가 호출되면 주어진 클로저는 즉시 실행되지 않습니다. 대신, Laravel은 HTTP 응답이 사용자에게 전송된 후에 클로저를 동시에 실행합니다:

```php
use App\Services\Metrics;
use Illuminate\Support\Facades\Concurrency;

Concurrency::defer([
    fn () => Metrics::report('users'),
    fn () => Metrics::report('orders'),
]);
```

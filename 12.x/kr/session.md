# HTTP 세션(HTTP Session)

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 사전 요구사항](#driver-prerequisites)
- [세션 다루기](#interacting-with-the-session)
    - [데이터 조회하기](#retrieving-data)
    - [데이터 저장하기](#storing-data)
    - [플래시 데이터](#flash-data)
    - [데이터 삭제하기](#deleting-data)
    - [세션 ID 재생성하기](#regenerating-the-session-id)
- [세션 캐시](#session-cache)
- [세션 블로킹](#session-blocking)
- [커스텀 세션 드라이버 추가하기](#adding-custom-session-drivers)
    - [드라이버 구현하기](#implementing-the-driver)
    - [드라이버 등록하기](#registering-the-driver)

<a name="introduction"></a>
## 소개

HTTP 기반 애플리케이션은 상태를 저장하지 않기 때문에(stateless), 세션은 여러 요청에 걸쳐 사용자에 대한 정보를 저장하는 방법을 제공합니다. 해당 사용자 정보는 일반적으로 이후 요청에서 접근할 수 있는 영구 저장소/백엔드에 저장됩니다.

Laravel은 표현력이 풍부하고 통합된 API를 통해 접근할 수 있는 다양한 세션 백엔드를 제공합니다. [Memcached](https://memcached.org), [Redis](https://redis.io), 데이터베이스와 같은 인기 있는 백엔드에 대한 지원이 포함되어 있습니다.

<a name="configuration"></a>
### 설정

애플리케이션의 세션 설정 파일은 `config/session.php`에 저장되어 있습니다. 이 파일에서 사용 가능한 옵션들을 검토해 보세요. 기본적으로 Laravel은 `database` 세션 드라이버를 사용하도록 설정되어 있습니다.

세션 `driver` 설정 옵션은 각 요청에 대해 세션 데이터가 저장될 위치를 정의합니다. Laravel에는 다양한 드라이버가 포함되어 있습니다.

<div class="content-list" markdown="1">

- `file` - 세션이 `storage/framework/sessions`에 저장됩니다.
- `cookie` - 세션이 안전하고 암호화된 쿠키에 저장됩니다.
- `database` - 세션이 관계형 데이터베이스에 저장됩니다.
- `memcached` / `redis` - 세션이 이러한 빠른 캐시 기반 저장소 중 하나에 저장됩니다.
- `dynamodb` - 세션이 AWS DynamoDB에 저장됩니다.
- `array` - 세션이 PHP 배열에 저장되며 영구적으로 저장되지 않습니다.

</div>

> [!NOTE]
> array 드라이버는 주로 [테스트](/docs/{{version}}/testing) 중에 사용되며 세션에 저장된 데이터가 영구적으로 저장되는 것을 방지합니다.

<a name="driver-prerequisites"></a>
### 드라이버 사전 요구사항

<a name="database"></a>
#### 데이터베이스(Database)

`database` 세션 드라이버를 사용할 때는 세션 데이터를 포함할 데이터베이스 테이블이 있는지 확인해야 합니다. 일반적으로 이것은 Laravel의 기본 `0001_01_01_000000_create_users_table.php` [데이터베이스 마이그레이션](/docs/{{version}}/migrations)에 포함되어 있습니다. 그러나 어떤 이유로든 `sessions` 테이블이 없다면 `make:session-table` Artisan 명령어를 사용하여 이 마이그레이션을 생성할 수 있습니다.

```shell
php artisan make:session-table

php artisan migrate
```

<a name="redis"></a>
#### Redis

Laravel에서 Redis 세션을 사용하기 전에 PECL을 통해 PhpRedis PHP 확장을 설치하거나 Composer를 통해 `predis/predis` 패키지(~1.0)를 설치해야 합니다. Redis 설정에 대한 자세한 내용은 Laravel의 [Redis 문서](/docs/{{version}}/redis#configuration)를 참조하세요.

> [!NOTE]
> `SESSION_CONNECTION` 환경 변수 또는 `session.php` 설정 파일의 `connection` 옵션을 사용하여 세션 저장소에 사용할 Redis 연결을 지정할 수 있습니다.

<a name="interacting-with-the-session"></a>
## 세션 다루기

<a name="retrieving-data"></a>
### 데이터 조회하기

Laravel에서 세션 데이터를 다루는 두 가지 주요 방법이 있습니다: 전역 `session` 헬퍼와 `Request` 인스턴스를 통한 방법입니다. 먼저 라우트 클로저나 컨트롤러 메서드에서 타입 힌트될 수 있는 `Request` 인스턴스를 통해 세션에 접근하는 방법을 살펴보겠습니다. 컨트롤러 메서드 의존성은 Laravel [서비스 컨테이너(Service Container)](/docs/{{version}}/container)를 통해 자동으로 주입된다는 점을 기억하세요.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 주어진 사용자의 프로필을 표시합니다.
     */
    public function show(Request $request, string $id): View
    {
        $value = $request->session()->get('key');

        // ...

        $user = $this->users->find($id);

        return view('user.profile', ['user' => $user]);
    }
}
```

세션에서 항목을 조회할 때 `get` 메서드의 두 번째 인자로 기본값을 전달할 수도 있습니다. 지정된 키가 세션에 존재하지 않으면 이 기본값이 반환됩니다. 클로저를 `get` 메서드의 기본값으로 전달하고 요청된 키가 존재하지 않으면 클로저가 실행되고 그 결과가 반환됩니다.

```php
$value = $request->session()->get('key', 'default');

$value = $request->session()->get('key', function () {
    return 'default';
});
```

<a name="the-global-session-helper"></a>
#### 전역 Session 헬퍼

전역 `session` PHP 함수를 사용하여 세션에 데이터를 조회하고 저장할 수도 있습니다. `session` 헬퍼가 단일 문자열 인자로 호출되면 해당 세션 키의 값을 반환합니다. 헬퍼가 키/값 쌍의 배열로 호출되면 해당 값들이 세션에 저장됩니다.

```php
Route::get('/home', function () {
    // 세션에서 데이터 조회...
    $value = session('key');

    // 기본값 지정...
    $value = session('key', 'default');

    // 세션에 데이터 저장...
    session(['key' => 'value']);
});
```

> [!NOTE]
> HTTP 요청 인스턴스를 통해 세션을 사용하는 것과 전역 `session` 헬퍼를 사용하는 것 사이에는 실질적인 차이가 거의 없습니다. 두 방법 모두 모든 테스트 케이스에서 사용할 수 있는 `assertSessionHas` 메서드를 통해 [테스트](/docs/{{version}}/testing) 가능합니다.

<a name="retrieving-all-session-data"></a>
#### 모든 세션 데이터 조회하기

세션의 모든 데이터를 조회하려면 `all` 메서드를 사용하면 됩니다.

```php
$data = $request->session()->all();
```

<a name="retrieving-a-portion-of-the-session-data"></a>
#### 세션 데이터의 일부 조회하기

`only`와 `except` 메서드를 사용하여 세션 데이터의 일부분을 조회할 수 있습니다.

```php
$data = $request->session()->only(['username', 'email']);

$data = $request->session()->except(['username', 'email']);
```

<a name="determining-if-an-item-exists-in-the-session"></a>
#### 세션에 항목이 존재하는지 확인하기

세션에 항목이 존재하는지 확인하려면 `has` 메서드를 사용할 수 있습니다. `has` 메서드는 항목이 존재하고 `null`이 아니면 `true`를 반환합니다.

```php
if ($request->session()->has('users')) {
    // ...
}
```

값이 `null`이더라도 세션에 항목이 존재하는지 확인하려면 `exists` 메서드를 사용할 수 있습니다.

```php
if ($request->session()->exists('users')) {
    // ...
}
```

세션에 항목이 존재하지 않는지 확인하려면 `missing` 메서드를 사용할 수 있습니다. `missing` 메서드는 항목이 존재하지 않으면 `true`를 반환합니다.

```php
if ($request->session()->missing('users')) {
    // ...
}
```

<a name="storing-data"></a>
### 데이터 저장하기

세션에 데이터를 저장하려면 일반적으로 요청 인스턴스의 `put` 메서드나 전역 `session` 헬퍼를 사용합니다.

```php
// 요청 인스턴스를 통해...
$request->session()->put('key', 'value');

// 전역 "session" 헬퍼를 통해...
session(['key' => 'value']);
```

<a name="pushing-to-array-session-values"></a>
#### 배열 세션 값에 추가하기

`push` 메서드는 배열인 세션 값에 새 값을 추가하는 데 사용할 수 있습니다. 예를 들어, `user.teams` 키에 팀 이름 배열이 포함되어 있다면 다음과 같이 배열에 새 값을 추가할 수 있습니다.

```php
$request->session()->push('user.teams', 'developers');
```

<a name="retrieving-deleting-an-item"></a>
#### 항목 조회 및 삭제하기

`pull` 메서드는 단일 구문에서 세션의 항목을 조회하고 삭제합니다.

```php
$value = $request->session()->pull('key', 'default');
```

<a name="incrementing-and-decrementing-session-values"></a>
#### 세션 값 증가 및 감소시키기

세션 데이터에 증가시키거나 감소시키려는 정수가 포함되어 있다면 `increment`와 `decrement` 메서드를 사용할 수 있습니다.

```php
$request->session()->increment('count');

$request->session()->increment('count', $incrementBy = 2);

$request->session()->decrement('count');

$request->session()->decrement('count', $decrementBy = 2);
```

<a name="flash-data"></a>
### 플래시 데이터(Flash Data)

때때로 다음 요청을 위해 세션에 항목을 저장하고 싶을 수 있습니다. `flash` 메서드를 사용하면 됩니다. 이 메서드를 사용하여 세션에 저장된 데이터는 즉시 사용 가능하며 그 다음 HTTP 요청 중에도 사용할 수 있습니다. 그 다음 HTTP 요청 이후에는 플래시 데이터가 삭제됩니다. 플래시 데이터는 주로 짧은 수명의 상태 메시지에 유용합니다.

```php
$request->session()->flash('status', 'Task was successful!');
```

여러 요청에 걸쳐 플래시 데이터를 유지해야 하는 경우 `reflash` 메서드를 사용할 수 있으며, 이는 모든 플래시 데이터를 추가 요청에 대해 유지합니다. 특정 플래시 데이터만 유지해야 하는 경우 `keep` 메서드를 사용할 수 있습니다.

```php
$request->session()->reflash();

$request->session()->keep(['username', 'email']);
```

현재 요청에 대해서만 플래시 데이터를 유지하려면 `now` 메서드를 사용할 수 있습니다.

```php
$request->session()->now('status', 'Task was successful!');
```

<a name="deleting-data"></a>
### 데이터 삭제하기

`forget` 메서드는 세션에서 데이터 조각을 제거합니다. 세션에서 모든 데이터를 제거하려면 `flush` 메서드를 사용할 수 있습니다.

```php
// 단일 키 삭제...
$request->session()->forget('name');

// 여러 키 삭제...
$request->session()->forget(['name', 'status']);

$request->session()->flush();
```

<a name="regenerating-the-session-id"></a>
### 세션 ID 재생성하기

세션 ID를 재생성하는 것은 악의적인 사용자가 애플리케이션에 대한 [세션 고정(Session Fixation)](https://owasp.org/www-community/attacks/Session_fixation) 공격을 악용하는 것을 방지하기 위해 자주 수행됩니다.

Laravel [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits) 또는 [Laravel Fortify](/docs/{{version}}/fortify)를 사용하는 경우 인증 중에 Laravel이 자동으로 세션 ID를 재생성합니다. 그러나 세션 ID를 수동으로 재생성해야 하는 경우 `regenerate` 메서드를 사용할 수 있습니다.

```php
$request->session()->regenerate();
```

세션 ID를 재생성하고 단일 구문에서 세션의 모든 데이터를 제거해야 하는 경우 `invalidate` 메서드를 사용할 수 있습니다.

```php
$request->session()->invalidate();
```

<a name="session-cache"></a>
## 세션 캐시(Session Cache)

Laravel의 세션 캐시는 개별 사용자 세션에 범위가 지정된 데이터를 캐시하는 편리한 방법을 제공합니다. 전역 애플리케이션 캐시와 달리, 세션 캐시 데이터는 세션별로 자동으로 격리되며 세션이 만료되거나 삭제될 때 정리됩니다. 세션 캐시는 `get`, `put`, `remember`, `forget` 등 익숙한 모든 [Laravel 캐시 메서드](/docs/{{version}}/cache)를 지원하지만, 현재 세션으로 범위가 지정됩니다.

세션 캐시는 동일한 세션 내에서 여러 요청에 걸쳐 유지하고 싶지만 영구적으로 저장할 필요가 없는 임시적인 사용자별 데이터를 저장하는 데 적합합니다. 여기에는 폼 데이터, 임시 계산, API 응답 또는 특정 사용자의 세션에 연결되어야 하는 기타 일시적 데이터가 포함됩니다.

세션의 `cache` 메서드를 통해 세션 캐시에 접근할 수 있습니다.

```php
$discount = $request->session()->cache()->get('discount');

$request->session()->cache()->put(
    'discount', 10, now()->plus(minutes: 5)
);
```

Laravel의 캐시 메서드에 대한 자세한 내용은 [캐시 문서](/docs/{{version}}/cache)를 참조하세요.

<a name="session-blocking"></a>
## 세션 블로킹(Session Blocking)

> [!WARNING]
> 세션 블로킹을 활용하려면 애플리케이션이 [원자적 잠금(Atomic Locks)](/docs/{{version}}/cache#atomic-locks)을 지원하는 캐시 드라이버를 사용해야 합니다. 현재 해당 캐시 드라이버에는 `memcached`, `dynamodb`, `redis`, `mongodb`(공식 `mongodb/laravel-mongodb` 패키지에 포함), `database`, `file`, `array` 드라이버가 포함됩니다. 또한 `cookie` 세션 드라이버는 사용할 수 없습니다.

기본적으로 Laravel은 동일한 세션을 사용하는 요청이 동시에 실행될 수 있도록 허용합니다. 예를 들어, JavaScript HTTP 라이브러리를 사용하여 애플리케이션에 두 개의 HTTP 요청을 보내면 둘 다 동시에 실행됩니다. 많은 애플리케이션에서 이것은 문제가 되지 않습니다. 그러나 세션에 데이터를 쓰는 두 개의 다른 애플리케이션 엔드포인트에 동시 요청을 보내는 소수의 애플리케이션에서는 세션 데이터 손실이 발생할 수 있습니다.

이를 완화하기 위해 Laravel은 주어진 세션에 대한 동시 요청을 제한할 수 있는 기능을 제공합니다. 시작하려면 라우트 정의에 `block` 메서드를 체이닝하면 됩니다. 이 예제에서 `/profile` 엔드포인트로 들어오는 요청은 세션 잠금을 획득합니다. 이 잠금이 유지되는 동안 동일한 세션 ID를 공유하는 `/profile` 또는 `/order` 엔드포인트로 들어오는 모든 요청은 첫 번째 요청이 실행을 마칠 때까지 기다린 후 실행을 계속합니다.

```php
Route::post('/profile', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);

Route::post('/order', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);
```

`block` 메서드는 두 개의 선택적 인자를 받습니다. `block` 메서드가 받는 첫 번째 인자는 세션 잠금이 해제되기 전에 유지되어야 하는 최대 시간(초)입니다. 물론 요청이 이 시간 전에 실행을 마치면 잠금은 더 일찍 해제됩니다.

`block` 메서드가 받는 두 번째 인자는 세션 잠금을 얻으려고 시도하는 동안 요청이 기다려야 하는 시간(초)입니다. 요청이 주어진 시간(초) 내에 세션 잠금을 얻을 수 없으면 `Illuminate\Contracts\Cache\LockTimeoutException`이 발생합니다.

이러한 인자 중 어느 것도 전달되지 않으면 잠금은 최대 10초 동안 획득되고 요청은 잠금을 얻으려고 시도하는 동안 최대 10초 동안 기다립니다.

```php
Route::post('/profile', function () {
    // ...
})->block();
```

<a name="adding-custom-session-drivers"></a>
## 커스텀 세션 드라이버 추가하기

<a name="implementing-the-driver"></a>
### 드라이버 구현하기

기존 세션 드라이버가 애플리케이션의 요구 사항에 맞지 않는 경우 Laravel에서 자체 세션 핸들러를 작성할 수 있습니다. 커스텀 세션 드라이버는 PHP의 내장 `SessionHandlerInterface`를 구현해야 합니다. 이 인터페이스에는 몇 가지 간단한 메서드만 포함되어 있습니다. 스텁된 MongoDB 구현은 다음과 같습니다.

```php
<?php

namespace App\Extensions;

class MongoSessionHandler implements \SessionHandlerInterface
{
    public function open($savePath, $sessionName) {}
    public function close() {}
    public function read($sessionId) {}
    public function write($sessionId, $data) {}
    public function destroy($sessionId) {}
    public function gc($lifetime) {}
}
```

Laravel에는 확장을 보관할 기본 디렉토리가 포함되어 있지 않으므로 원하는 곳에 배치할 수 있습니다. 이 예제에서는 `MongoSessionHandler`를 보관할 `Extensions` 디렉토리를 만들었습니다.

이러한 메서드의 목적은 쉽게 이해할 수 없으므로 각 메서드의 목적에 대한 개요는 다음과 같습니다.

<div class="content-list" markdown="1">

- `open` 메서드는 일반적으로 파일 기반 세션 저장소 시스템에서 사용됩니다. Laravel에는 `file` 세션 드라이버가 포함되어 있으므로 이 메서드에 아무것도 넣을 필요가 거의 없습니다. 이 메서드를 비워 둘 수 있습니다.
- `close` 메서드는 `open` 메서드와 마찬가지로 일반적으로 무시할 수 있습니다. 대부분의 드라이버에서는 필요하지 않습니다.
- `read` 메서드는 주어진 `$sessionId`와 연결된 세션 데이터의 문자열 버전을 반환해야 합니다. Laravel이 직렬화를 수행하므로 드라이버에서 세션 데이터를 검색하거나 저장할 때 직렬화나 다른 인코딩을 수행할 필요가 없습니다.
- `write` 메서드는 `$sessionId`와 연결된 주어진 `$data` 문자열을 MongoDB나 선택한 다른 저장 시스템과 같은 영구 저장 시스템에 작성해야 합니다. 다시 말하지만, 직렬화를 수행해서는 안 됩니다 - Laravel이 이미 처리했습니다.
- `destroy` 메서드는 영구 저장소에서 `$sessionId`와 연결된 데이터를 제거해야 합니다.
- `gc` 메서드는 UNIX 타임스탬프인 주어진 `$lifetime`보다 오래된 모든 세션 데이터를 삭제해야 합니다. Memcached 및 Redis와 같은 자체 만료 시스템의 경우 이 메서드를 비워 둘 수 있습니다.

</div>

<a name="registering-the-driver"></a>
### 드라이버 등록하기

드라이버가 구현되면 Laravel에 등록할 준비가 된 것입니다. Laravel의 세션 백엔드에 추가 드라이버를 추가하려면 `Session` [파사드(Facade)](/docs/{{version}}/facades)가 제공하는 `extend` 메서드를 사용할 수 있습니다. [서비스 프로바이더(Service Provider)](/docs/{{version}}/providers)의 `boot` 메서드에서 `extend` 메서드를 호출해야 합니다. 기존 `App\Providers\AppServiceProvider`에서 이 작업을 수행하거나 완전히 새로운 프로바이더를 만들 수 있습니다.

```php
<?php

namespace App\Providers;

use App\Extensions\MongoSessionHandler;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;

class SessionServiceProvider extends ServiceProvider
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
        Session::extend('mongo', function (Application $app) {
            // SessionHandlerInterface 구현을 반환합니다...
            return new MongoSessionHandler;
        });
    }
}
```

세션 드라이버가 등록되면 `SESSION_DRIVER` 환경 변수 또는 애플리케이션의 `config/session.php` 설정 파일 내에서 `mongo` 드라이버를 애플리케이션의 세션 드라이버로 지정할 수 있습니다.

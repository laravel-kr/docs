# Redis

- [소개](#introduction)
- [설정](#configuration)
    - [클러스터](#clusters)
    - [Predis](#predis)
    - [PhpRedis](#phpredis)
- [Redis와 상호작용하기](#interacting-with-redis)
    - [트랜잭션](#transactions)
    - [파이프라이닝 명령어](#pipelining-commands)
- [Pub / Sub](#pubsub)

<a name="introduction"></a>
## 소개

[Redis](https://redis.io)는 오픈 소스이며 고급 키-값 저장소입니다. 키가 [문자열(strings)](https://redis.io/docs/latest/develop/data-types/strings/), [해시(hashes)](https://redis.io/docs/latest/develop/data-types/hashes/), [리스트(lists)](https://redis.io/docs/latest/develop/data-types/lists/), [셋(sets)](https://redis.io/docs/latest/develop/data-types/sets/), [정렬된 셋(sorted sets)](https://redis.io/docs/latest/develop/data-types/sorted-sets/)을 포함할 수 있기 때문에 데이터 구조 서버라고도 불립니다.

Laravel에서 Redis를 사용하기 전에, PECL을 통해 [PhpRedis](https://github.com/phpredis/phpredis) PHP 확장을 설치하고 사용하는 것을 권장합니다. 이 확장은 "사용자 영역" PHP 패키지에 비해 설치가 더 복잡하지만, Redis를 많이 사용하는 애플리케이션에서 더 나은 성능을 제공할 수 있습니다. [Laravel Sail](/docs/{{version}}/sail)을 사용하고 있다면, 이 확장은 이미 애플리케이션의 Docker 컨테이너에 설치되어 있습니다.

PhpRedis 확장을 설치할 수 없는 경우, Composer를 통해 `predis/predis` 패키지를 설치할 수 있습니다. Predis는 전적으로 PHP로 작성된 Redis 클라이언트이며 추가 확장이 필요하지 않습니다.

```shell
composer require predis/predis
```

<a name="configuration"></a>
## 설정

애플리케이션의 Redis 설정은 `config/database.php` 설정 파일을 통해 구성할 수 있습니다. 이 파일에서 애플리케이션이 사용하는 Redis 서버가 포함된 `redis` 배열을 볼 수 있습니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],

    'default' => [
        'host' => env('REDIS_HOST', 'localhost'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => 0,
    ],

    'cache' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_CACHE_DB', '1'),
    ],

],
```

설정 파일에 정의된 각 Redis 서버는 Redis 연결을 나타내는 단일 URL을 정의하지 않는 한 이름, 호스트 및 포트가 필요합니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],

    'default' => [
        'url' => 'tcp://127.0.0.1:6379?database=0',
    ],

    'cache' => [
        'url' => 'tls://user:password@127.0.0.1:6380?database=1',
    ],

],
```

<a name="configuring-the-connection-scheme"></a>
#### 연결 스킴 설정

기본적으로 Redis 클라이언트는 Redis 서버에 연결할 때 `tcp` 스킴을 사용합니다. 하지만 Redis 서버의 설정 배열에서 `scheme` 설정 옵션을 지정하여 TLS / SSL 암호화를 사용할 수 있습니다.

```php
'default' => [
    'scheme' => 'tls',
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
],
```

<a name="clusters"></a>
### 클러스터

애플리케이션이 Redis 서버 클러스터를 사용하는 경우, Redis 설정의 `clusters` 키 내에 이러한 클러스터를 정의해야 합니다. 이 설정 키는 기본적으로 존재하지 않으므로 애플리케이션의 `config/database.php` 설정 파일 내에 생성해야 합니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],

    'clusters' => [
        'default' => [
            [
                'url' => env('REDIS_URL'),
                'host' => env('REDIS_HOST', '127.0.0.1'),
                'username' => env('REDIS_USERNAME'),
                'password' => env('REDIS_PASSWORD'),
                'port' => env('REDIS_PORT', '6379'),
                'database' => env('REDIS_DB', '0'),
            ],
        ],
    ],

    // ...
],
```

기본적으로 `options.cluster` 설정 값이 `redis`로 설정되어 있으므로 Laravel은 네이티브 Redis 클러스터링을 사용합니다. Redis 클러스터링은 장애 조치(failover)를 우아하게 처리하므로 훌륭한 기본 옵션입니다.

Laravel은 Predis를 사용할 때 클라이언트 측 샤딩(sharding)도 지원합니다. 하지만 클라이언트 측 샤딩은 장애 조치를 처리하지 않으므로, 주로 다른 기본 데이터 저장소에서 사용 가능한 일시적인 캐시 데이터에 적합합니다.

네이티브 Redis 클러스터링 대신 클라이언트 측 샤딩을 사용하려면, 애플리케이션의 `config/database.php` 설정 파일 내에서 `options.cluster` 설정 값을 제거하면 됩니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'clusters' => [
        // Rest of Redis configuration...
    ],

    // ...
],
```

<a name="the-redis-facade-alias"></a>
#### Redis 파사드 별칭

Laravel의 `config/app.php` 설정 파일에는 프레임워크에 의해 등록되는 모든 클래스 별칭을 정의하는 `aliases` 배열이 포함되어 있습니다. 기본적으로 PhpRedis 확장에서 제공하는 `Redis` 클래스 이름과 충돌할 수 있으므로 `Redis` 별칭은 포함되어 있지 않습니다. Predis 클라이언트를 사용하고 `Redis` 별칭을 추가하려면, 애플리케이션의 `config/app.php` 설정 파일의 `aliases` 배열에 추가할 수 있습니다.

    'aliases' => Facade::defaultAliases()->merge([
        'Redis' => Illuminate\Support\Facades\Redis::class,
    ])->toArray(),

<a name="predis"></a>
### Predis

애플리케이션이 Predis 패키지를 통해 Redis와 상호작용하도록 하려면, `REDIS_CLIENT` 환경 변수의 값이 `predis`인지 확인해야 합니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'predis'),

    // ...
],
```

기본 설정 옵션 외에도, Predis는 각 Redis 서버에 대해 정의할 수 있는 추가 [연결 파라미터](https://github.com/nrk/predis/wiki/Connection-Parameters)를 지원합니다. 이러한 추가 설정 옵션을 사용하려면, 애플리케이션의 `config/database.php` 설정 파일에서 Redis 서버 설정에 추가하세요.

```php
'default' => [
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
    'read_write_timeout' => 60,
],
```

<a name="phpredis"></a>
### PhpRedis

기본적으로 Laravel은 Redis와 통신하기 위해 PhpRedis 확장을 사용합니다. Laravel이 Redis와 통신하기 위해 사용하는 클라이언트는 일반적으로 `REDIS_CLIENT` 환경 변수의 값을 반영하는 `redis.client` 설정 옵션의 값에 의해 결정됩니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    // ...
],
```

기본 설정 옵션 외에도, PhpRedis는 다음과 같은 추가 연결 파라미터를 지원합니다: `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `timeout`, `context`. `config/database.php` 설정 파일의 Redis 서버 설정에 이러한 옵션을 추가할 수 있습니다.

```php
'default' => [
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
    'read_timeout' => 60,
    'context' => [
        // 'auth' => ['username', 'secret'],
        // 'stream' => ['verify_peer' => false],
    ],
],
```

<a name="phpredis-serialization"></a>
#### PhpRedis 직렬화 및 압축

PhpRedis 확장은 다양한 직렬화기(serializer) 및 압축 알고리즘을 사용하도록 설정할 수도 있습니다. 이러한 알고리즘은 Redis 설정의 `options` 배열을 통해 설정할 수 있습니다.

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
        'serializer' => Redis::SERIALIZER_MSGPACK,
        'compression' => Redis::COMPRESSION_LZ4,
    ],

    // ...
],
```

현재 지원되는 직렬화기에는 `Redis::SERIALIZER_NONE`(기본값), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY`, `Redis::SERIALIZER_MSGPACK`이 있습니다.

지원되는 압축 알고리즘에는 `Redis::COMPRESSION_NONE`(기본값), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD`, `Redis::COMPRESSION_LZ4`가 있습니다.

<a name="interacting-with-redis"></a>
## Redis와 상호작용하기

`Redis` [파사드(facade)](/docs/{{version}}/facades)에서 다양한 메서드를 호출하여 Redis와 상호작용할 수 있습니다. `Redis` 파사드는 동적 메서드를 지원하므로, 파사드에서 모든 [Redis 명령어](https://redis.io/commands)를 호출할 수 있으며 해당 명령어가 직접 Redis로 전달됩니다. 이 예제에서는 `Redis` 파사드에서 `get` 메서드를 호출하여 Redis `GET` 명령어를 호출합니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redis;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 주어진 사용자의 프로필을 표시합니다.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => Redis::get('user:profile:'.$id)
        ]);
    }
}
```

위에서 언급했듯이, `Redis` 파사드에서 Redis의 모든 명령어를 호출할 수 있습니다. Laravel은 매직 메서드를 사용하여 명령어를 Redis 서버로 전달합니다. Redis 명령어가 인수를 기대하는 경우, 해당 인수를 파사드의 해당 메서드에 전달해야 합니다.

```php
use Illuminate\Support\Facades\Redis;

Redis::set('name', 'Taylor');

$values = Redis::lrange('names', 5, 10);
```

또는 `Redis` 파사드의 `command` 메서드를 사용하여 서버에 명령어를 전달할 수 있습니다. 이 메서드는 첫 번째 인수로 명령어 이름을, 두 번째 인수로 값의 배열을 받습니다.

```php
$values = Redis::command('lrange', ['name', 5, 10]);
```

<a name="using-multiple-redis-connections"></a>
#### 여러 Redis 연결 사용하기

애플리케이션의 `config/database.php` 설정 파일을 통해 여러 Redis 연결/서버를 정의할 수 있습니다. `Redis` 파사드의 `connection` 메서드를 사용하여 특정 Redis 연결에 대한 커넥션을 얻을 수 있습니다.

```php
$redis = Redis::connection('connection-name');
```

기본 Redis 연결의 인스턴스를 얻으려면, 추가 인수 없이 `connection` 메서드를 호출하면 됩니다.

```php
$redis = Redis::connection();
```

<a name="transactions"></a>
### 트랜잭션

`Redis` 파사드의 `transaction` 메서드는 Redis의 네이티브 `MULTI` 및 `EXEC` 명령어에 대한 편리한 래퍼를 제공합니다. `transaction` 메서드는 유일한 인수로 클로저를 받습니다. 이 클로저는 Redis 연결 인스턴스를 받으며 이 인스턴스에 원하는 모든 명령어를 실행할 수 있습니다. 클로저 내에서 실행된 모든 Redis 명령어는 단일 원자적 트랜잭션으로 실행됩니다.

```php
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::transaction(function (Redis $redis) {
    $redis->incr('user_visits', 1);
    $redis->incr('total_visits', 1);
});
```

> [!WARNING]
> Redis 트랜잭션을 정의할 때, Redis 연결에서 값을 검색할 수 없습니다. 트랜잭션은 단일 원자적 작업으로 실행되며, 해당 작업은 클로저가 명령어 실행을 완료할 때까지 실행되지 않습니다.

#### Lua 스크립트

`eval` 메서드는 여러 Redis 명령어를 단일 원자적 작업으로 실행하는 또 다른 방법을 제공합니다. 하지만 `eval` 메서드는 해당 작업 중에 Redis 키 값과 상호작용하고 검사할 수 있다는 장점이 있습니다. Redis 스크립트는 [Lua 프로그래밍 언어](https://www.lua.org)로 작성됩니다.

`eval` 메서드는 처음에는 다소 어려워 보일 수 있지만, 기본 예제를 통해 익숙해질 수 있습니다. `eval` 메서드는 여러 인수를 기대합니다. 먼저, Lua 스크립트(문자열)를 메서드에 전달해야 합니다. 둘째, 스크립트가 상호작용하는 키의 수(정수)를 전달해야 합니다. 셋째, 해당 키의 이름을 전달해야 합니다. 마지막으로, 스크립트 내에서 액세스해야 하는 다른 추가 인수를 전달할 수 있습니다.

이 예제에서는 카운터를 증가시키고, 새 값을 검사하고, 첫 번째 카운터의 값이 5보다 크면 두 번째 카운터를 증가시킵니다. 마지막으로, 첫 번째 카운터의 값을 반환합니다.

```php
$value = Redis::eval(<<<'LUA'
    local counter = redis.call("incr", KEYS[1])

    if counter > 5 then
        redis.call("incr", KEYS[2])
    end

    return counter
LUA, 2, 'first-counter', 'second-counter');
```

> [!WARNING]
> Redis 스크립팅에 대한 자세한 정보는 [Redis 문서](https://redis.io/commands/eval)를 참조하세요.

<a name="pipelining-commands"></a>
### 파이프라이닝 명령어

때때로 수십 개의 Redis 명령어를 실행해야 할 수 있습니다. 각 명령어마다 Redis 서버에 네트워크 왕복을 하는 대신, `pipeline` 메서드를 사용할 수 있습니다. `pipeline` 메서드는 하나의 인수를 받습니다: Redis 인스턴스를 받는 클로저입니다. 이 Redis 인스턴스에 모든 명령어를 실행할 수 있으며, 모든 명령어는 서버로의 네트워크 왕복을 줄이기 위해 동시에 Redis 서버로 전송됩니다. 명령어는 여전히 실행된 순서대로 실행됩니다.

```php
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::pipeline(function (Redis $pipe) {
    for ($i = 0; $i < 1000; $i++) {
        $pipe->set("key:$i", $i);
    }
});
```

<a name="pubsub"></a>
## Pub / Sub

Laravel은 Redis `publish` 및 `subscribe` 명령어에 대한 편리한 인터페이스를 제공합니다. 이러한 Redis 명령어를 사용하면 주어진 "채널"에서 메시지를 수신할 수 있습니다. 다른 애플리케이션에서, 심지어 다른 프로그래밍 언어를 사용하여 채널에 메시지를 발행하여 애플리케이션과 프로세스 간의 쉬운 통신을 가능하게 합니다.

먼저, `subscribe` 메서드를 사용하여 채널 리스너를 설정해 보겠습니다. `subscribe` 메서드 호출은 장기 실행 프로세스를 시작하므로, 이 메서드 호출을 [아티즌 명령어(Artisan command)](/docs/{{version}}/artisan) 내에 배치합니다.

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class RedisSubscribe extends Command
{
    /**
     * 콘솔 명령어의 이름과 시그니처입니다.
     *
     * @var string
     */
    protected $signature = 'redis:subscribe';

    /**
     * 콘솔 명령어 설명입니다.
     *
     * @var string
     */
    protected $description = 'Subscribe to a Redis channel';

    /**
     * 콘솔 명령어를 실행합니다.
     */
    public function handle(): void
    {
        Redis::subscribe(['test-channel'], function (string $message) {
            echo $message;
        });
    }
}
```

이제 `publish` 메서드를 사용하여 채널에 메시지를 발행할 수 있습니다.

```php
use Illuminate\Support\Facades\Redis;

Route::get('/publish', function () {
    // ...

    Redis::publish('test-channel', json_encode([
        'name' => 'Adam Wathan'
    ]));
});
```

<a name="wildcard-subscriptions"></a>
#### 와일드카드 구독

`psubscribe` 메서드를 사용하면 와일드카드 채널을 구독할 수 있으며, 이는 모든 채널의 모든 메시지를 캐치하는 데 유용할 수 있습니다. 채널 이름은 제공된 클로저의 두 번째 인수로 전달됩니다.

```php
Redis::psubscribe(['*'], function (string $message, string $channel) {
    echo $message;
});

Redis::psubscribe(['users.*'], function (string $message, string $channel) {
    echo $message;
});
```

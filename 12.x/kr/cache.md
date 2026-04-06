# 캐시(Cache)

- [소개](#introduction)
- [설정](#configuration)
    - [드라이버 사전 요구사항](#driver-prerequisites)
- [캐시 사용하기](#cache-usage)
    - [캐시 인스턴스 얻기](#obtaining-a-cache-instance)
    - [캐시에서 아이템 조회하기](#retrieving-items-from-the-cache)
    - [캐시에 아이템 저장하기](#storing-items-in-the-cache)
    - [캐시에서 아이템 삭제하기](#removing-items-from-the-cache)
    - [캐시 메모이제이션](#cache-memoization)
    - [캐시 헬퍼](#the-cache-helper)
- [캐시 태그](#cache-tags)
- [원자적 잠금(Atomic Locks)](#atomic-locks)
    - [잠금 관리하기](#managing-locks)
    - [프로세스 간 잠금 관리하기](#managing-locks-across-processes)
    - [동시성 제한](#concurrency-limiting)
- [캐시 장애 조치(Cache Failover)](#cache-failover)
- [커스텀 캐시 드라이버 추가하기](#adding-custom-cache-drivers)
    - [드라이버 작성하기](#writing-the-driver)
    - [드라이버 등록하기](#registering-the-driver)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

애플리케이션에서 수행하는 일부 데이터 조회 또는 처리 작업은 CPU를 많이 사용하거나 완료하는 데 몇 초가 걸릴 수 있습니다. 이런 경우, 조회한 데이터를 일정 시간 동안 캐시에 저장하여 동일한 데이터에 대한 후속 요청에서 빠르게 조회할 수 있도록 하는 것이 일반적입니다. 캐시된 데이터는 보통 [Memcached](https://memcached.org)나 [Redis](https://redis.io)와 같은 매우 빠른 데이터 저장소에 저장됩니다.

다행히 Laravel은 다양한 캐시 백엔드에 대해 표현력 있고 통합된 API를 제공하여 매우 빠른 데이터 조회를 활용하고 웹 애플리케이션의 속도를 높일 수 있습니다.

<a name="configuration"></a>
## 설정

애플리케이션의 캐시 설정 파일은 `config/cache.php`에 위치합니다. 이 파일에서 애플리케이션 전체에서 기본적으로 사용할 캐시 저장소를 지정할 수 있습니다. Laravel은 [Memcached](https://memcached.org), [Redis](https://redis.io), [DynamoDB](https://aws.amazon.com/dynamodb), 그리고 관계형 데이터베이스와 같은 인기 있는 캐싱 백엔드를 기본적으로 지원합니다. 또한 파일 기반 캐시 드라이버를 사용할 수 있으며, `array`와 `null` 캐시 드라이버는 자동화된 테스트에 편리한 캐시 백엔드를 제공합니다.

캐시 설정 파일에는 검토할 수 있는 다양한 다른 옵션도 포함되어 있습니다. 기본적으로 Laravel은 직렬화된 캐시 객체를 애플리케이션 데이터베이스에 저장하는 `database` 캐시 드라이버를 사용하도록 설정되어 있습니다.

<a name="driver-prerequisites"></a>
### 드라이버 사전 요구사항

<a name="prerequisites-database"></a>
#### 데이터베이스(Database)

`database` 캐시 드라이버를 사용할 때는 캐시 데이터를 저장할 데이터베이스 테이블이 필요합니다. 일반적으로 이것은 Laravel의 기본 `0001_01_01_000001_create_cache_table.php` [데이터베이스 마이그레이션](/docs/{{version}}/migrations)에 포함되어 있습니다. 그러나 애플리케이션에 이 마이그레이션이 없는 경우 `make:cache-table` Artisan 명령어를 사용하여 생성할 수 있습니다.

```shell
php artisan make:cache-table

php artisan migrate
```

<a name="memcached"></a>
#### Memcached

Memcached 드라이버를 사용하려면 [Memcached PECL 패키지](https://pecl.php.net/package/memcached)가 설치되어 있어야 합니다. `config/cache.php` 설정 파일에 모든 Memcached 서버를 나열할 수 있습니다. 이 파일에는 시작할 수 있도록 `memcached.servers` 항목이 이미 포함되어 있습니다.

```php
'memcached' => [
    // ...

    'servers' => [
        [
            'host' => env('MEMCACHED_HOST', '127.0.0.1'),
            'port' => env('MEMCACHED_PORT', 11211),
            'weight' => 100,
        ],
    ],
],
```

필요한 경우 `host` 옵션을 UNIX 소켓 경로로 설정할 수 있습니다. 이렇게 하는 경우 `port` 옵션은 `0`으로 설정해야 합니다.

```php
'memcached' => [
    // ...

    'servers' => [
        [
            'host' => '/var/run/memcached/memcached.sock',
            'port' => 0,
            'weight' => 100
        ],
    ],
],
```

<a name="redis"></a>
#### Redis

Laravel에서 Redis 캐시를 사용하기 전에 PECL을 통해 PhpRedis PHP 확장을 설치하거나 Composer를 통해 `predis/predis` 패키지(~2.0)를 설치해야 합니다. [Laravel Sail](/docs/{{version}}/sail)에는 이 확장이 이미 포함되어 있습니다. 또한 [Laravel Cloud](https://cloud.laravel.com)와 [Laravel Forge](https://forge.laravel.com)와 같은 공식 Laravel 애플리케이션 플랫폼에는 PhpRedis 확장이 기본적으로 설치되어 있습니다.

Redis 설정에 대한 자세한 내용은 [Laravel 문서 페이지](/docs/{{version}}/redis#configuration)를 참조하세요.

<a name="dynamodb"></a>
#### DynamoDB

[DynamoDB](https://aws.amazon.com/dynamodb) 캐시 드라이버를 사용하기 전에 모든 캐시 데이터를 저장할 DynamoDB 테이블을 생성해야 합니다. 일반적으로 이 테이블의 이름은 `cache`여야 합니다. 그러나 `cache` 설정 파일 내의 `stores.dynamodb.table` 설정 값에 따라 테이블 이름을 지정해야 합니다. 테이블 이름은 `DYNAMODB_CACHE_TABLE` 환경 변수를 통해서도 설정할 수 있습니다.

이 테이블에는 애플리케이션의 `cache` 설정 파일 내 `stores.dynamodb.attributes.key` 설정 항목의 값에 해당하는 이름을 가진 문자열 파티션 키도 있어야 합니다. 기본적으로 파티션 키의 이름은 `key`여야 합니다.

일반적으로 DynamoDB는 테이블에서 만료된 아이템을 사전에 제거하지 않습니다. 따라서 테이블에서 [TTL(Time to Live)을 활성화](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)해야 합니다. 테이블의 TTL 설정을 구성할 때 TTL 속성 이름을 `expires_at`으로 설정해야 합니다.

다음으로 Laravel 애플리케이션이 DynamoDB와 통신할 수 있도록 AWS SDK를 설치합니다.

```shell
composer require aws/aws-sdk-php
```

또한 DynamoDB 캐시 저장소 설정 옵션에 대한 값이 제공되었는지 확인해야 합니다. 일반적으로 `AWS_ACCESS_KEY_ID` 및 `AWS_SECRET_ACCESS_KEY`와 같은 이러한 옵션은 애플리케이션의 `.env` 설정 파일에 정의해야 합니다.

```php
'dynamodb' => [
    'driver' => 'dynamodb',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => env('DYNAMODB_CACHE_TABLE', 'cache'),
    'endpoint' => env('DYNAMODB_ENDPOINT'),
],
```

<a name="mongodb"></a>
#### MongoDB

MongoDB를 사용하는 경우, 공식 `mongodb/laravel-mongodb` 패키지에서 `mongodb` 캐시 드라이버를 제공하며 `mongodb` 데이터베이스 연결을 사용하여 설정할 수 있습니다. MongoDB는 TTL 인덱스를 지원하므로 만료된 캐시 아이템을 자동으로 삭제하는 데 사용할 수 있습니다.

MongoDB 설정에 대한 자세한 내용은 MongoDB [캐시 및 잠금 문서](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/cache/)를 참조하세요.

<a name="cache-usage"></a>
## 캐시 사용하기

<a name="obtaining-a-cache-instance"></a>
### 캐시 인스턴스 얻기

캐시 저장소 인스턴스를 얻으려면 이 문서 전체에서 사용할 `Cache` 파사드를 사용할 수 있습니다. `Cache` 파사드는 Laravel 캐시 계약의 기본 구현에 대한 편리하고 간결한 액세스를 제공합니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록을 표시합니다.
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

<a name="accessing-multiple-cache-stores"></a>
#### 여러 캐시 저장소에 액세스하기

`Cache` 파사드를 사용하여 `store` 메서드를 통해 다양한 캐시 저장소에 액세스할 수 있습니다. `store` 메서드에 전달하는 키는 `cache` 설정 파일의 `stores` 설정 배열에 나열된 저장소 중 하나에 해당해야 합니다.

```php
$value = Cache::store('file')->get('foo');

Cache::store('redis')->put('bar', 'baz', 600); // 10분
```

<a name="retrieving-items-from-the-cache"></a>
### 캐시에서 아이템 조회하기

`Cache` 파사드의 `get` 메서드는 캐시에서 아이템을 조회하는 데 사용됩니다. 아이템이 캐시에 존재하지 않으면 `null`이 반환됩니다. 원한다면 아이템이 존재하지 않을 때 반환할 기본값을 지정하는 두 번째 인수를 `get` 메서드에 전달할 수 있습니다.

```php
$value = Cache::get('key');

$value = Cache::get('key', 'default');
```

기본값으로 클로저를 전달할 수도 있습니다. 지정된 아이템이 캐시에 존재하지 않으면 클로저의 결과가 반환됩니다. 클로저를 전달하면 데이터베이스나 다른 외부 서비스에서 기본값을 조회하는 것을 지연시킬 수 있습니다.

```php
$value = Cache::get('key', function () {
    return DB::table(/* ... */)->get();
});
```

<a name="determining-item-existence"></a>
#### 아이템 존재 여부 확인하기

`has` 메서드를 사용하여 아이템이 캐시에 존재하는지 확인할 수 있습니다. 이 메서드는 아이템이 존재하지만 값이 `null`인 경우에도 `false`를 반환합니다.

```php
if (Cache::has('key')) {
    // ...
}
```

<a name="incrementing-decrementing-values"></a>
#### 값 증가 / 감소시키기

`increment`와 `decrement` 메서드를 사용하여 캐시에 있는 정수 아이템의 값을 조정할 수 있습니다. 이 두 메서드 모두 아이템의 값을 증가 또는 감소시킬 양을 나타내는 선택적 두 번째 인수를 받습니다.

```php
// 값이 존재하지 않으면 초기화...
Cache::add('key', 0, now()->plus(hours: 4));

// 값 증가 또는 감소...
Cache::increment('key');
Cache::increment('key', $amount);
Cache::decrement('key');
Cache::decrement('key', $amount);
```

<a name="retrieve-store"></a>
#### 조회 및 저장

때때로 캐시에서 아이템을 조회하면서 요청한 아이템이 존재하지 않으면 기본값을 저장하고 싶을 수 있습니다. 예를 들어, 캐시에서 모든 사용자를 조회하거나 존재하지 않으면 데이터베이스에서 조회하여 캐시에 추가하고 싶을 수 있습니다. `Cache::remember` 메서드를 사용하여 이를 수행할 수 있습니다.

```php
$value = Cache::remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

아이템이 캐시에 존재하지 않으면 `remember` 메서드에 전달된 클로저가 실행되고 그 결과가 캐시에 저장됩니다.

`rememberForever` 메서드를 사용하여 캐시에서 아이템을 조회하거나 존재하지 않으면 영구적으로 저장할 수 있습니다.

```php
$value = Cache::rememberForever('users', function () {
    return DB::table('users')->get();
});
```

<a name="swr"></a>
#### Stale While Revalidate

`Cache::remember` 메서드를 사용할 때 캐시된 값이 만료되면 일부 사용자가 느린 응답 시간을 경험할 수 있습니다. 특정 유형의 데이터에서는 캐시된 값이 백그라운드에서 재계산되는 동안 부분적으로 오래된 데이터를 제공하여 일부 사용자가 캐시 값이 계산되는 동안 느린 응답 시간을 경험하지 않도록 하는 것이 유용할 수 있습니다. 이것을 흔히 "stale-while-revalidate" 패턴이라고 하며, `Cache::flexible` 메서드가 이 패턴의 구현을 제공합니다.

flexible 메서드는 캐시된 값이 "신선한" 것으로 간주되는 기간과 "오래된" 것이 되는 시점을 지정하는 배열을 받습니다. 배열의 첫 번째 값은 캐시가 신선한 것으로 간주되는 초 수를 나타내며, 두 번째 값은 재계산이 필요하기 전에 오래된 데이터로 제공될 수 있는 기간을 정의합니다.

신선한 기간(첫 번째 값 이전) 내에 요청이 이루어지면 캐시가 재계산 없이 즉시 반환됩니다. 오래된 기간(두 값 사이) 동안 요청이 이루어지면 오래된 값이 사용자에게 제공되고, 응답이 사용자에게 전송된 후 캐시된 값을 새로 고치기 위해 [지연 함수](/docs/{{version}}/helpers#deferred-functions)가 등록됩니다. 두 번째 값 이후에 요청이 이루어지면 캐시가 만료된 것으로 간주되어 값이 즉시 재계산되므로 사용자에게 더 느린 응답이 발생할 수 있습니다.

```php
$value = Cache::flexible('users', [5, 10], function () {
    return DB::table('users')->get();
});
```

<a name="retrieve-delete"></a>
#### 조회 및 삭제

캐시에서 아이템을 조회한 다음 해당 아이템을 삭제해야 하는 경우 `pull` 메서드를 사용할 수 있습니다. `get` 메서드와 마찬가지로 아이템이 캐시에 존재하지 않으면 `null`이 반환됩니다.

```php
$value = Cache::pull('key');

$value = Cache::pull('key', 'default');
```

<a name="storing-items-in-the-cache"></a>
### 캐시에 아이템 저장하기

`Cache` 파사드의 `put` 메서드를 사용하여 캐시에 아이템을 저장할 수 있습니다.

```php
Cache::put('key', 'value', $seconds = 10);
```

저장 시간이 `put` 메서드에 전달되지 않으면 아이템은 무기한으로 저장됩니다.

```php
Cache::put('key', 'value');
```

초 수를 정수로 전달하는 대신 캐시된 아이템의 원하는 만료 시간을 나타내는 `DateTime` 인스턴스를 전달할 수도 있습니다.

```php
Cache::put('key', 'value', now()->plus(minutes: 10));
```

<a name="store-if-not-present"></a>
#### 존재하지 않는 경우에만 저장

`add` 메서드는 캐시 저장소에 아이템이 아직 존재하지 않는 경우에만 아이템을 캐시에 추가합니다. 아이템이 실제로 캐시에 추가되면 메서드는 `true`를 반환합니다. 그렇지 않으면 메서드는 `false`를 반환합니다. `add` 메서드는 원자적 연산입니다.

```php
Cache::add('key', 'value', $seconds);
```

<a name="storing-items-forever"></a>
#### 아이템 영구 저장

`forever` 메서드를 사용하여 캐시에 아이템을 영구적으로 저장할 수 있습니다. 이러한 아이템은 만료되지 않으므로 `forget` 메서드를 사용하여 캐시에서 수동으로 제거해야 합니다.

```php
Cache::forever('key', 'value');
```

> [!NOTE]
> Memcached 드라이버를 사용하는 경우 "영구적으로" 저장된 아이템은 캐시가 크기 제한에 도달하면 제거될 수 있습니다.

<a name="removing-items-from-the-cache"></a>
### 캐시에서 아이템 삭제하기

`forget` 메서드를 사용하여 캐시에서 아이템을 제거할 수 있습니다.

```php
Cache::forget('key');
```

만료 초 수를 0 또는 음수로 제공하여 아이템을 제거할 수도 있습니다.

```php
Cache::put('key', 'value', 0);

Cache::put('key', 'value', -5);
```

`flush` 메서드를 사용하여 전체 캐시를 삭제할 수 있습니다.

```php
Cache::flush();
```

> [!WARNING]
> 캐시 플러시는 설정된 캐시 "접두사"를 존중하지 않으며 캐시의 모든 항목을 제거합니다. 다른 애플리케이션과 공유되는 캐시를 삭제할 때 이 점을 신중하게 고려하세요.

<a name="cache-memoization"></a>
### 캐시 메모이제이션(Cache Memoization)

Laravel의 `memo` 캐시 드라이버를 사용하면 단일 요청 또는 작업 실행 중에 해결된 캐시 값을 메모리에 임시로 저장할 수 있습니다. 이를 통해 동일한 실행 내에서 반복되는 캐시 히트를 방지하여 성능을 크게 향상시킵니다.

메모이제이션된 캐시를 사용하려면 `memo` 메서드를 호출합니다.

```php
use Illuminate\Support\Facades\Cache;

$value = Cache::memo()->get('key');
```

`memo` 메서드는 선택적으로 캐시 저장소의 이름을 받으며, 이는 메모이제이션된 드라이버가 감쌀 기본 캐시 저장소를 지정합니다.

```php
// 기본 캐시 저장소 사용...
$value = Cache::memo()->get('key');

// Redis 캐시 저장소 사용...
$value = Cache::memo('redis')->get('key');
```

주어진 키에 대한 첫 번째 `get` 호출은 캐시 저장소에서 값을 조회하지만, 동일한 요청 또는 작업 내의 후속 호출은 메모리에서 값을 조회합니다.

```php
// 캐시 히트...
$value = Cache::memo()->get('key');

// 캐시 히트 없음, 메모이제이션된 값 반환...
$value = Cache::memo()->get('key');
```

캐시 값을 수정하는 메서드(`put`, `increment`, `remember` 등)를 호출하면 메모이제이션된 캐시는 자동으로 메모이제이션된 값을 잊고 변경 메서드 호출을 기본 캐시 저장소에 위임합니다.

```php
Cache::memo()->put('name', 'Taylor'); // 기본 캐시에 쓰기...
Cache::memo()->get('name');           // 기본 캐시 히트...
Cache::memo()->get('name');           // 메모이제이션됨, 캐시 히트 없음...

Cache::memo()->put('name', 'Tim');    // 메모이제이션된 값 삭제, 새 값 쓰기...
Cache::memo()->get('name');           // 다시 기본 캐시 히트...
```

<a name="the-cache-helper"></a>
### 캐시 헬퍼

`Cache` 파사드를 사용하는 것 외에도 전역 `cache` 함수를 사용하여 캐시를 통해 데이터를 조회하고 저장할 수 있습니다. `cache` 함수가 단일 문자열 인수로 호출되면 주어진 키의 값을 반환합니다.

```php
$value = cache('key');
```

키/값 쌍의 배열과 만료 시간을 함수에 제공하면 지정된 기간 동안 캐시에 값을 저장합니다.

```php
cache(['key' => 'value'], $seconds);

cache(['key' => 'value'], now()->plus(minutes: 10));
```

`cache` 함수가 인수 없이 호출되면 `Illuminate\Contracts\Cache\Factory` 구현의 인스턴스를 반환하여 다른 캐싱 메서드를 호출할 수 있습니다.

```php
cache()->remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

> [!NOTE]
> 전역 `cache` 함수에 대한 호출을 테스트할 때 [파사드 테스트](/docs/{{version}}/mocking#mocking-facades)와 마찬가지로 `Cache::shouldReceive` 메서드를 사용할 수 있습니다.

<a name="cache-tags"></a>
## 캐시 태그

> [!WARNING]
> 캐시 태그는 `file`, `dynamodb` 또는 `database` 캐시 드라이버를 사용할 때는 지원되지 않습니다.

<a name="storing-tagged-cache-items"></a>
### 태그된 캐시 아이템 저장하기

캐시 태그를 사용하면 캐시에 있는 관련 아이템에 태그를 지정하고, 특정 태그가 할당된 모든 캐시 값을 플러시(삭제)할 수 있습니다. 태그 이름의 순서가 있는 배열을 전달하여 태그된 캐시에 접근할 수 있습니다. 예를 들어, 태그된 캐시에 접근하여 값을 `put`해 보겠습니다.

```php
use Illuminate\Support\Facades\Cache;

Cache::tags(['people', 'artists'])->put('John', $john, $seconds);
Cache::tags(['people', 'authors'])->put('Anne', $anne, $seconds);
```

<a name="accessing-tagged-cache-items"></a>
### 태그된 캐시 아이템 접근하기

태그를 통해 저장된 아이템은 저장할 때 사용한 태그를 함께 제공하지 않으면 접근할 수 없습니다. 태그된 캐시 아이템을 조회하려면 동일한 순서의 태그 목록을 `tags` 메서드에 전달한 다음 조회하려는 키로 `get` 메서드를 호출합니다.

```php
$john = Cache::tags(['people', 'artists'])->get('John');

$anne = Cache::tags(['people', 'authors'])->get('Anne');
```

<a name="removing-tagged-cache-items"></a>
### 태그된 캐시 아이템 삭제하기

태그 또는 태그 목록에 할당된 모든 아이템을 플러시(삭제)할 수 있습니다. 예를 들어, 다음 코드는 `people`, `authors` 또는 두 태그 모두가 지정된 모든 캐시를 삭제합니다. 따라서 `Anne`과 `John` 모두 캐시에서 삭제됩니다.

```php
Cache::tags(['people', 'authors'])->flush();
```

반대로 아래 코드는 `authors`로만 태그된 캐시 값만 삭제하므로 `Anne`은 삭제되지만 `John`은 삭제되지 않습니다.

```php
Cache::tags('authors')->flush();
```

<a name="atomic-locks"></a>
## 원자적 잠금(Atomic Locks)

> [!WARNING]
> 이 기능을 사용하려면 애플리케이션의 기본 캐시 드라이버로 `memcached`, `redis`, `dynamodb`, `database`, `file` 또는 `array` 캐시 드라이버를 사용해야 합니다. 또한 모든 서버는 동일한 중앙 캐시 서버와 통신해야 합니다.

<a name="managing-locks"></a>
### 잠금 관리하기

원자적 잠금(Atomic Locks)을 사용하면 경쟁 조건(Race Condition)에 대해 걱정하지 않고 분산 잠금을 조작할 수 있습니다. 예를 들어 [Laravel Cloud](https://cloud.laravel.com)는 원자적 잠금을 사용하여 한 번에 하나의 원격 작업만 서버에서 실행되도록 합니다. `Cache::lock` 메서드를 사용하여 잠금을 생성하고 관리할 수 있습니다.

```php
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('foo', 10);

if ($lock->get()) {
    // 10초 동안 잠금 획득...

    $lock->release();
}
```

`get` 메서드는 클로저도 받습니다. 클로저가 실행된 후 Laravel은 자동으로 잠금을 해제합니다.

```php
Cache::lock('foo', 10)->get(function () {
    // 10초 동안 잠금 획득 후 자동으로 해제...
});
```

요청 시점에 잠금을 사용할 수 없는 경우 Laravel에 지정된 초 동안 대기하도록 지시할 수 있습니다. 지정된 시간 제한 내에 잠금을 획득할 수 없으면 `Illuminate\Contracts\Cache\LockTimeoutException`이 발생합니다.

```php
use Illuminate\Contracts\Cache\LockTimeoutException;

$lock = Cache::lock('foo', 10);

try {
    $lock->block(5);

    // 최대 5초 대기 후 잠금 획득...
} catch (LockTimeoutException $e) {
    // 잠금을 획득할 수 없음...
} finally {
    $lock->release();
}
```

위의 예제는 `block` 메서드에 클로저를 전달하여 단순화할 수 있습니다. 이 메서드에 클로저가 전달되면 Laravel은 지정된 초 동안 잠금을 획득하려고 시도하고 클로저가 실행되면 자동으로 잠금을 해제합니다.

```php
Cache::lock('foo', 10)->block(5, function () {
    // 최대 5초 대기 후 10초 동안 잠금 획득...
});
```

<a name="managing-locks-across-processes"></a>
### 프로세스 간 잠금 관리하기

때때로 한 프로세스에서 잠금을 획득하고 다른 프로세스에서 해제하고 싶을 수 있습니다. 예를 들어, 웹 요청 중에 잠금을 획득하고 해당 요청에 의해 트리거된 큐 작업의 끝에서 잠금을 해제하고 싶을 수 있습니다. 이 시나리오에서는 잠금의 범위가 지정된 "소유자 토큰"을 큐 작업에 전달하여 작업이 주어진 토큰을 사용하여 잠금을 다시 인스턴스화할 수 있도록 해야 합니다.

아래 예제에서는 잠금이 성공적으로 획득되면 큐 작업을 디스패치합니다. 또한 잠금의 `owner` 메서드를 통해 잠금의 소유자 토큰을 큐 작업에 전달합니다.

```php
$podcast = Podcast::find($id);

$lock = Cache::lock('processing', 120);

if ($lock->get()) {
    ProcessPodcast::dispatch($podcast, $lock->owner());
}
```

애플리케이션의 `ProcessPodcast` 작업 내에서 소유자 토큰을 사용하여 잠금을 복원하고 해제할 수 있습니다.

```php
Cache::restoreLock('processing', $this->owner)->release();
```

현재 소유자를 존중하지 않고 잠금을 해제하려면 `forceRelease` 메서드를 사용할 수 있습니다.

```php
Cache::lock('processing')->forceRelease();
```

<a name="concurrency-limiting"></a>
### 동시성 제한

Laravel의 원자적 잠금 기능은 클로저의 동시 실행을 제한하는 몇 가지 방법도 제공합니다. 전체 인프라에서 하나의 실행 인스턴스만 허용하려면 `withoutOverlapping`을 사용하세요.

```php
Cache::withoutOverlapping('foo', function () {
    // 최대 10초 대기 후 잠금 획득...
});
```

기본적으로 잠금은 클로저가 실행을 완료할 때까지 유지되며, 메서드는 잠금을 획득하기 위해 최대 10초까지 대기합니다. 추가 인수를 사용하여 이 값들을 커스터마이즈할 수 있습니다.

```php
Cache::withoutOverlapping('foo', function () {
    // 최대 5초 대기 후 120초 동안 잠금 획득...
}, lockFor: 120, waitFor: 5);
```

지정된 대기 시간 내에 잠금을 획득할 수 없으면 `Illuminate\Contracts\Cache\LockTimeoutException`이 발생합니다.

제어된 병렬 처리가 필요한 경우, `funnel` 메서드를 사용하여 최대 동시 실행 수를 설정합니다. `funnel` 메서드는 잠금을 지원하는 모든 캐시 드라이버에서 작동합니다.

```php
Cache::funnel('foo')
    ->limit(3)
    ->releaseAfter(60)
    ->block(10)
    ->then(function () {
        // 동시성 잠금 획득...
    }, function () {
        // 동시성 잠금을 획득할 수 없음...
    });
```

`funnel` 키는 제한되는 리소스를 식별합니다. `limit` 메서드는 최대 동시 실행 수를 정의합니다. `releaseAfter` 메서드는 획득한 슬롯이 자동으로 해제되기 전의 안전 타임아웃을 초 단위로 설정합니다. `block` 메서드는 사용 가능한 슬롯을 기다리는 시간(초)을 설정합니다.

실패 클로저 대신 예외를 통해 타임아웃을 처리하려면 두 번째 클로저를 생략할 수 있습니다. 지정된 대기 시간 내에 잠금을 획득할 수 없으면 `Illuminate\Cache\Limiters\LimiterTimeoutException`이 발생합니다.

```php
use Illuminate\Cache\Limiters\LimiterTimeoutException;

try {
    Cache::funnel('foo')
        ->limit(3)
        ->releaseAfter(60)
        ->block(10)
        ->then(function () {
            // 동시성 잠금 획득...
        });
} catch (LimiterTimeoutException $e) {
    // 동시성 잠금을 획득할 수 없음...
}
```

동시성 제한기에 특정 캐시 저장소를 사용하려면 원하는 저장소에서 `funnel` 메서드를 호출할 수 있습니다.

```php
Cache::store('redis')->funnel('foo')
    ->limit(3)
    ->block(10)
    ->then(function () {
        // "redis" 저장소를 사용하여 동시성 잠금 획득...
    });
```

> [!NOTE]
> `funnel` 메서드는 캐시 저장소가 `Illuminate\Contracts\Cache\LockProvider` 인터페이스를 구현해야 합니다. 잠금을 지원하지 않는 캐시 저장소로 `funnel`을 사용하면 `BadMethodCallException`이 발생합니다.

<a name="cache-failover"></a>
## 캐시 장애 조치(Cache Failover)

`failover` 캐시 드라이버는 캐시와 상호작용할 때 자동 장애 조치(failover) 기능을 제공합니다. `failover` 저장소의 기본 캐시 저장소가 어떤 이유로든 실패하면 Laravel은 자동으로 목록에서 다음으로 설정된 저장소를 사용하려고 시도합니다. 이는 캐시 안정성이 중요한 프로덕션 환경에서 고가용성을 보장하는 데 특히 유용합니다.

장애 조치 캐시 저장소를 구성하려면 `failover` 드라이버를 지정하고 순서대로 시도할 저장소 이름의 배열을 제공합니다. 기본적으로 Laravel은 애플리케이션의 `config/cache.php` 설정 파일에 예제 장애 조치 구성을 포함하고 있습니다.

```php
'failover' => [
    'driver' => 'failover',
    'stores' => [
        'database',
        'array',
    ],
],
```

`failover` 드라이버를 사용하는 저장소를 구성한 후에는 장애 조치 기능을 활용하기 위해 애플리케이션의 `.env` 파일에서 장애 조치 저장소를 기본 캐시 저장소로 설정해야 합니다.

```ini
CACHE_STORE=failover
```

캐시 저장소 작업이 실패하고 장애 조치가 활성화되면 Laravel은 `Illuminate\Cache\Events\CacheFailedOver` 이벤트를 디스패치하여 캐시 저장소가 실패했음을 보고하거나 기록할 수 있도록 합니다.

<a name="adding-custom-cache-drivers"></a>
## 커스텀 캐시 드라이버 추가하기

<a name="writing-the-driver"></a>
### 드라이버 작성하기

커스텀 캐시 드라이버를 만들려면 먼저 `Illuminate\Contracts\Cache\Store` [계약](/docs/{{version}}/contracts)을 구현해야 합니다. 따라서 MongoDB 캐시 구현은 다음과 같을 수 있습니다.

```php
<?php

namespace App\Extensions;

use Illuminate\Contracts\Cache\Store;

class MongoStore implements Store
{
    public function get($key) {}
    public function many(array $keys) {}
    public function put($key, $value, $seconds) {}
    public function putMany(array $values, $seconds) {}
    public function increment($key, $value = 1) {}
    public function decrement($key, $value = 1) {}
    public function forever($key, $value) {}
    public function forget($key) {}
    public function flush() {}
    public function getPrefix() {}
}
```

MongoDB 연결을 사용하여 이러한 각 메서드를 구현하기만 하면 됩니다. 이러한 각 메서드를 구현하는 방법에 대한 예제는 [Laravel 프레임워크 소스 코드](https://github.com/laravel/framework)의 `Illuminate\Cache\MemcachedStore`를 살펴보세요. 구현이 완료되면 `Cache` 파사드의 `extend` 메서드를 호출하여 커스텀 드라이버 등록을 완료할 수 있습니다.

```php
Cache::extend('mongo', function (Application $app) {
    return Cache::repository(new MongoStore);
});
```

> [!NOTE]
> 커스텀 캐시 드라이버 코드를 어디에 둘지 궁금하다면 `app` 디렉토리 내에 `Extensions` 네임스페이스를 만들 수 있습니다. 그러나 Laravel에는 엄격한 애플리케이션 구조가 없으며 원하는 대로 애플리케이션을 구성할 수 있습니다.

<a name="registering-the-driver"></a>
### 드라이버 등록하기

Laravel에 커스텀 캐시 드라이버를 등록하려면 `Cache` 파사드의 `extend` 메서드를 사용합니다. 다른 서비스 프로바이더가 `boot` 메서드 내에서 캐시된 값을 읽으려고 시도할 수 있으므로 `booting` 콜백 내에서 커스텀 드라이버를 등록합니다. `booting` 콜백을 사용하면 애플리케이션의 서비스 프로바이더에서 `boot` 메서드가 호출되기 직전에, 모든 서비스 프로바이더에서 `register` 메서드가 호출된 후에 커스텀 드라이버가 등록됩니다. 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `register` 메서드 내에서 `booting` 콜백을 등록합니다.

```php
<?php

namespace App\Providers;

use App\Extensions\MongoStore;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 등록합니다.
     */
    public function register(): void
    {
        $this->app->booting(function () {
             Cache::extend('mongo', function (Application $app) {
                 return Cache::repository(new MongoStore);
             });
         });
    }

    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        // ...
    }
}
```

`extend` 메서드에 전달되는 첫 번째 인수는 드라이버의 이름입니다. 이것은 `config/cache.php` 설정 파일의 `driver` 옵션에 해당합니다. 두 번째 인수는 `Illuminate\Cache\Repository` 인스턴스를 반환해야 하는 클로저입니다. 클로저에는 [서비스 컨테이너](/docs/{{version}}/container)의 인스턴스인 `$app` 인스턴스가 전달됩니다.

확장이 등록되면 `CACHE_STORE` 환경 변수 또는 애플리케이션의 `config/cache.php` 설정 파일 내의 `default` 옵션을 확장의 이름으로 업데이트합니다.

<a name="events"></a>
## 이벤트

모든 캐시 작업에서 코드를 실행하려면 캐시에서 디스패치되는 다양한 [이벤트](/docs/{{version}}/events)를 수신할 수 있습니다.

<div class="overflow-auto">

| 이벤트 이름                                   |
|----------------------------------------------|
| `Illuminate\Cache\Events\CacheFlushed`       |
| `Illuminate\Cache\Events\CacheFlushing`      |
| `Illuminate\Cache\Events\CacheHit`           |
| `Illuminate\Cache\Events\CacheMissed`        |
| `Illuminate\Cache\Events\ForgettingKey`      |
| `Illuminate\Cache\Events\KeyForgetFailed`    |
| `Illuminate\Cache\Events\KeyForgotten`       |
| `Illuminate\Cache\Events\KeyWriteFailed`     |
| `Illuminate\Cache\Events\KeyWritten`         |
| `Illuminate\Cache\Events\RetrievingKey`      |
| `Illuminate\Cache\Events\RetrievingManyKeys` |
| `Illuminate\Cache\Events\WritingKey`         |
| `Illuminate\Cache\Events\WritingManyKeys`    |

</div>

성능을 향상시키려면 애플리케이션의 `config/cache.php` 설정 파일에서 특정 캐시 저장소에 대해 `events` 설정 옵션을 `false`로 설정하여 캐시 이벤트를 비활성화할 수 있습니다.

```php
'database' => [
    'driver' => 'database',
    // ...
    'events' => false,
],
```

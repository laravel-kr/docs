# Eloquent: 시작하기

- [소개](#introduction)
- [모델 클래스 생성하기](#generating-model-classes)
- [Eloquent 모델 규칙](#eloquent-model-conventions)
    - [테이블 이름](#table-names)
    - [기본 키](#primary-keys)
    - [UUID 및 ULID 키](#uuid-and-ulid-keys)
    - [타임스탬프](#timestamps)
    - [데이터베이스 연결](#database-connections)
    - [기본 속성 값](#default-attribute-values)
    - [Eloquent 엄격 모드 설정](#configuring-eloquent-strictness)
- [모델 조회하기](#retrieving-models)
    - [컬렉션](#collections)
    - [결과 청킹](#chunking-results)
    - [지연 컬렉션을 사용한 청킹](#chunking-using-lazy-collections)
    - [커서](#cursors)
    - [고급 서브쿼리](#advanced-subqueries)
- [단일 모델 / 집계 조회하기](#retrieving-single-models)
    - [모델 조회 또는 생성하기](#retrieving-or-creating-models)
    - [집계 조회하기](#retrieving-aggregates)
- [모델 삽입 및 수정하기](#inserting-and-updating-models)
    - [삽입](#inserts)
    - [수정](#updates)
    - [대량 할당](#mass-assignment)
    - [Upserts](#upserts)
- [모델 삭제하기](#deleting-models)
    - [소프트 삭제](#soft-deleting)
    - [소프트 삭제된 모델 쿼리하기](#querying-soft-deleted-models)
- [모델 정리하기](#pruning-models)
- [모델 복제하기](#replicating-models)
- [쿼리 스코프](#query-scopes)
    - [글로벌 스코프](#global-scopes)
    - [로컬 스코프](#local-scopes)
    - [보류 속성](#pending-attributes)
- [모델 비교하기](#comparing-models)
- [이벤트](#events)
    - [클로저 사용하기](#events-using-closures)
    - [옵저버](#observers)
    - [이벤트 음소거](#muting-events)

<a name="introduction"></a>
## 소개

Laravel에는 데이터베이스와 즐겁게 상호작용할 수 있게 해주는 객체-관계 매퍼(ORM)인 Eloquent가 포함되어 있습니다. Eloquent를 사용할 때 각 데이터베이스 테이블에는 해당 테이블과 상호작용하는 데 사용되는 "모델(Model)"이 있습니다. Eloquent 모델은 데이터베이스 테이블에서 레코드를 조회하는 것 외에도 테이블에 레코드를 삽입, 수정, 삭제할 수 있습니다.

> [!NOTE]
> 시작하기 전에 애플리케이션의 `config/database.php` 설정 파일에서 데이터베이스 연결을 구성해야 합니다. 데이터베이스 구성에 대한 자세한 내용은 [데이터베이스 설정 문서](/docs/{{version}}/database#configuration)를 확인하세요.

#### Laravel Bootcamp

Laravel이 처음이라면 [Laravel Bootcamp](https://bootcamp.laravel.com)에 참여해 보세요. Laravel Bootcamp는 Eloquent를 사용하여 첫 번째 Laravel 애플리케이션을 구축하는 과정을 안내합니다. Laravel과 Eloquent가 제공하는 모든 것을 둘러볼 수 있는 좋은 방법입니다.

<a name="generating-model-classes"></a>
## 모델 클래스 생성하기

시작하려면 Eloquent 모델을 생성해 봅시다. 모델은 일반적으로 `app\Models` 디렉터리에 위치하며 `Illuminate\Database\Eloquent\Model` 클래스를 확장합니다. `make:model` [Artisan 명령어](/docs/{{version}}/artisan)를 사용하여 새 모델을 생성할 수 있습니다.

```shell
php artisan make:model Flight
```

모델을 생성할 때 [데이터베이스 마이그레이션](/docs/{{version}}/migrations)도 함께 생성하려면 `--migration` 또는 `-m` 옵션을 사용할 수 있습니다.

```shell
php artisan make:model Flight --migration
```

모델을 생성할 때 팩토리, 시더, 정책, 컨트롤러, 폼 리퀘스트 등 다양한 유형의 클래스를 생성할 수 있습니다. 또한 이러한 옵션을 결합하여 한 번에 여러 클래스를 생성할 수 있습니다.

```shell
# 모델과 FlightFactory 클래스 생성...
php artisan make:model Flight --factory
php artisan make:model Flight -f

# 모델과 FlightSeeder 클래스 생성...
php artisan make:model Flight --seed
php artisan make:model Flight -s

# 모델과 FlightController 클래스 생성...
php artisan make:model Flight --controller
php artisan make:model Flight -c

# 모델, FlightController 리소스 클래스, 폼 리퀘스트 클래스 생성...
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# 모델과 FlightPolicy 클래스 생성...
php artisan make:model Flight --policy

# 모델, 마이그레이션, 팩토리, 시더, 컨트롤러 생성...
php artisan make:model Flight -mfsc

# 모델, 마이그레이션, 팩토리, 시더, 정책, 컨트롤러, 폼 리퀘스트를 생성하는 단축 명령어...
php artisan make:model Flight --all
php artisan make:model Flight -a

# 피벗 모델 생성...
php artisan make:model Member --pivot
php artisan make:model Member -p
```

<a name="inspecting-models"></a>
#### 모델 검사하기

때때로 코드를 훑어보는 것만으로는 모델의 사용 가능한 모든 속성과 관계를 파악하기 어려울 수 있습니다. 대신 `model:show` Artisan 명령어를 사용해 보세요. 이 명령어는 모델의 모든 속성과 관계에 대한 편리한 개요를 제공합니다.

```shell
php artisan model:show Flight
```

<a name="eloquent-model-conventions"></a>
## Eloquent 모델 규칙

`make:model` 명령어로 생성된 모델은 `app/Models` 디렉터리에 배치됩니다. 기본 모델 클래스를 살펴보고 Eloquent의 주요 규칙에 대해 알아봅시다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    // ...
}
```

<a name="table-names"></a>
### 테이블 이름

위의 예제를 보면 Eloquent에게 어떤 데이터베이스 테이블이 `Flight` 모델에 해당하는지 알려주지 않았다는 것을 알 수 있습니다. 규칙에 따라 클래스 이름의 "스네이크 케이스(snake_case)" 복수형이 다른 이름이 명시적으로 지정되지 않는 한 테이블 이름으로 사용됩니다. 따라서 이 경우 Eloquent는 `Flight` 모델이 `flights` 테이블에 레코드를 저장한다고 가정하고, `AirTrafficController` 모델은 `air_traffic_controllers` 테이블에 레코드를 저장할 것입니다.

모델의 해당 데이터베이스 테이블이 이 규칙에 맞지 않는 경우 모델에 `table` 속성을 정의하여 모델의 테이블 이름을 수동으로 지정할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델과 연결된 테이블.
     *
     * @var string
     */
    protected $table = 'my_flights';
}
```

<a name="primary-keys"></a>
### 기본 키

Eloquent는 또한 각 모델의 해당 데이터베이스 테이블에 `id`라는 이름의 기본 키 컬럼이 있다고 가정합니다. 필요한 경우 모델에 보호된 `$primaryKey` 속성을 정의하여 모델의 기본 키로 사용할 다른 컬럼을 지정할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 테이블과 연결된 기본 키.
     *
     * @var string
     */
    protected $primaryKey = 'flight_id';
}
```

또한 Eloquent는 기본 키가 자동 증가하는 정수 값이라고 가정합니다. 이는 Eloquent가 자동으로 기본 키를 정수로 캐스팅한다는 것을 의미합니다. 자동 증가하지 않거나 숫자가 아닌 기본 키를 사용하려면 모델에 `false`로 설정된 공용 `$incrementing` 속성을 정의해야 합니다.

```php
<?php

class Flight extends Model
{
    /**
     * 모델의 ID가 자동 증가하는지 여부를 나타냅니다.
     *
     * @var bool
     */
    public $incrementing = false;
}
```

모델의 기본 키가 정수가 아닌 경우 모델에 보호된 `$keyType` 속성을 정의해야 합니다. 이 속성은 `string` 값을 가져야 합니다.

```php
<?php

class Flight extends Model
{
    /**
     * 기본 키 ID의 데이터 타입.
     *
     * @var string
     */
    protected $keyType = 'string';
}
```

<a name="composite-primary-keys"></a>
#### "복합(Composite)" 기본 키

Eloquent는 각 모델에 기본 키로 사용할 수 있는 고유하게 식별하는 "ID"가 하나 이상 있어야 합니다. "복합" 기본 키는 Eloquent 모델에서 지원되지 않습니다. 그러나 테이블의 고유하게 식별하는 기본 키 외에도 데이터베이스 테이블에 추가적인 다중 컬럼 고유 인덱스를 자유롭게 추가할 수 있습니다.

<a name="uuid-and-ulid-keys"></a>
### UUID 및 ULID 키

Eloquent 모델의 기본 키로 자동 증가하는 정수를 사용하는 대신 UUID를 사용할 수 있습니다. UUID는 36자 길이의 범용 고유 영숫자 식별자입니다.

모델이 자동 증가하는 정수 키 대신 UUID 키를 사용하도록 하려면 모델에 `Illuminate\Database\Eloquent\Concerns\HasUuids` 트레이트를 사용할 수 있습니다. 물론 모델에 [UUID에 해당하는 기본 키 컬럼](/docs/{{version}}/migrations#column-method-uuid)이 있는지 확인해야 합니다.

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUuids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Europe']);

$article->id; // "8f8e8478-9035-4d23-b9a7-62f4d2612ce5"
```

기본적으로 `HasUuids` 트레이트는 모델에 대해 ["정렬된" UUID](/docs/{{version}}/strings#method-str-ordered-uuid)를 생성합니다. 이러한 UUID는 사전순으로 정렬할 수 있기 때문에 인덱싱된 데이터베이스 저장에 더 효율적입니다.

모델에 `newUniqueId` 메서드를 정의하여 특정 모델의 UUID 생성 프로세스를 재정의할 수 있습니다. 또한 모델에 `uniqueIds` 메서드를 정의하여 UUID를 받아야 하는 컬럼을 지정할 수 있습니다.

```php
use Ramsey\Uuid\Uuid;

/**
 * 모델에 대한 새 UUID를 생성합니다.
 */
public function newUniqueId(): string
{
    return (string) Uuid::uuid4();
}

/**
 * 고유 식별자를 받아야 하는 컬럼을 가져옵니다.
 *
 * @return array<int, string>
 */
public function uniqueIds(): array
{
    return ['id', 'discount_code'];
}
```

원한다면 UUID 대신 "ULID"를 사용할 수 있습니다. ULID는 UUID와 유사하지만 26자 길이입니다. 정렬된 UUID처럼 ULID는 효율적인 데이터베이스 인덱싱을 위해 사전순으로 정렬할 수 있습니다. ULID를 사용하려면 모델에 `Illuminate\Database\Eloquent\Concerns\HasUlids` 트레이트를 사용해야 합니다. 또한 모델에 [ULID에 해당하는 기본 키 컬럼](/docs/{{version}}/migrations#column-method-ulid)이 있는지 확인해야 합니다.

```php
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUlids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Asia']);

$article->id; // "01gd4d3tgrrfqeda94gdbtdk5c"
```

<a name="timestamps"></a>
### 타임스탬프

기본적으로 Eloquent는 모델의 해당 데이터베이스 테이블에 `created_at`과 `updated_at` 컬럼이 있을 것으로 예상합니다. Eloquent는 모델이 생성되거나 수정될 때 이 컬럼의 값을 자동으로 설정합니다. 이러한 컬럼이 Eloquent에 의해 자동으로 관리되지 않도록 하려면 모델에 `false` 값을 가진 `$timestamps` 속성을 정의해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델에 타임스탬프를 사용할지 여부를 나타냅니다.
     *
     * @var bool
     */
    public $timestamps = false;
}
```

모델의 타임스탬프 형식을 사용자 정의해야 하는 경우 모델에 `$dateFormat` 속성을 설정하세요. 이 속성은 데이터베이스에 날짜 속성이 저장되는 방식과 모델이 배열이나 JSON으로 직렬화될 때의 형식을 결정합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델의 날짜 컬럼 저장 형식.
     *
     * @var string
     */
    protected $dateFormat = 'U';
}
```

타임스탬프를 저장하는 데 사용되는 컬럼 이름을 사용자 정의해야 하는 경우 모델에 `CREATED_AT` 및 `UPDATED_AT` 상수를 정의할 수 있습니다.

```php
<?php

class Flight extends Model
{
    const CREATED_AT = 'creation_date';
    const UPDATED_AT = 'updated_date';
}
```

모델의 `updated_at` 타임스탬프가 수정되지 않도록 모델 작업을 수행하려면 `withoutTimestamps` 메서드에 전달된 클로저 내에서 모델을 조작할 수 있습니다.

```php
Model::withoutTimestamps(fn () => $post->increment('reads'));
```

<a name="database-connections"></a>
### 데이터베이스 연결

기본적으로 모든 Eloquent 모델은 애플리케이션에 구성된 기본 데이터베이스 연결을 사용합니다. 특정 모델과 상호작용할 때 사용할 다른 연결을 지정하려면 모델에 `$connection` 속성을 정의해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 모델에서 사용할 데이터베이스 연결.
     *
     * @var string
     */
    protected $connection = 'mysql';
}
```

<a name="default-attribute-values"></a>
### 기본 속성 값

기본적으로 새로 인스턴스화된 모델 인스턴스에는 속성 값이 포함되지 않습니다. 모델의 일부 속성에 대한 기본값을 정의하려면 모델에 `$attributes` 속성을 정의할 수 있습니다. `$attributes` 배열에 배치된 속성 값은 데이터베이스에서 읽은 것처럼 원시 "저장 가능한" 형식이어야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 속성의 모델 기본값.
     *
     * @var array
     */
    protected $attributes = [
        'options' => '[]',
        'delayed' => false,
    ];
}
```

<a name="configuring-eloquent-strictness"></a>
### Eloquent 엄격 모드 설정

Laravel은 다양한 상황에서 Eloquent의 동작과 "엄격성"을 구성할 수 있는 여러 메서드를 제공합니다.

먼저 `preventLazyLoading` 메서드는 지연 로딩을 방지해야 하는지 여부를 나타내는 선택적 불리언 인자를 받습니다. 예를 들어 프로덕션 코드에 실수로 지연 로딩된 관계가 있더라도 프로덕션 환경이 정상적으로 작동할 수 있도록 비프로덕션 환경에서만 지연 로딩을 비활성화할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출되어야 합니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

또한 `preventSilentlyDiscardingAttributes` 메서드를 호출하여 채울 수 없는 속성을 채우려고 할 때 Laravel이 예외를 throw하도록 지시할 수 있습니다. 이는 로컬 개발 중에 모델의 `fillable` 배열에 추가되지 않은 속성을 설정하려고 할 때 예기치 않은 오류를 방지하는 데 도움이 될 수 있습니다.

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

<a name="retrieving-models"></a>
## 모델 조회하기

모델과 [연결된 데이터베이스 테이블](/docs/{{version}}/migrations#generating-migrations)을 생성했으면 데이터베이스에서 데이터를 조회할 준비가 된 것입니다. 각 Eloquent 모델을 모델과 연결된 데이터베이스 테이블을 유연하게 쿼리할 수 있는 강력한 [쿼리 빌더](/docs/{{version}}/queries)로 생각할 수 있습니다. 모델의 `all` 메서드는 모델의 연결된 데이터베이스 테이블에서 모든 레코드를 조회합니다.

```php
use App\Models\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

<a name="building-queries"></a>
#### 쿼리 작성하기

Eloquent `all` 메서드는 모델 테이블의 모든 결과를 반환합니다. 그러나 각 Eloquent 모델은 [쿼리 빌더](/docs/{{version}}/queries) 역할을 하므로 쿼리에 추가 제약 조건을 추가한 다음 `get` 메서드를 호출하여 결과를 조회할 수 있습니다.

```php
$flights = Flight::where('active', 1)
    ->orderBy('name')
    ->take(10)
    ->get();
```

> [!NOTE]
> Eloquent 모델은 쿼리 빌더이므로 Laravel의 [쿼리 빌더](/docs/{{version}}/queries)가 제공하는 모든 메서드를 검토해야 합니다. Eloquent 쿼리를 작성할 때 이러한 메서드를 모두 사용할 수 있습니다.

<a name="refreshing-models"></a>
#### 모델 새로고침

데이터베이스에서 조회한 Eloquent 모델의 인스턴스가 이미 있는 경우 `fresh` 및 `refresh` 메서드를 사용하여 모델을 "새로고침"할 수 있습니다. `fresh` 메서드는 데이터베이스에서 모델을 다시 조회합니다. 기존 모델 인스턴스는 영향을 받지 않습니다.

```php
$flight = Flight::where('number', 'FR 900')->first();

$freshFlight = $flight->fresh();
```

`refresh` 메서드는 데이터베이스의 최신 데이터를 사용하여 기존 모델을 다시 채웁니다. 또한 로드된 모든 관계도 새로고침됩니다.

```php
$flight = Flight::where('number', 'FR 900')->first();

$flight->number = 'FR 456';

$flight->refresh();

$flight->number; // "FR 900"
```

<a name="collections"></a>
### 컬렉션

보았듯이 `all` 및 `get`과 같은 Eloquent 메서드는 데이터베이스에서 여러 레코드를 조회합니다. 그러나 이러한 메서드는 일반 PHP 배열을 반환하지 않습니다. 대신 `Illuminate\Database\Eloquent\Collection`의 인스턴스가 반환됩니다.

Eloquent `Collection` 클래스는 데이터 컬렉션과 상호작용하기 위한 [다양한 유용한 메서드](/docs/{{version}}/collections#available-methods)를 제공하는 Laravel의 기본 `Illuminate\Support\Collection` 클래스를 확장합니다. 예를 들어 `reject` 메서드를 사용하여 호출된 클로저의 결과에 따라 컬렉션에서 모델을 제거할 수 있습니다.

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

Laravel의 기본 컬렉션 클래스에서 제공하는 메서드 외에도 Eloquent 컬렉션 클래스는 Eloquent 모델 컬렉션과 상호작용하기 위해 특별히 의도된 [몇 가지 추가 메서드](/docs/{{version}}/eloquent-collections#available-methods)를 제공합니다.

Laravel의 모든 컬렉션은 PHP의 iterable 인터페이스를 구현하므로 배열처럼 컬렉션을 반복할 수 있습니다.

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### 결과 청킹

`all` 또는 `get` 메서드를 통해 수만 개의 Eloquent 레코드를 로드하려고 하면 애플리케이션의 메모리가 부족해질 수 있습니다. 이러한 메서드를 사용하는 대신 `chunk` 메서드를 사용하여 대량의 모델을 더 효율적으로 처리할 수 있습니다.

`chunk` 메서드는 Eloquent 모델의 하위 집합을 조회하여 처리를 위해 클로저에 전달합니다. 현재 청크의 Eloquent 모델만 한 번에 조회되므로 `chunk` 메서드는 대량의 모델을 작업할 때 메모리 사용량을 크게 줄여줍니다.

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

`chunk` 메서드에 전달된 첫 번째 인자는 "청크"당 받을 레코드 수입니다. 두 번째 인자로 전달된 클로저는 데이터베이스에서 조회된 각 청크에 대해 호출됩니다. 클로저에 전달된 레코드 청크를 조회하기 위해 데이터베이스 쿼리가 실행됩니다.

결과를 반복하면서 수정할 컬럼을 기반으로 `chunk` 메서드의 결과를 필터링하는 경우 `chunkById` 메서드를 사용해야 합니다. 이러한 시나리오에서 `chunk` 메서드를 사용하면 예기치 않고 일관되지 않은 결과가 발생할 수 있습니다. 내부적으로 `chunkById` 메서드는 항상 이전 청크의 마지막 모델보다 큰 `id` 컬럼을 가진 모델을 조회합니다.

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, column: 'id');
```

`chunkById` 및 `lazyById` 메서드는 실행 중인 쿼리에 자체 "where" 조건을 추가하므로 일반적으로 클로저 내에서 조건을 [논리적으로 그룹화](/docs/{{version}}/queries#logical-grouping)해야 합니다.

```php
Flight::where(function ($query) {
    $query->where('delayed', true)->orWhere('cancelled', true);
})->chunkById(200, function (Collection $flights) {
    $flights->each->update([
        'departed' => false,
        'cancelled' => true
    ]);
}, column: 'id');
```

<a name="chunking-using-lazy-collections"></a>
### 지연 컬렉션을 사용한 청킹

`lazy` 메서드는 내부적으로 청크 단위로 쿼리를 실행한다는 점에서 [`chunk` 메서드](#chunking-results)와 유사하게 작동합니다. 그러나 각 청크를 콜백에 직접 전달하는 대신 `lazy` 메서드는 Eloquent 모델의 평탄화된 [`LazyCollection`](/docs/{{version}}/collections#lazy-collections)을 반환하여 결과를 단일 스트림으로 상호작용할 수 있게 합니다.

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    // ...
}
```

결과를 반복하면서 수정할 컬럼을 기반으로 `lazy` 메서드의 결과를 필터링하는 경우 `lazyById` 메서드를 사용해야 합니다. 내부적으로 `lazyById` 메서드는 항상 이전 청크의 마지막 모델보다 큰 `id` 컬럼을 가진 모델을 조회합니다.

```php
Flight::where('departed', true)
    ->lazyById(200, column: 'id')
    ->each->update(['departed' => false]);
```

`lazyByIdDesc` 메서드를 사용하여 `id`의 내림차순을 기준으로 결과를 필터링할 수 있습니다.

<a name="cursors"></a>
### 커서

`lazy` 메서드와 유사하게 `cursor` 메서드는 수만 개의 Eloquent 모델 레코드를 반복할 때 애플리케이션의 메모리 소비를 크게 줄이는 데 사용할 수 있습니다.

`cursor` 메서드는 단일 데이터베이스 쿼리만 실행합니다. 그러나 개별 Eloquent 모델은 실제로 반복될 때까지 하이드레이션(hydrate)되지 않습니다. 따라서 커서를 반복하는 동안 한 번에 하나의 Eloquent 모델만 메모리에 유지됩니다.

> [!WARNING]
> `cursor` 메서드는 한 번에 하나의 Eloquent 모델만 메모리에 유지하므로 관계를 즉시 로드할 수 없습니다. 관계를 즉시 로드해야 하는 경우 대신 [`lazy` 메서드](#chunking-using-lazy-collections)를 사용하는 것이 좋습니다.

내부적으로 `cursor` 메서드는 PHP [제너레이터](https://www.php.net/manual/en/language.generators.overview.php)를 사용하여 이 기능을 구현합니다.

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

`cursor`는 `Illuminate\Support\LazyCollection` 인스턴스를 반환합니다. [지연 컬렉션](/docs/{{version}}/collections#lazy-collections)을 사용하면 한 번에 하나의 모델만 메모리에 로드하면서 일반적인 Laravel 컬렉션에서 사용할 수 있는 많은 컬렉션 메서드를 사용할 수 있습니다.

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

`cursor` 메서드는 일반 쿼리보다 훨씬 적은 메모리를 사용하지만(한 번에 하나의 Eloquent 모델만 메모리에 유지) 결국 메모리가 부족해질 수 있습니다. 이는 [PHP의 PDO 드라이버가 내부적으로 모든 원시 쿼리 결과를 버퍼에 캐싱하기 때문](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php)입니다. 매우 많은 수의 Eloquent 레코드를 처리하는 경우 대신 [`lazy` 메서드](#chunking-using-lazy-collections)를 사용하는 것이 좋습니다.

<a name="advanced-subqueries"></a>
### 고급 서브쿼리

<a name="subquery-selects"></a>
#### 서브쿼리 Select

Eloquent는 단일 쿼리에서 관련 테이블의 정보를 가져올 수 있는 고급 서브쿼리 지원도 제공합니다. 예를 들어 항공편 `destinations` 테이블과 목적지로의 `flights` 테이블이 있다고 상상해 봅시다. `flights` 테이블에는 항공편이 목적지에 도착한 시간을 나타내는 `arrived_at` 컬럼이 있습니다.

쿼리 빌더의 `select` 및 `addSelect` 메서드에서 사용할 수 있는 서브쿼리 기능을 사용하면 단일 쿼리로 모든 `destinations`와 해당 목적지에 가장 최근에 도착한 항공편의 이름을 선택할 수 있습니다.

```php
use App\Models\Destination;
use App\Models\Flight;

return Destination::addSelect(['last_flight' => Flight::select('name')
    ->whereColumn('destination_id', 'destinations.id')
    ->orderByDesc('arrived_at')
    ->limit(1)
])->get();
```

<a name="subquery-ordering"></a>
#### 서브쿼리 정렬

또한 쿼리 빌더의 `orderBy` 함수는 서브쿼리를 지원합니다. 항공편 예제를 계속 사용하면 이 기능을 사용하여 마지막 항공편이 해당 목적지에 도착한 시간을 기준으로 모든 목적지를 정렬할 수 있습니다. 마찬가지로 이것은 단일 데이터베이스 쿼리를 실행하면서 수행할 수 있습니다.

```php
return Destination::orderByDesc(
    Flight::select('arrived_at')
        ->whereColumn('destination_id', 'destinations.id')
        ->orderByDesc('arrived_at')
        ->limit(1)
)->get();
```

<a name="retrieving-single-models"></a>
## 단일 모델 / 집계 조회하기

주어진 쿼리와 일치하는 모든 레코드를 조회하는 것 외에도 `find`, `first` 또는 `firstWhere` 메서드를 사용하여 단일 레코드를 조회할 수도 있습니다. 이러한 메서드는 모델 컬렉션을 반환하는 대신 단일 모델 인스턴스를 반환합니다.

```php
use App\Models\Flight;

// 기본 키로 모델 조회...
$flight = Flight::find(1);

// 쿼리 제약 조건과 일치하는 첫 번째 모델 조회...
$flight = Flight::where('active', 1)->first();

// 쿼리 제약 조건과 일치하는 첫 번째 모델 조회의 대안...
$flight = Flight::firstWhere('active', 1);
```

때때로 결과가 없는 경우 다른 작업을 수행하고 싶을 수 있습니다. `findOr` 및 `firstOr` 메서드는 단일 모델 인스턴스를 반환하거나 결과가 없으면 주어진 클로저를 실행합니다. 클로저에서 반환된 값은 메서드의 결과로 간주됩니다.

```php
$flight = Flight::findOr(1, function () {
    // ...
});

$flight = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
});
```

<a name="not-found-exceptions"></a>
#### Not Found 예외

때때로 모델을 찾을 수 없는 경우 예외를 throw하고 싶을 수 있습니다. 이는 라우트나 컨트롤러에서 특히 유용합니다. `findOrFail` 및 `firstOrFail` 메서드는 쿼리의 첫 번째 결과를 조회합니다. 그러나 결과가 없으면 `Illuminate\Database\Eloquent\ModelNotFoundException`이 throw됩니다.

```php
$flight = Flight::findOrFail(1);

$flight = Flight::where('legs', '>', 3)->firstOrFail();
```

`ModelNotFoundException`이 잡히지 않으면 404 HTTP 응답이 자동으로 클라이언트에 다시 전송됩니다.

```php
use App\Models\Flight;

Route::get('/api/flights/{id}', function (string $id) {
    return Flight::findOrFail($id);
});
```

<a name="retrieving-or-creating-models"></a>
### 모델 조회 또는 생성하기

`firstOrCreate` 메서드는 주어진 컬럼/값 쌍을 사용하여 데이터베이스 레코드를 찾으려고 시도합니다. 모델이 데이터베이스에서 찾을 수 없으면 첫 번째 배열 인자와 선택적 두 번째 배열 인자를 병합한 속성으로 레코드가 삽입됩니다.

`firstOrNew` 메서드는 `firstOrCreate`와 마찬가지로 주어진 속성과 일치하는 데이터베이스의 레코드를 찾으려고 시도합니다. 그러나 모델을 찾을 수 없으면 새 모델 인스턴스가 반환됩니다. `firstOrNew`가 반환하는 모델은 아직 데이터베이스에 저장되지 않았습니다. 저장하려면 `save` 메서드를 수동으로 호출해야 합니다.

```php
use App\Models\Flight;

// 이름으로 항공편 조회 또는 없으면 생성...
$flight = Flight::firstOrCreate([
    'name' => 'London to Paris'
]);

// 이름으로 항공편 조회 또는 이름, delayed, arrival_time 속성으로 생성...
$flight = Flight::firstOrCreate(
    ['name' => 'London to Paris'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);

// 이름으로 항공편 조회 또는 새 Flight 인스턴스 인스턴스화...
$flight = Flight::firstOrNew([
    'name' => 'London to Paris'
]);

// 이름으로 항공편 조회 또는 이름, delayed, arrival_time 속성으로 인스턴스화...
$flight = Flight::firstOrNew(
    ['name' => 'Tokyo to Sydney'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);
```

<a name="retrieving-aggregates"></a>
### 집계 조회하기

Eloquent 모델과 상호작용할 때 Laravel [쿼리 빌더](/docs/{{version}}/queries)가 제공하는 `count`, `sum`, `max` 및 기타 [집계 메서드](/docs/{{version}}/queries#aggregates)도 사용할 수 있습니다. 예상대로 이러한 메서드는 Eloquent 모델 인스턴스 대신 스칼라 값을 반환합니다.

```php
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## 모델 삽입 및 수정하기

<a name="inserts"></a>
### 삽입

물론 Eloquent를 사용할 때 데이터베이스에서 모델을 조회하는 것만 필요한 것은 아닙니다. 새 레코드를 삽입해야 할 때도 있습니다. 다행히 Eloquent는 이를 간단하게 만듭니다. 데이터베이스에 새 레코드를 삽입하려면 새 모델 인스턴스를 인스턴스화하고 모델에 속성을 설정해야 합니다. 그런 다음 모델 인스턴스에서 `save` 메서드를 호출합니다.

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * 데이터베이스에 새 항공편을 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        // 요청 유효성 검사...

        $flight = new Flight;

        $flight->name = $request->name;

        $flight->save();

        return redirect('/flights');
    }
}
```

이 예제에서는 들어오는 HTTP 요청의 `name` 필드를 `App\Models\Flight` 모델 인스턴스의 `name` 속성에 할당합니다. `save` 메서드를 호출하면 레코드가 데이터베이스에 삽입됩니다. 모델의 `created_at` 및 `updated_at` 타임스탬프는 `save` 메서드가 호출될 때 자동으로 설정되므로 수동으로 설정할 필요가 없습니다.

또는 `create` 메서드를 사용하여 단일 PHP 문으로 새 모델을 "저장"할 수 있습니다. 삽입된 모델 인스턴스는 `create` 메서드에 의해 반환됩니다.

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

그러나 `create` 메서드를 사용하기 전에 모델 클래스에 `fillable` 또는 `guarded` 속성을 지정해야 합니다. 모든 Eloquent 모델은 기본적으로 대량 할당 취약성으로부터 보호되기 때문에 이러한 속성이 필요합니다. 대량 할당에 대해 자세히 알아보려면 [대량 할당 문서](#mass-assignment)를 참조하세요.

<a name="updates"></a>
### 수정

`save` 메서드는 데이터베이스에 이미 존재하는 모델을 수정하는 데도 사용할 수 있습니다. 모델을 수정하려면 모델을 조회하고 수정하려는 속성을 설정해야 합니다. 그런 다음 모델의 `save` 메서드를 호출합니다. 다시 말하지만 `updated_at` 타임스탬프는 자동으로 수정되므로 수동으로 값을 설정할 필요가 없습니다.

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->name = 'Paris to London';

$flight->save();
```

때때로 기존 모델을 수정하거나 일치하는 모델이 없으면 새 모델을 생성해야 할 수 있습니다. `firstOrCreate` 메서드처럼 `updateOrCreate` 메서드는 모델을 저장하므로 `save` 메서드를 수동으로 호출할 필요가 없습니다.

아래 예제에서 `departure` 위치가 `Oakland`이고 `destination` 위치가 `San Diego`인 항공편이 있으면 `price` 및 `discounted` 컬럼이 수정됩니다. 해당 항공편이 없으면 첫 번째 인자 배열과 두 번째 인자 배열을 병합한 속성을 가진 새 항공편이 생성됩니다.

```php
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

<a name="mass-updates"></a>
#### 대량 수정

주어진 쿼리와 일치하는 모델에 대해서도 수정을 수행할 수 있습니다. 이 예제에서는 `active`이고 `destination`이 `San Diego`인 모든 항공편이 지연으로 표시됩니다.

```php
Flight::where('active', 1)
    ->where('destination', 'San Diego')
    ->update(['delayed' => 1]);
```

`update` 메서드는 수정해야 하는 컬럼을 나타내는 컬럼 및 값 쌍의 배열을 예상합니다. `update` 메서드는 영향을 받은 행 수를 반환합니다.

> [!WARNING]
> Eloquent를 통해 대량 수정을 실행할 때 수정된 모델에 대해 `saving`, `saved`, `updating`, `updated` 모델 이벤트가 발생하지 않습니다. 이는 대량 수정을 실행할 때 모델이 실제로 조회되지 않기 때문입니다.

<a name="examining-attribute-changes"></a>
#### 속성 변경 사항 검사

Eloquent는 모델의 내부 상태를 검사하고 모델이 원래 조회되었을 때부터 속성이 어떻게 변경되었는지 확인하기 위해 `isDirty`, `isClean`, `wasChanged` 메서드를 제공합니다.

`isDirty` 메서드는 모델이 조회된 이후 모델의 속성이 변경되었는지 여부를 확인합니다. 특정 속성 이름이나 속성 배열을 `isDirty` 메서드에 전달하여 해당 속성이 "더티"인지 확인할 수 있습니다. `isClean` 메서드는 모델이 조회된 이후 속성이 변경되지 않았는지 확인합니다. 이 메서드도 선택적 속성 인자를 받습니다.

```php
use App\Models\User;

$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->isDirty(); // true
$user->isDirty('title'); // true
$user->isDirty('first_name'); // false
$user->isDirty(['first_name', 'title']); // true

$user->isClean(); // false
$user->isClean('title'); // false
$user->isClean('first_name'); // true
$user->isClean(['first_name', 'title']); // false

$user->save();

$user->isDirty(); // false
$user->isClean(); // true
```

`wasChanged` 메서드는 현재 요청 사이클 내에서 모델이 마지막으로 저장되었을 때 속성이 변경되었는지 여부를 확인합니다. 필요한 경우 특정 속성이 변경되었는지 확인하기 위해 속성 이름을 전달할 수 있습니다.

```php
$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->save();

$user->wasChanged(); // true
$user->wasChanged('title'); // true
$user->wasChanged(['title', 'slug']); // true
$user->wasChanged('first_name'); // false
$user->wasChanged(['first_name', 'title']); // true
```

`getOriginal` 메서드는 모델이 조회된 이후의 변경 사항에 관계없이 모델의 원래 속성을 포함하는 배열을 반환합니다. 필요한 경우 특정 속성의 원래 값을 얻기 위해 특정 속성 이름을 전달할 수 있습니다.

```php
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->name = "Jack";
$user->name; // Jack

$user->getOriginal('name'); // John
$user->getOriginal(); // 원래 속성 배열...
```

<a name="mass-assignment"></a>
### 대량 할당

`create` 메서드를 사용하여 단일 PHP 문으로 새 모델을 "저장"할 수 있습니다. 삽입된 모델 인스턴스는 메서드에 의해 반환됩니다.

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

그러나 `create` 메서드를 사용하기 전에 모델 클래스에 `fillable` 또는 `guarded` 속성을 지정해야 합니다. 모든 Eloquent 모델은 기본적으로 대량 할당 취약성으로부터 보호되기 때문에 이러한 속성이 필요합니다.

대량 할당 취약성은 사용자가 예기치 않은 HTTP 요청 필드를 전달하고 해당 필드가 예상하지 못한 데이터베이스 컬럼을 변경할 때 발생합니다. 예를 들어 악의적인 사용자가 HTTP 요청을 통해 `is_admin` 매개변수를 전송하고 이것이 모델의 `create` 메서드에 전달되면 사용자가 자신을 관리자로 승격할 수 있습니다.

따라서 시작하려면 대량 할당 가능하게 만들 모델 속성을 정의해야 합니다. 모델의 `$fillable` 속성을 사용하여 이를 수행할 수 있습니다. 예를 들어 `Flight` 모델의 `name` 속성을 대량 할당 가능하게 만들어 봅시다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * 대량 할당 가능한 속성.
     *
     * @var array<int, string>
     */
    protected $fillable = ['name'];
}
```

대량 할당 가능한 속성을 지정했으면 `create` 메서드를 사용하여 데이터베이스에 새 레코드를 삽입할 수 있습니다. `create` 메서드는 새로 생성된 모델 인스턴스를 반환합니다.

```php
$flight = Flight::create(['name' => 'London to Paris']);
```

이미 모델 인스턴스가 있는 경우 `fill` 메서드를 사용하여 속성 배열로 채울 수 있습니다.

```php
$flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### 대량 할당 및 JSON 컬럼

JSON 컬럼을 할당할 때 각 컬럼의 대량 할당 가능한 키를 모델의 `$fillable` 배열에 지정해야 합니다. 보안을 위해 Laravel은 `guarded` 속성을 사용할 때 중첩된 JSON 속성 수정을 지원하지 않습니다.

```php
/**
 * 대량 할당 가능한 속성.
 *
 * @var array<int, string>
 */
protected $fillable = [
    'options->enabled',
];
```

<a name="allowing-mass-assignment"></a>
#### 대량 할당 허용하기

모든 속성을 대량 할당 가능하게 만들려면 모델의 `$guarded` 속성을 빈 배열로 정의할 수 있습니다. 모델의 가드를 해제하기로 선택한 경우 Eloquent의 `fill`, `create`, `update` 메서드에 전달되는 배열을 항상 직접 만들도록 특별히 주의해야 합니다.

```php
/**
 * 대량 할당 불가능한 속성.
 *
 * @var array<string>|bool
 */
protected $guarded = [];
```

<a name="mass-assignment-exceptions"></a>
#### 대량 할당 예외

기본적으로 `$fillable` 배열에 포함되지 않은 속성은 대량 할당 작업을 수행할 때 조용히 삭제됩니다. 프로덕션에서는 이것이 예상되는 동작입니다. 그러나 로컬 개발 중에는 모델 변경 사항이 적용되지 않는 이유에 대해 혼란을 초래할 수 있습니다.

원한다면 `preventSilentlyDiscardingAttributes` 메서드를 호출하여 채울 수 없는 속성을 채우려고 할 때 Laravel이 예외를 throw하도록 지시할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출되어야 합니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
}
```

<a name="upserts"></a>
### Upserts

Eloquent의 `upsert` 메서드는 단일 원자적 작업으로 레코드를 수정하거나 생성하는 데 사용할 수 있습니다. 메서드의 첫 번째 인자는 삽입하거나 수정할 값으로 구성되고, 두 번째 인자는 연결된 테이블 내에서 레코드를 고유하게 식별하는 컬럼을 나열합니다. 메서드의 세 번째이자 마지막 인자는 일치하는 레코드가 데이터베이스에 이미 있는 경우 수정해야 하는 컬럼의 배열입니다. `upsert` 메서드는 모델에서 타임스탬프가 활성화되어 있으면 자동으로 `created_at` 및 `updated_at` 타임스탬프를 설정합니다.

```php
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], uniqueBy: ['departure', 'destination'], update: ['price']);
```

> [!WARNING]
> SQL Server를 제외한 모든 데이터베이스는 `upsert` 메서드의 두 번째 인자에 있는 컬럼에 "primary" 또는 "unique" 인덱스가 있어야 합니다. 또한 MariaDB 및 MySQL 데이터베이스 드라이버는 `upsert` 메서드의 두 번째 인자를 무시하고 항상 테이블의 "primary" 및 "unique" 인덱스를 사용하여 기존 레코드를 감지합니다.

<a name="deleting-models"></a>
## 모델 삭제하기

모델을 삭제하려면 모델 인스턴스에서 `delete` 메서드를 호출할 수 있습니다.

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->delete();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### 기본 키로 기존 모델 삭제하기

위의 예제에서는 `delete` 메서드를 호출하기 전에 데이터베이스에서 모델을 조회합니다. 그러나 모델의 기본 키를 알고 있다면 명시적으로 조회하지 않고 `destroy` 메서드를 호출하여 모델을 삭제할 수 있습니다.  `destroy` 메서드는 단일 기본 키를 받는 것 외에도 여러 기본 키, 기본 키 배열 또는 기본 키 [컬렉션](/docs/{{version}}/collections)을 받습니다.

```php
Flight::destroy(1);

Flight::destroy(1, 2, 3);

Flight::destroy([1, 2, 3]);

Flight::destroy(collect([1, 2, 3]));
```

[소프트 삭제 모델](#soft-deleting)을 사용하는 경우 `forceDestroy` 메서드를 통해 모델을 영구적으로 삭제할 수 있습니다.

```php
Flight::forceDestroy(1);
```

> [!WARNING]
> `destroy` 메서드는 각 모델을 개별적으로 로드하고 `delete` 메서드를 호출하여 각 모델에 대해 `deleting` 및 `deleted` 이벤트가 올바르게 디스패치되도록 합니다.

<a name="deleting-models-using-queries"></a>
#### 쿼리를 사용하여 모델 삭제하기

물론 쿼리의 기준과 일치하는 모든 모델을 삭제하기 위해 Eloquent 쿼리를 작성할 수 있습니다. 이 예제에서는 비활성으로 표시된 모든 항공편을 삭제합니다. 대량 수정과 마찬가지로 대량 삭제는 삭제된 모델에 대해 모델 이벤트를 디스패치하지 않습니다.

```php
$deleted = Flight::where('active', 0)->delete();
```

테이블의 모든 모델을 삭제하려면 조건을 추가하지 않고 쿼리를 실행해야 합니다.

```php
$deleted = Flight::query()->delete();
```

> [!WARNING]
> Eloquent를 통해 대량 삭제 문을 실행할 때 삭제된 모델에 대해 `deleting` 및 `deleted` 모델 이벤트가 디스패치되지 않습니다. 이는 삭제 문을 실행할 때 모델이 실제로 조회되지 않기 때문입니다.

<a name="soft-deleting"></a>
### 소프트 삭제

데이터베이스에서 실제로 레코드를 제거하는 것 외에도 Eloquent는 모델을 "소프트 삭제"할 수도 있습니다. 모델이 소프트 삭제되면 실제로 데이터베이스에서 제거되지 않습니다. 대신 모델이 "삭제된" 날짜와 시간을 나타내는 `deleted_at` 속성이 모델에 설정됩니다. 모델에 대한 소프트 삭제를 활성화하려면 모델에 `Illuminate\Database\Eloquent\SoftDeletes` 트레이트를 추가합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flight extends Model
{
    use SoftDeletes;
}
```

> [!NOTE]
> `SoftDeletes` 트레이트는 자동으로 `deleted_at` 속성을 `DateTime` / `Carbon` 인스턴스로 캐스팅합니다.

데이터베이스 테이블에 `deleted_at` 컬럼도 추가해야 합니다. Laravel [스키마 빌더](/docs/{{version}}/migrations)에는 이 컬럼을 생성하는 헬퍼 메서드가 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('flights', function (Blueprint $table) {
    $table->softDeletes();
});

Schema::table('flights', function (Blueprint $table) {
    $table->dropSoftDeletes();
});
```

이제 모델에서 `delete` 메서드를 호출하면 `deleted_at` 컬럼이 현재 날짜와 시간으로 설정됩니다. 그러나 모델의 데이터베이스 레코드는 테이블에 남아 있습니다. 소프트 삭제를 사용하는 모델을 쿼리하면 소프트 삭제된 모델은 자동으로 모든 쿼리 결과에서 제외됩니다.

주어진 모델 인스턴스가 소프트 삭제되었는지 확인하려면 `trashed` 메서드를 사용할 수 있습니다.

```php
if ($flight->trashed()) {
    // ...
}
```

<a name="restoring-soft-deleted-models"></a>
#### 소프트 삭제된 모델 복원하기

때때로 소프트 삭제된 모델을 "삭제 취소"하고 싶을 수 있습니다. 소프트 삭제된 모델을 복원하려면 모델 인스턴스에서 `restore` 메서드를 호출할 수 있습니다. `restore` 메서드는 모델의 `deleted_at` 컬럼을 `null`로 설정합니다.

```php
$flight->restore();
```

쿼리에서 `restore` 메서드를 사용하여 여러 모델을 복원할 수도 있습니다. 다른 "대량" 작업과 마찬가지로 복원된 모델에 대해 모델 이벤트가 디스패치되지 않습니다.

```php
Flight::withTrashed()
        ->where('airline_id', 1)
        ->restore();
```

`restore` 메서드는 [관계](/docs/{{version}}/eloquent-relationships) 쿼리를 작성할 때도 사용할 수 있습니다.

```php
$flight->history()->restore();
```

<a name="permanently-deleting-models"></a>
#### 모델 영구 삭제하기

때때로 데이터베이스에서 모델을 완전히 제거해야 할 수 있습니다. `forceDelete` 메서드를 사용하여 데이터베이스 테이블에서 소프트 삭제된 모델을 영구적으로 제거할 수 있습니다.

```php
$flight->forceDelete();
```

Eloquent 관계 쿼리를 작성할 때 `forceDelete` 메서드를 사용할 수도 있습니다.

```php
$flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>
### 소프트 삭제된 모델 쿼리하기

<a name="including-soft-deleted-models"></a>
#### 소프트 삭제된 모델 포함하기

위에서 언급했듯이 소프트 삭제된 모델은 쿼리 결과에서 자동으로 제외됩니다. 그러나 쿼리에서 `withTrashed` 메서드를 호출하여 소프트 삭제된 모델을 쿼리 결과에 강제로 포함시킬 수 있습니다.

```php
use App\Models\Flight;

$flights = Flight::withTrashed()
    ->where('account_id', 1)
    ->get();
```

`withTrashed` 메서드는 [관계](/docs/{{version}}/eloquent-relationships) 쿼리를 작성할 때도 호출할 수 있습니다.

```php
$flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>
#### 소프트 삭제된 모델만 조회하기

`onlyTrashed` 메서드는 소프트 삭제된 모델**만** 조회합니다.

```php
$flights = Flight::onlyTrashed()
    ->where('airline_id', 1)
    ->get();
```

<a name="pruning-models"></a>
## 모델 정리하기

때때로 더 이상 필요하지 않은 모델을 주기적으로 삭제하고 싶을 수 있습니다. 이를 위해 주기적으로 정리하려는 모델에 `Illuminate\Database\Eloquent\Prunable` 또는 `Illuminate\Database\Eloquent\MassPrunable` 트레이트를 추가할 수 있습니다. 모델에 트레이트 중 하나를 추가한 후 더 이상 필요하지 않은 모델을 확인하는 Eloquent 쿼리 빌더를 반환하는 `prunable` 메서드를 구현합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class Flight extends Model
{
    use Prunable;

    /**
     * 정리 가능한 모델 쿼리를 가져옵니다.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

모델을 `Prunable`로 표시하면 모델에 `pruning` 메서드도 정의할 수 있습니다. 이 메서드는 모델이 삭제되기 전에 호출됩니다. 이 메서드는 모델이 데이터베이스에서 영구적으로 제거되기 전에 저장된 파일과 같은 모델과 관련된 추가 리소스를 삭제하는 데 유용할 수 있습니다.

```php
/**
 * 정리를 위해 모델을 준비합니다.
 */
protected function pruning(): void
{
    // ...
}
```

정리 가능한 모델을 구성한 후 애플리케이션의 `routes/console.php` 파일에서 `model:prune` Artisan 명령어를 예약해야 합니다. 이 명령어가 실행되어야 하는 적절한 간격을 자유롭게 선택할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();
```

내부적으로 `model:prune` 명령어는 애플리케이션의 `app/Models` 디렉터리 내에서 "Prunable" 모델을 자동으로 감지합니다. 모델이 다른 위치에 있는 경우 `--model` 옵션을 사용하여 모델 클래스 이름을 지정할 수 있습니다.

```php
Schedule::command('model:prune', [
    '--model' => [Address::class, Flight::class],
])->daily();
```

다른 모든 감지된 모델을 정리하면서 특정 모델을 정리에서 제외하려면 `--except` 옵션을 사용할 수 있습니다.

```php
Schedule::command('model:prune', [
    '--except' => [Address::class, Flight::class],
])->daily();
```

`--pretend` 옵션과 함께 `model:prune` 명령어를 실행하여 `prunable` 쿼리를 테스트할 수 있습니다. 가장할 때 `model:prune` 명령어는 명령어가 실제로 실행되었을 경우 정리될 레코드 수만 보고합니다.

```shell
php artisan model:prune --pretend
```

> [!WARNING]
> 소프트 삭제 모델은 정리 가능한 쿼리와 일치하면 영구적으로 삭제됩니다(`forceDelete`).

<a name="mass-pruning"></a>
#### 대량 정리

모델이 `Illuminate\Database\Eloquent\MassPrunable` 트레이트로 표시되면 모델은 대량 삭제 쿼리를 사용하여 데이터베이스에서 삭제됩니다. 따라서 `pruning` 메서드가 호출되지 않으며 `deleting` 및 `deleted` 모델 이벤트도 디스패치되지 않습니다. 이는 삭제 전에 모델이 실제로 조회되지 않아 정리 프로세스가 훨씬 더 효율적이기 때문입니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\MassPrunable;

class Flight extends Model
{
    use MassPrunable;

    /**
     * 정리 가능한 모델 쿼리를 가져옵니다.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

<a name="replicating-models"></a>
## 모델 복제하기

`replicate` 메서드를 사용하여 기존 모델 인스턴스의 저장되지 않은 복사본을 만들 수 있습니다. 이 메서드는 동일한 속성을 많이 공유하는 모델 인스턴스가 있을 때 특히 유용합니다.

```php
use App\Models\Address;

$shipping = Address::create([
    'type' => 'shipping',
    'line_1' => '123 Example Street',
    'city' => 'Victorville',
    'state' => 'CA',
    'postcode' => '90001',
]);

$billing = $shipping->replicate()->fill([
    'type' => 'billing'
]);

$billing->save();
```

새 모델에 복제되지 않도록 하나 이상의 속성을 제외하려면 `replicate` 메서드에 배열을 전달할 수 있습니다.

```php
$flight = Flight::create([
    'destination' => 'LAX',
    'origin' => 'LHR',
    'last_flown' => '2020-03-04 11:00:00',
    'last_pilot_id' => 747,
]);

$flight = $flight->replicate([
    'last_flown',
    'last_pilot_id'
]);
```

<a name="query-scopes"></a>
## 쿼리 스코프

<a name="global-scopes"></a>
### 글로벌 스코프

글로벌 스코프를 사용하면 주어진 모델에 대한 모든 쿼리에 제약 조건을 추가할 수 있습니다. Laravel의 자체 [소프트 삭제](#soft-deleting) 기능은 글로벌 스코프를 사용하여 데이터베이스에서 "삭제되지 않은" 모델만 조회합니다. 자체 글로벌 스코프를 작성하면 주어진 모델에 대한 모든 쿼리가 특정 제약 조건을 받도록 편리하고 쉽게 만들 수 있습니다.

<a name="generating-scopes"></a>
#### 스코프 생성하기

새 글로벌 스코프를 생성하려면 `make:scope` Artisan 명령어를 호출할 수 있습니다. 생성된 스코프는 애플리케이션의 `app/Models/Scopes` 디렉터리에 배치됩니다.

```shell
php artisan make:scope AncientScope
```

<a name="writing-global-scopes"></a>
#### 글로벌 스코프 작성하기

글로벌 스코프를 작성하는 것은 간단합니다. 먼저 `make:scope` 명령어를 사용하여 `Illuminate\Database\Eloquent\Scope` 인터페이스를 구현하는 클래스를 생성합니다. `Scope` 인터페이스는 `apply` 메서드를 구현해야 합니다. `apply` 메서드는 필요에 따라 쿼리에 `where` 제약 조건이나 다른 유형의 절을 추가할 수 있습니다.

```php
<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AncientScope implements Scope
{
    /**
     * 주어진 Eloquent 쿼리 빌더에 스코프를 적용합니다.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('created_at', '<', now()->subYears(2000));
    }
}
```

> [!NOTE]
> 글로벌 스코프가 쿼리의 select 절에 컬럼을 추가하는 경우 `select` 대신 `addSelect` 메서드를 사용해야 합니다. 이렇게 하면 쿼리의 기존 select 절이 의도치 않게 대체되는 것을 방지할 수 있습니다.

<a name="applying-global-scopes"></a>
#### 글로벌 스코프 적용하기

모델에 글로벌 스코프를 할당하려면 모델에 `ScopedBy` 속성을 배치하면 됩니다.

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;

#[ScopedBy([AncientScope::class])]
class User extends Model
{
    //
}
```

또는 모델의 `booted` 메서드를 재정의하고 모델의 `addGlobalScope` 메서드를 호출하여 글로벌 스코프를 수동으로 등록할 수 있습니다. `addGlobalScope` 메서드는 유일한 인자로 스코프의 인스턴스를 받습니다.

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new AncientScope);
    }
}
```

위 예제에서 `App\Models\User` 모델에 스코프를 추가한 후 `User::all()` 메서드를 호출하면 다음 SQL 쿼리가 실행됩니다.

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### 익명 글로벌 스코프

Eloquent는 클로저를 사용하여 글로벌 스코프를 정의할 수도 있습니다. 이는 별도의 클래스가 필요하지 않은 간단한 스코프에 특히 유용합니다. 클로저를 사용하여 글로벌 스코프를 정의할 때 `addGlobalScope` 메서드의 첫 번째 인자로 직접 선택한 스코프 이름을 제공해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('ancient', function (Builder $builder) {
            $builder->where('created_at', '<', now()->subYears(2000));
        });
    }
}
```

<a name="removing-global-scopes"></a>
#### 글로벌 스코프 제거하기

주어진 쿼리에 대해 글로벌 스코프를 제거하려면 `withoutGlobalScope` 메서드를 사용할 수 있습니다. 이 메서드는 글로벌 스코프의 클래스 이름을 유일한 인자로 받습니다.

```php
User::withoutGlobalScope(AncientScope::class)->get();
```

또는 클로저를 사용하여 글로벌 스코프를 정의한 경우 글로벌 스코프에 할당한 문자열 이름을 전달해야 합니다.

```php
User::withoutGlobalScope('ancient')->get();
```

쿼리의 글로벌 스코프를 여러 개 또는 모두 제거하려면 `withoutGlobalScopes` 메서드를 사용할 수 있습니다.

```php
// 모든 글로벌 스코프 제거...
User::withoutGlobalScopes()->get();

// 일부 글로벌 스코프 제거...
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();
```

<a name="local-scopes"></a>
### 로컬 스코프

로컬 스코프를 사용하면 애플리케이션 전체에서 쉽게 재사용할 수 있는 일반적인 쿼리 제약 조건 세트를 정의할 수 있습니다. 예를 들어 "인기 있는" 것으로 간주되는 모든 사용자를 자주 조회해야 할 수 있습니다. 스코프를 정의하려면 Eloquent 모델 메서드에 `scope` 접두사를 붙이면 됩니다.

스코프는 항상 동일한 쿼리 빌더 인스턴스 또는 `void`를 반환해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 인기 있는 사용자만 포함하도록 쿼리 범위를 지정합니다.
     */
    public function scopePopular(Builder $query): void
    {
        $query->where('votes', '>', 100);
    }

    /**
     * 활성 사용자만 포함하도록 쿼리 범위를 지정합니다.
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('active', 1);
    }
}
```

<a name="utilizing-a-local-scope"></a>
#### 로컬 스코프 사용하기

스코프가 정의되면 모델을 쿼리할 때 스코프 메서드를 호출할 수 있습니다. 그러나 메서드를 호출할 때 `scope` 접두사를 포함하지 않아야 합니다. 다양한 스코프에 대한 호출을 연결할 수도 있습니다.

```php
use App\Models\User;

$users = User::popular()->active()->orderBy('created_at')->get();
```

`or` 쿼리 연산자를 통해 여러 Eloquent 모델 스코프를 결합하려면 올바른 [논리적 그룹화](/docs/{{version}}/queries#logical-grouping)를 달성하기 위해 클로저를 사용해야 할 수 있습니다.

```php
$users = User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

그러나 이것은 번거로울 수 있으므로 Laravel은 클로저를 사용하지 않고 스코프를 유연하게 연결할 수 있는 "상위" `orWhere` 메서드를 제공합니다.

```php
$users = User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### 동적 스코프

때때로 매개변수를 받는 스코프를 정의하고 싶을 수 있습니다. 시작하려면 스코프 메서드의 시그니처에 추가 매개변수를 추가하면 됩니다. 스코프 매개변수는 `$query` 매개변수 뒤에 정의해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 주어진 타입의 사용자만 포함하도록 쿼리 범위를 지정합니다.
     */
    public function scopeOfType(Builder $query, string $type): void
    {
        $query->where('type', $type);
    }
}
```

예상되는 인자가 스코프 메서드의 시그니처에 추가되면 스코프를 호출할 때 인자를 전달할 수 있습니다.

```php
$users = User::ofType('admin')->get();
```

<a name="pending-attributes"></a>
### 보류 속성

스코프를 사용하여 스코프를 제한하는 데 사용된 것과 동일한 속성을 가진 모델을 생성하려면 스코프 쿼리를 작성할 때 `withAttributes` 메서드를 사용할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * 쿼리 범위를 초안만 포함하도록 지정합니다.
     */
    public function scopeDraft(Builder $query): void
    {
        $query->withAttributes([
            'hidden' => true,
        ]);
    }
}
```

`withAttributes` 메서드는 주어진 속성을 사용하여 쿼리에 `where` 절 제약 조건을 추가하고 스코프를 통해 생성된 모든 모델에 주어진 속성도 추가합니다.

```php
$draft = Post::draft()->create(['title' => 'In Progress']);

$draft->hidden; // true
```

<a name="comparing-models"></a>
## 모델 비교하기

때때로 두 모델이 "동일"한지 여부를 확인해야 할 수 있습니다. `is` 및 `isNot` 메서드를 사용하여 두 모델이 동일한 기본 키, 테이블 및 데이터베이스 연결을 가지고 있는지 빠르게 확인할 수 있습니다.

```php
if ($post->is($anotherPost)) {
    // ...
}

if ($post->isNot($anotherPost)) {
    // ...
}
```

`is` 및 `isNot` 메서드는 `belongsTo`, `hasOne`, `morphTo`, `morphOne` [관계](/docs/{{version}}/eloquent-relationships)를 사용할 때도 사용할 수 있습니다. 이 메서드는 해당 모델을 조회하기 위해 쿼리를 실행하지 않고 관련 모델을 비교하려는 경우 특히 유용합니다.

```php
if ($post->author()->is($user)) {
    // ...
}
```

<a name="events"></a>
## 이벤트

> [!NOTE]
> Eloquent 이벤트를 클라이언트 측 애플리케이션에 직접 브로드캐스트하고 싶으신가요? Laravel의 [모델 이벤트 브로드캐스팅](/docs/{{version}}/broadcasting#model-broadcasting)을 확인하세요.

Eloquent 모델은 여러 이벤트를 디스패치하여 모델 수명 주기의 다음 순간에 후킹할 수 있습니다: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `trashed`, `forceDeleting`, `forceDeleted`, `restoring`, `restored`, `replicating`.

`retrieved` 이벤트는 기존 모델이 데이터베이스에서 조회될 때 디스패치됩니다. 새 모델이 처음 저장되면 `creating` 및 `created` 이벤트가 디스패치됩니다. 기존 모델이 수정되고 `save` 메서드가 호출되면 `updating` / `updated` 이벤트가 디스패치됩니다. 모델의 속성이 변경되지 않은 경우에도 모델이 생성되거나 수정될 때 `saving` / `saved` 이벤트가 디스패치됩니다. `-ing`으로 끝나는 이벤트 이름은 모델에 대한 변경 사항이 저장되기 전에 디스패치되고 `-ed`로 끝나는 이벤트는 모델에 대한 변경 사항이 저장된 후에 디스패치됩니다.

모델 이벤트를 수신하기 시작하려면 Eloquent 모델에 `$dispatchesEvents` 속성을 정의합니다. 이 속성은 Eloquent 모델 수명 주기의 다양한 지점을 자체 [이벤트 클래스](/docs/{{version}}/events)에 매핑합니다. 각 모델 이벤트 클래스는 생성자를 통해 영향을 받는 모델의 인스턴스를 받아야 합니다.

```php
<?php

namespace App\Models;

use App\Events\UserDeleted;
use App\Events\UserSaved;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * 모델의 이벤트 맵.
     *
     * @var array<string, string>
     */
    protected $dispatchesEvents = [
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

Eloquent 이벤트를 정의하고 매핑한 후 [이벤트 리스너](/docs/{{version}}/events#defining-listeners)를 사용하여 이벤트를 처리할 수 있습니다.

> [!WARNING]
> Eloquent를 통해 대량 수정 또는 삭제 쿼리를 실행할 때 영향을 받는 모델에 대해 `saved`, `updated`, `deleting`, `deleted` 모델 이벤트가 디스패치되지 않습니다. 이는 대량 수정 또는 삭제를 수행할 때 모델이 실제로 조회되지 않기 때문입니다.

<a name="events-using-closures"></a>
### 클로저 사용하기

사용자 정의 이벤트 클래스를 사용하는 대신 다양한 모델 이벤트가 디스패치될 때 실행되는 클로저를 등록할 수 있습니다. 일반적으로 이러한 클로저는 모델의 `booted` 메서드에서 등록해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 "booted" 메서드.
     */
    protected static function booted(): void
    {
        static::created(function (User $user) {
            // ...
        });
    }
}
```

필요한 경우 모델 이벤트를 등록할 때 [큐에 넣을 수 있는 익명 이벤트 리스너](/docs/{{version}}/events#queuable-anonymous-event-listeners)를 활용할 수 있습니다. 이렇게 하면 Laravel이 애플리케이션의 [큐](/docs/{{version}}/queues)를 사용하여 백그라운드에서 모델 이벤트 리스너를 실행하도록 지시합니다.

```php
use function Illuminate\Events\queueable;

static::created(queueable(function (User $user) {
    // ...
}));
```

<a name="observers"></a>
### 옵저버

<a name="defining-observers"></a>
#### 옵저버 정의하기

주어진 모델에서 많은 이벤트를 수신하는 경우 옵저버를 사용하여 모든 리스너를 단일 클래스에 그룹화할 수 있습니다. 옵저버 클래스에는 수신하려는 Eloquent 이벤트를 반영하는 메서드 이름이 있습니다. 이러한 각 메서드는 영향을 받는 모델을 유일한 인자로 받습니다. `make:observer` Artisan 명령어는 새 옵저버 클래스를 만드는 가장 쉬운 방법입니다.

```shell
php artisan make:observer UserObserver --model=User
```

이 명령어는 새 옵저버를 `app/Observers` 디렉터리에 배치합니다. 이 디렉터리가 없으면 Artisan이 자동으로 생성합니다. 새 옵저버는 다음과 같습니다.

```php
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * User "created" 이벤트를 처리합니다.
     */
    public function created(User $user): void
    {
        // ...
    }

    /**
     * User "updated" 이벤트를 처리합니다.
     */
    public function updated(User $user): void
    {
        // ...
    }

    /**
     * User "deleted" 이벤트를 처리합니다.
     */
    public function deleted(User $user): void
    {
        // ...
    }

    /**
     * User "restored" 이벤트를 처리합니다.
     */
    public function restored(User $user): void
    {
        // ...
    }

    /**
     * User "forceDeleted" 이벤트를 처리합니다.
     */
    public function forceDeleted(User $user): void
    {
        // ...
    }
}
```

옵저버를 등록하려면 해당 모델에 `ObservedBy` 속성을 배치할 수 있습니다.

```php
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([UserObserver::class])]
class User extends Authenticatable
{
    //
}
```

또는 관찰하려는 모델에서 `observe` 메서드를 호출하여 옵저버를 수동으로 등록할 수 있습니다. 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 옵저버를 등록할 수 있습니다.

```php
use App\Models\User;
use App\Observers\UserObserver;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    User::observe(UserObserver::class);
}
```

> [!NOTE]
> 옵저버가 수신할 수 있는 `saving` 및 `retrieved`와 같은 추가 이벤트가 있습니다. 이러한 이벤트는 [이벤트](#events) 문서에 설명되어 있습니다.

<a name="observers-and-database-transactions"></a>
#### 옵저버와 데이터베이스 트랜잭션

데이터베이스 트랜잭션 내에서 모델이 생성될 때 데이터베이스 트랜잭션이 커밋된 후에만 이벤트 핸들러를 실행하도록 옵저버에 지시할 수 있습니다. 옵저버에 `ShouldHandleEventsAfterCommit` 인터페이스를 구현하여 이를 수행할 수 있습니다. 데이터베이스 트랜잭션이 진행 중이 아니면 이벤트 핸들러가 즉시 실행됩니다.

```php
<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class UserObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * User "created" 이벤트를 처리합니다.
     */
    public function created(User $user): void
    {
        // ...
    }
}
```

<a name="muting-events"></a>
### 이벤트 음소거

모델에서 발생하는 모든 이벤트를 일시적으로 "음소거"해야 할 때가 있습니다. `withoutEvents` 메서드를 사용하여 이를 수행할 수 있습니다. `withoutEvents` 메서드는 클로저를 유일한 인자로 받습니다. 이 클로저 내에서 실행되는 모든 코드는 모델 이벤트를 디스패치하지 않으며 클로저에서 반환된 값은 `withoutEvents` 메서드에서 반환됩니다.

```php
use App\Models\User;

$user = User::withoutEvents(function () {
    User::findOrFail(1)->delete();

    return User::find(2);
});
```

<a name="saving-a-single-model-without-events"></a>
#### 이벤트 없이 단일 모델 저장하기

때때로 이벤트를 디스패치하지 않고 주어진 모델을 "저장"하고 싶을 수 있습니다. `saveQuietly` 메서드를 사용하여 이를 수행할 수 있습니다.

```php
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```

이벤트를 디스패치하지 않고 주어진 모델을 "수정", "삭제", "소프트 삭제", "복원" 및 "복제"할 수도 있습니다.

```php
$user->deleteQuietly();
$user->forceDeleteQuietly();
$user->restoreQuietly();
```

# Laravel Scout

- [소개](#introduction)
- [설치](#installation)
    - [큐 사용](#queueing)
- [드라이버 사전 요구 사항](#driver-prerequisites)
    - [Algolia](#algolia)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
- [설정](#configuration)
    - [모델 인덱스 설정](#configuring-model-indexes)
    - [검색 가능한 데이터 설정](#configuring-searchable-data)
    - [모델 ID 설정](#configuring-the-model-id)
    - [모델별 검색 엔진 설정](#configuring-search-engines-per-model)
    - [사용자 식별](#identifying-users)
- [데이터베이스 / 컬렉션 엔진](#database-and-collection-engines)
    - [데이터베이스 엔진](#database-engine)
    - [컬렉션 엔진](#collection-engine)
- [인덱싱](#indexing)
    - [일괄 가져오기](#batch-import)
    - [레코드 추가](#adding-records)
    - [레코드 업데이트](#updating-records)
    - [레코드 삭제](#removing-records)
    - [인덱싱 일시 중지](#pausing-indexing)
    - [조건부 검색 가능 모델 인스턴스](#conditionally-searchable-model-instances)
- [검색](#searching)
    - [Where 절](#where-clauses)
    - [페이지네이션](#pagination)
    - [소프트 삭제](#soft-deleting)
    - [엔진 검색 커스터마이징](#customizing-engine-searches)
- [커스텀 엔진](#custom-engines)

<a name="introduction"></a>
## 소개

[Laravel Scout](https://github.com/laravel/scout)는 [Eloquent 모델](/docs/{{version}}/eloquent)에 전체 텍스트 검색(Full-Text Search)을 추가하기 위한 간단한 드라이버 기반 솔루션을 제공합니다. 모델 옵저버를 사용하여 Scout는 검색 인덱스를 Eloquent 레코드와 자동으로 동기화합니다.

현재 Scout는 [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org), 그리고 MySQL / PostgreSQL (`database`) 드라이버를 제공합니다. 또한 Scout에는 로컬 개발용으로 설계되어 외부 의존성이나 타사 서비스가 필요하지 않은 "컬렉션(Collection)" 드라이버도 포함되어 있습니다. 또한 커스텀 드라이버를 작성하는 것도 간단하므로 자유롭게 Scout를 자신만의 검색 구현으로 확장할 수 있습니다.

<a name="installation"></a>
## 설치

먼저 Composer 패키지 매니저를 통해 Scout를 설치하세요.

```shell
composer require laravel/scout
```

Scout를 설치한 후 `vendor:publish` Artisan 명령을 사용하여 Scout 설정 파일을 배포해야 합니다. 이 명령은 `scout.php` 설정 파일을 애플리케이션의 `config` 디렉토리에 배포합니다.

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

마지막으로 검색 가능하게 만들고자 하는 모델에 `Laravel\Scout\Searchable` 트레이트를 추가하세요. 이 트레이트는 모델을 검색 드라이버와 자동으로 동기화하는 모델 옵저버를 등록합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;
}
```

<a name="queueing"></a>
### 큐 사용

Scout를 사용하는 데 반드시 필요한 것은 아니지만, 라이브러리를 사용하기 전에 [큐 드라이버](/docs/{{version}}/queues)를 구성하는 것을 강력히 권장합니다. 큐 워커를 실행하면 Scout가 모델 정보를 검색 인덱스에 동기화하는 모든 작업을 큐에 넣을 수 있어 애플리케이션의 웹 인터페이스에서 훨씬 더 빠른 응답 시간을 제공합니다.

큐 드라이버를 구성한 후 `config/scout.php` 설정 파일에서 `queue` 옵션 값을 `true`로 설정하세요.

```php
'queue' => true,
```

`queue` 옵션이 `false`로 설정되어 있더라도 Algolia나 Meilisearch와 같은 일부 Scout 드라이버는 항상 레코드를 비동기적으로 인덱싱한다는 점을 기억하는 것이 중요합니다. 즉, Laravel 애플리케이션 내에서 인덱스 작업이 완료되더라도 검색 엔진 자체에는 새 레코드와 업데이트된 레코드가 즉시 반영되지 않을 수 있습니다.

Scout 작업이 사용하는 커넥션과 큐를 지정하려면 `queue` 설정 옵션을 배열로 정의할 수 있습니다.

```php
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

물론 Scout 작업이 사용하는 커넥션과 큐를 커스터마이징하는 경우 해당 커넥션과 큐에서 작업을 처리하기 위해 큐 워커를 실행해야 합니다.

```shell
php artisan queue:work redis --queue=scout
```

<a name="driver-prerequisites"></a>
## 드라이버 사전 요구 사항

<a name="algolia"></a>
### Algolia

Algolia 드라이버를 사용할 때는 `config/scout.php` 설정 파일에서 Algolia `id`와 `secret` 자격 증명을 구성해야 합니다. 자격 증명이 구성되면 Composer 패키지 매니저를 통해 Algolia PHP SDK도 설치해야 합니다.

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
### Meilisearch

[Meilisearch](https://www.meilisearch.com)는 매우 빠르고 오픈 소스인 검색 엔진입니다. 로컬 머신에 Meilisearch를 설치하는 방법을 모르는 경우 Laravel의 공식 지원 Docker 개발 환경인 [Laravel Sail](/docs/{{version}}/sail#meilisearch)을 사용할 수 있습니다.

Meilisearch 드라이버를 사용할 때는 Composer 패키지 매니저를 통해 Meilisearch PHP SDK를 설치해야 합니다.

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

그런 다음 애플리케이션의 `.env` 파일에서 `SCOUT_DRIVER` 환경 변수와 Meilisearch `host` 및 `key` 자격 증명을 설정하세요.

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Meilisearch에 대한 자세한 정보는 [Meilisearch 문서](https://docs.meilisearch.com/learn/getting_started/quick_start.html)를 참조하세요.

또한 [Meilisearch의 바이너리 호환성에 관한 문서](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch)를 검토하여 Meilisearch 바이너리 버전과 호환되는 `meilisearch/meilisearch-php` 버전을 설치해야 합니다.

> [!WARNING]  
> Meilisearch를 사용하는 애플리케이션에서 Scout를 업그레이드할 때는 항상 Meilisearch 서비스 자체의 [추가적인 주요 변경 사항](https://github.com/meilisearch/Meilisearch/releases)을 검토해야 합니다.

<a name="typesense"></a>
### Typesense

[Typesense](https://typesense.org)는 초고속 오픈 소스 검색 엔진으로 키워드 검색, 시맨틱 검색, 지리적 검색, 벡터 검색을 지원합니다.

Typesense를 [자체 호스팅](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting)하거나 [Typesense Cloud](https://cloud.typesense.org)를 사용할 수 있습니다.

Scout와 함께 Typesense를 사용하려면 Composer 패키지 매니저를 통해 Typesense PHP SDK를 설치하세요.

```shell
composer require typesense/typesense-php
```

그런 다음 애플리케이션의 .env 파일에서 `SCOUT_DRIVER` 환경 변수와 Typesense 호스트 및 API 키 자격 증명을 설정하세요.

```ini
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

[Laravel Sail](/docs/{{version}}/sail)을 사용하는 경우 Docker 컨테이너 이름과 일치하도록 `TYPESENSE_HOST` 환경 변수를 조정해야 할 수 있습니다. 선택적으로 설치의 포트, 경로 및 프로토콜을 지정할 수도 있습니다.

```env
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Typesense 컬렉션에 대한 추가 설정 및 스키마 정의는 애플리케이션의 `config/scout.php` 설정 파일에서 찾을 수 있습니다. Typesense에 대한 자세한 정보는 [Typesense 문서](https://typesense.org/docs/guide/#quick-start)를 참조하세요.

<a name="preparing-data-for-storage-in-typesense"></a>
#### Typesense에 저장할 데이터 준비

Typesense를 활용할 때 검색 가능한 모델은 모델의 기본 키를 문자열로, 생성 날짜를 UNIX 타임스탬프로 캐스팅하는 `toSearchableArray` 메서드를 정의해야 합니다.

```php
/**
 * 모델의 인덱싱 가능한 데이터 배열을 가져옵니다.
 *
 * @return array<string, mixed>
 */
public function toSearchableArray()
{
    return array_merge($this->toArray(),[
        'id' => (string) $this->id,
        'created_at' => $this->created_at->timestamp,
    ]);
}
```

또한 애플리케이션의 `config/scout.php` 파일에서 Typesense 컬렉션 스키마를 정의해야 합니다. 컬렉션 스키마는 Typesense를 통해 검색할 수 있는 각 필드의 데이터 타입을 설명합니다. 사용 가능한 모든 스키마 옵션에 대한 자세한 정보는 [Typesense 문서](https://typesense.org/docs/latest/api/collections.html#schema-parameters)를 참조하세요.

Typesense 컬렉션의 스키마가 정의된 후 변경해야 하는 경우 `scout:flush`와 `scout:import`를 실행하면 기존의 모든 인덱싱된 데이터가 삭제되고 스키마가 다시 생성됩니다. 또는 Typesense의 API를 사용하여 인덱싱된 데이터를 제거하지 않고 컬렉션의 스키마를 수정할 수 있습니다.

검색 가능한 모델이 소프트 삭제가 가능한 경우 애플리케이션의 `config/scout.php` 설정 파일에서 모델에 해당하는 Typesense 스키마에 `__soft_deleted` 필드를 정의해야 합니다.

```php
User::class => [
    'collection-schema' => [
        'fields' => [
            // ...
            [
                'name' => '__soft_deleted',
                'type' => 'int32',
                'optional' => true,
            ],
        ],
    ],
],
```

<a name="typesense-dynamic-search-parameters"></a>
#### 동적 검색 매개변수

Typesense를 사용하면 `options` 메서드를 통해 검색 작업을 수행할 때 [검색 매개변수](https://typesense.org/docs/latest/api/search.html#search-parameters)를 동적으로 수정할 수 있습니다.

```php
use App\Models\Todo;

Todo::search('Groceries')->options([
    'query_by' => 'title, description'
])->get();
```

<a name="configuration"></a>
## 설정

<a name="configuring-model-indexes"></a>
### 모델 인덱스 설정

각 Eloquent 모델은 해당 모델의 모든 검색 가능한 레코드를 포함하는 특정 검색 "인덱스"와 동기화됩니다. 다시 말해 각 인덱스는 MySQL 테이블과 같다고 생각할 수 있습니다. 기본적으로 각 모델은 모델의 일반적인 "테이블" 이름과 일치하는 인덱스에 저장됩니다. 일반적으로 이것은 모델 이름의 복수형입니다. 그러나 모델의 `searchableAs` 메서드를 오버라이드하여 모델의 인덱스를 자유롭게 커스터마이징할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * 모델과 연결된 인덱스의 이름을 가져옵니다.
     */
    public function searchableAs(): string
    {
        return 'posts_index';
    }
}
```

<a name="configuring-searchable-data"></a>
### 검색 가능한 데이터 설정

기본적으로 주어진 모델의 전체 `toArray` 형식이 검색 인덱스에 저장됩니다. 검색 인덱스에 동기화되는 데이터를 커스터마이징하려면 모델의 `toSearchableArray` 메서드를 오버라이드할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * 모델의 인덱싱 가능한 데이터 배열을 가져옵니다.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        // 데이터 배열 커스터마이징...

        return $array;
    }
}
```

Meilisearch와 같은 일부 검색 엔진은 올바른 타입의 데이터에서만 필터 작업(`>`, `<` 등)을 수행합니다. 따라서 이러한 검색 엔진을 사용하고 검색 가능한 데이터를 커스터마이징할 때는 숫자 값이 올바른 타입으로 캐스팅되도록 해야 합니다.

```php
public function toSearchableArray()
{
    return [
        'id' => (int) $this->id,
        'name' => $this->name,
        'price' => (float) $this->price,
    ];
}
```

<a name="configuring-filterable-data-for-meilisearch"></a>
#### 필터 가능한 데이터 및 인덱스 설정 구성 (Meilisearch)

Scout의 다른 드라이버와 달리 Meilisearch는 필터 가능한 속성, 정렬 가능한 속성 및 [기타 지원되는 설정 필드](https://docs.meilisearch.com/reference/api/settings.html)와 같은 인덱스 검색 설정을 미리 정의해야 합니다.

필터 가능한 속성은 Scout의 `where` 메서드를 호출할 때 필터링할 계획인 모든 속성이며, 정렬 가능한 속성은 Scout의 `orderBy` 메서드를 호출할 때 정렬할 계획인 모든 속성입니다. 인덱스 설정을 정의하려면 애플리케이션의 `scout` 설정 파일에서 `meilisearch` 설정 항목의 `index-settings` 부분을 조정하세요.

```php
use App\Models\User;
use App\Models\Flight;

'meilisearch' => [
    'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
    'key' => env('MEILISEARCH_KEY', null),
    'index-settings' => [
        User::class => [
            'filterableAttributes'=> ['id', 'name', 'email'],
            'sortableAttributes' => ['created_at'],
            // 기타 설정 필드...
        ],
        Flight::class => [
            'filterableAttributes'=> ['id', 'destination'],
            'sortableAttributes' => ['updated_at'],
        ],
    ],
],
```

주어진 인덱스의 기본 모델이 소프트 삭제가 가능하고 `index-settings` 배열에 포함된 경우 Scout는 해당 인덱스에서 소프트 삭제된 모델에 대한 필터링 지원을 자동으로 포함합니다. 소프트 삭제가 가능한 모델 인덱스에 대해 정의할 다른 필터 가능하거나 정렬 가능한 속성이 없는 경우 해당 모델에 대해 `index-settings` 배열에 빈 항목을 추가하면 됩니다.

```php
'index-settings' => [
    Flight::class => []
],
```

애플리케이션의 인덱스 설정을 구성한 후 `scout:sync-index-settings` Artisan 명령을 실행해야 합니다. 이 명령은 현재 구성된 인덱스 설정을 Meilisearch에 알립니다. 편의를 위해 이 명령을 배포 프로세스의 일부로 만들 수 있습니다.

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-the-model-id"></a>
### 모델 ID 설정

기본적으로 Scout는 모델의 기본 키를 검색 인덱스에 저장되는 모델의 고유 ID / 키로 사용합니다. 이 동작을 커스터마이징해야 하는 경우 모델의 `getScoutKey` 및 `getScoutKeyName` 메서드를 오버라이드할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * 모델을 인덱싱하는 데 사용되는 값을 가져옵니다.
     */
    public function getScoutKey(): mixed
    {
        return $this->email;
    }

    /**
     * 모델을 인덱싱하는 데 사용되는 키 이름을 가져옵니다.
     */
    public function getScoutKeyName(): mixed
    {
        return 'email';
    }
}
```

<a name="configuring-search-engines-per-model"></a>
### 모델별 검색 엔진 설정

검색할 때 Scout는 일반적으로 애플리케이션의 `scout` 설정 파일에 지정된 기본 검색 엔진을 사용합니다. 그러나 모델의 `searchableUsing` 메서드를 오버라이드하여 특정 모델의 검색 엔진을 변경할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Engines\Engine;
use Laravel\Scout\EngineManager;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * 모델을 인덱싱하는 데 사용되는 엔진을 가져옵니다.
     */
    public function searchableUsing(): Engine
    {
        return app(EngineManager::class)->engine('meilisearch');
    }
}
```

<a name="identifying-users"></a>
### 사용자 식별

Scout를 사용하면 [Algolia](https://algolia.com)를 사용할 때 사용자를 자동으로 식별할 수 있습니다. 인증된 사용자를 검색 작업과 연결하면 Algolia의 대시보드에서 검색 분석을 볼 때 유용할 수 있습니다. 애플리케이션의 `.env` 파일에서 `SCOUT_IDENTIFY` 환경 변수를 `true`로 정의하여 사용자 식별을 활성화할 수 있습니다.

```ini
SCOUT_IDENTIFY=true
```

이 기능을 활성화하면 요청의 IP 주소와 인증된 사용자의 기본 식별자도 Algolia에 전달되어 사용자가 수행하는 모든 검색 요청과 이 데이터가 연결됩니다.

<a name="database-and-collection-engines"></a>
## 데이터베이스 / 컬렉션 엔진

<a name="database-engine"></a>
### 데이터베이스 엔진

> [!WARNING]  
> 데이터베이스 엔진은 현재 MySQL과 PostgreSQL을 지원합니다.

애플리케이션이 소규모에서 중규모 데이터베이스와 상호 작용하거나 가벼운 워크로드를 가지고 있다면 Scout의 "database" 엔진으로 시작하는 것이 더 편리할 수 있습니다. 데이터베이스 엔진은 기존 데이터베이스에서 결과를 필터링할 때 "where like" 절과 전체 텍스트 인덱스를 사용하여 쿼리에 대한 해당 검색 결과를 결정합니다.

데이터베이스 엔진을 사용하려면 `SCOUT_DRIVER` 환경 변수 값을 `database`로 설정하거나 애플리케이션의 `scout` 설정 파일에서 `database` 드라이버를 직접 지정하면 됩니다.

```ini
SCOUT_DRIVER=database
```

데이터베이스 엔진을 선호하는 드라이버로 지정한 후에는 [검색 가능한 데이터를 구성](#configuring-searchable-data)해야 합니다. 그런 다음 모델에 대해 [검색 쿼리를 실행](#searching)할 수 있습니다. 데이터베이스 엔진을 사용할 때는 Algolia, Meilisearch 또는 Typesense 인덱스를 시드하는 데 필요한 것과 같은 검색 엔진 인덱싱이 필요하지 않습니다.

#### 데이터베이스 검색 전략 커스터마이징

기본적으로 데이터베이스 엔진은 [검색 가능하게 구성된](#configuring-searchable-data) 모든 모델 속성에 대해 "where like" 쿼리를 실행합니다. 그러나 일부 상황에서는 성능이 저하될 수 있습니다. 따라서 데이터베이스 엔진의 검색 전략을 구성하여 일부 지정된 컬럼이 전체 텍스트 검색 쿼리를 활용하거나 전체 문자열(`%example%`) 대신 문자열의 접두사만 검색하는 "where like" 제약 조건(`example%`)을 사용하도록 할 수 있습니다.

이 동작을 정의하려면 모델의 `toSearchableArray` 메서드에 PHP 속성을 할당할 수 있습니다. 추가 검색 전략 동작이 할당되지 않은 컬럼은 기본 "where like" 전략을 계속 사용합니다.

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * 모델의 인덱싱 가능한 데이터 배열을 가져옵니다.
 *
 * @return array<string, mixed>
 */
#[SearchUsingPrefix(['id', 'email'])]
#[SearchUsingFullText(['bio'])]
public function toSearchableArray(): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'bio' => $this->bio,
    ];
}
```

> [!WARNING]  
> 컬럼이 전체 텍스트 쿼리 제약 조건을 사용하도록 지정하기 전에 컬럼에 [전체 텍스트 인덱스](/docs/{{version}}/migrations#available-index-types)가 할당되었는지 확인하세요.

<a name="collection-engine"></a>
### 컬렉션 엔진

로컬 개발 중에 Algolia, Meilisearch 또는 Typesense 검색 엔진을 자유롭게 사용할 수 있지만 "컬렉션" 엔진으로 시작하는 것이 더 편리할 수 있습니다. 컬렉션 엔진은 기존 데이터베이스의 결과에 "where" 절과 컬렉션 필터링을 사용하여 쿼리에 대한 해당 검색 결과를 결정합니다. 이 엔진을 사용할 때는 검색 가능한 모델을 "인덱싱"할 필요가 없습니다. 단순히 로컬 데이터베이스에서 가져오기 때문입니다.

컬렉션 엔진을 사용하려면 `SCOUT_DRIVER` 환경 변수 값을 `collection`으로 설정하거나 애플리케이션의 `scout` 설정 파일에서 `collection` 드라이버를 직접 지정하면 됩니다.

```ini
SCOUT_DRIVER=collection
```

컬렉션 드라이버를 선호하는 드라이버로 지정한 후에는 모델에 대해 [검색 쿼리를 실행](#searching)할 수 있습니다. 컬렉션 엔진을 사용할 때는 Algolia, Meilisearch 또는 Typesense 인덱스를 시드하는 데 필요한 것과 같은 검색 엔진 인덱싱이 필요하지 않습니다.

#### 데이터베이스 엔진과의 차이점

언뜻 보면 "데이터베이스"와 "컬렉션" 엔진은 상당히 비슷합니다. 둘 다 데이터베이스와 직접 상호 작용하여 검색 결과를 검색합니다. 그러나 컬렉션 엔진은 일치하는 레코드를 찾기 위해 전체 텍스트 인덱스나 `LIKE` 절을 사용하지 않습니다. 대신 가능한 모든 레코드를 가져와서 Laravel의 `Str::is` 헬퍼를 사용하여 검색 문자열이 모델 속성 값 내에 존재하는지 확인합니다.

컬렉션 엔진은 Laravel이 지원하는 모든 관계형 데이터베이스(SQLite 및 SQL Server 포함)에서 작동하므로 가장 이식성이 높은 검색 엔진입니다. 그러나 Scout의 데이터베이스 엔진보다 효율성이 떨어집니다.

<a name="indexing"></a>
## 인덱싱

<a name="batch-import"></a>
### 일괄 가져오기

기존 프로젝트에 Scout를 설치하는 경우 인덱스로 가져와야 하는 데이터베이스 레코드가 이미 있을 수 있습니다. Scout는 기존의 모든 레코드를 검색 인덱스로 가져오는 데 사용할 수 있는 `scout:import` Artisan 명령을 제공합니다.

```shell
php artisan scout:import "App\Models\Post"
```

`flush` 명령은 검색 인덱스에서 모델의 모든 레코드를 제거하는 데 사용할 수 있습니다.

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### 가져오기 쿼리 수정

일괄 가져오기를 위해 모든 모델을 검색하는 데 사용되는 쿼리를 수정하려면 모델에 `makeAllSearchableUsing` 메서드를 정의할 수 있습니다. 이곳은 모델을 가져오기 전에 필요할 수 있는 즉시 로드 관계(Eager Loading)를 추가하기에 좋은 장소입니다.

```php
use Illuminate\Database\Eloquent\Builder;

/**
 * 모든 모델을 검색 가능하게 만들 때 모델을 검색하는 데 사용되는 쿼리를 수정합니다.
 */
protected function makeAllSearchableUsing(Builder $query): Builder
{
    return $query->with('author');
}
```

> [!WARNING]  
> `makeAllSearchableUsing` 메서드는 큐를 사용하여 모델을 일괄 가져올 때 적용되지 않을 수 있습니다. 모델 컬렉션이 작업에 의해 처리될 때 관계가 [복원되지 않습니다](/docs/{{version}}/queues#handling-relationships).

<a name="adding-records"></a>
### 레코드 추가

모델에 `Laravel\Scout\Searchable` 트레이트를 추가한 후에는 모델 인스턴스를 `save`하거나 `create`하기만 하면 자동으로 검색 인덱스에 추가됩니다. Scout를 [큐를 사용하도록](#queueing) 구성한 경우 이 작업은 큐 워커에 의해 백그라운드에서 수행됩니다.

```php
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a name="adding-records-via-query"></a>
#### 쿼리를 통한 레코드 추가

Eloquent 쿼리를 통해 모델 컬렉션을 검색 인덱스에 추가하려면 Eloquent 쿼리에 `searchable` 메서드를 체인할 수 있습니다. `searchable` 메서드는 쿼리 결과를 [청크](/docs/{{version}}/eloquent#chunking-results)하고 레코드를 검색 인덱스에 추가합니다. 다시 한번, Scout를 큐를 사용하도록 구성한 경우 모든 청크는 큐 워커에 의해 백그라운드에서 가져옵니다.

```php
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

Eloquent 관계 인스턴스에서 `searchable` 메서드를 호출할 수도 있습니다.

```php
$user->orders()->searchable();
```

또는 메모리에 이미 Eloquent 모델 컬렉션이 있는 경우 컬렉션 인스턴스에서 `searchable` 메서드를 호출하여 모델 인스턴스를 해당 인덱스에 추가할 수 있습니다.

```php
$orders->searchable();
```

> [!NOTE]  
> `searchable` 메서드는 "upsert" 작업으로 간주할 수 있습니다. 다시 말해 모델 레코드가 이미 인덱스에 있으면 업데이트됩니다. 검색 인덱스에 존재하지 않으면 인덱스에 추가됩니다.

<a name="updating-records"></a>
### 레코드 업데이트

검색 가능한 모델을 업데이트하려면 모델 인스턴스의 속성을 업데이트하고 모델을 데이터베이스에 `save`하기만 하면 됩니다. Scout는 변경 사항을 자동으로 검색 인덱스에 유지합니다.

```php
use App\Models\Order;

$order = Order::find(1);

// 주문 업데이트...

$order->save();
```

Eloquent 쿼리 인스턴스에서 `searchable` 메서드를 호출하여 모델 컬렉션을 업데이트할 수도 있습니다. 모델이 검색 인덱스에 없으면 생성됩니다.

```php
Order::where('price', '>', 100)->searchable();
```

관계의 모든 모델에 대한 검색 인덱스 레코드를 업데이트하려면 관계 인스턴스에서 `searchable`을 호출할 수 있습니다.

```php
$user->orders()->searchable();
```

또는 메모리에 이미 Eloquent 모델 컬렉션이 있는 경우 컬렉션 인스턴스에서 `searchable` 메서드를 호출하여 해당 인덱스의 모델 인스턴스를 업데이트할 수 있습니다.

```php
$orders->searchable();
```

<a name="modifying-records-before-importing"></a>
#### 가져오기 전 레코드 수정

때때로 모델을 검색 가능하게 만들기 전에 모델 컬렉션을 준비해야 할 수 있습니다. 예를 들어 관계 데이터를 검색 인덱스에 효율적으로 추가할 수 있도록 관계를 즉시 로드(Eager Load)하고 싶을 수 있습니다. 이를 수행하려면 해당 모델에 `makeSearchableUsing` 메서드를 정의하세요.

```php
use Illuminate\Database\Eloquent\Collection;

/**
 * 검색 가능하게 만들 모델 컬렉션을 수정합니다.
 */
public function makeSearchableUsing(Collection $models): Collection
{
    return $models->load('author');
}
```

<a name="removing-records"></a>
### 레코드 삭제

인덱스에서 레코드를 제거하려면 데이터베이스에서 모델을 `delete`하면 됩니다. [소프트 삭제](/docs/{{version}}/eloquent#soft-deleting) 모델을 사용하는 경우에도 이 작업을 수행할 수 있습니다.

```php
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

레코드를 삭제하기 전에 모델을 검색하고 싶지 않은 경우 Eloquent 쿼리 인스턴스에서 `unsearchable` 메서드를 사용할 수 있습니다.

```php
Order::where('price', '>', 100)->unsearchable();
```

관계의 모든 모델에 대한 검색 인덱스 레코드를 제거하려면 관계 인스턴스에서 `unsearchable`을 호출할 수 있습니다.

```php
$user->orders()->unsearchable();
```

또는 메모리에 이미 Eloquent 모델 컬렉션이 있는 경우 컬렉션 인스턴스에서 `unsearchable` 메서드를 호출하여 해당 인덱스에서 모델 인스턴스를 제거할 수 있습니다.

```php
$orders->unsearchable();
```

해당 인덱스에서 모든 모델 레코드를 제거하려면 `removeAllFromSearch` 메서드를 호출할 수 있습니다.

```php
Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
### 인덱싱 일시 중지

모델 데이터를 검색 인덱스에 동기화하지 않고 모델에서 일괄 Eloquent 작업을 수행해야 할 수 있습니다. `withoutSyncingToSearch` 메서드를 사용하여 이 작업을 수행할 수 있습니다. 이 메서드는 즉시 실행되는 단일 클로저를 받습니다. 클로저 내에서 발생하는 모든 모델 작업은 모델의 인덱스에 동기화되지 않습니다.

```php
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // 모델 작업 수행...
});
```

<a name="conditionally-searchable-model-instances"></a>
### 조건부 검색 가능 모델 인스턴스

특정 조건에서만 모델을 검색 가능하게 만들어야 할 수 있습니다. 예를 들어 "초안"과 "게시됨" 두 가지 상태 중 하나일 수 있는 `App\Models\Post` 모델이 있다고 상상해 보세요. "게시됨" 게시물만 검색 가능하게 하고 싶을 수 있습니다. 이를 수행하려면 모델에 `shouldBeSearchable` 메서드를 정의할 수 있습니다.

```php
/**
 * 모델이 검색 가능해야 하는지 결정합니다.
 */
public function shouldBeSearchable(): bool
{
    return $this->isPublished();
}
```

`shouldBeSearchable` 메서드는 `save` 및 `create` 메서드, 쿼리 또는 관계를 통해 모델을 조작할 때만 적용됩니다. `searchable` 메서드를 사용하여 직접 모델이나 컬렉션을 검색 가능하게 만들면 `shouldBeSearchable` 메서드의 결과가 무시됩니다.

> [!WARNING]  
> `shouldBeSearchable` 메서드는 Scout의 "데이터베이스" 엔진을 사용할 때 적용되지 않습니다. 모든 검색 가능한 데이터가 항상 데이터베이스에 저장되기 때문입니다. 데이터베이스 엔진을 사용할 때 유사한 동작을 달성하려면 [where 절](#where-clauses)을 대신 사용해야 합니다.

<a name="searching"></a>
## 검색

`search` 메서드를 사용하여 모델 검색을 시작할 수 있습니다. search 메서드는 모델을 검색하는 데 사용될 단일 문자열을 받습니다. 그런 다음 검색 쿼리에 `get` 메서드를 체인하여 주어진 검색 쿼리와 일치하는 Eloquent 모델을 검색해야 합니다.

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Scout 검색은 Eloquent 모델의 컬렉션을 반환하므로 라우트나 컨트롤러에서 직접 결과를 반환할 수 있으며 자동으로 JSON으로 변환됩니다.

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

Eloquent 모델로 변환되기 전에 원시 검색 결과를 얻으려면 `raw` 메서드를 사용할 수 있습니다.

```php
$orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### 커스텀 인덱스

검색 쿼리는 일반적으로 모델의 [`searchableAs`](#configuring-model-indexes) 메서드에서 지정된 인덱스에서 수행됩니다. 그러나 `within` 메서드를 사용하여 대신 검색해야 하는 커스텀 인덱스를 지정할 수 있습니다.

```php
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
### Where 절

Scout를 사용하면 검색 쿼리에 간단한 "where" 절을 추가할 수 있습니다. 현재 이러한 절은 기본적인 숫자 동등 검사만 지원하며 주로 소유자 ID로 검색 쿼리의 범위를 지정하는 데 유용합니다.

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

또한 `whereIn` 메서드는 주어진 컬럼의 값이 주어진 배열 내에 포함되어 있는지 확인하는 데 사용할 수 있습니다.

```php
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

`whereNotIn` 메서드는 주어진 컬럼의 값이 주어진 배열에 포함되어 있지 않은지 확인합니다.

```php
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

검색 인덱스는 관계형 데이터베이스가 아니므로 더 고급의 "where" 절은 현재 지원되지 않습니다.

> [!WARNING]  
> 애플리케이션이 Meilisearch를 사용하는 경우 Scout의 "where" 절을 사용하기 전에 애플리케이션의 [필터 가능한 속성](#configuring-filterable-data-for-meilisearch)을 구성해야 합니다.

<a name="pagination"></a>
### 페이지네이션

모델 컬렉션을 검색하는 것 외에도 `paginate` 메서드를 사용하여 검색 결과를 페이지네이션할 수 있습니다. 이 메서드는 [기존의 Eloquent 쿼리를 페이지네이션](/docs/{{version}}/pagination)한 것처럼 `Illuminate\Pagination\LengthAwarePaginator` 인스턴스를 반환합니다.

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

`paginate` 메서드의 첫 번째 인수로 양을 전달하여 페이지당 검색할 모델 수를 지정할 수 있습니다.

```php
$orders = Order::search('Star Trek')->paginate(15);
```

결과를 검색한 후에는 기존의 Eloquent 쿼리를 페이지네이션한 것처럼 [Blade](/docs/{{version}}/blade)를 사용하여 결과를 표시하고 페이지 링크를 렌더링할 수 있습니다.

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

물론 페이지네이션 결과를 JSON으로 검색하려면 라우트나 컨트롤러에서 직접 페이지네이터 인스턴스를 반환할 수 있습니다.

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> [!WARNING]  
> 검색 엔진은 Eloquent 모델의 글로벌 스코프 정의를 인식하지 못하므로 Scout 페이지네이션을 사용하는 애플리케이션에서는 글로벌 스코프를 사용하지 않아야 합니다. 또는 Scout를 통해 검색할 때 글로벌 스코프의 제약 조건을 다시 생성해야 합니다.

<a name="soft-deleting"></a>
### 소프트 삭제

인덱싱된 모델이 [소프트 삭제](/docs/{{version}}/eloquent#soft-deleting)를 사용하고 소프트 삭제된 모델을 검색해야 하는 경우 `config/scout.php` 설정 파일의 `soft_delete` 옵션을 `true`로 설정하세요.

```php
'soft_delete' => true,
```

이 설정 옵션이 `true`이면 Scout는 검색 인덱스에서 소프트 삭제된 모델을 제거하지 않습니다. 대신 인덱싱된 레코드에 숨겨진 `__soft_deleted` 속성을 설정합니다. 그런 다음 검색할 때 `withTrashed` 또는 `onlyTrashed` 메서드를 사용하여 소프트 삭제된 레코드를 검색할 수 있습니다.

```php
use App\Models\Order;

// 결과를 검색할 때 삭제된 레코드 포함...
$orders = Order::search('Star Trek')->withTrashed()->get();

// 결과를 검색할 때 삭제된 레코드만 포함...
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!NOTE]  
> 소프트 삭제된 모델이 `forceDelete`를 사용하여 영구적으로 삭제되면 Scout는 자동으로 검색 인덱스에서 제거합니다.

<a name="customizing-engine-searches"></a>
### 엔진 검색 커스터마이징

엔진의 검색 동작에 대한 고급 커스터마이징을 수행해야 하는 경우 `search` 메서드의 두 번째 인수로 클로저를 전달할 수 있습니다. 예를 들어 검색 쿼리가 Algolia에 전달되기 전에 검색 옵션에 지리적 위치 데이터를 추가하기 위해 이 콜백을 사용할 수 있습니다.

```php
use Algolia\AlgoliaSearch\SearchIndex;
use App\Models\Order;

Order::search(
    'Star Trek',
    function (SearchIndex $algolia, string $query, array $options) {
        $options['body']['query']['bool']['filter']['geo_distance'] = [
            'distance' => '1000km',
            'location' => ['lat' => 36, 'lon' => 111],
        ];

        return $algolia->search($query, $options);
    }
)->get();
```

<a name="customizing-the-eloquent-results-query"></a>
#### Eloquent 결과 쿼리 커스터마이징

Scout가 애플리케이션의 검색 엔진에서 일치하는 Eloquent 모델 목록을 검색한 후 Eloquent는 기본 키로 일치하는 모든 모델을 검색하는 데 사용됩니다. `query` 메서드를 호출하여 이 쿼리를 커스터마이징할 수 있습니다. `query` 메서드는 Eloquent 쿼리 빌더 인스턴스를 인수로 받는 클로저를 받습니다.

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

이 콜백은 관련 모델이 이미 애플리케이션의 검색 엔진에서 검색된 후에 호출되므로 `query` 메서드를 결과를 "필터링"하는 데 사용해서는 안 됩니다. 대신 [Scout where 절](#where-clauses)을 사용해야 합니다.

<a name="custom-engines"></a>
## 커스텀 엔진

<a name="writing-the-engine"></a>
#### 엔진 작성

내장된 Scout 검색 엔진이 요구 사항에 맞지 않는 경우 자체 커스텀 엔진을 작성하고 Scout에 등록할 수 있습니다. 엔진은 `Laravel\Scout\Engines\Engine` 추상 클래스를 확장해야 합니다. 이 추상 클래스에는 커스텀 엔진이 구현해야 하는 8개의 메서드가 포함되어 있습니다.

```php
use Laravel\Scout\Builder;

abstract public function update($models);
abstract public function delete($models);
abstract public function search(Builder $builder);
abstract public function paginate(Builder $builder, $perPage, $page);
abstract public function mapIds($results);
abstract public function map(Builder $builder, $results, $model);
abstract public function getTotalCount($results);
abstract public function flush($model);
```

`Laravel\Scout\Engines\AlgoliaEngine` 클래스에서 이러한 메서드의 구현을 검토하면 도움이 될 수 있습니다. 이 클래스는 자체 엔진에서 이러한 각 메서드를 구현하는 방법을 배우기 위한 좋은 시작점을 제공합니다.

<a name="registering-the-engine"></a>
#### 엔진 등록

커스텀 엔진을 작성한 후에는 Scout 엔진 매니저의 `extend` 메서드를 사용하여 Scout에 등록할 수 있습니다. Scout의 엔진 매니저는 Laravel 서비스 컨테이너에서 리졸브할 수 있습니다. `App\Providers\AppServiceProvider` 클래스 또는 애플리케이션에서 사용하는 다른 서비스 프로바이더의 `boot` 메서드에서 `extend` 메서드를 호출해야 합니다.

```php
use App\ScoutExtensions\MySqlSearchEngine;
use Laravel\Scout\EngineManager;

/**
 * 모든 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    resolve(EngineManager::class)->extend('mysql', function () {
        return new MySqlSearchEngine;
    });
}
```

엔진이 등록되면 애플리케이션의 `config/scout.php` 설정 파일에서 기본 Scout `driver`로 지정할 수 있습니다.

```php
'driver' => 'mysql',
```

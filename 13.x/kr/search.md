# Search

- [소개](#introduction)
    - [Full-Text Search](#introduction-full-text-search)
    - [Semantic / Vector Search](#introduction-semantic-vector-search)
    - [Reranking](#introduction-reranking)
    - [Scout Search 엔진](#introduction-scout-search-engines)
- [Full-Text Search](#full-text-search)
    - [Full-Text 인덱스 추가](#adding-full-text-indexes)
    - [Full-Text 쿼리 실행](#running-full-text-queries)
- [Semantic / Vector Search](#semantic-vector-search)
    - [Embedding 생성](#generating-embeddings)
    - [Vector 저장 및 인덱싱](#storing-and-indexing-vectors)
    - [유사도 기반 쿼리](#querying-by-similarity)
- [결과 Reranking](#reranking-results)
- [Laravel Scout](#laravel-scout)
    - [데이터베이스 엔진](#database-engine)
    - [서드파티 엔진](#third-party-engines)
- [기법 결합](#combining-techniques)

<a name="introduction"></a>
## 소개

거의 모든 애플리케이션에는 검색 기능이 필요합니다. 사용자가 지식베이스에서 관련 문서를 검색하든, 상품 카탈로그를 탐색하든, 문서 모음에 대해 자연어로 질문하든, Laravel은 이러한 각 시나리오를 처리할 수 있는 내장 도구를 제공합니다. 대부분의 경우 외부 서비스 없이도 충분히 구현할 수 있습니다.

대부분의 애플리케이션은 Laravel이 제공하는 내장 데이터베이스 기반 옵션만으로도 충분합니다. 오타 허용(typo tolerance), 패싯 필터링(faceted filtering), 대규모 지리 검색(geo-search) 등의 기능이 필요한 경우에만 외부 검색 서비스가 필요합니다.

<a name="introduction-full-text-search"></a>
#### Full-Text Search

데이터베이스가 검색어와의 일치도를 기반으로 결과를 점수화하고 정렬하는 키워드 관련성 순위가 필요할 때, Laravel의 `whereFullText` 쿼리 빌더 메소드는 MariaDB, MySQL, PostgreSQL의 네이티브 full-text 인덱스를 활용합니다. Full-text search는 단어 경계와 어간 추출(stemming)을 이해하므로, "running"을 검색하면 "run"이 포함된 레코드도 매칭될 수 있습니다. 외부 서비스가 필요하지 않습니다.

<a name="introduction-semantic-vector-search"></a>
#### Semantic / Vector Search

정확한 키워드가 아닌 *의미*로 결과를 매칭하는 AI 기반 시맨틱 검색을 위해, `whereVectorSimilarTo` 쿼리 빌더 메소드는 `pgvector` 확장이 설치된 PostgreSQL에 저장된 vector embedding을 사용합니다. 예를 들어, "best wineries in Napa Valley"를 검색하면 단어가 전혀 겹치지 않더라도 "Top Vineyards to Visit"이라는 제목의 글을 찾아낼 수 있습니다. Vector search는 `pgvector` 확장이 설치된 PostgreSQL과 [Laravel AI SDK](/docs/{{version}}/ai-sdk)가 필요합니다.

<a name="introduction-reranking"></a>
#### Reranking

Laravel의 [AI SDK](/docs/{{version}}/ai-sdk)는 AI 모델을 사용하여 쿼리에 대한 의미적 관련성을 기준으로 결과 집합을 재정렬하는 reranking 기능을 제공합니다. Reranking은 full-text search와 같은 빠른 초기 검색 단계 이후 두 번째 단계로 사용할 때 특히 강력하며, 속도와 의미적 정확성을 모두 제공합니다.

<a name="introduction-scout-search-engines"></a>
#### Laravel Scout Search

Eloquent 모델과 검색 인덱스를 자동으로 동기화하는 `Searchable` 트레이트를 사용하고 싶은 애플리케이션의 경우, [Laravel Scout](/docs/{{version}}/scout)는 내장 데이터베이스 엔진과 Algolia, Meilisearch, Typesense와 같은 서드파티 서비스용 드라이버를 모두 제공합니다.

<a name="full-text-search"></a>
## Full-Text Search

`LIKE` 쿼리는 간단한 부분 문자열 매칭에는 잘 작동하지만, 언어를 이해하지 못합니다. `LIKE`로 "running"을 검색하면 "run"이 포함된 레코드를 찾지 못하며, 결과가 관련성 기준으로 정렬되지 않고 데이터베이스가 찾는 순서대로 반환됩니다. Full-text search는 단어 경계, 어간 추출, 관련성 점수를 이해하는 특수 인덱스를 사용하여 이 두 가지 문제를 모두 해결하고, 데이터베이스가 가장 관련성 높은 결과를 먼저 반환할 수 있게 합니다.

빠른 full-text search는 MariaDB, MySQL, PostgreSQL에 내장되어 있으므로 외부 검색 서비스가 필요하지 않습니다. 검색하려는 컬럼에 full-text 인덱스를 추가한 다음, `whereFullText` 쿼리 빌더 메소드를 사용하여 검색하기만 하면 됩니다.

> [!WARNING]
> Full-text search는 현재 MariaDB, MySQL, PostgreSQL에서 지원됩니다.

<a name="adding-full-text-indexes"></a>
### Full-Text 인덱스 추가

Full-text search를 사용하려면 먼저 검색하려는 컬럼에 full-text 인덱스를 추가하세요. 단일 컬럼에 인덱스를 추가하거나, 컬럼 배열을 전달하여 여러 필드를 동시에 검색하는 복합 인덱스를 생성할 수 있습니다.

```php
Schema::create('articles', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->timestamps();

    $table->fullText(['title', 'body']);
});
```

PostgreSQL에서는 인덱스에 대한 언어 설정을 지정하여 단어의 어간 추출 방식을 제어할 수 있습니다.

```php
$table->fullText('body')->language('english');
```

인덱스 생성에 대한 자세한 내용은 [마이그레이션 문서](/docs/{{version}}/migrations#available-index-types)를 참고하세요.

<a name="running-full-text-queries"></a>
### Full-Text 쿼리 실행

인덱스가 준비되면 `whereFullText` 쿼리 빌더 메소드를 사용하여 검색할 수 있습니다. Laravel은 사용하는 데이터베이스 드라이버에 적합한 SQL을 생성합니다. 예를 들어 MariaDB와 MySQL에서는 `MATCH(...) AGAINST(...)`를, PostgreSQL에서는 `to_tsvector(...) @@ plainto_tsquery(...)`를 사용합니다.

```php
$articles = Article::whereFullText('body', 'web developer')->get();
```

MariaDB와 MySQL을 사용할 때 결과는 관련성 점수에 따라 자동으로 정렬됩니다. PostgreSQL에서 `whereFullText`는 매칭되는 레코드를 필터링하지만 관련성 기준으로 정렬하지는 않습니다. PostgreSQL에서 자동 관련성 정렬이 필요한 경우 [Scout의 데이터베이스 엔진](#database-engine) 사용을 고려하세요.

여러 컬럼에 걸쳐 복합 full-text 인덱스를 생성한 경우, `whereFullText`에 동일한 컬럼 배열을 전달하여 모든 컬럼을 대상으로 검색할 수 있습니다.

```php
$articles = Article::whereFullText(
    ['title', 'body'], 'web developer'
)->get();
```

`orWhereFullText` 메소드를 사용하면 full-text search 절을 "or" 조건으로 추가할 수 있습니다. 자세한 내용은 [쿼리 빌더 문서](/docs/{{version}}/queries#full-text-where-clauses)를 참고하세요.

<a name="semantic-vector-search"></a>
## Semantic / Vector Search

Full-text search는 키워드 매칭에 의존합니다. 쿼리의 단어가 데이터에 어떤 형태로든 존재해야 합니다. Semantic search는 근본적으로 다른 접근 방식을 취합니다. AI가 생성한 vector embedding을 사용하여 텍스트의 *의미*를 숫자 배열로 표현한 다음, 쿼리와 의미가 가장 유사한 결과를 찾습니다. 예를 들어, "best wineries in Napa Valley"를 검색하면 단어가 전혀 겹치지 않더라도 "Top Vineyards to Visit"이라는 제목의 글을 찾아낼 수 있습니다.

Vector search의 기본 워크플로우는 다음과 같습니다. 각 콘텐츠에 대한 embedding(숫자 배열)을 생성하여 데이터와 함께 저장한 다음, 검색 시 사용자의 쿼리에 대한 embedding을 생성하고 vector 공간에서 가장 가까운 저장된 embedding을 찾습니다.

> [!NOTE]
> Vector search는 `pgvector` 확장이 설치된 PostgreSQL 데이터베이스와 [Laravel AI SDK](/docs/{{version}}/ai-sdk)가 필요합니다. 모든 [Laravel Cloud](https://cloud.laravel.com) Serverless Postgres 데이터베이스에는 이미 `pgvector`가 포함되어 있습니다.

<a name="generating-embeddings"></a>
### Embedding 생성

Embedding은 텍스트의 의미적 의미를 나타내는 고차원 숫자 배열(일반적으로 수백 또는 수천 개의 숫자)입니다. Laravel의 `Stringable` 클래스에서 제공하는 `toEmbeddings` 메소드를 사용하여 문자열의 embedding을 생성할 수 있습니다.

```php
use Illuminate\Support\Str;

$embedding = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

여러 입력에 대한 embedding을 한 번에 생성하려면 — embedding 제공자에 대한 단일 API 호출만 필요하므로 하나씩 생성하는 것보다 효율적입니다 — `Embeddings` 클래스를 사용하세요.

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'Laravel is a PHP framework.',
])->generate();

$response->embeddings; // [[0.123, 0.456, ...], [0.789, 0.012, ...]]
```

Embedding 제공자 설정, 차원 커스터마이징, 캐싱에 대한 자세한 내용은 [AI SDK 문서](/docs/{{version}}/ai-sdk#embeddings)를 참고하세요.

<a name="storing-and-indexing-vectors"></a>
### Vector 저장 및 인덱싱

Vector embedding을 저장하려면 마이그레이션에서 `vector` 컬럼을 정의하고, embedding 제공자의 출력과 일치하는 차원 수를 지정하세요(예: OpenAI의 `text-embedding-3-small` 모델의 경우 1536). 또한 컬럼에 `index`를 호출하여 HNSW(Hierarchical Navigable Small World) 인덱스를 생성해야 합니다. 이 인덱스는 대규모 데이터셋에서 유사도 검색 속도를 크게 향상시킵니다.

```php
Schema::ensureVectorExtensionExists();

Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->vector('embedding', dimensions: 1536)->index();
    $table->timestamps();
});
```

`Schema::ensureVectorExtensionExists` 메소드는 테이블을 생성하기 전에 PostgreSQL 데이터베이스에 `pgvector` 확장이 활성화되어 있는지 확인합니다.

Eloquent 모델에서는 vector 컬럼을 `array`로 캐스팅하여 Laravel이 PHP 배열과 데이터베이스의 vector 형식 간 변환을 자동으로 처리하도록 하세요.

```php
protected function casts(): array
{
    return [
        'embedding' => 'array',
    ];
}
```

Vector 컬럼과 인덱스에 대한 자세한 내용은 [마이그레이션 문서](/docs/{{version}}/migrations#available-column-types)를 참고하세요.

<a name="querying-by-similarity"></a>
### 유사도 기반 쿼리

콘텐츠에 대한 embedding을 저장한 후, `whereVectorSimilarTo` 메소드를 사용하여 유사한 레코드를 검색할 수 있습니다. 이 메소드는 주어진 embedding을 저장된 vector와 코사인 유사도(cosine similarity)를 사용하여 비교하고, `minSimilarity` 임계값 이하의 결과를 필터링하며, 가장 유사한 레코드가 먼저 오도록 자동으로 관련성 기준으로 정렬합니다. 임계값은 `0.0`에서 `1.0` 사이의 값이어야 하며, `1.0`은 vector가 동일함을 의미합니다.

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

편의를 위해, embedding 배열 대신 일반 문자열이 주어지면 Laravel이 설정된 embedding 제공자를 사용하여 자동으로 embedding을 생성합니다. 이는 사용자의 검색 쿼리를 수동으로 embedding으로 변환하지 않고 직접 전달할 수 있음을 의미합니다.

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

Vector 쿼리에 대한 보다 세밀한 제어를 위해, `whereVectorDistanceLessThan`, `selectVectorDistance`, `orderByVectorDistance` 메소드도 사용할 수 있습니다. 이 메소드들은 유사도 점수 대신 거리 값으로 직접 작업하거나, 계산된 거리를 결과의 컬럼으로 선택하거나, 정렬을 수동으로 제어할 수 있게 해줍니다. 자세한 내용은 [쿼리 빌더 문서](/docs/{{version}}/queries#vector-similarity-clauses)와 [AI SDK 문서](/docs/{{version}}/ai-sdk#querying-embeddings)를 참고하세요.

<a name="reranking-results"></a>
## 결과 Reranking

Reranking은 AI 모델이 주어진 쿼리에 대해 각 결과의 의미적 관련성을 기준으로 결과 집합을 재정렬하는 기법입니다. Vector search와 달리 사전에 embedding을 계산하고 저장할 필요가 없으며, 어떤 텍스트 컬렉션에서든 작동합니다. 원시 콘텐츠와 쿼리를 입력으로 받아 관련성 순으로 정렬된 항목을 반환합니다.

Reranking은 빠른 초기 검색 단계 이후 두 번째 단계로 사용할 때 특히 강력합니다. 예를 들어, full-text search를 사용하여 수천 개의 레코드를 상위 50개 후보로 빠르게 좁힌 다음, reranking을 사용하여 가장 관련성 높은 결과를 상위에 배치할 수 있습니다. 이 "검색 후 재정렬(retrieve then rerank)" 패턴은 속도와 의미적 정확성을 모두 제공합니다.

`Reranking` 클래스를 사용하여 문자열 배열을 재정렬할 수 있습니다.

```php
use Laravel\Ai\Reranking;

$response = Reranking::of([
    'Django is a Python web framework.',
    'Laravel is a PHP web application framework.',
    'React is a JavaScript library for building user interfaces.',
])->rerank('PHP frameworks');

$response->first()->document; // "Laravel is a PHP web application framework."
```

Laravel 컬렉션에는 필드명(또는 클로저)과 쿼리를 받는 `rerank` 매크로도 있어 Eloquent 결과를 쉽게 재정렬할 수 있습니다.

```php
$articles = Article::all()
    ->rerank('body', 'Laravel tutorials');
```

Reranking 제공자 설정 및 사용 가능한 옵션에 대한 자세한 내용은 [AI SDK 문서](/docs/{{version}}/ai-sdk#reranking)를 참고하세요.

<a name="laravel-scout"></a>
## Laravel Scout

위에서 설명한 검색 기법들은 모두 코드에서 직접 호출하는 쿼리 빌더 메소드입니다. [Laravel Scout](/docs/{{version}}/scout)는 다른 접근 방식을 취합니다. Eloquent 모델에 `Searchable` 트레이트를 추가하면, Scout가 레코드가 생성, 업데이트, 삭제될 때 검색 인덱스를 자동으로 동기화합니다. 이는 인덱스 업데이트를 수동으로 관리하지 않고도 모델을 항상 검색 가능하게 유지하고 싶을 때 특히 편리합니다.

<a name="database-engine"></a>
### 데이터베이스 엔진

Scout의 내장 데이터베이스 엔진은 기존 데이터베이스에 대해 full-text 및 `LIKE` 검색을 수행합니다. 외부 서비스나 추가 인프라가 필요하지 않습니다. 모델에 `Searchable` 트레이트를 추가하고 검색 가능하게 할 컬럼을 반환하는 `toSearchableArray` 메소드를 정의하기만 하면 됩니다.

PHP 어트리뷰트를 사용하여 각 컬럼의 검색 전략을 제어할 수 있습니다. `SearchUsingFullText`는 데이터베이스의 full-text 인덱스를 사용하고, `SearchUsingPrefix`는 문자열의 시작 부분만 매칭합니다(`example%`). 어트리뷰트가 없는 컬럼은 양쪽에 와일드카드를 사용하는 기본 `LIKE` 전략(`%example%`)을 사용합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use Searchable;

    #[SearchUsingPrefix(['id'])]
    #[SearchUsingFullText(['title', 'body'])]
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
        ];
    }
}
```

> [!WARNING]
> 컬럼에 full-text 쿼리 제약 조건을 사용하도록 지정하기 전에, 해당 컬럼에 [full-text 인덱스](/docs/{{version}}/migrations#available-index-types)가 할당되어 있는지 확인하세요.

트레이트를 추가한 후, Scout의 `search` 메소드를 사용하여 모델을 검색할 수 있습니다. Scout의 데이터베이스 엔진은 PostgreSQL에서도 자동으로 관련성 기준으로 결과를 정렬합니다.

```php
$articles = Article::search('Laravel')->get();
```

데이터베이스 엔진은 검색 요구사항이 적당하고 외부 서비스를 배포하지 않으면서 Scout의 자동 인덱스 동기화 편의성을 원할 때 훌륭한 선택입니다. 필터링, 페이지네이션, 소프트 삭제된 레코드 처리를 포함한 대부분의 일반적인 검색 사용 사례를 잘 처리합니다. 자세한 내용은 [Scout 문서](/docs/{{version}}/scout#database-engine)를 참고하세요.

<a name="third-party-engines"></a>
### 서드파티 엔진

Scout는 [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org)와 같은 서드파티 검색 엔진도 지원합니다. 이러한 전용 검색 서비스는 오타 허용, 패싯 필터링, 지리 검색, 커스텀 랭킹 규칙과 같은 고급 기능을 제공합니다. 이러한 기능은 매우 대규모의 환경이나 고도로 세련된 검색 자동 완성 경험이 필요할 때 중요해집니다.

Scout는 모든 드라이버에 걸쳐 통합된 API를 제공하므로, 나중에 데이터베이스 엔진에서 서드파티 엔진으로 전환할 때 최소한의 코드 변경만 필요합니다. 데이터베이스 엔진으로 시작한 후, 애플리케이션의 요구사항이 데이터베이스가 제공할 수 있는 범위를 초과할 때만 서드파티 서비스로 마이그레이션할 수 있습니다.

서드파티 엔진 설정에 대한 자세한 내용은 [Scout 문서](/docs/{{version}}/scout)를 참고하세요.

> [!NOTE]
> 많은 애플리케이션은 외부 검색 엔진이 필요하지 않습니다. 이 페이지에서 설명하는 내장 기법들은 대부분의 사용 사례를 충분히 다룹니다.

<a name="combining-techniques"></a>
## 기법 결합

이 페이지에서 설명하는 검색 기법들은 상호 배타적이지 않습니다. 이를 결합하면 종종 최상의 결과를 얻을 수 있습니다. 다음은 이러한 도구들이 함께 작동하는 방식을 보여주는 두 가지 일반적인 패턴입니다.

**Full-Text 검색 + Reranking**

Full-text search를 사용하여 대규모 데이터셋을 후보 집합으로 빠르게 좁힌 다음, reranking을 적용하여 해당 후보들을 의미적 관련성 기준으로 정렬합니다. 이를 통해 데이터베이스 네이티브 full-text search의 속도와 AI 기반 관련성 점수의 정확성을 모두 얻을 수 있습니다.

```php
$articles = Article::query()
    ->whereFullText('body', $request->input('query'))
    ->limit(50)
    ->get()
    ->rerank('body', $request->input('query'), limit: 10);
```

**Vector Search + 전통적 필터**

Vector 유사도와 표준 `where` 절을 결합하여 시맨틱 검색의 범위를 레코드의 하위 집합으로 제한합니다. 이는 의미 기반 검색이 필요하지만 소유권, 카테고리 또는 기타 속성별로 결과를 제한해야 할 때 유용합니다.

```php
$documents = Document::query()
    ->where('team_id', $user->team_id)
    ->whereVectorSimilarTo('embedding', $request->input('query'))
    ->limit(10)
    ->get();
```

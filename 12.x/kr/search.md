# 검색(Search)

- [소개](#introduction)
    - [전체 텍스트 검색](#introduction-full-text-search)
    - [시맨틱 / 벡터 검색](#introduction-semantic-vector-search)
    - [리랭킹](#introduction-reranking)
    - [Scout 검색 엔진](#introduction-scout-search-engines)
- [전체 텍스트 검색](#full-text-search)
    - [전체 텍스트 인덱스 추가](#adding-full-text-indexes)
    - [전체 텍스트 쿼리 실행](#running-full-text-queries)
- [시맨틱 / 벡터 검색](#semantic-vector-search)
    - [임베딩 생성](#generating-embeddings)
    - [벡터 저장 및 인덱싱](#storing-and-indexing-vectors)
    - [유사도 기반 쿼리](#querying-by-similarity)
- [결과 리랭킹](#reranking-results)
- [Laravel Scout](#laravel-scout)
    - [데이터베이스 엔진](#database-engine)
    - [서드파티 엔진](#third-party-engines)
- [기법 결합하기](#combining-techniques)

<a name="introduction"></a>
## 소개

거의 모든 애플리케이션에는 검색이 필요합니다. 사용자가 지식 베이스에서 관련 문서를 검색하거나, 제품 카탈로그를 탐색하거나, 문서 코퍼스에 대해 자연어 질문을 하든, Laravel은 이러한 각 시나리오를 처리할 수 있는 내장 도구를 제공합니다 — 외부 서비스 없이도 가능한 경우가 많습니다.

대부분의 애플리케이션은 Laravel이 제공하는 내장 데이터베이스 기반 옵션으로 충분합니다 — 외부 검색 서비스는 오타 허용, 패싯 필터링 또는 대규모 지리적 검색과 같은 기능이 필요한 경우에만 필요합니다.

<a name="introduction-full-text-search"></a>
#### 전체 텍스트 검색

검색어와 얼마나 잘 일치하는지에 따라 데이터베이스가 결과를 채점하고 정렬하는 키워드 관련성 랭킹이 필요한 경우, Laravel의 `whereFullText` 쿼리 빌더 메서드는 MariaDB, MySQL 및 PostgreSQL의 네이티브 전체 텍스트 인덱스를 활용합니다. 전체 텍스트 검색은 단어 경계와 어간을 이해하므로 "running"을 검색하면 "run"이 포함된 레코드와 일치할 수 있습니다. 외부 서비스가 필요하지 않습니다.

<a name="introduction-semantic-vector-search"></a>
#### 시맨틱 / 벡터 검색

정확한 키워드가 아닌 *의미*로 결과를 매칭하는 AI 기반 시맨틱 검색의 경우, `whereVectorSimilarTo` 쿼리 빌더 메서드는 `pgvector` 확장이 설치된 PostgreSQL에 저장된 벡터 임베딩을 사용합니다. 예를 들어, "best wineries in Napa Valley"를 검색하면 단어가 겹치지 않더라도 "Top Vineyards to Visit"이라는 제목의 기사를 찾아낼 수 있습니다. 벡터 검색에는 `pgvector` 확장이 설치된 PostgreSQL과 [Laravel AI SDK](/docs/{{version}}/ai-sdk)가 필요합니다.

<a name="introduction-reranking"></a>
#### 리랭킹

Laravel의 [AI SDK](/docs/{{version}}/ai-sdk)는 AI 모델을 사용하여 쿼리에 대한 시맨틱 관련성에 따라 결과 세트를 재정렬하는 리랭킹 기능을 제공합니다. 리랭킹은 전체 텍스트 검색과 같은 빠른 초기 검색 단계 이후의 두 번째 단계로서 특히 강력합니다 — 속도와 시맨틱 정확도를 모두 제공합니다.

<a name="introduction-scout-search-engines"></a>
#### Laravel Scout 검색

Eloquent 모델과 자동으로 검색 인덱스를 동기화하는 `Searchable` 트레이트를 원하는 애플리케이션의 경우, [Laravel Scout](/docs/{{version}}/scout)는 내장 데이터베이스 엔진과 Algolia, Meilisearch, Typesense와 같은 서드파티 서비스용 드라이버를 모두 제공합니다.

<a name="full-text-search"></a>
## 전체 텍스트 검색

`LIKE` 쿼리는 단순한 부분 문자열 매칭에는 잘 작동하지만 언어를 이해하지 못합니다. "running"에 대한 `LIKE` 검색은 "run"을 포함하는 레코드를 찾지 못하며, 결과는 관련성에 따라 정렬되지 않고 데이터베이스가 찾는 순서대로 반환됩니다. 전체 텍스트 검색은 단어 경계, 어간 및 관련성 점수를 이해하는 특수 인덱스를 사용하여 이 두 가지 문제를 해결하며, 데이터베이스가 가장 관련성 높은 결과를 먼저 반환할 수 있게 합니다.

빠른 전체 텍스트 검색은 MariaDB, MySQL 및 PostgreSQL에 내장되어 있습니다 — 외부 검색 서비스가 필요하지 않습니다. 검색하려는 컬럼에 전체 텍스트 인덱스를 추가하고 `whereFullText` 쿼리 빌더 메서드를 사용하기만 하면 됩니다.

> [!WARNING]
> 전체 텍스트 검색은 현재 MariaDB, MySQL 및 PostgreSQL에서 지원됩니다.

<a name="adding-full-text-indexes"></a>
### 전체 텍스트 인덱스 추가

전체 텍스트 검색을 사용하려면 먼저 검색하려는 컬럼에 전체 텍스트 인덱스를 추가합니다. 단일 컬럼에 인덱스를 추가하거나, 여러 필드를 동시에 검색하는 복합 인덱스를 생성하기 위해 컬럼 배열을 전달할 수 있습니다.

```php
Schema::create('articles', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->timestamps();

    $table->fullText(['title', 'body']);
});
```

PostgreSQL에서는 단어 어간 처리 방식을 제어하는 인덱스의 언어 설정을 지정할 수 있습니다.

```php
$table->fullText('body')->language('english');
```

인덱스 생성에 대한 자세한 정보는 [마이그레이션 문서](/docs/{{version}}/migrations#available-index-types)를 참조하세요.

<a name="running-full-text-queries"></a>
### 전체 텍스트 쿼리 실행

인덱스가 준비되면 `whereFullText` 쿼리 빌더 메서드를 사용하여 검색합니다. Laravel은 데이터베이스 드라이버에 적합한 SQL을 생성합니다 — 예를 들어, MariaDB 및 MySQL에서는 `MATCH(...) AGAINST(...)`, PostgreSQL에서는 `to_tsvector(...) @@ plainto_tsquery(...)`:

```php
$articles = Article::whereFullText('body', 'web developer')->get();
```

MariaDB 및 MySQL을 사용할 때 결과는 자동으로 관련성 점수에 따라 정렬됩니다. PostgreSQL에서는 `whereFullText`가 일치하는 레코드를 필터링하지만 관련성에 따라 정렬하지 않습니다 — PostgreSQL에서 자동 관련성 정렬이 필요한 경우 이를 자동으로 처리하는 [Scout의 데이터베이스 엔진](#database-engine) 사용을 고려하세요.

여러 컬럼에 걸쳐 복합 전체 텍스트 인덱스를 생성한 경우, `whereFullText`에 동일한 컬럼 배열을 전달하여 모든 컬럼에서 검색할 수 있습니다.

```php
$articles = Article::whereFullText(
    ['title', 'body'], 'web developer'
)->get();
```

`orWhereFullText` 메서드는 전체 텍스트 검색 절을 "or" 조건으로 추가하는 데 사용할 수 있습니다. 전체 내용은 [쿼리 빌더 문서](/docs/{{version}}/queries#full-text-where-clauses)를 참조하세요.

<a name="semantic-vector-search"></a>
## 시맨틱 / 벡터 검색

전체 텍스트 검색은 키워드 매칭에 의존합니다 — 쿼리의 단어가 (어떤 형태로든) 데이터에 나타나야 합니다. 시맨틱 검색은 근본적으로 다른 접근 방식을 취합니다. AI가 생성한 벡터 임베딩을 사용하여 텍스트의 *의미*를 숫자 배열로 표현하고, 쿼리와 의미가 가장 유사한 결과를 찾습니다. 예를 들어, "best wineries in Napa Valley"를 검색하면 단어가 전혀 겹치지 않더라도 "Top Vineyards to Visit"이라는 제목의 기사를 찾아낼 수 있습니다.

벡터 검색의 기본 워크플로우는: 각 콘텐츠에 대해 임베딩(숫자 배열)을 생성하여 데이터와 함께 저장한 다음, 검색 시 사용자 쿼리에 대한 임베딩을 생성하고 벡터 공간에서 가장 가까운 저장된 임베딩을 찾는 것입니다.

> [!NOTE]
> 벡터 검색에는 `pgvector` 확장이 설치된 PostgreSQL 데이터베이스와 [Laravel AI SDK](/docs/{{version}}/ai-sdk)가 필요합니다. 모든 [Laravel Cloud](https://cloud.laravel.com) Serverless Postgres 데이터베이스에는 이미 `pgvector`가 포함되어 있습니다.

<a name="generating-embeddings"></a>
### 임베딩 생성

임베딩은 텍스트의 시맨틱 의미를 나타내는 고차원 숫자 배열(일반적으로 수백 또는 수천 개의 숫자)입니다. Laravel의 `Stringable` 클래스에서 사용 가능한 `toEmbeddings` 메서드를 사용하여 문자열에 대한 임베딩을 생성할 수 있습니다.

```php
use Illuminate\Support\Str;

$embedding = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

여러 입력에 대한 임베딩을 한 번에 생성하려면 — 임베딩 프로바이더에 단일 API 호출만 필요하므로 하나씩 생성하는 것보다 효율적입니다 — `Embeddings` 클래스를 사용합니다.

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'Laravel is a PHP framework.',
])->generate();

$response->embeddings; // [[0.123, 0.456, ...], [0.789, 0.012, ...]]
```

임베딩 프로바이더 설정, 차원 커스터마이징 및 캐싱에 대한 자세한 내용은 [AI SDK 문서](/docs/{{version}}/ai-sdk#embeddings)를 참조하세요.

<a name="storing-and-indexing-vectors"></a>
### 벡터 저장 및 인덱싱

벡터 임베딩을 저장하려면 마이그레이션에서 임베딩 프로바이더의 출력과 일치하는 차원 수를 지정하여 `vector` 컬럼을 정의합니다(예: OpenAI의 `text-embedding-3-small` 모델의 경우 1536). 또한 대규모 데이터 세트에서 유사성 검색을 크게 가속화하는 HNSW(Hierarchical Navigable Small World) 인덱스를 생성하기 위해 컬럼에 `index`를 호출해야 합니다.

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

`Schema::ensureVectorExtensionExists` 메서드는 테이블을 생성하기 전에 PostgreSQL 데이터베이스에서 `pgvector` 확장이 활성화되어 있는지 확인합니다.

Eloquent 모델에서 벡터 컬럼을 `array`로 캐스팅하여 Laravel이 PHP 배열과 데이터베이스의 벡터 형식 간의 변환을 자동으로 처리하도록 합니다.

```php
protected function casts(): array
{
    return [
        'embedding' => 'array',
    ];
}
```

벡터 컬럼과 인덱스에 대한 자세한 내용은 [마이그레이션 문서](/docs/{{version}}/migrations#available-column-types)를 참조하세요.

<a name="querying-by-similarity"></a>
### 유사도 기반 쿼리

콘텐츠에 대한 임베딩을 저장한 후 `whereVectorSimilarTo` 메서드를 사용하여 유사한 레코드를 검색할 수 있습니다. 이 메서드는 주어진 임베딩을 코사인 유사도를 사용하여 저장된 벡터와 비교하고, `minSimilarity` 임계값 미만의 결과를 필터링하며, 가장 유사한 레코드가 먼저 오도록 자동으로 결과를 정렬합니다. 임계값은 `0.0`에서 `1.0` 사이의 값이어야 하며, `1.0`은 벡터가 동일함을 의미합니다.

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

편의를 위해 임베딩 배열 대신 일반 문자열이 제공되면 Laravel은 구성된 임베딩 프로바이더를 사용하여 자동으로 임베딩을 생성합니다. 이는 수동으로 임베딩으로 변환하지 않고도 사용자의 검색 쿼리를 직접 전달할 수 있음을 의미합니다.

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

벡터 쿼리에 대한 더 낮은 수준의 제어를 위해 `whereVectorDistanceLessThan`, `selectVectorDistance`, `orderByVectorDistance` 메서드도 사용할 수 있습니다. 이 메서드들은 유사도 점수 대신 거리 값으로 직접 작업하거나, 결과에서 계산된 거리를 컬럼으로 선택하거나, 정렬을 수동으로 제어할 수 있게 합니다. 전체 내용은 [쿼리 빌더 문서](/docs/{{version}}/queries#vector-similarity-clauses) 및 [AI SDK 문서](/docs/{{version}}/ai-sdk#querying-embeddings)를 참조하세요.

<a name="reranking-results"></a>
## 결과 리랭킹

리랭킹은 AI 모델이 주어진 쿼리에 대해 각 결과가 얼마나 시맨틱으로 관련이 있는지에 따라 결과 세트를 재정렬하는 기법입니다. 임베딩을 미리 계산하고 저장해야 하는 벡터 검색과 달리, 리랭킹은 모든 텍스트 컬렉션에서 작동합니다 — 원시 콘텐츠와 쿼리를 입력으로 받아 관련성에 따라 정렬된 항목을 반환합니다.

리랭킹은 빠른 초기 검색 단계 이후의 두 번째 단계로서 특히 강력합니다. 예를 들어, 전체 텍스트 검색을 사용하여 수천 개의 레코드를 상위 50개 후보로 빠르게 좁힌 다음, 리랭킹을 사용하여 가장 관련성 높은 결과를 맨 위에 놓을 수 있습니다. 이 "검색 후 리랭킹" 패턴은 속도와 시맨틱 정확도를 모두 제공합니다.

`Reranking` 클래스를 사용하여 문자열 배열을 리랭킹할 수 있습니다.

```php
use Laravel\Ai\Reranking;

$response = Reranking::of([
    'Django is a Python web framework.',
    'Laravel is a PHP web application framework.',
    'React is a JavaScript library for building user interfaces.',
])->rerank('PHP frameworks');

$response->first()->document; // "Laravel is a PHP web application framework."
```

Laravel 컬렉션에는 필드 이름(또는 클로저)과 쿼리를 받는 `rerank` 매크로도 있어 Eloquent 결과를 쉽게 리랭킹할 수 있습니다.

```php
$articles = Article::all()
    ->rerank('body', 'Laravel tutorials');
```

리랭킹 프로바이더 설정 및 사용 가능한 옵션에 대한 전체 내용은 [AI SDK 문서](/docs/{{version}}/ai-sdk#reranking)를 참조하세요.

<a name="laravel-scout"></a>
## Laravel Scout

위에서 설명한 검색 기법은 모두 코드에서 직접 호출하는 쿼리 빌더 메서드입니다. [Laravel Scout](/docs/{{version}}/scout)는 다른 접근 방식을 취합니다. Eloquent 모델에 추가하는 `Searchable` 트레이트를 제공하며, 레코드가 생성, 업데이트, 삭제될 때 Scout가 자동으로 검색 인덱스를 동기화합니다. 이는 인덱스 업데이트를 수동으로 관리하지 않고도 모델을 항상 검색 가능하게 하려는 경우 특히 편리합니다.

<a name="database-engine"></a>
### 데이터베이스 엔진

Scout의 내장 데이터베이스 엔진은 기존 데이터베이스에 대해 전체 텍스트 및 `LIKE` 검색을 수행합니다 — 외부 서비스나 추가 인프라가 필요하지 않습니다. 모델에 `Searchable` 트레이트를 추가하고 검색 가능한 컬럼을 반환하는 `toSearchableArray` 메서드를 정의하기만 하면 됩니다.

PHP 속성을 사용하여 각 컬럼의 검색 전략을 제어할 수 있습니다. `SearchUsingFullText`는 데이터베이스의 전체 텍스트 인덱스를 사용하고, `SearchUsingPrefix`는 문자열의 시작 부분에서만 매칭합니다(`example%`), 속성이 없는 컬럼은 양쪽에 와일드카드가 있는 기본 `LIKE` 전략을 사용합니다(`%example%`).

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
> 컬럼이 전체 텍스트 쿼리 제약 조건을 사용하도록 지정하기 전에 컬럼에 [전체 텍스트 인덱스](/docs/{{version}}/migrations#available-index-types)가 할당되었는지 확인하세요.

트레이트가 추가되면 Scout의 `search` 메서드를 사용하여 모델을 검색할 수 있습니다. Scout의 데이터베이스 엔진은 PostgreSQL에서도 자동으로 결과를 관련성에 따라 정렬합니다.

```php
$articles = Article::search('Laravel')->get();
```

데이터베이스 엔진은 검색 요구 사항이 적당하고 외부 서비스를 배포하지 않고도 Scout의 자동 인덱스 동기화의 편의성을 원하는 경우 훌륭한 선택입니다. 필터링, 페이지네이션, 소프트 삭제 레코드 처리를 포함한 가장 일반적인 검색 사용 사례를 잘 처리합니다. 전체 내용은 [Scout 문서](/docs/{{version}}/scout#database-engine)를 참조하세요.

<a name="third-party-engines"></a>
### 서드파티 엔진

Scout는 [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org)와 같은 서드파티 검색 엔진도 지원합니다. 이러한 전용 검색 서비스는 오타 허용, 패싯 필터링, 지리적 검색, 커스텀 랭킹 규칙과 같은 고급 기능을 제공합니다 — 매우 대규모이거나 고도로 다듬어진 검색 자동 완성 경험이 필요한 경우 중요한 기능입니다.

Scout는 모든 드라이버에 걸쳐 통합 API를 제공하므로 나중에 데이터베이스 엔진에서 서드파티 엔진으로 전환하려면 최소한의 코드 변경만 필요합니다. 데이터베이스 엔진으로 시작하고 애플리케이션의 요구 사항이 데이터베이스가 제공할 수 있는 것을 초과하는 경우에만 서드파티 서비스로 마이그레이션할 수 있습니다.

서드파티 엔진 설정에 대한 전체 내용은 [Scout 문서](/docs/{{version}}/scout)를 참조하세요.

> [!NOTE]
> 많은 애플리케이션은 외부 검색 엔진이 필요하지 않습니다. 이 페이지에서 설명하는 내장 기법이 대부분의 사용 사례를 다룹니다.

<a name="combining-techniques"></a>
## 기법 결합하기

이 페이지에서 설명하는 검색 기법은 상호 배타적이지 않습니다 — 결합하면 종종 최상의 결과를 얻을 수 있습니다. 이러한 도구가 함께 작동하는 방식을 보여주는 두 가지 일반적인 패턴이 있습니다.

**전체 텍스트 검색 + 리랭킹**

전체 텍스트 검색을 사용하여 대규모 데이터 세트를 후보 세트로 빠르게 좁힌 다음, 리랭킹을 적용하여 시맨틱 관련성에 따라 후보를 정렬합니다. 이는 데이터베이스 네이티브 전체 텍스트 검색의 속도와 AI 기반 관련성 점수의 정확도를 제공합니다.

```php
$articles = Article::query()
    ->whereFullText('body', $request->input('query'))
    ->limit(50)
    ->get()
    ->rerank('body', $request->input('query'), limit: 10);
```

**벡터 검색 + 기존 필터**

벡터 유사도를 표준 `where` 절과 결합하여 시맨틱 검색을 레코드의 하위 집합으로 제한합니다. 의미 기반 검색을 원하지만 소유권, 카테고리 또는 기타 속성으로 결과를 제한해야 하는 경우 유용합니다.

```php
$documents = Document::query()
    ->where('team_id', $user->team_id)
    ->whereVectorSimilarTo('embedding', $request->input('query'))
    ->limit(10)
    ->get();
```

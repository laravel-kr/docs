# 릴리스 노트(Release Notes)

- [버전 관리 체계](#versioning-scheme)
- [지원 정책](#support-policy)
- [Laravel 13](#laravel-13)

<a name="versioning-scheme"></a>
## 버전 관리 체계(Versioning Scheme)

Laravel과 그 외 공식 패키지들은 [시맨틱 버저닝(Semantic Versioning)](https://semver.org)을 따릅니다. 메이저 프레임워크 릴리스는 매년(~1분기) 출시되며, 마이너 및 패치 릴리스는 매주 출시될 수 있습니다. 마이너 및 패치 릴리스에는 **절대로** 하위 호환성을 깨는 변경사항이 포함되어서는 안 됩니다.

애플리케이션이나 패키지에서 Laravel 프레임워크 또는 그 컴포넌트를 참조할 때는 Laravel의 메이저 릴리스에 하위 호환성을 깨는 변경사항이 포함될 수 있으므로 항상 `^13.0`과 같은 버전 제약 조건을 사용해야 합니다. 그러나 저희는 항상 하루 이내에 새로운 메이저 릴리스로 업그레이드할 수 있도록 노력하고 있습니다.

<a name="named-arguments"></a>
#### 명명된 인수(Named Arguments)

[명명된 인수](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)는 Laravel의 하위 호환성 가이드라인에 포함되지 않습니다. Laravel 코드베이스를 개선하기 위해 필요한 경우 함수 인수의 이름을 변경할 수 있습니다. 따라서 Laravel 메서드를 호출할 때 명명된 인수를 사용하는 것은 매개변수 이름이 향후 변경될 수 있다는 점을 이해하고 신중하게 수행해야 합니다.

<a name="support-policy"></a>
## 지원 정책(Support Policy)

모든 Laravel 릴리스에 대해 버그 수정은 18개월 동안 제공되고 보안 수정은 2년 동안 제공됩니다. 모든 추가 라이브러리의 경우 최신 메이저 릴리스만 버그 수정을 받습니다. 또한 [Laravel이 지원하는](/docs/{{version}}/database#introduction) 데이터베이스 버전을 검토해 주세요.

<div class="overflow-auto">

| 버전 | PHP (*)   | 릴리스             | 버그 수정 지원 기간   | 보안 수정 지원 기간    |
| ----- |-----------| ------------------- | ------------------- | -------------------- |
| 10    | 8.1 - 8.3 | 2023년 2월 14일    | 2024년 8월 6일      | 2025년 2월 4일       |
| 11    | 8.2 - 8.4 | 2024년 3월 12일    | 2025년 9월 3일      | 2026년 3월 12일      |
| 12    | 8.2 - 8.5 | 2025년 2월 24일    | 2026년 8월 13일     | 2027년 2월 24일      |
| 13    | 8.3 - 8.5 | 2026년 3월 17일    | 2027년 Q3           | 2028년 3월 17일      |

</div>

<div class="version-colors">
    <div class="end-of-life">
        <div class="color-box"></div>
        <div>지원 종료</div>
    </div>
    <div class="security-fixes">
        <div class="color-box"></div>
        <div>보안 수정만 지원</div>
    </div>
</div>

(*) 지원되는 PHP 버전

<a name="laravel-13"></a>
## Laravel 13

Laravel 13는 AI 네이티브 워크플로우, 더 강력한 기본값, 더 표현력 있는 개발자 API에 초점을 맞춘 Laravel의 연간 릴리스 케이던스를 이어갑니다. 이번 릴리스에는 퍼스트파티 AI 프리미티브, JSON:API 리소스, 시맨틱/벡터 검색 기능, 그리고 큐, 캐시, 보안 전반에 걸친 점진적 개선 사항이 포함되어 있습니다.

<a name="minimal-breaking-changes"></a>
### 최소한의 하위 호환성 변경(Minimal Breaking Changes)

이번 릴리스 사이클에서 저희의 주요 초점은 하위 호환성을 깨는 변경사항을 최소화하는 것이었습니다. 대신 기존 애플리케이션을 손상시키지 않으면서 일년 내내 지속적인 사용성 개선을 제공하는 데 집중했습니다.

따라서 Laravel 13 릴리스는 노력 측면에서는 비교적 작은 업그레이드이면서도 상당한 새로운 기능을 제공합니다. 이러한 이유로 대부분의 Laravel 애플리케이션은 애플리케이션 코드를 크게 변경하지 않고도 Laravel 13으로 업그레이드할 수 있습니다.

<a name="php-8"></a>
### PHP 8.3

Laravel 13.x는 최소 PHP 8.3 버전을 요구합니다.

<a name="ai-sdk"></a>
### Laravel AI SDK

Laravel 13는 텍스트 생성, 도구 호출 에이전트, 임베딩, 오디오, 이미지, 벡터 스토어 통합을 위한 통합 API를 제공하는 퍼스트파티 [Laravel AI SDK](https://laravel.com/ai)를 도입합니다.

AI SDK를 사용하면 일관된 Laravel 네이티브 개발자 경험을 유지하면서 프로바이더에 구애받지 않는 AI 기능을 구축할 수 있습니다.

예를 들어, 기본 에이전트는 단일 호출로 프롬프트할 수 있습니다:

```php
use App\Ai\Agents\SalesCoach;

$response = SalesCoach::make()->prompt('Analyze this sales transcript...');

return (string) $response;
```

Laravel AI SDK는 이미지, 오디오, 임베딩도 생성할 수 있습니다:

시각적 생성 사용 사례의 경우, SDK는 자연어 프롬프트에서 이미지를 생성하기 위한 깔끔한 API를 제공합니다:

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')->generate();

$rawContent = (string) $image;
```

음성 경험의 경우, 어시스턴트, 나레이션, 접근성 기능을 위해 텍스트에서 자연스러운 오디오를 합성할 수 있습니다:

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')->generate();

$rawContent = (string) $audio;
```

시맨틱 검색 및 검색 워크플로우의 경우, 문자열에서 직접 임베딩을 생성할 수 있습니다:

```php
use Illuminate\Support\Str;

$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

<a name="json-api"></a>
### JSON:API 리소스

Laravel은 이제 [JSON:API 사양](https://jsonapi.org/)을 준수하는 응답을 반환하기 쉽게 만드는 퍼스트파티 [JSON:API 리소스](/docs/{{version}}/eloquent-resources#jsonapi-resources)를 포함합니다.

JSON:API 리소스는 리소스 객체 직렬화, 관계 포함, 희소 필드셋, 링크, JSON:API 호환 응답 헤더를 처리합니다.

<a name="request-forgery-protection"></a>
### 요청 위조 방지(Request Forgery Protection)

보안을 위해, Laravel의 [요청 위조 방지](/docs/{{version}}/csrf#preventing-csrf-requests) 미들웨어가 `PreventRequestForgery`로 강화 및 공식화되었으며, 토큰 기반 CSRF 보호와의 호환성을 유지하면서 출처 인식 요청 검증이 추가되었습니다.

<a name="queue-routing"></a>
### 큐 라우팅(Queue Routing)

Laravel 13은 `Queue::route(...)`를 통한 [클래스별 큐 라우팅](/docs/{{version}}/queues#queue-routing)을 추가하여, 특정 작업에 대한 기본 큐/연결 라우팅 규칙을 중앙에서 정의할 수 있습니다:

```php
Queue::route(ProcessPodcast::class, connection: 'redis', queue: 'podcasts');
```

<a name="php-attributes"></a>
### 확장된 PHP 어트리뷰트(Expanded PHP Attributes)

Laravel 13은 프레임워크 전반에 걸쳐 퍼스트파티 PHP 어트리뷰트 지원을 계속 확장하여, 일반적인 설정과 동작 관심사를 보다 선언적이고 클래스 및 메서드와 가까운 곳에서 관리할 수 있게 합니다.

주요 추가 사항으로는 [`#[Middleware]`](/docs/{{version}}/controllers#controller-middleware) 및 [`#[Authorize]`](/docs/{{version}}/controllers#authorization-attributes)와 같은 컨트롤러 및 인가 어트리뷰트, [`#[Tries]`](/docs/{{version}}/queues#max-job-attempts-and-timeout), [`#[Backoff]`](/docs/{{version}}/queues#dealing-with-failed-jobs), [`#[Timeout]`](/docs/{{version}}/queues#max-job-attempts-and-timeout), [`#[FailOnTimeout]`](/docs/{{version}}/queues#failing-on-timeout)와 같은 큐 지향 작업 제어 어트리뷰트가 있습니다.

예를 들어, 컨트롤러 미들웨어와 정책 검사를 이제 클래스와 메서드에 직접 선언할 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Routing\Attributes\Controllers\Authorize;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
class CommentController
{
    #[Middleware('subscribed')]
    #[Authorize('create', [Comment::class, 'post'])]
    public function store(Post $post)
    {
        // ...
    }
}
```

Eloquent, 이벤트, 알림, 유효성 검사, 테스트, 리소스 직렬화 API 전반에 걸쳐 추가 어트리뷰트도 도입되어, 프레임워크의 더 많은 영역에서 일관된 어트리뷰트 우선 옵션을 제공합니다.

<a name="cache-touch"></a>
### 캐시 TTL 연장(Cache TTL Extension)

Laravel은 이제 값을 가져와 다시 저장하지 않고도 기존 캐시 아이템의 TTL을 연장할 수 있는 [`Cache::touch(...)`](/docs/{{version}}/cache)를 포함합니다.

<a name="semantic-search"></a>
### 시맨틱 / 벡터 검색(Semantic / Vector Search)

Laravel 13은 네이티브 벡터 쿼리 지원, 임베딩 워크플로우, 관련 API를 통해 시맨틱 검색 기능을 심화합니다. 이러한 기능은 [검색](/docs/{{version}}/search#semantic-vector-search), [쿼리](/docs/{{version}}/queries#vector-similarity-clauses), [AI SDK](/docs/{{version}}/ai-sdk#embeddings) 전반에 걸쳐 문서화되어 있습니다.

이러한 기능을 통해 PostgreSQL + `pgvector`를 사용하여 AI 기반 검색 경험을 구축하는 것이 간단해집니다. 문자열에서 직접 생성된 임베딩에 대한 유사도 검색도 포함됩니다.

예를 들어, 쿼리 빌더에서 직접 시맨틱 유사도 검색을 실행할 수 있습니다:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

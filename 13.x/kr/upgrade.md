# 업그레이드 가이드

- [12.x에서 13.0으로 업그레이드](#upgrade-13.0)
    - [AI를 사용한 업그레이드](#upgrading-using-ai)

<a name="high-impact-changes"></a>
## 영향도 높음

<div class="content-list" markdown="1">

- [의존성 업데이트](#updating-dependencies)
- [Laravel 인스톨러 업데이트](#updating-the-laravel-installer)
- [요청 위조 방지](#request-forgery-protection)

</div>

<a name="medium-impact-changes"></a>
## 영향도 중간

<div class="content-list" markdown="1">

- [캐시 `serializable_classes` 설정](#cache-serializable_classes-configuration)
- [MySQL 또는 MariaDB에서의 데이터베이스 `upsert`](#database-upsert-mariadb-mysql)

</div>

<a name="low-impact-changes"></a>
## 영향도 낮음

<div class="content-list" markdown="1">

- [캐시 접두사 및 세션 쿠키 이름](#cache-prefixes-and-session-cookie-names)
- [컬렉션 모델 직렬화에서 Eager-Loaded 관계 복원](#collection-model-serialization-restores-eager-loaded-relations)
- [`Container::call`과 Nullable 클래스 기본값](#containercall-and-nullable-class-defaults)
- [도메인 라우트 등록 우선순위](#domain-route-registration-precedence)
- [`JobAttempted` 이벤트 예외 페이로드](#jobattempted-event-exception-payload)
- [Manager `extend` 콜백 바인딩](#manager-extend-callback-binding)
- [MySQL `DELETE` 쿼리에서 `JOIN`, `ORDER BY`, `LIMIT`](#mysql-delete-queries-with-join-order-by-and-limit)
- [페이지네이션 Bootstrap 뷰 이름](#pagination-bootstrap-view-names)
- [다형성 피벗 테이블 이름 생성](#polymorphic-pivot-table-name-generation)
- [`QueueBusy` 이벤트 속성 이름 변경](#queuebusy-event-property-rename)
- [`Str` 팩토리 테스트 간 초기화](#str-factories-reset-between-tests)

</div>

<a name="upgrade-13.0"></a>
## 12.x에서 13.0으로 업그레이드

#### 예상 업그레이드 시간: 10분

> [!NOTE]
> 가능한 모든 주요 변경 사항을 문서화하려고 노력하고 있습니다. 일부 주요 변경 사항은 프레임워크의 잘 사용되지 않는 부분에 있기 때문에 이러한 변경 사항 중 일부만 실제로 애플리케이션에 영향을 줄 수 있습니다. 시간을 절약하려면 [Shift](https://laravelshift.com)를 사용할 수 있습니다. Shift는 Laravel 업그레이드를 자동화하는 커뮤니티 유지 관리 서비스입니다.

<a name="upgrading-using-ai"></a>
### AI를 사용한 업그레이드

[Laravel Boost](https://github.com/laravel/boost)를 사용하여 업그레이드를 자동화할 수 있습니다. Boost는 AI 어시스턴트에 가이드 업그레이드 프롬프트를 제공하는 퍼스트파티 MCP 서버입니다. Laravel 12 애플리케이션에 설치한 후 Claude Code, Cursor, OpenCode, Gemini 또는 VS Code에서 `/upgrade-laravel-v13` 슬래시 명령어를 사용하여 Laravel 13으로의 업그레이드를 시작하세요. 이 명령어는 Laravel Boost `^2.0`이 필요합니다.

<a name="updating-dependencies"></a>
### 의존성 업데이트

**영향 가능성: 높음**

애플리케이션의 `composer.json` 파일에서 다음 의존성을 업데이트해야 합니다:

<div class="content-list" markdown="1">

- `laravel/framework`를 `^13.0`으로
- `laravel/boost`를 `^2.0`으로
- `laravel/tinker`를 `^3.0`으로
- `phpunit/phpunit`를 `^12.0`으로
- `pestphp/pest`를 `^4.0`으로

</div>

<a name="updating-the-laravel-installer"></a>
### Laravel 인스톨러 업데이트

Laravel 인스톨러 CLI 도구를 사용하여 새로운 Laravel 애플리케이션을 생성하는 경우, Laravel 13.x 호환성을 위해 인스톨러 설치를 업데이트해야 합니다.

`composer global require`를 통해 Laravel 인스톨러를 설치한 경우 `composer global update`를 사용하여 인스톨러를 업데이트할 수 있습니다:

```shell
composer global update laravel/installer
```

또는 [Laravel Herd](https://herd.laravel.com)에 번들된 Laravel 인스톨러를 사용하는 경우 Herd 설치를 최신 릴리스로 업데이트해야 합니다.

<a name="cache"></a>
### 캐시

<a name="cache-prefixes-and-session-cookie-names"></a>
#### 캐시 접두사 및 세션 쿠키 이름

**영향 가능성: 낮음**

Laravel의 기본 캐시 및 Redis 키 접두사가 이제 하이픈 접미사를 사용합니다. 또한 기본 세션 쿠키 이름이 이제 애플리케이션 이름에 `Str::snake(...)`를 사용합니다.

대부분의 애플리케이션에서는 애플리케이션 수준 설정 파일이 이미 이러한 값을 정의하고 있기 때문에 이 변경이 적용되지 않습니다. 이는 주로 해당 애플리케이션 설정 값이 없을 때 프레임워크 수준의 폴백 설정에 의존하는 애플리케이션에 영향을 줍니다.

애플리케이션이 이러한 생성된 기본값에 의존하는 경우, 업그레이드 후 캐시 키와 세션 쿠키 이름이 변경될 수 있습니다:

```php
// Laravel <= 12.x
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_cache_';
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_database_';
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_session';

// Laravel >= 13.x
Str::slug((string) env('APP_NAME', 'laravel')).'-cache-';
Str::slug((string) env('APP_NAME', 'laravel')).'-database-';
Str::snake((string) env('APP_NAME', 'laravel')).'_session';
```

이전 동작을 유지하려면 환경에서 `CACHE_PREFIX`, `REDIS_PREFIX`, `SESSION_COOKIE`를 명시적으로 설정하세요.

<a name="store-and-repository-contracts-touch"></a>
#### `Store` 및 `Repository` 계약: `touch`

**영향 가능성: 매우 낮음**

캐시 계약에 이제 아이템 TTL 연장을 위한 `touch` 메서드가 포함됩니다. 커스텀 캐시 저장소 구현을 유지하는 경우 이 메서드를 추가해야 합니다:

```php
// Illuminate\Contracts\Cache\Store
public function touch($key, $seconds);
```

<a name="cache-serializable_classes-configuration"></a>
#### 캐시 `serializable_classes` 설정

**영향 가능성: 중간**

기본 애플리케이션 `cache` 설정에 이제 `false`로 설정된 `serializable_classes` 옵션이 포함됩니다. 이것은 애플리케이션의 `APP_KEY`가 유출될 경우 PHP 역직렬화 가젯 체인 공격을 방지하기 위해 캐시 역직렬화 동작을 강화합니다. 애플리케이션이 의도적으로 캐시에 PHP 객체를 저장하는 경우 역직렬화할 수 있는 클래스를 명시적으로 나열해야 합니다:

```php
'serializable_classes' => [
    App\Data\CachedDashboardStats::class,
    App\Support\CachedPricingSnapshot::class,
],
```

애플리케이션이 이전에 임의의 캐시 객체 역직렬화에 의존했다면 명시적 클래스 허용 목록 또는 비객체 캐시 페이로드(예: 배열)로 마이그레이션해야 합니다.

<a name="container"></a>
### 컨테이너

<a name="containercall-and-nullable-class-defaults"></a>
#### `Container::call`과 Nullable 클래스 기본값

**영향 가능성: 낮음**

`Container::call`은 이제 바인딩이 없을 때 nullable 클래스 파라미터 기본값을 존중하며, Laravel 12에서 도입된 생성자 주입 동작과 일치합니다:

```php
$container->call(function (?Carbon $date = null) {
    return $date;
});

// Laravel <= 12.x: Carbon 인스턴스
// Laravel >= 13.x: null
```

메서드 호출 주입 로직이 이전 동작에 의존했다면 업데이트가 필요할 수 있습니다.

<a name="contracts"></a>
### 계약(Contracts)

<a name="dispatcher-contract-dispatchafterresponse"></a>
#### `Dispatcher` 계약: `dispatchAfterResponse`

**영향 가능성: 매우 낮음**

`Illuminate\Contracts\Bus\Dispatcher` 계약에 이제 `dispatchAfterResponse($command, $handler = null)` 메서드가 포함됩니다.

커스텀 디스패처 구현을 유지하는 경우 이 메서드를 클래스에 추가하세요.

<a name="responsefactory-contract-eventstream"></a>
#### `ResponseFactory` 계약: `eventStream`

**영향 가능성: 매우 낮음**

`Illuminate\Contracts\Routing\ResponseFactory` 계약에 이제 `eventStream` 시그니처가 포함됩니다.

이 계약의 커스텀 구현을 유지하는 경우 이 메서드를 추가해야 합니다.

<a name="mustverifyemail-contract-markemailasunverified"></a>
#### `MustVerifyEmail` 계약: `markEmailAsUnverified`

**영향 가능성: 매우 낮음**

`Illuminate\Contracts\Auth\MustVerifyEmail` 계약에 이제 `markEmailAsUnverified()`가 포함됩니다.

이 계약의 커스텀 구현을 제공하는 경우 호환성을 유지하기 위해 이 메서드를 추가하세요.

<a name="database"></a>
### 데이터베이스

<a name="database-upsert-mariadb-mysql"></a>
#### MySQL 또는 MariaDB에서의 데이터베이스 `upsert`

**영향 가능성: 중간**

Laravel은 이제 호출자가 `uniqueBy`에 비어있지 않은 값을 제공하는지 검증하며, 잘못된 SQL을 생성하는 대신 `InvalidArgumentException`을 throw합니다.

MariaDB와 MySQL 데이터베이스 드라이버는 `uniqueBy` 값을 무시하고 항상 테이블의 primary 및 unique 인덱스를 사용하여 기존 레코드를 감지하지만, 검증은 여전히 적용됩니다. `uniqueBy`가 비어있으면 `InvalidArgumentException`이 throw됩니다.

<a name="mysql-delete-queries-with-join-order-by-and-limit"></a>
#### MySQL `DELETE` 쿼리에서 `JOIN`, `ORDER BY`, `LIMIT`

**영향 가능성: 낮음**

Laravel은 이제 MySQL 문법에 대해 `ORDER BY` 및 `LIMIT`을 포함한 완전한 `DELETE ... JOIN` 쿼리를 컴파일합니다.

이전 버전에서는 조인된 삭제에서 `ORDER BY` / `LIMIT` 절이 조용히 무시될 수 있었습니다. Laravel 13에서는 이러한 절이 생성된 SQL에 포함됩니다. 결과적으로 이 구문을 지원하지 않는 데이터베이스 엔진(예: 표준 MySQL / MariaDB 변형)은 이제 무제한 삭제를 실행하는 대신 `QueryException`을 throw할 수 있습니다.

<a name="eloquent"></a>
### Eloquent

<a name="model-booting-and-nested-instantiation"></a>
#### 모델 부팅 및 중첩 인스턴스화

**영향 가능성: 매우 낮음**

모델이 아직 부팅 중일 때 새 모델 인스턴스를 생성하는 것이 이제 허용되지 않으며 `LogicException`이 throw됩니다.

이것은 모델 `boot` 메서드 또는 트레이트 `boot*` 메서드 내에서 모델을 인스턴스화하는 코드에 영향을 줍니다:

```php
protected static function boot()
{
    parent::boot();

    // 부팅 중에는 더 이상 허용되지 않음...
    (new static())->getTable();
}
```

중첩 부팅을 피하기 위해 이 로직을 부트 사이클 외부로 이동하세요.

<a name="polymorphic-pivot-table-name-generation"></a>
#### 다형성 피벗 테이블 이름 생성

**영향 가능성: 낮음**

커스텀 피벗 모델 클래스를 사용하여 다형성 피벗 모델의 테이블 이름을 추론할 때, Laravel은 이제 복수형 이름을 생성합니다.

애플리케이션이 morph 피벗 테이블에 대해 이전의 단수 추론 이름에 의존했고 커스텀 피벗 클래스를 사용했다면, 피벗 모델에 테이블 이름을 명시적으로 정의해야 합니다.

<a name="collection-model-serialization-restores-eager-loaded-relations"></a>
#### 컬렉션 모델 직렬화에서 Eager-Loaded 관계 복원

**영향 가능성: 낮음**

Eloquent 모델 컬렉션이 직렬화되고 복원될 때(예: 큐 작업에서), eager-loaded 관계가 이제 컬렉션의 모델에 대해 복원됩니다.

역직렬화 후 관계가 존재하지 않는 것에 의존하는 코드가 있다면 해당 로직을 조정해야 할 수 있습니다.

<a name="http-client"></a>
### HTTP 클라이언트

<a name="http-client-response-throw-and-throwif-signatures"></a>
#### HTTP 클라이언트 `Response::throw` 및 `throwIf` 시그니처

**영향 가능성: 매우 낮음**

HTTP 클라이언트 응답 메서드가 이제 메서드 시그니처에서 콜백 파라미터를 선언합니다:

```php
public function throw($callback = null);
public function throwIf($condition, $callback = null);
```

커스텀 응답 클래스에서 이러한 메서드를 오버라이드하는 경우 메서드 시그니처가 호환되는지 확인하세요.

<a name="notifications"></a>
### 알림(Notifications)

<a name="default-password-reset-subject"></a>
#### 기본 비밀번호 재설정 제목

**영향 가능성: 매우 낮음**

Laravel의 기본 비밀번호 재설정 메일 제목이 변경되었습니다:

```text
// Laravel <= 12.x
Reset Password Notification

// Laravel >= 13.x
Reset your password
```

테스트, 어설션 또는 번역 오버라이드가 이전 기본 문자열에 의존하는 경우 그에 맞게 업데이트하세요.

<a name="queued-notifications-and-missing-models"></a>
#### 큐에 넣어진 알림과 누락된 모델

**영향 가능성: 매우 낮음**

큐에 넣어진 알림이 이제 알림 클래스에 정의된 `#[DeleteWhenMissingModels]` 어트리뷰트와 `$deleteWhenMissingModels` 속성을 존중합니다.

이전 버전에서는 삭제를 예상했던 경우에도 누락된 모델이 큐에 넣어진 알림 작업을 실패시킬 수 있었습니다.

<a name="queue"></a>
### 큐(Queue)

<a name="jobattempted-event-exception-payload"></a>
#### `JobAttempted` 이벤트 예외 페이로드

**영향 가능성: 낮음**

`Illuminate\Queue\Events\JobAttempted` 이벤트가 이제 이전의 불리언 `$exceptionOccurred` 속성 대신 `$exception`을 통해 예외 객체(또는 `null`)를 노출합니다:

```php
// Laravel <= 12.x
$event->exceptionOccurred;

// Laravel >= 13.x
$event->exception;
```

이 이벤트를 수신하는 경우 리스너 코드를 그에 맞게 업데이트하세요.

<a name="queuebusy-event-property-rename"></a>
#### `QueueBusy` 이벤트 속성 이름 변경

**영향 가능성: 낮음**

`Illuminate\Queue\Events\QueueBusy` 이벤트 속성 `$connection`이 다른 큐 이벤트와의 일관성을 위해 `$connectionName`으로 변경되었습니다.

리스너에서 `$connection`을 참조하는 경우 `$connectionName`으로 업데이트하세요.

<a name="queue-contract-method-additions"></a>
#### `Queue` 계약 메서드 추가

**영향 가능성: 매우 낮음**

`Illuminate\Contracts\Queue\Queue` 계약에 이전에는 docblock에서만 선언되었던 큐 크기 검사 메서드가 이제 포함됩니다.

이 계약의 커스텀 큐 드라이버 구현을 유지하는 경우 다음에 대한 구현을 추가하세요:

<div class="content-list" markdown="1">

- `pendingSize`
- `delayedSize`
- `reservedSize`
- `creationTimeOfOldestPendingJob`

</div>

<a name="routing"></a>
### 라우팅

<a name="domain-route-registration-precedence"></a>
#### 도메인 라우트 등록 우선순위

**영향 가능성: 낮음**

명시적 도메인이 있는 라우트가 이제 라우트 매칭에서 도메인이 없는 라우트보다 우선됩니다.

이를 통해 비도메인 라우트가 먼저 등록된 경우에도 catch-all 서브도메인 라우트가 일관되게 동작합니다. 애플리케이션이 도메인과 비도메인 라우트 간의 이전 등록 우선순위에 의존했다면 라우트 매칭 동작을 검토하세요.

<a name="scheduling"></a>
### 스케줄링

<a name="withscheduling-registration-timing"></a>
#### `withScheduling` 등록 타이밍

**영향 가능성: 매우 낮음**

`ApplicationBuilder::withScheduling()`을 통해 등록된 스케줄이 이제 `Schedule`이 해결될 때까지 지연됩니다.

애플리케이션이 부트스트랩 중 즉시 스케줄 등록 타이밍에 의존했다면 해당 로직을 조정해야 할 수 있습니다.

<a name="security"></a>
### 보안

<a name="request-forgery-protection"></a>
#### 요청 위조 방지

**영향 가능성: 높음**

Laravel의 CSRF 미들웨어가 `VerifyCsrfToken`에서 `PreventRequestForgery`로 이름이 변경되었으며, `Sec-Fetch-Site` 헤더를 사용한 요청 출처 검증이 포함되었습니다.

`VerifyCsrfToken`과 `ValidateCsrfToken`은 더 이상 사용되지 않는 별칭으로 유지되지만, 특히 테스트나 라우트 정의에서 미들웨어를 제외할 때 직접 참조는 `PreventRequestForgery`로 업데이트해야 합니다:

```php
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

// Laravel <= 12.x
->withoutMiddleware([VerifyCsrfToken::class]);

// Laravel >= 13.x
->withoutMiddleware([PreventRequestForgery::class]);
```

미들웨어 설정 API도 이제 `preventRequestForgery(...)`를 제공합니다.

<a name="support"></a>
### 지원(Support)

<a name="manager-extend-callback-binding"></a>
#### Manager `extend` 콜백 바인딩

**영향 가능성: 낮음**

매니저 `extend` 메서드를 통해 등록된 커스텀 드라이버 클로저가 이제 매니저 인스턴스에 바인딩됩니다.

이전에 이러한 콜백 내부에서 `$this`로 다른 바인딩된 객체(예: 서비스 프로바이더 인스턴스)에 의존했다면, `use (...)`를 사용하여 해당 값을 클로저 캡처로 이동해야 합니다.

<a name="str-factories-reset-between-tests"></a>
#### `Str` 팩토리 테스트 간 초기화

**영향 가능성: 낮음**

Laravel은 이제 테스트 해체(teardown) 중에 커스텀 `Str` 팩토리를 초기화합니다.

테스트가 테스트 메서드 간에 지속되는 커스텀 UUID / ULID / 랜덤 문자열 팩토리에 의존했다면, 각 관련 테스트 또는 설정 훅에서 설정해야 합니다.

<a name="jsfrom-uses-unescaped-unicode-by-default"></a>
#### `Js::from`이 기본적으로 이스케이프되지 않은 유니코드 사용

**영향 가능성: 매우 낮음**

`Illuminate\Support\Js::from`이 이제 기본적으로 `JSON_UNESCAPED_UNICODE`를 사용합니다.

테스트나 프론트엔드 출력 비교가 이스케이프된 유니코드 시퀀스(예: `\u00e8`)에 의존했다면 기대값을 업데이트하세요.

<a name="views"></a>
### 뷰(Views)

<a name="pagination-bootstrap-view-names"></a>
#### 페이지네이션 Bootstrap 뷰 이름

**영향 가능성: 낮음**

Bootstrap 3 기본값에 대한 내부 페이지네이션 뷰 이름이 이제 명시적입니다:

```nothing
// Laravel <= 12.x
pagination::default
pagination::simple-default

// Laravel >= 13.x
pagination::bootstrap-3
pagination::simple-bootstrap-3
```

애플리케이션이 이전 페이지네이션 뷰 이름을 직접 참조하는 경우 해당 참조를 업데이트하세요.

<a name="miscellaneous"></a>
### 기타

`laravel/laravel` [GitHub 저장소](https://github.com/laravel/laravel)의 변경 사항을 확인하는 것도 권장합니다. 이러한 변경 사항 중 많은 것이 필수는 아니지만 이러한 파일을 애플리케이션과 동기화하고 싶을 수 있습니다. 이러한 변경 사항 중 일부는 이 업그레이드 가이드에서 다루지만 설정 파일이나 주석 변경과 같은 다른 변경 사항은 다루지 않습니다. [GitHub 비교 도구](https://github.com/laravel/laravel/compare/12.x...13.x)로 변경 사항을 쉽게 확인하고 중요한 업데이트를 선택할 수 있습니다.

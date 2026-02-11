# 라라벨 펄스(Laravel Pulse)

- [소개](#introduction)
- [설치](#installation)
    - [설정](#configuration)
- [대시보드](#dashboard)
    - [권한 부여](#dashboard-authorization)
    - [사용자 정의](#dashboard-customization)
    - [사용자 조회](#dashboard-resolving-users)
    - [카드](#dashboard-cards)
- [엔트리 캡처](#capturing-entries)
    - [레코더](#recorders)
    - [필터링](#filtering)
- [성능](#performance)
    - [다른 데이터베이스 사용](#using-a-different-database)
    - [레디스 인제스트(Redis Ingest)](#ingest)
    - [샘플링](#sampling)
    - [트리밍](#trimming)
    - [펄스 예외 처리](#pulse-exceptions)
- [커스텀 카드](#custom-cards)
    - [카드 컴포넌트](#custom-card-components)
    - [스타일링](#custom-card-styling)
    - [데이터 캡처 및 집계](#custom-card-data)

<a name="introduction"></a>
## 소개

[Laravel Pulse](https://github.com/laravel/pulse)는 애플리케이션의 성능과 사용량에 대한 인사이트를 한눈에 제공합니다. Pulse를 사용하면 느린 작업(Job)과 엔드포인트와 같은 병목 현상을 추적하고, 가장 활성화된 사용자를 찾는 등의 작업을 수행할 수 있습니다.

개별 이벤트의 심층 디버깅을 위해서는 [Laravel Telescope](/docs/{{version}}/telescope)를 확인하세요.

<a name="installation"></a>
## 설치

> [!WARNING]  
> Pulse의 기본 저장소 구현은 현재 MySQL, MariaDB 또는 PostgreSQL 데이터베이스가 필요합니다. 다른 데이터베이스 엔진을 사용하는 경우, Pulse 데이터를 위해 별도의 MySQL, MariaDB 또는 PostgreSQL 데이터베이스가 필요합니다.

Composer 패키지 관리자를 사용하여 Pulse를 설치할 수 있습니다.

```sh
composer require laravel/pulse
```

다음으로, `vendor:publish` 아티즌(Artisan) 명령어를 사용하여 Pulse 설정 파일과 마이그레이션 파일을 발행해야 합니다.

```shell
php artisan vendor:publish --provider="Laravel\Pulse\PulseServiceProvider"
```

마지막으로, Pulse의 데이터를 저장하는 데 필요한 테이블을 생성하기 위해 `migrate` 명령어를 실행해야 합니다.

```shell
php artisan migrate
```

Pulse의 데이터베이스 마이그레이션이 실행되면, `/pulse` 라우트를 통해 Pulse 대시보드에 접근할 수 있습니다.

> [!NOTE]  
> 애플리케이션의 기본 데이터베이스에 Pulse 데이터를 저장하지 않으려면, [전용 데이터베이스 연결을 지정](#using-a-different-database)할 수 있습니다.

<a name="configuration"></a>
### 설정

Pulse의 많은 설정 옵션은 환경 변수를 사용하여 제어할 수 있습니다. 사용 가능한 옵션을 확인하거나, 새 레코더를 등록하거나, 고급 옵션을 설정하려면 `config/pulse.php` 설정 파일을 발행할 수 있습니다.

```sh
php artisan vendor:publish --tag=pulse-config
```

<a name="dashboard"></a>
## 대시보드

<a name="dashboard-authorization"></a>
### 권한 부여

Pulse 대시보드는 `/pulse` 라우트를 통해 접근할 수 있습니다. 기본적으로 `local` 환경에서만 이 대시보드에 접근할 수 있으므로, `'viewPulse'` 권한 부여 게이트(Authorization Gate)를 사용자 정의하여 프로덕션 환경에 대한 권한 부여를 설정해야 합니다. 이는 애플리케이션의 `app/Providers/AppServiceProvider.php` 파일 내에서 수행할 수 있습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Gate::define('viewPulse', function (User $user) {
        return $user->isAdmin();
    });

    // ...
}
```

<a name="dashboard-customization"></a>
### 사용자 정의

Pulse 대시보드 카드와 레이아웃은 대시보드 뷰를 발행하여 설정할 수 있습니다. 대시보드 뷰는 `resources/views/vendor/pulse/dashboard.blade.php`에 발행됩니다.

```sh
php artisan vendor:publish --tag=pulse-dashboard
```

대시보드는 [Livewire](https://livewire.laravel.com/)로 구동되며, JavaScript 에셋을 다시 빌드할 필요 없이 카드와 레이아웃을 사용자 정의할 수 있습니다.

이 파일 내에서 `<x-pulse>` 컴포넌트는 대시보드를 렌더링하고 카드에 대한 그리드 레이아웃을 제공합니다. 대시보드가 화면의 전체 너비를 차지하도록 하려면, 컴포넌트에 `full-width` prop을 제공할 수 있습니다.

```blade
<x-pulse full-width>
    ...
</x-pulse>
```

기본적으로 `<x-pulse>` 컴포넌트는 12열 그리드를 생성하지만, `cols` prop을 사용하여 이를 사용자 정의할 수 있습니다.

```blade
<x-pulse cols="16">
    ...
</x-pulse>
```

각 카드는 공간과 위치를 제어하기 위해 `cols`와 `rows` prop을 받습니다.

```blade
<livewire:pulse.usage cols="4" rows="2" />
```

대부분의 카드는 스크롤 대신 전체 카드를 표시하기 위한 `expand` prop도 받습니다.

```blade
<livewire:pulse.slow-queries expand />
```

<a name="dashboard-resolving-users"></a>
### 사용자 조회

애플리케이션 사용량 카드와 같이 사용자에 대한 정보를 표시하는 카드의 경우, Pulse는 사용자의 ID만 기록합니다. 대시보드를 렌더링할 때, Pulse는 기본 `Authenticatable` 모델에서 `name`과 `email` 필드를 조회하고 Gravatar 웹 서비스를 사용하여 아바타를 표시합니다.

애플리케이션의 `App\Providers\AppServiceProvider` 클래스 내에서 `Pulse::user` 메서드를 호출하여 필드와 아바타를 사용자 정의할 수 있습니다.

`user` 메서드는 표시할 `Authenticatable` 모델을 받고 사용자에 대한 `name`, `extra`, `avatar` 정보를 포함하는 배열을 반환해야 하는 클로저를 받습니다.

```php
use Laravel\Pulse\Facades\Pulse;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Pulse::user(fn ($user) => [
        'name' => $user->name,
        'extra' => $user->email,
        'avatar' => $user->avatar_url,
    ]);

    // ...
}
```

> [!NOTE]  
> `Laravel\Pulse\Contracts\ResolvesUsers` 계약을 구현하고 Laravel의 [서비스 컨테이너(Service Container)](/docs/{{version}}/container#binding-a-singleton)에 바인딩하여 인증된 사용자를 캡처하고 조회하는 방법을 완전히 사용자 정의할 수 있습니다.

<a name="dashboard-cards"></a>
### 카드

<a name="servers-card"></a>
#### 서버

`<livewire:pulse.servers />` 카드는 `pulse:check` 명령어를 실행하는 모든 서버의 시스템 리소스 사용량을 표시합니다. 시스템 리소스 보고에 대한 자세한 내용은 [서버 레코더](#servers-recorder) 문서를 참조하세요.

인프라에서 서버를 교체하는 경우, 일정 기간 후에 비활성 서버를 Pulse 대시보드에 표시하지 않을 수 있습니다. `ignore-after` prop을 사용하여 이를 수행할 수 있으며, 이 prop은 비활성 서버가 Pulse 대시보드에서 제거되어야 하는 시간(초)을 받습니다. 또는 `1 hour` 또는 `3 days and 1 hour`과 같이 상대적 시간 형식 문자열을 제공할 수 있습니다.

```blade
<livewire:pulse.servers ignore-after="3 hours" />
```

<a name="application-usage-card"></a>
#### 애플리케이션 사용량

`<livewire:pulse.usage />` 카드는 애플리케이션에 요청을 보내고, 작업(Job)을 디스패치하고, 느린 요청을 경험하는 상위 10명의 사용자를 표시합니다.

모든 사용량 메트릭을 동시에 화면에 표시하려면, 카드를 여러 번 포함하고 `type` 속성을 지정할 수 있습니다.

```blade
<livewire:pulse.usage type="requests" />
<livewire:pulse.usage type="slow_requests" />
<livewire:pulse.usage type="jobs" />
```

Pulse가 사용자 정보를 조회하고 표시하는 방법을 사용자 정의하는 방법을 알아보려면 [사용자 조회](#dashboard-resolving-users) 문서를 참조하세요.

> [!NOTE]  
> 애플리케이션이 많은 요청을 받거나 많은 작업(Job)을 디스패치하는 경우, [샘플링](#sampling)을 활성화할 수 있습니다. 자세한 내용은 [사용자 요청 레코더](#user-requests-recorder), [사용자 작업 레코더](#user-jobs-recorder), [느린 작업 레코더](#slow-jobs-recorder) 문서를 참조하세요.

<a name="exceptions-card"></a>
#### 예외

`<livewire:pulse.exceptions />` 카드는 애플리케이션에서 발생하는 예외의 빈도와 최근 발생 시점을 표시합니다. 기본적으로 예외는 예외 클래스와 발생 위치를 기반으로 그룹화됩니다. 자세한 내용은 [예외 레코더](#exceptions-recorder) 문서를 참조하세요.

<a name="queues-card"></a>
#### 큐

`<livewire:pulse.queues />` 카드는 애플리케이션 큐의 처리량을 표시하며, 대기 중, 처리 중, 처리 완료, 릴리스 및 실패한 작업(Job) 수를 포함합니다. 자세한 내용은 [큐 레코더](#queues-recorder) 문서를 참조하세요.

<a name="slow-requests-card"></a>
#### 느린 요청

`<livewire:pulse.slow-requests />` 카드는 설정된 임계값(기본값 1,000ms)을 초과하는 애플리케이션으로 들어오는 요청을 표시합니다. 자세한 내용은 [느린 요청 레코더](#slow-requests-recorder) 문서를 참조하세요.

<a name="slow-jobs-card"></a>
#### 느린 작업

`<livewire:pulse.slow-jobs />` 카드는 설정된 임계값(기본값 1,000ms)을 초과하는 애플리케이션의 대기 중인 작업(Job)을 표시합니다. 자세한 내용은 [느린 작업 레코더](#slow-jobs-recorder) 문서를 참조하세요.

<a name="slow-queries-card"></a>
#### 느린 쿼리

`<livewire:pulse.slow-queries />` 카드는 설정된 임계값(기본값 1,000ms)을 초과하는 애플리케이션의 데이터베이스 쿼리를 표시합니다.

기본적으로 느린 쿼리는 SQL 쿼리(바인딩 제외)와 발생 위치를 기반으로 그룹화되지만, SQL 쿼리만으로 그룹화하려면 위치를 캡처하지 않도록 선택할 수 있습니다.

구문 강조를 받는 매우 큰 SQL 쿼리로 인해 렌더링 성능 문제가 발생하면, `without-highlighting` prop을 추가하여 강조 표시를 비활성화할 수 있습니다.

```blade
<livewire:pulse.slow-queries without-highlighting />
```

자세한 내용은 [느린 쿼리 레코더](#slow-queries-recorder) 문서를 참조하세요.

<a name="slow-outgoing-requests-card"></a>
#### 느린 외부 요청

`<livewire:pulse.slow-outgoing-requests />` 카드는 Laravel의 [HTTP 클라이언트](/docs/{{version}}/http-client)를 사용하여 설정된 임계값(기본값 1,000ms)을 초과하는 외부 요청을 표시합니다.

기본적으로 엔트리는 전체 URL로 그룹화됩니다. 그러나 정규식을 사용하여 유사한 외부 요청을 정규화하거나 그룹화할 수 있습니다. 자세한 내용은 [느린 외부 요청 레코더](#slow-outgoing-requests-recorder) 문서를 참조하세요.

<a name="cache-card"></a>
#### 캐시

`<livewire:pulse.cache />` 카드는 애플리케이션의 캐시 적중(Hit) 및 미스(Miss) 통계를 전역 및 개별 키별로 표시합니다.

기본적으로 엔트리는 키별로 그룹화됩니다. 그러나 정규식을 사용하여 유사한 키를 정규화하거나 그룹화할 수 있습니다. 자세한 내용은 [캐시 상호작용 레코더](#cache-interactions-recorder) 문서를 참조하세요.

<a name="capturing-entries"></a>
## 엔트리 캡처

대부분의 Pulse 레코더는 Laravel에서 디스패치되는 프레임워크 이벤트를 기반으로 엔트리를 자동으로 캡처합니다. 그러나 [서버 레코더](#servers-recorder)와 일부 서드파티 카드는 정기적으로 정보를 폴링해야 합니다. 이러한 카드를 사용하려면 모든 개별 애플리케이션 서버에서 `pulse:check` 데몬을 실행해야 합니다.

```php
php artisan pulse:check
```

> [!NOTE]  
> `pulse:check` 프로세스를 백그라운드에서 영구적으로 실행하려면, Supervisor와 같은 프로세스 모니터를 사용하여 명령어가 실행을 중단하지 않도록 해야 합니다.

`pulse:check` 명령어는 오래 실행되는 프로세스이므로, 다시 시작하지 않으면 코드베이스의 변경 사항을 인식하지 못합니다. 애플리케이션 배포 과정에서 `pulse:restart` 명령어를 호출하여 명령어를 우아하게 다시 시작해야 합니다.

```sh
php artisan pulse:restart
```

> [!NOTE]  
> Pulse는 [캐시](/docs/{{version}}/cache)를 사용하여 재시작 신호를 저장하므로, 이 기능을 사용하기 전에 애플리케이션에 캐시 드라이버가 올바르게 설정되어 있는지 확인해야 합니다.

<a name="recorders"></a>
### 레코더

레코더는 Pulse 데이터베이스에 기록될 애플리케이션의 엔트리를 캡처하는 역할을 합니다. 레코더는 [Pulse 설정 파일](#configuration)의 `recorders` 섹션에서 등록하고 설정합니다.

<a name="cache-interactions-recorder"></a>
#### 캐시 상호작용

`CacheInteractions` 레코더는 [캐시](#cache-card) 카드에 표시하기 위해 애플리케이션에서 발생하는 [캐시](/docs/{{version}}/cache) 적중(Hit)과 미스(Miss)에 대한 정보를 캡처합니다.

선택적으로 [샘플 레이트](#sampling)와 무시할 키 패턴을 조정할 수 있습니다.

유사한 키가 단일 엔트리로 그룹화되도록 키 그룹화를 설정할 수도 있습니다. 예를 들어, 동일한 유형의 정보를 캐싱하는 키에서 고유 ID를 제거할 수 있습니다. 그룹은 키의 일부를 "찾기 및 바꾸기"하는 정규식을 사용하여 설정됩니다. 설정 파일에 예제가 포함되어 있습니다.

```php
Recorders\CacheInteractions::class => [
    // ...
    'groups' => [
        // '/:\d+/' => ':*',
    ],
],
```

일치하는 첫 번째 패턴이 사용됩니다. 일치하는 패턴이 없으면 키가 그대로 캡처됩니다.

<a name="exceptions-recorder"></a>
#### 예외

`Exceptions` 레코더는 [예외](#exceptions-card) 카드에 표시하기 위해 애플리케이션에서 발생하는 보고 가능한 예외에 대한 정보를 캡처합니다.

선택적으로 [샘플 레이트](#sampling)와 무시할 예외(exception) 패턴을 조정할 수 있습니다. 또한 예외가 발생한 위치를 캡처할지 여부를 설정할 수 있습니다. 캡처된 위치는 Pulse 대시보드에 표시되어 예외 원인을 추적하는 데 도움이 될 수 있습니다. 그러나 동일한 예외가 여러 위치에서 발생하면 각 고유 위치에 대해 여러 번 나타납니다.

<a name="queues-recorder"></a>
#### 큐

`Queues` 레코더는 [큐](#queues-card) 카드에 표시하기 위해 애플리케이션의 큐에 대한 정보를 캡처합니다.

선택적으로 [샘플 레이트](#sampling)와 무시할 작업(Job) 패턴을 조정할 수 있습니다.

<a name="slow-jobs-recorder"></a>
#### 느린 작업

`SlowJobs` 레코더는 [느린 작업](#slow-jobs-recorder) 카드에 표시하기 위해 애플리케이션에서 발생하는 느린 작업(Job)에 대한 정보를 캡처합니다.

선택적으로 느린 작업 임계값, [샘플 레이트](#sampling), 무시할 작업 패턴을 조정할 수 있습니다.

다른 작업보다 더 오래 걸릴 것으로 예상되는 작업이 있을 수 있습니다. 이러한 경우 작업별 임계값을 설정할 수 있습니다.

```php
Recorders\SlowJobs::class => [
    // ...
    'threshold' => [
        '#^App\\Jobs\\GenerateYearlyReports$#' => 5000,
        'default' => env('PULSE_SLOW_JOBS_THRESHOLD', 1000),
    ],
],
```

작업의 클래스명과 일치하는 정규식 패턴이 없으면, `'default'` 값이 사용됩니다.

<a name="slow-outgoing-requests-recorder"></a>
#### 느린 외부 요청

`SlowOutgoingRequests` 레코더는 [느린 외부 요청](#slow-outgoing-requests-card) 카드에 표시하기 위해 Laravel의 [HTTP 클라이언트](/docs/{{version}}/http-client)를 사용하여 설정된 임계값을 초과하는 외부 HTTP 요청에 대한 정보를 캡처합니다.

선택적으로 느린 외부 요청 임계값, [샘플 레이트](#sampling), 무시할 URL 패턴을 조정할 수 있습니다.

다른 요청보다 더 오래 걸릴 것으로 예상되는 외부 요청이 있을 수 있습니다. 이러한 경우 요청별 임계값을 설정할 수 있습니다.

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'threshold' => [
        '#backup.zip$#' => 5000,
        'default' => env('PULSE_SLOW_OUTGOING_REQUESTS_THRESHOLD', 1000),
    ],
],
```

요청의 URL과 일치하는 정규식 패턴이 없으면, `'default'` 값이 사용됩니다.

유사한 URL이 단일 엔트리로 그룹화되도록 URL 그룹화를 설정할 수도 있습니다. 예를 들어, URL 경로에서 고유 ID를 제거하거나 도메인별로만 그룹화할 수 있습니다. 그룹은 URL의 일부를 "찾기 및 바꾸기"하는 정규식을 사용하여 설정됩니다. 설정 파일에 몇 가지 예제가 포함되어 있습니다.

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'groups' => [
        // '#^https://api\.github\.com/repos/.*$#' => 'api.github.com/repos/*',
        // '#^https?://([^/]*).*$#' => '\1',
        // '#/\d+#' => '/*',
    ],
],
```

일치하는 첫 번째 패턴이 사용됩니다. 일치하는 패턴이 없으면 URL이 그대로 캡처됩니다.

<a name="slow-queries-recorder"></a>
#### 느린 쿼리

`SlowQueries` 레코더는 [느린 쿼리](#slow-queries-card) 카드에 표시하기 위해 설정된 임계값을 초과하는 애플리케이션의 모든 데이터베이스 쿼리를 캡처합니다.

선택적으로 느린 쿼리 임계값, [샘플 레이트](#sampling), 무시할 쿼리 패턴을 조정할 수 있습니다. 또한 쿼리 위치를 캡처할지 여부를 설정할 수 있습니다. 캡처된 위치는 Pulse 대시보드에 표시되어 쿼리 원인을 추적하는 데 도움이 될 수 있습니다. 그러나 동일한 쿼리가 여러 위치에서 수행되면 각 고유 위치에 대해 여러 번 나타납니다.

다른 쿼리보다 더 오래 걸릴 것으로 예상되는 쿼리가 있을 수 있습니다. 이러한 경우 쿼리별 임계값을 설정할 수 있습니다.

```php
Recorders\SlowQueries::class => [
    // ...
    'threshold' => [
        '#^insert into `yearly_reports`#' => 5000,
        'default' => env('PULSE_SLOW_QUERIES_THRESHOLD', 1000),
    ],
],
```

쿼리의 SQL과 일치하는 정규식 패턴이 없으면, `'default'` 값이 사용됩니다.

<a name="slow-requests-recorder"></a>
#### 느린 요청

`Requests` 레코더는 [느린 요청](#slow-requests-card) 및 [애플리케이션 사용량](#application-usage-card) 카드에 표시하기 위해 애플리케이션에 대한 요청 정보를 캡처합니다.

선택적으로 느린 라우트 임계값, [샘플 레이트](#sampling), 무시할 경로를 조정할 수 있습니다.

다른 요청보다 더 오래 걸릴 것으로 예상되는 요청이 있을 수 있습니다. 이러한 경우 요청별 임계값을 설정할 수 있습니다.

```php
Recorders\SlowRequests::class => [
    // ...
    'threshold' => [
        '#^/admin/#' => 5000,
        'default' => env('PULSE_SLOW_REQUESTS_THRESHOLD', 1000),
    ],
],
```

요청의 URL과 일치하는 정규식 패턴이 없으면, `'default'` 값이 사용됩니다.

<a name="servers-recorder"></a>
#### 서버

`Servers` 레코더는 [서버](#servers-card) 카드에 표시하기 위해 애플리케이션을 구동하는 서버의 CPU, 메모리 및 스토리지 사용량을 캡처합니다. 이 레코더를 사용하려면 모니터링하려는 각 서버에서 [`pulse:check` 명령어](#capturing-entries)가 실행 중이어야 합니다.

각 보고 서버는 고유한 이름을 가져야 합니다. 기본적으로 Pulse는 PHP의 `gethostname` 함수에서 반환된 값을 사용합니다. 이를 사용자 정의하려면 `PULSE_SERVER_NAME` 환경 변수를 설정할 수 있습니다.

```env
PULSE_SERVER_NAME=load-balancer
```

Pulse 설정 파일을 사용하면 모니터링되는 디렉토리를 사용자 정의할 수도 있습니다.

<a name="user-jobs-recorder"></a>
#### 사용자 작업

`UserJobs` 레코더는 [애플리케이션 사용량](#application-usage-card) 카드에 표시하기 위해 애플리케이션에서 작업(Job)을 디스패치하는 사용자에 대한 정보를 캡처합니다.

선택적으로 [샘플 레이트](#sampling)와 무시할 작업 패턴을 조정할 수 있습니다.

<a name="user-requests-recorder"></a>
#### 사용자 요청

`UserRequests` 레코더는 [애플리케이션 사용량](#application-usage-card) 카드에 표시하기 위해 애플리케이션에 요청을 보내는 사용자에 대한 정보를 캡처합니다.

선택적으로 [샘플 레이트](#sampling)와 무시할 URL 패턴을 조정할 수 있습니다.

<a name="filtering"></a>
### 필터링

이미 살펴본 바와 같이, 많은 [레코더](#recorders)는 요청의 URL과 같은 값을 기반으로 설정을 통해 들어오는 엔트리를 "무시"하는 기능을 제공합니다. 그러나 현재 인증된 사용자와 같은 다른 요소를 기반으로 레코드를 필터링하는 것이 유용할 수 있습니다. 이러한 레코드를 필터링하려면 Pulse의 `filter` 메서드에 클로저를 전달할 수 있습니다. 일반적으로 `filter` 메서드는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 내에서 호출해야 합니다.

```php
use Illuminate\Support\Facades\Auth;
use Laravel\Pulse\Entry;
use Laravel\Pulse\Facades\Pulse;
use Laravel\Pulse\Value;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Pulse::filter(function (Entry|Value $entry) {
        return Auth::user()->isNotAdmin();
    });

    // ...
}
```

<a name="performance"></a>
## 성능

Pulse는 추가 인프라 없이 기존 애플리케이션에 통합되도록 설계되었습니다. 그러나 트래픽이 많은 애플리케이션의 경우, Pulse가 애플리케이션 성능에 미치는 영향을 제거하는 여러 가지 방법이 있습니다.

<a name="using-a-different-database"></a>
### 다른 데이터베이스 사용

트래픽이 많은 애플리케이션의 경우, 애플리케이션 데이터베이스에 영향을 주지 않도록 Pulse를 위한 전용 데이터베이스 연결을 사용하는 것이 좋습니다.

`PULSE_DB_CONNECTION` 환경 변수를 설정하여 Pulse에서 사용하는 [데이터베이스 연결](/docs/{{version}}/database#configuration)을 사용자 정의할 수 있습니다.

```env
PULSE_DB_CONNECTION=pulse
```

<a name="ingest"></a>
### 레디스 인제스트(Redis Ingest)

> [!WARNING]  
> 레디스 인제스트(Redis Ingest)는 Redis 6.2 이상과 애플리케이션의 설정된 Redis 클라이언트 드라이버로 `phpredis` 또는 `predis`가 필요합니다.

기본적으로 Pulse는 HTTP 응답이 클라이언트에 전송되거나 작업(Job)이 처리된 후 [설정된 데이터베이스 연결](#using-a-different-database)에 엔트리를 직접 저장합니다. 그러나 Pulse의 Redis 인제스트 드라이버를 사용하여 엔트리를 Redis 스트림으로 보낼 수 있습니다. `PULSE_INGEST_DRIVER` 환경 변수를 설정하여 이를 활성화할 수 있습니다.

```
PULSE_INGEST_DRIVER=redis
```

Pulse는 기본적으로 기본 [Redis 연결](/docs/{{version}}/redis#configuration)을 사용하지만, `PULSE_REDIS_CONNECTION` 환경 변수를 통해 이를 사용자 정의할 수 있습니다.

```
PULSE_REDIS_CONNECTION=pulse
```

Redis 인제스트를 사용할 때는 스트림을 모니터링하고 Redis에서 Pulse의 데이터베이스 테이블로 엔트리를 이동하기 위해 `pulse:work` 명령어를 실행해야 합니다.

```php
php artisan pulse:work
```

> [!NOTE]  
> `pulse:work` 프로세스를 백그라운드에서 영구적으로 실행하려면, Supervisor와 같은 프로세스 모니터를 사용하여 Pulse 워커가 실행을 중단하지 않도록 해야 합니다.

`pulse:work` 명령어는 오래 실행되는 프로세스이므로, 다시 시작하지 않으면 코드베이스의 변경 사항을 인식하지 못합니다. 애플리케이션 배포 과정에서 `pulse:restart` 명령어를 호출하여 명령어를 우아하게 다시 시작해야 합니다.

```sh
php artisan pulse:restart
```

> [!NOTE]  
> Pulse는 [캐시](/docs/{{version}}/cache)를 사용하여 재시작 신호를 저장하므로, 이 기능을 사용하기 전에 애플리케이션에 캐시 드라이버가 올바르게 설정되어 있는지 확인해야 합니다.

<a name="sampling"></a>
### 샘플링

기본적으로 Pulse는 애플리케이션에서 발생하는 모든 관련 이벤트를 캡처합니다. 트래픽이 많은 애플리케이션의 경우, 특히 긴 기간에 대해 대시보드에서 수백만 개의 데이터베이스 행을 집계해야 할 수 있습니다.

대신 특정 Pulse 데이터 레코더에서 "샘플링"을 활성화할 수 있습니다. 예를 들어, [`사용자 요청`](#user-requests-recorder) 레코더에서 샘플 레이트를 `0.1`로 설정하면 애플리케이션 요청의 약 10%만 기록됩니다. 대시보드에서는 값이 확대되고 근사값임을 나타내기 위해 `~` 접두사가 붙습니다.

일반적으로 특정 메트릭에 대한 엔트리가 많을수록 정확도를 너무 많이 희생하지 않고도 샘플 레이트를 더 낮게 설정할 수 있습니다.

<a name="trimming"></a>
### 트리밍

Pulse는 대시보드 윈도우를 벗어난 저장된 엔트리를 자동으로 트리밍합니다. 트리밍은 Pulse [설정 파일](#configuration)에서 사용자 정의할 수 있는 로터리 시스템을 사용하여 데이터를 수집할 때 발생합니다.

<a name="pulse-exceptions"></a>
### 펄스 예외 처리

스토리지 데이터베이스에 연결할 수 없는 것과 같이 Pulse 데이터를 캡처하는 동안 예외가 발생하면, Pulse는 애플리케이션에 영향을 주지 않도록 조용히 실패합니다.

이러한 예외가 처리되는 방식을 사용자 정의하려면 `handleExceptionsUsing` 메서드에 클로저를 제공할 수 있습니다.

```php
use Laravel\Pulse\Facades\Pulse;
use Illuminate\Support\Facades\Log;

Pulse::handleExceptionsUsing(function ($e) {
    Log::debug('An exception happened in Pulse', [
        'message' => $e->getMessage(),
        'stack' => $e->getTraceAsString(),
    ]);
});
```

<a name="custom-cards"></a>
## 커스텀 카드

Pulse를 사용하면 애플리케이션의 특정 요구에 맞는 데이터를 표시하는 커스텀 카드를 빌드할 수 있습니다. Pulse는 [Livewire](https://livewire.laravel.com/)를 사용하므로, 첫 번째 커스텀 카드를 빌드하기 전에 [해당 문서를 검토](https://livewire.laravel.com/docs)하는 것이 좋습니다.

<a name="custom-card-components"></a>
### 카드 컴포넌트

Laravel Pulse에서 커스텀 카드를 만들려면 기본 `Card` Livewire 컴포넌트를 확장하고 해당 뷰를 정의하는 것부터 시작합니다.

```php
namespace App\Livewire\Pulse;

use Laravel\Pulse\Livewire\Card;
use Livewire\Attributes\Lazy;

#[Lazy]
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers');
    }
}
```

Livewire의 [지연 로딩](https://livewire.laravel.com/docs/lazy) 기능을 사용할 때, `Card` 컴포넌트는 컴포넌트에 전달된 `cols`와 `rows` 속성을 존중하는 플레이스홀더를 자동으로 제공합니다.

Pulse 카드의 해당 뷰를 작성할 때, 일관된 모양과 느낌을 위해 Pulse의 Blade 컴포넌트를 활용할 수 있습니다.

```blade
<x-pulse::card :cols="$cols" :rows="$rows" :class="$class" wire:poll.5s="">
    <x-pulse::card-header name="Top Sellers">
        <x-slot:icon>
            ...
        </x-slot:icon>
    </x-pulse::card-header>

    <x-pulse::scroll :expand="$expand">
        ...
    </x-pulse::scroll>
</x-pulse::card>
```

`$cols`, `$rows`, `$class`, `$expand` 변수는 대시보드 뷰에서 카드 레이아웃을 사용자 정의할 수 있도록 해당 Blade 컴포넌트에 전달해야 합니다. 또한 카드가 자동으로 업데이트되도록 뷰에 `wire:poll.5s=""` 속성을 포함할 수 있습니다.

Livewire 컴포넌트와 템플릿을 정의한 후, [대시보드 뷰](#dashboard-customization)에 카드를 포함할 수 있습니다.

```blade
<x-pulse>
    ...

    <livewire:pulse.top-sellers cols="4" />
</x-pulse>
```

> [!NOTE]  
> 카드가 패키지에 포함된 경우, `Livewire::component` 메서드를 사용하여 Livewire에 컴포넌트를 등록해야 합니다.

<a name="custom-card-styling"></a>
### 스타일링

카드가 Pulse에 포함된 클래스와 컴포넌트 외에 추가 스타일링이 필요한 경우, 카드에 커스텀 CSS를 포함하는 몇 가지 옵션이 있습니다.

<a name="custom-card-styling-vite"></a>
#### Laravel Vite 통합

커스텀 카드가 애플리케이션의 코드베이스 내에 있고 Laravel의 [Vite 통합](/docs/{{version}}/vite)을 사용하는 경우, `vite.config.js` 파일을 업데이트하여 카드에 대한 전용 CSS 엔트리 포인트를 포함할 수 있습니다.

```js
laravel({
    input: [
        'resources/css/pulse/top-sellers.css',
        // ...
    ],
}),
```

그런 다음 [대시보드 뷰](#dashboard-customization)에서 `@vite` Blade 지시문을 사용하여 카드의 CSS 엔트리포인트를 지정할 수 있습니다.

```blade
<x-pulse>
    @vite('resources/css/pulse/top-sellers.css')

    ...
</x-pulse>
```

<a name="custom-card-styling-css"></a>
#### CSS 파일

패키지에 포함된 Pulse 카드를 포함한 다른 사용 사례의 경우, Livewire 컴포넌트에 CSS 파일 경로를 반환하는 `css` 메서드를 정의하여 Pulse에 추가 스타일시트를 로드하도록 지시할 수 있습니다.

```php
class TopSellers extends Card
{
    // ...

    protected function css()
    {
        return __DIR__.'/../../dist/top-sellers.css';
    }
}
```

이 카드가 대시보드에 포함되면, Pulse는 이 파일의 내용을 `<style>` 태그 내에 자동으로 포함하므로 `public` 디렉토리에 발행할 필요가 없습니다.

<a name="custom-card-styling-tailwind"></a>
#### Tailwind CSS

Tailwind CSS를 사용할 때는 불필요한 CSS를 로드하거나 Pulse의 Tailwind 클래스와 충돌하는 것을 방지하기 위해 전용 Tailwind 설정 파일을 생성해야 합니다.

```js
export default {
    darkMode: 'class',
    important: '#top-sellers',
    content: [
        './resources/views/livewire/pulse/top-sellers.blade.php',
    ],
    corePlugins: {
        preflight: false,
    },
};
```

그런 다음 CSS 엔트리포인트에서 설정 파일을 지정할 수 있습니다.

```css
@config "../../tailwind.top-sellers.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

또한 Tailwind의 [`important` 셀렉터 전략](https://tailwindcss.com/docs/configuration#selector-strategy)에 전달된 셀렉터와 일치하는 `id` 또는 `class` 속성을 카드 뷰에 포함해야 합니다.

```blade
<x-pulse::card id="top-sellers" :cols="$cols" :rows="$rows" class="$class">
    ...
</x-pulse::card>
```

<a name="custom-card-data"></a>
### 데이터 캡처 및 집계

커스텀 카드는 어디에서나 데이터를 가져와 표시할 수 있습니다. 그러나 Pulse의 강력하고 효율적인 데이터 기록 및 집계 시스템을 활용할 수 있습니다.

<a name="custom-card-data-capture"></a>
#### 엔트리 캡처

Pulse를 사용하면 `Pulse::record` 메서드를 사용하여 "엔트리"를 기록할 수 있습니다.

```php
use Laravel\Pulse\Facades\Pulse;

Pulse::record('user_sale', $user->id, $sale->amount)
    ->sum()
    ->count();
```

`record` 메서드에 제공되는 첫 번째 인수는 기록 중인 엔트리의 `type`이고, 두 번째 인수는 집계된 데이터가 어떻게 그룹화되어야 하는지를 결정하는 `key`입니다. 대부분의 집계 메서드에서는 집계할 `value`도 지정해야 합니다. 위 예제에서 집계되는 값은 `$sale->amount`입니다. 그런 다음 하나 이상의 집계 메서드(예: `sum`)를 호출하여 Pulse가 나중에 효율적으로 검색할 수 있도록 미리 집계된 값을 "버킷"에 캡처할 수 있습니다.

사용 가능한 집계 메서드는 다음과 같습니다.

* `avg`
* `count`
* `max`
* `min`
* `sum`

> [!NOTE]  
> 현재 인증된 사용자 ID를 캡처하는 카드 패키지를 빌드할 때는, 애플리케이션에 적용된 [사용자 조회 사용자 정의](#dashboard-resolving-users)를 존중하는 `Pulse::resolveAuthenticatedUserId()` 메서드를 사용해야 합니다.

<a name="custom-card-data-retrieval"></a>
#### 집계 데이터 검색

Pulse의 `Card` Livewire 컴포넌트를 확장할 때, `aggregate` 메서드를 사용하여 대시보드에서 보고 있는 기간에 대한 집계 데이터를 검색할 수 있습니다.

```php
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers', [
            'topSellers' => $this->aggregate('user_sale', ['sum', 'count'])
        ]);
    }
}
```

`aggregate` 메서드는 PHP `stdClass` 객체의 컬렉션을 반환합니다. 각 객체에는 이전에 캡처된 `key` 속성과 요청된 각 집계에 대한 키가 포함됩니다.

```
@foreach ($topSellers as $seller)
    {{ $seller->key }}
    {{ $seller->sum }}
    {{ $seller->count }}
@endforeach
```

Pulse는 주로 미리 집계된 버킷에서 데이터를 검색합니다. 따라서 지정된 집계는 `Pulse::record` 메서드를 사용하여 미리 캡처되어 있어야 합니다. 가장 오래된 버킷은 일반적으로 기간 외부에 부분적으로 속하므로, Pulse는 가장 오래된 엔트리를 집계하여 간격을 채우고 각 폴링 요청마다 전체 기간을 집계할 필요 없이 전체 기간에 대한 정확한 값을 제공합니다.

`aggregateTotal` 메서드를 사용하여 주어진 유형의 총 값을 검색할 수도 있습니다. 예를 들어, 다음 메서드는 사용자별로 그룹화하는 대신 모든 사용자 판매의 총합을 검색합니다.

```php
$total = $this->aggregateTotal('user_sale', 'sum');
```

<a name="custom-card-displaying-users"></a>
#### 사용자 표시

사용자 ID를 키로 기록하는 집계로 작업할 때, `Pulse::resolveUsers` 메서드를 사용하여 키를 사용자 레코드로 해결할 수 있습니다.

```php
$aggregates = $this->aggregate('user_sale', ['sum', 'count']);

$users = Pulse::resolveUsers($aggregates->pluck('key'));

return view('livewire.pulse.top-sellers', [
    'sellers' => $aggregates->map(fn ($aggregate) => (object) [
        'user' => $users->find($aggregate->key),
        'sum' => $aggregate->sum,
        'count' => $aggregate->count,
    ])
]);
```

`find` 메서드는 `name`, `extra`, `avatar` 키를 포함하는 객체를 반환하며, 이를 `<x-pulse::user-card>` Blade 컴포넌트에 직접 전달할 수 있습니다.

```blade
<x-pulse::user-card :user="{{ $seller->user }}" :stats="{{ $seller->sum }}" />
```

<a name="custom-recorders"></a>
#### 커스텀 레코더

패키지 작성자는 사용자가 데이터 캡처를 설정할 수 있도록 레코더 클래스를 제공할 수 있습니다.

레코더는 애플리케이션의 `config/pulse.php` 설정 파일의 `recorders` 섹션에 등록됩니다.

```php
[
    // ...
    'recorders' => [
        Acme\Recorders\Deployments::class => [
            // ...
        ],

        // ...
    ],
]
```

레코더는 `$listen` 속성을 지정하여 이벤트를 수신할 수 있습니다. Pulse는 자동으로 리스너를 등록하고 레코더의 `record` 메서드를 호출합니다.

```php
<?php

namespace Acme\Recorders;

use Acme\Events\Deployment;
use Illuminate\Support\Facades\Config;
use Laravel\Pulse\Facades\Pulse;

class Deployments
{
    /**
     * 수신할 이벤트입니다.
     *
     * @var array<int, class-string>
     */
    public array $listen = [
        Deployment::class,
    ];

    /**
     * 배포를 기록합니다.
     */
    public function record(Deployment $event): void
    {
        $config = Config::get('pulse.recorders.'.static::class);

        Pulse::record(
            // ...
        );
    }
}
```

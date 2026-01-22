# 라라벨 Telescope

- [소개](#introduction)
- [설치](#installation)
    - [로컬 전용 설치](#local-only-installation)
    - [설정](#configuration)
    - [데이터 정리](#data-pruning)
    - [대시보드 권한 부여](#dashboard-authorization)
- [Telescope 업그레이드](#upgrading-telescope)
- [필터링](#filtering)
    - [항목](#filtering-entries)
    - [배치](#filtering-batches)
- [태깅](#tagging)
- [사용 가능한 워처(Watcher)](#available-watchers)
    - [배치 워처(Batch Watcher)](#batch-watcher)
    - [캐시 워처(Cache Watcher)](#cache-watcher)
    - [커맨드 워처(Command Watcher)](#command-watcher)
    - [덤프 워처(Dump Watcher)](#dump-watcher)
    - [이벤트 워처(Event Watcher)](#event-watcher)
    - [예외 워처(Exception Watcher)](#exception-watcher)
    - [게이트 워처(Gate Watcher)](#gate-watcher)
    - [HTTP 클라이언트 워처(HTTP Client Watcher)](#http-client-watcher)
    - [작업 워처(Job Watcher)](#job-watcher)
    - [로그 워처(Log Watcher)](#log-watcher)
    - [메일 워처(Mail Watcher)](#mail-watcher)
    - [모델 워처(Model Watcher)](#model-watcher)
    - [알림 워처(Notification Watcher)](#notification-watcher)
    - [쿼리 워처(Query Watcher)](#query-watcher)
    - [Redis 워처(Redis Watcher)](#redis-watcher)
    - [요청 워처(Request Watcher)](#request-watcher)
    - [스케줄 워처(Schedule Watcher)](#schedule-watcher)
    - [뷰 워처(View Watcher)](#view-watcher)
- [사용자 아바타 표시](#displaying-user-avatars)

<a name="introduction"></a>
## 소개

[Laravel Telescope](https://github.com/laravel/telescope)는 로컬 라라벨 개발 환경에서 훌륭한 동반자 역할을 합니다. Telescope는 애플리케이션으로 들어오는 요청, 예외, 로그 항목, 데이터베이스 쿼리, 대기열 작업, 메일, 알림, 캐시 작업, 예약된 작업, 변수 덤프 등에 대한 통찰력을 제공합니다.

<img src="https://laravel.com/img/docs/telescope-example.png">

<a name="installation"></a>
## 설치

Composer 패키지 관리자를 사용하여 라라벨 프로젝트에 Telescope를 설치할 수 있습니다.

```shell
composer require laravel/telescope
```

Telescope를 설치한 후, `telescope:install` Artisan 명령어를 사용하여 에셋과 마이그레이션을 퍼블리시하세요. Telescope를 설치한 후에는 Telescope의 데이터를 저장하는 데 필요한 테이블을 생성하기 위해 `migrate` 명령어도 실행해야 합니다.

```shell
php artisan telescope:install

php artisan migrate
```

마지막으로 `/telescope` 경로를 통해 Telescope 대시보드에 접근할 수 있습니다.

<a name="local-only-installation"></a>
### 로컬 전용 설치

Telescope를 로컬 개발을 지원하는 용도로만 사용할 계획이라면, `--dev` 플래그를 사용하여 Telescope를 설치할 수 있습니다.

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

`telescope:install`을 실행한 후, 애플리케이션의 `bootstrap/providers.php` 설정 파일에서 `TelescopeServiceProvider` 서비스 프로바이더 등록을 제거해야 합니다. 대신, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 Telescope의 서비스 프로바이더를 수동으로 등록하세요. 프로바이더를 등록하기 전에 현재 환경이 `local`인지 확인합니다.

```php
/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    if ($this->app->environment('local') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {
        $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
        $this->app->register(TelescopeServiceProvider::class);
    }
}
```

마지막으로 `composer.json` 파일에 다음 내용을 추가하여 Telescope 패키지가 [자동 검색](/docs/{{version}}/packages#package-discovery)되지 않도록 해야 합니다.

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "laravel/telescope"
        ]
    }
},
```

<a name="configuration"></a>
### 설정

Telescope의 에셋을 퍼블리시한 후, 기본 설정 파일은 `config/telescope.php`에 위치하게 됩니다. 이 설정 파일을 통해 [워처 옵션](#available-watchers)을 구성할 수 있습니다. 각 설정 옵션에는 목적에 대한 설명이 포함되어 있으므로, 이 파일을 철저히 살펴보시기 바랍니다.

원하는 경우, `enabled` 설정 옵션을 사용하여 Telescope의 데이터 수집을 완전히 비활성화할 수 있습니다.

```php
'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="data-pruning"></a>
### 데이터 정리

정리하지 않으면 `telescope_entries` 테이블에 레코드가 매우 빠르게 쌓일 수 있습니다. 이를 완화하려면, `telescope:prune` Artisan 명령어가 매일 실행되도록 [스케줄링](/docs/{{version}}/scheduling)해야 합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune')->daily();
```

기본적으로 24시간이 지난 모든 항목이 정리됩니다. 명령어를 호출할 때 `hours` 옵션을 사용하여 Telescope 데이터를 얼마나 오래 보관할지 결정할 수 있습니다. 예를 들어, 다음 명령어는 48시간 이상 지난 모든 레코드를 삭제합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune --hours=48')->daily();
```

<a name="dashboard-authorization"></a>
### 대시보드 권한 부여

Telescope 대시보드는 `/telescope` 경로를 통해 접근할 수 있습니다. 기본적으로 `local` 환경에서만 이 대시보드에 접근할 수 있습니다. `app/Providers/TelescopeServiceProvider.php` 파일 내에 [권한 부여 게이트(Authorization Gate)](/docs/{{version}}/authorization#gates) 정의가 있습니다. 이 권한 부여 게이트는 **비로컬(non-local)** 환경에서 Telescope에 대한 접근을 제어합니다. Telescope 설치에 대한 접근을 제한하기 위해 필요에 따라 이 게이트를 자유롭게 수정할 수 있습니다.

```php
use App\Models\User;

/**
 * Telescope 게이트를 등록합니다.
 *
 * 이 게이트는 비로컬 환경에서 누가 Telescope에 접근할 수 있는지 결정합니다.
 */
protected function gate(): void
{
    Gate::define('viewTelescope', function (User $user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

> [!WARNING]
> 프로덕션 환경에서 `APP_ENV` 환경 변수를 `production`으로 변경했는지 확인해야 합니다. 그렇지 않으면 Telescope 설치가 공개적으로 사용 가능하게 됩니다.

<a name="upgrading-telescope"></a>
## Telescope 업그레이드

Telescope의 새로운 주요 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/telescope/blob/master/UPGRADE.md)를 주의 깊게 검토하는 것이 중요합니다.

또한, 새로운 Telescope 버전으로 업그레이드할 때마다 Telescope의 에셋을 다시 퍼블리시해야 합니다.

```shell
php artisan telescope:publish
```

에셋을 최신 상태로 유지하고 향후 업데이트에서 문제를 방지하려면, 애플리케이션의 `composer.json` 파일에 있는 `post-update-cmd` 스크립트에 `vendor:publish --tag=laravel-assets` 명령어를 추가할 수 있습니다.

```json
{
    "scripts": {
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ]
    }
}
```

<a name="filtering"></a>
## 필터링

<a name="filtering-entries"></a>
### 항목

`App\Providers\TelescopeServiceProvider` 클래스에 정의된 `filter` 클로저를 통해 Telescope가 기록하는 데이터를 필터링할 수 있습니다. 기본적으로 이 클로저는 `local` 환경에서는 모든 데이터를 기록하고, 다른 모든 환경에서는 예외, 실패한 작업, 예약된 작업, 모니터링되는 태그가 있는 데이터를 기록합니다.

```php
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::filter(function (IncomingEntry $entry) {
        if ($this->app->environment('local')) {
            return true;
        }

        return $entry->isReportableException() ||
            $entry->isFailedJob() ||
            $entry->isScheduledTask() ||
            $entry->isSlowQuery() ||
            $entry->hasMonitoredTag();
    });
}
```

<a name="filtering-batches"></a>
### 배치

`filter` 클로저가 개별 항목에 대한 데이터를 필터링하는 반면, `filterBatch` 메서드를 사용하여 주어진 요청 또는 콘솔 명령에 대한 모든 데이터를 필터링하는 클로저를 등록할 수 있습니다. 클로저가 `true`를 반환하면 Telescope가 모든 항목을 기록합니다.

```php
use Illuminate\Support\Collection;
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::filterBatch(function (Collection $entries) {
        if ($this->app->environment('local')) {
            return true;
        }

        return $entries->contains(function (IncomingEntry $entry) {
            return $entry->isReportableException() ||
                $entry->isFailedJob() ||
                $entry->isScheduledTask() ||
                $entry->isSlowQuery() ||
                $entry->hasMonitoredTag();
            });
    });
}
```

<a name="tagging"></a>
## 태깅

Telescope를 사용하면 "태그"로 항목을 검색할 수 있습니다. 태그는 종종 Telescope가 자동으로 항목에 추가하는 Eloquent 모델 클래스명 또는 인증된 사용자 ID입니다. 때때로 항목에 자신만의 커스텀 태그를 첨부하고 싶을 수 있습니다. 이를 위해 `Telescope::tag` 메서드를 사용할 수 있습니다. `tag` 메서드는 태그 배열을 반환해야 하는 클로저를 받습니다. 클로저가 반환한 태그는 Telescope가 자동으로 항목에 첨부하는 태그와 병합됩니다. 일반적으로 `App\Providers\TelescopeServiceProvider` 클래스의 `register` 메서드 내에서 `tag` 메서드를 호출해야 합니다.

```php
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::tag(function (IncomingEntry $entry) {
        return $entry->type === 'request'
            ? ['status:'.$entry->content['response_status']]
            : [];
    });
}
```

<a name="available-watchers"></a>
## 사용 가능한 워처(Watcher)

Telescope "워처(Watcher)"는 요청이나 콘솔 명령이 실행될 때 애플리케이션 데이터를 수집합니다. `config/telescope.php` 설정 파일 내에서 활성화하고자 하는 워처 목록을 커스터마이징할 수 있습니다.

```php
'watchers' => [
    Watchers\CacheWatcher::class => true,
    Watchers\CommandWatcher::class => true,
    // ...
],
```

일부 워처는 추가적인 커스터마이징 옵션도 제공합니다.

```php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 100,
    ],
    // ...
],
```

<a name="batch-watcher"></a>
### 배치 워처(Batch Watcher)

배치 워처는 작업 및 연결 정보를 포함하여 대기열에 있는 [배치](/docs/{{version}}/queues#job-batching)에 대한 정보를 기록합니다.

<a name="cache-watcher"></a>
### 캐시 워처(Cache Watcher)

캐시 워처는 캐시 키가 히트, 미스, 업데이트 및 삭제될 때 데이터를 기록합니다.

<a name="command-watcher"></a>
### 커맨드 워처(Command Watcher)

커맨드 워처는 Artisan 명령이 실행될 때마다 인수, 옵션, 종료 코드 및 출력을 기록합니다. 워처에 의해 기록되지 않도록 특정 명령을 제외하려면, `config/telescope.php` 파일의 `ignore` 옵션에 해당 명령을 지정할 수 있습니다.

```php
'watchers' => [
    Watchers\CommandWatcher::class => [
        'enabled' => env('TELESCOPE_COMMAND_WATCHER', true),
        'ignore' => ['key:generate'],
    ],
    // ...
],
```

<a name="dump-watcher"></a>
### 덤프 워처(Dump Watcher)

덤프 워처는 Telescope에서 변수 덤프를 기록하고 표시합니다. 라라벨을 사용할 때, 전역 `dump` 함수를 사용하여 변수를 덤프할 수 있습니다. 덤프가 기록되려면 브라우저에서 덤프 워처 탭이 열려 있어야 하며, 그렇지 않으면 워처가 덤프를 무시합니다.

<a name="event-watcher"></a>
### 이벤트 워처(Event Watcher)

이벤트 워처는 애플리케이션에서 발송된 모든 [이벤트](/docs/{{version}}/events)의 페이로드, 리스너 및 브로드캐스트 데이터를 기록합니다. 라라벨 프레임워크의 내부 이벤트는 이벤트 워처에 의해 무시됩니다.

<a name="exception-watcher"></a>
### 예외 워처(Exception Watcher)

예외 워처는 애플리케이션에서 발생한 보고 가능한 예외에 대한 데이터와 스택 트레이스를 기록합니다.

<a name="gate-watcher"></a>
### 게이트 워처(Gate Watcher)

게이트 워처는 애플리케이션의 [게이트 및 정책(Gate and Policy)](/docs/{{version}}/authorization) 검사에 대한 데이터와 결과를 기록합니다. 워처에 의해 기록되지 않도록 특정 능력을 제외하려면, `config/telescope.php` 파일의 `ignore_abilities` 옵션에 지정할 수 있습니다.

```php
'watchers' => [
    Watchers\GateWatcher::class => [
        'enabled' => env('TELESCOPE_GATE_WATCHER', true),
        'ignore_abilities' => ['viewNova'],
    ],
    // ...
],
```

<a name="http-client-watcher"></a>
### HTTP 클라이언트 워처(HTTP Client Watcher)

HTTP 클라이언트 워처는 애플리케이션에서 보내는 [HTTP 클라이언트 요청](/docs/{{version}}/http-client)을 기록합니다.

<a name="job-watcher"></a>
### 작업 워처(Job Watcher)

작업 워처는 애플리케이션에서 발송된 모든 [작업](/docs/{{version}}/queues)의 데이터와 상태를 기록합니다.

<a name="log-watcher"></a>
### 로그 워처(Log Watcher)

로그 워처는 애플리케이션에서 작성한 모든 로그에 대한 [로그 데이터](/docs/{{version}}/logging)를 기록합니다.

기본적으로 Telescope는 `error` 레벨 이상의 로그만 기록합니다. 그러나 애플리케이션의 `config/telescope.php` 설정 파일에서 `level` 옵션을 수정하여 이 동작을 변경할 수 있습니다.

```php
'watchers' => [
    Watchers\LogWatcher::class => [
        'enabled' => env('TELESCOPE_LOG_WATCHER', true),
        'level' => 'debug',
    ],

    // ...
],
```

<a name="mail-watcher"></a>
### 메일 워처(Mail Watcher)

메일 워처를 사용하면 애플리케이션에서 보낸 [이메일](/docs/{{version}}/mail)의 브라우저 내 미리보기를 관련 데이터와 함께 볼 수 있습니다. 또한 이메일을 `.eml` 파일로 다운로드할 수 있습니다.

<a name="model-watcher"></a>
### 모델 워처(Model Watcher)

모델 워처는 Eloquent [모델 이벤트](/docs/{{version}}/eloquent#events)가 발송될 때마다 모델 변경 사항을 기록합니다. 워처의 `events` 옵션을 통해 어떤 모델 이벤트를 기록할지 지정할 수 있습니다.

```php
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
    ],
    // ...
],
```

주어진 요청 동안 하이드레이션된 모델의 수를 기록하려면, `hydrations` 옵션을 활성화하세요.

```php
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
        'hydrations' => true,
    ],
    // ...
],
```

<a name="notification-watcher"></a>
### 알림 워처(Notification Watcher)

알림 워처는 애플리케이션에서 보낸 모든 [알림](/docs/{{version}}/notifications)을 기록합니다. 알림이 이메일을 트리거하고 메일 워처가 활성화되어 있으면, 메일 워처 화면에서 이메일 미리보기도 사용할 수 있습니다.

<a name="query-watcher"></a>
### 쿼리 워처(Query Watcher)

쿼리 워처는 애플리케이션에서 실행된 모든 쿼리의 원시 SQL, 바인딩 및 실행 시간을 기록합니다. 또한 워처는 100밀리초보다 느린 쿼리에 `slow` 태그를 지정합니다. 워처의 `slow` 옵션을 사용하여 느린 쿼리 임계값을 커스터마이징할 수 있습니다.

```php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 50,
    ],
    // ...
],
```

<a name="redis-watcher"></a>
### Redis 워처(Redis Watcher)

Redis 워처는 애플리케이션에서 실행된 모든 [Redis](/docs/{{version}}/redis) 명령을 기록합니다. 캐싱에 Redis를 사용하는 경우, 캐시 명령도 Redis 워처에 의해 기록됩니다.

<a name="request-watcher"></a>
### 요청 워처(Request Watcher)

요청 워처는 애플리케이션에서 처리한 모든 요청과 관련된 요청, 헤더, 세션 및 응답 데이터를 기록합니다. `size_limit` (킬로바이트 단위) 옵션을 통해 기록되는 응답 데이터를 제한할 수 있습니다.

```php
'watchers' => [
    Watchers\RequestWatcher::class => [
        'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
        'size_limit' => env('TELESCOPE_RESPONSE_SIZE_LIMIT', 64),
    ],
    // ...
],
```

<a name="schedule-watcher"></a>
### 스케줄 워처(Schedule Watcher)

스케줄 워처는 애플리케이션에서 실행된 모든 [예약된 작업](/docs/{{version}}/scheduling)의 명령과 출력을 기록합니다.

<a name="view-watcher"></a>
### 뷰 워처(View Watcher)

뷰 워처는 뷰를 렌더링할 때 사용된 [뷰](/docs/{{version}}/views) 이름, 경로, 데이터 및 "컴포저(Composer)"를 기록합니다.

<a name="displaying-user-avatars"></a>
## 사용자 아바타 표시

Telescope 대시보드는 특정 항목이 저장될 때 인증된 사용자의 아바타를 표시합니다. 기본적으로 Telescope는 Gravatar 웹 서비스를 사용하여 아바타를 가져옵니다. 그러나 `App\Providers\TelescopeServiceProvider` 클래스에서 콜백을 등록하여 아바타 URL을 커스터마이징할 수 있습니다. 콜백은 사용자의 ID와 이메일 주소를 받고 사용자의 아바타 이미지 URL을 반환해야 합니다.

```php
use App\Models\User;
use Laravel\Telescope\Telescope;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    // ...

    Telescope::avatar(function (?string $id, ?string $email) {
        return ! is_null($id)
            ? '/avatars/'.User::find($id)->avatar_path
            : '/generic-avatar.jpg';
    });
}
```

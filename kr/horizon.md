# 라라벨 Horizon

- [소개](#introduction)
- [설치](#installation)
    - [설정](#configuration)
    - [밸런싱 전략](#balancing-strategies)
    - [대시보드 인가](#dashboard-authorization)
    - [무시되는 작업](#silenced-jobs)
- [Horizon 업그레이드](#upgrading-horizon)
- [Horizon 실행](#running-horizon)
    - [Horizon 배포](#deploying-horizon)
- [태그](#tags)
- [알림](#notifications)
- [메트릭](#metrics)
- [실패한 작업 삭제](#deleting-failed-jobs)
- [큐에서 작업 비우기](#clearing-jobs-from-queues)

<a name="introduction"></a>
## 소개

> [!NOTE]
> 라라벨 Horizon을 살펴보기 전에, 라라벨의 기본 [큐 서비스](/docs/{{version}}/queues)에 익숙해져야 합니다. Horizon은 라라벨의 큐에 추가 기능을 더해주는데, 라라벨이 제공하는 기본 큐 기능에 익숙하지 않다면 혼란스러울 수 있습니다.

[라라벨 Horizon](https://github.com/laravel/horizon)은 라라벨 기반의 [Redis 큐](/docs/{{version}}/queues)를 위한 아름다운 대시보드와 코드 기반 설정을 제공합니다. Horizon을 사용하면 작업 처리량, 실행 시간, 작업 실패 등 큐 시스템의 주요 메트릭을 쉽게 모니터링할 수 있습니다.

Horizon을 사용하면 모든 큐 워커 설정이 단일하고 간단한 설정 파일에 저장됩니다. 버전 관리되는 파일에 애플리케이션의 워커 설정을 정의함으로써, 애플리케이션을 배포할 때 큐 워커를 쉽게 확장하거나 수정할 수 있습니다.

<img src="https://laravel.com/img/docs/horizon-example.png">

<a name="installation"></a>
## 설치

> [!WARNING]
> 라라벨 Horizon은 큐를 구동하기 위해 [Redis](https://redis.io)를 사용해야 합니다. 따라서 애플리케이션의 `config/queue.php` 설정 파일에서 큐 연결이 `redis`로 설정되어 있는지 확인해야 합니다.

Composer 패키지 관리자를 사용하여 프로젝트에 Horizon을 설치할 수 있습니다:

```shell
composer require laravel/horizon
```

Horizon을 설치한 후, `horizon:install` Artisan 명령을 사용하여 에셋을 퍼블리시합니다:

```shell
php artisan horizon:install
```

<a name="configuration"></a>
### 설정

Horizon의 에셋을 퍼블리시한 후, 기본 설정 파일은 `config/horizon.php`에 위치합니다. 이 설정 파일을 통해 애플리케이션의 큐 워커 옵션을 설정할 수 있습니다. 각 설정 옵션에는 목적에 대한 설명이 포함되어 있으므로, 이 파일을 철저히 살펴보시기 바랍니다.

> [!WARNING]
> Horizon은 내부적으로 `horizon`이라는 이름의 Redis 연결을 사용합니다. 이 Redis 연결 이름은 예약되어 있으며, `database.php` 설정 파일의 다른 Redis 연결이나 `horizon.php` 설정 파일의 `use` 옵션 값으로 할당해서는 안 됩니다.

<a name="environments"></a>
#### 환경

설치 후, 가장 먼저 익숙해져야 할 Horizon 설정 옵션은 `environments` 설정 옵션입니다. 이 설정 옵션은 애플리케이션이 실행되는 환경의 배열이며, 각 환경에 대한 워커 프로세스 옵션을 정의합니다. 기본적으로 이 항목에는 `production`과 `local` 환경이 포함되어 있습니다. 하지만 필요에 따라 더 많은 환경을 자유롭게 추가할 수 있습니다:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
    ],

    'local' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],
```

일치하는 다른 환경이 없을 때 사용될 와일드카드 환경(`*`)을 정의할 수도 있습니다:

```php
'environments' => [
    // ...

    '*' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],
```

Horizon을 시작하면, 애플리케이션이 실행 중인 환경에 대한 워커 프로세스 설정 옵션을 사용합니다. 일반적으로 환경은 `APP_ENV` [환경 변수](/docs/{{version}}/configuration#determining-the-current-environment)의 값에 의해 결정됩니다. 예를 들어, 기본 `local` Horizon 환경은 세 개의 워커 프로세스를 시작하고 각 큐에 할당된 워커 프로세스 수를 자동으로 밸런싱하도록 설정되어 있습니다. 기본 `production` 환경은 최대 10개의 워커 프로세스를 시작하고 각 큐에 할당된 워커 프로세스 수를 자동으로 밸런싱하도록 설정되어 있습니다.

> [!WARNING]
> `horizon` 설정 파일의 `environments` 부분에 Horizon을 실행할 계획인 각 [환경](/docs/{{version}}/configuration#environment-configuration)에 대한 항목이 포함되어 있는지 확인해야 합니다.

<a name="supervisors"></a>
#### 슈퍼바이저

Horizon의 기본 설정 파일에서 볼 수 있듯이, 각 환경은 하나 이상의 "슈퍼바이저(supervisors)"를 포함할 수 있습니다. 기본적으로 설정 파일은 이 슈퍼바이저를 `supervisor-1`로 정의합니다. 하지만 원하는 대로 슈퍼바이저의 이름을 자유롭게 지정할 수 있습니다. 각 슈퍼바이저는 본질적으로 워커 프로세스 그룹을 "감독"하는 역할을 하며, 큐 간의 워커 프로세스 밸런싱을 담당합니다.

해당 환경에서 실행해야 할 새로운 워커 프로세스 그룹을 정의하고 싶다면 특정 환경에 추가 슈퍼바이저를 추가할 수 있습니다. 애플리케이션에서 사용하는 특정 큐에 대해 다른 밸런싱 전략이나 워커 프로세스 수를 정의하고 싶을 때 이렇게 할 수 있습니다.

<a name="maintenance-mode"></a>
#### 점검 모드

애플리케이션이 [점검 모드(maintenance mode)](/docs/{{version}}/configuration#maintenance-mode)일 때, Horizon 설정 파일에서 슈퍼바이저의 `force` 옵션이 `true`로 정의되어 있지 않으면 큐에 등록된 작업은 Horizon에 의해 처리되지 않습니다:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'force' => true,
        ],
    ],
],
```

<a name="default-values"></a>
#### 기본값

Horizon의 기본 설정 파일 내에서 `defaults` 설정 옵션을 볼 수 있습니다. 이 설정 옵션은 애플리케이션의 [슈퍼바이저](#supervisors)에 대한 기본값을 지정합니다. 슈퍼바이저의 기본 설정 값은 각 환경의 슈퍼바이저 설정에 병합되어, 슈퍼바이저를 정의할 때 불필요한 반복을 피할 수 있습니다.

<a name="balancing-strategies"></a>
### 밸런싱 전략

라라벨의 기본 큐 시스템과 달리, Horizon은 `simple`, `auto`, `false` 세 가지 워커 밸런싱 전략 중에서 선택할 수 있습니다. `simple` 전략은 들어오는 작업을 워커 프로세스 간에 균등하게 분배합니다:

    'balance' => 'simple',

설정 파일의 기본값인 `auto` 전략은 큐의 현재 작업량에 따라 큐당 워커 프로세스 수를 조정합니다. 예를 들어, `notifications` 큐에 1,000개의 대기 중인 작업이 있고 `render` 큐가 비어 있다면, Horizon은 큐가 비워질 때까지 `notifications` 큐에 더 많은 워커를 할당합니다.

`auto` 전략을 사용할 때, `minProcesses`와 `maxProcesses` 설정 옵션을 정의하여 큐당 최소 프로세스 수와 Horizon이 스케일 업 및 다운할 총 최대 워커 프로세스 수를 제어할 수 있습니다:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'minProcesses' => 1,
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
            'tries' => 3,
        ],
    ],
],
```

`autoScalingStrategy` 설정 값은 Horizon이 큐를 비우는 데 걸리는 총 시간(`time` 전략)을 기준으로 할지, 큐의 총 작업 수(`size` 전략)를 기준으로 할지에 따라 큐에 더 많은 워커 프로세스를 할당할지 결정합니다.

`balanceMaxShift`와 `balanceCooldown` 설정 값은 Horizon이 워커 수요에 맞춰 얼마나 빠르게 스케일링할지 결정합니다. 위의 예에서는 3초마다 최대 하나의 새 프로세스가 생성되거나 삭제됩니다. 애플리케이션의 필요에 따라 이 값들을 자유롭게 조정할 수 있습니다.

`balance` 옵션이 `false`로 설정되면, 기본 라라벨 동작이 사용되며, 큐는 설정에 나열된 순서대로 처리됩니다.

<a name="dashboard-authorization"></a>
### 대시보드 인가

Horizon 대시보드는 `/horizon` 경로를 통해 접근할 수 있습니다. 기본적으로 `local` 환경에서만 이 대시보드에 접근할 수 있습니다. 하지만 `app/Providers/HorizonServiceProvider.php` 파일 내에 [인가 게이트(authorization gate)](/docs/{{version}}/authorization#gates) 정의가 있습니다. 이 인가 게이트는 **비로컬** 환경에서 Horizon에 대한 접근을 제어합니다. Horizon 설치에 대한 접근을 제한하기 위해 필요에 따라 이 게이트를 수정할 수 있습니다:

```php
/**
 * Horizon 게이트를 등록합니다.
 *
 * 이 게이트는 비로컬 환경에서 Horizon에 접근할 수 있는 사람을 결정합니다.
 */
protected function gate(): void
{
    Gate::define('viewHorizon', function (User $user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

<a name="alternative-authentication-strategies"></a>
#### 대체 인증 전략

라라벨은 인증된 사용자를 게이트 클로저에 자동으로 주입한다는 점을 기억하세요. 애플리케이션이 IP 제한과 같은 다른 방법으로 Horizon 보안을 제공하는 경우, Horizon 사용자는 "로그인"할 필요가 없을 수 있습니다. 따라서 라라벨이 인증을 요구하지 않도록 위의 `function (User $user)` 클로저 시그니처를 `function (User $user = null)`로 변경해야 합니다.

<a name="silenced-jobs"></a>
### 무시되는 작업

때때로 애플리케이션이나 서드파티 패키지에서 디스패치하는 특정 작업을 보고 싶지 않을 수 있습니다. 이러한 작업이 "완료된 작업" 목록에서 공간을 차지하는 대신, 무시할 수 있습니다. 시작하려면 애플리케이션의 `horizon` 설정 파일에서 `silenced` 설정 옵션에 작업의 클래스 이름을 추가하세요:

```php
'silenced' => [
    App\Jobs\ProcessPodcast::class,
],
```

또는 무시하고자 하는 작업이 `Laravel\Horizon\Contracts\Silenced` 인터페이스를 구현할 수 있습니다. 작업이 이 인터페이스를 구현하면, `silenced` 설정 배열에 없더라도 자동으로 무시됩니다:

```php
use Laravel\Horizon\Contracts\Silenced;

class ProcessPodcast implements ShouldQueue, Silenced
{
    use Queueable;

    // ...
}
```

<a name="upgrading-horizon"></a>
## Horizon 업그레이드

Horizon의 새로운 메이저 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/horizon/blob/master/UPGRADE.md)를 주의 깊게 검토하는 것이 중요합니다.

<a name="running-horizon"></a>
## Horizon 실행

애플리케이션의 `config/horizon.php` 설정 파일에서 슈퍼바이저와 워커를 설정한 후, `horizon` Artisan 명령을 사용하여 Horizon을 시작할 수 있습니다. 이 단일 명령은 현재 환경에 대해 설정된 모든 워커 프로세스를 시작합니다:

```shell
php artisan horizon
```

`horizon:pause`와 `horizon:continue` Artisan 명령을 사용하여 Horizon 프로세스를 일시 중지하고 작업 처리를 계속하도록 지시할 수 있습니다:

```shell
php artisan horizon:pause

php artisan horizon:continue
```

`horizon:pause-supervisor`와 `horizon:continue-supervisor` Artisan 명령을 사용하여 특정 Horizon [슈퍼바이저](#supervisors)를 일시 중지하고 계속할 수도 있습니다:

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

`horizon:status` Artisan 명령을 사용하여 Horizon 프로세스의 현재 상태를 확인할 수 있습니다:

```shell
php artisan horizon:status
```

`horizon:supervisor-status` Artisan 명령을 사용하여 특정 Horizon [슈퍼바이저](#supervisors)의 현재 상태를 확인할 수 있습니다:

```shell
php artisan horizon:supervisor-status supervisor-1
```

`horizon:terminate` Artisan 명령을 사용하여 Horizon 프로세스를 정상적으로 종료할 수 있습니다. 현재 처리 중인 모든 작업이 완료된 후 Horizon이 실행을 중지합니다:

```shell
php artisan horizon:terminate
```

<a name="deploying-horizon"></a>
### Horizon 배포

Horizon을 애플리케이션의 실제 서버에 배포할 준비가 되면, `php artisan horizon` 명령을 모니터링하고 예기치 않게 종료될 경우 다시 시작하는 프로세스 모니터를 설정해야 합니다. 걱정하지 마세요, 아래에서 프로세스 모니터를 설치하는 방법을 설명하겠습니다.

애플리케이션 배포 과정에서, 프로세스 모니터에 의해 다시 시작되어 코드 변경 사항을 받을 수 있도록 Horizon 프로세스를 종료하도록 지시해야 합니다:

```shell
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### Supervisor 설치

Supervisor는 Linux 운영 체제용 프로세스 모니터이며, `horizon` 프로세스가 실행을 중지하면 자동으로 다시 시작합니다. Ubuntu에서 Supervisor를 설치하려면 다음 명령을 사용할 수 있습니다. Ubuntu를 사용하지 않는 경우, 운영 체제의 패키지 관리자를 사용하여 Supervisor를 설치할 수 있습니다:

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Supervisor를 직접 설정하는 것이 부담스럽다면, 라라벨 애플리케이션의 백그라운드 프로세스를 관리할 수 있는 [Laravel Cloud](https://cloud.laravel.com) 사용을 고려해 보세요.

<a name="supervisor-configuration"></a>
#### Supervisor 설정

Supervisor 설정 파일은 일반적으로 서버의 `/etc/supervisor/conf.d` 디렉토리에 저장됩니다. 이 디렉토리 내에서 supervisor가 프로세스를 어떻게 모니터링해야 하는지 지시하는 설정 파일을 원하는 만큼 생성할 수 있습니다. 예를 들어, `horizon` 프로세스를 시작하고 모니터링하는 `horizon.conf` 파일을 생성해 보겠습니다:

```ini
[program:horizon]
process_name=%(program_name)s
command=php /home/forge/example.com/artisan horizon
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/example.com/horizon.log
stopwaitsecs=3600
```

Supervisor 설정을 정의할 때, `stopwaitsecs` 값이 가장 오래 실행되는 작업이 소비하는 초 수보다 크도록 해야 합니다. 그렇지 않으면 Supervisor가 작업이 처리를 완료하기 전에 종료할 수 있습니다.

> [!WARNING]
> 위의 예제는 Ubuntu 기반 서버에 유효하지만, Supervisor 설정 파일의 위치와 파일 확장자는 다른 서버 운영 체제에 따라 다를 수 있습니다. 자세한 내용은 서버의 문서를 참조하세요.

<a name="starting-supervisor"></a>
#### Supervisor 시작

설정 파일이 생성되면, 다음 명령을 사용하여 Supervisor 설정을 업데이트하고 모니터링되는 프로세스를 시작할 수 있습니다:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> [!NOTE]
> Supervisor 실행에 대한 자세한 내용은 [Supervisor 문서](http://supervisord.org/index.html)를 참조하세요.

<a name="tags"></a>
## 태그

Horizon을 사용하면 메일러블, 브로드캐스트 이벤트, 알림, 큐에 등록된 이벤트 리스너를 포함한 작업에 "태그"를 할당할 수 있습니다. 사실, Horizon은 작업에 첨부된 Eloquent 모델에 따라 대부분의 작업에 지능적으로 자동 태그를 지정합니다. 예를 들어, 다음 작업을 살펴보세요:

```php
<?php

namespace App\Jobs;

use App\Models\Video;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RenderVideo implements ShouldQueue
{
    use Queueable;

    /**
     * 새로운 작업 인스턴스를 생성합니다.
     */
    public function __construct(
        public Video $video,
    ) {}

    /**
     * 작업을 실행합니다.
     */
    public function handle(): void
    {
        // ...
    }
}
```

이 작업이 `id` 속성이 `1`인 `App\Models\Video` 인스턴스와 함께 큐에 등록되면, 자동으로 `App\Models\Video:1` 태그를 받게 됩니다. 이는 Horizon이 작업의 속성에서 Eloquent 모델을 검색하기 때문입니다. Eloquent 모델이 발견되면, Horizon은 모델의 클래스 이름과 기본 키를 사용하여 작업에 지능적으로 태그를 지정합니다:

```php
use App\Jobs\RenderVideo;
use App\Models\Video;

$video = Video::find(1);

RenderVideo::dispatch($video);
```

<a name="manually-tagging-jobs"></a>
#### 수동으로 작업에 태그 지정

큐에 등록 가능한 객체 중 하나의 태그를 수동으로 정의하고 싶다면, 클래스에 `tags` 메서드를 정의할 수 있습니다:

```php
class RenderVideo implements ShouldQueue
{
    /**
     * 작업에 할당해야 할 태그를 가져옵니다.
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return ['render', 'video:'.$this->video->id];
    }
}
```

<a name="manually-tagging-event-listeners"></a>
#### 수동으로 이벤트 리스너에 태그 지정

큐에 등록된 이벤트 리스너의 태그를 가져올 때, Horizon은 이벤트 인스턴스를 `tags` 메서드에 자동으로 전달하여 태그에 이벤트 데이터를 추가할 수 있습니다:

```php
class SendRenderNotifications implements ShouldQueue
{
    /**
     * 리스너에 할당해야 할 태그를 가져옵니다.
     *
     * @return array<int, string>
     */
    public function tags(VideoRendered $event): array
    {
        return ['video:'.$event->video->id];
    }
}
```

<a name="notifications"></a>
## 알림

> [!WARNING]
> Horizon이 Slack 또는 SMS 알림을 보내도록 설정할 때, [관련 알림 채널의 사전 요구 사항](/docs/{{version}}/notifications)을 검토해야 합니다.

큐 중 하나의 대기 시간이 길 때 알림을 받고 싶다면, `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo`, `Horizon::routeSmsNotificationsTo` 메서드를 사용할 수 있습니다. 애플리케이션의 `App\Providers\HorizonServiceProvider`의 `boot` 메서드에서 이 메서드들을 호출할 수 있습니다:

```php
/**
 * 모든 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    parent::boot();

    Horizon::routeSmsNotificationsTo('15556667777');
    Horizon::routeMailNotificationsTo('example@example.com');
    Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
}
```

<a name="configuring-notification-wait-time-thresholds"></a>
#### 알림 대기 시간 임계값 설정

애플리케이션의 `config/horizon.php` 설정 파일 내에서 몇 초가 "긴 대기"로 간주되는지 설정할 수 있습니다. 이 파일의 `waits` 설정 옵션을 통해 각 연결/큐 조합에 대한 긴 대기 임계값을 제어할 수 있습니다. 정의되지 않은 연결/큐 조합은 기본적으로 60초의 긴 대기 임계값을 가집니다:

```php
'waits' => [
    'redis:critical' => 30,
    'redis:default' => 60,
    'redis:batch' => 120,
],
```

<a name="metrics"></a>
## 메트릭

Horizon은 작업 및 큐 대기 시간과 처리량에 대한 정보를 제공하는 메트릭 대시보드를 포함합니다. 이 대시보드를 채우려면, 애플리케이션의 `routes/console.php` 파일에서 Horizon의 `snapshot` Artisan 명령을 5분마다 실행하도록 설정해야 합니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('horizon:snapshot')->everyFiveMinutes();
```

<a name="deleting-failed-jobs"></a>
## 실패한 작업 삭제

실패한 작업을 삭제하려면 `horizon:forget` 명령을 사용할 수 있습니다. `horizon:forget` 명령은 실패한 작업의 ID 또는 UUID를 유일한 인수로 받습니다:

```shell
php artisan horizon:forget 5
```

모든 실패한 작업을 삭제하려면 `horizon:forget` 명령에 `--all` 옵션을 제공하면 됩니다:

```shell
php artisan horizon:forget --all
```

<a name="clearing-jobs-from-queues"></a>
## 큐에서 작업 비우기

애플리케이션의 기본 큐에서 모든 작업을 삭제하려면 `horizon:clear` Artisan 명령을 사용할 수 있습니다:

```shell
php artisan horizon:clear
```

특정 큐에서 작업을 삭제하려면 `queue` 옵션을 제공할 수 있습니다:

```shell
php artisan horizon:clear --queue=emails
```

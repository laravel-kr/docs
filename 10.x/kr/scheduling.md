# 작업 스케줄링(Task Scheduling)

- [소개](#introduction)
- [스케줄 정의하기](#defining-schedules)
    - [아티즌 명령어 스케줄링](#scheduling-artisan-commands)
    - [큐 작업 스케줄링](#scheduling-queued-jobs)
    - [셸 명령어 스케줄링](#scheduling-shell-commands)
    - [스케줄 빈도 옵션](#schedule-frequency-options)
    - [타임존](#timezones)
    - [작업 중복 방지](#preventing-task-overlaps)
    - [단일 서버에서 작업 실행하기](#running-tasks-on-one-server)
    - [백그라운드 작업](#background-tasks)
    - [점검 모드](#maintenance-mode)
- [스케줄러 실행하기](#running-the-scheduler)
    - [분 단위 이하 스케줄 작업](#sub-minute-scheduled-tasks)
    - [로컬에서 스케줄러 실행하기](#running-the-scheduler-locally)
- [작업 출력](#task-output)
- [작업 훅](#task-hooks)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

과거에는 서버에서 스케줄링이 필요한 각 작업마다 cron 설정 항목을 작성해야 했습니다. 하지만 이 방식은 작업 스케줄이 소스 컨트롤에 포함되지 않고, 기존 cron 항목을 확인하거나 새 항목을 추가하려면 서버에 SSH로 접속해야 하기 때문에 금세 번거로워질 수 있습니다.

Laravel의 명령어 스케줄러는 서버에서 스케줄 작업을 관리하는 새로운 접근 방식을 제공합니다. 스케줄러를 사용하면 Laravel 애플리케이션 내에서 명령어 스케줄을 유연하고 표현력 있게 정의할 수 있습니다. 스케줄러를 사용할 때 서버에 필요한 cron 항목은 단 하나뿐입니다. 작업 스케줄은 `app/Console/Kernel.php` 파일의 `schedule` 메서드에 정의됩니다. 시작하는 데 도움이 되도록 간단한 예제가 이 메서드 내에 정의되어 있습니다.

<a name="defining-schedules"></a>
## 스케줄 정의하기

애플리케이션의 `App\Console\Kernel` 클래스의 `schedule` 메서드에서 모든 스케줄 작업을 정의할 수 있습니다. 시작하기 위해 예제를 살펴보겠습니다. 이 예제에서는 매일 자정에 호출되는 클로저를 스케줄링합니다. 클로저 내에서 테이블을 비우는 데이터베이스 쿼리를 실행합니다.

    <?php

    namespace App\Console;

    use Illuminate\Console\Scheduling\Schedule;
    use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
    use Illuminate\Support\Facades\DB;

    class Kernel extends ConsoleKernel
    {
        /**
         * Define the application's command schedule.
         */
        protected function schedule(Schedule $schedule): void
        {
            $schedule->call(function () {
                DB::table('recent_users')->delete();
            })->daily();
        }
    }

클로저를 사용한 스케줄링 외에도 [호출 가능한 객체(invokable objects)](https://secure.php.net/manual/en/language.oop5.magic.php#object.invoke)를 스케줄링할 수 있습니다. 호출 가능한 객체는 `__invoke` 메서드를 포함하는 간단한 PHP 클래스입니다.

    $schedule->call(new DeleteRecentUsers)->daily();

스케줄 작업의 개요와 다음 실행 예정 시간을 확인하려면 `schedule:list` 아티즌 명령어를 사용할 수 있습니다.

```bash
php artisan schedule:list
```

<a name="scheduling-artisan-commands"></a>
### 아티즌 명령어 스케줄링

클로저 스케줄링 외에도 [아티즌 명령어](/docs/{{version}}/artisan)와 시스템 명령어를 스케줄링할 수 있습니다. 예를 들어, `command` 메서드를 사용하여 명령어의 이름이나 클래스를 통해 아티즌 명령어를 스케줄링할 수 있습니다.

명령어의 클래스명을 사용하여 아티즌 명령어를 스케줄링할 때, 명령어 호출 시 제공해야 할 추가 커맨드라인 인수 배열을 전달할 수 있습니다.

    use App\Console\Commands\SendEmailsCommand;

    $schedule->command('emails:send Taylor --force')->daily();

    $schedule->command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();

<a name="scheduling-queued-jobs"></a>
### 큐 작업 스케줄링

`job` 메서드를 사용하여 [큐 작업](/docs/{{version}}/queues)을 스케줄링할 수 있습니다. 이 메서드는 작업을 큐에 추가하기 위한 클로저를 정의하는 `call` 메서드를 사용하지 않고도 큐 작업을 스케줄링할 수 있는 편리한 방법을 제공합니다.

    use App\Jobs\Heartbeat;

    $schedule->job(new Heartbeat)->everyFiveMinutes();

`job` 메서드에 선택적으로 두 번째와 세 번째 인수를 제공하여 작업을 큐에 추가할 때 사용할 큐 이름과 큐 연결을 지정할 수 있습니다.

    use App\Jobs\Heartbeat;

    // "sqs" 연결의 "heartbeats" 큐로 작업을 디스패치...
    $schedule->job(new Heartbeat, 'heartbeats', 'sqs')->everyFiveMinutes();

<a name="scheduling-shell-commands"></a>
### 셸 명령어 스케줄링

`exec` 메서드를 사용하여 운영 체제에 명령어를 실행할 수 있습니다.

    $schedule->exec('node /home/forge/script.js')->daily();

<a name="schedule-frequency-options"></a>
### 스케줄 빈도 옵션

지정된 간격으로 작업을 실행하도록 구성하는 몇 가지 예제를 이미 살펴보았습니다. 하지만 작업에 할당할 수 있는 작업 스케줄 빈도는 훨씬 더 많습니다.

<div class="overflow-auto">

| 메서드                              | 설명                                                |
| ---------------------------------- | -------------------------------------------------- |
| `->cron('* * * * *');`             | 사용자 정의 cron 스케줄로 작업을 실행합니다.              |
| `->everySecond();`                 | 매초마다 작업을 실행합니다.                            |
| `->everyTwoSeconds();`             | 2초마다 작업을 실행합니다.                             |
| `->everyFiveSeconds();`            | 5초마다 작업을 실행합니다.                             |
| `->everyTenSeconds();`             | 10초마다 작업을 실행합니다.                            |
| `->everyFifteenSeconds();`         | 15초마다 작업을 실행합니다.                            |
| `->everyTwentySeconds();`          | 20초마다 작업을 실행합니다.                            |
| `->everyThirtySeconds();`          | 30초마다 작업을 실행합니다.                            |
| `->everyMinute();`                 | 매분마다 작업을 실행합니다.                            |
| `->everyTwoMinutes();`             | 2분마다 작업을 실행합니다.                             |
| `->everyThreeMinutes();`           | 3분마다 작업을 실행합니다.                             |
| `->everyFourMinutes();`            | 4분마다 작업을 실행합니다.                             |
| `->everyFiveMinutes();`            | 5분마다 작업을 실행합니다.                             |
| `->everyTenMinutes();`             | 10분마다 작업을 실행합니다.                            |
| `->everyFifteenMinutes();`         | 15분마다 작업을 실행합니다.                            |
| `->everyThirtyMinutes();`          | 30분마다 작업을 실행합니다.                            |
| `->hourly();`                      | 매시간 작업을 실행합니다.                              |
| `->hourlyAt(17);`                  | 매시간 17분에 작업을 실행합니다.                        |
| `->everyOddHour($minutes = 0);`    | 홀수 시간마다 작업을 실행합니다.                        |
| `->everyTwoHours($minutes = 0);`   | 2시간마다 작업을 실행합니다.                           |
| `->everyThreeHours($minutes = 0);` | 3시간마다 작업을 실행합니다.                           |
| `->everyFourHours($minutes = 0);`  | 4시간마다 작업을 실행합니다.                           |
| `->everySixHours($minutes = 0);`   | 6시간마다 작업을 실행합니다.                           |
| `->daily();`                       | 매일 자정에 작업을 실행합니다.                          |
| `->dailyAt('13:00');`              | 매일 13:00에 작업을 실행합니다.                        |
| `->twiceDaily(1, 13);`             | 매일 1:00과 13:00에 작업을 실행합니다.                  |
| `->twiceDailyAt(1, 13, 15);`       | 매일 1:15와 13:15에 작업을 실행합니다.                  |
| `->weekly();`                      | 매주 일요일 00:00에 작업을 실행합니다.                   |
| `->weeklyOn(1, '8:00');`           | 매주 월요일 8:00에 작업을 실행합니다.                    |
| `->monthly();`                     | 매월 1일 00:00에 작업을 실행합니다.                     |
| `->monthlyOn(4, '15:00');`         | 매월 4일 15:00에 작업을 실행합니다.                     |
| `->twiceMonthly(1, 16, '13:00');`  | 매월 1일과 16일 13:00에 작업을 실행합니다.               |
| `->lastDayOfMonth('15:00');`       | 매월 마지막 날 15:00에 작업을 실행합니다.                |
| `->quarterly();`                   | 매 분기 첫째 날 00:00에 작업을 실행합니다.               |
| `->quarterlyOn(4, '14:00');`       | 매 분기 4일 14:00에 작업을 실행합니다.                  |
| `->yearly();`                      | 매년 첫째 날 00:00에 작업을 실행합니다.                  |
| `->yearlyOn(6, 1, '17:00');`       | 매년 6월 1일 17:00에 작업을 실행합니다.                 |
| `->timezone('America/New_York');`  | 작업의 타임존을 설정합니다.                             |

</div>

이러한 메서드는 추가 제약 조건과 결합하여 특정 요일에만 실행되는 더 세밀하게 조정된 스케줄을 만들 수 있습니다. 예를 들어, 매주 월요일에 명령어를 실행하도록 스케줄링할 수 있습니다.

    // 매주 월요일 오후 1시에 한 번 실행...
    $schedule->call(function () {
        // ...
    })->weekly()->mondays()->at('13:00');

    // 평일 오전 8시부터 오후 5시까지 매시간 실행...
    $schedule->command('foo')
              ->weekdays()
              ->hourly()
              ->timezone('America/Chicago')
              ->between('8:00', '17:00');

추가 스케줄 제약 조건 목록은 아래에서 확인할 수 있습니다.

<div class="overflow-auto">

| 메서드                                    | 설명                                           |
| ---------------------------------------- | ---------------------------------------------- |
| `->weekdays();`                          | 평일로 작업을 제한합니다.                         |
| `->weekends();`                          | 주말로 작업을 제한합니다.                         |
| `->sundays();`                           | 일요일로 작업을 제한합니다.                        |
| `->mondays();`                           | 월요일로 작업을 제한합니다.                        |
| `->tuesdays();`                          | 화요일로 작업을 제한합니다.                        |
| `->wednesdays();`                        | 수요일로 작업을 제한합니다.                        |
| `->thursdays();`                         | 목요일로 작업을 제한합니다.                        |
| `->fridays();`                           | 금요일로 작업을 제한합니다.                        |
| `->saturdays();`                         | 토요일로 작업을 제한합니다.                        |
| `->days(array\|mixed);`                  | 특정 요일로 작업을 제한합니다.                     |
| `->between($startTime, $endTime);`       | 시작 시간과 종료 시간 사이에 작업을 실행하도록 제한합니다. |
| `->unlessBetween($startTime, $endTime);` | 시작 시간과 종료 시간 사이에 작업이 실행되지 않도록 제한합니다. |
| `->when(Closure);`                       | 조건 테스트에 따라 작업을 제한합니다.               |
| `->environments($env);`                  | 특정 환경으로 작업을 제한합니다.                   |

</div>

<a name="day-constraints"></a>
#### 요일 제약 조건

`days` 메서드를 사용하여 특정 요일로 작업 실행을 제한할 수 있습니다. 예를 들어, 일요일과 수요일에 매시간 명령어를 실행하도록 스케줄링할 수 있습니다.

    $schedule->command('emails:send')
                    ->hourly()
                    ->days([0, 3]);

또는 작업이 실행되어야 하는 요일을 정의할 때 `Illuminate\Console\Scheduling\Schedule` 클래스에서 사용 가능한 상수를 사용할 수 있습니다.

    use Illuminate\Console\Scheduling\Schedule;

    $schedule->command('emails:send')
                    ->hourly()
                    ->days([Schedule::SUNDAY, Schedule::WEDNESDAY]);

<a name="between-time-constraints"></a>
#### 시간 범위 제약 조건

`between` 메서드를 사용하여 하루 중 특정 시간대에 따라 작업 실행을 제한할 수 있습니다.

    $schedule->command('emails:send')
                        ->hourly()
                        ->between('7:00', '22:00');

마찬가지로 `unlessBetween` 메서드를 사용하여 특정 시간대에 작업 실행을 제외할 수 있습니다.

    $schedule->command('emails:send')
                        ->hourly()
                        ->unlessBetween('23:00', '4:00');

<a name="truth-test-constraints"></a>
#### 조건 테스트 제약 조건

`when` 메서드를 사용하여 주어진 조건 테스트 결과에 따라 작업 실행을 제한할 수 있습니다. 즉, 주어진 클로저가 `true`를 반환하면 다른 제약 조건이 작업 실행을 방해하지 않는 한 작업이 실행됩니다.

    $schedule->command('emails:send')->daily()->when(function () {
        return true;
    });

`skip` 메서드는 `when`의 반대로 볼 수 있습니다. `skip` 메서드가 `true`를 반환하면 스케줄된 작업이 실행되지 않습니다.

    $schedule->command('emails:send')->daily()->skip(function () {
        return true;
    });

`when` 메서드를 체이닝하여 사용할 때 스케줄된 명령어는 모든 `when` 조건이 `true`를 반환할 때만 실행됩니다.

<a name="environment-constraints"></a>
#### 환경 제약 조건

`environments` 메서드를 사용하여 주어진 환경에서만 작업을 실행할 수 있습니다(`APP_ENV` [환경 변수](/docs/{{version}}/configuration#environment-configuration)로 정의됨).

    $schedule->command('emails:send')
                ->daily()
                ->environments(['staging', 'production']);

<a name="timezones"></a>
### 타임존

`timezone` 메서드를 사용하여 스케줄된 작업의 시간이 주어진 타임존 내에서 해석되도록 지정할 수 있습니다.

    $schedule->command('report:generate')
             ->timezone('America/New_York')
             ->at('2:00')

모든 스케줄 작업에 동일한 타임존을 반복적으로 할당하는 경우, `App\Console\Kernel` 클래스에서 `scheduleTimezone` 메서드를 정의할 수 있습니다. 이 메서드는 모든 스케줄 작업에 할당해야 하는 기본 타임존을 반환해야 합니다.

    use DateTimeZone;

    /**
     * Get the timezone that should be used by default for scheduled events.
     */
    protected function scheduleTimezone(): DateTimeZone|string|null
    {
        return 'America/Chicago';
    }

> [!WARNING]
> 일부 타임존은 일광 절약 시간제를 사용합니다. 일광 절약 시간 변경이 발생하면 스케줄된 작업이 두 번 실행되거나 전혀 실행되지 않을 수 있습니다. 이러한 이유로 가능하면 타임존 스케줄링을 피하는 것이 좋습니다.

<a name="preventing-task-overlaps"></a>
### 작업 중복 방지

기본적으로 스케줄된 작업은 이전 인스턴스가 아직 실행 중이더라도 실행됩니다. 이를 방지하려면 `withoutOverlapping` 메서드를 사용할 수 있습니다.

    $schedule->command('emails:send')->withoutOverlapping();

이 예제에서 `emails:send` [아티즌 명령어](/docs/{{version}}/artisan)는 아직 실행 중이 아닌 경우 매분 실행됩니다. `withoutOverlapping` 메서드는 실행 시간이 크게 다른 작업이 있어 주어진 작업이 얼마나 오래 걸릴지 정확히 예측할 수 없을 때 특히 유용합니다.

필요한 경우 "중복 방지" 잠금이 만료되기까지 경과해야 하는 시간(분)을 지정할 수 있습니다. 기본적으로 잠금은 24시간 후에 만료됩니다.

    $schedule->command('emails:send')->withoutOverlapping(10);

내부적으로 `withoutOverlapping` 메서드는 애플리케이션의 [캐시](/docs/{{version}}/cache)를 사용하여 잠금을 획득합니다. 필요한 경우 `schedule:clear-cache` 아티즌 명령어를 사용하여 이러한 캐시 잠금을 해제할 수 있습니다. 이는 일반적으로 예상치 못한 서버 문제로 작업이 멈춘 경우에만 필요합니다.

<a name="running-tasks-on-one-server"></a>
### 단일 서버에서 작업 실행하기

> [!WARNING]
> 이 기능을 사용하려면 애플리케이션이 기본 캐시 드라이버로 `database`, `memcached`, `dynamodb` 또는 `redis` 캐시 드라이버를 사용해야 합니다. 또한 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

애플리케이션의 스케줄러가 여러 서버에서 실행 중인 경우 스케줄된 작업을 단일 서버에서만 실행하도록 제한할 수 있습니다. 예를 들어, 매주 금요일 밤에 새 보고서를 생성하는 스케줄 작업이 있다고 가정합니다. 작업 스케줄러가 세 개의 워커 서버에서 실행 중이면 스케줄된 작업이 세 서버 모두에서 실행되어 보고서가 세 번 생성됩니다. 좋지 않습니다!

작업이 단일 서버에서만 실행되도록 하려면 스케줄 작업을 정의할 때 `onOneServer` 메서드를 사용합니다. 작업을 획득한 첫 번째 서버가 작업에 대한 원자적 잠금을 확보하여 다른 서버가 동시에 동일한 작업을 실행하지 못하도록 합니다.

    $schedule->command('report:generate')
                    ->fridays()
                    ->at('17:00')
                    ->onOneServer();

<a name="naming-unique-jobs"></a>
#### 단일 서버 작업 이름 지정하기

때로는 동일한 작업을 다른 매개변수로 디스패치하도록 스케줄링하면서도 각 작업 순열이 단일 서버에서 실행되도록 Laravel에 지시해야 할 수 있습니다. 이를 위해 `name` 메서드를 통해 각 스케줄 정의에 고유한 이름을 할당할 수 있습니다.

```php
$schedule->job(new CheckUptime('https://laravel.com'))
            ->name('check_uptime:laravel.com')
            ->everyFiveMinutes()
            ->onOneServer();

$schedule->job(new CheckUptime('https://vapor.laravel.com'))
            ->name('check_uptime:vapor.laravel.com')
            ->everyFiveMinutes()
            ->onOneServer();
```

마찬가지로 단일 서버에서 실행되도록 의도된 스케줄된 클로저에도 이름을 할당해야 합니다.

```php
$schedule->call(fn () => User::resetApiRequestCount())
    ->name('reset-api-request-count')
    ->daily()
    ->onOneServer();
```

<a name="background-tasks"></a>
### 백그라운드 작업

기본적으로 동시에 스케줄된 여러 작업은 `schedule` 메서드에 정의된 순서대로 순차적으로 실행됩니다. 오래 실행되는 작업이 있으면 후속 작업이 예상보다 훨씬 늦게 시작될 수 있습니다. 모든 작업이 동시에 실행될 수 있도록 백그라운드에서 작업을 실행하려면 `runInBackground` 메서드를 사용할 수 있습니다.

    $schedule->command('analytics:report')
             ->daily()
             ->runInBackground();

> [!WARNING]
> `runInBackground` 메서드는 `command` 및 `exec` 메서드를 통해 작업을 스케줄링할 때만 사용할 수 있습니다.

<a name="maintenance-mode"></a>
### 점검 모드

애플리케이션이 [점검 모드](/docs/{{version}}/configuration#maintenance-mode)일 때 애플리케이션의 스케줄 작업은 실행되지 않습니다. 서버에서 수행 중인 미완료 유지보수 작업에 작업이 간섭하는 것을 원치 않기 때문입니다. 그러나 점검 모드에서도 작업을 강제로 실행하려면 작업 정의 시 `evenInMaintenanceMode` 메서드를 호출할 수 있습니다.

    $schedule->command('emails:send')->evenInMaintenanceMode();

<a name="running-the-scheduler"></a>
## 스케줄러 실행하기

스케줄 작업을 정의하는 방법을 배웠으니 이제 서버에서 실제로 실행하는 방법을 알아보겠습니다. `schedule:run` 아티즌 명령어는 모든 스케줄 작업을 평가하고 서버의 현재 시간을 기준으로 실행해야 하는지 결정합니다.

따라서 Laravel의 스케줄러를 사용할 때는 매분 `schedule:run` 명령어를 실행하는 단일 cron 설정 항목만 서버에 추가하면 됩니다. 서버에 cron 항목을 추가하는 방법을 모르는 경우 cron 항목을 관리해주는 [Laravel Forge](https://forge.laravel.com)와 같은 서비스 사용을 고려해 보세요.

```shell
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

<a name="sub-minute-scheduled-tasks"></a>
### 분 단위 이하 스케줄 작업

대부분의 운영 체제에서 cron 작업은 최대 분당 한 번만 실행할 수 있습니다. 그러나 Laravel의 스케줄러를 사용하면 초당 한 번까지 더 빈번한 간격으로 작업을 스케줄링할 수 있습니다.

    $schedule->call(function () {
        DB::table('recent_users')->delete();
    })->everySecond();

애플리케이션 내에서 분 단위 이하 작업이 정의되면 `schedule:run` 명령어는 즉시 종료되지 않고 현재 분이 끝날 때까지 계속 실행됩니다. 이를 통해 명령어가 해당 분 동안 필요한 모든 분 단위 이하 작업을 호출할 수 있습니다.

예상보다 오래 걸리는 분 단위 이하 작업은 이후 분 단위 이하 작업의 실행을 지연시킬 수 있으므로, 모든 분 단위 이하 작업이 실제 작업 처리를 위해 큐 작업이나 백그라운드 명령어를 디스패치하는 것이 좋습니다.

    use App\Jobs\DeleteRecentUsers;

    $schedule->job(new DeleteRecentUsers)->everyTenSeconds();

    $schedule->command('users:delete')->everyTenSeconds()->runInBackground();

<a name="interrupting-sub-minute-tasks"></a>
#### 분 단위 이하 작업 중단하기

분 단위 이하 작업이 정의된 경우 `schedule:run` 명령어는 호출된 전체 분 동안 실행되므로, 애플리케이션을 배포할 때 명령어를 중단해야 할 수 있습니다. 그렇지 않으면 이미 실행 중인 `schedule:run` 명령어 인스턴스가 현재 분이 끝날 때까지 이전에 배포된 애플리케이션 코드를 계속 사용하게 됩니다.

진행 중인 `schedule:run` 호출을 중단하려면 애플리케이션의 배포 스크립트에 `schedule:interrupt` 명령어를 추가할 수 있습니다. 이 명령어는 애플리케이션 배포가 완료된 후 호출해야 합니다.

```shell
php artisan schedule:interrupt
```

<a name="running-the-scheduler-locally"></a>
### 로컬에서 스케줄러 실행하기

일반적으로 로컬 개발 머신에는 스케줄러 cron 항목을 추가하지 않습니다. 대신 `schedule:work` 아티즌 명령어를 사용할 수 있습니다. 이 명령어는 포그라운드에서 실행되며 명령어를 종료할 때까지 매분 스케줄러를 호출합니다.

```shell
php artisan schedule:work
```

<a name="task-output"></a>
## 작업 출력

Laravel 스케줄러는 스케줄 작업에서 생성된 출력을 처리하기 위한 여러 편리한 메서드를 제공합니다. 먼저, `sendOutputTo` 메서드를 사용하여 나중에 검사할 수 있도록 출력을 파일로 보낼 수 있습니다.

    $schedule->command('emails:send')
             ->daily()
             ->sendOutputTo($filePath);

주어진 파일에 출력을 추가하려면 `appendOutputTo` 메서드를 사용할 수 있습니다.

    $schedule->command('emails:send')
             ->daily()
             ->appendOutputTo($filePath);

`emailOutputTo` 메서드를 사용하여 원하는 이메일 주소로 출력을 이메일로 보낼 수 있습니다. 작업 출력을 이메일로 보내기 전에 Laravel의 [이메일 서비스](/docs/{{version}}/mail)를 구성해야 합니다.

    $schedule->command('report:generate')
             ->daily()
             ->sendOutputTo($filePath)
             ->emailOutputTo('taylor@example.com');

스케줄된 아티즌 또는 시스템 명령어가 0이 아닌 종료 코드로 종료된 경우에만 출력을 이메일로 보내려면 `emailOutputOnFailure` 메서드를 사용합니다.

    $schedule->command('report:generate')
             ->daily()
             ->emailOutputOnFailure('taylor@example.com');

> [!WARNING]
> `emailOutputTo`, `emailOutputOnFailure`, `sendOutputTo`, `appendOutputTo` 메서드는 `command` 및 `exec` 메서드에서만 사용할 수 있습니다.

<a name="task-hooks"></a>
## 작업 훅

`before` 및 `after` 메서드를 사용하여 스케줄 작업 실행 전후에 실행될 코드를 지정할 수 있습니다.

    $schedule->command('emails:send')
             ->daily()
             ->before(function () {
                 // 작업이 곧 실행됩니다...
             })
             ->after(function () {
                 // 작업이 실행되었습니다...
             });

`onSuccess` 및 `onFailure` 메서드를 사용하여 스케줄 작업이 성공하거나 실패할 때 실행될 코드를 지정할 수 있습니다. 실패는 스케줄된 아티즌 또는 시스템 명령어가 0이 아닌 종료 코드로 종료되었음을 나타냅니다.

    $schedule->command('emails:send')
             ->daily()
             ->onSuccess(function () {
                 // 작업이 성공했습니다...
             })
             ->onFailure(function () {
                 // 작업이 실패했습니다...
             });

명령어에서 출력을 사용할 수 있는 경우 훅의 클로저 정의에서 `$output` 인수로 `Illuminate\Support\Stringable` 인스턴스를 타입 힌트하여 `after`, `onSuccess` 또는 `onFailure` 훅에서 접근할 수 있습니다.

    use Illuminate\Support\Stringable;

    $schedule->command('emails:send')
             ->daily()
             ->onSuccess(function (Stringable $output) {
                 // 작업이 성공했습니다...
             })
             ->onFailure(function (Stringable $output) {
                 // 작업이 실패했습니다...
             });

<a name="pinging-urls"></a>
#### URL 핑하기

`pingBefore` 및 `thenPing` 메서드를 사용하면 스케줄러가 작업 실행 전후에 자동으로 주어진 URL을 핑할 수 있습니다. 이 메서드는 [Envoyer](https://envoyer.io)와 같은 외부 서비스에 스케줄 작업이 시작되거나 완료되었음을 알리는 데 유용합니다.

    $schedule->command('emails:send')
             ->daily()
             ->pingBefore($url)
             ->thenPing($url);

`pingBeforeIf` 및 `thenPingIf` 메서드를 사용하여 주어진 조건이 `true`인 경우에만 주어진 URL을 핑할 수 있습니다.

    $schedule->command('emails:send')
             ->daily()
             ->pingBeforeIf($condition, $url)
             ->thenPingIf($condition, $url);

`pingOnSuccess` 및 `pingOnFailure` 메서드를 사용하여 작업이 성공하거나 실패한 경우에만 주어진 URL을 핑할 수 있습니다. 실패는 스케줄된 아티즌 또는 시스템 명령어가 0이 아닌 종료 코드로 종료되었음을 나타냅니다.

    $schedule->command('emails:send')
             ->daily()
             ->pingOnSuccess($successUrl)
             ->pingOnFailure($failureUrl);

모든 핑 메서드는 Guzzle HTTP 라이브러리가 필요합니다. Guzzle은 일반적으로 모든 새 Laravel 프로젝트에 기본적으로 설치되지만, 실수로 제거된 경우 Composer 패키지 매니저를 사용하여 프로젝트에 수동으로 Guzzle을 설치할 수 있습니다.

```shell
composer require guzzlehttp/guzzle
```

<a name="events"></a>
## 이벤트

필요한 경우 스케줄러가 디스패치하는 [이벤트](/docs/{{version}}/events)를 수신할 수 있습니다. 일반적으로 이벤트 리스너 매핑은 애플리케이션의 `App\Providers\EventServiceProvider` 클래스 내에서 정의됩니다.

    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'Illuminate\Console\Events\ScheduledTaskStarting' => [
            'App\Listeners\LogScheduledTaskStarting',
        ],

        'Illuminate\Console\Events\ScheduledTaskFinished' => [
            'App\Listeners\LogScheduledTaskFinished',
        ],

        'Illuminate\Console\Events\ScheduledBackgroundTaskFinished' => [
            'App\Listeners\LogScheduledBackgroundTaskFinished',
        ],

        'Illuminate\Console\Events\ScheduledTaskSkipped' => [
            'App\Listeners\LogScheduledTaskSkipped',
        ],

        'Illuminate\Console\Events\ScheduledTaskFailed' => [
            'App\Listeners\LogScheduledTaskFailed',
        ],
    ];

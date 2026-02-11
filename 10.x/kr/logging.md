# 로깅 (Logging)

- [소개](#introduction)
- [설정](#configuration)
    - [사용 가능한 채널 드라이버](#available-channel-drivers)
    - [채널 사전 요구사항](#channel-prerequisites)
    - [사용 중단 경고 로깅](#logging-deprecation-warnings)
- [로그 스택 구축](#building-log-stacks)
- [로그 메시지 작성](#writing-log-messages)
    - [컨텍스트 정보](#contextual-information)
    - [특정 채널에 로그 작성](#writing-to-specific-channels)
- [Monolog 채널 커스터마이징](#monolog-channel-customization)
    - [채널별 Monolog 커스터마이징](#customizing-monolog-for-channels)
    - [Monolog 핸들러 채널 생성](#creating-monolog-handler-channels)
    - [팩토리를 통한 커스텀 채널 생성](#creating-custom-channels-via-factories)
- [Pail을 사용한 로그 메시지 실시간 확인](#tailing-log-messages-using-pail)
    - [설치](#pail-installation)
    - [사용법](#pail-usage)
    - [로그 필터링](#pail-filtering-logs)

<a name="introduction"></a>
## 소개

애플리케이션 내부에서 무슨 일이 일어나고 있는지 파악하는 데 도움을 주기 위해, Laravel은 파일, 시스템 에러 로그, 심지어 팀 전체에 알림을 보낼 수 있는 Slack까지 메시지를 기록할 수 있는 강력한 로깅 서비스를 제공합니다.

Laravel 로깅은 "채널(Channel)"을 기반으로 합니다. 각 채널은 로그 정보를 기록하는 특정 방식을 나타냅니다. 예를 들어, `single` 채널은 로그 파일을 하나의 로그 파일에 기록하고, `slack` 채널은 로그 메시지를 Slack으로 전송합니다. 로그 메시지는 심각도에 따라 여러 채널에 기록될 수 있습니다.

내부적으로 Laravel은 다양하고 강력한 로그 핸들러를 지원하는 [Monolog](https://github.com/Seldaek/monolog) 라이브러리를 활용합니다. Laravel은 이러한 핸들러를 쉽게 설정할 수 있게 해주며, 이를 조합하여 애플리케이션의 로그 처리를 커스터마이징할 수 있습니다.

<a name="configuration"></a>
## 설정

애플리케이션의 로깅 동작에 대한 모든 설정 옵션은 `config/logging.php` 설정 파일에 있습니다. 이 파일에서 애플리케이션의 로그 채널을 설정할 수 있으므로, 사용 가능한 각 채널과 옵션을 검토해 보세요. 아래에서 몇 가지 일반적인 옵션을 살펴보겠습니다.

기본적으로 Laravel은 로그 메시지를 기록할 때 `stack` 채널을 사용합니다. `stack` 채널은 여러 로그 채널을 하나의 채널로 집계하는 데 사용됩니다. 스택 구축에 대한 자세한 내용은 [아래 문서](#building-log-stacks)를 확인하세요.

<a name="available-channel-drivers"></a>
### 사용 가능한 채널 드라이버

각 로그 채널은 "드라이버(Driver)"에 의해 구동됩니다. 드라이버는 로그 메시지가 실제로 기록되는 방법과 위치를 결정합니다. 다음 로그 채널 드라이버는 모든 Laravel 애플리케이션에서 사용할 수 있습니다. 이러한 드라이버 대부분에 대한 항목이 이미 애플리케이션의 `config/logging.php` 설정 파일에 있으므로, 이 파일을 검토하여 내용을 숙지하세요.

<div class="overflow-auto">

| 이름         | 설명                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `custom`     | 지정된 팩토리를 호출하여 채널을 생성하는 드라이버.                   |
| `daily`      | 매일 로테이션하는 `RotatingFileHandler` 기반 Monolog 드라이버.       |
| `errorlog`   | `ErrorLogHandler` 기반 Monolog 드라이버.                             |
| `monolog`    | 지원되는 모든 Monolog 핸들러를 사용할 수 있는 Monolog 팩토리 드라이버. |
| `papertrail` | `SyslogUdpHandler` 기반 Monolog 드라이버.                            |
| `single`     | 단일 파일 또는 경로 기반 로거 채널 (`StreamHandler`).                |
| `slack`      | `SlackWebhookHandler` 기반 Monolog 드라이버.                         |
| `stack`      | "다중 채널" 채널 생성을 용이하게 하는 래퍼.                          |
| `syslog`     | `SyslogHandler` 기반 Monolog 드라이버.                               |

</div>

> [!NOTE]
> `monolog` 및 `custom` 드라이버에 대해 자세히 알아보려면 [고급 채널 커스터마이징](#monolog-channel-customization) 문서를 확인하세요.

<a name="configuring-the-channel-name"></a>
#### 채널 이름 설정

기본적으로 Monolog는 `production` 또는 `local`과 같이 현재 환경과 일치하는 "채널 이름"으로 인스턴스화됩니다. 이 값을 변경하려면 채널 설정에 `name` 옵션을 추가할 수 있습니다.

```php
'stack' => [
    'driver' => 'stack',
    'name' => 'channel-name',
    'channels' => ['single', 'slack'],
],
```

<a name="channel-prerequisites"></a>
### 채널 사전 요구사항

<a name="configuring-the-single-and-daily-channels"></a>
#### Single 및 Daily 채널 설정

`single` 및 `daily` 채널에는 세 가지 선택적 설정 옵션이 있습니다: `bubble`, `permission`, `locking`.

<div class="overflow-auto">

| 이름         | 설명                                                                      | 기본값  |
| ------------ | ------------------------------------------------------------------------- | ------- |
| `bubble`     | 메시지가 처리된 후 다른 채널로 전파되어야 하는지 여부를 나타냅니다.       | `true`  |
| `locking`    | 로그 파일에 쓰기 전에 파일 잠금을 시도합니다.                             | `false` |
| `permission` | 로그 파일의 권한.                                                         | `0644`  |

</div>

또한, `daily` 채널의 보존 정책은 `LOG_DAILY_DAYS` 환경 변수를 통하거나 `days` 설정 옵션을 설정하여 구성할 수 있습니다.

<div class="overflow-auto">

| 이름   | 설명                                           | 기본값 |
| ------ | ---------------------------------------------- | ------ |
| `days` | 일별 로그 파일이 보존되어야 하는 일수.         | `14`   |

</div>

<a name="configuring-the-papertrail-channel"></a>
#### Papertrail 채널 설정

`papertrail` 채널에는 `host` 및 `port` 설정 옵션이 필요합니다. 이 값들은 `PAPERTRAIL_URL` 및 `PAPERTRAIL_PORT` 환경 변수를 통해 정의할 수 있습니다. [Papertrail](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app)에서 이 값들을 얻을 수 있습니다.

<a name="configuring-the-slack-channel"></a>
#### Slack 채널 설정

`slack` 채널에는 `url` 설정 옵션이 필요합니다. 이 URL은 Slack 팀에 설정한 [수신 웹훅(Incoming Webhook)](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)의 URL과 일치해야 합니다.

기본적으로 Slack은 `critical` 레벨 이상의 로그만 수신합니다. 그러나 `LOG_LEVEL` 환경 변수를 사용하거나 Slack 로그 채널의 설정 배열 내에서 `level` 설정 옵션을 수정하여 이를 조정할 수 있습니다.

<a name="logging-deprecation-warnings"></a>
### 사용 중단 경고 로깅

PHP, Laravel 및 기타 라이브러리는 일부 기능이 더 이상 사용되지 않으며 향후 버전에서 제거될 것임을 사용자에게 알리는 경우가 많습니다. 이러한 사용 중단 경고를 로깅하려면, `LOG_DEPRECATIONS_CHANNEL` 환경 변수를 사용하거나 애플리케이션의 `config/logging.php` 설정 파일 내에서 원하는 `deprecations` 로그 채널을 지정할 수 있습니다.

```php
'deprecations' => [
    'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
    'trace' => env('LOG_DEPRECATIONS_TRACE', false),
],

'channels' => [
    // ...
]
```

또는 `deprecations`라는 이름의 로그 채널을 정의할 수 있습니다. 이 이름의 로그 채널이 존재하면 항상 사용 중단 로그를 기록하는 데 사용됩니다.

```php
'channels' => [
    'deprecations' => [
        'driver' => 'single',
        'path' => storage_path('logs/php-deprecation-warnings.log'),
    ],
],
```

<a name="building-log-stacks"></a>
## 로그 스택 구축

앞서 언급했듯이, `stack` 드라이버를 사용하면 여러 채널을 하나의 로그 채널로 결합하여 편리하게 사용할 수 있습니다. 로그 스택 사용 방법을 설명하기 위해, 프로덕션 애플리케이션에서 볼 수 있는 예시 설정을 살펴보겠습니다.

    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['syslog', 'slack'],
        ],

        'syslog' => [
            'driver' => 'syslog',
            'level' => 'debug',
        ],

        'slack' => [
            'driver' => 'slack',
            'url' => env('LOG_SLACK_WEBHOOK_URL'),
            'username' => 'Laravel Log',
            'emoji' => ':boom:',
            'level' => 'critical',
        ],

이 설정을 분석해 보겠습니다. 먼저, `stack` 채널이 `channels` 옵션을 통해 `syslog`와 `slack` 두 개의 다른 채널을 집계하는 것을 확인할 수 있습니다. 따라서 메시지를 로깅할 때 두 채널 모두 메시지를 기록할 기회를 갖게 됩니다. 그러나 아래에서 살펴보겠지만, 이러한 채널이 실제로 메시지를 기록할지 여부는 메시지의 심각도/"레벨"에 의해 결정될 수 있습니다.

<a name="log-levels"></a>
#### 로그 레벨

위 예시에서 `syslog` 및 `slack` 채널 설정에 있는 `level` 설정 옵션에 주목하세요. 이 옵션은 채널이 메시지를 기록하기 위해 필요한 최소 "레벨"을 결정합니다. Laravel의 로깅 서비스를 구동하는 Monolog는 [RFC 5424 명세](https://tools.ietf.org/html/rfc5424)에 정의된 모든 로그 레벨을 제공합니다. 심각도가 높은 순서대로 이러한 로그 레벨은 다음과 같습니다: **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**.

`debug` 메서드를 사용하여 메시지를 기록한다고 가정해 보겠습니다.

```php
Log::debug('An informational message.');
```

설정에 따르면, `syslog` 채널은 메시지를 시스템 로그에 기록합니다. 그러나 오류 메시지가 `critical` 이상이 아니므로 Slack으로 전송되지 않습니다. 그러나 `emergency` 메시지를 기록하면, 두 채널 모두의 최소 레벨 임계값을 초과하므로 시스템 로그와 Slack 모두에 전송됩니다.

```php
Log::emergency('The system is down!');
```

<a name="writing-log-messages"></a>
## 로그 메시지 작성

`Log` [파사드(Facade)](/docs/{{version}}/facades)를 사용하여 로그에 정보를 기록할 수 있습니다. 앞서 언급했듯이, 로거는 [RFC 5424 명세](https://tools.ietf.org/html/rfc5424)에 정의된 8가지 로깅 레벨을 제공합니다: **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info**, **debug**.

```php
use Illuminate\Support\Facades\Log;

Log::emergency($message);
Log::alert($message);
Log::critical($message);
Log::error($message);
Log::warning($message);
Log::notice($message);
Log::info($message);
Log::debug($message);
```

이러한 메서드 중 하나를 호출하여 해당 레벨의 메시지를 기록할 수 있습니다. 기본적으로 메시지는 `logging` 설정 파일에서 설정된 기본 로그 채널에 기록됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 주어진 사용자의 프로필을 표시합니다.
     */
    public function show(string $id): View
    {
        Log::info('Showing the user profile for user: {id}', ['id' => $id]);

        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

<a name="contextual-information"></a>
### 컨텍스트 정보

컨텍스트 데이터 배열을 로그 메서드에 전달할 수 있습니다. 이 컨텍스트 데이터는 로그 메시지와 함께 포맷되어 표시됩니다.

```php
use Illuminate\Support\Facades\Log;

Log::info('User {id} failed to login.', ['id' => $user->id]);
```

경우에 따라 특정 채널의 모든 후속 로그 항목에 포함되어야 하는 컨텍스트 정보를 지정하고 싶을 수 있습니다. 예를 들어, 애플리케이션에 들어오는 각 요청과 연관된 요청 ID를 기록하고 싶을 수 있습니다. 이를 위해 `Log` 파사드의 `withContext` 메서드를 호출할 수 있습니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    /**
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();

        Log::withContext([
            'request-id' => $requestId
        ]);

        $response = $next($request);

        $response->headers->set('Request-Id', $requestId);

        return $response;
    }
}
```

_모든_ 로깅 채널에서 컨텍스트 정보를 공유하려면 `Log::shareContext()` 메서드를 호출할 수 있습니다. 이 메서드는 생성된 모든 채널과 이후에 생성되는 모든 채널에 컨텍스트 정보를 제공합니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    /**
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();

        Log::shareContext([
            'request-id' => $requestId
        ]);

        // ...
    }
}
```

> [!NOTE]
> 큐 작업을 처리하는 동안 로그 컨텍스트를 공유해야 하는 경우, [작업 미들웨어(Job Middleware)](/docs/{{version}}/queues#job-middleware)를 활용할 수 있습니다.

<a name="writing-to-specific-channels"></a>
### 특정 채널에 로그 작성

때때로 애플리케이션의 기본 채널이 아닌 다른 채널에 메시지를 기록하고 싶을 수 있습니다. `Log` 파사드의 `channel` 메서드를 사용하여 설정 파일에 정의된 모든 채널을 검색하고 로그를 기록할 수 있습니다.

```php
use Illuminate\Support\Facades\Log;

Log::channel('slack')->info('Something happened!');
```

여러 채널로 구성된 온디맨드(On-demand) 로깅 스택을 생성하려면 `stack` 메서드를 사용할 수 있습니다.

```php
Log::stack(['single', 'slack'])->info('Something happened!');
```

<a name="on-demand-channels"></a>
#### 온디맨드 채널

애플리케이션의 `logging` 설정 파일에 해당 설정이 없이도 런타임에 설정을 제공하여 온디맨드 채널을 생성할 수도 있습니다. 이를 위해 `Log` 파사드의 `build` 메서드에 설정 배열을 전달할 수 있습니다.

```php
use Illuminate\Support\Facades\Log;

Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
])->info('Something happened!');
```

온디맨드 로깅 스택에 온디맨드 채널을 포함시킬 수도 있습니다. `stack` 메서드에 전달되는 배열에 온디맨드 채널 인스턴스를 포함시켜 이를 달성할 수 있습니다.

```php
use Illuminate\Support\Facades\Log;

$channel = Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
]);

Log::stack(['slack', $channel])->info('Something happened!');
```

<a name="monolog-channel-customization"></a>
## Monolog 채널 커스터마이징

<a name="customizing-monolog-for-channels"></a>
### 채널별 Monolog 커스터마이징

때때로 기존 채널에 대해 Monolog가 설정되는 방식을 완전히 제어해야 할 수 있습니다. 예를 들어, Laravel의 내장 `single` 채널에 대해 커스텀 Monolog `FormatterInterface` 구현을 설정하고 싶을 수 있습니다.

시작하려면 채널 설정에 `tap` 배열을 정의하세요. `tap` 배열에는 Monolog 인스턴스가 생성된 후 이를 커스터마이징(또는 "탭")할 기회를 가져야 하는 클래스 목록이 포함되어야 합니다. 이러한 클래스를 배치할 정해진 위치는 없으므로, 애플리케이션 내에 이러한 클래스를 포함할 디렉토리를 자유롭게 생성할 수 있습니다.

```php
'single' => [
    'driver' => 'single',
    'tap' => [App\Logging\CustomizeFormatter::class],
    'path' => storage_path('logs/laravel.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'replace_placeholders' => true,
],
```

채널에 `tap` 옵션을 설정했다면, Monolog 인스턴스를 커스터마이징할 클래스를 정의할 준비가 된 것입니다. 이 클래스는 `Illuminate\Log\Logger` 인스턴스를 받는 단일 메서드 `__invoke`만 필요합니다. `Illuminate\Log\Logger` 인스턴스는 기본 Monolog 인스턴스에 대한 모든 메서드 호출을 프록시합니다.

```php
<?php

namespace App\Logging;

use Illuminate\Log\Logger;
use Monolog\Formatter\LineFormatter;

class CustomizeFormatter
{
    /**
     * 주어진 로거 인스턴스를 커스터마이징합니다.
     */
    public function __invoke(Logger $logger): void
    {
        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter(new LineFormatter(
                '[%datetime%] %channel%.%level_name%: %message% %context% %extra%'
            ));
        }
    }
}
```

> [!NOTE]
> 모든 "tap" 클래스는 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에 의해 해결되므로, 필요한 생성자 의존성은 자동으로 주입됩니다.

<a name="creating-monolog-handler-channels"></a>
### Monolog 핸들러 채널 생성

Monolog에는 다양한 [사용 가능한 핸들러](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler)가 있으며 Laravel은 각각에 대해 내장 채널을 포함하지 않습니다. 경우에 따라 해당 Laravel 로그 드라이버가 없는 특정 Monolog 핸들러의 인스턴스인 커스텀 채널을 생성하고 싶을 수 있습니다. 이러한 채널은 `monolog` 드라이버를 사용하여 쉽게 생성할 수 있습니다.

`monolog` 드라이버를 사용할 때, `handler` 설정 옵션은 인스턴스화될 핸들러를 지정하는 데 사용됩니다. 선택적으로, 핸들러에 필요한 생성자 매개변수는 `handler_with` 설정 옵션을 사용하여 지정할 수 있습니다.

```php
'logentries' => [
    'driver'  => 'monolog',
    'handler' => Monolog\Handler\SyslogUdpHandler::class,
    'handler_with' => [
        'host' => 'my.logentries.internal.datahubhost.company.com',
        'port' => '10000',
    ],
],
```

<a name="monolog-formatters"></a>
#### Monolog 포매터

`monolog` 드라이버를 사용할 때, Monolog `LineFormatter`가 기본 포매터로 사용됩니다. 그러나 `formatter` 및 `formatter_with` 설정 옵션을 사용하여 핸들러에 전달되는 포매터 유형을 커스터마이징할 수 있습니다.

```php
'browser' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\BrowserConsoleHandler::class,
    'formatter' => Monolog\Formatter\HtmlFormatter::class,
    'formatter_with' => [
        'dateFormat' => 'Y-m-d',
    ],
],
```

자체 포매터를 제공할 수 있는 Monolog 핸들러를 사용하는 경우, `formatter` 설정 옵션의 값을 `default`로 설정할 수 있습니다.

```php
'newrelic' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\NewRelicHandler::class,
    'formatter' => 'default',
],
```

 <a name="monolog-processors"></a>
 #### Monolog 프로세서

 Monolog는 메시지를 로깅하기 전에 처리할 수도 있습니다. 자체 프로세서를 생성하거나 [Monolog에서 제공하는 기존 프로세서](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Processor)를 사용할 수 있습니다.

`monolog` 드라이버의 프로세서를 커스터마이징하려면 채널 설정에 `processors` 설정 값을 추가하세요.

```php
'memory' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\StreamHandler::class,
    'handler_with' => [
        'stream' => 'php://stderr',
    ],
    'processors' => [
        // 간단한 구문...
        Monolog\Processor\MemoryUsageProcessor::class,

        // 옵션과 함께...
        [
            'processor' => Monolog\Processor\PsrLogMessageProcessor::class,
            'with' => ['removeUsedContextFields' => true],
        ],
    ],
],
```

<a name="creating-custom-channels-via-factories"></a>
### 팩토리를 통한 커스텀 채널 생성

Monolog의 인스턴스화 및 설정을 완전히 제어할 수 있는 완전히 커스텀한 채널을 정의하려면, `config/logging.php` 설정 파일에 `custom` 드라이버 유형을 지정할 수 있습니다. 설정에는 Monolog 인스턴스를 생성하기 위해 호출될 팩토리 클래스 이름이 포함된 `via` 옵션이 있어야 합니다.

```php
'channels' => [
    'example-custom-channel' => [
        'driver' => 'custom',
        'via' => App\Logging\CreateCustomLogger::class,
    ],
],
```

`custom` 드라이버 채널을 설정했다면, Monolog 인스턴스를 생성할 클래스를 정의할 준비가 된 것입니다. 이 클래스는 Monolog 로거 인스턴스를 반환해야 하는 단일 `__invoke` 메서드만 필요합니다. 이 메서드는 채널 설정 배열을 유일한 인수로 받습니다.

```php
<?php

namespace App\Logging;

use Monolog\Logger;

class CreateCustomLogger
{
    /**
     * 커스텀 Monolog 인스턴스를 생성합니다.
     */
    public function __invoke(array $config): Logger
    {
        return new Logger(/* ... */);
    }
}
```

<a name="tailing-log-messages-using-pail"></a>
## Pail을 사용한 로그 메시지 실시간 확인

종종 애플리케이션의 로그를 실시간으로 추적해야 할 수 있습니다. 예를 들어, 문제를 디버깅하거나 애플리케이션 로그에서 특정 유형의 오류를 모니터링할 때입니다.

Laravel Pail은 커맨드 라인에서 직접 Laravel 애플리케이션의 로그 파일에 쉽게 접근할 수 있게 해주는 패키지입니다. 표준 `tail` 명령과 달리, Pail은 Sentry나 Flare를 포함한 모든 로그 드라이버와 함께 작동하도록 설계되었습니다. 또한 Pail은 찾고 있는 것을 빠르게 찾을 수 있도록 유용한 필터 세트를 제공합니다.

<img src="https://laravel.com/img/docs/pail-example.png">

<a name="pail-installation"></a>
### 설치

> [!WARNING]
> Laravel Pail은 [PHP 8.2+](https://php.net/releases/)와 [PCNTL](https://www.php.net/manual/en/book.pcntl.php) 확장을 필요로 합니다.

시작하려면 Composer 패키지 관리자를 사용하여 프로젝트에 Pail을 설치하세요.

```bash
composer require laravel/pail
```

<a name="pail-usage"></a>
### 사용법

로그 추적을 시작하려면 `pail` 명령을 실행하세요.

```bash
php artisan pail
```

출력의 상세도를 높이고 잘림(...)을 방지하려면 `-v` 옵션을 사용하세요.

```bash
php artisan pail -v
```

최대 상세도와 예외 스택 트레이스를 표시하려면 `-vv` 옵션을 사용하세요.

```bash
php artisan pail -vv
```

로그 추적을 중지하려면 언제든지 `Ctrl+C`를 누르세요.

<a name="pail-filtering-logs"></a>
### 로그 필터링

<a name="pail-filtering-logs-filter-option"></a>
#### `--filter`

`--filter` 옵션을 사용하여 유형, 파일, 메시지 및 스택 트레이스 내용으로 로그를 필터링할 수 있습니다.

```bash
php artisan pail --filter="QueryException"
```

<a name="pail-filtering-logs-message-option"></a>
#### `--message`

메시지로만 로그를 필터링하려면 `--message` 옵션을 사용할 수 있습니다.

```bash
php artisan pail --message="User created"
```

<a name="pail-filtering-logs-level-option"></a>
#### `--level`

`--level` 옵션을 사용하여 [로그 레벨](#log-levels)로 로그를 필터링할 수 있습니다.

```bash
php artisan pail --level=error
```

<a name="pail-filtering-logs-user-option"></a>
#### `--user`

특정 사용자가 인증된 동안 기록된 로그만 표시하려면 `--user` 옵션에 사용자 ID를 제공할 수 있습니다.

```bash
php artisan pail --user=1
```

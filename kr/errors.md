# 에러 처리(Error Handling)

- [소개](#introduction)
- [설정](#configuration)
- [예외 처리하기](#handling-exceptions)
    - [예외 보고하기](#reporting-exceptions)
    - [예외 로그 레벨](#exception-log-levels)
    - [타입별 예외 무시하기](#ignoring-exceptions-by-type)
    - [예외 렌더링하기](#rendering-exceptions)
    - [보고 가능하고 렌더링 가능한 예외](#renderable-exceptions)
- [보고되는 예외 제한하기](#throttling-reported-exceptions)
- [HTTP 예외](#http-exceptions)
    - [커스텀 HTTP 에러 페이지](#custom-http-error-pages)

<a name="introduction"></a>
## 소개

새로운 Laravel 프로젝트를 시작할 때, 에러 및 예외 처리는 이미 설정되어 있습니다. 그러나 언제든지 애플리케이션의 `bootstrap/app.php`에서 `withExceptions` 메서드를 사용하여 예외가 보고되고 렌더링되는 방식을 관리할 수 있습니다.

`withExceptions` 클로저에 제공되는 `$exceptions` 객체는 `Illuminate\Foundation\Configuration\Exceptions`의 인스턴스이며, 애플리케이션의 예외 처리를 관리하는 역할을 합니다. 이 문서 전반에 걸쳐 이 객체에 대해 자세히 살펴보겠습니다.

<a name="configuration"></a>
## 설정

`config/app.php` 설정 파일의 `debug` 옵션은 에러에 대한 정보가 실제로 사용자에게 얼마나 표시되는지를 결정합니다. 기본적으로 이 옵션은 `.env` 파일에 저장된 `APP_DEBUG` 환경 변수의 값을 따르도록 설정되어 있습니다.

로컬 개발 중에는 `APP_DEBUG` 환경 변수를 `true`로 설정해야 합니다. **프로덕션 환경에서는 이 값이 항상 `false`여야 합니다. 프로덕션에서 이 값이 `true`로 설정되면, 민감한 설정 값이 애플리케이션의 최종 사용자에게 노출될 위험이 있습니다.**

<a name="handling-exceptions"></a>
## 예외 처리하기

<a name="reporting-exceptions"></a>
### 예외 보고하기

Laravel에서 예외 보고는 예외를 로깅하거나 [Sentry](https://github.com/getsentry/sentry-laravel) 또는 [Flare](https://flareapp.io)와 같은 외부 서비스로 전송하는 데 사용됩니다. 기본적으로 예외는 [로깅](/docs/{{version}}/logging) 설정에 따라 로깅됩니다. 그러나 원하는 방식으로 예외를 로깅할 수 있습니다.

다양한 타입의 예외를 다른 방식으로 보고해야 하는 경우, 애플리케이션의 `bootstrap/app.php`에서 `report` 예외 메서드를 사용하여 특정 타입의 예외를 보고해야 할 때 실행되어야 하는 클로저를 등록할 수 있습니다. Laravel은 클로저의 타입 힌트를 검사하여 클로저가 보고하는 예외의 타입을 결정합니다.

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    });
})
```

`report` 메서드를 사용하여 커스텀 예외 보고 콜백을 등록하더라도, Laravel은 여전히 애플리케이션의 기본 로깅 설정을 사용하여 예외를 로깅합니다. 기본 로깅 스택으로의 예외 전파를 중지하려면, 보고 콜백을 정의할 때 `stop` 메서드를 사용하거나 콜백에서 `false`를 반환할 수 있습니다.

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    })->stop();

    $exceptions->report(function (InvalidOrderException $e) {
        return false;
    });
})
```

> [!NOTE]
> 특정 예외에 대한 예외 보고를 커스터마이징하려면, [보고 가능한 예외](/docs/{{version}}/errors#renderable-exceptions)를 활용할 수도 있습니다.

<a name="global-log-context"></a>
#### 글로벌 로그 컨텍스트

가능한 경우, Laravel은 자동으로 현재 사용자의 ID를 모든 예외의 로그 메시지에 컨텍스트 데이터로 추가합니다. 애플리케이션의 `bootstrap/app.php` 파일에서 `context` 예외 메서드를 사용하여 고유한 글로벌 컨텍스트 데이터를 정의할 수 있습니다. 이 정보는 애플리케이션에서 작성하는 모든 예외의 로그 메시지에 포함됩니다.

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->context(fn () => [
        'foo' => 'bar',
    ]);
})
```

<a name="exception-log-context"></a>
#### 예외 로그 컨텍스트

모든 로그 메시지에 컨텍스트를 추가하는 것이 유용할 수 있지만, 때로는 특정 예외에 로그에 포함하고 싶은 고유한 컨텍스트가 있을 수 있습니다. 애플리케이션의 예외 중 하나에 `context` 메서드를 정의함으로써, 예외의 로그 항목에 추가되어야 하는 해당 예외와 관련된 데이터를 지정할 수 있습니다.

```php
<?php

namespace App\Exceptions;

use Exception;

class InvalidOrderException extends Exception
{
    // ...

    /**
     * 예외의 컨텍스트 정보를 가져옵니다.
     *
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return ['order_id' => $this->orderId];
    }
}
```

<a name="the-report-helper"></a>
#### `report` 헬퍼

때로는 예외를 보고하면서 현재 요청 처리를 계속해야 할 수 있습니다. `report` 헬퍼 함수를 사용하면 사용자에게 에러 페이지를 렌더링하지 않고 빠르게 예외를 보고할 수 있습니다.

```php
public function isValid(string $value): bool
{
    try {
        // 값 검증...
    } catch (Throwable $e) {
        report($e);

        return false;
    }
}
```

<a name="deduplicating-reported-exceptions"></a>
#### 중복 보고된 예외 제거하기

애플리케이션 전체에서 `report` 함수를 사용하는 경우, 동일한 예외를 여러 번 보고하여 로그에 중복 항목이 생성될 수 있습니다.

예외의 단일 인스턴스가 한 번만 보고되도록 하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `dontReportDuplicates` 예외 메서드를 호출할 수 있습니다.

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReportDuplicates();
})
```

이제 동일한 예외 인스턴스로 `report` 헬퍼가 호출되면, 첫 번째 호출만 보고됩니다.

```php
$original = new RuntimeException('Whoops!');

report($original); // 보고됨

try {
    throw $original;
} catch (Throwable $caught) {
    report($caught); // 무시됨
}

report($original); // 무시됨
report($caught); // 무시됨
```

<a name="exception-log-levels"></a>
### 예외 로그 레벨

메시지가 애플리케이션의 [로그](/docs/{{version}}/logging)에 기록될 때, 메시지는 지정된 [로그 레벨](/docs/{{version}}/logging#log-levels)로 기록되며, 이는 로깅되는 메시지의 심각도 또는 중요성을 나타냅니다.

위에서 언급했듯이, `report` 메서드를 사용하여 커스텀 예외 보고 콜백을 등록하더라도, Laravel은 여전히 애플리케이션의 기본 로깅 설정을 사용하여 예외를 로깅합니다. 그러나 로그 레벨이 메시지가 로깅되는 채널에 영향을 줄 수 있으므로, 특정 예외가 로깅되는 로그 레벨을 설정하고 싶을 수 있습니다.

이를 수행하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `level` 예외 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인수로 예외 타입을, 두 번째 인수로 로그 레벨을 받습니다.

```php
use PDOException;
use Psr\Log\LogLevel;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->level(PDOException::class, LogLevel::CRITICAL);
})
```

<a name="ignoring-exceptions-by-type"></a>
### 타입별 예외 무시하기

애플리케이션을 구축할 때, 절대 보고하고 싶지 않은 일부 타입의 예외가 있을 것입니다. 이러한 예외를 무시하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `dontReport` 예외 메서드를 사용할 수 있습니다. 이 메서드에 제공된 모든 클래스는 절대 보고되지 않습니다. 그러나 여전히 커스텀 렌더링 로직을 가질 수 있습니다.

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReport([
        InvalidOrderException::class,
    ]);
})
```

또는, 예외 클래스에 `Illuminate\Contracts\Debug\ShouldntReport` 인터페이스를 "표시"할 수 있습니다. 예외가 이 인터페이스로 표시되면, Laravel의 예외 핸들러에 의해 절대 보고되지 않습니다.

```php
<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Contracts\Debug\ShouldntReport;

class PodcastProcessingException extends Exception implements ShouldntReport
{
    //
}
```

내부적으로 Laravel은 이미 404 HTTP 에러 또는 유효하지 않은 CSRF 토큰으로 인해 생성된 419 HTTP 응답과 같은 일부 타입의 에러를 무시합니다. Laravel에게 특정 타입의 예외 무시를 중단하도록 지시하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `stopIgnoring` 예외 메서드를 사용할 수 있습니다.

```php
use Symfony\Component\HttpKernel\Exception\HttpException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->stopIgnoring(HttpException::class);
})
```

<a name="rendering-exceptions"></a>
### 예외 렌더링하기

기본적으로 Laravel 예외 핸들러는 예외를 HTTP 응답으로 변환합니다. 그러나 특정 타입의 예외에 대해 커스텀 렌더링 클로저를 등록할 수 있습니다. 애플리케이션의 `bootstrap/app.php` 파일에서 `render` 예외 메서드를 사용하여 이를 수행할 수 있습니다.

`render` 메서드에 전달되는 클로저는 `response` 헬퍼를 통해 생성할 수 있는 `Illuminate\Http\Response`의 인스턴스를 반환해야 합니다. Laravel은 클로저의 타입 힌트를 검사하여 클로저가 렌더링하는 예외의 타입을 결정합니다.

```php
use App\Exceptions\InvalidOrderException;
use Illuminate\Http\Request;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (InvalidOrderException $e, Request $request) {
        return response()->view('errors.invalid-order', status: 500);
    });
})
```

`render` 메서드를 사용하여 `NotFoundHttpException`과 같은 내장 Laravel 또는 Symfony 예외의 렌더링 동작을 재정의할 수도 있습니다. `render` 메서드에 주어진 클로저가 값을 반환하지 않으면, Laravel의 기본 예외 렌더링이 사용됩니다.

```php
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (NotFoundHttpException $e, Request $request) {
        if ($request->is('api/*')) {
            return response()->json([
                'message' => 'Record not found.'
            ], 404);
        }
    });
})
```

<a name="rendering-exceptions-as-json"></a>
#### 예외를 JSON으로 렌더링하기

예외를 렌더링할 때, Laravel은 요청의 `Accept` 헤더를 기반으로 예외가 HTML 또는 JSON 응답으로 렌더링되어야 하는지를 자동으로 결정합니다. Laravel이 HTML 또는 JSON 예외 응답을 렌더링할지 결정하는 방법을 커스터마이징하려면, `shouldRenderJsonWhen` 메서드를 활용할 수 있습니다.

```php
use Illuminate\Http\Request;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
        if ($request->is('admin/*')) {
            return true;
        }

        return $request->expectsJson();
    });
})
```

<a name="customizing-the-exception-response"></a>
#### 예외 응답 커스터마이징하기

드물지만 Laravel의 예외 핸들러에 의해 렌더링되는 전체 HTTP 응답을 커스터마이징해야 할 수 있습니다. 이를 수행하려면, `respond` 메서드를 사용하여 응답 커스터마이징 클로저를 등록할 수 있습니다.

```php
use Symfony\Component\HttpFoundation\Response;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->respond(function (Response $response) {
        if ($response->getStatusCode() === 419) {
            return back()->with([
                'message' => 'The page expired, please try again.',
            ]);
        }

        return $response;
    });
})
```

<a name="renderable-exceptions"></a>
### 보고 가능하고 렌더링 가능한 예외

애플리케이션의 `bootstrap/app.php` 파일에서 커스텀 보고 및 렌더링 동작을 정의하는 대신, 애플리케이션의 예외에 직접 `report` 및 `render` 메서드를 정의할 수 있습니다. 이러한 메서드가 존재하면, 프레임워크에 의해 자동으로 호출됩니다.

```php
<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvalidOrderException extends Exception
{
    /**
     * 예외를 보고합니다.
     */
    public function report(): void
    {
        // ...
    }

    /**
     * 예외를 HTTP 응답으로 렌더링합니다.
     */
    public function render(Request $request): Response
    {
        return response(/* ... */);
    }
}
```

예외가 내장 Laravel 또는 Symfony 예외와 같이 이미 렌더링 가능한 예외를 확장하는 경우, 예외의 `render` 메서드에서 `false`를 반환하여 예외의 기본 HTTP 응답을 렌더링할 수 있습니다.

```php
/**
 * 예외를 HTTP 응답으로 렌더링합니다.
 */
public function render(Request $request): Response|bool
{
    if (/** 예외가 커스텀 렌더링이 필요한지 결정 */) {

        return response(/* ... */);
    }

    return false;
}
```

예외에 특정 조건이 충족될 때만 필요한 커스텀 보고 로직이 포함된 경우, 기본 예외 처리 설정을 사용하여 예외를 때때로 보고하도록 Laravel에 지시해야 할 수 있습니다. 이를 수행하려면, 예외의 `report` 메서드에서 `false`를 반환할 수 있습니다.

```php
/**
 * 예외를 보고합니다.
 */
public function report(): bool
{
    if (/** 예외가 커스텀 보고가 필요한지 결정 */) {

        // ...

        return true;
    }

    return false;
}
```

> [!NOTE]
> `report` 메서드의 필수 의존성을 타입 힌트할 수 있으며, Laravel의 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에 의해 메서드에 자동으로 주입됩니다.

<a name="throttling-reported-exceptions"></a>
### 보고되는 예외 제한하기

애플리케이션이 매우 많은 수의 예외를 보고하는 경우, 실제로 로깅되거나 애플리케이션의 외부 에러 추적 서비스로 전송되는 예외 수를 제한하고 싶을 수 있습니다.

예외의 무작위 샘플링 비율을 사용하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `throttle` 예외 메서드를 사용할 수 있습니다. `throttle` 메서드는 `Lottery` 인스턴스를 반환해야 하는 클로저를 받습니다.

```php
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        return Lottery::odds(1, 1000);
    });
})
```

예외 타입에 따라 조건부로 샘플링하는 것도 가능합니다. 특정 예외 클래스의 인스턴스만 샘플링하려면, 해당 클래스에 대해서만 `Lottery` 인스턴스를 반환할 수 있습니다.

```php
use App\Exceptions\ApiMonitoringException;
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof ApiMonitoringException) {
            return Lottery::odds(1, 1000);
        }
    });
})
```

`Lottery` 대신 `Limit` 인스턴스를 반환하여 로깅되거나 외부 에러 추적 서비스로 전송되는 예외의 속도를 제한할 수도 있습니다. 이는 애플리케이션에서 사용하는 서드파티 서비스가 다운되었을 때와 같이 갑작스러운 예외의 폭주로부터 로그를 보호하려는 경우에 유용합니다.

```php
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof BroadcastException) {
            return Limit::perMinute(300);
        }
    });
})
```

기본적으로 제한은 예외의 클래스를 속도 제한 키로 사용합니다. `Limit`의 `by` 메서드를 사용하여 고유한 키를 지정하여 이를 커스터마이징할 수 있습니다.

```php
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof BroadcastException) {
            return Limit::perMinute(300)->by($e->getMessage());
        }
    });
})
```

물론, 다양한 예외에 대해 `Lottery`와 `Limit` 인스턴스를 혼합하여 반환할 수 있습니다.

```php
use App\Exceptions\ApiMonitoringException;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->throttle(function (Throwable $e) {
        return match (true) {
            $e instanceof BroadcastException => Limit::perMinute(300),
            $e instanceof ApiMonitoringException => Lottery::odds(1, 1000),
            default => Limit::none(),
        };
    });
})
```

<a name="http-exceptions"></a>
## HTTP 예외

일부 예외는 서버에서 HTTP 에러 코드를 설명합니다. 예를 들어, "페이지를 찾을 수 없음" 에러(404), "인증되지 않음 에러"(401), 또는 개발자가 생성한 500 에러일 수 있습니다. 애플리케이션의 어디에서나 이러한 응답을 생성하려면, `abort` 헬퍼를 사용할 수 있습니다.

```php
abort(404);
```

<a name="custom-http-error-pages"></a>
### 커스텀 HTTP 에러 페이지

Laravel은 다양한 HTTP 상태 코드에 대한 커스텀 에러 페이지를 쉽게 표시할 수 있게 해줍니다. 예를 들어, 404 HTTP 상태 코드에 대한 에러 페이지를 커스터마이징하려면, `resources/views/errors/404.blade.php` 뷰 템플릿을 생성하세요. 이 뷰는 애플리케이션에서 생성된 모든 404 에러에 대해 렌더링됩니다. 이 디렉토리 내의 뷰들은 해당하는 HTTP 상태 코드와 일치하는 이름을 가져야 합니다. `abort` 함수에 의해 발생된 `Symfony\Component\HttpKernel\Exception\HttpException` 인스턴스는 `$exception` 변수로 뷰에 전달됩니다.

```blade
<h2>{{ $exception->getMessage() }}</h2>
```

`vendor:publish` Artisan 명령을 사용하여 Laravel의 기본 에러 페이지 템플릿을 퍼블리싱할 수 있습니다. 템플릿이 퍼블리싱되면, 원하는 대로 커스터마이징할 수 있습니다.

```shell
php artisan vendor:publish --tag=laravel-errors
```

<a name="fallback-http-error-pages"></a>
#### 대체 HTTP 에러 페이지

주어진 일련의 HTTP 상태 코드에 대한 "대체" 에러 페이지를 정의할 수도 있습니다. 발생한 특정 HTTP 상태 코드에 해당하는 페이지가 없으면 이 페이지가 렌더링됩니다. 이를 수행하려면, 애플리케이션의 `resources/views/errors` 디렉토리에 `4xx.blade.php` 템플릿과 `5xx.blade.php` 템플릿을 정의하세요.

대체 에러 페이지를 정의할 때, 대체 페이지는 `404`, `500`, `503` 에러 응답에 영향을 미치지 않습니다. Laravel이 이러한 상태 코드에 대해 내부적으로 전용 페이지를 가지고 있기 때문입니다. 이러한 상태 코드에 대해 렌더링되는 페이지를 커스터마이징하려면, 각각에 대해 개별적으로 커스텀 에러 페이지를 정의해야 합니다.

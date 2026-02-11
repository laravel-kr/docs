# HTTP 클라이언트(HTTP Client)

- [소개](#introduction)
- [요청 보내기](#making-requests)
    - [요청 데이터](#request-data)
    - [헤더](#headers)
    - [인증](#authentication)
    - [타임아웃](#timeout)
    - [재시도](#retries)
    - [에러 처리](#error-handling)
    - [Guzzle 미들웨어](#guzzle-middleware)
    - [Guzzle 옵션](#guzzle-options)
- [동시 요청](#concurrent-requests)
    - [요청 풀링](#request-pooling)
    - [요청 배치](#request-batching)
- [매크로](#macros)
- [테스팅](#testing)
    - [응답 페이크](#faking-responses)
    - [요청 검사](#inspecting-requests)
    - [누락된 요청 방지](#preventing-stray-requests)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

Laravel은 [Guzzle HTTP 클라이언트](http://docs.guzzlephp.org/en/stable/)를 기반으로 표현력 있고 간결한 API를 제공하여, 다른 웹 애플리케이션과 통신하기 위한 HTTP 요청을 빠르게 보낼 수 있습니다. Laravel의 Guzzle 래퍼는 가장 일반적인 사용 사례에 초점을 맞추고 있으며 훌륭한 개발자 경험을 제공합니다.

<a name="making-requests"></a>
## 요청 보내기

요청을 보내려면 `Http` 파사드(Facade)가 제공하는 `head`, `get`, `post`, `put`, `patch`, `delete` 메서드를 사용할 수 있습니다. 먼저 다른 URL에 기본 `GET` 요청을 보내는 방법을 살펴보겠습니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::get('http://example.com');
```

`get` 메서드는 `Illuminate\Http\Client\Response` 인스턴스를 반환하며, 이 인스턴스는 응답을 검사하는 데 사용할 수 있는 다양한 메서드를 제공합니다.

```php
$response->body() : string;
$response->json($key = null, $default = null) : mixed;
$response->object() : object;
$response->collect($key = null) : Illuminate\Support\Collection;
$response->resource() : resource;
$response->status() : int;
$response->successful() : bool;
$response->redirect(): bool;
$response->failed() : bool;
$response->clientError() : bool;
$response->header($header) : string;
$response->headers() : array;
```

`Illuminate\Http\Client\Response` 객체는 PHP `ArrayAccess` 인터페이스도 구현하고 있어서 응답에서 직접 JSON 응답 데이터에 접근할 수 있습니다.

```php
return Http::get('http://example.com/users/1')['name'];
```

위에 나열된 응답 메서드 외에도, 응답이 특정 상태 코드를 가지고 있는지 확인하는 데 다음 메서드를 사용할 수 있습니다.

```php
$response->ok() : bool;                  // 200 OK
$response->created() : bool;             // 201 Created
$response->accepted() : bool;            // 202 Accepted
$response->noContent() : bool;           // 204 No Content
$response->movedPermanently() : bool;    // 301 Moved Permanently
$response->found() : bool;               // 302 Found
$response->badRequest() : bool;          // 400 Bad Request
$response->unauthorized() : bool;        // 401 Unauthorized
$response->paymentRequired() : bool;     // 402 Payment Required
$response->forbidden() : bool;           // 403 Forbidden
$response->notFound() : bool;            // 404 Not Found
$response->requestTimeout() : bool;      // 408 Request Timeout
$response->conflict() : bool;            // 409 Conflict
$response->unprocessableEntity() : bool; // 422 Unprocessable Entity
$response->tooManyRequests() : bool;     // 429 Too Many Requests
$response->serverError() : bool;         // 500 Internal Server Error
```

<a name="uri-templates"></a>
#### URI 템플릿

HTTP 클라이언트는 [URI 템플릿 명세](https://www.rfc-editor.org/rfc/rfc6570)를 사용하여 요청 URL을 구성할 수도 있습니다. URI 템플릿에서 확장할 수 있는 URL 파라미터를 정의하려면 `withUrlParameters` 메서드를 사용할 수 있습니다.

```php
Http::withUrlParameters([
    'endpoint' => 'https://laravel.com',
    'page' => 'docs',
    'version' => '12.x',
    'topic' => 'validation',
])->get('{+endpoint}/{page}/{version}/{topic}');
```

<a name="dumping-requests"></a>
#### 요청 덤프

발신 요청 인스턴스를 보내기 전에 덤프하고 스크립트 실행을 종료하려면 요청 정의 시작 부분에 `dd` 메서드를 추가할 수 있습니다.

```php
return Http::dd()->get('http://example.com');
```

<a name="request-data"></a>
### 요청 데이터

물론 `POST`, `PUT`, `PATCH` 요청을 보낼 때 추가 데이터를 함께 보내는 것이 일반적이므로, 이러한 메서드는 두 번째 인자로 데이터 배열을 받습니다. 기본적으로 데이터는 `application/json` 콘텐츠 타입을 사용하여 전송됩니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::post('http://example.com/users', [
    'name' => 'Steve',
    'role' => 'Network Administrator',
]);
```

<a name="get-request-query-parameters"></a>
#### GET 요청 쿼리 파라미터

`GET` 요청을 보낼 때 URL에 직접 쿼리 문자열을 추가하거나 `get` 메서드의 두 번째 인자로 키/값 쌍의 배열을 전달할 수 있습니다.

```php
$response = Http::get('http://example.com/users', [
    'name' => 'Taylor',
    'page' => 1,
]);
```

또는 `withQueryParameters` 메서드를 사용할 수 있습니다.

```php
Http::retry(3, 100)->withQueryParameters([
    'name' => 'Taylor',
    'page' => 1,
])->get('http://example.com/users');
```

<a name="sending-form-url-encoded-requests"></a>
#### Form URL 인코딩 요청 보내기

`application/x-www-form-urlencoded` 콘텐츠 타입을 사용하여 데이터를 보내려면 요청을 보내기 전에 `asForm` 메서드를 호출해야 합니다.

```php
$response = Http::asForm()->post('http://example.com/users', [
    'name' => 'Sara',
    'role' => 'Privacy Consultant',
]);
```

<a name="sending-a-raw-request-body"></a>
#### Raw 요청 본문 보내기

요청을 보낼 때 raw 요청 본문을 제공하려면 `withBody` 메서드를 사용할 수 있습니다. 콘텐츠 타입은 메서드의 두 번째 인자로 제공할 수 있습니다.

```php
$response = Http::withBody(
    base64_encode($photo), 'image/jpeg'
)->post('http://example.com/photo');
```

<a name="multi-part-requests"></a>
#### 멀티파트 요청

파일을 멀티파트 요청으로 보내려면 요청을 보내기 전에 `attach` 메서드를 호출해야 합니다. 이 메서드는 파일의 이름과 내용을 받습니다. 필요한 경우 세 번째 인자로 파일명을 제공할 수 있으며, 네 번째 인자로 파일과 관련된 헤더를 제공할 수 있습니다.

```php
$response = Http::attach(
    'attachment', file_get_contents('photo.jpg'), 'photo.jpg', ['Content-Type' => 'image/jpeg']
)->post('http://example.com/attachments');
```

파일의 raw 내용을 전달하는 대신 스트림 리소스를 전달할 수 있습니다.

```php
$photo = fopen('photo.jpg', 'r');

$response = Http::attach(
    'attachment', $photo, 'photo.jpg'
)->post('http://example.com/attachments');
```

<a name="headers"></a>
### 헤더

`withHeaders` 메서드를 사용하여 요청에 헤더를 추가할 수 있습니다. 이 `withHeaders` 메서드는 키/값 쌍의 배열을 받습니다.

```php
$response = Http::withHeaders([
    'X-First' => 'foo',
    'X-Second' => 'bar'
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

`accept` 메서드를 사용하여 애플리케이션이 요청에 대한 응답으로 기대하는 콘텐츠 타입을 지정할 수 있습니다.

```php
$response = Http::accept('application/json')->get('http://example.com/users');
```

편의를 위해 `acceptJson` 메서드를 사용하여 애플리케이션이 요청에 대한 응답으로 `application/json` 콘텐츠 타입을 기대한다고 빠르게 지정할 수 있습니다.

```php
$response = Http::acceptJson()->get('http://example.com/users');
```

`withHeaders` 메서드는 새 헤더를 요청의 기존 헤더에 병합합니다. 필요한 경우 `replaceHeaders` 메서드를 사용하여 모든 헤더를 완전히 교체할 수 있습니다.

```php
$response = Http::withHeaders([
    'X-Original' => 'foo',
])->replaceHeaders([
    'X-Replacement' => 'bar',
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

<a name="authentication"></a>
### 인증

`withBasicAuth`와 `withDigestAuth` 메서드를 사용하여 각각 기본(Basic) 인증과 다이제스트(Digest) 인증 자격 증명을 지정할 수 있습니다.

```php
// Basic 인증...
$response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

// Digest 인증...
$response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);
```

<a name="bearer-tokens"></a>
#### Bearer 토큰

요청의 `Authorization` 헤더에 bearer 토큰을 빠르게 추가하려면 `withToken` 메서드를 사용할 수 있습니다.

```php
$response = Http::withToken('token')->post(/* ... */);
```

<a name="timeout"></a>
### 타임아웃

`timeout` 메서드를 사용하여 응답을 기다리는 최대 시간(초)을 지정할 수 있습니다. 기본적으로 HTTP 클라이언트는 30초 후에 타임아웃됩니다.

```php
$response = Http::timeout(3)->get(/* ... */);
```

지정된 타임아웃이 초과되면 `Illuminate\Http\Client\ConnectionException` 인스턴스가 발생합니다.

`connectTimeout` 메서드를 사용하여 서버에 연결을 시도하는 동안 기다리는 최대 시간(초)을 지정할 수 있습니다. 기본값은 10초입니다.

```php
$response = Http::connectTimeout(3)->get(/* ... */);
```

<a name="retries"></a>
### 재시도

클라이언트 또는 서버 에러가 발생했을 때 HTTP 클라이언트가 자동으로 요청을 재시도하도록 하려면 `retry` 메서드를 사용할 수 있습니다. `retry` 메서드는 요청을 시도할 최대 횟수와 Laravel이 시도 사이에 기다려야 할 밀리초 수를 받습니다.

```php
$response = Http::retry(3, 100)->post(/* ... */);
```

시도 사이에 대기할 밀리초 수를 수동으로 계산하려면 `retry` 메서드의 두 번째 인자로 클로저를 전달할 수 있습니다.

```php
use Exception;

$response = Http::retry(3, function (int $attempt, Exception $exception) {
    return $attempt * 100;
})->post(/* ... */);
```

편의를 위해 `retry` 메서드의 첫 번째 인자로 배열을 제공할 수도 있습니다. 이 배열은 후속 시도 사이에 대기할 밀리초 수를 결정하는 데 사용됩니다.

```php
$response = Http::retry([100, 200])->post(/* ... */);
```

필요한 경우 `retry` 메서드에 세 번째 인자를 전달할 수 있습니다. 세 번째 인자는 재시도를 실제로 시도할지 여부를 결정하는 콜러블이어야 합니다. 예를 들어, 초기 요청이 `ConnectionException`을 만났을 때만 요청을 재시도할 수 있습니다.

```php
use Exception;
use Illuminate\Http\Client\PendingRequest;

$response = Http::retry(3, 100, function (Exception $exception, PendingRequest $request) {
    return $exception instanceof ConnectionException;
})->post(/* ... */);
```

요청 시도가 실패하면 새 시도를 하기 전에 요청을 변경하고 싶을 수 있습니다. `retry` 메서드에 제공한 콜러블에 제공된 요청 인자를 수정하여 이를 달성할 수 있습니다. 예를 들어, 첫 번째 시도가 인증 에러를 반환하면 새 인증 토큰으로 요청을 재시도할 수 있습니다.

```php
use Exception;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;

$response = Http::withToken($this->getToken())->retry(2, 0, function (Exception $exception, PendingRequest $request) {
    if (! $exception instanceof RequestException || $exception->response->status() !== 401) {
        return false;
    }

    $request->withToken($this->getNewToken());

    return true;
})->post(/* ... */);
```

모든 요청이 실패하면 `Illuminate\Http\Client\RequestException` 인스턴스가 발생합니다. 이 동작을 비활성화하려면 `throw` 인자에 `false` 값을 제공할 수 있습니다. 비활성화된 경우 모든 재시도가 시도된 후 클라이언트가 받은 마지막 응답이 반환됩니다.

```php
$response = Http::retry(3, 100, throw: false)->post(/* ... */);
```

> [!WARNING]
> 연결 문제로 인해 모든 요청이 실패하면 `throw` 인자가 `false`로 설정되어 있어도 `Illuminate\Http\Client\ConnectionException`이 여전히 발생합니다.

<a name="error-handling"></a>
### 에러 처리

Guzzle의 기본 동작과 달리, Laravel의 HTTP 클라이언트 래퍼는 클라이언트 또는 서버 에러(서버의 `400` 및 `500` 수준 응답)에 대해 예외를 발생시키지 않습니다. `successful`, `clientError` 또는 `serverError` 메서드를 사용하여 이러한 에러 중 하나가 반환되었는지 확인할 수 있습니다.

```php
// 상태 코드가 >= 200이고 < 300인지 확인...
$response->successful();

// 상태 코드가 >= 400인지 확인...
$response->failed();

// 응답이 400 수준 상태 코드를 가지고 있는지 확인...
$response->clientError();

// 응답이 500 수준 상태 코드를 가지고 있는지 확인...
$response->serverError();

// 클라이언트 또는 서버 에러가 발생한 경우 주어진 콜백을 즉시 실행...
$response->onError(callable $callback);
```

<a name="throwing-exceptions"></a>
#### 예외 발생

응답 인스턴스가 있고 응답 상태 코드가 클라이언트 또는 서버 에러를 나타내는 경우 `Illuminate\Http\Client\RequestException` 인스턴스를 발생시키려면 `throw` 또는 `throwIf` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Http\Client\Response;

$response = Http::post(/* ... */);

// 클라이언트 또는 서버 에러가 발생한 경우 예외 발생...
$response->throw();

// 에러가 발생하고 주어진 조건이 true인 경우 예외 발생...
$response->throwIf($condition);

// 에러가 발생하고 주어진 클로저가 true를 반환하는 경우 예외 발생...
$response->throwIf(fn (Response $response) => true);

// 에러가 발생하고 주어진 조건이 false인 경우 예외 발생...
$response->throwUnless($condition);

// 에러가 발생하고 주어진 클로저가 false를 반환하는 경우 예외 발생...
$response->throwUnless(fn (Response $response) => false);

// 응답이 특정 상태 코드를 가진 경우 예외 발생...
$response->throwIfStatus(403);

// 응답이 특정 상태 코드를 가지지 않은 경우 예외 발생...
$response->throwUnlessStatus(200);

return $response['user']['id'];
```

`Illuminate\Http\Client\RequestException` 인스턴스는 반환된 응답을 검사할 수 있는 public `$response` 속성을 가지고 있습니다.

`throw` 메서드는 에러가 발생하지 않은 경우 응답 인스턴스를 반환하므로 `throw` 메서드에 다른 작업을 체이닝할 수 있습니다.

```php
return Http::post(/* ... */)->throw()->json();
```

예외가 발생하기 전에 추가 로직을 수행하려면 `throw` 메서드에 클로저를 전달할 수 있습니다. 클로저가 호출된 후 예외가 자동으로 발생하므로 클로저 내에서 예외를 다시 발생시킬 필요가 없습니다.

```php
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\RequestException;

return Http::post(/* ... */)->throw(function (Response $response, RequestException $e) {
    // ...
})->json();
```

기본적으로 `RequestException` 메시지는 로깅하거나 보고할 때 120자로 잘립니다. 이 동작을 커스터마이즈하거나 비활성화하려면 `bootstrap/app.php` 파일에서 애플리케이션의 등록된 동작을 구성할 때 `truncateAt` 및 `dontTruncate` 메서드를 활용할 수 있습니다.

```php
use Illuminate\Http\Client\RequestException;

->registered(function (): void {
    // 요청 예외 메시지를 240자로 자르기...
    RequestException::truncateAt(240);

    // 요청 예외 메시지 자르기 비활성화...
    RequestException::dontTruncate();
})
```

또는, `truncateExceptionsAt` 메서드를 사용하여 요청별로 예외 잘림 동작을 커스터마이즈할 수 있습니다.

```php
return Http::truncateExceptionsAt(240)->post(/* ... */);
```

<a name="guzzle-middleware"></a>
### Guzzle 미들웨어

Laravel의 HTTP 클라이언트는 Guzzle로 구동되므로 [Guzzle 미들웨어](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html)를 활용하여 발신 요청을 조작하거나 수신 응답을 검사할 수 있습니다. 발신 요청을 조작하려면 `withRequestMiddleware` 메서드를 통해 Guzzle 미들웨어를 등록하세요.

```php
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\RequestInterface;

$response = Http::withRequestMiddleware(
    function (RequestInterface $request) {
        return $request->withHeader('X-Example', 'Value');
    }
)->get('http://example.com');
```

마찬가지로 `withResponseMiddleware` 메서드를 통해 미들웨어를 등록하여 수신 HTTP 응답을 검사할 수 있습니다.

```php
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\ResponseInterface;

$response = Http::withResponseMiddleware(
    function (ResponseInterface $response) {
        $header = $response->getHeader('X-Example');

        // ...

        return $response;
    }
)->get('http://example.com');
```

<a name="global-middleware"></a>
#### 글로벌 미들웨어

때로는 모든 발신 요청과 수신 응답에 적용되는 미들웨어를 등록하고 싶을 수 있습니다. 이를 위해 `globalRequestMiddleware`와 `globalResponseMiddleware` 메서드를 사용할 수 있습니다. 일반적으로 이러한 메서드는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출해야 합니다.

```php
use Illuminate\Support\Facades\Http;

Http::globalRequestMiddleware(fn ($request) => $request->withHeader(
    'User-Agent', 'Example Application/1.0'
));

Http::globalResponseMiddleware(fn ($response) => $response->withHeader(
    'X-Finished-At', now()->toDateTimeString()
));
```

<a name="guzzle-options"></a>
### Guzzle 옵션

`withOptions` 메서드를 사용하여 발신 요청에 대한 추가 [Guzzle 요청 옵션](http://docs.guzzlephp.org/en/stable/request-options.html)을 지정할 수 있습니다. `withOptions` 메서드는 키/값 쌍의 배열을 받습니다.

```php
$response = Http::withOptions([
    'debug' => true,
])->get('http://example.com/users');
```

<a name="global-options"></a>
#### 글로벌 옵션

모든 발신 요청에 대한 기본 옵션을 구성하려면 `globalOptions` 메서드를 활용할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출해야 합니다.

```php
use Illuminate\Support\Facades\Http;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Http::globalOptions([
        'allow_redirects' => false,
    ]);
}
```

<a name="concurrent-requests"></a>
## 동시 요청

때로는 여러 HTTP 요청을 동시에 보내고 싶을 수 있습니다. 즉, 요청을 순차적으로 보내는 대신 여러 요청을 동시에 발송하고 싶을 수 있습니다. 이는 느린 HTTP API와 상호 작용할 때 상당한 성능 향상을 가져올 수 있습니다.

<a name="request-pooling"></a>
### 요청 풀링

`pool` 메서드를 사용하여 이를 달성할 수 있습니다. `pool` 메서드는 `Illuminate\Http\Client\Pool` 인스턴스를 받는 클로저를 받아서 요청 풀에 요청을 쉽게 추가하여 발송할 수 있습니다.

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$responses = Http::pool(fn (Pool $pool) => [
    $pool->get('http://localhost/first'),
    $pool->get('http://localhost/second'),
    $pool->get('http://localhost/third'),
]);

return $responses[0]->ok() &&
       $responses[1]->ok() &&
       $responses[2]->ok();
```

보시다시피 각 응답 인스턴스는 풀에 추가된 순서에 따라 접근할 수 있습니다. 원하는 경우 `as` 메서드를 사용하여 요청에 이름을 지정할 수 있으며, 이를 통해 해당 응답에 이름으로 접근할 수 있습니다.

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$responses = Http::pool(fn (Pool $pool) => [
    $pool->as('first')->get('http://localhost/first'),
    $pool->as('second')->get('http://localhost/second'),
    $pool->as('third')->get('http://localhost/third'),
]);

return $responses['first']->ok();
```

요청 풀의 최대 동시성은 `pool` 메서드에 `concurrency` 인수를 제공하여 제어할 수 있습니다. 이 값은 요청 풀을 처리하는 동안 동시에 전송 중인 HTTP 요청의 최대 수를 결정합니다.

```php
$responses = Http::pool(fn (Pool $pool) => [
    // ...
], concurrency: 5);
```

<a name="customizing-concurrent-requests"></a>
#### 동시 요청 커스터마이징

`pool` 메서드는 `withHeaders`나 `middleware` 메서드와 같은 다른 HTTP 클라이언트 메서드와 체이닝할 수 없습니다. 풀링된 요청에 커스텀 헤더나 미들웨어를 적용하려면 풀의 각 요청에 해당 옵션을 구성해야 합니다.

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$headers = [
    'X-Example' => 'example',
];

$responses = Http::pool(fn (Pool $pool) => [
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
]);
```

<a name="request-batching"></a>
### 요청 배치

Laravel에서 동시 요청을 다루는 또 다른 방법은 `batch` 메서드를 사용하는 것입니다. `pool` 메서드와 마찬가지로 `Illuminate\Http\Client\Batch` 인스턴스를 받는 클로저를 받아서 요청 풀에 요청을 쉽게 추가할 수 있지만, 완료 콜백도 정의할 수 있습니다.

```php
use Illuminate\Http\Client\Batch;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

$responses = Http::batch(fn (Batch $batch) => [
    $batch->get('http://localhost/first'),
    $batch->get('http://localhost/second'),
    $batch->get('http://localhost/third'),
])->before(function (Batch $batch) {
    // 배치가 생성되었지만 아직 요청이 초기화되지 않았습니다...
})->progress(function (Batch $batch, int|string $key, Response $response) {
    // 개별 요청이 성공적으로 완료되었습니다...
})->then(function (Batch $batch, array $results) {
    // 모든 요청이 성공적으로 완료되었습니다...
})->catch(function (Batch $batch, int|string $key, Response|RequestException|ConnectionException $response) {
    // 배치 요청 실패가 감지되었습니다...
})->finally(function (Batch $batch, array $results) {
    // 배치 실행이 완료되었습니다...
})->send();
```

`pool` 메서드와 마찬가지로, `as` 메서드를 사용하여 요청에 이름을 지정할 수 있습니다.

```php
$responses = Http::batch(fn (Batch $batch) => [
    $batch->as('first')->get('http://localhost/first'),
    $batch->as('second')->get('http://localhost/second'),
    $batch->as('third')->get('http://localhost/third'),
])->send();
```

`send` 메서드를 호출하여 `batch`가 시작된 후에는 새 요청을 추가할 수 없습니다. 추가를 시도하면 `Illuminate\Http\Client\BatchInProgressException` 예외가 발생합니다.

요청 배치의 최대 동시성은 `concurrency` 메서드를 통해 제어할 수 있습니다. 이 값은 요청 배치를 처리하는 동안 동시에 전송 중인 HTTP 요청의 최대 수를 결정합니다.

```php
$responses = Http::batch(fn (Batch $batch) => [
    // ...
])->concurrency(5)->send();
```

<a name="inspecting-batches"></a>
#### 배치 검사

배치 완료 콜백에 제공되는 `Illuminate\Http\Client\Batch` 인스턴스에는 주어진 요청 배치와 상호 작용하고 검사하는 데 도움이 되는 다양한 속성과 메서드가 있습니다.

```php
// 배치에 할당된 요청 수...
$batch->totalRequests;

// 아직 처리되지 않은 요청 수...
$batch->pendingRequests;

// 실패한 요청 수...
$batch->failedRequests;

// 지금까지 처리된 요청 수...
$batch->processedRequests();

// 배치 실행이 완료되었는지 나타냅니다...
$batch->finished();

// 배치에 요청 실패가 있는지 나타냅니다...
$batch->hasFailures();
```
<a name="deferring-batches"></a>
#### 배치 지연

`defer` 메서드가 호출되면 요청 배치가 즉시 실행되지 않습니다. 대신 Laravel은 현재 애플리케이션 요청의 HTTP 응답이 사용자에게 전송된 후에 배치를 실행하여, 애플리케이션이 빠르고 반응성 있게 느껴지도록 합니다.

```php
use Illuminate\Http\Client\Batch;
use Illuminate\Support\Facades\Http;

$responses = Http::batch(fn (Batch $batch) => [
    $batch->get('http://localhost/first'),
    $batch->get('http://localhost/second'),
    $batch->get('http://localhost/third'),
])->then(function (Batch $batch, array $results) {
    // 모든 요청이 성공적으로 완료되었습니다...
})->defer();
```

<a name="macros"></a>
## 매크로

Laravel HTTP 클라이언트를 사용하면 "매크로(macros)"를 정의할 수 있으며, 이는 애플리케이션 전체에서 서비스와 상호 작용할 때 일반적인 요청 경로와 헤더를 구성하는 유연하고 표현력 있는 메커니즘으로 사용될 수 있습니다. 시작하려면 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내에서 매크로를 정의할 수 있습니다.

```php
use Illuminate\Support\Facades\Http;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Http::macro('github', function () {
        return Http::withHeaders([
            'X-Example' => 'example',
        ])->baseUrl('https://github.com');
    });
}
```

매크로가 구성되면 애플리케이션 어디에서든 이를 호출하여 지정된 구성으로 대기 중인 요청을 생성할 수 있습니다.

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>
## 테스팅

많은 Laravel 서비스는 테스트를 쉽고 표현력 있게 작성할 수 있도록 기능을 제공하며, Laravel의 HTTP 클라이언트도 예외가 아닙니다. `Http` 파사드의 `fake` 메서드를 사용하면 요청이 이루어질 때 HTTP 클라이언트가 스텁/더미 응답을 반환하도록 지시할 수 있습니다.

<a name="faking-responses"></a>
### 응답 페이크

예를 들어, 모든 요청에 대해 비어 있는 `200` 상태 코드 응답을 반환하도록 HTTP 클라이언트에 지시하려면 인자 없이 `fake` 메서드를 호출할 수 있습니다.

```php
use Illuminate\Support\Facades\Http;

Http::fake();

$response = Http::post(/* ... */);
```

<a name="faking-specific-urls"></a>
#### 특정 URL 페이크

또는 `fake` 메서드에 배열을 전달할 수 있습니다. 배열의 키는 페이크하려는 URL 패턴과 관련 응답을 나타내야 합니다. `*` 문자는 와일드카드 문자로 사용될 수 있습니다. `Http` 파사드의 `response` 메서드를 사용하여 이러한 엔드포인트에 대한 스텁/페이크 응답을 구성할 수 있습니다.

```php
Http::fake([
    // GitHub 엔드포인트에 대한 JSON 응답 스텁...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

    // Google 엔드포인트에 대한 문자열 응답 스텁...
    'google.com/*' => Http::response('Hello World', 200, $headers),
]);
```

페이크되지 않은 URL에 대한 요청은 실제로 실행됩니다. 일치하지 않는 모든 URL을 스텁하는 폴백 URL 패턴을 지정하려면 단일 `*` 문자를 사용할 수 있습니다.

```php
Http::fake([
    // GitHub 엔드포인트에 대한 JSON 응답 스텁...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

    // 다른 모든 엔드포인트에 대한 문자열 응답 스텁...
    '*' => Http::response('Hello World', 200, ['Headers']),
]);
```

편의를 위해 응답으로 문자열, 배열 또는 정수를 제공하여 간단한 문자열, JSON 및 빈 응답을 생성할 수 있습니다.

```php
Http::fake([
    'google.com/*' => 'Hello World',
    'github.com/*' => ['foo' => 'bar'],
    'chatgpt.com/*' => 200,
]);
```

<a name="faking-connection-exceptions"></a>
#### 예외 페이크

때로는 HTTP 클라이언트가 요청을 시도할 때 `Illuminate\Http\Client\ConnectionException`을 만나는 경우 애플리케이션의 동작을 테스트해야 할 수 있습니다. `failedConnection` 메서드를 사용하여 HTTP 클라이언트가 연결 예외를 발생시키도록 지시할 수 있습니다.

```php
Http::fake([
    'github.com/*' => Http::failedConnection(),
]);
```

`Illuminate\Http\Client\RequestException`이 발생하는 경우 애플리케이션의 동작을 테스트하려면 `failedRequest` 메서드를 사용할 수 있습니다.

```php
$this->mock(GithubService::class);
    ->shouldReceive('getUser')
    ->andThrow(
        Http::failedRequest(['code' => 'not_found'], 404)
    );
```

<a name="faking-response-sequences"></a>
#### 응답 시퀀스 페이크

때로는 단일 URL이 특정 순서로 일련의 페이크 응답을 반환하도록 지정해야 할 수 있습니다. `Http::sequence` 메서드를 사용하여 응답을 구성하면 이를 달성할 수 있습니다.

```php
Http::fake([
    // GitHub 엔드포인트에 대한 일련의 응답 스텁...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->pushStatus(404),
]);
```

응답 시퀀스의 모든 응답이 소비되면 추가 요청은 응답 시퀀스가 예외를 발생시킵니다. 시퀀스가 비어 있을 때 반환해야 하는 기본 응답을 지정하려면 `whenEmpty` 메서드를 사용할 수 있습니다.

```php
Http::fake([
    // GitHub 엔드포인트에 대한 일련의 응답 스텁...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->whenEmpty(Http::response()),
]);
```

응답 시퀀스를 페이크하고 싶지만 페이크해야 할 특정 URL 패턴을 지정할 필요가 없는 경우 `Http::fakeSequence` 메서드를 사용할 수 있습니다.

```php
Http::fakeSequence()
    ->push('Hello World', 200)
    ->whenEmpty(Http::response());
```

<a name="fake-callback"></a>
#### 페이크 콜백

특정 엔드포인트에 어떤 응답을 반환할지 결정하기 위해 더 복잡한 로직이 필요한 경우 `fake` 메서드에 클로저를 전달할 수 있습니다. 이 클로저는 `Illuminate\Http\Client\Request` 인스턴스를 받고 응답 인스턴스를 반환해야 합니다. 클로저 내에서 어떤 유형의 응답을 반환할지 결정하는 데 필요한 모든 로직을 수행할 수 있습니다.

```php
use Illuminate\Http\Client\Request;

Http::fake(function (Request $request) {
    return Http::response('Hello World', 200);
});
```

<a name="inspecting-requests"></a>
### 요청 검사

응답을 페이크할 때 애플리케이션이 올바른 데이터나 헤더를 보내고 있는지 확인하기 위해 클라이언트가 받는 요청을 검사하고 싶을 수 있습니다. `Http::fake`를 호출한 후 `Http::assertSent` 메서드를 호출하여 이를 달성할 수 있습니다.

`assertSent` 메서드는 `Illuminate\Http\Client\Request` 인스턴스를 받고 요청이 기대에 맞는지 나타내는 불리언 값을 반환하는 클로저를 받습니다. 테스트가 통과하려면 주어진 기대와 일치하는 요청이 최소한 하나 이상 발행되어야 합니다.

```php
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

Http::fake();

Http::withHeaders([
    'X-First' => 'foo',
])->post('http://example.com/users', [
    'name' => 'Taylor',
    'role' => 'Developer',
]);

Http::assertSent(function (Request $request) {
    return $request->hasHeader('X-First', 'foo') &&
           $request->url() == 'http://example.com/users' &&
           $request['name'] == 'Taylor' &&
           $request['role'] == 'Developer';
});
```

필요한 경우 `assertNotSent` 메서드를 사용하여 특정 요청이 전송되지 않았음을 어설션할 수 있습니다.

```php
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

Http::fake();

Http::post('http://example.com/users', [
    'name' => 'Taylor',
    'role' => 'Developer',
]);

Http::assertNotSent(function (Request $request) {
    return $request->url() === 'http://example.com/posts';
});
```

`assertSentCount` 메서드를 사용하여 테스트 중에 "전송된" 요청 수를 어설션할 수 있습니다.

```php
Http::fake();

Http::assertSentCount(5);
```

또는 `assertNothingSent` 메서드를 사용하여 테스트 중에 요청이 전송되지 않았음을 어설션할 수 있습니다.

```php
Http::fake();

Http::assertNothingSent();
```

<a name="recording-requests-and-responses"></a>
#### 요청/응답 기록

`recorded` 메서드를 사용하여 모든 요청과 해당 응답을 수집할 수 있습니다. `recorded` 메서드는 `Illuminate\Http\Client\Request`와 `Illuminate\Http\Client\Response` 인스턴스를 포함하는 배열 컬렉션을 반환합니다.

```php
Http::fake([
    'https://laravel.com' => Http::response(status: 500),
    'https://nova.laravel.com/' => Http::response(),
]);

Http::get('https://laravel.com');
Http::get('https://nova.laravel.com/');

$recorded = Http::recorded();

[$request, $response] = $recorded[0];
```

또한 `recorded` 메서드는 `Illuminate\Http\Client\Request`와 `Illuminate\Http\Client\Response` 인스턴스를 받아 기대에 따라 요청/응답 쌍을 필터링하는 데 사용할 수 있는 클로저를 받습니다.

```php
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\Response;

Http::fake([
    'https://laravel.com' => Http::response(status: 500),
    'https://nova.laravel.com/' => Http::response(),
]);

Http::get('https://laravel.com');
Http::get('https://nova.laravel.com/');

$recorded = Http::recorded(function (Request $request, Response $response) {
    return $request->url() !== 'https://laravel.com' &&
           $response->successful();
});
```

<a name="preventing-stray-requests"></a>
### 누락된 요청 방지

개별 테스트 또는 전체 테스트 스위트에서 HTTP 클라이언트를 통해 전송되는 모든 요청이 페이크되었는지 확인하려면 `preventStrayRequests` 메서드를 호출할 수 있습니다. 이 메서드를 호출한 후 해당 페이크 응답이 없는 요청은 실제 HTTP 요청을 보내는 대신 예외를 발생시킵니다.

```php
use Illuminate\Support\Facades\Http;

Http::preventStrayRequests();

Http::fake([
    'github.com/*' => Http::response('ok'),
]);

// "ok" 응답이 반환됩니다...
Http::get('https://github.com/laravel/framework');

// 예외가 발생합니다...
Http::get('https://laravel.com');
```

때로는 대부분의 누락된 요청을 방지하면서도 특정 요청은 실행을 허용하고 싶을 수 있습니다. 이를 위해 `allowStrayRequests` 메서드에 URL 패턴 배열을 전달할 수 있습니다. 주어진 패턴과 일치하는 요청은 허용되고, 다른 모든 요청은 계속 예외를 발생시킵니다.

```php
use Illuminate\Support\Facades\Http;

Http::preventStrayRequests();

Http::allowStrayRequests([
    'http://127.0.0.1:5000/*',
]);

// 이 요청은 실행됩니다...
Http::get('http://127.0.0.1:5000/generate');

// 예외가 발생합니다...
Http::get('https://laravel.com');
```

<a name="events"></a>
## 이벤트

Laravel은 HTTP 요청을 보내는 과정에서 세 가지 이벤트를 발생시킵니다. `RequestSending` 이벤트는 요청이 전송되기 전에 발생하고, `ResponseReceived` 이벤트는 주어진 요청에 대한 응답을 받은 후 발생합니다. `ConnectionFailed` 이벤트는 주어진 요청에 대한 응답을 받지 못한 경우 발생합니다.

`RequestSending`과 `ConnectionFailed` 이벤트는 모두 `Illuminate\Http\Client\Request` 인스턴스를 검사하는 데 사용할 수 있는 public `$request` 속성을 포함합니다. 마찬가지로 `ResponseReceived` 이벤트는 `$request` 속성과 `Illuminate\Http\Client\Response` 인스턴스를 검사하는 데 사용할 수 있는 `$response` 속성을 포함합니다. 애플리케이션 내에서 이러한 이벤트에 대한 [이벤트 리스너](/docs/{{version}}/events)를 생성할 수 있습니다.

```php
use Illuminate\Http\Client\Events\RequestSending;

class LogRequest
{
    /**
     * 이벤트를 처리합니다.
     */
    public function handle(RequestSending $event): void
    {
        // $event->request ...
    }
}
```

# HTTP 응답(Responses)

- [응답 생성하기](#creating-responses)
    - [응답에 헤더 추가하기](#attaching-headers-to-responses)
    - [응답에 쿠키 추가하기](#attaching-cookies-to-responses)
    - [쿠키와 암호화](#cookies-and-encryption)
- [리다이렉트](#redirects)
    - [이름이 지정된 라우트로 리다이렉트하기](#redirecting-named-routes)
    - [컨트롤러 액션으로 리다이렉트하기](#redirecting-controller-actions)
    - [외부 도메인으로 리다이렉트하기](#redirecting-external-domains)
    - [플래시 세션 데이터와 함께 리다이렉트하기](#redirecting-with-flashed-session-data)
- [기타 응답 타입](#other-response-types)
    - [뷰 응답](#view-responses)
    - [JSON 응답](#json-responses)
    - [파일 다운로드](#file-downloads)
    - [파일 응답](#file-responses)
- [응답 매크로](#response-macros)

<a name="creating-responses"></a>
## 응답 생성하기

<a name="strings-arrays"></a>
#### 문자열과 배열

모든 라우트와 컨트롤러는 사용자의 브라우저로 다시 전송될 응답을 반환해야 합니다. Laravel은 응답을 반환하는 여러 가지 방법을 제공합니다. 가장 기본적인 응답은 라우트나 컨트롤러에서 문자열을 반환하는 것입니다. 프레임워크는 자동으로 문자열을 완전한 HTTP 응답으로 변환합니다.

```php
Route::get('/', function () {
    return 'Hello World';
});
```

라우트와 컨트롤러에서 문자열을 반환하는 것 외에도 배열을 반환할 수도 있습니다. 프레임워크는 자동으로 배열을 JSON 응답으로 변환합니다.

```php
Route::get('/', function () {
    return [1, 2, 3];
});
```

> [!NOTE]
> 라우트나 컨트롤러에서 [Eloquent 컬렉션](/docs/{{version}}/eloquent-collections)도 반환할 수 있다는 것을 알고 계셨나요? 자동으로 JSON으로 변환됩니다. 한번 시도해 보세요!

<a name="response-objects"></a>
#### 응답 객체(Response Objects)

일반적으로 라우트 액션에서 단순한 문자열이나 배열만 반환하지는 않습니다. 대신 완전한 `Illuminate\Http\Response` 인스턴스나 [뷰](/docs/{{version}}/views)를 반환하게 됩니다.

완전한 `Response` 인스턴스를 반환하면 응답의 HTTP 상태 코드와 헤더를 커스터마이즈할 수 있습니다. `Response` 인스턴스는 `Symfony\Component\HttpFoundation\Response` 클래스를 상속받으며, 이 클래스는 HTTP 응답을 구성하기 위한 다양한 메서드를 제공합니다.

```php
Route::get('/home', function () {
    return response('Hello World', 200)
        ->header('Content-Type', 'text/plain');
});
```

<a name="eloquent-models-and-collections"></a>
#### Eloquent 모델과 컬렉션

라우트와 컨트롤러에서 [Eloquent ORM](/docs/{{version}}/eloquent) 모델과 컬렉션을 직접 반환할 수도 있습니다. 이렇게 하면 Laravel은 모델의 [숨겨진 속성](/docs/{{version}}/eloquent-serialization#hiding-attributes-from-json)을 고려하면서 자동으로 모델과 컬렉션을 JSON 응답으로 변환합니다.

```php
use App\Models\User;

Route::get('/user/{user}', function (User $user) {
    return $user;
});
```

<a name="attaching-headers-to-responses"></a>
### 응답에 헤더 추가하기

대부분의 응답 메서드는 체이닝이 가능하여 응답 인스턴스를 유연하게 구성할 수 있다는 점을 기억하세요. 예를 들어, 응답을 사용자에게 보내기 전에 `header` 메서드를 사용하여 일련의 헤더를 추가할 수 있습니다.

```php
return response($content)
    ->header('Content-Type', $type)
    ->header('X-Header-One', 'Header Value')
    ->header('X-Header-Two', 'Header Value');
```

또는 `withHeaders` 메서드를 사용하여 응답에 추가할 헤더 배열을 지정할 수 있습니다.

```php
return response($content)
    ->withHeaders([
        'Content-Type' => $type,
        'X-Header-One' => 'Header Value',
        'X-Header-Two' => 'Header Value',
    ]);
```

<a name="cache-control-middleware"></a>
#### 캐시 제어 미들웨어(Cache Control Middleware)

Laravel은 라우트 그룹에 대해 `Cache-Control` 헤더를 빠르게 설정하는 데 사용할 수 있는 `cache.headers` 미들웨어를 포함하고 있습니다. 지시문은 해당 캐시 제어 지시문의 "스네이크 케이스" 형식으로 제공해야 하며 세미콜론으로 구분해야 합니다. 지시문 목록에 `etag`가 지정되면 응답 콘텐츠의 MD5 해시가 자동으로 ETag 식별자로 설정됩니다.

```php
Route::middleware('cache.headers:public;max_age=30;s_maxage=300;stale_while_revalidate=600;etag')->group(function () {
    Route::get('/privacy', function () {
        // ...
    });

    Route::get('/terms', function () {
        // ...
    });
});
```

<a name="attaching-cookies-to-responses"></a>
### 응답에 쿠키 추가하기

`cookie` 메서드를 사용하여 발신 `Illuminate\Http\Response` 인스턴스에 쿠키를 추가할 수 있습니다. 이 메서드에 쿠키의 이름, 값, 그리고 쿠키가 유효한 것으로 간주되어야 하는 시간(분)을 전달해야 합니다.

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes
);
```

`cookie` 메서드는 덜 자주 사용되는 몇 가지 추가 인수도 받습니다. 일반적으로 이러한 인수는 PHP의 기본 [setcookie](https://secure.php.net/manual/en/function.setcookie.php) 메서드에 전달되는 인수와 동일한 목적과 의미를 가집니다.

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);
```

발신 응답과 함께 쿠키를 전송하고 싶지만 아직 해당 응답의 인스턴스가 없는 경우, `Cookie` 파사드를 사용하여 응답이 전송될 때 첨부할 쿠키를 "대기열에 넣을" 수 있습니다. `queue` 메서드는 쿠키 인스턴스를 생성하는 데 필요한 인수를 받습니다. 이러한 쿠키는 브라우저로 전송되기 전에 발신 응답에 첨부됩니다.

```php
use Illuminate\Support\Facades\Cookie;

Cookie::queue('name', 'value', $minutes);
```

<a name="generating-cookie-instances"></a>
#### 쿠키 인스턴스 생성하기

나중에 응답 인스턴스에 첨부할 수 있는 `Symfony\Component\HttpFoundation\Cookie` 인스턴스를 생성하려면 전역 `cookie` 헬퍼를 사용할 수 있습니다. 이 쿠키는 응답 인스턴스에 첨부되지 않는 한 클라이언트에 다시 전송되지 않습니다.

```php
$cookie = cookie('name', 'value', $minutes);

return response('Hello World')->cookie($cookie);
```

<a name="expiring-cookies-early"></a>
#### 쿠키 조기 만료시키기

발신 응답의 `withoutCookie` 메서드를 통해 쿠키를 만료시켜 제거할 수 있습니다.

```php
return response('Hello World')->withoutCookie('name');
```

아직 발신 응답의 인스턴스가 없는 경우 `Cookie` 파사드의 `expire` 메서드를 사용하여 쿠키를 만료시킬 수 있습니다.

```php
Cookie::expire('name');
```

<a name="cookies-and-encryption"></a>
### 쿠키와 암호화

기본적으로 Laravel이 생성하는 모든 쿠키는 암호화되고 서명되어 클라이언트가 수정하거나 읽을 수 없습니다. 애플리케이션에서 생성하는 쿠키의 일부에 대해 암호화를 비활성화하려면 `app/Http/Middleware` 디렉토리에 있는 `App\Http\Middleware\EncryptCookies` 미들웨어의 `$except` 속성을 사용할 수 있습니다.

    /**
     * The names of the cookies that should not be encrypted.
     *
     * @var array
     */
    protected $except = [
        'cookie_name',
    ];

<a name="redirects"></a>
## 리다이렉트

리다이렉트 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스이며, 사용자를 다른 URL로 리다이렉트하는 데 필요한 적절한 헤더를 포함합니다. `RedirectResponse` 인스턴스를 생성하는 여러 가지 방법이 있습니다. 가장 간단한 방법은 전역 `redirect` 헬퍼를 사용하는 것입니다.

```php
Route::get('/dashboard', function () {
    return redirect('home/dashboard');
});
```

때때로 제출된 폼이 유효하지 않을 때와 같이 사용자를 이전 위치로 리다이렉트하고 싶을 수 있습니다. 전역 `back` 헬퍼 함수를 사용하면 됩니다. 이 기능은 [세션](/docs/{{version}}/session)을 활용하므로 `back` 함수를 호출하는 라우트가 `web` 미들웨어 그룹을 사용하고 있는지 확인하세요.

```php
Route::post('/user/profile', function () {
    // 요청 유효성 검사...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
### 이름이 지정된 라우트로 리다이렉트하기

매개변수 없이 `redirect` 헬퍼를 호출하면 `Illuminate\Routing\Redirector` 인스턴스가 반환되어 `Redirector` 인스턴스의 모든 메서드를 호출할 수 있습니다. 예를 들어, 이름이 지정된 라우트로의 `RedirectResponse`를 생성하려면 `route` 메서드를 사용할 수 있습니다.

```php
return redirect()->route('login');
```

라우트에 매개변수가 있는 경우 `route` 메서드의 두 번째 인수로 전달할 수 있습니다.

```php
// 다음 URI를 가진 라우트의 경우: /profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델을 통해 매개변수 채우기

Eloquent 모델에서 채워지는 "ID" 매개변수가 있는 라우트로 리다이렉트하는 경우 모델 자체를 전달할 수 있습니다. ID는 자동으로 추출됩니다.

```php
// 다음 URI를 가진 라우트의 경우: /profile/{id}

return redirect()->route('profile', [$user]);
```

라우트 매개변수에 배치되는 값을 커스터마이즈하려면 라우트 매개변수 정의에서 컬럼을 지정하거나(`/profile/{id:slug}`) Eloquent 모델의 `getRouteKey` 메서드를 오버라이드할 수 있습니다.

```php
/**
 * 모델의 라우트 키 값을 가져옵니다.
 */
public function getRouteKey(): mixed
{
    return $this->slug;
}
```

<a name="redirecting-controller-actions"></a>
### 컨트롤러 액션으로 리다이렉트하기

[컨트롤러 액션](/docs/{{version}}/controllers)으로의 리다이렉트도 생성할 수 있습니다. 이렇게 하려면 컨트롤러와 액션 이름을 `action` 메서드에 전달합니다.

```php
use App\Http\Controllers\UserController;

return redirect()->action([UserController::class, 'index']);
```

컨트롤러 라우트에 매개변수가 필요한 경우 `action` 메서드의 두 번째 인수로 전달할 수 있습니다.

```php
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-external-domains"></a>
### 외부 도메인으로 리다이렉트하기

때때로 애플리케이션 외부의 도메인으로 리다이렉트해야 할 수 있습니다. `away` 메서드를 호출하면 추가적인 URL 인코딩, 유효성 검사 또는 확인 없이 `RedirectResponse`를 생성할 수 있습니다.

```php
return redirect()->away('https://www.google.com');
```

<a name="redirecting-with-flashed-session-data"></a>
### 플래시 세션 데이터와 함께 리다이렉트하기

새 URL로 리다이렉트하고 [세션에 데이터를 플래시](/docs/{{version}}/session#flash-data)하는 것은 일반적으로 동시에 수행됩니다. 보통 이것은 액션을 성공적으로 수행한 후 세션에 성공 메시지를 플래시할 때 수행됩니다. 편의를 위해 `RedirectResponse` 인스턴스를 생성하고 단일 플루언트 메서드 체인으로 세션에 데이터를 플래시할 수 있습니다.

```php
Route::post('/user/profile', function () {
    // ...

    return redirect('dashboard')->with('status', 'Profile updated!');
});
```

사용자가 리다이렉트된 후 [세션](/docs/{{version}}/session)에서 플래시된 메시지를 표시할 수 있습니다. 예를 들어, [Blade 문법](/docs/{{version}}/blade)을 사용하면 다음과 같습니다.

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

<a name="redirecting-with-input"></a>
#### 입력값과 함께 리다이렉트하기

`RedirectResponse` 인스턴스가 제공하는 `withInput` 메서드를 사용하여 사용자를 새 위치로 리다이렉트하기 전에 현재 요청의 입력 데이터를 세션에 플래시할 수 있습니다. 이것은 일반적으로 사용자가 유효성 검사 오류를 만났을 때 수행됩니다. 입력이 세션에 플래시되면 다음 요청 중에 쉽게 [검색](/docs/{{version}}/requests#retrieving-old-input)하여 폼을 다시 채울 수 있습니다.

```php
return back()->withInput();
```

<a name="other-response-types"></a>
## 기타 응답 타입

`response` 헬퍼는 다른 유형의 응답 인스턴스를 생성하는 데 사용할 수 있습니다. `response` 헬퍼가 인수 없이 호출되면 `Illuminate\Contracts\Routing\ResponseFactory` [계약](/docs/{{version}}/contracts)의 구현이 반환됩니다. 이 계약은 응답을 생성하기 위한 여러 유용한 메서드를 제공합니다.

<a name="view-responses"></a>
### 뷰 응답

응답의 상태와 헤더를 제어해야 하지만 응답의 콘텐츠로 [뷰](/docs/{{version}}/views)를 반환해야 하는 경우 `view` 메서드를 사용해야 합니다.

```php
return response()
    ->view('hello', $data, 200)
    ->header('Content-Type', $type);
```

물론, 커스텀 HTTP 상태 코드나 커스텀 헤더를 전달할 필요가 없다면 전역 `view` 헬퍼 함수를 사용할 수 있습니다.

<a name="json-responses"></a>
### JSON 응답

`json` 메서드는 자동으로 `Content-Type` 헤더를 `application/json`으로 설정하고 `json_encode` PHP 함수를 사용하여 주어진 배열을 JSON으로 변환합니다.

```php
return response()->json([
    'name' => 'Abigail',
    'state' => 'CA',
]);
```

JSONP 응답을 생성하려면 `json` 메서드를 `withCallback` 메서드와 함께 사용할 수 있습니다.

```php
return response()
    ->json(['name' => 'Abigail', 'state' => 'CA'])
    ->withCallback($request->input('callback'));
```

<a name="file-downloads"></a>
### 파일 다운로드

`download` 메서드는 사용자의 브라우저가 주어진 경로의 파일을 다운로드하도록 강제하는 응답을 생성하는 데 사용할 수 있습니다. `download` 메서드는 메서드의 두 번째 인수로 파일명을 받으며, 이것은 파일을 다운로드하는 사용자에게 보여지는 파일명을 결정합니다. 마지막으로 HTTP 헤더 배열을 메서드의 세 번째 인수로 전달할 수 있습니다.

```php
return response()->download($pathToFile);

return response()->download($pathToFile, $name, $headers);
```

> [!WARNING]
> 파일 다운로드를 관리하는 Symfony HttpFoundation은 다운로드되는 파일이 ASCII 파일명을 가져야 합니다.

<a name="streamed-downloads"></a>
#### 스트리밍 다운로드

때로는 특정 작업의 문자열 응답을 디스크에 쓰지 않고 다운로드 가능한 응답으로 변환하고 싶을 수 있습니다. 이 시나리오에서는 `streamDownload` 메서드를 사용할 수 있습니다. 이 메서드는 콜백, 파일명, 그리고 선택적 헤더 배열을 인수로 받습니다.

```php
use App\Services\GitHub;

return response()->streamDownload(function () {
    echo GitHub::api('repo')
                ->contents()
                ->readme('laravel', 'laravel')['contents'];
}, 'laravel-readme.md');
```

<a name="file-responses"></a>
### 파일 응답

`file` 메서드는 다운로드를 시작하는 대신 이미지나 PDF와 같은 파일을 사용자의 브라우저에 직접 표시하는 데 사용할 수 있습니다. 이 메서드는 첫 번째 인수로 파일의 절대 경로를, 두 번째 인수로 헤더 배열을 받습니다.

```php
return response()->file($pathToFile);

return response()->file($pathToFile, $headers);
```

<a name="response-macros"></a>
## 응답 매크로

다양한 라우트와 컨트롤러에서 재사용할 수 있는 커스텀 응답을 정의하려면 `Response` 파사드의 `macro` 메서드를 사용할 수 있습니다. 일반적으로 `App\Providers\AppServiceProvider` 서비스 프로바이더와 같은 애플리케이션의 [서비스 프로바이더](/docs/{{version}}/providers) 중 하나의 `boot` 메서드에서 이 메서드를 호출해야 합니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Response::macro('caps', function (string $value) {
            return Response::make(strtoupper($value));
        });
    }
}
```

`macro` 함수는 첫 번째 인수로 이름을, 두 번째 인수로 클로저를 받습니다. 매크로의 클로저는 `ResponseFactory` 구현 또는 `response` 헬퍼에서 매크로 이름을 호출할 때 실행됩니다.

```php
return response()->caps('foo');
```

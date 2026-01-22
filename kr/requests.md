# HTTP 요청(Requests)

- [소개](#introduction)
- [요청과 상호작용하기](#interacting-with-the-request)
    - [요청 액세스하기](#accessing-the-request)
    - [요청 경로, 호스트, 메소드](#request-path-and-method)
    - [요청 헤더](#request-headers)
    - [요청 IP 주소](#request-ip-address)
    - [컨텐츠 협상](#content-negotiation)
    - [PSR-7 요청](#psr7-requests)
- [입력](#input)
    - [입력 조회하기](#retrieving-input)
    - [입력 존재 여부 확인](#input-presence)
    - [추가 입력 병합하기](#merging-additional-input)
    - [이전 입력](#old-input)
    - [쿠키](#cookies)
    - [입력값 트리밍과 정규화](#input-trimming-and-normalization)
- [파일](#files)
    - [업로드된 파일 조회하기](#retrieving-uploaded-files)
    - [업로드된 파일 저장하기](#storing-uploaded-files)
- [신뢰할 수 있는 프록시 설정](#configuring-trusted-proxies)
- [신뢰할 수 있는 호스트 설정](#configuring-trusted-hosts)

<a name="introduction"></a>
## 소개

Laravel의 `Illuminate\Http\Request` 클래스는 애플리케이션에서 처리 중인 현재 HTTP 요청과 상호작용하고, 요청과 함께 제출된 입력값, 쿠키, 파일을 조회할 수 있는 객체 지향적인 방법을 제공합니다.

<a name="interacting-with-the-request"></a>
## 요청과 상호작용하기

<a name="accessing-the-request"></a>
### 요청 액세스하기

의존성 주입(Dependency Injection)을 통해 현재 HTTP 요청의 인스턴스를 얻으려면, 라우트 클로저나 컨트롤러 메소드에서 `Illuminate\Http\Request` 클래스를 타입 힌트하면 됩니다. 들어오는 요청 인스턴스는 Laravel [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에 의해 자동으로 주입됩니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 새로운 사용자를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->input('name');

        // 사용자 저장...

        return redirect('/users');
    }
}
```

앞서 언급했듯이, 라우트 클로저에서도 `Illuminate\Http\Request` 클래스를 타입 힌트할 수 있습니다. 서비스 컨테이너는 클로저가 실행될 때 들어오는 요청을 자동으로 주입합니다.

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

<a name="dependency-injection-route-parameters"></a>
#### 의존성 주입과 라우트 파라미터

컨트롤러 메소드가 라우트 파라미터로부터 입력을 기대하는 경우, 다른 의존성 뒤에 라우트 파라미터를 나열해야 합니다. 예를 들어, 라우트가 다음과 같이 정의되어 있다면:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

다음과 같이 컨트롤러 메소드를 정의하여 `Illuminate\Http\Request`를 타입 힌트하고 `id` 라우트 파라미터에 접근할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 지정된 사용자를 업데이트합니다.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // 사용자 업데이트...

        return redirect('/users');
    }
}
```

<a name="request-path-and-method"></a>
### 요청 경로, 호스트, 메소드

`Illuminate\Http\Request` 인스턴스는 들어오는 HTTP 요청을 검사하기 위한 다양한 메소드를 제공하며, `Symfony\Component\HttpFoundation\Request` 클래스를 확장합니다. 아래에서 가장 중요한 몇 가지 메소드를 살펴보겠습니다.

<a name="retrieving-the-request-path"></a>
#### 요청 경로 조회하기

`path` 메소드는 요청의 경로 정보를 반환합니다. 따라서 들어오는 요청이 `http://example.com/foo/bar`를 대상으로 한다면, `path` 메소드는 `foo/bar`를 반환합니다.

```php
$uri = $request->path();
```

<a name="inspecting-the-request-path"></a>
#### 요청 경로 / 라우트 검사하기

`is` 메소드를 사용하면 들어오는 요청 경로가 주어진 패턴과 일치하는지 확인할 수 있습니다. 이 메소드를 사용할 때 `*` 문자를 와일드카드로 사용할 수 있습니다.

```php
if ($request->is('admin/*')) {
    // ...
}
```

`routeIs` 메소드를 사용하면 들어오는 요청이 [이름이 지정된 라우트(Named Route)](/docs/{{version}}/routing#named-routes)와 일치하는지 확인할 수 있습니다.

```php
if ($request->routeIs('admin.*')) {
    // ...
}
```

<a name="retrieving-the-request-url"></a>
#### 요청 URL 조회하기

들어오는 요청의 전체 URL을 조회하려면 `url` 또는 `fullUrl` 메소드를 사용할 수 있습니다. `url` 메소드는 쿼리 스트링 없이 URL을 반환하고, `fullUrl` 메소드는 쿼리 스트링을 포함합니다.

```php
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

현재 URL에 쿼리 스트링 데이터를 추가하고 싶다면 `fullUrlWithQuery` 메소드를 호출할 수 있습니다. 이 메소드는 주어진 쿼리 스트링 변수 배열을 현재 쿼리 스트링과 병합합니다.

```php
$request->fullUrlWithQuery(['type' => 'phone']);
```

특정 쿼리 스트링 파라미터를 제외한 현재 URL을 얻고 싶다면 `fullUrlWithoutQuery` 메소드를 사용할 수 있습니다.

```php
$request->fullUrlWithoutQuery(['type']);
```

<a name="retrieving-the-request-host"></a>
#### 요청 호스트 조회하기

`host`, `httpHost`, `schemeAndHttpHost` 메소드를 통해 들어오는 요청의 "호스트"를 조회할 수 있습니다.

```php
$request->host();
$request->httpHost();
$request->schemeAndHttpHost();
```

<a name="retrieving-the-request-method"></a>
#### 요청 메소드 조회하기

`method` 메소드는 요청의 HTTP 동사를 반환합니다. `isMethod` 메소드를 사용하여 HTTP 동사가 주어진 문자열과 일치하는지 확인할 수 있습니다.

```php
$method = $request->method();

if ($request->isMethod('post')) {
    // ...
}
```

<a name="request-headers"></a>
### 요청 헤더

`Illuminate\Http\Request` 인스턴스에서 `header` 메소드를 사용하여 요청 헤더를 조회할 수 있습니다. 헤더가 요청에 없으면 `null`이 반환됩니다. 하지만 `header` 메소드는 헤더가 요청에 없을 때 반환될 선택적인 두 번째 인수를 받습니다.

```php
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

`hasHeader` 메소드를 사용하여 요청에 특정 헤더가 포함되어 있는지 확인할 수 있습니다.

```php
if ($request->hasHeader('X-Header-Name')) {
    // ...
}
```

편의를 위해 `bearerToken` 메소드를 사용하여 `Authorization` 헤더에서 베어러 토큰을 조회할 수 있습니다. 해당 헤더가 없으면 빈 문자열이 반환됩니다.

```php
$token = $request->bearerToken();
```

<a name="request-ip-address"></a>
### 요청 IP 주소

`ip` 메소드를 사용하여 애플리케이션에 요청한 클라이언트의 IP 주소를 조회할 수 있습니다.

```php
$ipAddress = $request->ip();
```

프록시에 의해 전달된 모든 클라이언트 IP 주소를 포함하는 IP 주소 배열을 조회하려면 `ips` 메소드를 사용할 수 있습니다. "원래" 클라이언트 IP 주소는 배열의 맨 끝에 있습니다.

```php
$ipAddresses = $request->ips();
```

일반적으로 IP 주소는 신뢰할 수 없는 사용자 제어 입력으로 간주하고, 정보 제공 목적으로만 사용해야 합니다.

<a name="content-negotiation"></a>
### 컨텐츠 협상

Laravel은 `Accept` 헤더를 통해 들어오는 요청에서 요청된 컨텐츠 타입을 검사하는 여러 메소드를 제공합니다. 먼저, `getAcceptableContentTypes` 메소드는 요청에서 허용하는 모든 컨텐츠 타입을 포함하는 배열을 반환합니다.

```php
$contentTypes = $request->getAcceptableContentTypes();
```

`accepts` 메소드는 컨텐츠 타입 배열을 받아 요청에서 해당 컨텐츠 타입 중 하나라도 허용하면 `true`를 반환합니다. 그렇지 않으면 `false`가 반환됩니다.

```php
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

`prefers` 메소드를 사용하여 주어진 컨텐츠 타입 배열 중 요청에서 가장 선호하는 컨텐츠 타입을 결정할 수 있습니다. 제공된 컨텐츠 타입 중 어느 것도 요청에서 허용하지 않으면 `null`이 반환됩니다.

```php
$preferred = $request->prefers(['text/html', 'application/json']);
```

많은 애플리케이션이 HTML 또는 JSON만 제공하므로, `expectsJson` 메소드를 사용하여 들어오는 요청이 JSON 응답을 기대하는지 빠르게 확인할 수 있습니다.

```php
if ($request->expectsJson()) {
    // ...
}
```

<a name="psr7-requests"></a>
### PSR-7 요청

[PSR-7 표준](https://www.php-fig.org/psr/psr-7/)은 요청과 응답을 포함한 HTTP 메시지의 인터페이스를 지정합니다. Laravel 요청 대신 PSR-7 요청의 인스턴스를 얻으려면, 먼저 몇 가지 라이브러리를 설치해야 합니다. Laravel은 *Symfony HTTP Message Bridge* 컴포넌트를 사용하여 일반적인 Laravel 요청과 응답을 PSR-7 호환 구현으로 변환합니다.

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

이러한 라이브러리를 설치한 후, 라우트 클로저나 컨트롤러 메소드에서 요청 인터페이스를 타입 힌트하여 PSR-7 요청을 얻을 수 있습니다.

```php
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    // ...
});
```

> [!NOTE]
> 라우트나 컨트롤러에서 PSR-7 응답 인스턴스를 반환하면, 자동으로 Laravel 응답 인스턴스로 다시 변환되어 프레임워크에 의해 표시됩니다.

<a name="input"></a>
## 입력

<a name="retrieving-input"></a>
### 입력 조회하기

<a name="retrieving-all-input-data"></a>
#### 모든 입력 데이터 조회하기

`all` 메소드를 사용하여 들어오는 요청의 모든 입력 데이터를 `array`로 조회할 수 있습니다. 이 메소드는 들어오는 요청이 HTML 폼에서 온 것이든 XHR 요청이든 상관없이 사용할 수 있습니다.

```php
$input = $request->all();
```

`collect` 메소드를 사용하면 들어오는 요청의 모든 입력 데이터를 [컬렉션(Collection)](/docs/{{version}}/collections)으로 조회할 수 있습니다.

```php
$input = $request->collect();
```

`collect` 메소드를 사용하면 들어오는 요청의 입력 중 일부만 컬렉션으로 조회할 수도 있습니다.

```php
$request->collect('users')->each(function (string $user) {
    // ...
});
```

<a name="retrieving-an-input-value"></a>
#### 입력값 조회하기

몇 가지 간단한 메소드를 사용하면, 요청에 사용된 HTTP 동사에 관계없이 `Illuminate\Http\Request` 인스턴스에서 모든 사용자 입력에 접근할 수 있습니다. HTTP 동사와 관계없이 `input` 메소드를 사용하여 사용자 입력을 조회할 수 있습니다.

```php
$name = $request->input('name');
```

`input` 메소드의 두 번째 인수로 기본값을 전달할 수 있습니다. 요청된 입력값이 요청에 없을 경우 이 값이 반환됩니다.

```php
$name = $request->input('name', 'Sally');
```

배열 입력을 포함하는 폼으로 작업할 때, "점" 표기법을 사용하여 배열에 접근합니다.

```php
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

인수 없이 `input` 메소드를 호출하면 모든 입력값을 연관 배열로 조회할 수 있습니다.

```php
$input = $request->input();
```

<a name="retrieving-input-from-the-query-string"></a>
#### 쿼리 스트링에서 입력 조회하기

`input` 메소드는 전체 요청 페이로드(쿼리 스트링 포함)에서 값을 조회하지만, `query` 메소드는 쿼리 스트링에서만 값을 조회합니다.

```php
$name = $request->query('name');
```

요청된 쿼리 스트링 값이 없을 경우, 이 메소드의 두 번째 인수가 반환됩니다.

```php
$name = $request->query('name', 'Helen');
```

인수 없이 `query` 메소드를 호출하면 모든 쿼리 스트링 값을 연관 배열로 조회할 수 있습니다.

```php
$query = $request->query();
```

<a name="retrieving-json-input-values"></a>
#### JSON 입력값 조회하기

애플리케이션에 JSON 요청을 보낼 때, 요청의 `Content-Type` 헤더가 `application/json`으로 올바르게 설정되어 있다면 `input` 메소드를 통해 JSON 데이터에 접근할 수 있습니다. "점" 구문을 사용하여 JSON 배열 / 객체 내에 중첩된 값을 조회할 수도 있습니다.

```php
$name = $request->input('user.name');
```

<a name="retrieving-stringable-input-values"></a>
#### Stringable 입력값 조회하기

요청의 입력 데이터를 원시 `string`으로 조회하는 대신, `string` 메소드를 사용하여 요청 데이터를 [Illuminate\Support\Stringable](/docs/{{version}}/strings) 인스턴스로 조회할 수 있습니다.

```php
$name = $request->string('name')->trim();
```

<a name="retrieving-integer-input-values"></a>
#### 정수 입력값 조회하기

입력값을 정수로 조회하려면 `integer` 메소드를 사용할 수 있습니다. 이 메소드는 입력값을 정수로 캐스팅하려고 시도합니다. 입력이 없거나 캐스팅에 실패하면 지정한 기본값을 반환합니다. 이는 페이지네이션이나 기타 숫자 입력에 특히 유용합니다.

```php
$perPage = $request->integer('per_page');
```

<a name="retrieving-boolean-input-values"></a>
#### 불리언 입력값 조회하기

체크박스와 같은 HTML 요소를 다룰 때, 애플리케이션은 실제로 문자열인 "truthy" 값을 받을 수 있습니다. 예를 들어, "true" 또는 "on"입니다. 편의를 위해 `boolean` 메소드를 사용하여 이러한 값을 불리언으로 조회할 수 있습니다. `boolean` 메소드는 1, "1", true, "true", "on", "yes"에 대해 `true`를 반환합니다. 다른 모든 값은 `false`를 반환합니다.

```php
$archived = $request->boolean('archived');
```

<a name="retrieving-date-input-values"></a>
#### 날짜 입력값 조회하기

편의를 위해 날짜 / 시간을 포함하는 입력값은 `date` 메소드를 사용하여 Carbon 인스턴스로 조회할 수 있습니다. 요청에 주어진 이름의 입력값이 없으면 `null`이 반환됩니다.

```php
$birthday = $request->date('birthday');
```

`date` 메소드가 받는 두 번째와 세 번째 인수는 각각 날짜의 형식과 타임존을 지정하는 데 사용할 수 있습니다.

```php
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

입력값이 있지만 형식이 잘못된 경우 `InvalidArgumentException`이 발생합니다. 따라서 `date` 메소드를 호출하기 전에 입력을 유효성 검사하는 것이 좋습니다.

<a name="retrieving-enum-input-values"></a>
#### Enum 입력값 조회하기

[PHP 열거형(Enum)](https://www.php.net/manual/en/language.types.enumerations.php)에 해당하는 입력값도 요청에서 조회할 수 있습니다. 요청에 주어진 이름의 입력값이 없거나 입력값과 일치하는 백킹 값이 열거형에 없으면 `null`이 반환됩니다. `enum` 메소드는 입력값의 이름과 열거형 클래스를 첫 번째와 두 번째 인수로 받습니다.

```php
use App\Enums\Status;

$status = $request->enum('status', Status::class);
```

입력값이 PHP 열거형에 해당하는 값의 배열인 경우, `enums` 메소드를 사용하여 값 배열을 열거형 인스턴스로 조회할 수 있습니다.

```php
use App\Enums\Product;

$products = $request->enums('products', Product::class);
```

<a name="retrieving-input-via-dynamic-properties"></a>
#### 동적 속성을 통한 입력 조회

`Illuminate\Http\Request` 인스턴스에서 동적 속성을 사용하여 사용자 입력에 접근할 수도 있습니다. 예를 들어, 애플리케이션의 폼 중 하나에 `name` 필드가 포함되어 있다면, 다음과 같이 필드의 값에 접근할 수 있습니다.

```php
$name = $request->name;
```

동적 속성을 사용할 때, Laravel은 먼저 요청 페이로드에서 파라미터 값을 찾습니다. 없으면 Laravel은 일치하는 라우트의 파라미터에서 필드를 검색합니다.

<a name="retrieving-a-portion-of-the-input-data"></a>
#### 입력 데이터의 일부 조회하기

입력 데이터의 하위 집합을 조회해야 하는 경우 `only` 및 `except` 메소드를 사용할 수 있습니다. 이 두 메소드는 단일 `array` 또는 동적 인수 목록을 받습니다.

```php
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> [!WARNING]
> `only` 메소드는 요청한 모든 키 / 값 쌍을 반환합니다. 하지만 요청에 없는 키 / 값 쌍은 반환하지 않습니다.

<a name="input-presence"></a>
### 입력 존재 여부 확인

`has` 메소드를 사용하여 요청에 값이 있는지 확인할 수 있습니다. `has` 메소드는 값이 요청에 있으면 `true`를 반환합니다.

```php
if ($request->has('name')) {
    // ...
}
```

배열이 주어지면 `has` 메소드는 지정된 모든 값이 있는지 확인합니다.

```php
if ($request->has(['name', 'email'])) {
    // ...
}
```

`hasAny` 메소드는 지정된 값 중 하나라도 있으면 `true`를 반환합니다.

```php
if ($request->hasAny(['name', 'email'])) {
    // ...
}
```

`whenHas` 메소드는 요청에 값이 있으면 주어진 클로저를 실행합니다.

```php
$request->whenHas('name', function (string $input) {
    // ...
});
```

`whenHas` 메소드에 두 번째 클로저를 전달하면, 지정된 값이 요청에 없을 때 실행됩니다.

```php
$request->whenHas('name', function (string $input) {
    // "name" 값이 있습니다...
}, function () {
    // "name" 값이 없습니다...
});
```

요청에 값이 있고 빈 문자열이 아닌지 확인하려면 `filled` 메소드를 사용할 수 있습니다.

```php
if ($request->filled('name')) {
    // ...
}
```

요청에서 값이 누락되었거나 빈 문자열인지 확인하려면 `isNotFilled` 메소드를 사용할 수 있습니다.

```php
if ($request->isNotFilled('name')) {
    // ...
}
```

배열이 주어지면 `isNotFilled` 메소드는 지정된 모든 값이 누락되었거나 비어 있는지 확인합니다.

```php
if ($request->isNotFilled(['name', 'email'])) {
    // ...
}
```

`anyFilled` 메소드는 지정된 값 중 하나라도 빈 문자열이 아니면 `true`를 반환합니다.

```php
if ($request->anyFilled(['name', 'email'])) {
    // ...
}
```

`whenFilled` 메소드는 요청에 값이 있고 빈 문자열이 아니면 주어진 클로저를 실행합니다.

```php
$request->whenFilled('name', function (string $input) {
    // ...
});
```

`whenFilled` 메소드에 두 번째 클로저를 전달하면, 지정된 값이 "채워지지" 않았을 때 실행됩니다.

```php
$request->whenFilled('name', function (string $input) {
    // "name" 값이 채워졌습니다...
}, function () {
    // "name" 값이 채워지지 않았습니다...
});
```

요청에서 특정 키가 없는지 확인하려면 `missing` 및 `whenMissing` 메소드를 사용할 수 있습니다.

```php
if ($request->missing('name')) {
    // ...
}

$request->whenMissing('name', function () {
    // "name" 값이 없습니다...
}, function () {
    // "name" 값이 있습니다...
});
```

<a name="merging-additional-input"></a>
### 추가 입력 병합하기

때때로 요청의 기존 입력 데이터에 추가 입력을 수동으로 병합해야 할 수 있습니다. 이를 위해 `merge` 메소드를 사용할 수 있습니다. 주어진 입력 키가 이미 요청에 존재하면, `merge` 메소드에 제공된 데이터로 덮어씁니다.

```php
$request->merge(['votes' => 0]);
```

`mergeIfMissing` 메소드는 해당 키가 요청의 입력 데이터에 아직 존재하지 않을 때만 입력을 요청에 병합하는 데 사용할 수 있습니다.

```php
$request->mergeIfMissing(['votes' => 0]);
```

<a name="old-input"></a>
### 이전 입력

Laravel을 사용하면 한 요청의 입력을 다음 요청 동안 유지할 수 있습니다. 이 기능은 유효성 검사 오류를 감지한 후 폼을 다시 채우는 데 특히 유용합니다. 하지만 Laravel에 포함된 [유효성 검사 기능](/docs/{{version}}/validation)을 사용하고 있다면, Laravel의 내장 유효성 검사 기능이 자동으로 호출하므로 이러한 세션 입력 플래싱 메소드를 직접 수동으로 사용할 필요가 없을 수 있습니다.

<a name="flashing-input-to-the-session"></a>
#### 세션에 입력 플래싱하기

`Illuminate\Http\Request` 클래스의 `flash` 메소드는 현재 입력을 [세션(Session)](/docs/{{version}}/session)에 플래시하여 사용자의 다음 요청 동안 사용할 수 있게 합니다.

```php
$request->flash();
```

`flashOnly` 및 `flashExcept` 메소드를 사용하여 요청 데이터의 하위 집합을 세션에 플래시할 수도 있습니다. 이 메소드는 비밀번호와 같은 민감한 정보를 세션에서 제외하는 데 유용합니다.

```php
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

<a name="flashing-input-then-redirecting"></a>
#### 입력 플래싱 후 리다이렉트하기

입력을 세션에 플래시한 다음 이전 페이지로 리다이렉트하는 경우가 많으므로, `withInput` 메소드를 사용하여 리다이렉트에 입력 플래싱을 쉽게 연결할 수 있습니다.

```php
return redirect('/form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('/form')->withInput(
    $request->except('password')
);
```

<a name="retrieving-old-input"></a>
#### 이전 입력 조회하기

이전 요청에서 플래시된 입력을 조회하려면 `Illuminate\Http\Request` 인스턴스에서 `old` 메소드를 호출합니다. `old` 메소드는 [세션(Session)](/docs/{{version}}/session)에서 이전에 플래시된 입력 데이터를 가져옵니다.

```php
$username = $request->old('username');
```

Laravel은 전역 `old` 헬퍼도 제공합니다. [Blade 템플릿](/docs/{{version}}/blade) 내에서 이전 입력을 표시하는 경우, 폼을 다시 채우기 위해 `old` 헬퍼를 사용하는 것이 더 편리합니다. 주어진 필드에 대한 이전 입력이 없으면 `null`이 반환됩니다.

```blade
<input type="text" name="username" value="{{ old('username') }}">
```

<a name="cookies"></a>
### 쿠키

<a name="retrieving-cookies-from-requests"></a>
#### 요청에서 쿠키 조회하기

Laravel 프레임워크에서 생성된 모든 쿠키는 암호화되고 인증 코드로 서명되어 있어, 클라이언트에 의해 변경된 경우 무효한 것으로 간주됩니다. 요청에서 쿠키 값을 조회하려면 `Illuminate\Http\Request` 인스턴스에서 `cookie` 메소드를 사용합니다.

```php
$value = $request->cookie('name');
```

<a name="input-trimming-and-normalization"></a>
## 입력값 트리밍과 정규화

기본적으로 Laravel은 애플리케이션의 전역 미들웨어 스택에 `Illuminate\Foundation\Http\Middleware\TrimStrings` 및 `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` 미들웨어를 포함합니다. 이 미들웨어는 요청의 모든 문자열 필드를 자동으로 트리밍하고, 빈 문자열 필드를 `null`로 변환합니다. 이를 통해 라우트와 컨트롤러에서 이러한 정규화 문제를 걱정할 필요가 없습니다.

#### 입력 정규화 비활성화하기

모든 요청에 대해 이 동작을 비활성화하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `$middleware->remove` 메소드를 호출하여 두 미들웨어를 애플리케이션의 미들웨어 스택에서 제거할 수 있습니다.

```php
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;

->withMiddleware(function (Middleware $middleware) {
    $middleware->remove([
        ConvertEmptyStringsToNull::class,
        TrimStrings::class,
    ]);
})
```

애플리케이션에 대한 요청의 하위 집합에 대해 문자열 트리밍 및 빈 문자열 변환을 비활성화하려면, 애플리케이션의 `bootstrap/app.php` 파일 내에서 `trimStrings` 및 `convertEmptyStringsToNull` 미들웨어 메소드를 사용할 수 있습니다. 두 메소드 모두 입력 정규화를 건너뛸지 여부를 나타내기 위해 `true` 또는 `false`를 반환해야 하는 클로저 배열을 받습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->convertEmptyStringsToNull(except: [
        fn (Request $request) => $request->is('admin/*'),
    ]);

    $middleware->trimStrings(except: [
        fn (Request $request) => $request->is('admin/*'),
    ]);
})
```

<a name="files"></a>
## 파일

<a name="retrieving-uploaded-files"></a>
### 업로드된 파일 조회하기

`file` 메소드나 동적 속성을 사용하여 `Illuminate\Http\Request` 인스턴스에서 업로드된 파일을 조회할 수 있습니다. `file` 메소드는 PHP `SplFileInfo` 클래스를 확장하고 파일과 상호작용하기 위한 다양한 메소드를 제공하는 `Illuminate\Http\UploadedFile` 클래스의 인스턴스를 반환합니다.

```php
$file = $request->file('photo');

$file = $request->photo;
```

`hasFile` 메소드를 사용하여 요청에 파일이 있는지 확인할 수 있습니다.

```php
if ($request->hasFile('photo')) {
    // ...
}
```

<a name="validating-successful-uploads"></a>
#### 성공적인 업로드 유효성 검사

파일이 있는지 확인하는 것 외에도, `isValid` 메소드를 통해 파일 업로드에 문제가 없었는지 확인할 수 있습니다.

```php
if ($request->file('photo')->isValid()) {
    // ...
}
```

<a name="file-paths-extensions"></a>
#### 파일 경로와 확장자

`UploadedFile` 클래스에는 파일의 전체 경로와 확장자에 접근하는 메소드도 포함되어 있습니다. `extension` 메소드는 파일의 내용을 기반으로 파일의 확장자를 추측합니다. 이 확장자는 클라이언트가 제공한 확장자와 다를 수 있습니다.

```php
$path = $request->photo->path();

$extension = $request->photo->extension();
```

<a name="other-file-methods"></a>
#### 기타 파일 메소드

`UploadedFile` 인스턴스에서 사용할 수 있는 다양한 다른 메소드가 있습니다. 이러한 메소드에 대한 자세한 정보는 [클래스의 API 문서](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php)를 확인하세요.

<a name="storing-uploaded-files"></a>
### 업로드된 파일 저장하기

업로드된 파일을 저장하려면 일반적으로 설정된 [파일시스템(Filesystem)](/docs/{{version}}/filesystem) 중 하나를 사용합니다. `UploadedFile` 클래스에는 업로드된 파일을 로컬 파일시스템이나 Amazon S3와 같은 클라우드 스토리지 위치에 있는 디스크 중 하나로 이동하는 `store` 메소드가 있습니다.

`store` 메소드는 파일시스템의 설정된 루트 디렉토리를 기준으로 파일이 저장될 경로를 받습니다. 이 경로에는 파일 이름이 포함되지 않아야 합니다. 고유 ID가 파일 이름으로 자동 생성되기 때문입니다.

`store` 메소드는 파일을 저장하는 데 사용할 디스크 이름에 대한 선택적 두 번째 인수도 받습니다. 메소드는 디스크의 루트를 기준으로 한 파일 경로를 반환합니다.

```php
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

파일 이름이 자동으로 생성되지 않기를 원한다면, 경로, 파일 이름, 디스크 이름을 인수로 받는 `storeAs` 메소드를 사용할 수 있습니다.

```php
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> [!NOTE]
> Laravel의 파일 저장에 대한 자세한 정보는 전체 [파일 저장 문서](/docs/{{version}}/filesystem)를 확인하세요.

<a name="configuring-trusted-proxies"></a>
## 신뢰할 수 있는 프록시 설정

TLS / SSL 인증서를 종료하는 로드 밸런서 뒤에서 애플리케이션을 실행할 때, `url` 헬퍼를 사용할 때 애플리케이션이 때때로 HTTPS 링크를 생성하지 않는 것을 발견할 수 있습니다. 일반적으로 이는 애플리케이션이 로드 밸런서에서 포트 80으로 트래픽을 전달받고 있어 보안 링크를 생성해야 한다는 것을 알지 못하기 때문입니다.

이를 해결하려면, Laravel 애플리케이션에 포함된 `Illuminate\Http\Middleware\TrustProxies` 미들웨어를 활성화하여 애플리케이션이 신뢰해야 하는 로드 밸런서나 프록시를 빠르게 사용자 지정할 수 있습니다. 신뢰할 수 있는 프록시는 애플리케이션의 `bootstrap/app.php` 파일에서 `trustProxies` 미들웨어 메소드를 사용하여 지정해야 합니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: [
        '192.168.1.1',
        '10.0.0.0/8',
    ]);
})
```

신뢰할 수 있는 프록시를 설정하는 것 외에도, 신뢰해야 하는 프록시 헤더를 설정할 수도 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(headers: Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB
    );
})
```

> [!NOTE]
> AWS Elastic Load Balancing을 사용하는 경우, `headers` 값은 `Request::HEADER_X_FORWARDED_AWS_ELB`여야 합니다. 로드 밸런서가 [RFC 7239](https://www.rfc-editor.org/rfc/rfc7239#section-4)의 표준 `Forwarded` 헤더를 사용하는 경우, `headers` 값은 `Request::HEADER_FORWARDED`여야 합니다. `headers` 값에 사용할 수 있는 상수에 대한 자세한 정보는 Symfony의 [프록시 신뢰](https://symfony.com/doc/current/deployment/proxies.html) 문서를 확인하세요.

<a name="trusting-all-proxies"></a>
#### 모든 프록시 신뢰하기

Amazon AWS나 다른 "클라우드" 로드 밸런서 제공업체를 사용하는 경우, 실제 밸런서의 IP 주소를 알지 못할 수 있습니다. 이 경우 `*`를 사용하여 모든 프록시를 신뢰할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*');
})
```

<a name="configuring-trusted-hosts"></a>
## 신뢰할 수 있는 호스트 설정

기본적으로 Laravel은 HTTP 요청의 `Host` 헤더 내용에 관계없이 받는 모든 요청에 응답합니다. 또한 웹 요청 중에 애플리케이션에 대한 절대 URL을 생성할 때 `Host` 헤더의 값이 사용됩니다.

일반적으로 Nginx나 Apache와 같은 웹 서버를 설정하여 주어진 호스트명과 일치하는 요청만 애플리케이션에 보내도록 해야 합니다. 하지만 웹 서버를 직접 사용자 지정할 수 없고 Laravel이 특정 호스트명에만 응답하도록 지시해야 하는 경우, 애플리케이션에 대해 `Illuminate\Http\Middleware\TrustHosts` 미들웨어를 활성화할 수 있습니다.

`TrustHosts` 미들웨어를 활성화하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `trustHosts` 미들웨어 메소드를 호출해야 합니다. 이 메소드의 `at` 인수를 사용하여 애플리케이션이 응답해야 하는 호스트명을 지정할 수 있습니다. 다른 `Host` 헤더를 가진 들어오는 요청은 거부됩니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: ['laravel.test']);
})
```

기본적으로 애플리케이션 URL의 하위 도메인에서 오는 요청도 자동으로 신뢰됩니다. 이 동작을 비활성화하려면 `subdomains` 인수를 사용할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: ['laravel.test'], subdomains: false);
})
```

신뢰할 수 있는 호스트를 결정하기 위해 애플리케이션의 설정 파일이나 데이터베이스에 액세스해야 하는 경우, `at` 인수에 클로저를 제공할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustHosts(at: fn () => config('app.trusted_hosts'));
})
```

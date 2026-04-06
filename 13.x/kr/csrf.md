# CSRF 보호

- [소개](#csrf-introduction)
- [CSRF 요청 방지하기](#preventing-csrf-requests)
    - [Origin 검증](#origin-verification)
    - [URI 제외하기](#csrf-excluding-uris)
- [X-CSRF-Token](#csrf-x-csrf-token)
- [X-XSRF-Token](#csrf-x-xsrf-token)

<a name="csrf-introduction"></a>
## 소개

크로스 사이트 요청 위조(Cross-site request forgery)는 인증된 사용자를 대신하여 승인되지 않은 명령을 수행하는 악의적인 공격입니다. 다행히 Laravel은 [크로스 사이트 요청 위조](https://en.wikipedia.org/wiki/Cross-site_request_forgery) (CSRF) 공격으로부터 애플리케이션을 쉽게 보호할 수 있습니다.

<a name="csrf-explanation"></a>
#### 취약점에 대한 설명

크로스 사이트 요청 위조에 익숙하지 않다면, 이 취약점이 어떻게 악용될 수 있는지 예시를 통해 살펴보겠습니다. 애플리케이션에 인증된 사용자의 이메일 주소를 변경하기 위한 `POST` 요청을 받는 `/user/email` 라우트가 있다고 가정해 봅시다. 이 라우트는 사용자가 사용하고자 하는 이메일 주소를 포함하는 `email` 입력 필드를 기대할 것입니다.

CSRF 보호가 없다면, 악의적인 웹사이트가 여러분의 애플리케이션의 `/user/email` 라우트를 대상으로 하는 HTML 폼을 만들어 악의적인 사용자의 이메일 주소를 제출할 수 있습니다:

```blade
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

악의적인 웹사이트가 페이지 로드 시 자동으로 폼을 제출한다면, 악의적인 사용자는 여러분의 애플리케이션을 사용하는 의심 없는 사용자를 자신의 웹사이트로 유인하기만 하면 되며, 그러면 해당 사용자의 이메일 주소가 애플리케이션에서 변경됩니다.

이 취약점을 방지하기 위해, 악의적인 애플리케이션이 접근할 수 없는 비밀 세션 값을 확인하기 위해 모든 수신 `POST`, `PUT`, `PATCH`, 또는 `DELETE` 요청을 검사해야 합니다.

<a name="preventing-csrf-requests"></a>
## CSRF 요청 방지하기

기본적으로 `web` 미들웨어 그룹에 포함된 `Illuminate\Foundation\Http\Middleware\PreventRequestForgery` [미들웨어](/docs/{{version}}/middleware)는 이중 레이어 접근 방식을 사용하여 크로스 사이트 요청 위조로부터 애플리케이션을 보호합니다.

먼저, 미들웨어는 브라우저의 `Sec-Fetch-Site` 헤더를 확인합니다. 현대 브라우저는 모든 요청에 이 헤더를 자동으로 설정하여, 요청이 동일 출처, 동일 사이트, 또는 크로스 사이트 소스에서 비롯되었는지를 나타냅니다. 헤더가 동일 출처에서 온 요청임을 나타내면, 토큰 검증 없이 즉시 요청이 허용됩니다.

Origin 검증이 통과하지 못하는 경우 — 예를 들어, `Sec-Fetch-Site` 헤더를 보내지 않는 구형 브라우저에서의 요청이거나 연결이 안전하지 않은 경우 — 미들웨어는 기존의 CSRF 토큰 검증으로 폴백합니다.

Laravel은 애플리케이션이 관리하는 각 활성 [사용자 세션](/docs/{{version}}/session)에 대해 CSRF "토큰"을 자동으로 생성합니다. 이 토큰은 인증된 사용자가 실제로 애플리케이션에 요청을 보내는 사람인지 확인하는 데 사용됩니다. 이 토큰은 사용자의 세션에 저장되고 세션이 재생성될 때마다 변경되므로, 악의적인 애플리케이션은 이에 접근할 수 없습니다.

현재 세션의 CSRF 토큰은 요청의 세션 또는 `csrf_token` 헬퍼 함수를 통해 접근할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::get('/token', function (Request $request) {
    $token = $request->session()->token();

    $token = csrf_token();

    // ...
});
```

애플리케이션에서 "POST", "PUT", "PATCH", 또는 "DELETE" HTML 폼을 정의할 때마다, CSRF 보호 미들웨어가 요청을 검증할 수 있도록 폼에 숨겨진 CSRF `_token` 필드를 포함해야 합니다. 편의를 위해 `@csrf` Blade 지시어를 사용하여 숨겨진 토큰 입력 필드를 생성할 수 있습니다:

```blade
<form method="POST" action="/profile">
    @csrf

    <!-- 다음과 동일합니다... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

<a name="csrf-tokens-and-spas"></a>
#### CSRF 토큰 & SPA

Laravel을 API 백엔드로 사용하는 SPA를 구축하는 경우, API 인증 및 CSRF 취약점 방지에 대한 정보는 [Laravel Sanctum 문서](/docs/{{version}}/sanctum)를 참조하세요.

<a name="origin-verification"></a>
### Origin 검증

위에서 설명한 것처럼, Laravel의 요청 위조 방지 미들웨어는 먼저 `Sec-Fetch-Site` 헤더를 확인하여 요청이 동일 출처에서 온 것인지 판단합니다. 기본적으로 이 확인이 통과하지 못하면 미들웨어는 CSRF 토큰 검증으로 폴백합니다.

그러나 Origin 검증에만 의존하고 CSRF 토큰 폴백을 완전히 비활성화하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `preventRequestForgery` 메서드를 사용하면 됩니다.

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(originOnly: true);
})
```

Origin 전용 모드를 사용할 때, Origin 검증에 실패한 요청은 일반적으로 CSRF 토큰 불일치와 관련된 `419` 응답 대신 `403` HTTP 응답을 받습니다.

> [!WARNING]
> `Sec-Fetch-Site` 헤더는 안전한(HTTPS) 연결을 통해서만 브라우저에 의해 전송됩니다. 애플리케이션이 HTTPS로 서빙되지 않는 경우, Origin 검증을 사용할 수 없으며 미들웨어는 CSRF 토큰 검증으로 폴백합니다.

애플리케이션이 서브도메인의 요청을 수용해야 하는 경우(예: `dashboard.example.com`이 `example.com`의 요청을 수용), 동일 출처 요청 외에 동일 사이트 요청도 허용할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(allowSameSite: true);
})
```

<a name="csrf-excluding-uris"></a>
### CSRF 보호에서 URI 제외하기

때때로 일련의 URI를 CSRF 보호에서 제외하고 싶을 수 있습니다. 예를 들어, 결제 처리를 위해 [Stripe](https://stripe.com)를 사용하고 그들의 웹훅 시스템을 활용하는 경우, Stripe가 여러분의 라우트에 어떤 CSRF 토큰을 보내야 하는지 알지 못하므로 Stripe 웹훅 핸들러 라우트를 CSRF 보호에서 제외해야 합니다.

일반적으로 이러한 종류의 라우트는 Laravel이 `routes/web.php` 파일의 모든 라우트에 적용하는 `web` 미들웨어 그룹 외부에 배치해야 합니다. 그러나 애플리케이션의 `bootstrap/app.php` 파일에서 `preventRequestForgery` 메서드에 URI를 제공하여 특정 라우트를 제외할 수도 있습니다:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'stripe/*',
        'http://example.com/foo/bar',
        'http://example.com/foo/*',
    ]);
})
```

> [!NOTE]
> 편의를 위해, [테스트 실행](/docs/{{version}}/testing) 시 모든 라우트에 대해 CSRF 미들웨어가 자동으로 비활성화됩니다.

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

POST 매개변수로서 CSRF 토큰을 확인하는 것 외에도, `PreventRequestForgery` 미들웨어는 `X-CSRF-TOKEN` 요청 헤더도 확인합니다. 예를 들어, HTML `meta` 태그에 토큰을 저장할 수 있습니다:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

그런 다음, jQuery와 같은 라이브러리에 모든 요청 헤더에 자동으로 토큰을 추가하도록 지시할 수 있습니다. 이는 레거시 JavaScript 기술을 사용하는 AJAX 기반 애플리케이션에 대해 간단하고 편리한 CSRF 보호를 제공합니다:

```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

Laravel은 프레임워크가 생성하는 각 응답에 포함되는 암호화된 `XSRF-TOKEN` 쿠키에 현재 CSRF 토큰을 저장합니다. 쿠키 값을 사용하여 `X-XSRF-TOKEN` 요청 헤더를 설정할 수 있습니다.

이 쿠키는 주로 개발자 편의를 위해 전송됩니다. Angular 및 Axios와 같은 일부 JavaScript 프레임워크 및 라이브러리는 동일 출처 요청에서 자동으로 해당 값을 `X-XSRF-TOKEN` 헤더에 배치하기 때문입니다.

> [!NOTE]
> 기본적으로, `resources/js/bootstrap.js` 파일에는 자동으로 `X-XSRF-TOKEN` 헤더를 전송하는 Axios HTTP 라이브러리가 포함되어 있습니다.

# URL 생성

- [소개](#introduction)
- [기본 사항](#the-basics)
    - [URL 생성하기](#generating-urls)
    - [현재 URL 접근하기](#accessing-the-current-url)
- [이름이 지정된 라우트의 URL](#urls-for-named-routes)
    - [서명된 URL](#signed-urls)
- [컨트롤러 액션의 URL](#urls-for-controller-actions)
- [플루언트 URI 객체](#fluent-uri-objects)
- [기본값](#default-values)

<a name="introduction"></a>
## 소개

Laravel은 애플리케이션의 URL을 생성하는 데 도움이 되는 여러 헬퍼를 제공합니다. 이러한 헬퍼는 주로 템플릿과 API 응답에서 링크를 구축하거나, 애플리케이션의 다른 부분으로 리디렉션 응답을 생성할 때 유용합니다.

<a name="the-basics"></a>
## 기본 사항

<a name="generating-urls"></a>
### URL 생성하기

`url` 헬퍼를 사용하여 애플리케이션의 임의의 URL을 생성할 수 있습니다. 생성된 URL은 애플리케이션이 처리하는 현재 요청의 스킴(HTTP 또는 HTTPS)과 호스트를 자동으로 사용합니다.

```php
$post = App\Models\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

쿼리 문자열 파라미터가 포함된 URL을 생성하려면 `query` 메서드를 사용할 수 있습니다.

```php
echo url()->query('/posts', ['search' => 'Laravel']);

// https://example.com/posts?search=Laravel

echo url()->query('/posts?sort=latest', ['search' => 'Laravel']);

// http://example.com/posts?sort=latest&search=Laravel
```

경로에 이미 존재하는 쿼리 문자열 파라미터를 제공하면 기존 값을 덮어씁니다.

```php
echo url()->query('/posts?sort=latest', ['sort' => 'oldest']);

// http://example.com/posts?sort=oldest
```

값의 배열도 쿼리 파라미터로 전달할 수 있습니다. 이러한 값은 생성된 URL에서 적절하게 키가 지정되고 인코딩됩니다.

```php
echo $url = url()->query('/posts', ['columns' => ['title', 'body']]);

// http://example.com/posts?columns%5B0%5D=title&columns%5B1%5D=body

echo urldecode($url);

// http://example.com/posts?columns[0]=title&columns[1]=body
```

<a name="accessing-the-current-url"></a>
### 현재 URL 접근하기

`url` 헬퍼에 경로가 제공되지 않으면 `Illuminate\Routing\UrlGenerator` 인스턴스가 반환되어 현재 URL에 대한 정보에 접근할 수 있습니다.

```php
// 쿼리 문자열 없이 현재 URL 가져오기...
echo url()->current();

// 쿼리 문자열을 포함한 현재 URL 가져오기...
echo url()->full();
```

이러한 각 메서드는 `URL` [파사드(Facade)](/docs/{{version}}/facades)를 통해서도 접근할 수 있습니다.

```php
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a name="accessing-the-previous-url"></a>
#### 이전 URL 접근하기

사용자가 방문한 이전 URL을 알고 싶을 때가 있습니다. `url` 헬퍼의 `previous` 및 `previousPath` 메서드를 통해 이전 URL에 접근할 수 있습니다.

```php
// 이전 요청의 전체 URL 가져오기...
echo url()->previous();

// 이전 요청의 경로 가져오기...
echo url()->previousPath();
```

또는 [세션](/docs/{{version}}/session)을 통해 이전 URL을 [플루언트 URI](#fluent-uri-objects) 인스턴스로 접근할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::post('/users', function (Request $request) {
    $previousUri = $request->session()->previousUri();

    // ...
});
```

세션을 통해 이전에 방문한 URL의 라우트 이름을 가져올 수도 있습니다.

```php
$previousRoute = $request->session()->previousRoute();
```

<a name="urls-for-named-routes"></a>
## 이름이 지정된 라우트의 URL

`route` 헬퍼를 사용하여 [이름이 지정된 라우트](/docs/{{version}}/routing#named-routes)의 URL을 생성할 수 있습니다. 이름이 지정된 라우트를 사용하면 라우트에 정의된 실제 URL에 결합되지 않고도 URL을 생성할 수 있습니다. 따라서 라우트의 URL이 변경되더라도 `route` 함수 호출을 변경할 필요가 없습니다. 예를 들어, 애플리케이션에 다음과 같이 정의된 라우트가 있다고 가정해 보겠습니다.

```php
Route::get('/post/{post}', function (Post $post) {
    // ...
})->name('post.show');
```

이 라우트의 URL을 생성하려면 다음과 같이 `route` 헬퍼를 사용할 수 있습니다.

```php
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

물론 `route` 헬퍼는 여러 파라미터가 있는 라우트의 URL도 생성할 수 있습니다.

```php
Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
    // ...
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

라우트의 정의 파라미터에 해당하지 않는 추가 배열 요소는 URL의 쿼리 문자열에 추가됩니다.

```php
echo route('post.show', ['post' => 1, 'search' => 'rocket']);

// http://example.com/post/1?search=rocket
```

<a name="eloquent-models"></a>
#### Eloquent 모델

[Eloquent 모델](/docs/{{version}}/eloquent)의 라우트 키(일반적으로 기본 키)를 사용하여 URL을 생성하는 경우가 많습니다. 이러한 이유로 Eloquent 모델을 파라미터 값으로 전달할 수 있습니다. `route` 헬퍼는 자동으로 모델의 라우트 키를 추출합니다.

```php
echo route('post.show', ['post' => $post]);
```

<a name="signed-urls"></a>
### 서명된 URL

Laravel을 사용하면 이름이 지정된 라우트에 대한 "서명된" URL을 쉽게 생성할 수 있습니다. 이러한 URL에는 쿼리 문자열에 "서명" 해시가 추가되어 Laravel이 URL이 생성된 이후 수정되지 않았는지 확인할 수 있습니다. 서명된 URL은 공개적으로 접근 가능하지만 URL 조작에 대한 보호 계층이 필요한 라우트에 특히 유용합니다.

예를 들어, 서명된 URL을 사용하여 고객에게 이메일로 전송되는 공개 "구독 취소" 링크를 구현할 수 있습니다. 이름이 지정된 라우트에 대한 서명된 URL을 생성하려면 `URL` 파사드의 `signedRoute` 메서드를 사용하세요.

```php
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

`signedRoute` 메서드에 `absolute` 인수를 제공하여 서명된 URL 해시에서 도메인을 제외할 수 있습니다.

```php
return URL::signedRoute('unsubscribe', ['user' => 1], absolute: false);
```

지정된 시간이 지나면 만료되는 임시 서명된 라우트 URL을 생성하려면 `temporarySignedRoute` 메서드를 사용할 수 있습니다. Laravel이 임시 서명된 라우트 URL을 검증할 때, 서명된 URL에 인코딩된 만료 타임스탬프가 경과하지 않았는지 확인합니다.

```php
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->plus(minutes: 30), ['user' => 1]
);
```

<a name="validating-signed-route-requests"></a>
#### 서명된 라우트 요청 검증하기

들어오는 요청에 유효한 서명이 있는지 확인하려면, 들어오는 `Illuminate\Http\Request` 인스턴스에서 `hasValidSignature` 메서드를 호출해야 합니다.

```php
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

때때로 클라이언트 측 페이지네이션을 수행할 때와 같이 애플리케이션의 프론트엔드가 서명된 URL에 데이터를 추가할 수 있도록 허용해야 할 수 있습니다. 따라서 `hasValidSignatureWhileIgnoring` 메서드를 사용하여 서명된 URL을 검증할 때 무시해야 하는 요청 쿼리 파라미터를 지정할 수 있습니다. 파라미터를 무시하면 누구나 요청에서 해당 파라미터를 수정할 수 있다는 점을 기억하세요.

```php
if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
    abort(401);
}
```

들어오는 요청 인스턴스를 사용하여 서명된 URL을 검증하는 대신, `signed` (`Illuminate\Routing\Middleware\ValidateSignature`) [미들웨어(Middleware)](/docs/{{version}}/middleware)를 라우트에 할당할 수 있습니다. 들어오는 요청에 유효한 서명이 없으면 미들웨어가 자동으로 `403` HTTP 응답을 반환합니다.

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

서명된 URL이 URL 해시에 도메인을 포함하지 않는 경우, 미들웨어에 `relative` 인수를 제공해야 합니다.

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed:relative');
```

<a name="responding-to-invalid-signed-routes"></a>
#### 유효하지 않은 서명된 라우트에 응답하기

누군가 만료된 서명된 URL을 방문하면 `403` HTTP 상태 코드에 대한 일반 오류 페이지가 표시됩니다. 그러나 애플리케이션의 `bootstrap/app.php` 파일에서 `InvalidSignatureException` 예외에 대한 사용자 정의 "render" 클로저를 정의하여 이 동작을 커스터마이징할 수 있습니다.

```php
use Illuminate\Routing\Exceptions\InvalidSignatureException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (InvalidSignatureException $e) {
        return response()->view('errors.link-expired', status: 403);
    });
})
```

<a name="urls-for-controller-actions"></a>
## 컨트롤러 액션의 URL

`action` 함수는 주어진 컨트롤러 액션에 대한 URL을 생성합니다.

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

컨트롤러 메서드가 라우트 파라미터를 받는 경우, 함수의 두 번째 인수로 라우트 파라미터의 연관 배열을 전달할 수 있습니다.

```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="fluent-uri-objects"></a>
## 플루언트 URI 객체

Laravel의 `Uri` 클래스는 객체를 통해 URI를 생성하고 조작하기 위한 편리하고 플루언트한 인터페이스를 제공합니다. 이 클래스는 기본 League URI 패키지에서 제공하는 기능을 래핑하고 Laravel의 라우팅 시스템과 원활하게 통합됩니다.

정적 메서드를 사용하여 `Uri` 인스턴스를 쉽게 생성할 수 있습니다.

```php
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvokableController;
use Illuminate\Support\Uri;

// 주어진 문자열에서 URI 인스턴스 생성...
$uri = Uri::of('https://example.com/path');

// 경로, 이름이 지정된 라우트 또는 컨트롤러 액션에 대한 URI 인스턴스 생성...
$uri = Uri::to('/dashboard');
$uri = Uri::route('users.show', ['user' => 1]);
$uri = Uri::signedRoute('users.show', ['user' => 1]);
$uri = Uri::temporarySignedRoute('user.index', now()->plus(minutes: 5));
$uri = Uri::action([UserController::class, 'index']);
$uri = Uri::action(InvokableController::class);

// 현재 요청 URL에서 URI 인스턴스 생성...
$uri = $request->uri();

// 이전 요청 URL에서 URI 인스턴스 생성...
$uri = $request->session()->previousUri();
```

URI 인스턴스가 있으면 플루언트하게 수정할 수 있습니다.

```php
$uri = Uri::of('https://example.com')
    ->withScheme('http')
    ->withHost('test.com')
    ->withPort(8000)
    ->withPath('/users')
    ->withQuery(['page' => 2])
    ->withFragment('section-1');
```

플루언트 URI 객체 작업에 대한 자세한 내용은 [URI 문서](/docs/{{version}}/helpers#uri)를 참조하세요.

<a name="default-values"></a>
## 기본값

일부 애플리케이션의 경우 특정 URL 파라미터에 대해 요청 전체에 적용되는 기본값을 지정하고 싶을 수 있습니다. 예를 들어, 많은 라우트가 `{locale}` 파라미터를 정의한다고 가정해 보겠습니다.

```php
Route::get('/{locale}/posts', function () {
    // ...
})->name('post.index');
```

`route` 헬퍼를 호출할 때마다 항상 `locale`을 전달하는 것은 번거롭습니다. 따라서 `URL::defaults` 메서드를 사용하여 현재 요청 중에 항상 적용될 이 파라미터의 기본값을 정의할 수 있습니다. 현재 요청에 접근할 수 있도록 [라우트 미들웨어](/docs/{{version}}/middleware#assigning-middleware-to-routes)에서 이 메서드를 호출하는 것이 좋습니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class SetDefaultLocaleForUrls
{
    /**
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        URL::defaults(['locale' => $request->user()->locale]);

        return $next($request);
    }
}
```

`locale` 파라미터의 기본값이 설정되면 `route` 헬퍼를 통해 URL을 생성할 때 더 이상 해당 값을 전달할 필요가 없습니다.

<a name="url-defaults-middleware-priority"></a>
#### URL 기본값과 미들웨어 우선순위

URL 기본값을 설정하면 Laravel의 암시적 모델 바인딩 처리에 방해가 될 수 있습니다. 따라서 URL 기본값을 설정하는 [미들웨어의 우선순위를 지정](/docs/{{version}}/middleware#sorting-middleware)하여 Laravel의 자체 `SubstituteBindings` 미들웨어보다 먼저 실행되도록 해야 합니다. 애플리케이션의 `bootstrap/app.php` 파일에서 `priority` 미들웨어 메서드를 사용하여 이를 수행할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->prependToPriorityList(
        before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        prepend: \App\Http\Middleware\SetDefaultLocaleForUrls::class,
    );
})
```

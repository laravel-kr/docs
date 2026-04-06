# 유효성 검사(Validation)

- [소개](#introduction)
- [유효성 검사 빠르게 시작하기](#validation-quickstart)
    - [라우트 정의하기](#quick-defining-the-routes)
    - [컨트롤러 생성하기](#quick-creating-the-controller)
    - [유효성 검사 로직 작성하기](#quick-writing-the-validation-logic)
    - [유효성 검사 에러 표시하기](#quick-displaying-the-validation-errors)
    - [폼 다시 채우기](#repopulating-forms)
    - [선택적 필드에 대한 참고 사항](#a-note-on-optional-fields)
    - [유효성 검사 에러 응답 형식](#validation-error-response-format)
- [폼 요청 유효성 검사](#form-request-validation)
    - [폼 요청 생성하기](#creating-form-requests)
    - [폼 요청 권한 부여](#authorizing-form-requests)
    - [에러 메시지 커스터마이징](#customizing-the-error-messages)
    - [유효성 검사를 위한 입력 준비](#preparing-input-for-validation)
- [수동으로 유효성 검사기 생성하기](#manually-creating-validators)
    - [자동 리다이렉트](#automatic-redirection)
    - [이름이 지정된 에러 백](#named-error-bags)
    - [에러 메시지 커스터마이징](#manual-customizing-the-error-messages)
    - [추가 유효성 검사 수행하기](#performing-additional-validation)
- [유효성 검사된 입력 사용하기](#working-with-validated-input)
- [에러 메시지 다루기](#working-with-error-messages)
    - [언어 파일에서 사용자 정의 메시지 지정하기](#specifying-custom-messages-in-language-files)
    - [언어 파일에서 속성 지정하기](#specifying-attribute-in-language-files)
    - [언어 파일에서 값 지정하기](#specifying-values-in-language-files)
- [사용 가능한 유효성 검사 규칙](#available-validation-rules)
- [조건부로 규칙 추가하기](#conditionally-adding-rules)
- [배열 유효성 검사](#validating-arrays)
    - [중첩 배열 입력 유효성 검사](#validating-nested-array-input)
    - [에러 메시지 인덱스 및 위치](#error-message-indexes-and-positions)
- [파일 유효성 검사](#validating-files)
- [비밀번호 유효성 검사](#validating-passwords)
- [사용자 정의 유효성 검사 규칙](#custom-validation-rules)
    - [규칙 객체 사용하기](#using-rule-objects)
    - [클로저 사용하기](#using-closures)
    - [암묵적 규칙](#implicit-rules)

<a name="introduction"></a>
## 소개

Laravel은 애플리케이션의 들어오는 데이터를 유효성 검사하기 위한 여러 가지 접근 방식을 제공합니다. 가장 일반적인 방법은 모든 들어오는 HTTP 요청에서 사용 가능한 `validate` 메서드를 사용하는 것입니다. 그러나 다른 유효성 검사 접근 방식도 함께 다루겠습니다.

Laravel에는 데이터에 적용할 수 있는 다양하고 편리한 유효성 검사 규칙이 포함되어 있으며, 주어진 데이터베이스 테이블에서 값이 고유한지 유효성 검사하는 기능도 제공합니다. Laravel의 모든 유효성 검사 기능에 익숙해질 수 있도록 각 유효성 검사 규칙을 자세히 설명하겠습니다.

<a name="validation-quickstart"></a>
## 유효성 검사 빠르게 시작하기

Laravel의 강력한 유효성 검사 기능을 배우기 위해, 폼을 유효성 검사하고 사용자에게 에러 메시지를 다시 표시하는 완전한 예제를 살펴보겠습니다. 이 개요를 읽으면 Laravel을 사용하여 들어오는 요청 데이터의 유효성 검사 방법에 대한 전반적인 이해를 얻을 수 있습니다.

<a name="quick-defining-the-routes"></a>
### 라우트 정의하기

먼저 `routes/web.php` 파일에 다음 라우트가 정의되어 있다고 가정합니다.

```php
use App\Http\Controllers\PostController;

Route::get('/post/create', [PostController::class, 'create']);
Route::post('/post', [PostController::class, 'store']);
```

`GET` 라우트는 사용자가 새 블로그 게시물을 생성하기 위한 폼을 표시하고, `POST` 라우트는 새 블로그 게시물을 데이터베이스에 저장합니다.

<a name="quick-creating-the-controller"></a>
### 컨트롤러 생성하기

다음으로, 이 라우트들로 들어오는 요청을 처리하는 간단한 컨트롤러를 살펴보겠습니다. `store` 메서드는 지금은 비워두겠습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PostController extends Controller
{
    /**
     * 새 블로그 게시물을 생성하기 위한 폼을 보여줍니다.
     */
    public function create(): View
    {
        return view('post.create');
    }

    /**
     * 새 블로그 게시물을 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        // 블로그 게시물의 유효성을 검사하고 저장합니다...

        $post = /** ... */

        return to_route('post.show', ['post' => $post->id]);
    }
}
```

<a name="quick-writing-the-validation-logic"></a>
### 유효성 검사 로직 작성하기

이제 새 블로그 게시물의 유효성을 검사하는 로직으로 `store` 메서드를 채울 준비가 되었습니다. 이를 위해 `Illuminate\Http\Request` 객체가 제공하는 `validate` 메서드를 사용합니다. 유효성 검사 규칙이 통과하면 코드가 정상적으로 계속 실행됩니다. 그러나 유효성 검사가 실패하면 `Illuminate\Validation\ValidationException` 예외가 발생하고 적절한 에러 응답이 사용자에게 자동으로 반환됩니다.

전통적인 HTTP 요청 중에 유효성 검사가 실패하면 이전 URL로의 리다이렉트 응답이 생성됩니다. 들어오는 요청이 XHR 요청인 경우 [유효성 검사 에러 메시지를 포함하는 JSON 응답](#validation-error-response-format)이 반환됩니다.

`validate` 메서드를 더 잘 이해하기 위해 `store` 메서드로 다시 돌아가 보겠습니다.

```php
/**
 * 새 블로그 게시물을 저장합니다.
 */
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ]);

    // 블로그 게시물이 유효합니다...

    return redirect('/posts');
}
```

보시다시피 유효성 검사 규칙은 `validate` 메서드에 전달됩니다. 걱정하지 마세요 - 사용 가능한 모든 유효성 검사 규칙은 [문서화되어 있습니다](#available-validation-rules). 다시 말하지만, 유효성 검사가 실패하면 적절한 응답이 자동으로 생성됩니다. 유효성 검사가 통과하면 컨트롤러는 정상적으로 계속 실행됩니다.

또는 유효성 검사 규칙을 단일 `|` 구분 문자열 대신 규칙 배열로 지정할 수 있습니다.

```php
$validatedData = $request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

또한 `validateWithBag` 메서드를 사용하여 요청의 유효성을 검사하고 에러 메시지를 [이름이 지정된 에러 백](#named-error-bags) 내에 저장할 수 있습니다.

```php
$validatedData = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

<a name="stopping-on-first-validation-failure"></a>
#### 첫 번째 유효성 검사 실패 시 중지하기

때때로 첫 번째 유효성 검사 실패 후 속성에 대한 유효성 검사 규칙 실행을 중지하고 싶을 수 있습니다. 이렇게 하려면 `bail` 규칙을 속성에 할당합니다.

```php
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
    'body' => 'required',
]);
```

이 예제에서 `title` 속성의 `unique` 규칙이 실패하면 `max` 규칙은 검사되지 않습니다. 규칙은 할당된 순서대로 유효성 검사됩니다.

<a name="a-note-on-nested-attributes"></a>
#### 중첩 속성에 대한 참고 사항

들어오는 HTTP 요청에 "중첩된" 필드 데이터가 포함된 경우 "점" 구문을 사용하여 유효성 검사 규칙에서 이러한 필드를 지정할 수 있습니다.

```php
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'author.name' => 'required',
    'author.description' => 'required',
]);
```

반면에 필드 이름에 실제 마침표가 포함된 경우 백슬래시로 마침표를 이스케이프하여 이를 "점" 구문으로 해석되지 않도록 명시적으로 방지할 수 있습니다.

```php
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'v1\.0' => 'required',
]);
```

<a name="quick-displaying-the-validation-errors"></a>
### 유효성 검사 에러 표시하기

그렇다면 들어오는 요청 필드가 주어진 유효성 검사 규칙을 통과하지 못하면 어떻게 될까요? 앞서 언급했듯이 Laravel은 사용자를 자동으로 이전 위치로 리다이렉트합니다. 또한 모든 유효성 검사 에러와 [요청 입력](/docs/{{version}}/requests#retrieving-old-input)은 자동으로 [세션에 플래시됩니다](/docs/{{version}}/session#flash-data).

`$errors` 변수는 `web` 미들웨어 그룹에서 제공하는 `Illuminate\View\Middleware\ShareErrorsFromSession` 미들웨어에 의해 애플리케이션의 모든 뷰와 공유됩니다. 이 미들웨어가 적용되면 뷰에서 항상 `$errors` 변수를 사용할 수 있으므로 `$errors` 변수가 항상 정의되어 있고 안전하게 사용할 수 있다고 편리하게 가정할 수 있습니다. `$errors` 변수는 `Illuminate\Support\MessageBag`의 인스턴스가 됩니다. 이 객체 사용에 대한 자세한 정보는 [해당 문서를 확인하세요](#working-with-error-messages).

따라서 우리 예제에서 유효성 검사가 실패하면 사용자는 컨트롤러의 `create` 메서드로 리다이렉트되어 뷰에서 에러 메시지를 표시할 수 있습니다.

```blade
<!-- /resources/views/post/create.blade.php -->

<h1>Create Post</h1>

@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<!-- Create Post Form -->
```

<a name="quick-customizing-the-error-messages"></a>
#### 에러 메시지 커스터마이징

Laravel의 내장 유효성 검사 규칙 각각에는 애플리케이션의 `lang/en/validation.php` 파일에 위치한 에러 메시지가 있습니다. 애플리케이션에 `lang` 디렉토리가 없는 경우 `lang:publish` Artisan 명령을 사용하여 Laravel에 생성하도록 지시할 수 있습니다.

`lang/en/validation.php` 파일 내에서 각 유효성 검사 규칙에 대한 번역 항목을 찾을 수 있습니다. 애플리케이션의 필요에 따라 이러한 메시지를 자유롭게 변경하거나 수정할 수 있습니다.

또한 이 파일을 다른 언어 디렉토리에 복사하여 애플리케이션 언어에 맞게 메시지를 번역할 수 있습니다. Laravel 지역화에 대해 자세히 알아보려면 전체 [지역화 문서](/docs/{{version}}/localization)를 확인하세요.

> [!WARNING]
> 기본적으로 Laravel 애플리케이션 스켈레톤에는 `lang` 디렉토리가 포함되어 있지 않습니다. Laravel의 언어 파일을 커스터마이징하려면 `lang:publish` Artisan 명령을 통해 게시할 수 있습니다.

<a name="quick-xhr-requests-and-validation"></a>
#### XHR 요청과 유효성 검사

이 예제에서는 전통적인 폼을 사용하여 애플리케이션에 데이터를 전송했습니다. 그러나 많은 애플리케이션은 JavaScript 기반 프런트엔드에서 XHR 요청을 받습니다. XHR 요청 중에 `validate` 메서드를 사용할 때 Laravel은 리다이렉트 응답을 생성하지 않습니다. 대신 Laravel은 [모든 유효성 검사 에러를 포함하는 JSON 응답](#validation-error-response-format)을 생성합니다. 이 JSON 응답은 422 HTTP 상태 코드와 함께 전송됩니다.

<a name="the-at-error-directive"></a>
#### `@error` 지시문

`@error` [Blade](/docs/{{version}}/blade) 지시문을 사용하여 주어진 속성에 대한 유효성 검사 에러 메시지가 있는지 빠르게 확인할 수 있습니다. `@error` 지시문 내에서 `$message` 변수를 출력하여 에러 메시지를 표시할 수 있습니다.

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input
    id="title"
    type="text"
    name="title"
    class="@error('title') is-invalid @enderror"
/>

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

[이름이 지정된 에러 백](#named-error-bags)을 사용하는 경우 에러 백의 이름을 `@error` 지시문의 두 번째 인수로 전달할 수 있습니다.

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```

<a name="repopulating-forms"></a>
### 폼 다시 채우기

Laravel이 유효성 검사 에러로 인해 리다이렉트 응답을 생성할 때, 프레임워크는 자동으로 [요청의 모든 입력을 세션에 플래시합니다](/docs/{{version}}/session#flash-data). 이는 다음 요청 중에 입력에 편리하게 액세스하고 사용자가 제출하려고 시도한 폼을 다시 채울 수 있도록 하기 위한 것입니다.

이전 요청에서 플래시된 입력을 검색하려면 `Illuminate\Http\Request` 인스턴스에서 `old` 메서드를 호출합니다. `old` 메서드는 [세션](/docs/{{version}}/session)에서 이전에 플래시된 입력 데이터를 가져옵니다.

```php
$title = $request->old('title');
```

Laravel은 또한 전역 `old` 헬퍼를 제공합니다. [Blade 템플릿](/docs/{{version}}/blade) 내에서 이전 입력을 표시하는 경우 `old` 헬퍼를 사용하여 폼을 다시 채우는 것이 더 편리합니다. 주어진 필드에 대한 이전 입력이 없으면 `null`이 반환됩니다.

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

<a name="a-note-on-optional-fields"></a>
### 선택적 필드에 대한 참고 사항

기본적으로 Laravel은 애플리케이션의 전역 미들웨어 스택에 `TrimStrings` 및 `ConvertEmptyStringsToNull` 미들웨어를 포함합니다. 이 때문에 유효성 검사기가 `null` 값을 유효하지 않은 것으로 간주하지 않도록 하려면 "선택적" 요청 필드를 `nullable`로 표시해야 하는 경우가 많습니다. 예를 들면:

```php
$request->validate([
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
    'publish_at' => 'nullable|date',
]);
```

이 예제에서 `publish_at` 필드가 `null` 또는 유효한 날짜 표현일 수 있음을 지정하고 있습니다. `nullable` 수정자가 규칙 정의에 추가되지 않으면 유효성 검사기는 `null`을 유효하지 않은 날짜로 간주합니다.

<a name="validation-error-response-format"></a>
### 유효성 검사 에러 응답 형식

애플리케이션이 `Illuminate\Validation\ValidationException` 예외를 던지고 들어오는 HTTP 요청이 JSON 응답을 기대하는 경우, Laravel은 자동으로 에러 메시지를 형식화하고 `422 Unprocessable Entity` HTTP 응답을 반환합니다.

아래에서 유효성 검사 에러에 대한 JSON 응답 형식의 예를 검토할 수 있습니다. 중첩된 에러 키는 "점" 표기법 형식으로 평면화됩니다.

```json
{
    "message": "The team name must be a string. (and 4 more errors)",
    "errors": {
        "team_name": [
            "The team name must be a string.",
            "The team name must be at least 1 characters."
        ],
        "authorization.role": [
            "The selected authorization.role is invalid."
        ],
        "users.0.email": [
            "The users.0.email field is required."
        ],
        "users.2.email": [
            "The users.2.email must be a valid email address."
        ]
    }
}
```

<a name="form-request-validation"></a>
## 폼 요청 유효성 검사(Form Request Validation)

<a name="creating-form-requests"></a>
### 폼 요청 생성하기

더 복잡한 유효성 검사 시나리오의 경우 "폼 요청(form request)"을 생성할 수 있습니다. 폼 요청은 자체적인 유효성 검사 및 권한 부여 로직을 캡슐화하는 사용자 정의 요청 클래스입니다. 폼 요청 클래스를 생성하려면 `make:request` Artisan CLI 명령을 사용할 수 있습니다.

```shell
php artisan make:request StorePostRequest
```

생성된 폼 요청 클래스는 `app/Http/Requests` 디렉토리에 배치됩니다. 이 디렉토리가 존재하지 않으면 `make:request` 명령을 실행할 때 생성됩니다. Laravel에서 생성하는 각 폼 요청에는 `authorize`와 `rules` 두 가지 메서드가 있습니다.

짐작하셨겠지만 `authorize` 메서드는 현재 인증된 사용자가 요청으로 표현되는 작업을 수행할 수 있는지 확인하는 역할을 하고, `rules` 메서드는 요청 데이터에 적용해야 하는 유효성 검사 규칙을 반환합니다.

```php
/**
 * 요청에 적용되는 유효성 검사 규칙을 가져옵니다.
 *
 * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
 */
public function rules(): array
{
    return [
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ];
}
```

> [!NOTE]
> `rules` 메서드 시그니처 내에서 필요한 의존성을 타입 힌트로 지정할 수 있습니다. 이들은 Laravel [서비스 컨테이너](/docs/{{version}}/container)를 통해 자동으로 해결됩니다.

그렇다면 유효성 검사 규칙은 어떻게 평가될까요? 컨트롤러 메서드에서 요청을 타입 힌트로 지정하기만 하면 됩니다. 들어오는 폼 요청은 컨트롤러 메서드가 호출되기 전에 유효성 검사가 수행됩니다. 즉, 컨트롤러를 유효성 검사 로직으로 어지럽힐 필요가 없습니다.

```php
/**
 * 새 블로그 게시물을 저장합니다.
 */
public function store(StorePostRequest $request): RedirectResponse
{
    // 들어오는 요청이 유효합니다...

    // 유효성 검사된 입력 데이터를 검색합니다...
    $validated = $request->validated();

    // 유효성 검사된 입력 데이터의 일부를 검색합니다...
    $validated = $request->safe()->only(['name', 'email']);
    $validated = $request->safe()->except(['name', 'email']);

    // 블로그 게시물을 저장합니다...

    return redirect('/posts');
}
```

유효성 검사가 실패하면 사용자를 이전 위치로 보내는 리다이렉트 응답이 생성됩니다. 에러도 표시할 수 있도록 세션에 플래시됩니다. 요청이 XHR 요청인 경우 [유효성 검사 에러의 JSON 표현](#validation-error-response-format)을 포함하는 422 상태 코드의 HTTP 응답이 사용자에게 반환됩니다.

> [!NOTE]
> Inertia로 구동되는 Laravel 프런트엔드에 실시간 폼 요청 유효성 검사를 추가해야 합니까? [Laravel Precognition](/docs/{{version}}/precognition)을 확인하세요.

<a name="performing-additional-validation-on-form-requests"></a>
#### 추가 유효성 검사 수행하기

때때로 초기 유효성 검사가 완료된 후 추가 유효성 검사를 수행해야 할 때가 있습니다. 폼 요청의 `after` 메서드를 사용하여 이를 수행할 수 있습니다.

`after` 메서드는 유효성 검사가 완료된 후 호출될 callable 또는 클로저의 배열을 반환해야 합니다. 주어진 callable은 `Illuminate\Validation\Validator` 인스턴스를 받아 필요한 경우 추가 에러 메시지를 발생시킬 수 있습니다.

```php
use Illuminate\Validation\Validator;

/**
 * 요청에 대한 "after" 유효성 검사 callable을 가져옵니다.
 */
public function after(): array
{
    return [
        function (Validator $validator) {
            if ($this->somethingElseIsInvalid()) {
                $validator->errors()->add(
                    'field',
                    'Something is wrong with this field!'
                );
            }
        }
    ];
}
```

언급했듯이 `after` 메서드가 반환하는 배열에는 호출 가능한 클래스도 포함될 수 있습니다. 이러한 클래스의 `__invoke` 메서드는 `Illuminate\Validation\Validator` 인스턴스를 받습니다.

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;
use Illuminate\Validation\Validator;

/**
 * 요청에 대한 "after" 유효성 검사 callable을 가져옵니다.
 */
public function after(): array
{
    return [
        new ValidateUserStatus,
        new ValidateShippingTime,
        function (Validator $validator) {
            //
        }
    ];
}
```

<a name="request-stopping-on-first-validation-rule-failure"></a>
#### 첫 번째 유효성 검사 실패 시 중지하기

요청 클래스에 `StopOnFirstFailure` 어트리뷰트를 추가하면 단일 유효성 검사 실패가 발생하면 모든 속성의 유효성 검사를 중지해야 함을 유효성 검사기에 알릴 수 있습니다.

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\StopOnFirstFailure;
use Illuminate\Foundation\Http\FormRequest;

#[StopOnFirstFailure]
class StorePostRequest extends FormRequest
{
    // ...
}
```

<a name="customizing-the-redirect-location"></a>
#### 리다이렉트 위치 커스터마이징

폼 요청 유효성 검사가 실패하면 사용자를 이전 위치로 보내는 리다이렉트 응답이 생성됩니다. 그러나 이 동작을 자유롭게 커스터마이징할 수 있습니다. 이렇게 하려면 폼 요청에 `RedirectTo` 어트리뷰트를 사용할 수 있습니다:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\RedirectTo;
use Illuminate\Foundation\Http\FormRequest;

#[RedirectTo('/dashboard')]
class StorePostRequest extends FormRequest
{
    // ...
}
```

또는 사용자를 이름이 지정된 라우트로 리다이렉트하려면 대신 `RedirectToRoute` 어트리뷰트를 사용할 수 있습니다:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\RedirectToRoute;
use Illuminate\Foundation\Http\FormRequest;

#[RedirectToRoute('dashboard')]
class StorePostRequest extends FormRequest
{
    // ...
}
```

<a name="customizing-the-error-bag"></a>
#### 에러 백(Error Bag) 커스터마이징

폼 요청 유효성 검사가 실패하면 에러는 `default` 에러 백에 플래시됩니다. 에러를 다른 [이름이 지정된 에러 백](#named-error-bags)에 저장해야 하는 경우 폼 요청에 `ErrorBag` 어트리뷰트를 사용할 수 있습니다:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\ErrorBag;
use Illuminate\Foundation\Http\FormRequest;

#[ErrorBag('login')]
class LoginRequest extends FormRequest
{
    // ...
}
```

<a name="authorizing-form-requests"></a>
### 폼 요청 권한 부여

폼 요청 클래스에는 `authorize` 메서드도 포함되어 있습니다. 이 메서드 내에서 인증된 사용자가 실제로 주어진 리소스를 업데이트할 권한이 있는지 확인할 수 있습니다. 예를 들어 사용자가 업데이트하려는 블로그 댓글을 실제로 소유하고 있는지 확인할 수 있습니다. 대부분의 경우 이 메서드 내에서 [권한 부여 게이트 및 정책](/docs/{{version}}/authorization)과 상호 작용하게 됩니다.

```php
use App\Models\Comment;

/**
 * 사용자가 이 요청을 할 권한이 있는지 확인합니다.
 */
public function authorize(): bool
{
    $comment = Comment::find($this->route('comment'));

    return $comment && $this->user()->can('update', $comment);
}
```

모든 폼 요청은 기본 Laravel 요청 클래스를 확장하므로 `user` 메서드를 사용하여 현재 인증된 사용자에 액세스할 수 있습니다. 또한 위 예제에서 `route` 메서드 호출에 주목하세요. 이 메서드는 아래 예제의 `{comment}` 매개변수와 같이 호출되는 라우트에 정의된 URI 매개변수에 액세스할 수 있게 해줍니다.

```php
Route::post('/comment/{comment}');
```

따라서 애플리케이션이 [라우트 모델 바인딩](/docs/{{version}}/routing#route-model-binding)을 활용하고 있다면 해결된 모델을 요청의 속성으로 액세스하여 코드를 더욱 간결하게 만들 수 있습니다.

```php
return $this->user()->can('update', $this->comment);
```

`authorize` 메서드가 `false`를 반환하면 403 상태 코드의 HTTP 응답이 자동으로 반환되고 컨트롤러 메서드는 실행되지 않습니다.
애플리케이션의 다른 부분에서 요청에 대한 인가 로직을 처리할 계획이라면, `authorize` 메서드를 완전히 제거하거나 단순히 `true`를 반환하면 됩니다.

```php
/**
 * 사용자가 이 요청을 수행할 권한이 있는지 확인합니다.
 */
public function authorize(): bool
{
    return true;
}
```

> [!NOTE]
> `authorize` 메서드의 시그니처에서 필요한 모든 의존성을 타입힌트할 수 있습니다. 이들은 Laravel [서비스 컨테이너(Service Container)](/docs/{{version}}/container)를 통해 자동으로 해결됩니다.

<a name="customizing-the-error-messages"></a>
### 에러 메시지 커스터마이징

`messages` 메서드를 오버라이드하여 폼 요청에서 사용하는 에러 메시지를 커스터마이징할 수 있습니다. 이 메서드는 속성/규칙 쌍과 해당 에러 메시지의 배열을 반환해야 합니다.

```php
/**
 * 정의된 유효성 검사 규칙에 대한 에러 메시지를 가져옵니다.
 *
 * @return array<string, string>
 */
public function messages(): array
{
    return [
        'title.required' => 'A title is required',
        'body.required' => 'A message is required',
    ];
}
```

<a name="customizing-the-validation-attributes"></a>
#### 유효성 검사 속성 커스터마이징

Laravel의 많은 내장 유효성 검사 규칙 에러 메시지에는 `:attribute` 플레이스홀더가 포함되어 있습니다. 유효성 검사 메시지의 `:attribute` 플레이스홀더를 사용자 정의 속성 이름으로 대체하려면, `attributes` 메서드를 오버라이드하여 사용자 정의 이름을 지정할 수 있습니다. 이 메서드는 속성/이름 쌍의 배열을 반환해야 합니다.

```php
/**
 * 유효성 검사 오류에 대한 사용자 정의 속성을 가져옵니다.
 *
 * @return array<string, string>
 */
public function attributes(): array
{
    return [
        'email' => 'email address',
    ];
}
```

<a name="preparing-input-for-validation"></a>
### 유효성 검사를 위한 입력 준비

유효성 검사 규칙을 적용하기 전에 요청의 데이터를 준비하거나 정제해야 하는 경우, `prepareForValidation` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Str;

/**
 * 유효성 검사를 위해 데이터를 준비합니다.
 */
protected function prepareForValidation(): void
{
    $this->merge([
        'slug' => Str::slug($this->slug),
    ]);
}
```

마찬가지로, 유효성 검사가 완료된 후 요청 데이터를 정규화해야 하는 경우, `passedValidation` 메서드를 사용할 수 있습니다.

```php
/**
 * 유효성 검사 성공 시도를 처리합니다.
 */
protected function passedValidation(): void
{
    $this->replace(['name' => 'Taylor']);
}
```

<a name="manually-creating-validators"></a>
## 수동으로 Validator 생성하기

요청에서 `validate` 메서드를 사용하고 싶지 않다면, `Validator` [파사드(Facade)](/docs/{{version}}/facades)를 사용하여 수동으로 유효성 검사기 인스턴스를 생성할 수 있습니다. 파사드의 `make` 메서드는 새로운 유효성 검사기 인스턴스를 생성합니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * 새 블로그 게시물을 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
        ]);

        if ($validator->fails()) {
            return redirect('/post/create')
                ->withErrors($validator)
                ->withInput();
        }

        // 검증된 입력값 조회...
        $validated = $validator->validated();

        // 검증된 입력값의 일부 조회...
        $validated = $validator->safe()->only(['name', 'email']);
        $validated = $validator->safe()->except(['name', 'email']);

        // 블로그 게시물 저장...

        return redirect('/posts');
    }
}
```

`make` 메서드에 전달되는 첫 번째 인수는 유효성 검사할 데이터입니다. 두 번째 인수는 데이터에 적용해야 하는 유효성 검사 규칙의 배열입니다.

요청 유효성 검사가 실패했는지 확인한 후, `withErrors` 메서드를 사용하여 에러 메시지를 세션에 플래시할 수 있습니다. 이 메서드를 사용하면, 리다이렉션 후 `$errors` 변수가 자동으로 뷰와 공유되어 사용자에게 쉽게 표시할 수 있습니다. `withErrors` 메서드는 유효성 검사기, `MessageBag`, 또는 PHP `array`를 받습니다.

#### 첫 번째 유효성 검사 실패 시 중지

`stopOnFirstFailure` 메서드는 단일 유효성 검사 실패가 발생하면 모든 속성의 유효성 검사를 중지하도록 유효성 검사기에 알립니다.

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="automatic-redirection"></a>
### 자동 리다이렉션

유효성 검사기 인스턴스를 수동으로 생성하면서도 HTTP 요청의 `validate` 메서드가 제공하는 자동 리다이렉션 기능을 활용하고 싶다면, 기존 유효성 검사기 인스턴스에서 `validate` 메서드를 호출할 수 있습니다. 유효성 검사가 실패하면, 사용자가 자동으로 리다이렉션되거나, XHR 요청의 경우 [JSON 응답이 반환](#validation-error-response-format)됩니다.

```php
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validate();
```

유효성 검사가 실패할 경우 에러 메시지를 [이름이 지정된 에러 백(Named Error Bag)](#named-error-bags)에 저장하려면 `validateWithBag` 메서드를 사용할 수 있습니다.

```php
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validateWithBag('post');
```

<a name="named-error-bags"></a>
### 이름이 지정된 에러 백(Named Error Bags)

단일 페이지에 여러 폼이 있는 경우, 유효성 검사 오류가 포함된 `MessageBag`에 이름을 지정하여 특정 폼에 대한 에러 메시지를 조회할 수 있습니다. 이를 달성하려면, `withErrors`의 두 번째 인수로 이름을 전달하세요.

```php
return redirect('/register')->withErrors($validator, 'login');
```

그런 다음 `$errors` 변수에서 이름이 지정된 `MessageBag` 인스턴스에 접근할 수 있습니다.

```blade
{{ $errors->login->first('email') }}
```

<a name="manual-customizing-the-error-messages"></a>
### 에러 메시지 커스터마이징

필요한 경우, Laravel이 제공하는 기본 에러 메시지 대신 유효성 검사기 인스턴스가 사용할 사용자 정의 에러 메시지를 제공할 수 있습니다. 사용자 정의 메시지를 지정하는 방법은 여러 가지가 있습니다. 먼저, `Validator::make` 메서드의 세 번째 인수로 사용자 정의 메시지를 전달할 수 있습니다.

```php
$validator = Validator::make($input, $rules, $messages = [
    'required' => 'The :attribute field is required.',
]);
```

이 예제에서 `:attribute` 플레이스홀더는 유효성 검사 중인 필드의 실제 이름으로 대체됩니다. 유효성 검사 메시지에서 다른 플레이스홀더도 사용할 수 있습니다. 예를 들어:

```php
$messages = [
    'same' => 'The :attribute and :other must match.',
    'size' => 'The :attribute must be exactly :size.',
    'between' => 'The :attribute value :input is not between :min - :max.',
    'in' => 'The :attribute must be one of the following types: :values',
];
```

<a name="specifying-a-custom-message-for-a-given-attribute"></a>
#### 특정 속성에 대한 사용자 정의 메시지 지정

때로는 특정 속성에 대해서만 사용자 정의 에러 메시지를 지정하고 싶을 수 있습니다. "점" 표기법을 사용하여 이를 수행할 수 있습니다. 먼저 속성의 이름을 지정한 다음 규칙을 지정합니다.

```php
$messages = [
    'email.required' => 'We need to know your email address!',
];
```

<a name="specifying-custom-attribute-values"></a>
#### 사용자 정의 속성 값 지정

Laravel의 많은 내장 에러 메시지에는 유효성 검사 중인 필드 또는 속성의 이름으로 대체되는 `:attribute` 플레이스홀더가 포함되어 있습니다. 특정 필드에 대해 이러한 플레이스홀더를 대체하는 데 사용되는 값을 커스터마이징하려면, `Validator::make` 메서드의 네 번째 인수로 사용자 정의 속성 배열을 전달할 수 있습니다.

```php
$validator = Validator::make($input, $rules, $messages, [
    'email' => 'email address',
]);
```

<a name="performing-additional-validation"></a>
### 추가 유효성 검사 수행

때로는 초기 유효성 검사가 완료된 후 추가 유효성 검사를 수행해야 할 수 있습니다. 유효성 검사기의 `after` 메서드를 사용하여 이를 수행할 수 있습니다. `after` 메서드는 유효성 검사가 완료된 후 호출될 클로저 또는 호출 가능한 배열을 받습니다. 주어진 콜러블은 `Illuminate\Validation\Validator` 인스턴스를 받아 필요한 경우 추가 에러 메시지를 발생시킬 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make(/* ... */);

$validator->after(function ($validator) {
    if ($this->somethingElseIsInvalid()) {
        $validator->errors()->add(
            'field', 'Something is wrong with this field!'
        );
    }
});

if ($validator->fails()) {
    // ...
}
```

언급했듯이, `after` 메서드는 호출 가능한 배열도 받습니다. 이는 "유효성 검사 후" 로직이 `__invoke` 메서드를 통해 `Illuminate\Validation\Validator` 인스턴스를 받는 호출 가능한 클래스에 캡슐화된 경우 특히 편리합니다.

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;

$validator->after([
    new ValidateUserStatus,
    new ValidateShippingTime,
    function ($validator) {
        // ...
    },
]);
```

<a name="working-with-validated-input"></a>
## 검증된 입력값 다루기

폼 요청 또는 수동으로 생성한 유효성 검사기 인스턴스를 사용하여 들어오는 요청 데이터의 유효성을 검사한 후, 실제로 유효성 검사를 거친 들어오는 요청 데이터를 조회하고 싶을 수 있습니다. 이는 여러 가지 방법으로 수행할 수 있습니다. 먼저, 폼 요청 또는 유효성 검사기 인스턴스에서 `validated` 메서드를 호출할 수 있습니다. 이 메서드는 유효성 검사된 데이터의 배열을 반환합니다.

```php
$validated = $request->validated();

$validated = $validator->validated();
```

또는 폼 요청 또는 유효성 검사기 인스턴스에서 `safe` 메서드를 호출할 수 있습니다. 이 메서드는 `Illuminate\Support\ValidatedInput` 인스턴스를 반환합니다. 이 객체는 검증된 데이터의 하위 집합 또는 전체 검증된 데이터 배열을 조회하기 위한 `only`, `except`, `all` 메서드를 노출합니다.

```php
$validated = $request->safe()->only(['name', 'email']);

$validated = $request->safe()->except(['name', 'email']);

$validated = $request->safe()->all();
```

또한, `Illuminate\Support\ValidatedInput` 인스턴스는 배열처럼 반복하거나 접근할 수 있습니다.

```php
// 검증된 데이터는 반복할 수 있습니다...
foreach ($request->safe() as $key => $value) {
    // ...
}

// 검증된 데이터는 배열로 접근할 수 있습니다...
$validated = $request->safe();

$email = $validated['email'];
```

검증된 데이터에 추가 필드를 추가하려면 `merge` 메서드를 호출할 수 있습니다.

```php
$validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

검증된 데이터를 [컬렉션(Collection)](/docs/{{version}}/collections) 인스턴스로 조회하려면 `collect` 메서드를 호출할 수 있습니다.

```php
$collection = $request->safe()->collect();
```

<a name="working-with-error-messages"></a>
## 에러 메시지 다루기

`Validator` 인스턴스에서 `errors` 메서드를 호출하면, 에러 메시지를 다루기 위한 다양한 편리한 메서드를 가진 `Illuminate\Support\MessageBag` 인스턴스를 받게 됩니다. 모든 뷰에서 자동으로 사용할 수 있는 `$errors` 변수도 `MessageBag` 클래스의 인스턴스입니다.

<a name="retrieving-the-first-error-message-for-a-field"></a>
#### 필드의 첫 번째 에러 메시지 조회

주어진 필드에 대한 첫 번째 에러 메시지를 조회하려면 `first` 메서드를 사용하세요.

```php
$errors = $validator->errors();

echo $errors->first('email');
```

<a name="retrieving-all-error-messages-for-a-field"></a>
#### 필드의 모든 에러 메시지 조회

주어진 필드에 대한 모든 메시지의 배열을 조회해야 하는 경우 `get` 메서드를 사용하세요.

```php
foreach ($errors->get('email') as $message) {
    // ...
}
```

배열 폼 필드의 유효성을 검사하는 경우, `*` 문자를 사용하여 각 배열 요소에 대한 모든 메시지를 조회할 수 있습니다.

```php
foreach ($errors->get('attachments.*') as $message) {
    // ...
}
```

<a name="retrieving-all-error-messages-for-all-fields"></a>
#### 모든 필드의 모든 에러 메시지 조회

모든 필드에 대한 모든 메시지의 배열을 조회하려면 `all` 메서드를 사용하세요.

```php
foreach ($errors->all() as $message) {
    // ...
}
```

<a name="determining-if-messages-exist-for-a-field"></a>
#### 필드에 메시지가 있는지 확인

`has` 메서드를 사용하여 주어진 필드에 에러 메시지가 있는지 확인할 수 있습니다.

```php
if ($errors->has('email')) {
    // ...
}
```

<a name="specifying-custom-messages-in-language-files"></a>
### 언어 파일에서 사용자 정의 메시지 지정

Laravel의 각 내장 유효성 검사 규칙에는 애플리케이션의 `lang/en/validation.php` 파일에 있는 에러 메시지가 있습니다. 애플리케이션에 `lang` 디렉토리가 없는 경우, `lang:publish` Artisan 명령을 사용하여 Laravel이 생성하도록 할 수 있습니다.

`lang/en/validation.php` 파일 내에서 각 유효성 검사 규칙에 대한 번역 항목을 찾을 수 있습니다. 애플리케이션의 필요에 따라 이러한 메시지를 자유롭게 변경하거나 수정할 수 있습니다.

또한, 이 파일을 다른 언어 디렉토리에 복사하여 애플리케이션의 언어에 맞게 메시지를 번역할 수 있습니다. Laravel 현지화에 대해 더 알아보려면 전체 [현지화 문서](/docs/{{version}}/localization)를 확인하세요.

> [!WARNING]
> 기본적으로 Laravel 애플리케이션 스켈레톤에는 `lang` 디렉토리가 포함되어 있지 않습니다. Laravel의 언어 파일을 커스터마이징하려면 `lang:publish` Artisan 명령을 통해 발행할 수 있습니다.

<a name="custom-messages-for-specific-attributes"></a>
#### 특정 속성에 대한 사용자 정의 메시지

애플리케이션의 유효성 검사 언어 파일 내에서 지정된 속성 및 규칙 조합에 사용되는 에러 메시지를 커스터마이징할 수 있습니다. 이렇게 하려면 애플리케이션의 `lang/xx/validation.php` 언어 파일의 `custom` 배열에 메시지 커스터마이징을 추가하세요.

```php
'custom' => [
    'email' => [
        'required' => 'We need to know your email address!',
        'max' => 'Your email address is too long!'
    ],
],
```

<a name="specifying-attribute-in-language-files"></a>
### 언어 파일에서 속성 지정

Laravel의 많은 내장 에러 메시지에는 유효성 검사 중인 필드 또는 속성의 이름으로 대체되는 `:attribute` 플레이스홀더가 포함되어 있습니다. 유효성 검사 메시지의 `:attribute` 부분을 사용자 정의 값으로 대체하려면, `lang/xx/validation.php` 언어 파일의 `attributes` 배열에서 사용자 정의 속성 이름을 지정할 수 있습니다.

```php
'attributes' => [
    'email' => 'email address',
],
```

> [!WARNING]
> 기본적으로 Laravel 애플리케이션 스켈레톤에는 `lang` 디렉토리가 포함되어 있지 않습니다. Laravel의 언어 파일을 커스터마이징하려면 `lang:publish` Artisan 명령을 통해 발행할 수 있습니다.

<a name="specifying-values-in-language-files"></a>
### 언어 파일에서 값 지정

Laravel의 일부 내장 유효성 검사 규칙 에러 메시지에는 요청 속성의 현재 값으로 대체되는 `:value` 플레이스홀더가 포함되어 있습니다. 그러나 유효성 검사 메시지의 `:value` 부분을 값의 사용자 정의 표현으로 대체해야 하는 경우가 있을 수 있습니다. 예를 들어, `payment_type`이 `cc` 값일 때 신용카드 번호가 필요하다고 지정하는 다음 규칙을 고려해 보세요.

```php
Validator::make($request->all(), [
    'credit_card_number' => 'required_if:payment_type,cc'
]);
```

이 유효성 검사 규칙이 실패하면 다음 에러 메시지가 생성됩니다.

```text
The credit card number field is required when payment type is cc.
```

결제 유형 값으로 `cc`를 표시하는 대신, `lang/xx/validation.php` 언어 파일에서 `values` 배열을 정의하여 더 사용자 친화적인 값 표현을 지정할 수 있습니다.

```php
'values' => [
    'payment_type' => [
        'cc' => 'credit card'
    ],
],
```

> [!WARNING]
> 기본적으로 Laravel 애플리케이션 스켈레톤에는 `lang` 디렉토리가 포함되어 있지 않습니다. Laravel의 언어 파일을 커스터마이징하려면 `lang:publish` Artisan 명령을 통해 발행할 수 있습니다.

이 값을 정의한 후, 유효성 검사 규칙은 다음 에러 메시지를 생성합니다.

```text
The credit card number field is required when payment type is credit card.
```

<a name="available-validation-rules"></a>
## 사용 가능한 유효성 검사 규칙

아래는 사용 가능한 모든 유효성 검사 규칙과 그 기능의 목록입니다.

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

#### 불리언(Booleans)

<div class="collection-method-list" markdown="1">

[Accepted](#rule-accepted)
[Accepted If](#rule-accepted-if)
[Boolean](#rule-boolean)
[Declined](#rule-declined)
[Declined If](#rule-declined-if)

</div>

#### 문자열(Strings)

<div class="collection-method-list" markdown="1">

[Active URL](#rule-active-url)
[Alpha](#rule-alpha)
[Alpha Dash](#rule-alpha-dash)
[Alpha Numeric](#rule-alpha-num)
[Ascii](#rule-ascii)
[Confirmed](#rule-confirmed)
[Current Password](#rule-current-password)
[Different](#rule-different)
[Doesnt Start With](#rule-doesnt-start-with)
[Doesnt End With](#rule-doesnt-end-with)
[Email](#rule-email)
[Ends With](#rule-ends-with)
[Enum](#rule-enum)
[Hex Color](#rule-hex-color)
[In](#rule-in)
[IP Address](#rule-ip)
[JSON](#rule-json)
[Lowercase](#rule-lowercase)
[MAC Address](#rule-mac)
[Max](#rule-max)
[Min](#rule-min)
[Not In](#rule-not-in)
  [Not Regular Expression](#rule-not-regex)
  [Same](#rule-same)
  [Size](#rule-size)
  [Starts With](#rule-starts-with)
  [String](#rule-string)
  [Uppercase](#rule-uppercase)
  [URL](#rule-url)
  [ULID](#rule-ulid)
  [UUID](#rule-uuid)

</div>

#### 숫자(Numbers)

<div class="collection-method-list" markdown="1">

[Between](#rule-between)
[Decimal](#rule-decimal)
[Different](#rule-different)
[Digits](#rule-digits)
[Digits Between](#rule-digits-between)
[Greater Than](#rule-gt)
[Greater Than Or Equal](#rule-gte)
[Integer](#rule-integer)
[Less Than](#rule-lt)
[Less Than Or Equal](#rule-lte)
[Max](#rule-max)
[Max Digits](#rule-max-digits)
[Min](#rule-min)
[Min Digits](#rule-min-digits)
[Multiple Of](#rule-multiple-of)
[Numeric](#rule-numeric)
[Same](#rule-same)
[Size](#rule-size)

</div>

#### 배열(Arrays)

<div class="collection-method-list" markdown="1">

[Array](#rule-array)
[Between](#rule-between)
[Contains](#rule-contains)
[Doesnt Contain](#rule-doesnt-contain)
[Distinct](#rule-distinct)
[In Array](#rule-in-array)
[In Array Keys](#rule-in-array-keys)
[List](#rule-list)
[Max](#rule-max)
[Min](#rule-min)
[Size](#rule-size)

</div>

#### 날짜(Dates)

<div class="collection-method-list" markdown="1">

[After](#rule-after)
[After Or Equal](#rule-after-or-equal)
[Before](#rule-before)
[Before Or Equal](#rule-before-or-equal)
[Date](#rule-date)
[Date Equals](#rule-date-equals)
[Date Format](#rule-date-format)
[Different](#rule-different)
[Timezone](#rule-timezone)

</div>

#### 파일(Files)

<div class="collection-method-list" markdown="1">

[Between](#rule-between)
[Dimensions](#rule-dimensions)
[Encoding](#rule-encoding)
[Extensions](#rule-extensions)
[File](#rule-file)
[Image](#rule-image)
[Max](#rule-max)
[MIME Types](#rule-mimetypes)
[MIME Type By File Extension](#rule-mimes)
[Size](#rule-size)

</div>

#### 데이터베이스(Database)

<div class="collection-method-list" markdown="1">

[Exists](#rule-exists)
[Unique](#rule-unique)

</div>

#### 유틸리티(Utilities)

<div class="collection-method-list" markdown="1">

[Any Of](#rule-anyof)
[Bail](#rule-bail)
[Exclude](#rule-exclude)
[Exclude If](#rule-exclude-if)
[Exclude Unless](#rule-exclude-unless)
[Exclude With](#rule-exclude-with)
[Exclude Without](#rule-exclude-without)
[Filled](#rule-filled)
[Missing](#rule-missing)
[Missing If](#rule-missing-if)
[Missing Unless](#rule-missing-unless)
[Missing With](#rule-missing-with)
[Missing With All](#rule-missing-with-all)
[Nullable](#rule-nullable)
[Present](#rule-present)
[Present If](#rule-present-if)
[Present Unless](#rule-present-unless)
[Present With](#rule-present-with)
[Present With All](#rule-present-with-all)
[Prohibited](#rule-prohibited)
[Prohibited If](#rule-prohibited-if)
[Prohibited If Accepted](#rule-prohibited-if-accepted)
[Prohibited If Declined](#rule-prohibited-if-declined)
[Prohibited Unless](#rule-prohibited-unless)
[Prohibits](#rule-prohibits)
[Required](#rule-required)
[Required If](#rule-required-if)
[Required If Accepted](#rule-required-if-accepted)
[Required If Declined](#rule-required-if-declined)
[Required Unless](#rule-required-unless)
[Required With](#rule-required-with)
[Required With All](#rule-required-with-all)
[Required Without](#rule-required-without)
[Required Without All](#rule-required-without-all)
[Required Array Keys](#rule-required-array-keys)
[Sometimes](#validating-when-present)

</div>

<a name="rule-accepted"></a>
#### accepted

유효성 검사 중인 필드는 `"yes"`, `"on"`, `1`, `"1"`, `true`, 또는 `"true"` 중 하나여야 합니다. 이는 "서비스 약관" 동의 또는 유사한 필드의 유효성 검사에 유용합니다.

<a name="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...

유효성 검사 중인 다른 필드가 지정된 값과 같을 경우, 유효성 검사 중인 필드는 `"yes"`, `"on"`, `1`, `"1"`, `true`, 또는 `"true"` 중 하나여야 합니다. 이는 "서비스 약관" 동의 또는 유사한 필드의 유효성 검사에 유용합니다.

<a name="rule-active-url"></a>
#### active_url

유효성 검사 중인 필드는 `dns_get_record` PHP 함수에 따라 유효한 A 또는 AAAA 레코드를 가져야 합니다. 제공된 URL의 호스트명은 `dns_get_record`로 전달되기 전에 `parse_url` PHP 함수를 사용하여 추출됩니다.

<a name="rule-after"></a>
#### after:_date_

유효성 검사 중인 필드는 주어진 날짜 이후의 값이어야 합니다. 날짜는 유효한 `DateTime` 인스턴스로 변환되기 위해 `strtotime` PHP 함수로 전달됩니다:

```php
'start_date' => 'required|date|after:tomorrow'
```

`strtotime`으로 평가될 날짜 문자열을 전달하는 대신, 날짜와 비교할 다른 필드를 지정할 수 있습니다:

```php
'finish_date' => 'required|date|after:start_date'
```

편의를 위해, 날짜 기반 규칙은 플루언트(fluent) `date` 규칙 빌더를 사용하여 구성할 수 있습니다:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->after(today()->addDays(7)),
],
```

`afterToday`와 `todayOrAfter` 메서드를 사용하면 날짜가 오늘 이후여야 하거나, 오늘 또는 그 이후여야 함을 각각 플루언트하게 표현할 수 있습니다:

```php
'start_date' => [
    'required',
    Rule::date()->afterToday(),
],
```

<a name="rule-after-or-equal"></a>
#### after\_or\_equal:_date_

유효성 검사 중인 필드는 주어진 날짜 이후이거나 같은 값이어야 합니다. 자세한 내용은 [after](#rule-after) 규칙을 참조하세요.

편의를 위해, 날짜 기반 규칙은 플루언트(fluent) `date` 규칙 빌더를 사용하여 구성할 수 있습니다:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->afterOrEqual(today()->addDays(7)),
],
```

<a name="rule-anyof"></a>
#### anyOf

`Rule::anyOf` 유효성 검사 규칙을 사용하면 유효성 검사 중인 필드가 주어진 유효성 검사 규칙 세트 중 하나라도 만족해야 함을 지정할 수 있습니다. 예를 들어, 다음 규칙은 `username` 필드가 이메일 주소이거나 최소 6자 이상의 영숫자 문자열(대시 포함)인지 유효성을 검사합니다:

```php
use Illuminate\Validation\Rule;

'username' => [
    'required',
    Rule::anyOf([
        ['string', 'email'],
        ['string', 'alpha_dash', 'min:6'],
    ]),
],
```

<a name="rule-alpha"></a>
#### alpha

유효성 검사 중인 필드는 [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=)와 [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=)에 포함된 유니코드 알파벳 문자로만 구성되어야 합니다.

이 유효성 검사 규칙을 ASCII 범위의 문자(`a-z` 및 `A-Z`)로 제한하려면, 유효성 검사 규칙에 `ascii` 옵션을 제공할 수 있습니다:

```php
'username' => 'alpha:ascii',
```

<a name="rule-alpha-dash"></a>
#### alpha_dash

유효성 검사 중인 필드는 [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [\p{N}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=)에 포함된 유니코드 영숫자 문자와 ASCII 대시(`-`) 및 ASCII 밑줄(`_`)로만 구성되어야 합니다.

이 유효성 검사 규칙을 ASCII 범위의 문자(`a-z`, `A-Z`, `0-9`)로 제한하려면, 유효성 검사 규칙에 `ascii` 옵션을 제공할 수 있습니다:

```php
'username' => 'alpha_dash:ascii',
```

<a name="rule-alpha-num"></a>
#### alpha_num

유효성 검사 중인 필드는 [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [\p{N}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=)에 포함된 유니코드 영숫자 문자로만 구성되어야 합니다.

이 유효성 검사 규칙을 ASCII 범위의 문자(`a-z`, `A-Z`, `0-9`)로 제한하려면, 유효성 검사 규칙에 `ascii` 옵션을 제공할 수 있습니다:

```php
'username' => 'alpha_num:ascii',
```

<a name="rule-array"></a>
#### array

유효성 검사 중인 필드는 PHP `array`여야 합니다.

`array` 규칙에 추가 값이 제공되면, 입력 배열의 각 키는 규칙에 제공된 값 목록 내에 존재해야 합니다. 다음 예제에서, 입력 배열의 `admin` 키는 `array` 규칙에 제공된 값 목록에 포함되어 있지 않으므로 유효하지 않습니다:

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'user' => [
        'name' => 'Taylor Otwell',
        'username' => 'taylorotwell',
        'admin' => true,
    ],
];

Validator::make($input, [
    'user' => 'array:name,username',
]);
```

일반적으로 배열 내에 존재할 수 있는 배열 키를 항상 지정해야 합니다.

<a name="rule-ascii"></a>
#### ascii

유효성 검사 중인 필드는 7비트 ASCII 문자로만 구성되어야 합니다.

<a name="rule-bail"></a>
#### bail

첫 번째 유효성 검사 실패 후 해당 필드에 대한 유효성 검사 규칙 실행을 중지합니다.

`bail` 규칙은 유효성 검사 실패를 만났을 때 특정 필드의 유효성 검사만 중지하지만, `stopOnFirstFailure` 메서드는 단일 유효성 검사 실패가 발생하면 모든 속성의 유효성 검사를 중지하도록 유효성 검사기에 알립니다:

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="rule-before"></a>
#### before:_date_

유효성 검사 중인 필드는 주어진 날짜 이전의 값이어야 합니다. 날짜는 유효한 `DateTime` 인스턴스로 변환되기 위해 PHP `strtotime` 함수로 전달됩니다. 또한, [after](#rule-after) 규칙과 마찬가지로, 유효성 검사 중인 다른 필드의 이름을 `date` 값으로 제공할 수 있습니다.

편의를 위해, 날짜 기반 규칙은 플루언트(fluent) `date` 규칙 빌더를 사용하여 구성할 수도 있습니다:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->before(today()->subDays(7)),
],
```

`beforeToday`와 `todayOrBefore` 메서드를 사용하면 날짜가 오늘 이전이어야 하거나, 오늘 또는 그 이전이어야 함을 각각 플루언트하게 표현할 수 있습니다:

```php
'start_date' => [
    'required',
    Rule::date()->beforeToday(),
],
```

<a name="rule-before-or-equal"></a>
#### before\_or\_equal:_date_

유효성 검사 중인 필드는 주어진 날짜 이전이거나 같은 값이어야 합니다. 날짜는 유효한 `DateTime` 인스턴스로 변환되기 위해 PHP `strtotime` 함수로 전달됩니다. 또한, [after](#rule-after) 규칙과 마찬가지로, 유효성 검사 중인 다른 필드의 이름을 `date` 값으로 제공할 수 있습니다.

편의를 위해, 날짜 기반 규칙은 플루언트(fluent) `date` 규칙 빌더를 사용하여 구성할 수도 있습니다:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->beforeOrEqual(today()->subDays(7)),
],
```

<a name="rule-between"></a>
#### between:_min_,_max_

유효성 검사 중인 필드는 주어진 _min_과 _max_ 사이의 크기를 가져야 합니다(경계값 포함). 문자열, 숫자, 배열, 파일은 [size](#rule-size) 규칙과 동일한 방식으로 평가됩니다.

<a name="rule-boolean"></a>
#### boolean

유효성 검사 중인 필드는 불리언(boolean)으로 캐스팅할 수 있어야 합니다. 허용되는 입력은 `true`, `false`, `1`, `0`, `"1"`, `"0"`입니다.

`strict` 매개변수를 사용하면 값이 `true` 또는 `false`일 때만 유효한 것으로 간주할 수 있습니다.

```php
'foo' => 'boolean:strict'
```

<a name="rule-confirmed"></a>
#### confirmed

유효성 검사 중인 필드는 `{field}_confirmation`과 일치하는 필드가 있어야 합니다. 예를 들어, 유효성 검사 중인 필드가 `password`라면, 입력에 일치하는 `password_confirmation` 필드가 있어야 합니다.

사용자 정의 확인 필드 이름을 전달할 수도 있습니다. 예를 들어, `confirmed:repeat_username`은 `repeat_username` 필드가 유효성 검사 중인 필드와 일치할 것으로 예상합니다.

<a name="rule-contains"></a>
#### contains:_foo_,_bar_,...

유효성 검사 중인 필드는 주어진 모든 매개변수 값을 포함하는 배열이어야 합니다. 이 규칙은 종종 배열을 `implode`해야 하므로, `Rule::contains` 메서드를 사용하여 규칙을 플루언트하게 구성할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'roles' => [
        'required',
        'array',
        Rule::contains(['admin', 'editor']),
    ],
]);
```

<a name="rule-doesnt-contain"></a>
#### doesnt_contain:_foo_,_bar_,...

유효성 검사 중인 필드는 주어진 매개변수 값을 포함하지 않는 배열이어야 합니다. 이 규칙은 종종 배열을 `implode`해야 하므로, `Rule::doesntContain` 메서드를 사용하여 규칙을 플루언트하게 구성할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'roles' => [
        'required',
        'array',
        Rule::doesntContain(['admin', 'editor']),
    ],
]);
```

<a name="rule-current-password"></a>
#### current_password

유효성 검사 중인 필드는 인증된 사용자의 비밀번호와 일치해야 합니다. 규칙의 첫 번째 매개변수를 사용하여 [인증 가드](/docs/{{version}}/authentication)를 지정할 수 있습니다:

```php
'password' => 'current_password:api'
```

<a name="rule-date"></a>
#### date

유효성 검사 중인 필드는 `strtotime` PHP 함수에 따라 유효한 비상대적 날짜여야 합니다.

<a name="rule-date-equals"></a>
#### date_equals:_date_

유효성 검사 중인 필드는 주어진 날짜와 같아야 합니다. 날짜는 유효한 `DateTime` 인스턴스로 변환되기 위해 PHP `strtotime` 함수로 전달됩니다.

<a name="rule-date-format"></a>
#### date_format:_format_,...

유효성 검사 중인 필드는 주어진 _형식_ 중 하나와 일치해야 합니다. 필드의 유효성을 검사할 때 `date` 또는 `date_format` 중 **하나만** 사용해야 하며, 둘 다 사용해서는 안 됩니다. 이 유효성 검사 규칙은 PHP의 [DateTime](https://www.php.net/manual/en/class.datetime.php) 클래스가 지원하는 모든 형식을 지원합니다.

편의를 위해, 날짜 기반 규칙은 플루언트(fluent) `date` 규칙 빌더를 사용하여 구성할 수 있습니다:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->format('Y-m-d'),
],
```

<a name="rule-decimal"></a>
#### decimal:_min_,_max_

유효성 검사 중인 필드는 숫자여야 하며, 지정된 소수점 자릿수를 포함해야 합니다:

```php
// 정확히 두 자리 소수점이어야 함 (9.99)...
'price' => 'decimal:2'

// 2에서 4 사이의 소수점 자릿수를 가져야 함...
'price' => 'decimal:2,4'
```

<a name="rule-declined"></a>
#### declined

유효성 검사 중인 필드는 `"no"`, `"off"`, `0`, `"0"`, `false`, 또는 `"false"` 중 하나여야 합니다.

<a name="rule-declined-if"></a>
#### declined_if:anotherfield,value,...

유효성 검사 중인 다른 필드가 지정된 값과 같을 경우, 유효성 검사 중인 필드는 `"no"`, `"off"`, `0`, `"0"`, `false`, 또는 `"false"` 중 하나여야 합니다.

<a name="rule-different"></a>
#### different:_field_

유효성 검사 중인 필드는 _field_와 다른 값을 가져야 합니다.

<a name="rule-digits"></a>
#### digits:_value_

유효성 검사 중인 정수는 정확히 _value_ 길이를 가져야 합니다.

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_

유효성 검사 대상 정수는 주어진 _min_과 _max_ 사이의 길이를 가져야 합니다.

<a name="rule-dimensions"></a>
#### dimensions

유효성 검사 중인 파일은 규칙의 매개변수로 지정된 치수 제약 조건을 충족하는 이미지여야 합니다:

```php
'avatar' => 'dimensions:min_width=100,min_height=200'
```

사용 가능한 제약 조건은 다음과 같습니다: _min\_width_, _max\_width_, _min\_height_, _max\_height_, _width_, _height_, _ratio_.

_ratio_ 제약 조건은 너비를 높이로 나눈 값으로 표현해야 합니다. 이는 `3/2`와 같은 분수 또는 `1.5`와 같은 소수로 지정할 수 있습니다:

```php
'avatar' => 'dimensions:ratio=3/2'
```

이 규칙은 여러 인수를 필요로 하므로, `Rule::dimensions` 메서드를 사용하여 플루언트하게 규칙을 구성하는 것이 더 편리한 경우가 많습니다:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'avatar' => [
        'required',
        Rule::dimensions()
            ->maxWidth(1000)
            ->maxHeight(500)
            ->ratio(3 / 2),
    ],
]);
```

<a name="rule-distinct"></a>
#### distinct

배열의 유효성을 검사할 때, 유효성 검사 중인 필드는 중복 값을 가지면 안 됩니다:

```php
'foo.*.id' => 'distinct'
```

Distinct는 기본적으로 느슨한 변수 비교를 사용합니다. 엄격한 비교를 사용하려면, 유효성 검사 규칙 정의에 `strict` 매개변수를 추가할 수 있습니다:

```php
'foo.*.id' => 'distinct:strict'
```

유효성 검사 규칙의 인수에 `ignore_case`를 추가하면 규칙이 대소문자 차이를 무시하도록 할 수 있습니다:

```php
'foo.*.id' => 'distinct:ignore_case'
```

<a name="rule-doesnt-start-with"></a>
#### doesnt_start_with:_foo_,_bar_,...

유효성 검사 중인 필드는 주어진 값 중 하나로 시작하면 안 됩니다.

<a name="rule-doesnt-end-with"></a>
#### doesnt_end_with:_foo_,_bar_,...

유효성 검사 중인 필드는 주어진 값 중 하나로 끝나면 안 됩니다.

<a name="rule-email"></a>
#### email

유효성 검사 대상 필드는 이메일 주소 형식이어야 합니다. 이 유효성 검사 규칙은 이메일 주소 유효성 검사를 위해 [egulias/email-validator](https://github.com/egulias/EmailValidator) 패키지를 사용합니다. 기본적으로 `RFCValidation` 유효성 검사기가 적용되지만, 다른 유효성 검사 스타일도 적용할 수 있습니다.

```php
'email' => 'email:rfc,dns'
```

위 예제는 `RFCValidation`과 `DNSCheckValidation` 유효성 검사를 적용합니다. 적용할 수 있는 유효성 검사 스타일의 전체 목록은 다음과 같습니다.

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation` - [지원되는 RFC](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs)에 따라 이메일 주소를 검증합니다.
- `strict`: `NoRFCWarningsValidation` - [지원되는 RFC](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs)에 따라 이메일을 검증하며, 경고가 발견되면 실패합니다(예: 후행 마침표 및 연속된 여러 마침표).
- `dns`: `DNSCheckValidation` - 이메일 주소의 도메인에 유효한 MX 레코드가 있는지 확인합니다.
- `spoof`: `SpoofCheckValidation` - 이메일 주소에 호모그래프 또는 기만적인 유니코드 문자가 포함되어 있지 않은지 확인합니다.
- `filter`: `FilterEmailValidation` - PHP의 `filter_var` 함수에 따라 이메일 주소가 유효한지 확인합니다.
- `filter_unicode`: `FilterEmailValidation::unicode()` - PHP의 `filter_var` 함수에 따라 이메일 주소가 유효한지 확인하며, 일부 유니코드 문자를 허용합니다.

</div>

편의를 위해, 플루언트(Fluent) 규칙 빌더를 사용하여 이메일 유효성 검사 규칙을 작성할 수 있습니다.

```php
use Illuminate\Validation\Rule;

$request->validate([
    'email' => [
        'required',
        Rule::email()
            ->rfcCompliant(strict: false)
            ->validateMxRecord()
            ->preventSpoofing()
    ],
]);
```

> [!WARNING]
> `dns`와 `spoof` 유효성 검사기는 PHP `intl` 확장을 필요로 합니다.

<a name="rule-encoding"></a>
#### encoding:*encoding_type*

유효성 검사 대상 필드는 지정된 문자 인코딩(character encoding)과 일치해야 합니다. 이 규칙은 PHP의 `mb_check_encoding` 함수를 사용하여 주어진 파일 또는 문자열 값의 인코딩을 확인합니다. 편의를 위해, `encoding` 규칙은 Laravel의 플루언트(fluent) 파일 규칙 빌더를 사용하여 구성할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'attachment' => [
        'required',
        File::types(['csv'])
            ->encoding('utf-8'),
    ],
]);
```

<a name="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...

유효성 검사 대상 필드는 주어진 값 중 하나로 끝나야 합니다.

<a name="rule-enum"></a>
#### enum

`Enum` 규칙은 유효성 검사 대상 필드에 유효한 enum 값이 포함되어 있는지 검증하는 클래스 기반(class-based) 규칙입니다. `Enum` 규칙은 생성자 인수로 enum의 이름만 받습니다. 기본 값(primitive values)을 검증할 때는 backed Enum을 `Enum` 규칙에 제공해야 합니다.

```php
use App\Enums\ServerStatus;
use Illuminate\Validation\Rule;

$request->validate([
    'status' => [Rule::enum(ServerStatus::class)],
]);
```

`Enum` 규칙의 `only`와 `except` 메서드를 사용하여 유효한 것으로 간주될 enum 케이스를 제한할 수 있습니다.

```php
Rule::enum(ServerStatus::class)
    ->only([ServerStatus::Pending, ServerStatus::Active]);

Rule::enum(ServerStatus::class)
    ->except([ServerStatus::Pending, ServerStatus::Active]);
```

`when` 메서드를 사용하여 `Enum` 규칙을 조건부로 수정할 수 있습니다.

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

Rule::enum(ServerStatus::class)
    ->when(
        Auth::user()->isAdmin(),
        fn ($rule) => $rule->only(...),
        fn ($rule) => $rule->only(...),
    );
```

<a name="rule-exclude"></a>
#### exclude

유효성 검사 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_

_anotherfield_ 필드가 _value_와 같으면 유효성 검사 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

복잡한 조건부 제외 로직이 필요한 경우 `Rule::excludeIf` 메서드를 활용할 수 있습니다. 이 메서드는 불리언(boolean) 또는 클로저를 받습니다. 클로저가 주어지면, 클로저는 유효성 검사 대상 필드가 제외되어야 하는지 여부를 나타내기 위해 `true` 또는 `false`를 반환해야 합니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::excludeIf($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::excludeIf(fn () => $request->user()->is_admin),
]);
```

<a name="rule-exclude-unless"></a>
#### exclude_unless:_anotherfield_,_value_

_anotherfield_ 필드가 _value_와 같지 않으면 유효성 검사 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다. _value_가 `null`(`exclude_unless:name,null`)이면, 비교 필드가 `null`이거나 요청 데이터에 비교 필드가 없는 경우를 제외하고 유효성 검사 대상 필드가 제외됩니다.

복잡한 조건부 제외 로직이 필요한 경우 `Rule::excludeUnless` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 또는 클로저를 허용합니다. 클로저가 제공되면 유효성 검사 대상 필드를 제외하지 않아야 하는지를 나타내기 위해 `true` 또는 `false`를 반환해야 합니다:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::excludeUnless($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::excludeUnless(fn () => $request->user()->is_admin),
]);
```

<a name="rule-exclude-with"></a>
#### exclude_with:_anotherfield_

_anotherfield_ 필드가 존재하면 유효성 검사 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

<a name="rule-exclude-without"></a>
#### exclude_without:_anotherfield_

_anotherfield_ 필드가 존재하지 않으면 유효성 검사 대상 필드는 `validate` 및 `validated` 메서드가 반환하는 요청 데이터에서 제외됩니다.

<a name="rule-exists"></a>
#### exists:_table_,_column_

유효성 검사 대상 필드는 주어진 데이터베이스 테이블에 존재해야 합니다.

<a name="basic-usage-of-exists-rule"></a>
#### Exists 규칙의 기본 사용법

```php
'state' => 'exists:states'
```

`column` 옵션이 지정되지 않으면, 필드 이름이 사용됩니다. 따라서 이 경우 규칙은 `states` 데이터베이스 테이블에 요청의 `state` 속성 값과 일치하는 `state` 컬럼 값을 가진 레코드가 포함되어 있는지 검증합니다.

<a name="specifying-a-custom-column-name"></a>
#### 사용자 정의 컬럼 이름 지정

데이터베이스 테이블 이름 뒤에 배치하여 유효성 검사 규칙에서 사용해야 하는 데이터베이스 컬럼 이름을 명시적으로 지정할 수 있습니다.

```php
'state' => 'exists:states,abbreviation'
```

경우에 따라 `exists` 쿼리에 사용할 특정 데이터베이스 연결을 지정해야 할 수 있습니다. 테이블 이름 앞에 연결 이름을 추가하여 이를 수행할 수 있습니다.

```php
'email' => 'exists:connection.staff,email'
```

테이블 이름을 직접 지정하는 대신, 테이블 이름을 결정하는 데 사용할 Eloquent 모델을 지정할 수 있습니다.

```php
'user_id' => 'exists:App\Models\User,id'
```

유효성 검사 규칙이 실행하는 쿼리를 커스터마이징하려면, `Rule` 클래스를 사용하여 규칙을 플루언트하게 정의할 수 있습니다. 이 예제에서는 `|` 문자를 사용하여 구분하는 대신 배열로 유효성 검사 규칙을 지정합니다.

```php
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::exists('staff')->where(function (Builder $query) {
            $query->where('account_id', 1);
        }),
    ],
]);
```

`Rule::exists` 메서드로 생성된 `exists` 규칙에서 사용해야 하는 데이터베이스 컬럼 이름을 `exists` 메서드의 두 번째 인수로 컬럼 이름을 제공하여 명시적으로 지정할 수 있습니다.

```php
'state' => Rule::exists('states', 'abbreviation'),
```

때로는 값 배열이 데이터베이스에 존재하는지 확인하고 싶을 수 있습니다. 유효성을 검사하는 필드에 `exists`와 [array](#rule-array) 규칙을 모두 추가하여 이를 수행할 수 있습니다.

```php
'states' => ['array', Rule::exists('states', 'abbreviation')],
```

이 두 규칙이 필드에 할당되면, Laravel은 주어진 모든 값이 지정된 테이블에 존재하는지 확인하기 위해 자동으로 단일 쿼리를 작성합니다.

<a name="rule-extensions"></a>
#### extensions:_foo_,_bar_,...

유효성 검사 대상 파일은 나열된 확장자 중 하나에 해당하는 사용자 지정 확장자를 가져야 합니다.

```php
'photo' => ['required', 'extensions:jpg,png'],
```

> [!WARNING]
> 사용자가 지정한 확장자만으로 파일의 유효성을 검사해서는 안 됩니다. 이 규칙은 일반적으로 [mimes](#rule-mimes) 또는 [mimetypes](#rule-mimetypes) 규칙과 함께 사용해야 합니다.

<a name="rule-file"></a>
#### file

유효성 검사 대상 필드는 성공적으로 업로드된 파일이어야 합니다.

<a name="rule-filled"></a>
#### filled

유효성 검사 대상 필드가 존재하는 경우 비어 있으면 안 됩니다.

<a name="rule-gt"></a>
#### gt:_field_

유효성 검사 대상 필드는 주어진 _field_ 또는 _value_보다 커야 합니다. 두 필드는 동일한 타입이어야 합니다. 문자열, 숫자, 배열 및 파일은 [size](#rule-size) 규칙과 동일한 규칙을 사용하여 평가됩니다.

<a name="rule-gte"></a>
#### gte:_field_

유효성 검사 대상 필드는 주어진 _field_ 또는 _value_보다 크거나 같아야 합니다. 두 필드는 동일한 타입이어야 합니다. 문자열, 숫자, 배열 및 파일은 [size](#rule-size) 규칙과 동일한 규칙을 사용하여 평가됩니다.

<a name="rule-hex-color"></a>
#### hex_color

유효성 검사 대상 필드는 [16진수](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color) 형식의 유효한 색상 값을 포함해야 합니다.

<a name="rule-image"></a>
#### image

유효성 검사 대상 파일은 이미지(jpg, jpeg, png, bmp, gif 또는 webp)여야 합니다.

> [!WARNING]
> 기본적으로 image 규칙은 XSS 취약점 가능성으로 인해 SVG 파일을 허용하지 않습니다. SVG 파일을 허용해야 하는 경우 `image` 규칙에 `allow_svg` 지시어를 제공할 수 있습니다(`image:allow_svg`).

<a name="rule-in"></a>
#### in:_foo_,_bar_,...

유효성 검사 대상 필드는 주어진 값 목록에 포함되어야 합니다. 이 규칙은 종종 배열을 `implode`해야 하므로, `Rule::in` 메서드를 사용하여 규칙을 플루언트하게 구성할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'zones' => [
        'required',
        Rule::in(['first-zone', 'second-zone']),
    ],
]);
```

`in` 규칙이 `array` 규칙과 결합되면, 입력 배열의 각 값은 `in` 규칙에 제공된 값 목록 내에 있어야 합니다. 다음 예제에서 입력 배열의 `LAS` 공항 코드는 `in` 규칙에 제공된 공항 목록에 포함되어 있지 않으므로 유효하지 않습니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$input = [
    'airports' => ['NYC', 'LAS'],
];

Validator::make($input, [
    'airports' => [
        'required',
        'array',
    ],
    'airports.*' => Rule::in(['NYC', 'LIT']),
]);
```

<a name="rule-in-array"></a>
#### in_array:_anotherfield_.*

유효성 검사 대상 필드는 _anotherfield_의 값에 존재해야 합니다.

<a name="rule-in-array-keys"></a>
#### in_array_keys:_value_.*

유효성 검사 대상 필드는 배열이어야 하며, 주어진 _값_ 중 하나 이상을 배열 내의 키로 포함해야 합니다.

```php
'config' => 'array|in_array_keys:timezone'
```

<a name="rule-integer"></a>
#### integer

유효성 검사 대상 필드는 정수여야 합니다.

`strict` 매개변수를 사용하면 필드의 타입이 `integer`일 때만 유효한 것으로 간주할 수 있습니다. 정수 값을 가진 문자열은 유효하지 않은 것으로 처리됩니다.

```php
'age' => 'integer:strict'
```

> [!WARNING]
> 이 유효성 검사 규칙은 입력이 "integer" 변수 타입인지 확인하지 않으며, PHP의 `FILTER_VALIDATE_INT` 규칙에서 허용하는 타입인지만 확인합니다. 입력이 숫자인지 확인해야 하는 경우 이 규칙을 [`numeric` 유효성 검사 규칙](#rule-numeric)과 함께 사용하세요.

<a name="rule-ip"></a>
#### ip

유효성 검사 대상 필드는 IP 주소여야 합니다.

<a name="ipv4"></a>
#### ipv4

유효성 검사 대상 필드는 IPv4 주소여야 합니다.

<a name="ipv6"></a>
#### ipv6

유효성 검사 대상 필드는 IPv6 주소여야 합니다.

<a name="rule-json"></a>
#### json

유효성 검사 대상 필드는 유효한 JSON 문자열이어야 합니다.

<a name="rule-lt"></a>
#### lt:_field_

유효성 검사 대상 필드는 주어진 _field_보다 작아야 합니다. 두 필드는 동일한 타입이어야 합니다. 문자열, 숫자, 배열 및 파일은 [size](#rule-size) 규칙과 동일한 규칙을 사용하여 평가됩니다.

<a name="rule-lte"></a>
#### lte:_field_

유효성 검사 대상 필드는 주어진 _field_보다 작거나 같아야 합니다. 두 필드는 동일한 타입이어야 합니다. 문자열, 숫자, 배열 및 파일은 [size](#rule-size) 규칙과 동일한 규칙을 사용하여 평가됩니다.

<a name="rule-lowercase"></a>
#### lowercase

유효성 검사 대상 필드는 소문자여야 합니다.

<a name="rule-list"></a>
#### list

유효성 검사 대상 필드는 리스트인 배열이어야 합니다. 배열의 키가 0부터 `count($array) - 1`까지의 연속적인 숫자로 구성되어 있으면 리스트로 간주됩니다.

<a name="rule-mac"></a>
#### mac_address

유효성 검사 대상 필드는 MAC 주소여야 합니다.

<a name="rule-max"></a>
#### max:_value_

유효성 검사 대상 필드는 최대 _value_보다 작거나 같아야 합니다. 문자열, 숫자, 배열 및 파일은 [size](#rule-size) 규칙과 동일한 방식으로 평가됩니다.

<a name="rule-max-digits"></a>
#### max_digits:_value_

유효성 검사 대상 정수는 최대 _value_ 길이를 가져야 합니다.

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

유효성 검사 대상 파일은 주어진 MIME 타입 중 하나와 일치해야 합니다.

```php
'video' => 'mimetypes:video/avi,video/mpeg,video/quicktime',

'media' => 'mimetypes:image/*,video/*',
```

업로드된 파일의 MIME 타입을 결정하기 위해, 파일의 내용을 읽고 프레임워크가 MIME 타입을 추측합니다. 이는 클라이언트가 제공한 MIME 타입과 다를 수 있습니다.

<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

유효성 검사 대상 파일은 나열된 확장자 중 하나에 해당하는 MIME 타입을 가져야 합니다.

```php
'photo' => 'mimes:jpg,bmp,png'
```

확장자만 지정하면 되지만, 이 규칙은 실제로 파일의 내용을 읽고 MIME 타입을 추측하여 파일의 MIME 타입을 검증합니다. MIME 타입과 해당 확장자의 전체 목록은 다음 위치에서 찾을 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="mime-types-and-extensions"></a>
#### MIME 타입과 확장자

이 유효성 검사 규칙은 MIME 타입과 사용자가 파일에 할당한 확장자 간의 일치를 확인하지 않습니다. 예를 들어, `mimes:png` 유효성 검사 규칙은 파일 이름이 `photo.txt`이더라도 유효한 PNG 내용을 포함하는 파일을 유효한 PNG 이미지로 간주합니다. 파일의 사용자 지정 확장자를 검증하려면 [extensions](#rule-extensions) 규칙을 사용할 수 있습니다.

<a name="rule-min"></a>
#### min:_value_

유효성 검사 대상 필드는 최소 _value_를 가져야 합니다. 문자열, 숫자, 배열 및 파일은 [size](#rule-size) 규칙과 동일한 방식으로 평가됩니다.

<a name="rule-min-digits"></a>
#### min_digits:_value_

유효성 검사 대상 정수는 최소 _value_ 길이를 가져야 합니다.

<a name="rule-multiple-of"></a>
#### multiple_of:_value_

유효성 검사 대상 필드는 _value_의 배수여야 합니다.

<a name="rule-missing"></a>
#### missing

유효성 검사 대상 필드는 입력 데이터에 존재하지 않아야 합니다.

<a name="rule-missing-if"></a>
#### missing_if:_anotherfield_,_value_,...

_anotherfield_ 필드가 _value_ 중 하나와 같으면 유효성 검사 대상 필드는 존재하지 않아야 합니다.

<a name="rule-missing-unless"></a>
#### missing_unless:_anotherfield_,_value_

_anotherfield_ 필드가 _value_ 중 하나와 같지 않으면 유효성 검사 대상 필드는 존재하지 않아야 합니다.

<a name="rule-missing-with"></a>
#### missing_with:_foo_,_bar_,...

유효성 검사 대상 필드는 지정된 다른 필드 중 _하나라도_ 존재하는 경우에만 존재하지 않아야 합니다.

<a name="rule-missing-with-all"></a>
#### missing_with_all:_foo_,_bar_,...

유효성 검사 대상 필드는 지정된 다른 필드가 _모두_ 존재하는 경우에만 존재하지 않아야 합니다.

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

유효성 검사 대상 필드는 주어진 값 목록에 포함되지 않아야 합니다. `Rule::notIn` 메서드를 사용하여 규칙을 플루언트하게 구성할 수 있습니다.

```php
use Illuminate\Validation\Rule;

Validator::make($data, [
    'toppings' => [
        'required',
        Rule::notIn(['sprinkles', 'cherries']),
    ],
]);
```

<a name="rule-not-regex"></a>
#### not_regex:_pattern_

유효성 검사 대상 필드는 주어진 정규식과 일치하지 않아야 합니다.

내부적으로 이 규칙은 PHP의 `preg_match` 함수를 사용합니다. 지정된 패턴은 `preg_match`에 필요한 것과 동일한 형식을 따라야 하므로 유효한 구분자를 포함해야 합니다. 예: `'email' => 'not_regex:/^.+$/i'`.

> [!WARNING]
> `regex` / `not_regex` 패턴을 사용할 때, 특히 정규식에 `|` 문자가 포함된 경우 `|` 구분자를 사용하는 대신 배열을 사용하여 유효성 검사 규칙을 지정해야 할 수 있습니다.

<a name="rule-nullable"></a>
#### nullable

유효성 검사 대상 필드는 `null`일 수 있습니다.

<a name="rule-numeric"></a>
#### numeric

유효성 검사 대상 필드는 [숫자](https://www.php.net/manual/en/function.is-numeric.php)여야 합니다.

`strict` 매개변수를 사용하면 필드의 값이 정수(integer) 또는 부동 소수점(float) 타입일 때만 유효한 것으로 간주할 수 있습니다. 숫자 문자열은 유효하지 않은 것으로 처리됩니다.

```php
'amount' => 'numeric:strict'
```

<a name="rule-present"></a>
#### present

유효성 검사 대상 필드는 입력 데이터에 존재해야 합니다.

<a name="rule-present-if"></a>
#### present_if:_anotherfield_,_value_,...

_anotherfield_ 필드가 _value_ 중 하나와 같으면 유효성 검사 대상 필드가 존재해야 합니다.

<a name="rule-present-unless"></a>
#### present_unless:_anotherfield_,_value_

_anotherfield_ 필드가 _value_ 중 하나와 같지 않으면 유효성 검사 대상 필드가 존재해야 합니다.

<a name="rule-present-with"></a>
#### present_with:_foo_,_bar_,...

유효성 검사 대상 필드는 지정된 다른 필드 중 _하나라도_ 존재하는 경우에만 존재해야 합니다.

<a name="rule-present-with-all"></a>
#### present_with_all:_foo_,_bar_,...

유효성 검사 대상 필드는 지정된 다른 필드가 _모두_ 존재하는 경우에만 존재해야 합니다.

<a name="rule-prohibited"></a>
#### prohibited

유효성 검사 대상 필드는 누락되거나 비어 있어야 합니다. 필드가 다음 기준 중 하나를 충족하면 "비어 있음"입니다.

<div class="content-list" markdown="1">

- 값이 `null`입니다.
- 값이 빈 문자열입니다.
- 값이 빈 배열이거나 빈 `Countable` 객체입니다.
- 값이 빈 경로를 가진 업로드된 파일입니다.

</div>

<a name="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...

_anotherfield_ 필드가 _value_ 중 하나와 같으면 유효성 검사 대상 필드는 누락되거나 비어 있어야 합니다. 필드가 다음 기준 중 하나를 충족하면 "비어 있음"입니다.

<div class="content-list" markdown="1">

- 값이 `null`입니다.
- 값이 빈 문자열입니다.
- 값이 빈 배열이거나 빈 `Countable` 객체입니다.
- 값이 빈 경로를 가진 업로드된 파일입니다.

</div>

복잡한 조건부 금지 로직이 필요한 경우 `Rule::prohibitedIf` 메서드를 활용할 수 있습니다. 이 메서드는 불리언(boolean) 또는 클로저를 받습니다. 클로저가 주어지면, 클로저는 유효성 검사 대상 필드가 금지되어야 하는지 여부를 나타내기 위해 `true` 또는 `false`를 반환해야 합니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::prohibitedIf($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::prohibitedIf(fn () => $request->user()->is_admin),
]);
```
<a name="rule-prohibited-if-accepted"></a>
#### prohibited_if_accepted:_anotherfield_,...

유효성 검사 대상 필드는 _anotherfield_ 필드가 `"yes"`, `"on"`, `1`, `"1"`, `true`, 또는 `"true"`와 같을 경우 누락되거나 비어 있어야 합니다.

<a name="rule-prohibited-if-declined"></a>
#### prohibited_if_declined:_anotherfield_,...

유효성 검사 대상 필드는 _anotherfield_ 필드가 `"no"`, `"off"`, `0`, `"0"`, `false`, 또는 `"false"`와 같을 경우 누락되거나 비어 있어야 합니다.

<a name="rule-prohibited-unless"></a>
#### prohibited_unless:_anotherfield_,_value_,...

유효성 검사 대상 필드는 _anotherfield_ 필드가 어떤 _value_ 와도 같지 않은 경우 누락되거나 비어 있어야 합니다. 필드가 "비어있음(empty)"으로 간주되는 경우는 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우.
- 값이 빈 문자열인 경우.
- 값이 빈 배열이거나 빈 `Countable` 객체인 경우.
- 값이 빈 경로를 가진 업로드 파일인 경우.

</div>

복잡한 조건부 금지 로직이 필요한 경우 `Rule::prohibitedUnless` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 또는 클로저를 허용합니다. 클로저가 제공되면 유효성 검사 대상 필드를 금지하지 않아야 하는지를 나타내기 위해 `true` 또는 `false`를 반환해야 합니다:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::prohibitedUnless($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::prohibitedUnless(fn () => $request->user()->is_admin),
]);
```

<a name="rule-prohibits"></a>
#### prohibits:_anotherfield_,...

유효성 검사 대상 필드가 누락되지 않았거나 비어있지 않은 경우, _anotherfield_ 의 모든 필드는 누락되거나 비어 있어야 합니다. 필드가 "비어있음(empty)"으로 간주되는 경우는 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우.
- 값이 빈 문자열인 경우.
- 값이 빈 배열이거나 빈 `Countable` 객체인 경우.
- 값이 빈 경로를 가진 업로드 파일인 경우.

</div>

<a name="rule-regex"></a>
#### regex:_pattern_

유효성 검사 대상 필드는 주어진 정규 표현식과 일치해야 합니다.

내부적으로 이 규칙은 PHP `preg_match` 함수를 사용합니다. 지정된 패턴은 `preg_match`에서 요구하는 것과 동일한 형식을 따라야 하며, 따라서 유효한 구분 기호도 포함해야 합니다. 예: `'email' => 'regex:/^.+@.+$/i'`.

> [!WARNING]
> `regex` / `not_regex` 패턴을 사용할 때, 특히 정규 표현식에 `|` 문자가 포함된 경우 `|` 구분자 대신 배열을 사용하여 규칙을 지정해야 할 수 있습니다.

<a name="rule-required"></a>
#### required

유효성 검사 대상 필드는 입력 데이터에 존재하고 비어있지 않아야 합니다. 필드가 "비어있음(empty)"으로 간주되는 경우는 다음과 같습니다.

<div class="content-list" markdown="1">

- 값이 `null`인 경우.
- 값이 빈 문자열인 경우.
- 값이 빈 배열이거나 빈 `Countable` 객체인 경우.
- 값이 경로가 없는 업로드 파일인 경우.

</div>

<a name="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...

유효성 검사 대상 필드는 _anotherfield_ 필드가 어떤 _value_와 같을 경우 존재하고 비어있지 않아야 합니다.

`required_if` 규칙에 대해 더 복잡한 조건을 구성하려면 `Rule::requiredIf` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 또는 클로저를 받습니다. 클로저가 전달되면, 유효성 검사 대상 필드가 필수인지 여부를 나타내기 위해 `true` 또는 `false`를 반환해야 합니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::requiredIf($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::requiredIf(fn () => $request->user()->is_admin),
]);
```

<a name="rule-required-if-accepted"></a>
#### required_if_accepted:_anotherfield_,...

유효성 검사 대상 필드는 _anotherfield_ 필드가 `"yes"`, `"on"`, `1`, `"1"`, `true`, 또는 `"true"`와 같을 경우 존재하고 비어있지 않아야 합니다.

<a name="rule-required-if-declined"></a>
#### required_if_declined:_anotherfield_,...

유효성 검사 대상 필드는 _anotherfield_ 필드가 `"no"`, `"off"`, `0`, `"0"`, `false`, 또는 `"false"`와 같을 경우 존재하고 비어있지 않아야 합니다.

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

유효성 검사 대상 필드는 _anotherfield_ 필드가 어떤 _value_와 같지 않은 경우 존재하고 비어있지 않아야 합니다. 이것은 또한 _value_가 `null`이 아닌 한 _anotherfield_가 요청 데이터에 존재해야 함을 의미합니다. _value_가 `null`인 경우(`required_unless:name,null`), 유효성 검사 대상 필드는 비교 필드가 `null`이거나 요청 데이터에서 누락되지 않는 한 필수입니다.

`required_unless` 규칙에 대해 보다 복잡한 조건을 구성하려면 `Rule::requiredUnless` 메서드를 사용할 수 있습니다. 이 메서드는 불리언 또는 클로저를 허용합니다. 클로저가 전달되면 유효성 검사 대상 필드가 필수가 아닌지를 나타내기 위해 `true` 또는 `false`를 반환해야 합니다:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => Rule::requiredUnless($request->user()->is_admin),
]);

Validator::make($request->all(), [
    'role_id' => Rule::requiredUnless(fn () => $request->user()->is_admin),
]);
```

<a name="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

유효성 검사 대상 필드는 다른 지정된 필드 중 _하나라도_ 존재하고 비어있지 않을 때만 존재하고 비어있지 않아야 합니다.

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

유효성 검사 대상 필드는 다른 지정된 필드가 _모두_ 존재하고 비어있지 않을 때만 존재하고 비어있지 않아야 합니다.

<a name="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

유효성 검사 대상 필드는 다른 지정된 필드 중 _하나라도_ 비어있거나 존재하지 않을 때만 존재하고 비어있지 않아야 합니다.

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

유효성 검사 대상 필드는 다른 지정된 필드가 _모두_ 비어있거나 존재하지 않을 때만 존재하고 비어있지 않아야 합니다.

<a name="rule-required-array-keys"></a>
#### required_array_keys:_foo_,_bar_,...

유효성 검사 대상 필드는 배열이어야 하며 최소한 지정된 키를 포함해야 합니다.

<a name="rule-same"></a>
#### same:_field_

주어진 _field_는 유효성 검사 대상 필드와 일치해야 합니다.

<a name="rule-size"></a>
#### size:_value_

유효성 검사 대상 필드는 주어진 _value_와 일치하는 크기를 가져야 합니다. 문자열 데이터의 경우, _value_는 문자 수에 해당합니다. 숫자 데이터의 경우, _value_는 주어진 정수 값에 해당합니다(속성에 `numeric` 또는 `integer` 규칙도 있어야 함). 배열의 경우, _size_는 배열의 `count`에 해당합니다. 파일의 경우, _size_는 킬로바이트 단위의 파일 크기에 해당합니다. 몇 가지 예를 살펴보겠습니다.

```php
// 문자열이 정확히 12자인지 검증...
'title' => 'size:12';

// 제공된 정수가 10과 같은지 검증...
'seats' => 'integer|size:10';

// 배열이 정확히 5개의 요소를 가지는지 검증...
'tags' => 'array|size:5';

// 업로드된 파일이 정확히 512킬로바이트인지 검증...
'image' => 'file|size:512';
```

<a name="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...

유효성 검사 대상 필드는 주어진 값 중 하나로 시작해야 합니다.

<a name="rule-string"></a>
#### string

유효성 검사 대상 필드는 문자열이어야 합니다. 필드가 `null`도 허용하도록 하려면, 필드에 `nullable` 규칙을 할당해야 합니다.

편의를 위해 플루언트 `Rule::string()` 규칙 빌더를 사용하여 문자열 유효성 검사 규칙을 구성할 수도 있습니다:

```php
use Illuminate\Validation\Rule;

'title' => [
    'required',
    Rule::string()
        ->min(3)
        ->max(255)
        ->alphaDash(ascii: true),
],
```

문자열 규칙 빌더는 `alpha`, `alphaDash`, `alphaNumeric`, `ascii`, `between`, `doesntEndWith`, `doesntStartWith`, `endsWith`, `exactly`, `lowercase`, `max`, `min`, `startsWith`, `uppercase`를 포함한 일반적인 문자열 제약 조건 메서드를 제공합니다. 규칙 빌더는 conditionable이므로 `when` 및 `unless` 메서드를 사용하여 조건부로 제약 조건을 적용할 수도 있습니다.

<a name="rule-timezone"></a>
#### timezone

유효성 검사 대상 필드는 `DateTimeZone::listIdentifiers` 메서드에 따른 유효한 타임존 식별자여야 합니다.

[`DateTimeZone::listIdentifiers` 메서드가 허용하는](https://www.php.net/manual/en/datetimezone.listidentifiers.php) 인수도 이 유효성 검사 규칙에 제공될 수 있습니다.

```php
'timezone' => 'required|timezone:all';

'timezone' => 'required|timezone:Africa';

'timezone' => 'required|timezone:per_country,US';
```

<a name="rule-unique"></a>
#### unique:_table_,_column_

유효성 검사 대상 필드는 주어진 데이터베이스 테이블 내에 존재하지 않아야 합니다.

**사용자 지정 테이블 / 컬럼 이름 지정:**

테이블 이름을 직접 지정하는 대신, 테이블 이름을 결정하는 데 사용할 Eloquent 모델을 지정할 수 있습니다.

```php
'email' => 'unique:App\Models\User,email_address'
```

`column` 옵션은 필드에 해당하는 데이터베이스 컬럼을 지정하는 데 사용될 수 있습니다. `column` 옵션이 지정되지 않으면, 유효성 검사 대상 필드의 이름이 사용됩니다.

```php
'email' => 'unique:users,email_address'
```

**사용자 지정 데이터베이스 연결 지정**

때때로 Validator가 수행하는 데이터베이스 쿼리에 대해 사용자 지정 연결을 설정해야 할 수 있습니다. 이를 위해 테이블 이름 앞에 연결 이름을 추가할 수 있습니다.

```php
'email' => 'unique:connection.users,email_address'
```

**주어진 ID를 무시하도록 Unique 규칙 강제:**

때때로 고유성 검사 중에 주어진 ID를 무시하고 싶을 수 있습니다. 예를 들어, 사용자의 이름, 이메일 주소 및 위치를 포함하는 "프로필 업데이트" 화면을 고려해 보세요. 이메일 주소가 고유한지 확인하고 싶을 것입니다. 그러나 사용자가 이메일 필드가 아닌 이름 필드만 변경하는 경우, 사용자가 이미 해당 이메일 주소의 소유자이므로 유효성 검사 오류가 발생하는 것을 원하지 않습니다.

Validator가 사용자의 ID를 무시하도록 지시하려면, `Rule` 클래스를 사용하여 규칙을 유연하게 정의합니다. 이 예제에서는 `|` 문자를 사용하여 규칙을 구분하는 대신 배열로 유효성 검사 규칙을 지정합니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::unique('users')->ignore($user->id),
    ],
]);
```

> [!WARNING]
> 사용자가 제어하는 요청 입력을 `ignore` 메서드에 전달해서는 안 됩니다. 대신, Eloquent 모델 인스턴스의 자동 증가 ID 또는 UUID와 같은 시스템 생성 고유 ID만 전달해야 합니다. 그렇지 않으면 애플리케이션이 SQL 인젝션 공격에 취약해집니다.

모델 키의 값을 `ignore` 메서드에 전달하는 대신, 전체 모델 인스턴스를 전달할 수도 있습니다. Laravel은 자동으로 모델에서 키를 추출합니다.

```php
Rule::unique('users')->ignore($user)
```

테이블이 `id`가 아닌 다른 이름의 기본 키 컬럼을 사용하는 경우, `ignore` 메서드를 호출할 때 컬럼의 이름을 지정할 수 있습니다.

```php
Rule::unique('users')->ignore($user->id, 'user_id')
```

기본적으로 `unique` 규칙은 유효성 검사 중인 속성의 이름과 일치하는 컬럼의 고유성을 확인합니다. 그러나 `unique` 메서드의 두 번째 인수로 다른 컬럼 이름을 전달할 수 있습니다.

```php
Rule::unique('users', 'email_address')->ignore($user->id)
```

**추가 Where 절 추가:**

`where` 메서드를 사용하여 쿼리를 사용자 지정함으로써 추가 쿼리 조건을 지정할 수 있습니다. 예를 들어, `account_id` 컬럼 값이 `1`인 레코드만 검색하도록 쿼리 조건을 추가해 보겠습니다.

```php
'email' => Rule::unique('users')->where(fn (Builder $query) => $query->where('account_id', 1))
```

**Unique 검사에서 소프트 삭제된 레코드 무시:**

기본적으로 unique 규칙은 고유성을 결정할 때 소프트 삭제된 레코드를 포함합니다. 고유성 검사에서 소프트 삭제된 레코드를 제외하려면 `withoutTrashed` 메서드를 호출할 수 있습니다.

```php
Rule::unique('users')->withoutTrashed();
```

모델이 소프트 삭제된 레코드에 대해 `deleted_at`이 아닌 다른 컬럼 이름을 사용하는 경우, `withoutTrashed` 메서드를 호출할 때 컬럼 이름을 제공할 수 있습니다.

```php
Rule::unique('users')->withoutTrashed('was_deleted_at');
```

<a name="rule-uppercase"></a>
#### uppercase

유효성 검사 대상 필드는 대문자여야 합니다.

<a name="rule-url"></a>
#### url

유효성 검사 대상 필드는 유효한 URL이어야 합니다.

유효하다고 간주되어야 하는 URL 프로토콜을 지정하려면 유효성 검사 규칙 매개변수로 프로토콜을 전달할 수 있습니다.

```php
'url' => 'url:http,https',

'game' => 'url:minecraft,steam',
```

<a name="rule-ulid"></a>
#### ulid

유효성 검사 대상 필드는 유효한 [범용 고유 사전순 정렬 가능 식별자](https://github.com/ulid/spec)(ULID)여야 합니다.

<a name="rule-uuid"></a>
#### uuid

유효성 검사 대상 필드는 유효한 RFC 9562(버전 1, 3, 4, 5, 6, 7, 또는 8) 범용 고유 식별자(UUID)여야 합니다.

주어진 UUID가 버전별 UUID 명세와 일치하는지도 유효성 검사할 수 있습니다.

```php
'uuid' => 'uuid:4'
```

<a name="conditionally-adding-rules"></a>
## 조건부 규칙 추가

<a name="skipping-validation-when-fields-have-certain-values"></a>
#### 필드가 특정 값을 가질 때 유효성 검사 건너뛰기

다른 필드가 주어진 값을 가지면 특정 필드의 유효성을 검사하지 않고 싶을 때가 있습니다. `exclude_if` 유효성 검사 규칙을 사용하여 이를 수행할 수 있습니다. 이 예제에서 `has_appointment` 필드가 `false` 값을 가지면 `appointment_date`와 `doctor_name` 필드는 유효성 검사를 받지 않습니다.

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_if:has_appointment,false|required|date',
    'doctor_name' => 'exclude_if:has_appointment,false|required|string',
]);
```

또는, 다른 필드가 주어진 값을 가지지 않는 한 특정 필드의 유효성을 검사하지 않으려면 `exclude_unless` 규칙을 사용할 수 있습니다.

```php
$validator = Validator::make($data, [
    'has_appointment' => 'required|boolean',
    'appointment_date' => 'exclude_unless:has_appointment,true|required|date',
    'doctor_name' => 'exclude_unless:has_appointment,true|required|string',
]);
```

<a name="validating-when-present"></a>
#### 존재할 때만 유효성 검사

어떤 상황에서는 유효성 검사 중인 데이터에 해당 필드가 존재할 때**만** 필드에 대한 유효성 검사를 실행하고 싶을 수 있습니다. 이를 빠르게 수행하려면 규칙 목록에 `sometimes` 규칙을 추가하세요.

```php
$validator = Validator::make($data, [
    'email' => 'sometimes|required|email',
]);
```

위의 예제에서 `email` 필드는 `$data` 배열에 존재하는 경우에만 유효성 검사를 받습니다.

> [!NOTE]
> 항상 존재해야 하지만 비어있을 수 있는 필드의 유효성을 검사하려는 경우 [옵션 필드에 대한 참고 사항](#a-note-on-optional-fields)을 확인하세요.

<a name="complex-conditional-validation"></a>
#### 복잡한 조건부 유효성 검사

때때로 더 복잡한 조건부 논리를 기반으로 유효성 검사 규칙을 추가하고 싶을 수 있습니다. 예를 들어, 다른 필드가 100보다 큰 값을 가질 때만 주어진 필드를 필수로 만들고 싶을 수 있습니다. 또는, 다른 필드가 존재할 때만 두 필드가 주어진 값을 가져야 할 수도 있습니다. 이러한 유효성 검사 규칙을 추가하는 것이 고통스러울 필요는 없습니다. 먼저, 절대 변하지 않는 _정적 규칙_으로 `Validator` 인스턴스를 생성합니다.

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'email' => 'required|email',
    'games' => 'required|integer|min:0',
]);
```

우리의 웹 애플리케이션이 게임 수집가를 위한 것이라고 가정해 봅시다. 게임 수집가가 우리 애플리케이션에 등록하고 100개 이상의 게임을 소유하고 있다면, 왜 그렇게 많은 게임을 소유하고 있는지 설명하도록 요청하려고 합니다. 예를 들어, 그들이 게임 재판매 상점을 운영하거나, 단순히 게임 수집을 즐기는 것일 수 있습니다. 이 요구 사항을 조건부로 추가하려면 `Validator` 인스턴스에서 `sometimes` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Fluent;

$validator->sometimes('reason', 'required|max:500', function (Fluent $input) {
    return $input->games >= 100;
});
```

`sometimes` 메서드에 전달되는 첫 번째 인수는 조건부로 유효성을 검사할 필드의 이름입니다. 두 번째 인수는 추가하려는 규칙 목록입니다. 세 번째 인수로 전달된 클로저가 `true`를 반환하면 규칙이 추가됩니다. 이 메서드를 사용하면 복잡한 조건부 유효성 검사를 쉽게 구축할 수 있습니다. 여러 필드에 대한 조건부 유효성 검사를 한 번에 추가할 수도 있습니다.

```php
$validator->sometimes(['reason', 'cost'], 'required', function (Fluent $input) {
    return $input->games >= 100;
});
```

> [!NOTE]
> 클로저에 전달되는 `$input` 매개변수는 `Illuminate\Support\Fluent`의 인스턴스이며 유효성 검사 중인 입력 및 파일에 액세스하는 데 사용할 수 있습니다.

<a name="complex-conditional-array-validation"></a>
#### 복잡한 조건부 배열 유효성 검사

때때로 인덱스를 알 수 없는 동일한 중첩 배열의 다른 필드를 기반으로 필드의 유효성을 검사하고 싶을 수 있습니다. 이러한 상황에서는 클로저가 두 번째 인수를 받을 수 있도록 할 수 있으며, 이 인수는 유효성 검사 중인 배열의 현재 개별 항목이 됩니다.

```php
$input = [
    'channels' => [
        [
            'type' => 'email',
            'address' => 'abigail@example.com',
        ],
        [
            'type' => 'url',
            'address' => 'https://example.com',
        ],
    ],
];

$validator->sometimes('channels.*.address', 'email', function (Fluent $input, Fluent $item) {
    return $item->type === 'email';
});

$validator->sometimes('channels.*.address', 'url', function (Fluent $input, Fluent $item) {
    return $item->type !== 'email';
});
```

클로저에 전달되는 `$input` 매개변수와 마찬가지로, `$item` 매개변수는 속성 데이터가 배열일 때 `Illuminate\Support\Fluent`의 인스턴스이며, 그렇지 않으면 문자열입니다.

<a name="validating-arrays"></a>
## 배열 유효성 검사

[배열 유효성 검사 규칙 문서](#rule-array)에서 논의한 것처럼, `array` 규칙은 허용된 배열 키 목록을 받습니다. 배열 내에 추가 키가 존재하면 유효성 검사가 실패합니다.

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'user' => [
        'name' => 'Taylor Otwell',
        'username' => 'taylorotwell',
        'admin' => true,
    ],
];

Validator::make($input, [
    'user' => 'array:name,username',
]);
```

일반적으로, 배열 내에서 존재가 허용되는 배열 키를 항상 지정해야 합니다. 그렇지 않으면 validator의 `validate` 및 `validated` 메서드는 해당 키가 다른 중첩 배열 유효성 검사 규칙에 의해 유효성 검사를 받지 않았더라도 배열과 모든 키를 포함한 모든 유효성 검사된 데이터를 반환합니다.

<a name="validating-nested-array-input"></a>
### 중첩 배열 입력 유효성 검사

중첩 배열 기반 양식 입력 필드의 유효성을 검사하는 것은 고통스러울 필요가 없습니다. "점 표기법(dot notation)"을 사용하여 배열 내의 속성을 유효성 검사할 수 있습니다. 예를 들어, 들어오는 HTTP 요청에 `photos[profile]` 필드가 포함되어 있으면 다음과 같이 유효성 검사할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'photos.profile' => 'required|image',
]);
```

배열의 각 요소에 대해서도 유효성 검사를 할 수 있습니다. 예를 들어, 주어진 배열 입력 필드의 각 이메일이 고유한지 유효성 검사하려면 다음과 같이 할 수 있습니다.

```php
$validator = Validator::make($request->all(), [
    'users.*.email' => 'email|unique:users',
    'users.*.first_name' => 'required_with:users.*.last_name',
]);
```

마찬가지로, [언어 파일에서 사용자 지정 유효성 검사 메시지](#custom-messages-for-specific-attributes)를 지정할 때 `*` 문자를 사용하면 배열 기반 필드에 대해 단일 유효성 검사 메시지를 쉽게 사용할 수 있습니다.

```php
'custom' => [
    'users.*.email' => [
        'unique' => 'Each user must have a unique email address',
    ]
],
```

<a name="accessing-nested-array-data"></a>
#### 중첩 배열 데이터 액세스

때때로 속성에 유효성 검사 규칙을 할당할 때 주어진 중첩 배열 요소의 값에 액세스해야 할 수 있습니다. `Rule::forEach` 메서드를 사용하여 이를 수행할 수 있습니다. `forEach` 메서드는 유효성 검사 중인 배열 속성의 각 반복에 대해 호출될 클로저를 받으며, 속성의 값과 명시적으로 완전히 확장된 속성 이름을 받습니다. 클로저는 배열 요소에 할당할 규칙의 배열을 반환해야 합니다.

```php
use App\Rules\HasPermission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$validator = Validator::make($request->all(), [
    'companies.*.id' => Rule::forEach(function (string|null $value, string $attribute) {
        return [
            Rule::exists(Company::class, 'id'),
            new HasPermission('manage-company', $value),
        ];
    }),
]);
```

<a name="error-message-indexes-and-positions"></a>
### 오류 메시지 인덱스 및 위치

배열의 유효성을 검사할 때, 애플리케이션에서 표시하는 오류 메시지 내에서 유효성 검사에 실패한 특정 항목의 인덱스 또는 위치를 참조하고 싶을 수 있습니다. 이를 위해 [사용자 지정 유효성 검사 메시지](#manual-customizing-the-error-messages) 내에 `:index`(`0`부터 시작), `:position`(`1`부터 시작), 또는 `:ordinal-position`(`1st`부터 시작) 플레이스홀더를 포함할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'photos' => [
        [
            'name' => 'BeachVacation.jpg',
            'description' => '해변에서의 휴가 사진!',
        ],
        [
            'name' => 'GrandCanyon.jpg',
            'description' => '',
        ],
    ],
];

Validator::validate($input, [
    'photos.*.description' => 'required',
], [
    'photos.*.description.required' => 'Please describe photo #:position.',
]);
```

위 예제에서 유효성 검사가 실패하고 사용자에게 _"Please describe photo #2."_ 라는 오류 메시지가 표시됩니다.

필요한 경우 `second-index`, `second-position`, `third-index`, `third-position` 등을 통해 더 깊이 중첩된 인덱스와 위치를 참조할 수 있습니다.

```php
'photos.*.attributes.*.string' => 'Invalid attribute for photo #:second-position.',
```

<a name="validating-files"></a>
## 파일 유효성 검사(Validating Files)

Laravel은 `mimes`, `image`, `min`, `max`와 같이 업로드된 파일의 유효성을 검사하는 데 사용할 수 있는 다양한 유효성 검사 규칙을 제공합니다. 파일 유효성 검사 시 이러한 규칙을 개별적으로 지정할 수 있지만, Laravel은 편리하게 사용할 수 있는 유창한(fluent) 파일 유효성 검사 규칙 빌더도 제공합니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'attachment' => [
        'required',
        File::types(['mp3', 'wav'])
            ->min(1024)
            ->max(12 * 1024),
    ],
]);
```

<a name="validating-files-file-types"></a>
#### 파일 타입 유효성 검사(Validating File Types)

`types` 메서드를 호출할 때 확장자만 지정하면 되지만, 이 메서드는 실제로 파일의 내용을 읽고 MIME 타입을 추측하여 파일의 MIME 타입을 검사합니다. MIME 타입과 해당 확장자의 전체 목록은 다음 위치에서 확인할 수 있습니다.

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="validating-files-file-sizes"></a>
#### 파일 크기 유효성 검사(Validating File Sizes)

편의를 위해 최소 및 최대 파일 크기는 파일 크기 단위를 나타내는 접미사가 포함된 문자열로 지정할 수 있습니다. `kb`, `mb`, `gb`, `tb` 접미사가 지원됩니다.

```php
File::types(['mp3', 'wav'])
    ->min('1kb')
    ->max('10mb');
```

<a name="validating-files-image-files"></a>
#### 이미지 파일 유효성 검사(Validating Image Files)

애플리케이션이 사용자가 업로드한 이미지를 허용하는 경우, `File` 규칙의 `image` 생성자 메서드를 사용하여 유효성 검사 대상 파일이 이미지(jpg, jpeg, png, bmp, gif 또는 webp)인지 확인할 수 있습니다.

또한 `dimensions` 규칙을 사용하여 이미지의 크기를 제한할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'photo' => [
        'required',
        File::image()
            ->min(1024)
            ->max(12 * 1024)
            ->dimensions(Rule::dimensions()->maxWidth(1000)->maxHeight(500)),
    ],
]);
```

> [!NOTE]
> 이미지 크기 유효성 검사에 대한 자세한 내용은 [dimension 규칙 문서](#rule-dimensions)에서 확인할 수 있습니다.

> [!WARNING]
> 기본적으로 `image` 규칙은 XSS 취약점 가능성 때문에 SVG 파일을 허용하지 않습니다. SVG 파일을 허용해야 하는 경우 `image` 규칙에 `allowSvg: true`를 전달할 수 있습니다: `File::image(allowSvg: true)`.

<a name="validating-files-image-dimensions"></a>
#### 이미지 크기 유효성 검사(Validating Image Dimensions)

이미지의 크기도 검사할 수 있습니다. 예를 들어, 업로드된 이미지가 최소 1000픽셀 너비와 500픽셀 높이인지 검사하려면 `dimensions` 규칙을 사용할 수 있습니다.

```php
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

File::image()->dimensions(
    Rule::dimensions()
        ->maxWidth(1000)
        ->maxHeight(500)
)
```

> [!NOTE]
> 이미지 크기 유효성 검사에 대한 자세한 내용은 [dimension 규칙 문서](#rule-dimensions)에서 확인할 수 있습니다.

<a name="validating-passwords"></a>
## 비밀번호 유효성 검사(Validating Passwords)

비밀번호가 적절한 수준의 복잡성을 갖추도록 하려면 Laravel의 `Password` 규칙 객체를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

$validator = Validator::make($request->all(), [
    'password' => ['required', 'confirmed', Password::min(8)],
]);
```

`Password` 규칙 객체를 사용하면 애플리케이션의 비밀번호 복잡성 요구 사항을 쉽게 커스터마이징할 수 있습니다. 예를 들어 비밀번호에 최소 하나의 문자, 숫자, 기호 또는 대소문자 혼합 문자가 필요하도록 지정할 수 있습니다.

```php
// 최소 8자 필요...
Password::min(8)

// 최소 하나의 문자 필요...
Password::min(8)->letters()

// 최소 하나의 대문자와 하나의 소문자 필요...
Password::min(8)->mixedCase()

// 최소 하나의 숫자 필요...
Password::min(8)->numbers()

// 최소 하나의 기호 필요...
Password::min(8)->symbols()
```

또한 `uncompromised` 메서드를 사용하여 비밀번호가 공개 비밀번호 데이터 유출에서 노출되지 않았는지 확인할 수 있습니다.

```php
Password::min(8)->uncompromised()
```

내부적으로 `Password` 규칙 객체는 [k-Anonymity](https://en.wikipedia.org/wiki/K-anonymity) 모델을 사용하여 사용자의 프라이버시나 보안을 희생하지 않으면서 [haveibeenpwned.com](https://haveibeenpwned.com) 서비스를 통해 비밀번호가 유출되었는지 확인합니다.

기본적으로 비밀번호가 데이터 유출에서 한 번이라도 나타나면 손상된 것으로 간주됩니다. `uncompromised` 메서드의 첫 번째 인수를 사용하여 이 임계값을 커스터마이징할 수 있습니다.

```php
// 비밀번호가 동일한 데이터 유출에서 3회 미만으로 나타나는지 확인...
Password::min(8)->uncompromised(3);
```

물론 위의 예제에서 모든 메서드를 체이닝할 수 있습니다.

```php
Password::min(8)
    ->letters()
    ->mixedCase()
    ->numbers()
    ->symbols()
    ->uncompromised()
```

<a name="defining-default-password-rules"></a>
#### 기본 비밀번호 규칙 정의(Defining Default Password Rules)

애플리케이션의 단일 위치에서 비밀번호의 기본 유효성 검사 규칙을 지정하는 것이 편리할 수 있습니다. 클로저를 받는 `Password::defaults` 메서드를 사용하여 쉽게 이를 수행할 수 있습니다. `defaults` 메서드에 전달된 클로저는 Password 규칙의 기본 구성을 반환해야 합니다. 일반적으로 `defaults` 규칙은 애플리케이션 서비스 프로바이더 중 하나의 `boot` 메서드 내에서 호출해야 합니다.

```php
use Illuminate\Validation\Rules\Password;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Password::defaults(function () {
        $rule = Password::min(8);

        return $this->app->isProduction()
            ? $rule->mixedCase()->uncompromised()
            : $rule;
    });
}
```

그런 다음 유효성 검사를 수행할 특정 비밀번호에 기본 규칙을 적용하려면 인수 없이 `defaults` 메서드를 호출할 수 있습니다.

```php
'password' => ['required', Password::defaults()],
```

때로는 기본 비밀번호 유효성 검사 규칙에 추가 유효성 검사 규칙을 첨부하고 싶을 수 있습니다. 이를 위해 `rules` 메서드를 사용할 수 있습니다.

```php
use App\Rules\ZxcvbnRule;

Password::defaults(function () {
    $rule = Password::min(8)->rules([new ZxcvbnRule]);

    // ...
});
```

<a name="custom-validation-rules"></a>
## 사용자 정의 유효성 검사 규칙(Custom Validation Rules)

<a name="using-rule-objects"></a>
### 규칙 객체 사용(Using Rule Objects)

Laravel은 다양하고 유용한 유효성 검사 규칙을 제공합니다. 그러나 자신만의 규칙을 지정하고 싶을 수 있습니다. 사용자 정의 유효성 검사 규칙을 등록하는 한 가지 방법은 규칙 객체를 사용하는 것입니다. 새 규칙 객체를 생성하려면 `make:rule` Artisan 명령어를 사용할 수 있습니다. 이 명령어를 사용하여 문자열이 대문자인지 확인하는 규칙을 생성해 보겠습니다. Laravel은 새 규칙을 `app/Rules` 디렉토리에 배치합니다. 이 디렉토리가 존재하지 않으면 규칙을 생성하기 위해 Artisan 명령어를 실행할 때 Laravel이 생성합니다.

```shell
php artisan make:rule Uppercase
```

규칙이 생성되면 해당 동작을 정의할 준비가 되었습니다. 규칙 객체에는 단일 메서드 `validate`가 있습니다. 이 메서드는 속성 이름, 값, 유효성 검사 오류 메시지와 함께 실패 시 호출해야 하는 콜백을 받습니다.

```php
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements ValidationRule
{
    /**
     * 유효성 검사 규칙을 실행합니다.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strtoupper($value) !== $value) {
            $fail('The :attribute must be uppercase.');
        }
    }
}
```

규칙이 정의되면 다른 유효성 검사 규칙과 함께 규칙 객체의 인스턴스를 전달하여 유효성 검사기에 첨부할 수 있습니다.

```php
use App\Rules\Uppercase;

$request->validate([
    'name' => ['required', 'string', new Uppercase],
]);
```

#### 유효성 검사 메시지 번역(Translating Validation Messages)

`$fail` 클로저에 리터럴 오류 메시지를 제공하는 대신 [번역 문자열 키](/docs/{{version}}/localization)를 제공하고 Laravel에 오류 메시지를 번역하도록 지시할 수도 있습니다.

```php
if (strtoupper($value) !== $value) {
    $fail('validation.uppercase')->translate();
}
```

필요한 경우 `translate` 메서드의 첫 번째 및 두 번째 인수로 플레이스홀더 대체 값과 원하는 언어를 제공할 수 있습니다.

```php
$fail('validation.location')->translate([
    'value' => $this->value,
], 'fr');
```

#### 추가 데이터에 접근(Accessing Additional Data)

사용자 정의 유효성 검사 규칙 클래스가 유효성 검사 대상인 다른 모든 데이터에 접근해야 하는 경우, 규칙 클래스는 `Illuminate\Contracts\Validation\DataAwareRule` 인터페이스를 구현할 수 있습니다. 이 인터페이스는 클래스가 `setData` 메서드를 정의하도록 요구합니다. 이 메서드는 유효성 검사가 진행되기 전에 Laravel에 의해 자동으로 모든 유효성 검사 대상 데이터와 함께 호출됩니다.

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements DataAwareRule, ValidationRule
{
    /**
     * 유효성 검사 대상인 모든 데이터.
     *
     * @var array<string, mixed>
     */
    protected $data = [];

    // ...

    /**
     * 유효성 검사 대상 데이터를 설정합니다.
     *
     * @param  array<string, mixed>  $data
     */
    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }
}
```

또는 유효성 검사 규칙이 유효성 검사를 수행하는 유효성 검사기 인스턴스에 접근해야 하는 경우 `ValidatorAwareRule` 인터페이스를 구현할 수 있습니다.

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;
use Illuminate\Validation\Validator;

class Uppercase implements ValidationRule, ValidatorAwareRule
{
    /**
     * 유효성 검사기 인스턴스.
     *
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    // ...

    /**
     * 현재 유효성 검사기를 설정합니다.
     */
    public function setValidator(Validator $validator): static
    {
        $this->validator = $validator;

        return $this;
    }
}
```

<a name="using-closures"></a>
### 클로저 사용(Using Closures)

애플리케이션 전체에서 사용자 정의 규칙의 기능이 한 번만 필요한 경우 규칙 객체 대신 클로저를 사용할 수 있습니다. 클로저는 속성 이름, 속성 값, 유효성 검사가 실패할 경우 호출해야 하는 `$fail` 콜백을 받습니다.

```php
use Illuminate\Support\Facades\Validator;
use Closure;

$validator = Validator::make($request->all(), [
    'title' => [
        'required',
        'max:255',
        function (string $attribute, mixed $value, Closure $fail) {
            if ($value === 'foo') {
                $fail("The {$attribute} is invalid.");
            }
        },
    ],
]);
```

<a name="implicit-rules"></a>
### 암시적 규칙(Implicit Rules)

기본적으로 유효성 검사 대상 속성이 존재하지 않거나 빈 문자열을 포함하는 경우, 사용자 정의 규칙을 포함한 일반 유효성 검사 규칙이 실행되지 않습니다. 예를 들어 [unique](#rule-unique) 규칙은 빈 문자열에 대해 실행되지 않습니다.

```php
use Illuminate\Support\Facades\Validator;

$rules = ['name' => 'unique:users,name'];

$input = ['name' => ''];

Validator::make($input, $rules)->passes(); // true
```

속성이 비어 있어도 사용자 정의 규칙이 실행되도록 하려면 규칙이 속성이 필수임을 암시해야 합니다. 새로운 암시적 규칙 객체를 빠르게 생성하려면 `--implicit` 옵션과 함께 `make:rule` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan make:rule Uppercase --implicit
```

> [!WARNING]
> "암시적" 규칙은 속성이 필수임을 _암시_ 할 뿐입니다. 실제로 누락되거나 빈 속성을 무효화할지 여부는 사용자에게 달려 있습니다.

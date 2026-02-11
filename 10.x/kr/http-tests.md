# HTTP 테스트(HTTP Tests)

- [소개](#introduction)
- [요청 만들기](#making-requests)
    - [요청 헤더 커스터마이징](#customizing-request-headers)
    - [쿠키](#cookies)
    - [세션 / 인증](#session-and-authentication)
    - [응답 디버깅](#debugging-responses)
    - [예외 처리](#exception-handling)
- [JSON API 테스트](#testing-json-apis)
    - [Fluent JSON 테스트](#fluent-json-testing)
- [파일 업로드 테스트](#testing-file-uploads)
- [뷰 테스트](#testing-views)
    - [Blade와 컴포넌트 렌더링](#rendering-blade-and-components)
- [사용 가능한 Assertions](#available-assertions)
    - [응답 Assertions](#response-assertions)
    - [인증 Assertions](#authentication-assertions)
    - [유효성 검사 Assertions](#validation-assertions)

<a name="introduction"></a>
## 소개

Laravel은 애플리케이션에 HTTP 요청을 보내고 응답을 검사하기 위한 매우 유창한 API를 제공합니다. 예를 들어, 아래에 정의된 기능 테스트를 살펴보세요.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 기본 테스트 예제.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

`get` 메소드는 애플리케이션에 `GET` 요청을 보내고, `assertStatus` 메소드는 반환된 응답이 주어진 HTTP 상태 코드를 가져야 함을 검증합니다. 이 간단한 assertion 외에도 Laravel은 응답 헤더, 콘텐츠, JSON 구조 등을 검사하기 위한 다양한 assertion을 포함하고 있습니다.

<a name="making-requests"></a>
## 요청 만들기

애플리케이션에 요청을 보내려면 테스트 내에서 `get`, `post`, `put`, `patch`, 또는 `delete` 메소드를 호출할 수 있습니다. 이 메소드들은 실제로 애플리케이션에 "진짜" HTTP 요청을 보내지 않습니다. 대신, 전체 네트워크 요청이 내부적으로 시뮬레이션됩니다.

테스트 요청 메소드는 `Illuminate\Http\Response` 인스턴스를 반환하는 대신 `Illuminate\Testing\TestResponse` 인스턴스를 반환하며, 이는 애플리케이션의 응답을 검사할 수 있는 [다양하고 유용한 assertion](#available-assertions)을 제공합니다.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 기본 테스트 예제.
     */
    public function test_a_basic_request(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

일반적으로 각 테스트는 애플리케이션에 하나의 요청만 보내야 합니다. 단일 테스트 메소드 내에서 여러 요청이 실행되면 예기치 않은 동작이 발생할 수 있습니다.

> [!NOTE]
> 편의를 위해 테스트 실행 시 CSRF 미들웨어가 자동으로 비활성화됩니다.

<a name="customizing-request-headers"></a>
### 요청 헤더 커스터마이징

`withHeaders` 메소드를 사용하여 요청이 애플리케이션에 전송되기 전에 요청 헤더를 커스터마이징할 수 있습니다. 이 메소드를 사용하면 요청에 원하는 커스텀 헤더를 추가할 수 있습니다.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 기본 기능 테스트 예제.
     */
    public function test_interacting_with_headers(): void
    {
        $response = $this->withHeaders([
            'X-Header' => 'Value',
        ])->post('/user', ['name' => 'Sally']);

        $response->assertStatus(201);
    }
}
```

<a name="cookies"></a>
### 쿠키

요청을 보내기 전에 `withCookie` 또는 `withCookies` 메소드를 사용하여 쿠키 값을 설정할 수 있습니다. `withCookie` 메소드는 쿠키 이름과 값을 두 개의 인수로 받고, `withCookies` 메소드는 이름/값 쌍의 배열을 받습니다.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_cookies(): void
    {
        $response = $this->withCookie('color', 'blue')->get('/');

        $response = $this->withCookies([
            'color' => 'blue',
            'name' => 'Taylor',
        ])->get('/');

        //
    }
}
```

<a name="session-and-authentication"></a>
### 세션 / 인증

Laravel은 HTTP 테스트 중 세션과 상호작용하기 위한 여러 헬퍼를 제공합니다. 먼저, `withSession` 메소드를 사용하여 세션 데이터를 주어진 배열로 설정할 수 있습니다. 이는 애플리케이션에 요청을 보내기 전에 세션에 데이터를 로드하는 데 유용합니다.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_the_session(): void
    {
        $response = $this->withSession(['banned' => false])->get('/');

        //
    }
}
```

Laravel의 세션은 일반적으로 현재 인증된 사용자의 상태를 유지하는 데 사용됩니다. 따라서 `actingAs` 헬퍼 메소드는 주어진 사용자를 현재 사용자로 인증하는 간단한 방법을 제공합니다. 예를 들어, [모델 팩토리](/docs/{{version}}/eloquent-factories)를 사용하여 사용자를 생성하고 인증할 수 있습니다.

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_an_action_that_requires_authentication(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withSession(['banned' => false])
            ->get('/');

        //
    }
}
```

`actingAs` 메소드의 두 번째 인수로 가드 이름을 전달하여 주어진 사용자를 인증하는 데 사용할 가드를 지정할 수도 있습니다. `actingAs` 메소드에 제공된 가드는 테스트 기간 동안 기본 가드가 됩니다.

```php
$this->actingAs($user, 'web');
```

<a name="debugging-responses"></a>
### 응답 디버깅

애플리케이션에 테스트 요청을 보낸 후, `dump`, `dumpHeaders`, `dumpSession` 메소드를 사용하여 응답 내용을 검사하고 디버그할 수 있습니다.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 기본 테스트 예제.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->dumpHeaders();

        $response->dumpSession();

        $response->dump();
    }
}
```

또는, `dd`, `ddHeaders`, `ddSession` 메소드를 사용하여 응답에 대한 정보를 덤프한 다음 실행을 중지할 수 있습니다.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 기본 테스트 예제.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->ddHeaders();

        $response->ddSession();

        $response->dd();
    }
}
```

<a name="exception-handling"></a>
### 예외 처리

때때로 애플리케이션이 특정 예외를 발생시키는지 테스트해야 할 수 있습니다. 예외가 Laravel의 예외 핸들러에 의해 잡혀서 HTTP 응답으로 반환되지 않도록 하려면 요청을 보내기 전에 `withoutExceptionHandling` 메소드를 호출할 수 있습니다.

    $response = $this->withoutExceptionHandling()->get('/');

또한, 애플리케이션이 PHP 언어나 사용 중인 라이브러리에서 더 이상 사용되지 않는 기능을 사용하지 않는지 확인하려면 요청을 보내기 전에 `withoutDeprecationHandling` 메소드를 호출할 수 있습니다. 비추천 처리가 비활성화되면 비추천 경고가 예외로 변환되어 테스트가 실패합니다.

    $response = $this->withoutDeprecationHandling()->get('/');

`assertThrows` 메소드를 사용하여 주어진 클로저 내의 코드가 지정된 유형의 예외를 발생시키는지 검증할 수 있습니다.

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    OrderInvalid::class
);
```

<a name="testing-json-apis"></a>
## JSON API 테스트

Laravel은 JSON API와 그 응답을 테스트하기 위한 여러 헬퍼도 제공합니다. 예를 들어, `json`, `getJson`, `postJson`, `putJson`, `patchJson`, `deleteJson`, `optionsJson` 메소드를 사용하여 다양한 HTTP 동사로 JSON 요청을 보낼 수 있습니다. 또한 이러한 메소드에 데이터와 헤더를 쉽게 전달할 수 있습니다. 시작하기 위해 `/api/user`에 `POST` 요청을 보내고 예상된 JSON 데이터가 반환되었는지 확인하는 테스트를 작성해 보겠습니다.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 기본 기능 테스트 예제.
     */
    public function test_making_an_api_request(): void
    {
        $response = $this->postJson('/api/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJson([
                'created' => true,
            ]);
    }
}
```

또한 JSON 응답 데이터는 응답의 배열 변수로 접근할 수 있어 JSON 응답 내에서 반환된 개별 값을 편리하게 검사할 수 있습니다.

```php
$this->assertTrue($response['created']);
```

> [!NOTE]
> `assertJson` 메소드는 응답을 배열로 변환하고 `PHPUnit::assertArraySubset`을 활용하여 애플리케이션에서 반환된 JSON 응답 내에 주어진 배열이 존재하는지 확인합니다. 따라서 JSON 응답에 다른 속성이 있더라도 주어진 조각이 존재하는 한 이 테스트는 통과합니다.

<a name="verifying-exact-match"></a>
#### 정확한 JSON 일치 검증

앞서 언급했듯이 `assertJson` 메소드는 JSON 응답 내에 JSON 조각이 존재하는지 확인하는 데 사용할 수 있습니다. 주어진 배열이 애플리케이션에서 반환된 JSON과 **정확히 일치**하는지 확인하려면 `assertExactJson` 메소드를 사용해야 합니다.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 기본 기능 테스트 예제.
     */
    public function test_asserting_an_exact_json_match(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertExactJson([
                'created' => true,
            ]);
    }
}
```

<a name="verifying-json-paths"></a>
#### JSON 경로에 대한 검증

JSON 응답이 지정된 경로에 주어진 데이터를 포함하는지 확인하려면 `assertJsonPath` 메소드를 사용해야 합니다.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 기본 기능 테스트 예제.
     */
    public function test_asserting_a_json_paths_value(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJsonPath('team.owner.name', 'Darian');
    }
}
```

`assertJsonPath` 메소드는 클로저도 허용하며, 이를 사용하여 assertion이 통과해야 하는지 동적으로 결정할 수 있습니다.

```php
$response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

<a name="fluent-json-testing"></a>
### Fluent JSON 테스트

Laravel은 애플리케이션의 JSON 응답을 유창하게 테스트하는 아름다운 방법도 제공합니다. 시작하려면 `assertJson` 메소드에 클로저를 전달하세요. 이 클로저는 애플리케이션에서 반환된 JSON에 대해 assertion을 만드는 데 사용할 수 있는 `Illuminate\Testing\Fluent\AssertableJson` 인스턴스와 함께 호출됩니다. `where` 메소드는 JSON의 특정 속성에 대한 assertion을 만드는 데 사용할 수 있고, `missing` 메소드는 특정 속성이 JSON에서 누락되었는지 확인하는 데 사용할 수 있습니다.

```php
use Illuminate\Testing\Fluent\AssertableJson;

/**
 * 기본 기능 테스트 예제.
 */
public function test_fluent_json(): void
{
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                ->where('name', 'Victoria Faith')
                ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                ->whereNot('status', 'pending')
                ->missing('password')
                ->etc()
        );
}
```

#### `etc` 메소드 이해하기

위의 예제에서 assertion 체인의 끝에 `etc` 메소드를 호출한 것을 보셨을 것입니다. 이 메소드는 Laravel에게 JSON 객체에 다른 속성이 있을 수 있음을 알려줍니다. `etc` 메소드를 사용하지 않으면 assertion을 만들지 않은 다른 속성이 JSON 객체에 존재하는 경우 테스트가 실패합니다.

이 동작의 의도는 속성에 대해 명시적으로 assertion을 만들거나 `etc` 메소드를 통해 추가 속성을 명시적으로 허용하도록 강제하여 JSON 응답에서 민감한 정보를 의도치 않게 노출하는 것을 방지하는 것입니다.

그러나 assertion 체인에 `etc` 메소드를 포함하지 않는다고 해서 JSON 객체 내에 중첩된 배열에 추가 속성이 추가되지 않는 것은 아닙니다. `etc` 메소드는 `etc` 메소드가 호출된 중첩 수준에서 추가 속성이 존재하지 않는다는 것만 보장합니다.

<a name="asserting-json-attribute-presence-and-absence"></a>
#### 속성 존재 / 부재 검증

속성이 존재하거나 부재하는지 확인하려면 `has` 및 `missing` 메소드를 사용할 수 있습니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('data')
        ->missing('message')
);
```

또한 `hasAll` 및 `missingAll` 메소드를 사용하면 여러 속성의 존재 또는 부재를 동시에 확인할 수 있습니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->hasAll(['status', 'data'])
        ->missingAll(['message', 'code'])
);
```

`hasAny` 메소드를 사용하여 주어진 속성 목록 중 적어도 하나가 존재하는지 확인할 수 있습니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('status')
        ->hasAny('data', 'message', 'code')
);
```

<a name="asserting-against-json-collections"></a>
#### JSON 컬렉션에 대한 검증

종종 라우트는 여러 사용자와 같은 여러 항목을 포함하는 JSON 응답을 반환합니다.

```php
Route::get('/users', function () {
    return User::all();
});
```

이러한 상황에서 fluent JSON 객체의 `has` 메소드를 사용하여 응답에 포함된 사용자에 대한 assertion을 만들 수 있습니다. 예를 들어, JSON 응답이 세 명의 사용자를 포함하는지 확인해 보겠습니다. 다음으로 `first` 메소드를 사용하여 컬렉션의 첫 번째 사용자에 대해 몇 가지 assertion을 만들겠습니다. `first` 메소드는 JSON 컬렉션의 첫 번째 객체에 대해 assertion을 만드는 데 사용할 수 있는 또 다른 assertable JSON 문자열을 받는 클로저를 허용합니다.

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has(3)
            ->first(fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

<a name="scoping-json-collection-assertions"></a>
#### JSON 컬렉션 Assertion 스코핑

때때로 애플리케이션의 라우트는 이름이 지정된 키에 할당된 JSON 컬렉션을 반환합니다.

```php
Route::get('/users', function () {
    return [
        'meta' => [...],
        'users' => User::all(),
    ];
})
```

이러한 라우트를 테스트할 때 `has` 메소드를 사용하여 컬렉션의 항목 수에 대해 assertion을 만들 수 있습니다. 또한 `has` 메소드를 사용하여 assertion 체인을 스코핑할 수 있습니다.

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
            ->has('users', 3)
            ->has('users.0', fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

그러나 `users` 컬렉션에 대해 `has` 메소드를 두 번 별도로 호출하는 대신, 세 번째 매개변수로 클로저를 제공하는 단일 호출을 만들 수 있습니다. 이렇게 하면 클로저가 자동으로 호출되고 컬렉션의 첫 번째 항목으로 스코핑됩니다.

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
            ->has('users', 3, fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

<a name="asserting-json-types"></a>
#### JSON 타입 검증

JSON 응답의 속성이 특정 타입인지만 확인하고 싶을 수 있습니다. `Illuminate\Testing\Fluent\AssertableJson` 클래스는 이를 위해 `whereType` 및 `whereAllType` 메소드를 제공합니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('id', 'integer')
        ->whereAllType([
            'users.0.name' => 'string',
            'meta' => 'array'
        ])
);
```

`|` 문자를 사용하거나 `whereType` 메소드의 두 번째 매개변수로 타입 배열을 전달하여 여러 타입을 지정할 수 있습니다. 응답 값이 나열된 타입 중 하나이면 assertion이 성공합니다.

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('name', 'string|null')
        ->whereType('id', ['string', 'integer'])
);
```

`whereType` 및 `whereAllType` 메소드는 다음 타입을 인식합니다: `string`, `integer`, `double`, `boolean`, `array`, `null`.

<a name="testing-file-uploads"></a>
## 파일 업로드 테스트

`Illuminate\Http\UploadedFile` 클래스는 테스트용 더미 파일이나 이미지를 생성하는 데 사용할 수 있는 `fake` 메소드를 제공합니다. 이것을 `Storage` 파사드의 `fake` 메소드와 결합하면 파일 업로드 테스트가 크게 단순화됩니다. 예를 들어, 이 두 기능을 결합하여 아바타 업로드 폼을 쉽게 테스트할 수 있습니다.

```php
<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_avatars_can_be_uploaded(): void
    {
        Storage::fake('avatars');

        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->post('/avatar', [
            'avatar' => $file,
        ]);

        Storage::disk('avatars')->assertExists($file->hashName());
    }
}
```

주어진 파일이 존재하지 않는다고 검증하려면 `Storage` 파사드에서 제공하는 `assertMissing` 메소드를 사용할 수 있습니다.

```php
Storage::fake('avatars');

// ...

Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a name="fake-file-customization"></a>
#### 가짜 파일 커스터마이징

`UploadedFile` 클래스에서 제공하는 `fake` 메소드를 사용하여 파일을 생성할 때 이미지의 너비, 높이 및 크기(킬로바이트 단위)를 지정하여 애플리케이션의 유효성 검사 규칙을 더 잘 테스트할 수 있습니다.

```php
UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

이미지 생성 외에도 `create` 메소드를 사용하여 다른 유형의 파일을 생성할 수 있습니다.

```php
UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

필요한 경우 메소드에 `$mimeType` 인수를 전달하여 파일에서 반환해야 하는 MIME 타입을 명시적으로 정의할 수 있습니다.

```php
UploadedFile::fake()->create(
    'document.pdf', $sizeInKilobytes, 'application/pdf'
);
```

<a name="testing-views"></a>
## 뷰 테스트

Laravel은 애플리케이션에 시뮬레이션된 HTTP 요청을 보내지 않고도 뷰를 렌더링할 수 있게 해줍니다. 이를 위해 테스트 내에서 `view` 메소드를 호출할 수 있습니다. `view` 메소드는 뷰 이름과 선택적 데이터 배열을 받습니다. 이 메소드는 뷰의 내용에 대해 편리하게 assertion을 만들 수 있는 여러 메소드를 제공하는 `Illuminate\Testing\TestView` 인스턴스를 반환합니다.

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_a_welcome_view_can_be_rendered(): void
    {
        $view = $this->view('welcome', ['name' => 'Taylor']);

        $view->assertSee('Taylor');
    }
}
```

`TestView` 클래스는 다음 assertion 메소드를 제공합니다: `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee`, `assertDontSeeText`.

필요한 경우 `TestView` 인스턴스를 문자열로 캐스팅하여 원시 렌더링된 뷰 내용을 가져올 수 있습니다.

```php
$contents = (string) $this->view('welcome');
```

<a name="sharing-errors"></a>
#### 에러 공유

일부 뷰는 [Laravel이 제공하는 전역 에러 백](/docs/{{version}}/validation#quick-displaying-the-validation-errors)에서 공유되는 에러에 의존할 수 있습니다. 에러 백을 에러 메시지로 채우려면 `withViewErrors` 메소드를 사용할 수 있습니다.

```php
$view = $this->withViewErrors([
    'name' => ['Please provide a valid name.']
])->view('form');

$view->assertSee('Please provide a valid name.');
```

<a name="rendering-blade-and-components"></a>
### Blade와 컴포넌트 렌더링

필요한 경우 `blade` 메소드를 사용하여 원시 [Blade](/docs/{{version}}/blade) 문자열을 평가하고 렌더링할 수 있습니다. `view` 메소드와 마찬가지로 `blade` 메소드는 `Illuminate\Testing\TestView` 인스턴스를 반환합니다.

```php
$view = $this->blade(
    '<x-component :name="$name" />',
    ['name' => 'Taylor']
);

$view->assertSee('Taylor');
```

`component` 메소드를 사용하여 [Blade 컴포넌트](/docs/{{version}}/blade#components)를 평가하고 렌더링할 수 있습니다. `component` 메소드는 `Illuminate\Testing\TestComponent` 인스턴스를 반환합니다.

```php
$view = $this->component(Profile::class, ['name' => 'Taylor']);

$view->assertSee('Taylor');
```

<a name="available-assertions"></a>
## 사용 가능한 Assertions

<a name="response-assertions"></a>
### 응답 Assertions

Laravel의 `Illuminate\Testing\TestResponse` 클래스는 애플리케이션을 테스트할 때 활용할 수 있는 다양한 커스텀 assertion 메소드를 제공합니다. 이러한 assertion은 `json`, `get`, `post`, `put`, `delete` 테스트 메소드에서 반환된 응답에서 접근할 수 있습니다.

<style>
    .collection-method-list > p {
        columns: 14.4em 2; -moz-columns: 14.4em 2; -webkit-columns: 14.4em 2;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<div class="collection-method-list" markdown="1">

[assertAccepted](#assert-accepted)
[assertBadRequest](#assert-bad-request)
[assertConflict](#assert-conflict)
[assertCookie](#assert-cookie)
[assertCookieExpired](#assert-cookie-expired)
[assertCookieNotExpired](#assert-cookie-not-expired)
[assertCookieMissing](#assert-cookie-missing)
[assertCreated](#assert-created)
[assertDontSee](#assert-dont-see)
[assertDontSeeText](#assert-dont-see-text)
[assertDownload](#assert-download)
[assertExactJson](#assert-exact-json)
[assertForbidden](#assert-forbidden)
[assertFound](#assert-found)
[assertGone](#assert-gone)
[assertHeader](#assert-header)
[assertHeaderMissing](#assert-header-missing)
[assertInternalServerError](#assert-internal-server-error)
[assertJson](#assert-json)
[assertJsonCount](#assert-json-count)
[assertJsonFragment](#assert-json-fragment)
[assertJsonIsArray](#assert-json-is-array)
[assertJsonIsObject](#assert-json-is-object)
[assertJsonMissing](#assert-json-missing)
[assertJsonMissingExact](#assert-json-missing-exact)
[assertJsonMissingValidationErrors](#assert-json-missing-validation-errors)
[assertJsonPath](#assert-json-path)
[assertJsonMissingPath](#assert-json-missing-path)
[assertJsonStructure](#assert-json-structure)
[assertJsonValidationErrors](#assert-json-validation-errors)
[assertJsonValidationErrorFor](#assert-json-validation-error-for)
[assertLocation](#assert-location)
[assertMethodNotAllowed](#assert-method-not-allowed)
[assertMovedPermanently](#assert-moved-permanently)
[assertContent](#assert-content)
[assertNoContent](#assert-no-content)
[assertStreamedContent](#assert-streamed-content)
[assertNotFound](#assert-not-found)
[assertOk](#assert-ok)
[assertPaymentRequired](#assert-payment-required)
[assertPlainCookie](#assert-plain-cookie)
[assertRedirect](#assert-redirect)
[assertRedirectContains](#assert-redirect-contains)
[assertRedirectToRoute](#assert-redirect-to-route)
[assertRedirectToSignedRoute](#assert-redirect-to-signed-route)
[assertRequestTimeout](#assert-request-timeout)
[assertSee](#assert-see)
[assertSeeInOrder](#assert-see-in-order)
[assertSeeText](#assert-see-text)
[assertSeeTextInOrder](#assert-see-text-in-order)
[assertServerError](#assert-server-error)
[assertServiceUnavailable](#assert-server-unavailable)
[assertSessionHas](#assert-session-has)
[assertSessionHasInput](#assert-session-has-input)
[assertSessionHasAll](#assert-session-has-all)
[assertSessionHasErrors](#assert-session-has-errors)
[assertSessionHasErrorsIn](#assert-session-has-errors-in)
[assertSessionHasNoErrors](#assert-session-has-no-errors)
[assertSessionDoesntHaveErrors](#assert-session-doesnt-have-errors)
[assertSessionMissing](#assert-session-missing)
[assertStatus](#assert-status)
[assertSuccessful](#assert-successful)
[assertTooManyRequests](#assert-too-many-requests)
[assertUnauthorized](#assert-unauthorized)
[assertUnprocessable](#assert-unprocessable)
[assertUnsupportedMediaType](#assert-unsupported-media-type)
[assertValid](#assert-valid)
[assertInvalid](#assert-invalid)
[assertViewHas](#assert-view-has)
[assertViewHasAll](#assert-view-has-all)
[assertViewIs](#assert-view-is)
[assertViewMissing](#assert-view-missing)

</div>

<a name="assert-bad-request"></a>
#### assertBadRequest

응답이 잘못된 요청(400) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertBadRequest();
```

<a name="assert-accepted"></a>
#### assertAccepted

응답이 수락됨(202) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertAccepted();
```

<a name="assert-conflict"></a>
#### assertConflict

응답이 충돌(409) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertConflict();
```

<a name="assert-cookie"></a>
#### assertCookie

응답에 주어진 쿠키가 포함되어 있는지 검증합니다.

```php
$response->assertCookie($cookieName, $value = null);
```

<a name="assert-cookie-expired"></a>
#### assertCookieExpired

응답에 주어진 쿠키가 포함되어 있고 만료되었는지 검증합니다.

```php
$response->assertCookieExpired($cookieName);
```

<a name="assert-cookie-not-expired"></a>
#### assertCookieNotExpired

응답에 주어진 쿠키가 포함되어 있고 만료되지 않았는지 검증합니다.

```php
$response->assertCookieNotExpired($cookieName);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

응답에 주어진 쿠키가 포함되어 있지 않은지 검증합니다.

```php
$response->assertCookieMissing($cookieName);
```

<a name="assert-created"></a>
#### assertCreated

응답이 201 HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertCreated();
```

<a name="assert-dont-see"></a>
#### assertDontSee

주어진 문자열이 애플리케이션에서 반환된 응답에 포함되어 있지 않은지 검증합니다. 이 assertion은 두 번째 인수로 `false`를 전달하지 않는 한 주어진 문자열을 자동으로 이스케이프합니다.

```php
$response->assertDontSee($value, $escaped = true);
```

<a name="assert-dont-see-text"></a>
#### assertDontSeeText

주어진 문자열이 응답 텍스트에 포함되어 있지 않은지 검증합니다. 이 assertion은 두 번째 인수로 `false`를 전달하지 않는 한 주어진 문자열을 자동으로 이스케이프합니다. 이 메소드는 assertion을 만들기 전에 응답 내용을 `strip_tags` PHP 함수에 전달합니다.

```php
$response->assertDontSeeText($value, $escaped = true);
```

<a name="assert-download"></a>
#### assertDownload

응답이 "다운로드"인지 검증합니다. 일반적으로 이는 응답을 반환한 호출된 라우트가 `Response::download` 응답, `BinaryFileResponse`, 또는 `Storage::download` 응답을 반환했음을 의미합니다.

```php
$response->assertDownload();
```

원하는 경우 다운로드 가능한 파일에 주어진 파일 이름이 할당되었는지 검증할 수 있습니다.

```php
$response->assertDownload('image.jpg');
```

<a name="assert-exact-json"></a>
#### assertExactJson

응답에 주어진 JSON 데이터와 정확히 일치하는 내용이 포함되어 있는지 검증합니다.

```php
$response->assertExactJson(array $data);
```

<a name="assert-forbidden"></a>
#### assertForbidden

응답이 금지됨(403) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertForbidden();
```

<a name="assert-found"></a>
#### assertFound

응답이 발견됨(302) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertFound();
```

<a name="assert-gone"></a>
#### assertGone

응답이 삭제됨(410) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertGone();
```

<a name="assert-header"></a>
#### assertHeader

주어진 헤더와 값이 응답에 존재하는지 검증합니다.

```php
$response->assertHeader($headerName, $value = null);
```

<a name="assert-header-missing"></a>
#### assertHeaderMissing

주어진 헤더가 응답에 존재하지 않는지 검증합니다.

```php
$response->assertHeaderMissing($headerName);
```

<a name="assert-internal-server-error"></a>
#### assertInternalServerError

응답이 "내부 서버 오류"(500) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertInternalServerError();
```

<a name="assert-json"></a>
#### assertJson

응답에 주어진 JSON 데이터가 포함되어 있는지 검증합니다.

```php
$response->assertJson(array $data, $strict = false);
```

`assertJson` 메소드는 응답을 배열로 변환하고 `PHPUnit::assertArraySubset`을 활용하여 애플리케이션에서 반환된 JSON 응답 내에 주어진 배열이 존재하는지 확인합니다. 따라서 JSON 응답에 다른 속성이 있더라도 주어진 조각이 존재하는 한 이 테스트는 통과합니다.

<a name="assert-json-count"></a>
#### assertJsonCount

응답 JSON이 주어진 키에서 예상된 항목 수를 가진 배열을 가지고 있는지 검증합니다.

```php
$response->assertJsonCount($count, $key = null);
```

<a name="assert-json-fragment"></a>
#### assertJsonFragment

응답의 어디에서나 주어진 JSON 데이터가 포함되어 있는지 검증합니다.

```php
Route::get('/users', function () {
    return [
        'users' => [
            [
                'name' => 'Taylor Otwell',
            ],
        ],
    ];
});

$response->assertJsonFragment(['name' => 'Taylor Otwell']);
```

<a name="assert-json-is-array"></a>
#### assertJsonIsArray

응답 JSON이 배열인지 검증합니다.

```php
$response->assertJsonIsArray();
```

<a name="assert-json-is-object"></a>
#### assertJsonIsObject

응답 JSON이 객체인지 검증합니다.

```php
$response->assertJsonIsObject();
```

<a name="assert-json-missing"></a>
#### assertJsonMissing

응답에 주어진 JSON 데이터가 포함되어 있지 않은지 검증합니다.

```php
$response->assertJsonMissing(array $data);
```

<a name="assert-json-missing-exact"></a>
#### assertJsonMissingExact

응답에 정확한 JSON 데이터가 포함되어 있지 않은지 검증합니다.

```php
$response->assertJsonMissingExact(array $data);
```

<a name="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

응답에 주어진 키에 대한 JSON 유효성 검사 에러가 없는지 검증합니다.

```php
$response->assertJsonMissingValidationErrors($keys);
```

> [!NOTE]
> 더 일반적인 [assertValid](#assert-valid) 메소드를 사용하여 응답에 JSON으로 반환된 유효성 검사 에러가 없고 세션 스토리지에 에러가 플래시되지 않았는지 검증할 수 있습니다.

<a name="assert-json-path"></a>
#### assertJsonPath

응답에 지정된 경로에 주어진 데이터가 포함되어 있는지 검증합니다.

```php
$response->assertJsonPath($path, $expectedValue);
```

예를 들어, 애플리케이션에서 다음 JSON 응답이 반환되는 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

`user` 객체의 `name` 속성이 주어진 값과 일치하는지 다음과 같이 검증할 수 있습니다.

```php
$response->assertJsonPath('user.name', 'Steve Schoger');
```

<a name="assert-json-missing-path"></a>
#### assertJsonMissingPath

응답에 주어진 경로가 포함되어 있지 않은지 검증합니다.

```php
$response->assertJsonMissingPath($path);
```

예를 들어, 애플리케이션에서 다음 JSON 응답이 반환되는 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

`user` 객체에 `email` 속성이 포함되어 있지 않은지 검증할 수 있습니다.

```php
$response->assertJsonMissingPath('user.email');
```

<a name="assert-json-structure"></a>
#### assertJsonStructure

응답이 주어진 JSON 구조를 가지고 있는지 검증합니다.

```php
$response->assertJsonStructure(array $structure);
```

예를 들어, 애플리케이션에서 반환된 JSON 응답이 다음 데이터를 포함하는 경우:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

JSON 구조가 예상과 일치하는지 다음과 같이 검증할 수 있습니다.

```php
$response->assertJsonStructure([
    'user' => [
        'name',
    ]
]);
```

때때로 애플리케이션에서 반환된 JSON 응답에는 객체 배열이 포함될 수 있습니다.

```json
{
    "user": [
        {
            "name": "Steve Schoger",
            "age": 55,
            "location": "Earth"
        },
        {
            "name": "Mary Schoger",
            "age": 60,
            "location": "Earth"
        }
    ]
}
```

이 상황에서 `*` 문자를 사용하여 배열의 모든 객체 구조에 대해 assertion을 만들 수 있습니다.

```php
$response->assertJsonStructure([
    'user' => [
        '*' => [
             'name',
             'age',
             'location'
        ]
    ]
]);
```

<a name="assert-json-validation-errors"></a>
#### assertJsonValidationErrors

응답에 주어진 키에 대한 주어진 JSON 유효성 검사 에러가 있는지 검증합니다. 이 메소드는 유효성 검사 에러가 세션에 플래시되는 대신 JSON 구조로 반환되는 응답을 검증할 때 사용해야 합니다.

```php
$response->assertJsonValidationErrors(array $data, $responseKey = 'errors');
```

> [!NOTE]
> 더 일반적인 [assertInvalid](#assert-invalid) 메소드를 사용하여 응답에 JSON으로 반환된 유효성 검사 에러가 있거나 세션 스토리지에 에러가 플래시되었는지 검증할 수 있습니다.

<a name="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

응답에 주어진 키에 대한 JSON 유효성 검사 에러가 있는지 검증합니다.

```php
$response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');
```

<a name="assert-method-not-allowed"></a>
#### assertMethodNotAllowed

응답이 메소드 허용되지 않음(405) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertMethodNotAllowed();
```

<a name="assert-moved-permanently"></a>
#### assertMovedPermanently

응답이 영구 이동됨(301) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertMovedPermanently();
```

<a name="assert-location"></a>
#### assertLocation

응답의 `Location` 헤더에 주어진 URI 값이 있는지 검증합니다.

```php
$response->assertLocation($uri);
```

<a name="assert-content"></a>
#### assertContent

주어진 문자열이 응답 내용과 일치하는지 검증합니다.

```php
$response->assertContent($value);
```

<a name="assert-no-content"></a>
#### assertNoContent

응답이 주어진 HTTP 상태 코드를 가지고 있고 내용이 없는지 검증합니다.

```php
$response->assertNoContent($status = 204);
```

<a name="assert-streamed-content"></a>
#### assertStreamedContent

주어진 문자열이 스트리밍된 응답 내용과 일치하는지 검증합니다.

```php
$response->assertStreamedContent($value);
```

<a name="assert-not-found"></a>
#### assertNotFound

응답이 찾을 수 없음(404) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertNotFound();
```

<a name="assert-ok"></a>
#### assertOk

응답이 200 HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertOk();
```

<a name="assert-payment-required"></a>
#### assertPaymentRequired

응답이 결제 필요(402) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertPaymentRequired();
```

<a name="assert-plain-cookie"></a>
#### assertPlainCookie

응답에 주어진 암호화되지 않은 쿠키가 포함되어 있는지 검증합니다.

```php
$response->assertPlainCookie($cookieName, $value = null);
```

<a name="assert-redirect"></a>
#### assertRedirect

응답이 주어진 URI로 리다이렉트되는지 검증합니다.

```php
$response->assertRedirect($uri = null);
```

<a name="assert-redirect-contains"></a>
#### assertRedirectContains

응답이 주어진 문자열을 포함하는 URI로 리다이렉트되는지 검증합니다.

```php
$response->assertRedirectContains($string);
```

<a name="assert-redirect-to-route"></a>
#### assertRedirectToRoute

응답이 주어진 [이름이 지정된 라우트](/docs/{{version}}/routing#named-routes)로 리다이렉트되는지 검증합니다.

```php
$response->assertRedirectToRoute($name, $parameters = []);
```

<a name="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

응답이 주어진 [서명된 라우트](/docs/{{version}}/urls#signed-urls)로 리다이렉트되는지 검증합니다.

```php
$response->assertRedirectToSignedRoute($name = null, $parameters = []);
```

<a name="assert-request-timeout"></a>
#### assertRequestTimeout

응답이 요청 시간 초과(408) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertRequestTimeout();
```

<a name="assert-see"></a>
#### assertSee

주어진 문자열이 응답에 포함되어 있는지 검증합니다. 이 assertion은 두 번째 인수로 `false`를 전달하지 않는 한 주어진 문자열을 자동으로 이스케이프합니다.

```php
$response->assertSee($value, $escaped = true);
```

<a name="assert-see-in-order"></a>
#### assertSeeInOrder

주어진 문자열들이 응답 내에 순서대로 포함되어 있는지 검증합니다. 이 assertion은 두 번째 인수로 `false`를 전달하지 않는 한 주어진 문자열들을 자동으로 이스케이프합니다.

```php
$response->assertSeeInOrder(array $values, $escaped = true);
```

<a name="assert-see-text"></a>
#### assertSeeText

주어진 문자열이 응답 텍스트에 포함되어 있는지 검증합니다. 이 assertion은 두 번째 인수로 `false`를 전달하지 않는 한 주어진 문자열을 자동으로 이스케이프합니다. 응답 내용은 assertion이 만들어지기 전에 `strip_tags` PHP 함수에 전달됩니다.

```php
$response->assertSeeText($value, $escaped = true);
```

<a name="assert-see-text-in-order"></a>
#### assertSeeTextInOrder

주어진 문자열들이 응답 텍스트 내에 순서대로 포함되어 있는지 검증합니다. 이 assertion은 두 번째 인수로 `false`를 전달하지 않는 한 주어진 문자열들을 자동으로 이스케이프합니다. 응답 내용은 assertion이 만들어지기 전에 `strip_tags` PHP 함수에 전달됩니다.

```php
$response->assertSeeTextInOrder(array $values, $escaped = true);
```

<a name="assert-server-error"></a>
#### assertServerError

응답이 서버 오류(>= 500, < 600) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertServerError();
```

<a name="assert-server-unavailable"></a>
#### assertServiceUnavailable

응답이 "서비스를 사용할 수 없음"(503) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertServiceUnavailable();
```

<a name="assert-session-has"></a>
#### assertSessionHas

세션에 주어진 데이터가 포함되어 있는지 검증합니다.

```php
$response->assertSessionHas($key, $value = null);
```

필요한 경우 `assertSessionHas` 메소드의 두 번째 인수로 클로저를 제공할 수 있습니다. 클로저가 `true`를 반환하면 assertion이 통과합니다.

```php
$response->assertSessionHas($key, function (User $value) {
    return $value->name === 'Taylor Otwell';
});
```

<a name="assert-session-has-input"></a>
#### assertSessionHasInput

세션의 [플래시된 입력 배열](/docs/{{version}}/responses#redirecting-with-flashed-session-data)에 주어진 값이 있는지 검증합니다.

```php
$response->assertSessionHasInput($key, $value = null);
```

필요한 경우 `assertSessionHasInput` 메소드의 두 번째 인수로 클로저를 제공할 수 있습니다. 클로저가 `true`를 반환하면 assertion이 통과합니다.

```php
use Illuminate\Support\Facades\Crypt;

$response->assertSessionHasInput($key, function (string $value) {
    return Crypt::decryptString($value) === 'secret';
});
```

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

세션에 주어진 키/값 쌍의 배열이 포함되어 있는지 검증합니다.

```php
$response->assertSessionHasAll(array $data);
```

예를 들어, 애플리케이션의 세션에 `name`과 `status` 키가 포함되어 있는 경우, 둘 다 존재하고 지정된 값을 가지고 있는지 다음과 같이 검증할 수 있습니다.

```php
$response->assertSessionHasAll([
    'name' => 'Taylor Otwell',
    'status' => 'active',
]);
```

<a name="assert-session-has-errors"></a>
#### assertSessionHasErrors

세션에 주어진 `$keys`에 대한 에러가 포함되어 있는지 검증합니다. `$keys`가 연관 배열인 경우 세션에 각 필드(키)에 대한 특정 에러 메시지(값)가 포함되어 있는지 검증합니다. 이 메소드는 유효성 검사 에러를 JSON 구조로 반환하는 대신 세션에 플래시하는 라우트를 테스트할 때 사용해야 합니다.

```php
$response->assertSessionHasErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

예를 들어, `name`과 `email` 필드에 세션에 플래시된 유효성 검사 에러 메시지가 있는지 검증하려면 다음과 같이 `assertSessionHasErrors` 메소드를 호출할 수 있습니다.

```php
$response->assertSessionHasErrors(['name', 'email']);
```

또는 주어진 필드에 특정 유효성 검사 에러 메시지가 있는지 검증할 수 있습니다.

```php
$response->assertSessionHasErrors([
    'name' => 'The given name was invalid.'
]);
```

> [!NOTE]
> 더 일반적인 [assertInvalid](#assert-invalid) 메소드를 사용하여 응답에 JSON으로 반환된 유효성 검사 에러가 있거나 세션 스토리지에 에러가 플래시되었는지 검증할 수 있습니다.

<a name="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

특정 [에러 백](/docs/{{version}}/validation#named-error-bags) 내에서 세션에 주어진 `$keys`에 대한 에러가 포함되어 있는지 검증합니다. `$keys`가 연관 배열인 경우 에러 백 내에서 세션에 각 필드(키)에 대한 특정 에러 메시지(값)가 포함되어 있는지 검증합니다.

```php
$response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a name="assert-session-has-no-errors"></a>
#### assertSessionHasNoErrors

세션에 유효성 검사 에러가 없는지 검증합니다.

```php
$response->assertSessionHasNoErrors();
```

<a name="assert-session-doesnt-have-errors"></a>
#### assertSessionDoesntHaveErrors

세션에 주어진 키에 대한 유효성 검사 에러가 없는지 검증합니다.

```php
$response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

> [!NOTE]
> 더 일반적인 [assertValid](#assert-valid) 메소드를 사용하여 응답에 JSON으로 반환된 유효성 검사 에러가 없고 세션 스토리지에 에러가 플래시되지 않았는지 검증할 수 있습니다.

<a name="assert-session-missing"></a>
#### assertSessionMissing

세션에 주어진 키가 포함되어 있지 않은지 검증합니다.

```php
$response->assertSessionMissing($key);
```

<a name="assert-status"></a>
#### assertStatus

응답이 주어진 HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertStatus($code);
```

<a name="assert-successful"></a>
#### assertSuccessful

응답이 성공적인(>= 200 및 < 300) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertSuccessful();
```

<a name="assert-too-many-requests"></a>
#### assertTooManyRequests

응답이 너무 많은 요청(429) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertTooManyRequests();
```

<a name="assert-unauthorized"></a>
#### assertUnauthorized

응답이 인증되지 않음(401) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertUnauthorized();
```

<a name="assert-unprocessable"></a>
#### assertUnprocessable

응답이 처리할 수 없는 엔티티(422) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertUnprocessable();
```

<a name="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

응답이 지원되지 않는 미디어 타입(415) HTTP 상태 코드를 가지고 있는지 검증합니다.

```php
$response->assertUnsupportedMediaType();
```

<a name="assert-valid"></a>
#### assertValid

응답에 주어진 키에 대한 유효성 검사 에러가 없는지 검증합니다. 이 메소드는 유효성 검사 에러가 JSON 구조로 반환되거나 세션에 플래시된 응답을 검증하는 데 사용할 수 있습니다.

```php
// 유효성 검사 에러가 없는지 검증...
$response->assertValid();

// 주어진 키에 유효성 검사 에러가 없는지 검증...
$response->assertValid(['name', 'email']);
```

<a name="assert-invalid"></a>
#### assertInvalid

응답에 주어진 키에 대한 유효성 검사 에러가 있는지 검증합니다. 이 메소드는 유효성 검사 에러가 JSON 구조로 반환되거나 세션에 플래시된 응답을 검증하는 데 사용할 수 있습니다.

```php
$response->assertInvalid(['name', 'email']);
```

주어진 키에 특정 유효성 검사 에러 메시지가 있는지도 검증할 수 있습니다. 이 경우 전체 메시지 또는 메시지의 일부만 제공할 수 있습니다.

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```

<a name="assert-view-has"></a>
#### assertViewHas

응답 뷰에 주어진 데이터가 포함되어 있는지 검증합니다.

```php
$response->assertViewHas($key, $value = null);
```

`assertViewHas` 메소드의 두 번째 인수로 클로저를 전달하면 특정 뷰 데이터를 검사하고 assertion을 만들 수 있습니다.

```php
$response->assertViewHas('user', function (User $user) {
    return $user->name === 'Taylor';
});
```

또한 뷰 데이터는 응답의 배열 변수로 접근할 수 있어 편리하게 검사할 수 있습니다.

```php
$this->assertEquals('Taylor', $response['name']);
```

<a name="assert-view-has-all"></a>
#### assertViewHasAll

응답 뷰에 주어진 데이터 목록이 있는지 검증합니다.

```php
$response->assertViewHasAll(array $data);
```

이 메소드는 뷰에 주어진 키와 일치하는 데이터가 단순히 포함되어 있는지 검증하는 데 사용할 수 있습니다.

```php
$response->assertViewHasAll([
    'name',
    'email',
]);
```

또는 뷰 데이터가 존재하고 특정 값을 가지고 있는지 검증할 수 있습니다.

```php
$response->assertViewHasAll([
    'name' => 'Taylor Otwell',
    'email' => 'taylor@example.com,',
]);
```

<a name="assert-view-is"></a>
#### assertViewIs

주어진 뷰가 라우트에서 반환되었는지 검증합니다.

```php
$response->assertViewIs($value);
```

<a name="assert-view-missing"></a>
#### assertViewMissing

주어진 데이터 키가 애플리케이션의 응답에서 반환된 뷰에서 사용 가능하지 않은지 검증합니다.

```php
$response->assertViewMissing($key);
```

<a name="authentication-assertions"></a>
### 인증 Assertions

Laravel은 애플리케이션의 기능 테스트 내에서 활용할 수 있는 다양한 인증 관련 assertion도 제공합니다. 이러한 메소드는 `get` 및 `post`와 같은 메소드에서 반환된 `Illuminate\Testing\TestResponse` 인스턴스가 아닌 테스트 클래스 자체에서 호출됩니다.

<a name="assert-authenticated"></a>
#### assertAuthenticated

사용자가 인증되었는지 검증합니다.

```php
$this->assertAuthenticated($guard = null);
```

<a name="assert-guest"></a>
#### assertGuest

사용자가 인증되지 않았는지 검증합니다.

```php
$this->assertGuest($guard = null);
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

특정 사용자가 인증되었는지 검증합니다.

```php
$this->assertAuthenticatedAs($user, $guard = null);
```

<a name="validation-assertions"></a>
## 유효성 검사 Assertions

Laravel은 요청에 제공된 데이터가 유효하거나 유효하지 않은지 확인하는 데 사용할 수 있는 두 가지 주요 유효성 검사 관련 assertion을 제공합니다.

<a name="validation-assert-valid"></a>
#### assertValid

응답에 주어진 키에 대한 유효성 검사 에러가 없는지 검증합니다. 이 메소드는 유효성 검사 에러가 JSON 구조로 반환되거나 세션에 플래시된 응답을 검증하는 데 사용할 수 있습니다.

```php
// 유효성 검사 에러가 없는지 검증...
$response->assertValid();

// 주어진 키에 유효성 검사 에러가 없는지 검증...
$response->assertValid(['name', 'email']);
```

<a name="validation-assert-invalid"></a>
#### assertInvalid

응답에 주어진 키에 대한 유효성 검사 에러가 있는지 검증합니다. 이 메소드는 유효성 검사 에러가 JSON 구조로 반환되거나 세션에 플래시된 응답을 검증하는 데 사용할 수 있습니다.

```php
$response->assertInvalid(['name', 'email']);
```

주어진 키에 특정 유효성 검사 에러 메시지가 있는지도 검증할 수 있습니다. 이 경우 전체 메시지 또는 메시지의 일부만 제공할 수 있습니다.

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```

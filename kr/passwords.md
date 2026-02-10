# 비밀번호 재설정

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 사전 요구 사항](#driver-prerequisites)
    - [모델 준비](#model-preparation)
    - [신뢰할 수 있는 호스트 설정](#configuring-trusted-hosts)
- [라우팅](#routing)
    - [비밀번호 재설정 링크 요청](#requesting-the-password-reset-link)
    - [비밀번호 재설정](#resetting-the-password)
- [만료된 토큰 삭제](#deleting-expired-tokens)
- [커스터마이징](#password-customization)

<a name="introduction"></a>
## 소개

대부분의 웹 애플리케이션은 사용자가 잊어버린 비밀번호를 재설정할 수 있는 방법을 제공합니다. Laravel은 여러분이 만드는 모든 애플리케이션에서 이를 직접 다시 구현하도록 강요하지 않고, 비밀번호 재설정 링크를 보내고 안전하게 비밀번호를 재설정할 수 있는 편리한 서비스를 제공합니다.

> [!NOTE]
> 빠르게 시작하고 싶으신가요? 새로운 Laravel 애플리케이션에 Laravel [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 설치하세요. Laravel의 스타터 킷은 잊어버린 비밀번호 재설정을 포함한 전체 인증 시스템의 스캐폴딩을 처리해 줍니다.

<a name="configuration"></a>
### 설정

애플리케이션의 비밀번호 재설정 설정 파일은 `config/auth.php`에 저장되어 있습니다. 이 파일에서 사용 가능한 옵션을 반드시 검토하세요. 기본적으로 Laravel은 `database` 비밀번호 재설정 드라이버를 사용하도록 설정되어 있습니다.

비밀번호 재설정 `driver` 설정 옵션은 비밀번호 재설정 데이터가 저장되는 위치를 정의합니다. Laravel에는 두 가지 드라이버가 포함되어 있습니다.

<div class="content-list" markdown="1">

- `database` - 비밀번호 재설정 데이터가 관계형 데이터베이스에 저장됩니다.
- `cache` - 비밀번호 재설정 데이터가 캐시 기반 저장소 중 하나에 저장됩니다.

</div>

<a name="driver-prerequisites"></a>
### 드라이버 사전 요구 사항

<a name="database"></a>
#### 데이터베이스(Database)

기본 `database` 드라이버를 사용할 때, 애플리케이션의 비밀번호 재설정 토큰을 저장할 테이블을 생성해야 합니다. 일반적으로 이것은 Laravel의 기본 `0001_01_01_000000_create_users_table.php` 데이터베이스 마이그레이션에 포함되어 있습니다.

<a name="cache"></a>
#### 캐시(Cache)

전용 데이터베이스 테이블이 필요 없는 비밀번호 재설정을 처리하기 위한 캐시 드라이버도 사용할 수 있습니다. 항목은 사용자의 이메일 주소로 키가 지정되므로, 애플리케이션의 다른 곳에서 이메일 주소를 캐시 키로 사용하지 않도록 주의하세요.

```php
'passwords' => [
    'users' => [
        'driver' => 'cache',
        'provider' => 'users',
        'store' => 'passwords', // 선택 사항...
        'expire' => 60,
        'throttle' => 60,
    ],
],
```

`artisan cache:clear` 호출로 비밀번호 재설정 데이터가 삭제되는 것을 방지하려면, `store` 설정 키를 사용하여 별도의 캐시 저장소를 선택적으로 지정할 수 있습니다. 이 값은 `config/cache.php` 설정 파일에 설정된 저장소와 일치해야 합니다.

<a name="model-preparation"></a>
### 모델 준비

Laravel의 비밀번호 재설정 기능을 사용하기 전에, 애플리케이션의 `App\Models\User` 모델은 `Illuminate\Notifications\Notifiable` 트레이트를 사용해야 합니다. 일반적으로 이 트레이트는 새로운 Laravel 애플리케이션과 함께 생성되는 기본 `App\Models\User` 모델에 이미 포함되어 있습니다.

다음으로, `App\Models\User` 모델이 `Illuminate\Contracts\Auth\CanResetPassword` 컨트랙트(Contract)를 구현하는지 확인하세요. 프레임워크에 포함된 `App\Models\User` 모델은 이미 이 인터페이스를 구현하고 있으며, 인터페이스 구현에 필요한 메서드를 포함하는 `Illuminate\Auth\Passwords\CanResetPassword` 트레이트를 사용합니다.

<a name="configuring-trusted-hosts"></a>
### 신뢰할 수 있는 호스트 설정

기본적으로 Laravel은 HTTP 요청의 `Host` 헤더 내용에 관계없이 수신하는 모든 요청에 응답합니다. 또한 웹 요청 중 애플리케이션에 대한 절대 URL을 생성할 때 `Host` 헤더의 값이 사용됩니다.

일반적으로 Nginx나 Apache와 같은 웹 서버에서 주어진 호스트 이름과 일치하는 요청만 애플리케이션으로 보내도록 설정해야 합니다. 그러나 웹 서버를 직접 커스터마이징할 수 없고 Laravel이 특정 호스트 이름에만 응답하도록 지시해야 하는 경우, 애플리케이션의 `bootstrap/app.php` 파일에서 `trustHosts` 미들웨어 메서드를 사용하여 그렇게 할 수 있습니다. 이것은 애플리케이션이 비밀번호 재설정 기능을 제공할 때 특히 중요합니다.

이 미들웨어 메서드에 대해 더 알아보려면 [TrustHosts 미들웨어 문서](/docs/{{version}}/requests#configuring-trusted-hosts)를 참조하세요.

<a name="routing"></a>
## 라우팅

사용자가 비밀번호를 재설정할 수 있도록 적절하게 지원하려면 여러 라우트를 정의해야 합니다. 먼저, 사용자가 이메일 주소를 통해 비밀번호 재설정 링크를 요청할 수 있도록 처리하는 라우트 쌍이 필요합니다. 두 번째로, 사용자가 이메일로 전송된 비밀번호 재설정 링크를 방문하여 비밀번호 재설정 양식을 완료한 후 실제로 비밀번호를 재설정하는 라우트 쌍이 필요합니다.

<a name="requesting-the-password-reset-link"></a>
### 비밀번호 재설정 링크 요청

<a name="the-password-reset-link-request-form"></a>
#### 비밀번호 재설정 링크 요청 양식

먼저 비밀번호 재설정 링크를 요청하는 데 필요한 라우트를 정의합니다. 시작하기 위해 비밀번호 재설정 링크 요청 양식이 있는 뷰를 반환하는 라우트를 정의합니다.

```php
Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->middleware('guest')->name('password.request');
```

이 라우트에서 반환되는 뷰에는 `email` 필드가 포함된 양식이 있어야 하며, 사용자가 주어진 이메일 주소에 대한 비밀번호 재설정 링크를 요청할 수 있도록 합니다.

<a name="password-reset-link-handling-the-form-submission"></a>
#### 양식 제출 처리

다음으로, "비밀번호 찾기" 뷰에서 양식 제출 요청을 처리하는 라우트를 정의합니다. 이 라우트는 이메일 주소의 유효성을 검사하고 해당 사용자에게 비밀번호 재설정 요청을 보내는 역할을 합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink(
        $request->only('email')
    );

    return $status === Password::ResetLinkSent
        ? back()->with(['status' => __($status)])
        : back()->withErrors(['email' => __($status)]);
})->middleware('guest')->name('password.email');
```

계속하기 전에 이 라우트를 더 자세히 살펴보겠습니다. 먼저 요청의 `email` 속성이 검증됩니다. 다음으로, Laravel의 내장 "비밀번호 브로커(Password Broker)"(`Password` 파사드를 통해)를 사용하여 사용자에게 비밀번호 재설정 링크를 보냅니다. 비밀번호 브로커는 주어진 필드(이 경우 이메일 주소)로 사용자를 조회하고 Laravel의 내장 [알림 시스템](/docs/{{version}}/notifications)을 통해 사용자에게 비밀번호 재설정 링크를 보내는 작업을 처리합니다.

`sendResetLink` 메서드는 "상태" 슬러그를 반환합니다. 이 상태는 사용자에게 요청 상태에 대한 사용자 친화적인 메시지를 표시하기 위해 Laravel의 [다국어 지원](/docs/{{version}}/localization) 헬퍼를 사용하여 번역될 수 있습니다. 비밀번호 재설정 상태의 번역은 애플리케이션의 `lang/{lang}/passwords.php` 언어 파일에 의해 결정됩니다. 상태 슬러그의 각 가능한 값에 대한 항목이 `passwords` 언어 파일 내에 있습니다.

> [!NOTE]
> 기본적으로 Laravel 애플리케이션 스켈레톤에는 `lang` 디렉토리가 포함되어 있지 않습니다. Laravel의 언어 파일을 커스터마이징하려면 `lang:publish` Artisan 명령어를 통해 배포할 수 있습니다.

`Password` 파사드의 `sendResetLink` 메서드를 호출할 때 Laravel이 애플리케이션의 데이터베이스에서 사용자 레코드를 어떻게 조회하는지 궁금할 수 있습니다. Laravel 비밀번호 브로커는 인증 시스템의 "사용자 프로바이더(User Provider)"를 활용하여 데이터베이스 레코드를 조회합니다. 비밀번호 브로커가 사용하는 사용자 프로바이더는 `config/auth.php` 설정 파일의 `passwords` 설정 배열 내에서 설정됩니다. 커스텀 사용자 프로바이더 작성에 대해 더 알아보려면 [인증 문서](/docs/{{version}}/authentication#adding-custom-user-providers)를 참조하세요.

> [!NOTE]
> 비밀번호 재설정을 수동으로 구현할 때는 뷰와 라우트의 내용을 직접 정의해야 합니다. 필요한 모든 인증 및 검증 로직이 포함된 스캐폴딩을 원한다면 [Laravel 애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 확인하세요.

<a name="resetting-the-password"></a>
### 비밀번호 재설정

<a name="the-password-reset-form"></a>
#### 비밀번호 재설정 양식

다음으로, 사용자가 이메일로 전송된 비밀번호 재설정 링크를 클릭하고 새 비밀번호를 제공할 때 실제로 비밀번호를 재설정하는 데 필요한 라우트를 정의합니다. 먼저 사용자가 비밀번호 재설정 링크를 클릭할 때 표시되는 비밀번호 재설정 양식을 표시하는 라우트를 정의해 보겠습니다. 이 라우트는 나중에 비밀번호 재설정 요청을 검증하는 데 사용할 `token` 파라미터를 받습니다.

```php
Route::get('/reset-password/{token}', function (string $token) {
    return view('auth.reset-password', ['token' => $token]);
})->middleware('guest')->name('password.reset');
```

이 라우트에서 반환되는 뷰에는 `email` 필드, `password` 필드, `password_confirmation` 필드, 그리고 라우트에서 받은 비밀 `$token` 값을 포함해야 하는 숨겨진 `token` 필드가 있는 양식이 표시되어야 합니다.

<a name="password-reset-handling-the-form-submission"></a>
#### 양식 제출 처리

물론 비밀번호 재설정 양식 제출을 실제로 처리하는 라우트를 정의해야 합니다. 이 라우트는 들어오는 요청을 검증하고 데이터베이스에서 사용자의 비밀번호를 업데이트하는 역할을 합니다.

```php
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->setRememberToken(Str::random(60));

            $user->save();

            event(new PasswordReset($user));
        }
    );

    return $status === Password::PasswordReset
        ? redirect()->route('login')->with('status', __($status))
        : back()->withErrors(['email' => [__($status)]]);
})->middleware('guest')->name('password.update');
```

계속하기 전에 이 라우트를 더 자세히 살펴보겠습니다. 먼저 요청의 `token`, `email`, `password` 속성이 검증됩니다. 다음으로, Laravel의 내장 "비밀번호 브로커(Password Broker)"(`Password` 파사드를 통해)를 사용하여 비밀번호 재설정 요청 자격 증명을 검증합니다.

비밀번호 브로커에 제공된 토큰, 이메일 주소, 비밀번호가 유효하면 `reset` 메서드에 전달된 클로저가 호출됩니다. 이 클로저 내에서 사용자 인스턴스와 비밀번호 재설정 양식에 제공된 평문 비밀번호를 받아 데이터베이스에서 사용자의 비밀번호를 업데이트할 수 있습니다.

`reset` 메서드는 "상태" 슬러그를 반환합니다. 이 상태는 사용자에게 요청 상태에 대한 사용자 친화적인 메시지를 표시하기 위해 Laravel의 [다국어 지원](/docs/{{version}}/localization) 헬퍼를 사용하여 번역될 수 있습니다. 비밀번호 재설정 상태의 번역은 애플리케이션의 `lang/{lang}/passwords.php` 언어 파일에 의해 결정됩니다. 상태 슬러그의 각 가능한 값에 대한 항목이 `passwords` 언어 파일 내에 있습니다. 애플리케이션에 `lang` 디렉토리가 없는 경우 `lang:publish` Artisan 명령어를 사용하여 생성할 수 있습니다.

계속하기 전에, `Password` 파사드의 `reset` 메서드를 호출할 때 Laravel이 애플리케이션의 데이터베이스에서 사용자 레코드를 어떻게 조회하는지 궁금할 수 있습니다. Laravel 비밀번호 브로커는 인증 시스템의 "사용자 프로바이더(User Provider)"를 활용하여 데이터베이스 레코드를 조회합니다. 비밀번호 브로커가 사용하는 사용자 프로바이더는 `config/auth.php` 설정 파일의 `passwords` 설정 배열 내에서 설정됩니다. 커스텀 사용자 프로바이더 작성에 대해 더 알아보려면 [인증 문서](/docs/{{version}}/authentication#adding-custom-user-providers)를 참조하세요.

<a name="deleting-expired-tokens"></a>
## 만료된 토큰 삭제

`database` 드라이버를 사용하는 경우, 만료된 비밀번호 재설정 토큰은 여전히 데이터베이스에 남아 있습니다. 그러나 `auth:clear-resets` Artisan 명령어를 사용하여 이러한 레코드를 쉽게 삭제할 수 있습니다.

```shell
php artisan auth:clear-resets
```

이 프로세스를 자동화하려면 애플리케이션의 [스케줄러](/docs/{{version}}/scheduling)에 명령어를 추가하는 것을 고려하세요.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('auth:clear-resets')->everyFifteenMinutes();
```

<a name="password-customization"></a>
## 커스터마이징

<a name="reset-link-customization"></a>
#### 재설정 링크 커스터마이징

`ResetPassword` 알림 클래스에서 제공하는 `createUrlUsing` 메서드를 사용하여 비밀번호 재설정 링크 URL을 커스터마이징할 수 있습니다. 이 메서드는 알림을 받는 사용자 인스턴스와 비밀번호 재설정 링크 토큰을 받는 클로저를 허용합니다. 일반적으로 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 이 메서드를 호출해야 합니다.

```php
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    ResetPassword::createUrlUsing(function (User $user, string $token) {
        return 'https://example.com/reset-password?token='.$token;
    });
}
```

<a name="reset-email-customization"></a>
#### 재설정 이메일 커스터마이징

비밀번호 재설정 링크를 사용자에게 보내는 데 사용되는 알림 클래스를 쉽게 수정할 수 있습니다. 시작하려면 `App\Models\User` 모델의 `sendPasswordResetNotification` 메서드를 오버라이드하세요. 이 메서드 내에서 직접 만든 [알림 클래스](/docs/{{version}}/notifications)를 사용하여 알림을 보낼 수 있습니다. 비밀번호 재설정 `$token`은 메서드가 받는 첫 번째 인수입니다. 이 `$token`을 사용하여 원하는 비밀번호 재설정 URL을 빌드하고 사용자에게 알림을 보낼 수 있습니다.

```php
use App\Notifications\ResetPasswordNotification;

/**
 * 사용자에게 비밀번호 재설정 알림을 보냅니다.
 *
 * @param  string  $token
 */
public function sendPasswordResetNotification($token): void
{
    $url = 'https://example.com/reset-password?token='.$token;

    $this->notify(new ResetPasswordNotification($url));
}
```

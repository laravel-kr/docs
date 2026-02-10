# Laravel Dusk

- [소개](#introduction)
- [설치](#installation)
    - [ChromeDriver 설치 관리](#managing-chromedriver-installations)
    - [다른 브라우저 사용하기](#using-other-browsers)
- [시작하기](#getting-started)
    - [테스트 생성하기](#generating-tests)
    - [각 테스트 후 데이터베이스 초기화하기](#resetting-the-database-after-each-test)
    - [테스트 실행하기](#running-tests)
    - [환경 설정 처리](#environment-handling)
- [브라우저 기본](#browser-basics)
    - [브라우저 생성하기](#creating-browsers)
    - [네비게이션](#navigation)
    - [브라우저 창 크기 조절](#resizing-browser-windows)
    - [브라우저 매크로](#browser-macros)
    - [인증](#authentication)
    - [쿠키](#cookies)
    - [JavaScript 실행하기](#executing-javascript)
    - [스크린샷 찍기](#taking-a-screenshot)
    - [콘솔 출력을 디스크에 저장하기](#storing-console-output-to-disk)
    - [페이지 소스를 디스크에 저장하기](#storing-page-source-to-disk)
- [요소와 상호작용하기](#interacting-with-elements)
    - [Dusk 셀렉터](#dusk-selectors)
    - [텍스트, 값, 속성](#text-values-and-attributes)
    - [폼과 상호작용하기](#interacting-with-forms)
    - [파일 첨부](#attaching-files)
    - [버튼 클릭하기](#pressing-buttons)
    - [링크 클릭하기](#clicking-links)
    - [키보드 사용하기](#using-the-keyboard)
    - [마우스 사용하기](#using-the-mouse)
    - [JavaScript 다이얼로그](#javascript-dialogs)
    - [인라인 프레임과 상호작용하기](#interacting-with-iframes)
    - [셀렉터 범위 지정](#scoping-selectors)
    - [요소 대기하기](#waiting-for-elements)
    - [요소를 화면에 스크롤하기](#scrolling-an-element-into-view)
- [사용 가능한 Assertion](#available-assertions)
- [페이지](#pages)
    - [페이지 생성하기](#generating-pages)
    - [페이지 설정하기](#configuring-pages)
    - [페이지로 이동하기](#navigating-to-pages)
    - [단축 셀렉터](#shorthand-selectors)
    - [페이지 메서드](#page-methods)
- [컴포넌트](#components)
    - [컴포넌트 생성하기](#generating-components)
    - [컴포넌트 사용하기](#using-components)
- [지속적 통합](#continuous-integration)
    - [Heroku CI](#running-tests-on-heroku-ci)
    - [Travis CI](#running-tests-on-travis-ci)
    - [GitHub Actions](#running-tests-on-github-actions)
    - [Chipper CI](#running-tests-on-chipper-ci)

<a name="introduction"></a>
## 소개

> [!WARNING]
> [Pest 4](https://pestphp.com/)는 이제 Laravel Dusk에 비해 상당한 성능 및 사용성 개선을 제공하는 자동화된 브라우저 테스팅을 포함합니다. 새 프로젝트의 경우, 브라우저 테스팅에 Pest를 사용하는 것을 권장합니다.

[Laravel Dusk](https://github.com/laravel/dusk)는 표현력이 뛰어나고 사용하기 쉬운 브라우저 자동화 및 테스팅 API를 제공합니다. 기본적으로 Dusk는 로컬 컴퓨터에 JDK나 Selenium을 설치할 필요가 없습니다. 대신 Dusk는 독립 실행형 [ChromeDriver](https://sites.google.com/chromium.org/driver) 설치를 사용합니다. 그러나 원하는 다른 Selenium 호환 드라이버를 자유롭게 사용할 수 있습니다.

<a name="installation"></a>
## 설치

시작하려면 [Google Chrome](https://www.google.com/chrome)을 설치하고 프로젝트에 `laravel/dusk` Composer 의존성을 추가해야 합니다:

```shell
composer require laravel/dusk --dev
```

> [!WARNING]
> Dusk의 서비스 프로바이더를 수동으로 등록하는 경우, 프로덕션 환경에서는 **절대** 등록하지 마세요. 그렇게 하면 임의의 사용자가 애플리케이션에 인증할 수 있게 될 수 있습니다.

Dusk 패키지를 설치한 후 `dusk:install` Artisan 명령을 실행하세요. `dusk:install` 명령은 `tests/Browser` 디렉토리, 예제 Dusk 테스트, 그리고 운영 체제에 맞는 Chrome Driver 바이너리를 설치합니다:

```shell
php artisan dusk:install
```

다음으로 애플리케이션의 `.env` 파일에서 `APP_URL` 환경 변수를 설정하세요. 이 값은 브라우저에서 애플리케이션에 접근하는 데 사용하는 URL과 일치해야 합니다.

> [!NOTE]
> [Laravel Sail](/docs/{{version}}/sail)을 사용하여 로컬 개발 환경을 관리하는 경우, [Dusk 테스트 구성 및 실행](/docs/{{version}}/sail#laravel-dusk)에 관한 Sail 문서도 참조하세요.

<a name="managing-chromedriver-installations"></a>
### ChromeDriver 설치 관리

`dusk:install` 명령으로 Laravel Dusk가 설치한 것과 다른 버전의 ChromeDriver를 설치하려면 `dusk:chrome-driver` 명령을 사용할 수 있습니다:

```shell
# 운영 체제에 맞는 최신 버전의 ChromeDriver 설치...
php artisan dusk:chrome-driver

# 운영 체제에 맞는 특정 버전의 ChromeDriver 설치...
php artisan dusk:chrome-driver 86

# 지원되는 모든 운영 체제에 특정 버전의 ChromeDriver 설치...
php artisan dusk:chrome-driver --all

# 운영 체제에서 감지된 Chrome / Chromium 버전과 일치하는 ChromeDriver 설치...
php artisan dusk:chrome-driver --detect
```

> [!WARNING]
> Dusk는 `chromedriver` 바이너리가 실행 가능해야 합니다. Dusk 실행에 문제가 있는 경우 다음 명령을 사용하여 바이너리가 실행 가능한지 확인해야 합니다: `chmod -R 0755 vendor/laravel/dusk/bin/`.

<a name="using-other-browsers"></a>
### 다른 브라우저 사용하기

기본적으로 Dusk는 Google Chrome과 독립 실행형 [ChromeDriver](https://sites.google.com/chromium.org/driver) 설치를 사용하여 브라우저 테스트를 실행합니다. 그러나 자체 Selenium 서버를 시작하고 원하는 브라우저에 대해 테스트를 실행할 수도 있습니다.

시작하려면 애플리케이션의 기본 Dusk 테스트 케이스인 `tests/DuskTestCase.php` 파일을 엽니다. 이 파일에서 `startChromeDriver` 메서드 호출을 제거할 수 있습니다. 이렇게 하면 Dusk가 자동으로 ChromeDriver를 시작하지 않습니다:

```php
/**
 * Dusk 테스트 실행 준비.
 *
 * @beforeClass
 */
public static function prepare(): void
{
    // static::startChromeDriver();
}
```

다음으로, 원하는 URL과 포트에 연결하도록 `driver` 메서드를 수정할 수 있습니다. 또한 WebDriver에 전달해야 하는 "desired capabilities"를 수정할 수 있습니다:

```php
use Facebook\WebDriver\Remote\RemoteWebDriver;

/**
 * RemoteWebDriver 인스턴스 생성.
 */
protected function driver(): RemoteWebDriver
{
    return RemoteWebDriver::create(
        'http://localhost:4444/wd/hub', DesiredCapabilities::phantomjs()
    );
}
```

<a name="getting-started"></a>
## 시작하기

<a name="generating-tests"></a>
### 테스트 생성하기

Dusk 테스트를 생성하려면 `dusk:make` Artisan 명령을 사용하세요. 생성된 테스트는 `tests/Browser` 디렉토리에 배치됩니다:

```shell
php artisan dusk:make LoginTest
```

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 후 데이터베이스 초기화하기

작성하는 대부분의 테스트는 애플리케이션의 데이터베이스에서 데이터를 검색하는 페이지와 상호작용합니다. 그러나 Dusk 테스트는 `RefreshDatabase` 트레이트를 사용해서는 안 됩니다. `RefreshDatabase` 트레이트는 HTTP 요청에서 적용되거나 사용할 수 없는 데이터베이스 트랜잭션을 활용합니다. 대신 `DatabaseMigrations` 트레이트와 `DatabaseTruncation` 트레이트 두 가지 옵션이 있습니다.

<a name="reset-migrations"></a>
#### 데이터베이스 마이그레이션 사용하기

`DatabaseMigrations` 트레이트는 각 테스트 전에 데이터베이스 마이그레이션을 실행합니다. 그러나 각 테스트에서 데이터베이스 테이블을 삭제하고 다시 생성하는 것은 일반적으로 테이블을 truncate하는 것보다 느립니다:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;

pest()->use(DatabaseMigrations::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    //
}
```

> [!WARNING]
> Dusk 테스트를 실행할 때 SQLite 인메모리 데이터베이스를 사용할 수 없습니다. 브라우저가 자체 프로세스 내에서 실행되므로 다른 프로세스의 인메모리 데이터베이스에 접근할 수 없습니다.

<a name="reset-truncation"></a>
#### 데이터베이스 Truncation 사용하기

`DatabaseTruncation` 트레이트는 첫 번째 테스트에서 데이터베이스를 마이그레이션하여 데이터베이스 테이블이 제대로 생성되었는지 확인합니다. 그러나 후속 테스트에서는 데이터베이스 테이블이 단순히 truncate되어 모든 데이터베이스 마이그레이션을 다시 실행하는 것보다 속도가 향상됩니다:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;

pest()->use(DatabaseTruncation::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseTruncation;

    //
}
```

기본적으로 이 트레이트는 `migrations` 테이블을 제외한 모든 테이블을 truncate합니다. truncate할 테이블을 사용자 정의하려면 테스트 클래스에 `$tablesToTruncate` 속성을 정의할 수 있습니다:

> [!NOTE]
> Pest를 사용하는 경우 기본 `DuskTestCase` 클래스나 테스트 파일이 상속하는 클래스에 속성이나 메서드를 정의해야 합니다.

```php
/**
 * truncate할 테이블을 나타냅니다.
 *
 * @var array
 */
protected $tablesToTruncate = ['users'];
```

또는 테스트 클래스에 `$exceptTables` 속성을 정의하여 truncation에서 제외할 테이블을 지정할 수 있습니다:

```php
/**
 * truncation에서 제외할 테이블을 나타냅니다.
 *
 * @var array
 */
protected $exceptTables = ['users'];
```

테이블을 truncate할 데이터베이스 연결을 지정하려면 테스트 클래스에 `$connectionsToTruncate` 속성을 정의할 수 있습니다:

```php
/**
 * 테이블을 truncate할 연결을 나타냅니다.
 *
 * @var array
 */
protected $connectionsToTruncate = ['mysql'];
```

데이터베이스 truncation이 수행되기 전이나 후에 코드를 실행하려면 테스트 클래스에 `beforeTruncatingDatabase` 또는 `afterTruncatingDatabase` 메서드를 정의할 수 있습니다:

```php
/**
 * 데이터베이스 truncation이 시작되기 전에 수행해야 할 작업.
 */
protected function beforeTruncatingDatabase(): void
{
    //
}

/**
 * 데이터베이스 truncation이 완료된 후 수행해야 할 작업.
 */
protected function afterTruncatingDatabase(): void
{
    //
}
```

<a name="running-tests"></a>
### 테스트 실행하기

브라우저 테스트를 실행하려면 `dusk` Artisan 명령을 실행하세요:

```shell
php artisan dusk
```

마지막으로 `dusk` 명령을 실행할 때 테스트 실패가 있었다면 `dusk:fails` 명령을 사용하여 먼저 실패한 테스트를 다시 실행하여 시간을 절약할 수 있습니다:

```shell
php artisan dusk:fails
```

`dusk` 명령은 Pest / PHPUnit 테스트 러너에서 일반적으로 허용되는 모든 인수를 받습니다. 예를 들어 특정 [그룹](https://docs.phpunit.de/en/10.5/annotations.html#group)에 대한 테스트만 실행할 수 있습니다:

```shell
php artisan dusk --group=foo
```

> [!NOTE]
> [Laravel Sail](/docs/{{version}}/sail)을 사용하여 로컬 개발 환경을 관리하는 경우, [Dusk 테스트 구성 및 실행](/docs/{{version}}/sail#laravel-dusk)에 관한 Sail 문서를 참조하세요.

<a name="manually-starting-chromedriver"></a>
#### ChromeDriver 수동으로 시작하기

기본적으로 Dusk는 자동으로 ChromeDriver를 시작하려고 합니다. 특정 시스템에서 이것이 작동하지 않는 경우 `dusk` 명령을 실행하기 전에 ChromeDriver를 수동으로 시작할 수 있습니다. ChromeDriver를 수동으로 시작하기로 선택한 경우 `tests/DuskTestCase.php` 파일의 다음 줄을 주석 처리해야 합니다:

```php
/**
 * Dusk 테스트 실행 준비.
 *
 * @beforeClass
 */
public static function prepare(): void
{
    // static::startChromeDriver();
}
```

또한 9515 이외의 포트에서 ChromeDriver를 시작하는 경우 동일한 클래스의 `driver` 메서드를 수정하여 올바른 포트를 반영해야 합니다:

```php
use Facebook\WebDriver\Remote\RemoteWebDriver;

/**
 * RemoteWebDriver 인스턴스 생성.
 */
protected function driver(): RemoteWebDriver
{
    return RemoteWebDriver::create(
        'http://localhost:9515', DesiredCapabilities::chrome()
    );
}
```

<a name="environment-handling"></a>
### 환경 설정 처리

테스트를 실행할 때 Dusk가 자체 환경 파일을 사용하도록 강제하려면 프로젝트 루트에 `.env.dusk.{environment}` 파일을 생성하세요. 예를 들어 `local` 환경에서 `dusk` 명령을 시작하는 경우 `.env.dusk.local` 파일을 생성해야 합니다.

테스트를 실행할 때 Dusk는 `.env` 파일을 백업하고 Dusk 환경의 이름을 `.env`로 변경합니다. 테스트가 완료되면 `.env` 파일이 복원됩니다.

<a name="browser-basics"></a>
## 브라우저 기본

<a name="creating-browsers"></a>
### 브라우저 생성하기

시작하기 위해 애플리케이션에 로그인할 수 있는지 확인하는 테스트를 작성해 보겠습니다. 테스트를 생성한 후 로그인 페이지로 이동하고, 자격 증명을 입력하고, "Login" 버튼을 클릭하도록 수정할 수 있습니다. 브라우저 인스턴스를 생성하려면 Dusk 테스트 내에서 `browse` 메서드를 호출할 수 있습니다:

```php tab=Pest
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;

pest()->use(DatabaseMigrations::class);

test('basic example', function () {
    $user = User::factory()->create([
        'email' => 'taylor@laravel.com',
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/login')
            ->type('email', $user->email)
            ->type('password', 'password')
            ->press('Login')
            ->assertPathIs('/home');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * 기본 브라우저 테스트 예제.
     */
    public function test_basic_example(): void
    {
        $user = User::factory()->create([
            'email' => 'taylor@laravel.com',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit('/login')
                ->type('email', $user->email)
                ->type('password', 'password')
                ->press('Login')
                ->assertPathIs('/home');
        });
    }
}
```

위의 예제에서 볼 수 있듯이 `browse` 메서드는 클로저를 받습니다. 브라우저 인스턴스가 Dusk에 의해 자동으로 이 클로저에 전달되며, 이것이 애플리케이션과 상호작용하고 assertion을 수행하는 데 사용되는 주요 객체입니다.

<a name="creating-multiple-browsers"></a>
#### 여러 브라우저 생성하기

테스트를 제대로 수행하기 위해 여러 브라우저가 필요한 경우가 있습니다. 예를 들어 웹소켓과 상호작용하는 채팅 화면을 테스트하려면 여러 브라우저가 필요할 수 있습니다. 여러 브라우저를 생성하려면 `browse` 메서드에 전달된 클로저의 시그니처에 더 많은 브라우저 인수를 추가하면 됩니다:

```php
$this->browse(function (Browser $first, Browser $second) {
    $first->loginAs(User::find(1))
        ->visit('/home')
        ->waitForText('Message');

    $second->loginAs(User::find(2))
        ->visit('/home')
        ->waitForText('Message')
        ->type('message', 'Hey Taylor')
        ->press('Send');

    $first->waitForText('Hey Taylor')
        ->assertSee('Jeffrey Way');
});
```

<a name="navigation"></a>
### 네비게이션

`visit` 메서드를 사용하여 애플리케이션 내의 주어진 URI로 이동할 수 있습니다:

```php
$browser->visit('/login');
```

`visitRoute` 메서드를 사용하여 [이름이 지정된 라우트](/docs/{{version}}/routing#named-routes)로 이동할 수 있습니다:

```php
$browser->visitRoute($routeName, $parameters);
```

`back`과 `forward` 메서드를 사용하여 "뒤로"와 "앞으로" 이동할 수 있습니다:

```php
$browser->back();

$browser->forward();
```

`refresh` 메서드를 사용하여 페이지를 새로고침할 수 있습니다:

```php
$browser->refresh();
```

<a name="resizing-browser-windows"></a>
### 브라우저 창 크기 조절

`resize` 메서드를 사용하여 브라우저 창의 크기를 조절할 수 있습니다:

```php
$browser->resize(1920, 1080);
```

`maximize` 메서드를 사용하여 브라우저 창을 최대화할 수 있습니다:

```php
$browser->maximize();
```

`fitContent` 메서드는 브라우저 창의 크기를 콘텐츠 크기에 맞게 조절합니다:

```php
$browser->fitContent();
```

테스트가 실패하면 Dusk는 스크린샷을 찍기 전에 자동으로 브라우저 크기를 콘텐츠에 맞게 조절합니다. 테스트 내에서 `disableFitOnFailure` 메서드를 호출하여 이 기능을 비활성화할 수 있습니다:

```php
$browser->disableFitOnFailure();
```

`move` 메서드를 사용하여 브라우저 창을 화면의 다른 위치로 이동할 수 있습니다:

```php
$browser->move($x = 100, $y = 100);
```

<a name="browser-macros"></a>
### 브라우저 매크로

다양한 테스트에서 재사용할 수 있는 사용자 정의 브라우저 메서드를 정의하려면 `Browser` 클래스의 `macro` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 [서비스 프로바이더](/docs/{{version}}/providers)의 `boot` 메서드에서 호출해야 합니다:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Browser;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Dusk의 브라우저 매크로 등록.
     */
    public function boot(): void
    {
        Browser::macro('scrollToElement', function (string $element = null) {
            $this->script("$('html, body').animate({ scrollTop: $('$element').offset().top }, 0);");

            return $this;
        });
    }
}
```

`macro` 함수는 이름을 첫 번째 인수로, 클로저를 두 번째 인수로 받습니다. 매크로의 클로저는 `Browser` 인스턴스에서 매크로를 메서드로 호출할 때 실행됩니다:

```php
$this->browse(function (Browser $browser) use ($user) {
    $browser->visit('/pay')
        ->scrollToElement('#credit-card-details')
        ->assertSee('Enter Credit Card Details');
});
```

<a name="authentication"></a>
### 인증

종종 인증이 필요한 페이지를 테스트하게 됩니다. 모든 테스트에서 애플리케이션의 로그인 화면과 상호작용하는 것을 피하기 위해 Dusk의 `loginAs` 메서드를 사용할 수 있습니다. `loginAs` 메서드는 인증 가능한 모델과 연관된 기본 키 또는 인증 가능한 모델 인스턴스를 받습니다:

```php
use App\Models\User;
use Laravel\Dusk\Browser;

$this->browse(function (Browser $browser) {
    $browser->loginAs(User::find(1))
        ->visit('/home');
});
```

> [!WARNING]
> `loginAs` 메서드를 사용한 후 사용자 세션은 파일 내의 모든 테스트에서 유지됩니다.

<a name="cookies"></a>
### 쿠키

`cookie` 메서드를 사용하여 암호화된 쿠키의 값을 가져오거나 설정할 수 있습니다. 기본적으로 Laravel에서 생성된 모든 쿠키는 암호화됩니다:

```php
$browser->cookie('name');

$browser->cookie('name', 'Taylor');
```

`plainCookie` 메서드를 사용하여 암호화되지 않은 쿠키의 값을 가져오거나 설정할 수 있습니다:

```php
$browser->plainCookie('name');

$browser->plainCookie('name', 'Taylor');
```

`deleteCookie` 메서드를 사용하여 주어진 쿠키를 삭제할 수 있습니다:

```php
$browser->deleteCookie('name');
```

<a name="executing-javascript"></a>
### JavaScript 실행하기

`script` 메서드를 사용하여 브라우저 내에서 임의의 JavaScript 문을 실행할 수 있습니다:

```php
$browser->script('document.documentElement.scrollTop = 0');

$browser->script([
    'document.body.scrollTop = 0',
    'document.documentElement.scrollTop = 0',
]);

$output = $browser->script('return window.location.pathname');
```

<a name="taking-a-screenshot"></a>
### 스크린샷 찍기

`screenshot` 메서드를 사용하여 스크린샷을 찍고 주어진 파일명으로 저장할 수 있습니다. 모든 스크린샷은 `tests/Browser/screenshots` 디렉토리에 저장됩니다:

```php
$browser->screenshot('filename');
```

`responsiveScreenshots` 메서드를 사용하여 다양한 브레이크포인트에서 일련의 스크린샷을 찍을 수 있습니다:

```php
$browser->responsiveScreenshots('filename');
```

`screenshotElement` 메서드를 사용하여 페이지의 특정 요소에 대한 스크린샷을 찍을 수 있습니다:

```php
$browser->screenshotElement('#selector', 'filename');
```

<a name="storing-console-output-to-disk"></a>
### 콘솔 출력을 디스크에 저장하기

`storeConsoleLog` 메서드를 사용하여 현재 브라우저의 콘솔 출력을 주어진 파일명으로 디스크에 저장할 수 있습니다. 콘솔 출력은 `tests/Browser/console` 디렉토리에 저장됩니다:

```php
$browser->storeConsoleLog('filename');
```

<a name="storing-page-source-to-disk"></a>
### 페이지 소스를 디스크에 저장하기

`storeSource` 메서드를 사용하여 현재 페이지의 소스를 주어진 파일명으로 디스크에 저장할 수 있습니다. 페이지 소스는 `tests/Browser/source` 디렉토리에 저장됩니다:

```php
$browser->storeSource('filename');
```

<a name="interacting-with-elements"></a>
## 요소와 상호작용하기

<a name="dusk-selectors"></a>
### Dusk 셀렉터

요소와 상호작용하기 위해 좋은 CSS 셀렉터를 선택하는 것은 Dusk 테스트를 작성하는 가장 어려운 부분 중 하나입니다. 시간이 지남에 따라 프론트엔드 변경으로 인해 다음과 같은 CSS 셀렉터가 테스트를 깨뜨릴 수 있습니다:

```html
// HTML...

<button>Login</button>
```

```php
// Test...

$browser->click('.login-page .container div > button');
```

Dusk 셀렉터를 사용하면 CSS 셀렉터를 기억하는 대신 효과적인 테스트 작성에 집중할 수 있습니다. 셀렉터를 정의하려면 HTML 요소에 `dusk` 속성을 추가하세요. 그런 다음 Dusk 브라우저와 상호작용할 때 셀렉터 앞에 `@`를 붙여 테스트 내에서 연결된 요소를 조작합니다:

```html
// HTML...

<button dusk="login-button">Login</button>
```

```php
// Test...

$browser->click('@login-button');
```

원하는 경우 `selectorHtmlAttribute` 메서드를 통해 Dusk 셀렉터가 사용하는 HTML 속성을 사용자 정의할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출해야 합니다:

```php
use Laravel\Dusk\Dusk;

Dusk::selectorHtmlAttribute('data-dusk');
```

<a name="text-values-and-attributes"></a>
### 텍스트, 값, 속성

<a name="retrieving-setting-values"></a>
#### 값 검색 및 설정

Dusk는 페이지에 있는 요소의 현재 값, 표시 텍스트, 속성과 상호작용하기 위한 여러 메서드를 제공합니다. 예를 들어 주어진 CSS 또는 Dusk 셀렉터와 일치하는 요소의 "value"를 가져오려면 `value` 메서드를 사용하세요:

```php
// 값 검색...
$value = $browser->value('selector');

// 값 설정...
$browser->value('selector', 'value');
```

`inputValue` 메서드를 사용하여 주어진 필드 이름을 가진 input 요소의 "value"를 가져올 수 있습니다:

```php
$value = $browser->inputValue('field');
```

<a name="retrieving-text"></a>
#### 텍스트 검색

`text` 메서드를 사용하여 주어진 셀렉터와 일치하는 요소의 표시 텍스트를 검색할 수 있습니다:

```php
$text = $browser->text('selector');
```

<a name="retrieving-attributes"></a>
#### 속성 검색

마지막으로 `attribute` 메서드를 사용하여 주어진 셀렉터와 일치하는 요소의 속성 값을 검색할 수 있습니다:

```php
$attribute = $browser->attribute('selector', 'value');
```

<a name="interacting-with-forms"></a>
### 폼과 상호작용하기

<a name="typing-values"></a>
#### 값 입력하기

Dusk는 폼 및 input 요소와 상호작용하기 위한 다양한 메서드를 제공합니다. 먼저 input 필드에 텍스트를 입력하는 예제를 살펴보겠습니다:

```php
$browser->type('email', 'taylor@laravel.com');
```

필요한 경우 하나를 허용하지만 `type` 메서드에 CSS 셀렉터를 전달할 필요는 없습니다. CSS 셀렉터가 제공되지 않으면 Dusk는 주어진 `name` 속성을 가진 `input` 또는 `textarea` 필드를 검색합니다.

콘텐츠를 지우지 않고 필드에 텍스트를 추가하려면 `append` 메서드를 사용할 수 있습니다:

```php
$browser->type('tags', 'foo')
    ->append('tags', ', bar, baz');
```

`clear` 메서드를 사용하여 input의 값을 지울 수 있습니다:

```php
$browser->clear('email');
```

`typeSlowly` 메서드를 사용하여 Dusk가 천천히 입력하도록 지시할 수 있습니다. 기본적으로 Dusk는 키 입력 사이에 100밀리초씩 일시 정지합니다. 키 입력 사이의 시간을 사용자 정의하려면 적절한 밀리초 수를 메서드의 세 번째 인수로 전달할 수 있습니다:

```php
$browser->typeSlowly('mobile', '+1 (202) 555-5555');

$browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);
```

`appendSlowly` 메서드를 사용하여 텍스트를 천천히 추가할 수 있습니다:

```php
$browser->type('tags', 'foo')
    ->appendSlowly('tags', ', bar, baz');
```

<a name="dropdowns"></a>
#### 드롭다운

`select` 요소에서 사용 가능한 값을 선택하려면 `select` 메서드를 사용할 수 있습니다. `type` 메서드와 마찬가지로 `select` 메서드는 전체 CSS 셀렉터를 요구하지 않습니다. `select` 메서드에 값을 전달할 때 표시 텍스트 대신 기본 옵션 값을 전달해야 합니다:

```php
$browser->select('size', 'Large');
```

두 번째 인수를 생략하여 랜덤 옵션을 선택할 수 있습니다:

```php
$browser->select('size');
```

`select` 메서드의 두 번째 인수로 배열을 제공하면 여러 옵션을 선택하도록 메서드에 지시할 수 있습니다:

```php
$browser->select('categories', ['Art', 'Music']);
```

<a name="checkboxes"></a>
#### 체크박스

체크박스 input을 "체크"하려면 `check` 메서드를 사용할 수 있습니다. 다른 많은 input 관련 메서드와 마찬가지로 전체 CSS 셀렉터가 필요하지 않습니다. CSS 셀렉터 일치를 찾을 수 없는 경우 Dusk는 일치하는 `name` 속성을 가진 체크박스를 검색합니다:

```php
$browser->check('terms');
```

`uncheck` 메서드를 사용하여 체크박스 input을 "체크 해제"할 수 있습니다:

```php
$browser->uncheck('terms');
```

<a name="radio-buttons"></a>
#### 라디오 버튼

`radio` input 옵션을 "선택"하려면 `radio` 메서드를 사용할 수 있습니다. 다른 많은 input 관련 메서드와 마찬가지로 전체 CSS 셀렉터가 필요하지 않습니다. CSS 셀렉터 일치를 찾을 수 없는 경우 Dusk는 일치하는 `name` 및 `value` 속성을 가진 `radio` input을 검색합니다:

```php
$browser->radio('size', 'large');
```

<a name="attaching-files"></a>
### 파일 첨부

`attach` 메서드를 사용하여 `file` input 요소에 파일을 첨부할 수 있습니다. 다른 많은 input 관련 메서드와 마찬가지로 전체 CSS 셀렉터가 필요하지 않습니다. CSS 셀렉터 일치를 찾을 수 없는 경우 Dusk는 일치하는 `name` 속성을 가진 `file` input을 검색합니다:

```php
$browser->attach('photo', __DIR__.'/photos/mountains.png');
```

> [!WARNING]
> attach 함수는 서버에 `Zip` PHP 확장이 설치되고 활성화되어 있어야 합니다.

<a name="pressing-buttons"></a>
### 버튼 클릭하기

`press` 메서드를 사용하여 페이지의 버튼 요소를 클릭할 수 있습니다. `press` 메서드에 전달하는 인수는 버튼의 표시 텍스트 또는 CSS / Dusk 셀렉터일 수 있습니다:

```php
$browser->press('Login');
```

폼을 제출할 때 많은 애플리케이션은 버튼이 눌린 후 폼의 제출 버튼을 비활성화한 다음 폼 제출의 HTTP 요청이 완료되면 버튼을 다시 활성화합니다. 버튼을 클릭하고 버튼이 다시 활성화될 때까지 기다리려면 `pressAndWaitFor` 메서드를 사용할 수 있습니다:

```php
// 버튼을 클릭하고 최대 5초 동안 활성화를 기다림...
$browser->pressAndWaitFor('Save');

// 버튼을 클릭하고 최대 1초 동안 활성화를 기다림...
$browser->pressAndWaitFor('Save', 1);
```

<a name="clicking-links"></a>
### 링크 클릭하기

링크를 클릭하려면 브라우저 인스턴스에서 `clickLink` 메서드를 사용할 수 있습니다. `clickLink` 메서드는 주어진 표시 텍스트가 있는 링크를 클릭합니다:

```php
$browser->clickLink($linkText);
```

`seeLink` 메서드를 사용하여 주어진 표시 텍스트가 있는 링크가 페이지에 표시되는지 확인할 수 있습니다:

```php
if ($browser->seeLink($linkText)) {
    // ...
}
```

> [!WARNING]
> 이러한 메서드는 jQuery와 상호작용합니다. 페이지에 jQuery를 사용할 수 없는 경우 Dusk는 자동으로 페이지에 jQuery를 주입하여 테스트 기간 동안 사용할 수 있도록 합니다.

<a name="using-the-keyboard"></a>
### 키보드 사용하기

`keys` 메서드를 사용하면 `type` 메서드로 일반적으로 허용되는 것보다 더 복잡한 입력 시퀀스를 주어진 요소에 제공할 수 있습니다. 예를 들어 값을 입력하는 동안 수정자 키를 누른 상태로 유지하도록 Dusk에 지시할 수 있습니다. 이 예제에서는 주어진 셀렉터와 일치하는 요소에 `taylor`가 입력되는 동안 `shift` 키가 눌린 상태로 유지됩니다. `taylor`가 입력된 후 `swift`는 수정자 키 없이 입력됩니다:

```php
$browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

`keys` 메서드의 또 다른 유용한 사용 사례는 애플리케이션의 기본 CSS 셀렉터에 "키보드 단축키" 조합을 보내는 것입니다:

```php
$browser->keys('.app', ['{command}', 'j']);
```

> [!NOTE]
> `{command}`와 같은 모든 수정자 키는 `{}` 문자로 감싸지며, `Facebook\WebDriver\WebDriverKeys` 클래스에 정의된 상수와 일치합니다. 이 클래스는 [GitHub에서 찾을 수 있습니다](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php).

<a name="fluent-keyboard-interactions"></a>
#### 유창한 키보드 상호작용

Dusk는 `withKeyboard` 메서드도 제공하여 `Laravel\Dusk\Keyboard` 클래스를 통해 복잡한 키보드 상호작용을 유창하게 수행할 수 있습니다. `Keyboard` 클래스는 `press`, `release`, `type`, `pause` 메서드를 제공합니다:

```php
use Laravel\Dusk\Keyboard;

$browser->withKeyboard(function (Keyboard $keyboard) {
    $keyboard->press('c')
        ->pause(1000)
        ->release('c')
        ->type(['c', 'e', 'o']);
});
```

<a name="keyboard-macros"></a>
#### 키보드 매크로

테스트 스위트 전체에서 쉽게 재사용할 수 있는 사용자 정의 키보드 상호작용을 정의하려면 `Keyboard` 클래스에서 제공하는 `macro` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 [서비스 프로바이더](/docs/{{version}}/providers)의 `boot` 메서드에서 호출해야 합니다:

```php
<?php

namespace App\Providers;

use Facebook\WebDriver\WebDriverKeys;
use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Keyboard;
use Laravel\Dusk\OperatingSystem;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Dusk의 브라우저 매크로 등록.
     */
    public function boot(): void
    {
        Keyboard::macro('copy', function (string $element = null) {
            $this->type([
                OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'c',
            ]);

            return $this;
        });

        Keyboard::macro('paste', function (string $element = null) {
            $this->type([
                OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'v',
            ]);

            return $this;
        });
    }
}
```

`macro` 함수는 이름을 첫 번째 인수로, 클로저를 두 번째 인수로 받습니다. 매크로의 클로저는 `Keyboard` 인스턴스에서 매크로를 메서드로 호출할 때 실행됩니다:

```php
$browser->click('@textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->copy())
    ->click('@another-textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->paste());
```

<a name="using-the-mouse"></a>
### 마우스 사용하기

<a name="clicking-on-elements"></a>
#### 요소 클릭하기

`click` 메서드를 사용하여 주어진 CSS 또는 Dusk 셀렉터와 일치하는 요소를 클릭할 수 있습니다:

```php
$browser->click('.selector');
```

`clickAtXPath` 메서드를 사용하여 주어진 XPath 표현식과 일치하는 요소를 클릭할 수 있습니다:

```php
$browser->clickAtXPath('//div[@class = "selector"]');
```

`clickAtPoint` 메서드를 사용하여 브라우저의 보이는 영역에 대한 주어진 좌표 쌍에서 최상위 요소를 클릭할 수 있습니다:

```php
$browser->clickAtPoint($x = 0, $y = 0);
```

`doubleClick` 메서드를 사용하여 마우스 더블 클릭을 시뮬레이션할 수 있습니다:

```php
$browser->doubleClick();

$browser->doubleClick('.selector');
```

`rightClick` 메서드를 사용하여 마우스 오른쪽 클릭을 시뮬레이션할 수 있습니다:

```php
$browser->rightClick();

$browser->rightClick('.selector');
```

`clickAndHold` 메서드를 사용하여 마우스 버튼을 클릭하고 누른 상태로 유지하는 것을 시뮬레이션할 수 있습니다. 이후 `releaseMouse` 메서드를 호출하면 이 동작을 취소하고 마우스 버튼을 놓습니다:

```php
$browser->clickAndHold('.selector');

$browser->clickAndHold()
    ->pause(1000)
    ->releaseMouse();
```

`controlClick` 메서드를 사용하여 브라우저 내에서 `ctrl+click` 이벤트를 시뮬레이션할 수 있습니다:

```php
$browser->controlClick();

$browser->controlClick('.selector');
```

<a name="mouseover"></a>
#### 마우스오버

`mouseover` 메서드는 주어진 CSS 또는 Dusk 셀렉터와 일치하는 요소 위로 마우스를 이동해야 할 때 사용할 수 있습니다:

```php
$browser->mouseover('.selector');
```

<a name="drag-drop"></a>
#### 드래그 앤 드롭

`drag` 메서드를 사용하여 주어진 셀렉터와 일치하는 요소를 다른 요소로 드래그할 수 있습니다:

```php
$browser->drag('.from-selector', '.to-selector');
```

또는 요소를 한 방향으로 드래그할 수 있습니다:

```php
$browser->dragLeft('.selector', $pixels = 10);
$browser->dragRight('.selector', $pixels = 10);
$browser->dragUp('.selector', $pixels = 10);
$browser->dragDown('.selector', $pixels = 10);
```

마지막으로, 주어진 오프셋만큼 요소를 드래그할 수 있습니다:

```php
$browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a name="javascript-dialogs"></a>
### JavaScript 다이얼로그

Dusk는 JavaScript 다이얼로그와 상호작용하기 위한 다양한 메서드를 제공합니다. 예를 들어 `waitForDialog` 메서드를 사용하여 JavaScript 다이얼로그가 나타날 때까지 기다릴 수 있습니다. 이 메서드는 다이얼로그가 나타나기까지 기다릴 시간(초)을 나타내는 선택적 인수를 받습니다:

```php
$browser->waitForDialog($seconds = null);
```

`assertDialogOpened` 메서드를 사용하여 다이얼로그가 표시되었고 주어진 메시지를 포함하는지 assertion할 수 있습니다:

```php
$browser->assertDialogOpened('Dialog message');
```

JavaScript 다이얼로그에 프롬프트가 포함된 경우 `typeInDialog` 메서드를 사용하여 프롬프트에 값을 입력할 수 있습니다:

```php
$browser->typeInDialog('Hello World');
```

"OK" 버튼을 클릭하여 열린 JavaScript 다이얼로그를 닫으려면 `acceptDialog` 메서드를 호출할 수 있습니다:

```php
$browser->acceptDialog();
```

"Cancel" 버튼을 클릭하여 열린 JavaScript 다이얼로그를 닫으려면 `dismissDialog` 메서드를 호출할 수 있습니다:

```php
$browser->dismissDialog();
```

<a name="interacting-with-iframes"></a>
### 인라인 프레임과 상호작용하기

iframe 내의 요소와 상호작용해야 하는 경우 `withinFrame` 메서드를 사용할 수 있습니다. `withinFrame` 메서드에 제공된 클로저 내에서 수행되는 모든 요소 상호작용은 지정된 iframe의 컨텍스트로 범위가 지정됩니다:

```php
$browser->withinFrame('#credit-card-details', function ($browser) {
    $browser->type('input[name="cardnumber"]', '4242424242424242')
        ->type('input[name="exp-date"]', '1224')
        ->type('input[name="cvc"]', '123')
        ->press('Pay');
});
```

<a name="scoping-selectors"></a>
### 셀렉터 범위 지정

때때로 주어진 셀렉터 내에서 모든 작업의 범위를 지정하면서 여러 작업을 수행하고 싶을 수 있습니다. 예를 들어 테이블 내에만 특정 텍스트가 있는지 assertion한 다음 해당 테이블 내의 버튼을 클릭하고 싶을 수 있습니다. 이를 위해 `with` 메서드를 사용할 수 있습니다. `with` 메서드에 전달된 클로저 내에서 수행되는 모든 작업은 원래 셀렉터로 범위가 지정됩니다:

```php
$browser->with('.table', function (Browser $table) {
    $table->assertSee('Hello World')
        ->clickLink('Delete');
});
```

때때로 현재 범위 외부에서 assertion을 실행해야 할 수 있습니다. 이를 위해 `elsewhere` 및 `elsewhereWhenAvailable` 메서드를 사용할 수 있습니다:

```php
$browser->with('.table', function (Browser $table) {
    // 현재 범위는 `body .table`...

    $browser->elsewhere('.page-title', function (Browser $title) {
        // 현재 범위는 `body .page-title`...
        $title->assertSee('Hello World');
    });

    $browser->elsewhereWhenAvailable('.page-title', function (Browser $title) {
        // 현재 범위는 `body .page-title`...
        $title->assertSee('Hello World');
    });
});
```

<a name="waiting-for-elements"></a>
### 요소 대기하기

JavaScript를 광범위하게 사용하는 애플리케이션을 테스트할 때 테스트를 진행하기 전에 특정 요소나 데이터가 사용 가능해질 때까지 "대기"해야 하는 경우가 많습니다. Dusk는 이를 쉽게 만들어 줍니다. 다양한 메서드를 사용하여 페이지에서 요소가 보일 때까지 기다리거나 주어진 JavaScript 표현식이 `true`로 평가될 때까지 기다릴 수 있습니다.

<a name="waiting"></a>
#### 대기하기

주어진 밀리초 동안 테스트를 일시 정지해야 하는 경우 `pause` 메서드를 사용하세요:

```php
$browser->pause(1000);
```

주어진 조건이 `true`인 경우에만 테스트를 일시 정지해야 하는 경우 `pauseIf` 메서드를 사용하세요:

```php
$browser->pauseIf(App::environment('production'), 1000);
```

마찬가지로 주어진 조건이 `true`가 아닌 경우에 테스트를 일시 정지해야 하는 경우 `pauseUnless` 메서드를 사용할 수 있습니다:

```php
$browser->pauseUnless(App::environment('testing'), 1000);
```

<a name="waiting-for-selectors"></a>
#### 셀렉터 대기하기

`waitFor` 메서드는 주어진 CSS 또는 Dusk 셀렉터와 일치하는 요소가 페이지에 표시될 때까지 테스트 실행을 일시 정지하는 데 사용할 수 있습니다. 기본적으로 이 메서드는 예외를 발생시키기 전에 최대 5초 동안 테스트를 일시 정지합니다. 필요한 경우 메서드의 두 번째 인수로 사용자 정의 타임아웃 임계값을 전달할 수 있습니다:

```php
// 최대 5초 동안 셀렉터를 기다림...
$browser->waitFor('.selector');

// 최대 1초 동안 셀렉터를 기다림...
$browser->waitFor('.selector', 1);
```

주어진 셀렉터와 일치하는 요소가 주어진 텍스트를 포함할 때까지 기다릴 수도 있습니다:

```php
// 최대 5초 동안 셀렉터가 주어진 텍스트를 포함하기를 기다림...
$browser->waitForTextIn('.selector', 'Hello World');

// 최대 1초 동안 셀렉터가 주어진 텍스트를 포함하기를 기다림...
$browser->waitForTextIn('.selector', 'Hello World', 1);
```

주어진 셀렉터와 일치하는 요소가 페이지에서 사라질 때까지 기다릴 수도 있습니다:

```php
// 최대 5초 동안 셀렉터가 사라지기를 기다림...
$browser->waitUntilMissing('.selector');

// 최대 1초 동안 셀렉터가 사라지기를 기다림...
$browser->waitUntilMissing('.selector', 1);
```

또는 주어진 셀렉터와 일치하는 요소가 활성화되거나 비활성화될 때까지 기다릴 수 있습니다:

```php
// 최대 5초 동안 셀렉터가 활성화되기를 기다림...
$browser->waitUntilEnabled('.selector');

// 최대 1초 동안 셀렉터가 활성화되기를 기다림...
$browser->waitUntilEnabled('.selector', 1);

// 최대 5초 동안 셀렉터가 비활성화되기를 기다림...
$browser->waitUntilDisabled('.selector');

// 최대 1초 동안 셀렉터가 비활성화되기를 기다림...
$browser->waitUntilDisabled('.selector', 1);
```

<a name="scoping-selectors-when-available"></a>
#### 사용 가능할 때 셀렉터 범위 지정하기

때때로 주어진 셀렉터와 일치하는 요소가 나타나기를 기다린 다음 해당 요소와 상호작용하고 싶을 수 있습니다. 예를 들어 모달 창이 사용 가능해질 때까지 기다린 다음 모달 내에서 "OK" 버튼을 누르고 싶을 수 있습니다. 이를 위해 `whenAvailable` 메서드를 사용할 수 있습니다. 주어진 클로저 내에서 수행되는 모든 요소 작업은 원래 셀렉터로 범위가 지정됩니다:

```php
$browser->whenAvailable('.modal', function (Browser $modal) {
    $modal->assertSee('Hello World')
        ->press('OK');
});
```

<a name="waiting-for-text"></a>
#### 텍스트 대기하기

`waitForText` 메서드는 주어진 텍스트가 페이지에 표시될 때까지 기다리는 데 사용할 수 있습니다:

```php
// 최대 5초 동안 텍스트를 기다림...
$browser->waitForText('Hello World');

// 최대 1초 동안 텍스트를 기다림...
$browser->waitForText('Hello World', 1);
```

`waitUntilMissingText` 메서드를 사용하여 표시된 텍스트가 페이지에서 제거될 때까지 기다릴 수 있습니다:

```php
// 최대 5초 동안 텍스트가 제거되기를 기다림...
$browser->waitUntilMissingText('Hello World');

// 최대 1초 동안 텍스트가 제거되기를 기다림...
$browser->waitUntilMissingText('Hello World', 1);
```

<a name="waiting-for-links"></a>
#### 링크 대기하기

`waitForLink` 메서드는 주어진 링크 텍스트가 페이지에 표시될 때까지 기다리는 데 사용할 수 있습니다:

```php
// 최대 5초 동안 링크를 기다림...
$browser->waitForLink('Create');

// 최대 1초 동안 링크를 기다림...
$browser->waitForLink('Create', 1);
```

<a name="waiting-for-inputs"></a>
#### Input 대기하기

`waitForInput` 메서드는 주어진 input 필드가 페이지에 표시될 때까지 기다리는 데 사용할 수 있습니다:

```php
// 최대 5초 동안 input을 기다림...
$browser->waitForInput($field);

// 최대 1초 동안 input을 기다림...
$browser->waitForInput($field, 1);
```

<a name="waiting-on-the-page-location"></a>
#### 페이지 위치 대기하기

`$browser->assertPathIs('/home')`와 같은 경로 assertion을 할 때 `window.location.pathname`이 비동기적으로 업데이트되는 경우 assertion이 실패할 수 있습니다. `waitForLocation` 메서드를 사용하여 위치가 주어진 값이 될 때까지 기다릴 수 있습니다:

```php
$browser->waitForLocation('/secret');
```

`waitForLocation` 메서드는 현재 창 위치가 완전한 URL이 될 때까지 기다리는 데에도 사용할 수 있습니다:

```php
$browser->waitForLocation('https://example.com/path');
```

[이름이 지정된 라우트](/docs/{{version}}/routing#named-routes)의 위치를 기다릴 수도 있습니다:

```php
$browser->waitForRoute($routeName, $parameters);
```

<a name="waiting-for-page-reloads"></a>
#### 페이지 새로고침 대기하기

작업을 수행한 후 페이지가 새로고침될 때까지 기다려야 하는 경우 `waitForReload` 메서드를 사용하세요:

```php
use Laravel\Dusk\Browser;

$browser->waitForReload(function (Browser $browser) {
    $browser->press('Submit');
})
->assertSee('Success!');
```

페이지 새로고침을 기다려야 하는 경우는 일반적으로 버튼을 클릭한 후에 발생하므로 편의를 위해 `clickAndWaitForReload` 메서드를 사용할 수 있습니다:

```php
$browser->clickAndWaitForReload('.selector')
    ->assertSee('something');
```

<a name="waiting-on-javascript-expressions"></a>
#### JavaScript 표현식 대기하기

때때로 주어진 JavaScript 표현식이 `true`로 평가될 때까지 테스트 실행을 일시 정지하고 싶을 수 있습니다. `waitUntil` 메서드를 사용하여 이를 쉽게 수행할 수 있습니다. 이 메서드에 표현식을 전달할 때 `return` 키워드나 끝 세미콜론을 포함할 필요가 없습니다:

```php
// 최대 5초 동안 표현식이 true가 되기를 기다림...
$browser->waitUntil('App.data.servers.length > 0');

// 최대 1초 동안 표현식이 true가 되기를 기다림...
$browser->waitUntil('App.data.servers.length > 0', 1);
```

<a name="waiting-on-vue-expressions"></a>
#### Vue 표현식 대기하기

`waitUntilVue` 및 `waitUntilVueIsNot` 메서드를 사용하여 [Vue 컴포넌트](https://vuejs.org) 속성이 주어진 값을 가질 때까지 기다릴 수 있습니다:

```php
// 컴포넌트 속성이 주어진 값을 포함할 때까지 기다림...
$browser->waitUntilVue('user.name', 'Taylor', '@user');

// 컴포넌트 속성이 주어진 값을 포함하지 않을 때까지 기다림...
$browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a name="waiting-for-javascript-events"></a>
#### JavaScript 이벤트 대기하기

`waitForEvent` 메서드를 사용하여 JavaScript 이벤트가 발생할 때까지 테스트 실행을 일시 정지할 수 있습니다:

```php
$browser->waitForEvent('load');
```

이벤트 리스너는 기본적으로 `body` 요소인 현재 범위에 연결됩니다. 범위 지정된 셀렉터를 사용하면 이벤트 리스너가 일치하는 요소에 연결됩니다:

```php
$browser->with('iframe', function (Browser $iframe) {
    // iframe의 load 이벤트를 기다림...
    $iframe->waitForEvent('load');
});
```

특정 요소에 이벤트 리스너를 연결하기 위해 `waitForEvent` 메서드의 두 번째 인수로 셀렉터를 제공할 수도 있습니다:

```php
$browser->waitForEvent('load', '.selector');
```

`document` 및 `window` 객체의 이벤트도 기다릴 수 있습니다:

```php
// 문서가 스크롤될 때까지 기다림...
$browser->waitForEvent('scroll', 'document');

// 최대 5초 동안 창 크기가 조절될 때까지 기다림...
$browser->waitForEvent('resize', 'window', 5);
```

<a name="waiting-with-a-callback"></a>
#### 콜백으로 대기하기

Dusk의 많은 "wait" 메서드는 기본 `waitUsing` 메서드에 의존합니다. 이 메서드를 직접 사용하여 주어진 클로저가 `true`를 반환할 때까지 기다릴 수 있습니다. `waitUsing` 메서드는 대기할 최대 시간(초), 클로저가 평가될 간격, 클로저, 그리고 선택적 실패 메시지를 받습니다:

```php
$browser->waitUsing(10, 1, function () use ($something) {
    return $something->isReady();
}, "Something wasn't ready in time.");
```

<a name="scrolling-an-element-into-view"></a>
### 요소를 화면에 스크롤하기

때때로 브라우저의 보이는 영역 밖에 있기 때문에 요소를 클릭할 수 없을 수 있습니다. `scrollIntoView` 메서드는 주어진 셀렉터의 요소가 뷰 내에 있을 때까지 브라우저 창을 스크롤합니다:

```php
$browser->scrollIntoView('.selector')
    ->click('.selector');
```

<a name="available-assertions"></a>
## 사용 가능한 Assertion

Dusk는 애플리케이션에 대해 수행할 수 있는 다양한 assertion을 제공합니다. 사용 가능한 모든 assertion은 아래 목록에 문서화되어 있습니다:

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

<div class="collection-method-list" markdown="1">

[assertTitle](#assert-title)
[assertTitleContains](#assert-title-contains)
[assertUrlIs](#assert-url-is)
[assertSchemeIs](#assert-scheme-is)
[assertSchemeIsNot](#assert-scheme-is-not)
[assertHostIs](#assert-host-is)
[assertHostIsNot](#assert-host-is-not)
[assertPortIs](#assert-port-is)
[assertPortIsNot](#assert-port-is-not)
[assertPathBeginsWith](#assert-path-begins-with)
[assertPathEndsWith](#assert-path-ends-with)
[assertPathContains](#assert-path-contains)
[assertPathIs](#assert-path-is)
[assertPathIsNot](#assert-path-is-not)
[assertRouteIs](#assert-route-is)
[assertQueryStringHas](#assert-query-string-has)
[assertQueryStringMissing](#assert-query-string-missing)
[assertFragmentIs](#assert-fragment-is)
[assertFragmentBeginsWith](#assert-fragment-begins-with)
[assertFragmentIsNot](#assert-fragment-is-not)
[assertHasCookie](#assert-has-cookie)
[assertHasPlainCookie](#assert-has-plain-cookie)
[assertCookieMissing](#assert-cookie-missing)
[assertPlainCookieMissing](#assert-plain-cookie-missing)
[assertCookieValue](#assert-cookie-value)
[assertPlainCookieValue](#assert-plain-cookie-value)
[assertSee](#assert-see)
[assertDontSee](#assert-dont-see)
[assertSeeIn](#assert-see-in)
[assertDontSeeIn](#assert-dont-see-in)
[assertSeeAnythingIn](#assert-see-anything-in)
[assertSeeNothingIn](#assert-see-nothing-in)
[assertCount](#assert-count)
[assertScript](#assert-script)
[assertSourceHas](#assert-source-has)
[assertSourceMissing](#assert-source-missing)
[assertSeeLink](#assert-see-link)
[assertDontSeeLink](#assert-dont-see-link)
[assertInputValue](#assert-input-value)
[assertInputValueIsNot](#assert-input-value-is-not)
[assertChecked](#assert-checked)
[assertNotChecked](#assert-not-checked)
[assertIndeterminate](#assert-indeterminate)
[assertRadioSelected](#assert-radio-selected)
[assertRadioNotSelected](#assert-radio-not-selected)
[assertSelected](#assert-selected)
[assertNotSelected](#assert-not-selected)
[assertSelectHasOptions](#assert-select-has-options)
[assertSelectMissingOptions](#assert-select-missing-options)
[assertSelectHasOption](#assert-select-has-option)
[assertSelectMissingOption](#assert-select-missing-option)
[assertValue](#assert-value)
[assertValueIsNot](#assert-value-is-not)
[assertAttribute](#assert-attribute)
[assertAttributeMissing](#assert-attribute-missing)
[assertAttributeContains](#assert-attribute-contains)
[assertAttributeDoesntContain](#assert-attribute-doesnt-contain)
[assertAriaAttribute](#assert-aria-attribute)
[assertDataAttribute](#assert-data-attribute)
[assertVisible](#assert-visible)
[assertPresent](#assert-present)
[assertNotPresent](#assert-not-present)
[assertMissing](#assert-missing)
[assertInputPresent](#assert-input-present)
[assertInputMissing](#assert-input-missing)
[assertDialogOpened](#assert-dialog-opened)
[assertEnabled](#assert-enabled)
[assertDisabled](#assert-disabled)
[assertButtonEnabled](#assert-button-enabled)
[assertButtonDisabled](#assert-button-disabled)
[assertFocused](#assert-focused)
[assertNotFocused](#assert-not-focused)
[assertAuthenticated](#assert-authenticated)
[assertGuest](#assert-guest)
[assertAuthenticatedAs](#assert-authenticated-as)
[assertVue](#assert-vue)
[assertVueIsNot](#assert-vue-is-not)
[assertVueContains](#assert-vue-contains)
[assertVueDoesntContain](#assert-vue-doesnt-contain)

</div>

<a name="assert-title"></a>
#### assertTitle

페이지 제목이 주어진 텍스트와 일치하는지 assertion합니다:

```php
$browser->assertTitle($title);
```

<a name="assert-title-contains"></a>
#### assertTitleContains

페이지 제목이 주어진 텍스트를 포함하는지 assertion합니다:

```php
$browser->assertTitleContains($title);
```

<a name="assert-url-is"></a>
#### assertUrlIs

현재 URL(쿼리 문자열 제외)이 주어진 문자열과 일치하는지 assertion합니다:

```php
$browser->assertUrlIs($url);
```

<a name="assert-scheme-is"></a>
#### assertSchemeIs

현재 URL 스킴이 주어진 스킴과 일치하는지 assertion합니다:

```php
$browser->assertSchemeIs($scheme);
```

<a name="assert-scheme-is-not"></a>
#### assertSchemeIsNot

현재 URL 스킴이 주어진 스킴과 일치하지 않는지 assertion합니다:

```php
$browser->assertSchemeIsNot($scheme);
```

<a name="assert-host-is"></a>
#### assertHostIs

현재 URL 호스트가 주어진 호스트와 일치하는지 assertion합니다:

```php
$browser->assertHostIs($host);
```

<a name="assert-host-is-not"></a>
#### assertHostIsNot

현재 URL 호스트가 주어진 호스트와 일치하지 않는지 assertion합니다:

```php
$browser->assertHostIsNot($host);
```

<a name="assert-port-is"></a>
#### assertPortIs

현재 URL 포트가 주어진 포트와 일치하는지 assertion합니다:

```php
$browser->assertPortIs($port);
```

<a name="assert-port-is-not"></a>
#### assertPortIsNot

현재 URL 포트가 주어진 포트와 일치하지 않는지 assertion합니다:

```php
$browser->assertPortIsNot($port);
```

<a name="assert-path-begins-with"></a>
#### assertPathBeginsWith

현재 URL 경로가 주어진 경로로 시작하는지 assertion합니다:

```php
$browser->assertPathBeginsWith('/home');
```

<a name="assert-path-ends-with"></a>
#### assertPathEndsWith

현재 URL 경로가 주어진 경로로 끝나는지 assertion합니다:

```php
$browser->assertPathEndsWith('/home');
```

<a name="assert-path-contains"></a>
#### assertPathContains

현재 URL 경로가 주어진 경로를 포함하는지 assertion합니다:

```php
$browser->assertPathContains('/home');
```

<a name="assert-path-is"></a>
#### assertPathIs

현재 경로가 주어진 경로와 일치하는지 assertion합니다:

```php
$browser->assertPathIs('/home');
```

<a name="assert-path-is-not"></a>
#### assertPathIsNot

현재 경로가 주어진 경로와 일치하지 않는지 assertion합니다:

```php
$browser->assertPathIsNot('/home');
```

<a name="assert-route-is"></a>
#### assertRouteIs

현재 URL이 주어진 [이름이 지정된 라우트](/docs/{{version}}/routing#named-routes)의 URL과 일치하는지 assertion합니다:

```php
$browser->assertRouteIs($name, $parameters);
```

<a name="assert-query-string-has"></a>
#### assertQueryStringHas

주어진 쿼리 문자열 파라미터가 있는지 assertion합니다:

```php
$browser->assertQueryStringHas($name);
```

주어진 쿼리 문자열 파라미터가 있고 주어진 값을 가지고 있는지 assertion합니다:

```php
$browser->assertQueryStringHas($name, $value);
```

<a name="assert-query-string-missing"></a>
#### assertQueryStringMissing

주어진 쿼리 문자열 파라미터가 없는지 assertion합니다:

```php
$browser->assertQueryStringMissing($name);
```

<a name="assert-fragment-is"></a>
#### assertFragmentIs

URL의 현재 해시 프래그먼트가 주어진 프래그먼트와 일치하는지 assertion합니다:

```php
$browser->assertFragmentIs('anchor');
```

<a name="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

URL의 현재 해시 프래그먼트가 주어진 프래그먼트로 시작하는지 assertion합니다:

```php
$browser->assertFragmentBeginsWith('anchor');
```

<a name="assert-fragment-is-not"></a>
#### assertFragmentIsNot

URL의 현재 해시 프래그먼트가 주어진 프래그먼트와 일치하지 않는지 assertion합니다:

```php
$browser->assertFragmentIsNot('anchor');
```

<a name="assert-has-cookie"></a>
#### assertHasCookie

주어진 암호화된 쿠키가 있는지 assertion합니다:

```php
$browser->assertHasCookie($name);
```

<a name="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

주어진 암호화되지 않은 쿠키가 있는지 assertion합니다:

```php
$browser->assertHasPlainCookie($name);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

주어진 암호화된 쿠키가 없는지 assertion합니다:

```php
$browser->assertCookieMissing($name);
```

<a name="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

주어진 암호화되지 않은 쿠키가 없는지 assertion합니다:

```php
$browser->assertPlainCookieMissing($name);
```

<a name="assert-cookie-value"></a>
#### assertCookieValue

암호화된 쿠키가 주어진 값을 가지고 있는지 assertion합니다:

```php
$browser->assertCookieValue($name, $value);
```

<a name="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

암호화되지 않은 쿠키가 주어진 값을 가지고 있는지 assertion합니다:

```php
$browser->assertPlainCookieValue($name, $value);
```

<a name="assert-see"></a>
#### assertSee

주어진 텍스트가 페이지에 있는지 assertion합니다:

```php
$browser->assertSee($text);
```

<a name="assert-dont-see"></a>
#### assertDontSee

주어진 텍스트가 페이지에 없는지 assertion합니다:

```php
$browser->assertDontSee($text);
```

<a name="assert-see-in"></a>
#### assertSeeIn

주어진 텍스트가 셀렉터 내에 있는지 assertion합니다:

```php
$browser->assertSeeIn($selector, $text);
```

<a name="assert-dont-see-in"></a>
#### assertDontSeeIn

주어진 텍스트가 셀렉터 내에 없는지 assertion합니다:

```php
$browser->assertDontSeeIn($selector, $text);
```

<a name="assert-see-anything-in"></a>
#### assertSeeAnythingIn

셀렉터 내에 어떤 텍스트든 있는지 assertion합니다:

```php
$browser->assertSeeAnythingIn($selector);
```

<a name="assert-see-nothing-in"></a>
#### assertSeeNothingIn

셀렉터 내에 텍스트가 없는지 assertion합니다:

```php
$browser->assertSeeNothingIn($selector);
```

<a name="assert-count"></a>
#### assertCount

주어진 셀렉터와 일치하는 요소가 지정된 횟수만큼 나타나는지 assertion합니다:

```php
$browser->assertCount($selector, $count);
```

<a name="assert-script"></a>
#### assertScript

주어진 JavaScript 표현식이 주어진 값으로 평가되는지 assertion합니다:

```php
$browser->assertScript('window.isLoaded')
    ->assertScript('document.readyState', 'complete');
```

<a name="assert-source-has"></a>
#### assertSourceHas

주어진 소스 코드가 페이지에 있는지 assertion합니다:

```php
$browser->assertSourceHas($code);
```

<a name="assert-source-missing"></a>
#### assertSourceMissing

주어진 소스 코드가 페이지에 없는지 assertion합니다:

```php
$browser->assertSourceMissing($code);
```

<a name="assert-see-link"></a>
#### assertSeeLink

주어진 링크가 페이지에 있는지 assertion합니다:

```php
$browser->assertSeeLink($linkText);
```

<a name="assert-dont-see-link"></a>
#### assertDontSeeLink

주어진 링크가 페이지에 없는지 assertion합니다:

```php
$browser->assertDontSeeLink($linkText);
```

<a name="assert-input-value"></a>
#### assertInputValue

주어진 input 필드가 주어진 값을 가지고 있는지 assertion합니다:

```php
$browser->assertInputValue($field, $value);
```

<a name="assert-input-value-is-not"></a>
#### assertInputValueIsNot

주어진 input 필드가 주어진 값을 가지고 있지 않은지 assertion합니다:

```php
$browser->assertInputValueIsNot($field, $value);
```

<a name="assert-checked"></a>
#### assertChecked

주어진 체크박스가 체크되어 있는지 assertion합니다:

```php
$browser->assertChecked($field);
```

<a name="assert-not-checked"></a>
#### assertNotChecked

주어진 체크박스가 체크되어 있지 않은지 assertion합니다:

```php
$browser->assertNotChecked($field);
```

<a name="assert-indeterminate"></a>
#### assertIndeterminate

주어진 체크박스가 불확정 상태인지 assertion합니다:

```php
$browser->assertIndeterminate($field);
```

<a name="assert-radio-selected"></a>
#### assertRadioSelected

주어진 라디오 필드가 선택되어 있는지 assertion합니다:

```php
$browser->assertRadioSelected($field, $value);
```

<a name="assert-radio-not-selected"></a>
#### assertRadioNotSelected

주어진 라디오 필드가 선택되어 있지 않은지 assertion합니다:

```php
$browser->assertRadioNotSelected($field, $value);
```

<a name="assert-selected"></a>
#### assertSelected

주어진 드롭다운이 주어진 값이 선택되어 있는지 assertion합니다:

```php
$browser->assertSelected($field, $value);
```

<a name="assert-not-selected"></a>
#### assertNotSelected

주어진 드롭다운이 주어진 값이 선택되어 있지 않은지 assertion합니다:

```php
$browser->assertNotSelected($field, $value);
```

<a name="assert-select-has-options"></a>
#### assertSelectHasOptions

주어진 값 배열이 선택 가능한지 assertion합니다:

```php
$browser->assertSelectHasOptions($field, $values);
```

<a name="assert-select-missing-options"></a>
#### assertSelectMissingOptions

주어진 값 배열이 선택 가능하지 않은지 assertion합니다:

```php
$browser->assertSelectMissingOptions($field, $values);
```

<a name="assert-select-has-option"></a>
#### assertSelectHasOption

주어진 값이 주어진 필드에서 선택 가능한지 assertion합니다:

```php
$browser->assertSelectHasOption($field, $value);
```

<a name="assert-select-missing-option"></a>
#### assertSelectMissingOption

주어진 값이 선택 가능하지 않은지 assertion합니다:

```php
$browser->assertSelectMissingOption($field, $value);
```

<a name="assert-value"></a>
#### assertValue

주어진 셀렉터와 일치하는 요소가 주어진 값을 가지고 있는지 assertion합니다:

```php
$browser->assertValue($selector, $value);
```

<a name="assert-value-is-not"></a>
#### assertValueIsNot

주어진 셀렉터와 일치하는 요소가 주어진 값을 가지고 있지 않은지 assertion합니다:

```php
$browser->assertValueIsNot($selector, $value);
```

<a name="assert-attribute"></a>
#### assertAttribute

주어진 셀렉터와 일치하는 요소가 제공된 속성에서 주어진 값을 가지고 있는지 assertion합니다:

```php
$browser->assertAttribute($selector, $attribute, $value);
```

<a name="assert-attribute-missing"></a>
#### assertAttributeMissing

주어진 셀렉터와 일치하는 요소에 제공된 속성이 없는지 assertion합니다:

```php
$browser->assertAttributeMissing($selector, $attribute);
```

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

주어진 셀렉터와 일치하는 요소가 제공된 속성에 주어진 값을 포함하는지 assertion합니다:

```php
$browser->assertAttributeContains($selector, $attribute, $value);
```

<a name="assert-attribute-doesnt-contain"></a>
#### assertAttributeDoesntContain

주어진 셀렉터와 일치하는 요소가 제공된 속성에 주어진 값을 포함하지 않는지 assertion합니다:

```php
$browser->assertAttributeDoesntContain($selector, $attribute, $value);
```

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

주어진 셀렉터와 일치하는 요소가 제공된 aria 속성에서 주어진 값을 가지고 있는지 assertion합니다:

```php
$browser->assertAriaAttribute($selector, $attribute, $value);
```

예를 들어 `<button aria-label="Add"></button>` 마크업이 주어지면 다음과 같이 `aria-label` 속성에 대해 assertion할 수 있습니다:

```php
$browser->assertAriaAttribute('button', 'label', 'Add')
```

<a name="assert-data-attribute"></a>
#### assertDataAttribute

주어진 셀렉터와 일치하는 요소가 제공된 data 속성에서 주어진 값을 가지고 있는지 assertion합니다:

```php
$browser->assertDataAttribute($selector, $attribute, $value);
```

예를 들어 `<tr id="row-1" data-content="attendees"></tr>` 마크업이 주어지면 다음과 같이 `data-label` 속성에 대해 assertion할 수 있습니다:

```php
$browser->assertDataAttribute('#row-1', 'content', 'attendees')
```

<a name="assert-visible"></a>
#### assertVisible

주어진 셀렉터와 일치하는 요소가 보이는지 assertion합니다:

```php
$browser->assertVisible($selector);
```

<a name="assert-present"></a>
#### assertPresent

주어진 셀렉터와 일치하는 요소가 소스에 있는지 assertion합니다:

```php
$browser->assertPresent($selector);
```

<a name="assert-not-present"></a>
#### assertNotPresent

주어진 셀렉터와 일치하는 요소가 소스에 없는지 assertion합니다:

```php
$browser->assertNotPresent($selector);
```

<a name="assert-missing"></a>
#### assertMissing

주어진 셀렉터와 일치하는 요소가 보이지 않는지 assertion합니다:

```php
$browser->assertMissing($selector);
```

<a name="assert-input-present"></a>
#### assertInputPresent

주어진 이름의 input이 있는지 assertion합니다:

```php
$browser->assertInputPresent($name);
```

<a name="assert-input-missing"></a>
#### assertInputMissing

주어진 이름의 input이 소스에 없는지 assertion합니다:

```php
$browser->assertInputMissing($name);
```

<a name="assert-dialog-opened"></a>
#### assertDialogOpened

주어진 메시지가 있는 JavaScript 다이얼로그가 열렸는지 assertion합니다:

```php
$browser->assertDialogOpened($message);
```

<a name="assert-enabled"></a>
#### assertEnabled

주어진 필드가 활성화되어 있는지 assertion합니다:

```php
$browser->assertEnabled($field);
```

<a name="assert-disabled"></a>
#### assertDisabled

주어진 필드가 비활성화되어 있는지 assertion합니다:

```php
$browser->assertDisabled($field);
```

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

주어진 버튼이 활성화되어 있는지 assertion합니다:

```php
$browser->assertButtonEnabled($button);
```

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

주어진 버튼이 비활성화되어 있는지 assertion합니다:

```php
$browser->assertButtonDisabled($button);
```

<a name="assert-focused"></a>
#### assertFocused

주어진 필드에 포커스가 있는지 assertion합니다:

```php
$browser->assertFocused($field);
```

<a name="assert-not-focused"></a>
#### assertNotFocused

주어진 필드에 포커스가 없는지 assertion합니다:

```php
$browser->assertNotFocused($field);
```

<a name="assert-authenticated"></a>
#### assertAuthenticated

사용자가 인증되었는지 assertion합니다:

```php
$browser->assertAuthenticated();
```

<a name="assert-guest"></a>
#### assertGuest

사용자가 인증되지 않았는지 assertion합니다:

```php
$browser->assertGuest();
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

사용자가 주어진 사용자로 인증되었는지 assertion합니다:

```php
$browser->assertAuthenticatedAs($user);
```

<a name="assert-vue"></a>
#### assertVue

Dusk는 [Vue 컴포넌트](https://vuejs.org) 데이터의 상태에 대해 assertion을 할 수도 있습니다. 예를 들어 애플리케이션에 다음과 같은 Vue 컴포넌트가 있다고 상상해 보세요:

    // HTML...

    <profile dusk="profile-component"></profile>

    // 컴포넌트 정의...

    Vue.component('profile', {
        template: '<div>{{ user.name }}</div>',

        data: function () {
            return {
                user: {
                    name: 'Taylor'
                }
            };
        }
    });

다음과 같이 Vue 컴포넌트의 상태에 대해 assertion할 수 있습니다:

```php tab=Pest
test('vue', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->assertVue('user.name', 'Taylor', '@profile-component');
    });
});
```

```php tab=PHPUnit
/**
 * 기본 Vue 테스트 예제.
 */
public function test_vue(): void
{
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->assertVue('user.name', 'Taylor', '@profile-component');
    });
}
```

<a name="assert-vue-is-not"></a>
#### assertVueIsNot

주어진 Vue 컴포넌트 데이터 속성이 주어진 값과 일치하지 않는지 assertion합니다:

```php
$browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a name="assert-vue-contains"></a>
#### assertVueContains

주어진 Vue 컴포넌트 데이터 속성이 배열이고 주어진 값을 포함하는지 assertion합니다:

```php
$browser->assertVueContains($property, $value, $componentSelector = null);
```

<a name="assert-vue-doesnt-contain"></a>
#### assertVueDoesntContain

주어진 Vue 컴포넌트 데이터 속성이 배열이고 주어진 값을 포함하지 않는지 assertion합니다:

```php
$browser->assertVueDoesntContain($property, $value, $componentSelector = null);
```

<a name="pages"></a>
## 페이지

때때로 테스트에서 여러 복잡한 작업을 순서대로 수행해야 합니다. 이로 인해 테스트를 읽고 이해하기 어려워질 수 있습니다. Dusk 페이지를 사용하면 단일 메서드를 통해 주어진 페이지에서 수행할 수 있는 표현력 있는 작업을 정의할 수 있습니다. 또한 페이지를 사용하면 애플리케이션 또는 단일 페이지에 대한 공통 셀렉터의 단축키를 정의할 수 있습니다.

<a name="generating-pages"></a>
### 페이지 생성하기

페이지 객체를 생성하려면 `dusk:page` Artisan 명령을 실행하세요. 모든 페이지 객체는 애플리케이션의 `tests/Browser/Pages` 디렉토리에 배치됩니다:

```shell
php artisan dusk:page Login
```

<a name="configuring-pages"></a>
### 페이지 설정하기

기본적으로 페이지에는 `url`, `assert`, `elements` 세 가지 메서드가 있습니다. 지금은 `url`과 `assert` 메서드에 대해 논의하겠습니다. `elements` 메서드는 [아래에서 더 자세히 논의됩니다](#shorthand-selectors).

<a name="the-url-method"></a>
#### `url` 메서드

`url` 메서드는 페이지를 나타내는 URL의 경로를 반환해야 합니다. Dusk는 브라우저에서 페이지로 이동할 때 이 URL을 사용합니다:

```php
/**
 * 페이지의 URL을 가져옵니다.
 */
public function url(): string
{
    return '/login';
}
```

<a name="the-assert-method"></a>
#### `assert` 메서드

`assert` 메서드는 브라우저가 실제로 주어진 페이지에 있는지 확인하는 데 필요한 모든 assertion을 수행할 수 있습니다. 실제로 이 메서드 내에 아무것도 넣지 않아도 됩니다. 그러나 원하는 경우 이러한 assertion을 자유롭게 수행할 수 있습니다. 이러한 assertion은 페이지로 이동할 때 자동으로 실행됩니다:

```php
/**
 * 브라우저가 페이지에 있는지 assertion합니다.
 */
public function assert(Browser $browser): void
{
    $browser->assertPathIs($this->url());
}
```

<a name="navigating-to-pages"></a>
### 페이지로 이동하기

페이지가 정의되면 `visit` 메서드를 사용하여 이동할 수 있습니다:

```php
use Tests\Browser\Pages\Login;

$browser->visit(new Login);
```

때때로 이미 주어진 페이지에 있고 현재 테스트 컨텍스트에 페이지의 셀렉터와 메서드를 "로드"해야 할 수 있습니다. 이것은 버튼을 누르고 명시적으로 이동하지 않고 주어진 페이지로 리다이렉트될 때 일반적입니다. 이 상황에서 `on` 메서드를 사용하여 페이지를 로드할 수 있습니다:

```php
use Tests\Browser\Pages\CreatePlaylist;

$browser->visit('/dashboard')
    ->clickLink('Create Playlist')
    ->on(new CreatePlaylist)
    ->assertSee('@create');
```

<a name="shorthand-selectors"></a>
### 단축 셀렉터

페이지 클래스 내의 `elements` 메서드를 사용하면 페이지의 모든 CSS 셀렉터에 대해 빠르고 기억하기 쉬운 단축키를 정의할 수 있습니다. 예를 들어 애플리케이션 로그인 페이지의 "email" input 필드에 대한 단축키를 정의해 보겠습니다:

```php
/**
 * 페이지의 요소 단축키를 가져옵니다.
 *
 * @return array<string, string>
 */
public function elements(): array
{
    return [
        '@email' => 'input[name=email]',
    ];
}
```

단축키가 정의되면 일반적으로 전체 CSS 셀렉터를 사용하는 모든 곳에서 단축 셀렉터를 사용할 수 있습니다:

```php
$browser->type('@email', 'taylor@laravel.com');
```

<a name="global-shorthand-selectors"></a>
#### 전역 단축 셀렉터

Dusk를 설치한 후 기본 `Page` 클래스가 `tests/Browser/Pages` 디렉토리에 배치됩니다. 이 클래스에는 애플리케이션 전체의 모든 페이지에서 사용할 수 있어야 하는 전역 단축 셀렉터를 정의하는 데 사용할 수 있는 `siteElements` 메서드가 포함되어 있습니다:

```php
/**
 * 사이트의 전역 요소 단축키를 가져옵니다.
 *
 * @return array<string, string>
 */
public static function siteElements(): array
{
    return [
        '@element' => '#selector',
    ];
}
```

<a name="page-methods"></a>
### 페이지 메서드

페이지에 정의된 기본 메서드 외에도 테스트 전체에서 사용할 수 있는 추가 메서드를 정의할 수 있습니다. 예를 들어 음악 관리 애플리케이션을 구축하고 있다고 상상해 보세요. 애플리케이션의 한 페이지에서 일반적인 작업은 재생 목록을 만드는 것일 수 있습니다. 각 테스트에서 재생 목록을 만드는 로직을 다시 작성하는 대신 페이지 클래스에 `createPlaylist` 메서드를 정의할 수 있습니다:

```php
<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Page;

class Dashboard extends Page
{
    // 다른 페이지 메서드...

    /**
     * 새 재생 목록을 만듭니다.
     */
    public function createPlaylist(Browser $browser, string $name): void
    {
        $browser->type('name', $name)
            ->check('share')
            ->press('Create Playlist');
    }
}
```

메서드가 정의되면 해당 페이지를 활용하는 모든 테스트에서 사용할 수 있습니다. 브라우저 인스턴스는 자동으로 사용자 정의 페이지 메서드의 첫 번째 인수로 전달됩니다:

```php
use Tests\Browser\Pages\Dashboard;

$browser->visit(new Dashboard)
    ->createPlaylist('My Playlist')
    ->assertSee('My Playlist');
```

<a name="components"></a>
## 컴포넌트

컴포넌트는 Dusk의 "페이지 객체"와 유사하지만 네비게이션 바나 알림 창과 같이 애플리케이션 전체에서 재사용되는 UI 조각 및 기능을 위한 것입니다. 따라서 컴포넌트는 특정 URL에 바인딩되지 않습니다.

<a name="generating-components"></a>
### 컴포넌트 생성하기

컴포넌트를 생성하려면 `dusk:component` Artisan 명령을 실행하세요. 새 컴포넌트는 `tests/Browser/Components` 디렉토리에 배치됩니다:

```shell
php artisan dusk:component DatePicker
```

위에서 보여준 것처럼 "날짜 선택기"는 다양한 페이지에서 애플리케이션 전체에 존재할 수 있는 컴포넌트의 예입니다. 테스트 스위트 전체에서 수십 개의 테스트에서 날짜를 선택하기 위한 브라우저 자동화 로직을 수동으로 작성하는 것은 번거로울 수 있습니다. 대신 날짜 선택기를 나타내는 Dusk 컴포넌트를 정의하여 해당 로직을 컴포넌트 내에 캡슐화할 수 있습니다:

```php
<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class DatePicker extends BaseComponent
{
    /**
     * 컴포넌트의 루트 셀렉터를 가져옵니다.
     */
    public function selector(): string
    {
        return '.date-picker';
    }

    /**
     * 브라우저 페이지에 컴포넌트가 포함되어 있는지 assertion합니다.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector());
    }

    /**
     * 컴포넌트의 요소 단축키를 가져옵니다.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@date-field' => 'input.datepicker-input',
            '@year-list' => 'div > div.datepicker-years',
            '@month-list' => 'div > div.datepicker-months',
            '@day-list' => 'div > div.datepicker-days',
        ];
    }

    /**
     * 주어진 날짜를 선택합니다.
     */
    public function selectDate(Browser $browser, int $year, int $month, int $day): void
    {
        $browser->click('@date-field')
            ->within('@year-list', function (Browser $browser) use ($year) {
                $browser->click($year);
            })
            ->within('@month-list', function (Browser $browser) use ($month) {
                $browser->click($month);
            })
            ->within('@day-list', function (Browser $browser) use ($day) {
                $browser->click($day);
            });
    }
}
```

<a name="using-components"></a>
### 컴포넌트 사용하기

컴포넌트가 정의되면 모든 테스트에서 날짜 선택기 내에서 쉽게 날짜를 선택할 수 있습니다. 그리고 날짜를 선택하는 데 필요한 로직이 변경되면 컴포넌트만 업데이트하면 됩니다:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;

pest()->use(DatabaseMigrations::class);

test('basic example', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->within(new DatePicker, function (Browser $browser) {
                $browser->selectDate(2019, 1, 30);
            })
            ->assertSee('January');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    /**
     * 기본 컴포넌트 테스트 예제.
     */
    public function test_basic_example(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                ->within(new DatePicker, function (Browser $browser) {
                    $browser->selectDate(2019, 1, 30);
                })
                ->assertSee('January');
        });
    }
}
```

`component` 메서드를 사용하여 주어진 컴포넌트로 범위가 지정된 브라우저 인스턴스를 가져올 수 있습니다:

```php
$datePicker = $browser->component(new DatePickerComponent);

$datePicker->selectDate(2019, 1, 30);

$datePicker->assertSee('January');
```

<a name="continuous-integration"></a>
## 지속적 통합

> [!WARNING]
> 대부분의 Dusk 지속적 통합 구성은 Laravel 애플리케이션이 포트 8000에서 내장 PHP 개발 서버를 사용하여 서비스되기를 기대합니다. 따라서 계속하기 전에 지속적 통합 환경에 `http://127.0.0.1:8000` 값의 `APP_URL` 환경 변수가 있는지 확인해야 합니다.

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI

[Heroku CI](https://www.heroku.com/continuous-integration)에서 Dusk 테스트를 실행하려면 다음 Google Chrome 빌드팩과 스크립트를 Heroku `app.json` 파일에 추가하세요:

```json
{
  "environments": {
    "test": {
      "buildpacks": [
        { "url": "heroku/php" },
        { "url": "https://github.com/heroku/heroku-buildpack-chrome-for-testing" }
      ],
      "scripts": {
        "test-setup": "cp .env.testing .env",
        "test": "nohup bash -c './vendor/laravel/dusk/bin/chromedriver-linux --port=9515 > /dev/null 2>&1 &' && nohup bash -c 'php artisan serve --no-reload > /dev/null 2>&1 &' && php artisan dusk"
      }
    }
  }
}
```

<a name="running-tests-on-travis-ci"></a>
### Travis CI

[Travis CI](https://travis-ci.org)에서 Dusk 테스트를 실행하려면 다음 `.travis.yml` 구성을 사용하세요. Travis CI는 그래픽 환경이 아니므로 Chrome 브라우저를 실행하기 위해 몇 가지 추가 단계를 수행해야 합니다. 또한 PHP의 내장 웹 서버를 실행하기 위해 `php artisan serve`를 사용합니다:

```yaml
language: php

php:
  - 8.2

addons:
  chrome: stable

install:
  - cp .env.testing .env
  - travis_retry composer install --no-interaction --prefer-dist
  - php artisan key:generate
  - php artisan dusk:chrome-driver

before_script:
  - google-chrome-stable --headless --disable-gpu --remote-debugging-port=9222 http://localhost &
  - php artisan serve --no-reload &

script:
  - php artisan dusk
```

<a name="running-tests-on-github-actions"></a>
### GitHub Actions

[GitHub Actions](https://github.com/features/actions)를 사용하여 Dusk 테스트를 실행하는 경우 다음 구성 파일을 시작점으로 사용할 수 있습니다. TravisCI와 마찬가지로 `php artisan serve` 명령을 사용하여 PHP의 내장 웹 서버를 실행합니다:

```yaml
name: CI
on: [push]
jobs:

  dusk-php:
    runs-on: ubuntu-latest
    env:
      APP_URL: "http://127.0.0.1:8000"
      DB_USERNAME: root
      DB_PASSWORD: root
      MAIL_MAILER: log
    steps:
      - uses: actions/checkout@v5
      - name: Prepare The Environment
        run: cp .env.example .env
      - name: Create Database
        run: |
          sudo systemctl start mysql
          mysql --user="root" --password="root" -e "CREATE DATABASE \`my-database\` character set UTF8mb4 collate utf8mb4_bin;"
      - name: Install Composer Dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader
      - name: Generate Application Key
        run: php artisan key:generate
      - name: Upgrade Chrome Driver
        run: php artisan dusk:chrome-driver --detect
      - name: Start Chrome Driver
        run: ./vendor/laravel/dusk/bin/chromedriver-linux --port=9515 &
      - name: Run Laravel Server
        run: php artisan serve --no-reload &
      - name: Run Dusk Tests
        run: php artisan dusk
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: tests/Browser/screenshots
      - name: Upload Console Logs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: console
          path: tests/Browser/console
```

<a name="running-tests-on-chipper-ci"></a>
### Chipper CI

[Chipper CI](https://chipperci.com)를 사용하여 Dusk 테스트를 실행하는 경우 다음 구성 파일을 시작점으로 사용할 수 있습니다. PHP의 내장 서버를 사용하여 Laravel을 실행하여 요청을 수신할 수 있도록 합니다:

```yaml
# file .chipperci.yml
version: 1

environment:
  php: 8.2
  node: 16

# 빌드 환경에 Chrome 포함
services:
  - dusk

# 모든 커밋 빌드
on:
   push:
      branches: .*

pipeline:
  - name: Setup
    cmd: |
      cp -v .env.example .env
      composer install --no-interaction --prefer-dist --optimize-autoloader
      php artisan key:generate

      # APP_URL이 BUILD_HOST를 사용하도록 dusk env 파일 생성
      cp -v .env .env.dusk.ci
      sed -i "s@APP_URL=.*@APP_URL=http://$BUILD_HOST:8000@g" .env.dusk.ci

  - name: Compile Assets
    cmd: |
      npm ci --no-audit
      npm run build

  - name: Browser Tests
    cmd: |
      php -S [::0]:8000 -t public 2>server.log &
      sleep 2
      php artisan dusk:chrome-driver $CHROME_DRIVER
      php artisan dusk --env=ci
```

데이터베이스 사용 방법을 포함하여 Chipper CI에서 Dusk 테스트를 실행하는 방법에 대해 자세히 알아보려면 [공식 Chipper CI 문서](https://chipperci.com/docs/testing/laravel-dusk-new/)를 참조하세요.

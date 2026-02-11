# 릴리스 노트(Release Notes)

- [버전 관리 체계](#versioning-scheme)
- [지원 정책](#support-policy)
- [Laravel 11](#laravel-11)

<a name="versioning-scheme"></a>
## 버전 관리 체계(Versioning Scheme)

Laravel과 그 외 공식 패키지들은 [시맨틱 버저닝(Semantic Versioning)](https://semver.org)을 따릅니다. 메이저 프레임워크 릴리스는 매년(~1분기) 출시되며, 마이너 및 패치 릴리스는 매주 출시될 수 있습니다. 마이너 및 패치 릴리스에는 **절대로** 하위 호환성을 깨는 변경사항이 포함되어서는 안 됩니다.

애플리케이션이나 패키지에서 Laravel 프레임워크 또는 그 컴포넌트를 참조할 때는 Laravel의 메이저 릴리스에 하위 호환성을 깨는 변경사항이 포함될 수 있으므로 항상 `^11.0`과 같은 버전 제약 조건을 사용해야 합니다. 그러나 저희는 항상 하루 이내에 새로운 메이저 릴리스로 업그레이드할 수 있도록 노력하고 있습니다.

<a name="named-arguments"></a>
#### 명명된 인수(Named Arguments)

[명명된 인수](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)는 Laravel의 하위 호환성 가이드라인에 포함되지 않습니다. Laravel 코드베이스를 개선하기 위해 필요한 경우 함수 인수의 이름을 변경할 수 있습니다. 따라서 Laravel 메서드를 호출할 때 명명된 인수를 사용하는 것은 매개변수 이름이 향후 변경될 수 있다는 점을 이해하고 신중하게 수행해야 합니다.

<a name="support-policy"></a>
## 지원 정책(Support Policy)

모든 Laravel 릴리스에 대해 버그 수정은 18개월 동안 제공되고 보안 수정은 2년 동안 제공됩니다. Lumen을 포함한 모든 추가 라이브러리의 경우 최신 메이저 릴리스만 버그 수정을 받습니다. 또한 [Laravel이 지원하는](/docs/{{version}}/database#introduction) 데이터베이스 버전을 검토해 주세요.

<div class="overflow-auto">

| 버전 | PHP (*) | 릴리스 | 버그 수정 지원 기간 | 보안 수정 지원 기간 |
| --- | --- | --- | --- | --- |
| 9 | 8.0 - 8.2 | 2022년 2월 8일 | 2023년 8월 8일 | 2024년 2월 6일 |
| 10 | 8.1 - 8.3 | 2023년 2월 14일 | 2024년 8월 6일 | 2025년 2월 4일 |
| 11 | 8.2 - 8.4 | 2024년 3월 12일 | 2025년 9월 3일 | 2026년 3월 12일 |
| 12 | 8.2 - 8.4 | 2025년 2월 24일 | 2026년 8월 13일 | 2027년 2월 24일 |

</div>

<div class="version-colors">
    <div class="end-of-life">
        <div class="color-box"></div>
        <div>지원 종료</div>
    </div>
    <div class="security-fixes">
        <div class="color-box"></div>
        <div>보안 수정만 지원</div>
    </div>
</div>

(*) 지원되는 PHP 버전

<a name="laravel-11"></a>
## Laravel 11

Laravel 11은 간소화된 애플리케이션 구조, 초당 속도 제한(per-second rate limiting), 헬스 라우팅, 우아한 암호화 키 로테이션, 큐 테스트 개선, [Resend](https://resend.com) 메일 트랜스포트, Prompt 유효성 검사기 통합, 새로운 Artisan 명령 등을 도입하여 Laravel 10.x에서의 개선 사항을 이어갑니다. 또한 애플리케이션에 강력한 실시간 기능을 제공하는 공식 확장 가능한 WebSocket 서버인 Laravel Reverb가 도입되었습니다.

<a name="php-8"></a>
### PHP 8.2

Laravel 11.x는 최소 PHP 8.2 버전이 필요합니다.

<a name="structure"></a>
### 간소화된 애플리케이션 구조(Streamlined Application Structure)

_Laravel의 간소화된 애플리케이션 구조는 [Taylor Otwell](https://github.com/taylorotwell)과 [Nuno Maduro](https://github.com/nunomaduro)가 개발했습니다._

Laravel 11은 기존 애플리케이션에 대한 변경 없이 **새로운** Laravel 애플리케이션을 위한 간소화된 애플리케이션 구조를 도입합니다. 새로운 애플리케이션 구조는 Laravel 개발자에게 이미 익숙한 많은 개념을 유지하면서 더 가볍고 현대적인 경험을 제공하는 것을 목표로 합니다. 아래에서 Laravel의 새로운 애플리케이션 구조의 주요 내용을 살펴보겠습니다.

#### 애플리케이션 부트스트랩 파일(The Application Bootstrap File)

`bootstrap/app.php` 파일이 코드 우선 애플리케이션 설정 파일로 새롭게 개선되었습니다. 이 파일에서 이제 애플리케이션의 라우팅, 미들웨어, 서비스 프로바이더, 예외 처리 등을 커스터마이징할 수 있습니다. 이 파일은 이전에 애플리케이션의 파일 구조 전체에 분산되어 있던 다양한 상위 수준 애플리케이션 동작 설정을 통합합니다:

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

<a name="service-providers"></a>
#### 서비스 프로바이더(Service Providers)

기본 Laravel 애플리케이션 구조에 다섯 개의 서비스 프로바이더가 포함되었던 것과 달리, Laravel 11은 단일 `AppServiceProvider`만 포함합니다. 이전 서비스 프로바이더의 기능은 `bootstrap/app.php`에 통합되었거나, 프레임워크에 의해 자동으로 처리되거나, 애플리케이션의 `AppServiceProvider`에 배치할 수 있습니다.

예를 들어, 이벤트 디스커버리(event discovery)가 이제 기본적으로 활성화되어 이벤트와 리스너의 수동 등록 필요성이 크게 줄었습니다. 그러나 이벤트를 수동으로 등록해야 하는 경우 `AppServiceProvider`에서 간단히 등록할 수 있습니다. 마찬가지로 이전에 `AuthServiceProvider`에서 등록했을 수 있는 라우트 모델 바인딩이나 인증 게이트(authorization gates)도 `AppServiceProvider`에서 등록할 수 있습니다.

<a name="opt-in-routing"></a>
#### 선택적 API 및 브로드캐스트 라우팅(Opt-in API and Broadcast Routing)

많은 애플리케이션이 이러한 파일을 필요로 하지 않기 때문에 `api.php` 및 `channels.php` 라우트 파일이 더 이상 기본적으로 존재하지 않습니다. 대신 간단한 Artisan 명령을 사용하여 생성할 수 있습니다:

```shell
php artisan install:api

php artisan install:broadcasting
```

<a name="middleware"></a>
#### 미들웨어(Middleware)

이전에 새로운 Laravel 애플리케이션에는 아홉 개의 미들웨어가 포함되어 있었습니다. 이러한 미들웨어는 요청 인증, 입력 문자열 트리밍, CSRF 토큰 유효성 검사 등 다양한 작업을 수행했습니다.

Laravel 11에서는 이러한 미들웨어가 프레임워크 자체로 이동되어 애플리케이션 구조에 불필요한 부피를 추가하지 않습니다. 이러한 미들웨어의 동작을 커스터마이징하기 위한 새로운 메서드가 프레임워크에 추가되었으며, 애플리케이션의 `bootstrap/app.php` 파일에서 호출할 수 있습니다:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(
        except: ['stripe/*']
    );

    $middleware->web(append: [
        EnsureUserIsSubscribed::class,
    ])
})
```

모든 미들웨어를 애플리케이션의 `bootstrap/app.php`를 통해 쉽게 커스터마이징할 수 있으므로, 별도의 HTTP "커널" 클래스가 필요하지 않게 되었습니다.

<a name="scheduling"></a>
#### 스케줄링(Scheduling)

새로운 `Schedule` 파사드를 사용하여, 예약된 작업을 이제 애플리케이션의 `routes/console.php` 파일에서 직접 정의할 수 있어 별도의 콘솔 "커널" 클래스가 필요하지 않습니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')->daily();
```

<a name="exception-handling"></a>
#### 예외 처리(Exception Handling)

라우팅 및 미들웨어와 마찬가지로, 예외 처리도 이제 별도의 예외 핸들러 클래스 대신 애플리케이션의 `bootstrap/app.php` 파일에서 커스터마이징할 수 있어 새로운 Laravel 애플리케이션에 포함되는 전체 파일 수가 줄었습니다:

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReport(MissedFlightException::class);

    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    });
})
```

<a name="base-controller-class"></a>
#### 기본 `Controller` 클래스(Base `Controller` Class)

새로운 Laravel 애플리케이션에 포함된 기본 컨트롤러가 단순화되었습니다. 더 이상 Laravel의 내부 `Controller` 클래스를 확장하지 않으며, `AuthorizesRequests` 및 `ValidatesRequests` 트레이트가 제거되었습니다. 필요한 경우 애플리케이션의 개별 컨트롤러에 포함할 수 있습니다:

    <?php

    namespace App\Http\Controllers;

    abstract class Controller
    {
        //
    }

<a name="application-defaults"></a>
#### 애플리케이션 기본값(Application Defaults)

기본적으로 새로운 Laravel 애플리케이션은 데이터베이스 저장에 SQLite를 사용하고, Laravel의 세션, 캐시, 큐에는 `database` 드라이버를 사용합니다. 이를 통해 새로운 Laravel 애플리케이션을 생성한 직후 추가 소프트웨어 설치나 추가 데이터베이스 마이그레이션 생성 없이 바로 애플리케이션 개발을 시작할 수 있습니다.

또한 시간이 지남에 따라 이러한 Laravel 서비스의 `database` 드라이버는 많은 애플리케이션 컨텍스트에서 프로덕션 사용에 충분할 만큼 견고해졌습니다. 따라서 로컬 및 프로덕션 애플리케이션 모두에 합리적이고 통합된 선택을 제공합니다.

<a name="reverb"></a>
### Laravel Reverb

_Laravel Reverb는 [Joe Dixon](https://github.com/joedixon)이 개발했습니다._

[Laravel Reverb](https://reverb.laravel.com)는 초고속이며 확장 가능한 실시간 WebSocket 통신을 Laravel 애플리케이션에 직접 제공하고, Laravel Echo와 같은 Laravel의 기존 이벤트 브로드캐스팅 도구 모음과 원활하게 통합됩니다.

```shell
php artisan reverb:start
```

또한 Reverb는 Redis의 publish / subscribe 기능을 통한 수평 확장을 지원하여, 단일 고수요 애플리케이션을 지원하는 여러 백엔드 Reverb 서버에 WebSocket 트래픽을 분산할 수 있습니다.

Laravel Reverb에 대한 자세한 내용은 전체 [Reverb 문서](/docs/{{version}}/reverb)를 참조하세요.

<a name="rate-limiting"></a>
### 초당 속도 제한(Per-Second Rate Limiting)

_초당 속도 제한은 [Tim MacDonald](https://github.com/timacdonald)가 기여했습니다._

Laravel은 이제 HTTP 요청 및 큐 작업을 포함한 모든 속도 제한기에 대해 "초당" 속도 제한을 지원합니다. 이전에는 Laravel의 속도 제한기가 "분당" 단위로만 제한되었습니다:

```php
RateLimiter::for('invoices', function (Request $request) {
    return Limit::perSecond(1);
});
```

Laravel의 속도 제한에 대한 자세한 내용은 [속도 제한 문서](/docs/{{version}}/routing#rate-limiting)를 확인하세요.

<a name="health"></a>
### 헬스 라우팅(Health Routing)

_헬스 라우팅은 [Taylor Otwell](https://github.com/taylorotwell)이 기여했습니다._

새로운 Laravel 11 애플리케이션에는 `health` 라우팅 지시어가 포함되어 있으며, 이는 Kubernetes와 같은 서드파티 애플리케이션 상태 모니터링 서비스나 오케스트레이션 시스템에서 호출할 수 있는 간단한 상태 확인 엔드포인트를 정의하도록 Laravel에 지시합니다. 기본적으로 이 라우트는 `/up`에서 제공됩니다:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

이 라우트에 HTTP 요청이 발생하면, Laravel은 `DiagnosingHealth` 이벤트도 디스패치하여 애플리케이션과 관련된 추가 상태 확인을 수행할 수 있습니다.

<a name="encryption"></a>
### 우아한 암호화 키 로테이션(Graceful Encryption Key Rotation)

_우아한 암호화 키 로테이션은 [Taylor Otwell](https://github.com/taylorotwell)이 기여했습니다._

Laravel은 애플리케이션의 세션 쿠키를 포함한 모든 쿠키를 암호화하므로, 기본적으로 Laravel 애플리케이션에 대한 모든 요청은 암호화에 의존합니다. 그러나 이로 인해 애플리케이션의 암호화 키를 로테이션하면 모든 사용자가 애플리케이션에서 로그아웃됩니다. 또한 이전 암호화 키로 암호화된 데이터를 복호화하는 것이 불가능해집니다.

Laravel 11에서는 `APP_PREVIOUS_KEYS` 환경 변수를 통해 애플리케이션의 이전 암호화 키를 쉼표로 구분된 목록으로 정의할 수 있습니다.

값을 암호화할 때, Laravel은 항상 `APP_KEY` 환경 변수에 있는 "현재" 암호화 키를 사용합니다. 값을 복호화할 때, Laravel은 먼저 현재 키를 시도합니다. 현재 키로 복호화에 실패하면, Laravel은 키 중 하나가 값을 복호화할 수 있을 때까지 모든 이전 키를 시도합니다.

이러한 우아한 복호화 접근 방식을 통해 암호화 키가 로테이션되더라도 사용자가 중단 없이 애플리케이션을 계속 사용할 수 있습니다.

Laravel의 암호화에 대한 자세한 내용은 [암호화 문서](/docs/{{version}}/encryption)를 확인하세요.

<a name="automatic-password-rehashing"></a>
### 자동 비밀번호 리해싱(Automatic Password Rehashing)

_자동 비밀번호 리해싱은 [Stephen Rees-Carter](https://github.com/valorin)가 기여했습니다._

Laravel의 기본 비밀번호 해싱 알고리즘은 bcrypt입니다. bcrypt 해시의 "작업 계수(work factor)"는 `config/hashing.php` 설정 파일 또는 `BCRYPT_ROUNDS` 환경 변수를 통해 조정할 수 있습니다.

일반적으로 CPU/GPU 처리 능력이 증가함에 따라 bcrypt 작업 계수도 시간이 지남에 따라 증가해야 합니다. 애플리케이션의 bcrypt 작업 계수를 높이면, Laravel은 이제 사용자가 애플리케이션으로 인증할 때 우아하게 자동으로 사용자 비밀번호를 리해싱합니다.

<a name="prompt-validation"></a>
### Prompt 유효성 검사(Prompt Validation)

_Prompt 유효성 검사기 통합은 [Andrea Marco Sartori](https://github.com/cerbero90)가 기여했습니다._

[Laravel Prompts](/docs/{{version}}/prompts)는 플레이스홀더 텍스트와 유효성 검사를 포함한 브라우저와 유사한 기능을 갖춘 아름답고 사용자 친화적인 폼을 커맨드라인 애플리케이션에 추가하기 위한 PHP 패키지입니다.

Laravel Prompts는 클로저를 통한 입력 유효성 검사를 지원합니다:

```php
$name = text(
    label: 'What is your name?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

그러나 많은 입력이나 복잡한 유효성 검사 시나리오를 다룰 때 이것은 번거로워질 수 있습니다. 따라서 Laravel 11에서는 프롬프트 입력의 유효성을 검사할 때 Laravel [유효성 검사기](/docs/{{version}}/validation)의 모든 기능을 활용할 수 있습니다:

```php
$name = text('What is your name?', validate: [
    'name' => 'required|min:3|max:255',
]);
```

<a name="queue-interaction-testing"></a>
### 큐 상호작용 테스트(Queue Interaction Testing)

_큐 상호작용 테스트는 [Taylor Otwell](https://github.com/taylorotwell)이 기여했습니다._

이전에는 큐에 추가된 작업이 릴리스되었는지, 삭제되었는지, 또는 수동으로 실패 처리되었는지 테스트하려면 커스텀 큐 페이크(fakes)와 스텁(stubs)을 정의해야 해서 번거로웠습니다. 그러나 Laravel 11에서는 `withFakeQueueInteractions` 메서드를 사용하여 이러한 큐 상호작용을 쉽게 테스트할 수 있습니다:

```php
use App\Jobs\ProcessPodcast;

$job = (new ProcessPodcast)->withFakeQueueInteractions();

$job->handle();

$job->assertReleased(delay: 30);
```

큐 작업 테스트에 대한 자세한 내용은 [큐 문서](/docs/{{version}}/queues#testing)를 확인하세요.

<a name="new-artisan-commands"></a>
### 새로운 Artisan 명령(New Artisan Commands)

_클래스 생성 Artisan 명령은 [Taylor Otwell](https://github.com/taylorotwell)이 기여했습니다._

클래스, 열거형(enums), 인터페이스 및 트레이트를 빠르게 생성할 수 있는 새로운 Artisan 명령이 추가되었습니다:

```shell
php artisan make:class
php artisan make:enum
php artisan make:interface
php artisan make:trait
```

<a name="model-cast-improvements"></a>
### 모델 캐스트 개선(Model Casts Improvements)

_모델 캐스트 개선은 [Nuno Maduro](https://github.com/nunomaduro)가 기여했습니다._

Laravel 11은 프로퍼티 대신 메서드를 사용하여 모델의 캐스트를 정의하는 것을 지원합니다. 이를 통해 특히 인수가 있는 캐스트를 사용할 때 간소화되고 유연한 캐스트 정의가 가능합니다:

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => AsCollection::using(OptionCollection::class),
                      // AsEncryptedCollection::using(OptionCollection::class),
                      // AsEnumArrayObject::using(OptionEnum::class),
                      // AsEnumCollection::using(OptionEnum::class),
        ];
    }

속성 캐스팅에 대한 자세한 내용은 [Eloquent 문서](/docs/{{version}}/eloquent-mutators#attribute-casting)를 참조하세요.

<a name="the-once-function"></a>
### `once` 함수(The `once` Function)

_`once` 헬퍼는 [Taylor Otwell](https://github.com/taylorotwell)과_ _[Nuno Maduro](https://github.com/nunomaduro)가 기여했습니다._

`once` 헬퍼 함수는 주어진 콜백을 실행하고 요청 기간 동안 결과를 메모리에 캐시합니다. 동일한 콜백으로 `once` 함수를 후속 호출하면 이전에 캐시된 결과를 반환합니다:

    function random(): int
    {
        return once(function () {
            return random_int(1, 1000);
        });
    }

    random(); // 123
    random(); // 123 (cached result)
    random(); // 123 (cached result)

`once` 헬퍼에 대한 자세한 내용은 [헬퍼 문서](/docs/{{version}}/helpers#method-once)를 확인하세요.

<a name="database-performance"></a>
### 인메모리 데이터베이스 테스트 성능 향상(Improved Performance When Testing With In-Memory Databases)

_인메모리 데이터베이스 테스트 성능 향상은 [Anders Jenbo](https://github.com/AJenbo)가 기여했습니다._

Laravel 11은 테스트 중 `:memory:` SQLite 데이터베이스를 사용할 때 상당한 속도 향상을 제공합니다. 이를 위해 Laravel은 이제 PHP의 PDO 객체에 대한 참조를 유지하고 연결 간에 재사용하여, 종종 전체 테스트 실행 시간을 절반으로 줄입니다.

<a name="mariadb"></a>
### MariaDB 지원 개선(Improved Support for MariaDB)

_MariaDB 지원 개선은 [Jonas Staudenmeir](https://github.com/staudenmeir)와 [Julius Kiekbusch](https://github.com/Jubeki)가 기여했습니다._

Laravel 11은 MariaDB에 대한 지원이 개선되었습니다. 이전 Laravel 릴리스에서는 Laravel의 MySQL 드라이버를 통해 MariaDB를 사용할 수 있었습니다. 그러나 Laravel 11은 이제 이 데이터베이스 시스템에 더 나은 기본값을 제공하는 전용 MariaDB 드라이버를 포함합니다.

Laravel의 데이터베이스 드라이버에 대한 자세한 내용은 [데이터베이스 문서](/docs/{{version}}/database)를 확인하세요.

<a name="inspecting-database"></a>
### 데이터베이스 검사 및 개선된 스키마 작업(Inspecting Databases and Improved Schema Operations)

_개선된 스키마 작업 및 데이터베이스 검사는 [Hafez Divandari](https://github.com/hafezdivandari)가 기여했습니다._

Laravel 11은 네이티브 수정, 이름 변경, 컬럼 삭제를 포함한 추가 데이터베이스 스키마 작업 및 검사 메서드를 제공합니다. 또한 고급 공간 유형, 기본이 아닌 스키마 이름, 테이블, 뷰, 컬럼, 인덱스, 외래 키를 조작하기 위한 네이티브 스키마 메서드가 제공됩니다:

    use Illuminate\Support\Facades\Schema;

    $tables = Schema::getTables();
    $views = Schema::getViews();
    $columns = Schema::getColumns('users');
    $indexes = Schema::getIndexes('users');
    $foreignKeys = Schema::getForeignKeys('users');

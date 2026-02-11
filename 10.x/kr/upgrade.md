# 업그레이드 가이드

- [9.x에서 10.0으로 업그레이드](#upgrade-10.0)

<a name="high-impact-changes"></a>
## 영향도 높음

<div class="content-list" markdown="1">

- [의존성 업데이트](#updating-dependencies)
- [Minimum Stability 업데이트](#updating-minimum-stability)

</div>

<a name="medium-impact-changes"></a>
## 영향도 중간

<div class="content-list" markdown="1">

- [데이터베이스 표현식](#database-expressions)
- [모델 "Dates" 속성](#model-dates-property)
- [Monolog 3](#monolog-3)
- [Redis 캐시 태그](#redis-cache-tags)
- [서비스 모킹](#service-mocking)
- [언어 디렉토리](#language-directory)

</div>

<a name="low-impact-changes"></a>
## 영향도 낮음

<div class="content-list" markdown="1">

- [클로저 유효성 검사 규칙 메시지](#closure-validation-rule-messages)
- [Form Request `after` 메소드](#form-request-after-method)
- [Public Path 바인딩](#public-path-binding)
- [Query Exception 생성자](#query-exception-constructor)
- [Rate Limiter 반환 값](#rate-limiter-return-values)
- [`Redirect::home` 메소드](#redirect-home)
- [`Bus::dispatchNow` 메소드](#dispatch-now)
- [`registerPolicies` 메소드](#register-policies)
- [ULID 컬럼](#ulid-columns)

</div>

<a name="upgrade-10.0"></a>
## 9.x에서 10.0으로 업그레이드

<a name="estimated-upgrade-time-??-minutes"></a>
#### 예상 업그레이드 시간: 10분

> [!NOTE]
> 가능한 모든 주요 변경 사항을 문서화하려고 노력하고 있습니다. 일부 주요 변경 사항은 프레임워크의 잘 사용되지 않는 부분에 있기 때문에 이러한 변경 사항 중 일부만 실제로 애플리케이션에 영향을 줄 수 있습니다. 시간을 절약하고 싶으신가요? [Laravel Shift](https://laravelshift.com/)를 사용하여 애플리케이션 업그레이드를 자동화할 수 있습니다.

<a name="updating-dependencies"></a>
### 의존성 업데이트

**영향 가능성: 높음**

#### PHP 8.1.0 필요

Laravel은 이제 PHP 8.1.0 이상을 필요로 합니다.

#### Composer 2.2.0 필요

Laravel은 이제 [Composer](https://getcomposer.org) 2.2.0 이상을 필요로 합니다.

#### Composer 의존성

애플리케이션의 `composer.json` 파일에서 다음 의존성을 업데이트해야 합니다.

<div class="content-list" markdown="1">

- `laravel/framework`를 `^10.0`으로
- `laravel/sanctum`을 `^3.2`로
- `doctrine/dbal`을 `^3.0`으로
- `spatie/laravel-ignition`을 `^2.0`으로
- `laravel/passport`를 `^11.0`으로 ([업그레이드 가이드](https://github.com/laravel/passport/blob/11.x/UPGRADE.md))
- `laravel/ui`를 `^4.0`으로

</div>

Sanctum 2.x 릴리스 시리즈에서 3.x로 업그레이드하는 경우, [Sanctum 업그레이드 가이드](https://github.com/laravel/sanctum/blob/3.x/UPGRADE.md)를 참조해 주세요.

또한, [PHPUnit 10](https://phpunit.de/announcements/phpunit-10.html)을 사용하려면 애플리케이션의 `phpunit.xml` 설정 파일의 `<coverage>` 섹션에서 `processUncoveredFiles` 속성을 삭제해야 합니다. 그런 다음, 애플리케이션의 `composer.json` 파일에서 다음 의존성을 업데이트하세요.

<div class="content-list" markdown="1">

- `nunomaduro/collision`을 `^7.0`으로
- `phpunit/phpunit`을 `^10.0`으로

</div>

마지막으로, 애플리케이션에서 사용하는 다른 서드파티 패키지를 확인하고 Laravel 10을 지원하는 적절한 버전을 사용하고 있는지 확인하세요.

<a name="updating-minimum-stability"></a>
#### Minimum Stability

애플리케이션의 `composer.json` 파일에서 `minimum-stability` 설정을 `stable`로 업데이트해야 합니다. 또는 `minimum-stability`의 기본값이 `stable`이므로, 이 설정을 애플리케이션의 `composer.json` 파일에서 삭제할 수도 있습니다.

```json
"minimum-stability": "stable",
```

### 애플리케이션

<a name="public-path-binding"></a>
#### Public Path 바인딩

**영향 가능성: 낮음**

애플리케이션에서 컨테이너에 `path.public`을 바인딩하여 "public path"를 커스터마이징하고 있다면, 대신 `Illuminate\Foundation\Application` 객체가 제공하는 `usePublicPath` 메소드를 호출하도록 코드를 업데이트해야 합니다.

```php
app()->usePublicPath(__DIR__.'/public');
```

### 인가(Authorization)

<a name="register-policies"></a>
### `registerPolicies` 메소드

**영향 가능성: 낮음**

`AuthServiceProvider`의 `registerPolicies` 메소드는 이제 프레임워크에 의해 자동으로 호출됩니다. 따라서 애플리케이션의 `AuthServiceProvider`의 `boot` 메소드에서 이 메소드 호출을 제거할 수 있습니다.

### 캐시

<a name="redis-cache-tags"></a>
#### Redis 캐시 태그

**영향 가능성: 중간**

`Cache::tags()` 사용은 Memcached를 사용하는 애플리케이션에서만 권장됩니다. Redis를 애플리케이션의 캐시 드라이버로 사용하고 있다면, Memcached로 전환하거나 애플리케이션을 Laravel [12.30.0](https://github.com/laravel/framework/pull/57098)으로 업그레이드하는 것을 고려해야 합니다.

### 데이터베이스

<a name="database-expressions"></a>
#### 데이터베이스 표현식

**영향 가능성: 중간**

데이터베이스 "표현식(expressions)"(일반적으로 `DB::raw`를 통해 생성)이 향후 추가 기능을 제공하기 위해 Laravel 10.x에서 재작성되었습니다. 특히, 문법(grammar)의 원시 문자열 값은 이제 표현식의 `getValue(Grammar $grammar)` 메소드를 통해 가져와야 합니다. `(string)`을 사용하여 표현식을 문자열로 캐스팅하는 것은 더 이상 지원되지 않습니다.

**일반적으로 이는 최종 사용자 애플리케이션에 영향을 주지 않습니다**. 그러나 애플리케이션에서 `(string)`을 사용하여 데이터베이스 표현식을 수동으로 문자열로 캐스팅하거나 표현식의 `__toString` 메소드를 직접 호출하고 있다면, `getValue` 메소드를 호출하도록 코드를 업데이트해야 합니다.

```php
use Illuminate\Support\Facades\DB;

$expression = DB::raw('select 1');

$string = $expression->getValue(DB::connection()->getQueryGrammar());
```

<a name="query-exception-constructor"></a>
#### Query Exception 생성자

**영향 가능성: 매우 낮음**

`Illuminate\Database\QueryException` 생성자는 이제 첫 번째 인수로 문자열 커넥션 이름을 받습니다. 애플리케이션에서 이 예외를 수동으로 던지고 있다면, 그에 맞게 코드를 수정해야 합니다.

<a name="ulid-columns"></a>
#### ULID 컬럼

**영향 가능성: 낮음**

마이그레이션에서 인수 없이 `ulid` 메소드를 호출하면, 컬럼 이름이 이제 `ulid`로 지정됩니다. 이전 Laravel 릴리스에서는 인수 없이 이 메소드를 호출하면 잘못된 이름인 `uuid`로 컬럼이 생성되었습니다.

    $table->ulid();

`ulid` 메소드를 호출할 때 컬럼 이름을 명시적으로 지정하려면, 메소드에 컬럼 이름을 전달하면 됩니다.

    $table->ulid('ulid');

### Eloquent

<a name="model-dates-property"></a>
#### 모델 "Dates" 속성

**영향 가능성: 중간**

Eloquent 모델의 더 이상 사용되지 않는(deprecated) `$dates` 속성이 제거되었습니다. 애플리케이션은 이제 `$casts` 속성을 사용해야 합니다.

```php
protected $casts = [
    'deployed_at' => 'datetime',
];
```

### 다국어(Localization)

<a name="language-directory"></a>
#### 언어 디렉토리

**영향 가능성: 없음**

기존 애플리케이션에는 관련이 없지만, Laravel 애플리케이션 스켈레톤에는 더 이상 기본적으로 `lang` 디렉토리가 포함되지 않습니다. 대신 새로운 Laravel 애플리케이션을 작성할 때 `lang:publish` Artisan 명령을 사용하여 퍼블리시할 수 있습니다.

```shell
php artisan lang:publish
```

### 로깅

<a name="monolog-3"></a>
#### Monolog 3

**영향 가능성: 중간**

Laravel의 Monolog 의존성이 Monolog 3.x로 업데이트되었습니다. 애플리케이션 내에서 Monolog와 직접 상호작용하고 있다면, Monolog의 [업그레이드 가이드](https://github.com/Seldaek/monolog/blob/main/UPGRADE.md)를 검토해야 합니다.

BugSnag 또는 Rollbar와 같은 서드파티 로깅 서비스를 사용하고 있다면, Monolog 3.x 및 Laravel 10.x를 지원하는 버전으로 해당 서드파티 패키지를 업그레이드해야 할 수 있습니다.

### 큐

<a name="dispatch-now"></a>
#### `Bus::dispatchNow` 메소드

**영향 가능성: 낮음**

더 이상 사용되지 않는(deprecated) `Bus::dispatchNow` 및 `dispatch_now` 메소드가 제거되었습니다. 대신 애플리케이션에서 `Bus::dispatchSync` 및 `dispatch_sync` 메소드를 각각 사용해야 합니다.

<a name="dispatch-return"></a>
#### `dispatch()` 헬퍼 반환 값

**영향 가능성: 낮음**

`Illuminate\Contracts\Queue`를 구현하지 않는 클래스를 사용하여 `dispatch`를 호출하면 이전에는 클래스의 `handle` 메소드의 결과를 반환했습니다. 그러나 이제는 `Illuminate\Foundation\Bus\PendingBatch` 인스턴스를 반환합니다. 이전 동작을 재현하려면 `dispatch_sync()`를 사용할 수 있습니다.

### 라우팅

<a name="middleware-aliases"></a>
#### 미들웨어 별칭(Aliases)

**영향 가능성: 선택사항**

새로운 Laravel 애플리케이션에서 `App\Http\Kernel` 클래스의 `$routeMiddleware` 속성이 그 목적을 더 잘 반영하도록 `$middlewareAliases`로 이름이 변경되었습니다. 기존 애플리케이션에서 이 속성의 이름을 변경할 수 있지만 필수는 아닙니다.

<a name="rate-limiter-return-values"></a>
#### Rate Limiter 반환 값

**영향 가능성: 낮음**

`RateLimiter::attempt` 메소드를 호출할 때, 제공된 클로저에서 반환된 값이 이제 메소드에서 반환됩니다. 아무것도 반환되지 않거나 `null`이 반환되면, `attempt` 메소드는 `true`를 반환합니다.

```php
$value = RateLimiter::attempt('key', 10, fn () => ['example'], 1);

$value; // ['example']
```

<a name="redirect-home"></a>
#### `Redirect::home` 메소드

**영향 가능성: 매우 낮음**

더 이상 사용되지 않는(deprecated) `Redirect::home` 메소드가 제거되었습니다. 대신 애플리케이션에서 명시적으로 이름이 지정된 라우트로 리다이렉트해야 합니다.

```php
return Redirect::route('home');
```

### 테스트

<a name="service-mocking"></a>
#### 서비스 모킹

**영향 가능성: 중간**

더 이상 사용되지 않는(deprecated) `MocksApplicationServices` 트레이트가 프레임워크에서 제거되었습니다. 이 트레이트는 `expectsEvents`, `expectsJobs`, `expectsNotifications`와 같은 테스트 메소드를 제공했습니다.

애플리케이션에서 이러한 메소드를 사용하고 있다면, `Event::fake`, `Bus::fake`, `Notification::fake`로 전환하는 것을 권장합니다. 페이크(fake)를 통한 모킹에 대해 자세히 알아보려면 해당 컴포넌트의 문서를 참조하세요.

### 유효성 검사(Validation)

<a name="closure-validation-rule-messages"></a>
#### 클로저 유효성 검사 규칙 메시지

**영향 가능성: 매우 낮음**

클로저 기반 커스텀 유효성 검사 규칙을 작성할 때, `$fail` 콜백을 두 번 이상 호출하면 이전 메시지를 덮어쓰는 대신 메시지가 배열에 추가됩니다. 일반적으로 이것은 애플리케이션에 영향을 주지 않습니다.

또한, `$fail` 콜백은 이제 객체를 반환합니다. 이전에 유효성 검사 클로저의 반환 타입을 타입 힌트로 지정하고 있었다면, 타입 힌트를 업데이트해야 할 수 있습니다.

```php
public function rules()
{
    'name' => [
        function ($attribute, $value, $fail) {
            $fail('validation.translation.key')->translate();
        },
    ],
}
```

<a name="validation-messages-and-closure-rules"></a>
#### 유효성 검사 메시지와 클로저 규칙

**영향 가능성: 매우 낮음**

이전에는 클로저 기반 유효성 검사 규칙에 주입되는 `$fail` 콜백에 배열을 전달하여 다른 키에 실패 메시지를 할당할 수 있었습니다. 그러나 이제는 키를 첫 번째 인수로, 실패 메시지를 두 번째 인수로 제공해야 합니다.

```php
Validator::make([
    'foo' => 'string',
    'bar' => [function ($attribute, $value, $fail) {
        $fail('foo', 'Something went wrong!');
    }],
]);
```

<a name="form-request-after-method"></a>
#### Form Request After 메소드

**영향 가능성: 매우 낮음**

Form Request 내에서 `after` 메소드는 이제 [Laravel에 의해 예약](https://github.com/laravel/framework/pull/46757)되어 있습니다. Form Request에서 `after` 메소드를 정의하고 있다면, Laravel의 Form Request의 새로운 "유효성 검사 후(after validation)" 기능을 활용하도록 메소드의 이름을 변경하거나 수정해야 합니다.

<a name="miscellaneous"></a>
### 기타

`laravel/laravel` [GitHub 저장소](https://github.com/laravel/laravel)의 변경 사항도 확인하시기 바랍니다. 이러한 변경 사항 중 많은 부분이 필수는 아니지만, 애플리케이션과 파일을 동기화된 상태로 유지하고 싶을 수 있습니다. 이러한 변경 사항 중 일부는 이 업그레이드 가이드에서 다루지만, 설정 파일이나 주석의 변경과 같은 다른 사항은 다루지 않습니다.

[GitHub 비교 도구](https://github.com/laravel/laravel/compare/9.x...10.x)를 사용하여 변경 사항을 쉽게 확인하고 어떤 업데이트가 중요한지 선택할 수 있습니다. 그러나 GitHub 비교 도구에 표시되는 많은 변경 사항은 저희 조직의 PHP 네이티브 타입 도입으로 인한 것입니다. 이러한 변경 사항은 하위 호환성이 유지되며, Laravel 10으로 마이그레이션할 때 이를 도입하는 것은 선택사항입니다.

# 테스팅: 시작하기

- [소개](#introduction)
- [환경](#environment)
- [테스트 생성하기](#creating-tests)
- [테스트 실행하기](#running-tests)
    - [테스트 병렬 실행하기](#running-tests-in-parallel)
    - [테스트 커버리지 리포트](#reporting-test-coverage)
    - [테스트 프로파일링](#profiling-tests)
- [설정 캐싱](#configuration-caching)

<a name="introduction"></a>
## 소개

Laravel은 테스팅을 염두에 두고 설계되었습니다. 실제로 [Pest](https://pestphp.com)와 [PHPUnit](https://phpunit.de)을 사용한 테스팅 지원이 기본으로 포함되어 있으며, 애플리케이션을 위한 `phpunit.xml` 파일이 이미 설정되어 있습니다. 프레임워크는 또한 애플리케이션을 표현력 있게 테스트할 수 있도록 편리한 헬퍼 메서드를 제공합니다.

기본적으로 애플리케이션의 `tests` 디렉토리에는 `Feature`와 `Unit` 두 개의 디렉토리가 포함되어 있습니다. 유닛 테스트(Unit Test)는 코드의 매우 작고 독립적인 부분에 초점을 맞춘 테스트입니다. 실제로 대부분의 유닛 테스트는 단일 메서드에 초점을 맞출 것입니다. "Unit" 테스트 디렉토리 내의 테스트는 Laravel 애플리케이션을 부팅하지 않으므로 애플리케이션의 데이터베이스나 다른 프레임워크 서비스에 접근할 수 없습니다.

기능 테스트(Feature Test)는 여러 객체가 서로 어떻게 상호작용하는지 또는 JSON 엔드포인트에 대한 전체 HTTP 요청을 포함하여 코드의 더 큰 부분을 테스트할 수 있습니다. **일반적으로 대부분의 테스트는 기능 테스트여야 합니다. 이러한 유형의 테스트는 시스템 전체가 의도한 대로 작동하고 있다는 가장 높은 신뢰도를 제공합니다.**

`ExampleTest.php` 파일이 `Feature`와 `Unit` 테스트 디렉토리 모두에 제공됩니다. 새로운 Laravel 애플리케이션을 설치한 후 `vendor/bin/pest`, `vendor/bin/phpunit` 또는 `php artisan test` 명령을 실행하여 테스트를 수행할 수 있습니다.

<a name="environment"></a>
## 환경

테스트를 실행할 때 Laravel은 `phpunit.xml` 파일에 정의된 환경 변수로 인해 [설정 환경](/docs/{{version}}/configuration#environment-configuration)을 자동으로 `testing`으로 설정합니다. Laravel은 또한 세션과 캐시를 `array` 드라이버로 자동 설정하여 테스트 중에 세션이나 캐시 데이터가 지속되지 않도록 합니다.

필요에 따라 다른 테스팅 환경 설정 값을 자유롭게 정의할 수 있습니다. `testing` 환경 변수는 애플리케이션의 `phpunit.xml` 파일에서 설정할 수 있지만, 테스트를 실행하기 전에 `config:clear` Artisan 명령을 사용하여 설정 캐시를 지워야 합니다!

<a name="the-env-testing-environment-file"></a>
#### `.env.testing` 환경 파일

추가로 프로젝트 루트에 `.env.testing` 파일을 생성할 수 있습니다. 이 파일은 Pest와 PHPUnit 테스트를 실행하거나 `--env=testing` 옵션과 함께 Artisan 명령을 실행할 때 `.env` 파일 대신 사용됩니다.

<a name="creating-tests"></a>
## 테스트 생성하기

새로운 테스트 케이스를 생성하려면 `make:test` Artisan 명령을 사용하세요. 기본적으로 테스트는 `tests/Feature` 디렉토리에 생성됩니다.

```shell
php artisan make:test UserTest
```

`tests/Unit` 디렉토리 내에 테스트를 생성하려면 `make:test` 명령을 실행할 때 `--unit` 옵션을 사용할 수 있습니다.

```shell
php artisan make:test UserTest --unit
```

> [!NOTE]
> 테스트 스텁은 [스텁 퍼블리싱](/docs/{{version}}/artisan#stub-customization)을 사용하여 커스터마이징할 수 있습니다.

테스트가 생성되면 Pest 또는 PHPUnit을 사용하여 평소처럼 테스트를 정의할 수 있습니다. 테스트를 실행하려면 터미널에서 `vendor/bin/pest`, `vendor/bin/phpunit` 또는 `php artisan test` 명령을 실행하세요.

```php tab=Pest
<?php

test('basic', function () {
    expect(true)->toBeTrue();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 기본 테스트 예제.
     */
    public function test_basic_test(): void
    {
        $this->assertTrue(true);
    }
}
```

> [!WARNING]
> 테스트 클래스 내에서 자체 `setUp` / `tearDown` 메서드를 정의하는 경우 부모 클래스의 각각 `parent::setUp()` / `parent::tearDown()` 메서드를 호출해야 합니다. 일반적으로 자체 `setUp` 메서드의 시작 부분에서 `parent::setUp()`을 호출하고, `tearDown` 메서드의 끝에서 `parent::tearDown()`을 호출해야 합니다.

<a name="running-tests"></a>
## 테스트 실행하기

앞서 언급한 대로 테스트를 작성한 후에는 `pest` 또는 `phpunit`을 사용하여 실행할 수 있습니다.

```shell tab=Pest
./vendor/bin/pest
```

```shell tab=PHPUnit
./vendor/bin/phpunit
```

`pest` 또는 `phpunit` 명령 외에도 `test` Artisan 명령을 사용하여 테스트를 실행할 수 있습니다. Artisan 테스트 러너는 개발 및 디버깅을 용이하게 하기 위해 상세한 테스트 리포트를 제공합니다.

```shell
php artisan test
```

`pest` 또는 `phpunit` 명령에 전달할 수 있는 모든 인수는 Artisan `test` 명령에도 전달할 수 있습니다.

```shell
php artisan test --testsuite=Feature --stop-on-failure
```

<a name="running-tests-in-parallel"></a>
### 테스트 병렬 실행하기

기본적으로 Laravel과 Pest / PHPUnit은 단일 프로세스 내에서 테스트를 순차적으로 실행합니다. 그러나 여러 프로세스에서 동시에 테스트를 실행하여 테스트 실행 시간을 크게 줄일 수 있습니다. 시작하려면 `brianium/paratest` Composer 패키지를 "dev" 의존성으로 설치해야 합니다. 그런 다음 `test` Artisan 명령을 실행할 때 `--parallel` 옵션을 포함하세요.

```shell
composer require brianium/paratest --dev

php artisan test --parallel
```

기본적으로 Laravel은 머신에서 사용 가능한 CPU 코어 수만큼의 프로세스를 생성합니다. 그러나 `--processes` 옵션을 사용하여 프로세스 수를 조정할 수 있습니다.

```shell
php artisan test --parallel --processes=4
```

> [!WARNING]
> 테스트를 병렬로 실행할 때 일부 Pest / PHPUnit 옵션(예: `--do-not-cache-result`)은 사용할 수 없을 수 있습니다.

<a name="parallel-testing-and-databases"></a>
#### 병렬 테스팅과 데이터베이스

기본 데이터베이스 연결이 설정되어 있는 한, Laravel은 테스트를 실행하는 각 병렬 프로세스에 대해 테스트 데이터베이스를 자동으로 생성하고 마이그레이션합니다. 테스트 데이터베이스는 프로세스마다 고유한 프로세스 토큰으로 접미사가 붙습니다. 예를 들어 두 개의 병렬 테스트 프로세스가 있는 경우 Laravel은 `your_db_test_1`과 `your_db_test_2` 테스트 데이터베이스를 생성하고 사용합니다.

기본적으로 테스트 데이터베이스는 `test` Artisan 명령 호출 사이에 유지되어 후속 `test` 호출에서 다시 사용할 수 있습니다. 그러나 `--recreate-databases` 옵션을 사용하여 다시 생성할 수 있습니다.

```shell
php artisan test --parallel --recreate-databases
```

<a name="parallel-testing-hooks"></a>
#### 병렬 테스팅 훅

때때로 애플리케이션 테스트에서 사용하는 특정 리소스를 여러 테스트 프로세스에서 안전하게 사용할 수 있도록 준비해야 할 수 있습니다.

`ParallelTesting` 파사드를 사용하여 프로세스 또는 테스트 케이스의 `setUp`과 `tearDown`에서 실행할 코드를 지정할 수 있습니다. 주어진 클로저는 프로세스 토큰과 현재 테스트 케이스를 각각 포함하는 `$token`과 `$testCase` 변수를 받습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\ParallelTesting;
use Illuminate\Support\ServiceProvider;
use PHPUnit\Framework\TestCase;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 부트스트랩.
     */
    public function boot(): void
    {
        ParallelTesting::setUpProcess(function (int $token) {
            // ...
        });

        ParallelTesting::setUpTestCase(function (int $token, TestCase $testCase) {
            // ...
        });

        // 테스트 데이터베이스가 생성될 때 실행됩니다...
        ParallelTesting::setUpTestDatabase(function (string $database, int $token) {
            Artisan::call('db:seed');
        });

        ParallelTesting::tearDownTestCase(function (int $token, TestCase $testCase) {
            // ...
        });

        ParallelTesting::tearDownProcess(function (int $token) {
            // ...
        });
    }
}
```

<a name="accessing-the-parallel-testing-token"></a>
#### 병렬 테스팅 토큰 접근하기

애플리케이션의 테스트 코드의 다른 위치에서 현재 병렬 프로세스 "토큰"에 접근하려면 `token` 메서드를 사용할 수 있습니다. 이 토큰은 개별 테스트 프로세스에 대한 고유한 문자열 식별자이며 병렬 테스트 프로세스 간에 리소스를 분할하는 데 사용할 수 있습니다. 예를 들어 Laravel은 각 병렬 테스팅 프로세스에서 생성된 테스트 데이터베이스의 끝에 이 토큰을 자동으로 추가합니다.

    $token = ParallelTesting::token();

<a name="reporting-test-coverage"></a>
### 테스트 커버리지 리포트

> [!WARNING]
> 이 기능은 [Xdebug](https://xdebug.org) 또는 [PCOV](https://pecl.php.net/package/pcov)가 필요합니다.

애플리케이션 테스트를 실행할 때 테스트 케이스가 실제로 애플리케이션 코드를 얼마나 커버하는지, 그리고 테스트를 실행할 때 얼마나 많은 애플리케이션 코드가 사용되는지 확인하고 싶을 수 있습니다. 이를 위해 `test` 명령을 호출할 때 `--coverage` 옵션을 제공할 수 있습니다.

```shell
php artisan test --coverage
```

<a name="enforcing-a-minimum-coverage-threshold"></a>
#### 최소 커버리지 임계값 적용하기

`--min` 옵션을 사용하여 애플리케이션의 최소 테스트 커버리지 임계값을 정의할 수 있습니다. 이 임계값이 충족되지 않으면 테스트 스위트가 실패합니다.

```shell
php artisan test --coverage --min=80.3
```

<a name="profiling-tests"></a>
### 테스트 프로파일링

Artisan 테스트 러너에는 애플리케이션에서 가장 느린 테스트를 나열하는 편리한 메커니즘도 포함되어 있습니다. `--profile` 옵션과 함께 `test` 명령을 호출하면 가장 느린 10개의 테스트 목록이 표시되어 테스트 스위트 속도를 높이기 위해 어떤 테스트를 개선할 수 있는지 쉽게 조사할 수 있습니다.

```shell
php artisan test --profile
```

<a name="configuration-caching"></a>
## 설정 캐싱

테스트를 실행할 때 Laravel은 각 개별 테스트 메서드마다 애플리케이션을 부팅합니다. 캐시된 설정 파일이 없으면 테스트 시작 시 애플리케이션의 각 설정 파일을 로드해야 합니다. 설정을 한 번 빌드하고 단일 실행의 모든 테스트에서 재사용하려면 `Illuminate\Foundation\Testing\WithCachedConfig` 트레이트를 사용할 수 있습니다.

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\WithCachedConfig;

pest()->use(WithCachedConfig::class);

// ...
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\WithCachedConfig;
use Tests\TestCase;

class ConfigTest extends TestCase
{
    use WithCachedConfig;

    // ...
}
```

# 데이터베이스 테스팅(Database Testing)

- [소개](#introduction)
    - [각 테스트 후 데이터베이스 초기화하기](#resetting-the-database-after-each-test)
- [모델 팩토리](#model-factories)
- [시더 실행하기](#running-seeders)
- [사용 가능한 Assertions](#available-assertions)

<a name="introduction"></a>
## 소개

Laravel은 데이터베이스 기반 애플리케이션을 쉽게 테스트할 수 있도록 다양한 유용한 도구와 assertions를 제공합니다. 또한 Laravel 모델 팩토리(model factories)와 시더(seeders)를 사용하면 애플리케이션의 Eloquent 모델과 관계를 사용하여 테스트 데이터베이스 레코드를 손쉽게 생성할 수 있습니다. 다음 문서에서 이러한 강력한 기능들에 대해 모두 설명하겠습니다.

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 후 데이터베이스 초기화하기

더 진행하기 전에, 이전 테스트의 데이터가 이후 테스트에 영향을 주지 않도록 각 테스트 후에 데이터베이스를 초기화하는 방법에 대해 알아보겠습니다. Laravel에 포함된 `Illuminate\Foundation\Testing\RefreshDatabase` 트레이트가 이를 처리해 줍니다. 테스트 클래스에서 이 트레이트를 사용하면 됩니다.

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('basic example', function () {
    $response = $this->get('/');

    // ...
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 기본적인 기능 테스트 예제.
     */
    public function test_basic_example(): void
    {
        $response = $this->get('/');

        // ...
    }
}
```

`Illuminate\Foundation\Testing\RefreshDatabase` 트레이트는 스키마가 최신 상태인 경우 데이터베이스를 마이그레이션하지 않습니다. 대신 데이터베이스 트랜잭션 내에서만 테스트를 실행합니다. 따라서 이 트레이트를 사용하지 않는 테스트 케이스에서 데이터베이스에 추가한 레코드는 여전히 데이터베이스에 존재할 수 있습니다.

데이터베이스를 완전히 초기화하려면 `Illuminate\Foundation\Testing\DatabaseMigrations` 또는 `Illuminate\Foundation\Testing\DatabaseTruncation` 트레이트를 대신 사용할 수 있습니다. 그러나 이 두 옵션 모두 `RefreshDatabase` 트레이트보다 상당히 느립니다.

<a name="model-factories"></a>
## 모델 팩토리(Model Factories)

테스트할 때 테스트를 실행하기 전에 데이터베이스에 몇 개의 레코드를 삽입해야 할 수 있습니다. 테스트 데이터를 생성할 때 각 컬럼의 값을 수동으로 지정하는 대신, Laravel은 [모델 팩토리](/docs/{{version}}/eloquent-factories)를 사용하여 각 [Eloquent 모델](/docs/{{version}}/eloquent)에 대한 기본 속성 집합을 정의할 수 있습니다.

모델을 생성하기 위해 모델 팩토리를 만들고 활용하는 방법에 대해 자세히 알아보려면 [모델 팩토리 문서](/docs/{{version}}/eloquent-factories)를 참조하세요. 모델 팩토리를 정의한 후에는 테스트 내에서 팩토리를 활용하여 모델을 생성할 수 있습니다.

```php tab=Pest
use App\Models\User;

test('models can be instantiated', function () {
    $user = User::factory()->create();

    // ...
});
```

```php tab=PHPUnit
use App\Models\User;

public function test_models_can_be_instantiated(): void
{
    $user = User::factory()->create();

    // ...
}
```

<a name="running-seeders"></a>
## 시더 실행하기(Running Seeders)

기능 테스트 중에 [데이터베이스 시더](/docs/{{version}}/seeding)를 사용하여 데이터베이스를 채우려면 `seed` 메소드를 호출할 수 있습니다. 기본적으로 `seed` 메소드는 `DatabaseSeeder`를 실행하며, 이는 다른 모든 시더를 실행해야 합니다. 또는 특정 시더 클래스 이름을 `seed` 메소드에 전달할 수도 있습니다.

```php tab=Pest
<?php

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('orders can be created', function () {
    // DatabaseSeeder 실행...
    $this->seed();

    // 특정 시더 실행...
    $this->seed(OrderStatusSeeder::class);

    // ...

    // 특정 시더들의 배열 실행...
    $this->seed([
        OrderStatusSeeder::class,
        TransactionStatusSeeder::class,
        // ...
    ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 새 주문 생성 테스트.
     */
    public function test_orders_can_be_created(): void
    {
        // DatabaseSeeder 실행...
        $this->seed();

        // 특정 시더 실행...
        $this->seed(OrderStatusSeeder::class);

        // ...

        // 특정 시더들의 배열 실행...
        $this->seed([
            OrderStatusSeeder::class,
            TransactionStatusSeeder::class,
            // ...
        ]);
    }
}
```

또는 `RefreshDatabase` 트레이트를 사용하는 각 테스트 전에 자동으로 데이터베이스를 시딩하도록 Laravel에 지시할 수 있습니다. 기본 테스트 클래스에서 `$seed` 속성을 정의하여 이를 수행할 수 있습니다.

    <?php

    namespace Tests;

    use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

    abstract class TestCase extends BaseTestCase
    {
        /**
         * 각 테스트 전에 기본 시더를 실행할지 여부를 나타냅니다.
         *
         * @var bool
         */
        protected $seed = true;
    }

`$seed` 속성이 `true`인 경우, `RefreshDatabase` 트레이트를 사용하는 각 테스트 전에 `Database\Seeders\DatabaseSeeder` 클래스가 실행됩니다. 그러나 테스트 클래스에서 `$seeder` 속성을 정의하여 실행할 특정 시더를 지정할 수 있습니다.

    use Database\Seeders\OrderStatusSeeder;

    /**
     * 각 테스트 전에 특정 시더를 실행합니다.
     *
     * @var string
     */
    protected $seeder = OrderStatusSeeder::class;

<a name="available-assertions"></a>
## 사용 가능한 Assertions

Laravel은 [Pest](https://pestphp.com) 또는 [PHPUnit](https://phpunit.de) 기능 테스트를 위한 여러 데이터베이스 assertions를 제공합니다. 아래에서 각 assertion에 대해 설명하겠습니다.

<a name="assert-database-count"></a>
#### assertDatabaseCount

데이터베이스의 테이블에 주어진 개수의 레코드가 포함되어 있는지 확인합니다.

    $this->assertDatabaseCount('users', 5);

<a name="assert-database-empty"></a>
#### assertDatabaseEmpty

데이터베이스의 테이블에 레코드가 없는지 확인합니다.

    $this->assertDatabaseEmpty('users');

<a name="assert-database-has"></a>
#### assertDatabaseHas

데이터베이스의 테이블에 주어진 키/값 쿼리 제약 조건과 일치하는 레코드가 포함되어 있는지 확인합니다.

    $this->assertDatabaseHas('users', [
        'email' => 'sally@example.com',
    ]);

<a name="assert-database-missing"></a>
#### assertDatabaseMissing

데이터베이스의 테이블에 주어진 키/값 쿼리 제약 조건과 일치하는 레코드가 포함되어 있지 않은지 확인합니다.

    $this->assertDatabaseMissing('users', [
        'email' => 'sally@example.com',
    ]);

<a name="assert-deleted"></a>
#### assertSoftDeleted

`assertSoftDeleted` 메소드는 주어진 Eloquent 모델이 "소프트 삭제"되었는지 확인하는 데 사용할 수 있습니다.

    $this->assertSoftDeleted($user);

<a name="assert-not-deleted"></a>
#### assertNotSoftDeleted

`assertNotSoftDeleted` 메소드는 주어진 Eloquent 모델이 "소프트 삭제"되지 않았는지 확인하는 데 사용할 수 있습니다.

    $this->assertNotSoftDeleted($user);

<a name="assert-model-exists"></a>
#### assertModelExists

주어진 모델이 데이터베이스에 존재하는지 확인합니다.

    use App\Models\User;

    $user = User::factory()->create();

    $this->assertModelExists($user);

<a name="assert-model-missing"></a>
#### assertModelMissing

주어진 모델이 데이터베이스에 존재하지 않는지 확인합니다.

    use App\Models\User;

    $user = User::factory()->create();

    $user->delete();

    $this->assertModelMissing($user);

<a name="expects-database-query-count"></a>
#### expectsDatabaseQueryCount

`expectsDatabaseQueryCount` 메소드는 테스트 시작 부분에서 호출하여 테스트 중에 실행될 것으로 예상되는 총 데이터베이스 쿼리 수를 지정할 수 있습니다. 실제로 실행된 쿼리 수가 이 예상과 정확히 일치하지 않으면 테스트가 실패합니다.

    $this->expectsDatabaseQueryCount(5);

    // 테스트...

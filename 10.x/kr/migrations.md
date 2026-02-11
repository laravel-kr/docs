# 데이터베이스: 마이그레이션(Migrations)

- [소개](#introduction)
- [마이그레이션 생성하기](#generating-migrations)
    - [마이그레이션 스쿼싱](#squashing-migrations)
- [마이그레이션 구조](#migration-structure)
- [마이그레이션 실행하기](#running-migrations)
    - [마이그레이션 롤백하기](#rolling-back-migrations)
- [테이블](#tables)
    - [테이블 생성하기](#creating-tables)
    - [테이블 수정하기](#updating-tables)
    - [테이블 이름 변경 / 삭제하기](#renaming-and-dropping-tables)
- [컬럼](#columns)
    - [컬럼 생성하기](#creating-columns)
    - [사용 가능한 컬럼 타입](#available-column-types)
    - [컬럼 수정자](#column-modifiers)
    - [컬럼 수정하기](#modifying-columns)
    - [컬럼 이름 변경하기](#renaming-columns)
    - [컬럼 삭제하기](#dropping-columns)
- [인덱스](#indexes)
    - [인덱스 생성하기](#creating-indexes)
    - [인덱스 이름 변경하기](#renaming-indexes)
    - [인덱스 삭제하기](#dropping-indexes)
    - [외래 키 제약조건](#foreign-key-constraints)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

마이그레이션(Migration)은 데이터베이스를 위한 버전 관리와 같아서, 팀이 애플리케이션의 데이터베이스 스키마 정의를 정의하고 공유할 수 있게 해줍니다. 소스 컨트롤에서 변경사항을 가져온 후 팀원에게 로컬 데이터베이스 스키마에 수동으로 컬럼을 추가하라고 말해야 했던 경험이 있다면, 바로 그 문제를 데이터베이스 마이그레이션이 해결해 줍니다.

Laravel `Schema` [파사드(Facade)](/docs/{{version}}/facades)는 Laravel이 지원하는 모든 데이터베이스 시스템에서 테이블을 생성하고 조작하기 위한 데이터베이스 독립적인 지원을 제공합니다. 일반적으로 마이그레이션은 이 파사드를 사용하여 데이터베이스 테이블과 컬럼을 생성하고 수정합니다.

<a name="generating-migrations"></a>
## 마이그레이션 생성하기

`make:migration` [Artisan 명령어](/docs/{{version}}/artisan)를 사용하여 데이터베이스 마이그레이션을 생성할 수 있습니다. 새로운 마이그레이션은 `database/migrations` 디렉토리에 생성됩니다. 각 마이그레이션 파일명에는 타임스탬프가 포함되어 있어 Laravel이 마이그레이션의 순서를 결정할 수 있습니다.

```shell
php artisan make:migration create_flights_table
```

Laravel은 마이그레이션 이름을 사용하여 테이블 이름과 마이그레이션이 새 테이블을 생성하는지 여부를 추측합니다. Laravel이 마이그레이션 이름에서 테이블 이름을 결정할 수 있는 경우, 생성된 마이그레이션 파일에 지정된 테이블을 미리 채웁니다. 그렇지 않으면 마이그레이션 파일에서 테이블을 수동으로 지정할 수 있습니다.

생성된 마이그레이션에 대한 사용자 정의 경로를 지정하려면 `make:migration` 명령을 실행할 때 `--path` 옵션을 사용할 수 있습니다. 주어진 경로는 애플리케이션의 기본 경로를 기준으로 한 상대 경로여야 합니다.

> [!NOTE]
> 마이그레이션 스텁은 [스텁 퍼블리싱](/docs/{{version}}/artisan#stub-customization)을 사용하여 커스터마이징할 수 있습니다.

<a name="squashing-migrations"></a>
### 마이그레이션 스쿼싱

애플리케이션을 구축하면서 시간이 지남에 따라 점점 더 많은 마이그레이션이 쌓일 수 있습니다. 이로 인해 `database/migrations` 디렉토리가 수백 개의 마이그레이션으로 비대해질 수 있습니다. 원한다면 마이그레이션을 단일 SQL 파일로 "스쿼시(squash)"할 수 있습니다. 시작하려면 `schema:dump` 명령을 실행하세요.

```shell
php artisan schema:dump

# 현재 데이터베이스 스키마를 덤프하고 기존의 모든 마이그레이션을 정리합니다...
php artisan schema:dump --prune
```

이 명령을 실행하면 Laravel은 애플리케이션의 `database/schema` 디렉토리에 "스키마" 파일을 작성합니다. 스키마 파일의 이름은 데이터베이스 연결에 해당합니다. 이제 데이터베이스를 마이그레이션하려고 할 때 다른 마이그레이션이 실행되지 않았다면, Laravel은 먼저 사용 중인 데이터베이스 연결의 스키마 파일에 있는 SQL 문을 실행합니다. 스키마 파일의 SQL 문을 실행한 후, Laravel은 스키마 덤프에 포함되지 않은 나머지 마이그레이션을 실행합니다.

애플리케이션의 테스트가 로컬 개발 중에 일반적으로 사용하는 것과 다른 데이터베이스 연결을 사용하는 경우, 해당 데이터베이스 연결을 사용하여 스키마 파일을 덤프하여 테스트가 데이터베이스를 구축할 수 있도록 해야 합니다. 로컬 개발 중에 일반적으로 사용하는 데이터베이스 연결을 덤프한 후에 이 작업을 수행할 수 있습니다.

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

팀의 다른 새로운 개발자가 애플리케이션의 초기 데이터베이스 구조를 빠르게 생성할 수 있도록 데이터베이스 스키마 파일을 소스 컨트롤에 커밋해야 합니다.

> [!WARNING]
> 마이그레이션 스쿼싱은 MySQL, PostgreSQL, SQLite 데이터베이스에서만 사용할 수 있으며 데이터베이스의 명령줄 클라이언트를 활용합니다.

<a name="migration-structure"></a>
## 마이그레이션 구조

마이그레이션 클래스는 `up`과 `down` 두 가지 메서드를 포함합니다. `up` 메서드는 데이터베이스에 새 테이블, 컬럼 또는 인덱스를 추가하는 데 사용되고, `down` 메서드는 `up` 메서드가 수행한 작업을 되돌려야 합니다.

이 두 메서드 내에서 Laravel 스키마 빌더를 사용하여 테이블을 표현적으로 생성하고 수정할 수 있습니다. `Schema` 빌더에서 사용할 수 있는 모든 메서드에 대해 알아보려면 [해당 문서를 확인하세요](#creating-tables). 예를 들어, 다음 마이그레이션은 `flights` 테이블을 생성합니다.

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 마이그레이션을 실행합니다.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('airline');
            $table->timestamps();
        });
    }

    /**
     * 마이그레이션을 되돌립니다.
     */
    public function down(): void
    {
        Schema::drop('flights');
    }
};
```

<a name="setting-the-migration-connection"></a>
#### 마이그레이션 연결 설정

마이그레이션이 애플리케이션의 기본 데이터베이스 연결이 아닌 다른 데이터베이스 연결과 상호작용하는 경우, 마이그레이션의 `$connection` 속성을 설정해야 합니다.

```php
/**
 * 마이그레이션에서 사용해야 하는 데이터베이스 연결입니다.
 *
 * @var string
 */
protected $connection = 'pgsql';

/**
 * 마이그레이션을 실행합니다.
 */
public function up(): void
{
    // ...
}
```

<a name="running-migrations"></a>
## 마이그레이션 실행하기

보류 중인 모든 마이그레이션을 실행하려면 `migrate` Artisan 명령을 실행하세요.

```shell
php artisan migrate
```

지금까지 어떤 마이그레이션이 실행되었는지 확인하려면 `migrate:status` Artisan 명령을 사용할 수 있습니다.

```shell
php artisan migrate:status
```

실제로 마이그레이션을 실행하지 않고 마이그레이션에서 실행될 SQL 문을 확인하려면 `migrate` 명령에 `--pretend` 플래그를 제공할 수 있습니다.

```shell
php artisan migrate --pretend
```

#### 마이그레이션 실행 격리

여러 서버에 애플리케이션을 배포하고 배포 프로세스의 일부로 마이그레이션을 실행하는 경우, 두 서버가 동시에 데이터베이스를 마이그레이션하려고 하는 것을 원하지 않을 것입니다. 이를 피하려면 `migrate` 명령을 호출할 때 `isolated` 옵션을 사용할 수 있습니다.

`isolated` 옵션이 제공되면 Laravel은 마이그레이션을 실행하기 전에 애플리케이션의 캐시 드라이버를 사용하여 원자적 잠금을 획득합니다. 해당 잠금이 유지되는 동안 `migrate` 명령을 실행하려는 다른 모든 시도는 실행되지 않습니다. 그러나 명령은 여전히 성공적인 종료 상태 코드와 함께 종료됩니다.

```shell
php artisan migrate --isolated
```

> [!WARNING]
> 이 기능을 활용하려면 애플리케이션이 `memcached`, `redis`, `dynamodb`, `database`, `file` 또는 `array` 캐시 드라이버를 애플리케이션의 기본 캐시 드라이버로 사용해야 합니다. 또한 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

<a name="forcing-migrations-to-run-in-production"></a>
#### 프로덕션에서 마이그레이션 강제 실행

일부 마이그레이션 작업은 파괴적이며, 이는 데이터 손실을 야기할 수 있음을 의미합니다. 프로덕션 데이터베이스에서 이러한 명령을 실행하는 것을 방지하기 위해 명령이 실행되기 전에 확인 메시지가 표시됩니다. 프롬프트 없이 명령을 강제로 실행하려면 `--force` 플래그를 사용하세요.

```shell
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### 마이그레이션 롤백하기

가장 최근의 마이그레이션 작업을 롤백하려면 `rollback` Artisan 명령을 사용할 수 있습니다. 이 명령은 마지막 "배치"의 마이그레이션을 롤백하며, 여러 마이그레이션 파일을 포함할 수 있습니다.

```shell
php artisan migrate:rollback
```

`rollback` 명령에 `step` 옵션을 제공하여 제한된 수의 마이그레이션을 롤백할 수 있습니다. 예를 들어, 다음 명령은 마지막 5개의 마이그레이션을 롤백합니다.

```shell
php artisan migrate:rollback --step=5
```

`rollback` 명령에 `batch` 옵션을 제공하여 특정 "배치"의 마이그레이션을 롤백할 수 있습니다. 여기서 `batch` 옵션은 애플리케이션의 `migrations` 데이터베이스 테이블 내의 배치 값에 해당합니다. 예를 들어, 다음 명령은 배치 3의 모든 마이그레이션을 롤백합니다.

```shell
php artisan migrate:rollback --batch=3
```

실제로 마이그레이션을 실행하지 않고 마이그레이션에서 실행될 SQL 문을 확인하려면 `migrate:rollback` 명령에 `--pretend` 플래그를 제공할 수 있습니다.

```shell
php artisan migrate:rollback --pretend
```

`migrate:reset` 명령은 애플리케이션의 모든 마이그레이션을 롤백합니다.

```shell
php artisan migrate:reset
```

<a name="roll-back-migrate-using-a-single-command"></a>
#### 단일 명령으로 롤백 및 마이그레이션

`migrate:refresh` 명령은 모든 마이그레이션을 롤백한 다음 `migrate` 명령을 실행합니다. 이 명령은 효과적으로 전체 데이터베이스를 재생성합니다.

```shell
php artisan migrate:refresh

# 데이터베이스를 새로고침하고 모든 데이터베이스 시드를 실행합니다...
php artisan migrate:refresh --seed
```

`refresh` 명령에 `step` 옵션을 제공하여 제한된 수의 마이그레이션을 롤백하고 다시 마이그레이션할 수 있습니다. 예를 들어, 다음 명령은 마지막 5개의 마이그레이션을 롤백하고 다시 마이그레이션합니다.

```shell
php artisan migrate:refresh --step=5
```

<a name="drop-all-tables-migrate"></a>
#### 모든 테이블 삭제 후 마이그레이션

`migrate:fresh` 명령은 데이터베이스에서 모든 테이블을 삭제한 다음 `migrate` 명령을 실행합니다.

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

기본적으로 `migrate:fresh` 명령은 기본 데이터베이스 연결에서만 테이블을 삭제합니다. 그러나 `--database` 옵션을 사용하여 마이그레이션해야 하는 데이터베이스 연결을 지정할 수 있습니다. 데이터베이스 연결 이름은 애플리케이션의 `database` [설정 파일](/docs/{{version}}/configuration)에 정의된 연결에 해당해야 합니다.

```shell
php artisan migrate:fresh --database=admin
```

> [!WARNING]
> `migrate:fresh` 명령은 접두사에 관계없이 모든 데이터베이스 테이블을 삭제합니다. 이 명령은 다른 애플리케이션과 공유하는 데이터베이스에서 개발할 때 주의해서 사용해야 합니다.

<a name="tables"></a>
## 테이블

<a name="creating-tables"></a>
### 테이블 생성하기

새 데이터베이스 테이블을 생성하려면 `Schema` 파사드의 `create` 메서드를 사용합니다. `create` 메서드는 두 개의 인수를 받습니다: 첫 번째는 테이블의 이름이고, 두 번째는 새 테이블을 정의하는 데 사용할 수 있는 `Blueprint` 객체를 받는 클로저입니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email');
    $table->timestamps();
});
```

테이블을 생성할 때 스키마 빌더의 [컬럼 메서드](#creating-columns)를 사용하여 테이블의 컬럼을 정의할 수 있습니다.

<a name="determining-table-column-existence"></a>
#### 테이블 / 컬럼 존재 여부 확인

`hasTable`, `hasColumn` 메서드를 사용하여 테이블 또는 컬럼의 존재 여부를 확인할 수 있습니다.

```php
if (Schema::hasTable('users')) {
    // "users" 테이블이 존재합니다...
}

if (Schema::hasColumn('users', 'email')) {
    // "users" 테이블이 존재하고 "email" 컬럼이 있습니다...
}
```

<a name="database-connection-table-options"></a>
#### 데이터베이스 연결 및 테이블 옵션

애플리케이션의 기본 연결이 아닌 데이터베이스 연결에서 스키마 작업을 수행하려면 `connection` 메서드를 사용합니다.

```php
Schema::connection('sqlite')->create('users', function (Blueprint $table) {
    $table->id();
});
```

또한, 테이블 생성의 다른 측면을 정의하는 데 몇 가지 다른 속성과 메서드를 사용할 수 있습니다. `engine` 속성은 MySQL을 사용할 때 테이블의 스토리지 엔진을 지정하는 데 사용할 수 있습니다.

```php
Schema::create('users', function (Blueprint $table) {
    $table->engine = 'InnoDB';

    // ...
});
```

`charset`과 `collation` 속성은 MySQL을 사용할 때 생성된 테이블의 문자 집합과 정렬을 지정하는 데 사용할 수 있습니다.

```php
Schema::create('users', function (Blueprint $table) {
    $table->charset = 'utf8mb4';
    $table->collation = 'utf8mb4_unicode_ci';

    // ...
});
```

`temporary` 메서드는 테이블이 "임시"여야 함을 나타내는 데 사용할 수 있습니다. 임시 테이블은 현재 연결의 데이터베이스 세션에만 표시되며 연결이 닫히면 자동으로 삭제됩니다.

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->temporary();

    // ...
});
```

데이터베이스 테이블에 "주석"을 추가하려면 테이블 인스턴스에서 `comment` 메서드를 호출할 수 있습니다. 테이블 주석은 현재 MySQL과 Postgres에서만 지원됩니다.

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->comment('Business calculations');

    // ...
});
```

<a name="updating-tables"></a>
### 테이블 수정하기

`Schema` 파사드의 `table` 메서드를 사용하여 기존 테이블을 업데이트할 수 있습니다. `create` 메서드와 마찬가지로 `table` 메서드는 두 개의 인수를 받습니다: 테이블 이름과 테이블에 컬럼이나 인덱스를 추가하는 데 사용할 수 있는 `Blueprint` 인스턴스를 받는 클로저입니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="renaming-and-dropping-tables"></a>
### 테이블 이름 변경 / 삭제하기

기존 데이터베이스 테이블의 이름을 변경하려면 `rename` 메서드를 사용합니다.

```php
use Illuminate\Support\Facades\Schema;

Schema::rename($from, $to);
```

기존 테이블을 삭제하려면 `drop` 또는 `dropIfExists` 메서드를 사용할 수 있습니다.

```php
Schema::drop('users');

Schema::dropIfExists('users');
```

<a name="renaming-tables-with-foreign-keys"></a>
#### 외래 키가 있는 테이블 이름 변경

테이블 이름을 변경하기 전에, 마이그레이션 파일에서 테이블의 모든 외래 키 제약조건에 Laravel이 규칙 기반 이름을 할당하도록 두지 않고 명시적인 이름이 있는지 확인해야 합니다. 그렇지 않으면 외래 키 제약조건 이름이 이전 테이블 이름을 참조하게 됩니다.

<a name="columns"></a>
## 컬럼

<a name="creating-columns"></a>
### 컬럼 생성하기

`Schema` 파사드의 `table` 메서드를 사용하여 기존 테이블을 업데이트할 수 있습니다. `create` 메서드와 마찬가지로 `table` 메서드는 두 개의 인수를 받습니다: 테이블 이름과 테이블에 컬럼을 추가하는 데 사용할 수 있는 `Illuminate\Database\Schema\Blueprint` 인스턴스를 받는 클로저입니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="available-column-types"></a>
### 사용 가능한 컬럼 타입

스키마 빌더 블루프린트는 데이터베이스 테이블에 추가할 수 있는 다양한 유형의 컬럼에 해당하는 다양한 메서드를 제공합니다. 사용 가능한 각 메서드는 아래 표에 나열되어 있습니다.

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

    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<div class="collection-method-list" markdown="1">

[bigIncrements](#column-method-bigIncrements)
[bigInteger](#column-method-bigInteger)
[binary](#column-method-binary)
[boolean](#column-method-boolean)
[char](#column-method-char)
[dateTimeTz](#column-method-dateTimeTz)
[dateTime](#column-method-dateTime)
[date](#column-method-date)
[decimal](#column-method-decimal)
[double](#column-method-double)
[enum](#column-method-enum)
[float](#column-method-float)
[foreignId](#column-method-foreignId)
[foreignIdFor](#column-method-foreignIdFor)
[foreignUlid](#column-method-foreignUlid)
[foreignUuid](#column-method-foreignUuid)
[geometryCollection](#column-method-geometryCollection)
[geometry](#column-method-geometry)
[id](#column-method-id)
[increments](#column-method-increments)
[integer](#column-method-integer)
[ipAddress](#column-method-ipAddress)
[json](#column-method-json)
[jsonb](#column-method-jsonb)
[lineString](#column-method-lineString)
[longText](#column-method-longText)
[macAddress](#column-method-macAddress)
[mediumIncrements](#column-method-mediumIncrements)
[mediumInteger](#column-method-mediumInteger)
[mediumText](#column-method-mediumText)
[morphs](#column-method-morphs)
[multiLineString](#column-method-multiLineString)
[multiPoint](#column-method-multiPoint)
[multiPolygon](#column-method-multiPolygon)
[nullableMorphs](#column-method-nullableMorphs)
[nullableTimestamps](#column-method-nullableTimestamps)
[nullableUlidMorphs](#column-method-nullableUlidMorphs)
[nullableUuidMorphs](#column-method-nullableUuidMorphs)
[point](#column-method-point)
[polygon](#column-method-polygon)
[rememberToken](#column-method-rememberToken)
[set](#column-method-set)
[smallIncrements](#column-method-smallIncrements)
[smallInteger](#column-method-smallInteger)
[softDeletesTz](#column-method-softDeletesTz)
[softDeletes](#column-method-softDeletes)
[string](#column-method-string)
[text](#column-method-text)
[timeTz](#column-method-timeTz)
[time](#column-method-time)
[timestampTz](#column-method-timestampTz)
[timestamp](#column-method-timestamp)
[timestampsTz](#column-method-timestampsTz)
[timestamps](#column-method-timestamps)
[tinyIncrements](#column-method-tinyIncrements)
[tinyInteger](#column-method-tinyInteger)
[tinyText](#column-method-tinyText)
[unsignedBigInteger](#column-method-unsignedBigInteger)
[unsignedDecimal](#column-method-unsignedDecimal)
[unsignedInteger](#column-method-unsignedInteger)
[unsignedMediumInteger](#column-method-unsignedMediumInteger)
[unsignedSmallInteger](#column-method-unsignedSmallInteger)
[unsignedTinyInteger](#column-method-unsignedTinyInteger)
[ulidMorphs](#column-method-ulidMorphs)
[uuidMorphs](#column-method-uuidMorphs)
[ulid](#column-method-ulid)
[uuid](#column-method-uuid)
[year](#column-method-year)

</div>

<a name="column-method-bigIncrements"></a>
#### `bigIncrements()` {.collection-method .first-collection-method}

`bigIncrements` 메서드는 자동 증가하는 `UNSIGNED BIGINT` (기본 키) 동등 컬럼을 생성합니다.

```php
$table->bigIncrements('id');
```

<a name="column-method-bigInteger"></a>
#### `bigInteger()` {.collection-method}

`bigInteger` 메서드는 `BIGINT` 동등 컬럼을 생성합니다.

```php
$table->bigInteger('votes');
```

<a name="column-method-binary"></a>
#### `binary()` {.collection-method}

`binary` 메서드는 `BLOB` 동등 컬럼을 생성합니다.

```php
$table->binary('photo');
```

<a name="column-method-boolean"></a>
#### `boolean()` {.collection-method}

`boolean` 메서드는 `BOOLEAN` 동등 컬럼을 생성합니다.

```php
$table->boolean('confirmed');
```

<a name="column-method-char"></a>
#### `char()` {.collection-method}

`char` 메서드는 주어진 길이의 `CHAR` 동등 컬럼을 생성합니다.

```php
$table->char('name', 100);
```

<a name="column-method-dateTimeTz"></a>
#### `dateTimeTz()` {.collection-method}

`dateTimeTz` 메서드는 선택적인 정밀도(전체 자릿수)를 가진 `DATETIME` (시간대 포함) 동등 컬럼을 생성합니다.

```php
$table->dateTimeTz('created_at', $precision = 0);
```

<a name="column-method-dateTime"></a>
#### `dateTime()` {.collection-method}

`dateTime` 메서드는 선택적인 정밀도(전체 자릿수)를 가진 `DATETIME` 동등 컬럼을 생성합니다.

```php
$table->dateTime('created_at', $precision = 0);
```

<a name="column-method-date"></a>
#### `date()` {.collection-method}

`date` 메서드는 `DATE` 동등 컬럼을 생성합니다.

```php
$table->date('created_at');
```

<a name="column-method-decimal"></a>
#### `decimal()` {.collection-method}

`decimal` 메서드는 주어진 정밀도(총 자릿수)와 스케일(소수 자릿수)을 가진 `DECIMAL` 동등 컬럼을 생성합니다.

```php
$table->decimal('amount', $precision = 8, $scale = 2);
```

<a name="column-method-double"></a>
#### `double()` {.collection-method}

`double` 메서드는 주어진 정밀도(전체 자릿수)와 스케일(소수 자릿수)을 가진 `DOUBLE` 동등 컬럼을 생성합니다.

```php
$table->double('amount', 8, 2);
```

<a name="column-method-enum"></a>
#### `enum()` {.collection-method}

`enum` 메서드는 주어진 유효한 값으로 `ENUM` 동등 컬럼을 생성합니다.

```php
$table->enum('difficulty', ['easy', 'hard']);
```

<a name="column-method-float"></a>
#### `float()` {.collection-method}

`float` 메서드는 주어진 정밀도(전체 자릿수)와 스케일(소수 자릿수)을 가진 `FLOAT` 동등 컬럼을 생성합니다.

```php
$table->float('amount', 8, 2);
```

<a name="column-method-foreignId"></a>
#### `foreignId()` {.collection-method}

`foreignId` 메서드는 `UNSIGNED BIGINT` 동등 컬럼을 생성합니다.

```php
$table->foreignId('user_id');
```

<a name="column-method-foreignIdFor"></a>
#### `foreignIdFor()` {.collection-method}

`foreignIdFor` 메서드는 주어진 모델 클래스에 대한 `{column}_id` 동등 컬럼을 추가합니다. 컬럼 타입은 모델 키 타입에 따라 `UNSIGNED BIGINT`, `CHAR(36)` 또는 `CHAR(26)`이 됩니다.

```php
$table->foreignIdFor(User::class);
```

<a name="column-method-foreignUlid"></a>
#### `foreignUlid()` {.collection-method}

`foreignUlid` 메서드는 `ULID` 동등 컬럼을 생성합니다.

```php
$table->foreignUlid('user_id');
```

<a name="column-method-foreignUuid"></a>
#### `foreignUuid()` {.collection-method}

`foreignUuid` 메서드는 `UUID` 동등 컬럼을 생성합니다.

```php
$table->foreignUuid('user_id');
```

<a name="column-method-geometryCollection"></a>
#### `geometryCollection()` {.collection-method}

`geometryCollection` 메서드는 `GEOMETRYCOLLECTION` 동등 컬럼을 생성합니다.

```php
$table->geometryCollection('positions');
```

<a name="column-method-geometry"></a>
#### `geometry()` {.collection-method}

`geometry` 메서드는 `GEOMETRY` 동등 컬럼을 생성합니다.

```php
$table->geometry('positions');
```

<a name="column-method-id"></a>
#### `id()` {.collection-method}

`id` 메서드는 `bigIncrements` 메서드의 별칭입니다. 기본적으로 이 메서드는 `id` 컬럼을 생성합니다. 그러나 컬럼에 다른 이름을 할당하려면 컬럼 이름을 전달할 수 있습니다.

```php
$table->id();
```

<a name="column-method-increments"></a>
#### `increments()` {.collection-method}

`increments` 메서드는 기본 키로서 자동 증가하는 `UNSIGNED INTEGER` 동등 컬럼을 생성합니다.

```php
$table->increments('id');
```

<a name="column-method-integer"></a>
#### `integer()` {.collection-method}

`integer` 메서드는 `INTEGER` 동등 컬럼을 생성합니다.

```php
$table->integer('votes');
```

<a name="column-method-ipAddress"></a>
#### `ipAddress()` {.collection-method}

`ipAddress` 메서드는 `VARCHAR` 동등 컬럼을 생성합니다.

```php
$table->ipAddress('visitor');
```

Postgres를 사용할 때는 `INET` 컬럼이 생성됩니다.

<a name="column-method-json"></a>
#### `json()` {.collection-method}

`json` 메서드는 `JSON` 동등 컬럼을 생성합니다.

```php
$table->json('options');
```

<a name="column-method-jsonb"></a>
#### `jsonb()` {.collection-method}

`jsonb` 메서드는 `JSONB` 동등 컬럼을 생성합니다.

```php
$table->jsonb('options');
```

<a name="column-method-lineString"></a>
#### `lineString()` {.collection-method}

`lineString` 메서드는 `LINESTRING` 동등 컬럼을 생성합니다.

```php
$table->lineString('positions');
```

<a name="column-method-longText"></a>
#### `longText()` {.collection-method}

`longText` 메서드는 `LONGTEXT` 동등 컬럼을 생성합니다.

```php
$table->longText('description');
```

<a name="column-method-macAddress"></a>
#### `macAddress()` {.collection-method}

`macAddress` 메서드는 MAC 주소를 보관하기 위한 컬럼을 생성합니다. PostgreSQL과 같은 일부 데이터베이스 시스템에는 이 유형의 데이터에 대한 전용 컬럼 타입이 있습니다. 다른 데이터베이스 시스템은 문자열 동등 컬럼을 사용합니다.

```php
$table->macAddress('device');
```

<a name="column-method-mediumIncrements"></a>
#### `mediumIncrements()` {.collection-method}

`mediumIncrements` 메서드는 기본 키로서 자동 증가하는 `UNSIGNED MEDIUMINT` 동등 컬럼을 생성합니다.

```php
$table->mediumIncrements('id');
```

<a name="column-method-mediumInteger"></a>
#### `mediumInteger()` {.collection-method}

`mediumInteger` 메서드는 `MEDIUMINT` 동등 컬럼을 생성합니다.

```php
$table->mediumInteger('votes');
```

<a name="column-method-mediumText"></a>
#### `mediumText()` {.collection-method}

`mediumText` 메서드는 `MEDIUMTEXT` 동등 컬럼을 생성합니다.

```php
$table->mediumText('description');
```

<a name="column-method-morphs"></a>
#### `morphs()` {.collection-method}

`morphs` 메서드는 `{column}_id` 동등 컬럼과 `{column}_type` `VARCHAR` 동등 컬럼을 추가하는 편의 메서드입니다. `{column}_id`의 컬럼 타입은 모델 키 타입에 따라 `UNSIGNED BIGINT`, `CHAR(36)` 또는 `CHAR(26)`이 됩니다.

이 메서드는 다형성 [Eloquent 관계](/docs/{{version}}/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용됩니다. 다음 예제에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```php
$table->morphs('taggable');
```

<a name="column-method-multiLineString"></a>
#### `multiLineString()` {.collection-method}

`multiLineString` 메서드는 `MULTILINESTRING` 동등 컬럼을 생성합니다.

```php
$table->multiLineString('positions');
```

<a name="column-method-multiPoint"></a>
#### `multiPoint()` {.collection-method}

`multiPoint` 메서드는 `MULTIPOINT` 동등 컬럼을 생성합니다.

```php
$table->multiPoint('positions');
```

<a name="column-method-multiPolygon"></a>
#### `multiPolygon()` {.collection-method}

`multiPolygon` 메서드는 `MULTIPOLYGON` 동등 컬럼을 생성합니다.

```php
$table->multiPolygon('positions');
```

<a name="column-method-nullableMorphs"></a>
#### `nullableMorphs()` {.collection-method}

이 메서드는 [morphs](#column-method-morphs) 메서드와 유사하지만, 생성된 컬럼은 "nullable"이 됩니다.

```php
$table->nullableMorphs('taggable');
```

<a name="column-method-nullableTimestamps"></a>
#### `nullableTimestamps()` {.collection-method}

`nullableTimestamps` 메서드는 [timestamps](#column-method-timestamps) 메서드의 별칭입니다.

```php
$table->nullableTimestamps(0);
```

<a name="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()` {.collection-method}

이 메서드는 [ulidMorphs](#column-method-ulidMorphs) 메서드와 유사하지만, 생성된 컬럼은 "nullable"이 됩니다.

```php
$table->nullableUlidMorphs('taggable');
```

<a name="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()` {.collection-method}

이 메서드는 [uuidMorphs](#column-method-uuidMorphs) 메서드와 유사하지만, 생성된 컬럼은 "nullable"이 됩니다.

```php
$table->nullableUuidMorphs('taggable');
```

<a name="column-method-point"></a>
#### `point()` {.collection-method}

`point` 메서드는 `POINT` 동등 컬럼을 생성합니다.

```php
$table->point('position');
```

<a name="column-method-polygon"></a>
#### `polygon()` {.collection-method}

`polygon` 메서드는 `POLYGON` 동등 컬럼을 생성합니다.

```php
$table->polygon('position');
```

<a name="column-method-rememberToken"></a>
#### `rememberToken()` {.collection-method}

`rememberToken` 메서드는 현재 "remember me" [인증 토큰](/docs/{{version}}/authentication#remembering-users)을 저장하기 위한 nullable `VARCHAR(100)` 동등 컬럼을 생성합니다.

```php
$table->rememberToken();
```

<a name="column-method-set"></a>
#### `set()` {.collection-method}

`set` 메서드는 주어진 유효한 값 목록으로 `SET` 동등 컬럼을 생성합니다.

```php
$table->set('flavors', ['strawberry', 'vanilla']);
```

<a name="column-method-smallIncrements"></a>
#### `smallIncrements()` {.collection-method}

`smallIncrements` 메서드는 기본 키로서 자동 증가하는 `UNSIGNED SMALLINT` 동등 컬럼을 생성합니다.

```php
$table->smallIncrements('id');
```

<a name="column-method-smallInteger"></a>
#### `smallInteger()` {.collection-method}

`smallInteger` 메서드는 `SMALLINT` 동등 컬럼을 생성합니다.

```php
$table->smallInteger('votes');
```

<a name="column-method-softDeletesTz"></a>
#### `softDeletesTz()` {.collection-method}

`softDeletesTz` 메서드는 선택적인 정밀도(전체 자릿수)를 가진 nullable `deleted_at` `TIMESTAMP` (시간대 포함) 동등 컬럼을 추가합니다. 이 컬럼은 Eloquent의 "소프트 삭제(soft delete)" 기능에 필요한 `deleted_at` 타임스탬프를 저장하기 위한 것입니다.

```php
$table->softDeletesTz($column = 'deleted_at', $precision = 0);
```

<a name="column-method-softDeletes"></a>
#### `softDeletes()` {.collection-method}

`softDeletes` 메서드는 선택적인 정밀도(전체 자릿수)를 가진 nullable `deleted_at` `TIMESTAMP` 동등 컬럼을 추가합니다. 이 컬럼은 Eloquent의 "소프트 삭제(soft delete)" 기능에 필요한 `deleted_at` 타임스탬프를 저장하기 위한 것입니다.

```php
$table->softDeletes($column = 'deleted_at', $precision = 0);
```

<a name="column-method-string"></a>
#### `string()` {.collection-method}

`string` 메서드는 주어진 길이의 `VARCHAR` 동등 컬럼을 생성합니다.

```php
$table->string('name', 100);
```

<a name="column-method-text"></a>
#### `text()` {.collection-method}

`text` 메서드는 `TEXT` 동등 컬럼을 생성합니다.

```php
$table->text('description');
```

<a name="column-method-timeTz"></a>
#### `timeTz()` {.collection-method}

`timeTz` 메서드는 선택적인 정밀도(전체 자릿수)를 가진 `TIME` (시간대 포함) 동등 컬럼을 생성합니다.

```php
$table->timeTz('sunrise', $precision = 0);
```

<a name="column-method-time"></a>
#### `time()` {.collection-method}

`time` 메서드는 선택적인 정밀도(전체 자릿수)를 가진 `TIME` 동등 컬럼을 생성합니다.

```php
$table->time('sunrise', $precision = 0);
```

<a name="column-method-timestampTz"></a>
#### `timestampTz()` {.collection-method}

`timestampTz` 메서드는 선택적인 정밀도(전체 자릿수)를 가진 `TIMESTAMP` (시간대 포함) 동등 컬럼을 생성합니다.

```php
$table->timestampTz('added_at', $precision = 0);
```

<a name="column-method-timestamp"></a>
#### `timestamp()` {.collection-method}

`timestamp` 메서드는 선택적인 정밀도(전체 자릿수)를 가진 `TIMESTAMP` 동등 컬럼을 생성합니다.

```php
$table->timestamp('added_at', $precision = 0);
```

<a name="column-method-timestampsTz"></a>
#### `timestampsTz()` {.collection-method}

`timestampsTz` 메서드는 선택적인 정밀도(전체 자릿수)를 가진 `created_at`과 `updated_at` `TIMESTAMP` (시간대 포함) 동등 컬럼을 생성합니다.

```php
$table->timestampsTz($precision = 0);
```

<a name="column-method-timestamps"></a>
#### `timestamps()` {.collection-method}

`timestamps` 메서드는 선택적인 정밀도(전체 자릿수)를 가진 `created_at`과 `updated_at` `TIMESTAMP` 동등 컬럼을 생성합니다.

```php
$table->timestamps($precision = 0);
```

<a name="column-method-tinyIncrements"></a>
#### `tinyIncrements()` {.collection-method}

`tinyIncrements` 메서드는 기본 키로서 자동 증가하는 `UNSIGNED TINYINT` 동등 컬럼을 생성합니다.

```php
$table->tinyIncrements('id');
```

<a name="column-method-tinyInteger"></a>
#### `tinyInteger()` {.collection-method}

`tinyInteger` 메서드는 `TINYINT` 동등 컬럼을 생성합니다.

```php
$table->tinyInteger('votes');
```

<a name="column-method-tinyText"></a>
#### `tinyText()` {.collection-method}

`tinyText` 메서드는 `TINYTEXT` 동등 컬럼을 생성합니다.

```php
$table->tinyText('notes');
```

<a name="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()` {.collection-method}

`unsignedBigInteger` 메서드는 `UNSIGNED BIGINT` 동등 컬럼을 생성합니다.

```php
$table->unsignedBigInteger('votes');
```

<a name="column-method-unsignedDecimal"></a>
#### `unsignedDecimal()` {.collection-method}

`unsignedDecimal` 메서드는 선택적인 정밀도(전체 자릿수)와 스케일(소수 자릿수)을 가진 `UNSIGNED DECIMAL` 동등 컬럼을 생성합니다.

```php
$table->unsignedDecimal('amount', $precision = 8, $scale = 2);
```

<a name="column-method-unsignedInteger"></a>
#### `unsignedInteger()` {.collection-method}

`unsignedInteger` 메서드는 `UNSIGNED INTEGER` 동등 컬럼을 생성합니다.

```php
$table->unsignedInteger('votes');
```

<a name="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()` {.collection-method}

`unsignedMediumInteger` 메서드는 `UNSIGNED MEDIUMINT` 동등 컬럼을 생성합니다.

```php
$table->unsignedMediumInteger('votes');
```

<a name="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()` {.collection-method}

`unsignedSmallInteger` 메서드는 `UNSIGNED SMALLINT` 동등 컬럼을 생성합니다.

```php
$table->unsignedSmallInteger('votes');
```

<a name="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()` {.collection-method}

`unsignedTinyInteger` 메서드는 `UNSIGNED TINYINT` 동등 컬럼을 생성합니다.

```php
$table->unsignedTinyInteger('votes');
```

<a name="column-method-ulidMorphs"></a>
#### `ulidMorphs()` {.collection-method}

`ulidMorphs` 메서드는 `{column}_id` `CHAR(26)` 동등 컬럼과 `{column}_type` `VARCHAR` 동등 컬럼을 추가하는 편의 메서드입니다.

이 메서드는 ULID 식별자를 사용하는 다형성 [Eloquent 관계](/docs/{{version}}/eloquent-relationships)에 필요한 컬럼을 정의할 때 사용됩니다. 다음 예제에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```php
$table->ulidMorphs('taggable');
```

<a name="column-method-uuidMorphs"></a>
#### `uuidMorphs()` {.collection-method}

`uuidMorphs` 메서드는 `{column}_id` `CHAR(36)` 동등 컬럼과 `{column}_type` `VARCHAR` 동등 컬럼을 추가하는 편의 메서드입니다.

이 메서드는 UUID 식별자를 사용하는 [다형성 Eloquent 관계](/docs/{{version}}/eloquent-relationships#polymorphic-relationships)에 필요한 컬럼을 정의할 때 사용됩니다. 다음 예제에서는 `taggable_id`와 `taggable_type` 컬럼이 생성됩니다.

```php
$table->uuidMorphs('taggable');
```

<a name="column-method-ulid"></a>
#### `ulid()` {.collection-method}

`ulid` 메서드는 `ULID` 동등 컬럼을 생성합니다.

```php
$table->ulid('id');
```

<a name="column-method-uuid"></a>
#### `uuid()` {.collection-method}

`uuid` 메서드는 `UUID` 동등 컬럼을 생성합니다.

```php
$table->uuid('id');
```

<a name="column-method-year"></a>
#### `year()` {.collection-method}

`year` 메서드는 `YEAR` 동등 컬럼을 생성합니다.

```php
$table->year('birth_year');
```

<a name="column-modifiers"></a>
### 컬럼 수정자

위에 나열된 컬럼 타입 외에도 데이터베이스 테이블에 컬럼을 추가할 때 사용할 수 있는 여러 컬럼 "수정자"가 있습니다. 예를 들어, 컬럼을 "nullable"로 만들려면 `nullable` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable();
});
```

다음 표에는 사용 가능한 모든 컬럼 수정자가 포함되어 있습니다. 이 목록에는 [인덱스 수정자](#creating-indexes)는 포함되지 않습니다.

수정자  |  설명
--------  |  -----------
`->after('column')`  |  컬럼을 다른 컬럼 "뒤에" 배치합니다 (MySQL).
`->autoIncrement()`  |  INTEGER 컬럼을 자동 증가(기본 키)로 설정합니다.
`->charset('utf8mb4')`  |  컬럼에 문자 집합을 지정합니다 (MySQL).
`->collation('utf8mb4_unicode_ci')`  |  컬럼에 정렬을 지정합니다 (MySQL/PostgreSQL/SQL Server).
`->comment('my comment')`  |  컬럼에 주석을 추가합니다 (MySQL/PostgreSQL).
`->default($value)`  |  컬럼에 "기본" 값을 지정합니다.
`->first()`  |  컬럼을 테이블에서 "첫 번째"로 배치합니다 (MySQL).
`->from($integer)`  |  자동 증가 필드의 시작 값을 설정합니다 (MySQL / PostgreSQL).
`->invisible()`  |  컬럼을 `SELECT *` 쿼리에서 "보이지 않게" 만듭니다 (MySQL).
`->nullable($value = true)`  |  NULL 값을 컬럼에 삽입할 수 있도록 허용합니다.
`->storedAs($expression)`  |  저장된 생성 컬럼을 만듭니다 (MySQL / PostgreSQL).
`->unsigned()`  |  INTEGER 컬럼을 UNSIGNED로 설정합니다 (MySQL).
`->useCurrent()`  |  TIMESTAMP 컬럼이 기본값으로 CURRENT_TIMESTAMP를 사용하도록 설정합니다.
`->useCurrentOnUpdate()`  |  레코드가 업데이트될 때 TIMESTAMP 컬럼이 CURRENT_TIMESTAMP를 사용하도록 설정합니다 (MySQL).
`->virtualAs($expression)`  |  가상 생성 컬럼을 만듭니다 (MySQL / PostgreSQL / SQLite).
`->generatedAs($expression)`  |  지정된 시퀀스 옵션으로 아이덴티티 컬럼을 만듭니다 (PostgreSQL).
`->always()`  |  아이덴티티 컬럼에 대해 입력보다 시퀀스 값의 우선순위를 정의합니다 (PostgreSQL).
`->isGeometry()`  |  공간 컬럼 타입을 `geometry`로 설정합니다 - 기본 타입은 `geography`입니다 (PostgreSQL).

<a name="default-expressions"></a>
#### 기본 표현식

`default` 수정자는 값 또는 `Illuminate\Database\Query\Expression` 인스턴스를 받습니다. `Expression` 인스턴스를 사용하면 Laravel이 값을 따옴표로 감싸지 않고 데이터베이스별 함수를 사용할 수 있습니다. 이것이 특히 유용한 경우 중 하나는 JSON 컬럼에 기본값을 할당해야 할 때입니다.

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * 마이그레이션을 실행합니다.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->json('movies')->default(new Expression('(JSON_ARRAY())'));
            $table->timestamps();
        });
    }
};
```

> [!WARNING]
> 기본 표현식 지원은 데이터베이스 드라이버, 데이터베이스 버전 및 필드 타입에 따라 다릅니다. 데이터베이스 문서를 참조하세요.

<a name="column-order"></a>
#### 컬럼 순서

MariaDB 또는 MySQL 데이터베이스를 사용할 때, 스키마에서 기존 컬럼 뒤에 컬럼을 추가하기 위해 `after` 메서드를 사용할 수 있습니다.

```php
$table->after('password', function (Blueprint $table) {
    $table->string('address_line1');
    $table->string('address_line2');
    $table->string('city');
});
```

<a name="modifying-columns"></a>
### 컬럼 수정하기

`change` 메서드를 사용하면 기존 컬럼의 타입과 속성을 수정할 수 있습니다. 예를 들어, `string` 컬럼의 크기를 늘리고 싶을 수 있습니다. `change` 메서드의 동작을 확인하기 위해 `name` 컬럼의 크기를 25에서 50으로 늘려 보겠습니다. 이를 수행하려면 컬럼의 새 상태를 정의한 다음 `change` 메서드를 호출하면 됩니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->change();
});
```

컬럼을 수정할 때 컬럼 정의에 유지하려는 모든 수정자를 명시적으로 포함해야 합니다. 누락된 속성은 삭제됩니다. 예를 들어, `unsigned`, `default`, `comment` 속성을 유지하려면 컬럼을 변경할 때 각 수정자를 명시적으로 호출해야 합니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
});
```

`change` 메서드는 컬럼의 인덱스를 변경하지 않습니다. 따라서 컬럼을 수정할 때 인덱스 수정자를 사용하여 인덱스를 명시적으로 추가하거나 삭제할 수 있습니다.

```php
// 인덱스를 추가합니다...
$table->bigIncrements('id')->primary()->change();

// 인덱스를 삭제합니다...
$table->char('postal_code', 10)->unique(false)->change();
```

<a name="modifying-columns-on-sqlite"></a>
#### SQLite에서 컬럼 수정하기

애플리케이션이 SQLite 데이터베이스를 사용하는 경우, 컬럼을 수정하기 전에 Composer 패키지 관리자를 사용하여 `doctrine/dbal` 패키지를 설치해야 합니다. Doctrine DBAL 라이브러리는 컬럼의 현재 상태를 확인하고 요청된 변경 사항을 적용하는 데 필요한 SQL 쿼리를 생성하는 데 사용됩니다.

    composer require doctrine/dbal

`timestamp` 메서드를 사용하여 생성된 컬럼을 수정할 계획이라면, 애플리케이션의 `config/database.php` 설정 파일에 다음 설정도 추가해야 합니다.

```php
use Illuminate\Database\DBAL\TimestampType;

'dbal' => [
    'types' => [
        'timestamp' => TimestampType::class,
    ],
],
```

> [!WARNING]
> `doctrine/dbal` 패키지를 사용할 때 다음 컬럼 유형을 수정할 수 있습니다: `bigInteger`, `binary`, `boolean`, `char`, `date`, `dateTime`, `dateTimeTz`, `decimal`, `double`, `integer`, `json`, `longText`, `mediumText`, `smallInteger`, `string`, `text`, `time`, `tinyText`, `unsignedBigInteger`, `unsignedInteger`, `unsignedSmallInteger`, `ulid`, `uuid`.

<a name="renaming-columns"></a>
### 컬럼 이름 변경하기

컬럼 이름을 변경하려면 스키마 빌더가 제공하는 `renameColumn` 메서드를 사용할 수 있습니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

<a name="renaming-columns-on-legacy-databases"></a>
#### 레거시 데이터베이스에서 컬럼 이름 변경하기

다음 릴리스보다 이전 버전의 데이터베이스를 사용하는 경우, 컬럼 이름을 변경하기 전에 Composer 패키지 관리자를 통해 `doctrine/dbal` 라이브러리를 설치해야 합니다.

<div class="content-list" markdown="1">

- MySQL < `8.0.3`
- MariaDB < `10.5.2`
- SQLite < `3.25.0`

</div>

<a name="dropping-columns"></a>
### 컬럼 삭제하기

컬럼을 삭제하려면 스키마 빌더의 `dropColumn` 메서드를 사용할 수 있습니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('votes');
});
```

컬럼 이름의 배열을 `dropColumn` 메서드에 전달하여 테이블에서 여러 컬럼을 삭제할 수 있습니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['votes', 'avatar', 'location']);
});
```

<a name="dropping-columns-on-legacy-databases"></a>
#### 레거시 데이터베이스에서 컬럼 삭제하기

`3.35.0` 이전 버전의 SQLite를 사용하는 경우, `dropColumn` 메서드를 사용하기 전에 Composer 패키지 관리자를 통해 `doctrine/dbal` 패키지를 설치해야 합니다. 이 패키지를 사용할 때 단일 마이그레이션 내에서 여러 컬럼을 삭제하거나 수정하는 것은 지원되지 않습니다.

<a name="available-command-aliases"></a>
#### 사용 가능한 명령 별칭

Laravel은 일반적인 유형의 컬럼 삭제와 관련된 여러 편리한 메서드를 제공합니다. 각 메서드는 아래 표에 설명되어 있습니다.

<div class="overflow-auto">

| 명령                                | 설명                                                  |
| ----------------------------------- | ----------------------------------------------------- |
| `$table->dropMorphs('morphable');`  | `morphable_id`와 `morphable_type` 컬럼을 삭제합니다.  |
| `$table->dropRememberToken();`      | `remember_token` 컬럼을 삭제합니다.                   |
| `$table->dropSoftDeletes();`        | `deleted_at` 컬럼을 삭제합니다.                       |
| `$table->dropSoftDeletesTz();`      | `dropSoftDeletes()` 메서드의 별칭입니다.              |
| `$table->dropTimestamps();`         | `created_at`과 `updated_at` 컬럼을 삭제합니다.        |
| `$table->dropTimestampsTz();`       | `dropTimestamps()` 메서드의 별칭입니다.               |

</div>

<a name="indexes"></a>
## 인덱스

<a name="creating-indexes"></a>
### 인덱스 생성하기

Laravel 스키마 빌더는 여러 유형의 인덱스를 지원합니다. 다음 예제는 새 `email` 컬럼을 만들고 해당 값이 고유해야 함을 지정합니다. 인덱스를 생성하기 위해 컬럼 정의에 `unique` 메서드를 체인할 수 있습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->unique();
});
```

또는 컬럼을 정의한 후 인덱스를 생성할 수 있습니다. 이렇게 하려면 스키마 빌더 블루프린트에서 `unique` 메서드를 호출해야 합니다. 이 메서드는 유니크 인덱스를 받아야 하는 컬럼 이름을 받습니다.

```php
$table->unique('email');
```

인덱스 메서드에 컬럼 배열을 전달하여 복합(또는 컴포지트) 인덱스를 생성할 수도 있습니다.

```php
$table->index(['account_id', 'created_at']);
```

인덱스를 생성할 때 Laravel은 테이블, 컬럼 이름, 인덱스 유형을 기반으로 자동으로 인덱스 이름을 생성하지만, 메서드에 두 번째 인수를 전달하여 인덱스 이름을 직접 지정할 수 있습니다.

```php
$table->unique('email', 'unique_email');
```

<a name="available-index-types"></a>
#### 사용 가능한 인덱스 유형

Laravel의 스키마 빌더 블루프린트 클래스는 Laravel이 지원하는 각 인덱스 유형을 생성하기 위한 메서드를 제공합니다. 각 인덱스 메서드는 인덱스 이름을 지정하기 위한 선택적 두 번째 인수를 받습니다. 생략하면 이름은 테이블과 컬럼 이름, 인덱스 유형에서 파생됩니다. 사용 가능한 각 인덱스 메서드는 아래 표에 설명되어 있습니다.

<div class="overflow-auto">

| 명령                                             | 설명                                                           |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `$table->primary('id');`                         | 기본 키를 추가합니다.                                          |
| `$table->primary(['id', 'parent_id']);`          | 복합 키를 추가합니다.                                          |
| `$table->unique('email');`                       | 유니크 인덱스를 추가합니다.                                    |
| `$table->index('state');`                        | 인덱스를 추가합니다.                                           |
| `$table->fullText('body');`                      | 전문 검색 인덱스를 추가합니다 (MariaDB / MySQL / PostgreSQL).  |
| `$table->fullText('body')->language('english');` | 지정된 언어의 전문 검색 인덱스를 추가합니다 (PostgreSQL).      |
| `$table->spatialIndex('location');`              | 공간 인덱스를 추가합니다 (SQLite 제외).                        |

</div>

<a name="index-lengths-mysql-mariadb"></a>
#### 인덱스 길이와 MySQL / MariaDB

기본적으로 Laravel은 `utf8mb4` 문자 집합을 사용합니다. MySQL 5.7.7 릴리스 이전 버전이나 MariaDB 10.2.2 릴리스 이전 버전을 실행하는 경우, MySQL이 인덱스를 생성할 수 있도록 마이그레이션에서 생성되는 기본 문자열 길이를 수동으로 설정해야 할 수 있습니다. `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `Schema::defaultStringLength` 메서드를 호출하여 기본 문자열 길이를 설정할 수 있습니다.

    use Illuminate\Support\Facades\Schema;

    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
    }

또는 데이터베이스의 `innodb_large_prefix` 옵션을 활성화할 수 있습니다. 이 옵션을 올바르게 활성화하는 방법에 대해서는 데이터베이스의 문서를 참조하세요.

<a name="renaming-indexes"></a>
### 인덱스 이름 변경하기

인덱스 이름을 변경하려면 스키마 빌더 블루프린트가 제공하는 `renameIndex` 메서드를 사용할 수 있습니다. 이 메서드는 현재 인덱스 이름을 첫 번째 인수로, 원하는 이름을 두 번째 인수로 받습니다.

```php
$table->renameIndex('from', 'to')
```

> [!WARNING]
> 애플리케이션이 SQLite 데이터베이스를 사용하는 경우, `renameIndex` 메서드를 사용하기 전에 Composer 패키지 관리자를 통해 `doctrine/dbal` 패키지를 설치해야 합니다.

<a name="dropping-indexes"></a>
### 인덱스 삭제하기

인덱스를 삭제하려면 인덱스 이름을 지정해야 합니다. 기본적으로 Laravel은 테이블 이름, 인덱스된 컬럼 이름, 인덱스 유형을 기반으로 자동으로 인덱스 이름을 할당합니다. 다음은 몇 가지 예입니다.

<div class="overflow-auto">

| 명령                                                     | 설명                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `$table->dropPrimary('users_id_primary');`               | "users" 테이블에서 기본 키를 삭제합니다.                    |
| `$table->dropUnique('users_email_unique');`              | "users" 테이블에서 유니크 인덱스를 삭제합니다.              |
| `$table->dropIndex('geo_state_index');`                  | "geo" 테이블에서 기본 인덱스를 삭제합니다.                  |
| `$table->dropFullText('posts_body_fulltext');`           | "posts" 테이블에서 전문 검색 인덱스를 삭제합니다.           |
| `$table->dropSpatialIndex('geo_location_spatialindex');` | "geo" 테이블에서 공간 인덱스를 삭제합니다 (SQLite 제외).    |

</div>

인덱스를 삭제하는 메서드에 컬럼 배열을 전달하면 테이블 이름, 컬럼, 인덱스 유형을 기반으로 규칙적인 인덱스 이름이 생성됩니다.

```php
Schema::table('geo', function (Blueprint $table) {
    $table->dropIndex(['state']); // 'geo_state_index' 인덱스를 삭제합니다
});
```

<a name="foreign-key-constraints"></a>
### 외래 키 제약조건

Laravel은 데이터베이스 수준에서 참조 무결성을 강제하는 데 사용되는 외래 키 제약조건 생성도 지원합니다. 예를 들어, `users` 테이블의 `id` 컬럼을 참조하는 `posts` 테이블에 `user_id` 컬럼을 정의해 보겠습니다.

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('posts', function (Blueprint $table) {
    $table->unsignedBigInteger('user_id');

    $table->foreign('user_id')->references('id')->on('users');
});
```

이 구문은 다소 장황하기 때문에 Laravel은 더 나은 개발자 경험을 제공하기 위해 규칙을 사용하는 추가적이고 간결한 메서드를 제공합니다. `foreignId` 메서드를 사용하여 컬럼을 생성할 때 위의 예는 다음과 같이 다시 작성할 수 있습니다.

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained();
});
```

`foreignId` 메서드는 `UNSIGNED BIGINT` 동등 컬럼을 생성하고, `constrained` 메서드는 규칙을 사용하여 참조되는 테이블과 컬럼을 결정합니다. 테이블 이름이 Laravel의 규칙과 일치하지 않는 경우 `constrained` 메서드에 수동으로 제공할 수 있습니다. 또한 생성된 인덱스에 할당해야 하는 이름도 지정할 수 있습니다.

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained(
        table: 'users', indexName: 'posts_user_id'
    );
});
```

제약조건의 "on delete" 및 "on update" 속성에 대해 원하는 동작을 지정할 수도 있습니다.

```php
$table->foreignId('user_id')
    ->constrained()
    ->onUpdate('cascade')
    ->onDelete('cascade');
```

이러한 동작에 대한 대안적이고 표현적인 구문도 제공됩니다.

<div class="overflow-auto">

| 메서드                        | 설명                                                      |
| ----------------------------- | --------------------------------------------------------- |
| `$table->cascadeOnUpdate();`  | 업데이트가 연쇄적으로 적용되어야 합니다.                  |
| `$table->restrictOnUpdate();` | 업데이트가 제한되어야 합니다.                             |
| `$table->nullOnUpdate();`     | 업데이트 시 외래 키 값을 null로 설정해야 합니다.          |
| `$table->noActionOnUpdate();` | 업데이트 시 아무 동작도 하지 않습니다.                    |
| `$table->cascadeOnDelete();`  | 삭제가 연쇄적으로 적용되어야 합니다.                      |
| `$table->restrictOnDelete();` | 삭제가 제한되어야 합니다.                                 |
| `$table->nullOnDelete();`     | 삭제 시 외래 키 값을 null로 설정해야 합니다.              |
| `$table->noActionOnDelete();` | 자식 레코드가 존재하면 삭제를 방지합니다.                 |

</div>

추가 [컬럼 수정자](#column-modifiers)는 `constrained` 메서드 전에 호출되어야 합니다.

```php
$table->foreignId('user_id')
    ->nullable()
    ->constrained();
```

<a name="dropping-foreign-keys"></a>
#### 외래 키 삭제

외래 키를 삭제하려면 삭제할 외래 키 제약조건의 이름을 인수로 전달하여 `dropForeign` 메서드를 사용할 수 있습니다. 외래 키 제약조건은 인덱스와 동일한 명명 규칙을 사용합니다. 즉, 외래 키 제약조건 이름은 테이블 이름과 제약조건의 컬럼을 기반으로 하며 "\_foreign" 접미사가 붙습니다.

```php
$table->dropForeign('posts_user_id_foreign');
```

또는 외래 키를 보유하는 컬럼 이름이 포함된 배열을 `dropForeign` 메서드에 전달할 수 있습니다. 배열은 Laravel의 제약조건 명명 규칙을 사용하여 외래 키 제약조건 이름으로 변환됩니다.

```php
$table->dropForeign(['user_id']);
```

<a name="toggling-foreign-key-constraints"></a>
#### 외래 키 제약조건 토글

다음 메서드를 사용하여 마이그레이션 내에서 외래 키 제약조건을 활성화하거나 비활성화할 수 있습니다.

```php
Schema::enableForeignKeyConstraints();

Schema::disableForeignKeyConstraints();

Schema::withoutForeignKeyConstraints(function () {
    // 이 클로저 내에서는 제약조건이 비활성화됩니다...
});
```

> [!WARNING]
> SQLite는 기본적으로 외래 키 제약조건을 비활성화합니다. SQLite를 사용할 때 마이그레이션에서 외래 키를 생성하기 전에 데이터베이스 설정에서 [외래 키 지원을 활성화](/docs/{{version}}/database#configuration)해야 합니다.

<a name="events"></a>
## 이벤트

편의를 위해 각 마이그레이션 작업은 [이벤트](/docs/{{version}}/events)를 발생시킵니다. 다음 모든 이벤트는 기본 `Illuminate\Database\Events\MigrationEvent` 클래스를 확장합니다.

<div class="overflow-auto">

| 클래스                                           | 설명                                                         |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `Illuminate\Database\Events\MigrationsStarted`   | 마이그레이션 배치가 곧 실행됩니다.                           |
| `Illuminate\Database\Events\MigrationsEnded`     | 마이그레이션 배치 실행이 완료되었습니다.                     |
| `Illuminate\Database\Events\MigrationStarted`    | 단일 마이그레이션이 곧 실행됩니다.                           |
| `Illuminate\Database\Events\MigrationEnded`      | 단일 마이그레이션 실행이 완료되었습니다.                     |
| `Illuminate\Database\Events\NoPendingMigrations` | 마이그레이션 명령이 보류 중인 마이그레이션을 찾지 못했습니다.|
| `Illuminate\Database\Events\SchemaDumped`        | 데이터베이스 스키마 덤프가 완료되었습니다.                   |
| `Illuminate\Database\Events\SchemaLoaded`        | 기존 데이터베이스 스키마 덤프가 로드되었습니다.              |

</div>

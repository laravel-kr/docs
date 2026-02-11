# 업그레이드 가이드

- [10.x에서 11.0으로 업그레이드](#upgrade-11.0)

<a name="high-impact-changes"></a>
## 영향도 높음

<div class="content-list" markdown="1">

- [의존성 업데이트](#updating-dependencies)
- [애플리케이션 구조](#application-structure)
- [부동 소수점 타입](#floating-point-types)
- [컬럼 수정](#modifying-columns)
- [SQLite 최소 버전](#sqlite-minimum-version)
- [Sanctum 업데이트](#updating-sanctum)

</div>

<a name="medium-impact-changes"></a>
## 영향도 중간

<div class="content-list" markdown="1">

- [Carbon 3](#carbon-3)
- [비밀번호 리해싱](#password-rehashing)
- [초 단위 속도 제한](#per-second-rate-limiting)
- [Spatie Once 패키지](#spatie-once-package)

</div>

<a name="low-impact-changes"></a>
## 영향도 낮음

<div class="content-list" markdown="1">

- [Doctrine DBAL 제거](#doctrine-dbal-removal)
- [Eloquent 모델 `casts` 메소드](#eloquent-model-casts-method)
- [공간 타입](#spatial-types)
- [`Enumerable` Contract](#the-enumerable-contract)
- [`UserProvider` Contract](#the-user-provider-contract)
- [`Authenticatable` Contract](#the-authenticatable-contract)

</div>

<a name="upgrade-11.0"></a>
## 10.x에서 11.0으로 업그레이드

<a name="estimated-upgrade-time-??-minutes"></a>
#### 예상 업그레이드 시간: 15분

> [!NOTE]  
> 가능한 모든 주요 변경 사항을 문서화하려고 노력하고 있습니다. 일부 주요 변경 사항은 프레임워크의 잘 사용되지 않는 부분에 있기 때문에 이러한 변경 사항 중 일부만 실제로 애플리케이션에 영향을 줄 수 있습니다. 시간을 절약하고 싶으신가요? [Laravel Shift](https://laravelshift.com/)를 사용하여 애플리케이션 업그레이드를 자동화할 수 있습니다.

<a name="updating-dependencies"></a>
### 의존성 업데이트

**영향 가능성: 높음**

#### PHP 8.2.0 필요

Laravel은 이제 PHP 8.2.0 이상을 필요로 합니다.

#### curl 7.34.0 필요

Laravel의 HTTP 클라이언트는 이제 curl 7.34.0 이상을 필요로 합니다.

#### Composer 의존성

애플리케이션의 `composer.json` 파일에서 다음 의존성을 업데이트해야 합니다.

<div class="content-list" markdown="1">

- `laravel/framework`를 `^11.0`으로
- `nunomaduro/collision`을 `^8.1`으로
- `laravel/breeze`를 `^2.0`으로 (설치된 경우)
- `laravel/cashier`를 `^15.0`으로 (설치된 경우)
- `laravel/dusk`를 `^8.0`으로 (설치된 경우)
- `laravel/jetstream`을 `^5.0`으로 (설치된 경우)
- `laravel/octane`을 `^2.3`으로 (설치된 경우)
- `laravel/passport`를 `^12.0`으로 (설치된 경우)
- `laravel/sanctum`을 `^4.0`으로 (설치된 경우)
- `laravel/scout`를 `^10.0`으로 (설치된 경우)
- `laravel/spark-stripe`를 `^5.0`으로 (설치된 경우)
- `laravel/telescope`을 `^5.0`으로 (설치된 경우)
- `livewire/livewire`를 `^3.4`로 (설치된 경우)
- `inertiajs/inertia-laravel`을 `^1.0`으로 (설치된 경우)

</div>

애플리케이션에서 Laravel Cashier Stripe, Passport, Sanctum, Spark Stripe 또는 Telescope를 사용하는 경우, 해당 마이그레이션을 애플리케이션에 퍼블리시해야 합니다. Cashier Stripe, Passport, Sanctum, Spark Stripe 및 Telescope는 **더 이상 자체 마이그레이션 디렉토리에서 마이그레이션을 자동으로 로드하지 않습니다**. 따라서 다음 명령을 실행하여 해당 마이그레이션을 애플리케이션에 퍼블리시해야 합니다.

```bash
php artisan vendor:publish --tag=cashier-migrations
php artisan vendor:publish --tag=passport-migrations
php artisan vendor:publish --tag=sanctum-migrations
php artisan vendor:publish --tag=spark-migrations
php artisan vendor:publish --tag=telescope-migrations
```

또한 추가적인 주요 변경 사항이 없는지 확인하기 위해 각 패키지의 업그레이드 가이드를 검토해야 합니다.

- [Laravel Cashier Stripe](#cashier-stripe)
- [Laravel Passport](#passport)
- [Laravel Sanctum](#sanctum)
- [Laravel Spark Stripe](#spark-stripe)
- [Laravel Telescope](#telescope)

Laravel 인스톨러를 수동으로 설치한 경우, Composer를 통해 인스톨러를 업데이트해야 합니다.

```bash
composer global require laravel/installer:^5.6
```

마지막으로, 이전에 애플리케이션에 추가했던 `doctrine/dbal` Composer 의존성이 있다면 제거할 수 있습니다. Laravel은 더 이상 이 패키지에 의존하지 않습니다.

<a name="application-structure"></a>
### 애플리케이션 구조

Laravel 11은 더 적은 기본 파일로 새로운 기본 애플리케이션 구조를 도입합니다. 즉, 새로운 Laravel 애플리케이션에는 더 적은 수의 서비스 프로바이더, 미들웨어 및 설정 파일이 포함됩니다.

그러나 Laravel 10 애플리케이션을 Laravel 11로 업그레이드할 때 애플리케이션 구조를 마이그레이션하는 것은 **권장하지 않습니다**. Laravel 11은 Laravel 10 애플리케이션 구조도 지원하도록 세심하게 조정되었기 때문입니다.

<a name="authentication"></a>
### 인증

<a name="password-rehashing"></a>
#### 비밀번호 리해싱

**영향 가능성: 낮음**

Laravel 11은 해싱 알고리즘의 "작업 계수(work factor)"가 비밀번호가 마지막으로 해싱된 이후 업데이트된 경우 인증 중에 사용자의 비밀번호를 자동으로 리해싱합니다.

일반적으로 이것은 애플리케이션을 방해하지 않아야 합니다. 그러나 `User` 모델의 "password" 필드가 `password`가 아닌 다른 이름을 가지고 있다면, 모델의 `authPasswordName` 속성을 통해 필드 이름을 지정해야 합니다.

    protected $authPasswordName = 'custom_password_field';

또는, 애플리케이션의 `config/hashing.php` 설정 파일에 `rehash_on_login` 옵션을 추가하여 비밀번호 리해싱을 비활성화할 수 있습니다.

    'rehash_on_login' => false,

<a name="the-user-provider-contract"></a>
#### `UserProvider` Contract

**영향 가능성: 낮음**

`Illuminate\Contracts\Auth\UserProvider` contract에 새로운 `rehashPasswordIfRequired` 메소드가 추가되었습니다. 이 메소드는 애플리케이션의 해싱 알고리즘 작업 계수가 변경되었을 때 사용자의 비밀번호를 리해싱하고 저장소에 저장하는 역할을 합니다.

애플리케이션이나 패키지에서 이 인터페이스를 구현하는 클래스를 정의한 경우, 구현에 새로운 `rehashPasswordIfRequired` 메소드를 추가해야 합니다. `Illuminate\Auth\EloquentUserProvider` 클래스에서 참조 구현을 찾을 수 있습니다.

```php
public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false);
```

<a name="the-authenticatable-contract"></a>
#### `Authenticatable` Contract

**영향 가능성: 낮음**

`Illuminate\Contracts\Auth\Authenticatable` contract에 새로운 `getAuthPasswordName` 메소드가 추가되었습니다. 이 메소드는 인증 가능한 엔티티의 비밀번호 컬럼 이름을 반환하는 역할을 합니다.

애플리케이션이나 패키지에서 이 인터페이스를 구현하는 클래스를 정의한 경우, 구현에 새로운 `getAuthPasswordName` 메소드를 추가해야 합니다.

```php
public function getAuthPasswordName()
{
    return 'password';
}
```

Laravel에 포함된 기본 `User` 모델은 `Illuminate\Auth\Authenticatable` trait에 이 메소드가 포함되어 있으므로 자동으로 이 메소드를 받습니다.

<a name="the-authentication-exception-class"></a>
#### `AuthenticationException` 클래스

**영향 가능성: 매우 낮음**

`Illuminate\Auth\AuthenticationException` 클래스의 `redirectTo` 메소드는 이제 첫 번째 인수로 `Illuminate\Http\Request` 인스턴스를 필요로 합니다. 이 예외를 수동으로 잡아서 `redirectTo` 메소드를 호출하는 경우, 그에 맞게 코드를 업데이트해야 합니다.

```php
if ($e instanceof AuthenticationException) {
    $path = $e->redirectTo($request);
}
```

<a name="email-verification-notification-on-registration"></a>
#### 회원가입 시 이메일 인증 알림

**영향 가능성: 매우 낮음**

`SendEmailVerificationNotification` 리스너는 애플리케이션의 `EventServiceProvider`에 의해 아직 등록되지 않은 경우 `Registered` 이벤트에 자동으로 등록됩니다. 애플리케이션의 `EventServiceProvider`가 이 리스너를 등록하지 않고 Laravel이 자동으로 등록하는 것을 원하지 않는 경우, 애플리케이션의 `EventServiceProvider`에서 빈 `configureEmailVerification` 메소드를 정의해야 합니다.

```php
protected function configureEmailVerification()
{
    // ...
}
```

<a name="cache"></a>
### 캐시

<a name="cache-key-prefixes"></a>
#### 캐시 키 접두사

**영향 가능성: 매우 낮음**

이전에 DynamoDB, Memcached 또는 Redis 캐시 저장소에 캐시 키 접두사가 정의된 경우, Laravel은 접두사에 `:`를 추가했습니다. Laravel 11에서는 캐시 키 접두사에 `:` 접미사가 붙지 않습니다. 이전의 접두사 동작을 유지하려면 캐시 키 접두사에 `:` 접미사를 수동으로 추가할 수 있습니다.

<a name="collections"></a>
### 컬렉션

<a name="the-enumerable-contract"></a>
#### `Enumerable` Contract

**영향 가능성: 낮음**

`Illuminate\Support\Enumerable` contract의 `dump` 메소드가 가변 `...$args` 인수를 받도록 업데이트되었습니다. 이 인터페이스를 구현하고 있다면 구현을 그에 맞게 업데이트해야 합니다.

```php
public function dump(...$args);
```

<a name="database"></a>
### 데이터베이스

<a name="sqlite-minimum-version"></a>
#### SQLite 3.26.0+

**영향 가능성: 높음**

애플리케이션이 SQLite 데이터베이스를 사용하는 경우, SQLite 3.26.0 이상이 필요합니다.

<a name="eloquent-model-casts-method"></a>
#### Eloquent 모델 `casts` 메소드

**영향 가능성: 낮음**

기본 Eloquent 모델 클래스는 이제 속성 캐스트 정의를 지원하기 위해 `casts` 메소드를 정의합니다. 애플리케이션의 모델 중 하나가 `casts` 관계를 정의하고 있다면, 기본 Eloquent 모델 클래스에 이제 존재하는 `casts` 메소드와 충돌할 수 있습니다.

<a name="modifying-columns"></a>
#### 컬럼 수정

**영향 가능성: 높음**

컬럼을 수정할 때, 이제 변경 후에도 컬럼 정의에 유지하려는 모든 수정자를 명시적으로 포함해야 합니다. 누락된 속성은 삭제됩니다. 예를 들어, `unsigned`, `default`, `comment` 속성을 유지하려면 컬럼을 변경할 때 각 수정자를 명시적으로 호출해야 합니다. 이는 이전 마이그레이션에서 해당 속성이 컬럼에 할당되어 있었더라도 마찬가지입니다.

예를 들어, `unsigned`, `default`, `comment` 속성이 있는 `votes` 컬럼을 생성하는 마이그레이션이 있다고 가정합니다.

```php
Schema::create('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('The vote count');
});
```

이후 컬럼을 `nullable`로도 변경하는 마이그레이션을 작성합니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->nullable()->change();
});
```

Laravel 10에서는 이 마이그레이션이 컬럼의 `unsigned`, `default`, `comment` 속성을 유지했습니다. 그러나 Laravel 11에서는 마이그레이션에 이전에 컬럼에 정의되었던 모든 속성도 포함해야 합니다. 그렇지 않으면 해당 속성이 삭제됩니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')
        ->unsigned()
        ->default(1)
        ->comment('The vote count')
        ->nullable()
        ->change();
});
```

`change` 메소드는 컬럼의 인덱스를 변경하지 않습니다. 따라서 컬럼을 수정할 때 인덱스 수정자를 사용하여 인덱스를 명시적으로 추가하거나 삭제할 수 있습니다.

```php
// 인덱스 추가...
$table->bigIncrements('id')->primary()->change();

// 인덱스 삭제...
$table->char('postal_code', 10)->unique(false)->change();
```

애플리케이션의 기존 모든 "change" 마이그레이션을 업데이트하여 컬럼의 기존 속성을 유지하고 싶지 않다면, 간단히 [마이그레이션을 스쿼시](/docs/{{version}}/migrations#squashing-migrations)할 수 있습니다.

```bash
php artisan schema:dump
```

마이그레이션이 스쿼시되면, Laravel은 보류 중인 마이그레이션을 실행하기 전에 애플리케이션의 스키마 파일을 사용하여 데이터베이스를 "마이그레이션"합니다.

<a name="floating-point-types"></a>
#### 부동 소수점 타입

**영향 가능성: 높음**

`double` 및 `float` 마이그레이션 컬럼 타입이 모든 데이터베이스에서 일관성을 갖도록 재작성되었습니다.

`double` 컬럼 타입은 이제 표준 SQL 구문인 전체 자릿수와 소수 자릿수가 없는 `DOUBLE` 동등 컬럼을 생성합니다. 따라서 `$total`과 `$places` 인수를 제거할 수 있습니다.

```php
$table->double('amount');
```

`float` 컬럼 타입은 이제 전체 자릿수와 소수 자릿수가 없지만 4바이트 단정밀도 컬럼 또는 8바이트 배정밀도 컬럼으로 저장 크기를 결정하기 위한 선택적 `$precision` 사양이 있는 `FLOAT` 동등 컬럼을 생성합니다. 따라서 `$total`과 `$places` 인수를 제거하고 데이터베이스 문서에 따라 선택적 `$precision`을 원하는 값으로 지정할 수 있습니다.

```php
$table->float('amount', precision: 53);
```

`unsignedDecimal`, `unsignedDouble` 및 `unsignedFloat` 메소드는 이러한 컬럼 타입에 대한 unsigned 수정자가 MySQL에 의해 더 이상 사용되지 않고(deprecated) 다른 데이터베이스 시스템에서 표준화되지 않았기 때문에 제거되었습니다. 그러나 이러한 컬럼 타입에 대해 더 이상 사용되지 않는 unsigned 속성을 계속 사용하려면 컬럼 정의에 `unsigned` 메소드를 체이닝할 수 있습니다.

```php
$table->decimal('amount', total: 8, places: 2)->unsigned();
$table->double('amount')->unsigned();
$table->float('amount', precision: 53)->unsigned();
```

<a name="dedicated-mariadb-driver"></a>
#### 전용 MariaDB 드라이버

**영향 가능성: 매우 낮음**

MariaDB 데이터베이스에 연결할 때 항상 MySQL 드라이버를 사용하는 대신, Laravel 11은 MariaDB를 위한 전용 데이터베이스 드라이버를 추가합니다.

애플리케이션이 MariaDB 데이터베이스에 연결하는 경우, 향후 MariaDB 특화 기능을 활용하기 위해 연결 설정을 새 `mariadb` 드라이버로 업데이트할 수 있습니다.

    'driver' => 'mariadb',
    'url' => env('DB_URL'),
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    // ...

현재 새 MariaDB 드라이버는 하나의 예외를 제외하고 현재 MySQL 드라이버와 동일하게 동작합니다. `uuid` 스키마 빌더 메소드는 `char(36)` 컬럼 대신 네이티브 UUID 컬럼을 생성합니다.

기존 마이그레이션에서 `uuid` 스키마 빌더 메소드를 사용하고 있고 새 `mariadb` 데이터베이스 드라이버를 사용하기로 선택한 경우, 주요 변경이나 예기치 않은 동작을 방지하기 위해 마이그레이션의 `uuid` 메소드 호출을 `char`로 업데이트해야 합니다.

```php
Schema::table('users', function (Blueprint $table) {
    $table->char('uuid', 36);

    // ...
});
```

<a name="spatial-types"></a>
#### 공간 타입

**영향 가능성: 낮음**

데이터베이스 마이그레이션의 공간 컬럼 타입이 모든 데이터베이스에서 일관성을 갖도록 재작성되었습니다. 따라서 마이그레이션에서 `point`, `lineString`, `polygon`, `geometryCollection`, `multiPoint`, `multiLineString`, `multiPolygon`, `multiPolygonZ` 메소드를 제거하고 대신 `geometry` 또는 `geography` 메소드를 사용할 수 있습니다.

```php
$table->geometry('shapes');
$table->geography('coordinates');
```

MySQL, MariaDB 및 PostgreSQL에서 컬럼에 저장되는 값의 타입이나 공간 참조 시스템 식별자를 명시적으로 제한하려면, 메소드에 `subtype`과 `srid`를 전달할 수 있습니다.

```php
$table->geometry('dimension', subtype: 'polygon', srid: 0);
$table->geography('latitude', subtype: 'point', srid: 4326);
```

PostgreSQL 문법의 `isGeometry` 및 `projection` 컬럼 수정자는 그에 따라 제거되었습니다.

<a name="doctrine-dbal-removal"></a>
#### Doctrine DBAL 제거

**영향 가능성: 낮음**

다음의 Doctrine DBAL 관련 클래스와 메소드가 제거되었습니다. Laravel은 더 이상 이 패키지에 의존하지 않으며, 이전에 커스텀 타입을 필요로 했던 다양한 컬럼 타입의 올바른 생성 및 변경을 위해 커스텀 Doctrine 타입을 등록할 필요가 없습니다.

<div class="content-list" markdown="1">

- `Illuminate\Database\Schema\Builder::$alwaysUsesNativeSchemaOperationsIfPossible` 클래스 속성
- `Illuminate\Database\Schema\Builder::useNativeSchemaOperationsIfPossible()` 메소드
- `Illuminate\Database\Connection::usingNativeSchemaOperations()` 메소드
- `Illuminate\Database\Connection::isDoctrineAvailable()` 메소드
- `Illuminate\Database\Connection::getDoctrineConnection()` 메소드
- `Illuminate\Database\Connection::getDoctrineSchemaManager()` 메소드
- `Illuminate\Database\Connection::getDoctrineColumn()` 메소드
- `Illuminate\Database\Connection::registerDoctrineType()` 메소드
- `Illuminate\Database\DatabaseManager::registerDoctrineType()` 메소드
- `Illuminate\Database\PDO` 디렉토리
- `Illuminate\Database\DBAL\TimestampType` 클래스
- `Illuminate\Database\Schema\Grammars\ChangeColumn` 클래스
- `Illuminate\Database\Schema\Grammars\RenameColumn` 클래스
- `Illuminate\Database\Schema\Grammars\Grammar::getDoctrineTableDiff()` 메소드

</div>

또한, 애플리케이션의 `database` 설정 파일에서 `dbal.types`를 통해 커스텀 Doctrine 타입을 등록하는 것은 더 이상 필요하지 않습니다.

이전에 데이터베이스와 관련 테이블을 검사하기 위해 Doctrine DBAL을 사용했다면, Laravel의 새로운 네이티브 스키마 메소드(`Schema::getTables()`, `Schema::getColumns()`, `Schema::getIndexes()`, `Schema::getForeignKeys()` 등)를 대신 사용할 수 있습니다.

<a name="deprecated-schema-methods"></a>
#### 더 이상 사용되지 않는 스키마 메소드

**영향 가능성: 매우 낮음**

더 이상 사용되지 않는 Doctrine 기반 `Schema::getAllTables()`, `Schema::getAllViews()`, `Schema::getAllTypes()` 메소드가 새로운 Laravel 네이티브 `Schema::getTables()`, `Schema::getViews()`, `Schema::getTypes()` 메소드를 위해 제거되었습니다.

PostgreSQL 및 SQL Server를 사용할 때, 새로운 스키마 메소드는 세 부분으로 구성된 참조(예: `database.schema.table`)를 허용하지 않습니다. 따라서 데이터베이스를 선언하기 위해 `connection()`을 사용해야 합니다.

```php
Schema::connection('database')->hasTable('schema.table');
```

<a name="get-column-types"></a>
#### 스키마 빌더 `getColumnType()` 메소드

**영향 가능성: 매우 낮음**

`Schema::getColumnType()` 메소드는 이제 Doctrine DBAL 동등 타입이 아닌 주어진 컬럼의 실제 타입을 항상 반환합니다.

<a name="database-connection-interface"></a>
#### 데이터베이스 커넥션 인터페이스

**영향 가능성: 매우 낮음**

`Illuminate\Database\ConnectionInterface` 인터페이스에 새로운 `scalar` 메소드가 추가되었습니다. 이 인터페이스의 자체 구현을 정의하고 있다면, 구현에 `scalar` 메소드를 추가해야 합니다.

```php
public function scalar($query, $bindings = [], $useReadPdo = true);
```

<a name="dates"></a>
### 날짜

<a name="carbon-3"></a>
#### Carbon 3

**영향 가능성: 중간**

Laravel 11은 Carbon 2와 Carbon 3을 모두 지원합니다. Carbon은 Laravel과 에코시스템 전반의 패키지에서 광범위하게 사용되는 날짜 조작 라이브러리입니다. Carbon 3으로 업그레이드하는 경우, `diffIn*` 메소드가 이제 부동 소수점 숫자를 반환하고 시간 방향을 나타내기 위해 음수 값을 반환할 수 있다는 점에 유의하세요. 이는 Carbon 2와 비교하여 상당한 변경입니다. 이러한 변경 사항과 기타 변경 사항을 처리하는 방법에 대한 자세한 내용은 Carbon의 [변경 로그](https://github.com/briannesbitt/Carbon/releases/tag/3.0.0)와 [문서](https://carbon.nesbot.com/docs/#api-carbon-3)를 검토하세요.

<a name="mail"></a>
### 메일

<a name="the-mailer-contract"></a>
#### `Mailer` Contract

**영향 가능성: 매우 낮음**

`Illuminate\Contracts\Mail\Mailer` contract에 새로운 `sendNow` 메소드가 추가되었습니다. 애플리케이션이나 패키지에서 이 contract를 수동으로 구현하는 경우, 구현에 새로운 `sendNow` 메소드를 추가해야 합니다.

```php
public function sendNow($mailable, array $data = [], $callback = null);
```

<a name="packages"></a>
### 패키지

<a name="publishing-service-providers"></a>
#### 애플리케이션에 서비스 프로바이더 퍼블리싱

**영향 가능성: 매우 낮음**

애플리케이션의 `app/Providers` 디렉토리에 서비스 프로바이더를 수동으로 퍼블리시하고 애플리케이션의 `config/app.php` 설정 파일을 수동으로 수정하여 서비스 프로바이더를 등록하는 Laravel 패키지를 작성한 경우, 새로운 `ServiceProvider::addProviderToBootstrapFile` 메소드를 활용하도록 패키지를 업데이트해야 합니다.

`addProviderToBootstrapFile` 메소드는 새 Laravel 11 애플리케이션에서 `config/app.php` 설정 파일 내에 `providers` 배열이 존재하지 않기 때문에, 퍼블리시한 서비스 프로바이더를 애플리케이션의 `bootstrap/providers.php` 파일에 자동으로 추가합니다.

```php
use Illuminate\Support\ServiceProvider;

ServiceProvider::addProviderToBootstrapFile(Provider::class);
```

<a name="queues"></a>
### 큐

<a name="the-batch-repository-interface"></a>
#### `BatchRepository` 인터페이스

**영향 가능성: 매우 낮음**

`Illuminate\Bus\BatchRepository` 인터페이스에 새로운 `rollBack` 메소드가 추가되었습니다. 자체 패키지나 애플리케이션에서 이 인터페이스를 구현하는 경우, 구현에 이 메소드를 추가해야 합니다.

```php
public function rollBack();
```

<a name="synchronous-jobs-in-database-transactions"></a>
#### 데이터베이스 트랜잭션 내 동기 작업

**영향 가능성: 매우 낮음**

이전에 동기 작업(`sync` 큐 드라이버를 사용하는 작업)은 큐 연결의 `after_commit` 설정 옵션이 `true`로 설정되었거나 작업에서 `afterCommit` 메소드가 호출되었더라도 즉시 실행되었습니다.

Laravel 11에서는 동기 큐 작업이 이제 큐 연결 또는 작업의 "커밋 후(after commit)" 설정을 준수합니다.

<a name="rate-limiting"></a>
### 속도 제한

<a name="per-second-rate-limiting"></a>
#### 초 단위 속도 제한

**영향 가능성: 중간**

Laravel 11은 분 단위 세분화로 제한되는 대신 초 단위 속도 제한을 지원합니다. 이 변경과 관련하여 알아야 할 잠재적인 주요 변경 사항이 다양합니다.

`GlobalLimit` 클래스 생성자는 이제 분 대신 초를 받습니다. 이 클래스는 문서화되지 않았으며 일반적으로 애플리케이션에서 사용되지 않습니다.

```php
new GlobalLimit($attempts, 2 * 60);
```

`Limit` 클래스 생성자는 이제 분 대신 초를 받습니다. 이 클래스의 문서화된 모든 사용법은 `Limit::perMinute` 및 `Limit::perSecond`와 같은 정적 생성자로 제한됩니다. 그러나 이 클래스를 수동으로 인스턴스화하는 경우, 클래스의 생성자에 초를 제공하도록 애플리케이션을 업데이트해야 합니다.

```php
new Limit($key, $attempts, 2 * 60);
```

`Limit` 클래스의 `decayMinutes` 속성이 `decaySeconds`로 이름이 변경되었으며 이제 분 대신 초를 포함합니다.

`Illuminate\Queue\Middleware\ThrottlesExceptions` 및 `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis` 클래스 생성자는 이제 분 대신 초를 받습니다.

```php
new ThrottlesExceptions($attempts, 2 * 60);
new ThrottlesExceptionsWithRedis($attempts, 2 * 60);
```

<a name="cashier-stripe"></a>
### Cashier Stripe

<a name="updating-cashier-stripe"></a>
#### Cashier Stripe 업데이트

**영향 가능성: 높음**

Laravel 11은 더 이상 Cashier Stripe 14.x를 지원하지 않습니다. 따라서 `composer.json` 파일에서 애플리케이션의 Laravel Cashier Stripe 의존성을 `^15.0`으로 업데이트해야 합니다.

Cashier Stripe 15.0은 더 이상 자체 마이그레이션 디렉토리에서 마이그레이션을 자동으로 로드하지 않습니다. 대신 다음 명령을 실행하여 Cashier Stripe의 마이그레이션을 애플리케이션에 퍼블리시해야 합니다.

```shell
php artisan vendor:publish --tag=cashier-migrations
```

추가적인 주요 변경 사항에 대해서는 전체 [Cashier Stripe 업그레이드 가이드](https://github.com/laravel/cashier-stripe/blob/15.x/UPGRADE.md)를 검토하세요.

<a name="spark-stripe"></a>
### Spark (Stripe)

<a name="updating-spark-stripe"></a>
#### Spark Stripe 업데이트

**영향 가능성: 높음**

Laravel 11은 더 이상 Laravel Spark Stripe 4.x를 지원하지 않습니다. 따라서 `composer.json` 파일에서 애플리케이션의 Laravel Spark Stripe 의존성을 `^5.0`으로 업데이트해야 합니다.

Spark Stripe 5.0은 더 이상 자체 마이그레이션 디렉토리에서 마이그레이션을 자동으로 로드하지 않습니다. 대신 다음 명령을 실행하여 Spark Stripe의 마이그레이션을 애플리케이션에 퍼블리시해야 합니다.

```shell
php artisan vendor:publish --tag=spark-migrations
```

추가적인 주요 변경 사항에 대해서는 전체 [Spark Stripe 업그레이드 가이드](https://spark.laravel.com/docs/spark-stripe/upgrade.html)를 검토하세요.

<a name="passport"></a>
### Passport

<a name="updating-telescope"></a>
#### Passport 업데이트

**영향 가능성: 높음**

Laravel 11은 더 이상 Laravel Passport 11.x를 지원하지 않습니다. 따라서 `composer.json` 파일에서 애플리케이션의 Laravel Passport 의존성을 `^12.0`으로 업데이트해야 합니다.

Passport 12.0은 더 이상 자체 마이그레이션 디렉토리에서 마이그레이션을 자동으로 로드하지 않습니다. 대신 다음 명령을 실행하여 Passport의 마이그레이션을 애플리케이션에 퍼블리시해야 합니다.

```shell
php artisan vendor:publish --tag=passport-migrations
```

또한 비밀번호 부여(password grant) 타입은 기본적으로 비활성화되어 있습니다. 애플리케이션의 `AppServiceProvider`의 `boot` 메소드에서 `enablePasswordGrant` 메소드를 호출하여 이를 활성화할 수 있습니다.

    public function boot(): void
    {
        Passport::enablePasswordGrant();
    }

<a name="sanctum"></a>
### Sanctum

<a name="updating-sanctum"></a>
#### Sanctum 업데이트

**영향 가능성: 높음**

Laravel 11은 더 이상 Laravel Sanctum 3.x를 지원하지 않습니다. 따라서 `composer.json` 파일에서 애플리케이션의 Laravel Sanctum 의존성을 `^4.0`으로 업데이트해야 합니다.

Sanctum 4.0은 더 이상 자체 마이그레이션 디렉토리에서 마이그레이션을 자동으로 로드하지 않습니다. 대신 다음 명령을 실행하여 Sanctum의 마이그레이션을 애플리케이션에 퍼블리시해야 합니다.

```shell
php artisan vendor:publish --tag=sanctum-migrations
```

그런 다음, 애플리케이션의 `config/sanctum.php` 설정 파일에서 `authenticate_session`, `encrypt_cookies`, `validate_csrf_token` 미들웨어의 참조를 다음과 같이 업데이트해야 합니다.

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

<a name="telescope"></a>
### Telescope

<a name="updating-telescope"></a>
#### Telescope 업데이트

**영향 가능성: 높음**

Laravel 11은 더 이상 Laravel Telescope 4.x를 지원하지 않습니다. 따라서 `composer.json` 파일에서 애플리케이션의 Laravel Telescope 의존성을 `^5.0`으로 업데이트해야 합니다.

Telescope 5.0은 더 이상 자체 마이그레이션 디렉토리에서 마이그레이션을 자동으로 로드하지 않습니다. 대신 다음 명령을 실행하여 Telescope의 마이그레이션을 애플리케이션에 퍼블리시해야 합니다.

```shell
php artisan vendor:publish --tag=telescope-migrations
```

<a name="spatie-once-package"></a>
### Spatie Once 패키지

**영향 가능성: 중간**

Laravel 11은 이제 주어진 클로저가 한 번만 실행되도록 보장하는 자체 [`once` 함수](/docs/{{version}}/helpers#method-once)를 제공합니다. 따라서 애플리케이션이 `spatie/once` 패키지에 대한 의존성이 있다면, 충돌을 방지하기 위해 애플리케이션의 `composer.json` 파일에서 이를 제거해야 합니다.

<a name="miscellaneous"></a>
### 기타

`laravel/laravel` [GitHub 저장소](https://github.com/laravel/laravel)의 변경 사항도 확인하시기 바랍니다. 이러한 변경 사항 중 많은 부분이 필수는 아니지만, 애플리케이션과 파일을 동기화된 상태로 유지하고 싶을 수 있습니다. 이러한 변경 사항 중 일부는 이 업그레이드 가이드에서 다루지만, 설정 파일이나 주석의 변경과 같은 다른 사항은 다루지 않습니다. [GitHub 비교 도구](https://github.com/laravel/laravel/compare/10.x...11.x)를 사용하여 변경 사항을 쉽게 확인하고 어떤 업데이트가 중요한지 선택할 수 있습니다.

# 데이터베이스: 시작하기

- [소개](#introduction)
    - [설정](#configuration)
    - [읽기 및 쓰기 연결](#read-and-write-connections)
- [SQL 쿼리 실행](#running-queries)
    - [다중 데이터베이스 연결 사용](#using-multiple-database-connections)
    - [쿼리 이벤트 수신](#listening-for-query-events)
    - [누적 쿼리 시간 모니터링](#monitoring-cumulative-query-time)
- [데이터베이스 트랜잭션](#database-transactions)
- [데이터베이스 CLI에 연결](#connecting-to-the-database-cli)
- [데이터베이스 검사](#inspecting-your-databases)
- [데이터베이스 모니터링](#monitoring-your-databases)

<a name="introduction"></a>
## 소개

거의 모든 현대 웹 애플리케이션은 데이터베이스와 상호작용합니다. Laravel은 원시 SQL, [유연한 쿼리 빌더(fluent query builder)](/docs/{{version}}/queries), 그리고 [Eloquent ORM](/docs/{{version}}/eloquent)을 사용하여 다양한 지원 데이터베이스와의 상호작용을 매우 간단하게 만들어줍니다. 현재 Laravel은 다섯 가지 데이터베이스에 대한 공식 지원을 제공합니다:

<div class="content-list" markdown="1">

- MariaDB 10.3+ ([버전 정책](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([버전 정책](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([버전 정책](https://www.postgresql.org/support/versioning/))
- SQLite 3.26.0+
- SQL Server 2017+ ([버전 정책](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

추가적으로, MongoDB는 MongoDB에서 공식적으로 유지 관리하는 `mongodb/laravel-mongodb` 패키지를 통해 지원됩니다. 자세한 내용은 [Laravel MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/) 문서를 확인하세요.

<a name="configuration"></a>
### 설정

Laravel의 데이터베이스 서비스 설정은 애플리케이션의 `config/database.php` 설정 파일에 있습니다. 이 파일에서 모든 데이터베이스 연결을 정의하고, 기본적으로 사용할 연결을 지정할 수 있습니다. 이 파일의 대부분의 설정 옵션은 애플리케이션의 환경 변수 값에 의해 결정됩니다. Laravel이 지원하는 대부분의 데이터베이스 시스템에 대한 예제가 이 파일에 제공됩니다.

기본적으로, Laravel의 샘플 [환경 설정](/docs/{{version}}/configuration#environment-configuration)은 로컬 머신에서 Laravel 애플리케이션을 개발하기 위한 Docker 구성인 [Laravel Sail](/docs/{{version}}/sail)과 함께 사용할 준비가 되어 있습니다. 그러나 로컬 데이터베이스에 필요한 대로 데이터베이스 설정을 자유롭게 수정할 수 있습니다.

<a name="sqlite-configuration"></a>
#### SQLite 설정

SQLite 데이터베이스는 파일 시스템의 단일 파일에 포함됩니다. 터미널에서 `touch` 명령을 사용하여 새 SQLite 데이터베이스를 생성할 수 있습니다: `touch database/database.sqlite`. 데이터베이스가 생성되면, `DB_DATABASE` 환경 변수에 데이터베이스의 절대 경로를 배치하여 이 데이터베이스를 가리키도록 환경 변수를 쉽게 구성할 수 있습니다:

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

기본적으로 SQLite 연결에서는 외래 키 제약 조건(foreign key constraints)이 활성화되어 있습니다. 비활성화하려면 `DB_FOREIGN_KEYS` 환경 변수를 `false`로 설정해야 합니다:

```ini
DB_FOREIGN_KEYS=false
```

> [!NOTE]
> [Laravel 설치 프로그램](/docs/{{version}}/installation#creating-a-laravel-project)을 사용하여 Laravel 애플리케이션을 생성하고 SQLite를 데이터베이스로 선택하면, Laravel이 자동으로 `database/database.sqlite` 파일을 생성하고 기본 [데이터베이스 마이그레이션](/docs/{{version}}/migrations)을 실행합니다.

<a name="mssql-configuration"></a>
#### Microsoft SQL Server 설정

Microsoft SQL Server 데이터베이스를 사용하려면, `sqlsrv` 및 `pdo_sqlsrv` PHP 확장과 Microsoft SQL ODBC 드라이버와 같은 필요한 종속성이 설치되어 있는지 확인해야 합니다.

<a name="configuration-using-urls"></a>
#### URL을 사용한 설정

일반적으로 데이터베이스 연결은 `host`, `database`, `username`, `password` 등과 같은 여러 설정 값을 사용하여 구성됩니다. 이러한 각 설정 값에는 해당하는 환경 변수가 있습니다. 이는 프로덕션 서버에서 데이터베이스 연결 정보를 구성할 때 여러 환경 변수를 관리해야 함을 의미합니다.

AWS 및 Heroku와 같은 일부 관리형 데이터베이스 제공업체는 단일 문자열에 데이터베이스의 모든 연결 정보를 포함하는 단일 데이터베이스 "URL"을 제공합니다. 데이터베이스 URL의 예는 다음과 같습니다:

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

이러한 URL은 일반적으로 표준 스키마 규칙을 따릅니다:

```html
driver://username:password@host:port/database?options
```

편의를 위해, Laravel은 여러 설정 옵션으로 데이터베이스를 구성하는 대신 이러한 URL을 지원합니다. `url` (또는 해당하는 `DB_URL` 환경 변수) 설정 옵션이 있으면, 데이터베이스 연결 및 자격 증명 정보를 추출하는 데 사용됩니다.

<a name="read-and-write-connections"></a>
### 읽기 및 쓰기 연결

때때로 SELECT 문에는 하나의 데이터베이스 연결을 사용하고, INSERT, UPDATE 및 DELETE 문에는 다른 연결을 사용하고 싶을 수 있습니다. Laravel은 이를 간편하게 만들어주며, 원시 쿼리, 쿼리 빌더 또는 Eloquent ORM을 사용하든 항상 적절한 연결이 사용됩니다.

읽기/쓰기 연결을 어떻게 구성해야 하는지 이 예제를 살펴보겠습니다:

```php
'mysql' => [
    'driver' => 'mysql',

    'read' => [
        'host' => [
            '192.168.1.1',
            '196.168.1.2',
        ],
    ],
    'write' => [
        'host' => [
            '192.168.1.3',
        ],
    ],
    'sticky' => true,

    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'unix_socket' => env('DB_SOCKET', ''),
    'charset' => env('DB_CHARSET', 'utf8mb4'),
    'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
    'prefix' => '',
    'prefix_indexes' => true,
    'strict' => true,
    'engine' => null,
    'options' => extension_loaded('pdo_mysql') ? array_filter([
        (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
    ]) : [],
],
```

설정 배열에 세 개의 키가 추가되었습니다: `read`, `write` 및 `sticky`. `read`와 `write` 키에는 단일 키 `host`를 포함하는 배열 값이 있습니다. `read` 및 `write` 연결의 나머지 데이터베이스 옵션은 기본 `mysql` 설정 배열에서 병합됩니다.

기본 `mysql` 배열의 값을 재정의하려는 경우에만 `read` 및 `write` 배열에 항목을 배치하면 됩니다. 따라서 이 경우, `192.168.1.1`은 "읽기" 연결의 호스트로 사용되고, `192.168.1.3`은 "쓰기" 연결에 사용됩니다. 데이터베이스 자격 증명, 접두사, 문자 집합 및 기본 `mysql` 배열의 다른 모든 옵션은 두 연결에서 공유됩니다. `host` 설정 배열에 여러 값이 있으면, 각 요청마다 데이터베이스 호스트가 무작위로 선택됩니다.

<a name="the-sticky-option"></a>
#### `sticky` 옵션

`sticky` 옵션은 현재 요청 사이클 동안 데이터베이스에 기록된 레코드를 즉시 읽을 수 있도록 하는 *선택적* 값입니다. `sticky` 옵션이 활성화되어 있고 현재 요청 사이클 동안 데이터베이스에 대해 "쓰기" 작업이 수행된 경우, 이후의 모든 "읽기" 작업은 "쓰기" 연결을 사용합니다. 이렇게 하면 요청 사이클 동안 기록된 모든 데이터를 동일한 요청 중에 데이터베이스에서 즉시 다시 읽을 수 있습니다. 이것이 애플리케이션에 원하는 동작인지는 여러분이 결정할 사항입니다.

<a name="running-queries"></a>
## SQL 쿼리 실행

데이터베이스 연결을 구성하면, `DB` 파사드(facade)를 사용하여 쿼리를 실행할 수 있습니다. `DB` 파사드는 각 유형의 쿼리에 대한 메서드를 제공합니다: `select`, `update`, `insert`, `delete`, 그리고 `statement`.

<a name="running-a-select-query"></a>
#### Select 쿼리 실행

기본 SELECT 쿼리를 실행하려면, `DB` 파사드에서 `select` 메서드를 사용할 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 애플리케이션의 모든 사용자 목록을 표시합니다.
     */
    public function index(): View
    {
        $users = DB::select('select * from users where active = ?', [1]);

        return view('user.index', ['users' => $users]);
    }
}
```

`select` 메서드에 전달되는 첫 번째 인수는 SQL 쿼리이고, 두 번째 인수는 쿼리에 바인딩해야 하는 모든 파라미터 바인딩입니다. 일반적으로 이것들은 `where` 절 제약 조건의 값입니다. 파라미터 바인딩은 SQL 인젝션에 대한 보호를 제공합니다.

`select` 메서드는 항상 결과의 `array`를 반환합니다. 배열 내의 각 결과는 데이터베이스의 레코드를 나타내는 PHP `stdClass` 객체입니다:

```php
use Illuminate\Support\Facades\DB;

$users = DB::select('select * from users');

foreach ($users as $user) {
    echo $user->name;
}
```

<a name="selecting-scalar-values"></a>
#### 스칼라 값 선택

때때로 데이터베이스 쿼리가 단일 스칼라 값을 결과로 반환할 수 있습니다. 레코드 객체에서 쿼리의 스칼라 결과를 검색하는 대신, Laravel은 `scalar` 메서드를 사용하여 이 값을 직접 검색할 수 있게 해줍니다:

```php
$burgers = DB::scalar(
    "select count(case when food = 'burger' then 1 end) as burgers from menu"
);
```

<a name="selecting-multiple-result-sets"></a>
#### 다중 결과 집합 선택

애플리케이션이 여러 결과 집합을 반환하는 저장 프로시저를 호출하는 경우, `selectResultSets` 메서드를 사용하여 저장 프로시저가 반환하는 모든 결과 집합을 검색할 수 있습니다:

```php
[$options, $notifications] = DB::selectResultSets(
    "CALL get_user_options_and_notifications(?)", $request->user()->id
);
```

<a name="using-named-bindings"></a>
#### 명명된 바인딩 사용

파라미터 바인딩을 나타내기 위해 `?`를 사용하는 대신, 명명된 바인딩을 사용하여 쿼리를 실행할 수 있습니다:

```php
$results = DB::select('select * from users where id = :id', ['id' => 1]);
```

<a name="running-an-insert-statement"></a>
#### Insert 문 실행

`insert` 문을 실행하려면, `DB` 파사드에서 `insert` 메서드를 사용할 수 있습니다. `select`와 마찬가지로, 이 메서드는 SQL 쿼리를 첫 번째 인수로 받고 바인딩을 두 번째 인수로 받습니다:

```php
use Illuminate\Support\Facades\DB;

DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);
```

<a name="running-an-update-statement"></a>
#### Update 문 실행

`update` 메서드는 데이터베이스의 기존 레코드를 업데이트하는 데 사용해야 합니다. 문에 의해 영향을 받은 행 수가 메서드에 의해 반환됩니다:

```php
use Illuminate\Support\Facades\DB;

$affected = DB::update(
    'update users set votes = 100 where name = ?',
    ['Anita']
);
```

<a name="running-a-delete-statement"></a>
#### Delete 문 실행

`delete` 메서드는 데이터베이스에서 레코드를 삭제하는 데 사용해야 합니다. `update`와 마찬가지로, 영향을 받은 행 수가 메서드에 의해 반환됩니다:

```php
use Illuminate\Support\Facades\DB;

$deleted = DB::delete('delete from users');
```

<a name="running-a-general-statement"></a>
#### 일반 문 실행

일부 데이터베이스 문은 값을 반환하지 않습니다. 이러한 유형의 작업에는 `DB` 파사드의 `statement` 메서드를 사용할 수 있습니다:

```php
DB::statement('drop table users');
```

<a name="running-an-unprepared-statement"></a>
#### Unprepared 문 실행

때때로 값을 바인딩하지 않고 SQL 문을 실행하고 싶을 수 있습니다. `DB` 파사드의 `unprepared` 메서드를 사용하여 이를 수행할 수 있습니다:

```php
DB::unprepared('update users set votes = 100 where name = "Dries"');
```

> [!WARNING]
> unprepared 문은 파라미터를 바인딩하지 않으므로, SQL 인젝션에 취약할 수 있습니다. unprepared 문 내에서 사용자가 제어하는 값을 절대 허용하지 마세요.

<a name="implicit-commits-in-transactions"></a>
#### 암시적 커밋

트랜잭션 내에서 `DB` 파사드의 `statement` 및 `unprepared` 메서드를 사용할 때, [암시적 커밋](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)을 유발하는 문을 피하도록 주의해야 합니다. 이러한 문은 데이터베이스 엔진이 전체 트랜잭션을 간접적으로 커밋하게 하여, Laravel이 데이터베이스의 트랜잭션 수준을 인식하지 못하게 합니다. 이러한 문의 예는 데이터베이스 테이블 생성입니다:

```php
DB::unprepared('create table a (col varchar(1) null)');
```

암시적 커밋을 유발하는 [모든 문 목록](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)은 MySQL 매뉴얼을 참조하세요.

<a name="using-multiple-database-connections"></a>
### 다중 데이터베이스 연결 사용

애플리케이션이 `config/database.php` 설정 파일에 여러 연결을 정의하는 경우, `DB` 파사드에서 제공하는 `connection` 메서드를 통해 각 연결에 액세스할 수 있습니다. `connection` 메서드에 전달되는 연결 이름은 `config/database.php` 설정 파일에 나열된 연결 중 하나 또는 `config` 헬퍼를 사용하여 런타임에 구성된 연결과 일치해야 합니다:

```php
use Illuminate\Support\Facades\DB;

$users = DB::connection('sqlite')->select(/* ... */);
```

연결 인스턴스에서 `getPdo` 메서드를 사용하여 연결의 원시 기본 PDO 인스턴스에 액세스할 수 있습니다:

```php
$pdo = DB::connection()->getPdo();
```

<a name="listening-for-query-events"></a>
### 쿼리 이벤트 수신

애플리케이션에서 실행되는 각 SQL 쿼리에 대해 호출되는 클로저를 지정하려면, `DB` 파사드의 `listen` 메서드를 사용할 수 있습니다. 이 메서드는 쿼리 로깅 또는 디버깅에 유용할 수 있습니다. [서비스 프로바이더](/docs/{{version}}/providers)의 `boot` 메서드에서 쿼리 리스너 클로저를 등록할 수 있습니다:

```php
<?php

namespace App\Providers;

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 등록합니다.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        DB::listen(function (QueryExecuted $query) {
            // $query->sql;
            // $query->bindings;
            // $query->time;
            // $query->toRawSql();
        });
    }
}
```

<a name="monitoring-cumulative-query-time"></a>
### 누적 쿼리 시간 모니터링

현대 웹 애플리케이션의 일반적인 성능 병목 현상은 데이터베이스를 쿼리하는 데 소비하는 시간입니다. 다행히, Laravel은 단일 요청 중에 데이터베이스를 쿼리하는 데 너무 많은 시간을 소비할 때 선택한 클로저 또는 콜백을 호출할 수 있습니다. 시작하려면, 쿼리 시간 임계값(밀리초)과 클로저를 `whenQueryingForLongerThan` 메서드에 제공하세요. [서비스 프로바이더](/docs/{{version}}/providers)의 `boot` 메서드에서 이 메서드를 호출할 수 있습니다:

```php
<?php

namespace App\Providers;

use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Events\QueryExecuted;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 등록합니다.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
            // 개발팀에 알림...
        });
    }
}
```

<a name="database-transactions"></a>
## 데이터베이스 트랜잭션

`DB` 파사드에서 제공하는 `transaction` 메서드를 사용하여 데이터베이스 트랜잭션 내에서 일련의 작업을 실행할 수 있습니다. 트랜잭션 클로저 내에서 예외가 발생하면, 트랜잭션이 자동으로 롤백되고 예외가 다시 던져집니다. 클로저가 성공적으로 실행되면, 트랜잭션이 자동으로 커밋됩니다. `transaction` 메서드를 사용할 때 수동으로 롤백하거나 커밋하는 것에 대해 걱정할 필요가 없습니다:

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
});
```

<a name="handling-deadlocks"></a>
#### 데드락 처리

`transaction` 메서드는 데드락이 발생할 때 트랜잭션을 재시도해야 하는 횟수를 정의하는 선택적 두 번째 인수를 받습니다. 이러한 시도가 모두 소진되면, 예외가 던져집니다:

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
}, attempts: 5);
```

<a name="manually-using-transactions"></a>
#### 수동으로 트랜잭션 사용

트랜잭션을 수동으로 시작하고 롤백과 커밋을 완전히 제어하려면, `DB` 파사드에서 제공하는 `beginTransaction` 메서드를 사용할 수 있습니다:

```php
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
```

`rollBack` 메서드를 통해 트랜잭션을 롤백할 수 있습니다:

```php
DB::rollBack();
```

마지막으로, `commit` 메서드를 통해 트랜잭션을 커밋할 수 있습니다:

```php
DB::commit();
```

> [!NOTE]
> `DB` 파사드의 트랜잭션 메서드는 [쿼리 빌더](/docs/{{version}}/queries)와 [Eloquent ORM](/docs/{{version}}/eloquent) 모두의 트랜잭션을 제어합니다.

<a name="connecting-to-the-database-cli"></a>
## 데이터베이스 CLI에 연결

데이터베이스의 CLI에 연결하려면, `db` Artisan 명령을 사용할 수 있습니다:

```shell
php artisan db
```

필요한 경우, 기본 연결이 아닌 데이터베이스 연결에 연결하기 위해 데이터베이스 연결 이름을 지정할 수 있습니다:

```shell
php artisan db mysql
```

<a name="inspecting-your-databases"></a>
## 데이터베이스 검사

`db:show` 및 `db:table` Artisan 명령을 사용하면, 데이터베이스와 관련 테이블에 대한 유용한 정보를 얻을 수 있습니다. 데이터베이스의 크기, 유형, 열린 연결 수 및 테이블 요약을 포함한 데이터베이스 개요를 보려면, `db:show` 명령을 사용할 수 있습니다:

```shell
php artisan db:show
```

`--database` 옵션을 통해 명령에 데이터베이스 연결 이름을 제공하여 검사할 데이터베이스 연결을 지정할 수 있습니다:

```shell
php artisan db:show --database=pgsql
```

명령의 출력에 테이블 행 수와 데이터베이스 뷰 세부 정보를 포함하려면, 각각 `--counts` 및 `--views` 옵션을 제공할 수 있습니다. 대규모 데이터베이스에서는 행 수와 뷰 세부 정보를 검색하는 것이 느릴 수 있습니다:

```shell
php artisan db:show --counts --views
```

또한, 다음 `Schema` 메서드를 사용하여 데이터베이스를 검사할 수 있습니다:

```php
use Illuminate\Support\Facades\Schema;

$tables = Schema::getTables();
$views = Schema::getViews();
$columns = Schema::getColumns('users');
$indexes = Schema::getIndexes('users');
$foreignKeys = Schema::getForeignKeys('users');
```

애플리케이션의 기본 연결이 아닌 데이터베이스 연결을 검사하려면, `connection` 메서드를 사용할 수 있습니다:

```php
$columns = Schema::connection('sqlite')->getColumns('users');
```

<a name="table-overview"></a>
#### 테이블 개요

데이터베이스 내의 개별 테이블에 대한 개요를 얻으려면, `db:table` Artisan 명령을 실행할 수 있습니다. 이 명령은 컬럼, 유형, 속성, 키 및 인덱스를 포함한 데이터베이스 테이블의 일반적인 개요를 제공합니다:

```shell
php artisan db:table users
```

<a name="monitoring-your-databases"></a>
## 데이터베이스 모니터링

`db:monitor` Artisan 명령을 사용하면, 데이터베이스가 지정된 수 이상의 열린 연결을 관리하는 경우 Laravel이 `Illuminate\Database\Events\DatabaseBusy` 이벤트를 디스패치하도록 지시할 수 있습니다.

시작하려면, `db:monitor` 명령을 [매분 실행](/docs/{{version}}/scheduling)하도록 스케줄링해야 합니다. 이 명령은 모니터링하려는 데이터베이스 연결 설정의 이름과 이벤트를 디스패치하기 전에 허용되어야 하는 최대 열린 연결 수를 받습니다:

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

이 명령만 스케줄링하는 것으로는 열린 연결 수를 알려주는 알림을 트리거하기에 충분하지 않습니다. 명령이 임계값을 초과하는 열린 연결 수를 가진 데이터베이스를 발견하면, `DatabaseBusy` 이벤트가 디스패치됩니다. 여러분이나 개발팀에게 알림을 보내려면 애플리케이션의 `AppServiceProvider`에서 이 이벤트를 수신해야 합니다:

```php
use App\Notifications\DatabaseApproachingMaxConnections;
use Illuminate\Database\Events\DatabaseBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Event::listen(function (DatabaseBusy $event) {
        Notification::route('mail', 'dev@example.com')
            ->notify(new DatabaseApproachingMaxConnections(
                $event->connectionName,
                $event->connections
            ));
    });
}
```

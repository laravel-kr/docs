# 데이터베이스: 쿼리 빌더(Query Builder)

- [소개](#introduction)
- [데이터베이스 쿼리 실행](#running-database-queries)
    - [결과 청킹](#chunking-results)
    - [지연 스트리밍 결과](#streaming-results-lazily)
    - [집계 함수](#aggregates)
- [Select 구문](#select-statements)
- [Raw 표현식](#raw-expressions)
- [Joins](#joins)
- [Unions](#unions)
- [기본 Where 절](#basic-where-clauses)
    - [Where 절](#where-clauses)
    - [Or Where 절](#or-where-clauses)
    - [Where Not 절](#where-not-clauses)
    - [Where Any / All 절](#where-any-all-clauses)
    - [JSON Where 절](#json-where-clauses)
    - [추가 Where 절](#additional-where-clauses)
    - [논리적 그룹화](#logical-grouping)
- [고급 Where 절](#advanced-where-clauses)
    - [Where Exists 절](#where-exists-clauses)
    - [서브쿼리 Where 절](#subquery-where-clauses)
    - [전문 검색 Where 절](#full-text-where-clauses)
- [정렬, 그룹화, Limit 및 Offset](#ordering-grouping-limit-and-offset)
    - [정렬](#ordering)
    - [그룹화](#grouping)
    - [Limit 및 Offset](#limit-and-offset)
- [조건부 절](#conditional-clauses)
- [Insert 구문](#insert-statements)
    - [Upserts](#upserts)
- [Update 구문](#update-statements)
    - [JSON 컬럼 업데이트](#updating-json-columns)
    - [증가 및 감소](#increment-and-decrement)
- [Delete 구문](#delete-statements)
- [비관적 잠금](#pessimistic-locking)
- [디버깅](#debugging)

<a name="introduction"></a>
## 소개

Laravel의 데이터베이스 쿼리 빌더는 데이터베이스 쿼리를 생성하고 실행하기 위한 편리하고 유창한 인터페이스를 제공합니다. 애플리케이션에서 대부분의 데이터베이스 작업을 수행하는 데 사용할 수 있으며, Laravel이 지원하는 모든 데이터베이스 시스템과 완벽하게 작동합니다.

Laravel 쿼리 빌더는 PDO 파라미터 바인딩을 사용하여 SQL 인젝션 공격으로부터 애플리케이션을 보호합니다. 쿼리 바인딩으로 전달되는 문자열을 정리하거나 새니타이즈할 필요가 없습니다.

> [!WARNING]
> PDO는 컬럼 이름 바인딩을 지원하지 않습니다. 따라서 "order by" 컬럼을 포함하여 쿼리에서 참조하는 컬럼 이름이 사용자 입력에 의해 결정되도록 허용해서는 안 됩니다.

<a name="running-database-queries"></a>
## 데이터베이스 쿼리 실행

<a name="retrieving-all-rows-from-a-table"></a>
#### 테이블에서 모든 행 조회

`DB` 파사드가 제공하는 `table` 메서드를 사용하여 쿼리를 시작할 수 있습니다. `table` 메서드는 주어진 테이블에 대한 유창한 쿼리 빌더 인스턴스를 반환하며, 쿼리에 더 많은 제약 조건을 체이닝한 다음 최종적으로 `get` 메서드를 사용하여 쿼리 결과를 조회할 수 있습니다.

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
            $users = DB::table('users')->get();

            return view('user.index', ['users' => $users]);
        }
    }

`get` 메서드는 쿼리 결과를 포함하는 `Illuminate\Support\Collection` 인스턴스를 반환하며, 각 결과는 PHP `stdClass` 객체의 인스턴스입니다. 객체의 프로퍼티로 컬럼에 접근하여 각 컬럼의 값을 가져올 수 있습니다.

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')->get();

    foreach ($users as $user) {
        echo $user->name;
    }

> [!NOTE]
> Laravel 컬렉션은 데이터를 매핑하고 축소하기 위한 매우 강력한 다양한 메서드를 제공합니다. Laravel 컬렉션에 대한 자세한 정보는 [컬렉션 문서](/docs/{{version}}/collections)를 확인하세요.

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### 테이블에서 단일 행 / 컬럼 조회

데이터베이스 테이블에서 단일 행만 조회해야 하는 경우 `DB` 파사드의 `first` 메서드를 사용할 수 있습니다. 이 메서드는 단일 `stdClass` 객체를 반환합니다.

    $user = DB::table('users')->where('name', 'John')->first();

    return $user->email;

전체 행이 필요하지 않은 경우 `value` 메서드를 사용하여 레코드에서 단일 값을 추출할 수 있습니다. 이 메서드는 컬럼의 값을 직접 반환합니다.

    $email = DB::table('users')->where('name', 'John')->value('email');

`id` 컬럼 값으로 단일 행을 조회하려면 `find` 메서드를 사용하세요.

    $user = DB::table('users')->find(3);

<a name="retrieving-a-list-of-column-values"></a>
#### 컬럼 값 목록 조회

단일 컬럼의 값을 포함하는 `Illuminate\Support\Collection` 인스턴스를 조회하려면 `pluck` 메서드를 사용할 수 있습니다. 이 예제에서는 사용자 타이틀의 컬렉션을 조회합니다.

    use Illuminate\Support\Facades\DB;

    $titles = DB::table('users')->pluck('title');

    foreach ($titles as $title) {
        echo $title;
    }

`pluck` 메서드에 두 번째 인수를 제공하여 결과 컬렉션에서 키로 사용할 컬럼을 지정할 수 있습니다.

    $titles = DB::table('users')->pluck('title', 'name');

    foreach ($titles as $name => $title) {
        echo $title;
    }

<a name="chunking-results"></a>
### 결과 청킹

수천 개의 데이터베이스 레코드를 다뤄야 하는 경우 `DB` 파사드가 제공하는 `chunk` 메서드 사용을 고려하세요. 이 메서드는 한 번에 작은 양의 결과를 조회하고 각 청크를 처리를 위해 클로저에 전달합니다. 예를 들어, 전체 `users` 테이블을 한 번에 100개의 레코드씩 청크로 조회해 보겠습니다.

    use Illuminate\Support\Collection;
    use Illuminate\Support\Facades\DB;

    DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
        foreach ($users as $user) {
            // ...
        }
    });

클로저에서 `false`를 반환하여 추가 청크 처리를 중지할 수 있습니다.

    DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
        // 레코드 처리...

        return false;
    });

결과를 청킹하면서 데이터베이스 레코드를 업데이트하는 경우 청크 결과가 예상치 못한 방식으로 변경될 수 있습니다. 청킹하면서 조회된 레코드를 업데이트할 계획이라면 항상 `chunkById` 메서드를 대신 사용하는 것이 좋습니다. 이 메서드는 레코드의 기본 키를 기반으로 결과를 자동으로 페이지네이션합니다.

    DB::table('users')->where('active', false)
        ->chunkById(100, function (Collection $users) {
            foreach ($users as $user) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['active' => true]);
            }
        });

> [!WARNING]
> 청크 콜백 내에서 레코드를 업데이트하거나 삭제할 때 기본 키 또는 외래 키에 대한 변경은 청크 쿼리에 영향을 줄 수 있습니다. 이로 인해 레코드가 청크 결과에 포함되지 않을 수 있습니다.

<a name="streaming-results-lazily"></a>
### 지연 스트리밍 결과

`lazy` 메서드는 청크로 쿼리를 실행한다는 점에서 [`chunk` 메서드](#chunking-results)와 유사하게 작동합니다. 그러나 각 청크를 콜백에 전달하는 대신 `lazy()` 메서드는 [`LazyCollection`](/docs/{{version}}/collections#lazy-collections)을 반환하여 결과를 단일 스트림으로 상호작용할 수 있게 해줍니다.

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

다시 말하지만, 조회된 레코드를 반복하면서 업데이트할 계획이라면 `lazyById` 또는 `lazyByIdDesc` 메서드를 대신 사용하는 것이 좋습니다. 이 메서드들은 레코드의 기본 키를 기반으로 결과를 자동으로 페이지네이션합니다.

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> [!WARNING]
> 레코드를 반복하면서 업데이트하거나 삭제할 때 기본 키 또는 외래 키에 대한 변경은 청크 쿼리에 영향을 줄 수 있습니다. 이로 인해 레코드가 결과에 포함되지 않을 수 있습니다.

<a name="aggregates"></a>
### 집계 함수

쿼리 빌더는 `count`, `max`, `min`, `avg`, `sum`과 같은 집계 값을 조회하기 위한 다양한 메서드도 제공합니다. 쿼리를 구성한 후 이러한 메서드 중 하나를 호출할 수 있습니다.

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')->count();

    $price = DB::table('orders')->max('price');

물론 이러한 메서드를 다른 절과 결합하여 집계 값이 계산되는 방식을 세밀하게 조정할 수 있습니다.

    $price = DB::table('orders')
        ->where('finalized', 1)
        ->avg('price');

<a name="determining-if-records-exist"></a>
#### 레코드 존재 여부 확인

`count` 메서드를 사용하여 쿼리의 제약 조건과 일치하는 레코드가 있는지 확인하는 대신 `exists`와 `doesntExist` 메서드를 사용할 수 있습니다.

    if (DB::table('orders')->where('finalized', 1)->exists()) {
        // ...
    }

    if (DB::table('orders')->where('finalized', 1)->doesntExist()) {
        // ...
    }

<a name="select-statements"></a>
## Select 구문

<a name="specifying-a-select-clause"></a>
#### Select 절 지정

데이터베이스 테이블에서 항상 모든 컬럼을 선택하고 싶지 않을 수 있습니다. `select` 메서드를 사용하면 쿼리에 대한 커스텀 "select" 절을 지정할 수 있습니다.

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')
        ->select('name', 'email as user_email')
        ->get();

`distinct` 메서드를 사용하면 쿼리가 중복 없는 결과를 반환하도록 강제할 수 있습니다.

    $users = DB::table('users')->distinct()->get();

이미 쿼리 빌더 인스턴스가 있고 기존 select 절에 컬럼을 추가하려면 `addSelect` 메서드를 사용할 수 있습니다.

    $query = DB::table('users')->select('name');

    $users = $query->addSelect('age')->get();

<a name="raw-expressions"></a>
## Raw 표현식

때로는 쿼리에 임의의 문자열을 삽입해야 할 수 있습니다. raw 문자열 표현식을 생성하려면 `DB` 파사드가 제공하는 `raw` 메서드를 사용할 수 있습니다.

    $users = DB::table('users')
        ->select(DB::raw('count(*) as user_count, status'))
        ->where('status', '<>', 1)
        ->groupBy('status')
        ->get();

> [!WARNING]
> Raw 구문은 문자열로 쿼리에 삽입되므로 SQL 인젝션 취약점을 만들지 않도록 매우 주의해야 합니다.

<a name="raw-methods"></a>
### Raw 메서드

`DB::raw` 메서드를 사용하는 대신 다음 메서드를 사용하여 쿼리의 다양한 부분에 raw 표현식을 삽입할 수도 있습니다. **Laravel은 raw 표현식을 사용하는 쿼리가 SQL 인젝션 취약점으로부터 보호된다고 보장할 수 없다는 점을 기억하세요.**

<a name="selectraw"></a>
#### `selectRaw`

`selectRaw` 메서드는 `addSelect(DB::raw(/* ... */))` 대신 사용할 수 있습니다. 이 메서드는 두 번째 인수로 선택적 바인딩 배열을 받습니다.

    $orders = DB::table('orders')
        ->selectRaw('price * ? as price_with_tax', [1.0825])
        ->get();

<a name="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

`whereRaw`와 `orWhereRaw` 메서드는 쿼리에 raw "where" 절을 삽입하는 데 사용할 수 있습니다. 이 메서드들은 두 번째 인수로 선택적 바인딩 배열을 받습니다.

    $orders = DB::table('orders')
        ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
        ->get();

<a name="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

`havingRaw`와 `orHavingRaw` 메서드는 "having" 절의 값으로 raw 문자열을 제공하는 데 사용할 수 있습니다. 이 메서드들은 두 번째 인수로 선택적 바인딩 배열을 받습니다.

    $orders = DB::table('orders')
        ->select('department', DB::raw('SUM(price) as total_sales'))
        ->groupBy('department')
        ->havingRaw('SUM(price) > ?', [2500])
        ->get();

<a name="orderbyraw"></a>
#### `orderByRaw`

`orderByRaw` 메서드는 "order by" 절의 값으로 raw 문자열을 제공하는 데 사용할 수 있습니다.

    $orders = DB::table('orders')
        ->orderByRaw('updated_at - created_at DESC')
        ->get();

<a name="groupbyraw"></a>
### `groupByRaw`

`groupByRaw` 메서드는 `group by` 절의 값으로 raw 문자열을 제공하는 데 사용할 수 있습니다.

    $orders = DB::table('orders')
        ->select('city', 'state')
        ->groupByRaw('city, state')
        ->get();

<a name="joins"></a>
## Joins

<a name="inner-join-clause"></a>
#### Inner Join 절

쿼리 빌더는 쿼리에 join 절을 추가하는 데도 사용할 수 있습니다. 기본 "inner join"을 수행하려면 쿼리 빌더 인스턴스에서 `join` 메서드를 사용할 수 있습니다. `join` 메서드에 전달되는 첫 번째 인수는 조인할 테이블의 이름이고, 나머지 인수는 조인에 대한 컬럼 제약 조건을 지정합니다. 단일 쿼리에서 여러 테이블을 조인할 수도 있습니다.

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')
        ->join('contacts', 'users.id', '=', 'contacts.user_id')
        ->join('orders', 'users.id', '=', 'orders.user_id')
        ->select('users.*', 'contacts.phone', 'orders.price')
        ->get();

<a name="left-join-right-join-clause"></a>
#### Left Join / Right Join 절

"inner join" 대신 "left join" 또는 "right join"을 수행하려면 `leftJoin` 또는 `rightJoin` 메서드를 사용하세요. 이 메서드들은 `join` 메서드와 동일한 시그니처를 가집니다.

    $users = DB::table('users')
        ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
        ->get();

    $users = DB::table('users')
        ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
        ->get();

<a name="cross-join-clause"></a>
#### Cross Join 절

`crossJoin` 메서드를 사용하여 "cross join"을 수행할 수 있습니다. Cross join은 첫 번째 테이블과 조인된 테이블 사이의 데카르트 곱을 생성합니다.

    $sizes = DB::table('sizes')
        ->crossJoin('colors')
        ->get();

<a name="advanced-join-clauses"></a>
#### 고급 Join 절

더 고급 join 절을 지정할 수도 있습니다. 시작하려면 `join` 메서드의 두 번째 인수로 클로저를 전달하세요. 클로저는 "join" 절에 제약 조건을 지정할 수 있는 `Illuminate\Database\Query\JoinClause` 인스턴스를 받습니다.

    DB::table('users')
        ->join('contacts', function (JoinClause $join) {
            $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
        })
        ->get();

조인에 "where" 절을 사용하려면 `JoinClause` 인스턴스가 제공하는 `where`와 `orWhere` 메서드를 사용할 수 있습니다. 이 메서드들은 두 컬럼을 비교하는 대신 컬럼을 값과 비교합니다.

    DB::table('users')
        ->join('contacts', function (JoinClause $join) {
            $join->on('users.id', '=', 'contacts.user_id')
                ->where('contacts.user_id', '>', 5);
        })
        ->get();

<a name="subquery-joins"></a>
#### 서브쿼리 Joins

`joinSub`, `leftJoinSub`, `rightJoinSub` 메서드를 사용하여 쿼리를 서브쿼리에 조인할 수 있습니다. 이 메서드들은 각각 서브쿼리, 테이블 별칭, 관련 컬럼을 정의하는 클로저의 세 가지 인수를 받습니다. 이 예제에서는 각 사용자 레코드에 사용자의 가장 최근에 게시된 블로그 포스트의 `created_at` 타임스탬프가 포함된 사용자 컬렉션을 조회합니다.

    $latestPosts = DB::table('posts')
        ->select('user_id', DB::raw('MAX(created_at) as last_post_created_at'))
        ->where('is_published', true)
        ->groupBy('user_id');

    $users = DB::table('users')
        ->joinSub($latestPosts, 'latest_posts', function (JoinClause $join) {
            $join->on('users.id', '=', 'latest_posts.user_id');
        })->get();

<a name="lateral-joins"></a>
#### Lateral Joins

> [!WARNING]
> Lateral join은 현재 PostgreSQL, MySQL >= 8.0.14, SQL Server에서 지원됩니다.

`joinLateral`과 `leftJoinLateral` 메서드를 사용하여 서브쿼리와 "lateral join"을 수행할 수 있습니다. 이 메서드들은 각각 서브쿼리와 테이블 별칭의 두 가지 인수를 받습니다. 조인 조건은 주어진 서브쿼리의 `where` 절 내에서 지정해야 합니다. Lateral join은 각 행에 대해 평가되며 서브쿼리 외부의 컬럼을 참조할 수 있습니다.

이 예제에서는 사용자 컬렉션과 사용자의 가장 최근 세 개의 블로그 포스트를 조회합니다. 각 사용자는 결과 세트에서 최대 세 개의 행을 생성할 수 있습니다. 하나는 가장 최근 블로그 포스트 각각에 해당합니다. 조인 조건은 현재 사용자 행을 참조하는 서브쿼리 내의 `whereColumn` 절로 지정됩니다.

    $latestPosts = DB::table('posts')
        ->select('id as post_id', 'title as post_title', 'created_at as post_created_at')
        ->whereColumn('user_id', 'users.id')
        ->orderBy('created_at', 'desc')
        ->limit(3);

    $users = DB::table('users')
        ->joinLateral($latestPosts, 'latest_posts')
        ->get();

<a name="unions"></a>
## Unions

쿼리 빌더는 두 개 이상의 쿼리를 "union"하는 편리한 메서드도 제공합니다. 예를 들어, 초기 쿼리를 생성하고 `union` 메서드를 사용하여 더 많은 쿼리와 union할 수 있습니다.

    use Illuminate\Support\Facades\DB;

    $first = DB::table('users')
        ->whereNull('first_name');

    $users = DB::table('users')
        ->whereNull('last_name')
        ->union($first)
        ->get();

`union` 메서드 외에도 쿼리 빌더는 `unionAll` 메서드를 제공합니다. `unionAll` 메서드를 사용하여 결합된 쿼리는 중복 결과가 제거되지 않습니다. `unionAll` 메서드는 `union` 메서드와 동일한 메서드 시그니처를 가집니다.

<a name="basic-where-clauses"></a>
## 기본 Where 절

<a name="where-clauses"></a>
### Where 절

쿼리 빌더의 `where` 메서드를 사용하여 쿼리에 "where" 절을 추가할 수 있습니다. `where` 메서드에 대한 가장 기본적인 호출에는 세 가지 인수가 필요합니다. 첫 번째 인수는 컬럼 이름입니다. 두 번째 인수는 데이터베이스에서 지원하는 연산자 중 하나일 수 있습니다. 세 번째 인수는 컬럼의 값과 비교할 값입니다.

예를 들어, 다음 쿼리는 `votes` 컬럼의 값이 `100`과 같고 `age` 컬럼의 값이 `35`보다 큰 사용자를 조회합니다.

    $users = DB::table('users')
        ->where('votes', '=', 100)
        ->where('age', '>', 35)
        ->get();

편의상 컬럼이 주어진 값과 `=`인지 확인하려면 `where` 메서드의 두 번째 인수로 값을 전달할 수 있습니다. Laravel은 `=` 연산자를 사용한다고 가정합니다.

    $users = DB::table('users')->where('votes', 100)->get();

앞서 언급했듯이 데이터베이스 시스템에서 지원하는 모든 연산자를 사용할 수 있습니다.

    $users = DB::table('users')
        ->where('votes', '>=', 100)
        ->get();

    $users = DB::table('users')
        ->where('votes', '<>', 100)
        ->get();

    $users = DB::table('users')
        ->where('name', 'like', 'T%')
        ->get();

`where` 함수에 조건 배열을 전달할 수도 있습니다. 배열의 각 요소는 일반적으로 `where` 메서드에 전달되는 세 가지 인수를 포함하는 배열이어야 합니다.

    $users = DB::table('users')->where([
        ['status', '=', '1'],
        ['subscribed', '<>', '1'],
    ])->get();

> [!WARNING]
> PDO는 컬럼 이름 바인딩을 지원하지 않습니다. 따라서 "order by" 컬럼을 포함하여 쿼리에서 참조하는 컬럼 이름이 사용자 입력에 의해 결정되도록 허용해서는 안 됩니다.

<a name="or-where-clauses"></a>
### Or Where 절

쿼리 빌더의 `where` 메서드 호출을 체이닝할 때 "where" 절은 `and` 연산자를 사용하여 결합됩니다. 그러나 `orWhere` 메서드를 사용하여 `or` 연산자로 절을 쿼리에 결합할 수 있습니다. `orWhere` 메서드는 `where` 메서드와 동일한 인수를 받습니다.

    $users = DB::table('users')
        ->where('votes', '>', 100)
        ->orWhere('name', 'John')
        ->get();

"or" 조건을 괄호 안에 그룹화해야 하는 경우 `orWhere` 메서드의 첫 번째 인수로 클로저를 전달할 수 있습니다.

    $users = DB::table('users')
        ->where('votes', '>', 100)
        ->orWhere(function (Builder $query) {
            $query->where('name', 'Abigail')
                ->where('votes', '>', 50);
            })
        ->get();

위의 예제는 다음 SQL을 생성합니다.

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> [!WARNING]
> 글로벌 스코프가 적용될 때 예기치 않은 동작을 방지하려면 항상 `orWhere` 호출을 그룹화해야 합니다.

<a name="where-not-clauses"></a>
### Where Not 절

`whereNot`과 `orWhereNot` 메서드는 주어진 쿼리 제약 조건 그룹을 부정하는 데 사용할 수 있습니다. 예를 들어, 다음 쿼리는 세일 중이거나 가격이 10 미만인 제품을 제외합니다.

    $products = DB::table('products')
        ->whereNot(function (Builder $query) {
            $query->where('clearance', true)
                ->orWhere('price', '<', 10);
            })
        ->get();

<a name="where-any-all-clauses"></a>
### Where Any / All 절

때로는 동일한 쿼리 제약 조건을 여러 컬럼에 적용해야 할 수 있습니다. 예를 들어, 주어진 목록의 모든 컬럼이 주어진 값과 `LIKE` 일치하는 모든 레코드를 조회하고 싶을 수 있습니다. `whereAny` 메서드를 사용하여 이를 수행할 수 있습니다.

    $users = DB::table('users')
        ->where('active', true)
        ->whereAny([
            'name',
            'email',
            'phone',
        ], 'LIKE', 'Example%')
        ->get();

위의 쿼리는 다음 SQL을 생성합니다.

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

마찬가지로 `whereAll` 메서드를 사용하여 주어진 모든 컬럼이 주어진 제약 조건과 일치하는 레코드를 조회할 수 있습니다.

    $posts = DB::table('posts')
        ->where('published', true)
        ->whereAll([
            'title',
            'content',
        ], 'LIKE', '%Laravel%')
        ->get();

위의 쿼리는 다음 SQL을 생성합니다.

```sql
SELECT *
FROM posts
WHERE published = true AND (
    title LIKE '%Laravel%' AND
    content LIKE '%Laravel%'
)
```

<a name="json-where-clauses"></a>
### JSON Where 절

Laravel은 JSON 컬럼 타입을 지원하는 데이터베이스에서 JSON 컬럼 타입 쿼리도 지원합니다. 현재 MySQL 5.7+, PostgreSQL, SQL Server 2016, SQLite 3.39.0 ([JSON1 확장](https://www.sqlite.org/json1.html) 포함)이 포함됩니다. JSON 컬럼을 쿼리하려면 `->` 연산자를 사용하세요.

    $users = DB::table('users')
        ->where('preferences->dining->meal', 'salad')
        ->get();

`whereJsonContains`를 사용하여 JSON 배열을 쿼리할 수 있습니다.

    $users = DB::table('users')
        ->whereJsonContains('options->languages', 'en')
        ->get();

애플리케이션이 MySQL 또는 PostgreSQL 데이터베이스를 사용하는 경우 `whereJsonContains` 메서드에 값 배열을 전달할 수 있습니다.

    $users = DB::table('users')
        ->whereJsonContains('options->languages', ['en', 'de'])
        ->get();

`whereJsonLength` 메서드를 사용하여 JSON 배열을 길이로 쿼리할 수 있습니다.

    $users = DB::table('users')
        ->whereJsonLength('options->languages', 0)
        ->get();

    $users = DB::table('users')
        ->whereJsonLength('options->languages', '>', 1)
        ->get();

<a name="additional-where-clauses"></a>
### 추가 Where 절

**whereBetween / orWhereBetween**

`whereBetween` 메서드는 컬럼의 값이 두 값 사이에 있는지 확인합니다.

    $users = DB::table('users')
        ->whereBetween('votes', [1, 100])
        ->get();

**whereNotBetween / orWhereNotBetween**

`whereNotBetween` 메서드는 컬럼의 값이 두 값의 범위 밖에 있는지 확인합니다.

    $users = DB::table('users')
        ->whereNotBetween('votes', [1, 100])
        ->get();

**whereBetweenColumns / whereNotBetweenColumns / orWhereBetweenColumns / orWhereNotBetweenColumns**

`whereBetweenColumns` 메서드는 컬럼의 값이 동일한 테이블 행에 있는 두 컬럼의 값 사이에 있는지 확인합니다.

    $patients = DB::table('patients')
        ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
        ->get();

`whereNotBetweenColumns` 메서드는 컬럼의 값이 동일한 테이블 행에 있는 두 컬럼의 값 범위 밖에 있는지 확인합니다.

    $patients = DB::table('patients')
        ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
        ->get();

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

`whereIn` 메서드는 주어진 컬럼의 값이 주어진 배열에 포함되어 있는지 확인합니다.

    $users = DB::table('users')
        ->whereIn('id', [1, 2, 3])
        ->get();

`whereNotIn` 메서드는 주어진 컬럼의 값이 주어진 배열에 포함되어 있지 않은지 확인합니다.

    $users = DB::table('users')
        ->whereNotIn('id', [1, 2, 3])
        ->get();

`whereIn` 메서드의 두 번째 인수로 쿼리 객체를 제공할 수도 있습니다.

    $activeUsers = DB::table('users')->select('id')->where('is_active', 1);

    $users = DB::table('comments')
        ->whereIn('user_id', $activeUsers)
        ->get();

위의 예제는 다음 SQL을 생성합니다.

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> [!WARNING]
> 쿼리에 큰 정수 바인딩 배열을 추가하는 경우 `whereIntegerInRaw` 또는 `whereIntegerNotInRaw` 메서드를 사용하여 메모리 사용량을 크게 줄일 수 있습니다.

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

`whereNull` 메서드는 주어진 컬럼의 값이 `NULL`인지 확인합니다.

    $users = DB::table('users')
        ->whereNull('updated_at')
        ->get();

`whereNotNull` 메서드는 컬럼의 값이 `NULL`이 아닌지 확인합니다.

    $users = DB::table('users')
        ->whereNotNull('updated_at')
        ->get();

**whereDate / whereMonth / whereDay / whereYear / whereTime**

`whereDate` 메서드는 컬럼의 값을 날짜와 비교하는 데 사용할 수 있습니다.

    $users = DB::table('users')
        ->whereDate('created_at', '2016-12-31')
        ->get();

`whereMonth` 메서드는 컬럼의 값을 특정 월과 비교하는 데 사용할 수 있습니다.

    $users = DB::table('users')
        ->whereMonth('created_at', '12')
        ->get();

`whereDay` 메서드는 컬럼의 값을 해당 월의 특정 일과 비교하는 데 사용할 수 있습니다.

    $users = DB::table('users')
        ->whereDay('created_at', '31')
        ->get();

`whereYear` 메서드는 컬럼의 값을 특정 연도와 비교하는 데 사용할 수 있습니다.

    $users = DB::table('users')
        ->whereYear('created_at', '2016')
        ->get();

`whereTime` 메서드는 컬럼의 값을 특정 시간과 비교하는 데 사용할 수 있습니다.

    $users = DB::table('users')
        ->whereTime('created_at', '=', '11:20:45')
        ->get();

**whereColumn / orWhereColumn**

`whereColumn` 메서드는 두 컬럼이 같은지 확인하는 데 사용할 수 있습니다.

    $users = DB::table('users')
        ->whereColumn('first_name', 'last_name')
        ->get();

`whereColumn` 메서드에 비교 연산자를 전달할 수도 있습니다.

    $users = DB::table('users')
        ->whereColumn('updated_at', '>', 'created_at')
        ->get();

`whereColumn` 메서드에 컬럼 비교 배열을 전달할 수도 있습니다. 이러한 조건은 `and` 연산자를 사용하여 결합됩니다.

    $users = DB::table('users')
        ->whereColumn([
            ['first_name', '=', 'last_name'],
            ['updated_at', '>', 'created_at'],
        ])->get();

<a name="logical-grouping"></a>
### 논리적 그룹화

때로는 쿼리의 원하는 논리적 그룹화를 달성하기 위해 괄호 내에 여러 "where" 절을 그룹화해야 할 수 있습니다. 실제로 예기치 않은 쿼리 동작을 방지하기 위해 `orWhere` 메서드 호출을 항상 괄호로 그룹화해야 합니다. 이를 수행하려면 `where` 메서드에 클로저를 전달하면 됩니다.

    $users = DB::table('users')
        ->where('name', '=', 'John')
        ->where(function (Builder $query) {
            $query->where('votes', '>', 100)
                ->orWhere('title', '=', 'Admin');
        })
        ->get();

보시다시피 `where` 메서드에 클로저를 전달하면 쿼리 빌더가 제약 조건 그룹을 시작하도록 지시합니다. 클로저는 괄호 그룹 내에 포함되어야 하는 제약 조건을 설정하는 데 사용할 수 있는 쿼리 빌더 인스턴스를 받습니다. 위의 예제는 다음 SQL을 생성합니다.

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> [!WARNING]
> 글로벌 스코프가 적용될 때 예기치 않은 동작을 방지하려면 항상 `orWhere` 호출을 그룹화해야 합니다.

<a name="advanced-where-clauses"></a>
### 고급 Where 절

<a name="where-exists-clauses"></a>
### Where Exists 절

`whereExists` 메서드를 사용하면 "where exists" SQL 절을 작성할 수 있습니다. `whereExists` 메서드는 "exists" 절 내에 배치할 쿼리를 정의할 수 있는 쿼리 빌더 인스턴스를 받는 클로저를 받습니다.

    $users = DB::table('users')
        ->whereExists(function (Builder $query) {
            $query->select(DB::raw(1))
                ->from('orders')
                ->whereColumn('orders.user_id', 'users.id');
        })
        ->get();

또는 클로저 대신 쿼리 객체를 `whereExists` 메서드에 제공할 수 있습니다.

    $orders = DB::table('orders')
        ->select(DB::raw(1))
        ->whereColumn('orders.user_id', 'users.id');

    $users = DB::table('users')
        ->whereExists($orders)
        ->get();

위의 두 예제 모두 다음 SQL을 생성합니다.

```sql
select * from users
where exists (
    select 1
    from orders
    where orders.user_id = users.id
)
```

<a name="subquery-where-clauses"></a>
### 서브쿼리 Where 절

때로는 서브쿼리의 결과를 주어진 값과 비교하는 "where" 절을 구성해야 할 수 있습니다. `where` 메서드에 클로저와 값을 전달하여 이를 수행할 수 있습니다. 예를 들어, 다음 쿼리는 주어진 타입의 최근 "membership"이 있는 모든 사용자를 조회합니다.

    use App\Models\User;
    use Illuminate\Database\Query\Builder;

    $users = User::where(function (Builder $query) {
        $query->select('type')
            ->from('membership')
            ->whereColumn('membership.user_id', 'users.id')
            ->orderByDesc('membership.start_date')
            ->limit(1);
    }, 'Pro')->get();

또는 컬럼을 서브쿼리의 결과와 비교하는 "where" 절을 구성해야 할 수 있습니다. `where` 메서드에 컬럼, 연산자, 클로저를 전달하여 이를 수행할 수 있습니다. 예를 들어, 다음 쿼리는 금액이 평균보다 작은 모든 수입 레코드를 조회합니다.

    use App\Models\Income;
    use Illuminate\Database\Query\Builder;

    $incomes = Income::where('amount', '<', function (Builder $query) {
        $query->selectRaw('avg(i.amount)')->from('incomes as i');
    })->get();

<a name="full-text-where-clauses"></a>
### 전문 검색 Where 절

> [!WARNING]
> 전문 검색 where 절은 현재 MySQL과 PostgreSQL에서 지원됩니다.

`whereFullText`와 `orWhereFullText` 메서드는 [전문 인덱스](/docs/{{version}}/migrations#available-index-types)가 있는 컬럼에 대해 전문 검색 "where" 절을 쿼리에 추가하는 데 사용할 수 있습니다. 이 메서드들은 Laravel에 의해 기본 데이터베이스 시스템에 적합한 SQL로 변환됩니다. 예를 들어, MySQL을 사용하는 애플리케이션의 경우 `MATCH AGAINST` 절이 생성됩니다.

    $users = DB::table('users')
        ->whereFullText('bio', 'web developer')
        ->get();

<a name="ordering-grouping-limit-and-offset"></a>
## 정렬, 그룹화, Limit 및 Offset

<a name="ordering"></a>
### 정렬

<a name="orderby"></a>
#### `orderBy` 메서드

`orderBy` 메서드를 사용하면 주어진 컬럼을 기준으로 쿼리 결과를 정렬할 수 있습니다. `orderBy` 메서드가 받는 첫 번째 인수는 정렬할 컬럼이고, 두 번째 인수는 정렬 방향을 결정하며 `asc` 또는 `desc`일 수 있습니다.

    $users = DB::table('users')
        ->orderBy('name', 'desc')
        ->get();

여러 컬럼으로 정렬하려면 필요한 만큼 `orderBy`를 호출하면 됩니다.

    $users = DB::table('users')
        ->orderBy('name', 'desc')
        ->orderBy('email', 'asc')
        ->get();

<a name="latest-oldest"></a>
#### `latest`와 `oldest` 메서드

`latest`와 `oldest` 메서드를 사용하면 날짜로 결과를 쉽게 정렬할 수 있습니다. 기본적으로 결과는 테이블의 `created_at` 컬럼으로 정렬됩니다. 또는 정렬하려는 컬럼 이름을 전달할 수 있습니다.

    $user = DB::table('users')
        ->latest()
        ->first();

<a name="random-ordering"></a>
#### 무작위 정렬

`inRandomOrder` 메서드를 사용하면 쿼리 결과를 무작위로 정렬할 수 있습니다. 예를 들어, 이 메서드를 사용하여 무작위 사용자를 가져올 수 있습니다.

    $randomUser = DB::table('users')
        ->inRandomOrder()
        ->first();

<a name="removing-existing-orderings"></a>
#### 기존 정렬 제거

`reorder` 메서드는 이전에 쿼리에 적용된 모든 "order by" 절을 제거합니다.

    $query = DB::table('users')->orderBy('name');

    $unorderedUsers = $query->reorder()->get();

`reorder` 메서드를 호출할 때 컬럼과 방향을 전달하여 기존의 모든 "order by" 절을 제거하고 완전히 새로운 정렬을 쿼리에 적용할 수 있습니다.

    $query = DB::table('users')->orderBy('name');

    $usersOrderedByEmail = $query->reorder('email', 'desc')->get();

<a name="grouping"></a>
### 그룹화

<a name="groupby-having"></a>
#### `groupBy`와 `having` 메서드

예상대로 `groupBy`와 `having` 메서드를 사용하여 쿼리 결과를 그룹화할 수 있습니다. `having` 메서드의 시그니처는 `where` 메서드와 유사합니다.

    $users = DB::table('users')
        ->groupBy('account_id')
        ->having('account_id', '>', 100)
        ->get();

`havingBetween` 메서드를 사용하여 주어진 범위 내에서 결과를 필터링할 수 있습니다.

    $report = DB::table('orders')
        ->selectRaw('count(id) as number_of_orders, customer_id')
        ->groupBy('customer_id')
        ->havingBetween('number_of_orders', [5, 15])
        ->get();

`groupBy` 메서드에 여러 인수를 전달하여 여러 컬럼으로 그룹화할 수 있습니다.

    $users = DB::table('users')
        ->groupBy('first_name', 'status')
        ->having('account_id', '>', 100)
        ->get();

더 고급 `having` 구문을 작성하려면 [`havingRaw`](#raw-methods) 메서드를 참조하세요.

<a name="limit-and-offset"></a>
### Limit 및 Offset

<a name="skip-take"></a>
#### `skip`과 `take` 메서드

`skip`과 `take` 메서드를 사용하여 쿼리에서 반환되는 결과 수를 제한하거나 쿼리에서 주어진 수의 결과를 건너뛸 수 있습니다.

    $users = DB::table('users')->skip(10)->take(5)->get();

또는 `limit`과 `offset` 메서드를 사용할 수 있습니다. 이 메서드들은 각각 `take`와 `skip` 메서드와 기능적으로 동일합니다.

    $users = DB::table('users')
        ->offset(10)
        ->limit(5)
        ->get();

<a name="conditional-clauses"></a>
## 조건부 절

때로는 다른 조건에 따라 특정 쿼리 절이 쿼리에 적용되기를 원할 수 있습니다. 예를 들어, 들어오는 HTTP 요청에 주어진 입력 값이 있는 경우에만 `where` 구문을 적용하고 싶을 수 있습니다. `when` 메서드를 사용하여 이를 수행할 수 있습니다.

    $role = $request->string('role');

    $users = DB::table('users')
        ->when($role, function (Builder $query, string $role) {
            $query->where('role_id', $role);
        })
        ->get();

`when` 메서드는 첫 번째 인수가 `true`일 때만 주어진 클로저를 실행합니다. 첫 번째 인수가 `false`이면 클로저가 실행되지 않습니다. 따라서 위의 예제에서 `when` 메서드에 주어진 클로저는 `role` 필드가 들어오는 요청에 있고 `true`로 평가되는 경우에만 호출됩니다.

`when` 메서드의 세 번째 인수로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 첫 번째 인수가 `false`로 평가되는 경우에만 실행됩니다. 이 기능을 어떻게 사용할 수 있는지 설명하기 위해 쿼리의 기본 정렬을 구성하는 데 사용해 보겠습니다.

    $sortByVotes = $request->boolean('sort_by_votes');

    $users = DB::table('users')
        ->when($sortByVotes, function (Builder $query, bool $sortByVotes) {
            $query->orderBy('votes');
        }, function (Builder $query) {
            $query->orderBy('name');
        })
        ->get();

<a name="insert-statements"></a>
## Insert 구문

쿼리 빌더는 데이터베이스 테이블에 레코드를 삽입하는 데 사용할 수 있는 `insert` 메서드도 제공합니다. `insert` 메서드는 컬럼 이름과 값의 배열을 받습니다.

    DB::table('users')->insert([
        'email' => 'kayla@example.com',
        'votes' => 0
    ]);

배열의 배열을 전달하여 여러 레코드를 한 번에 삽입할 수 있습니다. 각 배열은 테이블에 삽입되어야 하는 레코드를 나타냅니다.

    DB::table('users')->insert([
        ['email' => 'picard@example.com', 'votes' => 0],
        ['email' => 'janeway@example.com', 'votes' => 0],
    ]);

`insertOrIgnore` 메서드는 데이터베이스에 레코드를 삽입하는 동안 오류를 무시합니다. 이 메서드를 사용할 때 중복 레코드 오류는 무시되며 데이터베이스 엔진에 따라 다른 유형의 오류도 무시될 수 있습니다. 예를 들어, `insertOrIgnore`는 [MySQL의 strict 모드를 우회](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution)합니다.

    DB::table('users')->insertOrIgnore([
        ['id' => 1, 'email' => 'sisko@example.com'],
        ['id' => 2, 'email' => 'archer@example.com'],
    ]);

`insertUsing` 메서드는 서브쿼리를 사용하여 삽입할 데이터를 결정하면서 테이블에 새 레코드를 삽입합니다.

    DB::table('pruned_users')->insertUsing([
        'id', 'name', 'email', 'email_verified_at'
    ], DB::table('users')->select(
        'id', 'name', 'email', 'email_verified_at'
    )->where('updated_at', '<=', now()->subMonth()));

<a name="auto-incrementing-ids"></a>
#### 자동 증가 ID

테이블에 자동 증가 id가 있는 경우 `insertGetId` 메서드를 사용하여 레코드를 삽입한 다음 ID를 조회합니다.

    $id = DB::table('users')->insertGetId(
        ['email' => 'john@example.com', 'votes' => 0]
    );

> [!WARNING]
> PostgreSQL을 사용할 때 `insertGetId` 메서드는 자동 증가 컬럼의 이름이 `id`일 것으로 예상합니다. 다른 "시퀀스"에서 ID를 조회하려면 `insertGetId` 메서드의 두 번째 매개변수로 컬럼 이름을 전달하면 됩니다.

<a name="upserts"></a>
### Upserts

`upsert` 메서드는 존재하지 않는 레코드를 삽입하고 이미 존재하는 레코드를 지정할 수 있는 새 값으로 업데이트합니다. 메서드의 첫 번째 인수는 삽입하거나 업데이트할 값으로 구성되고, 두 번째 인수는 연관 테이블 내에서 레코드를 고유하게 식별하는 컬럼을 나열합니다. 메서드의 세 번째이자 마지막 인수는 일치하는 레코드가 이미 데이터베이스에 존재하는 경우 업데이트해야 하는 컬럼의 배열입니다.

    DB::table('flights')->upsert(
        [
            ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
            ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
        ],
        ['departure', 'destination'],
        ['price']
    );

위의 예제에서 Laravel은 두 개의 레코드를 삽입하려고 시도합니다. 동일한 `departure`와 `destination` 컬럼 값을 가진 레코드가 이미 존재하면 Laravel은 해당 레코드의 `price` 컬럼을 업데이트합니다.

> [!WARNING]
> SQL Server를 제외한 모든 데이터베이스는 `upsert` 메서드의 두 번째 인수에 있는 컬럼에 "primary" 또는 "unique" 인덱스가 있어야 합니다. 또한 MySQL 데이터베이스 드라이버는 `upsert` 메서드의 두 번째 인수를 무시하고 항상 테이블의 "primary" 및 "unique" 인덱스를 사용하여 기존 레코드를 감지합니다.

<a name="update-statements"></a>
## Update 구문

데이터베이스에 레코드를 삽입하는 것 외에도 쿼리 빌더는 `update` 메서드를 사용하여 기존 레코드를 업데이트할 수도 있습니다. `update` 메서드는 `insert` 메서드와 마찬가지로 업데이트할 컬럼을 나타내는 컬럼과 값 쌍의 배열을 받습니다. `update` 메서드는 영향받은 행 수를 반환합니다. `where` 절을 사용하여 `update` 쿼리를 제한할 수 있습니다.

    $affected = DB::table('users')
        ->where('id', 1)
        ->update(['votes' => 1]);

<a name="update-or-insert"></a>
#### Update 또는 Insert

때로는 데이터베이스의 기존 레코드를 업데이트하거나 일치하는 레코드가 없으면 생성하고 싶을 수 있습니다. 이 시나리오에서는 `updateOrInsert` 메서드를 사용할 수 있습니다. `updateOrInsert` 메서드는 두 가지 인수를 받습니다: 레코드를 찾기 위한 조건 배열과 업데이트할 컬럼과 값 쌍을 나타내는 배열.

`updateOrInsert` 메서드는 첫 번째 인수의 컬럼과 값 쌍을 사용하여 일치하는 데이터베이스 레코드를 찾으려고 시도합니다. 레코드가 존재하면 두 번째 인수의 값으로 업데이트됩니다. 레코드를 찾을 수 없으면 두 인수의 병합된 속성으로 새 레코드가 삽입됩니다.

    DB::table('users')
        ->updateOrInsert(
            ['email' => 'john@example.com', 'name' => 'John'],
            ['votes' => '2']
        );

<a name="updating-json-columns"></a>
### JSON 컬럼 업데이트

JSON 컬럼을 업데이트할 때 `->` 구문을 사용하여 JSON 객체의 적절한 키를 업데이트해야 합니다. 이 작업은 MySQL 5.7+와 PostgreSQL 9.5+에서 지원됩니다.

    $affected = DB::table('users')
        ->where('id', 1)
        ->update(['options->enabled' => true]);

<a name="increment-and-decrement"></a>
### 증가 및 감소

쿼리 빌더는 주어진 컬럼의 값을 증가시키거나 감소시키는 편리한 메서드도 제공합니다. 이 메서드들은 최소한 수정할 컬럼 하나의 인수를 받습니다. 컬럼을 증가시키거나 감소시킬 양을 지정하기 위해 두 번째 인수를 제공할 수 있습니다.

    DB::table('users')->increment('votes');

    DB::table('users')->increment('votes', 5);

    DB::table('users')->decrement('votes');

    DB::table('users')->decrement('votes', 5);

필요한 경우 증가 또는 감소 작업 중에 업데이트할 추가 컬럼을 지정할 수도 있습니다.

    DB::table('users')->increment('votes', 1, ['name' => 'John']);

또한 `incrementEach`와 `decrementEach` 메서드를 사용하여 한 번에 여러 컬럼을 증가시키거나 감소시킬 수 있습니다.

    DB::table('users')->incrementEach([
        'votes' => 5,
        'balance' => 100,
    ]);

<a name="delete-statements"></a>
## Delete 구문

쿼리 빌더의 `delete` 메서드를 사용하여 테이블에서 레코드를 삭제할 수 있습니다. `delete` 메서드는 영향받은 행 수를 반환합니다. `delete` 메서드를 호출하기 전에 "where" 절을 추가하여 `delete` 구문을 제한할 수 있습니다.

    $deleted = DB::table('users')->delete();

    $deleted = DB::table('users')->where('votes', '>', 100)->delete();

전체 테이블을 truncate하여 테이블의 모든 레코드를 제거하고 자동 증가 ID를 0으로 리셋하려면 `truncate` 메서드를 사용할 수 있습니다.

    DB::table('users')->truncate();

<a name="table-truncation-and-postgresql"></a>
#### 테이블 Truncation과 PostgreSQL

PostgreSQL 데이터베이스를 truncate할 때 `CASCADE` 동작이 적용됩니다. 이는 다른 테이블의 모든 외래 키 관련 레코드도 삭제된다는 것을 의미합니다.

<a name="pessimistic-locking"></a>
## 비관적 잠금(Pessimistic Locking)

쿼리 빌더는 `select` 구문을 실행할 때 "비관적 잠금"을 달성하는 데 도움이 되는 몇 가지 함수도 포함하고 있습니다. "공유 잠금"으로 구문을 실행하려면 `sharedLock` 메서드를 호출하면 됩니다. 공유 잠금은 트랜잭션이 커밋될 때까지 선택된 행이 수정되는 것을 방지합니다.

    DB::table('users')
        ->where('votes', '>', 100)
        ->sharedLock()
        ->get();

또는 `lockForUpdate` 메서드를 사용할 수 있습니다. "for update" 잠금은 선택된 레코드가 수정되거나 다른 공유 잠금으로 선택되는 것을 방지합니다.

    DB::table('users')
        ->where('votes', '>', 100)
        ->lockForUpdate()
        ->get();

<a name="debugging"></a>
## 디버깅

쿼리를 작성하는 동안 `dd`와 `dump` 메서드를 사용하여 현재 쿼리 바인딩과 SQL을 덤프할 수 있습니다. `dd` 메서드는 디버그 정보를 표시한 다음 요청 실행을 중지합니다. `dump` 메서드는 디버그 정보를 표시하지만 요청이 계속 실행되도록 합니다.

    DB::table('users')->where('votes', '>', 100)->dd();

    DB::table('users')->where('votes', '>', 100)->dump();

`dumpRawSql`과 `ddRawSql` 메서드를 쿼리에서 호출하여 모든 파라미터 바인딩이 적절히 대체된 쿼리의 SQL을 덤프할 수 있습니다.

    DB::table('users')->where('votes', '>', 100)->dumpRawSql();

    DB::table('users')->where('votes', '>', 100)->ddRawSql();

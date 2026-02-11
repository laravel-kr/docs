# 컬렉션(Collections)

- [소개](#introduction)
    - [컬렉션 생성하기](#creating-collections)
    - [컬렉션 확장하기](#extending-collections)
- [사용 가능한 메서드](#available-methods)
- [Higher Order 메시지](#higher-order-messages)
- [지연 컬렉션](#lazy-collections)
    - [소개](#lazy-collection-introduction)
    - [지연 컬렉션 생성하기](#creating-lazy-collections)
    - [Enumerable Contract](#the-enumerable-contract)
    - [지연 컬렉션 메서드](#lazy-collection-methods)

<a name="introduction"></a>
## 소개

`Illuminate\Support\Collection` 클래스는 배열 데이터를 다루기 위한 유연하고 편리한 래퍼(wrapper)를 제공합니다. 예를 들어, 다음 코드를 살펴보세요. `collect` 헬퍼를 사용하여 배열에서 새 컬렉션 인스턴스를 생성하고, 각 요소에 `strtoupper` 함수를 실행한 다음, 모든 빈 요소를 제거합니다:

```php
$collection = collect(['Taylor', 'Abigail', null])->map(function (?string $name) {
    return strtoupper($name);
})->reject(function (string $name) {
    return empty($name);
});
```

보시다시피, `Collection` 클래스는 메서드를 체이닝하여 기본 배열의 유연한 맵핑과 리듀싱을 수행할 수 있습니다. 일반적으로 컬렉션은 불변(immutable)이며, 모든 `Collection` 메서드는 완전히 새로운 `Collection` 인스턴스를 반환합니다.

<a name="creating-collections"></a>
### 컬렉션 생성하기

위에서 언급한 것처럼, `collect` 헬퍼는 주어진 배열에 대해 새로운 `Illuminate\Support\Collection` 인스턴스를 반환합니다. 따라서 컬렉션을 생성하는 것은 다음과 같이 간단합니다:

```php
$collection = collect([1, 2, 3]);
```

> [!NOTE]
> [Eloquent](/docs/{{version}}/eloquent) 쿼리의 결과는 항상 `Collection` 인스턴스로 반환됩니다.

<a name="extending-collections"></a>
### 컬렉션 확장하기

컬렉션은 "macroable"하므로, 런타임에 `Collection` 클래스에 추가 메서드를 추가할 수 있습니다. `Illuminate\Support\Collection` 클래스의 `macro` 메서드는 매크로가 호출될 때 실행될 클로저를 받습니다. 매크로 클로저는 컬렉션 클래스의 실제 메서드인 것처럼 `$this`를 통해 컬렉션의 다른 메서드에 접근할 수 있습니다. 예를 들어, 다음 코드는 `Collection` 클래스에 `toUpper` 메서드를 추가합니다:

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

Collection::macro('toUpper', function () {
    return $this->map(function (string $value) {
        return Str::upper($value);
    });
});

$collection = collect(['first', 'second']);

$upper = $collection->toUpper();

// ['FIRST', 'SECOND']
```

일반적으로 컬렉션 매크로는 [서비스 프로바이더](/docs/{{version}}/providers)의 `boot` 메서드에서 선언해야 합니다.

<a name="macro-arguments"></a>
#### 매크로 인수

필요한 경우, 추가 인수를 받는 매크로를 정의할 수 있습니다:

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Lang;

Collection::macro('toLocale', function (string $locale) {
    return $this->map(function (string $value) use ($locale) {
        return Lang::get($value, [], $locale);
    });
});

$collection = collect(['first', 'second']);

$translated = $collection->toLocale('es');

// ['primero', 'segundo'];
```

<a name="available-methods"></a>
## 사용 가능한 메서드

나머지 컬렉션 문서의 대부분에서, `Collection` 클래스에서 사용 가능한 각 메서드를 설명합니다. 이 모든 메서드는 기본 배열을 유연하게 조작하기 위해 체이닝할 수 있습니다. 또한, 거의 모든 메서드는 새로운 `Collection` 인스턴스를 반환하므로 필요할 때 원본 컬렉션의 복사본을 보존할 수 있습니다:

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

[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[chunk](#method-chunk)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsOneItem](#method-containsoneitem)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffAssocUsing](#method-diffassocusing)
[diffKeys](#method-diffkeys)
[doesntContain](#method-doesntcontain)
[dot](#method-dot)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[ensure](#method-ensure)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forget](#method-forget)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[hasAny](#method-hasany)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectAssoc](#method-intersectAssoc)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[lazy](#method-lazy)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[percentage](#method-percentage)
[pipe](#method-pipe)
[pipeInto](#method-pipeinto)
[pipeThrough](#method-pipethrough)
[pluck](#method-pluck)
[pop](#method-pop)
[prepend](#method-prepend)
[pull](#method-pull)
[push](#method-push)
[put](#method-put)
[random](#method-random)
[range](#method-range)
[reduce](#method-reduce)
[reduceSpread](#method-reduce-spread)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[select](#method-select)
[shift](#method-shift)
[shuffle](#method-shuffle)
[skip](#method-skip)
[skipUntil](#method-skipuntil)
[skipWhile](#method-skipwhile)
[slice](#method-slice)
[sliding](#method-sliding)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortDesc](#method-sortdesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[sortKeysUsing](#method-sortkeysusing)
[splice](#method-splice)
[split](#method-split)
[splitIn](#method-splitin)
[sum](#method-sum)
[take](#method-take)
[takeUntil](#method-takeuntil)
[takeWhile](#method-takewhile)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[transform](#method-transform)
[undot](#method-undot)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[value](#method-value)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[whereNotNull](#method-wherenotnull)
[whereNull](#method-wherenull)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

<a name="method-listing"></a>
## 메서드 목록

<style>
    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<a name="method-all"></a>
#### `all()` {.collection-method .first-collection-method}

`all` 메서드는 컬렉션이 나타내는 기본 배열을 반환합니다:

```php
collect([1, 2, 3])->all();

// [1, 2, 3]
```

<a name="method-average"></a>
#### `average()` {.collection-method}

[avg](#method-avg) 메서드의 별칭입니다.

<a name="method-avg"></a>
#### `avg()` {.collection-method}

`avg` 메서드는 주어진 키의 [평균값](https://en.wikipedia.org/wiki/Average)을 반환합니다:

```php
$average = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->avg('foo');

// 20

$average = collect([1, 1, 2, 4])->avg();

// 2
```

<a name="method-chunk"></a>
#### `chunk()` {.collection-method}

`chunk` 메서드는 컬렉션을 주어진 크기의 여러 작은 컬렉션으로 나눕니다:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7]);

$chunks = $collection->chunk(4);

$chunks->all();

// [[1, 2, 3, 4], [5, 6, 7]]
```

이 메서드는 [Bootstrap](https://getbootstrap.com/docs/4.1/layout/grid/)과 같은 그리드 시스템을 사용할 때 [뷰](/docs/{{version}}/views)에서 특히 유용합니다. 예를 들어, 그리드에 표시하려는 [Eloquent](/docs/{{version}}/eloquent) 모델 컬렉션이 있다고 가정해 보세요:

```blade
@foreach ($products->chunk(3) as $chunk)
    <div class="row">
        @foreach ($chunk as $product)
            <div class="col-xs-4">{{ $product->name }}</div>
        @endforeach
    </div>
@endforeach
```

<a name="method-chunkwhile"></a>
#### `chunkWhile()` {.collection-method}

`chunkWhile` 메서드는 주어진 콜백의 평가에 따라 컬렉션을 여러 작은 컬렉션으로 나눕니다. 클로저에 전달되는 `$chunk` 변수를 사용하여 이전 요소를 검사할 수 있습니다:

```php
$collection = collect(str_split('AABBCCCD'));

$chunks = $collection->chunkWhile(function (string $value, int $key, Collection $chunk) {
    return $value === $chunk->last();
});

$chunks->all();

// [['A', 'A'], ['B', 'B'], ['C', 'C', 'C'], ['D']]
```

<a name="method-collapse"></a>
#### `collapse()` {.collection-method}

`collapse` 메서드는 배열 또는 컬렉션의 컬렉션을 단일 평면 컬렉션으로 축소합니다:

```php
$collection = collect([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]);

$collapsed = $collection->collapse();

$collapsed->all();

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-collect"></a>
#### `collect()` {.collection-method}

`collect` 메서드는 현재 컬렉션의 아이템으로 새로운 `Collection` 인스턴스를 반환합니다:

```php
$collectionA = collect([1, 2, 3]);

$collectionB = $collectionA->collect();

$collectionB->all();

// [1, 2, 3]
```

`collect` 메서드는 주로 [지연 컬렉션](#lazy-collections)을 표준 `Collection` 인스턴스로 변환하는 데 유용합니다:

```php
$lazyCollection = LazyCollection::make(function () {
    yield 1;
    yield 2;
    yield 3;
});

$collection = $lazyCollection->collect();

$collection::class;

// 'Illuminate\Support\Collection'

$collection->all();

// [1, 2, 3]
```

> [!NOTE]
> `collect` 메서드는 `Enumerable` 인스턴스가 있고 지연되지 않는 컬렉션 인스턴스가 필요할 때 특히 유용합니다. `collect()`는 `Enumerable` contract의 일부이므로 안전하게 `Collection` 인스턴스를 얻는 데 사용할 수 있습니다.

<a name="method-combine"></a>
#### `combine()` {.collection-method}

`combine` 메서드는 컬렉션의 값을 키로 사용하여 다른 배열 또는 컬렉션의 값과 결합합니다:

```php
$collection = collect(['name', 'age']);

$combined = $collection->combine(['George', 29]);

$combined->all();

// ['name' => 'George', 'age' => 29]
```

<a name="method-concat"></a>
#### `concat()` {.collection-method}

`concat` 메서드는 주어진 배열 또는 컬렉션의 값을 다른 컬렉션의 끝에 추가합니다:

```php
$collection = collect(['John Doe']);

$concatenated = $collection->concat(['Jane Doe'])->concat(['name' => 'Johnny Doe']);

$concatenated->all();

// ['John Doe', 'Jane Doe', 'Johnny Doe']
```

`concat` 메서드는 원래 컬렉션에 연결된 아이템의 키를 숫자로 재인덱싱합니다. 연관 컬렉션에서 키를 유지하려면 [merge](#method-merge) 메서드를 참조하세요.

<a name="method-contains"></a>
#### `contains()` {.collection-method}

`contains` 메서드는 컬렉션에 주어진 아이템이 포함되어 있는지 확인합니다. 주어진 조건을 통과하는 요소가 컬렉션에 존재하는지 확인하기 위해 `contains` 메서드에 클로저를 전달할 수 있습니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->contains(function (int $value, int $key) {
    return $value > 5;
});

// false
```

또는, 컬렉션에 주어진 아이템 값이 포함되어 있는지 확인하기 위해 `contains` 메서드에 문자열을 전달할 수 있습니다:

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->contains('Desk');

// true

$collection->contains('New York');

// false
```

주어진 키/값 쌍이 컬렉션에 존재하는지 확인하기 위해 `contains` 메서드에 키/값 쌍을 전달할 수도 있습니다:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->contains('product', 'Bookcase');

// false
```

`contains` 메서드는 아이템 값을 확인할 때 "느슨한(loose)" 비교를 사용합니다. 즉, 정수 값을 가진 문자열은 같은 값의 정수와 동일하게 간주됩니다. "엄격한(strict)" 비교를 사용하여 필터링하려면 [containsStrict](#method-containsstrict) 메서드를 사용하세요.

`contains`의 반대는 [doesntContain](#method-doesntcontain) 메서드를 참조하세요.

<a name="method-containsoneitem"></a>
#### `containsOneItem()` {.collection-method}

`containsOneItem` 메서드는 컬렉션에 단일 아이템이 포함되어 있는지 확인합니다:

```php
collect([])->containsOneItem();

// false

collect(['1'])->containsOneItem();

// true

collect(['1', '2'])->containsOneItem();

// false
```

<a name="method-containsstrict"></a>
#### `containsStrict()` {.collection-method}

이 메서드는 [contains](#method-contains) 메서드와 동일한 시그니처를 가지지만 모든 값은 "엄격한(strict)" 비교를 사용하여 비교됩니다.

> [!NOTE]
> 이 메서드의 동작은 [Eloquent 컬렉션](/docs/{{version}}/eloquent-collections#method-contains)을 사용할 때 수정됩니다.

<a name="method-count"></a>
#### `count()` {.collection-method}

`count` 메서드는 컬렉션의 총 아이템 수를 반환합니다:

```php
$collection = collect([1, 2, 3, 4]);

$collection->count();

// 4
```

<a name="method-countBy"></a>
#### `countBy()` {.collection-method}

`countBy` 메서드는 컬렉션에서 값의 발생 횟수를 계산합니다. 기본적으로 메서드는 모든 요소의 발생 횟수를 계산하여 컬렉션에서 특정 "유형"의 요소를 계산할 수 있습니다:

```php
$collection = collect([1, 2, 2, 2, 3]);

$counted = $collection->countBy();

$counted->all();

// [1 => 1, 2 => 3, 3 => 1]
```

사용자 정의 값으로 모든 아이템을 계산하기 위해 `countBy` 메서드에 클로저를 전달할 수 있습니다:

```php
$collection = collect(['alice@gmail.com', 'bob@yahoo.com', 'carlos@gmail.com']);

$counted = $collection->countBy(function (string $email) {
    return substr(strrchr($email, '@'), 1);
});

$counted->all();

// ['gmail.com' => 2, 'yahoo.com' => 1]
```

<a name="method-crossjoin"></a>
#### `crossJoin()` {.collection-method}

`crossJoin` 메서드는 컬렉션의 값을 주어진 배열 또는 컬렉션과 교차 조인하여 가능한 모든 순열을 포함하는 데카르트 곱을 반환합니다:

```php
$collection = collect([1, 2]);

$matrix = $collection->crossJoin(['a', 'b']);

$matrix->all();

/*
    [
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]
*/

$collection = collect([1, 2]);

$matrix = $collection->crossJoin(['a', 'b'], ['I', 'II']);

$matrix->all();

/*
    [
        [1, 'a', 'I'],
        [1, 'a', 'II'],
        [1, 'b', 'I'],
        [1, 'b', 'II'],
        [2, 'a', 'I'],
        [2, 'a', 'II'],
        [2, 'b', 'I'],
        [2, 'b', 'II'],
    ]
*/
```

<a name="method-dd"></a>
#### `dd()` {.collection-method}

`dd` 메서드는 컬렉션의 아이템을 덤프하고 스크립트 실행을 종료합니다:

```php
$collection = collect(['John Doe', 'Jane Doe']);

$collection->dd();

/*
    array:2 [
        0 => "John Doe"
        1 => "Jane Doe"
    ]
*/
```

스크립트 실행을 중지하지 않으려면 [dump](#method-dump) 메서드를 대신 사용하세요.

<a name="method-diff"></a>
#### `diff()` {.collection-method}

`diff` 메서드는 컬렉션을 다른 컬렉션 또는 일반 PHP `array`와 값을 기준으로 비교합니다. 이 메서드는 주어진 컬렉션에 존재하지 않는 원래 컬렉션의 값을 반환합니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$diff = $collection->diff([2, 4, 6, 8]);

$diff->all();

// [1, 3, 5]
```

> [!NOTE]
> 이 메서드의 동작은 [Eloquent 컬렉션](/docs/{{version}}/eloquent-collections#method-diff)을 사용할 때 수정됩니다.

<a name="method-diffassoc"></a>
#### `diffAssoc()` {.collection-method}

`diffAssoc` 메서드는 컬렉션을 다른 컬렉션 또는 일반 PHP `array`와 키와 값을 기준으로 비교합니다. 이 메서드는 주어진 컬렉션에 존재하지 않는 원래 컬렉션의 키/값 쌍을 반환합니다:

```php
$collection = collect([
    'color' => 'orange',
    'type' => 'fruit',
    'remain' => 6,
]);

$diff = $collection->diffAssoc([
    'color' => 'yellow',
    'type' => 'fruit',
    'remain' => 3,
    'used' => 6,
]);

$diff->all();

// ['color' => 'orange', 'remain' => 6]
```

<a name="method-diffassocusing"></a>
#### `diffAssocUsing()` {.collection-method}

`diffAssoc`와 달리 `diffAssocUsing`은 인덱스 비교를 위해 사용자가 제공한 콜백 함수를 받습니다:

```php
$collection = collect([
    'color' => 'orange',
    'type' => 'fruit',
    'remain' => 6,
]);

$diff = $collection->diffAssocUsing([
    'Color' => 'yellow',
    'Type' => 'fruit',
    'Remain' => 3,
], 'strnatcasecmp');

$diff->all();

// ['color' => 'orange', 'remain' => 6]
```

콜백은 0보다 작거나 같거나 큰 정수를 반환하는 비교 함수여야 합니다. 자세한 정보는 `diffAssocUsing` 메서드가 내부적으로 사용하는 PHP 함수인 [array_diff_uassoc](https://www.php.net/array_diff_uassoc#refsect1-function.array-diff-uassoc-parameters)에 대한 PHP 문서를 참조하세요.

<a name="method-diffkeys"></a>
#### `diffKeys()` {.collection-method}

`diffKeys` 메서드는 컬렉션을 다른 컬렉션 또는 일반 PHP `array`와 키를 기준으로 비교합니다. 이 메서드는 주어진 컬렉션에 존재하지 않는 원래 컬렉션의 키/값 쌍을 반환합니다:

```php
$collection = collect([
    'one' => 10,
    'two' => 20,
    'three' => 30,
    'four' => 40,
    'five' => 50,
]);

$diff = $collection->diffKeys([
    'two' => 2,
    'four' => 4,
    'six' => 6,
    'eight' => 8,
]);

$diff->all();

// ['one' => 10, 'three' => 30, 'five' => 50]
```

<a name="method-doesntcontain"></a>
#### `doesntContain()` {.collection-method}

`doesntContain` 메서드는 컬렉션에 주어진 아이템이 포함되어 있지 않은지 확인합니다. 주어진 조건을 통과하는 요소가 컬렉션에 존재하지 않는지 확인하기 위해 `doesntContain` 메서드에 클로저를 전달할 수 있습니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->doesntContain(function (int $value, int $key) {
    return $value < 5;
});

// false
```

또는, 컬렉션에 주어진 아이템 값이 포함되어 있지 않은지 확인하기 위해 `doesntContain` 메서드에 문자열을 전달할 수 있습니다:

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->doesntContain('Table');

// true

$collection->doesntContain('Desk');

// false
```

주어진 키/값 쌍이 컬렉션에 존재하지 않는지 확인하기 위해 `doesntContain` 메서드에 키/값 쌍을 전달할 수도 있습니다:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->doesntContain('product', 'Bookcase');

// true
```

`doesntContain` 메서드는 아이템 값을 확인할 때 "느슨한(loose)" 비교를 사용합니다. 즉, 정수 값을 가진 문자열은 같은 값의 정수와 동일하게 간주됩니다.

<a name="method-dot"></a>
#### `dot()` {.collection-method}

`dot` 메서드는 다차원 컬렉션을 깊이를 나타내는 "점" 표기법을 사용하는 단일 레벨 컬렉션으로 평면화합니다:

```php
$collection = collect(['products' => ['desk' => ['price' => 100]]]);

$flattened = $collection->dot();

$flattened->all();

// ['products.desk.price' => 100]
```

<a name="method-dump"></a>
#### `dump()` {.collection-method}

`dump` 메서드는 컬렉션의 아이템을 덤프합니다:

```php
$collection = collect(['John Doe', 'Jane Doe']);

$collection->dump();

/*
    array:2 [
        0 => "John Doe"
        1 => "Jane Doe"
    ]
*/
```

컬렉션을 덤프한 후 스크립트 실행을 중지하려면 [dd](#method-dd) 메서드를 대신 사용하세요.

<a name="method-duplicates"></a>
#### `duplicates()` {.collection-method}

`duplicates` 메서드는 컬렉션에서 중복된 값을 검색하고 반환합니다:

```php
$collection = collect(['a', 'b', 'a', 'c', 'b']);

$collection->duplicates();

// [2 => 'a', 4 => 'b']
```

컬렉션에 배열이나 객체가 포함된 경우, 중복 값을 확인하려는 속성의 키를 전달할 수 있습니다:

```php
$employees = collect([
    ['email' => 'abigail@example.com', 'position' => 'Developer'],
    ['email' => 'james@example.com', 'position' => 'Designer'],
    ['email' => 'victoria@example.com', 'position' => 'Developer'],
]);

$employees->duplicates('position');

// [2 => 'Developer']
```

<a name="method-duplicatesstrict"></a>
#### `duplicatesStrict()` {.collection-method}

이 메서드는 [duplicates](#method-duplicates) 메서드와 동일한 시그니처를 가지지만 모든 값은 "엄격한(strict)" 비교를 사용하여 비교됩니다.

<a name="method-each"></a>
#### `each()` {.collection-method}

`each` 메서드는 컬렉션의 아이템을 반복하고 각 아이템을 클로저에 전달합니다:

```php
$collection = collect([1, 2, 3, 4]);

$collection->each(function (int $item, int $key) {
    // ...
});
```

아이템 반복을 중지하려면 클로저에서 `false`를 반환하면 됩니다:

```php
$collection->each(function (int $item, int $key) {
    if (/* condition */) {
        return false;
    }
});
```

<a name="method-eachspread"></a>
#### `eachSpread()` {.collection-method}

`eachSpread` 메서드는 컬렉션의 아이템을 반복하며, 각 중첩된 아이템 값을 주어진 콜백에 전달합니다:

```php
$collection = collect([['John Doe', 35], ['Jane Doe', 33]]);

$collection->eachSpread(function (string $name, int $age) {
    // ...
});
```

콜백에서 `false`를 반환하여 아이템 반복을 중지할 수 있습니다:

```php
$collection->eachSpread(function (string $name, int $age) {
    return false;
});
```

<a name="method-ensure"></a>
#### `ensure()` {.collection-method}

`ensure` 메서드는 컬렉션의 모든 요소가 주어진 타입 또는 타입 목록인지 확인하는 데 사용할 수 있습니다. 그렇지 않으면 `UnexpectedValueException`이 발생합니다:

```php
return $collection->ensure(User::class);

return $collection->ensure([User::class, Customer::class]);
```

`string`, `int`, `float`, `bool`, `array`와 같은 기본 타입도 지정할 수 있습니다:

```php
return $collection->ensure('int');
```

> [!WARNING]
> `ensure` 메서드는 나중에 다른 타입의 요소가 컬렉션에 추가되지 않을 것을 보장하지 않습니다.

<a name="method-every"></a>
#### `every()` {.collection-method}

`every` 메서드는 컬렉션의 모든 요소가 주어진 조건을 통과하는지 확인하는 데 사용할 수 있습니다:

```php
collect([1, 2, 3, 4])->every(function (int $value, int $key) {
    return $value > 2;
});

// false
```

컬렉션이 비어 있으면 `every` 메서드는 true를 반환합니다:

```php
$collection = collect([]);

$collection->every(function (int $value, int $key) {
    return $value > 2;
});

// true
```

<a name="method-except"></a>
#### `except()` {.collection-method}

`except` 메서드는 지정된 키를 가진 아이템을 제외한 컬렉션의 모든 아이템을 반환합니다:

```php
$collection = collect(['product_id' => 1, 'price' => 100, 'discount' => false]);

$filtered = $collection->except(['price', 'discount']);

$filtered->all();

// ['product_id' => 1]
```

`except`의 반대는 [only](#method-only) 메서드를 참조하세요.

> [!NOTE]
> 이 메서드의 동작은 [Eloquent 컬렉션](/docs/{{version}}/eloquent-collections#method-except)을 사용할 때 수정됩니다.

<a name="method-filter"></a>
#### `filter()` {.collection-method}

`filter` 메서드는 주어진 콜백을 사용하여 컬렉션을 필터링하며, 주어진 조건을 통과하는 아이템만 유지합니다:

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->filter(function (int $value, int $key) {
    return $value > 2;
});

$filtered->all();

// [3, 4]
```

콜백이 제공되지 않으면 `false`와 동등한 컬렉션의 모든 항목이 제거됩니다:

```php
$collection = collect([1, 2, 3, null, false, '', 0, []]);

$collection->filter()->all();

// [1, 2, 3]
```

`filter`의 반대는 [reject](#method-reject) 메서드를 참조하세요.

<a name="method-first"></a>
#### `first()` {.collection-method}

`first` 메서드는 주어진 조건을 통과하는 컬렉션의 첫 번째 요소를 반환합니다:

```php
collect([1, 2, 3, 4])->first(function (int $value, int $key) {
    return $value > 2;
});

// 3
```

인수 없이 `first` 메서드를 호출하여 컬렉션의 첫 번째 요소를 가져올 수도 있습니다. 컬렉션이 비어 있으면 `null`이 반환됩니다:

```php
collect([1, 2, 3, 4])->first();

// 1
```

<a name="method-first-or-fail"></a>
#### `firstOrFail()` {.collection-method}

`firstOrFail` 메서드는 `first` 메서드와 동일하지만, 결과가 없으면 `Illuminate\Support\ItemNotFoundException` 예외가 발생합니다:

```php
collect([1, 2, 3, 4])->firstOrFail(function (int $value, int $key) {
    return $value > 5;
});

// Throws ItemNotFoundException...
```

인수 없이 `firstOrFail` 메서드를 호출하여 컬렉션의 첫 번째 요소를 가져올 수도 있습니다. 컬렉션이 비어 있으면 `Illuminate\Support\ItemNotFoundException` 예외가 발생합니다:

```php
collect([])->firstOrFail();

// Throws ItemNotFoundException...
```

<a name="method-first-where"></a>
#### `firstWhere()` {.collection-method}

`firstWhere` 메서드는 주어진 키/값 쌍을 가진 컬렉션의 첫 번째 요소를 반환합니다:

```php
$collection = collect([
    ['name' => 'Regena', 'age' => null],
    ['name' => 'Linda', 'age' => 14],
    ['name' => 'Diego', 'age' => 23],
    ['name' => 'Linda', 'age' => 84],
]);

$collection->firstWhere('name', 'Linda');

// ['name' => 'Linda', 'age' => 14]
```

비교 연산자와 함께 `firstWhere` 메서드를 호출할 수도 있습니다:

```php
$collection->firstWhere('age', '>=', 18);

// ['name' => 'Diego', 'age' => 23]
```

[where](#method-where) 메서드와 마찬가지로, `firstWhere` 메서드에 하나의 인수를 전달할 수 있습니다. 이 시나리오에서 `firstWhere` 메서드는 주어진 아이템 키의 값이 "truthy"인 첫 번째 아이템을 반환합니다:

```php
$collection->firstWhere('age');

// ['name' => 'Linda', 'age' => 14]
```

<a name="method-flatmap"></a>
#### `flatMap()` {.collection-method}

`flatMap` 메서드는 컬렉션을 반복하며 각 값을 주어진 클로저에 전달합니다. 클로저는 아이템을 수정하고 반환할 수 있으므로 수정된 아이템의 새 컬렉션을 형성합니다. 그런 다음 배열이 한 레벨 평면화됩니다:

```php
$collection = collect([
    ['name' => 'Sally'],
    ['school' => 'Arkansas'],
    ['age' => 28]
]);

$flattened = $collection->flatMap(function (array $values) {
    return array_map('strtoupper', $values);
});

$flattened->all();

// ['name' => 'SALLY', 'school' => 'ARKANSAS', 'age' => '28'];
```

<a name="method-flatten"></a>
#### `flatten()` {.collection-method}

`flatten` 메서드는 다차원 컬렉션을 단일 차원으로 평면화합니다:

```php
$collection = collect([
    'name' => 'Taylor',
    'languages' => [
        'PHP', 'JavaScript'
    ]
]);

$flattened = $collection->flatten();

$flattened->all();

// ['Taylor', 'PHP', 'JavaScript'];
```

필요한 경우 `flatten` 메서드에 "depth" 인수를 전달할 수 있습니다:

```php
$collection = collect([
    'Apple' => [
        [
            'name' => 'iPhone 6S',
            'brand' => 'Apple'
        ],
    ],
    'Samsung' => [
        [
            'name' => 'Galaxy S7',
            'brand' => 'Samsung'
        ],
    ],
]);

$products = $collection->flatten(1);

$products->values()->all();

/*
    [
        ['name' => 'iPhone 6S', 'brand' => 'Apple'],
        ['name' => 'Galaxy S7', 'brand' => 'Samsung'],
    ]
*/
```

이 예제에서 깊이를 제공하지 않고 `flatten`을 호출하면 중첩된 배열도 평면화되어 `['iPhone 6S', 'Apple', 'Galaxy S7', 'Samsung']`이 됩니다. 깊이를 제공하면 중첩된 배열이 평면화되는 레벨 수를 지정할 수 있습니다.

<a name="method-flip"></a>
#### `flip()` {.collection-method}

`flip` 메서드는 컬렉션의 키와 해당 값을 교환합니다:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$flipped = $collection->flip();

$flipped->all();

// ['Taylor' => 'name', 'Laravel' => 'framework']
```

<a name="method-forget"></a>
#### `forget()` {.collection-method}

`forget` 메서드는 키로 컬렉션에서 아이템을 제거합니다:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$collection->forget('name');

$collection->all();

// ['framework' => 'Laravel']
```

> [!WARNING]
> 대부분의 다른 컬렉션 메서드와 달리, `forget`은 새로운 수정된 컬렉션을 반환하지 않습니다. 호출된 컬렉션을 수정합니다.

<a name="method-forpage"></a>
#### `forPage()` {.collection-method}

`forPage` 메서드는 주어진 페이지 번호에 존재할 아이템을 포함하는 새 컬렉션을 반환합니다. 이 메서드는 첫 번째 인수로 페이지 번호를, 두 번째 인수로 페이지당 표시할 아이템 수를 받습니다:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunk = $collection->forPage(2, 3);

$chunk->all();

// [4, 5, 6]
```

<a name="method-get"></a>
#### `get()` {.collection-method}

`get` 메서드는 주어진 키의 아이템을 반환합니다. 키가 존재하지 않으면 `null`이 반환됩니다:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$value = $collection->get('name');

// Taylor
```

선택적으로 두 번째 인수로 기본값을 전달할 수 있습니다:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$value = $collection->get('age', 34);

// 34
```

메서드의 기본값으로 콜백을 전달할 수도 있습니다. 지정된 키가 존재하지 않으면 콜백의 결과가 반환됩니다:

```php
$collection->get('email', function () {
    return 'taylor@example.com';
});

// taylor@example.com
```

<a name="method-groupby"></a>
#### `groupBy()` {.collection-method}

`groupBy` 메서드는 주어진 키로 컬렉션의 아이템을 그룹화합니다:

```php
$collection = collect([
    ['account_id' => 'account-x10', 'product' => 'Chair'],
    ['account_id' => 'account-x10', 'product' => 'Bookcase'],
    ['account_id' => 'account-x11', 'product' => 'Desk'],
]);

$grouped = $collection->groupBy('account_id');

$grouped->all();

/*
    [
        'account-x10' => [
            ['account_id' => 'account-x10', 'product' => 'Chair'],
            ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ],
        'account-x11' => [
            ['account_id' => 'account-x11', 'product' => 'Desk'],
        ],
    ]
*/
```

문자열 `key`를 전달하는 대신 콜백을 전달할 수 있습니다. 콜백은 그룹화할 값을 반환해야 합니다:

```php
$grouped = $collection->groupBy(function (array $item, int $key) {
    return substr($item['account_id'], -3);
});

$grouped->all();

/*
    [
        'x10' => [
            ['account_id' => 'account-x10', 'product' => 'Chair'],
            ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ],
        'x11' => [
            ['account_id' => 'account-x11', 'product' => 'Desk'],
        ],
    ]
*/
```

여러 그룹화 기준을 배열로 전달할 수 있습니다. 각 배열 요소는 다차원 배열 내의 해당 레벨에 적용됩니다:

```php
$data = new Collection([
    10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
    20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
    30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
    40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
]);

$result = $data->groupBy(['skill', function (array $item) {
    return $item['roles'];
}], preserveKeys: true);

/*
[
    1 => [
        'Role_1' => [
            10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
            20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        ],
        'Role_2' => [
            20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        ],
        'Role_3' => [
            10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
        ],
    ],
    2 => [
        'Role_1' => [
            30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
        ],
        'Role_2' => [
            40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
        ],
    ],
];
*/
```

<a name="method-has"></a>
#### `has()` {.collection-method}

`has` 메서드는 주어진 키가 컬렉션에 존재하는지 확인합니다:

```php
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->has('product');

// true

$collection->has(['product', 'amount']);

// true

$collection->has(['amount', 'price']);

// false
```

<a name="method-hasany"></a>
#### `hasAny()` {.collection-method}

`hasAny` 메서드는 주어진 키 중 하나라도 컬렉션에 존재하는지 확인합니다:

```php
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->hasAny(['product', 'price']);

// true

$collection->hasAny(['name', 'price']);

// false
```

<a name="method-implode"></a>
#### `implode()` {.collection-method}

`implode` 메서드는 컬렉션의 아이템을 결합합니다. 인수는 컬렉션의 아이템 유형에 따라 달라집니다. 컬렉션에 배열이나 객체가 포함된 경우, 결합하려는 속성의 키와 값 사이에 배치할 "접착제(glue)" 문자열을 전달해야 합니다:

```php
$collection = collect([
    ['account_id' => 1, 'product' => 'Desk'],
    ['account_id' => 2, 'product' => 'Chair'],
]);

$collection->implode('product', ', ');

// 'Desk, Chair'
```

컬렉션에 단순 문자열이나 숫자 값이 포함된 경우, 메서드에 유일한 인수로 "접착제"를 전달해야 합니다:

```php
collect([1, 2, 3, 4, 5])->implode('-');

// '1-2-3-4-5'
```

결합되는 값의 형식을 지정하려면 `implode` 메서드에 클로저를 전달할 수 있습니다:

```php
$collection->implode(function (array $item, int $key) {
    return strtoupper($item['product']);
}, ', ');

// 'DESK, CHAIR'
```

<a name="method-intersect"></a>
#### `intersect()` {.collection-method}

`intersect` 메서드는 주어진 배열 또는 컬렉션에 존재하지 않는 값을 원래 컬렉션에서 제거합니다. 결과 컬렉션은 원래 컬렉션의 키를 유지합니다:

```php
$collection = collect(['Desk', 'Sofa', 'Chair']);

$intersect = $collection->intersect(['Desk', 'Chair', 'Bookcase']);

$intersect->all();

// [0 => 'Desk', 2 => 'Chair']
```

> [!NOTE]
> 이 메서드의 동작은 [Eloquent 컬렉션](/docs/{{version}}/eloquent-collections#method-intersect)을 사용할 때 수정됩니다.

<a name="method-intersectAssoc"></a>
#### `intersectAssoc()` {.collection-method}

`intersectAssoc` 메서드는 원래 컬렉션을 다른 컬렉션 또는 배열과 비교하여 모든 주어진 컬렉션에 존재하는 키/값 쌍을 반환합니다:

```php
$collection = collect([
    'color' => 'red',
    'size' => 'M',
    'material' => 'cotton'
]);

$intersect = $collection->intersectAssoc([
    'color' => 'blue',
    'size' => 'M',
    'material' => 'polyester'
]);

$intersect->all();

// ['size' => 'M']
```

<a name="method-intersectbykeys"></a>
#### `intersectByKeys()` {.collection-method}

`intersectByKeys` 메서드는 주어진 배열 또는 컬렉션에 존재하지 않는 키와 해당 값을 원래 컬렉션에서 제거합니다:

```php
$collection = collect([
    'serial' => 'UX301', 'type' => 'screen', 'year' => 2009,
]);

$intersect = $collection->intersectByKeys([
    'reference' => 'UX404', 'type' => 'tab', 'year' => 2011,
]);

$intersect->all();

// ['type' => 'screen', 'year' => 2009]
```

<a name="method-isempty"></a>
#### `isEmpty()` {.collection-method}

`isEmpty` 메서드는 컬렉션이 비어 있으면 `true`를 반환하고, 그렇지 않으면 `false`를 반환합니다:

```php
collect([])->isEmpty();

// true
```

<a name="method-isnotempty"></a>
#### `isNotEmpty()` {.collection-method}

`isNotEmpty` 메서드는 컬렉션이 비어 있지 않으면 `true`를 반환하고, 그렇지 않으면 `false`를 반환합니다:

```php
collect([])->isNotEmpty();

// false
```

<a name="method-join"></a>
#### `join()` {.collection-method}

`join` 메서드는 컬렉션의 값을 문자열로 결합합니다. 이 메서드의 두 번째 인수를 사용하여 마지막 요소가 문자열에 추가되는 방식을 지정할 수도 있습니다:

```php
collect(['a', 'b', 'c'])->join(', '); // 'a, b, c'
collect(['a', 'b', 'c'])->join(', ', ', and '); // 'a, b, and c'
collect(['a', 'b'])->join(', ', ' and '); // 'a and b'
collect(['a'])->join(', ', ' and '); // 'a'
collect([])->join(', ', ' and '); // ''
```

<a name="method-keyby"></a>
#### `keyBy()` {.collection-method}

`keyBy` 메서드는 주어진 키로 컬렉션을 키 지정합니다. 여러 아이템이 같은 키를 가지면 마지막 아이템만 새 컬렉션에 나타납니다:

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$keyed = $collection->keyBy('product_id');

$keyed->all();

/*
    [
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

메서드에 콜백을 전달할 수도 있습니다. 콜백은 컬렉션을 키 지정할 값을 반환해야 합니다:

```php
$keyed = $collection->keyBy(function (array $item, int $key) {
    return strtoupper($item['product_id']);
});

$keyed->all();

/*
    [
        'PROD-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'PROD-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

<a name="method-keys"></a>
#### `keys()` {.collection-method}

`keys` 메서드는 컬렉션의 모든 키를 반환합니다:

```php
$collection = collect([
    'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
    'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$keys = $collection->keys();

$keys->all();

// ['prod-100', 'prod-200']
```

<a name="method-last"></a>
#### `last()` {.collection-method}

`last` 메서드는 주어진 조건을 통과하는 컬렉션의 마지막 요소를 반환합니다:

```php
collect([1, 2, 3, 4])->last(function (int $value, int $key) {
    return $value < 3;
});

// 2
```

인수 없이 `last` 메서드를 호출하여 컬렉션의 마지막 요소를 가져올 수도 있습니다. 컬렉션이 비어 있으면 `null`이 반환됩니다:

```php
collect([1, 2, 3, 4])->last();

// 4
```

<a name="method-lazy"></a>
#### `lazy()` {.collection-method}

`lazy` 메서드는 기본 아이템 배열에서 새 [LazyCollection](#lazy-collections) 인스턴스를 반환합니다:

```php
$lazyCollection = collect([1, 2, 3, 4])->lazy();

$lazyCollection::class;

// Illuminate\Support\LazyCollection

$lazyCollection->all();

// [1, 2, 3, 4]
```

이것은 많은 아이템을 포함하는 거대한 `Collection`에서 변환을 수행해야 할 때 특히 유용합니다:

```php
$count = $hugeCollection
    ->lazy()
    ->where('country', 'FR')
    ->where('balance', '>', '100')
    ->count();
```

컬렉션을 `LazyCollection`으로 변환하면 많은 추가 메모리를 할당하는 것을 피할 수 있습니다. 원래 컬렉션은 여전히 _그_ 값을 메모리에 유지하지만, 후속 필터는 그렇지 않습니다. 따라서 컬렉션 결과를 필터링할 때 사실상 추가 메모리가 할당되지 않습니다.

<a name="method-macro"></a>
#### `macro()` {.collection-method}

정적 `macro` 메서드를 사용하면 런타임에 `Collection` 클래스에 메서드를 추가할 수 있습니다. 자세한 정보는 [컬렉션 확장하기](#extending-collections) 문서를 참조하세요.

<a name="method-make"></a>
#### `make()` {.collection-method}

정적 `make` 메서드는 새 컬렉션 인스턴스를 생성합니다. [컬렉션 생성하기](#creating-collections) 섹션을 참조하세요.

```php
use Illuminate\Support\Collection;

$collection = Collection::make([1, 2, 3]);
```

<a name="method-map"></a>
#### `map()` {.collection-method}

`map` 메서드는 컬렉션을 반복하며 각 값을 주어진 콜백에 전달합니다. 콜백은 아이템을 수정하고 반환할 수 있으므로 수정된 아이템의 새 컬렉션을 형성합니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$multiplied = $collection->map(function (int $item, int $key) {
    return $item * 2;
});

$multiplied->all();

// [2, 4, 6, 8, 10]
```

> [!WARNING]
> 대부분의 다른 컬렉션 메서드와 마찬가지로, `map`은 새 컬렉션 인스턴스를 반환합니다. 호출된 컬렉션을 수정하지 않습니다. 원래 컬렉션을 변환하려면 [transform](#method-transform) 메서드를 사용하세요.

<a name="method-mapinto"></a>
#### `mapInto()` {.collection-method}

`mapInto()` 메서드는 컬렉션을 반복하며, 값을 생성자에 전달하여 주어진 클래스의 새 인스턴스를 생성합니다:

```php
class Currency
{
    /**
     * Create a new currency instance.
     */
    function __construct(
        public string $code
    ) {}
}

$collection = collect(['USD', 'EUR', 'GBP']);

$currencies = $collection->mapInto(Currency::class);

$currencies->all();

// [Currency('USD'), Currency('EUR'), Currency('GBP')]
```

<a name="method-mapspread"></a>
#### `mapSpread()` {.collection-method}

`mapSpread` 메서드는 컬렉션의 아이템을 반복하며, 각 중첩된 아이템 값을 주어진 클로저에 전달합니다. 클로저는 아이템을 수정하고 반환할 수 있으므로 수정된 아이템의 새 컬렉션을 형성합니다:

```php
$collection = collect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunks = $collection->chunk(2);

$sequence = $chunks->mapSpread(function (int $even, int $odd) {
    return $even + $odd;
});

$sequence->all();

// [1, 5, 9, 13, 17]
```

<a name="method-maptogroups"></a>
#### `mapToGroups()` {.collection-method}

`mapToGroups` 메서드는 주어진 클로저로 컬렉션의 아이템을 그룹화합니다. 클로저는 단일 키/값 쌍을 포함하는 연관 배열을 반환해야 하며, 그룹화된 값의 새 컬렉션을 형성합니다:

```php
$collection = collect([
    [
        'name' => 'John Doe',
        'department' => 'Sales',
    ],
    [
        'name' => 'Jane Doe',
        'department' => 'Sales',
    ],
    [
        'name' => 'Johnny Doe',
        'department' => 'Marketing',
    ]
]);

$grouped = $collection->mapToGroups(function (array $item, int $key) {
    return [$item['department'] => $item['name']];
});

$grouped->all();

/*
    [
        'Sales' => ['John Doe', 'Jane Doe'],
        'Marketing' => ['Johnny Doe'],
    ]
*/

$grouped->get('Sales')->all();

// ['John Doe', 'Jane Doe']
```

<a name="method-mapwithkeys"></a>
#### `mapWithKeys()` {.collection-method}

`mapWithKeys` 메서드는 컬렉션을 반복하며 각 값을 주어진 콜백에 전달합니다. 콜백은 단일 키/값 쌍을 포함하는 연관 배열을 반환해야 합니다:

```php
$collection = collect([
    [
        'name' => 'John',
        'department' => 'Sales',
        'email' => 'john@example.com',
    ],
    [
        'name' => 'Jane',
        'department' => 'Marketing',
        'email' => 'jane@example.com',
    ]
]);

$keyed = $collection->mapWithKeys(function (array $item, int $key) {
    return [$item['email'] => $item['name']];
});

$keyed->all();

/*
    [
        'john@example.com' => 'John',
        'jane@example.com' => 'Jane',
    ]
*/
```

<a name="method-max"></a>
#### `max()` {.collection-method}

`max` 메서드는 주어진 키의 최대값을 반환합니다:

```php
$max = collect([
    ['foo' => 10],
    ['foo' => 20]
])->max('foo');

// 20

$max = collect([1, 2, 3, 4, 5])->max();

// 5
```

<a name="method-median"></a>
#### `median()` {.collection-method}

`median` 메서드는 주어진 키의 [중앙값](https://en.wikipedia.org/wiki/Median)을 반환합니다:

```php
$median = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->median('foo');

// 15

$median = collect([1, 1, 2, 4])->median();

// 1.5
```

<a name="method-merge"></a>
#### `merge()` {.collection-method}

`merge` 메서드는 주어진 배열 또는 컬렉션을 원래 컬렉션과 병합합니다. 주어진 아이템의 문자열 키가 원래 컬렉션의 문자열 키와 일치하면, 주어진 아이템의 값이 원래 컬렉션의 값을 덮어씁니다:

```php
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->merge(['price' => 200, 'discount' => false]);

$merged->all();

// ['product_id' => 1, 'price' => 200, 'discount' => false]
```

주어진 아이템의 키가 숫자인 경우, 값은 컬렉션의 끝에 추가됩니다:

```php
$collection = collect(['Desk', 'Chair']);

$merged = $collection->merge(['Bookcase', 'Door']);

$merged->all();

// ['Desk', 'Chair', 'Bookcase', 'Door']
```

<a name="method-mergerecursive"></a>
#### `mergeRecursive()` {.collection-method}

`mergeRecursive` 메서드는 주어진 배열 또는 컬렉션을 원래 컬렉션과 재귀적으로 병합합니다. 주어진 아이템의 문자열 키가 원래 컬렉션의 문자열 키와 일치하면, 이 키의 값은 배열로 병합되며 이것이 재귀적으로 수행됩니다:

```php
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->mergeRecursive([
    'product_id' => 2,
    'price' => 200,
    'discount' => false
]);

$merged->all();

// ['product_id' => [1, 2], 'price' => [100, 200], 'discount' => false]
```

<a name="method-min"></a>
#### `min()` {.collection-method}

`min` 메서드는 주어진 키의 최소값을 반환합니다:

```php
$min = collect([['foo' => 10], ['foo' => 20]])->min('foo');

// 10

$min = collect([1, 2, 3, 4, 5])->min();

// 1
```

<a name="method-mode"></a>
#### `mode()` {.collection-method}

`mode` 메서드는 주어진 키의 [최빈값](https://en.wikipedia.org/wiki/Mode_(statistics))을 반환합니다:

```php
$mode = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->mode('foo');

// [10]

$mode = collect([1, 1, 2, 4])->mode();

// [1]

$mode = collect([1, 1, 2, 2])->mode();

// [1, 2]
```

<a name="method-nth"></a>
#### `nth()` {.collection-method}

`nth` 메서드는 n번째 요소마다 구성된 새 컬렉션을 생성합니다:

```php
$collection = collect(['a', 'b', 'c', 'd', 'e', 'f']);

$collection->nth(4);

// ['a', 'e']
```

선택적으로 두 번째 인수로 시작 오프셋을 전달할 수 있습니다:

```php
$collection->nth(4, 1);

// ['b', 'f']
```

<a name="method-only"></a>
#### `only()` {.collection-method}

`only` 메서드는 지정된 키를 가진 컬렉션의 아이템을 반환합니다:

```php
$collection = collect([
    'product_id' => 1,
    'name' => 'Desk',
    'price' => 100,
    'discount' => false
]);

$filtered = $collection->only(['product_id', 'name']);

$filtered->all();

// ['product_id' => 1, 'name' => 'Desk']
```

`only`의 반대는 [except](#method-except) 메서드를 참조하세요.

> [!NOTE]
> 이 메서드의 동작은 [Eloquent 컬렉션](/docs/{{version}}/eloquent-collections#method-only)을 사용할 때 수정됩니다.

<a name="method-pad"></a>
#### `pad()` {.collection-method}

`pad` 메서드는 배열이 지정된 크기에 도달할 때까지 주어진 값으로 배열을 채웁니다. 이 메서드는 PHP의 [array_pad](https://secure.php.net/manual/en/function.array-pad.php) 함수처럼 동작합니다.

왼쪽에 패딩하려면 음수 크기를 지정해야 합니다. 주어진 크기의 절대값이 배열의 길이보다 작거나 같으면 패딩이 수행되지 않습니다:

```php
$collection = collect(['A', 'B', 'C']);

$filtered = $collection->pad(5, 0);

$filtered->all();

// ['A', 'B', 'C', 0, 0]

$filtered = $collection->pad(-5, 0);

$filtered->all();

// [0, 0, 'A', 'B', 'C']
```

<a name="method-partition"></a>
#### `partition()` {.collection-method}

`partition` 메서드는 PHP 배열 구조 분해와 결합하여 주어진 조건을 통과하는 요소와 그렇지 않은 요소를 분리할 수 있습니다:

```php
$collection = collect([1, 2, 3, 4, 5, 6]);

[$underThree, $equalOrAboveThree] = $collection->partition(function (int $i) {
    return $i < 3;
});

$underThree->all();

// [1, 2]

$equalOrAboveThree->all();

// [3, 4, 5, 6]
```

> [!NOTE]
> 이 메서드의 동작은 [Eloquent 컬렉션](/docs/{{version}}/eloquent-collections#method-partition)과 상호작용할 때 수정됩니다.

<a name="method-percentage"></a>
#### `percentage()` {.collection-method}

`percentage` 메서드는 주어진 조건을 통과하는 컬렉션 아이템의 백분율을 빠르게 결정하는 데 사용할 수 있습니다:

```php
$collection = collect([1, 1, 2, 2, 2, 3]);

$percentage = $collection->percentage(fn (int $value) => $value === 1);

// 33.33
```

기본적으로 백분율은 소수점 이하 두 자리로 반올림됩니다. 그러나 메서드에 두 번째 인수를 제공하여 이 동작을 사용자 정의할 수 있습니다:

```php
$percentage = $collection->percentage(fn (int $value) => $value === 1, precision: 3);

// 33.333
```

<a name="method-pipe"></a>
#### `pipe()` {.collection-method}

`pipe` 메서드는 컬렉션을 주어진 클로저에 전달하고 실행된 클로저의 결과를 반환합니다:

```php
$collection = collect([1, 2, 3]);

$piped = $collection->pipe(function (Collection $collection) {
    return $collection->sum();
});

// 6
```

<a name="method-pipeinto"></a>
#### `pipeInto()` {.collection-method}

`pipeInto` 메서드는 주어진 클래스의 새 인스턴스를 생성하고 컬렉션을 생성자에 전달합니다:

```php
class ResourceCollection
{
    /**
     * Create a new ResourceCollection instance.
     */
    public function __construct(
        public Collection $collection,
    ) {}
}

$collection = collect([1, 2, 3]);

$resource = $collection->pipeInto(ResourceCollection::class);

$resource->collection->all();

// [1, 2, 3]
```

<a name="method-pipethrough"></a>
#### `pipeThrough()` {.collection-method}

`pipeThrough` 메서드는 컬렉션을 주어진 클로저 배열에 전달하고 실행된 클로저의 결과를 반환합니다:

```php
use Illuminate\Support\Collection;

$collection = collect([1, 2, 3]);

$result = $collection->pipeThrough([
    function (Collection $collection) {
        return $collection->merge([4, 5]);
    },
    function (Collection $collection) {
        return $collection->sum();
    },
]);

// 15
```

<a name="method-pluck"></a>
#### `pluck()` {.collection-method}

`pluck` 메서드는 주어진 키의 모든 값을 검색합니다:

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$plucked = $collection->pluck('name');

$plucked->all();

// ['Desk', 'Chair']
```

결과 컬렉션을 키 지정하는 방법도 지정할 수 있습니다:

```php
$plucked = $collection->pluck('name', 'product_id');

$plucked->all();

// ['prod-100' => 'Desk', 'prod-200' => 'Chair']
```

`pluck` 메서드는 "점" 표기법을 사용하여 중첩된 값을 검색하는 것도 지원합니다:

```php
$collection = collect([
    [
        'name' => 'Laracon',
        'speakers' => [
            'first_day' => ['Rosa', 'Judith'],
        ],
    ],
    [
        'name' => 'VueConf',
        'speakers' => [
            'first_day' => ['Abigail', 'Joey'],
        ],
    ],
]);

$plucked = $collection->pluck('speakers.first_day');

$plucked->all();

// [['Rosa', 'Judith'], ['Abigail', 'Joey']]
```

중복 키가 존재하면 마지막으로 일치하는 요소가 plucked 컬렉션에 삽입됩니다:

```php
$collection = collect([
    ['brand' => 'Tesla',  'color' => 'red'],
    ['brand' => 'Pagani', 'color' => 'white'],
    ['brand' => 'Tesla',  'color' => 'black'],
    ['brand' => 'Pagani', 'color' => 'orange'],
]);

$plucked = $collection->pluck('color', 'brand');

$plucked->all();

// ['Tesla' => 'black', 'Pagani' => 'orange']
```

<a name="method-pop"></a>
#### `pop()` {.collection-method}

`pop` 메서드는 컬렉션에서 마지막 아이템을 제거하고 반환합니다. 컬렉션이 비어 있으면 `null`이 반환됩니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop();

// 5

$collection->all();

// [1, 2, 3, 4]
```

`pop` 메서드에 정수를 전달하여 컬렉션 끝에서 여러 아이템을 제거하고 반환할 수 있습니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop(3);

// collect([5, 4, 3])

$collection->all();

// [1, 2]
```

<a name="method-prepend"></a>
#### `prepend()` {.collection-method}

`prepend` 메서드는 컬렉션의 시작 부분에 아이템을 추가합니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->prepend(0);

$collection->all();

// [0, 1, 2, 3, 4, 5]
```

두 번째 인수를 전달하여 앞에 추가된 아이템의 키를 지정할 수도 있습니다:

```php
$collection = collect(['one' => 1, 'two' => 2]);

$collection->prepend(0, 'zero');

$collection->all();

// ['zero' => 0, 'one' => 1, 'two' => 2]
```

<a name="method-pull"></a>
#### `pull()` {.collection-method}

`pull` 메서드는 키로 컬렉션에서 아이템을 제거하고 반환합니다:

```php
$collection = collect(['product_id' => 'prod-100', 'name' => 'Desk']);

$collection->pull('name');

// 'Desk'

$collection->all();

// ['product_id' => 'prod-100']
```

<a name="method-push"></a>
#### `push()` {.collection-method}

`push` 메서드는 컬렉션의 끝에 아이템을 추가합니다:

```php
$collection = collect([1, 2, 3, 4]);

$collection->push(5);

$collection->all();

// [1, 2, 3, 4, 5]
```

컬렉션 끝에 여러 아이템을 추가할 수도 있습니다:

```php
$collection = collect([1, 2, 3, 4]);

$collection->push(5, 6, 7);

$collection->all();

// [1, 2, 3, 4, 5, 6, 7]
```

<a name="method-put"></a>
#### `put()` {.collection-method}

`put` 메서드는 컬렉션에 주어진 키와 값을 설정합니다:

```php
$collection = collect(['product_id' => 1, 'name' => 'Desk']);

$collection->put('price', 100);

$collection->all();

// ['product_id' => 1, 'name' => 'Desk', 'price' => 100]
```

<a name="method-random"></a>
#### `random()` {.collection-method}

`random` 메서드는 컬렉션에서 무작위 아이템을 반환합니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->random();

// 4 - (무작위로 검색됨)
```

`random`에 정수를 전달하여 무작위로 검색할 아이템 수를 지정할 수 있습니다. 수신하려는 아이템 수를 명시적으로 전달하면 항상 아이템 컬렉션이 반환됩니다:

```php
$random = $collection->random(3);

$random->all();

// [2, 4, 5] - (무작위로 검색됨)
```

컬렉션 인스턴스에 요청된 것보다 적은 아이템이 있으면 `random` 메서드는 `InvalidArgumentException`을 발생시킵니다.

`random` 메서드는 현재 컬렉션 인스턴스를 받는 클로저도 허용합니다:

```php
use Illuminate\Support\Collection;

$random = $collection->random(fn (Collection $items) => min(10, count($items)));

$random->all();

// [1, 2, 3, 4, 5] - (무작위로 검색됨)
```

<a name="method-range"></a>
#### `range()` {.collection-method}

`range` 메서드는 지정된 범위 사이의 정수를 포함하는 컬렉션을 반환합니다:

```php
$collection = collect()->range(3, 6);

$collection->all();

// [3, 4, 5, 6]
```

<a name="method-reduce"></a>
#### `reduce()` {.collection-method}

`reduce` 메서드는 컬렉션을 단일 값으로 축소하며, 각 반복의 결과를 후속 반복에 전달합니다:

```php
$collection = collect([1, 2, 3]);

$total = $collection->reduce(function (?int $carry, int $item) {
    return $carry + $item;
});

// 6
```

첫 번째 반복에서 `$carry`의 값은 `null`입니다. 그러나 `reduce`에 두 번째 인수를 전달하여 초기값을 지정할 수 있습니다:

```php
$collection->reduce(function (int $carry, int $item) {
    return $carry + $item;
}, 4);

// 10
```

`reduce` 메서드는 배열 키도 주어진 콜백에 전달합니다:

```php
$collection = collect([
    'usd' => 1400,
    'gbp' => 1200,
    'eur' => 1000,
]);

$ratio = [
    'usd' => 1,
    'gbp' => 1.37,
    'eur' => 1.22,
];

$collection->reduce(function (int $carry, int $value, string $key) use ($ratio) {
    return $carry + ($value * $ratio[$key]);
}, 0);

// 4264
```

<a name="method-reduce-spread"></a>
#### `reduceSpread()` {.collection-method}

`reduceSpread` 메서드는 컬렉션을 값의 배열로 축소하며, 각 반복의 결과를 후속 반복에 전달합니다. 이 메서드는 `reduce` 메서드와 유사하지만 여러 초기값을 받을 수 있습니다:

```php
[$creditsRemaining, $batch] = Image::where('status', 'unprocessed')
    ->get()
    ->reduceSpread(function (int $creditsRemaining, Collection $batch, Image $image) {
        if ($creditsRemaining >= $image->creditsRequired()) {
            $batch->push($image);

            $creditsRemaining -= $image->creditsRequired();
        }

        return [$creditsRemaining, $batch];
    }, $creditsAvailable, collect());
```

<a name="method-reject"></a>
#### `reject()` {.collection-method}

`reject` 메서드는 주어진 클로저를 사용하여 컬렉션을 필터링합니다. 아이템이 결과 컬렉션에서 제거되어야 하면 클로저는 `true`를 반환해야 합니다:

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->reject(function (int $value, int $key) {
    return $value > 2;
});

$filtered->all();

// [1, 2]
```

`reject` 메서드의 반대는 [filter](#method-filter) 메서드를 참조하세요.

<a name="method-replace"></a>
#### `replace()` {.collection-method}

`replace` 메서드는 `merge`와 유사하게 동작합니다. 그러나 문자열 키가 있는 일치하는 아이템을 덮어쓰는 것 외에도, `replace` 메서드는 일치하는 숫자 키가 있는 컬렉션의 아이템도 덮어씁니다:

```php
$collection = collect(['Taylor', 'Abigail', 'James']);

$replaced = $collection->replace([1 => 'Victoria', 3 => 'Finn']);

$replaced->all();

// ['Taylor', 'Victoria', 'James', 'Finn']
```

<a name="method-replacerecursive"></a>
#### `replaceRecursive()` {.collection-method}

`replaceRecursive` 메서드는 `replace`와 유사하게 동작하지만 배열로 재귀하여 내부 값에 동일한 교체 프로세스를 적용합니다:

```php
$collection = collect([
    'Taylor',
    'Abigail',
    [
        'James',
        'Victoria',
        'Finn'
    ]
]);

$replaced = $collection->replaceRecursive([
    'Charlie',
    2 => [1 => 'King']
]);

$replaced->all();

// ['Charlie', 'Abigail', ['James', 'King', 'Finn']]
```

<a name="method-reverse"></a>
#### `reverse()` {.collection-method}

`reverse` 메서드는 원래 키를 유지하면서 컬렉션 아이템의 순서를 반전시킵니다:

```php
$collection = collect(['a', 'b', 'c', 'd', 'e']);

$reversed = $collection->reverse();

$reversed->all();

/*
    [
        4 => 'e',
        3 => 'd',
        2 => 'c',
        1 => 'b',
        0 => 'a',
    ]
*/
```

<a name="method-search"></a>
#### `search()` {.collection-method}

`search` 메서드는 컬렉션에서 주어진 값을 검색하고 발견되면 키를 반환합니다. 아이템을 찾을 수 없으면 `false`가 반환됩니다:

```php
$collection = collect([2, 4, 6, 8]);

$collection->search(4);

// 1
```

검색은 "느슨한(loose)" 비교를 사용하여 수행됩니다. 즉, 정수 값을 가진 문자열은 같은 값의 정수와 동일하게 간주됩니다. "엄격한(strict)" 비교를 사용하려면 메서드에 두 번째 인수로 `true`를 전달하세요:

```php
collect([2, 4, 6, 8])->search('4', $strict = true);

// false
```

또는, 주어진 조건을 통과하는 첫 번째 아이템을 검색하기 위해 자체 클로저를 제공할 수 있습니다:

```php
collect([2, 4, 6, 8])->search(function (int $item, int $key) {
    return $item > 5;
});

// 2
```

<a name="method-select"></a>
#### `select()` {.collection-method}

`select` 메서드는 SQL `SELECT` 문과 유사하게 컬렉션에서 주어진 키를 선택합니다:

```php
$users = collect([
    ['name' => 'Taylor Otwell', 'role' => 'Developer', 'status' => 'active'],
    ['name' => 'Victoria Faith', 'role' => 'Researcher', 'status' => 'active'],
]);

$users->select(['name', 'role']);

/*
    [
        ['name' => 'Taylor Otwell', 'role' => 'Developer'],
        ['name' => 'Victoria Faith', 'role' => 'Researcher'],
    ],
*/
```

<a name="method-shift"></a>
#### `shift()` {.collection-method}

`shift` 메서드는 컬렉션에서 첫 번째 아이템을 제거하고 반환합니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift();

// 1

$collection->all();

// [2, 3, 4, 5]
```

`shift` 메서드에 정수를 전달하여 컬렉션 시작 부분에서 여러 아이템을 제거하고 반환할 수 있습니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift(3);

// collect([1, 2, 3])

$collection->all();

// [4, 5]
```

<a name="method-shuffle"></a>
#### `shuffle()` {.collection-method}

`shuffle` 메서드는 컬렉션의 아이템을 무작위로 섞습니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$shuffled = $collection->shuffle();

$shuffled->all();

// [3, 2, 5, 1, 4] - (무작위로 생성됨)
```

<a name="method-skip"></a>
#### `skip()` {.collection-method}

`skip` 메서드는 컬렉션의 시작 부분에서 주어진 수의 요소를 제거한 새 컬렉션을 반환합니다:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$collection = $collection->skip(4);

$collection->all();

// [5, 6, 7, 8, 9, 10]
```

<a name="method-skipuntil"></a>
#### `skipUntil()` {.collection-method}

`skipUntil` 메서드는 주어진 콜백이 `false`를 반환하는 동안 컬렉션의 아이템을 건너뜁니다. 콜백이 `true`를 반환하면 컬렉션의 나머지 모든 아이템이 새 컬렉션으로 반환됩니다:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(function (int $item) {
    return $item >= 3;
});

$subset->all();

// [3, 4]
```

`skipUntil` 메서드에 간단한 값을 전달하여 주어진 값을 찾을 때까지 모든 아이템을 건너뛸 수도 있습니다:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(3);

$subset->all();

// [3, 4]
```

> [!WARNING]
> 주어진 값을 찾을 수 없거나 콜백이 절대 `true`를 반환하지 않으면 `skipUntil` 메서드는 빈 컬렉션을 반환합니다.

<a name="method-skipwhile"></a>
#### `skipWhile()` {.collection-method}

`skipWhile` 메서드는 주어진 콜백이 `true`를 반환하는 동안 컬렉션의 아이템을 건너뜁니다. 콜백이 `false`를 반환하면 컬렉션의 나머지 모든 아이템이 새 컬렉션으로 반환됩니다:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipWhile(function (int $item) {
    return $item <= 3;
});

$subset->all();

// [4]
```

> [!WARNING]
> 콜백이 절대 `false`를 반환하지 않으면 `skipWhile` 메서드는 빈 컬렉션을 반환합니다.

<a name="method-slice"></a>
#### `slice()` {.collection-method}

`slice` 메서드는 주어진 인덱스에서 시작하는 컬렉션의 일부를 반환합니다:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$slice = $collection->slice(4);

$slice->all();

// [5, 6, 7, 8, 9, 10]
```

반환된 일부의 크기를 제한하려면 메서드의 두 번째 인수로 원하는 크기를 전달하세요:

```php
$slice = $collection->slice(4, 2);

$slice->all();

// [5, 6]
```

반환된 일부는 기본적으로 키를 유지합니다. 원래 키를 유지하지 않으려면 [values](#method-values) 메서드를 사용하여 재인덱싱할 수 있습니다.

<a name="method-sliding"></a>
#### `sliding()` {.collection-method}

`sliding` 메서드는 컬렉션의 아이템에 대한 "슬라이딩 윈도우" 뷰를 나타내는 청크의 새 컬렉션을 반환합니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(2);

$chunks->toArray();

// [[1, 2], [2, 3], [3, 4], [4, 5]]
```

이것은 [eachSpread](#method-eachspread) 메서드와 함께 사용할 때 특히 유용합니다:

```php
$transactions->sliding(2)->eachSpread(function (Collection $previous, Collection $current) {
    $current->total = $previous->total + $current->amount;
});
```

선택적으로 각 청크의 첫 번째 아이템 사이의 거리를 결정하는 두 번째 "step" 값을 전달할 수 있습니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(3, step: 2);

$chunks->toArray();

// [[1, 2, 3], [3, 4, 5]]
```

<a name="method-sole"></a>
#### `sole()` {.collection-method}

`sole` 메서드는 주어진 조건을 통과하는 컬렉션의 첫 번째 요소를 반환하지만, 조건이 정확히 하나의 요소와 일치하는 경우에만 반환합니다:

```php
collect([1, 2, 3, 4])->sole(function (int $value, int $key) {
    return $value === 2;
});

// 2
```

`sole` 메서드에 키/값 쌍을 전달할 수도 있으며, 이 경우 주어진 쌍과 일치하는 컬렉션의 첫 번째 요소를 반환하지만 정확히 하나의 요소가 일치하는 경우에만 반환합니다:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->sole('product', 'Chair');

// ['product' => 'Chair', 'price' => 100]
```

또한, 컬렉션에 하나의 요소만 있는 경우 인수 없이 `sole` 메서드를 호출하여 컬렉션의 첫 번째 요소를 가져올 수 있습니다:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
]);

$collection->sole();

// ['product' => 'Desk', 'price' => 200]
```

`sole` 메서드가 반환해야 하는 요소가 컬렉션에 없으면 `\Illuminate\Collections\ItemNotFoundException` 예외가 발생합니다. 반환해야 하는 요소가 둘 이상인 경우 `\Illuminate\Collections\MultipleItemsFoundException`이 발생합니다.

<a name="method-some"></a>
#### `some()` {.collection-method}

[contains](#method-contains) 메서드의 별칭입니다.

<a name="method-sort"></a>
#### `sort()` {.collection-method}

`sort` 메서드는 컬렉션을 정렬합니다. 정렬된 컬렉션은 원래 배열 키를 유지하므로, 다음 예제에서는 [values](#method-values) 메서드를 사용하여 키를 연속 번호 인덱스로 재설정합니다:

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sort();

$sorted->values()->all();

// [1, 2, 3, 4, 5]
```

정렬 요구사항이 더 복잡한 경우 자체 알고리즘으로 `sort`에 콜백을 전달할 수 있습니다. 컬렉션의 `sort` 메서드가 내부적으로 사용하는 [uasort](https://secure.php.net/manual/en/function.uasort.php#refsect1-function.uasort-parameters)에 대한 PHP 문서를 참조하세요.

> [!NOTE]
> 중첩된 배열이나 객체의 컬렉션을 정렬해야 하는 경우 [sortBy](#method-sortby) 및 [sortByDesc](#method-sortbydesc) 메서드를 참조하세요.

<a name="method-sortby"></a>
#### `sortBy()` {.collection-method}

`sortBy` 메서드는 주어진 키로 컬렉션을 정렬합니다. 정렬된 컬렉션은 원래 배열 키를 유지하므로, 다음 예제에서는 [values](#method-values) 메서드를 사용하여 키를 연속 번호 인덱스로 재설정합니다:

```php
$collection = collect([
    ['name' => 'Desk', 'price' => 200],
    ['name' => 'Chair', 'price' => 100],
    ['name' => 'Bookcase', 'price' => 150],
]);

$sorted = $collection->sortBy('price');

$sorted->values()->all();

/*
    [
        ['name' => 'Chair', 'price' => 100],
        ['name' => 'Bookcase', 'price' => 150],
        ['name' => 'Desk', 'price' => 200],
    ]
*/
```

`sortBy` 메서드는 두 번째 인수로 [정렬 플래그](https://www.php.net/manual/en/function.sort.php)를 허용합니다:

```php
$collection = collect([
    ['title' => 'Item 1'],
    ['title' => 'Item 12'],
    ['title' => 'Item 3'],
]);

$sorted = $collection->sortBy('title', SORT_NATURAL);

$sorted->values()->all();

/*
    [
        ['title' => 'Item 1'],
        ['title' => 'Item 3'],
        ['title' => 'Item 12'],
    ]
*/
```

또는, 컬렉션의 값을 정렬하는 방법을 결정하기 위해 자체 클로저를 전달할 수 있습니다:

```php
$collection = collect([
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$sorted = $collection->sortBy(function (array $product, int $key) {
    return count($product['colors']);
});

$sorted->values()->all();

/*
    [
        ['name' => 'Chair', 'colors' => ['Black']],
        ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
        ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
    ]
*/
```

여러 속성으로 컬렉션을 정렬하려면 정렬하려는 속성 배열을 전달할 수 있습니다:

```php
$collection = collect([
    ['name' => 'Taylor Otwell', 'age' => 34],
    ['name' => 'Abigail Otwell', 'age' => 30],
    ['name' => 'Taylor Otwell', 'age' => 36],
    ['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy(['name', 'age']);

$sorted->values()->all();

/*
    [
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Abigail Otwell', 'age' => 32],
        ['name' => 'Taylor Otwell', 'age' => 34],
        ['name' => 'Taylor Otwell', 'age' => 36],
    ]
*/
```



여러 속성과 방향으로 정렬할 때 `sortBy` 메서드에 정렬 작업 배열을 전달할 수 있습니다. 각 정렬 작업은 정렬하려는 속성과 원하는 정렬 방향으로 구성된 배열이어야 합니다:

```php
$collection = collect([
    ['name' => 'Taylor Otwell', 'age' => 34],
    ['name' => 'Abigail Otwell', 'age' => 30],
    ['name' => 'Taylor Otwell', 'age' => 36],
    ['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy([
    ['name', 'asc'],
    ['age', 'desc'],
]);

$sorted->values()->all();

/*
    [
        ['name' => 'Abigail Otwell', 'age' => 32],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Taylor Otwell', 'age' => 34],
    ]
*/
```

여러 속성으로 컬렉션을 정렬할 때 각 정렬 작업을 정의하는 클로저를 제공할 수도 있습니다:

```php
$collection = collect([
    ['name' => 'Taylor Otwell', 'age' => 34],
    ['name' => 'Abigail Otwell', 'age' => 30],
    ['name' => 'Taylor Otwell', 'age' => 36],
    ['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy([
    fn (array $a, array $b) => $a['name'] <=> $b['name'],
    fn (array $a, array $b) => $b['age'] <=> $a['age'],
]);

$sorted->values()->all();

/*
    [
        ['name' => 'Abigail Otwell', 'age' => 32],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Taylor Otwell', 'age' => 34],
    ]
*/
```

<a name="method-sortbydesc"></a>
#### `sortByDesc()` {.collection-method}

이 메서드는 [sortBy](#method-sortby) 메서드와 동일한 시그니처를 가지지만 컬렉션을 반대 순서로 정렬합니다.

<a name="method-sortdesc"></a>
#### `sortDesc()` {.collection-method}

이 메서드는 [sort](#method-sort) 메서드와 반대 순서로 컬렉션을 정렬합니다:

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sortDesc();

$sorted->values()->all();

// [5, 4, 3, 2, 1]
```

`sort`와 달리 `sortDesc`에 클로저를 전달할 수 없습니다. 대신 [sort](#method-sort) 메서드를 사용하고 비교를 반전시켜야 합니다.

<a name="method-sortkeys"></a>
#### `sortKeys()` {.collection-method}

`sortKeys` 메서드는 기본 연관 배열의 키로 컬렉션을 정렬합니다:

```php
$collection = collect([
    'id' => 22345,
    'first' => 'John',
    'last' => 'Doe',
]);

$sorted = $collection->sortKeys();

$sorted->all();

/*
    [
        'first' => 'John',
        'id' => 22345,
        'last' => 'Doe',
    ]
*/
```

<a name="method-sortkeysdesc"></a>
#### `sortKeysDesc()` {.collection-method}

이 메서드는 [sortKeys](#method-sortkeys) 메서드와 동일한 시그니처를 가지지만 컬렉션을 반대 순서로 정렬합니다.

<a name="method-sortkeysusing"></a>
#### `sortKeysUsing()` {.collection-method}

`sortKeysUsing` 메서드는 콜백을 사용하여 기본 연관 배열의 키로 컬렉션을 정렬합니다:

```php
$collection = collect([
    'ID' => 22345,
    'first' => 'John',
    'last' => 'Doe',
]);

$sorted = $collection->sortKeysUsing('strnatcasecmp');

$sorted->all();

/*
    [
        'first' => 'John',
        'ID' => 22345,
        'last' => 'Doe',
    ]
*/
```

콜백은 0보다 작거나 같거나 큰 정수를 반환하는 비교 함수여야 합니다. 자세한 정보는 `sortKeysUsing` 메서드가 내부적으로 사용하는 PHP 함수인 [uksort](https://www.php.net/manual/en/function.uksort.php#refsect1-function.uksort-parameters)에 대한 PHP 문서를 참조하세요.

<a name="method-splice"></a>
#### `splice()` {.collection-method}

`splice` 메서드는 지정된 인덱스에서 시작하는 아이템의 일부를 제거하고 반환합니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2);

$chunk->all();

// [3, 4, 5]

$collection->all();

// [1, 2]
```

결과 컬렉션의 크기를 제한하기 위해 두 번째 인수를 전달할 수 있습니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 4, 5]
```

또한, 컬렉션에서 제거된 아이템을 대체할 새 아이템을 포함하는 세 번째 인수를 전달할 수 있습니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1, [10, 11]);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 10, 11, 4, 5]
```

<a name="method-split"></a>
#### `split()` {.collection-method}

`split` 메서드는 컬렉션을 주어진 수의 그룹으로 나눕니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$groups = $collection->split(3);

$groups->all();

// [[1, 2], [3, 4], [5]]
```

<a name="method-splitin"></a>
#### `splitIn()` {.collection-method}

`splitIn` 메서드는 컬렉션을 주어진 수의 그룹으로 나누며, 마지막 그룹에 나머지를 할당하기 전에 비종료 그룹을 완전히 채웁니다:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$groups = $collection->splitIn(3);

$groups->all();

// [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
```

<a name="method-sum"></a>
#### `sum()` {.collection-method}

`sum` 메서드는 컬렉션의 모든 아이템의 합계를 반환합니다:

```php
collect([1, 2, 3, 4, 5])->sum();

// 15
```

컬렉션에 중첩된 배열이나 객체가 포함된 경우 합계할 값을 결정하는 데 사용할 키를 전달해야 합니다:

```php
$collection = collect([
    ['name' => 'JavaScript: The Good Parts', 'pages' => 176],
    ['name' => 'JavaScript: The Definitive Guide', 'pages' => 1096],
]);

$collection->sum('pages');

// 1272
```

또한, 컬렉션의 어떤 값을 합계할지 결정하기 위해 자체 클로저를 전달할 수 있습니다:

```php
$collection = collect([
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$collection->sum(function (array $product) {
    return count($product['colors']);
});

// 6
```

<a name="method-take"></a>
#### `take()` {.collection-method}

`take` 메서드는 지정된 수의 아이템으로 새 컬렉션을 반환합니다:

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(3);

$chunk->all();

// [0, 1, 2]
```

컬렉션 끝에서 지정된 수의 아이템을 가져오려면 음의 정수를 전달할 수도 있습니다:

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(-2);

$chunk->all();

// [4, 5]
```

<a name="method-takeuntil"></a>
#### `takeUntil()` {.collection-method}

`takeUntil` 메서드는 주어진 콜백이 `true`를 반환할 때까지 컬렉션의 아이템을 반환합니다:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(function (int $item) {
    return $item >= 3;
});

$subset->all();

// [1, 2]
```

`takeUntil` 메서드에 간단한 값을 전달하여 주어진 값을 찾을 때까지 아이템을 가져올 수도 있습니다:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(3);

$subset->all();

// [1, 2]
```

> [!WARNING]
> 주어진 값을 찾을 수 없거나 콜백이 절대 `true`를 반환하지 않으면 `takeUntil` 메서드는 컬렉션의 모든 아이템을 반환합니다.

<a name="method-takewhile"></a>
#### `takeWhile()` {.collection-method}

`takeWhile` 메서드는 주어진 콜백이 `false`를 반환할 때까지 컬렉션의 아이템을 반환합니다:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeWhile(function (int $item) {
    return $item < 3;
});

$subset->all();

// [1, 2]
```

> [!WARNING]
> 콜백이 절대 `false`를 반환하지 않으면 `takeWhile` 메서드는 컬렉션의 모든 아이템을 반환합니다.

<a name="method-tap"></a>
#### `tap()` {.collection-method}

`tap` 메서드는 컬렉션을 주어진 콜백에 전달하여 특정 지점에서 컬렉션을 "탭"하고 컬렉션 자체에 영향을 주지 않으면서 아이템으로 무언가를 수행할 수 있습니다. 그런 다음 `tap` 메서드에 의해 컬렉션이 반환됩니다:

```php
collect([2, 4, 3, 1, 5])
    ->sort()
    ->tap(function (Collection $collection) {
        Log::debug('Values after sorting', $collection->values()->all());
    })
    ->shift();

// 1
```

<a name="method-times"></a>
#### `times()` {.collection-method}

정적 `times` 메서드는 주어진 클로저를 지정된 횟수만큼 호출하여 새 컬렉션을 생성합니다:

```php
$collection = Collection::times(10, function (int $number) {
    return $number * 9;
});

$collection->all();

// [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
```

<a name="method-toarray"></a>
#### `toArray()` {.collection-method}

`toArray` 메서드는 컬렉션을 일반 PHP `array`로 변환합니다. 컬렉션의 값이 [Eloquent](/docs/{{version}}/eloquent) 모델인 경우, 모델도 배열로 변환됩니다:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toArray();

/*
    [
        ['name' => 'Desk', 'price' => 200],
    ]
*/
```

> [!WARNING]
> `toArray`는 `Arrayable` 인스턴스인 컬렉션의 모든 중첩된 객체도 배열로 변환합니다. 컬렉션의 기본 원시 배열을 얻으려면 [all](#method-all) 메서드를 대신 사용하세요.

<a name="method-tojson"></a>
#### `toJson()` {.collection-method}

`toJson` 메서드는 컬렉션을 JSON 직렬화 문자열로 변환합니다:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toJson();

// '{"name":"Desk", "price":200}'
```

<a name="method-transform"></a>
#### `transform()` {.collection-method}

`transform` 메서드는 컬렉션을 반복하며 컬렉션의 각 아이템으로 주어진 콜백을 호출합니다. 컬렉션의 아이템은 콜백이 반환하는 값으로 대체됩니다:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->transform(function (int $item, int $key) {
    return $item * 2;
});

$collection->all();

// [2, 4, 6, 8, 10]
```

> [!WARNING]
> 대부분의 다른 컬렉션 메서드와 달리, `transform`은 컬렉션 자체를 수정합니다. 대신 새 컬렉션을 생성하려면 [map](#method-map) 메서드를 사용하세요.

<a name="method-undot"></a>
#### `undot()` {.collection-method}

`undot` 메서드는 "점" 표기법을 사용하는 단일 차원 컬렉션을 다차원 컬렉션으로 확장합니다:

```php
$person = collect([
    'name.first_name' => 'Marie',
    'name.last_name' => 'Valentine',
    'address.line_1' => '2992 Eagle Drive',
    'address.line_2' => '',
    'address.suburb' => 'Detroit',
    'address.state' => 'MI',
    'address.postcode' => '48219'
]);

$person = $person->undot();

$person->toArray();

/*
    [
        "name" => [
            "first_name" => "Marie",
            "last_name" => "Valentine",
        ],
        "address" => [
            "line_1" => "2992 Eagle Drive",
            "line_2" => "",
            "suburb" => "Detroit",
            "state" => "MI",
            "postcode" => "48219",
        ],
    ]
*/
```

<a name="method-union"></a>
#### `union()` {.collection-method}

`union` 메서드는 주어진 배열을 컬렉션에 추가합니다. 주어진 배열에 원래 컬렉션에 이미 있는 키가 포함되어 있으면 원래 컬렉션의 값이 우선합니다:

```php
$collection = collect([1 => ['a'], 2 => ['b']]);

$union = $collection->union([3 => ['c'], 1 => ['d']]);

$union->all();

// [1 => ['a'], 2 => ['b'], 3 => ['c']]
```

<a name="method-unique"></a>
#### `unique()` {.collection-method}

`unique` 메서드는 컬렉션의 모든 고유한 아이템을 반환합니다. 반환된 컬렉션은 원래 배열 키를 유지하므로, 다음 예제에서는 [values](#method-values) 메서드를 사용하여 키를 연속 번호 인덱스로 재설정합니다:

```php
$collection = collect([1, 1, 2, 2, 3, 4, 2]);

$unique = $collection->unique();

$unique->values()->all();

// [1, 2, 3, 4]
```

중첩된 배열이나 객체를 다룰 때 고유성을 결정하는 데 사용되는 키를 지정할 수 있습니다:

```php
$collection = collect([
    ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
    ['name' => 'iPhone 5', 'brand' => 'Apple', 'type' => 'phone'],
    ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
    ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
    ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
]);

$unique = $collection->unique('brand');

$unique->values()->all();

/*
    [
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
    ]
*/
```

마지막으로, 아이템의 고유성을 결정하는 값을 지정하기 위해 `unique` 메서드에 자체 클로저를 전달할 수도 있습니다:

```php
$unique = $collection->unique(function (array $item) {
    return $item['brand'].$item['type'];
});

$unique->values()->all();

/*
    [
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
        ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
    ]
*/
```

`unique` 메서드는 아이템 값을 확인할 때 "느슨한(loose)" 비교를 사용합니다. 즉, 정수 값을 가진 문자열은 같은 값의 정수와 동일하게 간주됩니다. "엄격한(strict)" 비교를 사용하여 필터링하려면 [uniqueStrict](#method-uniquestrict) 메서드를 사용하세요.

> [!NOTE]
> 이 메서드의 동작은 [Eloquent 컬렉션](/docs/{{version}}/eloquent-collections#method-unique)을 사용할 때 수정됩니다.

<a name="method-uniquestrict"></a>
#### `uniqueStrict()` {.collection-method}

이 메서드는 [unique](#method-unique) 메서드와 동일한 시그니처를 가지지만 모든 값은 "엄격한(strict)" 비교를 사용하여 비교됩니다.

<a name="method-unless"></a>
#### `unless()` {.collection-method}

`unless` 메서드는 메서드에 주어진 첫 번째 인수가 `true`로 평가되지 않는 한 주어진 콜백을 실행합니다. 컬렉션 인스턴스와 `unless` 메서드에 주어진 첫 번째 인수가 클로저에 제공됩니다:

```php
$collection = collect([1, 2, 3]);

$collection->unless(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
});

$collection->unless(false, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

두 번째 콜백을 `unless` 메서드에 전달할 수 있습니다. `unless` 메서드에 주어진 첫 번째 인수가 `true`로 평가될 때 두 번째 콜백이 실행됩니다:

```php
$collection = collect([1, 2, 3]);

$collection->unless(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
}, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

`unless`의 반대는 [when](#method-when) 메서드를 참조하세요.

<a name="method-unlessempty"></a>
#### `unlessEmpty()` {.collection-method}

[whenNotEmpty](#method-whennotempty) 메서드의 별칭입니다.

<a name="method-unlessnotempty"></a>
#### `unlessNotEmpty()` {.collection-method}

[whenEmpty](#method-whenempty) 메서드의 별칭입니다.

<a name="method-unwrap"></a>
#### `unwrap()` {.collection-method}

정적 `unwrap` 메서드는 해당되는 경우 주어진 값에서 컬렉션의 기본 아이템을 반환합니다:

```php
Collection::unwrap(collect('John Doe'));

// ['John Doe']

Collection::unwrap(['John Doe']);

// ['John Doe']

Collection::unwrap('John Doe');

// 'John Doe'
```

<a name="method-value"></a>
#### `value()` {.collection-method}

`value` 메서드는 컬렉션의 첫 번째 요소에서 주어진 값을 검색합니다:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Speaker', 'price' => 400],
]);

$value = $collection->value('price');

// 200
```

<a name="method-values"></a>
#### `values()` {.collection-method}

`values` 메서드는 키가 연속 정수로 재설정된 새 컬렉션을 반환합니다:

```php
$collection = collect([
    10 => ['product' => 'Desk', 'price' => 200],
    11 => ['product' => 'Speaker', 'price' => 400],
]);

$values = $collection->values();

$values->all();

/*
    [
        0 => ['product' => 'Desk', 'price' => 200],
        1 => ['product' => 'Speaker', 'price' => 400],
    ]
*/
```

<a name="method-when"></a>
#### `when()` {.collection-method}

`when` 메서드는 메서드에 주어진 첫 번째 인수가 `true`로 평가될 때 주어진 콜백을 실행합니다. 컬렉션 인스턴스와 `when` 메서드에 주어진 첫 번째 인수가 클로저에 제공됩니다:

```php
$collection = collect([1, 2, 3]);

$collection->when(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
});

$collection->when(false, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 4]
```

두 번째 콜백을 `when` 메서드에 전달할 수 있습니다. `when` 메서드에 주어진 첫 번째 인수가 `false`로 평가될 때 두 번째 콜백이 실행됩니다:

```php
$collection = collect([1, 2, 3]);

$collection->when(false, function (Collection $collection, bool $value) {
    return $collection->push(4);
}, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

`when`의 반대는 [unless](#method-unless) 메서드를 참조하세요.

<a name="method-whenempty"></a>
#### `whenEmpty()` {.collection-method}

`whenEmpty` 메서드는 컬렉션이 비어 있을 때 주어진 콜백을 실행합니다:

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Michael', 'Tom']

$collection = collect();

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Adam']
```

컬렉션이 비어 있지 않을 때 실행될 두 번째 클로저를 `whenEmpty` 메서드에 전달할 수 있습니다:

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
}, function (Collection $collection) {
    return $collection->push('Taylor');
});

$collection->all();

// ['Michael', 'Tom', 'Taylor']
```

`whenEmpty`의 반대는 [whenNotEmpty](#method-whennotempty) 메서드를 참조하세요.

<a name="method-whennotempty"></a>
#### `whenNotEmpty()` {.collection-method}

`whenNotEmpty` 메서드는 컬렉션이 비어 있지 않을 때 주어진 콜백을 실행합니다:

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Michael', 'Tom', 'Adam']

$collection = collect();

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// []
```

컬렉션이 비어 있을 때 실행될 두 번째 클로저를 `whenNotEmpty` 메서드에 전달할 수 있습니다:

```php
$collection = collect();

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('Adam');
}, function (Collection $collection) {
    return $collection->push('Taylor');
});

$collection->all();

// ['Taylor']
```

`whenNotEmpty`의 반대는 [whenEmpty](#method-whenempty) 메서드를 참조하세요.

<a name="method-where"></a>
#### `where()` {.collection-method}

`where` 메서드는 주어진 키/값 쌍으로 컬렉션을 필터링합니다:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->where('price', 100);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

`where` 메서드는 아이템 값을 확인할 때 "느슨한(loose)" 비교를 사용합니다. 즉, 정수 값을 가진 문자열은 같은 값의 정수와 동일하게 간주됩니다. "엄격한(strict)" 비교를 사용하여 필터링하려면 [whereStrict](#method-wherestrict) 메서드를 사용하거나, `null` 값으로 필터링하려면 [whereNull](#method-wherenull) 및 [whereNotNull](#method-wherenotnull) 메서드를 사용하세요.

선택적으로 두 번째 매개변수로 비교 연산자를 전달할 수 있습니다. 지원되는 연산자는 '===', '!==', '!=', '==', '=', '<>', '>', '<', '>=', '<='입니다:

```php
$collection = collect([
    ['name' => 'Jim', 'platform' => 'Mac'],
    ['name' => 'Sally', 'platform' => 'Mac'],
    ['name' => 'Sue', 'platform' => 'Linux'],
]);

$filtered = $collection->where('platform', '!=', 'Linux');

$filtered->all();

/*
    [
        ['name' => 'Jim', 'platform' => 'Mac'],
        ['name' => 'Sally', 'platform' => 'Mac'],
    ]
*/
```

<a name="method-wherestrict"></a>
#### `whereStrict()` {.collection-method}

이 메서드는 [where](#method-where) 메서드와 동일한 시그니처를 가지지만 모든 값은 "엄격한(strict)" 비교를 사용하여 비교됩니다.

<a name="method-wherebetween"></a>
#### `whereBetween()` {.collection-method}

`whereBetween` 메서드는 지정된 아이템 값이 주어진 범위 내에 있는지 확인하여 컬렉션을 필터링합니다:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 80],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Pencil', 'price' => 30],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereBetween('price', [100, 200]);

$filtered->all();

/*
    [
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

<a name="method-wherein"></a>
#### `whereIn()` {.collection-method}

`whereIn` 메서드는 지정된 아이템 값이 주어진 배열에 포함되지 않는 요소를 컬렉션에서 제거합니다:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereIn('price', [150, 200]);

$filtered->all();

/*
    [
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Bookcase', 'price' => 150],
    ]
*/
```

`whereIn` 메서드는 아이템 값을 확인할 때 "느슨한(loose)" 비교를 사용합니다. "엄격한(strict)" 비교를 사용하여 필터링하려면 [whereInStrict](#method-whereinstrict) 메서드를 사용하세요.

<a name="method-whereinstrict"></a>
#### `whereInStrict()` {.collection-method}

이 메서드는 [whereIn](#method-wherein) 메서드와 동일한 시그니처를 가지지만 모든 값은 "엄격한(strict)" 비교를 사용하여 비교됩니다.

<a name="method-whereinstanceof"></a>
#### `whereInstanceOf()` {.collection-method}

`whereInstanceOf` 메서드는 주어진 클래스 타입으로 컬렉션을 필터링합니다:

```php
use App\Models\User;
use App\Models\Post;

$collection = collect([
    new User,
    new User,
    new Post,
]);

$filtered = $collection->whereInstanceOf(User::class);

$filtered->all();

// [App\Models\User, App\Models\User]
```

<a name="method-wherenotbetween"></a>
#### `whereNotBetween()` {.collection-method}

`whereNotBetween` 메서드는 지정된 아이템 값이 주어진 범위 밖에 있는지 확인하여 컬렉션을 필터링합니다:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 80],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Pencil', 'price' => 30],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereNotBetween('price', [100, 200]);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 80],
        ['product' => 'Pencil', 'price' => 30],
    ]
*/
```

<a name="method-wherenotin"></a>
#### `whereNotIn()` {.collection-method}

`whereNotIn` 메서드는 지정된 아이템 값이 주어진 배열에 포함된 요소를 컬렉션에서 제거합니다:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereNotIn('price', [150, 200]);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

`whereNotIn` 메서드는 아이템 값을 확인할 때 "느슨한(loose)" 비교를 사용합니다. "엄격한(strict)" 비교를 사용하여 필터링하려면 [whereNotInStrict](#method-wherenotinstrict) 메서드를 사용하세요.

<a name="method-wherenotinstrict"></a>
#### `whereNotInStrict()` {.collection-method}

이 메서드는 [whereNotIn](#method-wherenotin) 메서드와 동일한 시그니처를 가지지만 모든 값은 "엄격한(strict)" 비교를 사용하여 비교됩니다.

<a name="method-wherenotnull"></a>
#### `whereNotNull()` {.collection-method}

`whereNotNull` 메서드는 주어진 키가 `null`이 아닌 컬렉션의 아이템을 반환합니다:

```php
$collection = collect([
    ['name' => 'Desk'],
    ['name' => null],
    ['name' => 'Bookcase'],
    ['name' => 0],
    ['name' => ''],
]);

$filtered = $collection->whereNotNull('name');

$filtered->all();

/*
    [
        ['name' => 'Desk'],
        ['name' => 'Bookcase'],
        ['name' => 0],
        ['name' => ''],
    ]
*/
```

<a name="method-wherenull"></a>
#### `whereNull()` {.collection-method}

`whereNull` 메서드는 주어진 키가 `null`인 컬렉션의 아이템을 반환합니다:

```php
$collection = collect([
    ['name' => 'Desk'],
    ['name' => null],
    ['name' => 'Bookcase'],
    ['name' => 0],
    ['name' => ''],
]);

$filtered = $collection->whereNull('name');

$filtered->all();

/*
    [
        ['name' => null],
    ]
*/
```

<a name="method-wrap"></a>
#### `wrap()` {.collection-method}

정적 `wrap` 메서드는 해당되는 경우 주어진 값을 컬렉션으로 래핑합니다:

```php
use Illuminate\Support\Collection;

$collection = Collection::wrap('John Doe');

$collection->all();

// ['John Doe']

$collection = Collection::wrap(['John Doe']);

$collection->all();

// ['John Doe']

$collection = Collection::wrap(collect('John Doe'));

$collection->all();

// ['John Doe']
```

<a name="method-zip"></a>
#### `zip()` {.collection-method}

`zip` 메서드는 주어진 배열의 값을 해당 인덱스에서 원래 컬렉션의 값과 함께 병합합니다:

```php
$collection = collect(['Chair', 'Desk']);

$zipped = $collection->zip([100, 200]);

$zipped->all();

// [['Chair', 100], ['Desk', 200]]
```

<a name="higher-order-messages"></a>
## Higher Order 메시지

컬렉션은 컬렉션에서 일반적인 작업을 수행하기 위한 단축키인 "higher order 메시지"도 지원합니다. higher order 메시지를 제공하는 컬렉션 메서드는 [average](#method-average), [avg](#method-avg), [contains](#method-contains), [each](#method-each), [every](#method-every), [filter](#method-filter), [first](#method-first), [flatMap](#method-flatmap), [groupBy](#method-groupby), [keyBy](#method-keyby), [map](#method-map), [max](#method-max), [min](#method-min), [partition](#method-partition), [reject](#method-reject), [skipUntil](#method-skipuntil), [skipWhile](#method-skipwhile), [some](#method-some), [sortBy](#method-sortby), [sortByDesc](#method-sortbydesc), [sum](#method-sum), [takeUntil](#method-takeuntil), [takeWhile](#method-takewhile), [unique](#method-unique)입니다.

각 higher order 메시지는 컬렉션 인스턴스의 동적 속성으로 접근할 수 있습니다. 예를 들어, `each` higher order 메시지를 사용하여 컬렉션 내의 각 객체에서 메서드를 호출해 보겠습니다:

```php
use App\Models\User;

$users = User::where('votes', '>', 500)->get();

$users->each->markAsVip();
```

마찬가지로, `sum` higher order 메시지를 사용하여 사용자 컬렉션의 총 "votes" 수를 수집할 수 있습니다:

```php
$users = User::where('group', 'Development')->get();

return $users->sum->votes;
```

<a name="lazy-collections"></a>
## Lazy 컬렉션

<a name="lazy-collection-introduction"></a>
### 소개

> [!WARNING]
> Laravel의 lazy 컬렉션에 대해 더 배우기 전에, [PHP 제너레이터](https://www.php.net/manual/en/language.generators.overview.php)에 대해 먼저 익숙해지는 시간을 가지세요.

이미 강력한 `Collection` 클래스를 보완하기 위해, `LazyCollection` 클래스는 PHP의 [제너레이터](https://www.php.net/manual/en/language.generators.overview.php)를 활용하여 메모리 사용량을 낮게 유지하면서 매우 큰 데이터셋을 다룰 수 있게 해줍니다.

예를 들어, 애플리케이션이 Laravel의 컬렉션 메서드를 활용하여 로그를 파싱하면서 수 기가바이트 크기의 로그 파일을 처리해야 한다고 상상해 보세요. 전체 파일을 한 번에 메모리에 읽어들이는 대신, lazy 컬렉션을 사용하면 주어진 시간에 파일의 작은 부분만 메모리에 유지할 수 있습니다:

```php
use App\Models\LogEntry;
use Illuminate\Support\LazyCollection;

LazyCollection::make(function () {
    $handle = fopen('log.txt', 'r');

    while (($line = fgets($handle)) !== false) {
        yield $line;
    }

    fclose($handle);
})->chunk(4)->map(function (array $lines) {
    return LogEntry::fromLines($lines);
})->each(function (LogEntry $logEntry) {
    // 로그 항목 처리...
});
```

또는 10,000개의 Eloquent 모델을 반복해야 한다고 상상해 보세요. 전통적인 Laravel 컬렉션을 사용하면 10,000개의 Eloquent 모델이 모두 동시에 메모리에 로드되어야 합니다:

```php
use App\Models\User;

$users = User::all()->filter(function (User $user) {
    return $user->id > 500;
});
```

그러나 쿼리 빌더의 `cursor` 메서드는 `LazyCollection` 인스턴스를 반환합니다. 이를 통해 데이터베이스에 대해 단일 쿼리만 실행하면서도 한 번에 하나의 Eloquent 모델만 메모리에 로드할 수 있습니다. 이 예제에서 `filter` 콜백은 실제로 각 사용자를 개별적으로 반복할 때까지 실행되지 않으므로 메모리 사용량을 크게 줄일 수 있습니다:

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

<a name="creating-lazy-collections"></a>
### Lazy 컬렉션 생성하기

lazy 컬렉션 인스턴스를 생성하려면 PHP 제너레이터 함수를 컬렉션의 `make` 메서드에 전달해야 합니다:

```php
use Illuminate\Support\LazyCollection;

LazyCollection::make(function () {
    $handle = fopen('log.txt', 'r');

    while (($line = fgets($handle)) !== false) {
        yield $line;
    }

    fclose($handle);
});
```

<a name="the-enumerable-contract"></a>
### Enumerable Contract

`Collection` 클래스에서 사용 가능한 거의 모든 메서드는 `LazyCollection` 클래스에서도 사용할 수 있습니다. 이 두 클래스 모두 다음 메서드를 정의하는 `Illuminate\Support\Enumerable` contract를 구현합니다:

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

[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[chunk](#method-chunk)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffKeys](#method-diffkeys)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectAssoc](#method-intersectAssoc)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[pipe](#method-pipe)
[pluck](#method-pluck)
[random](#method-random)
[reduce](#method-reduce)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[shuffle](#method-shuffle)
[skip](#method-skip)
[slice](#method-slice)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[split](#method-split)
[sum](#method-sum)
[take](#method-take)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

> [!WARNING]
> 컬렉션을 변경하는 메서드들(`shift`, `pop`, `prepend` 등)은 `LazyCollection` 클래스에서 사용할 수 **없습니다**.

<a name="lazy-collection-methods"></a>
### Lazy 컬렉션 메서드

`Enumerable` contract에 정의된 메서드 외에도, `LazyCollection` 클래스는 다음 메서드를 포함합니다:

<a name="method-takeUntilTimeout"></a>
#### `takeUntilTimeout()` {.collection-method}

`takeUntilTimeout` 메서드는 지정된 시간까지 값을 열거하는 새로운 lazy 컬렉션을 반환합니다. 그 시간 이후에는 컬렉션이 열거를 중지합니다:

```php
$lazyCollection = LazyCollection::times(INF)
    ->takeUntilTimeout(now()->addMinute());

$lazyCollection->each(function (int $number) {
    dump($number);

    sleep(1);
});

// 1
// 2
// ...
// 58
// 59
```

이 메서드의 사용법을 설명하기 위해, 커서를 사용하여 데이터베이스에서 인보이스를 제출하는 애플리케이션을 상상해 보세요. 15분마다 실행되고 최대 14분 동안만 인보이스를 처리하는 [예약 작업](/docs/{{version}}/scheduling)을 정의할 수 있습니다:

```php
use App\Models\Invoice;
use Illuminate\Support\Carbon;

Invoice::pending()->cursor()
    ->takeUntilTimeout(
        Carbon::createFromTimestamp(LARAVEL_START)->add(14, 'minutes')
    )
    ->each(fn (Invoice $invoice) => $invoice->submit());
```

<a name="method-tapEach"></a>
#### `tapEach()` {.collection-method}

`each` 메서드가 컬렉션의 각 항목에 대해 주어진 콜백을 즉시 호출하는 반면, `tapEach` 메서드는 항목이 목록에서 하나씩 꺼내질 때만 주어진 콜백을 호출합니다:

```php
// 아직 아무것도 덤프되지 않았습니다...
$lazyCollection = LazyCollection::times(INF)->tapEach(function (int $value) {
    dump($value);
});

// 세 개의 항목이 덤프됩니다...
$array = $lazyCollection->take(3)->all();

// 1
// 2
// 3
```

<a name="method-remember"></a>
#### `remember()` {.collection-method}

`remember` 메서드는 이미 열거된 값을 기억하고 이후 컬렉션 열거에서 다시 검색하지 않는 새로운 lazy 컬렉션을 반환합니다:

```php
// 아직 쿼리가 실행되지 않았습니다...
$users = User::cursor()->remember();

// 쿼리가 실행됩니다...
// 처음 5명의 사용자가 데이터베이스에서 하이드레이트됩니다...
$users->take(5)->all();

// 처음 5명의 사용자는 컬렉션의 캐시에서 가져옵니다...
// 나머지는 데이터베이스에서 하이드레이트됩니다...
$users->take(20)->all();
```

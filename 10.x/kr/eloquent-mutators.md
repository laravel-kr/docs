# Eloquent: 뮤테이터(Mutators)와 캐스팅(Casting)

- [소개](#introduction)
- [접근자와 뮤테이터](#accessors-and-mutators)
    - [접근자 정의하기](#defining-an-accessor)
    - [뮤테이터 정의하기](#defining-a-mutator)
- [속성 캐스팅](#attribute-casting)
    - [배열과 JSON 캐스팅](#array-and-json-casting)
    - [날짜 캐스팅](#date-casting)
    - [Enum 캐스팅](#enum-casting)
    - [암호화 캐스팅](#encrypted-casting)
    - [쿼리 시점 캐스팅](#query-time-casting)
- [커스텀 캐스트](#custom-casts)
    - [값 객체 캐스팅](#value-object-casting)
    - [배열 / JSON 직렬화](#array-json-serialization)
    - [인바운드 캐스팅](#inbound-casting)
    - [캐스트 파라미터](#cast-parameters)
    - [Castables](#castables)

<a name="introduction"></a>
## 소개

접근자(Accessors), 뮤테이터(Mutators), 속성 캐스팅(Attribute Casting)을 사용하면 모델 인스턴스에서 Eloquent 속성 값을 조회하거나 설정할 때 값을 변환할 수 있습니다. 예를 들어, [Laravel 암호화기](/docs/{{version}}/encryption)를 사용하여 데이터베이스에 저장할 때 값을 암호화하고, Eloquent 모델에서 해당 속성에 접근할 때 자동으로 복호화할 수 있습니다. 또는 데이터베이스에 JSON 문자열로 저장된 값을 Eloquent 모델을 통해 접근할 때 배열로 변환할 수도 있습니다.

<a name="accessors-and-mutators"></a>
## 접근자와 뮤테이터(Accessors and Mutators)

<a name="defining-an-accessor"></a>
### 접근자 정의하기

접근자(Accessor)는 Eloquent 속성 값에 접근할 때 값을 변환합니다. 접근자를 정의하려면 모델에 접근 가능한 속성을 나타내는 protected 메서드를 생성합니다. 이 메서드 이름은 해당되는 경우 실제 기본 모델 속성/데이터베이스 컬럼의 "카멜 케이스(camel case)" 표현과 일치해야 합니다.

이 예제에서는 `first_name` 속성에 대한 접근자를 정의합니다. `first_name` 속성의 값을 조회하려고 할 때 Eloquent가 자동으로 이 접근자를 호출합니다. 모든 속성 접근자/뮤테이터 메서드는 반환 타입 힌트로 `Illuminate\Database\Eloquent\Casts\Attribute`를 선언해야 합니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자의 이름을 가져옵니다.
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucfirst($value),
        );
    }
}
```

모든 접근자 메서드는 속성이 어떻게 접근되고, 선택적으로 어떻게 변형될지 정의하는 `Attribute` 인스턴스를 반환합니다. 이 예제에서는 속성이 어떻게 접근될지만 정의하고 있습니다. 이를 위해 `Attribute` 클래스 생성자에 `get` 인수를 제공합니다.

보시다시피, 컬럼의 원래 값이 접근자에 전달되어 값을 조작하고 반환할 수 있습니다. 접근자의 값에 접근하려면 모델 인스턴스에서 `first_name` 속성에 간단히 접근하면 됩니다:

```php
use App\Models\User;

$user = User::find(1);

$firstName = $user->first_name;
```

> [!NOTE]
> 이러한 계산된 값을 모델의 배열/JSON 표현에 추가하려면 [해당 값을 추가해야 합니다](/docs/{{version}}/eloquent-serialization#appending-values-to-json).

<a name="building-value-objects-from-multiple-attributes"></a>
#### 여러 속성에서 값 객체 만들기

때때로 접근자가 여러 모델 속성을 단일 "값 객체(value object)"로 변환해야 할 수 있습니다. 이를 위해 `get` 클로저는 두 번째 인수로 `$attributes`를 받을 수 있으며, 이는 클로저에 자동으로 제공되고 모델의 모든 현재 속성 배열을 포함합니다:

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 사용자의 주소와 상호작용합니다.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    );
}
```

<a name="accessor-caching"></a>
#### 접근자 캐싱

접근자에서 값 객체를 반환할 때, 값 객체에 대한 모든 변경 사항은 모델이 저장되기 전에 자동으로 모델에 다시 동기화됩니다. 이는 Eloquent가 접근자에서 반환된 인스턴스를 유지하여 접근자가 호출될 때마다 동일한 인스턴스를 반환할 수 있기 때문에 가능합니다:

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Line 1 Value';
$user->address->lineTwo = 'Updated Address Line 2 Value';

$user->save();
```

그러나 문자열이나 불리언과 같은 원시 값에 대해서도 캐싱을 활성화하고 싶을 때가 있습니다. 특히 계산 집약적인 경우에 그렇습니다. 이를 위해 접근자를 정의할 때 `shouldCache` 메서드를 호출할 수 있습니다:

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

속성의 객체 캐싱 동작을 비활성화하려면 속성을 정의할 때 `withoutObjectCaching` 메서드를 호출할 수 있습니다:

```php
/**
 * 사용자의 주소와 상호작용합니다.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    )->withoutObjectCaching();
}
```

<a name="defining-a-mutator"></a>
### 뮤테이터 정의하기

뮤테이터(Mutator)는 Eloquent 속성 값이 설정될 때 값을 변환합니다. 뮤테이터를 정의하려면 속성을 정의할 때 `set` 인수를 제공하면 됩니다. `first_name` 속성에 대한 뮤테이터를 정의해 보겠습니다. 이 뮤테이터는 모델에서 `first_name` 속성의 값을 설정하려고 할 때 자동으로 호출됩니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자의 이름과 상호작용합니다.
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucfirst($value),
            set: fn (string $value) => strtolower($value),
        );
    }
}
```

뮤테이터 클로저는 속성에 설정되는 값을 받아 값을 조작하고 조작된 값을 반환할 수 있습니다. 뮤테이터를 사용하려면 Eloquent 모델에서 `first_name` 속성을 설정하기만 하면 됩니다:

```php
use App\Models\User;

$user = User::find(1);

$user->first_name = 'Sally';
```

이 예제에서 `set` 콜백은 `Sally` 값과 함께 호출됩니다. 그러면 뮤테이터가 이름에 `strtolower` 함수를 적용하고 결과 값을 모델의 내부 `$attributes` 배열에 설정합니다.

<a name="mutating-multiple-attributes"></a>
#### 여러 속성 변형하기

때때로 뮤테이터가 기본 모델에 여러 속성을 설정해야 할 수 있습니다. 이를 위해 `set` 클로저에서 배열을 반환할 수 있습니다. 배열의 각 키는 모델과 연관된 기본 속성/데이터베이스 컬럼과 일치해야 합니다:

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 사용자의 주소와 상호작용합니다.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
        set: fn (Address $value) => [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ],
    );
}
```

<a name="attribute-casting"></a>
## 속성 캐스팅(Attribute Casting)

속성 캐스팅은 모델에 추가 메서드를 정의할 필요 없이 접근자 및 뮤테이터와 유사한 기능을 제공합니다. 대신 모델의 `$casts` 프로퍼티는 속성을 일반적인 데이터 타입으로 변환하는 편리한 방법을 제공합니다.

`$casts` 프로퍼티는 키가 캐스팅할 속성 이름이고 값이 컬럼을 캐스팅할 타입인 배열이어야 합니다. 지원되는 캐스트 타입은 다음과 같습니다:

<div class="content-list" markdown="1">

- `array`
- `AsStringable::class`
- `boolean`
- `collection`
- `date`
- `datetime`
- `immutable_date`
- `immutable_datetime`
- <code>decimal:&lt;precision&gt;</code>
- `double`
- `encrypted`
- `encrypted:array`
- `encrypted:collection`
- `encrypted:object`
- `float`
- `hashed`
- `integer`
- `object`
- `real`
- `string`
- `timestamp`

</div>

속성 캐스팅을 시연하기 위해 데이터베이스에 정수(`0` 또는 `1`)로 저장된 `is_admin` 속성을 불리언 값으로 캐스팅해 보겠습니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성.
     *
     * @var array
     */
    protected $casts = [
        'is_admin' => 'boolean',
    ];
}
```

캐스트를 정의한 후, 기본 값이 데이터베이스에 정수로 저장되어 있더라도 `is_admin` 속성에 접근하면 항상 불리언으로 캐스팅됩니다:

```php
$user = App\Models\User::find(1);

if ($user->is_admin) {
    // ...
}
```

런타임에 새로운 임시 캐스트를 추가해야 하는 경우 `mergeCasts` 메서드를 사용할 수 있습니다. 이 캐스트 정의는 모델에 이미 정의된 캐스트에 추가됩니다:

```php
$user->mergeCasts([
    'is_admin' => 'integer',
    'options' => 'object',
]);
```

> [!WARNING]
> `null`인 속성은 캐스팅되지 않습니다. 또한 관계(relationship)와 동일한 이름의 캐스트(또는 속성)를 정의하거나 모델의 기본 키에 캐스트를 할당해서는 안 됩니다.

<a name="stringable-casting"></a>
#### Stringable 캐스팅

`Illuminate\Database\Eloquent\Casts\AsStringable` 캐스트 클래스를 사용하여 모델 속성을 [fluent `Illuminate\Support\Stringable` 객체](/docs/{{version}}/strings#fluent-strings-method-list)로 캐스팅할 수 있습니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsStringable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성.
     *
     * @var array
     */
    protected $casts = [
        'directory' => AsStringable::class,
    ];
}
```

<a name="array-and-json-casting"></a>
### 배열과 JSON 캐스팅

`array` 캐스트는 직렬화된 JSON으로 저장된 컬럼을 다룰 때 특히 유용합니다. 예를 들어, 데이터베이스에 직렬화된 JSON을 포함하는 `JSON` 또는 `TEXT` 필드 타입이 있는 경우, 해당 속성에 `array` 캐스트를 추가하면 Eloquent 모델에서 접근할 때 자동으로 PHP 배열로 역직렬화됩니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성.
     *
     * @var array
     */
    protected $casts = [
        'options' => 'array',
    ];
}
```

캐스트가 정의되면 `options` 속성에 접근하면 JSON에서 PHP 배열로 자동 역직렬화됩니다. `options` 속성의 값을 설정하면 주어진 배열이 자동으로 JSON으로 다시 직렬화되어 저장됩니다:

```php
use App\Models\User;

$user = User::find(1);

$options = $user->options;

$options['key'] = 'value';

$user->options = $options;

$user->save();
```

더 간결한 구문으로 JSON 속성의 단일 필드를 업데이트하려면 [속성을 대량 할당 가능하게 만들고](/docs/{{version}}/eloquent#mass-assignment-json-columns) `update` 메서드를 호출할 때 `->` 연산자를 사용할 수 있습니다:

```php
$user = User::find(1);

$user->update(['options->key' => 'value']);
```

<a name="array-object-and-collection-casting"></a>
#### ArrayObject와 컬렉션 캐스팅

표준 `array` 캐스트가 많은 애플리케이션에 충분하지만, 몇 가지 단점이 있습니다. `array` 캐스트는 원시 타입을 반환하므로 배열의 오프셋을 직접 변형하는 것이 불가능합니다. 예를 들어, 다음 코드는 PHP 오류를 발생시킵니다:

```php
$user = User::find(1);

$user->options['key'] = $value;
```

이를 해결하기 위해 Laravel은 JSON 속성을 [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php) 클래스로 캐스팅하는 `AsArrayObject` 캐스트를 제공합니다. 이 기능은 Laravel의 [커스텀 캐스트](#custom-casts) 구현을 사용하여 구현되었으며, Laravel이 변형된 객체를 지능적으로 캐시하고 변환하여 PHP 오류를 발생시키지 않고 개별 오프셋을 수정할 수 있게 합니다. `AsArrayObject` 캐스트를 사용하려면 속성에 할당하기만 하면 됩니다:

```php
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

/**
 * 캐스팅할 속성.
 *
 * @var array
 */
protected $casts = [
    'options' => AsArrayObject::class,
];
```

마찬가지로 Laravel은 JSON 속성을 Laravel [컬렉션](/docs/{{version}}/collections) 인스턴스로 캐스팅하는 `AsCollection` 캐스트를 제공합니다:

```php
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * 캐스팅할 속성.
 *
 * @var array
 */
protected $casts = [
    'options' => AsCollection::class,
];
```

`AsCollection` 캐스트가 Laravel의 기본 컬렉션 클래스 대신 커스텀 컬렉션 클래스를 인스턴스화하도록 하려면 캐스트 인수로 컬렉션 클래스 이름을 제공할 수 있습니다:

```php
use App\Collections\OptionCollection;
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * 캐스팅할 속성.
 *
 * @var array
 */
protected $casts = [
    'options' => AsCollection::class.':'.OptionCollection::class,
];
```

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Support\Arrayable;
use JsonSerializable;

class Option implements Arrayable, JsonSerializable
{
    public string $name;
    public mixed $value;
    public bool $isLocked;

    /**
     * 새로운 Option 인스턴스를 생성합니다.
     */
    public function __construct(array $data)
    {
        $this->name = $data['name'];
        $this->value = $data['value'];
        $this->isLocked = $data['is_locked'];
    }

    /**
     * 인스턴스를 배열로 가져옵니다.
     *
     * @return array{name: string, data: string, is_locked: bool}
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'value' => $this->value,
            'is_locked' => $this->isLocked,
        ];
    }

    /**
     * JSON으로 직렬화할 데이터를 지정합니다.
     *
     * @return array{name: string, data: string, is_locked: bool}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
```

<a name="date-casting"></a>
### 날짜 캐스팅

기본적으로 Eloquent는 `created_at`과 `updated_at` 컬럼을 PHP `DateTime` 클래스를 확장하고 다양한 유용한 메서드를 제공하는 [Carbon](https://github.com/briannesbitt/Carbon) 인스턴스로 캐스팅합니다. 모델의 `$casts` 프로퍼티 배열에 추가 날짜 캐스트를 정의하여 추가 날짜 속성을 캐스팅할 수 있습니다. 일반적으로 날짜는 `datetime` 또는 `immutable_datetime` 캐스트 타입을 사용하여 캐스팅해야 합니다.

`date` 또는 `datetime` 캐스트를 정의할 때 날짜의 형식도 지정할 수 있습니다. 이 형식은 [모델이 배열 또는 JSON으로 직렬화될 때](/docs/{{version}}/eloquent-serialization) 사용됩니다:

```php
/**
 * 캐스팅할 속성.
 *
 * @var array
 */
protected $casts = [
    'created_at' => 'datetime:Y-m-d',
];
```

컬럼이 날짜로 캐스팅되면 해당 모델 속성 값을 UNIX 타임스탬프, 날짜 문자열(`Y-m-d`), 날짜-시간 문자열 또는 `DateTime` / `Carbon` 인스턴스로 설정할 수 있습니다. 날짜 값은 올바르게 변환되어 데이터베이스에 저장됩니다.

모델에 `serializeDate` 메서드를 정의하여 모델의 모든 날짜에 대한 기본 직렬화 형식을 커스터마이즈할 수 있습니다. 이 메서드는 데이터베이스 저장을 위한 날짜 형식에는 영향을 미치지 않습니다:

```php
/**
 * 배열/JSON 직렬화를 위해 날짜를 준비합니다.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

데이터베이스 내에서 모델의 날짜를 실제로 저장할 때 사용할 형식을 지정하려면 모델에 `$dateFormat` 프로퍼티를 정의해야 합니다:

```php
/**
 * 모델의 날짜 컬럼 저장 형식.
 *
 * @var string
 */
protected $dateFormat = 'U';
```

<a name="date-casting-and-timezones"></a>
#### 날짜 캐스팅, 직렬화, 타임존

기본적으로 `date` 및 `datetime` 캐스트는 애플리케이션의 `timezone` 설정 옵션에 지정된 타임존과 관계없이 날짜를 UTC ISO-8601 날짜 문자열(`YYYY-MM-DDTHH:MM:SS.uuuuuuZ`)로 직렬화합니다. 이 직렬화 형식을 항상 사용하고 애플리케이션의 `timezone` 설정 옵션을 기본 `UTC` 값에서 변경하지 않고 애플리케이션의 날짜를 UTC 타임존에 저장하는 것이 강력히 권장됩니다. 애플리케이션 전체에서 일관되게 UTC 타임존을 사용하면 PHP와 JavaScript로 작성된 다른 날짜 조작 라이브러리와의 상호 운용성을 최대화할 수 있습니다.

`datetime:Y-m-d H:i:s`와 같이 `date` 또는 `datetime` 캐스트에 커스텀 형식이 적용되면, 날짜 직렬화 중에 Carbon 인스턴스의 내부 타임존이 사용됩니다. 일반적으로 이는 애플리케이션의 `timezone` 설정 옵션에 지정된 타임존입니다.

<a name="enum-casting"></a>
### Enum 캐스팅

Eloquent를 사용하면 속성 값을 PHP [Enum](https://www.php.net/manual/en/language.enumerations.backed.php)으로 캐스팅할 수도 있습니다. 이를 위해 모델의 `$casts` 프로퍼티 배열에서 캐스팅할 속성과 enum을 지정할 수 있습니다:

```php
use App\Enums\ServerStatus;

/**
 * 캐스팅할 속성.
 *
 * @var array
 */
protected $casts = [
    'status' => ServerStatus::class,
];
```

모델에 캐스트를 정의하면 지정된 속성이 속성과 상호작용할 때 자동으로 enum으로 캐스팅되거나 enum에서 캐스팅됩니다:

```php
if ($server->status == ServerStatus::Provisioned) {
    $server->status = ServerStatus::Ready;

    $server->save();
}
```

<a name="casting-arrays-of-enums"></a>
#### Enum 배열 캐스팅

때때로 모델이 단일 컬럼에 enum 값의 배열을 저장해야 할 수 있습니다. 이를 위해 Laravel이 제공하는 `AsEnumArrayObject` 또는 `AsEnumCollection` 캐스트를 활용할 수 있습니다:

```php
use App\Enums\ServerStatus;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

/**
 * 캐스팅할 속성.
 *
 * @var array
 */
protected $casts = [
    'statuses' => AsEnumCollection::class.':'.ServerStatus::class,
];
```

<a name="encrypted-casting"></a>
### 암호화 캐스팅

`encrypted` 캐스트는 Laravel의 내장 [암호화](/docs/{{version}}/encryption) 기능을 사용하여 모델의 속성 값을 암호화합니다. 또한 `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject`, `AsEncryptedCollection` 캐스트는 암호화되지 않은 대응 캐스트와 동일하게 작동하지만, 예상대로 기본 값이 데이터베이스에 저장될 때 암호화됩니다.

암호화된 텍스트의 최종 길이는 예측할 수 없고 일반 텍스트보다 길기 때문에 관련 데이터베이스 컬럼이 `TEXT` 타입 이상인지 확인하세요. 또한 값이 데이터베이스에서 암호화되기 때문에 암호화된 속성 값을 쿼리하거나 검색할 수 없습니다.

<a name="key-rotation"></a>
#### 키 로테이션

아시다시피 Laravel은 애플리케이션의 `app` 설정 파일에 지정된 `key` 설정 값을 사용하여 문자열을 암호화합니다. 일반적으로 이 값은 `APP_KEY` 환경 변수의 값과 일치합니다. 애플리케이션의 암호화 키를 로테이션해야 하는 경우 [우아하게 로테이션할 수 있습니다](/docs/{{version}}/encryption#gracefully-rotating-encryption-keys).

<a name="query-time-casting"></a>
### 쿼리 시점 캐스팅

때때로 테이블에서 원시 값을 선택할 때와 같이 쿼리를 실행하는 동안 캐스트를 적용해야 할 수 있습니다. 예를 들어 다음 쿼리를 고려해 보세요:

```php
use App\Models\Post;
use App\Models\User;

$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
                ->whereColumn('user_id', 'users.id')
])->get();
```

이 쿼리 결과의 `last_posted_at` 속성은 단순한 문자열이 될 것입니다. 쿼리를 실행할 때 이 속성에 `datetime` 캐스트를 적용할 수 있다면 좋을 것입니다. 다행히 `withCasts` 메서드를 사용하여 이를 수행할 수 있습니다:

```php
$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
                ->whereColumn('user_id', 'users.id')
])->withCasts([
    'last_posted_at' => 'datetime'
])->get();
```

<a name="custom-casts"></a>
## 커스텀 캐스트(Custom Casts)

Laravel에는 다양한 내장 유용한 캐스트 타입이 있지만, 때때로 자신만의 캐스트 타입을 정의해야 할 수 있습니다. 캐스트를 생성하려면 `make:cast` Artisan 명령을 실행합니다. 새 캐스트 클래스는 `app/Casts` 디렉토리에 배치됩니다:

```shell
php artisan make:cast AsJson
```

모든 커스텀 캐스트 클래스는 `CastsAttributes` 인터페이스를 구현합니다. 이 인터페이스를 구현하는 클래스는 `get`과 `set` 메서드를 정의해야 합니다. `get` 메서드는 데이터베이스의 원시 값을 캐스트 값으로 변환하는 역할을 하고, `set` 메서드는 캐스트 값을 데이터베이스에 저장할 수 있는 원시 값으로 변환해야 합니다. 예를 들어, 내장 `json` 캐스트 타입을 커스텀 캐스트 타입으로 다시 구현해 보겠습니다:

```php
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class AsJson implements CastsAttributes
{
    /**
     * 주어진 값을 캐스팅합니다.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function get(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): array {
        return json_decode($value, true);
    }

    /**
     * 저장을 위해 주어진 값을 준비합니다.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): string {
        return json_encode($value);
    }
}
```

커스텀 캐스트 타입을 정의하면 클래스 이름을 사용하여 모델 속성에 첨부할 수 있습니다:

```php
<?php

namespace App\Models;

use App\Casts\AsJson;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성.
     *
     * @var array
     */
    protected $casts = [
        'options' => AsJson::class,
    ];
}
```

<a name="value-object-casting"></a>
### 값 객체 캐스팅

값을 원시 타입으로만 캐스팅하는 것에 국한되지 않습니다. 값을 객체로 캐스팅할 수도 있습니다. 값을 객체로 캐스팅하는 커스텀 캐스트를 정의하는 것은 원시 타입으로 캐스팅하는 것과 매우 유사합니다. 그러나 값 객체가 둘 이상의 데이터베이스 컬럼을 포함하는 경우 `set` 메서드는 모델에 원시 저장 가능한 값을 설정하는 데 사용될 키/값 쌍의 배열을 반환해야 합니다. 값 객체가 단일 컬럼에만 영향을 미치는 경우 저장 가능한 값만 반환하면 됩니다.

예를 들어, 여러 모델 값을 단일 `Address` 값 객체로 캐스팅하는 커스텀 캐스트 클래스를 정의해 보겠습니다. `Address` 값 객체에는 `lineOne`과 `lineTwo`라는 두 개의 공개 프로퍼티가 있다고 가정합니다:

```php
<?php

namespace App\Casts;

use App\ValueObjects\Address;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

class AsAddress implements CastsAttributes
{
    /**
     * 주어진 값을 캐스팅합니다.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): Address {
        return new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two']
        );
    }

    /**
     * 저장을 위해 주어진 값을 준비합니다.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, string>
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): array {
        if (! $value instanceof Address) {
            throw new InvalidArgumentException('The given value is not an Address instance.');
        }

        return [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ];
    }
}
```

값 객체로 캐스팅할 때, 값 객체에 대한 모든 변경 사항은 모델이 저장되기 전에 자동으로 모델에 다시 동기화됩니다:

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Value';

$user->save();
```

> [!NOTE]
> 값 객체를 포함하는 Eloquent 모델을 JSON 또는 배열로 직렬화하려면 값 객체에 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현해야 합니다.

<a name="value-object-caching"></a>
#### 값 객체 캐싱

값 객체로 캐스팅되는 속성이 해석될 때 Eloquent에 의해 캐시됩니다. 따라서 속성에 다시 접근하면 동일한 객체 인스턴스가 반환됩니다.

커스텀 캐스트 클래스의 객체 캐싱 동작을 비활성화하려면 커스텀 캐스트 클래스에 public `withoutObjectCaching` 프로퍼티를 선언할 수 있습니다:

```php
class AsAddress implements CastsAttributes
{
    public bool $withoutObjectCaching = true;

    // ...
}
```

<a name="array-json-serialization"></a>
### 배열 / JSON 직렬화

Eloquent 모델이 `toArray` 및 `toJson` 메서드를 사용하여 배열 또는 JSON으로 변환될 때, `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현하는 한 커스텀 캐스트 값 객체도 일반적으로 직렬화됩니다. 그러나 서드파티 라이브러리에서 제공하는 값 객체를 사용할 때는 이러한 인터페이스를 객체에 추가할 수 없을 수 있습니다.

따라서 커스텀 캐스트 클래스가 값 객체 직렬화를 담당하도록 지정할 수 있습니다. 이를 위해 커스텀 캐스트 클래스는 `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes` 인터페이스를 구현해야 합니다. 이 인터페이스는 클래스에 값 객체의 직렬화된 형태를 반환하는 `serialize` 메서드가 포함되어야 함을 명시합니다:

```php
/**
 * 값의 직렬화된 표현을 가져옵니다.
 *
 * @param  array<string, mixed>  $attributes
 */
public function serialize(
    Model $model,
    string $key,
    mixed $value,
    array $attributes,
): string {
    return (string) $value;
}
```

<a name="inbound-casting"></a>
### 인바운드 캐스팅

때때로 모델에 설정되는 값만 변환하고 모델에서 속성을 조회할 때는 어떤 작업도 수행하지 않는 커스텀 캐스트 클래스를 작성해야 할 수 있습니다.

인바운드 전용 커스텀 캐스트는 `set` 메서드만 정의하면 되는 `CastsInboundAttributes` 인터페이스를 구현해야 합니다. `make:cast` Artisan 명령에 `--inbound` 옵션을 사용하여 인바운드 전용 캐스트 클래스를 생성할 수 있습니다:

```shell
php artisan make:cast AsHash --inbound
```

인바운드 전용 캐스트의 전형적인 예는 "해싱" 캐스트입니다. 예를 들어, 주어진 알고리즘을 통해 인바운드 값을 해시하는 캐스트를 정의할 수 있습니다:

```php
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;
use Illuminate\Database\Eloquent\Model;

class AsHash implements CastsInboundAttributes
{
    /**
     * 새로운 캐스트 클래스 인스턴스를 생성합니다.
     */
    public function __construct(
        protected string|null $algorithm = null,
    ) {}

    /**
     * 저장을 위해 주어진 값을 준비합니다.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): string {
        return is_null($this->algorithm)
                        ? bcrypt($value)
                        : hash($this->algorithm, $value);
    }
}
```

<a name="cast-parameters"></a>
### 캐스트 파라미터

모델에 커스텀 캐스트를 첨부할 때 `:` 문자를 사용하여 클래스 이름과 구분하고 여러 파라미터를 쉼표로 구분하여 캐스트 파라미터를 지정할 수 있습니다. 파라미터는 캐스트 클래스의 생성자에 전달됩니다:

```php
/**
 * 캐스팅할 속성.
 *
 * @var array
 */
protected $casts = [
    'secret' => AsHash::class.':sha256',
];
```

<a name="castables"></a>
### Castables

애플리케이션의 값 객체가 자체 커스텀 캐스트 클래스를 정의하도록 허용할 수 있습니다. 모델에 커스텀 캐스트 클래스를 첨부하는 대신 `Illuminate\Contracts\Database\Eloquent\Castable` 인터페이스를 구현하는 값 객체 클래스를 첨부할 수 있습니다:

```php
use App\ValueObjects\Address;

protected $casts = [
    'address' => Address::class,
];
```

`Castable` 인터페이스를 구현하는 객체는 `Castable` 클래스로 캐스팅하는 것을 담당하는 커스텀 캐스터 클래스의 클래스 이름을 반환하는 `castUsing` 메서드를 정의해야 합니다:

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use App\Casts\AsAddress;

class Address implements Castable
{
    /**
     * 이 캐스트 대상으로/에서 캐스팅할 때 사용할 캐스터 클래스의 이름을 가져옵니다.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): string
    {
        return AsAddress::class;
    }
}
```

`Castable` 클래스를 사용할 때 `$casts` 정의에서 여전히 인수를 제공할 수 있습니다. 인수는 `castUsing` 메서드에 전달됩니다:

```php
use App\ValueObjects\Address;

protected $casts = [
    'address' => Address::class.':argument',
];
```

<a name="anonymous-cast-classes"></a>
#### Castables와 익명 캐스트 클래스

"castables"와 PHP의 [익명 클래스](https://www.php.net/manual/en/language.oop5.anonymous.php)를 결합하여 값 객체와 캐스팅 로직을 단일 castable 객체로 정의할 수 있습니다. 이를 위해 값 객체의 `castUsing` 메서드에서 익명 클래스를 반환합니다. 익명 클래스는 `CastsAttributes` 인터페이스를 구현해야 합니다:

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Address implements Castable
{
    // ...

    /**
     * 이 캐스트 대상으로/에서 캐스팅할 때 사용할 캐스터 클래스를 가져옵니다.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): CastsAttributes
    {
        return new class implements CastsAttributes
        {
            public function get(
                Model $model,
                string $key,
                mixed $value,
                array $attributes,
            ): Address {
                return new Address(
                    $attributes['address_line_one'],
                    $attributes['address_line_two']
                );
            }

            public function set(
                Model $model,
                string $key,
                mixed $value,
                array $attributes,
            ): array {
                return [
                    'address_line_one' => $value->lineOne,
                    'address_line_two' => $value->lineTwo,
                ];
            }
        };
    }
}
```

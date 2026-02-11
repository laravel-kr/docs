# Eloquent: 직렬화(Serialization)

- [소개](#introduction)
- [모델 및 컬렉션 직렬화](#serializing-models-and-collections)
    - [배열로 직렬화](#serializing-to-arrays)
    - [JSON으로 직렬화](#serializing-to-json)
- [JSON에서 속성 숨기기](#hiding-attributes-from-json)
- [JSON에 값 추가하기](#appending-values-to-json)
- [날짜 직렬화](#date-serialization)

<a name="introduction"></a>
## 소개

Laravel을 사용하여 API를 구축할 때 모델과 관계(relationships)를 배열이나 JSON으로 변환해야 하는 경우가 자주 있습니다. Eloquent는 이러한 변환을 수행하고 모델의 직렬화된 표현에 포함되는 속성을 제어할 수 있는 편리한 메서드를 포함하고 있습니다.

> [!NOTE]
> Eloquent 모델 및 컬렉션 JSON 직렬화를 처리하는 더욱 강력한 방법은 [Eloquent API 리소스](/docs/{{version}}/eloquent-resources) 문서를 확인하세요.

<a name="serializing-models-and-collections"></a>
## 모델 및 컬렉션 직렬화

<a name="serializing-to-arrays"></a>
### 배열로 직렬화

모델과 로드된 [관계(relationships)](/docs/{{version}}/eloquent-relationships)를 배열로 변환하려면 `toArray` 메서드를 사용해야 합니다. 이 메서드는 재귀적으로 동작하므로 모든 속성과 모든 관계(관계의 관계 포함)가 배열로 변환됩니다.

```php
use App\Models\User;

$user = User::with('roles')->first();

return $user->toArray();
```

`attributesToArray` 메서드는 모델의 속성만 배열로 변환하고 관계는 포함하지 않습니다.

```php
$user = User::first();

return $user->attributesToArray();
```

컬렉션 인스턴스에서 `toArray` 메서드를 호출하여 전체 모델 [컬렉션](/docs/{{version}}/eloquent-collections)을 배열로 변환할 수도 있습니다.

```php
$users = User::all();

return $users->toArray();
```

<a name="serializing-to-json"></a>
### JSON으로 직렬화

모델을 JSON으로 변환하려면 `toJson` 메서드를 사용해야 합니다. `toArray`와 마찬가지로 `toJson` 메서드는 재귀적으로 동작하므로 모든 속성과 관계가 JSON으로 변환됩니다. 또한 [PHP에서 지원하는](https://secure.php.net/manual/en/function.json-encode.php) JSON 인코딩 옵션을 지정할 수도 있습니다.

```php
use App\Models\User;

$user = User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

또는 모델이나 컬렉션을 문자열로 캐스팅할 수 있으며, 이 경우 모델이나 컬렉션에서 `toJson` 메서드가 자동으로 호출됩니다.

```php
return (string) User::find(1);
```

모델과 컬렉션은 문자열로 캐스팅될 때 JSON으로 변환되므로 애플리케이션의 라우트나 컨트롤러에서 Eloquent 객체를 직접 반환할 수 있습니다. Laravel은 라우트나 컨트롤러에서 반환될 때 Eloquent 모델과 컬렉션을 자동으로 JSON으로 직렬화합니다.

```php
Route::get('/users', function () {
    return User::all();
});
```

<a name="relationships"></a>
#### 관계(Relationships)

Eloquent 모델이 JSON으로 변환될 때 로드된 관계는 자동으로 JSON 객체의 속성으로 포함됩니다. 또한, Eloquent 관계 메서드는 "카멜 케이스(camel case)" 메서드 이름으로 정의되지만 관계의 JSON 속성은 "스네이크 케이스(snake case)"로 표현됩니다.

<a name="hiding-attributes-from-json"></a>
## JSON에서 속성 숨기기

때로는 비밀번호와 같은 속성을 모델의 배열이나 JSON 표현에서 제외하고 싶을 수 있습니다. 이를 위해 모델에 `$hidden` 속성을 추가하세요. `$hidden` 속성의 배열에 나열된 속성은 모델의 직렬화된 표현에 포함되지 않습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 직렬화에서 숨겨야 하는 속성.
     *
     * @var array<string>
     */
    protected $hidden = ['password'];
}
```

> [!NOTE]
> 관계를 숨기려면 Eloquent 모델의 `$hidden` 속성에 관계의 메서드 이름을 추가하세요.

또는 `visible` 속성을 사용하여 모델의 배열 및 JSON 표현에 포함되어야 하는 속성의 "허용 목록"을 정의할 수 있습니다. `$visible` 배열에 없는 모든 속성은 모델이 배열이나 JSON으로 변환될 때 숨겨집니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열에서 표시되어야 하는 속성.
     *
     * @var array
     */
    protected $visible = ['first_name', 'last_name'];
}
```

<a name="temporarily-modifying-attribute-visibility"></a>
#### 일시적으로 속성 가시성 수정하기

특정 모델 인스턴스에서 일반적으로 숨겨진 속성을 표시하고 싶다면 `makeVisible` 또는 `mergeVisible` 메서드를 사용할 수 있습니다. `makeVisible` 메서드는 모델 인스턴스를 반환합니다.

```php
return $user->makeVisible('attribute')->toArray();

return $user->mergeVisible(['name', 'email'])->toArray();
```

마찬가지로, 일반적으로 표시되는 속성을 숨기고 싶다면 `makeHidden` 또는 `mergeHidden` 메서드를 사용할 수 있습니다.

```php
return $user->makeHidden('attribute')->toArray();

return $user->mergeHidden(['name', 'email'])->toArray();
```

모든 visible 또는 hidden 속성을 일시적으로 재정의하려면 각각 `setVisible` 및 `setHidden` 메서드를 사용할 수 있습니다.

```php
return $user->setVisible(['id', 'name'])->toArray();

return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a name="appending-values-to-json"></a>
## JSON에 값 추가하기

때로는 모델을 배열이나 JSON으로 변환할 때 데이터베이스에 해당 컬럼이 없는 속성을 추가하고 싶을 수 있습니다. 이를 위해 먼저 해당 값에 대한 [접근자(accessor)](/docs/{{version}}/eloquent-mutators)를 정의하세요.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자가 관리자인지 확인합니다.
     */
    protected function isAdmin(): Attribute
    {
        return new Attribute(
            get: fn () => 'yes',
        );
    }
}
```

접근자가 항상 모델의 배열 및 JSON 표현에 추가되도록 하려면 모델의 `appends` 속성에 속성 이름을 추가할 수 있습니다. 접근자의 PHP 메서드가 "카멜 케이스(camel case)"로 정의되더라도 속성 이름은 일반적으로 "스네이크 케이스(snake case)" 직렬화 표현을 사용하여 참조됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 배열 형태에 추가할 접근자.
     *
     * @var array
     */
    protected $appends = ['is_admin'];
}
```

`appends` 목록에 속성이 추가되면 모델의 배열 및 JSON 표현 모두에 포함됩니다. `appends` 배열의 속성도 모델에 구성된 `visible` 및 `hidden` 설정을 따릅니다.

<a name="appending-at-run-time"></a>
#### 런타임에 추가하기

런타임에 `append` 또는 `mergeAppends` 메서드를 사용하여 모델 인스턴스에 추가 속성을 추가하도록 지시할 수 있습니다. 또는 `setAppends` 메서드를 사용하여 특정 모델 인스턴스에 대해 추가된 속성의 전체 배열을 재정의할 수 있습니다.

```php
return $user->append('is_admin')->toArray();

return $user->mergeAppends(['is_admin', 'status'])->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

마찬가지로, 모델에서 모든 추가된 속성을 제거하려면 `withoutAppends` 메서드를 사용할 수 있습니다.

```php
return $user->withoutAppends()->toArray();
```

<a name="date-serialization"></a>
## 날짜 직렬화

<a name="customizing-the-default-date-format"></a>
#### 기본 날짜 형식 커스터마이징

`serializeDate` 메서드를 재정의하여 기본 직렬화 형식을 커스터마이징할 수 있습니다. 이 메서드는 데이터베이스에 저장하기 위해 날짜가 형식화되는 방식에는 영향을 주지 않습니다.

```php
/**
 * 배열 / JSON 직렬화를 위해 날짜를 준비합니다.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

<a name="customizing-the-date-format-per-attribute"></a>
#### 속성별 날짜 형식 커스터마이징

모델의 [캐스트 선언](/docs/{{version}}/eloquent-mutators#attribute-casting)에서 날짜 형식을 지정하여 개별 Eloquent 날짜 속성의 직렬화 형식을 커스터마이징할 수 있습니다.

```php
protected function casts(): array
{
    return [
        'birthday' => 'date:Y-m-d',
        'joined_at' => 'datetime:Y-m-d H:00',
    ];
}
```

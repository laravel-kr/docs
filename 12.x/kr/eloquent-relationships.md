# Eloquent: 관계(Relationships)

- [소개](#introduction)
- [관계 정의하기](#defining-relationships)
    - [일대일(One To One) / Has One](#one-to-one)
    - [일대다(One To Many) / Has Many](#one-to-many)
    - [일대다 역관계(Inverse) / Belongs To](#one-to-many-inverse)
    - [Has One of Many](#has-one-of-many)
    - [Has One Through](#has-one-through)
    - [Has Many Through](#has-many-through)
- [스코프 관계](#scoped-relationships)
- [다대다(Many To Many) 관계](#many-to-many)
    - [중간 테이블 컬럼 조회하기](#retrieving-intermediate-table-columns)
    - [중간 테이블 컬럼을 통한 쿼리 필터링](#filtering-queries-via-intermediate-table-columns)
    - [중간 테이블 컬럼을 통한 쿼리 정렬](#ordering-queries-via-intermediate-table-columns)
    - [사용자 정의 중간 테이블 모델 정의하기](#defining-custom-intermediate-table-models)
- [다형성(Polymorphic) 관계](#polymorphic-relationships)
    - [일대일(One To One)](#one-to-one-polymorphic-relations)
    - [일대다(One To Many)](#one-to-many-polymorphic-relations)
    - [One of Many](#one-of-many-polymorphic-relations)
    - [다대다(Many To Many)](#many-to-many-polymorphic-relations)
    - [사용자 정의 다형성 타입](#custom-polymorphic-types)
- [동적 관계](#dynamic-relationships)
- [관계 쿼리하기](#querying-relations)
    - [관계 메서드 vs. 동적 프로퍼티](#relationship-methods-vs-dynamic-properties)
    - [관계 존재 여부 쿼리](#querying-relationship-existence)
    - [관계 부재 여부 쿼리](#querying-relationship-absence)
    - [Morph To 관계 쿼리](#querying-morph-to-relationships)
- [연관 모델 집계하기](#aggregating-related-models)
    - [연관 모델 개수 세기](#counting-related-models)
    - [기타 집계 함수](#other-aggregate-functions)
    - [Morph To 관계에서 연관 모델 개수 세기](#counting-related-models-on-morph-to-relationships)
- [즉시 로딩(Eager Loading)](#eager-loading)
    - [즉시 로딩 제약 조건](#constraining-eager-loads)
    - [지연 즉시 로딩(Lazy Eager Loading)](#lazy-eager-loading)
    - [자동 즉시 로딩](#automatic-eager-loading)
    - [지연 로딩 방지하기](#preventing-lazy-loading)
- [연관 모델 삽입 및 업데이트](#inserting-and-updating-related-models)
    - [`save` 메서드](#the-save-method)
    - [`create` 메서드](#the-create-method)
    - [Belongs To 관계](#updating-belongs-to-relationships)
    - [다대다(Many To Many) 관계](#updating-many-to-many-relationships)
- [부모 타임스탬프 갱신하기](#touching-parent-timestamps)

<a name="introduction"></a>
## 소개

데이터베이스 테이블은 종종 서로 관계를 맺고 있습니다. 예를 들어, 블로그 글은 여러 개의 댓글을 가질 수 있고, 주문은 주문한 사용자와 연관될 수 있습니다. Eloquent는 이러한 관계를 쉽게 관리하고 작업할 수 있도록 해주며, 다양한 일반적인 관계를 지원합니다:

<div class="content-list" markdown="1">

- [일대일(One To One)](#one-to-one)
- [일대다(One To Many)](#one-to-many)
- [다대다(Many To Many)](#many-to-many)
- [Has One Through](#has-one-through)
- [Has Many Through](#has-many-through)
- [일대일(다형성, Polymorphic)](#one-to-one-polymorphic-relations)
- [일대다(다형성, Polymorphic)](#one-to-many-polymorphic-relations)
- [다대다(다형성, Polymorphic)](#many-to-many-polymorphic-relations)

</div>

<a name="defining-relationships"></a>
## 관계 정의하기

Eloquent 관계는 Eloquent 모델 클래스의 메서드로 정의됩니다. 관계 또한 강력한 [쿼리 빌더](/docs/{{version}}/queries) 역할을 하기 때문에, 관계를 메서드로 정의하면 강력한 메서드 체이닝과 쿼리 기능을 제공받을 수 있습니다. 예를 들어, `posts` 관계에 추가적인 쿼리 제약 조건을 체이닝할 수 있습니다:

```php
$user->posts()->where('active', 1)->get();
```

하지만, 관계를 본격적으로 사용하기 전에, Eloquent가 지원하는 각 관계 유형을 정의하는 방법을 먼저 알아보겠습니다.

<a name="one-to-one"></a>
### 일대일(One To One) / Has One

일대일 관계는 매우 기본적인 데이터베이스 관계 유형입니다. 예를 들어, `User` 모델은 하나의 `Phone` 모델과 연관될 수 있습니다. 이 관계를 정의하려면 `User` 모델에 `phone` 메서드를 배치합니다. `phone` 메서드는 `hasOne` 메서드를 호출하고 그 결과를 반환해야 합니다. `hasOne` 메서드는 모델의 `Illuminate\Database\Eloquent\Model` 기본 클래스를 통해 모델에서 사용할 수 있습니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    /**
     * 사용자와 연관된 전화번호를 가져옵니다.
     */
    public function phone(): HasOne
    {
        return $this->hasOne(Phone::class);
    }
}
```

`hasOne` 메서드에 전달되는 첫 번째 인수는 관련 모델 클래스의 이름입니다. 관계가 정의되면 Eloquent의 동적 프로퍼티를 사용하여 관련 레코드를 조회할 수 있습니다. 동적 프로퍼티를 사용하면 관계 메서드를 모델에 정의된 프로퍼티처럼 접근할 수 있습니다:

```php
$phone = User::find(1)->phone;
```

Eloquent는 부모 모델 이름을 기준으로 관계의 외래 키(foreign key)를 결정합니다. 이 경우 `Phone` 모델은 자동으로 `user_id` 외래 키를 가진 것으로 가정됩니다. 이 규칙을 재정의하려면 `hasOne` 메서드에 두 번째 인수를 전달하면 됩니다:

```php
return $this->hasOne(Phone::class, 'foreign_key');
```

또한, Eloquent는 외래 키가 부모의 기본 키 컬럼과 일치하는 값을 가져야 한다고 가정합니다. 즉, Eloquent는 `Phone` 레코드의 `user_id` 컬럼에서 사용자의 `id` 컬럼 값을 찾습니다. 관계에서 `id` 또는 모델의 `$primaryKey` 프로퍼티가 아닌 다른 기본 키 값을 사용하려면 `hasOne` 메서드에 세 번째 인수를 전달하면 됩니다:

```php
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### 역관계 정의하기

이제 `User` 모델에서 `Phone` 모델에 접근할 수 있습니다. 다음으로, 전화기를 소유한 사용자에 접근할 수 있는 관계를 `Phone` 모델에 정의해 보겠습니다. `hasOne` 관계의 역관계는 `belongsTo` 메서드를 사용하여 정의할 수 있습니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Phone extends Model
{
    /**
     * 전화기를 소유한 사용자를 가져옵니다.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

`user` 메서드를 호출하면 Eloquent는 `Phone` 모델의 `user_id` 컬럼과 일치하는 `id`를 가진 `User` 모델을 찾으려고 시도합니다.

Eloquent는 관계 메서드의 이름을 확인하고 메서드 이름에 `_id`를 접미사로 붙여 외래 키 이름을 결정합니다. 따라서 이 경우 Eloquent는 `Phone` 모델에 `user_id` 컬럼이 있다고 가정합니다. 그러나 `Phone` 모델의 외래 키가 `user_id`가 아닌 경우 `belongsTo` 메서드의 두 번째 인수로 사용자 정의 키 이름을 전달할 수 있습니다:

```php
/**
 * 전화기를 소유한 사용자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

부모 모델이 `id`를 기본 키로 사용하지 않거나 다른 컬럼을 사용하여 연관 모델을 찾고 싶다면 `belongsTo` 메서드에 세 번째 인수를 전달하여 부모 테이블의 사용자 정의 키를 지정할 수 있습니다:

```php
/**
 * 전화기를 소유한 사용자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

<a name="one-to-many"></a>
### 일대다(One To Many) / Has Many

일대다 관계는 단일 모델이 하나 이상의 자식 모델의 부모가 되는 관계를 정의하는 데 사용됩니다. 예를 들어, 블로그 글은 무한한 수의 댓글을 가질 수 있습니다. 다른 모든 Eloquent 관계와 마찬가지로 일대다 관계는 Eloquent 모델에 메서드를 정의하여 정의합니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * 블로그 글의 댓글들을 가져옵니다.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

Eloquent는 `Comment` 모델의 적절한 외래 키 컬럼을 자동으로 결정한다는 점을 기억하세요. 관례에 따라 Eloquent는 부모 모델의 "스네이크 케이스" 이름에 `_id`를 접미사로 붙입니다. 따라서 이 예에서 Eloquent는 `Comment` 모델의 외래 키 컬럼이 `post_id`라고 가정합니다.

관계 메서드가 정의되면 `comments` 프로퍼티에 접근하여 관련 댓글의 [컬렉션](/docs/{{version}}/eloquent-collections)에 접근할 수 있습니다. Eloquent는 "동적 관계 프로퍼티"를 제공하므로 관계 메서드를 모델에 정의된 프로퍼티처럼 접근할 수 있다는 점을 기억하세요:

```php
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    // ...
}
```

모든 관계는 쿼리 빌더 역할도 하므로 `comments` 메서드를 호출하고 쿼리에 조건을 계속 체이닝하여 관계 쿼리에 추가 제약 조건을 추가할 수 있습니다:

```php
$comment = Post::find(1)->comments()
    ->where('title', 'foo')
    ->first();
```

`hasOne` 메서드와 마찬가지로 `hasMany` 메서드에 추가 인수를 전달하여 외래 키와 로컬 키를 재정의할 수도 있습니다:

```php
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="automatically-hydrating-parent-models-on-children"></a>
#### 자식 모델에서 부모 모델 자동 하이드레이션

Eloquent 즉시 로딩을 활용하더라도 자식 모델을 반복하면서 자식 모델에서 부모 모델에 접근하려고 하면 "N + 1" 쿼리 문제가 발생할 수 있습니다:

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->post->title;
    }
}
```

위 예에서 모든 `Post` 모델에 대해 댓글이 즉시 로딩되었음에도 불구하고 Eloquent는 각 자식 `Comment` 모델에 부모 `Post`를 자동으로 하이드레이트하지 않기 때문에 "N + 1" 쿼리 문제가 발생합니다.

Eloquent가 자동으로 부모 모델을 자식에게 하이드레이트하도록 하려면 `hasMany` 관계를 정의할 때 `chaperone` 메서드를 호출하면 됩니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * 블로그 글의 댓글들을 가져옵니다.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->chaperone();
    }
}
```

또는 런타임에 자동 부모 하이드레이션을 선택하려면 관계를 즉시 로딩할 때 `chaperone` 메서드를 호출하면 됩니다:

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-to-many-inverse"></a>
### 일대다 역관계(Inverse) / Belongs To

이제 글의 모든 댓글에 접근할 수 있으므로 댓글이 부모 글에 접근할 수 있는 관계를 정의해 보겠습니다. `hasMany` 관계의 역관계를 정의하려면 자식 모델에 `belongsTo` 메서드를 호출하는 관계 메서드를 정의합니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * 댓글이 속한 글을 가져옵니다.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

관계가 정의되면 `post` "동적 관계 프로퍼티"에 접근하여 댓글의 부모 글을 조회할 수 있습니다:

```php
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

위 예에서 Eloquent는 `Comment` 모델의 `post_id` 컬럼과 일치하는 `id`를 가진 `Post` 모델을 찾으려고 시도합니다.

Eloquent는 관계 메서드의 이름을 확인하고 메서드 이름에 `_`와 부모 모델의 기본 키 컬럼 이름을 접미사로 붙여 기본 외래 키 이름을 결정합니다. 따라서 이 예에서 Eloquent는 `comments` 테이블에서 `Post` 모델의 외래 키가 `post_id`라고 가정합니다.

그러나 관계의 외래 키가 이러한 규칙을 따르지 않는 경우 `belongsTo` 메서드의 두 번째 인수로 사용자 정의 외래 키 이름을 전달할 수 있습니다:

```php
/**
 * 댓글이 속한 글을 가져옵니다.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

부모 모델이 `id`를 기본 키로 사용하지 않거나 다른 컬럼을 사용하여 연관 모델을 찾고 싶다면 `belongsTo` 메서드에 세 번째 인수를 전달하여 부모 테이블의 사용자 정의 키를 지정할 수 있습니다:

```php
/**
 * 댓글이 속한 글을 가져옵니다.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

<a name="default-models"></a>
#### 기본 모델

`belongsTo`, `hasOne`, `hasOneThrough`, `morphOne` 관계는 주어진 관계가 `null`일 때 반환될 기본 모델을 정의할 수 있습니다. 이 패턴은 종종 [Null Object 패턴](https://en.wikipedia.org/wiki/Null_Object_pattern)이라고 하며 코드에서 조건부 검사를 제거하는 데 도움이 됩니다. 다음 예에서 `Post` 모델에 사용자가 연결되어 있지 않으면 `user` 관계는 빈 `App\Models\User` 모델을 반환합니다:

```php
/**
 * 글의 작성자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault();
}
```

기본 모델에 속성을 채우려면 `withDefault` 메서드에 배열이나 클로저를 전달할 수 있습니다:

```php
/**
 * 글의 작성자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault([
        'name' => 'Guest Author',
    ]);
}

/**
 * 글의 작성자를 가져옵니다.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault(function (User $user, Post $post) {
        $user->name = 'Guest Author';
    });
}
```

<a name="querying-belongs-to-relationships"></a>
#### Belongs To 관계 쿼리하기

"belongs to" 관계의 자식을 쿼리할 때 해당 Eloquent 모델을 조회하기 위해 `where` 절을 수동으로 작성할 수 있습니다:

```php
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

그러나 주어진 모델에 대해 적절한 관계와 외래 키를 자동으로 결정하는 `whereBelongsTo` 메서드를 사용하는 것이 더 편리할 수 있습니다:

```php
$posts = Post::whereBelongsTo($user)->get();
```

`whereBelongsTo` 메서드에 [컬렉션](/docs/{{version}}/eloquent-collections) 인스턴스를 제공할 수도 있습니다. 이렇게 하면 Laravel은 컬렉션 내의 부모 모델 중 하나에 속하는 모델을 조회합니다:

```php
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

기본적으로 Laravel은 모델의 클래스 이름을 기반으로 주어진 모델과 연관된 관계를 결정합니다. 그러나 `whereBelongsTo` 메서드의 두 번째 인수로 관계 이름을 수동으로 지정할 수 있습니다:

```php
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### Has One of Many

때로는 모델이 많은 관련 모델을 가질 수 있지만 관계의 "최신" 또는 "가장 오래된" 관련 모델을 쉽게 조회하고 싶을 수 있습니다. 예를 들어, `User` 모델은 많은 `Order` 모델과 관련될 수 있지만 사용자가 주문한 가장 최근 주문과 상호 작용하는 편리한 방법을 정의하고 싶을 수 있습니다. `hasOne` 관계 타입과 `ofMany` 메서드를 결합하여 이를 달성할 수 있습니다:

```php
/**
 * 사용자의 가장 최근 주문을 가져옵니다.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

마찬가지로 관계의 "가장 오래된" 또는 첫 번째 관련 모델을 조회하는 메서드를 정의할 수 있습니다:

```php
/**
 * 사용자의 가장 오래된 주문을 가져옵니다.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

기본적으로 `latestOfMany`와 `oldestOfMany` 메서드는 정렬 가능해야 하는 모델의 기본 키를 기준으로 최신 또는 가장 오래된 관련 모델을 조회합니다. 그러나 때로는 다른 정렬 기준을 사용하여 더 큰 관계에서 단일 모델을 조회하고 싶을 수 있습니다.

예를 들어, `ofMany` 메서드를 사용하면 사용자의 가장 비싼 주문을 조회할 수 있습니다. `ofMany` 메서드는 정렬 가능한 컬럼을 첫 번째 인수로, 관련 모델을 쿼리할 때 적용할 집계 함수(`min` 또는 `max`)를 받습니다:

```php
/**
 * 사용자의 가장 큰 주문을 가져옵니다.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> [!WARNING]
> PostgreSQL은 UUID 컬럼에 대해 `MAX` 함수 실행을 지원하지 않으므로 현재 PostgreSQL UUID 컬럼과 함께 one-of-many 관계를 사용할 수 없습니다.

<a name="converting-many-relationships-to-has-one-relationships"></a>
#### "Many" 관계를 Has One 관계로 변환하기

종종 `latestOfMany`, `oldestOfMany`, 또는 `ofMany` 메서드를 사용하여 단일 모델을 조회할 때 이미 동일한 모델에 대해 "has many" 관계가 정의되어 있습니다. 편의를 위해 Laravel을 사용하면 관계에서 `one` 메서드를 호출하여 이 관계를 "has one" 관계로 쉽게 변환할 수 있습니다:

```php
/**
 * 사용자의 주문들을 가져옵니다.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * 사용자의 가장 큰 주문을 가져옵니다.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

`one` 메서드를 사용하여 `HasManyThrough` 관계를 `HasOneThrough` 관계로 변환할 수도 있습니다:

```php
public function latestDeployment(): HasOneThrough
{
    return $this->deployments()->one()->latestOfMany();
}
```

<a name="advanced-has-one-of-many-relationships"></a>
#### 고급 Has One of Many 관계

더 고급 "has one of many" 관계를 구성할 수 있습니다. 예를 들어, `Product` 모델은 새로운 가격이 게시된 후에도 시스템에 유지되는 많은 연관된 `Price` 모델을 가질 수 있습니다. 또한 제품의 새로운 가격 데이터는 `published_at` 컬럼을 통해 미래 날짜에 적용되도록 미리 게시될 수 있습니다.

요약하면, 게시 날짜가 미래가 아닌 최신 게시 가격을 조회해야 합니다. 또한 두 가격의 게시 날짜가 같으면 ID가 더 큰 가격을 선호합니다. 이를 달성하려면 최신 가격을 결정하는 정렬 가능한 컬럼이 포함된 배열을 `ofMany` 메서드에 전달해야 합니다. 또한 `ofMany` 메서드의 두 번째 인수로 클로저가 제공됩니다. 이 클로저는 관계 쿼리에 추가 게시 날짜 제약 조건을 추가하는 역할을 합니다:

```php
/**
 * 제품의 현재 가격을 가져옵니다.
 */
public function currentPricing(): HasOne
{
    return $this->hasOne(Price::class)->ofMany([
        'published_at' => 'max',
        'id' => 'max',
    ], function (Builder $query) {
        $query->where('published_at', '<', now());
    });
}
```
```

<a name="has-one-through"></a>
### Has One Through

"has-one-through" 관계(relationship)는 다른 모델과의 일대일 관계를 정의합니다. 그러나 이 관계는 선언하는 모델이 세 번째 모델을 _경유하여(through)_ 다른 모델의 인스턴스 하나와 매칭될 수 있음을 나타냅니다.

예를 들어, 자동차 정비소 애플리케이션에서 각 `Mechanic` 모델은 하나의 `Car` 모델과 연결될 수 있고, 각 `Car` 모델은 하나의 `Owner` 모델과 연결될 수 있습니다. 정비사(mechanic)와 소유자(owner)는 데이터베이스 내에서 직접적인 관계가 없지만, 정비사는 `Car` 모델을 _경유하여_ 소유자에 접근할 수 있습니다. 이 관계를 정의하는 데 필요한 테이블을 살펴보겠습니다.

```text
mechanics
    id - integer
    name - string

cars
    id - integer
    model - string
    mechanic_id - integer

owners
    id - integer
    name - string
    car_id - integer
```

이제 관계를 위한 테이블 구조를 살펴보았으니, `Mechanic` 모델에서 관계를 정의해 보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Mechanic extends Model
{
    /**
     * 자동차의 소유자를 가져옵니다.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(Owner::class, Car::class);
    }
}
```

`hasOneThrough` 메서드에 전달되는 첫 번째 인자는 접근하려는 최종 모델의 이름이고, 두 번째 인자는 중간 모델의 이름입니다.

또는 관계에 관련된 모든 모델에 이미 관련 관계가 정의되어 있다면, `through` 메서드를 호출하고 해당 관계의 이름을 제공하여 "has-one-through" 관계를 유창하게(fluently) 정의할 수 있습니다. 예를 들어, `Mechanic` 모델에 `cars` 관계가 있고 `Car` 모델에 `owner` 관계가 있다면, 다음과 같이 정비사와 소유자를 연결하는 "has-one-through" 관계를 정의할 수 있습니다.

```php
// 문자열 기반 구문...
return $this->through('cars')->has('owner');

// 동적 구문...
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>
#### 키 규칙 (Key Conventions)

관계 쿼리를 수행할 때 일반적인 Eloquent 외래 키(foreign key) 규칙이 사용됩니다. 관계의 키를 커스터마이징하려면 `hasOneThrough` 메서드의 세 번째와 네 번째 인자로 전달할 수 있습니다. 세 번째 인자는 중간 모델의 외래 키 이름입니다. 네 번째 인자는 최종 모델의 외래 키 이름입니다. 다섯 번째 인자는 로컬 키이고, 여섯 번째 인자는 중간 모델의 로컬 키입니다.

```php
class Mechanic extends Model
{
    /**
     * 자동차의 소유자를 가져옵니다.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(
            Owner::class,
            Car::class,
            'mechanic_id', // cars 테이블의 외래 키...
            'car_id', // owners 테이블의 외래 키...
            'id', // mechanics 테이블의 로컬 키...
            'id' // cars 테이블의 로컬 키...
        );
    }
}
```

또는 앞서 설명한 것처럼, 관계에 관련된 모든 모델에 이미 관련 관계가 정의되어 있다면, `through` 메서드를 호출하고 해당 관계의 이름을 제공하여 "has-one-through" 관계를 유창하게 정의할 수 있습니다. 이 방식은 기존 관계에 이미 정의된 키 규칙을 재사용할 수 있다는 장점이 있습니다.

```php
// 문자열 기반 구문...
return $this->through('cars')->has('owner');

// 동적 구문...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
### Has Many Through

"has-many-through" 관계는 중간 관계를 통해 먼 관계에 접근하는 편리한 방법을 제공합니다. 예를 들어, [Laravel Cloud](https://cloud.laravel.com)와 같은 배포 플랫폼을 구축한다고 가정해 봅시다. `Application` 모델은 중간 `Environment` 모델을 통해 많은 `Deployment` 모델에 접근할 수 있습니다. 이 예제를 사용하면 주어진 애플리케이션의 모든 배포를 쉽게 수집할 수 있습니다. 이 관계를 정의하는 데 필요한 테이블을 살펴보겠습니다.

```text
applications
    id - integer
    name - string

environments
    id - integer
    application_id - integer
    name - string

deployments
    id - integer
    environment_id - integer
    commit_hash - string
```

이제 관계를 위한 테이블 구조를 살펴보았으니, `Application` 모델에서 관계를 정의해 보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Application extends Model
{
    /**
     * 애플리케이션의 모든 배포를 가져옵니다.
     */
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

`hasManyThrough` 메서드에 전달되는 첫 번째 인자는 접근하려는 최종 모델의 이름이고, 두 번째 인자는 중간 모델의 이름입니다.

또는 관계에 관련된 모든 모델에 이미 관련 관계가 정의되어 있다면, `through` 메서드를 호출하고 해당 관계의 이름을 제공하여 "has-many-through" 관계를 유창하게 정의할 수 있습니다. 예를 들어, `Application` 모델에 `environments` 관계가 있고 `Environment` 모델에 `deployments` 관계가 있다면, 다음과 같이 애플리케이션과 배포를 연결하는 "has-many-through" 관계를 정의할 수 있습니다.

```php
// 문자열 기반 구문...
return $this->through('environments')->has('deployments');

// 동적 구문...
return $this->throughEnvironments()->hasDeployments();
```

`Deployment` 모델의 테이블에는 `application_id` 컬럼이 없지만, `hasManyThrough` 관계는 `$application->deployments`를 통해 애플리케이션의 배포에 접근할 수 있게 합니다. 이러한 모델을 조회하기 위해 Eloquent는 중간 `Environment` 모델 테이블의 `application_id` 컬럼을 검사합니다. 관련 환경 ID를 찾은 후, 이를 사용하여 `Deployment` 모델의 테이블을 쿼리합니다.

<a name="has-many-through-key-conventions"></a>
#### 키 규칙 (Key Conventions)

관계 쿼리를 수행할 때 일반적인 Eloquent 외래 키 규칙이 사용됩니다. 관계의 키를 커스터마이징하려면 `hasManyThrough` 메서드의 세 번째와 네 번째 인자로 전달할 수 있습니다. 세 번째 인자는 중간 모델의 외래 키 이름입니다. 네 번째 인자는 최종 모델의 외래 키 이름입니다. 다섯 번째 인자는 로컬 키이고, 여섯 번째 인자는 중간 모델의 로컬 키입니다.

```php
class Application extends Model
{
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Deployment::class,
            Environment::class,
            'application_id', // environments 테이블의 외래 키...
            'environment_id', // deployments 테이블의 외래 키...
            'id', // applications 테이블의 로컬 키...
            'id' // environments 테이블의 로컬 키...
        );
    }
}
```

또는 앞서 설명한 것처럼, 관계에 관련된 모든 모델에 이미 관련 관계가 정의되어 있다면, `through` 메서드를 호출하고 해당 관계의 이름을 제공하여 "has-many-through" 관계를 유창하게 정의할 수 있습니다. 이 방식은 기존 관계에 이미 정의된 키 규칙을 재사용할 수 있다는 장점이 있습니다.

```php
// 문자열 기반 구문...
return $this->through('environments')->has('deployments');

// 동적 구문...
return $this->throughEnvironments()->hasDeployments();
```

<a name="scoped-relationships"></a>
### 스코프 관계 (Scoped Relationships)

관계를 제약하는 추가 메서드를 모델에 추가하는 것은 일반적입니다. 예를 들어, 더 넓은 `posts` 관계를 추가적인 `where` 제약으로 제한하는 `featuredPosts` 메서드를 `User` 모델에 추가할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * 사용자의 게시물을 가져옵니다.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class)->latest();
    }

    /**
     * 사용자의 추천 게시물을 가져옵니다.
     */
    public function featuredPosts(): HasMany
    {
        return $this->posts()->where('featured', true);
    }
}
```

그러나 `featuredPosts` 메서드를 통해 모델을 생성하려고 하면 `featured` 속성이 `true`로 설정되지 않습니다. 관계 메서드를 통해 모델을 생성하면서 해당 관계를 통해 생성되는 모든 모델에 추가되어야 할 속성도 지정하려면, 관계 쿼리를 빌드할 때 `withAttributes` 메서드를 사용할 수 있습니다.

```php
/**
 * 사용자의 추천 게시물을 가져옵니다.
 */
public function featuredPosts(): HasMany
{
    return $this->posts()->withAttributes(['featured' => true]);
}
```

`withAttributes` 메서드는 주어진 속성을 사용하여 쿼리에 `where` 조건을 추가하고, 관계 메서드를 통해 생성되는 모든 모델에도 주어진 속성을 추가합니다.

```php
$post = $user->featuredPosts()->create(['title' => 'Featured Post']);

$post->featured; // true
```

`withAttributes` 메서드가 쿼리에 `where` 조건을 추가하지 않도록 하려면, `asConditions` 인자를 `false`로 설정할 수 있습니다.

```php
return $this->posts()->withAttributes(['featured' => true], asConditions: false);
```

<a name="many-to-many"></a>
## 다대다 관계 (Many to Many Relationships)

다대다 관계는 `hasOne`과 `hasMany` 관계보다 약간 더 복잡합니다. 다대다 관계의 예로는 사용자가 많은 역할을 가지고 있고, 그 역할들이 애플리케이션의 다른 사용자들과도 공유되는 경우입니다. 예를 들어, 사용자에게 "Author"와 "Editor" 역할이 할당될 수 있지만, 이 역할들은 다른 사용자에게도 할당될 수 있습니다. 따라서 사용자는 많은 역할을 가지고, 역할은 많은 사용자를 가집니다.

<a name="many-to-many-table-structure"></a>
#### 테이블 구조 (Table Structure)

이 관계를 정의하려면 `users`, `roles`, `role_user`의 세 가지 데이터베이스 테이블이 필요합니다. `role_user` 테이블은 관련 모델 이름의 알파벳 순서에서 파생되며 `user_id`와 `role_id` 컬럼을 포함합니다. 이 테이블은 사용자와 역할을 연결하는 중간 테이블로 사용됩니다.

역할이 많은 사용자에게 속할 수 있기 때문에, `roles` 테이블에 `user_id` 컬럼을 단순히 배치할 수 없다는 것을 기억하세요. 이렇게 하면 역할이 단일 사용자에게만 속할 수 있게 됩니다. 역할이 여러 사용자에게 할당되는 것을 지원하려면 `role_user` 테이블이 필요합니다. 관계의 테이블 구조를 다음과 같이 요약할 수 있습니다.

```text
users
    id - integer
    name - string

roles
    id - integer
    name - string

role_user
    user_id - integer
    role_id - integer
```

<a name="many-to-many-model-structure"></a>
#### 모델 구조 (Model Structure)

다대다 관계는 `belongsToMany` 메서드의 결과를 반환하는 메서드를 작성하여 정의합니다. `belongsToMany` 메서드는 애플리케이션의 모든 Eloquent 모델이 사용하는 `Illuminate\Database\Eloquent\Model` 기본 클래스에서 제공됩니다. 예를 들어, `User` 모델에 `roles` 메서드를 정의해 보겠습니다. 이 메서드에 전달되는 첫 번째 인자는 관련 모델 클래스의 이름입니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    /**
     * 사용자에게 속한 역할들.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
```

관계가 정의되면, `roles` 동적 관계 속성을 사용하여 사용자의 역할에 접근할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    // ...
}
```

모든 관계는 쿼리 빌더로도 작동하므로, `roles` 메서드를 호출하고 쿼리에 조건을 계속 체이닝하여 관계 쿼리에 추가 제약을 추가할 수 있습니다.

```php
$roles = User::find(1)->roles()->orderBy('name')->get();
```

관계의 중간 테이블의 테이블 이름을 결정하기 위해, Eloquent는 두 관련 모델 이름을 알파벳 순서로 결합합니다. 그러나 이 규칙을 자유롭게 재정의할 수 있습니다. `belongsToMany` 메서드에 두 번째 인자를 전달하여 이를 수행할 수 있습니다.

```php
return $this->belongsToMany(Role::class, 'role_user');
```

중간 테이블의 이름을 커스터마이징하는 것 외에도, `belongsToMany` 메서드에 추가 인자를 전달하여 테이블의 키 컬럼 이름을 커스터마이징할 수도 있습니다. 세 번째 인자는 관계를 정의하는 모델의 외래 키 이름이고, 네 번째 인자는 조인하려는 모델의 외래 키 이름입니다.

```php
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### 관계의 역(Inverse) 정의하기

다대다 관계의 "역(inverse)"을 정의하려면, 관련 모델에서 `belongsToMany` 메서드의 결과를 반환하는 메서드를 정의해야 합니다. 사용자 / 역할 예제를 완성하기 위해 `Role` 모델에 `users` 메서드를 정의해 보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * 역할에 속한 사용자들.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

보시다시피, `App\Models\User` 모델을 참조하는 것을 제외하면 관계는 `User` 모델의 대응 관계와 정확히 동일하게 정의됩니다. `belongsToMany` 메서드를 재사용하고 있으므로, 다대다 관계의 "역"을 정의할 때도 일반적인 테이블 및 키 커스터마이징 옵션을 모두 사용할 수 있습니다.

<a name="retrieving-intermediate-table-columns"></a>
### 중간 테이블 컬럼 조회하기 (Retrieving Intermediate Table Columns)

이미 배웠듯이, 다대다 관계 작업에는 중간 테이블의 존재가 필요합니다. Eloquent는 이 테이블과 상호작용하는 매우 유용한 방법들을 제공합니다. 예를 들어, `User` 모델이 관련된 많은 `Role` 모델을 가지고 있다고 가정해 봅시다. 이 관계에 접근한 후, 모델의 `pivot` 속성을 사용하여 중간 테이블에 접근할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

조회하는 각 `Role` 모델에는 자동으로 `pivot` 속성이 할당됩니다. 이 속성에는 중간 테이블을 나타내는 모델이 포함되어 있습니다.

기본적으로 모델 키만 `pivot` 모델에 존재합니다. 중간 테이블에 추가 속성이 포함되어 있다면, 관계를 정의할 때 이를 지정해야 합니다.

```php
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

중간 테이블에 Eloquent에 의해 자동으로 유지되는 `created_at`과 `updated_at` 타임스탬프를 갖게 하려면, 관계를 정의할 때 `withTimestamps` 메서드를 호출하세요.

```php
return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!WARNING]
> Eloquent의 자동으로 유지되는 타임스탬프를 활용하는 중간 테이블은 `created_at`과 `updated_at` 타임스탬프 컬럼이 모두 필요합니다.

<a name="customizing-the-pivot-attribute-name"></a>
#### `pivot` 속성 이름 커스터마이징하기

앞서 언급했듯이, 중간 테이블의 속성은 `pivot` 속성을 통해 모델에서 접근할 수 있습니다. 그러나 애플리케이션 내에서의 목적을 더 잘 반영하도록 이 속성의 이름을 자유롭게 커스터마이징할 수 있습니다.

예를 들어, 애플리케이션에 팟캐스트를 구독할 수 있는 사용자가 포함되어 있다면, 사용자와 팟캐스트 사이에 다대다 관계가 있을 것입니다. 이 경우, 중간 테이블 속성의 이름을 `pivot` 대신 `subscription`으로 변경하고 싶을 수 있습니다. 관계를 정의할 때 `as` 메서드를 사용하여 이를 수행할 수 있습니다.

```php
return $this->belongsToMany(Podcast::class)
    ->as('subscription')
    ->withTimestamps();
```

커스텀 중간 테이블 속성이 지정되면, 커스터마이징된 이름을 사용하여 중간 테이블 데이터에 접근할 수 있습니다.

```php
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼을 통한 쿼리 필터링 (Filtering Queries via Intermediate Table Columns)

관계를 정의할 때 `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, `wherePivotNotNull` 메서드를 사용하여 `belongsToMany` 관계 쿼리가 반환하는 결과를 필터링할 수도 있습니다.

```php
return $this->belongsToMany(Role::class)
    ->wherePivot('approved', 1);

return $this->belongsToMany(Role::class)
    ->wherePivotIn('priority', [1, 2]);

return $this->belongsToMany(Role::class)
    ->wherePivotNotIn('priority', [1, 2]);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNull('expired_at');

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNotNull('expired_at');
```

`wherePivot`은 쿼리에 where 절 제약을 추가하지만, 정의된 관계를 통해 새 모델을 생성할 때 지정된 값을 추가하지 않습니다. 특정 피벗 값으로 쿼리하고 관계를 생성해야 하는 경우, `withPivotValue` 메서드를 사용할 수 있습니다.

```php
return $this->belongsToMany(Role::class)
    ->withPivotValue('approved', 1);
```

<a name="ordering-queries-via-intermediate-table-columns"></a>
### 중간 테이블 컬럼을 통한 쿼리 정렬 (Ordering Queries via Intermediate Table Columns)

`orderByPivot` 메서드를 사용하여 `belongsToMany` 관계 쿼리가 반환하는 결과를 정렬할 수 있습니다. 다음 예제에서는 사용자의 모든 최신 배지를 조회합니다.

```php
return $this->belongsToMany(Badge::class)
    ->where('rank', 'gold')
    ->orderByPivot('created_at', 'desc');
```

<a name="defining-custom-intermediate-table-models"></a>
### 커스텀 중간 테이블 모델 정의하기 (Defining Custom Intermediate Table Models)

다대다 관계의 중간 테이블을 나타내는 커스텀 모델을 정의하려면, 관계를 정의할 때 `using` 메서드를 호출할 수 있습니다. 커스텀 피벗 모델은 피벗 모델에서 메서드 및 캐스트와 같은 추가 동작을 정의할 기회를 제공합니다.

커스텀 다대다 피벗 모델은 `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 확장해야 하고, 커스텀 다형성(polymorphic) 다대다 피벗 모델은 `Illuminate\Database\Eloquent\Relations\MorphPivot` 클래스를 확장해야 합니다. 예를 들어, 커스텀 `RoleUser` 피벗 모델을 사용하는 `Role` 모델을 정의할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * 역할에 속한 사용자들.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

`RoleUser` 모델을 정의할 때, `Illuminate\Database\Eloquent\Relations\Pivot` 클래스를 확장해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    // ...
}
```

> [!WARNING]
> 피벗 모델은 `SoftDeletes` 트레이트를 사용할 수 없습니다. 피벗 레코드를 소프트 삭제해야 하는 경우, 피벗 모델을 실제 Eloquent 모델로 변환하는 것을 고려하세요.
<a name="custom-pivot-models-and-incrementing-ids"></a>
#### 커스텀 피벗 모델과 자동 증가 ID (Custom Pivot Models and Incrementing IDs)

커스텀 피벗 모델을 사용하는 다대다 관계를 정의했고, 해당 피벗 모델이 자동 증가 기본 키를 가지고 있다면, 커스텀 피벗 모델 클래스에 `incrementing` 속성을 `true`로 설정해야 합니다.

```php
/**
 * ID가 자동 증가하는지 나타냅니다.
 *
 * @var bool
 */
public $incrementing = true;
```

<a name="polymorphic-relationships"></a>
## 다형성 관계 (Polymorphic Relationships)

다형성 관계(Polymorphic Relationship)는 자식 모델이 단일 연결을 사용하여 둘 이상의 모델 타입에 속할 수 있도록 합니다. 예를 들어, 사용자가 블로그 게시물과 비디오를 공유할 수 있는 애플리케이션을 구축한다고 가정해 봅시다. 이러한 애플리케이션에서 `Comment` 모델은 `Post`와 `Video` 모델 모두에 속할 수 있습니다.

<a name="one-to-one-polymorphic-relations"></a>
### 일대일 (다형성) (One to One Polymorphic)

<a name="one-to-one-polymorphic-table-structure"></a>
#### 테이블 구조 (Table Structure)

일대일 다형성 관계는 일반적인 일대일 관계와 유사합니다. 그러나 자식 모델은 단일 연결을 사용하여 둘 이상의 모델 타입에 속할 수 있습니다. 예를 들어, 블로그 `Post`와 `User`는 `Image` 모델에 대한 다형성 관계를 공유할 수 있습니다. 일대일 다형성 관계를 사용하면 게시물과 사용자와 연결될 수 있는 고유한 이미지의 단일 테이블을 가질 수 있습니다. 먼저 테이블 구조를 살펴보겠습니다.

```text
posts
    id - integer
    name - string

users
    id - integer
    name - string

images
    id - integer
    url - string
    imageable_id - integer
    imageable_type - string
```

`images` 테이블의 `imageable_id`와 `imageable_type` 컬럼을 주목하세요. `imageable_id` 컬럼은 게시물이나 사용자의 ID 값을 포함하고, `imageable_type` 컬럼은 부모 모델의 클래스명을 포함합니다. `imageable_type` 컬럼은 `imageable` 관계에 접근할 때 Eloquent가 어떤 "타입"의 부모 모델을 반환할지 결정하는 데 사용됩니다. 이 경우, 컬럼은 `App\Models\Post` 또는 `App\Models\User`를 포함합니다.

<a name="one-to-one-polymorphic-model-structure"></a>
#### 모델 구조 (Model Structure)

다음으로, 이 관계를 구축하는 데 필요한 모델 정의를 살펴보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Image extends Model
{
    /**
     * 부모 imageable 모델(사용자 또는 게시물)을 가져옵니다.
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo();
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Post extends Model
{
    /**
     * 게시물의 이미지를 가져옵니다.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class User extends Model
{
    /**
     * 사용자의 이미지를 가져옵니다.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기 (Retrieving the Relationship)

데이터베이스 테이블과 모델이 정의되면, 모델을 통해 관계에 접근할 수 있습니다. 예를 들어, 게시물의 이미지를 조회하려면 `image` 동적 관계 속성에 접근하면 됩니다.

```php
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

`morphTo`를 호출하는 메서드 이름에 접근하여 다형성 모델의 부모를 조회할 수 있습니다. 이 경우, `Image` 모델의 `imageable` 메서드입니다. 따라서 해당 메서드를 동적 관계 속성으로 접근합니다.

```php
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

`Image` 모델의 `imageable` 관계는 이미지를 소유한 모델의 타입에 따라 `Post` 또는 `User` 인스턴스를 반환합니다.

<a name="morph-one-to-one-key-conventions"></a>
#### 키 규칙 (Key Conventions)

필요한 경우, 다형성 자식 모델에서 사용하는 "id"와 "type" 컬럼의 이름을 지정할 수 있습니다. 그렇게 할 경우, 항상 `morphTo` 메서드의 첫 번째 인자로 관계 이름을 전달해야 합니다. 일반적으로 이 값은 메서드 이름과 일치해야 하므로, PHP의 `__FUNCTION__` 상수를 사용할 수 있습니다.

```php
/**
 * 이미지가 속한 모델을 가져옵니다.
 */
public function imageable(): MorphTo
{
    return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
}
```

<a name="one-to-many-polymorphic-relations"></a>
### 일대다 (다형성) (One to Many Polymorphic)

<a name="one-to-many-polymorphic-table-structure"></a>
#### 테이블 구조 (Table Structure)

일대다 다형성 관계는 일반적인 일대다 관계와 유사합니다. 그러나 자식 모델은 단일 연결을 사용하여 둘 이상의 모델 타입에 속할 수 있습니다. 예를 들어, 애플리케이션의 사용자가 게시물과 비디오에 "댓글"을 달 수 있다고 가정해 봅시다. 다형성 관계를 사용하면, 게시물과 비디오 모두에 대한 댓글을 포함하는 단일 `comments` 테이블을 사용할 수 있습니다. 먼저 이 관계를 구축하는 데 필요한 테이블 구조를 살펴보겠습니다.

```text
posts
    id - integer
    title - string
    body - text

videos
    id - integer
    title - string
    url - string

comments
    id - integer
    body - text
    commentable_id - integer
    commentable_type - string
```

<a name="one-to-many-polymorphic-model-structure"></a>
#### 모델 구조 (Model Structure)

다음으로, 이 관계를 구축하는 데 필요한 모델 정의를 살펴보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
    /**
     * 부모 commentable 모델(게시물 또는 비디오)을 가져옵니다.
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Post extends Model
{
    /**
     * 게시물의 모든 댓글을 가져옵니다.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Video extends Model
{
    /**
     * 비디오의 모든 댓글을 가져옵니다.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기 (Retrieving the Relationship)

데이터베이스 테이블과 모델이 정의되면, 모델의 동적 관계 속성을 통해 관계에 접근할 수 있습니다. 예를 들어, 게시물의 모든 댓글에 접근하려면 `comments` 동적 속성을 사용할 수 있습니다.

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    // ...
}
```

`morphTo`를 호출하는 메서드 이름에 접근하여 다형성 자식 모델의 부모를 조회할 수도 있습니다. 이 경우, `Comment` 모델의 `commentable` 메서드입니다. 따라서 댓글의 부모 모델에 접근하기 위해 해당 메서드를 동적 관계 속성으로 접근합니다.

```php
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

`Comment` 모델의 `commentable` 관계는 댓글의 부모가 어떤 타입의 모델인지에 따라 `Post` 또는 `Video` 인스턴스를 반환합니다.

<a name="polymorphic-automatically-hydrating-parent-models-on-children"></a>
#### 자식 모델에서 부모 모델 자동 하이드레이션 (Automatically Hydrating Parent Models on Children)

Eloquent 즉시 로딩(Eager Loading)을 사용하더라도, 자식 모델을 반복하면서 자식 모델에서 부모 모델에 접근하려고 하면 "N + 1" 쿼리 문제가 발생할 수 있습니다.

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->commentable->title;
    }
}
```

위 예제에서, 모든 `Post` 모델에 대해 댓글이 즉시 로딩되었음에도 불구하고, Eloquent가 각 자식 `Comment` 모델에 부모 `Post`를 자동으로 하이드레이션하지 않기 때문에 "N + 1" 쿼리 문제가 발생했습니다.

Eloquent가 부모 모델을 자식 모델에 자동으로 하이드레이션하도록 하려면, `morphMany` 관계를 정의할 때 `chaperone` 메서드를 호출하면 됩니다.

```php
class Post extends Model
{
    /**
     * 게시물의 모든 댓글을 가져옵니다.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->chaperone();
    }
}
```

또는 런타임에 자동 부모 하이드레이션을 선택하려면, 관계를 즉시 로딩할 때 `chaperone` 메서드를 호출할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-of-many-polymorphic-relations"></a>
### 다수 중 하나 (다형성) (One of Many Polymorphic)

때로는 모델이 많은 관련 모델을 가질 수 있지만, 관계의 "최신" 또는 "가장 오래된" 관련 모델을 쉽게 조회하고 싶을 수 있습니다. 예를 들어, `User` 모델은 많은 `Image` 모델과 관련될 수 있지만, 사용자가 업로드한 가장 최근 이미지와 상호작용하는 편리한 방법을 정의하고 싶을 수 있습니다. `morphOne` 관계 타입을 `ofMany` 메서드와 결합하여 이를 수행할 수 있습니다.

```php
/**
 * 사용자의 가장 최근 이미지를 가져옵니다.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

마찬가지로, 관계의 "가장 오래된" 또는 첫 번째 관련 모델을 조회하는 메서드를 정의할 수 있습니다.

```php
/**
 * 사용자의 가장 오래된 이미지를 가져옵니다.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

기본적으로, `latestOfMany`와 `oldestOfMany` 메서드는 정렬 가능해야 하는 모델의 기본 키를 기준으로 최신 또는 가장 오래된 관련 모델을 조회합니다. 그러나 때로는 다른 정렬 기준을 사용하여 더 큰 관계에서 단일 모델을 조회하고 싶을 수 있습니다.

예를 들어, `ofMany` 메서드를 사용하여 사용자의 가장 "좋아요"를 많이 받은 이미지를 조회할 수 있습니다. `ofMany` 메서드는 첫 번째 인자로 정렬 가능한 컬럼을 받고, 관련 모델을 쿼리할 때 적용할 집계 함수(`min` 또는 `max`)를 받습니다.

```php
/**
 * 사용자의 가장 인기 있는 이미지를 가져옵니다.
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> [!NOTE]
> 더 고급 "다수 중 하나" 관계를 구축할 수 있습니다. 자세한 내용은 [다수 중 하나 관계 문서](#advanced-has-one-of-many-relationships)를 참조하세요.

<a name="many-to-many-polymorphic-relations"></a>
### 다대다 (다형성) (Many to Many Polymorphic)

<a name="many-to-many-polymorphic-table-structure"></a>
#### 테이블 구조 (Table Structure)

다대다 다형성 관계는 "morph one"과 "morph many" 관계보다 약간 더 복잡합니다. 예를 들어, `Post` 모델과 `Video` 모델은 `Tag` 모델에 대한 다형성 관계를 공유할 수 있습니다. 이 상황에서 다대다 다형성 관계를 사용하면, 애플리케이션이 게시물이나 비디오와 연결될 수 있는 고유한 태그의 단일 테이블을 가질 수 있습니다. 먼저 이 관계를 구축하는 데 필요한 테이블 구조를 살펴보겠습니다.

```text
posts
    id - integer
    name - string

videos
    id - integer
    name - string

tags
    id - integer
    name - string

taggables
    tag_id - integer
    taggable_id - integer
    taggable_type - string
```

> [!NOTE]
> 다형성 다대다 관계에 대해 알아보기 전에, 일반적인 [다대다 관계](#many-to-many) 문서를 읽어보면 도움이 될 수 있습니다.

<a name="many-to-many-polymorphic-model-structure"></a>
#### 모델 구조 (Model Structure)

다음으로, 모델의 관계를 정의할 준비가 되었습니다. `Post`와 `Video` 모델은 모두 기본 Eloquent 모델 클래스에서 제공하는 `morphToMany` 메서드를 호출하는 `tags` 메서드를 포함합니다.

`morphToMany` 메서드는 관련 모델의 이름과 "관계 이름"을 인자로 받습니다. 중간 테이블 이름과 포함된 키에 할당한 이름을 기반으로, 관계를 "taggable"이라고 부릅니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Post extends Model
{
    /**
     * 게시물의 모든 태그를 가져옵니다.
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### 역관계 정의하기 (Defining the Inverse of the Relationship)

다음으로, `Tag` 모델에서 각각의 가능한 부모 모델에 대한 메서드를 정의해야 합니다. 따라서 이 예제에서는 `posts` 메서드와 `videos` 메서드를 정의합니다. 이 두 메서드 모두 `morphedByMany` 메서드의 결과를 반환해야 합니다.

`morphedByMany` 메서드는 관련 모델의 이름과 "관계 이름"을 인자로 받습니다. 중간 테이블 이름과 포함된 키에 할당한 이름을 기반으로, 관계를 "taggable"이라고 부릅니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends Model
{
    /**
     * 이 태그가 할당된 모든 게시물을 가져옵니다.
     */
    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * 이 태그가 할당된 모든 비디오를 가져옵니다.
     */
    public function videos(): MorphToMany
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-retrieving-the-relationship"></a>
#### 관계 조회하기 (Retrieving the Relationship)

데이터베이스 테이블과 모델이 정의되면, 모델을 통해 관계에 접근할 수 있습니다. 예를 들어, 게시물의 모든 태그에 접근하려면 `tags` 동적 관계 속성을 사용할 수 있습니다.

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    // ...
}
```

`morphedByMany`를 호출하는 메서드 이름에 접근하여 다형성 자식 모델에서 다형성 관계의 부모를 조회할 수 있습니다. 이 경우, `Tag` 모델의 `posts` 또는 `videos` 메서드입니다.

```php
use App\Models\Tag;

$tag = Tag::find(1);

foreach ($tag->posts as $post) {
    // ...
}

foreach ($tag->videos as $video) {
    // ...
}
```

<a name="custom-polymorphic-types"></a>
### 커스텀 다형성 타입 (Custom Polymorphic Types)

기본적으로, Laravel은 관련 모델의 "타입"을 저장하기 위해 완전한 클래스명을 사용합니다. 예를 들어, 위의 일대다 관계 예제에서 `Comment` 모델이 `Post` 또는 `Video` 모델에 속할 수 있는 경우, 기본 `commentable_type`은 각각 `App\Models\Post` 또는 `App\Models\Video`가 됩니다. 그러나 이러한 값을 애플리케이션의 내부 구조와 분리하고 싶을 수 있습니다.

예를 들어, 모델 이름을 "타입"으로 사용하는 대신 `post`와 `video`와 같은 간단한 문자열을 사용할 수 있습니다. 이렇게 하면, 모델 이름이 변경되더라도 데이터베이스의 다형성 "타입" 컬럼 값이 유효하게 유지됩니다.

```php
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

`App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `enforceMorphMap` 메서드를 호출하거나, 원하는 경우 별도의 서비스 프로바이더를 생성할 수 있습니다.

모델의 `getMorphClass` 메서드를 사용하여 런타임에 주어진 모델의 morph 별칭을 확인할 수 있습니다. 반대로, `Relation::getMorphedModel` 메서드를 사용하여 morph 별칭과 연결된 완전한 클래스명을 확인할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> [!WARNING]
> 기존 애플리케이션에 "morph map"을 추가할 때, 데이터베이스에서 여전히 완전한 클래스명을 포함하는 모든 morphable `*_type` 컬럼 값을 "map" 이름으로 변환해야 합니다.

<a name="dynamic-relationships"></a>
### 동적 관계 (Dynamic Relationships)

`resolveRelationUsing` 메서드를 사용하여 런타임에 Eloquent 모델 간의 관계를 정의할 수 있습니다. 일반적인 애플리케이션 개발에는 권장되지 않지만, Laravel 패키지를 개발할 때 가끔 유용할 수 있습니다.

`resolveRelationUsing` 메서드는 첫 번째 인자로 원하는 관계 이름을 받습니다. 메서드에 전달되는 두 번째 인자는 모델 인스턴스를 받아 유효한 Eloquent 관계 정의를 반환하는 클로저여야 합니다. 일반적으로 [서비스 프로바이더](/docs/{{version}}/providers)의 boot 메서드 내에서 동적 관계를 설정해야 합니다.

```php
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function (Order $orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```
> [!WARNING]
> 동적 관계를 정의할 때는 항상 Eloquent 관계 메서드에 명시적인 키 이름 인수를 제공해야 합니다.

<a name="querying-relations"></a>
## 관계 쿼리(Querying Relations)

모든 Eloquent 관계는 메서드를 통해 정의되므로, 실제로 관련 모델을 로드하는 쿼리를 실행하지 않고도 해당 메서드를 호출하여 관계 인스턴스를 얻을 수 있습니다. 또한 모든 유형의 Eloquent 관계는 [쿼리 빌더](/docs/{{version}}/queries) 역할도 하므로, 최종적으로 데이터베이스에 대해 SQL 쿼리를 실행하기 전에 관계 쿼리에 제약 조건을 계속 체이닝할 수 있습니다.

예를 들어, `User` 모델이 여러 개의 관련 `Post` 모델을 가지는 블로그 애플리케이션을 상상해 보세요.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * 사용자의 모든 게시물을 가져옵니다.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

다음과 같이 `posts` 관계를 쿼리하고 추가 제약 조건을 추가할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

Laravel [쿼리 빌더](/docs/{{version}}/queries)의 모든 메서드를 관계에서 사용할 수 있으므로, 사용 가능한 모든 메서드에 대해 쿼리 빌더 문서를 살펴보세요.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### 관계 후 `orWhere` 절 체이닝

위의 예제에서 보여준 것처럼, 관계를 쿼리할 때 추가 제약 조건을 자유롭게 추가할 수 있습니다. 그러나 관계에 `orWhere` 절을 체이닝할 때는 주의해야 합니다. `orWhere` 절은 관계 제약 조건과 동일한 수준에서 논리적으로 그룹화되기 때문입니다.

```php
$user->posts()
    ->where('active', 1)
    ->orWhere('votes', '>=', 100)
    ->get();
```

위의 예제는 다음 SQL을 생성합니다. 보시다시피, `or` 절은 쿼리가 100표 이상인 _모든_ 게시물을 반환하도록 지시합니다. 쿼리는 더 이상 특정 사용자로 제한되지 않습니다.

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

대부분의 상황에서는 [논리적 그룹](/docs/{{version}}/queries#logical-grouping)을 사용하여 조건부 검사를 괄호 사이에 그룹화해야 합니다.

```php
use Illuminate\Database\Eloquent\Builder;

$user->posts()
    ->where(function (Builder $query) {
        return $query->where('active', 1)
            ->orWhere('votes', '>=', 100);
    })
    ->get();
```

위의 예제는 다음 SQL을 생성합니다. 논리적 그룹화가 제약 조건을 올바르게 그룹화했으며 쿼리가 특정 사용자로 제한되어 있음을 확인하세요.

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### 관계 메서드 vs. 동적 프로퍼티(Relationship Methods vs. Dynamic Properties)

Eloquent 관계 쿼리에 추가 제약 조건을 추가할 필요가 없다면, 관계를 마치 프로퍼티처럼 접근할 수 있습니다. 예를 들어, `User` 및 `Post` 예제 모델을 계속 사용하여, 다음과 같이 사용자의 모든 게시물에 접근할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    // ...
}
```

동적 관계 프로퍼티는 "지연 로딩(lazy loading)"을 수행합니다. 즉, 실제로 접근할 때만 관계 데이터를 로드합니다. 이 때문에 개발자들은 종종 [즉시 로딩(eager loading)](#eager-loading)을 사용하여 모델을 로드한 후 접근할 것으로 알고 있는 관계를 미리 로드합니다. 즉시 로딩은 모델의 관계를 로드하기 위해 실행해야 하는 SQL 쿼리를 크게 줄여줍니다.

<a name="querying-relationship-existence"></a>
### 관계 존재 여부 쿼리(Querying Relationship Existence)

모델 레코드를 조회할 때, 관계의 존재 여부에 따라 결과를 제한하고 싶을 수 있습니다. 예를 들어, 최소한 하나의 댓글이 있는 모든 블로그 게시물을 조회하고 싶다고 상상해 보세요. 이렇게 하려면 관계 이름을 `has` 및 `orHas` 메서드에 전달하면 됩니다.

```php
use App\Models\Post;

// 최소한 하나의 댓글이 있는 모든 게시물을 조회합니다...
$posts = Post::has('comments')->get();
```

쿼리를 더욱 사용자 정의하기 위해 연산자와 카운트 값을 지정할 수도 있습니다.

```php
// 3개 이상의 댓글이 있는 모든 게시물을 조회합니다...
$posts = Post::has('comments', '>=', 3)->get();
```

중첩된 `has` 문은 "점" 표기법을 사용하여 구성할 수 있습니다. 예를 들어, 최소한 하나의 이미지가 있는 댓글이 최소 하나 있는 모든 게시물을 조회할 수 있습니다.

```php
// 이미지가 있는 댓글이 최소 하나 있는 게시물을 조회합니다...
$posts = Post::has('comments.images')->get();
```

더 강력한 기능이 필요하다면, `whereHas` 및 `orWhereHas` 메서드를 사용하여 댓글 내용을 검사하는 것과 같이 `has` 쿼리에 추가 쿼리 제약 조건을 정의할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

// code%와 같은 단어가 포함된 댓글이 최소 하나 있는 게시물을 조회합니다...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// code%와 같은 단어가 포함된 댓글이 10개 이상인 게시물을 조회합니다...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> [!WARNING]
> Eloquent는 현재 데이터베이스 간에 관계 존재 여부를 쿼리하는 것을 지원하지 않습니다. 관계는 동일한 데이터베이스 내에 존재해야 합니다.

<a name="many-to-many-relationship-existence-queries"></a>
#### 다대다 관계 존재 여부 쿼리(Many to Many Relationship Existence Queries)

`whereAttachedTo` 메서드는 모델 또는 모델 컬렉션에 다대다 연결이 있는 모델을 쿼리하는 데 사용할 수 있습니다.

```php
$users = User::whereAttachedTo($role)->get();
```

`whereAttachedTo` 메서드에 [컬렉션](/docs/{{version}}/eloquent-collections) 인스턴스를 제공할 수도 있습니다. 이렇게 하면 Laravel은 컬렉션 내의 모든 모델에 연결된 모델을 조회합니다.

```php
$tags = Tag::whereLike('name', '%laravel%')->get();

$posts = Post::whereAttachedTo($tags)->get();
```

<a name="inline-relationship-existence-queries"></a>
#### 인라인 관계 존재 여부 쿼리(Inline Relationship Existence Queries)

관계 쿼리에 단일하고 간단한 where 조건이 첨부된 관계의 존재 여부를 쿼리하고 싶다면, `whereRelation`, `orWhereRelation`, `whereMorphRelation`, `orWhereMorphRelation` 메서드를 사용하는 것이 더 편리할 수 있습니다. 예를 들어, 승인되지 않은 댓글이 있는 모든 게시물을 쿼리할 수 있습니다.

```php
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

물론, 쿼리 빌더의 `where` 메서드 호출과 마찬가지로 연산자를 지정할 수도 있습니다.

```php
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->minus(hours: 1)
)->get();
```

<a name="querying-relationship-absence"></a>
### 관계 부재 쿼리(Querying Relationship Absence)

모델 레코드를 조회할 때, 관계의 부재에 따라 결과를 제한하고 싶을 수 있습니다. 예를 들어, 댓글이 **전혀 없는** 모든 블로그 게시물을 조회하고 싶다고 상상해 보세요. 이렇게 하려면 관계 이름을 `doesntHave` 및 `orDoesntHave` 메서드에 전달하면 됩니다.

```php
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

더 강력한 기능이 필요하다면, `whereDoesntHave` 및 `orWhereDoesntHave` 메서드를 사용하여 댓글 내용을 검사하는 것과 같이 `doesntHave` 쿼리에 추가 쿼리 제약 조건을 추가할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

"점" 표기법을 사용하여 중첩된 관계에 대한 쿼리를 실행할 수 있습니다. 예를 들어, 다음 쿼리는 댓글이 없는 모든 게시물과 댓글이 있지만 차단된 사용자의 댓글이 하나도 없는 게시물을 조회합니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 1);
})->get();
```

<a name="querying-morph-to-relationships"></a>
### Morph To 관계 쿼리(Querying Morph To Relationships)

"morph to" 관계의 존재 여부를 쿼리하려면 `whereHasMorph` 및 `whereDoesntHaveMorph` 메서드를 사용할 수 있습니다. 이 메서드는 관계 이름을 첫 번째 인수로 받습니다. 다음으로, 쿼리에 포함하려는 관련 모델의 이름을 받습니다. 마지막으로, 관계 쿼리를 사용자 정의하는 클로저를 제공할 수 있습니다.

```php
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// code%와 같은 제목을 가진 게시물 또는 비디오와 연결된 댓글을 조회합니다...
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// code%와 같지 않은 제목을 가진 게시물과 연결된 댓글을 조회합니다...
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

관련 다형성 모델의 "유형"에 따라 쿼리 제약 조건을 추가해야 할 때가 있을 수 있습니다. `whereHasMorph` 메서드에 전달된 클로저는 두 번째 인수로 `$type` 값을 받을 수 있습니다. 이 인수를 사용하면 빌드 중인 쿼리의 "유형"을 검사할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query, string $type) {
        $column = $type === Post::class ? 'content' : 'title';

        $query->where($column, 'like', 'code%');
    }
)->get();
```

때때로 "morph to" 관계의 부모의 자식을 쿼리하고 싶을 수 있습니다. `whereMorphedTo` 및 `whereNotMorphedTo` 메서드를 사용하여 이를 수행할 수 있으며, 주어진 모델에 대한 적절한 morph 유형 매핑을 자동으로 결정합니다. 이 메서드는 `morphTo` 관계의 이름을 첫 번째 인수로, 관련 부모 모델을 두 번째 인수로 받습니다.

```php
$comments = Comment::whereMorphedTo('commentable', $post)
    ->orWhereMorphedTo('commentable', $video)
    ->get();
```

<a name="querying-all-morph-to-related-models"></a>
#### 모든 관련 모델 쿼리(Querying All Related Models)

가능한 다형성 모델의 배열을 전달하는 대신, 와일드카드 값으로 `*`를 제공할 수 있습니다. 이렇게 하면 Laravel이 데이터베이스에서 가능한 모든 다형성 유형을 조회하도록 지시합니다. Laravel은 이 작업을 수행하기 위해 추가 쿼리를 실행합니다.

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
    $query->where('title', 'like', 'foo%');
})->get();
```

<a name="aggregating-related-models"></a>
## 관련 모델 집계(Aggregating Related Models)

<a name="counting-related-models"></a>
### 관련 모델 카운팅(Counting Related Models)

때때로 실제로 모델을 로드하지 않고 주어진 관계에 대한 관련 모델 수를 세고 싶을 수 있습니다. 이를 위해 `withCount` 메서드를 사용할 수 있습니다. `withCount` 메서드는 결과 모델에 `{relation}_count` 속성을 배치합니다.

```php
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

`withCount` 메서드에 배열을 전달하면 여러 관계에 대한 "카운트"를 추가할 수 있으며, 쿼리에 추가 제약 조건도 추가할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

관계 카운트 결과에 별칭을 지정할 수도 있어, 동일한 관계에 대해 여러 카운트를 허용합니다.

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount([
    'comments',
    'comments as pending_comments_count' => function (Builder $query) {
        $query->where('approved', false);
    },
])->get();

echo $posts[0]->comments_count;
echo $posts[0]->pending_comments_count;
```

<a name="deferred-count-loading"></a>
#### 지연 카운트 로딩(Deferred Count Loading)

`loadCount` 메서드를 사용하면, 부모 모델이 이미 조회된 후에 관계 카운트를 로드할 수 있습니다.

```php
$book = Book::first();

$book->loadCount('genres');
```

카운트 쿼리에 추가 쿼리 제약 조건을 설정해야 하는 경우, 카운트하려는 관계로 키가 지정된 배열을 전달할 수 있습니다. 배열 값은 쿼리 빌더 인스턴스를 받는 클로저여야 합니다.

```php
$book->loadCount(['reviews' => function (Builder $query) {
    $query->where('rating', 5);
}])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### 관계 카운팅과 커스텀 Select 문(Relationship Counting and Custom Select Statements)

`withCount`를 `select` 문과 결합하는 경우, `select` 메서드 이후에 `withCount`를 호출해야 합니다.

```php
$posts = Post::select(['title', 'body'])
    ->withCount('comments')
    ->get();
```

<a name="other-aggregate-functions"></a>
### 기타 집계 함수(Other Aggregate Functions)

`withCount` 메서드 외에도, Eloquent는 `withMin`, `withMax`, `withAvg`, `withSum`, `withExists` 메서드를 제공합니다. 이 메서드들은 결과 모델에 `{relation}_{function}_{column}` 속성을 배치합니다.

```php
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

다른 이름을 사용하여 집계 함수의 결과에 접근하려면, 고유한 별칭을 지정할 수 있습니다.

```php
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

`loadCount` 메서드와 마찬가지로, 이러한 메서드의 지연 버전도 사용할 수 있습니다. 이러한 추가 집계 작업은 이미 조회된 Eloquent 모델에서 수행할 수 있습니다.

```php
$post = Post::first();

$post->loadSum('comments', 'votes');
```

이러한 집계 메서드를 `select` 문과 결합하는 경우, `select` 메서드 이후에 집계 메서드를 호출해야 합니다.

```php
$posts = Post::select(['title', 'body'])
    ->withExists('comments')
    ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Morph To 관계에서 관련 모델 카운팅(Counting Related Models on Morph To Relationships)

"morph to" 관계를 즉시 로드하고, 해당 관계에서 반환될 수 있는 다양한 엔티티에 대한 관련 모델 카운트도 함께 로드하려면, `with` 메서드와 `morphTo` 관계의 `morphWithCount` 메서드를 함께 사용할 수 있습니다.

이 예제에서, `Photo` 및 `Post` 모델이 `ActivityFeed` 모델을 생성할 수 있다고 가정해 보겠습니다. `ActivityFeed` 모델이 주어진 `ActivityFeed` 인스턴스에 대한 부모 `Photo` 또는 `Post` 모델을 조회할 수 있게 해주는 `parentable`이라는 "morph to" 관계를 정의한다고 가정하겠습니다. 또한, `Photo` 모델은 여러 `Tag` 모델을 "가지고(have many)" 있고, `Post` 모델은 여러 `Comment` 모델을 "가지고 있다"고 가정하겠습니다.

이제 `ActivityFeed` 인스턴스를 조회하고 각 `ActivityFeed` 인스턴스에 대한 `parentable` 부모 모델을 즉시 로드하고 싶다고 상상해 보세요. 또한, 각 부모 사진과 연결된 태그 수와 각 부모 게시물과 연결된 댓글 수를 조회하고 싶습니다.

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$activities = ActivityFeed::with([
    'parentable' => function (MorphTo $morphTo) {
        $morphTo->morphWithCount([
            Photo::class => ['tags'],
            Post::class => ['comments'],
        ]);
    }])->get();
```

<a name="morph-to-deferred-count-loading"></a>
#### 지연 카운트 로딩(Deferred Count Loading)

이미 `ActivityFeed` 모델 세트를 조회했고 이제 활동 피드와 연결된 다양한 `parentable` 모델에 대한 중첩된 관계 카운트를 로드하고 싶다고 가정해 보겠습니다. `loadMorphCount` 메서드를 사용하여 이를 수행할 수 있습니다.

```php
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

<a name="eager-loading"></a>
## 즉시 로딩(Eager Loading)

Eloquent 관계를 프로퍼티로 접근할 때, 관련 모델은 "지연 로딩(lazy loaded)"됩니다. 이는 처음 프로퍼티에 접근할 때까지 관계 데이터가 실제로 로드되지 않는다는 것을 의미합니다. 그러나 Eloquent는 부모 모델을 쿼리할 때 관계를 "즉시 로드(eager load)"할 수 있습니다. 즉시 로딩은 "N + 1" 쿼리 문제를 완화합니다. N + 1 쿼리 문제를 설명하기 위해, `Author` 모델에 "속하는(belongs to)" `Book` 모델을 고려해 보세요.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * 책을 작성한 저자를 가져옵니다.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }
}
```

이제 모든 책과 그 저자를 조회해 보겠습니다.

```php
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

이 루프는 데이터베이스 테이블에서 모든 책을 조회하기 위해 하나의 쿼리를 실행한 다음, 책의 저자를 조회하기 위해 각 책에 대해 또 다른 쿼리를 실행합니다. 따라서 책이 25권이라면, 위의 코드는 26개의 쿼리를 실행합니다: 원본 책에 대해 하나, 각 책의 저자를 조회하기 위해 25개의 추가 쿼리입니다.

다행히도, 즉시 로딩을 사용하여 이 작업을 단 두 개의 쿼리로 줄일 수 있습니다. 쿼리를 작성할 때, `with` 메서드를 사용하여 어떤 관계를 즉시 로드해야 하는지 지정할 수 있습니다.

```php
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

이 작업에서는 두 개의 쿼리만 실행됩니다 - 모든 책을 조회하는 쿼리 하나와 모든 책의 저자를 조회하는 쿼리 하나입니다.

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### 여러 관계 즉시 로딩(Eager Loading Multiple Relationships)

때때로 여러 다른 관계를 즉시 로드해야 할 수 있습니다. 그렇게 하려면, `with` 메서드에 관계 배열을 전달하면 됩니다.

```php
$books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### 중첩된 즉시 로딩(Nested Eager Loading)

관계의 관계를 즉시 로드하려면 "점" 구문을 사용할 수 있습니다. 예를 들어, 책의 모든 저자와 저자의 모든 개인 연락처를 즉시 로드해 보겠습니다.

```php
$books = Book::with('author.contacts')->get();
```

또는 `with` 메소드에 중첩된 배열을 제공하여 중첩된 즉시 로드 관계를 지정할 수 있으며, 이는 여러 중첩 관계를 즉시 로드할 때 편리할 수 있습니다.

```php
$books = Book::with([
    'author' => [
        'contacts',
        'publisher',
    ],
])->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
#### 중첩된 `morphTo` 관계의 즉시 로딩(Nested Eager Loading `morphTo` Relationships)

`morphTo` 관계와 해당 관계에서 반환될 수 있는 다양한 엔티티의 중첩 관계를 즉시 로드하려면 `with` 메소드와 `morphTo` 관계의 `morphWith` 메소드를 함께 사용할 수 있습니다. 이 메소드를 설명하기 위해 다음 모델을 살펴보겠습니다.

```php
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * 활동 피드 레코드의 부모를 가져옵니다.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

이 예제에서 `Event`, `Photo`, `Post` 모델이 `ActivityFeed` 모델을 생성할 수 있다고 가정합니다. 또한 `Event` 모델은 `Calendar` 모델에 속하고, `Photo` 모델은 `Tag` 모델과 연관되며, `Post` 모델은 `Author` 모델에 속한다고 가정합니다.

이러한 모델 정의와 관계를 사용하여 `ActivityFeed` 모델 인스턴스를 조회하고 모든 `parentable` 모델과 각각의 중첩 관계를 즉시 로드할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$activities = ActivityFeed::query()
    ->with(['parentable' => function (MorphTo $morphTo) {
        $morphTo->morphWith([
            Event::class => ['calendar'],
            Photo::class => ['tags'],
            Post::class => ['author'],
        ]);
    }])->get();
```

<a name="eager-loading-specific-columns"></a>
#### 특정 컬럼의 즉시 로딩(Eager Loading Specific Columns)

조회하는 관계에서 항상 모든 컬럼이 필요한 것은 아닙니다. 이러한 이유로 Eloquent에서는 관계에서 조회할 컬럼을 지정할 수 있습니다.

```php
$books = Book::with('author:id,name,book_id')->get();
```

> [!WARNING]
> 이 기능을 사용할 때는 조회하려는 컬럼 목록에 항상 `id` 컬럼과 관련 외래 키 컬럼을 포함해야 합니다.

<a name="eager-loading-by-default"></a>
#### 기본 즉시 로딩(Eager Loading by Default)

때로는 모델을 조회할 때 항상 일부 관계를 로드하고 싶을 수 있습니다. 이를 위해 모델에 `$with` 속성을 정의할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * 항상 로드되어야 하는 관계.
     *
     * @var array
     */
    protected $with = ['author'];

    /**
     * 책을 작성한 저자를 가져옵니다.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * 책의 장르를 가져옵니다.
     */
    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }
}
```

단일 쿼리에서 `$with` 속성의 항목을 제거하려면 `without` 메소드를 사용할 수 있습니다.

```php
$books = Book::without('author')->get();
```

단일 쿼리에서 `$with` 속성의 모든 항목을 재정의하려면 `withOnly` 메소드를 사용할 수 있습니다.

```php
$books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### 즉시 로드에 제약 조건 추가(Constraining Eager Loads)

때로는 관계를 즉시 로드하면서 즉시 로딩 쿼리에 추가 쿼리 조건을 지정하고 싶을 수 있습니다. 이를 위해 배열 키가 관계 이름이고 배열 값이 즉시 로딩 쿼리에 추가 제약 조건을 추가하는 클로저인 관계 배열을 `with` 메소드에 전달하면 됩니다.

```php
use App\Models\User;

$users = User::with(['posts' => function ($query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

이 예제에서 Eloquent는 게시물의 `title` 컬럼에 `code`라는 단어가 포함된 게시물만 즉시 로드합니다. 다른 [쿼리 빌더](/docs/{{version}}/queries) 메소드를 호출하여 즉시 로딩 작업을 추가로 사용자 정의할 수 있습니다.

```php
$users = User::with(['posts' => function ($query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### `morphTo` 관계의 즉시 로딩에 제약 조건 추가(Constraining Eager Loading of `morphTo` Relationships)

`morphTo` 관계를 즉시 로드하는 경우 Eloquent는 각 유형의 관련 모델을 가져오기 위해 여러 쿼리를 실행합니다. `MorphTo` 관계의 `constrain` 메소드를 사용하여 이러한 각 쿼리에 추가 제약 조건을 추가할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$comments = Comment::with(['commentable' => function (MorphTo $morphTo) {
    $morphTo->constrain([
        Post::class => function ($query) {
            $query->whereNull('hidden_at');
        },
        Video::class => function ($query) {
            $query->where('type', 'educational');
        },
    ]);
}])->get();
```

이 예제에서 Eloquent는 숨겨지지 않은 게시물과 `type` 값이 "educational"인 비디오만 즉시 로드합니다.

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### 관계 존재 여부로 즉시 로드 제약(Constraining Eager Loads With Relationship Existence)

때로는 관계의 존재 여부를 확인하면서 동시에 동일한 조건에 따라 관계를 로드해야 할 수 있습니다. 예를 들어, 주어진 쿼리 조건과 일치하는 자식 `Post` 모델이 있는 `User` 모델만 조회하면서 일치하는 게시물도 즉시 로드하고 싶을 수 있습니다. `withWhereHas` 메소드를 사용하여 이를 수행할 수 있습니다.

```php
use App\Models\User;

$users = User::withWhereHas('posts', function ($query) {
    $query->where('featured', true);
})->get();
```

<a name="lazy-eager-loading"></a>
### 지연 즉시 로딩(Lazy Eager Loading)

때로는 부모 모델이 이미 조회된 후에 관계를 즉시 로드해야 할 수 있습니다. 예를 들어, 관련 모델을 로드할지 여부를 동적으로 결정해야 하는 경우에 유용할 수 있습니다.

```php
use App\Models\Book;

$books = Book::all();

if ($condition) {
    $books->load('author', 'publisher');
}
```

즉시 로딩 쿼리에 추가 쿼리 제약 조건을 설정해야 하는 경우, 로드하려는 관계를 키로 하는 배열을 전달할 수 있습니다. 배열 값은 쿼리 인스턴스를 받는 클로저 인스턴스여야 합니다.

```php
$author->load(['books' => function ($query) {
    $query->orderBy('published_date', 'asc');
}]);
```

관계가 아직 로드되지 않은 경우에만 관계를 로드하려면 `loadMissing` 메소드를 사용합니다.

```php
$book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### 중첩된 지연 즉시 로딩과 `morphTo`(Nested Lazy Eager Loading and `morphTo`)

`morphTo` 관계와 해당 관계에서 반환될 수 있는 다양한 엔티티의 중첩 관계를 즉시 로드하려면 `loadMorph` 메소드를 사용할 수 있습니다.

이 메소드는 첫 번째 인수로 `morphTo` 관계의 이름을 받고, 두 번째 인수로 모델/관계 쌍의 배열을 받습니다. 이 메소드를 설명하기 위해 다음 모델을 살펴보겠습니다.

```php
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * 활동 피드 레코드의 부모를 가져옵니다.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

이 예제에서 `Event`, `Photo`, `Post` 모델이 `ActivityFeed` 모델을 생성할 수 있다고 가정합니다. 또한 `Event` 모델은 `Calendar` 모델에 속하고, `Photo` 모델은 `Tag` 모델과 연관되며, `Post` 모델은 `Author` 모델에 속한다고 가정합니다.

이러한 모델 정의와 관계를 사용하여 `ActivityFeed` 모델 인스턴스를 조회하고 모든 `parentable` 모델과 각각의 중첩 관계를 즉시 로드할 수 있습니다.

```php
$activities = ActivityFeed::with('parentable')
    ->get()
    ->loadMorph('parentable', [
        Event::class => ['calendar'],
        Photo::class => ['tags'],
        Post::class => ['author'],
    ]);
```

<a name="automatic-eager-loading"></a>
### 자동 즉시 로딩(Automatic Eager Loading)

> [!WARNING]
> 이 기능은 현재 커뮤니티 피드백을 수집하기 위해 베타 버전입니다. 이 기능의 동작과 기능은 패치 릴리스에서도 변경될 수 있습니다.

많은 경우 Laravel은 접근하는 관계를 자동으로 즉시 로드할 수 있습니다. 자동 즉시 로딩을 활성화하려면 애플리케이션의 `AppServiceProvider`의 `boot` 메소드 내에서 `Model::automaticallyEagerLoadRelationships` 메소드를 호출해야 합니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Model::automaticallyEagerLoadRelationships();
}
```

이 기능이 활성화되면 Laravel은 이전에 로드되지 않은 접근하는 모든 관계를 자동으로 로드하려고 시도합니다. 예를 들어, 다음 시나리오를 고려해 보세요.

```php
use App\Models\User;

$users = User::all();

foreach ($users as $user) {
    foreach ($user->posts as $post) {
        foreach ($post->comments as $comment) {
            echo $comment->content;
        }
    }
}
```

일반적으로 위 코드는 각 사용자의 게시물을 조회하기 위해 각 사용자에 대해 쿼리를 실행하고, 댓글을 조회하기 위해 각 게시물에 대해 쿼리를 실행합니다. 그러나 `automaticallyEagerLoadRelationships` 기능이 활성화되면 Laravel은 조회된 사용자 중 하나에서 게시물에 접근하려고 할 때 사용자 컬렉션의 모든 사용자에 대해 게시물을 자동으로 [지연 즉시 로드](#lazy-eager-loading)합니다. 마찬가지로, 조회된 게시물 중 하나의 댓글에 접근하려고 할 때 원래 조회된 모든 게시물에 대해 모든 댓글이 지연 즉시 로드됩니다.

자동 즉시 로딩을 전역적으로 활성화하지 않으려면 컬렉션에서 `withRelationshipAutoloading` 메소드를 호출하여 단일 Eloquent 컬렉션 인스턴스에 대해 이 기능을 활성화할 수 있습니다.

```php
$users = User::where('vip', true)->get();

return $users->withRelationshipAutoloading();
```

<a name="preventing-lazy-loading"></a>
### 지연 로딩 방지(Preventing Lazy Loading)

이전에 논의한 바와 같이, 관계를 즉시 로드하면 애플리케이션에 상당한 성능 이점을 제공할 수 있습니다. 따라서 원한다면 Laravel에 항상 관계의 지연 로딩을 방지하도록 지시할 수 있습니다. 이를 위해 기본 Eloquent 모델 클래스에서 제공하는 `preventLazyLoading` 메소드를 호출할 수 있습니다. 일반적으로 이 메소드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메소드 내에서 호출해야 합니다.

`preventLazyLoading` 메소드는 지연 로딩을 방지해야 하는지 여부를 나타내는 선택적 불리언 인수를 받습니다. 예를 들어, 프로덕션 환경에서는 지연 로드된 관계가 실수로 프로덕션 코드에 존재하더라도 프로덕션 환경이 정상적으로 작동하도록 비프로덕션 환경에서만 지연 로딩을 비활성화할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

지연 로딩을 방지한 후 애플리케이션이 Eloquent 관계를 지연 로드하려고 하면 Eloquent는 `Illuminate\Database\LazyLoadingViolationException` 예외를 발생시킵니다.

`handleLazyLoadingViolationsUsing` 메소드를 사용하여 지연 로딩 위반의 동작을 사용자 정의할 수 있습니다. 예를 들어, 이 메소드를 사용하여 예외로 애플리케이션 실행을 중단하는 대신 지연 로딩 위반을 로깅만 하도록 지시할 수 있습니다.

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## 관련 모델 삽입 및 업데이트(Inserting and Updating Related Models)

<a name="the-save-method"></a>
### `save` 메소드

Eloquent는 관계에 새 모델을 추가하기 위한 편리한 메소드를 제공합니다. 예를 들어, 게시물에 새 댓글을 추가해야 할 수 있습니다. `Comment` 모델에 `post_id` 속성을 수동으로 설정하는 대신 관계의 `save` 메소드를 사용하여 댓글을 삽입할 수 있습니다.

```php
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

`comments` 관계에 동적 속성으로 접근하지 않았습니다. 대신 관계의 인스턴스를 얻기 위해 `comments` 메소드를 호출했습니다. `save` 메소드는 새 `Comment` 모델에 적절한 `post_id` 값을 자동으로 추가합니다.

여러 관련 모델을 저장해야 하는 경우 `saveMany` 메소드를 사용할 수 있습니다.

```php
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

`save` 및 `saveMany` 메소드는 주어진 모델 인스턴스를 영속화하지만, 새로 영속화된 모델을 부모 모델에 이미 로드된 인메모리 관계에 추가하지 않습니다. `save` 또는 `saveMany` 메소드를 사용한 후 관계에 접근하려면 `refresh` 메소드를 사용하여 모델과 해당 관계를 다시 로드할 수 있습니다.

```php
$post->comments()->save($comment);

$post->refresh();

// 새로 저장된 댓글을 포함한 모든 댓글...
$post->comments;
```

<a name="the-push-method"></a>
#### 모델과 관계의 재귀적 저장(Recursively Saving Models and Relationships)

모델과 연관된 모든 관계를 `save`하려면 `push` 메소드를 사용할 수 있습니다. 이 예제에서 `Post` 모델은 댓글과 댓글의 작성자와 함께 저장됩니다.

```php
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

`pushQuietly` 메소드는 이벤트를 발생시키지 않고 모델과 연관된 관계를 저장하는 데 사용할 수 있습니다.

```php
$post->pushQuietly();
```

<a name="the-create-method"></a>
### `create` 메소드

`save` 및 `saveMany` 메소드 외에도 속성 배열을 받아 모델을 생성하고 데이터베이스에 삽입하는 `create` 메소드를 사용할 수 있습니다. `save`와 `create`의 차이점은 `save`는 전체 Eloquent 모델 인스턴스를 받는 반면 `create`는 일반 PHP `array`를 받는다는 것입니다. 새로 생성된 모델은 `create` 메소드에 의해 반환됩니다.

```php
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

`createMany` 메소드를 사용하여 여러 관련 모델을 생성할 수 있습니다.

```php
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

`createQuietly` 및 `createManyQuietly` 메소드는 이벤트를 발생시키지 않고 모델을 생성하는 데 사용할 수 있습니다.

```php
$user = User::find(1);

$user->posts()->createQuietly([
    'title' => 'Post title.',
]);

$user->posts()->createManyQuietly([
    ['title' => 'First post.'],
    ['title' => 'Second post.'],
]);
```

`findOrNew`, `firstOrNew`, `firstOrCreate`, `updateOrCreate` 메소드를 사용하여 [관계에서 모델을 생성하고 업데이트](/docs/{{version}}/eloquent#upserts)할 수도 있습니다.

> [!NOTE]
> `create` 메소드를 사용하기 전에 [대량 할당(mass assignment)](/docs/{{version}}/eloquent#mass-assignment) 문서를 검토하세요.

<a name="updating-belongs-to-relationships"></a>
### Belongs To 관계

자식 모델을 새 부모 모델에 할당하려면 `associate` 메소드를 사용할 수 있습니다. 이 예제에서 `User` 모델은 `Account` 모델에 대한 `belongsTo` 관계를 정의합니다. 이 `associate` 메소드는 자식 모델에 외래 키를 설정합니다.

```php
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

자식 모델에서 부모 모델을 제거하려면 `dissociate` 메소드를 사용할 수 있습니다. 이 메소드는 관계의 외래 키를 `null`로 설정합니다.

```php
$user->account()->dissociate();

$user->save();
```

<a name="updating-many-to-many-relationships"></a>
### 다대다 관계(Many to Many Relationships)

<a name="attaching-detaching"></a>
#### 연결 / 분리(Attaching / Detaching)

Eloquent는 다대다 관계 작업을 더 편리하게 만드는 메소드도 제공합니다. 예를 들어, 사용자가 여러 역할을 가질 수 있고 역할이 여러 사용자를 가질 수 있다고 가정해 보겠습니다. `attach` 메소드를 사용하여 관계의 중간 테이블에 레코드를 삽입하여 사용자에게 역할을 연결할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

모델에 관계를 연결할 때 중간 테이블에 삽입할 추가 데이터 배열을 전달할 수도 있습니다.

```php
$user->roles()->attach($roleId, ['expires' => $expires]);
```

때로는 사용자에게서 역할을 제거해야 할 수 있습니다. 다대다 관계 레코드를 제거하려면 `detach` 메소드를 사용합니다. `detach` 메소드는 중간 테이블에서 적절한 레코드를 삭제합니다. 그러나 두 모델 모두 데이터베이스에 남아 있습니다.

```php
// 사용자에게서 단일 역할을 분리합니다...
$user->roles()->detach($roleId);

// 사용자에게서 모든 역할을 분리합니다...
$user->roles()->detach();
```

편의를 위해 `attach`와 `detach`는 ID 배열도 입력으로 받습니다.

```php
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

<a name="syncing-associations"></a>
#### 연관 관계 동기화(Syncing Associations)

`sync` 메서드를 사용하여 다대다(many-to-many) 연관 관계를 구성할 수도 있습니다. `sync` 메서드는 중간 테이블에 배치할 ID 배열을 받습니다. 주어진 배열에 없는 ID는 중간 테이블에서 제거됩니다. 따라서 이 작업이 완료되면 주어진 배열에 있는 ID만 중간 테이블에 존재하게 됩니다.

```php
$user->roles()->sync([1, 2, 3]);
```

ID와 함께 추가적인 중간 테이블 값을 전달할 수도 있습니다.

```php
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

동기화되는 각 모델 ID에 동일한 중간 테이블 값을 삽입하고 싶다면 `syncWithPivotValues` 메서드를 사용할 수 있습니다.

```php
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

주어진 배열에 없는 기존 ID를 분리하지 않으려면 `syncWithoutDetaching` 메서드를 사용할 수 있습니다.

```php
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
#### 연관 관계 토글(Toggling Associations)

다대다 관계는 주어진 관련 모델 ID의 연결 상태를 "토글"하는 `toggle` 메서드도 제공합니다. 주어진 ID가 현재 연결되어 있으면 분리됩니다. 마찬가지로 현재 분리되어 있으면 연결됩니다.

```php
$user->roles()->toggle([1, 2, 3]);
```

ID와 함께 추가적인 중간 테이블 값을 전달할 수도 있습니다.

```php
$user->roles()->toggle([
    1 => ['expires' => true],
    2 => ['expires' => true],
]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### 중간 테이블의 레코드 업데이트(Updating a Record on the Intermediate Table)

관계의 중간 테이블에 있는 기존 행을 업데이트해야 하는 경우 `updateExistingPivot` 메서드를 사용할 수 있습니다. 이 메서드는 중간 레코드의 외래 키와 업데이트할 속성 배열을 받습니다.

```php
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

<a name="touching-parent-timestamps"></a>
## 부모 타임스탬프 갱신(Touching Parent Timestamps)

모델이 다른 모델에 대해 `belongsTo` 또는 `belongsToMany` 관계를 정의할 때, 예를 들어 `Post`에 속하는 `Comment`의 경우, 자식 모델이 업데이트될 때 부모의 타임스탬프를 갱신하는 것이 유용할 때가 있습니다.

예를 들어, `Comment` 모델이 업데이트될 때 소유하는 `Post`의 `updated_at` 타임스탬프가 현재 날짜와 시간으로 설정되도록 자동으로 "터치"하고 싶을 수 있습니다. 이를 위해 자식 모델에 `touches` 속성을 추가하여 자식 모델이 업데이트될 때 `updated_at` 타임스탬프가 갱신되어야 하는 관계 이름을 포함할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * 터치되어야 하는 모든 관계.
     *
     * @var array
     */
    protected $touches = ['post'];

    /**
     * 댓글이 속한 게시물을 가져옵니다.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

> [!WARNING]
> 부모 모델의 타임스탬프는 Eloquent의 `save` 메서드를 사용하여 자식 모델이 업데이트된 경우에만 갱신됩니다.

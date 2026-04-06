# 컨텍스트(Context)

- [소개](#introduction)
    - [작동 방식](#how-it-works)
- [컨텍스트 캡처](#capturing-context)
    - [스택](#stacks)
- [컨텍스트 조회](#retrieving-context)
    - [항목 존재 여부 확인](#determining-item-existence)
- [컨텍스트 제거](#removing-context)
- [숨겨진 컨텍스트](#hidden-context)
- [이벤트](#events)
    - [Dehydrating](#dehydrating)
    - [Hydrated](#hydrated)

<a name="introduction"></a>
## 소개

Laravel의 "컨텍스트(Context)" 기능을 사용하면 애플리케이션 내에서 실행되는 요청, 작업(Job), 명령어 전반에 걸쳐 정보를 캡처, 조회 및 공유할 수 있습니다. 캡처된 정보는 애플리케이션이 작성하는 로그에도 포함되어, 로그 항목이 기록되기 전에 발생한 주변 코드 실행 히스토리에 대한 더 깊은 인사이트를 제공하고 분산 시스템 전체에서 실행 흐름을 추적할 수 있게 해줍니다.

<a name="how-it-works"></a>
### 작동 방식

Laravel의 컨텍스트 기능을 이해하는 가장 좋은 방법은 내장된 로깅 기능을 사용하여 실제로 동작하는 것을 보는 것입니다. 시작하려면 `Context` 파사드를 사용하여 [컨텍스트에 정보를 추가](#capturing-context)할 수 있습니다. 이 예제에서는 [미들웨어](/docs/{{version}}/middleware)를 사용하여 들어오는 모든 요청에 대해 요청 URL과 고유한 추적 ID를 컨텍스트에 추가합니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AddContext
{
    /**
     * 들어오는 요청을 처리합니다.
     */
    public function handle(Request $request, Closure $next): Response
    {
        Context::add('url', $request->url());
        Context::add('trace_id', Str::uuid()->toString());

        return $next($request);
    }
}
```

컨텍스트에 추가된 정보는 요청 전체에서 작성되는 모든 [로그 항목](/docs/{{version}}/logging)에 메타데이터로 자동 첨부됩니다. 컨텍스트를 메타데이터로 첨부하면 개별 로그 항목에 전달된 정보와 `Context`를 통해 공유된 정보를 구분할 수 있습니다. 예를 들어, 다음과 같은 로그 항목을 작성한다고 가정해 보겠습니다.

```php
Log::info('User authenticated.', ['auth_id' => Auth::id()]);
```

작성된 로그에는 로그 항목에 전달된 `auth_id`가 포함되지만, 컨텍스트의 `url`과 `trace_id`도 메타데이터로 포함됩니다.

```text
User authenticated. {"auth_id":27} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```

컨텍스트에 추가된 정보는 큐에 디스패치된 작업에서도 사용할 수 있습니다. 예를 들어, 컨텍스트에 일부 정보를 추가한 후 `ProcessPodcast` 작업을 큐에 디스패치한다고 가정해 보겠습니다.

```php
// 미들웨어에서...
Context::add('url', $request->url());
Context::add('trace_id', Str::uuid()->toString());

// 컨트롤러에서...
ProcessPodcast::dispatch($podcast);
```

작업이 디스패치되면 현재 컨텍스트에 저장된 모든 정보가 캡처되어 작업과 공유됩니다. 캡처된 정보는 작업이 실행되는 동안 현재 컨텍스트로 다시 하이드레이션됩니다. 따라서 작업의 handle 메소드가 로그를 작성한다면:

```php
class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    // ...

    /**
     * 작업을 실행합니다.
     */
    public function handle(): void
    {
        Log::info('Processing podcast.', [
            'podcast_id' => $this->podcast->id,
        ]);

        // ...
    }
}
```

결과 로그 항목에는 원래 작업을 디스패치한 요청 중에 컨텍스트에 추가된 정보가 포함됩니다.

```text
Processing podcast. {"podcast_id":95} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```

Laravel 컨텍스트의 내장 로깅 관련 기능에 초점을 맞추었지만, 다음 문서에서는 컨텍스트를 통해 HTTP 요청/큐 작업 경계를 넘어 정보를 공유하는 방법과 로그 항목에 기록되지 않는 [숨겨진 컨텍스트 데이터](#hidden-context)를 추가하는 방법을 설명합니다.

<a name="capturing-context"></a>
## 컨텍스트 캡처

`Context` 파사드의 `add` 메소드를 사용하여 현재 컨텍스트에 정보를 저장할 수 있습니다.

```php
use Illuminate\Support\Facades\Context;

Context::add('key', 'value');
```

한 번에 여러 항목을 추가하려면 연관 배열을 `add` 메소드에 전달할 수 있습니다.

```php
Context::add([
    'first_key' => 'value',
    'second_key' => 'value',
]);
```

`add` 메소드는 동일한 키를 가진 기존 값을 덮어씁니다. 키가 아직 존재하지 않는 경우에만 컨텍스트에 정보를 추가하려면 `addIf` 메소드를 사용할 수 있습니다.

```php
Context::add('key', 'first');

Context::get('key');
// "first"

Context::addIf('key', 'second');

Context::get('key');
// "first"
```

Context는 주어진 키를 증가시키거나 감소시키는 편리한 메소드도 제공합니다. 이 두 메소드는 최소한 하나의 인수(추적할 키)를 받습니다. 두 번째 인수를 제공하여 키를 증가 또는 감소시킬 양을 지정할 수 있습니다.

```php
Context::increment('records_added');
Context::increment('records_added', 5);

Context::decrement('records_added');
Context::decrement('records_added', 5);
```

<a name="conditional-context"></a>
#### 조건부 컨텍스트

`when` 메소드를 사용하여 주어진 조건에 따라 컨텍스트에 데이터를 추가할 수 있습니다. `when` 메소드에 제공된 첫 번째 클로저는 주어진 조건이 `true`로 평가되면 호출되고, 두 번째 클로저는 조건이 `false`로 평가되면 호출됩니다.

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Context;

Context::when(
    Auth::user()->isAdmin(),
    fn ($context) => $context->add('permissions', Auth::user()->permissions),
    fn ($context) => $context->add('permissions', []),
);
```

<a name="scoped-context"></a>
#### 범위가 지정된 컨텍스트

`scope` 메소드는 주어진 콜백이 실행되는 동안 컨텍스트를 일시적으로 수정하고 콜백 실행이 완료되면 컨텍스트를 원래 상태로 복원하는 방법을 제공합니다. 또한, 클로저가 실행되는 동안 컨텍스트에 병합되어야 할 추가 데이터를 두 번째 및 세 번째 인수로 전달할 수 있습니다.

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\Log;

Context::add('trace_id', 'abc-999');
Context::addHidden('user_id', 123);

Context::scope(
    function () {
        Context::add('action', 'adding_friend');

        $userId = Context::getHidden('user_id');

        Log::debug("Adding user [{$userId}] to friends list.");
        // Adding user [987] to friends list.  {"trace_id":"abc-999","user_name":"taylor_otwell","action":"adding_friend"}
    },
    data: ['user_name' => 'taylor_otwell'],
    hidden: ['user_id' => 987],
);

Context::all();
// [
//     'trace_id' => 'abc-999',
// ]

Context::allHidden();
// [
//     'user_id' => 123,
// ]
```

> [!WARNING]
> 범위 지정된 클로저 내에서 컨텍스트 내의 객체가 수정되면 해당 변경은 범위 외부에도 반영됩니다.

<a name="stacks"></a>
### 스택

Context는 추가된 순서대로 저장되는 데이터 목록인 "스택(Stack)"을 생성하는 기능을 제공합니다. `push` 메소드를 호출하여 스택에 정보를 추가할 수 있습니다.

```php
use Illuminate\Support\Facades\Context;

Context::push('breadcrumbs', 'first_value');

Context::push('breadcrumbs', 'second_value', 'third_value');

Context::get('breadcrumbs');
// [
//     'first_value',
//     'second_value',
//     'third_value',
// ]
```

스택은 애플리케이션 전체에서 발생하는 이벤트와 같은 요청에 대한 히스토리 정보를 캡처하는 데 유용할 수 있습니다. 예를 들어, 쿼리가 실행될 때마다 스택에 푸시하는 이벤트 리스너를 만들어 쿼리 SQL과 실행 시간을 튜플로 캡처할 수 있습니다.

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\DB;

// AppServiceProvider.php에서...
DB::listen(function ($event) {
    Context::push('queries', [$event->time, $event->sql]);
});
```

`stackContains` 및 `hiddenStackContains` 메소드를 사용하여 값이 스택에 있는지 확인할 수 있습니다.

```php
if (Context::stackContains('breadcrumbs', 'first_value')) {
    //
}

if (Context::hiddenStackContains('secrets', 'first_value')) {
    //
}
```

`stackContains` 및 `hiddenStackContains` 메소드는 두 번째 인수로 클로저를 받아 값 비교 작업을 더 세밀하게 제어할 수도 있습니다.

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;

return Context::stackContains('breadcrumbs', function ($value) {
    return Str::startsWith($value, 'query_');
});
```

<a name="retrieving-context"></a>
## 컨텍스트 조회

`Context` 파사드의 `get` 메소드를 사용하여 컨텍스트에서 정보를 조회할 수 있습니다.

```php
use Illuminate\Support\Facades\Context;

$value = Context::get('key');
```

`only` 및 `except` 메소드를 사용하여 컨텍스트 정보의 일부만 조회할 수 있습니다.

```php
$data = Context::only(['first_key', 'second_key']);

$data = Context::except(['first_key']);
```

`pull` 메소드를 사용하여 컨텍스트에서 정보를 조회하고 즉시 컨텍스트에서 제거할 수 있습니다.

```php
$value = Context::pull('key');
```

컨텍스트 데이터가 [스택](#stacks)에 저장된 경우 `pop` 메소드를 사용하여 스택에서 항목을 꺼낼 수 있습니다.

```php
Context::push('breadcrumbs', 'first_value', 'second_value');

Context::pop('breadcrumbs');
// second_value

Context::get('breadcrumbs');
// ['first_value']
```

`remember` 및 `rememberHidden` 메소드를 사용하면 컨텍스트에서 정보를 조회하되, 요청한 정보가 존재하지 않을 경우 주어진 클로저가 반환하는 값을 컨텍스트 값으로 설정할 수 있습니다:

```php
$permissions = Context::remember(
    'user-permissions',
    fn () => $user->permissions,
);
```

컨텍스트에 저장된 모든 정보를 조회하려면 `all` 메소드를 호출할 수 있습니다.

```php
$data = Context::all();
```

<a name="determining-item-existence"></a>
### 항목 존재 여부 확인

`has` 및 `missing` 메소드를 사용하여 컨텍스트에 주어진 키에 대한 값이 저장되어 있는지 확인할 수 있습니다.

```php
use Illuminate\Support\Facades\Context;

if (Context::has('key')) {
    // ...
}

if (Context::missing('key')) {
    // ...
}
```

`has` 메소드는 저장된 값에 관계없이 `true`를 반환합니다. 따라서 예를 들어 `null` 값을 가진 키도 존재하는 것으로 간주됩니다.

```php
Context::add('key', null);

Context::has('key');
// true
```

<a name="removing-context"></a>
## 컨텍스트 제거

`forget` 메소드를 사용하여 현재 컨텍스트에서 키와 해당 값을 제거할 수 있습니다.

```php
use Illuminate\Support\Facades\Context;

Context::add(['first_key' => 1, 'second_key' => 2]);

Context::forget('first_key');

Context::all();

// ['second_key' => 2]
```

`forget` 메소드에 배열을 제공하여 한 번에 여러 키를 삭제할 수 있습니다.

```php
Context::forget(['first_key', 'second_key']);
```

<a name="hidden-context"></a>
## 숨겨진 컨텍스트

Context는 "숨겨진" 데이터를 저장하는 기능을 제공합니다. 이 숨겨진 정보는 로그에 추가되지 않으며, 위에서 설명한 데이터 조회 메소드를 통해 접근할 수 없습니다. Context는 숨겨진 컨텍스트 정보와 상호작용하기 위한 별도의 메소드 세트를 제공합니다.

```php
use Illuminate\Support\Facades\Context;

Context::addHidden('key', 'value');

Context::getHidden('key');
// 'value'

Context::get('key');
// null
```

"숨겨진" 메소드는 위에서 설명한 숨겨지지 않은 메소드의 기능을 미러링합니다.

```php
Context::addHidden(/* ... */);
Context::addHiddenIf(/* ... */);
Context::pushHidden(/* ... */);
Context::getHidden(/* ... */);
Context::pullHidden(/* ... */);
Context::popHidden(/* ... */);
Context::onlyHidden(/* ... */);
Context::exceptHidden(/* ... */);
Context::allHidden(/* ... */);
Context::hasHidden(/* ... */);
Context::missingHidden(/* ... */);
Context::forgetHidden(/* ... */);
```

<a name="events"></a>
## 이벤트

Context는 컨텍스트의 하이드레이션 및 디하이드레이션 프로세스에 연결할 수 있는 두 가지 이벤트를 디스패치합니다.

이러한 이벤트가 어떻게 사용될 수 있는지 설명하기 위해, 애플리케이션의 미들웨어에서 들어오는 HTTP 요청의 `Accept-Language` 헤더를 기반으로 `app.locale` 설정 값을 설정한다고 가정해 보겠습니다. Context의 이벤트를 사용하면 요청 중에 이 값을 캡처하고 큐에서 복원하여 큐에서 전송되는 알림이 올바른 `app.locale` 값을 갖도록 할 수 있습니다. 이를 달성하기 위해 context의 이벤트와 [숨겨진](#hidden-context) 데이터를 사용할 수 있으며, 다음 문서에서 이를 설명합니다.

<a name="dehydrating"></a>
### Dehydrating

작업이 큐에 디스패치될 때마다 컨텍스트의 데이터는 "디하이드레이션(dehydrated)"되어 작업의 페이로드와 함께 캡처됩니다. `Context::dehydrating` 메소드를 사용하면 디하이드레이션 프로세스 중에 호출될 클로저를 등록할 수 있습니다. 이 클로저 내에서 큐에 넣은 작업과 공유될 데이터를 변경할 수 있습니다.

일반적으로 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메소드 내에서 `dehydrating` 콜백을 등록해야 합니다.

```php
use Illuminate\Log\Context\Repository;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Context;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Context::dehydrating(function (Repository $context) {
        $context->addHidden('locale', Config::get('app.locale'));
    });
}
```

> [!NOTE]
> `dehydrating` 콜백 내에서 `Context` 파사드를 사용하면 현재 프로세스의 컨텍스트가 변경되므로 사용하면 안 됩니다. 콜백에 전달된 저장소에만 변경을 가해야 합니다.

<a name="hydrated"></a>
### Hydrated

큐에 넣은 작업이 큐에서 실행을 시작할 때마다 작업과 공유된 모든 컨텍스트가 현재 컨텍스트로 다시 "하이드레이션(hydrated)"됩니다. `Context::hydrated` 메소드를 사용하면 하이드레이션 프로세스 중에 호출될 클로저를 등록할 수 있습니다.

일반적으로 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메소드 내에서 `hydrated` 콜백을 등록해야 합니다.

```php
use Illuminate\Log\Context\Repository;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Context;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Context::hydrated(function (Repository $context) {
        if ($context->hasHidden('locale')) {
            Config::set('app.locale', $context->getHidden('locale'));
        }
    });
}
```

> [!NOTE]
> `hydrated` 콜백 내에서 `Context` 파사드를 사용하지 말고 콜백에 전달된 저장소에만 변경을 가해야 합니다.

# 속도 제한(Rate Limiting)

- [소개](#introduction)
    - [캐시 설정](#cache-configuration)
- [기본 사용법](#basic-usage)
    - [수동으로 시도 횟수 증가시키기](#manually-incrementing-attempts)
    - [시도 횟수 초기화](#clearing-attempts)

<a name="introduction"></a>
## 소개

Laravel은 애플리케이션의 [캐시](cache)와 함께 사용하여 특정 시간 동안 어떤 액션이든 쉽게 제한할 수 있는 간단한 속도 제한(Rate Limiting) 추상화를 포함하고 있습니다.

> [!NOTE]
> 들어오는 HTTP 요청에 대한 속도 제한에 관심이 있다면, [속도 제한 미들웨어 문서](/docs/{{version}}/routing#rate-limiting)를 참고하세요.

<a name="cache-configuration"></a>
### 캐시 설정

일반적으로 속도 제한기(Rate Limiter)는 애플리케이션의 `cache` 설정 파일에서 `default` 키로 정의된 기본 애플리케이션 캐시를 사용합니다. 그러나 애플리케이션의 `cache` 설정 파일에서 `limiter` 키를 정의하여 속도 제한기가 사용할 캐시 드라이버를 지정할 수 있습니다.

```php
'default' => env('CACHE_STORE', 'database'),

'limiter' => 'redis',
```

<a name="basic-usage"></a>
## 기본 사용법

`Illuminate\Support\Facades\RateLimiter` 파사드(Facade)를 사용하여 속도 제한기와 상호작용할 수 있습니다. 속도 제한기가 제공하는 가장 간단한 메서드는 `attempt` 메서드로, 주어진 콜백을 지정된 초 동안 속도 제한합니다.

`attempt` 메서드는 콜백에 남은 시도 횟수가 없을 때 `false`를 반환합니다. 그렇지 않으면 `attempt` 메서드는 콜백의 결과 또는 `true`를 반환합니다. `attempt` 메서드가 받는 첫 번째 인수는 속도 제한 "키"로, 속도 제한되는 액션을 나타내는 원하는 문자열을 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\RateLimiter;

$executed = RateLimiter::attempt(
    'send-message:'.$user->id,
    $perMinute = 5,
    function() {
        // 메시지 전송...
    }
);

if (! $executed) {
  return 'Too many messages sent!';
}
```

필요한 경우 `attempt` 메서드에 네 번째 인수를 제공할 수 있는데, 이는 "감소율(decay rate)" 또는 사용 가능한 시도 횟수가 재설정되기까지의 초 단위 시간입니다. 예를 들어, 위 예제를 2분마다 5번의 시도를 허용하도록 수정할 수 있습니다.

```php
$executed = RateLimiter::attempt(
    'send-message:'.$user->id,
    $perTwoMinutes = 5,
    function() {
        // 메시지 전송...
    },
    $decayRate = 120,
);
```

<a name="manually-incrementing-attempts"></a>
### 수동으로 시도 횟수 증가시키기

속도 제한기와 수동으로 상호작용하려면 다양한 다른 메서드를 사용할 수 있습니다. 예를 들어, `tooManyAttempts` 메서드를 호출하여 주어진 속도 제한 키가 분당 허용된 최대 시도 횟수를 초과했는지 확인할 수 있습니다.

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    return 'Too many attempts!';
}

RateLimiter::increment('send-message:'.$user->id);

// 메시지 전송...
```

또는 `remaining` 메서드를 사용하여 주어진 키에 대해 남은 시도 횟수를 조회할 수 있습니다. 주어진 키에 남은 재시도 횟수가 있으면 `increment` 메서드를 호출하여 총 시도 횟수를 증가시킬 수 있습니다.

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::remaining('send-message:'.$user->id, $perMinute = 5)) {
    RateLimiter::increment('send-message:'.$user->id);

    // 메시지 전송...
}
```

주어진 속도 제한 키의 값을 1보다 더 많이 증가시키려면 `increment` 메서드에 원하는 양을 제공할 수 있습니다.

```php
RateLimiter::increment('send-message:'.$user->id, amount: 5);
```

<a name="determining-limiter-availability"></a>
#### 제한기 가용성 확인

키에 남은 시도 횟수가 없으면 `availableIn` 메서드는 더 많은 시도가 가능해질 때까지 남은 초를 반환합니다.

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    $seconds = RateLimiter::availableIn('send-message:'.$user->id);

    return 'You may try again in '.$seconds.' seconds.';
}

RateLimiter::increment('send-message:'.$user->id);

// 메시지 전송...
```

<a name="clearing-attempts"></a>
### 시도 횟수 초기화

`clear` 메서드를 사용하여 주어진 속도 제한 키의 시도 횟수를 재설정할 수 있습니다. 예를 들어, 수신자가 주어진 메시지를 읽었을 때 시도 횟수를 재설정할 수 있습니다.

```php
use App\Models\Message;
use Illuminate\Support\Facades\RateLimiter;

/**
 * 메시지를 읽음으로 표시합니다.
 */
public function read(Message $message): Message
{
    $message->markAsRead();

    RateLimiter::clear('send-message:'.$message->user_id);

    return $message;
}
```

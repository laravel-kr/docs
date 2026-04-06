# 아티즌 콘솔(Artisan Console)

- [소개](#introduction)
    - [Tinker (REPL)](#tinker)
- [명령어 작성하기](#writing-commands)
    - [명령어 생성하기](#generating-commands)
    - [명령어 구조](#command-structure)
    - [클로저 명령어](#closure-commands)
    - [격리 가능한 명령어](#isolatable-commands)
- [입력 기대값 정의하기](#defining-input-expectations)
    - [인수](#arguments)
    - [옵션](#options)
    - [입력 배열](#input-arrays)
    - [입력 설명](#input-descriptions)
    - [누락된 입력에 대한 프롬프트](#prompting-for-missing-input)
- [명령어 입출력](#command-io)
    - [입력 가져오기](#retrieving-input)
    - [입력 요청하기](#prompting-for-input)
    - [출력 작성하기](#writing-output)
- [명령어 등록하기](#registering-commands)
- [프로그래밍 방식으로 명령어 실행하기](#programmatically-executing-commands)
    - [다른 명령어에서 명령어 호출하기](#calling-commands-from-other-commands)
- [시그널 처리](#signal-handling)
- [스텁 커스터마이징](#stub-customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

아티즌(Artisan)은 Laravel에 포함된 커맨드 라인 인터페이스입니다. 아티즌은 애플리케이션의 루트에 `artisan` 스크립트로 존재하며, 애플리케이션을 개발하는 동안 도움이 될 수 있는 다양한 명령어를 제공합니다. 사용 가능한 모든 아티즌 명령어 목록을 보려면 `list` 명령어를 사용할 수 있습니다:

```shell
php artisan list
```

모든 명령어에는 명령어의 사용 가능한 인수와 옵션을 표시하고 설명하는 "help" 화면도 포함되어 있습니다. 도움말 화면을 보려면 명령어 이름 앞에 `help`를 붙이세요:

```shell
php artisan help migrate
```

<a name="laravel-sail"></a>
#### Laravel Sail

로컬 개발 환경으로 [Laravel Sail](/docs/{{version}}/sail)을 사용하는 경우, 아티즌 명령어를 호출할 때 `sail` 커맨드 라인을 사용해야 합니다. Sail은 애플리케이션의 Docker 컨테이너 내에서 아티즌 명령어를 실행합니다:

```shell
./vendor/bin/sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

[Laravel Tinker](https://github.com/laravel/tinker)는 [PsySH](https://github.com/bobthecow/psysh) 패키지로 구동되는 Laravel 프레임워크를 위한 강력한 REPL입니다.

<a name="installation"></a>
#### 설치

모든 Laravel 애플리케이션에는 기본적으로 Tinker가 포함되어 있습니다. 그러나 이전에 애플리케이션에서 Tinker를 제거한 경우 Composer를 사용하여 설치할 수 있습니다:

```shell
composer require laravel/tinker
```

> [!NOTE]
> Laravel 애플리케이션과 상호작용할 때 핫 리로딩, 여러 줄 코드 편집, 자동 완성을 찾고 계신가요? [Tinkerwell](https://tinkerwell.app)을 확인해 보세요!

<a name="usage"></a>
#### 사용법

Tinker를 사용하면 Eloquent 모델, 잡, 이벤트 등을 포함한 전체 Laravel 애플리케이션과 커맨드 라인에서 상호작용할 수 있습니다. Tinker 환경에 들어가려면 `tinker` 아티즌 명령어를 실행하세요:

```shell
php artisan tinker
```

`vendor:publish` 명령어를 사용하여 Tinker의 설정 파일을 퍼블리시할 수 있습니다:

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> [!WARNING]
> `dispatch` 헬퍼 함수와 `Dispatchable` 클래스의 `dispatch` 메서드는 잡을 큐에 넣기 위해 가비지 컬렉션(garbage collection)에 의존합니다. 따라서 Tinker를 사용할 때는 잡을 디스패치하기 위해 `Bus::dispatch` 또는 `Queue::push`를 사용해야 합니다.

<a name="command-allow-list"></a>
#### 명령어 허용 목록

Tinker는 셸 내에서 실행할 수 있는 아티즌 명령어를 결정하기 위해 "허용" 목록을 사용합니다. 기본적으로 `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `migrate:install`, `up`, `optimize` 명령어를 실행할 수 있습니다. 더 많은 명령어를 허용하려면 `tinker.php` 설정 파일의 `commands` 배열에 추가하면 됩니다:

```php
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

<a name="classes-that-should-not-be-aliased"></a>
#### 앨리어스하지 않아야 하는 클래스

일반적으로 Tinker는 Tinker에서 상호작용할 때 클래스를 자동으로 앨리어스합니다. 그러나 일부 클래스는 절대 앨리어스하지 않기를 원할 수 있습니다. `tinker.php` 설정 파일의 `dont_alias` 배열에 클래스를 나열하여 이를 수행할 수 있습니다:

```php
'dont_alias' => [
    App\Models\User::class,
],
```

<a name="writing-commands"></a>
## 명령어 작성하기

아티즌과 함께 제공되는 명령어 외에도 사용자 정의 명령어를 직접 만들 수 있습니다. 명령어는 일반적으로 `app/Console/Commands` 디렉토리에 저장됩니다. 그러나 Laravel이 [다른 디렉토리에서 아티즌 명령어를 스캔](#registering-commands)하도록 지정하면 자신만의 저장 위치를 자유롭게 선택할 수 있습니다.

<a name="generating-commands"></a>
### 명령어 생성하기

새 명령어를 생성하려면 `make:command` 아티즌 명령어를 사용할 수 있습니다. 이 명령어는 `app/Console/Commands` 디렉토리에 새 명령어 클래스를 생성합니다. 이 디렉토리가 애플리케이션에 없어도 걱정하지 마세요 - `make:command` 아티즌 명령어를 처음 실행할 때 생성됩니다:

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### 명령어 구조

명령어를 생성한 후 `Signature` 및 `Description` 속성을 사용하여 명령어의 시그니처와 설명을 정의해야 합니다. `Signature` 속성을 사용하면 [명령어의 입력 기대값](#defining-input-expectations)을 정의할 수도 있습니다. `handle` 메서드는 명령어가 실행될 때 호출됩니다. 이 메서드에 명령어 로직을 배치할 수 있습니다.

예제 명령어를 살펴보겠습니다. 명령어의 `handle` 메서드를 통해 필요한 모든 의존성을 요청할 수 있습니다. Laravel [서비스 컨테이너(Service Container)](/docs/{{version}}/container)는 이 메서드의 시그니처에 타입 힌트된 모든 의존성을 자동으로 주입합니다:

```php
<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\DripEmailer;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('mail:send {user}')]
#[Description('Send a marketing email to a user')]
class SendEmails extends Command
{
    /**
     * 콘솔 명령어 실행.
     */
    public function handle(DripEmailer $drip): void
    {
        $drip->send(User::find($this->argument('user')));
    }
}
```

> [!NOTE]
> 더 나은 코드 재사용을 위해 콘솔 명령어를 가볍게 유지하고 애플리케이션 서비스에 작업을 위임하는 것이 좋습니다. 위의 예제에서 이메일 전송의 "무거운 작업"을 수행하기 위해 서비스 클래스를 주입하는 것을 확인하세요.

<a name="exit-codes"></a>
#### 종료 코드

`handle` 메서드에서 아무것도 반환하지 않고 명령어가 성공적으로 실행되면 명령어는 성공을 나타내는 `0` 종료 코드로 종료됩니다. 그러나 `handle` 메서드는 명령어의 종료 코드를 수동으로 지정하기 위해 선택적으로 정수를 반환할 수 있습니다:

```php
$this->error('Something went wrong.');

return 1;
```

명령어 내의 어떤 메서드에서든 명령어를 "실패"시키려면 `fail` 메서드를 사용할 수 있습니다. `fail` 메서드는 즉시 명령어 실행을 종료하고 `1` 종료 코드를 반환합니다:

```php
$this->fail('Something went wrong.');
```

<a name="closure-commands"></a>
### 클로저 명령어

클로저 기반 명령어는 콘솔 명령어를 클래스로 정의하는 것의 대안을 제공합니다. 라우트 클로저가 컨트롤러의 대안인 것처럼, 명령어 클로저를 명령어 클래스의 대안으로 생각하세요.

`routes/console.php` 파일은 HTTP 라우트를 정의하지 않지만 애플리케이션에 대한 콘솔 기반 진입점(라우트)을 정의합니다. 이 파일 내에서 `Artisan::command` 메서드를 사용하여 모든 클로저 기반 콘솔 명령어를 정의할 수 있습니다. `command` 메서드는 두 개의 인수를 받습니다: [명령어 시그니처](#defining-input-expectations)와 명령어의 인수 및 옵션을 받는 클로저:

```php
Artisan::command('mail:send {user}', function (string $user) {
    $this->info("Sending email to: {$user}!");
});
```

클로저는 기본 명령어 인스턴스에 바인딩되므로 전체 명령어 클래스에서 일반적으로 액세스할 수 있는 모든 헬퍼 메서드에 완전히 액세스할 수 있습니다.

<a name="type-hinting-dependencies"></a>
#### 의존성 타입 힌팅

명령어의 인수와 옵션을 받는 것 외에도 명령어 클로저는 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에서 의존성 해결을 타입 힌트할 수 있습니다:

```php
use App\Models\User;
use App\Support\DripEmailer;
use Illuminate\Support\Facades\Artisan;

Artisan::command('mail:send {user}', function (DripEmailer $drip, string $user) {
    $drip->send(User::find($user));
});
```

<a name="closure-command-descriptions"></a>
#### 클로저 명령어 설명

클로저 기반 명령어를 정의할 때 `purpose` 메서드를 사용하여 명령어에 설명을 추가할 수 있습니다. 이 설명은 `php artisan list` 또는 `php artisan help` 명령어를 실행할 때 표시됩니다:

```php
Artisan::command('mail:send {user}', function (string $user) {
    // ...
})->purpose('Send a marketing email to a user');
```

<a name="isolatable-commands"></a>
### 격리 가능한 명령어

> [!WARNING]
> 이 기능을 사용하려면 애플리케이션이 `memcached`, `redis`, `dynamodb`, `database`, `file` 또는 `array` 캐시 드라이버를 애플리케이션의 기본 캐시 드라이버로 사용해야 합니다. 또한 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

때때로 명령어의 인스턴스가 한 번에 하나만 실행되도록 보장하고 싶을 수 있습니다. 이를 위해 명령어 클래스에 `Illuminate\Contracts\Console\Isolatable` 인터페이스를 구현할 수 있습니다:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\Isolatable;

class SendEmails extends Command implements Isolatable
{
    // ...
}
```

명령어를 `Isolatable`로 표시하면 Laravel은 명령어의 옵션에 명시적으로 정의하지 않아도 자동으로 `--isolated` 옵션을 사용할 수 있게 합니다. 해당 옵션으로 명령어가 호출되면 Laravel은 해당 명령어의 다른 인스턴스가 이미 실행 중이지 않은지 확인합니다. Laravel은 애플리케이션의 기본 캐시 드라이버를 사용하여 원자적 잠금을 획득하려고 시도하여 이를 달성합니다. 명령어의 다른 인스턴스가 실행 중인 경우 명령어가 실행되지 않습니다. 그러나 명령어는 여전히 성공적인 종료 상태 코드로 종료됩니다:

```shell
php artisan mail:send 1 --isolated
```

명령어가 실행할 수 없는 경우 반환해야 하는 종료 상태 코드를 지정하려면 `isolated` 옵션을 통해 원하는 상태 코드를 제공할 수 있습니다:

```shell
php artisan mail:send 1 --isolated=12
```

<a name="lock-id"></a>
#### 잠금 ID

기본적으로 Laravel은 명령어 이름을 사용하여 애플리케이션 캐시에서 원자적 잠금을 획득하는 데 사용되는 문자열 키를 생성합니다. 그러나 아티즌 명령어 클래스에 `isolatableId` 메서드를 정의하여 이 키를 커스터마이징할 수 있으며, 이를 통해 명령어의 인수나 옵션을 키에 통합할 수 있습니다:

```php
/**
 * 명령어의 격리 가능한 ID 가져오기.
 */
public function isolatableId(): string
{
    return $this->argument('user');
}
```

<a name="lock-expiration-time"></a>
#### 잠금 만료 시간

기본적으로 격리 잠금은 명령어가 완료된 후 만료됩니다. 또는 명령어가 중단되어 완료할 수 없는 경우 잠금은 1시간 후에 만료됩니다. 그러나 명령어에 `isolationLockExpiresAt` 메서드를 정의하여 잠금 만료 시간을 조정할 수 있습니다:

```php
use DateTimeInterface;
use DateInterval;

/**
 * 명령어의 격리 잠금이 만료되는 시간 결정.
 */
public function isolationLockExpiresAt(): DateTimeInterface|DateInterval
{
    return now()->plus(minutes: 5);
}
```

<a name="defining-input-expectations"></a>
## 입력 기대값 정의하기

콘솔 명령어를 작성할 때 인수나 옵션을 통해 사용자로부터 입력을 수집하는 것이 일반적입니다. Laravel은 명령어의 `signature` 속성을 사용하여 사용자로부터 기대하는 입력을 정의하는 것을 매우 편리하게 만듭니다. `signature` 속성을 사용하면 단일하고 표현력 있는 라우트와 유사한 구문으로 명령어의 이름, 인수 및 옵션을 정의할 수 있습니다.

<a name="arguments"></a>
### 인수

사용자가 제공하는 모든 인수와 옵션은 중괄호로 감싸집니다. 다음 예제에서 명령어는 하나의 필수 인수 `user`를 정의합니다:

```php
/**
 * 콘솔 명령어의 이름과 시그니처.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
```

인수를 선택적으로 만들거나 인수의 기본값을 정의할 수도 있습니다:

```php
// 선택적 인수...
'mail:send {user?}'

// 기본값이 있는 선택적 인수...
'mail:send {user=foo}'
```

<a name="options"></a>
### 옵션

옵션은 인수와 마찬가지로 사용자 입력의 또 다른 형태입니다. 옵션은 커맨드 라인에서 제공될 때 두 개의 하이픈(`--`)으로 접두사가 붙습니다. 옵션에는 두 가지 유형이 있습니다: 값을 받는 옵션과 받지 않는 옵션. 값을 받지 않는 옵션은 불리언 "스위치" 역할을 합니다. 이러한 유형의 옵션 예제를 살펴보겠습니다:

```php
/**
 * 콘솔 명령어의 이름과 시그니처.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

이 예제에서 아티즌 명령어를 호출할 때 `--queue` 스위치를 지정할 수 있습니다. `--queue` 스위치가 전달되면 옵션 값은 `true`가 됩니다. 그렇지 않으면 값은 `false`가 됩니다:

```shell
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### 값이 있는 옵션

다음으로 값이 필요한 옵션을 살펴보겠습니다. 사용자가 옵션에 값을 지정해야 하는 경우 옵션 이름에 `=` 기호를 접미사로 붙여야 합니다:

```php
/**
 * 콘솔 명령어의 이름과 시그니처.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

이 예제에서 사용자는 다음과 같이 옵션에 값을 전달할 수 있습니다. 명령어를 호출할 때 옵션이 지정되지 않으면 값은 `null`이 됩니다:

```shell
php artisan mail:send 1 --queue=default
```

옵션 이름 뒤에 기본값을 지정하여 옵션에 기본값을 할당할 수 있습니다. 사용자가 옵션 값을 전달하지 않으면 기본값이 사용됩니다:

```php
'mail:send {user} {--queue=default}'
```

<a name="option-shortcuts"></a>
#### 옵션 단축키

옵션을 정의할 때 단축키를 지정하려면 옵션 이름 앞에 단축키를 지정하고 `|` 문자를 구분자로 사용하여 단축키와 전체 옵션 이름을 구분하세요:

```php
'mail:send {user} {--Q|queue=}'
```

터미널에서 명령어를 호출할 때 옵션 단축키는 단일 하이픈으로 접두사가 붙어야 하며 옵션 값을 지정할 때 `=` 문자를 포함하지 않아야 합니다:

```shell
php artisan mail:send 1 -Qdefault
```

<a name="input-arrays"></a>
### 입력 배열

여러 입력 값을 기대하는 인수나 옵션을 정의하려면 `*` 문자를 사용할 수 있습니다. 먼저 이러한 인수를 지정하는 예제를 살펴보겠습니다:

```php
'mail:send {user*}'
```

이 명령어를 실행할 때 `user` 인수가 커맨드 라인에 순서대로 전달될 수 있습니다. 예를 들어 다음 명령어는 `user` 값을 `1`과 `2`를 값으로 가진 배열로 설정합니다:

```shell
php artisan mail:send 1 2
```

이 `*` 문자는 인수의 인스턴스를 0개 이상 허용하기 위해 선택적 인수 정의와 결합할 수 있습니다:

```php
'mail:send {user?*}'
```

<a name="option-arrays"></a>
#### 옵션 배열

여러 입력 값을 기대하는 옵션을 정의할 때 명령어에 전달되는 각 옵션 값은 옵션 이름으로 접두사가 붙어야 합니다:

```php
'mail:send {--id=*}'
```

이러한 명령어는 여러 `--id` 인수를 전달하여 호출할 수 있습니다:

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### 입력 설명

콜론을 사용하여 인수 이름과 설명을 구분하여 입력 인수 및 옵션에 설명을 지정할 수 있습니다. 명령어를 정의하는 데 약간의 추가 공간이 필요한 경우 정의를 여러 줄에 걸쳐 자유롭게 펼칠 수 있습니다:

```php
/**
 * 콘솔 명령어의 이름과 시그니처.
 *
 * @var string
 */
protected $signature = 'mail:send
                        {user : The ID of the user}
                        {--queue : Whether the job should be queued}';
```

<a name="prompting-for-missing-input"></a>
### 누락된 입력에 대한 프롬프트

명령어에 필수 인수가 포함되어 있으면 제공되지 않을 때 사용자가 오류 메시지를 받게 됩니다. 또는 `PromptsForMissingInput` 인터페이스를 구현하여 필수 인수가 누락된 경우 자동으로 사용자에게 프롬프트하도록 명령어를 구성할 수 있습니다:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\PromptsForMissingInput;

class SendEmails extends Command implements PromptsForMissingInput
{
    /**
     * 콘솔 명령어의 이름과 시그니처.
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';

    // ...
}
```

Laravel이 사용자로부터 필수 인수를 수집해야 하는 경우 인수 이름이나 설명을 사용하여 지능적으로 질문을 구성하여 사용자에게 자동으로 질문합니다. 필수 인수를 수집하는 데 사용되는 질문을 커스터마이징하려면 인수 이름으로 키가 지정된 질문 배열을 반환하는 `promptForMissingArgumentsUsing` 메서드를 구현할 수 있습니다:

```php
/**
 * 반환된 질문을 사용하여 누락된 입력 인수에 대해 프롬프트.
 *
 * @return array<string, string>
 */
protected function promptForMissingArgumentsUsing(): array
{
    return [
        'user' => 'Which user ID should receive the mail?',
    ];
}
```

질문과 플레이스홀더를 포함하는 튜플을 사용하여 플레이스홀더 텍스트를 제공할 수도 있습니다:

```php
return [
    'user' => ['Which user ID should receive the mail?', 'E.g. 123'],
];
```

프롬프트에 대한 완전한 제어를 원하면 사용자에게 프롬프트하고 응답을 반환하는 클로저를 제공할 수 있습니다:

```php
use App\Models\User;
use function Laravel\Prompts\search;

// ...

return [
    'user' => fn () => search(
        label: 'Search for a user:',
        placeholder: 'E.g. Taylor Otwell',
        options: fn ($value) => strlen($value) > 0
            ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
            : []
    ),
];
```

> [!NOTE]
종합적인 [Laravel Prompts](/docs/{{version}}/prompts) 문서에는 사용 가능한 프롬프트와 사용법에 대한 추가 정보가 포함되어 있습니다.

사용자에게 [옵션](#options)을 선택하거나 입력하라는 프롬프트를 표시하려면 명령어의 `handle` 메서드에 프롬프트를 포함할 수 있습니다. 그러나 누락된 인수에 대해 자동으로 프롬프트가 표시된 경우에만 프롬프트를 표시하려면 `afterPromptingForMissingArguments` 메서드를 구현할 수 있습니다:

```php
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use function Laravel\Prompts\confirm;

// ...

/**
 * 사용자에게 누락된 인수에 대해 프롬프트한 후 작업 수행.
 */
protected function afterPromptingForMissingArguments(InputInterface $input, OutputInterface $output): void
{
    $input->setOption('queue', confirm(
        label: 'Would you like to queue the mail?',
        default: $this->option('queue')
    ));
}
```

<a name="command-io"></a>
## 명령어 입출력

<a name="retrieving-input"></a>
### 입력 가져오기

명령어가 실행되는 동안 명령어가 허용하는 인수 및 옵션의 값에 액세스해야 할 수 있습니다. 이를 위해 `argument` 및 `option` 메서드를 사용할 수 있습니다. 인수나 옵션이 존재하지 않으면 `null`이 반환됩니다:

```php
/**
 * 콘솔 명령어 실행.
 */
public function handle(): void
{
    $userId = $this->argument('user');
}
```

모든 인수를 `array`로 가져와야 하는 경우 `arguments` 메서드를 호출하세요:

```php
$arguments = $this->arguments();
```

옵션은 `option` 메서드를 사용하여 인수만큼 쉽게 가져올 수 있습니다. 모든 옵션을 배열로 가져오려면 `options` 메서드를 호출하세요:

```php
// 특정 옵션 가져오기...
$queueName = $this->option('queue');

// 모든 옵션을 배열로 가져오기...
$options = $this->options();
```

<a name="prompting-for-input"></a>
### 입력 요청하기

> [!NOTE]
> [Laravel Prompts](/docs/{{version}}/prompts)는 플레이스홀더 텍스트 및 유효성 검사를 포함한 브라우저와 유사한 기능으로 커맨드 라인 애플리케이션에 아름답고 사용자 친화적인 폼을 추가하기 위한 PHP 패키지입니다.

출력을 표시하는 것 외에도 명령어 실행 중에 사용자에게 입력을 제공하도록 요청할 수 있습니다. `ask` 메서드는 주어진 질문으로 사용자에게 프롬프트하고 입력을 받아 사용자의 입력을 명령어에 반환합니다:

```php
/**
 * 콘솔 명령어 실행.
 */
public function handle(): void
{
    $name = $this->ask('What is your name?');

    // ...
}
```

`ask` 메서드는 또한 사용자 입력이 제공되지 않은 경우 반환되어야 하는 기본값을 지정하는 선택적 두 번째 인수를 허용합니다:

```php
$name = $this->ask('What is your name?', 'Taylor');
```

`secret` 메서드는 `ask`와 유사하지만 사용자가 콘솔에서 입력할 때 입력이 보이지 않습니다. 이 메서드는 비밀번호와 같은 민감한 정보를 요청할 때 유용합니다:

```php
$password = $this->secret('What is the password?');
```

<a name="asking-for-confirmation"></a>
#### 확인 요청하기

사용자에게 간단한 "예 또는 아니오" 확인을 요청해야 하는 경우 `confirm` 메서드를 사용할 수 있습니다. 기본적으로 이 메서드는 `false`를 반환합니다. 그러나 사용자가 프롬프트에 대해 `y` 또는 `yes`를 입력하면 메서드는 `true`를 반환합니다.

```php
if ($this->confirm('Do you wish to continue?')) {
    // ...
}
```

필요한 경우 `confirm` 메서드의 두 번째 인수로 `true`를 전달하여 확인 프롬프트가 기본적으로 `true`를 반환하도록 지정할 수 있습니다:

```php
if ($this->confirm('Do you wish to continue?', true)) {
    // ...
}
```

<a name="auto-completion"></a>
#### 자동 완성

`anticipate` 메서드는 가능한 선택 항목에 대한 자동 완성을 제공하는 데 사용할 수 있습니다. 사용자는 자동 완성 힌트에 관계없이 여전히 모든 응답을 제공할 수 있습니다:

```php
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

또는 `anticipate` 메서드의 두 번째 인수로 클로저를 전달할 수 있습니다. 클로저는 사용자가 입력 문자를 입력할 때마다 호출됩니다. 클로저는 지금까지의 사용자 입력을 포함하는 문자열 매개변수를 받아 자동 완성을 위한 옵션 배열을 반환해야 합니다:

```php
use App\Models\Address;

$name = $this->anticipate('What is your address?', function (string $input) {
    return Address::whereLike('name', "{$input}%")
        ->limit(5)
        ->pluck('name')
        ->all();
});
```

<a name="multiple-choice-questions"></a>
#### 다중 선택 질문

질문할 때 사용자에게 미리 정의된 선택 항목 세트를 제공해야 하는 경우 `choice` 메서드를 사용할 수 있습니다. 옵션이 선택되지 않은 경우 반환될 기본값의 배열 인덱스를 메서드의 세 번째 인수로 전달하여 설정할 수 있습니다:

```php
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
```

또한 `choice` 메서드는 유효한 응답을 선택하기 위한 최대 시도 횟수와 다중 선택 허용 여부를 결정하는 선택적 네 번째 및 다섯 번째 인수를 허용합니다:

```php
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex,
    $maxAttempts = null,
    $allowMultipleSelections = false
);
```

<a name="writing-output"></a>
### 출력 작성하기

콘솔에 출력을 보내려면 `line`, `newLine`, `info`, `comment`, `question`, `warn`, `alert`, `error` 메서드를 사용할 수 있습니다. 각 메서드는 목적에 맞는 적절한 ANSI 색상을 사용합니다. 예를 들어 사용자에게 일반 정보를 표시해 보겠습니다. 일반적으로 `info` 메서드는 콘솔에 녹색 텍스트로 표시됩니다:

```php
/**
 * 콘솔 명령어 실행.
 */
public function handle(): void
{
    // ...

    $this->info('The command was successful!');
}
```

오류 메시지를 표시하려면 `error` 메서드를 사용하세요. 오류 메시지 텍스트는 일반적으로 빨간색으로 표시됩니다:

```php
$this->error('Something went wrong!');
```

색상이 없는 일반 텍스트를 표시하려면 `line` 메서드를 사용할 수 있습니다:

```php
$this->line('Display this on the screen');
```

빈 줄을 표시하려면 `newLine` 메서드를 사용할 수 있습니다:

```php
// 빈 줄 하나 작성...
$this->newLine();

// 빈 줄 세 개 작성...
$this->newLine(3);
```

<a name="tables"></a>
#### 테이블

`table` 메서드를 사용하면 여러 행/열의 데이터를 올바르게 포맷하기 쉽습니다. 열 이름과 테이블 데이터만 제공하면 Laravel이 자동으로 테이블의 적절한 너비와 높이를 계산합니다:

```php
use App\Models\User;

$this->table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="progress-bars"></a>
#### 진행률 표시줄

오래 실행되는 작업의 경우 작업이 얼마나 완료되었는지 사용자에게 알려주는 진행률 표시줄을 표시하는 것이 도움이 될 수 있습니다. `withProgressBar` 메서드를 사용하면 Laravel은 진행률 표시줄을 표시하고 주어진 반복 가능한 값에 대한 각 반복마다 진행률을 진행시킵니다:

```php
use App\Models\User;

$users = $this->withProgressBar(User::all(), function (User $user) {
    $this->performTask($user);
});
```

때때로 진행률 표시줄이 어떻게 진행되는지에 대해 더 수동적인 제어가 필요할 수 있습니다. 먼저 프로세스가 반복할 총 단계 수를 정의하세요. 그런 다음 각 항목을 처리한 후 진행률 표시줄을 진행시키세요:

```php
$users = App\Models\User::all();

$bar = $this->output->createProgressBar(count($users));

$bar->start();

foreach ($users as $user) {
    $this->performTask($user);

    $bar->advance();
}

$bar->finish();
```

> [!NOTE]
> 더 고급 옵션은 [Symfony Progress Bar 컴포넌트 문서](https://symfony.com/doc/current/components/console/helpers/progressbar.html)를 확인하세요.

<a name="registering-commands"></a>
## 명령어 등록하기

기본적으로 Laravel은 `app/Console/Commands` 디렉토리 내의 모든 명령어를 자동으로 등록합니다. 그러나 애플리케이션의 `bootstrap/app.php` 파일에서 `withCommands` 메서드를 사용하여 Laravel이 아티즌 명령어를 위해 다른 디렉토리를 스캔하도록 지시할 수 있습니다:

```php
->withCommands([
    __DIR__.'/../app/Domain/Orders/Commands',
])
```

필요한 경우 명령어의 클래스 이름을 `withCommands` 메서드에 제공하여 명령어를 수동으로 등록할 수도 있습니다:

```php
use App\Domain\Orders\Commands\SendEmails;

->withCommands([
    SendEmails::class,
])
```

아티즌이 부팅되면 애플리케이션의 모든 명령어가 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에 의해 해결되고 아티즌에 등록됩니다.

<a name="programmatically-executing-commands"></a>
## 프로그래밍 방식으로 명령어 실행하기

때때로 CLI 외부에서 아티즌 명령어를 실행하고 싶을 수 있습니다. 예를 들어 라우트나 컨트롤러에서 아티즌 명령어를 실행하고 싶을 수 있습니다. `Artisan` 파사드의 `call` 메서드를 사용하여 이를 수행할 수 있습니다. `call` 메서드는 첫 번째 인수로 명령어의 시그니처 이름이나 클래스 이름을 받고 두 번째 인수로 명령어 매개변수 배열을 받습니다. 종료 코드가 반환됩니다:

```php
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::post('/user/{user}/mail', function (string $user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

또는 전체 아티즌 명령어를 문자열로 `call` 메서드에 전달할 수 있습니다:

```php
Artisan::call('mail:send 1 --queue=default');
```

<a name="passing-array-values"></a>
#### 배열 값 전달하기

명령어가 배열을 허용하는 옵션을 정의하는 경우 해당 옵션에 값 배열을 전달할 수 있습니다:

```php
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
```

<a name="passing-boolean-values"></a>
#### 불리언 값 전달하기

`migrate:refresh` 명령어의 `--force` 플래그와 같이 문자열 값을 허용하지 않는 옵션의 값을 지정해야 하는 경우 옵션의 값으로 `true` 또는 `false`를 전달해야 합니다:

```php
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a name="queueing-artisan-commands"></a>
#### 아티즌 명령어 큐잉

`Artisan` 파사드의 `queue` 메서드를 사용하면 아티즌 명령어를 큐에 넣어 [큐 워커(Queue Worker)](/docs/{{version}}/queues)가 백그라운드에서 처리하도록 할 수도 있습니다. 이 메서드를 사용하기 전에 큐를 구성하고 큐 리스너를 실행하고 있는지 확인하세요:

```php
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::post('/user/{user}/mail', function (string $user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

`onConnection` 및 `onQueue` 메서드를 사용하여 아티즌 명령어가 디스패치되어야 하는 연결이나 큐를 지정할 수 있습니다:

```php
Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

<a name="calling-commands-from-other-commands"></a>
### 다른 명령어에서 명령어 호출하기

때때로 기존 아티즌 명령어에서 다른 명령어를 호출하고 싶을 수 있습니다. `call` 메서드를 사용하여 이를 수행할 수 있습니다. 이 `call` 메서드는 명령어 이름과 명령어 인수/옵션 배열을 받습니다:

```php
/**
 * 콘솔 명령어 실행.
 */
public function handle(): void
{
    $this->call('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    // ...
}
```

다른 콘솔 명령어를 호출하고 모든 출력을 억제하려면 `callSilently` 메서드를 사용할 수 있습니다. `callSilently` 메서드는 `call` 메서드와 동일한 시그니처를 가집니다:

```php
$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
```

<a name="signal-handling"></a>
## 시그널 처리

아시다시피 운영 체제는 실행 중인 프로세스에 시그널을 보낼 수 있습니다. 예를 들어 `SIGTERM` 시그널은 운영 체제가 프로그램에 종료를 요청하는 방식입니다. 아티즌 콘솔 명령어에서 시그널을 수신하고 시그널이 발생할 때 코드를 실행하려면 `trap` 메서드를 사용할 수 있습니다:

```php
/**
 * 콘솔 명령어 실행.
 */
public function handle(): void
{
    $this->trap(SIGTERM, fn () => $this->shouldKeepRunning = false);

    while ($this->shouldKeepRunning) {
        // ...
    }
}
```

여러 시그널을 한 번에 수신하려면 `trap` 메서드에 시그널 배열을 제공할 수 있습니다:

```php
$this->trap([SIGTERM, SIGQUIT], function (int $signal) {
    $this->shouldKeepRunning = false;

    dump($signal); // SIGTERM / SIGQUIT
});
```

<a name="stub-customization"></a>
## 스텁 커스터마이징

아티즌 콘솔의 `make` 명령어는 컨트롤러, 잡, 마이그레이션, 테스트와 같은 다양한 클래스를 생성하는 데 사용됩니다. 이러한 클래스는 입력에 따라 값이 채워지는 "스텁" 파일을 사용하여 생성됩니다. 그러나 아티즌이 생성한 파일에 작은 변경을 가하고 싶을 수 있습니다. 이를 위해 `stub:publish` 명령어를 사용하여 가장 일반적인 스텁을 애플리케이션에 퍼블리시하여 커스터마이징할 수 있습니다:

```shell
php artisan stub:publish
```

퍼블리시된 스텁은 애플리케이션 루트의 `stubs` 디렉토리에 위치합니다. 이러한 스텁에 대한 모든 변경 사항은 아티즌의 `make` 명령어를 사용하여 해당 클래스를 생성할 때 반영됩니다.

<a name="events"></a>
## 이벤트

아티즌은 명령어를 실행할 때 세 가지 이벤트를 디스패치합니다: `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting`, `Illuminate\Console\Events\CommandFinished`. `ArtisanStarting` 이벤트는 아티즌이 실행을 시작하자마자 즉시 디스패치됩니다. 다음으로 `CommandStarting` 이벤트는 명령어가 실행되기 직전에 디스패치됩니다. 마지막으로 `CommandFinished` 이벤트는 명령어 실행이 완료되면 디스패치됩니다.

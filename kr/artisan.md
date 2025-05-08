# 아티즌 콘솔

- [소개](#introduction)
    - [Tinker (REPL)](#tinker)
- [명령어 작성](#writing-commands)
    - [명령어 생성](#generating-commands)
    - [명령어 구조](#command-structure)
    - [클로저 명령어](#closure-commands)
    - [단일 실행 보장 명령어](#isolatable-commands)
- [입력 기대 정의](#defining-input-expectations)
    - [인자](#arguments)
    - [옵션](#options)
    - [배열 입력](#input-arrays)
    - [입력 설명](#input-descriptions)
    - [누락된 입력 요청](#prompting-for-missing-input)
- [명령어 입출력](#command-io)
    - [입력값 가져오기](#retrieving-input)
    - [입력 요청하기](#prompting-for-input)
    - [출력 작성하기](#writing-output)
- [명령어 등록](#registering-commands)
- [프로그래밍 방식으로 명령어 실행](#programmatically-executing-commands)
    - [다른 명령어 호출](#calling-commands-from-other-commands)
- [시그널 처리](#signal-handling)
- [스텁 커스터마이징](#stub-customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

Artisan은 Laravel에 포함된 명령줄 인터페이스입니다. Artisan은 애플리케이션 루트에 존재하는 `artisan` 스크립트를 통해 제공되며, 애플리케이션 개발 중 유용한 다양한 명령어들을 포함합니다. 사용 가능한 모든 Artisan 명령어 목록을 보려면 다음 명령을 실행하세요:

```shell
php artisan list
```

모든 명령어에는 사용 가능한 인자 및 옵션을 보여주는 "도움말" 화면이 있습니다. 도움말을 보려면 명령어 앞에 `help`를 붙이세요:

```shell
php artisan help migrate
```

<a name="laravel-sail"></a>
#### Laravel Sail

[Laravel Sail](/docs/{{version}}/sail)을 로컬 개발 환경으로 사용하는 경우, Artisan 명령어는 `sail` 명령어를 통해 실행해야 하며, 해당 명령은 Docker 컨테이너 내에서 실행됩니다:

```shell
./vendor/bin/sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

[Laravel Tinker](https://github.com/laravel/tinker)는 [PsySH](https://github.com/bobthecow/psysh)를 기반으로 하는 Laravel 프레임워크용 강력한 REPL입니다.

<a name="installation"></a>
#### 설치

Laravel 애플리케이션에는 기본적으로 Tinker가 포함되어 있습니다. 그러나 삭제된 경우 Composer를 통해 다시 설치할 수 있습니다:

```shell
composer require laravel/tinker
```

> [!NOTE]
> 핫 리로딩, 멀티라인 코드 편집, 자동완성을 포함한 보다 강력한 기능을 원하신다면 [Tinkerwell](https://tinkerwell.app)을 확인하세요.

<a name="usage"></a>
#### 사용법

Tinker를 통해 Eloquent 모델, 잡, 이벤트 등 Laravel 애플리케이션 전체와 명령줄에서 상호작용할 수 있습니다. Tinker 환경에 진입하려면 다음 명령어를 실행하세요:

```shell
php artisan tinker
```

Tinker의 설정 파일은 다음 명령으로 퍼블리시할 수 있습니다:

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```


> [!WARNING]
> `dispatch` 헬퍼 함수와 `Dispatchable` 클래스의 `dispatch` 메서드는 잡을 큐에 넣기 위해 가비지 컬렉션에 의존합니다. 따라서 Tinker에서는 `Bus::dispatch` 또는 `Queue::push`를 사용해야 합니다.

<a name="command-allow-list"></a>
#### 명령어 허용 목록

Tinker는 어떤 Artisan 명령어가 셸 내에서 실행 가능한지를 결정하기 위해 "허용 목록"을 사용합니다. 기본적으로 `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `migrate:install`, `up`, `optimize` 명령어가 허용되어 있습니다. 더 많은 명령어를 허용하려면 `tinker.php` 설정 파일의 `commands` 배열에 추가하세요:

```php
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

<a name="classes-that-should-not-be-aliased"></a>
#### 별칭을 지정하지 않을 클래스

일반적으로 Tinker는 Tinker 내에서 상호작용 시 클래스에 대해 자동으로 별칭을 지정합니다. 하지만 일부 클래스는 절대 별칭을 지정하지 않도록 설정할 수 있습니다. 이를 위해 `tinker.php` 설정 파일의 `dont_alias` 배열에 클래스를 추가하면 됩니다:

```php
'dont_alias' => [
    App\Models\User::class,
],
```

<a name="writing-commands"></a>
## 명령어 작성

Artisan에서 제공하는 명령어 외에도 사용자 정의 명령어를 직접 작성할 수 있습니다. 명령어는 일반적으로 `app/Console/Commands` 디렉토리에 저장되지만, Composer가 로드할 수 있다면 원하는 위치에 저장해도 무방합니다.

<a name="generating-commands"></a>
### 명령어 생성

새 명령어를 생성하려면 `make:command` Artisan 명령어를 사용할 수 있습니다. 이 명령은 `app/Console/Commands` 디렉토리에 새로운 명령어 클래스를 생성합니다. 이 디렉토리가 존재하지 않는 경우 처음 실행 시 자동으로 생성됩니다:

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### 명령어 구조

명령어를 생성한 후에는 클래스의 `signature` 및 `description` 속성에 적절한 값을 정의해야 합니다. 이 속성들은 `list` 명령어 화면에 표시됩니다. `signature`는 [입력 기대값](#defining-input-expectations)을 정의할 수 있게 해줍니다. 명령어가 실행되면 `handle` 메소드가 호출되며, 이 메소드에 명령어 로직을 작성하면 됩니다.

예시 명령어를 살펴보겠습니다. `handle` 메소드에서 필요한 종속성을 주입받을 수 있습니다. Laravel의 [서비스 컨테이너](/docs/{{version}}/container)는 이 메소드에 타입 힌트된 종속성을 자동으로 주입해줍니다:

```php
<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\DripEmailer;
use Illuminate\Console\Command;

class SendEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a marketing email to a user';

    /**
     * Execute the console command.
     */
    public function handle(DripEmailer $drip): void
    {
        $drip->send(User::find($this->argument('user')));
    }
}
```

> [!NOTE]
> 코드 재사용성을 높이기 위해, 콘솔 명령어는 가능한 가볍게 유지하고, 실제 로직은 서비스 클래스에서 처리하는 것이 좋습니다.



<a name="exit-codes"></a>
#### 종료 코드

`handle` 메소드에서 아무것도 반환하지 않고 명령어가 성공적으로 실행되면 종료 코드는 `0`이 됩니다. 명시적으로 종료 코드를 반환하려면 정수형 값을 반환하면 됩니다:

```php
$this->error('Something went wrong.');

return 1;
```

명령어 내 어디서든 명령어를 실패하도록 하고 싶다면 `fail` 메소드를 사용할 수 있습니다. 이 메소드는 즉시 명령어 실행을 종료하고 `1`을 반환합니다:

```php
$this->fail('Something went wrong.');
```

<a name="closure-commands"></a>
### 클로저 명령어

클로저 기반 명령어는 클래스를 정의하는 대신 사용할 수 있는 대안입니다. 라우트에서 클로저를 사용하는 것과 비슷하게 생각할 수 있습니다.

`routes/console.php` 파일은 HTTP 라우트를 정의하지는 않지만, 애플리케이션에 대한 콘솔 기반 진입점을 정의합니다. 이 파일 안에서 `Artisan::command` 메소드를 사용하여 클로저 기반의 콘솔 명령어를 정의할 수 있습니다. `command` 메소드는 [명령어 시그니처](#defining-input-expectations)와 명령어 인자 및 옵션을 받을 클로저를 인자로 받습니다:

```php
Artisan::command('mail:send {user}', function (string $user) {
    $this->info("Sending email to: {$user}!");
});
```

이 클로저는 내부적으로 명령어 인스턴스에 바인딩되므로, 일반적인 명령어 클래스에서 접근 가능한 모든 헬퍼 메소드에 접근할 수 있습니다.

<a name="type-hinting-dependencies"></a>
#### 의존성 타입 힌팅

명령어 클로저에서도 인자 및 옵션 외에 의존성을 타입 힌트로 지정하면 Laravel 서비스 컨테이너가 이를 자동으로 주입해줍니다:

```php
use App\Models\User;
use App\Support\DripEmailer;

Artisan::command('mail:send {user}', function (DripEmailer $drip, string $user) {
    $drip->send(User::find($user));
});
```

<a name="closure-command-descriptions"></a>
#### 클로저 명령어 설명 추가

`purpose` 메소드를 사용하면 명령어 설명을 추가할 수 있으며, 이는 `php artisan list` 또는 `php artisan help` 명령에서 표시됩니다:

```php
Artisan::command('mail:send {user}', function (string $user) {
    // ...
})->purpose('Send a marketing email to a user');
```

<a name="isolatable-commands"></a>
### 단일 실행 보장 명령어

> [!WARNING]
> 이 기능을 사용하려면 애플리케이션 기본 캐시 드라이버가 `memcached`, `redis`, `dynamodb`, `database`, `file`, 또는 `array` 중 하나여야 하며, 모든 서버는 동일한 중앙 캐시 서버와 통신해야 합니다.

하나의 명령어 인스턴스만 실행되도록 보장하고 싶을 경우, 명령어 클래스에서 `Illuminate\Contracts\Console\Isolatable` 인터페이스를 구현하면 됩니다:

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


명령어가 `Isolatable`로 표시되면 Laravel은 해당 명령어에 `--isolated` 옵션을 자동으로 추가합니다. 이 옵션이 함께 실행되면 Laravel은 기본 캐시 드라이버를 사용하여 원자적 락을 획득하려 시도하며, 이미 실행 중인 인스턴스가 있을 경우 실행되지 않습니다. 그러나 이 경우에도 종료 코드는 성공(`0`)으로 반환됩니다:

```shell
php artisan mail:send 1 --isolated
```

명령어가 실행되지 못할 경우 반환할 종료 코드를 지정하려면 `--isolated=12`와 같이 사용할 수 있습니다:

```shell
php artisan mail:send 1 --isolated=12
```

<a name="lock-id"></a>
#### 락 ID

기본적으로 Laravel은 명령어 이름을 기반으로 캐시에 사용할 문자열 키를 생성합니다. 하지만 `isolatableId` 메소드를 정의하여 인자나 옵션 값을 포함한 사용자 정의 키를 만들 수 있습니다:

```php
/**
 * Get the isolatable ID for the command.
 */
public function isolatableId(): string
{
    return $this->argument('user');
}
```

<a name="lock-expiration-time"></a>
#### 락 만료 시간

기본적으로 락은 명령어가 완료되거나, 실패한 경우에는 한 시간 후 만료됩니다. 이를 변경하려면 `isolationLockExpiresAt` 메소드를 정의하면 됩니다:

```php
use DateTimeInterface;
use DateInterval;

/**
 * Determine when an isolation lock expires for the command.
 */
public function isolationLockExpiresAt(): DateTimeInterface|DateInterval
{
    return now()->addMinutes(5);
}
```

<a name="defining-input-expectations"></a>
## 입력 기대 정의하기

명령어를 작성할 때 사용자로부터 인자나 옵션을 통해 입력을 받는 것이 일반적입니다. Laravel은 명령어 클래스의 `signature` 속성을 통해 이를 매우 간단하게 정의할 수 있도록 도와줍니다.

<a name="arguments"></a>
### 인자

사용자 입력 인자 및 옵션은 중괄호로 감싸 정의합니다. 다음 예시는 하나의 필수 인자 `user`를 정의합니다:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
```

선택적 인자 및 기본값을 지정할 수도 있습니다:

```php
// 선택적 인자
'mail:send {user?}'

// 기본값 지정
'mail:send {user=foo}'
```

<a name="options"></a>
### 옵션

옵션은 `--`로 시작하는 명령줄 입력으로, 값이 필요하지 않거나 값을 받을 수 있습니다. 예를 들어, 다음은 불리언 스위치 타입의 옵션입니다:

```php
// Optional argument...
'mail:send {user?}'

// Optional argument with default value...
'mail:send {user=foo}'
```

```shell
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### 값이 있는 옵션

값이 필요한 옵션은 다음과 같이 정의합니다:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

기본값을 정의할 수도 있습니다:

```php
'mail:send {user} {--queue=default}'
```

<a name="option-shortcuts"></a>
#### 옵션 단축어

옵션 이름 앞에 단축어를 `|`로 구분하여 지정할 수 있습니다:

```php
'mail:send {user} {--Q|queue}'
```

단축어를 사용할 때는 단일 하이픈으로 지정하며 `=` 없이 값을 전달합니다:

```shell
php artisan mail:send 1 -Qdefault
```


<a name="input-arrays"></a>
### 배열 입력

여러 개의 인자나 옵션 값을 받으려면 `*` 문자를 사용할 수 있습니다:

```php
'mail:send {user*}'
```

명령어 호출 시, `user`는 배열로 처리됩니다:

```shell
php artisan mail:send 1 2
```

선택적 배열 인자도 가능합니다:

```php
'mail:send {user?*}'
```

<a name="option-arrays"></a>
#### 배열 옵션

다중 입력을 받는 옵션은 각 값을 별도로 지정합니다:

```php
'mail:send {--id=*}'
```

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### 입력 설명

입력 인자 및 옵션에 설명을 붙이려면 콜론(`:`)을 사용합니다:

```php
protected $signature = 'mail:send
                        {user : 사용자 ID}
                        {--queue : 큐에 넣을지 여부}';
```

<a name="prompting-for-missing-input"></a>
### 누락된 입력 요청하기

필수 인자가 제공되지 않으면 Laravel은 오류 메시지를 표시합니다. 그러나 `PromptsForMissingInput` 인터페이스를 구현하면 자동으로 입력을 요청할 수 있습니다:

```shell
php artisan mail:send 1 --queue
```

필요시 입력 요청 메시지를 커스터마이징하려면 `promptForMissingArgumentsUsing` 메소드를 정의하세요:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

프롬프트에 플레이스홀더를 지정할 수도 있습니다:

```php
return [
    'user' => ['메일을 받을 사용자 ID는?', '예: 123'],
];
```

고급 사용자 지정 프롬프트를 사용하려면 클로저를 사용할 수 있습니다:

```shell
php artisan mail:send 1 --queue=default
```

> [!NOTE]
> 더 많은 프롬프트에 대한 정보는 [Laravel Prompts](/docs/{{version}}/prompts) 문서를 참조하세요.

`afterPromptingForMissingArguments` 메서드를 통해 누락된 인자 요청 이후 추가 입력 프롬프트를 표시할 수도 있습니다:

```php
'mail:send {user} {--queue=default}'
```

<a name="option-shortcuts"></a>
#### 옵션 단축어

옵션을 정의할 때 단축어를 지정하려면, 전체 옵션 이름 앞에 단축어를 작성하고 `|` 문자로 구분하면 됩니다:

```php
'mail:send {user} {--Q|queue}'
```

터미널에서 명령어를 실행할 때 단축어는 하나의 하이픈(-)으로 시작해야 하며, 옵션 값에는 `=` 기호를 포함하지 않아야 합니다:

```shell
php artisan mail:send 1 -Qdefault
```

<a name="input-arrays"></a>
### 배열 입력값

하나의 인자나 옵션에서 여러 값을 받으려면 `*` 문자를 사용할 수 있습니다. 아래는 해당 인자를 정의한 예시입니다:

```php
'mail:send {user*}'
```

명령어 실행 시, 아래처럼 입력하면 `user`는 `1`, `2`를 포함한 배열로 처리됩니다:

```shell
php artisan mail:send 1 2
```

선택적인 다중 인자를 정의하려면 `?*` 문법을 사용할 수 있습니다:

```php
'mail:send {user?*}'
```

<a name="option-arrays"></a>
#### 배열 옵션

다중 입력값을 받는 옵션을 정의할 때는, 각 값을 해당 옵션 이름과 함께 명시해야 합니다:

```php
'mail:send {--id=*}'
```

명령 실행 예시:

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### 입력 설명

입력 인자나 옵션에 설명을 추가하려면 콜론(`:`)을 사용하면 됩니다. 정의가 길 경우 여러 줄로 작성할 수 있습니다:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send
                        {user : 사용자 ID}
                        {--queue : 작업을 큐에 넣을지 여부}';
```

<a name="prompting-for-missing-input"></a>
### 누락된 입력 요청하기

명령어에 필수 인자가 있는 경우, 사용자가 값을 제공하지 않으면 오류가 발생합니다. 하지만 `PromptsForMissingInput` 인터페이스를 구현하면 누락된 인자에 대해 자동으로 입력을 요청할 수 있습니다:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\PromptsForMissingInput;

class SendEmails extends Command implements PromptsForMissingInput
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';

    // ...
}
```

Laravel은 누락된 인자에 대해 이름이나 설명을 이용해 자동으로 질문을 생성합니다. 질문을 직접 지정하려면 `promptForMissingArgumentsUsing` 메소드를 구현하세요:

```php
/**
 * Prompt for missing input arguments using the returned questions.
 *
 * @return array<string, string>
 */
protected function promptForMissingArgumentsUsing(): array
{
    return [
        'user' => '메일을 받을 사용자 ID는 무엇인가요?',
    ];
}
```

질문에 플레이스홀더도 추가할 수 있습니다:

```php
return [
    'user' => ['메일을 받을 사용자 ID는?', '예: 123'],
];
```

프롬프트를 완전히 제어하고 싶다면 클로저를 반환할 수도 있습니다:

```php
use App\Models\User;
use function Laravel\Prompts\search;

// ...

return [
    'user' => fn () => search(
        label: '사용자 검색:',
        placeholder: '예: Taylor Otwell',
        options: fn ($value) => strlen($value) > 0
            ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
            : []
    ),
];
```

> [!NOTE]
> 자세한 프롬프트 사용법은 [Laravel Prompts](/docs/{{version}}/prompts) 문서를 참고하세요.

필수 인자 요청 이후 추가 프롬프트를 보여주고 싶다면 `afterPromptingForMissingArguments` 메서드를 구현하세요:

```php
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use function Laravel\Prompts\confirm;

// ...

/**
 * Perform actions after the user was prompted for missing arguments.
 */
protected function afterPromptingForMissingArguments(InputInterface $input, OutputInterface $output): void
{
    $input->setOption('queue', confirm(
        label: '메일을 큐에 넣으시겠습니까?',
        default: $this->option('queue')
    ));
}
```

<a name="command-io"></a>
## 명령어 입출력

<a name="retrieving-input"></a>
### 입력값 가져오기

명령어 실행 중 사용자로부터 받은 인자와 옵션 값을 읽어야 할 수 있습니다. 이 경우 `argument` 및 `option` 메서드를 사용할 수 있으며, 값이 없으면 `null`이 반환됩니다:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $userId = $this->argument('user');
}
```

모든 인자를 배열로 받고 싶다면 `arguments()` 메서드를 사용하세요:

```php
$arguments = $this->arguments();
```

옵션도 마찬가지로 `option()` 또는 `options()` 메서드로 개별 혹은 전체 옵션을 조회할 수 있습니다:

```php
// 특정 옵션만 조회
$queueName = $this->option('queue');

// 전체 옵션 배열 조회
$options = $this->options();
```
<a name="prompting-for-input"></a>
### 입력 요청하기

> [!NOTE]
> [Laravel Prompts](/docs/{{version}}/prompts)는 명령줄 애플리케이션에 자리 표시자 텍스트 및 유효성 검사와 같은 브라우저 스타일 기능이 포함된 폼을 추가할 수 있는 PHP 패키지입니다.

출력을 표시하는 것 외에도, 명령어 실행 중 사용자로부터 입력을 요청할 수 있습니다. `ask` 메서드는 질문을 출력하고, 사용자의 입력을 받아 반환합니다:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $name = $this->ask('이름이 무엇인가요?');

    // ...
}
```

`ask` 메서드는 사용자가 아무것도 입력하지 않았을 때 반환할 기본값을 두 번째 인자로 받을 수 있습니다:

```php
$name = $this->ask('이름이 무엇인가요?', 'Taylor');
```

`secret` 메서드는 `ask`와 유사하지만, 입력 내용이 터미널에 표시되지 않습니다. 비밀번호와 같이 민감한 정보를 받을 때 유용합니다:

```php
$password = $this->secret('비밀번호는 무엇인가요?');
```

<a name="asking-for-confirmation"></a>
#### 확인 요청하기

단순히 "예" 또는 "아니오"를 묻는 질문을 하려면 `confirm` 메서드를 사용할 수 있습니다. 기본적으로 `false`를 반환하며, 사용자가 `y` 또는 `yes`를 입력하면 `true`를 반환합니다:

```php
if ($this->confirm('계속 진행하시겠습니까?')) {
    // ...
}
```

필요하다면, 두 번째 인자로 `true`를 전달하여 기본 응답을 `true`로 지정할 수 있습니다:

```php
if ($this->confirm('계속 진행하시겠습니까?', true)) {
    // ...
}
```

<a name="auto-completion"></a>
#### 자동 완성

`anticipate` 메서드를 사용하면 자동 완성 가능한 옵션을 제공할 수 있습니다. 자동 완성 힌트와 무관하게 사용자는 원하는 값을 입력할 수 있습니다:

```php
$name = $this->anticipate('이름이 무엇인가요?', ['Taylor', 'Dayle']);
```

또는 두 번째 인자로 클로저를 전달하면, 사용자가 입력할 때마다 호출되어 자동 완성 옵션을 동적으로 반환할 수 있습니다:

```php
use App\Models\Address;

$name = $this->anticipate('주소는 무엇인가요?', function (string $input) {
    return Address::whereLike('name', "{$input}%")
        ->limit(5)
        ->pluck('name')
        ->all();
});
```

<a name="multiple-choice-questions"></a>
#### 다중 선택 질문

사용자에게 선택 가능한 항목을 제시하고 선택하게 하려면 `choice` 메서드를 사용할 수 있습니다. 세 번째 인자로 기본 선택 항목의 인덱스를 지정할 수 있습니다:

```php
$name = $this->choice(
    '이름을 선택하세요:',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
```

또한 네 번째 및 다섯 번째 인자를 사용하여 최대 시도 횟수 및 다중 선택 허용 여부를 설정할 수 있습니다:

```php
$name = $this->choice(
    '이름을 선택하세요:',
    ['Taylor', 'Dayle'],
    $defaultIndex,
    $maxAttempts = null,
    $allowMultipleSelections = false
);
```

<a name="writing-output"></a>
### 출력 작성하기

콘솔에 출력하려면 `line`, `info`, `comment`, `question`, `warn`, `error` 메서드를 사용할 수 있습니다. 각 메서드는 목적에 맞는 ANSI 색상을 사용합니다. 예를 들어, `info`는 일반적으로 녹색 텍스트로 출력됩니다:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    // ...

    $this->info('명령어가 성공적으로 실행되었습니다!');
}
```

에러 메시지를 표시하려면 `error` 메서드를 사용하세요. 일반적으로 빨간색 텍스트로 출력됩니다:

```php
$this->error('문제가 발생했습니다!');
```

일반 텍스트를 색상 없이 출력하려면 `line` 메서드를 사용하세요:

```php
$this->line('이 텍스트를 출력합니다');
```

빈 줄을 출력하려면 `newLine` 메서드를 사용합니다:

```php
// 한 줄 출력
$this->newLine();

// 세 줄 출력
$this->newLine(3);
```

<a name="tables"></a>
#### 테이블 출력

`table` 메서드를 사용하면 여러 행/열의 데이터를 보기 좋게 출력할 수 있습니다. 열 이름과 데이터를 넘기기만 하면 Laravel이 자동으로 크기를 계산해줍니다:

```php
use App\Models\User;

$this->table(
    ['이름', '이메일'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="progress-bars"></a>
#### 진행 바

작업이 오래 걸릴 경우 진행 상황을 보여주면 유용합니다. `withProgressBar` 메서드를 사용하면 Laravel이 iterable 항목을 순회하며 자동으로 진행 바를 표시합니다:

```php
use App\Models\User;

$users = $this->withProgressBar(User::all(), function (User $user) {
    $this->performTask($user);
});
```

직접 진행률을 제어하려면 먼저 전체 스텝 수를 정의한 뒤 각 단계에서 수동으로 `advance` 메서드를 호출하세요:

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
> 고급 설정은 [Symfony Progress Bar 문서](https://symfony.com/doc/current/components/console/helpers/progressbar.html)를 참고하세요.

<a name="registering-commands"></a>
## 명령어 등록하기

Laravel은 기본적으로 `app/Console/Commands` 디렉토리 내의 모든 명령어를 자동으로 등록합니다. 하지만 `bootstrap/app.php` 파일에서 `withCommands` 메서드를 사용해 다른 디렉토리도 스캔하도록 지정할 수 있습니다:

```php
->withCommands([
    __DIR__.'/../app/Domain/Orders/Commands',
])
```
명령어를 수동으로 등록해야 할 경우, `withCommands` 메서드에 명령어 클래스 이름을 직접 제공할 수 있습니다:

```php
use App\Domain\Orders\Commands\SendEmails;

->withCommands([
    SendEmails::class,
])
```

Artisan이 부팅될 때, 애플리케이션의 모든 명령어는 [서비스 컨테이너](/docs/{{version}}/container)에 의해 해석되고 Artisan에 등록됩니다.

<a name="programmatically-executing-commands"></a>
## 명령어를 프로그래밍 방식으로 실행하기

CLI 외부에서 Artisan 명령어를 실행하고 싶을 때가 있습니다. 예를 들어, 라우트나 컨트롤러에서 Artisan 명령어를 실행할 수 있습니다. 이때 `Artisan` 파사드의 `call` 메서드를 사용할 수 있습니다. 첫 번째 인자로 명령어 이름(시그니처 또는 클래스명)을, 두 번째 인자로 명령어 인자 배열을 전달합니다. 이 메서드는 종료 코드를 반환합니다:

```php
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function (string $user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

또는 명령어 전체를 문자열로 전달할 수도 있습니다:

```php
Artisan::call('mail:send 1 --queue=default');
```

<a name="passing-array-values"></a>
#### 배열 값 전달하기

명령어에서 배열 옵션을 정의한 경우, 배열 형태로 값을 전달할 수 있습니다:

```php
use Illuminate\Support\Facades\Artisan;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
```

<a name="passing-boolean-values"></a>
#### 불리언 값 전달하기

문자열이 아닌 불리언 값을 사용하는 옵션(예: `--force`)은 `true` 또는 `false`로 전달해야 합니다:

```php
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a name="queueing-artisan-commands"></a>
#### Artisan 명령어 큐잉 처리

`Artisan` 파사드의 `queue` 메서드를 사용하면 Artisan 명령어를 백그라운드 큐 워커에서 처리하도록 큐에 넣을 수 있습니다. 이 기능을 사용하려면 큐 설정을 마친 뒤 워커를 실행하고 있어야 합니다:

```php
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function (string $user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

또한 `onConnection` 및 `onQueue` 메서드를 통해 연결 및 큐 이름을 지정할 수 있습니다:

```php
Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

<a name="calling-commands-from-other-commands"></a>
### 명령어 내부에서 다른 명령어 호출하기

기존 Artisan 명령어 내부에서 다른 명령어를 호출하고 싶을 때는 `call` 메서드를 사용할 수 있습니다. 첫 번째 인자로 명령어 이름, 두 번째 인자로 인자 배열을 전달합니다:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $this->call('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    // ...
}
```

다른 명령어를 호출하면서 모든 출력을 숨기고 싶다면 `callSilently` 메서드를 사용할 수 있습니다. 인자 구조는 `call`과 동일합니다:

```php
$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
```

<a name="signal-handling"></a>
## 시그널 처리

운영 체제는 실행 중인 프로세스에 시그널을 보낼 수 있습니다. 예를 들어 `SIGTERM` 시그널은 프로그램을 종료하라는 요청입니다. Artisan 명령어에서 이런 시그널을 감지하고 동작을 정의하고 싶다면 `trap` 메서드를 사용할 수 있습니다:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $this->trap(SIGTERM, fn () => $this->shouldKeepRunning = false);

    while ($this->shouldKeepRunning) {
        // ...
    }
}
```

여러 개의 시그널을 동시에 감지하려면 배열로 전달할 수 있습니다:

```php
$this->trap([SIGTERM, SIGQUIT], function (int $signal) {
    $this->shouldKeepRunning = false;

    dump($signal); // SIGTERM / SIGQUIT
});
```

<a name="stub-customization"></a>
## 스텁 커스터마이징

Artisan의 `make` 명령어들은 컨트롤러, 잡, 마이그레이션, 테스트 등 다양한 클래스를 생성합니다. 이들은 스텁(stub) 파일을 기반으로 생성됩니다. 스텁 파일을 커스터마이징하려면 다음 명령어로 스텁을 퍼블리시하세요:

```shell
php artisan stub:publish
```

퍼블리시된 스텁 파일은 애플리케이션 루트의 `stubs` 디렉토리에 위치합니다. 이후 `make` 명령어로 생성되는 클래스는 이 커스터마이징된 스텁을 사용합니다.

<a name="events"></a>
## 이벤트

Artisan은 명령어 실행 시 총 3개의 이벤트를 발생시킵니다:

- `Illuminate\Console\Events\ArtisanStarting`
- `Illuminate\Console\Events\CommandStarting`
- `Illuminate\Console\Events\CommandFinished`

`ArtisanStarting`은 Artisan이 실행될 때 즉시 발생하고, `CommandStarting`은 명령어 실행 직전에, `CommandFinished`는 실행 완료 후 발생합니다.
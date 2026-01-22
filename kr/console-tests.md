# 콘솔 테스트(Console Tests)

- [소개](#introduction)
- [성공 / 실패 예상](#success-failure-expectations)
- [입력 / 출력 예상](#input-output-expectations)
- [콘솔 이벤트](#console-events)

<a name="introduction"></a>
## 소개

HTTP 테스트를 간소화하는 것 외에도, Laravel은 애플리케이션의 [커스텀 콘솔 명령어](/docs/{{version}}/artisan)를 테스트하기 위한 간단한 API를 제공합니다.

<a name="success-failure-expectations"></a>
## 성공 / 실패 예상

시작하기 위해, Artisan 명령어의 종료 코드(exit code)에 대한 어설션(assertion)을 만드는 방법을 살펴보겠습니다. 이를 위해 테스트에서 `artisan` 메서드를 사용하여 Artisan 명령어를 호출합니다. 그런 다음 `assertExitCode` 메서드를 사용하여 명령어가 주어진 종료 코드로 완료되었음을 어설션합니다.

```php tab=Pest
test('console command', function () {
    $this->artisan('inspire')->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * 콘솔 명령어를 테스트합니다.
 */
public function test_console_command(): void
{
    $this->artisan('inspire')->assertExitCode(0);
}
```

`assertNotExitCode` 메서드를 사용하여 명령어가 주어진 종료 코드로 종료되지 않았음을 어설션할 수 있습니다.

```php
$this->artisan('inspire')->assertNotExitCode(1);
```

물론, 모든 터미널 명령어는 일반적으로 성공 시 상태 코드 `0`으로 종료되고, 실패 시 0이 아닌 종료 코드로 종료됩니다. 따라서 편의를 위해 `assertSuccessful`과 `assertFailed` 어설션을 활용하여 주어진 명령어가 성공적인 종료 코드로 종료되었는지 여부를 어설션할 수 있습니다.

```php
$this->artisan('inspire')->assertSuccessful();

$this->artisan('inspire')->assertFailed();
```

<a name="input-output-expectations"></a>
## 입력 / 출력 예상

Laravel을 사용하면 `expectsQuestion` 메서드를 통해 콘솔 명령어에 대한 사용자 입력을 쉽게 "모킹(mock)"할 수 있습니다. 또한 `assertExitCode`와 `expectsOutput` 메서드를 사용하여 콘솔 명령어가 출력할 것으로 예상되는 종료 코드와 텍스트를 지정할 수 있습니다. 예를 들어, 다음 콘솔 명령어를 살펴보세요.

```php
Artisan::command('question', function () {
    $name = $this->ask('What is your name?');

    $language = $this->choice('Which language do you prefer?', [
        'PHP',
        'Ruby',
        'Python',
    ]);

    $this->line('Your name is '.$name.' and you prefer '.$language.'.');
});
```

다음 테스트로 이 명령어를 테스트할 수 있습니다.

```php tab=Pest
test('console command', function () {
    $this->artisan('question')
        ->expectsQuestion('What is your name?', 'Taylor Otwell')
        ->expectsQuestion('Which language do you prefer?', 'PHP')
        ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
        ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * 콘솔 명령어를 테스트합니다.
 */
public function test_console_command(): void
{
    $this->artisan('question')
        ->expectsQuestion('What is your name?', 'Taylor Otwell')
        ->expectsQuestion('Which language do you prefer?', 'PHP')
        ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
        ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
        ->assertExitCode(0);
}
```

[Laravel Prompts](/docs/{{version}}/prompts)에서 제공하는 `search` 또는 `multisearch` 함수를 사용하는 경우, `expectsSearch` 어설션을 사용하여 사용자의 입력, 검색 결과 및 선택을 모킹할 수 있습니다.

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->expectsSearch('What is your name?', search: 'Tay', answers: [
            'Taylor Otwell',
            'Taylor Swift',
            'Darian Taylor'
        ], answer: 'Taylor Otwell')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * 콘솔 명령어를 테스트합니다.
 */
public function test_console_command(): void
{
    $this->artisan('example')
        ->expectsSearch('What is your name?', search: 'Tay', answers: [
            'Taylor Otwell',
            'Taylor Swift',
            'Darian Taylor'
        ], answer: 'Taylor Otwell')
        ->assertExitCode(0);
}
```

`doesntExpectOutput` 메서드를 사용하여 콘솔 명령어가 어떤 출력도 생성하지 않음을 어설션할 수도 있습니다.

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->doesntExpectOutput()
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * 콘솔 명령어를 테스트합니다.
 */
public function test_console_command(): void
{
    $this->artisan('example')
        ->doesntExpectOutput()
        ->assertExitCode(0);
}
```

`expectsOutputToContain`과 `doesntExpectOutputToContain` 메서드를 사용하여 출력의 일부에 대한 어설션을 만들 수 있습니다.

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->expectsOutputToContain('Taylor')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * 콘솔 명령어를 테스트합니다.
 */
public function test_console_command(): void
{
    $this->artisan('example')
        ->expectsOutputToContain('Taylor')
        ->assertExitCode(0);
}
```

<a name="confirmation-expectations"></a>
#### 확인 예상

"yes" 또는 "no" 응답 형태의 확인을 기대하는 명령어를 작성할 때 `expectsConfirmation` 메서드를 활용할 수 있습니다.

```php
$this->artisan('module:import')
    ->expectsConfirmation('Do you really wish to run this command?', 'no')
    ->assertExitCode(1);
```

<a name="table-expectations"></a>
#### 테이블 예상

명령어가 Artisan의 `table` 메서드를 사용하여 정보 테이블을 표시하는 경우, 전체 테이블에 대한 출력 예상을 작성하는 것은 번거로울 수 있습니다. 대신 `expectsTable` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인수로 테이블의 헤더를, 두 번째 인수로 테이블의 데이터를 받습니다.

```php
$this->artisan('users:all')
    ->expectsTable([
        'ID',
        'Email',
    ], [
        [1, 'taylor@example.com'],
        [2, 'abigail@example.com'],
    ]);
```

<a name="console-events"></a>
## 콘솔 이벤트

기본적으로 애플리케이션의 테스트를 실행하는 동안 `Illuminate\Console\Events\CommandStarting`과 `Illuminate\Console\Events\CommandFinished` 이벤트는 디스패치되지 않습니다. 그러나 클래스에 `Illuminate\Foundation\Testing\WithConsoleEvents` 트레이트를 추가하여 특정 테스트 클래스에서 이러한 이벤트를 활성화할 수 있습니다.

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\WithConsoleEvents;

uses(WithConsoleEvents::class);

// ...
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\WithConsoleEvents;
use Tests\TestCase;

class ConsoleEventTest extends TestCase
{
    use WithConsoleEvents;

    // ...
}
```

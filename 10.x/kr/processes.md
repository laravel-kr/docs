# 프로세스(Processes)

- [소개](#introduction)
- [프로세스 호출](#invoking-processes)
    - [프로세스 옵션](#process-options)
    - [프로세스 출력](#process-output)
    - [파이프라인](#process-pipelines)
- [비동기 프로세스](#asynchronous-processes)
    - [프로세스 ID와 시그널](#process-ids-and-signals)
    - [비동기 프로세스 출력](#asynchronous-process-output)
- [동시 프로세스](#concurrent-processes)
    - [풀 프로세스 이름 지정](#naming-pool-processes)
    - [풀 프로세스 ID와 시그널](#pool-process-ids-and-signals)
- [테스트](#testing)
    - [프로세스 페이킹](#faking-processes)
    - [특정 프로세스 페이킹](#faking-specific-processes)
    - [프로세스 시퀀스 페이킹](#faking-process-sequences)
    - [비동기 프로세스 라이프사이클 페이킹](#faking-asynchronous-process-lifecycles)
    - [사용 가능한 Assertion](#available-assertions)
    - [스트레이 프로세스 방지](#preventing-stray-processes)

<a name="introduction"></a>
## 소개

Laravel은 [Symfony Process 컴포넌트](https://symfony.com/doc/current/components/process.html)를 기반으로 표현력이 풍부하고 간결한 API를 제공하여, Laravel 애플리케이션에서 외부 프로세스를 편리하게 호출할 수 있도록 합니다. Laravel의 프로세스 기능은 가장 일반적인 사용 사례와 훌륭한 개발자 경험에 초점을 맞추고 있습니다.

<a name="invoking-processes"></a>
## 프로세스 호출

프로세스를 호출하려면 `Process` 파사드가 제공하는 `run` 및 `start` 메서드를 사용할 수 있습니다. `run` 메서드는 프로세스를 호출하고 프로세스 실행이 완료될 때까지 기다리며, `start` 메서드는 비동기 프로세스 실행에 사용됩니다. 이 문서에서 두 가지 접근 방식을 모두 살펴보겠습니다. 먼저 기본적인 동기 프로세스를 호출하고 그 결과를 확인하는 방법을 살펴보겠습니다.

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return $result->output();
```

물론, `run` 메서드가 반환하는 `Illuminate\Contracts\Process\ProcessResult` 인스턴스는 프로세스 결과를 확인하는 데 사용할 수 있는 다양한 유용한 메서드를 제공합니다.

```php
$result = Process::run('ls -la');

$result->successful();
$result->failed();
$result->exitCode();
$result->output();
$result->errorOutput();
```

<a name="throwing-exceptions"></a>
#### 예외 던지기

프로세스 결과가 있고 종료 코드가 0보다 클 경우(즉, 실패를 나타내는 경우) `Illuminate\Process\Exceptions\ProcessFailedException` 인스턴스를 던지고 싶다면, `throw` 및 `throwIf` 메서드를 사용할 수 있습니다. 프로세스가 실패하지 않은 경우 프로세스 결과 인스턴스가 반환됩니다.

```php
$result = Process::run('ls -la')->throw();

$result = Process::run('ls -la')->throwIf($condition);
```

<a name="process-options"></a>
### 프로세스 옵션

물론, 프로세스를 호출하기 전에 그 동작을 커스터마이징해야 할 수도 있습니다. 다행히 Laravel은 작업 디렉토리, 타임아웃, 환경 변수 등 다양한 프로세스 기능을 조정할 수 있도록 해줍니다.

<a name="working-directory-path"></a>
#### 작업 디렉토리 경로

프로세스의 작업 디렉토리를 지정하려면 `path` 메서드를 사용할 수 있습니다. 이 메서드가 호출되지 않으면, 프로세스는 현재 실행 중인 PHP 스크립트의 작업 디렉토리를 상속합니다.

```php
$result = Process::path(__DIR__)->run('ls -la');
```

<a name="input"></a>
#### 입력

`input` 메서드를 사용하여 프로세스의 "표준 입력"을 통해 입력을 제공할 수 있습니다.

```php
$result = Process::input('Hello World')->run('cat');
```

<a name="timeouts"></a>
#### 타임아웃

기본적으로 프로세스는 60초 이상 실행되면 `Illuminate\Process\Exceptions\ProcessTimedOutException` 인스턴스를 던집니다. 하지만 `timeout` 메서드를 통해 이 동작을 커스터마이징할 수 있습니다.

```php
$result = Process::timeout(120)->run('bash import.sh');
```

또는 프로세스 타임아웃을 완전히 비활성화하려면 `forever` 메서드를 호출할 수 있습니다.

```php
$result = Process::forever()->run('bash import.sh');
```

`idleTimeout` 메서드는 프로세스가 출력을 반환하지 않고 실행할 수 있는 최대 시간(초)을 지정하는 데 사용할 수 있습니다.

```php
$result = Process::timeout(60)->idleTimeout(30)->run('bash import.sh');
```

<a name="environment-variables"></a>
#### 환경 변수

환경 변수는 `env` 메서드를 통해 프로세스에 제공할 수 있습니다. 호출된 프로세스는 시스템에 정의된 모든 환경 변수도 상속합니다.

```php
$result = Process::forever()
    ->env(['IMPORT_PATH' => __DIR__])
    ->run('bash import.sh');
```

호출된 프로세스에서 상속된 환경 변수를 제거하려면, 해당 환경 변수에 `false` 값을 제공하면 됩니다.

```php
$result = Process::forever()
    ->env(['LOAD_PATH' => false])
    ->run('bash import.sh');
```

<a name="tty-mode"></a>
#### TTY 모드

`tty` 메서드를 사용하여 프로세스에 TTY 모드를 활성화할 수 있습니다. TTY 모드는 프로세스의 입력과 출력을 프로그램의 입력과 출력에 연결하여, 프로세스가 Vim이나 Nano와 같은 에디터를 프로세스로 열 수 있도록 합니다.

```php
Process::forever()->tty()->run('vim');
```

<a name="process-output"></a>
### 프로세스 출력

앞서 논의한 대로, 프로세스 출력은 프로세스 결과의 `output`(stdout) 및 `errorOutput`(stderr) 메서드를 사용하여 접근할 수 있습니다.

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

echo $result->output();
echo $result->errorOutput();
```

그러나 `run` 메서드의 두 번째 인수로 클로저를 전달하여 실시간으로 출력을 수집할 수도 있습니다. 클로저는 두 개의 인수를 받습니다: 출력의 "유형"(`stdout` 또는 `stderr`)과 출력 문자열 자체입니다.

```php
$result = Process::run('ls -la', function (string $type, string $output) {
    echo $output;
});
```

Laravel은 또한 프로세스 출력에 특정 문자열이 포함되어 있는지 확인하는 편리한 방법으로 `seeInOutput` 및 `seeInErrorOutput` 메서드를 제공합니다.

```php
if (Process::run('ls -la')->seeInOutput('laravel')) {
    // ...
}
```

<a name="disabling-process-output"></a>
#### 프로세스 출력 비활성화

프로세스가 관심 없는 대량의 출력을 작성하는 경우, 출력 검색을 완전히 비활성화하여 메모리를 절약할 수 있습니다. 이를 위해 프로세스를 구성할 때 `quietly` 메서드를 호출하면 됩니다.

```php
use Illuminate\Support\Facades\Process;

$result = Process::quietly()->run('bash import.sh');
```

<a name="process-pipelines"></a>
### 파이프라인

때로는 한 프로세스의 출력을 다른 프로세스의 입력으로 만들고 싶을 수 있습니다. 이것은 흔히 프로세스의 출력을 다른 프로세스로 "파이핑"한다고 합니다. `Process` 파사드가 제공하는 `pipe` 메서드를 사용하면 이를 쉽게 구현할 수 있습니다. `pipe` 메서드는 파이프된 프로세스를 동기적으로 실행하고 파이프라인의 마지막 프로세스에 대한 프로세스 결과를 반환합니다.

```php
use Illuminate\Process\Pipe;
use Illuminate\Support\Facades\Process;

$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
});

if ($result->successful()) {
    // ...
}
```

파이프라인을 구성하는 개별 프로세스를 커스터마이징할 필요가 없다면, 단순히 명령 문자열 배열을 `pipe` 메서드에 전달할 수 있습니다.

```php
$result = Process::pipe([
    'cat example.txt',
    'grep -i "laravel"',
]);
```

프로세스 출력은 `pipe` 메서드의 두 번째 인수로 클로저를 전달하여 실시간으로 수집할 수 있습니다. 클로저는 두 개의 인수를 받습니다: 출력의 "유형"(`stdout` 또는 `stderr`)과 출력 문자열 자체입니다.

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
}, function (string $type, string $output) {
    echo $output;
});
```

Laravel은 또한 `as` 메서드를 통해 파이프라인 내의 각 프로세스에 문자열 키를 할당할 수 있도록 합니다. 이 키는 `pipe` 메서드에 제공된 출력 클로저에도 전달되어, 출력이 어떤 프로세스에 속하는지 확인할 수 있습니다.

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->as('first')->command('cat example.txt');
    $pipe->as('second')->command('grep -i "laravel"');
})->start(function (string $type, string $output, string $key) {
    // ...
});
```

<a name="asynchronous-processes"></a>
## 비동기 프로세스

`run` 메서드가 프로세스를 동기적으로 호출하는 반면, `start` 메서드는 프로세스를 비동기적으로 호출하는 데 사용할 수 있습니다. 이를 통해 애플리케이션이 프로세스가 백그라운드에서 실행되는 동안 다른 작업을 계속 수행할 수 있습니다. 프로세스가 호출된 후, `running` 메서드를 사용하여 프로세스가 여전히 실행 중인지 확인할 수 있습니다.

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    // ...
}

$result = $process->wait();
```

눈치채셨겠지만, `wait` 메서드를 호출하여 프로세스 실행이 완료될 때까지 기다리고 프로세스 결과 인스턴스를 검색할 수 있습니다.

```php
$process = Process::timeout(120)->start('bash import.sh');

// ...

$result = $process->wait();
```

<a name="process-ids-and-signals"></a>
### 프로세스 ID와 시그널

`id` 메서드를 사용하여 실행 중인 프로세스에 운영 체제가 할당한 프로세스 ID를 검색할 수 있습니다.

```php
$process = Process::start('bash import.sh');

return $process->id();
```

`signal` 메서드를 사용하여 실행 중인 프로세스에 "시그널"을 보낼 수 있습니다. 사전 정의된 시그널 상수 목록은 [PHP 문서](https://www.php.net/manual/en/pcntl.constants.php)에서 찾을 수 있습니다.

```php
$process->signal(SIGUSR2);
```

<a name="asynchronous-process-output"></a>
### 비동기 프로세스 출력

비동기 프로세스가 실행되는 동안 `output` 및 `errorOutput` 메서드를 사용하여 현재까지의 전체 출력에 접근할 수 있습니다. 그러나 `latestOutput` 및 `latestErrorOutput`을 사용하면 마지막으로 출력을 검색한 이후에 발생한 프로세스 출력에 접근할 수 있습니다.

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    echo $process->latestOutput();
    echo $process->latestErrorOutput();

    sleep(1);
}
```

`run` 메서드와 마찬가지로, `start` 메서드의 두 번째 인수로 클로저를 전달하여 비동기 프로세스에서도 실시간으로 출력을 수집할 수 있습니다. 클로저는 두 개의 인수를 받습니다: 출력의 "유형"(`stdout` 또는 `stderr`)과 출력 문자열 자체입니다.

```php
$process = Process::start('bash import.sh', function (string $type, string $output) {
    echo $output;
});

$result = $process->wait();
```

<a name="concurrent-processes"></a>
## 동시 프로세스

Laravel은 동시에 비동기 프로세스 풀을 관리하는 것도 매우 쉽게 만들어, 여러 작업을 동시에 쉽게 실행할 수 있도록 합니다. 시작하려면 `Illuminate\Process\Pool` 인스턴스를 받는 클로저를 인수로 받는 `pool` 메서드를 호출하세요.

이 클로저 내에서 풀에 속하는 프로세스를 정의할 수 있습니다. `start` 메서드를 통해 프로세스 풀이 시작되면, `running` 메서드를 통해 실행 중인 프로세스의 [컬렉션](/docs/{{version}}/collections)에 접근할 수 있습니다.

```php
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Process;

$pool = Process::pool(function (Pool $pool) {
    $pool->path(__DIR__)->command('bash import-1.sh');
    $pool->path(__DIR__)->command('bash import-2.sh');
    $pool->path(__DIR__)->command('bash import-3.sh');
})->start(function (string $type, string $output, int $key) {
    // ...
});

while ($pool->running()->isNotEmpty()) {
    // ...
}

$results = $pool->wait();
```

보시다시피, `wait` 메서드를 통해 모든 풀 프로세스가 실행을 완료하고 그 결과를 해결할 때까지 기다릴 수 있습니다. `wait` 메서드는 풀의 각 프로세스에 대한 프로세스 결과 인스턴스에 키로 접근할 수 있는 배열 접근 가능 객체를 반환합니다.

```php
$results = $pool->wait();

echo $results[0]->output();
```

또는 편의를 위해, `concurrently` 메서드를 사용하여 비동기 프로세스 풀을 시작하고 즉시 그 결과를 기다릴 수 있습니다. PHP의 배열 구조 분해 기능과 결합하면 특히 표현력 있는 구문을 제공합니다.

```php
[$first, $second, $third] = Process::concurrently(function (Pool $pool) {
    $pool->path(__DIR__)->command('ls -la');
    $pool->path(app_path())->command('ls -la');
    $pool->path(storage_path())->command('ls -la');
});

echo $first->output();
```

<a name="naming-pool-processes"></a>
### 풀 프로세스 이름 지정

숫자 키를 통해 프로세스 풀 결과에 접근하는 것은 표현력이 떨어집니다. 따라서 Laravel은 `as` 메서드를 통해 풀 내의 각 프로세스에 문자열 키를 할당할 수 있도록 합니다. 이 키는 `start` 메서드에 제공된 클로저에도 전달되어, 출력이 어떤 프로세스에 속하는지 확인할 수 있습니다.

```php
$pool = Process::pool(function (Pool $pool) {
    $pool->as('first')->command('bash import-1.sh');
    $pool->as('second')->command('bash import-2.sh');
    $pool->as('third')->command('bash import-3.sh');
})->start(function (string $type, string $output, string $key) {
    // ...
});

$results = $pool->wait();

return $results['first']->output();
```

<a name="pool-process-ids-and-signals"></a>
### 풀 프로세스 ID와 시그널

프로세스 풀의 `running` 메서드는 풀 내의 호출된 모든 프로세스 컬렉션을 제공하므로, 기본 풀 프로세스 ID에 쉽게 접근할 수 있습니다.

```php
$processIds = $pool->running()->each->id();
```

그리고 편의를 위해, 프로세스 풀에서 `signal` 메서드를 호출하여 풀 내의 모든 프로세스에 시그널을 보낼 수 있습니다.

```php
$pool->signal(SIGUSR2);
```

<a name="testing"></a>
## 테스트

많은 Laravel 서비스는 쉽고 표현력 있게 테스트를 작성할 수 있는 기능을 제공하며, Laravel의 프로세스 서비스도 예외가 아닙니다. `Process` 파사드의 `fake` 메서드를 사용하면 프로세스가 호출될 때 Laravel이 스텁/더미 결과를 반환하도록 지시할 수 있습니다.

<a name="faking-processes"></a>
### 프로세스 페이킹

Laravel의 프로세스 페이킹 기능을 살펴보기 위해, 프로세스를 호출하는 라우트를 상상해 보겠습니다.

```php
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    Process::run('bash import.sh');

    return 'Import complete!';
});
```

이 라우트를 테스트할 때, `Process` 파사드에서 인수 없이 `fake` 메서드를 호출하여 Laravel이 모든 호출된 프로세스에 대해 가짜 성공 프로세스 결과를 반환하도록 지시할 수 있습니다. 또한 특정 프로세스가 "실행"되었는지 [assert](#available-assertions)할 수도 있습니다.

```php
<?php

namespace Tests\Feature;

use Illuminate\Process\PendingProcess;
use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_process_is_invoked(): void
    {
        Process::fake();

        $response = $this->get('/import');

        // 간단한 프로세스 assertion...
        Process::assertRan('bash import.sh');

        // 또는 프로세스 구성 검사...
        Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
            return $process->command === 'bash import.sh' &&
                   $process->timeout === 60;
        });
    }
}
```

논의한 대로, `Process` 파사드에서 `fake` 메서드를 호출하면 Laravel이 항상 출력이 없는 성공 프로세스 결과를 반환하도록 지시합니다. 그러나 `Process` 파사드의 `result` 메서드를 사용하여 페이킹된 프로세스의 출력과 종료 코드를 쉽게 지정할 수 있습니다.

```php
Process::fake([
    '*' => Process::result(
        output: 'Test output',
        errorOutput: 'Test error output',
        exitCode: 1,
    ),
]);
```

<a name="faking-specific-processes"></a>
### 특정 프로세스 페이킹

이전 예제에서 눈치채셨겠지만, `Process` 파사드를 사용하면 `fake` 메서드에 배열을 전달하여 프로세스별로 다른 가짜 결과를 지정할 수 있습니다.

배열의 키는 페이킹하려는 명령 패턴과 관련 결과를 나타내야 합니다. `*` 문자는 와일드카드 문자로 사용할 수 있습니다. 페이킹되지 않은 프로세스 명령은 실제로 호출됩니다. `Process` 파사드의 `result` 메서드를 사용하여 이러한 명령에 대한 스텁/가짜 결과를 구성할 수 있습니다.

```php
Process::fake([
    'cat *' => Process::result(
        output: 'Test "cat" output',
    ),
    'ls *' => Process::result(
        output: 'Test "ls" output',
    ),
]);
```

페이킹된 프로세스의 종료 코드나 오류 출력을 커스터마이징할 필요가 없다면, 가짜 프로세스 결과를 간단한 문자열로 지정하는 것이 더 편리할 수 있습니다.

```php
Process::fake([
    'cat *' => 'Test "cat" output',
    'ls *' => 'Test "ls" output',
]);
```

<a name="faking-process-sequences"></a>
### 프로세스 시퀀스 페이킹

테스트하는 코드가 동일한 명령으로 여러 프로세스를 호출하는 경우, 각 프로세스 호출에 다른 가짜 프로세스 결과를 할당하고 싶을 수 있습니다. `Process` 파사드의 `sequence` 메서드를 통해 이를 수행할 수 있습니다.

```php
Process::fake([
    'ls *' => Process::sequence()
        ->push(Process::result('First invocation'))
        ->push(Process::result('Second invocation')),
]);
```

<a name="faking-asynchronous-process-lifecycles"></a>
### 비동기 프로세스 라이프사이클 페이킹

지금까지 주로 `run` 메서드를 사용하여 동기적으로 호출되는 프로세스 페이킹에 대해 논의했습니다. 그러나 `start`를 통해 호출된 비동기 프로세스와 상호 작용하는 코드를 테스트하려는 경우, 가짜 프로세스를 설명하는 데 더 정교한 접근 방식이 필요할 수 있습니다.

예를 들어, 비동기 프로세스와 상호 작용하는 다음 라우트를 상상해 보겠습니다.

```php
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    $process = Process::start('bash import.sh');

    while ($process->running()) {
        Log::info($process->latestOutput());
        Log::info($process->latestErrorOutput());
    }

    return 'Done';
});
```

이 프로세스를 적절히 페이킹하려면, `running` 메서드가 몇 번 `true`를 반환해야 하는지 설명할 수 있어야 합니다. 또한 순차적으로 반환되어야 하는 여러 줄의 출력을 지정하고 싶을 수도 있습니다. 이를 위해 `Process` 파사드의 `describe` 메서드를 사용할 수 있습니다.

```php
Process::fake([
    'bash import.sh' => Process::describe()
        ->output('First line of standard output')
        ->errorOutput('First line of error output')
        ->output('Second line of standard output')
        ->exitCode(0)
        ->iterations(3),
]);
```

위의 예제를 자세히 살펴보겠습니다. `output` 및 `errorOutput` 메서드를 사용하여 순차적으로 반환될 여러 줄의 출력을 지정할 수 있습니다. `exitCode` 메서드는 가짜 프로세스의 최종 종료 코드를 지정하는 데 사용할 수 있습니다. 마지막으로, `iterations` 메서드는 `running` 메서드가 몇 번 `true`를 반환해야 하는지 지정하는 데 사용할 수 있습니다.

<a name="available-assertions"></a>
### 사용 가능한 Assertion

[앞서 논의한](#faking-processes) 대로, Laravel은 기능 테스트를 위한 여러 프로세스 assertion을 제공합니다. 아래에서 각 assertion에 대해 설명하겠습니다.

<a name="assert-process-ran"></a>
#### assertRan

특정 프로세스가 호출되었는지 assert합니다.

```php
use Illuminate\Support\Facades\Process;

Process::assertRan('ls -la');
```

`assertRan` 메서드는 프로세스 인스턴스와 프로세스 결과를 받는 클로저도 허용하여, 프로세스의 구성된 옵션을 검사할 수 있습니다. 이 클로저가 `true`를 반환하면 assertion이 "통과"합니다.

```php
Process::assertRan(fn ($process, $result) =>
    $process->command === 'ls -la' &&
    $process->path === __DIR__ &&
    $process->timeout === 60
);
```

`assertRan` 클로저에 전달되는 `$process`는 `Illuminate\Process\PendingProcess` 인스턴스이고, `$result`는 `Illuminate\Contracts\Process\ProcessResult` 인스턴스입니다.

<a name="assert-process-didnt-run"></a>
#### assertDidntRun

특정 프로세스가 호출되지 않았는지 assert합니다.

```php
use Illuminate\Support\Facades\Process;

Process::assertDidntRun('ls -la');
```

`assertRan` 메서드와 마찬가지로, `assertDidntRun` 메서드도 프로세스 인스턴스와 프로세스 결과를 받는 클로저를 허용하여, 프로세스의 구성된 옵션을 검사할 수 있습니다. 이 클로저가 `true`를 반환하면 assertion이 "실패"합니다.

```php
Process::assertDidntRun(fn (PendingProcess $process, ProcessResult $result) =>
    $process->command === 'ls -la'
);
```

<a name="assert-process-ran-times"></a>
#### assertRanTimes

특정 프로세스가 지정된 횟수만큼 호출되었는지 assert합니다.

```php
use Illuminate\Support\Facades\Process;

Process::assertRanTimes('ls -la', times: 3);
```

`assertRanTimes` 메서드도 프로세스 인스턴스와 프로세스 결과를 받는 클로저를 허용하여, 프로세스의 구성된 옵션을 검사할 수 있습니다. 이 클로저가 `true`를 반환하고 프로세스가 지정된 횟수만큼 호출되었다면 assertion이 "통과"합니다.

```php
Process::assertRanTimes(function (PendingProcess $process, ProcessResult $result) {
    return $process->command === 'ls -la';
}, times: 3);
```

<a name="preventing-stray-processes"></a>
### 스트레이 프로세스 방지

개별 테스트 또는 전체 테스트 스위트에서 호출된 모든 프로세스가 페이킹되었는지 확인하려면, `preventStrayProcesses` 메서드를 호출할 수 있습니다. 이 메서드를 호출한 후, 해당하는 가짜 결과가 없는 프로세스는 실제 프로세스를 시작하는 대신 예외를 던집니다.

    use Illuminate\Support\Facades\Process;

    Process::preventStrayProcesses();

    Process::fake([
        'ls *' => 'Test output...',
    ]);

    // 가짜 응답이 반환됩니다...
    Process::run('ls -la');

    // 예외가 발생합니다...
    Process::run('bash import.sh');

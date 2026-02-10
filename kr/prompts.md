# 프롬프트(Prompts)

- [소개](#introduction)
- [설치](#installation)
- [사용 가능한 프롬프트](#available-prompts)
    - [Text](#text)
    - [Textarea](#textarea)
    - [Number](#number)
    - [Password](#password)
    - [Confirm](#confirm)
    - [Select](#select)
    - [Multi-select](#multiselect)
    - [Suggest](#suggest)
    - [Search](#search)
    - [Multi-search](#multisearch)
    - [Pause](#pause)
- [유효성 검사 전 입력 변환](#transforming-input-before-validation)
- [폼(Forms)](#forms)
- [정보 메시지](#informational-messages)
- [테이블(Tables)](#tables)
- [스핀(Spin)](#spin)
- [프로그레스 바(Progress Bar)](#progress)
- [터미널 비우기](#clear)
- [터미널 고려 사항](#terminal-considerations)
- [지원되지 않는 환경과 폴백](#fallbacks)
- [테스팅](#testing)

<a name="introduction"></a>
## 소개

[Laravel Prompts](https://github.com/laravel/prompts)는 커맨드라인 애플리케이션에 플레이스홀더 텍스트와 유효성 검사 등 브라우저와 유사한 기능을 갖춘 아름답고 사용자 친화적인 폼을 추가하기 위한 PHP 패키지입니다.

<img src="https://laravel.com/img/docs/prompts-example.png">

Laravel Prompts는 [Artisan 콘솔 명령어](/docs/{{version}}/artisan#writing-commands)에서 사용자 입력을 받는 데 적합하지만, 모든 커맨드라인 PHP 프로젝트에서도 사용할 수 있습니다.

> [!NOTE]
> Laravel Prompts는 macOS, Linux, 그리고 WSL이 설치된 Windows를 지원합니다. 자세한 내용은 [지원되지 않는 환경과 폴백](#fallbacks) 문서를 참조하세요.

<a name="installation"></a>
## 설치

Laravel Prompts는 최신 Laravel 릴리스에 이미 포함되어 있습니다.

Laravel Prompts는 Composer 패키지 매니저를 사용하여 다른 PHP 프로젝트에도 설치할 수 있습니다.

```shell
composer require laravel/prompts
```

<a name="available-prompts"></a>
## 사용 가능한 프롬프트

<a name="text"></a>
### Text

`text` 함수는 사용자에게 주어진 질문을 표시하고, 입력을 받아 반환합니다.

```php
use function Laravel\Prompts\text;

$name = text('What is your name?');
```

플레이스홀더 텍스트, 기본값, 정보 힌트를 포함할 수도 있습니다.

```php
$name = text(
    label: 'What is your name?',
    placeholder: 'E.g. Taylor Otwell',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a name="text-required"></a>
#### 필수 값

값 입력이 필수인 경우 `required` 인자를 전달할 수 있습니다.

```php
$name = text(
    label: 'What is your name?',
    required: true
);
```

유효성 검사 메시지를 커스터마이즈하려면 문자열을 전달할 수도 있습니다.

```php
$name = text(
    label: 'What is your name?',
    required: 'Your name is required.'
);
```

<a name="text-validation"></a>
#### 추가 유효성 검사

추가적인 유효성 검사 로직을 수행하려면 `validate` 인자에 클로저를 전달할 수 있습니다.

```php
$name = text(
    label: 'What is your name?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

클로저는 입력된 값을 받아 오류 메시지를 반환하거나, 유효성 검사를 통과하면 `null`을 반환합니다.

또는 Laravel의 [유효성 검사기(validator)](/docs/{{version}}/validation)를 활용할 수 있습니다. 이렇게 하려면 `validate` 인자에 속성 이름과 원하는 유효성 검사 규칙을 포함하는 배열을 전달하세요.

```php
$name = text(
    label: 'What is your name?',
    validate: ['name' => 'required|max:255|unique:users']
);
```

<a name="textarea"></a>
### Textarea

`textarea` 함수는 사용자에게 주어진 질문을 표시하고, 여러 줄 텍스트영역을 통해 입력을 받아 반환합니다.

```php
use function Laravel\Prompts\textarea;

$story = textarea('Tell me a story.');
```

플레이스홀더 텍스트, 기본값, 정보 힌트를 포함할 수도 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    placeholder: 'This is a story about...',
    hint: 'This will be displayed on your profile.'
);
```

<a name="textarea-required"></a>
#### 필수 값

값 입력이 필수인 경우 `required` 인자를 전달할 수 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    required: true
);
```

유효성 검사 메시지를 커스터마이즈하려면 문자열을 전달할 수도 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    required: 'A story is required.'
);
```

<a name="textarea-validation"></a>
#### 추가 유효성 검사

추가적인 유효성 검사 로직을 수행하려면 `validate` 인자에 클로저를 전달할 수 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: fn (string $value) => match (true) {
        strlen($value) < 250 => 'The story must be at least 250 characters.',
        strlen($value) > 10000 => 'The story must not exceed 10,000 characters.',
        default => null
    }
);
```

클로저는 입력된 값을 받아 오류 메시지를 반환하거나, 유효성 검사를 통과하면 `null`을 반환합니다.

또는 Laravel의 [유효성 검사기(validator)](/docs/{{version}}/validation)를 활용할 수 있습니다. 이렇게 하려면 `validate` 인자에 속성 이름과 원하는 유효성 검사 규칙을 포함하는 배열을 전달하세요.

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: ['story' => 'required|max:10000']
);
```

<a name="number"></a>
### Number

`number` 함수는 주어진 질문과 함께 사용자에게 숫자 입력을 요청하고 그 값을 반환합니다. `number` 함수는 사용자가 위쪽 및 아래쪽 화살표 키를 사용하여 숫자를 조작할 수 있도록 합니다.

```php
use function Laravel\Prompts\number;

$number = number('How many copies would you like?');
```

플레이스홀더 텍스트, 기본값, 정보 힌트를 포함할 수도 있습니다.

```php
$name = number(
    label: 'How many copies would you like?',
    placeholder: '5',
    default: 1,
    hint: 'This will be determine how many copies to create.'
);
```

<a name="number-required"></a>
#### 필수 값

값을 반드시 입력하도록 요구하려면 `required` 인수를 전달하면 됩니다.

```php
$copies = number(
    label: 'How many copies would you like?',
    required: true
);
```

유효성 검사 메시지를 커스터마이즈하려면 문자열을 전달할 수도 있습니다.

```php
$copies = number(
    label: 'How many copies would you like?',
    required: 'A number of copies is required.'
);
```

<a name="number-validation"></a>
#### 추가 유효성 검사

추가적인 유효성 검사 로직을 수행하려면 `validate` 인수에 클로저를 전달할 수 있습니다.

```php
$copies = number(
    label: 'How many copies would you like?',
    validate: fn (?int $value) => match (true) {
        $value < 1 => 'At least one copy is required.',
        $value > 100 => 'You may not create more than 100 copies.',
        default => null
    }
);
```

클로저는 입력된 값을 받으며 에러 메시지를 반환하거나, 유효성 검사를 통과하면 `null`을 반환할 수 있습니다.

또한 Laravel의 [유효성 검사기](/docs/{{version}}/validation)를 활용할 수도 있습니다. 이를 위해 `validate` 인수에 속성 이름과 원하는 유효성 검사 규칙을 포함하는 배열을 전달하세요.

```php
$copies = number(
    label: 'How many copies would you like?',
    validate: ['copies' => 'required|integer|min:1|max:100']
);
```

<a name="password"></a>
### Password

`password` 함수는 `text` 함수와 유사하지만, 콘솔에서 사용자가 입력하는 내용이 마스킹됩니다. 비밀번호와 같은 민감한 정보를 요청할 때 유용합니다.

```php
use function Laravel\Prompts\password;

$password = password('What is your password?');
```

플레이스홀더 텍스트와 정보 힌트를 포함할 수도 있습니다.

```php
$password = password(
    label: 'What is your password?',
    placeholder: 'password',
    hint: 'Minimum 8 characters.'
);
```

<a name="password-required"></a>
#### 필수 값

값 입력이 필수인 경우 `required` 인자를 전달할 수 있습니다.

```php
$password = password(
    label: 'What is your password?',
    required: true
);
```

유효성 검사 메시지를 커스터마이즈하려면 문자열을 전달할 수도 있습니다.

```php
$password = password(
    label: 'What is your password?',
    required: 'The password is required.'
);
```

<a name="password-validation"></a>
#### 추가 유효성 검사

추가적인 유효성 검사 로직을 수행하려면 `validate` 인자에 클로저를 전달할 수 있습니다.

```php
$password = password(
    label: 'What is your password?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 8 => 'The password must be at least 8 characters.',
        default => null
    }
);
```

클로저는 입력된 값을 받아 오류 메시지를 반환하거나, 유효성 검사를 통과하면 `null`을 반환합니다.

또는 Laravel의 [유효성 검사기(validator)](/docs/{{version}}/validation)를 활용할 수 있습니다. 이렇게 하려면 `validate` 인자에 속성 이름과 원하는 유효성 검사 규칙을 포함하는 배열을 전달하세요.

```php
$password = password(
    label: 'What is your password?',
    validate: ['password' => 'min:8']
);
```

<a name="confirm"></a>
### Confirm

사용자에게 "예 또는 아니오" 확인이 필요한 경우 `confirm` 함수를 사용할 수 있습니다. 사용자는 화살표 키를 사용하거나 `y` 또는 `n`을 눌러 응답을 선택할 수 있습니다. 이 함수는 `true` 또는 `false`를 반환합니다.

```php
use function Laravel\Prompts\confirm;

$confirmed = confirm('Do you accept the terms?');
```

기본값, "Yes"와 "No" 라벨 커스터마이징, 정보 힌트를 포함할 수도 있습니다.

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    default: false,
    yes: 'I accept',
    no: 'I decline',
    hint: 'The terms must be accepted to continue.'
);
```

<a name="confirm-required"></a>
#### "Yes" 선택 필수

필요한 경우 `required` 인자를 전달하여 사용자가 "Yes"를 선택하도록 요구할 수 있습니다.

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: true
);
```

유효성 검사 메시지를 커스터마이즈하려면 문자열을 전달할 수도 있습니다.

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: 'You must accept the terms to continue.'
);
```

<a name="select"></a>
### Select

사용자가 미리 정의된 선택지에서 선택해야 하는 경우 `select` 함수를 사용할 수 있습니다.

```php
use function Laravel\Prompts\select;

$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner']
);
```

기본 선택값과 정보 힌트를 지정할 수도 있습니다.

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    default: 'Owner',
    hint: 'The role may be changed at any time.'
);
```

`options` 인자에 연관 배열을 전달하여 값 대신 선택된 키를 반환받을 수도 있습니다.

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    default: 'owner'
);
```

목록이 스크롤되기 전까지 최대 5개의 옵션이 표시됩니다. `scroll` 인자를 전달하여 이를 커스터마이즈할 수 있습니다.

```php
$role = select(
    label: 'Which category would you like to assign?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="select-validation"></a>
#### 추가 유효성 검사

다른 프롬프트 함수들과 달리, `select` 함수는 아무것도 선택하지 않는 것이 불가능하므로 `required` 인자를 받지 않습니다. 그러나 옵션을 표시하되 선택되지 않도록 해야 하는 경우 `validate` 인자에 클로저를 전달할 수 있습니다.

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    validate: fn (string $value) =>
        $value === 'owner' && User::where('role', 'owner')->exists()
            ? 'An owner already exists.'
            : null
);
```

`options` 인자가 연관 배열인 경우 클로저는 선택된 키를 받고, 그렇지 않으면 선택된 값을 받습니다. 클로저는 오류 메시지를 반환하거나, 유효성 검사를 통과하면 `null`을 반환합니다.

<a name="multiselect"></a>
### Multi-select

사용자가 여러 옵션을 선택할 수 있어야 하는 경우 `multiselect` 함수를 사용할 수 있습니다.

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete']
);
```

기본 선택값과 정보 힌트를 지정할 수도 있습니다.

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete'],
    default: ['Read', 'Create'],
    hint: 'Permissions may be updated at any time.'
);
```

`options` 인자에 연관 배열을 전달하여 값 대신 선택된 옵션의 키를 반환받을 수도 있습니다.

```php
$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    default: ['read', 'create']
);
```

목록이 스크롤되기 전까지 최대 5개의 옵션이 표시됩니다. `scroll` 인자를 전달하여 이를 커스터마이즈할 수 있습니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="multiselect-required"></a>
#### 값 필수 선택

기본적으로 사용자는 0개 이상의 옵션을 선택할 수 있습니다. `required` 인자를 전달하여 하나 이상의 옵션을 선택하도록 강제할 수 있습니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: true
);
```

유효성 검사 메시지를 커스터마이즈하려면 `required` 인자에 문자열을 전달할 수 있습니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: 'You must select at least one category'
);
```

<a name="multiselect-validation"></a>
#### 추가 유효성 검사

옵션을 표시하되 선택되지 않도록 해야 하는 경우 `validate` 인자에 클로저를 전달할 수 있습니다.

```php
$permissions = multiselect(
    label: 'What permissions should the user have?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    validate: fn (array $values) => ! in_array('read', $values)
        ? 'All users require the read permission.'
        : null
);
```

`options` 인자가 연관 배열인 경우 클로저는 선택된 키를 받고, 그렇지 않으면 선택된 값을 받습니다. 클로저는 오류 메시지를 반환하거나, 유효성 검사를 통과하면 `null`을 반환합니다.

<a name="suggest"></a>
### Suggest

`suggest` 함수는 가능한 선택지에 대한 자동 완성을 제공하는 데 사용할 수 있습니다. 사용자는 자동 완성 힌트와 관계없이 어떤 답변이든 입력할 수 있습니다.

```php
use function Laravel\Prompts\suggest;

$name = suggest('What is your name?', ['Taylor', 'Dayle']);
```

또는 `suggest` 함수의 두 번째 인자로 클로저를 전달할 수 있습니다. 클로저는 사용자가 입력할 때마다 호출됩니다. 클로저는 지금까지 사용자가 입력한 내용을 포함하는 문자열 파라미터를 받아 자동 완성 옵션 배열을 반환해야 합니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: fn ($value) => collect(['Taylor', 'Dayle'])
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
)
```

플레이스홀더 텍스트, 기본값, 정보 힌트를 포함할 수도 있습니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    placeholder: 'E.g. Taylor',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a name="suggest-required"></a>
#### 필수 값

값 입력이 필수인 경우 `required` 인자를 전달할 수 있습니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: true
);
```

유효성 검사 메시지를 커스터마이즈하려면 문자열을 전달할 수도 있습니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: 'Your name is required.'
);
```

<a name="suggest-validation"></a>
#### 추가 유효성 검사

추가적인 유효성 검사 로직을 수행하려면 `validate` 인자에 클로저를 전달할 수 있습니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

클로저는 입력된 값을 받아 오류 메시지를 반환하거나, 유효성 검사를 통과하면 `null`을 반환합니다.

또는 Laravel의 [유효성 검사기(validator)](/docs/{{version}}/validation)를 활용할 수 있습니다. 이렇게 하려면 `validate` 인자에 속성 이름과 원하는 유효성 검사 규칙을 포함하는 배열을 전달하세요.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: ['name' => 'required|min:3|max:255']
);
```

<a name="search"></a>
### Search

사용자가 선택할 수 있는 옵션이 많은 경우, `search` 함수를 사용하면 사용자가 검색어를 입력하여 결과를 필터링한 후 화살표 키로 옵션을 선택할 수 있습니다.

```php
use function Laravel\Prompts\search;

$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

클로저는 사용자가 지금까지 입력한 텍스트를 받아 옵션 배열을 반환해야 합니다. 연관 배열을 반환하면 선택된 옵션의 키가 반환되고, 그렇지 않으면 값이 반환됩니다.

값을 반환하려는 배열을 필터링할 때, 배열이 연관 배열이 되지 않도록 `array_values` 함수나 `values` 컬렉션 메서드를 사용해야 합니다.

```php
$names = collect(['Taylor', 'Abigail']);

$selected = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

플레이스홀더 텍스트와 정보 힌트를 포함할 수도 있습니다.

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

목록이 스크롤되기 전까지 최대 5개의 옵션이 표시됩니다. `scroll` 인자를 전달하여 이를 커스터마이즈할 수 있습니다.

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a name="search-validation"></a>
#### 추가 유효성 검사

추가적인 유효성 검사 로직을 수행하려면 `validate` 인자에 클로저를 전달할 수 있습니다.

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (int|string $value) {
        $user = User::findOrFail($value);

        if ($user->opted_out) {
            return 'This user has opted-out of receiving mail.';
        }
    }
);
```

`options` 클로저가 연관 배열을 반환하면 클로저는 선택된 키를 받고, 그렇지 않으면 선택된 값을 받습니다. 클로저는 오류 메시지를 반환하거나, 유효성 검사를 통과하면 `null`을 반환합니다.

<a name="multisearch"></a>
### Multi-search

검색 가능한 옵션이 많고 사용자가 여러 항목을 선택할 수 있어야 하는 경우, `multisearch` 함수를 사용하면 사용자가 검색어를 입력하여 결과를 필터링한 후 화살표 키와 스페이스바로 옵션을 선택할 수 있습니다.

```php
use function Laravel\Prompts\multisearch;

$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

클로저는 사용자가 지금까지 입력한 텍스트를 받아 옵션 배열을 반환해야 합니다. 연관 배열을 반환하면 선택된 옵션의 키가 반환되고, 그렇지 않으면 값이 반환됩니다.

값을 반환하려는 배열을 필터링할 때, 배열이 연관 배열이 되지 않도록 `array_values` 함수나 `values` 컬렉션 메서드를 사용해야 합니다.

```php
$names = collect(['Taylor', 'Abigail']);

$selected = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

플레이스홀더 텍스트와 정보 힌트를 포함할 수도 있습니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

목록이 스크롤되기 전까지 최대 5개의 옵션이 표시됩니다. `scroll` 인자를 전달하여 이를 커스터마이즈할 수 있습니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a name="multisearch-required"></a>
#### 값 필수 선택

기본적으로 사용자는 0개 이상의 옵션을 선택할 수 있습니다. `required` 인자를 전달하여 하나 이상의 옵션을 선택하도록 강제할 수 있습니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: true
);
```

유효성 검사 메시지를 커스터마이즈하려면 `required` 인자에 문자열을 전달할 수도 있습니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: 'You must select at least one user.'
);
```

<a name="multisearch-validation"></a>
#### 추가 유효성 검사

추가적인 유효성 검사 로직을 수행하려면 `validate` 인자에 클로저를 전달할 수 있습니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (array $values) {
        $optedOut = User::whereLike('name', '%a%')->findMany($values);

        if ($optedOut->isNotEmpty()) {
            return $optedOut->pluck('name')->join(', ', ', and ').' have opted out.';
        }
    }
);
```

`options` 클로저가 연관 배열을 반환하면 클로저는 선택된 키를 받고, 그렇지 않으면 선택된 값을 받습니다. 클로저는 오류 메시지를 반환하거나, 유효성 검사를 통과하면 `null`을 반환합니다.

<a name="pause"></a>
### Pause

`pause` 함수는 사용자에게 정보 텍스트를 표시하고 Enter / Return 키를 눌러 계속 진행하도록 확인을 기다리는 데 사용할 수 있습니다.

```php
use function Laravel\Prompts\pause;

pause('Press ENTER to continue.');
```

<a name="transforming-input-before-validation"></a>
## 유효성 검사 전 입력 변환

유효성 검사가 수행되기 전에 프롬프트 입력을 변환하고 싶은 경우가 있습니다. 예를 들어, 입력된 문자열에서 공백을 제거하고 싶을 수 있습니다. 이를 위해 많은 프롬프트 함수는 클로저를 받는 `transform` 인자를 제공합니다.

```php
$name = text(
    label: 'What is your name?',
    transform: fn (string $value) => trim($value),
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

<a name="forms"></a>
## 폼(Forms)

추가 작업을 수행하기 전에 정보를 수집하기 위해 여러 프롬프트를 순차적으로 표시해야 하는 경우가 많습니다. `form` 함수를 사용하여 사용자가 완료할 수 있는 그룹화된 프롬프트 세트를 만들 수 있습니다.

```php
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true)
    ->password('What is your password?', validate: ['password' => 'min:8'])
    ->confirm('Do you accept the terms?')
    ->submit();
```

`submit` 메서드는 폼 프롬프트의 모든 응답을 포함하는 숫자 인덱스 배열을 반환합니다. 그러나 `name` 인자를 통해 각 프롬프트에 이름을 지정할 수 있습니다. 이름이 지정되면 해당 이름으로 명명된 프롬프트의 응답에 접근할 수 있습니다.

```php
use App\Models\User;
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->password(
        label: 'What is your password?',
        validate: ['password' => 'min:8'],
        name: 'password'
    )
    ->confirm('Do you accept the terms?')
    ->submit();

User::create([
    'name' => $responses['name'],
    'password' => $responses['password'],
]);
```

`form` 함수를 사용하는 주요 이점은 사용자가 `CTRL + U`를 사용하여 폼의 이전 프롬프트로 돌아갈 수 있다는 것입니다. 이를 통해 사용자는 전체 폼을 취소하고 다시 시작하지 않고도 실수를 수정하거나 선택을 변경할 수 있습니다.

폼에서 프롬프트에 대해 더 세밀한 제어가 필요한 경우, 프롬프트 함수를 직접 호출하는 대신 `add` 메서드를 호출할 수 있습니다. `add` 메서드는 사용자가 제공한 모든 이전 응답을 전달받습니다.

```php
use function Laravel\Prompts\form;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\text;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->add(function ($responses) {
        return text("How old are you, {$responses['name']}?");
    }, name: 'age')
    ->submit();

outro("Your name is {$responses['name']} and you are {$responses['age']} years old.");
```

<a name="informational-messages"></a>
## 정보 메시지

`note`, `info`, `warning`, `error`, `alert` 함수를 사용하여 정보 메시지를 표시할 수 있습니다.

```php
use function Laravel\Prompts\info;

info('Package installed successfully.');
```

<a name="tables"></a>
## 테이블(Tables)

`table` 함수를 사용하면 여러 행과 열의 데이터를 쉽게 표시할 수 있습니다. 열 이름과 테이블 데이터만 제공하면 됩니다.

```php
use function Laravel\Prompts\table;

table(
    headers: ['Name', 'Email'],
    rows: User::all(['name', 'email'])->toArray()
);
```

<a name="spin"></a>
## 스핀(Spin)

`spin` 함수는 지정된 콜백을 실행하는 동안 선택적 메시지와 함께 스피너를 표시합니다. 진행 중인 프로세스를 나타내는 역할을 하며, 완료 시 콜백의 결과를 반환합니다.

```php
use function Laravel\Prompts\spin;

$response = spin(
    callback: fn () => Http::get('http://example.com'),
    message: 'Fetching response...'
);
```

> [!WARNING]
> `spin` 함수는 스피너 애니메이션을 위해 [PCNTL](https://www.php.net/manual/en/book.pcntl.php) PHP 확장 모듈이 필요합니다. 이 확장 모듈을 사용할 수 없는 경우 정적인 버전의 스피너가 대신 표시됩니다.

<a name="progress"></a>
## 프로그레스 바(Progress Bars)

오래 걸리는 작업의 경우, 작업이 얼마나 완료되었는지 사용자에게 알려주는 프로그레스 바를 표시하는 것이 유용할 수 있습니다. `progress` 함수를 사용하면 Laravel이 프로그레스 바를 표시하고 주어진 반복 가능한 값의 각 반복마다 진행률을 업데이트합니다.

```php
use function Laravel\Prompts\progress;

$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: fn ($user) => $this->performTask($user)
);
```

`progress` 함수는 맵 함수처럼 작동하며 콜백의 각 반복에서 반환된 값을 포함하는 배열을 반환합니다.

콜백은 `Laravel\Prompts\Progress` 인스턴스도 받을 수 있어, 각 반복에서 라벨과 힌트를 수정할 수 있습니다.

```php
$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: function ($user, $progress) {
        $progress
            ->label("Updating {$user->name}")
            ->hint("Created on {$user->created_at}");

        return $this->performTask($user);
    },
    hint: 'This may take some time.'
);
```

때때로 프로그레스 바가 어떻게 진행되는지 더 수동으로 제어해야 할 수 있습니다. 먼저 프로세스가 반복할 총 단계 수를 정의합니다. 그런 다음 각 항목을 처리한 후 `advance` 메서드를 통해 프로그레스 바를 진행시킵니다.

```php
$progress = progress(label: 'Updating users', steps: 10);

$users = User::all();

$progress->start();

foreach ($users as $user) {
    $this->performTask($user);

    $progress->advance();
}

$progress->finish();
```

<a name="clear"></a>
## 터미널 비우기

`clear` 함수를 사용하여 사용자의 터미널을 비울 수 있습니다.

```php
use function Laravel\Prompts\clear;

clear();
```

<a name="terminal-considerations"></a>
## 터미널 고려 사항

<a name="terminal-width"></a>
#### 터미널 너비

라벨, 옵션, 유효성 검사 메시지의 길이가 사용자 터미널의 "열" 수를 초과하면 자동으로 맞게 잘립니다. 사용자가 좁은 터미널을 사용할 수 있으므로 이러한 문자열의 길이를 최소화하는 것이 좋습니다. 80자 터미널을 지원하기 위해 일반적으로 안전한 최대 길이는 74자입니다.

<a name="terminal-height"></a>
#### 터미널 높이

`scroll` 인자를 받는 모든 프롬프트에서, 설정된 값은 유효성 검사 메시지를 위한 공간을 포함하여 사용자 터미널의 높이에 맞게 자동으로 줄어듭니다.

<a name="fallbacks"></a>
## 지원되지 않는 환경과 폴백

Laravel Prompts는 macOS, Linux, 그리고 WSL이 설치된 Windows를 지원합니다. Windows 버전 PHP의 제한으로 인해, WSL 외부의 Windows에서는 현재 Laravel Prompts를 사용할 수 없습니다.

이러한 이유로 Laravel Prompts는 [Symfony Console Question Helper](https://symfony.com/doc/current/components/console/helpers/questionhelper.html)와 같은 대체 구현으로 폴백하는 것을 지원합니다.

> [!NOTE]
> Laravel 프레임워크와 함께 Laravel Prompts를 사용할 때, 각 프롬프트에 대한 폴백이 이미 구성되어 있으며 지원되지 않는 환경에서 자동으로 활성화됩니다.

<a name="fallback-conditions"></a>
#### 폴백 조건

Laravel을 사용하지 않거나 폴백 동작이 사용되는 시점을 커스터마이즈해야 하는 경우, `Prompt` 클래스의 `fallbackWhen` 정적 메서드에 불리언을 전달할 수 있습니다.

```php
use Laravel\Prompts\Prompt;

Prompt::fallbackWhen(
    ! $input->isInteractive() || windows_os() || app()->runningUnitTests()
);
```

<a name="fallback-behavior"></a>
#### 폴백 동작

Laravel을 사용하지 않거나 폴백 동작을 커스터마이즈해야 하는 경우, 각 프롬프트 클래스의 `fallbackUsing` 정적 메서드에 클로저를 전달할 수 있습니다.

```php
use Laravel\Prompts\TextPrompt;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;

TextPrompt::fallbackUsing(function (TextPrompt $prompt) use ($input, $output) {
    $question = (new Question($prompt->label, $prompt->default ?: null))
        ->setValidator(function ($answer) use ($prompt) {
            if ($prompt->required && $answer === null) {
                throw new \RuntimeException(
                    is_string($prompt->required) ? $prompt->required : 'Required.'
                );
            }

            if ($prompt->validate) {
                $error = ($prompt->validate)($answer ?? '');

                if ($error) {
                    throw new \RuntimeException($error);
                }
            }

            return $answer;
        });

    return (new SymfonyStyle($input, $output))
        ->askQuestion($question);
});
```

폴백은 각 프롬프트 클래스에 대해 개별적으로 구성해야 합니다. 클로저는 프롬프트 클래스의 인스턴스를 받으며 프롬프트에 적합한 타입을 반환해야 합니다.

<a name="testing"></a>
## 테스팅

Laravel은 명령어가 예상된 프롬프트(Prompt) 메시지를 표시하는지 테스트하기 위한 다양한 메서드를 제공합니다.

```php tab=Pest
test('report generation', function () {
    $this->artisan('report:generate')
        ->expectsPromptsInfo('Welcome to the application!')
        ->expectsPromptsWarning('This action cannot be undone')
        ->expectsPromptsError('Something went wrong')
        ->expectsPromptsAlert('Important notice!')
        ->expectsPromptsIntro('Starting process...')
        ->expectsPromptsOutro('Process completed!')
        ->expectsPromptsTable(
            headers: ['Name', 'Email'],
            rows: [
                ['Taylor Otwell', 'taylor@example.com'],
                ['Jason Beggs', 'jason@example.com'],
            ]
        )
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
public function test_report_generation(): void
{
    $this->artisan('report:generate')
        ->expectsPromptsInfo('Welcome to the application!')
        ->expectsPromptsWarning('This action cannot be undone')
        ->expectsPromptsError('Something went wrong')
        ->expectsPromptsAlert('Important notice!')
        ->expectsPromptsIntro('Starting process...')
        ->expectsPromptsOutro('Process completed!')
        ->expectsPromptsTable(
            headers: ['Name', 'Email'],
            rows: [
                ['Taylor Otwell', 'taylor@example.com'],
                ['Jason Beggs', 'jason@example.com'],
            ]
        )
        ->assertExitCode(0);
}
```

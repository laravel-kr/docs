# 블레이드 템플릿(Blade Templates)

- [소개](#introduction)
    - [Livewire로 블레이드 강화하기](#supercharging-blade-with-livewire)
- [데이터 표시](#displaying-data)
    - [HTML 엔티티 인코딩](#html-entity-encoding)
    - [블레이드와 자바스크립트 프레임워크](#blade-and-javascript-frameworks)
- [블레이드 지시어](#blade-directives)
    - [If 문](#if-statements)
    - [Switch 문](#switch-statements)
    - [반복문](#loops)
    - [루프 변수](#the-loop-variable)
    - [조건부 클래스](#conditional-classes)
    - [추가 속성](#additional-attributes)
    - [하위 뷰 포함하기](#including-subviews)
    - [`@once` 지시어](#the-once-directive)
    - [순수 PHP](#raw-php)
    - [주석](#comments)
- [컴포넌트](#components)
    - [컴포넌트 렌더링](#rendering-components)
    - [컴포넌트에 데이터 전달](#passing-data-to-components)
    - [컴포넌트 속성](#component-attributes)
    - [예약어](#reserved-keywords)
    - [슬롯](#slots)
    - [인라인 컴포넌트 뷰](#inline-component-views)
    - [동적 컴포넌트](#dynamic-components)
    - [수동으로 컴포넌트 등록](#manually-registering-components)
- [익명 컴포넌트](#anonymous-components)
    - [익명 인덱스 컴포넌트](#anonymous-index-components)
    - [데이터 속성 / 어트리뷰트](#data-properties-attributes)
    - [부모 데이터 접근](#accessing-parent-data)
    - [익명 컴포넌트 경로](#anonymous-component-paths)
- [레이아웃 구성](#building-layouts)
    - [컴포넌트를 이용한 레이아웃](#layouts-using-components)
    - [템플릿 상속을 이용한 레이아웃](#layouts-using-template-inheritance)
- [폼](#forms)
    - [CSRF 필드](#csrf-field)
    - [Method 필드](#method-field)
    - [유효성 검사 에러](#validation-errors)
- [스택](#stacks)
- [서비스 주입](#service-injection)
- [인라인 블레이드 템플릿 렌더링](#rendering-inline-blade-templates)
- [블레이드 프래그먼트 렌더링](#rendering-blade-fragments)
- [블레이드 확장](#extending-blade)
    - [커스텀 Echo 핸들러](#custom-echo-handlers)
    - [커스텀 If 문](#custom-if-statements)

<a name="introduction"></a>
## 소개

블레이드(Blade)는 라라벨에 포함된 간단하면서도 강력한 템플릿 엔진입니다. 일부 PHP 템플릿 엔진과 달리, 블레이드는 템플릿에서 순수 PHP 코드 사용을 제한하지 않습니다. 실제로 모든 블레이드 템플릿은 순수 PHP 코드로 컴파일되고 수정될 때까지 캐시되므로, 블레이드는 애플리케이션에 본질적으로 오버헤드를 전혀 추가하지 않습니다. 블레이드 템플릿 파일은 `.blade.php` 파일 확장자를 사용하며 일반적으로 `resources/views` 디렉토리에 저장됩니다.

블레이드 뷰는 라우트나 컨트롤러에서 전역 `view` 헬퍼를 사용하여 반환할 수 있습니다. 물론, [뷰](/docs/{{version}}/views) 문서에서 언급한 것처럼, `view` 헬퍼의 두 번째 인수를 사용하여 블레이드 뷰에 데이터를 전달할 수 있습니다.

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'Finn']);
});
```

<a name="supercharging-blade-with-livewire"></a>
### Livewire로 블레이드 강화하기

블레이드 템플릿을 한 단계 더 발전시켜 동적 인터페이스를 쉽게 구축하고 싶으신가요? [Laravel Livewire](https://livewire.laravel.com)를 확인해 보세요. Livewire를 사용하면 일반적으로 React나 Vue와 같은 프론트엔드 프레임워크를 통해서만 가능한 동적 기능이 추가된 블레이드 컴포넌트를 작성할 수 있으며, 많은 자바스크립트 프레임워크의 복잡성, 클라이언트 측 렌더링, 빌드 단계 없이 현대적이고 반응형 프론트엔드를 구축할 수 있는 훌륭한 접근 방식을 제공합니다.

<a name="displaying-data"></a>
## 데이터 표시

블레이드 뷰에 전달된 데이터는 변수를 중괄호로 감싸서 표시할 수 있습니다. 예를 들어, 다음 라우트가 있다고 가정해 봅시다.

```php
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

다음과 같이 `name` 변수의 내용을 표시할 수 있습니다.

```blade
Hello, {{ $name }}.
```

> [!NOTE]  
> 블레이드의 `{{ }}` echo 문은 XSS 공격을 방지하기 위해 PHP의 `htmlspecialchars` 함수를 통해 자동으로 전송됩니다.

뷰에 전달된 변수의 내용만 표시하는 것에 한정되지 않습니다. PHP 함수의 결과도 출력할 수 있습니다. 실제로 블레이드 echo 문 안에 원하는 모든 PHP 코드를 넣을 수 있습니다.

```blade
The current UNIX timestamp is {{ time() }}.
```

<a name="html-entity-encoding"></a>
### HTML 엔티티 인코딩

기본적으로 블레이드(및 라라벨 `e` 함수)는 HTML 엔티티를 이중 인코딩합니다. 이중 인코딩을 비활성화하려면 `AppServiceProvider`의 `boot` 메서드에서 `Blade::withoutDoubleEncoding` 메서드를 호출하세요.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Blade::withoutDoubleEncoding();
    }
}
```

<a name="displaying-unescaped-data"></a>
#### 이스케이프되지 않은 데이터 표시

기본적으로 블레이드 `{{ }}` 문은 XSS 공격을 방지하기 위해 PHP의 `htmlspecialchars` 함수를 통해 자동으로 전송됩니다. 데이터가 이스케이프되지 않기를 원한다면 다음 문법을 사용할 수 있습니다.

```blade
Hello, {!! $name !!}.
```

> [!WARNING]  
> 애플리케이션 사용자가 제공한 콘텐츠를 출력할 때는 매우 주의해야 합니다. 사용자 제공 데이터를 표시할 때 XSS 공격을 방지하기 위해 일반적으로 이스케이프된 이중 중괄호 문법을 사용해야 합니다.

<a name="blade-and-javascript-frameworks"></a>
### 블레이드와 자바스크립트 프레임워크

많은 자바스크립트 프레임워크도 주어진 표현식이 브라우저에 표시되어야 함을 나타내기 위해 "중괄호"를 사용하므로, `@` 기호를 사용하여 블레이드 렌더링 엔진에 표현식을 그대로 유지해야 함을 알릴 수 있습니다. 예를 들어:

```blade
<h1>Laravel</h1>

Hello, @{{ name }}.
```

이 예제에서 `@` 기호는 블레이드에 의해 제거됩니다. 그러나 `{{ name }}` 표현식은 블레이드 엔진에 의해 그대로 유지되어 자바스크립트 프레임워크에서 렌더링될 수 있습니다.

`@` 기호는 블레이드 지시어를 이스케이프하는 데도 사용할 수 있습니다.

```blade
{{-- 블레이드 템플릿 --}}
@@if()

<!-- HTML 출력 -->
@if()
```

<a name="rendering-json"></a>
#### JSON 렌더링

자바스크립트 변수를 초기화하기 위해 JSON으로 렌더링할 목적으로 배열을 뷰에 전달할 때가 있습니다. 예를 들어:

```blade
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

그러나 수동으로 `json_encode`를 호출하는 대신 `Illuminate\Support\Js::from` 메서드를 사용할 수 있습니다. `from` 메서드는 PHP의 `json_encode` 함수와 동일한 인수를 받지만, 결과 JSON이 HTML 따옴표 내에 포함되도록 적절하게 이스케이프됩니다. `from` 메서드는 주어진 객체나 배열을 유효한 자바스크립트 객체로 변환하는 `JSON.parse` 자바스크립트 문을 문자열로 반환합니다.

```blade
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

최신 버전의 라라벨 애플리케이션 스켈레톤에는 `Js` 파사드가 포함되어 있어 블레이드 템플릿 내에서 이 기능에 편리하게 접근할 수 있습니다.

```blade
<script>
    var app = {{ Js::from($array) }};
</script>
```

> [!WARNING]  
> 기존 변수를 JSON으로 렌더링할 때만 `Js::from` 메서드를 사용해야 합니다. 블레이드 템플릿은 정규 표현식을 기반으로 하며, 지시어에 복잡한 표현식을 전달하려고 하면 예기치 않은 실패가 발생할 수 있습니다.

<a name="the-at-verbatim-directive"></a>
#### `@verbatim` 지시어

템플릿의 많은 부분에서 자바스크립트 변수를 표시하는 경우, HTML을 `@verbatim` 지시어로 감싸서 각 블레이드 echo 문 앞에 `@` 기호를 붙일 필요가 없습니다.

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

<a name="blade-directives"></a>
## 블레이드 지시어

템플릿 상속과 데이터 표시 외에도, 블레이드는 조건문과 반복문 같은 일반적인 PHP 제어 구조에 대한 편리한 단축키를 제공합니다. 이러한 단축키는 PHP 제어 구조와 친숙함을 유지하면서 매우 깨끗하고 간결한 방법으로 작업할 수 있게 해줍니다.

<a name="if-statements"></a>
### If 문

`@if`, `@elseif`, `@else`, `@endif` 지시어를 사용하여 `if` 문을 구성할 수 있습니다. 이 지시어들은 PHP의 대응되는 것과 동일하게 작동합니다.

```blade
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

편의를 위해 블레이드는 `@unless` 지시어도 제공합니다.

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

이미 논의한 조건부 지시어 외에도, `@isset`과 `@empty` 지시어는 각각의 PHP 함수에 대한 편리한 단축키로 사용할 수 있습니다.

```blade
@isset($records)
    // $records가 정의되어 있고 null이 아닙니다...
@endisset

@empty($records)
    // $records가 "비어" 있습니다...
@endempty
```

<a name="authentication-directives"></a>
#### 인증 지시어

`@auth`와 `@guest` 지시어를 사용하여 현재 사용자가 [인증](/docs/{{version}}/authentication)되었는지 또는 게스트인지 빠르게 확인할 수 있습니다.

```blade
@auth
    // 사용자가 인증되었습니다...
@endauth

@guest
    // 사용자가 인증되지 않았습니다...
@endguest
```

필요한 경우, `@auth`와 `@guest` 지시어를 사용할 때 확인해야 할 인증 가드를 지정할 수 있습니다.

```blade
@auth('admin')
    // 사용자가 인증되었습니다...
@endauth

@guest('admin')
    // 사용자가 인증되지 않았습니다...
@endguest
```

<a name="environment-directives"></a>
#### 환경 지시어

`@production` 지시어를 사용하여 애플리케이션이 프로덕션 환경에서 실행 중인지 확인할 수 있습니다.

```blade
@production
    // 프로덕션 전용 콘텐츠...
@endproduction
```

또는 `@env` 지시어를 사용하여 애플리케이션이 특정 환경에서 실행 중인지 확인할 수 있습니다.

```blade
@env('staging')
    // 애플리케이션이 "staging"에서 실행 중입니다...
@endenv

@env(['staging', 'production'])
    // 애플리케이션이 "staging" 또는 "production"에서 실행 중입니다...
@endenv
```

<a name="section-directives"></a>
#### 섹션 지시어

`@hasSection` 지시어를 사용하여 템플릿 상속 섹션에 콘텐츠가 있는지 확인할 수 있습니다.

```blade
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

`sectionMissing` 지시어를 사용하여 섹션에 콘텐츠가 없는지 확인할 수 있습니다.

```blade
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

<a name="session-directives"></a>
#### 세션 지시어

`@session` 지시어는 [세션](/docs/{{version}}/session) 값이 존재하는지 확인하는 데 사용할 수 있습니다. 세션 값이 존재하면 `@session`과 `@endsession` 지시어 내의 템플릿 내용이 평가됩니다. `@session` 지시어의 내용 내에서 `$value` 변수를 출력하여 세션 값을 표시할 수 있습니다.

```blade
@session('status')
    <div class="p-4 bg-green-100">
        {{ $value }}
    </div>
@endsession
```

<a name="switch-statements"></a>
### Switch 문

Switch 문은 `@switch`, `@case`, `@break`, `@default`, `@endswitch` 지시어를 사용하여 구성할 수 있습니다.

```blade
@switch($i)
    @case(1)
        First case...
        @break

    @case(2)
        Second case...
        @break

    @default
        Default case...
@endswitch
```

<a name="loops"></a>
### 반복문

조건문 외에도 블레이드는 PHP의 반복 구조로 작업하기 위한 간단한 지시어를 제공합니다. 다시 말해, 이러한 각 지시어는 PHP의 대응되는 것과 동일하게 작동합니다.

```blade
@for ($i = 0; $i < 10; $i++)
    The current value is {{ $i }}
@endfor

@foreach ($users as $user)
    <p>This is user {{ $user->id }}</p>
@endforeach

@forelse ($users as $user)
    <li>{{ $user->name }}</li>
@empty
    <p>No users</p>
@endforelse

@while (true)
    <p>I'm looping forever.</p>
@endwhile
```

> [!NOTE]  
> `foreach` 루프를 반복하는 동안, [루프 변수](#the-loop-variable)를 사용하여 루프의 첫 번째 또는 마지막 반복인지와 같은 루프에 대한 유용한 정보를 얻을 수 있습니다.

반복문을 사용할 때 `@continue`와 `@break` 지시어를 사용하여 현재 반복을 건너뛰거나 루프를 종료할 수도 있습니다.

```blade
@foreach ($users as $user)
    @if ($user->type == 1)
        @continue
    @endif

    <li>{{ $user->name }}</li>

    @if ($user->number == 5)
        @break
    @endif
@endforeach
```

지시어 선언 내에 계속 또는 중단 조건을 포함할 수도 있습니다.

```blade
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

<a name="the-loop-variable"></a>
### 루프 변수

`foreach` 루프를 반복하는 동안, 루프 내에서 `$loop` 변수를 사용할 수 있습니다. 이 변수는 현재 루프 인덱스와 이것이 루프의 첫 번째 또는 마지막 반복인지와 같은 유용한 정보에 대한 접근을 제공합니다.

```blade
@foreach ($users as $user)
    @if ($loop->first)
        This is the first iteration.
    @endif

    @if ($loop->last)
        This is the last iteration.
    @endif

    <p>This is user {{ $user->id }}</p>
@endforeach
```

중첩된 루프에 있는 경우, `parent` 속성을 통해 부모 루프의 `$loop` 변수에 접근할 수 있습니다.

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

`$loop` 변수는 다양한 다른 유용한 속성도 포함합니다.

<div class="overflow-auto">

| 속성               | 설명                                                   |
| ------------------ | ------------------------------------------------------ |
| `$loop->index`     | 현재 루프 반복의 인덱스 (0부터 시작).                  |
| `$loop->iteration` | 현재 루프 반복 (1부터 시작).                           |
| `$loop->remaining` | 루프에서 남은 반복 횟수.                               |
| `$loop->count`     | 반복되는 배열의 총 항목 수.                            |
| `$loop->first`     | 이것이 루프의 첫 번째 반복인지 여부.                   |
| `$loop->last`      | 이것이 루프의 마지막 반복인지 여부.                    |
| `$loop->even`      | 이것이 루프의 짝수 번째 반복인지 여부.                 |
| `$loop->odd`       | 이것이 루프의 홀수 번째 반복인지 여부.                 |
| `$loop->depth`     | 현재 루프의 중첩 레벨.                                 |
| `$loop->parent`    | 중첩된 루프에 있을 때, 부모의 루프 변수.               |

</div>

<a name="conditional-classes"></a>
### 조건부 클래스 및 스타일

`@class` 지시어는 CSS 클래스 문자열을 조건부로 컴파일합니다. 이 지시어는 배열 키에 추가하려는 클래스를 포함하고 값에 불리언 표현식을 포함하는 클래스 배열을 받습니다. 배열 요소에 숫자 키가 있으면 항상 렌더링된 클래스 목록에 포함됩니다.

```blade
@php
    $isActive = false;
    $hasError = true;
@endphp

<span @class([
    'p-4',
    'font-bold' => $isActive,
    'text-gray-500' => ! $isActive,
    'bg-red' => $hasError,
])></span>

<span class="p-4 text-gray-500 bg-red"></span>
```

마찬가지로 `@style` 지시어는 HTML 요소에 인라인 CSS 스타일을 조건부로 추가하는 데 사용할 수 있습니다.

```blade
@php
    $isActive = true;
@endphp

<span @style([
    'background-color: red',
    'font-weight: bold' => $isActive,
])></span>

<span style="background-color: red; font-weight: bold;"></span>
```

<a name="additional-attributes"></a>
### 추가 속성

편의를 위해, `@checked` 지시어를 사용하여 주어진 HTML 체크박스 입력이 "checked"인지 쉽게 나타낼 수 있습니다. 이 지시어는 제공된 조건이 `true`로 평가되면 `checked`를 출력합니다.

```blade
<input type="checkbox"
        name="active"
        value="active"
        @checked(old('active', $user->active)) />
```

마찬가지로 `@selected` 지시어는 주어진 select 옵션이 "selected"되어야 하는지 나타내는 데 사용할 수 있습니다.

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

또한 `@disabled` 지시어는 주어진 요소가 "disabled"되어야 하는지 나타내는 데 사용할 수 있습니다.

```blade
<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>
```

더불어 `@readonly` 지시어는 주어진 요소가 "readonly"여야 하는지 나타내는 데 사용할 수 있습니다.

```blade
<input type="email"
        name="email"
        value="email@laravel.com"
        @readonly($user->isNotAdmin()) />
```

추가로 `@required` 지시어는 주어진 요소가 "required"여야 하는지 나타내는 데 사용할 수 있습니다.

```blade
<input type="text"
        name="title"
        value="title"
        @required($user->isAdmin()) />
```

<a name="including-subviews"></a>
### 하위 뷰 포함하기

> [!NOTE]  
> `@include` 지시어를 자유롭게 사용할 수 있지만, 블레이드 [컴포넌트](#components)는 유사한 기능을 제공하며 데이터 및 속성 바인딩과 같은 `@include` 지시어에 비해 여러 이점을 제공합니다.

블레이드의 `@include` 지시어를 사용하면 다른 뷰 내에서 블레이드 뷰를 포함할 수 있습니다. 부모 뷰에서 사용 가능한 모든 변수는 포함된 뷰에서도 사용 가능합니다.

```blade
<div>
    @include('shared.errors')

    <form>
        <!-- 폼 내용 -->
    </form>
</div>
```

포함된 뷰는 부모 뷰에서 사용 가능한 모든 데이터를 상속하지만, 포함된 뷰에서 사용 가능하게 해야 할 추가 데이터 배열을 전달할 수도 있습니다.

```blade
@include('view.name', ['status' => 'complete'])
```

존재하지 않는 뷰를 `@include`하려고 하면 라라벨은 오류를 발생시킵니다. 존재할 수도 있고 존재하지 않을 수도 있는 뷰를 포함하려면 `@includeIf` 지시어를 사용해야 합니다.

```blade
@includeIf('view.name', ['status' => 'complete'])
```

주어진 불리언 표현식이 `true` 또는 `false`로 평가될 때 뷰를 `@include`하려면 `@includeWhen`과 `@includeUnless` 지시어를 사용할 수 있습니다.

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

주어진 뷰 배열에서 존재하는 첫 번째 뷰를 포함하려면 `includeFirst` 지시어를 사용할 수 있습니다.

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

> [!WARNING]  
> 블레이드 뷰에서 `__DIR__`과 `__FILE__` 상수를 사용하지 않아야 합니다. 이들은 캐시된, 컴파일된 뷰의 위치를 참조하게 됩니다.

<a name="rendering-views-for-collections"></a>
#### 컬렉션을 위한 뷰 렌더링

블레이드의 `@each` 지시어를 사용하면 반복문과 include를 한 줄로 결합할 수 있습니다.

```blade
@each('view.name', $jobs, 'job')
```

`@each` 지시어의 첫 번째 인수는 배열이나 컬렉션의 각 요소에 대해 렌더링할 뷰입니다. 두 번째 인수는 반복할 배열이나 컬렉션이고, 세 번째 인수는 뷰 내에서 현재 반복에 할당될 변수 이름입니다. 예를 들어, `jobs` 배열을 반복하는 경우 일반적으로 뷰 내에서 각 job을 `job` 변수로 접근하려 할 것입니다. 현재 반복의 배열 키는 뷰 내에서 `key` 변수로 사용할 수 있습니다.

`@each` 지시어에 네 번째 인수를 전달할 수도 있습니다. 이 인수는 주어진 배열이 비어 있을 때 렌더링될 뷰를 결정합니다.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

> [!WARNING]  
> `@each`를 통해 렌더링된 뷰는 부모 뷰의 변수를 상속하지 않습니다. 자식 뷰에서 이러한 변수가 필요한 경우 대신 `@foreach`와 `@include` 지시어를 사용해야 합니다.

<a name="the-once-directive"></a>
### `@once` 지시어

`@once` 지시어를 사용하면 렌더링 사이클당 한 번만 평가될 템플릿 부분을 정의할 수 있습니다. 이는 [스택](#stacks)을 사용하여 주어진 자바스크립트 조각을 페이지의 헤더에 푸시하는 데 유용할 수 있습니다. 예를 들어, 루프 내에서 주어진 [컴포넌트](#components)를 렌더링하는 경우, 컴포넌트가 처음 렌더링될 때만 자바스크립트를 헤더에 푸시하고 싶을 수 있습니다.

```blade
@once
    @push('scripts')
        <script>
            // 커스텀 자바스크립트...
        </script>
    @endpush
@endonce
```

`@once` 지시어는 종종 `@push` 또는 `@prepend` 지시어와 함께 사용되므로, 편의를 위해 `@pushOnce`와 `@prependOnce` 지시어를 사용할 수 있습니다.

```blade
@pushOnce('scripts')
    <script>
        // 커스텀 자바스크립트...
    </script>
@endPushOnce
```

<a name="raw-php"></a>
### 순수 PHP

어떤 상황에서는 뷰에 PHP 코드를 삽입하는 것이 유용합니다. 블레이드 `@php` 지시어를 사용하여 템플릿 내에서 순수 PHP 블록을 실행할 수 있습니다.

```blade
@php
    $counter = 1;
@endphp
```

또는, PHP로 클래스만 가져와야 하는 경우 `@use` 지시어를 사용할 수 있습니다.

```php
@use('App\Models\Flight')
```

가져온 클래스에 별칭을 지정하기 위해 `@use` 지시어에 두 번째 인수를 제공할 수 있습니다.

```php
@use('App\Models\Flight', 'FlightModel')
```

<a name="comments"></a>
### 주석

블레이드를 사용하면 뷰에서 주석을 정의할 수도 있습니다. 그러나 HTML 주석과 달리 블레이드 주석은 애플리케이션에서 반환되는 HTML에 포함되지 않습니다.

```blade
{{-- 이 주석은 렌더링된 HTML에 나타나지 않습니다 --}}
```

<a name="components"></a>
## 컴포넌트

컴포넌트와 슬롯은 섹션, 레이아웃, include와 유사한 이점을 제공하지만, 일부 사람들은 컴포넌트와 슬롯의 멘탈 모델이 더 이해하기 쉽다고 느낄 수 있습니다. 컴포넌트를 작성하는 두 가지 접근 방식이 있습니다: 클래스 기반(class-based) 컴포넌트와 익명 컴포넌트.

클래스 기반(class-based) 컴포넌트를 만들려면 `make:component` Artisan 명령을 사용할 수 있습니다. 컴포넌트 사용 방법을 설명하기 위해 간단한 `Alert` 컴포넌트를 만들어 보겠습니다. `make:component` 명령은 컴포넌트를 `app/View/Components` 디렉토리에 배치합니다.

```shell
php artisan make:component Alert
```

`make:component` 명령은 컴포넌트에 대한 뷰 템플릿도 생성합니다. 뷰는 `resources/views/components` 디렉토리에 배치됩니다. 자체 애플리케이션용 컴포넌트를 작성할 때 컴포넌트는 `app/View/Components` 디렉토리와 `resources/views/components` 디렉토리 내에서 자동으로 검색되므로 일반적으로 추가 컴포넌트 등록이 필요하지 않습니다.

하위 디렉토리 내에도 컴포넌트를 만들 수 있습니다.

```shell
php artisan make:component Forms/Input
```

위 명령은 `app/View/Components/Forms` 디렉토리에 `Input` 컴포넌트를 생성하고 뷰는 `resources/views/components/forms` 디렉토리에 배치됩니다.

익명 컴포넌트(블레이드 템플릿만 있고 클래스가 없는 컴포넌트)를 만들려면 `make:component` 명령을 호출할 때 `--view` 플래그를 사용할 수 있습니다.

```shell
php artisan make:component forms.input --view
```

위 명령은 `resources/views/components/forms/input.blade.php`에 블레이드 파일을 생성하며, `<x-forms.input />`을 통해 컴포넌트로 렌더링할 수 있습니다.

<a name="manually-registering-package-components"></a>
#### 패키지 컴포넌트 수동 등록

자체 애플리케이션용 컴포넌트를 작성할 때 컴포넌트는 `app/View/Components` 디렉토리와 `resources/views/components` 디렉토리 내에서 자동으로 검색됩니다.

그러나 블레이드 컴포넌트를 활용하는 패키지를 빌드하는 경우 컴포넌트 클래스와 HTML 태그 별칭을 수동으로 등록해야 합니다. 일반적으로 패키지의 서비스 제공자의 `boot` 메서드에서 컴포넌트를 등록해야 합니다.

```php
use Illuminate\Support\Facades\Blade;

/**
 * 패키지의 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::component('package-alert', Alert::class);
}
```

컴포넌트가 등록되면 태그 별칭을 사용하여 렌더링할 수 있습니다.

```blade
<x-package-alert/>
```

또는 `componentNamespace` 메서드를 사용하여 규칙에 따라 컴포넌트 클래스를 자동 로드할 수 있습니다. 예를 들어, `Nightshade` 패키지에 `Package\Views\Components` 네임스페이스 내에 있는 `Calendar`와 `ColorPicker` 컴포넌트가 있을 수 있습니다.

```php
use Illuminate\Support\Facades\Blade;

/**
 * 패키지의 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 하면 `package-name::` 문법을 사용하여 벤더 네임스페이스로 패키지 컴포넌트를 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

블레이드는 컴포넌트 이름을 파스칼 케이스로 변환하여 이 컴포넌트에 연결된 클래스를 자동으로 감지합니다. "점" 표기법을 사용한 하위 디렉토리도 지원됩니다.

<a name="rendering-components"></a>
### 컴포넌트 렌더링

컴포넌트를 표시하려면 블레이드 템플릿 중 하나에서 블레이드 컴포넌트 태그를 사용할 수 있습니다. 블레이드 컴포넌트 태그는 문자열 `x-`로 시작하고 그 뒤에 컴포넌트 클래스의 케밥 케이스 이름이 옵니다.

```blade
<x-alert/>

<x-user-profile/>
```

컴포넌트 클래스가 `app/View/Components` 디렉토리 내에 더 깊이 중첩되어 있는 경우 `.` 문자를 사용하여 디렉토리 중첩을 나타낼 수 있습니다. 예를 들어, 컴포넌트가 `app/View/Components/Inputs/Button.php`에 있다고 가정하면 다음과 같이 렌더링할 수 있습니다.

```blade
<x-inputs.button/>
```

컴포넌트를 조건부로 렌더링하려면 컴포넌트 클래스에 `shouldRender` 메서드를 정의할 수 있습니다. `shouldRender` 메서드가 `false`를 반환하면 컴포넌트가 렌더링되지 않습니다.

```php
use Illuminate\Support\Str;

/**
 * 컴포넌트가 렌더링되어야 하는지 여부
 */
public function shouldRender(): bool
{
    return Str::length($this->message) > 0;
}
```

루트 `Card` 컴포넌트가 `Card` 디렉토리 내에 중첩되어 있으므로 `<x-card.card>`를 통해 컴포넌트를 렌더링해야 한다고 예상할 수 있습니다. 그러나 컴포넌트의 파일 이름이 컴포넌트의 디렉토리 이름과 일치하는 경우, 라라벨은 해당 컴포넌트가 "루트" 컴포넌트라고 자동으로 가정하고 디렉토리 이름을 반복하지 않고 컴포넌트를 렌더링할 수 있습니다.

```blade
<x-card>
    <x-card.header>...</x-card.header>
    <x-card.body>...</x-card.body>
</x-card>
```

<a name="passing-data-to-components"></a>
### 컴포넌트에 데이터 전달

HTML 속성을 사용하여 블레이드 컴포넌트에 데이터를 전달할 수 있습니다. 하드 코딩된 원시 값은 단순 HTML 속성 문자열을 사용하여 컴포넌트에 전달할 수 있습니다. PHP 표현식과 변수는 `:` 문자를 접두사로 사용하는 속성을 통해 컴포넌트에 전달해야 합니다.

```blade
<x-alert type="error" :message="$message"/>
```

컴포넌트의 모든 데이터 속성을 클래스 생성자에서 정의해야 합니다. 컴포넌트의 모든 공개 속성은 자동으로 컴포넌트의 뷰에서 사용 가능합니다. 컴포넌트의 `render` 메서드에서 뷰에 데이터를 전달할 필요가 없습니다.

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;
use Illuminate\View\View;

class Alert extends Component
{
    /**
     * 컴포넌트 인스턴스를 생성합니다.
     */
    public function __construct(
        public string $type,
        public string $message,
    ) {}

    /**
     * 컴포넌트를 나타내는 뷰 / 내용을 가져옵니다.
     */
    public function render(): View
    {
        return view('components.alert');
    }
}
```

컴포넌트가 렌더링될 때 이름으로 변수를 출력하여 컴포넌트의 공개 변수 내용을 표시할 수 있습니다.

```blade
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

<a name="casing"></a>
#### 케이싱

컴포넌트 생성자 인수는 `camelCase`를 사용하여 지정해야 하고, HTML 속성에서 인수 이름을 참조할 때는 `kebab-case`를 사용해야 합니다. 예를 들어, 다음 컴포넌트 생성자가 있다고 가정합니다.

```php
/**
 * 컴포넌트 인스턴스를 생성합니다.
 */
public function __construct(
    public string $alertType,
) {}
```

`$alertType` 인수는 다음과 같이 컴포넌트에 제공할 수 있습니다.

```blade
<x-alert alert-type="danger" />
```

<a name="short-attribute-syntax"></a>
#### 짧은 속성 문법

컴포넌트에 속성을 전달할 때 "짧은 속성" 문법을 사용할 수도 있습니다. 속성 이름이 대응하는 변수 이름과 자주 일치하기 때문에 이 방법이 편리할 때가 많습니다.

```blade
{{-- 짧은 속성 문법... --}}
<x-profile :$userId :$name />

{{-- 다음과 동일합니다... --}}
<x-profile :user-id="$userId" :name="$name" />
```

<a name="escaping-attribute-rendering"></a>
#### 속성 렌더링 이스케이프

Alpine.js와 같은 일부 자바스크립트 프레임워크도 콜론 접두사 속성을 사용하므로, 이중 콜론(`::`) 접두사를 사용하여 블레이드에 해당 속성이 PHP 표현식이 아님을 알릴 수 있습니다. 예를 들어, 다음 컴포넌트가 있다고 가정합니다.

```blade
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

블레이드에 의해 다음 HTML이 렌더링됩니다.

```blade
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

<a name="component-methods"></a>
#### 컴포넌트 메서드

공개 변수가 컴포넌트 템플릿에서 사용 가능한 것 외에도, 컴포넌트의 모든 공개 메서드를 호출할 수 있습니다. 예를 들어, `isSelected` 메서드가 있는 컴포넌트를 상상해 보세요.

```php
/**
 * 주어진 옵션이 현재 선택된 옵션인지 확인합니다.
 */
public function isSelected(string $option): bool
{
    return $option === $this->selected;
}
```

메서드 이름과 일치하는 변수를 호출하여 컴포넌트 템플릿에서 이 메서드를 실행할 수 있습니다.

```blade
<option {{ $isSelected($value) ? 'selected' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

<a name="using-attributes-slots-within-component-class"></a>
#### 컴포넌트 클래스 내에서 속성과 슬롯 접근

블레이드 컴포넌트를 사용하면 클래스의 render 메서드 내에서 컴포넌트 이름, 속성, 슬롯에 접근할 수도 있습니다. 그러나 이 데이터에 접근하려면 컴포넌트의 `render` 메서드에서 클로저를 반환해야 합니다.

```php
use Closure;

/**
 * 컴포넌트를 나타내는 뷰 / 내용을 가져옵니다.
 */
public function render(): Closure
{
    return function () {
        return '<div {{ $attributes }}>Components content</div>';
    };
}
```

컴포넌트의 `render` 메서드에서 반환된 클로저는 유일한 인수로 `$data` 배열을 받을 수도 있습니다. 이 배열에는 컴포넌트에 대한 정보를 제공하는 여러 요소가 포함됩니다.

```php
return function (array $data) {
    // $data['componentName'];
    // $data['attributes'];
    // $data['slot'];

    return '<div {{ $attributes }}>Components content</div>';
}
```

> [!WARNING]  
> `$data` 배열의 요소는 `render` 메서드에서 반환되는 블레이드 문자열에 직접 삽입해서는 안 됩니다. 그렇게 하면 악의적인 속성 내용을 통해 원격 코드 실행이 가능해질 수 있습니다.

`componentName`은 HTML 태그에서 `x-` 접두사 뒤에 사용된 이름과 같습니다. 따라서 `<x-alert />`의 `componentName`은 `alert`입니다. `attributes` 요소에는 HTML 태그에 있던 모든 속성이 포함됩니다. `slot` 요소는 컴포넌트의 슬롯 내용이 포함된 `Illuminate\Support\HtmlString` 인스턴스입니다.

클로저는 문자열을 반환해야 합니다. 반환된 문자열이 기존 뷰에 해당하면 해당 뷰가 렌더링됩니다. 그렇지 않으면 반환된 문자열이 인라인 블레이드 뷰로 평가됩니다.

<a name="additional-dependencies"></a>
#### 추가 의존성

컴포넌트가 라라벨의 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에서 의존성을 필요로 하는 경우, 컴포넌트의 데이터 속성 앞에 나열하면 컨테이너에 의해 자동으로 주입됩니다.

```php
use App\Services\AlertCreator;

/**
 * 컴포넌트 인스턴스를 생성합니다.
 */
public function __construct(
    public AlertCreator $creator,
    public string $type,
    public string $message,
) {}
```

<a name="hiding-attributes-and-methods"></a>
#### 속성 / 메서드 숨기기

일부 공개 메서드나 속성이 컴포넌트 템플릿에 변수로 노출되지 않도록 하려면 컴포넌트의 `$except` 배열 속성에 추가할 수 있습니다.

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * 컴포넌트 템플릿에 노출되지 않아야 할 속성 / 메서드.
     *
     * @var array
     */
    protected $except = ['type'];

    /**
     * 컴포넌트 인스턴스를 생성합니다.
     */
    public function __construct(
        public string $type,
    ) {}
}
```

<a name="component-attributes"></a>
### 컴포넌트 속성

컴포넌트에 데이터 속성을 전달하는 방법을 이미 살펴보았지만, 때때로 컴포넌트가 작동하는 데 필요한 데이터의 일부가 아닌 `class`와 같은 추가 HTML 속성을 지정해야 할 수 있습니다. 일반적으로 이러한 추가 속성을 컴포넌트 템플릿의 루트 요소로 전달하려 합니다. 예를 들어, 다음과 같이 `alert` 컴포넌트를 렌더링한다고 상상해 보세요.

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

컴포넌트의 생성자의 일부가 아닌 모든 속성은 컴포넌트의 "속성 백(attribute bag)"에 자동으로 추가됩니다. 이 속성 백은 `$attributes` 변수를 통해 컴포넌트에서 자동으로 사용 가능합니다. 이 변수를 출력하여 컴포넌트 내에서 모든 속성을 렌더링할 수 있습니다.

```blade
<div {{ $attributes }}>
    <!-- 컴포넌트 내용 -->
</div>
```

> [!WARNING]  
> 현재 컴포넌트 태그 내에서 `@env`와 같은 지시어를 사용하는 것은 지원되지 않습니다. 예를 들어, `<x-alert :live="@env('production')"/>`는 컴파일되지 않습니다.

<a name="default-merged-attributes"></a>
#### 기본 / 병합 속성

때때로 속성에 대한 기본값을 지정하거나 컴포넌트의 일부 속성에 추가 값을 병합해야 할 수 있습니다. 이를 위해 속성 백의 `merge` 메서드를 사용할 수 있습니다. 이 메서드는 컴포넌트에 항상 적용되어야 하는 기본 CSS 클래스 집합을 정의하는 데 특히 유용합니다.

```blade
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

이 컴포넌트가 다음과 같이 사용된다고 가정합니다.

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

컴포넌트의 최종 렌더링된 HTML은 다음과 같이 나타납니다.

```blade
<div class="alert alert-error mb-4">
    <!-- $message 변수의 내용 -->
</div>
```

<a name="conditionally-merge-classes"></a>
#### 조건부 클래스 병합

때때로 주어진 조건이 `true`일 때 클래스를 병합하고 싶을 수 있습니다. 이는 `class` 메서드를 통해 달성할 수 있으며, 배열 키에 추가하려는 클래스를 포함하고 값에 불리언 표현식을 포함하는 클래스 배열을 받습니다. 배열 요소에 숫자 키가 있으면 항상 렌더링된 클래스 목록에 포함됩니다.

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

컴포넌트에 다른 속성을 병합해야 하는 경우 `class` 메서드에 `merge` 메서드를 체인할 수 있습니다.

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

> [!NOTE]  
> 병합된 속성을 받지 않아야 하는 다른 HTML 요소에서 조건부로 클래스를 컴파일해야 하는 경우 [`@class` 지시어](#conditional-classes)를 사용할 수 있습니다.

<a name="non-class-attribute-merging"></a>
#### 비-클래스 속성 병합

`class` 속성이 아닌 속성을 병합할 때, `merge` 메서드에 제공된 값은 속성의 "기본" 값으로 간주됩니다. 그러나 `class` 속성과 달리 이러한 속성은 주입된 속성 값과 병합되지 않습니다. 대신 덮어쓰여집니다. 예를 들어, `button` 컴포넌트의 구현은 다음과 같을 수 있습니다.

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

커스텀 `type`으로 버튼 컴포넌트를 렌더링하려면 컴포넌트를 사용할 때 지정할 수 있습니다. type이 지정되지 않으면 `button` type이 사용됩니다.

```blade
<x-button type="submit">
    Submit
</x-button>
```

이 예제에서 `button` 컴포넌트의 렌더링된 HTML은 다음과 같습니다.

```blade
<button type="submit">
    Submit
</button>
```

`class` 이외의 속성이 기본값과 주입된 값을 함께 결합하도록 하려면 `prepends` 메서드를 사용할 수 있습니다. 이 예제에서 `data-controller` 속성은 항상 `profile-controller`로 시작하고 추가로 주입된 `data-controller` 값은 이 기본값 뒤에 배치됩니다.

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

<a name="filtering-attributes"></a>
#### 속성 검색 및 필터링

`filter` 메서드를 사용하여 속성을 필터링할 수 있습니다. 이 메서드는 속성 백에 속성을 유지하려면 `true`를 반환해야 하는 클로저를 받습니다.

```blade
{{ $attributes->filter(fn (string $value, string $key) => $key == 'foo') }}
```

편의를 위해 `whereStartsWith` 메서드를 사용하여 키가 주어진 문자열로 시작하는 모든 속성을 검색할 수 있습니다.

```blade
{{ $attributes->whereStartsWith('wire:model') }}
```

반대로 `whereDoesntStartWith` 메서드를 사용하여 키가 주어진 문자열로 시작하는 모든 속성을 제외할 수 있습니다.

```blade
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

`first` 메서드를 사용하여 주어진 속성 백의 첫 번째 속성을 렌더링할 수 있습니다.

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

컴포넌트에 속성이 있는지 확인하려면 `has` 메서드를 사용할 수 있습니다. 이 메서드는 속성 이름을 유일한 인수로 받고 속성이 있는지 여부를 나타내는 불리언을 반환합니다.

```blade
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

배열이 `has` 메서드에 전달되면 메서드는 주어진 모든 속성이 컴포넌트에 있는지 확인합니다.

```blade
@if ($attributes->has(['name', 'class']))
    <div>All of the attributes are present</div>
@endif
```

`hasAny` 메서드를 사용하여 주어진 속성 중 하나라도 컴포넌트에 있는지 확인할 수 있습니다.

```blade
@if ($attributes->hasAny(['href', ':href', 'v-bind:href']))
    <div>One of the attributes is present</div>
@endif
```

`get` 메서드를 사용하여 특정 속성의 값을 검색할 수 있습니다.

```blade
{{ $attributes->get('class') }}
```

<a name="reserved-keywords"></a>
### 예약어

기본적으로 일부 키워드는 컴포넌트를 렌더링하기 위한 블레이드의 내부 사용을 위해 예약되어 있습니다. 다음 키워드는 컴포넌트 내에서 공개 속성이나 메서드 이름으로 정의할 수 없습니다.

<div class="content-list" markdown="1">

- `data`
- `render`
- `resolveView`
- `shouldRender`
- `view`
- `withAttributes`
- `withName`

</div>

<a name="slots"></a>
### 슬롯

종종 "슬롯"을 통해 컴포넌트에 추가 콘텐츠를 전달해야 합니다. 컴포넌트 슬롯은 `$slot` 변수를 출력하여 렌더링됩니다. 이 개념을 탐구하기 위해 `alert` 컴포넌트가 다음과 같은 마크업을 가지고 있다고 상상해 봅시다.

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

컴포넌트에 콘텐츠를 주입하여 `slot`에 콘텐츠를 전달할 수 있습니다.

```blade
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

때때로 컴포넌트는 컴포넌트 내의 다른 위치에서 여러 다른 슬롯을 렌더링해야 할 수 있습니다. "title" 슬롯을 주입할 수 있도록 alert 컴포넌트를 수정해 봅시다.

```blade
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

`x-slot` 태그를 사용하여 명명된 슬롯의 내용을 정의할 수 있습니다. 명시적인 `x-slot` 태그 내에 있지 않은 모든 콘텐츠는 `$slot` 변수로 컴포넌트에 전달됩니다.

```xml
<x-alert>
    <x-slot:title>
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

슬롯의 `isEmpty` 메서드를 호출하여 슬롯에 콘텐츠가 있는지 확인할 수 있습니다.

```blade
<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    @if ($slot->isEmpty())
        This is default content if the slot is empty.
    @else
        {{ $slot }}
    @endif
</div>
```

또한 `hasActualContent` 메서드를 사용하여 슬롯에 HTML 주석이 아닌 "실제" 콘텐츠가 있는지 확인할 수 있습니다.

```blade
@if ($slot->hasActualContent())
    The scope has non-comment content.
@endif
```

<a name="scoped-slots"></a>
#### 스코프드 슬롯

Vue와 같은 자바스크립트 프레임워크를 사용해 본 적이 있다면 슬롯 내에서 컴포넌트의 데이터나 메서드에 접근할 수 있는 "스코프드 슬롯"에 익숙할 것입니다. 컴포넌트에 공개 메서드나 속성을 정의하고 `$component` 변수를 통해 슬롯 내에서 컴포넌트에 접근하여 라라벨에서 유사한 동작을 달성할 수 있습니다. 이 예제에서는 `x-alert` 컴포넌트가 컴포넌트 클래스에 정의된 공개 `formatAlert` 메서드를 가지고 있다고 가정합니다.

```blade
<x-alert>
    <x-slot:title>
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

<a name="slot-attributes"></a>
#### 슬롯 속성

블레이드 컴포넌트와 마찬가지로 CSS 클래스 이름과 같은 추가 [속성](#component-attributes)을 슬롯에 할당할 수 있습니다.

```xml
<x-card class="shadow-sm">
    <x-slot:heading class="font-bold">
        Heading
    </x-slot>

    Content

    <x-slot:footer class="text-sm">
        Footer
    </x-slot>
</x-card>
```

슬롯 속성과 상호 작용하려면 슬롯 변수의 `attributes` 속성에 접근할 수 있습니다. 속성과 상호 작용하는 방법에 대한 자세한 내용은 [컴포넌트 속성](#component-attributes) 문서를 참조하세요.

```blade
@props([
    'heading',
    'footer',
])

<div {{ $attributes->class(['border']) }}>
    <h1 {{ $heading->attributes->class(['text-lg']) }}>
        {{ $heading }}
    </h1>

    {{ $slot }}

    <footer {{ $footer->attributes->class(['text-gray-700']) }}>
        {{ $footer }}
    </footer>
</div>
```

<a name="inline-component-views"></a>
### 인라인 컴포넌트 뷰

매우 작은 컴포넌트의 경우 컴포넌트 클래스와 컴포넌트의 뷰 템플릿을 모두 관리하는 것이 번거로울 수 있습니다. 이러한 이유로 `render` 메서드에서 직접 컴포넌트의 마크업을 반환할 수 있습니다.

```php
/**
 * 컴포넌트를 나타내는 뷰 / 내용을 가져옵니다.
 */
public function render(): string
{
    return <<<'blade'
        <div class="alert alert-danger">
            {{ $slot }}
        </div>
    blade;
}
```

<a name="generating-inline-view-components"></a>
#### 인라인 뷰 컴포넌트 생성

인라인 뷰를 렌더링하는 컴포넌트를 만들려면 `make:component` 명령을 실행할 때 `inline` 옵션을 사용할 수 있습니다.

```shell
php artisan make:component Alert --inline
```

<a name="dynamic-components"></a>
### 동적 컴포넌트

때때로 컴포넌트를 렌더링해야 하지만 런타임까지 어떤 컴포넌트를 렌더링해야 할지 모를 수 있습니다. 이 상황에서는 라라벨의 내장 `dynamic-component` 컴포넌트를 사용하여 런타임 값이나 변수를 기반으로 컴포넌트를 렌더링할 수 있습니다.

```blade
// $componentName = "secondary-button";

<x-dynamic-component :component="$componentName" class="mt-4" />
```

<a name="manually-registering-components"></a>
### 수동으로 컴포넌트 등록

> [!WARNING]  
> 수동으로 컴포넌트를 등록하는 것에 대한 다음 문서는 주로 뷰 컴포넌트를 포함하는 라라벨 패키지를 작성하는 사람들에게 적용됩니다. 패키지를 작성하지 않는다면 이 컴포넌트 문서 부분은 관련이 없을 수 있습니다.

자체 애플리케이션용 컴포넌트를 작성할 때 컴포넌트는 `app/View/Components` 디렉토리와 `resources/views/components` 디렉토리 내에서 자동으로 검색됩니다.

그러나 블레이드 컴포넌트를 활용하는 패키지를 빌드하거나 컴포넌트를 비전통적인 디렉토리에 배치하는 경우, 라라벨이 컴포넌트를 찾을 수 있도록 컴포넌트 클래스와 HTML 태그 별칭을 수동으로 등록해야 합니다. 일반적으로 패키지의 서비스 제공자의 `boot` 메서드에서 컴포넌트를 등록해야 합니다.

```php
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * 패키지의 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::component('package-alert', AlertComponent::class);
}
```

컴포넌트가 등록되면 태그 별칭을 사용하여 렌더링할 수 있습니다.

```blade
<x-package-alert/>
```

#### 패키지 컴포넌트 자동 로드

또는 `componentNamespace` 메서드를 사용하여 규칙에 따라 컴포넌트 클래스를 자동 로드할 수 있습니다. 예를 들어, `Nightshade` 패키지에 `Package\Views\Components` 네임스페이스 내에 있는 `Calendar`와 `ColorPicker` 컴포넌트가 있을 수 있습니다.

```php
use Illuminate\Support\Facades\Blade;

/**
 * 패키지의 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 하면 `package-name::` 문법을 사용하여 벤더 네임스페이스로 패키지 컴포넌트를 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

블레이드는 컴포넌트 이름을 파스칼 케이스로 변환하여 이 컴포넌트에 연결된 클래스를 자동으로 감지합니다. "점" 표기법을 사용한 하위 디렉토리도 지원됩니다.

<a name="anonymous-components"></a>
## 익명 컴포넌트

인라인 컴포넌트와 유사하게, 익명 컴포넌트는 단일 파일을 통해 컴포넌트를 관리하는 메커니즘을 제공합니다. 그러나 익명 컴포넌트는 단일 뷰 파일을 사용하며 연관된 클래스가 없습니다. 익명 컴포넌트를 정의하려면 `resources/views/components` 디렉토리 내에 블레이드 템플릿만 배치하면 됩니다. 예를 들어, `resources/views/components/alert.blade.php`에 컴포넌트를 정의했다고 가정하면 다음과 같이 간단히 렌더링할 수 있습니다.

```blade
<x-alert/>
```

`.` 문자를 사용하여 컴포넌트가 `components` 디렉토리 내에 더 깊이 중첩되어 있음을 나타낼 수 있습니다. 예를 들어, 컴포넌트가 `resources/views/components/inputs/button.blade.php`에 정의되어 있다고 가정하면 다음과 같이 렌더링할 수 있습니다.

```blade
<x-inputs.button/>
```

<a name="anonymous-index-components"></a>
### 익명 인덱스 컴포넌트

때때로 컴포넌트가 많은 블레이드 템플릿으로 구성되어 있을 때, 주어진 컴포넌트의 템플릿을 단일 디렉토리 내에 그룹화하고 싶을 수 있습니다. 예를 들어, 다음 디렉토리 구조를 가진 "accordion" 컴포넌트를 상상해 보세요.

```none
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

이 디렉토리 구조를 사용하면 accordion 컴포넌트와 그 항목을 다음과 같이 렌더링할 수 있습니다.

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

그러나 `x-accordion`을 통해 accordion 컴포넌트를 렌더링하려면 "인덱스" accordion 컴포넌트 템플릿을 다른 accordion 관련 템플릿과 함께 `accordion` 디렉토리 내에 중첩하는 대신 `resources/views/components` 디렉토리에 배치해야 했습니다.

다행히 블레이드는 컴포넌트의 디렉토리 이름과 일치하는 파일을 컴포넌트의 디렉토리 내에 배치할 수 있습니다. 이 템플릿이 존재하면 디렉토리 내에 중첩되어 있더라도 컴포넌트의 "루트" 요소로 렌더링될 수 있습니다. 따라서 위의 예제에서 제공된 것과 동일한 블레이드 문법을 계속 사용할 수 있지만 디렉토리 구조를 다음과 같이 조정합니다.

```none
/resources/views/components/accordion/index.blade.php
/resources/views/components/accordion/item.blade.php
```

<a name="data-properties-attributes"></a>
### 데이터 속성 / 어트리뷰트

익명 컴포넌트에는 연관된 클래스가 없으므로 어떤 데이터가 변수로 컴포넌트에 전달되어야 하고 어떤 속성이 컴포넌트의 [속성 백](#component-attributes)에 배치되어야 하는지 어떻게 구분하는지 궁금할 수 있습니다.

컴포넌트의 블레이드 템플릿 상단에서 `@props` 지시어를 사용하여 어떤 속성이 데이터 변수로 간주되어야 하는지 지정할 수 있습니다. 컴포넌트의 다른 모든 속성은 컴포넌트의 속성 백을 통해 사용 가능합니다. 데이터 변수에 기본값을 지정하려면 변수의 이름을 배열 키로, 기본값을 배열 값으로 지정할 수 있습니다.

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

위의 컴포넌트 정의가 주어지면 다음과 같이 컴포넌트를 렌더링할 수 있습니다.

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

<a name="accessing-parent-data"></a>
### 부모 데이터 접근

때때로 자식 컴포넌트 내에서 부모 컴포넌트의 데이터에 접근하고 싶을 수 있습니다. 이러한 경우 `@aware` 지시어를 사용할 수 있습니다. 예를 들어, 부모 `<x-menu>`와 자식 `<x-menu.item>`으로 구성된 복잡한 메뉴 컴포넌트를 빌드한다고 상상해 보세요.

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

`<x-menu>` 컴포넌트는 다음과 같은 구현을 가질 수 있습니다.

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

`color` prop이 부모(`<x-menu>`)에만 전달되었으므로 `<x-menu.item>` 내에서는 사용할 수 없습니다. 그러나 `@aware` 지시어를 사용하면 `<x-menu.item>` 내에서도 사용 가능하게 할 수 있습니다.

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

> [!WARNING]  
> `@aware` 지시어는 HTML 속성을 통해 명시적으로 부모 컴포넌트에 전달되지 않은 부모 데이터에 접근할 수 없습니다. 부모 컴포넌트에 명시적으로 전달되지 않은 기본 `@props` 값은 `@aware` 지시어로 접근할 수 없습니다.

<a name="anonymous-component-paths"></a>
### 익명 컴포넌트 경로

이전에 논의한 것처럼, 익명 컴포넌트는 일반적으로 `resources/views/components` 디렉토리 내에 블레이드 템플릿을 배치하여 정의됩니다. 그러나 기본 경로 외에 다른 익명 컴포넌트 경로를 라라벨에 등록하고 싶을 때가 있을 수 있습니다.

`anonymousComponentPath` 메서드는 익명 컴포넌트 위치에 대한 "경로"를 첫 번째 인수로 받고, 컴포넌트가 배치되어야 할 선택적 "네임스페이스"를 두 번째 인수로 받습니다. 일반적으로 이 메서드는 애플리케이션의 [서비스 제공자(Service Providers)](/docs/{{version}}/providers) 중 하나의 `boot` 메서드에서 호출해야 합니다.

```php
/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::anonymousComponentPath(__DIR__.'/../components');
}
```

위의 예제와 같이 지정된 접두사 없이 컴포넌트 경로가 등록되면 블레이드 컴포넌트에서도 해당 접두사 없이 렌더링될 수 있습니다. 예를 들어, 위에서 등록된 경로에 `panel.blade.php` 컴포넌트가 존재하면 다음과 같이 렌더링할 수 있습니다.

```blade
<x-panel />
```

접두사 "네임스페이스"는 `anonymousComponentPath` 메서드의 두 번째 인수로 제공할 수 있습니다.

```php
Blade::anonymousComponentPath(__DIR__.'/../components', 'dashboard');
```

접두사가 제공되면 해당 "네임스페이스" 내의 컴포넌트는 컴포넌트가 렌더링될 때 컴포넌트 이름 앞에 컴포넌트의 네임스페이스를 붙여 렌더링할 수 있습니다.

```blade
<x-dashboard::panel />
```

<a name="building-layouts"></a>
## 레이아웃 구성

<a name="layouts-using-components"></a>
### 컴포넌트를 이용한 레이아웃

대부분의 웹 애플리케이션은 다양한 페이지에서 동일한 일반 레이아웃을 유지합니다. 우리가 만드는 모든 뷰에서 전체 레이아웃 HTML을 반복해야 한다면 애플리케이션을 유지 관리하기가 매우 번거롭고 어려울 것입니다. 다행히 이 레이아웃을 단일 [블레이드 컴포넌트](#components)로 정의한 다음 애플리케이션 전체에서 사용하는 것이 편리합니다.

<a name="defining-the-layout-component"></a>
#### 레이아웃 컴포넌트 정의

예를 들어, "todo" 목록 애플리케이션을 빌드한다고 상상해 보세요. 다음과 같은 `layout` 컴포넌트를 정의할 수 있습니다.

```blade
<!-- resources/views/components/layout.blade.php -->

<html>
    <head>
        <title>{{ $title ?? 'Todo Manager' }}</title>
    </head>
    <body>
        <h1>Todos</h1>
        <hr/>
        {{ $slot }}
    </body>
</html>
```

<a name="applying-the-layout-component"></a>
#### 레이아웃 컴포넌트 적용

`layout` 컴포넌트가 정의되면 해당 컴포넌트를 활용하는 블레이드 뷰를 만들 수 있습니다. 이 예제에서는 작업 목록을 표시하는 간단한 뷰를 정의합니다.

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
```

컴포넌트에 주입된 콘텐츠는 `layout` 컴포넌트 내의 기본 `$slot` 변수에 제공된다는 것을 기억하세요. 눈치채셨겠지만, `layout`도 제공되면 `$title` 슬롯을 존중합니다. 그렇지 않으면 기본 제목이 표시됩니다. [컴포넌트 문서](#components)에서 논의된 표준 슬롯 문법을 사용하여 작업 목록 뷰에서 커스텀 제목을 주입할 수 있습니다.

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    <x-slot:title>
        Custom Title
    </x-slot>

    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
```

이제 레이아웃과 작업 목록 뷰를 정의했으므로 라우트에서 `task` 뷰를 반환하기만 하면 됩니다.

```php
use App\Models\Task;

Route::get('/tasks', function () {
    return view('tasks', ['tasks' => Task::all()]);
});
```

<a name="layouts-using-template-inheritance"></a>
### 템플릿 상속을 이용한 레이아웃

<a name="defining-a-layout"></a>
#### 레이아웃 정의

"템플릿 상속"을 통해서도 레이아웃을 만들 수 있습니다. 이것은 [컴포넌트](#components)가 도입되기 전에 애플리케이션을 빌드하는 주요 방법이었습니다.

시작하기 위해 간단한 예제를 살펴보겠습니다. 먼저 페이지 레이아웃을 살펴보겠습니다. 대부분의 웹 애플리케이션이 다양한 페이지에서 동일한 일반 레이아웃을 유지하므로 이 레이아웃을 단일 블레이드 뷰로 정의하는 것이 편리합니다.

```blade
<!-- resources/views/layouts/app.blade.php -->

<html>
    <head>
        <title>App Name - @yield('title')</title>
    </head>
    <body>
        @section('sidebar')
            This is the master sidebar.
        @show

        <div class="container">
            @yield('content')
        </div>
    </body>
</html>
```

보시다시피 이 파일에는 일반적인 HTML 마크업이 포함되어 있습니다. 그러나 `@section`과 `@yield` 지시어에 주목하세요. `@section` 지시어는 이름에서 알 수 있듯이 콘텐츠의 섹션을 정의하고, `@yield` 지시어는 주어진 섹션의 내용을 표시하는 데 사용됩니다.

이제 애플리케이션에 대한 레이아웃을 정의했으므로 레이아웃을 상속하는 자식 페이지를 정의해 보겠습니다.

<a name="extending-a-layout"></a>
#### 레이아웃 확장

자식 뷰를 정의할 때 `@extends` 블레이드 지시어를 사용하여 자식 뷰가 "상속"해야 할 레이아웃을 지정합니다. 블레이드 레이아웃을 확장하는 뷰는 `@section` 지시어를 사용하여 레이아웃의 섹션에 콘텐츠를 주입할 수 있습니다. 위의 예제에서 본 것처럼 이러한 섹션의 내용은 `@yield`를 사용하여 레이아웃에 표시됩니다.

```blade
<!-- resources/views/child.blade.php -->

@extends('layouts.app')

@section('title', 'Page Title')

@section('sidebar')
    @@parent

    <p>This is appended to the master sidebar.</p>
@endsection

@section('content')
    <p>This is my body content.</p>
@endsection
```

이 예제에서 `sidebar` 섹션은 `@@parent` 지시어를 활용하여 레이아웃의 사이드바에 콘텐츠를 덮어쓰는 대신 추가합니다. `@@parent` 지시어는 뷰가 렌더링될 때 레이아웃의 내용으로 대체됩니다.

> [!NOTE]  
> 이전 예제와 달리 이 `sidebar` 섹션은 `@show` 대신 `@endsection`으로 끝납니다. `@endsection` 지시어는 섹션만 정의하고 `@show`는 섹션을 정의하고 **즉시 yield**합니다.

`@yield` 지시어는 두 번째 매개변수로 기본값도 받습니다. yield되는 섹션이 정의되지 않은 경우 이 값이 렌더링됩니다.

```blade
@yield('content', 'Default content')
```

<a name="forms"></a>
## 폼

<a name="csrf-field"></a>
### CSRF 필드

애플리케이션에서 HTML 폼을 정의할 때마다 [CSRF 보호](/docs/{{version}}/csrf) 미들웨어가 요청을 검증할 수 있도록 폼에 숨겨진 CSRF 토큰 필드를 포함해야 합니다. `@csrf` 블레이드 지시어를 사용하여 토큰 필드를 생성할 수 있습니다.

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

<a name="method-field"></a>
### Method 필드

HTML 폼은 `PUT`, `PATCH`, `DELETE` 요청을 할 수 없으므로 이러한 HTTP 동사를 스푸핑하기 위해 숨겨진 `_method` 필드를 추가해야 합니다. `@method` 블레이드 지시어가 이 필드를 생성할 수 있습니다.

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

<a name="validation-errors"></a>
### 유효성 검사 에러

`@error` 지시어를 사용하여 주어진 속성에 대한 [유효성 검사 에러 메시지](/docs/{{version}}/validation#quick-displaying-the-validation-errors)가 존재하는지 빠르게 확인할 수 있습니다. `@error` 지시어 내에서 `$message` 변수를 출력하여 에러 메시지를 표시할 수 있습니다.

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input id="title"
    type="text"
    class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

`@error` 지시어는 "if" 문으로 컴파일되므로 속성에 대한 에러가 없을 때 콘텐츠를 렌더링하기 위해 `@else` 지시어를 사용할 수 있습니다.

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror"
/>
```

여러 폼이 포함된 페이지에서 유효성 검사 에러 메시지를 검색하기 위해 [특정 에러 백의 이름](/docs/{{version}}/validation#named-error-bags)을 `@error` 지시어의 두 번째 매개변수로 전달할 수 있습니다.

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email', 'login') is-invalid @enderror"
/>

@error('email', 'login')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

<a name="stacks"></a>
## 스택

블레이드를 사용하면 다른 뷰나 레이아웃의 다른 곳에서 렌더링할 수 있는 명명된 스택에 푸시할 수 있습니다. 이는 자식 뷰에서 필요한 자바스크립트 라이브러리를 지정하는 데 특히 유용합니다.

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

주어진 불리언 표현식이 `true`로 평가되면 콘텐츠를 `@push`하려면 `@pushIf` 지시어를 사용할 수 있습니다.

```blade
@pushIf($shouldPush, 'scripts')
    <script src="/example.js"></script>
@endPushIf
```

필요에 따라 여러 번 스택에 푸시할 수 있습니다. 전체 스택 내용을 렌더링하려면 스택 이름을 `@stack` 지시어에 전달합니다.

```blade
<head>
    <!-- Head 내용 -->

    @stack('scripts')
</head>
```

스택의 시작 부분에 콘텐츠를 추가하려면 `@prepend` 지시어를 사용해야 합니다.

```blade
@push('scripts')
    This will be second...
@endpush

// 나중에...

@prepend('scripts')
    This will be first...
@endprepend
```

<a name="service-injection"></a>
## 서비스 주입

`@inject` 지시어를 사용하여 라라벨 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에서 서비스를 검색할 수 있습니다. `@inject`에 전달되는 첫 번째 인수는 서비스가 배치될 변수의 이름이고, 두 번째 인수는 해결하려는 서비스의 클래스 또는 인터페이스 이름입니다.

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

<a name="rendering-inline-blade-templates"></a>
## 인라인 블레이드 템플릿 렌더링

때때로 원시 블레이드 템플릿 문자열을 유효한 HTML로 변환해야 할 수 있습니다. `Blade` 파사드에서 제공하는 `render` 메서드를 사용하여 이를 달성할 수 있습니다. `render` 메서드는 블레이드 템플릿 문자열과 템플릿에 제공할 선택적 데이터 배열을 받습니다.

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

라라벨은 인라인 블레이드 템플릿을 `storage/framework/views` 디렉토리에 작성하여 렌더링합니다. 블레이드 템플릿을 렌더링한 후 라라벨이 이러한 임시 파일을 제거하도록 하려면 메서드에 `deleteCachedView` 인수를 제공할 수 있습니다.

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

<a name="rendering-blade-fragments"></a>
## 블레이드 프래그먼트 렌더링

[Turbo](https://turbo.hotwired.dev/)와 [htmx](https://htmx.org/)와 같은 프론트엔드 프레임워크를 사용할 때, HTTP 응답 내에서 블레이드 템플릿의 일부만 반환해야 할 때가 있습니다. 블레이드 "프래그먼트"를 사용하면 바로 그렇게 할 수 있습니다. 시작하려면 블레이드 템플릿의 일부를 `@fragment`와 `@endfragment` 지시어 내에 배치합니다.

```blade
@fragment('user-list')
    <ul>
        @foreach ($users as $user)
            <li>{{ $user->name }}</li>
        @endforeach
    </ul>
@endfragment
```

그런 다음 이 템플릿을 활용하는 뷰를 렌더링할 때, `fragment` 메서드를 호출하여 지정된 프래그먼트만 나가는 HTTP 응답에 포함되어야 함을 지정할 수 있습니다.

```php
return view('dashboard', ['users' => $users])->fragment('user-list');
```

`fragmentIf` 메서드를 사용하면 주어진 조건에 따라 뷰의 프래그먼트를 조건부로 반환할 수 있습니다. 그렇지 않으면 전체 뷰가 반환됩니다.

```php
return view('dashboard', ['users' => $users])
    ->fragmentIf($request->hasHeader('HX-Request'), 'user-list');
```

`fragments`와 `fragmentsIf` 메서드를 사용하면 응답에서 여러 뷰 프래그먼트를 반환할 수 있습니다. 프래그먼트는 함께 연결됩니다.

```php
view('dashboard', ['users' => $users])
    ->fragments(['user-list', 'comment-list']);

view('dashboard', ['users' => $users])
    ->fragmentsIf(
        $request->hasHeader('HX-Request'),
        ['user-list', 'comment-list']
    );
```

<a name="extending-blade"></a>
## 블레이드 확장

블레이드를 사용하면 `directive` 메서드를 사용하여 자체 커스텀 지시어를 정의할 수 있습니다. 블레이드 컴파일러가 커스텀 지시어를 만나면 지시어에 포함된 표현식과 함께 제공된 콜백을 호출합니다.

다음 예제는 `DateTime` 인스턴스여야 하는 주어진 `$var`를 포맷하는 `@datetime($var)` 지시어를 만듭니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 등록합니다.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Blade::directive('datetime', function (string $expression) {
            return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
        });
    }
}
```

보시다시피 지시어에 전달된 표현식에 `format` 메서드를 체인합니다. 따라서 이 예제에서 이 지시어에 의해 생성된 최종 PHP는 다음과 같습니다.

```php
<?php echo ($var)->format('m/d/Y H:i'); ?>
```

> [!WARNING]  
> 블레이드 지시어의 로직을 업데이트한 후에는 캐시된 모든 블레이드 뷰를 삭제해야 합니다. 캐시된 블레이드 뷰는 `view:clear` Artisan 명령을 사용하여 제거할 수 있습니다.

<a name="custom-echo-handlers"></a>
### 커스텀 Echo 핸들러

블레이드를 사용하여 객체를 "echo"하려고 하면 객체의 `__toString` 메서드가 호출됩니다. [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP의 내장 "매직 메서드" 중 하나입니다. 그러나 때때로 상호 작용하는 클래스가 타사 라이브러리에 속하는 경우와 같이 주어진 클래스의 `__toString` 메서드를 제어할 수 없을 수 있습니다.

이러한 경우 블레이드를 사용하면 해당 특정 유형의 객체에 대한 커스텀 echo 핸들러를 등록할 수 있습니다. 이를 달성하려면 블레이드의 `stringable` 메서드를 호출해야 합니다. `stringable` 메서드는 클로저를 받습니다. 이 클로저는 렌더링을 담당하는 객체의 유형을 타입 힌트해야 합니다. 일반적으로 `stringable` 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드 내에서 호출해야 합니다.

```php
use Illuminate\Support\Facades\Blade;
use Money\Money;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

커스텀 echo 핸들러가 정의되면 블레이드 템플릿에서 객체를 간단히 echo할 수 있습니다.

```blade
Cost: {{ $money }}
```

<a name="custom-if-statements"></a>
### 커스텀 If 문

커스텀 지시어를 프로그래밍하는 것은 간단한 커스텀 조건문을 정의할 때 필요 이상으로 복잡할 때가 있습니다. 이러한 이유로 블레이드는 클로저를 사용하여 커스텀 조건부 지시어를 빠르게 정의할 수 있는 `Blade::if` 메서드를 제공합니다. 예를 들어, 애플리케이션에 대해 구성된 기본 "disk"를 확인하는 커스텀 조건을 정의해 봅시다. `AppServiceProvider`의 `boot` 메서드에서 이를 수행할 수 있습니다.

```php
use Illuminate\Support\Facades\Blade;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::if('disk', function (string $value) {
        return config('filesystems.default') === $value;
    });
}
```

커스텀 조건이 정의되면 템플릿 내에서 사용할 수 있습니다.

```blade
@disk('local')
    <!-- 애플리케이션이 local disk를 사용하고 있습니다... -->
@elsedisk('s3')
    <!-- 애플리케이션이 s3 disk를 사용하고 있습니다... -->
@else
    <!-- 애플리케이션이 다른 disk를 사용하고 있습니다... -->
@enddisk

@unlessdisk('local')
    <!-- 애플리케이션이 local disk를 사용하고 있지 않습니다... -->
@enddisk
```

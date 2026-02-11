# 지역화(Localization)

- [소개](#introduction)
    - [언어 파일 퍼블리싱](#publishing-the-language-files)
    - [로케일 설정](#configuring-the-locale)
    - [복수형 언어](#pluralization-language)
- [번역 문자열 정의](#defining-translation-strings)
    - [짧은 키 사용](#using-short-keys)
    - [번역 문자열을 키로 사용](#using-translation-strings-as-keys)
- [번역 문자열 조회](#retrieving-translation-strings)
    - [번역 문자열에서 파라미터 치환](#replacing-parameters-in-translation-strings)
    - [복수형](#pluralization)
- [패키지 언어 파일 오버라이드](#overriding-package-language-files)

<a name="introduction"></a>
## 소개

> [!NOTE]
> 기본적으로 Laravel 애플리케이션 스켈레톤에는 `lang` 디렉토리가 포함되어 있지 않습니다. Laravel의 언어 파일을 커스터마이즈하려면 `lang:publish` Artisan 명령어를 통해 퍼블리싱할 수 있습니다.

Laravel의 지역화 기능은 다양한 언어로 문자열을 조회할 수 있는 편리한 방법을 제공하여, 애플리케이션 내에서 여러 언어를 쉽게 지원할 수 있게 해줍니다.

Laravel은 번역 문자열을 관리하는 두 가지 방법을 제공합니다. 첫 번째로, 언어 문자열은 애플리케이션의 `lang` 디렉토리 내의 파일에 저장될 수 있습니다. 이 디렉토리 내에는 애플리케이션이 지원하는 각 언어에 대한 하위 디렉토리가 있을 수 있습니다. 이것은 Laravel이 유효성 검사 오류 메시지와 같은 내장 Laravel 기능의 번역 문자열을 관리하는 데 사용하는 방식입니다.

```text
/lang
    /en
        messages.php
    /es
        messages.php
```

또는, 번역 문자열은 `lang` 디렉토리 내에 배치된 JSON 파일에 정의될 수 있습니다. 이 방식을 사용할 때, 애플리케이션이 지원하는 각 언어는 이 디렉토리 내에 해당 JSON 파일을 갖게 됩니다. 이 방식은 번역할 문자열이 많은 애플리케이션에 권장됩니다.

```text
/lang
    en.json
    es.json
```

이 문서에서는 번역 문자열을 관리하는 각 방식에 대해 설명합니다.

<a name="publishing-the-language-files"></a>
### 언어 파일 퍼블리싱

기본적으로 Laravel 애플리케이션 스켈레톤에는 `lang` 디렉토리가 포함되어 있지 않습니다. Laravel의 언어 파일을 커스터마이즈하거나 직접 만들고 싶다면, `lang:publish` Artisan 명령어를 통해 `lang` 디렉토리를 생성해야 합니다. `lang:publish` 명령어는 애플리케이션에 `lang` 디렉토리를 생성하고 Laravel에서 사용하는 기본 언어 파일 세트를 퍼블리싱합니다.

```shell
php artisan lang:publish
```

<a name="configuring-the-locale"></a>
### 로케일 설정

애플리케이션의 기본 언어는 `config/app.php` 설정 파일의 `locale` 설정 옵션에 저장되며, 일반적으로 `APP_LOCALE` 환경 변수를 사용하여 설정됩니다. 애플리케이션의 필요에 맞게 이 값을 자유롭게 수정할 수 있습니다.

기본 언어에 주어진 번역 문자열이 포함되지 않은 경우 사용될 "대체 언어(fallback language)"도 설정할 수 있습니다. 기본 언어와 마찬가지로, 대체 언어도 `config/app.php` 설정 파일에서 설정되며, 그 값은 일반적으로 `APP_FALLBACK_LOCALE` 환경 변수를 사용하여 설정됩니다.

`App` 파사드(Facade)가 제공하는 `setLocale` 메서드를 사용하여 런타임에 단일 HTTP 요청에 대한 기본 언어를 수정할 수 있습니다.

```php
use Illuminate\Support\Facades\App;

Route::get('/greeting/{locale}', function (string $locale) {
    if (! in_array($locale, ['en', 'es', 'fr'])) {
        abort(400);
    }

    App::setLocale($locale);

    // ...
});
```

<a name="determining-the-current-locale"></a>
#### 현재 로케일 확인

`App` 파사드의 `currentLocale` 및 `isLocale` 메서드를 사용하여 현재 로케일을 확인하거나 로케일이 주어진 값인지 확인할 수 있습니다.

```php
use Illuminate\Support\Facades\App;

$locale = App::currentLocale();

if (App::isLocale('en')) {
    // ...
}
```

<a name="pluralization-language"></a>
### 복수형 언어

Eloquent 및 프레임워크의 다른 부분에서 단수 문자열을 복수 문자열로 변환하는 데 사용되는 Laravel의 "복수화 도구(pluralizer)"에 영어 이외의 언어를 사용하도록 지시할 수 있습니다. 이는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드 내에서 `useLanguage` 메서드를 호출하여 수행할 수 있습니다. 복수화 도구가 현재 지원하는 언어는 `french`, `norwegian-bokmal`, `portuguese`, `spanish`, `turkish`입니다.

```php
use Illuminate\Support\Pluralizer;

/**
 * 애플리케이션 서비스 부트스트랩.
 */
public function boot(): void
{
    Pluralizer::useLanguage('spanish');

    // ...
}
```

> [!WARNING]
> 복수화 도구의 언어를 커스터마이즈하는 경우, Eloquent 모델의 [테이블 이름](/docs/{{version}}/eloquent#table-names)을 명시적으로 정의해야 합니다.

<a name="defining-translation-strings"></a>
## 번역 문자열 정의

<a name="using-short-keys"></a>
### 짧은 키 사용

일반적으로 번역 문자열은 `lang` 디렉토리 내의 파일에 저장됩니다. 이 디렉토리 내에는 애플리케이션이 지원하는 각 언어에 대한 하위 디렉토리가 있어야 합니다. 이것은 Laravel이 유효성 검사 오류 메시지와 같은 내장 Laravel 기능의 번역 문자열을 관리하는 데 사용하는 방식입니다.

```text
/lang
    /en
        messages.php
    /es
        messages.php
```

모든 언어 파일은 키가 있는 문자열 배열을 반환합니다. 예를 들어:

```php
<?php

// lang/en/messages.php

return [
    'welcome' => 'Welcome to our application!',
];
```

> [!WARNING]
> 지역에 따라 다른 언어의 경우, ISO 15897에 따라 언어 디렉토리 이름을 지정해야 합니다. 예를 들어, 영국 영어의 경우 "en-gb" 대신 "en_GB"를 사용해야 합니다.

<a name="using-translation-strings-as-keys"></a>
### 번역 문자열을 키로 사용

번역할 문자열이 많은 애플리케이션의 경우, 모든 문자열을 "짧은 키"로 정의하면 뷰에서 키를 참조할 때 혼란스러워질 수 있으며, 애플리케이션이 지원하는 모든 번역 문자열에 대해 계속해서 키를 만들어내는 것이 번거롭습니다.

이러한 이유로, Laravel은 문자열의 "기본" 번역을 키로 사용하여 번역 문자열을 정의하는 것도 지원합니다. 번역 문자열을 키로 사용하는 언어 파일은 `lang` 디렉토리에 JSON 파일로 저장됩니다. 예를 들어, 애플리케이션에 스페인어 번역이 있다면 `lang/es.json` 파일을 생성해야 합니다.

```json
{
    "I love programming.": "Me encanta programar."
}
```

#### 키 / 파일 충돌

다른 번역 파일명과 충돌하는 번역 문자열 키를 정의해서는 안 됩니다. 예를 들어, "NL" 로케일에서 `__('Action')`을 번역할 때 `nl/action.php` 파일은 존재하지만 `nl.json` 파일이 존재하지 않으면, 번역기가 `nl/action.php`의 전체 내용을 반환하게 됩니다.

<a name="retrieving-translation-strings"></a>
## 번역 문자열 조회

`__` 헬퍼 함수를 사용하여 언어 파일에서 번역 문자열을 조회할 수 있습니다. 번역 문자열을 정의하는 데 "짧은 키"를 사용하는 경우, "점" 구문을 사용하여 키가 포함된 파일과 키 자체를 `__` 함수에 전달해야 합니다. 예를 들어, `lang/en/messages.php` 언어 파일에서 `welcome` 번역 문자열을 조회해 보겠습니다.

```php
echo __('messages.welcome');
```

지정된 번역 문자열이 존재하지 않으면, `__` 함수는 번역 문자열 키를 반환합니다. 따라서 위의 예제를 사용하면, 번역 문자열이 존재하지 않을 경우 `__` 함수는 `messages.welcome`을 반환합니다.

[기본 번역 문자열을 번역 키로](#using-translation-strings-as-keys) 사용하는 경우, 문자열의 기본 번역을 `__` 함수에 전달해야 합니다.

```php
echo __('I love programming.');
```

마찬가지로, 번역 문자열이 존재하지 않으면 `__` 함수는 주어진 번역 문자열 키를 반환합니다.

[Blade 템플릿 엔진](/docs/{{version}}/blade)을 사용하는 경우, `{{ }}` 출력 구문을 사용하여 번역 문자열을 표시할 수 있습니다.

```blade
{{ __('messages.welcome') }}
```

<a name="replacing-parameters-in-translation-strings"></a>
### 번역 문자열에서 파라미터 치환

원한다면 번역 문자열에 플레이스홀더를 정의할 수 있습니다. 모든 플레이스홀더는 `:`로 시작합니다. 예를 들어, 플레이스홀더 이름이 있는 환영 메시지를 정의할 수 있습니다.

```php
'welcome' => 'Welcome, :name',
```

번역 문자열을 조회할 때 플레이스홀더를 치환하려면, `__` 함수의 두 번째 인수로 치환 배열을 전달할 수 있습니다.

```php
echo __('messages.welcome', ['name' => 'dayle']);
```

플레이스홀더가 모두 대문자이거나 첫 글자만 대문자인 경우, 번역된 값도 그에 따라 대문자로 표시됩니다.

```php
'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle
```

<a name="object-replacement-formatting"></a>
#### 객체 치환 포맷팅

번역 플레이스홀더로 객체를 제공하려고 하면, 객체의 `__toString` 메서드가 호출됩니다. [__toString](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP의 내장 "매직 메서드" 중 하나입니다. 그러나 때로는 상호작용하는 클래스가 서드파티 라이브러리에 속하는 경우처럼 주어진 클래스의 `__toString` 메서드를 제어할 수 없는 경우가 있습니다.

이러한 경우, Laravel은 특정 유형의 객체에 대한 사용자 정의 포맷팅 핸들러를 등록할 수 있게 해줍니다. 이를 수행하려면 번역기의 `stringable` 메서드를 호출해야 합니다. `stringable` 메서드는 포맷팅을 담당할 객체 유형을 타입힌트해야 하는 클로저를 받습니다. 일반적으로, `stringable` 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드 내에서 호출되어야 합니다.

```php
use Illuminate\Support\Facades\Lang;
use Money\Money;

/**
 * 애플리케이션 서비스 부트스트랩.
 */
public function boot(): void
{
    Lang::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

<a name="pluralization"></a>
### 복수형

복수형 처리는 복잡한 문제입니다. 언어마다 복수형에 대한 다양하고 복잡한 규칙이 있기 때문입니다. 하지만 Laravel은 정의한 복수형 규칙에 따라 문자열을 다르게 번역하는 데 도움을 줄 수 있습니다. `|` 문자를 사용하여 문자열의 단수형과 복수형을 구분할 수 있습니다.

```php
'apples' => 'There is one apple|There are many apples',
```

물론, [번역 문자열을 키로 사용](#using-translation-strings-as-keys)할 때도 복수형이 지원됩니다.

```json
{
    "There is one apple|There are many apples": "Hay una manzana|Hay muchas manzanas"
}
```

여러 값 범위에 대한 번역 문자열을 지정하는 더 복잡한 복수형 규칙도 만들 수 있습니다.

```php
'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',
```

복수형 옵션이 있는 번역 문자열을 정의한 후, `trans_choice` 함수를 사용하여 주어진 "count"에 맞는 줄을 조회할 수 있습니다. 이 예제에서는 count가 1보다 크므로 번역 문자열의 복수형이 반환됩니다.

```php
echo trans_choice('messages.apples', 10);
```

복수형 문자열에서 플레이스홀더 속성을 정의할 수도 있습니다. 이 플레이스홀더는 `trans_choice` 함수의 세 번째 인수로 배열을 전달하여 치환할 수 있습니다.

```php
'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

echo trans_choice('time.minutes_ago', 5, ['value' => 5]);
```

`trans_choice` 함수에 전달된 정수 값을 표시하려면 내장 `:count` 플레이스홀더를 사용할 수 있습니다.

```php
'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',
```

<a name="overriding-package-language-files"></a>
## 패키지 언어 파일 오버라이드

일부 패키지는 자체 언어 파일과 함께 제공될 수 있습니다. 이러한 줄을 조정하기 위해 패키지의 코어 파일을 변경하는 대신, `lang/vendor/{package}/{locale}` 디렉토리에 파일을 배치하여 오버라이드할 수 있습니다.

예를 들어, `skyrim/hearthfire`라는 패키지의 `messages.php`에 있는 영어 번역 문자열을 오버라이드해야 한다면, 언어 파일을 `lang/vendor/hearthfire/en/messages.php`에 배치해야 합니다. 이 파일 내에서는 오버라이드하려는 번역 문자열만 정의해야 합니다. 오버라이드하지 않은 번역 문자열은 패키지의 원본 언어 파일에서 여전히 로드됩니다.

# 패키지 개발(Package Development)

- [소개](#introduction)
    - [파사드에 대한 참고사항](#a-note-on-facades)
- [패키지 자동 감지](#package-discovery)
- [서비스 프로바이더](#service-providers)
- [리소스](#resources)
    - [설정](#configuration)
    - [마이그레이션](#migrations)
    - [라우트](#routes)
    - [언어 파일](#language-files)
    - [뷰](#views)
    - [뷰 컴포넌트](#view-components)
    - ["About" 아티즌 명령어](#about-artisan-command)
- [명령어](#commands)
- [퍼블릭 에셋](#public-assets)
- [파일 그룹 퍼블리싱](#publishing-file-groups)

<a name="introduction"></a>
## 소개

패키지는 Laravel에 기능을 추가하는 주요 방법입니다. 패키지는 [Carbon](https://github.com/briannesbitt/Carbon)처럼 날짜를 처리하는 훌륭한 도구일 수도 있고, Spatie의 [Laravel Media Library](https://github.com/spatie/laravel-medialibrary)처럼 Eloquent 모델에 파일을 연결할 수 있게 해주는 패키지일 수도 있습니다.

패키지에는 여러 유형이 있습니다. 일부 패키지는 독립형(stand-alone)으로, 어떤 PHP 프레임워크에서든 작동합니다. Carbon과 PHPUnit이 독립형 패키지의 예입니다. 이러한 패키지들은 `composer.json` 파일에서 요구하면 Laravel과 함께 사용할 수 있습니다.

반면에, 다른 패키지들은 특별히 Laravel과 함께 사용하도록 만들어졌습니다. 이러한 패키지들은 Laravel 애플리케이션을 향상시키기 위한 라우트, 컨트롤러, 뷰, 설정을 포함할 수 있습니다. 이 가이드는 주로 Laravel 전용 패키지의 개발을 다룹니다.

<a name="a-note-on-facades"></a>
### 파사드에 대한 참고사항

Laravel 애플리케이션을 작성할 때, 컨트랙트(Contract)를 사용하든 파사드(Facade)를 사용하든 본질적으로 동일한 수준의 테스트 가능성을 제공하기 때문에 일반적으로 중요하지 않습니다. 그러나 패키지를 작성할 때는 패키지가 일반적으로 Laravel의 모든 테스트 헬퍼에 접근할 수 없습니다. 패키지가 일반적인 Laravel 애플리케이션 내에 설치된 것처럼 패키지 테스트를 작성하려면 [Orchestral Testbench](https://github.com/orchestral/testbench) 패키지를 사용할 수 있습니다.

<a name="package-discovery"></a>
## 패키지 자동 감지(Package Discovery)

Laravel 애플리케이션의 `config/app.php` 설정 파일에서 `providers` 옵션은 Laravel이 로드해야 하는 서비스 프로바이더 목록을 정의합니다. 누군가 패키지를 설치할 때, 일반적으로 서비스 프로바이더가 이 목록에 포함되기를 원할 것입니다. 사용자가 수동으로 서비스 프로바이더를 목록에 추가하도록 요구하는 대신, 패키지의 `composer.json` 파일의 `extra` 섹션에 프로바이더를 정의할 수 있습니다. 서비스 프로바이더 외에도 등록하려는 [파사드](/docs/{{version}}/facades)를 나열할 수도 있습니다:

```json
"extra": {
    "laravel": {
        "providers": [
            "Barryvdh\\Debugbar\\ServiceProvider"
        ],
        "aliases": {
            "Debugbar": "Barryvdh\\Debugbar\\Facade"
        }
    }
},
```

패키지가 자동 감지를 위해 구성되면, Laravel은 패키지가 설치될 때 서비스 프로바이더와 파사드를 자동으로 등록하여 패키지 사용자에게 편리한 설치 경험을 제공합니다.

<a name="opting-out-of-package-discovery"></a>
#### 패키지 자동 감지 비활성화

패키지의 사용자이고 특정 패키지에 대해 패키지 자동 감지를 비활성화하려면, 애플리케이션의 `composer.json` 파일의 `extra` 섹션에 패키지 이름을 나열할 수 있습니다:

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

애플리케이션의 `dont-discover` 지시문 내에서 `*` 문자를 사용하여 모든 패키지에 대해 패키지 자동 감지를 비활성화할 수 있습니다:

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "*"
        ]
    }
},
```

<a name="service-providers"></a>
## 서비스 프로바이더(Service Providers)

[서비스 프로바이더](/docs/{{version}}/providers)는 패키지와 Laravel 간의 연결 지점입니다. 서비스 프로바이더는 Laravel의 [서비스 컨테이너](/docs/{{version}}/container)에 항목을 바인딩하고, 뷰, 설정, 언어 파일과 같은 패키지 리소스를 어디서 로드할지 Laravel에 알려주는 역할을 합니다.

서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 확장하며 `register`와 `boot` 두 가지 메서드를 포함합니다. 기본 `ServiceProvider` 클래스는 `illuminate/support` Composer 패키지에 있으며, 이를 자신의 패키지 의존성에 추가해야 합니다. 서비스 프로바이더의 구조와 목적에 대해 더 알아보려면 [해당 문서](/docs/{{version}}/providers)를 확인하세요.

<a name="resources"></a>
## 리소스(Resources)

<a name="configuration"></a>
### 설정(Configuration)

일반적으로 패키지의 설정 파일을 애플리케이션의 `config` 디렉토리에 퍼블리시해야 합니다. 이렇게 하면 패키지 사용자가 기본 설정 옵션을 쉽게 재정의할 수 있습니다. 설정 파일을 퍼블리시할 수 있도록 하려면 서비스 프로바이더의 `boot` 메서드에서 `publishes` 메서드를 호출하세요:

```php
/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../config/courier.php' => config_path('courier.php'),
    ]);
}
```

이제 패키지 사용자가 Laravel의 `vendor:publish` 명령어를 실행하면, 파일이 지정된 퍼블리시 위치로 복사됩니다. 설정이 퍼블리시되면, 다른 설정 파일처럼 해당 값에 접근할 수 있습니다:

```php
$value = config('courier.option');
```

> [!WARNING]
> 설정 파일에 클로저를 정의해서는 안 됩니다. 사용자가 `config:cache` 아티즌 명령어를 실행할 때 올바르게 직렬화되지 않습니다.

<a name="default-package-configuration"></a>
#### 기본 패키지 설정

패키지의 자체 설정 파일을 애플리케이션의 퍼블리시된 복사본과 병합할 수도 있습니다. 이렇게 하면 사용자가 퍼블리시된 설정 파일의 복사본에서 실제로 재정의하려는 옵션만 정의할 수 있습니다. 설정 파일 값을 병합하려면 서비스 프로바이더의 `register` 메서드 내에서 `mergeConfigFrom` 메서드를 사용하세요.

`mergeConfigFrom` 메서드는 패키지의 설정 파일 경로를 첫 번째 인자로, 애플리케이션의 설정 파일 복사본 이름을 두 번째 인자로 받습니다:

```php
/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    $this->mergeConfigFrom(
        __DIR__.'/../config/courier.php', 'courier'
    );
}
```

> [!WARNING]
> 이 메서드는 설정 배열의 첫 번째 레벨만 병합합니다. 사용자가 다차원 설정 배열을 부분적으로 정의하면, 누락된 옵션은 병합되지 않습니다.

<a name="routes"></a>
### 라우트(Routes)

패키지에 라우트가 포함되어 있다면 `loadRoutesFrom` 메서드를 사용하여 로드할 수 있습니다. 이 메서드는 애플리케이션의 라우트가 캐시되었는지 자동으로 확인하고, 라우트가 이미 캐시된 경우 라우트 파일을 로드하지 않습니다:

```php
/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
}
```

<a name="migrations"></a>
### 마이그레이션(Migrations)

패키지에 [데이터베이스 마이그레이션](/docs/{{version}}/migrations)이 포함되어 있다면, `loadMigrationsFrom` 메서드를 사용하여 Laravel에 마이그레이션을 로드하는 방법을 알릴 수 있습니다. `loadMigrationsFrom` 메서드는 패키지의 마이그레이션 경로를 유일한 인자로 받습니다:

```php
/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
}
```

패키지의 마이그레이션이 등록되면, `php artisan migrate` 명령어가 실행될 때 자동으로 실행됩니다. 애플리케이션의 `database/migrations` 디렉토리로 내보낼 필요가 없습니다.

<a name="language-files"></a>
### 언어 파일(Language Files)

패키지에 [언어 파일](/docs/{{version}}/localization)이 포함되어 있다면, `loadTranslationsFrom` 메서드를 사용하여 Laravel에 해당 파일을 로드하는 방법을 알려줄 수 있습니다. 예를 들어, 패키지 이름이 `courier`라면 서비스 프로바이더의 `boot` 메서드에 다음을 추가해야 합니다:

```php
/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
}
```

패키지 번역 라인은 `package::file.line` 구문 규칙을 사용하여 참조됩니다. 따라서 `courier` 패키지의 `messages` 파일에서 `welcome` 라인을 다음과 같이 로드할 수 있습니다:

```php
echo trans('courier::messages.welcome');
```

`loadJsonTranslationsFrom` 메서드를 사용하여 패키지의 JSON 번역 파일을 등록할 수 있습니다. 이 메서드는 패키지의 JSON 번역 파일이 포함된 디렉토리 경로를 받습니다:

```php
/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    $this->loadJsonTranslationsFrom(__DIR__.'/../lang');
}
```

<a name="publishing-language-files"></a>
#### 언어 파일 퍼블리싱

패키지의 언어 파일을 애플리케이션의 `lang/vendor` 디렉토리에 퍼블리시하려면 서비스 프로바이더의 `publishes` 메서드를 사용할 수 있습니다. `publishes` 메서드는 패키지 경로와 원하는 퍼블리시 위치의 배열을 받습니다. 예를 들어, `courier` 패키지의 언어 파일을 퍼블리시하려면 다음과 같이 할 수 있습니다:

```php
/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');

    $this->publishes([
        __DIR__.'/../lang' => $this->app->langPath('vendor/courier'),
    ]);
}
```

이제 패키지 사용자가 Laravel의 `vendor:publish` 아티즌 명령어를 실행하면, 패키지의 언어 파일이 지정된 퍼블리시 위치로 퍼블리시됩니다.

<a name="views"></a>
### 뷰(Views)

패키지의 [뷰](/docs/{{version}}/views)를 Laravel에 등록하려면, 뷰가 어디에 있는지 Laravel에 알려줘야 합니다. 서비스 프로바이더의 `loadViewsFrom` 메서드를 사용하여 이를 수행할 수 있습니다. `loadViewsFrom` 메서드는 두 개의 인자를 받습니다: 뷰 템플릿 경로와 패키지 이름. 예를 들어, 패키지 이름이 `courier`라면 서비스 프로바이더의 `boot` 메서드에 다음을 추가합니다:

```php
/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
}
```

패키지 뷰는 `package::view` 구문 규칙을 사용하여 참조됩니다. 따라서 뷰 경로가 서비스 프로바이더에 등록되면, `courier` 패키지의 `dashboard` 뷰를 다음과 같이 로드할 수 있습니다:

```php
Route::get('/dashboard', function () {
    return view('courier::dashboard');
});
```

<a name="overriding-package-views"></a>
#### 패키지 뷰 재정의

`loadViewsFrom` 메서드를 사용하면, Laravel은 실제로 뷰에 대해 두 개의 위치를 등록합니다: 애플리케이션의 `resources/views/vendor` 디렉토리와 지정한 디렉토리. 따라서 `courier` 패키지를 예로 들면, Laravel은 먼저 개발자가 `resources/views/vendor/courier` 디렉토리에 커스텀 버전의 뷰를 배치했는지 확인합니다. 그런 다음, 뷰가 커스터마이즈되지 않았다면, Laravel은 `loadViewsFrom` 호출에서 지정한 패키지 뷰 디렉토리를 검색합니다. 이렇게 하면 패키지 사용자가 패키지의 뷰를 쉽게 커스터마이즈/재정의할 수 있습니다.

<a name="publishing-views"></a>
#### 뷰 퍼블리싱

뷰를 애플리케이션의 `resources/views/vendor` 디렉토리에 퍼블리시할 수 있도록 하려면 서비스 프로바이더의 `publishes` 메서드를 사용할 수 있습니다. `publishes` 메서드는 패키지 뷰 경로와 원하는 퍼블리시 위치의 배열을 받습니다:

```php
/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');

    $this->publishes([
        __DIR__.'/../resources/views' => resource_path('views/vendor/courier'),
    ]);
}
```

이제 패키지 사용자가 Laravel의 `vendor:publish` 아티즌 명령어를 실행하면, 패키지의 뷰가 지정된 퍼블리시 위치로 복사됩니다.

<a name="view-components"></a>
### 뷰 컴포넌트(View Components)

Blade 컴포넌트를 활용하는 패키지를 구축하거나 컴포넌트를 비표준 디렉토리에 배치하는 경우, 컴포넌트 클래스와 해당 HTML 태그 별칭을 수동으로 등록하여 Laravel이 컴포넌트를 찾을 위치를 알 수 있도록 해야 합니다. 일반적으로 패키지의 서비스 프로바이더의 `boot` 메서드에서 컴포넌트를 등록해야 합니다:

```php
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::component('package-alert', AlertComponent::class);
}
```

컴포넌트가 등록되면 태그 별칭을 사용하여 렌더링할 수 있습니다:

```blade
<x-package-alert/>
```

<a name="autoloading-package-components"></a>
#### 패키지 컴포넌트 자동 로딩

또는 `componentNamespace` 메서드를 사용하여 규칙에 따라 컴포넌트 클래스를 자동으로 로드할 수 있습니다. 예를 들어, `Nightshade` 패키지에 `Nightshade\Views\Components` 네임스페이스 내에 있는 `Calendar`와 `ColorPicker` 컴포넌트가 있을 수 있습니다:

```php
use Illuminate\Support\Facades\Blade;

/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 하면 `package-name::` 구문을 사용하여 벤더 네임스페이스로 패키지 컴포넌트를 사용할 수 있습니다:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼 케이스로 변환하여 이 컴포넌트에 연결된 클래스를 자동으로 감지합니다. "점" 표기법을 사용한 하위 디렉토리도 지원됩니다.

<a name="anonymous-components"></a>
#### 익명 컴포넌트(Anonymous Components)

패키지에 익명 컴포넌트가 포함되어 있다면, 패키지의 "views" 디렉토리([`loadViewsFrom` 메서드](#views)로 지정된)의 `components` 디렉토리 내에 배치해야 합니다. 그런 다음 패키지의 뷰 네임스페이스를 컴포넌트 이름 앞에 붙여서 렌더링할 수 있습니다:

```blade
<x-courier::alert />
```

<a name="about-artisan-command"></a>
### "About" 아티즌 명령어

Laravel의 내장 `about` 아티즌 명령어는 애플리케이션의 환경과 설정에 대한 개요를 제공합니다. 패키지는 `AboutCommand` 클래스를 통해 이 명령어의 출력에 추가 정보를 푸시할 수 있습니다. 일반적으로 이 정보는 패키지 서비스 프로바이더의 `boot` 메서드에서 추가할 수 있습니다:

```php
use Illuminate\Foundation\Console\AboutCommand;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    AboutCommand::add('My Package', fn () => ['Version' => '1.0.0']);
}
```

<a name="commands"></a>
## 명령어(Commands)

패키지의 아티즌 명령어를 Laravel에 등록하려면 `commands` 메서드를 사용할 수 있습니다. 이 메서드는 명령어 클래스 이름의 배열을 받습니다. 명령어가 등록되면 [아티즌 CLI](/docs/{{version}}/artisan)를 사용하여 실행할 수 있습니다:

```php
use Courier\Console\Commands\InstallCommand;
use Courier\Console\Commands\NetworkCommand;

/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    if ($this->app->runningInConsole()) {
        $this->commands([
            InstallCommand::class,
            NetworkCommand::class,
        ]);
    }
}
```

<a name="public-assets"></a>
## 퍼블릭 에셋(Public Assets)

패키지에 JavaScript, CSS, 이미지와 같은 에셋이 있을 수 있습니다. 이러한 에셋을 애플리케이션의 `public` 디렉토리에 퍼블리시하려면 서비스 프로바이더의 `publishes` 메서드를 사용하세요. 이 예제에서는 관련 에셋 그룹을 쉽게 퍼블리시하는 데 사용할 수 있는 `public` 에셋 그룹 태그도 추가합니다:

```php
/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../public' => public_path('vendor/courier'),
    ], 'public');
}
```

이제 패키지 사용자가 `vendor:publish` 명령어를 실행하면, 에셋이 지정된 퍼블리시 위치로 복사됩니다. 사용자는 일반적으로 패키지가 업데이트될 때마다 에셋을 덮어써야 하므로 `--force` 플래그를 사용할 수 있습니다:

```shell
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## 파일 그룹 퍼블리싱(Publishing File Groups)

패키지 에셋과 리소스 그룹을 별도로 퍼블리시하고 싶을 수 있습니다. 예를 들어, 사용자가 패키지의 에셋을 퍼블리시하지 않고도 패키지의 설정 파일을 퍼블리시할 수 있도록 할 수 있습니다. 패키지의 서비스 프로바이더에서 `publishes` 메서드를 호출할 때 "태그"를 지정하여 이를 수행할 수 있습니다. 예를 들어, 패키지 서비스 프로바이더의 `boot` 메서드에서 `courier` 패키지에 대한 두 개의 퍼블리시 그룹(`courier-config`와 `courier-migrations`)을 정의하기 위해 태그를 사용해 보겠습니다:

```php
/**
 * 패키지 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../config/package.php' => config_path('package.php')
    ], 'courier-config');

    $this->publishes([
        __DIR__.'/../database/migrations/' => database_path('migrations')
    ], 'courier-migrations');
}
```

이제 사용자가 `vendor:publish` 명령어를 실행할 때 태그를 참조하여 이러한 그룹을 별도로 퍼블리시할 수 있습니다:

```shell
php artisan vendor:publish --tag=courier-config
```

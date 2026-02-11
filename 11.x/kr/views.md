# 뷰(Views)

- [소개](#introduction)
    - [React / Vue로 뷰 작성하기](#writing-views-in-react-or-vue)
- [뷰 생성 및 렌더링](#creating-and-rendering-views)
    - [중첩된 뷰 디렉토리](#nested-view-directories)
    - [사용 가능한 첫 번째 뷰 생성하기](#creating-the-first-available-view)
    - [뷰 존재 여부 확인하기](#determining-if-a-view-exists)
- [뷰에 데이터 전달하기](#passing-data-to-views)
    - [모든 뷰와 데이터 공유하기](#sharing-data-with-all-views)
- [뷰 컴포저(View Composers)](#view-composers)
    - [뷰 크리에이터(View Creators)](#view-creators)
- [뷰 최적화](#optimizing-views)

<a name="introduction"></a>
## 소개

물론, 라우트와 컨트롤러에서 전체 HTML 문서 문자열을 직접 반환하는 것은 실용적이지 않습니다. 다행히도, 뷰(Views)는 모든 HTML을 별도의 파일에 배치할 수 있는 편리한 방법을 제공합니다.

뷰는 컨트롤러/애플리케이션 로직을 프레젠테이션 로직과 분리하며 `resources/views` 디렉토리에 저장됩니다. Laravel을 사용할 때, 뷰 템플릿은 일반적으로 [Blade 템플릿 언어](/docs/{{version}}/blade)를 사용하여 작성됩니다. 간단한 뷰는 다음과 같이 보일 수 있습니다.

```blade
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

이 뷰가 `resources/views/greeting.blade.php`에 저장되어 있으므로, 다음과 같이 전역 `view` 헬퍼를 사용하여 반환할 수 있습니다.

    Route::get('/', function () {
        return view('greeting', ['name' => 'James']);
    });

> [!NOTE]  
> Blade 템플릿 작성 방법에 대한 더 많은 정보를 찾고 계신가요? 시작하려면 전체 [Blade 문서](/docs/{{version}}/blade)를 확인하세요.

<a name="writing-views-in-react-or-vue"></a>
### React / Vue로 뷰 작성하기

Blade를 통해 PHP로 프론트엔드 템플릿을 작성하는 대신, 많은 개발자들이 React 또는 Vue를 사용하여 템플릿을 작성하는 것을 선호하기 시작했습니다. Laravel은 [Inertia](https://inertiajs.com/) 덕분에 이를 쉽게 만들어 줍니다. Inertia는 일반적인 SPA 구축의 복잡성 없이 React / Vue 프론트엔드를 Laravel 백엔드에 연결하는 것을 아주 쉽게 해주는 라이브러리입니다.

Breeze와 Jetstream [스타터 킷](/docs/{{version}}/starter-kits)은 Inertia로 구동되는 다음 Laravel 애플리케이션을 위한 훌륭한 시작점을 제공합니다. 또한, [Laravel Bootcamp](https://bootcamp.laravel.com)에서는 Vue와 React 예제를 포함하여 Inertia로 구동되는 Laravel 애플리케이션을 구축하는 전체 데모를 제공합니다.

<a name="creating-and-rendering-views"></a>
## 뷰 생성 및 렌더링

애플리케이션의 `resources/views` 디렉토리에 `.blade.php` 확장자를 가진 파일을 배치하거나 `make:view` Artisan 명령어를 사용하여 뷰를 생성할 수 있습니다.

```shell
php artisan make:view greeting
```

`.blade.php` 확장자는 프레임워크에 해당 파일이 [Blade 템플릿](/docs/{{version}}/blade)을 포함하고 있음을 알려줍니다. Blade 템플릿은 HTML뿐만 아니라 값을 쉽게 출력하고, "if" 문을 생성하고, 데이터를 반복하는 등의 작업을 수행할 수 있게 해주는 Blade 디렉티브를 포함합니다.

뷰를 생성한 후에는 전역 `view` 헬퍼를 사용하여 애플리케이션의 라우트나 컨트롤러 중 하나에서 뷰를 반환할 수 있습니다.

    Route::get('/', function () {
        return view('greeting', ['name' => 'James']);
    });

뷰는 `View` 파사드(Facade)를 사용하여 반환할 수도 있습니다.

    use Illuminate\Support\Facades\View;

    return View::make('greeting', ['name' => 'James']);

보시다시피, `view` 헬퍼에 전달된 첫 번째 인수는 `resources/views` 디렉토리에 있는 뷰 파일의 이름에 해당합니다. 두 번째 인수는 뷰에서 사용할 수 있도록 해야 하는 데이터 배열입니다. 이 경우, [Blade 문법](/docs/{{version}}/blade)을 사용하여 뷰에 표시되는 `name` 변수를 전달하고 있습니다.

<a name="nested-view-directories"></a>
### 중첩된 뷰 디렉토리

뷰는 `resources/views` 디렉토리의 하위 디렉토리 내에 중첩될 수도 있습니다. "점" 표기법을 사용하여 중첩된 뷰를 참조할 수 있습니다. 예를 들어, 뷰가 `resources/views/admin/profile.blade.php`에 저장되어 있다면, 다음과 같이 애플리케이션의 라우트/컨트롤러에서 반환할 수 있습니다.

    return view('admin.profile', $data);

> [!WARNING]  
> 뷰 디렉토리 이름에는 `.` 문자가 포함되어서는 안 됩니다.

<a name="creating-the-first-available-view"></a>
### 사용 가능한 첫 번째 뷰 생성하기

`View` 파사드의 `first` 메소드를 사용하면 주어진 뷰 배열에서 존재하는 첫 번째 뷰를 생성할 수 있습니다. 이는 애플리케이션이나 패키지에서 뷰를 커스터마이즈하거나 덮어쓸 수 있도록 허용하는 경우에 유용할 수 있습니다.

    use Illuminate\Support\Facades\View;

    return View::first(['custom.admin', 'admin'], $data);

<a name="determining-if-a-view-exists"></a>
### 뷰 존재 여부 확인하기

뷰가 존재하는지 확인해야 하는 경우 `View` 파사드를 사용할 수 있습니다. 뷰가 존재하면 `exists` 메소드는 `true`를 반환합니다.

    use Illuminate\Support\Facades\View;

    if (View::exists('admin.profile')) {
        // ...
    }

<a name="passing-data-to-views"></a>
## 뷰에 데이터 전달하기

이전 예제에서 보았듯이, 뷰에 데이터 배열을 전달하여 해당 데이터를 뷰에서 사용할 수 있도록 할 수 있습니다.

    return view('greetings', ['name' => 'Victoria']);

이 방식으로 정보를 전달할 때, 데이터는 키/값 쌍의 배열이어야 합니다. 뷰에 데이터를 제공한 후, `<?php echo $name; ?>`과 같이 데이터의 키를 사용하여 뷰 내에서 각 값에 접근할 수 있습니다.

`view` 헬퍼 함수에 전체 데이터 배열을 전달하는 대신, `with` 메소드를 사용하여 개별 데이터 조각을 뷰에 추가할 수 있습니다. `with` 메소드는 뷰 객체의 인스턴스를 반환하므로 뷰를 반환하기 전에 메소드 체이닝을 계속할 수 있습니다.

    return view('greeting')
        ->with('name', 'Victoria')
        ->with('occupation', 'Astronaut');

<a name="sharing-data-with-all-views"></a>
### 모든 뷰와 데이터 공유하기

때때로, 애플리케이션에서 렌더링되는 모든 뷰와 데이터를 공유해야 할 수 있습니다. `View` 파사드의 `share` 메소드를 사용하여 이를 수행할 수 있습니다. 일반적으로, 서비스 프로바이더(Service Provider)의 `boot` 메소드 내에서 `share` 메소드를 호출해야 합니다. `App\Providers\AppServiceProvider` 클래스에 추가하거나 별도의 서비스 프로바이더를 생성하여 추가할 수 있습니다.

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\View;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Register any application services.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            View::share('key', 'value');
        }
    }

<a name="view-composers"></a>
## 뷰 컴포저(View Composers)

뷰 컴포저는 뷰가 렌더링될 때 호출되는 콜백 또는 클래스 메소드입니다. 뷰가 렌더링될 때마다 뷰에 바인딩하고 싶은 데이터가 있다면, 뷰 컴포저를 사용하여 해당 로직을 한 곳에 구성할 수 있습니다. 뷰 컴포저는 애플리케이션 내의 여러 라우트나 컨트롤러에서 동일한 뷰가 반환되고 항상 특정 데이터가 필요한 경우 특히 유용할 수 있습니다.

일반적으로, 뷰 컴포저는 애플리케이션의 [서비스 프로바이더](/docs/{{version}}/providers) 중 하나에 등록됩니다. 이 예제에서는 `App\Providers\AppServiceProvider`에 이 로직이 포함될 것이라고 가정합니다.

`View` 파사드의 `composer` 메소드를 사용하여 뷰 컴포저를 등록합니다. Laravel은 클래스 기반 뷰 컴포저를 위한 기본 디렉토리를 포함하지 않으므로, 원하는 대로 구성할 수 있습니다. 예를 들어, 애플리케이션의 모든 뷰 컴포저를 보관하기 위해 `app/View/Composers` 디렉토리를 생성할 수 있습니다.

    <?php

    namespace App\Providers;

    use App\View\Composers\ProfileComposer;
    use Illuminate\Support\Facades;
    use Illuminate\Support\ServiceProvider;
    use Illuminate\View\View;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Register any application services.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            // Using class based composers...
            Facades\View::composer('profile', ProfileComposer::class);

            // Using closure based composers...
            Facades\View::composer('welcome', function (View $view) {
                // ...
            });

            Facades\View::composer('dashboard', function (View $view) {
                // ...
            });
        }
    }

이제 컴포저를 등록했으므로, `profile` 뷰가 렌더링될 때마다 `App\View\Composers\ProfileComposer` 클래스의 `compose` 메소드가 실행됩니다. 컴포저 클래스의 예제를 살펴보겠습니다.

    <?php

    namespace App\View\Composers;

    use App\Repositories\UserRepository;
    use Illuminate\View\View;

    class ProfileComposer
    {
        /**
         * Create a new profile composer.
         */
        public function __construct(
            protected UserRepository $users,
        ) {}

        /**
         * Bind data to the view.
         */
        public function compose(View $view): void
        {
            $view->with('count', $this->users->count());
        }
    }

보시다시피, 모든 뷰 컴포저는 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)를 통해 해결되므로, 컴포저의 생성자 내에서 필요한 모든 의존성을 타입 힌트할 수 있습니다.

<a name="attaching-a-composer-to-multiple-views"></a>
#### 여러 뷰에 컴포저 연결하기

`composer` 메소드의 첫 번째 인수로 뷰 배열을 전달하여 한 번에 여러 뷰에 뷰 컴포저를 연결할 수 있습니다.

    use App\Views\Composers\MultiComposer;
    use Illuminate\Support\Facades\View;

    View::composer(
        ['profile', 'dashboard'],
        MultiComposer::class
    );

`composer` 메소드는 `*` 문자를 와일드카드로 사용할 수 있어, 모든 뷰에 컴포저를 연결할 수 있습니다.

    use Illuminate\Support\Facades;
    use Illuminate\View\View;

    Facades\View::composer('*', function (View $view) {
        // ...
    });

<a name="view-creators"></a>
### 뷰 크리에이터(View Creators)

뷰 "크리에이터"는 뷰 컴포저와 매우 유사합니다. 그러나 뷰가 렌더링될 때까지 기다리지 않고 뷰가 인스턴스화된 직후에 실행됩니다. 뷰 크리에이터를 등록하려면 `creator` 메소드를 사용하세요.

    use App\View\Creators\ProfileCreator;
    use Illuminate\Support\Facades\View;

    View::creator('profile', ProfileCreator::class);

<a name="optimizing-views"></a>
## 뷰 최적화

기본적으로, Blade 템플릿 뷰는 요청 시 컴파일됩니다. 뷰를 렌더링하는 요청이 실행되면, Laravel은 컴파일된 버전의 뷰가 존재하는지 확인합니다. 파일이 존재하면, Laravel은 컴파일되지 않은 뷰가 컴파일된 뷰보다 더 최근에 수정되었는지 확인합니다. 컴파일된 뷰가 존재하지 않거나 컴파일되지 않은 뷰가 수정된 경우, Laravel은 뷰를 다시 컴파일합니다.

요청 중에 뷰를 컴파일하면 성능에 작은 부정적인 영향을 미칠 수 있으므로, Laravel은 애플리케이션에서 사용하는 모든 뷰를 미리 컴파일하기 위한 `view:cache` Artisan 명령어를 제공합니다. 성능 향상을 위해 배포 프로세스의 일부로 이 명령어를 실행할 수 있습니다.

```shell
php artisan view:cache
```

뷰 캐시를 지우려면 `view:clear` 명령어를 사용할 수 있습니다.

```shell
php artisan view:clear
```

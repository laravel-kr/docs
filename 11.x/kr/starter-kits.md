# 스타터 킷(Starter Kits)

- [소개](#introduction)
- [Laravel Breeze](#laravel-breeze)
    - [설치](#laravel-breeze-installation)
    - [Breeze와 Blade](#breeze-and-blade)
    - [Breeze와 Livewire](#breeze-and-livewire)
    - [Breeze와 React / Vue](#breeze-and-inertia)
    - [Breeze와 Next.js / API](#breeze-and-next)
- [Laravel Jetstream](#laravel-jetstream)

<a name="introduction"></a>
## 소개

새로운 Laravel 애플리케이션을 빠르게 시작할 수 있도록 인증 및 애플리케이션 스타터 킷을 제공하게 되어 기쁩니다. 이 킷은 애플리케이션 사용자를 등록하고 인증하는 데 필요한 라우트, 컨트롤러 및 뷰를 자동으로 스캐폴딩합니다.

이 스타터 킷을 사용하는 것은 환영하지만, 필수는 아닙니다. Laravel을 새로 설치하여 처음부터 자유롭게 애플리케이션을 구축할 수 있습니다. 어떤 방식을 선택하든, 훌륭한 것을 만들어낼 것임을 알고 있습니다!

<a name="laravel-breeze"></a>
## Laravel Breeze

[Laravel Breeze](https://github.com/laravel/breeze)는 로그인, 등록, 비밀번호 재설정, 이메일 인증, 비밀번호 확인을 포함한 Laravel의 모든 [인증 기능](/docs/{{version}}/authentication)을 최소한으로 간단하게 구현한 것입니다. 또한 Breeze에는 사용자가 이름, 이메일 주소 및 비밀번호를 업데이트할 수 있는 간단한 "프로필" 페이지가 포함되어 있습니다.

Laravel Breeze의 기본 뷰 레이어는 [Tailwind CSS](https://tailwindcss.com)로 스타일링된 간단한 [Blade 템플릿](/docs/{{version}}/blade)으로 구성됩니다. 또한 Breeze는 [Livewire](https://livewire.laravel.com) 또는 [Inertia](https://inertiajs.com) 기반의 스캐폴딩 옵션을 제공하며, Inertia 기반 스캐폴딩에서는 Vue 또는 React를 선택할 수 있습니다.

<img src="https://laravel.com/img/docs/breeze-register.png">

#### Laravel Bootcamp

Laravel을 처음 접하신다면 [Laravel Bootcamp](https://bootcamp.laravel.com)에 참여해 보세요. Laravel Bootcamp는 Breeze를 사용하여 첫 번째 Laravel 애플리케이션을 만드는 과정을 안내합니다. Laravel과 Breeze가 제공하는 모든 것을 둘러볼 수 있는 좋은 방법입니다.

<a name="laravel-breeze-installation"></a>
### 설치

먼저, [새 Laravel 애플리케이션을 생성](/docs/{{version}}/installation)해야 합니다. [Laravel 인스톨러](/docs/{{version}}/installation#creating-a-laravel-project)를 사용하여 애플리케이션을 생성하면 설치 과정에서 Laravel Breeze를 설치할 것인지 묻는 메시지가 나타납니다. 그렇지 않으면 아래의 수동 설치 방법을 따라야 합니다.

스타터 킷 없이 이미 새 Laravel 애플리케이션을 생성한 경우, Composer를 사용하여 Laravel Breeze를 수동으로 설치할 수 있습니다.

```shell
composer require laravel/breeze --dev
```

Composer가 Laravel Breeze 패키지를 설치한 후, `breeze:install` 아티즌 명령어를 실행해야 합니다. 이 명령어는 인증 뷰, 라우트, 컨트롤러 및 기타 리소스를 애플리케이션에 퍼블리시합니다. Laravel Breeze는 모든 코드를 애플리케이션에 퍼블리시하므로 기능과 구현에 대한 완전한 제어와 가시성을 갖게 됩니다.

`breeze:install` 명령어는 선호하는 프론트엔드 스택과 테스트 프레임워크를 묻습니다.

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

<a name="breeze-and-blade"></a>
### Breeze와 Blade

기본 Breeze "스택"은 Blade 스택으로, 간단한 [Blade 템플릿](/docs/{{version}}/blade)을 사용하여 애플리케이션의 프론트엔드를 렌더링합니다. Blade 스택은 추가 인수 없이 `breeze:install` 명령어를 실행하고 Blade 프론트엔드 스택을 선택하여 설치할 수 있습니다. Breeze의 스캐폴딩이 설치된 후에는 애플리케이션의 프론트엔드 에셋도 컴파일해야 합니다.

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

다음으로 웹 브라우저에서 애플리케이션의 `/login` 또는 `/register` URL로 이동할 수 있습니다. Breeze의 모든 라우트는 `routes/auth.php` 파일에 정의되어 있습니다.

> [!NOTE]
> 애플리케이션의 CSS 및 JavaScript 컴파일에 대해 자세히 알아보려면 Laravel의 [Vite 문서](/docs/{{version}}/vite#running-vite)를 참고하세요.

<a name="breeze-and-livewire"></a>
### Breeze와 Livewire

Laravel Breeze는 [Livewire](https://livewire.laravel.com) 스캐폴딩도 제공합니다. Livewire는 PHP만으로 동적이고 반응형 프론트엔드 UI를 구축하는 강력한 방법입니다.

Livewire는 주로 Blade 템플릿을 사용하며 Vue 및 React 같은 JavaScript 기반 SPA 프레임워크보다 더 간단한 대안을 찾는 팀에게 적합합니다.

Livewire 스택을 사용하려면 `breeze:install` 아티즌 명령어를 실행할 때 Livewire 프론트엔드 스택을 선택하면 됩니다. Breeze의 스캐폴딩이 설치된 후에는 데이터베이스 마이그레이션을 실행해야 합니다.

```shell
php artisan breeze:install

php artisan migrate
```

<a name="breeze-and-inertia"></a>
### Breeze와 React / Vue

Laravel Breeze는 [Inertia](https://inertiajs.com) 프론트엔드 구현을 통해 React 및 Vue 스캐폴딩도 제공합니다. Inertia를 사용하면 기존의 서버 사이드 라우팅과 컨트롤러를 사용하여 현대적인 단일 페이지 React 및 Vue 애플리케이션을 구축할 수 있습니다.

Inertia를 통해 React 및 Vue의 프론트엔드 파워와 Laravel의 놀라운 백엔드 생산성, 그리고 번개처럼 빠른 [Vite](https://vitejs.dev) 컴파일을 함께 누릴 수 있습니다. Inertia 스택을 사용하려면 `breeze:install` 아티즌 명령어를 실행할 때 Vue 또는 React 프론트엔드 스택을 선택하면 됩니다.

Vue 또는 React 프론트엔드 스택을 선택하면, Breeze 인스톨러는 [Inertia SSR](https://inertiajs.com/server-side-rendering) 또는 TypeScript 지원을 원하는지도 묻습니다. Breeze의 스캐폴딩이 설치된 후에는 애플리케이션의 프론트엔드 에셋도 컴파일해야 합니다.

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

다음으로 웹 브라우저에서 애플리케이션의 `/login` 또는 `/register` URL로 이동할 수 있습니다. Breeze의 모든 라우트는 `routes/auth.php` 파일에 정의되어 있습니다.

<a name="breeze-and-next"></a>
### Breeze와 Next.js / API

Laravel Breeze는 [Next](https://nextjs.org), [Nuxt](https://nuxt.com) 등으로 구동되는 최신 JavaScript 애플리케이션을 인증할 준비가 된 인증 API도 스캐폴딩할 수 있습니다. 시작하려면 `breeze:install` 아티즌 명령어를 실행할 때 원하는 스택으로 API 스택을 선택합니다.

```shell
php artisan breeze:install

php artisan migrate
```

설치 중에 Breeze는 애플리케이션의 `.env` 파일에 `FRONTEND_URL` 환경 변수를 추가합니다. 이 URL은 JavaScript 애플리케이션의 URL이어야 합니다. 로컬 개발 중에는 일반적으로 `http://localhost:3000`입니다. 또한 `APP_URL`이 `http://localhost:8000`으로 설정되어 있는지 확인해야 합니다. 이는 `serve` 아티즌 명령어에서 사용하는 기본 URL입니다.

<a name="next-reference-implementation"></a>
#### Next.js 레퍼런스 구현

마지막으로 이 백엔드를 원하는 프론트엔드와 연결할 준비가 되었습니다. Breeze 프론트엔드의 Next 레퍼런스 구현은 [GitHub에서 사용할 수 있습니다](https://github.com/laravel/breeze-next). 이 프론트엔드는 Laravel이 유지 관리하며 Breeze가 제공하는 기존 Blade 및 Inertia 스택과 동일한 사용자 인터페이스를 포함합니다.

<a name="laravel-jetstream"></a>
## Laravel Jetstream

Laravel Breeze가 Laravel 애플리케이션을 구축하기 위한 간단하고 최소한의 시작점을 제공하는 반면, Jetstream은 더 강력한 기능과 추가 프론트엔드 기술 스택으로 그 기능을 보강합니다. **Laravel을 처음 접하시는 분은 Laravel Jetstream으로 넘어가기 전에 Laravel Breeze로 먼저 익혀보시는 것을 권장합니다.**

Jetstream은 Laravel을 위한 아름답게 디자인된 애플리케이션 스캐폴딩을 제공하며 로그인, 등록, 이메일 인증, 2단계 인증, 세션 관리, Laravel Sanctum을 통한 API 지원 및 선택적 팀 관리를 포함합니다. Jetstream은 [Tailwind CSS](https://tailwindcss.com)를 사용하여 디자인되었으며 [Livewire](https://livewire.laravel.com) 또는 [Inertia](https://inertiajs.com) 기반의 프론트엔드 스캐폴딩을 선택할 수 있습니다.

Laravel Jetstream 설치에 대한 전체 문서는 [공식 Jetstream 문서](https://jetstream.laravel.com)에서 찾을 수 있습니다.

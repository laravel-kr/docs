# 스타터 킷(Starter Kits)

- [소개](#introduction)
- [스타터 킷을 사용하여 애플리케이션 생성하기](#creating-an-application)
- [사용 가능한 스타터 킷](#available-starter-kits)
    - [React](#react)
    - [Vue](#vue)
    - [Livewire](#livewire)
- [스타터 킷 커스터마이징](#starter-kit-customization)
    - [React](#react-customization)
    - [Vue](#vue-customization)
    - [Livewire](#livewire-customization)
- [WorkOS AuthKit 인증](#workos)
- [Inertia SSR](#inertia-ssr)
- [커뮤니티 유지 관리 스타터 킷](#community-maintained-starter-kits)
- [자주 묻는 질문](#faqs)

<a name="introduction"></a>
## 소개

새로운 Laravel 애플리케이션을 빠르게 시작할 수 있도록 [애플리케이션 스타터 킷](https://laravel.com/starter-kits)을 제공하게 되어 기쁩니다. 이 스타터 킷은 다음 Laravel 애플리케이션을 구축하는 데 유리한 출발점을 제공하며, 애플리케이션 사용자를 등록하고 인증하는 데 필요한 라우트, 컨트롤러 및 뷰를 포함합니다.

이 스타터 킷을 사용하는 것은 환영하지만, 필수는 아닙니다. Laravel을 새로 설치하여 처음부터 자유롭게 애플리케이션을 구축할 수 있습니다. 어떤 방식을 선택하든, 훌륭한 것을 만들어낼 것임을 알고 있습니다!

<a name="creating-an-application"></a>
## 스타터 킷을 사용하여 애플리케이션 생성하기

스타터 킷 중 하나를 사용하여 새로운 Laravel 애플리케이션을 생성하려면 먼저 [PHP와 Laravel CLI 도구를 설치](/docs/{{version}}/installation#installing-php)해야 합니다. 이미 PHP와 Composer가 설치되어 있다면 Composer를 통해 Laravel 인스톨러 CLI 도구를 설치할 수 있습니다.

```shell
composer global require laravel/installer
```

그런 다음 Laravel 인스톨러 CLI를 사용하여 새로운 Laravel 애플리케이션을 생성합니다. Laravel 인스톨러는 선호하는 스타터 킷을 선택하라는 메시지를 표시합니다.

```shell
laravel new my-app
```

Laravel 애플리케이션을 생성한 후에는 NPM을 통해 프론트엔드 의존성을 설치하고 Laravel 개발 서버를 시작하기만 하면 됩니다.

```shell
cd my-app
npm install && npm run build
composer run dev
```

Laravel 개발 서버를 시작하면 웹 브라우저에서 [http://localhost:8000](http://localhost:8000)을 통해 애플리케이션에 접근할 수 있습니다.

<a name="available-starter-kits"></a>
## 사용 가능한 스타터 킷

<a name="react"></a>
### React

React 스타터 킷은 [Inertia](https://inertiajs.com)를 사용하여 React 프론트엔드로 Laravel 애플리케이션을 구축하기 위한 강력하고 현대적인 시작점을 제공합니다.

Inertia를 사용하면 기존의 서버 사이드 라우팅과 컨트롤러를 사용하여 현대적인 단일 페이지 React 애플리케이션을 구축할 수 있습니다. 이를 통해 React의 프론트엔드 파워와 Laravel의 놀라운 백엔드 생산성, 그리고 번개처럼 빠른 Vite 컴파일을 함께 누릴 수 있습니다.

React 스타터 킷은 React 19, TypeScript, Tailwind 및 [shadcn/ui](https://ui.shadcn.com) 컴포넌트 라이브러리를 활용합니다.

<a name="vue"></a>
### Vue

Vue 스타터 킷은 [Inertia](https://inertiajs.com)를 사용하여 Vue 프론트엔드로 Laravel 애플리케이션을 구축하기 위한 훌륭한 시작점을 제공합니다.

Inertia를 사용하면 기존의 서버 사이드 라우팅과 컨트롤러를 사용하여 현대적인 단일 페이지 Vue 애플리케이션을 구축할 수 있습니다. 이를 통해 Vue의 프론트엔드 파워와 Laravel의 놀라운 백엔드 생산성, 그리고 번개처럼 빠른 Vite 컴파일을 함께 누릴 수 있습니다.

Vue 스타터 킷은 Vue Composition API, TypeScript, Tailwind 및 [shadcn-vue](https://www.shadcn-vue.com/) 컴포넌트 라이브러리를 활용합니다.

<a name="livewire"></a>
### Livewire

Livewire 스타터 킷은 [Laravel Livewire](https://livewire.laravel.com) 프론트엔드로 Laravel 애플리케이션을 구축하기 위한 완벽한 시작점을 제공합니다.

Livewire는 PHP만으로 동적이고 반응형 프론트엔드 UI를 구축하는 강력한 방법입니다. 주로 Blade 템플릿을 사용하며 React나 Vue 같은 JavaScript 기반 SPA 프레임워크보다 더 간단한 대안을 찾는 팀에게 적합합니다.

Livewire 스타터 킷은 Livewire, Tailwind 및 [Flux UI](https://fluxui.dev) 컴포넌트 라이브러리를 활용합니다.

<a name="starter-kit-customization"></a>
## 스타터 킷 커스터마이징

<a name="react-customization"></a>
### React

React 스타터 킷은 Inertia 2, React 19, Tailwind 4 및 [shadcn/ui](https://ui.shadcn.com)로 구축되었습니다. 모든 스타터 킷과 마찬가지로 모든 백엔드 및 프론트엔드 코드가 애플리케이션 내에 존재하여 완전한 커스터마이징이 가능합니다.

프론트엔드 코드의 대부분은 `resources/js` 디렉토리에 위치합니다. 애플리케이션의 외관과 동작을 커스터마이징하기 위해 코드를 자유롭게 수정할 수 있습니다.

```text
resources/js/
├── components/    # 재사용 가능한 React 컴포넌트
├── hooks/         # React hooks
├── layouts/       # 애플리케이션 레이아웃
├── lib/           # 유틸리티 함수 및 설정
├── pages/         # 페이지 컴포넌트
└── types/         # TypeScript 정의
```

추가 shadcn 컴포넌트를 게시하려면 먼저 [게시하려는 컴포넌트를 찾으세요](https://ui.shadcn.com). 그런 다음 `npx`를 사용하여 컴포넌트를 게시합니다.

```shell
npx shadcn@latest add switch
```

이 예제에서 명령어는 Switch 컴포넌트를 `resources/js/components/ui/switch.tsx`에 게시합니다. 컴포넌트가 게시되면 모든 페이지에서 사용할 수 있습니다.

```jsx
import { Switch } from "@/components/ui/switch"

const MyPage = () => {
  return (
    <div>
      <Switch />
    </div>
  );
};

export default MyPage;
```

<a name="react-available-layouts"></a>
#### 사용 가능한 레이아웃

React 스타터 킷에는 선택할 수 있는 두 가지 기본 레이아웃이 포함되어 있습니다: "sidebar" 레이아웃과 "header" 레이아웃. sidebar 레이아웃이 기본값이지만, 애플리케이션의 `resources/js/layouts/app-layout.tsx` 파일 상단에서 가져오는 레이아웃을 수정하여 header 레이아웃으로 전환할 수 있습니다.

```js
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout'; // [tl! remove]
import AppLayoutTemplate from '@/layouts/app/app-header-layout'; // [tl! add]
```

<a name="react-sidebar-variants"></a>
#### 사이드바 변형

sidebar 레이아웃에는 세 가지 다른 변형이 포함되어 있습니다: 기본 sidebar 변형, "inset" 변형, "floating" 변형. `resources/js/components/app-sidebar.tsx` 컴포넌트를 수정하여 원하는 변형을 선택할 수 있습니다.

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="react-authentication-page-layout-variants"></a>
#### 인증 페이지 레이아웃 변형

로그인 페이지와 등록 페이지 같은 React 스타터 킷에 포함된 인증 페이지도 세 가지 다른 레이아웃 변형을 제공합니다: "simple", "card", "split".

인증 레이아웃을 변경하려면 애플리케이션의 `resources/js/layouts/auth-layout.tsx` 파일 상단에서 가져오는 레이아웃을 수정합니다.

```js
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout'; // [tl! remove]
import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout'; // [tl! add]
```

<a name="vue-customization"></a>
### Vue

Vue 스타터 킷은 Inertia 2, Vue 3 Composition API, Tailwind 및 [shadcn-vue](https://www.shadcn-vue.com/)로 구축되었습니다. 모든 스타터 킷과 마찬가지로 모든 백엔드 및 프론트엔드 코드가 애플리케이션 내에 존재하여 완전한 커스터마이징이 가능합니다.

프론트엔드 코드의 대부분은 `resources/js` 디렉토리에 위치합니다. 애플리케이션의 외관과 동작을 커스터마이징하기 위해 코드를 자유롭게 수정할 수 있습니다.

```text
resources/js/
├── components/    # 재사용 가능한 Vue 컴포넌트
├── composables/   # Vue composables / hooks
├── layouts/       # 애플리케이션 레이아웃
├── lib/           # 유틸리티 함수 및 설정
├── pages/         # 페이지 컴포넌트
└── types/         # TypeScript 정의
```

추가 shadcn-vue 컴포넌트를 게시하려면 먼저 [게시하려는 컴포넌트를 찾으세요](https://www.shadcn-vue.com). 그런 다음 `npx`를 사용하여 컴포넌트를 게시합니다.

```shell
npx shadcn-vue@latest add switch
```

이 예제에서 명령어는 Switch 컴포넌트를 `resources/js/components/ui/Switch.vue`에 게시합니다. 컴포넌트가 게시되면 모든 페이지에서 사용할 수 있습니다.

```vue
<script setup lang="ts">
import { Switch } from '@/Components/ui/switch'
</script>

<template>
    <div>
        <Switch />
    </div>
</template>
```

<a name="vue-available-layouts"></a>
#### 사용 가능한 레이아웃

Vue 스타터 킷에는 선택할 수 있는 두 가지 기본 레이아웃이 포함되어 있습니다: "sidebar" 레이아웃과 "header" 레이아웃. sidebar 레이아웃이 기본값이지만, 애플리케이션의 `resources/js/layouts/AppLayout.vue` 파일 상단에서 가져오는 레이아웃을 수정하여 header 레이아웃으로 전환할 수 있습니다.

```js
import AppLayout from '@/layouts/app/AppSidebarLayout.vue'; // [tl! remove]
import AppLayout from '@/layouts/app/AppHeaderLayout.vue'; // [tl! add]
```

<a name="vue-sidebar-variants"></a>
#### 사이드바 변형

sidebar 레이아웃에는 세 가지 다른 변형이 포함되어 있습니다: 기본 sidebar 변형, "inset" 변형, "floating" 변형. `resources/js/components/AppSidebar.vue` 컴포넌트를 수정하여 원하는 변형을 선택할 수 있습니다.

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="vue-authentication-page-layout-variants"></a>
#### 인증 페이지 레이아웃 변형

로그인 페이지와 등록 페이지 같은 Vue 스타터 킷에 포함된 인증 페이지도 세 가지 다른 레이아웃 변형을 제공합니다: "simple", "card", "split".

인증 레이아웃을 변경하려면 애플리케이션의 `resources/js/layouts/AuthLayout.vue` 파일 상단에서 가져오는 레이아웃을 수정합니다.

```js
import AuthLayout from '@/layouts/auth/AuthSimpleLayout.vue'; // [tl! remove]
import AuthLayout from '@/layouts/auth/AuthSplitLayout.vue'; // [tl! add]
```

<a name="livewire-customization"></a>
### Livewire

Livewire 스타터 킷은 Livewire 3, Tailwind 및 [Flux UI](https://fluxui.dev)로 구축되었습니다. 모든 스타터 킷과 마찬가지로 모든 백엔드 및 프론트엔드 코드가 애플리케이션 내에 존재하여 완전한 커스터마이징이 가능합니다.

#### Livewire와 Volt

프론트엔드 코드의 대부분은 `resources/views` 디렉토리에 위치합니다. 애플리케이션의 외관과 동작을 커스터마이징하기 위해 코드를 자유롭게 수정할 수 있습니다.

```text
resources/views
├── components            # 재사용 가능한 Livewire 컴포넌트
├── flux                  # 커스터마이징된 Flux 컴포넌트
├── livewire              # Livewire 페이지
├── partials              # 재사용 가능한 Blade 파셜
├── dashboard.blade.php   # 인증된 사용자 대시보드
├── welcome.blade.php     # 게스트 사용자 환영 페이지
```

#### 전통적인 Livewire 컴포넌트

프론트엔드 코드는 `resouces/views` 디렉토리에 위치하고, `app/Livewire` 디렉토리에는 Livewire 컴포넌트에 해당하는 백엔드 로직이 포함되어 있습니다.

<a name="livewire-available-layouts"></a>
#### 사용 가능한 레이아웃

Livewire 스타터 킷에는 선택할 수 있는 두 가지 기본 레이아웃이 포함되어 있습니다: "sidebar" 레이아웃과 "header" 레이아웃. sidebar 레이아웃이 기본값이지만, 애플리케이션의 `resources/views/components/layouts/app.blade.php` 파일에서 사용하는 레이아웃을 수정하여 header 레이아웃으로 전환할 수 있습니다. 또한 메인 Flux 컴포넌트에 `container` 속성을 추가해야 합니다.

```blade
<x-layouts.app.header>
    <flux:main container>
        {{ $slot }}
    </flux:main>
</x-layouts.app.header>
```

<a name="livewire-authentication-page-layout-variants"></a>
#### 인증 페이지 레이아웃 변형

로그인 페이지와 등록 페이지 같은 Livewire 스타터 킷에 포함된 인증 페이지도 세 가지 다른 레이아웃 변형을 제공합니다: "simple", "card", "split".

인증 레이아웃을 변경하려면 애플리케이션의 `resources/views/components/layouts/auth.blade.php` 파일에서 사용하는 레이아웃을 수정합니다.

```blade
<x-layouts.auth.split>
    {{ $slot }}
</x-layouts.auth.split>
```

<a name="workos"></a>
## WorkOS AuthKit 인증

기본적으로 React, Vue, Livewire 스타터 킷은 모두 Laravel의 내장 인증 시스템을 활용하여 로그인, 등록, 비밀번호 재설정, 이메일 인증 등을 제공합니다. 또한 다음과 같은 기능을 제공하는 [WorkOS AuthKit](https://authkit.com) 기반 변형 스타터 킷도 제공합니다.

<div class="content-list" markdown="1">

- 소셜 인증(Social authentication) (Google, Microsoft, GitHub, Apple)
- 패스키 인증(Passkey authentication)
- 이메일 기반 "Magic Auth"
- SSO

</div>

WorkOS를 인증 제공자로 사용하려면 [WorkOS 계정이 필요합니다](https://workos.com). WorkOS는 월간 활성 사용자 100만 명까지 무료로 인증을 제공합니다.

애플리케이션의 인증 제공자로 WorkOS AuthKit을 사용하려면 `laravel new`를 통해 새로운 스타터 킷 기반 애플리케이션을 생성할 때 WorkOS 옵션을 선택하세요.

### WorkOS 스타터 킷 설정

WorkOS 기반 스타터 킷을 사용하여 새로운 애플리케이션을 생성한 후, 애플리케이션의 `.env` 파일에 `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_REDIRECT_URL` 환경 변수를 설정해야 합니다. 이 변수들은 WorkOS 대시보드에서 애플리케이션에 대해 제공받은 값과 일치해야 합니다.

```ini
WORKOS_CLIENT_ID=your-client-id
WORKOS_API_KEY=your-api-key
WORKOS_REDIRECT_URL="${APP_URL}/authenticate"
```

또한 WorkOS 대시보드에서 애플리케이션 홈페이지 URL을 설정해야 합니다. 이 URL은 사용자가 애플리케이션에서 로그아웃한 후 리디렉션되는 곳입니다.

<a name="configuring-authkit-authentication-methods"></a>
#### AuthKit 인증 방법 설정

WorkOS 기반 스타터 킷을 사용할 때, 애플리케이션의 WorkOS AuthKit 설정에서 "Email + Password" 인증을 비활성화하여 사용자가 소셜 인증 제공자, 패스키, "Magic Auth", SSO를 통해서만 인증할 수 있도록 하는 것을 권장합니다. 이렇게 하면 애플리케이션이 사용자 비밀번호 처리를 완전히 피할 수 있습니다.

<a name="configuring-authkit-session-timeouts"></a>
#### AuthKit 세션 타임아웃 설정

또한 WorkOS AuthKit 세션 비활성 타임아웃을 Laravel 애플리케이션에 설정된 세션 타임아웃 임계값(일반적으로 2시간)과 일치하도록 설정하는 것을 권장합니다.

<a name="inertia-ssr"></a>
### Inertia SSR

React와 Vue 스타터 킷은 Inertia의 [서버 사이드 렌더링(server-side rendering)](https://inertiajs.com/server-side-rendering) 기능과 호환됩니다. 애플리케이션용 Inertia SSR 호환 번들을 빌드하려면 `build:ssr` 명령어를 실행합니다.

```shell
npm run build:ssr
```

편의를 위해 `composer dev:ssr` 명령어도 사용할 수 있습니다. 이 명령어는 애플리케이션용 SSR 호환 번들을 빌드한 후 Laravel 개발 서버와 Inertia SSR 서버를 시작하여 Inertia의 서버 사이드 렌더링 엔진을 사용하여 로컬에서 애플리케이션을 테스트할 수 있게 합니다.

```shell
composer dev:ssr
```

<a name="community-maintained-starter-kits"></a>
### 커뮤니티 유지 관리 스타터 킷

Laravel 인스톨러를 사용하여 새로운 Laravel 애플리케이션을 생성할 때, `--using` 플래그에 Packagist에서 사용 가능한 커뮤니티 유지 관리 스타터 킷을 제공할 수 있습니다.

```shell
laravel new my-app --using=example/starter-kit
```

<a name="creating-starter-kits"></a>
#### 스타터 킷 만들기

스타터 킷을 다른 사람들이 사용할 수 있도록 하려면 [Packagist](https://packagist.org)에 게시해야 합니다. 스타터 킷은 필요한 환경 변수를 `.env.example` 파일에 정의해야 하며, 필요한 설치 후 명령어는 스타터 킷의 `composer.json` 파일의 `post-create-project-cmd` 배열에 나열해야 합니다.

<a name="faqs"></a>
### 자주 묻는 질문

<a name="faq-upgrade"></a>
#### 어떻게 업그레이드하나요?

모든 스타터 킷은 다음 애플리케이션을 위한 견고한 시작점을 제공합니다. 코드를 완전히 소유하므로 원하는 대로 조정, 커스터마이징 및 구축할 수 있습니다. 그러나 스타터 킷 자체를 업데이트할 필요는 없습니다.

<a name="faq-enable-email-verification"></a>
#### 이메일 인증을 어떻게 활성화하나요?

`App/Models/User.php` 모델에서 `MustVerifyEmail` import 주석을 해제하고 모델이 `MustVerifyEmail` 인터페이스를 구현하도록 하여 이메일 인증을 추가할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
// ...

class User extends Authenticatable implements MustVerifyEmail
{
    // ...
}
```

등록 후 사용자는 인증 이메일을 받게 됩니다. 사용자의 이메일 주소가 인증될 때까지 특정 라우트에 대한 접근을 제한하려면 라우트에 `verified` 미들웨어를 추가합니다.

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
```

> [!NOTE]
> [WorkOS](#workos) 변형 스타터 킷을 사용할 때는 이메일 인증이 필요하지 않습니다.

<a name="faq-modify-email-template"></a>
#### 기본 이메일 템플릿을 어떻게 수정하나요?

애플리케이션의 브랜딩에 더 잘 맞도록 기본 이메일 템플릿을 커스터마이징하고 싶을 수 있습니다. 이 템플릿을 수정하려면 다음 명령어로 이메일 뷰를 애플리케이션에 게시해야 합니다.

```
php artisan vendor:publish --tag=laravel-mail
```

이 명령어는 `resources/views/vendor/mail`에 여러 파일을 생성합니다. 기본 이메일 템플릿의 모양과 느낌을 변경하기 위해 이 파일들과 `resources/views/vendor/mail/themes/default.css` 파일을 수정할 수 있습니다.

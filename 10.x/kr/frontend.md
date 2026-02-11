# 프론트엔드(Frontend)

- [소개](#introduction)
- [PHP 사용하기](#using-php)
    - [PHP와 Blade](#php-and-blade)
    - [Livewire](#livewire)
    - [스타터 킷](#php-starter-kits)
- [Vue / React 사용하기](#using-vue-react)
    - [Inertia](#inertia)
    - [스타터 킷](#inertia-starter-kits)
- [에셋 번들링](#bundling-assets)

<a name="introduction"></a>
## 소개

Laravel은 [라우팅](/docs/{{version}}/routing), [유효성 검사](/docs/{{version}}/validation), [캐싱](/docs/{{version}}/cache), [큐](/docs/{{version}}/queues), [파일 스토리지](/docs/{{version}}/filesystem) 등 현대적인 웹 애플리케이션을 구축하는 데 필요한 모든 기능을 제공하는 백엔드 프레임워크입니다. 그러나 우리는 개발자들에게 애플리케이션의 프론트엔드를 구축하기 위한 강력한 접근 방식을 포함한 아름다운 풀스택 경험을 제공하는 것이 중요하다고 생각합니다.

Laravel로 애플리케이션을 구축할 때 프론트엔드 개발을 다루는 두 가지 주요 방법이 있으며, 어떤 접근 방식을 선택할지는 PHP를 활용하여 프론트엔드를 구축할지 아니면 Vue나 React와 같은 자바스크립트 프레임워크를 사용할지에 따라 결정됩니다. 아래에서 이 두 가지 옵션을 모두 논의하여 애플리케이션의 프론트엔드 개발에 가장 적합한 접근 방식을 결정하는 데 도움을 드리겠습니다.

<a name="using-php"></a>
## PHP 사용하기

<a name="php-and-blade"></a>
### PHP와 Blade

과거에는 대부분의 PHP 애플리케이션이 요청 중에 데이터베이스에서 가져온 데이터를 렌더링하는 PHP `echo` 문이 포함된 간단한 HTML 템플릿을 사용하여 브라우저에 HTML을 렌더링했습니다.

```blade
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```

Laravel에서는 [뷰](/docs/{{version}}/views)와 [Blade](/docs/{{version}}/blade)를 사용하여 여전히 이러한 방식으로 HTML을 렌더링할 수 있습니다. Blade는 데이터 표시, 데이터 반복 등을 위한 편리하고 간결한 문법을 제공하는 매우 가벼운 템플릿 언어입니다.

```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```

이러한 방식으로 애플리케이션을 구축할 때, 폼 제출 및 기타 페이지 상호작용은 일반적으로 서버에서 완전히 새로운 HTML 문서를 받아 브라우저에서 전체 페이지를 다시 렌더링합니다. 오늘날에도 많은 애플리케이션이 간단한 Blade 템플릿을 사용하여 이러한 방식으로 프론트엔드를 구성하기에 완벽하게 적합할 수 있습니다.

<a name="growing-expectations"></a>
#### 높아지는 기대

그러나 웹 애플리케이션에 대한 사용자의 기대가 성숙해짐에 따라, 많은 개발자들이 더 세련된 느낌의 인터랙션을 가진 더 동적인 프론트엔드를 구축해야 할 필요성을 느끼게 되었습니다. 이러한 점을 고려하여 일부 개발자들은 Vue나 React와 같은 자바스크립트 프레임워크를 사용하여 애플리케이션의 프론트엔드를 구축하기 시작했습니다.

다른 개발자들은 익숙한 백엔드 언어를 유지하면서도 주로 선택한 백엔드 언어를 활용하여 현대적인 웹 애플리케이션 UI를 구축할 수 있는 솔루션을 개발했습니다. 예를 들어, [Rails](https://rubyonrails.org/) 생태계에서는 [Turbo](https://turbo.hotwired.dev/), [Hotwire](https://hotwired.dev/), [Stimulus](https://stimulus.hotwired.dev/)와 같은 라이브러리가 만들어졌습니다.

Laravel 생태계 내에서는 주로 PHP를 사용하여 현대적이고 동적인 프론트엔드를 만들어야 하는 필요성으로 인해 [Laravel Livewire](https://livewire.laravel.com)와 [Alpine.js](https://alpinejs.dev/)가 탄생했습니다.

<a name="livewire"></a>
### Livewire

[Laravel Livewire](https://livewire.laravel.com)는 Vue나 React와 같은 현대적인 자바스크립트 프레임워크로 구축된 프론트엔드처럼 동적이고 현대적이며 생동감 있는 Laravel 기반 프론트엔드를 구축하기 위한 프레임워크입니다.

Livewire를 사용할 때, UI의 개별 부분을 렌더링하고 애플리케이션의 프론트엔드에서 호출하고 상호작용할 수 있는 메서드와 데이터를 노출하는 Livewire "컴포넌트"를 만들게 됩니다. 예를 들어, 간단한 "Counter" 컴포넌트는 다음과 같을 수 있습니다.

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;

class Counter extends Component
{
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return view('livewire.counter');
    }
}
```

그리고 카운터에 해당하는 템플릿은 다음과 같이 작성됩니다.

```blade
<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>
```

보시다시피, Livewire를 사용하면 Laravel 애플리케이션의 프론트엔드와 백엔드를 연결하는 `wire:click`과 같은 새로운 HTML 속성을 작성할 수 있습니다. 또한 간단한 Blade 표현식을 사용하여 컴포넌트의 현재 상태를 렌더링할 수 있습니다.

많은 사람들에게 Livewire는 Laravel을 사용한 프론트엔드 개발에 혁명을 일으켰으며, 현대적이고 동적인 웹 애플리케이션을 구축하면서도 Laravel의 편안함 안에 머물 수 있게 해주었습니다. 일반적으로 Livewire를 사용하는 개발자들은 대화 상자 창을 렌더링하는 등 필요한 곳에만 자바스크립트를 "뿌리기" 위해 [Alpine.js](https://alpinejs.dev/)도 함께 활용합니다.

Laravel이 처음이시라면 [뷰](/docs/{{version}}/views)와 [Blade](/docs/{{version}}/blade)의 기본 사용법을 먼저 익히시기 바랍니다. 그런 다음 공식 [Laravel Livewire 문서](https://livewire.laravel.com/docs)를 참조하여 인터랙티브 Livewire 컴포넌트로 애플리케이션을 한 단계 발전시키는 방법을 배우세요.

<a name="php-starter-kits"></a>
### 스타터 킷

PHP와 Livewire를 사용하여 프론트엔드를 구축하고 싶다면, Breeze 또는 Jetstream [스타터 킷](/docs/{{version}}/starter-kits)을 활용하여 애플리케이션 개발을 빠르게 시작할 수 있습니다. 이 두 스타터 킷은 [Blade](/docs/{{version}}/blade)와 [Tailwind](https://tailwindcss.com)를 사용하여 애플리케이션의 백엔드 및 프론트엔드 인증 플로우를 스캐폴딩하여 다음 큰 아이디어를 구축하기 시작할 수 있게 해줍니다.

<a name="using-vue-react"></a>
## Vue / React 사용하기

Laravel과 Livewire를 사용하여 현대적인 프론트엔드를 구축하는 것이 가능하지만, 많은 개발자들은 여전히 Vue나 React와 같은 자바스크립트 프레임워크의 강력함을 활용하는 것을 선호합니다. 이를 통해 개발자들은 NPM을 통해 사용할 수 있는 풍부한 자바스크립트 패키지 및 도구 생태계의 이점을 누릴 수 있습니다.

그러나 추가적인 도구 없이 Laravel과 Vue 또는 React를 결합하면 클라이언트 사이드 라우팅, 데이터 하이드레이션(data hydration), 인증과 같은 다양한 복잡한 문제를 해결해야 합니다. 클라이언트 사이드 라우팅은 [Nuxt](https://nuxt.com/)나 [Next](https://nextjs.org/)와 같은 독자적인 Vue / React 프레임워크를 사용하여 간소화되는 경우가 많지만, Laravel과 같은 백엔드 프레임워크를 이러한 프론트엔드 프레임워크와 결합할 때 데이터 하이드레이션과 인증은 여전히 해결하기 복잡하고 번거로운 문제로 남아 있습니다.

또한 개발자들은 두 개의 별도 코드 저장소를 유지해야 하며, 종종 두 저장소 모두에서 유지보수, 릴리스 및 배포를 조율해야 합니다. 이러한 문제가 극복할 수 없는 것은 아니지만, 우리는 이것이 애플리케이션을 개발하는 생산적이거나 즐거운 방법이라고 생각하지 않습니다.

<a name="inertia"></a>
### Inertia

다행히도 Laravel은 두 가지 장점을 모두 제공합니다. [Inertia](https://inertiajs.com)는 Laravel 애플리케이션과 현대적인 Vue 또는 React 프론트엔드 사이의 간극을 메워주어, 라우팅, 데이터 하이드레이션 및 인증을 위해 Laravel의 라우트와 컨트롤러를 활용하면서 Vue나 React를 사용하여 완전한 현대적 프론트엔드를 구축할 수 있게 해줍니다 — 모두 단일 코드 저장소 내에서요. 이 접근 방식을 사용하면 어느 도구의 기능도 손상시키지 않으면서 Laravel과 Vue / React의 모든 기능을 즐길 수 있습니다.

Laravel 애플리케이션에 Inertia를 설치한 후에는 평소처럼 라우트와 컨트롤러를 작성하게 됩니다. 그러나 컨트롤러에서 Blade 템플릿을 반환하는 대신 Inertia 페이지를 반환합니다.

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * 주어진 사용자의 프로필을 표시합니다.
     */
    public function show(string $id): Response
    {
        return Inertia::render('Users/Profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Inertia 페이지는 일반적으로 애플리케이션의 `resources/js/Pages` 디렉토리에 저장된 Vue 또는 React 컴포넌트에 해당합니다. `Inertia::render` 메서드를 통해 페이지에 전달된 데이터는 페이지 컴포넌트의 "props"를 하이드레이션하는 데 사용됩니다.

```vue
<script setup>
import Layout from '@/Layouts/Authenticated.vue';
import { Head } from '@inertiajs/vue3';

const props = defineProps(['user']);
</script>

<template>
    <Head title="User Profile" />

    <Layout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Profile
            </h2>
        </template>

        <div class="py-12">
            Hello, {{ user.name }}
        </div>
    </Layout>
</template>
```

보시다시피, Inertia를 사용하면 프론트엔드를 구축할 때 Vue나 React의 모든 기능을 활용할 수 있으며, Laravel 기반 백엔드와 자바스크립트 기반 프론트엔드 사이에 가벼운 브릿지를 제공합니다.

#### 서버 사이드 렌더링(Server-Side Rendering)

애플리케이션에 서버 사이드 렌더링이 필요해서 Inertia를 도입하는 것이 걱정되신다면, 걱정하지 마세요. Inertia는 [서버 사이드 렌더링 지원](https://inertiajs.com/server-side-rendering)을 제공합니다. 그리고 [Laravel Forge](https://forge.laravel.com)를 통해 애플리케이션을 배포할 때, Inertia의 서버 사이드 렌더링 프로세스가 항상 실행되도록 하는 것은 매우 쉽습니다.

<a name="inertia-starter-kits"></a>
### 스타터 킷

Inertia와 Vue / React를 사용하여 프론트엔드를 구축하고 싶다면, Breeze 또는 Jetstream [스타터 킷](/docs/{{version}}/starter-kits#breeze-and-inertia)을 활용하여 애플리케이션 개발을 빠르게 시작할 수 있습니다. 이 두 스타터 킷은 Inertia, Vue / React, [Tailwind](https://tailwindcss.com), [Vite](https://vitejs.dev)를 사용하여 애플리케이션의 백엔드 및 프론트엔드 인증 플로우를 스캐폴딩하여 다음 큰 아이디어를 구축하기 시작할 수 있게 해줍니다.

<a name="bundling-assets"></a>
## 에셋 번들링(Bundling Assets)

Blade와 Livewire를 사용하든 Vue / React와 Inertia를 사용하여 프론트엔드를 개발하든, 애플리케이션의 CSS를 프로덕션 준비(production ready) 에셋으로 번들링해야 할 것입니다. 물론 Vue나 React로 애플리케이션의 프론트엔드를 구축하기로 선택한 경우, 컴포넌트를 브라우저 준비 자바스크립트 에셋으로 번들링해야 합니다.

기본적으로 Laravel은 [Vite](https://vitejs.dev)를 사용하여 에셋을 번들링합니다. Vite는 로컬 개발 중에 매우 빠른 빌드 시간과 거의 즉각적인 핫 모듈 교체(HMR, Hot Module Replacement)를 제공합니다. [스타터 킷](/docs/{{version}}/starter-kits)을 사용하는 것을 포함한 모든 새로운 Laravel 애플리케이션에서, Laravel 애플리케이션과 함께 Vite를 즐겁게 사용할 수 있게 해주는 가벼운 Laravel Vite 플러그인을 로드하는 `vite.config.js` 파일을 찾을 수 있습니다.

Laravel과 Vite를 시작하는 가장 빠른 방법은 프론트엔드 및 백엔드 인증 스캐폴딩을 제공하여 애플리케이션을 빠르게 시작할 수 있는 가장 간단한 스타터 킷인 [Laravel Breeze](/docs/{{version}}/starter-kits#laravel-breeze)를 사용하여 애플리케이션 개발을 시작하는 것입니다.

> [!NOTE]  
> Laravel과 함께 Vite를 활용하는 방법에 대한 더 자세한 문서는 [에셋 번들링 및 컴파일에 관한 전용 문서](/docs/{{version}}/vite)를 참조하세요.

# 에셋 번들링 (Vite)

- [소개](#introduction)
- [설치 및 설정](#installation)
  - [Node 설치하기](#installing-node)
  - [Vite와 Laravel 플러그인 설치하기](#installing-vite-and-laravel-plugin)
  - [Vite 설정하기](#configuring-vite)
  - [스크립트와 스타일 로드하기](#loading-your-scripts-and-styles)
- [Vite 실행하기](#running-vite)
- [JavaScript 작업하기](#working-with-scripts)
  - [별칭(Aliases)](#aliases)
  - [Vue](#vue)
  - [React](#react)
  - [Inertia](#inertia)
  - [URL 처리](#url-processing)
- [스타일시트 작업하기](#working-with-stylesheets)
- [Blade와 라우트 작업하기](#working-with-blade-and-routes)
  - [Vite로 정적 에셋 처리하기](#blade-processing-static-assets)
  - [저장 시 새로고침](#blade-refreshing-on-save)
  - [별칭(Aliases)](#blade-aliases)
- [에셋 프리페칭(Asset Prefetching)](#asset-prefetching)
- [커스텀 베이스 URL](#custom-base-urls)
- [환경 변수](#environment-variables)
- [테스트에서 Vite 비활성화하기](#disabling-vite-in-tests)
- [서버 사이드 렌더링 (SSR)](#ssr)
- [스크립트 및 스타일 태그 속성](#script-and-style-attributes)
  - [콘텐츠 보안 정책 (CSP) Nonce](#content-security-policy-csp-nonce)
  - [서브리소스 무결성 (SRI)](#subresource-integrity-sri)
  - [임의 속성](#arbitrary-attributes)
- [고급 커스터마이징](#advanced-customization)
  - [개발 서버 교차 출처 리소스 공유 (CORS)](#cors)
  - [개발 서버 URL 수정하기](#correcting-dev-server-urls)

<a name="introduction"></a>
## 소개

[Vite](https://vitejs.dev)는 매우 빠른 개발 환경을 제공하고 프로덕션용 코드를 번들링하는 최신 프론트엔드 빌드 도구입니다. Laravel로 애플리케이션을 빌드할 때, 일반적으로 Vite를 사용하여 애플리케이션의 CSS와 JavaScript 파일을 프로덕션에 적합한 에셋으로 번들링합니다.

Laravel은 공식 플러그인과 Blade 디렉티브를 제공하여 개발 및 프로덕션 환경에서 에셋을 로드할 수 있도록 Vite와 원활하게 통합됩니다.

> [!NOTE]
> Laravel Mix를 사용하고 계신가요? Vite는 새로운 Laravel 설치에서 Laravel Mix를 대체했습니다. Mix 문서는 [Laravel Mix](https://laravel-mix.com/) 웹사이트를 참조하세요. Vite로 전환하려면 [마이그레이션 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)를 참조하세요.

<a name="vite-or-mix"></a>
#### Vite와 Laravel Mix 중 선택하기

Vite로 전환하기 전, 새로운 Laravel 애플리케이션은 에셋을 번들링할 때 [webpack](https://webpack.js.org/)을 기반으로 하는 [Mix](https://laravel-mix.com/)를 사용했습니다. Vite는 풍부한 JavaScript 애플리케이션을 빌드할 때 더 빠르고 생산적인 경험을 제공하는 데 중점을 둡니다. [Inertia](https://inertiajs.com)와 같은 도구를 사용하여 개발된 것을 포함한 싱글 페이지 애플리케이션(SPA)을 개발하는 경우, Vite가 완벽하게 적합할 것입니다.

Vite는 [Livewire](https://livewire.laravel.com)를 사용하는 것을 포함한 JavaScript "스프링클"이 있는 전통적인 서버 사이드 렌더링 애플리케이션에서도 잘 작동합니다. 그러나 JavaScript 애플리케이션에서 직접 참조되지 않는 임의의 에셋을 빌드에 복사하는 기능과 같이 Laravel Mix가 지원하는 일부 기능이 부족합니다.

<a name="migrating-back-to-mix"></a>
#### Mix로 다시 마이그레이션하기

Vite 스캐폴딩을 사용하여 새로운 Laravel 애플리케이션을 시작했지만 Laravel Mix와 webpack으로 돌아가야 하나요? 문제없습니다. [Vite에서 Mix로 마이그레이션하는 공식 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-vite-to-laravel-mix)를 참조하세요.

<a name="installation"></a>
## 설치 및 설정

> [!NOTE]
> 다음 문서에서는 Laravel Vite 플러그인을 수동으로 설치하고 설정하는 방법을 설명합니다. 그러나 Laravel의 [스타터 킷](/docs/{{version}}/starter-kits)에는 이미 이 모든 스캐폴딩이 포함되어 있으며 Laravel과 Vite를 시작하는 가장 빠른 방법입니다.

<a name="installing-node"></a>
### Node 설치하기

Vite와 Laravel 플러그인을 실행하기 전에 Node.js(16+)와 NPM이 설치되어 있는지 확인해야 합니다:

```shell
node -v
npm -v
```

[공식 Node 웹사이트](https://nodejs.org/en/download/)에서 간단한 그래픽 설치 프로그램을 사용하여 최신 버전의 Node와 NPM을 쉽게 설치할 수 있습니다. 또는 [Laravel Sail](https://laravel.com/docs/{{version}}/sail)을 사용하는 경우 Sail을 통해 Node와 NPM을 호출할 수 있습니다:

```shell
./vendor/bin/sail node -v
./vendor/bin/sail npm -v
```

<a name="installing-vite-and-laravel-plugin"></a>
### Vite와 Laravel 플러그인 설치하기

Laravel을 새로 설치하면 애플리케이션 디렉토리 구조의 루트에 `package.json` 파일이 있습니다. 기본 `package.json` 파일에는 Vite와 Laravel 플러그인을 사용하기 시작하는 데 필요한 모든 것이 이미 포함되어 있습니다. NPM을 통해 애플리케이션의 프론트엔드 의존성을 설치할 수 있습니다:

```shell
npm install
```

<a name="configuring-vite"></a>
### Vite 설정하기

Vite는 프로젝트 루트에 있는 `vite.config.js` 파일을 통해 설정됩니다. 필요에 따라 이 파일을 자유롭게 커스터마이징할 수 있으며, `@vitejs/plugin-vue`나 `@vitejs/plugin-react`와 같이 애플리케이션에 필요한 다른 플러그인도 설치할 수 있습니다.

Laravel Vite 플러그인은 애플리케이션의 진입점(entry points)을 지정해야 합니다. 이러한 진입점은 JavaScript 또는 CSS 파일일 수 있으며, TypeScript, JSX, TSX, Sass와 같은 전처리 언어도 포함됩니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css',
            'resources/js/app.js',
        ]),
    ],
});
```

Inertia를 사용하여 빌드된 애플리케이션을 포함한 SPA를 빌드하는 경우, Vite는 CSS 진입점 없이 가장 잘 작동합니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css', // [tl! remove]
            'resources/js/app.js',
        ]),
    ],
});
```

대신, JavaScript를 통해 CSS를 가져와야 합니다. 일반적으로 이것은 애플리케이션의 `resources/js/app.js` 파일에서 수행됩니다:

```js
import './bootstrap';
import '../css/app.css'; // [tl! add]
```

Laravel 플러그인은 또한 [SSR 진입점](#ssr)과 같은 여러 진입점과 고급 설정 옵션을 지원합니다.

<a name="working-with-a-secure-development-server"></a>
#### 보안 개발 서버로 작업하기

로컬 개발 웹 서버가 HTTPS를 통해 애플리케이션을 제공하는 경우, Vite 개발 서버에 연결하는 데 문제가 발생할 수 있습니다.

[Laravel Herd](https://herd.laravel.com)를 사용하고 사이트를 보안 처리했거나 [Laravel Valet](/docs/{{version}}/valet)을 사용하고 애플리케이션에 대해 [secure 명령](/docs/{{version}}/valet#securing-sites)을 실행한 경우, Laravel Vite 플러그인이 자동으로 생성된 TLS 인증서를 감지하고 사용합니다.

애플리케이션의 디렉토리 이름과 일치하지 않는 호스트를 사용하여 사이트를 보안 처리한 경우, 애플리케이션의 `vite.config.js` 파일에서 호스트를 수동으로 지정할 수 있습니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            detectTls: 'my-app.test', // [tl! add]
        }),
    ],
});
```

다른 웹 서버를 사용하는 경우, 신뢰할 수 있는 인증서를 생성하고 생성된 인증서를 사용하도록 Vite를 수동으로 설정해야 합니다:

```js
// ...
import fs from 'fs'; // [tl! add]

const host = 'my-app.test'; // [tl! add]

export default defineConfig({
    // ...
    server: { // [tl! add]
        host, // [tl! add]
        hmr: { host }, // [tl! add]
        https: { // [tl! add]
            key: fs.readFileSync(`/path/to/${host}.key`), // [tl! add]
            cert: fs.readFileSync(`/path/to/${host}.crt`), // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

시스템에 대해 신뢰할 수 있는 인증서를 생성할 수 없는 경우, [@vitejs/plugin-basic-ssl 플러그인](https://github.com/vitejs/vite-plugin-basic-ssl)을 설치하고 설정할 수 있습니다. 신뢰할 수 없는 인증서를 사용하는 경우, `npm run dev` 명령을 실행할 때 콘솔의 "Local" 링크를 따라 브라우저에서 Vite 개발 서버의 인증서 경고를 수락해야 합니다.

<a name="configuring-hmr-in-sail-on-wsl2"></a>
#### WSL2에서 Sail로 개발 서버 실행하기

Windows Subsystem for Linux 2(WSL2)의 [Laravel Sail](/docs/{{version}}/sail) 내에서 Vite 개발 서버를 실행하는 경우, 브라우저가 개발 서버와 통신할 수 있도록 `vite.config.js` 파일에 다음 설정을 추가해야 합니다:

```js
// ...

export default defineConfig({
    // ...
    server: { // [tl! add:start]
        hmr: {
            host: 'localhost',
        },
    }, // [tl! add:end]
});
```

개발 서버가 실행되는 동안 파일 변경 사항이 브라우저에 반영되지 않는 경우, Vite의 [server.watch.usePolling 옵션](https://vitejs.dev/config/server-options.html#server-watch)을 설정해야 할 수도 있습니다.

<a name="loading-your-scripts-and-styles"></a>
### 스크립트와 스타일 로드하기

Vite 진입점이 설정되면, 애플리케이션의 루트 템플릿 `<head>`에 추가하는 `@vite()` Blade 디렉티브에서 이를 참조할 수 있습니다:

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

JavaScript를 통해 CSS를 가져오는 경우, JavaScript 진입점만 포함하면 됩니다:

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

`@vite` 디렉티브는 Vite 개발 서버를 자동으로 감지하고 핫 모듈 교체(Hot Module Replacement)를 활성화하기 위해 Vite 클라이언트를 주입합니다. 빌드 모드에서 이 디렉티브는 가져온 CSS를 포함하여 컴파일되고 버전이 지정된 에셋을 로드합니다.

필요한 경우, `@vite` 디렉티브를 호출할 때 컴파일된 에셋의 빌드 경로를 지정할 수도 있습니다:

```blade
<!doctype html>
<head>
    {{-- 주어진 빌드 경로는 public 경로를 기준으로 합니다. --}}

    @vite('resources/js/app.js', 'vendor/courier/build')
</head>
```

<a name="inline-assets"></a>
#### 인라인 에셋

때때로 에셋의 버전이 지정된 URL에 링크하는 대신 에셋의 원시 내용을 포함해야 할 수 있습니다. 예를 들어, HTML 내용을 PDF 생성기에 전달할 때 에셋 내용을 페이지에 직접 포함해야 할 수 있습니다. `Vite` 파사드가 제공하는 `content` 메서드를 사용하여 Vite 에셋의 내용을 출력할 수 있습니다:

```blade
@use('Illuminate\Support\Facades\Vite')

<!doctype html>
<head>
    {{-- ... --}}

    <style>
        {!! Vite::content('resources/css/app.css') !!}
    </style>
    <script>
        {!! Vite::content('resources/js/app.js') !!}
    </script>
</head>
```

<a name="running-vite"></a>
## Vite 실행하기

Vite를 실행하는 두 가지 방법이 있습니다. 로컬에서 개발할 때 유용한 `dev` 명령을 통해 개발 서버를 실행할 수 있습니다. 개발 서버는 파일 변경 사항을 자동으로 감지하고 열려 있는 브라우저 창에 즉시 반영합니다.

또는, `build` 명령을 실행하면 애플리케이션의 에셋을 버전 지정하고 번들링하여 프로덕션에 배포할 준비를 합니다:

```shell
# Vite 개발 서버 실행...
npm run dev

# 프로덕션용 에셋 빌드 및 버전 지정...
npm run build
```

WSL2의 [Sail](/docs/{{version}}/sail)에서 개발 서버를 실행하는 경우, [추가 설정](#configuring-hmr-in-sail-on-wsl2) 옵션이 필요할 수 있습니다.

<a name="working-with-scripts"></a>
## JavaScript 작업하기

<a name="aliases"></a>
### 별칭(Aliases)

기본적으로 Laravel 플러그인은 애플리케이션의 에셋을 편리하게 가져올 수 있도록 일반적인 별칭을 제공합니다:

```js
{
    '@' => '/resources/js'
}
```

`vite.config.js` 설정 파일에 직접 추가하여 `'@'` 별칭을 덮어쓸 수 있습니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel(['resources/ts/app.tsx']),
    ],
    resolve: {
        alias: {
            '@': '/resources/ts',
        },
    },
});
```

<a name="vue"></a>
### Vue

[Vue](https://vuejs.org/) 프레임워크를 사용하여 프론트엔드를 빌드하려면 `@vitejs/plugin-vue` 플러그인도 설치해야 합니다:

```shell
npm install --save-dev @vitejs/plugin-vue
```

그런 다음 `vite.config.js` 설정 파일에 플러그인을 포함할 수 있습니다. Laravel과 함께 Vue 플러그인을 사용할 때 필요한 몇 가지 추가 옵션이 있습니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.js']),
        vue({
            template: {
                transformAssetUrls: {
                    // Vue 플러그인은 단일 파일 컴포넌트에서 참조될 때
                    // 에셋 URL을 Laravel 웹 서버를 가리키도록 다시 작성합니다.
                    // 이것을 `null`로 설정하면 Laravel 플러그인이
                    // 대신 Vite 서버를 가리키도록 에셋 URL을 다시 작성합니다.
                    base: null,

                    // Vue 플러그인은 절대 URL을 구문 분석하고
                    // 디스크의 파일에 대한 절대 경로로 처리합니다.
                    // 이것을 `false`로 설정하면 절대 URL이 그대로 유지되어
                    // 예상대로 public 디렉토리의 에셋을 참조할 수 있습니다.
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

> [!NOTE]
> Laravel의 [스타터 킷](/docs/{{version}}/starter-kits)에는 이미 적절한 Laravel, Vue, Vite 설정이 포함되어 있습니다. 이러한 스타터 킷은 Laravel, Vue, Vite를 시작하는 가장 빠른 방법을 제공합니다.

<a name="react"></a>
### React

[React](https://reactjs.org/) 프레임워크를 사용하여 프론트엔드를 빌드하려면 `@vitejs/plugin-react` 플러그인도 설치해야 합니다:

```shell
npm install --save-dev @vitejs/plugin-react
```

그런 다음 `vite.config.js` 설정 파일에 플러그인을 포함할 수 있습니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.jsx']),
        react(),
    ],
});
```

JSX를 포함하는 모든 파일에 `.jsx` 또는 `.tsx` 확장자가 있는지 확인해야 하며, 필요한 경우 [위에 표시된 것처럼](#configuring-vite) 진입점을 업데이트해야 합니다.

기존 `@vite` 디렉티브와 함께 추가 `@viteReactRefresh` Blade 디렉티브도 포함해야 합니다.

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```

`@viteReactRefresh` 디렉티브는 `@vite` 디렉티브보다 먼저 호출되어야 합니다.

> [!NOTE]
> Laravel의 [스타터 킷](/docs/{{version}}/starter-kits)에는 이미 적절한 Laravel, React, Vite 설정이 포함되어 있습니다. 이러한 스타터 킷은 Laravel, React, Vite를 시작하는 가장 빠른 방법을 제공합니다.

<a name="inertia"></a>
### Inertia

Laravel Vite 플러그인은 Inertia 페이지 컴포넌트를 해결하는 데 도움이 되는 편리한 `resolvePageComponent` 함수를 제공합니다. 아래는 Vue 3에서 헬퍼를 사용하는 예입니다. 그러나 React와 같은 다른 프레임워크에서도 이 함수를 활용할 수 있습니다:

```js
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
});
```

Inertia와 함께 Vite의 코드 분할 기능을 사용하는 경우, [에셋 프리페칭](#asset-prefetching)을 설정하는 것이 좋습니다.

> [!NOTE]
> Laravel의 [스타터 킷](/docs/{{version}}/starter-kits)에는 이미 적절한 Laravel, Inertia, Vite 설정이 포함되어 있습니다. 이러한 스타터 킷은 Laravel, Inertia, Vite를 시작하는 가장 빠른 방법을 제공합니다.

<a name="url-processing"></a>
### URL 처리

Vite를 사용하고 애플리케이션의 HTML, CSS 또는 JS에서 에셋을 참조할 때 고려해야 할 몇 가지 주의 사항이 있습니다. 첫째, 절대 경로로 에셋을 참조하면 Vite가 에셋을 빌드에 포함하지 않습니다. 따라서 에셋이 public 디렉토리에서 사용 가능한지 확인해야 합니다. [전용 CSS 진입점](#configuring-vite)을 사용할 때는 절대 경로 사용을 피해야 합니다. 개발 중에 브라우저가 public 디렉토리가 아닌 CSS가 호스팅되는 Vite 개발 서버에서 이러한 경로를 로드하려고 시도하기 때문입니다.

상대 에셋 경로를 참조할 때, 경로가 참조되는 파일을 기준으로 한다는 것을 기억해야 합니다. 상대 경로를 통해 참조된 모든 에셋은 Vite에 의해 다시 작성되고, 버전이 지정되고, 번들링됩니다.

다음 프로젝트 구조를 고려하세요:

```text
public/
  taylor.png
resources/
  js/
    Pages/
      Welcome.vue
  images/
    abigail.png
```

다음 예제는 Vite가 상대 및 절대 URL을 어떻게 처리하는지 보여줍니다:

```html
<!-- 이 에셋은 Vite에서 처리되지 않으며 빌드에 포함되지 않습니다 -->
<img src="/taylor.png">

<!-- 이 에셋은 Vite에 의해 다시 작성되고, 버전이 지정되고, 번들링됩니다 -->
<img src="../../images/abigail.png">
```

<a name="working-with-stylesheets"></a>
## 스타일시트 작업하기

> [!NOTE]
> Laravel의 [스타터 킷](/docs/{{version}}/starter-kits)에는 이미 적절한 Tailwind와 Vite 설정이 포함되어 있습니다. 또는 스타터 킷 중 하나를 사용하지 않고 Tailwind와 Laravel을 사용하려면 [Laravel용 Tailwind 설치 가이드](https://tailwindcss.com/docs/guides/laravel)를 확인하세요.

모든 Laravel 애플리케이션에는 이미 Tailwind와 적절하게 설정된 `vite.config.js` 파일이 포함되어 있습니다. 따라서 Vite 개발 서버를 시작하거나 Laravel과 Vite 개발 서버를 모두 시작하는 `dev` Composer 명령을 실행하기만 하면 됩니다:

```shell
composer run dev
```

애플리케이션의 CSS는 `resources/css/app.css` 파일에 배치할 수 있습니다.

<a name="working-with-blade-and-routes"></a>
## Blade와 라우트 작업하기

<a name="blade-processing-static-assets"></a>
### Vite로 정적 에셋 처리하기

JavaScript 또는 CSS에서 에셋을 참조하면 Vite가 자동으로 처리하고 버전을 지정합니다. 또한 Blade 기반 애플리케이션을 빌드할 때 Vite는 Blade 템플릿에서만 참조하는 정적 에셋도 처리하고 버전을 지정할 수 있습니다.

그러나 이를 위해서는 애플리케이션의 진입점에 정적 에셋을 가져와서 Vite가 에셋을 인식하도록 해야 합니다. 예를 들어, `resources/images`에 저장된 모든 이미지와 `resources/fonts`에 저장된 모든 폰트를 처리하고 버전을 지정하려면 애플리케이션의 `resources/js/app.js` 진입점에 다음을 추가해야 합니다:

```js
import.meta.glob([
  '../images/**',
  '../fonts/**',
]);
```

이제 이러한 에셋은 `npm run build`를 실행할 때 Vite에 의해 처리됩니다. 그런 다음 주어진 에셋에 대해 버전이 지정된 URL을 반환하는 `Vite::asset` 메서드를 사용하여 Blade 템플릿에서 이러한 에셋을 참조할 수 있습니다:

```blade
<img src="{{ Vite::asset('resources/images/logo.png') }}">
```

<a name="blade-refreshing-on-save"></a>
### 저장 시 새로고침

Blade를 사용한 전통적인 서버 사이드 렌더링으로 애플리케이션이 빌드된 경우, Vite는 애플리케이션의 뷰 파일을 변경할 때 브라우저를 자동으로 새로고침하여 개발 워크플로를 개선할 수 있습니다. 시작하려면 `refresh` 옵션을 `true`로 지정하면 됩니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: true,
        }),
    ],
});
```

`refresh` 옵션이 `true`인 경우, `npm run dev`를 실행하는 동안 다음 디렉토리의 파일을 저장하면 브라우저가 전체 페이지 새로고침을 수행합니다:

- `app/Livewire/**`
- `app/View/Components/**`
- `lang/**`
- `resources/lang/**`
- `resources/views/**`
- `routes/**`

`routes/**` 디렉토리를 감시하는 것은 애플리케이션의 프론트엔드에서 라우트 링크를 생성하기 위해 [Ziggy](https://github.com/tighten/ziggy)를 활용하는 경우 유용합니다.

이러한 기본 경로가 요구 사항에 맞지 않는 경우, 감시할 경로 목록을 직접 지정할 수 있습니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: ['resources/views/**'],
        }),
    ],
});
```

내부적으로 Laravel Vite 플러그인은 이 기능의 동작을 미세 조정할 수 있는 고급 설정 옵션을 제공하는 [vite-plugin-full-reload](https://github.com/ElMassimo/vite-plugin-full-reload) 패키지를 사용합니다. 이 수준의 커스터마이징이 필요한 경우 `config` 정의를 제공할 수 있습니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: [{
                paths: ['path/to/watch/**'],
                config: { delay: 300 }
            }],
        }),
    ],
});
```

<a name="blade-aliases"></a>
### 별칭(Aliases)

JavaScript 애플리케이션에서 자주 참조하는 디렉토리에 대한 [별칭을 생성](#aliases)하는 것이 일반적입니다. 하지만 `Illuminate\Support\Facades\Vite` 클래스의 `macro` 메서드를 사용하여 Blade에서 사용할 별칭을 생성할 수도 있습니다. 일반적으로 "매크로"는 [서비스 프로바이더](/docs/{{version}}/providers)의 `boot` 메서드 내에서 정의되어야 합니다:

```php
/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Vite::macro('image', fn (string $asset) => $this->asset("resources/images/{$asset}"));
}
```

매크로가 정의되면 템플릿 내에서 호출할 수 있습니다. 예를 들어, 위에서 정의한 `image` 매크로를 사용하여 `resources/images/logo.png`에 있는 에셋을 참조할 수 있습니다:

```blade
<img src="{{ Vite::image('logo.png') }}" alt="Laravel Logo">
```

<a name="asset-prefetching"></a>
## 에셋 프리페칭(Asset Prefetching)

Vite의 코드 분할 기능을 사용하여 SPA를 빌드하면 필요한 에셋이 각 페이지 탐색 시 페치됩니다. 이 동작은 UI 렌더링 지연을 초래할 수 있습니다. 선택한 프론트엔드 프레임워크에서 이것이 문제가 되는 경우, Laravel은 초기 페이지 로드 시 애플리케이션의 JavaScript와 CSS 에셋을 즉시 프리페치하는 기능을 제공합니다.

[서비스 프로바이더](/docs/{{version}}/providers)의 `boot` 메서드에서 `Vite::prefetch` 메서드를 호출하여 Laravel이 에셋을 즉시 프리페치하도록 지시할 수 있습니다:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
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
        Vite::prefetch(concurrency: 3);
    }
}
```

위 예제에서 에셋은 각 페이지 로드 시 최대 `3`개의 동시 다운로드로 프리페치됩니다. 애플리케이션의 요구 사항에 맞게 동시성을 수정하거나 애플리케이션이 모든 에셋을 한 번에 다운로드해야 하는 경우 동시성 제한을 지정하지 않을 수 있습니다:

```php
/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Vite::prefetch();
}
```

기본적으로 프리페칭은 [페이지 _load_ 이벤트](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event)가 발생할 때 시작됩니다. 프리페칭이 시작되는 시점을 커스터마이징하려면 Vite가 수신할 이벤트를 지정할 수 있습니다:

```php
/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Vite::prefetch(event: 'vite:prefetch');
}
```

위 코드가 주어지면 `window` 객체에서 `vite:prefetch` 이벤트를 수동으로 디스패치할 때 프리페칭이 시작됩니다. 예를 들어, 페이지가 로드된 후 3초 후에 프리페칭을 시작하도록 할 수 있습니다:

```html
<script>
    addEventListener('load', () => setTimeout(() => {
        dispatchEvent(new Event('vite:prefetch'))
    }, 3000))
</script>
```

<a name="custom-base-urls"></a>
## 커스텀 베이스 URL

Vite로 컴파일된 에셋이 CDN을 통해서와 같이 애플리케이션과 별도의 도메인에 배포되는 경우, 애플리케이션의 `.env` 파일 내에서 `ASSET_URL` 환경 변수를 지정해야 합니다:

```env
ASSET_URL=https://cdn.example.com
```

에셋 URL을 설정한 후, 에셋에 대한 모든 다시 작성된 URL에는 설정된 값이 접두사로 붙습니다:

```text
https://cdn.example.com/build/assets/app.9dce8d17.js
```

[절대 URL은 Vite에 의해 다시 작성되지 않으므로](#url-processing) 접두사가 붙지 않습니다.

<a name="environment-variables"></a>
## 환경 변수

애플리케이션의 `.env` 파일에서 `VITE_` 접두사를 붙여 환경 변수를 JavaScript에 주입할 수 있습니다:

```env
VITE_SENTRY_DSN_PUBLIC=http://example.com
```

`import.meta.env` 객체를 통해 주입된 환경 변수에 액세스할 수 있습니다:

```js
import.meta.env.VITE_SENTRY_DSN_PUBLIC
```

<a name="disabling-vite-in-tests"></a>
## 테스트에서 Vite 비활성화하기

Laravel의 Vite 통합은 테스트를 실행하는 동안 에셋을 해결하려고 시도하며, 이를 위해 Vite 개발 서버를 실행하거나 에셋을 빌드해야 합니다.

테스트 중에 Vite를 모킹하려면 Laravel의 `TestCase` 클래스를 확장하는 모든 테스트에서 사용할 수 있는 `withoutVite` 메서드를 호출할 수 있습니다:

```php tab=Pest
test('without vite example', function () {
    $this->withoutVite();

    // ...
});
```

```php tab=PHPUnit
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_without_vite_example(): void
    {
        $this->withoutVite();

        // ...
    }
}
```

모든 테스트에서 Vite를 비활성화하려면 기본 `TestCase` 클래스의 `setUp` 메서드에서 `withoutVite` 메서드를 호출할 수 있습니다:

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void// [tl! add:start]
    {
        parent::setUp();

        $this->withoutVite();
    }// [tl! add:end]
}
```

<a name="ssr"></a>
## 서버 사이드 렌더링 (SSR)

Laravel Vite 플러그인을 사용하면 Vite와 함께 서버 사이드 렌더링을 쉽게 설정할 수 있습니다. 시작하려면 `resources/js/ssr.js`에 SSR 진입점을 생성하고 Laravel 플러그인에 설정 옵션을 전달하여 진입점을 지정하세요:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            ssr: 'resources/js/ssr.js',
        }),
    ],
});
```

SSR 진입점을 다시 빌드하는 것을 잊지 않도록, 애플리케이션의 `package.json`에서 "build" 스크립트를 수정하여 SSR 빌드를 생성하는 것이 좋습니다:

```json
"scripts": {
     "dev": "vite",
     "build": "vite build" // [tl! remove]
     "build": "vite build && vite build --ssr" // [tl! add]
}
```

그런 다음 SSR 서버를 빌드하고 시작하려면 다음 명령을 실행할 수 있습니다:

```shell
npm run build
node bootstrap/ssr/ssr.js
```

[Inertia와 함께 SSR](https://inertiajs.com/server-side-rendering)을 사용하는 경우, 대신 `inertia:start-ssr` Artisan 명령을 사용하여 SSR 서버를 시작할 수 있습니다:

```shell
php artisan inertia:start-ssr
```

> [!NOTE]
> Laravel의 [스타터 킷](/docs/{{version}}/starter-kits)에는 이미 적절한 Laravel, Inertia SSR, Vite 설정이 포함되어 있습니다. 이러한 스타터 킷은 Laravel, Inertia SSR, Vite를 시작하는 가장 빠른 방법을 제공합니다.

<a name="script-and-style-attributes"></a>
## 스크립트 및 스타일 태그 속성

<a name="content-security-policy-csp-nonce"></a>
### 콘텐츠 보안 정책 (CSP) Nonce

[콘텐츠 보안 정책](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)의 일부로 스크립트 및 스타일 태그에 [nonce 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)을 포함하려면 커스텀 [미들웨어](/docs/{{version}}/middleware) 내에서 `useCspNonce` 메서드를 사용하여 nonce를 생성하거나 지정할 수 있습니다:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class AddContentSecurityPolicyHeaders
{
    /**
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Vite::useCspNonce();

        return $next($request)->withHeaders([
            'Content-Security-Policy' => "script-src 'nonce-".Vite::cspNonce()."'",
        ]);
    }
}
```

`useCspNonce` 메서드를 호출한 후, Laravel은 생성된 모든 스크립트 및 스타일 태그에 `nonce` 속성을 자동으로 포함합니다.

Laravel의 [스타터 킷](/docs/{{version}}/starter-kits)에 포함된 [Ziggy `@route` 디렉티브](https://github.com/tighten/ziggy#using-routes-with-a-content-security-policy)를 포함하여 다른 곳에서 nonce를 지정해야 하는 경우, `cspNonce` 메서드를 사용하여 검색할 수 있습니다:

```blade
@routes(nonce: Vite::cspNonce())
```

Laravel에서 사용하도록 지시하려는 nonce가 이미 있는 경우, `useCspNonce` 메서드에 nonce를 전달할 수 있습니다:

```php
Vite::useCspNonce($nonce);
```

<a name="subresource-integrity-sri"></a>
### 서브리소스 무결성 (SRI)

Vite 매니페스트에 에셋에 대한 `integrity` 해시가 포함된 경우, Laravel은 [서브리소스 무결성](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)을 적용하기 위해 생성하는 모든 스크립트 및 스타일 태그에 `integrity` 속성을 자동으로 추가합니다. 기본적으로 Vite는 매니페스트에 `integrity` 해시를 포함하지 않지만, [vite-plugin-manifest-sri](https://www.npmjs.com/package/vite-plugin-manifest-sri) NPM 플러그인을 설치하여 활성화할 수 있습니다:

```shell
npm install --save-dev vite-plugin-manifest-sri
```

그런 다음 `vite.config.js` 파일에서 이 플러그인을 활성화할 수 있습니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import manifestSRI from 'vite-plugin-manifest-sri';// [tl! add]

export default defineConfig({
    plugins: [
        laravel({
            // ...
        }),
        manifestSRI(),// [tl! add]
    ],
});
```

필요한 경우, 무결성 해시를 찾을 수 있는 매니페스트 키를 커스터마이징할 수도 있습니다:

```php
use Illuminate\Support\Facades\Vite;

Vite::useIntegrityKey('custom-integrity-key');
```

이 자동 감지를 완전히 비활성화하려면 `useIntegrityKey` 메서드에 `false`를 전달할 수 있습니다:

```php
Vite::useIntegrityKey(false);
```

<a name="arbitrary-attributes"></a>
### 임의 속성

스크립트 및 스타일 태그에 [data-turbo-track](https://turbo.hotwired.dev/handbook/drive#reloading-when-assets-change) 속성과 같은 추가 속성을 포함해야 하는 경우, `useScriptTagAttributes` 및 `useStyleTagAttributes` 메서드를 통해 지정할 수 있습니다. 일반적으로 이러한 메서드는 [서비스 프로바이더](/docs/{{version}}/providers)에서 호출되어야 합니다:

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes([
    'data-turbo-track' => 'reload', // 속성에 대한 값을 지정...
    'async' => true, // 값 없이 속성을 지정...
    'integrity' => false, // 그렇지 않으면 포함될 속성을 제외...
]);

Vite::useStyleTagAttributes([
    'data-turbo-track' => 'reload',
]);
```

조건부로 속성을 추가해야 하는 경우, 에셋 소스 경로, URL, 매니페스트 청크 및 전체 매니페스트를 받는 콜백을 전달할 수 있습니다:

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $src === 'resources/js/app.js' ? 'reload' : false,
]);

Vite::useStyleTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $chunk && $chunk['isEntry'] ? 'reload' : false,
]);
```

> [!WARNING]
> Vite 개발 서버가 실행되는 동안 `$chunk` 및 `$manifest` 인수는 `null`이 됩니다.

<a name="advanced-customization"></a>
## 고급 커스터마이징

기본적으로 Laravel의 Vite 플러그인은 대부분의 애플리케이션에서 작동해야 하는 합리적인 규칙을 사용합니다. 그러나 때때로 Vite의 동작을 커스터마이징해야 할 수 있습니다. 추가 커스터마이징 옵션을 활성화하기 위해 `@vite` Blade 디렉티브 대신 사용할 수 있는 다음 메서드와 옵션을 제공합니다:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    {{
        Vite::useHotFile(storage_path('vite.hot')) // "hot" 파일 커스터마이징...
            ->useBuildDirectory('bundle') // 빌드 디렉토리 커스터마이징...
            ->useManifestFilename('assets.json') // 매니페스트 파일명 커스터마이징...
            ->withEntryPoints(['resources/js/app.js']) // 진입점 지정...
            ->createAssetPathsUsing(function (string $path, ?bool $secure) { // 빌드된 에셋에 대한 백엔드 경로 생성 커스터마이징...
                return "https://cdn.example.com/{$path}";
            })
    }}
</head>
```

`vite.config.js` 파일 내에서 동일한 설정을 지정해야 합니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'storage/vite.hot', // "hot" 파일 커스터마이징...
            buildDirectory: 'bundle', // 빌드 디렉토리 커스터마이징...
            input: ['resources/js/app.js'], // 진입점 지정...
        }),
    ],
    build: {
      manifest: 'assets.json', // 매니페스트 파일명 커스터마이징...
    },
});
```

<a name="cors"></a>
### 개발 서버 교차 출처 리소스 공유 (CORS)

Vite 개발 서버에서 에셋을 가져오는 동안 브라우저에서 교차 출처 리소스 공유(CORS) 문제가 발생하는 경우, 개발 서버에 커스텀 오리진 액세스 권한을 부여해야 할 수 있습니다. Laravel 플러그인과 결합된 Vite는 추가 설정 없이 다음 오리진을 허용합니다:

- `::1`
- `127.0.0.1`
- `localhost`
- `*.test`
- `*.localhost`
- 프로젝트 `.env`의 `APP_URL`

프로젝트에 커스텀 오리진을 허용하는 가장 쉬운 방법은 애플리케이션의 `APP_URL` 환경 변수가 브라우저에서 방문하는 오리진과 일치하는지 확인하는 것입니다. 예를 들어, `https://my-app.laravel`을 방문하는 경우 `.env`를 업데이트하여 일치시켜야 합니다:

```env
APP_URL=https://my-app.laravel
```

여러 오리진을 지원하는 것과 같이 오리진에 대해 더 세밀한 제어가 필요한 경우, [Vite의 포괄적이고 유연한 내장 CORS 서버 설정](https://vite.dev/config/server-options.html#server-cors)을 활용해야 합니다. 예를 들어, 프로젝트의 `vite.config.js` 파일에서 `server.cors.origin` 설정 옵션에 여러 오리진을 지정할 수 있습니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
    ],
    server: {  // [tl! add]
        cors: {  // [tl! add]
            origin: [  // [tl! add]
                'https://backend.laravel',  // [tl! add]
                'http://admin.laravel:8566',  // [tl! add]
            ],  // [tl! add]
        },  // [tl! add]
    },  // [tl! add]
});
```

`*.laravel`과 같은 주어진 최상위 도메인에 대해 모든 오리진을 허용하려는 경우 도움이 될 수 있는 정규식 패턴도 포함할 수 있습니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
    ],
    server: {  // [tl! add]
        cors: {  // [tl! add]
            origin: [ // [tl! add]
                // 지원: SCHEME://DOMAIN.laravel[:PORT] [tl! add]
                /^https?:\/\/.*\.laravel(:\d+)?$/, //[tl! add]
            ], // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

<a name="correcting-dev-server-urls"></a>
### 개발 서버 URL 수정하기

Vite 생태계 내의 일부 플러그인은 슬래시로 시작하는 URL이 항상 Vite 개발 서버를 가리킨다고 가정합니다. 그러나 Laravel 통합의 특성상 이것은 사실이 아닙니다.

예를 들어, `vite-imagetools` 플러그인은 Vite가 에셋을 제공하는 동안 다음과 같은 URL을 출력합니다:

```html
<img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520">
```

`vite-imagetools` 플러그인은 출력 URL이 Vite에 의해 가로채지고 플러그인이 `/@imagetools`로 시작하는 모든 URL을 처리할 수 있을 것으로 예상합니다. 이 동작을 예상하는 플러그인을 사용하는 경우, URL을 수동으로 수정해야 합니다. `vite.config.js` 파일에서 `transformOnServe` 옵션을 사용하여 이 작업을 수행할 수 있습니다.

이 특정 예제에서는 생성된 코드 내에서 `/@imagetools`의 모든 발생에 개발 서버 URL을 접두사로 추가합니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            transformOnServe: (code, devServerUrl) => code.replaceAll('/@imagetools', devServerUrl+'/@imagetools'),
        }),
        imagetools(),
    ],
});
```

이제 Vite가 에셋을 제공하는 동안 Vite 개발 서버를 가리키는 URL을 출력합니다:

```html
- <img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! remove] -->
+ <img src="http://[::1]:5173/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! add] -->
```

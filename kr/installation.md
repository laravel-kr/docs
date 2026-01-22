# 설치하기

- [Laravel 소개](#meet-laravel)
    - [왜 Laravel인가?](#why-laravel)
- [Laravel 애플리케이션 생성하기](#creating-a-laravel-project)
    - [PHP와 Laravel 설치 프로그램 설치하기](#installing-php)
    - [애플리케이션 생성하기](#creating-an-application)
- [초기 설정](#initial-configuration)
    - [환경 기반 설정](#environment-based-configuration)
    - [데이터베이스와 마이그레이션](#databases-and-migrations)
    - [디렉토리 설정](#directory-configuration)
- [Herd를 사용한 설치](#installation-using-herd)
    - [macOS에서 Herd 사용하기](#herd-on-macos)
    - [Windows에서 Herd 사용하기](#herd-on-windows)
- [IDE 지원](#ide-support)
- [다음 단계](#next-steps)
    - [풀스택 프레임워크로서의 Laravel](#laravel-the-fullstack-framework)
    - [API 백엔드로서의 Laravel](#laravel-the-api-backend)

<a name="meet-laravel"></a>
## Laravel 소개

Laravel은 표현력이 뛰어나고 우아한 문법을 갖춘 웹 애플리케이션 프레임워크입니다. 웹 프레임워크는 애플리케이션을 생성하기 위한 구조와 시작점을 제공하여, 여러분이 놀라운 것을 만드는 데 집중할 수 있도록 세부 사항을 처리해 드립니다.

Laravel은 철저한 의존성 주입(Dependency Injection), 표현력 있는 데이터베이스 추상화 레이어, 큐(Queue)와 예약된 작업, 단위 테스트 및 통합 테스트 등 강력한 기능을 제공하면서 놀라운 개발자 경험을 제공하기 위해 노력합니다.

PHP 웹 프레임워크를 처음 접하시든 수년간의 경험이 있으시든, Laravel은 여러분과 함께 성장할 수 있는 프레임워크입니다. 웹 개발자로서 첫 발을 내딛는 것을 도와드리거나, 전문 지식을 한 단계 끌어올릴 수 있도록 도움을 드리겠습니다. 여러분이 무엇을 만들어낼지 정말 기대됩니다.

<a name="why-laravel"></a>
### 왜 Laravel인가?

웹 애플리케이션을 구축할 때 사용할 수 있는 다양한 도구와 프레임워크가 있습니다. 그러나 Laravel이 현대적인 풀스택 웹 애플리케이션을 구축하기 위한 최고의 선택이라고 믿습니다.

#### 점진적인 프레임워크

우리는 Laravel을 "점진적인" 프레임워크라고 부르고 싶습니다. 이는 Laravel이 여러분과 함께 성장한다는 것을 의미합니다. 웹 개발의 첫 발을 막 내딛는 중이라면, Laravel의 방대한 문서 라이브러리, 가이드, [비디오 튜토리얼](https://laracasts.com)이 부담스럽지 않게 기초를 배울 수 있도록 도와줄 것입니다.

시니어 개발자라면, Laravel은 [의존성 주입](/docs/{{version}}/container), [단위 테스트](/docs/{{version}}/testing), [큐](/docs/{{version}}/queues), [실시간 이벤트](/docs/{{version}}/broadcasting) 등을 위한 강력한 도구를 제공합니다. Laravel은 전문적인 웹 애플리케이션 구축에 최적화되어 있으며, 엔터프라이즈급 작업 부하를 처리할 준비가 되어 있습니다.

#### 확장 가능한 프레임워크

Laravel은 놀라울 정도로 확장 가능합니다. PHP의 확장 친화적인 특성과 Redis와 같은 빠른 분산 캐시 시스템에 대한 Laravel의 내장 지원 덕분에, Laravel을 사용한 수평적 확장은 매우 쉽습니다. 실제로 Laravel 애플리케이션은 월간 수억 건의 요청을 처리할 수 있도록 쉽게 확장되었습니다.

극한의 확장이 필요하신가요? [Laravel Cloud](https://cloud.laravel.com)와 같은 플랫폼을 사용하면 거의 무제한적인 규모로 Laravel 애플리케이션을 실행할 수 있습니다.

#### 커뮤니티 프레임워크

Laravel은 PHP 생태계의 최고의 패키지들을 결합하여 가장 견고하고 개발자 친화적인 프레임워크를 제공합니다. 또한, 전 세계의 수천 명의 재능 있는 개발자들이 [프레임워크에 기여](https://github.com/laravel/framework)해 왔습니다. 누가 알겠습니까, 어쩌면 여러분도 Laravel 기여자가 될 수 있을지도요.

<a name="creating-a-laravel-project"></a>
## Laravel 애플리케이션 생성하기

<a name="installing-php"></a>
### PHP와 Laravel 설치 프로그램 설치하기

첫 번째 Laravel 애플리케이션을 생성하기 전에, 로컬 컴퓨터에 [PHP](https://php.net), [Composer](https://getcomposer.org), [Laravel 설치 프로그램](https://github.com/laravel/installer)이 설치되어 있는지 확인하세요. 또한, 애플리케이션의 프론트엔드 에셋을 컴파일할 수 있도록 [Node와 NPM](https://nodejs.org) 또는 [Bun](https://bun.sh/)을 설치해야 합니다.

로컬 컴퓨터에 PHP와 Composer가 설치되어 있지 않다면, 다음 명령어로 macOS, Windows 또는 Linux에 PHP, Composer, Laravel 설치 프로그램을 설치할 수 있습니다.

```shell tab=macOS
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.4)"
```

```shell tab=Windows PowerShell
# 관리자 권한으로 실행...
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.4'))
```

```shell tab=Linux
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.4)"
```

위의 명령어 중 하나를 실행한 후에는 터미널 세션을 다시 시작해야 합니다. `php.new`를 통해 설치한 PHP, Composer, Laravel 설치 프로그램을 업데이트하려면 터미널에서 해당 명령어를 다시 실행하면 됩니다.

이미 PHP와 Composer가 설치되어 있다면, Composer를 통해 Laravel 설치 프로그램을 설치할 수 있습니다.

```shell
composer global require laravel/installer
```

> [!NOTE]
> 완전한 기능을 갖춘 그래픽 PHP 설치 및 관리 환경을 원하신다면, [Laravel Herd](#installation-using-herd)를 확인해 보세요.

<a name="creating-an-application"></a>
### 애플리케이션 생성하기

PHP, Composer, Laravel 설치 프로그램을 설치한 후에는 새로운 Laravel 애플리케이션을 생성할 준비가 되었습니다. Laravel 설치 프로그램은 선호하는 테스트 프레임워크, 데이터베이스, 스타터 킷을 선택하도록 안내할 것입니다.

```shell
laravel new example-app
```

애플리케이션이 생성되면, `dev` Composer 스크립트를 사용하여 Laravel의 로컬 개발 서버, 큐 워커(Queue Worker), Vite 개발 서버를 시작할 수 있습니다.

```shell
cd example-app
npm install && npm run build
composer run dev
```

개발 서버를 시작하면, 웹 브라우저에서 [http://localhost:8000](http://localhost:8000)으로 애플리케이션에 접근할 수 있습니다. 이제 [Laravel 생태계에서 다음 단계를 시작할](#next-steps) 준비가 되었습니다. 물론, [데이터베이스를 설정](#databases-and-migrations)하는 것도 좋습니다.

> [!NOTE]
> Laravel 애플리케이션을 개발할 때 빠르게 시작하고 싶다면, [스타터 킷](/docs/{{version}}/starter-kits) 중 하나를 사용하는 것을 고려해 보세요. Laravel의 스타터 킷은 새로운 Laravel 애플리케이션을 위한 백엔드 및 프론트엔드 인증 스캐폴딩을 제공합니다.

<a name="initial-configuration"></a>
## 초기 설정

Laravel 프레임워크의 모든 설정 파일은 `config` 디렉토리에 저장됩니다. 각 옵션은 문서화되어 있으므로, 파일을 자유롭게 살펴보고 사용 가능한 옵션들을 익혀보세요.

Laravel은 기본적으로 거의 추가 설정이 필요하지 않습니다. 바로 개발을 시작하실 수 있습니다! 그러나 `config/app.php` 파일과 해당 문서를 검토해 보시는 것이 좋습니다. 이 파일에는 애플리케이션에 따라 변경하고 싶을 수 있는 `url`이나 `locale`과 같은 여러 옵션이 포함되어 있습니다.

<a name="environment-based-configuration"></a>
### 환경 기반 설정

Laravel의 많은 설정 옵션 값은 애플리케이션이 로컬 컴퓨터에서 실행되는지 프로덕션 웹 서버에서 실행되는지에 따라 달라질 수 있으므로, 많은 중요한 설정 값은 애플리케이션 루트에 있는 `.env` 파일을 사용하여 정의됩니다.

`.env` 파일은 애플리케이션의 소스 컨트롤에 커밋하면 안 됩니다. 왜냐하면 애플리케이션을 사용하는 각 개발자/서버마다 다른 환경 설정이 필요할 수 있기 때문입니다. 또한, 침입자가 소스 컨트롤 저장소에 접근할 경우 민감한 자격 증명이 노출될 수 있어 보안 위험이 될 수 있습니다.

> [!NOTE]
> `.env` 파일과 환경 기반 설정에 대한 자세한 내용은 전체 [설정 문서](/docs/{{version}}/configuration#environment-configuration)를 확인하세요.

<a name="databases-and-migrations"></a>
### 데이터베이스와 마이그레이션

이제 Laravel 애플리케이션을 생성했으니, 아마도 데이터베이스에 데이터를 저장하고 싶을 것입니다. 기본적으로 애플리케이션의 `.env` 설정 파일은 Laravel이 SQLite 데이터베이스와 상호작용하도록 지정합니다.

애플리케이션을 생성하는 동안 Laravel은 `database/database.sqlite` 파일을 생성하고, 애플리케이션의 데이터베이스 테이블을 생성하기 위해 필요한 마이그레이션을 실행했습니다.

MySQL이나 PostgreSQL과 같은 다른 데이터베이스 드라이버를 사용하고 싶다면, `.env` 설정 파일을 업데이트하여 적절한 데이터베이스를 사용하도록 할 수 있습니다. 예를 들어, MySQL을 사용하고 싶다면 `.env` 설정 파일의 `DB_*` 변수를 다음과 같이 업데이트하세요.

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

SQLite 이외의 데이터베이스를 사용하기로 선택한 경우, 데이터베이스를 생성하고 애플리케이션의 [데이터베이스 마이그레이션](/docs/{{version}}/migrations)을 실행해야 합니다.

```shell
php artisan migrate
```

> [!NOTE]
> macOS 또는 Windows에서 개발 중이고 MySQL, PostgreSQL 또는 Redis를 로컬에 설치해야 하는 경우, [Herd Pro](https://herd.laravel.com/#plans) 또는 [DBngin](https://dbngin.com/)을 사용하는 것을 고려해 보세요.

<a name="directory-configuration"></a>
### 디렉토리 설정

Laravel은 항상 웹 서버에 설정된 "웹 디렉토리"의 루트에서 제공되어야 합니다. "웹 디렉토리"의 하위 디렉토리에서 Laravel 애플리케이션을 제공하려고 하면 안 됩니다. 그렇게 하면 애플리케이션 내에 존재하는 민감한 파일이 노출될 수 있습니다.

<a name="installation-using-herd"></a>
## Herd를 사용한 설치

[Laravel Herd](https://herd.laravel.com)는 macOS와 Windows를 위한 매우 빠른 네이티브 Laravel 및 PHP 개발 환경입니다. Herd에는 PHP와 Nginx를 포함하여 Laravel 개발을 시작하는 데 필요한 모든 것이 포함되어 있습니다.

Herd를 설치하면 Laravel로 개발을 시작할 준비가 됩니다. Herd에는 `php`, `composer`, `laravel`, `expose`, `node`, `npm`, `nvm`을 위한 커맨드 라인 도구가 포함되어 있습니다.

> [!NOTE]
> [Herd Pro](https://herd.laravel.com/#plans)는 로컬 MySQL, Postgres, Redis 데이터베이스를 생성하고 관리하는 기능, 로컬 메일 보기 및 로그 모니터링과 같은 추가적인 강력한 기능으로 Herd를 보강합니다.

<a name="herd-on-macos"></a>
### macOS에서 Herd 사용하기

macOS에서 개발하는 경우, [Herd 웹사이트](https://herd.laravel.com)에서 Herd 설치 프로그램을 다운로드할 수 있습니다. 설치 프로그램은 자동으로 최신 버전의 PHP를 다운로드하고, Mac이 항상 백그라운드에서 [Nginx](https://www.nginx.com/)를 실행하도록 설정합니다.

macOS용 Herd는 [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq)를 사용하여 "파킹된" 디렉토리를 지원합니다. 파킹된 디렉토리의 모든 Laravel 애플리케이션은 Herd에 의해 자동으로 제공됩니다. 기본적으로 Herd는 `~/Herd`에 파킹된 디렉토리를 생성하며, 이 디렉토리의 모든 Laravel 애플리케이션은 디렉토리 이름을 사용하여 `.test` 도메인에서 접근할 수 있습니다.

Herd를 설치한 후, 새로운 Laravel 애플리케이션을 생성하는 가장 빠른 방법은 Herd에 번들로 포함된 Laravel CLI를 사용하는 것입니다.

```shell
cd ~/Herd
laravel new my-app
cd my-app
herd open
```

물론, 시스템 트레이의 Herd 메뉴에서 열 수 있는 Herd의 UI를 통해 파킹된 디렉토리 및 기타 PHP 설정을 항상 관리할 수 있습니다.

Herd에 대해 더 자세히 알아보려면 [Herd 문서](https://herd.laravel.com/docs)를 확인하세요.

<a name="herd-on-windows"></a>
### Windows에서 Herd 사용하기

[Herd 웹사이트](https://herd.laravel.com/windows)에서 Windows용 Herd 설치 프로그램을 다운로드할 수 있습니다. 설치가 완료되면, Herd를 시작하여 온보딩 프로세스를 완료하고 처음으로 Herd UI에 접근할 수 있습니다.

Herd UI는 Herd의 시스템 트레이 아이콘을 왼쪽 클릭하여 접근할 수 있습니다. 오른쪽 클릭하면 일상적으로 필요한 모든 도구에 접근할 수 있는 빠른 메뉴가 열립니다.

설치하는 동안 Herd는 `%USERPROFILE%\Herd`에 홈 디렉토리에 "파킹된" 디렉토리를 생성합니다. 파킹된 디렉토리의 모든 Laravel 애플리케이션은 Herd에 의해 자동으로 제공되며, 이 디렉토리의 모든 Laravel 애플리케이션은 디렉토리 이름을 사용하여 `.test` 도메인에서 접근할 수 있습니다.

Herd를 설치한 후, 새로운 Laravel 애플리케이션을 생성하는 가장 빠른 방법은 Herd에 번들로 포함된 Laravel CLI를 사용하는 것입니다. 시작하려면 Powershell을 열고 다음 명령어를 실행하세요.

```shell
cd ~\Herd
laravel new my-app
cd my-app
herd open
```

Herd에 대해 더 자세히 알아보려면 [Windows용 Herd 문서](https://herd.laravel.com/docs/windows)를 확인하세요.

<a name="ide-support"></a>
## IDE 지원

Laravel 애플리케이션을 개발할 때 원하는 코드 에디터를 자유롭게 사용할 수 있습니다. 그러나 [PhpStorm](https://www.jetbrains.com/phpstorm/laravel/)은 [Laravel Pint](https://www.jetbrains.com/help/phpstorm/using-laravel-pint.html)를 포함하여 Laravel과 그 생태계에 대한 광범위한 지원을 제공합니다.

또한, 커뮤니티에서 유지 관리하는 [Laravel Idea](https://laravel-idea.com/) PhpStorm 플러그인은 코드 생성, Eloquent 문법 완성, 유효성 검사 규칙 완성 등 다양한 유용한 IDE 기능을 제공합니다.

[Visual Studio Code (VS Code)](https://code.visualstudio.com)에서 개발하는 경우, 이제 공식 [Laravel VS Code 확장](https://marketplace.visualstudio.com/items?itemName=laravel.vscode-laravel)을 사용할 수 있습니다. 이 확장은 Laravel 전용 도구를 VS Code 환경에 직접 가져와 생산성을 향상시킵니다.

<a name="next-steps"></a>
## 다음 단계

이제 Laravel 애플리케이션을 생성했으니, 다음에 무엇을 배울지 궁금할 수 있습니다. 먼저, 다음 문서를 읽어 Laravel이 어떻게 작동하는지 익히는 것을 강력히 권장합니다.

<div class="content-list" markdown="1">

- [요청 라이프사이클](/docs/{{version}}/lifecycle)
- [설정](/docs/{{version}}/configuration)
- [디렉토리 구조](/docs/{{version}}/structure)
- [프론트엔드](/docs/{{version}}/frontend)
- [서비스 컨테이너](/docs/{{version}}/container)
- [파사드](/docs/{{version}}/facades)

</div>

Laravel을 어떻게 사용하고 싶은지에 따라 여정의 다음 단계가 결정됩니다. Laravel을 사용하는 다양한 방법이 있으며, 아래에서 프레임워크의 두 가지 주요 사용 사례를 살펴보겠습니다.

<a name="laravel-the-fullstack-framework"></a>
### 풀스택 프레임워크로서의 Laravel

Laravel은 풀스택 프레임워크로 사용될 수 있습니다. "풀스택" 프레임워크란 Laravel을 사용하여 애플리케이션으로의 요청을 라우팅하고 [Blade 템플릿](/docs/{{version}}/blade) 또는 [Inertia](https://inertiajs.com)와 같은 단일 페이지 애플리케이션 하이브리드 기술을 통해 프론트엔드를 렌더링한다는 것을 의미합니다. 이것이 Laravel 프레임워크를 사용하는 가장 일반적인 방법이며, 우리의 의견으로는 Laravel을 가장 생산적으로 사용하는 방법입니다.

이 방식으로 Laravel을 사용할 계획이라면, [프론트엔드 개발](/docs/{{version}}/frontend), [라우팅](/docs/{{version}}/routing), [뷰](/docs/{{version}}/views) 또는 [Eloquent ORM](/docs/{{version}}/eloquent)에 대한 문서를 확인해 보세요. 또한, [Livewire](https://livewire.laravel.com)나 [Inertia](https://inertiajs.com)와 같은 커뮤니티 패키지에 대해 배우는 것도 좋습니다. 이러한 패키지를 사용하면 Laravel을 풀스택 프레임워크로 사용하면서 단일 페이지 JavaScript 애플리케이션이 제공하는 많은 UI 이점을 누릴 수 있습니다.

Laravel을 풀스택 프레임워크로 사용하는 경우, [Vite](/docs/{{version}}/vite)를 사용하여 애플리케이션의 CSS와 JavaScript를 컴파일하는 방법을 배우는 것도 강력히 권장합니다.

> [!NOTE]
> 애플리케이션 구축을 빠르게 시작하고 싶다면, 공식 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits) 중 하나를 확인해 보세요.

<a name="laravel-the-api-backend"></a>
### API 백엔드로서의 Laravel

Laravel은 JavaScript 단일 페이지 애플리케이션이나 모바일 애플리케이션의 API 백엔드로도 사용될 수 있습니다. 예를 들어, [Next.js](https://nextjs.org) 애플리케이션의 API 백엔드로 Laravel을 사용할 수 있습니다. 이 맥락에서, Laravel을 사용하여 애플리케이션에 [인증](/docs/{{version}}/sanctum) 및 데이터 저장/검색을 제공하면서, 큐, 이메일, 알림 등 Laravel의 강력한 서비스를 활용할 수 있습니다.

이 방식으로 Laravel을 사용할 계획이라면, [라우팅](/docs/{{version}}/routing), [Laravel Sanctum](/docs/{{version}}/sanctum), [Eloquent ORM](/docs/{{version}}/eloquent)에 대한 문서를 확인해 보세요.

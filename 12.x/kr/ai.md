# AI 지원 개발

 - [소개](#introduction)
     - [왜 Laravel로 AI 개발을 해야 하는가?](#why-laravel-for-ai-development)
 - [Laravel Boost](#laravel-boost)
     - [설치](#installation)
     - [사용 가능한 도구](#available-tools)
     - [AI 가이드라인](#ai-guidelines)
     - [에이전트 스킬](#agent-skills)
     - [문서 검색](#documentation-search)
     - [에이전트 통합](#agent-integration)

<a name="introduction"></a>
## 소개

Laravel은 AI 지원 및 에이전트 기반 개발을 위한 최고의 프레임워크가 될 수 있는 독보적인 위치에 있습니다. [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [OpenCode](https://opencode.ai), [Cursor](https://cursor.com), [GitHub Copilot](https://github.com/features/copilot)와 같은 AI 코딩 에이전트의 등장은 개발자들이 코드를 작성하는 방식을 완전히 바꿔놓았습니다. 이러한 도구들은 전체 기능을 생성하고, 복잡한 문제를 디버깅하며, 전례 없는 속도로 코드를 리팩터링할 수 있지만, 그 효과는 코드베이스를 얼마나 잘 이해하느냐에 크게 좌우됩니다.

<a name="why-laravel-for-ai-development"></a>
### 왜 Laravel로 AI 개발을 해야 하는가?

Laravel의 명확한 컨벤션과 잘 정의된 구조는 AI 지원 개발에 이상적인 프레임워크를 만듭니다. AI 에이전트에게 컨트롤러를 추가하라고 요청하면, 어디에 배치해야 하는지 정확히 알 수 있습니다. 새로운 마이그레이션이 필요할 때, 네이밍 컨벤션과 파일 위치가 예측 가능합니다. 이러한 일관성은 유연한 프레임워크에서 AI 도구를 자주 혼란스럽게 하는 추측을 제거합니다.

파일 구성 외에도, Laravel의 표현력 있는 문법과 포괄적인 문서는 AI 에이전트가 정확하고 관용적인 코드를 생성하는 데 필요한 컨텍스트를 제공합니다. Eloquent 관계, 폼 리퀘스트, 미들웨어와 같은 기능들은 에이전트가 안정적으로 이해하고 재현할 수 있는 패턴을 따릅니다. 그 결과, AI가 생성한 코드는 일반적인 PHP 조각을 이어붙인 것이 아니라 숙련된 Laravel 개발자가 작성한 것처럼 보입니다.

<a name="laravel-boost"></a>
## Laravel Boost

[Laravel Boost](https://github.com/laravel/boost)는 AI 코딩 에이전트와 여러분의 Laravel 애플리케이션 사이의 간극을 메워줍니다. Boost는 15개 이상의 전문 도구를 갖춘 MCP(Model Context Protocol) 서버로, AI 에이전트에게 애플리케이션의 구조, 데이터베이스, 라우트 등에 대한 깊은 통찰력을 제공합니다. Boost를 설치하면, AI 에이전트는 범용 코드 어시스턴트에서 여러분의 특정 애플리케이션을 이해하는 Laravel 전문가로 변모합니다.

Boost는 세 가지 주요 기능을 제공합니다: 애플리케이션을 검사하고 상호작용하기 위한 MCP 도구 모음, Laravel 생태계에 특화되어 작성된 조합 가능한 AI 가이드라인, 그리고 17,000개 이상의 Laravel 전용 지식을 포함하는 강력한 문서 API입니다.

<a name="installation"></a>
### 설치

Boost는 PHP 8.1 이상을 실행하는 Laravel 10, 11, 12 애플리케이션에 설치할 수 있습니다. 시작하려면 Boost를 개발 의존성으로 설치하세요:

```shell
composer require laravel/boost --dev
```

설치가 완료되면 인터랙티브 인스톨러를 실행하세요:

```shell
php artisan boost:install
```

인스톨러는 여러분의 IDE와 AI 에이전트를 자동 감지하여, 프로젝트에 적합한 통합을 선택할 수 있게 합니다. Boost는 MCP 호환 에디터용 `.mcp.json`과 AI 컨텍스트용 가이드라인 파일 등 필요한 설정 파일을 생성합니다.

> [!NOTE]
> `.mcp.json`, `CLAUDE.md`, `boost.json`과 같은 생성된 설정 파일은 각 개발자가 자체 환경을 구성하길 원하는 경우 `.gitignore`에 안전하게 추가할 수 있습니다.

<a name="available-tools"></a>
### 사용 가능한 도구

Boost는 Model Context Protocol을 통해 AI 에이전트에게 포괄적인 도구 세트를 제공합니다. 이러한 도구를 통해 에이전트는 여러분의 Laravel 애플리케이션을 깊이 이해하고 상호작용할 수 있습니다:

<div class="content-list" markdown="1">

- **애플리케이션 검사** - PHP 및 Laravel 버전 조회, 설치된 패키지 목록, 애플리케이션의 설정 및 환경 변수 검사.
- **데이터베이스 도구** - 대화를 떠나지 않고 데이터베이스 스키마 검사, 읽기 전용 쿼리 실행, 데이터 구조 파악.
- **라우트 검사** - 미들웨어, 컨트롤러, 파라미터와 함께 등록된 모든 라우트 목록 조회.
- **Artisan 명령어** - 사용 가능한 Artisan 명령어와 인수를 확인하여, 에이전트가 작업에 적합한 명령어를 제안하고 실행할 수 있도록 합니다.
- **로그 분석** - 문제 디버깅을 돕기 위해 애플리케이션의 로그 파일을 읽고 분석.
- **브라우저 로그** - Laravel의 프론트엔드 도구로 개발할 때 브라우저 콘솔 로그와 오류에 접근.
- **Tinker 통합** - Laravel Tinker를 통해 애플리케이션 컨텍스트에서 PHP 코드를 실행하여, 에이전트가 가설을 테스트하고 동작을 검증할 수 있도록 합니다.
- **문서 검색** - 설치된 패키지 버전에 맞춰 Laravel 생태계 문서를 검색.

</div>

<a name="ai-guidelines"></a>
### AI 가이드라인

Boost는 Laravel 생태계에 특화된 포괄적인 AI 가이드라인 세트를 포함합니다. 이러한 가이드라인은 AI 에이전트가 관용적인 Laravel 코드를 작성하고, 프레임워크 컨벤션을 따르며, 일반적인 실수를 피하도록 교육합니다. 가이드라인은 조합 가능하고 버전을 인식하므로, 에이전트는 여러분의 정확한 패키지 버전에 적합한 지침을 받습니다.

가이드라인은 Laravel 자체와 Laravel 생태계의 16개 이상의 패키지에 대해 제공되며, 다음을 포함합니다:

<div class="content-list" markdown="1">

- Livewire (2.x, 3.x, 4.x)
- Inertia.js (React, Svelte 및 Vue 변형)
- Tailwind CSS (3.x 및 4.x)
- Filament (3.x 및 4.x)
- PHPUnit
- Pest PHP
- Laravel Pint
- 그 외 다수

</div>

`boost:install`을 실행하면, Boost는 애플리케이션이 사용하는 패키지를 자동으로 감지하고 관련 가이드라인을 프로젝트의 AI 컨텍스트 파일에 조합합니다.

<a name="agent-skills"></a>
### 에이전트 스킬

[에이전트 스킬](https://agentskills.io/home)은 에이전트가 특정 도메인에서 작업할 때 필요에 따라 활성화할 수 있는 가벼운 타겟 지식 모듈입니다. 미리 로드되는 가이드라인과 달리, 스킬은 관련 있을 때만 상세한 패턴과 모범 사례를 로드하여 컨텍스트 비대화를 줄이고 AI 생성 코드의 관련성을 향상시킵니다.

스킬은 Livewire, Inertia, Tailwind CSS, Pest 등 인기 있는 Laravel 패키지에 대해 제공됩니다. `boost:install`을 실행하고 스킬을 기능으로 선택하면, `composer.json`에서 감지된 패키지를 기반으로 스킬이 자동 설치됩니다.

<a name="documentation-search"></a>
### 문서 검색

Boost는 AI 에이전트에게 17,000개 이상의 Laravel 생태계 문서에 대한 접근을 제공하는 강력한 문서 API를 포함합니다. 일반적인 웹 검색과 달리, 이 문서는 여러분의 정확한 패키지 버전에 맞춰 인덱싱, 벡터화 및 필터링됩니다.

에이전트가 기능의 작동 방식을 이해해야 할 때, Boost의 문서 API를 검색하여 정확하고 버전별 정보를 받을 수 있습니다. 이를 통해 AI 에이전트가 더 이상 사용되지 않는 메서드나 이전 프레임워크 버전의 문법을 제안하는 일반적인 문제를 해결합니다.

<a name="agent-integration"></a>
### 에이전트 통합

Boost는 Model Context Protocol을 지원하는 인기 있는 IDE와 AI 도구와 통합됩니다. Cursor, Claude Code, Codex, Gemini CLI, GitHub Copilot, Junie에 대한 자세한 설정 안내는 Boost 문서의 [에이전트 설정](/docs/{{version}}/boost#set-up-your-agents) 섹션을 참조하세요.

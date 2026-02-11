# 라라벨 Boost

- [소개](#introduction)
- [설치](#installation)
    - [Boost 리소스 최신 상태 유지](#keeping-boost-resources-updated)
    - [에이전트 설정](#set-up-your-agents)
- [MCP 서버](#mcp-server)
    - [사용 가능한 MCP 도구](#available-mcp-tools)
    - [MCP 서버 수동 등록](#manually-registering-the-mcp-server)
- [AI 가이드라인](#ai-guidelines)
    - [사용 가능한 AI 가이드라인](#available-ai-guidelines)
    - [커스텀 AI 가이드라인 추가](#adding-custom-ai-guidelines)
    - [Boost AI 가이드라인 오버라이드](#overriding-boost-ai-guidelines)
    - [서드파티 패키지 AI 가이드라인](#third-party-package-ai-guidelines)
- [에이전트 스킬](#agent-skills)
    - [사용 가능한 스킬](#available-skills)
    - [커스텀 스킬](#custom-skills)
    - [스킬 오버라이드](#overriding-skills)
    - [서드파티 패키지 스킬](#third-party-package-skills)
- [가이드라인 vs. 스킬](#guidelines-vs-skills)
- [문서 API](#documentation-api)
- [Boost 확장](#extending-boost)
    - [다른 IDE / AI 에이전트 지원 추가](#adding-support-for-other-ides-ai-agents)

<a name="introduction"></a>
## 소개

Laravel Boost는 AI 에이전트가 라라벨 모범 사례를 준수하는 고품질 라라벨 애플리케이션을 작성하는 데 필요한 필수 가이드라인과 에이전트 스킬을 제공하여 AI 지원 개발을 가속화합니다.

Boost는 또한 내장 MCP 도구와 17,000개 이상의 라라벨 관련 정보를 포함하는 광범위한 지식 베이스를 결합한 강력한 라라벨 에코시스템 문서 API를 제공하며, 정확하고 컨텍스트를 인식하는 결과를 위해 임베딩(Embeddings)을 사용한 시맨틱 검색 기능으로 향상되었습니다. Boost는 Claude Code 및 Cursor와 같은 AI 에이전트에게 이 API를 사용하여 최신 라라벨 기능과 모범 사례를 학습하도록 지시합니다.

<a name="installation"></a>
## 설치

Laravel Boost는 Composer를 통해 설치할 수 있습니다.

```shell
composer require laravel/boost --dev
```

다음으로, MCP 서버와 코딩 가이드라인을 설치합니다.

```shell
php artisan boost:install
```

`boost:install` 명령은 설치 과정에서 선택한 코딩 에이전트에 맞는 관련 에이전트 가이드라인 및 스킬 파일을 생성합니다.

Laravel Boost가 설치되면 Cursor, Claude Code 또는 여러분이 선택한 AI 에이전트로 코딩을 시작할 준비가 된 것입니다.

> [!NOTE]
> 생성된 MCP 설정 파일(`.mcp.json`), 가이드라인 파일(`CLAUDE.md`, `AGENTS.md`, `junie/` 등), 그리고 `boost.json` 설정 파일을 애플리케이션의 `.gitignore`에 추가해도 됩니다. 이 파일들은 `boost:install` 및 `boost:update` 실행 시 자동으로 재생성됩니다.

<a name="set-up-your-agents"></a>
### 에이전트 설정

```text tab=Cursor
1. 커맨드 팔레트를 엽니다 (`Cmd+Shift+P` 또는 `Ctrl+Shift+P`)
2. "/open MCP Settings"에서 `enter`를 누릅니다
3. `laravel-boost`의 토글을 켭니다
```

```text tab=Claude Code
Claude Code 지원은 일반적으로 자동으로 활성화됩니다. 활성화되지 않은 경우, 프로젝트 디렉토리에서 셸을 열고 다음 명령을 실행하세요:

claude mcp add -s local -t stdio laravel-boost php artisan boost:mcp
```

```text tab=Codex
Codex 지원은 일반적으로 자동으로 활성화됩니다. 활성화되지 않은 경우, 프로젝트 디렉토리에서 셸을 열고 다음 명령을 실행하세요:

codex mcp add laravel-boost -- php "artisan" "boost:mcp"
```

```text tab=Gemini CLI
Gemini CLI 지원은 일반적으로 자동으로 활성화됩니다. 활성화되지 않은 경우, 프로젝트 디렉토리에서 셸을 열고 다음 명령을 실행하세요:

gemini mcp add -s project -t stdio laravel-boost php artisan boost:mcp
```

```text tab=GitHub Copilot (VS Code)
1. 커맨드 팔레트를 엽니다 (`Cmd+Shift+P` 또는 `Ctrl+Shift+P`)
2. "MCP: List Servers"에서 `enter`를 누릅니다
3. 화살표 키로 `laravel-boost`를 선택하고 `enter`를 누릅니다
4. "Start server"를 선택합니다
```

```text tab=Junie
1. `shift`를 두 번 눌러 커맨드 팔레트를 엽니다
2. "MCP Settings"를 검색하고 `enter`를 누릅니다
3. `laravel-boost` 옆의 체크박스를 선택합니다
4. 오른쪽 하단의 "Apply"를 클릭합니다
```

<a name="keeping-boost-resources-updated"></a>
### Boost 리소스 최신 상태 유지

설치된 라라벨 에코시스템 패키지의 최신 버전을 반영하도록 로컬 Boost 리소스(AI 가이드라인 및 스킬)를 주기적으로 업데이트하는 것이 좋습니다. 이를 위해 `boost:update` Artisan 명령을 사용할 수 있습니다.

```shell
php artisan boost:update
```

Composer의 "post-update-cmd" 스크립트에 추가하여 이 과정을 자동화할 수도 있습니다.

```json
{
  "scripts": {
    "post-update-cmd": [
      "@php artisan boost:update --ansi"
    ]
  }
}
```

<a name="mcp-server"></a>
## MCP 서버

Laravel Boost는 AI 에이전트가 여러분의 라라벨 애플리케이션과 상호작용할 수 있는 도구를 노출하는 MCP(Model Context Protocol) 서버를 제공합니다. 이 도구들은 에이전트에게 애플리케이션의 구조를 검사하고, 데이터베이스를 쿼리하고, 코드를 실행하는 등의 기능을 제공합니다.

<a name="available-mcp-tools"></a>
### 사용 가능한 MCP 도구

| 이름                       | 설명                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Application Info           | PHP 및 라라벨 버전, 데이터베이스 엔진, 버전이 포함된 에코시스템 패키지 목록, Eloquent 모델을 읽습니다 |
| Browser Logs               | 브라우저에서 로그와 오류를 읽습니다                                                                       |
| Database Connections       | 기본 연결을 포함한 사용 가능한 데이터베이스 연결을 검사합니다                                    |
| Database Query             | 데이터베이스에 대해 쿼리를 실행합니다                                                                        |
| Database Schema            | 데이터베이스 스키마를 읽습니다                                                                                    |
| Get Absolute URL           | 에이전트가 유효한 URL을 생성할 수 있도록 상대 경로 URI를 절대 경로로 변환합니다                                        |
| Get Config                 | "점(dot)" 표기법을 사용하여 설정 파일에서 값을 가져옵니다                                               |
| Last Error                 | 애플리케이션의 로그 파일에서 마지막 오류를 읽습니다                                                        |
| List Artisan Commands      | 사용 가능한 Artisan 명령을 검사합니다                                                                      |
| List Available Config Keys | 사용 가능한 설정 키를 검사합니다                                                                    |
| List Available Env Vars    | 사용 가능한 환경 변수 키를 검사합니다                                                             |
| List Routes                | 애플리케이션의 라우트를 검사합니다                                                            |
| Read Log Entries           | 마지막 N개의 로그 항목을 읽습니다                                                                 |
| Search Docs                | 설치된 패키지를 기반으로 문서를 검색하기 위해 라라벨 호스팅 문서 API 서비스를 쿼리합니다    |
| Tinker                     | 애플리케이션의 컨텍스트 내에서 임의의 코드를 실행합니다                                                |

<a name="manually-registering-the-mcp-server"></a>
### MCP 서버 수동 등록

경우에 따라 Laravel Boost MCP 서버를 여러분이 선택한 에디터에 수동으로 등록해야 할 수 있습니다. 다음 정보를 사용하여 MCP 서버를 등록해야 합니다.

<table>
<tr><td><strong>Command</strong></td><td><code>php</code></td></tr>
<tr><td><strong>Args</strong></td><td><code>artisan boost:mcp</code></td></tr>
</table>

JSON 예시:

```json
{
    "mcpServers": {
        "laravel-boost": {
            "command": "php",
            "args": ["artisan", "boost:mcp"]
        }
    }
}
```

<a name="ai-guidelines"></a>
## AI 가이드라인

AI 가이드라인(AI Guidelines)은 라라벨 에코시스템 패키지에 대한 필수 컨텍스트를 AI 에이전트에게 제공하기 위해 사전에 로드되는 조합 가능한 지침 파일입니다. 이 가이드라인에는 에이전트가 일관되고 고품질의 코드를 생성하는 데 도움이 되는 핵심 컨벤션, 모범 사례 및 프레임워크별 패턴이 포함되어 있습니다.

<a name="available-ai-guidelines"></a>
### 사용 가능한 AI 가이드라인

Laravel Boost는 다음 패키지와 프레임워크에 대한 AI 가이드라인을 포함합니다. `core` 가이드라인은 모든 버전에 적용 가능한 해당 패키지에 대한 일반적이고 범용적인 조언을 AI에 제공합니다.

| 패키지           | 지원 버전     |
| ----------------- | ---------------------- |
| Core & Boost      | core                   |
| Laravel Framework | core, 10.x, 11.x, 12.x |
| Livewire          | core, 2.x, 3.x, 4.x    |
| Flux UI           | core, free, pro        |
| Folio             | core                   |
| Herd              | core                   |
| Inertia Laravel   | core, 1.x, 2.x         |
| Inertia React     | core, 1.x, 2.x         |
| Inertia Vue       | core, 1.x, 2.x         |
| Inertia Svelte    | core, 1.x, 2.x         |
| MCP               | core                   |
| Pennant           | core                   |
| Pest              | core, 3.x, 4.x         |
| PHPUnit           | core                   |
| Pint              | core                   |
| Sail              | core                   |
| Tailwind CSS      | core, 3.x, 4.x         |
| Livewire Volt     | core                   |
| Wayfinder         | core                   |
| Enforce Tests     | conditional            |

> **Note:** AI 가이드라인을 최신 상태로 유지하려면 [Boost 리소스 최신 상태 유지](#keeping-boost-resources-updated) 섹션을 참고하세요.

<a name="adding-custom-ai-guidelines"></a>
### 커스텀 AI 가이드라인 추가

Laravel Boost에 여러분만의 커스텀 AI 가이드라인을 추가하려면 애플리케이션의 `.ai/guidelines/*` 디렉토리에 `.blade.php` 또는 `.md` 파일을 추가하세요. 이 파일들은 `boost:install`을 실행할 때 Laravel Boost의 가이드라인과 함께 자동으로 포함됩니다.

<a name="overriding-boost-ai-guidelines"></a>
### Boost AI 가이드라인 오버라이드

일치하는 파일 경로로 여러분만의 커스텀 가이드라인을 생성하여 Boost의 내장 AI 가이드라인을 오버라이드할 수 있습니다. 기존 Boost 가이드라인 경로와 일치하는 커스텀 가이드라인을 생성하면 Boost는 내장 가이드라인 대신 여러분의 커스텀 버전을 사용합니다.

예를 들어, Boost의 "Inertia React v2 Form Guidance" 가이드라인을 오버라이드하려면 `.ai/guidelines/inertia-react/2/forms.blade.php`에 파일을 생성하세요. `boost:install`을 실행하면 Boost는 기본 가이드라인 대신 여러분의 커스텀 가이드라인을 포함합니다.

<a name="third-party-package-ai-guidelines"></a>
### 서드파티 패키지 AI 가이드라인

서드파티 패키지를 관리하고 있으며 Boost에 해당 패키지의 AI 가이드라인을 포함하고 싶다면, 패키지에 `resources/boost/guidelines/core.blade.php` 파일을 추가하면 됩니다. 패키지 사용자가 `php artisan boost:install`을 실행하면 Boost가 자동으로 여러분의 가이드라인을 로드합니다.

AI 가이드라인은 패키지가 무엇을 하는지에 대한 간단한 개요를 제공하고, 필요한 파일 구조나 규칙을 설명하며, 주요 기능을 생성하거나 사용하는 방법을 설명해야 합니다(예시 명령이나 코드 스니펫 포함). AI가 사용자를 위해 올바른 코드를 생성할 수 있도록 간결하고, 실행 가능하며, 모범 사례에 초점을 맞추세요. 다음은 예시입니다.

```php
## Package Name

This package provides [brief description of functionality].

### Features

- Feature 1: [clear & short description].
- Feature 2: [clear & short description]. Example usage:

@verbatim
<code-snippet name="How to use Feature 2" lang="php">
$result = PackageName::featureTwo($param1, $param2);
</code-snippet>
@endverbatim
```

<a name="agent-skills"></a>
## 에이전트 스킬

[에이전트 스킬(Agent Skills)](https://agentskills.io/home)은 에이전트가 특정 도메인에서 작업할 때 필요에 따라 활성화할 수 있는 가볍고 집중된 지식 모듈입니다. 사전에 로드되는 가이드라인과 달리, 스킬은 관련성이 있을 때만 상세한 패턴과 모범 사례를 로드하여 컨텍스트 비대화를 줄이고 AI 생성 코드의 관련성을 향상시킵니다.

`boost:install`을 실행하고 기능으로 스킬을 선택하면, `composer.json`에서 감지된 패키지를 기반으로 스킬이 자동으로 설치됩니다. 예를 들어, 프로젝트에 `livewire/livewire`가 포함되어 있으면 `livewire-development` 스킬이 자동으로 설치됩니다.

<a name="available-skills"></a>
### 사용 가능한 스킬

| 스킬                      | 패키지        |
| -------------------------- | -------------- |
| fluxui-development         | Flux UI        |
| folio-routing              | Folio          |
| inertia-react-development  | Inertia React  |
| inertia-svelte-development | Inertia Svelte |
| inertia-vue-development    | Inertia Vue    |
| livewire-development       | Livewire       |
| mcp-development            | MCP            |
| pennant-development        | Pennant        |
| pest-testing               | Pest           |
| tailwindcss-development    | Tailwind CSS   |
| volt-development           | Volt           |
| wayfinder-development      | Wayfinder      |

> **Note:** 스킬을 최신 상태로 유지하려면 [Boost 리소스 최신 상태 유지](#keeping-boost-resources-updated) 섹션을 참고하세요.

<a name="custom-skills"></a>
### 커스텀 스킬

여러분만의 커스텀 스킬을 생성하려면 애플리케이션의 `.ai/skills/{skill-name}/` 디렉토리에 `SKILL.md` 파일을 추가하세요. `boost:update`를 실행하면 여러분의 커스텀 스킬이 Boost의 내장 스킬과 함께 설치됩니다.

예를 들어, 애플리케이션의 도메인 로직을 위한 커스텀 스킬을 생성하려면 다음과 같이 합니다.

```
.ai/skills/creating-invoices/SKILL.md
```

<a name="overriding-skills"></a>
### 스킬 오버라이드

일치하는 이름으로 여러분만의 커스텀 스킬을 생성하여 Boost의 내장 스킬을 오버라이드할 수 있습니다. 기존 Boost 스킬 이름과 일치하는 커스텀 스킬을 생성하면 Boost는 내장 스킬 대신 여러분의 커스텀 버전을 사용합니다.

예를 들어, Boost의 `livewire-development` 스킬을 오버라이드하려면 `.ai/skills/livewire-development/SKILL.md`에 파일을 생성하세요. `boost:update`를 실행하면 Boost는 기본 스킬 대신 여러분의 커스텀 스킬을 포함합니다.

<a name="third-party-package-skills"></a>
### 서드파티 패키지 스킬

서드파티 패키지를 관리하고 있으며 Boost에 해당 패키지의 스킬을 포함하고 싶다면, 패키지에 `resources/boost/skills/{skill-name}/SKILL.md` 파일을 추가하면 됩니다. 패키지 사용자가 `php artisan boost:install`을 실행하면 Boost가 사용자 선호도에 따라 자동으로 여러분의 스킬을 설치합니다.

Boost 스킬은 [에이전트 스킬 포맷(Agent Skills format)](https://agentskills.io/what-are-skills)을 지원하며, YAML 프론트매터(frontmatter)와 마크다운(Markdown) 지침이 포함된 `SKILL.md` 파일이 있는 폴더로 구성되어야 합니다. `SKILL.md` 파일에는 필수 프론트매터(`name` 및 `description`)가 포함되어야 하며, 선택적으로 스크립트, 템플릿 및 참고 자료를 포함할 수 있습니다.

스킬은 필요한 파일 구조나 규칙을 설명하고, 주요 기능을 생성하거나 사용하는 방법을 설명해야 합니다(예시 명령이나 코드 스니펫 포함). AI가 사용자를 위해 올바른 코드를 생성할 수 있도록 간결하고, 실행 가능하며, 모범 사례에 초점을 맞추세요.

```markdown
---
name: package-name-development
description: Build and work with PackageName features, including components and workflows.
---

# Package Name Development

## When to use this skill
Use this skill when working with PackageName features...

## Features

- Feature 1: [clear & short description].
- Feature 2: [clear & short description]. Example usage:

$result = PackageName::featureTwo($param1, $param2);
```

<a name="guidelines-vs-skills"></a>
## 가이드라인 vs. 스킬

Laravel Boost는 AI 에이전트에게 애플리케이션에 대한 컨텍스트를 제공하는 두 가지 별개의 방법인 **가이드라인(Guidelines)**과 **스킬(Skills)**을 제공합니다.

**가이드라인**은 AI 에이전트가 시작될 때 사전에 로드되어 코드베이스 전반에 광범위하게 적용되는 라라벨 컨벤션과 모범 사례에 대한 필수 컨텍스트를 제공합니다.

**스킬**은 특정 작업을 수행할 때 필요에 따라 활성화되며, 특정 도메인(예: Livewire 컴포넌트 또는 Pest 테스트)에 대한 상세한 패턴을 포함합니다. 관련성이 있을 때만 스킬을 로드하면 컨텍스트 비대화를 줄이고 코드 품질을 향상시킵니다.

| 측면      | 가이드라인                        | 스킬                           |
| ----------- | --------------------------------- | -------------------------------- |
| **로드 시점**  | 사전에, 항상 존재           | 필요 시, 관련될 때         |
| **범위**   | 넓고, 기반이 되는               | 집중적이고, 작업 특화           |
| **목적** | 핵심 컨벤션 및 모범 사례 | 상세한 구현 패턴 |

<a name="documentation-api"></a>
## 문서 API

Laravel Boost에는 AI 에이전트가 17,000개 이상의 라라벨 관련 정보를 포함하는 광범위한 지식 베이스에 접근할 수 있도록 하는 문서 API(Documentation API)가 포함되어 있습니다. 이 API는 임베딩을 사용한 시맨틱 검색을 통해 정확하고 컨텍스트를 인식하는 결과를 제공합니다.

`Search Docs` MCP 도구를 사용하면 에이전트가 설치된 패키지를 기반으로 문서를 검색하기 위해 라라벨 호스팅 문서 API 서비스를 쿼리할 수 있습니다. Boost의 AI 가이드라인과 스킬은 여러분의 코딩 에이전트에게 이 API를 사용하도록 자동으로 지시합니다.

| 패키지           | 지원 버전 |
| ----------------- | ------------------ |
| Laravel Framework | 10.x, 11.x, 12.x   |
| Filament          | 2.x, 3.x, 4.x, 5.x |
| Flux UI           | 2.x Free, 2.x Pro  |
| Inertia           | 1.x, 2.x           |
| Livewire          | 1.x, 2.x, 3.x, 4.x |
| Nova              | 4.x, 5.x           |
| Pest              | 3.x, 4.x           |
| Tailwind CSS      | 3.x, 4.x           |

<a name="extending-boost"></a>
## Boost 확장

Boost는 많은 인기 있는 IDE와 AI 에이전트를 기본적으로 지원합니다. 여러분의 코딩 도구가 아직 지원되지 않는 경우 자체 에이전트를 생성하고 Boost와 통합할 수 있습니다.

<a name="adding-support-for-other-ides-ai-agents"></a>
### 다른 IDE / AI 에이전트 지원 추가

새로운 IDE 또는 AI 에이전트에 대한 지원을 추가하려면 `Laravel\Boost\Install\Agents\Agent`를 확장하는 클래스를 생성하고 필요에 따라 다음 계약(Contracts) 중 하나 이상을 구현하세요.

- `Laravel\Boost\Contracts\SupportsGuidelines` - AI 가이드라인 지원을 추가합니다.
- `Laravel\Boost\Contracts\SupportsMcp` - MCP 지원을 추가합니다.
- `Laravel\Boost\Contracts\SupportsSkills` - 에이전트 스킬 지원을 추가합니다.

<a name="writing-the-agent"></a>
#### 에이전트 작성

```php
<?php

declare(strict_types=1);

namespace App;

use Laravel\Boost\Contracts\SupportsGuidelines;
use Laravel\Boost\Contracts\SupportsMcp;
use Laravel\Boost\Contracts\SupportsSkills;
use Laravel\Boost\Install\Agents\Agent;

class CustomAgent extends Agent implements SupportsGuidelines, SupportsMcp, SupportsSkills
{
    // 여러분의 구현...
}
```

구현 예시는 [ClaudeCode.php](https://github.com/laravel/boost/blob/main/src/Install/Agents/ClaudeCode.php)를 참고하세요.

<a name="registering-the-agent"></a>
#### 에이전트 등록

애플리케이션의 `App\Providers\AppServiceProvider`의 `boot` 메소드에서 커스텀 에이전트를 등록하세요.

```php
use Laravel\Boost\Boost;

public function boot(): void
{
    Boost::registerAgent('customagent', CustomAgent::class);
}
```

등록이 완료되면 `php artisan boost:install`을 실행할 때 여러분의 에이전트를 선택할 수 있습니다.

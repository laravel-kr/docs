# 릴리스 노트(Release Notes)

- [버전 관리 체계](#versioning-scheme)
- [지원 정책](#support-policy)
- [Laravel 12](#laravel-12)

<a name="versioning-scheme"></a>
## 버전 관리 체계(Versioning Scheme)

Laravel과 그 외 공식 패키지들은 [시맨틱 버저닝(Semantic Versioning)](https://semver.org)을 따릅니다. 메이저 프레임워크 릴리스는 매년(~1분기) 출시되며, 마이너 및 패치 릴리스는 매주 출시될 수 있습니다. 마이너 및 패치 릴리스에는 **절대로** 하위 호환성을 깨는 변경사항이 포함되어서는 안 됩니다.

애플리케이션이나 패키지에서 Laravel 프레임워크 또는 그 컴포넌트를 참조할 때는 Laravel의 메이저 릴리스에 하위 호환성을 깨는 변경사항이 포함될 수 있으므로 항상 `^12.0`과 같은 버전 제약 조건을 사용해야 합니다. 그러나 저희는 항상 하루 이내에 새로운 메이저 릴리스로 업그레이드할 수 있도록 노력하고 있습니다.

<a name="named-arguments"></a>
#### 명명된 인수(Named Arguments)

[명명된 인수](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)는 Laravel의 하위 호환성 가이드라인에 포함되지 않습니다. Laravel 코드베이스를 개선하기 위해 필요한 경우 함수 인수의 이름을 변경할 수 있습니다. 따라서 Laravel 메서드를 호출할 때 명명된 인수를 사용하는 것은 매개변수 이름이 향후 변경될 수 있다는 점을 이해하고 신중하게 수행해야 합니다.

<a name="support-policy"></a>
## 지원 정책(Support Policy)

모든 Laravel 릴리스에 대해 버그 수정은 18개월 동안 제공되고 보안 수정은 2년 동안 제공됩니다. 모든 추가 라이브러리의 경우 최신 메이저 릴리스만 버그 수정을 받습니다. 또한 [Laravel이 지원하는](/docs/{{version}}/database#introduction) 데이터베이스 버전을 검토해 주세요.

<div class="overflow-auto">

| 버전 | PHP (*)   | 릴리스             | 버그 수정 지원 기간   | 보안 수정 지원 기간    |
| ----- |-----------| ------------------- | ------------------- | -------------------- |
| 10    | 8.1 - 8.3 | 2023년 2월 14일    | 2024년 8월 6일      | 2025년 2월 4일       |
| 11    | 8.2 - 8.4 | 2024년 3월 12일    | 2025년 9월 3일      | 2026년 3월 12일      |
| 12    | 8.2 - 8.5 | 2025년 2월 24일    | 2026년 8월 13일     | 2027년 2월 24일      |
| 13    | 8.3 - 8.5 | 2026년 Q1          | 2027년 Q3           | 2028년 Q1            |

</div>

<div class="version-colors">
    <div class="end-of-life">
        <div class="color-box"></div>
        <div>지원 종료</div>
    </div>
    <div class="security-fixes">
        <div class="color-box"></div>
        <div>보안 수정만 지원</div>
    </div>
</div>

(*) 지원되는 PHP 버전

<a name="laravel-12"></a>
## Laravel 12

Laravel 12는 Laravel 11.x에서 이루어진 개선 사항을 이어받아 업스트림 의존성을 업데이트하고 React, Vue, Livewire를 위한 새로운 스타터 킷(Starter Kit)을 도입했으며, 사용자 인증을 위해 [WorkOS AuthKit](https://authkit.com)을 사용하는 옵션도 포함되어 있습니다. 스타터 킷의 WorkOS 버전은 소셜 인증, 패스키(Passkey), SSO 지원을 제공합니다.

<a name="minimal-breaking-changes"></a>
### 최소한의 하위 호환성 변경(Minimal Breaking Changes)

이번 릴리스 사이클에서 저희의 주요 초점은 하위 호환성을 깨는 변경사항을 최소화하는 것이었습니다. 대신 기존 애플리케이션을 손상시키지 않으면서 일년 내내 지속적인 사용성 개선을 제공하는 데 집중했습니다.

따라서 Laravel 12 릴리스는 기존 의존성을 업그레이드하기 위한 비교적 작은 "유지보수 릴리스"입니다. 이러한 이유로 대부분의 Laravel 애플리케이션은 애플리케이션 코드를 변경하지 않고도 Laravel 12로 업그레이드할 수 있습니다.

<a name="new-application-starter-kits"></a>
### 새로운 애플리케이션 스타터 킷(New Application Starter Kits)

Laravel 12는 React, Vue, Livewire를 위한 새로운 [애플리케이션 스타터 킷](/docs/{{version}}/starter-kits)을 도입합니다. React와 Vue 스타터 킷은 Inertia 2, TypeScript, [shadcn/ui](https://ui.shadcn.com), Tailwind를 활용하며, Livewire 스타터 킷은 Tailwind 기반의 [Flux UI](https://fluxui.dev) 컴포넌트 라이브러리와 Laravel Volt를 활용합니다.

React, Vue, Livewire 스타터 킷은 모두 Laravel의 내장 인증 시스템을 활용하여 로그인, 회원가입, 비밀번호 재설정, 이메일 인증 등을 제공합니다. 또한 소셜 인증, 패스키, SSO 지원을 제공하는 [WorkOS AuthKit 기반](https://authkit.com) 버전의 각 스타터 킷도 도입하고 있습니다. WorkOS는 월간 활성 사용자 100만 명까지의 애플리케이션에 대해 무료 인증을 제공합니다.

새로운 애플리케이션 스타터 킷의 도입으로 Laravel Breeze와 Laravel Jetstream은 더 이상 추가 업데이트를 받지 않습니다.

새로운 스타터 킷을 시작하려면 [스타터 킷 문서](/docs/{{version}}/starter-kits)를 확인하세요.

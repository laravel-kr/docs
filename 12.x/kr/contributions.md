# 기여 가이드(Contribution Guide)

- [버그 리포트](#bug-reports)
- [지원 질문](#support-questions)
- [코어 개발 논의](#core-development-discussion)
- [어떤 브랜치를 사용해야 하나요?](#which-branch)
- [컴파일된 에셋](#compiled-assets)
- [AI 생성 기여](#ai-generated-contributions)
- [보안 취약점](#security-vulnerabilities)
- [코딩 스타일](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [행동 강령](#code-of-conduct)

<a name="bug-reports"></a>
## 버그 리포트(Bug Reports)

적극적인 협력을 장려하기 위해 Laravel은 단순한 버그 리포트가 아닌 풀 리퀘스트(Pull Request)를 강력히 권장합니다. 풀 리퀘스트는 "검토 준비 완료(ready for review)" 상태로 표시되고(즉, "draft" 상태가 아닌 경우) 새로운 기능에 대한 모든 테스트가 통과한 경우에만 검토됩니다. "draft" 상태로 남아 있는 비활성 풀 리퀘스트는 며칠 후 닫힙니다.

버그 리포트를 제출하는 경우, 이슈에는 제목과 문제에 대한 명확한 설명이 포함되어야 합니다. 또한 가능한 한 많은 관련 정보와 문제를 보여주는 코드 샘플을 포함해야 합니다. 버그 리포트의 목표는 자신과 다른 사람들이 버그를 쉽게 재현하고 수정할 수 있도록 하는 것입니다.

버그 리포트는 같은 문제를 가진 다른 사람들이 해결에 협력할 수 있기를 바라며 작성된다는 점을 기억하세요. 버그 리포트가 자동으로 활동을 유발하거나 다른 사람들이 즉시 수정에 나설 것이라고 기대하지 마세요. 버그 리포트를 작성하는 것은 자신과 다른 사람들이 문제 해결의 길을 시작하는 데 도움이 됩니다. 기여하고 싶다면 [이슈 트래커에 등록된 버그](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel)를 수정하여 도움을 줄 수 있습니다. Laravel의 모든 이슈를 보려면 GitHub에 인증되어야 합니다.

Laravel을 사용하는 동안 부적절한 DocBlock, PHPStan 또는 IDE 경고를 발견하면 GitHub 이슈를 생성하지 마세요. 대신 문제를 수정하는 풀 리퀘스트를 제출해 주세요.

Laravel 소스 코드는 GitHub에서 관리되며, 각 Laravel 프로젝트에 대한 저장소가 있습니다:

<div class="content-list" markdown="1">

- [Laravel Application](https://github.com/laravel/laravel)
- [Laravel Art](https://github.com/laravel/art)
- [Laravel Boost](https://github.com/laravel/boost)
- [Laravel Documentation](https://github.com/laravel/docs)
- [Laravel Dusk](https://github.com/laravel/dusk)
- [Laravel Cashier Stripe](https://github.com/laravel/cashier)
- [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle)
- [Laravel Echo](https://github.com/laravel/echo)
- [Laravel Envoy](https://github.com/laravel/envoy)
- [Laravel Folio](https://github.com/laravel/folio)
- [Laravel Framework](https://github.com/laravel/framework)
- [Laravel Horizon](https://github.com/laravel/horizon)
- [Laravel Passport](https://github.com/laravel/passport)
- [Laravel Pennant](https://github.com/laravel/pennant)
- [Laravel Pint](https://github.com/laravel/pint)
- [Laravel Prompts](https://github.com/laravel/prompts)
- [Laravel Reverb](https://github.com/laravel/reverb)
- [Laravel Sail](https://github.com/laravel/sail)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Laravel Livewire Starter Kit](https://github.com/laravel/livewire-starter-kit)
- [Laravel React Starter Kit](https://github.com/laravel/react-starter-kit)
- [Laravel Svelte Starter Kit](https://github.com/laravel/svelte-starter-kit)
- [Laravel Vue Starter Kit](https://github.com/laravel/vue-starter-kit)

</div>

<a name="support-questions"></a>
## 지원 질문(Support Questions)

Laravel의 GitHub 이슈 트래커는 Laravel 도움말이나 지원을 제공하기 위한 것이 아닙니다. 대신 다음 채널 중 하나를 사용하세요:

<div class="content-list" markdown="1">

- [GitHub Discussions](https://github.com/laravel/framework/discussions)
- [Laracasts Forums](https://laracasts.com/discuss)
- [Laravel.io Forums](https://laravel.io/forum)
- [StackOverflow](https://stackoverflow.com/questions/tagged/laravel)
- [Discord](https://discord.gg/laravel)
- [Larachat](https://larachat.co)
- [IRC](https://web.libera.chat/?nick=artisan&channels=#laravel)

</div>

<a name="core-development-discussion"></a>
## 코어 개발 논의(Core Development Discussion)

Laravel 프레임워크 저장소의 [GitHub 토론 게시판](https://github.com/laravel/framework/discussions)에서 새로운 기능이나 기존 Laravel 동작의 개선을 제안할 수 있습니다. 새로운 기능을 제안하는 경우, 기능을 완성하는 데 필요한 코드 중 최소한 일부를 구현할 의향이 있어야 합니다.

버그, 새로운 기능 및 기존 기능의 구현에 관한 비공식적인 논의는 [Laravel Discord 서버](https://discord.gg/laravel)의 `#internals` 채널에서 이루어집니다. Laravel의 메인테이너인 Taylor Otwell은 일반적으로 평일 오전 8시부터 오후 5시(UTC-06:00 또는 America/Chicago)까지 채널에 있으며, 그 외 시간에는 간헐적으로 참여합니다.

<a name="which-branch"></a>
## 어떤 브랜치를 사용해야 하나요?(Which Branch?)

**모든** 버그 수정은 버그 수정을 지원하는 최신 버전(현재 `12.x`)으로 보내야 합니다. 버그 수정은 다가오는 릴리스에만 존재하는 기능을 수정하는 경우가 아니라면 **절대로** `master` 브랜치로 보내서는 안 됩니다.

현재 릴리스와 **완전히 하위 호환되는** **마이너** 기능은 최신 안정 브랜치(현재 `12.x`)로 보낼 수 있습니다.

**메이저** 새 기능 또는 호환성을 깨는 변경사항이 있는 기능은 항상 다가오는 릴리스를 포함하는 `master` 브랜치로 보내야 합니다.

<a name="compiled-assets"></a>
## 컴파일된 에셋(Compiled Assets)

`laravel/laravel` 저장소의 `resources/css` 또는 `resources/js`에 있는 대부분의 파일과 같이 컴파일된 파일에 영향을 미치는 변경 사항을 제출하는 경우, 컴파일된 파일을 커밋하지 마세요. 파일 크기가 크기 때문에 메인테이너가 현실적으로 검토할 수 없습니다. 이것은 Laravel에 악성 코드를 주입하는 방법으로 악용될 수 있습니다. 이를 방어적으로 방지하기 위해 모든 컴파일된 파일은 Laravel 메인테이너가 생성하고 커밋합니다.

<a name="ai-generated-contributions"></a>
## AI 생성 기여

Laravel에 제출되는 모든 풀 리퀘스트에 감사드립니다. 그러나 사려 깊은 인간의 검토와 고려 없이 주로 AI가 생성한 기여는 허용되지 않습니다.

AI 도구를 사용하여 기여를 돕는 경우, 제출하기 전에 결과 코드를 철저히 검토하고, 테스트하고, 이해**해야** 합니다.

**전적으로 AI가 생성한 이슈나 풀 리퀘스트를 대량으로 여는 것은 용납되지 않습니다.** 이러한 풀 리퀘스트는 검토 없이 닫히며, 기여하는 사용자는 저장소에서 차단될 수 있습니다.

기여자들은 기존 코드베이스에 익숙해지고, 커뮤니티에 참여하며, 자신이 해결하려는 문제에 대한 이해와 신중한 고려를 반영하는 풀 리퀘스트를 제출할 것을 권장합니다.

<a name="security-vulnerabilities"></a>
## 보안 취약점(Security Vulnerabilities)

Laravel에서 보안 취약점을 발견한 경우, Taylor Otwell에게 <a href="mailto:taylor@laravel.com">taylor@laravel.com</a>으로 이메일을 보내주세요. 모든 보안 취약점은 즉시 처리됩니다.

<a name="coding-style"></a>
## 코딩 스타일(Coding Style)

Laravel은 [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) 코딩 표준과 [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) 오토로딩 표준을 따릅니다.

<a name="phpdoc"></a>
### PHPDoc

아래는 유효한 Laravel 문서 블록의 예시입니다. `@param` 속성 뒤에 두 개의 공백, 인자 타입, 두 개의 공백, 그리고 마지막으로 변수 이름이 오는 것에 주목하세요:

```php
/**
 * 컨테이너에 바인딩을 등록합니다.
 *
 * @param  string|array  $abstract
 * @param  \Closure|string|null  $concrete
 * @param  bool  $shared
 * @return void
 *
 * @throws \Exception
 */
public function bind($abstract, $concrete = null, $shared = false)
{
    // ...
}
```

네이티브 타입을 사용하여 `@param` 또는 `@return` 속성이 중복되는 경우, 제거할 수 있습니다:

```php
/**
 * 작업을 실행합니다.
 */
public function handle(AudioProcessor $processor): void
{
    // ...
}
```

그러나 네이티브 타입이 제네릭(Generic)인 경우, `@param` 또는 `@return` 속성을 사용하여 제네릭 타입을 지정해 주세요:

```php
/**
 * 메시지의 첨부 파일을 가져옵니다.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file'),
    ];
}
```

<a name="styleci"></a>
### StyleCI

코드 스타일이 완벽하지 않아도 걱정하지 마세요! [StyleCI](https://styleci.io/)가 풀 리퀘스트가 병합된 후 Laravel 저장소에 스타일 수정 사항을 자동으로 병합합니다. 이를 통해 코드 스타일이 아닌 기여의 내용에 집중할 수 있습니다.

<a name="code-of-conduct"></a>
## 행동 강령(Code of Conduct)

Laravel 행동 강령은 Ruby 행동 강령에서 파생되었습니다. 행동 강령 위반 사항은 Taylor Otwell(taylor@laravel.com)에게 보고할 수 있습니다:

<div class="content-list" markdown="1">

- 참가자는 반대 의견에 관용적이어야 합니다.
- 참가자는 자신의 언어와 행동에 인신공격이나 비하 발언이 없도록 해야 합니다.
- 다른 사람의 말과 행동을 해석할 때, 참가자는 항상 선의를 가정해야 합니다.
- 합리적으로 괴롭힘으로 간주될 수 있는 행동은 용납되지 않습니다.

</div>

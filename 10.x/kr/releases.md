# 릴리스 노트(Release Notes)

- [버전 관리 체계](#versioning-scheme)
- [지원 정책](#support-policy)
- [Laravel 10](#laravel-10)

<a name="versioning-scheme"></a>
## 버전 관리 체계(Versioning Scheme)

Laravel과 그 외 공식 패키지들은 [시맨틱 버저닝(Semantic Versioning)](https://semver.org)을 따릅니다. 메이저 프레임워크 릴리스는 매년(~1분기) 출시되며, 마이너 및 패치 릴리스는 매주 출시될 수 있습니다. 마이너 및 패치 릴리스에는 **절대로** 하위 호환성을 깨는 변경사항이 포함되어서는 안 됩니다.

애플리케이션이나 패키지에서 Laravel 프레임워크 또는 그 컴포넌트를 참조할 때는 Laravel의 메이저 릴리스에 하위 호환성을 깨는 변경사항이 포함될 수 있으므로 항상 `^10.0`과 같은 버전 제약 조건을 사용해야 합니다. 그러나 저희는 항상 하루 이내에 새로운 메이저 릴리스로 업그레이드할 수 있도록 노력하고 있습니다.

<a name="named-arguments"></a>
#### 명명된 인수(Named Arguments)

[명명된 인수](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)는 Laravel의 하위 호환성 가이드라인에 포함되지 않습니다. Laravel 코드베이스를 개선하기 위해 필요한 경우 함수 인수의 이름을 변경할 수 있습니다. 따라서 Laravel 메소드를 호출할 때 명명된 인수를 사용하는 것은 매개변수 이름이 향후 변경될 수 있다는 점을 이해하고 신중하게 수행해야 합니다.

<a name="support-policy"></a>
## 지원 정책(Support Policy)

모든 Laravel 릴리스에 대해 버그 수정은 18개월 동안 제공되고 보안 수정은 2년 동안 제공됩니다. Lumen을 포함한 모든 추가 라이브러리의 경우 최신 메이저 릴리스만 버그 수정을 받습니다. 또한 [Laravel이 지원하는](/docs/{{version}}/database#introduction) 데이터베이스 버전을 검토해 주세요.


<div class="overflow-auto">

| 버전 | PHP (*) | 릴리스 | 버그 수정 지원 기간 | 보안 수정 지원 기간 |
| --- | --- | --- | --- | --- |
| 8 | 7.3 - 8.1 | 2020년 9월 8일 | 2022년 7월 26일 | 2023년 1월 24일 |
| 9 | 8.0 - 8.2 | 2022년 2월 8일 | 2023년 8월 8일 | 2024년 2월 6일 |
| 10 | 8.1 - 8.3 | 2023년 2월 14일 | 2024년 8월 6일 | 2025년 2월 4일 |
| 11 | 8.2 - 8.4 | 2024년 3월 12일 | 2025년 9월 3일 | 2026년 3월 12일 |

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

<a name="laravel-10"></a>
## Laravel 10

아시다시피, Laravel은 Laravel 8의 릴리스와 함께 연간 릴리스로 전환했습니다. 이전에는 메이저 버전이 6개월마다 릴리스되었습니다. 이 전환은 커뮤니티의 유지보수 부담을 줄이고, 개발팀이 하위 호환성을 깨뜨리지 않으면서 놀랍고 강력한 새 기능을 제공할 수 있도록 도전하기 위한 것입니다. 따라서 하위 호환성을 유지하면서 Laravel 9에 다양한 강력한 기능을 제공했습니다.

따라서, 현재 릴리스에서 훌륭한 새 기능을 제공하겠다는 이 약속은 향후 "메이저" 릴리스가 주로 업스트림 의존성 업그레이드와 같은 "유지보수" 작업에 사용될 가능성이 높다는 것을 의미하며, 이는 이 릴리스 노트에서 확인할 수 있습니다.

Laravel 10은 애플리케이션 스켈레톤의 모든 메소드와 프레임워크 전반에서 클래스를 생성하는 데 사용되는 모든 스텁 파일에 인수 타입 및 반환 타입을 도입하여 Laravel 9.x에서의 개선 사항을 이어갑니다. 또한 외부 프로세스를 시작하고 상호작용하기 위한 새롭고 개발자 친화적인 추상화 레이어가 도입되었습니다. 더불어 애플리케이션의 "기능 플래그(feature flags)"를 관리하기 위한 훌륭한 접근 방식을 제공하는 Laravel Pennant가 도입되었습니다.

<a name="php-8"></a>
### PHP 8.1

Laravel 10.x는 최소 PHP 8.1 버전이 필요합니다.

<a name="types"></a>
### 타입(Types)

_애플리케이션 스켈레톤 및 스텁 타입 힌트는 [Nuno Maduro](https://github.com/nunomaduro)가 기여했습니다._

최초 릴리스 당시, Laravel은 당시 PHP에서 사용 가능한 모든 타입 힌팅 기능을 활용했습니다. 그러나 이후 몇 년간 추가적인 원시 타입 힌트, 반환 타입, 유니온 타입을 포함하여 많은 새로운 기능이 PHP에 추가되었습니다.

Laravel 10.x는 애플리케이션 스켈레톤과 프레임워크에서 사용하는 모든 스텁을 철저하게 업데이트하여 모든 메소드 시그니처에 인수 타입 및 반환 타입을 도입합니다. 또한 불필요한 "독블록(doc block)" 타입 힌트 정보가 삭제되었습니다.

이 변경은 기존 애플리케이션과 완전히 하위 호환됩니다. 따라서 이러한 타입 힌트가 없는 기존 애플리케이션도 정상적으로 계속 작동합니다.

<a name="laravel-pennant"></a>
### Laravel Pennant

_Laravel Pennant는 [Tim MacDonald](https://github.com/timacdonald)가 개발했습니다._

새로운 공식 패키지인 Laravel Pennant가 릴리스되었습니다. Laravel Pennant는 애플리케이션의 기능 플래그를 관리하기 위한 가볍고 간소화된 접근 방식을 제공합니다. 기본적으로 Pennant에는 인메모리 `array` 드라이버와 영구 기능 저장을 위한 `database` 드라이버가 포함되어 있습니다.

기능은 `Feature::define` 메소드를 통해 쉽게 정의할 수 있습니다.

```php
use Laravel\Pennant\Feature;
use Illuminate\Support\Lottery;

Feature::define('new-onboarding-flow', function () {
    return Lottery::odds(1, 10);
});
```

기능이 정의되면, 현재 사용자가 해당 기능에 접근할 수 있는지 쉽게 확인할 수 있습니다.

```php
if (Feature::active('new-onboarding-flow')) {
    // ...
}
```

물론 편의를 위해 Blade 지시어도 사용할 수 있습니다.

```blade
@feature('new-onboarding-flow')
    <div>
        <!-- ... -->
    </div>
@endfeature
```

Pennant는 더 많은 고급 기능과 API를 제공합니다. 자세한 내용은 [Pennant 전체 문서](/docs/{{version}}/pennant)를 참조하세요.

<a name="process"></a>
### 프로세스 상호작용(Process Interaction)

_프로세스 추상화 레이어는 [Nuno Maduro](https://github.com/nunomaduro)와 [Taylor Otwell](https://github.com/taylorotwell)이 기여했습니다._

Laravel 10.x는 새로운 `Process` 파사드를 통해 외부 프로세스를 시작하고 상호작용하기 위한 아름다운 추상화 레이어를 도입합니다.

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return $result->output();
```

프로세스를 풀(pool)에서 시작하여 동시 프로세스를 편리하게 실행하고 관리할 수도 있습니다.

```php
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Process;

[$first, $second, $third] = Process::concurrently(function (Pool $pool) {
    $pool->command('cat first.txt');
    $pool->command('cat second.txt');
    $pool->command('cat third.txt');
});

return $first->output();
```

또한 편리한 테스트를 위해 프로세스를 페이크(fake)할 수 있습니다.

```php
Process::fake();

// ...

Process::assertRan('ls -la');
```

프로세스와의 상호작용에 대한 자세한 내용은 [프로세스 전체 문서](/docs/{{version}}/processes)를 참조하세요.

<a name="test-profiling"></a>
### 테스트 프로파일링(Test Profiling)

_테스트 프로파일링은 [Nuno Maduro](https://github.com/nunomaduro)가 기여했습니다._

Artisan `test` 명령에 새로운 `--profile` 옵션이 추가되어 애플리케이션에서 가장 느린 테스트를 쉽게 식별할 수 있습니다.

```shell
php artisan test --profile
```

편의를 위해 가장 느린 테스트가 CLI 출력에 직접 표시됩니다.

<p align="center">
    <img width="100%" src="https://user-images.githubusercontent.com/5457236/217328439-d8d983ec-d0fc-4cde-93d9-ae5bccf5df14.png"/>
</p>

<a name="pest-scaffolding"></a>
### Pest 스캐폴딩(Pest Scaffolding)

새로운 Laravel 프로젝트는 이제 기본적으로 Pest 테스트 스캐폴딩으로 생성할 수 있습니다. 이 기능을 사용하려면 Laravel 인스톨러를 통해 새 애플리케이션을 생성할 때 `--pest` 플래그를 제공하세요.

```shell
laravel new example-application --pest
```

<a name="generator-cli-prompts"></a>
### 제너레이터 CLI 프롬프트(Generator CLI Prompts)

_제너레이터 CLI 프롬프트는 [Jess Archer](https://github.com/jessarcher)가 기여했습니다._

프레임워크의 개발자 경험을 개선하기 위해, Laravel의 모든 내장 `make` 명령은 더 이상 입력을 필요로 하지 않습니다. 입력 없이 명령을 호출하면 필요한 인수를 입력하라는 프롬프트가 표시됩니다.

```shell
php artisan make:controller
```

<a name="horizon-telescope-facelift"></a>
### Horizon / Telescope 디자인 개선(Horizon / Telescope Facelift)

[Horizon](/docs/{{version}}/horizon)과 [Telescope](/docs/{{version}}/telescope)가 개선된 타이포그래피, 간격 및 디자인으로 새롭고 현대적인 모습으로 업데이트되었습니다.

<img src="https://laravel.com/img/docs/horizon-example.png">

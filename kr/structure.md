# 디렉토리 구조(Directory Structure)

- [소개](#introduction)
- [루트 디렉토리](#the-root-directory)
    - [`app` 디렉토리](#the-root-app-directory)
    - [`bootstrap` 디렉토리](#the-bootstrap-directory)
    - [`config` 디렉토리](#the-config-directory)
    - [`database` 디렉토리](#the-database-directory)
    - [`public` 디렉토리](#the-public-directory)
    - [`resources` 디렉토리](#the-resources-directory)
    - [`routes` 디렉토리](#the-routes-directory)
    - [`storage` 디렉토리](#the-storage-directory)
    - [`tests` 디렉토리](#the-tests-directory)
    - [`vendor` 디렉토리](#the-vendor-directory)
- [App 디렉토리](#the-app-directory)
    - [`Broadcasting` 디렉토리](#the-broadcasting-directory)
    - [`Console` 디렉토리](#the-console-directory)
    - [`Events` 디렉토리](#the-events-directory)
    - [`Exceptions` 디렉토리](#the-exceptions-directory)
    - [`Http` 디렉토리](#the-http-directory)
    - [`Jobs` 디렉토리](#the-jobs-directory)
    - [`Listeners` 디렉토리](#the-listeners-directory)
    - [`Mail` 디렉토리](#the-mail-directory)
    - [`Models` 디렉토리](#the-models-directory)
    - [`Notifications` 디렉토리](#the-notifications-directory)
    - [`Policies` 디렉토리](#the-policies-directory)
    - [`Providers` 디렉토리](#the-providers-directory)
    - [`Rules` 디렉토리](#the-rules-directory)

<a name="introduction"></a>
## 소개

Laravel의 기본 애플리케이션 구조는 대규모 및 소규모 애플리케이션 모두에 훌륭한 시작점을 제공하도록 설계되었습니다. 하지만 원하는 대로 애플리케이션을 자유롭게 구성할 수 있습니다. Laravel은 Composer가 클래스를 오토로드할 수 있는 한, 특정 클래스의 위치에 대해 거의 제한을 두지 않습니다.

<a name="the-root-directory"></a>
## 루트 디렉토리

<a name="the-root-app-directory"></a>
### App 디렉토리

`app` 디렉토리는 애플리케이션의 핵심 코드를 포함합니다. 이 디렉토리에 대해서는 곧 더 자세히 살펴보겠습니다. 하지만 애플리케이션의 거의 모든 클래스가 이 디렉토리에 위치하게 됩니다.

<a name="the-bootstrap-directory"></a>
### Bootstrap 디렉토리

`bootstrap` 디렉토리는 프레임워크를 부트스트랩하는 `app.php` 파일을 포함합니다. 이 디렉토리에는 라우트 및 서비스 캐시 파일과 같은 성능 최적화를 위해 프레임워크가 생성한 파일들을 포함하는 `cache` 디렉토리도 있습니다.

<a name="the-config-directory"></a>
### Config 디렉토리

`config` 디렉토리는 이름에서 알 수 있듯이 애플리케이션의 모든 설정 파일을 포함합니다. 이 파일들을 모두 읽어보고 사용 가능한 모든 옵션에 익숙해지는 것이 좋습니다.

<a name="the-database-directory"></a>
### Database 디렉토리

`database` 디렉토리는 데이터베이스 마이그레이션, 모델 팩토리, 시드를 포함합니다. 원한다면 이 디렉토리를 SQLite 데이터베이스를 저장하는 데 사용할 수도 있습니다.

<a name="the-public-directory"></a>
### Public 디렉토리

`public` 디렉토리는 애플리케이션으로 들어오는 모든 요청의 진입점이며 오토로딩을 설정하는 `index.php` 파일을 포함합니다. 이 디렉토리에는 이미지, JavaScript, CSS와 같은 에셋도 포함됩니다.

<a name="the-resources-directory"></a>
### Resources 디렉토리

`resources` 디렉토리는 [뷰](/docs/{{version}}/views)와 CSS 또는 JavaScript와 같은 컴파일되지 않은 원본 에셋을 포함합니다.

<a name="the-routes-directory"></a>
### Routes 디렉토리

`routes` 디렉토리는 애플리케이션의 모든 라우트 정의를 포함합니다. 기본적으로 Laravel에는 `web.php`와 `console.php` 두 개의 라우트 파일이 포함되어 있습니다.

`web.php` 파일은 Laravel이 `web` 미들웨어 그룹에 배치하는 라우트를 포함하며, 이 그룹은 세션 상태, CSRF 보호, 쿠키 암호화를 제공합니다. 애플리케이션이 상태 비저장(stateless) RESTful API를 제공하지 않는다면 모든 라우트는 대부분 `web.php` 파일에 정의될 것입니다.

`console.php` 파일은 클로저 기반 콘솔 명령어를 모두 정의할 수 있는 곳입니다. 각 클로저는 명령어 인스턴스에 바인딩되어 각 명령어의 IO 메서드와 상호작용하는 간단한 방법을 제공합니다. 이 파일은 HTTP 라우트를 정의하지 않지만, 애플리케이션으로의 콘솔 기반 진입점(라우트)을 정의합니다. `console.php` 파일에서 작업을 [스케줄링](/docs/{{version}}/scheduling)할 수도 있습니다.

선택적으로 `install:api` 및 `install:broadcasting` Artisan 명령어를 통해 API 라우트(`api.php`)와 브로드캐스팅 채널(`channels.php`)을 위한 추가 라우트 파일을 설치할 수 있습니다.

`api.php` 파일은 상태 비저장(stateless)을 목적으로 하는 라우트를 포함하므로, 이 라우트를 통해 애플리케이션에 들어오는 요청은 [토큰을 통해](/docs/{{version}}/sanctum) 인증되어야 하며 세션 상태에 접근할 수 없습니다.

`channels.php` 파일은 애플리케이션이 지원하는 모든 [이벤트 브로드캐스팅](/docs/{{version}}/broadcasting) 채널을 등록할 수 있는 곳입니다.

<a name="the-storage-directory"></a>
### Storage 디렉토리

`storage` 디렉토리는 로그, 컴파일된 Blade 템플릿, 파일 기반 세션, 파일 캐시, 그리고 프레임워크가 생성한 기타 파일들을 포함합니다. 이 디렉토리는 `app`, `framework`, `logs` 디렉토리로 분리됩니다. `app` 디렉토리는 애플리케이션에서 생성한 모든 파일을 저장하는 데 사용할 수 있습니다. `framework` 디렉토리는 프레임워크가 생성한 파일과 캐시를 저장하는 데 사용됩니다. 마지막으로 `logs` 디렉토리는 애플리케이션의 로그 파일을 포함합니다.

`storage/app/public` 디렉토리는 공개적으로 접근 가능해야 하는 프로필 아바타와 같은 사용자 생성 파일을 저장하는 데 사용할 수 있습니다. 이 디렉토리를 가리키는 심볼릭 링크를 `public/storage`에 생성해야 합니다. `php artisan storage:link` Artisan 명령어를 사용하여 링크를 생성할 수 있습니다.

<a name="the-tests-directory"></a>
### Tests 디렉토리

`tests` 디렉토리는 자동화된 테스트를 포함합니다. 예시 [Pest](https://pestphp.com) 또는 [PHPUnit](https://phpunit.de/) 유닛 테스트와 기능 테스트가 기본으로 제공됩니다. 각 테스트 클래스는 `Test`라는 단어로 끝나야 합니다. `/vendor/bin/pest` 또는 `/vendor/bin/phpunit` 명령어를 사용하여 테스트를 실행할 수 있습니다. 또는 테스트 결과를 더 상세하고 아름답게 표시하려면 `php artisan test` Artisan 명령어를 사용하여 테스트를 실행할 수 있습니다.

<a name="the-vendor-directory"></a>
### Vendor 디렉토리

`vendor` 디렉토리는 [Composer](https://getcomposer.org) 의존성을 포함합니다.

<a name="the-app-directory"></a>
## App 디렉토리

애플리케이션의 대부분은 `app` 디렉토리에 위치합니다. 기본적으로 이 디렉토리는 `App` 네임스페이스 아래에 있으며 [PSR-4 오토로딩 표준](https://www.php-fig.org/psr/psr-4/)을 사용하여 Composer에 의해 오토로드됩니다.

기본적으로 `app` 디렉토리에는 `Http`, `Models`, `Providers` 디렉토리가 포함됩니다. 하지만 시간이 지나면서 make Artisan 명령어를 사용하여 클래스를 생성할 때 app 디렉토리 내에 다양한 다른 디렉토리가 생성됩니다. 예를 들어, `app/Console` 디렉토리는 명령어 클래스를 생성하기 위해 `make:command` Artisan 명령어를 실행하기 전까지는 존재하지 않습니다.

`Console`과 `Http` 디렉토리는 아래의 각 섹션에서 더 자세히 설명되지만, `Console`과 `Http` 디렉토리를 애플리케이션의 핵심에 대한 API를 제공하는 것으로 생각하세요. HTTP 프로토콜과 CLI는 모두 애플리케이션과 상호작용하는 메커니즘이지만, 실제로 애플리케이션 로직을 포함하지는 않습니다. 다시 말해, 이것들은 애플리케이션에 명령을 내리는 두 가지 방법입니다. `Console` 디렉토리는 모든 Artisan 명령어를 포함하고, `Http` 디렉토리는 컨트롤러, 미들웨어, 요청을 포함합니다.

> [!NOTE]
> `app` 디렉토리의 많은 클래스는 Artisan 명령어를 통해 생성할 수 있습니다. 사용 가능한 명령어를 확인하려면 터미널에서 `php artisan list make` 명령어를 실행하세요.

<a name="the-broadcasting-directory"></a>
### Broadcasting 디렉토리

`Broadcasting` 디렉토리는 애플리케이션의 모든 브로드캐스트 채널 클래스를 포함합니다. 이 클래스들은 `make:channel` 명령어를 사용하여 생성됩니다. 이 디렉토리는 기본적으로 존재하지 않지만, 첫 번째 채널을 생성할 때 자동으로 생성됩니다. 채널에 대해 더 알아보려면 [이벤트 브로드캐스팅](/docs/{{version}}/broadcasting) 문서를 확인하세요.

<a name="the-console-directory"></a>
### Console 디렉토리

`Console` 디렉토리는 애플리케이션의 모든 커스텀 Artisan 명령어를 포함합니다. 이 명령어들은 `make:command` 명령어를 사용하여 생성할 수 있습니다.

<a name="the-events-directory"></a>
### Events 디렉토리

이 디렉토리는 기본적으로 존재하지 않지만, `event:generate` 및 `make:event` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Events` 디렉토리는 [이벤트 클래스](/docs/{{version}}/events)를 포함합니다. 이벤트는 주어진 동작이 발생했음을 애플리케이션의 다른 부분에 알리는 데 사용될 수 있으며, 뛰어난 유연성과 디커플링을 제공합니다.

<a name="the-exceptions-directory"></a>
### Exceptions 디렉토리

`Exceptions` 디렉토리는 애플리케이션의 모든 커스텀 예외를 포함합니다. 이 예외들은 `make:exception` 명령어를 사용하여 생성할 수 있습니다.

<a name="the-http-directory"></a>
### Http 디렉토리

`Http` 디렉토리는 컨트롤러, 미들웨어, 폼 요청(form requests)을 포함합니다. 애플리케이션으로 들어오는 요청을 처리하는 거의 모든 로직이 이 디렉토리에 배치됩니다.

<a name="the-jobs-directory"></a>
### Jobs 디렉토리

이 디렉토리는 기본적으로 존재하지 않지만, `make:job` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Jobs` 디렉토리는 애플리케이션의 [큐 작업](/docs/{{version}}/queues)을 포함합니다. 작업(Jobs)은 애플리케이션에 의해 큐에 등록되거나 현재 요청 수명 주기 내에서 동기적으로 실행될 수 있습니다. 현재 요청 중에 동기적으로 실행되는 작업은 [커맨드 패턴](https://en.wikipedia.org/wiki/Command_pattern)의 구현이므로 때때로 "명령(commands)"이라고 불립니다.

<a name="the-listeners-directory"></a>
### Listeners 디렉토리

이 디렉토리는 기본적으로 존재하지 않지만, `event:generate` 또는 `make:listener` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Listeners` 디렉토리는 [이벤트](/docs/{{version}}/events)를 처리하는 클래스를 포함합니다. 이벤트 리스너(Event listeners)는 이벤트 인스턴스를 받아 발생한 이벤트에 대한 응답으로 로직을 수행합니다. 예를 들어, `UserRegistered` 이벤트는 `SendWelcomeEmail` 리스너에 의해 처리될 수 있습니다.

<a name="the-mail-directory"></a>
### Mail 디렉토리

이 디렉토리는 기본적으로 존재하지 않지만, `make:mail` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Mail` 디렉토리는 애플리케이션에서 전송하는 [이메일을 나타내는 모든 클래스](/docs/{{version}}/mail)를 포함합니다. Mail 객체를 사용하면 이메일 작성의 모든 로직을 `Mail::send` 메서드를 사용하여 전송할 수 있는 단일하고 간단한 클래스에 캡슐화할 수 있습니다.

<a name="the-models-directory"></a>
### Models 디렉토리

`Models` 디렉토리는 모든 [Eloquent 모델 클래스](/docs/{{version}}/eloquent)를 포함합니다. Laravel에 포함된 Eloquent ORM은 데이터베이스 작업을 위한 아름답고 간단한 ActiveRecord 구현을 제공합니다. 각 데이터베이스 테이블에는 해당 테이블과 상호작용하는 데 사용되는 해당 "모델"이 있습니다. 모델을 사용하면 테이블의 데이터를 조회하고 테이블에 새 레코드를 삽입할 수 있습니다.

<a name="the-notifications-directory"></a>
### Notifications 디렉토리

이 디렉토리는 기본적으로 존재하지 않지만, `make:notification` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Notifications` 디렉토리는 애플리케이션에서 전송하는 모든 "트랜잭션" [알림](/docs/{{version}}/notifications)을 포함합니다. 예를 들어 애플리케이션 내에서 발생하는 이벤트에 대한 간단한 알림 등이 있습니다. Laravel의 알림 기능은 이메일, Slack, SMS 또는 데이터베이스 저장과 같은 다양한 드라이버를 통한 알림 전송을 추상화합니다.

<a name="the-policies-directory"></a>
### Policies 디렉토리

이 디렉토리는 기본적으로 존재하지 않지만, `make:policy` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Policies` 디렉토리는 애플리케이션의 [인가 정책 클래스](/docs/{{version}}/authorization)를 포함합니다. 정책(Policies)은 사용자가 리소스에 대해 주어진 동작을 수행할 수 있는지 결정하는 데 사용됩니다.

<a name="the-providers-directory"></a>
### Providers 디렉토리

`Providers` 디렉토리는 애플리케이션의 모든 [서비스 프로바이더](/docs/{{version}}/providers)를 포함합니다. 서비스 프로바이더(Service providers)는 서비스 컨테이너(Service Container)에 서비스를 바인딩하고, 이벤트를 등록하거나, 들어오는 요청에 대비하여 애플리케이션을 준비하는 기타 작업을 수행하여 애플리케이션을 부트스트랩합니다.

새로운 Laravel 애플리케이션에서 이 디렉토리에는 이미 `AppServiceProvider`가 포함되어 있습니다. 필요에 따라 이 디렉토리에 자체 프로바이더를 자유롭게 추가할 수 있습니다.

<a name="the-rules-directory"></a>
### Rules 디렉토리

이 디렉토리는 기본적으로 존재하지 않지만, `make:rule` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Rules` 디렉토리는 애플리케이션의 커스텀 유효성 검사 규칙 객체를 포함합니다. 규칙(Rules)은 복잡한 유효성 검사 로직을 간단한 객체에 캡슐화하는 데 사용됩니다. 자세한 내용은 [유효성 검사 문서](/docs/{{version}}/validation)를 확인하세요.

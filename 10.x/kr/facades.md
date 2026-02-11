# 파사드(Facades)

- [소개](#introduction)
- [파사드를 사용하는 경우](#when-to-use-facades)
    - [파사드 vs. 의존성 주입](#facades-vs-dependency-injection)
    - [파사드 vs. 헬퍼 함수](#facades-vs-helper-functions)
- [파사드 작동 원리](#how-facades-work)
- [실시간 파사드(Real-Time Facades)](#real-time-facades)
- [파사드 클래스 레퍼런스](#facade-class-reference)

<a name="introduction"></a>
## 소개

Laravel 문서 전반에 걸쳐 "파사드(Facades)"를 통해 Laravel의 기능과 상호작용하는 코드 예제를 볼 수 있습니다. 파사드는 애플리케이션의 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에서 사용할 수 있는 클래스에 대한 "정적(static)" 인터페이스를 제공합니다. Laravel은 거의 모든 Laravel 기능에 접근할 수 있는 많은 파사드를 제공합니다.

Laravel 파사드는 서비스 컨테이너의 기본 클래스에 대한 "정적 프록시(static proxies)" 역할을 하며, 기존의 정적 메서드보다 더 나은 테스트 용이성과 유연성을 유지하면서 간결하고 표현력 있는 문법의 이점을 제공합니다. 파사드가 어떻게 작동하는지 완전히 이해하지 못하더라도 괜찮습니다 - 그냥 흐름에 맡기고 Laravel에 대해 계속 배워나가세요.

Laravel의 모든 파사드는 `Illuminate\Support\Facades` 네임스페이스에 정의되어 있습니다. 따라서 다음과 같이 쉽게 파사드에 접근할 수 있습니다:

    use Illuminate\Support\Facades\Cache;
    use Illuminate\Support\Facades\Route;

    Route::get('/cache', function () {
        return Cache::get('key');
    });

Laravel 문서 전반에 걸쳐 많은 예제가 프레임워크의 다양한 기능을 시연하기 위해 파사드를 사용합니다.

<a name="helper-functions"></a>
#### 헬퍼 함수(Helper Functions)

파사드를 보완하기 위해 Laravel은 일반적인 Laravel 기능과의 상호작용을 더욱 쉽게 만드는 다양한 전역 "헬퍼 함수(helper functions)"를 제공합니다. 자주 사용하게 될 헬퍼 함수로는 `view`, `response`, `url`, `config` 등이 있습니다. Laravel이 제공하는 각 헬퍼 함수는 해당 기능과 함께 문서화되어 있지만, 전체 목록은 전용 [헬퍼 문서](/docs/{{version}}/helpers)에서 확인할 수 있습니다.

예를 들어, JSON 응답을 생성하기 위해 `Illuminate\Support\Facades\Response` 파사드를 사용하는 대신 간단히 `response` 함수를 사용할 수 있습니다. 헬퍼 함수는 전역적으로 사용 가능하므로 사용하기 위해 어떤 클래스도 임포트할 필요가 없습니다:

    use Illuminate\Support\Facades\Response;

    Route::get('/users', function () {
        return Response::json([
            // ...
        ]);
    });

    Route::get('/users', function () {
        return response()->json([
            // ...
        ]);
    });

<a name="when-to-use-facades"></a>
## 파사드를 사용하는 경우

파사드는 많은 이점이 있습니다. 수동으로 주입하거나 설정해야 하는 긴 클래스 이름을 기억할 필요 없이 Laravel의 기능을 사용할 수 있는 간결하고 기억하기 쉬운 문법을 제공합니다. 또한 PHP의 동적 메서드를 고유하게 사용하기 때문에 테스트하기 쉽습니다.

그러나 파사드를 사용할 때는 주의가 필요합니다. 파사드의 주요 위험은 클래스의 "범위 확장(scope creep)"입니다. 파사드는 사용하기 쉽고 주입이 필요 없기 때문에, 클래스가 계속 커지고 단일 클래스에서 많은 파사드를 사용하게 되기 쉽습니다. 의존성 주입을 사용하면 큰 생성자가 클래스가 너무 커지고 있다는 시각적 피드백을 제공하여 이러한 가능성이 완화됩니다. 따라서 파사드를 사용할 때는 클래스의 크기에 특별히 주의하여 책임 범위가 좁게 유지되도록 하세요. 클래스가 너무 커지면 여러 개의 작은 클래스로 분할하는 것을 고려하세요.

<a name="facades-vs-dependency-injection"></a>
### 파사드 vs. 의존성 주입(Dependency Injection)

의존성 주입의 주요 이점 중 하나는 주입된 클래스의 구현을 교체할 수 있다는 것입니다. 이것은 테스트 중에 모의 객체(mock)나 스텁(stub)을 주입하고 스텁에서 다양한 메서드가 호출되었는지 확인할 수 있어 유용합니다.

일반적으로 진정한 정적 클래스 메서드를 모의하거나 스텁하는 것은 불가능합니다. 그러나 파사드는 서비스 컨테이너에서 해결된 객체에 대한 메서드 호출을 프록시하기 위해 동적 메서드를 사용하므로, 주입된 클래스 인스턴스를 테스트하는 것처럼 실제로 파사드를 테스트할 수 있습니다. 예를 들어, 다음과 같은 라우트가 있다고 가정해 보겠습니다:

    use Illuminate\Support\Facades\Cache;

    Route::get('/cache', function () {
        return Cache::get('key');
    });

Laravel의 파사드 테스트 메서드를 사용하여 `Cache::get` 메서드가 우리가 예상한 인수로 호출되었는지 확인하는 다음 테스트를 작성할 수 있습니다:

    use Illuminate\Support\Facades\Cache;

    /**
     * 기본 기능 테스트 예제.
     */
    public function test_basic_example(): void
    {
        Cache::shouldReceive('get')
             ->with('key')
             ->andReturn('value');

        $response = $this->get('/cache');

        $response->assertSee('value');
    }

<a name="facades-vs-helper-functions"></a>
### 파사드 vs. 헬퍼 함수(Helper Functions)

파사드 외에도 Laravel은 뷰 생성, 이벤트 발생, 작업 디스패치, HTTP 응답 전송 같은 일반적인 작업을 수행할 수 있는 다양한 "헬퍼(helper)" 함수를 포함합니다. 이러한 헬퍼 함수 중 많은 것들이 해당하는 파사드와 동일한 기능을 수행합니다. 예를 들어, 이 파사드 호출과 헬퍼 호출은 동등합니다:

    return Illuminate\Support\Facades\View::make('profile');

    return view('profile');

파사드와 헬퍼 함수 사이에는 실질적인 차이가 전혀 없습니다. 헬퍼 함수를 사용할 때도 해당하는 파사드와 정확히 동일한 방식으로 테스트할 수 있습니다. 예를 들어, 다음과 같은 라우트가 있다고 가정해 보겠습니다:

    Route::get('/cache', function () {
        return cache('key');
    });

`cache` 헬퍼는 `Cache` 파사드의 기본 클래스에서 `get` 메서드를 호출합니다. 따라서 헬퍼 함수를 사용하더라도 메서드가 우리가 예상한 인수로 호출되었는지 확인하는 다음 테스트를 작성할 수 있습니다:

    use Illuminate\Support\Facades\Cache;

    /**
     * 기본 기능 테스트 예제.
     */
    public function test_basic_example(): void
    {
        Cache::shouldReceive('get')
            ->with('key')
            ->andReturn('value');

        $response = $this->get('/cache');

        $response->assertSee('value');
    }

<a name="how-facades-work"></a>
## 파사드 작동 원리

Laravel 애플리케이션에서 파사드는 컨테이너에서 객체에 대한 접근을 제공하는 클래스입니다. 이것이 작동하게 하는 메커니즘은 `Facade` 클래스에 있습니다. Laravel의 파사드와 여러분이 만드는 커스텀 파사드는 기본 `Illuminate\Support\Facades\Facade` 클래스를 확장합니다.

`Facade` 기본 클래스는 `__callStatic()` 매직 메서드를 사용하여 파사드에서의 호출을 컨테이너에서 해결된 객체로 전달합니다. 아래 예제에서는 Laravel 캐시 시스템에 대한 호출이 이루어집니다. 이 코드를 보면 `Cache` 클래스에서 정적 `get` 메서드가 호출되는 것으로 생각할 수 있습니다:

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\Cache;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * 주어진 사용자의 프로필을 표시합니다.
         */
        public function showProfile(string $id): View
        {
            $user = Cache::get('user:'.$id);

            return view('profile', ['user' => $user]);
        }
    }

파일 상단 근처에서 `Cache` 파사드를 "임포트"하고 있는 것에 주목하세요. 이 파사드는 `Illuminate\Contracts\Cache\Factory` 인터페이스의 기본 구현에 접근하기 위한 프록시 역할을 합니다. 파사드를 사용하여 수행하는 모든 호출은 Laravel 캐시 서비스의 기본 인스턴스로 전달됩니다.

`Illuminate\Support\Facades\Cache` 클래스를 살펴보면 정적 메서드 `get`이 없다는 것을 알 수 있습니다:

    class Cache extends Facade
    {
        /**
         * 컴포넌트의 등록된 이름을 가져옵니다.
         */
        protected static function getFacadeAccessor(): string
        {
            return 'cache';
        }
    }

대신 `Cache` 파사드는 기본 `Facade` 클래스를 확장하고 `getFacadeAccessor()` 메서드를 정의합니다. 이 메서드의 역할은 서비스 컨테이너 바인딩의 이름을 반환하는 것입니다. 사용자가 `Cache` 파사드의 정적 메서드를 참조하면 Laravel은 [서비스 컨테이너(Service Container)](/docs/{{version}}/container)에서 `cache` 바인딩을 해결하고 해당 객체에 대해 요청된 메서드(이 경우 `get`)를 실행합니다.

<a name="real-time-facades"></a>
## 실시간 파사드(Real-Time Facades)

실시간 파사드를 사용하면 애플리케이션의 모든 클래스를 파사드처럼 취급할 수 있습니다. 이것이 어떻게 사용될 수 있는지 설명하기 위해 먼저 실시간 파사드를 사용하지 않는 코드를 살펴보겠습니다. 예를 들어, `Podcast` 모델에 `publish` 메서드가 있다고 가정해 보겠습니다. 그러나 팟캐스트를 게시하려면 `Publisher` 인스턴스를 주입해야 합니다:

    <?php

    namespace App\Models;

    use App\Contracts\Publisher;
    use Illuminate\Database\Eloquent\Model;

    class Podcast extends Model
    {
        /**
         * 팟캐스트를 게시합니다.
         */
        public function publish(Publisher $publisher): void
        {
            $this->update(['publishing' => now()]);

            $publisher->publish($this);
        }
    }

메서드에 퍼블리셔 구현을 주입하면 주입된 퍼블리셔를 모의할 수 있으므로 메서드를 격리하여 쉽게 테스트할 수 있습니다. 그러나 `publish` 메서드를 호출할 때마다 항상 퍼블리셔 인스턴스를 전달해야 합니다. 실시간 파사드를 사용하면 `Publisher` 인스턴스를 명시적으로 전달할 필요 없이 동일한 테스트 용이성을 유지할 수 있습니다. 실시간 파사드를 생성하려면 임포트된 클래스의 네임스페이스 앞에 `Facades`를 접두사로 붙이세요:

    <?php

    namespace App\Models;

    use App\Contracts\Publisher; // [tl! remove]
    use Facades\App\Contracts\Publisher; // [tl! add]
    use Illuminate\Database\Eloquent\Model;

    class Podcast extends Model
    {
        /**
         * 팟캐스트를 게시합니다.
         */
        public function publish(Publisher $publisher): void // [tl! remove]
        public function publish(): void // [tl! add]
        {
            $this->update(['publishing' => now()]);

            $publisher->publish($this); // [tl! remove]
            Publisher::publish($this); // [tl! add]
        }
    }

실시간 파사드가 사용되면 `Facades` 접두사 뒤에 나타나는 인터페이스 또는 클래스 이름의 부분을 사용하여 서비스 컨테이너에서 퍼블리셔 구현이 해결됩니다. 테스트할 때 Laravel의 내장 파사드 테스트 헬퍼를 사용하여 이 메서드 호출을 모의할 수 있습니다:

    <?php

    namespace Tests\Feature;

    use App\Models\Podcast;
    use Facades\App\Contracts\Publisher;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Tests\TestCase;

    class PodcastTest extends TestCase
    {
        use RefreshDatabase;

        /**
         * 테스트 예제.
         */
        public function test_podcast_can_be_published(): void
        {
            $podcast = Podcast::factory()->create();

            Publisher::shouldReceive('publish')->once()->with($podcast);

            $podcast->publish();
        }
    }

<a name="facade-class-reference"></a>
## 파사드 클래스 레퍼런스

아래에서 모든 파사드와 해당하는 기본 클래스를 찾을 수 있습니다. 이것은 주어진 파사드 루트에 대한 API 문서를 빠르게 탐색하는 데 유용한 도구입니다. 해당되는 경우 [서비스 컨테이너 바인딩(Service Container Binding)](/docs/{{version}}/container) 키도 포함되어 있습니다.

<div class="overflow-auto">

파사드(Facade)  |  클래스(Class)  |  서비스 컨테이너 바인딩(Service Container Binding)
------------- | ------------- | -------------
App  |  [Illuminate\Foundation\Application](https://laravel.com/api/{{version}}/Illuminate/Foundation/Application.html)  |  `app`
Artisan  |  [Illuminate\Contracts\Console\Kernel](https://laravel.com/api/{{version}}/Illuminate/Contracts/Console/Kernel.html)  |  `artisan`
Auth  |  [Illuminate\Auth\AuthManager](https://laravel.com/api/{{version}}/Illuminate/Auth/AuthManager.html)  |  `auth`
Auth (Instance)  |  [Illuminate\Contracts\Auth\Guard](https://laravel.com/api/{{version}}/Illuminate/Contracts/Auth/Guard.html)  |  `auth.driver`
Blade  |  [Illuminate\View\Compilers\BladeCompiler](https://laravel.com/api/{{version}}/Illuminate/View/Compilers/BladeCompiler.html)  |  `blade.compiler`
Broadcast  |  [Illuminate\Contracts\Broadcasting\Factory](https://laravel.com/api/{{version}}/Illuminate/Contracts/Broadcasting/Factory.html)  |  &nbsp;
Broadcast (Instance)  |  [Illuminate\Contracts\Broadcasting\Broadcaster](https://laravel.com/api/{{version}}/Illuminate/Contracts/Broadcasting/Broadcaster.html)  |  &nbsp;
Bus  |  [Illuminate\Contracts\Bus\Dispatcher](https://laravel.com/api/{{version}}/Illuminate/Contracts/Bus/Dispatcher.html)  |  &nbsp;
Cache  |  [Illuminate\Cache\CacheManager](https://laravel.com/api/{{version}}/Illuminate/Cache/CacheManager.html)  |  `cache`
Cache (Instance)  |  [Illuminate\Cache\Repository](https://laravel.com/api/{{version}}/Illuminate/Cache/Repository.html)  |  `cache.store`
Config  |  [Illuminate\Config\Repository](https://laravel.com/api/{{version}}/Illuminate/Config/Repository.html)  |  `config`
Cookie  |  [Illuminate\Cookie\CookieJar](https://laravel.com/api/{{version}}/Illuminate/Cookie/CookieJar.html)  |  `cookie`
Crypt  |  [Illuminate\Encryption\Encrypter](https://laravel.com/api/{{version}}/Illuminate/Encryption/Encrypter.html)  |  `encrypter`
Date  |  [Illuminate\Support\DateFactory](https://laravel.com/api/{{version}}/Illuminate/Support/DateFactory.html)  |  `date`
DB  |  [Illuminate\Database\DatabaseManager](https://laravel.com/api/{{version}}/Illuminate/Database/DatabaseManager.html)  |  `db`
DB (Instance)  |  [Illuminate\Database\Connection](https://laravel.com/api/{{version}}/Illuminate/Database/Connection.html)  |  `db.connection`
Event  |  [Illuminate\Events\Dispatcher](https://laravel.com/api/{{version}}/Illuminate/Events/Dispatcher.html)  |  `events`
File  |  [Illuminate\Filesystem\Filesystem](https://laravel.com/api/{{version}}/Illuminate/Filesystem/Filesystem.html)  |  `files`
Gate  |  [Illuminate\Contracts\Auth\Access\Gate](https://laravel.com/api/{{version}}/Illuminate/Contracts/Auth/Access/Gate.html)  |  &nbsp;
Hash  |  [Illuminate\Contracts\Hashing\Hasher](https://laravel.com/api/{{version}}/Illuminate/Contracts/Hashing/Hasher.html)  |  `hash`
Http  |  [Illuminate\Http\Client\Factory](https://laravel.com/api/{{version}}/Illuminate/Http/Client/Factory.html)  |  &nbsp;
Lang  |  [Illuminate\Translation\Translator](https://laravel.com/api/{{version}}/Illuminate/Translation/Translator.html)  |  `translator`
Log  |  [Illuminate\Log\LogManager](https://laravel.com/api/{{version}}/Illuminate/Log/LogManager.html)  |  `log`
Mail  |  [Illuminate\Mail\Mailer](https://laravel.com/api/{{version}}/Illuminate/Mail/Mailer.html)  |  `mailer`
Notification  |  [Illuminate\Notifications\ChannelManager](https://laravel.com/api/{{version}}/Illuminate/Notifications/ChannelManager.html)  |  &nbsp;
Password  |  [Illuminate\Auth\Passwords\PasswordBrokerManager](https://laravel.com/api/{{version}}/Illuminate/Auth/Passwords/PasswordBrokerManager.html)  |  `auth.password`
Password (Instance)  |  [Illuminate\Auth\Passwords\PasswordBroker](https://laravel.com/api/{{version}}/Illuminate/Auth/Passwords/PasswordBroker.html)  |  `auth.password.broker`
Pipeline (Instance)  |  [Illuminate\Pipeline\Pipeline](https://laravel.com/api/{{version}}/Illuminate/Pipeline/Pipeline.html)  |  &nbsp;
Process  |  [Illuminate\Process\Factory](https://laravel.com/api/{{version}}/Illuminate/Process/Factory.html)  |  &nbsp;
Queue  |  [Illuminate\Queue\QueueManager](https://laravel.com/api/{{version}}/Illuminate/Queue/QueueManager.html)  |  `queue`
Queue (Instance)  |  [Illuminate\Contracts\Queue\Queue](https://laravel.com/api/{{version}}/Illuminate/Contracts/Queue/Queue.html)  |  `queue.connection`
Queue (Base Class)  |  [Illuminate\Queue\Queue](https://laravel.com/api/{{version}}/Illuminate/Queue/Queue.html)  |  &nbsp;
RateLimiter  |  [Illuminate\Cache\RateLimiter](https://laravel.com/api/{{version}}/Illuminate/Cache/RateLimiter.html)  |  &nbsp;
Redirect  |  [Illuminate\Routing\Redirector](https://laravel.com/api/{{version}}/Illuminate/Routing/Redirector.html)  |  `redirect`
Redis  |  [Illuminate\Redis\RedisManager](https://laravel.com/api/{{version}}/Illuminate/Redis/RedisManager.html)  |  `redis`
Redis (Instance)  |  [Illuminate\Redis\Connections\Connection](https://laravel.com/api/{{version}}/Illuminate/Redis/Connections/Connection.html)  |  `redis.connection`
Request  |  [Illuminate\Http\Request](https://laravel.com/api/{{version}}/Illuminate/Http/Request.html)  |  `request`
Response  |  [Illuminate\Contracts\Routing\ResponseFactory](https://laravel.com/api/{{version}}/Illuminate/Contracts/Routing/ResponseFactory.html)  |  &nbsp;
Response (Instance)  |  [Illuminate\Http\Response](https://laravel.com/api/{{version}}/Illuminate/Http/Response.html)  |  &nbsp;
Route  |  [Illuminate\Routing\Router](https://laravel.com/api/{{version}}/Illuminate/Routing/Router.html)  |  `router`
Schema  |  [Illuminate\Database\Schema\Builder](https://laravel.com/api/{{version}}/Illuminate/Database/Schema/Builder.html)  |  &nbsp;
Session  |  [Illuminate\Session\SessionManager](https://laravel.com/api/{{version}}/Illuminate/Session/SessionManager.html)  |  `session`
Session (Instance)  |  [Illuminate\Session\Store](https://laravel.com/api/{{version}}/Illuminate/Session/Store.html)  |  `session.store`
Storage  |  [Illuminate\Filesystem\FilesystemManager](https://laravel.com/api/{{version}}/Illuminate/Filesystem/FilesystemManager.html)  |  `filesystem`
Storage (Instance)  |  [Illuminate\Contracts\Filesystem\Filesystem](https://laravel.com/api/{{version}}/Illuminate/Contracts/Filesystem/Filesystem.html)  |  `filesystem.disk`
URL  |  [Illuminate\Routing\UrlGenerator](https://laravel.com/api/{{version}}/Illuminate/Routing/UrlGenerator.html)  |  `url`
Validator  |  [Illuminate\Validation\Factory](https://laravel.com/api/{{version}}/Illuminate/Validation/Factory.html)  |  `validator`
Validator (Instance)  |  [Illuminate\Validation\Validator](https://laravel.com/api/{{version}}/Illuminate/Validation/Validator.html)  |  &nbsp;
View  |  [Illuminate\View\Factory](https://laravel.com/api/{{version}}/Illuminate/View/Factory.html)  |  `view`
View (Instance)  |  [Illuminate\View\View](https://laravel.com/api/{{version}}/Illuminate/View/View.html)  |  &nbsp;
Vite  |  [Illuminate\Foundation\Vite](https://laravel.com/api/{{version}}/Illuminate/Foundation/Vite.html)  |  &nbsp;

</div>

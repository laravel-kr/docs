# 이벤트(Events)

- [소개](#introduction)
- [이벤트 및 리스너 등록](#registering-events-and-listeners)
    - [이벤트 및 리스너 생성](#generating-events-and-listeners)
    - [수동으로 이벤트 등록하기](#manually-registering-events)
    - [이벤트 자동 감지](#event-discovery)
- [이벤트 정의하기](#defining-events)
- [리스너 정의하기](#defining-listeners)
- [대기열 이벤트 리스너](#queued-event-listeners)
    - [대기열과 수동으로 상호작용하기](#manually-interacting-with-the-queue)
    - [대기열 이벤트 리스너와 데이터베이스 트랜잭션](#queued-event-listeners-and-database-transactions)
    - [실패한 작업 처리하기](#handling-failed-jobs)
- [이벤트 발송하기](#dispatching-events)
    - [데이터베이스 트랜잭션 후 이벤트 발송하기](#dispatching-events-after-database-transactions)
- [이벤트 구독자](#event-subscribers)
    - [이벤트 구독자 작성하기](#writing-event-subscribers)
    - [이벤트 구독자 등록하기](#registering-event-subscribers)
- [테스트](#testing)
    - [일부 이벤트만 Fake 처리하기](#faking-a-subset-of-events)
    - [범위 지정 이벤트 Fake](#scoped-event-fakes)

<a name="introduction"></a>
## 소개

Laravel의 이벤트는 간단한 옵저버 패턴(Observer Pattern) 구현을 제공하여, 애플리케이션 내에서 발생하는 다양한 이벤트를 구독하고 수신할 수 있게 해줍니다. 이벤트 클래스는 일반적으로 `app/Events` 디렉토리에 저장되고, 리스너는 `app/Listeners`에 저장됩니다. 애플리케이션에서 이러한 디렉토리가 보이지 않더라도 걱정하지 마세요. Artisan 콘솔 명령어를 사용하여 이벤트와 리스너를 생성할 때 자동으로 생성됩니다.

이벤트는 애플리케이션의 다양한 측면을 분리하는 훌륭한 방법입니다. 하나의 이벤트에 서로 의존하지 않는 여러 리스너가 있을 수 있기 때문입니다. 예를 들어, 주문이 배송될 때마다 사용자에게 Slack 알림을 보내고 싶을 수 있습니다. 주문 처리 코드를 Slack 알림 코드와 결합하는 대신, `App\Events\OrderShipped` 이벤트를 발생시키면 리스너가 이를 수신하여 Slack 알림을 발송하도록 할 수 있습니다.

<a name="registering-events-and-listeners"></a>
## 이벤트 및 리스너 등록

Laravel 애플리케이션에 포함된 `App\Providers\EventServiceProvider`는 애플리케이션의 모든 이벤트 리스너를 등록하기에 편리한 장소를 제공합니다. `listen` 속성에는 모든 이벤트(키)와 해당 리스너(값)의 배열이 포함됩니다. 애플리케이션에 필요한 만큼 많은 이벤트를 이 배열에 추가할 수 있습니다. 예를 들어, `OrderShipped` 이벤트를 추가해 보겠습니다.

    use App\Events\OrderShipped;
    use App\Listeners\SendShipmentNotification;

    /**
     * 애플리케이션의 이벤트 리스너 매핑입니다.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        OrderShipped::class => [
            SendShipmentNotification::class,
        ],
    ];

> [!NOTE]
> `event:list` 명령어를 사용하여 애플리케이션에 등록된 모든 이벤트와 리스너의 목록을 표시할 수 있습니다.

<a name="generating-events-and-listeners"></a>
### 이벤트 및 리스너 생성

물론 각 이벤트와 리스너의 파일을 수동으로 생성하는 것은 번거롭습니다. 대신 `EventServiceProvider`에 리스너와 이벤트를 추가하고 `event:generate` Artisan 명령어를 사용하세요. 이 명령어는 아직 존재하지 않는 `EventServiceProvider`에 나열된 모든 이벤트 또는 리스너를 생성합니다.

```shell
php artisan event:generate
```

또는 `make:event` 및 `make:listener` Artisan 명령어를 사용하여 개별 이벤트와 리스너를 생성할 수 있습니다.

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

<a name="manually-registering-events"></a>
### 수동으로 이벤트 등록하기

일반적으로 이벤트는 `EventServiceProvider`의 `$listen` 배열을 통해 등록해야 합니다. 그러나 `EventServiceProvider`의 `boot` 메서드에서 클래스 또는 클로저 기반 이벤트 리스너를 수동으로 등록할 수도 있습니다.

    use App\Events\PodcastProcessed;
    use App\Listeners\SendPodcastNotification;
    use Illuminate\Support\Facades\Event;

    /**
     * 애플리케이션의 다른 이벤트를 등록합니다.
     */
    public function boot(): void
    {
        Event::listen(
            PodcastProcessed::class,
            SendPodcastNotification::class,
        );

        Event::listen(function (PodcastProcessed $event) {
            // ...
        });
    }

<a name="queuable-anonymous-event-listeners"></a>
#### 대기열 처리 가능한 익명 이벤트 리스너

클로저 기반 이벤트 리스너를 수동으로 등록할 때, 리스너 클로저를 `Illuminate\Events\queueable` 함수로 감싸서 Laravel이 [큐](/docs/{{version}}/queues)를 사용하여 리스너를 실행하도록 지시할 수 있습니다.

    use App\Events\PodcastProcessed;
    use function Illuminate\Events\queueable;
    use Illuminate\Support\Facades\Event;

    /**
     * 애플리케이션의 다른 이벤트를 등록합니다.
     */
    public function boot(): void
    {
        Event::listen(queueable(function (PodcastProcessed $event) {
            // ...
        }));
    }

대기열 작업과 마찬가지로, `onConnection`, `onQueue`, `delay` 메서드를 사용하여 대기열 리스너의 실행을 커스터마이징할 수 있습니다.

    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    })->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));

익명 대기열 리스너 실패를 처리하려면, `queueable` 리스너를 정의할 때 `catch` 메서드에 클로저를 제공할 수 있습니다. 이 클로저는 리스너의 실패를 유발한 이벤트 인스턴스와 `Throwable` 인스턴스를 수신합니다.

    use App\Events\PodcastProcessed;
    use function Illuminate\Events\queueable;
    use Illuminate\Support\Facades\Event;
    use Throwable;

    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    })->catch(function (PodcastProcessed $event, Throwable $e) {
        // 대기열 리스너가 실패했습니다...
    }));

<a name="wildcard-event-listeners"></a>
#### 와일드카드 이벤트 리스너

`*` 문자를 와일드카드 매개변수로 사용하여 리스너를 등록하면 동일한 리스너에서 여러 이벤트를 수신할 수 있습니다. 와일드카드 리스너는 이벤트 이름을 첫 번째 인수로, 전체 이벤트 데이터 배열을 두 번째 인수로 받습니다.

    Event::listen('event.*', function (string $eventName, array $data) {
        // ...
    });

<a name="event-discovery"></a>
### 이벤트 자동 감지

`EventServiceProvider`의 `$listen` 배열에 이벤트와 리스너를 수동으로 등록하는 대신, 자동 이벤트 감지를 활성화할 수 있습니다. 이벤트 감지가 활성화되면, Laravel은 애플리케이션의 `Listeners` 디렉토리를 스캔하여 이벤트와 리스너를 자동으로 찾아 등록합니다. 또한, `EventServiceProvider`에 명시적으로 정의된 이벤트는 여전히 등록됩니다.

Laravel은 PHP의 리플렉션 서비스를 사용하여 리스너 클래스를 스캔하여 이벤트 리스너를 찾습니다. Laravel이 `handle` 또는 `__invoke`로 시작하는 리스너 클래스 메서드를 찾으면, 해당 메서드의 시그니처에서 타입 힌트된 이벤트에 대한 이벤트 리스너로 등록합니다.

    use App\Events\PodcastProcessed;

    class SendPodcastNotification
    {
        /**
         * 주어진 이벤트를 처리합니다.
         */
        public function handle(PodcastProcessed $event): void
        {
            // ...
        }
    }

이벤트 감지는 기본적으로 비활성화되어 있지만, 애플리케이션의 `EventServiceProvider`의 `shouldDiscoverEvents` 메서드를 오버라이드하여 활성화할 수 있습니다.

    /**
     * 이벤트와 리스너를 자동으로 감지해야 하는지 결정합니다.
     */
    public function shouldDiscoverEvents(): bool
    {
        return true;
    }

기본적으로 애플리케이션의 `app/Listeners` 디렉토리 내의 모든 리스너가 스캔됩니다. 스캔할 추가 디렉토리를 정의하려면 `EventServiceProvider`에서 `discoverEventsWithin` 메서드를 오버라이드할 수 있습니다.

    /**
     * 이벤트를 감지하는 데 사용할 리스너 디렉토리를 가져옵니다.
     *
     * @return array<int, string>
     */
    protected function discoverEventsWithin(): array
    {
        return [
            $this->app->path('Listeners'),
        ];
    }

<a name="event-discovery-in-production"></a>
#### 프로덕션 환경에서의 이벤트 자동 감지

프로덕션 환경에서는 모든 요청마다 프레임워크가 모든 리스너를 스캔하는 것은 효율적이지 않습니다. 따라서 배포 프로세스 중에 `event:cache` Artisan 명령어를 실행하여 모든 애플리케이션 이벤트와 리스너의 매니페스트를 캐시해야 합니다. 이 매니페스트는 프레임워크가 이벤트 등록 프로세스를 빠르게 처리하는 데 사용됩니다. `event:clear` 명령어를 사용하여 캐시를 삭제할 수 있습니다.

<a name="defining-events"></a>
## 이벤트 정의하기

이벤트 클래스는 본질적으로 이벤트와 관련된 정보를 담는 데이터 컨테이너입니다. 예를 들어, `App\Events\OrderShipped` 이벤트가 [Eloquent ORM](/docs/{{version}}/eloquent) 객체를 수신한다고 가정해 보겠습니다.

    <?php

    namespace App\Events;

    use App\Models\Order;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Foundation\Events\Dispatchable;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped
    {
        use Dispatchable, InteractsWithSockets, SerializesModels;

        /**
         * 새 이벤트 인스턴스를 생성합니다.
         */
        public function __construct(
            public Order $order,
        ) {}
    }

보시다시피, 이 이벤트 클래스에는 로직이 없습니다. 구매된 `App\Models\Order` 인스턴스를 담는 컨테이너입니다. 이벤트에서 사용하는 `SerializesModels` 트레이트는 [대기열 리스너](#queued-event-listeners)를 활용할 때와 같이 PHP의 `serialize` 함수를 사용하여 이벤트 객체가 직렬화될 경우 Eloquent 모델을 우아하게 직렬화합니다.

<a name="defining-listeners"></a>
## 리스너 정의하기

다음으로, 예제 이벤트에 대한 리스너를 살펴보겠습니다. 이벤트 리스너는 `handle` 메서드에서 이벤트 인스턴스를 수신합니다. `event:generate` 및 `make:listener` Artisan 명령어는 적절한 이벤트 클래스를 자동으로 가져오고 `handle` 메서드에서 이벤트를 타입 힌트합니다. `handle` 메서드 내에서 이벤트에 응답하는 데 필요한 모든 작업을 수행할 수 있습니다.

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;

    class SendShipmentNotification
    {
        /**
         * 이벤트 리스너를 생성합니다.
         */
        public function __construct()
        {
            // ...
        }

        /**
         * 이벤트를 처리합니다.
         */
        public function handle(OrderShipped $event): void
        {
            // $event->order를 사용하여 주문에 접근합니다...
        }
    }

> [!NOTE]
> 이벤트 리스너는 생성자에서 필요한 모든 종속성을 타입 힌트할 수도 있습니다. 모든 이벤트 리스너는 Laravel [서비스 컨테이너(Service Container)](/docs/{{version}}/container)를 통해 의존성이 해결되므로 종속성이 자동으로 주입됩니다.

<a name="stopping-the-propagation-of-an-event"></a>
#### 이벤트 전파 중지하기

때로는 이벤트가 다른 리스너에게 전파되는 것을 중지하고 싶을 수 있습니다. 리스너의 `handle` 메서드에서 `false`를 반환하면 됩니다.

<a name="queued-event-listeners"></a>
## 대기열 이벤트 리스너

리스너가 이메일 보내기 또는 HTTP 요청 같은 느린 작업을 수행하는 경우 리스너를 대기열에 넣으면 유용합니다. 대기열 리스너를 사용하기 전에 [큐를 구성](/docs/{{version}}/queues)하고 서버 또는 로컬 개발 환경에서 큐 워커를 시작해야 합니다.

리스너가 대기열에 추가되도록 지정하려면 리스너 클래스에 `ShouldQueue` 인터페이스를 추가합니다. `event:generate` 및 `make:listener` Artisan 명령어로 생성된 리스너는 이 인터페이스가 이미 현재 네임스페이스에 가져와져 있으므로 바로 사용할 수 있습니다.

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        // ...
    }

이게 전부입니다! 이제 이 리스너가 처리하는 이벤트가 발송되면, 이벤트 디스패처가 Laravel의 [큐 시스템](/docs/{{version}}/queues)을 사용하여 리스너를 자동으로 대기열에 추가합니다. 큐에서 리스너가 실행될 때 예외가 발생하지 않으면, 대기열 작업은 처리가 완료된 후 자동으로 삭제됩니다.

<a name="customizing-the-queue-connection-queue-name"></a>
#### 큐 연결, 이름 및 지연 시간 커스터마이징

이벤트 리스너의 큐 연결, 큐 이름 또는 큐 지연 시간을 커스터마이징하려면 리스너 클래스에 `$connection`, `$queue` 또는 `$delay` 속성을 정의할 수 있습니다.

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        /**
         * 작업이 전송되어야 하는 연결 이름입니다.
         *
         * @var string|null
         */
        public $connection = 'sqs';

        /**
         * 작업이 전송되어야 하는 큐 이름입니다.
         *
         * @var string|null
         */
        public $queue = 'listeners';

        /**
         * 작업이 처리되기까지의 시간(초)입니다.
         *
         * @var int
         */
        public $delay = 60;
    }

런타임에 리스너의 큐 연결, 큐 이름 또는 지연 시간을 정의하려면 리스너에 `viaConnection`, `viaQueue` 또는 `withDelay` 메서드를 정의할 수 있습니다.

    /**
     * 리스너의 큐 연결 이름을 가져옵니다.
     */
    public function viaConnection(): string
    {
        return 'sqs';
    }

    /**
     * 리스너의 큐 이름을 가져옵니다.
     */
    public function viaQueue(): string
    {
        return 'listeners';
    }

    /**
     * 작업이 처리되기까지의 시간(초)을 가져옵니다.
     */
    public function withDelay(OrderShipped $event): int
    {
        return $event->highPriority ? 0 : 60;
    }

<a name="conditionally-queueing-listeners"></a>
#### 조건부로 리스너를 대기열에 추가하기

때로는 런타임에만 사용할 수 있는 일부 데이터를 기반으로 리스너를 대기열에 추가할지 여부를 결정해야 할 수 있습니다. 이를 위해 리스너에 `shouldQueue` 메서드를 추가하여 리스너를 대기열에 추가할지 결정할 수 있습니다. `shouldQueue` 메서드가 `false`를 반환하면 리스너가 실행되지 않습니다.

    <?php

    namespace App\Listeners;

    use App\Events\OrderCreated;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class RewardGiftCard implements ShouldQueue
    {
        /**
         * 고객에게 기프트 카드를 보상합니다.
         */
        public function handle(OrderCreated $event): void
        {
            // ...
        }

        /**
         * 리스너를 대기열에 추가할지 여부를 결정합니다.
         */
        public function shouldQueue(OrderCreated $event): bool
        {
            return $event->order->subtotal >= 5000;
        }
    }

<a name="manually-interacting-with-the-queue"></a>
### 대기열과 수동으로 상호작용하기

리스너의 기본 큐 작업의 `delete` 및 `release` 메서드에 수동으로 접근해야 하는 경우, `Illuminate\Queue\InteractsWithQueue` 트레이트를 사용할 수 있습니다. 이 트레이트는 생성된 리스너에서 기본적으로 가져와지며 이러한 메서드에 대한 접근을 제공합니다.

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        use InteractsWithQueue;

        /**
         * 이벤트를 처리합니다.
         */
        public function handle(OrderShipped $event): void
        {
            if (true) {
                $this->release(30);
            }
        }
    }

<a name="queued-event-listeners-and-database-transactions"></a>
### 대기열 이벤트 리스너와 데이터베이스 트랜잭션

대기열 리스너가 데이터베이스 트랜잭션 내에서 발송되면, 데이터베이스 트랜잭션이 커밋되기 전에 큐에서 처리될 수 있습니다. 이런 경우, 데이터베이스 트랜잭션 중에 모델이나 데이터베이스 레코드에 대한 업데이트가 아직 데이터베이스에 반영되지 않을 수 있습니다. 또한, 트랜잭션 내에서 생성된 모델이나 데이터베이스 레코드가 데이터베이스에 존재하지 않을 수 있습니다. 리스너가 이러한 모델에 의존하는 경우, 대기열 리스너를 발송하는 작업이 처리될 때 예상치 못한 오류가 발생할 수 있습니다.

큐 연결의 `after_commit` 구성 옵션이 `false`로 설정된 경우에도 리스너 클래스에 `ShouldHandleEventsAfterCommit` 인터페이스를 구현하여 모든 열린 데이터베이스 트랜잭션이 커밋된 후에 특정 대기열 리스너가 발송되도록 지정할 수 있습니다.

    <?php

    namespace App\Listeners;

    use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class SendShipmentNotification implements ShouldQueue, ShouldHandleEventsAfterCommit
    {
        use InteractsWithQueue;
    }

> [!NOTE]
> 이러한 문제를 해결하는 방법에 대해 자세히 알아보려면 [큐 작업과 데이터베이스 트랜잭션](/docs/{{version}}/queues#jobs-and-database-transactions)에 관한 문서를 확인하세요.

<a name="handling-failed-jobs"></a>
### 실패한 작업 처리하기

때로는 대기열 이벤트 리스너가 실패할 수 있습니다. 대기열 리스너가 큐 워커에서 정의된 최대 시도 횟수를 초과하면 리스너에서 `failed` 메서드가 호출됩니다. `failed` 메서드는 이벤트 인스턴스와 실패를 유발한 `Throwable`을 수신합니다.

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;
    use Throwable;

    class SendShipmentNotification implements ShouldQueue
    {
        use InteractsWithQueue;

        /**
         * 이벤트를 처리합니다.
         */
        public function handle(OrderShipped $event): void
        {
            // ...
        }

        /**
         * 작업 실패를 처리합니다.
         */
        public function failed(OrderShipped $event, Throwable $exception): void
        {
            // ...
        }
    }

<a name="specifying-queued-listener-maximum-attempts"></a>
#### 대기열 리스너 최대 시도 횟수 지정하기

대기열 리스너 중 하나에 오류가 발생하는 경우, 무한정 재시도하는 것을 원하지 않을 것입니다. 따라서 Laravel은 리스너가 몇 번이나 또는 얼마 동안 시도될 수 있는지 지정하는 다양한 방법을 제공합니다.

리스너 클래스에 `$tries` 속성을 정의하여 리스너가 실패로 간주되기 전에 몇 번 시도될 수 있는지 지정할 수 있습니다.

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        use InteractsWithQueue;

        /**
         * 대기열 리스너가 시도될 수 있는 횟수입니다.
         *
         * @var int
         */
        public $tries = 5;
    }

리스너가 실패하기 전에 몇 번 시도될 수 있는지 정의하는 대신, 리스너가 더 이상 시도되지 않아야 하는 시간을 정의할 수 있습니다. 이렇게 하면 주어진 시간 내에 리스너가 원하는 횟수만큼 시도될 수 있습니다. 리스너가 더 이상 시도되지 않아야 하는 시간을 정의하려면 리스너 클래스에 `retryUntil` 메서드를 추가합니다. 이 메서드는 `DateTime` 인스턴스를 반환해야 합니다.

    use DateTime;

    /**
     * 리스너가 타임아웃되어야 하는 시간을 결정합니다.
     */
    public function retryUntil(): DateTime
    {
        return now()->addMinutes(5);
    }

<a name="dispatching-events"></a>
## 이벤트 발송하기

이벤트를 발송하려면 이벤트에서 정적 `dispatch` 메서드를 호출합니다. 이 메서드는 `Illuminate\Foundation\Events\Dispatchable` 트레이트에 의해 이벤트에서 사용할 수 있게 됩니다. `dispatch` 메서드에 전달된 모든 인수는 이벤트의 생성자에 전달됩니다.

    <?php

    namespace App\Http\Controllers;

    use App\Events\OrderShipped;
    use App\Http\Controllers\Controller;
    use App\Models\Order;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class OrderShipmentController extends Controller
    {
        /**
         * 주어진 주문을 배송합니다.
         */
        public function store(Request $request): RedirectResponse
        {
            $order = Order::findOrFail($request->order_id);

            // 주문 배송 로직...

            OrderShipped::dispatch($order);

            return redirect('/orders');
        }
    }

조건부로 이벤트를 발송하려면 `dispatchIf` 및 `dispatchUnless` 메서드를 사용할 수 있습니다.

    OrderShipped::dispatchIf($condition, $order);

    OrderShipped::dispatchUnless($condition, $order);

> [!NOTE]
> 테스트 시 특정 이벤트가 리스너를 실제로 트리거하지 않고 발송되었는지 확인하는 것이 유용할 수 있습니다. Laravel의 [내장 테스트 헬퍼](#testing)를 사용하면 간단히 할 수 있습니다.

<a name="dispatching-events-after-database-transactions"></a>
### 데이터베이스 트랜잭션 후 이벤트 발송하기

때로는 활성 데이터베이스 트랜잭션이 커밋된 후에만 이벤트를 발송하도록 Laravel에 지시하고 싶을 수 있습니다. 이를 위해 이벤트 클래스에 `ShouldDispatchAfterCommit` 인터페이스를 구현할 수 있습니다.

이 인터페이스는 현재 데이터베이스 트랜잭션이 커밋될 때까지 이벤트를 발송하지 않도록 Laravel에 지시합니다. 트랜잭션이 실패하면 이벤트가 폐기됩니다. 이벤트가 발송될 때 진행 중인 데이터베이스 트랜잭션이 없으면 이벤트가 즉시 발송됩니다.

    <?php

    namespace App\Events;

    use App\Models\Order;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
    use Illuminate\Foundation\Events\Dispatchable;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped implements ShouldDispatchAfterCommit
    {
        use Dispatchable, InteractsWithSockets, SerializesModels;

        /**
         * 새 이벤트 인스턴스를 생성합니다.
         */
        public function __construct(
            public Order $order,
        ) {}
    }

<a name="event-subscribers"></a>
## 이벤트 구독자

<a name="writing-event-subscribers"></a>
### 이벤트 구독자 작성하기

이벤트 구독자는 구독자 클래스 자체 내에서 여러 이벤트를 구독할 수 있는 클래스로, 단일 클래스 내에서 여러 이벤트 핸들러를 정의할 수 있습니다. 구독자는 이벤트 디스패처 인스턴스가 전달되는 `subscribe` 메서드를 정의해야 합니다. 주어진 디스패처에서 `listen` 메서드를 호출하여 이벤트 리스너를 등록할 수 있습니다.

    <?php

    namespace App\Listeners;

    use Illuminate\Auth\Events\Login;
    use Illuminate\Auth\Events\Logout;
    use Illuminate\Events\Dispatcher;

    class UserEventSubscriber
    {
        /**
         * 사용자 로그인 이벤트를 처리합니다.
         */
        public function handleUserLogin(Login $event): void {}

        /**
         * 사용자 로그아웃 이벤트를 처리합니다.
         */
        public function handleUserLogout(Logout $event): void {}

        /**
         * 구독자에 대한 리스너를 등록합니다.
         */
        public function subscribe(Dispatcher $events): void
        {
            $events->listen(
                Login::class,
                [UserEventSubscriber::class, 'handleUserLogin']
            );

            $events->listen(
                Logout::class,
                [UserEventSubscriber::class, 'handleUserLogout']
            );
        }
    }

이벤트 리스너 메서드가 구독자 자체 내에 정의된 경우, 구독자의 `subscribe` 메서드에서 이벤트와 메서드 이름의 배열을 반환하는 것이 더 편리할 수 있습니다. Laravel은 이벤트 리스너를 등록할 때 구독자의 클래스 이름을 자동으로 결정합니다.

    <?php

    namespace App\Listeners;

    use Illuminate\Auth\Events\Login;
    use Illuminate\Auth\Events\Logout;
    use Illuminate\Events\Dispatcher;

    class UserEventSubscriber
    {
        /**
         * 사용자 로그인 이벤트를 처리합니다.
         */
        public function handleUserLogin(Login $event): void {}

        /**
         * 사용자 로그아웃 이벤트를 처리합니다.
         */
        public function handleUserLogout(Logout $event): void {}

        /**
         * 구독자에 대한 리스너를 등록합니다.
         *
         * @return array<string, string>
         */
        public function subscribe(Dispatcher $events): array
        {
            return [
                Login::class => 'handleUserLogin',
                Logout::class => 'handleUserLogout',
            ];
        }
    }

<a name="registering-event-subscribers"></a>
### 이벤트 구독자 등록하기

구독자를 작성한 후, 이벤트 디스패처에 등록할 준비가 되었습니다. `EventServiceProvider`의 `$subscribe` 속성을 사용하여 구독자를 등록할 수 있습니다. 예를 들어, `UserEventSubscriber`를 목록에 추가해 보겠습니다.

    <?php

    namespace App\Providers;

    use App\Listeners\UserEventSubscriber;
    use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

    class EventServiceProvider extends ServiceProvider
    {
        /**
         * 애플리케이션의 이벤트 리스너 매핑입니다.
         *
         * @var array
         */
        protected $listen = [
            // ...
        ];

        /**
         * 등록할 구독자 클래스입니다.
         *
         * @var array
         */
        protected $subscribe = [
            UserEventSubscriber::class,
        ];
    }

<a name="testing"></a>
## 테스트

이벤트를 발송하는 코드를 테스트할 때, 리스너의 코드는 해당 이벤트를 발송하는 코드와 별도로 직접 테스트할 수 있으므로 Laravel이 이벤트의 리스너를 실제로 실행하지 않도록 지시할 수 있습니다. 물론, 리스너 자체를 테스트하려면 테스트에서 리스너 인스턴스를 인스턴스화하고 `handle` 메서드를 직접 호출할 수 있습니다.

`Event` 파사드의 `fake` 메서드를 사용하면 리스너가 실행되지 않도록 하고, 테스트 대상 코드를 실행한 다음, `assertDispatched`, `assertNotDispatched`, `assertNothingDispatched` 메서드를 사용하여 애플리케이션에서 발송된 이벤트를 확인할 수 있습니다.

    <?php

    namespace Tests\Feature;

    use App\Events\OrderFailedToShip;
    use App\Events\OrderShipped;
    use Illuminate\Support\Facades\Event;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 주문 배송을 테스트합니다.
         */
        public function test_orders_can_be_shipped(): void
        {
            Event::fake();

            // 주문 배송 수행...

            // 이벤트가 발송되었는지 확인...
            Event::assertDispatched(OrderShipped::class);

            // 이벤트가 두 번 발송되었는지 확인...
            Event::assertDispatched(OrderShipped::class, 2);

            // 이벤트가 발송되지 않았는지 확인...
            Event::assertNotDispatched(OrderFailedToShip::class);

            // 이벤트가 전혀 발송되지 않았는지 확인...
            Event::assertNothingDispatched();
        }
    }

주어진 "진실 테스트"를 통과하는 이벤트가 발송되었는지 확인하기 위해 `assertDispatched` 또는 `assertNotDispatched` 메서드에 클로저를 전달할 수 있습니다. 주어진 진실 테스트를 통과하는 이벤트가 하나 이상 발송되면 확인이 성공합니다.

    Event::assertDispatched(function (OrderShipped $event) use ($order) {
        return $event->order->id === $order->id;
    });

이벤트 리스너가 특정 이벤트를 수신하고 있는지 단순히 확인하고 싶다면 `assertListening` 메서드를 사용할 수 있습니다.

    Event::assertListening(
        OrderShipped::class,
        SendShipmentNotification::class
    );

> [!WARNING]
> `Event::fake()`를 호출한 후에는 어떤 이벤트 리스너도 실행되지 않습니다. 따라서 테스트에서 모델의 `creating` 이벤트 중에 UUID를 생성하는 것과 같이 이벤트에 의존하는 모델 팩토리를 사용하는 경우, 팩토리를 사용한 **후에** `Event::fake()`를 호출해야 합니다.

<a name="faking-a-subset-of-events"></a>
### 일부 이벤트만 Fake 처리하기

특정 이벤트 집합에 대해서만 이벤트 리스너를 fake 처리하려면 해당 이벤트를 `fake` 또는 `fakeFor` 메서드에 전달할 수 있습니다.

    /**
     * 주문 처리를 테스트합니다.
     */
    public function test_orders_can_be_processed(): void
    {
        Event::fake([
            OrderCreated::class,
        ]);

        $order = Order::factory()->create();

        Event::assertDispatched(OrderCreated::class);

        // 다른 이벤트는 정상적으로 발송됩니다...
        $order->update([...]);
    }

`except` 메서드를 사용하여 지정된 이벤트 집합을 제외한 모든 이벤트를 fake 처리할 수 있습니다.

    Event::fake()->except([
        OrderCreated::class,
    ]);

<a name="scoped-event-fakes"></a>
### 범위 지정 이벤트 Fake

테스트의 일부분에 대해서만 이벤트 리스너를 fake 처리하려면 `fakeFor` 메서드를 사용할 수 있습니다.

    <?php

    namespace Tests\Feature;

    use App\Events\OrderCreated;
    use App\Models\Order;
    use Illuminate\Support\Facades\Event;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 주문 처리를 테스트합니다.
         */
        public function test_orders_can_be_processed(): void
        {
            $order = Event::fakeFor(function () {
                $order = Order::factory()->create();

                Event::assertDispatched(OrderCreated::class);

                return $order;
            });

            // 이벤트는 정상적으로 발송되고 옵저버가 실행됩니다 ...
            $order->update([...]);
        }
    }

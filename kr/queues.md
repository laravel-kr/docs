# 큐(Queues)

- [소개](#introduction)
    - [커넥션 vs. 큐](#connections-vs-queues)
    - [드라이버 참고 사항 및 전제 조건](#driver-prerequisites)
- [잡 생성](#creating-jobs)
    - [잡 클래스 생성하기](#generating-job-classes)
    - [클래스 구조](#class-structure)
    - [고유 잡](#unique-jobs)
    - [암호화된 잡](#encrypted-jobs)
- [잡 미들웨어](#job-middleware)
    - [속도 제한](#rate-limiting)
    - [잡 중복 실행 방지](#preventing-job-overlaps)
    - [예외 스로틀링](#throttling-exceptions)
    - [잡 건너뛰기](#skipping-jobs)
- [잡 디스패치](#dispatching-jobs)
    - [지연된 디스패치](#delayed-dispatching)
    - [동기 디스패치](#synchronous-dispatching)
    - [잡 & 데이터베이스 트랜잭션](#jobs-and-database-transactions)
    - [잡 체이닝](#job-chaining)
    - [큐 및 커넥션 커스터마이징](#customizing-the-queue-and-connection)
    - [최대 잡 시도 횟수 / 타임아웃 값 지정](#max-job-attempts-and-timeout)
    - [오류 처리](#error-handling)
- [잡 일괄 처리](#job-batching)
    - [일괄 처리 가능한 잡 정의하기](#defining-batchable-jobs)
    - [배치 디스패치하기](#dispatching-batches)
    - [체인과 배치](#chains-and-batches)
    - [배치에 잡 추가하기](#adding-jobs-to-batches)
    - [배치 검사하기](#inspecting-batches)
    - [배치 취소하기](#cancelling-batches)
    - [배치 실패](#batch-failures)
    - [배치 정리하기](#pruning-batches)
    - [DynamoDB에 배치 저장하기](#storing-batches-in-dynamodb)
- [클로저 큐잉](#queueing-closures)
- [큐 워커 실행](#running-the-queue-worker)
    - [`queue:work` 명령어](#the-queue-work-command)
    - [큐 우선순위](#queue-priorities)
    - [큐 워커와 배포](#queue-workers-and-deployment)
    - [잡 만료 및 타임아웃](#job-expirations-and-timeouts)
- [Supervisor 설정](#supervisor-configuration)
- [실패한 잡 처리](#dealing-with-failed-jobs)
    - [실패한 잡 정리하기](#cleaning-up-after-failed-jobs)
    - [실패한 잡 재시도하기](#retrying-failed-jobs)
    - [누락된 모델 무시하기](#ignoring-missing-models)
    - [실패한 잡 정리하기](#pruning-failed-jobs)
    - [DynamoDB에 실패한 잡 저장하기](#storing-failed-jobs-in-dynamodb)
    - [실패한 잡 저장 비활성화](#disabling-failed-job-storage)
    - [실패한 잡 이벤트](#failed-job-events)
- [큐에서 잡 삭제하기](#clearing-jobs-from-queues)
- [큐 모니터링](#monitoring-your-queues)
- [테스팅](#testing)
    - [잡의 일부만 페이킹](#faking-a-subset-of-jobs)
    - [잡 체인 테스트](#testing-job-chains)
    - [잡 배치 테스트](#testing-job-batches)
    - [잡 / 큐 상호작용 테스트](#testing-job-queue-interactions)
- [잡 이벤트](#job-events)

<a name="introduction"></a>
## 소개

웹 애플리케이션을 구축하는 동안 업로드된 CSV 파일을 파싱하고 저장하는 것과 같이 일반적인 웹 요청 중에 수행하기에는 너무 오래 걸리는 작업이 있을 수 있습니다. 다행히 Laravel을 사용하면 백그라운드에서 처리될 수 있는 큐에 넣은 잡을 쉽게 만들 수 있습니다. 시간이 많이 걸리는 작업을 큐로 이동하면 애플리케이션이 웹 요청에 빠르게 응답하고 고객에게 더 나은 사용자 경험을 제공할 수 있습니다.

Laravel 큐는 [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io) 또는 관계형 데이터베이스와 같은 다양한 큐 백엔드에서 통합된 큐잉 API를 제공합니다.

Laravel의 큐 설정 옵션은 애플리케이션의 `config/queue.php` 설정 파일에 저장됩니다. 이 파일에서 데이터베이스, [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), [Beanstalkd](https://beanstalkd.github.io/) 드라이버를 포함하여 프레임워크에 포함된 각 큐 드라이버에 대한 커넥션 설정과 잡을 즉시 실행하는 동기 드라이버(로컬 개발 중에 사용)를 찾을 수 있습니다. 큐에 넣은 잡을 삭제하는 `null` 큐 드라이버도 포함되어 있습니다.

> [!NOTE]
> Laravel은 이제 Redis 기반 큐를 위한 아름다운 대시보드와 설정 시스템인 Horizon을 제공합니다. 자세한 내용은 전체 [Horizon 문서](/docs/{{version}}/horizon)를 확인하세요.

<a name="connections-vs-queues"></a>
### 커넥션 vs. 큐

Laravel 큐를 시작하기 전에 "커넥션"과 "큐"의 구분을 이해하는 것이 중요합니다. `config/queue.php` 설정 파일에는 `connections` 설정 배열이 있습니다. 이 옵션은 Amazon SQS, Beanstalk 또는 Redis와 같은 백엔드 큐 서비스에 대한 커넥션을 정의합니다. 그러나 주어진 큐 커넥션에는 큐에 넣은 잡의 다른 스택 또는 더미로 생각할 수 있는 여러 "큐"가 있을 수 있습니다.

`queue` 설정 파일의 각 커넥션 설정 예제에는 `queue` 속성이 포함되어 있습니다. 이것은 잡이 주어진 커넥션으로 전송될 때 디스패치되는 기본 큐입니다. 즉, 어떤 큐로 디스패치해야 하는지 명시적으로 정의하지 않고 잡을 디스패치하면 잡은 커넥션 설정의 `queue` 속성에 정의된 큐에 배치됩니다.

```php
use App\Jobs\ProcessPodcast;

// This job is sent to the default connection's default queue...
ProcessPodcast::dispatch();

// This job is sent to the default connection's "emails" queue...
ProcessPodcast::dispatch()->onQueue('emails');
```

일부 애플리케이션은 잡을 여러 큐에 푸시할 필요가 없을 수 있으며, 대신 하나의 단순한 큐를 갖는 것을 선호할 수 있습니다. 그러나 Laravel 큐 워커가 우선순위별로 처리해야 하는 큐를 지정할 수 있기 때문에, 잡을 여러 큐로 푸시하는 것은 잡 처리 방법을 우선순위화하거나 세분화하려는 애플리케이션에 특히 유용할 수 있습니다. 예를 들어, 잡을 `high` 큐에 푸시하면 더 높은 처리 우선순위를 부여하는 워커를 실행할 수 있습니다.

```shell
php artisan queue:work --queue=high,default
```

<a name="driver-prerequisites"></a>
### 드라이버 참고 사항 및 전제 조건

<a name="database"></a>
#### 데이터베이스

`database` 큐 드라이버를 사용하려면 잡을 보관할 데이터베이스 테이블이 필요합니다. 일반적으로 이것은 Laravel의 기본 `0001_01_01_000002_create_jobs_table.php` [데이터베이스 마이그레이션](/docs/{{version}}/migrations)에 포함되어 있습니다. 그러나 애플리케이션에 이 마이그레이션이 포함되어 있지 않으면 `make:queue-table` Artisan 명령을 사용하여 생성할 수 있습니다.

```shell
php artisan make:queue-table

php artisan migrate
```

<a name="redis"></a>
#### Redis

`redis` 큐 드라이버를 사용하려면 `config/database.php` 설정 파일에서 Redis 데이터베이스 커넥션을 설정해야 합니다.

> [!WARNING]
> `serializer` 및 `compression` Redis 옵션은 `redis` 큐 드라이버에서 지원되지 않습니다.

**Redis 클러스터**

Redis 큐 커넥션이 Redis 클러스터를 사용하는 경우 큐 이름에 [키 해시 태그](https://redis.io/docs/reference/cluster-spec/#hash-tags)가 포함되어야 합니다. 이것은 주어진 큐의 모든 Redis 키가 동일한 해시 슬롯에 배치되도록 하기 위해 필요합니다.

```php
'redis' => [
    'driver' => 'redis',
    'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
    'queue' => env('REDIS_QUEUE', '{default}'),
    'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 90),
    'block_for' => null,
    'after_commit' => false,
],
```

**블로킹**

Redis 큐를 사용할 때 `block_for` 설정 옵션을 사용하여 워커 루프를 반복하고 Redis 데이터베이스를 다시 폴링하기 전에 드라이버가 잡을 사용할 수 있을 때까지 기다려야 하는 시간을 지정할 수 있습니다.

큐 로드에 따라 이 값을 조정하면 새 잡을 위해 Redis 데이터베이스를 지속적으로 폴링하는 것보다 더 효율적일 수 있습니다. 예를 들어, 잡을 사용할 수 있을 때까지 5초 동안 드라이버가 블록해야 함을 나타내도록 값을 `5`로 설정할 수 있습니다.

```php
'redis' => [
    'driver' => 'redis',
    'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
    'queue' => env('REDIS_QUEUE', 'default'),
    'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 90),
    'block_for' => 5,
    'after_commit' => false,
],
```

> [!WARNING]
> `block_for`를 `0`으로 설정하면 잡을 사용할 수 있을 때까지 큐 워커가 무기한 블록됩니다. 이로 인해 다음 잡이 처리될 때까지 `SIGTERM`과 같은 신호가 처리되지 않습니다.

<a name="other-driver-prerequisites"></a>
#### 기타 드라이버 전제 조건

나열된 큐 드라이버에는 다음 의존성이 필요합니다. 이러한 의존성은 Composer 패키지 관리자를 통해 설치할 수 있습니다.

<div class="content-list" markdown="1">

- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ~5.0`
- Redis: `predis/predis ~2.0` 또는 phpredis PHP 확장
- [MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/queues/): `mongodb/laravel-mongodb`

</div>

<a name="creating-jobs"></a>
## 잡 생성

<a name="generating-job-classes"></a>
### 잡 클래스 생성하기

기본적으로 애플리케이션의 모든 큐 가능한 잡은 `app/Jobs` 디렉토리에 저장됩니다. `app/Jobs` 디렉토리가 존재하지 않으면 `make:job` Artisan 명령을 실행할 때 생성됩니다.

```shell
php artisan make:job ProcessPodcast
```

생성된 클래스는 `Illuminate\Contracts\Queue\ShouldQueue` 인터페이스를 구현하여 잡이 비동기적으로 실행되도록 큐에 푸시되어야 함을 Laravel에 나타냅니다.

> [!NOTE]
> 잡 스텁은 [스텁 퍼블리싱](/docs/{{version}}/artisan#stub-customization)을 사용하여 커스터마이징할 수 있습니다.

<a name="class-structure"></a>
### 클래스 구조

잡 클래스는 매우 간단하며, 일반적으로 잡이 큐에서 처리될 때 호출되는 `handle` 메서드만 포함합니다. 시작하기 위해 예제 잡 클래스를 살펴보겠습니다. 이 예제에서는 팟캐스트 게시 서비스를 관리하고 업로드된 팟캐스트 파일을 게시하기 전에 처리해야 한다고 가정합니다.

```php
<?php

namespace App\Jobs;

use App\Models\Podcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AudioProcessor $processor): void
    {
        // Process uploaded podcast...
    }
}
```

이 예제에서 큐에 넣은 잡의 생성자에 [Eloquent 모델](/docs/{{version}}/eloquent)을 직접 전달할 수 있었습니다. 잡이 사용하는 `Queueable` 트레이트 덕분에 Eloquent 모델과 로드된 관계는 잡이 처리될 때 우아하게 직렬화되고 역직렬화됩니다.

큐에 넣은 잡이 생성자에서 Eloquent 모델을 받으면 모델의 식별자만 큐에 직렬화됩니다. 잡이 실제로 처리될 때 큐 시스템은 데이터베이스에서 전체 모델 인스턴스와 로드된 관계를 자동으로 다시 검색합니다. 이러한 모델 직렬화 접근 방식을 사용하면 큐 드라이버로 전송되는 잡 페이로드를 훨씬 작게 만들 수 있습니다.

<a name="handle-method-dependency-injection"></a>
#### `handle` 메서드 의존성 주입

`handle` 메서드는 잡이 큐에서 처리될 때 호출됩니다. 잡의 `handle` 메서드에 의존성을 타입 힌트할 수 있습니다. Laravel [서비스 컨테이너](/docs/{{version}}/container)는 이러한 의존성을 자동으로 주입합니다.

컨테이너가 `handle` 메서드에 의존성을 주입하는 방법을 완전히 제어하려면 컨테이너의 `bindMethod` 메서드를 사용할 수 있습니다. `bindMethod` 메서드는 잡과 컨테이너를 받는 콜백을 허용합니다. 콜백 내에서 원하는 방식으로 `handle` 메서드를 자유롭게 호출할 수 있습니다. 일반적으로 `App\Providers\AppServiceProvider` [서비스 프로바이더](/docs/{{version}}/providers)의 `boot` 메서드에서 이 메서드를 호출해야 합니다.

```php
use App\Jobs\ProcessPodcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Foundation\Application;

$this->app->bindMethod([ProcessPodcast::class, 'handle'], function (ProcessPodcast $job, Application $app) {
    return $job->handle($app->make(AudioProcessor::class));
});
```

> [!WARNING]
> 원시 이미지 콘텐츠와 같은 바이너리 데이터는 큐에 넣은 잡에 전달하기 전에 `base64_encode` 함수를 통해 전달해야 합니다. 그렇지 않으면 잡이 큐에 배치될 때 JSON으로 제대로 직렬화되지 않을 수 있습니다.

<a name="handling-relationships"></a>
#### 큐에 넣은 관계

잡이 큐에 넣어질 때 모든 로드된 Eloquent 모델 관계도 직렬화되므로 직렬화된 잡 문자열이 때때로 상당히 커질 수 있습니다. 또한 잡이 역직렬화되고 모델 관계가 데이터베이스에서 다시 검색될 때 전체적으로 검색됩니다. 잡 큐잉 프로세스 중에 모델이 직렬화되기 전에 적용된 이전 관계 제약 조건은 잡이 역직렬화될 때 적용되지 않습니다. 따라서 주어진 관계의 하위 집합으로 작업하려면 큐에 넣은 잡 내에서 해당 관계를 다시 제약해야 합니다.

또는 관계가 직렬화되는 것을 방지하려면 속성 값을 설정할 때 모델에서 `withoutRelations` 메서드를 호출할 수 있습니다. 이 메서드는 로드된 관계 없이 모델의 인스턴스를 반환합니다.

```php
/**
 * Create a new job instance.
 */
public function __construct(
    Podcast $podcast,
) {
    $this->podcast = $podcast->withoutRelations();
}
```

PHP 생성자 속성 프로모션을 사용하고 Eloquent 모델이 관계를 직렬화하지 않아야 함을 나타내려면 `WithoutRelations` 속성을 사용할 수 있습니다.

```php
use Illuminate\Queue\Attributes\WithoutRelations;

/**
 * Create a new job instance.
 */
public function __construct(
    #[WithoutRelations]
    public Podcast $podcast,
) {}
```

잡이 단일 모델 대신 Eloquent 모델의 컬렉션 또는 배열을 받는 경우 잡이 역직렬화되고 실행될 때 해당 컬렉션 내의 모델은 관계가 복원되지 않습니다. 이는 많은 수의 모델을 처리하는 잡에서 과도한 리소스 사용을 방지하기 위함입니다.

<a name="unique-jobs"></a>
### 고유 잡

> [!WARNING]
> 고유 잡에는 [잠금](/docs/{{version}}/cache#atomic-locks)을 지원하는 캐시 드라이버가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file` 및 `array` 캐시 드라이버가 원자 잠금을 지원합니다. 또한 고유 잡 제약 조건은 배치 내의 잡에는 적용되지 않습니다.

때때로 특정 잡의 인스턴스가 언제든지 큐에 하나만 있도록 하고 싶을 수 있습니다. 잡 클래스에 `ShouldBeUnique` 인터페이스를 구현하여 이를 수행할 수 있습니다. 이 인터페이스는 클래스에 추가 메서드를 정의할 필요가 없습니다.

```php
<?php

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    // ...
}
```

위 예제에서 `UpdateSearchIndex` 잡은 고유합니다. 따라서 잡의 다른 인스턴스가 이미 큐에 있고 처리가 완료되지 않은 경우 잡이 디스패치되지 않습니다.

특정 경우에 잡을 고유하게 만드는 특정 "키"를 정의하거나 잡이 더 이상 고유하지 않게 되는 타임아웃을 지정하고 싶을 수 있습니다. 이를 수행하려면 잡 클래스에 `uniqueId` 및 `uniqueFor` 속성 또는 메서드를 정의할 수 있습니다.

```php
<?php

use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    /**
     * The product instance.
     *
     * @var \App\Product
     */
    public $product;

    /**
     * The number of seconds after which the job's unique lock will be released.
     *
     * @var int
     */
    public $uniqueFor = 3600;

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return $this->product->id;
    }
}
```

위 예제에서 `UpdateSearchIndex` 잡은 제품 ID로 고유합니다. 따라서 기존 잡이 처리를 완료할 때까지 동일한 제품 ID를 가진 잡의 새 디스패치는 무시됩니다. 또한 기존 잡이 1시간 내에 처리되지 않으면 고유 잠금이 해제되고 동일한 고유 키를 가진 다른 잡이 큐에 디스패치될 수 있습니다.

> [!WARNING]
> 애플리케이션이 여러 웹 서버 또는 컨테이너에서 잡을 디스패치하는 경우 모든 서버가 동일한 중앙 캐시 서버와 통신하여 Laravel이 잡이 고유한지 정확하게 판단할 수 있도록 해야 합니다.

<a name="keeping-jobs-unique-until-processing-begins"></a>
#### 처리 시작까지 잡을 고유하게 유지

기본적으로 고유 잡은 잡이 처리를 완료하거나 모든 재시도에 실패한 후 "잠금 해제"됩니다. 그러나 처리되기 전에 잡을 즉시 잠금 해제하려는 상황이 있을 수 있습니다. 이를 수행하려면 잡이 `ShouldBeUnique` 계약 대신 `ShouldBeUniqueUntilProcessing` 계약을 구현해야 합니다.

```php
<?php

use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUniqueUntilProcessing
{
    // ...
}
```

<a name="unique-job-locks"></a>
#### 고유 잡 잠금

내부적으로 `ShouldBeUnique` 잡이 디스패치되면 Laravel은 `uniqueId` 키로 [잠금](/docs/{{version}}/cache#atomic-locks)을 획득하려고 시도합니다. 잠금이 획득되지 않으면 잡이 디스패치되지 않습니다. 이 잠금은 잡이 처리를 완료하거나 모든 재시도에 실패하면 해제됩니다. 기본적으로 Laravel은 기본 캐시 드라이버를 사용하여 이 잠금을 획득합니다. 그러나 잠금 획득을 위해 다른 드라이버를 사용하려면 사용해야 하는 캐시 드라이버를 반환하는 `uniqueVia` 메서드를 정의할 수 있습니다.

```php
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    // ...

    /**
     * Get the cache driver for the unique job lock.
     */
    public function uniqueVia(): Repository
    {
        return Cache::driver('redis');
    }
}
```

> [!NOTE]
> 잡의 동시 처리만 제한해야 하는 경우 [WithoutOverlapping](/docs/{{version}}/queues#preventing-job-overlaps) 잡 미들웨어를 대신 사용하세요.

<a name="encrypted-jobs"></a>
### 암호화된 잡

Laravel을 사용하면 [암호화](/docs/{{version}}/encryption)를 통해 잡 데이터의 프라이버시와 무결성을 보장할 수 있습니다. 시작하려면 잡 클래스에 `ShouldBeEncrypted` 인터페이스를 추가하기만 하면 됩니다. 이 인터페이스가 클래스에 추가되면 Laravel은 큐에 푸시하기 전에 잡을 자동으로 암호화합니다.

```php
<?php

use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateSearchIndex implements ShouldQueue, ShouldBeEncrypted
{
    // ...
}
```

<a name="job-middleware"></a>
## 잡 미들웨어

잡 미들웨어를 사용하면 큐에 넣은 잡 실행 주위에 사용자 지정 논리를 래핑하여 잡 자체의 보일러플레이트를 줄일 수 있습니다. 예를 들어, Laravel의 Redis 속도 제한 기능을 활용하여 5초마다 하나의 잡만 처리할 수 있도록 하는 다음 `handle` 메서드를 고려하세요.

```php
use Illuminate\Support\Facades\Redis;

/**
 * Execute the job.
 */
public function handle(): void
{
    Redis::throttle('key')->block(0)->allow(1)->every(5)->then(function () {
        info('Lock obtained...');

        // Handle job...
    }, function () {
        // Could not obtain lock...

        return $this->release(5);
    });
}
```

이 코드는 유효하지만 `handle` 메서드의 구현은 Redis 속도 제한 로직으로 인해 복잡해집니다. 또한 이 속도 제한 로직은 속도 제한하려는 다른 모든 잡에 대해 중복되어야 합니다.

handle 메서드에서 속도 제한하는 대신 속도 제한을 처리하는 잡 미들웨어를 정의할 수 있습니다. Laravel에는 잡 미들웨어의 기본 위치가 없으므로 애플리케이션의 어디에나 잡 미들웨어를 배치할 수 있습니다. 이 예제에서는 미들웨어를 `app/Jobs/Middleware` 디렉토리에 배치합니다.

```php
<?php

namespace App\Jobs\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;

class RateLimited
{
    /**
     * Process the queued job.
     *
     * @param  \Closure(object): void  $next
     */
    public function handle(object $job, Closure $next): void
    {
        Redis::throttle('key')
            ->block(0)->allow(1)->every(5)
            ->then(function () use ($job, $next) {
                // Lock obtained...

                $next($job);
            }, function () use ($job) {
                // Could not obtain lock...

                $job->release(5);
            });
    }
}
```

보시다시피 [라우트 미들웨어](/docs/{{version}}/middleware)와 마찬가지로 잡 미들웨어는 처리 중인 잡과 잡 처리를 계속하기 위해 호출해야 하는 콜백을 받습니다.

잡 미들웨어를 생성한 후 잡의 `middleware` 메서드에서 반환하여 잡에 연결할 수 있습니다. 이 메서드는 `make:job` Artisan 명령으로 스캐폴딩된 잡에는 존재하지 않으므로 잡 클래스에 수동으로 추가해야 합니다.

```php
use App\Jobs\Middleware\RateLimited;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited];
}
```

> [!NOTE]
> 잡 미들웨어는 큐 가능한 이벤트 리스너, 메일러블 및 알림에도 할당할 수 있습니다.

<a name="rate-limiting"></a>
### 속도 제한

고유한 속도 제한 잡 미들웨어를 작성하는 방법을 방금 시연했지만, Laravel은 실제로 잡을 속도 제한하는 데 활용할 수 있는 속도 제한 미들웨어를 포함합니다. [라우트 속도 제한기](/docs/{{version}}/routing#defining-rate-limiters)와 마찬가지로 잡 속도 제한기는 `RateLimiter` 파사드의 `for` 메서드를 사용하여 정의됩니다.

예를 들어, 프리미엄 고객에게는 이러한 제한을 부과하지 않으면서 사용자가 시간당 한 번 데이터를 백업할 수 있도록 허용하고 싶을 수 있습니다. 이를 수행하려면 `AppServiceProvider`의 `boot` 메서드에서 `RateLimiter`를 정의할 수 있습니다.

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    RateLimiter::for('backups', function (object $job) {
        return $job->user->vipCustomer()
            ? Limit::none()
            : Limit::perHour(1)->by($job->user->id);
    });
}
```

위 예제에서는 시간별 속도 제한을 정의했습니다. 그러나 `perMinute` 메서드를 사용하여 분 단위로 속도 제한을 쉽게 정의할 수 있습니다. 또한 속도 제한의 `by` 메서드에 원하는 값을 전달할 수 있습니다. 그러나 이 값은 대부분 고객별로 속도 제한을 세분화하는 데 사용됩니다.

```php
return Limit::perMinute(50)->by($job->user->id);
```

속도 제한을 정의한 후 `Illuminate\Queue\Middleware\RateLimited` 미들웨어를 사용하여 잡에 속도 제한기를 연결할 수 있습니다. 잡이 속도 제한을 초과할 때마다 이 미들웨어는 속도 제한 기간에 따라 적절한 지연으로 잡을 다시 큐에 릴리스합니다.

```php
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited('backups')];
}
```

속도 제한된 잡을 다시 큐에 릴리스하면 여전히 잡의 총 `attempts` 횟수가 증가합니다. 잡 클래스의 `tries` 및 `maxExceptions` 속성을 적절히 조정할 수 있습니다. 또는 [retryUntil 메서드](#time-based-attempts)를 사용하여 잡이 더 이상 시도되지 않아야 할 때까지의 시간을 정의할 수 있습니다.

`releaseAfter` 메서드를 사용하여 릴리스된 잡이 다시 시도되기 전에 경과해야 하는 시간(초)을 지정할 수도 있습니다.

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->releaseAfter(60)];
}
```

속도 제한될 때 잡이 재시도되지 않게 하려면 `dontRelease` 메서드를 사용할 수 있습니다.

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->dontRelease()];
}
```

> [!NOTE]
> Redis를 사용하는 경우 Redis에 맞게 미세 조정되고 기본 속도 제한 미들웨어보다 더 효율적인 `Illuminate\Queue\Middleware\RateLimitedWithRedis` 미들웨어를 사용할 수 있습니다.

<a name="preventing-job-overlaps"></a>
### 잡 중복 실행 방지

Laravel에는 임의의 키를 기반으로 잡 중복을 방지할 수 있는 `Illuminate\Queue\Middleware\WithoutOverlapping` 미들웨어가 포함되어 있습니다. 이것은 큐에 넣은 잡이 한 번에 하나의 잡만 수정해야 하는 리소스를 수정하는 경우 유용할 수 있습니다.

예를 들어, 사용자의 신용 점수를 업데이트하는 큐에 넣은 잡이 있고 동일한 사용자 ID에 대한 신용 점수 업데이트 잡 중복을 방지하려고 한다고 가정해 보겠습니다. 이를 수행하려면 잡의 `middleware` 메서드에서 `WithoutOverlapping` 미들웨어를 반환할 수 있습니다.

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new WithoutOverlapping($this->user->id)];
}
```

동일한 유형의 중복된 잡은 다시 큐에 릴리스됩니다. 릴리스된 잡이 다시 시도되기 전에 경과해야 하는 시간(초)을 지정할 수도 있습니다.

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->releaseAfter(60)];
}
```

중복된 잡이 재시도되지 않도록 즉시 삭제하려면 `dontRelease` 메서드를 사용할 수 있습니다.

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->dontRelease()];
}
```

`WithoutOverlapping` 미들웨어는 Laravel의 원자 잠금 기능으로 구동됩니다. 때때로 잡이 예기치 않게 실패하거나 잠금이 해제되지 않는 방식으로 타임아웃될 수 있습니다. 따라서 `expireAfter` 메서드를 사용하여 잠금 만료 시간을 명시적으로 정의할 수 있습니다. 예를 들어 아래 예제는 잡이 처리를 시작한 후 3분 후에 `WithoutOverlapping` 잠금을 해제하도록 Laravel에 지시합니다.

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->expireAfter(180)];
}
```

> [!WARNING]
> `WithoutOverlapping` 미들웨어에는 [잠금](/docs/{{version}}/cache#atomic-locks)을 지원하는 캐시 드라이버가 필요합니다. 현재 `memcached`, `redis`, `dynamodb`, `database`, `file` 및 `array` 캐시 드라이버가 원자 잠금을 지원합니다.

<a name="sharing-lock-keys"></a>
#### 잡 클래스 간 잠금 키 공유

기본적으로 `WithoutOverlapping` 미들웨어는 동일한 클래스의 잡 중복만 방지합니다. 따라서 두 개의 다른 잡 클래스가 동일한 잠금 키를 사용하더라도 중복이 방지되지 않습니다. 그러나 `shared` 메서드를 사용하여 Laravel이 잡 클래스 전체에 키를 적용하도록 지시할 수 있습니다.

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

class ProviderIsDown
{
    // ...

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}

class ProviderIsUp
{
    // ...

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}
```

<a name="throttling-exceptions"></a>
### 예외 스로틀링

Laravel에는 예외를 스로틀할 수 있는 `Illuminate\Queue\Middleware\ThrottlesExceptions` 미들웨어가 포함되어 있습니다. 잡이 주어진 수의 예외를 발생시키면 지정된 시간 간격이 지나기 전까지 잡을 실행하려는 모든 추가 시도가 지연됩니다. 이 미들웨어는 불안정한 서드파티 서비스와 상호 작용하는 잡에 특히 유용합니다.

예를 들어, 예외를 발생시키기 시작하는 서드파티 API와 상호 작용하는 큐에 넣은 잡을 가정해 보겠습니다. 예외를 스로틀하려면 잡의 `middleware` 메서드에서 `ThrottlesExceptions` 미들웨어를 반환할 수 있습니다. 일반적으로 이 미들웨어는 [시간 기반 시도](#time-based-attempts)를 구현하는 잡과 함께 사용해야 합니다.

```php
use DateTime;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new ThrottlesExceptions(10, 5 * 60)];
}

/**
 * Determine the time at which the job should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(30);
}
```

미들웨어가 허용하는 첫 번째 생성자 인수는 스로틀되기 전에 잡이 발생시킬 수 있는 예외 수이고, 두 번째 생성자 인수는 잡이 스로틀된 후 다시 시도되기 전에 경과해야 하는 시간(초)입니다. 위 코드 예제에서 잡이 10개의 연속적인 예외를 발생시키면 30분 시간 제한 내에서 5분 후에 잡을 다시 시도합니다.

잡이 예외를 발생시키지만 예외 임계값에 아직 도달하지 않은 경우 잡은 일반적으로 즉시 재시도됩니다. 그러나 잡에 미들웨어를 연결할 때 `backoff` 메서드를 호출하여 이러한 잡이 지연되어야 하는 분 수를 지정할 수 있습니다.

```php
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 5 * 60))->backoff(5)];
}
```

내부적으로 이 미들웨어는 Laravel의 캐시 시스템을 사용하여 속도 제한을 구현하며, 잡의 클래스 이름이 캐시 "키"로 활용됩니다. 잡에 미들웨어를 연결할 때 `by` 메서드를 호출하여 이 키를 재정의할 수 있습니다. 이는 동일한 서드파티 서비스와 상호 작용하는 여러 잡이 있고 공통 스로틀링 "버킷"을 공유하고자 하는 경우 유용할 수 있습니다.

```php
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->by('key')];
}
```

기본적으로 이 미들웨어는 모든 예외를 스로틀합니다. 잡에 미들웨어를 연결할 때 `when` 메서드를 호출하여 이 동작을 수정할 수 있습니다. 그런 다음 `when` 메서드에 제공된 클로저가 `true`를 반환하는 경우에만 예외가 스로틀됩니다.

```php
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->when(
        fn (Throwable $throwable) => $throwable instanceof HttpClientException
    )];
}
```

스로틀된 예외를 애플리케이션의 예외 핸들러에 보고하려면 잡에 미들웨어를 연결할 때 `report` 메서드를 호출하여 그렇게 할 수 있습니다. 선택적으로 `report` 메서드에 클로저를 제공할 수 있으며 주어진 클로저가 `true`를 반환하는 경우에만 예외가 보고됩니다.

```php
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->report(
        fn (Throwable $throwable) => $throwable instanceof HttpClientException
    )];
}
```

> [!NOTE]
> Redis를 사용하는 경우 Redis에 맞게 미세 조정되고 기본 예외 스로틀링 미들웨어보다 더 효율적인 `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis` 미들웨어를 사용할 수 있습니다.

<a name="skipping-jobs"></a>
### 잡 건너뛰기

`Skip` 미들웨어를 사용하면 잡의 로직을 수정하지 않고 잡을 건너뛰거나 삭제하도록 지정할 수 있습니다. `Skip::when` 메서드는 주어진 조건이 `true`로 평가되면 잡을 삭제하고, `Skip::unless` 메서드는 조건이 `false`로 평가되면 잡을 삭제합니다.

```php
use Illuminate\Queue\Middleware\Skip;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [
        Skip::when($someCondition),
    ];
}
```

더 복잡한 조건부 평가를 위해 `when` 및 `unless` 메서드에 `Closure`를 전달할 수도 있습니다.

```php
use Illuminate\Queue\Middleware\Skip;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [
        Skip::when(function (): bool {
            return $this->shouldSkip();
        }),
    ];
}
```

<a name="dispatching-jobs"></a>
## 잡 디스패치

잡 클래스를 작성한 후 잡 자체의 `dispatch` 메서드를 사용하여 디스패치할 수 있습니다. `dispatch` 메서드에 전달된 인수는 잡의 생성자에 전달됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // ...

        ProcessPodcast::dispatch($podcast);

        return redirect('/podcasts');
    }
}
```

조건부로 잡을 디스패치하려면 `dispatchIf` 및 `dispatchUnless` 메서드를 사용할 수 있습니다.

```php
ProcessPodcast::dispatchIf($accountActive, $podcast);

ProcessPodcast::dispatchUnless($accountSuspended, $podcast);
```

새 Laravel 애플리케이션에서 `sync` 드라이버가 기본 큐 드라이버입니다. 이 드라이버는 현재 요청의 포그라운드에서 잡을 동기적으로 실행하며, 이는 로컬 개발 중에 종종 편리합니다. 백그라운드 처리를 위해 실제로 잡을 큐에 넣기 시작하려면 애플리케이션의 `config/queue.php` 설정 파일에서 다른 큐 드라이버를 지정할 수 있습니다.

<a name="delayed-dispatching"></a>
### 지연된 디스패치

잡이 큐 워커에서 즉시 처리되지 않도록 지정하려면 잡을 디스패치할 때 `delay` 메서드를 사용할 수 있습니다. 예를 들어, 디스패치된 후 10분 동안 잡을 처리에 사용할 수 없도록 지정해 보겠습니다.

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // ...

        ProcessPodcast::dispatch($podcast)
            ->delay(now()->addMinutes(10));

        return redirect('/podcasts');
    }
}
```

경우에 따라 잡에 기본 지연이 설정되어 있을 수 있습니다. 이 지연을 우회하고 즉시 처리를 위해 잡을 디스패치해야 하는 경우 `withoutDelay` 메서드를 사용할 수 있습니다.

```php
ProcessPodcast::dispatch($podcast)->withoutDelay();
```

> [!WARNING]
> Amazon SQS 큐 서비스는 최대 지연 시간이 15분입니다.

<a name="dispatching-after-the-response-is-sent-to-browser"></a>
#### 응답이 브라우저로 전송된 후 디스패치

또는 웹 서버가 FastCGI를 사용하는 경우 `dispatchAfterResponse` 메서드는 HTTP 응답이 사용자의 브라우저로 전송될 때까지 잡 디스패치를 지연합니다. 이렇게 하면 큐에 넣은 잡이 여전히 실행되는 동안에도 사용자가 애플리케이션을 사용할 수 있습니다. 이것은 일반적으로 이메일 보내기와 같이 약 1초 정도 걸리는 잡에만 사용해야 합니다. 현재 HTTP 요청 내에서 처리되므로 이 방식으로 디스패치된 잡은 처리되기 위해 큐 워커가 실행 중일 필요가 없습니다.

```php
use App\Jobs\SendNotification;

SendNotification::dispatchAfterResponse();
```

클로저를 `dispatch`하고 `dispatch` 헬퍼에 `afterResponse` 메서드를 체이닝하여 HTTP 응답이 브라우저로 전송된 후 클로저를 실행할 수도 있습니다.

```php
use App\Mail\WelcomeMessage;
use Illuminate\Support\Facades\Mail;

dispatch(function () {
    Mail::to('taylor@example.com')->send(new WelcomeMessage);
})->afterResponse();
```

<a name="synchronous-dispatching"></a>
### 동기 디스패치

잡을 즉시(동기적으로) 디스패치하려면 `dispatchSync` 메서드를 사용할 수 있습니다. 이 메서드를 사용하면 잡이 큐에 넣지 않고 현재 프로세스 내에서 즉시 실행됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatchSync($podcast);

        return redirect('/podcasts');
    }
}
```

<a name="jobs-and-database-transactions"></a>
### 잡 & 데이터베이스 트랜잭션

데이터베이스 트랜잭션 내에서 잡을 디스패치하는 것은 완전히 괜찮지만, 잡이 실제로 성공적으로 실행될 수 있도록 특별히 주의해야 합니다. 트랜잭션 내에서 잡을 디스패치하면 부모 트랜잭션이 커밋되기 전에 워커가 잡을 처리할 수 있습니다. 이 경우 데이터베이스 트랜잭션 중에 모델이나 데이터베이스 레코드에 대한 업데이트가 아직 데이터베이스에 반영되지 않을 수 있습니다. 또한 트랜잭션 내에서 생성된 모델이나 데이터베이스 레코드가 데이터베이스에 존재하지 않을 수 있습니다.

다행히 Laravel은 이 문제를 해결하는 여러 방법을 제공합니다. 먼저 큐 커넥션의 설정 배열에서 `after_commit` 커넥션 옵션을 설정할 수 있습니다.

```php
'redis' => [
    'driver' => 'redis',
    // ...
    'after_commit' => true,
],
```

`after_commit` 옵션이 `true`이면 데이터베이스 트랜잭션 내에서 잡을 디스패치할 수 있습니다. 그러나 Laravel은 열린 부모 데이터베이스 트랜잭션이 커밋될 때까지 기다린 후에 실제로 잡을 디스패치합니다. 물론 현재 열린 데이터베이스 트랜잭션이 없으면 잡이 즉시 디스패치됩니다.

트랜잭션 중에 발생하는 예외로 인해 트랜잭션이 롤백되면 해당 트랜잭션 중에 디스패치된 잡이 삭제됩니다.

> [!NOTE]
> `after_commit` 설정 옵션을 `true`로 설정하면 모든 열린 데이터베이스 트랜잭션이 커밋된 후 모든 큐에 넣은 이벤트 리스너, 메일러블, 알림 및 브로드캐스트 이벤트도 디스패치됩니다.

<a name="specifying-commit-dispatch-behavior-inline"></a>
#### 인라인으로 커밋 디스패치 동작 지정

`after_commit` 큐 커넥션 설정 옵션을 `true`로 설정하지 않아도 모든 열린 데이터베이스 트랜잭션이 커밋된 후 특정 잡이 디스패치되어야 함을 나타낼 수 있습니다. 이를 수행하려면 디스패치 작업에 `afterCommit` 메서드를 체이닝할 수 있습니다.

```php
use App\Jobs\ProcessPodcast;

ProcessPodcast::dispatch($podcast)->afterCommit();
```

마찬가지로 `after_commit` 설정 옵션이 `true`로 설정된 경우에도 열린 데이터베이스 트랜잭션이 커밋될 때까지 기다리지 않고 특정 잡을 즉시 디스패치해야 함을 나타낼 수 있습니다.

```php
ProcessPodcast::dispatch($podcast)->beforeCommit();
```

<a name="job-chaining"></a>
### 잡 체이닝

잡 체이닝을 사용하면 기본 잡이 성공적으로 실행된 후 순서대로 실행해야 하는 큐에 넣은 잡 목록을 지정할 수 있습니다. 시퀀스의 잡 중 하나가 실패하면 나머지 잡은 실행되지 않습니다. 큐에 넣은 잡 체인을 실행하려면 `Bus` 파사드에서 제공하는 `chain` 메서드를 사용할 수 있습니다. Laravel의 명령 버스는 큐에 넣은 잡 디스패치가 구축된 하위 수준 컴포넌트입니다.

```php
use App\Jobs\OptimizePodcast;
use App\Jobs\ProcessPodcast;
use App\Jobs\ReleasePodcast;
use Illuminate\Support\Facades\Bus;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->dispatch();
```

잡 클래스 인스턴스를 체이닝하는 것 외에도 클로저를 체이닝할 수도 있습니다.

```php
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    function () {
        Podcast::update(/* ... */);
    },
])->dispatch();
```

> [!WARNING]
> 잡 내에서 `$this->delete()` 메서드를 사용하여 잡을 삭제해도 체인된 잡이 처리되는 것을 막지 않습니다. 체인은 체인 내의 잡이 실패한 경우에만 실행을 중지합니다.

<a name="chain-connection-queue"></a>
#### 체인 커넥션 및 큐

체인된 잡에 사용해야 하는 커넥션과 큐를 지정하려면 `onConnection` 및 `onQueue` 메서드를 사용할 수 있습니다. 이러한 메서드는 큐에 넣은 잡에 다른 커넥션/큐가 명시적으로 할당되지 않는 한 사용해야 하는 큐 커넥션과 큐 이름을 지정합니다.

```php
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->onConnection('redis')->onQueue('podcasts')->dispatch();
```

<a name="adding-jobs-to-the-chain"></a>
#### 체인에 잡 추가하기

때때로 체인 내의 다른 잡에서 기존 잡 체인의 앞이나 뒤에 잡을 추가해야 할 수 있습니다. `prependToChain` 및 `appendToChain` 메서드를 사용하여 이를 수행할 수 있습니다.

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    // Prepend to the current chain, run job immediately after current job...
    $this->prependToChain(new TranscribePodcast);

    // Append to the current chain, run job at end of chain...
    $this->appendToChain(new TranscribePodcast);
}
```

<a name="chain-failures"></a>
#### 체인 실패

잡을 체이닝할 때 `catch` 메서드를 사용하여 체인 내의 잡이 실패할 경우 호출되어야 하는 클로저를 지정할 수 있습니다. 주어진 콜백은 잡 실패를 유발한 `Throwable` 인스턴스를 받습니다.

```php
use Illuminate\Support\Facades\Bus;
use Throwable;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->catch(function (Throwable $e) {
    // A job within the chain has failed...
})->dispatch();
```

> [!WARNING]
> 체인 콜백은 직렬화되어 나중에 Laravel 큐에 의해 실행되므로 체인 콜백 내에서 `$this` 변수를 사용해서는 안 됩니다.

<a name="customizing-the-queue-and-connection"></a>
### 큐 및 커넥션 커스터마이징

<a name="dispatching-to-a-particular-queue"></a>
#### 특정 큐로 디스패치하기

잡을 다른 큐에 푸시하면 큐에 넣은 잡을 "분류"하고 다양한 큐에 할당하는 워커 수의 우선순위를 지정할 수도 있습니다. 이것은 큐 설정 파일에 정의된 다른 큐 "커넥션"으로 잡을 푸시하는 것이 아니라 단일 커넥션 내의 특정 큐로만 푸시한다는 점에 유의하세요. 큐를 지정하려면 잡을 디스패치할 때 `onQueue` 메서드를 사용하세요.

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onQueue('processing');

        return redirect('/podcasts');
    }
}
```

또는 잡의 생성자 내에서 `onQueue` 메서드를 호출하여 잡의 큐를 지정할 수 있습니다.

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->onQueue('processing');
    }
}
```

<a name="dispatching-to-a-particular-connection"></a>
#### 특정 커넥션으로 디스패치하기

애플리케이션이 여러 큐 커넥션과 상호 작용하는 경우 `onConnection` 메서드를 사용하여 잡을 푸시할 커넥션을 지정할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onConnection('sqs');

        return redirect('/podcasts');
    }
}
```

`onConnection` 및 `onQueue` 메서드를 함께 체이닝하여 잡의 커넥션과 큐를 지정할 수 있습니다.

```php
ProcessPodcast::dispatch($podcast)
    ->onConnection('sqs')
    ->onQueue('processing');
```

또는 잡의 생성자 내에서 `onConnection` 메서드를 호출하여 잡의 커넥션을 지정할 수 있습니다.

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->onConnection('sqs');
    }
}
```

<a name="max-job-attempts-and-timeout"></a>
### 최대 잡 시도 횟수 / 타임아웃 값 지정

<a name="max-attempts"></a>
#### 최대 시도 횟수

큐에 넣은 잡 중 하나에서 오류가 발생하는 경우 무기한으로 재시도하지 않을 것입니다. 따라서 Laravel은 잡을 시도할 수 있는 횟수 또는 기간을 지정하는 다양한 방법을 제공합니다.

잡을 시도할 수 있는 최대 횟수를 지정하는 한 가지 방법은 Artisan 명령줄의 `--tries` 스위치를 통하는 것입니다. 이것은 처리되는 잡이 시도할 수 있는 횟수를 지정하지 않는 한 워커가 처리하는 모든 잡에 적용됩니다.

```shell
php artisan queue:work --tries=3
```

잡이 최대 시도 횟수를 초과하면 "실패한" 잡으로 간주됩니다. 실패한 잡 처리에 대한 자세한 내용은 [실패한 잡 문서](#dealing-with-failed-jobs)를 참조하세요. `queue:work` 명령에 `--tries=0`이 제공되면 잡이 무기한으로 재시도됩니다.

잡 클래스 자체에 잡을 시도할 수 있는 최대 횟수를 정의하여 더 세분화된 접근 방식을 취할 수 있습니다. 잡에 최대 시도 횟수가 지정된 경우 명령줄에 제공된 `--tries` 값보다 우선합니다.

```php
<?php

namespace App\Jobs;

class ProcessPodcast implements ShouldQueue
{
    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 5;
}
```

특정 잡의 최대 시도 횟수에 대한 동적 제어가 필요한 경우 잡에 `tries` 메서드를 정의할 수 있습니다.

```php
/**
 * Determine number of times the job may be attempted.
 */
public function tries(): int
{
    return 5;
}
```

<a name="time-based-attempts"></a>
#### 시간 기반 시도

잡이 실패하기 전에 시도할 수 있는 횟수를 정의하는 대신 잡이 더 이상 시도되지 않아야 하는 시간을 정의할 수 있습니다. 이렇게 하면 주어진 시간 프레임 내에서 잡을 여러 번 시도할 수 있습니다. 잡이 더 이상 시도되지 않아야 하는 시간을 정의하려면 잡 클래스에 `retryUntil` 메서드를 추가하세요. 이 메서드는 `DateTime` 인스턴스를 반환해야 합니다.

```php
use DateTime;

/**
 * Determine the time at which the job should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->addMinutes(10);
}
```

> [!NOTE]
> [큐에 넣은 이벤트 리스너](/docs/{{version}}/events#queued-event-listeners)에도 `tries` 속성 또는 `retryUntil` 메서드를 정의할 수 있습니다.

<a name="max-exceptions"></a>
#### 최대 예외

때때로 잡이 여러 번 시도될 수 있지만 주어진 수의 처리되지 않은 예외에 의해 재시도가 트리거되면(`release` 메서드에 의해 직접 릴리스되는 것과 반대로) 실패해야 한다고 지정할 수 있습니다. 이를 수행하려면 잡 클래스에 `maxExceptions` 속성을 정의할 수 있습니다.

```php
<?php

namespace App\Jobs;

use Illuminate\Support\Facades\Redis;

class ProcessPodcast implements ShouldQueue
{
    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 25;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     *
     * @var int
     */
    public $maxExceptions = 3;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Redis::throttle('key')->allow(10)->every(60)->then(function () {
            // Lock obtained, process the podcast...
        }, function () {
            // Unable to obtain lock...
            return $this->release(10);
        });
    }
}
```

이 예제에서 애플리케이션이 Redis 잠금을 얻을 수 없으면 잡은 10초 동안 릴리스되고 최대 25번까지 계속 재시도됩니다. 그러나 잡에서 3개의 처리되지 않은 예외가 발생하면 잡은 실패합니다.

<a name="timeout"></a>
#### 타임아웃

종종 큐에 넣은 잡이 대략 얼마나 걸릴지 알 수 있습니다. 이러한 이유로 Laravel은 "타임아웃" 값을 지정할 수 있습니다. 기본적으로 타임아웃 값은 60초입니다. 잡이 타임아웃 값으로 지정된 초 수보다 오래 처리되면 잡을 처리하는 워커가 오류와 함께 종료됩니다. 일반적으로 워커는 [서버에 구성된 프로세스 관리자](#supervisor-configuration)에 의해 자동으로 다시 시작됩니다.

잡을 실행할 수 있는 최대 시간(초)은 Artisan 명령줄의 `--timeout` 스위치를 사용하여 지정할 수 있습니다.

```shell
php artisan queue:work --timeout=30
```

잡이 계속 타임아웃되어 최대 시도 횟수를 초과하면 실패로 표시됩니다.

잡 클래스 자체에서 잡이 실행되도록 허용되어야 하는 최대 시간(초)을 정의할 수도 있습니다. 잡에 타임아웃이 지정된 경우 명령줄에 지정된 타임아웃보다 우선합니다.

```php
<?php

namespace App\Jobs;

class ProcessPodcast implements ShouldQueue
{
    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 120;
}
```

때때로 소켓이나 나가는 HTTP 연결과 같은 IO 블로킹 프로세스는 지정된 타임아웃을 존중하지 않을 수 있습니다. 따라서 이러한 기능을 사용할 때는 해당 API를 사용하여 항상 타임아웃을 지정해야 합니다. 예를 들어 Guzzle을 사용할 때는 항상 연결 및 요청 타임아웃 값을 지정해야 합니다.

> [!WARNING]
> 잡 타임아웃을 지정하려면 `pcntl` PHP 확장이 설치되어 있어야 합니다. 또한 잡의 "타임아웃" 값은 항상 ["retry after"](#job-expiration) 값보다 작아야 합니다. 그렇지 않으면 잡이 실제로 실행을 완료하거나 타임아웃되기 전에 다시 시도될 수 있습니다.

<a name="failing-on-timeout"></a>
#### 타임아웃 시 실패

타임아웃 시 잡이 [실패](#dealing-with-failed-jobs)로 표시되어야 함을 나타내려면 잡 클래스에 `$failOnTimeout` 속성을 정의할 수 있습니다.

```php
/**
 * Indicate if the job should be marked as failed on timeout.
 *
 * @var bool
 */
public $failOnTimeout = true;
```

<a name="error-handling"></a>
### 오류 처리

잡이 처리되는 동안 예외가 발생하면 잡은 자동으로 큐로 다시 릴리스되어 다시 시도될 수 있습니다. 잡은 애플리케이션에서 허용하는 최대 횟수까지 계속 릴리스됩니다. 최대 시도 횟수는 `queue:work` Artisan 명령에 사용되는 `--tries` 스위치로 정의됩니다. 또는 최대 시도 횟수는 잡 클래스 자체에 정의될 수 있습니다. 큐 워커 실행에 대한 자세한 정보는 [아래에서 찾을 수 있습니다](#running-the-queue-worker).

<a name="manually-releasing-a-job"></a>
#### 수동으로 잡 릴리스하기

때때로 나중에 다시 시도할 수 있도록 잡을 수동으로 큐로 다시 릴리스하고 싶을 수 있습니다. `release` 메서드를 호출하여 이를 수행할 수 있습니다.

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    $this->release();
}
```

기본적으로 `release` 메서드는 잡을 즉시 처리하기 위해 큐로 다시 릴리스합니다. 그러나 정수 또는 날짜 인스턴스를 `release` 메서드에 전달하여 주어진 시간(초)이 경과할 때까지 잡을 처리에 사용할 수 없도록 큐에 지시할 수 있습니다.

```php
$this->release(10);

$this->release(now()->addSeconds(10));
```

<a name="manually-failing-a-job"></a>
#### 수동으로 잡 실패시키기

때때로 잡을 수동으로 "실패"로 표시해야 할 수 있습니다. 이를 위해 `fail` 메서드를 호출할 수 있습니다.

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    $this->fail();
}
```

포착한 예외로 인해 잡을 실패로 표시하려면 예외를 `fail` 메서드에 전달할 수 있습니다. 또는 편의를 위해 예외로 변환될 문자열 오류 메시지를 전달할 수 있습니다.

```php
$this->fail($exception);

$this->fail('Something went wrong.');
```

> [!NOTE]
> 실패한 잡에 대한 자세한 내용은 [잡 실패 처리에 대한 문서](#dealing-with-failed-jobs)를 확인하세요.

<a name="job-batching"></a>
## 잡 일괄 처리

Laravel의 잡 일괄 처리 기능을 사용하면 잡 배치를 쉽게 실행한 다음 잡 배치 실행이 완료되면 일부 작업을 수행할 수 있습니다. 시작하기 전에 완료 비율과 같은 잡 배치에 대한 메타 정보를 포함할 테이블을 빌드하기 위한 데이터베이스 마이그레이션을 생성해야 합니다. 이 마이그레이션은 `make:queue-batches-table` Artisan 명령을 사용하여 생성할 수 있습니다.

```shell
php artisan make:queue-batches-table

php artisan migrate
```

<a name="defining-batchable-jobs"></a>
### 일괄 처리 가능한 잡 정의하기

일괄 처리 가능한 잡을 정의하려면 평소처럼 [큐 가능한 잡을 생성](#creating-jobs)해야 합니다. 그러나 잡 클래스에 `Illuminate\Bus\Batchable` 트레이트를 추가해야 합니다. 이 트레이트는 잡이 실행 중인 현재 배치를 검색하는 데 사용할 수 있는 `batch` 메서드에 대한 액세스를 제공합니다.

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ImportCsv implements ShouldQueue
{
    use Batchable, Queueable;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if ($this->batch()->cancelled()) {
            // Determine if the batch has been cancelled...

            return;
        }

        // Import a portion of the CSV file...
    }
}
```

<a name="dispatching-batches"></a>
### 배치 디스패치하기

잡 배치를 디스패치하려면 `Bus` 파사드의 `batch` 메서드를 사용해야 합니다. 물론 일괄 처리는 주로 완료 콜백과 결합할 때 유용합니다. 따라서 `then`, `catch` 및 `finally` 메서드를 사용하여 배치에 대한 완료 콜백을 정의할 수 있습니다. 이러한 각 콜백은 호출될 때 `Illuminate\Bus\Batch` 인스턴스를 받습니다. 이 예제에서는 CSV 파일에서 주어진 수의 행을 각각 처리하는 잡 배치를 큐에 넣는다고 가정합니다.

```php
use App\Jobs\ImportCsv;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;
use Throwable;

$batch = Bus::batch([
    new ImportCsv(1, 100),
    new ImportCsv(101, 200),
    new ImportCsv(201, 300),
    new ImportCsv(301, 400),
    new ImportCsv(401, 500),
])->before(function (Batch $batch) {
    // The batch has been created but no jobs have been added...
})->progress(function (Batch $batch) {
    // A single job has completed successfully...
})->then(function (Batch $batch) {
    // All jobs completed successfully...
})->catch(function (Batch $batch, Throwable $e) {
    // First batch job failure detected...
})->finally(function (Batch $batch) {
    // The batch has finished executing...
})->dispatch();

return $batch->id;
```

`$batch->id` 속성을 통해 액세스할 수 있는 배치의 ID는 디스패치된 후 배치에 대한 정보를 [Laravel 명령 버스에 쿼리](#inspecting-batches)하는 데 사용할 수 있습니다.

> [!WARNING]
> 배치 콜백은 직렬화되어 나중에 Laravel 큐에 의해 실행되므로 콜백 내에서 `$this` 변수를 사용해서는 안 됩니다. 또한 일괄 처리된 잡은 데이터베이스 트랜잭션 내에 래핑되므로 암시적 커밋을 트리거하는 데이터베이스 문은 잡 내에서 실행해서는 안 됩니다.

<a name="naming-batches"></a>
#### 배치 이름 지정

Laravel Horizon 및 Laravel Telescope와 같은 일부 도구는 배치에 이름이 지정된 경우 배치에 대해 보다 사용자 친화적인 디버그 정보를 제공할 수 있습니다. 배치에 임의의 이름을 할당하려면 배치를 정의하는 동안 `name` 메서드를 호출할 수 있습니다.

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->name('Import CSV')->dispatch();
```

<a name="batch-connection-queue"></a>
#### 배치 연결 및 큐

일괄 처리된 잡에 사용할 연결과 큐를 지정하려면 `onConnection` 및 `onQueue` 메서드를 사용할 수 있습니다. 모든 일괄 처리된 잡은 동일한 연결 및 큐 내에서 실행되어야 합니다.

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->onConnection('redis')->onQueue('imports')->dispatch();
```

<a name="chains-and-batches"></a>
### 체인과 배치

배치 내에서 [체인된 잡](#job-chaining) 세트를 정의하려면 체인된 잡을 배열 내에 배치하면 됩니다. 예를 들어, 두 개의 잡 체인을 병렬로 실행하고 두 잡 체인의 처리가 완료되면 콜백을 실행할 수 있습니다.

```php
use App\Jobs\ReleasePodcast;
use App\Jobs\SendPodcastReleaseNotification;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;

Bus::batch([
    [
        new ReleasePodcast(1),
        new SendPodcastReleaseNotification(1),
    ],
    [
        new ReleasePodcast(2),
        new SendPodcastReleaseNotification(2),
    ],
])->then(function (Batch $batch) {
    // ...
})->dispatch();
```

반대로, [체인](#job-chaining) 내에서 배치를 정의하여 잡 배치를 실행할 수 있습니다. 예를 들어, 먼저 여러 팟캐스트를 릴리스하는 잡 배치를 실행한 다음 릴리스 알림을 보내는 잡 배치를 실행할 수 있습니다.

```php
use App\Jobs\FlushPodcastCache;
use App\Jobs\ReleasePodcast;
use App\Jobs\SendPodcastReleaseNotification;
use Illuminate\Support\Facades\Bus;

Bus::chain([
    new FlushPodcastCache,
    Bus::batch([
        new ReleasePodcast(1),
        new ReleasePodcast(2),
    ]),
    Bus::batch([
        new SendPodcastReleaseNotification(1),
        new SendPodcastReleaseNotification(2),
    ]),
])->dispatch();
```

<a name="adding-jobs-to-batches"></a>
### 배치에 잡 추가하기

때로는 일괄 처리된 잡 내에서 배치에 추가 잡을 추가하는 것이 유용할 수 있습니다. 이 패턴은 웹 요청 중에 디스패치하는 데 너무 오래 걸릴 수 있는 수천 개의 잡을 일괄 처리해야 할 때 유용할 수 있습니다. 따라서 배치에 더 많은 잡을 채우는 "로더" 잡의 초기 배치를 디스패치할 수 있습니다.

```php
$batch = Bus::batch([
    new LoadImportBatch,
    new LoadImportBatch,
    new LoadImportBatch,
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->name('Import Contacts')->dispatch();
```

이 예제에서는 `LoadImportBatch` 잡을 사용하여 배치에 추가 잡을 채웁니다. 이를 위해 잡의 `batch` 메서드를 통해 액세스할 수 있는 배치 인스턴스에서 `add` 메서드를 사용할 수 있습니다.

```php
use App\Jobs\ImportContacts;
use Illuminate\Support\Collection;

/**
 * Execute the job.
 */
public function handle(): void
{
    if ($this->batch()->cancelled()) {
        return;
    }

    $this->batch()->add(Collection::times(1000, function () {
        return new ImportContacts;
    }));
}
```

> [!WARNING]
> 동일한 배치에 속한 잡 내에서만 배치에 잡을 추가할 수 있습니다.

<a name="inspecting-batches"></a>
### 배치 검사하기

배치 완료 콜백에 제공되는 `Illuminate\Bus\Batch` 인스턴스에는 주어진 잡 배치와 상호 작용하고 검사하는 데 도움이 되는 다양한 속성과 메서드가 있습니다.

```php
// The UUID of the batch...
$batch->id;

// The name of the batch (if applicable)...
$batch->name;

// The number of jobs assigned to the batch...
$batch->totalJobs;

// The number of jobs that have not been processed by the queue...
$batch->pendingJobs;

// The number of jobs that have failed...
$batch->failedJobs;

// The number of jobs that have been processed thus far...
$batch->processedJobs();

// The completion percentage of the batch (0-100)...
$batch->progress();

// Indicates if the batch has finished executing...
$batch->finished();

// Cancel the execution of the batch...
$batch->cancel();

// Indicates if the batch has been cancelled...
$batch->cancelled();
```

<a name="returning-batches-from-routes"></a>
#### 라우트에서 배치 반환하기

모든 `Illuminate\Bus\Batch` 인스턴스는 JSON 직렬화가 가능하므로, 애플리케이션의 라우트 중 하나에서 직접 반환하여 완료 진행 상황을 포함한 배치에 대한 정보가 포함된 JSON 페이로드를 검색할 수 있습니다. 이를 통해 애플리케이션의 UI에서 배치 완료 진행 상황에 대한 정보를 편리하게 표시할 수 있습니다.

ID로 배치를 검색하려면 `Bus` 파사드의 `findBatch` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Route;

Route::get('/batch/{batchId}', function (string $batchId) {
    return Bus::findBatch($batchId);
});
```

<a name="cancelling-batches"></a>
### 배치 취소하기

때때로 주어진 배치의 실행을 취소해야 할 수 있습니다. 이는 `Illuminate\Bus\Batch` 인스턴스에서 `cancel` 메서드를 호출하여 수행할 수 있습니다.

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    if ($this->user->exceedsImportLimit()) {
        return $this->batch()->cancel();
    }

    if ($this->batch()->cancelled()) {
        return;
    }
}
```

이전 예제에서 눈치챘을 수 있듯이, 일괄 처리된 잡은 일반적으로 실행을 계속하기 전에 해당 배치가 취소되었는지 확인해야 합니다. 그러나 편의를 위해 잡에 `SkipIfBatchCancelled` [미들웨어](#job-middleware)를 할당할 수 있습니다. 이름에서 알 수 있듯이, 이 미들웨어는 해당 배치가 취소된 경우 잡을 처리하지 않도록 Laravel에 지시합니다.

```php
use Illuminate\Queue\Middleware\SkipIfBatchCancelled;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [new SkipIfBatchCancelled];
}
```

<a name="batch-failures"></a>
### 배치 실패

일괄 처리된 잡이 실패하면 `catch` 콜백(할당된 경우)이 호출됩니다. 이 콜백은 배치 내에서 실패한 첫 번째 잡에 대해서만 호출됩니다.

<a name="allowing-failures"></a>
#### 실패 허용하기

배치 내의 잡이 실패하면 Laravel은 자동으로 배치를 "취소됨"으로 표시합니다. 원하는 경우 잡 실패가 배치를 자동으로 취소됨으로 표시하지 않도록 이 동작을 비활성화할 수 있습니다. 이는 배치를 디스패치하는 동안 `allowFailures` 메서드를 호출하여 수행할 수 있습니다.

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->allowFailures()->dispatch();
```

<a name="retrying-failed-batch-jobs"></a>
#### 실패한 배치 잡 재시도하기

편의를 위해 Laravel은 주어진 배치의 모든 실패한 잡을 쉽게 재시도할 수 있는 `queue:retry-batch` Artisan 명령을 제공합니다. `queue:retry-batch` 명령은 실패한 잡을 재시도해야 하는 배치의 UUID를 인수로 받습니다.

```shell
php artisan queue:retry-batch 32dbc76c-4f82-4749-b610-a639fe0099b5
```

<a name="pruning-batches"></a>
### 배치 정리하기

정리하지 않으면 `job_batches` 테이블에 레코드가 매우 빠르게 축적될 수 있습니다. 이를 완화하려면 `queue:prune-batches` Artisan 명령을 매일 실행하도록 [스케줄](/docs/{{version}}/scheduling)해야 합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches')->daily();
```

기본적으로 24시간이 지난 모든 완료된 배치가 정리됩니다. 배치 데이터를 보존할 기간을 결정하기 위해 명령을 호출할 때 `hours` 옵션을 사용할 수 있습니다. 예를 들어, 다음 명령은 48시간 이전에 완료된 모든 배치를 삭제합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48')->daily();
```

때로는 `jobs_batches` 테이블에 잡이 실패했지만 해당 잡이 성공적으로 재시도되지 않은 배치처럼 성공적으로 완료되지 않은 배치의 레코드가 축적될 수 있습니다. `unfinished` 옵션을 사용하여 `queue:prune-batches` 명령에 이러한 미완료 배치 레코드를 정리하도록 지시할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48 --unfinished=72')->daily();
```

마찬가지로, `jobs_batches` 테이블에 취소된 배치의 레코드도 축적될 수 있습니다. `cancelled` 옵션을 사용하여 `queue:prune-batches` 명령에 이러한 취소된 배치 레코드를 정리하도록 지시할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48 --cancelled=72')->daily();
```

<a name="storing-batches-in-dynamodb"></a>
### DynamoDB에 배치 저장하기

Laravel은 관계형 데이터베이스 대신 [DynamoDB](https://aws.amazon.com/dynamodb)에 배치 메타 정보를 저장하는 것도 지원합니다. 그러나 모든 배치 레코드를 저장할 DynamoDB 테이블을 수동으로 만들어야 합니다.

일반적으로 이 테이블의 이름은 `job_batches`여야 하지만, 애플리케이션의 `queue` 설정 파일 내 `queue.batching.table` 설정 값에 따라 테이블 이름을 지정해야 합니다.

<a name="dynamodb-batch-table-configuration"></a>
#### DynamoDB 배치 테이블 설정

`job_batches` 테이블에는 `application`이라는 문자열 기본 파티션 키와 `id`라는 문자열 기본 정렬 키가 있어야 합니다. 키의 `application` 부분에는 애플리케이션의 `app` 설정 파일 내 `name` 설정 값으로 정의된 애플리케이션 이름이 포함됩니다. 애플리케이션 이름이 DynamoDB 테이블 키의 일부이므로 동일한 테이블을 사용하여 여러 Laravel 애플리케이션의 잡 배치를 저장할 수 있습니다.

또한 [자동 배치 정리](#pruning-batches-in-dynamodb)를 활용하려면 테이블에 `ttl` 속성을 정의할 수 있습니다.

<a name="dynamodb-configuration"></a>
#### DynamoDB 설정

다음으로, Laravel 애플리케이션이 Amazon DynamoDB와 통신할 수 있도록 AWS SDK를 설치합니다.

```shell
composer require aws/aws-sdk-php
```

그런 다음 `queue.batching.driver` 설정 옵션의 값을 `dynamodb`로 설정합니다. 또한 `batching` 설정 배열 내에 `key`, `secret`, `region` 설정 옵션을 정의해야 합니다. 이러한 옵션은 AWS 인증에 사용됩니다. `dynamodb` 드라이버를 사용할 때 `queue.batching.database` 설정 옵션은 필요하지 않습니다.

```php
'batching' => [
    'driver' => env('QUEUE_BATCHING_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
],
```

<a name="pruning-batches-in-dynamodb"></a>
#### DynamoDB에서 배치 정리하기

[DynamoDB](https://aws.amazon.com/dynamodb)를 사용하여 잡 배치 정보를 저장하는 경우, 관계형 데이터베이스에 저장된 배치를 정리하는 데 사용되는 일반적인 정리 명령이 작동하지 않습니다. 대신 [DynamoDB의 기본 TTL 기능](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)을 활용하여 오래된 배치의 레코드를 자동으로 제거할 수 있습니다.

DynamoDB 테이블을 `ttl` 속성으로 정의한 경우, Laravel이 배치 레코드를 정리하는 방법을 지시하는 설정 매개변수를 정의할 수 있습니다. `queue.batching.ttl_attribute` 설정 값은 TTL을 보유하는 속성의 이름을 정의하고, `queue.batching.ttl` 설정 값은 레코드가 마지막으로 업데이트된 시간을 기준으로 배치 레코드가 DynamoDB 테이블에서 제거될 수 있는 시간(초)을 정의합니다.

```php
'batching' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
    'ttl_attribute' => 'ttl',
    'ttl' => 60 * 60 * 24 * 7, // 7 days...
],
```

<a name="queueing-closures"></a>
## 클로저 큐잉

잡 클래스를 큐에 디스패치하는 대신 클로저를 디스패치할 수도 있습니다. 이는 현재 요청 사이클 외부에서 실행해야 하는 빠르고 간단한 작업에 적합합니다. 클로저를 큐에 디스패치할 때 클로저의 코드 내용은 전송 중에 수정될 수 없도록 암호화 서명됩니다.

```php
$podcast = App\Podcast::find(1);

dispatch(function () use ($podcast) {
    $podcast->publish();
});
```

큐에 있는 클로저에 이름을 할당하려면 `name` 메서드를 사용할 수 있습니다. 이 이름은 큐 보고 대시보드에서 사용되며 `queue:work` 명령으로 표시될 수도 있습니다.

```php
dispatch(function () {
    // ...
})->name('Publish Podcast');
```

`catch` 메서드를 사용하면 큐에 있는 클로저가 큐의 [설정된 재시도 횟수](#max-job-attempts-and-timeout)를 모두 소진한 후에도 성공적으로 완료되지 않으면 실행해야 하는 클로저를 제공할 수 있습니다.

```php
use Throwable;

dispatch(function () use ($podcast) {
    $podcast->publish();
})->catch(function (Throwable $e) {
    // This job has failed...
});
```

> [!WARNING]
> `catch` 콜백은 직렬화되어 나중에 Laravel 큐에 의해 실행되므로 `catch` 콜백 내에서 `$this` 변수를 사용해서는 안 됩니다.

<a name="running-the-queue-worker"></a>
## 큐 워커 실행하기

<a name="the-queue-work-command"></a>
### `queue:work` 명령

Laravel에는 큐 워커를 시작하고 큐에 푸시된 새 잡을 처리하는 Artisan 명령이 포함되어 있습니다. `queue:work` Artisan 명령을 사용하여 워커를 실행할 수 있습니다. `queue:work` 명령이 시작되면 수동으로 중지하거나 터미널을 닫을 때까지 계속 실행됩니다.

```shell
php artisan queue:work
```

> [!NOTE]
> `queue:work` 프로세스를 백그라운드에서 영구적으로 실행하려면 [Supervisor](#supervisor-configuration)와 같은 프로세스 모니터를 사용하여 큐 워커가 중지되지 않도록 해야 합니다.

처리된 잡 ID를 명령 출력에 포함하려면 `queue:work` 명령을 호출할 때 `-v` 플래그를 포함할 수 있습니다.

```shell
php artisan queue:work -v
```

큐 워커는 오래 실행되는 프로세스이며 부팅된 애플리케이션 상태를 메모리에 저장합니다. 결과적으로 시작된 후에는 코드 베이스의 변경 사항을 인식하지 못합니다. 따라서 배포 프로세스 중에 [큐 워커를 다시 시작](#queue-workers-and-deployment)해야 합니다. 또한 애플리케이션이 생성하거나 수정한 모든 정적 상태는 잡 간에 자동으로 재설정되지 않는다는 점을 기억하세요.

또는 `queue:listen` 명령을 실행할 수 있습니다. `queue:listen` 명령을 사용하면 업데이트된 코드를 다시 로드하거나 애플리케이션 상태를 재설정하려는 경우 워커를 수동으로 다시 시작할 필요가 없습니다. 그러나 이 명령은 `queue:work` 명령보다 효율성이 현저히 떨어집니다.

```shell
php artisan queue:listen
```

<a name="running-multiple-queue-workers"></a>
#### 여러 큐 워커 실행하기

큐에 여러 워커를 할당하고 잡을 동시에 처리하려면 단순히 여러 `queue:work` 프로세스를 시작하면 됩니다. 이는 로컬에서 터미널의 여러 탭을 통해 수행하거나 프로덕션에서는 프로세스 관리자의 설정을 사용하여 수행할 수 있습니다. [Supervisor를 사용할 때](#supervisor-configuration) `numprocs` 설정 값을 사용할 수 있습니다.

<a name="specifying-the-connection-queue"></a>
#### 연결 및 큐 지정하기

워커가 사용해야 하는 큐 연결을 지정할 수도 있습니다. `work` 명령에 전달된 연결 이름은 `config/queue.php` 설정 파일에 정의된 연결 중 하나에 해당해야 합니다.

```shell
php artisan queue:work redis
```

기본적으로 `queue:work` 명령은 지정된 연결의 기본 큐에 대한 잡만 처리합니다. 그러나 지정된 연결에 대해 특정 큐만 처리하도록 큐 워커를 추가로 사용자 지정할 수 있습니다. 예를 들어, 모든 이메일이 `redis` 큐 연결의 `emails` 큐에서 처리되는 경우 다음 명령을 실행하여 해당 큐만 처리하는 워커를 시작할 수 있습니다.

```shell
php artisan queue:work redis --queue=emails
```

<a name="processing-a-specified-number-of-jobs"></a>
#### 지정된 수의 잡 처리하기

`--once` 옵션을 사용하면 워커가 큐에서 단일 잡만 처리하도록 지시할 수 있습니다.

```shell
php artisan queue:work --once
```

`--max-jobs` 옵션을 사용하면 지정된 수의 잡을 처리한 후 종료하도록 워커에 지시할 수 있습니다. 이 옵션은 [Supervisor](#supervisor-configuration)와 함께 사용하면 워커가 지정된 수의 잡을 처리한 후 자동으로 다시 시작되어 축적된 메모리를 해제할 수 있어 유용합니다.

```shell
php artisan queue:work --max-jobs=1000
```

<a name="processing-all-queued-jobs-then-exiting"></a>
#### 모든 큐에 있는 잡 처리 후 종료하기

`--stop-when-empty` 옵션을 사용하면 모든 잡을 처리한 다음 정상적으로 종료하도록 워커에 지시할 수 있습니다. 이 옵션은 큐가 비면 컨테이너를 종료하려는 경우 Docker 컨테이너 내에서 Laravel 큐를 처리할 때 유용할 수 있습니다.

```shell
php artisan queue:work --stop-when-empty
```

<a name="processing-jobs-for-a-given-number-of-seconds"></a>
#### 지정된 시간(초) 동안 잡 처리하기

`--max-time` 옵션을 사용하면 지정된 시간(초) 동안 잡을 처리한 다음 종료하도록 워커에 지시할 수 있습니다. 이 옵션은 [Supervisor](#supervisor-configuration)와 함께 사용하면 지정된 시간 동안 잡을 처리한 후 워커가 자동으로 다시 시작되어 축적된 메모리를 해제할 수 있어 유용합니다.

```shell
# Process jobs for one hour and then exit...
php artisan queue:work --max-time=3600
```

<a name="worker-sleep-duration"></a>
#### 워커 휴면 시간

큐에 잡이 있으면 워커는 잡 사이에 지연 없이 계속 잡을 처리합니다. 그러나 `sleep` 옵션은 사용 가능한 잡이 없는 경우 워커가 몇 초 동안 "휴면"할지 결정합니다. 물론 휴면 중에는 워커가 새 잡을 처리하지 않습니다.

```shell
php artisan queue:work --sleep=3
```

<a name="maintenance-mode-queues"></a>
#### 유지 관리 모드와 큐

애플리케이션이 [유지 관리 모드](/docs/{{version}}/configuration#maintenance-mode)에 있으면 큐에 있는 잡이 처리되지 않습니다. 애플리케이션이 유지 관리 모드에서 벗어나면 잡이 정상적으로 처리됩니다.

유지 관리 모드가 활성화된 경우에도 큐 워커가 잡을 처리하도록 강제하려면 `--force` 옵션을 사용할 수 있습니다.

```shell
php artisan queue:work --force
```

<a name="resource-considerations"></a>
#### 리소스 고려 사항

데몬 큐 워커는 각 잡을 처리하기 전에 프레임워크를 "재부팅"하지 않습니다. 따라서 각 잡이 완료된 후에는 무거운 리소스를 해제해야 합니다. 예를 들어, GD 라이브러리로 이미지 조작을 수행하는 경우 이미지 처리가 완료되면 `imagedestroy`를 사용하여 메모리를 해제해야 합니다.

<a name="queue-priorities"></a>
### 큐 우선순위

때로는 큐가 처리되는 방식에 우선순위를 지정하고 싶을 수 있습니다. 예를 들어, `config/queue.php` 설정 파일에서 `redis` 연결의 기본 `queue`를 `low`로 설정할 수 있습니다. 그러나 때때로 다음과 같이 잡을 `high` 우선순위 큐로 푸시하고 싶을 수 있습니다.

```php
dispatch((new Job)->onQueue('high'));
```

`low` 큐의 잡을 계속하기 전에 모든 `high` 큐 잡이 처리되는지 확인하는 워커를 시작하려면 `work` 명령에 쉼표로 구분된 큐 이름 목록을 전달합니다.

```shell
php artisan queue:work --queue=high,low
```

<a name="queue-workers-and-deployment"></a>
### 큐 워커와 배포

큐 워커는 오래 실행되는 프로세스이므로 다시 시작하지 않으면 코드 변경 사항을 인식하지 못합니다. 따라서 큐 워커를 사용하는 애플리케이션을 배포하는 가장 간단한 방법은 배포 프로세스 중에 워커를 다시 시작하는 것입니다. `queue:restart` 명령을 실행하여 모든 워커를 정상적으로 다시 시작할 수 있습니다.

```shell
php artisan queue:restart
```

이 명령은 기존 잡이 손실되지 않도록 모든 큐 워커가 현재 잡 처리를 완료한 후 정상적으로 종료하도록 지시합니다. `queue:restart` 명령이 실행되면 큐 워커가 종료되므로 [Supervisor](#supervisor-configuration)와 같은 프로세스 관리자를 실행하여 큐 워커를 자동으로 다시 시작해야 합니다.

> [!NOTE]
> 큐는 [캐시](/docs/{{version}}/cache)를 사용하여 재시작 신호를 저장하므로 이 기능을 사용하기 전에 애플리케이션에 캐시 드라이버가 제대로 설정되어 있는지 확인해야 합니다.

<a name="job-expirations-and-timeouts"></a>
### 잡 만료 및 타임아웃

<a name="job-expiration"></a>
#### 잡 만료

`config/queue.php` 설정 파일에서 각 큐 연결은 `retry_after` 옵션을 정의합니다. 이 옵션은 처리 중인 잡을 재시도하기 전에 큐 연결이 대기해야 하는 시간(초)을 지정합니다. 예를 들어, `retry_after` 값이 `90`으로 설정되면 잡이 해제되거나 삭제되지 않고 90초 동안 처리되면 큐로 다시 릴리스됩니다. 일반적으로 `retry_after` 값은 잡이 처리를 완료하는 데 합리적으로 걸리는 최대 시간(초)으로 설정해야 합니다.

> [!WARNING]
> `retry_after` 값을 포함하지 않는 유일한 큐 연결은 Amazon SQS입니다. SQS는 AWS 콘솔 내에서 관리되는 [기본 가시성 타임아웃](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html)을 기반으로 잡을 재시도합니다.

<a name="worker-timeouts"></a>
#### 워커 타임아웃

`queue:work` Artisan 명령은 `--timeout` 옵션을 노출합니다. 기본적으로 `--timeout` 값은 60초입니다. 잡이 타임아웃 값으로 지정된 시간(초)보다 오래 처리되면 잡을 처리하는 워커가 오류와 함께 종료됩니다. 일반적으로 워커는 [서버에 설정된 프로세스 관리자](#supervisor-configuration)에 의해 자동으로 다시 시작됩니다.

```shell
php artisan queue:work --timeout=60
```

`retry_after` 설정 옵션과 `--timeout` CLI 옵션은 다르지만, 잡이 손실되지 않고 잡이 한 번만 성공적으로 처리되도록 함께 작동합니다.

> [!WARNING]
> `--timeout` 값은 항상 `retry_after` 설정 값보다 최소 몇 초 더 짧아야 합니다. 이렇게 하면 멈춘 잡을 처리하는 워커가 잡이 재시도되기 전에 항상 종료됩니다. `--timeout` 옵션이 `retry_after` 설정 값보다 길면 잡이 두 번 처리될 수 있습니다.

<a name="supervisor-configuration"></a>
## Supervisor 설정

프로덕션 환경에서는 `queue:work` 프로세스를 계속 실행하는 방법이 필요합니다. `queue:work` 프로세스는 워커 타임아웃 초과 또는 `queue:restart` 명령 실행 등 다양한 이유로 실행이 중지될 수 있습니다.

이러한 이유로 `queue:work` 프로세스가 종료되면 감지하고 자동으로 다시 시작할 수 있는 프로세스 모니터를 설정해야 합니다. 또한 프로세스 모니터를 사용하면 동시에 실행하려는 `queue:work` 프로세스 수를 지정할 수 있습니다. Supervisor는 Linux 환경에서 일반적으로 사용되는 프로세스 모니터이며, 다음 문서에서 설정 방법을 설명합니다.

<a name="installing-supervisor"></a>
#### Supervisor 설치하기

Supervisor는 Linux 운영 체제용 프로세스 모니터이며, `queue:work` 프로세스가 실패하면 자동으로 다시 시작합니다. Ubuntu에 Supervisor를 설치하려면 다음 명령을 사용할 수 있습니다.

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Supervisor를 직접 설정하고 관리하는 것이 부담스러우면 Laravel 큐 워커를 실행하기 위한 완전히 관리되는 플랫폼을 제공하는 [Laravel Cloud](https://cloud.laravel.com)를 고려해 보세요.

<a name="configuring-supervisor"></a>
#### Supervisor 설정하기

Supervisor 설정 파일은 일반적으로 `/etc/supervisor/conf.d` 디렉토리에 저장됩니다. 이 디렉토리 내에서 프로세스를 모니터링하는 방법을 supervisor에 지시하는 여러 설정 파일을 만들 수 있습니다. 예를 들어, `queue:work` 프로세스를 시작하고 모니터링하는 `laravel-worker.conf` 파일을 만들어 보겠습니다.

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/forge/app.com/artisan queue:work sqs --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=forge
numprocs=8
redirect_stderr=true
stdout_logfile=/home/forge/app.com/worker.log
stopwaitsecs=3600
```

이 예제에서 `numprocs` 지시어는 Supervisor에 8개의 `queue:work` 프로세스를 실행하고 모두 모니터링하여 실패하면 자동으로 다시 시작하도록 지시합니다. 원하는 큐 연결과 워커 옵션을 반영하도록 설정의 `command` 지시어를 변경해야 합니다.

> [!WARNING]
> `stopwaitsecs` 값이 가장 오래 실행되는 잡에서 소비되는 시간(초)보다 큰지 확인해야 합니다. 그렇지 않으면 Supervisor가 처리가 완료되기 전에 잡을 종료할 수 있습니다.

<a name="starting-supervisor"></a>
#### Supervisor 시작하기

설정 파일이 생성되면 다음 명령을 사용하여 Supervisor 설정을 업데이트하고 프로세스를 시작할 수 있습니다.

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start "laravel-worker:*"
```

Supervisor에 대한 자세한 내용은 [Supervisor 문서](http://supervisord.org/index.html)를 참조하세요.

<a name="dealing-with-failed-jobs"></a>
## 실패한 잡 처리하기

때때로 큐에 있는 잡이 실패할 수 있습니다. 걱정하지 마세요, 항상 계획대로 되는 것은 아닙니다! Laravel에는 [잡을 시도해야 하는 최대 횟수를 지정](#max-job-attempts-and-timeout)하는 편리한 방법이 포함되어 있습니다. 비동기 잡이 이 시도 횟수를 초과하면 `failed_jobs` 데이터베이스 테이블에 삽입됩니다. 실패한 [동기적으로 디스패치된 잡](/docs/{{version}}/queues#synchronous-dispatching)은 이 테이블에 저장되지 않으며 예외는 애플리케이션에서 즉시 처리됩니다.

`failed_jobs` 테이블을 생성하는 마이그레이션은 일반적으로 새 Laravel 애플리케이션에 이미 존재합니다. 그러나 애플리케이션에 이 테이블에 대한 마이그레이션이 없는 경우 `make:queue-failed-table` 명령을 사용하여 마이그레이션을 생성할 수 있습니다.

```shell
php artisan make:queue-failed-table

php artisan migrate
```

[큐 워커](#running-the-queue-worker) 프로세스를 실행할 때 `queue:work` 명령의 `--tries` 스위치를 사용하여 잡을 시도해야 하는 최대 횟수를 지정할 수 있습니다. `--tries` 옵션의 값을 지정하지 않으면 잡은 한 번만 시도되거나 잡 클래스의 `$tries` 속성에 지정된 횟수만큼 시도됩니다.

```shell
php artisan queue:work redis --tries=3
```

`--backoff` 옵션을 사용하면 예외가 발생한 잡을 재시도하기 전에 Laravel이 대기해야 하는 시간(초)을 지정할 수 있습니다. 기본적으로 잡은 즉시 큐로 다시 릴리스되어 다시 시도할 수 있습니다.

```shell
php artisan queue:work redis --tries=3 --backoff=3
```

잡별로 예외가 발생한 잡을 재시도하기 전에 Laravel이 대기해야 하는 시간(초)을 설정하려면 잡 클래스에 `backoff` 속성을 정의하면 됩니다.

```php
/**
 * The number of seconds to wait before retrying the job.
 *
 * @var int
 */
public $backoff = 3;
```

잡의 백오프 시간을 결정하기 위해 더 복잡한 로직이 필요한 경우 잡 클래스에 `backoff` 메서드를 정의할 수 있습니다.

```php
/**
 * Calculate the number of seconds to wait before retrying the job.
 */
public function backoff(): int
{
    return 3;
}
```

`backoff` 메서드에서 백오프 값의 배열을 반환하여 "지수적" 백오프를 쉽게 설정할 수 있습니다. 이 예제에서 재시도 지연은 첫 번째 재시도에 1초, 두 번째 재시도에 5초, 세 번째 재시도에 10초, 그리고 남은 시도가 더 있으면 이후 모든 재시도에 10초가 됩니다.

```php
/**
 * Calculate the number of seconds to wait before retrying the job.
 *
 * @return array<int, int>
 */
public function backoff(): array
{
    return [1, 5, 10];
}
```

<a name="cleaning-up-after-failed-jobs"></a>
### 실패한 잡 후 정리하기

특정 잡이 실패하면 사용자에게 알림을 보내거나 잡이 부분적으로 완료한 작업을 되돌리고 싶을 수 있습니다. 이를 위해 잡 클래스에 `failed` 메서드를 정의할 수 있습니다. 잡 실패를 유발한 `Throwable` 인스턴스가 `failed` 메서드에 전달됩니다.

```php
<?php

namespace App\Jobs;

use App\Models\Podcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AudioProcessor $processor): void
    {
        // Process uploaded podcast...
    }

    /**
     * Handle a job failure.
     */
    public function failed(?Throwable $exception): void
    {
        // Send user notification of failure, etc...
    }
}
```

> [!WARNING]
> `failed` 메서드를 호출하기 전에 잡의 새 인스턴스가 생성됩니다. 따라서 `handle` 메서드 내에서 발생했을 수 있는 클래스 속성 수정은 손실됩니다.

<a name="retrying-failed-jobs"></a>
### 실패한 잡 재시도하기

`failed_jobs` 데이터베이스 테이블에 삽입된 모든 실패한 잡을 보려면 `queue:failed` Artisan 명령을 사용할 수 있습니다.

```shell
php artisan queue:failed
```

`queue:failed` 명령은 잡 ID, 연결, 큐, 실패 시간 및 잡에 대한 기타 정보를 나열합니다. 잡 ID를 사용하여 실패한 잡을 재시도할 수 있습니다. 예를 들어, ID가 `ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece`인 실패한 잡을 재시도하려면 다음 명령을 실행합니다.

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece
```

필요한 경우 명령에 여러 ID를 전달할 수 있습니다.

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece 91401d2c-0784-4f43-824c-34f94a33c24d
```

특정 큐의 모든 실패한 잡을 재시도할 수도 있습니다.

```shell
php artisan queue:retry --queue=name
```

모든 실패한 잡을 재시도하려면 `queue:retry` 명령을 실행하고 ID로 `all`을 전달합니다.

```shell
php artisan queue:retry all
```

실패한 잡을 삭제하려면 `queue:forget` 명령을 사용할 수 있습니다.

```shell
php artisan queue:forget 91401d2c-0784-4f43-824c-34f94a33c24d
```

> [!NOTE]
> [Horizon](/docs/{{version}}/horizon)을 사용하는 경우 `queue:forget` 명령 대신 `horizon:forget` 명령을 사용하여 실패한 잡을 삭제해야 합니다.

`failed_jobs` 테이블에서 모든 실패한 잡을 삭제하려면 `queue:flush` 명령을 사용할 수 있습니다.

```shell
php artisan queue:flush
```

<a name="ignoring-missing-models"></a>
### 누락된 모델 무시하기

Eloquent 모델을 잡에 주입할 때 모델은 큐에 배치되기 전에 자동으로 직렬화되고 잡이 처리될 때 데이터베이스에서 다시 검색됩니다. 그러나 잡이 워커에 의해 처리되기를 기다리는 동안 모델이 삭제된 경우 잡이 `ModelNotFoundException`으로 실패할 수 있습니다.

편의를 위해 잡의 `deleteWhenMissingModels` 속성을 `true`로 설정하여 누락된 모델이 있는 잡을 자동으로 삭제하도록 선택할 수 있습니다. 이 속성이 `true`로 설정되면 Laravel은 예외를 발생시키지 않고 잡을 조용히 삭제합니다.

```php
/**
 * Delete the job if its models no longer exist.
 *
 * @var bool
 */
public $deleteWhenMissingModels = true;
```

<a name="pruning-failed-jobs"></a>
### 실패한 잡 정리하기

`queue:prune-failed` Artisan 명령을 호출하여 애플리케이션의 `failed_jobs` 테이블의 레코드를 정리할 수 있습니다.

```shell
php artisan queue:prune-failed
```

기본적으로 24시간이 지난 모든 실패한 잡 레코드가 정리됩니다. 명령에 `--hours` 옵션을 제공하면 최근 N시간 내에 삽입된 실패한 잡 레코드만 유지됩니다. 예를 들어, 다음 명령은 48시간 이전에 삽입된 모든 실패한 잡 레코드를 삭제합니다.

```shell
php artisan queue:prune-failed --hours=48
```

<a name="storing-failed-jobs-in-dynamodb"></a>
### DynamoDB에 실패한 잡 저장하기

Laravel은 관계형 데이터베이스 테이블 대신 [DynamoDB](https://aws.amazon.com/dynamodb)에 실패한 잡 레코드를 저장하는 것도 지원합니다. 그러나 모든 실패한 잡 레코드를 저장할 DynamoDB 테이블을 수동으로 만들어야 합니다. 일반적으로 이 테이블의 이름은 `failed_jobs`여야 하지만, 애플리케이션의 `queue` 설정 파일 내 `queue.failed.table` 설정 값에 따라 테이블 이름을 지정해야 합니다.

`failed_jobs` 테이블에는 `application`이라는 문자열 기본 파티션 키와 `uuid`라는 문자열 기본 정렬 키가 있어야 합니다. 키의 `application` 부분에는 애플리케이션의 `app` 설정 파일 내 `name` 설정 값으로 정의된 애플리케이션 이름이 포함됩니다. 애플리케이션 이름이 DynamoDB 테이블 키의 일부이므로 동일한 테이블을 사용하여 여러 Laravel 애플리케이션의 실패한 잡을 저장할 수 있습니다.

또한 Laravel 애플리케이션이 Amazon DynamoDB와 통신할 수 있도록 AWS SDK를 설치해야 합니다.

```shell
composer require aws/aws-sdk-php
```

다음으로 `queue.failed.driver` 설정 옵션의 값을 `dynamodb`로 설정합니다. 또한 실패한 잡 설정 배열 내에 `key`, `secret`, `region` 설정 옵션을 정의해야 합니다. 이러한 옵션은 AWS 인증에 사용됩니다. `dynamodb` 드라이버를 사용할 때 `queue.failed.database` 설정 옵션은 필요하지 않습니다.

```php
'failed' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'failed_jobs',
],
```

<a name="disabling-failed-job-storage"></a>
### 실패한 잡 저장 비활성화하기

`queue.failed.driver` 설정 옵션의 값을 `null`로 설정하여 Laravel에 실패한 잡을 저장하지 않고 삭제하도록 지시할 수 있습니다. 일반적으로 이는 `QUEUE_FAILED_DRIVER` 환경 변수를 통해 수행할 수 있습니다.

```ini
QUEUE_FAILED_DRIVER=null
```

<a name="failed-job-events"></a>
### 실패한 잡 이벤트

잡이 실패할 때 호출될 이벤트 리스너를 등록하려면 `Queue` 파사드의 `failing` 메서드를 사용할 수 있습니다. 예를 들어, Laravel에 포함된 `AppServiceProvider`의 `boot` 메서드에서 이 이벤트에 클로저를 첨부할 수 있습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobFailed;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Queue::failing(function (JobFailed $event) {
            // $event->connectionName
            // $event->job
            // $event->exception
        });
    }
}
```

<a name="clearing-jobs-from-queues"></a>
## 큐에서 잡 삭제하기

> [!NOTE]
> [Horizon](/docs/{{version}}/horizon)을 사용하는 경우 `queue:clear` 명령 대신 `horizon:clear` 명령을 사용하여 큐에서 잡을 삭제해야 합니다.

기본 연결의 기본 큐에서 모든 잡을 삭제하려면 `queue:clear` Artisan 명령을 사용할 수 있습니다.

```shell
php artisan queue:clear
```

특정 연결 및 큐에서 잡을 삭제하기 위해 `connection` 인수와 `queue` 옵션을 제공할 수도 있습니다.

```shell
php artisan queue:clear redis --queue=emails
```

> [!WARNING]
> 큐에서 잡을 삭제하는 것은 SQS, Redis 및 데이터베이스 큐 드라이버에서만 사용할 수 있습니다. 또한 SQS 메시지 삭제 프로세스는 최대 60초가 걸리므로 큐를 삭제한 후 최대 60초 이내에 SQS 큐로 전송된 잡도 삭제될 수 있습니다.

<a name="monitoring-your-queues"></a>
## 큐 모니터링하기

큐에 갑자기 잡이 대량으로 들어오면 큐가 과부하되어 잡 완료까지 오래 기다려야 할 수 있습니다. 원하는 경우 Laravel은 큐 잡 수가 지정된 임계값을 초과할 때 알림을 보낼 수 있습니다.

시작하려면 `queue:monitor` 명령을 [매분 실행](/docs/{{version}}/scheduling)하도록 스케줄해야 합니다. 이 명령은 모니터링하려는 큐의 이름과 원하는 잡 수 임계값을 인수로 받습니다.

```shell
php artisan queue:monitor redis:default,redis:deployments --max=100
```

이 명령만 스케줄하는 것으로는 큐의 과부하 상태를 알리는 알림을 트리거하기에 충분하지 않습니다. 명령이 임계값을 초과하는 잡 수를 가진 큐를 발견하면 `Illuminate\Queue\Events\QueueBusy` 이벤트가 디스패치됩니다. 애플리케이션의 `AppServiceProvider` 내에서 이 이벤트를 수신하여 사용자나 개발 팀에게 알림을 보낼 수 있습니다.

```php
use App\Notifications\QueueHasLongWaitTime;
use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(function (QueueBusy $event) {
        Notification::route('mail', 'dev@example.com')
            ->notify(new QueueHasLongWaitTime(
                $event->connection,
                $event->queue,
                $event->size
            ));
    });
}
```

<a name="testing"></a>
## 테스팅

잡을 디스패치하는 코드를 테스트할 때 잡 자체의 코드는 직접 별도로 테스트할 수 있으므로 Laravel이 실제로 잡을 실행하지 않도록 지시할 수 있습니다. 물론 잡 자체를 테스트하려면 테스트에서 잡 인스턴스를 생성하고 `handle` 메서드를 직접 호출할 수 있습니다.

`Queue` 파사드의 `fake` 메서드를 사용하여 큐에 있는 잡이 실제로 큐에 푸시되는 것을 방지할 수 있습니다. `Queue` 파사드의 `fake` 메서드를 호출한 후 애플리케이션이 큐에 잡을 푸시하려고 시도했는지 어설션할 수 있습니다.

```php tab=Pest
<?php

use App\Jobs\AnotherJob;
use App\Jobs\FinalJob;
use App\Jobs\ShipOrder;
use Illuminate\Support\Facades\Queue;

test('orders can be shipped', function () {
    Queue::fake();

    // Perform order shipping...

    // Assert that no jobs were pushed...
    Queue::assertNothingPushed();

    // Assert a job was pushed to a given queue...
    Queue::assertPushedOn('queue-name', ShipOrder::class);

    // Assert a job was pushed twice...
    Queue::assertPushed(ShipOrder::class, 2);

    // Assert a job was not pushed...
    Queue::assertNotPushed(AnotherJob::class);

    // Assert that a Closure was pushed to the queue...
    Queue::assertClosurePushed();

    // Assert the total number of jobs that were pushed...
    Queue::assertCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Jobs\AnotherJob;
use App\Jobs\FinalJob;
use App\Jobs\ShipOrder;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Queue::fake();

        // Perform order shipping...

        // Assert that no jobs were pushed...
        Queue::assertNothingPushed();

        // Assert a job was pushed to a given queue...
        Queue::assertPushedOn('queue-name', ShipOrder::class);

        // Assert a job was pushed twice...
        Queue::assertPushed(ShipOrder::class, 2);

        // Assert a job was not pushed...
        Queue::assertNotPushed(AnotherJob::class);

        // Assert that a Closure was pushed to the queue...
        Queue::assertClosurePushed();

        // Assert the total number of jobs that were pushed...
        Queue::assertCount(3);
    }
}
```

주어진 "진실 테스트"를 통과하는 잡이 푸시되었는지 어설션하기 위해 `assertPushed` 또는 `assertNotPushed` 메서드에 클로저를 전달할 수 있습니다. 주어진 진실 테스트를 통과하는 잡이 하나 이상 푸시되면 어설션이 성공합니다.

```php
Queue::assertPushed(function (ShipOrder $job) use ($order) {
    return $job->order->id === $order->id;
});
```

<a name="faking-a-subset-of-jobs"></a>
### 잡의 하위 집합 페이킹하기

특정 잡만 페이킹하고 다른 잡은 정상적으로 실행되도록 허용해야 하는 경우 페이킹해야 하는 잡의 클래스 이름을 `fake` 메서드에 전달할 수 있습니다.

```php tab=Pest
test('orders can be shipped', function () {
    Queue::fake([
        ShipOrder::class,
    ]);

    // Perform order shipping...

    // Assert a job was pushed twice...
    Queue::assertPushed(ShipOrder::class, 2);
});
```

```php tab=PHPUnit
public function test_orders_can_be_shipped(): void
{
    Queue::fake([
        ShipOrder::class,
    ]);

    // Perform order shipping...

    // Assert a job was pushed twice...
    Queue::assertPushed(ShipOrder::class, 2);
}
```

`except` 메서드를 사용하여 지정된 잡 집합을 제외한 모든 잡을 페이킹할 수 있습니다.

```php
Queue::fake()->except([
    ShipOrder::class,
]);
```

<a name="testing-job-chains"></a>
### 잡 체인 테스팅

잡 체인을 테스트하려면 `Bus` 파사드의 페이킹 기능을 활용해야 합니다. `Bus` 파사드의 `assertChained` 메서드를 사용하여 [잡 체인](/docs/{{version}}/queues#job-chaining)이 디스패치되었는지 어설션할 수 있습니다. `assertChained` 메서드는 체인된 잡의 배열을 첫 번째 인수로 받습니다.

```php
use App\Jobs\RecordShipment;
use App\Jobs\ShipOrder;
use App\Jobs\UpdateInventory;
use Illuminate\Support\Facades\Bus;

Bus::fake();

// ...

Bus::assertChained([
    ShipOrder::class,
    RecordShipment::class,
    UpdateInventory::class
]);
```

위 예제에서 볼 수 있듯이 체인된 잡의 배열은 잡의 클래스 이름 배열일 수 있습니다. 그러나 실제 잡 인스턴스 배열을 제공할 수도 있습니다. 이렇게 하면 Laravel은 잡 인스턴스가 동일한 클래스이고 애플리케이션에서 디스패치된 체인된 잡과 동일한 속성 값을 가지는지 확인합니다.

```php
Bus::assertChained([
    new ShipOrder,
    new RecordShipment,
    new UpdateInventory,
]);
```

`assertDispatchedWithoutChain` 메서드를 사용하여 잡 체인 없이 잡이 푸시되었는지 어설션할 수 있습니다.

```php
Bus::assertDispatchedWithoutChain(ShipOrder::class);
```

<a name="testing-chain-modifications"></a>
#### 체인 수정 테스팅

체인된 잡이 [기존 체인에 잡을 앞에 추가하거나 뒤에 추가](#adding-jobs-to-the-chain)하는 경우 잡의 `assertHasChain` 메서드를 사용하여 잡이 예상되는 남은 잡 체인을 가지고 있는지 어설션할 수 있습니다.

```php
$job = new ProcessPodcast;

$job->handle();

$job->assertHasChain([
    new TranscribePodcast,
    new OptimizePodcast,
    new ReleasePodcast,
]);
```

`assertDoesntHaveChain` 메서드를 사용하여 잡의 남은 체인이 비어 있는지 어설션할 수 있습니다.

```php
$job->assertDoesntHaveChain();
```

<a name="testing-chained-batches"></a>
#### 체인된 배치 테스팅

잡 체인에 [잡 배치가 포함](#chains-and-batches)되어 있는 경우, 체인 어설션 내에 `Bus::chainedBatch` 정의를 삽입하여 체인된 배치가 기대에 맞는지 어설션할 수 있습니다.

```php
use App\Jobs\ShipOrder;
use App\Jobs\UpdateInventory;
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

Bus::assertChained([
    new ShipOrder,
    Bus::chainedBatch(function (PendingBatch $batch) {
        return $batch->jobs->count() === 3;
    }),
    new UpdateInventory,
]);
```

<a name="testing-job-batches"></a>
### 잡 배치 테스팅

`Bus` 파사드의 `assertBatched` 메서드를 사용하여 [잡 배치](/docs/{{version}}/queues#job-batching)가 디스패치되었는지 어설션할 수 있습니다. `assertBatched` 메서드에 제공된 클로저는 배치 내의 잡을 검사하는 데 사용할 수 있는 `Illuminate\Bus\PendingBatch` 인스턴스를 받습니다.

```php
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

Bus::fake();

// ...

Bus::assertBatched(function (PendingBatch $batch) {
    return $batch->name == 'import-csv' &&
           $batch->jobs->count() === 10;
});
```

`assertBatchCount` 메서드를 사용하여 지정된 수의 배치가 디스패치되었는지 어설션할 수 있습니다.

```php
Bus::assertBatchCount(3);
```

`assertNothingBatched`를 사용하여 배치가 디스패치되지 않았는지 어설션할 수 있습니다.

```php
Bus::assertNothingBatched();
```

<a name="testing-job-batch-interaction"></a>
#### 잡 / 배치 상호 작용 테스팅

또한 때때로 개별 잡과 기본 배치의 상호 작용을 테스트해야 할 수 있습니다. 예를 들어, 잡이 해당 배치에 대한 추가 처리를 취소했는지 테스트해야 할 수 있습니다. 이를 위해 `withFakeBatch` 메서드를 통해 잡에 페이크 배치를 할당해야 합니다. `withFakeBatch` 메서드는 잡 인스턴스와 페이크 배치를 포함하는 튜플을 반환합니다.

```php
[$job, $batch] = (new ShipOrder)->withFakeBatch();

$job->handle();

$this->assertTrue($batch->cancelled());
$this->assertEmpty($batch->added);
```

<a name="testing-job-queue-interactions"></a>
### 잡 / 큐 상호 작용 테스팅

때로는 큐에 있는 잡이 [스스로를 큐로 다시 릴리스](#manually-releasing-a-job)하는지 테스트해야 할 수 있습니다. 또는 잡이 스스로를 삭제했는지 테스트해야 할 수 있습니다. 잡을 인스턴스화하고 `withFakeQueueInteractions` 메서드를 호출하여 이러한 큐 상호 작용을 테스트할 수 있습니다.

잡의 큐 상호 작용이 페이킹되면 잡에서 `handle` 메서드를 호출할 수 있습니다. 잡을 호출한 후 `assertReleased`, `assertDeleted`, `assertNotDeleted`, `assertFailed`, `assertFailedWith`, `assertNotFailed` 메서드를 사용하여 잡의 큐 상호 작용에 대한 어설션을 만들 수 있습니다.

```php
use App\Exceptions\CorruptedAudioException;
use App\Jobs\ProcessPodcast;

$job = (new ProcessPodcast)->withFakeQueueInteractions();

$job->handle();

$job->assertReleased(delay: 30);
$job->assertDeleted();
$job->assertNotDeleted();
$job->assertFailed();
$job->assertFailedWith(CorruptedAudioException::class);
$job->assertNotFailed();
```

<a name="job-events"></a>
## 잡 이벤트

`Queue` [파사드](/docs/{{version}}/facades)의 `before` 및 `after` 메서드를 사용하여 큐에 있는 잡이 처리되기 전이나 후에 실행될 콜백을 지정할 수 있습니다. 이러한 콜백은 대시보드에 대한 추가 로깅을 수행하거나 통계를 증가시키는 좋은 기회입니다. 일반적으로 [서비스 프로바이더](/docs/{{version}}/providers)의 `boot` 메서드에서 이러한 메서드를 호출해야 합니다. 예를 들어, Laravel에 포함된 `AppServiceProvider`를 사용할 수 있습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Queue::before(function (JobProcessing $event) {
            // $event->connectionName
            // $event->job
            // $event->job->payload()
        });

        Queue::after(function (JobProcessed $event) {
            // $event->connectionName
            // $event->job
            // $event->job->payload()
        });
    }
}
```

`Queue` [파사드](/docs/{{version}}/facades)의 `looping` 메서드를 사용하여 워커가 큐에서 잡을 가져오기 전에 실행될 콜백을 지정할 수 있습니다. 예를 들어, 이전에 실패한 잡으로 인해 열린 상태로 남아 있는 트랜잭션을 롤백하는 클로저를 등록할 수 있습니다.

```php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

Queue::looping(function () {
    while (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
});
```

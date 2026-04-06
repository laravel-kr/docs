# 라라벨 AI SDK

- [소개](#introduction)
- [설치](#installation)
    - [설정](#configuration)
    - [커스텀 기본 URL](#custom-base-urls)
    - [프로바이더 지원](#provider-support)
- [에이전트](#agents)
    - [프롬프팅](#prompting)
    - [대화 컨텍스트](#conversation-context)
    - [구조화된 출력](#structured-output)
    - [첨부 파일](#attachments)
    - [스트리밍](#streaming)
    - [브로드캐스팅](#broadcasting)
    - [큐잉](#queueing)
    - [도구](#tools)
    - [프로바이더 도구](#provider-tools)
    - [미들웨어](#middleware)
    - [익명 에이전트](#anonymous-agents)
    - [에이전트 설정](#agent-configuration)
    - [프로바이더 옵션](#provider-options)
- [이미지](#images)
- [오디오 (TTS)](#audio)
- [음성 변환 (STT)](#transcription)
- [임베딩](#embeddings)
    - [임베딩 쿼리](#querying-embeddings)
    - [임베딩 캐싱](#caching-embeddings)
- [리랭킹](#reranking)
- [파일](#files)
- [벡터 스토어](#vector-stores)
    - [스토어에 파일 추가](#adding-files-to-stores)
- [페일오버](#failover)
- [테스트](#testing)
    - [에이전트](#testing-agents)
    - [이미지](#testing-images)
    - [오디오](#testing-audio)
    - [음성 변환](#testing-transcriptions)
    - [임베딩](#testing-embeddings)
    - [리랭킹](#testing-reranking)
    - [파일](#testing-files)
    - [벡터 스토어](#testing-vector-stores)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

[라라벨 AI SDK](https://github.com/laravel/ai)는 OpenAI, Anthropic, Gemini 등 다양한 AI 프로바이더와 상호작용하기 위한 통합적이고 표현력 있는 API를 제공합니다. AI SDK를 사용하면 도구와 구조화된 출력을 갖춘 지능형 에이전트를 구축하고, 이미지를 생성하고, 오디오를 합성 및 변환하고, 벡터 임베딩을 생성하는 등의 작업을 일관된 라라벨 친화적 인터페이스로 수행할 수 있습니다.

<a name="installation"></a>
## 설치

Composer를 통해 라라벨 AI SDK를 설치할 수 있습니다.

```shell
composer require laravel/ai
```

다음으로, `vendor:publish` Artisan 명령어를 사용하여 AI SDK 설정 파일과 마이그레이션 파일을 퍼블리시해야 합니다.

```shell
php artisan vendor:publish --provider="Laravel\Ai\AiServiceProvider"
```

마지막으로, 애플리케이션의 데이터베이스 마이그레이션을 실행해야 합니다. 이 마이그레이션은 AI SDK가 대화 저장 기능을 제공하는 데 사용하는 `agent_conversations` 및 `agent_conversation_messages` 테이블을 생성합니다.

```shell
php artisan migrate
```

<a name="configuration"></a>
### 설정

애플리케이션의 `config/ai.php` 설정 파일이나 `.env` 파일에서 환경 변수로 AI 프로바이더 자격 증명을 정의할 수 있습니다.

```ini
ANTHROPIC_API_KEY=
COHERE_API_KEY=
ELEVENLABS_API_KEY=
GEMINI_API_KEY=
MISTRAL_API_KEY=
OLLAMA_API_KEY=
OPENAI_API_KEY=
JINA_API_KEY=
VOYAGEAI_API_KEY=
XAI_API_KEY=
```

텍스트, 이미지, 오디오, 음성 변환, 임베딩에 사용되는 기본 모델도 애플리케이션의 `config/ai.php` 설정 파일에서 구성할 수 있습니다.

<a name="custom-base-urls"></a>
### 커스텀 기본 URL

기본적으로 라라벨 AI SDK는 각 프로바이더의 공개 API 엔드포인트에 직접 연결합니다. 그러나 프록시 서비스를 사용하여 API 키 관리를 중앙화하거나, 속도 제한을 구현하거나, 기업 게이트웨이를 통해 트래픽을 라우팅하는 등의 경우에는 다른 엔드포인트로 요청을 라우팅해야 할 수 있습니다.

프로바이더 설정에 `url` 매개변수를 추가하여 커스텀 기본 URL을 구성할 수 있습니다.

```php
'providers' => [
    'openai' => [
        'driver' => 'openai',
        'key' => env('OPENAI_API_KEY'),
        'url' => env('OPENAI_BASE_URL'),
    ],

    'anthropic' => [
        'driver' => 'anthropic',
        'key' => env('ANTHROPIC_API_KEY'),
        'url' => env('ANTHROPIC_BASE_URL'),
    ],
],
```

이 기능은 프록시 서비스(LiteLLM이나 Azure OpenAI Gateway 등)를 통해 요청을 라우팅하거나 대체 엔드포인트를 사용할 때 유용합니다.

커스텀 기본 URL은 다음 프로바이더에서 지원됩니다: OpenAI, Anthropic, Gemini, Groq, Cohere, DeepSeek, xAI, OpenRouter.

<a name="provider-support"></a>
### 프로바이더 지원

AI SDK는 다양한 기능에 걸쳐 여러 프로바이더를 지원합니다. 다음 표는 각 기능에서 사용 가능한 프로바이더를 요약합니다.

| 기능 | 프로바이더 |
|---|---|
| 텍스트 | OpenAI, Anthropic, Gemini, Azure, Groq, xAI, DeepSeek, Mistral, Ollama |
| 이미지 | OpenAI, Gemini, xAI |
| TTS | OpenAI, ElevenLabs |
| STT | OpenAI, ElevenLabs, Mistral |
| 임베딩 | OpenAI, Gemini, Azure, Cohere, Mistral, Jina, VoyageAI |
| 리랭킹 | Cohere, Jina |
| 파일 | OpenAI, Anthropic, Gemini |

`Laravel\Ai\Enums\Lab` enum을 사용하면 코드 전체에서 문자열 대신 프로바이더를 참조할 수 있습니다.

```php
use Laravel\Ai\Enums\Lab;

Lab::Anthropic;
Lab::OpenAI;
Lab::Gemini;
// ...
```

<a name="agents"></a>
## 에이전트

에이전트는 라라벨 AI SDK에서 AI 프로바이더와 상호작용하기 위한 기본 구성 요소입니다. 각 에이전트는 대규모 언어 모델과 상호작용하는 데 필요한 지시사항, 대화 컨텍스트, 도구, 출력 스키마를 캡슐화하는 전용 PHP 클래스입니다. 에이전트를 영업 코치, 문서 분석기, 지원 봇과 같은 전문화된 어시스턴트로 생각하시면 됩니다. 한 번 구성하면 애플리케이션 전체에서 필요에 따라 프롬프트할 수 있습니다.

`make:agent` Artisan 명령어를 통해 에이전트를 생성할 수 있습니다.

```shell
php artisan make:agent SalesCoach

php artisan make:agent SalesCoach --structured
```

생성된 에이전트 클래스에서 시스템 프롬프트/지시사항, 메시지 컨텍스트, 사용 가능한 도구, 출력 스키마(해당되는 경우)를 정의할 수 있습니다.

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Tools\RetrievePreviousTranscripts;
use App\Models\History;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class SalesCoach implements Agent, Conversational, HasTools, HasStructuredOutput
{
    use Promptable;

    public function __construct(public User $user) {}

    /**
     * 에이전트가 따라야 할 지시사항을 가져옵니다.
     */
    public function instructions(): Stringable|string
    {
        return 'You are a sales coach, analyzing transcripts and providing feedback and an overall sales strength score.';
    }

    /**
     * 지금까지의 대화를 구성하는 메시지 목록을 가져옵니다.
     */
    public function messages(): iterable
    {
        return History::where('user_id', $this->user->id)
            ->latest()
            ->limit(50)
            ->get()
            ->reverse()
            ->map(function ($message) {
                return new Message($message->role, $message->content);
            })->all();
    }

    /**
     * 에이전트가 사용할 수 있는 도구를 가져옵니다.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new RetrievePreviousTranscripts,
        ];
    }

    /**
     * 에이전트의 구조화된 출력 스키마 정의를 가져옵니다.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'feedback' => $schema->string()->required(),
            'score' => $schema->integer()->min(1)->max(10)->required(),
        ];
    }
}
```

<a name="prompting"></a>
### 프롬프팅

에이전트에 프롬프트를 보내려면, 먼저 `make` 메서드나 일반적인 인스턴스화를 사용하여 인스턴스를 생성한 다음 `prompt`를 호출합니다.

```php
$response = (new SalesCoach)
    ->prompt('Analyze this sales transcript...');

return (string) $response;
```

`make` 메서드는 컨테이너에서 에이전트를 리졸브하여 자동 의존성 주입을 가능하게 합니다. 에이전트 생성자에 인자를 전달할 수도 있습니다.

```php
$agent = SalesCoach::make(user: $user);
```

`prompt` 메서드에 추가 인자를 전달하여 프롬프트 시 기본 프로바이더, 모델 또는 HTTP 타임아웃을 재정의할 수 있습니다.

```php
$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: Lab::Anthropic,
    model: 'claude-haiku-4-5-20251001',
    timeout: 120,
);
```

<a name="conversation-context"></a>
### 대화 컨텍스트

에이전트가 `Conversational` 인터페이스를 구현하는 경우, `messages` 메서드를 사용하여 이전 대화 컨텍스트를 반환할 수 있습니다.

```php
use App\Models\History;
use Laravel\Ai\Messages\Message;

/**
 * 지금까지의 대화를 구성하는 메시지 목록을 가져옵니다.
 */
public function messages(): iterable
{
    return History::where('user_id', $this->user->id)
        ->latest()
        ->limit(50)
        ->get()
        ->reverse()
        ->map(function ($message) {
            return new Message($message->role, $message->content);
        })->all();
}
```

<a name="remembering-conversations"></a>
#### 대화 기억하기

> **Note:** `RemembersConversations` 트레이트를 사용하기 전에, `vendor:publish` Artisan 명령어를 사용하여 AI SDK 마이그레이션을 퍼블리시하고 실행해야 합니다. 이 마이그레이션은 대화를 저장하는 데 필요한 데이터베이스 테이블을 생성합니다.

라라벨이 에이전트의 대화 기록을 자동으로 저장하고 검색하도록 하려면, `RemembersConversations` 트레이트를 사용할 수 있습니다. 이 트레이트는 `Conversational` 인터페이스를 수동으로 구현하지 않고도 대화 메시지를 데이터베이스에 영구 저장하는 간단한 방법을 제공합니다.

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, Conversational
{
    use Promptable, RemembersConversations;

    /**
     * 에이전트가 따라야 할 지시사항을 가져옵니다.
     */
    public function instructions(): string
    {
        return 'You are a sales coach...';
    }
}
```

사용자의 새 대화를 시작하려면, 프롬프트하기 전에 `forUser` 메서드를 호출합니다.

```php
$response = (new SalesCoach)->forUser($user)->prompt('Hello!');

$conversationId = $response->conversationId;
```

대화 ID는 응답에 포함되어 반환되며 나중에 참조하기 위해 저장할 수 있습니다. 또는 `agent_conversations` 테이블에서 직접 사용자의 모든 대화를 조회할 수도 있습니다.

기존 대화를 계속하려면 `continue` 메서드를 사용합니다.

```php
$response = (new SalesCoach)
    ->continue($conversationId, as: $user)
    ->prompt('Tell me more about that.');
```

`RemembersConversations` 트레이트를 사용할 때, 프롬프트 시 이전 메시지가 자동으로 로드되어 대화 컨텍스트에 포함됩니다. 새 메시지(사용자 및 어시스턴트 모두)는 각 상호작용 후 자동으로 저장됩니다.

<a name="structured-output"></a>
### 구조화된 출력

에이전트가 구조화된 출력을 반환하도록 하려면, `HasStructuredOutput` 인터페이스를 구현하세요. 이 인터페이스는 에이전트에 `schema` 메서드를 정의하도록 요구합니다.

```php
<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasStructuredOutput
{
    use Promptable;

    // ...

    /**
     * 에이전트의 구조화된 출력 스키마 정의를 가져옵니다.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'score' => $schema->integer()->required(),
        ];
    }
}
```

구조화된 출력을 반환하는 에이전트에 프롬프트할 때, 반환된 `StructuredAgentResponse`를 배열처럼 접근할 수 있습니다.

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

return $response['score'];
```

<a name="attachments"></a>
### 첨부 파일

프롬프트 시 첨부 파일을 함께 전달하여 모델이 이미지와 문서를 검사하도록 할 수 있습니다.

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Files;

$response = (new SalesCoach)->prompt(
    'Analyze the attached sales transcript...',
    attachments: [
        Files\Document::fromStorage('transcript.pdf') // 파일시스템 디스크에서 문서 첨부...
        Files\Document::fromPath('/home/laravel/transcript.md') // 로컬 경로에서 문서 첨부...
        $request->file('transcript'), // 업로드된 파일 첨부...
    ]
);
```

마찬가지로, `Laravel\Ai\Files\Image` 클래스를 사용하여 프롬프트에 이미지를 첨부할 수 있습니다.

```php
use App\Ai\Agents\ImageAnalyzer;
use Laravel\Ai\Files;

$response = (new ImageAnalyzer)->prompt(
    'What is in this image?',
    attachments: [
        Files\Image::fromStorage('photo.jpg') // 파일시스템 디스크에서 이미지 첨부...
        Files\Image::fromPath('/home/laravel/photo.jpg') // 로컬 경로에서 이미지 첨부...
        $request->file('photo'), // 업로드된 파일 첨부...
    ]
);
```

<a name="streaming"></a>
### 스트리밍

에이전트의 응답을 스트리밍하려면 `stream` 메서드를 호출합니다. 반환된 `StreamableAgentResponse`는 라우트에서 반환되어 자동으로 클라이언트에 스트리밍 응답(SSE)을 보낼 수 있습니다.

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)->stream('Analyze this sales transcript...');
});
```

`then` 메서드를 사용하면 전체 응답이 클라이언트에 스트리밍된 후 호출될 클로저를 제공할 수 있습니다.

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Responses\StreamedAgentResponse;

Route::get('/coach', function () {
    return (new SalesCoach)
        ->stream('Analyze this sales transcript...')
        ->then(function (StreamedAgentResponse $response) {
            // $response->text, $response->events, $response->usage...
        });
});
```

또는 스트리밍된 이벤트를 수동으로 반복할 수도 있습니다.

```php
$stream = (new SalesCoach)->stream('Analyze this sales transcript...');

foreach ($stream as $event) {
    // ...
}
```

<a name="streaming-using-the-vercel-ai-sdk-protocol"></a>
#### Vercel AI SDK 프로토콜을 사용한 스트리밍

스트리밍 가능한 응답에서 `usingVercelDataProtocol` 메서드를 호출하여 [Vercel AI SDK 스트림 프로토콜](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)을 사용하여 이벤트를 스트리밍할 수 있습니다.

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)
        ->stream('Analyze this sales transcript...')
        ->usingVercelDataProtocol();
});
```

<a name="broadcasting"></a>
### 브로드캐스팅

스트리밍된 이벤트를 몇 가지 방법으로 브로드캐스트할 수 있습니다. 먼저, 스트리밍된 이벤트에서 `broadcast` 또는 `broadcastNow` 메서드를 간단히 호출할 수 있습니다.

```php
use App\Ai\Agents\SalesCoach;
use Illuminate\Broadcasting\Channel;

$stream = (new SalesCoach)->stream('Analyze this sales transcript...');

foreach ($stream as $event) {
    $event->broadcast(new Channel('channel-name'));
}
```

또는, 에이전트의 `broadcastOnQueue` 메서드를 호출하여 에이전트 작업을 큐에 넣고 스트리밍된 이벤트가 준비되는 대로 브로드캐스트할 수 있습니다.

```php
(new SalesCoach)->broadcastOnQueue(
    'Analyze this sales transcript...'
    new Channel('channel-name'),
);
```

<a name="queueing"></a>
### 큐잉

에이전트의 `queue` 메서드를 사용하면, 에이전트에 프롬프트를 보내되 응답 처리를 백그라운드에서 수행하도록 하여 애플리케이션의 빠르고 반응적인 느낌을 유지할 수 있습니다. `then`과 `catch` 메서드를 사용하여 응답이 준비되었을 때 또는 예외가 발생했을 때 호출될 클로저를 등록할 수 있습니다.

```php
use Illuminate\Http\Request;
use Laravel\Ai\Responses\AgentResponse;
use Throwable;

Route::post('/coach', function (Request $request) {
    return (new SalesCoach)
        ->queue($request->input('transcript'))
        ->then(function (AgentResponse $response) {
            // ...
        })
        ->catch(function (Throwable $e) {
            // ...
        });

    return back();
});
```

<a name="tools"></a>
### 도구

도구를 사용하면 에이전트가 프롬프트에 응답하면서 활용할 수 있는 추가 기능을 제공할 수 있습니다. `make:tool` Artisan 명령어를 사용하여 도구를 생성할 수 있습니다.

```shell
php artisan make:tool RandomNumberGenerator
```

생성된 도구는 애플리케이션의 `app/Ai/Tools` 디렉터리에 배치됩니다. 각 도구에는 에이전트가 도구를 활용해야 할 때 호출되는 `handle` 메서드가 포함됩니다.

```php
<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class RandomNumberGenerator implements Tool
{
    /**
     * 도구의 목적에 대한 설명을 가져옵니다.
     */
    public function description(): Stringable|string
    {
        return 'This tool may be used to generate cryptographically secure random numbers.';
    }

    /**
     * 도구를 실행합니다.
     */
    public function handle(Request $request): Stringable|string
    {
        return (string) random_int($request['min'], $request['max']);
    }

    /**
     * 도구의 스키마 정의를 가져옵니다.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'min' => $schema->integer()->min(0)->required(),
            'max' => $schema->integer()->required(),
        ];
    }
}
```

도구를 정의한 후에는, 에이전트의 `tools` 메서드에서 해당 도구를 반환할 수 있습니다.

```php
use App\Ai\Tools\RandomNumberGenerator;

/**
 * 에이전트가 사용할 수 있는 도구를 가져옵니다.
 *
 * @return Tool[]
 */
public function tools(): iterable
{
    return [
        new RandomNumberGenerator,
    ];
}
```

<a name="similarity-search"></a>
#### 유사성 검색

`SimilaritySearch` 도구를 사용하면 에이전트가 데이터베이스에 저장된 벡터 임베딩을 사용하여 주어진 쿼리와 유사한 문서를 검색할 수 있습니다. 이 도구는 에이전트가 애플리케이션 데이터를 검색할 수 있도록 하는 검색 증강 생성(RAG)에 유용합니다.

유사성 검색 도구를 생성하는 가장 간단한 방법은 벡터 임베딩이 있는 Eloquent 모델과 함께 `usingModel` 메서드를 사용하는 것입니다.

```php
use App\Models\Document;
use Laravel\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        SimilaritySearch::usingModel(Document::class, 'embedding'),
    ];
}
```

첫 번째 인자는 Eloquent 모델 클래스이고, 두 번째 인자는 벡터 임베딩이 포함된 컬럼입니다.

`0.0`에서 `1.0` 사이의 최소 유사도 임계값과 쿼리를 커스터마이즈하는 클로저를 제공할 수도 있습니다.

```php
SimilaritySearch::usingModel(
    model: Document::class,
    column: 'embedding',
    minSimilarity: 0.7,
    limit: 10,
    query: fn ($query) => $query->where('published', true),
),
```

더 세밀한 제어를 위해, 검색 결과를 반환하는 커스텀 클로저를 사용하여 유사성 검색 도구를 생성할 수 있습니다.

```php
use App\Models\Document;
use Laravel\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        new SimilaritySearch(using: function (string $query) {
            return Document::query()
                ->where('user_id', $this->user->id)
                ->whereVectorSimilarTo('embedding', $query)
                ->limit(10)
                ->get();
        }),
    ];
}
```

`withDescription` 메서드를 사용하여 도구의 설명을 커스터마이즈할 수 있습니다.

```php
SimilaritySearch::usingModel(Document::class, 'embedding')
    ->withDescription('Search the knowledge base for relevant articles.'),
```

<a name="provider-tools"></a>
### 프로바이더 도구

프로바이더 도구는 AI 프로바이더가 네이티브로 구현한 특수 도구로, 웹 검색, URL 가져오기, 파일 검색과 같은 기능을 제공합니다. 일반 도구와 달리 프로바이더 도구는 여러분의 애플리케이션이 아닌 프로바이더 자체에서 실행됩니다.

프로바이더 도구는 에이전트의 `tools` 메서드에서 반환할 수 있습니다.

<a name="web-search"></a>
#### 웹 검색

`WebSearch` 프로바이더 도구를 사용하면 에이전트가 실시간 정보를 위해 웹을 검색할 수 있습니다. 현재 이벤트, 최신 데이터, 모델의 학습 마감 이후 변경되었을 수 있는 주제에 대한 질문에 답할 때 유용합니다.

**지원 프로바이더:** Anthropic, OpenAI, Gemini

```php
use Laravel\Ai\Providers\Tools\WebSearch;

public function tools(): iterable
{
    return [
        new WebSearch,
    ];
}
```

웹 검색 도구에서 검색 횟수를 제한하거나 특정 도메인으로 결과를 제한하도록 구성할 수 있습니다.

```php
(new WebSearch)->max(5)->allow(['laravel.com', 'php.net']),
```

사용자 위치를 기반으로 검색 결과를 세분화하려면 `location` 메서드를 사용합니다.

```php
(new WebSearch)->location(
    city: 'New York',
    region: 'NY',
    country: 'US'
);
```

<a name="web-fetch"></a>
#### 웹 페치

`WebFetch` 프로바이더 도구를 사용하면 에이전트가 웹 페이지의 내용을 가져와서 읽을 수 있습니다. 에이전트가 특정 URL을 분석하거나 알려진 웹 페이지에서 상세 정보를 가져와야 할 때 유용합니다.

**지원 프로바이더:** Anthropic, Gemini

```php
use Laravel\Ai\Providers\Tools\WebFetch;

public function tools(): iterable
{
    return [
        new WebFetch,
    ];
}
```

웹 페치 도구에서 가져오기 횟수를 제한하거나 특정 도메인으로 제한하도록 구성할 수 있습니다.

```php
(new WebFetch)->max(3)->allow(['docs.laravel.com']),
```

<a name="file-search"></a>
#### 파일 검색

`FileSearch` 프로바이더 도구를 사용하면 에이전트가 [벡터 스토어](#vector-stores)에 저장된 [파일](#files)을 검색할 수 있습니다. 이를 통해 에이전트가 업로드된 문서에서 관련 정보를 검색하는 검색 증강 생성(RAG)이 가능해집니다.

**지원 프로바이더:** OpenAI, Gemini

```php
use Laravel\Ai\Providers\Tools\FileSearch;

public function tools(): iterable
{
    return [
        new FileSearch(stores: ['store_id']),
    ];
}
```

여러 벡터 스토어 ID를 제공하여 여러 스토어에 걸쳐 검색할 수 있습니다.

```php
new FileSearch(stores: ['store_1', 'store_2']);
```

파일에 [메타데이터](#adding-files-to-stores)가 있는 경우, `where` 인자를 제공하여 검색 결과를 필터링할 수 있습니다. 단순 동등 필터의 경우 배열을 전달합니다.

```php
new FileSearch(stores: ['store_id'], where: [
    'author' => 'Taylor Otwell',
    'year' => 2026,
]);
```

더 복잡한 필터의 경우, `FileSearchQuery` 인스턴스를 받는 클로저를 전달할 수 있습니다.

```php
use Laravel\Ai\Providers\Tools\FileSearchQuery;

new FileSearch(stores: ['store_id'], where: fn (FileSearchQuery $query) =>
    $query->where('author', 'Taylor Otwell')
        ->whereNot('status', 'draft')
        ->whereIn('category', ['news', 'updates'])
);
```

<a name="middleware"></a>
### 미들웨어

에이전트는 미들웨어를 지원하여, 프롬프트가 프로바이더에 전송되기 전에 가로채서 수정할 수 있습니다. 미들웨어는 `make:agent-middleware` Artisan 명령어를 사용하여 생성할 수 있습니다.

```shell
php artisan make:agent-middleware LogPrompts
```

생성된 미들웨어는 애플리케이션의 `app/Ai/Middleware` 디렉터리에 배치됩니다. 에이전트에 미들웨어를 추가하려면 `HasMiddleware` 인터페이스를 구현하고 미들웨어 클래스 배열을 반환하는 `middleware` 메서드를 정의합니다.

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Middleware\LogPrompts;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasMiddleware;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasMiddleware
{
    use Promptable;

    // ...

    /**
     * 에이전트의 미들웨어를 가져옵니다.
     */
    public function middleware(): array
    {
        return [
            new LogPrompts,
        ];
    }
}
```

각 미들웨어 클래스는 `AgentPrompt`와 프롬프트를 다음 미들웨어로 전달하는 `Closure`를 받는 `handle` 메서드를 정의해야 합니다.

```php
<?php

namespace App\Ai\Middleware;

use Closure;
use Laravel\Ai\Prompts\AgentPrompt;

class LogPrompts
{
    /**
     * 들어오는 프롬프트를 처리합니다.
     */
    public function handle(AgentPrompt $prompt, Closure $next)
    {
        Log::info('Prompting agent', ['prompt' => $prompt->prompt]);

        return $next($prompt);
    }
}
```

응답의 `then` 메서드를 사용하여 에이전트가 처리를 완료한 후 코드를 실행할 수 있습니다. 이는 동기식 및 스트리밍 응답 모두에서 작동합니다.

```php
public function handle(AgentPrompt $prompt, Closure $next)
{
    return $next($prompt)->then(function (AgentResponse $response) {
        Log::info('Agent responded', ['text' => $response->text]);
    });
}
```

<a name="anonymous-agents"></a>
### 익명 에이전트

때로는 전용 에이전트 클래스를 만들지 않고 모델과 빠르게 상호작용하고 싶을 수 있습니다. `agent` 함수를 사용하여 임시의 익명 에이전트를 생성할 수 있습니다.

```php
use function Laravel\Ai\{agent};

$response = agent(
    instructions: 'You are an expert at software development.',
    messages: [],
    tools: [],
)->prompt('Tell me about Laravel')
```

익명 에이전트도 구조화된 출력을 생성할 수 있습니다.

```php
use Illuminate\Contracts\JsonSchema\JsonSchema;

use function Laravel\Ai\{agent};

$response = agent(
    schema: fn (JsonSchema $schema) => [
        'number' => $schema->integer()->required(),
    ],
)->prompt('Generate a random number less than 100')
```

<a name="agent-configuration"></a>
### 에이전트 설정

PHP 속성(Attributes)을 사용하여 에이전트의 텍스트 생성 옵션을 구성할 수 있습니다. 다음 속성을 사용할 수 있습니다.

- `MaxSteps`: 도구 사용 시 에이전트가 수행할 수 있는 최대 단계 수입니다.
- `MaxTokens`: 모델이 생성할 수 있는 최대 토큰 수입니다.
- `Model`: 에이전트가 사용해야 할 모델입니다.
- `Provider`: 에이전트에 사용할 AI 프로바이더(또는 페일오버를 위한 여러 프로바이더)입니다.
- `Temperature`: 생성에 사용할 샘플링 온도(0.0에서 1.0)입니다.
- `Timeout`: 에이전트 요청의 HTTP 타임아웃(초 단위, 기본값: 60)입니다.
- `UseCheapestModel`: 비용 최적화를 위해 프로바이더의 가장 저렴한 텍스트 모델을 사용합니다.
- `UseSmartestModel`: 복잡한 작업을 위해 프로바이더의 가장 뛰어난 텍스트 모델을 사용합니다.

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

#[Provider(Lab::Anthropic)]
#[Model('claude-haiku-4-5-20251001')]
#[MaxSteps(10)]
#[MaxTokens(4096)]
#[Temperature(0.7)]
#[Timeout(120)]
class SalesCoach implements Agent
{
    use Promptable;

    // ...
}
```

`UseCheapestModel`과 `UseSmartestModel` 속성을 사용하면 모델 이름을 지정하지 않고도 주어진 프로바이더에 대해 가장 비용 효율적이거나 가장 뛰어난 모델을 자동으로 선택할 수 있습니다. 이는 다양한 프로바이더에 걸쳐 비용이나 성능을 최적화하려는 경우에 유용합니다.

```php
use Laravel\Ai\Attributes\UseCheapestModel;
use Laravel\Ai\Attributes\UseSmartestModel;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

#[UseCheapestModel]
class SimpleSummarizer implements Agent
{
    use Promptable;

    // 가장 저렴한 모델을 사용합니다 (예: Haiku)...
}

#[UseSmartestModel]
class ComplexReasoner implements Agent
{
    use Promptable;

    // 가장 뛰어난 모델을 사용합니다 (예: Opus)...
}
```

<a name="provider-options"></a>
### 프로바이더 옵션

에이전트가 프로바이더별 옵션(예: OpenAI 추론 노력 또는 페널티 설정)을 전달해야 하는 경우, `HasProviderOptions` 계약을 구현하고 `providerOptions` 메서드를 정의하세요.

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasProviderOptions;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasProviderOptions
{
    use Promptable;

    // ...

    /**
     * Get provider-specific generation options.
     */
    public function providerOptions(Lab|string $provider): array
    {
        return match ($provider) {
            Lab::OpenAI => [
                'reasoning' => ['effort' => 'low'],
                'frequency_penalty' => 0.5,
                'presence_penalty' => 0.3,
            ],
            Lab::Anthropic => [
                'thinking' => ['budget_tokens' => 1024],
            ],
            default => [],
        };
    }
}
```

`providerOptions` 메서드는 현재 사용 중인 프로바이더(`Lab` enum 또는 문자열)를 받아 프로바이더별로 다른 옵션을 반환할 수 있습니다. 이는 [페일오버](#failover)를 사용할 때 특히 유용합니다. 각 폴백 프로바이더가 고유한 설정을 받을 수 있기 때문입니다.

<a name="images"></a>
## 이미지

`Laravel\Ai\Image` 클래스를 사용하여 `openai`, `gemini` 또는 `xai` 프로바이더로 이미지를 생성할 수 있습니다.

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')->generate();

$rawContent = (string) $image;
```

`square`, `portrait`, `landscape` 메서드를 사용하여 이미지의 종횡비를 제어할 수 있으며, `quality` 메서드를 사용하여 최종 이미지 품질(`high`, `medium`, `low`)을 조절할 수 있습니다. `timeout` 메서드를 사용하여 HTTP 타임아웃을 초 단위로 지정할 수 있습니다.

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')
    ->quality('high')
    ->landscape()
    ->timeout(120)
    ->generate();
```

`attachments` 메서드를 사용하여 참조 이미지를 첨부할 수 있습니다.

```php
use Laravel\Ai\Files;
use Laravel\Ai\Image;

$image = Image::of('Update this photo of me to be in the style of an impressionist painting.')
    ->attachments([
        Files\Image::fromStorage('photo.jpg'),
        // Files\Image::fromPath('/home/laravel/photo.jpg'),
        // Files\Image::fromUrl('https://example.com/photo.jpg'),
        // $request->file('photo'),
    ])
    ->landscape()
    ->generate();
```

생성된 이미지는 애플리케이션의 `config/filesystems.php` 설정 파일에 구성된 기본 디스크에 쉽게 저장할 수 있습니다.

```php
$image = Image::of('A donut sitting on the kitchen counter');

$path = $image->store();
$path = $image->storeAs('image.jpg');
$path = $image->storePublicly();
$path = $image->storePubliclyAs('image.jpg');
```

이미지 생성도 큐에 넣을 수 있습니다.

```php
use Laravel\Ai\Image;
use Laravel\Ai\Responses\ImageResponse;

Image::of('A donut sitting on the kitchen counter')
    ->portrait()
    ->queue()
    ->then(function (ImageResponse $image) {
        $path = $image->store();

        // ...
    });
```

<a name="audio"></a>
## 오디오

`Laravel\Ai\Audio` 클래스를 사용하여 주어진 텍스트에서 오디오를 생성할 수 있습니다.

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')->generate();

$rawContent = (string) $audio;
```

`male`, `female`, `voice` 메서드를 사용하여 생성된 오디오의 음성을 결정할 수 있습니다.

```php
$audio = Audio::of('I love coding with Laravel.')
    ->female()
    ->generate();

$audio = Audio::of('I love coding with Laravel.')
    ->voice('voice-id-or-name')
    ->generate();
```

마찬가지로, `instructions` 메서드를 사용하여 생성된 오디오가 어떻게 들려야 하는지 모델에 동적으로 지시할 수 있습니다.

```php
$audio = Audio::of('I love coding with Laravel.')
    ->female()
    ->instructions('Said like a pirate')
    ->generate();
```

생성된 오디오는 애플리케이션의 `config/filesystems.php` 설정 파일에 구성된 기본 디스크에 쉽게 저장할 수 있습니다.

```php
$audio = Audio::of('I love coding with Laravel.')->generate();

$path = $audio->store();
$path = $audio->storeAs('audio.mp3');
$path = $audio->storePublicly();
$path = $audio->storePubliclyAs('audio.mp3');
```

오디오 생성도 큐에 넣을 수 있습니다.

```php
use Laravel\Ai\Audio;
use Laravel\Ai\Responses\AudioResponse;

Audio::of('I love coding with Laravel.')
    ->queue()
    ->then(function (AudioResponse $audio) {
        $path = $audio->store();

        // ...
    });
```

<a name="transcription"></a>
## 음성 변환

`Laravel\Ai\Transcription` 클래스를 사용하여 주어진 오디오의 텍스트 변환을 생성할 수 있습니다.

```php
use Laravel\Ai\Transcription;

$transcript = Transcription::fromPath('/home/laravel/audio.mp3')->generate();
$transcript = Transcription::fromStorage('audio.mp3')->generate();
$transcript = Transcription::fromUpload($request->file('audio'))->generate();

return (string) $transcript;
```

`diarize` 메서드를 사용하면 원시 텍스트 변환 외에도 화자별로 분할된 변환을 응답에 포함하도록 지정할 수 있어, 화자별 세그먼트에 접근할 수 있습니다.

```php
$transcript = Transcription::fromStorage('audio.mp3')
    ->diarize()
    ->generate();
```

음성 변환 생성도 큐에 넣을 수 있습니다.

```php
use Laravel\Ai\Transcription;
use Laravel\Ai\Responses\TranscriptionResponse;

Transcription::fromStorage('audio.mp3')
    ->queue()
    ->then(function (TranscriptionResponse $transcript) {
        // ...
    });
```

<a name="embeddings"></a>
## 임베딩

라라벨의 `Stringable` 클래스에서 제공하는 새로운 `toEmbeddings` 메서드를 사용하여 주어진 문자열에 대한 벡터 임베딩을 쉽게 생성할 수 있습니다.

```php
use Illuminate\Support\Str;

$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

또는 `Embeddings` 클래스를 사용하여 여러 입력에 대한 임베딩을 한 번에 생성할 수 있습니다.

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'Laravel is a PHP framework.',
])->generate();

$response->embeddings; // [[0.123, 0.456, ...], [0.789, 0.012, ...]]
```

임베딩의 차원 수와 프로바이더를 지정할 수 있습니다.

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->dimensions(1536)
    ->generate(Lab::OpenAI, 'text-embedding-3-small');
```

<a name="querying-embeddings"></a>
### 임베딩 쿼리

임베딩을 생성한 후에는 일반적으로 나중에 쿼리할 수 있도록 데이터베이스의 `vector` 컬럼에 저장합니다. 라라벨은 `pgvector` 확장을 통해 PostgreSQL에서 벡터 컬럼을 네이티브로 지원합니다. 시작하려면, 마이그레이션에서 차원 수를 지정하여 `vector` 컬럼을 정의합니다.

```php
Schema::ensureVectorExtensionExists();

Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->vector('embedding', dimensions: 1536);
    $table->timestamps();
});
```

유사성 검색 속도를 높이기 위해 벡터 인덱스를 추가할 수도 있습니다. 벡터 컬럼에서 `index`를 호출하면, 라라벨은 자동으로 코사인 거리를 사용하는 HNSW 인덱스를 생성합니다.

```php
$table->vector('embedding', dimensions: 1536)->index();
```

Eloquent 모델에서는 벡터 컬럼을 `array`로 캐스팅해야 합니다.

```php
protected function casts(): array
{
    return [
        'embedding' => 'array',
    ];
}
```

유사한 레코드를 쿼리하려면 `whereVectorSimilarTo` 메서드를 사용합니다. 이 메서드는 최소 코사인 유사도(`0.0`에서 `1.0` 사이, `1.0`은 동일)로 결과를 필터링하고 유사도 순으로 결과를 정렬합니다.

```php
use App\Models\Document;

$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

`$queryEmbedding`은 부동 소수점 배열이거나 일반 문자열일 수 있습니다. 문자열이 주어지면 라라벨이 자동으로 해당 문자열의 임베딩을 생성합니다.

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

더 세밀한 제어가 필요한 경우, 저수준의 `whereVectorDistanceLessThan`, `selectVectorDistance`, `orderByVectorDistance` 메서드를 개별적으로 사용할 수 있습니다.

```php
$documents = Document::query()
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, maxDistance: 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
```

에이전트에게 도구로서 유사성 검색 기능을 부여하고 싶다면, [유사성 검색](#similarity-search) 도구 문서를 참고하세요.

> [!NOTE]
> 벡터 쿼리는 현재 `pgvector` 확장을 사용하는 PostgreSQL 연결에서만 지원됩니다.

<a name="caching-embeddings"></a>
### 임베딩 캐싱

동일한 입력에 대한 중복 API 호출을 피하기 위해 임베딩 생성을 캐싱할 수 있습니다. 캐싱을 활성화하려면 `ai.caching.embeddings.cache` 설정 옵션을 `true`로 설정합니다.

```php
'caching' => [
    'embeddings' => [
        'cache' => true,
        'store' => env('CACHE_STORE', 'database'),
        // ...
    ],
],
```

캐싱이 활성화되면, 임베딩은 30일 동안 캐싱됩니다. 캐시 키는 프로바이더, 모델, 차원 수, 입력 내용을 기반으로 하므로, 동일한 요청은 캐싱된 결과를 반환하고 다른 설정은 새로운 임베딩을 생성합니다.

글로벌 캐싱이 비활성화된 경우에도 `cache` 메서드를 사용하여 특정 요청에 대해 캐싱을 활성화할 수 있습니다.

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->cache()
    ->generate();
```

커스텀 캐시 지속 시간을 초 단위로 지정할 수 있습니다.

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->cache(seconds: 3600) // 1시간 동안 캐시
    ->generate();
```

`toEmbeddings` Stringable 메서드도 `cache` 인자를 받습니다.

```php
// 기본 기간으로 캐시...
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings(cache: true);

// 특정 기간으로 캐시...
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings(cache: 3600);
```

<a name="reranking"></a>
## 리랭킹

리랭킹을 사용하면 주어진 쿼리에 대한 관련성을 기반으로 문서 목록을 재정렬할 수 있습니다. 이는 의미적 이해를 사용하여 검색 결과를 개선하는 데 유용합니다.

`Laravel\Ai\Reranking` 클래스를 사용하여 문서를 리랭킹할 수 있습니다.

```php
use Laravel\Ai\Reranking;

$response = Reranking::of([
    'Django is a Python web framework.',
    'Laravel is a PHP web application framework.',
    'React is a JavaScript library for building user interfaces.',
])->rerank('PHP frameworks');

// 상위 결과에 접근...
$response->first()->document; // "Laravel is a PHP web application framework."
$response->first()->score;    // 0.95
$response->first()->index;    // 1 (원래 위치)
```

`limit` 메서드를 사용하여 반환되는 결과 수를 제한할 수 있습니다.

```php
$response = Reranking::of($documents)
    ->limit(5)
    ->rerank('search query');
```

<a name="reranking-collections"></a>
### 컬렉션 리랭킹

편의를 위해, `rerank` 매크로를 사용하여 라라벨 컬렉션을 리랭킹할 수 있습니다. 첫 번째 인자는 리랭킹에 사용할 필드를 지정하고, 두 번째 인자는 쿼리입니다.

```php
// 단일 필드로 리랭킹...
$posts = Post::all()
    ->rerank('body', 'Laravel tutorials');

// 여러 필드로 리랭킹 (JSON으로 전송)...
$reranked = $posts->rerank(['title', 'body'], 'Laravel tutorials');

// 클로저를 사용하여 문서 구성...
$reranked = $posts->rerank(
    fn ($post) => $post->title.': '.$post->body,
    'Laravel tutorials'
);
```

결과 수를 제한하고 프로바이더를 지정할 수도 있습니다.

```php
$reranked = $posts->rerank(
    by: 'content',
    query: 'Laravel tutorials',
    limit: 10,
    provider: Lab::Cohere
);
```

<a name="files"></a>
## 파일

`Laravel\Ai\Files` 클래스나 개별 파일 클래스를 사용하여 나중에 대화에서 사용할 수 있도록 AI 프로바이더에 파일을 저장할 수 있습니다. 이는 대용량 문서나 재업로드 없이 여러 번 참조하려는 파일에 유용합니다.

```php
use Laravel\Ai\Files\Document;
use Laravel\Ai\Files\Image;

// 로컬 경로에서 파일 저장...
$response = Document::fromPath('/home/laravel/document.pdf')->put();
$response = Image::fromPath('/home/laravel/photo.jpg')->put();

// 파일시스템 디스크에 저장된 파일 저장...
$response = Document::fromStorage('document.pdf', disk: 'local')->put();
$response = Image::fromStorage('photo.jpg', disk: 'local')->put();

// 원격 URL에 저장된 파일 저장...
$response = Document::fromUrl('https://example.com/document.pdf')->put();
$response = Image::fromUrl('https://example.com/photo.jpg')->put();

return $response->id;
```

원시 콘텐츠나 업로드된 파일도 저장할 수 있습니다.

```php
use Laravel\Ai\Files;
use Laravel\Ai\Files\Document;

// 원시 콘텐츠 저장...
$stored = Document::fromString('Hello, World!', 'text/plain')->put();

// 업로드된 파일 저장...
$stored = Document::fromUpload($request->file('document'))->put();
```

파일이 저장되면, 파일을 재업로드하는 대신 에이전트를 통해 텍스트를 생성할 때 해당 파일을 참조할 수 있습니다.

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Files;

$response = (new SalesCoach)->prompt(
    'Analyze the attached sales transcript...'
    attachments: [
        Files\Document::fromId('file-id') // 저장된 문서 첨부...
    ]
);
```

이전에 저장된 파일을 조회하려면 파일 인스턴스의 `get` 메서드를 사용합니다.

```php
use Laravel\Ai\Files\Document;

$file = Document::fromId('file-id')->get();

$file->id;
$file->mimeType();
```

프로바이더에서 파일을 삭제하려면 `delete` 메서드를 사용합니다.

```php
Document::fromId('file-id')->delete();
```

기본적으로, `Files` 클래스는 애플리케이션의 `config/ai.php` 설정 파일에 구성된 기본 AI 프로바이더를 사용합니다. 대부분의 작업에서 `provider` 인자를 사용하여 다른 프로바이더를 지정할 수 있습니다.

```php
$response = Document::fromPath(
    '/home/laravel/document.pdf'
)->put(provider: Lab::Anthropic);
```

<a name="using-stored-files-in-conversations"></a>
### 대화에서 저장된 파일 사용

프로바이더에 파일이 저장되면, `Document` 또는 `Image` 클래스의 `fromId` 메서드를 사용하여 에이전트 대화에서 참조할 수 있습니다.

```php
use App\Ai\Agents\DocumentAnalyzer;
use Laravel\Ai\Files;
use Laravel\Ai\Files\Document;

$stored = Document::fromPath('/path/to/report.pdf')->put();

$response = (new DocumentAnalyzer)->prompt(
    'Summarize this document.',
    attachments: [
        Document::fromId($stored->id),
    ],
);
```

마찬가지로, 저장된 이미지도 `Image` 클래스를 사용하여 참조할 수 있습니다.

```php
use Laravel\Ai\Files;
use Laravel\Ai\Files\Image;

$stored = Image::fromPath('/path/to/photo.jpg')->put();

$response = (new ImageAnalyzer)->prompt(
    'What is in this image?',
    attachments: [
        Image::fromId($stored->id),
    ],
);
```

<a name="vector-stores"></a>
## 벡터 스토어

벡터 스토어를 사용하면 검색 증강 생성(RAG)에 사용할 수 있는 검색 가능한 파일 컬렉션을 만들 수 있습니다. `Laravel\Ai\Stores` 클래스는 벡터 스토어를 생성, 조회, 삭제하는 메서드를 제공합니다.

```php
use Laravel\Ai\Stores;

// 새 벡터 스토어 생성...
$store = Stores::create('Knowledge Base');

// 추가 옵션으로 스토어 생성...
$store = Stores::create(
    name: 'Knowledge Base',
    description: 'Documentation and reference materials.',
    expiresWhenIdleFor: days(30),
);

return $store->id;
```

기존 벡터 스토어를 ID로 조회하려면 `get` 메서드를 사용합니다.

```php
use Laravel\Ai\Stores;

$store = Stores::get('store_id');

$store->id;
$store->name;
$store->fileCounts;
$store->ready;
```

벡터 스토어를 삭제하려면 `Stores` 클래스나 스토어 인스턴스의 `delete` 메서드를 사용합니다.

```php
use Laravel\Ai\Stores;

// ID로 삭제...
Stores::delete('store_id');

// 또는 스토어 인스턴스를 통해 삭제...
$store = Stores::get('store_id');

$store->delete();
```

<a name="adding-files-to-stores"></a>
### 스토어에 파일 추가

벡터 스토어가 있으면 `add` 메서드를 사용하여 [파일](#files)을 추가할 수 있습니다. 스토어에 추가된 파일은 [파일 검색 프로바이더 도구](#file-search)를 사용한 의미 검색을 위해 자동으로 인덱싱됩니다.

```php
use Laravel\Ai\Files\Document;
use Laravel\Ai\Stores;

$store = Stores::get('store_id');

// 프로바이더에 이미 저장된 파일 추가...
$document = $store->add('file_id');
$document = $store->add(Document::fromId('file_id'));

// 또는, 파일을 저장하고 한 번에 추가...
$document = $store->add(Document::fromPath('/path/to/document.pdf'));
$document = $store->add(Document::fromStorage('manual.pdf'));
$document = $store->add($request->file('document'));

$document->id;
$document->fileId;
```

> **Note:** 일반적으로, 이전에 저장된 파일을 벡터 스토어에 추가할 때 반환되는 문서 ID는 파일에 이전에 할당된 ID와 일치합니다. 그러나 일부 벡터 스토리지 프로바이더는 새로운 다른 "문서 ID"를 반환할 수 있습니다. 따라서, 나중에 참조할 수 있도록 항상 두 ID를 모두 데이터베이스에 저장하는 것이 좋습니다.

스토어에 파일을 추가할 때 메타데이터를 첨부할 수 있습니다. 이 메타데이터는 나중에 [파일 검색 프로바이더 도구](#file-search)를 사용할 때 검색 결과를 필터링하는 데 사용할 수 있습니다.

```php
$store->add(Document::fromPath('/path/to/document.pdf'), metadata: [
    'author' => 'Taylor Otwell',
    'department' => 'Engineering',
    'year' => 2026,
]);
```

스토어에서 파일을 제거하려면 `remove` 메서드를 사용합니다.

```php
$store->remove('file_id');
```

벡터 스토어에서 파일을 제거해도 프로바이더의 [파일 저장소](#files)에서 파일이 삭제되지는 않습니다. 벡터 스토어에서 파일을 제거하고 파일 저장소에서도 영구적으로 삭제하려면 `deleteFile` 인자를 사용합니다.

```php
$store->remove('file_abc123', deleteFile: true);
```

<a name="failover"></a>
## 페일오버

프롬프트를 보내거나 다른 미디어를 생성할 때, 기본 프로바이더에서 서비스 중단이나 속도 제한이 발생하면 자동으로 백업 프로바이더/모델로 페일오버하도록 프로바이더/모델 배열을 제공할 수 있습니다.

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Image;

$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: [Lab::OpenAI, Lab::Anthropic],
);

$image = Image::of('A donut sitting on the kitchen counter')
    ->generate(provider: [Lab::Gemini, Lab::xAI]);
```

<a name="testing"></a>
## 테스트

<a name="testing-agents"></a>
### 에이전트

테스트 중 에이전트의 응답을 페이크하려면 에이전트 클래스의 `fake` 메서드를 호출합니다. 선택적으로 응답 배열이나 클로저를 제공할 수 있습니다.

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Prompts\AgentPrompt;

// 모든 프롬프트에 대해 고정된 응답을 자동으로 생성...
SalesCoach::fake();

// 프롬프트 응답 목록 제공...
SalesCoach::fake([
    'First response',
    'Second response',
]);

// 들어오는 프롬프트에 따라 동적으로 프롬프트 응답 처리...
SalesCoach::fake(function (AgentPrompt $prompt) {
    return 'Response for: '.$prompt->prompt;
});
```

> **Note:** 구조화된 출력을 반환하는 에이전트에서 `Agent::fake()`를 호출하면, 라라벨은 에이전트에 정의된 출력 스키마와 일치하는 페이크 데이터를 자동으로 생성합니다.

에이전트에 프롬프트를 보낸 후, 수신된 프롬프트에 대해 어설션을 수행할 수 있습니다.

```php
use Laravel\Ai\Prompts\AgentPrompt;

SalesCoach::assertPrompted('Analyze this...');

SalesCoach::assertPrompted(function (AgentPrompt $prompt) {
    return $prompt->contains('Analyze');
});

SalesCoach::assertNotPrompted('Missing prompt');

SalesCoach::assertNeverPrompted();
```

큐에 넣은 에이전트 호출의 경우, 큐 어설션 메서드를 사용합니다.

```php
use Laravel\Ai\QueuedAgentPrompt;

SalesCoach::assertQueued('Analyze this...');

SalesCoach::assertQueued(function (QueuedAgentPrompt $prompt) {
    return $prompt->contains('Analyze');
});

SalesCoach::assertNotQueued('Missing prompt');

SalesCoach::assertNeverQueued();
```

모든 에이전트 호출에 대응하는 페이크 응답이 있는지 확인하려면, `preventStrayPrompts`를 사용할 수 있습니다. 정의된 페이크 응답 없이 에이전트가 호출되면 예외가 발생합니다.

```php
SalesCoach::fake()->preventStrayPrompts();
```

<a name="testing-images"></a>
### 이미지

`Image` 클래스의 `fake` 메서드를 호출하여 이미지 생성을 페이크할 수 있습니다. 이미지가 페이크되면, 기록된 이미지 생성 프롬프트에 대해 다양한 어설션을 수행할 수 있습니다.

```php
use Laravel\Ai\Image;
use Laravel\Ai\Prompts\ImagePrompt;
use Laravel\Ai\Prompts\QueuedImagePrompt;

// 모든 프롬프트에 대해 고정된 응답을 자동으로 생성...
Image::fake();

// 프롬프트 응답 목록 제공...
Image::fake([
    base64_encode($firstImage),
    base64_encode($secondImage),
]);

// 들어오는 프롬프트에 따라 동적으로 프롬프트 응답 처리...
Image::fake(function (ImagePrompt $prompt) {
    return base64_encode('...');
});
```

이미지를 생성한 후, 수신된 프롬프트에 대해 어설션을 수행할 수 있습니다.

```php
Image::assertGenerated(function (ImagePrompt $prompt) {
    return $prompt->contains('sunset') && $prompt->isLandscape();
});

Image::assertNotGenerated('Missing prompt');

Image::assertNothingGenerated();
```

큐에 넣은 이미지 생성의 경우, 큐 어설션 메서드를 사용합니다.

```php
Image::assertQueued(
    fn (QueuedImagePrompt $prompt) => $prompt->contains('sunset')
);

Image::assertNotQueued('Missing prompt');

Image::assertNothingQueued();
```

모든 이미지 생성에 대응하는 페이크 응답이 있는지 확인하려면, `preventStrayImages`를 사용할 수 있습니다. 정의된 페이크 응답 없이 이미지가 생성되면 예외가 발생합니다.

```php
Image::fake()->preventStrayImages();
```

<a name="testing-audio"></a>
### 오디오

`Audio` 클래스의 `fake` 메서드를 호출하여 오디오 생성을 페이크할 수 있습니다. 오디오가 페이크되면, 기록된 오디오 생성 프롬프트에 대해 다양한 어설션을 수행할 수 있습니다.

```php
use Laravel\Ai\Audio;
use Laravel\Ai\Prompts\AudioPrompt;
use Laravel\Ai\Prompts\QueuedAudioPrompt;

// 모든 프롬프트에 대해 고정된 응답을 자동으로 생성...
Audio::fake();

// 프롬프트 응답 목록 제공...
Audio::fake([
    base64_encode($firstAudio),
    base64_encode($secondAudio),
]);

// 들어오는 프롬프트에 따라 동적으로 프롬프트 응답 처리...
Audio::fake(function (AudioPrompt $prompt) {
    return base64_encode('...');
});
```

오디오를 생성한 후, 수신된 프롬프트에 대해 어설션을 수행할 수 있습니다.

```php
Audio::assertGenerated(function (AudioPrompt $prompt) {
    return $prompt->contains('Hello') && $prompt->isFemale();
});

Audio::assertNotGenerated('Missing prompt');

Audio::assertNothingGenerated();
```

큐에 넣은 오디오 생성의 경우, 큐 어설션 메서드를 사용합니다.

```php
Audio::assertQueued(
    fn (QueuedAudioPrompt $prompt) => $prompt->contains('Hello')
);

Audio::assertNotQueued('Missing prompt');

Audio::assertNothingQueued();
```

모든 오디오 생성에 대응하는 페이크 응답이 있는지 확인하려면, `preventStrayAudio`를 사용할 수 있습니다. 정의된 페이크 응답 없이 오디오가 생성되면 예외가 발생합니다.

```php
Audio::fake()->preventStrayAudio();
```

<a name="testing-transcriptions"></a>
### 음성 변환

`Transcription` 클래스의 `fake` 메서드를 호출하여 음성 변환 생성을 페이크할 수 있습니다. 음성 변환이 페이크되면, 기록된 음성 변환 생성 프롬프트에 대해 다양한 어설션을 수행할 수 있습니다.

```php
use Laravel\Ai\Transcription;
use Laravel\Ai\Prompts\TranscriptionPrompt;
use Laravel\Ai\Prompts\QueuedTranscriptionPrompt;

// 모든 프롬프트에 대해 고정된 응답을 자동으로 생성...
Transcription::fake();

// 프롬프트 응답 목록 제공...
Transcription::fake([
    'First transcription text.',
    'Second transcription text.',
]);

// 들어오는 프롬프트에 따라 동적으로 프롬프트 응답 처리...
Transcription::fake(function (TranscriptionPrompt $prompt) {
    return 'Transcribed text...';
});
```

음성 변환을 생성한 후, 수신된 프롬프트에 대해 어설션을 수행할 수 있습니다.

```php
Transcription::assertGenerated(function (TranscriptionPrompt $prompt) {
    return $prompt->language === 'en' && $prompt->isDiarized();
});

Transcription::assertNotGenerated(
    fn (TranscriptionPrompt $prompt) => $prompt->language === 'fr'
);

Transcription::assertNothingGenerated();
```

큐에 넣은 음성 변환 생성의 경우, 큐 어설션 메서드를 사용합니다.

```php
Transcription::assertQueued(
    fn (QueuedTranscriptionPrompt $prompt) => $prompt->isDiarized()
);

Transcription::assertNotQueued(
    fn (QueuedTranscriptionPrompt $prompt) => $prompt->language === 'fr'
);

Transcription::assertNothingQueued();
```

모든 음성 변환 생성에 대응하는 페이크 응답이 있는지 확인하려면, `preventStrayTranscriptions`를 사용할 수 있습니다. 정의된 페이크 응답 없이 음성 변환이 생성되면 예외가 발생합니다.

```php
Transcription::fake()->preventStrayTranscriptions();
```

<a name="testing-embeddings"></a>
### 임베딩

`Embeddings` 클래스의 `fake` 메서드를 호출하여 임베딩 생성을 페이크할 수 있습니다. 임베딩이 페이크되면, 기록된 임베딩 생성 프롬프트에 대해 다양한 어설션을 수행할 수 있습니다.

```php
use Laravel\Ai\Embeddings;
use Laravel\Ai\Prompts\EmbeddingsPrompt;
use Laravel\Ai\Prompts\QueuedEmbeddingsPrompt;

// 모든 프롬프트에 대해 적절한 차원의 페이크 임베딩을 자동으로 생성...
Embeddings::fake();

// 프롬프트 응답 목록 제공...
Embeddings::fake([
    [$firstEmbeddingVector],
    [$secondEmbeddingVector],
]);

// 들어오는 프롬프트에 따라 동적으로 프롬프트 응답 처리...
Embeddings::fake(function (EmbeddingsPrompt $prompt) {
    return array_map(
        fn () => Embeddings::fakeEmbedding($prompt->dimensions),
        $prompt->inputs
    );
});
```

임베딩을 생성한 후, 수신된 프롬프트에 대해 어설션을 수행할 수 있습니다.

```php
Embeddings::assertGenerated(function (EmbeddingsPrompt $prompt) {
    return $prompt->contains('Laravel') && $prompt->dimensions === 1536;
});

Embeddings::assertNotGenerated(
    fn (EmbeddingsPrompt $prompt) => $prompt->contains('Other')
);

Embeddings::assertNothingGenerated();
```

큐에 넣은 임베딩 생성의 경우, 큐 어설션 메서드를 사용합니다.

```php
Embeddings::assertQueued(
    fn (QueuedEmbeddingsPrompt $prompt) => $prompt->contains('Laravel')
);

Embeddings::assertNotQueued(
    fn (QueuedEmbeddingsPrompt $prompt) => $prompt->contains('Other')
);

Embeddings::assertNothingQueued();
```

모든 임베딩 생성에 대응하는 페이크 응답이 있는지 확인하려면, `preventStrayEmbeddings`를 사용할 수 있습니다. 정의된 페이크 응답 없이 임베딩이 생성되면 예외가 발생합니다.

```php
Embeddings::fake()->preventStrayEmbeddings();
```

<a name="testing-reranking"></a>
### 리랭킹

`Reranking` 클래스의 `fake` 메서드를 호출하여 리랭킹 작업을 페이크할 수 있습니다.

```php
use Laravel\Ai\Reranking;
use Laravel\Ai\Prompts\RerankingPrompt;
use Laravel\Ai\Responses\Data\RankedDocument;

// 페이크 리랭킹 응답을 자동으로 생성...
Reranking::fake();

// 커스텀 응답 제공...
Reranking::fake([
    [
        new RankedDocument(index: 0, document: 'First', score: 0.95),
        new RankedDocument(index: 1, document: 'Second', score: 0.80),
    ],
]);
```

리랭킹 후, 수행된 작업에 대해 어설션을 수행할 수 있습니다.

```php
Reranking::assertReranked(function (RerankingPrompt $prompt) {
    return $prompt->contains('Laravel') && $prompt->limit === 5;
});

Reranking::assertNotReranked(
    fn (RerankingPrompt $prompt) => $prompt->contains('Django')
);

Reranking::assertNothingReranked();
```

<a name="testing-files"></a>
### 파일

`Files` 클래스의 `fake` 메서드를 호출하여 파일 작업을 페이크할 수 있습니다.

```php
use Laravel\Ai\Files;

Files::fake();
```

파일 작업이 페이크되면, 발생한 업로드 및 삭제에 대해 어설션을 수행할 수 있습니다.

```php
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

// 파일 저장...
Document::fromString('Hello, Laravel!', mimeType: 'text/plain')
    ->as('hello.txt')
    ->put();

// 어설션 수행...
Files::assertStored(fn (StorableFile $file) =>
    (string) $file === 'Hello, Laravel!' &&
        $file->mimeType() === 'text/plain';
);

Files::assertNotStored(fn (StorableFile $file) =>
    (string) $file === 'Hello, World!'
);

Files::assertNothingStored();
```

파일 삭제에 대한 어설션의 경우 파일 ID를 전달할 수 있습니다.

```php
Files::assertDeleted('file-id');
Files::assertNotDeleted('file-id');
Files::assertNothingDeleted();
```

<a name="testing-vector-stores"></a>
### 벡터 스토어

`Stores` 클래스의 `fake` 메서드를 호출하여 벡터 스토어 작업을 페이크할 수 있습니다. 스토어를 페이크하면 [파일 작업](#files)도 자동으로 페이크됩니다.

```php
use Laravel\Ai\Stores;

Stores::fake();
```

스토어 작업이 페이크되면, 생성되거나 삭제된 스토어에 대해 어설션을 수행할 수 있습니다.

```php
use Laravel\Ai\Stores;

// 스토어 생성...
$store = Stores::create('Knowledge Base');

// 어설션 수행...
Stores::assertCreated('Knowledge Base');

Stores::assertCreated(fn (string $name, ?string $description) =>
    $name === 'Knowledge Base'
);

Stores::assertNotCreated('Other Store');

Stores::assertNothingCreated();
```

스토어 삭제에 대한 어설션의 경우 스토어 ID를 제공할 수 있습니다.

```php
Stores::assertDeleted('store_id');
Stores::assertNotDeleted('other_store_id');
Stores::assertNothingDeleted();
```

스토어에서 파일이 추가되거나 제거되었는지 확인하려면, 주어진 `Store` 인스턴스의 어설션 메서드를 사용합니다.

```php
Stores::fake();

$store = Stores::get('store_id');

// 파일 추가 / 제거...
$store->add('added_id');
$store->remove('removed_id');

// 어설션 수행...
$store->assertAdded('added_id');
$store->assertRemoved('removed_id');

$store->assertNotAdded('other_file_id');
$store->assertNotRemoved('other_file_id');
```

파일이 프로바이더의 [파일 저장소](#files)에 저장되고 동일한 요청에서 벡터 스토어에 추가되는 경우, 파일의 프로바이더 ID를 알 수 없을 수 있습니다. 이 경우, `assertAdded` 메서드에 클로저를 전달하여 추가된 파일의 내용에 대해 어설션할 수 있습니다.

```php
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

$store->add(Document::fromString('Hello, World!', 'text/plain')->as('hello.txt'));

$store->assertAdded(fn (StorableFile $file) => $file->name() === 'hello.txt');
$store->assertAdded(fn (StorableFile $file) => $file->content() === 'Hello, World!');
```

<a name="events"></a>
## 이벤트

라라벨 AI SDK는 다음을 포함한 다양한 [이벤트](/docs/{{version}}/events)를 디스패치합니다.

- `AddingFileToStore`
- `AgentPrompted`
- `AgentStreamed`
- `AudioGenerated`
- `CreatingStore`
- `EmbeddingsGenerated`
- `FileAddedToStore`
- `FileDeleted`
- `FileRemovedFromStore`
- `FileStored`
- `GeneratingAudio`
- `GeneratingEmbeddings`
- `GeneratingImage`
- `GeneratingTranscription`
- `ImageGenerated`
- `InvokingTool`
- `PromptingAgent`
- `RemovingFileFromStore`
- `Reranked`
- `Reranking`
- `StoreCreated`
- `StoringFile`
- `StreamingAgent`
- `ToolInvoked`
- `TranscriptionGenerated`

이러한 이벤트를 리스닝하여 AI SDK 사용 정보를 로깅하거나 저장할 수 있습니다.

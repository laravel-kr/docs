# 메일(Mail)

- [소개](#introduction)
    - [설정](#configuration)
    - [드라이버 사전 준비사항](#driver-prerequisites)
    - [장애 조치 설정](#failover-configuration)
    - [라운드 로빈 설정](#round-robin-configuration)
- [Mailable 생성하기](#generating-mailables)
- [Mailable 작성하기](#writing-mailables)
    - [발신자 설정하기](#configuring-the-sender)
    - [뷰 설정하기](#configuring-the-view)
    - [뷰 데이터](#view-data)
    - [첨부 파일](#attachments)
    - [인라인 첨부 파일](#inline-attachments)
    - [첨부 가능한 객체](#attachable-objects)
    - [헤더](#headers)
    - [태그와 메타데이터](#tags-and-metadata)
    - [Symfony 메시지 커스터마이징](#customizing-the-symfony-message)
- [마크다운 Mailable](#markdown-mailables)
    - [마크다운 Mailable 생성하기](#generating-markdown-mailables)
    - [마크다운 메시지 작성하기](#writing-markdown-messages)
    - [컴포넌트 커스터마이징](#customizing-the-components)
- [메일 발송하기](#sending-mail)
    - [메일을 큐로 보내기](#queueing-mail)
- [Mailable 렌더링](#rendering-mailables)
    - [브라우저에서 Mailable 미리보기](#previewing-mailables-in-the-browser)
- [Mailable 지역화](#localizing-mailables)
- [테스트](#testing-mailables)
    - [Mailable 내용 테스트](#testing-mailable-content)
    - [Mailable 발송 테스트](#testing-mailable-sending)
- [메일과 로컬 개발 환경](#mail-and-local-development)
- [이벤트](#events)
- [커스텀 전송 방식](#custom-transports)
    - [추가 Symfony 전송 방식](#additional-symfony-transports)

<a name="introduction"></a>
## 소개

이메일 발송은 복잡할 필요가 없습니다. Laravel은 인기 있는 [Symfony Mailer](https://symfony.com/doc/current/mailer.html) 컴포넌트를 기반으로 하는 깔끔하고 간단한 이메일 API를 제공합니다. Laravel과 Symfony Mailer는 SMTP, Mailgun, Postmark, Resend, Amazon SES, 그리고 `sendmail`을 통해 이메일을 발송할 수 있는 드라이버를 제공하여, 로컬 또는 클라우드 기반 서비스를 통해 빠르게 메일 발송을 시작할 수 있습니다.

<a name="configuration"></a>
### 설정

Laravel의 이메일 서비스는 애플리케이션의 `config/mail.php` 설정 파일을 통해 구성할 수 있습니다. 이 파일에 설정된 각 메일러는 고유한 설정과 고유한 "전송 방식(transport)"을 가질 수 있어, 애플리케이션이 특정 이메일 메시지를 발송하는 데 다른 이메일 서비스를 사용할 수 있습니다. 예를 들어, 애플리케이션에서 트랜잭션 이메일 발송에는 Postmark를, 대량 이메일 발송에는 Amazon SES를 사용할 수 있습니다.

`mail` 설정 파일 내에서 `mailers` 설정 배열을 찾을 수 있습니다. 이 배열에는 Laravel에서 지원하는 주요 메일 드라이버/전송 방식 각각에 대한 샘플 설정 항목이 포함되어 있으며, `default` 설정 값은 애플리케이션이 이메일 메시지를 발송해야 할 때 기본적으로 사용할 메일러를 결정합니다.

<a name="driver-prerequisites"></a>
### 드라이버 / 전송 방식 사전 준비사항

Mailgun, Postmark, Resend와 같은 API 기반 드라이버는 SMTP 서버를 통한 메일 발송보다 더 간단하고 빠른 경우가 많습니다. 가능하다면 이러한 드라이버 중 하나를 사용하는 것을 권장합니다.

<a name="mailgun-driver"></a>
#### Mailgun 드라이버

Mailgun 드라이버를 사용하려면 Composer를 통해 Symfony의 Mailgun Mailer 전송 방식을 설치하세요:

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

다음으로, 애플리케이션의 `config/mail.php` 설정 파일에서 두 가지를 변경해야 합니다. 먼저, 기본 메일러를 `mailgun`으로 설정합니다:

```php
'default' => env('MAIL_MAILER', 'mailgun'),
```

둘째, 다음 설정 배열을 `mailers` 배열에 추가합니다:

```php
'mailgun' => [
    'transport' => 'mailgun',
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

애플리케이션의 기본 메일러를 설정한 후, `config/services.php` 설정 파일에 다음 옵션을 추가하세요:

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    'scheme' => 'https',
],
```

미국 [Mailgun 지역](https://documentation.mailgun.com/docs/mailgun/api-reference/#mailgun-regions)을 사용하지 않는 경우, `services` 설정 파일에서 해당 지역의 엔드포인트를 정의할 수 있습니다:

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
    'scheme' => 'https',
],
```

<a name="postmark-driver"></a>
#### Postmark 드라이버

[Postmark](https://postmarkapp.com/) 드라이버를 사용하려면 Composer를 통해 Symfony의 Postmark Mailer 전송 방식을 설치하세요:

```shell
composer require symfony/postmark-mailer symfony/http-client
```

다음으로, 애플리케이션의 `config/mail.php` 설정 파일에서 `default` 옵션을 `postmark`로 설정합니다. 애플리케이션의 기본 메일러를 설정한 후, `config/services.php` 설정 파일에 다음 옵션이 포함되어 있는지 확인하세요:

```php
'postmark' => [
    'key' => env('POSTMARK_API_KEY'),
],
```

특정 메일러에서 사용할 Postmark 메시지 스트림을 지정하려면, 메일러의 설정 배열에 `message_stream_id` 설정 옵션을 추가할 수 있습니다. 이 설정 배열은 애플리케이션의 `config/mail.php` 설정 파일에서 찾을 수 있습니다:

```php
'postmark' => [
    'transport' => 'postmark',
    'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

이렇게 하면 서로 다른 메시지 스트림을 가진 여러 Postmark 메일러를 설정할 수도 있습니다.

<a name="resend-driver"></a>
#### Resend 드라이버

[Resend](https://resend.com/) 드라이버를 사용하려면 Composer를 통해 Resend의 PHP SDK를 설치하세요:

```shell
composer require resend/resend-php
```

다음으로, 애플리케이션의 `config/mail.php` 설정 파일에서 `default` 옵션을 `resend`로 설정합니다. 애플리케이션의 기본 메일러를 설정한 후, `config/services.php` 설정 파일에 다음 옵션이 포함되어 있는지 확인하세요:

```php
'resend' => [
    'key' => env('RESEND_API_KEY'),
],
```

<a name="ses-driver"></a>
#### SES 드라이버

Amazon SES 드라이버를 사용하려면 먼저 PHP용 Amazon AWS SDK를 설치해야 합니다. Composer 패키지 관리자를 통해 이 라이브러리를 설치할 수 있습니다:

```shell
composer require aws/aws-sdk-php
```

다음으로, `config/mail.php` 설정 파일에서 `default` 옵션을 `ses`로 설정하고, `config/services.php` 설정 파일에 다음 옵션이 포함되어 있는지 확인하세요:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],
```

세션 토큰을 통해 AWS [임시 자격 증명](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)을 활용하려면, 애플리케이션의 SES 설정에 `token` 키를 추가할 수 있습니다:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'token' => env('AWS_SESSION_TOKEN'),
],
```

SES의 [구독 관리 기능](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html)과 상호 작용하려면, 메일 메시지의 [headers](#headers) 메소드에서 반환되는 배열에 `X-Ses-List-Management-Options` 헤더를 반환할 수 있습니다:

```php
/**
 * 메시지 헤더를 가져옵니다.
 */
public function headers(): Headers
{
    return new Headers(
        text: [
            'X-Ses-List-Management-Options' => 'contactListName=MyContactList;topicName=MyTopic',
        ],
    );
}
```

이메일을 발송할 때 Laravel이 AWS SDK의 `SendEmail` 메소드에 전달해야 할 [추가 옵션](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail)을 정의하려면, `ses` 설정 내에 `options` 배열을 정의할 수 있습니다:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'options' => [
        'ConfigurationSetName' => 'MyConfigurationSet',
        'EmailTags' => [
            ['Name' => 'foo', 'Value' => 'bar'],
        ],
    ],
],
```

<a name="failover-configuration"></a>
### 장애 조치 설정

때때로 애플리케이션의 메일을 발송하도록 설정한 외부 서비스가 다운될 수 있습니다. 이러한 경우, 기본 전송 드라이버가 다운되었을 때 사용할 하나 이상의 백업 메일 전송 설정을 정의하는 것이 유용할 수 있습니다.

이를 위해, 애플리케이션의 `mail` 설정 파일에서 `failover` 전송 방식을 사용하는 메일러를 정의해야 합니다. 애플리케이션의 `failover` 메일러에 대한 설정 배열에는 전송을 위해 설정된 메일러가 선택되어야 하는 순서를 참조하는 `mailers` 배열이 포함되어야 합니다:

```php
'mailers' => [
    'failover' => [
        'transport' => 'failover',
        'mailers' => [
            'postmark',
            'mailgun',
            'sendmail',
        ],
        'retry_after' => 60,
    ],

    // ...
],
```

`failover` 전송 방식을 사용하는 메일러를 설정한 후, 장애 조치 기능을 활용하려면 애플리케이션의 `.env` 파일에서 장애 조치 메일러를 기본 메일러로 설정해야 합니다:

```ini
MAIL_MAILER=failover
```

<a name="round-robin-configuration"></a>
### 라운드 로빈 설정

`roundrobin` 전송 방식을 사용하면 메일링 작업 부하를 여러 메일러에 분산할 수 있습니다. 시작하려면, 애플리케이션의 `mail` 설정 파일에서 `roundrobin` 전송 방식을 사용하는 메일러를 정의합니다. 애플리케이션의 `roundrobin` 메일러에 대한 설정 배열에는 전송에 사용되어야 하는 설정된 메일러를 참조하는 `mailers` 배열이 포함되어야 합니다:

```php
'mailers' => [
    'roundrobin' => [
        'transport' => 'roundrobin',
        'mailers' => [
            'ses',
            'postmark',
        ],
        'retry_after' => 60,
    ],

    // ...
],
```

라운드 로빈 메일러를 정의한 후, 애플리케이션의 `mail` 설정 파일 내에서 `default` 설정 키의 값으로 이름을 지정하여 이 메일러를 애플리케이션에서 사용하는 기본 메일러로 설정해야 합니다:

```php
'default' => env('MAIL_MAILER', 'roundrobin'),
```

라운드 로빈 전송 방식은 설정된 메일러 목록에서 무작위로 메일러를 선택한 다음, 이후 각 이메일마다 다음 사용 가능한 메일러로 전환합니다. *[고가용성(high availability)](https://en.wikipedia.org/wiki/High_availability)*을 달성하는 데 도움이 되는 `failover` 전송 방식과 달리, `roundrobin` 전송 방식은 *[부하 분산(load balancing)](https://en.wikipedia.org/wiki/Load_balancing_(computing))*을 제공합니다.

<a name="generating-mailables"></a>
## Mailable 생성하기

Laravel 애플리케이션을 구축할 때, 애플리케이션에서 발송하는 각 유형의 이메일은 "mailable" 클래스로 표현됩니다. 이러한 클래스는 `app/Mail` 디렉토리에 저장됩니다. 애플리케이션에서 이 디렉토리가 보이지 않더라도 걱정하지 마세요. `make:mail` Artisan 명령어를 사용하여 첫 번째 mailable 클래스를 생성할 때 자동으로 생성됩니다:

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## Mailable 작성하기

mailable 클래스를 생성한 후, 열어서 내용을 살펴보겠습니다. Mailable 클래스 설정은 `envelope`, `content`, `attachments` 메소드를 포함한 여러 메소드에서 수행됩니다.

`envelope` 메소드는 메시지의 제목과 때로는 수신자를 정의하는 `Illuminate\Mail\Mailables\Envelope` 객체를 반환합니다. `content` 메소드는 메시지 내용을 생성하는 데 사용될 [Blade 템플릿](/docs/{{version}}/blade)을 정의하는 `Illuminate\Mail\Mailables\Content` 객체를 반환합니다.

<a name="configuring-the-sender"></a>
### 발신자 설정하기

<a name="using-the-envelope"></a>
#### Envelope 사용하기

먼저, 이메일의 발신자를 설정하는 방법을 살펴보겠습니다. 다시 말해, 이메일이 누구로부터 발송되는지를 설정합니다. 발신자를 설정하는 방법에는 두 가지가 있습니다. 첫째, 메시지의 envelope에 "from" 주소를 지정할 수 있습니다:

```php
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;

/**
 * 메시지 envelope을 가져옵니다.
 */
public function envelope(): Envelope
{
    return new Envelope(
        from: new Address('jeffrey@example.com', 'Jeffrey Way'),
        subject: 'Order Shipped',
    );
}
```

원한다면, `replyTo` 주소도 지정할 수 있습니다:

```php
return new Envelope(
    from: new Address('jeffrey@example.com', 'Jeffrey Way'),
    replyTo: [
        new Address('taylor@example.com', 'Taylor Otwell'),
    ],
    subject: 'Order Shipped',
);
```

<a name="using-a-global-from-address"></a>
#### 전역 `from` 주소 사용하기

그러나 애플리케이션이 모든 이메일에 동일한 "from" 주소를 사용하는 경우, 생성하는 각 mailable 클래스에 이를 추가하는 것은 번거로울 수 있습니다. 대신, `config/mail.php` 설정 파일에서 전역 "from" 주소를 지정할 수 있습니다. mailable 클래스 내에서 다른 "from" 주소가 지정되지 않은 경우 이 주소가 사용됩니다:

```php
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    'name' => env('MAIL_FROM_NAME', 'Example'),
],
```

또한, `config/mail.php` 설정 파일 내에서 전역 "reply_to" 주소를 정의할 수 있습니다:

```php
'reply_to' => [
    'address' => 'example@example.com',
    'name' => 'App Name',
],
```

<a name="configuring-the-view"></a>
### 뷰 설정하기

mailable 클래스의 `content` 메소드 내에서, 이메일 내용을 렌더링할 때 사용할 템플릿인 `view`를 정의할 수 있습니다. 각 이메일은 일반적으로 [Blade 템플릿](/docs/{{version}}/blade)을 사용하여 내용을 렌더링하므로, 이메일의 HTML을 구축할 때 Blade 템플릿 엔진의 모든 기능과 편의성을 활용할 수 있습니다:

```php
/**
 * 메시지 콘텐츠 정의를 가져옵니다.
 */
public function content(): Content
{
    return new Content(
        view: 'mail.orders.shipped',
    );
}
```

> [!NOTE]
> 모든 이메일 템플릿을 보관하기 위해 `resources/views/mail` 디렉토리를 생성할 수 있습니다. 그러나 `resources/views` 디렉토리 내 어디에나 자유롭게 배치할 수 있습니다.

<a name="plain-text-emails"></a>
#### 일반 텍스트 이메일

이메일의 일반 텍스트 버전을 정의하려면, 메시지의 `Content` 정의를 생성할 때 일반 텍스트 템플릿을 지정할 수 있습니다. `view` 매개변수와 마찬가지로, `text` 매개변수는 이메일 내용을 렌더링하는 데 사용될 템플릿 이름이어야 합니다. HTML과 일반 텍스트 버전의 메시지를 모두 자유롭게 정의할 수 있습니다:

```php
/**
 * 메시지 콘텐츠 정의를 가져옵니다.
 */
public function content(): Content
{
    return new Content(
        view: 'mail.orders.shipped',
        text: 'mail.orders.shipped-text'
    );
}
```

명확성을 위해, `html` 매개변수를 `view` 매개변수의 별칭으로 사용할 수 있습니다:

```php
return new Content(
    html: 'mail.orders.shipped',
    text: 'mail.orders.shipped-text'
);
```

<a name="view-data"></a>
### 뷰 데이터

<a name="via-public-properties"></a>
#### Public 속성을 통해

일반적으로, 이메일의 HTML을 렌더링할 때 활용할 수 있는 데이터를 뷰에 전달하고 싶을 것입니다. 뷰에서 데이터를 사용할 수 있게 하는 방법에는 두 가지가 있습니다. 첫째, mailable 클래스에 정의된 모든 public 속성은 자동으로 뷰에서 사용할 수 있게 됩니다. 예를 들어, mailable 클래스의 생성자에 데이터를 전달하고 해당 데이터를 클래스에 정의된 public 속성으로 설정할 수 있습니다:

```php
<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * 새로운 메시지 인스턴스를 생성합니다.
     */
    public function __construct(
        public Order $order,
    ) {}

    /**
     * 메시지 콘텐츠 정의를 가져옵니다.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.orders.shipped',
        );
    }
}
```

데이터가 public 속성으로 설정되면, 뷰에서 자동으로 사용할 수 있으므로 Blade 템플릿의 다른 데이터에 접근하는 것처럼 접근할 수 있습니다:

```blade
<div>
    Price: {{ $order->price }}
</div>
```

<a name="via-the-with-parameter"></a>
#### `with` 매개변수를 통해

템플릿으로 전송되기 전에 이메일 데이터의 형식을 커스터마이징하려면, `Content` 정의의 `with` 매개변수를 통해 수동으로 데이터를 뷰에 전달할 수 있습니다. 일반적으로 mailable 클래스의 생성자를 통해 데이터를 전달하지만, 이 데이터를 `protected` 또는 `private` 속성으로 설정하여 데이터가 템플릿에 자동으로 제공되지 않도록 해야 합니다:

```php
<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * 새로운 메시지 인스턴스를 생성합니다.
     */
    public function __construct(
        protected Order $order,
    ) {}

    /**
     * 메시지 콘텐츠 정의를 가져옵니다.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.orders.shipped',
            with: [
                'orderName' => $this->order->name,
                'orderPrice' => $this->order->price,
            ],
        );
    }
}
```

데이터가 `with` 매개변수를 통해 전달되면, 뷰에서 자동으로 사용할 수 있으므로 Blade 템플릿의 다른 데이터에 접근하는 것처럼 접근할 수 있습니다:

```blade
<div>
    Price: {{ $orderPrice }}
</div>
```

<a name="attachments"></a>
### 첨부 파일

이메일에 첨부 파일을 추가하려면, 메시지의 `attachments` 메소드에서 반환되는 배열에 첨부 파일을 추가합니다. 먼저, `Attachment` 클래스에서 제공하는 `fromPath` 메소드에 파일 경로를 제공하여 첨부 파일을 추가할 수 있습니다:

```php
use Illuminate\Mail\Mailables\Attachment;

/**
 * 메시지의 첨부 파일을 가져옵니다.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromPath('/path/to/file'),
    ];
}
```

메시지에 파일을 첨부할 때, `as` 및 `withMime` 메소드를 사용하여 첨부 파일의 표시 이름 및/또는 MIME 타입을 지정할 수도 있습니다:

```php
/**
 * 메시지의 첨부 파일을 가져옵니다.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromPath('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a name="attaching-files-from-disk"></a>
#### 디스크에서 파일 첨부하기

[파일시스템 디스크](/docs/{{version}}/filesystem) 중 하나에 파일을 저장한 경우, `fromStorage` 첨부 메소드를 사용하여 이메일에 첨부할 수 있습니다:

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

물론, 첨부 파일의 이름과 MIME 타입도 지정할 수 있습니다:

```php
/**
 * 메시지의 첨부 파일을 가져옵니다.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

기본 디스크 이외의 스토리지 디스크를 지정해야 하는 경우 `fromStorageDisk` 메소드를 사용할 수 있습니다:

```php
/**
 * 메시지의 첨부 파일을 가져옵니다.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorageDisk('s3', '/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a name="raw-data-attachments"></a>
#### Raw 데이터 첨부 파일

`fromData` 첨부 메소드를 사용하여 원시 바이트 문자열을 첨부 파일로 첨부할 수 있습니다. 예를 들어, 메모리에서 PDF를 생성하고 디스크에 쓰지 않고 이메일에 첨부하려는 경우 이 메소드를 사용할 수 있습니다. `fromData` 메소드는 원시 데이터 바이트를 반환하는 클로저와 첨부 파일에 할당해야 하는 이름을 받습니다:

```php
/**
 * 메시지의 첨부 파일을 가져옵니다.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromData(fn () => $this->pdf, 'Report.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a name="inline-attachments"></a>
### 인라인 첨부 파일

이메일에 인라인 이미지를 삽입하는 것은 일반적으로 번거롭습니다. 그러나 Laravel은 이메일에 이미지를 첨부하는 편리한 방법을 제공합니다. 인라인 이미지를 삽입하려면, 이메일 템플릿 내에서 `$message` 변수의 `embed` 메소드를 사용합니다. Laravel은 모든 이메일 템플릿에서 `$message` 변수를 자동으로 사용할 수 있도록 하므로, 수동으로 전달하는 것에 대해 걱정할 필요가 없습니다:

```blade
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

> [!WARNING]
> `$message` 변수는 일반 텍스트 메시지 템플릿에서는 사용할 수 없습니다. 일반 텍스트 메시지는 인라인 첨부 파일을 활용하지 않기 때문입니다.

<a name="embedding-raw-data-attachments"></a>
#### Raw 데이터 첨부 파일 삽입하기

이메일 템플릿에 삽입하려는 원시 이미지 데이터 문자열이 이미 있는 경우, `$message` 변수의 `embedData` 메소드를 호출할 수 있습니다. `embedData` 메소드를 호출할 때, 삽입된 이미지에 할당할 파일명을 제공해야 합니다:

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message->embedData($data, 'example-image.jpg') }}">
</body>
```

<a name="attachable-objects"></a>
### 첨부 가능한 객체

단순 문자열 경로를 통해 메시지에 파일을 첨부하는 것이 종종 충분하지만, 많은 경우 애플리케이션 내에서 첨부 가능한 엔티티는 클래스로 표현됩니다. 예를 들어, 애플리케이션이 메시지에 사진을 첨부하는 경우, 애플리케이션에는 해당 사진을 나타내는 `Photo` 모델이 있을 수도 있습니다. 그런 경우, `attach` 메소드에 `Photo` 모델을 단순히 전달하는 것이 편리하지 않을까요? 첨부 가능한 객체를 사용하면 바로 그렇게 할 수 있습니다.

시작하려면, 메시지에 첨부할 수 있는 객체에 `Illuminate\Contracts\Mail\Attachable` 인터페이스를 구현합니다. 이 인터페이스는 클래스가 `Illuminate\Mail\Attachment` 인스턴스를 반환하는 `toMailAttachment` 메소드를 정의하도록 지시합니다:

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Mail\Attachable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Mail\Attachment;

class Photo extends Model implements Attachable
{
    /**
     * 모델의 첨부 가능한 표현을 가져옵니다.
     */
    public function toMailAttachment(): Attachment
    {
        return Attachment::fromPath('/path/to/file');
    }
}
```

첨부 가능한 객체를 정의한 후, 이메일 메시지를 작성할 때 `attachments` 메소드에서 해당 객체의 인스턴스를 반환할 수 있습니다:

```php
/**
 * 메시지의 첨부 파일을 가져옵니다.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [$this->photo];
}
```

물론, 첨부 파일 데이터는 Amazon S3와 같은 원격 파일 스토리지 서비스에 저장될 수 있습니다. 따라서 Laravel은 애플리케이션의 [파일시스템 디스크](/docs/{{version}}/filesystem) 중 하나에 저장된 데이터에서 첨부 파일 인스턴스를 생성할 수도 있습니다:

```php
// 기본 디스크의 파일에서 첨부 파일을 생성합니다...
return Attachment::fromStorage($this->path);

// 특정 디스크의 파일에서 첨부 파일을 생성합니다...
return Attachment::fromStorageDisk('backblaze', $this->path);
```

또한, 메모리에 있는 데이터를 통해 첨부 파일 인스턴스를 생성할 수 있습니다. 이를 위해 `fromData` 메소드에 클로저를 제공합니다. 클로저는 첨부 파일을 나타내는 원시 데이터를 반환해야 합니다:

```php
return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

Laravel은 첨부 파일을 커스터마이징하는 데 사용할 수 있는 추가 메소드도 제공합니다. 예를 들어, `as` 및 `withMime` 메소드를 사용하여 파일의 이름과 MIME 타입을 커스터마이징할 수 있습니다:

```php
return Attachment::fromPath('/path/to/file')
    ->as('Photo Name')
    ->withMime('image/jpeg');
```

<a name="headers"></a>
### 헤더

때때로 발송되는 메시지에 추가 헤더를 첨부해야 할 수 있습니다. 예를 들어, 커스텀 `Message-Id` 또는 기타 임의의 텍스트 헤더를 설정해야 할 수 있습니다.

이를 위해 mailable에 `headers` 메소드를 정의합니다. `headers` 메소드는 `Illuminate\Mail\Mailables\Headers` 인스턴스를 반환해야 합니다. 이 클래스는 `messageId`, `references`, `text` 매개변수를 받습니다. 물론, 특정 메시지에 필요한 매개변수만 제공할 수 있습니다:

```php
use Illuminate\Mail\Mailables\Headers;

/**
 * 메시지 헤더를 가져옵니다.
 */
public function headers(): Headers
{
    return new Headers(
        messageId: 'custom-message-id@example.com',
        references: ['previous-message@example.com'],
        text: [
            'X-Custom-Header' => 'Custom Value',
        ],
    );
}
```

<a name="tags-and-metadata"></a>
### 태그와 메타데이터

Mailgun 및 Postmark와 같은 일부 타사 이메일 제공업체는 애플리케이션에서 발송한 이메일을 그룹화하고 추적하는 데 사용할 수 있는 메시지 "태그" 및 "메타데이터"를 지원합니다. `Envelope` 정의를 통해 이메일 메시지에 태그와 메타데이터를 추가할 수 있습니다:

```php
use Illuminate\Mail\Mailables\Envelope;

/**
 * 메시지 envelope을 가져옵니다.
 *
 * @return \Illuminate\Mail\Mailables\Envelope
 */
public function envelope(): Envelope
{
    return new Envelope(
        subject: 'Order Shipped',
        tags: ['shipment'],
        metadata: [
            'order_id' => $this->order->id,
        ],
    );
}
```

애플리케이션이 Mailgun 드라이버를 사용하는 경우, [태그](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) 및 [메타데이터](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages)에 대한 자세한 정보는 Mailgun 문서를 참조할 수 있습니다. 마찬가지로, [태그](https://postmarkapp.com/blog/tags-support-for-smtp) 및 [메타데이터](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 지원에 대한 자세한 정보는 Postmark 문서를 참조할 수 있습니다.

애플리케이션이 Amazon SES를 사용하여 이메일을 발송하는 경우, `metadata` 메소드를 사용하여 메시지에 [SES "태그"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)를 첨부해야 합니다.

<a name="customizing-the-symfony-message"></a>
### Symfony 메시지 커스터마이징

Laravel의 메일 기능은 Symfony Mailer로 구동됩니다. Laravel은 메시지를 발송하기 전에 Symfony Message 인스턴스와 함께 호출될 커스텀 콜백을 등록할 수 있도록 합니다. 이를 통해 메시지가 발송되기 전에 깊이 커스터마이징할 수 있습니다. 이를 위해 `Envelope` 정의에 `using` 매개변수를 정의합니다:

```php
use Illuminate\Mail\Mailables\Envelope;
use Symfony\Component\Mime\Email;

/**
 * 메시지 envelope을 가져옵니다.
 */
public function envelope(): Envelope
{
    return new Envelope(
        subject: 'Order Shipped',
        using: [
            function (Email $message) {
                // ...
            },
        ]
    );
}
```

<a name="markdown-mailables"></a>
## 마크다운 Mailable

마크다운 mailable 메시지를 사용하면 mailable에서 [메일 알림](/docs/{{version}}/notifications#mail-notifications)의 사전 구축된 템플릿과 컴포넌트를 활용할 수 있습니다. 메시지가 마크다운으로 작성되기 때문에, Laravel은 메시지를 위한 아름답고 반응형인 HTML 템플릿을 렌더링할 수 있으며 동시에 일반 텍스트 대응 버전도 자동으로 생성합니다.

<a name="generating-markdown-mailables"></a>
### 마크다운 Mailable 생성하기

해당 마크다운 템플릿이 있는 mailable을 생성하려면, `make:mail` Artisan 명령어의 `--markdown` 옵션을 사용할 수 있습니다:

```shell
php artisan make:mail OrderShipped --markdown=mail.orders.shipped
```

그런 다음, `content` 메소드 내에서 mailable `Content` 정의를 설정할 때, `view` 매개변수 대신 `markdown` 매개변수를 사용합니다:

```php
use Illuminate\Mail\Mailables\Content;

/**
 * 메시지 콘텐츠 정의를 가져옵니다.
 */
public function content(): Content
{
    return new Content(
        markdown: 'mail.orders.shipped',
        with: [
            'url' => $this->orderUrl,
        ],
    );
}
```

<a name="writing-markdown-messages"></a>
### 마크다운 메시지 작성하기

마크다운 mailable은 Blade 컴포넌트와 마크다운 구문의 조합을 사용하여 Laravel의 사전 구축된 이메일 UI 컴포넌트를 활용하면서 메일 메시지를 쉽게 구성할 수 있습니다:

```blade
<x-mail::message>
# Order Shipped

Your order has been shipped!

<x-mail::button :url="$url">
View Order
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

> [!NOTE]
> 마크다운 이메일을 작성할 때 과도한 들여쓰기를 사용하지 마세요. 마크다운 표준에 따라 마크다운 파서는 들여쓰기된 콘텐츠를 코드 블록으로 렌더링합니다.

<a name="button-component"></a>
#### 버튼 컴포넌트

버튼 컴포넌트는 중앙에 위치한 버튼 링크를 렌더링합니다. 이 컴포넌트는 두 개의 인수를 받습니다: `url`과 선택적 `color`. 지원되는 색상은 `primary`, `success`, `error`입니다. 메시지에 원하는 만큼 많은 버튼 컴포넌트를 추가할 수 있습니다:

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a name="panel-component"></a>
#### 패널 컴포넌트

패널 컴포넌트는 주어진 텍스트 블록을 메시지의 나머지 부분과 약간 다른 배경색을 가진 패널에 렌더링합니다. 이를 통해 주어진 텍스트 블록에 주의를 끌 수 있습니다:

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### 테이블 컴포넌트

테이블 컴포넌트를 사용하면 마크다운 테이블을 HTML 테이블로 변환할 수 있습니다. 이 컴포넌트는 마크다운 테이블을 콘텐츠로 받습니다. 기본 마크다운 테이블 정렬 구문을 사용하여 테이블 열 정렬을 지원합니다:

```blade
<x-mail::table>
| Laravel       | Table         | Example       |
| ------------- | :-----------: | ------------: |
| Col 2 is      | Centered      | $10           |
| Col 3 is      | Right-Aligned | $20           |
</x-mail::table>
```

<a name="customizing-the-components"></a>
### 컴포넌트 커스터마이징

커스터마이징을 위해 모든 마크다운 메일 컴포넌트를 자체 애플리케이션으로 내보낼 수 있습니다. 컴포넌트를 내보내려면, `vendor:publish` Artisan 명령어를 사용하여 `laravel-mail` 에셋 태그를 발행합니다:

```shell
php artisan vendor:publish --tag=laravel-mail
```

이 명령어는 마크다운 메일 컴포넌트를 `resources/views/vendor/mail` 디렉토리에 발행합니다. `mail` 디렉토리에는 `html` 및 `text` 디렉토리가 포함되어 있으며, 각각 사용 가능한 모든 컴포넌트의 해당 표현을 포함합니다. 이러한 컴포넌트를 원하는 대로 자유롭게 커스터마이징할 수 있습니다.

<a name="customizing-the-css"></a>
#### CSS 커스터마이징

컴포넌트를 내보낸 후, `resources/views/vendor/mail/html/themes` 디렉토리에는 `default.css` 파일이 포함됩니다. 이 파일에서 CSS를 커스터마이징할 수 있으며, 스타일은 자동으로 마크다운 메일 메시지의 HTML 표현 내에서 인라인 CSS 스타일로 변환됩니다.

Laravel의 마크다운 컴포넌트에 대해 완전히 새로운 테마를 구축하려면, `html/themes` 디렉토리에 CSS 파일을 배치할 수 있습니다. CSS 파일의 이름을 지정하고 저장한 후, 애플리케이션의 `config/mail.php` 설정 파일의 `theme` 옵션을 새 테마의 이름과 일치하도록 업데이트합니다.

개별 mailable에 대한 테마를 커스터마이징하려면, mailable 클래스의 `$theme` 속성을 해당 mailable을 발송할 때 사용해야 하는 테마의 이름으로 설정할 수 있습니다.

<a name="sending-mail"></a>
## 메일 발송하기

메시지를 발송하려면, `Mail` [파사드](/docs/{{version}}/facades)의 `to` 메소드를 사용합니다. `to` 메소드는 이메일 주소, 사용자 인스턴스 또는 사용자 컬렉션을 받습니다. 객체 또는 객체 컬렉션을 전달하면, 메일러가 자동으로 `email` 및 `name` 속성을 사용하여 이메일의 수신자를 결정하므로, 객체에서 이러한 속성을 사용할 수 있는지 확인하세요. 수신자를 지정한 후, mailable 클래스의 인스턴스를 `send` 메소드에 전달할 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

use App\Mail\OrderShipped;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OrderShipmentController extends Controller
{
    /**
     * 주어진 주문을 발송합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $order = Order::findOrFail($request->order_id);

        // 주문 발송...

        Mail::to($request->user())->send(new OrderShipped($order));

        return redirect('/orders');
    }
}
```

메시지를 발송할 때 "to" 수신자만 지정하는 것에 제한되지 않습니다. "to", "cc", "bcc" 수신자를 해당 메소드를 체이닝하여 자유롭게 설정할 수 있습니다:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

<a name="looping-over-recipients"></a>
#### 수신자 반복하기

때때로, 수신자/이메일 주소 배열을 순회하며 수신자 목록에 mailable을 발송해야 할 수 있습니다. 그러나 `to` 메소드는 이메일 주소를 mailable의 수신자 목록에 추가하기 때문에, 루프를 통한 각 반복은 모든 이전 수신자에게 또 다른 이메일을 발송합니다. 따라서, 각 수신자에 대해 항상 mailable 인스턴스를 다시 생성해야 합니다:

```php
foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
    Mail::to($recipient)->send(new OrderShipped($order));
}
```

<a name="sending-mail-via-a-specific-mailer"></a>
#### 특정 메일러를 통해 메일 발송하기

기본적으로 Laravel은 애플리케이션의 `mail` 설정 파일에서 `default` 메일러로 설정된 메일러를 사용하여 이메일을 발송합니다. 그러나 `mailer` 메소드를 사용하여 특정 메일러 설정을 사용하여 메시지를 발송할 수 있습니다:

```php
Mail::mailer('postmark')
    ->to($request->user())
    ->send(new OrderShipped($order));
```

<a name="queueing-mail"></a>
### 메일을 큐로 보내기

<a name="queueing-a-mail-message"></a>
#### 메일 메시지를 큐에 넣기

이메일 메시지를 발송하면 애플리케이션의 응답 시간에 부정적인 영향을 줄 수 있으므로, 많은 개발자들이 백그라운드 발송을 위해 이메일 메시지를 큐에 넣는 것을 선택합니다. Laravel은 내장된 [통합 큐 API](/docs/{{version}}/queues)를 사용하여 이를 쉽게 만들어 줍니다. 메일 메시지를 큐에 넣으려면, 메시지의 수신자를 지정한 후 `Mail` 파사드의 `queue` 메소드를 사용합니다:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

이 메소드는 메시지가 백그라운드에서 발송되도록 큐에 작업을 자동으로 푸시합니다. 이 기능을 사용하기 전에 [큐를 설정](/docs/{{version}}/queues)해야 합니다.

<a name="delayed-message-queueing"></a>
#### 지연된 메시지 큐잉

큐에 넣은 이메일 메시지의 전송을 지연시키려면, `later` 메소드를 사용할 수 있습니다. 첫 번째 인수로 `later` 메소드는 메시지가 발송되어야 하는 시점을 나타내는 `DateTime` 인스턴스를 받습니다:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->later(now()->plus(minutes: 10), new OrderShipped($order));
```

<a name="pushing-to-specific-queues"></a>
#### 특정 큐로 푸시하기

`make:mail` 명령어를 사용하여 생성된 모든 mailable 클래스는 `Illuminate\Bus\Queueable` 트레이트를 사용하므로, 모든 mailable 클래스 인스턴스에서 `onQueue` 및 `onConnection` 메소드를 호출하여 메시지의 연결 및 큐 이름을 지정할 수 있습니다:

```php
$message = (new OrderShipped($order))
    ->onConnection('sqs')
    ->onQueue('emails');

Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue($message);
```

<a name="queueing-by-default"></a>
#### 기본으로 큐에 넣기

항상 큐에 넣고 싶은 mailable 클래스가 있는 경우, 클래스에 `ShouldQueue` 계약을 구현할 수 있습니다. 이제 메일링 시 `send` 메소드를 호출해도, mailable이 계약을 구현하므로 여전히 큐에 들어갑니다:

```php
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Mailable implements ShouldQueue
{
    // ...
}
```

<a name="queued-mailables-and-database-transactions"></a>
#### 큐에 넣은 Mailable과 데이터베이스 트랜잭션

큐에 넣은 mailable이 데이터베이스 트랜잭션 내에서 디스패치되면, 데이터베이스 트랜잭션이 커밋되기 전에 큐에서 처리될 수 있습니다. 이런 경우, 데이터베이스 트랜잭션 중에 모델이나 데이터베이스 레코드에 대해 수행한 업데이트가 아직 데이터베이스에 반영되지 않을 수 있습니다. 또한, 트랜잭션 내에서 생성된 모델이나 데이터베이스 레코드가 데이터베이스에 존재하지 않을 수 있습니다. mailable이 이러한 모델에 의존하는 경우, 큐에 넣은 mailable을 발송하는 작업이 처리될 때 예기치 않은 오류가 발생할 수 있습니다.

큐 연결의 `after_commit` 설정 옵션이 `false`로 설정된 경우, 메일 메시지를 발송할 때 `afterCommit` 메소드를 호출하여 모든 열린 데이터베이스 트랜잭션이 커밋된 후에 특정 큐에 넣은 mailable이 디스패치되어야 함을 표시할 수 있습니다:

```php
Mail::to($request->user())->send(
    (new OrderShipped($order))->afterCommit()
);
```

또는, mailable의 생성자에서 `afterCommit` 메소드를 호출할 수 있습니다:

```php
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * 새로운 메시지 인스턴스를 생성합니다.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!NOTE]
> 이러한 문제에 대한 해결 방법에 대해 더 알아보려면, [큐에 넣은 작업과 데이터베이스 트랜잭션](/docs/{{version}}/queues#jobs-and-database-transactions) 관련 문서를 참조하세요.

<a name="queued-email-failures"></a>
#### 큐에 넣은 이메일 실패

큐에 넣은 이메일이 실패하면, 정의되어 있는 경우 큐에 넣은 mailable 클래스의 `failed` 메서드가 호출됩니다. 큐에 넣은 이메일이 실패하게 한 `Throwable` 인스턴스가 `failed` 메서드에 전달됩니다.

```php
<?php

namespace App\Mail;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Throwable;

class OrderDelayed extends Mailable implements ShouldQueue
{
    use SerializesModels;

    /**
     * 큐에 넣은 이메일의 실패를 처리합니다.
     */
    public function failed(Throwable $exception): void
    {
        // ...
    }
}
```

<a name="rendering-mailables"></a>
## Mailable 렌더링

때때로 mailable의 HTML 콘텐츠를 발송하지 않고 캡처하고 싶을 수 있습니다. 이를 위해 mailable의 `render` 메소드를 호출할 수 있습니다. 이 메소드는 mailable의 평가된 HTML 콘텐츠를 문자열로 반환합니다:

```php
use App\Mail\InvoicePaid;
use App\Models\Invoice;

$invoice = Invoice::find(1);

return (new InvoicePaid($invoice))->render();
```

<a name="previewing-mailables-in-the-browser"></a>
### 브라우저에서 Mailable 미리보기

mailable의 템플릿을 디자인할 때, 일반적인 Blade 템플릿처럼 렌더링된 mailable을 브라우저에서 빠르게 미리 보는 것이 편리합니다. 이러한 이유로, Laravel은 라우트 클로저나 컨트롤러에서 직접 mailable을 반환할 수 있도록 합니다. mailable이 반환되면, 브라우저에서 렌더링되어 표시되므로, 실제 이메일 주소로 발송하지 않고도 디자인을 빠르게 미리 볼 수 있습니다:

```php
Route::get('/mailable', function () {
    $invoice = App\Models\Invoice::find(1);

    return new App\Mail\InvoicePaid($invoice);
});
```

<a name="localizing-mailables"></a>
## Mailable 지역화

Laravel은 요청의 현재 로케일과 다른 로케일로 mailable을 발송할 수 있으며, 메일이 큐에 들어가더라도 이 로케일을 기억합니다.

이를 위해, `Mail` 파사드는 원하는 언어를 설정하는 `locale` 메소드를 제공합니다. mailable의 템플릿이 평가될 때 애플리케이션이 이 로케일로 변경되고, 평가가 완료되면 이전 로케일로 돌아갑니다:

```php
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

<a name="user-preferred-locales"></a>
#### 사용자 선호 로케일

때때로 애플리케이션은 각 사용자의 선호 로케일을 저장합니다. 하나 이상의 모델에 `HasLocalePreference` 계약을 구현함으로써, Laravel이 메일을 발송할 때 이 저장된 로케일을 사용하도록 지시할 수 있습니다:

```php
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * 사용자의 선호 로케일을 가져옵니다.
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

인터페이스를 구현하면, Laravel은 mailable 및 알림을 모델에 발송할 때 자동으로 선호 로케일을 사용합니다. 따라서, 이 인터페이스를 사용할 때 `locale` 메소드를 호출할 필요가 없습니다:

```php
Mail::to($request->user())->send(new OrderShipped($order));
```

<a name="testing-mailables"></a>
## 테스트

<a name="testing-mailable-content"></a>
### Mailable 내용 테스트

Laravel은 mailable의 구조를 검사하기 위한 다양한 메소드를 제공합니다. 또한 Laravel은 mailable에 예상한 콘텐츠가 포함되어 있는지 테스트하기 위한 여러 편리한 메소드를 제공합니다:

```php tab=Pest
use App\Mail\InvoicePaid;
use App\Models\User;

test('mailable content', function () {
    $user = User::factory()->create();

    $mailable = new InvoicePaid($user);

    $mailable->assertFrom('jeffrey@example.com');
    $mailable->assertTo('taylor@example.com');
    $mailable->assertHasCc('abigail@example.com');
    $mailable->assertHasBcc('victoria@example.com');
    $mailable->assertHasReplyTo('tyler@example.com');
    $mailable->assertHasSubject('Invoice Paid');
    $mailable->assertHasTag('example-tag');
    $mailable->assertHasMetadata('key', 'value');

    $mailable->assertSeeInHtml($user->email);
    $mailable->assertDontSeeInHtml('Invoice Not Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertDontSeeInText('Invoice Not Paid');
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
});
```

```php tab=PHPUnit
use App\Mail\InvoicePaid;
use App\Models\User;

public function test_mailable_content(): void
{
    $user = User::factory()->create();

    $mailable = new InvoicePaid($user);

    $mailable->assertFrom('jeffrey@example.com');
    $mailable->assertTo('taylor@example.com');
    $mailable->assertHasCc('abigail@example.com');
    $mailable->assertHasBcc('victoria@example.com');
    $mailable->assertHasReplyTo('tyler@example.com');
    $mailable->assertHasSubject('Invoice Paid');
    $mailable->assertHasTag('example-tag');
    $mailable->assertHasMetadata('key', 'value');

    $mailable->assertSeeInHtml($user->email);
    $mailable->assertDontSeeInHtml('Invoice Not Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertDontSeeInText('Invoice Not Paid');
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
}
```

예상대로, "HTML" 어설션은 mailable의 HTML 버전에 주어진 문자열이 포함되어 있음을 확인하고, "text" 어설션은 mailable의 일반 텍스트 버전에 주어진 문자열이 포함되어 있음을 확인합니다.

<a name="testing-mailable-sending"></a>
### Mailable 발송 테스트

특정 mailable이 특정 사용자에게 "발송"되었는지 확인하는 테스트와 mailable의 콘텐츠를 별도로 테스트하는 것을 권장합니다. 일반적으로 mailable의 콘텐츠는 테스트하려는 코드와 관련이 없으며, Laravel이 주어진 mailable을 발송하도록 지시받았는지 단순히 확인하는 것으로 충분합니다.

`Mail` 파사드의 `fake` 메소드를 사용하여 메일이 발송되지 않도록 할 수 있습니다. `Mail` 파사드의 `fake` 메소드를 호출한 후, mailable이 사용자에게 발송되도록 지시받았는지 확인하고 mailable이 수신한 데이터도 검사할 수 있습니다:

```php tab=Pest
<?php

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;

test('orders can be shipped', function () {
    Mail::fake();

    // 주문 발송 수행...

    // mailable이 발송되지 않았는지 확인...
    Mail::assertNothingSent();

    // mailable이 발송되었는지 확인...
    Mail::assertSent(OrderShipped::class);

    // mailable이 두 번 발송되었는지 확인...
    Mail::assertSent(OrderShipped::class, 2);

    // mailable이 이메일 주소로 발송되었는지 확인...
    Mail::assertSent(OrderShipped::class, 'example@laravel.com');

    // mailable이 여러 이메일 주소로 발송되었는지 확인...
    Mail::assertSent(OrderShipped::class, ['example@laravel.com', '...']);

    // mailable이 발송되지 않았는지 확인...
    Mail::assertNotSent(AnotherMailable::class);

    // mailable이 두 번 발송되었는지 확인...
    Mail::assertSentTimes(OrderShipped::class, 2);

    // 총 3개의 mailable이 발송되었는지 확인...
    Mail::assertSentCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Mail::fake();

        // 주문 발송 수행...

        // mailable이 발송되지 않았는지 확인...
        Mail::assertNothingSent();

        // mailable이 발송되었는지 확인...
        Mail::assertSent(OrderShipped::class);

        // mailable이 두 번 발송되었는지 확인...
        Mail::assertSent(OrderShipped::class, 2);

        // mailable이 이메일 주소로 발송되었는지 확인...
        Mail::assertSent(OrderShipped::class, 'example@laravel.com');

        // mailable이 여러 이메일 주소로 발송되었는지 확인...
        Mail::assertSent(OrderShipped::class, ['example@laravel.com', '...']);

        // mailable이 발송되지 않았는지 확인...
        Mail::assertNotSent(AnotherMailable::class);

        // mailable이 두 번 발송되었는지 확인...
        Mail::assertSentTimes(OrderShipped::class, 2);

        // 총 3개의 mailable이 발송되었는지 확인...
        Mail::assertSentCount(3);
    }
}
```

백그라운드 전송을 위해 mailable을 큐에 넣는 경우, `assertSent` 대신 `assertQueued` 메소드를 사용해야 합니다:

```php
Mail::assertQueued(OrderShipped::class);
Mail::assertNotQueued(OrderShipped::class);
Mail::assertNothingQueued();
Mail::assertQueuedCount(3);
```

`assertOutgoingCount` 메소드를 사용하여 발송되거나 큐에 넣은 mailable의 총 수를 어설션할 수도 있습니다:

```php
Mail::assertOutgoingCount(3);
```

주어진 "진실 테스트"를 통과하는 mailable이 발송되었는지 확인하기 위해 `assertSent`, `assertNotSent`, `assertQueued`, `assertNotQueued` 메소드에 클로저를 전달할 수 있습니다. 주어진 진실 테스트를 통과하는 mailable이 하나 이상 발송되면 어설션이 성공합니다:

```php
Mail::assertSent(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

`Mail` 파사드의 어설션 메소드를 호출할 때, 제공된 클로저에서 받는 mailable 인스턴스는 mailable을 검사하는 데 유용한 메소드를 노출합니다:

```php
Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($user) {
    return $mail->hasTo($user->email) &&
           $mail->hasCc('...') &&
           $mail->hasBcc('...') &&
           $mail->hasReplyTo('...') &&
           $mail->hasFrom('...') &&
           $mail->hasSubject('...') &&
           $mail->hasMetadata('order_id', $mail->order->id);
           $mail->usesMailer('ses');
});
```

mailable 인스턴스에는 mailable의 첨부 파일을 검사하기 위한 여러 유용한 메소드도 포함되어 있습니다:

```php
use Illuminate\Mail\Mailables\Attachment;

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
    return $mail->hasAttachment(
        Attachment::fromPath('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf')
    );
});

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
    return $mail->hasAttachment(
        Attachment::fromStorageDisk('s3', '/path/to/file')
    );
});

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($pdfData) {
    return $mail->hasAttachment(
        Attachment::fromData(fn () => $pdfData, 'name.pdf')
    );
});
```

메일이 발송되지 않았음을 확인하는 두 가지 메소드가 있다는 것을 알 수 있습니다: `assertNotSent` 및 `assertNotQueued`. 때때로 메일이 발송되지 **않았고** 큐에도 들어가지 않았는지 확인하고 싶을 수 있습니다. 이를 위해 `assertNothingOutgoing` 및 `assertNotOutgoing` 메소드를 사용할 수 있습니다:

```php
Mail::assertNothingOutgoing();

Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<a name="mail-and-local-development"></a>
## 메일과 로컬 개발 환경

이메일을 발송하는 애플리케이션을 개발할 때, 실제 이메일 주소로 이메일을 발송하고 싶지 않을 것입니다. Laravel은 로컬 개발 중에 실제 이메일 발송을 "비활성화"하는 여러 가지 방법을 제공합니다.

<a name="log-driver"></a>
#### 로그 드라이버

이메일을 발송하는 대신, `log` 메일 드라이버는 모든 이메일 메시지를 검사할 수 있도록 로그 파일에 기록합니다. 일반적으로 이 드라이버는 로컬 개발 중에만 사용됩니다. 환경별 애플리케이션 설정에 대한 자세한 정보는 [설정 문서](/docs/{{version}}/configuration#environment-configuration)를 확인하세요.

<a name="mailtrap"></a>
#### HELO / Mailtrap / Mailpit

또는, [HELO](https://usehelo.com) 또는 [Mailtrap](https://mailtrap.io)과 같은 서비스와 `smtp` 드라이버를 사용하여 이메일 메시지를 "더미" 메일박스로 발송하여 실제 이메일 클라이언트에서 볼 수 있습니다. 이 접근 방식은 Mailtrap의 메시지 뷰어에서 최종 이메일을 실제로 검사할 수 있다는 이점이 있습니다.

[Laravel Sail](/docs/{{version}}/sail)을 사용하는 경우, [Mailpit](https://github.com/axllent/mailpit)을 사용하여 메시지를 미리 볼 수 있습니다. Sail이 실행 중일 때, 다음 주소에서 Mailpit 인터페이스에 접근할 수 있습니다: `http://localhost:8025`.

<a name="using-a-global-to-address"></a>
#### 전역 `to` 주소 사용하기

마지막으로, `Mail` 파사드에서 제공하는 `alwaysTo` 메소드를 호출하여 전역 "to" 주소를 지정할 수 있습니다. 일반적으로 이 메소드는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메소드에서 호출해야 합니다:

```php
use Illuminate\Support\Facades\Mail;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    if ($this->app->environment('local')) {
        Mail::alwaysTo('taylor@example.com');
    }
}
```

`alwaysTo` 메소드를 사용할 때, 메일 메시지의 추가 "cc" 또는 "bcc" 주소는 제거됩니다.

<a name="events"></a>
## 이벤트

Laravel은 메일 메시지를 발송하는 동안 두 개의 이벤트를 디스패치합니다. `MessageSending` 이벤트는 메시지가 발송되기 전에 디스패치되고, `MessageSent` 이벤트는 메시지가 발송된 후에 디스패치됩니다. 이러한 이벤트는 메일이 큐에 들어갈 때가 아니라 *발송*될 때 디스패치된다는 것을 기억하세요. 애플리케이션 내에서 이러한 이벤트에 대한 [이벤트 리스너](/docs/{{version}}/events)를 생성할 수 있습니다:

```php
use Illuminate\Mail\Events\MessageSending;
// use Illuminate\Mail\Events\MessageSent;

class LogMessage
{
    /**
     * 이벤트를 처리합니다.
     */
    public function handle(MessageSending $event): void
    {
        // ...
    }
}
```

<a name="custom-transports"></a>
## 커스텀 전송 방식

Laravel에는 다양한 메일 전송 방식이 포함되어 있지만, Laravel이 기본적으로 지원하지 않는 다른 서비스를 통해 이메일을 전달하기 위해 자체 전송 방식을 작성하고 싶을 수 있습니다. 시작하려면, `Symfony\Component\Mailer\Transport\AbstractTransport` 클래스를 확장하는 클래스를 정의합니다. 그런 다음, 전송 방식에 `doSend` 및 `__toString` 메소드를 구현합니다:

```php
<?php

namespace App\Mail;

use MailchimpTransactional\ApiClient;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;

class MailchimpTransport extends AbstractTransport
{
    /**
     * 새로운 Mailchimp 전송 인스턴스를 생성합니다.
     */
    public function __construct(
        protected ApiClient $client,
    ) {
        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $this->client->messages->send(['message' => [
            'from_email' => $email->getFrom(),
            'to' => collect($email->getTo())->map(function (Address $email) {
                return ['email' => $email->getAddress(), 'type' => 'to'];
            })->all(),
            'subject' => $email->getSubject(),
            'text' => $email->getTextBody(),
        ]]);
    }

    /**
     * 전송 방식의 문자열 표현을 가져옵니다.
     */
    public function __toString(): string
    {
        return 'mailchimp';
    }
}
```

커스텀 전송 방식을 정의한 후, `Mail` 파사드에서 제공하는 `extend` 메소드를 통해 등록할 수 있습니다. 일반적으로 이는 애플리케이션의 `AppServiceProvider`의 `boot` 메소드 내에서 수행해야 합니다. `$config` 인수가 `extend` 메소드에 제공된 클로저에 전달됩니다. 이 인수는 애플리케이션의 `config/mail.php` 설정 파일에서 메일러에 대해 정의된 설정 배열을 포함합니다:

```php
use App\Mail\MailchimpTransport;
use Illuminate\Support\Facades\Mail;
use MailchimpTransactional\ApiClient;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Mail::extend('mailchimp', function (array $config = []) {
        $client = new ApiClient;

        $client->setApiKey($config['key']);

        return new MailchimpTransport($client);
    });
}
```

커스텀 전송 방식이 정의되고 등록되면, 새 전송 방식을 활용하는 메일러 정의를 애플리케이션의 `config/mail.php` 설정 파일에 생성할 수 있습니다:

```php
'mailchimp' => [
    'transport' => 'mailchimp',
    'key' => env('MAILCHIMP_API_KEY'),
    // ...
],
```

<a name="additional-symfony-transports"></a>
### 추가 Symfony 전송 방식

Laravel에는 Mailgun 및 Postmark와 같이 Symfony에서 유지 관리하는 기존 메일 전송 방식에 대한 지원이 포함되어 있습니다. 그러나 추가 Symfony 유지 관리 전송 방식에 대한 지원으로 Laravel을 확장하고 싶을 수 있습니다. Composer를 통해 필요한 Symfony 메일러를 요구하고 Laravel에 전송 방식을 등록하여 이를 수행할 수 있습니다. 예를 들어, "Brevo"(이전의 "Sendinblue") Symfony 메일러를 설치하고 등록할 수 있습니다:

```shell
composer require symfony/brevo-mailer symfony/http-client
```

Brevo 메일러 패키지가 설치되면, 애플리케이션의 `services` 설정 파일에 Brevo API 자격 증명에 대한 항목을 추가할 수 있습니다:

```php
'brevo' => [
    'key' => env('BREVO_API_KEY'),
],
```

다음으로, `Mail` 파사드의 `extend` 메소드를 사용하여 Laravel에 전송 방식을 등록할 수 있습니다. 일반적으로 이는 서비스 프로바이더의 `boot` 메소드 내에서 수행해야 합니다:

```php
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Mail::extend('brevo', function () {
        return (new BrevoTransportFactory)->create(
            new Dsn(
                'brevo+api',
                'default',
                config('services.brevo.key')
            )
        );
    });
}
```

전송 방식이 등록되면, 새 전송 방식을 활용하는 메일러 정의를 애플리케이션의 `config/mail.php` 설정 파일에 생성할 수 있습니다:

```php
'brevo' => [
    'transport' => 'brevo',
    // ...
],
```

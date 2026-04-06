# Laravel Cashier (Stripe)

- [소개](#introduction)
- [Cashier 업그레이드](#upgrading-cashier)
- [설치](#installation)
- [설정](#configuration)
    - [청구 가능 모델(Billable Model)](#billable-model)
    - [API 키](#api-keys)
    - [통화 설정](#currency-configuration)
    - [세금 설정](#tax-configuration)
    - [로깅](#logging)
    - [커스텀 모델 사용하기](#using-custom-models)
- [빠른 시작](#quickstart)
    - [상품 판매하기](#quickstart-selling-products)
    - [구독 판매하기](#quickstart-selling-subscriptions)
- [고객](#customers)
    - [고객 조회하기](#retrieving-customers)
    - [고객 생성하기](#creating-customers)
    - [고객 업데이트하기](#updating-customers)
    - [잔액](#balances)
    - [세금 ID](#tax-ids)
    - [Stripe와 고객 데이터 동기화하기](#syncing-customer-data-with-stripe)
    - [빌링 포탈](#billing-portal)
- [결제 수단](#payment-methods)
    - [결제 수단 저장하기](#storing-payment-methods)
    - [결제 수단 조회하기](#retrieving-payment-methods)
    - [결제 수단 존재 여부 확인](#payment-method-presence)
    - [기본 결제 수단 업데이트하기](#updating-the-default-payment-method)
    - [결제 수단 추가하기](#adding-payment-methods)
    - [결제 수단 삭제하기](#deleting-payment-methods)
- [구독](#subscriptions)
    - [구독 생성하기](#creating-subscriptions)
    - [구독 상태 확인하기](#checking-subscription-status)
    - [가격 변경하기](#changing-prices)
    - [구독 수량](#subscription-quantity)
    - [여러 상품이 포함된 구독](#subscriptions-with-multiple-products)
    - [다중 구독](#multiple-subscriptions)
    - [사용량 기반 과금](#usage-based-billing)
    - [구독 세금](#subscription-taxes)
    - [구독 기준일](#subscription-anchor-date)
    - [구독 취소하기](#cancelling-subscriptions)
    - [구독 재개하기](#resuming-subscriptions)
- [구독 체험 기간](#subscription-trials)
    - [결제 수단 선등록 방식](#with-payment-method-up-front)
    - [결제 수단 미등록 방식](#without-payment-method-up-front)
    - [체험 기간 연장하기](#extending-trials)
- [Stripe 웹훅 처리하기](#handling-stripe-webhooks)
    - [웹훅 이벤트 핸들러 정의하기](#defining-webhook-event-handlers)
    - [웹훅 서명 검증하기](#verifying-webhook-signatures)
- [단건 결제](#single-charges)
    - [간단한 결제](#simple-charge)
    - [인보이스와 함께 결제하기](#charge-with-invoice)
    - [결제 인텐트(Payment Intent) 생성하기](#creating-payment-intents)
    - [결제 환불하기](#refunding-charges)
- [인보이스](#invoices)
    - [인보이스 조회하기](#retrieving-invoices)
    - [예정된 인보이스](#upcoming-invoices)
    - [구독 인보이스 미리보기](#previewing-subscription-invoices)
    - [인보이스 PDF 생성하기](#generating-invoice-pdfs)
- [체크아웃](#checkout)
    - [상품 체크아웃](#product-checkouts)
    - [단건 결제 체크아웃](#single-charge-checkouts)
    - [구독 체크아웃](#subscription-checkouts)
    - [세금 ID 수집하기](#collecting-tax-ids)
    - [게스트 체크아웃](#guest-checkouts)
- [결제 실패 처리하기](#handling-failed-payments)
    - [결제 확인하기](#confirming-payments)
- [강력한 고객 인증(SCA)](#strong-customer-authentication)
    - [추가 확인이 필요한 결제](#payments-requiring-additional-confirmation)
    - [오프 세션 결제 알림](#off-session-payment-notifications)
- [Stripe SDK](#stripe-sdk)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe)는 [Stripe](https://stripe.com)의 구독 결제 서비스에 대한 표현력 있고 유연한 인터페이스를 제공합니다. 작성하기 번거로운 구독 결제 관련 보일러플레이트 코드의 거의 전부를 처리해줍니다. 기본적인 구독 관리 외에도 Cashier는 쿠폰, 구독 변경, 구독 "수량", 취소 유예 기간 처리, 그리고 인보이스 PDF 생성까지 지원합니다.

<a name="upgrading-cashier"></a>
## Cashier 업그레이드

Cashier의 새 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/cashier-stripe/blob/16.x/UPGRADE.md)를 주의 깊게 검토하는 것이 중요합니다.

> [!WARNING]
> 호환성이 깨지는 변경을 방지하기 위해 Cashier는 고정된 Stripe API 버전을 사용합니다. Cashier 16은 Stripe API 버전 `2025-06-30.basil`을 사용합니다. Stripe API 버전은 새로운 Stripe 기능과 개선 사항을 활용하기 위해 마이너 릴리스에서 업데이트됩니다.

<a name="installation"></a>
## 설치

먼저 Composer 패키지 관리자를 사용하여 Stripe용 Cashier 패키지를 설치합니다.

```shell
composer require laravel/cashier
```

패키지를 설치한 후 `vendor:publish` Artisan 명령어를 사용하여 Cashier의 마이그레이션을 퍼블리시합니다.

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

그런 다음 데이터베이스를 마이그레이션합니다.

```shell
php artisan migrate
```

Cashier의 마이그레이션은 `users` 테이블에 여러 컬럼을 추가합니다. 또한 고객의 모든 구독을 보관하는 새로운 `subscriptions` 테이블과 여러 가격이 포함된 구독을 위한 `subscription_items` 테이블을 생성합니다.

원하신다면 `vendor:publish` Artisan 명령어를 사용하여 Cashier의 설정 파일도 퍼블리시할 수 있습니다.

```shell
php artisan vendor:publish --tag="cashier-config"
```

마지막으로 Cashier가 모든 Stripe 이벤트를 올바르게 처리할 수 있도록 [Cashier의 웹훅 처리 설정](#handling-stripe-webhooks)을 잊지 마세요.

> [!WARNING]
> Stripe는 Stripe 식별자를 저장하는 컬럼이 대소문자를 구분해야 한다고 권장합니다. 따라서 MySQL을 사용할 때 `stripe_id` 컬럼의 콜레이션(collation)이 `utf8_bin`으로 설정되어 있는지 확인해야 합니다. 이에 대한 자세한 정보는 [Stripe 문서](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible)에서 확인할 수 있습니다.

<a name="configuration"></a>
## 설정

<a name="billable-model"></a>
### 청구 가능 모델(Billable Model)

Cashier를 사용하기 전에 청구 가능 모델(billable model) 정의에 `Billable` 트레이트를 추가합니다. 일반적으로 이는 `App\Models\User` 모델이 됩니다. 이 트레이트는 구독 생성, 쿠폰 적용, 결제 수단 정보 업데이트와 같은 일반적인 결제 작업을 수행할 수 있는 다양한 메서드를 제공합니다.

```php
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Cashier는 청구 가능 모델이 Laravel에 기본 제공되는 `App\Models\User` 클래스라고 가정합니다. 이를 변경하려면 `useCustomerModel` 메서드를 통해 다른 모델을 지정할 수 있습니다. 이 메서드는 일반적으로 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```php
use App\Models\Cashier\User;
use Laravel\Cashier\Cashier;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Cashier::useCustomerModel(User::class);
}
```

> [!WARNING]
> Laravel에서 제공하는 `App\Models\User` 모델 외에 다른 모델을 사용하는 경우, 대체 모델의 테이블 이름과 일치하도록 제공된 [Cashier 마이그레이션](#installation)을 퍼블리시하고 수정해야 합니다.

<a name="api-keys"></a>
### API 키

다음으로 애플리케이션의 `.env` 파일에서 Stripe API 키를 설정해야 합니다. Stripe 관리 패널에서 Stripe API 키를 가져올 수 있습니다.

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

> [!WARNING]
> 들어오는 웹훅이 실제로 Stripe에서 온 것인지 확인하는 데 `STRIPE_WEBHOOK_SECRET` 환경 변수가 사용되므로, 애플리케이션의 `.env` 파일에 이 변수가 정의되어 있는지 확인해야 합니다.

<a name="currency-configuration"></a>
### 통화 설정

Cashier의 기본 통화는 미국 달러(USD)입니다. 애플리케이션의 `.env` 파일에서 `CASHIER_CURRENCY` 환경 변수를 설정하여 기본 통화를 변경할 수 있습니다.

```ini
CASHIER_CURRENCY=eur
```

Cashier의 통화를 설정하는 것 외에도 인보이스에 금액 값을 표시할 때 사용할 로케일을 지정할 수 있습니다. 내부적으로 Cashier는 [PHP의 `NumberFormatter` 클래스](https://www.php.net/manual/en/class.numberformatter.php)를 활용하여 통화 로케일을 설정합니다.

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]
> `en` 이외의 로케일을 사용하려면 서버에 `ext-intl` PHP 확장이 설치되고 설정되어 있는지 확인하세요.

<a name="tax-configuration"></a>
### 세금 설정

[Stripe Tax](https://stripe.com/tax) 덕분에 Stripe에서 생성하는 모든 인보이스에 대해 자동으로 세금을 계산할 수 있습니다. 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `calculateTaxes` 메서드를 호출하여 자동 세금 계산을 활성화할 수 있습니다.

```php
use Laravel\Cashier\Cashier;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Cashier::calculateTaxes();
}
```

세금 계산이 활성화되면 새로운 구독과 생성되는 모든 일회성 인보이스에 대해 자동 세금 계산이 적용됩니다.

이 기능이 올바르게 작동하려면 고객의 이름, 주소, 세금 ID와 같은 고객의 청구 정보가 Stripe에 동기화되어야 합니다. 이를 위해 Cashier에서 제공하는 [고객 데이터 동기화](#syncing-customer-data-with-stripe) 및 [세금 ID](#tax-ids) 메서드를 사용할 수 있습니다.

<a name="logging"></a>
### 로깅

Cashier를 사용하면 치명적인 Stripe 오류를 로깅할 때 사용할 로그 채널을 지정할 수 있습니다. 애플리케이션의 `.env` 파일에서 `CASHIER_LOGGER` 환경 변수를 정의하여 로그 채널을 지정할 수 있습니다.

```ini
CASHIER_LOGGER=stack
```

Stripe에 대한 API 호출로 생성되는 예외는 애플리케이션의 기본 로그 채널을 통해 로깅됩니다.

<a name="using-custom-models"></a>
### 커스텀 모델 사용하기

Cashier가 내부적으로 사용하는 모델을 자유롭게 확장할 수 있습니다. 자체 모델을 정의하고 해당 Cashier 모델을 확장하면 됩니다.

```php
use Laravel\Cashier\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

모델을 정의한 후 `Laravel\Cashier\Cashier` 클래스를 통해 Cashier에 커스텀 모델 사용을 지시할 수 있습니다. 일반적으로 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 Cashier에 커스텀 모델에 대해 알려주어야 합니다.

```php
use App\Models\Cashier\Subscription;
use App\Models\Cashier\SubscriptionItem;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
 */
public function boot(): void
{
    Cashier::useSubscriptionModel(Subscription::class);
    Cashier::useSubscriptionItemModel(SubscriptionItem::class);
}
```

<a name="quickstart"></a>
## 빠른 시작

<a name="quickstart-selling-products"></a>
### 상품 판매하기

> [!NOTE]
> Stripe Checkout을 사용하기 전에 Stripe 대시보드에서 고정 가격의 상품(Products)을 정의해야 합니다. 또한 [Cashier의 웹훅 처리를 설정](#handling-stripe-webhooks)해야 합니다.

애플리케이션을 통해 상품 및 구독 결제를 제공하는 것은 어렵게 느껴질 수 있습니다. 하지만 Cashier와 [Stripe Checkout](https://stripe.com/payments/checkout) 덕분에 현대적이고 강력한 결제 통합을 쉽게 구축할 수 있습니다.

반복되지 않는 단건 결제 상품에 대해 고객에게 요금을 청구하려면 Cashier를 활용하여 고객을 Stripe Checkout으로 안내합니다. 고객은 결제 정보를 제공하고 구매를 확인합니다. Checkout을 통해 결제가 완료되면 고객은 애플리케이션 내에서 선택한 성공 URL로 리디렉션됩니다.

```php
use Illuminate\Http\Request;

Route::get('/checkout', function (Request $request) {
    $stripePriceId = 'price_deluxe_album';

    $quantity = 1;

    return $request->user()->checkout([$stripePriceId => $quantity], [
        'success_url' => route('checkout-success'),
        'cancel_url' => route('checkout-cancel'),
    ]);
})->name('checkout');

Route::view('/checkout/success', 'checkout.success')->name('checkout-success');
Route::view('/checkout/cancel', 'checkout.cancel')->name('checkout-cancel');
```

위의 예제에서 볼 수 있듯이 Cashier가 제공하는 `checkout` 메서드를 활용하여 주어진 "가격 식별자(price identifier)"에 대해 고객을 Stripe Checkout으로 리디렉션합니다. Stripe를 사용할 때 "가격(prices)"은 [특정 상품에 대해 정의된 가격](https://stripe.com/docs/products-prices/how-products-and-prices-work)을 의미합니다.

필요한 경우 `checkout` 메서드는 자동으로 Stripe에 고객을 생성하고 해당 Stripe 고객 레코드를 애플리케이션 데이터베이스의 해당 사용자와 연결합니다. 체크아웃 세션이 완료되면 고객은 전용 성공 또는 취소 페이지로 리디렉션되어 고객에게 정보 메시지를 표시할 수 있습니다.

<a name="providing-meta-data-to-stripe-checkout"></a>
#### Stripe Checkout에 메타 데이터 제공하기

상품을 판매할 때 애플리케이션에서 정의한 `Cart` 및 `Order` 모델을 통해 완료된 주문과 구매한 상품을 추적하는 것이 일반적입니다. Stripe Checkout으로 고객을 리디렉션하여 구매를 완료할 때 고객이 애플리케이션으로 다시 리디렉션될 때 완료된 구매를 해당 주문과 연결할 수 있도록 기존 주문 식별자를 제공해야 할 수 있습니다.

이를 위해 `checkout` 메서드에 `metadata` 배열을 제공할 수 있습니다. 사용자가 체크아웃 프로세스를 시작할 때 애플리케이션 내에서 보류 중인 `Order`가 생성된다고 가정해 보겠습니다. 이 예제의 `Cart` 및 `Order` 모델은 설명용이며 Cashier에서 제공하지 않습니다. 애플리케이션의 필요에 따라 이러한 개념을 자유롭게 구현할 수 있습니다.

```php
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/cart/{cart}/checkout', function (Request $request, Cart $cart) {
    $order = Order::create([
        'cart_id' => $cart->id,
        'price_ids' => $cart->price_ids,
        'status' => 'incomplete',
    ]);

    return $request->user()->checkout($order->price_ids, [
        'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => route('checkout-cancel'),
        'metadata' => ['order_id' => $order->id],
    ]);
})->name('checkout');
```

위의 예제에서 볼 수 있듯이 사용자가 체크아웃 프로세스를 시작하면 장바구니/주문에 연결된 모든 Stripe 가격 식별자를 `checkout` 메서드에 제공합니다. 물론 애플리케이션은 고객이 이러한 항목을 추가할 때 "장바구니" 또는 주문에 연결하는 역할을 합니다. 또한 `metadata` 배열을 통해 주문 ID를 Stripe Checkout 세션에 제공합니다. 마지막으로 `CHECKOUT_SESSION_ID` 템플릿 변수를 Checkout 성공 라우트에 추가했습니다. Stripe가 고객을 애플리케이션으로 다시 리디렉션하면 이 템플릿 변수가 자동으로 Checkout 세션 ID로 채워집니다.

다음으로 Checkout 성공 라우트를 구축해 보겠습니다. 이 라우트는 Stripe Checkout을 통해 구매가 완료된 후 사용자가 리디렉션되는 라우트입니다. 이 라우트 내에서 Stripe Checkout 세션 ID와 연결된 Stripe Checkout 인스턴스를 검색하여 제공한 메타 데이터에 액세스하고 고객의 주문을 적절히 업데이트할 수 있습니다.

```php
use App\Models\Order;
use Illuminate\Http\Request;
use Laravel\Cashier\Cashier;

Route::get('/checkout/success', function (Request $request) {
    $sessionId = $request->get('session_id');

    if ($sessionId === null) {
        return;
    }

    $session = Cashier::stripe()->checkout->sessions->retrieve($sessionId);

    if ($session->payment_status !== 'paid') {
        return;
    }

    $orderId = $session['metadata']['order_id'] ?? null;

    $order = Order::findOrFail($orderId);

    $order->update(['status' => 'completed']);

    return view('checkout-success', ['order' => $order]);
})->name('checkout-success');
```

Checkout 세션 객체에 포함된 데이터에 대한 자세한 내용은 Stripe 문서를 참조하세요. [Checkout 세션 객체 문서](https://stripe.com/docs/api/checkout/sessions/object)

<a name="quickstart-selling-subscriptions"></a>
### 구독 판매하기

> [!NOTE]
> Stripe Checkout을 사용하기 전에 Stripe 대시보드에서 고정 가격의 상품(Products)을 정의해야 합니다. 또한 [Cashier의 웹훅 처리를 설정](#handling-stripe-webhooks)해야 합니다.

애플리케이션을 통해 상품 및 구독 결제를 제공하는 것은 어렵게 느껴질 수 있습니다. 하지만 Cashier와 [Stripe Checkout](https://stripe.com/payments/checkout) 덕분에 현대적이고 강력한 결제 통합을 쉽게 구축할 수 있습니다.

Cashier와 Stripe Checkout을 사용하여 구독을 판매하는 방법을 배우기 위해 기본 월간(`price_basic_monthly`) 및 연간(`price_basic_yearly`) 요금제가 있는 간단한 구독 서비스 시나리오를 고려해 보겠습니다. 이 두 가격은 Stripe 대시보드에서 "Basic" 상품(`pro_basic`) 아래에 그룹화될 수 있습니다. 또한 구독 서비스는 `pro_expert`로 Expert 요금제를 제공할 수 있습니다.

먼저 고객이 서비스에 구독하는 방법을 알아보겠습니다. 물론 고객이 애플리케이션의 가격 책정 페이지에서 Basic 요금제의 "구독" 버튼을 클릭할 수 있다고 상상할 수 있습니다. 이 버튼 또는 링크는 선택한 요금제에 대한 Stripe Checkout 세션을 생성하는 Laravel 라우트로 사용자를 안내해야 합니다.

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_basic_monthly')
        ->trialDays(5)
        ->allowPromotionCodes()
        ->checkout([
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

위의 예제에서 볼 수 있듯이 고객을 Stripe Checkout 세션으로 리디렉션하여 Basic 요금제에 구독할 수 있도록 합니다. 성공적인 체크아웃 또는 취소 후 고객은 `checkout` 메서드에 제공한 URL로 다시 리디렉션됩니다. 구독이 실제로 시작된 시점을 알기 위해(일부 결제 수단은 처리하는 데 몇 초가 걸리므로) [Cashier의 웹훅 처리를 설정](#handling-stripe-webhooks)해야 합니다.

이제 고객이 구독을 시작할 수 있으므로 구독한 사용자만 액세스할 수 있도록 애플리케이션의 특정 부분을 제한해야 합니다. 물론 Cashier의 `Billable` 트레이트에서 제공하는 `subscribed` 메서드를 통해 사용자의 현재 구독 상태를 항상 확인할 수 있습니다.

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

사용자가 특정 상품 또는 가격에 구독되어 있는지도 쉽게 확인할 수 있습니다.

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### 구독 미들웨어 구축하기

편의를 위해 들어오는 요청이 구독한 사용자로부터 온 것인지 확인하는 [미들웨어](/docs/{{version}}/middleware)를 만들 수 있습니다. 이 미들웨어가 정의되면 구독하지 않은 사용자가 라우트에 액세스하지 못하도록 라우트에 쉽게 할당할 수 있습니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Subscribed
{
    /**
     * 들어오는 요청을 처리합니다.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->subscribed()) {
            // 사용자를 결제 페이지로 리디렉션하고 구독을 요청합니다...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

미들웨어가 정의되면 라우트에 할당할 수 있습니다.

```php
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### 고객이 결제 요금제를 관리할 수 있도록 허용하기

물론 고객은 구독 요금제를 다른 상품 또는 "등급"으로 변경하고 싶어할 수 있습니다. 이를 허용하는 가장 쉬운 방법은 고객을 Stripe의 [Customer Billing Portal](https://stripe.com/docs/no-code/customer-portal)로 안내하는 것입니다. 이 포탈은 고객이 인보이스를 다운로드하고, 결제 수단을 업데이트하고, 구독 요금제를 변경할 수 있는 호스팅된 사용자 인터페이스를 제공합니다.

먼저 애플리케이션 내에서 Billing Portal 세션을 시작하는 데 사용할 Laravel 라우트로 사용자를 안내하는 링크 또는 버튼을 정의합니다.

```blade
<a href="{{ route('billing') }}">
    Billing
</a>
```

다음으로 Stripe Customer Billing Portal 세션을 시작하고 사용자를 Portal로 리디렉션하는 라우트를 정의해 보겠습니다. `redirectToBillingPortal` 메서드는 Portal을 종료할 때 사용자가 돌아갈 URL을 받습니다.

```php
use Illuminate\Http\Request;

Route::get('/billing', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('dashboard'));
})->middleware(['auth'])->name('billing');
```

> [!NOTE]
> Cashier의 웹훅 처리를 설정했다면 Cashier는 Stripe에서 들어오는 웹훅을 검사하여 애플리케이션의 Cashier 관련 데이터베이스 테이블을 자동으로 동기화 상태로 유지합니다. 예를 들어 사용자가 Stripe의 Customer Billing Portal을 통해 구독을 취소하면 Cashier는 해당 웹훅을 수신하고 애플리케이션의 데이터베이스에서 구독을 "취소됨"으로 표시합니다.

<a name="customers"></a>
## 고객

<a name="retrieving-customers"></a>
### 고객 조회하기

`Cashier::findBillable` 메서드를 사용하여 Stripe ID로 고객을 조회할 수 있습니다. 이 메서드는 청구 가능 모델(billable model)의 인스턴스를 반환합니다.

```php
use Laravel\Cashier\Cashier;

$user = Cashier::findBillable($stripeId);
```

<a name="creating-customers"></a>
### 고객 생성하기

때때로 구독을 시작하지 않고 Stripe 고객을 생성하고 싶을 수 있습니다. `createAsStripeCustomer` 메서드를 사용하여 이를 수행할 수 있습니다.

```php
$stripeCustomer = $user->createAsStripeCustomer();
```

Stripe에서 고객이 생성되면 나중에 구독을 시작할 수 있습니다. [Stripe API에서 지원하는 추가 고객 생성 파라미터](https://stripe.com/docs/api/customers/create)를 전달하기 위해 선택적으로 `$options` 배열을 제공할 수 있습니다.

```php
$stripeCustomer = $user->createAsStripeCustomer($options);
```

청구 가능 모델에 대한 Stripe 고객 객체를 반환하려면 `asStripeCustomer` 메서드를 사용할 수 있습니다.

```php
$stripeCustomer = $user->asStripeCustomer();
```

주어진 청구 가능 모델에 대한 Stripe 고객 객체를 검색하고 싶지만 청구 가능 모델이 이미 Stripe 내의 고객인지 확실하지 않은 경우 `createOrGetStripeCustomer` 메서드를 사용할 수 있습니다. 이 메서드는 아직 존재하지 않는 경우 Stripe에 새 고객을 생성합니다.

```php
$stripeCustomer = $user->createOrGetStripeCustomer();
```
```

<a name="updating-customers"></a>
### 고객 정보 업데이트

때때로 Stripe 고객 정보를 추가 정보와 함께 직접 업데이트해야 할 수 있습니다. `updateStripeCustomer` 메서드를 사용하여 이를 수행할 수 있습니다. 이 메서드는 [Stripe API에서 지원하는 고객 업데이트 옵션](https://stripe.com/docs/api/customers/update)의 배열을 인수로 받습니다:

```php
$stripeCustomer = $user->updateStripeCustomer($options);
```

<a name="balances"></a>
### 잔액(Balances)

Stripe에서는 고객의 "잔액"에 크레딧을 추가하거나 차감할 수 있습니다. 이후에 이 잔액은 새 인보이스에서 크레딧 또는 차감됩니다. 고객의 총 잔액을 확인하려면 청구 가능 모델에서 사용할 수 있는 `balance` 메서드를 사용할 수 있습니다. `balance` 메서드는 고객의 통화로 형식화된 문자열 표현의 잔액을 반환합니다:

```php
$balance = $user->balance();
```

고객의 잔액에 크레딧을 추가하려면 `creditBalance` 메서드에 값을 전달하면 됩니다. 원한다면 설명도 함께 제공할 수 있습니다:

```php
$user->creditBalance(500, 'Premium customer top-up.');
```

`debitBalance` 메서드에 값을 제공하면 고객의 잔액에서 차감됩니다:

```php
$user->debitBalance(300, 'Bad usage penalty.');
```

`applyBalance` 메서드는 고객에 대한 새로운 고객 잔액 트랜잭션을 생성합니다. `balanceTransactions` 메서드를 사용하여 이러한 트랜잭션 기록을 조회할 수 있으며, 이는 고객이 검토할 수 있는 크레딧 및 차감 로그를 제공하는 데 유용할 수 있습니다:

```php
// 모든 트랜잭션 조회...
$transactions = $user->balanceTransactions();

foreach ($transactions as $transaction) {
    // 트랜잭션 금액...
    $amount = $transaction->amount(); // $2.31

    // 가능한 경우 관련 인보이스 조회...
    $invoice = $transaction->invoice();
}
```

<a name="tax-ids"></a>
### 세금 ID(Tax IDs)

Cashier는 고객의 세금 ID를 관리하는 쉬운 방법을 제공합니다. 예를 들어, `taxIds` 메서드를 사용하여 고객에게 할당된 모든 [세금 ID](https://stripe.com/docs/api/customer_tax_ids/object)를 컬렉션으로 조회할 수 있습니다:

```php
$taxIds = $user->taxIds();
```

식별자를 통해 고객의 특정 세금 ID를 조회할 수도 있습니다:

```php
$taxId = $user->findTaxId('txi_belgium');
```

유효한 [유형](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type)과 값을 `createTaxId` 메서드에 전달하여 새로운 세금 ID를 생성할 수 있습니다:

```php
$taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

`createTaxId` 메서드는 즉시 고객의 계정에 VAT ID를 추가합니다. [VAT ID 확인은 Stripe에서도 수행됩니다](https://stripe.com/docs/invoicing/customer/tax-ids#validation). 그러나 이것은 비동기 프로세스입니다. `customer.tax_id.updated` 웹훅 이벤트를 구독하고 [VAT ID의 `verification` 매개변수](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification)를 검사하여 확인 업데이트에 대한 알림을 받을 수 있습니다. 웹훅 처리에 대한 자세한 내용은 [웹훅 핸들러 정의에 관한 문서](#handling-stripe-webhooks)를 참조하세요.

`deleteTaxId` 메서드를 사용하여 세금 ID를 삭제할 수 있습니다:

```php
$user->deleteTaxId('txi_belgium');
```

<a name="syncing-customer-data-with-stripe"></a>
### Stripe와 고객 데이터 동기화

일반적으로 애플리케이션의 사용자가 Stripe에도 저장되는 이름, 이메일 주소 또는 기타 정보를 업데이트하면 Stripe에 업데이트를 알려야 합니다. 이렇게 하면 Stripe의 정보 사본이 애플리케이션과 동기화됩니다.

이를 자동화하려면 모델의 `updated` 이벤트에 반응하는 청구 가능 모델에 이벤트 리스너를 정의할 수 있습니다. 그런 다음 이벤트 리스너 내에서 모델에 대해 `syncStripeCustomerDetails` 메서드를 호출할 수 있습니다:

```php
use App\Models\User;
use function Illuminate\Events\queueable;

/**
 * 모델의 "booted" 메서드.
 */
protected static function booted(): void
{
    static::updated(queueable(function (User $customer) {
        if ($customer->hasStripeId()) {
            $customer->syncStripeCustomerDetails();
        }
    }));
}
```

이제 고객 모델이 업데이트될 때마다 해당 정보가 Stripe와 동기화됩니다. 편의를 위해 Cashier는 고객의 초기 생성 시 고객의 정보를 Stripe와 자동으로 동기화합니다.

Cashier에서 제공하는 다양한 메서드를 재정의하여 고객 정보를 Stripe에 동기화하는 데 사용되는 컬럼을 사용자 정의할 수 있습니다. 예를 들어, `stripeName` 메서드를 재정의하여 Cashier가 Stripe에 고객 정보를 동기화할 때 고객의 "이름"으로 간주되어야 하는 속성을 사용자 정의할 수 있습니다:

```php
/**
 * Stripe에 동기화해야 하는 고객 이름을 가져옵니다.
 */
public function stripeName(): string|null
{
    return $this->company_name;
}
```

마찬가지로 `stripeEmail`, `stripePhone` (최대 20자), `stripeAddress`, `stripePreferredLocales` 메서드를 재정의할 수 있습니다. 이러한 메서드는 [Stripe 고객 객체를 업데이트](https://stripe.com/docs/api/customers/update)할 때 해당 고객 매개변수에 정보를 동기화합니다. 고객 정보 동기화 프로세스를 완전히 제어하려면 `syncStripeCustomerDetails` 메서드를 재정의할 수 있습니다.

<a name="billing-portal"></a>
### 빌링 포탈(Billing Portal)

Stripe은 고객이 구독, 결제 수단을 관리하고 결제 내역을 볼 수 있도록 [빌링 포탈을 설정하는 쉬운 방법](https://stripe.com/docs/billing/subscriptions/customer-portal)을 제공합니다. 컨트롤러나 라우트에서 청구 가능 모델에 대해 `redirectToBillingPortal` 메서드를 호출하여 사용자를 빌링 포탈로 리다이렉트할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal();
});
```

기본적으로 사용자가 구독 관리를 완료하면 Stripe 빌링 포탈 내의 링크를 통해 애플리케이션의 `home` 라우트로 돌아갈 수 있습니다. `redirectToBillingPortal` 메서드에 URL을 인수로 전달하여 사용자가 돌아가야 할 사용자 정의 URL을 제공할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('billing'));
});
```

HTTP 리다이렉트 응답을 생성하지 않고 빌링 포탈의 URL을 생성하려면 `billingPortalUrl` 메서드를 호출하면 됩니다:

```php
$url = $request->user()->billingPortalUrl(route('billing'));
```

<a name="payment-methods"></a>
## 결제 수단(Payment Methods)

<a name="storing-payment-methods"></a>
### 결제 수단 저장

Stripe을 사용하여 구독을 생성하거나 "일회성" 결제를 수행하려면 결제 수단을 저장하고 Stripe에서 해당 식별자를 검색해야 합니다. 이를 수행하는 방법은 결제 수단을 구독에 사용할 것인지 단일 결제에 사용할 것인지에 따라 다르므로 아래에서 두 가지 경우를 모두 살펴보겠습니다.

<a name="payment-methods-for-subscriptions"></a>
#### 구독용 결제 수단

구독에서 나중에 사용하기 위해 고객의 신용카드 정보를 저장할 때는 고객의 결제 수단 세부 정보를 안전하게 수집하기 위해 Stripe "Setup Intents" API를 사용해야 합니다. "Setup Intent"는 고객의 결제 수단으로 청구하려는 의도를 Stripe에 알립니다. Cashier의 `Billable` 트레이트에는 새로운 Setup Intent를 쉽게 생성할 수 있는 `createSetupIntent` 메서드가 포함되어 있습니다. 고객의 결제 수단 세부 정보를 수집하는 폼을 렌더링할 라우트나 컨트롤러에서 이 메서드를 호출해야 합니다:

```php
return view('update-payment-method', [
    'intent' => $user->createSetupIntent()
]);
```

Setup Intent를 생성하고 뷰에 전달한 후에는 결제 수단을 수집하는 엘리먼트에 시크릿을 연결해야 합니다. 예를 들어, 다음과 같은 "결제 수단 업데이트" 폼을 고려해 보세요:

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements 자리 표시자 -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    Update Payment Method
</button>
```

그 다음, Stripe.js 라이브러리를 사용하여 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 연결하고 고객의 결제 세부 정보를 안전하게 수집할 수 있습니다:

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

그 다음, [Stripe의 `confirmCardSetup` 메서드](https://stripe.com/docs/js/setup_intents/confirm_card_setup)를 사용하여 카드를 확인하고 Stripe에서 안전한 "결제 수단 식별자"를 검색할 수 있습니다:

```js
const cardHolderName = document.getElementById('card-holder-name');
const cardButton = document.getElementById('card-button');
const clientSecret = cardButton.dataset.secret;

cardButton.addEventListener('click', async (e) => {
    const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: { name: cardHolderName.value }
            }
        }
    );

    if (error) {
        // 사용자에게 "error.message"를 표시...
    } else {
        // 카드가 성공적으로 확인되었습니다...
    }
});
```

Stripe에서 카드가 확인된 후 결과 `setupIntent.payment_method` 식별자를 Laravel 애플리케이션에 전달하여 고객에게 연결할 수 있습니다. 결제 수단은 [새 결제 수단으로 추가](#adding-payment-methods)하거나 [기본 결제 수단을 업데이트](#updating-the-default-payment-method)하는 데 사용할 수 있습니다. 또한 결제 수단 식별자를 즉시 사용하여 [새 구독을 생성](#creating-subscriptions)할 수도 있습니다.

> [!NOTE]
> Setup Intent 및 고객 결제 세부 정보 수집에 대한 자세한 내용은 [Stripe에서 제공하는 이 개요를 검토하세요](https://stripe.com/docs/payments/save-and-reuse#php).

<a name="payment-methods-for-single-charges"></a>
#### 단일 결제용 결제 수단

물론 고객의 결제 수단에 대해 단일 결제를 수행할 때는 결제 수단 식별자를 한 번만 사용하면 됩니다. Stripe의 제한으로 인해 고객의 저장된 기본 결제 수단을 단일 결제에 사용할 수 없습니다. Stripe.js 라이브러리를 사용하여 고객이 결제 수단 세부 정보를 입력할 수 있도록 해야 합니다. 예를 들어 다음 폼을 고려해 보세요:

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements 자리 표시자 -->
<div id="card-element"></div>

<button id="card-button">
    Process Payment
</button>
```

이러한 폼을 정의한 후 Stripe.js 라이브러리를 사용하여 [Stripe Element](https://stripe.com/docs/stripe-js)를 폼에 연결하고 고객의 결제 세부 정보를 안전하게 수집할 수 있습니다:

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

그 다음, [Stripe의 `createPaymentMethod` 메서드](https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method)를 사용하여 카드를 확인하고 Stripe에서 안전한 "결제 수단 식별자"를 검색할 수 있습니다:

```js
const cardHolderName = document.getElementById('card-holder-name');
const cardButton = document.getElementById('card-button');

cardButton.addEventListener('click', async (e) => {
    const { paymentMethod, error } = await stripe.createPaymentMethod(
        'card', cardElement, {
            billing_details: { name: cardHolderName.value }
        }
    );

    if (error) {
        // 사용자에게 "error.message"를 표시...
    } else {
        // 카드가 성공적으로 확인되었습니다...
    }
});
```

카드가 성공적으로 확인되면 `paymentMethod.id`를 Laravel 애플리케이션에 전달하여 [단일 결제](#simple-charge)를 처리할 수 있습니다.

<a name="retrieving-payment-methods"></a>
### 결제 수단 조회

청구 가능 모델 인스턴스의 `paymentMethods` 메서드는 `Laravel\Cashier\PaymentMethod` 인스턴스의 컬렉션을 반환합니다:

```php
$paymentMethods = $user->paymentMethods();
```

기본적으로 이 메서드는 모든 유형의 결제 수단을 반환합니다. 특정 유형의 결제 수단을 조회하려면 메서드에 `type`을 인수로 전달하면 됩니다:

```php
$paymentMethods = $user->paymentMethods('sepa_debit');
```

고객의 기본 결제 수단을 조회하려면 `defaultPaymentMethod` 메서드를 사용할 수 있습니다:

```php
$paymentMethod = $user->defaultPaymentMethod();
```

`findPaymentMethod` 메서드를 사용하여 청구 가능 모델에 연결된 특정 결제 수단을 조회할 수 있습니다:

```php
$paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

<a name="payment-method-presence"></a>
### 결제 수단 존재 여부

청구 가능 모델에 기본 결제 수단이 계정에 연결되어 있는지 확인하려면 `hasDefaultPaymentMethod` 메서드를 호출하세요:

```php
if ($user->hasDefaultPaymentMethod()) {
    // ...
}
```

`hasPaymentMethod` 메서드를 사용하여 청구 가능 모델에 최소 하나 이상의 결제 수단이 계정에 연결되어 있는지 확인할 수 있습니다:

```php
if ($user->hasPaymentMethod()) {
    // ...
}
```

이 메서드는 청구 가능 모델에 결제 수단이 있는지 확인합니다. 모델에 특정 유형의 결제 수단이 있는지 확인하려면 메서드에 `type`을 인수로 전달하면 됩니다:

```php
if ($user->hasPaymentMethod('sepa_debit')) {
    // ...
}
```

<a name="updating-the-default-payment-method"></a>
### 기본 결제 수단 업데이트

`updateDefaultPaymentMethod` 메서드를 사용하여 고객의 기본 결제 수단 정보를 업데이트할 수 있습니다. 이 메서드는 Stripe 결제 수단 식별자를 받아 새 결제 수단을 기본 청구 결제 수단으로 지정합니다:

```php
$user->updateDefaultPaymentMethod($paymentMethod);
```

Stripe에서 고객의 기본 결제 수단 정보와 기본 결제 수단 정보를 동기화하려면 `updateDefaultPaymentMethodFromStripe` 메서드를 사용할 수 있습니다:

```php
$user->updateDefaultPaymentMethodFromStripe();
```

> [!WARNING]
> 고객의 기본 결제 수단은 인보이스 발행 및 새 구독 생성에만 사용할 수 있습니다. Stripe의 제한으로 인해 단일 결제에는 사용할 수 없습니다.

<a name="adding-payment-methods"></a>
### 결제 수단 추가

새 결제 수단을 추가하려면 청구 가능 모델에서 `addPaymentMethod` 메서드를 호출하고 결제 수단 식별자를 전달하면 됩니다:

```php
$user->addPaymentMethod($paymentMethod);
```

> [!NOTE]
> 결제 수단 식별자를 검색하는 방법을 알아보려면 [결제 수단 저장 문서](#storing-payment-methods)를 검토하세요.

<a name="deleting-payment-methods"></a>
### 결제 수단 삭제

결제 수단을 삭제하려면 삭제하려는 `Laravel\Cashier\PaymentMethod` 인스턴스에서 `delete` 메서드를 호출하면 됩니다:

```php
$paymentMethod->delete();
```

`deletePaymentMethod` 메서드는 청구 가능 모델에서 특정 결제 수단을 삭제합니다:

```php
$user->deletePaymentMethod('pm_visa');
```

`deletePaymentMethods` 메서드는 청구 가능 모델의 모든 결제 수단 정보를 삭제합니다:

```php
$user->deletePaymentMethods();
```

기본적으로 이 메서드는 모든 유형의 결제 수단을 삭제합니다. 특정 유형의 결제 수단을 삭제하려면 메서드에 `type`을 인수로 전달하면 됩니다:

```php
$user->deletePaymentMethods('sepa_debit');
```

> [!WARNING]
> 사용자에게 활성 구독이 있는 경우 애플리케이션에서 기본 결제 수단을 삭제하지 못하도록 해야 합니다.

<a name="subscriptions"></a>
## 구독(Subscriptions)

구독은 고객에게 반복 결제를 설정하는 방법을 제공합니다. Cashier가 관리하는 Stripe 구독은 여러 구독 가격, 구독 수량, 평가판 등을 지원합니다.

<a name="creating-subscriptions"></a>
### 구독 생성

구독을 생성하려면 먼저 청구 가능 모델의 인스턴스를 검색합니다. 이는 일반적으로 `App\Models\User`의 인스턴스입니다. 모델 인스턴스를 검색한 후 `newSubscription` 메서드를 사용하여 모델의 구독을 생성할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription(
        'default', 'price_monthly'
    )->create($request->paymentMethodId);

    // ...
});
```

`newSubscription` 메서드에 전달되는 첫 번째 인수는 구독의 내부 유형이어야 합니다. 애플리케이션이 단일 구독만 제공하는 경우 이를 `default` 또는 `primary`라고 부를 수 있습니다. 이 구독 유형은 내부 애플리케이션 사용만을 위한 것이며 사용자에게 표시되지 않습니다. 또한 공백을 포함해서는 안 되며 구독 생성 후에는 변경해서는 안 됩니다. 두 번째 인수는 사용자가 구독하는 특정 가격입니다. 이 값은 Stripe의 가격 식별자와 일치해야 합니다.

`create` 메서드는 [Stripe 결제 수단 식별자](#storing-payment-methods) 또는 Stripe `PaymentMethod` 객체를 받아 구독을 시작하고 청구 가능 모델의 Stripe 고객 ID 및 기타 관련 청구 정보로 데이터베이스를 업데이트합니다.

> [!WARNING]
> 결제 수단 식별자를 `create` 구독 메서드에 직접 전달하면 사용자의 저장된 결제 수단에도 자동으로 추가됩니다.

<a name="collecting-recurring-payments-via-invoice-emails"></a>
#### 인보이스 이메일을 통한 반복 결제 수집

고객의 반복 결제를 자동으로 수집하는 대신 반복 결제가 만료될 때마다 Stripe가 고객에게 인보이스를 이메일로 보내도록 지시할 수 있습니다. 그러면 고객이 인보이스를 받은 후 수동으로 결제할 수 있습니다. 인보이스를 통해 반복 결제를 수집할 때 고객은 미리 결제 수단을 제공할 필요가 없습니다:

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

구독이 취소되기 전에 고객이 인보이스를 결제해야 하는 시간은 `days_until_due` 옵션에 의해 결정됩니다. 기본적으로 이 값은 30일입니다. 그러나 원하는 경우 이 옵션에 특정 값을 제공할 수 있습니다:

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
    'days_until_due' => 30
]);
```

<a name="subscription-quantities"></a>
#### 수량(Quantities)

구독을 생성할 때 가격에 특정 [수량](https://stripe.com/docs/billing/subscriptions/quantities)을 설정하려면 구독을 생성하기 전에 구독 빌더에서 `quantity` 메서드를 호출해야 합니다:

```php
$user->newSubscription('default', 'price_monthly')
    ->quantity(5)
    ->create($paymentMethod);
```

<a name="additional-details"></a>
#### 추가 세부 사항

Stripe에서 지원하는 추가 [고객](https://stripe.com/docs/api/customers/create) 또는 [구독](https://stripe.com/docs/api/subscriptions/create) 옵션을 지정하려면 `create` 메서드의 두 번째 및 세 번째 인수로 전달하면 됩니다:

```php
$user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
    'email' => $email,
], [
    'metadata' => ['note' => 'Some extra information.'],
]);
```

<a name="coupons"></a>
#### 쿠폰(Coupons)

구독을 생성할 때 쿠폰을 적용하려면 `withCoupon` 메서드를 사용하면 됩니다:

```php
$user->newSubscription('default', 'price_monthly')
    ->withCoupon('code')
    ->create($paymentMethod);
```

또는 [Stripe 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 적용하려면 `withPromotionCode` 메서드를 사용하면 됩니다:

```php
$user->newSubscription('default', 'price_monthly')
    ->withPromotionCode('promo_code_id')
    ->create($paymentMethod);
```

주어진 프로모션 코드 ID는 고객 대면 프로모션 코드가 아닌 프로모션 코드에 할당된 Stripe API ID여야 합니다. 주어진 고객 대면 프로모션 코드를 기반으로 프로모션 코드 ID를 찾아야 하는 경우 `findPromotionCode` 메서드를 사용할 수 있습니다:

```php
// 고객 대면 코드로 프로모션 코드 ID 찾기...
$promotionCode = $user->findPromotionCode('SUMMERSALE');

// 고객 대면 코드로 활성 프로모션 코드 ID 찾기...
$promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

위의 예에서 반환된 `$promotionCode` 객체는 `Laravel\Cashier\PromotionCode`의 인스턴스입니다. 이 클래스는 기본 `Stripe\PromotionCode` 객체를 데코레이트합니다. `coupon` 메서드를 호출하여 프로모션 코드와 관련된 쿠폰을 검색할 수 있습니다:

```php
$coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

쿠폰 인스턴스를 사용하면 할인 금액과 쿠폰이 고정 할인인지 백분율 기반 할인인지 확인할 수 있습니다:

```php
if ($coupon->isPercentage()) {
    return $coupon->percentOff().'%'; // 21.5%
} else {
    return $coupon->amountOff(); // $5.99
}
```

고객이나 구독에 현재 적용된 할인을 조회할 수도 있습니다.

```php
$discount = $billable->discount();

$discount = $subscription->discount();
```

반환된 `Laravel\Cashier\Discount` 인스턴스는 기본 `Stripe\Discount` 객체 인스턴스를 데코레이트합니다. `coupon` 메서드를 호출하여 이 할인과 관련된 쿠폰을 조회할 수 있습니다.

```php
$coupon = $subscription->discount()->coupon();
```

고객이나 구독에 새 쿠폰이나 프로모션 코드를 적용하려면 `applyCoupon` 또는 `applyPromotionCode` 메서드를 사용하면 됩니다.

```php
$billable->applyCoupon('coupon_id');
$billable->applyPromotionCode('promotion_code_id');

$subscription->applyCoupon('coupon_id');
$subscription->applyPromotionCode('promotion_code_id');
```

프로모션 코드에 할당된 Stripe API ID를 사용해야 하며, 고객에게 노출되는 프로모션 코드가 아닙니다. 한 번에 하나의 쿠폰이나 프로모션 코드만 고객이나 구독에 적용할 수 있습니다.

이 주제에 대한 자세한 정보는 [쿠폰](https://stripe.com/docs/billing/subscriptions/coupons)과 [프로모션 코드](https://stripe.com/docs/billing/subscriptions/coupons/codes)에 관한 Stripe 문서를 참조하세요.

<a name="adding-subscriptions"></a>
#### 구독 추가

이미 기본 결제 수단이 있는 고객에게 구독을 추가하려면 구독 빌더에서 `add` 메서드를 호출하면 됩니다.

```php
use App\Models\User;

$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->add();
```

<a name="creating-subscriptions-from-the-stripe-dashboard"></a>
#### Stripe 대시보드에서 구독 생성

Stripe 대시보드 자체에서도 구독을 생성할 수 있습니다. 이렇게 하면 Cashier가 새로 추가된 구독을 동기화하고 `default` 타입을 할당합니다. 대시보드에서 생성된 구독에 할당되는 구독 타입을 커스터마이즈하려면 [웹훅 이벤트 핸들러를 정의](#defining-webhook-event-handlers)하세요.

또한 Stripe 대시보드를 통해 한 가지 타입의 구독만 생성할 수 있습니다. 애플리케이션이 다른 타입을 사용하는 여러 구독을 제공하는 경우 Stripe 대시보드를 통해서는 한 가지 타입의 구독만 추가할 수 있습니다.

마지막으로, 애플리케이션에서 제공하는 구독 타입당 하나의 활성 구독만 추가해야 합니다. 고객이 두 개의 `default` 구독을 가지고 있으면 두 구독 모두 애플리케이션 데이터베이스와 동기화되지만 Cashier는 가장 최근에 추가된 구독만 사용합니다.

<a name="checking-subscription-status"></a>
### 구독 상태 확인

고객이 애플리케이션에 구독하면 다양한 편리한 메서드를 사용하여 구독 상태를 쉽게 확인할 수 있습니다. 먼저 `subscribed` 메서드는 고객이 활성 구독을 가지고 있으면 `true`를 반환합니다. 구독이 현재 평가판(Trial) 기간 중이더라도 마찬가지입니다. `subscribed` 메서드는 구독 타입을 첫 번째 인수로 받습니다.

```php
if ($user->subscribed('default')) {
    // ...
}
```

`subscribed` 메서드는 [라우트 미들웨어](/docs/{{version}}/middleware)에도 적합하여, 사용자의 구독 상태에 따라 라우트와 컨트롤러에 대한 접근을 필터링할 수 있습니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSubscribed
{
    /**
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->subscribed('default')) {
            // 이 사용자는 유료 고객이 아닙니다...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

사용자가 아직 평가판 기간 중인지 확인하려면 `onTrial` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 아직 평가판 기간 중임을 알리는 경고를 표시할지 결정하는 데 유용합니다.

```php
if ($user->subscription('default')->onTrial()) {
    // ...
}
```

`subscribedToProduct` 메서드는 주어진 Stripe 제품 식별자를 기반으로 사용자가 특정 제품에 구독되어 있는지 확인하는 데 사용할 수 있습니다. Stripe에서 제품(Product)은 가격(Price)의 모음입니다. 이 예시에서는 사용자의 `default` 구독이 애플리케이션의 "premium" 제품에 활성 구독되어 있는지 확인합니다. 주어진 Stripe 제품 식별자는 Stripe 대시보드에 있는 제품 식별자 중 하나와 일치해야 합니다.

```php
if ($user->subscribedToProduct('prod_premium', 'default')) {
    // ...
}
```

`subscribedToProduct` 메서드에 배열을 전달하여 사용자의 `default` 구독이 애플리케이션의 "basic" 또는 "premium" 제품에 활성 구독되어 있는지 확인할 수 있습니다.

```php
if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
    // ...
}
```

`subscribedToPrice` 메서드는 고객의 구독이 주어진 가격 ID에 해당하는지 확인하는 데 사용할 수 있습니다.

```php
if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
    // ...
}
```

`recurring` 메서드는 사용자가 현재 구독 중이고 더 이상 평가판 기간이 아닌지 확인하는 데 사용할 수 있습니다.

```php
if ($user->subscription('default')->recurring()) {
    // ...
}
```

> [!WARNING]
> 사용자가 동일한 타입의 구독을 두 개 가지고 있으면 `subscription` 메서드는 항상 가장 최근의 구독을 반환합니다. 예를 들어 사용자가 `default` 타입의 구독 레코드를 두 개 가지고 있을 수 있습니다. 그러나 하나는 오래되고 만료된 구독이고, 다른 하나는 현재 활성 구독일 수 있습니다. 가장 최근의 구독이 항상 반환되고 오래된 구독은 기록 검토를 위해 데이터베이스에 유지됩니다.

<a name="cancelled-subscription-status"></a>
#### 취소된 구독 상태

사용자가 이전에 활성 구독자였지만 구독을 취소했는지 확인하려면 `canceled` 메서드를 사용할 수 있습니다.

```php
if ($user->subscription('default')->canceled()) {
    // ...
}
```

사용자가 구독을 취소했지만 구독이 완전히 만료될 때까지 "유예 기간(Grace Period)"에 있는지도 확인할 수 있습니다. 예를 들어 사용자가 원래 3월 10일에 만료 예정이었던 구독을 3월 5일에 취소한 경우, 사용자는 3월 10일까지 "유예 기간"에 있습니다. 이 기간 동안 `subscribed` 메서드는 여전히 `true`를 반환합니다.

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

사용자가 구독을 취소했고 더 이상 "유예 기간"에 있지 않은지 확인하려면 `ended` 메서드를 사용할 수 있습니다.

```php
if ($user->subscription('default')->ended()) {
    // ...
}
```

<a name="incomplete-and-past-due-status"></a>
#### 미완료(Incomplete) 및 연체(Past Due) 상태

구독 생성 후 보조 결제 조치가 필요한 경우 구독은 `incomplete`로 표시됩니다. 구독 상태는 Cashier의 `subscriptions` 데이터베이스 테이블의 `stripe_status` 컬럼에 저장됩니다.

마찬가지로 가격 변경 시 보조 결제 조치가 필요한 경우 구독은 `past_due`로 표시됩니다. 구독이 이러한 상태 중 하나에 있을 때 고객이 결제를 확인할 때까지 구독이 활성화되지 않습니다. 구독에 미완료 결제가 있는지 확인하려면 청구 가능 모델(Billable Model)이나 구독 인스턴스에서 `hasIncompletePayment` 메서드를 사용하면 됩니다.

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

구독에 미완료 결제가 있는 경우 `latestPayment` 식별자를 전달하여 사용자를 Cashier의 결제 확인 페이지로 안내해야 합니다. 구독 인스턴스에서 사용 가능한 `latestPayment` 메서드를 사용하여 이 식별자를 조회할 수 있습니다.

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    결제를 확인해 주세요.
</a>
```

구독이 `past_due` 또는 `incomplete` 상태일 때도 여전히 활성으로 간주되도록 하려면 Cashier에서 제공하는 `keepPastDueSubscriptionsActive` 및 `keepIncompleteSubscriptionsActive` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드들은 `App\Providers\AppServiceProvider`의 `register` 메서드에서 호출해야 합니다.

```php
use Laravel\Cashier\Cashier;

/**
 * 애플리케이션 서비스를 등록합니다.
 */
public function register(): void
{
    Cashier::keepPastDueSubscriptionsActive();
    Cashier::keepIncompleteSubscriptionsActive();
}
```

> [!WARNING]
> 구독이 `incomplete` 상태일 때는 결제가 확인될 때까지 변경할 수 없습니다. 따라서 구독이 `incomplete` 상태일 때 `swap` 및 `updateQuantity` 메서드는 예외를 발생시킵니다.

<a name="subscription-scopes"></a>
#### 구독 스코프(Subscription Scopes)

대부분의 구독 상태는 쿼리 스코프로도 사용할 수 있어 데이터베이스에서 특정 상태의 구독을 쉽게 조회할 수 있습니다.

```php
// 모든 활성 구독 가져오기...
$subscriptions = Subscription::query()->active()->get();

// 사용자의 모든 취소된 구독 가져오기...
$subscriptions = $user->subscriptions()->canceled()->get();
```

사용 가능한 스코프의 전체 목록은 다음과 같습니다.

```php
Subscription::query()->active();
Subscription::query()->canceled();
Subscription::query()->ended();
Subscription::query()->incomplete();
Subscription::query()->notCanceled();
Subscription::query()->notOnGracePeriod();
Subscription::query()->notOnTrial();
Subscription::query()->onGracePeriod();
Subscription::query()->onTrial();
Subscription::query()->pastDue();
Subscription::query()->recurring();
```

<a name="changing-prices"></a>
### 가격 변경

고객이 애플리케이션에 구독한 후, 가끔 새로운 구독 가격으로 변경하고 싶어할 수 있습니다. 고객을 새 가격으로 전환하려면 Stripe 가격의 식별자를 `swap` 메서드에 전달하세요. 가격을 변경할 때 이전에 취소된 구독인 경우 사용자가 구독을 다시 활성화하기를 원하는 것으로 간주합니다. 주어진 가격 식별자는 Stripe 대시보드에서 사용 가능한 Stripe 가격 식별자와 일치해야 합니다.

```php
use App\Models\User;

$user = App\Models\User::find(1);

$user->subscription('default')->swap('price_yearly');
```

고객이 평가판 기간 중인 경우 평가판 기간이 유지됩니다. 또한 구독에 "수량"이 있는 경우 해당 수량도 유지됩니다.

가격을 변경하고 고객의 현재 평가판 기간을 취소하려면 `skipTrial` 메서드를 호출할 수 있습니다.

```php
$user->subscription('default')
    ->skipTrial()
    ->swap('price_yearly');
```

가격을 변경하고 다음 결제 주기를 기다리지 않고 고객에게 즉시 청구서를 발행하려면 `swapAndInvoice` 메서드를 사용할 수 있습니다.

```php
$user = User::find(1);

$user->subscription('default')->swapAndInvoice('price_yearly');
```

<a name="prorations"></a>
#### 비례 배분(Proration)

기본적으로 Stripe는 가격 간 전환 시 요금을 비례 배분합니다. `noProrate` 메서드를 사용하여 요금을 비례 배분하지 않고 구독 가격을 업데이트할 수 있습니다.

```php
$user->subscription('default')->noProrate()->swap('price_yearly');
```

구독 비례 배분에 대한 자세한 정보는 [Stripe 문서](https://stripe.com/docs/billing/subscriptions/prorations)를 참조하세요.

> [!WARNING]
> `swapAndInvoice` 메서드 전에 `noProrate` 메서드를 실행해도 비례 배분에는 영향을 미치지 않습니다. 청구서는 항상 발행됩니다.

<a name="subscription-quantity"></a>
### 구독 수량

때때로 구독은 "수량"에 영향을 받습니다. 예를 들어 프로젝트 관리 애플리케이션이 프로젝트당 월 $10를 청구할 수 있습니다. `incrementQuantity` 및 `decrementQuantity` 메서드를 사용하여 구독 수량을 쉽게 증가하거나 감소시킬 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// 구독의 현재 수량에 5를 추가...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// 구독의 현재 수량에서 5를 차감...
$user->subscription('default')->decrementQuantity(5);
```

또는 `updateQuantity` 메서드를 사용하여 특정 수량을 설정할 수 있습니다.

```php
$user->subscription('default')->updateQuantity(10);
```

`noProrate` 메서드를 사용하여 요금을 비례 배분하지 않고 구독 수량을 업데이트할 수 있습니다.

```php
$user->subscription('default')->noProrate()->updateQuantity(10);
```

구독 수량에 대한 자세한 정보는 [Stripe 문서](https://stripe.com/docs/subscriptions/quantities)를 참조하세요.

<a name="quantities-for-subscription-with-multiple-products"></a>
#### 여러 제품이 포함된 구독의 수량

구독이 [여러 제품이 포함된 구독](#subscriptions-with-multiple-products)인 경우 수량을 증가하거나 감소시키려는 가격의 ID를 증가/감소 메서드의 두 번째 인수로 전달해야 합니다.

```php
$user->subscription('default')->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### 여러 제품이 포함된 구독

[여러 제품이 포함된 구독](https://stripe.com/docs/billing/subscriptions/multiple-products)을 사용하면 단일 구독에 여러 결제 제품을 할당할 수 있습니다. 예를 들어 기본 구독 가격이 월 $10이고 라이브 채팅 추가 기능 제품이 추가로 월 $15인 고객 서비스 "헬프데스크" 애플리케이션을 구축한다고 가정해 보세요. 여러 제품이 포함된 구독 정보는 Cashier의 `subscription_items` 데이터베이스 테이블에 저장됩니다.

`newSubscription` 메서드의 두 번째 인수로 가격 배열을 전달하여 주어진 구독에 여러 제품을 지정할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', [
        'price_monthly',
        'price_chat',
    ])->create($request->paymentMethodId);

    // ...
});
```

위 예시에서 고객은 `default` 구독에 두 개의 가격이 연결됩니다. 두 가격 모두 해당 결제 주기에 따라 청구됩니다. 필요한 경우 `quantity` 메서드를 사용하여 각 가격에 특정 수량을 지정할 수 있습니다.

```php
$user = User::find(1);

$user->newSubscription('default', ['price_monthly', 'price_chat'])
    ->quantity(5, 'price_chat')
    ->create($paymentMethod);
```

기존 구독에 다른 가격을 추가하려면 구독의 `addPrice` 메서드를 호출하면 됩니다.

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat');
```

위 예시는 새 가격을 추가하고 고객에게 다음 결제 주기에 청구됩니다. 고객에게 즉시 청구하려면 `addPriceAndInvoice` 메서드를 사용할 수 있습니다.

```php
$user->subscription('default')->addPriceAndInvoice('price_chat');
```

특정 수량으로 가격을 추가하려면 `addPrice` 또는 `addPriceAndInvoice` 메서드의 두 번째 인수로 수량을 전달하면 됩니다.

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat', 5);
```

`removePrice` 메서드를 사용하여 구독에서 가격을 제거할 수 있습니다.

```php
$user->subscription('default')->removePrice('price_chat');
```

> [!WARNING]
> 구독의 마지막 가격은 제거할 수 없습니다. 대신 구독을 취소하면 됩니다.

<a name="swapping-prices"></a>
#### 가격 교체

여러 제품이 포함된 구독에 연결된 가격을 변경할 수도 있습니다. 예를 들어 고객이 `price_chat` 추가 기능 제품이 있는 `price_basic` 구독을 가지고 있고 고객을 `price_basic`에서 `price_pro` 가격으로 업그레이드하려는 경우를 가정해 보세요.

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap(['price_pro', 'price_chat']);
```

위 예시를 실행하면 `price_basic`이 있는 기본 구독 항목이 삭제되고 `price_chat`이 있는 항목은 유지됩니다. 또한 `price_pro`에 대한 새 구독 항목이 생성됩니다.

키/값 쌍의 배열을 `swap` 메서드에 전달하여 구독 항목 옵션을 지정할 수도 있습니다. 예를 들어 구독 가격 수량을 지정해야 할 수 있습니다.

```php
$user = User::find(1);

$user->subscription('default')->swap([
    'price_pro' => ['quantity' => 5],
    'price_chat'
]);
```

구독에서 단일 가격을 교체하려면 구독 항목 자체에서 `swap` 메서드를 사용하면 됩니다. 이 접근 방식은 구독의 다른 가격에 있는 모든 기존 메타데이터를 보존하려는 경우 특히 유용합니다.

```php
$user = User::find(1);

$user->subscription('default')
    ->findItemOrFail('price_basic')
    ->swap('price_pro');
```

<a name="proration"></a>
#### 비례 배분(Proration)

기본적으로 Stripe는 여러 제품이 포함된 구독에서 가격을 추가하거나 제거할 때 요금을 비례 배분합니다. 비례 배분 없이 가격을 조정하려면 가격 작업에 `noProrate` 메서드를 체인해야 합니다.

```php
$user->subscription('default')->noProrate()->removePrice('price_chat');
```

<a name="swapping-quantities"></a>
#### 수량

개별 구독 가격의 수량을 업데이트하려면 가격 ID를 메서드의 추가 인수로 전달하여 [기존 수량 메서드](#subscription-quantity)를 사용하면 됩니다.

```php
$user = User::find(1);

$user->subscription('default')->incrementQuantity(5, 'price_chat');

$user->subscription('default')->decrementQuantity(3, 'price_chat');

$user->subscription('default')->updateQuantity(10, 'price_chat');
```

> [!WARNING]
> 구독에 여러 가격이 있는 경우 `Subscription` 모델의 `stripe_price` 및 `quantity` 속성은 `null`이 됩니다. 개별 가격 속성에 접근하려면 `Subscription` 모델에서 사용 가능한 `items` 관계를 사용해야 합니다.

<a name="subscription-items"></a>
#### 구독 항목(Subscription Items)

구독에 여러 가격이 있는 경우 데이터베이스의 `subscription_items` 테이블에 여러 구독 "항목"이 저장됩니다. 구독의 `items` 관계를 통해 이에 접근할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

$subscriptionItem = $user->subscription('default')->items->first();

// 특정 항목의 Stripe 가격 및 수량 조회...
$stripePrice = $subscriptionItem->stripe_price;
$quantity = $subscriptionItem->quantity;
```

`findItemOrFail` 메서드를 사용하여 특정 가격을 조회할 수도 있습니다.

```php
$user = User::find(1);

$subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

<a name="multiple-subscriptions"></a>
### 다중 구독

Stripe는 고객이 여러 구독을 동시에 가질 수 있도록 합니다. 예를 들어 수영 구독과 역도 구독을 제공하는 헬스장을 운영하고 있고 각 구독의 가격이 다를 수 있습니다. 물론 고객은 둘 중 하나 또는 둘 다에 구독할 수 있어야 합니다.

애플리케이션에서 구독을 생성할 때 `newSubscription` 메서드에 구독 타입을 제공할 수 있습니다. 타입은 사용자가 시작하는 구독의 유형을 나타내는 어떤 문자열이든 될 수 있습니다.

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $request->user()->newSubscription('swimming')
        ->price('price_swimming_monthly')
        ->create($request->paymentMethodId);

    // ...
});
```

이 예시에서는 고객에 대한 월간 수영 구독을 시작했습니다. 그러나 나중에 연간 구독으로 전환하고 싶어할 수 있습니다. 고객의 구독을 조정할 때 `swimming` 구독의 가격을 간단히 교체할 수 있습니다.

```php
$user->subscription('swimming')->swap('price_swimming_yearly');
```

물론 구독을 완전히 취소할 수도 있습니다:

```php
$user->subscription('swimming')->cancel();
```

<a name="usage-based-billing"></a>
### 사용량 기반 청구(Usage Based Billing)

[사용량 기반 청구](https://stripe.com/docs/billing/subscriptions/metered-billing)를 사용하면 청구 주기 동안 고객의 제품 사용량에 따라 요금을 부과할 수 있습니다. 예를 들어, 고객이 월별로 보내는 문자 메시지나 이메일 수에 따라 요금을 부과할 수 있습니다.

사용량 기반 청구를 시작하려면 먼저 Stripe 대시보드에서 [사용량 기반 청구 모델](https://docs.stripe.com/billing/subscriptions/usage-based/implementation-guide)과 [미터(meter)](https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage#configure-meter)를 사용하여 새 제품을 생성해야 합니다. 미터를 생성한 후, 사용량을 보고하고 조회하는 데 필요한 관련 이벤트 이름과 미터 ID를 저장하세요. 그런 다음 `meteredPrice` 메서드를 사용하여 고객 구독에 미터링된 가격 ID를 추가합니다:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default')
        ->meteredPrice('price_metered')
        ->create($request->paymentMethodId);

    // ...
});
```

[Stripe Checkout](#checkout)을 통해 미터링된 구독을 시작할 수도 있습니다:

```php
$checkout = Auth::user()
    ->newSubscription('default', [])
    ->meteredPrice('price_metered')
    ->checkout();

return view('your-checkout-view', [
    'checkout' => $checkout,
]);
```

<a name="reporting-usage"></a>
#### 사용량 보고

고객이 애플리케이션을 사용할 때 정확한 청구를 위해 사용량을 Stripe에 보고해야 합니다. 미터링된 이벤트의 사용량을 보고하려면 `Billable` 모델의 `reportMeterEvent` 메서드를 사용할 수 있습니다:

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent');
```

기본적으로 "사용량 수량" 1이 청구 기간에 추가됩니다. 또는 청구 기간 동안 고객의 사용량에 추가할 특정 "사용량" 수량을 전달할 수 있습니다:

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent', quantity: 15);
```

미터에 대한 고객의 이벤트 요약을 조회하려면 `Billable` 인스턴스의 `meterEventSummaries` 메서드를 사용할 수 있습니다:

```php
$user = User::find(1);

$meterUsage = $user->meterEventSummaries($meterId);

$meterUsage->first()->aggregated_value // 10
```

미터 이벤트 요약에 대한 자세한 내용은 Stripe의 [Meter Event Summary 객체 문서](https://docs.stripe.com/api/billing/meter-event_summary/object)를 참조하세요.

[모든 미터를 나열](https://docs.stripe.com/api/billing/meter/list)하려면 `Billable` 인스턴스의 `meters` 메서드를 사용할 수 있습니다:

```php
$user = User::find(1);

$user->meters();
```

<a name="subscription-taxes"></a>
### 구독 세금(Subscription Taxes)

> [!WARNING]
> 세율을 수동으로 계산하는 대신 [Stripe Tax를 사용하여 자동으로 세금을 계산](#tax-configuration)할 수 있습니다.

사용자가 구독에 대해 지불하는 세율을 지정하려면 billable 모델에 `taxRates` 메서드를 구현하고 Stripe 세율 ID가 포함된 배열을 반환해야 합니다. [Stripe 대시보드](https://dashboard.stripe.com/test/tax-rates)에서 이러한 세율을 정의할 수 있습니다:

```php
/**
 * 고객의 구독에 적용되어야 하는 세율.
 *
 * @return array<int, string>
 */
public function taxRates(): array
{
    return ['txr_id'];
}
```

`taxRates` 메서드를 사용하면 고객별로 세율을 적용할 수 있어 여러 국가와 세율에 걸쳐 있는 사용자 기반에 유용할 수 있습니다.

여러 제품이 포함된 구독을 제공하는 경우, billable 모델에 `priceTaxRates` 메서드를 구현하여 각 가격에 대해 다른 세율을 정의할 수 있습니다:

```php
/**
 * 고객의 구독에 적용되어야 하는 세율.
 *
 * @return array<string, array<int, string>>
 */
public function priceTaxRates(): array
{
    return [
        'price_monthly' => ['txr_id'],
    ];
}
```

> [!WARNING]
> `taxRates` 메서드는 구독 청구에만 적용됩니다. Cashier를 사용하여 "일회성" 청구를 하는 경우 해당 시점에 세율을 수동으로 지정해야 합니다.

<a name="syncing-tax-rates"></a>
#### 세율 동기화

`taxRates` 메서드가 반환하는 하드코딩된 세율 ID를 변경하면 사용자의 기존 구독에 대한 세금 설정은 동일하게 유지됩니다. 기존 구독의 세금 값을 새로운 `taxRates` 값으로 업데이트하려면 사용자의 구독 인스턴스에서 `syncTaxRates` 메서드를 호출해야 합니다:

```php
$user->subscription('default')->syncTaxRates();
```

이것은 여러 제품이 포함된 구독의 항목 세율도 동기화합니다. 애플리케이션이 여러 제품이 포함된 구독을 제공하는 경우, billable 모델이 [위에서 설명한](#subscription-taxes) `priceTaxRates` 메서드를 구현하도록 해야 합니다.

<a name="tax-exemption"></a>
#### 세금 면제

Cashier는 고객이 세금 면제 대상인지 확인하기 위한 `isNotTaxExempt`, `isTaxExempt`, `reverseChargeApplies` 메서드도 제공합니다. 이러한 메서드는 Stripe API를 호출하여 고객의 세금 면제 상태를 확인합니다:

```php
use App\Models\User;

$user = User::find(1);

$user->isTaxExempt();
$user->isNotTaxExempt();
$user->reverseChargeApplies();
```

> [!WARNING]
> 이러한 메서드는 모든 `Laravel\Cashier\Invoice` 객체에서도 사용할 수 있습니다. 그러나 `Invoice` 객체에서 호출되면 인보이스가 생성된 시점의 면제 상태를 확인합니다.

<a name="subscription-anchor-date"></a>
### 구독 기준일(Subscription Anchor Date)

기본적으로 청구 주기 기준일은 구독이 생성된 날짜이거나, 체험 기간이 사용된 경우 체험이 종료되는 날짜입니다. 청구 기준일을 수정하려면 `anchorBillingCycleOn` 메서드를 사용할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $anchor = Carbon::parse('first day of next month');

    $request->user()->newSubscription('default', 'price_monthly')
        ->anchorBillingCycleOn($anchor->startOfDay())
        ->create($request->paymentMethodId);

    // ...
});
```

구독 청구 주기 관리에 대한 자세한 내용은 [Stripe 청구 주기 문서](https://stripe.com/docs/billing/subscriptions/billing-cycle)를 참조하세요.

<a name="cancelling-subscriptions"></a>
### 구독 취소

구독을 취소하려면 사용자의 구독에서 `cancel` 메서드를 호출하세요:

```php
$user->subscription('default')->cancel();
```

구독이 취소되면 Cashier는 자동으로 `subscriptions` 데이터베이스 테이블의 `ends_at` 컬럼을 설정합니다. 이 컬럼은 `subscribed` 메서드가 언제 `false`를 반환해야 하는지 알기 위해 사용됩니다.

예를 들어, 고객이 3월 1일에 구독을 취소했지만 구독이 3월 5일까지 종료되도록 예정되어 있다면, `subscribed` 메서드는 3월 5일까지 계속 `true`를 반환합니다. 이는 사용자가 일반적으로 청구 주기가 끝날 때까지 애플리케이션을 계속 사용할 수 있기 때문입니다.

사용자가 구독을 취소했지만 아직 "유예 기간(grace period)" 중인지 확인하려면 `onGracePeriod` 메서드를 사용할 수 있습니다:

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

구독을 즉시 취소하려면 사용자의 구독에서 `cancelNow` 메서드를 호출하세요:

```php
$user->subscription('default')->cancelNow();
```

구독을 즉시 취소하고 남은 미청구 미터링 사용량이나 새로운/보류 중인 비례 배분 인보이스 항목에 대한 인보이스를 발행하려면 사용자의 구독에서 `cancelNowAndInvoice` 메서드를 호출하세요:

```php
$user->subscription('default')->cancelNowAndInvoice();
```

특정 시점에 구독을 취소하도록 선택할 수도 있습니다:

```php
$user->subscription('default')->cancelAt(
    now()->plus(days: 10)
);
```

마지막으로, 연결된 사용자 모델을 삭제하기 전에 항상 사용자 구독을 취소해야 합니다:

```php
$user->subscription('default')->cancelNow();

$user->delete();
```

<a name="resuming-subscriptions"></a>
### 구독 재개

고객이 구독을 취소했고 이를 재개하려면 구독에서 `resume` 메서드를 호출할 수 있습니다. 고객이 구독을 재개하려면 아직 "유예 기간" 내에 있어야 합니다:

```php
$user->subscription('default')->resume();
```

고객이 구독을 취소한 후 구독이 완전히 만료되기 전에 해당 구독을 재개하면 고객에게 즉시 청구되지 않습니다. 대신 구독이 다시 활성화되고 원래 청구 주기에 청구됩니다.

<a name="subscription-trials"></a>
## 구독 체험(Subscription Trials)

<a name="with-payment-method-up-front"></a>
### 결제 수단을 먼저 수집하는 경우

결제 수단 정보를 먼저 수집하면서 고객에게 체험 기간을 제공하려면 구독을 생성할 때 `trialDays` 메서드를 사용해야 합니다:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', 'price_monthly')
        ->trialDays(10)
        ->create($request->paymentMethodId);

    // ...
});
```

이 메서드는 데이터베이스 내 구독 레코드에 체험 기간 종료 날짜를 설정하고 Stripe에 이 날짜 이후까지 고객에게 청구를 시작하지 않도록 지시합니다. `trialDays` 메서드를 사용하면 Cashier는 Stripe에서 가격에 대해 구성된 기본 체험 기간을 덮어씁니다.

> [!WARNING]
> 체험 종료 날짜 전에 고객의 구독이 취소되지 않으면 체험이 만료되는 즉시 요금이 청구되므로 사용자에게 체험 종료 날짜를 알려야 합니다.

`trialUntil` 메서드를 사용하면 체험 기간이 언제 종료되어야 하는지 지정하는 `DateTime` 인스턴스를 제공할 수 있습니다:

```php
use Illuminate\Support\Carbon;

$user->newSubscription('default', 'price_monthly')
    ->trialUntil(Carbon::now()->plus(days: 10))
    ->create($paymentMethod);
```

사용자 인스턴스의 `onTrial` 메서드나 구독 인스턴스의 `onTrial` 메서드를 사용하여 사용자가 체험 기간 내에 있는지 확인할 수 있습니다. 아래 두 예제는 동일합니다:

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->subscription('default')->onTrial()) {
    // ...
}
```

`endTrial` 메서드를 사용하여 구독 체험을 즉시 종료할 수 있습니다:

```php
$user->subscription('default')->endTrial();
```

기존 체험이 만료되었는지 확인하려면 `hasExpiredTrial` 메서드를 사용할 수 있습니다:

```php
if ($user->hasExpiredTrial('default')) {
    // ...
}

if ($user->subscription('default')->hasExpiredTrial()) {
    // ...
}
```

<a name="defining-trial-days-in-stripe-cashier"></a>
#### Stripe / Cashier에서 체험 기간 정의

Stripe 대시보드에서 가격이 받을 체험 기간 일수를 정의하거나 항상 Cashier를 사용하여 명시적으로 전달할 수 있습니다. Stripe에서 가격의 체험 기간 일수를 정의하기로 선택한 경우, 과거에 구독을 한 적이 있는 고객을 포함한 새 구독은 `skipTrial()` 메서드를 명시적으로 호출하지 않는 한 항상 체험 기간을 받게 된다는 점에 유의해야 합니다.

<a name="without-payment-method-up-front"></a>
### 결제 수단을 먼저 수집하지 않는 경우

사용자의 결제 수단 정보를 먼저 수집하지 않고 체험 기간을 제공하려면 사용자 레코드의 `trial_ends_at` 컬럼을 원하는 체험 종료 날짜로 설정할 수 있습니다. 이는 일반적으로 사용자 등록 중에 수행됩니다:

```php
use App\Models\User;

$user = User::create([
    // ...
    'trial_ends_at' => now()->plus(days: 10),
]);
```

> [!WARNING]
> billable 모델의 클래스 정의 내에서 `trial_ends_at` 속성에 대한 [날짜 캐스트](/docs/{{version}}/eloquent-mutators#date-casting)를 추가해야 합니다.

Cashier는 기존 구독에 연결되지 않은 이러한 유형의 체험을 "일반 체험(generic trial)"이라고 합니다. billable 모델 인스턴스의 `onTrial` 메서드는 현재 날짜가 `trial_ends_at` 값을 지나지 않은 경우 `true`를 반환합니다:

```php
if ($user->onTrial()) {
    // 사용자가 체험 기간 내에 있습니다...
}
```

사용자에 대한 실제 구독을 생성할 준비가 되면 평소처럼 `newSubscription` 메서드를 사용할 수 있습니다:

```php
$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

사용자의 체험 종료 날짜를 검색하려면 `trialEndsAt` 메서드를 사용할 수 있습니다. 이 메서드는 사용자가 체험 중이면 Carbon 날짜 인스턴스를 반환하고, 그렇지 않으면 `null`을 반환합니다. 기본이 아닌 특정 구독의 체험 종료 날짜를 가져오려면 선택적 구독 유형 매개변수를 전달할 수도 있습니다:

```php
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

사용자가 "일반" 체험 기간 내에 있고 아직 실제 구독을 생성하지 않았는지 구체적으로 알고 싶다면 `onGenericTrial` 메서드를 사용할 수 있습니다:

```php
if ($user->onGenericTrial()) {
    // 사용자가 "일반" 체험 기간 내에 있습니다...
}
```

<a name="extending-trials"></a>
### 체험 연장

`extendTrial` 메서드를 사용하면 구독이 생성된 후 구독의 체험 기간을 연장할 수 있습니다. 체험이 이미 만료되었고 고객이 이미 구독에 대해 청구를 받고 있더라도 연장된 체험을 제공할 수 있습니다. 체험 기간 내에 소비된 시간은 고객의 다음 인보이스에서 차감됩니다:

```php
use App\Models\User;

$subscription = User::find(1)->subscription('default');

// 지금부터 7일 후에 체험 종료...
$subscription->extendTrial(
    now()->plus(days: 7)
);

// 체험에 5일 추가...
$subscription->extendTrial(
    $subscription->trial_ends_at->plus(days: 5)
);
```

<a name="handling-stripe-webhooks"></a>
## Stripe 웹훅 처리

> [!NOTE]
> 로컬 개발 중에 웹훅을 테스트하는 데 도움이 되도록 [Stripe CLI](https://stripe.com/docs/stripe-cli)를 사용할 수 있습니다.

Stripe는 웹훅을 통해 애플리케이션에 다양한 이벤트를 알릴 수 있습니다. 기본적으로 Cashier의 웹훅 컨트롤러를 가리키는 라우트가 Cashier 서비스 프로바이더에 의해 자동으로 등록됩니다. 이 컨트롤러는 들어오는 모든 웹훅 요청을 처리합니다.

기본적으로 Cashier 웹훅 컨트롤러는 실패한 청구가 너무 많은 구독 취소(Stripe 설정에서 정의됨), 고객 업데이트, 고객 삭제, 구독 업데이트 및 결제 수단 변경을 자동으로 처리합니다. 그러나 곧 알게 되겠지만, 원하는 모든 Stripe 웹훅 이벤트를 처리하도록 이 컨트롤러를 확장할 수 있습니다.

애플리케이션이 Stripe 웹훅을 처리할 수 있도록 하려면 Stripe 제어판에서 웹훅 URL을 구성해야 합니다. 기본적으로 Cashier의 웹훅 컨트롤러는 `/stripe/webhook` URL 경로에 응답합니다. Stripe 제어판에서 활성화해야 하는 모든 웹훅의 전체 목록은 다음과 같습니다:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `payment_method.automatically_updated`
- `invoice.payment_action_required`
- `invoice.payment_succeeded`

편의를 위해 Cashier에는 `cashier:webhook` Artisan 명령어가 포함되어 있습니다. 이 명령어는 Cashier에 필요한 모든 이벤트를 수신하는 웹훅을 Stripe에 생성합니다:

```shell
php artisan cashier:webhook
```

기본적으로 생성된 웹훅은 `APP_URL` 환경 변수로 정의된 URL과 Cashier에 포함된 `cashier.webhook` 라우트를 가리킵니다. 다른 URL을 사용하려면 명령어를 호출할 때 `--url` 옵션을 제공할 수 있습니다:

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

생성된 웹훅은 Cashier 버전과 호환되는 Stripe API 버전을 사용합니다. 다른 Stripe 버전을 사용하려면 `--api-version` 옵션을 제공할 수 있습니다:

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

생성 후 웹훅은 즉시 활성화됩니다. 웹훅을 생성하되 준비가 될 때까지 비활성화 상태로 두려면 명령어를 호출할 때 `--disabled` 옵션을 제공할 수 있습니다:

```shell
php artisan cashier:webhook --disabled
```

> [!WARNING]
> Cashier에 포함된 [웹훅 서명 확인](#verifying-webhook-signatures) 미들웨어를 사용하여 들어오는 Stripe 웹훅 요청을 보호해야 합니다.

<a name="webhooks-csrf-protection"></a>
#### 웹훅과 CSRF 보호

Stripe 웹훅은 Laravel의 [CSRF 보호](/docs/{{version}}/csrf)를 우회해야 하므로, Laravel이 들어오는 Stripe 웹훅에 대해 CSRF 토큰의 유효성을 검사하지 않도록 해야 합니다. 이를 위해 애플리케이션의 `bootstrap/app.php` 파일에서 `stripe/*`를 CSRF 보호에서 제외해야 합니다:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->validateCsrfTokens(except: [
        'stripe/*',
    ]);
})
```

<a name="defining-webhook-event-handlers"></a>
### 웹훅 이벤트 핸들러 정의

Cashier는 실패한 청구에 대한 구독 취소 및 기타 일반적인 Stripe 웹훅 이벤트를 자동으로 처리합니다. 그러나 처리하고 싶은 추가 웹훅 이벤트가 있는 경우 Cashier가 발송하는 다음 이벤트를 수신하여 처리할 수 있습니다:

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

두 이벤트 모두 Stripe 웹훅의 전체 페이로드를 포함합니다. 예를 들어, `invoice.payment_succeeded` 웹훅을 처리하려면 이벤트를 처리할 [리스너](/docs/{{version}}/events#defining-listeners)를 등록할 수 있습니다:

```php
<?php

namespace App\Listeners;

use Laravel\Cashier\Events\WebhookReceived;

class StripeEventListener
{
    /**
     * 수신된 Stripe 웹훅을 처리합니다.
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['type'] === 'invoice.payment_succeeded') {
            // 들어오는 이벤트를 처리...
        }
    }
}
```

<a name="verifying-webhook-signatures"></a>
### 웹훅 서명 확인

웹훅을 보호하기 위해 [Stripe의 웹훅 서명](https://stripe.com/docs/webhooks/signatures)을 사용할 수 있습니다. 편의를 위해 Cashier에는 들어오는 Stripe 웹훅 요청이 유효한지 확인하는 미들웨어가 자동으로 포함되어 있습니다.

웹훅 확인을 활성화하려면 애플리케이션의 `.env` 파일에 `STRIPE_WEBHOOK_SECRET` 환경 변수가 설정되어 있는지 확인하세요. 웹훅 `secret`은 Stripe 계정 대시보드에서 검색할 수 있습니다.

<a name="single-charges"></a>
## 단일 청구(Single Charges)

<a name="simple-charge"></a>
### 간단한 청구

고객에게 일회성 청구를 하려면 billable 모델 인스턴스에서 `charge` 메서드를 사용할 수 있습니다. `charge` 메서드의 두 번째 인수로 [결제 수단 식별자](#payment-methods-for-single-charges)를 제공해야 합니다:

```php
use Illuminate\Http\Request;

Route::post('/purchase', function (Request $request) {
    $stripeCharge = $request->user()->charge(
        100, $request->paymentMethodId
    );

    // ...
});
```

`charge` 메서드는 세 번째 인수로 배열을 받아 기본 Stripe 청구 생성에 원하는 옵션을 전달할 수 있습니다. 청구 생성 시 사용할 수 있는 옵션에 대한 자세한 내용은 [Stripe 문서](https://stripe.com/docs/api/charges/create)에서 확인할 수 있습니다:

```php
$user->charge(100, $paymentMethod, [
    'custom_option' => $value,
]);
```

기본 고객이나 사용자 없이도 `charge` 메서드를 사용할 수 있습니다. 이를 위해 애플리케이션의 billable 모델의 새 인스턴스에서 `charge` 메서드를 호출하면 됩니다:

```php
use App\Models\User;
```

$stripeCharge = (new User)->charge(100, $paymentMethod);
```

`charge` 메서드는 결제가 실패하면 예외를 발생시킵니다. 결제가 성공하면 메서드에서 `Laravel\Cashier\Payment` 인스턴스가 반환됩니다:

```php
try {
    $payment = $user->charge(100, $paymentMethod);
} catch (Exception $e) {
    // ...
}
```

> [!WARNING]
> `charge` 메서드는 애플리케이션에서 사용하는 통화의 최소 단위로 결제 금액을 받습니다. 예를 들어, 고객이 미국 달러로 결제하는 경우 금액은 센트 단위로 지정해야 합니다.

<a name="charge-with-invoice"></a>
### 인보이스와 함께 결제하기

때로는 일회성 결제를 하면서 고객에게 PDF 인보이스를 제공해야 할 수 있습니다. `invoicePrice` 메서드를 사용하면 바로 그렇게 할 수 있습니다. 예를 들어, 고객에게 셔츠 5장에 대한 인보이스를 발행해 보겠습니다:

```php
$user->invoicePrice('price_tshirt', 5);
```

인보이스는 사용자의 기본 결제 수단으로 즉시 청구됩니다. `invoicePrice` 메서드는 세 번째 인수로 배열을 받습니다. 이 배열에는 인보이스 항목에 대한 청구 옵션이 포함됩니다. 메서드가 받는 네 번째 인수도 배열이며, 인보이스 자체에 대한 청구 옵션을 포함해야 합니다:

```php
$user->invoicePrice('price_tshirt', 5, [
    'discounts' => [
        ['coupon' => 'SUMMER21SALE']
    ],
], [
    'default_tax_rates' => ['txr_id'],
]);
```

`invoicePrice`와 유사하게, `tabPrice` 메서드를 사용하여 고객의 "탭"에 여러 항목(인보이스당 최대 250개 항목)을 추가한 다음 고객에게 인보이스를 발행하여 여러 항목에 대한 일회성 결제를 생성할 수 있습니다. 예를 들어, 고객에게 셔츠 5장과 머그컵 2개에 대한 인보이스를 발행할 수 있습니다:

```php
$user->tabPrice('price_tshirt', 5);
$user->tabPrice('price_mug', 2);
$user->invoice();
```

또는, `invoiceFor` 메서드를 사용하여 고객의 기본 결제 수단에 "일회성" 결제를 할 수 있습니다:

```php
$user->invoiceFor('One Time Fee', 500);
```

`invoiceFor` 메서드를 사용할 수 있지만, 미리 정의된 가격과 함께 `invoicePrice` 및 `tabPrice` 메서드를 사용하는 것이 권장됩니다. 그렇게 하면 Stripe 대시보드에서 제품별 판매에 대한 더 나은 분석 및 데이터에 접근할 수 있습니다.

> [!WARNING]
> `invoice`, `invoicePrice`, `invoiceFor` 메서드는 실패한 청구 시도를 재시도하는 Stripe 인보이스를 생성합니다. 인보이스가 실패한 결제를 재시도하지 않도록 하려면, 첫 번째 결제 실패 후 Stripe API를 사용하여 해당 인보이스를 닫아야 합니다.

<a name="creating-payment-intents"></a>
### 결제 인텐트(Payment Intents) 생성하기

청구 가능한(billable) 모델 인스턴스에서 `pay` 메서드를 호출하여 새로운 Stripe 결제 인텐트를 생성할 수 있습니다. 이 메서드를 호출하면 `Laravel\Cashier\Payment` 인스턴스로 래핑된 결제 인텐트가 생성됩니다:

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->pay(
        $request->get('amount')
    );

    return $payment->client_secret;
});
```

결제 인텐트를 생성한 후, 클라이언트 시크릿(client secret)을 애플리케이션의 프론트엔드로 반환하여 사용자가 브라우저에서 결제를 완료할 수 있도록 할 수 있습니다. Stripe 결제 인텐트를 사용한 전체 결제 흐름 구축에 대해 자세히 알아보려면 [Stripe 문서](https://stripe.com/docs/payments/accept-a-payment?platform=web)를 참조하세요.

`pay` 메서드를 사용할 때, Stripe 대시보드에서 활성화된 기본 결제 수단이 고객에게 제공됩니다. 또는, 특정 결제 수단만 사용하도록 허용하려면 `payWith` 메서드를 사용할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->payWith(
        $request->get('amount'), ['card', 'bancontact']
    );

    return $payment->client_secret;
});
```

> [!WARNING]
> `pay` 및 `payWith` 메서드는 애플리케이션에서 사용하는 통화의 최소 단위로 결제 금액을 받습니다. 예를 들어, 고객이 미국 달러로 결제하는 경우 금액은 센트 단위로 지정해야 합니다.

<a name="refunding-charges"></a>
### 결제 환불하기

Stripe 결제를 환불해야 하는 경우 `refund` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인수로 Stripe [결제 인텐트 ID](#payment-methods-for-single-charges)를 받습니다:

```php
$payment = $user->charge(100, $paymentMethodId);

$user->refund($payment->id);
```

<a name="invoices"></a>
## 인보이스

<a name="retrieving-invoices"></a>
### 인보이스 조회하기

`invoices` 메서드를 사용하여 청구 가능한 모델의 인보이스 배열을 쉽게 조회할 수 있습니다. `invoices` 메서드는 `Laravel\Cashier\Invoice` 인스턴스의 컬렉션을 반환합니다:

```php
$invoices = $user->invoices();
```

결과에 보류 중인 인보이스를 포함하려면 `invoicesIncludingPending` 메서드를 사용할 수 있습니다:

```php
$invoices = $user->invoicesIncludingPending();
```

`findInvoice` 메서드를 사용하여 ID로 특정 인보이스를 조회할 수 있습니다:

```php
$invoice = $user->findInvoice($invoiceId);
```

<a name="displaying-invoice-information"></a>
#### 인보이스 정보 표시하기

고객의 인보이스를 나열할 때, 인보이스의 메서드를 사용하여 관련 인보이스 정보를 표시할 수 있습니다. 예를 들어, 테이블에 모든 인보이스를 나열하여 사용자가 쉽게 다운로드할 수 있도록 할 수 있습니다:

```blade
<table>
    @foreach ($invoices as $invoice)
        <tr>
            <td>{{ $invoice->date()->toFormattedDateString() }}</td>
            <td>{{ $invoice->total() }}</td>
            <td><a href="/user/invoice/{{ $invoice->id }}">Download</a></td>
        </tr>
    @endforeach
</table>
```

<a name="upcoming-invoices"></a>
### 예정된 인보이스

고객의 예정된 인보이스를 조회하려면 `upcomingInvoice` 메서드를 사용할 수 있습니다:

```php
$invoice = $user->upcomingInvoice();
```

마찬가지로, 고객이 여러 구독을 가지고 있는 경우, 특정 구독의 예정된 인보이스도 조회할 수 있습니다:

```php
$invoice = $user->subscription('default')->upcomingInvoice();
```

<a name="previewing-subscription-invoices"></a>
### 구독 인보이스 미리보기

`previewInvoice` 메서드를 사용하면, 가격 변경 전에 인보이스를 미리 볼 수 있습니다. 이를 통해 특정 가격 변경이 이루어질 때 고객의 인보이스가 어떻게 보일지 확인할 수 있습니다:

```php
$invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

여러 새 가격으로 인보이스를 미리 보려면 `previewInvoice` 메서드에 가격 배열을 전달할 수 있습니다:

```php
$invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

<a name="generating-invoice-pdfs"></a>
### 인보이스 PDF 생성하기

인보이스 PDF를 생성하기 전에, Composer를 사용하여 Cashier의 기본 인보이스 렌더러인 Dompdf 라이브러리를 설치해야 합니다:

```shell
composer require dompdf/dompdf
```

라우트 또는 컨트롤러 내에서 `downloadInvoice` 메서드를 사용하여 지정된 인보이스의 PDF 다운로드를 생성할 수 있습니다. 이 메서드는 인보이스를 다운로드하는 데 필요한 적절한 HTTP 응답을 자동으로 생성합니다:

```php
use Illuminate\Http\Request;

Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
    return $request->user()->downloadInvoice($invoiceId);
});
```

기본적으로 인보이스의 모든 데이터는 Stripe에 저장된 고객 및 인보이스 데이터에서 파생됩니다. 파일명은 `app.name` 설정 값을 기반으로 합니다. 하지만, `downloadInvoice` 메서드의 두 번째 인수로 배열을 제공하여 이 데이터의 일부를 커스터마이징할 수 있습니다. 이 배열을 통해 회사 및 제품 세부 정보 같은 정보를 커스터마이징할 수 있습니다:

```php
return $request->user()->downloadInvoice($invoiceId, [
    'vendor' => 'Your Company',
    'product' => 'Your Product',
    'street' => 'Main Str. 1',
    'location' => '2000 Antwerp, Belgium',
    'phone' => '+32 499 00 00 00',
    'email' => 'info@example.com',
    'url' => 'https://example.com',
    'vendorVat' => 'BE123456789',
]);
```

`downloadInvoice` 메서드는 세 번째 인수를 통해 사용자 지정 파일명도 허용합니다. 이 파일명에는 자동으로 `.pdf`가 접미사로 붙습니다:

```php
return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

<a name="custom-invoice-render"></a>
#### 커스텀 인보이스 렌더러

Cashier는 커스텀 인보이스 렌더러를 사용할 수도 있게 해줍니다. 기본적으로 Cashier는 [dompdf](https://github.com/dompdf/dompdf) PHP 라이브러리를 활용하여 Cashier의 인보이스를 생성하는 `DompdfInvoiceRenderer` 구현을 사용합니다. 하지만, `Laravel\Cashier\Contracts\InvoiceRenderer` 인터페이스를 구현하여 원하는 렌더러를 사용할 수 있습니다. 예를 들어, 서드파티 PDF 렌더링 서비스에 대한 API 호출을 사용하여 인보이스 PDF를 렌더링할 수 있습니다:

```php
use Illuminate\Support\Facades\Http;
use Laravel\Cashier\Contracts\InvoiceRenderer;
use Laravel\Cashier\Invoice;

class ApiInvoiceRenderer implements InvoiceRenderer
{
    /**
     * 주어진 인보이스를 렌더링하고 원시 PDF 바이트를 반환합니다.
     */
    public function render(Invoice $invoice, array $data = [], array $options = []): string
    {
        $html = $invoice->view($data)->render();

        return Http::get('https://example.com/html-to-pdf', ['html' => $html])->get()->body();
    }
}
```

인보이스 렌더러 계약(contract)을 구현한 후, 애플리케이션의 `config/cashier.php` 설정 파일에서 `cashier.invoices.renderer` 설정 값을 업데이트해야 합니다. 이 설정 값은 커스텀 렌더러 구현의 클래스명으로 설정해야 합니다.

<a name="checkout"></a>
## 체크아웃(Checkout)

Cashier Stripe는 [Stripe Checkout](https://stripe.com/payments/checkout)도 지원합니다. Stripe Checkout은 미리 구축된 호스팅 결제 페이지를 제공하여 결제를 받기 위한 커스텀 페이지 구현의 어려움을 해소합니다.

다음 문서에는 Cashier와 함께 Stripe Checkout을 시작하는 방법에 대한 정보가 포함되어 있습니다. Stripe Checkout에 대해 더 자세히 알아보려면 [Checkout에 대한 Stripe 자체 문서](https://stripe.com/docs/payments/checkout)도 참조하는 것이 좋습니다.

<a name="product-checkouts"></a>
### 제품 체크아웃

청구 가능한 모델에서 `checkout` 메서드를 사용하여 Stripe 대시보드에서 생성된 기존 제품에 대한 체크아웃을 수행할 수 있습니다. `checkout` 메서드는 새로운 Stripe Checkout 세션을 시작합니다. 기본적으로 Stripe Price ID를 전달해야 합니다:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout('price_tshirt');
});
```

필요한 경우 제품 수량도 지정할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 15]);
});
```

고객이 이 라우트를 방문하면 Stripe의 Checkout 페이지로 리디렉션됩니다. 기본적으로 사용자가 구매를 성공적으로 완료하거나 취소하면 `home` 라우트 위치로 리디렉션되지만, `success_url` 및 `cancel_url` 옵션을 사용하여 사용자 지정 콜백 URL을 지정할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

`success_url` 체크아웃 옵션을 정의할 때, URL을 호출할 때 체크아웃 세션 ID를 쿼리 문자열 매개변수로 추가하도록 Stripe에 지시할 수 있습니다. 그렇게 하려면 리터럴 문자열 `{CHECKOUT_SESSION_ID}`를 `success_url` 쿼리 문자열에 추가하세요. Stripe가 이 플레이스홀더를 실제 체크아웃 세션 ID로 대체합니다:

```php
use Illuminate\Http\Request;
use Stripe\Checkout\Session;
use Stripe\Customer;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => route('checkout-cancel'),
    ]);
});

Route::get('/checkout-success', function (Request $request) {
    $checkoutSession = $request->user()->stripe()->checkout->sessions->retrieve($request->get('session_id'));

    return view('checkout.success', ['checkoutSession' => $checkoutSession]);
})->name('checkout-success');
```

<a name="checkout-promotion-codes"></a>
#### 프로모션 코드

기본적으로 Stripe Checkout은 [사용자가 사용 가능한 프로모션 코드](https://stripe.com/docs/billing/subscriptions/discounts/codes)를 허용하지 않습니다. 다행히도 Checkout 페이지에서 이를 활성화하는 쉬운 방법이 있습니다. 그렇게 하려면 `allowPromotionCodes` 메서드를 호출하면 됩니다:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()
        ->allowPromotionCodes()
        ->checkout('price_tshirt');
});
```

<a name="single-charge-checkouts"></a>
### 단일 결제 체크아웃

Stripe 대시보드에서 생성되지 않은 임시 제품에 대해서도 간단한 결제를 수행할 수 있습니다. 그렇게 하려면 청구 가능한 모델에서 `checkoutCharge` 메서드를 사용하고 결제 가능한 금액, 제품명, 그리고 선택적으로 수량을 전달하면 됩니다. 고객이 이 라우트를 방문하면 Stripe의 Checkout 페이지로 리디렉션됩니다:

```php
use Illuminate\Http\Request;

Route::get('/charge-checkout', function (Request $request) {
    return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
});
```

> [!WARNING]
> `checkoutCharge` 메서드를 사용할 때, Stripe는 항상 Stripe 대시보드에 새 제품과 가격을 생성합니다. 따라서 Stripe 대시보드에서 미리 제품을 생성하고 대신 `checkout` 메서드를 사용하는 것이 권장됩니다.

<a name="subscription-checkouts"></a>
### 구독 체크아웃

> [!WARNING]
> 구독에 Stripe Checkout을 사용하려면 Stripe 대시보드에서 `customer.subscription.created` 웹훅을 활성화해야 합니다. 이 웹훅은 데이터베이스에 구독 레코드를 생성하고 모든 관련 구독 항목을 저장합니다.

구독을 시작하기 위해 Stripe Checkout을 사용할 수도 있습니다. Cashier의 구독 빌더 메서드로 구독을 정의한 후 `checkout` 메서드를 호출할 수 있습니다. 고객이 이 라우트를 방문하면 Stripe의 Checkout 페이지로 리디렉션됩니다:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout();
});
```

제품 체크아웃과 마찬가지로 성공 및 취소 URL을 커스터마이징할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout([
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

물론 구독 체크아웃에서도 프로모션 코드를 활성화할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->allowPromotionCodes()
        ->checkout();
});
```

> [!WARNING]
> 안타깝게도 Stripe Checkout은 구독을 시작할 때 모든 구독 청구 옵션을 지원하지 않습니다. 구독 빌더에서 `anchorBillingCycleOn` 메서드를 사용하거나, 비례 배분(proration) 동작을 설정하거나, 결제 동작을 설정해도 Stripe Checkout 세션 중에는 아무런 효과가 없습니다. 사용 가능한 매개변수를 확인하려면 [Stripe Checkout Session API 문서](https://stripe.com/docs/api/checkout/sessions/create)를 참조하세요.

<a name="stripe-checkout-trial-periods"></a>
#### Stripe Checkout과 체험 기간

물론 Stripe Checkout을 사용하여 완료될 구독을 빌드할 때 체험 기간을 정의할 수 있습니다:

```php
$checkout = Auth::user()->newSubscription('default', 'price_monthly')
    ->trialDays(3)
    ->checkout();
```

하지만 체험 기간은 최소 48시간 이상이어야 하며, 이는 Stripe Checkout에서 지원하는 최소 체험 시간입니다.

<a name="stripe-checkout-subscriptions-and-webhooks"></a>
#### 구독과 웹훅

Stripe와 Cashier는 웹훅을 통해 구독 상태를 업데이트하므로, 고객이 결제 정보를 입력한 후 애플리케이션으로 돌아왔을 때 구독이 아직 활성화되지 않았을 가능성이 있습니다. 이 시나리오를 처리하기 위해, 결제 또는 구독이 보류 중임을 사용자에게 알리는 메시지를 표시할 수 있습니다.

<a name="collecting-tax-ids"></a>
### 세금 ID 수집하기

Checkout은 고객의 세금 ID 수집도 지원합니다. 체크아웃 세션에서 이를 활성화하려면 세션을 생성할 때 `collectTaxIds` 메서드를 호출하세요:

```php
$checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

이 메서드가 호출되면 고객이 회사로서 구매하는지 여부를 표시할 수 있는 새 체크박스가 고객에게 제공됩니다. 그렇다면 세금 ID 번호를 제공할 기회가 주어집니다.

> [!WARNING]
> 애플리케이션의 서비스 프로바이더에서 이미 [자동 세금 징수](#tax-configuration)를 구성한 경우 이 기능은 자동으로 활성화되므로 `collectTaxIds` 메서드를 호출할 필요가 없습니다.

<a name="guest-checkouts"></a>
### 게스트 체크아웃

`Checkout::guest` 메서드를 사용하면 "계정"이 없는 애플리케이션 게스트에 대한 체크아웃 세션을 시작할 수 있습니다:

```php
use Illuminate\Http\Request;
use Laravel\Cashier\Checkout;

Route::get('/product-checkout', function (Request $request) {
    return Checkout::guest()->create('price_tshirt', [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

기존 사용자에 대한 체크아웃 세션을 생성할 때와 마찬가지로, `Laravel\Cashier\CheckoutBuilder` 인스턴스에서 사용 가능한 추가 메서드를 활용하여 게스트 체크아웃 세션을 커스터마이징할 수 있습니다:

```php
use Illuminate\Http\Request;
use Laravel\Cashier\Checkout;

Route::get('/product-checkout', function (Request $request) {
    return Checkout::guest()
        ->withPromotionCode('promo-code')
        ->create('price_tshirt', [
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

게스트 체크아웃이 완료된 후, Stripe는 `checkout.session.completed` 웹훅 이벤트를 전송할 수 있으므로, 이 이벤트를 실제로 애플리케이션에 보내도록 [Stripe 웹훅을 구성](https://dashboard.stripe.com/webhooks)해야 합니다. Stripe 대시보드에서 웹훅이 활성화되면 [Cashier로 웹훅을 처리](#handling-stripe-webhooks)할 수 있습니다. 웹훅 페이로드에 포함된 객체는 고객의 주문을 이행하기 위해 검사할 수 있는 [체크아웃 객체](https://stripe.com/docs/api/checkout/sessions/object)입니다.

<a name="handling-failed-payments"></a>
## 실패한 결제 처리하기

때때로 구독 또는 단일 결제에 대한 결제가 실패할 수 있습니다. 이 경우 Cashier는 이를 알리는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 발생시킵니다. 이 예외를 잡은 후 진행하는 방법에는 두 가지 옵션이 있습니다.

첫째, Cashier에 포함된 전용 결제 확인 페이지로 고객을 리디렉션할 수 있습니다. 이 페이지에는 Cashier의 서비스 프로바이더를 통해 등록된 연결된 명명된 라우트가 이미 있습니다. 따라서 `IncompletePayment` 예외를 잡아 사용자를 결제 확인 페이지로 리디렉션할 수 있습니다:

```php
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $subscription = $user->newSubscription('default', 'price_monthly')
        ->create($paymentMethod);
} catch (IncompletePayment $exception) {
    return redirect()->route(
        'cashier.payment',
        [$exception->payment->id, 'redirect' => route('home')]
    );
}
```

결제 확인 페이지에서 고객은 신용카드 정보를 다시 입력하고 "3D Secure" 확인과 같이 Stripe에서 요구하는 추가 작업을 수행하라는 메시지가 표시됩니다. 결제를 확인한 후 사용자는 위에서 지정한 `redirect` 매개변수가 제공하는 URL로 리디렉션됩니다. 리디렉션 시 `message`(문자열) 및 `success`(정수) 쿼리 문자열 변수가 URL에 추가됩니다. 결제 페이지는 현재 다음 결제 수단 유형을 지원합니다:

<div class="content-list" markdown="1">

- Credit Cards
- Alipay
- Bancontact
- BECS Direct Debit
- EPS
- Giropay
- iDEAL
- SEPA Direct Debit

</div>

또는, Stripe가 결제 확인을 처리하도록 할 수 있습니다. 이 경우, 결제 확인 페이지로 리디렉션하는 대신 Stripe 대시보드에서 [Stripe의 자동 청구 이메일을 설정](https://dashboard.stripe.com/account/billing/automatic)할 수 있습니다. 하지만, `IncompletePayment` 예외가 잡히면 추가 결제 확인 지침이 포함된 이메일을 받을 것임을 사용자에게 알려야 합니다.

`Billable` 트레이트를 사용하는 모델의 `charge`, `invoiceFor`, `invoice` 메서드에서 결제 예외가 발생할 수 있습니다. 구독과 상호작용할 때, `SubscriptionBuilder`의 `create` 메서드와 `Subscription` 및 `SubscriptionItem` 모델의 `incrementAndInvoice` 및 `swapAndInvoice` 메서드에서 미완료 결제 예외가 발생할 수 있습니다.

기존 구독에 미완료 결제가 있는지 확인하는 것은 청구 가능한 모델 또는 구독 인스턴스에서 `hasIncompletePayment` 메서드를 사용하여 수행할 수 있습니다:

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
```php
if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

예외 인스턴스의 `payment` 속성을 검사하여 미완료 결제의 특정 상태를 파악할 수 있습니다.

```php
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $user->charge(1000, 'pm_card_threeDSecure2Required');
} catch (IncompletePayment $exception) {
    // 결제 인텐트(Payment Intent) 상태 가져오기...
    $exception->payment->status;

    // 특정 조건 확인...
    if ($exception->payment->requiresPaymentMethod()) {
        // ...
    } elseif ($exception->payment->requiresConfirmation()) {
        // ...
    }
}
```

<a name="confirming-payments"></a>
### 결제 확인(Confirming Payments)

일부 결제 수단은 결제를 확인하기 위해 추가 데이터가 필요합니다. 예를 들어, SEPA 결제 수단은 결제 과정에서 추가 "위임(mandate)" 데이터가 필요합니다. `withPaymentConfirmationOptions` 메서드를 사용하여 Cashier에 이 데이터를 제공할 수 있습니다.

```php
$subscription->withPaymentConfirmationOptions([
    'mandate_data' => '...',
])->swap('price_xxx');
```

결제 확인 시 허용되는 모든 옵션을 검토하려면 [Stripe API 문서](https://stripe.com/docs/api/payment_intents/confirm)를 참조하세요.

<a name="strong-customer-authentication"></a>
## 강력한 고객 인증(Strong Customer Authentication)

귀하의 비즈니스 또는 고객 중 하나가 유럽에 기반을 두고 있다면 EU의 강력한 고객 인증(SCA) 규정을 준수해야 합니다. 이 규정은 결제 사기를 방지하기 위해 2019년 9월 유럽 연합에서 시행되었습니다. 다행히 Stripe와 Cashier는 SCA 준수 애플리케이션 구축을 위해 준비되어 있습니다.

> [!WARNING]
> 시작하기 전에 [Stripe의 PSD2 및 SCA 가이드](https://stripe.com/guides/strong-customer-authentication)와 [새로운 SCA API에 대한 문서](https://stripe.com/docs/strong-customer-authentication)를 검토하세요.

<a name="payments-requiring-additional-confirmation"></a>
### 추가 확인이 필요한 결제(Payments Requiring Additional Confirmation)

SCA 규정은 결제를 확인하고 처리하기 위해 종종 추가 검증을 요구합니다. 이런 경우 Cashier는 추가 검증이 필요함을 알리는 `Laravel\Cashier\Exceptions\IncompletePayment` 예외를 발생시킵니다. 이러한 예외를 처리하는 방법에 대한 자세한 정보는 [실패한 결제 처리](#handling-failed-payments) 문서에서 확인할 수 있습니다.

Stripe 또는 Cashier가 제공하는 결제 확인 화면은 특정 은행이나 카드 발급사의 결제 흐름에 맞게 조정될 수 있으며, 추가 카드 확인, 임시 소액 청구, 별도 기기 인증 또는 기타 형태의 검증을 포함할 수 있습니다.

<a name="incomplete-and-past-due-state"></a>
#### 미완료 및 연체 상태(Incomplete and Past Due State)

결제에 추가 확인이 필요한 경우, 구독은 `stripe_status` 데이터베이스 컬럼에 표시된 대로 `incomplete` 또는 `past_due` 상태로 유지됩니다. Cashier는 결제 확인이 완료되고 애플리케이션이 웹훅을 통해 Stripe로부터 완료 알림을 받으면 자동으로 고객의 구독을 활성화합니다.

`incomplete` 및 `past_due` 상태에 대한 자세한 정보는 [이러한 상태에 대한 추가 문서](#incomplete-and-past-due-status)를 참조하세요.

<a name="off-session-payment-notifications"></a>
### 오프세션 결제 알림(Off-Session Payment Notifications)

SCA 규정에 따라 고객은 구독이 활성화된 상태에서도 때때로 결제 정보를 확인해야 하므로, Cashier는 오프세션 결제 확인이 필요할 때 고객에게 알림을 보낼 수 있습니다. 예를 들어, 구독이 갱신될 때 이런 상황이 발생할 수 있습니다. Cashier의 결제 알림은 `CASHIER_PAYMENT_NOTIFICATION` 환경 변수를 알림 클래스로 설정하여 활성화할 수 있습니다. 기본적으로 이 알림은 비활성화되어 있습니다. 물론 Cashier에는 이 목적으로 사용할 수 있는 알림 클래스가 포함되어 있지만, 원하는 경우 자신만의 알림 클래스를 제공할 수 있습니다.

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

오프세션 결제 확인 알림이 전달되도록 하려면 애플리케이션에 [Stripe 웹훅이 구성](#handling-stripe-webhooks)되어 있고 Stripe 대시보드에서 `invoice.payment_action_required` 웹훅이 활성화되어 있는지 확인하세요. 또한 `Billable` 모델은 Laravel의 `Illuminate\Notifications\Notifiable` 트레이트를 사용해야 합니다.

> [!WARNING]
> 고객이 추가 확인이 필요한 결제를 수동으로 진행하는 경우에도 알림이 전송됩니다. 안타깝게도 Stripe는 결제가 수동으로 이루어졌는지 또는 "오프세션"으로 이루어졌는지 알 수 없습니다. 하지만 고객이 이미 결제를 확인한 후 결제 페이지를 방문하면 단순히 "결제 성공" 메시지가 표시됩니다. 고객은 실수로 동일한 결제를 두 번 확인하여 우발적인 이중 청구가 발생하는 것이 방지됩니다.

<a name="stripe-sdk"></a>
## Stripe SDK

Cashier의 많은 객체는 Stripe SDK 객체의 래퍼입니다. Stripe 객체와 직접 상호 작용하려면 `asStripe` 메서드를 사용하여 편리하게 가져올 수 있습니다.

```php
$stripeSubscription = $subscription->asStripeSubscription();

$stripeSubscription->application_fee_percent = 5;

$stripeSubscription->save();
```

`updateStripeSubscription` 메서드를 사용하여 Stripe 구독을 직접 업데이트할 수도 있습니다.

```php
$subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

`Stripe\StripeClient` 클라이언트를 직접 사용하려면 `Cashier` 클래스의 `stripe` 메서드를 호출할 수 있습니다. 예를 들어, 이 메서드를 사용하여 `StripeClient` 인스턴스에 접근하고 Stripe 계정에서 가격 목록을 가져올 수 있습니다.

```php
use Laravel\Cashier\Cashier;

$prices = Cashier::stripe()->prices->all();
```

<a name="testing"></a>
## 테스트(Testing)

Cashier를 사용하는 애플리케이션을 테스트할 때 Stripe API에 대한 실제 HTTP 요청을 모킹할 수 있지만, 이 경우 Cashier의 자체 동작을 부분적으로 다시 구현해야 합니다. 따라서 테스트가 실제 Stripe API를 호출하도록 허용하는 것을 권장합니다. 이 방식이 더 느리지만 애플리케이션이 예상대로 작동하는지에 대한 더 높은 신뢰도를 제공하며, 느린 테스트는 자체 Pest / PHPUnit 테스트 그룹에 배치할 수 있습니다.

테스트할 때 Cashier 자체에 이미 훌륭한 테스트 스위트가 있으므로, 모든 기본 Cashier 동작이 아닌 자체 애플리케이션의 구독 및 결제 흐름 테스트에만 집중해야 합니다.

시작하려면 Stripe 시크릿의 **테스트** 버전을 `phpunit.xml` 파일에 추가하세요.

```xml
<env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

이제 테스트 중에 Cashier와 상호 작용할 때마다 실제 API 요청이 Stripe 테스트 환경으로 전송됩니다. 편의를 위해 테스트 중에 사용할 수 있는 구독/가격으로 Stripe 테스트 계정을 미리 채워 두어야 합니다.

> [!NOTE]
> 신용카드 거부 및 실패와 같은 다양한 청구 시나리오를 테스트하려면 Stripe에서 제공하는 광범위한 [테스트 카드 번호 및 토큰](https://stripe.com/docs/testing)을 사용할 수 있습니다.

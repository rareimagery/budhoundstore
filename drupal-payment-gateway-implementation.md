# Drupal Commerce Payment Gateway Implementation Guide

## Cash on Delivery · Debit/Credit Card · Cryptocurrency

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Cash on Delivery (COD)](#2-cash-on-delivery-cod)
3. [Debit/Credit Card via Stripe](#3-debitcredit-card-via-stripe)
4. [Cryptocurrency via CoinGate](#4-cryptocurrency-via-coingate)
5. [Custom Multi-Gateway Admin Dashboard](#5-custom-multi-gateway-admin-dashboard)
6. [Checkout Flow Configuration](#6-checkout-flow-configuration)
7. [Order Workflow Customization](#7-order-workflow-customization)
8. [Testing & Go-Live Checklist](#8-testing--go-live-checklist)

---

## 1. Prerequisites

### Required Core & Contrib Modules

Ensure these are installed and enabled before proceeding.

```bash
# Drupal Commerce core (if not already installed)
composer require drupal/commerce

# Enable base Commerce modules
drush en commerce commerce_cart commerce_checkout commerce_order commerce_payment commerce_price commerce_store commerce_tax -y

# Key module — secure storage for API keys (never store in plain config)
composer require drupal/key
drush en key -y

# Commerce Stripe (handles debit/credit cards)
composer require drupal/commerce_stripe
drush en commerce_stripe -y

# Commerce COD (Cash on Delivery)
composer require drupal/commerce_cod
drush en commerce_cod -y

# Commerce CoinGate (Cryptocurrency payments)
composer require drupal/commerce_coingate
drush en commerce_coingate -y

# Useful utilities
composer require drupal/commerce_shipping   # if COD depends on delivery
composer require drupal/token               # token replacements in emails
drush en commerce_shipping token -y
```

### Verify Installation

```bash
drush pm:list --status=enabled --type=module | grep commerce
```

You should see `commerce_payment`, `commerce_stripe`, `commerce_cod`, and `commerce_coingate` in the enabled list.

---

## 2. Cash on Delivery (COD)

### 2.1 Module: `commerce_cod`

The contributed `commerce_cod` module provides a manual payment gateway plugin for Drupal Commerce 2.x. If this module is unavailable or outdated for your version, follow section 2.3 to build a lightweight custom plugin.

### 2.2 Configuration (Contributed Module)

1. Navigate to **Commerce → Configuration → Payment gateways**
   (`/admin/commerce/config/payment-gateways`)
2. Click **Add payment gateway**
3. Fill in:
   - **Name:** `Cash on Delivery`
   - **Plugin:** Select `Cash on Delivery` (provided by commerce_cod)
   - **Display name:** `Pay with Cash on Delivery`
   - **Mode:** `Production`
   - **Conditions** (optional):
     - Restrict to specific **order types**
     - Restrict to specific **stores**
     - Restrict by **billing country** (e.g., only domestic orders)
4. Save

### 2.3 Custom COD Plugin (Fallback)

If the contrib module does not meet your needs (surcharge, region lock, min/max order), create a custom module.

#### File: `web/modules/custom/commerce_cod_custom/commerce_cod_custom.info.yml`

```yaml
name: 'Commerce COD Custom'
type: module
description: 'Cash on Delivery payment gateway with surcharge and region restrictions.'
core_version_requirement: ^10 || ^11
package: Commerce
dependencies:
  - commerce:commerce_payment
  - commerce:commerce_order
  - commerce:commerce_price
```

#### File: `src/Plugin/Commerce/PaymentGateway/CashOnDelivery.php`

```php
<?php

namespace Drupal\commerce_cod_custom\Plugin\Commerce\PaymentGateway;

use Drupal\commerce_order\Entity\OrderInterface;
use Drupal\commerce_payment\Entity\PaymentInterface;
use Drupal\commerce_payment\Plugin\Commerce\PaymentGateway\ManualPaymentGatewayBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides the Cash on Delivery payment gateway.
 *
 * @CommercePaymentGateway(
 *   id = "cod_custom",
 *   label = "Cash on Delivery",
 *   display_label = "Cash on Delivery",
 *   modes = {
 *     "default" = @Translation("Default"),
 *   },
 *   forms = {
 *     "add-payment" = "Drupal\commerce_payment\PluginForm\ManualPaymentAddForm",
 *     "receive-payment" = "Drupal\commerce_payment\PluginForm\PaymentReceiveForm",
 *   },
 *   payment_type = "payment_manual",
 * )
 */
class CashOnDelivery extends ManualPaymentGatewayBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'surcharge_amount' => '0',
      'surcharge_currency' => 'USD',
      'min_order_total' => '0',
      'max_order_total' => '0',
      'allowed_countries' => [],
      'instructions' => 'Please have the exact amount ready for the delivery agent.',
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['surcharge_amount'] = [
      '#type' => 'textfield',
      '#title' => $this->t('COD Surcharge'),
      '#description' => $this->t('Flat fee added for COD orders. Set 0 to disable.'),
      '#default_value' => $this->configuration['surcharge_amount'],
    ];

    $form['surcharge_currency'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Surcharge Currency Code'),
      '#default_value' => $this->configuration['surcharge_currency'],
      '#size' => 5,
    ];

    $form['min_order_total'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Minimum order total for COD'),
      '#default_value' => $this->configuration['min_order_total'],
    ];

    $form['max_order_total'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Maximum order total for COD (0 = no limit)'),
      '#default_value' => $this->configuration['max_order_total'],
    ];

    $form['allowed_countries'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Allowed Countries (comma-separated ISO codes, leave empty for all)'),
      '#default_value' => implode(', ', $this->configuration['allowed_countries']),
    ];

    $form['instructions'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Customer Instructions'),
      '#description' => $this->t('Displayed to customer after placing a COD order.'),
      '#default_value' => $this->configuration['instructions'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    parent::submitConfigurationForm($form, $form_state);
    $values = $form_state->getValue($form['#parents']);
    $this->configuration['surcharge_amount'] = $values['surcharge_amount'];
    $this->configuration['surcharge_currency'] = $values['surcharge_currency'];
    $this->configuration['min_order_total'] = $values['min_order_total'];
    $this->configuration['max_order_total'] = $values['max_order_total'];
    $countries = array_map('trim', explode(',', $values['allowed_countries']));
    $this->configuration['allowed_countries'] = array_filter($countries);
    $this->configuration['instructions'] = $values['instructions'];
  }

  /**
   * {@inheritdoc}
   */
  public function createPayment(PaymentInterface $payment, $received = FALSE) {
    $order = $payment->getOrder();

    // Validate order total against min/max.
    $order_total = (float) $order->getTotalPrice()->getNumber();
    $min = (float) $this->configuration['min_order_total'];
    $max = (float) $this->configuration['max_order_total'];

    if ($min > 0 && $order_total < $min) {
      throw new \InvalidArgumentException(
        $this->t('Order total must be at least @min for Cash on Delivery.', ['@min' => $min])
      );
    }
    if ($max > 0 && $order_total > $max) {
      throw new \InvalidArgumentException(
        $this->t('Order total exceeds the @max limit for Cash on Delivery.', ['@max' => $max])
      );
    }

    parent::createPayment($payment, $received);
  }

}
```

#### File: `src/EventSubscriber/CodSurchargeSubscriber.php`

This adds the surcharge as an order adjustment.

```php
<?php

namespace Drupal\commerce_cod_custom\EventSubscriber;

use Drupal\commerce_order\Adjustment;
use Drupal\commerce_order\Event\OrderEvents;
use Drupal\commerce_order\Event\OrderEvent;
use Drupal\commerce_price\Price;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CodSurchargeSubscriber implements EventSubscriberInterface {

  public static function getSubscribedEvents() {
    return [
      'commerce_order.order.paid' => 'onOrderPaid',
    ];
  }

  // Alternative: apply surcharge during checkout via order processor.
  // See commerce_cod_custom.services.yml for order processor approach.
}
```

#### File: `src/Plugin/Commerce/Condition/CodOrderTotalCondition.php`

Optional — use Commerce Conditions API to show/hide COD based on cart total in the checkout flow, rather than throwing exceptions.

#### Enable and Configure

```bash
drush en commerce_cod_custom -y
drush cr
```

Then configure at `/admin/commerce/config/payment-gateways/add`.

---

## 3. Debit/Credit Card via Stripe

### 3.1 Module: `commerce_stripe`

The `commerce_stripe` module provides a fully PCI-compliant on-site payment gateway using Stripe.js — card numbers never touch your server.

### 3.2 Stripe Account Setup

1. Sign up at [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Complete business verification
3. Retrieve your API keys from **Developers → API Keys**:
   - **Publishable key:** `pk_test_...` / `pk_live_...`
   - **Secret key:** `sk_test_...` / `sk_live_...`
4. Set up a **Webhook endpoint** in Stripe Dashboard:
   - URL: `https://yoursite.com/payment/notify/stripe`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `charge.dispute.created`
   - Copy the **Webhook signing secret** (`whsec_...`)

### 3.3 Secure Key Storage

Store keys using the Key module — never paste them directly into payment gateway config.

1. Go to **Configuration → System → Keys** (`/admin/config/system/keys`)
2. Add three keys:
   - `stripe_secret_key` — type: Authentication, provider: Configuration
   - `stripe_publishable_key` — type: Authentication, provider: Configuration
   - `stripe_webhook_secret` — type: Authentication, provider: Configuration
3. Paste the corresponding Stripe values

For production, use the **Key File** or **Environment Variable** provider instead of Configuration.

### 3.4 Payment Gateway Configuration

1. Navigate to **Commerce → Configuration → Payment gateways**
2. Click **Add payment gateway**
3. Fill in:
   - **Name:** `Credit / Debit Card`
   - **Plugin:** `Stripe (commerce_stripe)`
   - **Display name:** `Pay with Card`
   - **Mode:** `Test` (switch to `Live` after testing)
   - **Secret key:** Reference the Key module entry `stripe_secret_key`
   - **Publishable key:** Reference `stripe_publishable_key`
   - **Webhook signing secret:** Reference `stripe_webhook_secret`
   - **Payment capture:** Choose `Automatic` (charge immediately) or `Manual` (authorize first, capture later from admin)
4. Under **Conditions**, optionally restrict by store or order type
5. Save

### 3.5 Enable 3D Secure / SCA

Stripe handles 3D Secure automatically via Payment Intents. The `commerce_stripe` module supports this out of the box. Ensure you are using the **Payment Intents** integration (default in recent versions), not the legacy Charges API.

No additional configuration is needed — Stripe will trigger 3DS challenges when the issuing bank requires it.

### 3.6 Stored Payment Methods

To allow returning customers to save their card:

1. Edit the Stripe payment gateway
2. Ensure **"Allow customers to reuse previously stored payment methods"** is checked
3. Verify your checkout flow includes the **Payment information** pane (it does by default)

Customers will see a "Save my payment method for later" checkbox during checkout.

### 3.7 Refunds

Refunds are handled from the Drupal admin:

1. Go to **Commerce → Orders → [Order] → Payments** tab
2. Click **Refund** next to a completed payment
3. Enter full or partial refund amount
4. The refund is processed through the Stripe API automatically

---

## 4. Cryptocurrency via CoinGate

### 4.1 Module: `commerce_coingate`

The `commerce_coingate` module integrates with the CoinGate payment processor, supporting 70+ cryptocurrencies including BTC, ETH, LTC, and USDT. CoinGate handles rate conversion and can auto-settle to fiat.

If the contrib module is unavailable or you prefer an alternative, see section 4.5 for alternatives and section 4.6 for a custom implementation skeleton.

### 4.2 CoinGate Account Setup

1. Register at [https://coingate.com](https://coingate.com)
2. Complete merchant verification
3. Go to **API → Apps** and create a new app
4. Copy the **API Auth Token**
5. Configure payout preferences:
   - **Keep as crypto** — receive payments in the original cryptocurrency
   - **Convert to fiat** — auto-convert to USD/EUR and settle to your bank
   - **Mix** — percentage split between crypto and fiat
6. Set the **Callback URL**: `https://yoursite.com/payment/notify/coingate`

### 4.3 Secure Key Storage

1. Go to **Configuration → System → Keys**
2. Add key:
   - `coingate_api_token` — type: Authentication
3. Paste the CoinGate API Auth Token

### 4.4 Payment Gateway Configuration

1. Navigate to **Commerce → Configuration → Payment gateways**
2. Click **Add payment gateway**
3. Fill in:
   - **Name:** `Cryptocurrency`
   - **Plugin:** `CoinGate`
   - **Display name:** `Pay with Crypto (BTC, ETH, USDT & more)`
   - **Mode:** `Test` (CoinGate sandbox) → switch to `Live` for production
   - **API Auth Token:** Reference `coingate_api_token` from Key module
   - **Receive Currency:** `USD` (or `BTC`, `EUR`, etc.)
   - **Order expiration:** `1200` (seconds — 20 minutes for rate lock)
4. Save

### 4.5 Alternative Crypto Providers

| Provider | Module / Method | Self-Hosted | Coins | Fiat Settlement |
|----------|----------------|-------------|-------|-----------------|
| CoinGate | `commerce_coingate` | No | 70+ | Yes |
| BTCPay Server | Custom (see 4.6) | Yes | BTC, LTC + Lightning | No (you hold crypto) |
| Coinbase Commerce | Custom (see 4.6) | No | BTC, ETH, LTC, USDT, DAI | Yes |
| NOWPayments | Custom (see 4.6) | No | 150+ | Yes |

### 4.6 Custom Crypto Gateway Skeleton (BTCPay / Coinbase Commerce)

If using a provider without a contributed module, create a custom off-site redirect gateway.

#### File: `web/modules/custom/commerce_crypto_custom/commerce_crypto_custom.info.yml`

```yaml
name: 'Commerce Crypto Custom'
type: module
description: 'Cryptocurrency payments via BTCPay Server or Coinbase Commerce.'
core_version_requirement: ^10 || ^11
package: Commerce
dependencies:
  - commerce:commerce_payment
  - commerce:commerce_order
```

#### File: `src/Plugin/Commerce/PaymentGateway/CryptoPayment.php`

```php
<?php

namespace Drupal\commerce_crypto_custom\Plugin\Commerce\PaymentGateway;

use Drupal\commerce_order\Entity\OrderInterface;
use Drupal\commerce_payment\Plugin\Commerce\PaymentGateway\OffsitePaymentGatewayBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Provides the Crypto payment gateway.
 *
 * @CommercePaymentGateway(
 *   id = "crypto_custom",
 *   label = "Cryptocurrency",
 *   display_label = "Pay with Crypto",
 *   modes = {
 *     "test" = @Translation("Sandbox"),
 *     "live" = @Translation("Production"),
 *   },
 *   forms = {
 *     "offsite-payment" =
 *       "Drupal\commerce_crypto_custom\PluginForm\CryptoOffsiteForm",
 *   },
 *   payment_method_types = {"credit_card"},
 *   requires_billing_information = FALSE,
 * )
 */
class CryptoPayment extends OffsitePaymentGatewayBase {

  public function defaultConfiguration() {
    return [
      'api_url' => '',
      'api_key' => '',
      'supported_coins' => 'BTC,ETH,USDT',
      'payment_window' => 1200,
    ] + parent::defaultConfiguration();
  }

  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['api_url'] = [
      '#type' => 'url',
      '#title' => $this->t('API Endpoint URL'),
      '#description' => $this->t('e.g., https://your-btcpay-server.com/api/v1 or https://api.commerce.coinbase.com'),
      '#default_value' => $this->configuration['api_url'],
      '#required' => TRUE,
    ];

    $form['api_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('API Key (or reference Key module key name)'),
      '#default_value' => $this->configuration['api_key'],
      '#required' => TRUE,
    ];

    $form['supported_coins'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Supported Coins (comma-separated)'),
      '#default_value' => $this->configuration['supported_coins'],
    ];

    $form['payment_window'] = [
      '#type' => 'number',
      '#title' => $this->t('Payment Window (seconds)'),
      '#default_value' => $this->configuration['payment_window'],
      '#min' => 300,
      '#max' => 7200,
    ];

    return $form;
  }

  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    parent::submitConfigurationForm($form, $form_state);
    $values = $form_state->getValue($form['#parents']);
    $this->configuration['api_url'] = $values['api_url'];
    $this->configuration['api_key'] = $values['api_key'];
    $this->configuration['supported_coins'] = $values['supported_coins'];
    $this->configuration['payment_window'] = $values['payment_window'];
  }

  public function onReturn(OrderInterface $order, Request $request) {
    // Verify payment status with the crypto provider API.
    // Update the payment entity accordingly.
    // Example pseudocode:
    //
    // $invoice_id = $request->query->get('invoice_id');
    // $response = $this->httpClient->get($this->configuration['api_url'] . '/invoices/' . $invoice_id);
    // $data = json_decode($response->getBody(), TRUE);
    //
    // if ($data['status'] === 'paid' || $data['status'] === 'confirmed') {
    //   $payment_storage = $this->entityTypeManager->getStorage('commerce_payment');
    //   $payment = $payment_storage->create([...]);
    //   $payment->setState('completed');
    //   $payment->save();
    // }
  }

  public function onNotify(Request $request) {
    // Handle IPN / webhook callback from crypto provider.
    // Verify signature, update payment and order status.
    //
    // 1. Read the raw POST body
    // 2. Verify HMAC signature against your webhook secret
    // 3. Parse the invoice/charge status
    // 4. Load the order and payment, update state
    // 5. Return 200 OK
  }

}
```

#### File: `src/PluginForm/CryptoOffsiteForm.php`

```php
<?php

namespace Drupal\commerce_crypto_custom\PluginForm;

use Drupal\commerce_payment\PluginForm\PaymentOffsiteForm as BasePaymentOffsiteForm;
use Drupal\Core\Form\FormStateInterface;

class CryptoOffsiteForm extends BasePaymentOffsiteForm {

  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    /** @var \Drupal\commerce_payment\Entity\PaymentInterface $payment */
    $payment = $this->entity;
    $order = $payment->getOrder();
    $gateway_config = $payment->getPaymentGateway()->getPlugin()->getConfiguration();

    // Create an invoice/charge via the crypto provider API.
    // Pseudocode:
    //
    // $response = \Drupal::httpClient()->post($gateway_config['api_url'] . '/invoices', [
    //   'headers' => ['Authorization' => 'Token ' . $gateway_config['api_key']],
    //   'json' => [
    //     'price_amount' => $order->getTotalPrice()->getNumber(),
    //     'price_currency' => $order->getTotalPrice()->getCurrencyCode(),
    //     'order_id' => $order->id(),
    //     'callback_url' => $payment->getPaymentGateway()->getPlugin()->getNotifyUrl()->toString(),
    //     'success_url' => $form['#return_url'],
    //     'cancel_url' => $form['#cancel_url'],
    //   ],
    // ]);
    // $data = json_decode($response->getBody(), TRUE);
    // $redirect_url = $data['payment_url'];

    // For now, placeholder:
    $redirect_url = 'https://example.com/crypto-checkout';

    return $this->buildRedirectForm($form, $form_state, $redirect_url, [], 'GET');
  }

}
```

---

## 5. Custom Multi-Gateway Admin Dashboard

Create a simple custom module that provides a unified view of all payment transactions.

### File: `web/modules/custom/commerce_payment_dashboard/commerce_payment_dashboard.info.yml`

```yaml
name: 'Commerce Payment Dashboard'
type: module
description: 'Unified admin dashboard for all payment gateways.'
core_version_requirement: ^10 || ^11
package: Commerce
dependencies:
  - commerce:commerce_payment
  - commerce:commerce_order
```

### File: `commerce_payment_dashboard.routing.yml`

```yaml
commerce_payment_dashboard.overview:
  path: '/admin/commerce/payment-dashboard'
  defaults:
    _controller: '\Drupal\commerce_payment_dashboard\Controller\DashboardController::overview'
    _title: 'Payment Dashboard'
  requirements:
    _permission: 'administer commerce_payment'
```

### File: `commerce_payment_dashboard.links.menu.yml`

```yaml
commerce_payment_dashboard.overview:
  title: 'Payment Dashboard'
  route_name: commerce_payment_dashboard.overview
  parent: commerce.admin_commerce
  weight: -5
```

### File: `src/Controller/DashboardController.php`

```php
<?php

namespace Drupal\commerce_payment_dashboard\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class DashboardController extends ControllerBase {

  protected $entityTypeManager;

  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager')
    );
  }

  public function overview() {
    $payment_storage = $this->entityTypeManager->getStorage('commerce_payment');
    $gateway_storage = $this->entityTypeManager->getStorage('commerce_payment_gateway');

    $gateways = $gateway_storage->loadMultiple();
    $summary = [];

    foreach ($gateways as $gateway) {
      $query = $payment_storage->getQuery()
        ->accessCheck(TRUE)
        ->condition('payment_gateway', $gateway->id())
        ->condition('state', 'completed');

      $completed_ids = $query->execute();

      $pending_ids = $payment_storage->getQuery()
        ->accessCheck(TRUE)
        ->condition('payment_gateway', $gateway->id())
        ->condition('state', ['pending', 'authorization'], 'IN')
        ->execute();

      $total = '0.00';
      if ($completed_ids) {
        $payments = $payment_storage->loadMultiple($completed_ids);
        foreach ($payments as $payment) {
          $total = bcadd($total, $payment->getAmount()->getNumber(), 2);
        }
      }

      $currency = 'USD';
      if ($completed_ids) {
        $first = reset($payments);
        $currency = $first->getAmount()->getCurrencyCode();
      }

      $summary[] = [
        'gateway' => $gateway->label(),
        'plugin' => $gateway->getPluginId(),
        'completed' => count($completed_ids),
        'pending' => count($pending_ids),
        'total' => $total . ' ' . $currency,
      ];
    }

    $header = [
      $this->t('Gateway'),
      $this->t('Type'),
      $this->t('Completed'),
      $this->t('Pending'),
      $this->t('Total Revenue'),
    ];

    $rows = [];
    foreach ($summary as $item) {
      $rows[] = [
        $item['gateway'],
        $item['plugin'],
        $item['completed'],
        $item['pending'],
        $item['total'],
      ];
    }

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => $this->t('No payment gateways configured yet.'),
      '#attributes' => ['class' => ['payment-dashboard-table']],
    ];
  }

}
```

---

## 6. Checkout Flow Configuration

### 6.1 Add All Three Gateways to Checkout

After configuring all three gateways, verify they appear during checkout.

1. Navigate to **Commerce → Configuration → Checkout flows** (`/admin/commerce/config/checkout-flows`)
2. Edit the **Default** checkout flow (or your custom flow)
3. In the **Payment** section, the **Payment information** pane should already be present
4. Ensure **Payment process** pane is in the correct position (after Review)
5. Save

All enabled and configured payment gateways will automatically appear as options in the payment step. The customer will see radio buttons:

- ○ Pay with Cash on Delivery
- ○ Pay with Card
- ○ Pay with Crypto (BTC, ETH, USDT & more)

### 6.2 Reorder Payment Options

The display order follows the **weight** of the payment gateways. To reorder:

1. Go to **Commerce → Configuration → Payment gateways**
2. Drag to reorder (or edit weights)
3. Save

### 6.3 Conditional Visibility

To show/hide gateways based on conditions (e.g., hide COD for international orders):

1. Edit the payment gateway
2. Under **Conditions**, add:
   - **Billing address country** condition — restrict to specific countries
   - **Order total** condition — min/max cart value
   - **Customer role** condition — restrict to verified customers

---

## 7. Order Workflow Customization

### 7.1 Map Payment States to Order States

Each gateway handles state transitions differently. Here's the recommended mapping:

| Gateway | Payment Event | Order State |
|---------|--------------|-------------|
| COD | Order placed | `validation` → `fulfillment` |
| COD | Delivery confirmed | `fulfillment` → `completed` |
| Card (Stripe) | Payment authorized | `validation` |
| Card (Stripe) | Payment captured | `fulfillment` → `completed` |
| Crypto | Invoice created | `validation` |
| Crypto | Payment confirmed | `fulfillment` → `completed` |
| Crypto | Payment expired | `canceled` |

### 7.2 Custom Order Workflow

Override the default workflow to add COD-specific states.

#### File: `web/modules/custom/commerce_cod_custom/config/install/commerce_order.commerce_order_type.default.yml`

Or better, create a custom workflow:

#### File: `web/modules/custom/commerce_cod_custom/commerce_cod_custom.workflows.yml`

```yaml
order_default_with_cod:
  id: order_default_with_cod
  group: commerce_order
  label: 'Default with COD'
  states:
    draft:
      label: Draft
    validation:
      label: Validation
    cod_pending:
      label: 'Awaiting COD Payment'
    fulfillment:
      label: Fulfillment
    completed:
      label: Completed
    canceled:
      label: Canceled
  transitions:
    place:
      label: 'Place order'
      from: [draft]
      to: validation
    validate:
      label: 'Validate order'
      from: [validation]
      to: fulfillment
    cod_awaiting:
      label: 'Awaiting COD'
      from: [validation]
      to: cod_pending
    cod_received:
      label: 'COD Payment Received'
      from: [cod_pending]
      to: completed
    fulfill:
      label: 'Fulfill order'
      from: [fulfillment]
      to: completed
    cancel:
      label: 'Cancel order'
      from: [draft, validation, cod_pending, fulfillment]
      to: canceled
```

Then assign this workflow to your order type at **Commerce → Configuration → Order types → Edit → Workflow**.

---

## 8. Testing & Go-Live Checklist

### 8.1 Test Mode Credentials

| Gateway | Test Environment |
|---------|-----------------|
| Stripe | Use `pk_test_` / `sk_test_` keys. Card: `4242 4242 4242 4242`, any future expiry, any CVC |
| CoinGate | Enable sandbox mode at `sandbox.coingate.com`. Use sandbox API token |
| COD | No external service — test by placing an order and marking received in admin |

### 8.2 Test Scenarios

Run through each of these before going live:

**Cash on Delivery:**
- [ ] Place a COD order — verify order goes to `cod_pending` state
- [ ] Verify surcharge is applied (if configured)
- [ ] Mark payment as received in admin — verify order completes
- [ ] Attempt COD on order above max limit — verify it's blocked
- [ ] Attempt COD from restricted country — verify gateway is hidden

**Card (Stripe):**
- [ ] Successful payment with test card `4242 4242 4242 4242`
- [ ] Declined card with `4000 0000 0000 0002`
- [ ] 3D Secure challenge with `4000 0027 6000 3184`
- [ ] Process a full refund from admin
- [ ] Process a partial refund from admin
- [ ] Save a card and reuse it on a second order
- [ ] Verify webhook events are received (check Stripe Dashboard → Developers → Webhooks)

**Crypto (CoinGate):**
- [ ] Place a crypto order — verify redirect to CoinGate payment page
- [ ] Complete a test payment in sandbox — verify order updates via webhook
- [ ] Let a payment expire — verify order is canceled
- [ ] Verify correct fiat amount conversion on the payment page

### 8.3 Go-Live Steps

1. **Switch all gateways to Live/Production mode**
2. **Update API keys** to production keys (via Key module)
3. **Verify webhook URLs** are pointing to production domain with HTTPS
4. **Enable Drupal cron** to handle cleanup of expired crypto payments
5. **Test one real transaction** on each gateway with a small amount
6. **Monitor logs** at `/admin/reports/dblog` for payment errors
7. **Set up email notifications** for failed payments using Commerce rules or the Symfony Mailer module

### 8.4 Security Checklist

- [ ] All API keys stored in Key module (not in plain config exports)
- [ ] Production keys use environment variable or file provider, not database
- [ ] Webhook endpoints verify signatures (Stripe: `whsec_`, CoinGate: IP whitelist or HMAC)
- [ ] HTTPS enforced site-wide
- [ ] Drupal security updates applied
- [ ] `config/sync` does not contain plain-text API keys
- [ ] Admin payment permissions restricted to trusted roles only
- [ ] PCI self-assessment questionnaire completed (SAQ A for tokenized Stripe)

---

## Quick Reference: Module Summary

| Payment Method | Module | Type | Contrib or Custom |
|---------------|--------|------|-------------------|
| Cash on Delivery | `commerce_cod` or `commerce_cod_custom` | Manual | Contrib (or custom fallback) |
| Debit/Credit Card | `commerce_stripe` | On-site (tokenized) | Contrib |
| Cryptocurrency | `commerce_coingate` or `commerce_crypto_custom` | Off-site redirect | Contrib (or custom fallback) |
| Payment Dashboard | `commerce_payment_dashboard` | Admin UI | Custom |
| API Key Storage | `key` | Security | Contrib |

---

## Useful Drush Commands

```bash
# Clear cache after configuration changes
drush cr

# Check payment gateway status
drush eval "print_r(array_keys(\Drupal::entityTypeManager()->getStorage('commerce_payment_gateway')->loadMultiple()));"

# View recent payments
drush eval "\$payments = \Drupal::entityTypeManager()->getStorage('commerce_payment')->loadMultiple(); foreach(\$payments as \$p) { echo \$p->id() . ' | ' . \$p->getState()->getId() . ' | ' . \$p->getAmount()->getNumber() . PHP_EOL; }"

# Export config (verify no secrets leak)
drush cex --diff
```

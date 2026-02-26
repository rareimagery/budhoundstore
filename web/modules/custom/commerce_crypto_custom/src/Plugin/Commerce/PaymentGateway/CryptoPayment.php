<?php

namespace Drupal\commerce_crypto_custom\Plugin\Commerce\PaymentGateway;

use Drupal\commerce_order\Entity\OrderInterface;
use Drupal\commerce_payment\Entity\PaymentInterface;
use Drupal\commerce_payment\Plugin\Commerce\PaymentGateway\OffsitePaymentGatewayBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Provides the Crypto off-site payment gateway.
 *
 * Supports BTCPay Server, Coinbase Commerce, NOWPayments, or any provider
 * with a compatible REST API.
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

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'api_url'         => '',
      'api_key'         => '',
      'supported_coins' => 'BTC,ETH,USDT,LTC',
      'payment_window'  => 1200,
      'receive_currency' => 'USD',
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['api_url'] = [
      '#type'          => 'url',
      '#title'         => $this->t('API Endpoint URL'),
      '#description'   => $this->t('e.g., https://your-btcpay-server.com/api/v1 or https://api.commerce.coinbase.com'),
      '#default_value' => $this->configuration['api_url'],
      '#required'      => TRUE,
    ];

    $form['api_key'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('API Key'),
      '#description'   => $this->t('API key or auth token from your crypto provider.'),
      '#default_value' => $this->configuration['api_key'],
      '#required'      => TRUE,
    ];

    $form['supported_coins'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Supported Coins (comma-separated)'),
      '#description'   => $this->t('e.g., BTC,ETH,USDT,LTC'),
      '#default_value' => $this->configuration['supported_coins'],
    ];

    $form['receive_currency'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Receive/Settle Currency'),
      '#description'   => $this->t('Currency you want to receive after conversion (e.g., USD, EUR, BTC).'),
      '#default_value' => $this->configuration['receive_currency'],
      '#size'          => 6,
    ];

    $form['payment_window'] = [
      '#type'          => 'number',
      '#title'         => $this->t('Payment Window (seconds)'),
      '#description'   => $this->t('How long the quoted rate is valid. Min 300 (5 min), max 7200 (2 hr).'),
      '#default_value' => $this->configuration['payment_window'],
      '#min'           => 300,
      '#max'           => 7200,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    parent::submitConfigurationForm($form, $form_state);
    $values = $form_state->getValue($form['#parents']);
    $this->configuration['api_url']          = $values['api_url'];
    $this->configuration['api_key']          = $values['api_key'];
    $this->configuration['supported_coins']  = $values['supported_coins'];
    $this->configuration['receive_currency'] = $values['receive_currency'];
    $this->configuration['payment_window']   = (int) $values['payment_window'];
  }

  /**
   * {@inheritdoc}
   *
   * Called when customer returns from the crypto provider after paying.
   */
  public function onReturn(OrderInterface $order, Request $request) {
    $invoice_id = $request->query->get('invoice_id') ?? $request->query->get('order_id');

    if (!$invoice_id) {
      throw new \RuntimeException('Missing invoice_id on return URL.');
    }

    $config = $this->getConfiguration();
    $status = $this->fetchInvoiceStatus($config, $invoice_id);

    if (in_array($status, ['paid', 'confirmed', 'complete', 'COMPLETED'], TRUE)) {
      $payment_storage = $this->entityTypeManager->getStorage('commerce_payment');
      $payment = $payment_storage->create([
        'state'           => 'completed',
        'amount'          => $order->getTotalPrice(),
        'payment_gateway' => $this->parentEntity->id(),
        'order_id'        => $order->id(),
        'remote_id'       => $invoice_id,
        'remote_state'    => $status,
      ]);
      $payment->save();
    }
    else {
      // Payment still pending or expired — do nothing, let the webhook handle it.
      \Drupal::logger('commerce_crypto_custom')->warning(
        'Returned from crypto provider for order @order with status @status.',
        ['@order' => $order->id(), '@status' => $status]
      );
    }
  }

  /**
   * {@inheritdoc}
   *
   * Handles IPN / webhook callbacks from the crypto provider.
   */
  public function onNotify(Request $request) {
    $payload = json_decode($request->getContent(), TRUE);
    if (!$payload) {
      return;
    }

    $invoice_id = $payload['id'] ?? $payload['invoice_id'] ?? NULL;
    $status     = $payload['status'] ?? $payload['payment_status'] ?? NULL;
    $order_id   = $payload['order_id'] ?? $payload['metadata']['order_id'] ?? NULL;

    if (!$invoice_id || !$order_id) {
      return;
    }

    // Load the order.
    $order_storage = $this->entityTypeManager->getStorage('commerce_order');
    $order = $order_storage->load($order_id);
    if (!$order) {
      return;
    }

    $payment_storage = $this->entityTypeManager->getStorage('commerce_payment');

    // Check whether a payment record already exists for this invoice.
    $existing = $payment_storage->loadByProperties([
      'order_id'  => $order_id,
      'remote_id' => $invoice_id,
    ]);

    $paid_states = ['paid', 'confirmed', 'complete', 'COMPLETED'];
    $expired_states = ['expired', 'invalid', 'CANCELED'];

    if (in_array($status, $paid_states, TRUE)) {
      if ($existing) {
        /** @var \Drupal\commerce_payment\Entity\PaymentInterface $payment */
        $payment = reset($existing);
        $payment->setState('completed');
        $payment->setRemoteState($status);
        $payment->save();
      }
      else {
        $payment = $payment_storage->create([
          'state'           => 'completed',
          'amount'          => $order->getTotalPrice(),
          'payment_gateway' => $this->parentEntity->id(),
          'order_id'        => $order_id,
          'remote_id'       => $invoice_id,
          'remote_state'    => $status,
        ]);
        $payment->save();
      }
    }
    elseif (in_array($status, $expired_states, TRUE) && $existing) {
      $payment = reset($existing);
      $payment->setState('authorization_expired');
      $payment->save();
    }
  }

  /**
   * Fetches the invoice status from the crypto provider API.
   */
  protected function fetchInvoiceStatus(array $config, string $invoice_id): string {
    try {
      $response = \Drupal::httpClient()->get(
        rtrim($config['api_url'], '/') . '/invoices/' . $invoice_id,
        [
          'headers' => [
            'Authorization' => 'Token ' . $config['api_key'],
            'Content-Type'  => 'application/json',
          ],
          'timeout' => 10,
        ]
      );
      $data = json_decode((string) $response->getBody(), TRUE);
      return $data['status'] ?? 'unknown';
    }
    catch (\Exception $e) {
      \Drupal::logger('commerce_crypto_custom')->error(
        'Failed to fetch invoice @id: @msg',
        ['@id' => $invoice_id, '@msg' => $e->getMessage()]
      );
      return 'unknown';
    }
  }

}

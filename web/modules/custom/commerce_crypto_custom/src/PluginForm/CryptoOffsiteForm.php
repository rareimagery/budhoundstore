<?php

namespace Drupal\commerce_crypto_custom\PluginForm;

use Drupal\commerce_payment\PluginForm\PaymentOffsiteForm as BasePaymentOffsiteForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Redirects the customer to the crypto provider's hosted payment page.
 */
class CryptoOffsiteForm extends BasePaymentOffsiteForm {

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    /** @var \Drupal\commerce_payment\Entity\PaymentInterface $payment */
    $payment = $this->entity;
    $order   = $payment->getOrder();
    $gateway_plugin = $payment->getPaymentGateway()->getPlugin();
    $config  = $gateway_plugin->getConfiguration();

    $invoice_data = [
      'price_amount'    => $order->getTotalPrice()->getNumber(),
      'price_currency'  => $order->getTotalPrice()->getCurrencyCode(),
      'receive_currency' => $config['receive_currency'] ?? 'USD',
      'order_id'        => (string) $order->id(),
      'token'           => $order->getData('payment_redirect_key', ''),
      'callback_url'    => $gateway_plugin->getNotifyUrl()->toString(),
      'success_url'     => $form['#return_url'],
      'cancel_url'      => $form['#cancel_url'],
      'title'           => 'Order #' . $order->id(),
    ];

    try {
      $response = \Drupal::httpClient()->post(
        rtrim($config['api_url'], '/') . '/invoices',
        [
          'headers' => [
            'Authorization' => 'Token ' . $config['api_key'],
            'Content-Type'  => 'application/json',
          ],
          'json'    => $invoice_data,
          'timeout' => 15,
        ]
      );
      $data = json_decode((string) $response->getBody(), TRUE);
      $redirect_url = $data['payment_url'] ?? $data['hosted_url'] ?? $data['url'] ?? NULL;
    }
    catch (\Exception $e) {
      \Drupal::logger('commerce_crypto_custom')->error(
        'Failed to create crypto invoice: @msg', ['@msg' => $e->getMessage()]
      );
      $redirect_url = NULL;
    }

    if (!$redirect_url) {
      // Fallback: show an error to the customer instead of a blank redirect.
      $form['error'] = [
        '#markup' => '<p class="messages messages--error">'
          . t('Unable to connect to the crypto payment provider. Please try again or choose another payment method.')
          . '</p>',
      ];
      return $form;
    }

    return $this->buildRedirectForm($form, $form_state, $redirect_url, [], 'GET');
  }

}

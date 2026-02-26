<?php

namespace Drupal\commerce_cod_custom\Plugin\Commerce\PaymentGateway;

use Drupal\commerce_payment\Attribute\CommercePaymentGateway;
use Drupal\commerce_payment\Entity\PaymentInterface;
use Drupal\commerce_payment\Plugin\Commerce\PaymentGateway\Manual;
use Drupal\commerce_payment\PluginForm\ManualPaymentAddForm;
use Drupal\commerce_payment\PluginForm\PaymentReceiveForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * Provides the Cash on Delivery payment gateway.
 */
#[CommercePaymentGateway(
  id: "cod_custom",
  label: new TranslatableMarkup("Cash on Delivery"),
  display_label: new TranslatableMarkup("Cash on Delivery"),
  modes: [
    "default" => new TranslatableMarkup("Default"),
  ],
  forms: [
    "add-payment" => ManualPaymentAddForm::class,
    "receive-payment" => PaymentReceiveForm::class,
  ],
  payment_type: "payment_manual",
  requires_billing_information: FALSE,
)]
class CashOnDelivery extends Manual {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'surcharge_amount'  => '0',
      'surcharge_currency' => 'USD',
      'min_order_total'  => '0',
      'max_order_total'  => '0',
      'allowed_countries' => [],
      'instructions'     => 'Please have the exact amount ready for the delivery agent.',
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['surcharge_amount'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('COD Surcharge'),
      '#description'   => $this->t('Flat fee added for COD orders. Set 0 to disable.'),
      '#default_value' => $this->configuration['surcharge_amount'],
    ];

    $form['surcharge_currency'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Surcharge Currency Code'),
      '#default_value' => $this->configuration['surcharge_currency'],
      '#size'          => 5,
    ];

    $form['min_order_total'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Minimum order total for COD'),
      '#default_value' => $this->configuration['min_order_total'],
    ];

    $form['max_order_total'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Maximum order total for COD (0 = no limit)'),
      '#default_value' => $this->configuration['max_order_total'],
    ];

    $form['allowed_countries'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Allowed Countries (comma-separated ISO codes, leave empty for all)'),
      '#default_value' => implode(', ', $this->configuration['allowed_countries']),
    ];

    $form['instructions'] = [
      '#type'          => 'textarea',
      '#title'         => $this->t('Customer Instructions'),
      '#description'   => $this->t('Displayed to customer after placing a COD order.'),
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
    $this->configuration['surcharge_amount']  = $values['surcharge_amount'];
    $this->configuration['surcharge_currency'] = $values['surcharge_currency'];
    $this->configuration['min_order_total']   = $values['min_order_total'];
    $this->configuration['max_order_total']   = $values['max_order_total'];
    $countries = array_map('trim', explode(',', $values['allowed_countries']));
    $this->configuration['allowed_countries'] = array_filter($countries);
    $this->configuration['instructions']      = $values['instructions'];
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

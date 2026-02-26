<?php

namespace Drupal\commerce_cod_custom\OrderProcessor;

use Drupal\commerce_order\Adjustment;
use Drupal\commerce_order\Entity\OrderInterface;
use Drupal\commerce_order\OrderProcessorInterface;
use Drupal\commerce_price\Price;

/**
 * Applies the COD surcharge as an order adjustment.
 *
 * Registered as a commerce_order.order_processor service (priority 200)
 * so it runs after base price calculations.
 */
class CodSurchargeProcessor implements OrderProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function process(OrderInterface $order) {
    // Only act when COD custom is the selected payment gateway.
    $payment_gateway = $order->get('payment_gateway');
    if ($payment_gateway->isEmpty()) {
      return;
    }

    /** @var \Drupal\commerce_payment\Entity\PaymentGatewayInterface $gateway */
    $gateway = $payment_gateway->entity;
    if (!$gateway) {
      return;
    }

    $plugin = $gateway->getPlugin();
    // Only apply to our COD plugin.
    if ($plugin->getPluginId() !== 'cod_custom') {
      return;
    }

    $config = $plugin->getConfiguration();
    $surcharge = (float) ($config['surcharge_amount'] ?? 0);
    if ($surcharge <= 0) {
      return;
    }

    $currency = $config['surcharge_currency'] ?? 'USD';

    // Remove any previously added COD surcharge adjustment to avoid doubling.
    $adjustments = $order->getAdjustments();
    foreach ($adjustments as $key => $adjustment) {
      if ($adjustment->getType() === 'custom' && $adjustment->getSourceId() === 'cod_surcharge') {
        $order->removeAdjustment($adjustment);
      }
    }

    $order->addAdjustment(new Adjustment([
      'type'      => 'custom',
      'label'     => t('COD Handling Fee'),
      'amount'    => new Price((string) $surcharge, $currency),
      'source_id' => 'cod_surcharge',
      'included'  => FALSE,
      'locked'    => FALSE,
    ]));
  }

}

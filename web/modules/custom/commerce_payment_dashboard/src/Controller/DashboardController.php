<?php

namespace Drupal\commerce_payment_dashboard\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides an admin overview of all payment gateway activity.
 */
class DashboardController extends ControllerBase {

  /**
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager')
    );
  }

  /**
   * Renders the payment dashboard overview table.
   */
  public function overview(): array {
    $payment_storage = $this->entityTypeManager->getStorage('commerce_payment');
    $gateway_storage = $this->entityTypeManager->getStorage('commerce_payment_gateway');

    $gateways = $gateway_storage->loadMultiple();

    if (empty($gateways)) {
      return [
        '#markup' => '<p>' . $this->t('No payment gateways configured yet. <a href="/admin/commerce/config/payment-gateways/add">Add a payment gateway</a>.') . '</p>',
      ];
    }

    $summary = [];

    foreach ($gateways as $gateway) {
      $completed_ids = $payment_storage->getQuery()
        ->accessCheck(TRUE)
        ->condition('payment_gateway', $gateway->id())
        ->condition('state', 'completed')
        ->execute();

      $pending_ids = $payment_storage->getQuery()
        ->accessCheck(TRUE)
        ->condition('payment_gateway', $gateway->id())
        ->condition('state', ['pending', 'authorization'], 'IN')
        ->execute();

      $refunded_ids = $payment_storage->getQuery()
        ->accessCheck(TRUE)
        ->condition('payment_gateway', $gateway->id())
        ->condition('state', 'refunded')
        ->execute();

      $total    = '0.00';
      $currency = 'USD';

      if (!empty($completed_ids)) {
        $payments = $payment_storage->loadMultiple($completed_ids);
        foreach ($payments as $payment) {
          $total    = bcadd($total, $payment->getAmount()->getNumber(), 2);
          $currency = $payment->getAmount()->getCurrencyCode();
        }
      }

      $summary[] = [
        'gateway'   => $gateway->label(),
        'plugin'    => $gateway->getPluginId(),
        'mode'      => $gateway->getPlugin()->getMode(),
        'completed' => count($completed_ids),
        'pending'   => count($pending_ids),
        'refunded'  => count($refunded_ids),
        'total'     => '$' . $total . ' ' . $currency,
      ];
    }

    $header = [
      $this->t('Gateway'),
      $this->t('Plugin'),
      $this->t('Mode'),
      $this->t('Completed'),
      $this->t('Pending'),
      $this->t('Refunded'),
      $this->t('Total Revenue'),
    ];

    $rows = [];
    foreach ($summary as $item) {
      $rows[] = [
        $item['gateway'],
        $item['plugin'],
        strtoupper($item['mode']),
        $item['completed'],
        $item['pending'],
        $item['refunded'],
        $item['total'],
      ];
    }

    return [
      '#type'       => 'table',
      '#header'     => $header,
      '#rows'       => $rows,
      '#empty'      => $this->t('No payment activity recorded.'),
      '#attributes' => ['class' => ['payment-dashboard-table']],
      '#cache'      => ['max-age' => 60],
    ];
  }

}

<?php

namespace Drupal\budhound_api\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller for report endpoints.
 */
class ReportController extends BudhoundControllerBase {

  /**
   * Returns sales report data for the user's store.
   */
  public function sales(Request $request): JsonResponse {
    if ($denied = $this->checkPermission('view sales reports')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $end_date = $request->query->get('end', date('Y-m-d'));
    $start_date = $request->query->get('start', date('Y-m-d', strtotime('-30 days')));
    $group_by = $request->query->get('group_by', 'day');

    $allowed_groups = ['day', 'week', 'month'];
    if (!in_array($group_by, $allowed_groups)) {
      $group_by = 'day';
    }

    try {
      $start = new \DateTime($start_date);
      $end = new \DateTime($end_date);
    }
    catch (\Exception $e) {
      return new JsonResponse(['error' => 'Invalid date format. Use Y-m-d.'], 400);
    }

    $start->setTime(0, 0, 0);
    $end->setTime(23, 59, 59);

    $order_storage = $this->entityTypeManager()->getStorage('commerce_order');
    $query = $order_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('store_id', $store_id)
      ->condition('placed', $start->getTimestamp(), '>=')
      ->condition('placed', $end->getTimestamp(), '<=')
      ->condition('state', ['completed', 'delivered'], 'IN');
    $order_ids = $query->execute();

    $orders = $order_storage->loadMultiple($order_ids);

    $periods = [];
    $total_revenue = 0;
    $total_orders = 0;
    $product_sales = [];

    foreach ($orders as $order) {
      $placed = $order->getPlacedTime();
      $amount = (float) $order->getTotalPrice()?->getNumber() ?? 0;

      $period_key = $this->getPeriodKey($placed, $group_by);

      if (!isset($periods[$period_key])) {
        $periods[$period_key] = [
          'period' => $period_key,
          'revenue' => 0,
          'order_count' => 0,
        ];
      }

      $periods[$period_key]['revenue'] += $amount;
      $periods[$period_key]['order_count']++;
      $total_revenue += $amount;
      $total_orders++;

      foreach ($order->getItems() as $item) {
        $title = $item->getTitle();
        $qty = (int) $item->getQuantity();
        $item_total = (float) $item->getTotalPrice()?->getNumber() ?? 0;

        if (!isset($product_sales[$title])) {
          $product_sales[$title] = ['title' => $title, 'quantity' => 0, 'revenue' => 0];
        }
        $product_sales[$title]['quantity'] += $qty;
        $product_sales[$title]['revenue'] += $item_total;
      }
    }

    ksort($periods);

    usort($product_sales, function ($a, $b) {
      return $b['revenue'] <=> $a['revenue'];
    });
    $top_products = array_slice($product_sales, 0, 10);

    foreach ($periods as &$period) {
      $period['revenue'] = round($period['revenue'], 2);
    }
    foreach ($top_products as &$product) {
      $product['revenue'] = round($product['revenue'], 2);
    }

    return new JsonResponse([
      'store_id' => $store_id,
      'start_date' => $start_date,
      'end_date' => $end_date,
      'group_by' => $group_by,
      'summary' => [
        'total_revenue' => round($total_revenue, 2),
        'total_orders' => $total_orders,
        'average_order_value' => $total_orders > 0 ? round($total_revenue / $total_orders, 2) : 0,
      ],
      'periods' => array_values($periods),
      'top_products' => $top_products,
    ]);
  }

  /**
   * Returns tax report data for the user's store.
   */
  public function tax(Request $request): JsonResponse {
    if ($denied = $this->checkPermission('view tax reports')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $end_date = $request->query->get('end', date('Y-m-d'));
    $start_date = $request->query->get('start', date('Y-m-01'));

    try {
      $start = new \DateTime($start_date);
      $end = new \DateTime($end_date);
    }
    catch (\Exception $e) {
      return new JsonResponse(['error' => 'Invalid date format. Use Y-m-d.'], 400);
    }

    $start->setTime(0, 0, 0);
    $end->setTime(23, 59, 59);

    $order_storage = $this->entityTypeManager()->getStorage('commerce_order');
    $query = $order_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('store_id', $store_id)
      ->condition('placed', $start->getTimestamp(), '>=')
      ->condition('placed', $end->getTimestamp(), '<=')
      ->condition('state', ['completed', 'delivered'], 'IN');
    $order_ids = $query->execute();

    $orders = $order_storage->loadMultiple($order_ids);

    $total_sales = 0;
    $total_tax = 0;
    $tax_breakdown = [];
    $order_count = 0;

    foreach ($orders as $order) {
      $order_total = (float) $order->getTotalPrice()?->getNumber() ?? 0;
      $total_sales += $order_total;
      $order_count++;

      foreach ($order->getItems() as $item) {
        foreach ($item->getAdjustments(['tax']) as $adjustment) {
          $tax_amount = (float) $adjustment->getAmount()->getNumber();
          $tax_type = $adjustment->getLabel() ?: 'Sales Tax';
          $total_tax += $tax_amount;

          if (!isset($tax_breakdown[(string) $tax_type])) {
            $tax_breakdown[(string) $tax_type] = 0;
          }
          $tax_breakdown[(string) $tax_type] += $tax_amount;
        }
      }
    }

    $formatted_breakdown = [];
    foreach ($tax_breakdown as $type => $amount) {
      $formatted_breakdown[] = [
        'tax_type' => $type,
        'amount' => round($amount, 2),
      ];
    }

    $state_api = \Drupal::state();
    $refund_key = 'budhound_refunds.' . $store_id;
    $all_refunds = $state_api->get($refund_key, []);
    $period_refunds = array_filter($all_refunds, function ($refund) use ($start, $end) {
      return $refund['created'] >= $start->getTimestamp() && $refund['created'] <= $end->getTimestamp();
    });
    $total_refunds = array_sum(array_column($period_refunds, 'amount'));

    return new JsonResponse([
      'store_id' => $store_id,
      'start_date' => $start_date,
      'end_date' => $end_date,
      'summary' => [
        'gross_sales' => round($total_sales, 2),
        'total_tax_collected' => round($total_tax, 2),
        'total_refunds' => round($total_refunds, 2),
        'net_sales' => round($total_sales - $total_refunds, 2),
        'order_count' => $order_count,
      ],
      'tax_breakdown' => $formatted_breakdown,
    ]);
  }

  /**
   * Returns a period key for grouping based on a timestamp.
   */
  protected function getPeriodKey(int $timestamp, string $group_by): string {
    switch ($group_by) {
      case 'week':
        return date('o-\WW', $timestamp);
      case 'month':
        return date('Y-m', $timestamp);
      default:
        return date('Y-m-d', $timestamp);
    }
  }

}

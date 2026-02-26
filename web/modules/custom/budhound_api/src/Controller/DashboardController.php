<?php

namespace Drupal\budhound_api\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller for /api/budhound/dashboard endpoint.
 *
 * Returns dashboard statistics scoped to the user's assigned store.
 * Budtender role receives a limited data set (no revenue or averages).
 */
class DashboardController extends BudhoundControllerBase {

  /**
   * Returns dashboard stats for the current user's store.
   */
  public function stats(Request $request): JsonResponse {
    if ($denied = $this->checkPermission('view store dashboard')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $range = $request->query->get('range', 'today');
    $allowed_ranges = ['today', 'week', 'month'];
    if (!in_array($range, $allowed_ranges)) {
      $range = 'today';
    }

    // Calculate date range boundaries.
    $now = new \DateTime();
    switch ($range) {
      case 'week':
        $start = (clone $now)->modify('monday this week')->setTime(0, 0, 0);
        break;

      case 'month':
        $start = (clone $now)->modify('first day of this month')->setTime(0, 0, 0);
        break;

      default:
        $start = (clone $now)->setTime(0, 0, 0);
        break;
    }

    $start_timestamp = $start->getTimestamp();
    $end_timestamp = $now->getTimestamp();

    // Query orders for this store within date range.
    $order_storage = $this->entityTypeManager()->getStorage('commerce_order');
    $query = $order_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('store_id', $store_id)
      ->condition('placed', $start_timestamp, '>=')
      ->condition('placed', $end_timestamp, '<=');
    $order_ids = $query->execute();

    $orders = $order_storage->loadMultiple($order_ids);

    $total_revenue = 0;
    $order_count = count($orders);
    $status_breakdown = [];
    $product_counts = [];

    foreach ($orders as $order) {
      /** @var \Drupal\commerce_order\Entity\OrderInterface $order */
      $total = (float) $order->getTotalPrice()?->getNumber() ?? 0;
      $total_revenue += $total;

      $state = $order->getState()->getId();
      $status_breakdown[$state] = ($status_breakdown[$state] ?? 0) + 1;

      // Track top products.
      foreach ($order->getItems() as $item) {
        $title = $item->getTitle();
        $qty = (int) $item->getQuantity();
        $product_counts[$title] = ($product_counts[$title] ?? 0) + $qty;
      }
    }

    $avg = $order_count > 0 ? round($total_revenue / $order_count, 2) : 0;

    // Sort products by quantity sold, take top 5.
    arsort($product_counts);
    $top_products = [];
    $i = 0;
    foreach ($product_counts as $title => $qty) {
      if ($i >= 5) {
        break;
      }
      $top_products[] = ['title' => $title, 'quantity_sold' => $qty];
      $i++;
    }

    // Count low stock items (variations with field_stock_quantity <= 10).
    $variation_storage = $this->entityTypeManager()->getStorage('commerce_product_variation');
    $product_storage = $this->entityTypeManager()->getStorage('commerce_product');
    $store_products = $product_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('stores', $store_id)
      ->execute();

    $low_stock_count = 0;
    if (!empty($store_products)) {
      $store_variations = $variation_storage->getQuery()
        ->accessCheck(FALSE)
        ->condition('product_id', $store_products, 'IN')
        ->condition('field_stock_quantity', 10, '<=')
        ->exists('field_stock_quantity')
        ->execute();
      $low_stock_count = count($store_variations);
    }

    // Count pending deliveries.
    $pending_query = $order_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('store_id', $store_id)
      ->condition('state', ['fulfillment', 'out_for_delivery'], 'IN');
    $pending = count($pending_query->execute());

    // Role-based response filtering — check real user roles.
    $user = $this->loadRealUser();
    $is_budtender = $user && in_array('budtender', $user->getRoles());

    $response = [
      'period' => $range,
      'order_count' => $order_count,
      'orders_by_status' => $status_breakdown,
      'low_stock_alerts' => $low_stock_count,
      'pending_deliveries' => $pending,
    ];

    // Budtenders don't see revenue or averages.
    if (!$is_budtender) {
      $response['total_revenue'] = round($total_revenue, 2);
      $response['average_order_value'] = $avg;
      $response['top_products'] = $top_products;
    }
    else {
      $response['top_products'] = array_slice($top_products, 0, 3);
    }

    return new JsonResponse($response);
  }

}

<?php

namespace Drupal\budhound_api\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\budhound_store_access\Access\StoreAccessHandler;

/**
 * Controller for order management endpoints.
 */
class OrderController extends BudhoundControllerBase {

  const STATUS_TRANSITIONS = [
    'draft' => ['placed'],
    'placed' => ['processing', 'canceled'],
    'processing' => ['ready', 'canceled'],
    'ready' => ['out_for_delivery', 'pickup_ready', 'canceled'],
    'pickup_ready' => ['completed', 'canceled'],
    'out_for_delivery' => ['delivered', 'canceled'],
    'delivered' => ['completed', 'cod_pending', 'canceled'],
    'cod_pending' => ['completed', 'canceled'],
    'completed' => [],
    'canceled' => [],
  ];

  /**
   * Updates the status of an order.
   */
  public function updateStatus(int $order_id, Request $request): JsonResponse {
    if ($denied = $this->checkPermission('manage order status')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $order_storage = $this->entityTypeManager()->getStorage('commerce_order');
    $order = $order_storage->load($order_id);

    if (!$order) {
      return new JsonResponse(['error' => 'Order not found.'], 404);
    }

    if ((string) $order->getStoreId() !== $store_id) {
      return new JsonResponse(['error' => 'Order does not belong to your store.'], 403);
    }

    $data = json_decode($request->getContent(), TRUE);
    if (!$data || empty($data['status'])) {
      return new JsonResponse(['error' => 'Missing required field: status.'], 400);
    }

    $new_status = $data['status'];
    $current_status = $order->getState()->getId();

    $allowed = self::STATUS_TRANSITIONS[$current_status] ?? [];
    if (!in_array($new_status, $allowed)) {
      return new JsonResponse([
        'error' => "Invalid status transition from '{$current_status}' to '{$new_status}'.",
        'allowed_transitions' => $allowed,
      ], 400);
    }

    $order->getState()->applyTransitionById($this->getTransitionId($current_status, $new_status));
    $order->save();

    \Drupal::logger('budhound_api')->info('Order @id status changed from @old to @new by user @uid. Note: @note', [
      '@id' => $order_id,
      '@old' => $current_status,
      '@new' => $new_status,
      '@uid' => $this->currentUser()->id(),
      '@note' => $data['note'] ?? '',
    ]);

    return new JsonResponse([
      'success' => TRUE,
      'order_id' => $order_id,
      'previous_status' => $current_status,
      'new_status' => $new_status,
    ]);
  }

  /**
   * Assigns a delivery driver to an order.
   */
  public function assignDriver(int $order_id, Request $request): JsonResponse {
    if ($denied = $this->checkPermission('assign delivery driver')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $order_storage = $this->entityTypeManager()->getStorage('commerce_order');
    $order = $order_storage->load($order_id);

    if (!$order) {
      return new JsonResponse(['error' => 'Order not found.'], 404);
    }

    if ((string) $order->getStoreId() !== $store_id) {
      return new JsonResponse(['error' => 'Order does not belong to your store.'], 403);
    }

    $data = json_decode($request->getContent(), TRUE);
    if (!$data || empty($data['driver_id'])) {
      return new JsonResponse(['error' => 'Missing required field: driver_id.'], 400);
    }

    $driver_id = (int) $data['driver_id'];
    $user_storage = $this->entityTypeManager()->getStorage('user');
    $driver = $user_storage->load($driver_id);

    if (!$driver) {
      return new JsonResponse(['error' => 'Driver user not found.'], 404);
    }

    if (!$driver->isActive()) {
      return new JsonResponse(['error' => 'Driver account is not active.'], 400);
    }

    $driver_store_id = StoreAccessHandler::getUserStoreId($driver);
    if ($driver_store_id !== $store_id) {
      return new JsonResponse(['error' => 'Driver does not belong to your store.'], 403);
    }

    if ($order->hasField('field_assigned_driver')) {
      $order->set('field_assigned_driver', $driver_id);
      $order->save();
    }
    else {
      return new JsonResponse(['error' => 'Order entity does not have field_assigned_driver field.'], 500);
    }

    \Drupal::logger('budhound_api')->info('Driver @driver assigned to order @order by user @uid.', [
      '@driver' => $driver_id,
      '@order' => $order_id,
      '@uid' => $this->currentUser()->id(),
    ]);

    return new JsonResponse([
      'success' => TRUE,
      'order_id' => $order_id,
      'driver_id' => $driver_id,
      'driver_name' => $driver->getDisplayName(),
    ]);
  }

  /**
   * Processes a refund for an order.
   */
  public function refund(int $order_id, Request $request): JsonResponse {
    if ($denied = $this->checkPermission('process refunds')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $order_storage = $this->entityTypeManager()->getStorage('commerce_order');
    $order = $order_storage->load($order_id);

    if (!$order) {
      return new JsonResponse(['error' => 'Order not found.'], 404);
    }

    if ((string) $order->getStoreId() !== $store_id) {
      return new JsonResponse(['error' => 'Order does not belong to your store.'], 403);
    }

    $state = $order->getState()->getId();
    if (!in_array($state, ['completed', 'delivered'])) {
      return new JsonResponse([
        'error' => "Cannot refund order in '{$state}' state. Only completed or delivered orders can be refunded.",
      ], 400);
    }

    $data = json_decode($request->getContent(), TRUE);
    $reason = $data['reason'] ?? '';

    if (empty($reason)) {
      return new JsonResponse(['error' => 'A reason is required for refunds.'], 400);
    }

    $order_total = (float) $order->getTotalPrice()?->getNumber() ?? 0;
    $refund_amount = isset($data['amount']) ? (float) $data['amount'] : $order_total;

    if ($refund_amount <= 0) {
      return new JsonResponse(['error' => 'Refund amount must be positive.'], 400);
    }

    if ($refund_amount > $order_total) {
      return new JsonResponse([
        'error' => "Refund amount ({$refund_amount}) exceeds order total ({$order_total}).",
      ], 400);
    }

    $refund_record = [
      'order_id' => $order_id,
      'store_id' => $store_id,
      'amount' => $refund_amount,
      'currency_code' => $order->getTotalPrice()?->getCurrencyCode() ?? 'USD',
      'reason' => $reason,
      'is_full_refund' => $refund_amount >= $order_total,
      'processed_by' => $this->currentUser()->id(),
      'processed_by_name' => $this->loadRealUser()?->getDisplayName() ?? 'Unknown',
      'created' => \Drupal::time()->getRequestTime(),
    ];

    $state_api = \Drupal::state();
    $refund_key = 'budhound_refunds.' . $store_id;
    $existing_refunds = $state_api->get($refund_key, []);
    $existing_refunds[] = $refund_record;
    $state_api->set($refund_key, $existing_refunds);

    \Drupal::logger('budhound_api')->info('Refund of @amount processed for order @order by user @uid. Reason: @reason', [
      '@amount' => $refund_amount,
      '@order' => $order_id,
      '@uid' => $this->currentUser()->id(),
      '@reason' => $reason,
    ]);

    return new JsonResponse([
      'success' => TRUE,
      'order_id' => $order_id,
      'refund_amount' => $refund_amount,
      'currency_code' => $refund_record['currency_code'],
      'is_full_refund' => $refund_record['is_full_refund'],
      'order_total' => $order_total,
    ]);
  }

  /**
   * Determines the transition ID from current to new status.
   */
  protected function getTransitionId(string $from, string $to): string {
    $transition_map = [
      'draft_placed' => 'place',
      'placed_processing' => 'process',
      'placed_canceled' => 'cancel',
      'processing_ready' => 'ready',
      'processing_canceled' => 'cancel',
      'ready_out_for_delivery' => 'ship',
      'ready_pickup_ready' => 'pickup_ready',
      'ready_canceled' => 'cancel',
      'pickup_ready_completed' => 'complete',
      'pickup_ready_canceled' => 'cancel',
      'out_for_delivery_delivered' => 'deliver',
      'out_for_delivery_canceled' => 'cancel',
      'delivered_completed' => 'complete',
      'delivered_cod_pending' => 'await_cod',
      'delivered_canceled' => 'cancel',
      'cod_pending_completed' => 'cod_received',
      'cod_pending_canceled' => 'cancel',
    ];

    $key = $from . '_' . $to;
    return $transition_map[$key] ?? $to;
  }

  /**
   * Receives COD payment for an order.
   *
   * Marks the pending payment as received and transitions the order
   * from cod_pending to completed.
   */
  public function receivePayment(int $order_id, Request $request): JsonResponse {
    if ($denied = $this->checkPermission('manage order status')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $order_storage = $this->entityTypeManager()->getStorage('commerce_order');
    $order = $order_storage->load($order_id);

    if (!$order) {
      return new JsonResponse(['error' => 'Order not found.'], 404);
    }

    if ((string) $order->getStoreId() !== $store_id) {
      return new JsonResponse(['error' => 'Order does not belong to your store.'], 403);
    }

    $current_state = $order->getState()->getId();
    if ($current_state !== 'cod_pending') {
      return new JsonResponse([
        'error' => "Order is in '{$current_state}' state. Only cod_pending orders can receive payment.",
      ], 400);
    }

    // Find and complete the pending payment for this order.
    $payment_storage = $this->entityTypeManager()->getStorage('commerce_payment');
    $payments = $payment_storage->loadByProperties([
      'order_id' => $order_id,
      'state' => 'pending',
    ]);

    $payment_completed = FALSE;
    foreach ($payments as $payment) {
      $payment->setState('completed');
      $payment->save();
      $payment_completed = TRUE;
    }

    // Transition order to completed.
    $order->getState()->applyTransitionById('cod_received');
    $order->save();

    \Drupal::logger('budhound_api')->info('COD payment received for order @id by user @uid.', [
      '@id' => $order_id,
      '@uid' => $this->currentUser()->id(),
    ]);

    return new JsonResponse([
      'success' => TRUE,
      'order_id' => $order_id,
      'previous_status' => 'cod_pending',
      'new_status' => 'completed',
      'payment_completed' => $payment_completed,
    ]);
  }

}

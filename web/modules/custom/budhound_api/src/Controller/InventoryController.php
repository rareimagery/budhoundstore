<?php

namespace Drupal\budhound_api\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller for inventory adjustment and audit log endpoints.
 */
class InventoryController extends BudhoundControllerBase {

  const VALID_ADJUSTMENT_TYPES = [
    'received',
    'sold',
    'damaged',
    'returned',
    'correction',
  ];

  /**
   * Adjusts stock for a product variation.
   */
  public function adjust(int $product_variation_id, Request $request): JsonResponse {
    if ($denied = $this->checkPermission('manage store inventory')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $variation_storage = $this->entityTypeManager()->getStorage('commerce_product_variation');
    $variation = $variation_storage->load($product_variation_id);

    if (!$variation) {
      return new JsonResponse(['error' => 'Product variation not found.'], 404);
    }

    $product = $variation->getProduct();
    if (!$product) {
      return new JsonResponse(['error' => 'Product not found for this variation.'], 404);
    }

    $product_store_ids = array_column($product->get('stores')->getValue(), 'target_id');
    if (!in_array($store_id, $product_store_ids)) {
      return new JsonResponse(['error' => 'Product does not belong to your store.'], 403);
    }

    $data = json_decode($request->getContent(), TRUE);
    if (!$data) {
      return new JsonResponse(['error' => 'Invalid JSON body.'], 400);
    }

    $adjustment_type = $data['adjustment_type'] ?? NULL;
    $quantity = $data['quantity'] ?? NULL;
    $reason = $data['reason'] ?? '';

    if (!$adjustment_type || !in_array($adjustment_type, self::VALID_ADJUSTMENT_TYPES)) {
      return new JsonResponse([
        'error' => 'Invalid adjustment_type. Must be one of: ' . implode(', ', self::VALID_ADJUSTMENT_TYPES),
      ], 400);
    }

    if ($quantity === NULL || !is_numeric($quantity) || (int) $quantity === 0) {
      return new JsonResponse(['error' => 'quantity must be a non-zero integer.'], 400);
    }
    $quantity = (int) $quantity;

    $quantity_before = 0;
    if ($variation->hasField('field_stock_quantity') && !$variation->get('field_stock_quantity')->isEmpty()) {
      $quantity_before = (int) $variation->get('field_stock_quantity')->value;
    }

    $quantity_after = $quantity_before + $quantity;

    if ($quantity_after < 0) {
      return new JsonResponse([
        'error' => 'Adjustment would result in negative stock. Current stock: ' . $quantity_before,
      ], 400);
    }

    $variation->set('field_stock_quantity', $quantity_after);
    $variation->save();

    $log_entry = [
      'product_variation_id' => $product_variation_id,
      'store_id' => $store_id,
      'adjustment_type' => $adjustment_type,
      'quantity_change' => $quantity,
      'quantity_before' => $quantity_before,
      'quantity_after' => $quantity_after,
      'reason' => $reason,
      'performed_by' => $this->currentUser()->id(),
      'performed_by_name' => $this->loadRealUser()?->getDisplayName() ?? 'Unknown',
      'created' => \Drupal::time()->getRequestTime(),
    ];

    $state = \Drupal::state();
    $log_key = 'budhound_inventory_log.' . $store_id;
    $existing_log = $state->get($log_key, []);
    $existing_log[] = $log_entry;
    $state->set($log_key, $existing_log);

    $low_stock_threshold = 10;
    $low_stock_warning = NULL;
    if ($quantity_after <= $low_stock_threshold) {
      $low_stock_warning = "Low stock alert: {$variation->getTitle()} has only {$quantity_after} units remaining.";
      \Drupal::logger('budhound_api')->warning($low_stock_warning);
    }

    $response = [
      'success' => TRUE,
      'variation_id' => $product_variation_id,
      'title' => $variation->getTitle(),
      'adjustment_type' => $adjustment_type,
      'quantity_change' => $quantity,
      'quantity_before' => $quantity_before,
      'quantity_after' => $quantity_after,
    ];

    if ($low_stock_warning) {
      $response['low_stock_warning'] = $low_stock_warning;
    }

    return new JsonResponse($response);
  }

  /**
   * Returns the inventory audit log for the user's store.
   */
  public function auditLog(Request $request): JsonResponse {
    if ($denied = $this->checkPermission('view inventory audit log')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $page = max(0, (int) $request->query->get('page', 0));
    $limit = min(200, max(1, (int) $request->query->get('limit', 50)));
    $filter_variation_id = $request->query->get('variation_id');

    $state = \Drupal::state();
    $log_key = 'budhound_inventory_log.' . $store_id;
    $log = $state->get($log_key, []);

    if ($filter_variation_id) {
      $log = array_filter($log, function ($entry) use ($filter_variation_id) {
        return (string) $entry['product_variation_id'] === (string) $filter_variation_id;
      });
      $log = array_values($log);
    }

    usort($log, function ($a, $b) {
      return ($b['created'] ?? 0) - ($a['created'] ?? 0);
    });

    $total = count($log);
    $offset = $page * $limit;
    $entries = array_slice($log, $offset, $limit);

    return new JsonResponse([
      'total' => $total,
      'page' => $page,
      'limit' => $limit,
      'entries' => $entries,
    ]);
  }

}

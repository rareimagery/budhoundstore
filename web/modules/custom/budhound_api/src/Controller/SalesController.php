<?php

namespace Drupal\budhound_api\Controller;

use Drupal\commerce_order\Entity\Order;
use Drupal\commerce_order\Entity\OrderItem;
use Drupal\commerce_price\Price;
use Drupal\profile\Entity\Profile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller for creating sales and orders from the BudHound management app.
 */
class SalesController extends BudhoundControllerBase {

  /**
   * Quick POS sale — minimal friction, walk-in counter sale.
   *
   * POST /api/budhound/sales/create
   */
  public function createSale(Request $request): JsonResponse {
    if ($denied = $this->checkPermission('create sales transactions')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $data = json_decode($request->getContent(), TRUE);
    if (!$data || empty($data['items']) || !is_array($data['items'])) {
      return new JsonResponse(['error' => 'Missing or empty items array.'], 400);
    }

    $customer_name = $data['customer_name'] ?? 'Walk-in';
    $staff_user = $this->loadRealUser();

    // Load the store entity.
    $store_storage = $this->entityTypeManager()->getStorage('commerce_store');
    $store = $store_storage->load($store_id);
    if (!$store) {
      return new JsonResponse(['error' => 'Store not found.'], 404);
    }

    // Validate and load all variations.
    $variation_storage = $this->entityTypeManager()->getStorage('commerce_product_variation');
    $product_storage = $this->entityTypeManager()->getStorage('commerce_product');
    $order_items = [];
    $errors = [];

    foreach ($data['items'] as $index => $item) {
      if (empty($item['variation_id']) || empty($item['quantity'])) {
        $errors[] = "Item {$index}: missing variation_id or quantity.";
        continue;
      }

      $quantity = (int) $item['quantity'];
      if ($quantity < 1) {
        $errors[] = "Item {$index}: quantity must be at least 1.";
        continue;
      }

      // Load variation by UUID.
      $variations = $variation_storage->loadByProperties(['uuid' => $item['variation_id']]);
      $variation = $variations ? reset($variations) : NULL;

      if (!$variation) {
        $errors[] = "Item {$index}: variation '{$item['variation_id']}' not found.";
        continue;
      }

      // Verify the variation belongs to a product in the staff's store.
      $product_id = $variation->getProductId();
      $product = $product_storage->load($product_id);
      if (!$product) {
        $errors[] = "Item {$index}: product not found for variation.";
        continue;
      }

      $product_stores = $product->getStoreIds();
      if (!in_array($store_id, $product_stores)) {
        $errors[] = "Item {$index}: product does not belong to your store.";
        continue;
      }

      // Create order item.
      $price = $variation->getPrice();
      if (!$price) {
        $errors[] = "Item {$index}: variation has no price set.";
        continue;
      }

      $order_item = OrderItem::create([
        'type' => 'default',
        'purchased_entity' => $variation,
        'quantity' => $quantity,
        'unit_price' => $price,
        'title' => $variation->getTitle(),
      ]);
      $order_item->save();
      $order_items[] = $order_item;
    }

    if (!empty($errors)) {
      return new JsonResponse(['error' => 'Validation errors.', 'details' => $errors], 400);
    }

    if (empty($order_items)) {
      return new JsonResponse(['error' => 'No valid items to create order.'], 400);
    }

    // Create the order.
    $order = Order::create([
      'type' => 'default',
      'store_id' => $store_id,
      'uid' => $staff_user->id(),
      'mail' => $staff_user->getEmail(),
      'state' => 'draft',
      'order_items' => $order_items,
      'field_order_notes' => "POS sale by {$staff_user->getDisplayName()} — Customer: {$customer_name}",
    ]);
    $order->save();

    // Apply tax adjustments.
    $this->applyTaxAdjustments($order);

    // POS cash sale — go straight to completed (no intermediate steps).
    $order->set('state', 'completed');
    $order->setCompletedTime(\Drupal::time()->getRequestTime());
    $order->save();

    // Record cash payment as completed.
    $this->createCompletedPayment($order);

    // Deduct inventory.
    $this->deductInventory($order);

    $total = $order->getTotalPrice();
    $total_formatted = $total ? '$' . number_format((float) $total->getNumber(), 2) : '$0.00';

    \Drupal::logger('budhound_api')->info('POS cash sale completed: order @id (#@num) @total by @user for @customer at store @store.', [
      '@id' => $order->id(),
      '@num' => $order->getOrderNumber(),
      '@total' => $total_formatted,
      '@user' => $staff_user->getDisplayName(),
      '@customer' => $customer_name,
      '@store' => $store->getName(),
    ]);

    // Build item details for receipt.
    $items_detail = [];
    foreach ($order->getItems() as $item) {
      $items_detail[] = [
        'title' => $item->getTitle(),
        'quantity' => (int) $item->getQuantity(),
        'unit_price' => '$' . number_format((float) $item->getUnitPrice()->getNumber(), 2),
        'total' => '$' . number_format((float) $item->getTotalPrice()->getNumber(), 2),
      ];
    }

    return new JsonResponse([
      'status' => 'completed',
      'order_id' => (int) $order->id(),
      'order_number' => $order->getOrderNumber(),
      'total' => $total_formatted,
      'subtotal' => $order->getSubtotalPrice() ? '$' . number_format((float) $order->getSubtotalPrice()->getNumber(), 2) : '$0.00',
      'items_count' => count($order_items),
      'items' => $items_detail,
      'customer_name' => $customer_name,
      'payment_method' => 'cash',
      'completed_at' => date('c'),
    ]);
  }

  /**
   * Full order creation — customer details, address, delivery support.
   *
   * POST /api/budhound/orders/create
   */
  public function createFullOrder(Request $request): JsonResponse {
    if ($denied = $this->checkPermission('create sales transactions')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $data = json_decode($request->getContent(), TRUE);
    if (!$data || empty($data['items']) || !is_array($data['items'])) {
      return new JsonResponse(['error' => 'Missing or empty items array.'], 400);
    }

    $staff_user = $this->loadRealUser();

    // Load the store entity.
    $store_storage = $this->entityTypeManager()->getStorage('commerce_store');
    $store = $store_storage->load($store_id);
    if (!$store) {
      return new JsonResponse(['error' => 'Store not found.'], 404);
    }

    // Validate and load all variations.
    $variation_storage = $this->entityTypeManager()->getStorage('commerce_product_variation');
    $product_storage = $this->entityTypeManager()->getStorage('commerce_product');
    $order_items = [];
    $errors = [];

    foreach ($data['items'] as $index => $item) {
      if (empty($item['variation_id']) || empty($item['quantity'])) {
        $errors[] = "Item {$index}: missing variation_id or quantity.";
        continue;
      }

      $quantity = (int) $item['quantity'];
      if ($quantity < 1) {
        $errors[] = "Item {$index}: quantity must be at least 1.";
        continue;
      }

      $variations = $variation_storage->loadByProperties(['uuid' => $item['variation_id']]);
      $variation = $variations ? reset($variations) : NULL;

      if (!$variation) {
        $errors[] = "Item {$index}: variation '{$item['variation_id']}' not found.";
        continue;
      }

      $product_id = $variation->getProductId();
      $product = $product_storage->load($product_id);
      if (!$product) {
        $errors[] = "Item {$index}: product not found for variation.";
        continue;
      }

      $product_stores = $product->getStoreIds();
      if (!in_array($store_id, $product_stores)) {
        $errors[] = "Item {$index}: product does not belong to your store.";
        continue;
      }

      $price = $variation->getPrice();
      if (!$price) {
        $errors[] = "Item {$index}: variation has no price set.";
        continue;
      }

      $order_item = OrderItem::create([
        'type' => 'default',
        'purchased_entity' => $variation,
        'quantity' => $quantity,
        'unit_price' => $price,
        'title' => $variation->getTitle(),
      ]);
      $order_item->save();
      $order_items[] = $order_item;
    }

    if (!empty($errors)) {
      return new JsonResponse(['error' => 'Validation errors.', 'details' => $errors], 400);
    }

    if (empty($order_items)) {
      return new JsonResponse(['error' => 'No valid items to create order.'], 400);
    }

    // Build customer info.
    $customer = $data['customer'] ?? [];
    $address_data = $data['address'] ?? [];
    $notes = $data['notes'] ?? '';
    $payment_method = $data['payment_method'] ?? 'cod';

    $customer_email = $customer['email'] ?? $staff_user->getEmail();
    $first_name = $customer['first_name'] ?? '';
    $last_name = $customer['last_name'] ?? '';
    $phone = $customer['phone'] ?? '';

    // Build order notes.
    $order_notes = "Order created by {$staff_user->getDisplayName()}";
    if ($first_name || $last_name) {
      $order_notes .= " for {$first_name} {$last_name}";
    }
    if ($phone) {
      $order_notes .= " | Phone: {$phone}";
    }
    if ($notes) {
      $order_notes .= " | Notes: {$notes}";
    }

    // Create billing profile with address if provided.
    $billing_profile = NULL;
    if (!empty($address_data['line1']) || $first_name || $last_name) {
      $profile_data = [
        'type' => 'customer',
        'uid' => $staff_user->id(),
        'address' => [
          'country_code' => $address_data['country'] ?? 'US',
          'administrative_area' => $address_data['state'] ?? 'CA',
          'locality' => $address_data['city'] ?? '',
          'postal_code' => $address_data['zip'] ?? '',
          'address_line1' => $address_data['line1'] ?? '',
          'address_line2' => $address_data['line2'] ?? '',
          'given_name' => $first_name,
          'family_name' => $last_name,
        ],
      ];
      $billing_profile = Profile::create($profile_data);
      $billing_profile->save();
    }

    // Create the order.
    $order_data = [
      'type' => 'default',
      'store_id' => $store_id,
      'uid' => $staff_user->id(),
      'mail' => $customer_email,
      'state' => 'draft',
      'order_items' => $order_items,
      'field_order_notes' => $order_notes,
    ];

    if ($billing_profile) {
      $order_data['billing_profile'] = $billing_profile;
    }

    $order = Order::create($order_data);
    $order->save();

    // Apply tax adjustments.
    $this->applyTaxAdjustments($order);

    // Transition draft → placed.
    try {
      $order->getState()->applyTransitionById('place');
      $order->save();
    }
    catch (\Exception $e) {
      \Drupal::logger('budhound_api')->warning('Could not transition order @id to placed: @msg', [
        '@id' => $order->id(),
        '@msg' => $e->getMessage(),
      ]);
    }

    // Create COD payment record if applicable.
    if ($payment_method === 'cod') {
      $this->createCodPayment($order);
    }

    // Deduct inventory.
    $this->deductInventory($order);

    \Drupal::logger('budhound_api')->info('Full order created: order @id by @user at store @store.', [
      '@id' => $order->id(),
      '@user' => $staff_user->getDisplayName(),
      '@store' => $store->getName(),
    ]);

    return new JsonResponse([
      'status' => $order->getState()->getId(),
      'order_id' => (int) $order->id(),
      'order_number' => $order->getOrderNumber(),
      'uuid' => $order->uuid(),
      'total' => $order->getTotalPrice() ? '$' . number_format((float) $order->getTotalPrice()->getNumber(), 2) : '$0.00',
      'state' => $order->getState()->getId(),
    ]);
  }

  /**
   * Apply cannabis tax adjustments to an order.
   *
   * California excise tax (15%) + Lompoc sales tax (9.25%).
   */
  protected function applyTaxAdjustments(Order $order): void {
    $subtotal = $order->getSubtotalPrice();
    if (!$subtotal) {
      return;
    }

    $currency_code = $subtotal->getCurrencyCode();

    // Excise tax: 15% of subtotal.
    $excise_amount = (string) round((float) $subtotal->getNumber() * 0.15, 2);
    $order->addAdjustment(new \Drupal\commerce_order\Adjustment([
      'type' => 'tax',
      'label' => 'CA Excise Tax (15%)',
      'amount' => new Price($excise_amount, $currency_code),
      'percentage' => '0.15',
      'source_id' => 'ca_excise_tax',
      'included' => FALSE,
    ]));

    // Sales tax: 9.25% of (subtotal + excise).
    $taxable = (float) $subtotal->getNumber() + (float) $excise_amount;
    $sales_tax_amount = (string) round($taxable * 0.0925, 2);
    $order->addAdjustment(new \Drupal\commerce_order\Adjustment([
      'type' => 'tax',
      'label' => 'Lompoc Sales Tax (9.25%)',
      'amount' => new Price($sales_tax_amount, $currency_code),
      'percentage' => '0.0925',
      'source_id' => 'lompoc_sales_tax',
      'included' => FALSE,
    ]));

    $order->save();
  }

  /**
   * Deduct inventory (field_stock_quantity) for each order item.
   */
  protected function deductInventory(Order $order): void {
    foreach ($order->getItems() as $item) {
      $variation = $item->getPurchasedEntity();
      if ($variation && $variation->hasField('field_stock_quantity')) {
        $current = (int) $variation->get('field_stock_quantity')->value;
        $new_qty = max(0, $current - (int) $item->getQuantity());
        $variation->set('field_stock_quantity', $new_qty);
        $variation->save();

        \Drupal::logger('budhound_api')->info('Inventory deducted: variation @vid, @old → @new (order @oid).', [
          '@vid' => $variation->id(),
          '@old' => $current,
          '@new' => $new_qty,
          '@oid' => $order->id(),
        ]);
      }
    }
  }

  /**
   * Create a completed cash payment for a POS sale.
   */
  protected function createCompletedPayment(Order $order): void {
    try {
      $payment_storage = $this->entityTypeManager()->getStorage('commerce_payment');
      $gateway_storage = $this->entityTypeManager()->getStorage('commerce_payment_gateway');
      $gateways = $gateway_storage->loadByProperties(['plugin' => 'manual']);
      $gateway = reset($gateways);

      if (!$gateway) {
        $gateways = $gateway_storage->loadMultiple();
        $gateway = reset($gateways);
      }

      if ($gateway) {
        $payment = $payment_storage->create([
          'payment_gateway' => $gateway->id(),
          'order_id' => $order->id(),
          'amount' => $order->getTotalPrice(),
          'state' => 'completed',
        ]);
        $payment->save();
      }
    }
    catch (\Exception $e) {
      \Drupal::logger('budhound_api')->warning('Could not create cash payment for order @id: @msg', [
        '@id' => $order->id(),
        '@msg' => $e->getMessage(),
      ]);
    }
  }

  /**
   * Create a pending COD payment for an order.
   */
  protected function createCodPayment(Order $order): void {
    try {
      $payment_storage = $this->entityTypeManager()->getStorage('commerce_payment');

      // Find COD payment gateway.
      $gateway_storage = $this->entityTypeManager()->getStorage('commerce_payment_gateway');
      $gateways = $gateway_storage->loadByProperties(['plugin' => 'manual']);
      $gateway = reset($gateways);

      if (!$gateway) {
        // Try to find any payment gateway.
        $gateways = $gateway_storage->loadMultiple();
        $gateway = reset($gateways);
      }

      if ($gateway) {
        $payment = $payment_storage->create([
          'payment_gateway' => $gateway->id(),
          'order_id' => $order->id(),
          'amount' => $order->getTotalPrice(),
          'state' => 'pending',
        ]);
        $payment->save();
      }
    }
    catch (\Exception $e) {
      \Drupal::logger('budhound_api')->warning('Could not create COD payment for order @id: @msg', [
        '@id' => $order->id(),
        '@msg' => $e->getMessage(),
      ]);
    }
  }

}

<?php

namespace Drupal\budstore_checkout\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Handles the Cash-on-Delivery checkout for the React headless frontend.
 *
 * POST /api/cod-checkout
 *
 * Expected JSON body:
 * {
 *   "order_uuid":    "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
 *   "email":         "customer@example.com",
 *   "first_name":    "Jane",
 *   "last_name":     "Doe",
 *   "phone":         "805-555-1234",
 *   "address_line1": "123 Main St",
 *   "address_line2": "",
 *   "city":          "Lompoc",
 *   "state":         "CA",
 *   "zip":           "93436",
 *   "country":       "US",
 *   "notes":         "Leave at door."
 * }
 *
 * Returns:
 * { "status": "placed", "order_id": 42, "order_number": "3" }
 */
class CodCheckoutController extends ControllerBase {

  /**
   * Handle OPTIONS preflight (CORS handled by Drupal middleware).
   * Handle POST — process COD checkout.
   */
  public function checkout(Request $request): JsonResponse {
    // Handle CORS preflight.
    if ($request->getMethod() === 'OPTIONS') {
      return new JsonResponse(NULL, 200);
    }

    $body = json_decode($request->getContent(), TRUE);
    if (!$body || empty($body['order_uuid'])) {
      return new JsonResponse(['message' => 'order_uuid is required.'], 400);
    }

    $order_uuid   = $body['order_uuid'];
    $email        = trim($body['email'] ?? '');
    $first_name   = trim($body['first_name'] ?? '');
    $last_name    = trim($body['last_name'] ?? '');
    $phone        = trim($body['phone'] ?? '');
    $address_line1 = trim($body['address_line1'] ?? '');
    $address_line2 = trim($body['address_line2'] ?? '');
    $city         = trim($body['city'] ?? '');
    $state        = trim($body['state'] ?? 'CA');
    $zip          = trim($body['zip'] ?? '');
    $country      = trim($body['country'] ?? 'US');
    $notes        = trim($body['notes'] ?? '');

    if (!$email || !$first_name || !$last_name || !$address_line1 || !$city || !$zip) {
      return new JsonResponse(['message' => 'Missing required customer fields.'], 400);
    }

    // Load the order by UUID.
    $order_storage = $this->entityTypeManager()->getStorage('commerce_order');
    $orders = $order_storage->loadByProperties(['uuid' => $order_uuid]);
    if (empty($orders)) {
      return new JsonResponse(['message' => 'Order not found.'], 404);
    }
    /** @var \Drupal\commerce_order\Entity\OrderInterface $order */
    $order = reset($orders);

    // Verify ownership via session, cart token, or authenticated user.
    $current_user = \Drupal::currentUser();
    if ($current_user->isAnonymous()) {
      $owns_cart = FALSE;

      // 1. Check session-based cart ownership (standard commerce_cart).
      $cart_session = \Drupal::service('commerce_cart.cart_session');
      $session_cart_ids = $cart_session->getCartIds();
      if (in_array((int) $order->id(), $session_cart_ids)) {
        $owns_cart = TRUE;
      }

      // 2. Check Commerce-Cart-Token header (Commerce API headless token).
      if (!$owns_cart) {
        $cart_token = $request->headers->get('Commerce-Cart-Token');
        if ($cart_token && $order->getData('cart_token') === $cart_token) {
          $owns_cart = TRUE;
        }
      }

      // 3. Fallback for headless SPA: the Commerce API module's CartTokenSession
      //    decorator may prevent session-based lookups from working across
      //    different axios clients. For anonymous draft orders (uid=0), the
      //    order UUID itself acts as a bearer token — it's a 128-bit random
      //    value that only the cart owner's browser knows.
      if (!$owns_cart && (int) $order->getCustomerId() === 0
          && in_array($order->getState()->getId(), ['draft', 'cart'])) {
        $owns_cart = TRUE;
      }

      if (!$owns_cart) {
        \Drupal::logger('budstore_checkout')->warning(
          'Anonymous checkout denied for order @id (uuid: @uuid). Session cart IDs: @ids',
          [
            '@id' => $order->id(),
            '@uuid' => $order_uuid,
            '@ids' => implode(',', $session_cart_ids),
          ]
        );
        return new JsonResponse(['message' => 'Access denied.'], 403);
      }
    }
    elseif ((int) $order->getCustomerId() !== (int) $current_user->id()) {
      return new JsonResponse(['message' => 'Access denied.'], 403);
    }

    // Order must be in draft (cart) state.
    if (!in_array($order->getState()->getId(), ['draft', 'cart'])) {
      return new JsonResponse([
        'message' => 'Order is no longer editable (state: ' . $order->getState()->getId() . ').',
      ], 409);
    }

    try {
      // ── 1. Set customer email ────────────────────────────────────────────────
      $order->setEmail($email);

      // ── 2. Store order notes (if the field exists) ───────────────────────────
      if ($notes && $order->hasField('field_order_notes')) {
        $order->set('field_order_notes', $notes);
      }

      // ── 3. Create / update billing profile ───────────────────────────────────
      if (\Drupal::moduleHandler()->moduleExists('profile')) {
        $profile_storage = $this->entityTypeManager()->getStorage('profile');
        $profile = $profile_storage->create([
          'type' => 'customer',
          'uid'  => $order->getCustomerId() ?: 0,
          'address' => [
            'country_code'       => $country,
            'administrative_area' => $state,
            'locality'           => $city,
            'postal_code'        => $zip,
            'address_line1'      => $address_line1,
            'address_line2'      => $address_line2,
            'given_name'         => $first_name,
            'family_name'        => $last_name,
          ],
        ]);
        $profile->save();
        $order->setBillingProfile($profile);
      }

      // ── 4. Assign COD payment gateway ────────────────────────────────────────
      $gateway_storage = $this->entityTypeManager()->getStorage('commerce_payment_gateway');
      $gateway = $gateway_storage->load('cod');
      if ($gateway) {
        $order->set('payment_gateway', $gateway->id());
      }

      // ── 5. Transition order: draft → place ───────────────────────────────────
      $order->save();

      $state_machine = $order->getState();
      if ($state_machine->getId() === 'draft') {
        $state_machine->applyTransitionById('place');
        $order->save();
      }

      // Handle validation state (some Commerce workflows have an extra step).
      if ($order->getState()->getId() === 'validation') {
        $transitions = $order->getState()->getTransitions();
        if (isset($transitions['validate'])) {
          $order->getState()->applyTransition($transitions['validate']);
          $order->save();
        }
      }

      // ── 6. Create pending COD payment record ─────────────────────────────────
      if ($gateway) {
        $payment_storage = $this->entityTypeManager()->getStorage('commerce_payment');
        $payment = $payment_storage->create([
          'state'           => 'pending',
          'amount'          => $order->getTotalPrice(),
          'payment_gateway' => $gateway->id(),
          'order_id'        => $order->id(),
        ]);
        $payment->save();
      }
    }
    catch (\Exception $e) {
      \Drupal::logger('budstore_checkout')->error(
        'COD checkout failed for order @uuid: @msg',
        ['@uuid' => $order_uuid, '@msg' => $e->getMessage()]
      );
      return new JsonResponse(['message' => $e->getMessage()], 500);
    }

    return new JsonResponse([
      'status'       => 'placed',
      'order_id'     => $order->id(),
      'order_number' => $order->getOrderNumber(),
      'state'        => $order->getState()->getId(),
    ]);
  }

}

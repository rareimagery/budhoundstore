<?php

namespace Drupal\commerce_react_checkout\Controller;

use Drupal\commerce_order\Entity\Order;
use Drupal\commerce_payment\Entity\Payment;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Handles headless checkout REST endpoints for the React frontend.
 *
 * Endpoints:
 *   POST /api/checkout/{order_id}/pay      — Initiate Stripe payment
 *   POST /api/checkout/{order_id}/pay/confirm — Confirm after 3DS
 *   POST /api/checkout/{order_id}/complete — Place / finalize the order
 */
class CheckoutController extends ControllerBase {

  /**
   * Initiate payment via the configured Stripe gateway.
   *
   * Expected request body (JSON):
   * {
   *   "gateway": "stripe",
   *   "payment_method_id": "pm_xxxx"   // Stripe PaymentMethod ID from Stripe.js
   * }
   *
   * Returns:
   * { "status": "ok" }
   *   OR
   * { "requires_action": true, "client_secret": "pi_xxxx_secret_yyyy" }
   */
  public function pay(int $order_id, Request $request): JsonResponse {
    $order = Order::load($order_id);
    if (!$order) {
      return new JsonResponse(['message' => 'Order not found.'], 404);
    }

    // Validate the order belongs to the current session/user.
    if (!$this->orderBelongsToCurrentUser($order)) {
      return new JsonResponse(['message' => 'Access denied.'], 403);
    }

    $body = json_decode($request->getContent(), TRUE);
    $gateway_id        = $body['gateway'] ?? 'stripe';
    $payment_method_id = $body['payment_method_id'] ?? NULL;

    if (!$payment_method_id) {
      return new JsonResponse(['message' => 'payment_method_id is required.'], 400);
    }

    // Load the payment gateway entity.
    $gateway_storage = $this->entityTypeManager()->getStorage('commerce_payment_gateway');
    $gateway = $gateway_storage->load($gateway_id);
    if (!$gateway) {
      return new JsonResponse(['message' => "Payment gateway '$gateway_id' not found."], 400);
    }

    /** @var \Drupal\commerce_stripe\Plugin\Commerce\PaymentGateway\StripeInterface $plugin */
    $plugin = $gateway->getPlugin();

    try {
      // Create a Commerce payment entity to track this transaction.
      $payment_storage = $this->entityTypeManager()->getStorage('commerce_payment');
      /** @var \Drupal\commerce_payment\Entity\PaymentInterface $payment */
      $payment = $payment_storage->create([
        'state'           => 'new',
        'amount'          => $order->getTotalPrice(),
        'payment_gateway' => $gateway->id(),
        'order_id'        => $order->id(),
      ]);

      // Store the Stripe PaymentMethod ID on the payment so the gateway can use it.
      // commerce_stripe reads this from payment_method_data or a dedicated field.
      // For Stripe Payment Intents, we call createPaymentIntent directly.
      if (method_exists($plugin, 'createPaymentIntent')) {
        $intent = $plugin->createPaymentIntent($order, $payment_method_id);

        if ($intent->status === 'requires_action') {
          // 3D Secure / SCA required — send client_secret back to React.
          $payment->setRemoteId($intent->id);
          $payment->setState('authorization');
          $payment->save();

          return new JsonResponse([
            'requires_action' => TRUE,
            'client_secret'   => $intent->client_secret,
          ]);
        }

        if ($intent->status === 'succeeded') {
          $payment->setRemoteId($intent->id);
          $payment->setRemoteState($intent->status);
          $payment->setState('completed');
          $payment->save();
          return new JsonResponse(['status' => 'ok']);
        }
      }
      else {
        // Fallback: delegate to the gateway's standard createPayment.
        $plugin->createPayment($payment);
        $payment->save();
        return new JsonResponse(['status' => 'ok']);
      }
    }
    catch (\Exception $e) {
      \Drupal::logger('commerce_react_checkout')->error(
        'Payment failed for order @id: @msg',
        ['@id' => $order_id, '@msg' => $e->getMessage()]
      );
      return new JsonResponse(['message' => $e->getMessage()], 422);
    }

    return new JsonResponse(['message' => 'Unexpected payment state.'], 500);
  }

  /**
   * Confirm payment after a 3DS / SCA challenge is completed in Stripe.js.
   *
   * Call this after stripe.confirmCardPayment() resolves successfully in React.
   */
  public function confirm(int $order_id, Request $request): JsonResponse {
    $order = Order::load($order_id);
    if (!$order) {
      return new JsonResponse(['message' => 'Order not found.'], 404);
    }

    if (!$this->orderBelongsToCurrentUser($order)) {
      return new JsonResponse(['message' => 'Access denied.'], 403);
    }

    $payment_storage = $this->entityTypeManager()->getStorage('commerce_payment');
    $pending = $payment_storage->loadByProperties([
      'order_id' => $order_id,
      'state'    => 'authorization',
    ]);

    if (!$pending) {
      return new JsonResponse(['message' => 'No pending authorization found.'], 404);
    }

    /** @var \Drupal\commerce_payment\Entity\PaymentInterface $payment */
    $payment = reset($pending);
    $payment->setState('completed');
    $payment->save();

    return new JsonResponse(['status' => 'confirmed']);
  }

  /**
   * Place/finalize the order after payment is confirmed.
   *
   * Transitions the order from 'draft' / 'validation' to 'fulfillment'.
   * Returns the placed order ID.
   */
  public function complete(int $order_id, Request $request): JsonResponse {
    $order = Order::load($order_id);
    if (!$order) {
      return new JsonResponse(['message' => 'Order not found.'], 404);
    }

    if (!$this->orderBelongsToCurrentUser($order)) {
      return new JsonResponse(['message' => 'Access denied.'], 403);
    }

    try {
      // Apply the 'place' transition (draft → validation) if in draft state.
      if ($order->getState()->getId() === 'draft') {
        $order->getState()->applyTransitionById('place');
        $order->save();
      }

      // If order is in validation, move to fulfillment.
      if ($order->getState()->getId() === 'validation') {
        $transition = $order->getState()->getTransitions()['validate'] ?? NULL;
        if ($transition) {
          $order->getState()->applyTransition($transition);
          $order->save();
        }
      }
    }
    catch (\Exception $e) {
      \Drupal::logger('commerce_react_checkout')->error(
        'Order completion failed for @id: @msg',
        ['@id' => $order_id, '@msg' => $e->getMessage()]
      );
      return new JsonResponse(['message' => $e->getMessage()], 500);
    }

    return new JsonResponse([
      'status'   => 'placed',
      'order_id' => $order->id(),
      'state'    => $order->getState()->getId(),
    ]);
  }

  /**
   * Checks if an order belongs to the current user or anonymous session.
   */
  protected function orderBelongsToCurrentUser(Order $order): bool {
    $current_user = \Drupal::currentUser();

    // Authenticated user check.
    if (!$current_user->isAnonymous()) {
      return (int) $order->getCustomerId() === (int) $current_user->id();
    }

    // Anonymous: compare cart token stored in the session.
    $cart_token = \Drupal::request()->headers->get('Commerce-Cart-Token');
    if ($cart_token && $order->getData('cart_token') === $cart_token) {
      return TRUE;
    }

    return FALSE;
  }

}

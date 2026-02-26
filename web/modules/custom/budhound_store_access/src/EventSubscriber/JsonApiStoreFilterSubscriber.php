<?php

namespace Drupal\budhound_store_access\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Drupal\budhound_store_access\Access\StoreAccessHandler;

/**
 * Injects store_id filter into JSON:API requests.
 */
class JsonApiStoreFilterSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    return [
      KernelEvents::REQUEST => ['onRequest', 100],
    ];
  }

  /**
   * Auto-inject store filter for commerce JSON:API requests.
   */
  public function onRequest(RequestEvent $event) {
    $request = $event->getRequest();
    $path = $request->getPathInfo();

    // Only apply to JSON:API routes.
    if (strpos($path, '/jsonapi/') !== 0) {
      return;
    }

    $current_user = \Drupal::currentUser();
    if ($current_user->isAnonymous()) {
      return;
    }

    // Skip for platform administrators.
    if ($current_user->hasPermission('administer commerce_store')) {
      return;
    }

    $store_id = StoreAccessHandler::getUserStoreId($current_user);
    if (!$store_id) {
      return;
    }

    // Auto-inject store filter for commerce entities.
    // Both orders (store_id) and products (stores) use entity references,
    // so JSON:API requires the condition filter format with full paths.
    // Product variations have no direct store field — filtered via product.
    $filter = $request->query->all('filter') ?: [];

    // Orders: store_id is an entity reference — must use condition filter.
    if (strpos($path, '/jsonapi/commerce_order/') !== FALSE ||
        str_ends_with($path, '/jsonapi/commerce_order')) {
      $filter['store_filter'] = [
        'condition' => [
          'path' => 'store_id.meta.drupal_internal__target_id',
          'value' => $store_id,
        ],
      ];
      $request->query->set('filter', $filter);
    }
    // Products: condition filter for stores entity reference.
    elseif (strpos($path, '/jsonapi/commerce_product/') !== FALSE ||
        str_ends_with($path, '/jsonapi/commerce_product')) {
      $filter['store_filter'] = [
        'condition' => [
          'path' => 'stores.meta.drupal_internal__target_id',
          'value' => $store_id,
        ],
      ];
      $request->query->set('filter', $filter);
    }
  }

}

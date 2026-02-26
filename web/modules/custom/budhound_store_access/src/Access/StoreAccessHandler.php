<?php

namespace Drupal\budhound_store_access\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Session\AccountInterface;

/**
 * Provides helper methods for store-scoped access checking.
 */
class StoreAccessHandler {

  /**
   * Get the store ID assigned to a user.
   */
  public static function getUserStoreId(AccountInterface $account): ?string {
    $user = \Drupal\user\Entity\User::load($account->id());
    if ($user && $user->hasField('field_assigned_store') && !$user->get('field_assigned_store')->isEmpty()) {
      return $user->get('field_assigned_store')->target_id;
    }
    return NULL;
  }

  /**
   * Check if user has access to a specific store's data.
   */
  public static function userCanAccessStore(AccountInterface $account, string $store_id): AccessResult {
    // Administrators bypass store checks.
    if ($account->hasPermission('administer commerce_store')) {
      return AccessResult::allowed()->cachePerUser();
    }

    $user_store_id = self::getUserStoreId($account);

    if ($user_store_id && $user_store_id === $store_id) {
      return AccessResult::allowed()->cachePerUser();
    }

    return AccessResult::forbidden('User does not belong to this store.')
      ->cachePerUser();
  }

}

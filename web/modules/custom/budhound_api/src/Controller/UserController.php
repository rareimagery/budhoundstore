<?php

namespace Drupal\budhound_api\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Controller for /api/budhound/me endpoint.
 *
 * Returns the current authenticated user's info including roles,
 * assigned store, and granted BudHound permissions.
 */
class UserController extends BudhoundControllerBase {

  /**
   * Returns current user info with roles, store, and permissions.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response with user data.
   */
  public function me(): JsonResponse {
    $user = $this->loadRealUser();
    if (!$user) {
      return new JsonResponse(['error' => 'Authentication required.'], 401);
    }

    $roles = $user->getRoles(TRUE); // Exclude 'authenticated'
    $store_id = $this->getCurrentStoreId();

    // Load store details if assigned.
    $store_data = NULL;
    if ($store_id) {
      $store = $this->entityTypeManager()->getStorage('commerce_store')->load($store_id);
      if ($store) {
        $store_data = [
          'id' => $store->id(),
          'name' => $store->getName(),
          'timezone' => $store->getTimezone(),
        ];
      }
    }

    // Collect all granted permissions for client-side checks.
    $all_permissions = [];
    $role_storage = $this->entityTypeManager()->getStorage('user_role');
    foreach ($roles as $role_id) {
      $role = $role_storage->load($role_id);
      if ($role) {
        $all_permissions = array_merge($all_permissions, $role->getPermissions());
      }
    }
    // Filter to only budhound-specific permissions.
    $bh_permissions = array_values(array_filter(array_unique($all_permissions), function ($perm) {
      return strpos($perm, 'view store') === 0 ||
             strpos($perm, 'manage store') === 0 ||
             strpos($perm, 'view own') === 0 ||
             strpos($perm, 'view all') === 0 ||
             strpos($perm, 'create sales') === 0 ||
             strpos($perm, 'process refund') === 0 ||
             strpos($perm, 'assign delivery') === 0 ||
             strpos($perm, 'manage order') === 0 ||
             strpos($perm, 'manage product') === 0 ||
             strpos($perm, 'view assigned') === 0 ||
             strpos($perm, 'view customer') === 0 ||
             strpos($perm, 'view sales') === 0 ||
             strpos($perm, 'view tax') === 0 ||
             strpos($perm, 'view inventory') === 0 ||
             strpos($perm, 'view compliance') === 0 ||
             strpos($perm, 'export report') === 0 ||
             strpos($perm, 'perform id') === 0;
    }));

    return new JsonResponse([
      'id' => $user->id(),
      'email' => $user->getEmail(),
      'name' => $user->getDisplayName(),
      'roles' => $roles,
      'store' => $store_data,
      'permissions' => $bh_permissions,
    ]);
  }

}

<?php

namespace Drupal\budhound_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Base controller for BudHound API endpoints.
 *
 * Provides permission checking against the real user entity
 * (not the OAuth2 token scopes) and consistent JSON error responses.
 */
abstract class BudhoundControllerBase extends ControllerBase {

  /**
   * Load the real user entity for the current authenticated user.
   *
   * Simple OAuth v6 replaces the session account's roles with token scopes.
   * Loading the actual User entity gives us the real roles for permission checks.
   */
  protected function loadRealUser(): ?User {
    $uid = $this->currentUser()->id();
    if (!$uid || $uid == 0) {
      return NULL;
    }
    return User::load($uid);
  }

  /**
   * Check a permission against the real user entity.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse|null
   *   A 403 JSON response if denied, or NULL if access is granted.
   */
  protected function checkPermission(string $permission): ?JsonResponse {
    $user = $this->loadRealUser();
    if (!$user) {
      return new JsonResponse(['error' => 'Authentication required.'], 401);
    }

    // Administrators bypass permission checks.
    if (in_array('administrator', $user->getRoles())) {
      return NULL;
    }

    // Check permission directly against role entities rather than
    // $user->hasPermission(), which may be affected by Simple OAuth v6
    // replacing the session account's roles with token scopes.
    $role_storage = $this->entityTypeManager()->getStorage('user_role');
    $has_permission = FALSE;
    foreach ($user->getRoles(TRUE) as $role_id) {
      $role = $role_storage->load($role_id);
      if ($role && in_array($permission, $role->getPermissions())) {
        $has_permission = TRUE;
        break;
      }
    }

    if (!$has_permission) {
      return new JsonResponse([
        'error' => 'Access denied.',
        'message' => "The '$permission' permission is required.",
      ], 403);
    }

    return NULL;
  }

  /**
   * Get the store ID for the current user.
   *
   * @return string|null
   *   The store ID, or NULL if no store is assigned.
   */
  protected function getCurrentStoreId(): ?string {
    $user = $this->loadRealUser();
    if ($user && $user->hasField('field_assigned_store') && !$user->get('field_assigned_store')->isEmpty()) {
      return $user->get('field_assigned_store')->target_id;
    }
    return NULL;
  }

  /**
   * Return a JSON error for missing store assignment.
   */
  protected function noStoreResponse(): JsonResponse {
    return new JsonResponse(['error' => 'No store assigned to user.'], 403);
  }

}

<?php

namespace Drupal\budhound_api\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\budhound_store_access\Access\StoreAccessHandler;

/**
 * Controller for staff management endpoints.
 */
class StaffController extends BudhoundControllerBase {

  const ASSIGNABLE_ROLES = [
    'store_owner',
    'store_manager',
    'budtender',
  ];

  /**
   * Returns a list of staff members for the user's store.
   */
  public function list(): JsonResponse {
    if ($denied = $this->checkPermission('view store staff')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $user_storage = $this->entityTypeManager()->getStorage('user');
    $query = $user_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('field_assigned_store', $store_id)
      ->condition('uid', 0, '>');
    $user_ids = $query->execute();

    $users = $user_storage->loadMultiple($user_ids);

    $staff = [];
    foreach ($users as $user) {
      $roles = $user->getRoles(TRUE);
      $staff[] = [
        'id' => $user->id(),
        'name' => $user->getDisplayName(),
        'email' => $user->getEmail(),
        'roles' => array_values($roles),
        'status' => $user->isActive() ? 'active' : 'blocked',
        'created' => $user->getCreatedTime(),
        'last_login' => $user->getLastLoginTime() ?: NULL,
      ];
    }

    usort($staff, function ($a, $b) {
      return strcasecmp($a['name'], $b['name']);
    });

    return new JsonResponse([
      'store_id' => $store_id,
      'total' => count($staff),
      'staff' => $staff,
    ]);
  }

  /**
   * Invites a new staff member to the user's store.
   */
  public function invite(Request $request): JsonResponse {
    if ($denied = $this->checkPermission('manage store staff')) {
      return $denied;
    }

    $store_id = $this->getCurrentStoreId();
    if (!$store_id) {
      return $this->noStoreResponse();
    }

    $data = json_decode($request->getContent(), TRUE);
    if (!$data) {
      return new JsonResponse(['error' => 'Invalid JSON body.'], 400);
    }

    $email = $data['email'] ?? '';
    $name = $data['name'] ?? '';
    $role = $data['role'] ?? '';

    if (empty($email)) {
      return new JsonResponse(['error' => 'Missing required field: email.'], 400);
    }

    if (empty($name)) {
      return new JsonResponse(['error' => 'Missing required field: name.'], 400);
    }

    if (empty($role)) {
      return new JsonResponse(['error' => 'Missing required field: role.'], 400);
    }

    if (!\Drupal::service('email.validator')->isValid($email)) {
      return new JsonResponse(['error' => 'Invalid email address.'], 400);
    }

    if (!in_array($role, self::ASSIGNABLE_ROLES)) {
      return new JsonResponse([
        'error' => 'Invalid role. Must be one of: ' . implode(', ', self::ASSIGNABLE_ROLES),
      ], 400);
    }

    // Check real user roles for invite-level restriction.
    $real_user = $this->loadRealUser();
    $real_roles = $real_user ? $real_user->getRoles() : [];
    if (!in_array('store_owner', $real_roles) && !in_array('administrator', $real_roles)) {
      if ($role === 'store_owner') {
        return new JsonResponse(['error' => 'Only store owners can invite other store owners.'], 403);
      }
    }

    $user_storage = $this->entityTypeManager()->getStorage('user');
    $existing = $user_storage->loadByProperties(['mail' => $email]);

    if (!empty($existing)) {
      $existing_user = reset($existing);
      $existing_store = StoreAccessHandler::getUserStoreId($existing_user);

      if ($existing_store === $store_id) {
        return new JsonResponse(['error' => 'A user with this email is already assigned to your store.'], 409);
      }

      if ($existing_store) {
        return new JsonResponse(['error' => 'This email is already associated with another store.'], 409);
      }
    }

    $password = user_password(12);
    $new_user = $user_storage->create([
      'name' => $name,
      'mail' => $email,
      'pass' => $password,
      'status' => 1,
      'field_assigned_store' => $store_id,
    ]);

    $new_user->addRole($role);
    $new_user->save();

    $params = [
      'account' => $new_user,
      'store_name' => '',
      'role' => $role,
    ];

    $store = $this->entityTypeManager()->getStorage('commerce_store')->load($store_id);
    if ($store) {
      $params['store_name'] = $store->getName();
    }

    \Drupal::service('plugin.manager.mail')->mail(
      'user',
      'register_admin_created',
      $email,
      $new_user->getPreferredLangcode(),
      $params
    );

    \Drupal::logger('budhound_api')->info('Staff member @name (@email) invited with role @role to store @store by user @uid.', [
      '@name' => $name,
      '@email' => $email,
      '@role' => $role,
      '@store' => $store_id,
      '@uid' => $this->currentUser()->id(),
    ]);

    return new JsonResponse([
      'success' => TRUE,
      'user_id' => $new_user->id(),
      'name' => $name,
      'email' => $email,
      'role' => $role,
      'store_id' => $store_id,
    ], 201);
  }

}

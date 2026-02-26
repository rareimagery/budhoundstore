<?php

namespace Drupal\budhound_store_access\Access;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccessPolicyBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Session\CalculatedPermissionsItem;
use Drupal\Core\Session\RefinableCalculatedPermissionsInterface;
use Drupal\simple_oauth\Authentication\TokenAuthUserInterface;

/**
 * Restores user role permissions when OAuth2 token has no scopes.
 *
 * Simple OAuth v6 intersects the user's permissions with the token's scopes.
 * When no scopes are configured on the consumer, this results in zero
 * permissions. This policy detects that case and re-adds the user's real
 * role permissions so that entity access (JSON:API, etc.) works correctly.
 */
class UnscopedTokenAccessPolicy extends AccessPolicyBase {

  public function __construct(protected EntityTypeManagerInterface $entityTypeManager) {}

  /**
   * {@inheritdoc}
   */
  public function applies(string $scope): bool {
    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  public function alterPermissions(AccountInterface $account, string $scope, RefinableCalculatedPermissionsInterface $calculated_permissions): void {
    if (!$account instanceof TokenAuthUserInterface) {
      return;
    }

    // Only act when the token has no scopes — that means the OAuth2 access
    // policy has stripped all permissions via an empty intersection.
    $token = $account->getToken();
    $oauth2_scopes = $token->get('scopes')->getScopes();
    if (!empty($oauth2_scopes)) {
      return;
    }

    // Load the real user's roles and merge ALL their permissions into a
    // single item to replace the stripped one.
    /** @var \Drupal\user\RoleInterface[] $roles */
    $roles = $this->entityTypeManager->getStorage('user_role')
      ->loadMultiple($account->getSubject()->getRoles());

    $all_permissions = [];
    $is_admin = FALSE;
    foreach ($roles as $role) {
      $all_permissions = array_merge($all_permissions, $role->getPermissions());
      if ($role->isAdmin()) {
        $is_admin = TRUE;
      }
    }

    $calculated_permissions->addItem(
      new CalculatedPermissionsItem(
        permissions: array_unique($all_permissions),
        isAdmin: $is_admin,
      ),
      overwrite: TRUE,
    );
  }

}

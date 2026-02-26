<?php

namespace Drupal\budhound_api\Repositories;

use Drupal\Core\Password\PasswordInterface;
use Drupal\user\Entity\User;
use League\OAuth2\Server\Entities\ClientEntityInterface;
use League\OAuth2\Server\Repositories\UserRepositoryInterface;

/**
 * User repository for OAuth2 password grant.
 */
class UserRepository implements UserRepositoryInterface {

  /**
   * The password checker service.
   *
   * @var \Drupal\Core\Password\PasswordInterface
   */
  protected PasswordInterface $passwordChecker;

  /**
   * Constructs a UserRepository.
   *
   * @param \Drupal\Core\Password\PasswordInterface $password_checker
   *   The password checker service.
   */
  public function __construct(PasswordInterface $password_checker) {
    $this->passwordChecker = $password_checker;
  }

  /**
   * {@inheritdoc}
   */
  public function getUserEntityByUserCredentials(string $username, string $password, string $grantType, ClientEntityInterface $clientEntity): ?\League\OAuth2\Server\Entities\UserEntityInterface {
    $users = \Drupal::entityTypeManager()
      ->getStorage('user')
      ->loadByProperties(['name' => $username]);

    /** @var \Drupal\user\UserInterface|false $user */
    $user = reset($users);

    if (!$user) {
      return NULL;
    }

    if (!$user->isActive()) {
      return NULL;
    }

    if (!$this->passwordChecker->check($password, $user->getPassword())) {
      return NULL;
    }

    return new UserEntity((string) $user->id());
  }

}

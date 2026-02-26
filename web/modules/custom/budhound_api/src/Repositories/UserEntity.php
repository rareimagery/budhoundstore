<?php

namespace Drupal\budhound_api\Repositories;

use League\OAuth2\Server\Entities\UserEntityInterface;

/**
 * Simple user entity for OAuth2 server.
 */
class UserEntity implements UserEntityInterface {

  /**
   * The user identifier.
   *
   * @var string
   */
  protected string $identifier;

  /**
   * Constructs a UserEntity.
   *
   * @param string $identifier
   *   The user ID.
   */
  public function __construct(string $identifier) {
    $this->identifier = $identifier;
  }

  /**
   * {@inheritdoc}
   */
  public function getIdentifier(): string {
    return $this->identifier;
  }

}

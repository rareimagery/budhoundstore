<?php

/**
 * @file
 * Drupal site configuration for rareimagery.net
 */

// ── Database ──────────────────────────────────────────────────────────────────
$databases['default']['default'] = [
  'database'        => 'rareimagery_db',
  'username'        => 'drupal',
  'password'        => 'drupalpassword',
  'host'            => 'db',
  'port'            => '3306',
  'driver'          => 'mysql',
  'prefix'          => '',
  'collation'       => 'utf8mb4_unicode_ci',
  'isolation_level' => 'READ COMMITTED',
  'namespace'       => 'Drupal\\mysql\\Driver\\Database\\mysql',
  'autoload'        => 'core/modules/mysql/src/Driver/Database/mysql/',
];

// ── Security ──────────────────────────────────────────────────────────────────
$settings['hash_salt'] = 'd0wBLsVP9U3Sc+T/jiIgZSOD/bO6jA8y3YBh73QJxR/ecauPvivl/fCNSQFr7m8Fn68IwgZB6g==';

// ── File paths ────────────────────────────────────────────────────────────────
$settings['file_public_path']  = 'sites/rareimagery.net/files';
$settings['file_private_path'] = '/var/www/html/sites/rareimagery.net/private';

// ── Config sync ───────────────────────────────────────────────────────────────
$settings['config_sync_directory'] = '/var/www/html/sites/rareimagery.net/config/sync';

// ── Trusted host patterns ─────────────────────────────────────────────────────
$settings['trusted_host_patterns'] = [
  '^rareimagery\.net$',
  '^www\.rareimagery\.net$',
  '^rareimagery\.local$',
  '^localhost$',
];

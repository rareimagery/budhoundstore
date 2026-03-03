<?php

/**
 * @file
 * Drupal site configuration for budhound.app
 */

// ── Database ──────────────────────────────────────────────────────────────────
$databases['default']['default'] = [
  'database'        => 'budhound_db',
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
$settings['hash_salt'] = 'dyqXYsgIMI8IFfPNjUMB4CgpwEuHHQFivlbRpcIWXfGACe0qRPNnynApoj740U2xSekhyZE4jA==';

// ── File paths ────────────────────────────────────────────────────────────────
$settings['file_public_path']  = 'sites/budhound.app/files';
$settings['file_private_path'] = '/var/www/html/sites/budhound.app/private';

// ── Config sync ───────────────────────────────────────────────────────────────
$settings['config_sync_directory'] = '/var/www/html/sites/budhound.app/config/sync';

// ── Trusted host patterns ─────────────────────────────────────────────────────
$settings['trusted_host_patterns'] = [
  '^budhound\.app$',
  '^www\.budhound\.app$',
  '^budhound\.local$',
  '^localhost$',
  '^10\.0\.2\.2$',
  '^72\.62\.80\.155$',           // Hostinger VPS IP
  '^srv1450030\.hstgr\.cloud$',  // Hostinger hostname
];

// ── Performance (optional, enable in production) ──────────────────────────────
# $settings['cache']['default'] = 'cache.backend.redis';

// ── Service overrides (CORS, etc.) ────────────────────────────────────────────
$settings['container_yamls'][] = $app_root . '/' . $site_path . '/services.yml';

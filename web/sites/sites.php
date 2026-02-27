<?php

/**
 * Drupal multisite configuration.
 *
 * Maps domain names (and port variants) to site directories under /sites.
 * Drupal reads $_SERVER['HTTP_HOST'] and looks up the matching directory.
 */

// ── budhound.app ──────────────────────────────────────────────────────────────
$sites['budhound.app']       = 'budhound.app';
$sites['www.budhound.app']   = 'budhound.app';
$sites['budhound.local']     = 'budhound.app';

// ── rareimagery.net ───────────────────────────────────────────────────────────
$sites['rareimagery.net']     = 'rareimagery.net';
$sites['www.rareimagery.net'] = 'rareimagery.net';
$sites['rareimagery.local']   = 'rareimagery.net';

// ── localhost port aliases (local Docker dev) ─────────────────────────────────
// Drupal builds the key as {port}.{host} — must match exactly.
// Access budhound on http://localhost:8081 and rareimagery on http://localhost:8082
$sites['8081.localhost'] = 'budhound.app';
$sites['8082.localhost'] = 'rareimagery.net';

// ── Android emulator (10.0.2.2 = host loopback) ──────────────────────────────
$sites['8081.10.0.2.2'] = 'budhound.app';
$sites['8082.10.0.2.2'] = 'rareimagery.net';

-- init-databases.sql
-- Runs automatically when the MySQL container is first initialized.
-- Creates the three BudStore databases and grants the shared 'drupal' user
-- access to all of them.

CREATE DATABASE IF NOT EXISTS drupal
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS budhound_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS rareimagery_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON drupal.*         TO 'drupal'@'%';
GRANT ALL PRIVILEGES ON budhound_db.*    TO 'drupal'@'%';
GRANT ALL PRIVILEGES ON rareimagery_db.* TO 'drupal'@'%';

FLUSH PRIVILEGES;

# Drupal Multisite Setup Guide

## Sites: budhound.app & rareimagery.net

---

## Overview

This guide configures a single Drupal installation to serve two separate websites, each with its own database, configuration, and content while sharing the same codebase and modules.

| Property | Site 1 | Site 2 |
|----------|--------|--------|
| **Domain** | budhound.app | rareimagery.net |
| **Directory** | `sites/budhound.app` | `sites/rareimagery.net` |
| **Database** | `budhound_db` | `rareimagery_db` |

---

## 1. Configure sites.php

Edit `sites/sites.php` to map domains to their site directories:

```php
<?php

/**
 * Drupal multisite configuration.
 *
 * Maps domain names to site directories under /sites.
 */

// budhound.app
$sites['budhound.app'] = 'budhound.app';
$sites['www.budhound.app'] = 'budhound.app';

// rareimagery.net
$sites['rareimagery.net'] = 'rareimagery.net';
$sites['www.rareimagery.net'] = 'rareimagery.net';

// Optional: local development aliases
$sites['budhound.local'] = 'budhound.app';
$sites['rareimagery.local'] = 'rareimagery.net';
```

---

## 2. Create Site Directories

```bash
# Create site directories
mkdir -p sites/budhound.app
mkdir -p sites/rareimagery.net

# Create files directories for uploads
mkdir -p sites/budhound.app/files
mkdir -p sites/rareimagery.net/files

# Set permissions
chmod 755 sites/budhound.app
chmod 755 sites/rareimagery.net
chmod 775 sites/budhound.app/files
chmod 775 sites/rareimagery.net/files

# Set web server ownership (adjust user/group as needed)
chown -R www-data:www-data sites/budhound.app/files
chown -R www-data:www-data sites/rareimagery.net/files
```

---

## 3. Create Databases

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database for budhound.app
CREATE DATABASE budhound_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'budhound_user'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON budhound_db.* TO 'budhound_user'@'localhost';

-- Create database for rareimagery.net
CREATE DATABASE rareimagery_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rareimagery_user'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON rareimagery_db.* TO 'rareimagery_user'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

If using Docker Compose, add both databases to your `docker-compose.yml`:

```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
    volumes:
      - db_data:/var/lib/mysql
      - ./init-databases.sql:/docker-entrypoint-initdb.d/init.sql

  drupal:
    image: drupal:10
    ports:
      - "8080:80"
    volumes:
      - ./sites/sites.php:/var/www/html/sites/sites.php
      - ./sites/budhound.app:/var/www/html/sites/budhound.app
      - ./sites/rareimagery.net:/var/www/html/sites/rareimagery.net
    depends_on:
      - db

volumes:
  db_data:
```

Create `init-databases.sql`:

```sql
CREATE DATABASE IF NOT EXISTS budhound_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS rareimagery_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON budhound_db.* TO 'drupal'@'%';
GRANT ALL PRIVILEGES ON rareimagery_db.* TO 'drupal'@'%';
FLUSH PRIVILEGES;
```

---

## 4. Site-Specific settings.php

### sites/budhound.app/settings.php

```php
<?php

$databases['default']['default'] = [
  'database' => 'budhound_db',
  'username' => 'budhound_user',
  'password' => 'CHANGE_THIS_PASSWORD',
  'host' => 'localhost',          // Use 'db' if using Docker
  'port' => '3306',
  'driver' => 'mysql',
  'prefix' => '',
  'collation' => 'utf8mb4_general_ci',
];

// Site-specific settings
$settings['hash_salt'] = 'GENERATE_UNIQUE_HASH_FOR_BUDHOUND';
$settings['config_sync_directory'] = 'sites/budhound.app/config/sync';
$settings['file_public_path'] = 'sites/budhound.app/files';
$settings['file_private_path'] = 'sites/budhound.app/private';

// Trusted host patterns
$settings['trusted_host_patterns'] = [
  '^budhound\.app$',
  '^www\.budhound\.app$',
  '^budhound\.local$',
];
```

### sites/rareimagery.net/settings.php

```php
<?php

$databases['default']['default'] = [
  'database' => 'rareimagery_db',
  'username' => 'rareimagery_user',
  'password' => 'CHANGE_THIS_PASSWORD',
  'host' => 'localhost',          // Use 'db' if using Docker
  'port' => '3306',
  'driver' => 'mysql',
  'prefix' => '',
  'collation' => 'utf8mb4_general_ci',
];

// Site-specific settings
$settings['hash_salt'] = 'GENERATE_UNIQUE_HASH_FOR_RAREIMAGERY';
$settings['config_sync_directory'] = 'sites/rareimagery.net/config/sync';
$settings['file_public_path'] = 'sites/rareimagery.net/files';
$settings['file_private_path'] = 'sites/rareimagery.net/private';

// Trusted host patterns
$settings['trusted_host_patterns'] = [
  '^rareimagery\.net$',
  '^www\.rareimagery\.net$',
  '^rareimagery\.local$',
];
```

Generate unique hash salts with:

```bash
drush eval "echo \Drupal\Component\Utility\Crypt::randomBytesBase64(55)"
# Or use:
openssl rand -base64 55
```

---

## 5. Create Config Sync Directories

```bash
mkdir -p sites/budhound.app/config/sync
mkdir -p sites/rareimagery.net/config/sync
mkdir -p sites/budhound.app/private
mkdir -p sites/rareimagery.net/private

chmod 775 sites/budhound.app/config/sync
chmod 775 sites/rareimagery.net/config/sync
chmod 750 sites/budhound.app/private
chmod 750 sites/rareimagery.net/private
```

---

## 6. Apache Virtual Hosts

### /etc/apache2/sites-available/budhound.app.conf

```apache
<VirtualHost *:80>
    ServerName budhound.app
    ServerAlias www.budhound.app
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/budhound-error.log
    CustomLog ${APACHE_LOG_DIR}/budhound-access.log combined
</VirtualHost>
```

### /etc/apache2/sites-available/rareimagery.net.conf

```apache
<VirtualHost *:80>
    ServerName rareimagery.net
    ServerAlias www.rareimagery.net
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/rareimagery-error.log
    CustomLog ${APACHE_LOG_DIR}/rareimagery-access.log combined
</VirtualHost>
```

Enable the sites:

```bash
a2ensite budhound.app.conf
a2ensite rareimagery.net.conf
a2enmod rewrite
systemctl reload apache2
```

**If using Nginx instead**, see Section 6a below.

### 6a. Nginx Server Blocks (Alternative)

#### /etc/nginx/sites-available/budhound.app

```nginx
server {
    listen 80;
    server_name budhound.app www.budhound.app;
    root /var/www/html;
    index index.php;

    location / {
        try_files $uri /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ ^/sites/.*/files/styles/ {
        try_files $uri @rewrite;
    }

    location @rewrite {
        rewrite ^/(.*)$ /index.php?q=$1;
    }
}
```

#### /etc/nginx/sites-available/rareimagery.net

```nginx
server {
    listen 80;
    server_name rareimagery.net www.rareimagery.net;
    root /var/www/html;
    index index.php;

    location / {
        try_files $uri /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ ^/sites/.*/files/styles/ {
        try_files $uri @rewrite;
    }

    location @rewrite {
        rewrite ^/(.*)$ /index.php?q=$1;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/budhound.app /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/rareimagery.net /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 7. SSL with Certbot

```bash
# Install Certbot
apt install certbot python3-certbot-apache   # For Apache
# OR
apt install certbot python3-certbot-nginx     # For Nginx

# Generate certificates
certbot --apache -d budhound.app -d www.budhound.app
certbot --apache -d rareimagery.net -d www.rareimagery.net

# Auto-renew (usually set up automatically)
certbot renew --dry-run
```

---

## 8. Run Drupal Install for Each Site

Navigate to each domain in your browser to run the Drupal installer:

1. **https://budhound.app/install.php** — Select language, profile, enter budhound_db credentials
2. **https://rareimagery.net/install.php** — Select language, profile, enter rareimagery_db credentials

Or install via Drush:

```bash
# Install budhound.app
drush --uri=budhound.app site:install standard \
  --db-url=mysql://budhound_user:PASSWORD@localhost/budhound_db \
  --site-name="BudHound" \
  --account-name=admin \
  --account-pass=CHANGE_THIS

# Install rareimagery.net
drush --uri=rareimagery.net site:install standard \
  --db-url=mysql://rareimagery_user:PASSWORD@localhost/rareimagery_db \
  --site-name="Rare Imagery" \
  --account-name=admin \
  --account-pass=CHANGE_THIS
```

---

## 9. Drush Multisite Usage

Always specify the site with `--uri` when running Drush commands:

```bash
# Clear cache for budhound
drush --uri=budhound.app cr

# Enable a module on rareimagery only
drush --uri=rareimagery.net en commerce

# Export config for budhound
drush --uri=budhound.app config:export

# Run updates on rareimagery
drush --uri=rareimagery.net updatedb

# Check status of each site
drush --uri=budhound.app status
drush --uri=rareimagery.net status
```

---

## 10. DNS Configuration

Point both domains to your server's IP address:

| Record Type | Host | Value |
|------------|------|-------|
| A | budhound.app | YOUR_SERVER_IP |
| A | www.budhound.app | YOUR_SERVER_IP |
| A | rareimagery.net | YOUR_SERVER_IP |
| A | www.rareimagery.net | YOUR_SERVER_IP |

---

## 11. Local Development (Optional)

Add to `/etc/hosts` for local testing:

```
127.0.0.1   budhound.local
127.0.0.1   rareimagery.local
```

---

## Final Directory Structure

```
drupal/
├── sites/
│   ├── sites.php                    # Domain-to-directory mapping
│   ├── default/
│   │   └── settings.php             # Fallback default site
│   ├── budhound.app/
│   │   ├── settings.php             # DB config & site settings
│   │   ├── files/                   # Public uploads
│   │   ├── private/                 # Private files
│   │   └── config/
│   │       └── sync/                # Config export/import
│   └── rareimagery.net/
│       ├── settings.php
│       ├── files/
│       ├── private/
│       └── config/
│           └── sync/
├── core/
├── modules/                         # Shared contrib modules
├── themes/                          # Shared themes
└── composer.json
```

---

## Key Reminders

- **Shared codebase**: Both sites share modules and themes — installing a module with Composer makes it available to both sites, but each site enables modules independently.
- **Separate databases**: Content, users, and configuration are completely independent per site.
- **Per-site themes**: Each site can use a different theme. Install themes globally, then enable per site.
- **Updates**: Running `composer update` updates code for both sites. Run `drush updatedb` on **each** site after updating.
- **Backups**: Back up each database separately along with each site's `files/` directory.

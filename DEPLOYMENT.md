# BudStore Deployment Guide

Local development environment using Docker Compose (Drupal 11 + MySQL 8.0).

## Prerequisites

- Docker Desktop (includes Docker Compose v2)
- Git
- Node.js 18+ and npm (for the React frontend)
- PHP 8.x on the host only if you run scraper scripts outside Docker
  (XAMPP `C:\xampp\php\php.exe` is recommended on Windows)

## Stack Overview

Defined in `docker-compose.yml`:

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `drupal` | Custom (Dockerfile) | 8080 -> 80 | Drupal 11 + Apache |
| `db` | mysql:8.0 | (internal) | MySQL database |

Data volumes:
- `db_data` — MySQL data files
- `drupal_files` — `web/sites/default/files/` (uploaded files)
- `drupal_modules` — `web/modules/contrib/`
- `drupal_themes` — `web/themes/contrib/`

## Environment Variables

Copy `.env` and set real values before starting:

```bash
cp .env .env.local   # or edit .env directly (never commit secrets)
```

Required variables in `.env`:

```
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=drupal
MYSQL_USER=drupal
MYSQL_PASSWORD=drupalpassword
DRUPAL_SITE_NAME=My Drupal Commerce Site
DRUPAL_ADMIN_USER=admin
DRUPAL_ADMIN_PASS=adminpassword
DRUPAL_ADMIN_EMAIL=admin@example.com
```

## Starting the Stack

```bash
# Start all containers in detached mode
docker compose up -d

# Follow Drupal logs during first boot
docker compose logs -f drupal

# Stop the stack
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v
```

The Drupal container is named `budstore-drupal-1` by default (Docker Compose
prefixes with the project directory name).

## Initial Setup Scripts

Run these scripts once after the first `docker compose up -d`, in order.
Each script is a Drush php-script that configures Drupal entities.

### 1. Set Up Brands

Creates the `field_brand` taxonomy vocabulary and product reference field.

```bash
docker cp setup-brands.php budstore-drupal-1:/var/www/html/
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/setup-brands.php
```

### 2. Set Up Image Field

Creates the `field_image` media field on all product types.

```bash
docker cp setup-image-field.php budstore-drupal-1:/var/www/html/
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/setup-image-field.php
```

### 3. Set Up Checkout

Enables `budstore_checkout` and `commerce_cod_custom`, creates the `cod`
payment gateway entity, and grants anonymous users cart and checkout
permissions.

```bash
docker cp setup-checkout.php budstore-drupal-1:/var/www/html/
docker cp -r web/modules/custom/budstore_checkout budstore-drupal-1:/var/www/html/web/modules/custom/budstore_checkout
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/setup-checkout.php
```

After this step the following endpoints are active:

```
GET    /jsonapi/carts
POST   /jsonapi/cart/add
PATCH  /jsonapi/carts/{order}/items/{item}
DELETE /jsonapi/carts/{order}/items
POST   /api/cod-checkout
```

### 4. Set Up Leafly Field

Creates the `field_leafly_data` long-text field on all product types to store
scraped Leafly JSON.

```bash
docker cp setup-leafly-field.php budstore-drupal-1:/var/www/html/
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/setup-leafly-field.php
```

## Accessing Drupal Admin

- URL: http://localhost:8080/admin
- Credentials: set in `.env` as `DRUPAL_ADMIN_USER` / `DRUPAL_ADMIN_PASS`

Key admin paths:

| Path | Description |
|------|-------------|
| `/admin/commerce/stores` | Manage the 7 dispensary stores |
| `/admin/commerce/products` | Product catalog |
| `/admin/commerce/orders` | Placed orders |
| `/admin/commerce/config/payment-gateways` | COD gateway configuration |
| `/admin/modules` | Enable/disable modules |
| `/jsonapi` | JSON:API endpoint explorer |

## Running Drush Commands

```bash
# General pattern
docker exec budstore-drupal-1 vendor/bin/drush <command>

# Common commands
docker exec budstore-drupal-1 vendor/bin/drush cr          # clear all caches
docker exec budstore-drupal-1 vendor/bin/drush updb        # run DB updates
docker exec budstore-drupal-1 vendor/bin/drush en <module> # enable a module
docker exec budstore-drupal-1 vendor/bin/drush pml         # list modules

# Run a PHP script inside Drupal's bootstrap
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/yourscript.php
```

## Copying Files Into the Container

```bash
# Copy a single file
docker cp localfile.php budstore-drupal-1:/var/www/html/

# Copy a directory recursively
docker cp -r local/directory budstore-drupal-1:/var/www/html/web/modules/custom/directory
```

## React Frontend

The React app runs outside Docker on the host machine:

```bash
cd cannabis-store-viewer
cp .env.example .env    # or create .env manually
# Edit .env: REACT_APP_DRUPAL_URL=http://localhost:8080
npm install
npm start               # http://localhost:3000
```

For a production build:

```bash
npm run build
# Serve the build/ directory with any static file server
```

## Resetting / Rebuilding

```bash
# Rebuild the Drupal Docker image after Dockerfile changes
docker compose build drupal
docker compose up -d

# Full teardown including all data
docker compose down -v
docker compose up -d
# Then re-run all 4 setup scripts
```

## Troubleshooting

**Container fails to start — db not ready**
The `drupal` service depends on `db` with a healthcheck. If the DB container
takes too long, increase the healthcheck `timeout` and `retries` in
`docker-compose.yml`.

**403 / 401 on cart endpoints**
Re-run `setup-checkout.php`. This grants anonymous users `access content`,
`access checkout`, `view own commerce_order`, and related permissions.

**Route not found (404) on `/api/cod-checkout`**
Ensure `budstore_checkout` is enabled and caches are cleared:
```bash
docker exec budstore-drupal-1 vendor/bin/drush cr
```

**Drupal white screen / 500 error**
Check Drupal logs:
```bash
docker exec budstore-drupal-1 vendor/bin/drush watchdog-show --count=20
```

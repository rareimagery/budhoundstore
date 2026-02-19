# Drupal Docker Setup with MySQL, Composer, Drush & Drupal Commerce

A complete guide to rebuilding a Drupal installation inside Docker with MySQL, Composer, Drush, and the Drupal Commerce module.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- Basic familiarity with the command line

---

## Project Structure

```
drupal-site/
├── docker-compose.yml
├── Dockerfile
├── .env.example     # Template — copy to .env
├── .env             # Your credentials (do not commit)
├── .gitignore
└── drupal/          # Drupal codebase (created by Composer)
```

---

## Step 1 — Create the `.env` File

Create a `.env` file in your project root to store credentials. You can copy from the included template:

```bash
cp .env.example .env
```

Then edit `.env` with your values:

```env
# .env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=drupal
MYSQL_USER=drupal
MYSQL_PASSWORD=drupalpassword
DRUPAL_SITE_NAME=My Drupal Commerce Site
DRUPAL_ADMIN_USER=admin
DRUPAL_ADMIN_PASS=adminpassword
DRUPAL_ADMIN_EMAIL=admin@example.com
```

> **Security:** Never commit `.env` to version control. Add it to `.gitignore`.

---

## Step 2 — Create the `Dockerfile`

This Dockerfile builds a PHP/Apache image with Composer and Drush pre-installed:

```dockerfile
# Dockerfile
FROM drupal:10-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libzip-dev \
    zip \
    default-mysql-client \
    && docker-php-ext-install zip bcmath \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set Composer environment variables
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_HOME=/var/cache/composer

# Install Drush Launcher (calls project-level Drush)
RUN curl -fsSL https://github.com/drush-ops/drush-launcher/releases/latest/download/drush.phar \
    -o /usr/local/bin/drush \
    && chmod +x /usr/local/bin/drush

# Point Apache DocumentRoot to Composer project's web/ directory
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/web|g' \
    /etc/apache2/sites-available/000-default.conf

# Set working directory
WORKDIR /var/www/html

# Expose Apache port
EXPOSE 80
```

---

## Step 3 — Create `docker-compose.yml`

```yaml
# docker-compose.yml
version: "3.9"

services:

  # ── MySQL Database ─────────────────────────────────────────────
  db:
    image: mysql:8.0
    restart: unless-stopped
    env_file: .env
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - drupal_net
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 10s
      retries: 5

  # ── Drupal Application ─────────────────────────────────────────
  drupal:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    env_file: .env
    ports:
      - "8080:80"
    volumes:
      - drupal_files:/var/www/html/web/sites/default/files
      - drupal_modules:/var/www/html/web/modules/contrib
      - drupal_themes:/var/www/html/web/themes/contrib
    networks:
      - drupal_net

volumes:
  db_data:
  drupal_files:
  drupal_modules:
  drupal_themes:

networks:
  drupal_net:
```

---

## Step 4 — Build and Start Containers

```bash
# Build and start in detached mode
docker compose up -d --build

# Verify containers are running
docker compose ps
```

Expected output: both `drupal` and `db` services should show `running`.

---

## Step 5 — Create a Drupal Project with Composer

Exec into the Drupal container and use Composer to scaffold a fresh Drupal project:

```bash
# Enter the Drupal container
docker compose exec drupal bash

# Remove the default Drupal files and create a new project
cd /var/www
rm -rf html
composer create-project drupal/recommended-project html --no-interaction

# Move into the project directory
cd html

# Require Drush as a project-level dependency (recommended)
composer require drush/drush --no-interaction
```

---

## Step 6 — Install Drupal Commerce via Composer

Still inside the container, require the Commerce modules:

```bash
# Drupal Commerce 3.x requires inline_entity_form at RC stability
composer require \
  'drupal/inline_entity_form:^3.0@RC' \
  drupal/commerce \
  drupal/address \
  drupal/profile \
  --with-all-dependencies \
  --no-interaction
```

> **Note:** Commerce 3.x pulls in its sub-modules (product, order, payment, cart, checkout, price, store) as dependencies automatically. The `@RC` flag is needed because `inline_entity_form` does not yet have a stable release for Drupal 11. Commerce also requires the `bcmath` PHP extension, which is included in the updated Dockerfile.

---

## Step 7 — Install Drupal via Drush

**MySQL connection (no local path):** From inside the Drupal container, MySQL is reached by the **Docker service name** `db` as the host — not `localhost` and not a file path. Use:

| Setting   | Value   |
|----------|---------|
| **Host** | `db`    |
| **Port** | `3306` (default) |
| **User** | value of `MYSQL_USER` in `.env` |
| **Password** | value of `MYSQL_PASSWORD` in `.env` |
| **Database** | value of `MYSQL_DATABASE` in `.env` |

**DB URL format:** `mysql://USER:PASSWORD@db/DATABASE`

Use Drush to perform a non-interactive site install. From inside the container (so env vars are set), you can use:

```bash
# From inside /var/www/html (env vars from .env are available in the container)
vendor/bin/drush site:install standard \
  --db-url="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@db/${MYSQL_DATABASE}" \
  --site-name="${DRUPAL_SITE_NAME}" \
  --account-name="${DRUPAL_ADMIN_USER}" \
  --account-pass="${DRUPAL_ADMIN_PASS}" \
  --account-mail="${DRUPAL_ADMIN_EMAIL}" \
  --yes
```

If the variables don’t expand (e.g. in some shells), use the literal URL with your `.env` values. Example if your `.env` has `MYSQL_USER=drupal`, `MYSQL_PASSWORD=drupalpassword`, `MYSQL_DATABASE=drupal`:

```bash
vendor/bin/drush site:install standard \
  --db-url="mysql://drupal:drupalpassword@db/drupal" \
  --site-name="My Drupal Commerce Site" \
  --account-name="admin" \
  --account-pass="adminpassword" \
  --account-mail="admin@example.com" \
  --yes
```

Replace the user, password, database, site name, and account details with whatever you set in your `.env`.

---

## Step 8 — Enable Drupal Commerce Modules

```bash
# Enable Commerce and its sub-modules
vendor/bin/drush en \
  commerce \
  commerce_product \
  commerce_order \
  commerce_payment \
  commerce_cart \
  commerce_checkout \
  commerce_price \
  address \
  inline_entity_form \
  profile \
  --yes

# Clear caches
vendor/bin/drush cr
```

---

## Step 9 — Set File Permissions

```bash
# Set correct ownership for the web server
chown -R www-data:www-data /var/www/html/web/sites/default/files
chmod -R 755 /var/www/html/web/sites/default/files

# Exit the container
exit
```

---

## Step 10 — Access the Site

Open your browser and navigate to:

```
http://localhost:8080
```

Log in with the admin credentials defined in your `.env` file.

To access the Drupal Commerce store setup:

```
http://localhost:8080/admin/commerce/config/stores
```

---

## Step 11 — Multi-Store Configuration

Drupal Commerce supports multiple stores out of the box. Products can belong to one or more stores, while each order belongs to a single store. When customers add products from different stores, they get separate carts per store.

### 11a. Add Currencies

Before creating stores, import every currency your stores will use.

1. Navigate to **Commerce > Configuration > Store > Currencies**:
   ```
   http://localhost:8080/admin/commerce/config/currencies
   ```
2. Click **Add currency** and import the currencies you need (e.g. USD, EUR, GBP).

### 11b. Create Multiple Stores

1. Navigate to **Commerce > Configuration > Store > Stores**:
   ```
   http://localhost:8080/admin/commerce/config/stores
   ```
2. Click **Add store** and fill in each store's details:

| Field | Description |
|-------|-------------|
| **Name** | Display name for the store |
| **Email** | Store contact / order notification email |
| **Address** | Physical address (used for invoicing and tax calculations) |
| **Default currency** | One of the currencies you imported in 11a |
| **Billing countries** | Countries this store accepts orders from |
| **Timezone** | Store timezone for order timestamps |

3. Repeat for each additional store.

### 11c. Set the Default Store

One store must be marked as the default. It provides context for anonymous navigation and cart interaction when no specific store is selected.

1. Edit the store you want as default.
2. Check **"Make this the default store"**.
3. Save.

### 11d. Assign Products to Stores

When creating or editing a product (**Commerce > Products**), use the **Stores** field to assign it to one or more stores. A product that belongs to multiple stores will appear in each store's catalog.

### 11e. Optional — Domain-Based Store Switching

If you want different domains (e.g. `store1.example.com`, `store2.example.com`) to automatically select the matching store, install the **Commerce Store Domain** module.

From inside the Drupal container (`/var/www/html`):

```bash
composer require drupal/commerce_store_domain --no-interaction
vendor/bin/drush en commerce_store_domain --yes
vendor/bin/drush cr
```

Then configure domain-to-store mapping at **Commerce > Configuration > Store > Store domains**:

```
http://localhost:8080/admin/commerce/config/store-domains
```

### 11f. Export Configuration

After setting up currencies and stores, export the configuration so it is reproducible across environments:

```bash
vendor/bin/drush cex --yes
```

Commit the exported config files to version control.

---

## Useful Drush Commands

```bash
# Run Drush commands from the host (no need to exec into container)
docker compose exec drupal vendor/bin/drush <command>

# Common commands
docker compose exec drupal vendor/bin/drush status          # Check site status
docker compose exec drupal vendor/bin/drush cr              # Clear all caches
docker compose exec drupal vendor/bin/drush updatedb        # Run database updates
docker compose exec drupal vendor/bin/drush cex             # Export config
docker compose exec drupal vendor/bin/drush cim             # Import config
docker compose exec drupal vendor/bin/drush uli             # Generate one-time login link
docker compose exec drupal vendor/bin/drush pm:list         # List enabled modules
```

---

## Rebuilding the Environment

To tear down and fully rebuild from scratch:

```bash
# Stop and remove containers, networks, and volumes
docker compose down -v

# Rebuild images and restart
docker compose up -d --build
```

> **Warning:** `down -v` will delete the database volume. All site data will be lost.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `db` container not healthy | Check MySQL credentials in `.env` match `docker-compose.yml` |
| Drupal can't connect to DB | Ensure `db` hostname is used (not `localhost`) in `--db-url` |
| "Path to MySQL" / connection string | Use host **`db`** only (no file path). URL: `mysql://USER:PASS@db/DATABASE` |
| Permission denied on files | Re-run `chown -R www-data:www-data` inside the container |
| Composer memory limit error | Add `COMPOSER_MEMORY_LIMIT=-1` to the `drupal` service environment |
| Commerce modules not found | Ensure `composer require drupal/commerce` completed without errors |

---

## Notes

- This guide targets **Drupal 10** and **Drupal Commerce 2.x**.
- For production deployments, use a reverse proxy (e.g., Nginx) in front of Apache and configure HTTPS.
- Store configuration in code (`drush cex`) and commit it to version control for consistent deployments.
- After configuring multi-store (currencies, stores, default store), run `drush cex` so the setup is reproducible after rebuilds or in other environments.

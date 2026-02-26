# BudStore — Lompoc Cannabis Marketplace

Multi-store cannabis e-commerce platform serving 7 Lompoc dispensaries.
Built on Drupal 11 Commerce + React 19 headless frontend.

## Architecture

```
React 19 SPA (port 3000)
        |
        | fetch / axios (JSON:API + custom REST)
        v
Drupal 11 + Commerce 3 (port 8080)
  ├── commerce_api        — JSON:API cart & checkout endpoints
  ├── budstore_checkout   — POST /api/cod-checkout (custom COD endpoint)
  ├── budstore_defaults   — product types, attributes, store auto-assignment
  └── MySQL 8.0           — persistent data store (Docker volume)
```

- **Drupal 11 + Commerce 3** — backend, product catalog, orders, payments
- **React 19 SPA** — headless frontend, served separately (Create React App)
- **commerce_api module** — JSON:API cart/checkout endpoints
- **budstore_checkout module** — custom COD (Cash on Delivery) endpoint
- **Docker Compose** — local development stack (Drupal + MySQL)

## Stores

7 Lompoc dispensaries, each represented as a Drupal Commerce `online` store:

| Store ID | Name |
|----------|------|
| 1 | Store 1 |
| 2 | Store 2 |
| 3 | Store 3 |
| 4 | Store 4 |
| 5 | Store 5 |
| 6 | Store 6 |
| 7 | Store 7 |

Store names and addresses are managed in Drupal at `/admin/commerce/stores`.
The React frontend fetches stores via `/jsonapi/commerce_store/online`.

## Quick Start

```bash
# 1. Copy and configure environment variables
cp .env .env.local   # then edit .env.local with real values

# 2. Start the Docker stack
docker compose up -d

# 3. Wait for Drupal to be ready, then run setup scripts (in order)
docker cp setup-brands.php budstore-drupal-1:/var/www/html/
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/setup-brands.php

docker cp setup-image-field.php budstore-drupal-1:/var/www/html/
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/setup-image-field.php

docker cp setup-checkout.php budstore-drupal-1:/var/www/html/
docker cp -r web/modules/custom/budstore_checkout budstore-drupal-1:/var/www/html/web/modules/custom/budstore_checkout
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/setup-checkout.php

docker cp setup-leafly-field.php budstore-drupal-1:/var/www/html/
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/setup-leafly-field.php

# 4. Start the React frontend
cd cannabis-store-viewer
npm install
npm start
```

## Key URLs

| Service | URL |
|---------|-----|
| React frontend | http://localhost:3000 |
| Drupal admin | http://localhost:8080/admin |
| JSON:API root | http://localhost:8080/jsonapi |
| Store list (JSON:API) | http://localhost:8080/jsonapi/commerce_store/online |
| COD checkout endpoint | POST http://localhost:8080/api/cod-checkout |

## Product Categories

| Category | Machine Name | Product Count |
|----------|-------------|---------------|
| Flower | `flower` | 63 |
| Pre-Roll | `pre_roll` | 37 |
| Edible | `edible` | 44 |
| Concentrate | `concentrate` | 30 |
| Vape / Cartridge | `vape_cartridge` | 47 |
| Tincture | `tincture` | 12 |
| Topical | `topical` | 13 |
| Clone / Seed | `cannabis_clone_seed` | 3 |
| **Total** | | **249** |

## Custom Drupal Modules

Located in `web/modules/custom/`:

| Module | Description |
|--------|-------------|
| `budstore_defaults` | Site-wide defaults; auto-assigns all stores to new products |
| `budstore_checkout` | Provides `POST /api/cod-checkout` for the React checkout flow |
| `commerce_cod_custom` | Custom COD payment gateway plugin used by budstore_checkout |

## Leafly Integration

Product descriptions are scraped from Leafly and stored in a custom
`field_leafly_data` JSON field on each product. See
[tasks/SCRAPER-GUIDE.md](tasks/SCRAPER-GUIDE.md) for the full workflow.

## API Reference

See [API.md](API.md) for complete endpoint documentation.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Docker deployment instructions.

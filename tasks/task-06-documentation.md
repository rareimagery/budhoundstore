# Task 06 — Project Documentation

## Goal
Create comprehensive README and documentation files for the BudStore project covering: project overview, architecture, setup, deployment, and API reference.

## Files to Create

1. `c:\BudStore\README.md` — main project README
2. `c:\BudStore\cannabis-store-viewer\README.md` — React frontend README
3. `c:\BudStore\DEPLOYMENT.md` — Docker deployment guide
4. `c:\BudStore\API.md` — API endpoint reference
5. `c:\BudStore\tasks\SCRAPER-GUIDE.md` — Leafly scraper usage guide

## DO NOT MODIFY any source code files

---

## README.md (Root) Content Spec

```markdown
# BudStore — Lompoc Cannabis Marketplace

Multi-store cannabis e-commerce platform serving 7 Lompoc dispensaries.
Built on Drupal 11 Commerce + React 19 headless frontend.

## Architecture
[diagram description]
- Drupal 11 + Commerce 3 (backend, product catalog, orders, payments)
- React 19 SPA (headless frontend, served separately)
- commerce_api module (JSON:API cart/checkout endpoints)
- budstore_checkout module (custom COD endpoint)
- Docker Compose (local development)

## Stores
List all 7 Lompoc dispensaries with their store IDs

## Quick Start
[docker compose commands to start the stack]

## Key URLs
- React frontend: http://localhost:5173 (or whatever port)
- Drupal admin: http://localhost:8080/admin
- JSON:API: http://localhost:8080/jsonapi
- COD endpoint: POST http://localhost:8080/api/cod-checkout

## Product Categories
- Flower (63 products)
- Pre-Roll (37 products)
- Edible (44 products)
- Concentrate (30 products)
- Vape/Cartridge (47 products)
- Tincture (12 products)
- Topical (13 products)
- Clone/Seed (3 products)
Total: 249 products

## Modules
Custom Drupal modules:
- budstore_defaults — product types, attributes, brands setup
- budstore_checkout — POST /api/cod-checkout endpoint

## Leafly Integration
See SCRAPER-GUIDE.md for running the description scraper.
```

---

## cannabis-store-viewer/README.md Content Spec

```markdown
# BudStore React Frontend

React 19 SPA for the BudStore cannabis marketplace.

## Tech Stack
- React 19 with React Router v6
- Axios for HTTP (drupalClient + commerceClient)
- Context API (CartContext)
- Plain CSS (App.css ~1000 lines, component-level CSS modules)

## Setup
npm install
npm start

## Environment Variables
REACT_APP_DRUPAL_URL=http://localhost:8080
REACT_APP_STORE_TYPE=online

## Key Files
[list components and their purpose]

## Cart/Checkout Flow
[describe the flow]

## Adding a Product Type
[explain how to add a new product type to PRODUCT_TYPES array]
```

---

## DEPLOYMENT.md Content Spec

Include:
1. Prerequisites (Docker, Docker Compose)
2. Starting the stack: `docker compose up -d`
3. Container name: `budstore-drupal-1`
4. Initial setup scripts to run in order:
   - setup-brands.php
   - setup-image-field.php
   - setup-checkout.php
   - setup-leafly-field.php
5. Port mapping (what ports are exposed)
6. Accessing Drupal admin
7. Running Drush commands: `docker exec budstore-drupal-1 vendor/bin/drush ...`
8. Resetting/rebuilding

---

## API.md Content Spec

Document all endpoints:

### JSON:API Cart Endpoints (commerce_api module)
| Method | Path | Description |
|---|---|---|
| GET | /jsonapi/carts | Get current user's cart(s) |
| POST | /jsonapi/cart/add | Add item to cart |
| PATCH | /jsonapi/carts/{order_id}/items/{item_id} | Update item quantity |
| DELETE | /jsonapi/carts/{order_id}/items | Clear all items |

### Product Endpoints
| Method | Path | Description |
|---|---|---|
| GET | /jsonapi/commerce_product/{type} | List products by type |
| GET | /jsonapi/commerce_product_variation/{bundle} | List variations |

### Custom Endpoints (budstore_checkout)
| Method | Path | Description |
|---|---|---|
| POST | /api/cod-checkout | Place COD order |

For each endpoint include: request body, response format, auth requirements, example curl.

---

## SCRAPER-GUIDE.md Content Spec

Full guide for running the Leafly scraper:

1. Prerequisites: XAMPP PHP at `C:\xampp\php\php.exe`
2. Step 1: Export products (`export-products.php`)
3. Step 2: Run scraper (`scrape-leafly.php` — all options documented)
4. Step 3: Review the map file (`leafly-map.json` format)
5. Step 4: Apply to Drupal (`apply-leafly-data.php`)
6. Expected match rates by product type
7. How to re-run for specific products
8. Troubleshooting common issues

---

## Notes for the Documentation Agent
- Read the actual source files to get accurate information (don't guess)
- Check `c:\BudStore\cannabis-store-viewer\package.json` for actual dependencies and scripts
- Check `c:\BudStore\docker-compose.yml` (if it exists) for actual Docker configuration
- Use the conversation history and code you've seen as the source of truth
- All documentation should be accurate and based on the actual codebase

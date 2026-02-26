# Leafly Scraper Guide

The Leafly scraper fetches strain descriptions from
[leafly.com](https://www.leafly.com) and saves them so they can be applied to
Drupal products via a `field_leafly_data` JSON field.

The full workflow is:

```
export-products.php  (inside Drupal/Docker)
        |
        | products.json
        v
scrape-leafly.php    (on host, XAMPP PHP)
        |
        | leafly-map.json
        v
apply-leafly-data.php (inside Drupal/Docker)
```

---

## Prerequisites

- **XAMPP PHP** at `C:\xampp\php\php.exe` (or any PHP 8.x with the `curl`
  extension enabled)
- Docker running with the `budstore-drupal-1` container healthy
- The `field_leafly_data` field created on all product types (run
  `setup-leafly-field.php` first — see `DEPLOYMENT.md`)

---

## Step 1: Export Products from Drupal

Run inside the Docker container to produce `products.json` — a flat list of
all products with their IDs, titles, and types.

```bash
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/export-products.php
docker cp budstore-drupal-1:/var/www/html/products.json c:\BudStore\products.json
```

`products.json` format (each element):

```json
{
  "product_id": 42,
  "title":      "Stiiizy — Blue Dream",
  "type":       "vape_cartridge"
}
```

---

## Step 2: Run the Scraper

The scraper reads `products.json`, derives a Leafly slug from each product's
strain name, fetches `https://www.leafly.com/strains/{slug}`, and extracts the
description from the embedded `__NEXT_DATA__` JSON block (falling back to Open
Graph meta tags).

### Usage

```
php c:\BudStore\scrape-leafly.php [options]
```

### Options

| Option | Description |
|--------|-------------|
| _(none)_ | Run for all products and write results to `leafly-map.json` |
| `--dry-run` | Preview matches and descriptions without writing to `leafly-map.json` |
| `--resume` | Skip products already present in `leafly-map.json` (safe to re-run) |
| `--product-id=N` | Process only the product with internal ID `N` |

### Examples

```bash
# Full run (all products)
C:\xampp\php\php.exe c:\BudStore\scrape-leafly.php

# Preview without writing
C:\xampp\php\php.exe c:\BudStore\scrape-leafly.php --dry-run

# Resume after an interrupted run
C:\xampp\php\php.exe c:\BudStore\scrape-leafly.php --resume

# Re-scrape a single product
C:\xampp\php\php.exe c:\BudStore\scrape-leafly.php --product-id=42
```

### What the Scraper Does

1. Extracts the strain name from the product title. Titles are expected in
   "Brand — Strain" format (supports em dash `—`, en dash `–`, and hyphen `-`
   as separators). If no separator is found, the full title is used as the
   strain name.

2. Converts the strain name to a Leafly URL slug:
   - Lowercased
   - `&` becomes `-and-`, `+` becomes `-plus-`
   - Special characters stripped
   - Spaces and multiple hyphens collapsed to single hyphens

3. Fetches `https://www.leafly.com/strains/{slug}` with a 1.5-second delay
   between requests to avoid rate limiting.

4. If the primary slug returns a 404 or no description, the scraper
   automatically tries alternative slugs:
   - Common suffixes removed (og, kush, haze, diesel, cheese, dream)
   - Numbers reformatted (`#1` -> `number-1`, or suffix stripped)
   - Leading brand prefix removed (e.g., `stiiizy-blue-dream` -> `blue-dream`)

5. Computes a confidence score (0–1) using PHP's `similar_text()` to compare
   the scraped Leafly page name against the extracted strain name.

6. Writes a record to `leafly-map.json` after each product (incremental save).

### Skipped Types

The `accessory` product type is always skipped — accessories are not cannabis
strains and have no Leafly page.

---

## Step 3: Review leafly-map.json

The scraper writes `c:\BudStore\leafly-map.json`. Each key is the product's
internal Drupal ID (as a string).

### Matched record

```json
{
  "product_id":   42,
  "title":        "Stiiizy — Blue Dream",
  "type":         "vape_cartridge",
  "status":       "matched",
  "strain_slug":  "blue-dream",
  "matched_name": "Blue Dream",
  "confidence":   0.923,
  "leafly_url":   "https://www.leafly.com/strains/blue-dream",
  "description":  "Blue Dream is a sativa-dominant hybrid ...",
  "matched_at":   "2026-02-19"
}
```

### Not-found record

```json
{
  "product_id": 17,
  "title":      "Acme — Generic Blend",
  "type":       "edible",
  "status":     "not_found",
  "tried_slug": "generic-blend",
  "matched_at": "2026-02-19"
}
```

**Confidence scores:** A score above ~0.85 indicates a reliable match. Review
records with lower scores manually before applying. Use `--dry-run` to preview
before committing writes.

---

## Step 4: Apply Descriptions to Drupal

Copy the map file and the apply script into the container, then run it via
Drush:

```bash
docker cp c:\BudStore\leafly-map.json budstore-drupal-1:/var/www/html/
docker cp c:\BudStore\apply-leafly-data.php budstore-drupal-1:/var/www/html/
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/apply-leafly-data.php
```

`apply-leafly-data.php` reads `leafly-map.json`, finds each product by its
internal ID, and saves the matched `description` and `leafly_url` as a JSON
blob in `field_leafly_data`.

The React frontend reads this field via JSON:API and parses it in `api.js`:

```js
const leafly = JSON.parse(leaflyRaw);
description = leafly.description || null;
leaflyUrl   = leafly.leafly_url   || null;
```

---

## Expected Match Rates

Based on the current product catalog of 249 products:

| Product Type | Products | Notes |
|-------------|----------|-------|
| Flower | 63 | High match rate; strain names well-known on Leafly |
| Pre-Roll | 37 | High match rate; strain names same as flower |
| Concentrate | 30 | Moderate; some extract-specific names differ |
| Vape / Cartridge | 47 | Moderate; brand prefixes often need alt-slug fallback |
| Edible | 44 | Lower; many edibles are branded, not strain-named |
| Tincture | 12 | Lower; often brand products rather than strains |
| Topical | 13 | Lower; rarely strain-named |
| Clone / Seed | 3 | High; direct strain names |
| Accessory | varies | Skipped automatically |

---

## Re-running for Specific Products

To update descriptions for a subset of products without re-running everything:

```bash
# Single product
C:\xampp\php\php.exe c:\BudStore\scrape-leafly.php --product-id=42

# Re-run only unmatched products (status: not_found or missing from map)
# Edit leafly-map.json to remove the entries you want to re-try, then:
C:\xampp\php\php.exe c:\BudStore\scrape-leafly.php --resume
```

After re-scraping, re-apply to Drupal:

```bash
docker cp c:\BudStore\leafly-map.json budstore-drupal-1:/var/www/html/
docker exec budstore-drupal-1 vendor/bin/drush php-script /var/www/html/apply-leafly-data.php
```

---

## Troubleshooting

**`ERROR: products.json not found`**
Run `export-products.php` inside the container and copy it out first (Step 1).

**All products return "not found"**
Leafly may be blocking requests. Check:
- PHP's `curl` extension is enabled: `C:\xampp\php\php.exe -m | findstr curl`
- Leafly is reachable: `curl https://www.leafly.com/strains/blue-dream`
- Try `--dry-run` and check the output for HTTP status codes

**Confidence scores are low (< 0.5)**
The scraped page name does not match the strain name. This can happen when:
- The product title uses a brand abbreviation (e.g., "GSC" vs "Girl Scout Cookies")
- Leafly has renamed the strain
- The scraper followed a redirect to a different strain page

Review the `matched_name` field manually and decide whether to apply.

**Rate limiting / slow responses**
The scraper waits 1.5 seconds between requests (`$SLEEP_MS = 1500000`).
If you encounter consistent failures, increase this value in `scrape-leafly.php`
or use `--resume` to continue a partially-completed run.

**`apply-leafly-data.php` reports "product not found"**
The product may have been deleted from Drupal, or the `product_id` in
`leafly-map.json` doesn't match the current Drupal database. Re-export
`products.json` and re-run the scraper to regenerate the map.

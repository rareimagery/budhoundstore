# Task 05 — Drupal API Verification & Leafly Scraper Run

## Goal
Verify that all Drupal API endpoints work correctly, the `field_leafly_data` field is exposed via JSON:API, and run a small test of the Leafly scraper. Report findings.

## Tools Available
- `docker exec budstore-drupal-1` for container commands
- `drush php-script` for PHP scripts
- `curl` for HTTP tests

## Container Name
`budstore-drupal-1`

## Drupal Site URL (inside container)
`http://localhost`

---

## Verification Tasks

### 1. Verify field_leafly_data is in JSON:API response
Run:
```bash
docker exec budstore-drupal-1 bash -c "curl -s 'http://localhost/jsonapi/commerce_product/flower?page%5Blimit%5D=1&fields%5Bcommerce_product--flower%5D=title%2Cfield_leafly_data' -H 'Accept: application/vnd.api+json'" | head -c 600
```
Expected: Response includes `field_leafly_data` key in attributes (even if null right now).

### 2. Verify all 9 product type endpoints respond
Test each endpoint:
```bash
for type in flower pre_roll edible concentrate vape_cartridge tincture topical accessory cannabis_clone_seed; do
  code=$(docker exec budstore-drupal-1 bash -c "curl -s -o /dev/null -w '%{http_code}' http://localhost/jsonapi/commerce_product/$type -H 'Accept: application/vnd.api+json'")
  echo "$type: $code"
done
```
Expected: All return 200.

### 3. Verify cart endpoints
```bash
docker exec budstore-drupal-1 bash -c "curl -s -o /dev/null -w 'GET carts: %{http_code}\n' http://localhost/jsonapi/carts -H 'Accept: application/vnd.api+json'"
```
Expected: 200

### 4. Verify COD checkout endpoint
```bash
docker exec budstore-drupal-1 bash -c "curl -s -X POST http://localhost/api/cod-checkout -H 'Content-Type: application/json' -d '{\"order_uuid\":\"test-invalid\"}'"
```
Expected: `{"message":"Missing required customer fields."}` (400 response — means endpoint is live)

### 5. Test the Leafly scraper on 3 products
Run the PHP scraper on product IDs 1, 5, and 10 in dry-run mode:
```bash
/c/xampp/php/php.exe c:\BudStore\scrape-leafly.php --dry-run --product-id=1
/c/xampp/php/php.exe c:\BudStore\scrape-leafly.php --dry-run --product-id=5
/c/xampp/php/php.exe c:\BudStore\scrape-leafly.php --dry-run --product-id=10
```
Expected: Each shows `✓ Matched` with a description preview.

### 6. Check module status
```bash
docker exec budstore-drupal-1 bash -c "cd /var/www/html && vendor/bin/drush pml --status=Enabled --type=module | grep -E 'commerce_api|budstore|commerce_cod|commerce_payment'"
```
Expected: Shows `commerce_api`, `budstore_checkout`, `commerce_payment` as Enabled.

### 7. Check anonymous user permissions
```bash
docker exec budstore-drupal-1 bash -c "cd /var/www/html && vendor/bin/drush php-script /tmp/verify.php"
```
(The `/tmp/verify.php` script was created in a previous session — if it doesn't exist, create a simple script to check: `\Drupal\user\Entity\Role::load('anonymous')->getPermissions()`)

---

## Write a Verification Report

After running all checks, create a report file at:
`c:\BudStore\tasks\verification-report.md`

Format:
```markdown
# BudStore API Verification Report
Date: YYYY-MM-DD

## Endpoints
| Endpoint | Status |
|---|---|
| GET /jsonapi/commerce_product/flower | ✓ 200 |
...

## Field: field_leafly_data
- Present in JSON:API response: Yes/No
- Current value: null (not yet populated)

## Leafly Scraper Test
| Product | Strain | Score | Description chars |
|---|---|---|---|
| Connected Cannabis — Biscotti | Biscotti | 1.00 | 845 |
...

## Modules
| Module | Status |
|---|---|
| commerce_api | Enabled |
...

## Issues Found
- (list any issues)

## Recommendations
- (list next steps)
```

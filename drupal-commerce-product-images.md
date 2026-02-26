# BudStore: Product Images — End-to-End Implementation Guide

Adding product images to Drupal Commerce and surfacing them in the React storefront.

---

## Overview

This guide covers four phases:

1. **Drupal Setup** — Enable Media, add `field_image` to all product types
2. **Image Sourcing** — Where and how to get brand product images
3. **Bulk Import Script** — PHP/Drush script to attach images to existing products
4. **React Storefront** — Update `api.js` and `StorePage.js` to display images

---

## Phase 1: Drupal Setup

### 1.1 Enable Required Modules

```bash
composer require drupal/media drupal/media_library
drush en media media_library image -y
drush cr
```

### 1.2 Create a Product Image Media Type

Navigate to: **Structure → Media types → Add media type**

| Setting | Value |
|---|---|
| Label | Product Image |
| Machine name | `product_image` |
| Media source | Image |
| Allowed file extensions | `png jpg jpeg webp` |
| Maximum upload size | `5 MB` |
| Maximum image dimensions | `1200x1200` |

Save the media type.

Then navigate to **Manage fields** on the media type and confirm these fields exist:
- `field_media_image` (Image) — auto-created by the Image source

---

### 1.3 Add `field_image` to Each Product Type

Repeat this for all 9 product types:
`flower`, `pre_roll`, `concentrate`, `vape_cartridge`, `edible`, `tincture`, `topical`, `accessory`, `cannabis_clone_seed`

Navigate to: **Commerce → Configuration → Product types → [Product Type] → Manage fields → Add field**

| Setting | Value |
|---|---|
| Field type | Media |
| Label | Product Image |
| Machine name | `field_image` |
| Allowed media types | Product Image |
| Required | No |
| Cardinality | 1 (or unlimited for multiple angles) |

Repeat for every product type. Then run:

```bash
drush cr
drush config:export -y
```

---

### 1.4 Configure Image Styles

Navigate to: **Configuration → Media → Image styles → Add image style**

Create these two styles:

#### Thumbnail (product table/grid)
| Setting | Value |
|---|---|
| Machine name | `product_thumbnail` |
| Effect | Scale and Crop |
| Width | `200` |
| Height | `200` |

#### Full (product detail page)
| Setting | Value |
|---|---|
| Machine name | `product_full` |
| Effect | Scale |
| Width | `600` |
| Height | (leave blank — proportional) |

---

### 1.5 Expose Images via JSON:API

JSON:API exposes media entities automatically once the Media module is enabled. Verify the endpoint works:

```
GET http://localhost:8080/jsonapi/media/product_image
```

You should receive a JSON:API response listing all uploaded media entities.

To get an image URL from a product, the fetch chain is:

```
Product → field_image (media entity) → field_media_image (file entity) → uri
```

This requires two levels of `include` in the JSON:API request (covered in Phase 4).

---

## Phase 2: Image Sourcing

### 2.1 Strategy Options

| Strategy | Best For | Notes |
|---|---|---|
| Brand websites | Branded products (Stiiizy, Raw Garden, etc.) | Highest quality; check ToS |
| Leafly / Weedmaps | Strain photos, generic cannabis types | Good fallbacks |
| Brand press kits | Major brands | Email brand@[company].com |
| Google Images (licensed) | Quick fill | Filter by "Creative Commons" |
| AI-generated | Generic category images | Good for category fallbacks |
| Dispensary photography | In-house products | Best for house brands |

### 2.2 Priority Brand Image Sources

These are the brands currently in the BudStore catalog. Locate press kits or product images from their official sites:

| Brand | Website | Notes |
|---|---|---|
| Stiiizy | stiiizy.com | Has a brand asset portal |
| Raw Garden | rawgarden.farm | Press kit available |
| Alien Labs | alienlabsofficial.com | High-res product shots |
| Jeeter | jeeter.com | Brand assets on site |
| Kanha | kanhakannabis.com | Press kit available |
| Wyld | wyldcbd.com | Full press kit |
| Camino (Kiva) | kivacandies.com/media | Media page available |
| Select | selectcbd.com | Brand assets available |
| Heavy Hitters | heavyhitterscannabis.com | Press kit available |
| PLUS Products | plusproducts.com | Brand page |

### 2.3 Image Naming Convention

Use a consistent naming scheme before uploading:

```
{brand-slug}--{product-title-slug}--{sku}.jpg

Examples:
  stiiizy--blue-dream-1g-pod--OP-V-001.jpg
  raw-garden--papaya-punch-live-resin--OP-C-001.jpg
  kanha--watermelon-gummies--OP-E-001.jpg
```

### 2.4 Image Requirements

| Spec | Requirement |
|---|---|
| Format | JPG or WebP preferred (PNG acceptable) |
| Minimum size | 600 × 600 px |
| Maximum file size | 5 MB |
| Background | White or transparent preferred |
| Orientation | Square (1:1 ratio) ideal for grid display |

### 2.5 Organize Images Before Upload

Create a local folder structure before bulk importing:

```
product-images/
├── flower/
│   ├── stiiizy--blue-dream-1g--OP-F-001.jpg
│   └── raw-garden--papaya-punch--OP-F-002.jpg
├── pre_roll/
│   └── jeeter--watermelon-infused--OP-PR-001.jpg
├── vape_cartridge/
│   ├── stiiizy--blue-dream-pod--OP-V-001.jpg
│   └── heavy-hitters--og-kush-cart--OP-V-002.jpg
├── concentrate/
│   └── raw-garden--live-resin--OP-C-001.jpg
├── edible/
│   ├── kanha--watermelon-gummies--OP-E-001.jpg
│   └── camino--sparkling-pear--OP-E-002.jpg
├── tincture/
├── topical/
├── accessory/
└── cannabis_clone_seed/
```

Copy this folder into the Docker container or a web-accessible path before running the import script.

---

## Phase 3: Bulk Image Import Script

### 3.1 Copy Images into the Container

```bash
# From your host machine
docker cp ./product-images/ drupal:/var/www/html/product-images/
```

Or place images at a web-accessible URL (CDN, S3, etc.) and use the URL-based import path below.

### 3.2 Create the Import Script

Create `attach-product-images.php` in `C:\BudStore\`:

```php
<?php

/**
 * Attach product images to existing Drupal Commerce products.
 * Run with: drush php-script attach-product-images.php
 *
 * Images must be placed at /var/www/html/product-images/{type}/{filename}
 * or provide a URL in the $images array below.
 */

use Drupal\commerce_product\Entity\Product;
use Drupal\media\Entity\Media;
use Drupal\file\Entity\File;

// ─── Image Map ───────────────────────────────────────────────────
// Format: 'SKU' => ['path' => '/absolute/path/or/url', 'alt' => 'Alt text']
// SKU must match the variation SKU used in build-all-store-products.php
//
// Example:
// 'OP-F-001' => ['path' => '/var/www/html/product-images/flower/stiiizy--blue-dream.jpg', 'alt' => 'Stiiizy Blue Dream 1g'],

$image_map = [
  // ── ONE PLANT (OP) ──────────────────────────────
  // Flower
  'OP-F-001' => ['path' => '/var/www/html/product-images/flower/stiiizy--blue-dream.jpg',      'alt' => 'Stiiizy Blue Dream 1g Flower'],
  'OP-F-002' => ['path' => '/var/www/html/product-images/flower/raw-garden--papaya-punch.jpg', 'alt' => 'Raw Garden Papaya Punch'],
  // Pre-Roll
  'OP-PR-001' => ['path' => '/var/www/html/product-images/pre_roll/jeeter--watermelon.jpg',    'alt' => 'Jeeter Watermelon Infused Pre-Roll'],
  // Vape
  'OP-V-001'  => ['path' => '/var/www/html/product-images/vape_cartridge/stiiizy--blue-dream-pod.jpg', 'alt' => 'Stiiizy Blue Dream Pod'],
  // Edible
  'OP-E-001'  => ['path' => '/var/www/html/product-images/edible/kanha--watermelon.jpg',       'alt' => 'Kanha Watermelon Gummies'],

  // ── Add all other store SKUs below ──────────────
  // RHE-F-001, TRD-F-001, BD-F-001, MJD-F-001, LEAF-F-001 ...
];

// ─── Helper: create or reuse a managed file ──────────────────────
function get_or_create_file(string $source_path): ?File {
  // Copy the file into Drupal's public files directory
  $filename  = basename($source_path);
  $dest_uri  = 'public://product-images/' . $filename;

  // Avoid duplicates
  $existing = \Drupal::entityTypeManager()->getStorage('file')
    ->loadByProperties(['uri' => $dest_uri]);
  if ($existing) {
    return reset($existing);
  }

  // Ensure the target directory exists
  \Drupal::service('file_system')->prepareDirectory(
    'public://product-images/',
    \Drupal\Core\File\FileSystemInterface::CREATE_DIRECTORY
  );

  // Copy file into managed storage
  $file_system = \Drupal::service('file_system');
  $real_dest   = $file_system->realpath($dest_uri) ?: \Drupal::service('stream_wrapper_manager')
    ->getViaUri($dest_uri)->realpath();

  if (!copy($source_path, \Drupal::service('stream_wrapper_manager')->getViaUri($dest_uri)->realpath() ?: 'public://product-images/' . $filename)) {
    // Fallback: use file_save_data
  }

  $file = File::create([
    'uri'    => $dest_uri,
    'status' => 1,
  ]);
  $file->save();
  return $file;
}

// ─── Helper: create a Media entity wrapping a file ───────────────
function create_media_entity(File $file, string $alt): Media {
  $media = Media::create([
    'bundle'            => 'product_image',
    'name'              => $alt,
    'field_media_image' => [
      'target_id' => $file->id(),
      'alt'       => $alt,
    ],
    'status' => 1,
  ]);
  $media->save();
  return $media;
}

// ─── Main: iterate products, match by SKU, attach image ──────────
$attached = 0;
$skipped  = 0;
$errors   = [];

$product_storage = \Drupal::entityTypeManager()->getStorage('commerce_product');
$variation_storage = \Drupal::entityTypeManager()->getStorage('commerce_product_variation');

foreach ($image_map as $sku => $img_info) {
  // 1. Find variation by SKU
  $variations = $variation_storage->loadByProperties(['sku' => $sku]);
  if (empty($variations)) {
    echo "  SKIP: No variation found for SKU $sku\n";
    $skipped++;
    continue;
  }

  $variation = reset($variations);

  // 2. Load the parent product
  $products = $product_storage->loadByProperties([]);
  $product  = NULL;
  foreach ($product_storage->loadMultiple() as $p) {
    foreach ($p->getVariationIds() as $vid) {
      if ($vid == $variation->id()) {
        $product = $p;
        break 2;
      }
    }
  }

  if (!$product) {
    echo "  SKIP: Could not find parent product for SKU $sku\n";
    $skipped++;
    continue;
  }

  // 3. Skip if image already attached
  if ($product->hasField('field_image') && !$product->get('field_image')->isEmpty()) {
    echo "  SKIP: Product already has image — {$product->getTitle()} (SKU: $sku)\n";
    $skipped++;
    continue;
  }

  // 4. Verify image file exists
  if (!file_exists($img_info['path'])) {
    echo "  ERROR: Image file not found: {$img_info['path']} (SKU: $sku)\n";
    $errors[] = $sku;
    continue;
  }

  // 5. Create managed file + media entity
  $file  = get_or_create_file($img_info['path']);
  $media = create_media_entity($file, $img_info['alt']);

  // 6. Attach media to product
  $product->set('field_image', ['target_id' => $media->id()]);
  $product->save();

  echo "  OK: Attached image to \"{$product->getTitle()}\" (SKU: $sku)\n";
  $attached++;
}

echo "\n=== Done ===\n";
echo "Attached: $attached\n";
echo "Skipped:  $skipped\n";
echo "Errors:   " . count($errors) . "\n";
if ($errors) {
  echo "Failed SKUs: " . implode(', ', $errors) . "\n";
}
```

### 3.3 Run the Script

```bash
drush php-script attach-product-images.php
```

### 3.4 Verify Images in the Admin UI

1. Navigate to **Commerce → Products**
2. Edit any product you imported an image for
3. Confirm the **Product Image** field is populated
4. Preview the image thumbnail

---

### 3.5 Alternative: Upload via Drupal Admin UI (Manual)

For small batches or one-off updates:

1. Go to **Commerce → Products**
2. Click **Edit** on any product
3. Scroll to the **Product Image** field
4. Click **Add media** → upload the image file
5. Fill in the Alt text field
6. Save

---

### 3.6 Alternative: Import via URL (No Docker Copy Needed)

If images are hosted on a CDN or public URL, use this approach in the script instead of local file paths:

```php
// In your $image_map, use full URLs:
'OP-F-001' => [
  'path' => 'https://your-cdn.com/images/stiiizy-blue-dream.jpg',
  'alt'  => 'Stiiizy Blue Dream 1g',
],

// And in get_or_create_file(), replace the copy() call with:
$file_data = file_get_contents($source_path);
$file = \Drupal::service('file.repository')->writeData(
  $file_data,
  'public://product-images/' . basename($source_path),
  \Drupal\Core\File\FileExists::Replace
);
```

---

## Phase 4: Update the React API Layer

The JSON:API request needs two additional `include` values to traverse the relationship chain:

```
Product → field_image (Media) → field_media_image (File)
```

Update [cannabis-store-viewer/src/api.js](cannabis-store-viewer/src/api.js) — change the `include` line in `fetchProductsForStore`:

**Before:**
```js
const include = "include=variations,field_brand";
```

**After:**
```js
const include = "include=variations,field_brand,field_image,field_image.field_media_image";
```

Then extract the image URL in the product mapping block. Add this after the `variationMap` block:

```js
// Build a map: media entity UUID → image file URL
const mediaMap = {};
if (json.included) {
  // File entities
  const fileMap = {};
  json.included
    .filter((inc) => inc.type === "file--file")
    .forEach((f) => {
      fileMap[f.id] = f.attributes.uri?.url || null;
    });

  // Media entities — resolve their file reference
  json.included
    .filter((inc) => inc.type === "media--product_image")
    .forEach((m) => {
      const fileRef = m.relationships?.field_media_image?.data;
      mediaMap[m.id] = fileRef ? fileMap[fileRef.id] || null : null;
    });
}
```

And add `imageUrl` to the returned product object:

```js
return {
  id: product.id,
  internalId: product.attributes.drupal_internal__product_id,
  title: product.attributes.title,
  type,
  typeLabel: PRODUCT_TYPE_LABELS[type] || type,
  brand: brandName,
  price: lowestPrice,
  variationCount: variations.length,
  imageUrl: (() => {
    const mediaRef = product.relationships?.field_image?.data;
    const rawUrl = mediaRef ? mediaMap[mediaRef.id] || null : null;
    // Drupal returns relative URIs like "/sites/default/files/..."
    // Prepend the base URL to make them absolute
    return rawUrl ? (rawUrl.startsWith("http") ? rawUrl : `${BASE}${rawUrl}`) : null;
  })(),
};
```

---

## Phase 5: Display Images in the React Storefront

### 5.1 Product Table with Thumbnail Column

Update [cannabis-store-viewer/src/components/StorePage.js](cannabis-store-viewer/src/components/StorePage.js):

Add an **Image** column to the table:

```jsx
// In the <thead>:
<tr>
  <th className="img-col"></th>   {/* new */}
  <th>Product</th>
  <th>Brand</th>
  <th>Category</th>
  <th className="price-col">Price</th>
</tr>

// In the <tbody> row:
<tr key={p.id}>
  <td className="img-col">                  {/* new */}
    {p.imageUrl ? (
      <img
        src={p.imageUrl}
        alt={p.title}
        className="product-thumb"
      />
    ) : (
      <div className="product-thumb product-thumb--placeholder" />
    )}
  </td>
  <td className="product-name">{p.title}</td>
  <td>{p.brand || "\u2014"}</td>
  <td><span className="category-badge">{p.typeLabel}</span></td>
  <td className="price-col">
    {p.price !== null ? `$${p.price.toFixed(2)}` : "\u2014"}
  </td>
</tr>
```

### 5.2 Add CSS for Product Thumbnails

Add to [cannabis-store-viewer/src/App.css](cannabis-store-viewer/src/App.css):

```css
/* Product image thumbnail */
.img-col {
  width: 64px;
  padding: 6px 8px;
}

.product-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  display: block;
}

.product-thumb--placeholder {
  background: #f0f0f0;
}
```

---

## Verification Checklist

After completing all phases, verify the following:

### Drupal
- [ ] Media module enabled (`drush pm:list --filter=name=media`)
- [ ] `field_image` field exists on all 9 product types
- [ ] `product_thumbnail` and `product_full` image styles created
- [ ] At least one product has an image attached in the admin UI
- [ ] JSON:API returns `field_image` relationship: `GET /jsonapi/commerce_product/flower?include=field_image,field_image.field_media_image`

### React App
- [ ] `api.js` includes `field_image,field_image.field_media_image` in the include string
- [ ] `imageUrl` is present in the product object (`console.log` to verify)
- [ ] Product table renders a thumbnail for products with images
- [ ] Placeholder renders for products without images
- [ ] Images load correctly (check browser Network tab for 200 responses)

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `field_image` not showing in JSON:API | Field not added to product type | Re-add field via Manage Fields |
| Image URL is `null` in React | Wrong include path in fetch | Verify `field_image.field_media_image` in include |
| Image URL is relative (no domain) | Drupal returns `/sites/default/files/...` | Prepend `BASE` URL in api.js (covered above) |
| CORS error loading image | Drupal CORS policy blocks `localhost:3000` | Add `localhost:3000` to CORS allowed origins |
| `file not found` in import script | Image path wrong or not copied to container | Verify with `docker exec drupal ls /var/www/html/product-images/` |
| Media module missing `product_image` bundle | Media type not created | Follow Step 1.2 to create the media type |
| Images too large / slow to load | No image style applied | Append `?imagestyle=product_thumbnail` or use Drupal image style derivatives |

---

## JSON:API Image URL Reference

Once images are attached, a full product fetch returns:

```json
{
  "data": {
    "type": "commerce_product--flower",
    "id": "abc-123",
    "attributes": { "title": "Blue Dream 1g" },
    "relationships": {
      "field_image": {
        "data": { "type": "media--product_image", "id": "media-uuid-here" }
      }
    }
  },
  "included": [
    {
      "type": "media--product_image",
      "id": "media-uuid-here",
      "relationships": {
        "field_media_image": {
          "data": { "type": "file--file", "id": "file-uuid-here" }
        }
      }
    },
    {
      "type": "file--file",
      "id": "file-uuid-here",
      "attributes": {
        "uri": { "url": "/sites/default/files/product-images/stiiizy--blue-dream.jpg" }
      }
    }
  ]
}
```

The final image URL is:
```
http://localhost:8080 + /sites/default/files/product-images/stiiizy--blue-dream.jpg
```

---

*Last updated: February 2026 | Drupal 10 + Commerce 2.x | React 19*

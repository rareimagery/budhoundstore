# BudHound: Product Image Auto-Fetch Feature

## Overview

When a new cannabis product is added to the BudHound platform without an accompanying image, the system should automatically search for and suggest (or attach) a relevant product image. This reduces manual effort for dispensary operators and ensures every product listing has a visual representation in the marketplace.

The feature leverages **Google Custom Search JSON API** to perform image searches based on product metadata (strain name, product type, etc.) and integrates directly into the Drupal Commerce backend and React admin UI.

---

## Architecture

### System Flow

```
┌─────────────────────┐
│  Admin Creates       │
│  New Product         │
│  (no image uploaded) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Drupal Hook Fires   │
│  hook_entity_presave │
│  on product entity   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐       ┌──────────────────────────┐
│  Build Search Query  │──────▶│  Google Custom Search API │
│  from product fields │       │  (Image Search)           │
└──────────┬──────────┘       └──────────┬───────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────┐       ┌──────────────────────────┐
│  React Admin UI      │◀──────│  Return Top 4-6 Results  │
│  Image Picker Modal  │       │  with thumbnails          │
└──────────┬──────────┘       └──────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Download Selected   │
│  Image → Drupal      │
│  Media Entity        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Attach to Product   │
│  Image Field         │
└─────────────────────┘
```

### Components

| Component | Role | Location |
|-----------|------|----------|
| `budhound_image_fetch` | Custom Drupal module handling API calls and image download | `/modules/custom/budhound_image_fetch/` |
| `ImageSuggestModal` | React component for admin image picker UI | `/src/components/admin/ImageSuggestModal.jsx` |
| Google CSE Config | Programmable Search Engine for web-wide image search | Google Cloud Console |
| Drupal Media System | Stores and manages downloaded images | Core Media module |

---

## Google Custom Search API Setup

### 1. Create a Programmable Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Create a new search engine
3. Under **"Sites to search"**, select **"Search the entire web"**
4. Enable **"Image search"** in the CSE settings
5. Note the **Search Engine ID (cx)**

### 2. Get an API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the **Custom Search API**
4. Create an API key under **Credentials**
5. (Recommended) Restrict the key to the Custom Search API only

### 3. Pricing

| Tier | Queries | Cost |
|------|---------|------|
| Free | 100/day | $0 |
| Paid | 10,000/day | $5 per 1,000 queries |

For product catalog management, the free tier (100 queries/day) should be more than sufficient. A dispensary adding 10-20 new products per day would use well under the limit.

### 4. API Endpoint

```
GET https://www.googleapis.com/customsearch/v1
  ?q={search_query}
  &searchType=image
  &key={API_KEY}
  &cx={CSE_ID}
  &num=6
  &safe=active
  &imgSize=large
```

**Response fields of interest:**

```json
{
  "items": [
    {
      "title": "Lemon OG Strain - Cannabis Photos",
      "link": "https://example.com/images/lemon-og.jpg",
      "image": {
        "contextLink": "https://example.com/strains/lemon-og",
        "height": 800,
        "width": 1200,
        "thumbnailLink": "https://encrypted-tbn0.gstatic.com/...",
        "thumbnailHeight": 120,
        "thumbnailWidth": 180
      }
    }
  ]
}
```

---

## Search Query Construction

The quality of image results depends heavily on how the search query is built from product data. The module should construct queries intelligently from available product fields.

### Query Template

```
"{strain_name}" {product_type} cannabis
```

### Examples

| Product Fields | Generated Query |
|---------------|-----------------|
| Strain: Lemon OG, Type: Flower | `"lemon og" flower cannabis` |
| Strain: Blue Dream, Type: Cartridge | `"blue dream" cartridge cannabis` |
| Strain: Wedding Cake, Type: Edible, Form: Gummy | `"wedding cake" gummy edible cannabis` |
| Strain: GSC, Type: Concentrate, Form: Shatter | `"gsc" shatter concentrate cannabis` |
| Brand: Stiiizy, Type: Pod | `stiiizy pod cannabis` |

### Query Builder Logic (Pseudocode)

```php
function buildImageSearchQuery($product) {
    $parts = [];

    // Strain name in quotes for exact match
    if ($strain = $product->get('field_strain_name')->value) {
        $parts[] = '"' . $strain . '"';
    }

    // Product form if available (gummy, shatter, wax, etc.)
    if ($form = $product->get('field_product_form')->value) {
        $parts[] = strtolower($form);
    }

    // Product type (flower, edible, concentrate, cartridge, etc.)
    if ($type = $product->get('field_product_type')->value) {
        $parts[] = strtolower($type);
    }

    // Brand name for branded products
    if ($brand = $product->get('field_brand')->value) {
        $parts[] = $brand;
    }

    // Always append cannabis to filter results
    $parts[] = 'cannabis';

    return implode(' ', $parts);
}
```

### Query Optimization Tips

- Wrap strain names in quotes for exact matching (`"lemon og"` not `lemon og`)
- Include the product type to differentiate between flower photos vs. edible packaging
- For branded products (Stiiizy, Raw Garden, etc.), prioritize brand name over strain name
- Append `cannabis` or `marijuana` to avoid non-cannabis results (e.g., "wedding cake" returning actual cakes)
- For edibles and cartridges, adding the brand often yields better packaging photos

---

## Drupal Module: `budhound_image_fetch`

### Module Structure

```
modules/custom/budhound_image_fetch/
├── budhound_image_fetch.info.yml
├── budhound_image_fetch.module
├── budhound_image_fetch.services.yml
├── budhound_image_fetch.routing.yml
├── config/
│   └── install/
│       └── budhound_image_fetch.settings.yml
└── src/
    ├── Controller/
    │   └── ImageSearchController.php
    ├── Service/
    │   └── GoogleImageSearch.php
    └── Form/
        └── ImageFetchSettingsForm.php
```

### Configuration (`budhound_image_fetch.settings.yml`)

```yaml
google_api_key: ''
google_cse_id: ''
auto_attach: false          # If true, auto-attach first result (no UI picker)
max_results: 6              # Number of results to return for UI picker
safe_search: 'active'       # Google SafeSearch setting
default_image_size: 'large' # imgSize parameter
fallback_enabled: true      # Use fallback image if no results found
fallback_image_uuid: ''     # UUID of default product placeholder image
```

### Service: `GoogleImageSearch`

```php
<?php

namespace Drupal\budhound_image_fetch\Service;

use GuzzleHttp\ClientInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\media\Entity\Media;
use Drupal\file\Entity\File;

class GoogleImageSearch {

  const API_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';

  protected $httpClient;
  protected $config;
  protected $fileSystem;

  public function __construct(
    ClientInterface $http_client,
    ConfigFactoryInterface $config_factory,
    FileSystemInterface $file_system
  ) {
    $this->httpClient = $http_client;
    $this->config = $config_factory->get('budhound_image_fetch.settings');
    $this->fileSystem = $file_system;
  }

  /**
   * Search for product images via Google CSE.
   *
   * @param string $query
   *   The search query string.
   * @param int $num
   *   Number of results to return (max 10).
   *
   * @return array
   *   Array of image result objects.
   */
  public function search(string $query, int $num = 6): array {
    $response = $this->httpClient->request('GET', self::API_ENDPOINT, [
      'query' => [
        'q' => $query,
        'searchType' => 'image',
        'key' => $this->config->get('google_api_key'),
        'cx' => $this->config->get('google_cse_id'),
        'num' => min($num, 10),
        'safe' => $this->config->get('safe_search') ?: 'active',
        'imgSize' => $this->config->get('default_image_size') ?: 'large',
      ],
    ]);

    $data = json_decode($response->getBody(), TRUE);
    return $data['items'] ?? [];
  }

  /**
   * Download an image from URL and create a Drupal Media entity.
   *
   * @param string $url
   *   The image URL to download.
   * @param string $filename
   *   Desired filename for the saved image.
   *
   * @return \Drupal\media\Entity\Media|null
   *   The created Media entity, or NULL on failure.
   */
  public function downloadAndCreateMedia(string $url, string $filename): ?Media {
    try {
      $response = $this->httpClient->request('GET', $url, [
        'timeout' => 15,
        'headers' => [
          'User-Agent' => 'BudHound/1.0',
        ],
      ]);

      $content_type = $response->getHeader('Content-Type')[0] ?? '';
      $extension = $this->getExtensionFromMime($content_type);

      if (!$extension) {
        return NULL;
      }

      $directory = 'public://product-images/' . date('Y-m');
      $this->fileSystem->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY);

      $sanitized = preg_replace('/[^a-z0-9\-]/', '-', strtolower($filename));
      $filepath = $directory . '/' . $sanitized . '.' . $extension;

      $file_uri = $this->fileSystem->saveData(
        $response->getBody(),
        $filepath,
        FileSystemInterface::EXISTS_RENAME
      );

      $file = File::create([
        'uri' => $file_uri,
        'status' => 1,
      ]);
      $file->save();

      $media = Media::create([
        'bundle' => 'image',
        'name' => $filename,
        'field_media_image' => [
          'target_id' => $file->id(),
          'alt' => $filename,
        ],
      ]);
      $media->save();

      return $media;
    }
    catch (\Exception $e) {
      \Drupal::logger('budhound_image_fetch')
        ->error('Failed to download image from @url: @message', [
          '@url' => $url,
          '@message' => $e->getMessage(),
        ]);
      return NULL;
    }
  }

  /**
   * Map MIME type to file extension.
   */
  protected function getExtensionFromMime(string $mime): ?string {
    $map = [
      'image/jpeg' => 'jpg',
      'image/png' => 'png',
      'image/webp' => 'webp',
      'image/gif' => 'gif',
    ];
    return $map[$mime] ?? NULL;
  }
}
```

### Controller: JSON API Endpoint for React

```php
<?php

namespace Drupal\budhound_image_fetch\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ImageSearchController extends ControllerBase {

  /**
   * Search for product images.
   *
   * GET /api/budhound/image-search?q=lemon+og+flower+cannabis
   */
  public function search(Request $request): JsonResponse {
    $query = $request->query->get('q');

    if (empty($query)) {
      return new JsonResponse(['error' => 'Missing query parameter'], 400);
    }

    $service = \Drupal::service('budhound_image_fetch.google_image_search');
    $results = $service->search($query);

    $images = array_map(function ($item) {
      return [
        'title' => $item['title'] ?? '',
        'url' => $item['link'] ?? '',
        'thumbnail' => $item['image']['thumbnailLink'] ?? '',
        'width' => $item['image']['width'] ?? 0,
        'height' => $item['image']['height'] ?? 0,
        'source' => $item['image']['contextLink'] ?? '',
      ];
    }, $results);

    return new JsonResponse(['images' => $images]);
  }

  /**
   * Download and attach an image to a product.
   *
   * POST /api/budhound/image-download
   * Body: { "url": "https://...", "product_id": 123, "filename": "lemon-og-flower" }
   */
  public function download(Request $request): JsonResponse {
    $data = json_decode($request->getContent(), TRUE);

    if (empty($data['url']) || empty($data['product_id'])) {
      return new JsonResponse(['error' => 'Missing required fields'], 400);
    }

    $service = \Drupal::service('budhound_image_fetch.google_image_search');
    $media = $service->downloadAndCreateMedia(
      $data['url'],
      $data['filename'] ?? 'product-image'
    );

    if (!$media) {
      return new JsonResponse(['error' => 'Failed to download image'], 500);
    }

    // Attach to product
    $product = \Drupal::entityTypeManager()
      ->getStorage('commerce_product')
      ->load($data['product_id']);

    if ($product) {
      $product->set('field_product_image', [
        'target_id' => $media->id(),
      ]);
      $product->save();
    }

    return new JsonResponse([
      'success' => TRUE,
      'media_id' => $media->id(),
    ]);
  }
}
```

### Routing (`budhound_image_fetch.routing.yml`)

```yaml
budhound_image_fetch.search:
  path: '/api/budhound/image-search'
  defaults:
    _controller: '\Drupal\budhound_image_fetch\Controller\ImageSearchController::search'
  requirements:
    _permission: 'administer commerce_product'
  methods: [GET]

budhound_image_fetch.download:
  path: '/api/budhound/image-download'
  defaults:
    _controller: '\Drupal\budhound_image_fetch\Controller\ImageSearchController::download'
  requirements:
    _permission: 'administer commerce_product'
  methods: [POST]
```

---

## React Admin UI: Image Suggest Modal

### `ImageSuggestModal.jsx`

```jsx
import React, { useState, useCallback } from 'react';

const ImageSuggestModal = ({ product, onImageSelected, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Build default query from product data
  const buildDefaultQuery = useCallback(() => {
    const parts = [];
    if (product.strainName) parts.push(`"${product.strainName}"`);
    if (product.productForm) parts.push(product.productForm.toLowerCase());
    if (product.productType) parts.push(product.productType.toLowerCase());
    if (product.brand) parts.push(product.brand);
    parts.push('cannabis');
    return parts.join(' ');
  }, [product]);

  const handleSearch = async (query) => {
    const q = query || buildDefaultQuery();
    setSearchQuery(q);
    setLoading(true);
    setSelectedIndex(null);

    try {
      const response = await fetch(
        `/api/budhound/image-search?q=${encodeURIComponent(q)}`
      );
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Image search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async () => {
    if (selectedIndex === null) return;
    setDownloading(true);

    const selected = images[selectedIndex];
    try {
      const response = await fetch('/api/budhound/image-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: selected.url,
          product_id: product.id,
          filename: `${product.strainName || 'product'}-${product.productType || 'image'}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onImageSelected(data.media_id);
        onClose();
      }
    } catch (error) {
      console.error('Image download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="image-suggest-overlay">
      <div className="image-suggest-modal">
        <div className="modal-header">
          <h3>Suggest Product Image</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for product images..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          />
          <button onClick={() => handleSearch(searchQuery)}>Search</button>
          <button onClick={() => handleSearch(buildDefaultQuery())} className="auto-btn">
            Auto-Search
          </button>
        </div>

        <div className="image-grid">
          {loading ? (
            <div className="loading">Searching for images...</div>
          ) : images.length > 0 ? (
            images.map((img, index) => (
              <div
                key={index}
                className={`image-card ${selectedIndex === index ? 'selected' : ''}`}
                onClick={() => setSelectedIndex(index)}
              >
                <img src={img.thumbnail} alt={img.title} />
                <span className="image-size">{img.width}×{img.height}</span>
              </div>
            ))
          ) : (
            <div className="no-results">
              No images found. Try adjusting your search query.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button
            onClick={handleSelect}
            disabled={selectedIndex === null || downloading}
            className="select-btn"
          >
            {downloading ? 'Downloading...' : 'Use Selected Image'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSuggestModal;
```

### Integration in Product Form

```jsx
// In your product creation/edit form component:

const ProductForm = () => {
  const [showImageSuggest, setShowImageSuggest] = useState(false);
  const [productImage, setProductImage] = useState(null);

  const handleImageUploaded = (imageData) => {
    setProductImage(imageData);
  };

  const handleSuggestedImage = (mediaId) => {
    setProductImage({ mediaId, source: 'suggested' });
  };

  return (
    <form>
      {/* ... other product fields ... */}

      <div className="image-field">
        <label>Product Image</label>

        {productImage ? (
          <div className="image-preview">
            {/* Show current image */}
          </div>
        ) : (
          <div className="image-actions">
            <input type="file" onChange={handleImageUploaded} accept="image/*" />
            <span>or</span>
            <button
              type="button"
              onClick={() => setShowImageSuggest(true)}
              className="suggest-btn"
            >
              🔍 Find Image Online
            </button>
          </div>
        )}
      </div>

      {showImageSuggest && (
        <ImageSuggestModal
          product={productData}
          onImageSelected={handleSuggestedImage}
          onClose={() => setShowImageSuggest(false)}
        />
      )}
    </form>
  );
};
```

---

## Auto-Attach Mode (Background Fallback)

For bulk imports or cases where no admin interaction is desired, the module can auto-attach the first search result on product save.

### `budhound_image_fetch.module`

```php
<?php

use Drupal\commerce_product\Entity\ProductInterface;

/**
 * Implements hook_entity_presave() for commerce_product.
 */
function budhound_image_fetch_commerce_product_presave(ProductInterface $product) {
  $config = \Drupal::config('budhound_image_fetch.settings');

  // Only run in auto-attach mode
  if (!$config->get('auto_attach')) {
    return;
  }

  // Check if product already has an image
  if (!$product->get('field_product_image')->isEmpty()) {
    return;
  }

  // Build search query from product fields
  $query = _budhound_image_fetch_build_query($product);

  if (empty($query)) {
    return;
  }

  /** @var \Drupal\budhound_image_fetch\Service\GoogleImageSearch $search */
  $search = \Drupal::service('budhound_image_fetch.google_image_search');
  $results = $search->search($query, 1);

  if (!empty($results[0]['link'])) {
    $filename = _budhound_image_fetch_build_filename($product);
    $media = $search->downloadAndCreateMedia($results[0]['link'], $filename);

    if ($media) {
      $product->set('field_product_image', ['target_id' => $media->id()]);
      \Drupal::logger('budhound_image_fetch')
        ->info('Auto-attached image for product @title', [
          '@title' => $product->getTitle(),
        ]);
    }
  }
  elseif ($config->get('fallback_enabled') && $config->get('fallback_image_uuid')) {
    // Attach fallback/placeholder image
    $media = \Drupal::service('entity.repository')
      ->loadEntityByUuid('media', $config->get('fallback_image_uuid'));
    if ($media) {
      $product->set('field_product_image', ['target_id' => $media->id()]);
    }
  }
}

/**
 * Build a search query from product fields.
 */
function _budhound_image_fetch_build_query(ProductInterface $product): string {
  $parts = [];

  $field_map = [
    'field_strain_name' => TRUE,   // Wrap in quotes
    'field_product_form' => FALSE,
    'field_product_type' => FALSE,
    'field_brand' => FALSE,
  ];

  foreach ($field_map as $field => $quote) {
    if ($product->hasField($field) && !$product->get($field)->isEmpty()) {
      $value = $product->get($field)->value;
      $parts[] = $quote ? '"' . $value . '"' : strtolower($value);
    }
  }

  $parts[] = 'cannabis';

  return implode(' ', $parts);
}

/**
 * Build a sanitized filename from product fields.
 */
function _budhound_image_fetch_build_filename(ProductInterface $product): string {
  $parts = [];

  foreach (['field_strain_name', 'field_product_type'] as $field) {
    if ($product->hasField($field) && !$product->get($field)->isEmpty()) {
      $parts[] = $product->get($field)->value;
    }
  }

  return !empty($parts) ? implode('-', $parts) : 'product-image';
}
```

---

## Compliance & Legal Considerations

### Image Licensing

- Google Image Search results may be subject to copyright. For a commercial platform like BudHound, consider:
  - Adding a **license filter** to the API request: `&rights=cc_publicdomain,cc_attribute` for Creative Commons images
  - Having admins manually verify image appropriateness before publishing
  - Using the **UI picker approach** (not auto-attach) for production to ensure human review
  - Building a curated library over time so common strains don't need repeated searches

### Cannabis-Specific Considerations

- All product images should comply with California cannabis advertising regulations
- Images should not appeal to minors or make health claims
- Product packaging photos should match the actual product being sold
- Consider maintaining an internal image library for popular strains to reduce API dependency and ensure consistency

---

## Configuration Admin Page

### `ImageFetchSettingsForm.php`

```php
<?php

namespace Drupal\budhound_image_fetch\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class ImageFetchSettingsForm extends ConfigFormBase {

  protected function getEditableConfigNames() {
    return ['budhound_image_fetch.settings'];
  }

  public function getFormId() {
    return 'budhound_image_fetch_settings';
  }

  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('budhound_image_fetch.settings');

    $form['google_api_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Google API Key'),
      '#default_value' => $config->get('google_api_key'),
      '#required' => TRUE,
    ];

    $form['google_cse_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Google Custom Search Engine ID'),
      '#default_value' => $config->get('google_cse_id'),
      '#required' => TRUE,
    ];

    $form['auto_attach'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Auto-attach first image result (no UI confirmation)'),
      '#description' => $this->t('When enabled, the first search result will be automatically attached to products without images on save. Recommended only for bulk imports.'),
      '#default_value' => $config->get('auto_attach'),
    ];

    $form['max_results'] = [
      '#type' => 'number',
      '#title' => $this->t('Max image results'),
      '#default_value' => $config->get('max_results') ?: 6,
      '#min' => 1,
      '#max' => 10,
    ];

    $form['fallback_enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Use fallback placeholder image'),
      '#default_value' => $config->get('fallback_enabled'),
    ];

    return parent::buildForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('budhound_image_fetch.settings')
      ->set('google_api_key', $form_state->getValue('google_api_key'))
      ->set('google_cse_id', $form_state->getValue('google_cse_id'))
      ->set('auto_attach', $form_state->getValue('auto_attach'))
      ->set('max_results', $form_state->getValue('max_results'))
      ->set('fallback_enabled', $form_state->getValue('fallback_enabled'))
      ->save();

    parent::submitForm($form, $form_state);
  }
}
```

---

## Alternative Image Sources

While Google CSE is the primary approach, these supplementary sources can improve image quality for cannabis-specific products:

| Source | Pros | Cons |
|--------|------|------|
| **Google CSE** | Wide coverage, easy API | May return non-cannabis results, licensing concerns |
| **Leafly API** | Curated cannabis images, strain data | API access may be restricted, limited to known strains |
| **Weedmaps** | Dispensary product photos | Scraping ToS issues, less reliable |
| **Internal Library** | Full control, consistent quality | Requires manual curation effort |
| **Unsplash API** | Free, high quality, licensed | Limited cannabis-specific content |

### Recommended Hybrid Approach

1. **First**: Check internal curated image library (keyed by strain name + product type)
2. **Second**: Fall back to Google CSE if no internal match
3. **Third**: Use placeholder image with visual indicator prompting admin to upload a real image

---

## Future Enhancements

- **AI-based image quality scoring** — Use image classification to rank search results by relevance and quality before presenting to admin
- **Strain database integration** — Pre-populate a curated image library from strain databases for common strains
- **Duplicate detection** — Hash-based checking to avoid downloading the same image for different products
- **Batch image fetch** — Admin tool to search and attach images for all products missing images in one workflow
- **Image optimization pipeline** — Auto-resize, compress, and convert to WebP on download for optimal marketplace performance
- **User-contributed images** — Allow verified dispensary admins to contribute product photos that get shared across the platform

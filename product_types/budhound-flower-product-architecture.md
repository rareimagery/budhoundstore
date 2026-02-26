# BudHound Flower Product Type Architecture
## Drupal Commerce Implementation Guide

---

## Overview

Flower (cannabis bud) is the most traditional and highest-volume cannabis product category. It requires detailed strain-level data, cannabinoid and terpene profiles, cultivation metadata, and weight-based pricing — all of which make it one of the more data-rich product types in the catalog.

This document covers the full Drupal Commerce architecture for flower products including pre-rolls, which share strain lineage but differ in format and attributes.

---

## 1. Product Variation Types

### `flower_eighth` / `flower_quarter` / `flower_half` / `flower_ounce`

Rather than one variation type per weight, use a single `flower_bud` variation type with a `weight_tier` attribute. This keeps SKU management clean while allowing different prices per weight.

#### `flower_bud`
| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | 3.5, 7, 14, 28 — drives price tier |
| `weight_tier` | List | Eighth, Quarter, Half, Ounce |
| `price` | Commerce price | Per weight tier |
| `stock_quantity` | Integer | Per SKU |

#### `flower_preroll`
| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | Per roll (0.5g, 0.75g, 1g, 1.5g) |
| `pack_count` | Integer | Single (1) or multi-pack (2, 5, 10) |
| `filter_type` | List | Cotton, glass tip, none |
| `infused` | Boolean | Infused with concentrate or kief |
| `infusion_type` | Text | Distillate, live resin, kief, hash |
| `infusion_mg` | Decimal | mg of added concentrate if infused |

#### `flower_shake`
| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | Typically sold in larger quantities |
| `trim_type` | List | Shake, trim, popcorn buds |

#### `flower_moonrock`
| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | |
| `base_strain` | Text | Base flower strain used |
| `concentrate_coating` | Text | Oil type used |
| `kief_strain` | Text | Kief origin strain |
| `total_thc_percent` | Decimal | Typically 50%+ |

---

## 2. Shared Base Fields

All flower variation types inherit these fields via `hook_entity_base_field_info()`.

```php
function budhound_flower_entity_base_field_info(EntityTypeInterface $entity_type) {
  $fields = [];

  if ($entity_type->id() === 'commerce_product_variation') {
    // Cannabinoid Profile
    $fields['thc_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('THC (%)'))
      ->setRequired(TRUE);

    $fields['thca_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('THCA (%)'));

    $fields['cbd_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('CBD (%)'));

    $fields['cbg_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('CBG (%)'));

    $fields['cbn_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('CBN (%)'));

    $fields['total_cannabinoids_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Total Cannabinoids (%)'));

    // Terpene Profile (top 5 most commercially relevant)
    $fields['terpene_myrcene'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Myrcene (%)'));

    $fields['terpene_limonene'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Limonene (%)'));

    $fields['terpene_caryophyllene'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Caryophyllene (%)'));

    $fields['terpene_linalool'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Linalool (%)'));

    $fields['terpene_pinene'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Pinene (%)'));

    $fields['total_terpenes_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Total Terpenes (%)'));

    // Compliance & Tracking
    $fields['batch_number'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Batch Number'))
      ->setRequired(TRUE);

    $fields['metrc_uid'] = BaseFieldDefinition::create('string')
      ->setLabel(t('METRC UID'))
      ->setRequired(TRUE);

    $fields['harvest_date'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t('Harvest Date'));

    $fields['package_date'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t('Package Date'));

    $fields['expiration_date'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t('Expiration Date'));

    $fields['lab_tested'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Lab Tested'))
      ->setDefaultValue(FALSE);

    $fields['coa_document'] = BaseFieldDefinition::create('file')
      ->setLabel(t('Certificate of Analysis'))
      ->setSetting('file_extensions', 'pdf');
  }

  return $fields;
}
```

---

## 3. Product Type: `flower_product`

The parent entity that groups all weight-tier variations under a single strain listing.

| Field | Type | Notes |
|---|---|---|
| `title` | String | Strain name (e.g., "Blue Dream") |
| `body` | Long text | Full strain description |
| `field_strain_name` | String | Canonical strain name |
| `field_strain_type` | Term ref | Indica / Sativa / Hybrid |
| `field_indica_sativa_ratio` | String | e.g., "70% Indica / 30% Sativa" |
| `field_genetics` | String | Parent strains (e.g., "Blueberry × Haze") |
| `field_grower` | Entity ref | Licensed cultivator/brand |
| `field_store` | Entity ref | Multi-store isolation |
| `field_grow_type` | Term ref | Indoor, outdoor, greenhouse, light dep |
| `field_cure_type` | Term ref | Hang-dry, machine trim, hand trim |
| `field_effects` | Term ref (multi) | Euphoric, relaxed, creative, sleepy, etc. |
| `field_flavors` | Term ref (multi) | Earthy, citrus, pine, sweet, diesel, etc. |
| `field_aromas` | Term ref (multi) | Skunky, floral, fruity, spicy, etc. |
| `field_medical_uses` | Term ref (multi) | Pain, anxiety, insomnia, appetite, etc. |
| `field_featured_image` | Image | Primary bud photo |
| `field_gallery_images` | Image (multi) | Additional product photos |
| `field_video_url` | String | Optional strain spotlight video |
| `field_age_restricted` | Boolean | Always TRUE |
| `field_warnings` | Long text | Required CA cannabis warnings |

---

## 4. Taxonomy Vocabularies

### `flower_strain_types`
- Indica
- Sativa
- Hybrid
- CBD-Dominant
- High-CBD / Low-THC

### `flower_grow_environments`
- Indoor
- Outdoor
- Greenhouse
- Light Deprivation
- Sun+Soil (Craft Outdoor)

### `flower_effects`
- Euphoric
- Relaxed
- Happy
- Creative
- Energetic
- Focused
- Sleepy
- Hungry
- Uplifted
- Talkative

### `flower_flavors`
- Earthy
- Citrus
- Pine
- Sweet
- Berry
- Diesel
- Spicy
- Herbal
- Tropical
- Woody
- Grape
- Mint

### `flower_aromas`
- Skunky
- Floral
- Fruity
- Spicy / Herbal
- Diesel
- Earthy
- Sweet
- Citrus
- Woody

### `flower_medical_uses`
- Chronic Pain
- Anxiety & Stress
- Insomnia
- Depression
- Appetite Loss
- Nausea
- Inflammation
- Muscle Spasms
- Headaches / Migraines
- PTSD

---

## 5. Compliance Requirements

### METRC Integration
Every flower SKU must carry a METRC UID (`field_metrc_uid`). This links the Drupal Commerce variation to California's track-and-trace system. On order placement, the METRC UID must be recorded against the sale.

```php
// src/EventSubscriber/FlowerComplianceSubscriber.php
class FlowerComplianceSubscriber implements EventSubscriberInterface {

  public static function getSubscribedEvents() {
    return [
      OrderEvents::ORDER_PLACE => 'onOrderPlace',
    ];
  }

  public function onOrderPlace(OrderEvent $event) {
    $order = $event->getOrder();
    foreach ($order->getItems() as $item) {
      $variation = $item->getPurchasedEntity();
      if ($variation->bundle() === 'flower_bud' || $variation->bundle() === 'flower_preroll') {
        $metrc_uid = $variation->get('metrc_uid')->value;
        if (empty($metrc_uid)) {
          throw new \Exception('Cannot place order: flower product missing METRC UID.');
        }
        // Log to METRC reporting queue
        \Drupal::queue('metrc_sale_reporter')->createItem([
          'metrc_uid' => $metrc_uid,
          'quantity' => $item->getQuantity(),
          'order_id' => $order->id(),
        ]);
      }
    }
  }
}
```

### Daily Purchase Limits
California limits adults to 1 ounce (28.5g) of flower per transaction. Enforce this at checkout:

```php
// In order constraint or checkout pane
$total_flower_grams = 0;
foreach ($order->getItems() as $item) {
  $variation = $item->getPurchasedEntity();
  if (in_array($variation->bundle(), ['flower_bud', 'flower_preroll', 'flower_shake'])) {
    $grams = $variation->get('weight_grams')->value;
    $total_flower_grams += ($grams * $item->getQuantity());
  }
}
if ($total_flower_grams > 28.5) {
  // Block checkout, surface error to React frontend
}
```

---

## 6. COA (Certificate of Analysis) Entity

Same `cbd_lab_report` pattern adapted for flower — attach as `field_lab_reports` on variations.

| Field | Type | Notes |
|---|---|---|
| `lab_name` | String | Steep Hill, SC Labs, Anresco, etc. |
| `test_date` | Date | |
| `batch_number` | String | |
| `thc_percent_actual` | Decimal | Tested THC |
| `thca_percent_actual` | Decimal | |
| `cbd_percent_actual` | Decimal | |
| `total_cannabinoids_actual` | Decimal | |
| `terpene_profile_json` | Long text | Full terpene breakdown as JSON |
| `moisture_content` | Decimal | % moisture |
| `pesticides_pass` | Boolean | |
| `heavy_metals_pass` | Boolean | |
| `microbials_pass` | Boolean | |
| `mycotoxins_pass` | Boolean | |
| `foreign_matter_pass` | Boolean | |
| `coa_pdf` | File | |
| `qr_code_url` | String | |

---

## 7. JSON:API Configuration

### Endpoints

```
/jsonapi/commerce_product/flower_product
/jsonapi/commerce_product_variation/flower_bud
/jsonapi/commerce_product_variation/flower_preroll
/jsonapi/commerce_product_variation/flower_shake
/jsonapi/commerce_product_variation/flower_moonrock
/jsonapi/taxonomy_term/flower_strain_types
/jsonapi/taxonomy_term/flower_effects
/jsonapi/taxonomy_term/flower_flavors
/jsonapi/taxonomy_term/flower_medical_uses
```

### Example Query — Strain Filtering

```
GET /jsonapi/commerce_product/flower_product
  ?include=variations,field_grower,field_effects,field_flavors,variations.field_lab_reports
  &filter[field_store.id][value]={store_uuid}
  &filter[field_strain_type.name][value]=Indica
  &filter[status][value]=1
  &sort=-variations.thc_percent
```

### React Fetch with Terpene + Effect Filtering

```javascript
const fetchFlowerByEffects = async (effects = [], strainType, storeId) => {
  const params = new URLSearchParams({
    'include': 'variations,field_grower,field_effects,field_flavors,field_strain_type',
    'filter[field_store.id][value]': storeId,
    'filter[status][value]': '1',
  });

  if (strainType) {
    params.append('filter[field_strain_type.name][value]', strainType);
  }

  effects.forEach((effect, i) => {
    params.append(`filter[effects][condition][path]`, 'field_effects.name');
    params.append(`filter[effects][condition][value][${i}]`, effect);
    params.append(`filter[effects][condition][operator]`, 'IN');
  });

  const res = await fetch(`/jsonapi/commerce_product/flower_product?${params}`, {
    headers: { 'Content-Type': 'application/vnd.api+json' },
  });
  return res.json();
};
```

---

## 8. Module Structure

```
web/modules/custom/budhound_flower/
├── budhound_flower.info.yml
├── budhound_flower.module                    # Base fields, hooks
├── budhound_flower.install                   # Vocabularies, default terms
├── config/
│   └── install/
│       ├── commerce_product_type.flower_product.yml
│       ├── commerce_product_variation_type.flower_bud.yml
│       ├── commerce_product_variation_type.flower_preroll.yml
│       ├── commerce_product_variation_type.flower_shake.yml
│       ├── commerce_product_variation_type.flower_moonrock.yml
│       ├── taxonomy.vocabulary.flower_strain_types.yml
│       ├── taxonomy.vocabulary.flower_grow_environments.yml
│       ├── taxonomy.vocabulary.flower_effects.yml
│       ├── taxonomy.vocabulary.flower_flavors.yml
│       ├── taxonomy.vocabulary.flower_aromas.yml
│       ├── taxonomy.vocabulary.flower_medical_uses.yml
│       └── field.storage.*.yml
├── src/
│   ├── Plugin/
│   │   └── Validation/
│   │       └── Constraint/
│   │           ├── FlowerWeightLimitConstraint.php
│   │           └── FlowerWeightLimitConstraintValidator.php
│   └── EventSubscriber/
│       └── FlowerComplianceSubscriber.php
└── tests/
    └── src/
        └── Kernel/
            └── FlowerProductTest.php
```

---

## 9. Implementation Order

1. Create shared field storage for cannabinoid and terpene fields
2. Create `flower_bud` variation type — pilot the weight tier pattern
3. Create `flower_preroll` variation type
4. Create `flower_product` product type with all strain fields
5. Create taxonomy vocabularies and populate default terms
6. Wire JSON:API with strain/effect filtering and test in React
7. Implement 28.5g daily purchase limit constraint at checkout
8. Implement METRC UID validation and sale reporting queue
9. Build `flower_lab_report` entity and attach to variations
10. Add shake and moonrock variation types
11. Implement terpene profile display in React product detail view

---

## 10. React Display Considerations

- **Terpene wheel / chart** — visualize top terpenes via recharts or d3; high engagement feature
- **THC/CBD percentage bar** — visual indicator on product cards drives clicks
- **Strain type badge** — color-coded Indica / Sativa / Hybrid pill on card
- **Effect tags** — clickable filter chips on the marketplace browse view
- **"Similar Strains"** — query by shared effects + strain type for upsell
- **COA viewer** — inline PDF viewer or link to hosted COA for transparency

---

*Document maintained by BudHound development team. Verify METRC API integration requirements with California DCC before go-live.*

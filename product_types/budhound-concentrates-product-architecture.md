# BudHound Concentrates Product Type Architecture
## Drupal Commerce Implementation Guide

---

## Overview

Concentrates are the most technically complex cannabis product category to model — they span wildly different physical forms (wax, shatter, oil, rosin, live resin, distillate, hash), require extraction method and source material metadata, and contain some of the highest THC percentages in the catalog (often 70–99%). This complexity demands careful variation type design and robust cannabinoid/terpene field coverage.

This document covers the full Drupal Commerce architecture for cannabis concentrate products including dabbables, cartridges, and refined oils sold as standalone products (cartridges attached to hardware are covered in the Vapes architecture doc).

---

## 1. Product Variation Types

### `concentrate_wax`
Broad category covering budder, crumble, sugar, badder, and similar soft/malleable forms.

| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | 0.5g, 1g, 2g common sizes |
| `consistency_type` | List | Budder, crumble, sugar, badder, sauce |
| `color` | Text | Visual descriptor (amber, gold, white) |

### `concentrate_shatter`
| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | |
| `transparency` | List | Shatter, pull-and-snap, glass |

### `concentrate_rosin`
Solventless extraction — premium positioning.

| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | |
| `rosin_type` | List | Flower rosin, hash rosin, live rosin |
| `press_temp_f` | Integer | Extraction temp if disclosed |
| `micron_bag` | Integer | Micron filter size (25, 45, 72, 90, 120, 160) |
| `yield_percent` | Decimal | Optional — some producers disclose |

### `concentrate_live_resin`
| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | |
| `live_resin_form` | List | Sauce, sugar, badder, diamonds, full melt |
| `thca_diamonds` | Boolean | Contains crystalline THCA |
| `terpene_sauce_included` | Boolean | Separated sauce included |

### `concentrate_distillate`
Highly refined, used in edibles and vapes but also sold standalone.

| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | Often sold in syringes (0.5g, 1g) |
| `format` | List | Syringe, jar, cartridge-fill |
| `purity_percent` | Decimal | Distillate potency (often 90%+) |
| `terpenes_added` | Boolean | Re-introduced after distillation |
| `terpene_source` | List | Cannabis-derived, botanical, none |

### `concentrate_hash`
Traditional and modern hash forms.

| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | |
| `hash_type` | List | Dry sift, bubble hash, hand-rolled, Lebanese, Moroccan, ice water |
| `grade` | List | Full melt (6-star), half melt, cooking grade |
| `micron_range` | String | e.g., "73–120 micron" |
| `ice_water` | Boolean | Ice water / bubble hash specifically |

### `concentrate_kief`
| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | |
| `sieve_micron` | Integer | |
| `source_strain` | Text | If single-origin |

### `concentrate_diamonds` (THCA Crystalline)
| Field | Type | Notes |
|---|---|---|
| `weight_grams` | Decimal | |
| `thca_percent` | Decimal | Often 95–99% |
| `with_sauce` | Boolean | Sold with terpene sauce |
| `sauce_terpene_profile` | Long text | Terpene breakdown JSON |

---

## 2. Shared Base Fields

```php
function budhound_concentrates_entity_base_field_info(EntityTypeInterface $entity_type) {
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

    $fields['total_cannabinoids_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Total Cannabinoids (%)'));

    // Terpene Fields
    $fields['total_terpenes_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Total Terpenes (%)'));

    $fields['terpene_profile_json'] = BaseFieldDefinition::create('string_long')
      ->setLabel(t('Full Terpene Profile (JSON)'))
      ->setDescription(t('Serialized terpene breakdown for API delivery'));

    // Source Material
    $fields['source_strain'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Source Strain'))
      ->setDescription(t('Strain(s) used as input material'));

    $fields['source_material'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Source Material'))
      ->setSetting('allowed_values', [
        'fresh_frozen' => 'Fresh Frozen',
        'cured' => 'Cured Flower',
        'trim' => 'Trim',
        'mixed' => 'Mixed / House Blend',
      ]);

    // Extraction
    $fields['extraction_method'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Extraction Method'))
      ->setSetting('allowed_values', [
        'bho' => 'BHO (Butane)',
        'co2' => 'CO2',
        'ethanol' => 'Ethanol',
        'solventless' => 'Solventless / Mechanical',
        'ice_water' => 'Ice Water',
        'rosin_press' => 'Rosin Press',
        'distillation' => 'Distillation',
      ]);

    $fields['solventless'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Solventless'))
      ->setDefaultValue(FALSE);

    // Compliance & Traceability
    $fields['batch_number'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Batch Number'))
      ->setRequired(TRUE);

    $fields['metrc_uid'] = BaseFieldDefinition::create('string')
      ->setLabel(t('METRC UID'))
      ->setRequired(TRUE);

    $fields['manufacture_date'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t('Manufacture Date'));

    $fields['expiration_date'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t('Expiration Date'));

    $fields['lab_tested'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Lab Tested'))
      ->setDefaultValue(FALSE);

    $fields['coa_document'] = BaseFieldDefinition::create('file')
      ->setLabel(t('Certificate of Analysis'))
      ->setSetting('file_extensions', 'pdf');

    $fields['residual_solvents_pass'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Residual Solvents: Pass'))
      ->setDescription(t('Mandatory for solvent-based extracts'));
  }

  return $fields;
}
```

---

## 3. Product Type: `concentrate_product`

| Field | Type | Notes |
|---|---|---|
| `title` | String | Product name (e.g., "Blue Dream Live Resin") |
| `body` | Long text | Description |
| `field_concentrate_category` | Term ref | Wax, rosin, hash, distillate, etc. |
| `field_extraction_type_display` | Term ref | Solvent-based, solventless, CO2 |
| `field_source_strain_display` | String | Human-readable strain name |
| `field_brand` | Entity ref | Licensed processor/brand |
| `field_store` | Entity ref | Multi-store isolation |
| `field_consistency` | Term ref | Physical texture/form |
| `field_effects` | Term ref (multi) | Euphoric, relaxed, focused, etc. |
| `field_flavors` | Term ref (multi) | Taste profile terms |
| `field_aromas` | Term ref (multi) | Scent profile terms |
| `field_medical_uses` | Term ref (multi) | Pain, anxiety, etc. |
| `field_featured_image` | Image | |
| `field_gallery_images` | Image (multi) | |
| `field_solventless_badge` | Boolean | Display premium solventless flag in UI |
| `field_live_product_badge` | Boolean | Fresh frozen / live designation |
| `field_age_restricted` | Boolean | Always TRUE |
| `field_warnings` | Long text | Required CA cannabis warnings |

---

## 4. Taxonomy Vocabularies

### `concentrate_categories`
- Wax / Badder / Budder
- Crumble
- Shatter
- Rosin (Flower)
- Rosin (Hash / Live)
- Live Resin
- Live Resin Sauce
- THCA Diamonds
- Distillate
- Kief
- Dry Sift Hash
- Bubble Hash / Ice Water Hash
- Hand-Rolled Hash
- Infused Pre-Roll (see Flower doc)

### `concentrate_extraction_types`
- BHO (Butane Hash Oil)
- CO2
- Ethanol / ETOH
- Solventless / Mechanical
- Ice Water
- Rosin Press
- Distillation / Winterization

### `concentrate_consistencies`
- Shatter
- Pull-and-Snap
- Wax
- Crumble
- Sugar
- Badder / Budder
- Sauce
- Crystalline / Diamonds
- Oil / Distillate
- Powder / Kief
- Pressed / Brick
- Full Melt Hash

### `concentrate_source_materials`
- Fresh Frozen
- Cured Flower
- Trim
- Mixed / House Blend
- Single Origin
- Whole Plant

---

## 5. Compliance Requirements

### Residual Solvent Testing
California requires residual solvent testing for all hydrocarbon extracts (BHO, ethanol). The `residual_solvents_pass` field must be `TRUE` before a product can be listed.

```php
// src/Plugin/Validation/Constraint/ResiduaLSolventConstraint.php
// Triggered on variation save for all solvent-based concentrate bundles
public function validate($entity, Constraint $constraint) {
  $solventless = $entity->get('solventless')->value;
  $solvent_pass = $entity->get('residual_solvents_pass')->value;

  if (!$solventless && !$solvent_pass) {
    $this->context->addViolation($constraint->message);
  }
}
```

### Concentrate Purchase Limits
California limits concentrate purchases to **8 grams** per transaction.

```php
$total_concentrate_grams = 0;
foreach ($order->getItems() as $item) {
  $variation = $item->getPurchasedEntity();
  $concentrate_bundles = [
    'concentrate_wax', 'concentrate_shatter', 'concentrate_rosin',
    'concentrate_live_resin', 'concentrate_distillate',
    'concentrate_hash', 'concentrate_kief', 'concentrate_diamonds',
  ];
  if (in_array($variation->bundle(), $concentrate_bundles)) {
    $grams = $variation->get('weight_grams')->value;
    $total_concentrate_grams += ($grams * $item->getQuantity());
  }
}
if ($total_concentrate_grams > 8) {
  // Block checkout, surface error to React frontend
}
```

### METRC Traceability
All concentrate products require METRC UIDs linking to California's track-and-trace system. Concentrates are manufactured goods and require a different METRC package type than flower.

---

## 6. COA (Certificate of Analysis) Entity

Concentrates require the most extensive lab testing of any product category. Use the shared `lab_report` entity with concentrate-specific pass/fail fields.

| Field | Type | Notes |
|---|---|---|
| `lab_name` | String | |
| `test_date` | Date | |
| `batch_number` | String | |
| `thc_percent_actual` | Decimal | |
| `thca_percent_actual` | Decimal | |
| `cbd_percent_actual` | Decimal | |
| `total_cannabinoids_actual` | Decimal | |
| `terpene_profile_json` | Long text | Full terpene breakdown |
| `residual_solvents_pass` | Boolean | Required for non-solventless |
| `residual_solvents_detail` | Long text | Specific solvent levels |
| `pesticides_pass` | Boolean | |
| `heavy_metals_pass` | Boolean | |
| `microbials_pass` | Boolean | |
| `mycotoxins_pass` | Boolean | |
| `water_activity` | Decimal | aW value |
| `moisture_content` | Decimal | |
| `coa_pdf` | File | |
| `qr_code_url` | String | |

---

## 7. JSON:API Configuration

### Endpoints

```
/jsonapi/commerce_product/concentrate_product
/jsonapi/commerce_product_variation/concentrate_wax
/jsonapi/commerce_product_variation/concentrate_shatter
/jsonapi/commerce_product_variation/concentrate_rosin
/jsonapi/commerce_product_variation/concentrate_live_resin
/jsonapi/commerce_product_variation/concentrate_distillate
/jsonapi/commerce_product_variation/concentrate_hash
/jsonapi/commerce_product_variation/concentrate_kief
/jsonapi/commerce_product_variation/concentrate_diamonds
/jsonapi/taxonomy_term/concentrate_categories
/jsonapi/taxonomy_term/concentrate_consistencies
```

### Example Query — Solventless Only

```
GET /jsonapi/commerce_product/concentrate_product
  ?include=variations,field_brand,field_effects,variations.field_lab_reports
  &filter[field_store.id][value]={store_uuid}
  &filter[field_solventless_badge][value]=1
  &filter[status][value]=1
  &sort=-variations.thc_percent
```

### React Fetch Example

```javascript
const fetchConcentrates = async ({ category, solventlessOnly, storeId }) => {
  const params = new URLSearchParams({
    'include': 'variations,field_brand,field_concentrate_category,field_effects',
    'filter[field_store.id][value]': storeId,
    'filter[status][value]': '1',
  });

  if (category) {
    params.append('filter[field_concentrate_category.name][value]', category);
  }
  if (solventlessOnly) {
    params.append('filter[field_solventless_badge][value]', '1');
  }

  const res = await fetch(`/jsonapi/commerce_product/concentrate_product?${params}`, {
    headers: { 'Content-Type': 'application/vnd.api+json' },
  });
  return res.json();
};
```

---

## 8. Module Structure

```
web/modules/custom/budhound_concentrates/
├── budhound_concentrates.info.yml
├── budhound_concentrates.module
├── budhound_concentrates.install
├── config/
│   └── install/
│       ├── commerce_product_type.concentrate_product.yml
│       ├── commerce_product_variation_type.concentrate_wax.yml
│       ├── commerce_product_variation_type.concentrate_shatter.yml
│       ├── commerce_product_variation_type.concentrate_rosin.yml
│       ├── commerce_product_variation_type.concentrate_live_resin.yml
│       ├── commerce_product_variation_type.concentrate_distillate.yml
│       ├── commerce_product_variation_type.concentrate_hash.yml
│       ├── commerce_product_variation_type.concentrate_kief.yml
│       ├── commerce_product_variation_type.concentrate_diamonds.yml
│       ├── taxonomy.vocabulary.concentrate_categories.yml
│       ├── taxonomy.vocabulary.concentrate_extraction_types.yml
│       ├── taxonomy.vocabulary.concentrate_consistencies.yml
│       ├── taxonomy.vocabulary.concentrate_source_materials.yml
│       └── field.storage.*.yml
├── src/
│   ├── Plugin/
│   │   └── Validation/
│   │       └── Constraint/
│   │           ├── ResidualSolventConstraint.php
│   │           ├── ResidualSolventConstraintValidator.php
│   │           ├── ConcentrateWeightLimitConstraint.php
│   │           └── ConcentrateWeightLimitConstraintValidator.php
│   └── EventSubscriber/
│       └── ConcentrateComplianceSubscriber.php
└── tests/
    └── src/
        └── Kernel/
            └── ConcentrateProductTest.php
```

---

## 9. Implementation Order

1. Create shared field storage for cannabinoid, terpene, extraction, and source material fields
2. Create `concentrate_wax` and `concentrate_rosin` variation types as pilots
3. Create `concentrate_product` product type
4. Create all four taxonomy vocabularies
5. Wire JSON:API with solventless and category filtering, test in React
6. Implement residual solvent validation constraint
7. Implement 8g daily purchase limit at checkout
8. Implement METRC UID validation and manufactured product reporting
9. Build COA entity with concentrate-specific test fields
10. Add remaining variation types (shatter, live resin, distillate, hash, kief, diamonds)

---

## 10. React Display Considerations

- **Solventless badge** — high-visibility premium flag; solventless products command higher prices and loyal buyers search specifically for them
- **Extraction method chip** — BHO / CO2 / Rosin / Ice Water displayed prominently
- **Consistency visual guide** — tooltip or modal explaining the difference between shatter, badder, sugar for new consumers
- **Potency range display** — concentrates vary 60–99% THC; a visual range bar per product type sets expectations
- **"How to consume" info panel** — concentrates require hardware (rig, e-nail, dab pen); surface recommended consumption method and link to vape/hardware section
- **Live vs. Cured badge** — fresh frozen / live products command premium positioning; surface in card view

---

*Document maintained by BudHound development team. Residual solvent limits are defined by California DCC testing requirements — verify current thresholds before compliance implementation.*

# BudHound Edibles Product Type Architecture
## Drupal Commerce Implementation Guide

---

## Overview

Edibles are the most consumer-friendly and highest-growth cannabis product category — they're accessible, discreet, and preferred by non-smokers. However, they're also the most regulated in California, with strict per-serving and per-package dosing limits, comprehensive labeling requirements, and mandatory dietary disclosure obligations. The product catalog spans gummies, chocolates, beverages, mints, baked goods, capsules, and sublingual tinctures, each requiring distinct attribute sets.

This document covers the complete Drupal Commerce architecture for cannabis edible products.

---

## 1. Product Variation Types

### `edible_gummy`
The dominant edible format. High SKU variety due to flavor, potency, and pack size combinations.

| Field | Type | Notes |
|---|---|---|
| `mg_thc_per_piece` | Decimal | CA limit: 10mg per piece |
| `mg_cbd_per_piece` | Decimal | |
| `pieces_per_package` | Integer | CA limit: 100mg total per package |
| `total_mg_thc` | Decimal | Computed: mg_per_piece × pieces |
| `flavor` | Text | Watermelon, mango, mixed berry, etc. |
| `form_factor` | List | Single gummy, gummy bear, worm, ring, cube |

### `edible_chocolate`
| Field | Type | Notes |
|---|---|---|
| `mg_thc_per_piece` | Decimal | Per square/serving |
| `mg_cbd_per_piece` | Decimal | |
| `pieces_per_package` | Integer | Squares per bar |
| `total_mg_thc` | Decimal | |
| `chocolate_type` | List | Dark, milk, white, ruby |
| `flavor` | Text | Sea salt, mint, caramel, plain |
| `weight_grams` | Decimal | Net weight of product |

### `edible_beverage`
| Field | Type | Notes |
|---|---|---|
| `mg_thc_per_serving` | Decimal | |
| `mg_cbd_per_serving` | Decimal | |
| `servings_per_container` | Integer | |
| `total_mg_thc` | Decimal | |
| `volume_ml` | Integer | Container volume |
| `beverage_type` | List | Sparkling water, lemonade, tea, coffee, shot, syrup |
| `flavor` | Text | |
| `carbonated` | Boolean | |
| `onset_minutes` | Integer | Estimated onset time |

### `edible_mint_tablet`
| Field | Type | Notes |
|---|---|---|
| `mg_thc_per_piece` | Decimal | Often micro-dosed: 1–5mg |
| `mg_cbd_per_piece` | Decimal | |
| `pieces_per_package` | Integer | |
| `total_mg_thc` | Decimal | |
| `flavor` | Text | Spearmint, peppermint, citrus |
| `sublingual` | Boolean | Designed to dissolve under tongue |
| `onset_minutes` | Integer | Faster onset if sublingual |

### `edible_baked_good`
| Field | Type | Notes |
|---|---|---|
| `mg_thc_per_piece` | Decimal | |
| `mg_cbd_per_piece` | Decimal | |
| `pieces_per_package` | Integer | |
| `total_mg_thc` | Decimal | |
| `baked_good_type` | List | Cookie, brownie, rice crispy, cracker |
| `flavor` | Text | |
| `weight_grams` | Decimal | Net weight |
| `expiration_date` | Date | Shorter shelf life — required |

### `edible_capsule`
Overlaps with CBD capsules but carries THC.

| Field | Type | Notes |
|---|---|---|
| `mg_thc_per_capsule` | Decimal | |
| `mg_cbd_per_capsule` | Decimal | |
| `capsule_count` | Integer | |
| `total_mg_thc` | Decimal | |
| `capsule_type` | List | Softgel, hard shell, time-release |
| `onset_minutes` | Integer | |

### `edible_tincture`
Liquid sublingual — different from CBD tinctures in potency and regulatory classification.

| Field | Type | Notes |
|---|---|---|
| `mg_thc_per_ml` | Decimal | |
| `mg_cbd_per_ml` | Decimal | |
| `volume_ml` | Integer | Bottle size |
| `total_mg_thc` | Decimal | |
| `carrier_oil` | Text | MCT, coconut, glycerin |
| `flavor` | Text | |
| `dropper_size_ml` | Decimal | Standard dropper volume |
| `onset_minutes` | Integer | Sublingual onset range |

### `edible_hard_candy`
| Field | Type | Notes |
|---|---|---|
| `mg_thc_per_piece` | Decimal | |
| `pieces_per_package` | Integer | |
| `total_mg_thc` | Decimal | |
| `flavor` | Text | |
| `candy_type` | List | Lollipop, hard candy, taffy, caramel |

---

## 2. Shared Base Fields

```php
function budhound_edibles_entity_base_field_info(EntityTypeInterface $entity_type) {
  $fields = [];

  if ($entity_type->id() === 'commerce_product_variation') {

    // Cannabinoid Profile
    $fields['thc_content_mg'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Total THC (mg)'))
      ->setRequired(TRUE);

    $fields['cbd_content_mg'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Total CBD (mg)'));

    $fields['cbn_content_mg'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('CBN (mg)'));

    $fields['cbg_content_mg'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('CBG (mg)'));

    // Dietary Information
    $fields['calories_per_serving'] = BaseFieldDefinition::create('integer')
      ->setLabel(t('Calories Per Serving'));

    $fields['sugar_grams_per_serving'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Sugar (g) Per Serving'));

    $fields['allergens'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Allergens'))
      ->setSetting('allowed_values', [
        'gluten' => 'Gluten / Wheat',
        'dairy' => 'Dairy / Milk',
        'eggs' => 'Eggs',
        'nuts' => 'Tree Nuts',
        'peanuts' => 'Peanuts',
        'soy' => 'Soy',
        'sesame' => 'Sesame',
      ])
      ->setCardinality(-1); // Multiple allergens

    $fields['dietary_tags'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Dietary Tags'))
      ->setSetting('allowed_values', [
        'vegan' => 'Vegan',
        'vegetarian' => 'Vegetarian',
        'gluten_free' => 'Gluten-Free',
        'sugar_free' => 'Sugar-Free',
        'kosher' => 'Kosher',
        'organic' => 'Organic',
        'non_gmo' => 'Non-GMO',
      ])
      ->setCardinality(-1);

    // Onset & Effects
    $fields['onset_minutes_min'] = BaseFieldDefinition::create('integer')
      ->setLabel(t('Onset Time Min (minutes)'));

    $fields['onset_minutes_max'] = BaseFieldDefinition::create('integer')
      ->setLabel(t('Onset Time Max (minutes)'));

    $fields['duration_hours_min'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Duration Min (hours)'));

    $fields['duration_hours_max'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Duration Max (hours)'));

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
      ->setLabel(t('Expiration Date'))
      ->setRequired(TRUE); // Required for all edibles

    $fields['lab_tested'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Lab Tested'))
      ->setDefaultValue(FALSE);

    $fields['coa_document'] = BaseFieldDefinition::create('file')
      ->setLabel(t('Certificate of Analysis'))
      ->setSetting('file_extensions', 'pdf');

    // California Required Label Fields
    $fields['serving_size_description'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Serving Size Description'))
      ->setDescription(t('e.g., "1 piece (3g)"'));

    $fields['servings_per_package_label'] = BaseFieldDefinition::create('integer')
      ->setLabel(t('Servings Per Package (label)'));

    $fields['ingredients_list'] = BaseFieldDefinition::create('string_long')
      ->setLabel(t('Ingredients List'))
      ->setRequired(TRUE);
  }

  return $fields;
}
```

---

## 3. Product Type: `edible_product`

| Field | Type | Notes |
|---|---|---|
| `title` | String | Product name |
| `body` | Long text | Description |
| `field_edible_category` | Term ref | Gummy, chocolate, beverage, etc. |
| `field_cannabinoid_type` | Term ref | THC, CBD, 1:1, CBN, CBG |
| `field_effects` | Term ref (multi) | Relaxed, sleepy, euphoric, creative |
| `field_use_cases` | Term ref (multi) | Sleep, pain, anxiety, recreation |
| `field_brand` | Entity ref | Licensed manufacturer |
| `field_store` | Entity ref | Multi-store isolation |
| `field_dietary_badges` | Term ref (multi) | Vegan, GF, sugar-free, etc. |
| `field_featured_image` | Image | |
| `field_gallery_images` | Image (multi) | |
| `field_child_resistant` | Boolean | CA requires child-resistant packaging |
| `field_opaque_packaging` | Boolean | CA requires opaque packaging |
| `field_not_for_minors_badge` | Boolean | Always TRUE |
| `field_age_restricted` | Boolean | Always TRUE |
| `field_warnings` | Long text | Required CA cannabis + food warnings |
| `field_nutrition_facts` | Paragraph | Structured nutrition label data |

---

## 4. California Dosing Limits

These are hard regulatory limits enforced at the variation level. Violations must block the product from being published.

| Limit | Requirement | Enforcement |
|---|---|---|
| Max 10mg THC per serving | All edible formats | Constraint on `mg_thc_per_piece` / `mg_thc_per_serving` |
| Max 100mg THC per package | All edible formats | Constraint on `total_mg_thc` |
| Individual servings must be marked | Physical scoring/wrapping | Label field validation |
| No mimicking non-cannabis food brands | Packaging | Admin review flag |
| Child-resistant packaging | All edibles | `field_child_resistant` must be TRUE |
| Opaque packaging | All edibles | `field_opaque_packaging` must be TRUE |

```php
// src/Plugin/Validation/Constraint/EdibleDosingConstraint.php
public function validate($entity, Constraint $constraint) {
  $edible_bundles = [
    'edible_gummy', 'edible_chocolate', 'edible_beverage',
    'edible_mint_tablet', 'edible_baked_good', 'edible_capsule',
    'edible_tincture', 'edible_hard_candy',
  ];

  if (!in_array($entity->bundle(), $edible_bundles)) {
    return;
  }

  // Check per-serving limit
  $per_serving_field = $entity->hasField('mg_thc_per_piece')
    ? 'mg_thc_per_piece' : 'mg_thc_per_serving';

  if ($entity->hasField($per_serving_field)) {
    $mg_per_serving = $entity->get($per_serving_field)->value;
    if ($mg_per_serving > 10) {
      $this->context->addViolation(
        'THC per serving (@mg mg) exceeds the California limit of 10mg.',
        ['@mg' => $mg_per_serving]
      );
    }
  }

  // Check per-package limit
  if ($entity->hasField('total_mg_thc')) {
    $total_mg = $entity->get('total_mg_thc')->value;
    if ($total_mg > 100) {
      $this->context->addViolation(
        'Total THC per package (@mg mg) exceeds the California limit of 100mg.',
        ['@mg' => $total_mg]
      );
    }
  }
}
```

---

## 5. Taxonomy Vocabularies

### `edible_categories`
- Gummy / Chew
- Chocolate / Bar
- Beverage
- Mint / Tablet
- Baked Good
- Capsule / Softgel
- Tincture / Sublingual
- Hard Candy / Lollipop
- Cooking / Baking (infused ingredients)

### `edible_cannabinoid_types`
- THC-Dominant
- CBD-Dominant
- 1:1 THC:CBD
- CBN (Sleep)
- CBG (Focus / Wellness)
- Micro-dose (1–5mg THC)
- Full Spectrum
- Broad Spectrum

### `edible_use_cases`
- Sleep & Relaxation
- Pain & Inflammation
- Anxiety & Stress
- Recreation & Social
- Focus & Productivity
- Appetite
- Nausea Relief
- Micro-dosing

### `edible_dietary_tags`
- Vegan
- Vegetarian
- Gluten-Free
- Sugar-Free
- Dairy-Free
- Kosher
- Organic
- Non-GMO

---

## 6. COA (Certificate of Analysis) Entity

| Field | Type | Notes |
|---|---|---|
| `lab_name` | String | |
| `test_date` | Date | |
| `batch_number` | String | |
| `thc_mg_per_unit_actual` | Decimal | Actual tested mg per serving |
| `total_thc_mg_actual` | Decimal | Actual total package potency |
| `cbd_mg_per_unit_actual` | Decimal | |
| `pesticides_pass` | Boolean | |
| `heavy_metals_pass` | Boolean | |
| `microbials_pass` | Boolean | |
| `mycotoxins_pass` | Boolean | |
| `foreign_matter_pass` | Boolean | |
| `water_activity` | Decimal | aW — critical for shelf-stable edibles |
| `moisture_content` | Decimal | |
| `homogeneity_pass` | Boolean | Even cannabinoid distribution in product |
| `coa_pdf` | File | |
| `qr_code_url` | String | |

> **Homogeneity testing** is particularly important for edibles — regulators and consumers need assurance that each piece/serving contains the labeled dose, not a concentrated or depleted portion.

---

## 7. JSON:API Configuration

### Endpoints

```
/jsonapi/commerce_product/edible_product
/jsonapi/commerce_product_variation/edible_gummy
/jsonapi/commerce_product_variation/edible_chocolate
/jsonapi/commerce_product_variation/edible_beverage
/jsonapi/commerce_product_variation/edible_mint_tablet
/jsonapi/commerce_product_variation/edible_baked_good
/jsonapi/commerce_product_variation/edible_capsule
/jsonapi/commerce_product_variation/edible_tincture
/jsonapi/commerce_product_variation/edible_hard_candy
/jsonapi/taxonomy_term/edible_categories
/jsonapi/taxonomy_term/edible_cannabinoid_types
/jsonapi/taxonomy_term/edible_use_cases
```

### Example Query — Sleep / CBN Products

```
GET /jsonapi/commerce_product/edible_product
  ?include=variations,field_brand,field_use_cases,field_cannabinoid_type
  &filter[field_store.id][value]={store_uuid}
  &filter[field_use_cases.name][value]=Sleep%20%26%20Relaxation
  &filter[status][value]=1
  &sort=variations.mg_thc_per_piece
```

### React Fetch — Dietary Filter

```javascript
const fetchEdibles = async ({ category, dietaryTags = [], useCase, storeId }) => {
  const params = new URLSearchParams({
    'include': 'variations,field_brand,field_edible_category,field_dietary_badges,field_use_cases',
    'filter[field_store.id][value]': storeId,
    'filter[status][value]': '1',
  });

  if (category) {
    params.append('filter[field_edible_category.name][value]', category);
  }
  if (useCase) {
    params.append('filter[field_use_cases.name][value]', useCase);
  }
  dietaryTags.forEach((tag, i) => {
    params.append(`filter[diet][condition][path]`, 'field_dietary_badges.name');
    params.append(`filter[diet][condition][value][${i}]`, tag);
    params.append(`filter[diet][condition][operator]`, 'IN');
  });

  const res = await fetch(`/jsonapi/commerce_product/edible_product?${params}`, {
    headers: { 'Content-Type': 'application/vnd.api+json' },
  });
  return res.json();
};
```

---

## 8. Module Structure

```
web/modules/custom/budhound_edibles/
├── budhound_edibles.info.yml
├── budhound_edibles.module
├── budhound_edibles.install
├── config/
│   └── install/
│       ├── commerce_product_type.edible_product.yml
│       ├── commerce_product_variation_type.edible_gummy.yml
│       ├── commerce_product_variation_type.edible_chocolate.yml
│       ├── commerce_product_variation_type.edible_beverage.yml
│       ├── commerce_product_variation_type.edible_mint_tablet.yml
│       ├── commerce_product_variation_type.edible_baked_good.yml
│       ├── commerce_product_variation_type.edible_capsule.yml
│       ├── commerce_product_variation_type.edible_tincture.yml
│       ├── commerce_product_variation_type.edible_hard_candy.yml
│       ├── taxonomy.vocabulary.edible_categories.yml
│       ├── taxonomy.vocabulary.edible_cannabinoid_types.yml
│       ├── taxonomy.vocabulary.edible_use_cases.yml
│       ├── taxonomy.vocabulary.edible_dietary_tags.yml
│       └── field.storage.*.yml
├── src/
│   ├── Plugin/
│   │   └── Validation/
│   │       └── Constraint/
│   │           ├── EdibleDosingConstraint.php
│   │           ├── EdibleDosingConstraintValidator.php
│   │           ├── EdiblePackagingConstraint.php
│   │           └── EdiblePackagingConstraintValidator.php
│   └── EventSubscriber/
│       └── EdibleComplianceSubscriber.php
└── tests/
    └── src/
        └── Kernel/
            └── EdibleProductTest.php
```

---

## 9. Implementation Order

1. Create shared field storage for cannabinoid, dietary, onset/duration, and compliance fields
2. Create `edible_gummy` and `edible_chocolate` variation types as pilots
3. Create `edible_product` product type
4. Create taxonomy vocabularies and populate default terms (especially cannabinoid types and use cases)
5. Wire JSON:API with use case and dietary filtering, test in React
6. Implement 10mg/serving and 100mg/package dosing constraint
7. Implement packaging compliance constraint (child-resistant, opaque)
8. Implement METRC manufactured product reporting
9. Build COA entity with homogeneity and water activity fields
10. Add remaining variation types (beverage, mint, capsule, tincture, hard candy, baked good)

---

## 10. React Display Considerations

- **Dosing calculator** — "How many pieces = what effect?" interactive tool; drives engagement and builds consumer confidence
- **Onset time display** — edibles have longer onset than flower; prominently display "Takes 30–120 minutes to feel effects" per product
- **Serving size visualizer** — for multi-piece packages, show "1 of 10 pieces = 10mg" visual
- **Dietary filter chips** — Vegan, GF, Sugar-Free as prominently filterable on the marketplace; strong purchase drivers
- **THC:CBD ratio badge** — 1:1 products deserve their own visual treatment; very popular for anxiety/pain
- **"Start Low, Go Slow" guidance** — surface responsible use messaging per California requirements; include in product card or detail page
- **Expiration date display** — unlike flower, edibles expire; show best-by date on product detail

---

*Document maintained by BudHound development team. California DCC edible regulations — including dosing limits, packaging requirements, and labeling rules — should be verified against the most current DCC guidelines before production deployment.*

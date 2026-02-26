# BudHound CBD Product Type Architecture
## Drupal Commerce Implementation Guide

---

## Overview

This document covers the full architecture for implementing CBD products in BudHound's Drupal Commerce backend, including product types, variation types, taxonomy vocabularies, compliance fields, and JSON:API exposure for the React frontend.

CBD products span a wide range of form factors — tinctures, topicals, edibles, capsules, flower, concentrates, and pet products — each requiring distinct attributes. The architecture uses Drupal Commerce's separation of **Product Types** (parent listings) from **Product Variation Types** (purchasable SKUs) to handle this cleanly.

---

## 1. Product Variation Types

Create a separate variation type per CBD form factor since attributes differ significantly between product forms.

### `cbd_tincture`
| Field | Type | Notes |
|---|---|---|
| `mg_per_ml` | Decimal | CBD concentration per mL |
| `bottle_size_ml` | Integer | Total volume |
| `carrier_oil` | Text | MCT, hemp seed, olive, etc. |
| `flavor` | Text | Natural, mint, citrus, etc. |
| `extraction_type` | List | Full Spectrum / Broad Spectrum / Isolate |

### `cbd_topical`
| Field | Type | Notes |
|---|---|---|
| `mg_per_unit` | Decimal | Total CBD mg in product |
| `weight_oz` | Decimal | Net weight |
| `application_type` | List | Cream, balm, roll-on, patch |
| `scent` | Text | Fragrance description |

### `cbd_edible`
| Field | Type | Notes |
|---|---|---|
| `mg_per_piece` | Decimal | CBD per serving |
| `pieces_per_package` | Integer | Count |
| `total_mg` | Decimal | Computed: mg_per_piece × pieces |
| `flavor` | Text | |
| `dietary_tags` | Multi-value list | Vegan, gluten-free, sugar-free |

### `cbd_capsule`
| Field | Type | Notes |
|---|---|---|
| `mg_per_capsule` | Decimal | CBD per capsule |
| `capsule_count` | Integer | Count per bottle |
| `capsule_type` | List | Softgel, hard shell |

### `cbd_flower`
| Field | Type | Notes |
|---|---|---|
| `strain_name` | Text | |
| `cbd_percentage` | Decimal | % CBD by weight |
| `thc_percentage` | Decimal | Must be < 0.3% |
| `weight_grams` | Decimal | |
| `phenotype` | List | Indica, sativa, hybrid |

### `cbd_concentrate`
| Field | Type | Notes |
|---|---|---|
| `mg_per_unit` | Decimal | |
| `concentrate_type` | List | Wax, shatter, oil, distillate |
| `extraction_method` | Text | CO2, ethanol, etc. |

### `cbd_pet`
| Field | Type | Notes |
|---|---|---|
| `mg_per_unit` | Decimal | |
| `pet_type` | List | Dog, cat |
| `product_form` | Text | Treat, tincture, chew |
| `weight_recommendation` | Text | Dosage guide by pet weight |

---

## 2. Shared Base Fields

These fields apply to **all** CBD variation types and are added via `hook_entity_base_field_info()` in the custom module.

```php
// budhound_cbd.module
function budhound_cbd_entity_base_field_info(EntityTypeInterface $entity_type) {
  $fields = [];

  if ($entity_type->id() === 'commerce_product_variation') {
    $fields['cbd_content_mg'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Total CBD (mg)'))
      ->setRequired(TRUE);

    $fields['thc_content_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('THC Content (%)'))
      ->setRequired(TRUE)
      ->addConstraint('ThcThreshold');

    $fields['batch_number'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Batch Number'));

    $fields['coa_document'] = BaseFieldDefinition::create('file')
      ->setLabel(t('Certificate of Analysis (PDF)'))
      ->setSetting('file_extensions', 'pdf');

    $fields['lab_tested'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Third-Party Lab Tested'))
      ->setDefaultValue(FALSE);

    $fields['lab_name'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Testing Lab Name'));

    $fields['harvest_date'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t('Harvest Date'));

    $fields['expiration_date'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t('Expiration Date'));
  }

  return $fields;
}
```

---

## 3. Product Type: `cbd_product`

The parent product entity that groups variations into a single listing.

| Field | Type | Notes |
|---|---|---|
| `title` | String | Product name |
| `body` | Long text | Full description |
| `field_cbd_category` | Term ref | Pain Relief, Sleep, Anxiety, etc. |
| `field_cbd_use_cases` | Term ref (multi) | Multiple use case tags |
| `field_product_form` | Term ref | Tincture, topical, edible, etc. |
| `field_brand` | Entity ref | Brand content type |
| `field_store` | Entity ref | Multi-store isolation |
| `field_featured_image` | Image | |
| `field_gallery_images` | Image (multi) | |
| `field_third_party_tested` | Boolean | Display trust badge |
| `field_hemp_source` | Text | US-grown, organic, etc. |
| `field_warnings` | Long text | Required legal copy |
| `field_age_restricted` | Boolean | Default: TRUE |

---

## 4. Taxonomy Vocabularies

### `cbd_use_cases`
Used for UX filtering and product discovery in the React marketplace.

- Pain & Inflammation
- Sleep & Relaxation
- Anxiety & Stress
- Focus & Clarity
- Recovery & Exercise
- Skin & Beauty
- Pet Wellness
- General Wellness

### `cbd_product_forms`
- Tincture
- Topical
- Edible
- Capsule
- Flower
- Concentrate
- Pet
- Beverage

### `cbd_extraction_types`
- Full Spectrum
- Broad Spectrum
- Isolate

---

## 5. Compliance: THC Threshold Validation

CBD products must be under **0.3% THC** to qualify as hemp under federal law. Enforce this with a custom constraint plugin.

```php
// src/Plugin/Validation/Constraint/ThcThresholdConstraint.php
namespace Drupal\budhound_cbd\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

/**
 * @Constraint(
 *   id = "ThcThreshold",
 *   label = @Translation("THC Threshold"),
 * )
 */
class ThcThresholdConstraint extends Constraint {
  public $message = 'THC content of @value% exceeds the legal hemp limit of 0.3%. This product cannot be listed.';
}
```

```php
// src/Plugin/Validation/Constraint/ThcThresholdConstraintValidator.php
class ThcThresholdConstraintValidator extends ConstraintValidator {
  public function validate($value, Constraint $constraint) {
    if ($value->value > 0.3) {
      $this->context->addViolation($constraint->message, [
        '@value' => $value->value,
      ]);
    }
  }
}
```

> **Note:** California requires age verification (21+) even for CBD products. Ensure `field_age_restricted` defaults to `TRUE` on all `cbd_product` entities.

---

## 6. COA (Certificate of Analysis) Entity

Lab testing documentation is a major trust signal for CBD buyers and should be modeled as a standalone entity attached to product variations, allowing multiple batches to be tracked over time.

### Entity: `cbd_lab_report`

| Field | Type | Notes |
|---|---|---|
| `lab_name` | String | Testing laboratory name |
| `test_date` | Date | |
| `batch_number` | String | Links to variation batch |
| `cbd_percentage_actual` | Decimal | Actual tested CBD % |
| `thc_percentage_actual` | Decimal | Actual tested THC % |
| `contaminants_pass` | Boolean | |
| `pesticides_pass` | Boolean | |
| `heavy_metals_pass` | Boolean | |
| `coa_pdf` | File | PDF upload |
| `qr_code_url` | String | For product label QR codes |

Attach as `field_lab_reports` (entity reference, unlimited cardinality) on the variation entity to support tracking across multiple production batches.

---

## 7. JSON:API Configuration

### Endpoints

```
/jsonapi/commerce_product/cbd_product
/jsonapi/commerce_product_variation/cbd_tincture
/jsonapi/commerce_product_variation/cbd_topical
/jsonapi/commerce_product_variation/cbd_edible
/jsonapi/commerce_product_variation/cbd_capsule
/jsonapi/commerce_product_variation/cbd_flower
/jsonapi/commerce_product_variation/cbd_concentrate
/jsonapi/commerce_product_variation/cbd_pet
/jsonapi/taxonomy_term/cbd_use_cases
/jsonapi/taxonomy_term/cbd_product_forms
/jsonapi/cbd_lab_report/cbd_lab_report
```

### Example Query with Includes

```
GET /jsonapi/commerce_product/cbd_product
  ?include=variations,field_cbd_use_cases,field_brand,variations.field_lab_reports
  &filter[field_store.id][value]={store_uuid}
  &filter[field_cbd_use_cases.name][value]=Sleep%20%26%20Relaxation
```

### Filtering by Use Case (React example)

```javascript
const fetchCbdByUseCase = async (useCase, storeId) => {
  const params = new URLSearchParams({
    'include': 'variations,field_cbd_use_cases,field_brand,variations.field_lab_reports',
    'filter[field_store.id][value]': storeId,
    'filter[field_cbd_use_cases.name][value]': useCase,
    'filter[status][value]': '1',
  });

  const response = await fetch(`/jsonapi/commerce_product/cbd_product?${params}`, {
    headers: { 'Content-Type': 'application/vnd.api+json' },
  });

  return response.json();
};
```

---

## 8. Module Structure

```
web/modules/custom/budhound_cbd/
├── budhound_cbd.info.yml
├── budhound_cbd.module                    # Base field hooks, entity hooks
├── budhound_cbd.install                   # Create vocabularies, default config
├── config/
│   └── install/
│       ├── commerce_product_type.cbd_product.yml
│       ├── commerce_product_variation_type.cbd_tincture.yml
│       ├── commerce_product_variation_type.cbd_topical.yml
│       ├── commerce_product_variation_type.cbd_edible.yml
│       ├── commerce_product_variation_type.cbd_capsule.yml
│       ├── commerce_product_variation_type.cbd_flower.yml
│       ├── commerce_product_variation_type.cbd_concentrate.yml
│       ├── commerce_product_variation_type.cbd_pet.yml
│       ├── taxonomy.vocabulary.cbd_use_cases.yml
│       ├── taxonomy.vocabulary.cbd_product_forms.yml
│       ├── taxonomy.vocabulary.cbd_extraction_types.yml
│       └── field.storage.*.yml            # Shared field storage definitions
├── src/
│   ├── Entity/
│   │   └── CbdLabReport.php               # Custom entity definition
│   ├── Plugin/
│   │   └── Validation/
│   │       └── Constraint/
│   │           ├── ThcThresholdConstraint.php
│   │           └── ThcThresholdConstraintValidator.php
│   └── EventSubscriber/
│       └── CbdComplianceSubscriber.php    # Order-level validation
└── tests/
    └── src/
        └── Kernel/
            └── CbdProductTest.php
```

---

## 9. Key Differences from THC Products

| Concern | THC Products | CBD Products |
|---|---|---|
| Age restriction | 21+ mandatory | 21+ (California default) |
| Tax treatment | 15% excise + 9.25% sales | Sales tax only (verify current CA guidance) |
| Delivery compliance | Strict DCC rules | Less regulated but follow same workflow |
| THC limit | Per product type | Hard cap at 0.3% (federal hemp threshold) |
| COA requirement | Recommended | **Essential** — primary trust signal |
| Extraction type display | Less critical | Full vs broad vs isolate matters greatly |

> **Full Spectrum vs Isolate** — Surface this prominently in the React UI. Many CBD buyers specifically need broad-spectrum or isolate (zero detectable THC) due to employer drug testing. This is a key purchase decision driver unique to the CBD category.

---

## 10. Implementation Order

1. Create shared field storage definitions for base fields (mg, THC%, COA, dates)
2. Create variation types — pilot with `cbd_tincture` and `cbd_topical`
3. Create `cbd_product` product type referencing those variation types
4. Create the three taxonomy vocabularies (use cases, product forms, extraction types)
5. Wire JSON:API includes and test endpoints with React
6. Add THC validation constraint before any live inventory is entered
7. Build `cbd_lab_report` custom entity and attach to variations
8. Expand remaining variation types (edible, capsule, flower, concentrate, pet)
9. Implement `CbdComplianceSubscriber` for order-level THC threshold checks

---

*Document maintained by BudHound development team. Update when California DCC guidance changes regarding hemp/CBD delivery regulations.*

# BudHound Vapes Product Type Architecture
## Drupal Commerce Implementation Guide

---

## Overview

Vape products are the fastest-growing cannabis category in California and among the most complex to model in a commerce system. They span multiple physical configurations — cartridges, disposables, pods, all-in-one devices, and hardware batteries — with distinct cannabinoid profiles, hardware compatibility requirements, oil types, and fill volumes. The 2019 EVALI outbreak also added a layer of regulatory scrutiny that makes ingredient disclosure and Vitamin E acetate exclusion mandatory trust signals.

This document covers the complete Drupal Commerce architecture for vape products including cartridges, disposables, pods, hardware, and bundled kits.

---

## 1. Product Variation Types

### `vape_cartridge`
The most common format — 510-threaded oil cartridge sold separately from a battery.

| Field | Type | Notes |
|---|---|---|
| `fill_volume_ml` | Decimal | 0.5ml (half gram), 1.0ml (full gram) standard |
| `thread_type` | List | 510 (standard), CCELL, proprietary |
| `oil_type` | List | Distillate, live resin, rosin, CO2, full spectrum |
| `coil_type` | List | Ceramic, quartz, wick |
| `airflow_type` | List | Adjustable, fixed |
| `mouthpiece_material` | List | Plastic, ceramic, glass, metal |
| `hardware_brand` | Text | CCELL, Jupiter, Bud Touch, etc. |

### `vape_disposable`
All-in-one device — battery integrated, no separate charger needed for single-use.

| Field | Type | Notes |
|---|---|---|
| `fill_volume_ml` | Decimal | 0.5ml, 1.0ml, 2.0ml |
| `puff_count_estimate` | Integer | Estimated draws per device |
| `battery_mah` | Integer | Battery capacity |
| `rechargeable` | Boolean | USB-C rechargeable disposables |
| `usb_type` | List | USB-C, Micro-USB, proprietary |
| `draw_activation` | List | Draw-activated, button, both |
| `oil_type` | List | Same as cartridge |
| `coil_type` | List | Ceramic, mesh, quartz |

### `vape_pod`
Closed-pod system requiring proprietary pod device (e.g., PAX Era, Stiiizy).

| Field | Type | Notes |
|---|---|---|
| `fill_volume_ml` | Decimal | |
| `pod_system_brand` | Text | PAX Era, Stiiizy, Puffco, etc. |
| `compatible_devices` | Long text | List of compatible device models |
| `oil_type` | List | |
| `pod_format` | List | Pre-filled pod, refillable pod |

### `vape_all_in_one`
Higher-end reusable device with integrated cartridge chamber — not 510 threaded.

| Field | Type | Notes |
|---|---|---|
| `fill_volume_ml` | Decimal | |
| `battery_mah` | Integer | |
| `temperature_control` | Boolean | Variable voltage/temp |
| `temp_range_f` | String | e.g., "320°F – 430°F" |
| `charging_type` | List | USB-C, wireless, proprietary |
| `device_brand` | Text | Puffco, DaVinci, G Pen, etc. |
| `oil_type` | List | |

### `vape_hardware_battery`
510-thread battery sold without any cannabis oil (no METRC required).

| Field | Type | Notes |
|---|---|---|
| `battery_mah` | Integer | |
| `voltage_settings` | List | Fixed, 3-stage, variable |
| `voltage_range` | String | e.g., "2.4V – 4.0V" |
| `thread_type` | List | 510 (standard), proprietary |
| `preheat_function` | Boolean | |
| `charging_type` | List | USB-C, Micro-USB, proprietary |
| `form_factor` | List | Stick, box mod, button, twist, palm |
| `color` | Text | |
| `is_cannabis_product` | Boolean | FALSE — no METRC required |

### `vape_bundle_kit`
Battery + cartridge or battery + multiple cartridges sold as a kit.

| Field | Type | Notes |
|---|---|---|
| `fill_volume_ml` | Decimal | Oil volume |
| `battery_included` | Boolean | |
| `battery_model` | Text | |
| `kit_contents_description` | Long text | What's included |
| `oil_type` | List | |

---

## 2. Shared Base Fields

Applied to all vape variation types **that contain cannabis oil** (not hardware-only).

```php
function budhound_vapes_entity_base_field_info(EntityTypeInterface $entity_type) {
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

    // Terpene Profile
    $fields['total_terpenes_percent'] = BaseFieldDefinition::create('decimal')
      ->setLabel(t('Total Terpenes (%)'));

    $fields['terpene_profile_json'] = BaseFieldDefinition::create('string_long')
      ->setLabel(t('Full Terpene Profile (JSON)'));

    $fields['terpene_source'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Terpene Source'))
      ->setSetting('allowed_values', [
        'cannabis_derived' => 'Cannabis-Derived',
        'botanical' => 'Botanical (non-cannabis)',
        'none' => 'No Added Terpenes',
        'blend' => 'Cannabis + Botanical Blend',
      ]);

    // Oil Composition & Safety — critical post-EVALI
    $fields['oil_type'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Oil Type'))
      ->setSetting('allowed_values', [
        'distillate' => 'Distillate',
        'live_resin' => 'Live Resin',
        'rosin' => 'Live Rosin',
        'co2_oil' => 'CO2 Oil',
        'full_spectrum' => 'Full Spectrum Oil',
        'broad_spectrum' => 'Broad Spectrum Oil',
        'isolate' => 'Isolate-Based',
      ])
      ->setRequired(TRUE);

    $fields['vitamin_e_acetate_free'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Vitamin E Acetate Free'))
      ->setDefaultValue(TRUE)
      ->setDescription(t('Must be TRUE — Vitamin E Acetate is linked to EVALI lung disease'));

    $fields['cutting_agents_free'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Free of Cutting Agents'))
      ->setDefaultValue(TRUE)
      ->setDescription(t('No MCT, PG, PEG, or VG cutting agents'));

    $fields['cutting_agents_detail'] = BaseFieldDefinition::create('string_long')
      ->setLabel(t('Cutting Agent Disclosure'))
      ->setDescription(t('Explicit disclosure of all non-cannabis ingredients in oil'));

    // Strain & Source
    $fields['source_strain'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Source Strain'));

    $fields['strain_type'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Strain Type'))
      ->setSetting('allowed_values', [
        'indica' => 'Indica',
        'sativa' => 'Sativa',
        'hybrid' => 'Hybrid',
        'cbd' => 'CBD',
      ]);

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
      ->setLabel(t('Residual Solvents: Pass'));
  }

  return $fields;
}
```

---

## 3. Product Type: `vape_product`

| Field | Type | Notes |
|---|---|---|
| `title` | String | Product name (e.g., "Stiiizy Blue Dream Pod") |
| `body` | Long text | Description |
| `field_vape_category` | Term ref | Cartridge, disposable, pod, battery, kit |
| `field_oil_type_display` | Term ref | Distillate, live resin, rosin, CO2 |
| `field_strain_type` | Term ref | Indica, sativa, hybrid, CBD |
| `field_effects` | Term ref (multi) | |
| `field_flavors` | Term ref (multi) | |
| `field_terpene_source` | Term ref | Cannabis-derived, botanical |
| `field_brand` | Entity ref | Licensed manufacturer |
| `field_store` | Entity ref | Multi-store isolation |
| `field_hardware_compatible` | String (multi) | Compatible device list for pods/carts |
| `field_vitamin_e_free_badge` | Boolean | Display safety badge in UI |
| `field_live_badge` | Boolean | Live resin / live rosin flag |
| `field_solventless_badge` | Boolean | Rosin-only flag |
| `field_featured_image` | Image | |
| `field_gallery_images` | Image (multi) | |
| `field_is_hardware_only` | Boolean | TRUE for batteries — no METRC |
| `field_age_restricted` | Boolean | Always TRUE for cannabis products |
| `field_warnings` | Long text | Required CA cannabis warnings |

---

## 4. Taxonomy Vocabularies

### `vape_categories`
- 510 Cartridge
- Disposable Vape
- Pod System
- All-in-One Device
- Battery / Hardware
- Bundle / Starter Kit

### `vape_oil_types`
- Distillate
- Live Resin
- Live Rosin (Solventless)
- CO2 Oil
- Full Spectrum
- Broad Spectrum
- Isolate-Based

### `vape_terpene_sources`
- Cannabis-Derived
- Botanical (Non-Cannabis)
- No Added Terpenes
- Cannabis + Botanical Blend

### `vape_hardware_compatibility`
- Universal 510-Thread
- PAX Era
- Stiiizy
- Heavy Hitters
- Select Elite
- Puffco
- Dr. Dabber
- G Pen

### `vape_strain_types`
- Indica
- Sativa
- Hybrid
- CBD
- 1:1 THC:CBD
- High-CBN (Sleep)

---

## 5. Compliance Requirements

### EVALI Safety Validation
Vitamin E acetate must be absent from all vape oil products. This is both a regulatory and consumer safety requirement.

```php
// src/Plugin/Validation/Constraint/VapeOilSafetyConstraint.php
public function validate($entity, Constraint $constraint) {
  $cannabis_vape_bundles = [
    'vape_cartridge', 'vape_disposable', 'vape_pod',
    'vape_all_in_one', 'vape_bundle_kit',
  ];

  if (!in_array($entity->bundle(), $cannabis_vape_bundles)) {
    return;
  }

  // Block listing if Vitamin E acetate not confirmed absent
  if (!$entity->get('vitamin_e_acetate_free')->value) {
    $this->context->addViolation(
      'Vape product cannot be listed: Vitamin E Acetate free status not confirmed.'
    );
  }

  // Require cutting agent disclosure
  if (empty($entity->get('cutting_agents_detail')->value)) {
    $this->context->addViolation(
      'Vape product requires cutting agent disclosure before listing.'
    );
  }
}
```

### Hardware-Only Products Skip METRC
Battery/hardware variations do not contain cannabis and must bypass METRC tracking and cannabis excise tax.

```php
// In ComplianceSubscriber and tax resolver
$is_hardware = $product->get('field_is_hardware_only')->value;
if ($is_hardware) {
  // Skip METRC reporting
  // Apply standard sales tax only — no cannabis excise tax
  return;
}
```

### Purchase Limits
California limits concentrate-equivalent products. A 1g cartridge counts toward the 8g concentrate daily limit. The compliance subscriber must aggregate cartridge/pod/disposable fill volumes with other concentrate products in the cart.

```php
$total_concentrate_grams = 0;

foreach ($order->getItems() as $item) {
  $variation = $item->getPurchasedEntity();

  // Vape products with oil count toward concentrate limit
  $vape_bundles = ['vape_cartridge', 'vape_disposable', 'vape_pod', 'vape_bundle_kit'];
  if (in_array($variation->bundle(), $vape_bundles)) {
    $volume_ml = $variation->get('fill_volume_ml')->value;
    // 1ml ≈ 1g for oil products
    $total_concentrate_grams += ($volume_ml * $item->getQuantity());
  }
}
// Add pure concentrate grams from other cart items and enforce 8g limit
```

---

## 6. COA (Certificate of Analysis) Entity

Vape COAs must include both potency testing AND comprehensive oil safety screening.

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
| `residual_solvents_pass` | Boolean | |
| `pesticides_pass` | Boolean | |
| `heavy_metals_pass` | Boolean | |
| `microbials_pass` | Boolean | |
| `vitamin_e_acetate_not_detected` | Boolean | **Critical safety field** |
| `cutting_agents_not_detected` | Boolean | MCT, PG, PEG, VG absence confirmation |
| `viscosity_modifier_not_detected` | Boolean | |
| `foreign_matter_pass` | Boolean | |
| `mycotoxins_pass` | Boolean | |
| `coa_pdf` | File | |
| `qr_code_url` | String | |

---

## 7. JSON:API Configuration

### Endpoints

```
/jsonapi/commerce_product/vape_product
/jsonapi/commerce_product_variation/vape_cartridge
/jsonapi/commerce_product_variation/vape_disposable
/jsonapi/commerce_product_variation/vape_pod
/jsonapi/commerce_product_variation/vape_all_in_one
/jsonapi/commerce_product_variation/vape_hardware_battery
/jsonapi/commerce_product_variation/vape_bundle_kit
/jsonapi/taxonomy_term/vape_categories
/jsonapi/taxonomy_term/vape_oil_types
/jsonapi/taxonomy_term/vape_hardware_compatibility
```

### Example Query — Live Resin Cartridges Only

```
GET /jsonapi/commerce_product/vape_product
  ?include=variations,field_brand,field_effects,field_vape_category,variations.field_lab_reports
  &filter[field_store.id][value]={store_uuid}
  &filter[field_oil_type_display.name][value]=Live%20Resin
  &filter[field_is_hardware_only][value]=0
  &filter[status][value]=1
  &sort=-variations.thc_percent
```

### React Fetch — Hardware Compatibility Filter

```javascript
const fetchVapesByDevice = async ({ deviceSystem, oilType, storeId }) => {
  const params = new URLSearchParams({
    'include': 'variations,field_brand,field_vape_category,field_oil_type_display',
    'filter[field_store.id][value]': storeId,
    'filter[field_is_hardware_only][value]': '0',
    'filter[status][value]': '1',
  });

  if (deviceSystem) {
    params.append('filter[field_hardware_compatible][value]', deviceSystem);
    params.append('filter[field_hardware_compatible][operator]', 'CONTAINS');
  }
  if (oilType) {
    params.append('filter[field_oil_type_display.name][value]', oilType);
  }

  const res = await fetch(`/jsonapi/commerce_product/vape_product?${params}`, {
    headers: { 'Content-Type': 'application/vnd.api+json' },
  });
  return res.json();
};
```

### Hardware Compatibility Cross-Sell

```javascript
// When a user adds a battery to cart, suggest compatible cartridges
const fetchCompatibleCartridges = async (threadType, storeId) => {
  const params = new URLSearchParams({
    'include': 'variations,field_brand',
    'filter[field_vape_category.name][value]': '510 Cartridge',
    'filter[field_store.id][value]': storeId,
    'filter[field_is_hardware_only][value]': '0',
    'filter[status][value]': '1',
  });
  // threadType = '510' means all standard cartridges are compatible
  const res = await fetch(`/jsonapi/commerce_product/vape_product?${params}`, {
    headers: { 'Content-Type': 'application/vnd.api+json' },
  });
  return res.json();
};
```

---

## 8. Module Structure

```
web/modules/custom/budhound_vapes/
├── budhound_vapes.info.yml
├── budhound_vapes.module
├── budhound_vapes.install
├── config/
│   └── install/
│       ├── commerce_product_type.vape_product.yml
│       ├── commerce_product_variation_type.vape_cartridge.yml
│       ├── commerce_product_variation_type.vape_disposable.yml
│       ├── commerce_product_variation_type.vape_pod.yml
│       ├── commerce_product_variation_type.vape_all_in_one.yml
│       ├── commerce_product_variation_type.vape_hardware_battery.yml
│       ├── commerce_product_variation_type.vape_bundle_kit.yml
│       ├── taxonomy.vocabulary.vape_categories.yml
│       ├── taxonomy.vocabulary.vape_oil_types.yml
│       ├── taxonomy.vocabulary.vape_terpene_sources.yml
│       ├── taxonomy.vocabulary.vape_hardware_compatibility.yml
│       ├── taxonomy.vocabulary.vape_strain_types.yml
│       └── field.storage.*.yml
├── src/
│   ├── Plugin/
│   │   └── Validation/
│   │       └── Constraint/
│   │           ├── VapeOilSafetyConstraint.php
│   │           ├── VapeOilSafetyConstraintValidator.php
│   │           ├── VapeConcentrateLimitConstraint.php
│   │           └── VapeConcentrateLimitConstraintValidator.php
│   └── EventSubscriber/
│       └── VapeComplianceSubscriber.php
└── tests/
    └── src/
        └── Kernel/
            └── VapeProductTest.php
```

---

## 9. Cross-Module Dependency: Concentrate Purchase Limits

Vape products containing cannabis oil must be aggregated with concentrates when enforcing the 8g daily purchase limit. The `VapeComplianceSubscriber` and `ConcentrateComplianceSubscriber` should both push to a shared order-level limit checker:

```php
// src/Service/CannabisConcentrateLimitChecker.php
class CannabisConcentrateLimitChecker {
  const LIMIT_GRAMS = 8.0;

  public function getTotalConcentrateGrams(OrderInterface $order): float {
    $total = 0.0;
    foreach ($order->getItems() as $item) {
      $variation = $item->getPurchasedEntity();
      $total += $this->getConcentrateGramsForVariation($variation, $item->getQuantity());
    }
    return $total;
  }

  private function getConcentrateGramsForVariation($variation, $qty): float {
    $concentrate_bundles = [
      'concentrate_wax', 'concentrate_shatter', 'concentrate_rosin',
      'concentrate_live_resin', 'concentrate_distillate',
      'concentrate_hash', 'concentrate_kief', 'concentrate_diamonds',
    ];
    $vape_bundles = ['vape_cartridge', 'vape_disposable', 'vape_pod', 'vape_bundle_kit'];

    if (in_array($variation->bundle(), $concentrate_bundles)) {
      return $variation->get('weight_grams')->value * $qty;
    }
    if (in_array($variation->bundle(), $vape_bundles)) {
      return $variation->get('fill_volume_ml')->value * $qty;
    }
    return 0.0;
  }
}
```

---

## 10. Implementation Order

1. Create shared field storage for cannabinoid, terpene, oil type, and safety fields
2. Create `vape_cartridge` and `vape_disposable` variation types as pilots
3. Create `vape_hardware_battery` variation type — needs hardware-only tax/METRC bypass
4. Create `vape_product` product type
5. Create taxonomy vocabularies — especially hardware compatibility
6. Wire JSON:API with oil type and hardware filtering, test in React
7. Implement Vitamin E acetate and cutting agent safety validation constraints
8. Implement shared `CannabisConcentrateLimitChecker` service with concentrate module
9. Implement hardware-only tax exclusion in price resolver
10. Implement METRC bypass for hardware products
11. Build COA entity with vape-specific safety fields
12. Add pod, all-in-one, and bundle kit variation types
13. Implement hardware cross-sell recommendations in React

---

## 11. React Display Considerations

- **Hardware compatibility matcher** — "What device do you have?" filter that surfaces only compatible cartridges/pods; major UX differentiator
- **Live Resin / Rosin badge** — premium oil types deserve prominent visual treatment; high AOV driver
- **Vitamin E Free badge** — post-EVALI, this is a real consumer trust signal; display it prominently
- **Cannabis-derived terpenes badge** — terpene enthusiasts specifically seek CDTs over botanicals
- **Strain type color coding** — same Indica/Sativa/Hybrid pill system as flower for UX consistency
- **Battery cross-sell** — when cartridge is added to cart, suggest compatible batteries from `vape_hardware_battery`
- **"How to use" guide** — especially for pod systems, surface device compatibility prominently on PDP
- **Fill volume display** — "0.5g" and "1g" should be prominently displayed on product cards, not buried

---

*Document maintained by BudHound development team. Vape safety requirements (Vitamin E, cutting agents) and California DCC testing standards should be reverified periodically as regulations evolve post-EVALI.*

# Drupal Commerce: Cannabis Industry — Product Types, Variations & Attributes

A complete guide for configuring Drupal Commerce to support cannabis product catalogs, including compliance-friendly structures for dispensaries and brands.

---

## Prerequisites

- Drupal 10+
- Drupal Commerce 2.x (`drupal/commerce`)
- Commerce Product (`commerce_product`) module enabled
- (Optional) Commerce Stock, Commerce License, or Age Verification modules

---

## 1. Enable Required Modules

```bash
composer require drupal/commerce drupal/commerce_product
drush en commerce commerce_product commerce_store -y
drush cr
```

---

## 2. Product Attributes

Attributes define the selectable options on a product (e.g., strain, weight, potency). Navigate to:

**Commerce → Configuration → Product attributes → Add attribute**

### 2.1 Core Attributes

#### Strain Type
| Machine Name | Label |
|---|---|
| `strain_type` | Strain Type |

**Values:**
- Indica
- Sativa
- Hybrid
- CBD (Hemp-Derived)
- High-CBD / Low-THC
- Balanced (1:1)

---

#### Weight / Quantity
| Machine Name | Label |
|---|---|
| `weight_quantity` | Weight / Quantity |

**Values:**
- 1g
- 3.5g (Eighth)
- 7g (Quarter)
- 14g (Half Ounce)
- 28g (Ounce)
- 2-Pack
- 5-Pack
- 10-Pack

---

#### Potency Range
| Machine Name | Label |
|---|---|
| `potency_range` | Potency Range |

**Values:**
- Low (< 15% THC)
- Medium (15–25% THC)
- High (25–35% THC)
- Ultra-High (35%+ THC)
- CBD-Dominant
- Balanced (1:1 THC:CBD)

---

#### Consumption Method
| Machine Name | Label |
|---|---|
| `consumption_method` | Consumption Method |

**Values:**
- Smoked
- Vaporized
- Sublingual
- Oral / Ingested
- Topical
- Suppository

---

#### Flavor Profile
| Machine Name | Label |
|---|---|
| `flavor_profile` | Flavor Profile |

**Values:**
- Citrus
- Berry
- Pine / Earthy
- Diesel / Fuel
- Sweet / Candy
- Mint / Menthol
- Tropical
- Floral
- Chocolate / Mocha
- Unflavored

---

#### Form Factor
| Machine Name | Label |
|---|---|
| `form_factor` | Form Factor |

**Values:**
- Flower / Bud
- Pre-Roll
- Concentrate
- Distillate
- Live Resin
- Rosin
- Wax / Shatter / Crumble
- Capsule
- Tablet
- Tincture
- Gummy
- Chocolate
- Beverage
- Topical Cream
- Topical Balm
- Patch
- Cartridge (510)
- Pod
- Disposable

---

#### Cartridge Compatibility
| Machine Name | Label |
|---|---|
| `cartridge_type` | Cartridge Type |

**Values:**
- 510-Thread Universal
- PAX Pod
- CCELL Compatible
- Proprietary (Brand-Specific)

---

## 3. Product Types

Navigate to: **Commerce → Configuration → Product types → Add product type**

Each product type has its own set of relevant attributes and fields.

---

### 3.1 Flower

| Setting | Value |
|---|---|
| **Label** | Flower |
| **Machine name** | `flower` |
| **Variation type** | Flower Variation |

**Attributes to assign:**
- Strain Type
- Weight / Quantity
- Potency Range

**Additional fields to add (via Manage Fields):**

| Field Label | Field Type | Notes |
|---|---|---|
| Strain Name | Text (plain) | e.g., "Blue Dream", "OG Kush" |
| THC % | Decimal | Lab-tested value |
| CBD % | Decimal | Lab-tested value |
| Terpene Profile | Text (long) | Dominant terpenes |
| Grower / Cultivator | Entity Reference (Taxonomy) | Optional: Taxonomy for growers |
| Harvest Date | Date | |
| Certificate of Analysis (COA) | File (PDF) | Compliance requirement |
| Indica/Sativa/Hybrid | List (text) | Mirrors Strain Type attribute |

---

### 3.2 Pre-Rolls

| Setting | Value |
|---|---|
| **Label** | Pre-Roll |
| **Machine name** | `pre_roll` |
| **Variation type** | Pre-Roll Variation |

**Attributes to assign:**
- Strain Type
- Weight / Quantity (per unit or pack)
- Potency Range
- Flavor Profile (if infused)

**Additional fields:**

| Field Label | Field Type | Notes |
|---|---|---|
| Strain Name | Text (plain) | |
| THC % | Decimal | |
| CBD % | Decimal | |
| Infused | Boolean | Yes/No — kief, concentrate, live resin |
| Infusion Type | Text (plain) | e.g., "Kief-Rolled", "Distillate-Dipped" |
| Paper / Wrap Type | Text (plain) | Hemp, Rice, Tobacco-Free |
| Filter Tip | Boolean | Includes filter or not |
| COA (PDF) | File | |

---

### 3.3 Concentrates & Extracts

| Setting | Value |
|---|---|
| **Label** | Concentrate |
| **Machine name** | `concentrate` |
| **Variation type** | Concentrate Variation |

**Attributes to assign:**
- Strain Type
- Weight / Quantity
- Potency Range
- Form Factor (Wax, Shatter, Rosin, etc.)

**Additional fields:**

| Field Label | Field Type | Notes |
|---|---|---|
| Strain Name | Text (plain) | |
| THC % | Decimal | Often 60–99% |
| CBD % | Decimal | |
| Extraction Method | List (text) | BHO, CO2, Solventless, Ice Water |
| Consistency | Text (plain) | Budder, Crumble, Pull-and-Snap |
| COA (PDF) | File | |

---

### 3.4 Vapes & Cartridges

| Setting | Value |
|---|---|
| **Label** | Vape / Cartridge |
| **Machine name** | `vape_cartridge` |
| **Variation type** | Vape Variation |

**Attributes to assign:**
- Strain Type
- Weight / Quantity (0.5g, 1g)
- Potency Range
- Flavor Profile
- Cartridge Compatibility
- Consumption Method

**Additional fields:**

| Field Label | Field Type | Notes |
|---|---|---|
| Strain Name | Text (plain) | |
| THC % | Decimal | |
| CBD % | Decimal | |
| Oil Type | List (text) | Distillate, Live Resin, Rosin, Full Spectrum |
| Hardware Included | Boolean | Battery/Device included? |
| Battery Voltage | Text (plain) | e.g., "3.3V–4.8V Variable" |
| COA (PDF) | File | |

---

### 3.5 Edibles

| Setting | Value |
|---|---|
| **Label** | Edible |
| **Machine name** | `edible` |
| **Variation type** | Edible Variation |

**Attributes to assign:**
- Form Factor (Gummy, Chocolate, Beverage, Capsule)
- Weight / Quantity
- Potency Range
- Flavor Profile
- Consumption Method

**Additional fields:**

| Field Label | Field Type | Notes |
|---|---|---|
| Total THC (mg) | Decimal | Per package |
| Total CBD (mg) | Decimal | Per package |
| THC per Serving (mg) | Decimal | Compliance critical |
| Servings per Package | Integer | |
| Ingredients | Text (long) | Full ingredient list |
| Allergens | Text (plain) | e.g., "Contains: Soy, Tree Nuts" |
| Dietary Info | Checkboxes | Vegan, Gluten-Free, Kosher, etc. |
| Onset Time | Text (plain) | e.g., "30–90 minutes" |
| Expiration Date Label | Boolean | Show/hide expiry field |
| COA (PDF) | File | |

---

### 3.6 Tinctures & Sublinguals

| Setting | Value |
|---|---|
| **Label** | Tincture |
| **Machine name** | `tincture` |
| **Variation type** | Tincture Variation |

**Attributes to assign:**
- Weight / Quantity (mL — 15mL, 30mL, 60mL)
- Potency Range
- Flavor Profile
- Consumption Method

**Additional fields:**

| Field Label | Field Type | Notes |
|---|---|---|
| THC per mL (mg) | Decimal | |
| CBD per mL (mg) | Decimal | |
| Total Volume (mL) | Decimal | |
| Carrier Oil | Text (plain) | MCT, Hemp Seed, Olive Oil |
| Dropper Included | Boolean | |
| Spectrum | List (text) | Full Spectrum, Broad Spectrum, Isolate |
| COA (PDF) | File | |

---

### 3.7 Topicals

| Setting | Value |
|---|---|
| **Label** | Topical |
| **Machine name** | `topical` |
| **Variation type** | Topical Variation |

**Attributes to assign:**
- Form Factor (Cream, Balm, Patch, Lotion)
- Weight / Quantity
- Consumption Method (Topical)

**Additional fields:**

| Field Label | Field Type | Notes |
|---|---|---|
| CBD mg (per unit) | Decimal | Most topicals are CBD-dominant |
| THC mg (per unit) | Decimal | For transdermal / active products |
| Active Ingredients | Text (long) | Arnica, Menthol, Camphor, etc. |
| Transdermal | Boolean | Crosses skin barrier vs. local relief |
| Scent Profile | Text (plain) | |
| COA (PDF) | File | |

---

### 3.8 Accessories & Hardware

| Setting | Value |
|---|---|
| **Label** | Accessory |
| **Machine name** | `accessory` |
| **Variation type** | Accessory Variation |

**Attributes to assign:**
- Form Factor
- Cartridge Compatibility

**Additional fields:**

| Field Label | Field Type | Notes |
|---|---|---|
| Color / Finish | Text (plain) | |
| Material | Text (plain) | Glass, Silicone, Metal |
| Compatible With | Text (plain) | Device compatibility |
| Warranty | Text (plain) | |
| Requires Battery | Boolean | |

---

## 4. Product Variations

For each product type above, configure the variation type under:

**Commerce → Configuration → Product variation types → Add variation type**

### Example: Flower Variation

| Setting | Value |
|---|---|
| **Label** | Flower Variation |
| **Machine name** | `flower_variation` |
| **Generates title** | ✅ Yes (auto-generate from attributes) |
| **Traits (attributes)** | Strain Type, Weight / Quantity, Potency Range |

**Variation-level fields** (fields that differ per SKU):

| Field | Purpose |
|---|---|
| SKU | Unique product identifier |
| Price | Per-weight pricing |
| Stock | Inventory quantity |
| THC % (override) | Batch-specific lab result |
| CBD % (override) | Batch-specific lab result |
| COA (PDF) | Batch-specific certificate |
| Barcode / METRC Tag | State traceability system ID |

> **Tip:** Fields that differ per batch or per weight (price, THC %, COA) belong on the **variation**. Fields that are constant for the product (strain name, description, terpenes) belong on the **product**.

---

## 5. Taxonomy Vocabularies

Create these vocabularies at **Structure → Taxonomy → Add vocabulary** to power faceted filtering:

| Vocabulary | Machine Name | Example Terms |
|---|---|---|
| Cannabis Category | `cannabis_category` | Flower, Vape, Edible, Topical, etc. |
| Brand | `brand` | Your licensed brands |
| Cultivar / Strain | `cultivar` | Blue Dream, Gelato, OG Kush |
| Terpenes | `terpenes` | Myrcene, Limonene, Caryophyllene |
| Effects | `effects` | Relaxing, Energizing, Pain Relief, Sleep |
| Medical Use | `medical_use` | Anxiety, Insomnia, Chronic Pain, Nausea |
| State Compliance Tag | `compliance_tag` | CA-Compliant, OR-Compliant, WA-Compliant |

---

## 6. Compliance Field Checklist

The following fields are commonly required for regulatory compliance. Ensure they exist on the relevant product type or variation:

- [ ] **THC % (per unit or per serving)**
- [ ] **CBD % (per unit or per serving)**
- [ ] **Net Weight / Volume**
- [ ] **Serving Size & Servings per Package** (edibles)
- [ ] **Ingredients list** (edibles, topicals)
- [ ] **Allergen statement** (edibles)
- [ ] **Certificate of Analysis (COA) PDF** — linked to lab batch
- [ ] **License number** (producer/distributor) — store-level or product-level
- [ ] **Universal Symbol** (required in many states for THC products) — image field
- [ ] **State-required warnings** — Long text field or token-based
- [ ] **METRC / BioTrack Tag ID** — variation-level text field
- [ ] **Harvest / Production Date**
- [ ] **Expiration / Best By Date**

---

## 7. Age Verification Integration

Install an age verification module or configure access restriction:

```bash
composer require drupal/age_verification
drush en age_verification -y
```

Or use Commerce's built-in **Order conditions** to restrict checkout:

**Commerce → Configuration → Order types → [Your Order Type] → Add condition → Customer age**

You can also gate the entire store or product listing pages using a custom block or middleware.

---

## 8. Recommended Modules

| Module | Purpose |
|---|---|
| `commerce_stock` | Inventory management per variation |
| `commerce_shipping` | Shipping methods (if delivery is licensed) |
| `facets` + `search_api` | Faceted filtering by strain, potency, etc. |
| `age_verification` | Storefront age gate |
| `commerce_license` | License-based access (wholesale, medical) |
| `pathauto` | SEO-friendly URLs per product type |
| `metatag` | Structured SEO metadata |
| `field_group` | Organize compliance fields in the admin UI |
| `inline_entity_form` | Manage variations inline on product form |

---

## 9. Drush & Config Export

After configuring product types, attributes, and variations, export your config:

```bash
drush config:export -y
```

This saves everything to your `config/sync` directory and makes the setup deployable across environments.

---

## Quick Reference: Attribute → Product Type Matrix

| Attribute | Flower | Pre-Roll | Concentrate | Vape | Edible | Tincture | Topical |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Strain Type | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| Weight / Quantity | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Potency Range | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| Flavor Profile | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ |
| Form Factor | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ✅ |
| Cartridge Type | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| Consumption Method | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ |

---

*Last updated: February 2026 | Drupal Commerce 2.x | Drupal 10+*

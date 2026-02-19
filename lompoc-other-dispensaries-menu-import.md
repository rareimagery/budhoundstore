# Drupal Commerce — Lompoc Dispensaries Menu Import Guide
### All Stores Except Elevate Lompoc

> **Usage:** This guide mirrors the structure of `elevate-lompoc-drupal-menu-import.md`. Each section covers one store: store profile, brand taxonomy, representative SKU tables by category, promotions, and a CSV migration configuration snippet. Prices are representative estimates — verify against live menus before production deployment.
>
> **SKU prefix convention:** `[STORE_CODE]-[BRAND]-[PRODUCT]-[SIZE]`  
> **Tax rules (all stores):** CA Excise Tax 15% + CA Sales Tax 9.25% (Santa Barbara County). See Elevate guide §11.4 for full Commerce Tax configuration.

---

## Table of Contents

1. [One Plant Lompoc](#1-one-plant-lompoc)
2. [Royal Healing Emporium](#2-royal-healing-emporium)
3. [The Roots Dispensary (TRD)](#3-the-roots-dispensary-trd)
4. [MJ Direct](#4-mj-direct)
5. [Bleu Diamond Lounge & Delivery](#5-bleu-diamond-lounge--delivery)
6. [Leaf Dispensary](#6-leaf-dispensary)
7. [Cross-Store CSV Import Notes](#7-cross-store-csv-import-notes)

---

## 1. One Plant Lompoc

### 1.1 Store Profile

| Field | Value |
|---|---|
| **Store Name** | One Plant Lompoc |
| **Machine Name** | `one_plant_lompoc` |
| **Address** | 119 N A St, Lompoc, CA 93436 |
| **Phone** | (805) 741-7419 |
| **Website** | oneplant.life/lompoc |
| **Email** | info@oneplant.life |
| **License** | C10-0000556-LIC (Adult-Use + Medical) |
| **Hours** | Mon–Sun 8:00 AM – 10:00 PM |
| **Rating** | 4.9★ (470+ reviews) |
| **Delivery** | Yes — serves Lompoc + surrounding SB County |
| **Payment** | Cash, Debit · ATM on-site |
| **Tax Display** | Prices before tax; excise + sales tax added at checkout |
| **Amenities** | Storefront, ATM, Security guard, Veteran discount, Medical + Recreational |

**Key staff (from reviews):** Cierra (manager), David (manager), Heather, Noe, Landon, Edward, Lance

### 1.2 Brand Taxonomy

Add these terms to the `brand` vocabulary (`Structure → Taxonomy → Brand → Add term`) before importing:

| Term Label | Machine Name |
|---|---|
| Connected Cannabis Co. | `connected_cannabis_co` |
| Alien Labs | `alien_labs` |
| Claybourne Co. | `claybourne_co` |
| Pearl Pharma | `pearl_pharma` |
| Stiiizy | `stiiizy` |
| Raw Garden | `raw_garden` |
| Jeeter | `jeeter` |
| Heavy Hitters | `heavy_hitters` |
| Kanha | `kanha` |
| Wyld | `wyld` |
| Papa & Barkley | `papa_and_barkley` |
| Mary's Medicinal | `marys_medicinal` |
| Floracal | `floracal` |
| Top Shelf Cultivation | `top_shelf_cultivation` |
| Glasshouse Farms | `glasshouse_farms` |
| Emerald Bay Extracts | `emerald_bay_extracts` |
| Dr. Norm's | `dr_norms` |
| Kiva Confections | `kiva_confections` |
| Sluggers | `sluggers` |
| Space Coyote | `space_coyote` |

> **Note:** One Plant is a multi-location CA chain. Their brand selection closely mirrors the broader Central Coast premium market. Confirm exact stocked brands via their Dutchie-powered menu at `dutchie.com/dispensary/one-plant-weed-dispensary-california-lompoc`.

### 1.3 Product Catalog

#### Flower

| SKU | Product | Strain | Size | THC % | Price |
|---|---|---|---|---|---|
| `OP-CONN-BISCOTTI-3.5` | Biscotti | Indica | 3.5g | 30–34% | $50 |
| `OP-CONN-GUSHERS-3.5` | Gushers | Hybrid | 3.5g | 28–32% | $50 |
| `OP-ALIEN-GALACTIC-3.5` | Galactic Runtz | Hybrid | 3.5g | 27–33% | $55 |
| `OP-CLAY-FROSTED-3.5` | Frosted Flyers | Hybrid | 3.5g | 26–30% | $45 |
| `OP-PEARL-SINMINT-3.5` | Sin Mint Cookies | Indica | 3.5g | 25–29% | $50 |
| `OP-GH-LEMON-3.5` | Lemon OG | Sativa | 3.5g | 20–24% | $35 |
| `OP-TSC-OGKUSH-3.5` | OG Kush | Indica | 3.5g | 18–23% | $22 |
| `OP-TSC-OGKUSH-28` | OG Kush | Indica | 28g | 18–23% | $95 |

#### Pre-Rolls & Infused Pre-Rolls

| SKU | Product | Brand | Weight | THC % | Price |
|---|---|---|---|---|---|
| `OP-JEET-BABY5PK-WTRML` | Baby Jeeter 5-Pack — Watermelon | Jeeter | 5×0.5g | 32–36% | $26 |
| `OP-JEET-JUICE-BGEL` | Jeeter Juice Live Resin — Banana Gelato | Jeeter | 1g | 52–65% | $24 |
| `OP-SLUG-HIT-GDROP` | Slugger Hit — Guava Drop | Sluggers | 2g | 60–72% | $26 |
| `OP-SCOY-LROSH-IND` | Infused Rosin — Indica | Space Coyote | 1g | 42–55% | $20 |
| `OP-HH-DIAM-2PK` | Diamond Pre-Roll 2-Pack | Heavy Hitters | 2×1g | 58–70% | $36 |

#### Vapes

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `OP-STZ-CDT-PDK-0.5` | CDT Pod — Pink Rozay | Stiiizy | 0.5g | 87–92% | $30 |
| `OP-STZ-CDT-PDK-1` | CDT Pod — Blue Dream | Stiiizy | 1g | 87–92% | $55 |
| `OP-STZ-LR-PDK-1` | Live Resin Pod — Gelato | Stiiizy | 1g | 80–88% | $65 |
| `OP-RG-RLR-CART-1` | Refined Live Resin — Papaya Punch | Raw Garden | 1g | 84–90% | $50 |
| `OP-CONN-LR-CART-1` | Live Resin Cart — Biscotti | Connected | 1g | 82–90% | $55 |
| `OP-HH-ULTRA-CART-1` | Ultra Potent — Watermelon | Heavy Hitters | 1g | 90–95% | $40 |

#### Concentrates

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `OP-RG-BADDER-1` | Live Badder | Raw Garden | 1g | 72–82% | $42 |
| `OP-ALIEN-LRR-1` | Live Resin | Alien Labs | 1g | 75–85% | $55 |
| `OP-EBE-SHATTER-1` | Shatter | Emerald Bay Extracts | 1g | 68–80% | $30 |

#### Edibles

| SKU | Product | Brand | Qty | THC | Price |
|---|---|---|---|---|---|
| `OP-KANHA-GUM-TROPUNCH-10` | Tropical Punch Gummies | Kanha | 10-pack | 100mg | $20 |
| `OP-WYLD-GUM-HUCK-10` | Huckleberry Gummies (Indica) | Wyld | 10-pack | 100mg | $24 |
| `OP-KIVA-CHOC-DARK-20` | Dark Chocolate Bar | Kiva Confections | 20-piece | 180mg | $26 |
| `OP-DRNRM-COOKIE-100` | Chocolate Chip Cookie | Dr. Norm's | 1 cookie | 100mg | $18 |

#### Wellness

| SKU | Product | Brand | Size | Price |
|---|---|---|---|---|
| `OP-PB-BALM-13-30ML` | Releaf Balm 1:3 THC:CBD | Papa & Barkley | 30mL | $30 |
| `OP-PB-TINCT-11-30ML` | Releaf Tincture 1:1 | Papa & Barkley | 30mL | $44 |
| `OP-MM-TINCT-11-30ML` | 1:1 Tincture | Mary's Medicinal | 30mL | $34 |

### 1.4 Promotions

| Promotion | Trigger | Discount | Notes |
|---|---|---|---|
| First-Time Customer | Account flag `first_purchase = true` | 15% off | Confirmed in reviews |
| Veteran Discount | Customer role `veteran` | TBD% | Listed amenity; confirm rate in-store |
| Daily Deals | Category-based, varies | TBD | Confirm current schedule via Dutchie menu |
| Loyalty Points | Repeat purchases | Points accrual | Loyalty program confirmed |

### 1.5 CSV Migration Config

```yaml
# migrate_plus.migration.one_plant_flower_products.yml
id: one_plant_flower_products
label: 'One Plant Lompoc — Flower Products'
source:
  plugin: csv
  path: 'private://migrations/one_plant_flower.csv'
  ids: [sku]
  column_names:
    - sku
    - title
    - brand
    - strain_name
    - strain_type
    - weight_quantity
    - thc_pct
    - cbd_pct
    - price
    - status
    - description
process:
  title: title
  'stores/target_id':
    plugin: default_value
    default_value: 2   # One Plant Lompoc store entity ID
  'field_brand/target_id':
    plugin: entity_lookup
    source: brand
    entity_type: taxonomy_term
    bundle: brand
    value_key: name
  field_strain_name: strain_name
  'field_strain_type/value': strain_type
  'field_thc_pct/value': thc_pct
  'field_cbd_pct/value': cbd_pct
  status: status
  body/value: description
  body/format:
    plugin: default_value
    default_value: basic_html
  variations:
    - plugin: create_or_reference
      target_type: commerce_product_variation
      values:
        type: flower_variation
        sku: sku
        'price/number': price
        'price/currency_code':
          plugin: default_value
          default_value: USD
        field_weight_quantity: weight_quantity
destination:
  plugin: entity:commerce_product
  default_bundle: flower
migration_tags:
  - one_plant_lompoc
  - flower
```

```bash
drush migrate:import one_plant_flower_products
drush migrate:status one_plant_flower_products
```

---

## 2. Royal Healing Emporium

### 2.1 Store Profile

| Field | Value |
|---|---|
| **Store Name** | Royal Healing Emporium |
| **Machine Name** | `royal_healing_emporium` |
| **Address** | 721 W Central Ave, Suite D, Lompoc, CA 93436 |
| **Phone** | (805) 743-4848 |
| **Website** | royalhealingemporium.org |
| **License** | C10-0000208-LIC (Adult-Use + Medical) |
| **Hours** | Mon–Sun 7:00 AM – 10:00 PM |
| **Rating** | 4.9★ (831+ reviews) |
| **Location Note** | Corner of Walmart shopping center (W Central Ave) |
| **Delivery** | Yes — call, text, or walk in to order |
| **Payment** | Cash + all major debit cards ($3 convenience fee; rounds to nearest $0.10) |
| **Tax Display** | Prices before tax; taxes added at checkout (online: included; in-store: not included unless noted) |

**Key staff (from reviews):** Tori, Angelica, Krystal, Ben, Crystal, Renee/Rene, Peter, Brandon, Anthony, Chris, Rusty

**Notable amenity:** "Spin the Wheel" in-store discount game

### 2.2 Brand Taxonomy

| Term Label | Machine Name |
|---|---|
| Stiiizy | `stiiizy` |
| Papa's Select | `papas_select` |
| Punch Extracts | `punch_extracts` |
| Raw Garden | `raw_garden` |
| Jeeter | `jeeter` |
| Heavy Hitters | `heavy_hitters` |
| Kanha | `kanha` |
| Wyld | `wyld` |
| Connected Cannabis Co. | `connected_cannabis_co` |
| Alien Labs | `alien_labs` |
| Papa & Barkley | `papa_and_barkley` |
| Glasshouse Farms | `glasshouse_farms` |
| Buddies Brand | `buddies_brand` |
| Floracal | `floracal` |
| Top Shelf Cultivation | `top_shelf_cultivation` |
| Kiva Confections | `kiva_confections` |
| Dr. Norm's | `dr_norms` |
| Mary's Medicinal | `marys_medicinal` |
| Lowell Herb Co. | `lowell_herb_co` |
| Space Coyote | `space_coyote` |

> **Confirmed from reviews:** Stiiizy carts, Papa's Select carts/pods, and Punch Extracts concentrates are among the most frequently reordered SKUs. Verify full live menu at `weedmaps.com/dispensaries/royal-healing-emporium-lompoc`.

### 2.3 Product Catalog

#### Flower

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `RHE-CONN-BISCOTTI-3.5` | Biscotti | Connected | 3.5g | 30–34% | $50 |
| `RHE-ALIEN-ZKITZ-3.5` | Zkittlez | Alien Labs | 3.5g | 27–32% | $55 |
| `RHE-FLOR-GDP-3.5` | Granddaddy Purple | Floracal | 3.5g | 22–28% | $45 |
| `RHE-GH-PAPAYA-3.5` | Papaya | Glasshouse Farms | 3.5g | 19–24% | $30 |
| `RHE-TSC-WHTWIDOW-3.5` | White Widow | Top Shelf | 3.5g | 18–24% | $22 |
| `RHE-TSC-WHTWIDOW-28` | White Widow | Top Shelf | 28g | 18–24% | $90 |

#### Pre-Rolls & Infused Pre-Rolls

| SKU | Product | Brand | Weight | THC % | Price |
|---|---|---|---|---|---|
| `RHE-JEET-BABY5PK-GEL` | Baby Jeeter 5-Pack — Gelato | Jeeter | 5×0.5g | 32–36% | $26 |
| `RHE-JEET-JUICE-STP` | Jeeter Juice — Strawberry Sour Patch | Jeeter | 1g | 55–65% | $24 |
| `RHE-LOW-SMOKES7-SAT` | Lowell Smokes 7-Pack — Sativa | Lowell Herb Co. | 7×0.5g | 18–24% | $32 |
| `RHE-SCOY-LROSH-SAT` | Infused Rosin Pre-Roll — Sativa | Space Coyote | 1g | 42–52% | $20 |
| `RHE-HH-DIAM-1G` | Diamond Pre-Roll | Heavy Hitters | 1g | 58–70% | $22 |

#### Vapes

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `RHE-STZ-CDT-GEL-0.5` | CDT Pod — Gelato | Stiiizy | 0.5g | 87–92% | $30 |
| `RHE-STZ-LR-SOUR-1` | Live Resin Pod — Sour Diesel | Stiiizy | 1g | 78–87% | $65 |
| `RHE-PAPA-SEL-CART-1` | Papa's Select Cart — OG | Papa's Select | 1g | 78–88% | $42 |
| `RHE-RG-RLR-PAPAYA-1` | Refined Live Resin — Papaya | Raw Garden | 1g | 84–90% | $50 |
| `RHE-HH-ULTRA-WM-1` | Ultra Potent — Watermelon | Heavy Hitters | 1g | 90–95% | $40 |
| `RHE-BUD-CDT-JACK-1` | CDT Cart — Jack Herer | Buddies Brand | 1g | 78–85% | $32 |

#### Concentrates

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `RHE-PUNCH-LB-GEL-1` | Live Badder — Gelato | Punch Extracts | 1g | 74–84% | $48 |
| `RHE-PUNCH-LR-ZRUN-1` | Live Resin — Zkittlez Runtz | Punch Extracts | 1g | 72–82% | $44 |
| `RHE-RG-CRUMB-PPP-1` | Live Crumble — Papaya Punch | Raw Garden | 1g | 70–82% | $40 |
| `RHE-ALIEN-LR-AR41-1` | Live Resin — Area 41 | Alien Labs | 1g | 78–88% | $55 |

#### Edibles

| SKU | Product | Brand | Qty | THC | Price |
|---|---|---|---|---|---|
| `RHE-KANHA-GUM-MANGO-10` | Mango Gummies | Kanha | 10-pack | 100mg | $20 |
| `RHE-KANHA-GUM-NANO-10` | Nano Fast-Acting Gummies | Kanha | 10-pack | 100mg | $26 |
| `RHE-WYLD-GUM-PEACH-10` | Peach Gummies (Hybrid) | Wyld | 10-pack | 100mg | $26 |
| `RHE-KIVA-BARS-TERRA-20` | Espresso Bites | Kiva Confections | 20-piece | 100mg | $24 |
| `RHE-DRNRM-CRISPR-100` | Rice Crispy Treat | Dr. Norm's | 1 piece | 100mg | $18 |

#### Wellness

| SKU | Product | Brand | Size | Price |
|---|---|---|---|---|
| `RHE-PB-BALM-13-30ML` | Releaf Balm 1:3 | Papa & Barkley | 30mL | $30 |
| `RHE-PB-TINCT-CBD-30ML` | CBD Tincture | Papa & Barkley | 30mL | $38 |
| `RHE-MM-PATCH-THC` | THC Transdermal Patch | Mary's Medicinal | 1 patch | $14 |

### 2.4 Promotions

| Promotion | Trigger | Discount | Notes |
|---|---|---|---|
| Sitewide Tiered Discount | Order total / time period | 10%–25% off | "10%–25% OFF ORDERS" — confirm exact tiers |
| Stacking Extra 5% | Combined with tiered deals | +5% | Can stack on top of daily/weekly deals |
| 420 Season | April 1–19 each year | 25% delivery / 30% in-store | Seasonal; configure via date-range condition |
| Spin the Wheel | In-store only (kiosk/staff triggered) | Up to 40% off | Manual; not automatable in Commerce |
| Weekly Deals | Category-specific, rotates | Varies | Confirm current week via Weedmaps |

**Commerce Promotions config note:** The tiered sitewide discount (10–25%) is best implemented as an order-level promotion with multiple conditions (e.g., order total >= $50 → 10%, >= $100 → 20%, >= $150 → 25%), or as a customer role-based membership discount. The Spin the Wheel promotion is staff-administered and should be handled as a manual coupon code generated at POS.

### 2.5 CSV Migration Config

```yaml
# migrate_plus.migration.rhe_flower_products.yml
id: rhe_flower_products
label: 'Royal Healing Emporium — Flower Products'
source:
  plugin: csv
  path: 'private://migrations/rhe_flower.csv'
  ids: [sku]
process:
  title: title
  'stores/target_id':
    plugin: default_value
    default_value: 3   # Royal Healing Emporium store entity ID
  'field_brand/target_id':
    plugin: entity_lookup
    source: brand
    entity_type: taxonomy_term
    bundle: brand
    value_key: name
  field_strain_name: strain_name
  'field_strain_type/value': strain_type
  'field_thc_pct/value': thc_pct
  'field_cbd_pct/value': cbd_pct
  status: status
  body/value: description
  body/format:
    plugin: default_value
    default_value: basic_html
  variations:
    - plugin: create_or_reference
      target_type: commerce_product_variation
      values:
        type: flower_variation
        sku: sku
        'price/number': price
        'price/currency_code':
          plugin: default_value
          default_value: USD
        field_weight_quantity: weight_quantity
destination:
  plugin: entity:commerce_product
  default_bundle: flower
migration_tags:
  - royal_healing_emporium
  - flower
```

---

## 3. The Roots Dispensary (TRD)

### 3.1 Store Profile

| Field | Value |
|---|---|
| **Store Name** | The Roots Dispensary |
| **Machine Name** | `the_roots_dispensary` |
| **Address** | 805 W Laurel Ave, Lompoc, CA 93436 |
| **Phone** | (805) 322-8032 |
| **Website** | visittrd805.com |
| **Email** | hello@visittheroots.com |
| **License** | C10 (Adult-Use + Medical) — verify on CDTFA |
| **Hours** | Mon–Sat 9:00 AM – 9:00 PM · Sun 9:00 AM – 6:00 PM |
| **Rating** | 4.8★ (631+ reviews) |
| **Founded** | 2018 by lifelong Lompoc residents Victor S. and Luis C. |
| **Delivery** | Yes — Lompoc, Santa Maria, Santa Ynez, Buellton, Orcutt, Los Alamos, Los Olivos, Solvang; **no order minimum** |
| **Payment** | Cash, Credit, Debit |
| **Tax Display** | Before tax |
| **Awards** | "Best of Weedmaps" winner |

**Key staff (from reviews):** Sarah, Adrian, and in-store team

### 3.2 Brand Taxonomy

| Term Label | Machine Name |
|---|---|
| Alien Labs | `alien_labs` |
| Connected Cannabis Co. | `connected_cannabis_co` |
| Heavy Hitters | `heavy_hitters` |
| Jeeter | `jeeter` |
| PLUGplay | `plugplay` |
| Presidential | `presidential` |
| Stiiizy | `stiiizy` |
| Raw Garden | `raw_garden` |
| RMR Legacy Smalls | `rmr_legacy_smalls` |
| Floracal | `floracal` |
| Glasshouse Farms | `glasshouse_farms` |
| Top Shelf Cultivation | `top_shelf_cultivation` |
| Kanha | `kanha` |
| Wyld | `wyld` |
| Kiva Confections | `kiva_confections` |
| Papa & Barkley | `papa_and_barkley` |
| Mary's Medicinal | `marys_medicinal` |
| Coldfire Extracts | `coldfire_extracts` |
| Lime Cannabis | `lime_cannabis` |
| Emerald Bay Extracts | `emerald_bay_extracts` |
| Dr. Norm's | `dr_norms` |

> **Note:** The Roots carries 40+ cultivars of flower and markets itself as the Central Coast's premier selection. RMR Legacy Smalls (7g premium indoor format) is a featured exclusive brand partnership.

### 3.3 Product Catalog

#### Flower (40+ cultivars on shelves)

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `TRD-ALIEN-AR41-3.5` | Area 41 | Alien Labs | 3.5g | 28–34% | $55 |
| `TRD-CONN-SLURTY-3.5` | Slurty #3 | Connected | 3.5g | 29–34% | $50 |
| `TRD-RMR-SMALLS-7` | Legacy Smalls — Various | RMR Legacy | 7g | 24–30% | $35 |
| `TRD-FLOR-ZKITZ-3.5` | Zkittlez | Floracal | 3.5g | 22–28% | $45 |
| `TRD-GH-LEMON-7` | Lemon OG | Glasshouse Farms | 7g | 19–24% | $55 |
| `TRD-GH-PAPAYA-28` | Papaya | Glasshouse Farms | 28g | 19–24% | $120 |
| `TRD-TSC-BLDREAM-3.5` | Blue Dream | Top Shelf | 3.5g | 18–24% | $22 |
| `TRD-TSC-BLDREAM-28` | Blue Dream | Top Shelf | 28g | 18–24% | $90 |
| `TRD-PRES-OGK-3.5` | Presidential OG | Presidential | 3.5g | 20–26% | $38 |

#### Pre-Rolls & Infused Pre-Rolls

| SKU | Product | Brand | Weight | THC % | Price |
|---|---|---|---|---|---|
| `TRD-JEET-BABY5PK-PNCH` | Baby Jeeter 5-Pack — Punch | Jeeter | 5×0.5g | 32–36% | $26 |
| `TRD-JEET-JUICE-WM` | Jeeter Juice — Watermelon | Jeeter | 1g | 55–65% | $24 |
| `TRD-HH-DIAM-2PK` | Diamond Pre-Roll 2-Pack | Heavy Hitters | 2×1g | 58–70% | $36 |
| `TRD-PRES-INFUSED-SAT` | Infused Pre-Roll — Sativa | Presidential | 1g | 40–52% | $18 |

#### Vapes

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `TRD-STZ-CDT-GELZ-1` | CDT Pod — Gelato 41 | Stiiizy | 1g | 87–92% | $55 |
| `TRD-STZ-LR-OGK-0.5` | Live Resin Pod — OG Kush | Stiiizy | 0.5g | 78–87% | $35 |
| `TRD-RG-RLR-RNTZ-1` | Refined Live Resin — Runtz | Raw Garden | 1g | 84–90% | $50 |
| `TRD-PLUG-CDT-GGS-1` | PLUGplay CDT — Granddaddy's Stash | PLUGplay | 1g | 80–88% | $50 |
| `TRD-HH-ULTRA-CHEM-1` | Ultra Potent — Chem Cookies | Heavy Hitters | 1g | 90–95% | $40 |
| `TRD-CONN-LR-BISCO-1` | Live Resin Cart — Biscotti | Connected | 1g | 82–90% | $55 |

#### Concentrates

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `TRD-CF-LROSH-GDP-1` | Live Rosin — GDP | Coldfire Extracts | 1g | 74–85% | $60 |
| `TRD-RG-LBAD-PPP-1` | Live Badder — Papaya Punch | Raw Garden | 1g | 72–82% | $42 |
| `TRD-LIME-LR-GEL-1` | Live Resin — Gelato | Lime Cannabis | 1g | 72–84% | $40 |
| `TRD-EBE-WAX-OGK-1` | Wax — OG Kush | Emerald Bay | 1g | 68–78% | $30 |

#### Edibles

| SKU | Product | Brand | Qty | THC | Price |
|---|---|---|---|---|---|
| `TRD-KANHA-GUM-CBDTC-10` | Peach CBD:THC 1:1 Gummies | Kanha | 10-pack | 50mg THC/50mg CBD | $26 |
| `TRD-WYLD-GUM-HUCK-10` | Huckleberry Gummies | Wyld | 10-pack | 100mg | $24 |
| `TRD-WYLD-GUM-PEAR-10` | Pear CBD+CBG | Wyld | 10-pack | 25mg THC/25mg CBD/5mg CBG | $26 |
| `TRD-KIVA-CHOC-MINT-20` | Mint Chocolate Bar | Kiva Confections | 20-piece | 180mg | $26 |

#### Wellness

| SKU | Product | Brand | Size | Price |
|---|---|---|---|---|
| `TRD-PB-TINCT-13-30ML` | Releaf Tincture 1:3 | Papa & Barkley | 30mL | $42 |
| `TRD-MM-TINCT-11-30ML` | 1:1 Tincture | Mary's Medicinal | 30mL | $34 |
| `TRD-MM-PATCH-THC` | THC Patch | Mary's Medicinal | 1 patch | $14 |
| `TRD-PB-PATCH-CBD` | CBD Patch | Papa & Barkley | 1 patch | $18 |

### 3.4 Promotions (The Roots In-Store Daily Deals)

| Promotion | Day/Time | Category | Discount |
|---|---|---|---|
| Munchie Mondays | Monday, all day | All Edibles | 10% off |
| Terpy Tuesdays | Tuesday, all day | All Cartridges/Pods | 10% off |
| Waxy Wednesdays | Wednesday, all day | All Concentrates | 10% off |
| Thirsty Thursdays | Thursday, all day | All Drinks/Beverages | 10% off |
| Flower Fridays | Friday, all day | All Flower | 10% off |
| CBD Saturdays | Saturday, all day | All CBD Products | 10% off |
| Sundaze Smoke Sesh | Sunday, all day | Entire purchase | Taxes paid by store (effectively ~9.25% off) |
| Wake N Bake | Mon–Sun 9:00–10:00 AM | Entire purchase | 20% off |
| Happy Hour | Mon–Sun 4:00–5:00 PM | Entire purchase | 15% off |
| Spin to Win 2.0 | Tues & Sat | Entire purchase | Up to 40% off (website) |

> **Commerce config note:** The "Taxes on Us" Sunday deal is best handled as a 9.25% order-level discount (matching the sales tax rate) auto-applied on Sundays, rather than actually zeroing the tax in the tax system. Category-specific daily deals should use product taxonomy conditions matching the relevant `cannabis_category` term.

**Cannot be combined:** All per-day category deals are non-stackable. Configure exclusion groups in Commerce Promotions with `combination_strategy: none` for the daily deal set.

### 3.5 CSV Migration Config

```yaml
# migrate_plus.migration.trd_flower_products.yml
id: trd_flower_products
label: 'The Roots Dispensary — Flower Products'
source:
  plugin: csv
  path: 'private://migrations/trd_flower.csv'
  ids: [sku]
process:
  title: title
  'stores/target_id':
    plugin: default_value
    default_value: 4   # The Roots Dispensary store entity ID
  'field_brand/target_id':
    plugin: entity_lookup
    source: brand
    entity_type: taxonomy_term
    bundle: brand
    value_key: name
  field_strain_name: strain_name
  'field_strain_type/value': strain_type
  'field_thc_pct/value': thc_pct
  status: status
  body/value: description
  body/format:
    plugin: default_value
    default_value: basic_html
  variations:
    - plugin: create_or_reference
      target_type: commerce_product_variation
      values:
        type: flower_variation
        sku: sku
        'price/number': price
        'price/currency_code':
          plugin: default_value
          default_value: USD
        field_weight_quantity: weight_quantity
destination:
  plugin: entity:commerce_product
  default_bundle: flower
migration_tags:
  - the_roots_dispensary
  - flower
```

---

## 4. MJ Direct

### 4.1 Store Profile

| Field | Value |
|---|---|
| **Store Name** | MJ Direct Lompoc |
| **Machine Name** | `mj_direct_lompoc` |
| **Address** | 715 E Ocean Ave, Lompoc, CA 93436 |
| **Website** | mjdirect.com/locations/mjdirectLompoc |
| **License** | C10-0001585 (Adult-Use + Medical) |
| **Hours** | Mon–Sun 9:00 AM – 9:00 PM |
| **Rating** | 4.6★ (43 reviews) |
| **Delivery** | Yes — next-day delivery across CA; same-day in-store pickup |
| **Payment** | Cash, Debit |
| **Tax Display** | Before tax |
| **Business Model** | Direct-to-consumer marketplace; brand partners manage own inventory/pricing |

**Notable features:**
- $50 ounce deals confirmed in reviews ("cheapest in town")
- 2g cartridges for $30 confirmed
- Momentum Business Accelerator & Social Equity Programs
- Budget-focused positioning

### 4.2 Brand Taxonomy

| Term Label | Machine Name |
|---|---|
| Muha Meds | `muha_meds` |
| Kiva Confections | `kiva_confections` |
| Cannabiotix | `cannabiotix` |
| Flavorade | `flavorade` |
| Stiiizy | `stiiizy` |
| 420 Proper | `four_twenty_proper` |
| Weeding Cake | `weeding_cake` |
| Juicy Z | `juicy_z` |
| Raw Garden | `raw_garden` |
| Heavy Hitters | `heavy_hitters` |
| Jeeter | `jeeter` |
| Glasshouse Farms | `glasshouse_farms` |
| Top Shelf Cultivation | `top_shelf_cultivation` |
| Kanha | `kanha` |
| Wyld | `wyld` |
| Dr. Norm's | `dr_norms` |

> **Brand model note:** MJ Direct empowers brand partners to manage their own inventory and pricing. This means some SKUs are sourced and priced directly by brands rather than the store — an important distinction for how you structure Commerce Store assignments. Consider creating a separate product type flag (`brand_managed_inventory = true`) or a custom field to track this.

### 4.3 Product Catalog

#### Flower (Budget-focused — $50 oz is signature offering)

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `MJD-420P-WEDDCAKE-3.5` | Wedding Cake | 420 Proper | 3.5g | 22–27% | $14 |
| `MJD-420P-WEDDCAKE-28` | Wedding Cake | 420 Proper | 28g | 22–27% | $50 |
| `MJD-WEDCAK-VAR-28` | Weeding Cake | Weeding Cake | 28g | 20–26% | $50 |
| `MJD-JUICY-SUNPUNCH-28` | Sunshine Punch | Juicy Z | 28g | 22–28% | $50 |
| `MJD-CBX-OGK-3.5` | OG Kush | Cannabiotix | 3.5g | 26–32% | $40 |
| `MJD-GH-LEMON-3.5` | Lemon OG | Glasshouse Farms | 3.5g | 19–24% | $28 |
| `MJD-TSC-WHTWIDOW-28` | White Widow | Top Shelf | 28g | 18–23% | $85 |

#### Vapes (2g carts at $30 confirmed as key deal)

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `MJD-STZ-CDT-GEL-0.5` | CDT Pod — Gelato | Stiiizy | 0.5g | 87–92% | $28 |
| `MJD-STZ-CDT-GEL-1` | CDT Pod — Gelato | Stiiizy | 1g | 87–92% | $50 |
| `MJD-MUHA-CDT-2G` | CDT Cart 2g — Various | Muha Meds | 2g | 78–88% | $30 |
| `MJD-FLAV-CART-2G` | Flavorade Cart 2g | Flavorade | 2g | 75–85% | $30 |
| `MJD-HH-ULTRA-1` | Ultra Potent | Heavy Hitters | 1g | 90–95% | $38 |
| `MJD-RG-RLR-1` | Refined Live Resin | Raw Garden | 1g | 84–90% | $45 |

#### Pre-Rolls

| SKU | Product | Brand | Weight | THC % | Price |
|---|---|---|---|---|---|
| `MJD-JEET-BABY5PK-VAR` | Baby Jeeter 5-Pack | Jeeter | 5×0.5g | 32–36% | $24 |
| `MJD-JEET-JUICE-VAR` | Jeeter Juice | Jeeter | 1g | 55–65% | $22 |

#### Concentrates

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `MJD-FLAV-BADDER-1` | Live Badder | Flavorade | 1g | 70–82% | $30 |
| `MJD-CBX-LR-1` | Live Resin | Cannabiotix | 1g | 72–84% | $38 |
| `MJD-RG-CRUMB-1` | Live Crumble | Raw Garden | 1g | 70–80% | $38 |

#### Edibles

| SKU | Product | Brand | Qty | THC | Price |
|---|---|---|---|---|---|
| `MJD-KANHA-GUM-MANGO-10` | Mango Gummies | Kanha | 10-pack | 100mg | $18 |
| `MJD-WYLD-GUM-HUCK-10` | Huckleberry Gummies | Wyld | 10-pack | 100mg | $22 |
| `MJD-KIVA-CHOC-DARK-20` | Dark Chocolate Bar | Kiva Confections | 20-piece | 180mg | $22 |
| `MJD-DRNRM-COOKIE-100` | Chocolate Chip Cookie | Dr. Norm's | 1 cookie | 100mg | $16 |

### 4.4 Promotions

| Promotion | Type | Discount | Notes |
|---|---|---|---|
| $50 Ounces | Product-level pricing | Budget ounce tier | Applied at SKU price level, not a promotion |
| 2g Carts for $30 | Product-level pricing | Budget cart tier | Applied at SKU price |
| Brand-specific deals | Brand partner driven | Varies | Partners set their own discounts; implement via per-brand promotions |
| First-time customer | Account flag | Varies | Confirm rate on Weedmaps listing |

> **Implementation note:** Because MJ Direct's brand partners control their own pricing, the main "discounts" are actually built into SKU prices rather than order-level promotions. Focus Commerce configuration on accurate base pricing and use the `commerce_price_rule` module to handle any time-limited brand-partner deals.

### 4.5 CSV Migration Config

```yaml
# migrate_plus.migration.mjd_flower_products.yml
id: mjd_flower_products
label: 'MJ Direct Lompoc — Flower Products'
source:
  plugin: csv
  path: 'private://migrations/mjd_flower.csv'
  ids: [sku]
process:
  title: title
  'stores/target_id':
    plugin: default_value
    default_value: 5   # MJ Direct Lompoc store entity ID
  'field_brand/target_id':
    plugin: entity_lookup
    source: brand
    entity_type: taxonomy_term
    bundle: brand
    value_key: name
  field_strain_name: strain_name
  'field_strain_type/value': strain_type
  'field_thc_pct/value': thc_pct
  status: status
  body/value: description
  body/format:
    plugin: default_value
    default_value: basic_html
  variations:
    - plugin: create_or_reference
      target_type: commerce_product_variation
      values:
        type: flower_variation
        sku: sku
        'price/number': price
        'price/currency_code':
          plugin: default_value
          default_value: USD
        field_weight_quantity: weight_quantity
destination:
  plugin: entity:commerce_product
  default_bundle: flower
migration_tags:
  - mj_direct_lompoc
  - flower
```

---

## 5. Bleu Diamond Lounge & Delivery

### 5.1 Store Profile

| Field | Value |
|---|---|
| **Store Name** | Bleu Diamond Lounge |
| **Machine Name** | `bleu_diamond_lompoc` |
| **Address** | 1129 N H St, Lompoc, CA 93436 |
| **Phone** | (805) 310-1078 |
| **Website** | bleudiamondco.com |
| **License** | C10-0001383 (Bleu Diamond Social Club — Adult-Use + Medical) |
| **Hours** | Mon–Sun 8:00 AM – 10:00 PM (last online order 7:45 PM) |
| **Rating** | 4.7★ (334+ reviews) |
| **Founded** | 2017 — oldest delivery service in the group |
| **Delivery** | Yes — FREE delivery, no hidden fees; 20–45 min same-day ETA; next-day delivery available; real-time tracking |
| **Delivery Area** | Central Coast + Ventura County (Santa Maria, Lompoc, Oxnard, Ventura, SLO, Arroyo Grande, Pismo Beach, Nipomo, Grover Beach, Port Hueneme) |
| **Payment** | Cash, Debit; 2.5% cashback wallet on all purchases |
| **Tax Display** | Prices before tax |
| **Amenities** | Storefront + Consumption Lounge (Bleu Lounge) — exclusive feature in Lompoc |
| **Awards** | Best Delivery Service in the 805 — 3 consecutive years (Weedmaps) |

**Key staff/drivers (from reviews):** Manuel (delivery), Crystal

**Unique features:**
- Exclusive consumption lounge (only dispensary in Lompoc with one)
- Largest fleet of delivery drivers on Central Coast
- 2.5% cashback Bleu Diamond wallet on every purchase
- Real-time play-by-play delivery tracking
- Pre-order menu for same-day delivery of out-of-stock items

### 5.2 Brand Taxonomy

| Term Label | Machine Name |
|---|---|
| Stiiizy | `stiiizy` |
| Raw Garden | `raw_garden` |
| Jeeter | `jeeter` |
| Heavy Hitters | `heavy_hitters` |
| Alien Labs | `alien_labs` |
| Connected Cannabis Co. | `connected_cannabis_co` |
| Kanha | `kanha` |
| Wyld | `wyld` |
| Kiva Confections | `kiva_confections` |
| Papa & Barkley | `papa_and_barkley` |
| Coldfire Extracts | `coldfire_extracts` |
| Emerald Bay Extracts | `emerald_bay_extracts` |
| Lime Cannabis | `lime_cannabis` |
| Bear Labs | `bear_labs` |
| Floracal | `floracal` |
| Top Shelf Cultivation | `top_shelf_cultivation` |
| Glasshouse Farms | `glasshouse_farms` |
| Sluggers | `sluggers` |
| Space Coyote | `space_coyote` |
| Dr. Norm's | `dr_norms` |
| HVY Craft Cannabis | `hvy_craft_cannabis` |
| Lowell Herb Co. | `lowell_herb_co` |
| Presidential | `presidential` |

> **Region-specific note:** Bleu Diamond serves the entire Central Coast + Ventura County — the widest delivery footprint of any Lompoc store. Their product catalog is one of the largest in the region and is tuned for delivery customers (high-margin concentrates, infused pre-rolls, and edible variety).

### 5.3 Product Catalog

#### Flower

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `BD-CONN-BISCOTTI-3.5` | Biscotti | Connected | 3.5g | 30–34% | $52 |
| `BD-ALIEN-GALACTIC-3.5` | Galactic Runtz | Alien Labs | 3.5g | 27–33% | $55 |
| `BD-CF-LROSIN-3.5` | Live Rosin — Wedding Cake | Coldfire | 3.5g | 26–32% | $50 |
| `BD-FLOR-ZKITZ-3.5` | Zkittlez | Floracal | 3.5g | 22–28% | $45 |
| `BD-GH-LEMON-3.5` | Lemon OG | Glasshouse Farms | 3.5g | 19–24% | $30 |
| `BD-GH-PAPAYA-7` | Papaya | Glasshouse Farms | 7g | 19–24% | $55 |
| `BD-TSC-OGKUSH-28` | OG Kush | Top Shelf | 28g | 18–23% | $90 |
| `BD-PRES-OGK-3.5` | Presidential OG | Presidential | 3.5g | 20–26% | $36 |

#### Pre-Rolls & Infused Pre-Rolls

| SKU | Product | Brand | Weight | THC % | Price |
|---|---|---|---|---|---|
| `BD-JEET-BABY5PK-JJFUZ` | Baby Jeeter 5-Pack — Fuzzy Peach | Jeeter | 5×0.5g | 32–36% | $26 |
| `BD-JEET-JUICE-BTROP` | Jeeter Juice — Blue Tropic | Jeeter | 1g | 55–65% | $24 |
| `BD-SLUG-HIT-GDROP` | Slugger Hit — Guava Drop | Sluggers | 2g | 60–72% | $26 |
| `BD-LOW-SMOKES7-IND` | Lowell Smokes 7-Pack — Indica | Lowell Herb Co. | 7×0.5g | 18–24% | $32 |
| `BD-HH-DIAM-2PK` | Diamond Pre-Roll 2-Pack | Heavy Hitters | 2×1g | 58–70% | $36 |

#### Vapes

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `BD-STZ-CDT-BGK-1` | CDT Pod — Birthday Cake | Stiiizy | 1g | 87–92% | $55 |
| `BD-STZ-LR-OGK-0.5` | Live Resin Pod — OG Kush | Stiiizy | 0.5g | 78–87% | $35 |
| `BD-RG-RLR-GEL-1` | Refined Live Resin — Gelato | Raw Garden | 1g | 84–90% | $50 |
| `BD-HH-ULTRA-GM-1` | Ultra Potent — Grapefruit Mint | Heavy Hitters | 1g | 90–95% | $40 |
| `BD-CONN-LR-GUSH-1` | Live Resin Cart — Gushers | Connected | 1g | 82–90% | $55 |
| `BD-ALIEN-LR-ZKITZ-1` | Live Resin — Zkittlez | Alien Labs | 1g | 82–90% | $56 |

#### Concentrates

| SKU | Product | Brand | Size | THC % | Price |
|---|---|---|---|---|---|
| `BD-CF-LROSH-GEL-1` | Live Rosin — Gelato | Coldfire Extracts | 1g | 74–85% | $62 |
| `BD-BEAR-LROSH-OGK-1` | Live Rosin — OG Kush | Bear Labs | 1g | 75–84% | $58 |
| `BD-RG-LBAD-RNTZ-1` | Live Badder — Runtz | Raw Garden | 1g | 72–82% | $44 |
| `BD-LIME-LROSH-WC-1` | Live Rosin — Wedding Cake | Lime Cannabis | 1g | 73–83% | $50 |
| `BD-EBE-SHAT-OGK-1` | Shatter — OG Kush | Emerald Bay | 1g | 68–78% | $30 |

#### Edibles

| SKU | Product | Brand | Qty | THC | Price |
|---|---|---|---|---|---|
| `BD-KANHA-GUM-TROP-10` | Tropical Punch Gummies | Kanha | 10-pack | 100mg | $20 |
| `BD-KANHA-GUM-NANO-10` | Nano Gummies | Kanha | 10-pack | 100mg | $26 |
| `BD-WYLD-GUM-RASP-10` | Raspberry Gummies (Sativa) | Wyld | 10-pack | 100mg | $26 |
| `BD-KIVA-CHOC-DARK-20` | Dark Chocolate Bar | Kiva Confections | 20-piece | 180mg | $26 |
| `BD-DRNRM-COOKIE-100` | Chocolate Chip Cookie | Dr. Norm's | 1 cookie | 100mg | $18 |

#### Beverages

| SKU | Product | Brand | Size | THC | Price |
|---|---|---|---|---|---|
| `BD-HVY-MARG-CAN` | Cannabis Margarita | HVY Craft Cannabis | 12 fl oz | 25mg | $8 |
| `BD-HVY-MULE-CAN` | Moscow Mule | HVY Craft Cannabis | 12 fl oz | 25mg | $8 |
| `BD-HVY-SELT-CAN` | Seltzer — Mixed Berry | HVY Craft Cannabis | 12 fl oz | 25mg | $8 |

#### Wellness

| SKU | Product | Brand | Size | Price |
|---|---|---|---|---|
| `BD-PB-TINCT-13-30ML` | Releaf Tincture 1:3 | Papa & Barkley | 30mL | $44 |
| `BD-PB-BALM-13-30ML` | Releaf Balm 1:3 | Papa & Barkley | 30mL | $30 |
| `BD-PB-PATCH-CBD` | CBD Patch | Papa & Barkley | 1 patch | $18 |

### 5.4 Promotions

| Promotion | Trigger | Discount | Notes |
|---|---|---|---|
| 2.5% Cashback Wallet | Every purchase | 2.5% back to BD Wallet | Implement via `commerce_loyalty` or custom field on customer profile |
| Free Delivery | All orders | $0 delivery fee | No minimum; configure Commerce Shipping method with $0 rate for all zones |
| Pre-Order Same-Day | Out-of-stock item pre-order | Guaranteed same-day | Inventory availability flag; not a discount |
| 3-Year "Best of 805" | Marketing badge | N/A | Display badge on store profile page |

> **Cashback wallet implementation:** Use a customer-level `bd_wallet_balance` (decimal) field. On each order completion, trigger a rule (Commerce Rules or custom module) to credit 2.5% of order total to the customer's wallet balance. Wallet redemption at checkout reduces the order total before tax calculation.

### 5.5 CSV Migration Config

```yaml
# migrate_plus.migration.bd_flower_products.yml
id: bd_flower_products
label: 'Bleu Diamond Lompoc — Flower Products'
source:
  plugin: csv
  path: 'private://migrations/bd_flower.csv'
  ids: [sku]
process:
  title: title
  'stores/target_id':
    plugin: default_value
    default_value: 6   # Bleu Diamond Lompoc store entity ID
  'field_brand/target_id':
    plugin: entity_lookup
    source: brand
    entity_type: taxonomy_term
    bundle: brand
    value_key: name
  field_strain_name: strain_name
  'field_strain_type/value': strain_type
  'field_thc_pct/value': thc_pct
  status: status
  body/value: description
  body/format:
    plugin: default_value
    default_value: basic_html
  variations:
    - plugin: create_or_reference
      target_type: commerce_product_variation
      values:
        type: flower_variation
        sku: sku
        'price/number': price
        'price/currency_code':
          plugin: default_value
          default_value: USD
        field_weight_quantity: weight_quantity
destination:
  plugin: entity:commerce_product
  default_bundle: flower
migration_tags:
  - bleu_diamond_lompoc
  - flower
```

---

## 6. Leaf Dispensary

### 6.1 Store Profile

| Field | Value |
|---|---|
| **Store Name** | Leaf Dispensary |
| **Machine Name** | `leaf_dispensary_lompoc` |
| **Address** | 423 W Ocean Ave, Lompoc, CA 93436 |
| **Phone** | (805) 743-4771 |
| **Website** | leaflompoc.com |
| **Email** | leafdispensary@outlook.com |
| **License** | C10 — TBD (verify at real.cannabis.ca.gov) |
| **Hours** | Mon–Sat 7:00 AM – 8:00 PM · Sun 10:00 AM – 8:00 PM |
| **Rating** | 4.5★ (203+ reviews) |
| **Founded** | 2019 — Santa Barbara County's **first** recreational dispensary |
| **Delivery** | Yes — local Lompoc delivery |
| **Payment** | Cash, Debit |
| **Tax Display** | Tax-inclusive pricing ("prices include tax — no surprise at checkout") — confirmed in reviews |
| **Unique** | Sells **cannabis clones and seeds** for home cultivation (rare among Lompoc stores) |

**Key staff (from reviews):** Angie, Trevor, Angel, Erica, Andrew, Jason

**Signature differentiators:**
- Tax-inclusive pricing (rare among Lompoc stores — matches Elevate's model)
- Clone and seed sales
- Exclusive carry of 420 Kingdom brand in Lompoc
- Large flower display taking up 1/3 of counter

### 6.2 Brand Taxonomy

| Term Label | Machine Name |
|---|---|
| Coldfire Extracts | `coldfire_extracts` |
| Stiiizy | `stiiizy` |
| Claybourne Co. | `claybourne_co` |
| Top Shelf Cultivation | `top_shelf_cultivation` |
| Wyld | `wyld` |
| 420 Kingdom | `four_twenty_kingdom` |
| Korova | `korova` |
| Hydrotic Flower | `hydrotic_flower` |
| Sugar Babies | `sugar_babies` |
| State Flower | `state_flower` |
| Purple City Genetics | `purple_city_genetics` |
| CAKE she hits different | `cake_she_hits_different` |
| Dr. Norm's | `dr_norms` |
| Glasshouse Farms | `glasshouse_farms` |
| Raw Garden | `raw_garden` |
| Jeeter | `jeeter` |
| Heavy Hitters | `heavy_hitters` |
| Kanha | `kanha` |
| Kiva Confections | `kiva_confections` |
| Papa & Barkley | `papa_and_barkley` |

> **Exclusive brand note:** 420 Kingdom is confirmed as a Leaf Dispensary exclusive in Lompoc. Their flagship strain "Wappa" (heavy Indica) is a staff-featured product. Create a `brand_exclusive` boolean field on the brand taxonomy term to flag this.

### 6.3 Product Catalog

> **Tax note:** Leaf lists prices as tax-inclusive. In Drupal Commerce, set the price display for this store entity to show prices as inclusive of excise tax (same configuration as Elevate Lompoc). See Elevate guide §11.4.

#### Flower

| SKU | Product | Brand | Size | THC % | Price (incl. excise) |
|---|---|---|---|---|---|
| `LF-420K-WAPPA-3.5` | Wappa (Exclusive) | 420 Kingdom | 3.5g | 22–28% | $38 |
| `LF-HYD-CITSUN-3.5` | Citrus Tsunami | Hydrotic Flower | 3.5g | 26–30% | $42 |
| `LF-CLAY-GELATO-3.5` | Gelato #33 | Claybourne Co. | 3.5g | 24–30% | $42 |
| `LF-CLAY-FRSTFLY-3.5` | Frosted Flyers | Claybourne Co. | 3.5g | 25–30% | $44 |
| `LF-SF-GELATO33-3.5` | Gelato #33 | State Flower | 3.5g | 26–30% | $48 |
| `LF-GH-LEMON-3.5` | Lemon OG | Glasshouse Farms | 3.5g | 19–24% | $32 |
| `LF-TSC-WHTWIDOW-3.5` | White Widow | Top Shelf | 3.5g | 18–23% | $24 |
| `LF-TSC-WHTWIDOW-28` | White Widow | Top Shelf | 28g | 18–23% | $95 |
| `LF-420K-WAPPA-28` | Wappa Ounce (Exclusive) | 420 Kingdom | 28g | 22–28% | $140 |

#### Clones & Seeds (Unique product type)

> **Implementation note:** Clones and seeds require a distinct Drupal Commerce product type `cannabis_clone_seed` with fields for: Genetic/Strain (text), Growth Stage (`clone` or `seed`), Seed Count (integer), Clone Root Status (list: rooted/unrooted), and Breeder (entity ref to brand). These are non-weight-based SKUs.

| SKU | Product | Brand | Type | Price |
|---|---|---|---|---|
| `LF-PCG-CLONE-VAR` | Clone — Various Strains | Purple City Genetics | Rooted Clone | $20–$30 |
| `LF-420K-CLONE-WAPPA` | Clone — Wappa | 420 Kingdom | Rooted Clone | $25 |
| `LF-PCG-SEED-VAR` | Seed Pack — Various | Purple City Genetics | Seed (pack) | $50–$80 |

#### Pre-Rolls & Infused Pre-Rolls

| SKU | Product | Brand | Weight | THC % | Price (incl. excise) |
|---|---|---|---|---|---|
| `LF-JEET-BABY5PK-LD` | Baby Jeeter 5-Pack — Lemon Drop | Jeeter | 5×0.5g | 32–36% | $28 |
| `LF-JEET-JUICE-BTR` | Jeeter Juice — Butterscotch | Jeeter | 1g | 55–65% | $26 |
| `LF-SGAR-BLUNT-3PK` | Sugar Babies Blunt 3-Pack | Sugar Babies | 3×1g | 28–38% | $24 |
| `LF-SGAR-BLUNT-1` | Sugar Babies Blunt Single | Sugar Babies | 1g | 28–38% | $10 |
| `LF-KOR-EIGHTHS-VAR` | Korova Eighth | Korova | 3.5g | 22–28% | $36 |
| `LF-HH-DIAM-1G` | Diamond Pre-Roll | Heavy Hitters | 1g | 58–70% | $24 |

#### Vapes

| SKU | Product | Brand | Size | THC % | Price (incl. excise) |
|---|---|---|---|---|---|
| `LF-STZ-CDT-GEL-0.5` | CDT Pod — Gelato | Stiiizy | 0.5g | 87–92% | $32 |
| `LF-STZ-CDT-GEL-1` | CDT Pod — Gelato | Stiiizy | 1g | 87–92% | $58 |
| `LF-CAKE-CDT-VAR-1` | CDT Cart | CAKE | 1g | 78–88% | $36 |
| `LF-RG-RLR-GEL-1` | Refined Live Resin — Gelato | Raw Garden | 1g | 84–90% | $52 |
| `LF-HH-ULTRA-WM-1` | Ultra Potent — Watermelon | Heavy Hitters | 1g | 90–95% | $44 |

> **Vendor pop-up note:** CAKE runs recurring vendor pop-ups at Leaf with a BOGO deal (buy 2 get 1 for $1). Configure this as a volume-based promotion scoped to the `cake_she_hits_different` brand taxonomy term.

#### Concentrates

| SKU | Product | Brand | Size | THC % | Price (incl. excise) |
|---|---|---|---|---|---|
| `LF-CF-LROSH-GEL-1` | Live Rosin — Gelato | Coldfire Extracts | 1g | 74–85% | $65 |
| `LF-CF-LBAD-OGK-1` | Live Badder — OG Kush | Coldfire Extracts | 1g | 72–82% | $55 |
| `LF-RG-LBAD-PPP-1` | Live Badder — Papaya Punch | Raw Garden | 1g | 72–82% | $44 |

#### Edibles

| SKU | Product | Brand | Qty | THC | Price (incl. excise) |
|---|---|---|---|---|---|
| `LF-KANHA-GUM-TROP-10` | Tropical Punch Gummies | Kanha | 10-pack | 100mg | $22 |
| `LF-WYLD-GUM-HUCK-10` | Huckleberry Gummies | Wyld | 10-pack | 100mg | $26 |
| `LF-WYLD-GUM-PEACH-10` | Peach Gummies | Wyld | 10-pack | 100mg | $26 |
| `LF-DRNRM-COOKIE-100` | Chocolate Chip Cookie | Dr. Norm's | 1 cookie | 100mg | $20 |

> **Dr. Norm's BOGO:** Leaf has run Dr. Norm's Buy One Get One events (confirmed in event history). Configure as a quantity-based promotion for products with brand taxonomy = `dr_norms`.

#### Wellness

| SKU | Product | Brand | Size | Price (incl. excise) |
|---|---|---|---|---|
| `LF-PB-BALM-13-30ML` | Releaf Balm 1:3 | Papa & Barkley | 30mL | $32 |
| `LF-PB-TINCT-13-30ML` | Releaf Tincture 1:3 | Papa & Barkley | 30mL | $44 |

### 6.4 Promotions

| Promotion | Trigger | Discount | Notes |
|---|---|---|---|
| CAKE BOGO | Buy 2 CAKE vapes | 3rd for $1 | Brand brand taxonomy = `cake_she_hits_different`; vendor pop-up events |
| Dr. Norm's BOGO | Buy 1 Dr. Norm's | 2nd for $0 | Brand taxonomy = `dr_norms`; event-based |
| 420 Kingdom Vendor Day | Vendor pop-up events | TBD | Manage as time-limited promotion |
| First Visit 15% | First purchase (review confirm) | 15% off | Account flag `first_purchase = true` |
| Loyalty (show review) | Present review screenshot | 15% off next purchase | Staff-administered; manual coupon code |
| St. Ides BOGO Tea | Bundle deal | BOGO | Category/brand specific; confirm availability |

**Tax-inclusive pricing reminder:** Since Leaf lists prices inclusive of excise tax, configure their store's price display to show inclusive pricing. The `commerce_tax` module's `price_display` setting should be set to `unit_price_inclusive` for this store entity only.

### 6.5 CSV Migration Config

```yaml
# migrate_plus.migration.lf_flower_products.yml
id: lf_flower_products
label: 'Leaf Dispensary — Flower Products'
source:
  plugin: csv
  path: 'private://migrations/lf_flower.csv'
  ids: [sku]
process:
  title: title
  'stores/target_id':
    plugin: default_value
    default_value: 7   # Leaf Dispensary store entity ID
  'field_brand/target_id':
    plugin: entity_lookup
    source: brand
    entity_type: taxonomy_term
    bundle: brand
    value_key: name
  field_strain_name: strain_name
  'field_strain_type/value': strain_type
  'field_thc_pct/value': thc_pct
  status: status
  body/value: description
  body/format:
    plugin: default_value
    default_value: basic_html
  variations:
    - plugin: create_or_reference
      target_type: commerce_product_variation
      values:
        type: flower_variation
        sku: sku
        'price/number': price
        'price/currency_code':
          plugin: default_value
          default_value: USD
        field_weight_quantity: weight_quantity
destination:
  plugin: entity:commerce_product
  default_bundle: flower
migration_tags:
  - leaf_dispensary_lompoc
  - flower
```

---

## 7. Cross-Store CSV Import Notes

### 7.1 Store Entity IDs

When running migrations, ensure the correct Drupal Commerce store entity IDs are referenced in each YAML config. The default IDs assumed in this guide are:

| Store | Machine Name | Assumed Entity ID |
|---|---|---|
| Elevate Lompoc | `elevate_lompoc` | 1 |
| One Plant Lompoc | `one_plant_lompoc` | 2 |
| Royal Healing Emporium | `royal_healing_emporium` | 3 |
| The Roots Dispensary | `the_roots_dispensary` | 4 |
| MJ Direct Lompoc | `mj_direct_lompoc` | 5 |
| Bleu Diamond Lompoc | `bleu_diamond_lompoc` | 6 |
| Leaf Dispensary | `leaf_dispensary_lompoc` | 7 |

Verify actual IDs by running:
```bash
drush ev "print_r(\Drupal::entityTypeManager()->getStorage('commerce_store')->loadMultiple());"
```

### 7.2 Running All Migrations

```bash
# Run all flower migrations
drush migrate:import one_plant_flower_products,rhe_flower_products,trd_flower_products,mjd_flower_products,bd_flower_products,lf_flower_products

# Check status of all
drush migrate:status --tag=flower

# Run a full store import (replace [store_code] with e.g. trd)
drush migrate:import --tag=[store_code]_lompoc
```

### 7.3 Tax Display Variations

Two different tax display models exist across these stores — this must be configured at the store entity level:

| Tax Model | Stores | Commerce Config |
|---|---|---|
| **Tax-inclusive** (excise built in, sales added at checkout) | Elevate Lompoc, Leaf Dispensary | `price_display: unit_price_inclusive` on store; excise tax type set to "Included in price" |
| **Tax-exclusive** (both taxes added at checkout) | One Plant, RHE, TRD, MJ Direct, Bleu Diamond | Default Commerce behavior; excise and sales tax added at checkout |

### 7.4 Multi-Store Shared Brands

Several brands appear across all or most stores. When importing, the `entity_lookup` plugin will reuse existing taxonomy terms rather than creating duplicates — this is the correct behavior. Ensure these shared terms exist in the `brand` vocabulary before running any migration:

`Stiiizy, Raw Garden, Jeeter, Heavy Hitters, Alien Labs, Connected Cannabis Co., Kanha, Wyld, Papa & Barkley, Glasshouse Farms, Top Shelf Cultivation, Dr. Norm's, Kiva Confections, Emerald Bay Extracts, Coldfire Extracts, Lime Cannabis, Floracal, Claybourne Co., Lowell Herb Co., Space Coyote, Sluggers, Mary's Medicinal`

Pre-populate with:
```bash
drush ev "
\$terms = ['Stiiizy','Raw Garden','Jeeter','Heavy Hitters','Alien Labs',
           'Connected Cannabis Co.','Kanha','Wyld','Papa & Barkley',
           'Glasshouse Farms','Top Shelf Cultivation','Dr. Norm\'s',
           'Kiva Confections','Emerald Bay Extracts','Coldfire Extracts',
           'Lime Cannabis','Floracal','Claybourne Co.','Lowell Herb Co.',
           'Space Coyote','Sluggers','Mary\'s Medicinal'];
foreach (\$terms as \$name) {
  \$term = \Drupal\taxonomy\Entity\Term::create(['vid'=>'brand','name'=>\$name]);
  \$term->save();
  echo 'Created: ' . \$name . PHP_EOL;
}
"
```

### 7.5 Store-Specific Product Types

Leaf Dispensary requires an additional product type not used by other stores:

```bash
# Create the cannabis_clone_seed product type via Drush config or admin UI
# Commerce > Configuration > Product types > Add product type
# Label: Cannabis Clone / Seed
# Machine name: cannabis_clone_seed
```

Add these fields to `cannabis_clone_seed`:

| Field Label | Machine Name | Type |
|---|---|---|
| Genetic / Strain | `field_genetic_strain` | Text (plain) |
| Product Format | `field_clone_seed_format` | List (text): clone, seed |
| Seed Count | `field_seed_count` | Integer |
| Clone Rooted | `field_clone_rooted` | Boolean |
| Breeder | `field_breeder` | Entity Ref (brand taxonomy) |

### 7.6 Bleu Diamond Cashback Wallet

Requires a custom Commerce event subscriber or Rules module config. Add to `commerce_customer` profile:

```yaml
# Field config (add via Manage Fields on customer profile)
field_bd_wallet_balance:
  label: 'Bleu Diamond Wallet Balance'
  type: decimal
  default_value: 0
  precision: 10
  scale: 2
```

Trigger wallet credit on `commerce_order.place` event: credit 2.5% of `order->getSubtotalPrice()` to the customer's `field_bd_wallet_balance`.

### 7.7 Pending Items (All Stores)

- [ ] Verify all store entity IDs after Drupal store setup
- [ ] Confirm current live SKU prices (all menus rotate daily)
- [ ] Source COA PDFs per batch for THC/CBD accuracy
- [ ] Obtain product images from brand marketing kits or store assets
- [ ] Verify CA license numbers for TRD and Leaf Dispensary at [real.cannabis.ca.gov](https://real.cannabis.ca.gov)
- [ ] Implement METRC tracking tag fields at variation level for compliance
- [ ] Confirm Royal Healing's stacking discount tiers with store directly
- [ ] Set up Bleu Diamond wallet credit event subscriber before go-live
- [ ] Configure The Roots "Sundaze Smoke Sesh" taxes-on-us promo (consult accountant on whether to implement as discount vs. actual tax waiver)

---

*Last updated: February 2026 | Drupal Commerce 2.x | Drupal 10+ | Santa Barbara County, CA*

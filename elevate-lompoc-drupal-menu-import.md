# Elevate Lompoc — Drupal Commerce Menu Import Guide
## Store: Elevate Lompoc | 118 S H St, Lompoc, CA 93436
## License: C10-0000080-LIC | elevatelompoc.com

> **Pricing Note:** All prices at Elevate Lompoc include California excise tax (15%) but do NOT include CA state sales tax. Reflect this in Commerce Tax configuration.
> **Menu Source:** Verified via Weedmaps, Jerry's Deals brand registry, Leafly, and public review data (Feb 2026).
> **Menu is dynamic** — inventory rotates daily. This doc establishes the product catalog skeleton with confirmed brands and representative SKUs. Prices should be verified against live menu before publishing.

---

## Part 1: Taxonomy Setup

Before importing products, create these taxonomy terms under the vocabularies defined in the Cannabis Product Types guide.

### Brand Taxonomy (`brand`)

Create a term for each confirmed Elevate Lompoc brand:

| Term | Machine Name | Category |
|---|---|---|
| #Hashtag | `hashtag` | Flower |
| Alien Labs | `alien_labs` | Flower, Vape, Concentrate |
| Almora | `almora` | Flower, Pre-Roll |
| American Weed Co. | `american_weed_co` | Flower |
| Bear Labs | `bear_labs` | Concentrate, Vape |
| Black Label Cannabis | `black_label_cannabis` | Flower, Pre-Roll |
| Buddies Brand | `buddies_brand` | Vape, Concentrate |
| Cake She Hits Different | `cake_shd` | Vape |
| Coldfire Extracts | `coldfire_extracts` | Concentrate |
| Connected Cannabis Co. | `connected_cannabis` | Flower, Vape, Concentrate |
| Dee Thai | `dee_thai` | Edible |
| Dr. Norm's | `dr_norms` | Edible |
| Eighth Brother | `eighth_brother` | Flower |
| Emerald Bay Extracts | `emerald_bay_extracts` | Concentrate |
| Field Trip | `field_trip` | Edible |
| Firecracker | `firecracker` | Pre-Roll |
| Flavorade | `flavorade` | Flower, Pre-Roll |
| Floracal | `floracal` | Flower |
| Glasshouse Farms | `glasshouse_farms` | Flower, Pre-Roll |
| Gramlin | `gramlin` | Flower |
| Happy Fruit | `happy_fruit` | Edible |
| Heavy Hitters | `heavy_hitters` | Vape, Pre-Roll, Concentrate |
| High 90's | `high_90s` | Vape, Pre-Roll |
| Holy Water | `holy_water` | Concentrate |
| Jeeter | `jeeter` | Pre-Roll, Infused Pre-Roll |
| Kanha | `kanha` | Edible (Gummies) |
| Kwik Ease | `kwik_ease` | Tincture, Capsule |
| Lax | `lax` | Flower |
| Lift Tickets | `lift_tickets` | Flower, Pre-Roll |
| Lime Cannabis | `lime_cannabis` | Flower, Concentrate |
| Lowell Herb Co. | `lowell_herb_co` | Pre-Roll, Flower |
| Mary's Medicinal | `marys_medicinal` | Tincture, Topical, Capsule |
| Mids Factory | `mids_factory` | Flower |
| Mr. Zips | `mr_zips` | Flower |
| Papa & Barkley | `papa_barkley` | Tincture, Topical, Capsule |
| Paradiso | `paradiso` | Flower |
| Platinum Vape | `platinum_vape` | Vape |
| Pinkies | `pinkies` | Pre-Roll |
| Puff Punch | `puff_punch` | Beverage |
| Quiet Kings | `quiet_kings` | Flower |
| Raw Garden | `raw_garden` | Vape, Concentrate |
| Revelry Herb Co. | `revelry_herb_co` | Flower, Pre-Roll |
| Sluggers | `sluggers` | Pre-Roll, Infused Pre-Roll |
| Smoove | `smoove` | Edible |
| Space Coyote | `space_coyote` | Pre-Roll, Infused Pre-Roll |
| Stiiizy | `stiiizy` | Vape, Flower, Pre-Roll |
| Super Dope | `super_dope` | Flower |
| Top Secret | `top_secret` | Flower |
| Top Shelf Cultivation | `top_shelf_cultivation` | Flower |
| Umma | `umma` | Flower, Pre-Roll |
| Vuze | `vuze` | Vape |
| Waferz | `waferz` | Edible |
| Wave Rider | `wave_rider` | Vape |
| West Coast Treez | `west_coast_treez` | Flower |
| Whoa | `whoa` | Flower |
| Wyld | `wyld` | Edible (Gummies) |

---

## Part 2: Menu Categories & Product Types

Elevate Lompoc carries the following confirmed menu categories. Each maps to a Drupal Commerce product type.

| Menu Category | Drupal Product Type | Machine Name |
|---|---|---|
| Flower | Flower | `flower` |
| Pre-Rolls | Pre-Roll | `pre_roll` |
| Infused Pre-Rolls | Pre-Roll (Infused) | `pre_roll` |
| Vape Pens / Cartridges | Vape / Cartridge | `vape_cartridge` |
| Concentrates | Concentrate | `concentrate` |
| Edibles | Edible | `edible` |
| Drinks / Beverages | Edible (Beverage) | `edible` |
| Tinctures | Tincture | `tincture` |
| Capsules | Edible (Capsule) | `edible` |
| Wellness / Topicals | Topical | `topical` |
| Accessories | Accessory | `accessory` |

---

## Part 3: Flower Products

### Product Type: `flower`
### Store: Elevate Lompoc

---

#### Connected Cannabis Co. — Flower

| Field | Value |
|---|---|
| **Brand** | Connected Cannabis Co. |
| **Product Type** | Flower |
| **Store** | Elevate Lompoc |
| **CA License (Brand)** | CDPH-10003548 |

**Variations / SKUs:**

| SKU | Product Name | Strain | Type | Weight | Approx. THC% | Price (pre-tax) |
|---|---|---|---|---|---|---|
| `EL-CONN-BISCOTTI-3.5` | Biscotti | Biscotti | Hybrid | 3.5g | 28–33% | $45–$55 |
| `EL-CONN-RUNTZ-3.5` | Runtz | Runtz | Hybrid | 3.5g | 29–34% | $45–$55 |
| `EL-CONN-GUSHERS-3.5` | Gushers | Gushers | Hybrid | 3.5g | 27–32% | $45–$55 |
| `EL-CONN-SLURTY3-3.5` | Slurty #3 | Slurty #3 | Hybrid | 3.5g | 28–33% | $45–$55 |

---

#### Alien Labs — Flower

| Field | Value |
|---|---|
| **Brand** | Alien Labs |
| **Product Type** | Flower |

**Variations / SKUs:**

| SKU | Product Name | Strain | Type | Weight | Approx. THC% | Price |
|---|---|---|---|---|---|---|
| `EL-ALIEN-AREA41-3.5` | Area 41 | Area 41 | Hybrid | 3.5g | 27–32% | $50–$60 |
| `EL-ALIEN-GALACTIC-3.5` | Galactic Runtz | Galactic Runtz | Hybrid | 3.5g | 28–34% | $50–$60 |
| `EL-ALIEN-BAKLAVA-3.5` | Baklava | Baklava | Indica | 3.5g | 25–30% | $50–$60 |
| `EL-ALIEN-ZKITTLEZ-3.5` | Zkittlez | Zkittlez | Indica | 3.5g | 24–28% | $50–$60 |

---

#### Glasshouse Farms — Flower

| Field | Value |
|---|---|
| **Brand** | Glasshouse Farms |
| **Product Type** | Flower |
| **Notes** | Sun+Earth certified greenhouse; Central Coast grown |

**Variations / SKUs:**

| SKU | Product Name | Strain | Type | Weight | Approx. THC% | Price |
|---|---|---|---|---|---|---|
| `EL-GHF-LEMON-1` | Lemon OG | Lemon OG | Hybrid | 1g | 20–25% | $10–$14 |
| `EL-GHF-LEMON-3.5` | Lemon OG | Lemon OG | Hybrid | 3.5g | 20–25% | $30–$40 |
| `EL-GHF-LEMON-7` | Lemon OG | Lemon OG | Hybrid | 7g | 20–25% | $50–$65 |
| `EL-GHF-PAPAYA-3.5` | Papaya | Papaya | Indica | 3.5g | 19–24% | $30–$40 |
| `EL-GHF-PAPAYA-7` | Papaya | Papaya | Indica | 7g | 19–24% | $50–$65 |

---

#### Mr. Zips — Flower

| Field | Value |
|---|---|
| **Brand** | Mr. Zips |
| **Product Type** | Flower |
| **Notes** | Featured "Flower Friday" brand at Elevate |

**Variations / SKUs:**

| SKU | Product Name | Strain | Type | Weight | Approx. THC% | Price |
|---|---|---|---|---|---|---|
| `EL-MRZIPS-SUNPUNCH-14` | Sunshine Punch | Sunshine Punch | Sativa | 14g | 22–27% | $55–$75 |
| `EL-MRZIPS-SUNPUNCH-3.5` | Sunshine Punch | Sunshine Punch | Sativa | 3.5g | 22–27% | $20–$28 |
| `EL-MRZIPS-SUNPUNCH-28` | Sunshine Punch | Sunshine Punch | Sativa | 28g | 22–27% | $90–$110 |

---

#### Floracal — Flower

| Field | Value |
|---|---|
| **Brand** | Floracal |
| **Notes** | Sonoma County small-batch |

**Variations / SKUs:**

| SKU | Product Name | Strain | Type | Weight | Approx. THC% | Price |
|---|---|---|---|---|---|---|
| `EL-FLORAL-ZKIT-3.5` | Zkittlez | Zkittlez | Indica | 3.5g | 22–28% | $45–$55 |
| `EL-FLORAL-GDP-3.5` | Granddaddy Purple | GDP | Indica | 3.5g | 20–26% | $40–$50 |

---

#### Top Shelf Cultivation — Flower

| Field | Value |
|---|---|
| **Brand** | Top Shelf Cultivation |
| **Notes** | Budget-mid tier; strong value option |

**Variations / SKUs:**

| SKU | Product Name | Strain | Type | Weight | Approx. THC% | Price |
|---|---|---|---|---|---|---|
| `EL-TSC-OG-3.5` | OG Kush | OG Kush | Hybrid | 3.5g | 20–25% | $22–$30 |
| `EL-TSC-BLUE-3.5` | Blue Dream | Blue Dream | Sativa | 3.5g | 19–24% | $22–$30 |
| `EL-TSC-WW-7` | White Widow | White Widow | Hybrid | 7g | 18–23% | $38–$48 |
| `EL-TSC-WW-28` | White Widow | White Widow | Hybrid | 28g | 18–23% | $90–$110 |

---

## Part 4: Pre-Rolls & Infused Pre-Rolls

### Product Type: `pre_roll`

---

#### Jeeter — Pre-Rolls & Infused Pre-Rolls

| Field | Value |
|---|---|
| **Brand** | Jeeter |
| **Product Type** | Pre-Roll / Infused Pre-Roll |

**Variations / SKUs:**

| SKU | Product Name | Strain | Infused | Size | Approx. THC% | Price |
|---|---|---|---|---|---|---|
| `EL-JEET-BBERRY-1G` | Baby Jeeter — Blueberry | Blueberry | No | 5-pack (0.5g ea) | 30–35% | $24–$30 |
| `EL-JEET-WWMELON-1G` | Baby Jeeter — Watermelon | Watermelon Zkittlez | No | 5-pack (0.5g ea) | 30–36% | $24–$30 |
| `EL-JEET-LRJUICE-2G` | Jeeter Juice — Live Resin | Strain Varies | Yes — Live Resin | 1g | 50–65% | $22–$28 |
| `EL-JEET-INFUSED-1G` | Infused Pre-Roll | Strain Varies | Yes — Distillate | 1g | 45–55% | $18–$24 |

---

#### Heavy Hitters — Pre-Rolls

| Field | Value |
|---|---|
| **Brand** | Heavy Hitters |

**Variations / SKUs:**

| SKU | Product Name | Type | Size | Approx. THC% | Price |
|---|---|---|---|---|---|
| `EL-HH-DIAMOND-1G` | Diamond Pre-Roll | Infused — Diamonds | 1g | 55–70% | $22–$28 |
| `EL-HH-DIAMOND-2PK` | Diamond Pre-Roll 2-Pack | Infused — Diamonds | 2 × 0.75g | 55–70% | $30–$38 |

---

#### Space Coyote — Infused Pre-Rolls

| Field | Value |
|---|---|
| **Brand** | Space Coyote |

**Variations / SKUs:**

| SKU | Product Name | Type | Size | Approx. THC% | Price |
|---|---|---|---|---|---|
| `EL-SCOYOTE-INF-1G` | Space Coyote Infused Joint | Infused — Live Hash Rosin | 1g | 40–55% | $18–$25 |
| `EL-SCOYOTE-INF-2PK` | Space Coyote 2-Pack | Infused — Live Hash Rosin | 2 × 0.75g | 40–55% | $28–$36 |

---

#### Lowell Herb Co. — Pre-Rolls

| Field | Value |
|---|---|
| **Brand** | Lowell Herb Co. |

**Variations / SKUs:**

| SKU | Product Name | Type | Size | Approx. THC% | Price |
|---|---|---|---|---|---|
| `EL-LOWL-SATIVA-7PK` | Lowell Smokes — Sativa | Flower Pre-Roll | 7-pack | 18–24% | $28–$36 |
| `EL-LOWL-INDICA-7PK` | Lowell Smokes — Indica | Flower Pre-Roll | 7-pack | 18–24% | $28–$36 |
| `EL-LOWL-HYBRID-7PK` | Lowell Smokes — Hybrid | Flower Pre-Roll | 7-pack | 18–24% | $28–$36 |

---

#### Sluggers — Infused Pre-Rolls

| Field | Value |
|---|---|
| **Brand** | Sluggers |

**Variations / SKUs:**

| SKU | Product Name | Type | Size | Approx. THC% | Price |
|---|---|---|---|---|---|
| `EL-SLUG-HIT-2G` | Slugger Hit | Infused — Liquid Diamonds | 2g | 60–75% | $22–$30 |

---

## Part 5: Vape Pens & Cartridges

### Product Type: `vape_cartridge`

---

#### Stiiizy — Vape Pods

| Field | Value |
|---|---|
| **Brand** | Stiiizy |
| **Compatibility** | Stiiizy proprietary pod system |
| **Promotions** | Buy 0.5g CDT/Live Resin pod → get black battery or 0.5g pre-roll for $2 |

**Variations / SKUs:**

| SKU | Product Name | Oil Type | Size | Strain Type | Approx. THC% | Price |
|---|---|---|---|---|---|---|
| `EL-STIIIZY-CDT-5G-IND` | Stiiizy CDT Pod — Indica | CDT (Cannabis-Derived Terpenes) | 0.5g | Indica | 85–92% | $30–$38 |
| `EL-STIIIZY-CDT-5G-SAT` | Stiiizy CDT Pod — Sativa | CDT | 0.5g | Sativa | 85–92% | $30–$38 |
| `EL-STIIIZY-CDT-5G-HYB` | Stiiizy CDT Pod — Hybrid | CDT | 0.5g | Hybrid | 85–92% | $30–$38 |
| `EL-STIIIZY-CDT-1G-IND` | Stiiizy CDT Pod 1g — Indica | CDT | 1g | Indica | 85–92% | $50–$60 |
| `EL-STIIIZY-CDT-1G-SAT` | Stiiizy CDT Pod 1g — Sativa | CDT | 1g | Sativa | 85–92% | $50–$60 |
| `EL-STIIIZY-LR-5G` | Stiiizy Live Resin Pod 0.5g | Live Resin | 0.5g | Hybrid | 78–88% | $35–$45 |
| `EL-STIIIZY-LR-1G` | Stiiizy Live Resin Pod 1g | Live Resin | 1g | Hybrid | 78–88% | $58–$70 |
| `EL-STIIIZY-BATT-BLK` | Stiiizy Black Battery | Hardware | — | — | — | $20–$25 |
| `EL-STIIIZY-BATT-CLR` | Stiiizy Colored Battery | Hardware | — | — | — | $25–$30 |

---

#### Raw Garden — Vape Cartridges

| Field | Value |
|---|---|
| **Brand** | Raw Garden |
| **Compatibility** | 510-thread universal |
| **Promotions** | Buy 2 × 1g Raw Garden carts → get 1g Raw Garden for $1 |

**Variations / SKUs:**

| SKU | Product Name | Oil Type | Size | Strain Type | Approx. THC% | Price |
|---|---|---|---|---|---|---|
| `EL-RAWG-RF-5G-SAT` | Raw Garden Refined Live Resin 0.5g — Sativa | Refined Live Resin | 0.5g | Sativa | 82–90% | $28–$35 |
| `EL-RAWG-RF-1G-HYB` | Raw Garden Refined Live Resin 1g — Hybrid | Refined Live Resin | 1g | Hybrid | 82–90% | $44–$55 |
| `EL-RAWG-RF-1G-IND` | Raw Garden Refined Live Resin 1g — Indica | Refined Live Resin | 1g | Indica | 82–90% | $44–$55 |
| `EL-RAWG-RF-1G-SAT` | Raw Garden Refined Live Resin 1g — Sativa | Refined Live Resin | 1g | Sativa | 82–90% | $44–$55 |

---

#### Heavy Hitters — Vape Cartridges

| Field | Value |
|---|---|
| **Brand** | Heavy Hitters |
| **Compatibility** | 510-thread universal |
| **Promotions** | Buy a 1g cart → get 4 × HVY 25mg craft beverages for $0.01 each |

**Variations / SKUs:**

| SKU | Product Name | Oil Type | Size | Approx. THC% | Price |
|---|---|---|---|---|---|
| `EL-HH-CART-1G-SAT` | Heavy Hitters Ultra Potent — Sativa | Distillate | 1g | 90–95% | $36–$44 |
| `EL-HH-CART-1G-IND` | Heavy Hitters Ultra Potent — Indica | Distillate | 1g | 90–95% | $36–$44 |
| `EL-HH-CART-1G-HYB` | Heavy Hitters Ultra Potent — Hybrid | Distillate | 1g | 90–95% | $36–$44 |

---

#### Alien Labs / Connected — Vape Cartridges

| Field | Value |
|---|---|
| **Brand** | Alien Labs / Connected Cannabis Co. |
| **Compatibility** | 510-thread universal |
| **Promotions** | 25% off Alien Labs & Connected Vapes |

**Variations / SKUs:**

| SKU | Product Name | Oil Type | Size | Approx. THC% | Price |
|---|---|---|---|---|---|
| `EL-ALIEN-CART-1G` | Alien Labs 1g Cart | Live Resin | 1g | 80–90% | $48–$58 |
| `EL-CONN-CART-1G` | Connected Cannabis 1g Cart | Live Resin | 1g | 80–90% | $48–$58 |

---

## Part 6: Concentrates

### Product Type: `concentrate`

---

#### Raw Garden — Concentrates

| Field | Value |
|---|---|
| **Brand** | Raw Garden |
| **Promotions** | 25% off Raw Garden Vapes & Concentrates (deal day) |

**Variations / SKUs:**

| SKU | Product Name | Form | Size | Approx. THC% | Price |
|---|---|---|---|---|---|
| `EL-RAWG-LIVE-BADDER-1G` | Raw Garden Live Badder | Badder / Budder | 1g | 70–80% | $38–$48 |
| `EL-RAWG-CRUMBLE-1G` | Raw Garden Crumble | Crumble | 1g | 72–82% | $38–$48 |

---

#### Coldfire Extracts — Concentrates

| Field | Value |
|---|---|
| **Brand** | Coldfire Extracts |
| **Notes** | Solventless-focused; premium concentrate brand |

**Variations / SKUs:**

| SKU | Product Name | Form | Size | Approx. THC% | Price |
|---|---|---|---|---|---|
| `EL-CF-ROSIN-1G` | Coldfire Live Rosin | Live Rosin | 1g | 72–82% | $55–$70 |
| `EL-CF-BADDER-1G` | Coldfire Live Badder | Badder | 1g | 75–85% | $50–$65 |

---

#### Emerald Bay Extracts — Concentrates

**Variations / SKUs:**

| SKU | Product Name | Form | Size | Approx. THC% | Price |
|---|---|---|---|---|---|
| `EL-EBE-SHATTER-1G` | Emerald Bay Shatter | Shatter | 1g | 70–82% | $30–$42 |
| `EL-EBE-WAX-1G` | Emerald Bay Wax | Wax | 1g | 68–78% | $28–$38 |

---

#### Lime Cannabis — Concentrates

| Field | Value |
|---|---|
| **Notes** | Featured in customer reviews as a top pick |

**Variations / SKUs:**

| SKU | Product Name | Form | Size | Approx. THC% | Price |
|---|---|---|---|---|---|
| `EL-LIME-CONC-1G` | Lime Live Resin | Live Resin | 1g | 70–82% | $38–$48 |
| `EL-LIME-ROSIN-1G` | Lime Live Rosin | Live Rosin | 1g | 72–84% | $48–$60 |

---

## Part 7: Edibles

### Product Type: `edible`

---

#### Kanha — Gummies

| Field | Value |
|---|---|
| **Brand** | Kanha |
| **Promotions** | Buy any 2 Kanha gummies → get 1 Kanha for $5 (while supplies last) |

**Variations / SKUs:**

| SKU | Product Name | Flavor | THC per piece | Total THC | Pieces | Price |
|---|---|---|---|---|---|---|
| `EL-KANHA-TROPICAL-10PK` | Kanha Tropical Punch — THC | Tropical Punch | 10mg | 100mg | 10 | $18–$24 |
| `EL-KANHA-WATERMELON-10PK` | Kanha Watermelon — THC | Watermelon | 10mg | 100mg | 10 | $18–$24 |
| `EL-KANHA-MANGO-10PK` | Kanha Mango — THC | Mango | 10mg | 100mg | 10 | $18–$24 |
| `EL-KANHA-PEACH-10PK` | Kanha Peach — CBD:THC 1:1 | Peach | 5mg THC / 5mg CBD | 50mg:50mg | 10 | $20–$26 |
| `EL-KANHA-NANO-10PK` | Kanha Nano — Fast-Acting | Mixed Berry | 5mg nano THC | 50mg | 10 | $20–$26 |

---

#### Wyld — Gummies

| Field | Value |
|---|---|
| **Brand** | Wyld |

**Variations / SKUs:**

| SKU | Product Name | Flavor | THC per piece | Total | Pieces | Price |
|---|---|---|---|---|---|---|
| `EL-WYLD-HUCK-10PK` | Wyld Huckleberry — Indica | Huckleberry | 10mg | 100mg | 10 | $22–$28 |
| `EL-WYLD-PEACH-10PK` | Wyld Peach — Hybrid | Peach | 10mg | 100mg | 10 | $22–$28 |
| `EL-WYLD-RASP-10PK` | Wyld Raspberry — Sativa | Raspberry | 10mg | 100mg | 10 | $22–$28 |
| `EL-WYLD-CBC-10PK` | Wyld Pear — CBD+CBG | Pear | 20mg CBD / 5mg CBG | 200mg CBD | 10 | $24–$30 |
| `EL-WYLD-SDOSED-10PK` | Wyld Sour Cherry — Enhanced | Sour Cherry | 10mg | 100mg | 10 | $22–$28 |

---

#### Dr. Norm's — Edibles

| Field | Value |
|---|---|
| **Brand** | Dr. Norm's |
| **Notes** | Chocolate chip cookies, rice crispy treats |

**Variations / SKUs:**

| SKU | Product Name | Form | THC Total | Price |
|---|---|---|---|---|
| `EL-DRNORM-CHOCCHIP-100` | Chocolate Chip Cookie | Cookie | 100mg THC | $16–$22 |
| `EL-DRNORM-RICECRISPY-100` | Rice Krispy Treat | Treat | 100mg THC | $16–$22 |

---

#### Field Trip — Gummies

**Variations / SKUs:**

| SKU | Product Name | Flavor | THC/piece | Total | Price |
|---|---|---|---|---|---|
| `EL-FTIP-HYBRID-10PK` | Field Trip Hybrid Gummies | Mixed Tropical | 10mg | 100mg | $18–$24 |

---

#### Waferz — Edibles

**Variations / SKUs:**

| SKU | Product Name | Form | THC Total | Price |
|---|---|---|---|---|
| `EL-WAFERZ-CHOC-100` | Waferz Chocolate | Chocolate Wafer | 100mg | $14–$20 |

---

## Part 8: Beverages / Drinks

### Product Type: `edible` (Beverage form factor)

---

#### HVY Craft Cannabis Beverages

| Field | Value |
|---|---|
| **Brand** | Heavy Hitters / HVY |
| **Promotions** | Free with purchase of Heavy Hitters 1g cart (4 for $0.01) |

**Variations / SKUs:**

| SKU | Product Name | Flavor | THC per can | Price |
|---|---|---|---|---|
| `EL-HVY-MARG-10MG` | HVY Cannabis Margarita | Margarita | 25mg | $6–$10 |
| `EL-HVY-MULE-10MG` | HVY Cannabis Moscow Mule | Moscow Mule | 25mg | $6–$10 |
| `EL-HVY-TONIC-10MG` | HVY Cannabis Tonic | Tonic | 25mg | $6–$10 |
| `EL-HVY-SELTZER-10MG` | HVY Cannabis Seltzer | Seltzer | 25mg | $6–$10 |

---

#### Puff Punch — Beverages

**Variations / SKUs:**

| SKU | Product Name | Flavor | THC Total | Price |
|---|---|---|---|---|
| `EL-PUFFPUNCH-FRUIT-100` | Puff Punch Fruit Punch | Fruit Punch | 100mg | $12–$18 |

---

## Part 9: Tinctures

### Product Type: `tincture`

---

#### Papa & Barkley — Tinctures

| Field | Value |
|---|---|
| **Brand** | Papa & Barkley |
| **Promotions** | 25% off Papa and Barkley |

**Variations / SKUs:**

| SKU | Product Name | Spectrum | Volume | THC:CBD Ratio | Price |
|---|---|---|---|---|---|
| `EL-PB-RELAX-1:3-30ML` | P&B Releaf Tincture — 1:3 THC:CBD | Whole Plant | 30mL | 1:3 | $40–$50 |
| `EL-PB-RELAX-1:1-30ML` | P&B Releaf Tincture — 1:1 THC:CBD | Whole Plant | 30mL | 1:1 | $40–$50 |
| `EL-PB-SLEEPYTIME-30ML` | P&B CBD Tincture | CBD Dominant | 30mL | 0:3 (CBD Only) | $36–$46 |

---

#### Mary's Medicinal — Tinctures & Capsules

| Field | Value |
|---|---|
| **Brand** | Mary's Medicinal |
| **Promotions** | 25% off Mary's Medicinal |

**Variations / SKUs:**

| SKU | Product Name | Form | Ratio | Volume / Count | Price |
|---|---|---|---|---|---|
| `EL-MARYS-TINCT-1:1-30ML` | Mary's 1:1 Tincture | Tincture | 1:1 THC:CBD | 30mL | $36–$46 |
| `EL-MARYS-CBD-30ML` | Mary's CBD Tincture | Tincture | CBD | 30mL | $32–$42 |
| `EL-MARYS-CAPS-10MG-30CT` | Mary's Capsules — 10mg THC | Capsule | THC | 30ct | $30–$40 |

---

## Part 10: Wellness / Topicals

### Product Type: `topical`

---

#### Papa & Barkley — Topicals

**Variations / SKUs:**

| SKU | Product Name | Form | CBD:THC | Size | Price |
|---|---|---|---|---|---|
| `EL-PB-BALM-1:3` | P&B Releaf Balm 1:3 | Balm | 1:3 THC:CBD | 15mL | $30–$40 |
| `EL-PB-PATCH-THC` | P&B Releaf Patch — THC | Patch | THC Dominant | Single | $12–$16 |
| `EL-PB-PATCH-CBD` | P&B Releaf Patch — CBD | Patch | CBD Dominant | Single | $12–$16 |

---

#### Mary's Medicinal — Topicals

**Variations / SKUs:**

| SKU | Product Name | Form | Type | Size | Price |
|---|---|---|---|---|---|
| `EL-MARYS-PATCH-10MG` | Mary's Medicinal Patch | Patch | THC Transdermal | Single | $12–$16 |
| `EL-MARYS-PENCOMPOUND` | Mary's Compound Pen | Topical Pen | THC+CBD | 1g | $30–$38 |

---

## Part 11: Drupal Commerce Import Instructions

### 11.1 Manual Entry via Admin UI

For each product above, navigate to:

**Commerce → Products → Add product → [Select Product Type]**

Fill in the following fields per product:

```
Title:           [Product Name]
Store:           Elevate Lompoc
Brand:           [Brand Term Reference]
Body/Description: [Pull from brand website or COA]
Status:          Published

--- Variation fields ---
SKU:             [SKU from table above]
Price:           [From live menu — verify before publishing]
THC %:           [From COA or live menu]
CBD %:           [From COA or live menu]
Weight:          [Per variation]
Strain Type:     [Attribute selection]
Form Factor:     [Attribute selection]
```

---

### 11.2 Migrate / Bulk Import via CSV

For bulk import, use the `migrate_plus` and `migrate_tools` modules with a CSV source.

**Install:**

```bash
composer require drupal/migrate_plus drupal/migrate_tools
drush en migrate_plus migrate_tools migrate_source_csv -y
```

**CSV Column Map (Flower example):**

```csv
sku,title,brand,strain_name,strain_type,weight_quantity,thc_pct,cbd_pct,price,store,status,description
EL-CONN-BISCOTTI-3.5,Biscotti,Connected Cannabis Co.,Biscotti,Hybrid,3.5g,30,0.1,50,elevate_lompoc,1,"Premium indoor flower from Connected Cannabis Co."
EL-CONN-RUNTZ-3.5,Runtz,Connected Cannabis Co.,Runtz,Hybrid,3.5g,31,0.1,52,elevate_lompoc,1,"Award-winning hybrid from Connected Cannabis."
EL-GHF-LEMON-3.5,Lemon OG,Glasshouse Farms,Lemon OG,Hybrid,3.5g,22,0.2,35,elevate_lompoc,1,"Sun+Earth certified greenhouse flower from Carpinteria."
```

**Migration YAML (flower_products.migrate.yml):**

```yaml
id: elevate_flower_products
label: 'Import Elevate Lompoc Flower Products'
migration_group: elevate_lompoc
source:
  plugin: csv
  path: 'public://migrations/elevate_flower_menu.csv'
  header_row_count: 1
  ids:
    - sku
  column_names:
    - 0: sku
    - 1: title
    - 2: brand
    - 3: strain_name
    - 4: strain_type
    - 5: weight_quantity
    - 6: thc_pct
    - 7: cbd_pct
    - 8: price
    - 9: store
    - 10: status
    - 11: description
process:
  title: title
  type:
    plugin: default_value
    default_value: flower
  status: status
  body/value: description
  body/format:
    plugin: default_value
    default_value: basic_html
  field_brand:
    plugin: entity_lookup
    source: brand
    entity_type: taxonomy_term
    bundle: brand
    value_key: name
  field_strain_name: strain_name
  'variations/0/sku': sku
  'variations/0/price/number': price
  'variations/0/price/currency_code':
    plugin: default_value
    default_value: USD
  field_thc_pct: thc_pct
  field_cbd_pct: cbd_pct
destination:
  plugin: entity:commerce_product
  default_bundle: flower
```

**Run the migration:**

```bash
drush migrate:import elevate_flower_products
drush migrate:status
```

---

### 11.3 Store Assignment

After importing, ensure all products are associated with the Elevate Lompoc store. You can do this in bulk using a View + VBO (Views Bulk Operations):

1. Install `views_bulk_operations`
2. Create a view of all unpublished/unassigned products
3. Select all → Apply action → "Assign to store: Elevate Lompoc"

Or via Drush:

```bash
# Set store assignment on all products of type 'flower' with no store
drush php:eval "
  \$products = \Drupal::entityQuery('commerce_product')
    ->condition('type', 'flower')
    ->condition('stores', NULL, 'IS NULL')
    ->execute();
  foreach (\$products as \$id) {
    \$product = \Drupal\commerce_product\Entity\Product::load(\$id);
    \$product->stores = ['target_id' => 1]; // 1 = Elevate Lompoc store ID
    \$product->save();
  }
"
```

---

### 11.4 Pricing Configuration for Elevate Lompoc

**Tax Setup — Important:**

Elevate includes excise tax in listed prices. Configure Commerce Tax accordingly:

```
Commerce → Configuration → Tax types → Add tax type
Label: California Sales Tax
Machine name: ca_sales_tax
Display inclusive: No (shown at checkout)
Rate: 9.25% (Santa Barbara County — verify current rate)
```

```
Commerce → Configuration → Tax types → Add tax type
Label: CA Cannabis Excise Tax
Machine name: ca_cannabis_excise
Display inclusive: Yes (already baked into product price)
Rate: 15%
```

---

### 11.5 Promotions / Deals

Set up these standing promotions at **Commerce → Promotions → Add promotion**:

| Promo Name | Type | Value | Conditions | Coupon? |
|---|---|---|---|---|
| Early Bird Special | Percentage discount | 20% off | Order time: 7am–10am | No (auto) |
| Happy Hour | Percentage discount | 20% off | Order time: 3pm–5pm | No (auto) |
| Stiiizy Pod Battery Deal | Fixed price on item | $2 battery with pod | Buy 0.5g pod, add battery | No (BOGO-style) |
| Raw Garden 3-for-1 | Fixed price on 3rd item | $1 on 3rd | Buy 2 Raw Garden 1g carts | No (auto) |
| Kanha Buy 2 Get 1 | Fixed price on 3rd | $5 on 3rd gummy | Buy any 2 Kanha packs | No (auto) |
| 25% Off Alien Labs + Connected Vapes | Percentage | 25% off | Product brand = Alien Labs or Connected, type = Vape | No (auto) |
| 25% Off Papa & Barkley | Percentage | 25% off | Product brand = Papa & Barkley | No (day-specific) |
| 25% Off Mary's Medicinal | Percentage | 25% off | Product brand = Mary's Medicinal | No (day-specific) |
| HVY $0.01 Bundle | Fixed price | $0.01 per HVY can | Buy 1g Heavy Hitters cart | No (bundle) |

---

## Part 12: Menu Category Summary

| Category | Brands Confirmed | Approx. SKU Count |
|---|---|---|
| Flower | Connected, Alien Labs, Glasshouse, Mr. Zips, Floracal, Top Shelf, Lime, Flavorade, Lax, Paradiso, West Coast Treez, Whoa, Almora, Gramlin | 40–60 |
| Pre-Rolls | Jeeter, Heavy Hitters, Space Coyote, Lowell, Sluggers, Pinkies, High 90's, Firecracker | 20–35 |
| Infused Pre-Rolls | Jeeter Juice, Space Coyote, Sluggers, Lowell | 10–20 |
| Vape Pens | Stiiizy, Raw Garden, Heavy Hitters, Alien Labs, Connected, Buddies, Vuze, Wave Rider, Platinum Vape | 30–50 |
| Concentrates | Raw Garden, Coldfire, Emerald Bay, Lime, Holy Water, Emerald Sky, Bear Labs | 15–30 |
| Edibles | Kanha, Wyld, Dr. Norm's, Field Trip, Waferz, Smoove, Happy Fruit | 20–35 |
| Beverages | HVY, Puff Punch | 5–10 |
| Tinctures | Papa & Barkley, Mary's Medicinal, Kwik Ease | 8–15 |
| Topicals | Papa & Barkley, Mary's Medicinal | 5–10 |
| Accessories | Stiiizy batteries, misc. | 5–10 |
| **TOTAL ESTIMATED** | **50+ brands** | **~160–275 active SKUs** |

---

## Part 13: Recommended Modules for Menu Management

| Module | Purpose |
|---|---|
| `commerce_product_limits` | Set per-customer purchase limits (CA compliance: 1 oz THC flower/day) |
| `commerce_stock` | Manage per-SKU inventory levels |
| `commerce_price_rule` | Automate happy hour and early bird pricing by time of day |
| `flag` | Allow staff to flag low-stock items for reorder |
| `search_api` + `facets` | Faceted product browsing by brand, strain type, price, THC% |
| `commerce_migrate` | Migrate products from existing POS/Weedmaps |
| `jsonapi` | Expose menu as API for mobile apps or kiosk systems |

---

*Last updated: February 2026*
*Menu data sourced from: Weedmaps (jerrysdeals.com brand registry), Elevate Lompoc public listings, and promotional deal pages.*
*⚠️ Menu inventory rotates daily. All prices and availability must be verified against the live menu at elevatelompoc.com/menu before publishing to production.*

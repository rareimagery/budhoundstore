# Drupal Commerce: Staff Roles & Personnel Management
## Lompoc Cannabis Dispensaries — Owner, Manager, Budtender & Driver

A complete guide for configuring user roles, profiles, and store-level staff assignments across all 7 Lompoc dispensary locations in Drupal Commerce.

---

## Overview

Each dispensary store requires four staff role types:

| Role | Machine Name | Scope |
|---|---|---|
| Owner | `dispensary_owner` | Store-wide — full administrative access |
| Manager | `dispensary_manager` | Store-level — operations, inventory, reports |
| Budtender | `budtender` | POS, product knowledge, customer service |
| Delivery Driver | `delivery_driver` | Order fulfillment, delivery management |

---

## Part 1: Drupal User Roles Setup

### 1.1 Create Custom Roles

Navigate to: **People → Roles → Add role**

Create each of the following roles:

---

#### Role: Dispensary Owner

| Setting | Value |
|---|---|
| **Label** | Dispensary Owner |
| **Machine name** | `dispensary_owner` |

**Permissions to assign:**

```
✅ Administer commerce_store entities
✅ Administer products
✅ Administer orders
✅ View all orders
✅ Manage own store
✅ Administer users (store-scoped)
✅ Access administration pages
✅ View reports
✅ Administer promotions and coupons
✅ Administer tax rates
✅ Manage shipping methods
✅ Administer store settings
✅ View commerce reports
```

---

#### Role: Dispensary Manager

| Setting | Value |
|---|---|
| **Label** | Dispensary Manager |
| **Machine name** | `dispensary_manager` |

**Permissions to assign:**

```
✅ View all orders
✅ Update any order
✅ Administer products (own store)
✅ Manage product inventory
✅ View store reports
✅ Manage promotions (own store)
✅ Administer shipping
✅ Create and edit users (budtender, driver roles only)
✅ View customer profiles
✅ Access administration pages
```

---

#### Role: Budtender

| Setting | Value |
|---|---|
| **Label** | Budtender |
| **Machine name** | `budtender` |

**Permissions to assign:**

```
✅ View products and product catalog
✅ Create and update orders (POS)
✅ View customer profiles
✅ Apply discounts and promotions
✅ View own store inventory
✅ Access POS / order management interface
✅ View compliance information (COA PDFs, potency)
```

---

#### Role: Delivery Driver

| Setting | Value |
|---|---|
| **Label** | Delivery Driver |
| **Machine name** | `delivery_driver` |

**Permissions to assign:**

```
✅ View assigned delivery orders
✅ Update order status (Out for Delivery, Delivered, Failed Delivery)
✅ View customer delivery address
✅ View order items (for verification)
✅ Access driver dashboard
❌ Cannot modify prices, products, or inventory
❌ Cannot view store financials
```

---

## Part 2: Staff Profile Fields

### 2.1 Extend the User Profile

Navigate to: **Configuration → People → Account settings → Manage fields**

Add the following fields to the user entity:

| Field Label | Machine Name | Field Type | Notes |
|---|---|---|---|
| Store Assignment | `field_store_assignment` | Entity Reference (Commerce Store) | Which dispensary this user belongs to |
| Staff Role Title | `field_staff_title` | Text (plain) | e.g., "Head Budtender", "Assistant Manager" |
| Employee ID | `field_employee_id` | Text (plain) | Internal HR identifier |
| Date Hired | `field_date_hired` | Date | |
| Cannabis Handler Permit | `field_cannabis_permit` | Text (plain) | State-required permit number |
| Permit Expiration Date | `field_permit_expiry` | Date | Alert when approaching expiration |
| Phone (Work) | `field_phone_work` | Telephone | |
| Emergency Contact Name | `field_emergency_contact` | Text (plain) | |
| Emergency Contact Phone | `field_emergency_phone` | Telephone | |
| Profile Photo | `field_staff_photo` | Image | |
| Notes / Bio | `field_staff_notes` | Text (long) | Internal notes or public-facing bio |
| Active Status | `field_staff_active` | Boolean | Enable/disable without deleting account |
| Driver License Number | `field_driver_license` | Text (plain) | Drivers only — for compliance |
| Vehicle Info | `field_vehicle_info` | Text (plain) | Drivers only — make, model, plate |
| Delivery Zone Assignment | `field_delivery_zone` | Entity Reference (Taxonomy) | Drivers only |

---

### 2.2 Driver-Specific Fields

For delivery driver profiles, also add:

| Field Label | Machine Name | Field Type |
|---|---|---|
| Vehicle Make/Model | `field_vehicle_make_model` | Text (plain) |
| License Plate | `field_license_plate` | Text (plain) |
| Max Delivery Radius (miles) | `field_max_delivery_radius` | Integer |
| Current Delivery Status | `field_driver_status` | List (text): Available, On Route, Off Duty |
| GPS Tracking Enabled | `field_gps_enabled` | Boolean |
| Insured Vehicle (Y/N) | `field_vehicle_insured` | Boolean |

---

## Part 3: Store Assignments — All 7 Lompoc Dispensaries

Below is the complete staff structure template for each store. Each store gets one Owner, one Manager, at least two Budtenders, and (where delivery is offered) at least one Driver.

---

### Store 1: Elevate Lompoc

**Store Details**
- Address: 118 S H St, Lompoc, CA 93436
- Phone: (805) 819-0077
- Website: elevatelompoc.com
- Hours: Daily 7:00 AM – 10:00 PM
- Delivery: Yes (delivery available)
- Commerce Store Machine Name: `elevate_lompoc`

---

#### 👤 Owner — Elevate Lompoc

| Field | Value |
|---|---|
| **Display Name** | [Owner Name] |
| **Username** | `elevate_owner` |
| **Email** | owner@elevatelompoc.com |
| **Drupal Role** | `dispensary_owner` |
| **Store Assignment** | Elevate Lompoc |
| **Staff Title** | Owner / Operator |
| **Permissions** | Full store admin |

---

#### 👤 Manager — Elevate Lompoc

| Field | Value |
|---|---|
| **Display Name** | [Manager Name] |
| **Username** | `elevate_manager` |
| **Email** | manager@elevatelompoc.com |
| **Drupal Role** | `dispensary_manager` |
| **Store Assignment** | Elevate Lompoc |
| **Staff Title** | Store Manager |
| **Permissions** | Store-scoped operations, inventory, staff management |

---

#### 👤 Budtender 1 — Elevate Lompoc

| Field | Value |
|---|---|
| **Display Name** | Raul (featured in reviews) |
| **Username** | `elevate_budtender_1` |
| **Email** | budtender1@elevatelompoc.com |
| **Drupal Role** | `budtender` |
| **Store Assignment** | Elevate Lompoc |
| **Staff Title** | Senior Budtender |
| **Permissions** | POS, order creation, promotions |

---

#### 👤 Budtender 2 — Elevate Lompoc

| Field | Value |
|---|---|
| **Display Name** | [Budtender Name] |
| **Username** | `elevate_budtender_2` |
| **Email** | budtender2@elevatelompoc.com |
| **Drupal Role** | `budtender` |
| **Store Assignment** | Elevate Lompoc |
| **Staff Title** | Budtender |
| **Permissions** | POS, order creation, promotions |

---

#### 🚗 Delivery Driver — Elevate Lompoc

| Field | Value |
|---|---|
| **Display Name** | Luis (featured in reviews) |
| **Username** | `elevate_driver_1` |
| **Email** | driver1@elevatelompoc.com |
| **Drupal Role** | `delivery_driver` |
| **Store Assignment** | Elevate Lompoc |
| **Staff Title** | Delivery Driver |
| **Delivery Zone** | Lompoc, Vandenberg Village, Orcutt, Santa Maria, Solvang, Buellton, Nipomo |
| **Permissions** | Order status updates, delivery view only |

---

### Store 2: One Plant Lompoc

**Store Details**
- Address: 119 N A St, Lompoc, CA 93436
- Phone: (805) 741-7419
- Website: oneplant.life
- Hours: Daily 8:00 AM – 10:00 PM
- Delivery: Yes
- Commerce Store Machine Name: `one_plant_lompoc`

---

#### 👤 Owner — One Plant Lompoc

| Field | Value |
|---|---|
| **Display Name** | [Owner Name] |
| **Username** | `oneplant_owner` |
| **Email** | owner@oneplant.life |
| **Drupal Role** | `dispensary_owner` |
| **Store Assignment** | One Plant Lompoc |
| **Staff Title** | Owner / Regional Operator |
| **Permissions** | Full store admin |

---

#### 👤 Manager — One Plant Lompoc

| Field | Value |
|---|---|
| **Display Name** | Mike (referenced in reviews) |
| **Username** | `oneplant_manager` |
| **Email** | manager.lompoc@oneplant.life |
| **Drupal Role** | `dispensary_manager` |
| **Store Assignment** | One Plant Lompoc |
| **Staff Title** | Store Manager |
| **Permissions** | Store-scoped operations |

---

#### 👤 Budtender 1 — One Plant Lompoc

| Field | Value |
|---|---|
| **Display Name** | Noe (featured in reviews) |
| **Username** | `oneplant_budtender_1` |
| **Email** | budtender1.lompoc@oneplant.life |
| **Drupal Role** | `budtender` |
| **Store Assignment** | One Plant Lompoc |
| **Staff Title** | Senior Budtender |

---

#### 👤 Budtender 2 — One Plant Lompoc

| Field | Value |
|---|---|
| **Display Name** | Edward (featured in reviews) |
| **Username** | `oneplant_budtender_2` |
| **Email** | budtender2.lompoc@oneplant.life |
| **Drupal Role** | `budtender` |
| **Store Assignment** | One Plant Lompoc |
| **Staff Title** | Budtender |

---

#### 🚗 Delivery Driver — One Plant Lompoc

| Field | Value |
|---|---|
| **Display Name** | [Driver Name] |
| **Username** | `oneplant_driver_1` |
| **Email** | driver1.lompoc@oneplant.life |
| **Drupal Role** | `delivery_driver` |
| **Store Assignment** | One Plant Lompoc |
| **Staff Title** | Delivery Driver |
| **Delivery Zone** | Lompoc and surrounding Santa Barbara County |

---

### Store 3: Royal Healing Emporium

**Store Details**
- Address: 721 W Central Ave, Suite D, Lompoc, CA 93436
- Phone: (805) 743-4848
- Website: royalhealingemporium.org
- Hours: Daily 7:00 AM – 10:00 PM
- Delivery: Yes
- CA License: C10-0000208-LIC
- Commerce Store Machine Name: `royal_healing_lompoc`

---

#### 👤 Owner — Royal Healing Emporium

| Field | Value |
|---|---|
| **Display Name** | [Owner Name] |
| **Username** | `royalhealing_owner` |
| **Email** | owner@royalhealingemporium.org |
| **Drupal Role** | `dispensary_owner` |
| **Store Assignment** | Royal Healing Emporium |
| **Staff Title** | Owner / Operator |
| **Permissions** | Full store admin |

---

#### 👤 Manager — Royal Healing Emporium

| Field | Value |
|---|---|
| **Display Name** | [Manager Name] |
| **Username** | `royalhealing_manager` |
| **Email** | manager@royalhealingemporium.org |
| **Drupal Role** | `dispensary_manager` |
| **Store Assignment** | Royal Healing Emporium |
| **Staff Title** | Store Manager |

---

#### 👤 Budtender 1 — Royal Healing Emporium

| Field | Value |
|---|---|
| **Display Name** | Krystal (featured in reviews) |
| **Username** | `royalhealing_budtender_1` |
| **Email** | budtender1@royalhealingemporium.org |
| **Drupal Role** | `budtender` |
| **Store Assignment** | Royal Healing Emporium |
| **Staff Title** | Senior Budtender |

---

#### 👤 Budtender 2 — Royal Healing Emporium

| Field | Value |
|---|---|
| **Display Name** | Chris (featured in reviews) |
| **Username** | `royalhealing_budtender_2` |
| **Email** | budtender2@royalhealingemporium.org |
| **Drupal Role** | `budtender` |
| **Store Assignment** | Royal Healing Emporium |
| **Staff Title** | Budtender |

---

#### 🚗 Delivery Driver — Royal Healing Emporium

| Field | Value |
|---|---|
| **Display Name** | Rusty (featured in reviews) |
| **Username** | `royalhealing_driver_1` |
| **Email** | driver1@royalhealingemporium.org |
| **Drupal Role** | `delivery_driver` |
| **Store Assignment** | Royal Healing Emporium |
| **Staff Title** | Delivery Driver |
| **Delivery Zone** | Lompoc and surrounding west-side areas |

---

### Store 4: The Roots Dispensary

**Store Details**
- Address: 805 W Laurel Ave, Lompoc, CA 93436
- Phone: (805) 291-3565
- Website: visittrd805.com
- Hours: Mon–Sat 9:00 AM – 9:00 PM / Sun 9:00 AM – 6:00 PM
- Delivery: Yes (no minimum order)
- CA License: C10-0000335-LIC
- Commerce Store Machine Name: `roots_dispensary_lompoc`

---

#### 👤 Owner — The Roots Dispensary

| Field | Value |
|---|---|
| **Display Name** | Victor S. / Luis C. (co-founders) |
| **Username** | `roots_owner` |
| **Email** | owner@visittrd805.com |
| **Drupal Role** | `dispensary_owner` |
| **Store Assignment** | The Roots Dispensary |
| **Staff Title** | Owner / Co-Founder |
| **Permissions** | Full store admin |

---

#### 👤 Manager — The Roots Dispensary

| Field | Value |
|---|---|
| **Display Name** | Marcus T. (referenced in BBB listing) |
| **Username** | `roots_manager` |
| **Email** | manager@visittrd805.com |
| **Drupal Role** | `dispensary_manager` |
| **Store Assignment** | The Roots Dispensary |
| **Staff Title** | Store Manager |

---

#### 👤 Budtender 1 — The Roots Dispensary

| Field | Value |
|---|---|
| **Display Name** | Sarah (featured in reviews) |
| **Username** | `roots_budtender_1` |
| **Email** | budtender1@visittrd805.com |
| **Drupal Role** | `budtender` |
| **Store Assignment** | The Roots Dispensary |
| **Staff Title** | Senior Budtender |

---

#### 👤 Budtender 2 — The Roots Dispensary

| Field | Value |
|---|---|
| **Display Name** | Adrian (featured in reviews) |
| **Username** | `roots_budtender_2` |
| **Email** | budtender2@visittrd805.com |
| **Drupal Role** | `budtender` |
| **Store Assignment** | The Roots Dispensary |
| **Staff Title** | Budtender |

---

#### 🚗 Delivery Driver — The Roots Dispensary

| Field | Value |
|---|---|
| **Display Name** | [Driver Name] |
| **Username** | `roots_driver_1` |
| **Email** | driver1@visittrd805.com |
| **Drupal Role** | `delivery_driver` |
| **Store Assignment** | The Roots Dispensary |
| **Staff Title** | Delivery Driver |
| **Delivery Zone** | Lompoc, Santa Maria, Santa Ynez, Buellton, Orcutt, Los Alamos, Los Olivos, Solvang |

---

### Store 5: Bleu Diamond Delivery

**Store Details**
- Address: 1129 N H St, Lompoc, CA 93436
- Phone: (805) 310-1078
- Website: bleudiamondco.com
- Hours: Daily 8:00 AM – 9:00 PM
- Delivery: Yes (primary service model)
- Commerce Store Machine Name: `bleu_diamond_lompoc`

---

#### 👤 Owner — Bleu Diamond Delivery

| Field | Value |
|---|---|
| **Display Name** | [Owner Name] |
| **Username** | `bleudiammond_owner` |
| **Email** | owner@bleudiamondco.com |
| **Drupal Role** | `dispensary_owner` |
| **Store Assignment** | Bleu Diamond Delivery |
| **Staff Title** | Owner / Operator |
| **Permissions** | Full store admin |

---

#### 👤 Manager — Bleu Diamond Delivery

| Field | Value |
|---|---|
| **Display Name** | [Manager Name] |
| **Username** | `bleudiammond_manager` |
| **Email** | manager@bleudiamondco.com |
| **Drupal Role** | `dispensary_manager` |
| **Store Assignment** | Bleu Diamond Delivery |
| **Staff Title** | Operations Manager |

---

#### 👤 Budtender 1 — Bleu Diamond Delivery

| Field | Value |
|---|---|
| **Display Name** | [Budtender Name] |
| **Username** | `bleudiammond_budtender_1` |
| **Email** | budtender1@bleudiamondco.com |
| **Drupal Role** | `budtender` |
| **Store Assignment** | Bleu Diamond Delivery |
| **Staff Title** | Budtender / Order Specialist |
| **Notes** | At Bleu Diamond, budtenders primarily handle phone/text order intake and product consultation |

---

#### 👤 Budtender 2 — Bleu Diamond Delivery

| Field | Value |
|---|---|
| **Display Name** | [Budtender Name] |
| **Username** | `bleudiammond_budtender_2` |
| **Email** | budtender2@bleudiamondco.com |
| **Drupal Role** | `budtender` |
| **Store Assignment** | Bleu Diamond Delivery |
| **Staff Title** | Budtender / Order Specialist |

---

#### 🚗 Delivery Driver 1 — Bleu Diamond Delivery

| Field | Value |
|---|---|
| **Display Name** | Manuel (featured in reviews) |
| **Username** | `bleudiammond_driver_1` |
| **Email** | driver1@bleudiamondco.com |
| **Drupal Role** | `delivery_driver` |
| **Store Assignment** | Bleu Diamond Delivery |
| **Staff Title** | Lead Delivery Driver |
| **Delivery Zone** | Lompoc and surrounding areas |

---

#### 🚗 Delivery Driver 2 — Bleu Diamond Delivery

| Field | Value |
|---|---|
| **Display Name** | [Driver Name] |
| **Username** | `bleudiammond_driver_2` |
| **Email** | driver2@bleudiamondco.com |
| **Drupal Role** | `delivery_driver` |
| **Store Assignment** | Bleu Diamond Delivery |
| **Staff Title** | Delivery Driver |
| **Notes** | Bleu Diamond is delivery-first — 2 drivers recommended for coverage |

---

### Store 6: MJ Direct

**Store Details**
- Address: 715 E Ocean Ave, Lompoc, CA 93436
- Phone: (805) 430-8923
- Website: mjdirect.com
- Hours: Daily 9:00 AM – 9:00 PM
- Delivery: No (in-store only)
- Commerce Store Machine Name: `mj_direct_lompoc`

---

#### 👤 Owner — MJ Direct

| Field | Value |
|---|---|
| **Display Name** | [Owner Name] |
| **Username** | `mjdirect_owner` |
| **Email** | owner@mjdirect.com |
| **Drupal Role** | `dispensary_owner` |
| **Store Assignment** | MJ Direct |
| **Staff Title** | Owner / Operator |
| **Permissions** | Full store admin |

---

#### 👤 Manager — MJ Direct

| Field | Value |
|---|---|
| **Display Name** | [Manager Name] |
| **Username** | `mjdirect_manager` |
| **Email** | manager@mjdirect.com |
| **Drupal Role** | `dispensary_manager` |
| **Store Assignment** | MJ Direct |
| **Staff Title** | Store Manager |

---

#### 👤 Budtender 1 — MJ Direct

| Field | Value |
|---|---|
| **Display Name** | [Budtender Name] |
| **Username** | `mjdirect_budtender_1` |
| **Email** | budtender1@mjdirect.com |
| **Drupal Role** | `budtender` |
| **Store Assignment** | MJ Direct |
| **Staff Title** | Senior Budtender |

---

#### 👤 Budtender 2 — MJ Direct

| Field | Value |
|---|---|
| **Display Name** | [Budtender Name] |
| **Username** | `mjdirect_budtender_2` |
| **Email** | budtender2@mjdirect.com |
| **Drupal Role** | `budtender` |
| **Store Assignment** | MJ Direct |
| **Staff Title** | Budtender |

---

#### 🚗 Delivery Driver — MJ Direct

| Field | Value |
|---|---|
| **Display Name** | N/A |
| **Username** | — |
| **Drupal Role** | — |
| **Notes** | MJ Direct does not currently offer delivery. No driver account needed. If delivery is added in the future, create `mjdirect_driver_1` with the `delivery_driver` role. |

---

### Store 7: Leaf Dispensary

**Store Details**
- Address: 423 W Ocean Ave, Lompoc, CA 93436
- Phone: (805) 743-4771
- Website: leaflompoc.com
- Hours: Daily 7:00 AM – 8:00 PM
- Delivery: No (in-store only)
- CA License: C10-0000277-LIC
- Commerce Store Machine Name: `leaf_dispensary_lompoc`

---

#### 👤 Owner — Leaf Dispensary

| Field | Value |
|---|---|
| **Display Name** | David MacFarlane (licensed operator) |
| **Username** | `leaf_owner` |
| **Email** | owner@leaflompoc.com |
| **Drupal Role** | `dispensary_owner` |
| **Store Assignment** | Leaf Dispensary |
| **Staff Title** | Owner / Licensed Operator |
| **Permissions** | Full store admin |

---

#### 👤 Manager — Leaf Dispensary

| Field | Value |
|---|---|
| **Display Name** | [Manager Name] |
| **Username** | `leaf_manager` |
| **Email** | manager@leaflompoc.com |
| **Drupal Role** | `dispensary_manager` |
| **Store Assignment** | Leaf Dispensary |
| **Staff Title** | Store Manager |

---

#### 👤 Budtender 1 — Leaf Dispensary

| Field | Value |
|---|---|
| **Display Name** | Andrew (featured in reviews) |
| **Username** | `leaf_budtender_1` |
| **Email** | budtender1@leaflompoc.com |
| **Drupal Role** | `budtender` |
| **Store Assignment** | Leaf Dispensary |
| **Staff Title** | Senior Budtender |

---

#### 👤 Budtender 2 — Leaf Dispensary

| Field | Value |
|---|---|
| **Display Name** | [Budtender Name] |
| **Username** | `leaf_budtender_2` |
| **Email** | budtender2@leaflompoc.com |
| **Drupal Role** | `budtender` |
| **Store Assignment** | Leaf Dispensary |
| **Staff Title** | Budtender |

---

#### 🚗 Delivery Driver — Leaf Dispensary

| Field | Value |
|---|---|
| **Display Name** | N/A |
| **Username** | — |
| **Drupal Role** | — |
| **Notes** | Leaf does not currently offer delivery. No driver account needed. Create `leaf_driver_1` with `delivery_driver` role if delivery is introduced. |

---

## Part 4: Complete Username Reference

| Store | Role | Username |
|---|---|---|
| Elevate Lompoc | Owner | `elevate_owner` |
| Elevate Lompoc | Manager | `elevate_manager` |
| Elevate Lompoc | Budtender 1 | `elevate_budtender_1` |
| Elevate Lompoc | Budtender 2 | `elevate_budtender_2` |
| Elevate Lompoc | Driver | `elevate_driver_1` |
| One Plant Lompoc | Owner | `oneplant_owner` |
| One Plant Lompoc | Manager | `oneplant_manager` |
| One Plant Lompoc | Budtender 1 | `oneplant_budtender_1` |
| One Plant Lompoc | Budtender 2 | `oneplant_budtender_2` |
| One Plant Lompoc | Driver | `oneplant_driver_1` |
| Royal Healing Emporium | Owner | `royalhealing_owner` |
| Royal Healing Emporium | Manager | `royalhealing_manager` |
| Royal Healing Emporium | Budtender 1 | `royalhealing_budtender_1` |
| Royal Healing Emporium | Budtender 2 | `royalhealing_budtender_2` |
| Royal Healing Emporium | Driver | `royalhealing_driver_1` |
| The Roots Dispensary | Owner | `roots_owner` |
| The Roots Dispensary | Manager | `roots_manager` |
| The Roots Dispensary | Budtender 1 | `roots_budtender_1` |
| The Roots Dispensary | Budtender 2 | `roots_budtender_2` |
| The Roots Dispensary | Driver | `roots_driver_1` |
| Bleu Diamond Delivery | Owner | `bleudiammond_owner` |
| Bleu Diamond Delivery | Manager | `bleudiammond_manager` |
| Bleu Diamond Delivery | Budtender 1 | `bleudiammond_budtender_1` |
| Bleu Diamond Delivery | Budtender 2 | `bleudiammond_budtender_2` |
| Bleu Diamond Delivery | Driver 1 | `bleudiammond_driver_1` |
| Bleu Diamond Delivery | Driver 2 | `bleudiammond_driver_2` |
| MJ Direct | Owner | `mjdirect_owner` |
| MJ Direct | Manager | `mjdirect_manager` |
| MJ Direct | Budtender 1 | `mjdirect_budtender_1` |
| MJ Direct | Budtender 2 | `mjdirect_budtender_2` |
| Leaf Dispensary | Owner | `leaf_owner` |
| Leaf Dispensary | Manager | `leaf_manager` |
| Leaf Dispensary | Budtender 1 | `leaf_budtender_1` |
| Leaf Dispensary | Budtender 2 | `leaf_budtender_2` |

**Total accounts to create: 34**
*(32 active + 2 driver placeholders for MJ Direct & Leaf if delivery is added)*

---

## Part 5: Drush — Bulk User Creation Commands

Use these Drush commands to script bulk user account creation. Replace bracketed values before running.

```bash
# -----------------------------------------------
# ELEVATE LOMPOC
# -----------------------------------------------
drush user:create elevate_owner --mail="owner@elevatelompoc.com" --password="TempPass2026!"
drush user:role:add dispensary_owner elevate_owner

drush user:create elevate_manager --mail="manager@elevatelompoc.com" --password="TempPass2026!"
drush user:role:add dispensary_manager elevate_manager

drush user:create elevate_budtender_1 --mail="budtender1@elevatelompoc.com" --password="TempPass2026!"
drush user:role:add budtender elevate_budtender_1

drush user:create elevate_budtender_2 --mail="budtender2@elevatelompoc.com" --password="TempPass2026!"
drush user:role:add budtender elevate_budtender_2

drush user:create elevate_driver_1 --mail="driver1@elevatelompoc.com" --password="TempPass2026!"
drush user:role:add delivery_driver elevate_driver_1

# -----------------------------------------------
# ONE PLANT LOMPOC
# -----------------------------------------------
drush user:create oneplant_owner --mail="owner@oneplant.life" --password="TempPass2026!"
drush user:role:add dispensary_owner oneplant_owner

drush user:create oneplant_manager --mail="manager.lompoc@oneplant.life" --password="TempPass2026!"
drush user:role:add dispensary_manager oneplant_manager

drush user:create oneplant_budtender_1 --mail="budtender1.lompoc@oneplant.life" --password="TempPass2026!"
drush user:role:add budtender oneplant_budtender_1

drush user:create oneplant_budtender_2 --mail="budtender2.lompoc@oneplant.life" --password="TempPass2026!"
drush user:role:add budtender oneplant_budtender_2

drush user:create oneplant_driver_1 --mail="driver1.lompoc@oneplant.life" --password="TempPass2026!"
drush user:role:add delivery_driver oneplant_driver_1

# -----------------------------------------------
# ROYAL HEALING EMPORIUM
# -----------------------------------------------
drush user:create royalhealing_owner --mail="owner@royalhealingemporium.org" --password="TempPass2026!"
drush user:role:add dispensary_owner royalhealing_owner

drush user:create royalhealing_manager --mail="manager@royalhealingemporium.org" --password="TempPass2026!"
drush user:role:add dispensary_manager royalhealing_manager

drush user:create royalhealing_budtender_1 --mail="budtender1@royalhealingemporium.org" --password="TempPass2026!"
drush user:role:add budtender royalhealing_budtender_1

drush user:create royalhealing_budtender_2 --mail="budtender2@royalhealingemporium.org" --password="TempPass2026!"
drush user:role:add budtender royalhealing_budtender_2

drush user:create royalhealing_driver_1 --mail="driver1@royalhealingemporium.org" --password="TempPass2026!"
drush user:role:add delivery_driver royalhealing_driver_1

# -----------------------------------------------
# THE ROOTS DISPENSARY
# -----------------------------------------------
drush user:create roots_owner --mail="owner@visittrd805.com" --password="TempPass2026!"
drush user:role:add dispensary_owner roots_owner

drush user:create roots_manager --mail="manager@visittrd805.com" --password="TempPass2026!"
drush user:role:add dispensary_manager roots_manager

drush user:create roots_budtender_1 --mail="budtender1@visittrd805.com" --password="TempPass2026!"
drush user:role:add budtender roots_budtender_1

drush user:create roots_budtender_2 --mail="budtender2@visittrd805.com" --password="TempPass2026!"
drush user:role:add budtender roots_budtender_2

drush user:create roots_driver_1 --mail="driver1@visittrd805.com" --password="TempPass2026!"
drush user:role:add delivery_driver roots_driver_1

# -----------------------------------------------
# BLEU DIAMOND DELIVERY
# -----------------------------------------------
drush user:create bleudiammond_owner --mail="owner@bleudiamondco.com" --password="TempPass2026!"
drush user:role:add dispensary_owner bleudiammond_owner

drush user:create bleudiammond_manager --mail="manager@bleudiamondco.com" --password="TempPass2026!"
drush user:role:add dispensary_manager bleudiammond_manager

drush user:create bleudiammond_budtender_1 --mail="budtender1@bleudiamondco.com" --password="TempPass2026!"
drush user:role:add budtender bleudiammond_budtender_1

drush user:create bleudiammond_budtender_2 --mail="budtender2@bleudiamondco.com" --password="TempPass2026!"
drush user:role:add budtender bleudiammond_budtender_2

drush user:create bleudiammond_driver_1 --mail="driver1@bleudiamondco.com" --password="TempPass2026!"
drush user:role:add delivery_driver bleudiammond_driver_1

drush user:create bleudiammond_driver_2 --mail="driver2@bleudiamondco.com" --password="TempPass2026!"
drush user:role:add delivery_driver bleudiammond_driver_2

# -----------------------------------------------
# MJ DIRECT
# -----------------------------------------------
drush user:create mjdirect_owner --mail="owner@mjdirect.com" --password="TempPass2026!"
drush user:role:add dispensary_owner mjdirect_owner

drush user:create mjdirect_manager --mail="manager@mjdirect.com" --password="TempPass2026!"
drush user:role:add dispensary_manager mjdirect_manager

drush user:create mjdirect_budtender_1 --mail="budtender1@mjdirect.com" --password="TempPass2026!"
drush user:role:add budtender mjdirect_budtender_1

drush user:create mjdirect_budtender_2 --mail="budtender2@mjdirect.com" --password="TempPass2026!"
drush user:role:add budtender mjdirect_budtender_2

# -----------------------------------------------
# LEAF DISPENSARY
# -----------------------------------------------
drush user:create leaf_owner --mail="owner@leaflompoc.com" --password="TempPass2026!"
drush user:role:add dispensary_owner leaf_owner

drush user:create leaf_manager --mail="manager@leaflompoc.com" --password="TempPass2026!"
drush user:role:add dispensary_manager leaf_manager

drush user:create leaf_budtender_1 --mail="budtender1@leaflompoc.com" --password="TempPass2026!"
drush user:role:add budtender leaf_budtender_1

drush user:create leaf_budtender_2 --mail="budtender2@leaflompoc.com" --password="TempPass2026!"
drush user:role:add budtender leaf_budtender_2
```

> ⚠️ **Security Note:** Replace all `TempPass2026!` placeholders with strong, unique passwords before running. Force a password reset on first login using: `drush user:password [username] --new-password-by-email`

---

## Part 6: Recommended Supporting Modules

| Module | Purpose |
|---|---|
| `commerce_store_manager` | Scopes admin access per store per user |
| `field_permissions` | Restrict sensitive fields (driver license, permit #) to role-appropriate views |
| `user_expire` | Auto-expire accounts when permits lapse |
| `content_access` | Fine-grained product/order visibility per role |
| `views` (core) | Build a Staff Directory view per store |
| `profile` | Extended profile support for budtender/driver bios |
| `scheduler` | Schedule user accounts to auto-activate/deactivate |
| `masquerade` | Allow managers to test experience as budtender/driver |

---

## Part 7: Staff Directory View (Optional)

Create a Views page at `/admin/staff` filtered by store and role:

```
View: Staff Directory
Path: /admin/staff
Display: Table
Fields:
  - Profile Photo
  - Display Name
  - Staff Title (field_staff_title)
  - Store Assignment (field_store_assignment)
  - Role
  - Phone (Work)
  - Permit Expiry (field_permit_expiry)
  - Active Status (field_staff_active)
Filters:
  - Store (exposed)
  - Role (exposed)
  - Active Status = TRUE
Sort:
  - Store ASC, Role ASC, Name ASC
Access: Roles = dispensary_owner, dispensary_manager, administrator
```

---

## Part 8: Config Export

After all users and roles are created, export your configuration:

```bash
drush config:export -y
drush cr
```

This preserves all role definitions, permissions, and field configurations across environments.

---

*Last updated: February 2026 | Drupal 10+ | Drupal Commerce 2.x*
*Staff names referenced from publicly available Google review data only.*

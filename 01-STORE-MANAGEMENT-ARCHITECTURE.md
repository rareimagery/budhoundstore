# BudHound Store Management App — Architecture & Planning

## Overview

The Store Management App is a role-based React application that enables dispensary **store owners**, **managers**, and **budtenders** to manage daily operations — sales, orders, inventory, and compliance — through a unified interface connected to the Drupal Commerce backend via JSON\:API.

Each user sees only the features and data their role permits. Multi-store isolation ensures dispensaries never see each other's data.

---

## User Roles & Access Matrix

| Feature Area | Store Owner | Manager | Budtender |
|---|---|---|---|
| **Dashboard** | Full analytics + revenue | Store analytics | Shift summary |
| **Sales / POS** | View all + refunds | View all + refunds | Create sales, view own |
| **Orders** | View all, manage | View all, assign drivers | View assigned, update status |
| **Inventory** | Full CRUD + audit log | Full CRUD | View only + stock alerts |
| **Products** | Full CRUD + pricing | Edit details, no pricing | View only |
| **Customers** | View all + history | View all + history | View assigned only |
| **Reports** | Full (revenue, tax, compliance) | Operational reports | No access |
| **Staff Management** | Invite/manage all roles | View team schedule | View own schedule |
| **Settings** | Store settings, hours, zones | Limited settings | No access |
| **Compliance** | Full audit logs, tax reports | View compliance status | ID verification at delivery |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Management App                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Dashboard │ │  Sales   │ │  Orders  │ │ Inventory  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Products │ │Customers │ │ Reports  │ │  Settings  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Auth Context  │  Role Guard  │  Store Context      │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ JSON:API + Custom REST
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Drupal Commerce Backend                  │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────────┐ │
│  │ User Roles & │ │  Commerce     │ │  Custom        │ │
│  │ Permissions  │ │  Orders/Cart  │ │  Modules       │ │
│  └──────────────┘ └───────────────┘ └────────────────┘ │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────────┐ │
│  │  JSON:API    │ │  Inventory    │ │  Compliance    │ │
│  │  Endpoints   │ │  Tracking     │ │  & Tax Engine  │ │
│  └──────────────┘ └───────────────┘ └────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  MySQL Database  │  Redis Cache  │  File Storage        │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18+ with Hooks | Management SPA |
| Routing | React Router v6 | Protected routes per role |
| State | React Context + useReducer | Auth, store, cart state |
| Data Fetching | TanStack Query (React Query) | Caching, pagination, mutations |
| UI Framework | Tailwind CSS + Headless UI | Rapid, consistent styling |
| Charts | Recharts | Dashboard analytics |
| Tables | TanStack Table | Sortable, filterable data tables |
| Backend | Drupal Commerce + JSON\:API | Headless commerce engine |
| Auth | Drupal OAuth2 (Simple OAuth) | JWT token-based auth |
| Real-time | Socket.io (Node.js) | Live order updates |
| API Layer | JSON\:API + custom REST | CRUD + business logic endpoints |

---

## Authentication Flow

```
1. User navigates to management app
2. Login form → POST /oauth/token (username, password, client_id)
3. Drupal validates credentials, returns:
   - access_token (JWT)
   - refresh_token
   - expires_in
   - user object with roles[] and store_id
4. React stores tokens in memory (NOT localStorage)
   - Refresh token in httpOnly cookie (secure)
5. All API requests include: Authorization: Bearer {access_token}
6. Token refresh happens automatically before expiry
7. Drupal validates token + checks role permissions on every request
```

### Token Storage Strategy
- **Access token**: Held in React state (AuthContext) — cleared on tab close
- **Refresh token**: httpOnly secure cookie — survives page refresh
- **No localStorage/sessionStorage** — security best practice for cannabis apps

---

## Multi-Store Data Isolation

Every API request is scoped to the authenticated user's store:

```
GET /jsonapi/commerce_order/default?filter[store_id]={user.store_id}
```

Drupal enforces this server-side via:
1. **Entity Access** — Custom access handler checks `store_id` on every entity
2. **JSON\:API Filter** — Server-side middleware auto-injects store filter
3. **Views Integration** — All admin views pre-filtered by store context

A Store Owner can only see their own store's data. No cross-store access exists.

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Drupal roles and permissions configuration
- [ ] Simple OAuth module setup + token endpoints
- [ ] Custom permission module for granular access
- [ ] React app scaffold with auth flow
- [ ] Role-based route protection
- [ ] Basic dashboard shell with navigation

### Phase 2: Core Operations (Week 3-5)
- [ ] **Orders Module** — List, detail, status management, assignment
- [ ] **Inventory Module** — Stock levels, adjustments, alerts
- [ ] **Products Module** — CRUD with role-gated pricing controls
- [ ] **Sales/POS Module** — Point of sale interface for budtenders

### Phase 3: Analytics & Reporting (Week 6-7)
- [ ] Dashboard analytics (revenue, orders, top products)
- [ ] Sales reports with date range filters
- [ ] Tax compliance reports (excise + sales tax)
- [ ] Inventory reports (low stock, movement history)
- [ ] Export to CSV/PDF

### Phase 4: Advanced Features (Week 8-10)
- [ ] Staff management and scheduling
- [ ] Customer management with purchase history
- [ ] Real-time order notifications via WebSocket
- [ ] Store settings and delivery zone management
- [ ] Compliance audit log viewer

### Phase 5: Polish & Deploy (Week 11-12)
- [ ] Mobile-responsive optimization
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] End-to-end testing
- [ ] Staging deployment and UAT
- [ ] Production deployment

---

## File Structure (React App)

```
budhound-management/
├── public/
├── src/
│   ├── api/
│   │   ├── client.js              # Axios/fetch wrapper with auth
│   │   ├── endpoints.js           # API endpoint constants
│   │   ├── orders.js              # Order API hooks
│   │   ├── inventory.js           # Inventory API hooks
│   │   ├── products.js            # Product API hooks
│   │   ├── sales.js               # Sales API hooks
│   │   ├── reports.js             # Reports API hooks
│   │   └── users.js               # User/staff API hooks
│   ├── components/
│   │   ├── common/
│   │   │   ├── DataTable.jsx      # Reusable sortable table
│   │   │   ├── StatusBadge.jsx    # Order/inventory status pills
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   └── Pagination.jsx
│   │   ├── layout/
│   │   │   ├── AppShell.jsx       # Sidebar + header + content
│   │   │   ├── Sidebar.jsx        # Role-filtered navigation
│   │   │   ├── Header.jsx         # User menu, notifications
│   │   │   └── MobileNav.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RoleGuard.jsx      # Wraps routes for role check
│   │   │   └── PermissionGate.jsx # Wraps UI elements for permissions
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── RevenueChart.jsx
│   │   │   ├── OrdersSummary.jsx
│   │   │   ├── TopProducts.jsx
│   │   │   └── StockAlerts.jsx
│   │   ├── orders/
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── OrderStatusFlow.jsx
│   │   │   └── AssignDriver.jsx
│   │   ├── inventory/
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── StockAdjustment.jsx
│   │   │   ├── LowStockAlerts.jsx
│   │   │   └── AuditLog.jsx
│   │   ├── products/
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   └── PricingManager.jsx
│   │   ├── sales/
│   │   │   ├── SalesPage.jsx
│   │   │   ├── POSInterface.jsx
│   │   │   └── RefundForm.jsx
│   │   ├── customers/
│   │   │   ├── CustomersPage.jsx
│   │   │   └── CustomerDetail.jsx
│   │   ├── reports/
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── SalesReport.jsx
│   │   │   ├── TaxReport.jsx
│   │   │   └── InventoryReport.jsx
│   │   ├── staff/
│   │   │   ├── StaffPage.jsx
│   │   │   └── InviteUser.jsx
│   │   └── settings/
│   │       ├── SettingsPage.jsx
│   │       ├── StoreProfile.jsx
│   │       └── DeliveryZones.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx        # User, tokens, roles
│   │   ├── StoreContext.jsx       # Active store data
│   │   └── NotificationContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePermissions.js      # Check role-based access
│   │   ├── useOrders.js
│   │   ├── useInventory.js
│   │   └── useWebSocket.js
│   ├── utils/
│   │   ├── permissions.js         # Role/permission constants & helpers
│   │   ├── formatters.js          # Currency, dates, weights
│   │   ├── validators.js
│   │   └── cannabis.js            # Tax calc, compliance helpers
│   ├── App.jsx
│   ├── routes.jsx                 # Central route definitions
│   └── index.js
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Key Design Decisions

### 1. Why React Query (TanStack Query)?
Cannabis inventory and orders change frequently. React Query provides automatic background refetching, cache invalidation on mutations, optimistic updates for the POS, and pagination/infinite scroll for large catalogs — all without building custom state management.

### 2. Why NOT Redux?
For this app, React Context handles auth/store state, and React Query handles server state. Redux would add unnecessary complexity. If the app grows significantly, Zustand is a lighter alternative.

### 3. Why Tailwind + Headless UI?
Rapid development with consistent design tokens. Headless UI provides accessible dropdown, modal, and dialog components without opinionated styling — important for the professional look dispensary owners expect.

### 4. Why OAuth2 over session cookies?
The management app runs on a different domain than Drupal. OAuth2 with JWT allows clean cross-origin authentication, and the token carries role information for instant client-side permission checks without extra API calls.

### 5. Cannabis-Specific Considerations
- All monetary displays include tax breakdowns (excise + sales tax)
- Inventory tracks by weight (grams/ounces) AND unit count
- Product categories follow California cannabis classifications
- Compliance timestamps on all state-changing operations
- Audit trails are immutable — no hard deletes

---

## Related Documents

- **[02-DRUPAL-BACKEND-IMPLEMENTATION.md](./02-DRUPAL-BACKEND-IMPLEMENTATION.md)** — Roles, permissions, modules, API endpoints
- **[03-REACT-FRONTEND-IMPLEMENTATION.md](./03-REACT-FRONTEND-IMPLEMENTATION.md)** — Component implementation, routing, state management

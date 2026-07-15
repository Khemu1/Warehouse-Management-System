# WMS Frontend — Build Plan

## Status

- ✅ Auth (login, logout, protected routes, Zustand store)
- ✅ Layout (sidebar, mobile sheet, navigation)
- ✅ Theme (Tailwind v3 + shadcn v2.3.0)
- 🔜 Pages

---

## Build Order

### 1. Products Page — `/inventory/products`

**Endpoint:** `GET/POST/PATCH/DELETE /products`

- [x] Component created
- [x] Connect to real API
- [x] Test CRUD operations

### 2. Warehouses Page — `/inventory/warehouses`

**Endpoint:** `GET/POST/PATCH/DELETE /warehouses`

- [x] Table with warehouse list
- [x] Add/Edit modal (name, location, capacity)
- [x] Delete with confirmation
- [x] Search by name

### 3. Stock Levels Page — `/inventory/stock`

**Endpoint:** `GET /inventory`

- [x] Table grouped by product + warehouse
- [x] Available = quantity - reserved_quantity
- [x] Low stock badge (available ≤ threshold)
- [x] Filter by warehouse dropdown
- [x] Search by product name/SKU

### 4. Inbound Orders Page — `/orders/inbound`

**Endpoints:** `GET/POST /orders/inbound`

- [x] Create inbound order form
- [x] Select warehouse, add products + quantities
- [x] Status: pending → received
- [x] Table with all inbound orders
- [x] View order details

### 5. Outbound Orders Page — `/orders/outbound`

**Endpoints:** `GET/POST /orders/outbound`

- [x] Create outbound order form
- [x] Select warehouse, customer, products + quantities
- [x] Stock validation (can't ship more than available)
- [x] Status flow: pending → confirmed → shipped
- [x] Cancel order (releases reserved stock)
- [x] Table with all outbound orders

### 6. Payments Page — `/payments`

**Endpoint:** `GET /payments`

- [x] Table with all payments
- [x] Filter by status (pending/success/failed)
- [x] Link to outbound order

### 7. Dashboard Page — `/dashboard`

**Endpoints:** `GET /dashboard/stats`, `GET /orders/recent`

- [ ] Stats cards (products count, low stock, pending orders, revenue)
- [ ] Recent orders table
- [ ] SSE connection for real-time updates
- [ ] Quick action cards

### 8. Settings Page — `/settings`

- [ ] User profile display
- [ ] Change password form (optional)

---

## API Endpoints Reference

| Method | Endpoint                    | Service      |
| ------ | --------------------------- | ------------ |
| POST   | /auth/login                 | Auth         |
| DELETE | /auth/logout                | Auth         |
| GET    | /products                   | Inventory    |
| POST   | /products                   | Inventory    |
| PATCH  | /products/:id               | Inventory    |
| DELETE | /products/:id               | Inventory    |
| GET    | /warehouses                 | Inventory    |
| POST   | /warehouses                 | Inventory    |
| PATCH  | /warehouses/:id             | Inventory    |
| DELETE | /warehouses/:id             | Inventory    |
| GET    | /inventory                  | Inventory    |
| GET    | /orders/inbound             | Orders       |
| POST   | /orders/inbound             | Orders       |
| GET    | /orders/outbound            | Orders       |
| POST   | /orders/outbound            | Orders       |
| PATCH  | /orders/outbound/:id/status | Orders       |
| GET    | /payments                   | Payment      |
| GET    | /dashboard/stats            | API Gateway  |
| GET    | /orders/recent              | Orders       |
| GET    | /events (SSE)               | Notification |

---

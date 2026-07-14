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

- [ ] Create inbound order form
- [ ] Select warehouse, add products + quantities
- [ ] Status: pending → received
- [ ] Table with all inbound orders
- [ ] View order details

### 5. Outbound Orders Page — `/orders/outbound`

**Endpoints:** `GET/POST /orders/outbound`

- [ ] Create outbound order form
- [ ] Select warehouse, customer, products + quantities
- [ ] Stock validation (can't ship more than available)
- [ ] Status flow: pending → confirmed → shipped
- [ ] Cancel order (releases reserved stock)
- [ ] Table with all outbound orders

### 6. Payments Page — `/payments`

**Endpoint:** `GET /payments`

- [ ] Table with all payments
- [ ] Filter by status (pending/success/failed)
- [ ] Link to outbound order
- [ ] Read-only (no create/edit)

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

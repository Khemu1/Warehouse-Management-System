# Warehouse Management System (WMS) — Project Plan

## Goal

Build a microservices-based Warehouse Management System using NestJS to learn:

- Microservices with RabbitMQ
- CQRS pattern
- BullMQ job queues
- React + shadcn/ui admin dashboard

## Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Backend Framework | NestJS (microservices) | ✅ |
| Database | PostgreSQL (shared) | ✅ |
| Message Broker | RabbitMQ (service-to-service) | ✅ |
| Caching / Locks | Redis | ✅ |
| Job Queues | BullMQ | ✅ |
| Frontend | React + shadcn/ui + Tailwind v3 | ✅ |
| State Management | Zustand (auth) + React Query (server) | ✅ |
| Form Validation | Zod + React Hook Form | ✅ |
| Containerization | Docker Compose | ✅ |
| Payments | Mocked | ✅ |

## Architecture Overview

```
Client (React Dashboard)
      ↓
API Gateway        ← Single entry point, JWT validation, request forwarding
      ↓
  ┌───┴───────────────────────────────┐
  ↓          ↓           ↓            ↓
Auth     Inventory    Orders      Payment
Service   Service     Service     Service
```

### Communication

- Client → API Gateway — HTTP REST
- Gateway → Services — RabbitMQ messages
- Orders → Inventory — RabbitMQ (reserve/release stock)
- Orders → Payment — RabbitMQ (process payment)
- Redis — distributed locks, caching, rate limiting

## Services Breakdown

### 1. API Gateway ✅

- Only thing the client talks to
- Validates JWT (Guard + RolesGuard)
- Forwards requests to correct service via RabbitMQ
- Rate limiting
- Swagger docs

### 2. Auth Service ✅

- Register / Login
- Issue JWT
- User CRUD (admin only)
- Roles: admin, staff
- Password hashing with bcrypt

### 3. Inventory Service ✅

- Products CRUD with pagination + search
- Warehouses CRUD with pagination + search
- Stock levels per warehouse with filters
- Stock reservation (pessimistic write locks)
- Stock fulfillment (deduct on ship)
- Stock release (cancel reservation)
- Add stock (inbound receive with idempotency)
- Low stock threshold checks
- Stock movements audit trail
- Redis distributed locks for concurrent operations

### 4. Orders Service ✅

- Inbound orders: create, receive, cancel
- Outbound orders: create, reserve, confirm, cancel
- CQRS pattern (commands vs queries)
- Status flows:
  - Inbound: `pending → receiving → received / needs_attention`
  - Outbound: `pending → reserving → reserved → confirmed → shipped / needs_attention`
- BullMQ job queues for async processing
- Idempotency keys for stock operations
- Failure tracking with retry attempts

### 5. Payment Service ✅

- Process payment (mocked — auto-confirms)
- Payment method selection (Visa, Mastercard, Fawry)
- Public payment page for customers
- Payment status tracking
- Duplicate payment prevention

## Database (Shared PostgreSQL)

### Tables

**users** ✅
- `id`, `name`, `email`, `password`, `role` (admin/staff)

**warehouses** ✅
- `id`, `name`, `location`, `capacity`

**products** ✅
- `id`, `name`, `description`, `sku`, `unit_price`, `low_stock_threshold`

**inventory** ✅
- `id`, `product_id`, `warehouse_id`, `quantity`, `reserved_quantity`

**inbound_orders** ✅
- `id`, `warehouse_id`, `supplier_name`, `status`, `total_amount`, `created_by`

**inbound_order_items** ✅
- `id`, `inbound_order_id`, `product_id`, `expected_quantity`, `received_quantity`, `unit_cost`

**inbound_order_failures** ✅
- `id`, `order_id`, `item_id`, `reason`, `attempts`, `resolved`

**outbound_orders** ✅
- `id`, `warehouse_id`, `customer_name`, `status`, `total_amount`, `total_products`, `created_by`, `confirmed_by`, `cancelled_by`

**outbound_order_items** ✅
- `id`, `outbound_order_id`, `product_id`, `quantity`, `unit_cost`

**outbound_order_failures** ✅
- `id`, `order_id`, `item_id`, `reason`, `attempts`, `resolved`

**payments** ✅
- `id`, `order_id`, `total_amount`, `status`, `payment_method`

**stock_movements** ✅
- `id`, `idempotency_key`, `warehouse_id`, `product_id`, `quantity`, `type`

## Frontend Pages ✅

| Page | Path | Features |
|---|---|---|
| Login | `/login` | JWT auth, role-based redirect |
| Dashboard | `/dashboard` | Stats cards, low stock alerts, recent orders, quick actions, auto-refresh |
| Products | `/inventory/products` | CRUD, pagination, search, Zod validation |
| Warehouses | `/inventory/warehouses` | CRUD, pagination, search, Zod validation |
| Stock Levels | `/inventory/stock` | Filter by warehouse, search, low stock badges |
| Inbound Orders | `/orders/inbound` | Create, receive, cancel, view details, needs attention |
| Outbound Orders | `/orders/outbound` | Create, reserve, payment link, confirm, cancel, view details |
| Payments | `/payments` | List, filter by status, pagination |
| Pay (Public) | `/pay/:orderId` | Mock payment with method selection |
| Users | `/users` | Admin-only: CRUD, pagination, search |

## Frontend Architecture

| Concern | Solution |
|---|---|
| Auth state | Zustand (persist middleware) |
| Server state | React Query (TanStack Query) |
| Form validation | Zod + React Hook Form |
| UI Components | shadcn/ui v2.3.0 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Icons | React Icons (Lucide) |
| Toasts | shadcn toast |
| Dialogs | Zustand dialog store + shadcn Dialog |
| Error handling | API error → toast + inline field errors |
| Auto-refresh | React Query `refetchInterval` (30s) |

## Folder Structure

```
wms-platform/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI + feature components
│   │   ├── hooks/              # React Query hooks
│   │   ├── utils/                # Utilities (form-errors)
│   │   ├── pages/               # Route pages
│   │   ├── stores/              # Zustand stores
│   │   ├── types/                # TypeScript types
│   │   └── validations/          # Zod schemas
│   └── Dockerfile
├── server/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── inventory-service/
│   ├── orders-service/
│   ├── payment-service/
│   └── shared/
├── docker-compose.yml
└── README.md
```

## Status: COMPLETE ✅

| Feature | Status |
|---|---|
| Auth (login, JWT, roles, user CRUD) | ✅ |
| Products CRUD | ✅ |
| Warehouses CRUD | ✅ |
| Stock Levels | ✅ |
| Inbound Orders (create, receive, cancel) | ✅ |
| Outbound Orders (create, reserve, pay, confirm, cancel) | ✅ |
| Payments (process, list, public pay page) | ✅ |
| Dashboard (stats, recent orders, quick links) | ✅ |
| Form validation (Zod + RHF) | ✅ |
| Error handling (toast + inline) | ✅ |
| Docker Compose | ✅ |
| BullMQ job queues | ✅ |
| Redis distributed locks | ✅ |
| Idempotency (stock movements) | ✅ |
| CQRS (orders service) | ✅ |
| Rate Limiting | ✅ |
| Swagger Docs | ✅ |

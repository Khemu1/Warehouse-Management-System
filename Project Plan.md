# Warehouse Management System (WMS) — Project Plan

## Goal

Build a microservices-based Warehouse Management System using NestJS to learn:

- Microservices with RabbitMQ
- CQRS pattern
- BullMQ job queues
- NestJS SSE (Server-Sent Events) for real-time updates

---

## Tech Stack

| Layer             | Technology                            |
| ----------------- | ------------------------------------- |
| Backend Framework | NestJS (microservices)                |
| Database          | PostgreSQL (shared)                   |
| Message Broker    | RabbitMQ (service-to-service)         |
| Caching / Locks   | Redis                                 |
| Job Queues        | BullMQ                                |
| Frontend          | Next.js + Shadcn UI (admin dashboard) |
| Containerization  | Docker Compose                        |
| API Docs          | Postman                               |
| Payments          | Mocked                                |

---

## Architecture Overview

```
Client (Next.js Dashboard)
      ↓
API Gateway        ← Single entry point, JWT validation, request forwarding
      ↓
  ┌───┴─────────────────────────────┐
  ↓          ↓           ↓          ↓
Auth     Inventory    Orders    Notification
Service   Service     Service    Service
```

### Communication

- **Client → API Gateway** — HTTP REST + SSE
- **Gateway → Services** — RabbitMQ messages
- **Orders → Inventory** — RabbitMQ (reserve/release stock)
- **Orders → Payment** — RabbitMQ (process payment)
- **Payment → Notification** — RabbitMQ (trigger confirmation)
- **Inventory → Notification** — RabbitMQ (low stock alert)
- **Notification → Client** — SSE (real-time inventory updates)
- **Redis** — distributed locks, caching, rate limiting

---

## Services Breakdown

### 1. API Gateway

- Only thing the client talks to
- Validates JWT (Guard + RolesGuard)
- Forwards requests to correct service via RabbitMQ
- SSE endpoint for real-time dashboard updates
- No business logic

### 2. Auth Service ✅ (done)

- Register
- Login
- Issue JWT
- Role: ADMIN, MANAGER, WAREHOUSE_STAFF

### 3. Inventory Service

- Manage products (CRUD)
- Track stock levels per warehouse
- Low stock threshold alerts
- Transfer stock between warehouses
- Real-time stock updates via SSE
- Redis distributed lock when multiple orders reserve same stock

### 4. Orders Service

- Create inbound orders (receiving stock)
- Create outbound orders (shipping stock)
- Cancel orders
- Track order status
- CQRS — CreateOrderCommand / GetOrdersQuery
- Talks to Inventory Service to reserve/release stock

### 5. Payment Service

- Process payment for outbound orders (mocked)
- Refund on cancellation
- Audit trail — new row per payment attempt

### 6. Notification Service

- Low stock email alerts via BullMQ
- Order confirmation emails via BullMQ
- Real-time inventory updates via SSE
- Fire and forget — no database

---

## Key NestJS Concepts Covered

| Concept                  | Where Used                                 |
| ------------------------ | ------------------------------------------ |
| Microservices            | All services via RabbitMQ                  |
| CQRS                     | Orders Service (commands vs queries)       |
| BullMQ                   | Notification Service (email queue)         |
| SSE                      | Notification Service (real-time dashboard) |
| Guards                   | API Gateway (JWT + RolesGuard)             |
| Custom Exception Filters | All services                               |
| Jest Testing             | All services                               |

---

## Database (Shared PostgreSQL)

### Tables

**users**

- id, name, email, password, role (admin/manager/staff)

**warehouses**

- id, name, location, capacity, manager_id

**products**

- id, name, description, sku, unit_price, low_stock_threshold

**inventory**

- id, product_id, warehouse_id, quantity, reserved_quantity

**inbound_orders** (receiving stock)

- id, warehouse_id, supplier_name, status (pending/received/cancelled), created_by

**inbound_order_items**

- id, inbound_order_id, product_id, expected_quantity, received_quantity

**outbound_orders** (shipping stock)

- id, warehouse_id, customer_name, status (pending/confirmed/shipped/cancelled), total_amount, created_by

**outbound_order_items**

- id, outbound_order_id, product_id, quantity, unit_price

**payments**

- id, outbound_order_id, amount, status (pending/success/failed), payment_method

**stock_transfers**

- id, from_warehouse_id, to_warehouse_id, product_id, quantity, status, created_by

---

## Key Flows

### Outbound Order Flow (Most Complex)

```
1. Staff/Admin creates outbound order
         ↓
2. API Gateway validates JWT, forwards to Orders Service
         ↓
3. Orders Service acquires Redis lock on inventory
         ↓
4. Orders Service asks Inventory Service "is stock available?" via RabbitMQ
         ↓
5. If yes → reserves stock, creates order with status PENDING
         ↓
6. Sends message to Payment Service via RabbitMQ
         ↓
7. Payment Service processes (mocked) → returns success/failure
         ↓
8. Orders Service updates order → CONFIRMED or FAILED
         ↓
9. Releases Redis lock, Inventory Service updates stock levels
         ↓
10. Notification Service queues confirmation email via BullMQ
    + pushes real-time stock update via SSE to dashboard
```

### Low Stock Alert Flow

```
1. Inventory updated after order confirmed
         ↓
2. Inventory Service checks if quantity < low_stock_threshold
         ↓
3. If yes → emits event to Notification Service
         ↓
4. Notification Service queues alert email via BullMQ
   + pushes low stock SSE event to dashboard
```

---

## Folder Structure

```
wms-platform/
├── api-gateway/
├── auth-service/
├── inventory-service/
├── orders-service/
├── payment-service/
├── notification-service/
├── shared/
├── db/
│   └── migrations/
└── docker-compose.yml
```

---

## Remaining Timeline (~6 weeks)

| Week | Focus                                                                 |
| ---- | --------------------------------------------------------------------- |
| 1    | design entities, migrations, update shared DTOs                       |
| 2    | Inventory Service (products, warehouses, stock management)            |
| 3    | Orders Service (CQRS, Redis locks, inbound/outbound)                  |
| 4    | Payment Service + Notification Service (BullMQ, SSE)                  |
| 5    | Next.js dashboard (login, inventory table, orders, real-time updates) |
| 6    | Docker Compose, Swagger, README, testing, polish                      |

---

## Dashboard Pages (Next.js + Shadcn)

- `/login` — Auth
- `/dashboard` — Overview (stock summary, pending orders, low stock alerts)
- `/products` — Product list, add/edit/delete
- `/warehouses` — Warehouses list, add/edit/delete
- `/inventory` — Stock levels per warehouse, transfer stock
- `/orders/inbound` — Receive stock
- `/orders/outbound` — Ship stock, payment

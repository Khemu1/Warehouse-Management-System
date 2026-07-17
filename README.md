# StockFlow — Warehouse Management System

A microservices-based Warehouse Management System built with NestJS, RabbitMQ, BullMQ, PostgreSQL, Redis, and React + shadcn/ui.

![Status](https://img.shields.io/badge/status-complete-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Features

- 🔐 **JWT Authentication** — role-based access (admin/staff)
- 📦 **Inventory Management** — products, warehouses, stock levels
- 📥 **Inbound Orders** — receive stock with background processing
- 📤 **Outbound Orders** — ship stock with reservation & fulfillment
- 💳 **Payments** — mocked payment processing with method selection
- 📊 **Dashboard** — real-time stats with auto-refresh
- 🎨 **Modern UI** — shadcn/ui components with Tailwind CSS
- 🐳 **Docker Compose** — one-command setup
- 📚 **Swagger Docs** — auto-generated API documentation

---

## Tech Stack

| Layer            | Technology             |
| ---------------- | ---------------------- |
| Backend          | NestJS (microservices) |
| Database         | PostgreSQL             |
| Message Broker   | RabbitMQ               |
| Caching & Locks  | Redis                  |
| Job Queues       | BullMQ                 |
| Frontend         | React + TypeScript     |
| UI Library       | shadcn/ui v2.3.0       |
| Styling          | Tailwind CSS v3        |
| State Management | Zustand + React Query  |
| Form Validation  | Zod + React Hook Form  |
| Containerization | Docker Compose         |
| API Docs         | Swagger + Postman      |

---

## Architecture

```
Client (React Dashboard)
        ↓
API Gateway (port 3001)
        ↓
   ┌────┴────────────────┐
   ↓         ↓        ↓   ↓
 Auth   Inventory   Orders  Payment
Service   Service   Service Service
   ↓         ↓        ↓      ↓
   └────┬────────┬───────┬───┘
        ↓        ↓       ↓
   PostgreSQL   Redis   RabbitMQ
```

### Communication

- **Client → API Gateway** — HTTP REST
- **Gateway → Services** — RabbitMQ messages
- **Orders → Inventory** — RabbitMQ (reserve/release stock)
- **Orders → Payment** — RabbitMQ (fetch latest confirmed payment status for an order)

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

### Quick Start (Docker)

```bash
git clone <repo-url>
cd wms-platform
docker compose up -d
```

The app will be available at http://localhost and the API at http://localhost:3001.

### Default Credentials

```
Email: admin@test.com
Password: password123
```

### Local Development

```bash
# Install dependencies
cd server/shared && npm install
cd ../auth-service && npm install
cd ../inventory-service && npm install
cd ../orders-service && npm install
cd ../payment-service && npm install
cd ../api-gateway && npm install
cd ../../client && npm install

# Start infrastructure
docker compose up -d postgres redis rabbitmq

# Run database migrations
cd server/shared && npm run migration:run:dev

# Start services (in separate terminals)
cd server/api-gateway && npm run start:dev
cd server/auth-service && npm run start:dev
cd server/inventory-service && npm run start:dev
cd server/orders-service && npm run start:dev
cd server/payment-service && npm run start:dev

# Start frontend
cd client && npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:3001
Swagger: http://localhost:3001/api/docs

---

## Services

| Service                 | Description                            |
| ----------------------- | -------------------------------------- |
| API Gateway (port 3001) | JWT validation, routing, rate limiting |
| Auth Service            | Login, user CRUD, JWT issuance         |
| Inventory Service       | Products, warehouses, stock management |
| Orders Service          | Inbound/outbound orders, job queues    |
| Payment Service         | Payment processing (mocked)            |

---

## Key Patterns

- **Idempotency** — Stock movements tracked to prevent duplicate operations
- **Pessimistic Locks** — Row-level locks for concurrent stock reservations
- **Background Jobs** — BullMQ queues for async stock processing with retry logic
- **Rate Limiting** — Configurable per-endpoint throttling
- **Role-Based Access** — Admin (full access) vs Staff (operational access)

---

## Database

Shared PostgreSQL with the following tables:

- `users` — System users with roles
- `products` — Product catalog
- `warehouses` — Warehouse locations
- `inventory` — Stock levels per product per warehouse
- `inbound_orders` / `inbound_order_items` — Receiving stock
- `outbound_orders` / `outbound_order_items` — Shipping stock
- `payments` — Payment transactions
- `stock_movements` — Audit trail for all stock changes
- `inbound_order_failures` / `outbound_order_failures` — Failure tracking

---

## Frontend Pages

| Page            | Path                    | Access |
| --------------- | ----------------------- | ------ |
| Login           | `/login`                | Public |
| Dashboard       | `/dashboard`            | Staff+ |
| Products        | `/inventory/products`   | Staff+ |
| Warehouses      | `/inventory/warehouses` | Staff+ |
| Stock Levels    | `/inventory/stock`      | Staff+ |
| Inbound Orders  | `/orders/inbound`       | Staff+ |
| Outbound Orders | `/orders/outbound`      | Staff+ |
| Payments        | `/payments`             | Staff+ |
| Users           | `/users`                | Admin  |
| Settings        | `/settings`             | Staff+ |
| Pay (Public)    | `/pay/:orderId`         | Public |

---

## API Documentation

- Swagger UI: http://localhost:3001/api/docs
- Swagger JSON: http://localhost:3001/api/docs-json
- Postman: Import the JSON URL above into Postman

---

## Project Structure

```
wms-platform/
├── client/                         # React frontend
│   ├── src/
│   │   ├── components/             # UI + feature components
│   │   ├── hooks/                  # React Query hooks
│   │   ├── lib/                    # API client, auth, utilities
│   │   ├── pages/                  # Route pages
│   │   ├── stores/                 # Zustand stores
│   │   ├── types/                  # TypeScript types
│   │   └── validations/            # Zod schemas
│   └── Dockerfile
├── server/
│   ├── api-gateway/                # HTTP entry point
│   ├── auth-service/               # Authentication & users
│   ├── inventory-service/          # Products, warehouses, stock
│   ├── orders-service/             # Inbound & outbound orders
│   ├── payment-service/            # Payment processing
│   └── shared/                     # DTOs, entities, migrations
├── docker-compose.yml
├── Dockerfile.frontend
└── README.md
```

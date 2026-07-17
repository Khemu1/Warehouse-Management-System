# Warehouse Management System (WMS) — DevOps Setup Guide

## 1. Architecture Overview

This is a Node.js/NestJS microservices system, formerly named "ticketing," now renamed to **WMS**. All services share code (entities, DTOs, common utilities) via a `shared/` package, and communicate with each other over **RabbitMQ** using request-response and event patterns — not direct HTTP calls between services.

```
                          ┌─────────────┐
   Client / Frontend ───▶ │ api-gateway │  (public HTTP entry point)
                          └──────┬──────┘
                                 │ RabbitMQ (RMQ transport)
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
      ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
      │ auth-service  │  │inventory-serv.│  │ orders-service│
      └───────────────┘  └───────────────┘  └───────────────┘
              │                  │                  │
              └──────────────────┴──────────────────┘
                                 ▼
                          ┌─────────────┐
                          │  Postgres   │  (single shared database:
                          └─────────────┘   wms-platform)
```

- **api-gateway**: the only service exposing a REST API to the outside world. Talks to all other services via RabbitMQ (through a shared `ISafeClient`/`SafeClientProxy` wrapper — not raw `ClientProxy`).
- **auth-service, inventory-service, orders-service**: pure RabbitMQ microservices (`Transport.RMQ`), each listening on its own dedicated queue. No public HTTP port is required for these to function — they only speak RMQ.
- **payment-service**: exists in the codebase but is **not yet part of this deployment** (commented out in `docker-compose.yml`). Nothing currently depends on it.
- **shared/**: a common package (entities, DTOs, DB config, migrations, seeders) that gets compiled once and reused by every service's build. It is not a standalone runtime service — its only "runtime" role is the `migrator` container.
- **migrator**: a one-off utility container (not long-running) used to run database migrations and seeders manually.

All services share a **single Postgres database** (`wms-platform`) — there is no per-service database split at this time.

## 2. Naming Note

The project was originally scaffolded under the name "ticketing" (database name `ticketing-platform`, RabbitMQ user `ticketing`). It has since been renamed to **WMS**:

- Database: `wms-platform`
- RabbitMQ user/pass: `wms` / `wms123`
- Container name prefix: `wms-*`

If you're working against an **older environment/volume** that still has `ticketing-platform` as the Postgres database name, either:

- rename it in place: `ALTER DATABASE "ticketing-platform" RENAME TO "wms-platform";`, or
- wipe and reinitialize the volume (`docker compose down -v`) if no data needs to be preserved.

## 3. Prerequisites

- Docker + Docker Compose
- No local Node.js installation is required to run the stack — everything builds inside containers. Node.js locally is only needed if you're actively developing/debugging a service outside Docker.

## 4. Environment Files

Each service has its own env file, loaded via `env_file:` in `docker-compose.yml`:

| Service           | Env file                             |
| ----------------- | ------------------------------------ |
| api-gateway       | `api-gateway/.env.development`       |
| auth-service      | `auth-service/.env.development`      |
| inventory-service | `inventory-service/.env.development` |
| orders-service    | `orders-service/.env.development`    |
| payment-service   | `payment-service/.env.development`   |
| migrator          | `shared/.env.production`             |

Some values (`DATABASE_URL`, `RABBITMQ_URL`, `DATABASE_HOST`, `REDIS_HOST`) are also set directly in `docker-compose.yml` under `environment:` for each service — these override anything conflicting in the env files, since Compose applies `environment:` after `env_file:`.

**⚠️ Action needed:** if any of these `.env.*` files still reference `ticketing-platform` / `ticketing:ticketing123`, they need to be updated to `wms-platform` / `wms:wms123` to match the renamed `docker-compose.yml`, or they will silently override the correct values.

## 5. Ports

| Service           | Container             | Host port                    | Container port | Notes                                                |
| ----------------- | --------------------- | ---------------------------- | -------------- | ---------------------------------------------------- |
| postgres          | wms-postgres          | 5435                         | 5432           | avoids clashing with a native/other Postgres on 5432 |
| redis             | wms-redis             | 6380                         | 6379           | avoids clashing with a native/other Redis on 6379    |
| rabbitmq          | wms-rabbitmq          | 5673 (amqp), 15673 (mgmt UI) | 5672, 15672    | mgmt UI: http://localhost:15673                      |
| api-gateway       | wms-api-gateway       | 3001                         | 3000           | public REST entry point                              |
| auth-service      | wms-auth-service      |                              |                | published for direct debugging/inspection            |
| inventory-service | wms-inventory-service |                              |                | published for direct debugging/inspection            |
| orders-service    | wms-orders-service    |                              |                | published for direct debugging/inspection            |
| payment-service   | wms-orders-service    |                              |                | published for direct debugging/inspection            |

> **Note:** auth/inventory/orders services communicate with the gateway over RabbitMQ, not HTTP — publishing their ports is for local debugging/inspection convenience only, not because anything calls them over HTTP directly. If your `docker-compose.yml` doesn't yet have `ports:` entries for these three services, add:
>
> ```yaml
> ports:
>   - "3001:3001" # (3002/3003 for the other two, respectively)
> ```

## 6. Building & Running

Build and start everything:

```bash
docker compose up --build -d
```

Start/rebuild a single service:

```bash
docker compose up --build -d auth-service
```

View logs:

```bash
docker compose logs -f api-gateway-service
```

Tear down (keep data):

```bash
docker compose down
```

Tear down and wipe all data (fresh Postgres volume next time):

```bash
docker compose down -v
```

## 7. Database Migrations & Seeders

Migrations and seeders are **not run automatically on startup**. The `migrator` service builds an image capable of running them, but the container just sits available — you exec into it and run the command manually:

```bash
# Run migrations
docker exec -it warehousemanagementsystem-migrator-1 npm run migration:run:prod

# Run seeders
docker exec -it warehousemanagementsystem-migrator-1 npm run seed:run:prod
```

> Confirm the exact npm script names against `shared/package.json` — the above are the two we've been using during setup (`seed:run:prod` is confirmed working; the migration command name should be double-checked/confirmed by whoever wrote `shared/package.json`'s scripts).

Container name may show as `warehousemanagementsystem-migrator-1` (Compose's default naming: `<project>-<service>-<n>`) rather than a custom `container_name` — check with `docker ps` if the exact name differs from what's shown here.

## 8. Health Checks

The **api-gateway** exposes two health endpoints:

| Endpoint            | Purpose                                                                                                                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /health/live`  | Liveness — is the gateway process itself up? No downstream calls, always cheap/fast. Use this for container-restart decisions.                                                                                                                                        |
| `GET /health/ready` | Readiness — is the gateway able to actually serve traffic? Pings `auth-service`, `inventory-service`, and `orders-service` over RabbitMQ (via a `health.check` message pattern) and reports per-service status. Use this for load-balancer/traffic-routing decisions. |

Example:

```bash
curl http://localhost:3002/health/live
curl http://localhost:3002/health/ready
```

`/health/ready` returns `200` if all downstream services respond, or `503` with a per-service breakdown if any are unreachable or timeout. Each downstream service implements a `@MessagePattern('health.check')` handler that returns a simple `{ status: 'ok', service: '<name>', timestamp }` payload — this only confirms the service process is alive and consuming from its RabbitMQ queue, not that its own database connection is healthy (that could be added later if needed).

**`payment-service` is not currently included** in the readiness check, since it isn't part of this deployment yet. It will need to be added to the gateway's readiness check once it's brought online.

## 9. Dockerfile Pattern (per-service)

Each service (`auth-service`, `inventory-service`, `orders-service`, `api-gateway`) uses an identical **multi-stage Dockerfile template**, parameterized by a `SERVICE_NAME` build arg:

```dockerfile
FROM node:20-alpine AS builder
ARG SERVICE_NAME
WORKDIR /app

COPY shared/ ./shared/
COPY ${SERVICE_NAME}/ ./${SERVICE_NAME}/

WORKDIR /app/${SERVICE_NAME}
RUN npm install
RUN npm run build

FROM node:20-alpine
ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}
WORKDIR /app

COPY --from=builder /app/${SERVICE_NAME}/dist ./dist
COPY --from=builder /app/${SERVICE_NAME}/node_modules ./node_modules
COPY --from=builder /app/${SERVICE_NAME}/package*.json ./

EXPOSE 3000
CMD ["sh", "-c", "node dist/${SERVICE_NAME}/src/main.js"]
```

**How it works:**

- **Stage 1 (`builder`)**: copies in `shared/` plus the one service named by `SERVICE_NAME`, installs that service's dependencies, and compiles it with `tsc`/`nest build`.
- **Stage 2 (final image)**: only the compiled `dist/`, `node_modules`, and `package*.json` are copied over from the builder stage — no TypeScript source, no dev dependencies used only at build time. This keeps the final image smaller than the build stage.
- `SERVICE_NAME` is passed in via `docker-compose.yml`'s `build.args`, so the same Dockerfile is reused for every service without duplication.

**Important distinction:** this per-service Dockerfile is a **separate, self-contained build** — each service compiles only its own code (plus whatever it imports from `shared/`, resolved via that service's own `node_modules`/`tsconfig`). This is different from the `shared/Dockerfile.migrate` used by the `migrator` service, which compiles **all four services together into one shared `dist/` tree** (`dist/<service>/src/...`) so the seeder/migration runner can load entities from every service at once. If you're debugging a build issue, first check which Dockerfile is actually involved — the two have different path/module-resolution assumptions.

## 10. Known Gotchas (from setup history)

- **TypeScript path aliases (`@shared/*`, `@auth/*`, etc.) do not survive `tsc` compilation as-is.** The `migrator`'s runtime code re-registers path aliases via `tsconfig-paths` at runtime in both dev and prod, using different `baseUrl`/`paths` mappings for each — because a static alias-rewrite tool (`tsc-alias`) couldn't handle the `migrator`'s multi-service merged `dist/` layout. If you add a new alias, it must be added in **three** places: `shared/tsconfig.json`, and both the dev and prod branches of the `tsconfig-paths.register()` call in `shared/src/config/db/run-seeds.ts` (or wherever that logic lives).
- **`.dockerignore` matters.** Without one excluding `**/node_modules` and `**/dist`, stale host-machine build artiffacts can get copied into images, occasionally causing corrupted/non-executable binaries (we hit this with `@nestjs/cli`'s `nest` binary specifically).
- **`npm run build` in `orders-service` uses `nest build`**, which depends on the `.bin/nest` symlink being executable. If you ever see `sh: nest: Permission denied` during a build, that's an npm-cache permission bug — not a code issue. Fix: use `node node_modules/@nestjs/cli/bin/nest.js build` instead, which is immune to the executable-bit problem.
- **Seed/migration globs fail silently.** `typeorm-extension`'s glob-based `seeds`/`entities` config doesn't throw if a glob matches zero files — it just seeds nothing and still logs "success." If seeding "succeeds" but nothing shows up in the DB, check that the expected `dist/<service>/...` paths actually exist and contain compiled `.js` files.

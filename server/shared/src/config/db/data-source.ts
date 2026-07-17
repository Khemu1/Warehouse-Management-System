import "reflect-metadata";
import { config } from "dotenv";
import { join } from "path";
import { cwd } from "process";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  const { register } = require("tsconfig-paths");
  register({
    baseUrl: join(cwd(), "dist"),
    paths: {
      "@/*": ["shared/src/*"],
      "@shared/*": ["shared/src/*"],
      "@auth/*": ["auth-service/src/*"],
      "@inventory/*": ["inventory-service/src/*"],
      "@payments/*": ["payment-service/src/*"],
      "@orders/*": ["orders-service/src/*"],
    },
  });
} else {
  const { register } = require("tsconfig-paths");
  register({
    baseUrl: join(cwd()),
    paths: {
      "@/*": ["src/*"],
      "@shared/*": ["src/*"],
      "@auth/*": ["../auth-service/src/*"],
      "@inventory/*": ["../inventory-service/src/*"],
      "@payments/*": ["../payment-service/src/*"],
      "@orders/*": ["../orders-service/src/*"],
    },
  });
}

config({ path: join(cwd(), `.env.${process.env.NODE_ENV || "development"}`) });

console.log("shared database config started ", process.env.DATABASE_URL);
console.log("node env ", process.env.NODE_ENV);

const ext = isProd ? "js" : "ts";

// in prod, each service compiles its own tree at dist/<service-name>/src/...
// in dev, each service's own src is a sibling folder: ../<service-name>/src/...
const servicePath = (service: string, subpath: string) =>
  isProd
    ? join(cwd(), `../${service}/dist/${service}/src/${subpath}.${ext}`)
    : join(cwd(), `../${service}/src/${subpath}.${ext}`);

// entities can land either under <service>/dist/<service>/src/... (service-owned)
// or <service>/dist/shared/src/... (shared entities recompiled into that service's tree),
// so scan the whole dist tree for each service rather than assuming one fixed subpath
const allEntitiesForService = (service: string) =>
  isProd
    ? join(cwd(), `../${service}/dist/**/*.entity.${ext}`)
    : join(cwd(), `../${service}/src/**/*.entity.${ext}`);

const options: DataSourceOptions & SeederOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,

  entities: [
    join(cwd(), isProd ? "dist/shared/src" : "src", `**/*.entity.${ext}`),
    allEntitiesForService("auth-service"),
    allEntitiesForService("inventory-service"),
    allEntitiesForService("payment-service"),
    allEntitiesForService("orders-service"),
  ],

  migrations: [
    join(
      cwd(),
      isProd ? "dist/shared/src" : "src",
      `config/db/migrations/*.${ext}`,
    ),
  ],

  seeds: [
    servicePath("auth-service", "seeds/**/*.seeder"),
    servicePath("inventory-service", "seeds/**/*.seeder"),
  ],

  synchronize: false,
};

export const appDataSource = new DataSource(options);

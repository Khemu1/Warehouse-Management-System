import "reflect-metadata";
import { config } from "dotenv";
import { join } from "path";
import { cwd } from "process";
import { register } from "tsconfig-paths";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

// Register ALL path aliases
register({
  baseUrl: join(cwd()),
  paths: {
    "@/*": ["src/*"],
    "@shared/*": ["src/*"],
    "@bookings/*": ["../booking-service/src/*"],
    "@auth/*": ["../auth-service/src/*"],
    "@events/*": ["../events-service/src/*"],
    "@payments/*": ["../payment-service/src/*"],
  },
});

config({ path: join(cwd(), ".env.development") });

console.log("shared database config started ", process.env.DATABASE_URL);

const options: DataSourceOptions & SeederOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,

  entities: [
    join(cwd(), "src/**/*.entity{.ts,.js}"),
    join(cwd(), "../auth-service/src/**/*.entity{.ts,.js}"),
    join(cwd(), "../booking-service/src/**/*.entity{.ts,.js}"),
    join(cwd(), "../events-service/src/**/*.entity{.ts,.js}"),
    join(cwd(), "../payment-service/src/**/*.entity{.ts,.js}"),
  ],
  migrations: [join(cwd(), "src/config/db/migrations/*{.ts,.js}")],

  seeds: [
    join(cwd(), "../auth-service/src/seeds/**/*.seeder{.ts,.js}"),
    join(cwd(), "../events-service/src/seeds/**/*.seeder{.ts,.js}"),
  ],

  synchronize: false,
};

export const appDataSource = new DataSource(options);

import knex, { type Knex } from "knex";
import path from "path";

import type { Env } from "@app/config/env";

export type Db = Knex;

const appRoot = path.join(
  __dirname,
  __dirname.includes("dist") ? "../../../.." : "../..",
);
const migrationsDir = path.join(appRoot, "..", "db", "migrations");

export const createDb = (env: Env): Db =>
  knex({
    client: "mysql2",
    connection: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    },
    pool: {
      min: 0,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: migrationsDir,
      loadExtensions: [".js"],
    },
  });

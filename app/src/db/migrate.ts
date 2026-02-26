import type { Knex } from "knex";

export const runMigrations = async (db: Knex): Promise<void> => {
  await db.migrate.latest();
};

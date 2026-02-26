import type { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
  const exists = await knex.schema.hasTable("stats");
  if (exists) return;

  await knex.schema.createTable("stats", (table) => {
    table.increments("id").primary();
    table.bigInteger("guild_count").notNullable().defaultTo(0);
    table.bigInteger("user_count").notNullable().defaultTo(0);
    table.timestamp("last_updated").notNullable().defaultTo(knex.fn.now());
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists("stats");
};

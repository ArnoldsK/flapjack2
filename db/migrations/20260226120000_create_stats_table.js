/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("stats");
  if (exists) return;

  await knex.schema.createTable("stats", (table) => {
    table.increments("id").primary();
    table.bigInteger("guild_count").notNullable().defaultTo(0);
    table.bigInteger("user_count").notNullable().defaultTo(0);
    table.timestamp("last_updated").notNullable().defaultTo(knex.fn.now());
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

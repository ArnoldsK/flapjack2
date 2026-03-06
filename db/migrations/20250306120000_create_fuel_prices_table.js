/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("fuel_prices");
  if (exists) return;

  await knex.schema.createTable("fuel_prices", (table) => {
    table.string("fuel_type", 32).primary();
    table.decimal("price", 10, 4).notNullable();
    table.json("station_names").notNullable();
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

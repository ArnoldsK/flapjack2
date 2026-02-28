/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("static_data");
  if (exists) return;

  await knex.schema.createTable("static_data", (table) => {
    table.string("type", 64).primary();
    table.specificType("value", "LONGTEXT").notNullable();
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

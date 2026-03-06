/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  await knex.schema.alterTable("fuel_prices", (table) => {
    table.decimal("price", 10, 3).notNullable().alter();
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

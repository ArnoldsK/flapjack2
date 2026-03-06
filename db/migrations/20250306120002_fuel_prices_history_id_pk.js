/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  await knex.raw("ALTER TABLE fuel_prices DROP PRIMARY KEY");
  await knex.raw(
    "ALTER TABLE fuel_prices ADD COLUMN id INT UNSIGNED NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (id)",
  );
  await knex.schema.alterTable("fuel_prices", (table) => {
    table.index(["fuel_type", "updated_at"]);
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

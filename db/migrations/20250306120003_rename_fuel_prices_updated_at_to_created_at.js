/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  await knex.raw(
    "ALTER TABLE fuel_prices CHANGE COLUMN updated_at created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
  );
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

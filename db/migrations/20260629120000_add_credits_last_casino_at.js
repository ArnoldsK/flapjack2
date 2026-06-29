/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  await knex.schema.alterTable("credits", (table) => {
    table.timestamp("last_casino_at").nullable();
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

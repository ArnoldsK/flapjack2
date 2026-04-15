/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("rs_league_users");
  if (exists) return;

  await knex.schema.createTable("rs_league_users", (table) => {
    table.string("user_id").primary();
    table.string("name").notNullable();
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

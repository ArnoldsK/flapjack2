/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("user_roles");
  if (exists) return;

  await knex.schema.createTable("user_roles", (table) => {
    table.string("user_id").primary();
    table.json("role_ids").notNullable();
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

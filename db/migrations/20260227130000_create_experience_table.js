/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("experience");
  if (exists) return;

  await knex.schema.createTable("experience", (table) => {
    table.string("user_id").primary();
    table.integer("exp").notNullable();
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

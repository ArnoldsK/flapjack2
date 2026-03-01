/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("persistent_threads");
  if (exists) return;

  await knex.schema.createTable("persistent_threads", (table) => {
    table.string("thread_id").primary();
    table.string("channel_id").notNullable();
    table.string("message_id").notNullable();
    table.string("user_id").notNullable();
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

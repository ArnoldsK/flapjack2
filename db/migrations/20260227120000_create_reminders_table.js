/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("reminders");
  if (exists) return;

  await knex.schema.createTable("reminders", (table) => {
    table.increments("id").primary();
    table.string("channel_id").notNullable();
    table.string("message_id").notNullable();
    table.string("user_id").notNullable();
    table.text("value").notNullable();
    table.timestamp("expires_at").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migration not supported");
};

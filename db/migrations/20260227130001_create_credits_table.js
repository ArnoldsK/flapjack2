/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("credits");
  if (exists) return;

  await knex.schema.createTable("credits", (table) => {
    table.string("user_id").primary();
    table.bigInteger("credits").unsigned().notNullable();
    table.smallint("multiplier").notNullable().defaultTo(1);
    table.timestamp("last_message_at").nullable();
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("credits");
};

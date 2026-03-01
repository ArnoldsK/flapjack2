/** @type {import("knex").Knex.Migration["up"]} */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("videos");
  if (exists) return;

  await knex.schema.createTable("videos", (table) => {
    table.increments("id").primary();
    table.string("user_id").notNullable();
    table.string("user_display_name").notNullable();
    table.string("channel_id").notNullable();
    table.string("message_id").notNullable();
    table.string("video_url", 512).notNullable();
    table.string("video_id", 32).notNullable();
    table.string("title", 512).notNullable();
    table.string("dearrow_title", 512).nullable();
    table.string("thumbnail_url", 512).notNullable();
    table.string("author_name", 256).notNullable();
    table.string("author_url", 512).notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });
};

/** @type {import("knex").Knex.Migration["down"]} */
exports.down = async () => {
  throw new Error("Down migrations are not allowed");
};

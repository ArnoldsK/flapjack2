import type { Knex } from "knex";

import type { StatsOverview } from "@shared/types/stats";

const TABLE_NAME = "stats";

interface StatsRow {
  id: number;
  guild_count: number;
  user_count: number;
  last_updated: Date;
}

export const getLatestStats = async (
  db: Knex,
): Promise<StatsOverview | null> => {
  const row = await db<StatsRow>(TABLE_NAME)
    .orderBy("last_updated", "desc")
    .first();

  if (!row) return null;

  return {
    guildCount: row.guild_count,
    userCount: row.user_count,
    lastUpdated: row.last_updated.toISOString(),
  };
};

export const upsertStats = async (
  db: Knex,
  input: { guildCount: number; userCount: number },
): Promise<void> => {
  const existing = await db<StatsRow>(TABLE_NAME).first();
  if (!existing) {
    await db<StatsRow>(TABLE_NAME).insert({
      guild_count: input.guildCount,
      user_count: input.userCount,
    });
  } else {
    await db<StatsRow>(TABLE_NAME).where({ id: existing.id }).update({
      guild_count: input.guildCount,
      user_count: input.userCount,
      last_updated: db.fn.now(),
    });
  }
};

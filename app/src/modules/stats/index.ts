import { AppContext } from "@app/context";
import {
  getLatestStats as getLatestStatsFromDb,
  upsertStats as upsertStatsInDb,
} from "@app/modules/stats/db";
import { StatsOverviewSchema, type StatsOverview } from "@project-types/stats";

export const getOverview = async (ctx: AppContext): Promise<StatsOverview> => {
  const existing = await getLatestStatsFromDb(ctx.db);
  if (existing) {
    return StatsOverviewSchema.parse(existing);
  }

  const fallback: StatsOverview = {
    guildCount: ctx.client.guilds.cache.size,
    userCount: ctx.client.users.cache.size,
    lastUpdated: new Date().toISOString(),
  };

  await upsertStatsInDb(ctx.db, {
    guildCount: fallback.guildCount,
    userCount: fallback.userCount,
  });

  return fallback;
};

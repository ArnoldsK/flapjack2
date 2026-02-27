import type { AppContext } from "@app/context";
import * as Stat from "@app/modules/stat";
import { type StatsOverview, StatsOverviewSchema } from "@shared/types/stats";

export const getOverview = async (ctx: AppContext): Promise<StatsOverview> => {
  const existing = await Stat.getLatestStats(ctx);
  if (existing) {
    return StatsOverviewSchema.parse(existing);
  }

  const fallback: StatsOverview = {
    guildCount: ctx.client.guilds.cache.size,
    userCount: ctx.client.users.cache.size,
    lastUpdated: new Date().toISOString(),
  };

  await Stat.upsert(ctx, {
    guildCount: fallback.guildCount,
    userCount: fallback.userCount,
  });

  return fallback;
};

import type { AppContext } from "@app/context";
import * as Stat from "@app/modules/stat";
import type { StatsOverview } from "@shared/types/stats";

export const getLatestStats = async (
  ctx: AppContext,
): Promise<StatsOverview | null> => {
  const row = await ctx
    .db<Stat.db.Table>(Stat.db.TableName)
    .orderBy("last_updated", "desc")
    .first();

  if (!row) return null;

  return {
    guildCount: row.guild_count,
    userCount: row.user_count,
    lastUpdated: row.last_updated.toISOString(),
  };
};

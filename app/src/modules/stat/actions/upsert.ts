import type { AppContext } from "@app/context";
import * as Stat from "@app/modules/stat";

export const upsert = async (
  ctx: AppContext,
  input: { guildCount: number; userCount: number },
): Promise<void> => {
  const existing = await ctx.db<Stat.db.Table>(Stat.db.TableName).first();
  if (!existing) {
    await ctx.db<Stat.db.Table>(Stat.db.TableName).insert({
      guild_count: input.guildCount,
      user_count: input.userCount,
    });
  } else {
    await ctx
      .db<Stat.db.Table>(Stat.db.TableName)
      .where({ id: existing.id })
      .update({
        guild_count: input.guildCount,
        user_count: input.userCount,
        last_updated: ctx.db.fn.now(),
      });
  }
};

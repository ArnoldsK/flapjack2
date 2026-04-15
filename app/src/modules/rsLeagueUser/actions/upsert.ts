import type { AppContext } from "@app/context";
import * as RsLeagueUser from "@app/modules/rsLeagueUser";

export const setName = async (
  ctx: AppContext,
  userId: string,
  name: string,
): Promise<void> => {
  const existing = await ctx
    .db<RsLeagueUser.db.Table>(RsLeagueUser.db.TableName)
    .where({ user_id: userId })
    .first();

  if (!existing) {
    await ctx.db<RsLeagueUser.db.Table>(RsLeagueUser.db.TableName).insert({
      user_id: userId,
      name,
    });
  } else {
    await ctx
      .db<RsLeagueUser.db.Table>(RsLeagueUser.db.TableName)
      .where({ user_id: userId })
      .update({ name });
  }
};

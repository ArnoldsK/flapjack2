import type { AppContext } from "@app/context";
import * as RsLeagueUser from "@app/modules/rsLeagueUser";

export const removeByUserId = async (
  ctx: AppContext,
  userIds: string[],
): Promise<void> => {
  if (userIds.length === 0) {
    return;
  }

  await ctx
    .db<RsLeagueUser.db.Table>(RsLeagueUser.db.TableName)
    .whereIn("user_id", userIds)
    .delete();
};

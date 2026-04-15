import type { AppContext } from "@app/context";
import * as RsLeagueUser from "@app/modules/rsLeagueUser";

export const getAll = async (
  ctx: AppContext,
): Promise<RsLeagueUser.db.Table[]> => {
  return await ctx.db<RsLeagueUser.db.Table>(RsLeagueUser.db.TableName);
};

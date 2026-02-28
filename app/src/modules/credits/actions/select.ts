import type { AppContext } from "@app/context";
import * as Credits from "@app/modules/credits";

export const getByUserId = async (
  ctx: AppContext,
  userId: string,
): Promise<Credits.db.Table | null> => {
  const row = await ctx
    .db<Credits.db.Table>(Credits.db.TableName)
    .where({ user_id: userId })
    .first();

  return row ?? null;
};

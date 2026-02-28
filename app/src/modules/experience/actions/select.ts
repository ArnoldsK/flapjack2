import type { AppContext } from "@app/context";
import * as Experience from "@app/modules/experience";

export const getByUserId = async (
  ctx: AppContext,
  userId: string,
): Promise<Experience.db.Table | null> => {
  const row = await ctx
    .db<Experience.db.Table>(Experience.db.TableName)
    .where({ user_id: userId })
    .first();

  return row ?? null;
};

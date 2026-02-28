import type { AppContext } from "@app/context";
import * as Experience from "@app/modules/experience";

export const upsert = async (
  ctx: AppContext,
  input: Experience.db.UpsertInput,
): Promise<void> => {
  const existing = await ctx
    .db<Experience.db.Table>(Experience.db.TableName)
    .where({ user_id: input.user_id })
    .first();

  if (!existing) {
    await ctx.db<Experience.db.Table>(Experience.db.TableName).insert({
      user_id: input.user_id,
      exp: input.exp,
    });
  } else {
    await ctx
      .db<Experience.db.Table>(Experience.db.TableName)
      .where({ user_id: input.user_id })
      .update({ exp: input.exp });
  }
};

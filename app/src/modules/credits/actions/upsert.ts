import type { AppContext } from "@app/context";
import * as Credits from "@app/modules/credits";

export const upsert = async (
  ctx: AppContext,
  input: Credits.db.UpsertInput,
): Promise<void> => {
  const existing = await ctx
    .db<Credits.db.Table>(Credits.db.TableName)
    .where({ user_id: input.user_id })
    .first();

  if (!existing) {
    await ctx.db<Credits.db.Table>(Credits.db.TableName).insert({
      user_id: input.user_id,
      credits: input.credits,
      multiplier: input.multiplier,
      last_message_at: input.last_message_at,
      last_casino_at: input.last_casino_at,
    });
  } else {
    await ctx
      .db<Credits.db.Table>(Credits.db.TableName)
      .where({ user_id: input.user_id })
      .update({
        credits: input.credits,
        multiplier: input.multiplier,
        last_message_at: input.last_message_at,
        last_casino_at: input.last_casino_at,
      });
  }
};

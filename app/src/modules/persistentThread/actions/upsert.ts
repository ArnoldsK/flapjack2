import type { AppContext } from "@app/context";
import * as PersistentThread from "@app/modules/persistentThread";

export const upsert = async (
  ctx: AppContext,
  input: PersistentThread.db.UpsertInput,
): Promise<void> => {
  const existing = await ctx
    .db<PersistentThread.db.Table>(PersistentThread.db.TableName)
    .where({ thread_id: input.thread_id })
    .first();

  if (!existing) {
    await ctx
      .db<PersistentThread.db.Table>(PersistentThread.db.TableName)
      .insert({
        thread_id: input.thread_id,
        channel_id: input.channel_id,
        message_id: input.message_id,
        user_id: input.user_id,
      });
  } else {
    await ctx
      .db<PersistentThread.db.Table>(PersistentThread.db.TableName)
      .where({ thread_id: input.thread_id })
      .update({
        channel_id: input.channel_id,
        message_id: input.message_id,
        user_id: input.user_id,
      });
  }
};

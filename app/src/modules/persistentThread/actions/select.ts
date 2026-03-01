import type { AppContext } from "@app/context";
import * as PersistentThread from "@app/modules/persistentThread";

export const getByThreadId = async (
  ctx: AppContext,
  threadId: string,
): Promise<PersistentThread.db.Table | null> => {
  const row = await ctx
    .db<PersistentThread.db.Table>(PersistentThread.db.TableName)
    .where({ thread_id: threadId })
    .first();

  return row ?? null;
};

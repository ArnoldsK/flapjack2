import type { AppContext } from "@app/context";
import * as Reminder from "@app/modules/reminder";

export const removeByIds = async (
  ctx: AppContext,
  ids: number[],
): Promise<void> => {
  if (ids.length === 0) {
    return;
  }

  await ctx
    .db<Reminder.db.Table>(Reminder.db.TableName)
    .whereIn("id", ids)
    .delete();
};

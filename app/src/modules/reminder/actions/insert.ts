import type { AppContext } from "@app/context";
import * as Reminder from "@app/modules/reminder";

export const insert = async (
  ctx: AppContext,
  input: Reminder.db.InsertInput,
): Promise<void> => {
  await ctx.db<Reminder.db.Table>(Reminder.db.TableName).insert({
    ...input,
    created_at: ctx.db.fn.now(),
  });
};

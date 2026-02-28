import type { AppContext } from "@app/context";
import * as Reminder from "@app/modules/reminder";

export const getAllExpired = async (
  ctx: AppContext,
): Promise<Reminder.db.Table[]> => {
  const now = new Date();

  const rows = await ctx
    .db<Reminder.db.Table>(Reminder.db.TableName)
    .where("expires_at", "<=", now)
    .orderBy("id", "asc");

  return rows;
};

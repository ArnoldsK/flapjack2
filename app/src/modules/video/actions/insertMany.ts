import type { AppContext } from "@app/context";
import * as Video from "@app/modules/video";

export const insertMany = async (
  ctx: AppContext,
  rows: Video.db.InsertInput[],
): Promise<void> => {
  if (rows.length === 0) return;
  await ctx.db<Video.db.Table>(Video.db.TableName).insert(
    rows.map((row) => ({
      ...row,
      created_at: ctx.db.fn.now(),
    })),
  );
};

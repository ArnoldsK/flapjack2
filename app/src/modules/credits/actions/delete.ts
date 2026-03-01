import type { AppContext } from "@app/context";
import * as Credits from "@app/modules/credits";

export const deleteAll = async (ctx: AppContext): Promise<void> => {
  await ctx.db<Credits.db.Table>(Credits.db.TableName).delete();
};

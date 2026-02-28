import type { AppContext } from "@app/context";
import * as StaticDataModule from "@app/modules/staticData";
import type { StaticDataType } from "@shared/types";

export const deleteByType = async (
  ctx: AppContext,
  dataType: StaticDataType,
): Promise<void> => {
  await ctx
    .db<StaticDataModule.db.Table>(StaticDataModule.db.TableName)
    .where({ type: dataType })
    .delete();
};

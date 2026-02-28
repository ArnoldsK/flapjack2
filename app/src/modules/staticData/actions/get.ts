import type { AppContext } from "@app/context";
import * as StaticDataModule from "@app/modules/staticData";
import type { StaticData, StaticDataType } from "@shared/types";

export const get = async <T extends StaticDataType>(
  ctx: AppContext,
  dataType: T,
): Promise<StaticData[T] | null> => {
  const row = await ctx
    .db<StaticDataModule.db.Table>(StaticDataModule.db.TableName)
    .where({ type: dataType })
    .first();

  if (!row) return null;

  return JSON.parse(row.value) as StaticData[T];
};

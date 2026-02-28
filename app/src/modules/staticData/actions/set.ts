import type { AppContext } from "@app/context";
import * as StaticDataModule from "@app/modules/staticData";
import type { StaticData, StaticDataType } from "@shared/types";

export const set = async <T extends StaticDataType>(
  ctx: AppContext,
  dataType: T,
  value: StaticData[T],
): Promise<void> => {
  const existing = await ctx
    .db<StaticDataModule.db.Table>(StaticDataModule.db.TableName)
    .where({ type: dataType })
    .first();

  if (!existing) {
    await ctx
      .db<StaticDataModule.db.Table>(StaticDataModule.db.TableName)
      .insert({ type: dataType, value: JSON.stringify(value) });
  } else {
    await ctx
      .db<StaticDataModule.db.Table>(StaticDataModule.db.TableName)
      .where({ type: dataType })
      .update({ value: JSON.stringify(value) });
  }
};

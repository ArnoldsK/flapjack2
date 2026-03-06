import type { AppContext } from "@app/context";
import * as FuelPrice from "@app/modules/fuelPrice";

export const insert = async (
  ctx: AppContext,
  input: FuelPrice.db.InsertInput,
): Promise<void> => {
  await ctx.db<FuelPrice.db.Table>(FuelPrice.db.TableName).insert({
    fuel_type: input.fuel_type,
    price: input.price,
    station_names: JSON.stringify(input.station_names) as unknown as string[],
    created_at: ctx.db.fn.now(),
  });
};

import type { AppContext } from "@app/context";
import * as FuelPrice from "@app/modules/fuelPrice";

export const insert = async (
  ctx: AppContext,
  input: FuelPrice.db.InsertInput,
): Promise<void> => {
  const existing = await ctx
    .db<FuelPrice.db.Table>(FuelPrice.db.TableName)
    .where({ fuel_type: input.fuel_type })
    .orderBy("updated_at", "desc")
    .first();

  const stationNamesJson = JSON.stringify(input.station_names);

  if (existing) {
    const existingStationNamesJson =
      typeof existing.station_names === "string"
        ? existing.station_names
        : JSON.stringify(existing.station_names);
    const unchanged =
      Number(existing.price) === input.price &&
      existingStationNamesJson === stationNamesJson;

    if (unchanged) {
      return;
    }
  }

  await ctx.db<FuelPrice.db.Table>(FuelPrice.db.TableName).insert({
    fuel_type: input.fuel_type,
    price: input.price,
    station_names: stationNamesJson as unknown as string[],
    updated_at: ctx.db.fn.now(),
  });
};

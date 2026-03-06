import type { AppContext } from "@app/context";
import * as FuelPrice from "@app/modules/fuelPrice";

export const getAll = async (
  ctx: AppContext,
): Promise<FuelPrice.db.Table[]> => {
  const subquery = ctx
    .db(FuelPrice.db.TableName)
    .select("fuel_type")
    .max("updated_at", { as: "updated_at" })
    .groupBy("fuel_type")
    .as("latest");

  const rows = await ctx
    .db<FuelPrice.db.Table>(FuelPrice.db.TableName)
    .select("fuel_prices.*")
    .join(subquery, function () {
      this.on("fuel_prices.fuel_type", "=", "latest.fuel_type").andOn(
        "fuel_prices.updated_at",
        "=",
        "latest.updated_at",
      );
    })
    .orderBy("fuel_prices.fuel_type", "asc");

  return rows.map((row) => ({
    ...row,
    station_names: normalizeStationNames(row.station_names),
    updated_at:
      row.updated_at instanceof Date
        ? row.updated_at
        : new Date(row.updated_at),
  }));
};

const normalizeStationNames = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw as string[];

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;

      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }

  return [];
};

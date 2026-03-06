import type { AppContext } from "@app/context";
import * as FuelPrice from "@app/modules/fuelPrice";

export const getAll = async (
  ctx: AppContext,
): Promise<FuelPrice.db.Table[]> => {
  const subquery = ctx
    .db(FuelPrice.db.TableName)
    .select("fuel_type")
    .max("created_at", { as: "created_at" })
    .groupBy("fuel_type")
    .as("latest");

  const rows = await ctx
    .db<FuelPrice.db.Table>(FuelPrice.db.TableName)
    .select("fuel_prices.*")
    .join(subquery, function () {
      this.on("fuel_prices.fuel_type", "=", "latest.fuel_type").andOn(
        "fuel_prices.created_at",
        "=",
        "latest.created_at",
      );
    })
    .orderBy("fuel_prices.fuel_type", "asc");

  return rows.map((row) => ({
    ...row,
    station_names: normalizeStationNames(row.station_names),
    created_at:
      row.created_at instanceof Date
        ? row.created_at
        : new Date(row.created_at),
  }));
};

export const getPreviousBatch = async (
  ctx: AppContext,
  latestRows: FuelPrice.db.Table[],
): Promise<FuelPrice.db.Table[]> => {
  const results = await Promise.all(
    latestRows.map(async (row) => {
      const prev = await ctx
        .db<FuelPrice.db.Table>(FuelPrice.db.TableName)
        .where("fuel_type", row.fuel_type)
        .where("created_at", "<", row.created_at)
        .orderBy("created_at", "desc")
        .first();

      if (!prev) return null;

      return {
        ...prev,
        station_names: normalizeStationNames(prev.station_names),
        created_at:
          prev.created_at instanceof Date
            ? prev.created_at
            : new Date(prev.created_at),
      };
    }),
  );

  return results.filter((r): r is FuelPrice.db.Table => r !== null);
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

import type { AppContext } from "@app/context";
import * as FuelPrice from "@app/modules/fuelPrice";

export const getAll = async (
  ctx: AppContext,
): Promise<FuelPrice.db.Table[]> => {
  const rows = await ctx
    .db<FuelPrice.db.Table>(FuelPrice.db.TableName)
    .select("*")
    .orderBy("fuel_type", "asc");

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

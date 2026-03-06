import type { FuelPriceCard } from "@app/modules/canvas";
import type { FuelType } from "@app/modules/fuelPrice";
import type * as FuelPrice from "@app/modules/fuelPrice";

const DISPLAY_ORDER: FuelType[] = ["95", "98", "Diesel", "LPG"];

export const buildCards = (
  currentRows: FuelPrice.db.Table[],
  previousRows: FuelPrice.db.Table[],
): FuelPriceCard[] => {
  const byType = new Map(currentRows.map((row) => [row.fuel_type, row]));
  const prevByType = new Map(previousRows.map((row) => [row.fuel_type, row]));

  return DISPLAY_ORDER.flatMap((fuelType) => {
    const row = byType.get(fuelType);
    if (!row) return [];

    const prev = prevByType.get(fuelType);

    return {
      fuelType,
      price: Number(row.price),
      previousPrice: prev ? Number(prev.price) : null,
      stationNames: row.station_names,
    };
  });
};

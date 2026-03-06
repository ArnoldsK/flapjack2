export const TableName = "fuel_prices";

export type FuelType = "Diesel" | "95" | "98" | "LPG";

export interface Table {
  fuel_type: FuelType;
  price: number;
  station_names: string[];
  updated_at: Date;
}

export type UpsertInput = Omit<Table, "updated_at">;

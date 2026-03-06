export const TableName = "fuel_prices";

export type FuelType = "Diesel" | "95" | "98" | "LPG";

export interface Table {
  id: number;
  fuel_type: FuelType;
  price: number;
  station_names: string[];
  created_at: Date;
}

export type InsertInput = Omit<Table, "id" | "created_at">;

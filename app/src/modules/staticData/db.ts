import type { StaticDataType } from "@shared/types";

export const TableName = "static_data";

export interface Table {
  type: StaticDataType;
  value: string;
}

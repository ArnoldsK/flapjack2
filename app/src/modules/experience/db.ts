export const TableName = "experience";

export interface Table {
  user_id: string;
  exp: number;
}

export type UpsertInput = Table;

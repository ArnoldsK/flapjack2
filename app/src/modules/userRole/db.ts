export const TableName = "user_roles";

export interface Table {
  user_id: string;
  role_ids: string[];
}

export type UpsertInput = Table;

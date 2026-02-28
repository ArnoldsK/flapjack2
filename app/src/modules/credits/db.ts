export const TableName = "credits";

export interface Table {
  user_id: string;
  credits: number;
  multiplier: number;
  last_message_at: Date | undefined;
}

export type UpsertInput = Table;

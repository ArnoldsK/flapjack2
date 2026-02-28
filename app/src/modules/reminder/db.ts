export const TableName = "reminders";

export interface Table {
  id: number;
  channel_id: string;
  message_id: string;
  user_id: string;
  value: string;
  expires_at: Date;
  created_at: Date;
}

export type InsertInput = Omit<Table, "id" | "created_at">;

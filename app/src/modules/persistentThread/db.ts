export const TableName = "persistent_threads";

export interface Table {
  thread_id: string;
  channel_id: string;
  message_id: string;
  user_id: string;
}

export type UpsertInput = Table;

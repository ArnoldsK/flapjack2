export const TableName = "stats";

export interface Table {
  id: number;
  guild_count: number;
  user_count: number;
  last_updated: Date;
}

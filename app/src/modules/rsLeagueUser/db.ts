export const TableName = "rs_league_users";

export interface Table {
  user_id: string;
  /**
   * In-game name during the league
   */
  name: string;
}

export type UpsertInput = Table;

export const TableName = "credits";

/**
 * Credits are stored as a non-negative bigint (e.g. unsigned BIGINT in MySQL).
 * The multiplier (1 or -1) holds the sign so that effective balance =
 * credits * multiplier; this avoids storing negative bigint in the DB.
 */
export interface Table {
  user_id: string;
  credits: bigint;
  multiplier: number;
  last_message_at: Date | null;
}

export type UpsertInput = Table;

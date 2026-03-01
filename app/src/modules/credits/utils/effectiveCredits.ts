import type { Table } from "../db";

export const effectiveCredits = (row: Table | null): bigint =>
  (row != null ? BigInt(row.credits) : 0n) *
  BigInt(row != null ? Number(row.multiplier) : 1);

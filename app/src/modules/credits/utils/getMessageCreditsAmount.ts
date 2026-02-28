import type { Table } from "../db";

const MIN_CREDITS_PER_MESSAGE = 10;
const CREDITS_SECONDS_FACTOR = 0.2;

export const getMessageCreditsAmount = (
  row: Table | null,
  messageAt: Date,
): number => {
  const lastMessageAt = row?.last_message_at ?? null;
  const secondsSinceUpdate =
    lastMessageAt == null
      ? 0
      : (messageAt.getTime() - new Date(lastMessageAt).getTime()) / 1000;
  const timeBasedAmount = Math.floor(
    secondsSinceUpdate * CREDITS_SECONDS_FACTOR,
  );

  return Math.max(MIN_CREDITS_PER_MESSAGE, timeBasedAmount);
};

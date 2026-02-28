import type { AppContext } from "@app/context";
import * as Credits from "@app/modules/credits";

import { applyUpperClassRole } from "./applyUpperClassRole";

const MIN_CREDITS_PER_MESSAGE = 10;
const CREDITS_SECONDS_FACTOR = 0.2;

export const addMessageCredits = async (
  ctx: AppContext,
  userId: string,
  messageAt: Date,
): Promise<void> => {
  const existing = await Credits.getByUserId(ctx, userId);
  const effective = (existing?.credits ?? 0) * (existing?.multiplier ?? 1);
  const lastMessageAt = existing?.last_message_at;
  const secondsSinceUpdate =
    lastMessageAt == null
      ? 0
      : (messageAt.getTime() - new Date(lastMessageAt).getTime()) / 1000;
  const timeBasedAmount = Math.floor(
    secondsSinceUpdate * CREDITS_SECONDS_FACTOR,
  );
  const amount = Math.max(MIN_CREDITS_PER_MESSAGE, timeBasedAmount);
  const newEffective = effective + amount;
  const credits = Math.abs(newEffective);
  const multiplier = newEffective < 0 ? -1 : 1;

  await Credits.upsert(ctx, {
    user_id: userId,
    credits,
    multiplier,
    last_message_at: messageAt,
  });

  await applyUpperClassRole(ctx, userId);
};

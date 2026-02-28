import type { AppContext } from "@app/context";
import * as Credits from "@app/modules/credits";

import { applyUpperClassRole } from "./applyUpperClassRole";

export const modifyForUser = async (
  ctx: AppContext,
  params: {
    userId: string;
    byAmount: number;
    lastMessageAt?: Date;
  },
): Promise<Credits.db.Table> => {
  const row = await Credits.getByUserId(ctx, params.userId);
  const creditsVal = row == null ? 0n : BigInt(row.credits);
  const mult = row == null ? 1 : Number(row.multiplier);
  const effective = creditsVal * BigInt(mult);
  const newEffective = effective + BigInt(params.byAmount);
  const credits = newEffective < 0n ? -newEffective : newEffective;
  const multiplier = newEffective < 0n ? -1 : 1;
  const lastMessageAt = params.lastMessageAt
    ? params.lastMessageAt
    : (row?.last_message_at ?? null);

  await Credits.upsert(ctx, {
    user_id: params.userId,
    credits,
    multiplier,
    last_message_at: lastMessageAt,
  });

  await applyUpperClassRole(ctx, {
    userId: params.userId,
    effective: newEffective,
  });

  return {
    user_id: params.userId,
    credits,
    multiplier,
    last_message_at: lastMessageAt,
  };
};

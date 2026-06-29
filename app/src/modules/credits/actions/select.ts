import dayjs from "dayjs";

import type { AppContext } from "@app/context";
import * as Credits from "@app/modules/credits";
import { TOP_ACTIVE_WITHIN_DAYS } from "@app/modules/credits/constants";

export const ACTIVE_SINCE_DATE = dayjs()
  .subtract(TOP_ACTIVE_WITHIN_DAYS, "day")
  .toDate();

export const getByUserId = async (
  ctx: AppContext,
  userId: string,
): Promise<Credits.db.Table | null> => {
  const row = await ctx
    .db<Credits.db.Table>(Credits.db.TableName)
    .where({ user_id: userId })
    .first();

  return row ?? null;
};

export const getAll = async (ctx: AppContext): Promise<Credits.db.Table[]> => {
  const rows = await ctx.db<Credits.db.Table>(Credits.db.TableName).select("*");

  return rows;
};

export const getAllWithActive = async (
  ctx: AppContext,
): Promise<Credits.db.Table[]> => {
  const rows = await ctx
    .db<Credits.db.Table>(Credits.db.TableName)
    .whereNotNull("last_casino_at")
    .where("last_casino_at", ">=", ACTIVE_SINCE_DATE)
    .select("*");

  return rows;
};

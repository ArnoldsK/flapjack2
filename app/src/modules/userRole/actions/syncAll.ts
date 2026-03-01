import type { AppContext } from "@app/context";

import type * as UserRoleDb from "../db";
import { setRoleIds } from "./upsert";

export const syncAll = async (
  ctx: AppContext,
  rows: UserRoleDb.UpsertInput[],
): Promise<void> => {
  for (const row of rows) {
    await setRoleIds(ctx, row.user_id, row.role_ids);
  }
};

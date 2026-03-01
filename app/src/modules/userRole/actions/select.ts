import type { AppContext } from "@app/context";
import * as UserRole from "@app/modules/userRole";

export const getRoleIds = async (
  ctx: AppContext,
  userId: string,
): Promise<string[]> => {
  const row = await ctx
    .db<UserRole.db.Table>(UserRole.db.TableName)
    .where({ user_id: userId })
    .first();

  if (!row?.role_ids) return [];

  const raw = row.role_ids;

  return Array.isArray(raw) ? raw : JSON.parse(raw as unknown as string);
};

import type { AppContext } from "@app/context";
import * as UserRole from "@app/modules/userRole";

export const setRoleIds = async (
  ctx: AppContext,
  userId: string,
  roleIds: string[],
): Promise<void> => {
  const existing = await ctx
    .db<UserRole.db.Table>(UserRole.db.TableName)
    .where({ user_id: userId })
    .first();

  const roleIdsJson = JSON.stringify(roleIds);

  if (!existing) {
    await ctx.db<UserRole.db.Table>(UserRole.db.TableName).insert({
      user_id: userId,
      role_ids: roleIdsJson as unknown as string[],
    });
  } else {
    await ctx
      .db<UserRole.db.Table>(UserRole.db.TableName)
      .where({ user_id: userId })
      .update({ role_ids: roleIdsJson as unknown as string[] });
  }
};

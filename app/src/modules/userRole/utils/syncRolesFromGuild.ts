import type { AppContext } from "@app/context";

import { syncAll } from "../actions/syncAll";
import { getRoleIdsFromMember } from "./getRoleIdsFromMember";

export const syncRolesFromGuild = async (ctx: AppContext): Promise<void> => {
  const guild = ctx.guild();
  const memberRoleIds = guild.members.cache
    .filter((member) => !member.user.bot)
    .map((member) => ({
      user_id: member.id,
      role_ids: getRoleIdsFromMember(member),
    }));

  if (memberRoleIds.length === 0) return;

  await syncAll(ctx, memberRoleIds);
};

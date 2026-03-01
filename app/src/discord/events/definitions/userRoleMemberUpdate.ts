import type { GuildMember } from "discord.js";
import { Events } from "discord.js";

import { defineEvent } from "@app/discord/events/defineEvent";
import * as UserRole from "@app/modules/userRole";

export default defineEvent({
  event: Events.GuildMemberUpdate,
  once: false,
  productionOnly: true,
  run: async (ctx, oldMember, newMember) => {
    if (newMember.user.bot) return;

    const oldIds = UserRole.utils.getRoleIdsFromMember(
      oldMember as GuildMember,
    );
    const newIds = UserRole.utils.getRoleIdsFromMember(newMember);

    if (
      oldIds.length === newIds.length &&
      oldIds.every((id, i) => id === newIds[i])
    ) {
      return;
    }

    await UserRole.setRoleIds(ctx, newMember.id, newIds);
  },
});

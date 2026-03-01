import { Events } from "discord.js";

import { defineEvent } from "@app/discord/events/defineEvent";
import * as UserRole from "@app/modules/userRole";

export default defineEvent({
  event: Events.GuildMemberAdd,
  once: false,
  productionOnly: true,
  run: async (ctx, member) => {
    if (member.user.bot) return;

    const savedRoleIds = await UserRole.getRoleIds(ctx, member.id);
    if (savedRoleIds.length === 0) return;

    const roles = member.guild.roles.cache.filter((role) =>
      savedRoleIds.includes(role.id),
    );
    if (roles.size === 0) return;

    try {
      await member.roles.add(roles);
    } catch {
      const roleNames = roles.map((role) => role.name).join(", ");

      console.error(
        `Failed to restore roles ${roleNames} for ${member.user.username}`,
      );
    }
  },
});

import { Events } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineEvent } from "@app/discord/events/defineEvent";

const CHANNEL_ROLE_IDS = new Map<string, string>([
  [staticConfig.channels.poe, staticConfig.roles.poe],
  [staticConfig.channels.runescape, staticConfig.roles.rs],
]);

export default defineEvent({
  event: Events.MessageCreate,
  once: false,
  productionOnly: true,
  run: async (ctx, message) => {
    if (message.author.bot) return;
    if (!message.member) return;

    const roleId = CHANNEL_ROLE_IDS.get(message.channel.id);
    if (!roleId) return;

    const role = ctx.guild().roles.cache.get(roleId);
    if (!role) return;

    try {
      if (!message.member.roles.cache.has(role.id)) {
        await message.member.roles.add(role);
      }
    } catch {
      // Ignore role add failures
    }
  },
});

import { Events } from "discord.js";

import { defineEvent } from "@app/discord/events/defineEvent";

export default defineEvent({
  event: Events.ClientReady,
  once: true,
  productionOnly: false,
  run: async (ctx, client) => {
    console.log(`Logged in as ${client.user?.displayName ?? "Unknown user"}`);

    await ctx.guild().members.fetch();
  },
});

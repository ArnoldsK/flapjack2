import { Events } from "discord.js";

import { defineEvent } from "@app/discord/events/defineEvent";

export default defineEvent({
  event: Events.ClientReady,
  once: true,
  productionOnly: false,
  run: async (_ctx, client) => {
    console.log(`Logged in as ${client.user?.tag ?? "Unknown user"}`);
  },
});

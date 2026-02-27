import { Client, GatewayIntentBits, Partials } from "discord.js";

import { registerDiscordEvents } from "@app/discord/events";

export const createDiscordClient = (): Client =>
  new Client({
    allowedMentions: { parse: ["users"] },
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });

export { registerDiscordEvents };

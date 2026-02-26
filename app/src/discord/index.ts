import { Client, GatewayIntentBits, Partials } from "discord.js";

import { registerDiscordEvents } from "@app/discord/events";

export const createDiscordClient = (): Client =>
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });

export { registerDiscordEvents };

import { Client, GatewayIntentBits, Partials } from "discord.js";
import type { AppContext } from "@app/context";
import { registerReadyEvent } from "@app/discord/events/ready";
import { registerInteractionCreateEvent } from "@app/discord/events/interactionCreate";

export const createDiscordClient = (): Client =>
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });

export const registerDiscordEvents = (
  client: Client,
  ctx: AppContext,
): void => {
  registerReadyEvent(client);
  registerInteractionCreateEvent(client, ctx);
};

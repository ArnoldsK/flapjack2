import { type Client, Events } from "discord.js";

export const registerReadyEvent = (client: Client): void => {
  client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag ?? "Unknown user"}`);
  });
};

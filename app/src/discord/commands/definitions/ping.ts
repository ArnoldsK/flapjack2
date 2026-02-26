import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@app/discord/commands/defineCommand";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  version: 1,
  execute: async (_ctx, interaction) => {
    await interaction.reply(`Pong!`);
  },
});

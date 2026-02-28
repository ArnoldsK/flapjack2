import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@app/discord/commands/defineCommand";

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  execute: async (_ctx, interaction) => {
    await interaction.reply(`Pong!`);
  },
});

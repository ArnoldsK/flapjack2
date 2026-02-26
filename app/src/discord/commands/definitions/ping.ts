import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@app/discord/commands/defineCommand";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  version: 1,
  execute: async (ctx, interaction: ChatInputCommandInteraction) => {
    await interaction.reply(`Pong! (env: ${ctx.env.NODE_ENV})`);
  },
});

import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@app/discord/commands/defineCommand";

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin"),

  execute: async (_ctx, interaction) => {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    await interaction.reply({
      content: `${result}`,
    });
  },
});

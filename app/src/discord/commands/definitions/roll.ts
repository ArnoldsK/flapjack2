import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@app/discord/commands/defineCommand";
import { randomInt } from "@shared/utils/random";

enum OptionName {
  Max = "max",
}

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll a random number")
    .addIntegerOption((opt) =>
      opt
        .setName(OptionName.Max)
        .setDescription("From 1 to...")
        .setMinValue(2)
        .setMaxValue(1_000_000)
        .setRequired(true),
    ),

  execute: async (_ctx, interaction) => {
    const max = interaction.options.getInteger(OptionName.Max, true);
    const result = randomInt(1, max);

    await interaction.reply({
      content: `Rolled ${result} out of ${max}`,
    });
  },
});

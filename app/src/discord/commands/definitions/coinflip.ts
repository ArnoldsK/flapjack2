import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@app/discord/commands/defineCommand";

enum OptionName {
  Guess = "guess",
}

export default defineCommand({
  version: 2,

  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin")
    .addStringOption((opt) =>
      opt
        .setName(OptionName.Guess)
        .setDescription("Guess the result of the coin flip")
        .setChoices(
          { name: "Heads", value: "Heads" },
          { name: "Tails", value: "Tails" },
        ),
    ),

  execute: async (_ctx, interaction) => {
    const guess = interaction.options.getString(OptionName.Guess);
    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    if (!guess) {
      await interaction.reply({
        content: `${result}`,
      });

      return;
    }

    await interaction.reply({
      content:
        guess === result
          ? `Guessed ${guess}!`
          : `Guessed ${guess} but got ${result}`,
    });
  },
});

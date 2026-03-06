import { Events, type Interaction, MessageFlags } from "discord.js";

import { commands } from "@app/discord/commands";
import { defineEvent } from "@app/discord/events/defineEvent";

export default defineEvent({
  event: Events.InteractionCreate,
  once: false,
  productionOnly: false,
  run: async (ctx, interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) {
      console.warn(`No command handler found for ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(ctx, interaction);
    } catch (error) {
      console.error(
        `Error executing command ${interaction.commandName}`,
        error,
      );
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          flags: MessageFlags.Ephemeral,
          content: "There was an error while executing this command.",
        });
      } else {
        await interaction.reply({
          flags: MessageFlags.Ephemeral,
          content: "There was an error while executing this command.",
        });
      }
    }
  },
});

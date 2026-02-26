import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import type { AppContext } from "@app/context";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export const execute = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
) => {
  await interaction.reply(`Pong! (env: ${ctx.env.NODE_ENV})`);
};

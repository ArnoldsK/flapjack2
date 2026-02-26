import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

import type { AppContext } from "@app/context";

export interface SlashCommandModule {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (
    ctx: AppContext,
    interaction: ChatInputCommandInteraction,
  ) => Promise<void>;
}

export const defineCommand = (def: SlashCommandModule): SlashCommandModule =>
  def;

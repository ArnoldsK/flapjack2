import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

import type { AppContext } from "@app/context";

export interface SlashCommandModule {
  version: number;
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  execute: (
    ctx: AppContext,
    interaction: ChatInputCommandInteraction,
  ) => Promise<void>;
}

export const defineCommand = (def: SlashCommandModule): SlashCommandModule =>
  def;

import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

import type { AppContext } from "@app/context";
import * as job from "@app/discord/commands/job";
import * as ping from "@app/discord/commands/ping";

export interface SlashCommandModule {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (
    ctx: AppContext,
    interaction: ChatInputCommandInteraction,
  ) => Promise<void>;
}

const commandList: SlashCommandModule[] = [ping, job];

export const commands = new Map<string, SlashCommandModule>(
  commandList.map((cmd) => [cmd.data.name, cmd]),
);

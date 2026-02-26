import type { SlashCommandModule } from "@app/discord/commands/defineCommand";
import job from "@app/discord/commands/job";
import ping from "@app/discord/commands/ping";

const commandList: SlashCommandModule[] = [ping, job];

export const commands = new Map<string, SlashCommandModule>(
  commandList.map((cmd) => [cmd.data.name, cmd]),
);

import type { SlashCommandModule } from "@app/discord/commands/defineCommand";
import job from "@app/discord/commands/definitions/job";
import ping from "@app/discord/commands/definitions/ping";

const commandList: SlashCommandModule[] = [ping, job];

export const commands = new Map<string, SlashCommandModule>(
  commandList.map((cmd) => [cmd.data.name, cmd]),
);

import type { SlashCommandModule } from "@app/discord/commands/defineCommand";
import color from "@app/discord/commands/definitions/color";
import credits from "@app/discord/commands/definitions/credits";
import job from "@app/discord/commands/definitions/job";
import ping from "@app/discord/commands/definitions/ping";
import rank from "@app/discord/commands/definitions/rank";
import remind from "@app/discord/commands/definitions/remind";
import rsLoot from "@app/discord/commands/definitions/rsLoot";

const commandList: SlashCommandModule[] = [
  ping,
  job,
  remind,
  credits,
  color,
  rank,
  rsLoot,
];

export const commands = new Map<string, SlashCommandModule>(
  commandList.map((cmd) => [cmd.data.name, cmd]),
);

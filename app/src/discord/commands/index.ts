import type { SlashCommandModule } from "@app/discord/commands/defineCommand";
import bj from "@app/discord/commands/definitions/bj";
import color from "@app/discord/commands/definitions/color";
import credits from "@app/discord/commands/definitions/credits";
import jb from "@app/discord/commands/definitions/jb";
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
  jb,
  bj,
  rank,
  rsLoot,
];

export const commands = new Map<string, SlashCommandModule>(
  commandList.map((cmd) => [cmd.data.name, cmd]),
);

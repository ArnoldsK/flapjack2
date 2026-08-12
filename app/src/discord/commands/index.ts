import type { SlashCommandModule } from "@app/discord/commands/defineCommand";

import archive from "./definitions/archive";
import bj from "./definitions/bj";
import boosterIcon from "./definitions/boosterIcon";
import coinflip from "./definitions/coinflip";
import color from "./definitions/color";
import credits from "./definitions/credits";
import jb from "./definitions/jb";
import job from "./definitions/job";
import ping from "./definitions/ping";
import rank from "./definitions/rank";
import remind from "./definitions/remind";
import roll from "./definitions/roll";
import rsLeague from "./definitions/rsLeague";
import rsLoot from "./definitions/rsLoot";

const commandList: SlashCommandModule[] = [
  archive,
  ping,
  job,
  remind,
  credits,
  color,
  boosterIcon,
  jb,
  bj,
  rank,
  rsLoot,
  coinflip,
  roll,
  rsLeague,
];

export const commands = new Map<string, SlashCommandModule>(
  commandList.map((cmd) => [cmd.data.name, cmd]),
);

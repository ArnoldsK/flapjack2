import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

import type { Env } from "@app/config/env";
import type { SlashCommandModule } from "@app/discord/commands/defineCommand";

const VERSION_SUFFIX_REGEX = / · v(\d+)$/;

function parseVersionFromDescription(description: string | null): number {
  if (!description) return 0;
  const match = description.match(VERSION_SUFFIX_REGEX);
  return match ? parseInt(match[1], 10) : 0;
}

function buildCommandPayload(
  commands: Map<string, SlashCommandModule>,
): Record<string, unknown>[] {
  return Array.from(commands.values()).map((cmd) => {
    const json = cmd.data.toJSON() as unknown as Record<string, unknown>;
    const desc = (json.description as string) ?? "";
    json.description = `${desc} · v${cmd.version}`;
    return json;
  });
}

export async function deployCommands(
  env: Env,
  guildId: string,
  commands: Map<string, SlashCommandModule>,
): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
  const clientId = env.DISCORD_CLIENT_ID;

  const localNames = new Set(commands.keys());
  const localPayload = buildCommandPayload(commands);

  type RemoteCommand = {
    id: string;
    name: string;
    description?: string | null;
  };
  const remotes = (await rest.get(
    Routes.applicationGuildCommands(clientId, guildId),
  )) as RemoteCommand[];

  let needsDeploy = remotes.some((r) => !localNames.has(r.name));

  for (const cmd of commands.values()) {
    const remote = remotes.find((r) => r.name === cmd.data.name);
    const remoteVersion = remote
      ? parseVersionFromDescription(remote.description ?? null)
      : 0;
    if (remote && remoteVersion > cmd.version) {
      throw new Error(
        `Command "${cmd.data.name}": remote is v${remoteVersion}, local is v${cmd.version}. Refusing to overwrite with older version.`,
      );
    }
    if (!remote || remoteVersion < cmd.version) {
      needsDeploy = true;
    }
  }

  if (!needsDeploy) {
    console.log("Discord commands up to date.");
    return;
  }

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: localPayload,
  });
  console.log(
    `Discord guild commands deployed (${localPayload.length} command(s)).`,
  );
}

export async function removeGuildCommands(
  env: Env,
  guildId: string,
): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, guildId),
    { body: [] },
  );
  console.log("Removed all guild commands.");
}

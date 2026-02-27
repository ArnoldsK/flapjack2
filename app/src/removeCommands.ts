import { loadEnv } from "@app/config/env";
import { staticConfig } from "@app/config/static";
import { removeGuildCommands } from "@app/discord/deployCommands";

const main = async (): Promise<void> => {
  const env = loadEnv();
  await removeGuildCommands(env, staticConfig.guildId);
};

void main();

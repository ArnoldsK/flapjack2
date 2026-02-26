import { startApiServer } from "@app/api/server";
import { loadEnv } from "@app/config/env";
import { staticConfig } from "@app/config/static";
import { createContext } from "@app/context";
import { createDb } from "@app/db/knex";
import { runMigrations } from "@app/db/migrate";
import { createDiscordClient, registerDiscordEvents } from "@app/discord";
import { commands } from "@app/discord/commands";
import {
  deployCommands,
  removeGuildCommands,
} from "@app/discord/deployCommands";
import { registerAll as registerJobs } from "@app/jobs";

const main = async () => {
  const env = loadEnv();
  const db = createDb(env);
  await runMigrations(db);

  let cleaningUp = false;
  const shutdown = async (): Promise<void> => {
    if (cleaningUp) return;
    cleaningUp = true;
    try {
      await db.destroy();
      if (env.NODE_ENV === "development") {
        await removeGuildCommands(env, staticConfig.guildId);
      }
    } catch (error) {
      console.error("Shutdown error", error);
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });

  const client = createDiscordClient();
  const ctx = createContext(env, client, db);

  await startApiServer(ctx);
  registerJobs(ctx);
  registerDiscordEvents(client, ctx);

  await deployCommands(env, staticConfig.guildId, commands);

  try {
    await client.login(env.DISCORD_TOKEN);
  } catch (error) {
    console.error("Failed to login to Discord", error);
    process.exit(1);
  }
};

void main();

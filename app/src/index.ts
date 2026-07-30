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

  // Pure mode will ignore Discord related stuff
  const isPureRun = process.env.PURE_RUN === "true";

  const client = createDiscordClient();
  const ctx = createContext(env, client, db);

  await startApiServer(ctx);

  if (!isPureRun) {
    registerJobs(ctx);
    registerDiscordEvents(client, ctx);
    await deployCommands(env, staticConfig.guildId, commands);

    try {
      await client.login(env.DISCORD_TOKEN);
    } catch (error) {
      console.error("Failed to login to Discord", error);
      process.exit(1);
    }
  }

  let shuttingDown = false;
  const doShutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("Shutting down...");

    await Promise.all([
      env.NODE_ENV === "development"
        ? removeGuildCommands(env, staticConfig.guildId)
        : Promise.resolve(),
      client.destroy(),
      db.destroy(),
    ]);

    process.exit(0);
  };
  process.on("SIGINT", () => void doShutdown());
  process.on("SIGTERM", () => void doShutdown());
};

void main();

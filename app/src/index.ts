import { loadEnv } from "@app/config/env";
import { createContext } from "@app/context";
import { createDiscordClient, registerDiscordEvents } from "@app/discord";
import { createDb } from "@app/db/knex";
import { runMigrations } from "@app/db/migrate";
import { startApiServer } from "@app/api/server";
import { registerAll as registerJobs } from "@app/jobs";

const main = async () => {
  const env = loadEnv();
  const db = createDb(env);
  await runMigrations(db);

  const client = createDiscordClient();
  const ctx = createContext(env, client, db);

  await startApiServer(ctx);
  registerJobs(ctx);
  registerDiscordEvents(client, ctx);

  try {
    await client.login(env.DISCORD_TOKEN);
  } catch (error) {
    console.error("Failed to login to Discord", error);
    process.exit(1);
  }
};

void main();

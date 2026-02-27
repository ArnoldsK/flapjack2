import type { Client, Guild } from "discord.js";

import type { Env } from "@app/config/env";
import { staticConfig } from "@app/config/static";
import type { Db } from "@app/db/knex";

export interface AppContext {
  env: Env;
  client: Client;
  db: Db;
  guild: () => Guild;
}

export const createContext = (
  env: Env,
  client: Client,
  db: Db,
): AppContext => ({
  env,
  client,
  db,
  guild: () => client.guilds.cache.get(staticConfig.guildId)!,
});

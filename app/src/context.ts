import type { Client } from "discord.js";
import type { Env } from "@app/config/env";
import type { Db } from "@app/db/knex";

export interface AppContext {
  env: Env;
  client: Client;
  db: Db;
}

export const createContext = (
  env: Env,
  client: Client,
  db: Db,
): AppContext => ({
  env,
  client,
  db,
});

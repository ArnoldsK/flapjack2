import type { AppContext } from "@app/context";
import * as statsModule from "@app/modules/stats";

export const id = "refreshStats";
export const schedule = "0 * * * *"; // every hour
export const description = "Refreshes guild/user stats and persists to DB";

export const run = async (ctx: AppContext): Promise<void> => {
  await statsModule.getOverview(ctx);
  console.log(`[job:${id}] Stats refreshed`);
};

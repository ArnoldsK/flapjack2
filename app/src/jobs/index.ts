import cron from "node-cron";

import type { AppContext } from "@app/context";

import type { JobDefinition } from "./defineJob";
import createWeekRecap from "./definitions/createWeekRecap";
import endReminders from "./definitions/endReminders";
import getFuelPrices from "./definitions/getFuelPrices";
import resetCredits from "./definitions/resetCredits";
import resetPoeScarabsStaticData from "./definitions/resetPoeScarabsStaticData";

const registry: JobDefinition[] = [
  endReminders,
  createWeekRecap,
  resetCredits,
  resetPoeScarabsStaticData,
  getFuelPrices,
];

export const runById = async (
  ctx: AppContext,
  jobId: string,
): Promise<void> => {
  const job = registry.find((j) => j.id === jobId);
  if (!job) {
    throw new Error(`[job:${jobId}] Unknown job`);
  }
  try {
    await job.run(ctx);
  } catch (error) {
    console.error(`[job:${jobId}] Failed:`, error);
  }
};

export const registerAll = (ctx: AppContext): void => {
  for (const job of registry) {
    if (job.productionOnly && ctx.env.NODE_ENV !== "production") {
      continue;
    }

    cron.schedule(job.schedule, async () => {
      await runById(ctx, job.id);
    });
    console.log(`[job:${job.id}] Scheduled (${job.schedule})`);
  }
};

export const listJobIds = (): string[] => registry.map((j) => j.id);

import cron from "node-cron";

import type { AppContext } from "@app/context";
import type { JobDefinition } from "@app/jobs/defineJob";
import createWeekRecap from "@app/jobs/definitions/createWeekRecap";
import endReminders from "@app/jobs/definitions/endReminders";
import resetCredits from "@app/jobs/definitions/resetCredits";
import resetPoeScarabsStaticData from "@app/jobs/definitions/resetPoeScarabsStaticData";

const registry: JobDefinition[] = [
  endReminders,
  createWeekRecap,
  resetCredits,
  resetPoeScarabsStaticData,
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

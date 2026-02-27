import cron from "node-cron";

import type { AppContext } from "@app/context";
import type { JobDefinition } from "@app/jobs/defineJob";
import endReminders from "@app/jobs/definitions/endReminders";

const registry: JobDefinition[] = [endReminders];

export const runById = async (
  ctx: AppContext,
  jobId: string,
): Promise<void> => {
  const job = registry.find((j) => j.id === jobId);
  if (!job) {
    throw new Error(`[job:${jobId}] Unknown job`);
  }
  try {
    console.log(`[job:${jobId}] Running (${job.schedule})`);
    await job.run(ctx);
    console.log(`[job:${jobId}] Completed`);
  } catch (error) {
    console.error(`[job:${jobId}] Failed:`, error);
  }
};

export const registerAll = (ctx: AppContext): void => {
  for (const job of registry) {
    cron.schedule(job.schedule, async () => {
      await runById(ctx, job.id);
    });
    console.log(`[job:${job.id}] Scheduled (${job.schedule})`);
  }
};

export const listJobIds = (): string[] => registry.map((j) => j.id);

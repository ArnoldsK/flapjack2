import cron from "node-cron";

import type { AppContext } from "@app/context";
import * as refreshStats from "@app/jobs/refreshStats";

export interface JobDefinition {
  id: string;
  schedule: string;
  description?: string;
  run: (ctx: AppContext) => Promise<void>;
}

const registry: JobDefinition[] = [refreshStats];

export const registerAll = (ctx: AppContext): void => {
  for (const job of registry) {
    cron.schedule(job.schedule, () => {
      void job.run(ctx);
    });
    console.log(`[jobs] Scheduled ${job.id} (${job.schedule})`);
  }
};

export const runById = (ctx: AppContext, jobId: string): Promise<void> => {
  const job = registry.find((j) => j.id === jobId);
  if (!job) {
    throw new Error(`Unknown job: ${jobId}`);
  }
  return job.run(ctx);
};

export const listJobIds = (): string[] => registry.map((j) => j.id);

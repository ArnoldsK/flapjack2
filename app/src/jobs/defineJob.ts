import type { AppContext } from "@app/context";

export interface JobDefinition {
  id: string;
  schedule: string;
  timezone?: string;
  description: string;
  productionOnly: boolean;
  run: (ctx: AppContext) => Promise<void>;
}

export const defineJob = (def: JobDefinition): JobDefinition => def;

import type { AppContext } from "@app/context";

export interface JobDefinition {
  id: string;
  schedule: string;
  description: string;
  run: (ctx: AppContext) => Promise<void>;
}

export const defineJob = (def: JobDefinition): JobDefinition => def;

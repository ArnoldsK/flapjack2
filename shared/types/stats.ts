import { z } from "zod";

export const StatsOverviewSchema = z.object({
  guildCount: z.number().int().nonnegative(),
  userCount: z.number().int().nonnegative(),
  lastUpdated: z.string().datetime(),
});

export type StatsOverview = z.infer<typeof StatsOverviewSchema>;

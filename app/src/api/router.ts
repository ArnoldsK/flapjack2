import { statsRouter } from "@app/api/routers/stats";
import { router } from "@app/api/trpc";

export const appRouter = router({
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;

import { router } from "@app/api/trpc";
import { statsRouter } from "@app/api/routers/stats";
import { videosRouter } from "@app/api/routers/videos";

export const appRouter = router({
  stats: statsRouter,
  videos: videosRouter,
});

export type AppRouter = typeof appRouter;

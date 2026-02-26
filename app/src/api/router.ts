import { statsRouter } from "@app/api/routers/stats";
import { videosRouter } from "@app/api/routers/videos";
import { router } from "@app/api/trpc";

export const appRouter = router({
  stats: statsRouter,
  videos: videosRouter,
});

export type AppRouter = typeof appRouter;

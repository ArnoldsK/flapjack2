import { avatarsRouter } from "@app/api/routers/avatars";
import { recapRouter } from "@app/api/routers/recap";
import { videosRouter } from "@app/api/routers/videos";
import { router } from "@app/api/trpc";

export const appRouter = router({
  avatars: avatarsRouter,
  recap: recapRouter,
  videos: videosRouter,
});

export type AppRouter = typeof appRouter;

import { avatarsRouter } from "@app/api/routers/avatars";
import { recapRouter } from "@app/api/routers/recap";
import { statsRouter } from "@app/api/routers/stats";
import { router } from "@app/api/trpc";

export const appRouter = router({
  avatars: avatarsRouter,
  recap: recapRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;

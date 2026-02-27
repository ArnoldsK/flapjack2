import { avatarsRouter } from "@app/api/routers/avatars";
import { statsRouter } from "@app/api/routers/stats";
import { router } from "@app/api/trpc";

export const appRouter = router({
  avatars: avatarsRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;

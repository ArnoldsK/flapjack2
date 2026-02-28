import { avatarsRouter } from "@app/api/routers/avatars";
import { recapRouter } from "@app/api/routers/recap";
import { router } from "@app/api/trpc";

export const appRouter = router({
  avatars: avatarsRouter,
  recap: recapRouter,
});

export type AppRouter = typeof appRouter;

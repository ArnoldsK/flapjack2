import { router, publicProcedure } from "@app/api/trpc";
import * as videosModule from "@app/modules/videos";

export const videosRouter = router({
  list: publicProcedure.query(async (opts) => {
    return videosModule.list(opts.ctx.app);
  }),
});

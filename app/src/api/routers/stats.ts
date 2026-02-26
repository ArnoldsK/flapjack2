import { router, publicProcedure } from "@app/api/trpc";
import * as statsModule from "@app/modules/stats";

export const statsRouter = router({
  getOverview: publicProcedure.query(async (opts) => {
    return statsModule.getOverview(opts.ctx.app);
  }),
});

import { publicProcedure, router } from "@app/api/trpc";
import * as Stats from "@app/modules/stats";

export const statsRouter = router({
  getOverview: publicProcedure.query(async (opts) => {
    return Stats.getOverview(opts.ctx.app);
  }),
});

import { publicProcedure, router } from "@app/api/trpc";
import * as Stat from "@app/modules/stat";

export const statsRouter = router({
  getOverview: publicProcedure.query(async (opts) => {
    return Stat.utils.getOverview(opts.ctx.app);
  }),
});

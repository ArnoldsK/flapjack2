import { publicProcedure, router } from "@app/api/trpc";
import { staticConfig } from "@app/config/static";
import * as StaticData from "@app/modules/staticData";

export const recapRouter = router({
  getWeekRecap: publicProcedure.query(async (opts) => {
    const recap = await StaticData.get(opts.ctx.app, "weekRecap");

    return {
      recap,
      channelOrder: staticConfig.recapChannelIds,
    };
  }),
});

import { publicProcedure, router } from "@app/api/trpc";
import * as Video from "@app/modules/video";

const LATEST_VIDEOS_LIMIT = 100;

export const videosRouter = router({
  getLatest: publicProcedure.query(async (opts) => {
    const ctx = opts.ctx.app;
    const rows = await Video.getLatest(ctx, LATEST_VIDEOS_LIMIT);
    const guild = ctx.guild();
    return rows.map((row) => ({
      ...row,
      user_display_name:
        guild.members.cache.get(row.user_id)?.displayName ??
        row.user_display_name,
    }));
  }),
});

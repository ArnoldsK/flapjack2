import { publicProcedure, router } from "@app/api/trpc";
import { staticConfig } from "@app/config/static";
import * as StaticData from "@app/modules/staticData";

export const recapRouter = router({
  getWeekRecap: publicProcedure.query(async (opts) => {
    const guild = opts.ctx.app.guild();

    const recap = await StaticData.get(opts.ctx.app, "weekRecap");

    const avatars: Record<string, string | null> = {};
    if (recap?.messages) {
      const userIds = [...new Set(recap.messages.map((m) => m.member.id))];
      for (const userId of userIds) {
        const member = guild.members.cache.get(userId);
        avatars[userId] = member
          ? member.displayAvatarURL({
              forceStatic: true,
              extension: "png",
              size: 64,
            })
          : null;
      }
    }

    return {
      recap,
      channelOrder: staticConfig.recapChannelIds,
      avatars,
    };
  }),
});

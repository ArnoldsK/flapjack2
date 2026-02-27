import { publicProcedure, router } from "@app/api/trpc";
import { shuffle } from "@shared/utils/array";

export const avatarsRouter = router({
  getRandom: publicProcedure.query(async (opts) => {
    const guild = opts.ctx.app.guild();
    const members = [...guild.members.cache.values()].filter(
      (m) => !m.user.bot && (m.avatar || m.user.avatar),
    );
    const shuffled = shuffle(members);
    const selected = shuffled.slice(0, 50);

    return selected.map((m) =>
      m.displayAvatarURL({
        forceStatic: true,
        extension: "png",
        size: 128,
      }),
    );
  }),
});

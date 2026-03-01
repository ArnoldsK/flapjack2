import { staticConfig } from "@app/config/static";
import { Color } from "@app/constants";
import { defineJob } from "@app/jobs/defineJob";
import * as Credits from "@app/modules/credits";
import { isTextChannel } from "@app/utils/discord";

const RESET_CREDITS_CHANNEL_IDS = [
  staticConfig.channels.casino,
  staticConfig.channels.logs,
];

export default defineJob({
  id: "resetCredits",
  schedule: "0 0 1 */3 *", // every 3 months at 00:00
  description: "Reset all credits and announce in casino and logs",
  productionOnly: true,
  run: async (ctx) => {
    const botUser = ctx.client.user;
    if (!botUser) return;

    const botRow = await Credits.getByUserId(ctx, botUser.id);
    const botCredits = Credits.utils.formatCredits(
      Number(Credits.utils.effectiveCredits(botRow)),
    );

    await Credits.deleteAll(ctx);

    const embeds = [
      {
        color: Color.Red,
        title: "All credits have been reset",
        description: `${botUser.displayName} had ${botCredits}`,
      },
    ];

    for (const channelId of RESET_CREDITS_CHANNEL_IDS) {
      const channel = ctx.client.channels.cache.get(channelId);
      if (isTextChannel(channel)) {
        await channel.send({ embeds });
      }
    }
  },
});

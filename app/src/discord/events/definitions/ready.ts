import { Events } from "discord.js";

import { staticConfig } from "@app/config/static";
import { Color } from "@app/constants";
import { defineEvent } from "@app/discord/events/defineEvent";
import { getNewCommits } from "@app/utils/git";

export default defineEvent({
  event: Events.ClientReady,
  once: true,
  productionOnly: false,
  run: async (ctx, client) => {
    console.log(`Logged in as ${client.user?.displayName ?? "Unknown user"}`);

    if (ctx.env.NODE_ENV === "production") {
      // Prefetch all members to avoid rate limiting
      await ctx.guild().members.fetch();

      // Send git commit log to logs channel
      const channel = ctx
        .guild()
        .channels.cache.get(staticConfig.channels.logs);
      if (!channel || !channel.isTextBased()) {
        return;
      }

      const newCommits = await getNewCommits();
      const description =
        newCommits.length > 0
          ? newCommits.map((c) => `- ${c.message}`).join("\n")
          : "Restarted with no changes";

      await channel.send({
        embeds: [{ color: Color.Green, description }],
      });
    }
  },
});

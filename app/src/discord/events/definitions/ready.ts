import { Events } from "discord.js";

import { staticConfig } from "@app/config/static";
import { Color } from "@app/constants";
import { defineEvent } from "@app/discord/events/defineEvent";
import * as UserRole from "@app/modules/userRole";
import { isTextChannel } from "@app/utils/discord";
import { getNewCommits } from "@app/utils/git";

export default defineEvent({
  event: Events.ClientReady,
  once: true,
  productionOnly: false,
  run: async (ctx, client) => {
    const guilds = client.guilds.cache.map((g) => g.name);

    console.log(
      `Logged in as ${client.user?.displayName ?? "Unknown user"} in ${guilds.join(", ")}`,
    );

    if (ctx.env.NODE_ENV === "production") {
      // Prefetch all members to avoid rate limiting
      await ctx.guild().members.fetch();
      await UserRole.utils.syncRolesFromGuild(ctx);

      // Send git commit log to logs channel
      const channel = ctx
        .guild()
        .channels.cache.get(staticConfig.channels.logs);
      if (!isTextChannel(channel)) {
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

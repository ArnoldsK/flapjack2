import { Events } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineEvent } from "@app/discord/events/defineEvent";
import * as Credits from "@app/modules/credits";
import * as Experience from "@app/modules/experience";
import { embedAuthor, isTextChannel } from "@app/utils/discord";

const EXP_PER_MESSAGE = 1;
const ACTIVE_MEMBER_LEVEL = 20;

export default defineEvent({
  event: Events.MessageCreate,
  once: false,
  productionOnly: false,
  run: async (ctx, message) => {
    if (message.author.bot) return;
    if (!message.member) return;

    const userId = message.member.id;

    const existingExp = await Experience.getByUserId(ctx, userId);
    const newExp = (existingExp?.exp ?? 0) + EXP_PER_MESSAGE;
    await Experience.upsert(ctx, { user_id: userId, exp: newExp });

    const newLevelData = Experience.utils.getExperienceLevelData(newExp);
    if (newLevelData.lvl >= ACTIVE_MEMBER_LEVEL) {
      // Add active member role if the user does not have it
      const role = ctx.guild().roles.cache.get(staticConfig.roles.activeMember);
      if (role && !message.member.roles.cache.has(role.id)) {
        try {
          await message.member.roles.add(role);
        } catch (error) {
          console.error(
            `[addExpAndCredits] Failed to add active member role for ${userId}:`,
            error,
          );
        }
      }

      // Send a level-up message
      const oldLevelData = Experience.utils.getExperienceLevelData(
        existingExp?.exp ?? 0,
      );
      const channel = ctx
        .guild()
        .channels.cache.get(staticConfig.channels.bepsi);
      if (
        existingExp &&
        newLevelData.lvl > oldLevelData.lvl &&
        isTextChannel(channel)
      ) {
        await channel
          .send({
            embeds: [
              {
                author: embedAuthor(message.member),
                title: "Level Up!",
                description: `LVL ${newLevelData.lvl}`,
                color: message.member.displayColor,
              },
            ],
          })
          .catch(() => {});
      }
    }

    const creditsRow = await Credits.getByUserId(ctx, userId);
    const creditsAmount = Credits.utils.getMessageCreditsAmount(
      creditsRow,
      message.createdAt,
    );
    await Credits.utils.modifyForUser(ctx, {
      userId,
      byAmount: creditsAmount,
      lastMessageAt: message.createdAt,
    });
  },
});

import { Events } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineEvent } from "@app/discord/events/defineEvent";
import * as Credits from "@app/modules/credits";
import { UPPER_CLASS_MESSAGE_CREDITS } from "@app/modules/credits/constants";

export default defineEvent({
  event: Events.MessageCreate,
  once: false,
  productionOnly: true,
  run: async (ctx, message) => {
    if (message.channel.id !== staticConfig.channels.upperClass) return;
    if (message.author.bot) return;
    if (!message.member) return;

    if (!message.member.roles.cache.has(staticConfig.roles.upperClass)) {
      await message.delete();
      return;
    }

    const row = await Credits.getByUserId(ctx, message.member.id);
    const effective = (row?.credits ?? 0) * (row?.multiplier ?? 1);

    if (effective < UPPER_CLASS_MESSAGE_CREDITS) {
      await message.delete();
      return;
    }

    const newEffective = effective - UPPER_CLASS_MESSAGE_CREDITS;
    const credits = Math.abs(newEffective);
    const multiplier = newEffective < 0 ? -1 : 1;

    await Credits.upsert(ctx, {
      user_id: message.member.id,
      credits,
      multiplier,
      last_message_at: row?.last_message_at,
    });
  },
});

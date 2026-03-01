import { Events } from "discord.js";

import { staticConfig } from "@app/config/static";
import { PERSISTENT_THREAD_ARCHIVE_DURATION } from "@app/constants";
import { defineEvent } from "@app/discord/events/defineEvent";
import * as PersistentThread from "@app/modules/persistentThread";

const PERSISTENT_THREAD_CHANNEL_IDS = new Set([staticConfig.channels.garage]);

export default defineEvent({
  event: Events.MessageCreate,
  once: false,
  productionOnly: true,
  run: async (ctx, message) => {
    if (message.author.bot) return;
    if (!message.member) return;

    const channel = message.channel;
    if (!PERSISTENT_THREAD_CHANNEL_IDS.has(channel.id)) return;

    if (
      channel.id === staticConfig.channels.garage &&
      message.attachments.size === 0
    ) {
      return;
    }

    const mentioned = message.mentions.members?.first()?.displayName;
    const threadName =
      mentioned ?? message.content.slice(0, 30) ?? "Discussion";

    const thread =
      message.thread ??
      (await message.startThread({
        autoArchiveDuration: PERSISTENT_THREAD_ARCHIVE_DURATION,
        name: threadName,
      }));

    await PersistentThread.upsert(ctx, {
      thread_id: thread.id,
      channel_id: channel.id,
      message_id: message.id,
      user_id: message.member.id,
    });
  },
});

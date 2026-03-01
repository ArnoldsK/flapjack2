import { Events } from "discord.js";

import { PERSISTENT_THREAD_ARCHIVE_DURATION } from "@app/constants";
import { defineEvent } from "@app/discord/events/defineEvent";
import * as PersistentThread from "@app/modules/persistentThread";

export default defineEvent({
  event: Events.ThreadUpdate,
  once: false,
  productionOnly: true,
  run: async (ctx, _oldThread, newThread) => {
    if (!newThread.archived) return;

    const entity = await PersistentThread.getByThreadId(ctx, newThread.id);
    if (!entity) return;

    await newThread.setArchived(false);

    if (newThread.autoArchiveDuration !== PERSISTENT_THREAD_ARCHIVE_DURATION) {
      await newThread.setAutoArchiveDuration(
        PERSISTENT_THREAD_ARCHIVE_DURATION,
      );
    }
  },
});

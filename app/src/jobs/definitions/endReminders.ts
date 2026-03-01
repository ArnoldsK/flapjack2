import { defineJob } from "@app/jobs/defineJob";
import * as Reminder from "@app/modules/reminder";
import { isTextChannel } from "@app/utils/discord";

export default defineJob({
  id: "endReminders",

  schedule: "* * * * *", // every minute

  description: "Ends reminders that are past their due date",

  productionOnly: false,

  run: async (ctx) => {
    const reminders = await Reminder.getAllExpired(ctx);
    if (reminders.length === 0) {
      return;
    }

    const processedIds: number[] = [];
    const guild = ctx.guild();

    for (const reminder of reminders) {
      const channel = guild.channels.cache.get(reminder.channel_id);
      if (!isTextChannel(channel)) {
        continue;
      }

      try {
        const message = await channel.messages.fetch(reminder.message_id);
        const createdAtUnix = Math.floor(reminder.created_at.getTime() / 1000);
        const fromNow = `<t:${createdAtUnix}:R>`;

        await message.reply(
          `<@${reminder.user_id}> here is a reminder you set ${fromNow}:\n${reminder.value}`,
        );

        processedIds.push(reminder.id);
      } catch (error) {
        console.error(
          `[job:endReminders] Failed to process reminder ${reminder.id}:`,
          error,
        );
      }
    }

    if (processedIds.length === 0) {
      return;
    }

    await Reminder.removeByIds(ctx, processedIds);
  },
});

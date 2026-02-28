import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@app/discord/commands/defineCommand";
import * as Reminder from "@app/modules/reminder";

dayjs.extend(relativeTime);

enum OptionName {
  DurationType = "duration",
  DurationValue = "amount",
  Reminder = "reminder",
}

enum DurationType {
  Minutes = "minutes",
  Hours = "hours",
  Days = "days",
  Weeks = "weeks",
  Months = "months",
  Years = "years",
}

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Create a reminder")
    .addStringOption((option) =>
      option
        .setName(OptionName.DurationType)
        .setDescription("Reminder duration type")
        .setChoices(
          { name: "minutes", value: DurationType.Minutes },
          { name: "hours", value: DurationType.Hours },
          { name: "days", value: DurationType.Days },
          { name: "weeks", value: DurationType.Weeks },
          { name: "months", value: DurationType.Months },
          { name: "years", value: DurationType.Years },
        )
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName(OptionName.DurationValue)
        .setDescription("Reminder duration value")
        .setMinValue(1)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName(OptionName.Reminder)
        .setDescription("What should I remind you about?")
        .setRequired(true),
    ),

  execute: async (ctx, interaction) => {
    const durationType = interaction.options.getString(
      OptionName.DurationType,
      true,
    ) as DurationType;
    const durationValue = interaction.options.getInteger(
      OptionName.DurationValue,
      true,
    );
    const reminderText = interaction.options.getString(
      OptionName.Reminder,
      true,
    );

    if (durationValue === null) {
      await interaction.reply({
        content: "You must provide a duration value.",
        ephemeral: true,
      });

      return;
    }

    const now = dayjs();
    const expiresAt = now.add(durationValue, durationType);

    await interaction.reply(`Okay, I'll remind you ${expiresAt.fromNow()}.`);
    const message = await interaction.fetchReply();

    await Reminder.insert(ctx, {
      channel_id: interaction.channelId,
      message_id: message.id,
      user_id: interaction.user.id,
      value: reminderText,
      expires_at: expiresAt.toDate(),
    });
  },
});

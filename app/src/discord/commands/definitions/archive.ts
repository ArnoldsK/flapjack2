import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { staticConfig } from "@app/config/static";
import { Color } from "@app/constants";
import { defineCommand } from "@app/discord/commands/defineCommand";
import { isTextChannel } from "@app/utils/discord";

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("archive")
    .setDescription("Archives the current channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  execute: async (_ctx, interaction) => {
    const channel = interaction.channel;

    if (!isTextChannel(channel)) {
      await interaction.reply({
        content: "Unable to archive this channel.",
        ephemeral: true,
      });

      return;
    }

    await channel.setParent(staticConfig.categories.archive, {
      lockPermissions: true,
    });
    await channel.setPosition(0);

    await interaction.reply({
      embeds: [
        {
          description: "Channel has been archived",
          color: Color.Black,
        },
      ],
    });
  },
});

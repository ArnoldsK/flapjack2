import type { BaseGuildTextChannel } from "discord.js";
import { codeBlock, MessageFlags, SlashCommandBuilder } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineCommand } from "@app/discord/commands/defineCommand";

const hasWebhooks = (ch: {
  id: string;
  fetchWebhooks?: unknown;
}): ch is BaseGuildTextChannel =>
  ch.id === staticConfig.channels.runescape && "fetchWebhooks" in ch;

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("rs-loot")
    .setDescription("Get the RS channel webhook URL for use with plugins"),

  execute: async (_ctx, interaction) => {
    const channel = interaction.channel;
    if (!channel?.isTextBased() || !hasWebhooks(channel)) {
      await interaction.reply({
        content: "Not allowed in this channel.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const member = interaction.guild?.members.cache.get(interaction.user.id);
    const displayAvatarURL =
      member?.displayAvatarURL({
        forceStatic: true,
        extension: "png",
        size: 64,
      }) ??
      interaction.user.displayAvatarURL({
        forceStatic: true,
        extension: "png",
        size: 64,
      });

    const webhooks = await channel.fetchWebhooks();
    let userWebhook = webhooks.find(
      (w) => w.name === interaction.user.username,
    );

    if (userWebhook) {
      await userWebhook.edit({ avatar: displayAvatarURL });
    } else {
      userWebhook = await channel.createWebhook({
        name: interaction.user.username,
        avatar: displayAvatarURL,
      });
    }

    await interaction.reply({
      content: `Your webhook URL is:\n${codeBlock(userWebhook.url)}`,
      flags: MessageFlags.Ephemeral,
    });
  },
});

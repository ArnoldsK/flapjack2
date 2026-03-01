import type {
  ChatInputCommandInteraction,
  GuildMember,
  RoleCreateOptions,
} from "discord.js";
import { MessageFlags, SlashCommandBuilder } from "discord.js";

import type { AppContext } from "@app/context";
import { defineCommand } from "@app/discord/commands/defineCommand";
import {
  getEmojiIdFromString,
  getNativeEmojiFromString,
} from "@app/utils/emoji";
import {
  getMemberBoosterIconRole,
  getMemberBoosterIconRoleName,
  getOrCreateRole,
} from "@app/utils/roles";

enum SubcommandName {
  Emoji = "emoji",
  Custom = "custom",
  Remove = "remove",
}

enum OptionName {
  Value = "value",
}

const getMember = (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): GuildMember | null => {
  if (!interaction.inGuild()) return null;

  const member = ctx.guild().members.cache.get(interaction.user.id);
  if (!member || member.user.bot) return null;

  return member;
};

const requireBooster = (
  member: GuildMember,
): { ok: true } | { ok: false; message: string } => {
  if (member.premiumSince !== null) return { ok: true };

  return {
    ok: false,
    message: "Only server boosters can set a booster icon.",
  };
};

const parseEmojiString = (
  value: string,
  guild: GuildMember["guild"],
): Pick<RoleCreateOptions, "icon" | "unicodeEmoji"> | undefined => {
  const trimmed = value.trim();

  const emojiId = getEmojiIdFromString(trimmed);
  if (emojiId) {
    const emoji = guild.emojis.cache.get(emojiId);
    if (emoji) return { icon: emoji };
  }

  const byName = guild.emojis.cache.find(
    (e) => e.name?.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byName) return { icon: byName };

  const native = getNativeEmojiFromString(trimmed);
  if (native) return { unicodeEmoji: native };

  return undefined;
};

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("booster-icon")
    .setDescription("Choose your server booster name icon")
    .addSubcommand((sub) =>
      sub
        .setName(SubcommandName.Emoji)
        .setDescription("Set an emoji as the icon")
        .addStringOption((opt) =>
          opt
            .setName(OptionName.Value)
            .setDescription(
              "Input the emoji. Native emoji or server emoji. GIFs won't move.",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName(SubcommandName.Custom)
        .setDescription("Set a custom image as the icon")
        .addAttachmentOption((opt) =>
          opt
            .setName(OptionName.Value)
            .setDescription(
              "Upload the image. GIFs won't move. Follow server and Discord ToS.",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName(SubcommandName.Remove).setDescription("Remove the icon"),
    ),

  execute: async (ctx, interaction) => {
    const member = getMember(ctx, interaction);
    if (!member) {
      await interaction.reply({
        content: "Could not resolve your member in this server.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const booster = requireBooster(member);
    if (!booster.ok) {
      await interaction.reply({
        content: booster.message,
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const sub = interaction.options.getSubcommand() as SubcommandName;

    switch (sub) {
      case SubcommandName.Emoji:
        await handleEmoji(ctx, interaction, member);
        break;
      case SubcommandName.Custom:
        await handleCustom(ctx, interaction, member);
        break;
      case SubcommandName.Remove:
        await handleRemove(ctx, interaction, member);
        break;
    }
  },
});

const handleEmoji = async (
  _ctx: AppContext,
  interaction: ChatInputCommandInteraction,
  member: GuildMember,
): Promise<void> => {
  const value = interaction.options.getString(OptionName.Value, true);
  const emojiOption = parseEmojiString(value, member.guild);

  if (!emojiOption) {
    await interaction.reply({
      content:
        "Emoji not found, or it's not in this server. Try selecting from the emoji picker.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  try {
    const role = await getOrCreateRole(member.guild, {
      name: getMemberBoosterIconRoleName(member),
      ...emojiOption,
    });

    if (member.roles.cache.has(role.id)) {
      await role.edit(emojiOption);
    } else {
      await member.roles.add(role);
    }

    await interaction.reply({
      content: "Booster icon updated.",
      flags: MessageFlags.Ephemeral,
    });
  } catch {
    await interaction.reply({
      content:
        "Emoji not found, or it's not in this server. Try selecting from the emoji picker.",
      flags: MessageFlags.Ephemeral,
    });
  }
};

const handleCustom = async (
  _ctx: AppContext,
  interaction: ChatInputCommandInteraction,
  member: GuildMember,
): Promise<void> => {
  const attachment = interaction.options.getAttachment(OptionName.Value, true);

  if (!attachment.contentType?.startsWith("image/")) {
    await interaction.reply({
      content: "Not an image, or the image is not supported.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  try {
    const role = await getOrCreateRole(member.guild, {
      name: getMemberBoosterIconRoleName(member),
      icon: attachment.url,
    });

    if (member.roles.cache.has(role.id)) {
      await role.edit({ icon: attachment.url });
    } else {
      await member.roles.add(role);
    }

    await interaction.reply({
      content: "Booster icon updated.",
      flags: MessageFlags.Ephemeral,
    });
  } catch {
    await interaction.reply({
      content: "Not an image, or the image is not supported.",
      flags: MessageFlags.Ephemeral,
    });
  }
};

const handleRemove = async (
  _ctx: AppContext,
  interaction: ChatInputCommandInteraction,
  member: GuildMember,
): Promise<void> => {
  const iconRole = getMemberBoosterIconRole(member);

  if (iconRole) {
    await iconRole.delete();
  }

  await interaction.reply({
    content: "Booster icon removed.",
    flags: MessageFlags.Ephemeral,
  });
};

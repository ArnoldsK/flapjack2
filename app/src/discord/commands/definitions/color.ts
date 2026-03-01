import type { ChatInputCommandInteraction } from "discord.js";
import type { GuildMember } from "discord.js";
import { MessageFlags, SlashCommandBuilder } from "discord.js";

import type { AppContext } from "@app/context";
import { defineCommand } from "@app/discord/commands/defineCommand";
import { parseHexColor } from "@app/utils/color";
import {
  getMemberColorRole,
  purgeRole,
  setMemberColorRole,
} from "@app/utils/roles";

enum SubcommandName {
  Custom = "custom",
  Gradient = "gradient",
  None = "none",
}

enum OptionName {
  Hex = "hex",
  Hex1 = "hex1",
  Hex2 = "hex2",
}

const PREVIEW_URL = "https://pepsidog.lv/color";

export default defineCommand({
  version: 2,

  data: new SlashCommandBuilder()
    .setName("color")
    .setDescription("Change your display color")
    .addSubcommand((sub) =>
      sub
        .setName(SubcommandName.Custom)
        .setDescription("Input your own hex color code")
        .addStringOption((opt) =>
          opt
            .setName(OptionName.Hex)
            .setDescription("Full length hex color, e.g. #B492D4")
            .setRequired(true)
            .setMinLength(6)
            .setMaxLength(7),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName(SubcommandName.Gradient)
        .setDescription(
          `Choose a two-color gradient. Preview at ${PREVIEW_URL}`,
        )
        .addStringOption((opt) =>
          opt
            .setName(OptionName.Hex1)
            .setDescription("First color in hex, e.g. #B492D4")
            .setRequired(true)
            .setMinLength(6)
            .setMaxLength(7),
        )
        .addStringOption((opt) =>
          opt
            .setName(OptionName.Hex2)
            .setDescription("Second color in hex, e.g. #D4B492")
            .setRequired(true)
            .setMinLength(6)
            .setMaxLength(7),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName(SubcommandName.None)
        .setDescription("Remove existing custom color"),
    ),

  execute: async (ctx, interaction) => {
    const sub = interaction.options.getSubcommand() as SubcommandName;

    switch (sub) {
      case SubcommandName.Custom:
        await handleCustom(ctx, interaction);
        break;
      case SubcommandName.Gradient:
        await handleGradient(ctx, interaction);
        break;
      case SubcommandName.None:
        await handleNone(ctx, interaction);
        break;
    }
  },
});

const getMember = (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): GuildMember | null => {
  if (!interaction.inGuild()) return null;

  const member = ctx.guild().members.cache.get(interaction.user.id);
  if (!member || member.user.bot) return null;

  return member;
};

const handleCustom = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const member = getMember(ctx, interaction);
  if (!member) {
    await interaction.reply({
      content: "Could not resolve your member in this server.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const input = interaction.options.getString(OptionName.Hex, true);
  const hex = parseHexColor(input);

  if (!hex) {
    await interaction.reply({
      content: "Not a valid hex color.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  await setMemberColorRole(member, [hex, null]);

  await interaction.reply({
    content: `Changed your color to ${hex}`,
    flags: MessageFlags.Ephemeral,
  });
};

const handleGradient = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const member = getMember(ctx, interaction);
  if (!member) {
    await interaction.reply({
      content: "Could not resolve your member in this server.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const input1 = interaction.options.getString(OptionName.Hex1, true);
  const input2 = interaction.options.getString(OptionName.Hex2, true);

  const hex1 = parseHexColor(input1);
  const hex2 = parseHexColor(input2);

  if (!hex1 || !hex2) {
    await interaction.reply({
      content: `Not a valid hex color. Preview at ${PREVIEW_URL}`,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  await setMemberColorRole(member, [hex1, hex2]);

  await interaction.reply({
    content: `Changed your color to ${hex1} and ${hex2} gradient`,
    flags: MessageFlags.Ephemeral,
  });
};

const handleNone = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const member = getMember(ctx, interaction);
  if (!member) {
    await interaction.reply({
      content: "Could not resolve your member in this server.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const role = getMemberColorRole(member);
  if (!role) {
    await interaction.reply({
      content: "You don't have a custom color to remove.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  await member.roles.remove(role);
  await purgeRole(role);

  await interaction.reply({
    content: "Color removed.",
    flags: MessageFlags.Ephemeral,
  });
};

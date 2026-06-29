import type { ChatInputCommandInteraction } from "discord.js";
import { MessageFlags, SlashCommandBuilder } from "discord.js";

import { staticConfig } from "@app/config/static";
import type { AppContext } from "@app/context";
import { defineCommand } from "@app/discord/commands/defineCommand";
import * as Credits from "@app/modules/credits";

enum SubcommandName {
  View = "view",
  Top = "top",
  Give = "give",
  Adjust = "adjust",
}

enum OptionName {
  User = "user",
  Amount = "amount",
  WithInactive = "withInactive",
}

const isCasinoChannel = (channelId: string | null): boolean =>
  channelId === staticConfig.channels.casino;

const replyFlags = (
  channelId: string | null,
): MessageFlags.Ephemeral | undefined =>
  isCasinoChannel(channelId) ? undefined : MessageFlags.Ephemeral;

const effective = (row: Credits.db.Table | null): bigint =>
  (row != null ? BigInt(row.credits) : 0n) *
  BigInt(row != null ? Number(row.multiplier) : 1);

export default defineCommand({
  version: 2,

  data: new SlashCommandBuilder()
    .setName("credits")
    .setDescription("Manage your credits")
    .addSubcommand((sub) =>
      sub
        .setName(SubcommandName.View)
        .setDescription("View your or another user's credits")
        .addUserOption((opt) =>
          opt
            .setName(OptionName.User)
            .setDescription("User to view (default: you)"),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName(SubcommandName.Top)
        .setDescription("Get credits leaderboard")
        .addBooleanOption((option) =>
          option
            .setName(OptionName.WithInactive)
            .setDescription("Whether to include inactive users")
            .setRequired(false),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName(SubcommandName.Give)
        .setDescription("Give credits to someone")
        .addUserOption((opt) =>
          opt
            .setName(OptionName.User)
            .setDescription("User to give credits to")
            .setRequired(true),
        )
        .addStringOption((opt) =>
          opt
            .setName(OptionName.Amount)
            .setDescription("Amount (e.g. 100, 1k, 2m, all)")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName(SubcommandName.Adjust)
        .setDescription("Adjust user credits (development only)")
        .addUserOption((opt) =>
          opt
            .setName(OptionName.User)
            .setDescription("User to adjust")
            .setRequired(true),
        )
        .addIntegerOption((opt) =>
          opt
            .setName(OptionName.Amount)
            .setDescription("Exact amount to add (can be negative)")
            .setRequired(true),
        ),
    ),

  execute: async (ctx, interaction) => {
    const sub = interaction.options.getSubcommand() as SubcommandName;

    switch (sub) {
      case SubcommandName.View:
        await handleView(ctx, interaction);
        break;
      case SubcommandName.Top:
        await handleTop(ctx, interaction);
        break;
      case SubcommandName.Give:
        await handleGive(ctx, interaction);
        break;
      case SubcommandName.Adjust:
        await handleAdjust(ctx, interaction);
        break;
    }
  },
});

const handleView = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const guild = ctx.guild();
  const targetUser =
    interaction.options.getUser(OptionName.User) ?? interaction.user;
  const member = guild.members.cache.get(targetUser.id);

  if (!member) {
    await interaction.reply({
      content: "User not found in this server.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const currentRow = await Credits.getByUserId(ctx, targetUser.id);
  const now = new Date();
  const creditsAmount = Credits.utils.getMessageCreditsAmount(currentRow, now);
  const row = await Credits.utils.modifyForUser(ctx, {
    userId: targetUser.id,
    byAmount: creditsAmount,
    lastMessageAt: now,
  });
  const eff = effective(row);
  const isSelf = targetUser.id === interaction.user.id;
  const intro = isSelf ? "You have" : `${member.displayName} has`;

  await interaction.reply({
    embeds: [
      {
        color: member.displayColor ?? undefined,
        description: `**${intro} ${Credits.utils.formatCredits(eff)}**`,
      },
    ],
    flags: replyFlags(interaction.channelId),
  });
};

const handleTop = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const withInactive =
    interaction.options.getBoolean(OptionName.WithInactive) ?? false;

  const guild = ctx.guild();
  const callerId = interaction.user.id;
  const now = new Date();
  const currentCallerRow = await Credits.getByUserId(ctx, callerId);
  const creditsAmount = Credits.utils.getMessageCreditsAmount(
    currentCallerRow,
    now,
  );

  await Credits.utils.modifyForUser(ctx, {
    userId: callerId,
    byAmount: creditsAmount,
    lastMessageAt: now,
  });

  const rows = withInactive
    ? await Credits.getAll(ctx)
    : await Credits.getAllWithActive(ctx);

  const withEffective = rows
    .map((row) => {
      const mem = guild.members.cache.get(row.user_id);

      return {
        effective: effective(row),
        member: mem,
      };
    })
    .filter((x) => x.member && !x.member.user.bot)
    .sort((a, b) =>
      b.effective > a.effective ? 1 : b.effective < a.effective ? -1 : 0,
    )
    .slice(0, 9);

  if (withEffective.length === 0) {
    await interaction.reply({
      content: withInactive
        ? "No one has any credits yet."
        : "No active users on the leaderboard.",
      flags: replyFlags(interaction.channelId),
    });

    return;
  }

  await interaction.reply({
    embeds: [
      {
        fields: withEffective.map(({ member, effective: eff }, i) => ({
          name: `#${i + 1} ${member!.displayName}`,
          value: Credits.utils.formatCredits(eff),
          inline: true,
        })),
        footer: withInactive
          ? undefined
          : { text: "Only active users are shown" },
      },
    ],
    flags: replyFlags(interaction.channelId),
  });
};

const handleGive = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const guild = ctx.guild();
  const targetUser = interaction.options.getUser(OptionName.User, true);
  const targetMember = guild.members.cache.get(targetUser.id);

  if (!targetMember) {
    await interaction.reply({
      content: "User not found in this server.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  if (targetUser.id === interaction.user.id) {
    await interaction.reply({
      content: "You can't give credits to yourself.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  if (targetUser.bot) {
    await interaction.reply({
      content: "You can't give credits to bots.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const amountStr = interaction.options.getString(OptionName.Amount, true);
  const senderId = interaction.user.id;
  const senderRow = await Credits.getByUserId(ctx, senderId);
  const senderEff = effective(senderRow);

  let amount: number;
  try {
    amount = Credits.utils.parseCreditsAmount(amountStr, Number(senderEff));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid amount.";

    await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });

    return;
  }

  await Credits.utils.modifyForUser(ctx, {
    userId: senderId,
    byAmount: -amount,
  });
  await Credits.utils.modifyForUser(ctx, {
    userId: targetUser.id,
    byAmount: amount,
  });

  await interaction.reply({
    embeds: [
      {
        color:
          guild.members.cache.get(interaction.user.id)?.displayColor ??
          undefined,
        description: `Gave ${Credits.utils.formatCredits(amount)} to ${targetMember.displayName}`,
      },
    ],
    flags: replyFlags(interaction.channelId),
  });
};

const handleAdjust = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  if (ctx.env.NODE_ENV !== "development") {
    await interaction.reply({
      content: "This subcommand is only available in development.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const guild = ctx.guild();
  const targetUser = interaction.options.getUser(OptionName.User, true);
  const targetMember = guild.members.cache.get(targetUser.id);

  if (!targetMember) {
    await interaction.reply({
      content: "User not found in this server.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const delta = interaction.options.getInteger(OptionName.Amount, true);
  await Credits.utils.modifyForUser(ctx, {
    userId: targetUser.id,
    byAmount: delta,
  });

  await interaction.reply({
    embeds: [
      {
        color:
          guild.members.cache.get(interaction.user.id)?.displayColor ??
          undefined,
        description: `Adjusted by ${Credits.utils.formatCredits(delta)} for ${targetMember.displayName}`,
      },
    ],
    flags: MessageFlags.Ephemeral,
  });
};

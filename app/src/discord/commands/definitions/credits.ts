import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

import { staticConfig } from "@app/config/static";
import type { AppContext } from "@app/context";
import { defineCommand } from "@app/discord/commands/defineCommand";
import * as Credits from "@app/modules/credits";
import {
  formatCredits,
  parseCreditsAmount,
} from "@app/modules/credits/utils/formatCredits";

enum SubcommandName {
  View = "view",
  Top = "top",
  Give = "give",
  Adjust = "adjust",
}

enum OptionName {
  User = "user",
  Amount = "amount",
}

const AMOUNT_DESCRIPTION = "Amount (e.g. 100, 1k, 2m, all)";

const isCasinoChannel = (channelId: string | null): boolean =>
  channelId === staticConfig.channels.casino;

const ephemeral = (channelId: string | null): boolean =>
  !isCasinoChannel(channelId);

const effective = (row: Credits.db.Table | null): number =>
  (row?.credits ?? 0) * (row?.multiplier ?? 1);

const toCreditsMultiplier = (
  effectiveValue: number,
): {
  credits: number;
  multiplier: number;
} => {
  const credits = Math.abs(effectiveValue);
  const multiplier = effectiveValue < 0 ? -1 : 1;

  return { credits, multiplier };
};

export default defineCommand({
  version: 1,

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
      sub.setName(SubcommandName.Top).setDescription("Get credits leaderboard"),
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
            .setDescription(AMOUNT_DESCRIPTION)
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
      ephemeral: true,
    });

    return;
  }

  const row = await Credits.getByUserId(ctx, targetUser.id);
  const eff = effective(row);
  const isSelf = targetUser.id === interaction.user.id;
  const intro = isSelf ? "You have" : `${member.displayName} has`;

  await interaction.reply({
    embeds: [
      {
        color: member.displayColor ?? undefined,
        description: `**${intro} ${formatCredits(eff)}**`,
      },
    ],
    ephemeral: ephemeral(interaction.channelId),
  });
};

const handleTop = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const guild = ctx.guild();
  const rows = await Credits.getAll(ctx);

  const withEffective = rows
    .map((row) => {
      const mem = guild.members.cache.get(row.user_id);

      return {
        effective: effective(row),
        member: mem,
      };
    })
    .filter((x) => x.member && !x.member.user.bot)
    .sort((a, b) => b.effective - a.effective)
    .slice(0, 9);

  if (withEffective.length === 0) {
    await interaction.reply({
      content: "No one has any credits yet.",
      ephemeral: ephemeral(interaction.channelId),
    });

    return;
  }

  await interaction.reply({
    embeds: [
      {
        fields: withEffective.map(({ member, effective: eff }, i) => ({
          name: `#${i + 1} ${member!.displayName}`,
          value: formatCredits(eff),
          inline: true,
        })),
      },
    ],
    ephemeral: ephemeral(interaction.channelId),
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
      ephemeral: true,
    });

    return;
  }

  if (targetUser.id === interaction.user.id) {
    await interaction.reply({
      content: "You can't give credits to yourself.",
      ephemeral: true,
    });

    return;
  }

  if (targetUser.bot) {
    await interaction.reply({
      content: "You can't give credits to bots.",
      ephemeral: true,
    });

    return;
  }

  const amountStr = interaction.options.getString(OptionName.Amount, true);
  const senderId = interaction.user.id;
  const senderRow = await Credits.getByUserId(ctx, senderId);
  const senderEff = effective(senderRow);

  let amount: number;
  try {
    amount = parseCreditsAmount(amountStr, senderEff);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid amount.";

    await interaction.reply({ content: msg, ephemeral: true });

    return;
  }

  const recipientRow = await Credits.getByUserId(ctx, targetUser.id);
  const recipientEff = effective(recipientRow);
  const newSenderEff = senderEff - amount;
  const newRecipientEff = recipientEff + amount;

  const senderUpsert = toCreditsMultiplier(newSenderEff);
  const recipientUpsert = toCreditsMultiplier(newRecipientEff);

  await Credits.upsert(ctx, {
    user_id: senderId,
    credits: senderUpsert.credits,
    multiplier: senderUpsert.multiplier,
    last_message_at: senderRow?.last_message_at,
  });
  await Credits.upsert(ctx, {
    user_id: targetUser.id,
    credits: recipientUpsert.credits,
    multiplier: recipientUpsert.multiplier,
    last_message_at: recipientRow?.last_message_at,
  });

  await interaction.reply({
    embeds: [
      {
        color:
          guild.members.cache.get(interaction.user.id)?.displayColor ??
          undefined,
        description: `Gave ${formatCredits(amount)} to ${targetMember.displayName}`,
      },
    ],
    ephemeral: ephemeral(interaction.channelId),
  });
};

const handleAdjust = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  if (ctx.env.NODE_ENV !== "development") {
    await interaction.reply({
      content: "This subcommand is only available in development.",
      ephemeral: true,
    });

    return;
  }

  const guild = ctx.guild();
  const targetUser = interaction.options.getUser(OptionName.User, true);
  const targetMember = guild.members.cache.get(targetUser.id);

  if (!targetMember) {
    await interaction.reply({
      content: "User not found in this server.",
      ephemeral: true,
    });

    return;
  }

  const delta = interaction.options.getInteger(OptionName.Amount, true);
  const row = await Credits.getByUserId(ctx, targetUser.id);
  const eff = effective(row);
  const newEff = eff + delta;
  const { credits, multiplier } = toCreditsMultiplier(newEff);

  await Credits.upsert(ctx, {
    user_id: targetUser.id,
    credits,
    multiplier,
    last_message_at: row?.last_message_at,
  });

  await interaction.reply({
    embeds: [
      {
        color:
          guild.members.cache.get(interaction.user.id)?.displayColor ??
          undefined,
        description: `Adjusted by ${formatCredits(delta)} for ${targetMember.displayName}`,
      },
    ],
    ephemeral: true,
  });
};

import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { MessageFlags, SlashCommandBuilder } from "discord.js";

import { Unicode } from "@app/constants";
import type { AppContext } from "@app/context";
import { defineCommand } from "@app/discord/commands/defineCommand";
import { getRankImage } from "@app/modules/canvas/actions/rankImage";
import * as Experience from "@app/modules/experience";
import type { ExperienceLevelData } from "@app/modules/experience/utils/getLevelData";

enum SubcommandName {
  User = "user",
  Top = "top",
}

enum OptionName {
  User = "user",
}

interface RankData {
  rank: number;
  levelData: ExperienceLevelData;
  member: GuildMember;
}

const makeEqualLengths = (values: string[], padAfter = true): string[] => {
  const maxLen = Math.max(0, ...values.map((s) => s.length));

  return values.map((s) => (padAfter ? s.padEnd(maxLen) : s.padStart(maxLen)));
};

const getAllRankData = async (ctx: AppContext): Promise<RankData[]> => {
  const rows = await Experience.getAllOrderedByExpDesc(ctx);
  const guild = ctx.guild();
  const result: RankData[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const member = guild.members.cache.get(row.user_id);
    if (!member?.user || member.user.bot) continue;

    const levelData = Experience.utils.getExperienceLevelData(row.exp);
    result.push({
      rank: i + 1,
      levelData,
      member,
    });
  }

  return result;
};

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Get user's rank")
    .addSubcommand((sub) =>
      sub
        .setName(SubcommandName.User)
        .setDescription("Get your or other user rank")
        .addUserOption((opt) =>
          opt
            .setName(OptionName.User)
            .setDescription("Choose a user (default: you)"),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName(SubcommandName.Top).setDescription("Get rank top"),
    ),

  execute: async (ctx, interaction) => {
    const sub = interaction.options.getSubcommand() as SubcommandName;

    switch (sub) {
      case SubcommandName.User:
        await handleUser(ctx, interaction);
        break;
      case SubcommandName.Top:
        await handleTop(ctx, interaction);
        break;
    }
  },
});

const handleUser = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const guild = ctx.guild();
  const targetUser = interaction.options.getUser(OptionName.User);
  const member = targetUser
    ? guild.members.cache.get(targetUser.id)
    : guild.members.cache.get(interaction.user.id);

  if (!member) {
    await interaction.reply({
      content: "User not found.",
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const allRankData = await getAllRankData(ctx);
  const rankData = allRankData.find((r) => r.member.id === member.id);

  if (!rankData) {
    const msg =
      member.id === interaction.user.id
        ? "You don't have a rank yet."
        : "That user doesn't have a rank yet.";
    await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });

    return;
  }

  const imageBuffer = await getRankImage({
    member: rankData.member,
    rank: rankData.rank,
    levelData: rankData.levelData,
  });

  await interaction.reply({
    files: [{ attachment: imageBuffer, name: "rank.png" }],
  });
};

const handleTop = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const allRankData = await getAllRankData(ctx);

  const parts: { ranks: string[]; levels: string[]; names: string[] } = {
    ranks: [],
    levels: [],
    names: [],
  };

  for (const { rank, levelData, member } of allRankData) {
    parts.ranks.push(`#${rank}`);
    parts.levels.push(`LVL ${levelData.lvl}`);
    parts.names.push(member.displayName);
  }

  const paddedRanks = makeEqualLengths(parts.ranks);
  const paddedLevels = makeEqualLengths(parts.levels);

  const lines = allRankData.map((_, i) =>
    [paddedRanks[i], paddedLevels[i], parts.names[i]].join(
      ` ${Unicode.Middot} `,
    ),
  );

  const text = lines.join("\n");

  await interaction.reply({
    files: [{ attachment: Buffer.from(text), name: "ranks.txt" }],
    flags: MessageFlags.Ephemeral,
  });
};

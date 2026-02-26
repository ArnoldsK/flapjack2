import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import type { AppContext } from "@app/context";
import { runById, listJobIds } from "@app/jobs";

export const data = new SlashCommandBuilder()
  .setName("job")
  .setDescription("Run a scheduled job manually (restricted)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((sub) =>
    sub
      .setName("run")
      .setDescription("Run a job by id")
      .addStringOption((opt) =>
        opt
          .setName("job_id")
          .setDescription("Job to run")
          .setRequired(true)
          .addChoices(...listJobIds().map((id) => ({ name: id, value: id }))),
      ),
  );

export const execute = async (
  ctx: AppContext,
  interaction: ChatInputCommandInteraction,
) => {
  const sub = interaction.options.getSubcommand();
  if (sub !== "run") return;

  const ownerId = ctx.env.DISCORD_OWNER_ID;
  const isOwner = ownerId && interaction.user.id === ownerId;
  const isAdmin =
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ??
    false;
  if (!isOwner && !isAdmin) {
    await interaction.reply({
      content: "You do not have permission to run jobs.",
      ephemeral: true,
    });
    return;
  }

  const jobId = interaction.options.getString("job_id", true);
  await interaction.deferReply({ ephemeral: true });
  try {
    await runById(ctx, jobId);
    await interaction.editReply(`Job \`${jobId}\` completed.`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await interaction.editReply(`Job failed: ${message}`);
  }
};

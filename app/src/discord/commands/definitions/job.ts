import type { ChatInputCommandInteraction } from "discord.js";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import type { AppContext } from "@app/context";
import { defineCommand } from "@app/discord/commands/defineCommand";
import { listJobIds, runById } from "@app/jobs";
import { stringToIntHash } from "@app/utils/stringToIntHash";

const jobCommandVersion = stringToIntHash(
  listJobIds().slice().sort().join(","),
  1,
  999_999,
);

export default defineCommand({
  version: jobCommandVersion,

  data: new SlashCommandBuilder()
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
    ),

  execute: async (
    ctx: AppContext,
    interaction: ChatInputCommandInteraction,
  ) => {
    const sub = interaction.options.getSubcommand();
    if (sub !== "run") return;

    const jobId = interaction.options.getString("job_id", true);
    await interaction.deferReply({ ephemeral: true });
    try {
      await runById(ctx, jobId);
      await interaction.editReply(`Job \`${jobId}\` completed.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await interaction.editReply(`Job failed: ${message}`);
    }
  },
});

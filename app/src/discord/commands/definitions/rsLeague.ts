import { MessageFlags, SlashCommandBuilder } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineCommand } from "@app/discord/commands/defineCommand";
import updateRsLeagueScores from "@app/jobs/definitions/updateRsLeagueScores";
import * as RsLeagueUser from "@app/modules/rsLeagueUser";
import { isTextChannel } from "@app/utils/discord";

enum OptionName {
  Name = "name",
}

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("rs-league")
    .setDescription("OSRS seasonal league rankings between members")
    .addStringOption((option) =>
      option
        .setName(OptionName.Name)
        .setDescription("Hiscores name")
        .setRequired(true),
    ),

  execute: async (ctx, interaction) => {
    const scoresChannel = ctx
      .guild()
      .channels.cache.get(staticConfig.channels.runescapeLeagues);

    if (!isTextChannel(scoresChannel)) {
      await interaction.reply({
        flags: [MessageFlags.Ephemeral],
        content: "The scores list channel is not found",
      });
      return;
    }

    const name = interaction.options.getString(OptionName.Name, true);

    await RsLeagueUser.setName(ctx, interaction.user.id, name);

    await Promise.all([
      updateRsLeagueScores.run(ctx),
      interaction.reply({
        flags: [MessageFlags.Ephemeral],
        content: `Added you to the <#${scoresChannel.id}> scores list`,
      }),
    ]);
  },
});

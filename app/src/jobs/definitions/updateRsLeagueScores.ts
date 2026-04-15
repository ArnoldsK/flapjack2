import type { APIEmbed, GuildMember, TextChannel } from "discord.js";
import hiscores from "osrs-json-hiscores";

import { staticConfig } from "@app/config/static";
import { Unicode } from "@app/constants";
import { defineJob } from "@app/jobs/defineJob";
import * as RsLeagueUser from "@app/modules/rsLeagueUser";
import { isTextChannel } from "@app/utils/discord";

interface PlayerData {
  member: GuildMember;
  name: string;
  rank: number;
  score: number;
}

export default defineJob({
  id: "updateRsLeagueScores",

  schedule: "0 * * * *", // every hour at the 0th minute

  description: "Updates RuneScape Leagues user scores",

  // productionOnly: true,
  productionOnly: false,

  run: async (ctx) => {
    const scoresChannel = ctx
      .guild()
      .channels.cache.get(staticConfig.channels.runescapeLeagues);
    if (!isTextChannel(scoresChannel)) return;

    const users = await RsLeagueUser.getAll(ctx);
    if (!users.length) return;

    const notFoundUserIds: string[] = [];
    const players: PlayerData[] = [];

    // Populate players
    for (const user of users) {
      const member = ctx.guild().members.cache.get(user.user_id);

      if (!member) {
        notFoundUserIds.push(user.user_id);
        continue;
      }

      players.push({
        member,
        name: user.name,
        rank: 0,
        score: 0,
      });
    }

    // Intentionally not using Promise.all
    for (const [i, player] of players.entries()) {
      try {
        const stats = await hiscores.getStatsByGamemode(
          player.name,
          "seasonal",
        );
        const { rank, score } = stats.leaguePoints;
        // ! Mutate player numbers
        players[i]!.rank = rank;
        players[i]!.score = score;
      } catch {
        notFoundUserIds.push(player.member.id);
      }
    }

    // ! Mutate sort by rank
    players.sort((a, b) => a.rank - b.rank);

    await RsLeagueUser.removeByUserId(ctx, notFoundUserIds);

    await updateScoresChannel({
      channel: scoresChannel,
      players,
    });
  },
});

const updateScoresChannel = async ({
  channel,
  players,
}: {
  channel: TextChannel;
  players: PlayerData[];
}) => {
  const embed: APIEmbed = {
    title: "Test",
    description: players
      .map((player, i) => {
        const url = new URL(
          "/m=hiscore_oldschool_seasonal/hiscorepersonal",
          "https://secure.runescape.com",
        );
        url.searchParams.set("user1", player.name);

        return [
          [
            `${i + 1}. <@${player.member.user.id}>`,
            `([${player.name}](<${url}>))`,
          ].join(" "),
          [`  Rank: ${player.rank}`, `Score: ${player.score}`].join(
            ` ${Unicode.Middot} `,
          ),
        ].join("\n");
      })
      .join("\n"),
  };

  const messages = await channel.messages.fetch({ limit: 20 });
  const previous = messages.find((m) => m.author.id === channel.client.user.id);

  if (previous) {
    await previous.edit({ embeds: [embed] });
  } else {
    await channel.send({ embeds: [embed] });
  }
};

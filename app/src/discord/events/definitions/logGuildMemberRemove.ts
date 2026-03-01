import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { GuildMember } from "discord.js";
import { AuditLogEvent, ChannelType, Events } from "discord.js";

import { staticConfig } from "@app/config/static";
import { Color } from "@app/constants";
import { defineEvent } from "@app/discord/events/defineEvent";
import { embedAuthor } from "@app/utils/discord";

dayjs.extend(relativeTime);

const getAuditLogsData = async (
  member: GuildMember,
): Promise<{ banned: boolean; kicked: boolean; reason: string | null }> => {
  let auditLogs;
  try {
    auditLogs = await member.guild.fetchAuditLogs({ limit: 5 });
  } catch {
    return { banned: false, kicked: false, reason: null };
  }

  const bannedEntry = auditLogs.entries.find(
    (entry) =>
      entry.targetId === member.id &&
      entry.action === AuditLogEvent.MemberBanAdd,
  );
  const kickedEntry = auditLogs.entries.find(
    (entry) =>
      entry.targetId === member.id && entry.action === AuditLogEvent.MemberKick,
  );

  const reason = bannedEntry?.reason ?? kickedEntry?.reason ?? null;

  return {
    banned: Boolean(bannedEntry),
    kicked: Boolean(kickedEntry),
    reason,
  };
};

export default defineEvent({
  event: Events.GuildMemberRemove,
  once: false,
  productionOnly: true,
  run: async (_ctx, member) => {
    if (member.partial) return;

    const channel = member.guild.channels.cache.get(staticConfig.channels.logs);
    if (!channel || channel.type !== ChannelType.GuildText) return;

    const joinedAt = member.joinedAt
      ? dayjs(member.joinedAt).fromNow()
      : "unknown";
    const roles = member.roles.cache
      .filter((role) => role.id !== member.guild.id)
      .map((role) => role.name);

    const { banned, kicked, reason } = await getAuditLogsData(member);

    let title = "Left the server";
    if (banned) {
      title = "Banned from the server";
    } else if (kicked) {
      title = "Kicked from the server";
    }

    const description = [
      reason ? `Reason: ${reason}` : "",
      `Joined: ${joinedAt}`,
      roles.length > 0 ? `Roles: ${roles.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await channel.send({
      embeds: [
        {
          color: Color.Red,
          author: embedAuthor(member),
          title,
          description,
        },
      ],
    });
  },
});

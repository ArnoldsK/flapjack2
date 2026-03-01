import type { GuildMember } from "discord.js";

export const getRoleIdsFromMember = (member: GuildMember): string[] => {
  const guildId = member.guild.id;

  return [...member.roles.cache.values()]
    .map((role) => role.id)
    .filter((id) => id !== guildId)
    .sort((a, b) => a.localeCompare(b));
};

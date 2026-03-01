import type { APIEmbedAuthor, GuildMember } from "discord.js";

export const embedAuthor = (member: GuildMember): APIEmbedAuthor => ({
  name: member.displayName,
  icon_url: member.displayAvatarURL({
    extension: "png",
    forceStatic: true,
    size: 32,
  }),
});

export const isDiscordAttachmentUrl = (value: string): boolean => {
  try {
    const url = new URL(value);

    return (
      (url.hostname === "cdn.discordapp.com" ||
        url.hostname === "media.discordapp.net") &&
      url.pathname.startsWith("/attachments")
    );
  } catch {
    return false;
  }
};

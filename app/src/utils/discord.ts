import type {
  APIEmbedAuthor,
  Channel,
  GuildMember,
  TextChannel,
} from "discord.js";
import { ChannelType } from "discord.js";

export const isTextChannel = (
  channel: Channel | null | undefined,
): channel is TextChannel => {
  return !!channel && channel.type === ChannelType.GuildText;
};

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

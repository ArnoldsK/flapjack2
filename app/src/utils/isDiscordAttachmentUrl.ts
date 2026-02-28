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

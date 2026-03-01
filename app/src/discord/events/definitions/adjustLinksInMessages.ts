import { Events } from "discord.js";

import { Unicode } from "@app/constants";
import { defineEvent } from "@app/discord/events/defineEvent";

const SS_MOBILE_URL = /(https:\/\/m\.ss\.(?:lv|com)(?:\/.+\.html))/g;
const TWITTER_STATUS_URL =
  /(https:\/\/((?:twitter|x)\.com)\/\w+\/status\/\d+)/i;
const EMOJI_PATTERN =
  /[\uD800-\uDBFF]|[\u2702-\u27B0]|[\uF680-\uF6C0]|[\u24C2-\uF251]/g;
const INSTAGRAM_REEL_URL =
  /(?:https?:\/\/)(?:www\.)?instagram\.com\/?([a-zA-Z0-9._-]+)?\/([p]+)?([reel]+s?)\/([a-zA-Z0-9-_.]+)\/?([0-9]+)?/i;

const EMOJI_SPAM_THRESHOLD = 5;
const SS_DESKTOP_PREFIX = Unicode.ZeroWidthSpace;

export default defineEvent({
  event: Events.MessageCreate,
  once: false,
  productionOnly: true,
  run: async (_ctx, message) => {
    if (message.author.bot) return;
    const content = message.content;
    if (!content) return;

    // SS mobile → desktop links
    if (content.includes("https://m.ss.")) {
      const matches = content.match(SS_MOBILE_URL);
      const urls = [...new Set(matches ?? [])].map((url) =>
        url.replace("m.", "www."),
      );
      if (urls.length > 0) {
        await message.reply(
          SS_DESKTOP_PREFIX + urls.map((url) => `<${url}>`).join("\n"),
        );
      }
    }

    // Twitter/X → fxtwitter
    if (
      content.includes("https://twitter.com") ||
      content.includes("https://x.com")
    ) {
      await message.suppressEmbeds(true);
      const matches = content.match(TWITTER_STATUS_URL);
      const url = matches?.[1];
      const hostname = matches?.[2];
      const ignore = url !== undefined && content.includes(`<${url}>`);
      if (!ignore && url !== undefined && hostname !== undefined) {
        const fxUrl = url.replace(hostname, "fxtwitter.com");
        await message.reply(`[tweet](${fxUrl}) embed fix`);
      }
    }

    // Emoji-heavy messages: suppress embeds
    const emojiCount = [...content.matchAll(EMOJI_PATTERN)].length;
    if (emojiCount >= EMOJI_SPAM_THRESHOLD) {
      await message.suppressEmbeds(true);
    }

    // Instagram reels → kkinstagram
    if (content.includes("instagram.com")) {
      const matches = content.match(INSTAGRAM_REEL_URL);
      const reelId = matches?.[4];
      if (reelId !== undefined) {
        await message.suppressEmbeds(true);
        const url = `https://kkinstagram.com/reel/${reelId}/`;
        await message.reply(`[reel](${url}) embed fix`);
      }
    }
  },
});

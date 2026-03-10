import { Events, type GuildMember, type Message } from "discord.js";
import { z } from "zod";

import { staticConfig } from "@app/config/static";
import { defineEvent } from "@app/discord/events/defineEvent";
import * as Video from "@app/modules/video";

function isNonNullish<T>(x: T): x is NonNullable<T> {
  return x != null;
}

const getVideoIds = (content: string): string[] => {
  const regex =
    /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu\.be))(\/(?:[\w-]+\?v=|embed\/|live\/|v\/)?)([\w-]+)(\S+)?/g;
  const matches = [...content.matchAll(regex)];
  const videoIds = matches.map((m) => m[5]).filter((id): id is string => !!id);

  return [...new Set(videoIds)];
};

const getDeArrowTitle = async (videoId: string): Promise<string | null> => {
  const url = new URL("https://dearrow.minibomba.pro/sbserver/api/branding");
  url.searchParams.set("videoID", videoId);
  try {
    const res = await fetch(url);
    const data = (await res.json()) as unknown;
    const { titles } = z
      .object({
        titles: z.array(
          z.object({
            title: z.string(),
            original: z.boolean(),
          }),
        ),
      })
      .parse(data);
    return titles.find((t) => !t.original)?.title ?? null;
  } catch {
    return null;
  }
};

const getVideoDetails = async (videoUrl: string) => {
  const url = new URL("https://noembed.com/embed");
  url.searchParams.set("dataType", "json");
  url.searchParams.set("url", videoUrl);
  try {
    const res = await fetch(url);
    const data = (await res.json()) as unknown;
    return z
      .object({
        provider_name: z.literal("YouTube"),
        title: z.string(),
        author_url: z.string().url(),
        author_name: z.string(),
        thumbnail_url: z.string().url(),
        type: z.literal("video"),
      })
      .parse(data);
  } catch {
    return null;
  }
};

const getVideoData = async ({
  videoId,
  message,
  member,
  deArrowTitle,
}: {
  videoId: string;
  message: Message;
  member: GuildMember;
  deArrowTitle: string | null;
}): Promise<Video.db.InsertInput | null> => {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const details = await getVideoDetails(videoUrl);
  if (!details) return null;
  return {
    user_id: member.id,
    user_display_name: member.displayName,
    channel_id: message.channel.id,
    message_id: message.id,
    video_url: videoUrl,
    video_id: videoId,
    title: details.title,
    dearrow_title: deArrowTitle,
    thumbnail_url: details.thumbnail_url,
    author_name: details.author_name,
    author_url: details.author_url,
  };
};

const sendDeArrowTitles = async ({
  message,
  deArrowTitles,
}: {
  message: Message;
  deArrowTitles: Map<string, string | null>;
}): Promise<void> => {
  const titles = [...deArrowTitles.values()].filter(isNonNullish);
  if (titles.length === 0) return;
  await message.reply({
    embeds: titles.map((description) => ({ description })),
    allowedMentions: { users: [], repliedUser: false },
  });
};

export default defineEvent({
  event: Events.MessageCreate,
  once: false,
  productionOnly: true,
  run: async (ctx, message) => {
    const { author, member, content } = message;
    if (author.bot || !member || !content) return;

    const messageVideoIds = getVideoIds(content);
    if (messageVideoIds.length === 0) return;

    const deArrowTitles = new Map(
      await Promise.all(
        messageVideoIds.map(
          async (videoId) => [videoId, await getDeArrowTitle(videoId)] as const,
        ),
      ),
    );

    if (message.channel.id === staticConfig.channels.videos) {
      const existingIds = await Video.getExistingVideoIds(ctx, messageVideoIds);
      const newVideoIds = messageVideoIds.filter(
        (id) => !existingIds.includes(id),
      );
      if (newVideoIds.length > 0) {
        const rows = (
          await Promise.all(
            newVideoIds.map((videoId) =>
              getVideoData({
                videoId,
                message,
                member,
                deArrowTitle: deArrowTitles.get(videoId) ?? null,
              }),
            ),
          )
        ).filter(isNonNullish);
        if (rows.length > 0) {
          await Video.insertMany(ctx, rows);
        }
      }
    }

    await sendDeArrowTitles({ message, deArrowTitles });
  },
});

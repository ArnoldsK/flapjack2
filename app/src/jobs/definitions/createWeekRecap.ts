import path from "node:path";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { Attachment } from "discord.js";

dayjs.extend(isoWeek);
import { ChannelType, type Message, type TextChannel } from "discord.js";

import { staticConfig } from "@app/config/static";
import type { AppContext } from "@app/context";
import { defineJob } from "@app/jobs/defineJob";
import * as Hosting from "@app/modules/hosting";
import * as StaticData from "@app/modules/staticData";
import { isDiscordAttachmentUrl, isTextChannel } from "@app/utils/discord";
import type { WeekRecapMessage } from "@shared/types";

const MIN_UNIQUE_REACTORS_FOR_RECAP = 5;

const getUrlFileExtension = (fileUrl: string): string =>
  path.extname(new URL(fileUrl).pathname);

const fetchMessagesUntil = async (
  channel: TextChannel,
  endDate: Date,
  lastId?: string,
): Promise<Message[]> => {
  const messages: Message[] = [
    ...(await channel.messages.fetch({ limit: 100, before: lastId })).values(),
  ];

  for (let i = 0; i < messages.length; i++) {
    if (messages[i].createdAt.getTime() < endDate.getTime()) {
      return messages.slice(0, i);
    }
  }

  if (messages.length === 0) {
    return messages;
  }

  const lastMessage = messages[messages.length - 1];

  return [
    ...messages,
    ...(await fetchMessagesUntil(channel, endDate, lastMessage?.id)),
  ];
};

const getWeekMessages = async (ctx: AppContext): Promise<Message[]> => {
  const guild = ctx.guild();

  const isDev = ctx.env.NODE_ENV === "development";
  const endDate: Date = isDev
    ? dayjs().subtract(1, "day").toDate()
    : dayjs().subtract(1, "week").startOf("isoWeek").toDate(); // last week Monday 0:00
  const startDate: Date = isDev
    ? dayjs().toDate()
    : dayjs().startOf("isoWeek").toDate(); // current week Monday 0:00 (exclusive cap)

  const channels = guild.channels.cache.filter(
    (ch): ch is TextChannel =>
      ch.type === ChannelType.GuildText &&
      staticConfig.recapChannelIds.includes(ch.id),
  );

  const messageGroups = await Promise.all(
    [...channels.values()].map((channel) => {
      console.log("> Recap > Fetching messages for", channel.name);

      return fetchMessagesUntil(channel, endDate);
    }),
  );

  const endTime = endDate.getTime();
  const startTime = startDate.getTime();

  return messageGroups
    .flat()
    .filter(
      (message) =>
        !message.system &&
        !message.author.bot &&
        message.member &&
        message.createdAt.getTime() >= endTime &&
        message.createdAt.getTime() < startTime,
    );
};

const parseAttachment = (
  attachment:
    | (Pick<Attachment, "id" | "url"> &
        Partial<Pick<Attachment, "contentType">>)
    | undefined,
): WeekRecapMessage["firstAttachment"] => {
  if (!attachment) {
    return null;
  }

  const url = attachment.url;
  const isImage =
    !!attachment.contentType?.startsWith("image/") ||
    /(?:png|jpe?g|gif)/i.test(url);
  const isVideo =
    !!attachment.contentType?.startsWith("video/") ||
    /(?:mp4|mov|webm)/i.test(url);

  return {
    id: attachment.id,
    isImage,
    isVideo,
    url,
  };
};

const parseRecapMessage = async (
  message: Message,
): Promise<WeekRecapMessage> => {
  const guild = message.guild;
  if (!guild) throw new Error("Guild is not defined");

  const channel = message.channel;
  if (!isTextChannel(channel)) {
    throw new Error("Channel is not a text channel");
  }

  const member = message.member;
  if (!member) throw new Error("Member is not defined");

  const isPrivate = staticConfig.recapPrivateChannelIds.includes(channel.id);

  const reactionUserIds = new Set<string>();
  for (const reaction of message.reactions.cache.values()) {
    const users = await reaction.users.fetch();
    for (const [, user] of users) {
      reactionUserIds.add(user.id);
    }
  }

  return {
    id: message.id,
    createdAt: message.createdAt,
    content: isPrivate ? "" : message.cleanContent.trim(),
    firstAttachment: isPrivate
      ? null
      : parseAttachment(message.attachments.first()),
    guild: { id: guild.id },
    channel: { id: channel.id, name: channel.name },
    member: {
      id: member.id,
      displayName: member.nickname ?? member.displayName,
      username: member.user.username,
    },
    reactions: [...message.reactions.cache.values()].map((reaction) => ({
      emoji: {
        identifier: reaction.emoji.identifier,
        id: reaction.emoji.id,
        name: reaction.emoji.name,
        url: reaction.emoji.imageURL() ?? "",
      },
      count: reaction.count,
    })),
    reactionCount: reactionUserIds.size,
  };
};

const filterByReactionCount = (
  messages: WeekRecapMessage[],
): WeekRecapMessage[] =>
  messages.filter((el) => el.reactionCount >= MIN_UNIQUE_REACTORS_FOR_RECAP);

const uploadMessageDataAttachments = async (
  ctx: AppContext,
  messages: WeekRecapMessage[],
): Promise<WeekRecapMessage[]> => {
  try {
    await Hosting.deleteAllFiles(ctx);

    return await Promise.all(
      messages.map(async (message) => {
        let attachment = message.firstAttachment;
        if (!attachment && isDiscordAttachmentUrl(message.content)) {
          attachment = parseAttachment({
            id: message.id,
            url: message.content,
          });
          message.content = "";
        }

        if (attachment) {
          const hosted = await Hosting.uploadUrlFile(ctx, [
            {
              filename: attachment.id + getUrlFileExtension(attachment.url),
              url: attachment.url,
            },
          ]);
          const [hostedFile] = hosted;

          if (hostedFile) {
            attachment = { ...attachment, url: hostedFile.url };
          } else {
            attachment = {
              ...attachment,
              isImage: false,
              isVideo: false,
            };
          }

          message.firstAttachment = attachment;
        }

        return message;
      }),
    );
  } catch (error) {
    console.error("> Failed to upload images to CDN", error);

    return messages;
  }
};

const sendAnnouncement = async (ctx: AppContext): Promise<void> => {
  if (ctx.env.NODE_ENV === "development") {
    return;
  }

  const guild = ctx.guild();
  const channel = guild.channels.cache.get(
    staticConfig.channels.announcements,
  ) as TextChannel | undefined;

  if (!channel) {
    return;
  }

  const content = `New weekly recap at <https://pepsidog.lv/recap>`;

  const messages = await channel.messages.fetch({ limit: 20 });
  const previous = messages.find(
    (m) => m.author.id === guild.client.user?.id && m.content === content,
  );

  if (previous) {
    await previous.delete();
  }

  await channel.send(content);
};

export default defineJob({
  id: "createWeekRecap",

  schedule: "0 1 * * 1", // every Monday at 1:00 AM

  description: "Create week recap",

  productionOnly: true,

  run: async (ctx) => {
    const weekMessages = await getWeekMessages(ctx);
    if (weekMessages.length === 0) {
      console.log("> Recap > No messages found");

      return;
    }

    let recapMessages = await Promise.all(weekMessages.map(parseRecapMessage));
    recapMessages = filterByReactionCount(recapMessages);
    recapMessages = await uploadMessageDataAttachments(ctx, recapMessages);

    if (recapMessages.length === 0) {
      console.log("> Recap > No messages found after filtering");

      return;
    }

    await StaticData.set(ctx, "weekRecap", {
      createdAt: new Date(),
      messages: recapMessages,
    });

    await sendAnnouncement(ctx);
  },
});

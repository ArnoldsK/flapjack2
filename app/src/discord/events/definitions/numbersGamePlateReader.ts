import type { Message } from "discord.js";
import { Events, PermissionFlagsBits } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineEvent } from "@app/discord/events/defineEvent";
import * as PlateRecogniser from "@app/modules/plateRecogniser";

const delay = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const formatRegionFlag = (region: string): string =>
  `:flag_${region.toLowerCase().slice(0, 2)}: `;

export default defineEvent({
  event: Events.MessageCreate,
  once: false,
  productionOnly: true,
  run: async (ctx, message) => {
    if (message.channel.id !== staticConfig.channels.numbersGame) return;

    if (await handleEmbedRemove(message)) {
      return;
    }

    if (await handleEmbedModify(message)) {
      return;
    }

    const imageAttachmentUrls = message.attachments
      .filter(
        (el) =>
          el.contentType?.startsWith("image/") &&
          !el.contentType.endsWith("gif"),
      )
      .map((el) => el.url);
    if (!imageAttachmentUrls.length) return;

    try {
      const allResponses = [];

      for (const [index, imageUrl] of imageAttachmentUrls.entries()) {
        if (index > 0) {
          await delay(1000);
        }

        allResponses.push(
          await PlateRecogniser.plateReader(ctx, {
            imageUrl,
          }),
        );
      }

      const results = allResponses.flat();
      if (results.length === 0) return;

      const plates = results.map((result) => {
        const flag =
          result.region !== "unknown" ? formatRegionFlag(result.region) : "";

        return `${flag}${result.plate}`;
      });

      message.reply({
        embeds: plates.map((plate) => ({
          description: plate,
        })),
      });
    } catch (error) {
      console.error("Failed to recognise license plates", error);
    }
  },
});

const handleEmbedRemove = async (message: Message): Promise<boolean> => {
  const { member, content, reference, channel } = message;

  if (
    !member?.permissions.has(PermissionFlagsBits.Administrator) ||
    !reference?.messageId
  ) {
    return false;
  }

  const embedNrRegExp = /^remove (\d+)$/;
  const matches = embedNrRegExp.exec(content);

  if (!matches) {
    return false;
  }

  const embedNr = parseInt(matches[1] ?? "");
  if (!Number.isFinite(embedNr)) {
    return false;
  }

  const refMessage = channel.messages.cache.get(reference.messageId);
  if (!refMessage || refMessage.author.id !== message.client.user.id) {
    return false;
  }

  if (typeof refMessage.embeds[embedNr - 1] === "undefined") {
    return false;
  }

  await Promise.all([
    refMessage.edit({
      embeds: refMessage.embeds.filter((_el, index) => index !== embedNr - 1),
    }),
    message.delete(),
  ]);

  return true;
};

const handleEmbedModify = async (message: Message): Promise<boolean> => {
  const { member, content, reference, channel } = message;

  if (
    !member?.permissions.has(PermissionFlagsBits.Administrator) ||
    !reference?.messageId
  ) {
    return false;
  }

  const editRegExp = /^edit (\d+) (?:(\w+) )?(.+)$/;
  const matches = editRegExp.exec(content);

  if (!matches) {
    return false;
  }

  const embedNr = parseInt(matches[1] ?? "");
  if (!Number.isFinite(embedNr)) {
    return false;
  }

  const region = matches[2];
  const plate = matches[3] ?? "";
  if (!plate) {
    return false;
  }

  const newContent = region ? `${formatRegionFlag(region)}${plate}` : plate;

  const refMessage = channel.messages.cache.get(reference.messageId);
  if (!refMessage || refMessage.author.id !== message.client.user.id) {
    return false;
  }

  if (typeof refMessage.embeds[embedNr - 1] === "undefined") {
    return false;
  }

  await Promise.all([
    refMessage.edit({
      embeds: refMessage.embeds.map((el, index) => {
        if (index !== embedNr - 1) {
          return el;
        }

        return {
          ...el,
          description: newContent,
        };
      }),
    }),
    message.delete(),
  ]);

  return true;
};

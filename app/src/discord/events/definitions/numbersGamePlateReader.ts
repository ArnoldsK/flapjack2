import type { Message } from "discord.js";
import { Events, PermissionFlagsBits } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineEvent } from "@app/discord/events/defineEvent";
import * as PlateRecogniser from "@app/modules/plateRecogniser";

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

    const attachment = message.attachments.first();
    if (!attachment) return;
    if (!attachment.contentType?.startsWith("image/")) return;

    try {
      const response = await PlateRecogniser.plateReader(ctx, {
        imageUrl: attachment.url,
      });
      if (response.length === 0) return;

      const plates = response.map((result) => {
        const flag =
          result.region !== "unknown" ? `:flag_${result.region}: ` : "";

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

  const embedNrRegExp = /^remove embed (\d+)$/;
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

  const embedNrRegExp = /^edit embed (\d+) (.+)$/;
  const matches = embedNrRegExp.exec(content);

  if (!matches) {
    return false;
  }

  const embedNr = parseInt(matches[1] ?? "");
  if (!Number.isFinite(embedNr)) {
    return false;
  }

  const newContent = matches[2] ?? "";
  if (!newContent) {
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

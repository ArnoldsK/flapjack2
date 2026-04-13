import { Events } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineEvent } from "@app/discord/events/defineEvent";
import * as PlateRecogniser from "@app/modules/plateRecogniser";

export default defineEvent({
  event: Events.MessageCreate,
  once: false,
  productionOnly: true,
  run: async (ctx, message) => {
    if (message.channel.id !== staticConfig.channels.numbersGame) return;

    const attachment = message.attachments.first();
    if (!attachment) return;
    if (!attachment.contentType?.startsWith("image/")) return;

    try {
      const response = await PlateRecogniser.plateReader(ctx, {
        imageUrl: attachment.url,
      });
      if (response.length === 0) return;

      message.reply({
        embeds: [
          {
            title: "Plate reader",
            color: message.member?.displayColor,
            fields: response.map((result) => ({
              name: `:flag_${result.region}: ${result.plate}`,
              value: result.vehicleType,
              inline: true,
            })),
          },
        ],
      });
    } catch (error) {
      console.error("Failed to recognise license plates", error);
    }
  },
});

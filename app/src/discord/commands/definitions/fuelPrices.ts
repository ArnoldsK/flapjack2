import { MessageFlags, SlashCommandBuilder } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineCommand } from "@app/discord/commands/defineCommand";
import * as Canvas from "@app/modules/canvas";
import * as FuelPrice from "@app/modules/fuelPrice";

export default defineCommand({
  version: 2,

  data: new SlashCommandBuilder()
    .setName("fuel-prices")
    .setDescription("Show latest aggregated fuel prices (95, 98, Diesel, LPG)"),

  execute: async (ctx, interaction) => {
    const ephemeral = interaction.channelId !== staticConfig.channels.auto;

    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });

    const rows = await FuelPrice.getLatest(ctx);
    const previousRows = await FuelPrice.getPreviousBatch(ctx, rows);
    const cards = FuelPrice.utils.buildCards(rows, previousRows);
    const imageBuffer = Canvas.getFuelPricesImage(cards);

    await interaction.editReply({
      files: [{ attachment: imageBuffer, name: "fuel-prices.png" }],
    });
  },
});

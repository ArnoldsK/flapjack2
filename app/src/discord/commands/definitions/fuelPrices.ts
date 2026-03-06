import { MessageFlags, SlashCommandBuilder } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineCommand } from "@app/discord/commands/defineCommand";
import type { FuelPriceCard } from "@app/modules/canvas";
import * as Canvas from "@app/modules/canvas";
import * as FuelPrice from "@app/modules/fuelPrice";

const DISPLAY_ORDER: FuelPrice.db.FuelType[] = ["95", "98", "Diesel", "LPG"];

export default defineCommand({
  version: 2,

  data: new SlashCommandBuilder()
    .setName("fuel-prices")
    .setDescription("Show latest aggregated fuel prices (95, 98, Diesel, LPG)"),

  execute: async (ctx, interaction) => {
    const ephemeral = ![
      staticConfig.channels.auto,
      staticConfig.channels.logs,
    ].includes(interaction.channelId);

    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });

    const rows = await FuelPrice.getAll(ctx);
    const previousRows = await FuelPrice.getPreviousBatch(ctx, rows);

    const byType = new Map(rows.map((row) => [row.fuel_type, row]));
    const prevByType = new Map(previousRows.map((row) => [row.fuel_type, row]));

    const cards: FuelPriceCard[] = DISPLAY_ORDER.flatMap((fuelType) => {
      const row = byType.get(fuelType);
      if (!row) return [];

      const prev = prevByType.get(fuelType);

      return {
        fuelType,
        price: Number(row.price),
        previousPrice: prev ? Number(prev.price) : null,
        stationNames: row.station_names,
      };
    });

    const imageBuffer = Canvas.getFuelPricesImage(cards);

    await interaction.editReply({
      files: [{ attachment: imageBuffer, name: "fuel-prices.png" }],
    });
  },
});

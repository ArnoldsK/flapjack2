import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { MessageFlags, SlashCommandBuilder } from "discord.js";

import { staticConfig } from "@app/config/static";
import { defineCommand } from "@app/discord/commands/defineCommand";
import * as FuelPrice from "@app/modules/fuelPrice";

dayjs.extend(relativeTime);

const DISPLAY_ORDER: FuelPrice.db.FuelType[] = ["95", "98", "Diesel", "LPG"];

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("fuel-prices")
    .setDescription("Show latest aggregated fuel prices (95, 98, Diesel, LPG)"),

  execute: async (ctx, interaction) => {
    const isAutoChannel = interaction.channelId === staticConfig.channels.auto;

    await interaction.deferReply({
      flags: !isAutoChannel ? MessageFlags.Ephemeral : undefined,
    });

    const rows = await FuelPrice.getAll(ctx);
    const byType = new Map(rows.map((row) => [row.fuel_type, row]));

    const fields = DISPLAY_ORDER.map((fuelType) => {
      const row = byType.get(fuelType);
      const value = row != null ? Number(row.price).toFixed(3) : "-";

      return { name: fuelType, value, inline: true };
    });

    const latestCreated =
      rows.length > 0
        ? new Date(Math.max(...rows.map((r) => r.created_at.getTime())))
        : null;
    const footerText =
      latestCreated != null
        ? `Updated ${dayjs(latestCreated).fromNow()}`
        : "No data";

    await interaction.editReply({
      embeds: [
        {
          title: "Fuel prices (EUR/l)",
          fields,
          footer: { text: footerText },
        },
      ],
    });
  },
});

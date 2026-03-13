import * as cheerio from "cheerio";

import { staticConfig } from "@app/config/static";
import { defineJob } from "@app/jobs/defineJob";
import * as Canvas from "@app/modules/canvas";
import type { FuelType } from "@app/modules/fuelPrice";
import * as FuelPrice from "@app/modules/fuelPrice";
import { isTextChannel } from "@app/utils/discord";
import { checkUnreachable } from "@shared/utils/error";

interface SiteFuelEntry {
  type: FuelType;
  price: number;
}

const SITES = {
  Neste: "https://www.neste.lv/lv/content/degvielas-cenas",
  Viada: "https://www.viada.lv/zemakas-degvielas-cenas/",
};

type FuelStationName = keyof typeof SITES;

export default defineJob({
  id: "getFuelPrices",

  schedule: "0 * * * *", // every hour at the 0th minute

  description:
    "Scrapes fuel prices: Neste for 95, 98, Diesel; Viada for LPG. Aggregates by fuel type.",

  productionOnly: true,

  run: async (ctx) => {
    const siteQueries = await Promise.allSettled(
      (Object.entries(SITES) as [FuelStationName, string][]).map(
        async ([name, url]) => {
          try {
            const response = await fetch(url);
            const html = await response.text();

            return { name, $: cheerio.load(html) };
          } catch (error) {
            console.error(`[job:getFuelPrices] Failed to fetch ${url}:`, error);

            return null;
          }
        },
      ),
    );

    const siteQueriesByName = new Map<FuelStationName, cheerio.CheerioAPI>();
    for (const result of siteQueries) {
      if (result.status === "fulfilled" && result.value !== null) {
        siteQueriesByName.set(result.value.name, result.value.$);
      }
    }

    const entriesWithStation: Array<{
      type: FuelType;
      price: number;
      stationName: string;
    }> = [];

    for (const name of Object.keys(SITES) as FuelStationName[]) {
      const $ = siteQueriesByName.get(name);
      if (!$) continue;

      const siteEntries = getSiteFuelPrices(name, $);
      for (const entry of siteEntries) {
        if (name === "Viada" && entry.type !== "LPG") continue;
        if (name === "Neste" && entry.type === "LPG") continue;

        entriesWithStation.push({
          type: entry.type,
          price: entry.price,
          stationName: name,
        });
      }
    }

    const byType = new Map<
      FuelType,
      Array<{ price: number; stationName: string }>
    >();
    for (const { type, price, stationName } of entriesWithStation) {
      const cur = byType.get(type);
      if (!cur) {
        byType.set(type, [{ price, stationName }]);
      } else {
        cur.push({ price, stationName });
      }
    }

    const existingRows = await FuelPrice.getLatest(ctx);
    const existingByType = new Map(
      existingRows.map((row) => [row.fuel_type, row]),
    );

    const resolved = new Map<
      FuelType,
      { price: number; station_names: string[] }
    >();

    let hasChanges = false;

    for (const [fuelType, entries] of byType) {
      const minPrice = Math.min(...entries.map((e) => e.price));
      const priceRounded = Number(minPrice.toFixed(3));
      const uniqueStations = [
        ...new Set(
          entries.filter((e) => e.price === minPrice).map((e) => e.stationName),
        ),
      ];

      resolved.set(fuelType, {
        price: priceRounded,
        station_names: uniqueStations,
      });

      const existing = existingByType.get(fuelType);
      if (
        existing &&
        Number(existing.price) === priceRounded &&
        JSON.stringify(existing.station_names) ===
          JSON.stringify(uniqueStations)
      ) {
        continue;
      }

      hasChanges = true;
    }

    if (hasChanges) {
      for (const [fuelType, data] of resolved) {
        await FuelPrice.insert(ctx, {
          fuel_type: fuelType,
          price: data.price,
          station_names: data.station_names,
        });
      }

      for (const [fuelType, existing] of existingByType) {
        if (resolved.has(fuelType)) continue;

        await FuelPrice.insert(ctx, {
          fuel_type: fuelType,
          price: Number(existing.price),
          station_names: existing.station_names,
        });
      }
    }

    if (hasChanges) {
      const channel = ctx.client.channels.cache.get(staticConfig.channels.auto);
      if (!isTextChannel(channel)) return;

      const currentRows = await FuelPrice.getLatest(ctx);
      const previousRows = await FuelPrice.getPreviousBatch(ctx, currentRows);
      const cards = FuelPrice.utils.buildCards(currentRows, previousRows);
      const imageBuffer = Canvas.getFuelPricesImage(cards);

      await channel.send({
        files: [{ attachment: imageBuffer, name: "fuel-prices.png" }],
      });
    }
  },
});

const getSiteFuelPrices = (
  name: FuelStationName,
  $: cheerio.CheerioAPI,
): SiteFuelEntry[] => {
  switch (name) {
    case "Neste":
      return getNesteFuelPrices($);
    case "Viada":
      return getViadaFuelPrices($);
    default:
      checkUnreachable(name);
      return [];
  }
};

const parsePriceFromText = (text: string): number | null => {
  const match = text.replace(/\s+/g, " ").match(/\d+[.,]\d{2,3}/);

  if (!match) return null;

  const normalized = match[0].replace(",", ".");
  const value = parseFloat(normalized);

  return Number.isFinite(value) ? value : null;
};

const NESTE_LABEL_TO_TYPE: Record<string, FuelType> = {
  "neste futura 95": "95",
  "neste futura 98": "98",
  "neste futura d": "Diesel",
};

const getNesteFuelPrices = ($: cheerio.CheerioAPI): SiteFuelEntry[] => {
  const entries: SiteFuelEntry[] = [];

  $("table tbody tr").each((_, el) => {
    const row = $(el);
    const cells = row.find("td");
    if (cells.length < 2) return;

    const name = cells.eq(0).text().replace(/\s+/g, " ").trim().toLowerCase();
    const type = NESTE_LABEL_TO_TYPE[name];
    if (!type) return;

    const priceText = cells.eq(1).text();
    const price = parsePriceFromText(priceText);
    if (price === null) return;

    entries.push({ type, price });
  });

  return entries;
};

/** Viada: we only use LPG; fuel type is in img src (e.g. gaze). */
const getViadaLPGFromImgSrc = (src: string): boolean =>
  src.toLowerCase().includes("gaze");

const getViadaFuelPrices = ($: cheerio.CheerioAPI): SiteFuelEntry[] => {
  const entries: SiteFuelEntry[] = [];

  $(".the_content_wrapper table tbody tr").each((_, el) => {
    const row = $(el);
    const cells = row.find("td");
    if (cells.length < 2) return;

    const firstCell = cells.eq(0);
    const img = firstCell.find("img").attr("src");
    if (!img) return;

    if (!getViadaLPGFromImgSrc(img)) return;

    const priceText = cells.eq(1).text();
    const price = parsePriceFromText(priceText);
    if (price === null) return;

    entries.push({ type: "LPG", price });
  });

  return entries;
};

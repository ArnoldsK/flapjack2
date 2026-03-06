import * as cheerio from "cheerio";

import { defineJob } from "@app/jobs/defineJob";
import type { FuelType } from "@app/modules/fuelPrice";
import * as FuelPrice from "@app/modules/fuelPrice";
import { checkUnreachable } from "@shared/utils/error";

type FuelStationName = "Neste" | "CircleK" | "Virsi";

interface SiteFuelEntry {
  type: FuelType;
  price: number;
}

const SITES: Record<FuelStationName, string> = {
  Neste: "https://www.neste.lv/lv/content/degvielas-cenas",
  CircleK: "https://www.circlek.lv/degviela-miles/degvielas-cenas",
  Virsi:
    "https://www.virsi.lv/lv/privatpersonam/degviela/degvielas-un-elektrouzlades-cenas",
};

const VIRSI_DATA_TYPE_TO_FUEL: Record<string, FuelType> = {
  dd: "Diesel",
  "95e": "95",
  "98e": "98",
  lpg: "LPG",
};

export default defineJob({
  id: "getFuelPrices",

  schedule: "0 * * * *", // every hour at the 0th minute

  description:
    "Scrapes fuel prices from Virsi, Neste, CircleK and aggregates by fuel type (lowest price).",

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

    for (const [fuelType, entries] of byType) {
      const minPrice = Math.min(...entries.map((e) => e.price));
      const priceRounded = Number(minPrice.toFixed(3));
      const uniqueStations = [
        ...new Set(
          entries.filter((e) => e.price === minPrice).map((e) => e.stationName),
        ),
      ];

      await FuelPrice.insert(ctx, {
        fuel_type: fuelType,
        price: priceRounded,
        station_names: uniqueStations,
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
    case "CircleK":
      return getCircleKFuelPrices($);
    case "Virsi":
      return getVirsiFuelPrices($);
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

const getVirsiFuelPrices = ($: cheerio.CheerioAPI): SiteFuelEntry[] => {
  const entries: SiteFuelEntry[] = [];

  $(".price-card").each((_, el) => {
    const card = $(el);
    const dataType = card.attr("data-type")?.toLowerCase();
    if (!dataType || !(dataType in VIRSI_DATA_TYPE_TO_FUEL)) return;

    const type = VIRSI_DATA_TYPE_TO_FUEL[dataType] as FuelType;
    const priceText = card.find(".price span").last().text().trim();
    const price = parsePriceFromText(priceText);
    if (price === null) return;

    entries.push({ type, price });
  });

  return entries;
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

const CIRCLEK_LABEL_TO_TYPE: Record<string, FuelType> = {
  "95miles": "95",
  "98miles+": "98",
  autogāze: "LPG",
  dmiles: "Diesel",
};

const getCircleKFuelPrices = ($: cheerio.CheerioAPI): SiteFuelEntry[] => {
  const entries: SiteFuelEntry[] = [];

  const rows = $("table.uk-table tbody tr").length
    ? $("table.uk-table tbody tr")
    : $("table tbody tr");

  rows.each((_, el) => {
    const row = $(el);
    const cells = row.find("td");
    if (cells.length < 2) return;

    const name = cells.eq(0).text().replace(/\s+/g, " ").trim().toLowerCase();
    const type = CIRCLEK_LABEL_TO_TYPE[name];
    if (!type) return;

    const priceText = cells.eq(1).text();
    const price = parsePriceFromText(priceText);
    if (price === null) return;

    entries.push({ type, price });
  });

  return entries;
};

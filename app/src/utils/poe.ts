import { z } from "zod";

import type { AppContext } from "@app/context";
import * as StaticData from "@app/modules/staticData";
import { fetchData } from "@app/utils/fetch";
import type { PoeScarab } from "@shared/types";

const API_BASE_URL = "https://poe.ninja";
const CDN_BASE_URL = "https://web.poecdn.com";

const fetchJson = async <T extends z.ZodType>(
  url: URL,
  schema: T,
): Promise<z.infer<T>> => {
  const data = await fetchData(url, schema, {
    headers: {
      "User-Agent": "Scarab price data for a Discord server",
    },
  });

  return data;
};

const getLeagueName = async (): Promise<string> => {
  const url = new URL("/poe1/api/data/index-state", API_BASE_URL);
  url.searchParams.set("league", "Keepers");
  url.searchParams.set("type", "Scarab");

  const data = await fetchJson(
    url,
    z.object({
      economyLeagues: z.array(z.object({ name: z.string() })),
    }),
  );

  return data.economyLeagues[0]!.name;
};

const getScarabData = async (league: string): Promise<PoeScarab[]> => {
  const url = new URL(
    "/poe1/api/economy/exchange/current/overview",
    API_BASE_URL,
  );
  url.searchParams.set("league", league);
  url.searchParams.set("type", "Scarab");

  const data = await fetchJson(
    url,
    z.object({
      lines: z.array(z.object({ id: z.string(), primaryValue: z.number() })),
      items: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          image: z.string(),
        }),
      ),
    }),
  );

  return data.lines
    .map((line) => {
      const item = data.items.find((el) => el.id === line.id);
      if (!item) return null;

      return {
        name: item.name,
        chaosValue: line.primaryValue,
        icon: new URL(item.image, CDN_BASE_URL).toString(),
      } satisfies PoeScarab;
    })
    .filter((x): x is PoeScarab => x !== null);
};

export const getPoeScarabPrices = async (
  ctx: AppContext,
): Promise<{
  league: string;
  scarabs: PoeScarab[];
  updatedAt: Date;
}> => {
  let scarabData = await StaticData.get(ctx, "poeScarabs");

  if (scarabData) {
    return scarabData;
  }

  const league = await getLeagueName();
  const scarabs = await getScarabData(league);
  scarabData = {
    league,
    scarabs,
    updatedAt: new Date(),
  };

  await StaticData.set(ctx, "poeScarabs", scarabData);

  return scarabData;
};

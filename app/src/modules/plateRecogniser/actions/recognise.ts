import z from "zod";

import type { AppContext } from "@app/context";
import { fetchData } from "@app/utils/fetch";

const API_URL = "https://api.platerecognizer.com/v1/plate-reader/";

const boxSchema = z.object({
  xmin: z.number(),
  ymin: z.number(),
  xmax: z.number(),
  ymax: z.number(),
});

const schema = z.object({
  processing_time: z.number(),
  results: z.array(
    z.object({
      box: boxSchema,
      plate: z.string(),
      region: z.object({
        code: z.string(),
        score: z.number(),
      }),
      score: z.number(),
      candidates: z.array(
        z.object({
          score: z.number(),
          plate: z.string(),
        }),
      ),
      dscore: z.number(),
      vehicle: z.object({
        score: z.number(),
        type: z.string(),
        box: boxSchema,
      }),
    }),
  ),
  filename: z.string(),
  version: z.number(),
  camera_id: z.string().nullable(),
  timestamp: z.string(),
  image_width: z.number(),
  image_height: z.number(),
});

/**
 * @see https://guides.platerecognizer.com/docs/snapshot/api-reference/
 */
export const plateReader = async (
  ctx: AppContext,
  {
    imageUrl,
  }: {
    imageUrl: string;
  },
): Promise<
  Array<{
    plate: string;
    region: string;
    vehicleType: string;
  }>
> => {
  const data = await fetchData(API_URL, schema, {
    method: "POST",
    body: JSON.stringify({
      upload_url: imageUrl,
      regions: ["lv", "lt", "ee"],
      config: {
        detection_rule: "strict",
      },
    }),
    headers: {
      Authorization: `Token ${ctx.env.PLATE_RECOGNISER_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  return data.results.map((result) => ({
    plate: result.plate.toLocaleUpperCase(),
    region: result.region.code,
    vehicleType: result.vehicle.type,
  }));
};

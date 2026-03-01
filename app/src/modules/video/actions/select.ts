import type { AppContext } from "@app/context";
import * as Video from "@app/modules/video";

export const getLatest = async (
  ctx: AppContext,
  limit: number,
): Promise<Video.db.Table[]> => {
  const rows = await ctx
    .db<Video.db.Table>(Video.db.TableName)
    .orderBy("created_at", "desc")
    .limit(limit);

  return rows;
};

export const getExistingVideoIds = async (
  ctx: AppContext,
  videoIds: string[],
): Promise<string[]> => {
  if (videoIds.length === 0) return [];
  const rows = await ctx
    .db<Video.db.Table>(Video.db.TableName)
    .whereIn("video_id", videoIds)
    .select("video_id");
  return rows.map((r) => r.video_id);
};

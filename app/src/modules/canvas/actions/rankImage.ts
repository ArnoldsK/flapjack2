import { createCanvas, loadImage } from "@napi-rs/canvas";
import chroma from "chroma-js";
import type { GuildMember } from "discord.js";
import getColors from "get-image-colors";

import { Unicode } from "@app/constants";
import { canvasDrawImage } from "@app/modules/canvas/utils/drawImage";
import { canvasFont } from "@app/modules/canvas/utils/font";
import { getBackgroundTextColor } from "@app/modules/canvas/utils/getBackgroundTextColor";
import type { ExperienceLevelData } from "@app/modules/experience/utils/getLevelData";
import { range } from "@shared/utils/number";

export interface RankImageInput {
  member: GuildMember;
  rank: number;
  levelData: ExperienceLevelData;
}

const fetchImageBuffer = async (url: string): Promise<Buffer> => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();

  return Buffer.from(arrayBuffer);
};

export const getRankImage = async (input: RankImageInput): Promise<Buffer> => {
  const { member, rank, levelData } = input;

  const avatarImageUrl = member.user.displayAvatarURL({
    forceStatic: true,
    extension: "png",
    size: 64,
  });

  const avatarBuffer = await fetchImageBuffer(avatarImageUrl);
  const colorData = await getColors(avatarBuffer, {
    type: "image/png",
    count: 1,
  });
  const backgroundColor = colorData[0].hex("rgb");
  const textColor = getBackgroundTextColor(backgroundColor);
  const blendColor = chroma
    .scale([backgroundColor, textColor])
    .mode("lab")
    .colors(1)[0];

  const [width, height] = [240, 48];
  const margin = 8;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const avatarImage = await loadImage(avatarImageUrl);
  const avatarX = margin;
  const avatarY = margin;
  const avatarWidth = height - margin * 2;

  canvasDrawImage(
    ctx,
    avatarImage,
    avatarX,
    avatarY,
    avatarWidth,
    avatarWidth,
    { ellipse: true },
  );

  ctx.font = canvasFont(16);
  ctx.fillStyle = textColor;
  ctx.textBaseline = "bottom";
  ctx.fillText(
    `#${rank} ${Unicode.Middot} LVL ${levelData.lvl}`,
    avatarX + avatarWidth + margin,
    height / 2,
  );

  const percentTextX = avatarX + avatarWidth + margin;
  const percentTextY = height / 2 + margin / 2;
  const percentText = `${levelData.percent}%`;

  ctx.font = canvasFont(16, { bold: true });
  ctx.fillStyle = textColor;
  ctx.textBaseline = "top";
  ctx.fillText(percentText, percentTextX, percentTextY);

  const percentTextMeasure = ctx.measureText(percentText);

  const barX = percentTextX + percentTextMeasure.width + margin;
  const barY =
    percentTextY + (percentTextMeasure.actualBoundingBoxDescent ?? 0) / 2;
  const barWidthMax = width - barX - margin;
  const barHeight = 3;

  ctx.fillStyle = blendColor;
  ctx.fillRect(barX, barY, barWidthMax, barHeight);

  const { exp, min, max } = levelData;
  const barWidth = range(exp, min, max, 0, barWidthMax);

  ctx.fillStyle = textColor;
  ctx.fillRect(barX, barY, barWidth, barHeight);

  return canvas.toBuffer("image/png");
};

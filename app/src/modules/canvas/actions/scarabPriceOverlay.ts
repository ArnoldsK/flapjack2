import { createCanvas } from "@napi-rs/canvas";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { ScarabMapping } from "@app/constants/scarabs";
import { mapping } from "@app/constants/scarabs";
import { canvasFont } from "@app/modules/canvas/utils/font";
import type { PoeScarab } from "@shared/types";
import { formatScarabPrice } from "@shared/utils/number";

dayjs.extend(utc);
dayjs.extend(timezone);

const SCARAB_GAP = 6;
const SCARAB_SIZE = 49;
const START_X = 42;
const START_Y = 22;

const getScarabPriceColor = (
  chaosValue: number,
): {
  text: string;
  background: string;
} => {
  const rounded = Math.round(chaosValue * 10) / 10;

  if (rounded >= 3) {
    // Very good
    return {
      text: "#FF0000",
      background: "#FFFFFF",
    };
  }
  if (rounded >= 1) {
    // Good
    return {
      text: "#111111",
      background: "#D59F00",
    };
  }
  if (rounded >= 0.5) {
    // Average
    return {
      text: "#111111",
      background: "#D2B287",
    };
  } else {
    // Bad
    return {
      text: "#ADA27B",
      background: "#111111",
    };
  }
};

interface Options {
  scarabByName: Map<string, PoeScarab>;
}

const formatOverlayDate = (date: Date): string =>
  dayjs(date).tz("Europe/Riga").format("DD/MM/YYYY, HH:mm");

export const getScarabPriceOverlay = ({
  league,
  scarabs,
  updatedAt,
}: {
  league: string;
  scarabs: PoeScarab[];
  updatedAt: Date;
}): Buffer => {
  const scarabByName = new Map(scarabs.map((scarab) => [scarab.name, scarab]));
  const options: Options = { scarabByName };

  const canvas = createCanvas(820, 780);
  const ctx = canvas.getContext("2d");

  const columnCanvases = mapping.cols.map((col) =>
    getColumnCanvas(col, options),
  );

  const maxColumnHeight = Math.max(...columnCanvases.map((cc) => cc.height));

  let x = START_X;
  for (let i = 0; i < columnCanvases.length; i++) {
    const col = mapping.cols[i]!;
    const colCanvas = columnCanvases[i]!;
    const y = col.isVerticallyCentered
      ? START_Y + (maxColumnHeight - colCanvas.height) / 2
      : START_Y;

    ctx.drawImage(colCanvas, x, y);
    x += colCanvas.width + col.marginRight;
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = canvasFont(10);
  ctx.fillStyle = "#fff";
  ctx.fillText(formatOverlayDate(updatedAt), 0, 0);
  ctx.fillText(league, 0, 12);

  return canvas.toBuffer("image/png");
};

const getColumnCanvas = (col: ScarabMapping.Column, options: Options) => {
  const rowCanvases = col.rows.map((row) => getRowCanvas(row, options));

  const width = Math.max(...rowCanvases.map((rc) => rc.width));
  const height =
    rowCanvases.length * SCARAB_SIZE + (rowCanvases.length - 1) * col.gap;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  let y = 0;
  for (const rowCanvas of rowCanvases) {
    ctx.drawImage(rowCanvas, 0, y);
    y += SCARAB_SIZE + col.gap;
  }

  return canvas;
};

const getRowCanvas = (row: ScarabMapping.Row, options: Options) => {
  const groupCanvases = row.groups.map((group) =>
    getGroupCanvas(group, options),
  );

  const width =
    groupCanvases.reduce((acc, gc) => acc + gc.width, 0) +
    (groupCanvases.length - 1) * SCARAB_GAP;
  const height = SCARAB_SIZE;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  let x = 0;
  for (const groupCanvas of groupCanvases) {
    ctx.drawImage(groupCanvas, x, 0);
    x += groupCanvas.width + SCARAB_GAP;
  }

  return canvas;
};

const getGroupCanvas = (group: ScarabMapping.Group, options: Options) => {
  const width =
    group.scarabs.length * SCARAB_SIZE +
    (group.scarabs.length - 1) * SCARAB_GAP;
  const height = SCARAB_SIZE;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  let x = 0;
  for (const name of group.scarabs) {
    const scarab = options.scarabByName.get(name);

    if (scarab) {
      const chaosValue = scarab.chaosValue ?? 0;
      const color = getScarabPriceColor(chaosValue);

      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.font = canvasFont(12, { bold: true });

      const text = formatScarabPrice(chaosValue);
      const metrics = ctx.measureText(text);
      const padding = 4;

      ctx.fillStyle = color.background;
      ctx.beginPath();
      ctx.roundRect(
        x,
        SCARAB_SIZE - padding - metrics.emHeightAscent,
        SCARAB_SIZE,
        metrics.emHeightAscent + padding,
        padding,
      );
      ctx.fill();

      ctx.fillStyle = color.text;
      ctx.fillText(
        text,
        x + SCARAB_SIZE / 2 - metrics.width / 2,
        SCARAB_SIZE - padding / 2,
      );
    }

    x += SCARAB_SIZE + SCARAB_GAP;
  }

  return canvas;
};

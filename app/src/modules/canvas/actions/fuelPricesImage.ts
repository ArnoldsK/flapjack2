import type { SKRSContext2D } from "@napi-rs/canvas";
import { createCanvas } from "@napi-rs/canvas";

import { canvasFont } from "@app/modules/canvas/utils/font";
import type { FuelType } from "@app/modules/fuelPrice";

export interface FuelPriceCard {
  fuelType: FuelType;
  price: number;
  previousPrice: number | null;
  stationNames: string[];
}

const CARD_W = 200;
const CARD_H = 110;
const GAP = 8;
const RADIUS = 12;
const CARD_BG = "#222327";
const OUTER_BG = "#1A1A1E";
const PADDING_X = 14;
const PADDING_TOP = 12;

const LABEL_SIZE = 14;
const PRICE_SIZE = 42;
const CHANGE_SIZE = 12;
const STATIONS_SIZE = 11;

const COLOR_WHITE = "#ffffff";
const COLOR_MUTED = "#888888";
const COLOR_GREEN = "#4CAF50";
const COLOR_RED = "#F44336";

const TRIANGLE_SIZE = 6;

const drawTriangle = (
  ctx: SKRSContext2D,
  x: number,
  y: number,
  direction: "up" | "down",
) => {
  const half = TRIANGLE_SIZE / 2;
  ctx.beginPath();
  if (direction === "down") {
    ctx.moveTo(x, y);
    ctx.lineTo(x + TRIANGLE_SIZE, y);
    ctx.lineTo(x + half, y + TRIANGLE_SIZE);
  } else {
    ctx.moveTo(x, y + TRIANGLE_SIZE);
    ctx.lineTo(x + TRIANGLE_SIZE, y + TRIANGLE_SIZE);
    ctx.lineTo(x + half, y);
  }
  ctx.closePath();
  ctx.fill();
};

const drawCard = (card: FuelPriceCard) => {
  const canvas = createCanvas(CARD_W, CARD_H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = CARD_BG;
  ctx.beginPath();
  ctx.roundRect(0, 0, CARD_W, CARD_H, RADIUS);
  ctx.fill();

  let y = PADDING_TOP;

  ctx.font = canvasFont(LABEL_SIZE);
  ctx.fillStyle = COLOR_WHITE;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText(card.fuelType, PADDING_X, y);
  y += LABEL_SIZE + 2;

  ctx.font = canvasFont(PRICE_SIZE, { bold: true });
  ctx.fillStyle = COLOR_WHITE;
  ctx.fillText(card.price.toFixed(3), PADDING_X, y);
  y += PRICE_SIZE + 3;

  if (card.previousPrice !== null && card.previousPrice !== card.price) {
    const changePercent =
      ((card.price - card.previousPrice) / card.previousPrice) * 100;
    const isDecrease = changePercent < 0;
    const color = isDecrease ? COLOR_GREEN : COLOR_RED;

    ctx.fillStyle = color;
    drawTriangle(
      ctx,
      PADDING_X,
      y + (CHANGE_SIZE - TRIANGLE_SIZE) / 2,
      isDecrease ? "down" : "up",
    );

    const text = `${Math.abs(changePercent).toFixed(1)}%`;
    ctx.font = canvasFont(CHANGE_SIZE);
    ctx.fillText(text, PADDING_X + TRIANGLE_SIZE + 4, y);
  }
  y += CHANGE_SIZE + 4;

  const stationsText = card.stationNames.join(", ");
  ctx.font = canvasFont(STATIONS_SIZE);
  ctx.fillStyle = COLOR_MUTED;
  ctx.fillText(stationsText, PADDING_X, y);

  return canvas;
};

export const getFuelPricesImage = (cards: FuelPriceCard[]): Buffer => {
  const cols = 2;
  const rows = Math.ceil(cards.length / cols);
  const width = cols * CARD_W + (cols - 1) * GAP + GAP * 2;
  const height = rows * CARD_H + (rows - 1) * GAP + GAP * 2;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = OUTER_BG;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, RADIUS);
  ctx.fill();

  for (let i = 0; i < cards.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = GAP + col * (CARD_W + GAP);
    const y = GAP + row * (CARD_H + GAP);
    const cardCanvas = drawCard(cards[i]!);

    ctx.drawImage(cardCanvas, x, y);
  }

  return canvas.toBuffer("image/png");
};

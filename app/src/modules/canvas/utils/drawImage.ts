import type { Canvas, Image, SKRSContext2D } from "@napi-rs/canvas";

export interface CanvasDrawImageOptions {
  ellipse?: boolean;
  mirror?: boolean;
  rotate?: number;
}

export const canvasDrawImage = (
  ctx: SKRSContext2D,
  image: Image | Canvas,
  x: number,
  y: number,
  w: number,
  h: number,
  options?: CanvasDrawImageOptions,
): void => {
  ctx.save();

  ctx.translate(x + w / 2, y + h / 2);
  if (options?.rotate !== undefined) {
    ctx.rotate((options.rotate * Math.PI) / 180);
  }
  if (options?.mirror) {
    ctx.scale(-1, 1);
  }
  ctx.translate(-x, -y);

  if (options?.ellipse) {
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(image, -(w / 2) + x, -(h / 2) + y, w, h);

  ctx.restore();
};

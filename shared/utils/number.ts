export const clamp = (value: number, min: number, max: number): number =>
  Math.max(Math.min(value, Math.max(min, max)), Math.min(min, max));

export const range = (
  value: number,
  minA: number,
  maxA: number,
  minB: number,
  maxB: number,
): number =>
  clamp(minB + ((value - minA) * (maxB - minB)) / (maxA - minA), minB, maxB);

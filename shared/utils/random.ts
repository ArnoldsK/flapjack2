export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomValue = <T>(array: T[]): T | undefined =>
  array.length === 0
    ? undefined
    : array[Math.floor(Math.random() * array.length)];

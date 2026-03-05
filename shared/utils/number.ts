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

/**
 * Format chaos value for scarab overlay: "Nc" for >= 1, simplified fraction for < 1 (e.g. "3c/4").
 */
export const formatScarabPrice = (chaosValue: number): string => {
  if (chaosValue >= 1) {
    return `${Math.floor(chaosValue)}c`;
  }

  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const precision = 10;
  const numerator = Math.round(chaosValue * precision);
  const denominator = precision;
  const commonDivisor = gcd(numerator, denominator);
  const simpleNumerator = numerator / commonDivisor;
  const simpleDenominator = denominator / commonDivisor;

  return `${simpleNumerator}c/${simpleDenominator}`.replace(/^1c\/1$/, "1c");
};

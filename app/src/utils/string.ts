/**
 * Capitalizes the first character and lowercases the rest.
 */
export const ucFirst = (s: string): string =>
  s.length === 0 ? s : s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();

/**
 * Joins non-null values with newlines. Useful for multi-line messages where some lines are optional.
 */
export const joinAsLines = (...values: (string | null | undefined)[]): string =>
  values.filter((val): val is string => val != null).join("\n");

/**
 * Deterministic hash of a string to an integer in [min, max).
 * Useful for deriving a version from dynamic data (e.g. job IDs).
 */
export const stringToIntHash = (value: string, min = 0, max = 500): number => {
  const charAtSum = [...value].reduce(
    (sum, char) => sum + (char.codePointAt(0) ?? 0),
    0,
  );

  return (charAtSum % (max - min)) + min;
};

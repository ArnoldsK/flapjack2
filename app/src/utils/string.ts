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

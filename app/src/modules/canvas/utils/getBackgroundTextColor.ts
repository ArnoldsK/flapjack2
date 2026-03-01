import chroma from "chroma-js";

/**
 * Pick black or white for text on the given background hex for sufficient contrast.
 * @see https://runkit.com/vickychijwani/chroma-contrasting-text
 */
export const getBackgroundTextColor = (hex: string): string => {
  const MIN_CONTRAST_RATIO = 7;
  const WHITE = chroma("white");
  const BLACK = chroma("black");

  const bg = chroma(hex);
  const contrastWithWhite = chroma.contrast(bg, WHITE);
  const contrastWithBlack = chroma.contrast(bg, BLACK);

  if (contrastWithWhite >= MIN_CONTRAST_RATIO) {
    return WHITE.hex("rgb");
  }

  if (contrastWithBlack >= MIN_CONTRAST_RATIO) {
    return BLACK.hex("rgb");
  }

  return contrastWithWhite >= contrastWithBlack
    ? WHITE.hex("rgb")
    : BLACK.hex("rgb");
};

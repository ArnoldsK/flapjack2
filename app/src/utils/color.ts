import type { HexColorString } from "discord.js";

export const parseHexColor = (hex: string): HexColorString | null => {
  if (!hex.startsWith("#")) {
    hex = `#${hex}`;
  }

  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    return null;
  }

  if (hex === "#000000") {
    return "#000001";
  }

  return hex.toUpperCase() as HexColorString;
};

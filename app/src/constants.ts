export enum Unicode {
  Times = "\u00D7",
  ThinSpace = "\u2009",
  Middot = "·",
  Spades = "♠",
  Clubs = "♣",
  Hearts = "♥",
  Diamonds = "♦",
  ZeroWidthSpace = "\u200B",
}

export const COLOR_ROLE_PREFIX = "color-";
export const BOOSTER_ICON_ROLE_PREFIX = "booster-icon-";

export enum Color {
  Black = 0x000001,
  Red = 0xf04747,
  Green = 0x43b581,
  Blue = 0x6495ed,
  Orange = 0xffa500,
}

/** 7 days in minutes; used for persistent thread auto-archive duration. */
export const PERSISTENT_THREAD_ARCHIVE_DURATION = 10_080;

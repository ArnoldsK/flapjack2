import path from "node:path";
import { GlobalFonts } from "@napi-rs/canvas";

const FONT_DIR = path.join(__dirname, "..", "font");

const ROBOTO_FILES = [
  "roboto.bold.ttf",
  "roboto.bold-italic.ttf",
  "roboto.italic.ttf",
  "roboto.regular.ttf",
] as const;

const registerGlobalFonts = (): void => {
  if (GlobalFonts.has("Roboto")) return;

  for (const file of ROBOTO_FILES) {
    GlobalFonts.registerFromPath(path.join(FONT_DIR, file), "Roboto");
  }
};

/**
 * Font string for 2D canvas context. Registers Roboto from module font dir when needed.
 */
export const canvasFont = (
  size: number,
  options?: { bold?: boolean; family?: string },
): string => {
  registerGlobalFonts();

  const bold = options?.bold ? "bold " : "";
  const family = options?.family ?? "'Roboto', sans-serif";

  return `${bold}${size}px ${family}`.trim();
};

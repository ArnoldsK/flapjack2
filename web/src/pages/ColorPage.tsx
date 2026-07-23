import { useCallback, useState } from "react";
import type { FC } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

import { useDocumentTitle } from "@web/hooks/useDocumentTitle";

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const n = parseInt(hex.slice(1), 16);

  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  };
};

const formatHex = (hex: string): string => hex.toUpperCase().slice(1);

export const ColorPage: FC = () => {
  useDocumentTitle("Color");

  const [hex1, setHex1] = useState("#A9C9FF");
  const [hex2, setHex2] = useState("#FFBBEC");
  const [copied, setCopied] = useState(false);

  const command = `/color gradient hex1:${hex1} hex2:${hex2}`;

  const copyCommand = useCallback(async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [command]);

  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  return (
    <div className="flex flex-col gap-6">
      {/* Preview */}
      <section className="relative rounded-lg border border-zinc-700 bg-zinc-800/80 p-4">
        <p className="absolute right-3 top-3 text-xs text-zinc-500">
          Interact to preview
        </p>
        <div className="preview-gradient-hover group relative flex items-center justify-center py-3">
          <span
            className="preview-gradient-text relative z-10 text-base font-medium cursor-default"
            style={{
              backgroundImage: `linear-gradient(90deg, ${hex1}, ${hex2}, ${hex1})`,
            }}
          >
            Pepsi Dog
          </span>
        </div>
      </section>

      {/* Two color pickers */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4">
          <HexColorPicker
            color={hex1}
            onChange={setHex1}
            className="!w-full !aspect-square"
          />
          <div className="mt-3 space-y-1 text-sm text-zinc-300">
            <p>
              Hex: <HexColorInput color={formatHex(hex1)} onChange={setHex1} />
            </p>
            <p>
              R: {rgb1.r} G: {rgb1.g} B: {rgb1.b}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4">
          <HexColorPicker
            color={hex2}
            onChange={setHex2}
            className="!w-full !aspect-square"
          />
          <div className="mt-3 space-y-1 text-sm text-zinc-300">
            <p>
              Hex: <HexColorInput color={formatHex(hex2)} onChange={setHex2} />
            </p>
            <p>
              R: {rgb2.r} G: {rgb2.g} B: {rgb2.b}
            </p>
          </div>
        </div>
      </section>

      {/* Command template - click to copy */}
      <section className="relative rounded-lg border border-zinc-700 bg-zinc-800/80 p-4">
        <button
          type="button"
          onClick={copyCommand}
          className="flex w-full cursor-pointer items-center justify-center rounded py-3 font-mono text-sm text-zinc-200 transition-colors hover:bg-zinc-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          {copied ? "Copied!" : command}
        </button>
      </section>
    </div>
  );
};

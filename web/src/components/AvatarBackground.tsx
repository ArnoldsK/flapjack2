import { useEffect, useRef, useState } from "react";
import { randomInt, randomValue } from "@shared/utils/random";
import type { FC } from "react";

import { trpc } from "@web/lib/trpc";

const GRID_ITEM_SIZE = 250;
const AVATAR_SIZE = 128;
const MARGIN = AVATAR_SIZE * 0.1;

const getItemCount = (size: number): number => {
  const count = Math.ceil(size / GRID_ITEM_SIZE);

  return count % 2 === 0 ? count + 1 : count;
};

const getItemId = (x: number, y: number): string => `avatar-cell-${x}-${y}`;

const getAvatarPosition = (): number =>
  randomInt(MARGIN, GRID_ITEM_SIZE - AVATAR_SIZE - MARGIN);

interface Placement {
  id: string;
  xGrid: number;
  yGrid: number;
  urlIndex: number;
  offsetX: number;
  offsetY: number;
}

export const AvatarBackground: FC = () => {
  const { data: urls = [] } = trpc.avatars.getRandom.useQuery();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const urlsRef = useRef(urls);

  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);

  useEffect(() => {
    const handleResize = (): void => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const urlList = urlsRef.current;
      if (urlList.length === 0) return;

      setSize({ width, height });
      setPlacements((prev) => {
        const cols = getItemCount(width);
        const rows = getItemCount(height);
        const absX = (cols - 1) / 2;
        const absY = (rows - 1) / 2;
        const newPlacements: Placement[] = [];

        for (let x = -absX; x <= absX; x++) {
          for (let y = -absY; y <= absY; y++) {
            // Uncomment this to remove the center cell
            // if (x === 0 && y === 0) continue;

            const id = getItemId(x, y);
            const existing = prev.find((p) => p.id === id);

            if (existing !== undefined) {
              newPlacements.push(existing);
            } else {
              const url = randomValue(urlList);
              if (url === undefined) continue;
              const urlIndex = urlList.indexOf(url);

              newPlacements.push({
                id,
                xGrid: x,
                yGrid: y,
                urlIndex,
                offsetX: getAvatarPosition(),
                offsetY: getAvatarPosition(),
              });
            }
          }
        }

        return newPlacements;
      });
    };

    window.addEventListener("resize", handleResize);
    const raf = requestAnimationFrame(() => handleResize());

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (urls.length > 0) {
      window.dispatchEvent(new Event("resize"));
    }
  }, [urls.length]);

  if (urls.length === 0) return null;

  const { width, height } = size;
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <div
      aria-hidden
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
      style={{ isolation: "isolate" }}
    >
      {placements.map((p) => {
        const posX = centerX + p.xGrid * GRID_ITEM_SIZE;
        const posY = centerY + p.yGrid * GRID_ITEM_SIZE;
        const xPercent = width > 0 ? (posX / width) * 100 : 0;
        const yPercent = height > 0 ? (posY / height) * 100 : 0;

        return (
          <div
            key={p.id}
            className="absolute"
            style={{
              position: "fixed",
              left: `${xPercent}%`,
              top: `${yPercent}%`,
              transform: "translate(-50%, -50%)",
              width: GRID_ITEM_SIZE,
              height: GRID_ITEM_SIZE,
            }}
          >
            <img
              alt=""
              className="rounded-full opacity-50"
              src={urls[p.urlIndex]}
              style={{
                position: "absolute",
                left: p.offsetX,
                top: p.offsetY,
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

import { useCallback, useEffect, useRef, useState } from "react";
import { range } from "@shared/utils/number";
import { randomInt, randomValue } from "@shared/utils/random";
import type { FC } from "react";

import { trpc } from "@web/lib/trpc";

const TILT_DEG = 25;

const GRID_ITEM_SIZE = 250;
const AVATAR_SIZE = 128;
const MARGIN = AVATAR_SIZE * 0.1;

const AVATAR_INITIAL_SPEED = 1000;
const AVATAR_INITIAL_DELAY = 2000;

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
  animationDelayMs: number;
  animationDurationMs: number;
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
            if (x === 0 && y === 0) continue;

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
                animationDelayMs: randomInt(
                  AVATAR_INITIAL_DELAY * 0.5,
                  AVATAR_INITIAL_DELAY,
                ),
                animationDurationMs: randomInt(
                  AVATAR_INITIAL_SPEED * 0.5,
                  AVATAR_INITIAL_SPEED,
                ),
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

  const onMouseMove = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
    const el = ev.currentTarget;
    const rect = el.getBoundingClientRect();
    const degY = range(
      ev.nativeEvent.offsetX,
      0,
      rect.width,
      -TILT_DEG,
      TILT_DEG,
    );
    const degX = range(
      ev.nativeEvent.offsetY,
      0,
      rect.height,
      TILT_DEG,
      -TILT_DEG,
    );
    const brightness = range(ev.nativeEvent.offsetY, 0, rect.height, 1.2, 0.8);

    el.style.transform = `rotateX(${degX}deg) rotateY(${degY}deg) scale(1.1)`;
    el.style.filter = `brightness(${brightness})`;
  }, []);

  const onMouseLeave = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
    const el = ev.currentTarget;
    el.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    el.style.filter = "brightness(1)";
  }, []);

  const onAnimationEnd = useCallback(
    (ev: React.AnimationEvent<HTMLDivElement>) => {
      const el = ev.currentTarget;
      el.style.animation = "none";
      el.style.transform = "scale(1)";
    },
    [],
  );

  if (urls.length === 0) return null;

  const { width, height } = size;
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
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
            className="absolute pointer-events-none"
            style={{
              position: "fixed",
              left: `${xPercent}%`,
              top: `${yPercent}%`,
              transform: "translate(-50%, -50%)",
              width: GRID_ITEM_SIZE,
              height: GRID_ITEM_SIZE,
              perspective: AVATAR_SIZE * 4,
            }}
          >
            <div
              className="pointer-events-auto rounded-full opacity-50 overflow-hidden transition-[transform,filter] duration-200 ease-out"
              style={{
                position: "absolute",
                left: p.offsetX,
                top: p.offsetY,
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                transform: "scale(0)",
                animation: `spin-expand-in ${p.animationDurationMs}ms ${p.animationDelayMs}ms forwards ease-in-out`,
              }}
              onAnimationEnd={onAnimationEnd}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
            >
              <img
                alt=""
                className="size-full rounded-full object-cover pointer-events-none"
                src={urls[p.urlIndex]}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

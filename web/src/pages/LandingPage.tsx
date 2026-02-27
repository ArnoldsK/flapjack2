import type { FC } from "react";

import { AvatarBackground } from "@web/components/AvatarBackground";

export const LandingPage: FC = () => (
  <div className="relative">
    <AvatarBackground />
    <h1 className="text-2xl font-bold text-white sm:text-3xl">Flapjack Bot</h1>
    <p className="mt-2 text-zinc-400">
      Discord bot with stats, videos, and more.
    </p>
  </div>
);

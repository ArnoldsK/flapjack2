import type { FC } from "react";

import { AvatarBackground } from "@web/components/AvatarBackground";

const DISCORD_INVITE_URL = import.meta.env.VITE_DISCORD_INVITE_URL ?? "";

export const LandingPage: FC = () => (
  <div className="relative">
    <AvatarBackground />
    <div className="fixed left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
      <header className="landing-header">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Pepsi Dog</h1>
        <div className="text-zinc-500">Latviešu Discord komūna</div>
      </header>
      <a
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noreferrer"
        className="flex cursor-pointer flex-col items-center"
        aria-label="Join Discord server"
      >
        <div className="relative flex justify-center [perspective:400px]">
          <img
            src="/bepsi-512.png"
            alt="Pepsi Dog"
            className="landing-logo object-cover"
          />
        </div>
        <span className="landing-logo-floater">Click to join</span>
      </a>
    </div>
  </div>
);

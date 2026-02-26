import type { FC } from "react";
import { Link, Outlet } from "react-router-dom";

import { HeaderNav } from "@web/components/HeaderNav";

export const PageLayout: FC = () => (
  <div className="flex min-h-screen flex-col">
    <header className="border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link
          to="/"
          className="text-lg font-semibold text-white hover:text-zinc-200"
        >
          Flapjack Bot
        </Link>
        <HeaderNav />
      </div>
    </header>
    <main className="flex-1 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Outlet />
      </div>
    </main>
  </div>
);

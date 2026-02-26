import type { FC } from "react";

import { trpc } from "@web/lib/trpc";

export const StatsPage: FC = () => {
  const { data, isLoading, error } = trpc.stats.getOverview.useQuery();

  if (isLoading) return <p className="text-zinc-400">Loading stats…</p>;
  if (error) return <p className="text-red-400">Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Stats</h1>
      <ul className="mt-4 list-inside list-disc space-y-1 text-zinc-300">
        <li>Guilds: {data.guildCount}</li>
        <li>Users: {data.userCount}</li>
        <li>Last updated: {data.lastUpdated}</li>
      </ul>
    </div>
  );
};

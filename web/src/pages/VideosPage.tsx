import type { FC } from "react";

import { trpc } from "@web/lib/trpc";
import type { Video } from "@project-types/video";

export const VideosPage: FC = () => {
  const { data, isLoading, error } = trpc.videos.list.useQuery();

  if (isLoading) return <p className="text-zinc-400">Loading videos…</p>;
  if (error) return <p className="text-red-400">Error: {error.message}</p>;
  if (!data) return null;

  if (data.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white">Videos</h1>
        <p className="mt-2 text-zinc-400">No videos yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Videos</h1>
      <ul className="mt-4 list-inside list-disc space-y-1 text-zinc-300">
        {data.map((v: Video) => (
          <li key={v.id}>
            <a
              href={v.url}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 underline decoration-zinc-500 underline-offset-2 hover:text-white hover:decoration-zinc-400"
            >
              {v.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

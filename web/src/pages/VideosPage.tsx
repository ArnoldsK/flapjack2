import type { FC } from "react";

import { useDocumentTitle } from "@web/hooks/useDocumentTitle";
import { trpc } from "@web/lib/trpc";

export const VideosPage: FC = () => {
  useDocumentTitle("Videos");

  const { data: videos, isLoading, error } = trpc.videos.getLatest.useQuery();

  if (isLoading) return <p className="text-zinc-400">Loading videos…</p>;
  if (error) return <p className="text-red-400">Error: {error.message}</p>;

  return (
    <div className="mx-auto min-w-0 max-w-[1600px]">
      <h1 className="text-2xl font-bold text-white">
        The 100 latest videos{" "}
        <span className="whitespace-nowrap">Pepsi Dog</span> is watching
      </h1>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(videos ?? []).map((video) => (
          <a
            key={video.message_id}
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col gap-2 rounded-xl outline-none after:pointer-events-none after:absolute after:-left-2 after:-right-2 after:-top-2 after:-bottom-3 after:rounded-2xl after:z-[-1] after:content-[''] after:bg-transparent after:shadow-none after:transition-[background-color,box-shadow] hover:after:bg-zinc-800/70 hover:after:shadow-[0_0_0_1px_rgba(113,113,122,0.5)] focus-visible:after:bg-zinc-800/70 focus-visible:after:shadow-[0_0_0_1px_rgba(113,113,122,0.5)]"
          >
            <div className="relative overflow-hidden rounded-lg">
              <div
                className="aspect-video w-full rounded-lg bg-zinc-800 bg-cover bg-center"
                style={{ backgroundImage: `url(${video.thumbnail_url})` }}
              />
              <span
                className="absolute bottom-2 left-2 rounded bg-zinc-800/90 px-2 py-1 text-xs font-medium text-zinc-200 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100"
                aria-hidden
              >
                {video.user_display_name}
              </span>
            </div>
            <div className="flex flex-col gap-1 px-1">
              <span className="font-semibold text-white line-clamp-2">
                {video.dearrow_title ?? video.title}
              </span>
              <span className="text-sm text-zinc-500">{video.author_name}</span>
            </div>
          </a>
        ))}
      </div>
      {videos?.length === 0 && (
        <p className="mt-8 text-zinc-500">No videos yet.</p>
      )}
    </div>
  );
};

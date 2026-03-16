import { useCallback, useMemo, useRef, useState } from "react";
import type { WeekRecapMessage } from "@shared/types";
import dayjs from "dayjs";
import type { FC } from "react";

import { useDocumentTitle } from "@web/hooks/useDocumentTitle";
import { trpc } from "@web/lib/trpc";

const INITIAL_MESSAGES_PER_CHANNEL = 5;

/** Wire shape: dates are strings. */
type RecapMessage = Omit<WeekRecapMessage, "createdAt"> & {
  createdAt: string | Date;
};

type ChannelGroup = {
  channel: RecapMessage["channel"];
  messages: RecapMessage[];
  moreMessages: RecapMessage[];
};

const VideoWithHoverPlay: FC<{
  url: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  unmuteIntentReceived: boolean;
  onUnmuteIntent: () => void;
}> = ({ url, videoRef, unmuteIntentReceived, onUnmuteIntent }) => {
  const [playing, setPlaying] = useState(false);

  const onEnter = useCallback(() => {
    setPlaying(true);
    const video = videoRef.current;
    if (video) {
      video.muted = !unmuteIntentReceived;
      video.play().catch(() => {});
    }
  }, [videoRef, unmuteIntentReceived]);

  const onLeave = useCallback(() => {
    setPlaying(false);
    videoRef.current?.pause();
  }, [videoRef]);

  const onUnmuteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (video) {
        video.muted = false;
      }
      onUnmuteIntent();
    },
    [videoRef, onUnmuteIntent],
  );

  const showUnmuteNote = playing && !unmuteIntentReceived;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <video
        ref={videoRef}
        src={url}
        className="max-h-[50vh] max-w-full rounded border border-zinc-700/80 object-contain"
        playsInline
        loop
        muted
      />
      {!playing && (
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded bg-black/70 px-3 py-2 text-white"
          aria-hidden
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="ml-0.5"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      )}
      {showUnmuteNote && (
        <>
          <button
            type="button"
            onClick={onUnmuteClick}
            className="absolute inset-0 cursor-pointer rounded"
            aria-label="Unmute video"
          />
          <span
            className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white"
            aria-hidden
          >
            Click to unmute
          </span>
        </>
      )}
    </div>
  );
};

const RecapAvatar: FC<{
  member: RecapMessage["member"];
  avatarUrl: string | null | undefined;
}> = ({ member, avatarUrl }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = !!avatarUrl && !imgFailed;
  const initial = (member.displayName || member.username).slice(0, 1);

  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-700/90 text-sm font-medium text-white">
      {showImg && avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        initial
      )}
    </div>
  );
};

const getMessageUrl = (msg: RecapMessage) => {
  const path = `${msg.guild.id}/${msg.channel.id}/${msg.id}`;

  return {
    https: `https://discord.com/channels/${path}`,
    intent: `discord://discord.com/channels/${path}`,
  };
};

const RecapMessageRow: FC<{
  message: RecapMessage;
  unmuteIntentReceived: boolean;
  onIntentReceived: () => void;
  avatars: Record<string, string | null> | undefined;
}> = ({ message, unmuteIntentReceived, onIntentReceived, avatars }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { https, intent } = useMemo(() => getMessageUrl(message), [message]);

  const openDiscord = useCallback(() => {
    onIntentReceived();
    const blurred = { current: false };
    const onBlur = () => {
      blurred.current = true;
    };
    window.addEventListener("blur", onBlur);
    window.location.replace(intent);
    setTimeout(() => {
      window.removeEventListener("blur", onBlur);
      if (!blurred.current) {
        window.location.assign(https);
      }
    }, 1000);
  }, [https, intent, onIntentReceived]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      openDiscord();
    },
    [openDiscord],
  );

  const dateStr = dayjs(message.createdAt).format("DD/MM/YYYY HH:mm");

  const attachment = message.firstAttachment;

  const onRowKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDiscord();
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={onRowKeyDown}
      className="flex min-h-[52px] cursor-pointer gap-4 rounded-lg px-3 py-3 hover:bg-zinc-800/70"
    >
      <RecapAvatar
        member={message.member}
        avatarUrl={avatars?.[message.member.id]}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold text-white">
            {message.member.displayName || message.member.username}
          </span>
          <span className="text-zinc-500 text-xs">{dateStr}</span>
        </div>
        {message.content ? (
          <p className="mt-1 break-words whitespace-pre-wrap text-zinc-300 text-[15px] leading-relaxed">
            {message.content}
          </p>
        ) : null}
        {attachment ? (
          <div className="mt-2 max-w-[550px] overflow-hidden rounded-md">
            {attachment.isImage ? (
              <img
                src={attachment.url}
                alt=""
                className="block max-h-[66vh] max-w-full rounded object-contain"
              />
            ) : attachment.isVideo ? (
              <VideoWithHoverPlay
                url={attachment.url}
                videoRef={videoRef}
                unmuteIntentReceived={unmuteIntentReceived}
                onUnmuteIntent={onIntentReceived}
              />
            ) : (
              <span className="text-zinc-500 text-sm">
                Attachment no longer available — open in Discord to view
              </span>
            )}
          </div>
        ) : null}
        {message.reactions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.reactions.map((r) => (
              <span
                key={r.emoji.identifier}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800/80 px-2 py-1 text-zinc-400"
              >
                {r.emoji.url ? (
                  <img
                    src={r.emoji.url}
                    alt={r.emoji.name ?? r.emoji.identifier}
                    className="h-4 w-4 object-contain"
                  />
                ) : (
                  <span className="text-base leading-none">
                    {decodeURIComponent(r.emoji.identifier)}
                  </span>
                )}
                <span className="text-sm font-medium">{r.count}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const RecapPage: FC = () => {
  useDocumentTitle("Recap");

  const { data, isLoading, error } = trpc.recap.getWeekRecap.useQuery();
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(
    () => new Set(),
  );
  const [unmuteIntentReceived, setUnmuteIntentReceived] = useState(false);
  const onIntentReceived = useCallback(() => setUnmuteIntentReceived(true), []);

  const toggleChannel = useCallback((channelId: string) => {
    setExpandedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) next.delete(channelId);
      else next.add(channelId);

      return next;
    });
  }, []);

  const channelGroups: ChannelGroup[] = useMemo(() => {
    const rawMessages = data?.recap?.messages ?? [];
    const channelOrder = data?.channelOrder ?? [];
    if (rawMessages.length === 0) return [];

    const sorted = [...rawMessages].sort((a, b) => {
      const ra = a.reactionCount ?? 0;
      const rb = b.reactionCount ?? 0;
      if (rb !== ra) return rb - ra;
      const ta =
        typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
      const tb =
        typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;

      return ta - tb;
    });

    const byChannel = new Map<string, RecapMessage[]>();
    for (const msg of sorted) {
      const id = msg.channel.id;
      if (!byChannel.has(id)) byChannel.set(id, []);
      byChannel.get(id)!.push(msg);
    }

    const orderIndex = new Map(channelOrder.map((id, i) => [id, i]));

    const entries = [...byChannel.entries()].map(([_channelId, messages]) => {
      let initial = messages.slice(0, INITIAL_MESSAGES_PER_CHANNEL);
      let more = messages.slice(INITIAL_MESSAGES_PER_CHANNEL);
      if (more.length === 1) {
        initial = [...initial, ...more];
        more = [];
      }
      return {
        channel: messages[0].channel,
        messages: initial,
        moreMessages: more,
      };
    });

    entries.sort((a, b) => {
      const ia = orderIndex.get(a.channel.id) ?? channelOrder.length;
      const ib = orderIndex.get(b.channel.id) ?? channelOrder.length;
      if (ia !== ib) return ia - ib;
      return a.channel.name.localeCompare(b.channel.name);
    });

    return entries;
  }, [data?.recap?.messages, data?.channelOrder]);

  if (isLoading) return <p className="text-zinc-400">Loading recap…</p>;
  if (error) return <p className="text-red-400">Error: {error.message}</p>;
  if (!data) {
    return (
      <div className="mx-auto max-w-[694px]">
        <h1 className="text-2xl font-bold text-white">Week recap</h1>
        <p className="mt-2 text-zinc-500">No recap available yet.</p>
      </div>
    );
  }

  const recap = data.recap;
  const createdAt =
    recap && typeof recap.createdAt === "string"
      ? new Date(recap.createdAt).toLocaleDateString(undefined, {
          dateStyle: "long",
        })
      : recap
        ? String(recap.createdAt)
        : null;

  return (
    <div className="mx-auto min-w-0 max-w-[1600px]">
      <h1 className="text-2xl font-bold text-white">Week recap</h1>
      {createdAt ? (
        <p className="mt-2 text-sm text-zinc-500">Generated {createdAt}</p>
      ) : (
        <p className="mt-4 text-zinc-500">No recap available yet.</p>
      )}
      {!recap ? null : channelGroups.length === 0 ? (
        <p className="mt-8 text-zinc-500">No messages in this recap.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {channelGroups.map(({ channel, messages, moreMessages }) => (
            <section
              key={channel.id}
              id={`c${channel.id}`}
              className="flex flex-col"
            >
              <div className="flex flex-col">
                <p className="mb-3 flex items-center gap-2 px-2 text-sm font-bold text-zinc-500">
                  <span aria-hidden>#</span>
                  {channel.name}
                </p>
                {messages.map((msg) => (
                  <RecapMessageRow
                    key={msg.id}
                    message={msg}
                    unmuteIntentReceived={unmuteIntentReceived}
                    onIntentReceived={onIntentReceived}
                    avatars={data.avatars}
                  />
                ))}
                {moreMessages.length > 0 && (
                  <>
                    {expandedChannels.has(channel.id) ? (
                      moreMessages.map((msg) => (
                        <RecapMessageRow
                          key={msg.id}
                          message={msg}
                          unmuteIntentReceived={unmuteIntentReceived}
                          onIntentReceived={onIntentReceived}
                          avatars={data.avatars}
                        />
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleChannel(channel.id)}
                        className="mb-4 ml-14 mt-4 self-start cursor-pointer rounded bg-[#5865f2] px-4 py-2 text-sm font-medium text-white hover:bg-[#4752c4]"
                      >
                        Show {moreMessages.length} more
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="mt-6 h-px w-full bg-zinc-800/70" />
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

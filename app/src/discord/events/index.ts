import type { Client, ClientEvents } from "discord.js";

import type { AppContext } from "@app/context";
import type { EventDefinition } from "@app/discord/events/defineEvent";
import addExpAndCreditsOnMessage from "@app/discord/events/definitions/addExpAndCreditsOnMessage";
import adjustLinksInMessages from "@app/discord/events/definitions/adjustLinksInMessages";
import interactionCreate from "@app/discord/events/definitions/interactionCreate";
import ready from "@app/discord/events/definitions/ready";

const eventList: EventDefinition<keyof ClientEvents>[] = [
  ready as EventDefinition<keyof ClientEvents>,
  interactionCreate as EventDefinition<keyof ClientEvents>,
  adjustLinksInMessages as EventDefinition<keyof ClientEvents>,
  addExpAndCreditsOnMessage as EventDefinition<keyof ClientEvents>,
];

function groupByEvent(
  definitions: EventDefinition<keyof ClientEvents>[],
): Map<string, EventDefinition<keyof ClientEvents>[]> {
  const map = new Map<string, EventDefinition<keyof ClientEvents>[]>();
  for (const def of definitions) {
    const key = def.event as string;
    const existing = map.get(key) ?? [];
    existing.push(def);
    map.set(key, existing);
  }
  return map;
}

const grouped = groupByEvent(eventList);

export const registerDiscordEvents = (
  client: Client,
  ctx: AppContext,
): void => {
  for (const [event, handlers] of grouped) {
    const useOnce = handlers.some((h) => h.once);
    const runAll = (...args: unknown[]): void => {
      const toRun = handlers.filter(
        (h) => !h.productionOnly || ctx.env.NODE_ENV === "production",
      );
      void Promise.allSettled(
        toRun.map((h) =>
          (h.run as (ctx: AppContext, ...a: unknown[]) => Promise<void>)(
            ctx,
            ...args,
          ),
        ),
      ).then((results) => {
        results.forEach((r, i) => {
          if (r.status === "rejected") {
            console.error(
              `[events] Handler for ${event} (index ${i}) failed:`,
              r.reason,
            );
          }
        });
      });
    };
    if (useOnce) {
      client.once(event, runAll as (...args: unknown[]) => void);
    } else {
      client.on(event, runAll as (...args: unknown[]) => void);
    }
  }
};

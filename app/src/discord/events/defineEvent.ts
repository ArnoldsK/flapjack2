import type { ClientEvents } from "discord.js";

import type { AppContext } from "@app/context";

export interface EventDefinition<
  E extends keyof ClientEvents = keyof ClientEvents,
> {
  event: E;
  run: (ctx: AppContext, ...args: ClientEvents[E]) => Promise<void>;
  once: boolean;
  /** If true, handler runs only when NODE_ENV is "production" (e.g. to avoid dev bot acting on message deletes). */
  productionOnly: boolean;
}

export const defineEvent = <E extends keyof ClientEvents>(
  def: EventDefinition<E>,
): EventDefinition<E> => def;

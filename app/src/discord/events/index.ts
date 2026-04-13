import type { Client, ClientEvents } from "discord.js";

import type { AppContext } from "@app/context";

import type { EventDefinition } from "./defineEvent";
import addChannelNewsRoles from "./definitions/addChannelNewsRoles";
import addExpAndCreditsOnMessage from "./definitions/addExpAndCreditsOnMessage";
import adjustLinksInMessages from "./definitions/adjustLinksInMessages";
import createPersistentThread from "./definitions/createPersistentThread";
import handleVideoLinks from "./definitions/handleVideoLinks";
import interactionCreate from "./definitions/interactionCreate";
import logGuildMemberRemove from "./definitions/logGuildMemberRemove";
import numbersGamePlateReader from "./definitions/numbersGamePlateReader";
import ready from "./definitions/ready";
import unarchivePersistentThread from "./definitions/unarchivePersistentThread";
import upperClassMessage from "./definitions/upperClassMessage";
import userRoleMemberAdd from "./definitions/userRoleMemberAdd";
import userRoleMemberUpdate from "./definitions/userRoleMemberUpdate";

const eventList: EventDefinition<keyof ClientEvents>[] = [
  ready as EventDefinition<keyof ClientEvents>,
  interactionCreate as EventDefinition<keyof ClientEvents>,
  adjustLinksInMessages as EventDefinition<keyof ClientEvents>,
  addExpAndCreditsOnMessage as EventDefinition<keyof ClientEvents>,
  addChannelNewsRoles as EventDefinition<keyof ClientEvents>,
  handleVideoLinks as EventDefinition<keyof ClientEvents>,
  logGuildMemberRemove as EventDefinition<keyof ClientEvents>,
  upperClassMessage as EventDefinition<keyof ClientEvents>,
  userRoleMemberAdd as EventDefinition<keyof ClientEvents>,
  userRoleMemberUpdate as EventDefinition<keyof ClientEvents>,
  createPersistentThread as EventDefinition<keyof ClientEvents>,
  unarchivePersistentThread as EventDefinition<keyof ClientEvents>,
  numbersGamePlateReader as EventDefinition<keyof ClientEvents>,
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

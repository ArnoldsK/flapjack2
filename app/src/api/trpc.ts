import { initTRPC } from "@trpc/server";
import type { AppContext } from "@app/context";

export interface TrpcContext {
  app: AppContext;
}

export const createTrpcContext = (app: AppContext): TrpcContext => ({ app });

const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

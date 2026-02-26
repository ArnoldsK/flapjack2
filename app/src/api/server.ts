import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import type { AppContext } from "@app/context";
import { appRouter } from "@app/api/router";
import { createTrpcContext } from "@app/api/trpc";

export const startApiServer = async (ctx: AppContext): Promise<void> => {
  const server = Fastify({ logger: ctx.env.NODE_ENV !== "production" });
  await server.register(fastifyCors);
  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: () => createTrpcContext(ctx),
    },
  });

  await server.listen({ port: ctx.env.API_PORT, host: "0.0.0.0" });
  console.log(`API server listening on port ${ctx.env.API_PORT}`);
};

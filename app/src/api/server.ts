import fastifyCors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify from "fastify";

import { appRouter } from "@app/api/router";
import { createTrpcContext } from "@app/api/trpc";
import type { AppContext } from "@app/context";

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

  server.get("/ping", async (_request, reply) => {
    return reply.status(200).send();
  });

  await server.listen({ port: ctx.env.API_PORT, host: "0.0.0.0" });
  console.log(`API server listening on port ${ctx.env.API_PORT}`);
};

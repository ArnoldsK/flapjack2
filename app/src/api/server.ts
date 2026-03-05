import fastifyCors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify from "fastify";

import { appRouter } from "@app/api/router";
import { createTrpcContext } from "@app/api/trpc";
import type { AppContext } from "@app/context";
import * as Canvas from "@app/modules/canvas";
import * as StaticData from "@app/modules/staticData";
import { getPoeScarabPrices } from "@app/utils/poe";

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

  server.get("/scarabs-overlay", async (_request, reply) => {
    let data = await StaticData.get(ctx, "poeScarabs");

    if (!data) {
      data = await getPoeScarabPrices(ctx);
    }

    const image = Canvas.getScarabPriceOverlay({
      league: data.league,
      scarabs: data.scarabs,
      updatedAt: data.updatedAt,
    });

    return reply.header("Content-Type", "image/png").send(image);
  });

  await server.listen({ port: ctx.env.API_PORT, host: "0.0.0.0" });
  console.log(`API server listening on port ${ctx.env.API_PORT}`);
};

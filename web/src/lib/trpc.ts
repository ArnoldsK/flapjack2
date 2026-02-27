import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "app/api/router";

const apiBase = import.meta.env.VITE_API_BASE_URL;
if (typeof apiBase !== "string" || !apiBase) {
  throw new Error("VITE_API_BASE_URL is required. Set it in .env file.");
}

export const trpc = createTRPCReact<AppRouter>();

export const getTrpcClient = () =>
  trpc.createClient({
    links: [
      httpBatchLink({
        url: `${apiBase}/trpc`,
      }),
    ],
  });

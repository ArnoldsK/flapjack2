import { config } from "dotenv";
import path from "path";

// Load .env from repo root first, then app/ (so app/.env overrides if present)
config({ path: path.resolve(process.cwd(), "..", ".env") });
config({ path: path.resolve(process.cwd(), ".env") });

import { z } from "zod";

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_OWNER_ID: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().min(1).default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1).default("root"),
  DB_PASSWORD: z.string().min(0).default("root"),
  DB_NAME: z.string().min(1).default("flapjack2"),
});

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (): Env => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "Invalid environment variables",
      parsed.error.flatten().fieldErrors,
    );
    // In a real app you might throw here; exiting is fine for now.
    process.exit(1);
  }
  return parsed.data;
};

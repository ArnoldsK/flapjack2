import { config } from "dotenv";
import path from "path";

const rootDir =
  path.basename(process.cwd()) === "app"
    ? path.resolve(process.cwd(), "..")
    : process.cwd();
config({ path: path.resolve(rootDir, ".env") });

import { z } from "zod";

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
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
    process.exit(1);
  }
  return parsed.data;
};

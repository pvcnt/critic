import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url().nonempty(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  GITHUB_CLIENT_ID: z.string().nonempty(),
  GITHUB_CLIENT_SECRET: z.string().nonempty(),
  GITHUB_API_URL: z.string().optional(),
  CRYPTO_KEY: z.string().nonempty(),
  COOKIE_SECRET: z.string().nonempty(),
});

export const env = EnvSchema.parse(process.env);

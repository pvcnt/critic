import { z } from "zod";

// Environment variables that are available both at build and runtime.
// https://vercel.com/docs/environment-variables/system-environment-variables
const EnvSchema = z.object({
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  VERCEL_GIT_COMMIT_REF: z.string().optional(),
});

export const env = EnvSchema.parse(import.meta.env);

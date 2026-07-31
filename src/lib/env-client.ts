// Client-accessible subset of env. Server-only values (SENTRY_AUTH_TOKEN etc.) are NOT here.

import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "test", "staging", "production"]),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_WS_URL: z.string(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_CLIP_EMBED_ORIGIN: z.string().optional(),
});

export type PublicEnv = z.infer<typeof schema>;

let cached: PublicEnv | null = null;

export function env(): PublicEnv {
  if (cached) return cached;
  const parsed = schema.safeParse({
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_CLIP_EMBED_ORIGIN: process.env.NEXT_PUBLIC_CLIP_EMBED_ORIGIN,
  });
  if (!parsed.success) {
    throw new Error("Invalid NEXT_PUBLIC_* env vars: " + JSON.stringify(parsed.error.issues));
  }
  cached = parsed.data;
  return cached;
}

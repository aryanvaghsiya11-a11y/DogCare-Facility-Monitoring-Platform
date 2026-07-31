import { z } from "zod";

// Build-time env validation. Failing here is intentional — bad env config
// must not silently ship to production.

const serverEnvSchema = z.object({
  AUTH_COOKIE_NAME: z.string().min(1).default("dcare_session"),
  ALLOWED_ROLES: z
    .string()
    .default("staff,owner,manager")
    .transform((v) => v.split(",").map((r) => r.trim()))
    .pipe(z.array(z.enum(["staff", "owner", "manager"])).min(1)),
  WS_BUFFER_MAX: z.coerce.number().int().positive().default(200),
  WS_BACKOFF_MAX_MS: z.coerce.number().int().positive().default(30000),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_WS_URL: z.string().refine((s) => s.startsWith("ws://") || s.startsWith("wss://"), {
    message: "NEXT_PUBLIC_WS_URL must use ws:// or wss://",
  }),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().or(z.literal("")).optional(),
  NEXT_PUBLIC_CLIP_EMBED_ORIGIN: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

let cached: { server: ServerEnv; public: PublicEnv } | null = null;

export function env(): { server: ServerEnv; public: PublicEnv } {
  if (cached) return cached;
  const server = serverEnvSchema.safeParse(process.env);
  const pub = publicEnvSchema.safeParse(process.env);
  if (!server.success || !pub.success) {
    const issues = [
      ...(server.success ? [] : server.error.issues),
      ...(pub.success ? [] : pub.error.issues),
    ];
    throw new Error(
      `Invalid environment configuration:\n${JSON.stringify(issues, null, 2)}`,
    );
  }
  cached = { server: server.data, public: pub.data };
  return cached;
}

// Sentry client init. Next.js + @sentry/nextjs picks up this file by filename.
// Wrapped in an IIFE so const declarations don't leak into the module scope
// (which TypeScript flags for files at the project root).
import * as Sentry from "@sentry/nextjs";

(function init() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event: Sentry.ErrorEvent) {
      if (event.user) {
        delete event.user.email;
        delete event.user.username;
      }
      return event;
    },
  });
})();

export {};

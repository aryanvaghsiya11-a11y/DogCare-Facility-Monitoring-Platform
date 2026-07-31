// Sentry server init. See sentry.client.config.ts header for why this is wrapped.
import * as Sentry from "@sentry/nextjs";

(function init() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.05,
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

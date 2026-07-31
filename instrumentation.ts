// Next.js instrumentation entry. We don't manually import the sentry configs
// here because @sentry/nextjs auto-loads `sentry.{client,server,edge}.config.{ts,js}`
// at the right phase by filename convention.
// Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Reserved for future manual init (e.g., OpenTelemetry) once needed.
}

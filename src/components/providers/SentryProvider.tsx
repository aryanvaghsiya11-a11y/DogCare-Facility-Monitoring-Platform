"use client";

import type { ReactNode } from "react";

// Thin pass-through. We rely on @sentry/nextjs's automatic instrumentation
// (loaded via the Sentry config files). Keeping the provider explicit lets us
// flip other client-side error helpers in/out without losing the slot.
export function SentryProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

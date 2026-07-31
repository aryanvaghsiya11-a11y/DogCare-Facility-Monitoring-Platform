"use client";

import { useAlerts } from "@/context/AlertsSocketContext";

// Visible "reconnecting..." indicator. Staff need to know they may be missing live alerts.
export function AlertsSocketBanner() {
  const { status, reconnectAttempts } = useAlerts();
  if (status === "open" || status === "idle") return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-severity-high/10 border-y border-severity-high/40 text-sm text-center py-xs"
    >
      {status === "reconnecting"
        ? `Reconnecting to live alerts… (attempt ${reconnectAttempts})`
        : status === "connecting"
          ? "Connecting to live alerts…"
          : status === "closed"
            ? "Live alerts disconnected. Retrying…"
            : null}
    </div>
  );
}

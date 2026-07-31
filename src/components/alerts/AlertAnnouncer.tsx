"use client";

import { useAlerts } from "@/context/AlertsSocketContext";

// Polite and assertive live regions.
// Assertive: critical alerts (interrupt the screen reader).
// Polite: high/normal alerts (wait for idle).
// Both regions are always present so AT can latch onto them reliably.
export function AlertAnnouncer() {
  const { alerts } = useAlerts();
  // We only announce the most-recent unannounced alert; index 0 is newest by our reducer.
  const newest = alerts[0];
  const assertive = newest?.severity === "critical" ? newest : null;
  const polite = newest && newest.severity !== "critical" ? newest : null;
  return (
    <>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertive ? `${assertive.severity.toUpperCase()}: ${assertive.message}` : ""}
      </div>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {polite ? `New alert: ${polite.message}` : ""}
      </div>
    </>
  );
}

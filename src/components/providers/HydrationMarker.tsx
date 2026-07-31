"use client";

import { useEffect } from "react";

// Fires once React hydrates the app, so e2e tests can wait for real
// interactivity instead of racing the hydration pass (slow under WebKit/dev).
export function HydrationMarker() {
  useEffect(() => {
    document.body.setAttribute("data-hydrated", "true");
  }, []);
  return null;
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Alert } from "@/types/domain";

export type SocketStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed";

interface UseAlertsSocketOptions {
  url: string;
  bufferMax?: number;
  backoffMaxMs?: number;
}

interface UseAlertsSocketResult {
  status: SocketStatus;
  alerts: Alert[];
  reconnectAttempts: number;
  // Last health sample — for analytics/Sentry breadcrumbs.
  lastDisconnectAt: number | null;
}

const INITIAL_BACKOFF_MS = 1_000;

export function useAlertsSocket({
  url,
  bufferMax = 200,
  backoffMaxMs = 30_000,
}: UseAlertsSocketOptions): UseAlertsSocketResult {
  const [status, setStatus] = useState<SocketStatus>("idle");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastDisconnectAt, setLastDisconnectAt] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const bufferRef = useRef<Alert[]>([]);
  const reconnectAttemptsRef = useRef(0);
  // Timer is mutable; never put in state.
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Hard-stop flag — set true when the consumer unmounts to prevent reconnect storms.
  const cancelledRef = useRef(false);
  // Visibility-aware buffering. Some mobile browsers throttle background tabs and
  // silently queue or drop messages; we keep accumulating and replay on focus.
  const wasHiddenRef = useRef(false);

  const flush = useCallback(() => {
    if (bufferRef.current.length === 0) return;
    const drained = bufferRef.current.splice(0, bufferRef.current.length);
    setAlerts((prev) => [...drained.reverse(), ...prev].slice(0, 500));
  }, []);

  // connect/scheduleReconnect are mutually recursive (reconnect calls connect,
  // connect's onclose calls scheduleReconnect). Stash the latest connect in a
  // ref so scheduleReconnect can call it without circular deps.
  const connectRef = useRef<() => void>(() => {});

  const scheduleReconnect = useCallback(() => {
    if (cancelledRef.current) return;
    setStatus("reconnecting");
    const attempt = reconnectAttemptsRef.current + 1;
    reconnectAttemptsRef.current = attempt;
    setReconnectAttempts(attempt);
    // Exponential backoff with full jitter to avoid thundering herds.
    const base = Math.min(backoffMaxMs, INITIAL_BACKOFF_MS * 2 ** Math.min(attempt - 1, 6));
    const delay = Math.floor(Math.random() * base);
    reconnectTimerRef.current = setTimeout(() => connectRef.current(), delay);
  }, [backoffMaxMs]);

  const connect = useCallback(() => {
    if (cancelledRef.current) return;
    setStatus((s) => (s === "open" ? s : "connecting"));
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      scheduleReconnect();
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      if (cancelledRef.current) {
        ws.close();
        return;
      }
      reconnectAttemptsRef.current = 0;
      setReconnectAttempts(0);
      setStatus("open");
    };

    ws.onmessage = (ev) => {
      try {
        const a = JSON.parse(ev.data) as Alert;
        bufferRef.current.push(a);
        if (bufferRef.current.length >= bufferMax) flush();
      } catch {
        // Server sent invalid JSON — log to Sentry but keep the connection alive.
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.warn("Invalid WS message", ev.data);
        }
      }
    };

    ws.onerror = () => {
      // Wait for onclose to drive reconnect; error alone doesn't tell us much.
    };

    ws.onclose = () => {
      if (cancelledRef.current) return;
      setLastDisconnectAt(Date.now());
      scheduleReconnect();
    };
  }, [url, bufferMax, scheduleReconnect, flush]);

  // Keep the ref pointing at the latest connect so scheduleReconnect's timer
  // always invokes the version that sees current closure values.
  connectRef.current = connect;

  useEffect(() => {
    cancelledRef.current = false;
    connect();

    const flushInterval = setInterval(flush, 200);
    const onVisibility = () => {
      if (document.hidden) {
        wasHiddenRef.current = true;
      } else if (wasHiddenRef.current) {
        wasHiddenRef.current = false;
        flush();
        // If socket died while hidden, force reconnect on return.
        if (wsRef.current?.readyState !== WebSocket.OPEN) connect();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", connect);

    return () => {
      cancelledRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      clearInterval(flushInterval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", connect);
      wsRef.current?.close();
    };
  }, [connect, flush]);

  // Expose ack helper too — kept simple; downstream consumers call api(...)
  // and refetch the alert list via React Query.
  return { status, alerts, reconnectAttempts, lastDisconnectAt };
}

// Standalone helper for non-hook callers (e.g., service worker / tests).
export function exponentialBackoff(attempt: number, capMs: number): number {
  const base = Math.min(capMs, INITIAL_BACKOFF_MS * 2 ** Math.min(attempt, 6));
  return Math.floor(Math.random() * base);
}

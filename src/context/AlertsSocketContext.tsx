"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAlertsSocket, type SocketStatus } from "@/hooks/useAlertsSocket";
import type { Alert } from "@/types/domain";

interface AlertsCtx {
  status: SocketStatus;
  alerts: Alert[];
  reconnectAttempts: number;
  lastDisconnectAt: number | null;
}

const Ctx = createContext<AlertsCtx | null>(null);

export function AlertsSocketProvider({ children }: { children: ReactNode }) {
  const socket = useAlertsSocket({
    url: process.env.NEXT_PUBLIC_WS_URL ?? "",
    bufferMax: Number(process.env.NEXT_PUBLIC_WS_BUFFER_MAX ?? 200),
    backoffMaxMs: Number(process.env.NEXT_PUBLIC_WS_BACKOFF_MAX_MS ?? 30_000),
  });
  const value = useMemo(
    () => ({
      status: socket.status,
      alerts: socket.alerts,
      reconnectAttempts: socket.reconnectAttempts,
      lastDisconnectAt: socket.lastDisconnectAt,
    }),
    [socket.status, socket.alerts, socket.reconnectAttempts, socket.lastDisconnectAt],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAlerts(): AlertsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAlerts must be used inside <AlertsSocketProvider>");
  return ctx;
}

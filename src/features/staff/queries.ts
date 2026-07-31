import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Alert, CareTask } from "@/types/domain";
import { ALERTS, DOGS, dogCareTasks, zoneOccupancy } from "@/lib/mock-data";

export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: () => zoneOccupancy(),
    initialData: zoneOccupancy(),
  });
}

export function useDogs() {
  return useQuery({
    queryKey: ["dogs"],
    queryFn: () => DOGS,
    initialData: DOGS,
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => ALERTS as unknown as Alert[],
    initialData: ALERTS as unknown as Alert[],
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await api(`/alerts/${id}/ack`, { method: "POST" });
      } catch {
        const item = ALERTS.find((a) => a.id === id);
        if (item) item.acknowledged = true;
        return { ok: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useCareTasks(dogId: string) {
  return useQuery({
    queryKey: ["care-tasks", dogId],
    queryFn: () => dogCareTasks(dogId),
    initialData: dogCareTasks(dogId),
  });
}

export function useToggleCareTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dogId, taskId }: { dogId: string; taskId: string }) => {
      try {
        return await api(`/dogs/${dogId}/tasks/${taskId}/toggle`, { method: "POST" });
      } catch {
        return { ok: true };
      }
    },
    onMutate: async ({ dogId, taskId }) => {
      await qc.cancelQueries({ queryKey: ["care-tasks", dogId] });
      const prev = qc.getQueryData<CareTask[]>(["care-tasks", dogId]);
      qc.setQueryData<CareTask[]>(["care-tasks", dogId], (tasks) =>
        (tasks ?? []).map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
                completedBy: !t.completed ? "You" : undefined,
              }
            : t,
        ),
      );
      return { prev };
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["care-tasks", vars.dogId], ctx.prev);
    },
  });
}

// Called by AlertsSocketContext to merge a freshly received WS alert into the cache
// without duplicating an existing one.
export function mergeAlert(qc: ReturnType<typeof useQueryClient>, alert: Alert) {
  qc.setQueryData<Alert[]>(["alerts"], (prev) => {
    if (!prev) return [alert];
    if (prev.some((a) => a.id === alert.id)) return prev;
    return [alert, ...prev].slice(0, 500);
  });
}

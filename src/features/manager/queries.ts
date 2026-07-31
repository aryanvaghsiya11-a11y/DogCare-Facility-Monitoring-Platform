import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { COMPLIANCE, incidentTrend, incidents } from "@/lib/mock-data";
import type { TrendPoint } from "@/lib/mock-data";
import type { ComplianceItem } from "@/types/domain";

export function useIncidents() {
  return useQuery({
    queryKey: ["incidents"],
    queryFn: () => incidents(),
    initialData: incidents(),
  });
}

export function useCompliance() {
  return useQuery({
    queryKey: ["compliance"],
    queryFn: () => COMPLIANCE.map((c) => ({ ...c })),
    initialData: COMPLIANCE.map((c) => ({ ...c })),
  });
}

export function useToggleCompliance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await api(`/compliance/${id}`, { method: "POST" });
      } catch {
        return { ok: true };
      }
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["compliance"] });
      const prev = qc.getQueryData<ComplianceItem[]>(["compliance"]);
      qc.setQueryData<ComplianceItem[]>(["compliance"], (items) =>
        (items ?? []).map((c) =>
          c.id === id ? { ...c, completed: !c.completed } : c,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["compliance"], ctx.prev);
    },
  });
}

export function useTrends() {
  return useQuery({
    queryKey: ["trends"],
    queryFn: () => incidentTrend() as TrendPoint[],
    initialData: incidentTrend() as TrendPoint[],
  });
}

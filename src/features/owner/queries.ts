import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MY_DOGS, dogFeeding, dogHighlights, dogTimeline } from "@/lib/mock-data";
import type { FeedingEntry } from "@/lib/mock-data";

export function useMyDogs() {
  return useQuery({
    queryKey: ["my-dogs"],
    queryFn: () => MY_DOGS,
    initialData: MY_DOGS,
  });
}

export function useDailyTimeline(dogId: string | null) {
  return useQuery({
    queryKey: ["timeline", dogId],
    queryFn: () => (dogId ? dogTimeline(dogId) : []),
    initialData: dogId ? dogTimeline(dogId) : [],
    enabled: Boolean(dogId),
  });
}

export function useFeedingLog(dogId: string | null) {
  return useQuery({
    queryKey: ["feeding", dogId],
    queryFn: () => (dogId ? dogFeeding(dogId) : []),
    initialData: dogId ? dogFeeding(dogId) : [],
    enabled: Boolean(dogId),
  });
}

export function useToggleFeeding(dogId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mealId: string) => {
      try {
        return await api(`/dogs/${dogId}/feeding/${mealId}`, { method: "POST" });
      } catch {
        return { ok: true };
      }
    },
    onMutate: async (mealId) => {
      if (!dogId) return { prev: undefined };
      await qc.cancelQueries({ queryKey: ["feeding", dogId] });
      const prev = qc.getQueryData<FeedingEntry[]>(["feeding", dogId]);
      qc.setQueryData<FeedingEntry[]>(["feeding", dogId], (meals) =>
        (meals ?? []).map((m) => (m.id === mealId ? { ...m, fed: true } : m)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (dogId && ctx?.prev) qc.setQueryData(["feeding", dogId], ctx.prev);
    },
  });
}

export function useHighlights(dogId: string | null) {
  return useQuery({
    queryKey: ["highlights", dogId],
    queryFn: () => (dogId ? dogHighlights(dogId) : []),
    initialData: dogId ? dogHighlights(dogId) : [],
    enabled: Boolean(dogId),
  });
}

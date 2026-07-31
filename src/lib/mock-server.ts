// In-memory mock API used only when the real backend is unreachable.
// Mirrors the endpoint shapes the query hooks expect so the UI stays
// fully populated during local development and demos.
import { ApiError } from "@/lib/errors";
import {
  ALERTS,
  COMPLIANCE,
  DOGS,
  MY_DOGS,
  dogCareTasks,
  dogFeeding,
  dogHighlights,
  dogTimeline,
  incidentTrend,
  incidents,
  zoneOccupancy,
} from "@/lib/mock-data";

const alerts = [...ALERTS];
const compliance = COMPLIANCE.map((c) => ({ ...c }));

interface MockRequest {
  method: string;
  path: string;
  body?: unknown;
}

export function handleMock<T = unknown>(pathWithQuery: string, req: MockRequest): Promise<T> {
  const [rawPath = "/", query = ""] = pathWithQuery.split("?");
  const params = new URLSearchParams(query);
  const path = rawPath.replace(/^\/+/, "");

  try {
    if (path === "dogs" && req.method === "GET") return Promise.resolve(DOGS as T);
    if (path === "my/dogs" && req.method === "GET")
      return Promise.resolve(MY_DOGS as T);

    if (path === "alerts" && req.method === "GET") {
      const limit = Number(params.get("limit") ?? 50);
      return Promise.resolve(alerts.slice(0, limit) as T);
    }

    const ack = path.match(/^alerts\/([^/]+)\/ack$/);
    if (ack && req.method === "POST") {
      const id = ack[1];
      const found = alerts.find((a) => a.id === id);
      if (!found) throw new ApiError(404, `Alert ${id} not found`);
      found.acknowledged = true;
      return Promise.resolve({ ok: true } as T);
    }

    if (path === "incidents" && req.method === "GET")
      return Promise.resolve(incidents() as T);
    if (path === "trends" && req.method === "GET")
      return Promise.resolve(incidentTrend() as T);
    if (path === "zones" && req.method === "GET")
      return Promise.resolve(zoneOccupancy() as T);

    const complianceToggle = path.match(/^compliance\/([^/]+)$/);
    if (complianceToggle && req.method === "POST") {
      const found = compliance.find((c) => c.id === complianceToggle[1]);
      if (!found) throw new ApiError(404, `Compliance item not found`);
      found.completed = !found.completed;
      return Promise.resolve({ ok: true } as T);
    }

    const dogMatch = path.match(/^dogs\/([^/]+)\/(.+)$/);
    if (dogMatch) {
      const dogId = dogMatch[1]!;
      const resource = dogMatch[2]!;
      if (!DOGS.some((d) => d.id === dogId))
        throw new ApiError(404, `Dog ${dogId} not found`);
      if (resource === "timeline" && req.method === "GET")
        return Promise.resolve(dogTimeline(dogId) as T);
      if (resource === "feeding" && req.method === "GET")
        return Promise.resolve(dogFeeding(dogId) as T);
      if (resource === "highlights" && req.method === "GET")
        return Promise.resolve(dogHighlights(dogId) as T);
      if (resource === "tasks" && req.method === "GET")
        return Promise.resolve(dogCareTasks(dogId) as T);
    }

    const taskToggle = path.match(/^dogs\/([^/]+)\/tasks\/([^/]+)$/);
    if (taskToggle && req.method === "POST") {
      const dogId = taskToggle[1]!;
      const taskId = taskToggle[2]!;
      const tasks = dogCareTasks(dogId);
      const found = tasks.find((t) => t.id === taskId);
      if (!found) throw new ApiError(404, `Task ${taskId} not found`);
      return Promise.resolve({ ok: true } as T);
    }

    const mealToggle = path.match(/^dogs\/([^/]+)\/feeding\/([^/]+)$/);
    if (mealToggle && req.method === "POST") {
      const dogId = mealToggle[1]!;
      const mealId = mealToggle[2]!;
      const meals = dogFeeding(dogId);
      const found = meals.find((m) => m.id === mealId);
      if (!found) throw new ApiError(404, `Meal ${mealId} not found`);
      return Promise.resolve({ ok: true } as T);
    }

    if (path === "compliance" && req.method === "GET")
      return Promise.resolve(compliance as T);

    throw new ApiError(404, `No mock handler for ${req.method} ${path}`);
  } catch (err) {
    return Promise.reject(err);
  }
}

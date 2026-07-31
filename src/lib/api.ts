// Tiny fetch wrapper. Auth header is added by middleware on server requests.
// For client-side calls we lean on the httpOnly cookie the browser sends automatically.
// When the backend is unreachable (no server running in dev/demo), requests fall back
// to an in-memory mock so every page renders fully populated.
import { handleMock } from "@/lib/mock-server";
import { ApiError } from "@/lib/errors";

interface ApiOptions extends RequestInit {
  json?: unknown;
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (opts.json !== undefined) {
    headers.set("content-type", "application/json");
  }
  headers.set("accept", "application/json");

  const url = path.startsWith("http") ? path : `${process.env.NEXT_PUBLIC_API_URL}${path}`;

  // A dead backend can make fetch hang (connection refused / blackholed) instead of
  // rejecting, which would leave every query in a permanent loading state. Abort after
  // a short grace period so the mock fallback below always fires in demo mode.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  const onExternalAbort = () => controller.abort();
  if (opts.signal) opts.signal.addEventListener("abort", onExternalAbort, { once: true });

  let res: Response;
  try {
    res = await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers,
      body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
      credentials: "include",
    });
  } catch {
    // Network error or timeout — backend is unreachable. Serve demo data from the mock router.
    return handleMock<T>(path, {
      method: opts.method ?? "GET",
      path,
      body: opts.json,
    });
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener("abort", onExternalAbort);
  }

  if (!res.ok) {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch {
      // not JSON, ignore
    }
    throw new ApiError(res.status, `Request failed: ${res.status}`, body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

"use client";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { useIncidents } from "@/features/manager/queries";
import type { Incident } from "@/types/domain";

type Filters = { q: string; severity: "" | "critical" | "high" | "normal" };

const SEVERITIES = [
  ["", "All"],
  ["critical", "Critical"],
  ["high", "High"],
  ["normal", "Normal"],
] as const;

// Renders the seeded `minutesAgo` as a relative label so the table is stable
// across server render, hydration, and reloads (no Date.now() at render time).
export function relativeTime(minutesAgo: number): string {
  if (minutesAgo < 60) return `${Math.max(1, minutesAgo)}m ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function IncidentTable() {
  const { data, isLoading, isError } = useIncidents();
  const [filters, setFilters] = useState<Filters>({ q: "", severity: "" });
  const set = useDebouncedCallback(setFilters, 200);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((row) => {
      if (filters.q && !row.notes.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.severity === "") return true;
      return row.severity === filters.severity;
    });
  }, [data, filters]);

  return (
    <div className="space-y-md">
      <form
        className="flex flex-wrap items-center gap-sm"
        aria-label="Filter incidents"
        onChange={(e) => {
          const f = new FormData(e.currentTarget);
          set({
            q: String(f.get("q") ?? ""),
            severity: (String(f.get("severity") ?? "") as Filters["severity"]) ?? "",
          });
        }}
      >
        <label className="relative text-sm">
          <span className="sr-only">Search notes</span>
          <Search
            className="pointer-events-none absolute left-sm top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            name="q"
            placeholder="Search notes…"
            className="w-56 rounded-lg border border-slate-200 bg-white py-xs pl-xl pr-sm text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500"
          />
        </label>
        <label className="text-sm">
          <span className="sr-only">Severity</span>
          <select
            name="severity"
            className="rounded-lg border border-slate-200 bg-white px-sm py-xs text-sm shadow-sm focus:border-brand-500"
          >
            {SEVERITIES.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} incidents</span>
      </form>

      {isError ? (
        <p role="alert" className="text-severity-critical">
          Failed to load incidents.
        </p>
      ) : isLoading ? (
        <p role="status" className="text-sm text-slate-500">
          Loading incidents…
        </p>
      ) : (
        <VirtualRows rows={filtered} />
      )}
    </div>
  );
}

function StatusPill({ resolved }: { resolved: boolean }) {
  return resolved ? (
    <span className="inline-flex items-center rounded-full bg-severity-normal/10 px-sm py-xs text-xs font-medium text-severity-normal">
      Resolved
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-severity-high/10 px-sm py-xs text-xs font-medium text-severity-high">
      Open
    </span>
  );
}

function VirtualRows({ rows }: { rows: Incident[] }) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  if (rows.length === 0)
    return (
      <p role="status" className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-md py-lg text-center text-sm text-slate-500">
        No incidents match those filters.
      </p>
    );

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      tabIndex={0}
      className="max-h-[500px] overflow-y-auto rounded-card border border-slate-200/80 bg-white shadow-card"
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100 text-left border-b border-slate-200">
          <tr className="text-xs font-bold uppercase tracking-wider text-slate-600">
            <th className="p-sm">When</th>
            <th className="p-sm">Dog</th>
            <th className="p-sm">Severity</th>
            <th className="p-sm">Notes</th>
            <th className="p-sm">Status</th>
          </tr>
        </thead>
        {virtualItems.length > 0 ? (
          <tbody style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualItems.map((v) => {
              const row = rows[v.index];
              if (!row) return null;
              return (
                <tr
                  key={row.id}
                  style={{
                    position: "absolute",
                    top: v.start,
                    left: 0,
                    right: 0,
                    height: v.size,
                  }}
                  className="border-b border-slate-100 transition-colors odd:bg-white even:bg-slate-50/40 hover:bg-brand-50/40"
                >
                  <td className="p-sm tabular-nums text-xs text-slate-600">
                    {relativeTime(row.minutesAgo)}
                  </td>
                  <td className="p-sm">
                    <span className="inline-flex items-center gap-xs font-semibold text-slate-900">
                      <span className="grid size-6 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800 border border-brand-200">
                        {row.dogName?.[0]?.toUpperCase() ?? "?"}
                      </span>
                      {row.dogName ?? "—"}
                    </span>
                  </td>
                  <td className="p-sm">
                    <SeverityBadge severity={row.severity ?? (row.resolved ? "normal" : "high")} />
                  </td>
                  <td className="p-sm text-slate-700">{row.notes}</td>
                  <td className="p-sm">
                    <StatusPill resolved={row.resolved} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        ) : (
          <tbody>
            {rows.slice(0, 50).map((row) => (
              <tr key={row.id} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/40">
                <td className="p-sm tabular-nums text-xs text-slate-600">
                  {relativeTime(row.minutesAgo)}
                </td>
                <td className="p-sm font-semibold text-slate-900">{row.dogName}</td>
                <td className="p-sm">
                  <SeverityBadge severity={row.severity ?? (row.resolved ? "normal" : "high")} />
                </td>
                <td className="p-sm text-slate-700">{row.notes}</td>
                <td className="p-sm">
                  <StatusPill resolved={row.resolved} />
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}

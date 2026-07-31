"use client";

import { Check } from "lucide-react";
import clsx from "clsx";
import { useCompliance, useToggleCompliance } from "@/features/manager/queries";

export function ComplianceChecklist() {
  const { data, isLoading, isError } = useCompliance();
  const toggle = useToggleCompliance();

  const items = data ?? [];
  const done = items.filter((i) => i.completed).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

  if (isError) {
    return (
      <p role="alert" className="text-severity-critical">
        Failed to load compliance items.
      </p>
    );
  }

  return (
    <div className="space-y-md">
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            {done} of {items.length} complete
          </span>
          <span className="tabular-nums font-semibold text-brand-700">{pct}%</span>
        </div>
        <div
          className="mt-xs h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Compliance completion"
        >
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {isLoading ? (
        <p role="status" className="text-sm text-slate-500">
          Loading…
        </p>
      ) : (
        <ul className="space-y-xs">
          {items.map((it) => (
            <li key={it.id}>
              <label
                className={clsx(
                  "flex cursor-pointer items-center gap-sm rounded-lg border px-sm py-xs text-sm transition-colors",
                  it.completed
                    ? "border-brand-200/70 bg-brand-50/50"
                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50",
                )}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={it.completed}
                  aria-label={it.label}
                  onClick={() => toggle.mutate(it.id)}
                  className={clsx(
                    "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                    it.completed
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300 bg-white text-transparent",
                  )}
                >
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </button>
                <span
                  className={clsx(
                    "flex-1",
                    it.completed ? "text-slate-500 line-through" : "text-slate-800",
                  )}
                >
                  {it.label}
                </span>
                <span className="rounded-full bg-slate-100 px-sm py-xs text-xs capitalize text-slate-500">
                  {it.shift}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

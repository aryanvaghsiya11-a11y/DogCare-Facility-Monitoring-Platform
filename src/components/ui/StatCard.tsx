import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "brand",
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "brand" | "critical" | "high" | "normal" | "neutral";
}) {
  const chip = {
    brand: "bg-brand-gradient text-white shadow-glow",
    critical: "bg-severity-critical/10 text-severity-critical",
    high: "bg-severity-high/10 text-severity-high",
    normal: "bg-severity-normal/10 text-severity-normal",
    neutral: "bg-slate-100 text-slate-600",
  }[tone];

  return (
    <div className="flex items-center gap-md rounded-card border border-slate-200/80 bg-white p-md shadow-card transition-shadow hover:shadow-lift">
      <span className={clsx("grid size-11 shrink-0 place-items-center rounded-xl", chip)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
        {hint ? <p className="truncate text-xs text-slate-400">{hint}</p> : null}
      </div>
    </div>
  );
}

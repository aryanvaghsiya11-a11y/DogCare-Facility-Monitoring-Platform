import clsx from "clsx";
import { AlertTriangle, ArrowUp, CheckCircle2, type LucideIcon } from "lucide-react";
import type { Severity } from "@/types/domain";

// Color is paired with an icon AND a text label. Colorblind staff must still
// be able to triage alerts correctly.
const META: Record<Severity, { icon: LucideIcon; pill: string; dot: string }> = {
  critical: {
    icon: AlertTriangle,
    pill: "bg-severity-critical/10 text-severity-critical",
    dot: "bg-severity-critical",
  },
  high: {
    icon: ArrowUp,
    pill: "bg-severity-high/10 text-severity-high",
    dot: "bg-severity-high",
  },
  normal: {
    icon: CheckCircle2,
    pill: "bg-severity-normal/10 text-severity-normal",
    dot: "bg-severity-normal",
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { icon: Icon, pill, dot } = META[severity];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-xs rounded-full border border-slate-900/5 px-sm py-xs text-xs font-medium",
        pill,
      )}
      aria-label={`Severity: ${severity}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="capitalize">{severity}</span>
      <span className={clsx("size-1.5 rounded-full", dot)} aria-hidden="true" />
    </span>
  );
}

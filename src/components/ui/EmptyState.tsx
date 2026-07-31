import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-slate-200 bg-slate-50/50 px-md py-xl text-center text-slate-600" role="status">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-slate-400 shadow-card">
        <Inbox className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-sm font-medium text-slate-900">{title}</h3>
      {description ? <p className="mt-xs text-sm">{description}</p> : null}
      {action ? <div className="mt-md">{action}</div> : null}
    </div>
  );
}

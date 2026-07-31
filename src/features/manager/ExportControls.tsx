"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { useIncidents } from "@/features/manager/queries";
import { relativeTime } from "@/features/manager/IncidentTable";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((cells) => cells.map((c) => `"${c.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportControls({ onExport }: { onExport: (format: "csv" | "pdf") => Promise<void> }) {
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);
  const { data } = useIncidents();

  const run = async (format: "csv" | "pdf") => {
    setBusy(format);
    try {
      if (format === "csv") {
        const rows = (data ?? []).map((inc) => [
          inc.id,
          inc.dogName ?? "",
          inc.severity ?? "",
          inc.resolved ? "resolved" : "open",
          relativeTime(inc.minutesAgo),
          inc.notes,
        ]);
        downloadCsv("incidents.csv", [
          ["id", "dog", "severity", "status", "when", "notes"],
          ...rows,
        ]);
      }
      await onExport(format);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex gap-sm">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => run("csv")}
        className="inline-flex items-center gap-xs rounded-lg border border-slate-200 bg-white px-sm py-xs text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
      >
        {busy === "csv" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <FileSpreadsheet className="size-4 text-brand-600" aria-hidden="true" />
        )}
        {busy === "csv" ? "Preparing…" : "Export CSV"}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => run("pdf")}
        className="inline-flex items-center gap-xs rounded-lg bg-brand-600 px-sm py-xs text-sm font-medium text-white shadow-card transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {busy === "pdf" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <FileDown className="size-4" aria-hidden="true" />
        )}
        {busy === "pdf" ? "Preparing…" : "Export PDF"}
      </button>
    </div>
  );
}

"use client";

import { AlertTriangle, CheckCircle2, ClipboardList, ShieldAlert } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { useIncidents, useCompliance } from "@/features/manager/queries";
import { IncidentTable } from "@/features/manager/IncidentTable";
import { ComplianceChecklist } from "@/features/manager/ComplianceChecklist";
import { TrendCharts } from "@/features/manager/TrendCharts";
import { ExportControls } from "@/features/manager/ExportControls";

const DAY_MS = 24 * 60; // minutes in a day

export function ManagerDashboard() {
  const { data: incidents } = useIncidents();
  const { data: compliance } = useCompliance();

  const list = incidents ?? [];
  const open = list.filter((i) => !i.resolved);
  const critical = open.filter((i) => i.severity === "critical");
  const resolvedToday = list.filter((i) => i.resolved && i.minutesAgo < DAY_MS);

  const items = compliance ?? [];
  const complianceDone = items.filter((c) => c.completed).length;
  const compliancePct = items.length > 0 ? Math.round((complianceDone / items.length) * 100) : 0;

  async function exportAction(format: "csv" | "pdf") {
    // Records the export server-side for audit. Body holds optional filter state.
    await fetch(`/api/exports/${format}`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scope: "compliance" }),
    });
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-wrap items-end justify-between gap-sm">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Manager Dashboard
          </h1>
          <p className="mt-xs text-sm text-slate-500">
            Facility-wide incidents, compliance, and trends.
          </p>
        </div>
        <ExportControls onExport={exportAction} />
      </div>

      <div className="grid grid-cols-2 gap-md lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Open incidents"
          value={open.length}
          hint="Needs attention"
          tone="high"
        />
        <StatCard
          icon={ShieldAlert}
          label="Critical"
          value={critical.length}
          hint="Severity critical"
          tone="critical"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved today"
          value={resolvedToday.length}
          hint="Last 24 hours"
          tone="normal"
        />
        <StatCard
          icon={AlertTriangle}
          label="Compliance"
          value={`${compliancePct}%`}
          hint={`${complianceDone} of ${items.length} items done`}
          tone="brand"
        />
      </div>

      <ErrorBoundary scope="Incidents">
        <Card>
          <CardHeader>
            <h2 className="font-semibold tracking-tight">Incidents</h2>
          </CardHeader>
          <CardBody>
            <IncidentTable />
          </CardBody>
        </Card>
      </ErrorBoundary>

      <div className="grid gap-lg md:grid-cols-2">
        <ErrorBoundary scope="Compliance">
          <Card>
            <CardHeader>
              <h2 className="font-semibold tracking-tight">Compliance checklist</h2>
            </CardHeader>
            <CardBody>
              <ComplianceChecklist />
            </CardBody>
          </Card>
        </ErrorBoundary>

        <ErrorBoundary scope="Trends">
          <Card>
            <CardHeader>
              <h2 className="font-semibold tracking-tight">14-day incident trend</h2>
            </CardHeader>
            <CardBody>
              <TrendCharts />
            </CardBody>
          </Card>
        </ErrorBoundary>
      </div>
    </div>
  );
}

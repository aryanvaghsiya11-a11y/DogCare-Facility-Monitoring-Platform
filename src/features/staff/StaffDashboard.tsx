"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Video } from "lucide-react";
import { useAlerts } from "@/context/AlertsSocketContext";
import { useAlerts as useAlertsQuery, useAcknowledgeAlert, mergeAlert, useDogs, useZones } from "@/features/staff/queries";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { CareBoard } from "@/features/staff/CareBoard";
import type { Dog } from "@/types/domain";
import { dogProfile } from "@/lib/mock-data";

export function StaffDashboard() {
  return (
    <div className="space-y-lg">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Staff Dashboard</h1>
        <p className="mt-xs text-sm text-slate-500">Live alerts, occupancy, and dog status.</p>
      </div>
      <ErrorBoundary scope="Live alerts">
        <LiveAlertsPanel />
      </ErrorBoundary>
      <ErrorBoundary scope="Care board">
        <CareBoard />
      </ErrorBoundary>
      <ErrorBoundary scope="Zone occupancy">
        <ZoneOccupancy />
      </ErrorBoundary>
      <ErrorBoundary scope="Dog status">
        <DogStatusGrid />
      </ErrorBoundary>
    </div>
  );
}

function LiveAlertsPanel() {
  const ws = useAlerts();
  const qc = useQueryClient();
  const ack = useAcknowledgeAlert();

  // Merge incoming WS alerts into the React Query cache so server and live state stay coherent.
  useEffect(() => {
    const newest = ws.alerts[0];
    if (newest) mergeAlert(qc, newest);
  }, [ws.alerts, qc]);

  const { data, isLoading, isError, refetch } = useAlertsQuery();

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <h2 className="font-semibold tracking-tight">Live alerts</h2>
        </CardHeader>
        <CardBody>
          <p role="alert" className="text-severity-critical">
            Failed to load alerts.
          </p>
          <button onClick={() => refetch()} className="mt-sm text-sm underline">
            Retry
          </button>
        </CardBody>
      </Card>
    );
  }

  const alerts = data ?? [];
  const open = alerts.filter((a) => !a.acknowledged);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="font-semibold tracking-tight">Live alerts</h2>
        {!isLoading && alerts.length > 0 ? (
          <span className="rounded-full bg-brand-50 px-sm py-xs text-xs font-medium text-brand-700">
            {open.length} unacknowledged
          </span>
        ) : null}
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="space-y-sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState title="No active alerts" description="You're all caught up." />
        ) : (
          <ul className="space-y-sm" aria-label="Active alerts">
            {alerts.slice(0, 50).map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-md rounded-lg border border-slate-100 bg-slate-50/50 px-sm py-sm transition-colors hover:border-slate-200"
              >
                <span className="relative flex size-2.5 shrink-0">
                  {!a.acknowledged ? (
                    <span
                      aria-hidden="true"
                      className="absolute inline-flex size-full animate-ping rounded-full bg-severity-critical/60"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className={
                      a.acknowledged
                        ? "relative inline-flex size-2.5 rounded-full bg-slate-300"
                        : "relative inline-flex size-2.5 rounded-full bg-severity-critical"
                    }
                  />
                </span>
                <SeverityBadge severity={a.severity} />
                <span className="flex-1 text-sm text-slate-700">{a.message}</span>
                {a.clipUrl ? (
                  <a
                    href={a.clipUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex shrink-0 items-center gap-xs text-xs font-medium text-brand-700 underline-offset-2 hover:underline"
                  >
                    <Video className="size-4" aria-hidden="true" />
                    View clip
                  </a>
                ) : null}
                <button
                  onClick={() => ack.mutate(a.id)}
                  disabled={a.acknowledged || ack.isPending}
                  className="shrink-0 inline-flex items-center gap-xs rounded-lg border border-slate-200 bg-white px-sm py-xs text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {a.acknowledged ? (
                    <>
                      <Check className="size-3.5" aria-hidden="true" /> Acked
                    </>
                  ) : (
                    "Acknowledge"
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function ZoneOccupancy() {
  const { data } = useZones();
  const zones = data ?? [];
  const max = Math.max(1, ...zones.map((z) => z.current));

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold tracking-tight">Zone occupancy</h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-md md:grid-cols-4">
          {zones.map((z) => {
            const pct = z.capacity > 0 ? Math.round((z.current / z.capacity) * 100) : 0;
            const tone =
              pct > 75
                ? "from-severity-critical/80 to-severity-critical"
                : pct > 50
                  ? "from-accent-500/80 to-accent-600"
                  : "from-brand-500/80 to-brand-600";
            return (
              <div
                key={z.zone}
                className="rounded-card border border-slate-200/80 bg-white p-md text-center shadow-card"
              >
                <div className="text-sm text-slate-500">Zone {z.zone}</div>
                <div className="mt-xs text-2xl font-semibold tracking-tight text-slate-900">
                  {pct}%
                </div>
                <div className="mt-sm h-xs overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-700`}
                    style={{ width: `${(z.current / max) * 100}%` }}
                  />
                </div>
                <div className="mt-xs text-xs text-slate-400">
                  {z.current} / {z.capacity} · {pct > 75 ? "Near capacity" : pct > 50 ? "Moderate" : "Plenty of room"}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

function FeedingPill({ status }: { status: Dog["feedingStatus"] }) {
  const styles = {
    on_track: "bg-severity-normal/10 text-severity-normal",
    overdue: "bg-severity-high/10 text-severity-high",
    skipped: "bg-severity-critical/10 text-severity-critical",
  }[status];
  return (
    <span className={`rounded-full px-sm py-xs text-xs font-medium capitalize ${styles}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function DogStatusGrid() {
  const { data, isLoading, isError } = useDogs();
  const [expanded, setExpanded] = useState<string | null>(null);
  if (isError) return <EmptyState title="Could not load dogs" />;
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }
  const dogs = data ?? [];
  return (
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
      {dogs.map((d) => (
        <button
          key={d.id}
          onClick={() => setExpanded(expanded === d.id ? null : d.id)}
          aria-expanded={expanded === d.id}
          className="rounded-card border border-slate-200/80 bg-white p-md text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
        >
          <div className="flex items-center gap-sm">
            <Image
              src={d.photoUrl ?? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80"}
              alt={d.name}
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-full object-cover border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-slate-900">{d.name}</h3>
              <span className="text-xs text-slate-500">Zone {d.zone}</span>
            </div>
            <ChevronDown
              className={`size-4 text-slate-400 transition-transform ${expanded === d.id ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </div>

          <div className="mt-sm">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Activity</span>
              <span className="tabular-nums font-medium text-slate-800">{d.activityScore}%</span>
            </div>
            <div className="mt-xs h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-500"
                style={{ width: `${d.activityScore}%` }}
              />
            </div>
          </div>

          <div className="mt-sm flex items-center justify-between">
            <span className="text-sm text-slate-500">Feeding</span>
            <FeedingPill status={d.feedingStatus} />
          </div>

          {expanded === d.id ? (
            <div className="mt-sm border-t border-slate-100 pt-sm space-y-xs text-xs text-slate-600 animate-fade-in-up bg-slate-50/70 p-2 rounded-lg border border-slate-100">
              {(() => {
                const prof = dogProfile(d.id);
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Microchip ID:</span>
                      <span className="font-semibold text-slate-800">{prof.microchipId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Breed:</span>
                      <span className="font-medium text-slate-800">{prof.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Age / Weight:</span>
                      <span className="font-medium text-slate-800">{prof.ageYears} yrs / {prof.weightKg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Owner Contact:</span>
                      <span className="font-semibold text-brand-700">{prof.ownerName} ({prof.ownerPhone})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vet Clinic:</span>
                      <span className="font-medium text-slate-800">{prof.vetName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Diet Notes:</span>
                      <span className="font-medium text-amber-800">{prof.diet}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
}

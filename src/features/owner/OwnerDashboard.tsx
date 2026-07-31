"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Camera, CheckCircle2, Utensils } from "lucide-react";
import {
  useMyDogs,
  useDailyTimeline,
  useFeedingLog,
  useToggleFeeding,
  useHighlights,
} from "@/features/owner/queries";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { MY_DOGS, dogProfile } from "@/lib/mock-data";

export function OwnerDashboard() {
  const { data: dogs, isLoading: dogsLoading } = useMyDogs();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dogsArr = dogs && dogs.length > 0 ? dogs : MY_DOGS;
  const activeId = selectedId ?? dogsArr[0]?.id ?? "dog_1";
  const activeDog = dogsArr.find((d) => d.id === activeId) ?? dogsArr[0];

  const [search, setSearch] = useState("");

  const filteredDogs = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return dogsArr;
    return dogsArr.filter((d) => {
      const prof = dogProfile(d.id);
      return (
        d.name.toLowerCase().includes(q) ||
        prof.breed.toLowerCase().includes(q) ||
        d.zone.toLowerCase().includes(q) ||
        prof.microchipId.toLowerCase().includes(q) ||
        prof.ownerName.toLowerCase().includes(q)
      );
    });
  }, [dogsArr, search]);

  return (
    <div className="space-y-md">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Facility Dogs Directory</h1>
        <p className="mt-xs text-sm text-slate-500">
          Select any dog from the sidebar to view full activity, feeding logs, and health profile.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-12">
        {/* Left Sidebar Dog Directory */}
        <div className="lg:col-span-4 space-y-sm">
          <div className="rounded-card border border-slate-200/80 bg-white p-sm shadow-card space-y-sm">
            <input
              type="text"
              placeholder="Search by name, breed or zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-sm py-xs text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <div className="max-h-[600px] overflow-y-auto space-y-xs pr-xs">
              {dogsLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
              ) : filteredDogs.length === 0 ? (
                <p className="p-sm text-center text-xs text-slate-400">No dogs found matching &quot;{search}&quot;</p>
              ) : (
                filteredDogs.map((d) => {
                  const isSelected = d.id === activeId;
                  const prof = dogProfile(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(d.id);
                      }}
                      className={`w-full flex items-center gap-md rounded-2xl p-xs transition-all duration-200 border text-left cursor-pointer select-none ${
                        isSelected
                          ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white border-brand-500 shadow-lift scale-[1.01]"
                          : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 hover:border-brand-300 shadow-xs"
                      }`}
                    >
                      <div className="relative size-11 shrink-0">
                        <Image
                          src={d.photoUrl ?? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80"}
                          alt={d.name}
                          width={44}
                          height={44}
                          className="size-full rounded-xl object-cover border border-white/60 shadow-xs"
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${
                          d.feedingStatus === "on_track" ? "bg-emerald-500" : d.feedingStatus === "overdue" ? "bg-rose-500" : "bg-amber-500"
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate font-bold text-sm tracking-tight">{d.name}</span>
                          <span className={`text-[10px] rounded-md px-1.5 py-0.5 font-bold uppercase tracking-wider ${
                            isSelected ? "bg-white/20 text-white" : "bg-brand-50 text-brand-700 border border-brand-200"
                          }`}>
                            Zone {d.zone}
                          </span>
                        </div>
                        <p className={`truncate text-xs font-medium ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                          {prof.breed}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-8 space-y-lg">
          {activeDog ? (
            <ErrorBoundary scope="Dog Profile">
              <DogProfileCard key={activeId} dog={activeDog} />
            </ErrorBoundary>
          ) : null}

          {activeId ? (
            <ErrorBoundary scope="Summary stats">
              <SummaryStats key={activeId} dogId={activeId} />
            </ErrorBoundary>
          ) : null}

          <div className="grid gap-lg lg:grid-cols-2">
            {activeId ? (
              <ErrorBoundary scope="Daily timeline">
                <DailyTimeline key={activeId} dogId={activeId} />
              </ErrorBoundary>
            ) : null}

            {activeId ? (
              <ErrorBoundary scope="Feeding log">
                <FeedingLog key={activeId} dogId={activeId} />
              </ErrorBoundary>
            ) : null}
          </div>

          {activeId ? (
            <ErrorBoundary scope="Highlights">
              <Highlights key={activeId} dogId={activeId} />
            </ErrorBoundary>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DogProfileCard({ dog }: { dog: any }) {
  const profile = dogProfile(dog.id);
  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white shadow-card">
      <div className="p-md space-y-md">
        <div className="flex flex-col md:flex-row items-center gap-md">
          <div className="relative size-32 shrink-0 overflow-hidden rounded-2xl border-2 border-brand-200 shadow-md">
            <Image
              src={dog.photoUrl ?? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80"}
              alt={dog.name}
              width={128}
              height={128}
              className="size-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 text-center md:text-left space-y-xs">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-xs">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{dog.name}</h2>
              <span className="rounded-full bg-brand-50 px-sm py-xs text-xs font-bold text-brand-700 border border-brand-200">
                Zone {dog.zone}
              </span>
              <span className="rounded-full bg-slate-100 px-sm py-xs text-xs font-semibold text-slate-600 border border-slate-200">
                ID: {profile.microchipId}
              </span>
            </div>
            <p className="text-base font-semibold text-brand-700">{profile.breed}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-sm pt-xs text-xs">
              <span className="rounded-lg bg-slate-100 px-sm py-xs font-medium text-slate-700 border border-slate-200">
                Age: <strong className="text-slate-900 font-bold">{profile.ageYears} yrs</strong>
              </span>
              <span className="rounded-lg bg-slate-100 px-sm py-xs font-medium text-slate-700 border border-slate-200">
                Weight: <strong className="text-slate-900 font-bold">{profile.weightKg} kg</strong>
              </span>
              <span className="rounded-lg bg-amber-50 text-amber-800 border border-amber-200 px-sm py-xs font-medium">
                Diet: <strong>{profile.diet}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Owner & Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-sm pt-sm border-t border-slate-100 text-xs">
          <div className="rounded-xl bg-slate-50 p-sm border border-slate-200/60 space-y-xs">
            <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-500">Owner & Primary Contacts</h3>
            <div className="space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Owner:</span>
                <span className="font-semibold text-slate-900">{profile.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-brand-700">{profile.ownerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency:</span>
                <span className="font-medium text-slate-800">{profile.emergencyContact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vet Clinic:</span>
                <span className="font-medium text-slate-800">{profile.vetName}</span>
              </div>
              <div className="flex justify-between pt-xs">
                <span className="text-slate-500">Grooming:</span>
                <span className="font-medium text-slate-800">{profile.groomingSchedule}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-sm border border-slate-200/60 space-y-xs">
            <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-500">Health, Behavior & Routine</h3>
            <div className="space-y-1.5 text-slate-700">
              <div className="flex flex-wrap items-center gap-xs">
                <span className="text-slate-500">Behavior:</span>
                <span className="rounded bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 font-bold text-[10px]">
                  {profile.behaviorStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-xs">
                <span className="text-slate-500">Vaccines:</span>
                {profile.vaccinations.map((vac, i) => (
                  <span key={i} className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 font-semibold text-[10px]">
                    {vac}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-xs">
                <span className="text-slate-500">Allergies:</span>
                {profile.allergies.map((alg, i) => (
                  <span key={i} className="rounded bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 font-semibold text-[10px]">
                    {alg}
                  </span>
                ))}
              </div>
              <div className="text-slate-600 pt-0.5">
                <span className="text-slate-500">Favorite Activity:</span> <strong className="text-slate-800">{profile.favoriteActivity}</strong>
              </div>
              <p className="text-slate-600 leading-relaxed italic border-t border-slate-200/60 pt-1">
                &quot;{profile.medicalNotes}&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SummaryStats({ dogId }: { dogId: string }) {
  const { data, isLoading } = useDailyTimeline(dogId);
  const total = (data ?? []).reduce((sum, d) => sum + d.activity, 0);
  const peaks = (data ?? []).filter((d) => d.activity > 0).length;
  return (
    <div className="grid grid-cols-3 gap-md">
      <StatCard icon={Activity} label="Activity points" value={isLoading ? "…" : total} tone="brand" />
      <StatCard icon={Utensils} label="Active hours" value={isLoading ? "…" : peaks} tone="normal" />
      <StatCard
        icon={CheckCircle2}
        label="Feeding"
        value="On track"
        tone="neutral"
      />
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-sm py-xs text-sm shadow-card">
      <p className="font-medium text-slate-900">{label}:00</p>
      <p className="text-brand-600">{payload[0]?.value} activity</p>
    </div>
  );
}

function DailyTimeline({ dogId }: { dogId: string }) {
  const { data, isLoading, isError } = useDailyTimeline(dogId);
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold tracking-tight">Today&apos;s activity</h2>
      </CardHeader>
      <CardBody>
        {isError ? (
          <p role="alert" className="text-severity-critical">
            Failed to load activity.
          </p>
        ) : isLoading ? (
          <Skeleton className="h-44 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No activity recorded yet today." />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="hour"
                tickFormatter={(h: number) => `${h}`}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(16,181,124,0.08)" }} />
              <Bar dataKey="activity" radius={[6, 6, 0, 0]} fill="#16b57c" maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}

function FeedingLog({ dogId }: { dogId: string }) {
  const { data, isLoading } = useFeedingLog(dogId);
  const markFed = useToggleFeeding(dogId);
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold tracking-tight">Feeding log</h2>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <ul className="space-y-sm">
            {(data ?? []).map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-md rounded-lg border border-slate-100 px-sm py-sm transition-colors hover:border-slate-200"
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full ${
                    f.fed
                      ? "bg-severity-normal/10 text-severity-normal"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Utensils className="size-4" aria-hidden="true" />
                </span>
                <span className="tabular-nums text-sm font-medium text-slate-800">{f.time}</span>
                <span className="flex-1 text-sm text-slate-500">{f.portion}</span>
                {f.fed ? (
                  <span className="rounded-full bg-severity-normal/10 px-sm py-xs text-xs font-medium text-severity-normal">
                    Fed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => markFed.mutate(f.id)}
                    disabled={markFed.isPending}
                    className="rounded-full border border-brand-200 bg-brand-50 px-sm py-xs text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
                  >
                    Mark fed
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function Highlights({ dogId }: { dogId: string }) {
  const { data, isLoading } = useHighlights(dogId);
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold tracking-tight">Today&apos;s highlights</h2>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No photos today yet." />
        ) : (
          <ul className="grid grid-cols-3 gap-sm sm:grid-cols-4">
            {data.map((h) => (
              <li key={h.id}>
                <div className="group relative aspect-square overflow-hidden rounded-card border border-slate-200/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.thumbnailUrl}
                    alt={`Highlight from ${h.takenAt}`}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <Camera className="size-5 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

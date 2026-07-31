"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ListChecks } from "lucide-react";
import { useCareTasks, useDogs, useToggleCareTask } from "@/features/staff/queries";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CareTask, Dog, TaskCategory } from "@/types/domain";

const CATEGORY_PILL: Record<TaskCategory, string> = {
  feeding: "bg-amber-50 text-amber-700 border-amber-200",
  medication: "bg-rose-50 text-rose-700 border-rose-200",
  walk: "bg-sky-50 text-sky-700 border-sky-200",
  grooming: "bg-indigo-50 text-indigo-700 border-indigo-200",
  playtime: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function CareBoard() {
  const { data, isLoading } = useDogs();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dogs = data ?? [];
  const activeDog = dogs.find((d) => d.id === selectedId) ?? dogs[0] ?? null;

  return (
    <div className="grid grid-cols-1 gap-lg lg:grid-cols-12">
      {/* Dog list */}
      <Card className="lg:col-span-4 self-start">
        <CardHeader>
          <h2 className="flex items-center gap-xs font-semibold tracking-tight">
            <ListChecks className="size-4 text-brand-600" aria-hidden="true" />
            Care checklist
          </h2>
        </CardHeader>
        <CardBody className="p-sm">
          {isLoading ? (
            <div className="space-y-xs">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : dogs.length === 0 ? (
            <EmptyState title="No dogs to show" />
          ) : (
            <ul className="max-h-[620px] space-y-xs overflow-y-auto pr-xs">
              {dogs.map((d) => (
                <DogListItem
                  key={d.id}
                  dog={d}
                  selected={d.id === activeDog?.id}
                  onSelect={() => setSelectedId(d.id)}
                />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Selected dog's checklist */}
      <div className="lg:col-span-8 space-y-lg">
        {activeDog ? (
          <TaskChecklist key={activeDog.id} dog={activeDog} />
        ) : (
          <EmptyState title="Select a dog to see today's care checklist." />
        )}
      </div>
    </div>
  );
}

function DogListItem({
  dog,
  selected,
  onSelect,
}: {
  dog: Dog;
  selected: boolean;
  onSelect: () => void;
}) {
  // Same cache key as the checklist panel, so badges stay in sync after toggling.
  const { data } = useCareTasks(dog.id);
  const pending = (data ?? []).filter((t) => !t.completed).length;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={`w-full flex items-center gap-md rounded-2xl border p-xs text-left transition-all duration-200 ${
          selected
            ? "border-brand-500 bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lift"
            : "border-slate-200/80 bg-white text-slate-800 shadow-xs hover:border-brand-300 hover:bg-slate-50"
        }`}
      >
        <div className="relative size-11 shrink-0">
          <Image
            src={dog.photoUrl ?? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80"}
            alt={dog.name}
            width={44}
            height={44}
            className="size-full rounded-xl object-cover border border-white/60 shadow-xs"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${
              dog.feedingStatus === "on_track"
                ? "bg-emerald-500"
                : dog.feedingStatus === "overdue"
                  ? "bg-rose-500"
                  : "bg-amber-500"
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-sm tracking-tight">{dog.name}</h3>
          <p className={`truncate text-xs font-medium ${selected ? "text-white/90" : "text-slate-500"}`}>
            Zone {dog.zone}
          </p>
        </div>
        {pending > 0 ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
              selected ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {pending} left
          </span>
        ) : (
          <Check
            className={`size-4 shrink-0 ${selected ? "text-white/80" : "text-emerald-500"}`}
            aria-hidden="true"
          />
        )}
      </button>
    </li>
  );
}

function TaskChecklist({ dog }: { dog: Dog }) {
  const { data, isLoading, isError } = useCareTasks(dog.id);
  const toggle = useToggleCareTask();

  const tasks = data ?? [];
  const done = tasks.filter((t) => t.completed).length;

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold tracking-tight">
            {dog.name}&apos;s care plan
          </h2>
          <p className="text-xs text-slate-500">Zone {dog.zone} · {dog.feedingStatus.replace("_", " ")}</p>
        </div>
        {!isLoading && tasks.length > 0 ? (
          <span className="rounded-full bg-brand-50 px-sm py-xs text-xs font-medium text-brand-700 tabular-nums">
            {done} / {tasks.length} done
          </span>
        ) : null}
      </CardHeader>
      <CardBody>
        {isError ? (
          <p role="alert" className="text-severity-critical">
            Failed to load care tasks.
          </p>
        ) : isLoading ? (
          <div className="space-y-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState title="No tasks scheduled today." />
        ) : (
          <>
            <div className="mb-md h-xs overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-500"
                style={{ width: `${(done / tasks.length) * 100}%` }}
              />
            </div>
            <ul className="space-y-sm" aria-label={`Care tasks for ${dog.name}`}>
              {tasks.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={() => toggle.mutate({ dogId: dog.id, taskId: t.id })} />
              ))}
            </ul>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function TaskRow({ task, onToggle }: { task: CareTask; onToggle: () => void }) {
  return (
    <li
      className={`flex items-center gap-md rounded-lg border px-sm py-sm transition-colors ${
        task.completed ? "border-emerald-200/70 bg-emerald-50/40" : "border-slate-200/80 bg-white hover:border-brand-300"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={task.completed}
        aria-label={`${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.title}`}
        className={`grid size-7 shrink-0 place-items-center rounded-full border transition-colors ${
          task.completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-slate-300 hover:border-brand-400 hover:text-brand-500"
        }`}
      >
        <Check className="size-4" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-xs">
          <span className={`text-sm font-medium ${task.completed ? "text-slate-500 line-through" : "text-slate-800"}`}>
            {task.title}
          </span>
          <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${CATEGORY_PILL[task.category]}`}>
            {task.category}
          </span>
        </div>
        {task.notes ? (
          <p className="mt-0.5 truncate text-xs text-slate-400">{task.notes}</p>
        ) : null}
      </div>

      <div className="shrink-0 text-right text-xs">
        <span className="tabular-nums font-semibold text-slate-700">{task.scheduledTime}</span>
        {task.completed ? (
          <p className="text-emerald-600">
            Done{task.completedBy ? ` by ${task.completedBy}` : ""}
          </p>
        ) : null}
      </div>
    </li>
  );
}

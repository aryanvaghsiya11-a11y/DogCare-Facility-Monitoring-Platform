// Static page rendered either via ISR or statically baked at deploy time.
// Backend can override the message via a status-feed pull if desired.
export const dynamic = "force-static";

import { Activity, CheckCircle2, ShieldCheck } from "lucide-react";

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-[#f6f8f7] px-md py-2xl">
      <div className="mx-auto grid max-w-3xl gap-lg md:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-xl shadow-card">
          <div className="flex items-center gap-sm">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <Activity className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Service status
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">All systems operational</h1>
            </div>
          </div>

          <div className="mt-lg flex items-center gap-md rounded-card border border-severity-normal/20 bg-severity-normal/5 p-md">
            <span className="relative flex size-3 shrink-0">
              <span aria-hidden="true" className="absolute inline-flex size-full animate-ping rounded-full bg-severity-normal/60" />
              <span aria-hidden="true" className="relative inline-flex size-3 rounded-full bg-severity-normal" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800">Live connection healthy</p>
              <p className="text-xs text-slate-500">
                If your dashboard banner is showing &ldquo;reconnecting,&rdquo; check this page first.
              </p>
            </div>
          </div>

          <ul className="mt-lg space-y-sm">
            {[
              { label: "Real-time alert stream", value: "Live" },
              { label: "Dashboard API", value: "Healthy" },
              { label: "Media &amp; highlight CDN", value: "Operational" },
            ].map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-md py-sm text-sm"
              >
                <span className="text-slate-600">{row.label}</span>
                <span className="inline-flex items-center gap-xs font-medium text-severity-normal">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex flex-col justify-center rounded-2xl border border-slate-200/80 bg-white p-xl text-center shadow-card">
          <ShieldCheck className="mx-auto size-8 text-brand-600" aria-hidden="true" />
          <p className="mt-md text-sm font-medium text-slate-800">Need help?</p>
          <p className="mt-xs text-sm text-slate-500">
            Reach out to your facility administrator for connection or account issues.
          </p>
        </aside>
      </div>
    </main>
  );
}

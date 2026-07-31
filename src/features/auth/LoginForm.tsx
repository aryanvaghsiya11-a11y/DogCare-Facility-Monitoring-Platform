"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, PawPrint, ShieldCheck, Radio, BarChart3 } from "lucide-react";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).catch(() => null);

      if (!res || !res.ok) {
        // Dev fallback to internal Next.js API route
        res = await fetch("/api/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      }

      if (!res.ok) {
        setError("Invalid email or password.");
        return;
      }
      router.push(nextPath ?? "/");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-brand-gradient lg:flex lg:flex-col lg:justify-between lg:p-xl">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-hero-grid bg-[length:24px_24px] opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 size-96 rounded-full bg-accent-400/20 blur-3xl"
        />

        <div className="relative flex items-center gap-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15 text-white backdrop-blur">
            <PawPrint className="size-6" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold text-white">DogCare Facility</span>
        </div>

        <div className="relative space-y-lg">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            Every dog, every zone,
            <br />
            in real time.
          </h1>
          <p className="max-w-md text-brand-100">
            Live alerts, feeding logs, and compliance checklists for staff, owners, and managers —
            all in one calm, focused dashboard.
          </p>
          <ul className="space-y-sm text-sm text-white/90">
            <li className="flex items-center gap-sm">
              <Radio className="size-4 text-brand-200" aria-hidden="true" /> Real-time WebSocket
              alerts with auto-reconnect
            </li>
            <li className="flex items-center gap-sm">
              <BarChart3 className="size-4 text-brand-200" aria-hidden="true" /> Trends and
              occupancy at a glance
            </li>
            <li className="flex items-center gap-sm">
              <ShieldCheck className="size-4 text-brand-200" aria-hidden="true" /> Role-based access
              for staff, owners, managers
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-brand-200">
          Demo build · sign in with any credentials to explore
        </p>
      </section>

      {/* Form panel */}
      <main className="flex items-center justify-center px-md py-xl">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-lg flex items-center gap-sm lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <PawPrint className="size-6" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight">DogCare Facility</span>
          </div>

          <h1 id="login-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to your dashboard
          </h1>
          <p className="mt-xs text-sm text-slate-500">
            Choose any email and password to explore the demo.
          </p>

          <form onSubmit={onSubmit} className="mt-lg space-y-md" aria-labelledby="login-heading">
            <div className="space-y-xs">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-sm top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-sm pl-xl pr-sm text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500"
                />
              </div>
            </div>
            <div className="space-y-xs">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-sm top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-sm pl-xl pr-sm text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500"
                />
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-lg bg-severity-critical/10 px-sm py-sm text-sm text-severity-critical"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-xs rounded-lg bg-brand-600 py-sm text-sm font-medium text-white shadow-card transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-lg text-center text-xs text-slate-400">
            Protected by secure, httpOnly session cookies.
          </p>
        </div>
      </main>
    </div>
  );
}

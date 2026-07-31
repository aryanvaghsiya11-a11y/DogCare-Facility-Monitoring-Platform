import type { ReactNode } from "react";
import Link from "next/link";
import { PawPrint, LogOut } from "lucide-react";
import type { Role } from "@/types/domain";
import { AlertAnnouncer } from "@/components/alerts/AlertAnnouncer";
import { AlertsSocketBanner } from "@/components/alerts/AlertsSocketBanner";
import { RoleSwitcher } from "./RoleSwitcher";

const ROLE_LABEL: Record<Role, string> = {
  staff: "Staff",
  owner: "Owner",
  manager: "Manager",
};

const ROLE_STYLE: Record<Role, string> = {
  staff: "bg-brand-50 text-brand-700 border-brand-200",
  owner: "bg-accent-50 text-accent-600 border-accent-400/40",
  manager: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export function DashboardShell({
  userRole,
  userName,
  children,
}: {
  userRole: Role;
  userName: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-md px-md py-sm lg:px-lg">
          <Link href={`/${userRole}`} className="flex items-center gap-sm group">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow transition-transform group-hover:scale-105">
              <PawPrint className="size-5" aria-hidden="true" />
            </span>
            <span className="font-semibold tracking-tight">
              DogCare
              <span className="ml-xs hidden text-sm font-normal text-slate-400 sm:inline">Facility</span>
            </span>
          </Link>

          {/* Direct Section Navigation Tabs */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-xs ml-lg">
            <Link
              href="/owner"
              className={`px-md py-xs rounded-lg text-sm font-medium transition-all ${
                userRole === "owner"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              🐕 Dogs Directory
            </Link>
            <Link
              href="/staff"
              className={`px-md py-xs rounded-lg text-sm font-medium transition-all ${
                userRole === "staff"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              📋 Live Staff Feed
            </Link>
            <Link
              href="/manager"
              className={`px-md py-xs rounded-lg text-sm font-medium transition-all ${
                userRole === "manager"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              📊 Manager Analytics
            </Link>
          </nav>

          <nav aria-label="Primary" className="ml-auto flex items-center gap-md text-sm">
            <RoleSwitcher />
            <span
              className={`hidden rounded-full border px-sm py-xs text-xs font-medium sm:inline-block ${ROLE_STYLE[userRole]}`}
            >
              {ROLE_LABEL[userRole]}
            </span>
            <span
              aria-label="Signed in as"
              className="hidden items-center gap-sm text-slate-600 lg:flex"
            >
              <span className="grid size-7 place-items-center rounded-full bg-slate-900 text-xs font-medium text-white">
                {userName
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              {userName}
            </span>
            <form action="/api/logout" method="post">
              <button
                aria-label="Sign out"
                className="inline-flex items-center gap-xs rounded-lg border border-slate-200 bg-white px-sm py-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </nav>
        </div>
      </header>

      <AlertsSocketBanner />

      <main
        id="main"
        className="mx-auto w-full max-w-7xl flex-1 animate-fade-in-up px-md py-lg lg:px-lg"
      >
        {children}
      </main>

      <footer className="border-t border-slate-200/70 bg-white/60 py-sm">
        <p className="mx-auto max-w-7xl px-md text-center text-xs text-slate-400">
          DogCare Facility · Live monitoring dashboard
        </p>
      </footer>

      {/* Polite live region used by AlertAnnouncer for non-critical alerts. */}
      <AlertAnnouncer />
    </div>
  );
}

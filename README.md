# DogCare Facility Monitoring Platform

Production-ready frontend for a multi-role facility monitoring tool.
Staff get live alerts and zone occupancy, owners see their dog's day, and
managers handle incidents, compliance, and exports.

## Stack

- **Next.js 14 (App Router)** + TypeScript
- **Tailwind CSS** with a small design system (severity scale, card radius/shadow)
- **TanStack Query** for server state; **Zustand/Context** only for auth
- **Radix UI** primitives (modals, dropdowns, popovers)
- **react-hook-form + Zod** for input validation
- **Recharts** for activity / trend charts
- **@tanstack/react-virtual** for virtualized incident table
- **Sentry** error tracking (toggle via `NEXT_PUBLIC_SENTRY_DSN`)
- **Vitest + React Testing Library** unit/a11y; **Playwright** E2E

## Roles & routes

| Role    | URL prefix  | Audience                         |
| ------- | ----------- | -------------------------------- |
| Staff   | `/staff/*`  | Kennel staff (live alerts first) |
| Owner   | `/owner/*`  | Dog owner (read-only timeline)   |
| Manager | `/manager/*`| Compliance & incidents           |

`middleware.ts` blocks unauthenticated deep-linking. Per-role `(role)/layout.tsx`
files double-check the role server-side via `getSessionUser()`.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Visit http://localhost:3000.

## Scripts

| Script                | What it does                                |
| --------------------- | ------------------------------------------- |
| `npm run dev`         | Next dev server                             |
| `npm run build`       | Production build                            |
| `npm run analyze`     | Build with `@next/bundle-analyzer`          |
| `npm run lint`        | ESLint (Next + jsx-a11y)                    |
| `npm run typecheck`   | `tsc --noEmit`                              |
| `npm run test`        | Vitest unit tests                           |
| `npm run test:a11y`   | A11y-focused tests                          |
| `npm run test:e2e`    | Playwright E2E                              |
| `npm run audit`       | `npm audit --audit-level=high`              |

## Production-readiness features

- **Env validation** at boot (`src/lib/env.ts`) — bad config fails loudly
- **CSP and other security headers** in `next.config.ts`
- **Singleton WebSocket** with exponential backoff + visibility-aware reconnect
- **Live alert announcer** (`aria-live` regions) so screen-reader users never miss critical alerts
- **Role-scoped error boundaries** so a single widget crash can't take down a whole dashboard
- **Audit-logged exports** via `/api/exports/[format]`
- **CI pipeline** (`ci.yml`): lint, type-check, unit, a11y, bundle-budget, npm audit, Playwright

See [RUNBOOK](./RUNBOOK.md) for incident response and [docs/PRODUCTION-CHECKLIST](./docs/PRODUCTION-CHECKLIST.md) for the launch checklist.

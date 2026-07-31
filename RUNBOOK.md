# Runbook — Dog-Care Facility Dashboard

Live-safety tool. Downtime has welfare consequences. Use this when something
looks wrong on the production side and you need to act fast.

## 1. Confirm the problem

1. Visit the in-app banner first (top of every dashboard). If it says
   "reconnecting...", the WS layer is the suspect.
2. Open the [Vercel/host status page](#) for the dashboard project. If the
   deployment is "Error", the previous good build is one click away under
   *Deployments → Promote*.
3. Check `sentry.io` for a recent spike in frontend exceptions. Filter by the
   failing dashboard scope tag.
4. Skim the synthetic check results (the host's uptime monitor) — they always
   run before staff report, so a green there means it's client-side only.

## 2. Triage

| Symptom                               | Likely cause                                    | First action                                       |
| ------------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| Banner says "reconnecting..."         | WS gateway / facility network                   | Check WS health metric in Sentry breadcrumbs; if persistent, see §3.1 |
| One role's dashboard is blank         | Role-scoped bundle failed to load               | Hard-refresh; check Vercel deployment for that build |
| "Something went wrong" card on a widget | Caught by `ErrorBoundary`                     | Retry button; if it loops, Sentry has the trace    |
| Login redirects in a loop             | Auth cookie expired, backend `/me` returns 401   | See §3.2                                           |
| Login throttling / staff locked out    | Backend session store down                     | See §3.3                                           |

### 2.1 WebSocket unhealthy

1. Open a browser devtools WS connection to `NEXT_PUBLIC_WS_URL`.
2. If it connects: problem is in our hook's buffer / reconnect logic. Roll back per §4.
3. If it doesn't: it's the gateway or backend. Hand off to backend on-call.

### 2.2 Auth redirect loop

Check `getSessionUser()` in `src/lib/server-session.ts`. Most often caused by
`AUTH_COOKIE_NAME` mismatch between deployments after an env change.

### 2.3 Backend session store down

Switch to "read-only" mode by setting `READ_ONLY=true` in the dashboard env.
This will gate behind a feature-flag check inside `api.ts` to disable mutations.

## 3. Roll back

If the host is Vercel:

1. *Deployments* → find the last green build prior to the incident.
2. "⋯" → *Promote to Production*.
3. Watch the in-app banner and Sentry for a return to healthy.

If the host is self-managed:

```
git revert <bad-sha>
git push
```

CI will redeploy; promotion is automatic per the hosting config.

## 4. Communicate

- Post to the staff Slack channel using the
  `templates/incident-message.md` template (TODO: add once channel agreed).
- Update the `/status` page if downtime exceeds 5 minutes.
- For multi-facility rollouts, page the per-facility lead.

## 5. Postmortem

Within 48 hours: open a new doc under `docs/postmortems/YYYY-MM-DD-<slug>.md`
with timeline, root cause, customer impact, and follow-ups. Track action items
in the team issue tracker until closed.

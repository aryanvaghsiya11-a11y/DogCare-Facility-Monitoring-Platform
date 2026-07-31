# Launch Checklist

Run through every item below before the first production deploy.

## Auth & sessions
- [ ] Login flows tested for all three roles (`/staff`, `/owner`, `/manager`)
- [ ] Session expiry behaviour verified — silent refresh works; logout clears React Query cache
- [ ] Role switcher hidden outside dev (or guarded by a feature flag)
- [ ] `AUTH_COOKIE_NAME` matches what the backend sets; mismatches cause infinite redirects

## Errors & resilience
- [ ] Global error boundary at app root + per-dashboard boundaries in place
- [ ] API failures show a distinct error state, not an empty list
- [ ] WebSocket reconnect tested under simulated network drop (Chrome devtools → Network → Offline)
- [ ] "Live tracking unavailable" fallback tested for when CV pipeline is down

## Security
- [ ] CSP enforced and tested (no console errors in browser devtools)
- [ ] HTTPS + WSS in production (no `ws://` or `http://` left in env)
- [ ] `npm audit` clean at high/critical
- [ ] All `dangerouslySetInnerHTML` usages reviewed and justified
- [ ] Permissions-Policy header blocks camera/microphone/geolocation for facility devices

## Observability
- [ ] Sentry DSN configured and alerting to the on-call channel
- [ ] Errors tagged by `role` and `dashboard` scope
- [ ] Synthetic monitor (Uptime / Better Uptime) running against `/`
- [ ] WS connection health tracked as a metric, not just UI state

## Accessibility
- [ ] axe-core run in CI passes
- [ ] Manual screen-reader pass for the staff alert flow
- [ ] Severity conveyed through icon + text, not color alone
- [ ] All interactive elements keyboard-reachable; visible focus ring

## Performance
- [ ] Staff dashboard interactive <2s on facility Wi-Fi (test on real tablet)
- [ ] Bundle sized reviewed via `ANALYZE=true npm run build`
- [ ] No autoplaying video in incident list
- [ ] Long lists virtualized (incident table, dog grid)

## CI/CD
- [ ] PR preview deployments working
- [ ] Block merges on lint / typecheck / test / a11y / audit failures
- [ ] Playwright gates production (manual approval or required-status-check)
- [ ] Last-known-good build proven rollbackable in staging

## Compliance
- [ ] Data-retention policy for incident clips and dog records reviewed with facility ops
- [ ] Export actions audit-logged server-side
- [ ] Cookie/storage usage disclosed in any user-facing privacy notice

## Documents
- [ ] RUNBOOK reviewed and bookmarked by on-call
- [ ] On-call rotation in place with primary + backup
- [ ] Postmortem template available at `docs/postmortems/`

import { NextResponse, type NextRequest } from "next/server";

// Edge middleware, two jobs:
// 1. Cookie presence check + path-role gating (prod). Full role validation
//    happens in route layouts against the backend's /me endpoint.
// 2. CSP with a per-request nonce. Next.js App Router renders its inline
//    bootstrap scripts (RSC payload, webpack runtime) with the nonce from the
//    request, so pages can hydrate under a strict policy (no 'unsafe-inline').
//    Pages must be dynamically rendered for the nonce to reach SSR — see
//    src/app/layout.tsx `export const dynamic = "force-dynamic"`.

const ROLE_PREFIXES: Record<string, string> = {
  "/staff": "staff",
  "/owner": "owner",
  "/manager": "manager",
};

const isProd = process.env.NODE_ENV === "production";

// CSP: only list what we actually load. Adjust when adding third-party sources.
// frame-ancestors 'none' disables embedding for clickjacking protection.
// No upgrade-insecure-requests: WebKit applies it to same-origin requests even
// on localhost, so the dev server's http://localhost:3000/_next/static bundles
// get upgraded to https, fail to load, and React never hydrates. The prod site
// is served over HTTPS (HSTS preload) where the directive would be a no-op.
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // The nonce allows Next.js's inline scripts; 'unsafe-eval' is only needed
    // by React's dev-mode error tooling.
    `script-src 'self' 'nonce-${nonce}'${isProd ? "" : " 'unsafe-eval'"}`,
    // Sentry needs to POST to its own ingest endpoint.
    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ""} ${process.env.NEXT_PUBLIC_WS_URL ?? ""} https://*.sentry.io`,
    "img-src 'self' data: blob: https:",
    "media-src 'self' https:",
    // Pin video clip embeds to your bucket origin (edit before deploy).
    `frame-src 'self' ${process.env.NEXT_PUBLIC_CLIP_EMBED_ORIGIN ?? ""}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function middleware(req: NextRequest) {
  // Fresh nonce per request — unique and unguessable so only Next.js's own
  // scripts (which get the nonce stamped onto them) can execute inline.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  // Pass the nonce and policy downstream in the request so App Router's SSR
  // can stamp the nonce onto inline scripts and re-emit the header.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nextjs-csp-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const withCsp = (res: NextResponse) => {
    res.headers.set("Content-Security-Policy", csp);
    return res;
  };

  // Dev: auth is mocked, but the nonce/CSP wiring must still run.
  if (!isProd) {
    return withCsp(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  const cookieName = process.env.AUTH_COOKIE_NAME ?? "dcare_session";
  const session = req.cookies.get(cookieName);

  const { pathname } = req.nextUrl;

  const requiredRole = Object.entries(ROLE_PREFIXES).find(([p]) => pathname.startsWith(p))?.[1];
  if (!requiredRole) return withCsp(NextResponse.next({ request: { headers: requestHeaders } }));

  if (!session?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return withCsp(NextResponse.redirect(url));
  }

  return withCsp(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  matcher: [
    // Every route except API endpoints, static assets, the image optimizer,
    // and favicon — those don't render documents and don't need the CSP.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

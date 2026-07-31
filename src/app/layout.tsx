import "./globals.css";
import type { Metadata } from "next";
import { ClientProviders } from "./client-providers";
import { HydrationMarker } from "@/components/providers/HydrationMarker";

export const metadata: Metadata = {
  title: "Dog-Care Facility Dashboard",
  description: "Live dog-care facility monitoring — staff, owner, and manager views.",
};

// Nonce-based CSP (set per-request in src/middleware.ts) requires every page to
// be server-rendered per request so Next.js can stamp the current nonce onto
// its inline bootstrap scripts. Disables static optimization app-wide.
export const dynamic = "force-dynamic";

// Server components receive auth-resolved data via server actions in route
// layouts/pages; client providers handle in-app session state from cookies.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <ClientProviders>{children}</ClientProviders>
        <HydrationMarker />
      </body>
    </html>
  );
}

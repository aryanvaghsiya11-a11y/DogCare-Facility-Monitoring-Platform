import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ManagerDashboard } from "@/features/manager/ManagerDashboard";
import { OwnerDashboard } from "@/features/owner/OwnerDashboard";
import { axe } from "../matchers";

function renderWithClient(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // Dashboards normally render inside DashboardShell's <main>; keep the wrapper
  // so inner <header>s don't register as top-level banner landmarks.
  return render(
    <QueryClientProvider client={qc}>
      <main>{ui}</main>
    </QueryClientProvider>,
  );
}

describe("dashboard a11y", () => {
  it("ManagerDashboard passes axe (stat cards, incident table, compliance, trends)", async () => {
    const { container } = renderWithClient(<ManagerDashboard />);
    // Seed data arrives via initialData; wait for the non-zero incident count so
    // axe sees the populated table, not the loading skeleton.
    await screen.findByText(/^[1-9]\d* incidents$/, {}, { timeout: 10_000 });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 20_000);

  it("OwnerDashboard passes axe (dog directory, feeding log, timeline)", async () => {
    const { container } = renderWithClient(<OwnerDashboard />);
    // Profile renders only once the seeded dog list has resolved.
    await screen.findByRole("heading", { level: 2, name: "Bella" }, { timeout: 10_000 });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 20_000);
});

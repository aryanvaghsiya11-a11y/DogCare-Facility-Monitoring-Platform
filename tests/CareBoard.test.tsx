import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CareBoard } from "@/features/staff/CareBoard";
import { axe } from "../tests/matchers";

function renderWithClient(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // Match the real app layout: dashboard panels live inside <main>, so the
  // Cards' <header>s are not top-level banner landmarks.
  return render(
    <QueryClientProvider client={qc}>
      <main>{ui}</main>
    </QueryClientProvider>,
  );
}

describe("CareBoard", () => {
  it("renders the dog list with a care checklist for the active dog", () => {
    renderWithClient(<CareBoard />);
    expect(screen.getByRole("heading", { name: /Care checklist/i })).toBeInTheDocument();
    // First seeded dog (Bella) is the default selection.
    expect(
      screen.getByRole("heading", { name: "Bella's care plan" }),
    ).toBeInTheDocument();
  });

  it("shows a completion badge for the active dog", () => {
    renderWithClient(<CareBoard />);
    expect(screen.getByText(/\d+ \/ \d+ done/)).toBeInTheDocument();
  });

  it("passes basic axe checks", async () => {
    const { container } = renderWithClient(<CareBoard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

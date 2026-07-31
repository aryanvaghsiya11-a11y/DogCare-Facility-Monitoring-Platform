import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
// toHaveNoViolations comes from tests/setup.ts → tests/matchers.ts (axe-core).
import { axe } from "../tests/matchers";

describe("SeverityBadge", () => {
  it("renders the severity label", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByLabelText("Severity: critical")).toBeInTheDocument();
  });

  it("passes basic axe checks", async () => {
    const { container } = render(<SeverityBadge severity="high" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

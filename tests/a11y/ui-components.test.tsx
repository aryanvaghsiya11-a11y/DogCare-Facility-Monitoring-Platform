import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AlertTriangle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatCard } from "@/components/ui/StatCard";
import { axe } from "../matchers";

// Shared building blocks feed every dashboard, so axe them once here.
describe("shared UI a11y", () => {
  it("SeverityBadge passes axe for all severities", async () => {
    const { container } = render(
      <main>
        <SeverityBadge severity="critical" />
        <SeverityBadge severity="high" />
        <SeverityBadge severity="normal" />
      </main>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("StatCard passes axe (critical + brand tones)", async () => {
    const { container } = render(
      <main>
        <StatCard icon={AlertTriangle} label="Critical" value="3" tone="critical" />
        <StatCard icon={AlertTriangle} label="Open incidents" value="24" hint="across all zones" />
      </main>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Card / CardHeader / CardBody pass axe", async () => {
    const { container } = render(
      <main>
        <Card>
          <CardHeader>
            <h2>Zones</h2>
          </CardHeader>
          <CardBody>Zone A · 62%</CardBody>
        </Card>
      </main>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

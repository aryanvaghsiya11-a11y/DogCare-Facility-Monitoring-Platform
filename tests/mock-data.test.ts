import { describe, it, expect } from "vitest";
import {
  dogCareTasks,
  dogProfile,
  incidentTrend,
  incidents,
  zoneOccupancy,
} from "@/lib/mock-data";
import type { Incident } from "@/types/domain";

function withoutCreatedAt(rows: Incident[]) {
  return rows.map(({ createdAt: _createdAt, ...rest }) => rest);
}

describe("deterministic mock data", () => {
  it("returns identical care tasks on repeated calls", () => {
    expect(dogCareTasks("dog_7")).toEqual(dogCareTasks("dog_7"));
  });

  it("returns identical incidents on repeated calls", () => {
    expect(withoutCreatedAt(incidents())).toEqual(withoutCreatedAt(incidents()));
  });

  it("keeps every incident within seeded age bounds with valid severity", () => {
    for (const inc of incidents()) {
      expect(inc.minutesAgo).toBeGreaterThanOrEqual(0);
      expect(inc.minutesAgo).toBeLessThan(24 * 60 * 14);
      expect(["critical", "high", "normal"]).toContain(inc.severity);
    }
  });

  it("returns identical trends and zone occupancy on repeated calls", () => {
    expect(incidentTrend()).toEqual(incidentTrend());
    expect(zoneOccupancy()).toEqual(zoneOccupancy());
  });

  it("trend is a 14-day series with sane values", () => {
    const trend = incidentTrend();
    expect(trend).toHaveLength(14);
    expect(trend[0]?.day).toBe("D-14");
    expect(trend[13]?.day).toBe("D-1");
    for (const p of trend) {
      expect(p.incidents).toBeGreaterThanOrEqual(1);
      expect(p.compliance).toBeGreaterThanOrEqual(80);
      expect(p.compliance).toBeLessThanOrEqual(100);
    }
  });

  it("profile is stable across reloads", () => {
    expect(dogProfile("dog_3")).toEqual(dogProfile("dog_3"));
  });
});

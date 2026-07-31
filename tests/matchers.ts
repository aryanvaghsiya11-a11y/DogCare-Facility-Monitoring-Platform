// Custom Vitest matcher: toHaveNoViolations(). Wraps axe-core.
// vitest-axe 0.1.0 ships TS types but the runtime registration is empty,
// so we wire it ourselves via expect.extend().

import { expect } from "vitest";
import axeCore, { type RunOptions } from "axe-core";

type AxeNode = {
  html?: string;
  target?: string[];
  failureSummary?: string | null;
};

type AxeViolation = {
  id: string;
  impact?: string | null;
  help: string;
  helpUrl?: string;
  nodes?: AxeNode[];
};

type AxeResults = {
  violations?: AxeViolation[];
};

interface ViolationSummary {
  id: string;
  impact?: string | null;
  help: string;
  helpUrl?: string;
  nodes: AxeNode[];
}

function formatViolations(violations: AxeViolation[]): string {
  if (violations.length === 0) return "";
  return violations
    .map((v) => {
      const summary = (v.nodes ?? [])
        .map((n) => {
          const target = (n.target ?? []).join(", ");
          const fail = (n.failureSummary ?? "").replace(/\n/g, "\n    ");
          return `  - ${target}\n    ${fail}`;
        })
        .join("\n");
      return `${v.id} (${v.impact ?? "unknown"}): ${v.help}\n${summary}`;
    })
    .join("\n\n");
}

expect.extend({
  toHaveNoViolations(received: AxeResults) {
    const violations = received.violations ?? [];
    const summary: ViolationSummary[] = violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes ?? [],
    }));
    const pass = summary.length === 0;
    return {
      pass,
      message: () =>
        pass
          ? "Expected accessibility violations but found none."
          : `Expected no accessibility violations. Found:\n\n${formatViolations(violations)}`,
      actual: summary,
    };
  },
});

// axe-core's CJS default export isn't callable under esModuleInterop, so
// re-export `run` directly. Tests call `axe(container, options)`.
//
// color-contrast is disabled: jsdom has no layout or computed styles, so the
// rule always reports incomplete and logs internal errors. Real-browser
// contrast must be verified in a browser (Playwright), not here.
export const axe = (context: Element | Document, options?: RunOptions) => {
  const opts: RunOptions = {
    ...options,
    rules: { "color-contrast": { enabled: false }, ...options?.rules },
  };
  return axeCore.run(context, opts);
};

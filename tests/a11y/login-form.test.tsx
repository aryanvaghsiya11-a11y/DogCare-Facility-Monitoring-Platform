import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { LoginForm } from "@/features/auth/LoginForm";
import { axe } from "../matchers";

describe("LoginForm a11y", () => {
  it("form panel passes axe (labels, focus order, no landmark drift)", async () => {
    render(<LoginForm />);
    const form = screen.getByRole("main");
    const results = await axe(form);
    expect(results).toHaveNoViolations();
  });
});

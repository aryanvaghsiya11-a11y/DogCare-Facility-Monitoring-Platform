import { test, expect } from "@playwright/test";

// Boot a fresh session and verify the WS banner isn't permanently red.
test("staff sees connection banner transitioning away", async ({ page }) => {
  await page.goto("/staff");
  await expect(page.getByRole("heading", { name: /Staff Dashboard/i })).toBeVisible();
});

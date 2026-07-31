import { test, expect } from "@playwright/test";

test("manager can search incidents and see the results filter", async ({ page }) => {
  await page.goto("/manager");

  await expect(page.getByRole("heading", { name: /Manager Dashboard/i })).toBeVisible();

  // Wait for React hydration so the search box is wired to live handlers
  // (hydration is slow under WebKit/dev).
  await expect(page.locator("body[data-hydrated='true']")).toBeVisible({
    timeout: 30_000,
  });

  const count = page.getByText(/\d+ incidents/);
  await expect(count).toHaveText(/^\d+ incidents$/);
  const before = await count.textContent();

  // Only a subset of seeded notes mention an escape, so the row count drops.
  await page.getByRole("textbox", { name: /Search notes/i }).fill("escaped");
  await expect(count).not.toHaveText(before!);
  await expect(count).toHaveText(/^\d+ incidents$/);
});

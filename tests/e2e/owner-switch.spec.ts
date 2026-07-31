import { test, expect } from "@playwright/test";

test("owner can switch between dogs and see the profile update", async ({ page }) => {
  await page.goto("/owner");

  await expect(
    page.getByRole("heading", { name: /Facility Dogs Directory/i }),
  ).toBeVisible();

  // Default selection is the first seeded dog.
  await expect(page.getByRole("heading", { name: "Bella", level: 2 })).toBeVisible();

  // Wait for React hydration so clicks actually land on live handlers
  // (hydration is slow under WebKit/dev).
  await expect(page.locator("body[data-hydrated='true']")).toBeVisible({
    timeout: 30_000,
  });

  // Pick a different dog from the sidebar and confirm the profile swaps.
  await page.getByRole("button", { name: /Max/ }).click();
  await expect(page.getByRole("heading", { name: "Max", level: 2 })).toBeVisible();
});

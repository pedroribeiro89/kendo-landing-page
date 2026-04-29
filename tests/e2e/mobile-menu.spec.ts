import { test, expect } from "@playwright/test";

test("mobile menu opens, navigates, and closes", async ({ page }) => {
  await page.goto("/");

  const menu = page.locator("#mobile-menu");
  await expect(menu).toHaveJSProperty("open", false);

  await page.locator("#mobile-menu > summary").click();
  await expect(menu).toHaveJSProperty("open", true);

  // First nav link inside the open panel
  await page.locator("#mobile-menu nav a").first().click();
  await expect(menu).toHaveJSProperty("open", false);
});

test("mobile menu close button works", async ({ page }) => {
  await page.goto("/");
  await page.locator("#mobile-menu > summary").click();
  await page.locator("[data-close-menu]").click();
  await expect(page.locator("#mobile-menu")).toHaveJSProperty("open", false);
});

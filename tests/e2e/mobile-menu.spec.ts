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

test("mobile menu toggles aria-expanded and supports Escape", async ({ page }) => {
  await page.goto("/");
  const summary = page.locator("#mobile-menu > summary");

  await expect(summary).toHaveAttribute("aria-expanded", "false");

  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(summary).toHaveAttribute("aria-expanded", "true");
  await expect(summary).toHaveAttribute("aria-label", "Fechar menu");

  await page.keyboard.press("Escape");
  await expect(summary).toHaveAttribute("aria-expanded", "false");
  await expect(summary).toHaveAttribute("aria-label", "Abrir menu");
  await expect(page.locator("#mobile-menu")).toHaveJSProperty("open", false);
});

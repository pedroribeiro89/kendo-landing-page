import { test, expect } from "@playwright/test";

test("FAQ items toggle via keyboard", async ({ page }) => {
  await page.goto("/#faq");
  const firstItem = page.locator("#faq details").first();

  await expect(firstItem).not.toHaveAttribute("open", "");
  await page.locator("#faq summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(firstItem).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(firstItem).not.toHaveAttribute("open", "");
});

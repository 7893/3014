import { expect, test } from "@playwright/test";

test("has title and canvas", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/Suizhou/i);
	const canvas = page.locator("canvas#landscape");
	await expect(canvas).toBeVisible();
});

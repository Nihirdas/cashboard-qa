import { test, expect } from "@/fixtures/test";
import { AppNav, ROUTES } from "@/pages/AppNav";

test.describe("Navigation", () => {
  for (const route of ROUTES) {
    test(`sidebar navigates to ${route.name}`, async ({ page }) => {
      await page.goto("/");
      await new AppNav(page).navLink(route.name).click();
      await expect(
        page.getByRole("heading", { level: 1, name: route.heading }),
      ).toBeVisible();
    });
  }

  test("renders on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/projections");
    await expect(
      page.getByRole("heading", { level: 1, name: "Projections" }),
    ).toBeVisible();
  });
});

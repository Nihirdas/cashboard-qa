import { type Locator } from "@playwright/test";
import { test, expect } from "@/fixtures/test";

const digits = async (loc: Locator): Promise<number> =>
  Number((await loc.textContent())?.replace(/\D/g, "") ?? "0");

test.describe("Projections calculator", () => {
  test("renders API-driven cards and the chart", async ({ projectionsPage }) => {
    await projectionsPage.goto();
    await expect(projectionsPage.projected()).toContainText("€");
    await expect(projectionsPage.contributed()).toContainText("€");
    await expect(projectionsPage.growth()).toContainText("€");
    await expect(projectionsPage.chart).toBeVisible();
  });

  test("requests /api/projections with the current assumptions", async ({
    projectionsPage,
    page,
  }) => {
    const request = page.waitForRequest((r) => r.url().includes("/api/projections"));
    await projectionsPage.goto();
    const url = (await request).url();
    expect(url).toContain("start=");
    expect(url).toContain("years=");
    expect(url).toContain("return=");
  });

  test("return slider drives projected net worth and growth", async ({
    projectionsPage,
  }) => {
    await projectionsPage.goto();

    await projectionsPage.setSlider(projectionsPage.returnSlider(), 0);
    await expect(projectionsPage.growth()).toHaveText("€0");
    const atZero = await digits(projectionsPage.projected());

    await projectionsPage.setSlider(projectionsPage.returnSlider(), 12);
    await expect(projectionsPage.growth()).not.toHaveText("€0");
    const atTwelve = await digits(projectionsPage.projected());

    expect(atTwelve).toBeGreaterThan(atZero);
  });

  test("zero monthly contribution: total put in equals the starting value", async ({
    projectionsPage,
  }) => {
    await projectionsPage.goto();
    await projectionsPage.setSlider(projectionsPage.monthlySlider(), 0);

    // With nothing added monthly, "total put in" is just the starting value —
    // compare against what the starting slider displays (what the app uses).
    const startText =
      (await projectionsPage.startingDisplay().textContent())?.trim() ?? "";
    await expect(projectionsPage.contributed()).toHaveText(startText);
  });
});

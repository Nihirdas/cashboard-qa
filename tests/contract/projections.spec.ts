import type { Page, Response } from "@playwright/test";
import { test, expect } from "@/fixtures/test";
import type { ProjectionResponse } from "@/types";

// The contract layer: does the /projections UI translate correctly to and from
// /api/projections? The API tests prove the endpoint's maths; the E2E tests
// prove the page behaves. These prove the wiring in between — that the values
// shown on the sliders land in the request under the right names, and the
// response summary lands in the right cards. Distinct values so a swapped pair
// can't hide.
const SCENARIO = { start: 120000, monthly: 2000, ret: 8, years: 25 };

/** The request the panel fires once every slider in `vals` has settled. */
function settledResponse(page: Page, vals: typeof SCENARIO): Promise<Response> {
  return page.waitForResponse((res) => {
    if (!res.url().includes("/api/projections")) return false;
    const q = new URL(res.url()).searchParams;
    return (
      q.get("start") === String(vals.start) &&
      q.get("monthly") === String(vals.monthly) &&
      q.get("return") === String(vals.ret) &&
      q.get("years") === String(vals.years)
    );
  });
}

test.describe("Projections UI<->API contract", () => {
  test("on-screen assumptions map exactly into the /api/projections request", async ({
    projectionsPage: pp,
    page,
  }) => {
    await pp.goto();
    const settled = settledResponse(page, SCENARIO);
    await pp.setAssumptions(SCENARIO);
    const q = new URL((await settled).url()).searchParams;

    // Exactly the five contract params — nothing renamed, dropped or added.
    expect([...q.keys()].sort()).toEqual([
      "monthly",
      "return",
      "start",
      "startYear",
      "years",
    ]);

    // Each param equals the value shown on its slider.
    expect(Number(q.get("start"))).toBe(await pp.shownStart());
    expect(Number(q.get("monthly"))).toBe(await pp.shownMonthly());
    expect(Number(q.get("return"))).toBe(await pp.shownReturn());
    expect(Number(q.get("years"))).toBe(await pp.shownYears());

    // startYear isn't a slider — it's the current year, and it drives the
    // visible "by <year>" label (startYear + years).
    const thisYear = new Date().getFullYear();
    expect(Number(q.get("startYear"))).toBe(thisYear);
    await expect(pp.projectedLabel()).toContainText(String(thisYear + SCENARIO.years));
  });

  test("the API response summary maps back into the rendered cards", async ({
    projectionsPage: pp,
    page,
  }) => {
    await pp.goto();
    const settled = settledResponse(page, SCENARIO);
    await pp.setAssumptions(SCENARIO);
    const { summary } = (await (await settled).json()) as ProjectionResponse;

    // total -> "Projected net worth", contributed -> "Total you put in",
    // growth -> "Growth from returns": the right field in the right card.
    await expect.poll(() => pp.shownProjected()).toBe(summary.total);
    await expect.poll(() => pp.shownContributed()).toBe(summary.contributed);
    await expect.poll(() => pp.shownGrowth()).toBe(summary.growth);
    await expect(pp.projectedLabel()).toContainText(String(summary.finalYear));
  });

  test("changing an assumption re-fetches and re-renders the same round-trip", async ({
    projectionsPage: pp,
    page,
  }) => {
    await pp.goto();
    const base = settledResponse(page, SCENARIO);
    await pp.setAssumptions(SCENARIO);
    await base;

    // Move one assumption; the new shown value must ride into a fresh request
    // and the cards must follow that request's response.
    const changed = { ...SCENARIO, ret: 4 };
    const settled = settledResponse(page, changed);
    await pp.setSlider(pp.returnSlider(), changed.ret);
    const resp = await settled;

    const q = new URL(resp.url()).searchParams;
    expect(Number(q.get("return"))).toBe(await pp.shownReturn());
    expect(Number(q.get("return"))).toBe(changed.ret);

    const { summary } = (await resp.json()) as ProjectionResponse;
    await expect.poll(() => pp.shownProjected()).toBe(summary.total);
    await expect.poll(() => pp.shownContributed()).toBe(summary.contributed);
    await expect.poll(() => pp.shownGrowth()).toBe(summary.growth);
  });
});

import { test, expect } from "@/fixtures/test";
import type { NetWorthResponse, SummaryResponse } from "@/types";

test.describe("GET /api/summary", () => {
  test("returns the overview tiles as numbers", async ({ api }) => {
    const { status, body } = await api.get<SummaryResponse>("/api/summary");
    expect(status).toBe(200);
    const numericKeys = [
      "netWorth",
      "cash",
      "investments",
      "investmentsPL",
      "spendThisMonth",
      "incomeThisMonth",
      "momDelta",
      "momPct",
    ] as const;
    for (const key of numericKeys) {
      expect(typeof body[key]).toBe("number");
    }
    expect(body.spendThisMonth).toBeGreaterThanOrEqual(0);
  });

  test("net worth agrees with /api/net-worth", async ({ api }) => {
    const summary = await api.get<SummaryResponse>("/api/summary");
    const netWorth = await api.get<NetWorthResponse>("/api/net-worth");
    expect(summary.body.netWorth).toBe(netWorth.body.current);
  });
});

import { test, expect } from "@/fixtures/test";
import type { PortfolioResponse } from "@/types";

test.describe("GET /api/portfolio", () => {
  test("each position carries P/L derived from price and quantity", async ({ api }) => {
    const { status, body } = await api.get<PortfolioResponse>("/api/portfolio");
    expect(status).toBe(200);
    expect(body.positions.length).toBeGreaterThan(0);
    for (const p of body.positions) {
      expect(p.marketValue).toBeCloseTo(p.quantity * p.lastPrice, 6);
      expect(p.pl).toBeCloseTo(p.quantity * (p.lastPrice - p.avgPrice), 6);
    }
  });

  test("totals include brokerage cash", async ({ api }) => {
    const { body } = await api.get<PortfolioResponse>("/api/portfolio");
    const value = body.cash + body.positions.reduce((s, p) => s + p.marketValue, 0);
    const pl = body.positions.reduce((s, p) => s + p.pl, 0);
    expect(body.totals.value).toBeCloseTo(value, 6);
    expect(body.totals.pl).toBeCloseTo(pl, 6);
  });
});

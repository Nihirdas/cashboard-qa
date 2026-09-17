import { test, expect } from "@/fixtures/test";
import type { NetWorthResponse } from "@/types";

test.describe("GET /api/net-worth", () => {
  test("history is monthly, chronological and numeric", async ({ api }) => {
    const { status, body } = await api.get<NetWorthResponse>("/api/net-worth");
    expect(status).toBe(200);
    expect(body.history.length).toBeGreaterThan(1);

    for (const point of body.history) {
      expect(point.date).toMatch(/^\d{4}-\d{2}-01$/);
      expect(typeof point.netWorth).toBe("number");
    }

    const dates = body.history.map((p) => p.date);
    expect([...dates].sort()).toEqual(dates);
  });
});

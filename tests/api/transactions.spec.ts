import { test, expect } from "@/fixtures/test";
import type { ErrorResponse, TransactionsResponse } from "@/types";

test.describe("GET /api/transactions", () => {
  test("returns transactions with a matching count", async ({ api }) => {
    const { status, body } = await api.get<TransactionsResponse>("/api/transactions");
    expect(status).toBe(200);
    expect(body.count).toBe(body.transactions.length);
    expect(body.count).toBeGreaterThan(0);
  });

  test("filters by category", async ({ api }) => {
    const { body } = await api.get<TransactionsResponse>("/api/transactions", {
      category: "Groceries",
    });
    expect(body.count).toBeGreaterThan(0);
    for (const t of body.transactions) {
      expect(t.category).toBe("Groceries");
    }
  });

  test("rejects a malformed month with 400", async ({ api }) => {
    const { status, body } = await api.get<ErrorResponse>("/api/transactions", {
      month: "nope",
    });
    expect(status).toBe(400);
    expect(body.error).toContain("month");
  });
});

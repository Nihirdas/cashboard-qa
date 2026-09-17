import { test, expect } from "@/fixtures/test";
import type { AccountsResponse } from "@/types";

test.describe("GET /api/accounts", () => {
  test("returns accounts with totals derived from their balances", async ({ api }) => {
    const { status, body } = await api.get<AccountsResponse>("/api/accounts");
    expect(status).toBe(200);
    expect(body.accounts.length).toBeGreaterThan(0);

    const bank = body.accounts.reduce((s, a) => s + a.balance, 0);
    const debt = body.accounts
      .filter((a) => a.balance < 0)
      .reduce((s, a) => s + a.balance, 0);
    expect(body.totals.bank).toBeCloseTo(bank, 2);
    expect(body.totals.debt).toBeCloseTo(debt, 2);
    expect(body.totals.cash).toBeGreaterThanOrEqual(0);
  });

  test("each account is well-formed", async ({ api }) => {
    const { body } = await api.get<AccountsResponse>("/api/accounts");
    for (const a of body.accounts) {
      expect(a.id).toBeTruthy();
      expect(typeof a.balance).toBe("number");
      expect(a.currency).toMatch(/^[A-Z]{3}$/);
    }
  });
});

import { test, expect } from "@/fixtures/test";
import type { HealthResponse } from "@/types";

test.describe("GET /api/health", () => {
  test("returns ok with a valid timestamp", async ({ api }) => {
    const { status, body } = await api.get<HealthResponse>("/api/health");
    expect(status).toBe(200);
    expect(body.status).toBe("ok");
    expect(Number.isNaN(Date.parse(body.asOf))).toBe(false);
  });

  test("rejects an unsupported method with 405", async ({ api }) => {
    const res = await api.request.post("/api/health");
    expect(res.status()).toBe(405);
  });
});

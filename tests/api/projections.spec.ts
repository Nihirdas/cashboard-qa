import { test, expect } from "@/fixtures/test";
import type { ErrorResponse, ProjectionResponse } from "@/types";
import {
  boundaryProjections,
  goldenProjections,
  invalidProjections,
} from "@/data/projections";

test.describe("GET /api/projections", () => {
  test("returns a default projection with a coherent summary", async ({ api }) => {
    const { status, body } = await api.get<ProjectionResponse>("/api/projections");
    expect(status).toBe(200);
    expect(body.points.length).toBeGreaterThan(1);
    expect(body.summary.growth).toBe(body.summary.total - body.summary.contributed);
    expect(body.summary.finalYear).toBe(body.points.at(-1)!.year);
  });

  for (const c of goldenProjections) {
    test(`golden: ${c.name}`, async ({ api }) => {
      const { status, body } = await api.get<ProjectionResponse>(
        "/api/projections",
        c.query,
      );
      expect(status).toBe(200);
      expect(body.summary.total).toBe(c.expected.total);
      expect(body.summary.contributed).toBe(c.expected.contributed);
      expect(body.summary.growth).toBe(c.expected.growth);
      expect(body.points).toHaveLength(c.expected.points);
    });
  }

  test("points are integer-rounded and years increment by one", async ({ api }) => {
    const { body } = await api.get<ProjectionResponse>("/api/projections", {
      start: "1000",
      monthly: "250",
      return: "7",
      years: "30",
      startYear: "2025",
    });
    body.points.forEach((p, i) => {
      expect(Number.isInteger(p.total)).toBe(true);
      expect(p.year).toBe(2025 + i);
    });
  });

  for (const c of invalidProjections) {
    test(`400: ${c.name}`, async ({ api }) => {
      const { status, body } = await api.get<ErrorResponse>("/api/projections", c.query);
      expect(status).toBe(400);
      expect(body.error).toContain(c.field);
    });
  }

  for (const q of boundaryProjections) {
    test(`accepts boundary ${JSON.stringify(q)}`, async ({ api }) => {
      const { status } = await api.get<ProjectionResponse>("/api/projections", q);
      expect(status).toBe(200);
    });
  }
});

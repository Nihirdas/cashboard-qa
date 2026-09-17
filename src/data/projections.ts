// Typed test data for the projections endpoint. Golden cases lock exact
// outputs; invalid cases assert the 400 contract; boundary cases assert the
// edges of the accepted range.

export interface GoldenCase {
  name: string;
  query: Record<string, string>;
  expected: { total: number; contributed: number; growth: number; points: number };
}

export const goldenProjections: GoldenCase[] = [
  {
    name: "10k at 12%/yr for 1 year, no contributions",
    query: { start: "10000", monthly: "0", return: "12", years: "1", startYear: "2000" },
    expected: { total: 11268, contributed: 10000, growth: 1268, points: 2 },
  },
  {
    name: "0% return is pure contributions",
    query: { start: "5000", monthly: "100", return: "0", years: "10", startYear: "2020" },
    expected: { total: 17000, contributed: 17000, growth: 0, points: 11 },
  },
];

export interface InvalidCase {
  name: string;
  query: Record<string, string>;
  field: string;
}

export const invalidProjections: InvalidCase[] = [
  { name: "non-numeric years", query: { years: "abc" }, field: "years" },
  { name: "years below minimum", query: { years: "0" }, field: "years" },
  { name: "years above maximum", query: { years: "101" }, field: "years" },
  { name: "return above maximum", query: { return: "200" }, field: "return" },
  { name: "negative start", query: { start: "-1" }, field: "start" },
  { name: "fractional years", query: { years: "1.5" }, field: "years" },
];

export const boundaryProjections: Record<string, string>[] = [
  { years: "1" },
  { years: "100" },
  { return: "-100" },
  { return: "100" },
  { monthly: "0" },
];

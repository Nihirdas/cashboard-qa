// Merge one Playwright run into the dashboard's history.json.
// Usage: node scripts/update-history.mjs <results.json> <history.json>
// Env: GITHUB_RUN_ID, GITHUB_EVENT_NAME, GITHUB_SHA, PROD_HEALTH ("ok"|"down").

import { readFileSync, writeFileSync } from "node:fs";

const [, , resultsPath, historyPath] = process.argv;
if (!resultsPath || !historyPath) {
  console.error("usage: update-history.mjs <results.json> <history.json>");
  process.exit(1);
}

const results = JSON.parse(readFileSync(resultsPath, "utf8"));
const history = JSON.parse(readFileSync(historyPath, "utf8"));

// Flatten every test (recursing describe blocks) with its project and outcome.
const tests = [];
function walk(suite) {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests ?? []) {
      tests.push({ project: t.projectName, status: t.status });
    }
  }
  for (const child of suite.suites ?? []) walk(child);
}
for (const s of results.suites ?? []) walk(s);

const of = (p) => tests.filter((t) => t.project === p);
const passedOf = (arr) => arr.filter((t) => t.status === "expected").length;

const api = of("api");
const e2e = of("e2e");
const stats = results.stats ?? {};

const total = tests.length;
const passed = passedOf(tests);
const failed = tests.filter((t) => t.status === "unexpected").length;
const flaky = tests.filter((t) => t.status === "flaky").length;

const run = {
  id: process.env.GITHUB_RUN_ID ?? "local",
  timestamp: new Date().toISOString(),
  trigger: process.env.GITHUB_EVENT_NAME ?? "local",
  total,
  passed,
  failed,
  flaky,
  durationMs: Math.round(stats.duration ?? 0),
};

// api and e2e are owned by this suite; unit is owned by the app, so leave it.
if (api.length) {
  history.layers.api.count = api.length;
  history.layers.api.passed = passedOf(api);
}
if (e2e.length) {
  history.layers.e2e.count = e2e.length;
  history.layers.e2e.passed = passedOf(e2e);
}

if (process.env.PROD_HEALTH) {
  history.production.status = process.env.PROD_HEALTH === "ok" ? "ok" : "down";
  history.production.lastCheck = run.timestamp;
}

history.runs = [...(history.runs ?? []), run].slice(-60);
history.updatedAt = run.timestamp;

writeFileSync(historyPath, JSON.stringify(history, null, 2) + "\n");
console.log(
  `history: +run ${run.id} ${passed}/${total} (api ${api.length}, e2e ${e2e.length}, ${run.durationMs}ms)`,
);

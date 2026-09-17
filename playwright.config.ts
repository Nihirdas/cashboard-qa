import { defineConfig, devices } from "@playwright/test";
import { BASE_URL, IS_CI, IS_REMOTE } from "./src/config/env";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 1 : 0,
  workers: IS_CI ? 2 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "api", testDir: "./tests/api" },
    { name: "e2e", testDir: "./tests/e2e", use: { ...devices["Desktop Chrome"] } },
  ],
  // Against a remote URL (live smoke) we manage no server. Otherwise start —
  // or reuse, locally — the sibling app build on :3000.
  webServer: IS_REMOTE
    ? undefined
    : {
        command: `npm --prefix ${process.env.APP_DIR ?? "../cashboard"} run start`,
        url: "http://localhost:3000",
        timeout: 120_000,
        reuseExistingServer: !IS_CI,
      },
});

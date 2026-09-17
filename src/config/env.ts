export const IS_CI = !!process.env.CI;

/**
 * Where the tests point. Defaults to a local dev/prod server; set BASE_URL to
 * run the same suite against a deployed environment (e.g. the live site).
 */
export const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

/** True when running against a remote deployment instead of a local build. */
export const IS_REMOTE = !!process.env.BASE_URL;

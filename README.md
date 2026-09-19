# cashboard-qa

Playwright API + E2E tests for [Cashboard](https://github.com/Nihirdas/cashboard).

This is the middle and top of the test pyramid — the unit layer lives with the
app. API tests exercise the JSON endpoints; contract tests check the UI<->API
translation; E2E drives the projections calculator in a real browser.

## Layout

- `tests/api` — endpoint tests (Playwright `APIRequestContext`)
- `tests/contract` — UI<->API contract: the values shown on `/projections` map
  into the `/api/projections` request, and the response maps back into the cards
- `tests/e2e` — browser flows (Playwright Test)
- `src/pages` — Page Objects
- `src/fixtures` — typed `api` + page fixtures
- `src/data` — typed test data
- `src/config` — base URL / environment

## Run

```bash
npm install
npx playwright install chromium
npm test              # everything
npm run test:api      # API only
npm run test:contract # contract only
npm run test:e2e      # E2E only
npm run report        # open the HTML report
```

By default the suite starts (or reuses) the app on `http://localhost:3000` from a
sibling `../cashboard` checkout. Point it elsewhere with `BASE_URL`:

```bash
BASE_URL=https://cashboard-pi.vercel.app npm run test:api
```

Reports: HTML in `playwright-report/`, machine-readable JSON in
`test-results/results.json`.

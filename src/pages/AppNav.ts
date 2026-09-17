import type { Locator, Page } from "@playwright/test";

export interface Route {
  name: string;
  path: string;
  heading: string;
}

export const ROUTES: Route[] = [
  { name: "Overview", path: "/", heading: "Overview" },
  { name: "Accounts", path: "/accounts", heading: "Accounts" },
  { name: "Transactions", path: "/transactions", heading: "Transactions" },
  { name: "Portfolio", path: "/portfolio", heading: "Portfolio" },
  { name: "Projections", path: "/projections", heading: "Projections" },
];

/** Page Object for the sidebar navigation. */
export class AppNav {
  constructor(readonly page: Page) {}

  navLink(name: string): Locator {
    return this.page.getByRole("link", { name, exact: true });
  }
}

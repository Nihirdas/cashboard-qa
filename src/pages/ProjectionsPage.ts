import { type Locator, type Page, expect } from "@playwright/test";

/** Digits only, e.g. "€120,000" -> 120000, "25 years" -> 25. */
const asInt = (text: string | null): number => Number((text ?? "").replace(/\D/g, ""));

/** First number incl. decimals, e.g. "8.0%" -> 8, "6.5%" -> 6.5. */
const asFloat = (text: string | null): number =>
  Number((text ?? "").replace(/[^\d.]/g, ""));

/** Page Object for /projections — the calculator under test. */
export class ProjectionsPage {
  readonly heading: Locator;
  readonly chart: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "Projections", level: 1 });
    this.chart = page.locator(".recharts-responsive-container");
  }

  async goto(): Promise<void> {
    await this.page.goto("/projections");
    await expect(this.heading).toBeVisible();
    await this.waitForNumbers();
  }

  private statValue(label: string | RegExp): Locator {
    const labelNode =
      typeof label === "string"
        ? this.page.getByText(label, { exact: true })
        : this.page.getByText(label);
    return labelNode.locator("xpath=following-sibling::p[1]");
  }

  projected(): Locator {
    return this.statValue(/^Projected net worth by/);
  }
  contributed(): Locator {
    return this.statValue("Total you put in");
  }
  growth(): Locator {
    return this.statValue("Growth from returns");
  }

  private slider(label: string): Locator {
    return this.page
      .getByText(label, { exact: true })
      .locator("xpath=../following-sibling::input");
  }
  startingSlider(): Locator {
    return this.slider("Starting net worth");
  }
  monthlySlider(): Locator {
    return this.slider("Added per month");
  }
  returnSlider(): Locator {
    return this.slider("Expected annual return");
  }
  yearsSlider(): Locator {
    return this.slider("Time horizon");
  }

  /** The value a slider currently shows (formatted, matching what the app uses). */
  private sliderDisplay(label: string): Locator {
    return this.page
      .getByText(label, { exact: true })
      .locator("xpath=following-sibling::span");
  }
  startingDisplay(): Locator {
    return this.sliderDisplay("Starting net worth");
  }

  /** The label above the projected card, e.g. "Projected net worth by 2051". */
  projectedLabel(): Locator {
    return this.page.getByText(/^Projected net worth by/);
  }

  // --- values as shown on screen, decoded to the numbers a query should carry ---
  async shownStart(): Promise<number> {
    return asInt(await this.sliderDisplay("Starting net worth").textContent());
  }
  async shownMonthly(): Promise<number> {
    return asInt(await this.sliderDisplay("Added per month").textContent());
  }
  async shownReturn(): Promise<number> {
    return asFloat(await this.sliderDisplay("Expected annual return").textContent());
  }
  async shownYears(): Promise<number> {
    return asInt(await this.sliderDisplay("Time horizon").textContent());
  }

  // --- numbers rendered in the three summary cards ---
  async shownProjected(): Promise<number> {
    return asInt(await this.projected().textContent());
  }
  async shownContributed(): Promise<number> {
    return asInt(await this.contributed().textContent());
  }
  async shownGrowth(): Promise<number> {
    return asInt(await this.growth().textContent());
  }

  /** Set a range input and let the debounced fetch settle. */
  async setSlider(slider: Locator, value: number): Promise<void> {
    await slider.fill(String(value));
  }

  /** Set all four assumptions (starting/monthly/return/years). */
  async setAssumptions(a: {
    start: number;
    monthly: number;
    ret: number;
    years: number;
  }): Promise<void> {
    await this.setSlider(this.startingSlider(), a.start);
    await this.setSlider(this.monthlySlider(), a.monthly);
    await this.setSlider(this.returnSlider(), a.ret);
    await this.setSlider(this.yearsSlider(), a.years);
  }

  /** Cards render "—" until the /api/projections fetch resolves. */
  async waitForNumbers(): Promise<void> {
    await expect(this.projected()).not.toHaveText("—");
  }
}

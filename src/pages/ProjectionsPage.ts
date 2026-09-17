import { type Locator, type Page, expect } from "@playwright/test";

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

  /** Set a range input and let the debounced fetch settle. */
  async setSlider(slider: Locator, value: number): Promise<void> {
    await slider.fill(String(value));
  }

  /** Cards render "—" until the /api/projections fetch resolves. */
  async waitForNumbers(): Promise<void> {
    await expect(this.projected()).not.toHaveText("—");
  }
}

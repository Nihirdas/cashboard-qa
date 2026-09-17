import { test as base, expect } from "@playwright/test";
import { ApiClient } from "@/api/client";
import { ProjectionsPage } from "@/pages/ProjectionsPage";

interface Fixtures {
  api: ApiClient;
  projectionsPage: ProjectionsPage;
}

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
  projectionsPage: async ({ page }, use) => {
    await use(new ProjectionsPage(page));
  },
});

export { expect };

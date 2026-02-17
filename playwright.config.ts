import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Load local env files for e2e credentials in non-shell-export workflows.
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const localBaseUrl = new URL(baseURL);
const localDevHost = localBaseUrl.hostname;
const localDevPort = localBaseUrl.port || "3000";

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 90_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "output/playwright/report" }]],
  outputDir: "output/playwright/results",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `pnpm dev --hostname ${localDevHost} --port ${localDevPort}`,
        url: baseURL,
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
        env: {
          ...process.env,
          NEXTAUTH_URL: baseURL
        }
      }
});

import { defineConfig, devices } from "@playwright/test";

const PORT = 3210;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    // Blank the launch list credentials, so the suite exercises the degraded
    // path and can never write to a real launch list. Next leaves variables
    // that are already in the environment alone, so these win over .env.local
    // on a machine that has one. Anything that needs the configured path
    // belongs in a check against a throwaway project, not here.
    env: { SUPABASE_URL: "", SUPABASE_ANON_KEY: "" },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, 'dist');

export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Load extension in Chrome
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
          ],
          // Headed mode locally, headless in CI (Chrome's new headless supports extensions)
          headless: !!process.env.CI,
        },
      },
    },
  ],

  // Build extension before running tests
  webServer: {
    command: 'npm run build',
    reuseExistingServer: !process.env.CI,
  },
});

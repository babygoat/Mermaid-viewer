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
  timeout: 10000,

  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:3456',
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
          // Chrome's new headless mode supports extensions
          headless: !!process.env.CI,
        },
      },
    },
  ],

  webServer: [
    {
      // Build extension before running tests
      command: 'npm run build',
      reuseExistingServer: !process.env.CI,
    },
    {
      // Serve test fixtures via HTTP
      command: 'npx serve tests/integration/fixtures -l 3456 --no-clipboard',
      url: 'http://localhost:3456',
      reuseExistingServer: !process.env.CI,
    },
  ],
});

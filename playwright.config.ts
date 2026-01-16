import { defineConfig } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, 'dist');

export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: false, // Extensions need sequential tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Extensions require single worker
  reporter: 'html',
  timeout: 10000,

  use: {
    baseURL: 'http://localhost:3456',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        // Extension testing requires specific Chrome args
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
          headless: false, // Extensions don't work in headless mode
        },
      },
    },
  ],

  webServer: [
    {
      command: 'npm run build',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npx serve tests/integration/fixtures -l 3456 --no-clipboard',
      url: 'http://localhost:3456',
      reuseExistingServer: !process.env.CI,
    },
  ],
});

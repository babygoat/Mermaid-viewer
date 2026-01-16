import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: false, // Extensions need sequential tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Extensions require single worker
  reporter: 'html',
  timeout: 10000,

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

import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '..', '..', 'dist');

// Custom test fixture that launches Chrome with the extension
export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // Wait for service worker to be registered
    let extensionId = '';

    // Check existing service workers first
    const workers = context.serviceWorkers();
    for (const worker of workers) {
      const url = worker.url();
      const match = url.match(/chrome-extension:\/\/([^/]+)/);
      if (match) {
        extensionId = match[1];
        break;
      }
    }

    // If not found, wait for it
    if (!extensionId) {
      const worker = await context.waitForEvent('serviceworker', { timeout: 5000 });
      const url = worker.url();
      const match = url.match(/chrome-extension:\/\/([^/]+)/);
      if (match) {
        extensionId = match[1];
      }
    }

    await use(extensionId);
  },
});

export { expect } from '@playwright/test';

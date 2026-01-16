import { test, expect } from './fixtures';

test.describe('popup', () => {
  test.describe('given extension popup opened', () => {
    test('when user views popup, then popup loads with domain displayed', async ({
      context,
      extensionId,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      expect(extensionId).toBeTruthy();

      // Open popup
      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

      // Check that popup elements are visible
      const domainElement = popupPage.locator('#currentDomain');
      await expect(domainElement).toBeVisible();

      const selectorInput = popupPage.locator('#selector');
      await expect(selectorInput).toBeVisible();

      const globalToggle = popupPage.locator('#globalToggle');
      await expect(globalToggle).toBeChecked(); // Should be on by default

      await page.close();
      await popupPage.close();
    });
  });

  test.describe('given extension popup with settings', () => {
    test('when user saves and resets settings, then settings persist and reset correctly', async ({
      context,
      extensionId,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

      // Change settings
      const autoRenderCheckbox = popupPage.locator('#autoRender');
      await autoRenderCheckbox.uncheck();

      // Save
      await popupPage.locator('#saveBtn').click();
      await expect(popupPage.locator('#status')).toContainText('saved');

      // Reload and verify persisted
      await popupPage.reload();
      await expect(autoRenderCheckbox).not.toBeChecked();

      // Reset to default
      await popupPage.locator('#resetBtn').click();
      await expect(popupPage.locator('#status')).toContainText('Reset');

      // Verify reset (auto-render should be checked again)
      await expect(autoRenderCheckbox).toBeChecked();

      await page.close();
      await popupPage.close();
    });
  });

  test.describe('given extension popup with global toggle', () => {
    test('when user toggles extension off, then extension is disabled', async ({
      context,
      extensionId,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

      // Toggle off
      const globalToggle = popupPage.locator('#globalToggle');
      await expect(globalToggle).toBeChecked();

      await globalToggle.uncheck();
      await expect(popupPage.locator('#status')).toContainText('disabled');
      await expect(globalToggle).not.toBeChecked();

      await page.close();
      await popupPage.close();
    });
  });
});

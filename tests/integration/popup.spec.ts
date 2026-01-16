import { test, expect } from './fixtures';

test.describe('popup', () => {
  test.describe('given extension popup opened', () => {
    test('when user views popup, then current domain is displayed', async ({
      context,
      extensionId,
    }) => {
      // First navigate to a page to set the active tab
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      expect(extensionId).toBeTruthy();

      // Open popup in new page
      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

      // Check that domain element is visible
      const domainElement = popupPage.locator('#currentDomain');
      await expect(domainElement).toBeVisible();

      await page.close();
      await popupPage.close();
    });
  });

  test.describe('given extension popup with selector input', () => {
    test('when user changes selector and clicks Save, then new selector is persisted', async ({
      context,
      extensionId,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      // Open popup
      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

      // Change selector
      const selectorInput = popupPage.locator('#selector');
      await selectorInput.fill('.custom-selector');

      // Click save
      const saveButton = popupPage.locator('#saveBtn');
      await saveButton.click();

      // Check for success message
      const statusMessage = popupPage.locator('#status');
      await expect(statusMessage).toContainText('saved');

      await page.close();
      await popupPage.close();
    });
  });

  test.describe('given extension popup with auto-render checkbox', () => {
    test('when user unchecks auto-render and saves, then setting is persisted', async ({
      context,
      extensionId,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      // Open popup
      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

      // Uncheck auto-render
      const autoRenderCheckbox = popupPage.locator('#autoRender');
      await autoRenderCheckbox.uncheck();

      // Click save
      const saveButton = popupPage.locator('#saveBtn');
      await saveButton.click();

      // Check for success message
      const statusMessage = popupPage.locator('#status');
      await expect(statusMessage).toContainText('saved');

      // Reload popup and verify setting persisted
      await popupPage.reload();
      await expect(autoRenderCheckbox).not.toBeChecked();

      await page.close();
      await popupPage.close();
    });
  });

  test.describe('given extension popup with saved domain settings', () => {
    test('when user clicks Reset, then domain settings return to default', async ({
      context,
      extensionId,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      // Open popup and save custom settings first
      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

      // Change selector and save
      const selectorInput = popupPage.locator('#selector');
      await selectorInput.fill('.custom-selector');
      await popupPage.locator('#saveBtn').click();

      // Wait for save confirmation
      await expect(popupPage.locator('#status')).toContainText('saved');

      // Click Reset
      const resetButton = popupPage.locator('#resetBtn');
      await resetButton.click();

      // Check for reset message
      const statusMessage = popupPage.locator('#status');
      await expect(statusMessage).toContainText('Reset');

      // Verify selector is back to default
      await expect(selectorInput).toHaveValue('pre > code');

      await page.close();
      await popupPage.close();
    });
  });

  test.describe('given extension popup with global toggle', () => {
    test('when user toggles extension off, then extension is disabled globally', async ({
      context,
      extensionId,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      // Open popup
      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

      // Toggle off
      const globalToggle = popupPage.locator('#globalToggle');
      await expect(globalToggle).toBeChecked(); // Should be on by default

      await globalToggle.uncheck();

      // Check for status message
      const statusMessage = popupPage.locator('#status');
      await expect(statusMessage).toContainText('disabled');

      // Verify toggle is off
      await expect(globalToggle).not.toBeChecked();

      await page.close();
      await popupPage.close();
    });
  });
});

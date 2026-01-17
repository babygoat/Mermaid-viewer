import { test, expect } from './fixtures';

test.describe('popup', () => {
  test.describe('given extension popup opened', () => {
    test('when user views popup, then all UI elements are visible and functional', async ({
      context,
      extensionId,
    }) => {
      expect(extensionId).toBeTruthy();

      // Open popup directly (domain detection won't work without active tab context)
      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

      // Check that all UI elements are visible
      const domainElement = popupPage.locator('#currentDomain');
      await expect(domainElement).toBeVisible();

      const selectorInput = popupPage.locator('#selector');
      await expect(selectorInput).toBeVisible();
      // Default selector should be pre > code
      await expect(selectorInput).toHaveValue('pre > code');

      const autoRenderCheckbox = popupPage.locator('#autoRender');
      await expect(autoRenderCheckbox).toBeVisible();
      await expect(autoRenderCheckbox).toBeChecked(); // Default: on

      // Global toggle is a custom styled switch (checkbox is visually hidden via CSS)
      // Check the toggle switch container is visible and checkbox state is correct
      const toggleSwitch = popupPage.locator('.toggle-switch');
      await expect(toggleSwitch).toBeVisible();
      const globalToggle = popupPage.locator('#globalToggle');
      await expect(globalToggle).toBeChecked(); // Default: on

      const saveBtn = popupPage.locator('#saveBtn');
      await expect(saveBtn).toBeVisible();

      const resetBtn = popupPage.locator('#resetBtn');
      await expect(resetBtn).toBeVisible();

      await popupPage.close();
    });
  });

  test.describe('given extension popup with global toggle', () => {
    test('when user toggles extension off and on, then global state changes', async ({
      context,
      extensionId,
    }) => {
      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

      // The checkbox is hidden (opacity:0, 0x0) for custom styling
      // Click the visible <label class="toggle-switch"> to toggle state
      const toggleSwitch = popupPage.locator('.toggle-switch');
      const globalToggle = popupPage.locator('#globalToggle');
      const statusEl = popupPage.locator('#status');

      // Should be enabled by default
      await expect(globalToggle).toBeChecked();

      // Toggle off by clicking the visible label
      await toggleSwitch.click();
      await expect(statusEl).toContainText('disabled');
      await expect(globalToggle).not.toBeChecked();

      // Toggle back on
      await toggleSwitch.click();
      await expect(statusEl).toContainText('enabled');
      await expect(globalToggle).toBeChecked();

      await popupPage.close();
    });
  });
});

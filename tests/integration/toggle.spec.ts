import { test, expect } from '@playwright/test';
import path from 'path';

const fixturesPath = path.join(__dirname, 'fixtures');

test.describe('toggle', () => {
  test.describe('given page with rendered Mermaid block', () => {
    test('when user clicks "Code" button, then code view is visible and diagram view is hidden', async ({
      page,
    }) => {
      await page.goto(`file://${fixturesPath}/basic-mermaid.html`);

      // Wait for extension to process and auto-render
      await page.waitForSelector('.mermaid-viewer-wrapper');
      const wrapper = page.locator('.mermaid-viewer-wrapper').first();

      // Initially diagram should be visible (auto-render is on)
      const diagramView = wrapper.locator('.mermaid-viewer-diagram');
      await expect(diagramView).toBeVisible();

      // Click Code button
      const codeButton = wrapper.locator('.mermaid-viewer-btn', { hasText: 'Code' });
      await codeButton.click();

      // Code view should be visible, diagram should be hidden
      const codeView = wrapper.locator('.mermaid-viewer-code');
      await expect(codeView).toBeVisible();
      await expect(diagramView).toBeHidden();
    });
  });

  test.describe('given page with Mermaid block in code view', () => {
    test('when user clicks "Diagram" button, then diagram view is visible and code view is hidden', async ({
      page,
    }) => {
      await page.goto(`file://${fixturesPath}/basic-mermaid.html`);

      // Wait for extension to process
      await page.waitForSelector('.mermaid-viewer-wrapper');
      const wrapper = page.locator('.mermaid-viewer-wrapper').first();

      // Click Code first to switch to code view
      const codeButton = wrapper.locator('.mermaid-viewer-btn', { hasText: 'Code' });
      await codeButton.click();

      const codeView = wrapper.locator('.mermaid-viewer-code');
      await expect(codeView).toBeVisible();

      // Click Diagram button
      const diagramButton = wrapper.locator('.mermaid-viewer-btn', { hasText: 'Diagram' });
      await diagramButton.click();

      // Diagram view should be visible, code should be hidden
      const diagramView = wrapper.locator('.mermaid-viewer-diagram');
      await expect(diagramView).toBeVisible();
      await expect(codeView).toBeHidden();
    });
  });

  test.describe('given page with Mermaid block', () => {
    test('when toggle buttons are rendered, then "Code" and "Diagram" buttons are visible', async ({
      page,
    }) => {
      await page.goto(`file://${fixturesPath}/basic-mermaid.html`);

      // Wait for extension to process
      await page.waitForSelector('.mermaid-viewer-wrapper');
      const wrapper = page.locator('.mermaid-viewer-wrapper').first();

      // Both buttons should be visible
      const codeButton = wrapper.locator('.mermaid-viewer-btn', { hasText: 'Code' });
      const diagramButton = wrapper.locator('.mermaid-viewer-btn', { hasText: 'Diagram' });

      await expect(codeButton).toBeVisible();
      await expect(diagramButton).toBeVisible();
    });
  });

  test.describe('given page with rendered diagram', () => {
    test('when user toggles Code → Diagram → Code, then views switch correctly each time', async ({
      page,
    }) => {
      await page.goto(`file://${fixturesPath}/basic-mermaid.html`);

      // Wait for extension to process
      await page.waitForSelector('.mermaid-viewer-wrapper');
      const wrapper = page.locator('.mermaid-viewer-wrapper').first();

      const codeButton = wrapper.locator('.mermaid-viewer-btn', { hasText: 'Code' });
      const diagramButton = wrapper.locator('.mermaid-viewer-btn', { hasText: 'Diagram' });
      const codeView = wrapper.locator('.mermaid-viewer-code');
      const diagramView = wrapper.locator('.mermaid-viewer-diagram');

      // Initially: diagram visible (auto-render)
      await expect(diagramView).toBeVisible();
      await expect(codeView).toBeHidden();

      // Toggle to Code
      await codeButton.click();
      await expect(codeView).toBeVisible();
      await expect(diagramView).toBeHidden();

      // Toggle to Diagram
      await diagramButton.click();
      await expect(diagramView).toBeVisible();
      await expect(codeView).toBeHidden();

      // Toggle to Code again
      await codeButton.click();
      await expect(codeView).toBeVisible();
      await expect(diagramView).toBeHidden();
    });
  });

  test.describe('given page with non-Mermaid code block', () => {
    test('when extension loads, then no toggle UI is added to non-Mermaid block', async ({
      page,
    }) => {
      await page.goto(`file://${fixturesPath}/multiple-diagrams.html`);

      // Wait for extension to process
      await page.waitForSelector('.mermaid-viewer-wrapper');

      // Should have exactly 3 wrappers (flowchart, sequence, class)
      const wrappers = page.locator('.mermaid-viewer-wrapper');
      await expect(wrappers).toHaveCount(3);

      // The non-Mermaid code block should not have wrapper
      // Check that original pre > code without wrapper still exists
      const allCodeBlocks = page.locator('pre > code');
      const wrappedBlocks = page.locator('.mermaid-viewer-wrapper');

      // 4 code blocks total, 3 wrapped = 1 unwrapped (the JS code)
      await expect(allCodeBlocks).toHaveCount(4);
      await expect(wrappedBlocks).toHaveCount(3);
    });
  });
});

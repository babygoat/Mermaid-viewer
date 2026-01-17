import { test, expect } from './fixtures';

test.describe('render', () => {
  test.describe('given page with Mermaid code block', () => {
    test('when extension loads and auto-renders, then SVG diagram is visible', async ({
      context,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      // Wait for extension to process the page
      await page.waitForSelector('.mermaid-viewer-wrapper', { timeout: 5000 });

      // Check that diagram view contains SVG
      const diagramView = page.locator('.mermaid-viewer-diagram').first();
      await expect(diagramView).toBeVisible();

      const svg = diagramView.locator('svg');
      await expect(svg).toBeVisible();

      await page.close();
    });
  });

  test.describe('given page with Mermaid code block that has syntax error', () => {
    test('when extension loads and user clicks Diagram tab, then error message is displayed', async ({
      context,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/invalid-mermaid.html');

      // Wait for extension to process the page
      await page.waitForSelector('.mermaid-viewer-wrapper', { timeout: 5000 });

      // Click the Diagram button to trigger render
      const diagramButton = page.locator('.mermaid-viewer-btn', { hasText: 'Diagram' });
      await diagramButton.click();

      // Check for error message
      const errorMessage = page.locator('.mermaid-viewer-error');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Error');

      await page.close();
    });
  });

  test.describe('given page with multiple Mermaid blocks', () => {
    test('when extension loads, then all Mermaid blocks are detected and wrapped', async ({
      context,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/multiple-diagrams.html');

      // Wait for extension to process the page
      await page.waitForSelector('.mermaid-viewer-wrapper', { timeout: 5000 });

      // Should have 3 mermaid wrappers (flowchart, sequence, class) but not the JS code
      const wrappers = page.locator('.mermaid-viewer-wrapper');
      await expect(wrappers).toHaveCount(3);

      await page.close();
    });
  });
});

import { test, expect } from './fixtures';

test.describe('render', () => {
  test.describe('given page with flowchart code block', () => {
    test('when extension loads and auto-renders, then SVG diagram is visible in diagram view', async ({
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

  test.describe('given page with sequence diagram code block', () => {
    test('when extension loads and auto-renders, then SVG diagram is visible in diagram view', async ({
      context,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      // Wait for extension to process the page
      await page.waitForSelector('.mermaid-viewer-wrapper', { timeout: 5000 });

      // Find the sequence diagram (second wrapper)
      const wrappers = page.locator('.mermaid-viewer-wrapper');
      await expect(wrappers).toHaveCount(4); // 4 mermaid blocks in basic-mermaid.html

      // Second diagram should be sequence diagram
      const secondDiagram = wrappers.nth(1).locator('.mermaid-viewer-diagram svg');
      await expect(secondDiagram).toBeVisible();

      await page.close();
    });
  });

  test.describe('given page with class diagram code block', () => {
    test('when extension loads and auto-renders, then SVG diagram is visible in diagram view', async ({
      context,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      // Wait for extension to process the page
      await page.waitForSelector('.mermaid-viewer-wrapper', { timeout: 5000 });

      // Fourth diagram should be class diagram
      const wrappers = page.locator('.mermaid-viewer-wrapper');
      const fourthDiagram = wrappers.nth(3).locator('.mermaid-viewer-diagram svg');
      await expect(fourthDiagram).toBeVisible();

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
    test('when extension loads, then all blocks have toggle UI added', async ({ context }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/multiple-diagrams.html');

      // Wait for extension to process the page
      await page.waitForSelector('.mermaid-viewer-wrapper', { timeout: 5000 });

      // Should have 3 mermaid wrappers (flowchart, sequence, class) but not the JS code
      const wrappers = page.locator('.mermaid-viewer-wrapper');
      await expect(wrappers).toHaveCount(3);

      // Each wrapper should have toolbar with buttons
      for (let i = 0; i < 3; i++) {
        const toolbar = wrappers.nth(i).locator('.mermaid-viewer-toolbar');
        await expect(toolbar).toBeVisible();

        const codeButton = wrappers.nth(i).locator('.mermaid-viewer-btn', { hasText: 'Code' });
        const diagramButton = wrappers.nth(i).locator('.mermaid-viewer-btn', { hasText: 'Diagram' });
        await expect(codeButton).toBeVisible();
        await expect(diagramButton).toBeVisible();
      }

      await page.close();
    });
  });
});

import { test, expect } from './fixtures';

test.describe('toggle', () => {
  test.describe('given page with rendered Mermaid diagram', () => {
    test('when user toggles Code → Diagram → Code, then views switch correctly', async ({
      context,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/basic-mermaid.html');

      // Wait for extension to process
      await page.waitForSelector('.mermaid-viewer-wrapper', { timeout: 5000 });
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

      await page.close();
    });
  });

  test.describe('given page with non-Mermaid code block', () => {
    test('when extension loads, then non-Mermaid blocks are not wrapped', async ({
      context,
    }) => {
      const page = await context.newPage();
      await page.goto('http://localhost:3456/multiple-diagrams.html');

      // Wait for extension to process
      await page.waitForSelector('.mermaid-viewer-wrapper', { timeout: 5000 });

      // Should have exactly 3 wrappers (flowchart, sequence, class)
      // The non-Mermaid JS code block should NOT be wrapped
      const wrappers = page.locator('.mermaid-viewer-wrapper');
      await expect(wrappers).toHaveCount(3);

      // 7 code blocks total: 3 hidden original Mermaid + 3 cloned in wrappers + 1 non-Mermaid
      const allCodeBlocks = page.locator('pre > code');
      await expect(allCodeBlocks).toHaveCount(7);

      await page.close();
    });
  });
});

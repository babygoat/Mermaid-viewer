import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import mermaid from 'mermaid';

// Mock mermaid module
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(),
    parse: vi.fn(),
  },
}));

// Import after mocking
import {
  detectTheme,
  initializeMermaid,
  reinitializeMermaid,
  renderMermaid,
  validateMermaid,
} from '../../src/content/renderer';

describe('renderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document state
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-color-mode');
    document.body.className = '';
    document.body.removeAttribute('data-theme');
    document.body.removeAttribute('data-color-mode');
    document.body.style.backgroundColor = '';
  });

  describe('detectTheme', () => {
    describe('given HTML element has class "dark"', () => {
      beforeEach(() => {
        document.documentElement.classList.add('dark');
      });

      it('when detectTheme() is called, then returns "dark"', () => {
        expect(detectTheme()).toBe('dark');
      });
    });

    describe('given body element has class "dark"', () => {
      beforeEach(() => {
        document.body.classList.add('dark');
      });

      it('when detectTheme() is called, then returns "dark"', () => {
        expect(detectTheme()).toBe('dark');
      });
    });

    describe('given HTML element has data-theme="dark"', () => {
      beforeEach(() => {
        document.documentElement.dataset.theme = 'dark';
      });

      it('when detectTheme() is called, then returns "dark"', () => {
        expect(detectTheme()).toBe('dark');
      });
    });

    describe('given body element has data-theme="dark"', () => {
      beforeEach(() => {
        document.body.dataset.theme = 'dark';
      });

      it('when detectTheme() is called, then returns "dark"', () => {
        expect(detectTheme()).toBe('dark');
      });
    });

    describe('given HTML element has data-color-mode="dark"', () => {
      beforeEach(() => {
        document.documentElement.dataset.colorMode = 'dark';
      });

      it('when detectTheme() is called, then returns "dark"', () => {
        expect(detectTheme()).toBe('dark');
      });
    });

    describe('given body element has data-color-mode="dark"', () => {
      beforeEach(() => {
        document.body.dataset.colorMode = 'dark';
      });

      it('when detectTheme() is called, then returns "dark"', () => {
        expect(detectTheme()).toBe('dark');
      });
    });

    describe('given body has dark background rgb(30, 30, 30)', () => {
      beforeEach(() => {
        document.body.style.backgroundColor = 'rgb(30, 30, 30)';
      });

      it('when detectTheme() is called, then returns "dark"', () => {
        expect(detectTheme()).toBe('dark');
      });
    });

    describe('given body has light background rgb(255, 255, 255)', () => {
      beforeEach(() => {
        document.body.style.backgroundColor = 'rgb(255, 255, 255)';
      });

      it('when detectTheme() is called, then returns "default"', () => {
        expect(detectTheme()).toBe('default');
      });
    });

    describe('given prefers-color-scheme: dark media query matches', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: vi.fn().mockImplementation((query: string) => ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          })),
        });
      });

      it('when detectTheme() is called, then returns "dark"', () => {
        expect(detectTheme()).toBe('dark');
      });
    });

    describe('given no dark theme indicators present', () => {
      beforeEach(() => {
        document.body.style.backgroundColor = 'rgb(255, 255, 255)';
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          })),
        });
      });

      it('when detectTheme() is called, then returns "default"', () => {
        expect(detectTheme()).toBe('default');
      });
    });
  });

  describe('initializeMermaid', () => {
    // Need to reset module state between tests
    beforeEach(async () => {
      // Re-import to reset module state
      vi.resetModules();
      vi.clearAllMocks();
    });

    describe('given mermaid not yet initialized', () => {
      it('when initializeMermaid() is called, then mermaid.initialize is called once', async () => {
        // Re-import to get fresh module state
        const { initializeMermaid: freshInit } = await import('../../src/content/renderer');
        freshInit();

        expect(mermaid.initialize).toHaveBeenCalledTimes(1);
      });
    });

    describe('given mermaid already initialized', () => {
      it('when initializeMermaid() is called again, then mermaid.initialize is not called again', async () => {
        const { initializeMermaid: freshInit } = await import('../../src/content/renderer');
        freshInit();
        freshInit();

        expect(mermaid.initialize).toHaveBeenCalledTimes(1);
      });
    });

    describe('given dark theme detected', () => {
      beforeEach(() => {
        document.documentElement.classList.add('dark');
      });

      it('when initializeMermaid() is called, then initialized with theme: "dark"', async () => {
        const { initializeMermaid: freshInit } = await import('../../src/content/renderer');
        freshInit();

        expect(mermaid.initialize).toHaveBeenCalledWith(
          expect.objectContaining({
            theme: 'dark',
          })
        );
      });
    });
  });

  describe('reinitializeMermaid', () => {
    beforeEach(async () => {
      vi.resetModules();
      vi.clearAllMocks();
    });

    describe('given mermaid already initialized', () => {
      it('when reinitializeMermaid() is called, then mermaid.initialize is called again', async () => {
        const { initializeMermaid: freshInit, reinitializeMermaid: freshReinit } =
          await import('../../src/content/renderer');

        freshInit();
        expect(mermaid.initialize).toHaveBeenCalledTimes(1);

        freshReinit();
        expect(mermaid.initialize).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('renderMermaid', () => {
    beforeEach(() => {
      vi.resetModules();
      vi.clearAllMocks();
    });

    describe('given valid flowchart code', () => {
      beforeEach(() => {
        vi.mocked(mermaid.render).mockResolvedValue({
          svg: '<svg>rendered diagram</svg>',
          bindFunctions: vi.fn(),
        });
      });

      it('when renderMermaid() is called, then returns object with svg', async () => {
        const { renderMermaid: freshRender } = await import('../../src/content/renderer');
        const result = await freshRender('graph TD\n  A --> B');

        expect(result).toEqual({ svg: '<svg>rendered diagram</svg>' });
      });
    });

    describe('given invalid Mermaid code', () => {
      beforeEach(() => {
        vi.mocked(mermaid.render).mockRejectedValue(new Error('Parse error'));
      });

      it('when renderMermaid() is called, then returns object with error', async () => {
        const { renderMermaid: freshRender } = await import('../../src/content/renderer');
        const result = await freshRender('invalid mermaid');

        expect(result).toEqual({ svg: '', error: 'Parse error' });
      });
    });

    describe('given multiple render calls', () => {
      beforeEach(() => {
        vi.mocked(mermaid.render).mockResolvedValue({
          svg: '<svg>diagram</svg>',
          bindFunctions: vi.fn(),
        });
      });

      it('when renderMermaid() is called twice, then each call generates unique diagram ID', async () => {
        const { renderMermaid: freshRender } = await import('../../src/content/renderer');

        await freshRender('graph TD\n  A --> B');
        await freshRender('graph LR\n  C --> D');

        const calls = vi.mocked(mermaid.render).mock.calls;
        expect(calls[0][0]).not.toBe(calls[1][0]); // Different IDs
      });
    });
  });

  describe('validateMermaid', () => {
    describe('given valid Mermaid code', () => {
      beforeEach(() => {
        vi.mocked(mermaid.parse).mockResolvedValue(undefined);
      });

      it('when validateMermaid() is called, then returns true', async () => {
        const result = await validateMermaid('graph TD\n  A --> B');
        expect(result).toBe(true);
      });
    });

    describe('given invalid Mermaid code', () => {
      beforeEach(() => {
        vi.mocked(mermaid.parse).mockRejectedValue(new Error('Invalid syntax'));
      });

      it('when validateMermaid() is called, then returns false', async () => {
        const result = await validateMermaid('not valid mermaid');
        expect(result).toBe(false);
      });
    });
  });
});

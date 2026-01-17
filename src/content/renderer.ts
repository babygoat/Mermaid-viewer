// Mermaid diagram rendering

import mermaid from 'mermaid';

let initialized = false;
let diagramCounter = 0;

/**
 * Detect if the page is using a dark theme
 */
export function detectTheme(): 'dark' | 'default' {
  // Check common dark mode indicators
  const html = document.documentElement;
  const body = document.body;

  // Check for explicit dark mode attributes
  if (
    html.classList.contains('dark') ||
    body.classList.contains('dark') ||
    html.dataset.theme === 'dark' ||
    body.dataset.theme === 'dark' ||
    html.dataset.colorMode === 'dark' ||
    body.dataset.colorMode === 'dark'
  ) {
    return 'dark';
  }

  // Check computed background color
  const bgColor = window.getComputedStyle(body).backgroundColor;
  const rgb = bgColor.match(/\d+/g);
  if (rgb && rgb.length >= 3) {
    const [r, g, b] = rgb.map(Number);
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (luminance < 0.5) {
      return 'dark';
    }
  }

  // Check prefers-color-scheme media query
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'default';
}

/**
 * Initialize Mermaid with appropriate theme
 */
export function initializeMermaid(): void {
  if (initialized) return;

  const theme = detectTheme();

  mermaid.initialize({
    startOnLoad: false,
    theme: theme,
    securityLevel: 'loose',
    fontFamily: 'inherit',
  });

  initialized = true;
}

/**
 * Re-initialize Mermaid with a new theme (for theme changes)
 */
export function reinitializeMermaid(): void {
  initialized = false;
  initializeMermaid();
}

/**
 * Render Mermaid code to SVG
 */
export async function renderMermaid(code: string): Promise<{ svg: string; error?: string }> {
  initializeMermaid();

  const id = `mermaid-diagram-${++diagramCounter}`;

  try {
    const { svg } = await mermaid.render(id, code);
    return { svg };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error rendering diagram';
    return { svg: '', error: errorMessage };
  }
}

/**
 * Validate Mermaid code without rendering
 */
export async function validateMermaid(code: string): Promise<boolean> {
  try {
    await mermaid.parse(code);
    return true;
  } catch {
    return false;
  }
}

// UI components for Mermaid preview toggle

import { extractMermaidCode } from './detector';
import { renderMermaid } from './renderer';

export type ViewMode = 'code' | 'diagram';

interface MermaidContainer {
  wrapper: HTMLElement;
  codeView: HTMLElement;
  diagramView: HTMLElement;
  codeButton: HTMLButtonElement;
  diagramButton: HTMLButtonElement;
  originalElement: HTMLElement;
  originalParent: HTMLElement;
  code: string;
  rendered: boolean;
}

const containers: Map<HTMLElement, MermaidContainer> = new Map();

/**
 * Create a toggle button
 */
function createToggleButton(label: string, isActive: boolean): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = label;
  button.className = `mermaid-viewer-btn ${isActive ? 'mermaid-viewer-btn-active' : ''}`;
  return button;
}

/**
 * Create the wrapper container for a Mermaid code block
 */
export function createMermaidWrapper(codeElement: HTMLElement): MermaidContainer | null {
  // Find the parent <pre> element if we're on a <code> element
  const preElement = codeElement.tagName === 'CODE' ? codeElement.parentElement : codeElement;
  if (!preElement || !preElement.parentElement) return null;

  const originalParent = preElement.parentElement;
  const code = extractMermaidCode(codeElement);

  // Mark as processed
  codeElement.dataset.mermaidProcessed = 'true';

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'mermaid-viewer-wrapper';

  // Create toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'mermaid-viewer-toolbar';

  // Create toggle buttons
  const codeButton = createToggleButton('Code', true);
  const diagramButton = createToggleButton('Diagram', false);

  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'mermaid-viewer-btn-group';
  buttonGroup.appendChild(codeButton);
  buttonGroup.appendChild(diagramButton);

  toolbar.appendChild(buttonGroup);

  // Create code view (original element)
  const codeView = document.createElement('div');
  codeView.className = 'mermaid-viewer-code';
  codeView.appendChild(preElement.cloneNode(true));

  // Create diagram view
  const diagramView = document.createElement('div');
  diagramView.className = 'mermaid-viewer-diagram mermaid-viewer-hidden';

  // Assemble wrapper
  wrapper.appendChild(toolbar);
  wrapper.appendChild(codeView);
  wrapper.appendChild(diagramView);

  // Replace original element
  originalParent.insertBefore(wrapper, preElement);
  preElement.style.display = 'none';

  const container: MermaidContainer = {
    wrapper,
    codeView,
    diagramView,
    codeButton,
    diagramButton,
    originalElement: preElement,
    originalParent,
    code,
    rendered: false,
  };

  // Set up event listeners
  codeButton.addEventListener('click', () => switchView(container, 'code'));
  diagramButton.addEventListener('click', () => switchView(container, 'diagram'));

  containers.set(codeElement, container);

  return container;
}

/**
 * Switch between code and diagram view
 */
async function switchView(container: MermaidContainer, mode: ViewMode): Promise<void> {
  const { codeView, diagramView, codeButton, diagramButton } = container;

  if (mode === 'code') {
    codeView.classList.remove('mermaid-viewer-hidden');
    diagramView.classList.add('mermaid-viewer-hidden');
    codeButton.classList.add('mermaid-viewer-btn-active');
    diagramButton.classList.remove('mermaid-viewer-btn-active');
  } else {
    // Render diagram if not already rendered
    if (!container.rendered) {
      await renderDiagram(container);
    }

    codeView.classList.add('mermaid-viewer-hidden');
    diagramView.classList.remove('mermaid-viewer-hidden');
    codeButton.classList.remove('mermaid-viewer-btn-active');
    diagramButton.classList.add('mermaid-viewer-btn-active');
  }
}

/**
 * Render the Mermaid diagram
 */
async function renderDiagram(container: MermaidContainer): Promise<void> {
  const { diagramView, code } = container;

  // Show loading state
  diagramView.innerHTML = '<div class="mermaid-viewer-loading">Rendering diagram...</div>';

  const result = await renderMermaid(code);

  if (result.error) {
    diagramView.innerHTML = `
      <div class="mermaid-viewer-error">
        <strong>Error rendering diagram:</strong>
        <pre>${escapeHtml(result.error)}</pre>
      </div>
    `;
  } else {
    diagramView.innerHTML = result.svg;
    container.rendered = true;
  }
}

/**
 * Auto-render a container (switch to diagram view immediately)
 */
export async function autoRender(container: MermaidContainer): Promise<void> {
  await switchView(container, 'diagram');
}

/**
 * Get container for a code element
 */
export function getContainer(codeElement: HTMLElement): MermaidContainer | undefined {
  return containers.get(codeElement);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Cleanup and remove all mermaid wrappers (for extension disable)
 */
export function cleanup(): void {
  containers.forEach((container) => {
    const { wrapper, originalElement, originalParent } = container;
    originalElement.style.display = '';
    if (wrapper.parentElement === originalParent) {
      originalParent.removeChild(wrapper);
    }
    const codeEl = originalElement.querySelector('code') || originalElement;
    if (codeEl instanceof HTMLElement) {
      delete codeEl.dataset.mermaidProcessed;
    }
  });
  containers.clear();
}

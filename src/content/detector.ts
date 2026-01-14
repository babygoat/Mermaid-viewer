// Mermaid code block detection

/**
 * Mermaid diagram type keywords that indicate a code block contains Mermaid syntax
 */
const MERMAID_KEYWORDS = [
  'graph ',
  'graph\n',
  'flowchart ',
  'flowchart\n',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'erDiagram',
  'gantt',
  'pie ',
  'pie\n',
  'pieChart',
  'quadrantChart',
  'requirementDiagram',
  'journey',
  'gitGraph',
  'mindmap',
  'timeline',
  'sankey',
  'xychart',
  'block-beta',
  'architecture',
  'kanban',
  'packet-beta',
];

/**
 * Check if a string contains Mermaid diagram syntax
 */
export function isMermaidCode(code: string): boolean {
  const trimmed = code.trim();
  return MERMAID_KEYWORDS.some((keyword) => trimmed.startsWith(keyword));
}

/**
 * Find all code blocks matching the selector that contain Mermaid code
 */
export function findMermaidBlocks(selector: string): HTMLElement[] {
  const codeBlocks = document.querySelectorAll<HTMLElement>(selector);
  const mermaidBlocks: HTMLElement[] = [];

  codeBlocks.forEach((block) => {
    // Skip if already processed
    if (block.dataset.mermaidProcessed === 'true') {
      return;
    }

    const code = block.textContent || '';
    if (isMermaidCode(code)) {
      mermaidBlocks.push(block);
    }
  });

  return mermaidBlocks;
}

/**
 * Extract the Mermaid code from a code block element
 */
export function extractMermaidCode(element: HTMLElement): string {
  return (element.textContent || '').trim();
}

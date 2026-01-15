import { describe, it, expect, beforeEach } from 'vitest';
import { isMermaidCode, findMermaidBlocks, extractMermaidCode } from '../../src/content/detector';

describe('detector', () => {
  describe('isMermaidCode', () => {
    describe('given a string starting with valid Mermaid keywords', () => {
      it.each([
        ['graph TD\n  A --> B', 'graph'],
        ['graph\nA --> B', 'graph with newline'],
        ['flowchart LR\n  A --> B', 'flowchart'],
        ['flowchart\nA --> B', 'flowchart with newline'],
        ['sequenceDiagram\n  A->>B: Hi', 'sequenceDiagram'],
        ['classDiagram\n  Class01', 'classDiagram'],
        ['stateDiagram\n  [*] --> S1', 'stateDiagram'],
        ['erDiagram\n  CUSTOMER', 'erDiagram'],
        ['gantt\n  title A Gantt', 'gantt'],
        ['pie\n  title Pets', 'pie with newline'],
        ['pie "title"', 'pie with space'],
        ['mindmap\n  root((mindmap))', 'mindmap'],
        ['gitGraph\n  commit', 'gitGraph'],
        ['timeline\n  title Timeline', 'timeline'],
        ['journey\n  title Journey', 'journey'],
        ['quadrantChart\n  title Chart', 'quadrantChart'],
        ['xychart\n  title Chart', 'xychart'],
        ['block-beta\n  columns 1', 'block-beta'],
        ['kanban\n  column', 'kanban'],
      ])('when isMermaidCode() is called with "%s" (%s), then returns true', (code) => {
        expect(isMermaidCode(code)).toBe(true);
      });
    });

    describe('given a string with leading whitespace', () => {
      it('when isMermaidCode() is called, then returns true (trimmed)', () => {
        expect(isMermaidCode('  graph TD\n  A --> B')).toBe(true);
      });
    });

    describe('given a string with leading newlines', () => {
      it('when isMermaidCode() is called, then returns true (trimmed)', () => {
        expect(isMermaidCode('\n\ngraph TD\n  A --> B')).toBe(true);
      });
    });

    describe('given a non-Mermaid code string', () => {
      it.each([
        ['function hello() {}', 'JavaScript code'],
        ['def hello():\n  pass', 'Python code'],
        ['Hello World', 'plain text'],
        ['', 'empty string'],
        ['graphics', 'graph without space/newline'],
        ['piece of cake', 'pie without space/newline'],
        ['SELECT * FROM users', 'SQL code'],
        ['<div>HTML</div>', 'HTML code'],
      ])('when isMermaidCode() is called with "%s" (%s), then returns false', (code) => {
        expect(isMermaidCode(code)).toBe(false);
      });
    });
  });

  describe('findMermaidBlocks', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    describe('given DOM with one <pre><code> containing flowchart', () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <pre><code>graph TD
            A --> B</code></pre>
        `;
      });

      it('when findMermaidBlocks() is called, then returns array with 1 element', () => {
        const blocks = findMermaidBlocks('pre > code');
        expect(blocks).toHaveLength(1);
      });
    });

    describe('given DOM with three <pre><code> containing different diagrams', () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <pre><code>graph TD
            A --> B</code></pre>
          <pre><code>sequenceDiagram
            A->>B: Hi</code></pre>
          <pre><code>classDiagram
            Class01</code></pre>
        `;
      });

      it('when findMermaidBlocks() is called, then returns array with 3 elements', () => {
        const blocks = findMermaidBlocks('pre > code');
        expect(blocks).toHaveLength(3);
      });
    });

    describe('given DOM with 2 Mermaid blocks and 1 JavaScript block', () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <pre><code>graph TD
            A --> B</code></pre>
          <pre><code>function hello() {
            console.log("hi");
          }</code></pre>
          <pre><code>sequenceDiagram
            A->>B: Hi</code></pre>
        `;
      });

      it('when findMermaidBlocks() is called, then returns array with 2 elements', () => {
        const blocks = findMermaidBlocks('pre > code');
        expect(blocks).toHaveLength(2);
      });
    });

    describe('given DOM with block having data-mermaid-processed="true"', () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <pre><code data-mermaid-processed="true">graph TD
            A --> B</code></pre>
        `;
      });

      it('when findMermaidBlocks() is called, then returns empty array (skipped)', () => {
        const blocks = findMermaidBlocks('pre > code');
        expect(blocks).toHaveLength(0);
      });
    });

    describe('given DOM with no Mermaid code blocks', () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <pre><code>const x = 1;</code></pre>
          <pre><code>print("hello")</code></pre>
        `;
      });

      it('when findMermaidBlocks() is called, then returns empty array', () => {
        const blocks = findMermaidBlocks('pre > code');
        expect(blocks).toHaveLength(0);
      });
    });

    describe('given DOM with Mermaid in custom selector', () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <div class="code"><pre>graph TD
            A --> B</pre></div>
          <pre><code>graph LR
            C --> D</code></pre>
        `;
      });

      it('when findMermaidBlocks() is called with custom selector, then returns matching blocks', () => {
        const blocks = findMermaidBlocks('div.code > pre');
        expect(blocks).toHaveLength(1);
      });
    });
  });

  describe('extractMermaidCode', () => {
    describe('given an element with Mermaid text content', () => {
      it('when extractMermaidCode() is called, then returns the text content', () => {
        const element = document.createElement('code');
        element.textContent = 'graph TD\n  A --> B';

        expect(extractMermaidCode(element)).toBe('graph TD\n  A --> B');
      });
    });

    describe('given an element with whitespace around text', () => {
      it('when extractMermaidCode() is called, then returns trimmed text', () => {
        const element = document.createElement('code');
        element.textContent = '  graph TD  ';

        expect(extractMermaidCode(element)).toBe('graph TD');
      });
    });

    describe('given an element with empty text', () => {
      it('when extractMermaidCode() is called, then returns empty string', () => {
        const element = document.createElement('code');
        element.textContent = '';

        expect(extractMermaidCode(element)).toBe('');
      });
    });

    describe('given an element with null textContent', () => {
      it('when extractMermaidCode() is called, then returns empty string', () => {
        const element = document.createElement('code');
        // textContent is null by default for empty elements in some cases

        expect(extractMermaidCode(element)).toBe('');
      });
    });
  });
});

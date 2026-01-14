# Mermaid Viewer

A Chrome extension that previews Mermaid diagrams directly in `<pre><code>` blocks on any webpage.

## Features

- **Auto-detection**: Automatically detects Mermaid code in code blocks
- **Toggle View**: Switch between code and rendered diagram views
- **Domain Settings**: Customize code block selectors per domain
- **Theme Support**: Automatically matches page theme (dark/light)
- **Auto-render**: Option to automatically render diagrams on page load

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/babygoat/Mermaid-viewer.git
   cd Mermaid-viewer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Usage

### Basic Usage

1. Navigate to any webpage with Mermaid code in `<pre><code>` blocks
2. The extension will automatically detect and wrap Mermaid code blocks
3. Use the **Code** / **Diagram** toggle to switch views

### Popup Settings

Click the extension icon to access settings:

- **Global Toggle**: Enable/disable the extension globally
- **Selector**: Customize the CSS selector for code blocks (default: `pre > code`)
- **Auto-render**: Toggle automatic diagram rendering on page load
- **Domain Enable**: Enable/disable for the current domain

Settings are saved per-domain, allowing different configurations for different sites.

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Clean build output
npm run clean
```

## Project Structure

```
├── manifest.json           # Chrome Extension Manifest v3
├── package.json            # NPM configuration
├── esbuild.config.js       # Build configuration
├── tsconfig.json           # TypeScript configuration
├── src/
│   ├── content/            # Content script (injected into pages)
│   │   ├── index.ts        # Entry point
│   │   ├── detector.ts     # Mermaid code detection
│   │   ├── renderer.ts     # Mermaid rendering
│   │   ├── ui.ts           # Toggle UI components
│   │   └── styles.css      # Injected styles
│   ├── popup/              # Extension popup
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   ├── background/         # Service worker
│   │   └── service-worker.ts
│   └── storage/            # Chrome storage helpers
│       └── settings.ts
├── icons/                  # Extension icons
└── dist/                   # Build output (load this in Chrome)
```

## Supported Mermaid Diagram Types

- Flowchart / Graph
- Sequence Diagram
- Class Diagram
- State Diagram
- Entity Relationship Diagram
- Gantt Chart
- Pie Chart
- Quadrant Chart
- Requirement Diagram
- User Journey
- Git Graph
- Mindmap
- Timeline
- Sankey Diagram
- XY Chart
- Block Diagram
- Architecture Diagram
- Kanban

## License

MIT

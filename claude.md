# Mermaid Viewer - Development Guidelines

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Language | TypeScript | ^5.7.0 |
| Bundler | esbuild | ^0.24.0 |
| Core Library | Mermaid.js | ^11.4.0 |
| Platform | Chrome Extension | Manifest v3 |
| Unit Testing | Vitest | latest |
| Integration Testing | Playwright | latest |

## Development Workflow

### TDD Process (Red → Green → Refactor)

1. **Discuss** - Present test cases for review before implementation
2. **Red** - Write failing tests, commit with `test:` prefix
3. **Green** - Write minimal code to pass tests, commit with `feat:` or `fix:`
4. **Refactor** - Improve code quality, commit with `refactor:`

### Test Case Review Format

Before writing tests, present cases in this format:

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Description | What goes in | What comes out |

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

<detailed changes as bullet points>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `test` - Adding or updating tests
- `refactor` - Code change without feature/fix
- `docs` - Documentation only
- `chore` - Build, CI, dependencies
- `style` - Formatting, no logic change

### Scopes

- `content` - Content script
- `popup` - Popup UI
- `storage` - Settings/storage
- `detector` - Mermaid detection
- `renderer` - Mermaid rendering
- `ui` - Toggle UI components
- `build` - Build configuration
- `test` - Test infrastructure

### Examples

```
test(detector): add unit tests for Mermaid syntax detection

- Add tests for flowchart keyword detection
- Add tests for sequenceDiagram detection
- Add tests for edge cases with whitespace
- Add negative tests for non-Mermaid code
```

```
feat(detector): implement Mermaid keyword detection

- Add MERMAID_KEYWORDS array covering 20+ diagram types
- Implement isMermaidCode() with trimmed input matching
- Implement findMermaidBlocks() with selector support
```

## Dependency Management

### Keeping package.json and package-lock.json in Sync

**IMPORTANT**: Always keep `package.json` and `package-lock.json` in sync.

When updating dependencies:

1. **After modifying `package.json`**, always run `npm install` to update `package-lock.json`
2. **Commit both files together** in the same commit
3. **CI uses `npm ci`** which requires `package-lock.json` to match `package.json` exactly

```bash
# Correct workflow when adding/updating dependencies
npm install <package>          # Automatically updates both files
git add package.json package-lock.json
git commit -m "chore(deps): add <package>"

# If manually editing package.json
vim package.json               # Edit the file
npm install                    # Sync package-lock.json
git add package.json package-lock.json
git commit -m "chore(deps): update dependencies"
```

**Why this matters**: `npm ci` (used in CI) fails if the lock file doesn't match `package.json`.

## Testing Strategy

### Unit Tests (Vitest)

Fast, isolated tests for pure functions:

- `src/content/detector.ts` → `tests/unit/detector.test.ts`
- `src/storage/settings.ts` → `tests/unit/settings.test.ts`
- `src/content/renderer.ts` → `tests/unit/renderer.test.ts`

### Integration Tests (Playwright)

Real browser tests with extension loaded:

- Render behavior verification
- Toggle UI interactions
- Popup settings functionality
- Uses static HTML fixtures in `tests/integration/fixtures/`

### Test Fixtures

- Create static HTML files with Mermaid code blocks
- Add new fixtures when render bugs are reported
- Fixtures location: `tests/integration/fixtures/`

### Running Tests

```bash
npm test              # Run all unit tests
npm run test:watch    # Unit tests in watch mode
npm run test:e2e      # Run integration tests (headed)
npm run test:e2e:ci   # Run integration tests (headless)
```

## Project Structure

```
mermaid-viewer/
├── src/
│   ├── content/           # Content script
│   ├── popup/             # Extension popup
│   ├── background/        # Service worker
│   └── storage/           # Chrome storage helpers
├── tests/
│   ├── unit/              # Vitest unit tests
│   ├── integration/       # Playwright tests
│   │   └── fixtures/      # Test HTML pages
│   └── setup/             # Test configuration
├── dist/                  # Build output
└── icons/                 # Extension icons
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Production build |
| `npm run watch` | Development mode with auto-rebuild |
| `npm test` | Run unit tests |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | Integration tests (headed) |
| `npm run test:e2e:ci` | Integration tests (headless for CI) |
| `npm run clean` | Remove build output |

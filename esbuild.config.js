const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isWatch = process.argv.includes('--watch');

// Ensure dist directories exist
const dirs = ['dist', 'dist/content', 'dist/popup', 'dist/background', 'dist/icons'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copy static files
function copyStaticFiles() {
  // Copy manifest.json
  fs.copyFileSync('manifest.json', 'dist/manifest.json');

  // Copy popup HTML
  if (fs.existsSync('src/popup/popup.html')) {
    fs.copyFileSync('src/popup/popup.html', 'dist/popup/popup.html');
  }

  // Copy icons (PNG files only, skip SVGs)
  if (fs.existsSync('icons')) {
    const icons = fs.readdirSync('icons').filter(f => f.endsWith('.png'));
    icons.forEach(icon => {
      fs.copyFileSync(`icons/${icon}`, `dist/icons/${icon}`);
    });
  }

  // Copy content styles
  if (fs.existsSync('src/content/styles.css')) {
    fs.copyFileSync('src/content/styles.css', 'dist/content/styles.css');
  }

  // Copy popup styles
  if (fs.existsSync('src/popup/popup.css')) {
    fs.copyFileSync('src/popup/popup.css', 'dist/popup/popup.css');
  }
}

// Build configuration for content script
const contentConfig = {
  entryPoints: ['src/content/index.ts'],
  bundle: true,
  outfile: 'dist/content/index.js',
  format: 'iife',
  target: ['chrome90'],
  sourcemap: isWatch ? 'inline' : false,
  minify: !isWatch,
};

// Build configuration for popup
const popupConfig = {
  entryPoints: ['src/popup/popup.ts'],
  bundle: true,
  outfile: 'dist/popup/popup.js',
  format: 'iife',
  target: ['chrome90'],
  sourcemap: isWatch ? 'inline' : false,
  minify: !isWatch,
};

// Build configuration for background service worker
const backgroundConfig = {
  entryPoints: ['src/background/service-worker.ts'],
  bundle: true,
  outfile: 'dist/background/service-worker.js',
  format: 'esm',
  target: ['chrome90'],
  sourcemap: isWatch ? 'inline' : false,
  minify: !isWatch,
};

async function build() {
  try {
    if (isWatch) {
      // Watch mode
      const contexts = await Promise.all([
        esbuild.context(contentConfig),
        esbuild.context(popupConfig),
        esbuild.context(backgroundConfig),
      ]);

      await Promise.all(contexts.map(ctx => ctx.watch()));

      // Initial copy of static files
      copyStaticFiles();

      // Watch for changes in static files
      console.log('Watching for changes...');

      // Keep process alive
      process.stdin.resume();
    } else {
      // Production build
      await Promise.all([
        esbuild.build(contentConfig),
        esbuild.build(popupConfig),
        esbuild.build(backgroundConfig),
      ]);

      copyStaticFiles();

      console.log('Build complete!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();

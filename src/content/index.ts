// Mermaid Viewer - Content Script Entry Point

import { findMermaidBlocks } from './detector';
import { initializeMermaid } from './renderer';
import { createMermaidWrapper, autoRender, cleanup } from './ui';
import {
  loadSettings,
  getCurrentDomain,
  getDomainConfig,
  type DomainConfig,
} from '../storage/settings';

/**
 * Main initialization function
 */
async function initialize(): Promise<void> {
  // Load settings
  const settings = await loadSettings();

  // Check if extension is globally enabled
  if (!settings.globalEnabled) {
    return;
  }

  // Get domain-specific config
  const domain = getCurrentDomain();
  const config = getDomainConfig(settings, domain);

  // Check if enabled for this domain
  if (!config.enabled) {
    return;
  }

  // Initialize Mermaid renderer
  initializeMermaid();

  // Process the page
  await processPage(config);

  // Set up mutation observer for dynamically loaded content
  observeDOM(config);
}

/**
 * Process all Mermaid code blocks on the page
 */
async function processPage(config: DomainConfig): Promise<void> {
  const mermaidBlocks = findMermaidBlocks(config.selector);

  for (const block of mermaidBlocks) {
    const container = createMermaidWrapper(block);

    if (container && config.autoRender) {
      await autoRender(container);
    }
  }
}

/**
 * Observe DOM for dynamically added content
 */
function observeDOM(config: DomainConfig): void {
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            // Check if the added node contains code blocks
            if (
              node.matches(config.selector) ||
              node.querySelector(config.selector)
            ) {
              shouldProcess = true;
              break;
            }
          }
        }
      }
      if (shouldProcess) break;
    }

    if (shouldProcess) {
      // Debounce processing
      setTimeout(() => processPage(config), 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Listen for messages from popup/background
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'REFRESH') {
    // Re-process the page with new settings
    cleanup();
    initialize().then(() => sendResponse({ success: true }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'GET_STATUS') {
    sendResponse({
      domain: getCurrentDomain(),
      processed: document.querySelectorAll('[data-mermaid-processed="true"]').length,
    });
    return false;
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

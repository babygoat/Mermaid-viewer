// Mermaid Viewer - Popup Script

import {
  loadSettings,
  saveSettings,
  getDomainConfig,
  saveDomainConfig,
  resetDomainConfig,
  setGlobalEnabled,
  DEFAULT_DOMAIN_CONFIG,
  type Settings,
  type DomainConfig,
} from '../storage/settings';

// DOM Elements
const globalToggle = document.getElementById('globalToggle') as HTMLInputElement;
const currentDomainEl = document.getElementById('currentDomain') as HTMLSpanElement;
const selectorInput = document.getElementById('selector') as HTMLInputElement;
const autoRenderCheckbox = document.getElementById('autoRender') as HTMLInputElement;
const domainEnabledCheckbox = document.getElementById('domainEnabled') as HTMLInputElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const processedCountEl = document.getElementById('processedCount') as HTMLSpanElement;

let currentDomain = '';
let currentSettings: Settings | null = null;

/**
 * Get the current tab's domain
 */
async function getCurrentTabDomain(): Promise<string> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs[0]?.url) {
        resolve('');
        return;
      }
      try {
        const url = new URL(tabs[0].url);
        resolve(url.hostname);
      } catch {
        resolve('');
      }
    });
  });
}

/**
 * Get status from content script
 */
async function getContentStatus(): Promise<{ domain: string; processed: number } | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs[0]?.id) {
        resolve(null);
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATUS' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  });
}

/**
 * Notify content script to refresh
 */
async function notifyContentScript(): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs[0]?.id) {
        resolve();
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { type: 'REFRESH' }, () => {
        resolve();
      });
    });
  });
}

/**
 * Show status message
 */
function showStatus(message: string, type: 'success' | 'error'): void {
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;

  setTimeout(() => {
    statusEl.className = 'status-message';
  }, 3000);
}

/**
 * Update UI with current settings
 */
function updateUI(settings: Settings, domainConfig: DomainConfig): void {
  globalToggle.checked = settings.globalEnabled;
  selectorInput.value = domainConfig.selector;
  autoRenderCheckbox.checked = domainConfig.autoRender;
  domainEnabledCheckbox.checked = domainConfig.enabled;
}

/**
 * Initialize popup
 */
async function initialize(): Promise<void> {
  // Get current domain
  currentDomain = await getCurrentTabDomain();
  currentDomainEl.textContent = currentDomain || 'N/A';

  // Load settings
  currentSettings = await loadSettings();
  const domainConfig = getDomainConfig(currentSettings, currentDomain);

  // Update UI
  updateUI(currentSettings, domainConfig);

  // Get processed count from content script
  const status = await getContentStatus();
  if (status) {
    processedCountEl.textContent = `${status.processed} diagram${status.processed !== 1 ? 's' : ''} found`;
  }
}

/**
 * Handle global toggle change
 */
globalToggle.addEventListener('change', async () => {
  await setGlobalEnabled(globalToggle.checked);
  await notifyContentScript();
  showStatus(globalToggle.checked ? 'Extension enabled' : 'Extension disabled', 'success');
});

/**
 * Handle save button click
 */
saveBtn.addEventListener('click', async () => {
  if (!currentDomain) {
    showStatus('Cannot save: no domain detected', 'error');
    return;
  }

  const config: DomainConfig = {
    selector: selectorInput.value.trim() || DEFAULT_DOMAIN_CONFIG.selector,
    autoRender: autoRenderCheckbox.checked,
    enabled: domainEnabledCheckbox.checked,
  };

  try {
    await saveDomainConfig(currentDomain, config);
    await notifyContentScript();
    showStatus('Settings saved for this domain', 'success');
  } catch (error) {
    showStatus('Failed to save settings', 'error');
  }
});

/**
 * Handle reset button click
 */
resetBtn.addEventListener('click', async () => {
  if (!currentDomain) {
    showStatus('Cannot reset: no domain detected', 'error');
    return;
  }

  try {
    await resetDomainConfig(currentDomain);
    currentSettings = await loadSettings();
    const domainConfig = getDomainConfig(currentSettings, currentDomain);
    updateUI(currentSettings, domainConfig);
    await notifyContentScript();
    showStatus('Reset to default settings', 'success');
  } catch (error) {
    showStatus('Failed to reset settings', 'error');
  }
});

// Initialize on load
initialize();

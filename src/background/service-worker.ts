// Mermaid Viewer - Background Service Worker

import { DEFAULT_SETTINGS, saveSettings, loadSettings } from '../storage/settings';

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings
    await saveSettings(DEFAULT_SETTINGS);
    console.log('Mermaid Viewer: Default settings initialized');
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    loadSettings().then((settings) => {
      sendResponse({ settings });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'NOTIFY_CONTENT_SCRIPT') {
    // Send refresh message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'REFRESH' }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: 'No active tab' });
      }
    });
    return true;
  }

  return false;
});

// Handle extension icon click if no popup
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    // Toggle extension for current tab
    const settings = await loadSettings();
    settings.globalEnabled = !settings.globalEnabled;
    await saveSettings(settings);

    // Notify content script
    chrome.tabs.sendMessage(tab.id, { type: 'REFRESH' });
  }
});

// Domain-specific settings for Mermaid Viewer

export interface DomainConfig {
  selector: string;
  autoRender: boolean;
  enabled: boolean;
}

export interface Settings {
  domains: Record<string, DomainConfig>;
  globalEnabled: boolean;
}

export const DEFAULT_SELECTOR = 'pre > code';

export const DEFAULT_DOMAIN_CONFIG: DomainConfig = {
  selector: DEFAULT_SELECTOR,
  autoRender: true,
  enabled: true,
};

export const DEFAULT_SETTINGS: Settings = {
  domains: {
    _default: { ...DEFAULT_DOMAIN_CONFIG },
  },
  globalEnabled: true,
};

/**
 * Get the current domain from the URL
 */
export function getCurrentDomain(): string {
  return window.location.hostname;
}

/**
 * Load settings from Chrome storage
 */
export async function loadSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        resolve(result.settings as Settings);
      } else {
        resolve({ ...DEFAULT_SETTINGS });
      }
    });
  });
}

/**
 * Save settings to Chrome storage
 */
export async function saveSettings(settings: Settings): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ settings }, () => {
      resolve();
    });
  });
}

/**
 * Get configuration for a specific domain (falls back to _default)
 */
export function getDomainConfig(settings: Settings, domain: string): DomainConfig {
  return settings.domains[domain] || settings.domains._default || DEFAULT_DOMAIN_CONFIG;
}

/**
 * Save configuration for a specific domain
 */
export async function saveDomainConfig(domain: string, config: DomainConfig): Promise<void> {
  const settings = await loadSettings();
  settings.domains[domain] = config;
  await saveSettings(settings);
}

/**
 * Reset domain to use default settings
 */
export async function resetDomainConfig(domain: string): Promise<void> {
  const settings = await loadSettings();
  delete settings.domains[domain];
  await saveSettings(settings);
}

/**
 * Toggle global extension enabled state
 */
export async function setGlobalEnabled(enabled: boolean): Promise<void> {
  const settings = await loadSettings();
  settings.globalEnabled = enabled;
  await saveSettings(settings);
}

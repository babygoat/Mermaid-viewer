import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCurrentDomain,
  loadSettings,
  saveSettings,
  getDomainConfig,
  saveDomainConfig,
  resetDomainConfig,
  setGlobalEnabled,
  DEFAULT_SETTINGS,
  DEFAULT_DOMAIN_CONFIG,
  type Settings,
  type DomainConfig,
} from '../../src/storage/settings';

describe('settings', () => {
  describe('getCurrentDomain', () => {
    describe('given window.location.hostname is "github.com"', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'location', {
          value: { hostname: 'github.com' },
          writable: true,
        });
      });

      it('when getCurrentDomain() is called, then returns "github.com"', () => {
        expect(getCurrentDomain()).toBe('github.com');
      });
    });

    describe('given window.location.hostname is "docs.github.com"', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'location', {
          value: { hostname: 'docs.github.com' },
          writable: true,
        });
      });

      it('when getCurrentDomain() is called, then returns "docs.github.com"', () => {
        expect(getCurrentDomain()).toBe('docs.github.com');
      });
    });
  });

  describe('loadSettings', () => {
    describe('given Chrome storage has custom settings', () => {
      const customSettings: Settings = {
        globalEnabled: false,
        domains: {
          _default: DEFAULT_DOMAIN_CONFIG,
          'github.com': { selector: '.highlight > pre', autoRender: false, enabled: true },
        },
      };

      beforeEach(() => {
        vi.mocked(chrome.storage.sync.get).mockImplementation((_keys, callback) => {
          callback({ settings: customSettings });
        });
      });

      it('when loadSettings() is called, then returns stored settings object', async () => {
        const settings = await loadSettings();
        expect(settings).toEqual(customSettings);
      });
    });

    describe('given Chrome storage is empty', () => {
      beforeEach(() => {
        vi.mocked(chrome.storage.sync.get).mockImplementation((_keys, callback) => {
          callback({});
        });
      });

      it('when loadSettings() is called, then returns DEFAULT_SETTINGS', async () => {
        const settings = await loadSettings();
        expect(settings).toEqual(DEFAULT_SETTINGS);
      });
    });
  });

  describe('saveSettings', () => {
    describe('given a settings object to save', () => {
      const settingsToSave: Settings = {
        globalEnabled: true,
        domains: { _default: DEFAULT_DOMAIN_CONFIG },
      };

      beforeEach(() => {
        vi.mocked(chrome.storage.sync.set).mockImplementation((_items, callback) => {
          callback?.();
        });
      });

      it('when saveSettings() is called, then chrome.storage.sync.set is called with settings', async () => {
        await saveSettings(settingsToSave);
        expect(chrome.storage.sync.set).toHaveBeenCalledWith(
          { settings: settingsToSave },
          expect.any(Function)
        );
      });

      it('when saveSettings() is called, then promise resolves successfully', async () => {
        await expect(saveSettings(settingsToSave)).resolves.toBeUndefined();
      });
    });
  });

  describe('getDomainConfig', () => {
    describe('given settings with github.com config', () => {
      const githubConfig: DomainConfig = {
        selector: '.highlight > pre',
        autoRender: false,
        enabled: true,
      };
      const settings: Settings = {
        globalEnabled: true,
        domains: {
          _default: DEFAULT_DOMAIN_CONFIG,
          'github.com': githubConfig,
        },
      };

      it('when getDomainConfig() is called with "github.com", then returns github.com specific config', () => {
        expect(getDomainConfig(settings, 'github.com')).toEqual(githubConfig);
      });
    });

    describe('given settings without unknown.com but has _default', () => {
      const settings: Settings = {
        globalEnabled: true,
        domains: {
          _default: DEFAULT_DOMAIN_CONFIG,
        },
      };

      it('when getDomainConfig() is called with "unknown.com", then returns _default config', () => {
        expect(getDomainConfig(settings, 'unknown.com')).toEqual(DEFAULT_DOMAIN_CONFIG);
      });
    });

    describe('given settings with no _default and no domain', () => {
      const settings: Settings = {
        globalEnabled: true,
        domains: {},
      };

      it('when getDomainConfig() is called with "unknown.com", then returns DEFAULT_DOMAIN_CONFIG', () => {
        expect(getDomainConfig(settings, 'unknown.com')).toEqual(DEFAULT_DOMAIN_CONFIG);
      });
    });
  });

  describe('saveDomainConfig', () => {
    const newConfig: DomainConfig = {
      selector: '.custom-code',
      autoRender: true,
      enabled: true,
    };

    describe('given empty settings (no github.com)', () => {
      beforeEach(() => {
        vi.mocked(chrome.storage.sync.get).mockImplementation((_keys, callback) => {
          callback({ settings: { ...DEFAULT_SETTINGS } });
        });
        vi.mocked(chrome.storage.sync.set).mockImplementation((_items, callback) => {
          callback?.();
        });
      });

      it('when saveDomainConfig() is called, then settings saved with new github.com config', async () => {
        await saveDomainConfig('github.com', newConfig);

        expect(chrome.storage.sync.set).toHaveBeenCalledWith(
          {
            settings: expect.objectContaining({
              domains: expect.objectContaining({
                'github.com': newConfig,
              }),
            }),
          },
          expect.any(Function)
        );
      });
    });

    describe('given settings already has github.com', () => {
      const existingConfig: DomainConfig = {
        selector: 'pre > code',
        autoRender: false,
        enabled: false,
      };

      beforeEach(() => {
        vi.mocked(chrome.storage.sync.get).mockImplementation((_keys, callback) => {
          callback({
            settings: {
              globalEnabled: true,
              domains: {
                _default: DEFAULT_DOMAIN_CONFIG,
                'github.com': existingConfig,
              },
            },
          });
        });
        vi.mocked(chrome.storage.sync.set).mockImplementation((_items, callback) => {
          callback?.();
        });
      });

      it('when saveDomainConfig() is called, then settings saved with updated config', async () => {
        await saveDomainConfig('github.com', newConfig);

        expect(chrome.storage.sync.set).toHaveBeenCalledWith(
          {
            settings: expect.objectContaining({
              domains: expect.objectContaining({
                'github.com': newConfig,
              }),
            }),
          },
          expect.any(Function)
        );
      });
    });
  });

  describe('resetDomainConfig', () => {
    describe('given settings with github.com config', () => {
      beforeEach(() => {
        vi.mocked(chrome.storage.sync.get).mockImplementation((_keys, callback) => {
          callback({
            settings: {
              globalEnabled: true,
              domains: {
                _default: DEFAULT_DOMAIN_CONFIG,
                'github.com': { selector: '.custom', autoRender: true, enabled: true },
              },
            },
          });
        });
        vi.mocked(chrome.storage.sync.set).mockImplementation((_items, callback) => {
          callback?.();
        });
      });

      it('when resetDomainConfig() is called, then github.com is removed from domains', async () => {
        await resetDomainConfig('github.com');

        expect(chrome.storage.sync.set).toHaveBeenCalledWith(
          {
            settings: expect.objectContaining({
              domains: expect.not.objectContaining({
                'github.com': expect.anything(),
              }),
            }),
          },
          expect.any(Function)
        );
      });
    });

    describe('given settings without the domain', () => {
      beforeEach(() => {
        vi.mocked(chrome.storage.sync.get).mockImplementation((_keys, callback) => {
          callback({ settings: { ...DEFAULT_SETTINGS } });
        });
        vi.mocked(chrome.storage.sync.set).mockImplementation((_items, callback) => {
          callback?.();
        });
      });

      it('when resetDomainConfig() is called, then resolves without error', async () => {
        await expect(resetDomainConfig('unknown.com')).resolves.toBeUndefined();
      });
    });
  });

  describe('setGlobalEnabled', () => {
    describe('given settings with globalEnabled: false', () => {
      beforeEach(() => {
        vi.mocked(chrome.storage.sync.get).mockImplementation((_keys, callback) => {
          callback({
            settings: { ...DEFAULT_SETTINGS, globalEnabled: false },
          });
        });
        vi.mocked(chrome.storage.sync.set).mockImplementation((_items, callback) => {
          callback?.();
        });
      });

      it('when setGlobalEnabled(true) is called, then settings saved with globalEnabled: true', async () => {
        await setGlobalEnabled(true);

        expect(chrome.storage.sync.set).toHaveBeenCalledWith(
          {
            settings: expect.objectContaining({
              globalEnabled: true,
            }),
          },
          expect.any(Function)
        );
      });
    });

    describe('given settings with globalEnabled: true', () => {
      beforeEach(() => {
        vi.mocked(chrome.storage.sync.get).mockImplementation((_keys, callback) => {
          callback({
            settings: { ...DEFAULT_SETTINGS, globalEnabled: true },
          });
        });
        vi.mocked(chrome.storage.sync.set).mockImplementation((_items, callback) => {
          callback?.();
        });
      });

      it('when setGlobalEnabled(false) is called, then settings saved with globalEnabled: false', async () => {
        await setGlobalEnabled(false);

        expect(chrome.storage.sync.set).toHaveBeenCalledWith(
          {
            settings: expect.objectContaining({
              globalEnabled: false,
            }),
          },
          expect.any(Function)
        );
      });
    });
  });
});

// Mock Chrome Extension APIs for unit testing

export const createChromeMock = () => {
  const storage: Record<string, unknown> = {};

  return {
    storage: {
      sync: {
        get: vi.fn((keys: string[], callback: (result: Record<string, unknown>) => void) => {
          const result: Record<string, unknown> = {};
          keys.forEach((key) => {
            if (storage[key] !== undefined) {
              result[key] = storage[key];
            }
          });
          callback(result);
        }),
        set: vi.fn((items: Record<string, unknown>, callback?: () => void) => {
          Object.assign(storage, items);
          callback?.();
        }),
      },
    },
    runtime: {
      onMessage: {
        addListener: vi.fn(),
      },
      onInstalled: {
        addListener: vi.fn(),
      },
      lastError: null,
    },
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(),
    },
    action: {
      onClicked: {
        addListener: vi.fn(),
      },
    },
  };
};

// Install mock globally before tests
export const installChromeMock = () => {
  const chromeMock = createChromeMock();
  vi.stubGlobal('chrome', chromeMock);
  return chromeMock;
};

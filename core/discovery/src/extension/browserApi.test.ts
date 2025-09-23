/**
 * Tests for browser API abstraction layer.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getBrowserAPI, isExtensionEnvironment, getExtensionId, type MessageSender } from './browserApi.js';

describe('Browser API Abstraction', () => {
  let originalWindow: Window & typeof globalThis;
  let originalChrome: unknown;

  beforeEach(() => {
    vi.useFakeTimers();
    originalWindow = global.window as Window & typeof globalThis;
    originalChrome = (global as unknown as { chrome?: unknown }).chrome;

    // Clean up any existing browser/chrome globals
    delete (global as unknown as { browser?: unknown }).browser;
    delete (global as unknown as { chrome?: unknown }).chrome;
    delete (global.window as unknown as { browser?: unknown }).browser;
    delete (global.window as unknown as { chrome?: unknown }).chrome;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();

    // Restore original globals
    if (originalChrome !== undefined) {
      (global as unknown as { chrome: unknown }).chrome = originalChrome;
    }
    if (originalWindow) {
      global.window = originalWindow;
    }
  });

  describe('getBrowserAPI', () => {
    describe('Firefox/Browser namespace detection', () => {
      it('should detect and use browser.* namespace when available', () => {
        // Set up Firefox-style browser API
        global.window = {
          browser: {
            runtime: {
              id: 'firefox-extension-id',
              sendMessage: vi.fn().mockResolvedValue({ success: true }),
              onMessage: {
                addListener: vi.fn(),
                removeListener: vi.fn(),
              },
            },
            tabs: {
              sendMessage: vi.fn().mockResolvedValue({ success: true }),
              query: vi.fn().mockResolvedValue([]),
              get: vi.fn().mockResolvedValue({ id: 1 }),
            },
          },
        } as unknown as Window & typeof globalThis;

        const api = getBrowserAPI();

        expect(api.isAvailable).toBe(true);
        expect(api.apiType).toBe('browser');
        expect(api.runtime.id).toBe('firefox-extension-id');
      });

      it('should handle browser.* API calls as Promises', async () => {
        const mockSendMessage = vi.fn().mockResolvedValue({ data: 'response' });

        global.window = {
          browser: {
            runtime: {
              id: 'firefox-extension-id',
              sendMessage: mockSendMessage,
              onMessage: {
                addListener: vi.fn(),
                removeListener: vi.fn(),
              },
            },
          },
        } as unknown as Window & typeof globalThis;

        const api = getBrowserAPI();
        const result = await api.runtime.sendMessage({ type: 'test' });

        expect(mockSendMessage).toHaveBeenCalledWith({ type: 'test' });
        expect(result).toEqual({ data: 'response' });
      });
    });

    describe('Chrome namespace detection', () => {
      it('should detect and use chrome.* namespace when browser.* is not available', () => {
        // Set up Chrome-style API
        (global as unknown as { chrome: unknown }).chrome = {
          runtime: {
            id: 'chrome-extension-id',
            sendMessage: vi.fn((_message, callback) => {
              callback?.({ success: true });
            }),
            onMessage: {
              addListener: vi.fn(),
              removeListener: vi.fn(),
            },
          },
          tabs: {
            sendMessage: vi.fn((_tabId, _message, callback) => {
              callback?.({ success: true });
            }),
            query: vi.fn((_queryInfo, callback) => {
              callback?.([]);
            }),
            get: vi.fn((tabId, callback) => {
              callback?.({ id: tabId });
            }),
          },
        };

        const api = getBrowserAPI();

        expect(api.isAvailable).toBe(true);
        expect(api.apiType).toBe('chrome');
        expect(api.runtime.id).toBe('chrome-extension-id');
      });

      it('should convert Chrome callback API to Promises', async () => {
        const mockSendMessage = vi.fn((_message, callback) => {
          setTimeout(() => callback({ data: 'response' }), 10);
        });

        (global as unknown as { chrome: unknown }).chrome = {
          runtime: {
            id: 'chrome-extension-id',
            sendMessage: mockSendMessage,
            onMessage: {
              addListener: vi.fn(),
              removeListener: vi.fn(),
            },
          },
        };

        const api = getBrowserAPI();
        const resultPromise = api.runtime.sendMessage({ type: 'test' });

        await vi.advanceTimersByTimeAsync(10);
        const result = await resultPromise;

        expect(mockSendMessage).toHaveBeenCalledWith({ type: 'test' }, expect.any(Function));
        expect(result).toEqual({ data: 'response' });
      });

      it('should handle Chrome runtime errors in Promises', async () => {
        const mockSendMessage = vi.fn((_message, callback) => {
          // Simulate Chrome runtime error
          (global as unknown as { chrome: { runtime: { lastError?: { message: string } } } }).chrome = {
            runtime: {
              lastError: { message: 'Extension context invalidated' },
            },
          };
          callback(undefined);
        });

        (global as unknown as { chrome: unknown }).chrome = {
          runtime: {
            id: 'chrome-extension-id',
            sendMessage: mockSendMessage,
            lastError: undefined,
            onMessage: {
              addListener: vi.fn(),
              removeListener: vi.fn(),
            },
          },
        };

        const api = getBrowserAPI();
        const result = await api.runtime.sendMessage({ type: 'test' });

        // Should handle the error gracefully and return undefined
        expect(result).toBeUndefined();
      });
    });

    describe('Preference order', () => {
      it('should prefer browser.* over chrome.* when both are available', () => {
        // Set up both APIs
        global.window = {
          browser: {
            runtime: {
              id: 'firefox-extension-id',
              sendMessage: vi.fn().mockResolvedValue({ success: true }),
              onMessage: {
                addListener: vi.fn(),
                removeListener: vi.fn(),
              },
            },
          },
        } as unknown as Window & typeof globalThis;

        (global as unknown as { chrome: unknown }).chrome = {
          runtime: {
            id: 'chrome-extension-id',
            sendMessage: vi.fn(),
            onMessage: {
              addListener: vi.fn(),
              removeListener: vi.fn(),
            },
          },
        };

        const api = getBrowserAPI();

        expect(api.isAvailable).toBe(true);
        expect(api.apiType).toBe('browser');
        expect(api.runtime.id).toBe('firefox-extension-id'); // Should use Firefox ID
      });
    });

    describe('Non-extension environment', () => {
      it('should return stub API when no extension API is available', () => {
        // No browser or chrome globals
        const api = getBrowserAPI();

        expect(api.isAvailable).toBe(false);
        expect(api.apiType).toBe('none');
        expect(api.runtime.id).toBe('non-extension-environment');
        expect(api.tabs).toBeUndefined();
      });

      it('should provide non-functional stub methods', async () => {
        const api = getBrowserAPI();

        const result = await api.runtime.sendMessage({ type: 'test' });
        expect(result).toBeUndefined();

        // Should not throw
        const listener = (
          _message: unknown,
          _sender: MessageSender,
          _sendResponse: (response?: unknown) => void,
        ) => {
          return undefined;
        };
        api.runtime.onMessage.addListener(listener);
        api.runtime.onMessage.removeListener(listener);
      });
    });

    describe('Tabs API', () => {
      it('should provide tabs API for Firefox', async () => {
        const mockSendMessage = vi.fn().mockResolvedValue({ success: true });
        const mockQuery = vi.fn().mockResolvedValue([{ id: 1, url: 'https://example.com' }]);
        const mockGet = vi.fn().mockResolvedValue({ id: 1, url: 'https://example.com' });

        global.window = {
          browser: {
            runtime: {
              id: 'firefox-extension-id',
              sendMessage: vi.fn(),
              onMessage: {
                addListener: vi.fn(),
                removeListener: vi.fn(),
              },
            },
            tabs: {
              sendMessage: mockSendMessage,
              query: mockQuery,
              get: mockGet,
            },
          },
        } as unknown as Window & typeof globalThis;

        const api = getBrowserAPI();

        expect(api.tabs).toBeDefined();

        // Test tabs.sendMessage
        await api.tabs?.sendMessage(1, { type: 'test' });
        expect(mockSendMessage).toHaveBeenCalledWith(1, { type: 'test' });

        // Test tabs.query
        const tabs = await api.tabs?.query({ active: true });
        expect(mockQuery).toHaveBeenCalledWith({ active: true });
        expect(tabs).toEqual([{ id: 1, url: 'https://example.com' }]);

        // Test tabs.get
        const tab = await api.tabs?.get(1);
        expect(mockGet).toHaveBeenCalledWith(1);
        expect(tab).toEqual({ id: 1, url: 'https://example.com' });
      });

      it('should provide tabs API for Chrome', async () => {
        const mockSendMessage = vi.fn((_tabId, _message, callback) => {
          callback({ success: true });
        });
        const mockQuery = vi.fn((_queryInfo, callback) => {
          callback([{ id: 1, url: 'https://example.com' }]);
        });
        const mockGet = vi.fn((tabId, callback) => {
          callback({ id: tabId, url: 'https://example.com' });
        });

        (global as unknown as { chrome: unknown }).chrome = {
          runtime: {
            id: 'chrome-extension-id',
            sendMessage: vi.fn(),
            onMessage: {
              addListener: vi.fn(),
              removeListener: vi.fn(),
            },
          },
          tabs: {
            sendMessage: mockSendMessage,
            query: mockQuery,
            get: mockGet,
          },
        };

        const api = getBrowserAPI();

        expect(api.tabs).toBeDefined();

        // Test tabs.sendMessage
        await api.tabs?.sendMessage(1, { type: 'test' });
        expect(mockSendMessage).toHaveBeenCalledWith(1, { type: 'test' }, expect.any(Function));

        // Test tabs.query
        const tabs = await api.tabs?.query({ active: true });
        expect(mockQuery).toHaveBeenCalledWith({ active: true }, expect.any(Function));
        expect(tabs).toEqual([{ id: 1, url: 'https://example.com' }]);

        // Test tabs.get
        const tab = await api.tabs?.get(1);
        expect(mockGet).toHaveBeenCalledWith(1, expect.any(Function));
        expect(tab).toEqual({ id: 1, url: 'https://example.com' });
      });

      it('should handle missing tabs API gracefully', () => {
        global.window = {
          browser: {
            runtime: {
              id: 'firefox-extension-id',
              sendMessage: vi.fn(),
              onMessage: {
                addListener: vi.fn(),
                removeListener: vi.fn(),
              },
            },
            // No tabs API
          },
        } as unknown as Window & typeof globalThis;

        const api = getBrowserAPI();

        expect(api.isAvailable).toBe(true);
        expect(api.tabs).toBeUndefined();
      });
    });

    describe('Message listeners', () => {
      it('should handle message listeners for Firefox', () => {
        const mockAddListener = vi.fn();
        const mockRemoveListener = vi.fn();

        global.window = {
          browser: {
            runtime: {
              id: 'firefox-extension-id',
              sendMessage: vi.fn(),
              onMessage: {
                addListener: mockAddListener,
                removeListener: mockRemoveListener,
              },
            },
          },
        } as unknown as Window & typeof globalThis;

        const api = getBrowserAPI();
        const listener = (
          _message: unknown,
          _sender: MessageSender,
          _sendResponse: (response?: unknown) => void,
        ) => {
          return undefined;
        };

        api.runtime.onMessage.addListener(listener);
        expect(mockAddListener).toHaveBeenCalled();

        api.runtime.onMessage.removeListener(listener);
        expect(mockRemoveListener).toHaveBeenCalled();
      });

      it('should handle message listeners for Chrome', () => {
        const mockAddListener = vi.fn();
        const mockRemoveListener = vi.fn();

        (global as unknown as { chrome: unknown }).chrome = {
          runtime: {
            id: 'chrome-extension-id',
            sendMessage: vi.fn(),
            onMessage: {
              addListener: mockAddListener,
              removeListener: mockRemoveListener,
            },
          },
        };

        const api = getBrowserAPI();
        const listener = (
          _message: unknown,
          _sender: MessageSender,
          _sendResponse: (response?: unknown) => void,
        ) => {
          return undefined;
        };

        api.runtime.onMessage.addListener(listener);
        expect(mockAddListener).toHaveBeenCalled();

        api.runtime.onMessage.removeListener(listener);
        expect(mockRemoveListener).toHaveBeenCalled();
      });
    });
  });

  describe('isExtensionEnvironment', () => {
    it('should return true when in Firefox extension environment', () => {
      global.window = {
        browser: {
          runtime: {
            id: 'firefox-extension-id',
            sendMessage: vi.fn(),
            onMessage: {
              addListener: vi.fn(),
              removeListener: vi.fn(),
            },
          },
        },
      } as unknown as Window & typeof globalThis;

      expect(isExtensionEnvironment()).toBe(true);
    });

    it('should return true when in Chrome extension environment', () => {
      (global as unknown as { chrome: unknown }).chrome = {
        runtime: {
          id: 'chrome-extension-id',
          sendMessage: vi.fn(),
          onMessage: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
          },
        },
      };

      expect(isExtensionEnvironment()).toBe(true);
    });

    it('should return false when not in extension environment', () => {
      expect(isExtensionEnvironment()).toBe(false);
    });
  });

  describe('getExtensionId', () => {
    it('should return Firefox extension ID when available', () => {
      global.window = {
        browser: {
          runtime: {
            id: 'firefox-extension-id',
            sendMessage: vi.fn(),
            onMessage: {
              addListener: vi.fn(),
              removeListener: vi.fn(),
            },
          },
        },
      } as unknown as Window & typeof globalThis;

      expect(getExtensionId()).toBe('firefox-extension-id');
    });

    it('should return Chrome extension ID when available', () => {
      (global as unknown as { chrome: unknown }).chrome = {
        runtime: {
          id: 'chrome-extension-id',
          sendMessage: vi.fn(),
          onMessage: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
          },
        },
      };

      expect(getExtensionId()).toBe('chrome-extension-id');
    });

    it('should return null when not in extension environment', () => {
      expect(getExtensionId()).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle common Chrome extension errors gracefully', async () => {
      const errors = [
        'Extension context invalidated',
        'The message port closed before a response was received',
        'Cannot access a chrome://',
      ];

      for (const errorMessage of errors) {
        const mockSendMessage = vi.fn((_message, callback) => {
          (global as unknown as { chrome: { runtime: { lastError?: { message: string } } } }).chrome = {
            runtime: {
              lastError: { message: errorMessage },
            },
          };
          callback(undefined);
        });

        (global as unknown as { chrome: unknown }).chrome = {
          runtime: {
            id: 'chrome-extension-id',
            sendMessage: mockSendMessage,
            lastError: undefined,
            onMessage: {
              addListener: vi.fn(),
              removeListener: vi.fn(),
            },
          },
        };

        const api = getBrowserAPI();
        const result = await api.runtime.sendMessage({ type: 'test' });

        // Should return undefined without throwing
        expect(result).toBeUndefined();
      }
    });

    it('should handle tab connection errors gracefully', async () => {
      const mockSendMessage = vi.fn((_tabId, _message, callback) => {
        (global as unknown as { chrome: { runtime: { lastError?: { message: string } } } }).chrome = {
          runtime: {
            lastError: { message: 'Could not establish connection' },
          },
        };
        callback(undefined);
      });

      (global as unknown as { chrome: unknown }).chrome = {
        runtime: {
          id: 'chrome-extension-id',
          sendMessage: vi.fn(),
          onMessage: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
          },
        },
        tabs: {
          sendMessage: mockSendMessage,
        },
      };

      const api = getBrowserAPI();
      const result = await api.tabs?.sendMessage(1, { type: 'test' });

      // Should return undefined without throwing
      expect(result).toBeUndefined();
    });
  });
});

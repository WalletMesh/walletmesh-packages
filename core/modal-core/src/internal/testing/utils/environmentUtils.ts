/**
 * Environment testing utilities for modal-core testing
 *
 * Provides utilities for setting up and tearing down test environments,
 * mocking browser APIs, managing global state, and ensuring clean test
 * isolation between test runs.
 *
 * @packageDocumentation
 * @internal
 */

import { afterEach, beforeEach, vi } from 'vitest';

/**
 * Configuration for environment setup
 * @interface EnvironmentConfig
 */
export interface EnvironmentConfig {
  /** Whether to mock DOM APIs */
  mockDOM?: boolean;
  /** Whether to mock browser storage APIs */
  mockStorage?: boolean;
  /** Whether to mock network APIs */
  mockNetwork?: boolean;
  /** Whether to mock wallet APIs */
  mockWallet?: boolean;
  /** Custom environment variables */
  env?: Record<string, string>;
  /** Whether to restore original values on cleanup */
  autoRestore?: boolean;
}

/**
 * Stored original values for restoration
 * @interface OriginalValues
 */
interface OriginalValues {
  window?: typeof globalThis.window;
  document?: typeof globalThis.document;
  localStorage?: typeof globalThis.localStorage;
  sessionStorage?: typeof globalThis.sessionStorage;
  fetch?: typeof globalThis.fetch;
  WebSocket?: typeof globalThis.WebSocket;
  env?: NodeJS.ProcessEnv;
  [key: string]: unknown;
}

let originalValues: OriginalValues = {};

/**
 * DOM mocking utilities
 */
export const domUtils = {
  /**
   * Sets up comprehensive DOM mocks
   *
   * @param config - DOM configuration options
   * @returns Cleanup function
   *
   * @example
   * ```typescript
   * beforeEach(() => {
   *   domUtils.setupDOM({
   *     includeCustomElements: true,
   *     mockIntersectionObserver: true
   *   });
   * });
   * ```
   */
  setupDOM: (
    config: {
      includeCustomElements?: boolean;
      mockIntersectionObserver?: boolean;
      mockResizeObserver?: boolean;
      mockGetBoundingClientRect?: boolean;
    } = {},
  ) => {
    const {
      includeCustomElements = false,
      mockIntersectionObserver = false,
      mockResizeObserver = false,
      mockGetBoundingClientRect = false,
    } = config;

    // Store original values
    originalValues.window = globalThis.window;
    originalValues.document = globalThis.document;

    // Mock window object
    const mockWindow = {
      location: {
        href: 'https://example.com',
        origin: 'https://example.com',
        protocol: 'https:',
        host: 'example.com',
        pathname: '/',
        search: '',
        hash: '',
      },

      navigator: {
        userAgent: 'Mozilla/5.0 (Test Environment)',
        language: 'en-US',
        onLine: true,
      },

      screen: {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
      },

      innerWidth: 1920,
      innerHeight: 1080,

      // Event methods
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),

      // Frame methods
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        setTimeout(callback, 16); // ~60fps
        return 1;
      }),
      cancelAnimationFrame: vi.fn(),

      // Timer methods (delegate to global)
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
      setInterval: globalThis.setInterval,
      clearInterval: globalThis.clearInterval,

      // Storage
      localStorage: domUtils.createStorageMock(),
      sessionStorage: domUtils.createStorageMock(),

      // Custom properties for wallet testing
      ethereum: undefined, // Can be set by wallet mocks
      solana: undefined, // Can be set by wallet mocks

      // Postmessage for iframe communication
      postMessage: vi.fn(),
      parent: null,
      top: null,

      // Console
      console: globalThis.console,

      // Close method for popup windows
      close: vi.fn(),
      closed: false,
      opener: null,
    };

    // Mock document object
    type MockElement = {
      tagName: string;
      id: string;
      className: string;
      style: Record<string, unknown>;
      attributes: Map<string, string>;
      children: MockElement[];
      parentNode: MockElement | null;
      setAttribute: ReturnType<typeof vi.fn>;
      getAttribute: ReturnType<typeof vi.fn>;
      removeAttribute: ReturnType<typeof vi.fn>;
      hasAttribute: ReturnType<typeof vi.fn>;
      appendChild: ReturnType<typeof vi.fn>;
      removeChild: ReturnType<typeof vi.fn>;
      addEventListener: ReturnType<typeof vi.fn>;
      removeEventListener: ReturnType<typeof vi.fn>;
      dispatchEvent: ReturnType<typeof vi.fn>;
      querySelector: ReturnType<typeof vi.fn>;
      querySelectorAll: ReturnType<typeof vi.fn>;
      remove: ReturnType<typeof vi.fn>;
      getBoundingClientRect: ReturnType<typeof vi.fn>;
      focus: ReturnType<typeof vi.fn>;
      blur: ReturnType<typeof vi.fn>;
      submit: ReturnType<typeof vi.fn>;
      reset: ReturnType<typeof vi.fn>;
      innerHTML?: string;
      textContent?: string;
      value?: string;
    };

    const mockDocument = {
      createElement: vi.fn((tagName: string): MockElement => {
        const element: MockElement = {
          tagName: tagName.toUpperCase(),
          id: '',
          className: '',
          style: {},
          attributes: new Map(),
          children: [],
          parentNode: null,

          // Attribute methods
          setAttribute: vi.fn((name: string, value: string) => {
            element.attributes.set(name, value);
          }),
          getAttribute: vi.fn((name: string) => element.attributes.get(name) || null),
          removeAttribute: vi.fn((name: string) => element.attributes.delete(name)),
          hasAttribute: vi.fn((name: string) => element.attributes.has(name)),

          // DOM manipulation
          appendChild: vi.fn((child: MockElement) => {
            element.children.push(child);
            return child;
          }),
          removeChild: vi.fn((child: MockElement) => {
            const index = element.children.indexOf(child);
            if (index > -1) element.children.splice(index, 1);
            return child;
          }),

          // Event methods
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),

          // Query methods
          querySelector: vi.fn(() => null),
          querySelectorAll: vi.fn(() => []),

          // Size methods
          getBoundingClientRect: vi.fn(() => ({
            width: 100,
            height: 100,
            top: 0,
            left: 0,
            bottom: 100,
            right: 100,
            x: 0,
            y: 0,
          })),

          // Content
          innerHTML: '',
          textContent: '',
          value: '',

          // Lifecycle
          remove: vi.fn(),

          // Focus
          focus: vi.fn(),
          blur: vi.fn(),

          // Form elements
          submit: vi.fn(),
          reset: vi.fn(),
        };

        if (mockGetBoundingClientRect) {
          element.getBoundingClientRect = vi.fn(() => ({
            width: 100,
            height: 100,
            top: 0,
            left: 0,
            bottom: 100,
            right: 100,
            x: 0,
            y: 0,
          }));
        }

        return element;
      }),

      createTextNode: vi.fn((text: string) => ({ textContent: text })),

      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn(() => []),
      getElementById: vi.fn(() => null),
      getElementsByTagName: vi.fn(() => []),
      getElementsByClassName: vi.fn(() => []),

      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(() => null),
        style: {},
      },

      head: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },

      documentElement: {
        style: {},
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn(() => false),
          toggle: vi.fn(),
        },
      },

      // Document state
      readyState: 'complete',

      // Events
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    // Apply mocks
    const windowObj: unknown = mockWindow;
    const documentObj: unknown = mockDocument;
    globalThis.window = windowObj as Window & typeof globalThis;
    globalThis.document = documentObj as Document;

    // Optional API mocks
    if (mockIntersectionObserver) {
      globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })) as typeof IntersectionObserver;
    }

    if (mockResizeObserver) {
      globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })) as typeof ResizeObserver;
    }

    if (includeCustomElements) {
      const mockCustomElements: unknown = {
        define: vi.fn(),
        get: vi.fn(),
        whenDefined: vi.fn().mockResolvedValue(undefined),
        upgrade: vi.fn(),
        getName: vi.fn(), // Add missing method
      };
      globalThis.customElements = mockCustomElements as CustomElementRegistry;
    }

    return () => domUtils.cleanupDOM();
  },

  /**
   * Creates a mock storage implementation
   *
   * @returns Mock storage object
   */
  createStorageMock: () => {
    const store = new Map<string, string>();

    return {
      getItem: vi.fn((key: string) => store.get(key) || null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, String(value));
      }),
      removeItem: vi.fn((key: string) => store.delete(key)),
      clear: vi.fn(() => store.clear()),
      key: vi.fn((index: number) => {
        const keys = Array.from(store.keys());
        return keys[index] || null;
      }),
      get length() {
        return store.size;
      },
    } as Storage;
  },

  /**
   * Cleans up DOM mocks and restores originals
   */
  cleanupDOM: () => {
    if (originalValues.window) {
      globalThis.window = originalValues.window;
    }
    if (originalValues.document) {
      globalThis.document = originalValues.document;
    }

    // Clean up optional APIs
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = undefined;
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = undefined;
    (globalThis as { customElements?: unknown }).customElements = undefined;
  },
};

/**
 * Network mocking utilities
 */
export const networkUtils = {
  /**
   * Sets up network API mocks
   *
   * @param config - Network configuration
   * @returns Cleanup function
   */
  setupNetwork: (
    config: {
      mockFetch?: boolean;
      mockWebSocket?: boolean;
      defaultFetchResponse?: unknown;
      defaultFetchStatus?: number;
    } = {},
  ) => {
    const {
      mockFetch = true,
      mockWebSocket = true,
      defaultFetchResponse = { success: true },
      defaultFetchStatus = 200,
    } = config;

    // Store originals
    originalValues.fetch = globalThis.fetch;
    originalValues.WebSocket = globalThis.WebSocket;

    if (mockFetch) {
      globalThis.fetch = vi.fn().mockImplementation(async () => ({
        ok: defaultFetchStatus >= 200 && defaultFetchStatus < 300,
        status: defaultFetchStatus,
        statusText: defaultFetchStatus === 200 ? 'OK' : 'Error',
        headers: new Map(),
        json: vi.fn().mockResolvedValue(defaultFetchResponse),
        text: vi.fn().mockResolvedValue(JSON.stringify(defaultFetchResponse)),
        blob: vi.fn().mockResolvedValue(new Blob()),
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
      }));
    }

    if (mockWebSocket) {
      class MockWebSocket {
        static readonly CONNECTING = 0;
        static readonly OPEN = 1;
        static readonly CLOSING = 2;
        static readonly CLOSED = 3;

        url: string;
        readyState = 1; // OPEN
        onopen: ((event: Event) => void) | null = null;
        onclose: ((event: CloseEvent) => void) | null = null;
        onmessage: ((event: MessageEvent) => void) | null = null;
        onerror: ((event: Event) => void) | null = null;

        constructor(url: string) {
          this.url = url;
          // Simulate async connection
          setTimeout(() => {
            if (this.onopen) {
              this.onopen(new Event('open'));
            }
          }, 0);
        }

        send = vi.fn();
        close = vi.fn(() => {
          this.readyState = 3; // CLOSED
          if (this.onclose) {
            this.onclose(new CloseEvent('close'));
          }
        });

        addEventListener = vi.fn();
        removeEventListener = vi.fn();
        dispatchEvent = vi.fn();
      }

      const mockWebSocketClass: unknown = MockWebSocket;
      globalThis.WebSocket = mockWebSocketClass as typeof WebSocket;
    }

    return () => networkUtils.cleanupNetwork();
  },

  /**
   * Cleans up network mocks
   */
  cleanupNetwork: () => {
    if (originalValues.fetch) {
      globalThis.fetch = originalValues.fetch;
    }
    if (originalValues.WebSocket) {
      globalThis.WebSocket = originalValues.WebSocket;
    }
  },
};

/**
 * Wallet API mocking utilities
 */
export const walletUtils = {
  /**
   * Sets up wallet provider mocks
   *
   * @param config - Wallet configuration
   * @returns Cleanup function
   */
  setupWalletProviders: (
    config: {
      mockMetaMask?: boolean;
      mockWalletConnect?: boolean;
      mockSolana?: boolean;
      autoConnect?: boolean;
    } = {},
  ) => {
    const { mockMetaMask = true, mockSolana = false, autoConnect = false } = config;

    const mockProviders: Record<string, unknown> = {};

    if (mockMetaMask) {
      const mockEthereum = {
        isMetaMask: true,
        isConnected: vi.fn().mockReturnValue(autoConnect),
        request: vi.fn().mockImplementation(async ({ method }: { method: string }) => {
          switch (method) {
            case 'eth_requestAccounts':
              return ['0x742d35Cc6634C0532925a3b8D404d0E5bb1804c2'];
            case 'eth_accounts':
              return autoConnect ? ['0x742d35Cc6634C0532925a3b8D404d0E5bb1804c2'] : [];
            case 'eth_chainId':
              return '0x1'; // Mainnet
            default:
              return null;
          }
        }),

        // Event methods
        on: vi.fn(),
        removeListener: vi.fn(),
        addListener: vi.fn(),

        // Properties
        selectedAddress: autoConnect ? '0x742d35Cc6634C0532925a3b8D404d0E5bb1804c2' : null,
        chainId: '0x1',
        networkVersion: '1',
      };

      (globalThis.window as { ethereum?: unknown })['ethereum'] = mockEthereum;
      mockProviders['ethereum'] = mockEthereum;
    }

    if (mockSolana) {
      const mockSolana = {
        isPhantom: true,
        isConnected: autoConnect,
        connect: vi.fn().mockResolvedValue({
          publicKey: { toString: () => 'Dj8GVkCyRa5D9RJkjRdEYKfKb2c7X8y5n9UcGfRfKpE6' },
        }),
        disconnect: vi.fn().mockResolvedValue(undefined),
        signTransaction: vi.fn(),
        signAllTransactions: vi.fn(),

        // Event methods
        on: vi.fn(),
        off: vi.fn(),

        // Properties
        publicKey: autoConnect ? { toString: () => 'Dj8GVkCyRa5D9RJkjRdEYKfKb2c7X8y5n9UcGfRfKpE6' } : null,
      };

      (globalThis.window as { solana?: unknown })['solana'] = mockSolana;
      mockProviders['solana'] = mockSolana;
    }

    return {
      providers: mockProviders,
      cleanup: () => walletUtils.cleanupWalletProviders(),
    };
  },

  /**
   * Cleans up wallet provider mocks
   */
  cleanupWalletProviders: () => {
    (globalThis.window as { ethereum?: unknown }).ethereum = undefined;
    (globalThis.window as { solana?: unknown }).solana = undefined;
  },
};

/**
 * Environment variable utilities
 */
export const envUtils = {
  /**
   * Sets up environment variables for testing
   *
   * @param vars - Environment variables to set
   * @returns Cleanup function
   */
  setupEnv: (vars: Record<string, string>) => {
    // Store original environment
    originalValues.env = { ...process.env };

    // Apply new variables
    Object.assign(process.env, vars);

    return () => envUtils.cleanupEnv();
  },

  /**
   * Cleans up environment variables
   */
  cleanupEnv: () => {
    if (originalValues.env) {
      process.env = originalValues.env;
    }
  },

  /**
   * Creates a test environment preset
   *
   * @param preset - Environment preset name
   * @returns Environment variables for preset
   */
  createPreset: (preset: 'development' | 'production' | 'test') => {
    const presets = {
      development: {
        NODE_ENV: 'development',
        WALLETMESH_DEBUG: 'true',
        WALLETMESH_LOG_LEVEL: 'debug',
      },
      production: {
        NODE_ENV: 'production',
        WALLETMESH_DEBUG: 'false',
        WALLETMESH_LOG_LEVEL: 'error',
      },
      test: {
        NODE_ENV: 'test',
        WALLETMESH_DEBUG: 'false',
        WALLETMESH_LOG_LEVEL: 'warn',
      },
    };

    return presets[preset];
  },
};

/**
 * Configuration for test environment setup
 * @interface TestEnvironmentConfig
 */
export interface TestEnvironmentConfig {
  /** Whether to mock DOM APIs */
  mockDOM?: boolean | Parameters<typeof domUtils.setupDOM>[0];
  /** Whether to mock browser storage APIs */
  mockStorage?: boolean;
  /** Whether to mock network APIs */
  mockNetwork?: boolean | Parameters<typeof networkUtils.setupNetwork>[0];
  /** Whether to mock wallet APIs */
  mockWallet?:
    | boolean
    | {
        mockMetaMask?: boolean;
        mockWalletConnect?: boolean;
        mockSolana?: boolean;
        autoConnect?: boolean;
      };
  /** Custom environment variables */
  env?: Record<string, string>;
}

/**
 * Complete environment setup utility
 *
 * Sets up a complete test environment with all necessary mocks.
 *
 * @param {TestEnvironmentConfig} config - Environment configuration
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * beforeEach(() => {
 *   setupTestEnvironment({
 *     mockDOM: true,
 *     mockNetwork: true,
 *     mockWallet: { mockMetaMask: true },
 *     env: { NODE_ENV: 'test' }
 *   });
 * });
 *
 * afterEach(() => {
 *   cleanupTestEnvironment();
 * });
 * ```
 */
export function setupTestEnvironment(config: TestEnvironmentConfig = {}) {
  const cleanupFunctions: Array<() => void> = [];

  if (config.mockDOM !== false) {
    const cleanup = domUtils.setupDOM(typeof config.mockDOM === 'object' ? config.mockDOM : {});
    cleanupFunctions.push(cleanup);
  }

  if (config.mockNetwork !== false) {
    const cleanup = networkUtils.setupNetwork(
      typeof config.mockNetwork === 'object' ? config.mockNetwork : {},
    );
    cleanupFunctions.push(cleanup);
  }

  if (config.mockWallet !== false) {
    const { cleanup } = walletUtils.setupWalletProviders(
      typeof config.mockWallet === 'object' ? config.mockWallet : {},
    );
    cleanupFunctions.push(cleanup);
  }

  if (config.env) {
    const cleanup = envUtils.setupEnv(config.env);
    cleanupFunctions.push(cleanup);
  }

  return () => {
    for (const cleanup of cleanupFunctions) {
      cleanup();
    }
  };
}

/**
 * Cleans up all environment mocks
 */
export function cleanupTestEnvironment() {
  domUtils.cleanupDOM();
  networkUtils.cleanupNetwork();
  walletUtils.cleanupWalletProviders();
  envUtils.cleanupEnv();

  // Clear stored original values
  originalValues = {};
}

/**
 * Auto-setup utilities for common test patterns
 */
export const autoSetup = {
  /**
   * Automatically sets up and cleans up environment for each test
   *
   * @param config - Environment configuration
   *
   * @example
   * ```typescript
   * // In test file
   * autoSetup.beforeEachTest({
   *   mockDOM: true,
   *   mockWallet: { mockMetaMask: true }
   * });
   * ```
   */
  beforeEachTest: (config: TestEnvironmentConfig = {}) => {
    beforeEach(() => {
      setupTestEnvironment(config);
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });
  },

  /**
   * Sets up environment for integration tests
   */
  integrationTest: () => {
    autoSetup.beforeEachTest({
      mockDOM: true,
      mockNetwork: true,
      mockWallet: {
        mockMetaMask: true,
        mockSolana: true,
        autoConnect: false,
      },
      env: envUtils.createPreset('test'),
    });
  },

  /**
   * Sets up environment for unit tests
   */
  unitTest: () => {
    autoSetup.beforeEachTest({
      mockDOM: true,
      mockNetwork: false,
      mockWallet: false,
      env: envUtils.createPreset('test'),
    });
  },
};

/**
 * Consolidated mock implementations for testing.
 *
 * Combines all mock implementations (browser, chrome, console, crypto, sessions)
 * into a single module to reduce the number of testing files.
 *
 * @module testing/mocks
 * @category Testing
 * @since 0.1.0
 */

import { vi } from 'vitest';
// Import types are handled in other modules

// ============================================================================
// Browser Mocks
// ============================================================================

/**
 * Mock window configuration for testing.
 */
export interface MockWindowConfig {
  origin?: string;
  location?: Partial<Location>;
  eventTarget?: boolean;
}

/**
 * Mock Location object for testing.
 */
export function createMockLocation(origin = 'https://test.com'): Location {
  const url = new URL(origin);
  return {
    ancestorOrigins: { length: 0 } as DOMStringList,
    origin,
    href: origin,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    replace: vi.fn(),
    assign: vi.fn(),
    reload: vi.fn(),
    toString: () => origin,
  } as unknown as Location;
}

/**
 * Mock Window object for testing.
 */
export function createMockWindow(config: MockWindowConfig = {}): Window {
  const mockLocation = createMockLocation(config.origin);
  const mockEventTarget = config.eventTarget ? new EventTarget() : undefined;

  return {
    location: { ...mockLocation, ...config.location },
    origin: config.origin ?? 'https://test.com',
    addEventListener: mockEventTarget?.addEventListener.bind(mockEventTarget) ?? vi.fn(),
    removeEventListener: mockEventTarget?.removeEventListener.bind(mockEventTarget) ?? vi.fn(),
    dispatchEvent: mockEventTarget?.dispatchEvent.bind(mockEventTarget) ?? vi.fn(),
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    crypto: createMockCrypto(),
  } as unknown as Window;
}

/**
 * Mock browser environment for cross-origin testing.
 */
export function mockBrowserEnvironment(config: MockWindowConfig = {}): void {
  const mockWindow = createMockWindow(config);
  global.window = mockWindow as Window & typeof globalThis;
}

/**
 * Restore browser environment after testing.
 */
export function restoreBrowserEnvironment(): void {
  delete (global as { window?: Window }).window;
}

// ============================================================================
// Chrome Extension API Mocks
// ============================================================================

/**
 * Mock Chrome runtime API.
 */
export interface MockChromeRuntime {
  sendMessage: MockFunction;
  connect?: MockFunction;
  onMessage: {
    addListener: MockFunction;
    removeListener: MockFunction;
  };
  id: string;
}

/**
 * Mock Chrome tabs API.
 */
export interface MockChromeTabs {
  query: MockFunction;
  create: MockFunction;
  update: MockFunction;
  sendMessage: MockFunction;
}

/**
 * Mock Chrome API object.
 */
export interface MockChromeAPI {
  runtime: MockChromeRuntime;
  tabs: MockChromeTabs;
}

/**
 * Mock function type for testing.
 */
export interface MockFunction {
  (...args: unknown[]): unknown;
  mockImplementation?: (fn: (...args: unknown[]) => unknown) => void;
  mockResolvedValue?: (value: unknown) => void;
  mockRejectedValue?: (error: unknown) => void;
  mockReset?: () => void;
  mock?: { calls: Array<unknown[]> };
}

/**
 * Create a mock function.
 */
function createMock(): MockFunction {
  // Simply return vi.fn() which already has all the mock methods
  return vi.fn() as MockFunction;
}

/**
 * Create mock Chrome API.
 */
export function createMockChromeAPI(): MockChromeAPI {
  return {
    runtime: {
      sendMessage: createMock(),
      onMessage: {
        addListener: createMock(),
        removeListener: createMock(),
      },
      id: 'test-extension-id',
    },
    tabs: {
      query: createMock(),
      create: createMock(),
      update: createMock(),
      sendMessage: createMock(),
    },
  };
}

/**
 * Setup Chrome extension environment for testing.
 */
export function setupChromeEnvironment(config: { extensionId?: string } = {}): {
  chrome: MockChromeAPI;
  cleanup: () => void;
} {
  const mockChrome = createMockChromeAPI();
  if (config.extensionId) {
    mockChrome.runtime.id = config.extensionId;
  }

  (global as { chrome?: MockChromeAPI }).chrome = mockChrome;

  return {
    chrome: mockChrome,
    cleanup: () => {
      delete (global as { chrome?: MockChromeAPI }).chrome;
    },
  };
}

// ============================================================================
// Console Mocks
// ============================================================================

/**
 * Console spy configuration.
 */
export interface ConsoleSpyOptions {
  silent?: boolean;
  capture?: boolean;
  pattern?: RegExp;
}

/**
 * Console spy interface.
 */
export interface ConsoleSpy {
  log: MockFunction;
  warn: MockFunction;
  error: MockFunction;
  info: MockFunction;
  debug: MockFunction;
  restore: () => void;
  getCapturedOutput?: () => string[];
}

/**
 * Create a console spy for testing.
 */
export function createConsoleSpy(options: ConsoleSpyOptions = {}): ConsoleSpy {
  const originalConsole = { ...console };
  const capturedOutput: string[] = [];

  const createSpyMethod = (level: string) => {
    const mock = createMock();

    if (options.capture) {
      mock.mockImplementation = (fn) => {
        return vi.mocked(mock).mockImplementation((...args) => {
          const message = args.join(' ');
          if (!options.pattern || options.pattern.test(message)) {
            capturedOutput.push(`[${level}] ${message}`);
          }
          return fn?.(...args);
        });
      };
    }

    if (!options.silent) {
      mock.mockImplementation?.(((...args: unknown[]) => {
        const method = originalConsole[level as keyof Console];
        if (typeof method === 'function') {
          return (method as (...args: unknown[]) => unknown).apply(originalConsole, args);
        }
        return undefined;
      }) as (...args: unknown[]) => unknown);
    }

    return mock;
  };

  const spy: ConsoleSpy = {
    log: createSpyMethod('log'),
    warn: createSpyMethod('warn'),
    error: createSpyMethod('error'),
    info: createSpyMethod('info'),
    debug: createSpyMethod('debug'),
    restore: () => {
      Object.assign(console, originalConsole);
    },
  };

  if (options.capture) {
    spy.getCapturedOutput = () => [...capturedOutput];
  }

  // Apply spy to console
  console.log = spy.log as typeof console.log;
  console.warn = spy.warn as typeof console.warn;
  console.error = spy.error as typeof console.error;
  console.info = spy.info as typeof console.info;
  console.debug = spy.debug as typeof console.debug;

  return spy;
}

/**
 * Create a silent console spy.
 */
export function createSilentConsoleSpy(): ConsoleSpy {
  return createConsoleSpy({ silent: true });
}

/**
 * Create a capturing console spy.
 */
export function createCapturingConsoleSpy(pattern?: RegExp): ConsoleSpy {
  return createConsoleSpy({ capture: true, ...(pattern && { pattern }) });
}

// ============================================================================
// Crypto and Session Mocks
// ============================================================================

/**
 * Mock Crypto API for testing.
 */
export interface MockCrypto {
  randomUUID: MockFunction;
  getRandomValues: MockFunction;
}

/**
 * Create mock Crypto API.
 */
export function createMockCrypto(): MockCrypto {
  let uuidCounter = 0;

  return {
    randomUUID: vi.fn(() => {
      uuidCounter++;
      return `test-uuid-${uuidCounter.toString().padStart(4, '0')}`;
    }),
    getRandomValues: vi.fn(
      (array: Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      },
    ),
  } as MockCrypto;
}

/**
 * Test ID generation options.
 */
export interface TestIdOptions {
  prefix?: string;
  deterministic?: boolean;
  counter?: number;
}

let sessionIdCounter = 0;
let responderIdCounter = 0;
let uuidCounter = 0;

/**
 * Create deterministic test session ID.
 */
export function createTestSessionId(options: TestIdOptions = {}): string {
  if (options.deterministic) {
    const counter = options.counter ?? ++sessionIdCounter;
    return `${options.prefix ?? 'session'}-${counter}`;
  }
  return crypto.randomUUID();
}

/**
 * Create deterministic test UUID.
 */
export function createTestUUID(options: TestIdOptions = {}): string {
  if (options.deterministic) {
    const counter = options.counter ?? ++uuidCounter;
    return `${options.prefix ?? 'uuid'}-${counter.toString().padStart(4, '0')}`;
  }
  return crypto.randomUUID();
}

/**
 * Create deterministic test responder ID.
 */
export function createTestResponderId(options: TestIdOptions = {}): string {
  if (options.deterministic) {
    const counter = options.counter ?? ++responderIdCounter;
    return `${options.prefix ?? 'responder'}-${counter}`;
  }
  return crypto.randomUUID();
}

/**
 * Reset test ID counters.
 */
export function resetTestIdCounters(): void {
  sessionIdCounter = 0;
  responderIdCounter = 0;
  uuidCounter = 0;
}

/**
 * Setup mock crypto globally.
 */
export function setupMockCrypto(): { cleanup: () => void } {
  const originalCrypto = global.crypto;
  global.crypto = createMockCrypto() as Crypto;

  return {
    cleanup: () => {
      global.crypto = originalCrypto;
    },
  };
}

// ============================================================================
// Event Target Mock
// ============================================================================

/**
 * Mock EventTarget for testing.
 */
export class MockEventTarget implements EventTarget {
  private listeners = new Map<string, Set<EventListener>>();

  addEventListener(type: string, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.add(listener);
    }
  }

  removeEventListener(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      }
    }
    return true;
  }

  /**
   * Get listener count for testing.
   */
  getListenerCount(type?: string): number {
    if (type) {
      return this.listeners.get(type)?.size ?? 0;
    }
    return Array.from(this.listeners.values()).reduce((total, set) => total + set.size, 0);
  }

  /**
   * Clear all listeners.
   */
  clearListeners(): void {
    this.listeners.clear();
  }
}

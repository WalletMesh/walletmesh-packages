/**
 * Test setup file for modal-core testing environment
 *
 * Provides global mocks and environment setup for unit and integration tests.
 * Sets up DOM, localStorage, and WebSocket mocks to enable testing in Node.js.
 *
 * @packageDocumentation
 * @internal
 */

// Define global mocks and environment setup for tests
global.window = global.window || ({} as Window & typeof globalThis);
const mockDocument: unknown = {
  createElement: () => ({
    setAttribute: () => {},
    appendChild: () => {},
    style: {},
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {},
  },
  querySelector: () => null,
};

global.document = global.document || (mockDocument as Document);

/**
 * Mock localStorage implementation for testing
 *
 * Provides a complete localStorage-compatible interface that stores
 * data in memory during test execution.
 *
 * @example
 * ```typescript
 * // In tests, localStorage works as expected:
 * localStorage.setItem('key', 'value');
 * const value = localStorage.getItem('key'); // 'value'
 * localStorage.clear();
 * ```
 */
const localStorageMock = (() => {
  const store: Record<string, string> = {};

  return {
    /**
     * Get an item from storage
     * @param key - Storage key
     * @returns Stored value or null
     */
    getItem: (key: string) => store[key] || null,

    /**
     * Set an item in storage
     * @param key - Storage key
     * @param value - Value to store
     */
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },

    /**
     * Remove an item from storage
     * @param key - Storage key to remove
     */
    removeItem: (key: string) => {
      delete store[key];
    },

    /**
     * Clear all items from storage
     */
    clear: () => {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    },
  };
})();

global.localStorage = localStorageMock as Storage;

/**
 * Mock WebSocket implementation for testing
 *
 * Provides a WebSocket-compatible interface that simulates basic
 * WebSocket behavior for transport testing.
 *
 * @example
 * ```typescript
 * // In tests, WebSocket behaves predictably:
 * const ws = new WebSocket('ws://localhost:8080');
 * ws.onopen = () => console.log('Connected');
 * ws.send('test message');
 * ws.close();
 * ```
 */
global.WebSocket = class MockWebSocket {
  /** WebSocket URL */
  url: string;
  /** Open event handler */
  onopen: (() => void) | null = null;
  /** Close event handler */
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  /** Message event handler */
  onmessage: ((event: MessageEvent) => void) | null = null;
  /** Error event handler */
  onerror: ((event: Event) => void) | null = null;
  /** Connection state (0: connecting, 1: open, 3: closed) */
  readyState = 0;

  /**
   * Create a mock WebSocket
   * @param url - WebSocket URL
   */
  constructor(url: string) {
    this.url = url;
    // Simulate async connection
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) this.onopen();
    }, 0);
  }

  /**
   * Send data (mock implementation)
   * @param {unknown} _data - Data to send (ignored in mock)
   */
  send(_data: unknown) {
    // Mock implementation - do nothing
  }

  /**
   * Close the connection
   */
  close() {
    this.readyState = 3;
    if (this.onclose) this.onclose({ code: 1000, reason: 'Normal closure' });
  }
} as typeof WebSocket;

/**
 * Mock @solana/web3.js module for testing
 *
 * Provides mock implementations for Solana dependencies when
 * @solana/web3.js is not available (it's an optional peer dependency)
 */
import { vi } from 'vitest';

// Mock the @solana/web3.js module
vi.mock('@solana/web3.js', () => {
  class MockPublicKey {
    constructor(public key: string) {}
    toString() {
      return this.key;
    }
    toBase58() {
      return this.key;
    }
  }

  class MockTransaction {
    serialize() {
      return new Uint8Array([1, 2, 3, 4]);
    }
    static from(_data: Buffer) {
      return new MockTransaction();
    }
  }

  class MockConnection {
    constructor(public endpoint: string) {}
  }

  return {
    // Named exports use PascalCase to match real module
    PublicKey: MockPublicKey,
    Transaction: MockTransaction,
    Connection: MockConnection,
    default: {
      PublicKey: MockPublicKey,
      Transaction: MockTransaction,
      Connection: MockConnection,
    },
  };
});

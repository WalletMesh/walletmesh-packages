/**
 * @file test-helpers.ts
 * @packageDocumentation
 * Helper functions for Chrome extension transport tests.
 */

import type { ChromeMessage, ChromePort } from '../types.js';
import { ChromeMessageType } from '../types.js';

/**
 * Chrome runtime connect function type
 */
type ConnectFn = (extensionId: string, connectInfo?: { name?: string }) => ChromePort;

/**
 * Type guard for chrome runtime
 */
export function hasChromeRuntime(win: Window & typeof globalThis): win is Window &
  typeof globalThis & {
    chrome: { runtime: { connect: ConnectFn; lastError?: Error } };
  } {
  return Boolean(
    win.chrome &&
      'runtime' in win.chrome &&
      typeof win.chrome.runtime === 'object' &&
      win.chrome.runtime !== null &&
      'connect' in win.chrome.runtime &&
      typeof win.chrome.runtime.connect === 'function',
  );
}

/**
 * Type guard for Chrome messages
 */
export function isChromeMessage(value: unknown): value is ChromeMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'id' in value &&
    typeof (value as ChromeMessage).type === 'string' &&
    typeof (value as ChromeMessage).id === 'string'
  );
}

/**
 * Type to represent comparable objects
 */
type Comparable<T> = {
  [P in keyof T]: T[P];
};

/**
 * Verifies arrays have the same elements
 */
export function verifyArrays<T>(
  actual: Comparable<T>[],
  expected: Comparable<T>[],
  verify: (a: Comparable<T>, b: Comparable<T>) => boolean,
): boolean {
  if (actual.length !== expected.length) {
    return false;
  }

  return actual.every((item, index) => {
    const expectedItem = expected[index];
    if (!item || !expectedItem) {
      return false;
    }
    return verify(item, expectedItem);
  });
}

/**
 * Verifies Chrome message arrays
 */
export function verifyMessages(actual: ChromeMessage[], expected: ChromeMessage[]): boolean {
  return verifyArrays(actual, expected, (a, b) => {
    if (!a.payload || !b.payload) {
      return false;
    }

    return JSON.stringify(a.payload) === JSON.stringify(b.payload);
  });
}

/**
 * Creates a test message payload
 */
export function createTestPayload(id: string | number): { test: string } {
  return { test: `message-${id}` };
}

/**
 * Creates a test Chrome message
 */
export function createTestMessage(id: string | number): ChromeMessage {
  return {
    type: ChromeMessageType.REQUEST,
    payload: createTestPayload(id),
    timestamp: Date.now(),
    id: crypto.randomUUID(),
  };
}

/**
 * Creates a test Chrome error message
 */
export function createErrorMessage(error: {
  message: string;
  code?: string;
  details?: unknown;
}): ChromeMessage {
  return {
    type: ChromeMessageType.ERROR,
    error,
    timestamp: Date.now(),
    id: crypto.randomUUID(),
  };
}

/**
 * Creates a test Chrome disconnect message
 */
export function createDisconnectMessage(): ChromeMessage {
  return {
    type: ChromeMessageType.DISCONNECT,
    timestamp: Date.now(),
    id: crypto.randomUUID(),
  };
}

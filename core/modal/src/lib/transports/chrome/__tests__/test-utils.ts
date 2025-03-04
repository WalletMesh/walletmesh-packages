/**
 * @file test-utils.ts
 * @packageDocumentation
 * Test utilities for Chrome extension transport tests.
 */

import type { ChromeRuntime } from '../types.js';

/**
 * Sets up the mock Chrome runtime on the window object.
 *
 * @throws {Error} if mock runtime is invalid
 */
export function setupMockChrome(runtime: ChromeRuntime): void {
  if (!runtime?.connect || typeof runtime.connect !== 'function') {
    throw new Error('Invalid mock runtime: connect method is required');
  }

  const mockChrome = {
    runtime: {
      ...runtime,
      connect: runtime.connect.bind(runtime),
    },
  };

  Object.defineProperty(window, 'chrome', {
    value: mockChrome,
    configurable: true,
    writable: true,
  });

  // Verify setup was successful
  if (!isChromeRuntimeAvailable()) {
    throw new Error('Failed to setup mock Chrome runtime');
  }
}

/**
 * Restores the original Chrome runtime.
 */
export function restoreMockChrome(originalChrome: typeof window.chrome): void {
  Object.defineProperty(window, 'chrome', {
    value: originalChrome,
    configurable: true,
    writable: true,
  });
}

/**
 * Type guard for checking if Chrome runtime is available.
 */
export function isChromeRuntimeAvailable(): boolean {
  const runtime = window.chrome?.runtime;
  return Boolean(
    runtime && typeof runtime === 'object' && 'connect' in runtime && typeof runtime.connect === 'function',
  );
}

/**
 * Creates a partial mock runtime for testing.
 */
export function createMockRuntime(connect: ChromeRuntime['connect']): ChromeRuntime {
  return {
    connect,
    lastError: undefined,
  };
}

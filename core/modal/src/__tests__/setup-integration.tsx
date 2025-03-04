/**
 * @file setup-integration.tsx
 * @packageDocumentation
 * Setup for integration tests.
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Store original window properties
const originalWindow = { ...window };

// Mock crypto.randomUUID
beforeEach(() => {
  if (!crypto.randomUUID) {
    Object.defineProperty(crypto, 'randomUUID', {
      value: vi.fn(() => 'test-id'),
      configurable: true,
    });
  }
});

// Mock window.chrome with empty runtime
beforeEach(() => {
  const mockChrome = {
    runtime: {
      connect: vi.fn(),
      lastError: undefined,
    },
  };

  Object.defineProperty(window, 'chrome', {
    value: mockChrome,
    configurable: true,
    writable: true,
  });
});

// Reset all mocks between tests
beforeEach(() => {
  vi.resetAllMocks();
});

// Clean up timers
afterEach(() => {
  vi.clearAllTimers();
});

// Restore window properties
afterEach(() => {
  Object.defineProperty(window, 'chrome', {
    value: originalWindow.chrome,
    configurable: true,
    writable: true,
  });
});
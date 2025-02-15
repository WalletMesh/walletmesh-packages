/**
 * @file setup.tsx
 * @packageDocumentation
 * Global test setup configuration.
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Mock crypto.randomUUID
if (!crypto.randomUUID) {
  Object.defineProperty(crypto, 'randomUUID', {
    value: () => 'test-id',
    configurable: true,
  });
}

// Mock setTimeout and clearTimeout
vi.useFakeTimers();

// Mock console methods to reduce noise in tests
console.warn = vi.fn();
console.error = vi.fn();

// Reset all mocks between tests
beforeEach(() => {
  vi.resetAllMocks();
});

// Clean up timers
afterEach(() => {
  vi.clearAllTimers();
});
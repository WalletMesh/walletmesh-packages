/**
 * @packageDocumentation
 * Test setup for WalletMesh Core.
 */

import { vi, afterEach } from 'vitest';

// Ensure BigInt serialization is consistent
if (!Object.prototype.hasOwnProperty.call(BigInt.prototype, 'toJSON')) {
  Object.defineProperty(BigInt.prototype, 'toJSON', {
    value: function () {
      return this.toString();
    },
  });
}

// Global test cleanup
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  vi.useRealTimers();
});

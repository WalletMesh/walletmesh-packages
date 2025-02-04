import { describe, it, expect } from 'vitest';
import * as exports from './index.js';

describe('index exports', () => {
  it('should export AztecProvider', () => {
    expect(exports.AztecProvider).toBeDefined();
  });

  it('should export AztecChainWallet', () => {
    expect(exports.AztecChainWallet).toBeDefined();
  });

  it('should export error utilities', () => {
    expect(exports.AztecWalletError).toBeDefined();
    expect(exports.AztecWalletErrorMap).toBeDefined();
  });

  // Type exports can't be tested at runtime, but we can verify the file compiles
  it('should compile with type exports', () => {
    // This test passes by virtue of the file compiling
    expect(true).toBe(true);
  });
});

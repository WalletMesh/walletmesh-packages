/**
 * @file Tests for Solana provider API exports
 */

import { describe, expect, it } from 'vitest';

describe('solana provider exports', () => {
  it('should export SolanaProvider class', async () => {
    const module = await import('./solana.js');
    expect(module.SolanaProvider).toBeDefined();
    expect(typeof module.SolanaProvider).toBe('function');
  });

  it('should export NativeSolanaProvider class', async () => {
    const module = await import('./solana.js');
    expect(module.NativeSolanaProvider).toBeDefined();
    expect(typeof module.NativeSolanaProvider).toBe('function');
  });

  it('should have all expected exports', async () => {
    const module = await import('./solana.js');
    const exports = Object.keys(module);

    expect(exports).toContain('SolanaProvider');
    expect(exports).toContain('NativeSolanaProvider');
    expect(exports.length).toBeGreaterThanOrEqual(2);
  });

  it('should not export any unexpected symbols', async () => {
    const module = await import('./solana.js');
    const exports = Object.keys(module);

    // All exports should be known
    const knownExports = ['SolanaProvider', 'NativeSolanaProvider'];
    for (const exportName of exports) {
      expect(knownExports).toContain(exportName);
    }
  });
});

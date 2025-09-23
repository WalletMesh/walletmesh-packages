/**
 * @file Tests for EVM provider API exports
 */

import { describe, expect, it } from 'vitest';

describe('evm provider exports', () => {
  it('should export EvmProvider class', async () => {
    const module = await import('./evm.js');
    expect(module.EvmProvider).toBeDefined();
    expect(typeof module.EvmProvider).toBe('function');
  });

  it('should export NativeEvmProvider class', async () => {
    const module = await import('./evm.js');
    expect(module.NativeEvmProvider).toBeDefined();
    expect(typeof module.NativeEvmProvider).toBe('function');
  });

  it('should have all expected exports', async () => {
    const module = await import('./evm.js');
    const exports = Object.keys(module);

    expect(exports).toContain('EvmProvider');
    expect(exports).toContain('NativeEvmProvider');
    expect(exports.length).toBeGreaterThanOrEqual(2);
  });

  it('should not export any unexpected symbols', async () => {
    const module = await import('./evm.js');
    const exports = Object.keys(module);

    // All exports should be known
    const knownExports = ['EvmProvider', 'NativeEvmProvider'];
    for (const exportName of exports) {
      expect(knownExports).toContain(exportName);
    }
  });
});

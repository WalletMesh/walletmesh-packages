/**
 * @file Tests for Aztec provider API exports
 */

import { describe, expect, it } from 'vitest';

describe('aztec provider exports', () => {
  it('should not export AztecProvider class (deprecated)', async () => {
    const module = await import('./aztec.js');
    // AztecProvider has been removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
    expect(module.AztecProvider).toBeUndefined();
  });

  it('should have all expected type exports', async () => {
    const module = await import('./aztec.js');
    const exports = Object.keys(module);

    // AztecProvider removed, only type-only exports remain (not available at runtime)
    // Since these are type-only exports, they don't appear in runtime module
    expect(exports).toEqual([]);
  });

  it('should not export any unexpected symbols', async () => {
    const module = await import('./aztec.js');
    const exports = Object.keys(module);

    // Should have no runtime exports (only type-only exports)
    expect(exports).toEqual([]);
  });
});

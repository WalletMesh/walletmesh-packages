/**
 * @file Tests for public constants API
 */

import { describe, expect, it } from 'vitest';

describe('constants API exports', () => {
  it('should export INITIAL_CONNECTION_STATE', async () => {
    const module = await import('./constants.js');
    expect(module.INITIAL_CONNECTION_STATE).toBeDefined();
    expect(module.INITIAL_CONNECTION_STATE).toEqual({
      state: 'idle',
    });
  });

  it('should export INITIAL_MODAL_STATE', async () => {
    const module = await import('./constants.js');
    expect(module.INITIAL_MODAL_STATE).toBeDefined();
    expect(module.INITIAL_MODAL_STATE).toHaveProperty('connection');
    expect(module.INITIAL_MODAL_STATE).toHaveProperty('wallets');
    expect(module.INITIAL_MODAL_STATE).toHaveProperty('selectedWalletId');
    expect(module.INITIAL_MODAL_STATE).toHaveProperty('isOpen');
  });

  it('should export createModalState function', async () => {
    const module = await import('./constants.js');
    expect(module.createModalState).toBeDefined();
    expect(typeof module.createModalState).toBe('function');
  });

  it('should have all expected exports', async () => {
    const module = await import('./constants.js');
    const exports = Object.keys(module);

    const expectedExports = ['INITIAL_CONNECTION_STATE', 'INITIAL_MODAL_STATE', 'createModalState'];

    for (const expectedExport of expectedExports) {
      expect(exports).toContain(expectedExport);
    }
  });

  it('should create fresh modal state instances', async () => {
    const module = await import('./constants.js');
    const state1 = module.createModalState();
    const state2 = module.createModalState();

    expect(state1).toEqual(state2);
    expect(state1).not.toBe(state2);
    expect(state1.connection).not.toBe(state2.connection);
  });
});

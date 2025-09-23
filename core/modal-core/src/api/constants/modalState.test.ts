/**
 * @file Tests for modal state constants and utilities
 */

import { describe, expect, it } from 'vitest';
import { createMockWalletInfo } from '../../testing/index.js';
import { INITIAL_CONNECTION_STATE, INITIAL_MODAL_STATE, createModalState } from './modalState.js';

describe('modalState constants', () => {
  describe('INITIAL_CONNECTION_STATE', () => {
    it('should have the correct initial state', () => {
      expect(INITIAL_CONNECTION_STATE).toEqual({
        state: 'idle',
      });
    });

    it('should be immutable reference', () => {
      const state1 = INITIAL_CONNECTION_STATE;
      const state2 = INITIAL_CONNECTION_STATE;
      expect(state1).toBe(state2);
    });
  });

  describe('INITIAL_MODAL_STATE', () => {
    it('should have the correct initial structure', () => {
      expect(INITIAL_MODAL_STATE).toEqual({
        connection: INITIAL_CONNECTION_STATE,
        wallets: [],
        selectedWalletId: undefined,
        isOpen: false,
      });
    });

    it('should reference the connection state constant', () => {
      expect(INITIAL_MODAL_STATE.connection).toBe(INITIAL_CONNECTION_STATE);
    });

    it('should have empty wallets array', () => {
      expect(INITIAL_MODAL_STATE.wallets).toEqual([]);
      expect(Array.isArray(INITIAL_MODAL_STATE.wallets)).toBe(true);
    });

    it('should have undefined selectedWalletId', () => {
      expect(INITIAL_MODAL_STATE.selectedWalletId).toBeUndefined();
    });

    it('should have isOpen as false', () => {
      expect(INITIAL_MODAL_STATE.isOpen).toBe(false);
    });
  });

  describe('createModalState', () => {
    it('should return a fresh copy of initial state', () => {
      const state1 = createModalState();
      const state2 = createModalState();

      expect(state1).toEqual(INITIAL_MODAL_STATE);
      expect(state2).toEqual(INITIAL_MODAL_STATE);
      expect(state1).not.toBe(state2);
    });

    it('should have separate connection object instances', () => {
      const state1 = createModalState();
      const state2 = createModalState();

      expect(state1.connection).not.toBe(state2.connection);
      expect(state1.connection).toEqual(state2.connection);
    });

    it('should have separate wallets array instances', () => {
      const state1 = createModalState();
      const state2 = createModalState();

      expect(state1.wallets).not.toBe(state2.wallets);
      expect(state1.wallets).toEqual(state2.wallets);
    });

    it('should allow mutations without affecting the original', () => {
      const state = createModalState();

      // Mutate the copy
      state.isOpen = true;
      state.connection.state = 'connecting' as const;
      state.wallets.push(createMockWalletInfo('test', { name: 'Test Wallet' }));

      // Original should be unchanged
      expect(INITIAL_MODAL_STATE.isOpen).toBe(false);
      expect(INITIAL_CONNECTION_STATE.state).toBe('idle');
      expect(INITIAL_MODAL_STATE.wallets).toEqual([]);
    });

    it('should allow mutations without affecting other instances', () => {
      const state1 = createModalState();
      const state2 = createModalState();

      // Mutate one instance
      state1.isOpen = true;
      state1.connection.state = 'connecting' as const;

      // Other instance should be unchanged
      expect(state2.isOpen).toBe(false);
      expect(state2.connection.state).toBe('idle');
    });
  });
});

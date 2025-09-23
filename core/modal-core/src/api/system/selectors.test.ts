/**
 * @file Tests for state selectors
 */

import { describe, expect, it } from 'vitest';
import type { ChainType, ModalState, WalletInfo } from '../../types.js';
import { connectionSelectors, errorSelectors, selectors, uiSelectors, walletSelectors } from './selectors.js';

describe('selectors', () => {
  const mockWallets: WalletInfo[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      chains: ['ethereum' as ChainType],
      icon: '',
    },
    {
      id: 'phantom',
      name: 'Phantom',
      chains: ['solana' as ChainType],
      icon: '',
    },
    {
      id: 'multi-chain',
      name: 'Multi Chain Wallet',
      chains: ['ethereum' as ChainType, 'solana' as ChainType],
      icon: '',
    },
  ];

  describe('connectionSelectors', () => {
    describe('isConnected', () => {
      it('should return true when state is connected', () => {
        const state: ModalState = {
          connection: { state: 'connected' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(connectionSelectors.isConnected(state)).toBe(true);
      });

      it('should return false when state is not connected', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(connectionSelectors.isConnected(state)).toBe(false);
      });
    });

    describe('isConnecting', () => {
      it('should return true when state is connecting', () => {
        const state: ModalState = {
          connection: { state: 'connecting' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(connectionSelectors.isConnecting(state)).toBe(true);
      });

      it('should return false when state is not connecting', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(connectionSelectors.isConnecting(state)).toBe(false);
      });
    });

    describe('isDisconnected', () => {
      it('should return true when state is idle', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(connectionSelectors.isDisconnected(state)).toBe(true);
      });

      it('should return false when state is not idle', () => {
        const state: ModalState = {
          connection: { state: 'connected' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(connectionSelectors.isDisconnected(state)).toBe(false);
      });
    });

    describe('getConnectedWallet', () => {
      it('should return wallet info when wallet is selected and exists', () => {
        const state: ModalState = {
          connection: { state: 'connected' },
          wallets: [],
          selectedWalletId: 'metamask',
          isOpen: false,
        };
        const result = connectionSelectors.getConnectedWallet(state, mockWallets);
        expect(result).toEqual(mockWallets[0]);
      });

      it('should return null when no wallet is selected', () => {
        const state: ModalState = {
          connection: { state: 'connected' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        const result = connectionSelectors.getConnectedWallet(state, mockWallets);
        expect(result).toBeNull();
      });

      it('should return null when selected wallet does not exist', () => {
        const state: ModalState = {
          connection: { state: 'connected' },
          wallets: [],
          selectedWalletId: 'nonexistent',
          isOpen: false,
        };
        const result = connectionSelectors.getConnectedWallet(state, mockWallets);
        expect(result).toBeNull();
      });
    });
  });

  describe('uiSelectors', () => {
    describe('isModalOpen', () => {
      it('should return true when modal is open', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: true,
        };
        expect(uiSelectors.isModalOpen(state)).toBe(true);
      });

      it('should return false when modal is closed', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(uiSelectors.isModalOpen(state)).toBe(false);
      });
    });

    describe('isLoading', () => {
      it('should return true when connection is connecting', () => {
        const state: ModalState = {
          connection: { state: 'connecting' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(uiSelectors.isLoading(state)).toBe(true);
      });

      it('should return false when connection is not connecting', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(uiSelectors.isLoading(state)).toBe(false);
      });
    });
  });

  describe('errorSelectors', () => {
    describe('hasError', () => {
      it('should return true when there is an error', () => {
        const state: ModalState = {
          connection: { state: 'idle', error: new Error('Test error') },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(errorSelectors.hasError(state)).toBe(true);
      });

      it('should return false when there is no error', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(errorSelectors.hasError(state)).toBe(false);
      });
    });

    describe('getErrorMessage', () => {
      it('should return error message when error exists', () => {
        const error = new Error('Test error message');
        const state: ModalState = {
          connection: { state: 'idle', error },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(errorSelectors.getErrorMessage(state)).toBe('Test error message');
      });

      it('should return null when no error exists', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(errorSelectors.getErrorMessage(state)).toBeNull();
      });
    });

    describe('getError', () => {
      it('should return error object when error exists', () => {
        const error = new Error('Test error');
        const state: ModalState = {
          connection: { state: 'idle', error },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(errorSelectors.getError(state)).toBe(error);
      });

      it('should return null when no error exists', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };
        expect(errorSelectors.getError(state)).toBeNull();
      });
    });
  });

  describe('walletSelectors', () => {
    describe('filterWalletsByChain', () => {
      it('should filter wallets by chain type', () => {
        const ethereumWallets = walletSelectors.filterWalletsByChain(mockWallets, 'ethereum' as ChainType);
        expect(ethereumWallets).toHaveLength(2);
        expect(ethereumWallets[0].id).toBe('metamask');
        expect(ethereumWallets[1].id).toBe('multi-chain');
      });

      it('should return empty array when no wallets support the chain', () => {
        const bitcoinWallets = walletSelectors.filterWalletsByChain(mockWallets, 'bitcoin' as ChainType);
        expect(bitcoinWallets).toHaveLength(0);
      });

      it('should handle wallets without chains property', () => {
        const walletsWithoutChains: WalletInfo[] = [{ id: 'test', name: 'Test', icon: '' }];
        const result = walletSelectors.filterWalletsByChain(walletsWithoutChains, 'ethereum' as ChainType);
        expect(result).toHaveLength(0);
      });
    });
  });

  describe('combined selectors', () => {
    it('should include all selector groups', () => {
      expect(selectors.isConnected).toBe(connectionSelectors.isConnected);
      expect(selectors.isModalOpen).toBe(uiSelectors.isModalOpen);
      expect(selectors.hasError).toBe(errorSelectors.hasError);
      expect(selectors.filterWalletsByChain).toBe(walletSelectors.filterWalletsByChain);
    });

    describe('getStateSummary', () => {
      it('should return comprehensive state summary', () => {
        const state: ModalState = {
          connection: { state: 'connected' },
          wallets: [],
          selectedWalletId: 'metamask',
          isOpen: true,
        };

        const summary = selectors.getStateSummary(state);
        expect(summary).toEqual({
          isConnected: true,
          isConnecting: false,
          isModalOpen: true,
          hasError: false,
        });
      });

      it('should work with error state', () => {
        const state: ModalState = {
          connection: { state: 'idle', error: new Error('Test') },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };

        const summary = selectors.getStateSummary(state);
        expect(summary).toEqual({
          isConnected: false,
          isConnecting: false,
          isModalOpen: false,
          hasError: true,
        });
      });
    });
  });
});

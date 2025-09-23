import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletProvider } from '../api/types/providers.js';
import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import { ChainType } from '../types.js';
import { WalletProviderFallbackWrapper } from './WalletProviderFallbackWrapper.js';

describe('WalletProviderFallbackWrapper', () => {
  let mockWalletProvider: WalletProvider;
  let wrapper: WalletProviderFallbackWrapper;

  beforeEach(() => {
    mockWalletProvider = {
      request: vi.fn(),
      getAccounts: vi.fn(),
      getChainId: vi.fn(),
      isConnected: vi.fn(() => true),
      on: vi.fn(),
      off: vi.fn(),
      disconnect: vi.fn(),
    };

    wrapper = new WalletProviderFallbackWrapper(mockWalletProvider, '1', ChainType.Evm);
  });

  describe('request', () => {
    it('should allow read-only EVM methods', async () => {
      const readMethods = [
        'eth_blockNumber',
        'eth_call',
        'eth_getBalance',
        'eth_getLogs',
        'eth_getTransactionReceipt',
      ];

      for (const method of readMethods) {
        vi.mocked(mockWalletProvider.request).mockResolvedValueOnce({ result: 'test' });

        const result = await wrapper.request({ method });

        expect(mockWalletProvider.request).toHaveBeenCalledWith({ method });
        expect(result).toEqual({ result: 'test' });
      }
    });

    it('should allow read-only Solana methods', async () => {
      wrapper = new WalletProviderFallbackWrapper(mockWalletProvider, 'mainnet-beta', ChainType.Solana);

      const readMethods = ['getAccountInfo', 'getBalance', 'getBlock', 'getTransaction'];

      for (const method of readMethods) {
        vi.mocked(mockWalletProvider.request).mockResolvedValueOnce({ result: 'test' });

        const result = await wrapper.request({ method });

        expect(mockWalletProvider.request).toHaveBeenCalledWith({ method });
        expect(result).toEqual({ result: 'test' });
      }
    });

    it('should block write operations', async () => {
      const writeMethods = [
        'eth_sendTransaction',
        'eth_sendRawTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_signTypedData_v4',
        'wallet_addEthereumChain',
        'wallet_switchEthereumChain',
      ];

      for (const method of writeMethods) {
        await expect(wrapper.request({ method })).rejects.toThrow(
          `Method '${method}' is not allowed for public provider operations. Only read-only methods are permitted.`,
        );

        expect(mockWalletProvider.request).not.toHaveBeenCalled();
      }
    });

    it('should forward params correctly', async () => {
      const params = ['0x123', 'latest'];
      vi.mocked(mockWalletProvider.request).mockResolvedValueOnce('0x1000');

      const result = await wrapper.request({
        method: 'eth_getBalance',
        params,
      });

      expect(mockWalletProvider.request).toHaveBeenCalledWith({
        method: 'eth_getBalance',
        params,
      });
      expect(result).toBe('0x1000');
    });

    it('should handle wallet provider errors', async () => {
      vi.mocked(mockWalletProvider.request).mockRejectedValueOnce(new Error('Provider error'));

      await expect(wrapper.request({ method: 'eth_blockNumber' })).rejects.toThrow(
        'Wallet provider fallback RPC call failed: eth_blockNumber',
      );
    });

    it('should expose chainId and chainType', () => {
      expect(wrapper.chainId).toBe('1');
      expect(wrapper.chainType).toBe(ChainType.Evm);
    });
  });

  describe('Aztec methods', () => {
    it('should allow read-only Aztec methods', async () => {
      wrapper = new WalletProviderFallbackWrapper(mockWalletProvider, 'aztec-mainnet', ChainType.Aztec);

      const readMethods = ['getBlock', 'getBlockNumber', 'getChainId', 'getNodeInfo', 'getTxReceipt'];

      for (const method of readMethods) {
        vi.mocked(mockWalletProvider.request).mockResolvedValueOnce({ result: 'test' });

        const result = await wrapper.request({ method });

        expect(mockWalletProvider.request).toHaveBeenCalledWith({ method });
        expect(result).toEqual({ result: 'test' });
      }
    });
  });
});

/**
 * Tests for useQueryInvalidation hook
 *
 * Tests query cache invalidation functionality including
 * the new contract query invalidation methods.
 */

import { act, renderHook } from '@testing-library/react';
import { ChainType, type SupportedChain, queryKeys } from '@walletmesh/modal-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useQueryInvalidation } from './useQueryInvalidation.js';

// Test chains
const ethereumChain: SupportedChain = {
  chainId: 'eip155:1',
  chainType: ChainType.Evm,
  name: 'Ethereum',
  required: false,
};
const polygonChain: SupportedChain = {
  chainId: 'eip155:137',
  chainType: ChainType.Evm,
  name: 'Polygon',
  required: false,
};

// Mock the query client
const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined);

// Mock useQueryClient hook
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

describe('useQueryInvalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide all invalidation methods', () => {
    const { result } = renderHook(() => useQueryInvalidation());

    expect(result.current).toHaveProperty('invalidateAll');
    expect(result.current).toHaveProperty('invalidateBalances');
    expect(result.current).toHaveProperty('invalidateBalance');
    expect(result.current).toHaveProperty('invalidateTokenBalance');
    expect(result.current).toHaveProperty('invalidateTransactions');
    expect(result.current).toHaveProperty('invalidateTransaction');
    expect(result.current).toHaveProperty('invalidateContracts');
    expect(result.current).toHaveProperty('invalidateContract');
    expect(result.current).toHaveProperty('invalidateContractMethod');
    expect(result.current).toHaveProperty('invalidateContractsByChain');
    expect(result.current).toHaveProperty('invalidateChains');
    expect(result.current).toHaveProperty('invalidateChain');
    expect(result.current).toHaveProperty('invalidateCustom');
  });

  describe('contract query invalidation', () => {
    it('should invalidate all contract queries', async () => {
      const { result } = renderHook(() => useQueryInvalidation());

      await act(async () => {
        await result.current.invalidateContracts();
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.contract.all(),
      });
    });

    it('should invalidate specific contract queries', async () => {
      const { result } = renderHook(() => useQueryInvalidation());

      const chain = ethereumChain;
      const address = '0x1234567890123456789012345678901234567890';

      await act(async () => {
        await result.current.invalidateContract(chain, address);
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.contract.byAddress(chain.chainId, address),
      });
    });

    it('should invalidate contract method queries', async () => {
      const { result } = renderHook(() => useQueryInvalidation());

      const chain = ethereumChain;
      const address = '0x1234567890123456789012345678901234567890';
      const methodSig = 'balanceOf(address)';
      const params = ['0xabcdef0123456789012345678901234567890123'];

      await act(async () => {
        await result.current.invalidateContractMethod(chain, address, methodSig, params);
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.contract.read(chain.chainId, address, methodSig, params),
      });
    });

    it('should invalidate contract method queries without params', async () => {
      const { result } = renderHook(() => useQueryInvalidation());

      const chain = polygonChain;
      const address = '0xUSDC';
      const methodSig = 'totalSupply()';

      await act(async () => {
        await result.current.invalidateContractMethod(chain, address, methodSig);
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.contract.read(chain.chainId, address, methodSig, undefined),
      });
    });

    it('should invalidate all contracts on a specific chain', async () => {
      const { result } = renderHook(() => useQueryInvalidation());

      const chain = polygonChain;

      await act(async () => {
        await result.current.invalidateContractsByChain(chain);
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.contract.byChain(chain.chainId),
      });
    });

    it('should support custom invalidation options', async () => {
      const { result } = renderHook(() => useQueryInvalidation());

      const options = {
        refetch: false,
        cancelRefetch: true,
      };

      await act(async () => {
        await result.current.invalidateContracts(options);
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.contract.all(),
        ...options,
      });
    });
  });

  describe('existing invalidation methods', () => {
    it('should invalidate all queries', async () => {
      const { result } = renderHook(() => useQueryInvalidation());

      await act(async () => {
        await result.current.invalidateAll();
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.all,
      });
    });

    it('should invalidate balance queries', async () => {
      const { result } = renderHook(() => useQueryInvalidation());

      const chain = ethereumChain;
      const address = '0x1234567890123456789012345678901234567890';

      await act(async () => {
        await result.current.invalidateBalance(chain, address);
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.balance.native(chain.chainId, address),
      });
    });

    it('should invalidate transaction queries', async () => {
      const { result } = renderHook(() => useQueryInvalidation());

      const chain = ethereumChain;
      const hash = '0xabcdef0123456789012345678901234567890123456789012345678901234567';

      await act(async () => {
        await result.current.invalidateTransaction(chain, hash);
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.transaction.detail(hash),
      });
    });

    it('should invalidate custom query patterns', async () => {
      const { result } = renderHook(() => useQueryInvalidation());

      const customKey = ['walletmesh', 'custom', 'data'];

      await act(async () => {
        await result.current.invalidateCustom(customKey);
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: customKey,
      });
    });
  });
});

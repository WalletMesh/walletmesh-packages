import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createTestWrapper } from '../test-utils/testHelpers.js';
import { useWalletCapabilities } from './useWalletCapabilities.js';

import { ChainType } from '@walletmesh/modal-core';

// Mock useWalletTransport
vi.mock('./useWalletTransport.js', () => ({
  useWalletTransport: () => ({
    transport: null,
    isAvailable: false,
  }),
}));

describe('useWalletCapabilities - Simplified', () => {
  it('should return null capabilities when transport is not available', () => {
    const { wrapper } = createTestWrapper();

    const { result } = renderHook(() => useWalletCapabilities(), { wrapper });

    expect(result.current.capabilities).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return false for all support checks when no capabilities', () => {
    const { wrapper } = createTestWrapper();

    const { result } = renderHook(() => useWalletCapabilities(), { wrapper });

    expect(result.current.supportsChain(ChainType.Evm)).toBe(false);
    expect(result.current.supportsChain(ChainType.Aztec)).toBe(false);
    expect(result.current.supportsChain(ChainType.Solana)).toBe(false);
    expect(result.current.supportsMethod('eth_accounts')).toBe(false);
    expect(result.current.supportsChainId('1')).toBe(false);
  });

  it('should provide helper functions', () => {
    const { wrapper } = createTestWrapper();

    const { result } = renderHook(() => useWalletCapabilities(), { wrapper });

    expect(typeof result.current.supportsChain).toBe('function');
    expect(typeof result.current.supportsMethod).toBe('function');
    expect(typeof result.current.supportsChain).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });
});

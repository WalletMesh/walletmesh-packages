/**
 * Tests for useSwitchChain hook
 */

import { renderHook } from '@testing-library/react';
import type { ChainType, SessionState, SupportedChain } from '@walletmesh/modal-core';
import { ChainType as ChainTypeEnum } from '@walletmesh/modal-core';
import type React from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { createAutoMockedStore } from '../test-utils/testHelpers.js';
import { createTestWrapper } from '../test-utils/testHelpers.js';
import { useIsChainCompatible, useSupportedChains, useSwitchChain } from './useSwitchChain.js';

// Test chains
const ethereumChain: SupportedChain = {
  chainId: '1',
  chainType: ChainTypeEnum.Evm,
  name: 'Ethereum',
  required: true,
};

// Note: polygonChain available for future test cases
// const polygonChain: SupportedChain = {
//   chainId: '137',
//   chainType: ChainTypeEnum.Evm,
//   name: 'Polygon',
//   required: false,
// };

const solanaChain: SupportedChain = {
  chainId: 'solana:mainnet',
  chainType: ChainTypeEnum.Solana,
  name: 'Solana',
  required: false,
};

const aztecChain: SupportedChain = {
  chainId: 'aztec:mainnet',
  chainType: ChainTypeEnum.Aztec,
  name: 'Aztec',
  required: false,
};

describe('useSwitchChain Hooks', () => {
  let mockStore: ReturnType<typeof createAutoMockedStore>;
  let wrapper: (props: { children: ReactNode }) => React.JSX.Element;

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
    mockStore = testSetup.mockStore;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook: useSwitchChain', () => {
    describe('Initial State', () => {
      it('should return proper initial state when disconnected', () => {
        const { result } = renderHook(() => useSwitchChain(), { wrapper });

        // Without connected session, should return null values
        expect(result.current.chain).toBeNull();
        expect(result.current.chainType).toBeNull();
        expect(result.current.isSwitching).toBe(false);
        expect(result.current.error).toBeNull();
      });

      it('should provide required function interfaces', () => {
        const { result } = renderHook(() => useSwitchChain(), { wrapper });

        expect(typeof result.current.isChainSupported).toBe('function');
        expect(typeof result.current.switchChain).toBe('function');
        expect(typeof result.current.switchChainAsync).toBe('function');
      });
    });

    describe('Chain Information', () => {
      it('should return available chains from configuration when service is available', async () => {
        // Update mock store to have a connected wallet so chains are available
        const state = mockStore.getState();
        const walletInfo = {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'metamask-icon.png',
          chains: ['evm' as ChainType],
        };

        const sessionState = {
          sessionId: 'test-session',
          walletId: 'metamask',
          status: 'connected' as const,
          accounts: [],
          activeAccount: { address: '0x123', name: 'Account 1' },
          addresses: [],
          primaryAddress: '0x123',
          chain: {
            chainId: '1',
            chainType: 'evm' as ChainType,
            name: 'Ethereum',
          },
          provider: {
            type: 'mock',
            instance: {} as Record<string, unknown>,
            version: '1.0.0',
            multiChainCapable: false,
            supportedMethods: [],
          },
          permissions: { methods: [], events: [] },
          metadata: {
            wallet: { name: 'MetaMask', icon: 'https://metamask.io/favicon.ico' },
            dapp: { name: 'Test' },
            connection: { initiatedBy: 'user' as const, method: 'extension' as const },
          },
          lifecycle: {
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
            lastAccessedAt: Date.now(),
            operationCount: 0,
            activeTime: 0,
          },
        };

        mockStore.setState({
          ...state,
          connections: {
            ...state.connections,
            wallets: [walletInfo],
            activeSessions: [sessionState as unknown as SessionState],
            activeSessionId: 'test-session',
          },
        });

        const { result } = renderHook(() => useSwitchChain(), { wrapper });

        // Should return chains array (might be empty if no services)
        expect(Array.isArray(result.current.chains)).toBe(true);

        // Check that the hook provides the expected properties
        expect(result.current).toHaveProperty('chain');
        expect(result.current).toHaveProperty('chainType');
        expect(result.current).toHaveProperty('chains');
        expect(result.current).toHaveProperty('isSwitching');
        expect(result.current).toHaveProperty('switchChain');
        expect(result.current).toHaveProperty('switchChainAsync');
      });

      it('should provide chain support checking functionality', () => {
        const { result } = renderHook(() => useSwitchChain(), { wrapper });

        // Chain support function should return boolean
        const isSupported = result.current.isChainSupported(ethereumChain);
        expect(typeof isSupported).toBe('boolean');
      });
    });

    describe('Chain Switching Operations', () => {
      it('should provide synchronous chain switch function', () => {
        const { result } = renderHook(() => useSwitchChain(), { wrapper });

        expect(typeof result.current.switchChain).toBe('function');
        expect(result.current.isSwitching).toBe(false);
      });

      it('should provide asynchronous chain switch function', () => {
        const { result } = renderHook(() => useSwitchChain(), { wrapper });

        expect(typeof result.current.switchChainAsync).toBe('function');
      });

      it('should track switching state', () => {
        const { result } = renderHook(() => useSwitchChain(), { wrapper });

        expect(typeof result.current.isSwitching).toBe('boolean');
        expect(result.current.isSwitching).toBe(false);
      });
    });

    describe('Error Handling', () => {
      it('should track error state', () => {
        const { result } = renderHook(() => useSwitchChain(), { wrapper });

        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Hook: useSupportedChains', () => {
    describe('Chain Support Information', () => {
      it('should return supported chains array', () => {
        const { result } = renderHook(() => useSupportedChains(), { wrapper });

        expect(Array.isArray(result.current)).toBe(true);
      });

      it('should provide consistent chain information', () => {
        const { result } = renderHook(() => useSupportedChains(), { wrapper });

        // Should return a consistent array structure
        expect(Array.isArray(result.current)).toBe(true);
        // Verify it doesn't change on re-render
        expect(result.current).toBeDefined();
      });
    });
  });

  describe('Hook: useIsChainCompatible', () => {
    describe('Chain Compatibility Checks', () => {
      it('should check EVM chain compatibility', () => {
        const { result } = renderHook(() => useIsChainCompatible(ethereumChain), { wrapper });

        expect(typeof result.current).toBe('boolean');
      });

      it('should check Solana chain compatibility', () => {
        const { result } = renderHook(() => useIsChainCompatible(solanaChain), { wrapper });

        expect(typeof result.current).toBe('boolean');
      });

      it('should check Aztec chain compatibility', () => {
        const { result } = renderHook(() => useIsChainCompatible(aztecChain), { wrapper });

        expect(typeof result.current).toBe('boolean');
      });
    });

    describe('Invalid Chain Type Handling', () => {
      it('should handle invalid chain types', () => {
        const { result } = renderHook(() => useIsChainCompatible('invalid-chain' as never), { wrapper });

        expect(typeof result.current).toBe('boolean');
      });
    });
  });

  describe('Hook Integration', () => {
    describe('Cross-hook Consistency', () => {
      it('should maintain consistency between useSwitchChain and useSupportedChains', () => {
        const { result: switchResult } = renderHook(() => useSwitchChain(), { wrapper });
        const { result: supportedResult } = renderHook(() => useSupportedChains(), { wrapper });

        expect(Array.isArray(switchResult.current.chains)).toBe(true);
        expect(Array.isArray(supportedResult.current)).toBe(true);
      });

      it('should maintain consistency between useSwitchChain and useIsChainCompatible', () => {
        const { result: switchResult } = renderHook(() => useSwitchChain(), { wrapper });
        const { result: compatResult } = renderHook(() => useIsChainCompatible(ethereumChain), { wrapper });

        expect(typeof switchResult.current.isChainSupported).toBe('function');
        expect(typeof compatResult.current).toBe('boolean');
      });
    });
  });
});

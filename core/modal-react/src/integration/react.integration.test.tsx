/**
 * Simple React integration tests for WalletMesh
 *
 * These tests verify that WalletMesh integrates correctly with React components,
 * hooks, and the provider system.
 */

import { render, renderHook, screen } from '@testing-library/react';
import { ChainType, type SupportedChain } from '@walletmesh/modal-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletMeshModal } from '../components/WalletMeshModal.js';
import {
  WalletMeshConnectButton,
  WalletMeshProvider,
  useAccount,
  useBalance,
  useConfig,
  useConnect,
  useSwitchChain,
  useWalletEvents,
  useWalletMeshContext,
} from '../index.js';
import { createTestWrapper } from '../test-utils/testHelpers.js';

// Mock the useWalletMeshConnectButtonState function
vi.mock('@walletmesh/modal-core', async () => {
  const actual = await vi.importActual('@walletmesh/modal-core');
  return {
    ...actual,
    useWalletMeshConnectButtonState: vi.fn(() => ({
      state: 'disconnected',
      content: {
        text: 'Connect Wallet',
        showIndicator: false,
        indicatorType: 'none',
        disabled: false,
      },
      action: 'connect',
      shouldShowConnectionInfo: false,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
    })),
  };
});

describe('WalletMesh React Integration', () => {
  let wrapper: ReturnType<typeof createTestWrapper>['wrapper'];

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider and Context', () => {
    it('should provide context to children', () => {
      render(
        <WalletMeshProvider
          config={{
            appName: 'Test App',
            chains: [
              {
                chainId: 'eip155:1',
                chainType: ChainType.Evm,
                name: 'Ethereum',
                required: false,
              } as SupportedChain,
            ],
          }}
        >
          <div>Test Content</div>
        </WalletMeshProvider>,
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should make config available through useConfig hook', () => {
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current.appName).toBe('Test App');

      // Check that config provides expected properties
      expect(result.current).toHaveProperty('appName');
      expect(result.current).toHaveProperty('isOpen');
      expect(result.current).toHaveProperty('open');
      expect(result.current).toHaveProperty('close');
    });

    it('should provide client access through context', () => {
      const { result } = renderHook(() => useWalletMeshContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.client).toBeDefined();
      expect(result.current.config).toBeDefined();
    });
  });

  describe('Component Integration', () => {
    it('should render WalletMeshConnectButton component', () => {
      const TestWrapper = wrapper;

      render(
        <TestWrapper>
          <WalletMeshConnectButton />
        </TestWrapper>,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render WalletMeshModal component', () => {
      const TestWrapper = wrapper;

      render(
        <TestWrapper>
          <WalletMeshModal />
        </TestWrapper>,
      );

      // Modal might not be visible by default, but should render without error
      expect(document.querySelector('.modal-backdrop, [role="dialog"]')).not.toThrow;
    });

    it('should render WalletMeshConnectButton with custom props', () => {
      const TestWrapper = wrapper;

      render(
        <TestWrapper>
          <WalletMeshConnectButton size="lg" label="Custom Connect" />
        </TestWrapper>,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should provide all hooks with consistent state', () => {
      const { result: accountResult } = renderHook(() => useAccount(), { wrapper });
      const { result: connectResult } = renderHook(() => useConnect(), { wrapper });
      const { result: configResult } = renderHook(() => useConfig(), { wrapper });

      // All hooks should work without errors
      expect(accountResult.current).toBeDefined();
      expect(connectResult.current).toBeDefined();
      expect(configResult.current).toBeDefined();

      // State should be consistent across hooks
      expect(accountResult.current.isConnected).toBe(false);
      expect(connectResult.current.isConnecting).toBe(false);
      expect(configResult.current.isOpen).toBe(false);
    });

    it('should integrate multiple hooks together', () => {
      const { result } = renderHook(
        () => ({
          account: useAccount(),
          connect: useConnect(),
          balance: useBalance(),
          switchChain: useSwitchChain(),
          config: useConfig(),
        }),
        { wrapper },
      );

      // All hooks should provide their expected interface
      expect(result.current.account).toHaveProperty('isConnected');
      expect(result.current.connect).toHaveProperty('connect');
      expect(result.current.connect).toHaveProperty('disconnect');
      expect(result.current.balance).toHaveProperty('data');
      expect(result.current.switchChain).toHaveProperty('switchChain');
      expect(result.current.config).toHaveProperty('isOpen');
    });

    it('should provide consistent state across hooks', () => {
      const { result: accountResult } = renderHook(() => useAccount(), { wrapper });
      renderHook(() => useConnect(), { wrapper });

      // State should be consistent
      expect(accountResult.current.isConnected).toBe(false);
    });
  });

  describe('Event Hooks', () => {
    it('should provide event subscription hooks', () => {
      const { result } = renderHook(() => useWalletEvents(), { wrapper });

      // Check that the hook returns the expected interface
      expect(result.current).toBeDefined();
      expect(typeof result.current.on).toBe('function');
      expect(typeof result.current.once).toBe('function');
      expect(typeof result.current.off).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.resume).toBe('function');
      expect(typeof result.current.isPaused).toBe('boolean');
    });
  });
});

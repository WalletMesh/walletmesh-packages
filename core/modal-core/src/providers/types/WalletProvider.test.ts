/**
 * Tests for Wallet Provider Types
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import { ConnectionState } from '../../types.js';
import {
  type BaseWalletProvider,
  type ChainType,
  type CommonConnectOptions,
  type CommonWalletEventMap,
  type ConnectionInfo,
  ConnectionStateManager,
  type ProviderMetadata,
  type WalletProvider,
  WalletProviderError,
  createMockConnectionInfo,
  getChainType,
  hasCapability,
  isProviderType,
  isWalletProvider,
} from './WalletProvider.js';

// Install domain-specific matchers
installCustomMatchers();

describe('Wallet Provider Types', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });
  describe('ConnectionState enum', () => {
    it('should have correct values', () => {
      expect(ConnectionState.Disconnected).toBe('disconnected');
      expect(ConnectionState.Connecting).toBe('connecting');
      expect(ConnectionState.Connected).toBe('connected');
      expect(ConnectionState.Disconnecting).toBe('disconnecting');
      expect(ConnectionState.Error).toBe('error');
    });
  });

  describe('WalletProviderError', () => {
    it('should create error with message and code', () => {
      const error = new WalletProviderError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('WalletProviderError');
      expect(error.chainType).toBeUndefined();
      expect(error.data).toBeUndefined();
      expect(error instanceof Error).toBe(true);
    });

    it('should create error with all parameters', () => {
      const errorData = { detail: 'Additional info' };
      const error = new WalletProviderError('Test error', 'TEST_CODE', 'evm', errorData);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.chainType).toBe('evm');
      expect(error.data).toEqual(errorData);
    });

    it('should handle undefined chainType correctly', () => {
      const error = new WalletProviderError('Test error', 'TEST_CODE', undefined);
      expect(error.chainType).toBeUndefined();
    });
  });

  describe('ConnectionStateManager', () => {
    let manager: ConnectionStateManager;

    beforeEach(async () => {
      await testEnv.setup();
      manager = new ConnectionStateManager();
    });

    it('should initialize with disconnected state', () => {
      expect(manager.getState()).toBe(ConnectionState.Disconnected);
      expect(manager.isDisconnected()).toBe(true);
      expect(manager.isConnected()).toBe(false);
      expect(manager.isConnecting()).toBe(false);
      expect(manager.isError()).toBe(false);
    });

    it('should update state and notify listeners', () => {
      const listener = vi.fn();
      manager.onStateChange(listener);

      manager.setState(ConnectionState.Connecting);

      expect(manager.getState()).toBe(ConnectionState.Connecting);
      expect(manager.isConnecting()).toBe(true);
      expect(listener).toHaveBeenCalledWith(ConnectionState.Connecting, ConnectionState.Disconnected);
    });

    it('should not notify listeners when state does not change', () => {
      const listener = vi.fn();
      manager.onStateChange(listener);

      manager.setState(ConnectionState.Disconnected); // Same as initial

      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      manager.onStateChange(listener1);
      manager.onStateChange(listener2);

      manager.setState(ConnectionState.Connected);

      expect(listener1).toHaveBeenCalledOnce();
      expect(listener2).toHaveBeenCalledOnce();
    });

    it('should remove listeners correctly', () => {
      const listener = vi.fn();
      const unsubscribe = manager.onStateChange(listener);

      unsubscribe();
      manager.setState(ConnectionState.Connected);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      manager.onStateChange(errorListener);
      manager.onStateChange(goodListener);

      manager.setState(ConnectionState.Connected);

      expect(consoleSpy).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should check specific states correctly', () => {
      manager.setState(ConnectionState.Connected);
      expect(manager.isInState(ConnectionState.Connected)).toBe(true);
      expect(manager.isInState(ConnectionState.Disconnected)).toBe(false);

      manager.setState(ConnectionState.Error);
      expect(manager.isError()).toBe(true);
      expect(manager.isConnected()).toBe(false);
    });
  });

  describe('isWalletProvider', () => {
    it('should return true for valid wallet provider', () => {
      const mockProvider = {
        isWalletMesh: true,
        providerType: 'evm',
        walletId: 'test-wallet',
        metadata: { name: 'Test', icon: 'test.png' },
        connectionState: ConnectionState.Disconnected,
        connectionInfo: null,
        connect: () => Promise.resolve({} as ConnectionInfo),
        disconnect: () => Promise.resolve(),
        getConnectionState: () => ConnectionState.Disconnected,
        getConnectionInfo: () => null,
        isAvailable: () => true,
        destroy: () => Promise.resolve(),
        on: () => {},
        once: () => {},
        removeListener: () => {},
        off: () => {},
        emit: () => true,
      };

      expect(isWalletProvider(mockProvider)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isWalletProvider(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isWalletProvider(undefined)).toBe(false);
    });

    it('should return false for objects without isWalletMesh', () => {
      const invalidProvider = {
        providerType: 'evm',
      };
      expect(isWalletProvider(invalidProvider)).toBe(false);
    });

    it('should return false for objects with wrong isWalletMesh value', () => {
      const invalidProvider = {
        isWalletMesh: false,
        providerType: 'evm',
      };
      expect(isWalletProvider(invalidProvider)).toBe(false);
    });

    it('should return false for objects without providerType', () => {
      const invalidProvider = {
        isWalletMesh: true,
      };
      expect(isWalletProvider(invalidProvider)).toBe(false);
    });

    it('should return false for objects with non-string providerType', () => {
      const invalidProvider = {
        isWalletMesh: true,
        providerType: 123,
      };
      expect(isWalletProvider(invalidProvider)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isWalletProvider('string')).toBe(false);
      expect(isWalletProvider(123)).toBe(false);
      expect(isWalletProvider(true)).toBe(false);
    });
  });

  describe('isProviderType', () => {
    it('should return true for matching provider type', () => {
      const provider = {
        providerType: 'evm' as const,
        isWalletMesh: true as const,
      } as WalletProvider;

      expect(isProviderType(provider, 'evm')).toBe(true);
    });

    it('should return false for non-matching provider type', () => {
      const provider = {
        providerType: 'evm' as const,
        isWalletMesh: true as const,
      } as WalletProvider;

      expect(isProviderType(provider, 'solana')).toBe(false);
      expect(isProviderType(provider, 'aztec')).toBe(false);
    });
  });

  describe('getChainType', () => {
    it('should return provider type', () => {
      const provider = {
        providerType: 'solana' as const,
        isWalletMesh: true as const,
      } as WalletProvider;

      expect(getChainType(provider)).toBe('solana');
    });
  });

  describe('hasCapability', () => {
    it('should return true for providers with getCapabilities method', () => {
      const provider = {
        providerType: 'evm' as const,
        isWalletMesh: true as const,
        getCapabilities: () => Promise.resolve({}),
      } as WalletProvider;

      expect(hasCapability(provider, 'test-capability')).toBe(true);
    });

    it('should return false for providers without getCapabilities method', () => {
      const provider = {
        providerType: 'evm' as const,
        isWalletMesh: true as const,
      } as WalletProvider;

      expect(hasCapability(provider, 'test-capability')).toBe(false);
    });

    it('should return false for providers with non-function getCapabilities', () => {
      const provider = {
        providerType: 'evm' as const,
        isWalletMesh: true as const,
        getCapabilities: 'not a function',
      } as Partial<WalletProvider> as WalletProvider;

      expect(hasCapability(provider, 'test-capability')).toBe(false);
    });
  });

  describe('createMockConnectionInfo', () => {
    it('should create connection info with defaults', () => {
      const connectionInfo = createMockConnectionInfo('evm');

      expect(connectionInfo.state).toBe(ConnectionState.Connected);
      expect(connectionInfo.accounts).toEqual([]);
      expect(connectionInfo.chainId).toBe('1');
      expect(typeof connectionInfo.connectedAt).toBe('number');
      expect(typeof connectionInfo.lastActivityAt).toBe('number');
    });

    it('should create connection info with custom values', () => {
      const accounts = ['0x123', '0x456'];
      const chainId = '137';
      const connectionInfo = createMockConnectionInfo('evm', accounts, chainId);

      expect(connectionInfo.state).toBe(ConnectionState.Connected);
      expect(connectionInfo.accounts).toEqual(accounts);
      expect(connectionInfo.chainId).toBe(chainId);
    });

    it('should create connection info with numeric chainId', () => {
      const connectionInfo = createMockConnectionInfo('solana', [], 101);

      expect(connectionInfo.chainId).toBe(101);
    });
  });

  describe('Type definitions', () => {
    it('should properly type ConnectionInfo', () => {
      const connectionInfo: ConnectionInfo = {
        state: ConnectionState.Connected,
        accounts: ['0x123', '0x456'],
        chainId: '1',
        connectedAt: Date.now(),
        lastActivityAt: Date.now(),
      };

      expect(connectionInfo.state).toBe(ConnectionState.Connected);
      expect(connectionInfo.accounts).toHaveLength(2);
      expect(typeof connectionInfo.chainId).toBe('string');
    });

    it('should properly type ProviderMetadata', () => {
      const metadata: ProviderMetadata = {
        name: 'Test Wallet',
        icon: 'test.png',
        description: 'A test wallet provider',
        homepage: 'https://testwallet.com',
        supportedChains: ['ethereum', 'polygon'],
        version: '1.0.0',
      };

      expect(metadata.name).toBe('Test Wallet');
      expect(metadata.supportedChains).toHaveLength(2);
      expect(metadata.version).toBe('1.0.0');
    });

    it('should properly type CommonConnectOptions', () => {
      const options: CommonConnectOptions = {
        timeout: 30000,
        showUI: true,
        preferredAccounts: ['0x123', '0x456'],
      };

      expect(options.timeout).toBe(30000);
      expect(options.showUI).toBe(true);
      expect(options.preferredAccounts).toHaveLength(2);
    });

    it('should properly type BaseWalletProvider interface', () => {
      // This test verifies that the interface structure is correctly typed
      const mockProvider: Partial<BaseWalletProvider> = {
        providerType: 'evm',
        walletId: 'test-wallet',
        metadata: {
          name: 'Test Wallet',
          icon: 'test.png',
        },
        isWalletMesh: true,
        connectionState: ConnectionState.Disconnected,
        connectionInfo: null,
      };

      expect(mockProvider.providerType).toBe('evm');
      expect(mockProvider.isWalletMesh).toBe(true);
      expect(mockProvider.connectionState).toBe(ConnectionState.Disconnected);
    });

    it('should properly type CommonWalletEventMap', () => {
      // Test that event map is properly typed
      const eventHandler: CommonWalletEventMap['connectionStateChanged'] = (state, previousState) => {
        expect(typeof state).toBe('string');
        expect(typeof previousState).toBe('string');
      };

      const errorHandler: CommonWalletEventMap['error'] = (error) => {
        expect(error instanceof WalletProviderError).toBe(true);
      };

      const readyHandler: CommonWalletEventMap['ready'] = () => {
        // Ready handler with no parameters
      };

      const destroyedHandler: CommonWalletEventMap['destroyed'] = () => {
        // Destroyed handler with no parameters
      };

      // Test that handlers are properly typed
      eventHandler(ConnectionState.Connected, ConnectionState.Connecting);
      errorHandler(new WalletProviderError('Test', 'CODE'));
      readyHandler();
      destroyedHandler();
    });

    it('should properly type ChainType', () => {
      const evmType: ChainType = 'evm';
      const solanaType: ChainType = 'solana';
      const aztecType: ChainType = 'aztec';

      expect(evmType).toBe('evm');
      expect(solanaType).toBe('solana');
      expect(aztecType).toBe('aztec');
    });
  });
});

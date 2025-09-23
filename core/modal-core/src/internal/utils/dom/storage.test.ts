/**
 * Tests for storage.ts
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment } from '../../../testing/index.js';
import { Logger } from '../../core/logger/logger.js';
import { type StorageConfig, StorageKey, WalletStorage, type WalletStorageState } from './storage.js';

// Mock localStorage
const localStorageMock = {
  data: new Map<string, string>(),
  getItem: vi.fn((key: string) => localStorageMock.data.get(key) || null),
  setItem: vi.fn((key: string, value: string) => localStorageMock.data.set(key, value)),
  removeItem: vi.fn((key: string) => localStorageMock.data.delete(key)),
  clear: vi.fn(() => localStorageMock.data.clear()),
  get length() {
    return localStorageMock.data.size;
  },
  key: vi.fn((index: number) => Array.from(localStorageMock.data.keys())[index] || null),
};

describe('storage utilities', () => {
  let storage: WalletStorage;

  // Use centralized test setup pattern with localStorage mock
  const testEnv = createTestEnvironment({
    customSetup: () => {
      // Setup global localStorage mock
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
    },
    customTeardown: () => {
      // Clean up localStorage mock data
      localStorageMock.data.clear();
    },
  });
  let logger: Logger;
  let loggerErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await testEnv.setup();
    logger = new Logger(true, 'StorageTest');
    storage = new WalletStorage({}, logger);
    loggerErrorSpy = vi.spyOn(logger, 'error');
  });

  afterEach(async () => {
    loggerErrorSpy.mockRestore();
    await testEnv.teardown();
  });

  describe('StorageKey enum', () => {
    it('should have all expected storage keys', () => {
      expect(StorageKey.State).toBe('walletState');
      expect(StorageKey.Connector).toBe('lastConnector');
      expect(StorageKey.Provider).toBe('lastProvider');
    });

    it('should have unique values', () => {
      const values = Object.values(StorageKey);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('WalletStorage constructor', () => {
    it('should use default prefix when none provided', () => {
      const defaultStorage = new WalletStorage({}, logger);
      defaultStorage.saveLastConnector('test');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('walletmesh_lastConnector', 'test');
    });

    it('should use custom prefix when provided', () => {
      const config: StorageConfig = { prefix: 'custom_' };
      const customStorage = new WalletStorage(config, logger);
      customStorage.saveLastConnector('test');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('custom_lastConnector', 'test');
    });

    it('should handle empty config object', () => {
      const emptyConfigStorage = new WalletStorage({}, logger);
      emptyConfigStorage.saveLastConnector('test');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('walletmesh_lastConnector', 'test');
    });

    it('should handle undefined prefix in config', () => {
      const undefinedPrefixStorage = new WalletStorage({}, logger);
      undefinedPrefixStorage.saveLastConnector('test');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('walletmesh_lastConnector', 'test');
    });
  });

  describe('saveState and getState', () => {
    it('should save and retrieve wallet state', () => {
      const state: Partial<WalletStorageState> = {
        walletId: 'metamask',
        chainId: '1',
        isConnected: true,
      };

      storage.saveState(state);
      const retrievedState = storage.getState();

      expect(retrievedState).toEqual(state);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('walletmesh_walletState', JSON.stringify(state));
    });

    it('should merge with existing state when saving', () => {
      const initialState: Partial<WalletStorageState> = {
        walletId: 'metamask',
        chainId: '1',
      };

      const additionalState: Partial<WalletStorageState> = {
        isConnected: true,
        accounts: ['0x123'],
      };

      storage.saveState(initialState);
      storage.saveState(additionalState);

      const finalState = storage.getState();
      expect(finalState).toEqual({
        ...initialState,
        ...additionalState,
      });
    });

    it('should override existing properties when saving', () => {
      storage.saveState({ walletId: 'metamask', chainId: '1' });
      storage.saveState({ walletId: 'walletconnect' });

      const state = storage.getState();
      expect(state).toEqual({
        walletId: 'walletconnect',
        chainId: '1',
      });
    });

    it('should return null when no state exists', () => {
      const state = storage.getState();
      expect(state).toBeNull();
    });

    it('should handle complex nested objects', () => {
      const complexState: Partial<WalletStorageState> = {
        walletId: 'metamask',
        metadata: {
          version: '1.0.0',
          features: ['signing', 'encryption'],
          config: {
            autoConnect: true,
            retries: 3,
          },
        },
        history: [
          { action: 'connect', timestamp: Date.now() },
          { action: 'sign', timestamp: Date.now() + 1000 },
        ],
      };

      storage.saveState(complexState);
      const retrievedState = storage.getState();

      expect(retrievedState).toEqual(complexState);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      storage.saveState({ walletId: 'test' });

      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to save wallet state:', expect.any(Error));
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      const state = storage.getState();

      expect(state).toBeNull();
      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to get wallet state:', expect.any(Error));
    });
  });

  describe('saveLastConnector and getLastConnector', () => {
    it('should save and retrieve last connector', () => {
      const connectorId = 'metamask';

      storage.saveLastConnector(connectorId);
      const retrievedConnector = storage.getLastConnector();

      expect(retrievedConnector).toBe(connectorId);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('walletmesh_lastConnector', connectorId);
    });

    it('should return null when no connector is saved', () => {
      const connector = storage.getLastConnector();
      expect(connector).toBeNull();
    });

    it('should handle different connector types', () => {
      const connectors = ['metamask', 'walletconnect', 'coinbase', 'trust-wallet'];

      for (const connectorId of connectors) {
        storage.saveLastConnector(connectorId);
        expect(storage.getLastConnector()).toBe(connectorId);
      }
    });

    it('should handle localStorage errors when saving connector', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      storage.saveLastConnector('metamask');

      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to save last connector:', expect.any(Error));
    });

    it('should handle localStorage errors when getting connector', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const connector = storage.getLastConnector();

      expect(connector).toBeNull();
      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to get last connector:', expect.any(Error));
    });
  });

  describe('saveLastProvider and getLastProvider', () => {
    it('should save and retrieve last provider', () => {
      const providerType = 'eip1193';

      storage.saveLastProvider(providerType);
      const retrievedProvider = storage.getLastProvider();

      expect(retrievedProvider).toBe(providerType);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('walletmesh_lastProvider', providerType);
    });

    it('should return null when no provider is saved', () => {
      const provider = storage.getLastProvider();
      expect(provider).toBeNull();
    });

    it('should handle different provider types', () => {
      const providers = ['eip1193', 'solana-wallet-standard', 'legacy', 'custom'];

      for (const providerType of providers) {
        storage.saveLastProvider(providerType);
        expect(storage.getLastProvider()).toBe(providerType);
      }
    });

    it('should handle localStorage errors when saving provider', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      storage.saveLastProvider('eip1193');

      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to save last provider:', expect.any(Error));
    });

    it('should handle localStorage errors when getting provider', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const provider = storage.getLastProvider();

      expect(provider).toBeNull();
      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to get last provider:', expect.any(Error));
    });
  });

  describe('clearAll', () => {
    it('should clear all stored data', () => {
      // Setup some data
      storage.saveState({ walletId: 'metamask' });
      storage.saveLastConnector('metamask');
      storage.saveLastProvider('eip1193');

      // Verify data exists
      expect(storage.getState()).not.toBeNull();
      expect(storage.getLastConnector()).not.toBeNull();
      expect(storage.getLastProvider()).not.toBeNull();

      // Clear all data
      storage.clearAll();

      // Verify all data is cleared
      expect(storage.getState()).toBeNull();
      expect(storage.getLastConnector()).toBeNull();
      expect(storage.getLastProvider()).toBeNull();
    });

    it('should call removeItem for all storage keys', () => {
      storage.clearAll();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('walletmesh_walletState');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('walletmesh_lastConnector');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('walletmesh_lastProvider');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('walletmesh_adapterSession');
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(4);
    });

    it('should handle localStorage errors when clearing', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      storage.clearAll();

      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to clear wallet storage:', expect.any(Error));
    });

    it('should work with custom prefix', () => {
      const customStorage = new WalletStorage({ prefix: 'custom_' }, logger);
      customStorage.clearAll();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('custom_walletState');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('custom_lastConnector');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('custom_lastProvider');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('custom_adapterSession');
    });
  });

  describe('integration scenarios', () => {
    it('should handle full wallet lifecycle', () => {
      // Initial connection
      storage.saveLastConnector('metamask');
      storage.saveLastProvider('eip1193');
      storage.saveState({
        walletId: 'metamask',
        chainId: '1',
        accounts: ['0x123'],
        isConnected: true,
      });

      // Verify initial state
      expect(storage.getLastConnector()).toBe('metamask');
      expect(storage.getLastProvider()).toBe('eip1193');
      expect(storage.getState()).toEqual({
        walletId: 'metamask',
        chainId: '1',
        accounts: ['0x123'],
        isConnected: true,
      });

      // Chain switch
      storage.saveState({ chainId: '137' });
      expect(storage.getState()?.['chainId']).toBe('137');

      // Account change
      storage.saveState({ accounts: ['0x456'] });
      expect(storage.getState()?.['accounts']).toEqual(['0x456']);

      // Disconnect
      storage.saveState({ isConnected: false });
      expect(storage.getState()?.['isConnected']).toBe(false);

      // Clear all data
      storage.clearAll();
      expect(storage.getState()).toBeNull();
      expect(storage.getLastConnector()).toBeNull();
      expect(storage.getLastProvider()).toBeNull();
    });

    it('should handle multiple storage instances with different prefixes', () => {
      const storage1 = new WalletStorage({ prefix: 'app1_' }, logger);
      const storage2 = new WalletStorage({ prefix: 'app2_' }, logger);

      storage1.saveLastConnector('metamask');
      storage2.saveLastConnector('walletconnect');

      expect(storage1.getLastConnector()).toBe('metamask');
      expect(storage2.getLastConnector()).toBe('walletconnect');

      storage1.clearAll();
      expect(storage1.getLastConnector()).toBeNull();
      expect(storage2.getLastConnector()).toBe('walletconnect');
    });

    it('should preserve data types through serialization', () => {
      const complexState: Partial<WalletStorageState> = {
        stringValue: 'test',
        numberValue: 42,
        booleanValue: true,
        nullValue: null,
        arrayValue: [1, 2, 3],
        objectValue: { nested: true },
      };

      storage.saveState(complexState);
      const retrievedState = storage.getState();

      expect(retrievedState).toEqual(complexState);
      expect(typeof retrievedState?.['stringValue']).toBe('string');
      expect(typeof retrievedState?.['numberValue']).toBe('number');
      expect(typeof retrievedState?.['booleanValue']).toBe('boolean');
      expect(retrievedState?.['nullValue']).toBeNull();
      expect(Array.isArray(retrievedState?.['arrayValue'])).toBe(true);
      expect(typeof retrievedState?.['objectValue']).toBe('object');
    });
  });
});

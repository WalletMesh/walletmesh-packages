import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Logger } from '../../core/logger/logger.js';
import { type StorageConfig, StorageKey, WalletStorage, type WalletStorageState } from './storage.ssr.js';

// Mock the environment module
vi.mock('../../../api/utils/environment.js', () => {
  const mockStorage = {
    data: new Map<string, string>(),
    getItem: vi.fn((key: string) => mockStorage.data.get(key) || null),
    setItem: vi.fn((key: string, value: string) => mockStorage.data.set(key, value)),
    removeItem: vi.fn((key: string) => mockStorage.data.delete(key)),
    clear: vi.fn(() => mockStorage.data.clear()),
  };

  return {
    safeLocalStorage: mockStorage,
  };
});

describe('WalletStorage', () => {
  let storage: WalletStorage;
  let mockLogger: Logger;
  let mockSafeLocalStorage: {
    data: Map<string, string>;
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    // Get the mocked module
    const { safeLocalStorage } = await import('../../../api/utils/environment.js');
    mockSafeLocalStorage = safeLocalStorage as typeof mockSafeLocalStorage;

    // Clear previous data
    mockSafeLocalStorage.data.clear();
    vi.clearAllMocks();

    // Create mock logger
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    // Create storage instance
    storage = new WalletStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('StorageKey enum', () => {
    it('should have correct storage key values', () => {
      expect(StorageKey.State).toBe('walletState');
      expect(StorageKey.Connector).toBe('lastConnector');
      expect(StorageKey.Provider).toBe('lastProvider');
    });
  });

  describe('Constructor', () => {
    it('should create storage with default prefix', () => {
      const defaultStorage = new WalletStorage();
      expect(defaultStorage).toBeInstanceOf(WalletStorage);
    });

    it('should create storage with custom prefix', () => {
      const customStorage = new WalletStorage({ prefix: 'custom_' });

      // Test that custom prefix is used
      customStorage.saveLastConnector('test-connector');
      expect(mockSafeLocalStorage.setItem).toHaveBeenCalledWith('custom_lastConnector', 'test-connector');
    });

    it('should create storage with logger', () => {
      const storageWithLogger = new WalletStorage({ logger: mockLogger });

      // Test that logger is used
      storageWithLogger.saveLastConnector('test-connector');
      expect(mockLogger.debug).toHaveBeenCalledWith('Last connector saved', {
        key: 'walletmesh_lastConnector',
        connectorId: 'test-connector',
      });
    });

    it('should handle empty config object', () => {
      const emptyConfigStorage = new WalletStorage({});
      expect(emptyConfigStorage).toBeInstanceOf(WalletStorage);
    });
  });

  describe('saveState', () => {
    beforeEach(() => {
      storage = new WalletStorage({ logger: mockLogger });
    });

    it('should save wallet state to storage', () => {
      const testState: Partial<WalletStorageState> = {
        connectedWallet: 'metamask',
        chainId: '0x1',
      };

      storage.saveState(testState);

      expect(mockSafeLocalStorage.setItem).toHaveBeenCalledWith(
        'walletmesh_walletState',
        JSON.stringify(testState),
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('Wallet state saved', {
        key: 'walletmesh_walletState',
        state: testState,
      });
    });

    it('should merge with existing state', () => {
      const existingState = { connectedWallet: 'metamask' };
      const newState = { chainId: '0x1' };
      const mergedState = { connectedWallet: 'metamask', chainId: '0x1' };

      // Set up existing state
      mockSafeLocalStorage.data.set('walletmesh_walletState', JSON.stringify(existingState));

      storage.saveState(newState);

      expect(mockSafeLocalStorage.setItem).toHaveBeenCalledWith(
        'walletmesh_walletState',
        JSON.stringify(mergedState),
      );
    });

    it('should handle storage errors gracefully', () => {
      mockSafeLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => storage.saveState({ test: 'data' })).not.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to save wallet state:', expect.any(Error));
    });

    it('should handle null existing state', () => {
      mockSafeLocalStorage.getItem.mockReturnValueOnce(null);

      const testState = { connectedWallet: 'metamask' };
      storage.saveState(testState);

      expect(mockSafeLocalStorage.setItem).toHaveBeenCalledWith(
        'walletmesh_walletState',
        JSON.stringify(testState),
      );
    });
  });

  describe('getState', () => {
    beforeEach(() => {
      storage = new WalletStorage({ logger: mockLogger });
    });

    it('should retrieve wallet state from storage', () => {
      const testState = { connectedWallet: 'metamask', chainId: '0x1' };
      mockSafeLocalStorage.data.set('walletmesh_walletState', JSON.stringify(testState));

      const result = storage.getState();

      expect(result).toEqual(testState);
      expect(mockSafeLocalStorage.getItem).toHaveBeenCalledWith('walletmesh_walletState');
      expect(mockLogger.debug).toHaveBeenCalledWith('Wallet state retrieved', {
        key: 'walletmesh_walletState',
        state: testState,
      });
    });

    it('should return null when no state is stored', () => {
      mockSafeLocalStorage.getItem.mockReturnValueOnce(null);

      const result = storage.getState();

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', () => {
      mockSafeLocalStorage.getItem.mockReturnValueOnce('invalid-json');

      const result = storage.getState();

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get wallet state:', expect.any(Error));
    });

    it('should handle storage errors gracefully', () => {
      mockSafeLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });

      const result = storage.getState();

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get wallet state:', expect.any(Error));
    });
  });

  describe('saveLastConnector', () => {
    beforeEach(() => {
      storage = new WalletStorage({ logger: mockLogger });
    });

    it('should save last connector ID', () => {
      storage.saveLastConnector('metamask');

      expect(mockSafeLocalStorage.setItem).toHaveBeenCalledWith('walletmesh_lastConnector', 'metamask');
      expect(mockLogger.debug).toHaveBeenCalledWith('Last connector saved', {
        key: 'walletmesh_lastConnector',
        connectorId: 'metamask',
      });
    });

    it('should handle storage errors gracefully', () => {
      mockSafeLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => storage.saveLastConnector('metamask')).not.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to save last connector:', expect.any(Error));
    });
  });

  describe('getLastConnector', () => {
    beforeEach(() => {
      storage = new WalletStorage({ logger: mockLogger });
    });

    it('should retrieve last connector ID', () => {
      mockSafeLocalStorage.data.set('walletmesh_lastConnector', 'metamask');

      const result = storage.getLastConnector();

      expect(result).toBe('metamask');
      expect(mockSafeLocalStorage.getItem).toHaveBeenCalledWith('walletmesh_lastConnector');
      expect(mockLogger.debug).toHaveBeenCalledWith('Last connector retrieved', {
        key: 'walletmesh_lastConnector',
        connectorId: 'metamask',
      });
    });

    it('should return null when no connector is stored', () => {
      mockSafeLocalStorage.getItem.mockReturnValueOnce(null);

      const result = storage.getLastConnector();

      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', () => {
      mockSafeLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = storage.getLastConnector();

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get last connector:', expect.any(Error));
    });
  });

  describe('saveLastProvider', () => {
    beforeEach(() => {
      storage = new WalletStorage({ logger: mockLogger });
    });

    it('should save last provider type', () => {
      storage.saveLastProvider('eip1193');

      expect(mockSafeLocalStorage.setItem).toHaveBeenCalledWith('walletmesh_lastProvider', 'eip1193');
      expect(mockLogger.debug).toHaveBeenCalledWith('Last provider saved', {
        key: 'walletmesh_lastProvider',
        providerType: 'eip1193',
      });
    });

    it('should handle storage errors gracefully', () => {
      mockSafeLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => storage.saveLastProvider('eip1193')).not.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to save last provider:', expect.any(Error));
    });
  });

  describe('getLastProvider', () => {
    beforeEach(() => {
      storage = new WalletStorage({ logger: mockLogger });
    });

    it('should retrieve last provider type', () => {
      mockSafeLocalStorage.data.set('walletmesh_lastProvider', 'eip1193');

      const result = storage.getLastProvider();

      expect(result).toBe('eip1193');
      expect(mockSafeLocalStorage.getItem).toHaveBeenCalledWith('walletmesh_lastProvider');
      expect(mockLogger.debug).toHaveBeenCalledWith('Last provider retrieved', {
        key: 'walletmesh_lastProvider',
        providerType: 'eip1193',
      });
    });

    it('should return null when no provider is stored', () => {
      mockSafeLocalStorage.getItem.mockReturnValueOnce(null);

      const result = storage.getLastProvider();

      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', () => {
      mockSafeLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = storage.getLastProvider();

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get last provider:', expect.any(Error));
    });
  });

  describe('clearAll', () => {
    beforeEach(() => {
      storage = new WalletStorage({ logger: mockLogger });
    });

    it('should clear all stored wallet data', () => {
      // Set up some data
      mockSafeLocalStorage.data.set('walletmesh_walletState', '{"test": "data"}');
      mockSafeLocalStorage.data.set('walletmesh_lastConnector', 'metamask');
      mockSafeLocalStorage.data.set('walletmesh_lastProvider', 'eip1193');

      storage.clearAll();

      // Check that all storage keys are removed
      expect(mockSafeLocalStorage.removeItem).toHaveBeenCalledWith('walletmesh_walletState');
      expect(mockSafeLocalStorage.removeItem).toHaveBeenCalledWith('walletmesh_lastConnector');
      expect(mockSafeLocalStorage.removeItem).toHaveBeenCalledWith('walletmesh_lastProvider');
      expect(mockLogger.debug).toHaveBeenCalledWith('All wallet storage cleared');
    });

    it('should handle storage errors gracefully', () => {
      mockSafeLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => storage.clearAll()).not.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to clear wallet storage:', expect.any(Error));
    });
  });

  describe('isAvailable', () => {
    it('should return true when storage is available', () => {
      const result = storage.isAvailable();

      expect(result).toBe(true);
      expect(mockSafeLocalStorage.setItem).toHaveBeenCalledWith('walletmesh__test', 'test');
      expect(mockSafeLocalStorage.getItem).toHaveBeenCalledWith('walletmesh__test');
      expect(mockSafeLocalStorage.removeItem).toHaveBeenCalledWith('walletmesh__test');
    });

    it('should return false when storage throws on setItem', () => {
      mockSafeLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = storage.isAvailable();

      expect(result).toBe(false);
    });

    it('should return false when storage throws on getItem', () => {
      mockSafeLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });

      const result = storage.isAvailable();

      expect(result).toBe(false);
    });

    it('should return false when storage throws on removeItem', () => {
      mockSafeLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = storage.isAvailable();

      expect(result).toBe(false);
    });

    it('should return false when retrieved value does not match', () => {
      mockSafeLocalStorage.getItem.mockReturnValueOnce('wrong-value');

      const result = storage.isAvailable();

      expect(result).toBe(false);
    });

    it('should use custom prefix in test key', () => {
      const customStorage = new WalletStorage({ prefix: 'custom_' });

      customStorage.isAvailable();

      expect(mockSafeLocalStorage.setItem).toHaveBeenCalledWith('custom__test', 'test');
      expect(mockSafeLocalStorage.getItem).toHaveBeenCalledWith('custom__test');
      expect(mockSafeLocalStorage.removeItem).toHaveBeenCalledWith('custom__test');
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle complex state objects', () => {
      const complexState: WalletStorageState = {
        wallets: {
          metamask: { address: '0x123', chainId: '0x1' },
          phantom: { address: 'Sol123', chainId: 'solana-mainnet' },
        },
        preferences: {
          theme: 'dark',
          autoConnect: true,
        },
        metadata: {
          lastConnected: Date.now(),
          version: '1.0.0',
        },
      };

      storage = new WalletStorage({ logger: mockLogger });
      storage.saveState(complexState);

      const retrieved = storage.getState();
      expect(retrieved).toEqual(complexState);
    });

    it('should handle state merging with nested objects', () => {
      const initialState = {
        wallets: { metamask: { address: '0x123' } },
        preferences: { theme: 'dark' },
      };
      const updateState = {
        wallets: { phantom: { address: 'Sol123' } },
        preferences: { autoConnect: true },
      };

      // Set initial state
      mockSafeLocalStorage.data.set('walletmesh_walletState', JSON.stringify(initialState));

      storage = new WalletStorage();
      storage.saveState(updateState);

      const expectedMerged = {
        wallets: { phantom: { address: 'Sol123' } }, // Object replacement, not merge
        preferences: { autoConnect: true }, // Object replacement, not merge
      };

      const retrieved = storage.getState();
      expect(retrieved).toEqual(expectedMerged);
    });

    it('should work without logger', () => {
      const storageWithoutLogger = new WalletStorage();

      expect(() => {
        storageWithoutLogger.saveState({ test: 'data' });
        storageWithoutLogger.getState();
        storageWithoutLogger.saveLastConnector('metamask');
        storageWithoutLogger.getLastConnector();
        storageWithoutLogger.saveLastProvider('eip1193');
        storageWithoutLogger.getLastProvider();
        storageWithoutLogger.clearAll();
        storageWithoutLogger.isAvailable();
      }).not.toThrow();
    });

    it('should handle empty string values correctly', () => {
      storage = new WalletStorage();

      // Store empty strings
      storage.saveLastConnector('');
      storage.saveLastProvider('');

      // Mock localStorage to return empty strings instead of null
      mockSafeLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'walletmesh_lastConnector' || key === 'walletmesh_lastProvider') {
          return '';
        }
        return mockSafeLocalStorage.data.get(key) || null;
      });

      expect(storage.getLastConnector()).toBe('');
      expect(storage.getLastProvider()).toBe('');

      // Reset mock behavior
      mockSafeLocalStorage.getItem.mockImplementation(
        (key: string) => mockSafeLocalStorage.data.get(key) || null,
      );
    });

    it('should handle special characters in stored values', () => {
      const specialState = {
        unicode: '🦄🌈✨',
        json: '{"nested": "value"}',
        html: '<script>alert("test")</script>',
        newlines: 'line1\nline2\r\nline3',
      };

      storage = new WalletStorage();
      storage.saveState(specialState);

      const retrieved = storage.getState();
      expect(retrieved).toEqual(specialState);
    });
  });
});

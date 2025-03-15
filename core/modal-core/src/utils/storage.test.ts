import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletStorage, StorageKey } from './storage.js';
import { ChainType } from '../types/chains.js';
import { ProviderInterface } from '../types/providers.js';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.localStorage
vi.stubGlobal('localStorage', mockLocalStorage);

// Mock console.error to suppress error messages in tests
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('WalletStorage', () => {
  let storage: WalletStorage;
  const prefix = 'test_';

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new WalletStorage({ prefix });
  });

  describe('State Management', () => {
    it('should save and load state correctly', () => {
      const state = {
        status: 'connected' as const,
        activeConnector: 'test-wallet',
        activeChain: ChainType.ETHEREUM,
        activeProviderInterface: ProviderInterface.EIP1193,
        accounts: ['0x123'],
        error: null,
      };

      storage.saveState(state);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `${prefix}${StorageKey.STATE}`,
        JSON.stringify(state),
      );

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(state));
      const loadedState = storage.getState();
      expect(loadedState).toEqual(state);
    });

    it('should merge with existing state when saving', () => {
      const existingState = { status: 'connected' as const };
      const newState = { accounts: ['0x123'] };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingState));
      storage.saveState(newState);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `${prefix}${StorageKey.STATE}`,
        JSON.stringify({ ...existingState, ...newState }),
      );
    });

    it('should handle invalid state data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      const state = storage.getState();
      expect(state).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Failed to get wallet state:', expect.any(Error));
    });

    it('should handle missing state data', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const state = storage.getState();
      expect(state).toBeNull();
    });

    it('should handle storage errors when saving', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      storage.saveState({ accounts: ['0x123'] });
      expect(console.error).toHaveBeenCalledWith('Failed to save wallet state:', expect.any(Error));
    });
  });

  describe('Connector Management', () => {
    it('should save and load last connector', () => {
      const connectorId = 'test-connector';
      storage.saveLastConnector(connectorId);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(`${prefix}${StorageKey.CONNECTOR}`, connectorId);

      mockLocalStorage.getItem.mockReturnValue(connectorId);
      const loaded = storage.getLastConnector();
      expect(loaded).toBe(connectorId);
    });

    it('should return null for missing connector', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const connector = storage.getLastConnector();
      expect(connector).toBeNull();
    });

    it('should handle storage errors when getting connector', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const connector = storage.getLastConnector();
      expect(connector).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Failed to get last connector:', expect.any(Error));
    });

    it('should handle storage errors when saving connector', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      storage.saveLastConnector('test');
      expect(console.error).toHaveBeenCalledWith('Failed to save last connector:', expect.any(Error));
    });
  });

  describe('Provider Management', () => {
    it('should save and load last provider', () => {
      const provider = ProviderInterface.EIP1193;
      storage.saveLastProvider(provider);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(`${prefix}${StorageKey.PROVIDER}`, provider);

      mockLocalStorage.getItem.mockReturnValue(provider);
      const loaded = storage.getLastProvider();
      expect(loaded).toBe(provider);
    });

    it('should return null for missing provider', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const provider = storage.getLastProvider();
      expect(provider).toBeNull();
    });

    it('should handle storage errors when getting provider', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const provider = storage.getLastProvider();
      expect(provider).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Failed to get last provider:', expect.any(Error));
    });

    it('should handle storage errors when saving provider', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      storage.saveLastProvider(ProviderInterface.EIP1193);
      expect(console.error).toHaveBeenCalledWith('Failed to save last provider:', expect.any(Error));
    });
  });

  describe('Storage Operations', () => {
    it('should clear all storage values', () => {
      storage.clearAll();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`${prefix}${StorageKey.STATE}`);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`${prefix}${StorageKey.CONNECTOR}`);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`${prefix}${StorageKey.PROVIDER}`);
    });

    it('should handle clear with no prefix', () => {
      const noPrefixStorage = new WalletStorage();
      noPrefixStorage.clearAll();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`walletmesh_${StorageKey.STATE}`);
    });

    it('should handle storage errors during clear', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      storage.clearAll();
      expect(console.error).toHaveBeenCalledWith('Failed to clear wallet storage:', expect.any(Error));
    });
  });
});

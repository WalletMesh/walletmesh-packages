import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockServiceDependencies } from '../../testing/index.js';
import type { WalletInfo } from '../../types.js';
import { WalletPreferenceService } from './WalletPreferenceService.js';
import type { WalletPreferenceServiceConfig, WalletPreferences } from './types.js';

describe('WalletPreferenceService', () => {
  let service: WalletPreferenceService;
  let mockLocalStorage: Storage;
  let dependencies: ReturnType<typeof createMockServiceDependencies>;

  const mockWallet: WalletInfo = {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'https://metamask.io/icon.png',
  };

  const mockWallet2: WalletInfo = {
    id: 'walletconnect',
    name: 'WalletConnect',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    dependencies = createMockServiceDependencies();

    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    service = new WalletPreferenceService(dependencies);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Configuration', () => {
    it('should initialize with default settings', () => {
      // We can't access config directly, but we can test the behavior
      // Default max history is 5 based on the implementation
      for (let i = 0; i < 6; i++) {
        service.addToHistory(`wallet${i}`, { id: `wallet${i}`, name: `Wallet ${i}` });
      }

      const history = service.getWalletHistory();
      expect(history).toHaveLength(5); // Default maxHistoryEntries is 5
    });

    it('should configure with custom settings', () => {
      const customConfig: Partial<WalletPreferenceServiceConfig> = {
        maxHistoryEntries: 3,
        enableAutoConnect: false,
      };

      service.configure(customConfig);

      // Test max history entries
      for (let i = 0; i < 5; i++) {
        service.addToHistory(`wallet${i}`, { id: `wallet${i}`, name: `Wallet ${i}` });
      }
      expect(service.getWalletHistory()).toHaveLength(3);

      // Test auto-connect disabled
      service.setAutoConnect('metamask', true);
      expect(service.isAutoConnectEnabled('metamask')).toBe(false);
    });

    it('should load preferences from storage on configure when persistence enabled', () => {
      const storedPreferences = JSON.stringify({ metamask: { autoConnect: true } });

      mockLocalStorage.getItem = vi.fn().mockImplementation((key) => {
        if (key === 'walletmesh:preferences') return storedPreferences;
        if (key === 'walletmesh:recent-wallets') return '[]';
        return null;
      });

      service.configure({ enablePersistence: true });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('walletmesh:preferences');
      expect(service.getWalletPreference('metamask').autoConnect).toBe(true);
    });

    it('should not load from storage when persistence disabled', () => {
      service.configure({ enablePersistence: false });

      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });

    it('should handle malformed data in storage gracefully', () => {
      mockLocalStorage.getItem = vi.fn().mockReturnValue('invalid json');

      expect(() => service.configure({ enablePersistence: true })).not.toThrow();
      expect(service.getAllPreferences()).toEqual({});
    });
  });

  describe('Cleanup', () => {
    it('should save to storage on cleanup when persistence enabled', () => {
      service.configure({ enablePersistence: true });
      service.setAutoConnect('metamask', true);

      service.cleanup();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'walletmesh:preferences',
        expect.stringContaining('metamask'),
      );
    });

    it('should not save to storage on cleanup when persistence disabled', () => {
      service.configure({ enablePersistence: false });
      service.setAutoConnect('metamask', true);

      service.cleanup();

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle storage errors during cleanup gracefully', () => {
      service.configure({ enablePersistence: true });
      mockLocalStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => service.cleanup()).not.toThrow();
    });
  });

  describe('Wallet Preferences', () => {
    beforeEach(() => {
      service.configure({ enablePersistence: false });
    });

    it('should get all preferences as a copy', () => {
      service.setAutoConnect('metamask', true);

      const preferences = service.getAllPreferences();
      expect(preferences.metamask?.autoConnect).toBe(true);

      // getAllPreferences returns a shallow copy of the top-level object,
      // but the individual preference objects are still references.
      // Modifying the returned object should affect the internal state.
      if (preferences.metamask) {
        preferences.metamask.autoConnect = false;
      }
      expect(service.getWalletPreference('metamask').autoConnect).toBe(false);

      // However, getWalletPreference returns a deep copy, so modifying
      // its result should not affect the internal state.
      const singlePreference = service.getWalletPreference('metamask');
      singlePreference.autoConnect = true;
      expect(service.getWalletPreference('metamask').autoConnect).toBe(false);
    });

    it('should get specific wallet preference', () => {
      service.setAutoConnect('metamask', true);

      const preference = service.getWalletPreference('metamask');
      expect(preference.autoConnect).toBe(true);
    });

    it('should return empty object for non-existent wallet preference', () => {
      const preference = service.getWalletPreference('nonexistent');
      expect(preference).toEqual({});
    });

    describe('Auto-connect management', () => {
      it('should set auto-connect for a wallet', () => {
        service.setAutoConnect('metamask', true);

        expect(service.isAutoConnectEnabled('metamask')).toBe(true);
      });

      it('should allow multiple wallets to have auto-connect enabled', () => {
        service.setAutoConnect('metamask', true);
        service.setAutoConnect('walletconnect', true);

        expect(service.isAutoConnectEnabled('metamask')).toBe(true);
        expect(service.isAutoConnectEnabled('walletconnect')).toBe(true);
      });

      it('should disable auto-connect', () => {
        service.setAutoConnect('metamask', true);
        service.setAutoConnect('metamask', false);

        expect(service.isAutoConnectEnabled('metamask')).toBe(false);
      });

      it('should get preferred wallet for auto-connect', () => {
        service.setAutoConnect('metamask', true);

        expect(service.getPreferredWallet()).toBe('metamask');
      });

      it('should return null when no wallet has auto-connect enabled', () => {
        expect(service.getPreferredWallet()).toBeNull();
      });

      it('should respect global auto-connect setting', () => {
        service.configure({ enableAutoConnect: false });
        service.setAutoConnect('metamask', true);

        expect(service.getPreferredWallet()).toBeNull();
      });
    });

    it('should update wallet preference with partial data', () => {
      service.setAutoConnect('metamask', true);
      service.updateWalletPreference('metamask', { autoConnect: false });

      expect(service.isAutoConnectEnabled('metamask')).toBe(false);
    });

    it('should create new preference when updating non-existent wallet', () => {
      service.updateWalletPreference('newwallet', { autoConnect: true });

      expect(service.isAutoConnectEnabled('newwallet')).toBe(true);
    });

    it('should clear wallet preference', () => {
      service.setAutoConnect('metamask', true);
      service.clearWalletPreference('metamask');

      expect(service.getWalletPreference('metamask')).toEqual({});
    });

    it('should clear all preferences', () => {
      service.setAutoConnect('metamask', true);
      service.setAutoConnect('walletconnect', true);

      service.clearAllPreferences();

      expect(service.getAllPreferences()).toEqual({});
      expect(service.getPreferredWallet()).toBeNull();
    });
  });

  describe('History Management', () => {
    beforeEach(() => {
      service.configure({ enablePersistence: false, maxHistoryEntries: 5 });
    });

    it('should add wallet to history', () => {
      service.addToHistory('metamask', mockWallet);

      const history = service.getWalletHistory();
      expect(history).toHaveLength(1);
      expect(history[0].walletId).toBe('metamask');
      expect(history[0].wallet).toEqual({
        id: mockWallet.id,
        name: mockWallet.name,
        icon: mockWallet.icon,
      });
      expect(history[0].usageCount).toBe(1);
    });

    it('should increment usage count for existing wallet', () => {
      service.addToHistory('metamask', mockWallet);
      service.addToHistory('metamask', mockWallet);

      const history = service.getWalletHistory();
      expect(history[0].usageCount).toBe(2);
    });

    it('should update timestamp on repeated usage', () => {
      const firstTime = Date.now();
      vi.setSystemTime(firstTime);
      service.addToHistory('metamask', mockWallet);

      const laterTime = firstTime + 1000;
      vi.setSystemTime(laterTime);
      service.addToHistory('metamask', mockWallet);

      const history = service.getWalletHistory();
      expect(history[0].lastUsed).toBe(laterTime);
    });

    it('should maintain history order by usage', () => {
      service.addToHistory('metamask', mockWallet);
      service.addToHistory('walletconnect', mockWallet2);
      service.addToHistory('metamask', mockWallet); // Use metamask again

      const recentIds = service.getRecentWalletIds();
      expect(recentIds[0]).toBe('metamask'); // Most recently used first
    });

    it('should limit history entries to configured maximum', () => {
      // Add 6 wallets when max is 5
      for (let i = 0; i < 6; i++) {
        service.addToHistory(`wallet${i}`, { id: `wallet${i}`, name: `Wallet ${i}` });
      }

      const history = service.getWalletHistory();
      expect(history).toHaveLength(5);
      expect(history.find((h) => h.walletId === 'wallet0')).toBeUndefined(); // Oldest should be removed
    });

    it('should remove wallet from history', () => {
      service.addToHistory('metamask', mockWallet);
      service.addToHistory('walletconnect', mockWallet2);

      service.removeFromHistory('metamask');

      const history = service.getWalletHistory();
      expect(history).toHaveLength(1);
      expect(history[0].walletId).toBe('walletconnect');
    });

    it('should clear all history', () => {
      service.addToHistory('metamask', mockWallet);
      service.addToHistory('walletconnect', mockWallet2);

      service.clearHistory();

      expect(service.getWalletHistory()).toHaveLength(0);
      expect(service.getRecentWalletIds()).toHaveLength(0);
    });

    it('should get recent wallet IDs in usage order', () => {
      // Add wallets in sequence
      service.addToHistory('wallet1', { id: 'wallet1', name: 'Wallet 1' });
      service.addToHistory('wallet2', { id: 'wallet2', name: 'Wallet 2' });
      service.addToHistory('wallet3', { id: 'wallet3', name: 'Wallet 3' });

      // Use wallet1 again to make it most recent
      service.addToHistory('wallet1', { id: 'wallet1', name: 'Wallet 1' });

      const recentIds = service.getRecentWalletIds();
      expect(recentIds).toEqual(['wallet1', 'wallet3', 'wallet2']);
    });

    it('should get most used wallet', () => {
      service.addToHistory('metamask', mockWallet);
      service.addToHistory('walletconnect', mockWallet2);
      service.addToHistory('metamask', mockWallet); // metamask used twice

      expect(service.getMostUsedWallet()).toBe('metamask');
    });

    it('should return null when no history exists', () => {
      expect(service.getMostUsedWallet()).toBeNull();
    });

    it('should handle tie in usage count by returning most recent', () => {
      const time1 = Date.now();
      vi.setSystemTime(time1);
      service.addToHistory('metamask', mockWallet);

      const time2 = time1 + 1000;
      vi.setSystemTime(time2);
      service.addToHistory('walletconnect', mockWallet2);

      // Both have usage count of 1, walletconnect is more recent
      expect(service.getMostUsedWallet()).toBe('walletconnect');
    });
  });

  describe('Storage Operations', () => {
    it('should handle localStorage being unavailable', () => {
      Object.defineProperty(globalThis, 'localStorage', {
        value: undefined,
        writable: true,
      });

      service.configure({ enablePersistence: true });
      service.setAutoConnect('metamask', true);

      // Should not throw even though localStorage is unavailable
      expect(() => service.cleanup()).not.toThrow();
    });

    it('should handle storage quota exceeded error', () => {
      mockLocalStorage.setItem = vi.fn().mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      service.configure({ enablePersistence: true });
      service.setAutoConnect('metamask', true);

      expect(() => service.cleanup()).not.toThrow();
    });

    it('should handle corrupted data in storage', () => {
      mockLocalStorage.getItem = vi.fn().mockReturnValue('{"malformed": json}');

      expect(() => service.configure({ enablePersistence: true })).not.toThrow();
      expect(service.getAllPreferences()).toEqual({});
    });

    it('should save and load complete preferences data', () => {
      const storage = new Map<string, string>();
      mockLocalStorage.setItem = vi.fn().mockImplementation((key, value) => {
        storage.set(key, value);
      });
      mockLocalStorage.getItem = vi.fn().mockImplementation((key) => {
        return storage.get(key) || null;
      });

      // Set up data
      service.configure({ enablePersistence: true });
      service.setAutoConnect('metamask', true);

      // Save
      service.cleanup();

      // Create new service instance and load
      const newService = new WalletPreferenceService(dependencies);
      newService.configure({ enablePersistence: true });

      expect(newService.isAutoConnectEnabled('metamask')).toBe(true);
    });
  });

  describe('Import/Export', () => {
    beforeEach(() => {
      service.configure({ enablePersistence: false });
    });

    it('should export preferences', () => {
      service.setAutoConnect('metamask', true);

      const exported = service.exportPreferences();

      expect(exported.metamask?.autoConnect).toBe(true);
    });

    it('should import preferences and replace existing data', () => {
      // Set up initial data
      service.setAutoConnect('metamask', true);

      // Import new data - only preferences, not history
      const importData: WalletPreferences = {
        walletconnect: { autoConnect: true },
      };

      service.importPreferences(importData);

      // Old data should be replaced
      expect(service.isAutoConnectEnabled('metamask')).toBe(false);
      expect(service.isAutoConnectEnabled('walletconnect')).toBe(true);
    });

    it('should handle partial import data', () => {
      const importData: WalletPreferences = {
        metamask: { autoConnect: true },
      };

      service.importPreferences(importData);

      expect(service.isAutoConnectEnabled('metamask')).toBe(true);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      service.configure({ enablePersistence: false });
    });

    it('should calculate storage statistics correctly', () => {
      service.setAutoConnect('metamask', true);
      service.setAutoConnect('walletconnect', true);
      service.addToHistory('metamask', mockWallet);
      service.addToHistory('walletconnect', mockWallet2);
      service.addToHistory('metamask', mockWallet); // Use metamask again

      const stats = service.getStorageStats();

      expect(stats.preferencesCount).toBe(2);
      expect(stats.historyCount).toBe(2);
      expect(stats.autoConnectWallets).toEqual(['metamask', 'walletconnect']);
      expect(stats.totalUsage).toBe(3); // metamask: 2, walletconnect: 1
    });

    it('should handle empty data gracefully', () => {
      const stats = service.getStorageStats();

      expect(stats.preferencesCount).toBe(0);
      expect(stats.historyCount).toBe(0);
      expect(stats.autoConnectWallets).toEqual([]);
      expect(stats.totalUsage).toBe(0);
    });

    it('should calculate statistics for single wallet', () => {
      service.addToHistory('metamask', mockWallet);
      service.addToHistory('metamask', mockWallet);
      service.setAutoConnect('metamask', true);

      const stats = service.getStorageStats();

      expect(stats.preferencesCount).toBe(1);
      expect(stats.historyCount).toBe(1);
      expect(stats.autoConnectWallets).toEqual(['metamask']);
      expect(stats.totalUsage).toBe(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined wallet IDs gracefully', () => {
      expect(() => service.setAutoConnect(null as string, true)).not.toThrow();
      expect(() => service.getWalletPreference(undefined as string)).not.toThrow();
      expect(() => service.addToHistory('', mockWallet)).not.toThrow();
    });

    it('should handle invalid wallet info gracefully', () => {
      expect(() => service.addToHistory('metamask', null as WalletInfo)).not.toThrow();
      expect(() => service.addToHistory('metamask', {} as WalletInfo)).not.toThrow();
    });

    it('should handle concurrent access patterns', () => {
      // Simulate concurrent modifications
      service.setAutoConnect('metamask', true);
      service.addToHistory('metamask', mockWallet);
      service.setAutoConnect('walletconnect', true);
      service.addToHistory('walletconnect', mockWallet2);

      expect(service.isAutoConnectEnabled('walletconnect')).toBe(true);
      expect(service.getWalletHistory()).toHaveLength(2);
    });

    it('should handle extremely large usage counts', () => {
      // Simulate heavy usage
      for (let i = 0; i < 1000; i++) {
        service.addToHistory('metamask', mockWallet);
      }

      const history = service.getWalletHistory();
      expect(history[0].usageCount).toBe(1000);
      expect(service.getMostUsedWallet()).toBe('metamask');
    });

    it('should handle storage key collisions gracefully', () => {
      // Configure with same storage key
      service.configure({ storageKey: 'test_key' });
      const service2 = new WalletPreferenceService(dependencies);
      service2.configure({ storageKey: 'test_key' });

      service.setAutoConnect('metamask', true);
      service2.setAutoConnect('walletconnect', true);

      // Both should work independently in memory
      expect(service.isAutoConnectEnabled('metamask')).toBe(true);
      expect(service2.isAutoConnectEnabled('walletconnect')).toBe(true);
    });
  });
});

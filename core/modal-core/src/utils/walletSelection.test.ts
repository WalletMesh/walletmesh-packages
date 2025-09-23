/**
 * Tests for wallet selection utilities
 *
 * @packageDocumentation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletPreferenceService } from '../services/preferences/WalletPreferenceService.js';
import type { ChainType, WalletInfo } from '../types.js';
import {
  DEFAULT_WALLET_PREFERENCE_KEY,
  type WalletRecommendationCriteria,
  clearWalletPreference,
  createEnhancedWalletSelectionManager,
  createWalletSelectionManager,
  filterWalletsByChain,
  getInstallUrl,
  getPreferredWallet,
  getRecommendedWallet,
  getRecommendedWalletWithHistory,
  getWalletsByUsageFrequency,
  getWalletsSortedByAvailability,
  isWalletInstalled,
  setPreferredWallet,
} from './walletSelection.js';

// Mock isBrowser to return true for most tests
vi.mock('../api/utils/environment.js', () => ({
  isBrowser: vi.fn(() => true),
}));

// Mock global window object for wallet detection
const mockWindow = {
  ethereum: undefined as unknown,
  phantom: undefined as unknown,
  solana: undefined as unknown,
  backpack: undefined as unknown,
  glow: undefined as unknown,
  solflare: undefined as unknown,
  exodus: undefined as unknown,
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('walletSelection', () => {
  // Sample wallet data for tests
  const mockWallets: WalletInfo[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      chains: ['evm' as ChainType],
      icon: 'metamask-icon.svg',
    },
    {
      id: 'phantom',
      name: 'Phantom',
      chains: ['solana' as ChainType],
      icon: 'phantom-icon.svg',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      chains: ['evm' as ChainType],
      icon: 'coinbase-icon.svg',
    },
    {
      id: 'multi-chain-wallet',
      name: 'Multi Chain Wallet',
      chains: ['evm' as ChainType, 'solana' as ChainType],
      icon: 'multi-icon.svg',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset window objects
    mockWindow.ethereum = undefined;
    mockWindow.phantom = undefined;
    mockWindow.solana = undefined;
    mockWindow.backpack = undefined;
    mockWindow.glow = undefined;
    mockWindow.solflare = undefined;
    mockWindow.exodus = undefined;

    // Reset localStorage mocks
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPreferredWallet', () => {
    it('should return stored wallet ID', () => {
      mockLocalStorage.getItem.mockReturnValue('metamask');

      const result = getPreferredWallet();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(DEFAULT_WALLET_PREFERENCE_KEY);
      expect(result).toBe('metamask');
    });

    it('should return null if no preference stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getPreferredWallet();

      expect(result).toBeNull();
    });

    it('should use custom storage key', () => {
      const customKey = 'my-wallet-key';
      mockLocalStorage.getItem.mockReturnValue('phantom');

      const result = getPreferredWallet(customKey);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(customKey);
      expect(result).toBe('phantom');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = getPreferredWallet();

      expect(result).toBeNull();
    });

    it('should return null in SSR environment', async () => {
      const { isBrowser } = await import('../api/utils/environment.js');
      vi.mocked(isBrowser).mockReturnValue(false);

      const result = getPreferredWallet();

      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });
  });

  describe('setPreferredWallet', () => {
    it('should store wallet ID', () => {
      setPreferredWallet('metamask');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(DEFAULT_WALLET_PREFERENCE_KEY, 'metamask');
    });

    it('should remove preference when walletId is null', () => {
      setPreferredWallet(null);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(DEFAULT_WALLET_PREFERENCE_KEY);
    });

    it('should use custom storage key', () => {
      const customKey = 'my-wallet-key';

      setPreferredWallet('phantom', customKey);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(customKey, 'phantom');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => setPreferredWallet('metamask')).not.toThrow();
    });

    it('should do nothing in SSR environment', async () => {
      const { isBrowser } = await import('../api/utils/environment.js');
      vi.mocked(isBrowser).mockReturnValue(false);

      setPreferredWallet('metamask');

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('clearWalletPreference', () => {
    it('should remove wallet preference', () => {
      clearWalletPreference();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(DEFAULT_WALLET_PREFERENCE_KEY);
    });

    it('should use custom storage key', () => {
      const customKey = 'my-wallet-key';

      clearWalletPreference(customKey);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(customKey);
    });
  });

  describe('getRecommendedWallet', () => {
    it('should return current wallet if still available', () => {
      const currentWallet = mockWallets[0]; // metamask

      const result = getRecommendedWallet(mockWallets, currentWallet);

      expect(result).toBe(currentWallet);
    });

    it('should return null if no wallets available', () => {
      const result = getRecommendedWallet([]);

      expect(result).toBeNull();
    });

    it('should return preferred wallet from storage', () => {
      mockLocalStorage.getItem.mockReturnValue('phantom');

      const result = getRecommendedWallet(mockWallets, null, { preferRecent: true });

      expect(result?.id).toBe('phantom');
    });

    it('should filter by required chains', () => {
      const criteria: WalletRecommendationCriteria = {
        requiredChains: ['solana' as ChainType],
      };

      const result = getRecommendedWallet(mockWallets, null, criteria);

      expect(result?.chains).toContain('solana');
      expect(['phantom', 'multi-chain-wallet']).toContain(result?.id);
    });

    it('should exclude specified wallets', () => {
      const criteria: WalletRecommendationCriteria = {
        excludeWallets: ['metamask', 'coinbase'],
      };

      const result = getRecommendedWallet(mockWallets, null, criteria);

      expect(result?.id).not.toBe('metamask');
      expect(result?.id).not.toBe('coinbase');
      expect(['phantom', 'multi-chain-wallet']).toContain(result?.id);
    });

    it('should prefer installed wallets', () => {
      // Mock MetaMask as installed
      mockWindow.ethereum = { isMetaMask: true };

      const criteria: WalletRecommendationCriteria = {
        preferInstalled: true,
      };

      const result = getRecommendedWallet(mockWallets, null, criteria);

      expect(result?.id).toBe('metamask');
    });

    it('should return first available wallet when no preferences', () => {
      const result = getRecommendedWallet(mockWallets);

      expect(result).toBe(mockWallets[0]);
    });

    it('should handle empty criteria', () => {
      const result = getRecommendedWallet(mockWallets, null, {});

      expect(result).toBe(mockWallets[0]);
    });
  });

  describe('getRecommendedWalletWithHistory', () => {
    const mockPreferenceService: WalletPreferenceService = {
      getPreferredWallet: vi.fn(),
      setPreferredWallet: vi.fn(),
      getMostUsedWallet: vi.fn(),
      getRecentWalletIds: vi.fn(),
      addToHistory: vi.fn(),
      getWalletHistory: vi.fn(),
      isAutoConnectEnabled: vi.fn(),
      setAutoConnect: vi.fn(),
      clearPreferences: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return current wallet if still available', () => {
      const currentWallet = mockWallets[0];

      const result = getRecommendedWalletWithHistory(mockWallets, currentWallet, {}, mockPreferenceService);

      expect(result).toBe(currentWallet);
    });

    it('should return auto-connect wallet from preference service', () => {
      vi.mocked(mockPreferenceService.getPreferredWallet).mockReturnValue('phantom');

      const result = getRecommendedWalletWithHistory(mockWallets, null, {}, mockPreferenceService);

      expect(result?.id).toBe('phantom');
    });

    it('should return most used wallet from preference service', () => {
      vi.mocked(mockPreferenceService.getPreferredWallet).mockReturnValue(null);
      vi.mocked(mockPreferenceService.getMostUsedWallet).mockReturnValue('coinbase');

      const result = getRecommendedWalletWithHistory(
        mockWallets,
        null,
        { preferRecent: true },
        mockPreferenceService,
      );

      expect(result?.id).toBe('coinbase');
    });

    it('should return recent wallet from history', () => {
      vi.mocked(mockPreferenceService.getPreferredWallet).mockReturnValue(null);
      vi.mocked(mockPreferenceService.getMostUsedWallet).mockReturnValue(null);
      vi.mocked(mockPreferenceService.getRecentWalletIds).mockReturnValue(['phantom', 'metamask']);

      const result = getRecommendedWalletWithHistory(
        mockWallets,
        null,
        { preferRecent: true },
        mockPreferenceService,
      );

      expect(result?.id).toBe('phantom');
    });

    it('should fallback to basic recommendation without service', () => {
      mockLocalStorage.getItem.mockReturnValue('metamask');

      const result = getRecommendedWalletWithHistory(mockWallets, null, { preferRecent: true });

      expect(result?.id).toBe('metamask');
    });

    it('should prefer installed wallets when no service history', () => {
      mockWindow.ethereum = { isMetaMask: true };

      const result = getRecommendedWalletWithHistory(mockWallets, null, { preferInstalled: true });

      expect(result?.id).toBe('metamask');
    });
  });

  describe('filterWalletsByChain', () => {
    it('should filter wallets by single chain type', () => {
      const result = filterWalletsByChain(mockWallets, ['evm' as ChainType]);

      expect(result).toHaveLength(3); // metamask, coinbase, multi-chain-wallet
      expect(result.every((w) => w.chains.includes('evm'))).toBe(true);
    });

    it('should filter wallets by multiple chain types', () => {
      const result = filterWalletsByChain(mockWallets, ['evm' as ChainType, 'solana' as ChainType]);

      expect(result).toHaveLength(1); // only multi-chain-wallet supports both
      expect(result[0]?.id).toBe('multi-chain-wallet');
    });

    it('should return all wallets when no chain types specified', () => {
      const result = filterWalletsByChain(mockWallets, []);

      expect(result).toEqual(mockWallets);
    });

    it('should return empty array when no wallets match', () => {
      const result = filterWalletsByChain(mockWallets, ['aztec' as ChainType]);

      expect(result).toEqual([]);
    });

    it('should handle wallets without chains property', () => {
      const walletsWithoutChains = [{ id: 'invalid-wallet', name: 'Invalid', icon: '' } as WalletInfo];

      const result = filterWalletsByChain(walletsWithoutChains, ['evm' as ChainType]);

      expect(result).toEqual([]);
    });
  });

  describe('getInstallUrl', () => {
    it('should return MetaMask install URL', () => {
      const url = getInstallUrl('metamask');
      expect(url).toBe('https://metamask.io/download/');
    });

    it('should return Phantom install URL', () => {
      const url = getInstallUrl('phantom');
      expect(url).toBe('https://phantom.app/download');
    });

    it('should return Coinbase install URL', () => {
      const url = getInstallUrl('coinbase');
      expect(url).toBe('https://www.coinbase.com/wallet');
    });

    it('should be case insensitive', () => {
      const url1 = getInstallUrl('MetaMask');
      const url2 = getInstallUrl('METAMASK');
      expect(url1).toBe('https://metamask.io/download/');
      expect(url2).toBe('https://metamask.io/download/');
    });

    it('should return null for unknown wallets', () => {
      const url = getInstallUrl('unknown-wallet');
      expect(url).toBeNull();
    });

    it('should handle empty wallet ID', () => {
      const url = getInstallUrl('');
      expect(url).toBeNull();
    });
  });

  describe('isWalletInstalled', () => {
    it('should detect MetaMask installation', () => {
      mockWindow.ethereum = { isMetaMask: true };
      const wallet = mockWallets.find((w) => w.id === 'metamask');
      if (!wallet) throw new Error('MetaMask wallet not found in mock data');

      const result = isWalletInstalled(wallet);

      expect(result).toBe(true);
    });

    it('should detect Phantom installation', () => {
      mockWindow.phantom = { solana: {} };
      const wallet = mockWallets.find((w) => w.id === 'phantom');
      if (!wallet) throw new Error('Phantom wallet not found in mock data');

      const result = isWalletInstalled(wallet);

      expect(result).toBe(true);
    });

    it('should detect Coinbase wallet installation', () => {
      mockWindow.ethereum = { isCoinbaseWallet: true };
      const wallet = mockWallets.find((w) => w.id === 'coinbase');
      if (!wallet) throw new Error('Coinbase wallet not found in mock data');

      const result = isWalletInstalled(wallet);

      expect(result).toBe(true);
    });

    it('should return false for uninstalled wallets', () => {
      const wallet = mockWallets.find((w) => w.id === 'metamask');
      if (!wallet) throw new Error('MetaMask wallet not found in mock data');

      const result = isWalletInstalled(wallet);

      expect(result).toBe(false);
    });

    it('should handle generic EVM wallet detection', () => {
      mockWindow.ethereum = {};
      const genericEvmWallet: WalletInfo = {
        id: 'generic-evm',
        name: 'Generic EVM',
        chains: ['evm' as ChainType],
        icon: '',
      };

      const result = isWalletInstalled(genericEvmWallet);

      expect(result).toBe(true);
    });

    it('should handle generic Solana wallet detection', () => {
      mockWindow.solana = {};
      const genericSolanaWallet: WalletInfo = {
        id: 'generic-solana',
        name: 'Generic Solana',
        chains: ['solana' as ChainType],
        icon: '',
      };

      const result = isWalletInstalled(genericSolanaWallet);

      expect(result).toBe(true);
    });

    it('should return false in SSR environment', async () => {
      const { isBrowser } = await import('../api/utils/environment.js');
      vi.mocked(isBrowser).mockReturnValue(false);

      const wallet = mockWallets[0];
      const result = isWalletInstalled(wallet);

      expect(result).toBe(false);
    });
  });

  describe('getWalletsSortedByAvailability', () => {
    it('should sort installed wallets first', () => {
      mockWindow.ethereum = { isMetaMask: true };
      mockWindow.phantom = { solana: {} };

      const result = getWalletsSortedByAvailability(mockWallets);

      // First three should be installed (metamask, phantom, multi-chain-wallet since it supports both evm and solana)
      expect(['metamask', 'phantom', 'multi-chain-wallet']).toContain(result[0]?.id);
      expect(['metamask', 'phantom', 'multi-chain-wallet']).toContain(result[1]?.id);
      expect(['metamask', 'phantom', 'multi-chain-wallet']).toContain(result[2]?.id);

      // Last one should be uninstalled (coinbase - requires specific detection)
      expect(result[3]?.id).toBe('coinbase');
    });

    it('should sort by name when availability is equal', () => {
      const result = getWalletsSortedByAvailability(mockWallets);

      // All uninstalled, should be sorted alphabetically
      const names = result.map((w) => w.name);
      expect(names).toEqual(['Coinbase Wallet', 'MetaMask', 'Multi Chain Wallet', 'Phantom']);
    });

    it('should not mutate original array', () => {
      const originalOrder = [...mockWallets];

      getWalletsSortedByAvailability(mockWallets);

      expect(mockWallets).toEqual(originalOrder);
    });
  });

  describe('getWalletsByUsageFrequency', () => {
    let mockPreferenceService: WalletPreferenceService;

    beforeEach(() => {
      mockPreferenceService = {
        getPreferredWallet: vi.fn(),
        setPreferredWallet: vi.fn(),
        getMostUsedWallet: vi.fn(),
        getRecentWalletIds: vi.fn(),
        addToHistory: vi.fn(),
        getWalletHistory: vi.fn().mockReturnValue([
          { walletId: 'phantom', usageCount: 5, lastUsed: new Date() },
          { walletId: 'metamask', usageCount: 3, lastUsed: new Date() },
          { walletId: 'coinbase', usageCount: 1, lastUsed: new Date() },
        ]),
        isAutoConnectEnabled: vi.fn(),
        setAutoConnect: vi.fn(),
        clearPreferences: vi.fn(),
      };
    });

    it('should sort wallets by usage frequency', () => {
      const result = getWalletsByUsageFrequency(mockWallets, mockPreferenceService);

      expect(result[0]?.id).toBe('phantom'); // 5 uses
      expect(result[1]?.id).toBe('metamask'); // 3 uses
      expect(result[2]?.id).toBe('coinbase'); // 1 use
      expect(result[3]?.id).toBe('multi-chain-wallet'); // 0 uses
    });

    it('should sort by name when usage is equal', () => {
      (mockPreferenceService.getWalletHistory as ReturnType<typeof vi.fn>).mockReturnValue([
        { walletId: 'phantom', usageCount: 1, lastUsed: new Date() },
        { walletId: 'metamask', usageCount: 1, lastUsed: new Date() },
      ]);

      const result = getWalletsByUsageFrequency(mockWallets, mockPreferenceService);

      // Equal usage, should sort by name
      expect(result[0]?.id).toBe('metamask'); // 'MetaMask' comes before 'Phantom'
      expect(result[1]?.id).toBe('phantom');
    });

    it('should return unchanged array when no preference service', () => {
      const result = getWalletsByUsageFrequency(mockWallets);

      expect(result).toEqual(mockWallets);
    });

    it('should not mutate original array', () => {
      const originalOrder = [...mockWallets];

      getWalletsByUsageFrequency(mockWallets, mockPreferenceService);

      expect(mockWallets).toEqual(originalOrder);
    });
  });

  describe('createWalletSelectionManager', () => {
    it('should create manager with all basic functions', () => {
      const manager = createWalletSelectionManager();

      expect(typeof manager.getPreferredWallet).toBe('function');
      expect(typeof manager.setPreferredWallet).toBe('function');
      expect(typeof manager.getRecommendedWallet).toBe('function');
      expect(typeof manager.filterWalletsByChain).toBe('function');
      expect(typeof manager.getInstallUrl).toBe('function');
      expect(typeof manager.isWalletInstalled).toBe('function');
      expect(typeof manager.clearPreference).toBe('function');
    });

    it('should delegate to individual functions', () => {
      const manager = createWalletSelectionManager();

      // Test some key functions
      expect(manager.getPreferredWallet()).toBeNull();
      expect(manager.getInstallUrl('metamask')).toBe('https://metamask.io/download/');

      const filtered = manager.filterWalletsByChain(mockWallets, ['evm' as ChainType]);
      expect(filtered.length).toBe(3);
    });
  });

  describe('createEnhancedWalletSelectionManager', () => {
    let mockPreferenceService: WalletPreferenceService;

    beforeEach(() => {
      mockPreferenceService = {
        getPreferredWallet: vi.fn(),
        setPreferredWallet: vi.fn(),
        getMostUsedWallet: vi.fn(),
        getRecentWalletIds: vi.fn(),
        addToHistory: vi.fn(),
        getWalletHistory: vi.fn().mockReturnValue([]),
        isAutoConnectEnabled: vi.fn().mockReturnValue(false),
        setAutoConnect: vi.fn(),
        clearPreferences: vi.fn(),
      };
    });

    it('should create enhanced manager with all functions', () => {
      const manager = createEnhancedWalletSelectionManager(mockPreferenceService);

      // Basic functions
      expect(typeof manager.getPreferredWallet).toBe('function');
      expect(typeof manager.setPreferredWallet).toBe('function');
      expect(typeof manager.getRecommendedWallet).toBe('function');

      // Enhanced functions
      expect(typeof manager.getRecommendedWalletWithHistory).toBe('function');
      expect(typeof manager.getWalletsByUsageFrequency).toBe('function');
      expect(typeof manager.recordWalletSelection).toBe('function');
      expect(typeof manager.shouldAutoConnect).toBe('function');
      expect(typeof manager.setAutoConnect).toBe('function');
    });

    it('should record wallet selection', () => {
      const manager = createEnhancedWalletSelectionManager(mockPreferenceService);
      const wallet = mockWallets[0];

      manager.recordWalletSelection('metamask', wallet);

      expect(mockPreferenceService.addToHistory).toHaveBeenCalledWith('metamask', wallet);
    });

    it('should check auto-connect status', () => {
      const manager = createEnhancedWalletSelectionManager(mockPreferenceService);

      const result = manager.shouldAutoConnect('metamask');

      expect(mockPreferenceService.isAutoConnectEnabled).toHaveBeenCalledWith('metamask');
      expect(result).toBe(false);
    });

    it('should set auto-connect preference', () => {
      const manager = createEnhancedWalletSelectionManager(mockPreferenceService);

      manager.setAutoConnect('metamask', true);

      expect(mockPreferenceService.setAutoConnect).toHaveBeenCalledWith('metamask', true);
    });

    it('should delegate enhanced recommendations', () => {
      vi.mocked(mockPreferenceService.getPreferredWallet).mockReturnValue('phantom');

      const manager = createEnhancedWalletSelectionManager(mockPreferenceService);

      const result = manager.getRecommendedWalletWithHistory(mockWallets);

      expect(result?.id).toBe('phantom');
    });
  });

  describe('DEFAULT_WALLET_PREFERENCE_KEY', () => {
    it('should have the expected value', () => {
      expect(DEFAULT_WALLET_PREFERENCE_KEY).toBe('walletmesh-preferred-wallet');
    });
  });

  describe('Integration tests', () => {
    it('should work end-to-end for wallet selection flow', () => {
      // Set up installed wallet
      mockWindow.ethereum = { isMetaMask: true };

      // Set up preference
      mockLocalStorage.getItem.mockReturnValue('metamask');

      const manager = createWalletSelectionManager();

      // Get preferred wallet
      const preferred = manager.getPreferredWallet();
      expect(preferred).toBe('metamask');

      // Check if installed
      const metamask = mockWallets.find((w) => w.id === 'metamask');
      if (!metamask) throw new Error('MetaMask wallet not found in mock data');
      expect(manager.isWalletInstalled(metamask)).toBe(true);

      // Get recommendation
      const recommended = manager.getRecommendedWallet(mockWallets, null, {
        preferRecent: true,
        preferInstalled: true,
      });
      expect(recommended?.id).toBe('metamask');

      // Filter by chain
      const evmWallets = manager.filterWalletsByChain(mockWallets, ['evm' as ChainType]);
      expect(evmWallets.length).toBe(3);
      expect(evmWallets.some((w) => w.id === 'metamask')).toBe(true);
    });

    it('should handle wallet installation and preference flow', () => {
      const manager = createWalletSelectionManager();

      // Initially no preference
      expect(manager.getPreferredWallet()).toBeNull();

      // Set preference
      manager.setPreferredWallet('phantom');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(DEFAULT_WALLET_PREFERENCE_KEY, 'phantom');

      // Mock as if stored
      mockLocalStorage.getItem.mockReturnValue('phantom');

      // Check preference
      expect(manager.getPreferredWallet()).toBe('phantom');

      // Clear preference
      manager.clearPreference();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(DEFAULT_WALLET_PREFERENCE_KEY);
    });
  });
});

/**
 * Wallet selection utilities for managing wallet preferences and recommendations
 *
 * Framework-agnostic utilities for wallet selection, filtering, and recommendation
 * algorithms that can be used across different UI frameworks.
 *
 * @module utils/walletSelection
 * @packageDocumentation
 * @since 3.0.0
 */

import { isBrowser } from '../api/utils/environment.js';
import { modalLogger } from '../internal/core/logger/globalLogger.js';
import type { WalletPreferenceService } from '../services/preferences/WalletPreferenceService.js';
import type { ChainType, WalletInfo } from '../types.js';

/**
 * Default storage key for wallet preferences
 */
export const DEFAULT_WALLET_PREFERENCE_KEY = 'walletmesh-preferred-wallet';

/**
 * Wallet selection manager interface
 */
export interface WalletSelectionManager {
  getPreferredWallet(storageKey?: string): string | null;
  setPreferredWallet(walletId: string | null, storageKey?: string): void;
  getRecommendedWallet(wallets: WalletInfo[], current?: WalletInfo | null): WalletInfo | null;
  filterWalletsByChain(wallets: WalletInfo[], chainTypes: ChainType[]): WalletInfo[];
  getInstallUrl(walletId: string): string | null;
  isWalletInstalled(wallet: WalletInfo): boolean;
  clearPreference(storageKey?: string): void;
}

/**
 * Enhanced wallet selection manager that integrates with WalletPreferenceService
 */
export interface EnhancedWalletSelectionManager extends WalletSelectionManager {
  getRecommendedWalletWithHistory(
    wallets: WalletInfo[],
    current?: WalletInfo | null,
    criteria?: WalletRecommendationCriteria,
  ): WalletInfo | null;
  getWalletsByUsageFrequency(wallets: WalletInfo[]): WalletInfo[];
  recordWalletSelection(walletId: string, wallet?: WalletInfo): void;
  shouldAutoConnect(walletId: string): boolean;
  setAutoConnect(walletId: string, enabled: boolean): void;
}

/**
 * Wallet recommendation criteria
 */
export interface WalletRecommendationCriteria {
  /** Prefer wallets that are already installed */
  preferInstalled?: boolean;
  /** Prefer wallets that were recently used */
  preferRecent?: boolean;
  /** Prefer wallets that support specific chains */
  requiredChains?: ChainType[];
  /** Exclude specific wallet IDs */
  excludeWallets?: string[];
  /** Maximum number of recommendations */
  maxRecommendations?: number;
}

/**
 * Get preferred wallet from storage
 *
 * @param storageKey - Storage key to use (default: 'walletmesh-preferred-wallet')
 * @returns Wallet ID if found, null otherwise
 *
 * @example
 * ```typescript
 * const preferredWalletId = getPreferredWallet();
 * if (preferredWalletId) {
 *   console.log('User prefers:', preferredWalletId);
 * }
 * ```
 *
 * @category Wallet Selection
 * @public
 */
export function getPreferredWallet(storageKey: string = DEFAULT_WALLET_PREFERENCE_KEY): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(storageKey);
    return stored || null;
  } catch (error) {
    modalLogger.warn('Failed to read preferred wallet from localStorage', error);
    return null;
  }
}

/**
 * Set preferred wallet in storage
 *
 * @param walletId - Wallet ID to store, or null to clear preference
 * @param storageKey - Storage key to use (default: 'walletmesh-preferred-wallet')
 *
 * @example
 * ```typescript
 * // Set preference
 * setPreferredWallet('metamask');
 *
 * // Clear preference
 * setPreferredWallet(null);
 * ```
 *
 * @category Wallet Selection
 * @public
 */
export function setPreferredWallet(
  walletId: string | null,
  storageKey: string = DEFAULT_WALLET_PREFERENCE_KEY,
): void {
  if (!isBrowser()) {
    return;
  }

  try {
    if (walletId) {
      localStorage.setItem(storageKey, walletId);
    } else {
      localStorage.removeItem(storageKey);
    }
  } catch (error) {
    modalLogger.warn('Failed to store preferred wallet in localStorage', error);
  }
}

/**
 * Clear wallet preference from storage
 *
 * @param storageKey - Storage key to use (default: 'walletmesh-preferred-wallet')
 *
 * @example
 * ```typescript
 * clearWalletPreference();
 * // Preference cleared
 * ```
 *
 * @category Wallet Selection
 * @public
 */
export function clearWalletPreference(storageKey: string = DEFAULT_WALLET_PREFERENCE_KEY): void {
  setPreferredWallet(null, storageKey);
}

/**
 * Get recommended wallet based on criteria
 *
 * Analyzes available wallets and returns the best recommendation based on:
 * - Installation status
 * - User preference
 * - Chain support
 * - Recent usage
 *
 * @param wallets - Available wallets to choose from
 * @param current - Currently selected wallet (if any)
 * @param criteria - Recommendation criteria
 * @returns Recommended wallet or null if none suitable
 *
 * @example
 * ```typescript
 * const recommended = getRecommendedWallet(wallets, null, {
 *   preferInstalled: true,
 *   requiredChains: ['evm']
 * });
 *
 * if (recommended) {
 *   console.log('We recommend:', recommended.name);
 * }
 * ```
 *
 * @category Wallet Selection
 * @public
 */
export function getRecommendedWallet(
  wallets: WalletInfo[],
  current?: WalletInfo | null,
  criteria?: WalletRecommendationCriteria,
): WalletInfo | null {
  if (!wallets || wallets.length === 0) {
    return null;
  }

  // If there's a current wallet and it's still available, keep it
  if (current && wallets.find((w) => w.id === current.id)) {
    return current;
  }

  const {
    preferInstalled = true,
    preferRecent = true,
    requiredChains = [],
    excludeWallets = [],
    // maxRecommendations = 1, // Reserved for future use
  } = criteria || {};

  // Filter out excluded wallets
  let candidates = wallets.filter((w) => !excludeWallets.includes(w.id));

  // Filter by required chains
  if (requiredChains.length > 0) {
    candidates = filterWalletsByChain(candidates, requiredChains);
  }

  // Check for preferred wallet
  if (preferRecent) {
    const preferredId = getPreferredWallet();
    if (preferredId) {
      const preferred = candidates.find((w) => w.id === preferredId);
      if (preferred) {
        return preferred;
      }
    }
  }

  // Sort by installation status if preferred
  if (preferInstalled) {
    const installed = candidates.filter((w) => isWalletInstalled(w));
    if (installed.length > 0) {
      return installed[0] || null;
    }
  }

  // Return first available wallet
  return candidates.length > 0 ? candidates[0] || null : null;
}

/**
 * Get recommended wallet with history integration
 *
 * Enhanced recommendation algorithm that uses WalletPreferenceService data
 * to provide more intelligent wallet recommendations based on:
 * - Auto-connect preferences
 * - Usage frequency and recency
 * - Installation status
 * - Chain compatibility
 *
 * @param wallets - Available wallets to choose from
 * @param current - Currently selected wallet (if any)
 * @param criteria - Recommendation criteria
 * @param preferenceService - Optional preference service for enhanced recommendations
 * @returns Recommended wallet or null if none suitable
 *
 * @example
 * ```typescript
 * const recommended = getRecommendedWalletWithHistory(
 *   wallets,
 *   null,
 *   { preferInstalled: true },
 *   preferenceService
 * );
 *
 * if (recommended) {
 *   console.log('Enhanced recommendation:', recommended.name);
 * }
 * ```
 *
 * @category Wallet Selection
 * @public
 * @since 3.0.0
 */
export function getRecommendedWalletWithHistory(
  wallets: WalletInfo[],
  current?: WalletInfo | null,
  criteria?: WalletRecommendationCriteria,
  preferenceService?: WalletPreferenceService,
): WalletInfo | null {
  if (!wallets || wallets.length === 0) {
    return null;
  }

  // If there's a current wallet and it's still available, keep it
  if (current && wallets.find((w) => w.id === current.id)) {
    return current;
  }

  const {
    preferInstalled = true,
    preferRecent = true,
    requiredChains = [],
    excludeWallets = [],
    // maxRecommendations = 1, // Reserved for future use
  } = criteria || {};

  // Filter out excluded wallets
  let candidates = wallets.filter((w) => !excludeWallets.includes(w.id));

  // Filter by required chains
  if (requiredChains.length > 0) {
    candidates = filterWalletsByChain(candidates, requiredChains);
  }

  // If preference service is available, use enhanced logic
  if (preferenceService) {
    // First check for auto-connect preference
    const autoConnectWallet = preferenceService.getPreferredWallet();
    if (autoConnectWallet) {
      const autoConnect = candidates.find((w) => w.id === autoConnectWallet);
      if (autoConnect) {
        return autoConnect;
      }
    }

    // Next, use most frequently used wallet
    if (preferRecent) {
      const mostUsed = preferenceService.getMostUsedWallet();
      if (mostUsed) {
        const mostUsedWallet = candidates.find((w) => w.id === mostUsed);
        if (mostUsedWallet) {
          return mostUsedWallet;
        }
      }

      // Check recent wallet history
      const recentWallets = preferenceService.getRecentWalletIds(3);
      for (const recentId of recentWallets) {
        const recent = candidates.find((w) => w.id === recentId);
        if (recent) {
          return recent;
        }
      }
    }
  } else {
    // Fallback to basic preference storage
    if (preferRecent) {
      const preferredId = getPreferredWallet();
      if (preferredId) {
        const preferred = candidates.find((w) => w.id === preferredId);
        if (preferred) {
          return preferred;
        }
      }
    }
  }

  // Sort by installation status if preferred
  if (preferInstalled) {
    const installed = candidates.filter((w) => isWalletInstalled(w));
    if (installed.length > 0) {
      return installed[0] || null;
    }
  }

  // Return first available wallet
  return candidates.length > 0 ? candidates[0] || null : null;
}

/**
 * Filter wallets by supported chain types
 *
 * @param wallets - Wallets to filter
 * @param chainTypes - Required chain types
 * @returns Filtered wallets that support all specified chain types
 *
 * @example
 * ```typescript
 * const evmWallets = filterWalletsByChain(wallets, ['evm']);
 * const multiChainWallets = filterWalletsByChain(wallets, ['evm', 'solana']);
 * ```
 *
 * @category Wallet Selection
 * @public
 */
export function filterWalletsByChain(wallets: WalletInfo[], chainTypes: ChainType[]): WalletInfo[] {
  if (!chainTypes || chainTypes.length === 0) {
    return wallets;
  }

  return wallets.filter((wallet) => {
    if (!wallet.chains || wallet.chains.length === 0) {
      return false;
    }

    // Check if wallet supports all required chain types
    return chainTypes.every((chainType) => wallet.chains.includes(chainType));
  });
}

/**
 * Get install URL for a wallet
 *
 * Returns the appropriate install URL based on wallet ID and platform.
 *
 * @param walletId - Wallet identifier
 * @returns Install URL or null if not available
 *
 * @example
 * ```typescript
 * const installUrl = getInstallUrl('metamask');
 * if (installUrl) {
 *   window.open(installUrl, '_blank');
 * }
 * ```
 *
 * @category Wallet Selection
 * @public
 */
export function getInstallUrl(walletId: string): string | null {
  // Common wallet install URLs
  const installUrls: Record<string, string> = {
    metamask: 'https://metamask.io/download/',
    phantom: 'https://phantom.app/download',
    coinbase: 'https://www.coinbase.com/wallet',
    rabby: 'https://rabby.io/',
    rainbow: 'https://rainbow.me/',
    argentx: 'https://www.argent.xyz/argent-x/',
    braavos: 'https://braavos.app/',
    trust: 'https://trustwallet.com/download',
    exodus: 'https://www.exodus.com/download/',
    brave: 'https://brave.com/wallet/',
    opera: 'https://www.opera.com/crypto/next',
    backpack: 'https://www.backpack.app/',
    glow: 'https://glow.app/',
    solflare: 'https://solflare.com/',
    // Add more wallet URLs as needed
  };

  const url = installUrls[walletId.toLowerCase()];
  return url || null;
}

/**
 * Check if a wallet is installed in the browser
 *
 * Performs basic checks to determine if a wallet is available in the browser.
 * Note: This is a heuristic check and may not be 100% accurate.
 *
 * @param wallet - Wallet to check
 * @returns True if wallet appears to be installed
 *
 * @example
 * ```typescript
 * const installed = isWalletInstalled(wallet);
 * if (!installed) {
 *   showInstallPrompt(wallet);
 * }
 * ```
 *
 * @category Wallet Selection
 * @public
 */
export function isWalletInstalled(wallet: WalletInfo): boolean {
  if (!isBrowser()) {
    return false;
  }

  // Check for common wallet injection points
  const w = window as unknown as Record<string, unknown>;

  switch (wallet.id.toLowerCase()) {
    case 'metamask':
      return !!(w['ethereum'] && (w['ethereum'] as Record<string, unknown>)?.['isMetaMask']);

    case 'phantom':
      return !!(w['phantom'] && (w['phantom'] as Record<string, unknown>)?.['solana']);

    case 'coinbase': {
      const eth = w['ethereum'] as Record<string, unknown>;
      return !!(eth && (eth['isCoinbaseWallet'] || eth['isWalletLink']));
    }

    case 'rabby':
      return !!(w['ethereum'] && (w['ethereum'] as Record<string, unknown>)?.['isRabby']);

    case 'rainbow':
      return !!(w['ethereum'] && (w['ethereum'] as Record<string, unknown>)?.['isRainbow']);

    case 'trust':
      return !!(w['ethereum'] && (w['ethereum'] as Record<string, unknown>)?.['isTrust']);

    case 'brave':
      return !!(w['ethereum'] && (w['ethereum'] as Record<string, unknown>)?.['isBraveWallet']);

    case 'opera':
      return !!(w['ethereum'] && (w['ethereum'] as Record<string, unknown>)?.['isOpera']);

    case 'backpack':
      return !!w['backpack'];

    case 'glow':
      return !!w['glow'];

    case 'solflare':
      return !!w['solflare'];

    case 'exodus':
      return !!(w['exodus'] && (w['exodus'] as Record<string, unknown>)?.['ethereum']);

    default:
      // Generic check - look for ethereum provider or wallet-specific property
      if (wallet.chains?.includes('evm' as ChainType)) {
        return !!w['ethereum'];
      }
      if (wallet.chains?.includes('solana' as ChainType)) {
        const phantom = w['phantom'] as Record<string, unknown> | undefined;
        return !!(w['solana'] || phantom?.['solana']);
      }
      return false;
  }
}

/**
 * Get wallets sorted by availability
 *
 * Sorts wallets with installed ones first, then by name.
 *
 * @param wallets - Wallets to sort
 * @returns Sorted wallet array
 *
 * @example
 * ```typescript
 * const sorted = getWalletsSortedByAvailability(wallets);
 * // Installed wallets appear first
 * ```
 *
 * @category Wallet Selection
 * @public
 */
export function getWalletsSortedByAvailability(wallets: WalletInfo[]): WalletInfo[] {
  return [...wallets].sort((a, b) => {
    const aAvailable = isWalletInstalled(a);
    const bAvailable = isWalletInstalled(b);

    // Installed wallets first
    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;

    // Then sort by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get wallets sorted by usage frequency
 *
 * Sorts available wallets by their usage frequency using preference service data.
 * Most frequently used wallets appear first.
 *
 * @param wallets - Available wallets to sort
 * @param preferenceService - Preference service for usage data
 * @returns Wallets sorted by usage frequency
 *
 * @example
 * ```typescript
 * const sortedWallets = getWalletsByUsageFrequency(wallets, preferenceService);
 * // Most used wallets appear first
 * ```
 *
 * @category Wallet Selection
 * @public
 * @since 3.0.0
 */
export function getWalletsByUsageFrequency(
  wallets: WalletInfo[],
  preferenceService?: WalletPreferenceService,
): WalletInfo[] {
  if (!preferenceService) {
    return [...wallets]; // Return unchanged if no service
  }

  const history = preferenceService.getWalletHistory();
  const usageMap = new Map(history.map((entry) => [entry.walletId, entry.usageCount]));

  return [...wallets].sort((a, b) => {
    const aUsage = usageMap.get(a.id) || 0;
    const bUsage = usageMap.get(b.id) || 0;

    // Sort by usage count (descending), then by name (ascending)
    if (aUsage !== bUsage) {
      return bUsage - aUsage;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Create a wallet selection manager instance
 *
 * Provides a complete wallet selection management interface with all utilities.
 *
 * @returns Wallet selection manager
 *
 * @example
 * ```typescript
 * const manager = createWalletSelectionManager();
 *
 * // Set preference
 * manager.setPreferredWallet('metamask');
 *
 * // Get recommendation
 * const recommended = manager.getRecommendedWallet(wallets);
 * ```
 *
 * @category Wallet Selection
 * @public
 */
export function createWalletSelectionManager(): WalletSelectionManager {
  return {
    getPreferredWallet,
    setPreferredWallet,
    getRecommendedWallet,
    filterWalletsByChain,
    getInstallUrl,
    isWalletInstalled,
    clearPreference: clearWalletPreference,
  };
}

/**
 * Create an enhanced wallet selection manager with preference service integration
 *
 * Provides an enhanced wallet selection management interface that integrates
 * with WalletPreferenceService for intelligent recommendations based on usage history.
 *
 * @param preferenceService - Preference service for enhanced features
 * @returns Enhanced wallet selection manager
 *
 * @example
 * ```typescript
 * const enhancedManager = createEnhancedWalletSelectionManager(preferenceService);
 *
 * // Record wallet selection for history
 * enhancedManager.recordWalletSelection('metamask', walletInfo);
 *
 * // Get intelligent recommendation with history
 * const recommended = enhancedManager.getRecommendedWalletWithHistory(wallets);
 *
 * // Set auto-connect preference
 * enhancedManager.setAutoConnect('metamask', true);
 * ```
 *
 * @category Wallet Selection
 * @public
 * @since 3.0.0
 */
export function createEnhancedWalletSelectionManager(
  preferenceService: WalletPreferenceService,
): EnhancedWalletSelectionManager {
  return {
    // Basic manager functions
    getPreferredWallet,
    setPreferredWallet,
    getRecommendedWallet,
    filterWalletsByChain,
    getInstallUrl,
    isWalletInstalled,
    clearPreference: clearWalletPreference,

    // Enhanced functions with preference service integration
    getRecommendedWalletWithHistory: (wallets, current, criteria) =>
      getRecommendedWalletWithHistory(wallets, current, criteria, preferenceService),

    getWalletsByUsageFrequency: (wallets) => getWalletsByUsageFrequency(wallets, preferenceService),

    recordWalletSelection: (walletId, wallet) => {
      preferenceService.addToHistory(walletId, wallet);

      // Also update simple preference storage for compatibility
      setPreferredWallet(walletId);
    },

    shouldAutoConnect: (walletId) => preferenceService.isAutoConnectEnabled(walletId),

    setAutoConnect: (walletId, enabled) => preferenceService.setAutoConnect(walletId, enabled),
  };
}

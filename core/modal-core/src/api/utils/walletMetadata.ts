/**
 * Framework-agnostic wallet metadata utilities
 *
 * This module provides utilities for transforming and managing wallet metadata
 * across all framework packages. It includes wallet categorization, priority
 * calculation, and metadata transformation logic.
 *
 * @module walletMetadata
 * @public
 */

import type { WalletDisplayData } from '../core/headless.js';

/**
 * Extended wallet information with computed metadata
 * @public
 */
export interface WalletWithMetadata {
  // Basic info
  id: string;
  name: string;
  icon: string;
  homepage?: string;

  // Status
  installed: boolean;
  available: boolean;
  recent: boolean;
  recommended: boolean;

  // Capabilities
  chains: string[];
  features: string[];

  // Category
  category?: 'injected' | 'mobile' | 'hardware' | 'walletconnect';

  // Usage data
  popularity?: number;
  lastUsed?: number;
}

/**
 * Wallet grouping result
 * @public
 */
export interface GroupedWallets {
  installed: WalletWithMetadata[];
  recommended: WalletWithMetadata[];
  popular: WalletWithMetadata[];
  recent: WalletWithMetadata[];
  other: WalletWithMetadata[];
}

/**
 * Wallet filtering criteria
 * @public
 */
export interface WalletFilterCriteria {
  chains?: string[];
  features?: string[];
  categories?: ('injected' | 'mobile' | 'hardware' | 'walletconnect')[];
  installed?: boolean;
  available?: boolean;
}

/**
 * Wallet sorting options
 * @public
 */
export type WalletSortOption = 'name' | 'popularity' | 'recent' | 'installed' | 'recommended';

/**
 * Transform WalletDisplayData to WalletWithMetadata
 *
 * @param data - Raw wallet display data from headless state
 * @returns Enhanced wallet metadata with computed properties
 * @remarks This function enriches the basic wallet data with additional metadata
 * including categorization, popularity scores, and usage timestamps
 * @example
 * ```typescript
 * const walletData = {
 *   wallet: { id: 'metamask', name: 'MetaMask', icon: '...' },
 *   status: { installed: true, available: true, recent: false, recommended: true },
 *   capabilities: { chains: ['evm'], features: ['injected'] }
 * };
 *
 * const enhanced = transformWalletData(walletData);
 * // Returns: { ...basicInfo, category: 'injected', popularity: 70, ... }
 * ```
 */
function transformWalletData(data: WalletDisplayData): WalletWithMetadata {
  const lastUsed = getLastUsedTimestamp(data);

  return {
    // Basic info from wallet
    id: data.wallet.id,
    name: data.wallet.name,
    icon: data.wallet.icon,
    ...(data.wallet.homepage && { homepage: data.wallet.homepage }),

    // Status
    installed: data.status.installed,
    available: data.status.available,
    recent: data.status.recent,
    recommended: data.status.recommended,

    // Capabilities
    chains: data.capabilities.chains,
    features: data.capabilities.features,

    // Computed metadata
    category: categorizeWallet(data),
    popularity: calculatePopularity(data),
    ...(lastUsed !== null && { lastUsed }),
  };
}

/**
 * Transform array of WalletDisplayData to WalletWithMetadata
 * @param dataArray - Array of raw wallet display data
 * @returns Array of enhanced wallet metadata
 */
function transformWalletDataArray(dataArray: WalletDisplayData[]): WalletWithMetadata[] {
  return dataArray.map((data) => transformWalletData(data));
}

/**
 * Categorize wallet based on its characteristics
 *
 * @param data - Wallet display data
 * @returns Wallet category ('injected', 'mobile', 'hardware', or 'walletconnect')
 * @remarks Uses a hierarchical approach to categorization:
 * 1. Hardware wallets (Ledger, Trezor) take priority
 * 2. Mobile wallets are identified by features or name
 * 3. WalletConnect wallets are identified by features or ID
 * 4. Default to 'injected' for browser extensions
 * @example
 * ```typescript
 * const ledgerData = { wallet: { name: 'Ledger Live' }, capabilities: { features: [] } };
 * categorizeWallet(ledgerData); // Returns: 'hardware'
 *
 * const mobileData = { wallet: { name: 'Trust Wallet' }, capabilities: { features: ['mobile'] } };
 * categorizeWallet(mobileData); // Returns: 'mobile'
 * ```
 */
function categorizeWallet(data: WalletDisplayData): 'injected' | 'mobile' | 'hardware' | 'walletconnect' {
  const { wallet, capabilities } = data;

  // Check for hardware wallet indicators
  if (
    wallet.name.toLowerCase().includes('ledger') ||
    wallet.name.toLowerCase().includes('trezor') ||
    capabilities.features.includes('hardware')
  ) {
    return 'hardware';
  }

  // Check for mobile wallet indicators
  if (capabilities.features.includes('mobile') || wallet.name.toLowerCase().includes('mobile')) {
    return 'mobile';
  }

  // Check for WalletConnect indicators
  if (capabilities.features.includes('walletconnect') || wallet.id.includes('walletconnect')) {
    return 'walletconnect';
  }

  // Default to injected (browser extension)
  return 'injected';
}

/**
 * Calculate wallet popularity score
 *
 * @param data - Wallet display data
 * @returns Popularity score (0-100)
 * @remarks Scoring algorithm:
 * - Recommended wallets: +40 points
 * - Installed wallets: +30 points
 * - Recently used wallets: +20 points
 * - Supported chains: +2 points per chain (max 10)
 * Maximum score is capped at 100
 * @example
 * ```typescript
 * const popularWallet = {
 *   status: { recommended: true, installed: true, recent: true },
 *   capabilities: { chains: ['evm', 'solana', 'aztec'] }
 * };
 * calculatePopularity(popularWallet); // Returns: 96 (40+30+20+6)
 * ```
 */
function calculatePopularity(data: WalletDisplayData): number {
  let score = 0;

  // Base score for recommended wallets
  if (data.status.recommended) score += 40;

  // Score for installed wallets
  if (data.status.installed) score += 30;

  // Score for recently used wallets
  if (data.status.recent) score += 20;

  // Score based on number of supported chains
  score += Math.min(data.capabilities.chains.length * 2, 10);

  return Math.min(score, 100);
}

/**
 * Get last used timestamp for wallet
 * @param data - Wallet display data
 * @returns Last used timestamp or null
 */
function getLastUsedTimestamp(data: WalletDisplayData): number | null {
  // This would ideally come from the wallet data or local storage
  // For now, return null as this needs to be implemented in the core
  return data.status.recent ? Date.now() - 24 * 60 * 60 * 1000 : null;
}

/**
 * Sort wallets by specified criteria
 * @param wallets - Array of wallets to sort
 * @param sortBy - Sorting criteria
 * @returns Sorted wallet array
 */
function sortWallets(
  wallets: WalletWithMetadata[],
  sortBy: WalletSortOption = 'popularity',
): WalletWithMetadata[] {
  const sorted = [...wallets];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'popularity':
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    case 'recent':
      return sorted.sort((a, b) => {
        const aTime = a.lastUsed || 0;
        const bTime = b.lastUsed || 0;
        return bTime - aTime;
      });

    case 'installed':
      return sorted.sort((a, b) => {
        if (a.installed && !b.installed) return -1;
        if (!a.installed && b.installed) return 1;
        return (b.popularity || 0) - (a.popularity || 0);
      });

    case 'recommended':
      return sorted.sort((a, b) => {
        if (a.recommended && !b.recommended) return -1;
        if (!a.recommended && b.recommended) return 1;
        return (b.popularity || 0) - (a.popularity || 0);
      });

    default:
      return sorted;
  }
}

/**
 * Group wallets by status and priority
 * @param wallets - Array of wallets to group
 * @returns Grouped wallets object
 */
function groupWallets(wallets: WalletWithMetadata[]): GroupedWallets {
  const groups: GroupedWallets = {
    installed: [],
    recommended: [],
    popular: [],
    recent: [],
    other: [],
  };

  for (const wallet of wallets) {
    if (wallet.installed) {
      groups.installed.push(wallet);
    } else if (wallet.recommended) {
      groups.recommended.push(wallet);
    } else if (wallet.recent) {
      groups.recent.push(wallet);
    } else if ((wallet.popularity || 0) > 50) {
      groups.popular.push(wallet);
    } else {
      groups.other.push(wallet);
    }
  }

  // Sort each group by popularity
  for (const key of Object.keys(groups)) {
    groups[key as keyof GroupedWallets] = sortWallets(groups[key as keyof GroupedWallets], 'popularity');
  }

  return groups;
}

/**
 * Filter wallets by criteria
 * @param wallets - Array of wallets to filter
 * @param criteria - Filtering criteria
 * @returns Filtered wallet array
 */
function filterWallets(wallets: WalletWithMetadata[], criteria: WalletFilterCriteria): WalletWithMetadata[] {
  return wallets.filter((wallet) => {
    // Filter by chains
    if (criteria.chains && criteria.chains.length > 0) {
      const hasRequiredChain = criteria.chains.some((chain) => wallet.chains.includes(chain));
      if (!hasRequiredChain) return false;
    }

    // Filter by features
    if (criteria.features && criteria.features.length > 0) {
      const hasRequiredFeature = criteria.features.some((feature) => wallet.features.includes(feature));
      if (!hasRequiredFeature) return false;
    }

    // Filter by categories
    if (criteria.categories && criteria.categories.length > 0) {
      if (!wallet.category || !criteria.categories.includes(wallet.category)) {
        return false;
      }
    }

    // Filter by installed status
    if (criteria.installed !== undefined) {
      if (wallet.installed !== criteria.installed) return false;
    }

    // Filter by available status
    if (criteria.available !== undefined) {
      if (wallet.available !== criteria.available) return false;
    }

    return true;
  });
}

/**
 * Find wallet by ID
 * @param wallets - Array of wallets to search
 * @param walletId - ID of wallet to find
 * @returns Found wallet or null
 */
function findWalletById(wallets: WalletWithMetadata[], walletId: string): WalletWithMetadata | null {
  return wallets.find((w) => w.id === walletId) || null;
}

/**
 * Get wallet priority for display ordering
 * @param wallet - Wallet to calculate priority for
 * @returns Priority score (higher = more important)
 */
function getWalletPriority(wallet: WalletWithMetadata): number {
  let priority = 0;

  // Highest priority for installed wallets
  if (wallet.installed) priority += 1000;

  // High priority for recommended wallets
  if (wallet.recommended) priority += 500;

  // Medium priority for recent wallets
  if (wallet.recent) priority += 250;

  // Add popularity score
  priority += wallet.popularity || 0;

  return priority;
}

/**
 * Framework-agnostic wallet metadata manager class
 *
 * Provides utilities for transforming, categorizing, sorting, grouping,
 * and filtering wallet data consistently across all framework packages.
 *
 * @public
 */
export class WalletMetadataManager {
  /**
   * Transform WalletDisplayData to WalletWithMetadata
   * @param data - Raw wallet display data from headless state
   * @returns Enhanced wallet metadata
   */
  transformWalletData(data: WalletDisplayData): WalletWithMetadata {
    return transformWalletData(data);
  }

  /**
   * Transform array of WalletDisplayData to WalletWithMetadata
   * @param dataArray - Array of raw wallet display data
   * @returns Array of enhanced wallet metadata
   */
  transformWalletDataArray(dataArray: WalletDisplayData[]): WalletWithMetadata[] {
    return transformWalletDataArray(dataArray);
  }

  /**
   * Categorize wallet based on its characteristics
   * @param data - Wallet display data
   * @returns Wallet category
   */
  categorizeWallet(data: WalletDisplayData): 'injected' | 'mobile' | 'hardware' | 'walletconnect' {
    return categorizeWallet(data);
  }

  /**
   * Calculate wallet popularity score
   * @param data - Wallet display data
   * @returns Popularity score (0-100)
   */
  calculatePopularity(data: WalletDisplayData): number {
    return calculatePopularity(data);
  }

  /**
   * Sort wallets by the specified criteria
   * @param wallets - Array of wallets to sort
   * @param sortBy - Sort criteria
   * @returns Sorted array (new array)
   */
  sortWallets(wallets: WalletWithMetadata[], sortBy: WalletSortOption = 'recommended'): WalletWithMetadata[] {
    return sortWallets(wallets, sortBy);
  }

  /**
   * Group wallets by various criteria
   * @param wallets - Array of wallets to group
   * @returns Grouped wallets object
   */
  groupWallets(wallets: WalletWithMetadata[]): GroupedWallets {
    return groupWallets(wallets);
  }

  /**
   * Filter wallets based on criteria
   * @param wallets - Array of wallets to filter
   * @param criteria - Filter criteria
   * @returns Filtered array of wallets
   */
  filterWallets(wallets: WalletWithMetadata[], criteria: WalletFilterCriteria): WalletWithMetadata[] {
    return filterWallets(wallets, criteria);
  }

  /**
   * Find wallet by ID
   * @param wallets - Array of wallets to search
   * @param walletId - ID of wallet to find
   * @returns Found wallet or null
   */
  findWalletById(wallets: WalletWithMetadata[], walletId: string): WalletWithMetadata | null {
    return findWalletById(wallets, walletId);
  }

  /**
   * Get wallet priority for display ordering
   * @param wallet - Wallet to calculate priority for
   * @returns Priority score (higher = more important)
   */
  getWalletPriority(wallet: WalletWithMetadata): number {
    return getWalletPriority(wallet);
  }

  /**
   * Get last used timestamp for a wallet
   * @param wallet - Wallet to get timestamp for
   * @returns Timestamp or null
   */
  getLastUsedTimestamp(wallet: WalletDisplayData): number | null {
    return getLastUsedTimestamp(wallet);
  }
}

/**
 * Singleton instance of WalletMetadataManager for convenience
 * @public
 */
export const walletMetadataManager = new WalletMetadataManager();

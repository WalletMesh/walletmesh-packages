/**
 * EVM Discovery Service
 *
 * Discovers EVM wallets using both EIP-6963 (event-based multi-provider discovery)
 * and EIP-1193 (standard Ethereum provider interface).
 *
 * @module client/discovery/evm/EvmDiscoveryService
 */

import { createDebugLogger } from '../../../api/system/logger.js';
import type { Logger } from '../../../internal/core/logger/logger.js';
import type {
  DiscoveredEVMWallet,
  EIP1193Provider,
  EIP6963ProviderDetail,
  EVMDiscoveryConfig,
  EVMDiscoveryResults,
} from './types.js';

/**
 * EVM wallet discovery service
 * Discovers wallets via EIP-6963 and legacy window.ethereum
 */
export class EVMDiscoveryService {
  private config: EVMDiscoveryConfig;
  private discoveredWallets: Map<string, DiscoveredEVMWallet>;
  private eip6963Listeners: Set<(event: CustomEvent) => void>;
  private logger: Logger;
  private timeoutIds: Set<ReturnType<typeof setTimeout>>;

  constructor(config: EVMDiscoveryConfig = {}, logger?: Logger) {
    this.config = {
      enabled: config.enabled ?? true,
      eip6963Timeout: config.eip6963Timeout ?? 500,
      preferEIP6963: config.preferEIP6963 ?? true,
    };
    this.discoveredWallets = new Map();
    this.eip6963Listeners = new Set();
    this.timeoutIds = new Set();
    this.logger = logger || createDebugLogger('EVMDiscoveryService');
  }

  /**
   * Start discovery of EVM wallets
   */
  async discover(): Promise<EVMDiscoveryResults> {
    if (!this.config.enabled) {
      this.logger.debug('EVM discovery disabled');
      return {
        eip6963Wallets: [],
        totalCount: 0,
      };
    }

    if (typeof window === 'undefined') {
      this.logger.debug('Not in browser environment');
      return {
        eip6963Wallets: [],
        totalCount: 0,
      };
    }

    // Clear previous discoveries
    this.discoveredWallets.clear();

    // Discover wallets in parallel
    const [eip6963Wallets, legacyProvider] = await Promise.all([
      this.discoverEIP6963Wallets(),
      this.discoverLegacyProvider(),
    ]);

    // Apply preference logic
    let finalLegacyProvider = legacyProvider;
    if (this.config.preferEIP6963 && eip6963Wallets.length > 0) {
      // If we prefer EIP-6963 and found EIP-6963 wallets, don't include EIP-1193 wallet
      finalLegacyProvider = null;
    }

    // Build results
    const results: EVMDiscoveryResults = {
      eip6963Wallets,
      ...(finalLegacyProvider && { eip1193Wallet: finalLegacyProvider }),
      totalCount: this.discoveredWallets.size,
    };

    return results;
  }

  /**
   * Discover wallets via EIP-6963
   */
  private async discoverEIP6963Wallets(): Promise<DiscoveredEVMWallet[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    const wallets: DiscoveredEVMWallet[] = [];

    return new Promise((resolve) => {
      const handleAnnouncement = (event: CustomEvent) => {
        const detail = event.detail as EIP6963ProviderDetail;

        // Validate provider structure
        if (!this.isValidEIP6963Provider(detail)) {
          this.logger.warn('Invalid EIP-6963 provider structure', detail);
          return;
        }

        const wallet: DiscoveredEVMWallet = {
          id: detail.info.rdns || detail.info.uuid,
          name: detail.info.name,
          icon: detail.info.icon,
          type: 'eip6963',
          provider: detail.provider,
          metadata: {
            uuid: detail.info.uuid,
            rdns: detail.info.rdns,
          },
        };

        // Store wallet if not already discovered
        if (!this.discoveredWallets.has(wallet.id)) {
          this.discoveredWallets.set(wallet.id, wallet);
          wallets.push(wallet);
        }
      };

      // Store listener for cleanup
      this.eip6963Listeners.add(handleAnnouncement);

      // Listen for wallet announcements
      window.addEventListener('eip6963:announceProvider', handleAnnouncement as EventListener);

      // Request wallet announcements
      window.dispatchEvent(new Event('eip6963:requestProvider'));

      // Wait for announcements with timeout
      const timeoutId = setTimeout(() => {
        // Check if window still exists (not torn down)
        if (typeof window !== 'undefined') {
          window.removeEventListener('eip6963:announceProvider', handleAnnouncement as EventListener);
        }
        this.eip6963Listeners.delete(handleAnnouncement);
        this.timeoutIds.delete(timeoutId);
        resolve(wallets);
      }, this.config.eip6963Timeout);

      this.timeoutIds.add(timeoutId);
    });
  }

  /**
   * Discover legacy window.ethereum provider
   */
  private async discoverLegacyProvider(): Promise<DiscoveredEVMWallet | null> {
    if (typeof window === 'undefined' || !window.ethereum) {
      this.logger.debug('No window.ethereum provider found');
      return null;
    }

    const provider = window.ethereum as EIP1193Provider;

    // Skip if this is already discovered via EIP-6963
    // Check for common rdns properties
    if ('_metamask' in provider && provider._metamask) {
      const metamask = provider._metamask as Record<string, unknown>;
      if (metamask['rdns'] && typeof metamask['rdns'] === 'string') {
        const rdns = metamask['rdns'];
        if (this.discoveredWallets.has(rdns)) {
          return null;
        }
      }
    }

    // Detect wallet type
    const walletInfo = this.detectWalletType(provider);

    const wallet: DiscoveredEVMWallet = {
      id: walletInfo.id,
      name: walletInfo.name,
      icon: walletInfo.icon,
      type: 'eip1193',
      provider,
      metadata: {
        ...(provider.version && { version: provider.version }),
      },
    };

    this.discoveredWallets.set(wallet.id, wallet);
    return wallet;
  }

  /**
   * Validate EIP-6963 provider structure
   */
  private isValidEIP6963Provider(detail: EIP6963ProviderDetail | unknown): detail is EIP6963ProviderDetail {
    if (!detail || typeof detail !== 'object') {
      return false;
    }

    const provider = detail as Partial<EIP6963ProviderDetail>;

    // Check info object exists and has required fields
    if (!provider.info || typeof provider.info !== 'object') {
      return false;
    }

    const info = provider.info;
    if (!info.uuid || !info.name || !info.icon) {
      return false;
    }

    // Check provider exists and is not null
    if (!provider.provider || provider.provider === null) {
      return false;
    }

    // Check if provider has required request method (EIP-1193 compliance)
    if (typeof provider.provider !== 'object' || typeof provider.provider.request !== 'function') {
      return false;
    }

    return true;
  }

  /**
   * Detect wallet type from provider properties
   */
  private detectWalletType(provider: EIP1193Provider): {
    id: string;
    name: string;
    icon: string;
  } {
    // MetaMask
    if (provider.isMetaMask) {
      return {
        id: 'eip1193-metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI3LjIgNC42TDE3LjYgMTEuNkwxOS40IDcuMkwyNy4yIDQuNloiIGZpbGw9IiNFMjc2MUIiLz4KPC9zdmc+',
      };
    }

    // Brave
    if (provider.isBraveWallet) {
      return {
        id: 'com.brave.wallet',
        name: 'Brave Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMloiIGZpbGw9IiNGRjQ3MjQiLz4KPC9zdmc+',
      };
    }

    // Coinbase
    if (provider.isCoinbaseWallet) {
      return {
        id: 'com.coinbase.wallet',
        name: 'Coinbase Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMloiIGZpbGw9IiMwMDUyRkYiLz4KPC9zdmc+',
      };
    }

    // Rabby
    if (provider.isRabby) {
      return {
        id: 'io.rabby',
        name: 'Rabby Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMloiIGZpbGw9IiM3MDg0RjMiLz4KPC9zdmc+',
      };
    }

    // Trust
    if (provider.isTrust) {
      return {
        id: 'com.trustwallet',
        name: 'Trust Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMloiIGZpbGw9IiMzMzc1QkIiLz4KPC9zdmc+',
      };
    }

    // Frame
    if (provider.isFrame) {
      return {
        id: 'sh.frame',
        name: 'Frame',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMloiIGZpbGw9IiMwMDAwMDAiLz4KPC9zdmc+',
      };
    }

    // TokenPocket
    if (provider.isTokenPocket) {
      return {
        id: 'pro.tokenpocket',
        name: 'TokenPocket',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMloiIGZpbGw9IiMyOTgwRkUiLz4KPC9zdmc+',
      };
    }

    // Default/Unknown
    return {
      id: 'unknown.wallet',
      name: 'Unknown EVM Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMloiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+',
    };
  }

  /**
   * Get all discovered wallets
   */
  getDiscoveredWallets(): DiscoveredEVMWallet[] {
    return Array.from(this.discoveredWallets.values());
  }

  /**
   * Get all discovered wallets (alias for tests)
   */
  getAllWallets(results?: EVMDiscoveryResults): DiscoveredEVMWallet[] {
    if (results) {
      // Flatten the results into a single array
      const wallets: DiscoveredEVMWallet[] = [...results.eip6963Wallets];
      if (results.eip1193Wallet) {
        wallets.push(results.eip1193Wallet);
      }
      return wallets;
    }
    return this.getDiscoveredWallets();
  }

  /**
   * Get a specific wallet by ID
   */
  getWalletById(id: string): DiscoveredEVMWallet | undefined {
    return this.discoveredWallets.get(id);
  }

  /**
   * Clear all discovered wallets
   */
  clear(): void {
    this.discoveredWallets.clear();
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    // Clear any pending timeouts
    for (const timeoutId of this.timeoutIds) {
      clearTimeout(timeoutId);
    }
    this.timeoutIds.clear();

    // Remove any remaining EIP-6963 listeners
    if (typeof window !== 'undefined') {
      for (const listener of this.eip6963Listeners) {
        window.removeEventListener('eip6963:announceProvider', listener as EventListener);
      }
    }
    this.eip6963Listeners.clear();
    this.discoveredWallets.clear();
  }
}

// Extend window interface for EIP-6963 and EIP-1193
declare global {
  interface WindowEventMap {
    'eip6963:requestProvider': Event;
    'eip6963:announceProvider': CustomEvent<EIP6963ProviderDetail>;
  }

  interface Window {
    ethereum?: unknown;
  }
}

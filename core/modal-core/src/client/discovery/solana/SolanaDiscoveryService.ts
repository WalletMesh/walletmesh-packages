/**
 * Solana Discovery Service
 *
 * Discovers Solana wallets using both the Solana Wallet Standard
 * and legacy wallet injection methods. Provides comprehensive detection
 * for 10+ popular Solana wallets.
 *
 * @module client/discovery/solana/SolanaDiscoveryService
 */

import { createDebugLogger } from '../../../api/system/logger.js';
import type { Logger } from '../../../internal/core/logger/logger.js';
import type {
  DiscoveredSolanaWallet,
  SolanaDiscoveryConfig,
  SolanaDiscoveryResults,
  SolanaProvider,
  SolanaWalletStandardWallet,
} from './types.js';

/**
 * Solana wallet discovery service
 * Discovers wallets via Wallet Standard and legacy injection
 */
export class SolanaDiscoveryService {
  private config: SolanaDiscoveryConfig;
  private discoveredWallets: Map<string, DiscoveredSolanaWallet>;
  private walletStandardListeners: Set<(event: CustomEvent) => void>;
  private logger: Logger;
  private timeoutIds: Set<ReturnType<typeof setTimeout>>;

  constructor(config: SolanaDiscoveryConfig = {}, logger?: Logger) {
    this.config = {
      enabled: config.enabled ?? true,
      walletStandardTimeout: config.walletStandardTimeout ?? 500,
      preferWalletStandard: config.preferWalletStandard ?? true,
      includeDeprecated: config.includeDeprecated ?? false,
    };
    this.discoveredWallets = new Map();
    this.walletStandardListeners = new Set();
    this.timeoutIds = new Set();
    this.logger = logger || createDebugLogger('SolanaDiscoveryService');
  }

  /**
   * Start discovery of Solana wallets
   */
  async discover(): Promise<SolanaDiscoveryResults> {
    if (!this.config.enabled) {
      this.logger.debug('Solana discovery disabled');
      return {
        walletStandardWallets: [],
        injectedWallets: [],
        totalCount: 0,
      };
    }

    if (typeof window === 'undefined') {
      this.logger.debug('Not in browser environment');
      return {
        walletStandardWallets: [],
        injectedWallets: [],
        totalCount: 0,
      };
    }

    // Clear previous discoveries
    this.discoveredWallets.clear();

    // Discover wallets in parallel
    const [walletStandardWallets, injectedWallets] = await Promise.all([
      this.discoverWalletStandard(),
      this.discoverInjectedWallets(),
    ]);

    // Deduplicate wallets (prefer Wallet Standard if enabled)
    const deduplicatedResults = this.deduplicateWallets(walletStandardWallets, injectedWallets);

    // Update global discovered wallets map after deduplication
    this.discoveredWallets.clear();
    for (const wallet of deduplicatedResults.walletStandard) {
      this.discoveredWallets.set(wallet.id, wallet);
    }
    for (const wallet of deduplicatedResults.injected) {
      this.discoveredWallets.set(wallet.id, wallet);
    }
    for (const wallet of deduplicatedResults.legacy) {
      this.discoveredWallets.set(wallet.id, wallet);
    }

    // Build results
    const results: SolanaDiscoveryResults = {
      walletStandardWallets: deduplicatedResults.walletStandard,
      injectedWallets: deduplicatedResults.injected,
      ...(this.config.includeDeprecated && {
        legacyWallets: deduplicatedResults.legacy,
      }),
      totalCount: this.discoveredWallets.size,
    };

    this.logger.info('Solana discovery completed', {
      walletStandardCount: results.walletStandardWallets.length,
      injectedCount: results.injectedWallets.length,
      legacyCount: results.legacyWallets?.length || 0,
      totalFound: results.totalCount,
    });

    return results;
  }

  /**
   * Discover wallets via Solana Wallet Standard
   */
  private async discoverWalletStandard(): Promise<DiscoveredSolanaWallet[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    const wallets: DiscoveredSolanaWallet[] = [];
    const localDiscoveredIds = new Set<string>();

    return new Promise((resolve) => {
      // Check if wallet registry exists
      if (window.wallets) {
        this.logger.debug('Found wallet standard registry');

        // Get registered wallets
        const registeredWallets = window.wallets.get();
        for (const wallet of registeredWallets) {
          if (this.isSolanaWallet(wallet)) {
            const discoveredWallet = this.createDiscoveredWallet(wallet, 'wallet-standard');
            if (!localDiscoveredIds.has(discoveredWallet.id)) {
              localDiscoveredIds.add(discoveredWallet.id);
              wallets.push(discoveredWallet);
            }
          }
        }
      }

      // Listen for wallet registration events
      const handleWalletRegister = (event: CustomEvent) => {
        const wallet = event.detail?.wallet;
        if (wallet && this.isSolanaWallet(wallet)) {
          const discoveredWallet = this.createDiscoveredWallet(wallet, 'wallet-standard');
          if (!localDiscoveredIds.has(discoveredWallet.id)) {
            localDiscoveredIds.add(discoveredWallet.id);
            wallets.push(discoveredWallet);
          }
        }
      };

      // Store listener for cleanup
      this.walletStandardListeners.add(handleWalletRegister);

      // Listen for wallet registration
      window.addEventListener('wallet-standard:register', handleWalletRegister as EventListener);

      // Dispatch app ready event to trigger wallet registration
      window.dispatchEvent(new Event('wallet-standard:app-ready'));

      // Wait for wallets with timeout
      const timeoutId = setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('wallet-standard:register', handleWalletRegister as EventListener);
        }
        this.walletStandardListeners.delete(handleWalletRegister);
        this.timeoutIds.delete(timeoutId);
        resolve(wallets);
      }, this.config.walletStandardTimeout);

      this.timeoutIds.add(timeoutId);
    });
  }

  /**
   * Discover wallets via legacy injection
   */
  private async discoverInjectedWallets(): Promise<DiscoveredSolanaWallet[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    const wallets: DiscoveredSolanaWallet[] = [];
    const localDiscoveredIds = new Set<string>();

    // Check all known injection points
    const injectionPoints: Array<{
      path: string;
      getter: () => SolanaProvider | undefined;
    }> = [
      // Primary window.solana (usually Phantom)
      {
        path: 'window.solana',
        getter: () => window.solana,
      },
      // Phantom specific
      {
        path: 'window.phantom.solana',
        getter: () => window.phantom?.solana,
      },
      // Solflare
      {
        path: 'window.solflare',
        getter: () => window.solflare,
      },
      // Backpack
      {
        path: 'window.backpack.solana',
        getter: () => window.backpack?.solana,
      },
      // Glow
      {
        path: 'window.glow.solana',
        getter: () => window.glow?.solana,
      },
      // Coinbase
      {
        path: 'window.coinbaseSolana',
        getter: () => window.coinbaseSolana,
      },
      // Trust Wallet
      {
        path: 'window.trustwallet.solana',
        getter: () => window.trustwallet?.solana,
      },
      // Exodus
      {
        path: 'window.exodus.solana',
        getter: () => window.exodus?.solana,
      },
      // MathWallet
      {
        path: 'window.mathWallet.solana',
        getter: () => window.mathWallet?.solana,
      },
      // Slope
      {
        path: 'window.slope',
        getter: () => window.slope,
      },
      // Torus
      {
        path: 'window.torus.solana',
        getter: () => window.torus?.solana,
      },
      // Brave
      {
        path: 'window.brave.solana',
        getter: () => window.brave?.solana,
      },
      // TokenPocket
      {
        path: 'window.tokenpocket.solana',
        getter: () => window.tokenpocket?.solana,
      },
    ];

    // Check each injection point
    for (const { path, getter } of injectionPoints) {
      try {
        const provider = getter();
        if (provider && this.isValidSolanaProvider(provider)) {
          const walletInfo = this.detectWalletType(provider, path);

          // Check if already discovered in this method (avoid duplicates within injected)
          if (!localDiscoveredIds.has(walletInfo.id)) {
            const discoveredWallet: DiscoveredSolanaWallet = {
              ...walletInfo,
              type: 'injected',
              provider,
            };

            localDiscoveredIds.add(walletInfo.id);
            wallets.push(discoveredWallet);

            this.logger.debug('Found injected wallet', {
              id: walletInfo.id,
              name: walletInfo.name,
              path,
            });
          }
        }
      } catch (error) {
        this.logger.debug('Error checking injection point', { path, error });
      }
    }

    return wallets;
  }

  /**
   * Check if a wallet supports Solana
   */
  private isSolanaWallet(wallet: SolanaWalletStandardWallet): boolean {
    // Check if wallet supports Solana chains
    if (wallet.chains) {
      return wallet.chains.some(
        (chain) =>
          chain.includes('solana') ||
          chain.includes('mainnet-beta') ||
          chain.includes('testnet') ||
          chain.includes('devnet'),
      );
    }

    // Check features for Solana-specific features
    if (wallet.features) {
      const featureKeys = Object.keys(wallet.features);
      return featureKeys.some(
        (feature) =>
          feature.includes('solana') ||
          feature.includes('signTransaction') ||
          feature.includes('signMessage'),
      );
    }

    return false;
  }

  /**
   * Validate if an object is a valid Solana provider
   */
  private isValidSolanaProvider(provider: unknown): provider is SolanaProvider {
    if (!provider || typeof provider !== 'object') {
      return false;
    }

    const p = provider as Partial<SolanaProvider>;

    // Check for required methods
    if (typeof p.connect !== 'function') {
      return false;
    }

    // Check for at least one wallet identification flag or common methods
    return !!(
      p.isPhantom ||
      p.isSolflare ||
      p.isBackpack ||
      p.isGlow ||
      p.isTrust ||
      p.isExodus ||
      p.isCoinbaseWallet ||
      p.isMathWallet ||
      p.isSlope ||
      p.isTorus ||
      p.isBraveWallet ||
      p.isTokenPocket ||
      typeof p.signTransaction === 'function' ||
      typeof p.signMessage === 'function'
    );
  }

  /**
   * Detect wallet type from provider properties
   */
  private detectWalletType(
    provider: SolanaProvider,
    path: string,
  ): Omit<DiscoveredSolanaWallet, 'type' | 'provider'> {
    // Phantom
    if (provider.isPhantom) {
      return {
        id: 'phantom',
        name: 'Phantom',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjNTgzQkRCIi8+CiAgPHBhdGggZD0iTTE2IDZDMTAuNDc3MiA2IDYgMTAuNDc3MiA2IDE2QzYgMjEuNTIyOCAxMC40NzcyIDI2IDE2IDI2QzIxLjUyMjggMjYgMjYgMjEuNTIyOCAyNiAxNkMyNiAxMC40NzcyIDIxLjUyMjggNiAxNiA2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        metadata: {
          rdns: 'app.phantom',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // Solflare
    if (provider.isSolflare) {
      return {
        id: 'solflare',
        name: 'Solflare',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjRkM1NDAzIi8+CiAgPHBhdGggZD0iTTggMTZDOCA4IDE2IDggMTYgOEMyNCAxMiAyNCAxNiAyNCAxNkMyNCAyNCAxNiAyNCAxNiAyNEM4IDIwIDggMTYgOCAxNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
        metadata: {
          rdns: 'com.solflare',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // Backpack
    if (provider.isBackpack) {
      return {
        id: 'backpack',
        name: 'Backpack',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjRTMzRTNGIi8+CiAgPHBhdGggZD0iTTEwIDEyVjIwSDE0VjEySDEwWk0xOCAxMlYyMEgyMlYxMkgxOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
        metadata: {
          rdns: 'app.backpack',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // Glow
    if (provider.isGlow) {
      return {
        id: 'glow',
        name: 'Glow',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjRkZGRDAwIi8+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8L3N2Zz4=',
        metadata: {
          rdns: 'app.glow',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // Coinbase
    if (provider.isCoinbaseWallet) {
      return {
        id: 'coinbase-solana',
        name: 'Coinbase Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMDA1MkZGIi8+CiAgPHBhdGggZD0iTTEyIDEySDIwVjIwSDEyVjEyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        metadata: {
          rdns: 'com.coinbase.wallet',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // Trust Wallet
    if (provider.isTrust) {
      return {
        id: 'trust',
        name: 'Trust Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMzM3NUJCIi8+CiAgPHBhdGggZD0iTTE2IDZMMjQgMTJWMjBMMTYgMjZMOCAyMFYxMkwxNiA2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        metadata: {
          rdns: 'com.trustwallet',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // Exodus
    if (provider.isExodus) {
      return {
        id: 'exodus',
        name: 'Exodus',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjOEU0NEFEIi8+CiAgPHBhdGggZD0iTTggMTZMMTYgOEwyNCAxNkwxNiAyNEw4IDE2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        metadata: {
          rdns: 'com.exodus',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // MathWallet
    if (provider.isMathWallet) {
      return {
        id: 'mathwallet',
        name: 'MathWallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMDAwMDAwIi8+CiAgPHBhdGggZD0iTTggMTJIMTJWMjBIOFYxMlpNMTQgOEgxOFYyMEgxNFY4Wk0yMCAxMkgyNFYyMEgyMFYxMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
        metadata: {
          rdns: 'com.mathwallet',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // Slope
    if (provider.isSlope) {
      return {
        id: 'slope',
        name: 'Slope',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjNkI0NkMyIi8+CiAgPHBhdGggZD0iTTggMjBMMjQgOFYyMEg4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        metadata: {
          rdns: 'com.slope',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // Torus
    if (provider.isTorus) {
      return {
        id: 'torus',
        name: 'Torus',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMDA1OEZGIi8+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==',
        metadata: {
          rdns: 'app.tor.us',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // Brave
    if (provider.isBraveWallet) {
      return {
        id: 'brave-solana',
        name: 'Brave Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjRkY0NzI0Ii8+CiAgPHBhdGggZD0iTTE2IDZMMjIgMTBWMTZMMTYgMjZMMTAgMTZWMTBMMTYgNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
        metadata: {
          rdns: 'com.brave.wallet',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // TokenPocket
    if (provider.isTokenPocket) {
      return {
        id: 'tokenpocket',
        name: 'TokenPocket',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMjk4MEZFIi8+CiAgPHBhdGggZD0iTTEwIDhIMjJWMTRIMTZWMjRIMTBWOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
        metadata: {
          rdns: 'pro.tokenpocket',
          ...(provider.version && { version: provider.version }),
        },
      };
    }

    // Unknown/Generic wallet based on path
    const walletName = this.inferWalletNameFromPath(path);
    return {
      id: `unknown-solana-${walletName.toLowerCase().replace(/\s+/g, '-')}`,
      name: walletName,
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic29sYW5hR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMEZGQzM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwRDg5NTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgcng9IjgiIGZpbGw9InVybCgjc29sYW5hR3JhZCkiLz4KICA8cGF0aCBkPSJNOCAxOUwyNCAxOUwyNCAxNEw4IDE0TDggMTlaIiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik04IDI0TDI0IDI0TDI0IDE5TDggMTlMOCAyNFoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjciLz4KICA8cGF0aCBkPSJNOCAxNEwyNCAxNEwyNCA5TDggOUw4IDE0WiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNyIvPgo8L3N2Zz4=',
      metadata: {
        ...(provider.version && { version: provider.version }),
      },
    };
  }

  /**
   * Infer wallet name from injection path
   */
  private inferWalletNameFromPath(path: string): string {
    if (path.includes('phantom')) return 'Phantom';
    if (path.includes('solflare')) return 'Solflare';
    if (path.includes('backpack')) return 'Backpack';
    if (path.includes('glow')) return 'Glow';
    if (path.includes('coinbase')) return 'Coinbase';
    if (path.includes('trust')) return 'Trust Wallet';
    if (path.includes('exodus')) return 'Exodus';
    if (path.includes('math')) return 'MathWallet';
    if (path.includes('slope')) return 'Slope';
    if (path.includes('torus')) return 'Torus';
    if (path.includes('brave')) return 'Brave';
    if (path.includes('tokenpocket')) return 'TokenPocket';
    if (path === 'window.solana') return 'Solana Wallet';
    return 'Unknown Solana Wallet';
  }

  /**
   * Create a discovered wallet object from wallet standard
   */
  private createDiscoveredWallet(
    wallet: SolanaWalletStandardWallet,
    type: 'wallet-standard',
  ): DiscoveredSolanaWallet {
    return {
      id: wallet.name.toLowerCase().replace(/\s+/g, '-'),
      name: wallet.name,
      icon: wallet.icon,
      type,
      provider: wallet,
      metadata: {
        chains: wallet.chains,
        features: Object.keys(wallet.features),
      },
    };
  }

  /**
   * Deduplicate wallets between standard and injected
   */
  private deduplicateWallets(
    walletStandard: DiscoveredSolanaWallet[],
    injected: DiscoveredSolanaWallet[],
  ): {
    walletStandard: DiscoveredSolanaWallet[];
    injected: DiscoveredSolanaWallet[];
    legacy: DiscoveredSolanaWallet[];
  } {
    const standardIds = new Set(walletStandard.map((w) => w.id));
    const deduplicatedInjected: DiscoveredSolanaWallet[] = [];
    const legacy: DiscoveredSolanaWallet[] = [];

    for (const wallet of injected) {
      // Check if wallet exists in standard
      if (standardIds.has(wallet.id)) {
        // If prefer standard, skip injected version
        if (this.config.preferWalletStandard) {
          if (this.config.includeDeprecated) {
            legacy.push({ ...wallet, type: 'legacy' });
          }
          continue;
        }
      }
      deduplicatedInjected.push(wallet);
    }

    return {
      walletStandard,
      injected: deduplicatedInjected,
      legacy,
    };
  }

  /**
   * Get all discovered wallets
   */
  getDiscoveredWallets(): DiscoveredSolanaWallet[] {
    return Array.from(this.discoveredWallets.values());
  }

  /**
   * Get all discovered wallets (alias for consistency with EVM)
   */
  getAllWallets(results?: SolanaDiscoveryResults): DiscoveredSolanaWallet[] {
    if (results) {
      // Flatten the results into a single array
      const wallets: DiscoveredSolanaWallet[] = [
        ...results.walletStandardWallets,
        ...results.injectedWallets,
      ];
      if (results.legacyWallets) {
        wallets.push(...results.legacyWallets);
      }
      return wallets;
    }
    return this.getDiscoveredWallets();
  }

  /**
   * Get a specific wallet by ID
   */
  getWalletById(id: string): DiscoveredSolanaWallet | undefined {
    return this.discoveredWallets.get(id);
  }

  /**
   * Clear all discovered wallets
   */
  clear(): void {
    this.discoveredWallets.clear();
  }

  /**
   * Cleanup listeners and resources
   */
  cleanup(): void {
    // Clear any pending timeouts
    for (const timeoutId of this.timeoutIds) {
      clearTimeout(timeoutId);
    }
    this.timeoutIds.clear();

    // Remove wallet standard listeners
    if (typeof window !== 'undefined') {
      for (const listener of this.walletStandardListeners) {
        window.removeEventListener('wallet-standard:register', listener as EventListener);
      }
    }
    this.walletStandardListeners.clear();

    // Clear discovered wallets
    this.discoveredWallets.clear();

    this.logger.debug('Solana discovery service cleaned up');
  }
}

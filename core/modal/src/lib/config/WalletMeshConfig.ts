import type { WalletInfo, DappInfo } from '../../types.js';
import type { TimeoutConfig } from '../utils/timeout.js';
import { WalletList } from '../../config/wallets.js';
import { DefaultIcon } from '../constants/defaultIcons.js';

/**
 * Configuration required by the WalletProvider
 * @interface WalletMeshProviderConfig
 * @property {WalletInfo[]} wallets - List of supported wallets
 * @property {DappInfo} dappInfo - Information about the DApp
 * @property {string[] | undefined} supportedChains - Optional list of supported chain IDs
 * @property {TimeoutConfig | undefined} timeoutConfig - Optional timeout configuration
 */
export interface WalletMeshProviderConfig {
  wallets: WalletInfo[];
  dappInfo: DappInfo;
  supportedChains: string[] | undefined;
  timeoutConfig?: TimeoutConfig;
}

/**
 * Builder class for creating WalletMesh configurations
 * @class WalletMeshConfig
 * @description Provides a fluent API for configuring WalletMesh, including wallet list
 * management, DApp information, chain support settings, and operation timeouts.
 *
 * @example
 * ```typescript
 * const config = WalletMeshConfig.create()
 *   .clearWallets() // Clear default wallets
 *   .addWallet({
 *     id: "my_wallet",
 *     name: "My Wallet",
 *     icon: "data:image/svg+xml,...", // Must be data URI
 *     adapter: {
 *       type: AdapterType.WalletMeshAztec,
 *       options: { chainId: "aztec:testnet" }
 *     },
 *     transport: {
 *       type: TransportType.PostMessage,
 *       options: { origin: "https://wallet.example.com" }
 *     }
 *   })
 *   .setSupportedChains(["aztec:testnet", "aztec:mainnet"])
 *   .setDappInfo({
 *     name: "My DApp",
 *     description: "A decentralized application",
 *     origin: "https://mydapp.com"
 *   })
 *   .setTimeout({
 *     connectionTimeout: 30000, // 30s for initial connection
 *     operationTimeout: 10000   // 10s for other operations
 *   })
 *   .build();
 * ```
 */
export class WalletMeshConfig {
  private wallets: WalletInfo[];
  private dappInfo?: DappInfo;
  private supportedChains?: string[];
  private timeoutConfig: TimeoutConfig;

  private constructor() {
    // Initialize with default WalletList
    this.wallets = [...WalletList];
    this.timeoutConfig = {
      connectionTimeout: 30000, // 30s default
      operationTimeout: 10000, // 10s default
    };
  }

  /**
   * Create a new WalletMeshConfig builder instance
   * @returns {WalletMeshConfig} Builder instance initialized with default wallets
   */
  static create(): WalletMeshConfig {
    return new WalletMeshConfig();
  }

  /**
   * Remove all wallets from the configuration
   * @returns {WalletMeshConfig} Builder instance for chaining
   */
  clearWallets(): WalletMeshConfig {
    this.wallets = [];
    return this;
  }

  /**
   * Add a wallet to the configuration
   * @param {WalletInfo} wallet - Wallet configuration to add
   * @returns {WalletMeshConfig} Builder instance for chaining
   * @throws {Error} If the wallet icon is not a valid data URI
   *
   * @example
   * ```typescript
   * config.addWallet({
   *   id: "aztec_web",
   *   name: "Aztec Web Wallet",
   *   url: "https://wallet.aztec.network",
   *   transport: {
   *     type: TransportType.PostMessage,
   *     options: { origin: "https://wallet.aztec.network" }
   *   },
   *   adapter: {
   *     type: AdapterType.WalletMeshAztec,
   *     options: { chainId: "aztec:mainnet" }
   *   }
   * });
   * ```
   */
  addWallet(wallet: WalletInfo): WalletMeshConfig {
    this.validateIcon(wallet.icon, `Wallet "${wallet.name}"`);
    this.wallets.push(wallet);
    return this;
  }

  /**
   * Add multiple wallets to the configuration
   * @param {WalletInfo[]} wallets - Array of wallet configurations
   * @returns {WalletMeshConfig} Builder instance for chaining
   * @throws {Error} If any wallet icon is not a valid data URI
   */
  addWallets(wallets: WalletInfo[]): WalletMeshConfig {
    for (const wallet of wallets) {
      this.validateIcon(wallet.icon, `Wallet "${wallet.name}"`);
    }
    this.wallets.push(...wallets);
    return this;
  }

  /**
   * Remove a wallet from the configuration
   * @param {string} walletId - ID of the wallet to remove
   * @returns {WalletMeshConfig} Builder instance for chaining
   */
  removeWallet(walletId: string): WalletMeshConfig {
    this.wallets = this.wallets.filter((w) => w.id !== walletId);
    return this;
  }

  /**
   * Set the list of supported blockchain networks
   * @param {string[]} chains - Array of chain identifiers
   * @returns {WalletMeshConfig} Builder instance for chaining
   *
   * @example
   * ```typescript
   * config.setSupportedChains([
   *   "aztec:testnet",
   *   "aztec:mainnet"
   * ]);
   * ```
   */
  setSupportedChains(chains: string[]): WalletMeshConfig {
    this.supportedChains = chains;
    return this;
  }

  /**
   * Set timeouts for wallet operations
   * @param {TimeoutConfig} config - Timeout configuration
   * @param {number} [config.connectionTimeout] - Timeout for initial connection (default: 30000ms)
   * @param {number} [config.operationTimeout] - Timeout for other operations (default: 10000ms)
   * @returns {WalletMeshConfig} Builder instance for chaining
   *
   * @example
   * ```typescript
   * config.setTimeout({
   *   connectionTimeout: 30000, // 30s for initial connection
   *   operationTimeout: 10000   // 10s for other operations
   * });
   * ```
   */
  setTimeout(config: TimeoutConfig): WalletMeshConfig {
    this.timeoutConfig = {
      ...this.timeoutConfig,
      ...config,
    };
    return this;
  }

  /**
   * Set information about the DApp
   * @param {DappInfo} info - DApp configuration
   * @returns {WalletMeshConfig} Builder instance for chaining
   * @throws {Error} If the DApp icon is not a valid data URI
   *
   * @example
   * ```typescript
   * config.setDappInfo({
   *   name: "My DApp",
   *   description: "A decentralized application",
   *   origin: "https://mydapp.com",
   *   icon: "data:image/svg+xml,...", // Optional, must be data URI
   *   rpcUrl: "https://rpc.example.com" // Optional
   * });
   * ```
   */
  setDappInfo(info: DappInfo): WalletMeshConfig {
    // Validate dapp icon if provided
    this.validateIcon(info.icon, 'DApp');
    this.dappInfo = info;
    return this;
  }

  /**
   * Validate that an icon is a proper data URI
   * @private
   * @param {string | undefined} icon - Icon URL or data URI
   * @param {string} context - Context for error messages
   * @throws {Error} If the icon is provided but not a data URI
   */
  private validateIcon(icon: string | undefined, context: string): void {
    if (icon && !this.isDataUri(icon)) {
      throw new Error(`${context} icon must be a data URI when provided. Received: ${icon}`);
    }
  }

  /**
   * Check if a string is a data URI
   * @private
   * @param {string} uri - URI to check
   * @returns {boolean} True if the URI is a data URI
   */
  private isDataUri(uri: string): boolean {
    return uri.startsWith('data:');
  }

  /**
   * Filter wallets based on supported chains
   * @private
   * @returns {WalletInfo[]} List of wallets supporting configured chains
   */
  private filterWalletsByChain(): WalletInfo[] {
    if (!this.supportedChains || this.supportedChains.length === 0) {
      return this.wallets;
    }

    return this.wallets.filter((wallet) => {
      if (!wallet.supportedChains || wallet.supportedChains.length === 0) {
        return true;
      }
      return wallet.supportedChains.some((chain) => {
        const chains = this.supportedChains;
        return chains ? chains.includes(chain) : false;
      });
    });
  }

  /**
   * Build the final configuration
   * @returns {WalletMeshProviderConfig} Configuration for WalletProvider
   * @throws {Error} If DApp information has not been set
   *
   * @example
   * ```typescript
   * const config = WalletMeshConfig.create()
   *   .addWallet(...)
   *   .setDappInfo(...)
   *   .build();
   *
   * return (
   *   <WalletProvider config={config}>
   *     <App />
   *   </WalletProvider>
   * );
   * ```
   */
  build(): WalletMeshProviderConfig {
    if (!this.dappInfo) {
      throw new Error('DappInfo must be set before building config');
    }

    return {
      wallets: this.filterWalletsByChain(),
      dappInfo: {
        ...this.dappInfo,
        icon: this.dappInfo.icon ?? DefaultIcon.Dapp,
      },
      supportedChains: this.supportedChains,
      timeoutConfig: this.timeoutConfig,
    };
  }
}

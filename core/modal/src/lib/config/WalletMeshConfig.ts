import type { WalletInfo, DappInfo } from '../../types.js';
import type { TimeoutConfig } from '../utils/timeout.js';
import { WalletList } from '../../config/wallets.js';
import { DefaultIcon } from '../constants/defaultIcons.js';

/**
 * Configuration object for WalletMesh provider initialization.
 *
 * Defines the complete configuration required to initialize a WalletMesh
 * provider, including supported wallets, dApp information, chain support,
 * and operation timeouts.
 *
 * @property wallets - List of supported wallet configurations
 * @property dappInfo - Information about the dApp for wallet display
 * @property supportedChains - Optional list of supported chain IDs
 * @property timeoutConfig - Optional timeout configuration
 *
 * @remarks
 * Security considerations:
 * - Icons must be data URIs to prevent XSS
 * - Origins should be explicitly specified
 * - Chain IDs should be validated
 *
 * @example
 * ```typescript
 * const config: WalletMeshProviderConfig = {
 *   wallets: [
 *     {
 *       id: 'my-wallet',
 *       name: 'My Wallet',
 *       icon: 'data:image/svg+xml,...',
 *       transport: { type: 'postMessage' },
 *       adapter: { type: 'wm_aztec' }
 *     }
 *   ],
 *   dappInfo: {
 *     name: 'My dApp',
 *     icon: 'data:image/svg+xml,...',
 *     origin: 'https://mydapp.com'
 *   },
 *   supportedChains: ['aztec:testnet'],
 *   timeoutConfig: {
 *     connectionTimeout: 30000
 *   }
 * };
 * ```
 */
export interface WalletMeshProviderConfig {
  wallets: WalletInfo[];
  dappInfo: DappInfo;
  supportedChains: string[] | undefined;
  timeoutConfig?: TimeoutConfig;
}

/**
 * Builder for creating WalletMesh configurations with validation.
 *
 * Provides a fluent API for configuring WalletMesh components with:
 * - Wallet list management
 * - DApp information setup
 * - Chain support configuration
 * - Operation timeout settings
 * - Built-in validation
 * - Default configurations
 *
 * Key features:
 * - Validates all configuration at build time
 * - Enforces security best practices
 * - Provides sensible defaults
 * - Supports incremental configuration
 * - Type-safe builder pattern
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
   * Creates a new WalletMeshConfig builder instance.
   *
   * @returns A builder instance initialized with default settings
   *
   * @remarks
   * Default configuration includes:
   * - Built-in wallet list
   * - Standard operation timeouts
   * - No chain restrictions
   * - No dApp information
   *
   * @example
   * ```typescript
   * // Basic usage
   * const config = WalletMeshConfig.create()
   *   .setDappInfo({ name: 'My dApp' })
   *   .build();
   *
   * // Custom initialization
   * const config = WalletMeshConfig.create()
   *   .clearWallets()
   *   .addWallets(customWallets)
   *   .build();
   * ```
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
  /**
   * Validates icon format for security.
   *
   * @param icon - Icon URL or data URI to validate
   * @param context - Description for error messages
   * @throws {Error} If icon is provided but not a data URI
   *
   * @remarks
   * Security measures:
   * - Requires data URIs to prevent XSS
   * - Validates icon format before use
   * - Provides clear error messages
   *
   * @internal
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
  /**
   * Checks if a string is a valid data URI.
   *
   * @param uri - URI to validate
   * @returns True if URI is a valid data URI
   *
   * @remarks
   * Performs basic validation by checking the 'data:' prefix.
   * Full MIME type validation could be added for stricter checking.
   *
   * @internal
   */
  private isDataUri(uri: string): boolean {
    return uri.startsWith('data:');
  }

  /**
   * Filter wallets based on supported chains
   * @private
   * @returns {WalletInfo[]} List of wallets supporting configured chains
   */
  /**
   * Filters wallet list based on chain support.
   *
   * @returns List of wallets supporting configured chains
   *
   * @remarks
   * Filtering logic:
   * - Wallets without chain restrictions are always included
   * - Wallets must support at least one configured chain
   * - No chains configured means all wallets are included
   *
   * @internal
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

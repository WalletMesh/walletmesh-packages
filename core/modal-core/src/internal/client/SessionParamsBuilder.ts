/**
 * Session Parameter Builder
 *
 * Encapsulates the logic for building CreateSessionParams objects from wallet connections.
 * This extracts the verbose session creation logic from WalletMeshClientImpl to improve
 * maintainability and testability.
 *
 * @module internal/client/SessionParamsBuilder
 * @internal
 */

import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import type { WalletConnection } from '../../api/types/connection.js';
import type { CreateSessionParams } from '../../api/types/sessionState.js';
import { ChainType } from '../../types.js';
import type { WalletAdapter } from '../wallets/base/WalletAdapter.js';
import type { ConnectOptions } from '../wallets/base/WalletAdapter.js';
import type { WalletMeshConfig } from './WalletMeshClient.js';

/**
 * Builder for CreateSessionParams
 *
 * Encapsulates session parameter construction logic to improve code maintainability
 * and enable isolated testing of session building.
 *
 * @example
 * ```typescript
 * const builder = new SessionParamsBuilder(
 *   'metamask',
 *   connection,
 *   adapter,
 *   config,
 *   options
 * );
 * const sessionParams = builder.build();
 * ```
 *
 * @internal
 */
export class SessionParamsBuilder {
  private walletId: string;
  private connection: WalletConnection;
  private adapter: WalletAdapter;
  private config: WalletMeshConfig;
  private options: ConnectOptions | undefined;

  constructor(
    walletId: string,
    connection: WalletConnection,
    adapter: WalletAdapter,
    config: WalletMeshConfig,
    options?: ConnectOptions,
  ) {
    this.walletId = walletId;
    this.connection = connection;
    this.adapter = adapter;
    this.config = config;
    this.options = options;
  }

  /**
   * Build accounts array from connection
   *
   * Maps connection addresses to account objects with derivation paths
   * based on the chain type.
   *
   * @returns Array of account objects
   * @private
   */
  private buildAccounts(): Array<{
    address: string;
    index: number;
    derivationPath: string;
    isActive: boolean;
  }> {
    const addresses = this.connection.accounts || [this.connection.address];

    return addresses.map((address, index) => ({
      address,
      index,
      derivationPath: this.buildDerivationPath(index),
      isActive: index === 0,
    }));
  }

  /**
   * Build derivation path based on chain type
   *
   * Returns the appropriate BIP-44 derivation path for the chain type:
   * - EVM: m/44'/60'/0'/0/{index} (Ethereum)
   * - Solana: m/44'/501'/{index}'/0' (Solana)
   * - Aztec: m/44'/144'/{index}'/0' (Aztec - placeholder)
   * - Default: m/44'/0'/{index}'/0' (Generic)
   *
   * @param index - Account index
   * @returns BIP-44 derivation path
   * @private
   */
  private buildDerivationPath(index: number): string {
    const chainType = this.connection.chain.chainType;

    switch (chainType) {
      case ChainType.Evm:
        return `m/44'/60'/0'/0/${index}`; // Ethereum
      case ChainType.Solana:
        return `m/44'/501'/${index}'/0'`; // Solana
      case ChainType.Aztec:
        return `m/44'/144'/${index}'/0'`; // Aztec (placeholder)
      default:
        return `m/44'/0'/${index}'/0'`; // Generic
    }
  }

  /**
   * Build chain information from connection
   *
   * @returns Chain info object
   * @private
   */
  private buildChainInfo(): {
    chainId: string;
    chainType: ChainType;
    name: string;
    required: boolean;
  } {
    return {
      chainId: this.connection.chain.chainId,
      chainType: this.connection.chain.chainType as ChainType,
      name: this.connection.chain.name || this.getDefaultChainName(),
      required: this.connection.chain.required,
    };
  }

  /**
   * Get default chain name from chain ID
   *
   * Attempts to extract a human-readable name from the chain ID
   * when no explicit name is provided.
   *
   * @returns Human-readable chain name
   * @private
   */
  private getDefaultChainName(): string {
    const chainId = this.connection.chain.chainId;

    // Try to extract name from chain ID
    if (typeof chainId === 'string') {
      if (chainId.startsWith('aztec:')) {
        const network = chainId.split(':')[1];
        if (network) {
          return `Aztec ${network.charAt(0).toUpperCase() + network.slice(1)}`;
        }
      }
      if (chainId.startsWith('solana:')) {
        return 'Solana';
      }
      // EVM chain IDs
      if (chainId === '1' || chainId === '0x1') {
        return 'Ethereum Mainnet';
      }
      if (chainId === '137' || chainId === '0x89') {
        return 'Polygon';
      }
    }

    return 'Unknown Chain';
  }

  /**
   * Build provider metadata
   *
   * Creates metadata about the provider including type, version,
   * and capabilities.
   *
   * @returns Provider metadata object
   * @private
   */
  private buildProviderMetadata(): {
    type: string;
    version: string;
    multiChainCapable: boolean;
    supportedMethods: string[];
  } {
    return {
      type: this.inferProviderType(),
      version: '1.0.0',
      multiChainCapable: this.adapter.capabilities.chains.length > 1,
      supportedMethods: this.adapter.capabilities.permissions?.methods || ['*'],
    };
  }

  /**
   * Infer provider type from chain type
   *
   * Maps chain types to their corresponding provider interface types.
   *
   * @returns Provider type string
   * @private
   */
  private inferProviderType(): string {
    const chainType = this.connection.chain.chainType;

    switch (chainType) {
      case ChainType.Evm:
        return 'eip1193';
      case ChainType.Solana:
        return 'solana-wallet-standard';
      case ChainType.Aztec:
        return 'aztec-router';
      default:
        return 'unknown';
    }
  }

  /**
   * Build permissions from adapter capabilities
   *
   * @returns Permissions object with methods and events
   * @private
   */
  private buildPermissions(): {
    methods: string[];
    events: string[];
  } {
    return {
      methods: this.adapter.capabilities.permissions?.methods || ['*'],
      events: this.adapter.capabilities.permissions?.events || ['accountsChanged', 'chainChanged'],
    };
  }

  /**
   * Build metadata for the session
   *
   * Includes wallet information, dApp information, and connection details.
   *
   * @returns Metadata object
   * @private
   */
  private buildMetadata(): {
    wallet: { name: string; icon: string; version: string };
    dapp: { name: string; url?: string; icon?: string };
    connection: {
      initiatedBy: 'user' | 'dapp' | 'auto';
      method: 'manual' | 'deeplink' | 'qr' | 'extension' | 'injected';
      userAgent?: string;
    };
  } {
    return {
      wallet: {
        name: this.adapter.metadata.name || 'Unknown Wallet',
        icon: this.adapter.metadata.icon || '',
        version: '1.0.0',
      },
      dapp: {
        name: this.config.appName,
        ...(this.config.appUrl && { url: this.config.appUrl }),
        ...(this.config.appIcon && { icon: this.config.appIcon }),
      },
      connection: {
        initiatedBy: 'user' as const,
        method: 'manual' as const,
        ...(typeof navigator !== 'undefined' &&
          navigator.userAgent && { userAgent: navigator.userAgent }),
      },
    };
  }

  /**
   * Build complete session parameters
   *
   * Constructs the full CreateSessionParams object by combining all
   * the individual components. The provider must be adapted separately
   * by the caller using `adaptWalletProviderToBlockchainProvider()`.
   *
   * @returns Complete CreateSessionParams object (provider needs adaptation)
   * @public
   */
  build(): CreateSessionParams {
    const params: CreateSessionParams = {
      walletId: this.walletId,
      accounts: this.buildAccounts(),
      activeAccountIndex: 0,
      chain: this.buildChainInfo(),
      // Provider will be replaced by caller with adapted version
      provider: this.connection.provider as unknown as BlockchainProvider,
      providerMetadata: this.buildProviderMetadata(),
      permissions: this.buildPermissions(),
      metadata: this.buildMetadata(),
    };

    // Add session ID if provided in options and not requesting new session
    if (this.options?.sessionId && this.options.requestNewSession !== true) {
      params.sessionId = this.options.sessionId;
    }

    return params;
  }
}

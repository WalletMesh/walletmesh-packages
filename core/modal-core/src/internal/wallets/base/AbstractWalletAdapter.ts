/**
 * Enhanced Base Wallet Adapter - Connection Layer Implementation
 *
 * ARCHITECTURAL ROLE: Adapters handle HOW to connect to specific wallet implementations.
 * They are the connection specialists that know the wallet-specific protocols,
 * transport mechanisms, and connection flows.
 *
 * This base class provides infrastructure for wallet adapters including:
 * - Wallet detection and discovery
 * - Transport establishment (popup, extension, mobile, etc.)
 * - Connection state management
 * - Provider instantiation with established transport
 * - Session persistence and recovery
 * - Resource cleanup and lifecycle management
 * - Event coordination between wallet and dApp
 *
 * RELATIONSHIP WITH PROVIDERS:
 * - Adapters CREATE providers after establishing a transport connection
 * - Providers handle the blockchain API (sendTransaction, signMessage, etc.)
 * - Adapters handle the connection details (how to reach the wallet)
 * - Together they separate connection concerns from blockchain interaction
 *
 * External developers only need to implement:
 * - Wallet-specific connection logic
 * - Transport establishment
 * - Provider instantiation with the transport
 *
 * @see ADAPTER_PROVIDER_ARCHITECTURE.md for detailed architecture explanation
 * @module internal/adapters/wallet/AbstractWalletAdapter
 * @packageDocumentation
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { EventEmitter } from 'eventemitter3';
import { createTransport } from '../../../api/transports/transports.js';
import type { WalletAdapterConnectionState, WalletConnection } from '../../../api/types/connection.js';
import { ConnectionStatus } from '../../../api/types/connectionStatus.js';
import type { ProviderClass, WalletProvider } from '../../../api/types/providers.js';
import type { ChainType } from '../../../types.js';
import type { TransportType } from '../../../types.js';
import type { Transport } from '../../../types.js';
import { generateSessionId as generateSecureSessionId } from '../../../utils/crypto.js';
// import { TransportToJsonrpcAdapter } from '../../adapters/TransportToJsonrpcAdapter.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { Logger } from '../../core/logger/logger.js';
import { WalletStorage } from '../../utils/dom/storage.js';
import type { AdapterSessionData } from '../../utils/dom/storage.js';
import type {
  AdapterContext,
  AdapterEvent,
  ConnectOptions,
  DetectionResult,
  EventData,
  EventHandler,
  Unsubscribe,
  WalletAdapter,
  WalletAdapterMetadata,
  WalletCapabilities,
} from './WalletAdapter.js';

/**
 * Configuration for AbstractWalletAdapter
 */
export interface AbstractWalletAdapterConfig {
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Base Wallet Adapter - Foundation for wallet connection implementations
 *
 * PURPOSE: Adapters are CONNECTION LAYER components that handle HOW to connect to specific wallets.
 * They manage the transport establishment, connection protocols, and wallet-specific communication.
 *
 * ARCHITECTURAL SEPARATION:
 * - Adapters: Handle wallet connection (this class)
 * - Providers: Handle blockchain API (created by adapters after connection)
 *
 * This base class provides infrastructure that reduces adapter implementation complexity by handling:
 * - Wallet detection and availability checks
 * - Transport lifecycle (popup windows, extensions, mobile connections)
 * - Provider instantiation with established transport
 * - Connection state management and persistence
 * - Event coordination between wallet and dApp
 * - Resource cleanup and memory management
 *
 * @example
 * ```typescript
 * // Implementing a wallet adapter (connection layer)
 * export class MyWalletAdapter extends AbstractWalletAdapter {
 *   readonly id = 'mywallet';
 *
 *   readonly metadata = {
 *     name: 'My Wallet',
 *     icon: 'https://...',
 *     description: 'My custom wallet'
 *   };
 *
 *   readonly capabilities = {
 *     chains: [{ type: ChainType.Evm, id: '1' }],
 *     features: ['sign-message', 'sign-transaction'],
 *   };
 *
 *   async connect(options?: ConnectOptions): Promise<WalletConnection> {
 *     // 1. Establish transport (wallet-specific connection)
 *     const transport = await this.createTransport('popup', {
 *       url: 'https://wallet.example.com'
 *     });
 *
 *     // 2. Create provider with transport (blockchain API)
 *     const provider = await this.createProvider(
 *       EvmProvider,  // Provider handles blockchain operations
 *       transport,    // Transport from step 1
 *       ChainType.Evm,
 *       chainId
 *     );
 *
 *     // 3. Return connection with provider for dApp use
 *     return this.createConnection({
 *       address: accounts[0],
 *       accounts,
 *       chainId,
 *       chainType: ChainType.Evm,
 *       provider  // dApp will use this for blockchain operations
 *     });
 *   }
 * }
 * ```
 *
 * @remarks
 * - Adapters know HOW to connect to wallets (transport, protocol, discovery)
 * - Providers know HOW to interact with blockchains (transactions, signing, queries)
 * - Adapters create providers after establishing connection
 * - This separation enables code reuse and standards compliance
 *
 * @see ADAPTER_PROVIDER_ARCHITECTURE.md for architecture details
 * @public
 * @abstract
 */
export abstract class AbstractWalletAdapter implements WalletAdapter {
  abstract readonly id: string;
  abstract readonly metadata: WalletAdapterMetadata;
  abstract readonly capabilities: WalletCapabilities;

  /**
   * Default supported providers - empty by default
   * Override in subclasses to specify supported provider classes
   */
  readonly supportedProviders: Partial<Record<ChainType, ProviderClass>> = {};

  /**
   * Event emitter for adapter events
   */
  protected readonly eventEmitter = new EventEmitter();

  /**
   * Connection state - automatically managed by AbstractWalletAdapter
   *
   * This state is private and managed internally. Subclasses should not
   * directly modify this state. Instead, use the protected helper methods
   * like updateConnectionState() which handle state updates and event emission.
   */
  private connectionState: WalletAdapterConnectionState = {
    status: ConnectionStatus.Disconnected,
    connection: null,
    error: null,
    isConnected: false,
    isConnecting: false,
    address: null,
    chain: null,
    chainType: null,
    accounts: [],
  };

  /**
   * Persisted session data for potential reconnection
   */
  private persistedSession?: AdapterSessionData;

  /**
   * Active transport instance
   */
  protected transport: Transport | null = null;

  /**
   * Active provider instances by chain type
   */
  protected providers = new Map<ChainType, WalletProvider>();

  /**
   * Logger instance
   */
  protected logger?: AdapterContext['logger'];

  /**
   * Debug mode
   */
  protected debug = false;

  /**
   * Storage instance for session persistence
   */
  protected storage: WalletStorage | null = null;

  /**
   * Get current connection state (read-only)
   */
  get state(): WalletAdapterConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Get current connection (read-only)
   */
  get connection(): WalletConnection | null {
    return this.connectionState.connection;
  }

  /**
   * Initialize the adapter with context
   *
   * Called by the framework when the adapter is registered. Subclasses can
   * override to perform additional initialization but should call super.install().
   *
   * @param context - Adapter context with logger and configuration
   *
   * @example
   * ```typescript
   * async install(context: AdapterContext): Promise<void> {
   *   await super.install(context);
   *   // Additional initialization
   *   this.initializeCustomFeatures();
   * }
   * ```
   */
  async install(context: AdapterContext): Promise<void> {
    this.logger = context.logger;
    this.debug = Boolean((context as { debug?: boolean }).debug);
    this.log('debug', 'Installing adapter', { id: this.id });

    // Initialize storage for session persistence
    try {
      // Create a logger instance for storage if needed
      const storageLogger =
        this.logger instanceof Logger ? this.logger : new Logger(this.debug, `${this.id}-storage`);

      this.storage = new WalletStorage({ prefix: 'walletmesh_' }, storageLogger);

      // Attempt to restore previous session
      await this.restoreSession();
    } catch (error) {
      this.log('warn', 'Failed to initialize storage or restore session', error);
    }
  }

  /**
   * Clean up adapter resources
   */
  async uninstall(): Promise<void> {
    await this.cleanup();
  }

  /**
   * Abstract methods that subclasses must implement
   */
  abstract detect(): Promise<DetectionResult>;
  abstract connect(options?: ConnectOptions): Promise<WalletConnection>;
  abstract disconnect(): Promise<void>;

  /**
   * Optional: Override to set up provider event listeners
   * This is called automatically after provider creation
   */
  protected setupProviderListeners?(provider: WalletProvider): void;

  /**
   * Subscribe to adapter events
   */
  on<E extends AdapterEvent>(event: E, handler: EventHandler<E>): Unsubscribe {
    this.eventEmitter.on(event, handler);
    return () => this.eventEmitter.off(event, handler);
  }

  /**
   * Subscribe to a one-time event
   */
  once<E extends AdapterEvent>(event: E, handler: EventHandler<E>): Unsubscribe {
    this.eventEmitter.once(event, handler);
    return () => this.eventEmitter.off(event, handler);
  }

  /**
   * Unsubscribe from an event
   */
  off<E extends AdapterEvent>(event: E, handler: EventHandler<E>): void {
    this.eventEmitter.off(event, handler);
  }

  /**
   * Default implementation returns undefined
   * Override in subclasses to provide JSON-RPC transport
   *
   * @param _chainType - The chain type to get transport for
   * @returns JSON-RPC transport instance or undefined if not supported
   */
  getJSONRPCTransport?(_chainType: ChainType): JSONRPCTransport | undefined {
    // Default implementation returns undefined
    // Subclasses can override to provide transport
    return undefined;
  }

  /**
   * Get provider for a specific chain type
   * @param chainType - Type of blockchain
   * @returns Provider instance
   * @throws {Error} If chain type not supported or not connected
   */
  getProvider(chainType: ChainType): WalletProvider {
    const provider = this.providers.get(chainType);
    if (!provider) {
      throw ErrorFactory.configurationError(`Provider not found for chain type: ${chainType}`, {
        walletId: this.id,
        chainType,
        availableChainTypes: Array.from(this.providers.keys()),
      });
    }
    return provider;
  }

  /**
   * Check if a provider is available for a chain type
   * @param chainType - Type of blockchain to check
   */
  hasProvider(chainType: ChainType): boolean {
    return this.providers.has(chainType);
  }

  /**
   * INFRASTRUCTURE HELPER: Create transport instance
   *
   * Handles transport lifecycle and cleanup automatically. Subclasses should use
   * this method instead of creating transports directly to ensure proper
   * lifecycle management and error handling.
   *
   * @param type - Transport type ('popup' | 'extension')
   * @param config - Transport-specific configuration
   * @returns Transport instance ready for use
   *
   * @example
   * ```typescript
   * protected async doConnect(options?: ConnectOptions): Promise<WalletConnection> {
   *   // Create popup transport
   *   const transport = await this.createTransport('popup', {
   *     url: 'https://wallet.example.com',
   *     width: 400,
   *     height: 600
   *   });
   *
   *   // Transport is automatically managed
   *   const provider = await this.createProvider(EvmProvider, transport);
   *   // ...
   * }
   * ```
   *
   * @throws {ModalError} Transport error if creation fails
   */
  protected async createTransport(
    type: TransportType,
    config: Record<string, unknown> = {},
  ): Promise<Transport> {
    this.log('debug', 'Creating transport', { type, config });

    // Clean up existing transport if any
    if (this.transport) {
      await this.cleanupTransport();
    }

    try {
      // Create transport using factory
      this.transport = await createTransport(type, config);

      // Set up transport error handling
      if ('on' in this.transport && typeof this.transport.on === 'function') {
        this.transport.on('error', (event: unknown) => {
          const error = event instanceof Error ? event : ErrorFactory.transportError('Transport error');
          this.log('error', 'Transport error', error);
          this.emit('error', {
            error: ErrorFactory.transportError(error.message),
            operation: 'transport',
          });
        });
      }

      return this.transport;
    } catch (error) {
      this.log('error', 'Failed to create transport', error);
      throw ErrorFactory.transportError(
        `Failed to create transport: ${error instanceof Error ? error.message : String(error)}`,
        type,
      );
    }
  }

  /**
   * INFRASTRUCTURE HELPER: Instantiate a blockchain provider with established transport
   *
   * This method creates the PROVIDER (blockchain API layer) using the TRANSPORT
   * that the adapter has established. This is the key integration point between
   * the connection layer (adapter) and the API layer (provider).
   *
   * ARCHITECTURAL NOTE:
   * - Adapter establishes HOW to communicate (transport to wallet)
   * - Provider implements WHAT to communicate (blockchain operations)
   * - This method connects them: Provider + Transport = Functional blockchain API
   *
   * @param ProviderClass - Provider class that implements blockchain API
   * @param transport - Transport established by this adapter
   * @param chainType - Type of blockchain (EVM, Solana, Aztec)
   * @param chainId - Optional specific chain ID
   * @returns Provider instance ready for blockchain operations
   */
  protected async createProvider<T extends WalletProvider>(
    ProviderClass: ProviderClass,
    transport: Transport | JSONRPCTransport,
    chainType: ChainType,
    chainId?: string,
  ): Promise<T> {
    this.log('debug', 'Creating provider', { providerClass: ProviderClass.name });

    try {
      // Create a logger adapter that matches the Logger class interface
      const logger = this.createLoggerAdapter();

      // Create JSON-RPC transport adapter if needed
      const jsonrpcTransport =
        'request' in transport
          ? (transport as JSONRPCTransport)
          : (() => {
              throw ErrorFactory.configurationError(
                'TransportToJsonrpcAdapter not available after adapter removal',
              );
            })();

      const provider = new ProviderClass(chainType, jsonrpcTransport, chainId, logger) as T;

      // Store provider reference
      this.providers.set(chainType, provider);

      // Set up provider event listeners if defined
      if (this.setupProviderListeners) {
        this.setupProviderListeners(provider);
      }

      return provider;
    } catch (error) {
      this.log('error', 'Failed to create provider', error);
      throw ErrorFactory.connectionFailed(`Failed to create provider: ${ProviderClass.name}`, {
        providerClass: ProviderClass.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * INFRASTRUCTURE HELPER: Create connection object
   * Automatically updates state and emits events
   *
   * @param params - Connection parameters
   * @returns WalletConnection object
   */
  protected async createConnection(params: {
    address: string;
    accounts: string[];
    chainId: string;
    chainType: ChainType;
    provider: WalletProvider;
    providerType?: string;
    features?: string[];
    sessionId?: string;
    sessionMetadata?: Record<string, unknown>;
    chainName?: string;
    chainRequired?: boolean;
  }): Promise<WalletConnection> {
    // Generate session ID if not provided
    const sessionId = params.sessionId || this.generateSessionId();

    const connection: WalletConnection = {
      address: params.address,
      accounts: params.accounts,
      chain: {
        chainId: params.chainId,
        chainType: params.chainType,
        name: params.chainName || 'Unknown Chain',
        required: params.chainRequired ?? false,
      },
      chainType: params.chainType,
      provider: params.provider,
      walletId: this.id,
      walletInfo: {
        id: this.id,
        name: this.metadata.name,
        icon: this.metadata.icon,
        chains: this.capabilities.chains.map((chain) => chain.type),
      },
      sessionId,
      metadata: {
        connectedAt: Date.now(),
        lastActiveAt: Date.now(),
        source: 'walletmesh',
        ...(params.sessionMetadata && { sessionMetadata: params.sessionMetadata }),
      },
    };

    // Update internal state
    this.updateConnectionState({
      status: ConnectionStatus.Connected,
      connection,
      error: null,
      isConnected: true,
      isConnecting: false,
      address: params.address,
      chain: {
        chainId: params.chainId,
        chainType: params.chainType,
        name: params.chainName || 'Unknown Chain',
        required: params.chainRequired ?? false,
      },
      chainType: params.chainType,
    });

    // Persist session for recovery across page refreshes
    await this.persistSession(connection, sessionId);

    // Emit connection event
    this.emit('connection:established', { connection });
    this.emit('wallet:connected', { connection });

    return connection;
  }

  /**
   * INFRASTRUCTURE HELPER: Emit blockchain events
   * Use this instead of direct state updates
   *
   * @param event - Event type (without 'wallet:' prefix)
   * @param data - Event data
   */
  protected emitBlockchainEvent(
    event: 'accountsChanged' | 'chainChanged' | 'disconnected',
    data: unknown,
  ): void {
    this.log('debug', `Emitting blockchain event: wallet:${event}`, data);

    // Emit the simplified wallet: prefixed event
    switch (event) {
      case 'accountsChanged':
        this.emit('wallet:accountsChanged', data as { accounts: string[]; chainType?: ChainType });
        break;
      case 'chainChanged':
        this.emit('wallet:chainChanged', data as { chainId: string; chainType?: ChainType });
        break;
      case 'disconnected':
        this.emit('wallet:disconnected', data as { reason?: string });
        break;
    }
  }

  /**
   * INFRASTRUCTURE HELPER: Clean up all resources
   * Called automatically on disconnect and uninstall
   */
  protected async cleanup(): Promise<void> {
    this.log('debug', 'Cleaning up adapter resources');

    try {
      // Clear persisted session
      if (this.storage) {
        this.storage.clearAdapterSession(this.id);
      }

      // Clean up providers
      await this.cleanupProviders();

      // Clean up transport
      await this.cleanupTransport();

      // Clear all event listeners
      this.eventEmitter.removeAllListeners();

      // Reset connection state
      this.updateConnectionState({
        status: ConnectionStatus.Disconnected,
        connection: null,
        error: null,
        isConnected: false,
        isConnecting: false,
        address: null,
        chain: null,
        chainType: null,
      });
    } catch (error) {
      this.log('error', 'Error during cleanup', error);
    }
  }

  /**
   * Update connection state and emit state change event
   */
  private updateConnectionState(updates: Partial<WalletAdapterConnectionState>): void {
    const previousState = { ...this.connectionState };
    this.connectionState = { ...this.connectionState, ...updates };

    // Emit state change event
    this.emit('state:changed', { state: this.connectionState });

    // Log state changes in debug mode
    if (this.debug) {
      this.log('debug', 'Connection state updated', {
        previous: previousState,
        current: this.connectionState,
        changes: updates,
      });
    }
  }

  /**
   * Generate a unique session ID for wallet connections
   */
  protected generateSessionId(): string {
    return generateSecureSessionId(`session_${this.id}`);
  }

  /**
   * Persist session data to storage for recovery across page refreshes
   *
   * @param connection - The wallet connection to persist
   * @param sessionId - The session ID to use
   */
  protected async persistSession(connection: WalletConnection, sessionId: string): Promise<void> {
    if (!this.storage) {
      this.log('debug', 'Storage not available, skipping session persistence');
      return;
    }

    try {
      // Extract provider metadata if available
      let providerMetadata: Record<string, unknown> | undefined;
      const provider = connection.provider as unknown;
      if (provider && typeof provider === 'object') {
        // Check if provider has sessionId or other metadata
        if ('sessionId' in provider) {
          providerMetadata = { sessionId: (provider as { sessionId: unknown }).sessionId };
        }
        if (
          'getConnectionInfo' in provider &&
          typeof (provider as { getConnectionInfo: unknown }).getConnectionInfo === 'function'
        ) {
          try {
            const connectionInfo = await (
              provider as { getConnectionInfo: () => Promise<unknown> }
            ).getConnectionInfo();
            providerMetadata = { ...providerMetadata, connectionInfo };
          } catch (error) {
            this.log('debug', 'Failed to get connection info from provider', error);
          }
        }
      }

      const sessionData: AdapterSessionData = {
        walletId: this.id,
        sessionId,
        chainId: connection.chain.chainId,
        chainType: String(connection.chainType),
        accounts: connection.accounts,
        activeAccount: connection.address,
        metadata: {
          connectedAt: connection.metadata?.connectedAt || Date.now(),
          lastActiveAt: Date.now(),
          ...(connection.metadata?.sessionMetadata && {
            walletMetadata: connection.metadata.sessionMetadata,
          }),
          ...(providerMetadata && { providerMetadata }),
        },
        ...(this.transport && {
          transportConfig: {
            type: String((this.transport as { type?: unknown }).type || 'unknown'),
            config: {},
          },
        }),
      };

      this.storage.saveAdapterSession(this.id, sessionData);
      this.log('debug', 'Persisted session data', { walletId: this.id, sessionId });
    } catch (error) {
      this.log('error', 'Failed to persist session', error);
    }
  }

  /**
   * Restore a previously persisted session
   *
   * This method attempts to restore a session from storage but does not
   * automatically reconnect. Subclasses should override this method to
   * implement reconnection logic specific to their wallet type.
   */
  protected async restoreSession(): Promise<void> {
    if (!this.storage) {
      this.log('debug', 'Storage not available, skipping session restoration');
      return;
    }

    try {
      const sessionData = this.storage.getAdapterSession(this.id);
      if (!sessionData) {
        this.log('debug', 'No persisted session found');
        return;
      }

      this.log('info', 'Found persisted session', {
        walletId: sessionData.walletId,
        sessionId: sessionData.sessionId,
        chainId: sessionData.chainId,
      });

      // Store the session data for potential use during connect
      // Subclasses can override this method to implement auto-reconnect
      this.persistedSession = sessionData;

      // Touch the session to update last active time
      this.storage.touchAdapterSession(this.id);
    } catch (error) {
      this.log('error', 'Failed to restore session', error);
    }
  }

  /**
   * Get the persisted session data if available
   *
   * @returns The persisted session data or undefined
   */
  protected getPersistedSession(): AdapterSessionData | undefined {
    return this.persistedSession;
  }

  /**
   * Emit adapter event
   */
  private emit<E extends AdapterEvent>(event: E, data: EventData<E>): void {
    this.eventEmitter.emit(event, data);
  }

  /**
   * Log message with optional data
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    if (!this.logger) return;

    const prefixedMessage = `[${this.id}] ${message}`;

    switch (level) {
      case 'debug':
        if (this.debug) this.logger.debug(prefixedMessage, data);
        break;
      case 'info':
        this.logger.info(prefixedMessage, data);
        break;
      case 'warn':
        this.logger.warn(prefixedMessage, data);
        break;
      case 'error':
        this.logger.error(prefixedMessage, data);
        break;
    }
  }

  /**
   * Clean up transport
   */
  private async cleanupTransport(): Promise<void> {
    if (!this.transport) return;

    try {
      if ('disconnect' in this.transport && typeof this.transport.disconnect === 'function') {
        await this.transport.disconnect();
      } else if ('close' in this.transport && typeof this.transport.close === 'function') {
        await (this.transport as { close: () => Promise<void> }).close();
      }
    } catch (error) {
      this.log('warn', 'Error cleaning up transport', error);
    } finally {
      this.transport = null;
    }
  }

  /**
   * Clean up providers
   */
  private async cleanupProviders(): Promise<void> {
    for (const [chainType, provider] of this.providers.entries()) {
      try {
        if ('disconnect' in provider && typeof provider.disconnect === 'function') {
          await provider.disconnect();
        } else if ('close' in provider && typeof provider.close === 'function') {
          await (provider as { close: () => Promise<void> }).close();
        }
      } catch (error) {
        this.log('warn', `Error cleaning up ${chainType} provider`, error);
      }
    }
    this.providers.clear();
  }

  /**
   * Create a logger adapter that wraps the AdapterContext logger to match Logger class interface
   */
  private createLoggerAdapter(): Logger {
    // If no logger provided, create a default one
    if (!this.logger) {
      return new Logger(this.debug, `${this.id}-provider`);
    }

    // Return the AdapterContext logger directly if it's already a Logger instance
    if (this.logger instanceof Logger) {
      return this.logger as Logger;
    }

    // Create a wrapper that looks like Logger but uses the AdapterContext logger
    const adapterLogger = this.logger;
    const loggerWrapper = {
      debug: (message: string, data?: unknown) => {
        if (data !== undefined) {
          adapterLogger.debug(message, data);
        } else {
          adapterLogger.debug(message);
        }
      },
      info: (message: string, data?: unknown) => {
        if (data !== undefined) {
          adapterLogger.info(message, data);
        } else {
          adapterLogger.info(message);
        }
      },
      warn: (message: string, data?: unknown) => {
        if (data !== undefined) {
          adapterLogger.warn(message, data);
        } else {
          adapterLogger.warn(message);
        }
      },
      error: (message: string, error?: unknown) => {
        if (error !== undefined) {
          adapterLogger.error(message, error);
        } else {
          adapterLogger.error(message);
        }
      },
      // Add other Logger methods if needed
      setLevel: () => {},
      dispose: () => {},
      prefix: '[Adapter]',
      isDebugEnabled: true,
      log: () => {},
      sanitizeData: (data: unknown) => data,
    };

    const logger: unknown = loggerWrapper;
    return logger as Logger;
  }
}

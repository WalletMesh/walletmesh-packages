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
import { EventEmitter } from '../../core/events/eventEmitter.js';
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
import { useStore } from '../../../state/store.js';
import type { SessionState } from '../../../api/types/sessionState.js';
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
   * Cached persisted session data from Zustand store
   *
   * This field stores a SessionState object that was loaded from the Zustand store
   * during the `install()` lifecycle method. It enables adapters to detect and
   * restore previous wallet connections across page refreshes.
   *
   * **Architecture Note**: Prior to the Zustand migration (2025-01), adapters used
   * WalletStorage with a separate AdapterSessionData interface. Now, adapters access
   * the full SessionState from the unified Zustand store, providing richer context
   * for reconnection flows.
   *
   * **Usage Pattern**:
   * 1. `install()` calls `restoreSession()` which populates this field
   * 2. Subclass `connect()` methods can check this field to enable auto-reconnect
   * 3. `cleanup()` clears this field on disconnect
   *
   * @see {@link restoreSession} for how this field is populated
   * @see {@link persistSession} for how session data is saved to the store
   * @see {@link getPersistedSession} for accessing this field
   * @protected
   */
  protected persistedSession: SessionState | undefined;

  /**
   * Get current connection state (read-only)
   */
  get state(): WalletAdapterConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Initialize the adapter with context
   *
   * Called by the framework when the adapter is registered. This method sets up
   * the adapter's logger, debug mode, and **automatically attempts to restore any
   * previously persisted session from the Zustand store** to enable auto-reconnect
   * across page refreshes.
   *
   * Subclasses can override to perform additional initialization but **must call
   * super.install()** to ensure proper session restoration.
   *
   * **Session Restoration**: This method calls {@link restoreSession} which loads
   * session data from the Zustand store and populates {@link persistedSession}.
   * Subclasses can then check this field in their `connect()` method to implement
   * automatic reconnection logic.
   *
   * @param context - Adapter context with logger and configuration
   *
   * @see {@link restoreSession} for session restoration details
   * @see {@link persistedSession} for accessing restored session data
   *
   * @example
   * ```typescript
   * async install(context: AdapterContext): Promise<void> {
   *   // Always call super first to restore session
   *   await super.install(context);
   *
   *   // Additional initialization
   *   this.initializeCustomFeatures();
   *
   *   // Optionally check for persisted session
   *   const session = this.getPersistedSession();
   *   if (session) {
   *     this.log('info', 'Found previous session, auto-reconnect available');
   *   }
   * }
   * ```
   */
  async install(context: AdapterContext): Promise<void> {
    this.logger = context.logger;
    this.debug = Boolean((context as { debug?: boolean }).debug);
    this.log('debug', 'Installing adapter', { id: this.id });

    // Attempt to restore previous session from Zustand store
    try {
      await this.restoreSession();
    } catch (error) {
      this.log('warn', 'Failed to restore session', error);
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
    // Create a wrapper that will be registered with the event emitter
    let isUnsubscribed = false;
    const wrapper = (data: unknown) => {
      if (!isUnsubscribed) {
        handler(data as EventData<E>);
      }
    };

    this.eventEmitter.once(event, wrapper);

    // Return unsubscribe function that marks as unsubscribed
    return () => {
      isUnsubscribed = true;
      this.eventEmitter.off(event, wrapper);
    };
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
    event:
      | 'accountsChanged'
      | 'chainChanged'
      | 'disconnected'
      | 'connected'
      | 'statusChanged'
      | 'sessionTerminated',
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
      case 'connected':
        this.emit('wallet:connected', data);
        break;
      case 'statusChanged':
        this.emit('wallet:statusChanged', data);
        break;
      case 'sessionTerminated':
        this.emit(
          'wallet:sessionTerminated',
          data as { sessionId: string; reason?: string; chainType?: ChainType },
        );
        break;
    }
  }

  /**
   * INFRASTRUCTURE HELPER: Clean up all resources
   *
   * Performs comprehensive cleanup of adapter resources including Zustand store
   * session removal, provider cleanup, transport cleanup, and state reset.
   * Called automatically on `disconnect()` and `uninstall()`.
   *
   * **Zustand Store Integration**: This method removes all sessions for this wallet
   * from the Zustand store, ensuring that persisted session data is cleared when
   * the user explicitly disconnects. The store access is wrapped in a try-catch to
   * gracefully handle test environments where the store may not be fully initialized.
   *
   * **Cleanup Order**:
   * 1. Remove sessions from Zustand store (with graceful fallback)
   * 2. Clear cached persisted session reference
   * 3. Clean up wallet providers
   * 4. Clean up transport connections
   * 5. Remove all event listeners
   * 6. Reset connection state to disconnected
   *
   * **Error Handling Strategy**: Uses nested try-catch blocks:
   * - Inner try-catch: Handles Zustand store access failures (e.g., in tests)
   * - Outer try-catch: Handles any unexpected errors during cleanup
   *
   * This ensures cleanup continues even if individual steps fail, preventing
   * resource leaks in edge cases.
   *
   * @see {@link cleanupProviders} for provider cleanup details
   * @see {@link cleanupTransport} for transport cleanup details
   * @see {@link persistSession} for how sessions are saved
   * @protected
   */
  protected async cleanup(): Promise<void> {
    this.log('debug', 'Cleaning up adapter resources');

    try {
      // Clear persisted session from Zustand store
      // Nested try-catch ensures cleanup continues even if store is unavailable (e.g., in tests)
      try {
        const store = useStore.getState();
        const sessions = store?.entities?.sessions;

        if (sessions) {
          // Find and remove sessions for this wallet
          for (const [sessionId, session] of Object.entries(sessions)) {
            if (session?.walletId === this.id) {
              useStore.setState((state) => {
                const newSessions = { ...state.entities.sessions };
                delete newSessions[sessionId];
                return {
                  entities: {
                    ...state.entities,
                    sessions: newSessions,
                  },
                };
              });
            }
          }
        }
      } catch (storeError) {
        // Store may not be available in test environments - log but continue cleanup
        this.log('debug', 'Could not access Zustand store during cleanup', storeError);
      }

      // Clear cached persisted session
      this.persistedSession = undefined;

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
   * Persist session adapter reconstruction data to Zustand store for recovery across page refreshes
   *
   * This method stores the minimal data needed to recreate the adapter and transport
   * after a page refresh. The data is saved to the SessionState's `adapterReconstruction`
   * field in the Zustand store, which is automatically persisted to localStorage.
   *
   * **Architecture**: Prior to the Zustand migration (2025-01), this method used
   * WalletStorage with a separate AdapterSessionData interface. Now it integrates
   * directly with the unified SessionState in the Zustand store.
   *
   * **What Gets Persisted**:
   * - `adapterType`: Wallet adapter identifier (e.g., 'metamask', 'phantom')
   * - `blockchainType`: Chain type (e.g., 'evm', 'solana', 'aztec')
   * - `transportConfig`: Transport type and configuration for reconnection
   * - `walletMetadata`: Wallet name, icon, and description for UI display
   * - `sessionId`: Session identifier for RPC calls
   *
   * **Page Refresh Flow**:
   * 1. User connects wallet → Session created in Zustand store
   * 2. `persistSession()` called → Updates SessionState.adapterReconstruction
   * 3. Zustand persist middleware → Saves to localStorage
   * 4. Page refresh → Zustand rehydrates from localStorage
   * 5. `restoreSession()` called → Loads SessionState with adapterReconstruction
   * 6. Adapter can use this data to reconnect automatically
   *
   * @param connection - The wallet connection containing data to persist
   * @param sessionId - The session ID for this connection
   *
   * @see {@link restoreSession} for how this data is loaded after page refresh
   * @see {@link SessionState.adapterReconstruction} for the stored data structure
   * @see {@link cleanup} for how persisted data is cleared on disconnect
   *
   * @example
   * ```typescript
   * // After successful wallet connection
   * const connection = await this.doConnect(options);
   * const sessionId = this.generateSessionId();
   *
   * // Persist for page refresh recovery
   * await this.persistSession(connection, sessionId);
   *
   * // Stored structure (automatically saved to localStorage):
   * // {
   * //   adapterType: 'metamask',
   * //   blockchainType: 'evm',
   * //   transportConfig: { type: 'extension', config: {} },
   * //   walletMetadata: {
   * //     name: 'MetaMask',
   * //     icon: 'data:image/svg+xml;base64,...',
   * //     description: 'MetaMask browser extension'
   * //   },
   * //   sessionId: 'session_metamask_abc123'
   * // }
   * ```
   *
   * @protected
   */
  protected async persistSession(connection: WalletConnection, sessionId: string): Promise<void> {
    try {
      const store = useStore.getState();
      const session = store.entities.sessions[sessionId];

      if (!session) {
        this.log('debug', 'No session found in store for persistence', { sessionId });
        return;
      }

      // Build adapter reconstruction data
      const adapterReconstruction = {
        adapterType: this.id,
        blockchainType: String(connection.chainType),
        transportConfig: this.transport
          ? {
              type: String((this.transport as { type?: unknown }).type || 'unknown'),
              config: (this.transport as { config?: Record<string, unknown> }).config || {},
            }
          : {
              type: 'unknown',
              config: {},
            },
        walletMetadata: {
          name: connection.walletInfo.name,
          icon: connection.walletInfo.icon || '',
          description: connection.walletInfo.description,
        },
        sessionId,
      };

      // Update the session's adapterReconstruction field
      useStore.setState((state) => ({
        entities: {
          ...state.entities,
          sessions: {
            ...state.entities.sessions,
            [sessionId]: {
              ...state.entities.sessions[sessionId],
              adapterReconstruction,
            },
          },
        },
      }));

      this.log('debug', 'Persisted adapter reconstruction data', { walletId: this.id, sessionId });
    } catch (error) {
      this.log('error', 'Failed to persist session', error);
    }
  }

  /**
   * Restore a previously persisted session from Zustand store
   *
   * This method is automatically called by `install()` during adapter initialization.
   * It searches the Zustand store for a SessionState matching this wallet's ID and,
   * if found, caches it in the {@link persistedSession} field for potential use
   * during reconnection flows.
   *
   * **Important**: This method only **loads** session data; it does **not** automatically
   * reconnect to the wallet. Subclasses should override this method (calling `super.restoreSession()`)
   * to implement wallet-specific reconnection logic.
   *
   * **Architecture**: Prior to the Zustand migration (2025-01), this method used
   * WalletStorage to load AdapterSessionData. Now it loads the full SessionState from
   * the Zustand store, providing richer context including account information, chain
   * details, and permissions.
   *
   * **Lifecycle**:
   * 1. `install()` calls this method
   * 2. Method queries Zustand store for sessions matching `this.id`
   * 3. If found, stores in `this.persistedSession`
   * 4. Updates session's `lastActiveAt` timestamp
   * 5. Subclass `connect()` can check `this.persistedSession` for auto-reconnect
   *
   * **Override Pattern**:
   * ```typescript
   * protected async restoreSession(): Promise<void> {
   *   // Call parent to load session data
   *   await super.restoreSession();
   *
   *   // Check if we have a session to restore
   *   const session = this.getPersistedSession();
   *   if (!session) return;
   *
   *   // Implement wallet-specific reconnection
   *   try {
   *     await this.reconnectWithSession(session);
   *     this.log('info', 'Auto-reconnected from persisted session');
   *   } catch (error) {
   *     this.log('warn', 'Auto-reconnect failed, user must reconnect manually', error);
   *   }
   * }
   * ```
   *
   * @see {@link install} which calls this method automatically
   * @see {@link persistedSession} which stores the loaded session
   * @see {@link persistSession} for how session data is saved
   * @see {@link getPersistedSession} for accessing the restored session
   *
   * @protected
   */
  protected async restoreSession(): Promise<void> {
    try {
      const store = useStore.getState();
      const sessions = Object.values(store.entities.sessions);

      // Find a session for this wallet
      const session = sessions.find((s) => s.walletId === this.id);

      if (!session) {
        this.log('debug', 'No persisted session found for wallet', { walletId: this.id });
        return;
      }

      this.log('info', 'Found persisted session', {
        walletId: session.walletId,
        sessionId: session.sessionId,
        chainId: session.chain.chainId,
      });

      // Store the session data for potential use during connect
      // Subclasses can override this method to implement auto-reconnect
      this.persistedSession = session;

      // Update last active time
      const existingSession = useStore.getState().entities.sessions[session.sessionId];
      if (existingSession) {
        useStore.setState((state) => ({
          entities: {
            ...state.entities,
            sessions: {
              ...state.entities.sessions,
              [session.sessionId]: {
                ...existingSession,
                lifecycle: {
                  ...existingSession.lifecycle,
                  lastActiveAt: Date.now(),
                },
              },
            },
          },
        }));
      }
    } catch (error) {
      this.log('error', 'Failed to restore session', error);
    }
  }

  /**
   * Get the persisted session data if available
   *
   * Returns the SessionState that was loaded from the Zustand store during
   * `install()`. This provides access to previously persisted wallet connection
   * data for implementing auto-reconnect flows.
   *
   * **Usage**: Subclasses typically call this method in their `connect()` implementation
   * to check if a previous session exists and attempt automatic reconnection.
   *
   * @returns The persisted SessionState from the Zustand store, or undefined if no session was found
   *
   * @see {@link restoreSession} for how this field is populated
   * @see {@link persistedSession} for the internal storage field
   *
   * @example
   * ```typescript
   * async connect(options?: ConnectOptions): Promise<WalletConnection> {
   *   // Check for persisted session to enable auto-reconnect
   *   const persistedSession = this.getPersistedSession();
   *
   *   if (persistedSession && !options?.forceNew) {
   *     this.log('info', 'Found persisted session, attempting auto-reconnect');
   *     try {
   *       return await this.reconnectWithSession(persistedSession);
   *     } catch (error) {
   *       this.log('warn', 'Auto-reconnect failed, proceeding with new connection', error);
   *     }
   *   }
   *
   *   // Normal connection flow
   *   return await this.doConnect(options);
   * }
   * ```
   *
   * @protected
   */
  protected getPersistedSession(): SessionState | undefined {
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

/**
 * Complete WalletMeshClient implementation for managing wallet connections
 *
 * This module provides the main client class that implements the WalletMeshClient interface
 * with full integration of ProviderLoader, discovery services, state management, and event system.
 *
 * @module client/WalletMeshClient
 * @packageDocumentation
 */

import type { HeadlessModalState } from '../api/core/headless.js';
import type { BlockchainProvider } from '../api/types/chainProviders.js';
import type { WalletConnection } from '../api/types/connection.js';
import type { ChainSwitchedEvent } from '../api/types/events.js';
import type { ProviderClass } from '../api/types/providers.js';
import type { CreateSessionParams, SessionManager, SessionState } from '../api/types/sessionState.js';
import type { Logger } from '../internal/core/logger/logger.js';
import type { WalletRegistry } from '../internal/registries/wallets/WalletRegistry.js';
import type { WalletAdapter } from '../internal/wallets/base/WalletAdapter.js';
import type { ConnectOptions } from '../internal/wallets/base/WalletAdapter.js';

/**
 * Flexible type for wallet adapter classes that may have different constructor signatures
 * @public
 */
export type WalletAdapterClass = {
  new (...args: unknown[]): WalletAdapter;
  getWalletInfo(): WalletInfo;
};
import type { ProviderLoader } from '../providers/ProviderLoader.js';
import type { ModalController, SupportedChain, WalletInfo } from '../types.js';
import { ChainType } from '../types.js';

import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import { ServiceRegistry } from '../internal/registries/ServiceRegistry.js';
import { createProviderLoader } from '../providers/ProviderLoader.js';
import type {
  BalanceService,
  ChainService,
  ConnectionService,
  TransactionService,
} from '../services/index.js';
import type {
  TransactionError,
  TransactionRequest,
  TransactionResult,
  TransactionStatus,
} from '../services/transaction/types.js';
import { connectionActions } from '../state/actions/connections.js';
import { transactionActions } from '../state/actions/transactions.js';
import { useStore } from '../state/store.js';

/**
 * Configuration options for WalletMeshClient
 *
 * @public
 */
export interface WalletMeshClientConfig {
  /** Application name displayed to users */
  appName: string;
  /** Optional application description */
  appDescription?: string;
  /** Application URL */
  appUrl?: string;
  /** Application icon URL */
  appIcon?: string;
  /** WalletConnect project ID */
  projectId?: string;
  /** Supported chain configurations */
  chains?: Array<SupportedChain>;
  /** Supported interfaces per technology for discovery */
  supportedInterfaces?: {
    /** EVM interfaces (e.g., ['eip-1193', 'eip-6963']) */
    evm?: string[];
    /** Solana interfaces (e.g., ['solana-standard-wallet']) */
    solana?: string[];
    /** Aztec interfaces (e.g., ['aztec-wallet-api-v1', 'aztec-connect-v2']) */
    aztec?: string[];
  };
  /** Wallet configuration options */
  wallets?:
    | {
        order?: string[];
        include?: string[];
        exclude?: string[];
        filter?: (adapter: WalletAdapter) => boolean;
        custom?: Array<WalletAdapter | WalletAdapterClass>;
      }
    | WalletInfo[]
    | Array<WalletAdapter | WalletAdapterClass>;
  /** Enable debug mode */
  debug?: boolean;
  /** Logger configuration */
  logger?: {
    /** Enable debug logging */
    debug?: boolean;
    /** Custom logger prefix */
    prefix?: string;
    /** Log level */
    level?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  };
  /** Provider loader configuration */
  providerLoader?: {
    preloadOnInit?: boolean;
    preloadChainTypes?: ChainType[];
    customProviders?: Record<
      ChainType,
      () => Promise<{
        default?: ProviderClass;
        EvmProvider?: ProviderClass;
        SolanaProvider?: ProviderClass;
        AztecProvider?: ProviderClass;
      }>
    >;
  };
  /** Discovery service configuration */
  discovery?: {
    enabled?: boolean;
    timeout?: number;
    retryInterval?: number;
  };
}

/**
 * Options for connecting to a wallet
 *
 * @public
 */
export interface WalletConnectOptions extends ConnectOptions {
  /** Chain to connect to initially */
  chain?: SupportedChain;
  /** Force a specific chain type */
  chainType?: ChainType;
  /** Additional provider-specific options */
  providerOptions?: Record<string, unknown>;
}

/**
 * Wallet detection result with availability information
 *
 * @public
 */
export interface AvailableWallet {
  /** The wallet adapter instance */
  adapter: WalletAdapter;
  /** Whether the wallet is currently available */
  available: boolean;
  /** Optional version information */
  version?: string;
  /** Additional metadata */
  customData?: Record<string, unknown>;
}

/**
 * Connection state change event data
 *
 * @public
 */
export interface ConnectionStateChangeEvent {
  /** Type of state change */
  type: 'connected' | 'disconnected' | 'connecting' | 'error';
  /** Wallet ID that triggered the change */
  walletId: string;
  /** Previous connection state */
  previousState?: WalletConnection;
  /** New connection state */
  currentState?: WalletConnection;
  /** Error information if applicable */
  error?: Error;
}

/**
 * Discovery event data
 *
 * @public
 */
export interface DiscoveryEvent {
  /** Type of discovery event */
  type: 'wallet_discovered' | 'wallet_available' | 'wallet_unavailable';
  /** Wallet information */
  walletInfo: WalletInfo;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Main WalletMeshClient class for comprehensive wallet management
 *
 * This client provides full-featured wallet connection management with:
 * - Lazy loading of blockchain providers
 * - Discovery service integration
 * - Type-safe connection options
 * - Event system for wallet and provider events
 * - State management integration
 * - Error handling and recovery
 * - Provider lifecycle management
 *
 * @example
 * ```typescript
 * const client = new WalletMeshClient({
 *   appName: 'My DApp',
 *   appDescription: 'A decentralized application',
 *   chains: [
 *     { chainId: '1', chainType: 'evm', name: 'Ethereum' }
 *   ],
 *   providerLoader: {
 *     preloadOnInit: true,
 *     preloadChainTypes: ['evm']
 *   }
 * }, registry, modal, logger);
 *
 * await client.initialize();
 * const connection = await client.connect('metamask', { chainId: '1' });
 * ```
 *
 * @public
 */
export class WalletMeshClient {
  private readonly config: WalletMeshClientConfig;
  private readonly registry: WalletRegistry;
  private readonly modal: ModalController;
  private readonly logger: Logger;
  private readonly providerLoader: ProviderLoader;
  private readonly serviceRegistry: ServiceRegistry;

  // Internal state
  private readonly adapters = new Map<string, WalletAdapter>();
  private readonly eventTarget = new EventTarget();
  private readonly providerVersions = new Map<string, number>();

  // Discovery and connection management
  private discoveryEnabled = false;
  private discoveryTimeout: NodeJS.Timeout | null = null;
  private activeConnections = new Set<string>();
  private maxConnections = 5;
  private activeWalletId: string | null = null;
  private initialized = false;
  private modalUnsubscribe: (() => void) | null = null;

  private get sessionManager(): SessionManager {
    return this.createSessionManagerAdapter();
  }

  private createSessionManagerAdapter(): SessionManager {
    const store = useStore;
    return {
      createSession: (params: CreateSessionParams) => connectionActions.createSession(store, params),
      getSession: (sessionId: string) => store.getState().entities.sessions[sessionId] || null,
      getActiveSession: () => connectionActions.getActiveSession(store),
      getWalletSessions: (walletId: string) => connectionActions.getWalletSessions(store, walletId),
      updateSessionStatus: (_sessionId: string, _status) => {
        // Implementation would update session status in store
      },
      switchChain: async (sessionId: string, chain) => {
        const result = await connectionActions.switchChain(store, sessionId, chain.chainId);
        if (!result) {
          throw ErrorFactory.notFound(`Session ${sessionId} not found`, { sessionId });
        }
        return result;
      },
      switchAccount: async (sessionId: string, _accountAddress: string) => {
        // Implementation would switch account in session
        const session = store.getState().entities.sessions[sessionId];
        if (!session) throw ErrorFactory.notFound(`Session ${sessionId} not found`, { sessionId });
        return session;
      },
      discoverAccounts: async () => [],
      addAccount: async (sessionId: string, _account) => {
        const session = store.getState().entities.sessions[sessionId];
        if (!session) throw ErrorFactory.notFound(`Session ${sessionId} not found`, { sessionId });
        return session;
      },
      removeAccount: async (sessionId: string) => {
        const session = store.getState().entities.sessions[sessionId];
        if (!session) throw ErrorFactory.notFound(`Session ${sessionId} not found`, { sessionId });
        return session;
      },
      getSessionAccounts: (sessionId: string) => {
        const session = store.getState().entities.sessions[sessionId];
        return session?.accounts || [];
      },
      getActiveAccount: (sessionId: string) => {
        const session = store.getState().entities.sessions[sessionId];
        return session?.activeAccount || null;
      },
      endSession: (sessionId: string) => connectionActions.endSession(store, sessionId),
      compareSessions: () => null,
      cleanupExpiredSessions: async () => {},
    };
  }

  constructor(
    config: WalletMeshClientConfig,
    registry: WalletRegistry,
    modal: ModalController,
    logger: Logger,
  ) {
    this.config = config;
    this.registry = registry;
    this.modal = modal;
    this.logger = logger;

    // Initialize service registry
    this.serviceRegistry = new ServiceRegistry(logger);

    // Initialize provider loader with configuration
    const providerLoaderConfig = {
      logger: this.logger,
      ...(config.providerLoader?.preloadOnInit !== undefined && {
        preloadOnInit: config.providerLoader.preloadOnInit,
      }),
      ...(config.providerLoader?.preloadChainTypes && {
        preloadChainTypes: config.providerLoader.preloadChainTypes,
      }),
      ...(config.providerLoader?.customProviders && {
        customProviders: config.providerLoader.customProviders,
      }),
    };
    this.providerLoader = createProviderLoader(providerLoaderConfig);

    // Setup discovery if enabled
    this.discoveryEnabled = config.discovery?.enabled ?? true;

    // Multi-wallet store is now part of unified store

    // Setup modal event handlers
    this.setupModalHandlers();

    this.logger.debug('WalletMeshClient initialized', {
      appName: config.appName,
      discoveryEnabled: this.discoveryEnabled,
      chainsConfigured: config.chains?.length ?? 0,
    });
  }

  /**
   * Initialize the client and all its services
   *
   * @returns Promise that resolves when initialization is complete
   * @public
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.debug('Client already initialized');
      return;
    }

    this.logger.debug('Initializing WalletMeshClient');

    try {
      // Initialize service registry first
      await this.serviceRegistry.initialize({ logger: this.logger });

      // Initialize provider loader
      await this.providerLoader.initialize();

      // Start discovery service if enabled
      if (this.discoveryEnabled) {
        await this.startDiscoveryService();
      }

      // Setup periodic provider health checks
      this.setupProviderHealthChecks();

      this.initialized = true;
      this.logger.info('WalletMeshClient initialization complete');

      // Emit initialization event
      this.emit('client:initialized', { timestamp: Date.now() });
    } catch (error) {
      this.logger.error('Failed to initialize WalletMeshClient', error);
      throw ErrorFactory.configurationError(
        `Client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Connect to a wallet with type-safe options
   *
   * @param walletId - Optional ID of specific wallet to connect
   * @param options - Optional connection options
   * @returns Promise resolving to the wallet connection
   * @throws If connection fails or is rejected by user
   * @public
   */
  async connect(walletId?: string, options?: WalletConnectOptions): Promise<WalletConnection> {
    this.logger.debug('Connect called', { walletId, options });

    if (!this.initialized) {
      await this.initialize();
    }

    // Check connection limits
    if (this.activeConnections.size >= this.maxConnections) {
      throw ErrorFactory.connectionFailed(`Maximum connections (${this.maxConnections}) reached`);
    }

    let targetWalletId = walletId;

    // If no wallet ID provided, open modal for selection
    if (!targetWalletId) {
      await this.openModal();
      const selectedId = await this.waitForWalletSelection();
      if (!selectedId) {
        throw ErrorFactory.connectorError('unknown', 'No wallet selected', 'USER_CANCELLED');
      }
      targetWalletId = selectedId;
    }

    try {
      // Get or create adapter
      let adapter = this.adapters.get(targetWalletId);
      if (!adapter) {
        adapter = await this.createAdapter(targetWalletId);
        this.adapters.set(targetWalletId, adapter);
        this.setupAdapterHandlers(targetWalletId, adapter);
      }

      // Update modal state to connecting
      this.updateModalState('connecting', targetWalletId);

      // Prepare connection options
      const connectOptions: WalletConnectOptions = {
        ...(this.logger && { logger: this.logger }),
        ...options,
      };

      // Add project ID if configured
      if (this.config.projectId) {
        connectOptions.projectId = this.config.projectId;
      }

      // Determine chain type and load provider if needed
      const chainType = options?.chainType || options?.chain?.chainType || ChainType.Evm;
      if (chainType) {
        await this.ensureProviderLoaded(chainType);
      }

      // Connect through adapter
      const connection = await adapter.connect(connectOptions);

      // Create session
      const session = await this.createSession(targetWalletId, connection, adapter);

      // Update stores
      await this.updateConnectionStores(targetWalletId, connection, adapter);

      // Track active connection
      this.activeConnections.add(targetWalletId);
      this.setActiveWallet(targetWalletId);

      // Update modal state to connected
      this.updateModalState('connected', targetWalletId, connection);

      // Emit events
      this.emit('connection:added', connection);
      this.emit('connection:state:changed', {
        type: 'connected',
        walletId: targetWalletId,
        currentState: connection,
      } as ConnectionStateChangeEvent);

      // Auto-close modal after brief delay
      setTimeout(() => this.closeModal(), 1500);

      this.logger.info('Successfully connected to wallet', {
        walletId: targetWalletId,
        chain: connection.chain,
      });

      return this.sessionToWalletConnection(session);
    } catch (error) {
      this.logger.error('Failed to connect to wallet', { walletId: targetWalletId, error });

      // Update modal state to error
      this.updateModalState('error', targetWalletId, undefined, error as Error);

      // Emit error event
      this.emit('connection:state:changed', {
        type: 'error',
        walletId: targetWalletId || 'unknown',
        error: error as Error,
      } as ConnectionStateChangeEvent);

      throw error;
    }
  }

  /**
   * Disconnect from a specific wallet
   *
   * @param walletId - ID of the wallet to disconnect
   * @returns Promise that resolves when disconnected
   * @public
   */
  async disconnect(walletId: string): Promise<void> {
    this.logger.debug('Disconnect called', { walletId });

    const adapter = this.adapters.get(walletId);
    if (!adapter) {
      this.logger.warn('Attempted to disconnect non-existent wallet', { walletId });
      return;
    }

    try {
      // Disconnect adapter
      await adapter.disconnect();

      // Clean up resources
      await this.cleanupWalletResources(walletId);

      // Emit events
      this.emit('connection:removed', walletId);
      this.emit('connection:state:changed', {
        type: 'disconnected',
        walletId,
      } as ConnectionStateChangeEvent);

      this.logger.info('Successfully disconnected wallet', { walletId });
    } catch (error) {
      this.logger.error('Failed to disconnect wallet', { walletId, error });
      throw error;
    }
  }

  /**
   * Disconnect from all connected wallets
   *
   * @returns Promise that resolves when all wallets are disconnected
   * @public
   */
  async disconnectAll(): Promise<void> {
    this.logger.debug('Disconnecting all wallets');

    const disconnectPromises = Array.from(this.activeConnections).map((walletId) =>
      this.disconnect(walletId).catch((error) => {
        this.logger.error(`Failed to disconnect wallet ${walletId}`, error);
      }),
    );

    await Promise.all(disconnectPromises);

    this.activeWalletId = null;
    this.logger.info('Disconnected all wallets');
  }

  /**
   * Switch to a different blockchain network
   *
   * @param chain - Chain to switch to
   * @param walletId - Optional wallet ID. Uses active wallet if not specified
   * @returns Promise resolving to chain switch result
   * @public
   */
  async switchChain(
    chain: SupportedChain,
    walletId?: string,
  ): Promise<{
    provider: unknown;
    chainType: ChainType;
    chain: SupportedChain;
    previousChain: SupportedChain;
  }> {
    this.logger.debug('switchChain called', { chain, walletId });

    const targetWalletId = walletId || this.getActiveWallet();
    if (!targetWalletId) {
      throw ErrorFactory.configurationError('No wallet connected to switch chain');
    }

    const adapter = this.adapters.get(targetWalletId);
    if (!adapter) {
      throw ErrorFactory.walletNotFound(targetWalletId);
    }

    // Get active session
    const sessions = this.sessionManager.getWalletSessions(targetWalletId);
    const activeSession = sessions.find((s) => s.status === 'connected');
    if (!activeSession) {
      throw ErrorFactory.connectionFailed('No active session for wallet');
    }

    const previousChain = activeSession.chain;
    const chainType = chain.chainType;

    // Return early if already on the requested chain
    if (previousChain.chainId === chain.chainId) {
      this.logger.info('Already on requested chain', { chain });
      return {
        provider: activeSession.provider.instance,
        chainType: activeSession.chain.chainType as ChainType,
        chain,
        previousChain,
      };
    }

    // Ensure provider is loaded for the chain type
    await this.ensureProviderLoaded(chainType);

    // Request chain connection
    if (chainType === ChainType.Evm) {
      await this.requestChainConnection(targetWalletId, chain, chainType);
    }

    // Switch chain using session manager
    const newSession = await this.sessionManager.switchChain(activeSession.sessionId, chain);

    // Update provider version tracking
    const currentVersion = this.providerVersions.get(targetWalletId) || 1;
    this.providerVersions.set(targetWalletId, currentVersion + 1);

    // Update stores
    if (!adapter.connection) {
      throw ErrorFactory.connectionFailed('Adapter has no connection during chain switch');
    }
    await this.updateConnectionStores(
      targetWalletId,
      {
        ...adapter.connection,
        chain,
        chainType: chainType as ChainType,
        provider: newSession.provider.instance,
      },
      adapter,
    );

    // Emit events

    this.emit('connection:changed', {
      ...adapter.connection,
      chain,
      chainType: chainType as ChainType,
      provider: newSession.provider.instance,
    });

    // Emit chain:switched event for actual chain changes
    const chainSwitchedEvent: ChainSwitchedEvent = {
      walletId: targetWalletId,
      walletSessionId: activeSession.sessionId,
      fromChainId: previousChain.chainId,
      toChainId: chain.chainId,
      fromChainStateId: `${previousChain.chainType}:${previousChain.chainId}`,
      toChainStateId: `${chainType}:${chain.chainId}`,
      isNewChain: !newSession.metadata.chainSwitches?.some(
        (switch_) => switch_.toChain.chainId === chain.chainId,
      ), // Check if this is the first switch to this chain
      timestamp: Date.now(),
    };
    this.emit('chain:switched', chainSwitchedEvent);

    this.logger.info('Successfully switched chain', {
      walletId: targetWalletId,
      fromChain: previousChain,
      toChain: chain,
    });

    return {
      provider: newSession.provider.instance,
      chainType: newSession.chain.chainType as ChainType,
      chain,
      previousChain,
    };
  }

  /**
   * Get a specific wallet connection
   *
   * @param walletId - ID of the wallet
   * @returns The wallet adapter if connected, undefined otherwise
   * @public
   */
  getConnection(walletId: string): WalletAdapter | undefined {
    return this.adapters.get(walletId);
  }

  /**
   * Get all connected wallet adapters
   *
   * @returns Array of connected wallet adapters
   * @public
   */
  getConnections(): WalletAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Get all wallet connections with full details
   *
   * @returns Array of wallet connection objects
   * @public
   */
  getAllConnections(): WalletConnection[] {
    return this.getConnections()
      .filter((adapter) => adapter.connection !== null)
      .map((adapter) => adapter.connection as WalletConnection);
  }

  /**
   * Detect all available wallets in the environment
   *
   * @returns Promise resolving to array of detected wallets
   * @public
   */
  async discoverWallets(): Promise<AvailableWallet[]> {
    this.logger.debug('Detecting available wallets');

    try {
      const availableWalletsFromRegistry = await this.registry.detectAvailableAdapters();

      // Convert to our AvailableWallet format
      const availableWallets: AvailableWallet[] = availableWalletsFromRegistry.map((wallet) => ({
        adapter: wallet.adapter,
        available: wallet.available,
        ...(wallet.version && { version: wallet.version }),
        ...(wallet.customData && { customData: wallet.customData }),
      }));

      this.logger.debug('Wallet detection complete', {
        totalWallets: availableWallets.length,
        availableWallets: availableWallets.filter((w) => w.available).length,
      });

      // Emit discovery events
      for (const wallet of availableWallets) {
        this.emit('discovery:event', {
          type: wallet.available ? 'wallet_available' : 'wallet_unavailable',
          walletInfo: {
            id: wallet.adapter.id,
            name: wallet.adapter.metadata.name,
            icon: wallet.adapter.metadata.icon,
            description: wallet.adapter.metadata.description || '',
            chains: wallet.adapter.capabilities.chains.map((c) => c.type as ChainType),
          },
          metadata: {
            version: wallet.version,
            customData: wallet.customData,
          },
        } as DiscoveryEvent);
      }

      return availableWallets;
    } catch (error) {
      this.logger.error('Failed to detect wallets', error);
      throw ErrorFactory.configurationError(
        `Wallet detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a specific wallet adapter
   *
   * @param walletId - ID of the wallet
   * @returns The wallet adapter if registered, undefined otherwise
   * @public
   */
  getWallet(walletId: string): WalletAdapter | undefined {
    return this.registry.getAdapter(walletId);
  }

  /**
   * Get all registered wallet adapters
   *
   * @returns Array of all registered wallet adapters
   * @public
   */
  getAllWallets(): WalletAdapter[] {
    return this.registry.getAllAdapters();
  }

  /**
   * Open the wallet selection modal
   *
   * @returns Promise that resolves when modal is opened
   * @public
   */
  async openModal(options?: { targetChainType?: ChainType }): Promise<void> {
    if (this.modal) {
      this.modal.open(options);
    }
  }

  /**
   * Close the wallet selection modal
   *
   * @public
   */
  closeModal(): void {
    if (this.modal) {
      this.modal.close();
    }
  }

  /**
   * Whether any wallet is currently connected
   *
   * @returns True if any wallet is connected
   * @public
   */
  get isConnected(): boolean {
    return this.activeConnections.size > 0;
  }

  /**
   * Set the active wallet for operations
   *
   * @param walletId - ID of the wallet to make active
   * @throws If wallet is not connected
   * @public
   */
  setActiveWallet(walletId: string): void {
    if (!this.activeConnections.has(walletId)) {
      throw ErrorFactory.walletNotFound(`Wallet ${walletId} is not connected`);
    }

    this.activeWalletId = walletId;
    // Active wallet is now managed through session manager
    const sessions = this.sessionManager.getWalletSessions(walletId);
    if (sessions.length > 0) {
      const activeSession = sessions[0];
      // Additional null check to ensure the session exists and is valid
      if (activeSession?.sessionId) {
        connectionActions.switchToSession(useStore, activeSession.sessionId);
      }
    }

    this.logger.debug('Active wallet changed', { walletId });
    this.emit('active_wallet:changed', { walletId });
  }

  /**
   * Get the currently active wallet ID
   *
   * @returns The active wallet ID or null if none active
   * @public
   */
  getActiveWallet(): string | null {
    return this.activeWalletId || null;
  }

  /**
   * Get the maximum number of concurrent connections
   *
   * @returns Maximum connection limit
   * @public
   */
  getMaxConnections(): number {
    return this.maxConnections;
  }

  /**
   * Get current modal state
   *
   * @returns Current modal state
   * @public
   */
  getState(): HeadlessModalState {
    if (!this.modal) {
      return {
        connection: { state: 'idle' },
        wallets: [],
        isOpen: false,
      };
    }
    return this.modal.getState();
  }

  /**
   * Subscribe to modal state changes
   *
   * @param callback - Function to call when state changes
   * @returns Unsubscribe function
   * @public
   */
  subscribe(callback: (state: HeadlessModalState) => void): () => void {
    if (!this.modal) {
      return () => {};
    }
    return this.modal.subscribe(callback);
  }

  /**
   * Subscribe to events
   *
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   * @public
   */
  on(event: string, handler: (data: unknown) => void): () => void {
    const listener = (e: Event) => {
      handler((e as CustomEvent).detail);
    };

    this.eventTarget.addEventListener(event, listener);

    return () => {
      this.eventTarget.removeEventListener(event, listener);
    };
  }

  /**
   * Subscribe to an event once
   *
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   * @public
   */
  once(event: string, handler: (data: unknown) => void): () => void {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      handler(data);
    });
    return unsubscribe;
  }

  /**
   * Get headless modal actions
   *
   * @returns Modal actions interface
   * @public
   */
  getActions(): Record<string, unknown> {
    if (!this.modal) {
      return {
        openModal: () => {},
        closeModal: () => {},
        selectWallet: async () => {},
        connect: async () => {},
        disconnect: async () => {},
        retry: async () => {},
      };
    }
    return (this.modal as { getActions?: () => Record<string, unknown> }).getActions?.() || {};
  }

  /**
   * Destroy the client and clean up all resources
   *
   * @public
   */
  destroy(): void {
    this.logger.debug('Destroying WalletMeshClient');

    // Stop discovery service
    this.stopDiscoveryService();

    // Disconnect all wallets
    this.disconnectAll().catch((error) => {
      this.logger.error('Error during cleanup disconnect', error);
    });

    // Clean up modal subscription
    if (this.modalUnsubscribe) {
      this.modalUnsubscribe();
      this.modalUnsubscribe = null;
    }

    // Clean up modal
    if (this.modal) {
      this.modal.cleanup();
    }

    // Provider cache is now managed through session manager

    // Clear registry
    this.registry.clear();

    // Clear provider loader cache
    this.providerLoader.clearCache();

    // Dispose service registry
    this.serviceRegistry.dispose().catch((error) => {
      this.logger.error('Error disposing service registry', error);
    });

    this.initialized = false;
    this.logger.info('WalletMeshClient destroyed');
  }

  // Private implementation methods

  private async createAdapter(walletId: string): Promise<WalletAdapter> {
    const adapter = this.registry.getAdapter(walletId);
    if (!adapter) {
      throw ErrorFactory.walletNotFound(walletId);
    }
    return adapter;
  }

  private async ensureProviderLoaded(chainType: ChainType): Promise<void> {
    if (!this.providerLoader.hasProvider(chainType)) {
      this.logger.warn(`No provider available for chain type: ${chainType}`);
      return;
    }

    const status = this.providerLoader.getProviderStatus(chainType);
    if (!status.isLoaded) {
      this.logger.debug(`Loading provider for chain type: ${chainType}`);
      await this.providerLoader.getProviderClass(chainType);
    }
  }

  private async createSession(
    walletId: string,
    connection: WalletConnection,
    adapter: WalletAdapter,
  ): Promise<SessionState> {
    const sessionParams: CreateSessionParams = {
      walletId,
      accounts: (connection.accounts || [connection.address]).map((address, index) => ({
        address,
        index,
        derivationPath: `m/44'/60'/0'/0/${index}`,
        isActive: index === 0,
      })),
      activeAccountIndex: 0,
      chain: {
        ...connection.chain,
        chainType: connection.chainType as ChainType,
        name: this.getChainName(connection.chain),
      },
      provider: connection.provider as BlockchainProvider,
      providerMetadata: {
        type: 'unknown',
        version: '1.0.0',
        multiChainCapable: adapter.capabilities.chains.length > 1,
        supportedMethods: adapter.capabilities.permissions?.methods || ['*'],
      },
      permissions: {
        methods: adapter.capabilities.permissions?.methods || ['*'],
        events: adapter.capabilities.permissions?.events || ['accountsChanged', 'chainChanged'],
      },
      metadata: {
        wallet: {
          name: adapter.metadata.name || 'Unknown Wallet',
          icon: adapter.metadata.icon || '',
          version: '1.0.0',
        },
        dapp: {
          name: this.config.appName,
          ...(this.config.appUrl && { url: this.config.appUrl }),
          ...(this.config.appIcon && { icon: this.config.appIcon }),
        },
        connection: {
          initiatedBy: 'user',
          method: 'manual',
          ...(typeof navigator !== 'undefined' && navigator.userAgent && { userAgent: navigator.userAgent }),
        },
      },
    };

    return await connectionActions.createSession(useStore, sessionParams);
  }

  private async updateConnectionStores(
    walletId: string,
    _connection: WalletConnection,
    _adapter: WalletAdapter,
  ): Promise<void> {
    // Connection is now managed through session manager (already created in connect method)
    // Just track provider version
    this.providerVersions.set(walletId, 1);
  }

  private async cleanupWalletResources(walletId: string): Promise<void> {
    // Remove from active connections
    this.activeConnections.delete(walletId);

    // Remove adapter
    this.adapters.delete(walletId);

    // End sessions
    const sessions = this.sessionManager.getWalletSessions(walletId);
    for (const session of sessions) {
      await this.sessionManager.endSession(session.sessionId);
    }

    // Provider cleanup is now managed through session manager
    // Just clean up provider version tracking
    this.providerVersions.delete(walletId);

    // Update active wallet if it was this one
    if (this.activeWalletId === walletId) {
      if (this.activeConnections.size > 0) {
        const connectionArray = Array.from(this.activeConnections);
        this.activeWalletId = connectionArray.length > 0 ? connectionArray[0] || null : null;
      } else {
        this.activeWalletId = null;
      }
    }

    // Update modal state
    this.updateModalState('disconnected');
  }

  private async requestChainConnection(
    walletId: string,
    chain: SupportedChain,
    chainType: ChainType,
  ): Promise<unknown> {
    const adapter = this.adapters.get(walletId);
    if (!adapter?.connection?.provider) {
      return null;
    }

    const provider = adapter.connection.provider as {
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };

    if (chainType === ChainType.Evm && provider.request) {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chain.chainId }],
        });
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 4902) {
          throw ErrorFactory.configurationError('Chain not configured in wallet', { errorCode: 4902 });
        }
        throw error;
      }
      return provider;
    }

    return null;
  }

  private sessionToWalletConnection(session: SessionState): WalletConnection {
    return {
      walletId: session.walletId,
      address: session.activeAccount.address,
      accounts: session.accounts.map((acc) => acc.address),
      chain: session.chain,
      chainType: session.chain.chainType as ChainType,
      provider: session.provider.instance,
      walletInfo: {
        id: session.walletId,
        name: session.metadata.wallet.name,
        icon: session.metadata.wallet.icon,
        chains: [session.chain.chainType as ChainType],
      },
    };
  }

  private getChainName(chain: SupportedChain): string {
    const id = chain.chainId;

    const chainNames: Record<string, string> = {
      '1': 'Ethereum Mainnet',
      '0x1': 'Ethereum Mainnet',
      '137': 'Polygon',
      '0x89': 'Polygon',
      '56': 'BSC',
      '0x38': 'BSC',
      'mainnet-beta': 'Solana Mainnet',
      testnet: 'Solana Testnet',
      devnet: 'Solana Devnet',
    };

    return chainNames[id] || `Chain ${id}`;
  }

  private setupModalHandlers(): void {
    if (!this.modal) return;

    // Forward modal state changes to client event system
    let previousState = this.modal.getState();

    const unsubscribe = this.modal.subscribe((state) => {
      // Detect connection state changes and emit appropriate events
      if (previousState.connection.state !== state.connection.state) {
        if (state.connection.state === 'connecting') {
          this.emit('connection:initiated', {
            walletId: state.selectedWalletId || '',
            timestamp: Date.now(),
          });
        } else if (state.connection.state === 'connected') {
          this.emit('connection:established', {
            walletId: state.selectedWalletId || '',
            address: state.connection.address || '',
            chain: state.connection.chain || {
              chainId: '',
              chainType: ChainType.Evm,
              name: '',
              required: false,
            },
            chainType: state.connection.chain?.chainType || ChainType.Evm,
            provider: undefined,
            accounts: state.connection.accounts || [],
            timestamp: Date.now(),
          });
          this.closeModal();
        } else if (state.connection.state === 'error') {
          this.emit('connection:failed', {
            walletId: state.selectedWalletId || '',
            error: state.connection.error || ErrorFactory.connectionFailed('Connection failed'),
            timestamp: Date.now(),
          });
        }
      }

      // Emit view change events
      if (previousState.connection.state !== state.connection.state) {
        this.emit('view:changed', {
          view:
            state.connection.state === 'connecting'
              ? 'connecting'
              : state.connection.state === 'connected'
                ? 'connected'
                : state.connection.state === 'error'
                  ? 'error'
                  : 'walletSelection',
          previousView:
            previousState.connection.state === 'connecting'
              ? 'connecting'
              : previousState.connection.state === 'connected'
                ? 'connected'
                : previousState.connection.state === 'error'
                  ? 'error'
                  : 'walletSelection',
          timestamp: Date.now(),
        });
      }

      previousState = state;
    });

    // Store unsubscribe function for cleanup
    this.modalUnsubscribe = unsubscribe;
  }

  private setupAdapterHandlers(walletId: string, adapter: WalletAdapter): void {
    adapter.on('connection:established', ({ connection }) => {
      this.emit('connection:added', connection);
    });

    adapter.on('connection:lost', () => {
      this.cleanupWalletResources(walletId).catch((error) => {
        this.logger.error('Error cleaning up wallet resources', error);
      });
      this.emit('connection:removed', walletId);
    });

    adapter.on('accounts:changed', () => {
      if (adapter.connection) {
        this.emit('connection:changed', adapter.connection);
      }
    });

    adapter.on('chain:changed', () => {
      if (adapter.connection) {
        this.emit('connection:changed', adapter.connection);
      }
    });
  }

  private async waitForWalletSelection(): Promise<string | null> {
    return new Promise((resolve) => {
      let resolved = false;

      const connectionHandler = ({ walletId }: { walletId: string }) => {
        if (!resolved) {
          resolved = true;
          resolve(walletId);
        }
      };

      const closeHandler = () => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      };

      // Subscribe to modal state changes to detect connection initiation and modal close
      const unsubscribe = this.modal.subscribe((state) => {
        if (resolved) return;

        // Check if modal was closed
        if (!state.isOpen) {
          resolved = true;
          unsubscribe();
          resolve(null);
          return;
        }

        // Check if connection is being initiated (selectedWalletId is set)
        if (state.selectedWalletId && state.connection.state === 'connecting') {
          resolved = true;
          unsubscribe();
          resolve(state.selectedWalletId);
        }
      });

      // Check immediately if modal is already closed
      const currentState = this.modal.getState();
      if (!currentState.isOpen) {
        closeHandler();
      } else if (currentState.selectedWalletId && currentState.connection.state === 'connecting') {
        connectionHandler({ walletId: currentState.selectedWalletId });
      }
    });
  }

  private updateModalState(
    state: 'connecting' | 'connected' | 'error' | 'disconnected',
    walletId?: string,
    connection?: WalletConnection,
    error?: Error,
  ): void {
    // This would integrate with the modal's internal state management
    // The implementation depends on the modal's internal structure
    this.logger.debug('Modal state updated', {
      state,
      walletId,
      hasConnection: !!connection,
      hasError: !!error,
    });
  }

  private async startDiscoveryService(): Promise<void> {
    if (!this.discoveryEnabled) return;

    this.logger.debug('Starting discovery service');

    // Perform initial wallet detection
    try {
      await this.discoverWallets();
    } catch (error) {
      this.logger.error('Initial wallet detection failed', error);
    }

    // Set up periodic discovery
    const discoveryInterval = this.config.discovery?.retryInterval || 30000;
    this.discoveryTimeout = setInterval(async () => {
      try {
        await this.discoverWallets();
      } catch (error) {
        this.logger.error('Periodic wallet detection failed', error);
      }
    }, discoveryInterval);

    this.logger.info('Discovery service started');
  }

  private stopDiscoveryService(): void {
    if (this.discoveryTimeout) {
      clearInterval(this.discoveryTimeout);
      this.discoveryTimeout = null;
      this.logger.info('Discovery service stopped');
    }
  }

  private setupProviderHealthChecks(): void {
    // Implement periodic health checks for connected providers
    setInterval(() => {
      for (const [walletId, adapter] of this.adapters) {
        if (adapter.connection) {
          // Perform basic health check (e.g., check if provider is still available)
          this.performProviderHealthCheck(walletId, adapter).catch((error) => {
            this.logger.warn(`Health check failed for wallet ${walletId}`, error);
          });
        }
      }
    }, 60000); // Check every minute
  }

  // ===================
  // Service Access API
  // ===================

  /**
   * Get the chain service for chain management operations
   *
   * @returns ChainService instance for chain-related business logic
   * @public
   */
  getChainService(): ChainService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices().chain;
  }

  /**
   * Get the connection service for connection management operations
   *
   * @returns ConnectionService instance for connection-related business logic
   * @public
   */
  getConnectionService(): ConnectionService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices().connection;
  }

  /**
   * Get the transaction service for transaction operations
   *
   * @returns TransactionService instance for transaction-related business logic
   * @public
   */
  getTransactionService(): TransactionService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices().transaction;
  }

  /**
   * Get the balance service for balance queries
   *
   * @returns BalanceService instance for balance-related business logic
   * @public
   */
  getBalanceService(): BalanceService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices().balance;
  }

  /**
   * Get the preference service for wallet preferences and history
   *
   * @returns WalletPreferenceService instance for preference-related business logic
   * @public
   */
  getPreferenceService(): ConnectionService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices().connection;
  }

  /**
   * Get all services in a single object for convenience
   *
   * @returns Object containing all business logic services
   * @public
   */
  getServices() {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices();
  }

  // ===================
  // Transaction Methods
  // ===================

  /**
   * Send a transaction through the active wallet
   *
   * @param request - Transaction request parameters
   * @returns Promise resolving to transaction result
   * @throws If no wallet is connected or transaction fails
   * @public
   */
  async sendTransaction<T extends ChainType = ChainType>(
    request: TransactionRequest<T>,
  ): Promise<TransactionResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Get active session
    const activeSession = connectionActions.getActiveSession(useStore);
    if (!activeSession) {
      throw ErrorFactory.connectionFailed('No active wallet connection');
    }

    const store = useStore;
    const transactionService = this.getTransactionService();

    try {
      // Update store status to preparing
      transactionActions.setStatus(store, 'preparing');
      transactionActions.clearError(store);

      // Send transaction through service
      const result = await transactionService.sendTransaction({
        params: request,
        provider: activeSession.provider.instance,
        chainType: activeSession.chain.chainType,
        chain: activeSession.chain,
        walletId: activeSession.walletId,
        address: activeSession.activeAccount.address,
      });

      // Add transaction to store history
      transactionActions.addTransaction(store, result);
      transactionActions.setCurrentTransaction(store, result);

      // Note: Transaction status updates will be handled by the service internally
      // and the store will be updated through other mechanisms

      return result;
    } catch (error) {
      const transactionError: TransactionError = {
        ...(error instanceof Error
          ? ErrorFactory.transportError(`Transaction failed: ${error.message}`)
          : ErrorFactory.transportError('Transaction failed: Unknown error')),
        stage: 'preparation' as const,
      };

      transactionActions.setError(store, transactionError);
      throw transactionError;
    }
  }

  /**
   * Get transaction history from store
   *
   * @returns Array of transaction results sorted by start time
   * @public
   */
  getTransactionHistory(): TransactionResult[] {
    return transactionActions.getTransactionHistory(useStore);
  }

  /**
   * Get current transaction from store
   *
   * @returns Current transaction or null
   * @public
   */
  getCurrentTransaction(): TransactionResult | null {
    const state = useStore.getState();
    return state.active.transactionId
      ? state.entities.transactions[state.active.transactionId] || null
      : null;
  }

  /**
   * Get transaction by ID from store
   *
   * @param txId - Transaction ID
   * @returns Transaction result or undefined
   * @public
   */
  getTransaction(txId: string): TransactionResult | undefined {
    return transactionActions.getTransaction(useStore, txId);
  }

  /**
   * Get current transaction status from store
   *
   * @returns Current transaction status
   * @public
   */
  getTransactionStatus(): TransactionStatus {
    return useStore.getState().meta.transactionStatus;
  }

  /**
   * Clear transaction error from store
   *
   * @public
   */
  clearTransactionError(): void {
    transactionActions.clearError(useStore);
  }

  // ===================
  // Private Methods
  // ===================

  private async performProviderHealthCheck(walletId: string, adapter: WalletAdapter): Promise<void> {
    // Basic provider availability check
    if (!adapter.connection?.provider) {
      this.logger.warn(`Provider unavailable for wallet ${walletId}`);
      return;
    }

    // Could implement chain-specific health checks here
    this.logger.debug(`Health check passed for wallet ${walletId}`);
  }

  private emit(event: string, data: unknown): void {
    this.eventTarget.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
}

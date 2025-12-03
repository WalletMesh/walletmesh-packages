import type { HeadlessModalState } from '../../api/core/headless.js';
import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import type { WalletConnection } from '../../api/types/connection.js';
import { isAztecRouterProvider, isEvmProvider } from '../../api/types/guards.js';
import type { WalletProvider } from '../../api/types/providers.js';
import type { CreateSessionParams, SessionManager, SessionState } from '../../api/types/sessionState.js';
import { EVMDiscoveryService } from '../../client/discovery/evm/EvmDiscoveryService.js';
import { SolanaDiscoveryService } from '../../client/discovery/solana/SolanaDiscoveryService.js';
import type { DiscoveryConnectionManager } from '../../client/discovery/types.js';
import { ProviderLoader } from '../../providers/ProviderLoader.js';
import { PublicProviderWrapper } from '../../providers/PublicProvider.js';
import { WalletProviderFallbackWrapper } from '../../providers/WalletProviderFallbackWrapper.js';
import type { ChainInfo } from '../../services/chain/types.js';
import { DAppRpcIntegration } from '../../services/dapp-rpc/dAppRpcIntegration.js';
import type {
  BalanceService,
  ChainService,
  ConnectionService,
  DAppRpcService,
  TransactionService,
} from '../../services/index.js';
import { connectionActions } from '../../state/actions/connections.js';
import { useStore } from '../../state/store.js';
import { ChainType, type SupportedChain, type WalletInfo } from '../../types.js';
import type { DiscoveredWalletInfo } from '../../types.js';
import { getChainName } from '../../utils/chainNameResolver.js';
import { generateSessionId } from '../../utils/crypto.js';
import { handleProviderError } from '../../utils/sessionErrors.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import type { Logger } from '../core/logger/logger.js';
import { createDebugLogger } from '../core/logger/logger.js';
import type { ModalController } from '../modal/controller.js';
import { ServiceRegistry } from '../registries/ServiceRegistry.js';
import { getProviderForSession, setProviderForSession } from '../session/ProviderRegistry.js';
import type { WalletRegistry } from '../registries/wallets/WalletRegistry.js';
import type { WalletAdapter } from '../wallets/base/WalletAdapter.js';
import type { ConnectOptions } from '../wallets/base/WalletAdapter.js';
import { DiscoveryAdapter } from '../wallets/discovery/DiscoveryAdapter.js';
import type { DiscoveryAdapterConfig } from '../wallets/discovery/DiscoveryAdapter.js';
import { EvmAdapter } from '../wallets/evm/EvmAdapter.js';
import { SolanaAdapter } from '../wallets/solana/SolanaAdapter.js';
import type { WalletMeshClient as WalletMeshClientInterface } from './WalletMeshClient.js';
import type {
  AvailableWallet,
  InternalWalletMeshClient as InternalWalletMeshClientInterface,
  WalletMeshConfig,
} from './WalletMeshClient.js';
import type { ChainConfig } from './WalletMeshClient.js';
import { SessionParamsBuilder } from './SessionParamsBuilder.js';
import { ProviderValidator } from './providerValidator.js';

/**
 * Core implementation of the WalletMesh client providing comprehensive wallet management.
 *
 * This class serves as the central hub for all wallet operations, implementing both
 * the {@link InternalWalletMeshClient} and {@link WalletMeshClient} interfaces to ensure
 * compatibility across different usage patterns.
 *
 * ## Key Responsibilities
 *
 * - **Connection Management**: Handles wallet connections, disconnections, and multi-wallet scenarios
 * - **Session Management**: Manages persistent sessions with automatic recovery
 * - **Chain Operations**: Facilitates chain switching and cross-chain operations
 * - **State Management**: Integrates with unified store for reactive state updates
 * - **Service Coordination**: Provides access to business logic services
 * - **Event Handling**: Manages wallet events and state propagation
 *
 * ## Architecture
 *
 * The client uses a layered architecture:
 *
 * 1. **Adapter Layer**: Wallet adapters handle blockchain-specific logic
 * 2. **Session Layer**: Session manager maintains connection state
 * 3. **Service Layer**: Business logic services for specialized operations
 * 4. **State Layer**: Zustand store for reactive state management
 *
 * @example
 * ```typescript
 * // Internal usage (not typically instantiated directly)
 * const client = new WalletMeshClient(
 *   config,
 *   registry,
 *   logger
 * );
 *
 * // Two-phase construction: set modal after creation
 * client.setModal(modal);
 *
 * // Initialize services
 * await client.initialize();
 *
 * // Connect to wallet
 * const connection = await client.connect('metamask');
 * ```
 *
 * @internal
 * @category Client
 * @since 1.0.0
 */
type ModalInternals = ModalController & {
  stores?: {
    connection?: {
      actions?: {
        setConnecting?: (walletId: string) => void;
        setConnected?: (data: {
          walletId: string;
          accounts?: string[];
          chainId?: string;
          chainType?: string;
          address?: string;
        }) => void;
        setDisconnected?: () => void;
      };
    };
    error?: {
      actions?: {
        setError?: (error: unknown, message: string) => void;
      };
    };
  };
  setView?: (view: string) => void;
};

/**
 * Permission configuration interface
 * @private
 */
interface PermissionsConfig {
  permissions?: Record<string, string[]>;
}

/**
 * Permission extraction result
 * @private
 */
interface PermissionExtractionResult {
  permissions: string[] | undefined;
  chainId: string | undefined;
  source: 'config' | 'options' | 'default' | 'none';
}

export class WalletMeshClient implements WalletMeshClientInterface, InternalWalletMeshClientInterface {
  private adapters = new Map<string, WalletAdapter>();
  private providerVersions = new Map<string, number>();

  /**
   * Track adapter health for intelligent caching
   * @private
   */
  private adapterHealth = new Map<
    string,
    {
      errors: number;
      lastError: Date | null;
      lastSuccess: Date | null;
      consecutiveFailures: number;
    }
  >();

  /**
   * Configuration for adapter health tracking
   * @private
   */
  private readonly ADAPTER_HEALTH_CONFIG = {
    MAX_CONSECUTIVE_FAILURES: 3,
    ERROR_TIMEOUT_MS: 30000, // 30 seconds
    MAX_CACHED_ERRORS: 5,
  };

  private providerLoader: ProviderLoader;
  private providerValidator: ProviderValidator;
  private serviceRegistry: ServiceRegistry;
  private dappRpcIntegration: DAppRpcIntegration;
  private discoveryService?: import('../../client/DiscoveryService.js').DiscoveryService | undefined;
  private evmDiscoveryService?: EVMDiscoveryService;
  private solanaDiscoveryService?: SolanaDiscoveryService;
  private initialized = false;
  private initializingPromise?: Promise<void>;
  private rehydrationAttempted = false;
  private modalUnsubscribe?: (() => void) | undefined;
  private isClosingModal = false;
  private adapterEventListeners = new Map<
    string,
    Array<{ event: string; listener: (...args: unknown[]) => void }>
  >();
  public modal?: ModalController;

  private get sessionManager(): SessionManager {
    // Use the session manager adapter
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
          throw ErrorFactory.configurationError(`Session ${sessionId} not found`, { sessionId });
        }
        return result;
      },
      switchAccount: async (sessionId: string, _accountAddress: string) => {
        // Implementation would switch account in session
        const session = store.getState().entities.sessions[sessionId];
        if (!session) throw ErrorFactory.configurationError(`Session ${sessionId} not found`, { sessionId });
        return session;
      },
      discoverAccounts: async () => [],
      addAccount: async (sessionId: string, _account) => {
        const session = store.getState().entities.sessions[sessionId];
        if (!session) throw ErrorFactory.configurationError(`Session ${sessionId} not found`, { sessionId });
        return session;
      },
      removeAccount: async (sessionId: string) => {
        const session = store.getState().entities.sessions[sessionId];
        if (!session) throw ErrorFactory.configurationError(`Session ${sessionId} not found`, { sessionId });
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

  /**
   * Helper method to get session by wallet ID
   * Replaces adapter.connection pattern with session-based lookup
   * @private
   */
  private getSessionByWalletId(walletId: string): SessionState | null {
    const state = useStore.getState();
    const sessions = Object.values(state.entities.sessions).filter(
      (s) => s.walletId === walletId && s.status === 'connected',
    );
    return sessions[0] || null;
  }

  constructor(
    private config: WalletMeshConfig,
    public readonly registry: WalletRegistry,
    private logger?: Logger,
  ) {
    // Initialize service registry with a proper logger
    // If no logger is provided, create a debug logger for the service registry
    const serviceLogger = this.logger || createDebugLogger('ServiceRegistry', false);
    this.serviceRegistry = new ServiceRegistry(serviceLogger);

    // Initialize dApp RPC integration
    this.dappRpcIntegration = new DAppRpcIntegration(serviceLogger);

    // Initialize provider loader with configuration
    const providerConfig = {
      preloadOnInit: true, // Default to true for better performance
      preloadChainTypes: this.extractChainTypesFromConfig(),
      ...(this.logger && { logger: this.logger }),
    };
    this.providerLoader = new ProviderLoader(providerConfig);

    // Initialize provider validator with logger
    this.providerValidator = new ProviderValidator(this.logger);

    // Multi-wallet functionality is now part of unified store
  }

  /**
   * Sets the modal controller for this client.
   *
   * This method is part of the two-phase construction pattern, which eliminates
   * the circular dependency between the client and modal. The client is created first,
   * then the modal is created with the client reference, and finally the modal is wired
   * back to the client using this method.
   *
   * @param modal - The modal controller to associate with this client
   * @throws {ModalError} If modal is already set
   * @internal
   */
  setModal(modal: ModalController): void {
    if (this.modal) {
      throw ErrorFactory.configurationError('Modal already set - cannot set modal twice');
    }
    this.modal = modal;

    // Now set up modal event handlers
    this.setupModalHandlers();
  }

  private getInvocationCaller(): string {
    const err = new Error();
    if (!err.stack) {
      return 'unknown';
    }
    const stackLines = err.stack.split('\n').map((line) => line.trim());
    const callerFrame = stackLines[2];
    return callerFrame || 'unknown';
  }

  private withModalInternals(callback: (modal: ModalInternals) => void): void {
    if (!this.modal) {
      return;
    }
    callback(this.modal as ModalInternals);
  }

  private updateModalStatus(
    status: 'connecting' | 'reconnecting' | 'connected' | 'error',
    payload: {
      walletId?: string;
      accounts?: string[];
      chainId?: string;
      chainType?: string;
      address?: string;
      error?: unknown;
      errorMessage?: string;
    } = {},
  ): void {
    this.withModalInternals((modal) => {
      switch (status) {
        case 'connecting': {
          if (payload.walletId && modal.stores?.connection?.actions?.setConnecting) {
            modal.stores.connection.actions.setConnecting(payload.walletId);
          }
          modal.setView?.('connecting');
          break;
        }
        case 'reconnecting': {
          // For reconnecting, use the same connecting view
          // The modal component will detect isReconnecting from account state
          if (payload.walletId && modal.stores?.connection?.actions?.setConnecting) {
            modal.stores.connection.actions.setConnecting(payload.walletId);
          }
          modal.setView?.('connecting');
          break;
        }
        case 'connected': {
          if (payload.walletId && modal.stores?.connection?.actions?.setConnected) {
            const connectedPayload: {
              walletId: string;
              accounts?: string[];
              chainId?: string;
              chainType?: string;
              address?: string;
            } = {
              walletId: payload.walletId,
            };

            if (payload.accounts) {
              connectedPayload.accounts = payload.accounts;
            }
            if (payload.chainId) {
              connectedPayload.chainId = payload.chainId;
            }
            if (payload.chainType) {
              connectedPayload.chainType = payload.chainType;
            }
            if (payload.address) {
              connectedPayload.address = payload.address;
            }

            modal.stores.connection.actions.setConnected(connectedPayload);
          }
          modal.setView?.('connected');
          break;
        }
        case 'error': {
          if (modal.stores?.error?.actions?.setError) {
            const errorMessage =
              payload.errorMessage ||
              (payload.error instanceof Error
                ? payload.error.message
                : typeof payload.error === 'string'
                  ? payload.error
                  : JSON.stringify(payload.error));
            modal.stores.error.actions.setError(payload.error, errorMessage);
          }
          modal.setView?.('error');
          break;
        }
      }
    });
  }

  /**
   * Initializes the client and all its subsystems.
   *
   * This method must be called before using most client functionality.
   * It sets up:
   * - Service registry with business logic services
   * - Provider loader for lazy-loading blockchain providers
   * - dApp RPC integration for direct blockchain communication
   * - Discovery coordinator for wallet detection (when available)
   *
   * @returns Promise that resolves when initialization is complete
   *
   * @example
   * ```typescript
   * const client = new WalletMeshClient(config, registry, logger);
   * client.setModal(modal); // Two-phase construction
   * await client.initialize();
   * // Client is now ready for use
   * ```
   *
   * @public
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger?.debug('WalletMeshClient: Already initialized, skipping');
      return;
    }

    if (this.initializingPromise) {
      await this.initializingPromise;
      return;
    }

    const initializationTask = (async () => {
      await this.performCoreInitialization();
      this.initialized = true;

      if (this.config.handleRehydration !== false) {
        try {
          await this.handleRehydratedSessions();
        } catch (rehydrationError) {
          this.logger?.warn('Session rehydration encountered an error', rehydrationError);
        }
      }

      this.logger?.debug('WalletMeshClient: Initialization complete');
    })();

    this.initializingPromise = initializationTask;

    try {
      await initializationTask;
    } finally {
      delete this.initializingPromise;
    }
  }

  private async performCoreInitialization(): Promise<void> {
    this.logger?.debug('WalletMeshClient: Initializing');

    const basicChainConfigs = this.extractBasicChainConfigs();
    const fullChainInfos = this.extractFullChainInfos();

    await this.serviceRegistry.initialize({
      ...(this.logger ? { logger: this.logger } : {}),
      chains: fullChainInfos,
    });

    await this.providerLoader.initialize();

    this.dappRpcIntegration.initializeFromChainConfigs(basicChainConfigs);

    await this.initializeDiscovery();

    const supportedChainTypes = this.extractChainTypesFromConfig();
    this.logger?.info('Chain type configuration for wallet discovery', {
      supportedChainTypes,
      chains: this.config.chains?.map((c) => ({
        chainId: c.chainId,
        chainType: c.chainType,
        name: c.name,
      })),
      willDiscoverEVM: supportedChainTypes.includes(ChainType.Evm),
      willDiscoverSolana: supportedChainTypes.includes(ChainType.Solana),
      willDiscoverAztec: supportedChainTypes.includes(ChainType.Aztec),
    });

    if (supportedChainTypes.includes(ChainType.Evm)) {
      this.logger?.info('Preparing EVM wallet discovery (manual execution)');
      await this.initializeEVMDiscovery();
    } else {
      this.logger?.info('Skipping EVM wallet discovery - not in configured chain types');
    }

    if (supportedChainTypes.includes(ChainType.Solana)) {
      this.logger?.info('Preparing Solana wallet discovery (manual execution)');
      await this.initializeSolanaDiscovery();
    } else {
      this.logger?.info('Skipping Solana wallet discovery - not in configured chain types');
    }

    if (supportedChainTypes.includes(ChainType.Aztec)) {
      this.logger?.info(
        'Aztec wallets will be discovered through main discovery coordinator and direct registration',
      );
    }

    // Note: Discovery is intentionally NOT run during initialization.
    // Discovery will happen when the user clicks "Connect Wallet".
    // For rehydrated sessions with complete qualifiedResponder data,
    // adapters will be recreated directly without needing discovery.
  }

  /**
   * Handles rehydrated sessions from persisted storage.
   *
   * This method checks for any sessions that were persisted and attempts
   * to reconnect to the active session if it exists.
   *
   * @private
   * @returns Promise that resolves when session rehydration is complete
   */
  private async handleRehydratedSessions(): Promise<void> {
    // Prevent multiple rehydration attempts
    if (this.rehydrationAttempted) {
      this.logger?.debug('Rehydration already attempted, skipping');
      return;
    }
    this.rehydrationAttempted = true;

    const store = useStore.getState();
    const { entities, active } = store;
    const activeSessions = Object.values(entities.sessions);
    const activeSessionId = active.sessionId;

    if (activeSessions.length === 0) {
      this.logger?.debug('No rehydrated sessions found');
      return;
    }

    const availableWalletIds = Object.values(entities.wallets).map((w: WalletInfo) => w.id);
    const discoveredWalletIds = this.registry.getAllDiscoveredWallets().map((w) => w.id);

    this.logger?.info('Found rehydrated sessions:', {
      sessionCount: activeSessions.length,
      activeSessionId,
      sessionWalletIds: activeSessions.map((s) => s.walletId),
      availableWalletIds,
      discoveredWalletIds,
    });

    // Recreate adapters for sessions with adapter reconstruction data
    await this.recreateAdaptersFromSessions(activeSessions);

    // Pre-load and install built-in adapters for sessions
    // This ensures built-in adapters have access to persisted session data
    // before reconnection is attempted
    for (const session of activeSessions) {
      const { walletId } = session;

      // Only process built-in wallets that aren't already loaded
      if (this.registry.isBuiltinWallet(walletId) && !this.adapters.has(walletId)) {
        this.logger?.debug('Pre-loading built-in adapter for session', { walletId });

        try {
          // Load the built-in adapter with session data for transport reconstruction
          const adapter = await this.loadBuiltinAdapter(walletId, session);

          if (adapter) {
            // Install the adapter so it can restore session data
            // Create a logger context for the adapter
            const adapterLogger = this.logger || {
              debug: () => {},
              info: () => {},
              warn: () => {},
              error: () => {},
            };

            await adapter.install({
              logger: adapterLogger,
            });

            // Cache the adapter in the adapters Map
            this.adapters.set(walletId, adapter);

            this.logger?.info('Pre-loaded and installed built-in adapter for reconnection', {
              walletId,
              hasTransportConfig: !!session.adapterReconstruction?.transportConfig,
              hasSessionId: !!session.adapterReconstruction?.sessionId,
            });
          }
        } catch (error) {
          this.logger?.warn('Failed to pre-load built-in adapter', { walletId, error });
        }
      }
    }

    // If there's an active session, attempt to reconnect
    const activeSession = activeSessionId ? entities.sessions[activeSessionId] : null;
    if (activeSession) {
      this.logger?.info('Attempting to reconnect to rehydrated session:', {
        sessionId: activeSessionId,
        walletId: activeSession.walletId,
      });

      try {
        // Get the wallet session ID from adapterReconstruction
        // This is what the wallet expects to recognize the session
        this.logger?.debug('[DEBUG] Checking adapterReconstruction for sessionId', {
          hasAdapterReconstruction: !!activeSession.adapterReconstruction,
          adapterReconstructionKeys: activeSession.adapterReconstruction
            ? Object.keys(activeSession.adapterReconstruction)
            : [],
          adapterReconstructionSessionId: activeSession.adapterReconstruction?.sessionId,
        });

        const walletSessionId = activeSession.adapterReconstruction?.sessionId;

        // Try to get existing provider for reconnection
        const existingProvider = activeSessionId ? getProviderForSession(activeSessionId) : null;

        // If we have a sessionId and provider with reconnect method, use reconnect instead of connect
        if (
          walletSessionId &&
          existingProvider &&
          typeof existingProvider === 'object' &&
          'reconnect' in existingProvider &&
          typeof (existingProvider as any).reconnect === 'function'
        ) {
          this.logger?.info('Using provider reconnect method to restore session', {
            walletId: activeSession.walletId,
            walletSessionId,
            hasExistingProvider: true,
          });

          try {
            // Call reconnect on the provider
            const reconnectResult = await (existingProvider as any).reconnect(walletSessionId);

            this.logger?.info('Successfully reconnected via provider.reconnect()', {
              walletId: activeSession.walletId,
              reconnectResult,
            });
          } catch (reconnectError) {
            this.logger?.warn('Provider reconnect failed, falling back to connect', {
              walletId: activeSession.walletId,
              error: reconnectError,
            });

            // Fall back to regular connect, but pass adapter reconstruction data
            // so the adapter can use provider.reconnect() instead of creating new connection
            const connectOptions: ConnectOptions = {
              isReconnection: true,
              chain: activeSession.chain,
              sessionId: walletSessionId,
              adapterReconstruction: activeSession.adapterReconstruction,
            };
            await this.connect(activeSession.walletId, connectOptions);
          }
        } else {
          // No existing provider or sessionId, use regular connect flow
          this.logger?.info('No provider reconnect available, using regular connect', {
            walletId: activeSession.walletId,
            hasWalletSessionId: !!walletSessionId,
            hasExistingProvider: !!existingProvider,
            hasReconnectMethod:
              existingProvider && typeof existingProvider === 'object' && 'reconnect' in existingProvider,
          });

          const connectOptions: ConnectOptions = {
            isReconnection: true,
            chain: activeSession.chain,
            adapterReconstruction: activeSession.adapterReconstruction,
          };

          if (walletSessionId) {
            connectOptions.sessionId = walletSessionId;
            this.logger?.debug('Using wallet session ID for reconnection', {
              walletId: activeSession.walletId,
              walletSessionId,
            });
          } else {
            this.logger?.warn('No wallet session ID found in adapterReconstruction, reconnection may fail', {
              walletId: activeSession.walletId,
              modalSessionId: activeSessionId,
              hasAdapterReconstruction: !!activeSession.adapterReconstruction,
              adapterReconstructionKeys: activeSession.adapterReconstruction
                ? Object.keys(activeSession.adapterReconstruction)
                : [],
            });
          }

          await this.connect(activeSession.walletId, connectOptions);
        }

        this.logger?.info('Successfully reconnected to rehydrated session');
      } catch (error) {
        this.logger?.warn('Failed to reconnect to rehydrated session:', error);
        // Clear the failed session
        if (activeSessionId) {
          connectionActions.endSession(useStore, activeSessionId);
        }
      }
    }

    // Clean up orphaned sessions (sessions with no provider instance)
    // This handles cases where sessions were restored from localStorage but couldn't reconnect
    this.cleanupOrphanedSessions();
  }

  /**
   * Recreate adapters from rehydrated sessions with adapter reconstruction data
   *
   * This is essential for discovered wallets which need to be reconstructed from
   * persisted transport configuration and adapter type information.
   *
   * @private
   */
  private async recreateAdaptersFromSessions(sessions: SessionState[]): Promise<void> {
    for (const session of sessions) {
      // Skip if no adapter reconstruction data
      if (!session.adapterReconstruction) {
        continue;
      }

      const { adapterType, transportConfig, walletMetadata } = session.adapterReconstruction;
      const { walletId } = session;

      try {
        // Check if adapter already exists
        if (this.adapters.has(walletId)) {
          this.logger?.debug('Adapter already exists, skipping recreation', { walletId });
          continue;
        }

        // Skip pre-registered built-in wallets - they will be loaded via loadBuiltinAdapter()
        // Don't register them as discovered wallets
        if (this.registry.isBuiltinWallet(walletId)) {
          this.logger?.debug('Skipping pre-registered wallet, will load via built-in path', { walletId });
          continue;
        }

        // Restore wallet metadata to registry if available
        // This makes the wallet appear in the UI immediately
        if (walletMetadata && this.registry) {
          // Map adapter type to valid DiscoveredWalletInfo type
          let normalizedAdapterType: 'discovery' | 'aztec' | 'solana' | 'evm';
          const lowerType = adapterType.toLowerCase();
          if (lowerType.includes('discovery')) {
            normalizedAdapterType = 'discovery';
          } else if (lowerType.includes('aztec')) {
            normalizedAdapterType = 'aztec';
          } else if (lowerType.includes('solana')) {
            normalizedAdapterType = 'solana';
          } else {
            normalizedAdapterType = 'evm'; // default fallback
          }

          const discoveredWallet = {
            id: walletId,
            name: walletMetadata.name,
            icon: walletMetadata.icon,
            description: walletMetadata.description,
            homepage: walletMetadata.homepage,
            adapterType: normalizedAdapterType,
            adapterConfig: {
              // Use discoveryData if available (new minimal path), fall back to qualifiedResponder (legacy)
              qualifiedResponder:
                session.adapterReconstruction.discoveryData ||
                session.adapterReconstruction.qualifiedResponder,
              transportConfig: session.adapterReconstruction.transportConfig,
              connectionManager: this.discoveryService?.getConnectionManager(),
            },
            discoveryMethod: 'discovery-protocol' as const,
          };

          try {
            this.registry.registerDiscoveredWallet(discoveredWallet);
            this.logger?.debug('Restored wallet to registry', { walletId });
          } catch (registryError) {
            this.logger?.warn('Failed to add wallet to registry', { walletId, registryError });
          }
        }

        // For discovery adapters, we need to recreate from transport config
        if (adapterType === 'discovery' || adapterType === 'DiscoveryAdapter') {
          await this.recreateDiscoveryAdapter(walletId, transportConfig, session);
        } else {
          // For other adapter types, they should already be registered
          // or can be created through normal means
          this.logger?.debug('Non-discovery adapter, will be handled by normal connection flow', {
            walletId,
            adapterType,
          });
        }
      } catch (error) {
        this.logger?.error('Failed to recreate adapter from session:', {
          walletId,
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue with other sessions even if one fails
      }
    }
  }

  /**
   * Clean up orphaned sessions that have no provider instance
   *
   * This handles cases where sessions were restored from localStorage during
   * Zustand rehydration but couldn't reconnect or don't have registered providers.
   * Sessions without providers can't perform any operations, so they should be removed.
   *
   * @private
   */
  private cleanupOrphanedSessions(): void {
    const store = useStore.getState();
    const { entities } = store;
    const sessionIds = Object.keys(entities.sessions);

    if (sessionIds.length === 0) {
      return;
    }

    let removedCount = 0;
    for (const sessionId of sessionIds) {
      const provider = getProviderForSession(sessionId);
      if (!provider) {
        this.logger?.info('Removing orphaned session with no provider instance', {
          sessionId,
          walletId: entities.sessions[sessionId]?.walletId,
        });
        connectionActions.endSession(useStore, sessionId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger?.info('Cleaned up orphaned sessions', {
        totalSessions: sessionIds.length,
        removedCount,
        remainingCount: sessionIds.length - removedCount,
      });
    }
  }

  /**
   * Recreate a discovery adapter from session reconstruction data
   *
   * Enhanced to restore the qualified responder to the discovery service before
   * creating the adapter, eliminating the need to re-run discovery.
   *
   * @private
   */
  private async recreateDiscoveryAdapter(
    walletId: string,
    _transportConfig: { type: string; config: Record<string, unknown> },
    session: SessionState,
  ): Promise<void> {
    if (!this.discoveryService) {
      this.logger?.warn('Discovery service not available for adapter recreation', { walletId });
      return;
    }

    try {
      const { adapterReconstruction } = session;
      const discoveryData = adapterReconstruction?.discoveryData;

      // New path: Use minimal discoveryData to create adapter directly
      if (discoveryData) {
        this.logger?.info('Recreating DiscoveryAdapter from minimal session data', { walletId });

        // Get connection manager
        const connectionManager = this.discoveryService.getConnectionManager();
        if (!connectionManager) {
          throw ErrorFactory.configurationError('Discovery connection manager not available', { walletId });
        }

        // Import DiscoveryAdapter dynamically
        const { DiscoveryAdapter } = await import('../wallets/discovery/DiscoveryAdapter.js');

        // Create adapter directly using saved minimal data
        const adapter = new DiscoveryAdapter(discoveryData, connectionManager, { autoConnect: false });

        // Restore session ID if available
        const sessionId = adapterReconstruction?.sessionId;
        if (sessionId && 'setSessionId' in adapter && typeof adapter.setSessionId === 'function') {
          (adapter as any).setSessionId(sessionId);
          this.logger?.debug('Restored session ID to adapter', { walletId, sessionId });
        }

        this.adapters.set(walletId, adapter);
        this.setupAdapterHandlers(walletId, adapter);
        this.logger?.info('Successfully recreated discovery adapter from minimal data', { walletId });
        return;
      }

      // Legacy path: Try to use qualifiedResponder (for backward compatibility)
      const qualifiedResponder = adapterReconstruction?.qualifiedResponder;
      if (qualifiedResponder) {
        this.logger?.debug('Using legacy qualifiedResponder for adapter recreation', { walletId });

        // Restore to discovery service's internal map
        (this.discoveryService as any).discoveredResponders.set(walletId, qualifiedResponder);
        (this.discoveryService as any).qualifiedWallets.set(walletId, qualifiedResponder);

        // Create adapter using discovery service
        const adapter = await this.discoveryService.createWalletAdapter(walletId, {
          autoConnect: false,
        });

        if (adapter) {
          const sessionId = adapterReconstruction?.sessionId;
          if (sessionId && 'setSessionId' in adapter && typeof adapter.setSessionId === 'function') {
            (adapter as any).setSessionId(sessionId);
          }

          this.adapters.set(walletId, adapter);
          this.setupAdapterHandlers(walletId, adapter);
          this.logger?.info('Successfully recreated discovery adapter from legacy data', { walletId });
        }
        return;
      }

      // No data available - cannot recreate
      this.logger?.warn('No discovery data available for adapter recreation', { walletId });
      throw ErrorFactory.configurationError('Cannot recreate DiscoveryAdapter: no session data available', {
        walletId,
      });
    } catch (error) {
      this.logger?.error('Failed to recreate discovery adapter:', {
        walletId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Initializes the discovery coordinator for automatic wallet detection.
   *
   * NOTE: Temporarily disabled due to type incompatibility between WalletRegistry and WalletAdapterRegistry.
   * Will be re-enabled once type compatibility is resolved.
   *
   * @private
   * @returns Promise that resolves when discovery is initialized
   */
  private async initializeDiscovery(): Promise<void> {
    if (!this.logger) {
      return;
    }

    try {
      // Import DiscoveryService dynamically to avoid circular dependencies
      const { DiscoveryService } = await import('../../client/DiscoveryService.js');

      // Create discovery service (adapters will be created on-demand)
      // Convert supportedInterfaces to technology-based requirements
      const technologies = this.createTechnologyRequirements();

      // Use discovery config from client config if available
      const discoveryConfig = this.config.discovery || {};

      // Extract chain IDs from client config chains array
      const chainIdsFromConfig =
        this.config.chains?.map((chain) => chain.chainId).filter((id): id is string => !!id) || [];

      // Merge chain IDs with discovery config capabilities
      const existingCapabilities = discoveryConfig.capabilities || {};
      const mergedCapabilities: {
        chains?: string[];
        features?: string[];
        interfaces?: string[];
      } = {
        ...(existingCapabilities.features && { features: existingCapabilities.features }),
        ...(existingCapabilities.interfaces && { interfaces: existingCapabilities.interfaces }),
        chains: [...(existingCapabilities.chains || []), ...chainIdsFromConfig],
      };

      const discoveryService = new DiscoveryService(
        {
          enabled: discoveryConfig.enabled !== false,
          timeout: discoveryConfig.timeout || 5000,
          retryInterval: discoveryConfig.retryInterval ?? 30000,
          maxAttempts: discoveryConfig.maxAttempts || 0,
          // Use technologies from config if available, otherwise use generated ones
          ...(discoveryConfig.technologies
            ? {
                technologies: discoveryConfig.technologies.map((tech) => ({
                  type: tech.type as 'evm' | 'solana' | 'aztec',
                  interfaces: tech.interfaces || [],
                  ...(tech.features && { features: tech.features }),
                })),
              }
            : technologies && { technologies }),
          // Add dApp info from discovery config
          ...(discoveryConfig.dappInfo && { dappInfo: discoveryConfig.dappInfo }),
          // Add capabilities with merged chain IDs from client config
          capabilities: mergedCapabilities,
          transport: {
            adapterConfig: {
              autoConnect: false,
              retries: 3,
              timeout: 30000,
            },
          },
        },
        this.registry,
        this.logger,
      );

      // Set up event listeners for discovered wallets
      discoveryService.onEnhanced('wallet_discovered_with_transport', (event: unknown) => {
        this.handleDiscoveredWallet(
          (event as { wallet: import('@walletmesh/discovery').QualifiedResponder }).wallet,
        );
      });

      // No longer listening for adapter_created since adapters are created on-demand

      // Store discovery service for cleanup
      this.discoveryService = discoveryService;
      this.logger.debug('Discovery system initialized for manual wallet discovery');
    } catch (error) {
      this.logger.error('Failed to initialize discovery system', error);
      // Don't throw - discovery is optional and shouldn't break client initialization
    }
  }

  /**
   * Extracts chain types from the client configuration.
   *
   * Analyzes the chains array in the configuration to determine which
   * blockchain types are supported by the application.
   *
   * @private
   * @returns Array of unique chain types, empty array if none specified
   */
  private extractChainTypesFromConfig(): ChainType[] {
    const chainTypes = new Set<ChainType>();

    // Extract from chains array if it exists
    if (this.config.chains) {
      for (const chain of this.config.chains) {
        // Chains are SupportedChain objects
        // Handle chainType property
        if (chain.chainType) {
          chainTypes.add(chain.chainType);
        }
        // Also parse chainId format (e.g., "aztec:31337", "evm:1")
        // to ensure we catch all chain types
        if (chain.chainId && typeof chain.chainId === 'string') {
          const [prefix] = chain.chainId.split(':');
          if (prefix === 'aztec') {
            chainTypes.add(ChainType.Aztec);
          } else if (prefix === 'solana') {
            chainTypes.add(ChainType.Solana);
          } else if (prefix === 'evm') {
            chainTypes.add(ChainType.Evm);
          }
        }
        // If chainId is a number or hex string, it's EVM
        else if (
          chain.chainId &&
          (typeof chain.chainId === 'number' ||
            (typeof chain.chainId === 'string' &&
              (chain.chainId.startsWith('0x') || /^\d+$/.test(chain.chainId))))
        ) {
          chainTypes.add(ChainType.Evm);
        }
      }
    }

    // Don't default to any chain type - let discovery services check explicitly
    return Array.from(chainTypes);
  }

  /**
   * Prepares the EVM discovery service for manual execution.
   *
   * This creates the discovery service without triggering any discovery
   * scans. Actual discovery runs are deferred until explicitly requested.
   *
   * @private
   */
  private async initializeEVMDiscovery(): Promise<void> {
    if (typeof window === 'undefined') {
      this.logger?.debug('Skipping EVM discovery preparation - not in browser environment');
      return;
    }

    const configuredChainTypes = this.extractChainTypesFromConfig();
    if (!configuredChainTypes.includes(ChainType.Evm)) {
      this.logger?.debug('Skipping EVM discovery preparation - EVM chain type not in configuration');
      return;
    }

    if (this.evmDiscoveryService) {
      this.logger?.debug('EVM discovery service already prepared');
      return;
    }

    try {
      this.evmDiscoveryService = new EVMDiscoveryService(
        {
          enabled: true,
          eip6963Timeout: 100,
          preferEIP6963: true,
        },
        this.logger,
      );
      this.logger?.debug('EVM discovery service prepared for manual execution');
    } catch (error) {
      this.logger?.error('Failed to prepare EVM discovery service', error);
    }
  }

  /**
   * Prepares the Solana discovery service for manual execution.
   *
   * This creates the discovery service without triggering any discovery
   * scans. Actual discovery runs are deferred until explicitly requested.
   *
   * @private
   */
  private async initializeSolanaDiscovery(): Promise<void> {
    if (typeof window === 'undefined') {
      this.logger?.debug('Skipping Solana discovery preparation - not in browser environment');
      return;
    }

    const configuredChainTypes = this.extractChainTypesFromConfig();
    if (!configuredChainTypes.includes(ChainType.Solana)) {
      this.logger?.debug('Skipping Solana discovery preparation - Solana chain type not in configuration');
      return;
    }

    if (this.solanaDiscoveryService) {
      this.logger?.debug('Solana discovery service already prepared');
      return;
    }

    try {
      this.solanaDiscoveryService = new SolanaDiscoveryService(
        {
          enabled: true,
          walletStandardTimeout: 500,
          preferWalletStandard: true,
          includeDeprecated: false,
        },
        this.logger,
      );
      this.logger?.debug('Solana discovery service prepared for manual execution');
    } catch (error) {
      this.logger?.error('Failed to prepare Solana discovery service', error);
    }
  }

  /**
   * Runs the EVM discovery workflow on-demand.
   *
   * @private
   */
  private async runEVMDiscovery(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    const configuredChainTypes = this.extractChainTypesFromConfig();
    if (!configuredChainTypes.includes(ChainType.Evm)) {
      return;
    }

    try {
      await this.initializeEVMDiscovery();
      if (!this.evmDiscoveryService) {
        return;
      }

      this.logger?.debug('Running EVM wallet discovery');
      const results = await this.evmDiscoveryService.discover();
      const allWallets = this.evmDiscoveryService.getDiscoveredWallets();

      this.logger?.info('EVM discovery completed', {
        eip6963Count: results.eip6963Wallets.length,
        eip1193: !!results.eip1193Wallet,
        totalFound: allWallets.length,
      });

      for (const wallet of allWallets) {
        const discoveredInfo: DiscoveredWalletInfo = {
          id: wallet.id,
          responderId: wallet.id,
          name: wallet.name,
          icon: wallet.icon,
          adapterType: 'evm',
          adapterConfig: {
            id: wallet.id,
            name: wallet.name,
            icon: wallet.icon,
            provider: wallet.provider,
          },
          discoveryMethod: wallet.type === 'eip6963' ? 'eip6963' : 'eip1193',
          metadata: wallet.metadata || {},
        };

        this.registry.registerDiscoveredWallet(discoveredInfo);

        let walletSupportedChains: ChainType[] = [ChainType.Evm];
        const adapter = this.registry.getAdapter(wallet.id);
        if (adapter?.capabilities.chains) {
          walletSupportedChains = adapter.capabilities.chains.map((c) => c.type);
        }

        const walletSupportsConfiguredChains = walletSupportedChains.some((chainType) =>
          configuredChainTypes.includes(chainType),
        );

        if (walletSupportsConfiguredChains) {
          const walletInfo: WalletInfo = {
            id: wallet.id,
            name: wallet.name,
            icon: wallet.icon,
            description: `Discovered ${wallet.name} wallet`,
            chains: walletSupportedChains,
          };
          connectionActions.addWallet(useStore, walletInfo);
          this.logger?.debug('Registered discovered EVM wallet', {
            id: wallet.id,
            name: wallet.name,
            method: wallet.type,
          });
        } else {
          this.logger?.debug('Skipping EVM wallet registration - does not support configured chain types', {
            walletId: wallet.id,
            walletChains: walletSupportedChains,
            configuredChains: configuredChainTypes,
          });
        }
      }

      this.logger?.info('EVM wallet discovery run completed successfully', {
        registeredCount: allWallets.length,
      });
    } catch (error) {
      this.logger?.error('Failed to run EVM discovery', error);
    }
  }

  /**
   * Runs the Solana discovery workflow on-demand.
   *
   * @private
   */
  private async runSolanaDiscovery(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    const configuredChainTypes = this.extractChainTypesFromConfig();
    if (!configuredChainTypes.includes(ChainType.Solana)) {
      return;
    }

    try {
      await this.initializeSolanaDiscovery();
      if (!this.solanaDiscoveryService) {
        return;
      }

      this.logger?.debug('Running Solana wallet discovery');
      const results = await this.solanaDiscoveryService.discover();
      const allWallets = this.solanaDiscoveryService.getDiscoveredWallets();

      this.logger?.info('Solana discovery completed', {
        walletStandardCount: results.walletStandardWallets.length,
        injectedCount: results.injectedWallets.length,
        legacyCount: results.legacyWallets?.length || 0,
        totalFound: allWallets.length,
      });

      for (const wallet of allWallets) {
        const discoveredInfo: DiscoveredWalletInfo = {
          id: wallet.id,
          responderId: wallet.id,
          name: wallet.name,
          icon: wallet.icon,
          adapterType: 'solana',
          adapterConfig: {
            id: wallet.id,
            name: wallet.name,
            icon: wallet.icon,
            provider: wallet.provider,
          },
          discoveryMethod: wallet.type === 'wallet-standard' ? 'discovery-protocol' : 'eip1193',
          metadata: wallet.metadata || {},
        };

        this.registry.registerDiscoveredWallet(discoveredInfo);

        let walletSupportedChains: ChainType[] = [ChainType.Solana];
        const adapter = this.registry.getAdapter(wallet.id);
        if (adapter?.capabilities.chains) {
          walletSupportedChains = adapter.capabilities.chains.map((c) => c.type);
        }

        const walletSupportsConfiguredChains = walletSupportedChains.some((chainType) =>
          configuredChainTypes.includes(chainType),
        );

        if (walletSupportsConfiguredChains) {
          const walletInfo: WalletInfo = {
            id: wallet.id,
            name: wallet.name,
            icon: wallet.icon,
            description: `Discovered ${wallet.name} wallet`,
            chains: walletSupportedChains,
          };
          connectionActions.addWallet(useStore, walletInfo);
          this.logger?.debug('Registered discovered Solana wallet', {
            id: wallet.id,
            name: wallet.name,
            method: wallet.type,
          });
        } else {
          this.logger?.debug(
            'Skipping Solana wallet registration - does not support configured chain types',
            {
              walletId: wallet.id,
              walletChains: walletSupportedChains,
              configuredChains: configuredChainTypes,
            },
          );
        }
      }

      this.logger?.info('Solana wallet discovery run completed successfully', {
        registeredCount: allWallets.length,
      });
    } catch (error) {
      this.logger?.error('Failed to run Solana discovery', error);
    }
  }

  /**
   * Runs browser-based discovery fallbacks for configured chain types.
   *
   * @private
   */
  private async runBrowserDiscovery(chainTypes?: ChainType[]): Promise<void> {
    const requestedChainTypes =
      chainTypes && chainTypes.length > 0 ? new Set(chainTypes) : new Set(this.extractChainTypesFromConfig());

    if (requestedChainTypes.has(ChainType.Evm)) {
      await this.runEVMDiscovery();
    }

    if (requestedChainTypes.has(ChainType.Solana)) {
      await this.runSolanaDiscovery();
    }
  }

  /**
   * Handles a wallet discovered through the discovery protocol.
   *
   * @private
   * @param wallet - The discovered wallet (QualifiedResponder)
   */
  private handleDiscoveredWallet(wallet: import('@walletmesh/discovery').QualifiedResponder): void {
    // The wallet should already be validated by TransportDiscoveryService
    // but we can add additional validation checks here
    if (!wallet?.responderId || !wallet?.name) {
      this.logger?.warn('Received invalid discovered wallet data', { wallet });
      return;
    }

    const canonicalId = this.resolveCanonicalWalletId(wallet);

    this.logger?.debug('Wallet discovered through discovery protocol', {
      walletId: canonicalId,
      responderId: wallet.responderId,
      name: wallet.name,
      technologies: wallet.matched?.required?.technologies,
      transportType: wallet.transportConfig?.type,
    });
  }

  private resolveCanonicalWalletId(wallet: import('@walletmesh/discovery').QualifiedResponder): string {
    const discovered = this.registry.getDiscoveredWallet(wallet.responderId);
    if (discovered) {
      return discovered.id;
    }

    const metadata = wallet.metadata as Record<string, unknown> | undefined;
    const metadataId =
      metadata && typeof metadata['canonicalId'] === 'string'
        ? (metadata['canonicalId'] as string).trim()
        : '';
    if (metadataId) {
      return metadataId;
    }

    const rdns = typeof wallet.rdns === 'string' ? wallet.rdns.trim() : '';
    if (rdns) {
      return rdns;
    }

    const transport = wallet.transportConfig;
    if (transport?.type === 'extension' && typeof transport.extensionId === 'string') {
      const extensionId = transport.extensionId.trim();
      if (extensionId) {
        return `extension:${extensionId}`;
      }
    }

    return wallet.responderId;
  }

  /**
   * Create technology requirements from supported interfaces configuration
   * @returns Array of technology requirements for discovery
   */
  private createTechnologyRequirements():
    | Array<{
        type: 'evm' | 'solana' | 'aztec';
        interfaces: string[];
        features?: string[];
      }>
    | undefined {
    // Check if supported interfaces are configured
    if (!this.config.supportedInterfaces) {
      return undefined;
    }

    const technologies: Array<{
      type: 'evm' | 'solana' | 'aztec';
      interfaces: string[];
      features?: string[];
    }> = [];

    // Add EVM technology if interfaces are specified
    if (this.config.supportedInterfaces.evm && this.config.supportedInterfaces.evm.length > 0) {
      technologies.push({
        type: 'evm',
        interfaces: this.config.supportedInterfaces.evm,
        features: ['account-management', 'transaction-signing'],
      });
    }

    // Add Solana technology if interfaces are specified
    if (this.config.supportedInterfaces.solana && this.config.supportedInterfaces.solana.length > 0) {
      technologies.push({
        type: 'solana',
        interfaces: this.config.supportedInterfaces.solana,
        features: ['account-management', 'transaction-signing'],
      });
    }

    // Add Aztec technology if interfaces are specified
    if (this.config.supportedInterfaces.aztec && this.config.supportedInterfaces.aztec.length > 0) {
      technologies.push({
        type: 'aztec',
        interfaces: this.config.supportedInterfaces.aztec,
        features: ['account-management', 'private-transactions'],
      });
    }

    return technologies.length > 0 ? technologies : undefined;
  }

  private mapChainTypesToTechnologies(chainTypes: ChainType[]):
    | Array<{
        type: 'evm' | 'solana' | 'aztec';
        interfaces: string[];
      }>
    | undefined {
    if (!chainTypes || chainTypes.length === 0) {
      return undefined;
    }

    const technologies = chainTypes
      .map((chainType) => {
        switch (chainType) {
          case 'evm':
            return {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            };
          case 'solana':
            return {
              type: 'solana' as const,
              interfaces: ['solana-standard'],
            };
          case 'aztec':
            return {
              type: 'aztec' as const,
              // Request the canonical Aztec wallet API interface for discovery matching
              interfaces: ['aztec-wallet-api-v1'],
            };
          default:
            this.logger?.warn('Unknown chain type for discovery configuration override', { chainType });
            return undefined;
        }
      })
      .filter(
        (tech): tech is { type: 'evm' | 'solana' | 'aztec'; interfaces: string[] } => tech !== undefined,
      );

    return technologies.length > 0 ? technologies : undefined;
  }

  /**
   * Extracts basic chain configurations from the client configuration.
   *
   * Filters the chains array to extract only valid ChainConfig objects
   * that include chainId and chainType properties.
   *
   * @private
   * @returns Array of basic chain configurations
   */
  private extractBasicChainConfigs(): ChainConfig[] {
    if (!this.config.chains) {
      return [];
    }

    return this.config.chains.filter(
      (chain): chain is ChainConfig =>
        typeof chain === 'object' && 'chainId' in chain && 'chainType' in chain,
    );
  }

  /**
   * Extracts complete chain configurations from the client configuration.
   *
   * Filters the chains array to extract only valid ChainConfig objects
   * that include chainId and chainType properties. Maps them to the full
   * ChainInfo format expected by ChainService with default values.
   *
   * @private
   * @returns Array of valid chain configurations
   */
  private extractFullChainInfos(): ChainInfo[] {
    if (!this.config.chains) {
      return [];
    }

    const validChains = this.config.chains.filter(
      (chain): chain is ChainConfig =>
        typeof chain === 'object' && 'chainId' in chain && 'chainType' in chain,
    );

    // Convert to ChainInfo format expected by ChainService
    return validChains.map((chain) => ({
      chainId: chain.chainId as string, // ChainId type in service can be string or number
      chainType: chain.chainType as ChainType,
      name: chain.name || getChainName(chain.chainId),
      required: chain.required ?? false,
      // Provide default values for required fields not in client config
      nativeCurrency: this.getDefaultNativeCurrency(chain.chainType as ChainType, chain.chainId),
      rpcUrls: this.getDefaultRpcUrls(chain.chainType as ChainType, chain.chainId),
      ...(chain.icon && { icon: chain.icon }),
      ...(chain.label && { label: chain.label }),
      ...(chain.interfaces && { interfaces: chain.interfaces }),
      ...(chain.group && { group: chain.group }),
    }));
  }

  /**
   * Get default native currency for a chain.
   */
  private getDefaultNativeCurrency(
    chainType: ChainType,
    chainId: string,
  ): { name: string; symbol: string; decimals: number } {
    if (chainType === ChainType.Evm) {
      // Most EVM chains use ETH or similar
      if (['56', '0x38'].includes(chainId)) {
        return { name: 'BNB', symbol: 'BNB', decimals: 18 };
      }
      if (['137', '0x89'].includes(chainId)) {
        return { name: 'MATIC', symbol: 'MATIC', decimals: 18 };
      }
      return { name: 'Ether', symbol: 'ETH', decimals: 18 };
    }
    if (chainType === ChainType.Solana) {
      return { name: 'SOL', symbol: 'SOL', decimals: 9 };
    }
    if (chainType === ChainType.Aztec) {
      return { name: 'ETH', symbol: 'ETH', decimals: 18 };
    }
    return { name: 'Native', symbol: 'NATIVE', decimals: 18 };
  }

  /**
   * Get default RPC URLs for a chain.
   */
  private getDefaultRpcUrls(chainType: ChainType, chainId: string): string[] {
    // Provide minimal defaults for chain registration
    // The dApp RPC service will handle the actual RPC URLs from dappRpcUrls config
    if (chainType === ChainType.Evm) {
      // Some basic public RPC endpoints
      switch (chainId) {
        case '1':
          return ['https://eth.public-rpc.com'];
        case '137':
          return ['https://polygon-rpc.com'];
        case '56':
          return ['https://bsc-dataseed.bnbchain.org'];
        case '42161':
          return ['https://arb1.arbitrum.io/rpc'];
        case '10':
          return ['https://mainnet.optimism.io'];
        default:
          return ['https://rpc.placeholder.com'];
      }
    }
    if (chainType === ChainType.Solana) {
      switch (chainId) {
        case 'mainnet-beta':
          return ['https://api.mainnet-beta.solana.com'];
        case 'devnet':
          return ['https://api.devnet.solana.com'];
        case 'testnet':
          return ['https://api.testnet.solana.com'];
        default:
          return ['https://api.mainnet-beta.solana.com'];
      }
    }
    if (chainType === ChainType.Aztec) {
      if (chainId === 'aztec:31337') {
        return ['http://localhost:8080'];
      }
      return ['https://api.aztec.network'];
    }
    return ['https://rpc.placeholder.com'];
  }

  /**
   * Get chain configuration by chain ID.
   * @private
   */
  private getChainConfig(chainId: string): ChainConfig | undefined {
    const chain = this.config.chains?.find((chain) => chain.chainId === chainId);
    if (!chain) return undefined;

    // Return only defined properties to comply with exactOptionalPropertyTypes
    return {
      chainId: chain.chainId,
      chainType: chain.chainType,
      name: chain.name,
      required: chain.required,
      ...(chain.label && { label: chain.label }),
      ...(chain.interfaces && { interfaces: chain.interfaces }),
      ...(chain.group && { group: chain.group }),
      ...(chain.icon && { icon: chain.icon }),
    };
  }

  /**
   * Connect to a wallet and establish a session.
   *
   * If no walletId is provided, opens the modal for user selection.
   * Creates a new session with the connected wallet and manages all
   * necessary state updates.
   *
   * @param walletId - Optional ID of specific wallet to connect to
   * @param options - Optional connection options (wallet-specific)
   * @returns Promise resolving to connection details
   * @throws {ModalError} If connection fails or user cancels
   *
   * @example
   * ```typescript
   * // Open modal for user selection
   * const connection = await client.connect();
   *
   * // Connect to specific wallet
   * const connection = await client.connect('metamask', {
   *   silent: true  // Don't show popups
   * });
   * ```
   *
   * @public
   */
  async connect(walletId?: string, options?: ConnectOptions): Promise<WalletConnection> {
    // Ensure client is initialized
    await this.initialize();
    let targetWalletId = walletId;

    if (!targetWalletId) {
      // Open modal for wallet selection
      await this.openModal();

      // Wait for user to select a wallet
      const selectedWalletId = await this.waitForWalletSelection();
      if (!selectedWalletId) {
        throw ErrorFactory.connectorError('unknown', 'No wallet selected', 'USER_CANCELLED');
      }
      targetWalletId = selectedWalletId;
    }

    try {
      // Get or create adapter with health-aware caching
      let adapter = this.adapters.get(targetWalletId);

      // Check if existing adapter should be recreated due to health issues
      if (adapter && this.shouldRecreateAdapter(targetWalletId)) {
        this.logger?.info('Recreating adapter due to health issues', { targetWalletId });
        this.invalidateAdapter(targetWalletId, 'health_check_failed');
        adapter = undefined; // Force recreation
      }

      if (!adapter) {
        this.logger?.debug(`Creating adapter for wallet: ${targetWalletId}`);
        adapter = await this.createAdapterWithProvider(targetWalletId, options);
        this.adapters.set(targetWalletId, adapter);
        this.setupAdapterHandlers(targetWalletId, adapter);
      } else {
        this.logger?.debug(`Using existing adapter for wallet: ${targetWalletId}`);
      }

      // Prepare connection options with project ID and other config
      const connectOptions: ConnectOptions = {
        ...(this.logger && { logger: this.logger }),
        ...options,
      };

      // Only add projectId if it's defined
      if (this.config.projectId) {
        connectOptions.projectId = this.config.projectId;
      }

      // Add appMetadata if it's defined (includes origin for secure communication)
      if (this.config['appMetadata']) {
        connectOptions['appMetadata'] = this.config['appMetadata'];
      }

      // Add configured chains if not already provided in options
      if (!connectOptions.chains && this.config.chains) {
        // Convert configured chains to ConnectOptions format
        connectOptions.chains = this.config.chains.map((chain) => ({
          type: chain.chainType as ChainType,
          chainId: chain.chainId,
        }));
      }

      // Extract and add Aztec permissions if configured
      const permissionResult = this.extractAztecPermissions(options);
      if (permissionResult.permissions && permissionResult.source !== 'none') {
        this.logger?.debug('Adding extracted permissions to connect options', {
          walletId: targetWalletId,
          chainId: permissionResult.chainId,
          source: permissionResult.source,
          permissionCount: permissionResult.permissions.length,
        });

        connectOptions['aztecOptions'] = {
          ...(connectOptions['aztecOptions'] as Record<string, unknown> | undefined),
          permissions: permissionResult.permissions,
        };
      }

      if (targetWalletId) {
        // Set status to 'reconnecting' if this is a reconnection, otherwise 'connecting'
        const status = options?.isReconnection ? 'reconnecting' : 'connecting';
        this.updateModalStatus(status, { walletId: targetWalletId });
      }

      // Connect
      (this.logger?.info || this.logger?.debug || console.info).call(
        this.logger,
        'Client.connect: calling adapter.connect',
        {
          walletId: targetWalletId,
          adapterClass: adapter?.constructor?.name,
        },
      );
      const connection = await adapter.connect(connectOptions);
      (this.logger?.info || this.logger?.debug || console.info).call(
        this.logger,
        'Client.connect: adapter.connect resolved',
        {
          walletId: targetWalletId,
          adapterClass: adapter?.constructor?.name,
        },
      );
      this.logger?.debug('Connection established, creating session', {
        walletId: targetWalletId,
        address: connection.address,
        chainId: connection.chain.chainId,
        chainType: connection.chain.chainType,
      });

      // Create new session using unified session management
      // Use SessionParamsBuilder to construct session parameters
      const sessionBuilder = new SessionParamsBuilder(
        targetWalletId,
        connection,
        adapter,
        this.config,
        options,
      );

      const sessionParams = sessionBuilder.build();

      // Adapt provider for session (builder returns raw provider, we need blockchain provider)
      const providerObj = connection.provider as Record<string, unknown> | null | undefined;
      this.logger?.debug('Adapting provider for session', {
        providerType: connection.provider?.constructor?.name,
        hasCall: providerObj && typeof providerObj === 'object' ? 'call' in providerObj : false,
        hasRequest: providerObj && typeof providerObj === 'object' ? 'request' in providerObj : false,
        hasGetAccounts: providerObj && typeof providerObj === 'object' ? 'getAccounts' in providerObj : false,
      });

      const adaptedProvider = this.adaptWalletProviderToBlockchainProvider(
        connection.provider as WalletProvider,
      );

      this.logger?.debug('Provider adapted successfully', {
        adaptedProviderHasCall: 'call' in adaptedProvider,
        adaptedProviderHasRequest: 'request' in adaptedProvider,
        adaptedProviderHasGetAccounts: 'getAccounts' in adaptedProvider,
      });

      // CRITICAL: Store provider in ProviderRegistry BEFORE calling createSession
      // This prevents Immer from accessing cross-origin Window objects during state mutation
      // Use sessionId from backend wallet if provided, otherwise from sessionParams, or generate new one
      const sessionId = connection.sessionId ?? sessionParams.sessionId ?? generateSessionId('session');
      setProviderForSession(sessionId, adaptedProvider);

      // Ensure sessionId is set in params for createSession
      sessionParams.sessionId = sessionId;

      // DO NOT pass provider through sessionParams - it's already in registry
      // This prevents cross-origin errors when Immer processes the parameters
      delete sessionParams.provider;

      this.logger?.debug('Session parameters prepared', {
        walletId: sessionParams.walletId,
        accountsCount: sessionParams.accounts.length,
        chainId: sessionParams.chain.chainId,
        chainType: sessionParams.chain.chainType,
        providerStoredInRegistry: true,
        sessionId,
      });

      // Use unified store's createSession action to ensure proper state updates
      this.logger?.debug('[DEBUG] sessionParams before createSession', {
        sessionId: sessionParams.sessionId,
        hasAdapterReconstruction: !!sessionParams.adapterReconstruction,
        adapterReconstructionSessionId: (sessionParams.adapterReconstruction as any)?.sessionId,
        adapterReconstructionKeys: sessionParams.adapterReconstruction
          ? Object.keys(sessionParams.adapterReconstruction)
          : [],
      });

      let session: SessionState | undefined;
      try {
        session = await connectionActions.createSession(useStore, sessionParams);
      } catch (sessionError) {
        // Enhanced error logging to capture validation errors
        const errorDetails: Record<string, unknown> = {
          error: sessionError,
          errorType: typeof sessionError,
          errorConstructor: sessionError?.constructor?.name,
          message: sessionError instanceof Error ? sessionError.message : String(sessionError),
          stack: sessionError instanceof Error ? sessionError.stack : undefined,
          walletId: targetWalletId,
          sessionParamsKeys: Object.keys(sessionParams),
          accountsCount: sessionParams.accounts.length,
          firstAccount: sessionParams.accounts[0],
          chain: sessionParams.chain,
          providerStoredInRegistry: true,
          sessionId,
        };

        // Check if it's a Zod validation error
        if (sessionError && typeof sessionError === 'object' && 'issues' in sessionError) {
          errorDetails['zodIssues'] = (sessionError as any).issues;
        }

        this.logger?.error('Failed to create session', errorDetails);
        console.error('[SessionCreationError] Full details:', errorDetails);

        throw ErrorFactory.connectionFailed('Failed to create session', {
          walletId: targetWalletId,
          originalError: sessionError,
        });
      }

      this.logger?.debug('Session created successfully', {
        sessionId: session.sessionId,
        walletId: session.walletId,
        status: session.status,
      });

      // Call adapter's persistSession to save adapter-specific reconstruction data
      // This allows adapters to enhance the session with additional data needed for reconnection
      try {
        if ('persistSession' in adapter && typeof adapter.persistSession === 'function') {
          this.logger?.debug('Calling adapter.persistSession', {
            walletId: targetWalletId,
            sessionId: session.sessionId,
            adapterType: adapter.constructor.name,
          });
          await (adapter as any).persistSession(connection, session.sessionId);
          this.logger?.debug('Adapter persistence completed', {
            walletId: targetWalletId,
            sessionId: session.sessionId,
          });
        } else {
          this.logger?.debug('Adapter does not have persistSession method', {
            walletId: targetWalletId,
            adapterType: adapter.constructor.name,
          });
        }
      } catch (persistError) {
        // Don't throw - session is already created, adapter-specific persistence is an optional enhancement
        this.logger?.warn('Failed to persist adapter-specific session data', {
          walletId: targetWalletId,
          sessionId: session.sessionId,
          error: persistError instanceof Error ? persistError.message : String(persistError),
        });
      }

      // Add wallet info to the configured wallets in the store - but only if it supports configured chain types
      const adapterChains = adapter.capabilities.chains.map((chain) => chain.type);
      const configuredChainTypes = this.extractChainTypesFromConfig();
      const walletSupportsConfiguredChains = adapterChains.some((chainType) =>
        configuredChainTypes.includes(chainType),
      );

      if (walletSupportsConfiguredChains) {
        const walletInfo: WalletInfo = {
          id: targetWalletId,
          name: adapter.metadata.name,
          icon: adapter.metadata.icon || '',
          chains: adapterChains,
          ...(adapter.metadata.description && { description: adapter.metadata.description }),
          ...(adapter.metadata.homepage && { homepage: adapter.metadata.homepage }),
        };
        connectionActions.addWallet(useStore, walletInfo);
      } else {
        this.logger?.debug('Skipping wallet registration - does not support configured chain types', {
          walletId: targetWalletId,
          walletChains: adapterChains,
          configuredChains: configuredChainTypes,
        });
      }

      // Connection is now managed through session manager

      // Initialize provider version tracking
      this.providerVersions.set(targetWalletId, 1);

      if (targetWalletId) {
        this.updateModalStatus('connected', {
          walletId: targetWalletId,
          accounts: connection.accounts || [connection.address],
          chainId: String(connection.chain.chainId) || '',
          chainType: connection.chain.chainType || 'evm',
          address: connection.address,
        });
      }

      // Emit event
      // Connection added - state automatically updated via session manager

      // Record successful connection in health tracking
      const health = this.adapterHealth.get(targetWalletId);
      if (health) {
        health.lastSuccess = new Date();
        health.consecutiveFailures = 0; // Reset failure counter
      }
      this.logger?.debug('Connection successful, health tracking updated', {
        walletId: targetWalletId,
        healthStatus: health
          ? {
              errors: health.errors,
              consecutiveFailures: health.consecutiveFailures,
              lastSuccess: health.lastSuccess,
            }
          : 'no_previous_health_data',
      });

      // Convert session to WalletConnection format for compatibility
      return await this.sessionToWalletConnection(session);
    } catch (error) {
      // Invalidate adapter on connection error
      this.invalidateAdapter(
        targetWalletId,
        `connection_error: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Update modal state to error if modal is available
      if (targetWalletId) {
        this.updateModalStatus('error', { walletId: targetWalletId, error });
      }
      throw error;
    }
  }

  /**
   * Connects to a wallet by opening the modal and waiting for user selection.
   *
   * This is a convenience method that combines `openModal()` and `connect()` into a single call,
   * simplifying the most common wallet connection pattern. The modal is automatically opened,
   * and the method waits for the user to select and connect to a wallet.
   *
   * @param options - Optional connection options
   * @param options.chainType - Filter wallets by chain type (e.g., 'evm', 'solana')
   * @returns Promise resolving to the wallet connection
   * @throws {Error} If connection fails or is cancelled by user
   *
   * @example
   * ```typescript
   * // Simple connection with modal
   * const connection = await client.connectWithModal();
   *
   * // Filter to EVM wallets only
   * const connection = await client.connectWithModal({ chainType: ChainType.Evm });
   * ```
   *
   * @since 1.1.0
   * @public
   */
  async connectWithModal(options?: { chainType?: ChainType }): Promise<WalletConnection> {
    // Open modal with chain type filter if provided
    if (options?.chainType) {
      await this.openModal({ targetChainType: options.chainType });
    }

    // Connect without walletId - this will open modal if not already open
    // and wait for user selection
    return this.connect();
  }

  /**
   * Disconnect from a wallet and end its session.
   *
   * If no walletId is provided, disconnects all wallets.
   * Properly cleans up the adapter, ends the session, and updates state.
   *
   * @param walletId - Optional ID of wallet to disconnect. If omitted, disconnects all.
   * @returns Promise that resolves when disconnection is complete
   *
   * @example
   * ```typescript
   * // Disconnect specific wallet
   * await client.disconnect('metamask');
   *
   * // Disconnect all wallets
   * await client.disconnect();
   * ```
   *
   * @public
   */
  async disconnect(walletId?: string): Promise<void> {
    this.logger?.info('[WalletMeshClient] disconnect called', { walletId });

    if (!walletId) {
      // No walletId means disconnect all
      return this.disconnectAll();
    }

    const adapter = this.adapters.get(walletId);
    this.logger?.info('[WalletMeshClient] Adapter lookup', { found: !!adapter, walletId });

    // If adapter exists, disconnect it first
    if (adapter) {
      this.logger?.info('[WalletMeshClient] Calling adapter.disconnect()');
      await adapter.disconnect();
      // Clean up event listeners before deleting adapter
      this.cleanupAdapterHandlers(walletId);
      this.adapters.delete(walletId);
      this.logger?.info('[WalletMeshClient] Adapter disconnected and removed');
    } else {
      this.logger?.warn('No adapter found for wallet during disconnect - will still clean up sessions', {
        walletId,
      });
    }

    // End wallet sessions regardless of adapter existence
    // This is important for cases where sessions are restored from persistence
    // but the adapter hasn't been recreated yet
    const sessions = this.sessionManager.getWalletSessions(walletId);
    this.logger?.info('[WalletMeshClient] Found sessions to end', {
      count: sessions.length,
      sessionIds: sessions.map((s) => s.sessionId),
      walletId,
    });

    // Also check what's in the unified store directly
    const storeState = useStore.getState();
    const storeWalletSessions = Object.values(storeState.entities.sessions).filter(
      (s) => s.walletId === walletId,
    );
    this.logger?.info('[WalletMeshClient] Store wallet sessions', {
      count: storeWalletSessions.length,
      sessionIds: storeWalletSessions.map((s) => s.sessionId),
      walletId,
    });

    // Use the sessions from the store directly since SessionManager might be out of sync
    const sessionsToEnd = storeWalletSessions.length > 0 ? storeWalletSessions : sessions;

    // Fail all active transactions for these sessions before ending them
    const services = this.serviceRegistry.getServices();
    for (const session of sessionsToEnd) {
      services.transaction.failAllActiveTransactions(session.sessionId, 'Wallet disconnected');
    }

    for (const session of sessionsToEnd) {
      this.logger?.info('[WalletMeshClient] Ending session', { sessionId: session.sessionId });
      await connectionActions.endSession(useStore, session.sessionId, { isDisconnect: true });
    }
    this.logger?.info('[WalletMeshClient] All sessions ended', { endedCount: sessionsToEnd.length });

    // Provider cache is now managed through session manager

    // Connection removal is now managed through session manager

    // Clean up provider version tracking
    this.providerVersions.delete(walletId);

    // Clear health tracking for this wallet on disconnect
    if (this.adapterHealth.has(walletId)) {
      this.logger?.debug('Clearing health tracking for disconnected wallet', { walletId });
      this.adapterHealth.delete(walletId);
    }

    // Reset UI state to wallet selection if no sessions remain
    const remainingSessions = Object.keys(useStore.getState().entities.sessions);
    if (remainingSessions.length === 0) {
      const { uiActions } = await import('../../state/actions/ui.js');
      uiActions.setView(useStore, 'walletSelection');
    }

    this.withModalInternals((modal) => {
      modal.stores?.connection?.actions?.setDisconnected?.();
      modal.setView?.('walletSelection');
    });

    // Connection removed - state automatically updated via session manager
  }

  /**
   * Disconnect from all connected wallets.
   *
   * Convenience method that disconnects every active wallet connection.
   * Useful for logout functionality or cleanup.
   *
   * @returns Promise that resolves when all wallets are disconnected
   *
   * @example
   * ```typescript
   * // Logout user by disconnecting all wallets
   * await client.disconnectAll();
   * ```
   *
   * @public
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.adapters.keys()).map((walletId) => this.disconnect(walletId));
    await Promise.all(disconnectPromises);
  }

  /**
   * Switch the active chain for a wallet connection.
   *
   * Requests the wallet to switch to a different blockchain network.
   * For EVM chains, this may trigger wallet prompts to add the network
   * if not already configured.
   *
   * @param chainId - ID of the chain to switch to (e.g., '137' for Polygon)
   * @param walletId - Optional wallet ID. Uses active wallet if not specified.
   * @returns Promise with switch details including new provider
   * @throws {ModalError} If chain is not supported or switch fails
   *
   * @example
   * ```typescript
   * // Switch active wallet to Polygon
   * const result = await client.switchChain('137');
   * console.log(`Switched from ${result.previousChainId} to ${result.chainId}`);
   *
   * // Switch specific wallet to Ethereum
   * await client.switchChain('1', 'metamask');
   * ```
   *
   * @public
   */
  async switchChain(
    chainId: string,
    walletId?: string,
  ): Promise<{
    provider: unknown;
    chainType: ChainType;
    chainId: string;
    previousChainId: string;
  }> {
    this.logger?.debug('switchChain called', { chainId, walletId });

    // Use active wallet if not specified
    const targetWalletId = walletId || this.getActiveWallet();
    this.logger?.debug('Target wallet ID resolved', { targetWalletId });

    if (!targetWalletId) {
      throw ErrorFactory.configurationError('No wallet connected to switch chain');
    }

    const adapter = this.adapters.get(targetWalletId);
    if (!adapter) {
      throw ErrorFactory.walletNotFound(targetWalletId);
    }

    // Get active session for the wallet
    const sessions = this.sessionManager.getWalletSessions(targetWalletId);
    const activeSession = sessions.find((s) => s.status === 'connected');

    if (!activeSession) {
      throw ErrorFactory.connectionFailed('No active session for wallet');
    }

    const previousChainId = activeSession.chain.chainId;
    const chainType = this.getChainTypeFromId(chainId);

    this.logger?.debug('Chain switching details', {
      previousChainId,
      newChainId: chainId,
      chainType,
      currentChainType: activeSession.chain.chainType,
      isSameChain: previousChainId.toString() === chainId,
    });

    // If switching to the same chain, just return current state
    if (previousChainId.toString() === chainId) {
      this.logger?.info('Already on the requested chain', { chainId });
      // Get provider from registry (NOT from state, to avoid cross-origin errors)
      const currentProvider = getProviderForSession(activeSession.sessionId);
      return {
        provider: currentProvider,
        chainType: activeSession.chain.chainType,
        chainId,
        previousChainId: String(previousChainId),
      };
    }

    // Request chain connection for EVM chains
    // Get provider from registry (NOT from state, to avoid cross-origin errors)
    let provider: unknown = getProviderForSession(activeSession.sessionId);
    if (chainType === 'evm') {
      this.logger?.debug('Requesting new chain connection for EVM', { chainId });
      try {
        provider = await this.requestChainConnection(targetWalletId, String(chainId), chainType);
        this.logger?.debug('Provider returned from requestChainConnection', {
          provider: !!provider,
          chainType,
        });
        if (!provider) {
          // Use current provider if wallet doesn't support chain-specific providers
          provider = getProviderForSession(activeSession.sessionId);
          this.logger?.info('Wallet does not support chain-specific providers, using current provider', {
            chainId,
          });
        }
      } catch (error) {
        this.logger?.error('Failed to request chain connection', error);
        throw ErrorFactory.connectionFailed(`Failed to switch chain: ${(error as Error).message}`);
      }
    }

    // Switch chain using the session manager
    const chainConfig = this.getChainConfig(chainId);
    const chain: SupportedChain = chainConfig
      ? {
          chainId: chainConfig.chainId,
          chainType: chainConfig.chainType,
          name: chainConfig.name,
          required: chainConfig.required ?? false,
          ...(chainConfig.label && { label: chainConfig.label }),
          ...(chainConfig.interfaces && { interfaces: chainConfig.interfaces }),
          ...(chainConfig.group && { group: chainConfig.group }),
          ...(chainConfig.icon && { icon: chainConfig.icon }),
        }
      : {
          chainId,
          chainType,
          name: getChainName(chainId),
          required: false,
        };
    const newSession = await this.sessionManager.switchChain(activeSession.sessionId, chain);

    // Update provider version
    const currentVersion = this.providerVersions.get(targetWalletId) || 1;
    this.providerVersions.set(targetWalletId, currentVersion + 1);

    // Chain switching is now managed through session manager
    // State changes are automatically propagated through Zustand subscriptions

    // Get provider from registry (NOT from state, to avoid cross-origin errors)
    const newProvider = getProviderForSession(newSession.sessionId);
    return {
      provider: newProvider,
      chainType: newSession.chain.chainType,
      chainId,
      previousChainId: String(previousChainId),
    };
  }

  /**
   * Infers chain type from a chain ID.
   *
   * Uses heuristics to determine the blockchain type based on
   * the format and content of the chain ID.
   *
   * @param chainId - Chain ID to analyze
   * @returns Inferred chain type ('evm', 'solana', 'aztec', or 'unknown')
   * @private
   */
  private getChainTypeFromId(chainId: string): ChainType {
    // Simple heuristic - should be improved
    if (chainId.startsWith('0x') || !Number.isNaN(Number(chainId))) {
      return ChainType.Evm;
    }
    if (chainId.includes('mainnet') || chainId.includes('testnet') || chainId.includes('devnet')) {
      return ChainType.Solana;
    }
    if (chainId.includes('aztec')) {
      return ChainType.Aztec;
    }
    return ChainType.Evm; // Default to EVM
  }

  /**
   * Requests a wallet to connect to a specific chain.
   *
   * For EVM wallets, attempts to switch chains using wallet_switchEthereumChain.
   * For other chain types, relies on adapter-specific implementations.
   *
   * @param walletId - ID of the wallet
   * @param chainId - Target chain ID
   * @param chainType - Type of blockchain
   * @returns Provider instance for the chain, or null if not supported
   * @private
   * @throws {Error} If chain is not configured in wallet (code 4902)
   */
  private async requestChainConnection(
    walletId: string,
    chainId: string,
    chainType: string,
  ): Promise<unknown> {
    this.logger?.debug('requestChainConnection called', { walletId, chainId, chainType });

    // Get session for this wallet instead of using adapter.connection
    const session = this.getSessionByWalletId(walletId);
    if (!session) {
      this.logger?.debug('No active session found for wallet', { walletId });
      return null;
    }

    const provider = session.provider?.instance as {
      request?: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    if (!provider) {
      this.logger?.debug('No provider found in session', { walletId, sessionId: session.sessionId });
      return null;
    }

    if (chainType === 'evm' && provider.request) {
      this.logger?.debug('Attempting EVM chain switch', { chainId });
      // For EVM, try to switch/add chain
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
        this.logger?.debug('EVM chain switch successful', { chainId });
      } catch (switchError) {
        // Check for session errors and store them
        handleProviderError(switchError, session.sessionId);

        // Chain not added, try to add it
        const error = switchError as { code?: number };
        if (error.code === 4902) {
          // This would need chain params in real implementation
          throw ErrorFactory.configurationError('Chain not configured in wallet', { errorCode: 4902 });
        }
        throw switchError;
      }
      return provider; // Same provider instance for EVM
    }

    this.logger?.debug('Non-EVM chain type, returning null', { chainType });
    // For other chain types, would need adapter-specific implementation
    // This is where adapters would implement cross-chain support
    return null;
  }

  /**
   * Gets the provider version for change detection.
   *
   * Provider versions increment when the provider instance changes
   * (e.g., after chain switches). Useful for detecting when to
   * refresh provider-dependent operations.
   *
   * @param walletId - ID of the wallet
   * @returns Version number, or 0 if wallet not found
   *
   * @internal
   */
  getProviderVersion(walletId: string): number {
    return this.providerVersions.get(walletId) || 0;
  }

  /**
   * Gets a specific wallet adapter by ID.
   *
   * @param walletId - ID of the wallet to retrieve
   * @returns The wallet adapter if connected, undefined otherwise
   * @public
   */
  getConnection(walletId: string): WalletAdapter | undefined {
    return this.adapters.get(walletId);
  }

  /**
   * Gets all connected wallet adapters.
   *
   * @returns Array of all currently connected wallet adapters
   * @public
   */
  getConnections(): WalletAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Gets all wallet connections with full connection details.
   *
   * @returns Array of wallet connection objects containing addresses, chains, etc.
   * @public
   */
  getAllConnections(): WalletConnection[] {
    // Get all connected sessions from state instead of adapter.connection
    const state = useStore.getState();
    const connectedSessions = Object.values(state.entities.sessions).filter((s) => s.status === 'connected');

    // Convert sessions to WalletConnection format
    return connectedSessions.map((session): WalletConnection => {
      // Get provider from registry (NOT from state, to avoid cross-origin errors)
      const provider = getProviderForSession(session.sessionId);
      return {
        walletId: session.walletId,
        address: session.activeAccount.address,
        accounts: session.accounts.map((a) => a.address),
        chain: {
          chainId: session.chain.chainId,
          chainType: session.chain.chainType,
          name: session.chain.name,
          required: session.chain.required,
        },
        chainType: session.chain.chainType,
        provider: provider as WalletProvider,
        walletInfo: {
          id: session.walletId,
          name: session.metadata.wallet.name,
          icon: session.metadata.wallet.icon,
          chains: [session.chain.chainType],
        },
      };
    });
  }

  /**
   * Discovers available wallets in the current environment.
   *
   * This method performs dynamic wallet discovery by:
   * 1. Using the unified discovery service with reset capability for fresh discovery
   * 2. Optionally filtering for specific chain types
   * 3. Combining results from multiple discovery protocols
   *
   * The discovery service is reset before each discovery to ensure fresh results
   * and can be reconfigured for different chain types throughout the dApp's lifecycle.
   *
   * @param options - Discovery options with optional chain type filtering
   *
   * @returns Promise resolving to array of available wallets
   *
   * @example
   * ```typescript
   * // Discover all wallets
   * const allWallets = await client.discoverWallets();
   *
   * // Discover only EVM wallets
   * const evmWallets = await client.discoverWallets({ chainTypes: ['evm'] });
   *
   * // Discover Solana and Aztec wallets
   * const multiChain = await client.discoverWallets({
   *   chainTypes: ['solana', 'aztec']
   * });
   * ```
   *
   * @public
   */
  async discoverWallets(options?: { chainTypes?: ChainType[] }): Promise<any[]> {
    const caller = this.getInvocationCaller();
    this.logger?.debug('WalletMeshClient.discoverWallets invoked', { caller });
    this.logger?.debug('Starting wallet discovery', { options });

    // Use discovery service if available for cross-origin discovery
    if (this.discoveryService) {
      try {
        this.logger?.debug('Using unified discovery service for wallet discovery');

        const chainTypes = options?.chainTypes || this.extractChainTypesFromConfig();
        const shouldOverrideChains = Boolean(options?.chainTypes && options.chainTypes.length > 0);

        const overrideTechnologies = shouldOverrideChains
          ? this.mapChainTypesToTechnologies(options?.chainTypes!)
          : undefined;

        const scanConfig = shouldOverrideChains
          ? {
              supportedChainTypes: [...options?.chainTypes!],
              ...(overrideTechnologies ? { technologies: overrideTechnologies } : {}),
            }
          : undefined;

        const discoveryResults = await this.discoveryService.scan(scanConfig);

        this.logger?.debug('Discovery service completed', {
          foundWallets: discoveryResults.length,
          chainTypes,
        });

        // Convert discovery results to AvailableWallet format
        const discoveredAsAvailable: AvailableWallet[] = discoveryResults.map((result) => {
          const canonicalId = this.resolveCanonicalWalletId(result.wallet);
          const responderId = result.wallet.responderId;
          const discoveredInfo =
            this.registry.getDiscoveredWallet(canonicalId) || this.registry.getDiscoveredWallet(responderId);
          const customMetadata =
            (discoveredInfo?.metadata as Record<string, unknown> | undefined) ||
            (result.wallet.metadata as Record<string, unknown> | undefined) ||
            {};

          return {
            adapter: {
              id: canonicalId,
              metadata: {
                name: result.wallet.name || 'Unknown Wallet',
                icon: result.wallet.icon || '',
                description: `Discovered ${result.wallet.name || 'wallet'} via discovery protocol`,
                homepage: '',
              },
              capabilities: {
                chains: this.extractChainCapabilities(result.wallet),
                features: new Set(['sign_message', 'sign_typed_data', 'multi_account']),
              },

              // These methods won't be called on discovered wallets since adapters are created on-demand
              detect: async () => ({ available: true }),
              connect: async () => {
                throw new Error('Should not be called - use client.connect() instead');
              },
              disconnect: async () => {
                throw new Error('Should not be called - use client.disconnect() instead');
              },
            } as unknown as WalletAdapter,
            available: true,
            customData: {
              discoveryMethod: 'discovery-protocol',
              responderId,
              metadata: customMetadata,
            },
          };
        });

        return discoveredAsAvailable;
      } catch (error) {
        this.logger?.error('Discovery service failed, falling back to registry-based discovery', error);
        // Fall through to fallback discovery
      }
    }

    // Fallback: use registry-based discovery
    this.logger?.debug('Using registry-based discovery (fallback)');

    await this.runBrowserDiscovery(options?.chainTypes);

    // Get adapters that are already registered
    const availableAdapters = await this.registry.detectAvailableAdapters();

    // Get discovered wallets (e.g., from EIP-6963 discovery)
    const discoveredWallets = this.registry.getAllDiscoveredWallets();

    // Convert discovered wallets to AvailableWallet format
    const discoveredAsAvailable: AvailableWallet[] = discoveredWallets.map((wallet) => ({
      adapter: {
        id: wallet.id,
        metadata: {
          name: wallet.name,
          icon: wallet.icon,
          description: `Discovered ${wallet.name} wallet`,
          homepage: '',
        },
        capabilities: {
          chains: [
            {
              type: ChainType.Evm,
              chainIds: '*',
            },
          ],
          features: new Set(['sign_message', 'sign_typed_data', 'multi_account']),
        },
        // These methods won't be called on discovered wallets since adapters are created on-demand
        detect: async () => ({ available: true }),
        connect: async () => {
          throw new Error('Should not be called - use client.connect() instead');
        },
        disconnect: async () => {
          throw new Error('Should not be called - use client.disconnect() instead');
        },
      } as unknown as WalletAdapter,
      available: true,
      customData: {
        discoveryMethod: wallet.discoveryMethod,
        metadata: wallet.metadata,
      },
    }));

    // Combine both lists, avoiding duplicates
    const combinedWallets = [...availableAdapters];
    const existingIds = new Set(availableAdapters.map((w) => w.adapter.id));

    for (const discovered of discoveredAsAvailable) {
      if (!existingIds.has(discovered.adapter.id)) {
        combinedWallets.push(discovered);
      }
    }

    this.logger?.debug('Fallback discovery completed', {
      registered: availableAdapters.length,
      discovered: discoveredWallets.length,
      total: combinedWallets.length,
    });

    return combinedWallets;
  }

  /**
   * Extract chain capabilities from qualified responder
   * @private
   */
  private extractChainCapabilities(
    wallet: import('@walletmesh/discovery').QualifiedResponder,
  ): Array<{ type: ChainType; chainIds: string | string[] }> {
    try {
      if (wallet.matched?.required?.technologies) {
        return wallet.matched.required.technologies.map((tech: any) => ({
          type: tech.type as ChainType,
          chainIds: '*', // Discovery protocol doesn't provide specific chain IDs
        }));
      }
      // Fallback for wallets without technology info
      return [{ type: ChainType.Evm, chainIds: '*' }];
    } catch (error) {
      this.logger?.warn('Failed to extract chain capabilities from qualified responder', {
        walletId: wallet.responderId,
        error,
      });
      return [{ type: ChainType.Evm, chainIds: '*' }];
    }
  }

  /**
   * Gets a wallet adapter from the registry by ID.
   *
   * Unlike `getConnection`, this returns the adapter even if not connected.
   *
   * @param walletId - ID of the wallet to retrieve
   * @returns The wallet adapter if registered, undefined otherwise
   * @public
   */
  getWallet(walletId: string): WalletAdapter | undefined {
    return this.registry.getAdapter(walletId);
  }

  /**
   * Gets all registered wallet adapters.
   *
   * @returns Array of all wallet adapters in the registry
   * @public
   */
  getAllWallets(): WalletAdapter[] {
    return this.registry.getAllAdapters();
  }

  /**
   * Open the wallet selection modal.
   *
   * Shows the modal UI for users to select and connect wallets.
   * Triggers wallet discovery before opening the modal to ensure
   * wallets are available when the modal is displayed.
   *
   * @param options - Optional configuration including targetChainType for contextual discovery
   * @returns Promise that resolves when discovery completes and modal is opened
   *
   * @example
   * ```typescript
   * // Open modal for wallet selection
   * await client.openModal();
   *
   * // Open modal for specific chain type
   * await client.openModal({ targetChainType: ChainType.Aztec });
   * ```
   *
   * @public
   */
  async openModal(options?: { targetChainType?: ChainType }): Promise<void> {
    // Trigger wallet discovery before opening modal
    // This ensures wallets are discovered based on the target chain type
    this.logger?.debug('Opening modal, starting discovery', {
      targetChainType: options?.targetChainType,
    });

    try {
      // Build discovery options - only include chainTypes if targetChainType is specified
      const discoveryOptions = options?.targetChainType ? { chainTypes: [options.targetChainType] } : {};

      await this.discoverWallets(discoveryOptions);
      this.logger?.debug('Discovery completed, opening modal UI');
    } catch (error) {
      // Log discovery error but still open modal
      // Wallet discovery errors shouldn't prevent modal from opening
      this.logger?.warn('Discovery failed, opening modal anyway', { error });
    }

    // Open modal UI
    if (this.modal) {
      this.modal.open(options);
    }
  }

  /**
   * Close the wallet selection modal.
   *
   * Immediately closes the modal if it's currently open.
   *
   * @example
   * ```typescript
   * // Close modal programmatically
   * client.closeModal();
   * ```
   *
   * @public
   */
  closeModal(): void {
    if (this.modal && !this.isClosingModal) {
      this.isClosingModal = true;
      try {
        this.modal.close();
      } finally {
        // Reset flag after a short delay to prevent immediate re-entry
        setTimeout(() => {
          this.isClosingModal = false;
        }, 100);
      }
    }
  }

  /**
   * Checks if any wallet is currently connected.
   *
   * @returns true if at least one wallet is connected, false otherwise
   * @readonly
   * @public
   */
  get isConnected(): boolean {
    return this.getAllConnections().length > 0;
  }

  /**
   * Sets the active wallet for operations.
   *
   * When multiple wallets are connected, this designates which wallet
   * should be used for operations when no specific wallet is specified.
   *
   * @param walletId - ID of the wallet to make active
   * @throws {Error} If wallet is not connected
   * @public
   */
  setActiveWallet(walletId: string): void {
    // Active wallet is now managed through session manager
    const sessions = this.sessionManager.getWalletSessions(walletId);
    if (sessions.length > 0) {
      if (sessions[0]?.sessionId) {
        connectionActions.switchToSession(useStore, sessions[0].sessionId);
      }
    }
  }

  /**
   * Gets the currently active wallet ID.
   *
   * @returns The active wallet ID or null if no wallet is active
   * @public
   */
  getActiveWallet(): string | null {
    const state = useStore.getState();
    const activeSessionId = state.active.sessionId;
    if (!activeSessionId) return null;

    const activeSession = this.sessionManager.getSession(activeSessionId);
    return activeSession?.walletId || null;
  }

  /**
   * Gets the maximum number of concurrent wallet connections allowed.
   *
   * @returns Maximum connection limit (default: 5)
   * @public
   */
  getMaxConnections(): number {
    // Max connections is managed internally
    return 5; // Default value
  }

  /**
   * Get the current headless modal state.
   *
   * Returns a snapshot of the current state including connection
   * status, available wallets, and UI state.
   *
   * @returns Current headless modal state
   *
   * @example
   * ```typescript
   * const state = client.getState();
   * console.log('Connection state:', state.connection.state);
   * console.log('Is modal open:', state.isOpen);
   * ```
   *
   * @public
   */
  getState(): HeadlessModalState {
    if (!this.modal) {
      // Return minimal safe headless state if modal not ready
      return {
        connection: {
          state: 'idle',
        },
        wallets: [],
        isOpen: false,
      };
    }
    return this.modal.getState();
  }

  /**
   * Subscribe to state changes.
   *
   * Provides a reactive way to observe all state changes in the client.
   * The callback is called immediately with the current state and then
   * whenever the state changes.
   *
   * @param callback - Function called with new state on each change
   * @returns Unsubscribe function to stop listening
   *
   * @example
   * ```typescript
   * const unsubscribe = client.subscribe((state) => {
   *   console.log('State changed:', state.connection.state);
   *
   *   if (state.connection.state === 'connected') {
   *     console.log('Wallet connected!');
   *   }
   * });
   *
   * // Later: stop listening
   * unsubscribe();
   * ```
   *
   * @public
   */
  subscribe(callback: (state: HeadlessModalState) => void): () => void {
    if (!this.modal) {
      return () => {}; // Return no-op unsubscribe function if modal not ready
    }
    return this.modal.subscribe(callback);
  }

  // Event methods have been removed - use subscribe() for state changes instead

  /**
   * Get headless modal actions for programmatic control.
   *
   * Provides low-level actions for controlling the modal and connections
   * without UI. Useful for custom integrations.
   *
   * @returns Object with headless action methods
   *
   * @example
   * ```typescript
   * const actions = client.getActions();
   *
   * // Programmatically select a wallet
   * await actions.selectWallet('metamask');
   *
   * // Retry failed connection
   * await actions.retry();
   * ```
   *
   * @public
   */
  getActions(): import('../../api/core/headless.js').HeadlessModalActions {
    if (!this.modal) {
      // Return safe no-op actions if modal not ready
      return {
        openModal: () => {},
        closeModal: () => {},
        selectWallet: async () => {},
        connect: async () => {},
        disconnect: async () => {},
        retry: async () => {},
      };
    }
    return this.modal.getActions();
  }

  /**
   * Destroy the client and clean up all resources.
   *
   * Disconnects all wallets, stops discovery services, clears caches,
   * and releases all resources. Call this when disposing of the client
   * (e.g., on app unmount).
   *
   * @example
   * ```typescript
   * // Clean up on app unmount
   * useEffect(() => {
   *   return () => {
   *     client.destroy();
   *   };
   * }, []);
   * ```
   *
   * @public
   */
  destroy(): void {
    // Disconnect all wallets
    this.disconnectAll();

    // Clean up discovery service
    if (this.discoveryService) {
      this.discoveryService.destroy?.().catch((error: unknown) => {
        this.logger?.error('Failed to destroy discovery service', error);
      });
      this.discoveryService = undefined;
    }

    // Clean up modal subscription
    if (this.modalUnsubscribe) {
      this.modalUnsubscribe();
      this.modalUnsubscribe = undefined;
    }

    // Clean up all adapter event listeners
    for (const walletId of Array.from(this.adapterEventListeners.keys())) {
      this.cleanupAdapterHandlers(walletId);
    }

    // Clear provider loader cache
    this.providerLoader.clearCache();

    // Clean up modal
    this.modal?.cleanup();

    // Clear registry
    this.registry.clear();

    // Dispose service registry
    this.serviceRegistry.dispose().catch((error) => {
      this.logger?.error('Error disposing service registry', error);
    });

    this.initialized = false;
  }

  // ===================
  // Service Access API
  // ===================

  /**
   * Get the chain service for blockchain network operations.
   *
   * The chain service provides high-level methods for:
   * - Querying supported chains
   * - Validating chain configurations
   * - Managing chain metadata
   * - Checking chain compatibility
   *
   * @returns {ChainService} Service instance for chain-related operations
   * @throws {ModalError} If client is not initialized
   *
   * @example
   * ```typescript
   * const chainService = client.getChainService();
   *
   * // Get all supported chains
   * const chains = await chainService.getSupportedChains();
   *
   * // Validate chain configuration
   * const isValid = await chainService.validateChain('137');
   * ```
   *
   * @public
   * @since 1.0.0
   */
  getChainService(): ChainService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices().chain;
  }

  /**
   * Get the connection service for wallet connection operations.
   *
   * The connection service provides high-level methods for:
   * - Managing wallet connections
   * - Monitoring connection health
   * - Handling reconnection logic
   * - Connection persistence
   *
   * @returns {ConnectionService} Service instance for connection management
   * @throws {ModalError} If client is not initialized
   *
   * @example
   * ```typescript
   * const connectionService = client.getConnectionService();
   *
   * // Check connection health
   * const health = await connectionService.checkHealth('metamask');
   *
   * // Enable auto-reconnect
   * await connectionService.enableAutoReconnect();
   * ```
   *
   * @public
   * @since 1.0.0
   */
  getConnectionService(): ConnectionService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices().connection;
  }

  /**
   * Get the transaction service for blockchain transaction operations.
   *
   * The transaction service provides high-level methods for:
   * - Sending transactions
   * - Estimating gas fees
   * - Tracking transaction status
   * - Transaction history
   *
   * @returns {TransactionService} Service instance for transaction operations
   * @throws {ModalError} If client is not initialized
   *
   * @example
   * ```typescript
   * const txService = client.getTransactionService();
   *
   * // Send a transaction
   * const txHash = await txService.sendTransaction({
   *   to: '0x...',
   *   value: '1000000000000000000',
   *   data: '0x'
   * });
   *
   * // Track transaction status
   * const status = await txService.getTransactionStatus(txHash);
   * ```
   *
   * @public
   * @since 1.0.0
   */
  getTransactionService(): TransactionService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices().transaction;
  }

  /**
   * Get the balance service for querying wallet balances.
   *
   * The balance service provides high-level methods for:
   * - Fetching native token balances
   * - Querying ERC20/SPL token balances
   * - Multi-token balance queries
   * - Balance change subscriptions
   *
   * @returns {BalanceService} Service instance for balance operations
   * @throws {ModalError} If client is not initialized
   *
   * @example
   * ```typescript
   * const balanceService = client.getBalanceService();
   *
   * // Get native balance
   * const balance = await balanceService.getNativeBalance('0x...');
   *
   * // Get token balances
   * const tokens = await balanceService.getTokenBalances(
   *   '0x...',
   *   ['0xUSDC...', '0xDAI...']
   * );
   * ```
   *
   * @public
   * @since 1.0.0
   */
  getBalanceService(): BalanceService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices().balance;
  }

  /**
   * Get the preference service for managing user preferences.
   *
   * The preference service provides high-level methods for:
   * - Storing wallet preferences
   * - Managing connection history
   * - Remembering user choices
   * - Auto-connect settings
   *
   * @returns {WalletPreferenceService} Service instance for preference management
   * @throws {ModalError} If client is not initialized
   *
   * @example
   * ```typescript
   * const prefService = client.getPreferenceService();
   *
   * // Set preferred wallet
   * await prefService.setPreferredWallet('metamask');
   *
   * // Get connection history
   * const history = await prefService.getConnectionHistory();
   *
   * // Enable auto-connect
   * await prefService.setAutoConnect(true);
   * ```
   *
   * @public
   * @since 1.0.0
   */
  getPreferenceService(): ConnectionService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices().connection;
  }

  /**
   * Get all services in a single object for convenience.
   *
   * Returns an object containing all available business logic services.
   * Useful when you need multiple services or want to explore available
   * functionality.
   *
   * @returns Object containing all service instances
   * @throws {ModalError} If client is not initialized
   *
   * @example
   * ```typescript
   * const services = client.getServices();
   *
   * // Use multiple services
   * const balance = await services.balance.getNativeBalance('0x...');
   * const chains = await services.chain.getSupportedChains();
   * const health = await services.connection.checkHealth();
   * ```
   *
   * @public
   * @since 1.0.0
   */
  getServices() {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing services');
    }
    return this.serviceRegistry.getServices();
  }

  /**
   * Get the QueryManager for managing data fetching and caching.
   *
   * The QueryManager provides TanStack Query Core functionality for:
   * - Efficient data fetching with automatic deduplication
   * - Smart caching with configurable TTL
   * - Background refetching and invalidation
   * - Framework-agnostic query client
   *
   * @returns {QueryManager} Query manager instance
   * @throws {ModalError} If client is not initialized
   *
   * @example
   * ```typescript
   * const queryManager = client.getQueryManager();
   * const queryClient = queryManager.getQueryClient();
   *
   * // Invalidate balance queries
   * await queryClient.invalidateQueries({
   *   queryKey: ['walletmesh', 'balance']
   * });
   * ```
   *
   * @public
   * @since 2.0.0
   */
  getQueryManager() {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing QueryManager');
    }
    return this.serviceRegistry.getQueryManager();
  }

  /**
   * Get the dApp RPC service for direct blockchain node communication.
   *
   * The dApp RPC service allows your application to make direct RPC calls
   * to blockchain nodes using your own infrastructure, separate from the
   * wallet's RPC endpoints. This is useful for:
   *
   * - Reading blockchain data without wallet interaction
   * - Verifying transaction status
   * - Querying contract state
   * - Gas estimation
   *
   * @returns Service instance for RPC operations
   * @throws {ModalError} If client is not initialized
   *
   * @example
   * ```typescript
   * const rpcService = client.getDAppRpcService();
   *
   * // Get current block number
   * const blockNumber = await rpcService.call('1', 'eth_blockNumber');
   *
   * // Check account balance
   * const balance = await rpcService.call('1', 'eth_getBalance', [
   *   '0x742d35Cc6634C0532925a3b844Bc9e7595f6E3D2',
   *   'latest'
   * ]);
   *
   * // Call smart contract method
   * const result = await rpcService.call('1', 'eth_call', [{
   *   to: '0xContractAddress',
   *   data: '0xMethodSelector'
   * }]);
   *
   * // Test connectivity to all endpoints
   * const connectivity = await rpcService.testConnectivity();
   * console.log('RPC endpoints status:', connectivity);
   * ```
   *
   * @remarks
   * Configure RPC endpoints in your chain configuration using the
   * `dappRpcUrls` property.
   *
   * @public
   * @since 1.0.0
   */
  getDAppRpcService(): DAppRpcService {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('Client must be initialized before accessing dApp RPC service');
    }
    return this.dappRpcIntegration.getDAppRpcService();
  }

  /**
   * Sets up event handlers for modal state changes.
   *
   * Establishes bidirectional communication between the client and modal,
   * tracking state changes and user interactions.
   *
   * @private
   */
  private setupModalHandlers(): void {
    // Guard against null modal during construction
    if (!this.modal) {
      return;
    }

    // Forward modal state changes to client event system so React hooks can receive them
    // This is crucial for the event system to work properly
    // Note: Modal now uses state subscriptions instead of events

    // Track previous state to emit change events
    let previousState = this.modal.getState();

    // Clean up any existing subscription first
    if (this.modalUnsubscribe) {
      this.modalUnsubscribe();
      this.modalUnsubscribe = undefined;
    }

    this.modalUnsubscribe = this.modal.subscribe((state) => {
      // State changes are now propagated through Zustand subscriptions
      // Consumers should use subscribe() to listen for state changes

      if (previousState.connection.state !== state.connection.state) {
        if (state.connection.state === 'connecting') {
          // Connection state is tracking through modal state
        } else if (state.connection.state === 'connected') {
          this.logger?.debug('Connection established');
          // Modal successfully connected, but we handle connection through our own flow
          // This is mainly for cleanup
          this.closeModal();
        }
      }

      previousState = state;
    });
  }

  /**
   * Initializes modal handlers after modal creation.
   *
   * Called by createWalletMesh after the modal is created to establish
   * proper event handling. This two-phase initialization avoids circular
   * dependencies during construction.
   *
   * @public
   * @internal
   */
  public initializeModalHandlers(): void {
    this.setupModalHandlers();
  }

  /**
   * Sets up event handlers for a wallet adapter.
   *
   * Listens to adapter events and updates client state accordingly.
   * Handles connection changes, account changes, and chain switches.
   *
   * @param walletId - ID of the wallet
   * @param adapter - The wallet adapter instance
   * @private
   */
  private setupAdapterHandlers(walletId: string, adapter: WalletAdapter): void {
    // Handle simplified blockchain events from adapters
    // Adapters now emit simple blockchain events, WalletMeshClient handles all state updates

    // Clean up any existing listeners for this wallet first
    this.cleanupAdapterHandlers(walletId);

    // Track all event listeners for cleanup
    const listeners: Array<{ event: string; listener: (...args: unknown[]) => void }> = [];

    const connectionEstablishedListener = () => {
      // Connection added - state automatically updated via session manager
    };
    adapter.on('connection:established', connectionEstablishedListener);
    listeners.push({ event: 'connection:established', listener: connectionEstablishedListener });

    const connectionLostListener = () => {
      this.adapters.delete(walletId);
      // Connection removed - state automatically updated via session manager
    };
    adapter.on('connection:lost', connectionLostListener);
    listeners.push({ event: 'connection:lost', listener: connectionLostListener });

    // NEW: Handle simplified blockchain events and update state automatically
    const accountsChangedListener = async (data: unknown) => {
      const { accounts, chainType } = data as { accounts: string[]; chainType?: string };
      await this.handleAccountsChanged(walletId, accounts, (chainType || 'evm') as ChainType);
    };
    adapter.on('wallet:accountsChanged', accountsChangedListener);
    listeners.push({ event: 'wallet:accountsChanged', listener: accountsChangedListener });

    const chainChangedListener = async (data: unknown) => {
      const { chainId, chainType } = data as { chainId: string; chainType?: string };
      await this.handleChainChanged(walletId, chainId, (chainType || 'evm') as ChainType);
    };
    adapter.on('wallet:chainChanged', chainChangedListener);
    listeners.push({ event: 'wallet:chainChanged', listener: chainChangedListener });

    const connectedListener = async () => {
      // Connection handled through session manager
      this.logger?.debug('Wallet connected event handled', { walletId });
    };
    adapter.on('wallet:connected', connectedListener);
    listeners.push({ event: 'wallet:connected', listener: connectedListener });

    const disconnectedListener = async (data: unknown) => {
      const { reason } = data as { reason?: string };
      await this.handleWalletDisconnected(walletId, reason);
    };
    adapter.on('wallet:disconnected', disconnectedListener);
    listeners.push({ event: 'wallet:disconnected', listener: disconnectedListener });

    // Listen for session termination from wallet
    const sessionTerminatedListener = async (data: unknown) => {
      const { sessionId, reason } = data as { sessionId: string; reason?: string };

      console.log('[WalletMeshClient] 🚨 Session terminated event received', {
        walletId,
        sessionId,
        reason,
        timestamp: new Date().toISOString(),
      });

      this.logger?.info('Session terminated by wallet', { walletId, sessionId, reason });

      // Find and remove the session from the store
      const store = useStore.getState();
      const sessionToRemove = Object.values(store.entities.sessions).find((s) => s.sessionId === sessionId);

      if (sessionToRemove) {
        console.log('[WalletMeshClient] ✅ Found session to remove', {
          sessionId,
          walletId: sessionToRemove.walletId,
        });

        this.logger?.debug('Removing terminated session from store', { sessionId });

        // Delete session from store using setState
        useStore.setState((state) => {
          console.log('[WalletMeshClient] 🔄 Updating Zustand store - removing session', { sessionId });

          const newSessions = { ...state.entities.sessions };
          delete newSessions[sessionId];

          const newState = {
            entities: {
              ...state.entities,
              sessions: newSessions,
            },
            ui: {
              ...state.ui,
              currentView: 'wallet-selection' as const,
              isLoading: false,
              errors: {
                ...state.ui.errors,
                session: {
                  code: 'session_terminated',
                  message: 'Your wallet connection was closed. Please reconnect to continue.',
                  category: 'connection' as const,
                  fatal: false,
                  data: {
                    reason: reason || 'Session revoked by wallet',
                    sessionId,
                    walletId,
                  },
                },
              },
            },
            active: {
              ...state.active,
              sessionId: state.active.sessionId === sessionId ? null : state.active.sessionId,
              walletId: state.active.walletId === walletId ? null : state.active.walletId,
            },
          };

          console.log('[WalletMeshClient] ✅ Store update complete', {
            remainingSessions: Object.keys(newState.entities.sessions).length,
            hasError: !!newState.ui.errors.session,
          });

          return newState;
        });

        console.log('[WalletMeshClient] ✅ Session termination handled successfully');
      } else {
        console.warn('[WalletMeshClient] ⚠️ Session not found for termination', {
          sessionId,
          availableSessions: Object.keys(store.entities.sessions),
        });

        this.logger?.warn('Session not found for termination', { sessionId });
      }
    };
    adapter.on('wallet:sessionTerminated', sessionTerminatedListener);
    listeners.push({ event: 'wallet:sessionTerminated', listener: sessionTerminatedListener });

    // Store listeners for cleanup
    this.adapterEventListeners.set(walletId, listeners);

    // DEPRECATED: Legacy event handling removed
    // State changes are now propagated through Zustand subscriptions
  }

  /**
   * Cleans up event listeners for a specific wallet adapter.
   *
   * Removes all event listeners that were added by setupAdapterHandlers
   * to prevent memory leaks when adapters are disconnected or destroyed.
   *
   * @param walletId - ID of the wallet to cleanup
   * @private
   */
  private cleanupAdapterHandlers(walletId: string): void {
    const listeners = this.adapterEventListeners.get(walletId);
    if (!listeners) {
      return;
    }

    const adapter = this.adapters.get(walletId);
    if (adapter) {
      // Remove all tracked event listeners
      for (const { event, listener } of listeners) {
        // Check if adapter has off method (defensive for mocks and edge cases)
        const adapterWithOff = adapter as {
          off?: (event: string, listener: (...args: unknown[]) => void) => void;
        };
        if (typeof adapterWithOff.off === 'function') {
          adapterWithOff.off(event, listener);
        }
      }
    }

    // Clear the tracked listeners
    this.adapterEventListeners.delete(walletId);
  }

  /**
   * Handles accounts changed event from wallet adapter.
   *
   * Updates session state when wallet accounts change (e.g., user switches
   * accounts in wallet or locks wallet). Handles both account switches
   * and disconnections (empty accounts array).
   *
   * @param walletId - ID of the wallet that changed accounts
   * @param accounts - New array of account addresses
   * @param _chainType - Optional chain type (currently unused)
   * @private
   * @throws May throw if session update fails
   */
  private async handleAccountsChanged(
    walletId: string,
    accounts: string[],
    _chainType?: ChainType,
  ): Promise<void> {
    try {
      const sessions = this.sessionManager.getWalletSessions(walletId);
      const activeSession = sessions.find((s) => s.status === 'connected');

      if (!activeSession) {
        this.logger?.debug('No active session found for wallet during accounts change', { walletId });
        return;
      }

      // Update session with new accounts
      if (accounts.length === 0) {
        // No accounts means disconnection
        await connectionActions.endSession(useStore, activeSession.sessionId, { isDisconnect: true });
        // Connection removed - state automatically updated via session manager
      } else {
        // Update session accounts by recreating the session with new accounts
        // First, end the current session (not a disconnect, just session update)
        await this.sessionManager.endSession(activeSession.sessionId);

        // Get provider from registry (NOT from state, to avoid cross-origin errors)
        const provider = getProviderForSession(activeSession.sessionId);

        if (!provider) {
          this.logger?.error('Provider not found in registry for session update', {
            sessionId: activeSession.sessionId,
          });
          throw ErrorFactory.connectionFailed('Provider not found for session update');
        }

        // Create a new session with updated accounts
        const sessionParams = {
          walletId: activeSession.walletId,
          accounts: accounts.map((address, index) => ({
            address,
            index,
            derivationPath: `m/44'/60'/0'/0/${index}`,
            isActive: index === 0,
          })),
          activeAccountIndex: 0,
          chain: activeSession.chain,
          provider,
          providerMetadata: {
            type: activeSession.provider.type,
            version: activeSession.provider.version,
            multiChainCapable: activeSession.provider.multiChainCapable,
            supportedMethods: activeSession.provider.supportedMethods,
          },
          permissions: activeSession.permissions,
          metadata: activeSession.metadata,
        };

        await connectionActions.createSession(useStore, sessionParams);

        // State updated - changes automatically propagated through Zustand subscriptions
        // No need to update adapter.connection - session state is the source of truth
      }
    } catch (error) {
      this.logger?.error('Failed to handle accounts changed', { walletId, accounts, error });
    }
  }

  /**
   * Handles chain changed event from wallet adapter.
   *
   * Updates session state when wallet switches to a different blockchain
   * network. Maintains provider references and updates connection state.
   *
   * @param walletId - ID of the wallet that changed chains
   * @param chainId - New chain ID
   * @param chainType - Optional chain type for validation
   * @private
   * @throws May throw if chain switch fails
   */
  private async handleChainChanged(walletId: string, chainId: string, chainType?: ChainType): Promise<void> {
    try {
      const sessions = this.sessionManager.getWalletSessions(walletId);
      const activeSession = sessions.find((s) => s.status === 'connected');

      if (!activeSession) {
        this.logger?.debug('No active session found for wallet during chain change', { walletId });
        return;
      }

      // Switch chain in session manager
      const chainConfig = this.getChainConfig(chainId);
      const chain: SupportedChain = chainConfig
        ? {
            chainId: chainConfig.chainId,
            chainType: chainConfig.chainType,
            name: chainConfig.name,
            required: chainConfig.required ?? false,
            ...(chainConfig.label && { label: chainConfig.label }),
            ...(chainConfig.interfaces && { interfaces: chainConfig.interfaces }),
            ...(chainConfig.group && { group: chainConfig.group }),
            ...(chainConfig.icon && { icon: chainConfig.icon }),
          }
        : {
            chainId,
            chainType: chainType || this.getChainTypeFromId(chainId),
            name: getChainName(chainId),
            required: false,
          };
      await this.sessionManager.switchChain(activeSession.sessionId, chain);

      // State updated - chain switch automatically propagated through Zustand subscriptions
      // No need to update adapter.connection - session state is the source of truth
    } catch (error) {
      this.logger?.error('Failed to handle chain changed', { walletId, chainId, error });
    }
  }

  /**
   * Handles wallet disconnected event from adapter.
   *
   * Cleans up all resources associated with the disconnected wallet,
   * including ending sessions, removing adapters, and clearing caches.
   *
   * @param walletId - ID of the wallet that disconnected
   * @param reason - Optional reason for disconnection
   * @private
   */
  private async handleWalletDisconnected(walletId: string, reason?: string): Promise<void> {
    try {
      const sessions = this.sessionManager.getWalletSessions(walletId);

      // End all sessions for this wallet using the unified store action to ensure proper state updates
      for (const session of sessions) {
        await connectionActions.endSession(useStore, session.sessionId, { isDisconnect: true });
      }

      // Clean up adapter
      this.adapters.delete(walletId);
      this.providerVersions.delete(walletId);

      // Connection removed - state automatically updated via session manager
      this.logger?.debug('Wallet disconnected event handled', { walletId, reason });
    } catch (error) {
      this.logger?.error('Failed to handle wallet disconnected', { walletId, reason, error });
    }
  }

  /**
   * Load a built-in wallet adapter
   *
   * This method handles loading of pre-registered built-in adapters
   * like AztecExampleWalletAdapter and DebugWallet. These adapters
   * are part of the core package and should not be treated as
   * discovered wallets.
   *
   * @param walletId - ID of the built-in wallet
   * @returns Adapter instance if found, undefined otherwise
   * @private
   */
  private async loadBuiltinAdapter(
    walletId: string,
    session?: SessionState,
  ): Promise<WalletAdapter | undefined> {
    this.logger?.debug('Attempting to load as built-in adapter', { walletId, hasSession: !!session });

    try {
      if (walletId === 'aztec-example-wallet') {
        const { AztecExampleWalletAdapter } = await import(
          /* @vite-ignore */ '../wallets/aztec-example/AztecExampleWalletAdapter.js'
        );

        // Extract transport config and sessionId from session if available
        const config = session?.adapterReconstruction
          ? {
              transportConfig: session.adapterReconstruction.transportConfig,
              ...(session.adapterReconstruction.sessionId && {
                sessionId: session.adapterReconstruction.sessionId,
              }),
            }
          : undefined;

        const adapter = new AztecExampleWalletAdapter(config);
        this.registry.registerBuiltIn(adapter);
        this.logger?.info('Loaded and registered AztecExampleWalletAdapter as built-in', {
          withStoredConfig: !!config,
          hasSessionId: !!config?.sessionId,
        });
        return adapter;
      } else if (walletId === 'debug-wallet') {
        const { DebugWallet } = await import(/* @vite-ignore */ '../wallets/debug/DebugWallet.js');
        const adapter = new DebugWallet();
        this.registry.registerBuiltIn(adapter);
        this.logger?.info('Loaded and registered DebugWallet as built-in');
        return adapter;
      }
    } catch (importError) {
      this.logger?.error('Failed to load built-in adapter', { walletId, error: importError });
    }

    return undefined;
  }

  /**
   * Creates a wallet adapter with lazy-loaded blockchain provider.
   *
   * Enhances the adapter with chain-specific provider classes for
   * optimized performance. Providers are loaded on-demand to minimize
   * bundle size.
   *
   * @param walletId - ID of the wallet to create adapter for
   * @param _options - Optional connection options (currently unused)
   * @returns Enhanced wallet adapter instance
   * @private
   * @throws {ModalError} If wallet adapter is not found in registry
   */
  private async createAdapterWithProvider(
    walletId: string,
    options?: ConnectOptions,
  ): Promise<WalletAdapter> {
    // First, check if adapter was already created during session restoration
    // This prevents re-creating adapters that were successfully restored from saved sessions
    const cachedAdapter = this.adapters.get(walletId);
    if (cachedAdapter) {
      this.logger?.debug('Using adapter from session restoration', { walletId });
      return cachedAdapter;
    }

    // Get adapter from registry
    const allAdapters = this.registry.getAllAdapters();
    let adapter = this.registry.getAdapter(walletId);

    // If adapter not found in registry, try loading as built-in adapter
    if (!adapter) {
      this.logger?.debug('Adapter not in registry, trying built-in adapter loading', { walletId });
      adapter = await this.loadBuiltinAdapter(walletId);
    }

    // If still not found, check if it's a discovered wallet
    if (!adapter) {
      this.logger?.debug('Not a built-in adapter, checking discovered wallets', { walletId });

      const discoveredWallet = this.registry.getDiscoveredWallet(walletId);
      if (discoveredWallet) {
        this.logger?.info('Creating adapter for discovered wallet', {
          walletId,
          adapterType: discoveredWallet.adapterType,
          discoveryMethod: discoveredWallet.discoveryMethod,
        });

        // Create adapter based on type
        if (discoveredWallet.adapterType === 'evm') {
          adapter = new EvmAdapter(
            discoveredWallet.adapterConfig as ConstructorParameters<typeof EvmAdapter>[0],
          );
          // Register the created adapter for future use
          this.registry.register(adapter);
          this.logger?.debug('Created and registered EVM adapter for discovered wallet', {
            id: adapter.id,
            name: adapter.metadata.name,
          });
        } else if (discoveredWallet.adapterType === 'solana') {
          // Create SolanaAdapter for discovered Solana wallet
          adapter = new SolanaAdapter();
          // Set the discovered provider on the adapter if possible
          if ('setProvider' in adapter && typeof adapter.setProvider === 'function') {
            const config = discoveredWallet.adapterConfig as { provider?: unknown };
            (adapter as { setProvider: (provider: unknown) => void }).setProvider(config?.provider);
          }
          // Register the created adapter for future use
          this.registry.register(adapter);
          this.logger?.debug('Created and registered Solana adapter for discovered wallet', {
            id: adapter.id,
            name: adapter.metadata.name,
          });
        } else if (discoveredWallet.adapterType === 'discovery') {
          // Create DiscoveryAdapter for wallets discovered through discovery protocol
          const config = discoveredWallet.adapterConfig as {
            qualifiedResponder: unknown;
            connectionManager: unknown;
            transportConfig: unknown;
          };
          adapter = new DiscoveryAdapter(
            config.qualifiedResponder,
            config.connectionManager as DiscoveryConnectionManager,
            config.transportConfig as DiscoveryAdapterConfig,
          );
          // Register the created adapter for future use
          this.registry.register(adapter);
          this.logger?.debug('Created and registered Discovery adapter for discovered wallet', {
            id: adapter.id,
            name: adapter.metadata.name,
          });
        } else {
          this.logger?.error('Unsupported adapter type for discovered wallet', {
            walletId,
            adapterType: discoveredWallet.adapterType,
          });
          throw ErrorFactory.walletNotFound(walletId);
        }
      } else {
        // Wallet not found in discovered wallets
        // Built-in adapters are already loaded earlier in the method
        this.logger?.error('Wallet not found', {
          walletId,
          availableIds: allAdapters.map((a) => a.id),
          discoveredIds: this.registry.getAllDiscoveredWallets().map((w) => w.id),
        });
        throw ErrorFactory.walletNotFound(walletId);
      }
    }

    this.logger?.debug('Adapter found', {
      adapterId: adapter.id,
      adapterName: adapter.metadata.name,
    });

    // Trace whether this is DiscoveryAdapter and will create transports on connect
    this.logger?.debug('Adapter class trace', {
      isDiscoveryAdapter: adapter.constructor?.name === 'DiscoveryAdapter',
      className: adapter.constructor?.name,
    });

    // Determine chain type for this wallet
    // Prefer chain type from options if provided (user selected a specific chain)
    let chainType: ChainType;
    if (options?.chains && options.chains.length > 0) {
      const chainDef = options.chains[0];
      if (typeof chainDef === 'object' && 'type' in chainDef && chainDef.type) {
        chainType = chainDef.type;
      } else if (typeof chainDef === 'string') {
        chainType = chainDef as ChainType;
      } else {
        // Fallback to default if chain definition is invalid
        chainType = this.getChainTypeForWallet(walletId);
      }
      this.logger?.debug(`Using chain type from options: ${chainType}`);
    } else {
      chainType = this.getChainTypeForWallet(walletId);
      this.logger?.debug(`Using default chain type for wallet: ${chainType}`);
    }

    // Aztec adapters handle their own provider internally using AztecRouterProvider
    // from @walletmesh/aztec-rpc-wallet, so skip provider enhancement for them
    if (chainType === ChainType.Aztec || chainType === ('aztec' as ChainType)) {
      this.logger?.debug(`Aztec adapter ${walletId} handles its own provider internally`);
      return adapter;
    }

    // Check if provider is available for this chain type
    if (!this.providerLoader.hasProvider(chainType)) {
      this.logger?.debug(`No provider available for ${chainType}, using adapter without enhancement`);
      return adapter;
    }

    try {
      // Load provider class for the chain type
      const providerClass = await this.providerLoader.getProviderClass(chainType);

      // Store provider class reference in adapter for lazy instantiation
      // This allows the adapter to create providers as needed
      if ('setProviderClass' in adapter && typeof adapter.setProviderClass === 'function') {
        (adapter as { setProviderClass: (pc: unknown) => void }).setProviderClass(providerClass);
      }

      this.logger?.debug(`Created adapter for ${walletId} with ${chainType} provider`);
      return adapter;
    } catch (error) {
      this.logger?.warn(`Failed to create provider for ${walletId}:`, error);
      // Fallback to adapter without provider enhancement
      return adapter;
    }
  }

  /**
   * Determines the primary chain type for a wallet.
   *
   * Uses adapter capabilities or heuristics based on wallet ID
   * to determine which blockchain type the wallet primarily supports.
   *
   * @param walletId - ID of the wallet
   * @returns Primary chain type, defaults to 'evm'
   * @private
   */
  private getChainTypeForWallet(walletId: string): ChainType {
    // Get wallet info from adapter
    const adapter = this.registry.getAdapter(walletId);
    if (adapter?.capabilities?.chains && adapter.capabilities.chains.length > 0) {
      // Use first supported chain type
      const firstChainDef = adapter.capabilities.chains[0];

      // If it's a ChainDefinition object, get the type property
      if (firstChainDef && typeof firstChainDef === 'object' && 'type' in firstChainDef) {
        const chainType = firstChainDef.type;

        // If the type is a string, convert to enum
        if (typeof chainType === 'string') {
          // Map lowercase string to enum value
          switch (chainType.toLowerCase()) {
            case 'evm':
              return ChainType.Evm;
            case 'solana':
              return ChainType.Solana;
            case 'aztec':
              return ChainType.Aztec;
            default:
              this.logger?.warn(`Unknown chain type: ${chainType}, defaulting to Evm`);
              return ChainType.Evm;
          }
        }

        // If it's already a ChainType enum, return it
        return chainType as ChainType;
      }
    }

    // Fallback heuristics based on wallet ID
    if (
      walletId.includes('metamask') ||
      walletId.includes('coinbase') ||
      walletId.includes('walletconnect')
    ) {
      return 'evm' as ChainType;
    }
    if (walletId.includes('phantom') || walletId.includes('solflare')) {
      return 'solana' as ChainType;
    }
    if (walletId.includes('aztec')) {
      return 'aztec' as ChainType;
    }

    // Default to EVM
    return 'evm' as ChainType;
  }

  /**
   * Waits for user to select a wallet from the modal.
   *
   * Returns a promise that resolves when the user selects a wallet
   * or closes the modal. Used internally by connect() when no wallet
   * ID is specified.
   *
   * @returns Promise resolving to selected wallet ID or null if cancelled
   * @private
   */
  private async waitForWalletSelection(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      let resolved = false;
      let unsubscribe: (() => void) | null | undefined = null;

      const cleanup = () => {
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
      };

      const safeResolve = (value: string | null) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(value);
        }
      };

      const safeReject = (error: Error) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(error);
        }
      };

      try {
        // Subscribe to modal state changes to detect connection initiation and modal close
        unsubscribe = this.modal?.subscribe((state) => {
          if (resolved) return;

          try {
            // Check if modal was closed
            if (!state.isOpen) {
              safeResolve(null);
              return;
            }

            // Check if connection is being initiated (selectedWalletId is set)
            if (state.selectedWalletId && state.connection.state === 'connecting') {
              safeResolve(state.selectedWalletId);
            }
          } catch (error) {
            const modalError = ErrorFactory.connectionFailed('Unknown error in waitForWalletSelection');
            safeReject(error instanceof Error ? error : new Error(modalError.message));
          }
        });

        // Check immediately
        const currentState = this.modal?.getState();
        if (currentState && !currentState.isOpen) {
          safeResolve(null);
        } else if (currentState?.selectedWalletId && currentState.connection.state === 'connecting') {
          safeResolve(currentState.selectedWalletId);
        }
      } catch (error) {
        const modalError = ErrorFactory.connectionFailed('Failed to setup wallet selection listener');
        safeReject(error instanceof Error ? error : new Error(modalError.message));
      }
    });
  }

  /**
   * Converts a session state object to a wallet connection format.
   *
   * Transforms the internal session representation to the public
   * WalletConnection interface for API compatibility.
   *
   * @param session - Session state to convert
   * @returns Wallet connection object
   * @private
   */
  private async sessionToWalletConnection(session: SessionState): Promise<WalletConnection> {
    // Get provider from registry (NOT from state, to avoid cross-origin errors)
    const provider = getProviderForSession(session.sessionId);

    this.logger?.debug('Converting session to wallet connection', {
      sessionId: session.sessionId,
      walletId: session.walletId,
      hasProvider: !!session.provider,
      hasProviderInstance: !!provider,
    });

    if (!provider) {
      this.logger?.error('Session missing provider instance', {
        sessionId: session.sessionId,
        walletId: session.walletId,
        provider: session.provider,
      });
      throw ErrorFactory.connectionFailed('Session provider not initialized', {
        sessionId: session.sessionId,
        walletId: session.walletId,
      });
    }

    // Validate provider interface for chain type (handles lazy providers)
    await this.providerValidator.validate(provider, {
      sessionId: session.sessionId,
      walletId: session.walletId,
      chainType: session.chain.chainType,
    });

    return {
      walletId: session.walletId,
      address: session.activeAccount.address,
      accounts: session.accounts.map((acc) => acc.address),
      chain: session.chain,
      chainType: session.chain.chainType,
      provider,
      walletInfo: {
        id: session.walletId,
        name: session.metadata.wallet.name,
        icon: session.metadata.wallet.icon,
        chains: [session.chain.chainType],
      },
    };
  }

  /**
   * Adapt a WalletProvider to a BlockchainProvider interface.
   * This is needed because the interfaces are slightly different.
   *
   * @param walletProvider - The WalletProvider to adapt
   * @returns A BlockchainProvider
   * @private
   */
  private adaptWalletProviderToBlockchainProvider(walletProvider: WalletProvider): BlockchainProvider {
    // Keep track of listeners so we can remove them all if needed
    const eventListeners = new Map<string, Set<(...args: unknown[]) => void>>();

    return {
      async getAccounts(): Promise<string[]> {
        return walletProvider.getAccounts();
      },

      async getChainId(): Promise<string | number> {
        return walletProvider.getChainId();
      },

      async disconnect(): Promise<void> {
        return walletProvider.disconnect();
      },

      on(event: string, listener: (...args: unknown[]) => void): void {
        // Track the listener
        if (!eventListeners.has(event)) {
          eventListeners.set(event, new Set());
        }
        eventListeners.get(event)?.add(listener);

        // Add to the underlying provider
        walletProvider.on(event, listener);
      },

      off(event: string, listener: (...args: unknown[]) => void): void {
        // Remove from tracking
        const listeners = eventListeners.get(event);
        if (listeners) {
          listeners.delete(listener);
          if (listeners.size === 0) {
            eventListeners.delete(event);
          }
        }

        // Remove from the underlying provider
        walletProvider.off(event, listener);
      },

      removeAllListeners(event?: string): void {
        if (event) {
          // Remove all listeners for a specific event
          const listeners = eventListeners.get(event);
          if (listeners) {
            for (const listener of listeners) {
              walletProvider.off(event, listener);
            }
            eventListeners.delete(event);
          }
        } else {
          // Remove all listeners for all events
          for (const [eventName, listeners] of eventListeners) {
            for (const listener of listeners) {
              walletProvider.off(eventName, listener);
            }
          }
          eventListeners.clear();
        }
      },

      async request(args: {
        method: string;
        params?: unknown[] | Record<string, unknown>;
      }): Promise<unknown> {
        // Use type guards to call the appropriate method on each provider type
        if (isEvmProvider(walletProvider)) {
          return await walletProvider.request(args);
        }
        if (isAztecRouterProvider(walletProvider)) {
          // Aztec providers require chainId for all calls, which is not available in the generic request() context.
          // The adapted provider preserves the original call(chainId, call, timeout) method below (line ~3827).
          // Services and code that need to use Aztec providers should call the provider.call() method directly
          // with the appropriate chainId, rather than using the generic request() method.
          throw ErrorFactory.transportError(
            `Aztec providers require chainId for method calls. Method '${args.method}' cannot be called via generic request(). Use provider.call(chainId, { method, params }) instead.`,
            'aztec-router',
          );
        }
        // For providers that don't support generic request/call patterns,
        // throw an error indicating they should use provider-specific methods
        throw ErrorFactory.transportError(
          'Provider does not support generic request method. Use provider-specific methods instead.',
        );
      },

      // Add call() method for Aztec providers
      // This is required by the Aztec provider interface and used by validation
      // We bind the method directly to preserve the original signature
      ...('call' in walletProvider &&
        typeof walletProvider.call === 'function' && {
          call: walletProvider.call.bind(walletProvider),
        }),

      // Add lazy provider methods if the underlying provider supports them
      // This allows lazy providers to be detected and properly initialized
      ...('ensureReady' in walletProvider &&
        typeof walletProvider.ensureReady === 'function' && {
          ensureReady: async () => {
            return await (walletProvider as { ensureReady: () => Promise<void> }).ensureReady();
          },
        }),
      ...('isInitialized' in walletProvider &&
        typeof (walletProvider as { isInitialized?: boolean }).isInitialized === 'boolean' && {
          get isInitialized() {
            return (walletProvider as { isInitialized: boolean }).isInitialized;
          },
        }),
    };
  }

  // Note: getChainName() has been consolidated to src/utils/chainNameResolver.ts

  /**
   * Gets a public provider for read-only operations on the specified chain.
   *
   * Public providers use dApp-specified RPC endpoints, allowing applications
   * to control their infrastructure and costs for read operations.
   *
   * @param chainId - The chain ID to get a public provider for
   * @returns Public provider instance or null if not available
   */
  getPublicProvider(chainId: string): import('../../api/types/providers.js').PublicProvider | null {
    if (!this.initialized) {
      this.logger?.warn('Client not initialized, cannot get public provider');
      return null;
    }

    // Get chain configuration to determine chain type
    const chainConfig = this.config.chains?.find((chain) => chain.chainId === chainId);
    if (!chainConfig) {
      this.logger?.warn(`Chain ${chainId} not found in configuration`);
      return null;
    }

    // Get the dApp RPC service
    const dappRpcService = this.getDAppRpcService();

    // Check if dApp RPC endpoints are configured for this chain
    if (dappRpcService?.hasEndpoint(chainId)) {
      this.logger?.debug(`Using dApp RPC for public provider on chain ${chainId}`);
      return new PublicProviderWrapper(dappRpcService, chainId, chainConfig.chainType as ChainType);
    }

    // Fallback: Try to use wallet provider if no dApp RPC is configured
    this.logger?.debug(`No dApp RPC configured for chain ${chainId}, checking for wallet provider fallback`);

    // Check if there's an active session on this chain
    const activeSession = this.sessionManager?.getActiveSession();
    const isCorrectChain = activeSession?.chain?.chainId === chainId && activeSession?.status === 'connected';

    if (isCorrectChain && activeSession) {
      // Get provider from registry (NOT from state, to avoid cross-origin errors)
      const provider = getProviderForSession(activeSession.sessionId);

      if (provider) {
        this.logger?.info(`Using wallet provider as fallback for public provider on chain ${chainId}`);

        // The provider instance is already a WalletProvider
        const walletProvider = provider as unknown as WalletProvider;

        // Create a fallback wrapper that restricts to read-only operations
        return new WalletProviderFallbackWrapper(walletProvider, chainId, chainConfig.chainType as ChainType);
      }
    }

    this.logger?.warn(`No public provider available for chain ${chainId} (no dApp RPC or wallet fallback)`);
    return null;
  }

  /**
   * Gets the wallet provider for write operations on the specified chain.
   *
   * Wallet providers use the wallet's RPC endpoints, enabling transaction
   * signing and other privileged operations.
   *
   * @param chainId - The chain ID to get a wallet provider for
   * @returns Wallet provider instance or null if not connected
   */
  getWalletProvider(chainId: string): import('../../api/types/providers.js').WalletProvider | null {
    if (!this.initialized) {
      this.logger?.warn('Client not initialized, cannot get wallet provider');
      return null;
    }

    // Find an active session with the requested chain
    const state = useStore.getState();
    const activeSession = Object.values(state.entities.sessions).find(
      (session) => session.chain.chainId.toString() === chainId && session.status === 'connected',
    );

    if (!activeSession) {
      this.logger?.debug(`No active session found for chain ${chainId}`);
      return null;
    }

    // Get provider from registry (NOT from state, to avoid cross-origin errors)
    const provider = getProviderForSession(activeSession.sessionId);
    if (!provider) {
      this.logger?.warn(`Session ${activeSession.sessionId} has no provider instance`);
      return null;
    }

    // Return the WalletProvider from the registry
    const walletProvider = provider as WalletProvider;
    return walletProvider;
  }

  /**
   * Get a wallet adapter by ID for provider-agnostic access.
   *
   * This method provides access to the underlying wallet adapter,
   * enabling access to provider adapters and transport layers for
   * advanced use cases.
   *
   * @param walletId - ID of the wallet adapter to retrieve
   * @returns The wallet adapter instance or null if not found
   *
   * @example
   * ```typescript
   * const adapter = client.getWalletAdapter('metamask');
   * if (adapter) {
   *   // Access provider adapters
   *   const evmAdapter = adapter.getProviderAdapter?.(ProviderType.Eip1193);
   *
   *   // Access transport directly
   *   const transport = adapter.getTransport?.();
   * }
   * ```
   *
   * @public
   * @since 1.0.0
   */
  getWalletAdapter(walletId: string): WalletAdapter | null {
    const adapter = this.adapters.get(walletId);
    if (!adapter) {
      this.logger?.debug(`No adapter found for wallet ${walletId}`);
      return null;
    }
    return adapter;
  }

  /**
   * Invalidate an adapter, removing it from cache
   *
   * @param walletId - Wallet ID whose adapter should be invalidated
   * @param reason - Reason for invalidation (for logging)
   * @private
   */
  private invalidateAdapter(walletId: string, reason: string): void {
    this.logger?.info('Invalidating adapter', {
      walletId,
      reason,
      hadAdapter: this.adapters.has(walletId),
    });

    const adapter = this.adapters.get(walletId);
    if (adapter) {
      // Clean up adapter event listeners
      this.cleanupAdapterHandlers(walletId);

      // Remove from cache
      this.adapters.delete(walletId);
      this.providerVersions.delete(walletId);
    }

    // Update health tracking
    const health = this.adapterHealth.get(walletId);
    if (health) {
      health.errors++;
      health.lastError = new Date();
      health.consecutiveFailures++;
    } else {
      this.adapterHealth.set(walletId, {
        errors: 1,
        lastError: new Date(),
        lastSuccess: null,
        consecutiveFailures: 1,
      });
    }
  }

  /**
   * Check if an adapter should be reused or recreated
   *
   * @param walletId - Wallet ID to check
   * @returns true if adapter should be recreated
   * @private
   */
  private shouldRecreateAdapter(walletId: string): boolean {
    const health = this.adapterHealth.get(walletId);
    if (!health) {
      return false; // No health issues recorded
    }

    // Recreate if too many consecutive failures
    if (health.consecutiveFailures >= this.ADAPTER_HEALTH_CONFIG.MAX_CONSECUTIVE_FAILURES) {
      this.logger?.warn('Adapter has too many consecutive failures, will recreate', {
        walletId,
        consecutiveFailures: health.consecutiveFailures,
      });
      return true;
    }

    // Recreate if recent error and still failing
    if (health.lastError) {
      const timeSinceError = Date.now() - health.lastError.getTime();
      if (timeSinceError < this.ADAPTER_HEALTH_CONFIG.ERROR_TIMEOUT_MS) {
        this.logger?.debug('Recent adapter error, considering recreation', {
          walletId,
          timeSinceError,
          threshold: this.ADAPTER_HEALTH_CONFIG.ERROR_TIMEOUT_MS,
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Extract Aztec permissions for a given chain
   *
   * Checks multiple sources in order of priority:
   * 1. Explicit permissions in connect options (aztecOptions.permissions)
   * 2. Permissions configured in WalletMeshConfig by chain ID
   * 3. No permissions (adapter will use defaults)
   *
   * @param options - Optional connect options that may contain permissions
   * @returns Permission extraction result with source information
   * @private
   */
  private extractAztecPermissions(options?: ConnectOptions): PermissionExtractionResult {
    // Check for Aztec chain in configuration
    const aztecChain = this.config.chains?.find((c) => c.chainType === ChainType.Aztec);

    if (!aztecChain) {
      this.logger?.debug('No Aztec chain configured, skipping permission extraction');
      return {
        permissions: undefined,
        chainId: undefined,
        source: 'none',
      };
    }

    const aztecChainId = aztecChain.chainId;

    // Priority 1: Permissions in connect options
    const optionsWithAztec = options as Record<string, unknown> | undefined;
    const aztecOptions = optionsWithAztec?.['aztecOptions'] as { permissions?: string[] } | undefined;
    const optionsPermissions = aztecOptions?.permissions;

    if (Array.isArray(optionsPermissions) && optionsPermissions.length > 0) {
      this.logger?.debug('Using permissions from connect options', {
        chainId: aztecChainId,
        permissions: optionsPermissions,
        count: optionsPermissions.length,
      });
      return {
        permissions: optionsPermissions,
        chainId: aztecChainId,
        source: 'options',
      };
    }

    // Priority 2: Permissions in WalletMeshConfig
    const configWithPermissions = this.config as PermissionsConfig;

    if (configWithPermissions.permissions) {
      const chainPermissions = configWithPermissions.permissions[aztecChainId];

      if (chainPermissions && Array.isArray(chainPermissions)) {
        this.logger?.info('Using permissions from client configuration', {
          chainId: aztecChainId,
          permissions: chainPermissions,
          count: chainPermissions.length,
          categories: this.categorizePermissions(chainPermissions),
        });
        return {
          permissions: chainPermissions,
          chainId: aztecChainId,
          source: 'config',
        };
      }

      console.warn(
        '⚠️ EXTRACT PERMISSIONS - No permissions found for chain:',
        aztecChainId,
        'Available:',
        Object.keys(configWithPermissions.permissions),
      );
      this.logger?.warn('No permissions configured for Aztec chain', {
        chainId: aztecChainId,
        availableChains: Object.keys(configWithPermissions.permissions),
        impact: 'Adapter will use default permissions which may be insufficient',
        recommendation: 'Add permissions array to WalletMesh config for this chain ID',
      });
    } else {
      this.logger?.warn('No permission configuration in client config', {
        chainId: aztecChainId,
        impact: 'Adapter will use default permissions',
        recommendation: 'Add permissions configuration to WalletMesh config',
      });
    }

    // Priority 3: No explicit permissions (adapter will use defaults)
    return {
      permissions: undefined,
      chainId: aztecChainId,
      source: 'default',
    };
  }

  /**
   * Categorizes Aztec permissions for logging purposes.
   *
   * @param permissions - Array of permission method names
   * @returns Object mapping categories to arrays of permissions
   * @private
   */
  private categorizePermissions(permissions: string[]): Record<string, string[]> {
    const categories = {
      account: [] as string[],
      chain: [] as string[],
      transaction: [] as string[],
      contract: [] as string[],
      auth: [] as string[],
      event: [] as string[],
      walletmesh: [] as string[],
      other: [] as string[],
    };

    for (const permission of permissions) {
      if (permission.includes('Address') || permission.includes('CompleteAddress')) {
        categories.account.push(permission);
      } else if (
        permission.includes('Chain') ||
        permission.includes('Version') ||
        permission.includes('Block') ||
        permission.includes('Fees') ||
        permission.includes('Node') ||
        permission.includes('PXE')
      ) {
        categories.chain.push(permission);
      } else if (
        permission.includes('Tx') ||
        permission.includes('Transaction') ||
        permission.includes('simulat') ||
        permission.includes('prove')
      ) {
        categories.transaction.push(permission);
      } else if (permission.includes('Contract') || permission.includes('register')) {
        categories.contract.push(permission);
      } else if (permission.includes('Auth') || permission.includes('Wit')) {
        categories.auth.push(permission);
      } else if (permission.includes('Event')) {
        categories.event.push(permission);
      } else if (permission.includes('wm') || permission.includes('Wm')) {
        categories.walletmesh.push(permission);
      } else {
        categories.other.push(permission);
      }
    }

    // Remove empty categories
    return Object.fromEntries(Object.entries(categories).filter(([, perms]) => perms.length > 0));
  }
}

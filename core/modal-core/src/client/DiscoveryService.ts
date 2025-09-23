/**
 * Discovery Service
 *
 * This service consolidates the functionality of the previous three discovery services:
 * 1. Base DiscoveryService - Core discovery functionality
 * 2. TransportDiscoveryService - Transport configuration extraction
 * 3. DiscoveryService wrapper - Adapter creation
 *
 * Provides comprehensive wallet discovery functionality including:
 * - Cross-origin wallet detection
 * - Transport configuration extraction
 * - Automatic adapter creation
 * - Wallet availability monitoring
 * - Discovery event management
 * - Integration with WalletConnect discovery
 *
 * @module client/DiscoveryService
 * @packageDocumentation
 */

// Discovery protocol imports
import type { CapabilityRequirements, InitiatorInfo, QualifiedResponder } from '@walletmesh/discovery';
import { DiscoveryInitiator } from '@walletmesh/discovery';
import type { Logger } from '../internal/core/logger/logger.js';
import type { WalletRegistry } from '../internal/registries/wallets/WalletRegistry.js';
import type { DiscoveredWalletInfo, WalletInfo } from '../types.js';
import { ChainType } from '../types.js';
import type { DiscoveryConnectionManager } from './discovery/types.js';

// Simple implementation that provides the expected interface
class DiscoveryConnectionManagerImpl implements DiscoveryConnectionManager {
  constructor(private logger: Logger) {}

  async connect(
    qualifiedWallet: QualifiedResponder,
    options: {
      requestedChains: string[];
      requestedPermissions: string[];
    },
  ): Promise<{
    connectionId: string;
    accounts: Array<{ address: string; chainId: string }>;
  }> {
    this.logger.debug('Discovery connection manager: connecting to wallet', {
      walletId: qualifiedWallet.responderId,
      options,
    });

    // For now, return a basic connection result
    // In a full implementation, this would handle the actual connection process
    return {
      connectionId: qualifiedWallet.responderId,
      accounts: [],
    };
  }

  async disconnect(responderId: string): Promise<void> {
    this.logger.debug('Discovery connection manager: disconnecting from wallet', {
      responderId,
    });

    // For now, just log the disconnect
    // In a full implementation, this would handle the actual disconnection process
  }
}

import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import { globalAdapterRegistry } from '../internal/registry/WalletAdapterRegistry.js';
import type { WalletAdapter } from '../internal/wallets/base/WalletAdapter.js';
import { DiscoveryAdapter } from '../internal/wallets/discovery/DiscoveryAdapter.js';
import { safeValidateQualifiedResponder } from '../schemas/discovery.js';
import { type OriginValidationConfig, OriginValidator } from '../security/originValidation.js';
import { RATE_LIMIT_CONFIGS, type RateLimitConfig, RateLimiter } from '../security/rateLimiting.js';
import {
  type SecureSession,
  type SessionSecurityConfig,
  SessionSecurityManager,
} from '../security/sessionSecurity.js';
import { ConnectionStateManager } from './discovery/ConnectionState.js';
import { DiscoveryEventWrapper } from './discovery/DiscoveryEventWrapper.js';
import { createCapabilityRequirementsFromChainTypes } from './types/discoveryMappings.js';

/**
 * Unified discovery configuration options
 * Combines all functionality from the previous discovery services
 *
 * @public
 */
export interface DiscoveryConfig {
  /** Whether discovery is enabled */
  enabled?: boolean;
  /** Discovery timeout in milliseconds */
  timeout?: number;
  /** Retry interval for periodic discovery */
  retryInterval?: number;
  /** Maximum number of discovery attempts */
  maxAttempts?: number;
  /** Whether to announce this dApp to wallets */
  announce?: boolean;
  /** Custom discovery endpoints */
  endpoints?: string[];
  /** Supported chain types for filtering */
  supportedChainTypes?: ChainType[];
  /** Technology-based requirements for discovery */
  technologies?: Array<{
    type: 'evm' | 'solana' | 'aztec';
    interfaces: string[];
    features?: string[];
  }>;
  /** Legacy capability requirements for discovery (backward compatibility) */
  capabilities?: {
    chains?: string[];
    features?: string[];
    interfaces?: string[];
  };
  /** DApp information for discovery */
  dappInfo?: Partial<InitiatorInfo>;

  /** Security configuration */
  security?: {
    /** Enable origin validation */
    enableOriginValidation?: boolean;
    /** Origin validation config */
    originValidation?: OriginValidationConfig;
    /** Enable rate limiting */
    enableRateLimiting?: boolean;
    /** Rate limit config */
    rateLimit?: RateLimitConfig;
    /** Enable session security */
    enableSessionSecurity?: boolean;
    /** Session security config */
    sessionSecurity?: SessionSecurityConfig;
  };

  /** Transport and adapter configuration for on-demand adapter creation */
  transport?: {
    /** Default adapter configuration (used when adapter is created on-demand) */
    adapterConfig?: {
      autoConnect?: boolean;
      retries?: number;
      retryDelay?: number;
      timeout?: number;
    };
  };
}

/**
 * Discovered wallet information with extended metadata
 *
 * @public
 */
export interface DiscoveredWallet extends WalletInfo {
  /** Discovery method used */
  discoveryMethod: 'injected' | 'extension' | 'announced' | 'manual';
  /** Wallet availability status */
  isAvailable: boolean;
  /** Wallet version if available */
  version?: string;
  /** Additional metadata from discovery */
  metadata?: Record<string, unknown>;
  /** Discovery timestamp */
  discoveredAt: number;
  /** Last seen timestamp */
  lastSeen: number;
}

/**
 * Enhanced discovery event types
 * Combines standard discovery events with transport-specific events
 *
 * @public
 */
export type DiscoveryEvent =
  | { type: 'discovery_started' }
  | { type: 'discovery_completed'; wallets: DiscoveredWallet[] }
  | { type: 'wallet_discovered'; wallet: DiscoveredWallet }
  | { type: 'wallet_available'; wallet: DiscoveredWallet }
  | { type: 'wallet_unavailable'; walletId: string }
  | { type: 'discovery_error'; error: Error }
  | { type: 'announcement_sent'; targetOrigin: string }
  | { type: 'announcement_received'; wallet: DiscoveredWallet; origin: string };

/**
 * Enhanced discovery event types from transport layer
 *
 * @public
 */
export type EnhancedDiscoveryEvent =
  | { type: 'wallet_discovered_with_transport'; wallet: QualifiedResponder }
  | { type: 'wallet_registered'; walletId: string; walletName: string }
  | { type: 'transport_extracted'; walletId: string; transportType: string };

/**
 * Discovery result with optional adapter
 * Combines wallet information with transport configuration
 *
 * @public
 */
export interface DiscoveryResult {
  wallet: QualifiedResponder;
  adapter: WalletAdapter | null;
}

/**
 * Unified Discovery Service class for comprehensive wallet discovery
 *
 * Consolidates functionality from:
 * - Base DiscoveryService: Core discovery functionality
 * - TransportDiscoveryService: Transport configuration extraction
 * - DiscoveryService wrapper: Adapter creation and management
 *
 * @example
 * ```typescript
 * const discoveryService = new DiscoveryService(config, registry, logger);
 *
 * // Listen for discovered wallets
 * discoveryService.on('wallet_discovered', (event) => {
 *   console.log('Found wallet:', event.wallet.name);
 * });
 *
 * // Listen for enhanced transport events
 * discoveryService.onEnhanced('adapter_created', (event) => {
 *   console.log('Adapter created:', event.adapter.id);
 * });
 *
 * // Start discovery
 * await discoveryService.start();
 *
 * // Get discovery results with adapters
 * const results = await discoveryService.discoverWallets();
 * results.forEach(result => {
 *   console.log('Wallet:', result.wallet.name, 'Adapter:', result.adapter?.id);
 * });
 * ```
 *
 * @public
 */
export class DiscoveryService {
  private readonly config: Required<DiscoveryConfig>;
  private readonly registry: WalletRegistry;
  protected readonly logger: Logger;
  private injectedConnectionManager?: DiscoveryConnectionManager;
  private readonly eventTarget = new EventTarget();
  private readonly enhancedEventTarget = new EventTarget();

  // Track event listeners for proper cleanup
  private readonly eventListeners = new Set<() => void>();

  // Discovery state (from base DiscoveryService)
  private readonly discoveredWallets = new Map<string, DiscoveredWallet>();
  private discoveryInitiator: DiscoveryInitiator | null = null;
  protected connectionManager: DiscoveryConnectionManager | null = null;
  protected qualifiedWallets = new Map<string, QualifiedResponder>();
  private discoveryTimer: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private discoveryAttempts = 0;
  private isDestroyed = false;

  // Transport and adapter state (from TransportDiscoveryService)
  private discoveredResponders = new Map<string, QualifiedResponder>();
  private walletAdapters = new Map<string, WalletAdapter>();
  private discoveredAdapters = new Map<string, DiscoveryAdapter>();

  // Enhanced discovery components
  private connectionStateManager: ConnectionStateManager | null = null;
  private eventWrapper: DiscoveryEventWrapper | null = null;

  // Security components
  private sessionSecurityManager: SessionSecurityManager | null = null;
  private originValidator: OriginValidator | null = null;
  private rateLimiter: RateLimiter | null = null;

  constructor(
    config: DiscoveryConfig,
    registry: WalletRegistry,
    logger: Logger,
    _adapterRegistry?: unknown,
    connectionManager?: DiscoveryConnectionManager,
  ) {
    this.config = {
      enabled: true,
      timeout: 5000,
      retryInterval: 30000,
      maxAttempts: 0, // 0 = unlimited
      announce: true,
      endpoints: [],
      supportedChainTypes: ['evm', 'solana', 'aztec'] as ChainType[],
      ...config,
      capabilities: config.capabilities || {},
      dappInfo: config.dappInfo || {},
      security: config.security || {},
      transport: {
        adapterConfig: {
          autoConnect: false,
          retries: 3,
          retryDelay: 1000,
          timeout: 10000,
        },
        ...config.transport,
      },
      technologies: config.technologies || [],
    };

    this.registry = registry;
    this.logger = logger;
    if (connectionManager) {
      this.injectedConnectionManager = connectionManager;
    }

    this.logger.debug('Unified DiscoveryService initialized', {
      config: this.config,
    });
  }

  /**
   * Start the discovery service
   *
   * @returns Promise that resolves when discovery is started
   * @public
   */
  async start(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.debug('Discovery service disabled');
      return;
    }

    if (this.isRunning) {
      this.logger.warn('Discovery service already running');
      return;
    }

    this.logger.info('Starting discovery service');
    this.isRunning = true;
    this.discoveryAttempts = 0;

    try {
      // Initialize discovery components
      await this.initializeDiscoveryComponents();

      // Emit discovery started event before performing discovery
      this.emit({ type: 'discovery_started' });

      // Perform initial discovery
      await this.performDiscovery();

      // Setup periodic discovery
      if (this.config.retryInterval) {
        this.setupPeriodicDiscovery();
      }
      this.logger.info('Discovery service started successfully');
    } catch (error) {
      this.logger.error('Failed to start discovery service', error);
      this.isRunning = false;
      this.emit({ type: 'discovery_error', error: error as Error });

      // Handle both Error objects and ModalError objects
      const errorMessage =
        error instanceof Error
          ? error.message
          : error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? error.message
            : String(error);

      throw ErrorFactory.configurationError(`Discovery service startup failed: ${errorMessage}`);
    }
  }

  /**
   * Stop the discovery service
   *
   * @returns Promise that resolves when discovery is stopped
   * @public
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.debug('Discovery service not running');
      return;
    }

    this.logger.info('Stopping discovery service');
    this.isRunning = false;

    // Stop periodic discovery
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = null;
    }

    // Cleanup discovery components
    await this.cleanupDiscoveryComponents();

    this.logger.info('Discovery service stopped');
  }

  /**
   * Perform a one-time discovery scan
   *
   * @returns Promise that resolves to discovered wallets
   * @public
   */
  async discover(): Promise<DiscoveredWallet[]> {
    this.logger.debug('Performing manual discovery');

    try {
      // Perform discovery and return results
      const wallets = await this.performDiscovery();
      this.logger.info('Manual discovery completed', { walletCount: wallets.length });
      return wallets;
    } catch (error) {
      this.logger.error('Manual discovery failed', error);
      this.emit({ type: 'discovery_error', error: error as Error });
      throw error;
    }
  }

  /**
   * Get all discovered wallets
   *
   * @returns Array of discovered wallets
   * @public
   */
  getDiscoveredWallets(): DiscoveredWallet[] {
    return Array.from(this.discoveredWallets.values());
  }

  /**
   * Get available discovered wallets
   *
   * @returns Array of available discovered wallets
   * @public
   */
  getAvailableWallets(): DiscoveredWallet[] {
    const wallets = this.getDiscoveredWallets().filter((wallet) => wallet.isAvailable);
    this.logger.debug('getAvailableWallets returning wallets', {
      count: wallets.length,
      wallets: wallets.map((w) => ({ id: w.id, name: w.name })),
    });
    return wallets;
  }

  /**
   * Get a specific discovered wallet
   *
   * @param walletId - ID of the wallet to get
   * @returns Discovered wallet or undefined if not found
   * @public
   */
  getDiscoveredWallet(walletId: string): DiscoveredWallet | undefined {
    return this.discoveredWallets.get(walletId);
  }

  /**
   * Check if a wallet is available
   *
   * @param walletId - ID of the wallet to check
   * @returns True if wallet is available
   * @public
   */
  isWalletAvailable(walletId: string): boolean {
    const wallet = this.discoveredWallets.get(walletId);
    return wallet?.isAvailable ?? false;
  }

  /**
   * Force refresh of a specific wallet's availability
   *
   * @param walletId - ID of the wallet to refresh
   * @returns Promise that resolves to updated wallet info
   * @public
   */
  async refreshWallet(walletId: string): Promise<DiscoveredWallet | null> {
    this.logger.debug('Refreshing wallet availability', { walletId });

    try {
      const wallet = await this.checkWalletAvailability(walletId);
      if (wallet) {
        this.updateDiscoveredWallet(wallet);
        return wallet;
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to refresh wallet', { walletId, error });
      throw error;
    }
  }

  /**
   * Subscribe to discovery events
   *
   * @param event - Event type to listen for
   * @param handler - Event handler function
   * @returns Unsubscribe function
   * @public
   */
  on(event: DiscoveryEvent['type'], handler: (event: DiscoveryEvent) => void): () => void {
    const listener = (e: Event) => {
      const customEvent = e as CustomEvent<DiscoveryEvent>;
      if (customEvent.detail.type === event) {
        handler(customEvent.detail);
      }
    };

    this.eventTarget.addEventListener('discovery-event', listener);

    const removeListener = () => {
      this.eventTarget.removeEventListener('discovery-event', listener);
      this.eventListeners.delete(removeListener);
    };

    // Track the removal function for cleanup
    this.eventListeners.add(removeListener);

    return removeListener;
  }

  /**
   * Subscribe to discovery events once
   *
   * @param event - Event type to listen for
   * @param handler - Event handler function
   * @returns Unsubscribe function
   * @public
   */
  once(event: DiscoveryEvent['type'], handler: (event: DiscoveryEvent) => void): () => void {
    const unsubscribe = this.on(event, (eventData) => {
      unsubscribe();
      handler(eventData);
    });
    return unsubscribe;
  }

  /**
   * Subscribe to enhanced discovery events
   * @param event - Event type to listen for
   * @param handler - Event handler function
   * @returns Unsubscribe function
   * @public
   */
  onEnhanced(
    event: EnhancedDiscoveryEvent['type'],
    handler: (event: EnhancedDiscoveryEvent) => void,
  ): () => void {
    const listener = (e: Event) => {
      const customEvent = e as CustomEvent<EnhancedDiscoveryEvent>;
      if (customEvent.detail.type === event) {
        handler(customEvent.detail);
      }
    };

    this.enhancedEventTarget.addEventListener('enhanced-discovery-event', listener);

    const removeListener = () => {
      this.enhancedEventTarget.removeEventListener('enhanced-discovery-event', listener);
      this.eventListeners.delete(removeListener);
    };

    // Track the removal function for cleanup
    this.eventListeners.add(removeListener);

    return removeListener;
  }

  /**
   * Discover wallets for specified chain types
   * Enhanced version that returns DiscoveryResult with adapters
   * @public
   */
  async discoverWallets(chainTypes?: ChainType[]): Promise<DiscoveryResult[]> {
    try {
      // Update discovery configuration with chain types if provided
      if (chainTypes && chainTypes.length > 0) {
        await this.updateChainConfiguration(chainTypes);
      }

      // Perform discovery
      await this.discover();

      // Get wallets with transport
      const walletsWithTransport = this.getWalletsWithTransport();

      // Register each discovered wallet in the registry for on-demand adapter creation
      for (const wallet of walletsWithTransport) {
        // Check if there's a custom adapter specified in transportConfig
        const customAdapter = (wallet.transportConfig as { walletAdapter?: unknown })?.walletAdapter;
        const metadata: Record<string, unknown> = wallet.metadata || {};
        if (customAdapter) {
          metadata['customAdapter'] = customAdapter;
        }

        const discoveredInfo: DiscoveredWalletInfo = {
          id: wallet.responderId,
          name: wallet.name,
          icon: wallet.icon,
          adapterType: 'discovery',
          adapterConfig: {
            qualifiedResponder: wallet,
            connectionManager: this.connectionManager,
            transportConfig: this.config.transport?.adapterConfig || {},
          },
          discoveryMethod: 'discovery-protocol',
          metadata,
        };

        // Register in wallet registry as discovered wallet
        this.registry.registerDiscoveredWallet(discoveredInfo);

        // Emit wallet registered event
        this.emitEnhanced({
          type: 'wallet_registered',
          walletId: wallet.responderId,
          walletName: wallet.name,
        });

        this.logger.debug('Registered discovered wallet', {
          id: wallet.responderId,
          name: wallet.name,
        });
      }

      // Return wallets without adapters (adapters will be created on-demand)
      return walletsWithTransport.map((wallet) => ({
        wallet,
        adapter: null,
      }));
    } catch (error) {
      this.logger.error('Discovery failed', error);
      throw ErrorFactory.connectionFailed('Failed to discover wallets', { originalError: error });
    }
  }

  /**
   * Get wallet information with transport configuration
   * @public
   */
  getWalletWithTransport(walletId: string): QualifiedResponder | undefined {
    return this.discoveredResponders.get(walletId);
  }

  /**
   * Get all wallets with transport configuration
   * @public
   */
  getWalletsWithTransport(): QualifiedResponder[] {
    return Array.from(this.discoveredResponders.values());
  }

  /**
   * Create a wallet adapter for a discovered wallet
   * @public
   */
  async createWalletAdapter(walletId: string, config?: { autoConnect?: boolean }): Promise<WalletAdapter> {
    const qualifiedResponder = this.discoveredResponders.get(walletId);
    if (!qualifiedResponder) {
      throw ErrorFactory.walletNotFound(walletId);
    }

    // Check if adapter already exists
    const existingAdapter = this.walletAdapters.get(walletId);
    if (existingAdapter) {
      return existingAdapter;
    }

    // Get connection manager
    if (!this.connectionManager) {
      throw ErrorFactory.configurationError('Connection manager not initialized');
    }

    // Create adapter config
    const adapterConfig = { ...this.config.transport.adapterConfig, ...config };

    let adapter: WalletAdapter;

    // Check if wallet specified a custom adapter
    const customAdapterName = qualifiedResponder.transportConfig?.walletAdapter;
    if (customAdapterName && globalAdapterRegistry.has(customAdapterName)) {
      this.logger.debug('Using custom wallet adapter', {
        walletId,
        adapterName: customAdapterName,
      });

      try {
        // Create custom adapter using registry
        adapter = globalAdapterRegistry.createAdapter(
          customAdapterName,
          qualifiedResponder,
          this.connectionManager,
          adapterConfig,
        );
      } catch (error) {
        this.logger.warn('Failed to create custom adapter, falling back to DiscoveryAdapter', {
          walletId,
          adapterName: customAdapterName,
          error,
        });
        // Fallback to generic DiscoveryAdapter
        adapter = new DiscoveryAdapter(qualifiedResponder, this.connectionManager, adapterConfig);
      }
    } else {
      // Use generic DiscoveryAdapter
      adapter = new DiscoveryAdapter(qualifiedResponder, this.connectionManager, adapterConfig);
    }

    // Store adapter
    this.walletAdapters.set(walletId, adapter);
    if (adapter instanceof DiscoveryAdapter) {
      this.discoveredAdapters.set(walletId, adapter);
    }

    // No longer emit adapter_created since adapters are created on-demand
    // The adapter creation is handled at a higher level now

    return adapter;
  }

  /**
   * Get or create wallet adapter
   * @public
   */
  async getOrCreateAdapter(walletId: string): Promise<WalletAdapter> {
    const existing = this.walletAdapters.get(walletId);
    if (existing) {
      return existing;
    }
    return this.createWalletAdapter(walletId);
  }

  /**
   * Connect to wallet and get adapter
   * @public
   */
  async connectAndGetAdapter(
    walletId: string,
    options?: {
      requestedChains?: string[];
      requestedPermissions?: string[];
    },
  ): Promise<WalletAdapter> {
    // First connect using parent method
    await this.connectToWallet(walletId, options);

    // Then create and return adapter
    return this.createWalletAdapter(walletId, { autoConnect: false });
  }

  /**
   * Get a specific wallet adapter
   * @public
   */
  async getWalletAdapter(walletId: string): Promise<WalletAdapter | null> {
    // Check cached adapters
    const cached = this.walletAdapters.get(walletId);
    if (cached) {
      return cached;
    }

    // Try to create from discovered wallet
    try {
      const adapter = await this.createWalletAdapter(walletId, this.config.transport.adapterConfig);
      return adapter;
    } catch (error) {
      this.logger.error('Failed to create adapter', { walletId, error });
      return null;
    }
  }

  /**
   * Get all discovered wallet adapters
   * @public
   */
  getDiscoveredAdapters(): DiscoveryAdapter[] {
    return Array.from(this.discoveredAdapters.values());
  }

  /**
   * Get wallet by chain support
   * @public
   */
  getWalletsByChain(chainType: ChainType): DiscoveryResult[] {
    const results: DiscoveryResult[] = [];
    const walletsWithTransport = this.getWalletsWithTransport();

    for (const wallet of walletsWithTransport) {
      const adapter = this.discoveredAdapters.get(wallet.responderId);
      if (adapter?.supportsChain(chainType)) {
        results.push({ wallet, adapter });
      }
    }

    return results;
  }

  /**
   * Get wallets by transport type
   * @public
   */
  getWalletsByTransportType(
    transportType: 'extension' | 'popup' | 'injected' | 'websocket',
  ): DiscoveryResult[] {
    const results: DiscoveryResult[] = [];
    const walletsWithTransport = this.getWalletsWithTransport();

    for (const wallet of walletsWithTransport) {
      if (wallet.transportConfig?.type === transportType) {
        const adapter = this.discoveredAdapters.get(wallet.responderId);
        results.push({ wallet, adapter: adapter || null });
      }
    }

    return results;
  }

  /**
   * Get Chrome extension wallets
   * @public
   */
  getChromeExtensionWallets(): DiscoveryResult[] {
    return this.getWalletsByTransportType('extension');
  }

  /**
   * Start continuous discovery
   * @public
   */
  async startContinuousDiscovery(): Promise<void> {
    await this.start();
  }

  /**
   * Stop continuous discovery
   * @public
   */
  async stopContinuousDiscovery(): Promise<void> {
    await this.stop();
  }

  /**
   * Connect to a discovered wallet using the discovery protocol
   *
   * @param walletId - ID of the wallet to connect to
   * @param options - Connection options
   * @returns Promise that resolves to connection details
   * @public
   */
  async connectToWallet(
    walletId: string,
    options?: {
      requestedChains?: string[];
      requestedPermissions?: string[];
    },
  ): Promise<{
    sessionId: string;
    walletId: string;
    rdns: string;
    chains: string[];
  }> {
    const qualifiedWallet = this.qualifiedWallets.get(walletId);
    if (!qualifiedWallet) {
      throw ErrorFactory.connectorError(
        `Wallet ${walletId} not found in qualified wallets`,
        'WALLET_NOT_FOUND',
      );
    }

    if (!this.connectionManager) {
      throw ErrorFactory.configurationError('Connection manager not initialized');
    }

    try {
      this.logger.debug('Connecting to wallet', { walletId, rdns: qualifiedWallet.rdns });

      // Update connection state to connecting
      if (this.connectionStateManager) {
        this.connectionStateManager.updateConnectionState(walletId, {
          status: 'connecting',
          qualifiedWallet,
        });
      }

      // Use event wrapper if available for better event handling
      let sessionId: string;
      let transportConfig: unknown;

      if (this.eventWrapper) {
        const result = await this.eventWrapper.connectToWallet(qualifiedWallet);
        sessionId = result.sessionId;
        transportConfig = result.transport;
      } else {
        const connection = await this.connectionManager.connect(qualifiedWallet, {
          requestedChains: options?.requestedChains || [],
          requestedPermissions: options?.requestedPermissions || ['accounts', 'sign-transactions'],
        });
        sessionId = connection.connectionId || qualifiedWallet.responderId;
        transportConfig = connection;
      }

      // Update connection state to connected
      if (this.connectionStateManager) {
        const updateData: Parameters<typeof this.connectionStateManager.updateConnectionState>[1] = {
          status: 'connected',
          sessionId,
          connectedAt: Date.now(),
        };

        if (transportConfig) {
          updateData.transport = {
            type: 'discovery',
            config: transportConfig as Record<string, unknown>,
          };
        }

        this.connectionStateManager.updateConnectionState(walletId, updateData);
      }

      this.logger.info('Successfully connected to wallet', {
        walletId,
        rdns: qualifiedWallet.rdns,
        sessionId,
      });

      // Create secure session if enabled
      if (this.sessionSecurityManager && typeof window !== 'undefined') {
        try {
          const origin = window.location.origin;
          await this.sessionSecurityManager.createSession({
            origin,
            walletId,
            authorizedChains: [],
            metadata: {
              userAgent: navigator.userAgent,
              custom: {
                rdns: qualifiedWallet.rdns,
                connectionId: sessionId,
              },
            },
          });
        } catch (error) {
          this.logger.error('Failed to create secure session', error);
          // Don't fail the connection if session creation fails
        }
      }

      return {
        sessionId,
        walletId: qualifiedWallet.responderId,
        rdns: qualifiedWallet.rdns,
        chains: [],
      };
    } catch (error) {
      this.logger.error('Failed to connect to wallet', { walletId, error });

      // Update connection state to error
      if (this.connectionStateManager) {
        this.connectionStateManager.updateConnectionState(walletId, {
          status: 'error',
          error: {
            code: 'CONNECTION_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
            recoverable: true,
          },
        });
      }

      throw error;
    }
  }

  /**
   * Get the qualified wallet information for a discovered wallet
   *
   * @param walletId - ID of the wallet
   * @returns Qualified wallet information or undefined
   * @public
   */
  getQualifiedWallet(walletId: string): QualifiedResponder | undefined {
    return this.qualifiedWallets.get(walletId);
  }

  /**
   * Get connection state for a wallet
   *
   * @param walletId - The ID of the wallet
   * @returns Connection state or undefined
   * @public
   */
  getConnectionState(walletId: string) {
    return this.connectionStateManager?.getConnectionState(walletId);
  }

  /**
   * Get all connected wallets
   *
   * @returns Array of connected wallet states
   * @public
   */
  getConnectedWallets() {
    return this.connectionStateManager?.getConnectedWallets() || [];
  }

  /**
   * Check if a wallet is connected
   *
   * @param walletId - The ID of the wallet
   * @returns True if connected
   * @public
   */
  isWalletConnected(walletId: string): boolean {
    return this.connectionStateManager?.isConnected(walletId) || false;
  }

  /**
   * Get session recovery information
   *
   * @returns Array of recoverable sessions
   * @public
   */
  getRecoverableSessions() {
    return this.connectionStateManager?.getRecoverableSessions() || [];
  }

  /**
   * Get secure sessions for current origin
   *
   * @returns Array of secure sessions
   * @public
   */
  getSecureSessions(): SecureSession[] {
    if (!this.sessionSecurityManager || typeof window === 'undefined') {
      return [];
    }

    const origin = window.location.origin;
    return this.sessionSecurityManager.getSessionsByOrigin(origin);
  }

  /**
   * Validate a secure session
   *
   * @param sessionId - Session ID to validate
   * @returns Validation result
   * @public
   */
  validateSecureSession(sessionId: string): { valid: boolean; reason?: string } {
    if (!this.sessionSecurityManager || typeof window === 'undefined') {
      return { valid: false, reason: 'Session security not enabled' };
    }

    const origin = window.location.origin;
    const result = this.sessionSecurityManager.validateSession(sessionId, origin);

    return {
      valid: result.valid,
      ...(result.reason && { reason: result.reason }),
    };
  }

  /**
   * Clean up discovery service resources
   *
   * @public
   */
  async destroy(): Promise<void> {
    this.logger.debug('Destroying unified DiscoveryService');

    this.isDestroyed = true;
    await this.stop();

    // Clean up all discovery maps
    this.discoveredWallets.clear();
    this.discoveredResponders.clear();
    this.qualifiedWallets.clear();

    // Disconnect all adapters
    for (const adapter of this.walletAdapters.values()) {
      try {
        await adapter.disconnect();
      } catch (error) {
        this.logger.error('Failed to disconnect adapter during cleanup', error);
      }
    }
    this.walletAdapters.clear();
    this.discoveredAdapters.clear();

    this.logger.info('Unified DiscoveryService destroyed');
  }

  // Private implementation methods

  private async initializeDiscoveryComponents(): Promise<void> {
    this.logger.debug('Initializing discovery components');

    try {
      // Initialize discovery listener for receiving wallet announcements
      if (typeof window !== 'undefined') {
        // Create capability requirements from config
        const requirements = this.createCapabilityRequirements();
        const initiatorInfo = this.createInitiatorInfo();

        // Initialize discovery listener
        this.discoveryInitiator = new DiscoveryInitiator(requirements, initiatorInfo, {
          timeout: this.config.timeout,
        });

        // Initialize connection manager (use injected one if provided)
        this.connectionManager =
          this.injectedConnectionManager || new DiscoveryConnectionManagerImpl(this.logger);

        // Initialize connection state manager
        this.connectionStateManager = new ConnectionStateManager(this.logger);

        // Initialize event wrapper
        this.eventWrapper = new DiscoveryEventWrapper(
          this.discoveryInitiator as DiscoveryInitiator,
          this.connectionManager,
          this.logger,
          {
            timeout: this.config.timeout,
            emitProgress: true,
          },
        );

        // Set up event handlers
        this.setupDiscoveryEventHandlers();

        // Initialize security components if enabled
        if (this.config.security?.enableOriginValidation) {
          this.originValidator = new OriginValidator(
            this.config.security.originValidation || {},
            this.logger,
          );
        }

        if (this.config.security?.enableRateLimiting) {
          this.rateLimiter = new RateLimiter(
            this.config.security.rateLimit || RATE_LIMIT_CONFIGS.discovery,
            this.logger,
          );
        }

        if (this.config.security?.enableSessionSecurity) {
          this.sessionSecurityManager = new SessionSecurityManager(
            this.config.security.sessionSecurity || {},
            this.logger,
            this.originValidator || undefined,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize discovery components', error);
      throw error;
    }
  }

  private createCapabilityRequirements(): CapabilityRequirements {
    // If technology-based requirements are provided, use them
    if (this.config.technologies && this.config.technologies.length > 0) {
      return {
        technologies: this.config.technologies,
        // Include global features if specified
        features: this.config.capabilities?.features || [],
      };
    }

    // Fall back to chain-based requirements
    return createCapabilityRequirementsFromChainTypes(
      this.config.supportedChainTypes || [ChainType.Evm],
      this.config.capabilities?.chains, // Use chains from config
      this.config.capabilities?.features,
      this.config.capabilities?.interfaces,
    );
  }

  private createInitiatorInfo(): InitiatorInfo {
    const defaultInfo: InitiatorInfo = {
      name: 'WalletMesh dApp',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      icon: '',
      description: 'A dApp using WalletMesh',
    };

    return {
      ...defaultInfo,
      ...this.config.dappInfo,
    };
  }

  private async shouldSkipWalletDueToOriginValidation(wallet: DiscoveredWallet): Promise<boolean> {
    if (!this.originValidator) {
      this.logger.debug('Origin validation disabled for wallet', { walletId: wallet.id });
      return false; // Origin validation disabled
    }

    try {
      // Extract origin from wallet icon URL or use a default
      const walletOrigin = wallet.icon ? new URL(wallet.icon).origin : `https://${wallet.id}`;
      this.logger.debug('Validating origin for wallet', { walletOrigin, walletId: wallet.id });
      const isValid = await this.originValidator.validate(walletOrigin);
      this.logger.debug('Origin validation result', { walletOrigin, isValid });

      if (!isValid) {
        this.logger.warn('Skipping wallet due to origin validation failure', {
          walletId: wallet.id,
          walletOrigin,
        });
        return true;
      }

      return false;
    } catch (error) {
      this.logger.warn('Error during origin validation, skipping wallet', {
        walletId: wallet.id,
        error,
      });
      return true; // Fail closed
    }
  }

  // Chain conversion methods moved to discoveryMappings.ts

  private setupDiscoveryEventHandlers(): void {
    if (!this.eventWrapper) return;

    // Setup event handlers from the event wrapper
    this.eventWrapper.addEventListener((event) => {
      switch (event.type) {
        case 'wallet_found': {
          // Skip wallets that are missing essential fields
          if (!event.wallet.name || !event.wallet.rdns) {
            this.logger.warn('Skipping malformed wallet: missing essential fields', {
              walletId: event.wallet.responderId,
              hasName: !!event.wallet.name,
              hasRdns: !!event.wallet.rdns,
            });
            break;
          }

          // Convert and store the qualified wallet
          this.qualifiedWallets.set(event.wallet.responderId, event.wallet);
          const discoveredWallet = this.convertQualifiedWalletToDiscoveredWallet(event.wallet);

          // Apply origin validation if enabled
          this.handleOriginValidationAsync(discoveredWallet);
          break;
        }

        case 'discovery_error':
          this.emit({ type: 'discovery_error', error: event.error });
          break;

        case 'connection_established':
          // Update connection state
          if (this.connectionStateManager) {
            this.connectionStateManager.updateConnectionState(event.walletId, {
              status: 'connected',
              sessionId: event.sessionId,
              connectedAt: Date.now(),
            });
          }
          break;

        case 'connection_failed':
          // Update connection state
          if (this.connectionStateManager) {
            this.connectionStateManager.updateConnectionState(event.walletId, {
              status: 'error',
              error: {
                code: 'CONNECTION_FAILED',
                message: event.error.message,
                recoverable: true,
              },
            });
          }
          break;
      }
    });

    // Setup connection state change handlers
    if (this.connectionStateManager) {
      this.connectionStateManager.onStateChange((event) => {
        this.logger.debug('Connection state changed', event);

        // You can emit additional events here if needed
        // For now, connection state is managed internally
      });
    }
  }

  private convertQualifiedWalletToDiscoveredWallet(qualifiedWallet: QualifiedResponder): DiscoveredWallet {
    // Extract chain types from qualified wallet chains, handle malformed responders
    let chainTypes: ChainType[] = [];
    try {
      // Extract chain types from technologies
      if (qualifiedWallet.matched?.required?.technologies) {
        chainTypes = qualifiedWallet.matched.required.technologies.map((tech: any) => {
          return tech.type as ChainType;
        });
      }
    } catch (error) {
      this.logger.warn('Failed to extract chain types from qualified wallet', {
        walletId: qualifiedWallet.responderId,
        error,
      });
    }

    return {
      id: qualifiedWallet.responderId,
      name: qualifiedWallet.name || 'Unknown Wallet',
      icon: qualifiedWallet.icon || '',
      description: `${qualifiedWallet.name || 'Unknown'} wallet`,
      chains: chainTypes,
      discoveryMethod: 'announced',
      isAvailable: true,
      discoveredAt: Date.now(),
      lastSeen: Date.now(),
      metadata: {
        rdns: qualifiedWallet.rdns,
        capabilities: qualifiedWallet.matched,
        ...qualifiedWallet.metadata,
      },
    };
  }

  // Note: The following methods have been removed as they are replaced by the discovery protocol:
  // - detectInjectedWallets
  // - detectExtensionWallets
  // - setupDynamicDetection
  // The discovery protocol handles all wallet detection through its cross-origin messaging system

  private async performDiscovery(): Promise<DiscoveredWallet[]> {
    this.logger.debug('Performing discovery scan', { attempt: this.discoveryAttempts + 1 });

    // Check rate limit if enabled
    if (this.rateLimiter && typeof window !== 'undefined') {
      const origin = window.location.origin;
      const rateLimitResult = this.rateLimiter.check(origin, 'discovery');

      if (!rateLimitResult.allowed) {
        throw ErrorFactory.configurationError('Rate limit exceeded', {
          reason: rateLimitResult.reason,
          retryAfterMs: rateLimitResult.retryAfterMs,
        });
      }
    }

    this.discoveryAttempts++;
    const startTime = Date.now();

    try {
      // Clear qualified wallets for fresh discovery
      this.qualifiedWallets.clear();

      if (this.eventWrapper) {
        // Use the event wrapper for discovery
        this.logger.debug('Using event wrapper path for discovery');
        // Start discovery with event wrapper
        const qualifiedWallets = await this.eventWrapper.startDiscovery();

        // Store qualified wallets and convert to discovered format
        for (const wallet of qualifiedWallets) {
          if (!wallet.responderId) {
            this.logger.warn('Skipping malformed wallet: missing responderId', { wallet });
            continue;
          }

          // Skip wallets that are missing essential fields
          if (!wallet.name || !wallet.rdns) {
            this.logger.warn('Skipping malformed wallet: missing essential fields', {
              walletId: wallet.responderId,
              hasName: !!wallet.name,
              hasRdns: !!wallet.rdns,
            });
            continue;
          }

          try {
            // Validate the qualified responder before processing
            const validatedWallet = safeValidateQualifiedResponder(wallet);

            if (!validatedWallet) {
              this.logger.warn('Skipping invalid discovery response', {
                walletId: wallet.responderId,
                reason: 'Failed validation',
              });
              continue;
            }

            // Store in both maps for compatibility
            this.qualifiedWallets.set(wallet.responderId, validatedWallet);
            this.discoveredResponders.set(wallet.responderId, validatedWallet);

            const discoveredWallet = this.convertQualifiedWalletToDiscoveredWallet(validatedWallet);

            // Apply origin validation if enabled
            this.logger.debug('Checking origin validation for wallet', { walletId: wallet.responderId });
            if (await this.shouldSkipWalletDueToOriginValidation(discoveredWallet)) {
              this.logger.debug('Skipping wallet due to origin validation failure', {
                walletId: wallet.responderId,
              });
              continue;
            }

            this.logger.debug('Adding wallet to discovered wallets', { walletId: wallet.responderId });
            this.updateDiscoveredWallet(discoveredWallet);

            // Emit enhanced discovery event with transport data
            this.emitEnhanced({ type: 'wallet_discovered_with_transport', wallet: validatedWallet });

            // Log transport configuration if available
            if (validatedWallet.transportConfig) {
              this.logger.debug('Found transport configuration', {
                walletId: wallet.responderId,
                transportType: validatedWallet.transportConfig.type,
                extensionId: validatedWallet.transportConfig.extensionId,
              });

              this.emitEnhanced({
                type: 'transport_extracted',
                walletId: wallet.responderId,
                transportType: validatedWallet.transportConfig.type,
              });
            }

            // Store qualified wallet in connection state for future connections
            if (this.connectionStateManager) {
              this.connectionStateManager.updateConnectionState(wallet.responderId, {
                status: 'disconnected',
                qualifiedWallet: validatedWallet,
              });
            }
          } catch (error) {
            this.logger.error('Failed to process qualified wallet', {
              walletId: wallet.responderId,
              error,
            });
          }
        }
      } else if (this.discoveryInitiator) {
        // Fallback to direct discovery protocol usage
        this.logger.debug('Using discovery listener path for discovery');
        // Start discovery with configured requirements
        const qualifiedWallets = await this.discoveryInitiator.startDiscovery();

        // Store qualified wallets and convert to discovered format
        for (const wallet of qualifiedWallets) {
          if (!wallet.responderId) {
            this.logger.warn('Skipping malformed wallet: missing responderId', { wallet });
            continue;
          }

          // Skip wallets that are missing essential fields
          if (!wallet.name || !wallet.rdns) {
            this.logger.warn('Skipping malformed wallet: missing essential fields', {
              walletId: wallet.responderId,
              hasName: !!wallet.name,
              hasRdns: !!wallet.rdns,
            });
            continue;
          }

          try {
            // Validate the qualified responder before processing
            const validatedWallet = safeValidateQualifiedResponder(wallet);

            if (!validatedWallet) {
              this.logger.warn('Skipping invalid discovery response (listener path)', {
                walletId: wallet.responderId,
                reason: 'Failed validation',
              });
              continue;
            }

            // Store in both maps for compatibility
            this.qualifiedWallets.set(wallet.responderId, validatedWallet);
            this.discoveredResponders.set(wallet.responderId, validatedWallet);

            const discoveredWallet = this.convertQualifiedWalletToDiscoveredWallet(validatedWallet);

            // Apply origin validation if enabled
            this.logger.debug('Checking origin validation for wallet (listener path)', {
              walletId: wallet.responderId,
            });
            if (await this.shouldSkipWalletDueToOriginValidation(discoveredWallet)) {
              this.logger.debug('Skipping wallet due to origin validation failure (listener path)', {
                walletId: wallet.responderId,
              });
              continue;
            }

            this.logger.debug('Adding wallet to discovered wallets (listener path)', {
              walletId: wallet.responderId,
            });
            this.updateDiscoveredWallet(discoveredWallet);

            // Emit enhanced discovery event with transport data
            this.emitEnhanced({ type: 'wallet_discovered_with_transport', wallet: validatedWallet });

            // Log transport configuration if available
            if (validatedWallet.transportConfig) {
              this.logger.debug('Found transport configuration (listener path)', {
                walletId: wallet.responderId,
                transportType: validatedWallet.transportConfig.type,
                extensionId: validatedWallet.transportConfig.extensionId,
              });

              this.emitEnhanced({
                type: 'transport_extracted',
                walletId: wallet.responderId,
                transportType: validatedWallet.transportConfig.type,
              });
            }
          } catch (error) {
            this.logger.error('Failed to process qualified wallet', {
              walletId: wallet.responderId,
              error,
            });
          }
        }
      }

      // Also check registry wallets (for non-discovery protocol wallets)
      await this.discoverRegistryWallets();

      const discoveredWallets = this.getDiscoveredWallets();
      const duration = Date.now() - startTime;

      this.logger.info('Discovery scan completed', {
        walletCount: discoveredWallets.length,
        availableCount: discoveredWallets.filter((w) => w.isAvailable).length,
        duration,
        attempt: this.discoveryAttempts,
      });

      this.emit({
        type: 'discovery_completed',
        wallets: discoveredWallets,
      });

      return discoveredWallets;
    } catch (error) {
      this.logger.error('Discovery scan failed', error);
      throw error;
    }
  }

  private async discoverRegistryWallets(): Promise<void> {
    // Check wallets from the registry for availability
    const registryAdapters = this.registry.getAllAdapters();

    for (const adapter of registryAdapters) {
      try {
        const isAvailable = await this.checkAdapterAvailability(adapter);

        const discoveredWallet: DiscoveredWallet = {
          id: adapter.id,
          name: adapter.metadata.name,
          icon: adapter.metadata.icon,
          description: adapter.metadata.description || '',
          chains: adapter.capabilities.chains.map((c) => c.type as ChainType),
          discoveryMethod: 'manual',
          isAvailable,
          discoveredAt: Date.now(),
          lastSeen: Date.now(),
          metadata: {
            fromRegistry: true,
            capabilities: adapter.capabilities,
          },
        };

        this.updateDiscoveredWallet(discoveredWallet);
      } catch (error) {
        this.logger.error(`Failed to check registry wallet ${adapter.id}`, error);
      }
    }
  }

  // Note: discoverInjectedWallets and discoverAnnouncedWallets are now handled by the discovery protocol

  private async checkAdapterAvailability(adapter: { id: string }): Promise<boolean> {
    try {
      // This would use adapter-specific availability checks
      // For now, just check if it's a known injected wallet
      if (typeof window !== 'undefined') {
        const commonChecks: Record<string, () => boolean> = {
          metamask: () => {
            const ethereum = (window as { ethereum?: { isMetaMask?: boolean } }).ethereum;
            return !!ethereum?.isMetaMask;
          },
          phantom: () => {
            const solana = (window as { solana?: { isPhantom?: boolean } }).solana;
            return !!solana?.isPhantom;
          },
          coinbase: () => {
            // Check both EVM and Solana Coinbase providers
            const ethereum = (window as { ethereum?: { isCoinbaseWallet?: boolean } }).ethereum;
            const coinbaseSolana = (window as { coinbaseSolana?: { isCoinbaseWallet?: boolean } })
              .coinbaseSolana;

            // More robust check: verify the wallet is actually functional
            if (ethereum?.isCoinbaseWallet) {
              // Verify EVM Coinbase wallet has required methods
              return typeof (ethereum as { request?: unknown }).request === 'function';
            }

            if (coinbaseSolana?.isCoinbaseWallet) {
              // Verify Solana Coinbase wallet has required methods
              return typeof (coinbaseSolana as { connect?: unknown }).connect === 'function';
            }

            return false;
          },
        };

        const check = commonChecks[adapter.id];
        return check ? check() : false;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to check availability for ${adapter.id}`, error);
      return false;
    }
  }

  private async checkWalletAvailability(walletId: string): Promise<DiscoveredWallet | null> {
    const existing = this.discoveredWallets.get(walletId);
    if (!existing) return null;

    try {
      // Re-check availability based on discovery method
      let isAvailable = false;

      switch (existing.discoveryMethod) {
        case 'injected':
          isAvailable = await this.checkInjectedWalletAvailability(walletId);
          break;
        case 'extension':
          isAvailable = await this.checkExtensionWalletAvailability(walletId);
          break;
        case 'announced':
          isAvailable = await this.checkAnnouncedWalletAvailability(walletId);
          break;
        case 'manual': {
          const adapter = this.registry.getAdapter(walletId);
          isAvailable = adapter ? await this.checkAdapterAvailability(adapter) : false;
          break;
        }
      }

      return {
        ...existing,
        isAvailable,
        lastSeen: Date.now(),
      };
    } catch (error) {
      this.logger.error(`Failed to check wallet availability for ${walletId}`, error);
      return null;
    }
  }

  private async checkInjectedWalletAvailability(walletId: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const checks: Record<string, () => boolean> = {
      metamask: () => {
        const ethereum = (window as { ethereum?: { isMetaMask?: boolean } }).ethereum;
        return !!ethereum?.isMetaMask;
      },
      phantom: () => {
        const solana = (window as { solana?: { isPhantom?: boolean } }).solana;
        return !!solana?.isPhantom;
      },
      coinbase: () => {
        // Check both EVM and Solana Coinbase providers
        const ethereum = (window as { ethereum?: { isCoinbaseWallet?: boolean } }).ethereum;
        const coinbaseSolana = (window as { coinbaseSolana?: { isCoinbaseWallet?: boolean } }).coinbaseSolana;

        // More robust check: verify the wallet is actually functional
        if (ethereum?.isCoinbaseWallet) {
          // Verify EVM Coinbase wallet has required methods
          return typeof (ethereum as { request?: unknown }).request === 'function';
        }

        if (coinbaseSolana?.isCoinbaseWallet) {
          // Verify Solana Coinbase wallet has required methods
          return typeof (coinbaseSolana as { connect?: unknown }).connect === 'function';
        }

        return false;
      },
    };

    const check = checks[walletId];
    return check ? check() : false;
  }

  private async checkExtensionWalletAvailability(walletId: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const wallet = this.discoveredWallets.get(walletId);
    if (!wallet || !wallet.metadata) return false;

    try {
      // Check if this is a Chrome extension-based wallet
      const transportConfig = wallet.metadata['transportConfig'] as
        | { type: string; extensionId?: string }
        | undefined;
      if (transportConfig?.type !== 'extension' || !transportConfig.extensionId) {
        this.logger.debug('Wallet is not an extension or missing extension ID', { walletId });
        return false;
      }

      // Define Chrome runtime port interface
      interface ChromeRuntimePort {
        disconnect(): void;
        onMessage: { addListener(callback: (message: unknown) => void): void };
        onDisconnect: { addListener(callback: () => void): void };
        postMessage(message: unknown): void;
      }

      // Check if Chrome extension APIs are available
      const chromeWindow = window as {
        chrome?: {
          runtime?: {
            connect?: (extensionId: string) => ChromeRuntimePort | null;
            lastError?: { message: string };
          };
        };
      };

      if (!chromeWindow.chrome?.runtime?.connect) {
        this.logger.debug('Chrome extension APIs not available', { walletId });
        return false;
      }

      // Ensure extensionId is defined
      if (!transportConfig.extensionId) {
        this.logger.debug('Extension ID is undefined', { walletId });
        return false;
      }

      const extensionId = transportConfig.extensionId;

      // Try to connect to the extension to check if it's installed and responsive
      return new Promise((resolve) => {
        try {
          // Attempt connection with a short timeout
          const connectFunction = chromeWindow.chrome?.runtime?.connect;
          if (!connectFunction) {
            this.logger.debug('Connect function not available', { walletId });
            resolve(false);
            return;
          }

          const port = connectFunction(extensionId);

          if (!port) {
            this.logger.debug('Failed to create port connection to extension', { walletId, extensionId });
            resolve(false);
            return;
          }

          // Set up timeout to avoid hanging
          const timeout = setTimeout(() => {
            port.disconnect();
            this.logger.debug('Extension connection timeout', { walletId, extensionId });
            resolve(false);
          }, 1000);

          // Listen for connection establishment
          port.onMessage.addListener(() => {
            clearTimeout(timeout);
            port.disconnect();
            resolve(true);
          });

          // Listen for disconnect events
          port.onDisconnect.addListener(() => {
            clearTimeout(timeout);
            // Check if there was an error during connection
            const chromeRuntime = chromeWindow.chrome?.runtime;
            if (chromeRuntime?.lastError) {
              this.logger.debug('Extension connection failed', {
                walletId,
                extensionId,
                error: chromeRuntime.lastError.message,
              });
              resolve(false);
            } else {
              // Successful connection that was then closed
              resolve(true);
            }
          });

          // Send a simple ping to test responsiveness
          port.postMessage({ type: 'ping', timestamp: Date.now() });
        } catch (error) {
          this.logger.debug('Extension availability check error', { walletId, error });
          resolve(false);
        }
      });
    } catch (error) {
      this.logger.error(`Failed to check extension wallet availability for ${walletId}`, error);
      return false;
    }
  }

  private async checkAnnouncedWalletAvailability(walletId: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const wallet = this.discoveredWallets.get(walletId);
    if (!wallet) return false;

    try {
      // Check if we have a qualified responder for this wallet
      const qualifiedWallet = this.qualifiedWallets.get(walletId);
      if (!qualifiedWallet) {
        this.logger.debug('No qualified responder found for announced wallet', { walletId });
        return false;
      }

      // For announced wallets, we can check if the metadata indicates recent activity
      const lastSeen = wallet.lastSeen;
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000; // 5 minutes in milliseconds

      // If the wallet was seen recently, consider it available
      if (lastSeen && lastSeen > fiveMinutesAgo) {
        this.logger.debug('Announced wallet seen recently, considering available', {
          walletId,
          lastSeen: new Date(lastSeen).toISOString(),
          ageMinutes: Math.round((now - lastSeen) / (60 * 1000)),
        });
        return true;
      }

      // For announced wallets that haven't been seen recently, we can try a simple
      // responsiveness check via the discovery protocol, but without event listeners
      if (!this.discoveryInitiator) {
        this.logger.debug('Discovery initiator not available for announced wallet check', { walletId });
        // Fall back to checking if we have recent qualified wallet data
        return Boolean(qualifiedWallet.matched);
      }

      try {
        // Create a brief discovery session to test responsiveness
        const responders = await Promise.race([
          this.discoveryInitiator.startDiscovery(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Discovery timeout')), 2000)),
        ]);

        // Check if our specific wallet responded
        const isResponsive = responders.some((r: any) => r.responderId === qualifiedWallet.responderId);
        this.logger.debug('Announced wallet discovery result', {
          walletId,
          isResponsive,
          respondersCount: responders.length,
        });
        return isResponsive;
      } catch (error) {
        this.logger.debug('Discovery check failed, falling back to metadata check', { walletId, error });
        // If discovery fails, fall back to checking if we have valid transport config
        return Boolean(qualifiedWallet.transportConfig);
      }
    } catch (error) {
      this.logger.error(`Failed to check announced wallet availability for ${walletId}`, error);
      return false;
    }
  }

  private updateDiscoveredWallet(wallet: DiscoveredWallet): void {
    this.logger.debug('updateDiscoveredWallet called', { walletId: wallet.id, walletName: wallet.name });
    const existing = this.discoveredWallets.get(wallet.id);

    if (existing) {
      // Update existing wallet
      const updated = { ...existing, ...wallet, lastSeen: Date.now() };
      this.discoveredWallets.set(wallet.id, updated);

      // Emit availability change events
      if (existing.isAvailable !== wallet.isAvailable) {
        if (wallet.isAvailable) {
          this.emit({ type: 'wallet_available', wallet: updated });
        } else {
          this.emit({ type: 'wallet_unavailable', walletId: wallet.id });
        }
      }
    } else {
      // New wallet discovered
      this.discoveredWallets.set(wallet.id, wallet);
      this.emit({ type: 'wallet_discovered', wallet });

      if (wallet.isAvailable) {
        this.emit({ type: 'wallet_available', wallet });
      }
    }

    this.logger.debug('Updated discovered wallet', {
      walletId: wallet.id,
      isAvailable: wallet.isAvailable,
      discoveryMethod: wallet.discoveryMethod,
    });
  }

  private setupPeriodicDiscovery(): void {
    if (this.config.retryInterval <= 0) {
      this.logger.debug('Periodic discovery disabled');
      return;
    }

    this.discoveryTimer = setInterval(async () => {
      if (!this.isRunning) return;

      if (this.config.maxAttempts > 0 && this.discoveryAttempts >= this.config.maxAttempts) {
        this.logger.info('Max discovery attempts reached, stopping periodic discovery');
        if (this.discoveryTimer) {
          clearInterval(this.discoveryTimer);
          this.discoveryTimer = null;
        }
        return;
      }

      try {
        await this.performDiscovery();
      } catch (error) {
        this.logger.error('Periodic discovery failed', error);
      }
    }, this.config.retryInterval);

    this.logger.debug('Periodic discovery setup', {
      intervalMs: this.config.retryInterval,
      maxAttempts: this.config.maxAttempts,
    });
  }

  /**
   * Handle origin validation asynchronously without blocking the event handler
   */
  private handleOriginValidationAsync(discoveredWallet: DiscoveredWallet): void {
    this.shouldSkipWalletDueToOriginValidation(discoveredWallet)
      .then((shouldSkip) => {
        if (!shouldSkip) {
          this.updateDiscoveredWallet(discoveredWallet);
        }
      })
      .catch((error) => {
        this.logger.error('Error during origin validation in event handler', {
          walletId: discoveredWallet.id,
          error,
        });
        // In case of validation error, skip the wallet for security
        // This ensures we fail closed rather than potentially adding an invalid wallet
      });
  }

  private async cleanupDiscoveryComponents(): Promise<void> {
    this.logger.debug('Cleaning up discovery components');

    // Remove all event listeners to prevent memory leaks
    for (const removeListener of this.eventListeners) {
      try {
        removeListener();
      } catch (error) {
        this.logger.warn('Error removing event listener during cleanup', error);
      }
    }
    this.eventListeners.clear();

    // Clear the EventTarget to ensure no listeners remain
    // Create a new EventTarget to completely reset the event system
    // @ts-expect-error - accessing private readonly property for cleanup
    (this as { eventTarget: EventTarget }).eventTarget = new EventTarget();

    // Stop event wrapper discovery if in progress
    if (this.eventWrapper) {
      await this.eventWrapper.stopDiscovery();
      this.eventWrapper = null;
    }

    if (this.discoveryInitiator) {
      // Stop discovery if in progress
      if (this.discoveryInitiator.isDiscovering()) {
        await this.discoveryInitiator.stopDiscovery();
      }

      // Cleanup initiator
      // Discovery initiator doesn't have a destroy method - it's cleaned up when references are dropped
      this.discoveryInitiator = null;
    }

    if (this.connectionManager) {
      // Cleanup connection manager
      // Connection manager doesn't have a destroy method - it's cleaned up when references are dropped
      this.connectionManager = null;
    }

    // Clear connection states
    if (this.connectionStateManager) {
      this.connectionStateManager.clearAllConnectionStates();
      this.connectionStateManager = null;
    }

    // Clear all discovery data
    this.qualifiedWallets.clear();
    this.discoveredResponders.clear();

    // Clean up adapters
    for (const adapter of this.walletAdapters.values()) {
      try {
        await adapter.disconnect();
      } catch (error) {
        this.logger.error('Failed to disconnect adapter during cleanup', error);
      }
    }
    this.walletAdapters.clear();
    this.discoveredAdapters.clear();

    // Cleanup security components
    if (this.sessionSecurityManager) {
      this.sessionSecurityManager.destroy();
      this.sessionSecurityManager = null;
    }

    if (this.rateLimiter) {
      this.rateLimiter.destroy();
      this.rateLimiter = null;
    }

    this.originValidator = null;
  }

  // inferChainSupport method removed - no longer needed with discovery protocol

  /**
   * Update chain configuration for discovery
   * @private
   */
  private async updateChainConfiguration(chainTypes: ChainType[]): Promise<void> {
    // This would update the discovery service configuration
    // to filter for specific chain types
    this.logger.debug('Updating chain configuration', { chainTypes });

    // The discovery service already supports chain filtering
    // through the capability requirements
  }

  /**
   * Emit enhanced discovery event
   * @private
   */
  private emitEnhanced(event: EnhancedDiscoveryEvent): void {
    if (this.isDestroyed) {
      this.logger.debug('Skipping enhanced event emission - service destroyed', { type: event.type });
      return;
    }
    this.enhancedEventTarget.dispatchEvent(new CustomEvent('enhanced-discovery-event', { detail: event }));
  }

  private emit(event: DiscoveryEvent): void {
    if (this.isDestroyed) {
      this.logger.debug('Skipping event emission - service destroyed', { type: event.type });
      return;
    }
    this.logger.debug('Emitting event', { type: event.type, listenerCount: this.eventListeners.size });
    this.eventTarget.dispatchEvent(new CustomEvent('discovery-event', { detail: event }));
  }
}

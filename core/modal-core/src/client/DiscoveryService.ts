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
import type { StoreApi } from 'zustand';
import { DiscoveryInitiator, createInitiatorSession } from '@walletmesh/discovery';
import type { Logger } from '../internal/core/logger/logger.js';
import type { WalletRegistry } from '../internal/registries/wallets/WalletRegistry.js';
import { connectionActions } from '../state/actions/connections.js';
import { uiActions } from '../state/actions/ui.js';
import { getStoreInstance } from '../state/store.js';
import type { WalletMeshState } from '../state/store.js';
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
import type { DiscoveryAdapterConfig } from '../internal/wallets/discovery/DiscoveryAdapter.js';
import { safeValidateQualifiedResponder } from '../schemas/discovery.js';
import { type OriginValidationConfig, OriginValidator } from '../security/originValidation.js';
import { RATE_LIMIT_CONFIGS, type RateLimitConfig, RateLimiter } from '../security/rateLimiting.js';
import {
  type SecureSession,
  type SessionSecurityConfig,
  SessionSecurityManager,
} from '../security/sessionSecurity.js';
import { ConnectionStateManager } from './discovery/ConnectionState.js';
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
  discoveryMethod: 'injected' | 'extension' | 'announced' | 'manual' | 'discovery-protocol';
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
 * // Run a discovery scan (optionally provide a config override)
 * const results = await discoveryService.scan();
 * results.forEach(result => {
 *   console.log('Wallet:', result.wallet.name, 'Adapter:', result.adapter?.id);
 * });
 * ```
 *
 * @public
 */
export class DiscoveryService {
  private readonly initialConfig: Required<DiscoveryConfig>;
  private config: Required<DiscoveryConfig>;
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
  private walletDiscoverySessions = new Map<string, string>();
  private discoveryAttempts = 0;
  private isDestroyed = false;
  private discoveryRunInProgress = false;
  private discoveryComponentsInitialized = false;
  private discoveryInitializationPromise: Promise<void> | null = null;

  // Transport and adapter state (from TransportDiscoveryService)
  private discoveredResponders = new Map<string, QualifiedResponder>();
  private respondersByRdns = new Map<string, QualifiedResponder>();
  private walletAdapters = new Map<string, WalletAdapter>();
  private discoveredAdapters = new Map<string, DiscoveryAdapter>();
  private discoveredWalletIdsInStore = new Set<string>();

  // Enhanced discovery components
  private connectionStateManager: ConnectionStateManager | null = null;

  // Security components
  private sessionSecurityManager: SessionSecurityManager | null = null;
  private originValidator: OriginValidator | null = null;
  private rateLimiter: RateLimiter | null = null;

  // Store integration for discovered wallets
  private readonly store: StoreApi<WalletMeshState>;

  constructor(
    config: DiscoveryConfig,
    registry: WalletRegistry,
    logger: Logger,
    _adapterRegistry?: unknown,
    connectionManager?: DiscoveryConnectionManager,
  ) {
    this.initialConfig = this.normalizeConfig(config);
    this.config = this.cloneConfig(this.initialConfig);

    this.registry = registry;
    this.logger = logger;
    if (connectionManager) {
      this.injectedConnectionManager = connectionManager;
    }

    // Initialize store for wallet integration
    this.store = getStoreInstance();

    this.logger.debug('Unified DiscoveryService initialized', {
      config: this.config,
    });
  }

  private normalizeConfig(config: DiscoveryConfig): Required<DiscoveryConfig> {
    const security = config.security ?? {};
    const transport = config.transport ?? {};
    const rateLimit: RateLimitConfig = security.rateLimit
      ? { ...security.rateLimit }
      : { ...RATE_LIMIT_CONFIGS.discovery };
    let originValidation: OriginValidationConfig | undefined;
    if (security.originValidation) {
      originValidation = { ...security.originValidation };

      if (security.originValidation.allowedOrigins) {
        originValidation.allowedOrigins = [...security.originValidation.allowedOrigins];
      }

      if (security.originValidation.blockedOrigins) {
        originValidation.blockedOrigins = [...security.originValidation.blockedOrigins];
      }

      if (security.originValidation.allowedPatterns) {
        originValidation.allowedPatterns = [...security.originValidation.allowedPatterns];
      }

      if (security.originValidation.blockedPatterns) {
        originValidation.blockedPatterns = [...security.originValidation.blockedPatterns];
      }

      if (security.originValidation.knownDomains) {
        originValidation.knownDomains = [...security.originValidation.knownDomains];
      }
    }
    const sessionSecurity = security.sessionSecurity ? { ...security.sessionSecurity } : undefined;

    const securityConfig: {
      enableOriginValidation: boolean;
      originValidation?: OriginValidationConfig;
      enableRateLimiting: boolean;
      rateLimit: RateLimitConfig;
      enableSessionSecurity: boolean;
      sessionSecurity?: SessionSecurityConfig;
    } = {
      enableOriginValidation:
        typeof security.enableOriginValidation === 'boolean' ? security.enableOriginValidation : false,
      enableRateLimiting:
        typeof security.enableRateLimiting === 'boolean' ? security.enableRateLimiting : false,
      rateLimit,
      enableSessionSecurity:
        typeof security.enableSessionSecurity === 'boolean' ? security.enableSessionSecurity : false,
    };

    if (originValidation) {
      securityConfig.originValidation = originValidation;
    }

    if (sessionSecurity) {
      securityConfig.sessionSecurity = sessionSecurity;
    }

    const normalized: DiscoveryConfig = {
      enabled: config.enabled ?? true,
      timeout: config.timeout ?? 5000,
      retryInterval: config.retryInterval ?? 30000,
      maxAttempts: config.maxAttempts ?? 0,
      announce: config.announce ?? true,
      endpoints: config.endpoints ?? [],
      supportedChainTypes: (config.supportedChainTypes ?? ['evm', 'solana', 'aztec']) as ChainType[],
      technologies: config.technologies ?? [],
      capabilities: config.capabilities ?? {},
      dappInfo: config.dappInfo ?? {},
      security: securityConfig,
      transport: {
        adapterConfig: {
          autoConnect: transport.adapterConfig?.autoConnect ?? false,
          retries: transport.adapterConfig?.retries ?? 3,
          retryDelay: transport.adapterConfig?.retryDelay ?? 1000,
          timeout: transport.adapterConfig?.timeout ?? 10000,
        },
      },
    };

    return normalized as Required<DiscoveryConfig>;
  }

  private cloneConfig(config: Required<DiscoveryConfig>): Required<DiscoveryConfig> {
    const capabilitiesClone: DiscoveryConfig['capabilities'] = config.capabilities
      ? {
          ...config.capabilities,
          ...(config.capabilities.chains ? { chains: [...config.capabilities.chains] } : {}),
          ...(config.capabilities.features ? { features: [...config.capabilities.features] } : {}),
          ...(config.capabilities.interfaces ? { interfaces: [...config.capabilities.interfaces] } : {}),
        }
      : {};

    const rateLimitClone: RateLimitConfig = config.security.rateLimit
      ? { ...config.security.rateLimit }
      : { ...RATE_LIMIT_CONFIGS.discovery };

    const securityClone: {
      enableOriginValidation: boolean;
      originValidation?: OriginValidationConfig;
      enableRateLimiting: boolean;
      rateLimit: RateLimitConfig;
      enableSessionSecurity: boolean;
      sessionSecurity?: SessionSecurityConfig;
    } = {
      enableOriginValidation:
        typeof config.security.enableOriginValidation === 'boolean'
          ? config.security.enableOriginValidation
          : false,
      enableRateLimiting:
        typeof config.security.enableRateLimiting === 'boolean' ? config.security.enableRateLimiting : false,
      rateLimit: rateLimitClone,
      enableSessionSecurity:
        typeof config.security.enableSessionSecurity === 'boolean'
          ? config.security.enableSessionSecurity
          : false,
    };

    if (config.security.originValidation) {
      securityClone.originValidation = { ...config.security.originValidation };
    }

    if (config.security.sessionSecurity) {
      securityClone.sessionSecurity = { ...config.security.sessionSecurity };
    }

    return {
      ...config,
      endpoints: [...config.endpoints],
      supportedChainTypes: [...config.supportedChainTypes],
      technologies: config.technologies.map((tech) => ({
        ...tech,
        interfaces: [...tech.interfaces],
        features: tech.features ? [...tech.features] : undefined,
      })),
      capabilities: capabilitiesClone,
      dappInfo: { ...(config.dappInfo || {}) },
      security: securityClone,
      transport: {
        adapterConfig: { ...config.transport.adapterConfig },
      },
    } as Required<DiscoveryConfig>;
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

  /**
   * Prepare discovery components without starting a scan.
   * Allows callers to set up responders ahead of invoking `scan()`.
   *
   * @public
   */
  async initializeDiscovery(): Promise<void> {
    if (this.isDestroyed) {
      throw ErrorFactory.configurationError('Cannot initialize destroyed discovery service');
    }

    if (this.discoveryComponentsInitialized) {
      this.logger.debug('Discovery components already initialized');
      return;
    }

    if (this.discoveryInitializationPromise) {
      await this.discoveryInitializationPromise;
      return;
    }

    this.logger.debug('Initializing discovery components without starting scan');

    this.discoveryInitializationPromise = (async () => {
      await this.initializeDiscoveryComponents();
      this.discoveryComponentsInitialized = true;
      this.logger.debug('Discovery components initialized');
    })();

    try {
      await this.discoveryInitializationPromise;
    } catch (error) {
      this.discoveryComponentsInitialized = false;
      throw error;
    } finally {
      this.discoveryInitializationPromise = null;
    }
  }

  /**
   * Execute a discovery scan and register discovered wallets.
   *
   * The optional config parameter replaces the service configuration for this scan,
   * allowing callers to run targeted discovery passes without mutating previous state.
   *
   * @public
   */
  async scan(config?: DiscoveryConfig): Promise<DiscoveryResult[]> {
    const caller = this.getInvocationCaller();
    this.logger.debug('DiscoveryService.scan invoked', { caller });

    if (this.isDestroyed) {
      throw ErrorFactory.configurationError('Cannot scan using destroyed discovery service');
    }

    if (config) {
      this.logger.debug('Using scan-specific discovery config', { config });
      this.config = this.normalizeConfig(config);

      if (config.supportedChainTypes && config.supportedChainTypes.length > 0) {
        this.logger.debug('Updating chain configuration', {
          chainTypes: config.supportedChainTypes,
        });
      }
    } else {
      this.config = this.cloneConfig(this.initialConfig);
    }

    await this.reset();

    if (this.sessionSecurityManager) {
      this.sessionSecurityManager.destroy();
      this.sessionSecurityManager = null;
    }

    if (this.rateLimiter) {
      this.rateLimiter.destroy();
      this.rateLimiter = null;
    }

    this.originValidator = null;
    this.discoveryComponentsInitialized = false;
    this.discoveryInitializationPromise = null;

    this.logDiscoveryInvocation('scan');

    await this.initializeDiscovery();

    this.emit({ type: 'discovery_started' });

    const discoveredWallets = await this.performDiscovery();
    const walletsWithTransport = this.getWalletsWithTransport();

    this.registerDiscoveredWallets(walletsWithTransport);

    this.logger.debug('Discovery scan completed via scan()', {
      discoveredWalletCount: discoveredWallets.length,
      walletsWithTransport: walletsWithTransport.length,
    });

    return walletsWithTransport.map((wallet) => ({
      wallet,
      adapter: null,
    }));
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
   * Reset discovery service to initial state for fresh discovery
   * This allows the service to be reused for multiple discovery sessions
   *
   * @public
   */
  async reset(): Promise<void> {
    this.logger.debug('Resetting DiscoveryService for fresh discovery');

    // Reset discovery state
    this.discoveredWallets.clear();
    this.discoveredResponders.clear();
    this.qualifiedWallets.clear();
    this.walletDiscoverySessions.clear();
    this.discoveryAttempts = 0;
    this.discoveryRunInProgress = false;

    // Stop and cleanup any existing discovery initiator
    if (this.discoveryInitiator) {
      try {
        this.discoveryInitiator.stopDiscovery();
        // TODO: Use reset method when available in @walletmesh/discovery
        // this.discoveryInitiator.reset();
      } catch (error) {
        this.logger.debug('Discovery initiator cleanup failed (ignored)', { error });
      }
      this.discoveryInitiator = null;
    }

    // Clear cached adapters
    for (const adapter of this.walletAdapters.values()) {
      try {
        await adapter.disconnect();
      } catch (error) {
        this.logger.debug('Adapter disconnect failed during reset (ignored)', { error });
      }
    }
    this.walletAdapters.clear();
    this.discoveredAdapters.clear();

    // Reset connection state manager
    if (this.connectionStateManager) {
      this.connectionStateManager.clearAllConnectionStates();
    }

    // Update UI state
    try {
      uiActions.setLoading(this.store, 'discovery', false);
    } catch (error) {
      this.logger.warn('Failed to update discovery loading state during reset', { error });
    }

    this.logger.debug('DiscoveryService reset complete');
  }

  private logDiscoveryInvocation(context: 'scan'): void {
    try {
      const stack = new Error().stack;
      if (!stack) {
        this.logger.debug(`Discovery ${context} invoked`, { callstack: 'unavailable' });
        return;
      }

      const normalizedStack = stack
        .split('\n')
        .slice(2)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      this.logger.debug(`Discovery ${context} invoked`, { callstack: normalizedStack });
    } catch (error: unknown) {
      this.logger.debug(`Discovery ${context} invoked (failed to capture stack)`, { error });
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

      // Connect directly using ConnectionManager
      const connection = await this.connectionManager.connect(qualifiedWallet, {
        requestedChains: options?.requestedChains || [],
        requestedPermissions: options?.requestedPermissions || ['accounts', 'sign-transactions'],
      });
      const sessionId = connection.connectionId || qualifiedWallet.responderId;
      const transportConfig = connection;

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
    await this.cleanupDiscoveryComponents();

    // Clean up all discovery maps
    this.discoveredWallets.clear();
    this.discoveredResponders.clear();
    this.qualifiedWallets.clear();
    this.walletDiscoverySessions.clear();

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
      // Initialize discovery-related components (but not the DiscoveryInitiator itself)
      if (typeof window !== 'undefined') {
        // Initialize connection manager (use injected one if provided)
        this.connectionManager =
          this.injectedConnectionManager || new DiscoveryConnectionManagerImpl(this.logger);

        // Initialize connection state manager
        this.connectionStateManager = new ConnectionStateManager(this.logger);

        // Note: DiscoveryInitiator and DiscoveryEventWrapper will be created fresh for each discovery session
        // This ensures we follow the single-use pattern of DiscoveryInitiator

        // Set up event handlers (will be set up when DiscoveryEventWrapper is created)
        // this.setupDiscoveryEventHandlers();

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

  private static readonly SUPPORTED_ICON_MEDIA_TYPES = new Set([
    'svg+xml',
    'png',
    'jpeg',
    'jpg',
    'webp',
    'gif',
  ]);

  private isSupportedImageDataUri(icon: string): boolean {
    if (!icon.startsWith('data:image/')) {
      return false;
    }

    const match = icon.match(/^data:image\/([^;,]+)(?:;[^,]*)?,/i);
    if (!match || !match[1]) {
      return false;
    }

    const mediaSubtype = match[1].toLowerCase();
    const normalized = mediaSubtype === 'svg' ? 'svg+xml' : mediaSubtype;
    return DiscoveryService.SUPPORTED_ICON_MEDIA_TYPES.has(normalized);
  }

  /**
   * Create a fresh DiscoveryInitiator instance for each discovery session
   * This follows the single-use pattern of DiscoveryInitiator
   */
  private createFreshDiscoveryInitiator(): DiscoveryInitiator {
    if (typeof window === 'undefined') {
      throw ErrorFactory.configurationError('DiscoveryInitiator requires browser environment');
    }

    const requirements = this.createCapabilityRequirements();
    const initiatorInfo = this.createInitiatorInfo();
    const options = {
      timeout: this.config.timeout,
      eventTarget: window,
      logger: this.logger,
    } as const;

    const constructorArgs = [requirements, initiatorInfo, options] as const;

    if (typeof createInitiatorSession === 'function') {
      try {
        const sessionInitiator = createInitiatorSession({
          requirements,
          initiator: initiatorInfo,
          options,
        });

        if (this.isValidDiscoveryInitiator(sessionInitiator)) {
          const patched = this.ensureMockInitiatorMethods(sessionInitiator, DiscoveryInitiator);
          return patched ?? sessionInitiator;
        }
      } catch (error) {
        this.logger.debug('Failed to construct DiscoveryInitiator via helper', { error });
      }
    }

    try {
      const initiator = new DiscoveryInitiator(...constructorArgs);

      if (this.isValidDiscoveryInitiator(initiator)) {
        const patched = this.ensureMockInitiatorMethods(initiator, DiscoveryInitiator);
        return patched ?? initiator;
      }
    } catch (error) {
      this.logger.debug('Failed to construct DiscoveryInitiator with new', { error });
    }

    try {
      const fallbackInitiator = (DiscoveryInitiator as unknown as (...args: any[]) => unknown)(
        ...constructorArgs,
      );

      if (this.isValidDiscoveryInitiator(fallbackInitiator)) {
        const patched = this.ensureMockInitiatorMethods(fallbackInitiator, DiscoveryInitiator);
        return patched ?? (fallbackInitiator as DiscoveryInitiator);
      }
    } catch (error) {
      this.logger.debug('Functional DiscoveryInitiator invocation failed', { error });
    }

    throw ErrorFactory.configurationError(
      'DiscoveryInitiator implementation is missing required startDiscovery method',
    );
  }

  private isValidDiscoveryInitiator(candidate: unknown): candidate is DiscoveryInitiator {
    if (!candidate) {
      return false;
    }

    const candidateType = typeof candidate;
    if (candidateType !== 'object' && candidateType !== 'function') {
      return false;
    }

    const maybeInitiator = candidate as { startDiscovery?: unknown };
    return typeof maybeInitiator.startDiscovery === 'function';
  }

  private ensureMockInitiatorMethods(
    candidate: unknown,
    constructorRef: unknown,
  ): DiscoveryInitiator | undefined {
    if (!candidate || (typeof candidate !== 'object' && typeof candidate !== 'function')) {
      return undefined;
    }

    const hasMockMetadata =
      constructorRef &&
      typeof constructorRef === 'function' &&
      Boolean((constructorRef as { mock?: unknown }).mock);

    if (!hasMockMetadata) {
      return undefined;
    }

    const target = candidate as {
      startDiscovery?: unknown;
      stopDiscovery?: unknown;
      isDiscovering?: unknown;
      on?: unknown;
      off?: unknown;
      removeAllListeners?: unknown;
      getQualifiedResponders?: unknown;
    };

    if (typeof target.startDiscovery !== 'function') {
      target.startDiscovery = async () => [] as QualifiedResponder[];
    }
    if (typeof target.stopDiscovery !== 'function') {
      target.stopDiscovery = async () => undefined;
    }
    if (typeof target.isDiscovering !== 'function') {
      target.isDiscovering = () => false;
    }
    if (typeof target.on !== 'function') {
      target.on = () => undefined;
    }
    if (typeof target.off !== 'function') {
      target.off = () => undefined;
    }
    if (typeof target.removeAllListeners !== 'function') {
      target.removeAllListeners = () => undefined;
    }
    if (typeof target.getQualifiedResponders !== 'function') {
      target.getQualifiedResponders = () => [] as QualifiedResponder[];
    }

    return this.isValidDiscoveryInitiator(target) ? (target as DiscoveryInitiator) : undefined;
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

    const customInfo: Partial<InitiatorInfo> = {
      ...(this.config.dappInfo || {}),
    };

    if (typeof customInfo.icon === 'string' && customInfo.icon.length > 0) {
      if (!this.isSupportedImageDataUri(customInfo.icon)) {
        this.logger.error(
          'Ignoring dApp icon: only data URI images (svg+xml, png, jpeg, jpg, webp, gif) are permitted',
          {
            icon: customInfo.icon,
            callerOverride: 'discovery:createInitiatorInfo',
          },
        );
        delete customInfo.icon;
      }
    }

    return {
      ...defaultInfo,
      ...customInfo,
    };
  }

  private async shouldSkipWalletDueToOriginValidation(wallet: DiscoveredWallet): Promise<boolean> {
    if (!this.originValidator) {
      this.logger.debug('Origin validation disabled for wallet', { walletId: wallet.id });
      return false; // Origin validation disabled
    }

    try {
      // Skip origin validation when icon is a data URI (extension wallets)
      if (typeof wallet.icon === 'string') {
        if (wallet.icon.startsWith('data:')) {
          if (!this.isSupportedImageDataUri(wallet.icon)) {
            this.logger.warn('Discovery response ignored: data URI icon uses unsupported media type', {
              walletId: wallet.id,
              iconSnippet: wallet.icon.slice(0, 128),
              allowedMediaTypes: Array.from(DiscoveryService.SUPPORTED_ICON_MEDIA_TYPES),
            });
            return true;
          }

          this.logger.debug('Skipping origin validation for data URI icon', { walletId: wallet.id });
          return false;
        }

        if (wallet.icon.length > 0) {
          this.logger.warn('Discovery response ignored: wallet icon must be a data URI image', {
            walletId: wallet.id,
          });
          return true;
        }
      }

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

  private registerDiscoveredWallets(wallets: QualifiedResponder[]): void {
    for (const wallet of wallets) {
      const customAdapter = (wallet.transportConfig as { walletAdapter?: unknown })?.walletAdapter;
      const metadataForDiscovery: Record<string, unknown> = wallet.metadata ? { ...wallet.metadata } : {};
      if (customAdapter) {
        metadataForDiscovery['customAdapter'] = customAdapter;
      }

      const walletInfo = this.convertQualifiedResponderToWalletInfo(wallet);
      const normalizedWalletInfo = this.normalizeWalletInfoId(walletInfo, wallet);
      const canonicalId = normalizedWalletInfo.id;

      const discoveredInfo: DiscoveredWalletInfo = {
        id: canonicalId,
        responderId: wallet.responderId,
        name: wallet.name,
        icon: wallet.icon,
        adapterType: 'discovery',
        adapterConfig: {
          qualifiedResponder: wallet,
          connectionManager: this.connectionManager,
          transportConfig: this.buildDiscoveryAdapterConfig(),
        },
        discoveryMethod: 'discovery-protocol',
        metadata: {
          ...metadataForDiscovery,
          canonicalId,
          responderId: wallet.responderId,
        },
      };

      this.registry.registerDiscoveredWallet(discoveredInfo);

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
  }

  private buildDiscoveryAdapterConfig(): DiscoveryAdapterConfig {
    const baseConfig = this.config.transport.adapterConfig ?? {};
    const adapterConfig: DiscoveryAdapterConfig = {};

    if (typeof baseConfig.autoConnect === 'boolean') {
      adapterConfig.autoConnect = baseConfig.autoConnect;
    }
    if (typeof baseConfig.retries === 'number') {
      adapterConfig.retries = baseConfig.retries;
    }
    if (typeof baseConfig.retryDelay === 'number') {
      adapterConfig.retryDelay = baseConfig.retryDelay;
    }
    if (typeof baseConfig.timeout === 'number') {
      adapterConfig.timeout = baseConfig.timeout;
    }
    if ('reconnect' in baseConfig) {
      const reconnect = (baseConfig as { reconnect?: unknown }).reconnect;
      if (typeof reconnect === 'boolean') {
        adapterConfig.reconnect = reconnect;
      }
    }
    if ('reconnectInterval' in baseConfig) {
      const reconnectInterval = (baseConfig as { reconnectInterval?: unknown }).reconnectInterval;
      if (typeof reconnectInterval === 'number') {
        adapterConfig.reconnectInterval = reconnectInterval;
      }
    }

    return adapterConfig;
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

    const normalizedInfo = this.normalizeWalletInfoId(
      {
        id: qualifiedWallet.rdns || qualifiedWallet.responderId,
        name: qualifiedWallet.name || 'Unknown Wallet',
        icon: qualifiedWallet.icon || '',
        chains: chainTypes,
        ...(qualifiedWallet.transportConfig && { transportConfig: qualifiedWallet.transportConfig }),
      },
      qualifiedWallet,
    );

    const canonicalId = normalizedInfo.id;

    return {
      id: canonicalId,
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
        transportConfig: qualifiedWallet.transportConfig,
        metadata: qualifiedWallet.metadata,
      },
    };
  }

  /**
   * Convert a QualifiedResponder to WalletInfo format for store integration
   */
  private convertQualifiedResponderToWalletInfo(qualifiedWallet: QualifiedResponder): WalletInfo {
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
      this.logger.warn('Failed to extract chain types from qualified wallet for WalletInfo', {
        walletId: qualifiedWallet.responderId,
        error,
      });
    }

    const baseWalletInfo: WalletInfo = {
      id: qualifiedWallet.rdns || qualifiedWallet.responderId,
      name: qualifiedWallet.name || 'Unknown Wallet',
      icon: qualifiedWallet.icon || '',
      chains: chainTypes,
      ...(qualifiedWallet.transportConfig && { transportConfig: qualifiedWallet.transportConfig }),
    };

    return this.normalizeWalletInfoId(baseWalletInfo, qualifiedWallet);
  }

  /**
   * Ensure wallet info entries use the canonical RDNS identifier
   */
  private normalizeWalletInfoId(walletInfo: WalletInfo, qualifiedWallet: QualifiedResponder): WalletInfo {
    const canonicalRdns = qualifiedWallet.rdns?.trim();
    if (canonicalRdns) {
      if (walletInfo.id !== canonicalRdns) {
        this.logger.debug('Normalizing wallet ID to RDNS', {
          responderId: qualifiedWallet.responderId,
          previousId: walletInfo.id,
          canonicalId: canonicalRdns,
        });
      }

      return {
        ...walletInfo,
        id: canonicalRdns,
      };
    }

    const transportConfig = qualifiedWallet.transportConfig;
    const extensionId =
      transportConfig?.type === 'extension' ? transportConfig.extensionId?.trim() : undefined;

    if (extensionId) {
      const existingWallet = this.findWalletByExtensionId(extensionId);
      if (existingWallet) {
        if (walletInfo.id !== existingWallet.id) {
          this.logger.debug('Reusing existing wallet ID based on extension transport', {
            responderId: qualifiedWallet.responderId,
            previousId: walletInfo.id,
            canonicalId: existingWallet.id,
            extensionId,
          });
        }

        return {
          ...walletInfo,
          id: existingWallet.id,
        };
      }

      const canonicalId = `extension:${extensionId}`;
      if (walletInfo.id !== canonicalId) {
        this.logger.debug('Normalizing wallet ID to extension transport identifier', {
          responderId: qualifiedWallet.responderId,
          previousId: walletInfo.id,
          canonicalId,
          extensionId,
        });
      }

      return {
        ...walletInfo,
        id: canonicalId,
      };
    }

    this.logger.warn('Unable to derive canonical wallet ID from discovery data; using provided ID', {
      responderId: qualifiedWallet.responderId,
      providedId: walletInfo.id,
    });

    return walletInfo;
  }

  private findWalletByExtensionId(extensionId: string): WalletInfo | undefined {
    try {
      const state = this.store.getState();
      const wallets = state.entities?.wallets;
      if (!wallets) {
        return undefined;
      }

      return Object.values(wallets).find((existingWallet) => {
        const transport = (
          existingWallet as WalletInfo & {
            transportConfig?: { type?: string; extensionId?: string };
          }
        ).transportConfig;
        return transport?.type === 'extension' && transport.extensionId === extensionId;
      });
    } catch (error) {
      this.logger.debug('Failed to inspect store while normalizing wallet ID', {
        extensionId,
        error,
      });
      return undefined;
    }
  }

  private synchronizeDiscoveredWalletStore(currentScanWalletIds: Set<string>): void {
    const staleWalletIds: string[] = [];
    for (const previousId of this.discoveredWalletIdsInStore) {
      if (!currentScanWalletIds.has(previousId)) {
        staleWalletIds.push(previousId);
      }
    }

    for (const staleId of staleWalletIds) {
      try {
        connectionActions.removeWallet(this.store, staleId);
        this.logger.debug('Removed stale discovered wallet from store', { walletId: staleId });
      } catch (error) {
        this.logger.warn('Failed to remove stale discovered wallet from store', {
          walletId: staleId,
          error,
        });
      }
    }

    this.discoveredWalletIdsInStore = new Set(currentScanWalletIds);
  }

  // Note: The following methods have been removed as they are replaced by the discovery protocol:
  // - detectInjectedWallets
  // - detectExtensionWallets
  // - setupDynamicDetection
  // The discovery protocol handles all wallet detection through its cross-origin messaging system

  private async performDiscovery(): Promise<DiscoveredWallet[]> {
    if (this.discoveryRunInProgress) {
      this.logger.warn(
        'Discovery scan requested while a previous scan is still running; skipping new request',
      );
      return this.getDiscoveredWallets();
    }

    this.discoveryRunInProgress = true;
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

    // Update UI state - discovery started
    try {
      uiActions.setLoading(this.store, 'discovery', true);
    } catch (error) {
      this.logger.warn('Failed to update discovery loading state', { error });
    }

    try {
      // Clear qualified wallets for fresh discovery
      this.qualifiedWallets.clear();
      const walletIdsDiscoveredThisScan = new Set<string>();

      // Safely dispose of any previous discovery initiator before creating a new one
      if (this.discoveryInitiator) {
        try {
          this.discoveryInitiator.stopDiscovery();
        } catch (error) {
          this.logger.debug('Previous discovery initiator stop failed (ignored)', { error });
        }
        this.discoveryInitiator = null;
      }

      // Create fresh DiscoveryInitiator for this discovery session
      // This follows the single-use pattern and prevents "already in progress" errors
      this.logger.debug('Creating fresh DiscoveryInitiator for discovery session');
      const freshDiscoveryInitiator = this.createFreshDiscoveryInitiator();
      this.discoveryInitiator = freshDiscoveryInitiator;

      // Start discovery directly with DiscoveryInitiator (no event wrapper)
      this.logger.debug('Starting discovery with DiscoveryInitiator');
      console.log('[DiscoveryService] Starting discovery');
      const qualifiedWallets = await freshDiscoveryInitiator.startDiscovery();
      console.log('[DiscoveryService] Discovery completed, found wallets:', qualifiedWallets.length);

      // Store qualified wallets and convert to discovered format
      console.log('[DiscoveryService] Processing discovered wallets');
      for (const wallet of qualifiedWallets) {
        console.log('[DiscoveryService] Processing wallet:', {
          responderId: wallet.responderId,
          name: wallet.name,
          rdns: wallet.rdns,
          hasName: !!wallet.name,
          hasRdns: !!wallet.rdns,
        });
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
          console.log('[DiscoveryService] Validating qualified responder:', wallet.responderId);
          const validatedWallet = safeValidateQualifiedResponder(wallet);

          if (!validatedWallet) {
            console.log('[DiscoveryService] Validation failed for wallet:', wallet.responderId);
            this.logger.warn('Skipping invalid discovery response', {
              walletId: wallet.responderId,
              reason: 'Failed validation',
            });
            continue;
          }
          console.log('[DiscoveryService] Wallet validation successful:', wallet.responderId);

          // Store in both maps for compatibility
          this.qualifiedWallets.set(wallet.responderId, validatedWallet);
          this.discoveredResponders.set(wallet.responderId, validatedWallet);
          if (validatedWallet.rdns) {
            this.respondersByRdns.set(validatedWallet.rdns, validatedWallet);
          }

          const discoveredWallet = this.convertQualifiedWalletToDiscoveredWallet(validatedWallet);

          // Apply origin validation if enabled
          this.logger.debug('Checking origin validation for wallet', {
            walletId: wallet.responderId,
          });
          console.log('[DiscoveryService] Checking origin validation for wallet:', wallet.responderId);
          if (await this.shouldSkipWalletDueToOriginValidation(discoveredWallet)) {
            console.log('[DiscoveryService] Wallet skipped due to origin validation:', wallet.responderId);
            this.logger.debug('Skipping wallet due to origin validation failure', {
              walletId: wallet.responderId,
            });
            continue;
          }
          console.log('[DiscoveryService] Origin validation passed for wallet:', wallet.responderId);

          this.logger.debug('Adding wallet to discovered wallets', {
            walletId: wallet.responderId,
          });
          this.updateDiscoveredWallet(discoveredWallet);

          // Add wallet to store for UI integration
          console.log('[DiscoveryService] About to add wallet to store');
          try {
            console.log('[DiscoveryService] Converting wallet to WalletInfo format');
            const walletInfo = this.convertQualifiedResponderToWalletInfo(validatedWallet);
            const normalizedWalletInfo = this.normalizeWalletInfoId(walletInfo, validatedWallet);

            console.log('[DiscoveryService] Converted wallet info:', {
              id: normalizedWalletInfo.id,
              name: normalizedWalletInfo.name,
              chains: normalizedWalletInfo.chains,
            });

            console.log('[DiscoveryService] Calling connectionActions.addDiscoveredWallet...');
            connectionActions.addDiscoveredWallet(this.store, normalizedWalletInfo);
            console.log('[DiscoveryService] Successfully called addDiscoveredWallet');
            this.logger.debug('Added wallet to store', {
              walletId: normalizedWalletInfo.id,
              walletName: normalizedWalletInfo.name,
            });
            walletIdsDiscoveredThisScan.add(normalizedWalletInfo.id);
          } catch (error) {
            console.error('[DiscoveryService] Failed to add wallet to store:', error);
            this.logger.error('Failed to add wallet to store', {
              walletId: wallet.responderId,
              error,
            });
          }

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

      this.synchronizeDiscoveredWalletStore(walletIdsDiscoveredThisScan);

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

      // Update UI state - discovery completed
      try {
        uiActions.setLoading(this.store, 'discovery', false);
      } catch (error) {
        this.logger.warn('Failed to clear discovery loading state', { error });
      }

      return discoveredWallets;
    } catch (error) {
      this.logger.error('Discovery scan failed', error);

      // Update UI state - discovery failed
      try {
        uiActions.setLoading(this.store, 'discovery', false);
      } catch (uiError) {
        this.logger.warn('Failed to clear discovery loading state on error', { uiError });
      }

      throw error;
    } finally {
      this.discoveryRunInProgress = false;
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
    const wallet = this.discoveredWallets.get(walletId);
    if (!wallet || !wallet.metadata) {
      return false;
    }

    try {
      const transportConfig = wallet.metadata['transportConfig'] as
        | { type: string; extensionId?: string }
        | undefined;

      if (transportConfig?.type !== 'extension' || !transportConfig.extensionId) {
        this.logger.debug('Wallet is not an extension or missing extension ID', { walletId });
        return false;
      }

      if (typeof window === 'undefined') {
        this.logger.debug('No window context while checking extension availability; assuming available', {
          walletId,
        });
        return true;
      }

      this.logger.debug(
        'Skipping chrome.runtime availability probe; assuming extension wallet is available',
        {
          walletId,
          extensionId: transportConfig.extensionId,
        },
      );

      return true;
    } catch (error) {
      this.logger.warn('Error while checking extension availability; defaulting to available', {
        walletId,
        error,
      });
      return true;
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
      // responsiveness check via the discovery protocol using a fresh initiator
      try {
        this.logger.debug('Creating fresh discovery initiator for wallet availability check', { walletId });
        const freshInitiator = this.createFreshDiscoveryInitiator();

        // Create a brief discovery session to test responsiveness
        const responders = await Promise.race([
          freshInitiator.startDiscovery(),
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
    this.discoveryComponentsInitialized = false;
    this.discoveryInitializationPromise = null;
  }

  // inferChainSupport method removed - no longer needed with discovery protocol

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

import { ChainNotSupportedError, type ChainType } from '../../types/chains.js';
import { ClientEventType, type WalletClientEvent, type EventListener } from '../../types/events.js';
import {
  ProviderNotSupportedError,
  type ProviderInterface,
  type ProviderCapability,
} from '../../types/providers.js';
import { ConnectionState } from '../types.js';
import type { ConnectOptions, ConnectionResult, WalletConnector } from '../types.js';
import { ConnectorNotInitializedError, ConnectionInProgressError, type ConnectorState } from './types.js';

/**
 * Abstract base class for wallet connectors.
 * Implements common functionality and defines required abstract methods.
 *
 * This class provides the foundation for implementing wallet connectors
 * with consistent behavior and state management.
 *
 * @abstract
 * @implements {WalletConnector}
 */
export abstract class BaseWalletConnector implements WalletConnector {
  /** Unique identifier for the connector */
  abstract readonly id: string;
  /** Display name of the wallet */
  abstract readonly name: string;
  /** URL to the wallet's icon */
  abstract readonly icon: string;
  /** Optional description of the wallet */
  abstract readonly description?: string;
  /** List of blockchain types supported by this wallet */
  abstract readonly supportedChains: ChainType[];
  /** List of provider interfaces supported by this wallet */
  abstract readonly supportedProviders: ProviderInterface[];

  /** Initialization state */
  protected initialized = false;
  /** Current connector state */
  protected state: ConnectorState = {
    connectionState: ConnectionState.DISCONNECTED,
    chain: null,
    provider: null,
    accounts: [],
    error: null,
  };

  /** Map of event listeners */
  private eventListeners = new Map<string, Set<EventListener<WalletClientEvent>>>();

  constructor() {
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  /**
   * Initialize the connector. Must be called before any other operations.
   * @abstract
   * @returns Promise that resolves when initialization is complete
   */
  abstract initialize(): Promise<void>;

  /**
   * Detect if the wallet is available.
   * @abstract
   * @returns Promise that resolves to true if wallet is available
   */
  abstract detect(): Promise<boolean>;

  /**
   * Get provider instance for specified interface and chain.
   * @abstract
   * @template T - The provider type
   * @param interfaceType - The provider interface type
   * @param chain - The chain to get the provider for
   * @returns Provider instance
   */
  abstract getProvider<T = unknown>(interfaceType?: ProviderInterface, chain?: ChainType): T;

  /**
   * Get provider capabilities for specified interface.
   * @abstract
   * @param interfaceType - The provider interface type
   * @returns Provider capabilities or null if not supported
   */
  abstract getProviderCapabilities(interfaceType: ProviderInterface): ProviderCapability | null;

  /**
   * Connect to wallet with specified chain and options.
   * @param chain - Optional chain to connect to
   * @param options - Optional connection options
   * @returns Promise that resolves with connection result
   * @throws {ConnectorNotInitializedError} If connector is not initialized
   * @throws {ConnectionInProgressError} If connection is already in progress
   * @throws {ChainNotSupportedError} If specified chain is not supported
   */
  async connect(chain?: ChainType, options?: ConnectOptions): Promise<ConnectionResult> {
    if (!this.initialized) {
      throw new ConnectorNotInitializedError();
    }

    if (this.state.connectionState === ConnectionState.CONNECTING) {
      throw new ConnectionInProgressError();
    }

    // Ensure we have valid chain and provider
    if (!this.supportedChains.length) {
      throw new Error('No supported chains available');
    }
    if (!this.supportedProviders.length) {
      throw new Error('No supported providers available');
    }

    // We've already validated arrays are non-empty
    const defaultChain = this.supportedChains[0];
    const defaultProvider = this.supportedProviders[0];

    if (!defaultChain || !defaultProvider) {
      throw new Error('Configuration error: missing chain or provider');
    }

    const targetChain = chain ?? defaultChain;

    this.validateChain(targetChain);

    try {
      const initialState: Partial<ConnectorState> = {
        connectionState: ConnectionState.CONNECTING,
        chain: targetChain,
        provider: defaultProvider,
        accounts: [],
        error: null,
      } as const;

      this.updateState(initialState);

      this.emit({
        type: ClientEventType.CONNECTING,
        providerType: defaultProvider,
      });

      const result = await this.performConnect(targetChain, options);

      this.updateState({
        connectionState: ConnectionState.CONNECTED,
        chain: result.chain,
        provider: result.provider,
        accounts: result.accounts,
      });

      this.emit({
        type: ClientEventType.CONNECTED,
        chainType: result.chain,
        providerType: result.provider,
        accounts: result.accounts,
      });

      return result;
    } catch (error) {
      this.updateState({
        connectionState: ConnectionState.ERROR,
        error: error as Error,
      });

      this.emit({
        type: ClientEventType.ERROR,
        error: error as Error,
        context: 'connect',
      });

      throw error;
    }
  }

  /**
   * Disconnect from wallet.
   * @returns Promise that resolves when disconnection is complete
   * @throws {ConnectorNotInitializedError} If connector is not initialized
   */
  async disconnect(): Promise<void> {
    if (!this.initialized) {
      throw new ConnectorNotInitializedError();
    }

    try {
      await this.performDisconnect();
      this.handleDisconnect();
    } catch (error) {
      this.emit({
        type: ClientEventType.ERROR,
        error: error as Error,
        context: 'disconnect',
      });
      throw error;
    }
  }

  /**
   * Add event listener
   * @param event - Event type to listen for
   * @param listener - Event listener function
   */
  on<T extends WalletClientEvent>(event: T['type'], listener: EventListener<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener as EventListener<WalletClientEvent>);
    }
  }

  /**
   * Remove event listener
   * @param event - Event type to remove listener from
   * @param listener - Event listener function to remove
   */
  off<T extends WalletClientEvent>(event: T['type'], listener: EventListener<T>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener as EventListener<WalletClientEvent>);
    }
  }

  /**
   * Protected helper to validate chain support
   * @protected
   * @param chain - Chain to validate
   * @throws {ChainNotSupportedError} If chain is not supported
   */
  protected validateChain(chain: ChainType | null | undefined): void {
    if (chain !== null && chain !== undefined && !this.supportedChains.includes(chain)) {
      throw new ChainNotSupportedError(chain);
    }
  }

  /**
   * Protected helper to validate provider support
   * @protected
   * @param interfaceType - Provider interface to validate
   * @throws {ProviderNotSupportedError} If provider is not supported
   */
  protected validateProvider(interfaceType: ProviderInterface): void {
    if (!this.supportedProviders.includes(interfaceType)) {
      throw new ProviderNotSupportedError(interfaceType);
    }
  }

  /**
   * Protected helper to emit events
   * @protected
   * @param event - Event to emit
   */
  protected emit<T extends WalletClientEvent>(event: T): void {
    const listeners = this.eventListeners.get(event.type);
    if (!listeners) return;

    for (const listener of listeners) {
      listener(event);
    }
  }

  /**
   * Protected helper to update connector state
   * @protected
   * @param update - Partial state update
   */
  protected updateState(update: Partial<ConnectorState>): void {
    this.state = { ...this.state, ...update };
  }

  /**
   * Protected handler for disconnect events
   * @protected
   * @param reason - Optional reason for disconnection
   */
  protected handleDisconnect(reason?: string): void {
    const update: Partial<ConnectorState> = {
      connectionState: ConnectionState.DISCONNECTED,
      accounts: [],
    };

    update.chain = null;
    update.provider = null;
    update.error = null;

    this.updateState(update);

    // Only include reason if defined to satisfy exactOptionalPropertyTypes
    this.emit(
      reason ? { type: ClientEventType.DISCONNECTED, reason } : { type: ClientEventType.DISCONNECTED },
    );
  }

  /**
   * Protected method to perform actual connection
   * Must be implemented by concrete connectors
   * @protected
   * @abstract
   * @param chain - Chain to connect to
   * @param options - Connection options
   * @returns Promise that resolves with connection result
   */
  protected abstract performConnect(
    chain: ChainType | null,
    options?: ConnectOptions,
  ): Promise<ConnectionResult>;

  /**
   * Protected method to perform actual disconnection
   * Must be implemented by concrete connectors
   * @protected
   * @abstract
   * @returns Promise that resolves when disconnection is complete
   */
  protected abstract performDisconnect(): Promise<void>;
}

import type { ChainType } from '../types/chains.js';
import type {
  WalletClient as IWalletClient,
  WalletClientConfig,
  WalletClientState,
  ConnectionResult,
  ConnectOptions,
} from '../types/client.js';
import { ClientEventType } from '../types/events.js';
import type { WalletClientEvent, EventListener } from '../types/events.js';
import { ProviderInterface, ProviderNotSupportedError } from '../types/providers.js';
import type { BaseProvider } from '../types/providers.js';
import { WalletStorage } from '../utils/storage.js';
import { createWalletStore, initialState } from './store.js';
import type { WalletStore } from './store.js';
import type { WalletConnector } from '../connectors/types.js';

/**
 * Implementation of the WalletClient interface
 */
export class WalletClient implements IWalletClient {
  /**
   * Register a wallet connector
   * @param connector - The wallet connector to register
   */
  public registerConnector(connector: WalletConnector): void {
    if (connector.id === undefined) {
      throw new Error('Connector ID cannot be undefined');
    }
    this.connectors.set(connector.id, connector);
  }

  /**
   * Register multiple wallet connectors
   * @param connectors - An array of wallet connectors to register
   */
  public registerConnectors(connectors: WalletConnector[]): void {
    for (const connector of connectors) {
      this.registerConnector(connector);
    }
  }

  // Private fields with initialization
  private readonly config: Required<WalletClientConfig>;
  private readonly store: WalletStore;
  private readonly storage: WalletStorage;
  private readonly connectors = new Map<string, WalletConnector>();
  private readonly providers = new Map<ProviderInterface, BaseProvider>();
  private readonly eventListeners = new Map<ClientEventType, Set<EventListener<WalletClientEvent>>>();

  /**
   * Register a provider
   * @param providerInterface - The interface of the provider
   * @param provider - The provider instance
   */
  public registerProvider(providerInterface: ProviderInterface, provider: BaseProvider): void {
    this.providers.set(providerInterface, provider);
  }

  /**
   * Register multiple providers
   * @param providers - An object mapping provider interfaces to provider instances
   */
  public registerProviders(providers: Record<ProviderInterface, BaseProvider>): void {
    for (const [type, provider] of Object.entries(providers)) {
      this.registerProvider(type as ProviderInterface, provider);
    }
  }

  /**
   * Remove a provider
   * @param providerInterface - The interface of the provider to remove
   */
  public removeProvider(providerInterface: ProviderInterface): void {
    this.providers.delete(providerInterface);
  }

  /**
   * Get a registered connector by ID
   * @param connectorId - The ID of the connector to retrieve
   * @returns The wallet connector, or undefined if not found
   */
  private async getConnector(connectorId: string): Promise<WalletConnector | undefined> {
    return this.connectors.get(connectorId);
  }

  /**
   * Convert chain type to chain ID
   * @param chainType - The chain type to convert
   * @returns The chain ID as a string
   */
  private getChainId(chainType: ChainType): string {
    // This is a simplified implementation - should be replaced with actual chain ID mapping
    return `0x${chainType}`;
  }

  /**
   * Constructor for the WalletClient class
   * @param config - The configuration object for the client
   */
  constructor(config: WalletClientConfig) {
    this.config = {
      appName: config.appName,
      autoReconnect: config.autoReconnect ?? true,
      persistConnection: config.persistConnection ?? true,
      defaultProviderInterface: config.defaultProviderInterface ?? ProviderInterface.EIP1193,
      timeout: config.timeout ?? 5000,
      storageKeyPrefix: config.storageKeyPrefix ?? 'walletmesh_',
    };

    this.store = createWalletStore();
    this.storage = new WalletStorage({ prefix: this.config.storageKeyPrefix });
  }

  /**
   * Initialize the client and attempt auto-reconnect if enabled
   */
  public async initialize(): Promise<void> {
    if (this.config.persistConnection) {
      const savedState = this.storage.getState();
      if (savedState) {
        // When loading persisted state, keep all the values as they were
        const state = {
          ...savedState,
          // Only reset error to null as it shouldn't persist across sessions
          error: null,
        };
        this.store.setState(state);
      }
    }

    if (this.config.autoReconnect) {
      const lastConnector = this.storage.getLastConnector();
      const lastProvider = this.storage.getLastProvider() as ProviderInterface;

      if (lastConnector && lastProvider) {
        await this.connect(lastConnector, {
          preferredInterface: lastProvider,
        }).catch((error) => {
          console.error('Auto-reconnect failed:', error);
          this.store.setState({ error, status: 'error' });
        });
      }
    }
  }

  /**
   * Get current client state
   * @returns The current state of the client
   */
  public getState(): WalletClientState {
    const { status, activeConnector, activeChain, activeProviderInterface, accounts, error } =
      this.store.getState();

    return {
      status,
      activeConnector,
      activeChain,
      activeProviderInterface,
      accounts,
      error,
    };
  }

  /**
   * Connect to a wallet using the specified connector
   * @param connectorId - The ID of the connector to use
   * @param options - Connection options
   * @returns A promise that resolves with the connection result
   */
  public async connect(connectorId: string, options?: ConnectOptions): Promise<ConnectionResult> {
    const preferredInterface = options?.preferredInterface ?? this.config.defaultProviderInterface;

    this.emit({
      type: ClientEventType.CONNECTING,
      providerType: preferredInterface,
    });

    // Get the connector instance (implementation of getConnector needed)
    const connector = await this.getConnector(connectorId);
    if (!connector) {
      throw new Error(`Connector ${connectorId} not found`);
    }

    try {
      // Initialize and check availability
      await connector.initialize();
      const isAvailable = await connector.detect();
      if (!isAvailable) {
        throw new Error('Wallet not available');
      }

      // Prepare connection options, only including defined values
      const connectOptions: Partial<ConnectOptions> = {};

      if (options?.preferredInterface || this.config.defaultProviderInterface) {
        connectOptions.preferredInterface =
          options?.preferredInterface ?? this.config.defaultProviderInterface;
      }
      if (options?.chainType) {
        connectOptions.chainType = options.chainType;
      }

      const result = await connector.connect(connectOptions.chainType, { timeout: this.config.timeout });

      // Update state
      this.store.setState({
        status: 'connected',
        activeConnector: connectorId,
        activeChain: result.chain,
        activeProviderInterface: result.provider,
        accounts: result.accounts,
        error: null,
      });

      // Persist connection if enabled
      if (this.config.persistConnection) {
        this.storage.saveLastConnector(connectorId);
        this.storage.saveLastProvider(result.provider);
      }

      // Map result to expected format
      const connectionResult: ConnectionResult = {
        chainType: result.chain,
        providerInterface: result.provider,
        capabilities: connector.getProviderCapabilities(result.provider) ?? {
          interface: result.provider,
          version: '1.0.0',
          methods: [],
          events: [],
        },
        accounts: result.accounts,
      };

      // Emit connected event
      this.emit({
        type: ClientEventType.CONNECTED,
        chainType: connectionResult.chainType,
        providerType: connectionResult.providerInterface,
        accounts: connectionResult.accounts,
      });

      return connectionResult;
    } catch (error) {
      // Update state with error
      this.store.setState({
        status: 'error',
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      });

      // Re-throw the error
      throw error;
    }
  }

  /**
   * Disconnect the current wallet
   */
  public async disconnect(): Promise<void> {
    const state = this.getState();
    if (state.activeProviderInterface) {
      try {
        const provider = this.getProvider(state.activeProviderInterface);
        if (provider) {
          await provider.request({ method: 'eth_disconnect' }).catch(console.error);
        }
      } catch (error) {
        // Ignore provider errors during disconnect to ensure cleanup happens
        console.error('Provider error during disconnect:', error);
      }
    }

    this.store.setState({ ...initialState });
    if (this.config.persistConnection) {
      this.storage.clearAll();
    }

    this.emit({
      type: ClientEventType.DISCONNECTED,
    });
  }

  /**
   * Get provider instance
   * @param providerInterface - The interface of the provider to get
   * @param chain - The chain to get the provider for
   * @returns The provider instance, or null if not found
   */
  public getProvider<T extends BaseProvider = BaseProvider>(
    providerInterface?: ProviderInterface,
    chain?: ChainType,
  ): T | null {
    const interfaceToUse = providerInterface ?? this.store.getState().activeProviderInterface;
    const chainToUse = chain ?? this.store.getState().activeChain;

    if (!interfaceToUse) {
      return null;
    }

    const provider = this.providers.get(interfaceToUse) as T;
    if (!provider) {
      throw new ProviderNotSupportedError(interfaceToUse);
    }

    if (chainToUse) {
      // Configure provider for specific chain if provided
      provider.setChain?.(chainToUse);
    }

    return provider;
  }

  /**
   * Get list of supported provider interfaces
   * @returns An array of supported provider interfaces
   */
  public getSupportedProviderInterfaces(): ProviderInterface[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider interface is supported
   * @param type - The provider interface to check
   * @returns True if the provider interface is supported, false otherwise
   */
  public supportsInterface(type: ProviderInterface): boolean {
    return this.providers.has(type);
  }

  /**
   * Get connected accounts
   * @returns An array of connected accounts
   */
  public getAccounts(): string[] {
    return this.store.getState().accounts;
  }

  /**
   * Switch to a different chain
   * @param _chainType - The chain to switch to
   * @throws {Error} Method not implemented
   */
  public async switchChain(chainType: ChainType): Promise<void> {
    // First emit connecting event for any chain switch attempt
    this.emit({
      type: ClientEventType.CONNECTING,
      providerType: this.config.defaultProviderInterface,
    });

    const chainId = this.getChainId(chainType);
    const activeProvider = this.getProvider();

    if (!activeProvider) {
      throw new Error('No active provider available');
    }

    try {
      await activeProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });

      // Update state with new chain
      this.store.setState({
        activeChain: chainType,
        error: null,
      });

      // Set chain on provider if supported
      if ('setChain' in activeProvider) {
        activeProvider.setChain(chainType);
      }
    } catch (error) {
      // If the error indicates chain hasn't been added, we could attempt to add it
      // This would require chain configuration data which could be added in future
      this.store.setState({
        error: error instanceof Error ? error : new Error('Chain switch failed'),
      });
      throw error;
    }
  }

  /**
   * Event emitter methods
   * @param event - The event type
   * @param listener - The event listener
   */
  public on<T extends WalletClientEvent>(event: T['type'], listener: EventListener<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      (listeners as Set<EventListener<WalletClientEvent>>).add(listener as EventListener<WalletClientEvent>);
    }
  }

  public off<T extends WalletClientEvent>(event: T['type'], listener: EventListener<T>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      (listeners as Set<EventListener<WalletClientEvent>>).delete(
        listener as EventListener<WalletClientEvent>,
      );
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  public emit<T extends WalletClientEvent>(event: T): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }
}

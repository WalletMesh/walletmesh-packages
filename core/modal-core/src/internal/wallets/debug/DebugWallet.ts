/**
 * Debug Wallet Adapter
 *
 * A comprehensive test wallet that supports all blockchain types (EVM, Aztec, Solana)
 * with mock implementations. Returns mock providers that simulate blockchain
 * operations without requiring actual blockchain libraries.
 *
 * Perfect for:
 * - Testing and development
 * - Demonstrating multi-chain support
 * - Testing error scenarios
 * - UI development without real wallets
 */

import type { WalletConnection } from '../../../api/types/connection.js';
import type { WalletProvider } from '../../../api/types/providers.js';
import { ChainType } from '../../../types.js';
import type { WalletInfo } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { Logger } from '../../core/logger/logger.js';
import { AbstractWalletAdapter } from '../base/AbstractWalletAdapter.js';
import type {
  ConnectOptions,
  DetectionResult,
  WalletAdapterMetadata,
  WalletCapabilities,
  WalletFeature,
} from '../base/WalletAdapter.js';

/**
 * Configuration for test wallet behavior
 */
export interface DebugWalletConfig {
  /** Supported chain types */
  chains?: ChainType[];
  /** Connection delay in ms (for testing) */
  connectionDelay?: number;
  /** Rejection rate (0-1) for testing error scenarios */
  rejectionRate?: number;
  /** Fixed accounts to return */
  fixedAccounts?: string[];
  /** Whether the wallet is available */
  available?: boolean;
}

/**
 * Mock transport for the debug wallet
 * Provides mock responses for all chain types
 */
class DebugWalletTransport {
  private connected = false;
  private sessionId?: string;
  private eventHandlers = new Map<string, Set<(data: unknown) => void>>();
  private currentChainId = '0x1';
  private config: DebugWalletConfig;
  public logger?: Logger;

  constructor(config: DebugWalletConfig, logger?: Logger) {
    this.config = config;
    if (logger) {
      this.logger = logger;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  async connect(): Promise<string> {
    // Simulate connection delay
    if (this.config.connectionDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.connectionDelay));
    }

    // Simulate rejection
    if (this.config.rejectionRate && Math.random() < this.config.rejectionRate) {
      throw new Error('Connection rejected by user');
    }

    this.connected = true;
    this.sessionId = `debug-session-${Date.now()}`;
    return this.sessionId;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async request<T = unknown>(request: unknown): Promise<T> {
    this.logger?.debug('[DebugWallet] Transport request', request);

    const req = request as { method: string; params?: unknown[] };
    // Mock responses based on method
    switch (req.method) {
      // EVM methods
      case 'eth_accounts':
        return (this.config.fixedAccounts || ['0x1234567890123456789012345678901234567890']) as T;
      case 'eth_chainId':
        return this.currentChainId as T;
      case 'eth_requestAccounts':
        return (this.config.fixedAccounts || ['0x1234567890123456789012345678901234567890']) as T;
      case 'eth_sendTransaction':
        return `0x${'0'.repeat(64)}` as T; // Mock transaction hash
      case 'personal_sign':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4':
        return `0x${'1'.repeat(130)}` as T; // Mock signature
      case 'eth_getBalance':
        return `0x${(1000000000000000000).toString(16)}` as T; // 1 ETH in wei
      case 'wallet_switchEthereumChain':
        if (req.params?.[0]) {
          const chainIdParam = req.params[0] as { chainId?: string };
          if (chainIdParam.chainId) {
            this.currentChainId = chainIdParam.chainId;
            // Emit event through outer class event handlers
            // Note: In a real implementation, this would use proper event system
          }
        }
        return null as T;

      // Aztec methods
      case 'aztec_accounts':
        return (this.config.fixedAccounts || ['0x1234567890123456789012345678901234567890']) as T;
      case 'aztec_getAddress':
        return (this.config.fixedAccounts?.[0] || '0x1234567890123456789012345678901234567890') as T;
      case 'aztec_getChainId':
        return 'aztec:31337' as T;
      case 'aztec_signMessage':
        return '0xmocksignature' as T;
      case 'aztec_deployContract':
        return { address: `0xaztec_contract_${Date.now()}` } as T;
      case 'aztec_sendTx':
        return { txHash: `0xaztec_tx_${Date.now()}` } as T;

      // Solana methods
      case 'solana_connect':
        return { publicKey: 'So1ana1111111111111111111111111111111111112' } as T;
      case 'solana_disconnect':
        return null as T;
      case 'solana_signTransaction':
        return { signedTransaction: 'base64_signed_tx' } as T;
      case 'solana_sendTransaction':
        return { signature: `solana_sig_${Date.now()}` } as T;

      // Capability discovery
      case 'wm_getSupportedMethods':
        return [
          'eth_accounts',
          'eth_chainId',
          'eth_sendTransaction',
          'aztec_accounts',
          'aztec_deployContract',
          'aztec_sendTx',
          'solana_connect',
          'solana_signTransaction',
        ] as T;

      default:
        this.logger?.warn('[DebugWallet] Unknown method:', req.method);
        return null as T;
    }
  }

  async getCapabilities(): Promise<WalletCapabilities> {
    return {
      chains: [
        { type: ChainType.Evm, chainIds: ['0x1'] },
        { type: ChainType.Aztec, chainIds: ['aztec-testnet'] },
        { type: ChainType.Solana, chainIds: ['mainnet-beta'] },
      ],
      features: new Set<WalletFeature>(['sign_message', 'sign_typed_data', 'multi_account']),
      permissions: {
        methods: [
          'eth_accounts',
          'eth_chainId',
          'eth_sendTransaction',
          'aztec_accounts',
          'aztec_deployContract',
          'solana_connect',
          'solana_signTransaction',
        ],
        events: ['accountsChanged', 'chainChanged', 'connect', 'disconnect'],
      },
    };
  }

  on(event: string, handler: (data: unknown) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);
  }

  off(event: string, handler: (data: unknown) => void): void {
    this.eventHandlers.get(event)?.delete(handler);
  }
}

/**
 * Debug wallet adapter for testing and development
 *
 * Features:
 * - Supports all chain types (EVM, Aztec, Solana)
 * - Provides mock implementations for all methods
 * - Configurable behavior for testing scenarios
 * - No external blockchain library dependencies
 *
 * @public
 */
export class DebugWallet extends AbstractWalletAdapter {
  readonly id = 'debug-wallet';
  readonly metadata: WalletAdapterMetadata;
  readonly capabilities: WalletCapabilities;

  private config: DebugWalletConfig;
  private debugTransport?: DebugWalletTransport;

  // Legacy compatibility
  private currentChainId = 'eip155:1';
  private chainChangedHandlers: Array<(chainId: string) => void> = [];
  private accountsChangedHandlers: Array<(accounts: string[]) => void> = [];

  // Mock provider for backwards compatibility
  private get mockProvider(): Record<string, unknown> {
    return {
      request: async ({ method, params }: { method: string; params?: unknown[] }) => {
        this.logger?.debug('Provider request', { method, params });
        // Mock provider implementation
        switch (method) {
          case 'eth_accounts':
            return this.config.fixedAccounts || ['0x1234567890123456789012345678901234567890'];
          case 'eth_chainId': {
            // Return hex format for eth_chainId RPC method
            const chainIdNum = Number.parseInt(this.currentChainId.split(':')[1] || '1', 10);
            return `0x${chainIdNum.toString(16)}`;
          }
          case 'eth_requestAccounts':
            return this.config.fixedAccounts || ['0x1234567890123456789012345678901234567890'];
          case 'eth_sendTransaction':
            return `0x${'0'.repeat(64)}`; // Mock transaction hash
          case 'personal_sign':
          case 'eth_signTypedData':
          case 'eth_signTypedData_v4':
            return `0x${'1'.repeat(130)}`; // Mock signature
          case 'wallet_switchEthereumChain':
            // Update the current chain ID
            if (params?.[0] && typeof params[0] === 'object' && 'chainId' in params[0]) {
              const requestedChainId = (params[0] as { chainId: string }).chainId;

              // Convert hex chainId to CAIP-2 format if needed
              let newChainId: string;
              if (requestedChainId.startsWith('0x')) {
                const chainIdNum = Number.parseInt(requestedChainId, 16);
                newChainId = `eip155:${chainIdNum}`;
              } else if (requestedChainId.startsWith('eip155:')) {
                newChainId = requestedChainId;
              } else {
                // Assume it's a decimal string
                newChainId = `eip155:${requestedChainId}`;
              }

              this.logger?.debug('Switching chain', {
                from: this.currentChainId,
                to: newChainId,
                requested: requestedChainId,
              });
              this.currentChainId = newChainId;

              // Emit chainChanged event with hex format for compatibility
              const handlers = this.chainChangedHandlers;
              this.logger?.debug('Emitting chainChanged to handlers', {
                count: handlers.length,
              });
              const chainIdNum = Number.parseInt(newChainId.split(':')[1] || '1', 10);
              const hexChainId = `0x${chainIdNum.toString(16)}`;
              for (const handler of handlers) {
                handler(hexChainId);
              }
            }
            return null;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      },

      on: (event: string, handler: (...args: unknown[]) => void) => {
        this.logger?.debug('Provider event registration', { event });
        if (event === 'chainChanged') {
          this.chainChangedHandlers.push(handler as (chainId: string) => void);
        } else if (event === 'accountsChanged') {
          this.accountsChangedHandlers.push(handler as (accounts: string[]) => void);
        }
      },

      removeListener: (event: string, handler: (...args: unknown[]) => void) => {
        this.logger?.debug('Provider event deregistration', { event });
        if (event === 'chainChanged') {
          const index = this.chainChangedHandlers.indexOf(handler as (chainId: string) => void);
          if (index >= 0) this.chainChangedHandlers.splice(index, 1);
        } else if (event === 'accountsChanged') {
          const index = this.accountsChangedHandlers.indexOf(handler as (accounts: string[]) => void);
          if (index >= 0) this.accountsChangedHandlers.splice(index, 1);
        }
      },
    };
  }

  constructor(config: DebugWalletConfig = {}) {
    super();
    this.config = {
      available: true,
      chains: [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
      ...config,
    };

    const supportedChains = this.config.chains || [ChainType.Evm, ChainType.Solana, ChainType.Aztec];

    this.metadata = {
      name: 'Debug Wallet',
      icon: '🐛',
      description: 'Debug wallet for testing and development',
    };

    this.capabilities = {
      chains: [
        ...(supportedChains.includes(ChainType.Evm)
          ? [
              {
                type: ChainType.Evm,
                chainIds: ['eip155:1', 'eip155:5', 'eip155:137', 'eip155:10', 'eip155:42161'],
              },
            ]
          : []),
        ...(supportedChains.includes(ChainType.Aztec)
          ? [{ type: ChainType.Aztec, chainIds: ['aztec:31337', 'aztec:1', 'aztec:677692'] }]
          : []),
        ...(supportedChains.includes(ChainType.Solana)
          ? [
              {
                type: ChainType.Solana,
                chainIds: [
                  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
                  'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
                  'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
                ],
              },
            ]
          : []),
      ],
      features: new Set(['sign_message', 'sign_typed_data', 'multi_account'] as WalletFeature[]),
      permissions: {
        methods: [
          'eth_accounts',
          'eth_chainId',
          'eth_sendTransaction',
          'aztec_accounts',
          'aztec_sendTx',
          'solana_signTransaction',
        ],
        events: ['chainChanged', 'accountsChanged', 'disconnect'],
      },
    };
  }

  /**
   * Public connect method required by AbstractWalletAdapter
   */
  async connect(options?: ConnectOptions): Promise<WalletConnection> {
    // Perform the connection logic
    const connectionData = await this.doConnect(options);

    // Register the provider in the providers map
    const chainType = connectionData.chainType || connectionData.chain.chainType;
    this.providers.set(chainType, connectionData.provider as WalletProvider);

    // Use the protected createConnection helper which handles all state management
    const connection = await this.createConnection({
      address: connectionData.address,
      accounts: connectionData.accounts,
      chainId: connectionData.chain.chainId,
      chainType,
      provider: connectionData.provider as WalletProvider,
      chainName: connectionData.chain.name,
      chainRequired: connectionData.chain.required,
      ...(connectionData.sessionId && { sessionId: connectionData.sessionId }),
      ...(connectionData.metadata?.sessionMetadata && {
        sessionMetadata: connectionData.metadata.sessionMetadata as Record<string, unknown>,
      }),
    });

    return connection;
  }

  /**
   * Public disconnect method required by AbstractWalletAdapter
   */
  async disconnect(): Promise<void> {
    // Perform the disconnection logic
    await this.doDisconnect();

    // Use the protected cleanup method which handles all state management
    await this.cleanup();
  }

  /**
   * Connect to the debug wallet
   * Demonstrates multi-chain support with lazy loading
   */
  protected async doConnect(options?: ConnectOptions): Promise<WalletConnection> {
    this.logger?.info('[DebugWallet] Connecting with options:', options);

    // Initialize debug transport
    if (!this.debugTransport) {
      this.debugTransport = new DebugWalletTransport(this.config, this.logger as Logger | undefined);
    }

    // Simulate connection delay if configured
    if (this.config.connectionDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.connectionDelay));
    }

    // Simulate rejection rate for testing
    if (this.config.rejectionRate && Math.random() < this.config.rejectionRate) {
      throw ErrorFactory.connectorError(this.id, 'User rejected connection', 'USER_REJECTED', {
        recoveryHint: 'retry',
      });
    }

    // Determine primary chain type - prioritize requested chains from options
    let primaryChainType: ChainType;
    if (options?.chains && options.chains.length > 0) {
      const firstChain = options.chains[0];
      primaryChainType = firstChain ? firstChain.type : ChainType.Evm;
    } else {
      const supportedChains = this.config.chains || [ChainType.Evm, ChainType.Solana, ChainType.Aztec];
      primaryChainType = supportedChains[0] || ChainType.Evm;
    }
    let address: string;
    let accounts: string[];
    let chainId: string;
    let chainName: string;

    switch (primaryChainType) {
      case ChainType.Aztec:
        accounts = this.config.fixedAccounts || ['0x1234567890123456789012345678901234567890'];
        address = accounts[0] as string;
        chainId = 'aztec:31337';
        chainName = 'Aztec Local';
        break;
      case ChainType.Solana:
        accounts = this.config.fixedAccounts || ['9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'];
        address = accounts[0] as string;
        chainId = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
        chainName = 'Solana Mainnet';
        break;
      default:
        accounts = this.config.fixedAccounts || ['0x1234567890123456789012345678901234567890'];
        address = accounts[0] as string;
        chainId = 'eip155:1';
        chainName = 'Ethereum Mainnet';
        break;
    }

    this.logger?.info('[DebugWallet] Connected successfully', {
      address,
      chainType: primaryChainType,
    });

    const now = Date.now();
    return {
      walletId: this.id,
      address,
      accounts,
      chain: {
        chainId,
        chainType: primaryChainType,
        name: chainName,
        required: true,
      },
      chainType: primaryChainType,
      provider: this.getMockProvider(primaryChainType, accounts, chainId) as WalletProvider, // Mock provider for testing
      walletInfo: DebugWallet.getWalletInfo(),
      metadata: {
        connectedAt: now,
        lastActiveAt: now,
        source: 'walletmesh',
      },
    };
  }

  /**
   * Get mock provider for testing
   * Returns a comprehensive mock that implements common wallet provider methods
   */
  getMockProvider(chainType?: ChainType, accounts?: string[], chainId?: string): WalletProvider {
    const primaryChainType = chainType || ChainType.Evm;
    const mockAccounts = accounts ||
      this.config.fixedAccounts || ['0x1234567890123456789012345678901234567890'];
    const mockChainId = chainId || 'eip155:1';
    const address = mockAccounts[0];

    // Event handlers for mock provider
    const eventHandlers = new Map<string, Set<(...args: unknown[]) => void>>();

    const mockProviderImpl = {
      // EIP-1193 methods
      request: async (req: { method: string; params?: unknown[] }) => {
        this.logger?.debug('Provider request', { method: req.method, params: req.params });

        // Try transport first if available
        if (this.debugTransport) {
          const result = await this.debugTransport.request<unknown>(req);
          // Only use transport result if it's not null
          if (result !== null) {
            return result;
          }
        }
        // Fall back to handleRequest
        return this.handleRequest(req, primaryChainType, mockAccounts, mockChainId);
      },

      // Provider properties
      chainId:
        primaryChainType === ChainType.Evm
          ? '0x1'
          : primaryChainType === ChainType.Aztec
            ? mockChainId
            : 'mainnet-beta',
      selectedAddress: address,
      isMetaMask: false,
      networkVersion: '1',
      isConnected: () => true,

      // Event handling
      on: (event: string, handler: (...args: unknown[]) => void) => {
        // Register handlers to the class-level arrays for proper event emission
        if (event === 'chainChanged') {
          this.chainChangedHandlers.push(handler as (chainId: string) => void);
        } else if (event === 'accountsChanged') {
          this.accountsChangedHandlers.push(handler as (accounts: string[]) => void);
        } else {
          if (!eventHandlers.has(event)) {
            eventHandlers.set(event, new Set());
          }
          eventHandlers.get(event)?.add(handler);
        }
      },

      emit: (event: string, ...args: unknown[]) => {
        const handlers = eventHandlers.get(event);
        if (handlers) {
          for (const handler of handlers) {
            handler(...args);
          }
        }
      },

      removeListener: (event: string, handler: (...args: unknown[]) => void) => {
        if (event === 'chainChanged') {
          const index = this.chainChangedHandlers.indexOf(handler as (chainId: string) => void);
          if (index >= 0) this.chainChangedHandlers.splice(index, 1);
        } else if (event === 'accountsChanged') {
          const index = this.accountsChangedHandlers.indexOf(handler as (accounts: string[]) => void);
          if (index >= 0) this.accountsChangedHandlers.splice(index, 1);
        } else {
          const handlers = eventHandlers.get(event);
          if (handlers) {
            handlers.delete(handler);
          }
        }
      },

      // Solana methods (if applicable)
      ...(primaryChainType === ChainType.Solana && {
        publicKey: address,
        isPhantom: false,
      }),

      // Aztec methods (if applicable)
      ...(primaryChainType === ChainType.Aztec && {
        getAccounts: () => mockAccounts,
        getChainId: () => mockChainId,
        isAztec: true,
      }),
    };

    // Create a proper WalletProvider interface implementation that also includes EIP-1193 properties
    const walletProvider = {
      // WalletProvider interface methods
      getAccounts: async () => mockAccounts,
      getChainId: async () => mockChainId,
      isConnected: () => true,
      on: (event: string, listener: (...args: unknown[]) => void) => {
        mockProviderImpl.on(event, listener);
      },
      off: (event: string, listener: (...args: unknown[]) => void) => {
        mockProviderImpl.removeListener(event, listener);
      },
      disconnect: async () => {
        // Clear event handlers on disconnect
        eventHandlers.clear();
        this.chainChangedHandlers = [];
        this.accountsChangedHandlers = [];
      },
      // EIP-1193 compatibility
      request: mockProviderImpl.request,
      // Additional provider properties for backward compatibility
      chainId: mockProviderImpl.chainId,
      selectedAddress: mockProviderImpl.selectedAddress,
      isMetaMask: mockProviderImpl.isMetaMask,
      networkVersion: mockProviderImpl.networkVersion,
      // Add removeListener alias for backward compatibility
      removeListener: (event: string, listener: (...args: unknown[]) => void) => {
        mockProviderImpl.removeListener(event, listener);
      },
      // Spread remaining properties from mockProviderImpl for chain-specific features
      ...(primaryChainType === ChainType.Solana && {
        publicKey: address,
        isPhantom: false,
      }),
      ...(primaryChainType === ChainType.Aztec && {
        getAccounts: () => mockAccounts,
        getChainId: () => mockChainId,
        isAztec: true,
      }),
    } as WalletProvider & Record<string, unknown>;

    return walletProvider as WalletProvider;
  }

  /**
   * Handle provider requests
   * Returns mock responses based on method
   */
  private handleRequest(
    req: { method: string; params?: unknown[] },
    chainType?: ChainType,
    accounts?: string[],
    chainId?: string,
  ): unknown {
    const primaryChainType = chainType || ChainType.Evm;
    const mockAccounts = accounts ||
      this.config.fixedAccounts || ['0x1234567890123456789012345678901234567890'];
    const mockChainId = chainId || 'eip155:1';

    switch (req.method) {
      case 'eth_accounts':
      case 'eth_requestAccounts':
        return primaryChainType === ChainType.Evm ? mockAccounts : undefined;

      case 'eth_chainId': {
        if (primaryChainType === ChainType.Evm) {
          const chainIdNum = Number.parseInt(this.currentChainId.split(':')[1] || '1', 10);
          return `0x${chainIdNum.toString(16)}`;
        }
        return undefined;
      }

      case 'net_version':
        return primaryChainType === ChainType.Evm ? '1' : undefined;

      case 'eth_sendTransaction':
        return primaryChainType === ChainType.Evm ? `0x${'0'.repeat(64)}` : undefined;

      case 'personal_sign':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4':
        return primaryChainType === ChainType.Evm ? `0x${'1'.repeat(130)}` : undefined;

      case 'eth_getBalance':
        return primaryChainType === ChainType.Evm ? `0x${(1000000000000000000).toString(16)}` : undefined;

      case 'wallet_switchEthereumChain':
        // Update the current chain ID
        if (req.params?.[0] && typeof req.params[0] === 'object' && 'chainId' in req.params[0]) {
          const requestedChainId = (req.params[0] as { chainId: string }).chainId;

          // Convert hex chainId to CAIP-2 format if needed
          let newChainId: string;
          if (requestedChainId.startsWith('0x')) {
            const chainIdNum = Number.parseInt(requestedChainId, 16);
            newChainId = `eip155:${chainIdNum}`;
          } else if (requestedChainId.startsWith('eip155:')) {
            newChainId = requestedChainId;
          } else {
            // Assume it's a decimal string
            newChainId = `eip155:${requestedChainId}`;
          }

          this.logger?.debug('Switching chain', {
            from: this.currentChainId,
            to: newChainId,
            requested: requestedChainId,
          });
          this.currentChainId = newChainId;

          // Emit chainChanged event with hex format for compatibility
          const handlers = this.chainChangedHandlers;
          this.logger?.debug('Emitting chainChanged to handlers', {
            count: handlers.length,
          });
          const chainIdNum = Number.parseInt(newChainId.split(':')[1] || '1', 10);
          const hexChainId = `0x${chainIdNum.toString(16)}`;
          for (const handler of handlers) {
            handler(hexChainId);
          }
        }
        return null;

      case 'aztec_getAddress':
        return primaryChainType === ChainType.Aztec ? mockAccounts[0] : undefined;
      case 'aztec_requestAccounts':
        return primaryChainType === ChainType.Aztec ? mockAccounts : undefined;

      case 'aztec_getChainId':
        return primaryChainType === ChainType.Aztec ? mockChainId : undefined;

      case 'aztec_signMessage':
        return primaryChainType === ChainType.Aztec ? '0xmocksignature' : undefined;

      case 'solana_connect':
        return primaryChainType === ChainType.Solana ? { publicKey: mockAccounts[0] } : undefined;

      default:
        return null;
    }
  }

  /**
   * Disconnect from the debug wallet
   */
  protected async doDisconnect(): Promise<void> {
    this.logger?.info('[DebugWallet] Disconnecting');

    // Disconnect transport
    if (this.debugTransport) {
      await this.debugTransport.disconnect();
      this.debugTransport = undefined as unknown as DebugWalletTransport;
    }

    // Clear handlers
    this.chainChangedHandlers = [];
    this.accountsChangedHandlers = [];

    this.logger?.info('[DebugWallet] Disconnected successfully');
  }

  /**
   * Set up provider event listeners
   */
  protected override setupProviderListeners(_provider: WalletProvider): void {
    const mockProvider = this.mockProvider;

    // Forward events from mock provider
    (mockProvider as { on: (event: string, handler: (data: string) => void) => void }).on(
      'chainChanged',
      (chainId: string) => {
        this.emitBlockchainEvent('chainChanged', { chainId, chainType: ChainType.Evm });
      },
    );

    (mockProvider as { on: (event: string, handler: (data: string[]) => void) => void }).on(
      'accountsChanged',
      (accounts: string[]) => {
        this.emitBlockchainEvent('accountsChanged', { accounts, chainType: ChainType.Evm });
      },
    );
  }

  /**
   * Detect wallet availability
   */
  async detect(): Promise<DetectionResult> {
    return {
      isInstalled: this.config.available !== false,
      isReady: true,
      version: '1.0.0-debug',
      metadata: {
        supportedChains: this.config.chains || [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
      },
    };
  }

  /**
   * Get wallet info
   */
  static getWalletInfo(): WalletInfo {
    return {
      id: 'debug-wallet',
      name: 'Debug Wallet',
      icon: '🐛',
      chains: [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
      features: ['sign-message', 'sign-transaction', 'batch-transactions'],
    };
  }
}

/**
 * Example usage demonstrating multi-chain support:
 *
 * ```typescript
 * import { DebugWallet } from '@walletmesh/modal-core';
 *
 * // Create debug wallet with all chains supported
 * const debugWallet = new DebugWallet({
 *   chains: [ChainType.Evm, ChainType.Aztec, ChainType.Solana]
 * });
 *
 * // Connect to the wallet
 * const connection = await debugWallet.connect();
 *
 * // Use the provider directly
 * const provider = connection.provider;
 *
 * // For EVM chains
 * if (connection.chainType === ChainType.Evm) {
 *   await provider.request({ method: 'eth_sendTransaction', params: [...] });
 * }
 *
 * // For Aztec chains
 * if (connection.chainType === ChainType.Aztec) {
 *   await provider.deployContract(...);
 * }
 *
 * // For Solana chains
 * if (connection.chainType === ChainType.Solana) {
 *   await provider.sendTransaction(...);
 * }
 * ```
 *
 * The debug wallet returns mock providers that simulate blockchain
 * operations without requiring actual blockchain libraries.
 */

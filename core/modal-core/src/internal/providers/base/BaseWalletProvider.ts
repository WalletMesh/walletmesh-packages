/**
 * Base Wallet Provider - Blockchain API Layer Implementation
 *
 * ARCHITECTURAL ROLE: Providers handle the blockchain API - they implement
 * the programming interface that dApps use to interact with blockchains.
 * They are the API specialists that know blockchain-specific protocols and standards.
 *
 * RELATIONSHIP WITH ADAPTERS:
 * - Adapters handle HOW to connect to wallets (connection layer)
 * - Providers handle WHAT operations to perform (API layer)
 * - Adapters create providers with an established transport
 * - Providers use that transport to send blockchain operations
 *
 * @see ADAPTER_PROVIDER_ARCHITECTURE.md for detailed architecture explanation
 * @module internal/providers/BaseWalletProvider
 * @packageDocumentation
 */

import { JSONRPCNode } from '@walletmesh/jsonrpc';
import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type {
  BaseWalletProvider as IBaseWalletProvider,
  WalletEventMap,
  WalletMethodMap,
} from '../../../api/types/providers.js';
import type { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { Logger } from '../../core/logger/logger.js';

/**
 * Context object shared across all JSON-RPC methods for wallet providers
 *
 * @public
 */
export interface WalletProviderContext extends Record<string, unknown> {
  /** Chain type this provider handles */
  chainType: ChainType;
  /** Chain ID currently connected to */
  chainId: string;
  /** Connected accounts */
  accounts: string[];
  /** Whether the provider is connected */
  isConnected: boolean;
  /** Additional provider-specific data */
  providerData?: Record<string, unknown>;
}

/**
 * Base Wallet Provider - Foundation for blockchain API implementations
 *
 * PURPOSE: Providers are API LAYER components that implement blockchain-specific
 * standards and operations. They provide the programming interface that dApps
 * use to interact with blockchains (send transactions, sign messages, query balances, etc.)
 *
 * ARCHITECTURAL SEPARATION:
 * - Providers: Handle blockchain API (this class)
 * - Adapters: Handle wallet connection (create providers after connection)
 *
 * KEY CONCEPTS:
 * - Providers implement blockchain standards (EIP-1193 for EVM, Solana Wallet Standard, etc.)
 * - They translate dApp requests into blockchain-specific JSON-RPC calls
 * - They use the transport provided by adapters, but don't know connection details
 * - Multiple wallets can use the same provider implementation (code reuse)
 *
 * @public
 * @abstract
 * @example
 * ```typescript
 * // Implementing a blockchain provider (API layer)
 * class MyEvmProvider extends BaseWalletProvider {
 *   // Provider receives transport from adapter
 *   constructor(
 *     chainType: ChainType,
 *     transport: JSONRPCTransport,  // Established by adapter
 *     chainId: string,
 *     logger: Logger
 *   ) {
 *     super(chainType, transport, chainId, logger);
 *   }
 *
 *   // Implement blockchain-specific operations
 *   async sendTransaction(tx: EvmTransaction): Promise<string> {
 *     return this.jsonrpcNode.callMethod('eth_sendTransaction', [tx]);
 *   }
 *
 *   async signMessage(account: string, message: string): Promise<string> {
 *     return this.jsonrpcNode.callMethod('eth_signMessage', [account, message]);
 *   }
 * }
 * ```
 *
 * @remarks
 * - Providers know blockchain protocols, not wallet connection details
 * - They receive transport from adapters and use it for communication
 * - This separation enables standard compliance and code reuse
 *
 * @see ADAPTER_PROVIDER_ARCHITECTURE.md for architecture details
 */
export abstract class BaseWalletProvider implements IBaseWalletProvider {
  protected readonly jsonrpcNode: JSONRPCNode<WalletMethodMap, WalletEventMap, WalletProviderContext>;
  protected context: WalletProviderContext;
  private readonly eventListeners = new Map<string, Set<(...args: unknown[]) => void>>();
  private readonly cleanupFunctions: Array<() => void> = [];
  protected logger: Logger;

  /**
   * Create a new BaseWalletProvider
   *
   * @param chainType - The blockchain type this provider handles
   * @param transport - JSONRPCTransport for communication with the wallet
   * @param initialChainId - Initial chain ID (optional)
   * @param logger - Logger instance for debugging
   */
  constructor(
    chainType: ChainType,
    transport: JSONRPCTransport,
    initialChainId: string | undefined,
    logger: Logger,
  ) {
    this.context = {
      chainType,
      chainId: initialChainId || '',
      accounts: [],
      isConnected: false,
      providerData: {},
    };

    this.jsonrpcNode = new JSONRPCNode<WalletMethodMap, WalletEventMap, WalletProviderContext>(
      transport,
      this.context,
    );

    this.logger = logger;
    this.setupEventHandlers();
  }

  /**
   * Get connected accounts
   *
   * @returns Promise resolving to array of account addresses
   * @throws If provider is not connected or request fails
   */
  async getAccounts(): Promise<string[]> {
    if (!this.context.isConnected) {
      throw ErrorFactory.connectionFailed('Provider not connected');
    }

    try {
      const accounts = await this.handleGetAccounts();
      this.updateContext({ accounts });
      return accounts;
    } catch (error) {
      throw ErrorFactory.transportError(
        `Failed to get accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get current chain ID
   *
   * @returns Promise resolving to chain ID string
   * @throws If provider is not connected or request fails
   */
  async getChainId(): Promise<string> {
    if (!this.context.isConnected) {
      throw ErrorFactory.connectionFailed('Provider not connected');
    }

    try {
      const chainId = await this.handleGetChainId();
      this.updateContext({ chainId });
      return chainId;
    } catch (error) {
      throw ErrorFactory.transportError(
        `Failed to get chain ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Add event listener
   *
   * @param event - Event name to listen for
   * @param listener - Callback function to call when event occurs
   */
  on(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove event listener
   *
   * @param event - Event name to stop listening for
   * @param listener - Callback function to remove
   */
  off(event: string, listener: (...args: unknown[]) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  /**
   * Remove all event listeners
   *
   * @param event - Optional event name to remove all listeners for.
   *                If not provided, removes all listeners for all events.
   */
  removeAllListeners(event?: string): void {
    if (event !== undefined) {
      // Remove all listeners for specific event
      this.eventListeners.delete(event);
    } else {
      // Remove all listeners for all events
      this.eventListeners.clear();
    }
  }

  /**
   * Disconnect from wallet
   *
   * @returns Promise that resolves when disconnection is complete
   */
  async disconnect(): Promise<void> {
    try {
      await this.handleDisconnect();
      this.updateContext({
        isConnected: false,
        accounts: [],
        chainId: '',
      });
      this.emit('disconnect', { code: 0, message: 'Disconnected by user' });
    } catch (error) {
      throw ErrorFactory.transportError(
        `Failed to disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      // Clean up resources
      this.cleanup();
    }
  }

  // Note: The request() method has been removed from BaseWalletProvider.
  // Each blockchain provider should implement its own communication pattern:
  // - EVM providers: implement request() following EIP-1193
  // - Solana providers: implement Solana-specific methods
  // - Aztec providers: use the call() pattern via WalletRouterProvider
  // This allows each blockchain to use its natural interface without forcing
  // a one-size-fits-all approach.

  /**
   * Get the current provider context
   *
   * @returns Current context object
   * @protected
   */
  protected getContext(): WalletProviderContext {
    return { ...this.context };
  }

  /**
   * Update the provider context
   *
   * @param updates - Partial context updates
   * @protected
   */
  protected updateContext(updates: Partial<WalletProviderContext>): void {
    this.context = { ...this.context, ...updates };
    // Update the JSONRPCNode context
    Object.assign(this.jsonrpcNode.context, this.context);
  }

  /**
   * Emit an event to listeners
   *
   * @param event - Event name
   * @param data - Event data
   * @protected
   */
  protected emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (error) {
          this.logger.error(`Error in event listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Set up event handlers for JSON-RPC events
   *
   * @private
   */
  private setupEventHandlers(): void {
    // Handle accounts changed event
    const accountsCleanup = this.jsonrpcNode.on('accountsChanged', (accounts: string[]) => {
      this.updateContext({ accounts });
      this.emit('accountsChanged', accounts);
    });
    this.cleanupFunctions.push(accountsCleanup);

    // Handle chain changed event
    const chainCleanup = this.jsonrpcNode.on('chainChanged', (chainId: string) => {
      this.updateContext({ chainId });
      this.emit('chainChanged', chainId);
    });
    this.cleanupFunctions.push(chainCleanup);

    // Handle disconnect event
    const disconnectCleanup = this.jsonrpcNode.on('disconnect', (data: { code: number; message: string }) => {
      this.updateContext({ isConnected: false, accounts: [], chainId: '' });
      this.emit('disconnect', data);
    });
    this.cleanupFunctions.push(disconnectCleanup);

    // Handle connect event
    const connectCleanup = this.jsonrpcNode.on('connect', (data: { chainId: string; accounts: string[] }) => {
      this.updateContext({
        isConnected: true,
        chainId: data.chainId,
        accounts: data.accounts,
      });
      this.emit('connect', data);
    });
    this.cleanupFunctions.push(connectCleanup);

    // Handle generic message events
    const messageCleanup = this.jsonrpcNode.on('message', (data: { type: string; data: unknown }) => {
      this.emit('message', data);
    });
    this.cleanupFunctions.push(messageCleanup);
  }

  /**
   * Clean up resources and event listeners
   *
   * @private
   */
  private cleanup(): void {
    // Clean up JSON-RPC event handlers
    for (const cleanup of this.cleanupFunctions) {
      cleanup();
    }
    this.cleanupFunctions.length = 0;

    // Clear local event listeners
    this.eventListeners.clear();
  }

  // Abstract methods that must be implemented by subclasses

  /**
   * Handle getting accounts - must be implemented by subclasses
   *
   * @returns Promise resolving to array of account addresses
   * @throws If request fails
   * @protected
   * @abstract
   */
  protected abstract handleGetAccounts(): Promise<string[]>;

  /**
   * Handle getting chain ID - must be implemented by subclasses
   *
   * @returns Promise resolving to chain ID string
   * @throws If request fails
   * @protected
   * @abstract
   */
  protected abstract handleGetChainId(): Promise<string>;

  /**
   * Handle disconnection - must be implemented by subclasses
   *
   * @returns Promise that resolves when disconnection is complete
   * @throws If disconnection fails
   * @protected
   * @abstract
   */
  protected abstract handleDisconnect(): Promise<void>;
}

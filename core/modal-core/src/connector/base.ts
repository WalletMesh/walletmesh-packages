/**
 * @packageDocumentation
 * Base connector implementation
 */

import type {
  Transport,
  Protocol,
  Provider,
  ProtocolMessage,
  ErrorHandler,
  CleanupHandler
} from './types.js';
import type { Message } from '../transport/types.js';
import type { WalletInfo, WalletState, ConnectedWallet, Connector } from '../types.js';
import { ConnectionStatus } from '../types.js';
import type { ProtocolError } from '../transport/errors.js';
import { TransportError } from '../transport/errors.js';
import { TransportErrorCode } from '../transport/errors.js';
import { isProtocolError } from '../transport/errors.js';

/**
 * Base connector implementation
 */
export abstract class BaseConnector<T extends ProtocolMessage = ProtocolMessage> implements Connector {
  /**
   * Transport instance
   */
  protected transport: Transport;

  /**
   * Protocol instance
   */
  protected protocol: Protocol<T>;

  /**
   * Cleanup handlers
   */
  private cleanupHandlers = new Set<CleanupHandler>();

  /**
   * Bound error handler function
   */
  private boundErrorHandler: ErrorHandler;

  /**
   * Connection state
   */
  private isConnectedState = false;

  /**
   * Current wallet
   */
  protected currentWallet: ConnectedWallet | null = null;

  constructor(transport?: Transport, protocol?: Protocol<T>) {
    this.transport = transport ?? {} as Transport;
    this.protocol = protocol ?? {} as Protocol<T>;
    this.boundErrorHandler = this.handleTransportError.bind(this);
  }

  /**
   * Gets provider instance
   */
  abstract getProvider(): Promise<Provider>;

  /**
   * Generic request method implementation
   */
  async request<TReq = unknown, TRes = unknown>(
    method: string,
    params?: TReq[]
  ): Promise<TRes> {
    return this.sendRequest<TReq, TRes>(method, params ?? []);
  }

  /**
   * Checks if connector is connected
   */
  isConnected(): boolean {
    return this.isConnectedState;
  }

  /**
   * Gets current connection state
   */  
  getState(): ConnectionStatus {
    return this.isConnected() ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED;
  }

  /**
   * Connects to wallet
   */
  async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    try {
      // Initialize connection state
      await this.transport.connect();
      this.transport.addErrorHandler(this.boundErrorHandler);

      // Set connection state
      this.isConnectedState = true;

      // Perform wallet-specific connect operations
      await this.doConnect(walletInfo);
      
      if (!this.currentWallet) {
        throw new TransportError(
          'Failed to create wallet connection',
          TransportErrorCode.CONNECTION_FAILED
        );
      }

      return this.currentWallet;
    } catch (error) {
      // Cleanup on failure
      this.isConnectedState = false;
      this.runCleanup();
      throw error;
    }
  }

  /**
   * Disconnects from wallet
   */
  async disconnect(): Promise<void> {
    try {
      if (this.isConnected()) {
        await this.doDisconnect();
        await this.transport.disconnect();
      }
    } finally {
      this.isConnectedState = false;
      this.currentWallet = null;
      this.runCleanup();
    }
  }

  /**
   * Resumes previous connection
   */
  async resume(walletInfo: WalletInfo, state: WalletState): Promise<ConnectedWallet> {
    try {
      await this.transport.connect();
      
      // Set up connection state and error handling
      this.transport.addErrorHandler(this.boundErrorHandler);
      this.isConnectedState = true;
      await this.doConnect(walletInfo);

      // Update wallet with previous state
      this.currentWallet = this.createConnectedWallet(walletInfo, state);

      if (!this.currentWallet) {
        throw new TransportError(
          'Failed to resume wallet connection',
          TransportErrorCode.CONNECTION_FAILED
        );
      }

      return this.currentWallet;
    } catch (error) {
      this.isConnectedState = false;
      this.runCleanup();
      throw error;
    }
  }

  /**
   * Creates connected wallet instance
   */
  protected abstract createConnectedWallet(
    info: WalletInfo,
    state?: WalletState
  ): ConnectedWallet;

  /**
   * Performs wallet-specific connect operations
   */
  protected abstract doConnect(walletInfo: WalletInfo): Promise<void>;

  /**
   * Performs wallet-specific disconnect operations
   */
  protected abstract doDisconnect(): Promise<void>;

  /**
   * Handles protocol messages
   */
  protected abstract handleProtocolMessage(message: Message): void;

  /**
   * Handles protocol errors
   */
  protected handleProtocolError(error: ProtocolError): void {
    // Base implementation - can be overridden
    console.error('Protocol error:', error);
  }

  /**
   * Adds a cleanup handler
   */
  protected addCleanupHandler(handler: CleanupHandler): void {
    this.cleanupHandlers.add(handler);
  }

  /**
   * Removes a cleanup handler
   */
  protected removeCleanupHandler(handler: CleanupHandler): void {
    this.cleanupHandlers.delete(handler);
  }

  /**
   * Runs cleanup handlers
   */
  protected runCleanup(): void {
    // Run each cleanup handler
    for (const handler of this.cleanupHandlers) {
      try {
        handler();
      } catch (error) {
        console.error('Error in cleanup handler:', error);
      }
    }
    
    // Remove transport handler and clear
    if (this.boundErrorHandler) {
      this.transport.removeErrorHandler(this.boundErrorHandler);
    }
    
    // Clear handlers
    this.cleanupHandlers.clear();
  }

  /**
   * Handles transport errors
   */
  protected handleTransportError(error: Error): void {
    if (error instanceof TransportError && error.code === TransportErrorCode.CONNECTION_FAILED) {
      this.isConnectedState = false;
      this.runCleanup();
    }
  }

  /**
   * Validates message format and content
   */
  protected async validateMessage(message: Message): Promise<void> {
    const result = this.protocol.validateMessage(message);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Sends a request through the transport
   */
  protected async sendRequest<TReq, TRes>(
    method: string,
    params: TReq[]
  ): Promise<TRes> {
    if (!this.isConnected()) {
      throw new TransportError('Transport not connected', TransportErrorCode.NOT_CONNECTED);
    }

    try {
      const request = this.protocol.createRequest(method, {
        method,
        params,
      } as unknown as T['request']);

      const response = await this.transport.send<T['request'], T['response']>(
        request as Message<T['request']>
      );
      
      await this.validateMessage(response);

      const payload = response.payload as { result?: TRes; error?: string };
      if (payload.error) {
        throw new Error(payload.error);
      }

      return payload.result ?? ({} as TRes);
    } catch (error) {
      if (isProtocolError(error)) {
        this.handleProtocolError(error);
      }
      throw error;
    }
  }
}

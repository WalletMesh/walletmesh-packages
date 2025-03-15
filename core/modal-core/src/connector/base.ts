/**
 * @packageDocumentation
 * Base connector implementation for WalletMesh.
 */

import type { Protocol, Transport, Message, MessageHandler, ProtocolPayload, ValidationResult } from '../transport/index.js';
import type { WalletInfo, WalletState, ConnectedWallet, ConnectorImplementationConfig } from '../types.js';
import { 
  TransportError, 
  TransportErrorCode, 
  MessageType,
  ProtocolError,
  ProtocolErrorCode,
} from '../transport/index.js';

/**
 * Request message structure
 */
interface RequestMessage<T = unknown> {
  method: string;
  params: T;
}

/**
 * Base connector messages
 */
export interface ConnectorMessages extends ProtocolPayload {
  request: RequestMessage;
  response: {
    result?: unknown;
    error?: string;
  };
}

/**
 * Abstract base class for wallet connectors.
 * Provides common functionality and structure for protocol-specific implementations.
 */
export abstract class BaseConnector<T extends ConnectorMessages = ConnectorMessages> {
  protected transport: Transport;
  protected protocol: Protocol<T>;
  protected connected = false;
  protected currentWallet: ConnectedWallet | null = null;
  protected type: string;

  constructor(config: ConnectorImplementationConfig) {
    this.transport = config.transport;
    this.protocol = config.protocol as Protocol<T>;
    this.type = config.type;
  }

  /**
   * Establishes a connection with a wallet.
   * @param walletInfo Information about the wallet to connect
   * @returns Connected wallet details
   */
  async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (this.connected) {
      throw new TransportError('Connector already connected', TransportErrorCode.CONNECTION_FAILED);
    }

    try {
      await this.transport.connect();

      // Subscribe to messages
      this.transport.subscribe(this.createMessageHandler());

      // Request connection
      const response = await this.sendRequest('connect', { walletInfo });
      this.currentWallet = response as ConnectedWallet;

      this.connected = true;
      return this.currentWallet;
    } catch (error) {
      await this.disconnect();
      throw new TransportError('Failed to connect wallet', TransportErrorCode.CONNECTION_FAILED);
    }
  }

  /**
   * Resumes an existing wallet connection.
   * @param walletInfo Wallet information
   * @param state Previous wallet state
   * @returns Reconnected wallet details
   */
  async resume(walletInfo: WalletInfo, state: WalletState): Promise<ConnectedWallet> {
    if (this.connected) {
      throw new TransportError('Connector already connected', TransportErrorCode.CONNECTION_FAILED);
    }

    try {
      await this.transport.connect();

      // Subscribe to messages
      this.transport.subscribe(this.createMessageHandler());

      // Request resume
      const response = await this.sendRequest('resume', { walletInfo, state });
      this.currentWallet = response as ConnectedWallet;

      this.connected = true;
      return this.currentWallet;
    } catch (error) {
      await this.disconnect();
      throw new TransportError(
        'Failed to resume wallet connection',
        TransportErrorCode.CONNECTION_FAILED
      );
    }
  }

  /**
   * Terminates the wallet connection.
   */
  async disconnect(): Promise<void> {
    try {
      // Send disconnect request if we were connected
      if (this.connected) {
        await this.sendRequest('disconnect', {});
      }
    } catch (error) {
      console.warn('Error during disconnect request:', error);
    } finally {
      // Always attempt to disconnect transport and clean up state
      try {
        await this.transport.disconnect();
      } catch (error) {
        console.warn('Error during transport disconnect:', error);
      }
      this.connected = false;
      this.currentWallet = null;
    }
  }

  /**
   * Processes incoming messages from the transport.
   */
  handleMessage(data: unknown): void {
    try {
      const parseResult = this.protocol.parseMessage(data);
      if (!parseResult.success) {
        throw parseResult.error;
      }

      const message = parseResult.data;
      const validateResult = this.protocol.validateMessage(message);
      if (!validateResult.success) {
        throw validateResult.error;
      }

      this.handleProtocolMessage(validateResult.data);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /**
   * Gets the chain-specific provider instance.
   */
  abstract getProvider(): Promise<unknown>;

  /**
   * Handles protocol-specific messages.
   * @param message The parsed message to handle
   */
  protected abstract handleProtocolMessage(message: Message): void;

  /**
   * Creates a message handler for the transport.
   */
  private createMessageHandler(): MessageHandler {
    return {
      canHandle: () => true, // Handle all messages
      handle: async (message: Message) => {
        this.handleMessage(message);
      },
    };
  }

  /**
   * Sends a request through the transport.
   */
  protected async sendRequest<P, R = unknown>(method: string, params: P): Promise<R> {
    if (!this.transport.isConnected()) {
      throw new TransportError('Transport not connected', TransportErrorCode.TRANSPORT_ERROR);
    }

    // Create request message
    const request = this.protocol.createRequest(method, { method, params } as T['request']);

    // Send request and get response
    const response = await this.transport.send<T['request'], T['response']>(request);

    // Validate response
    const validation = this.protocol.validateMessage(response);
    if (!validation.success) {
      throw validation.error;
    }

    // Handle error responses
    if (validation.data.type === MessageType.ERROR) {
      throw new ProtocolError(
        'Protocol error response received',
        ProtocolErrorCode.VALIDATION_FAILED,
        validation.data.payload
      );
    }

    const payload = validation.data.payload as T;
    if (payload.response?.error) {
      throw new ProtocolError(
        'Protocol error response received',
        ProtocolErrorCode.VALIDATION_FAILED,
        payload
      );
    }

    // Return successful result
    return (payload.response?.result ?? null) as R;
  }

  /**
   * Checks if the connector is currently connected.
   */
  isConnected(): boolean {
    return this.connected && this.transport.isConnected();
  }

  /**
   * Gets the currently connected wallet.
   */
  getConnectedWallet(): ConnectedWallet | null {
    return this.currentWallet;
  }

  /**
   * Gets the connector type.
   */
  getType(): string {
    return this.type;
  }
}

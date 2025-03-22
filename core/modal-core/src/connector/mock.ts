/**
 * @packageDocumentation
 * Mock connector implementation for testing.
 */

import { BaseConnector } from './base.js';
import { MessageType, type Message } from '../transport/index.js';
import type { Transport, ProtocolMessage } from './types.js';
import type { ConnectedWallet, WalletInfo, WalletState } from '../types.js';
import { TransportError, TransportErrorCode } from '../transport/errors.js';
import { ProtocolError, ProtocolErrorCode } from '../transport/errors.js';

interface MockRequest {
  method: string;
  params: unknown[];
}

interface MockResponse {
  result: unknown;
}

export interface MockMessageTypes extends ProtocolMessage {
  request: MockRequest;
  response: MockResponse;
}

/**
 * Mock connector configuration
 */
export interface MockConnectorConfig {
  /** Default address to return */
  address?: string;
  /** Default chain ID */
  chainId?: number;
  /** Whether to simulate connection failures */
  shouldFail?: boolean;
  /** Simulated response delay in ms */
  responseDelay?: number;
  /** Additional options for backward compatibility */
  options?: Record<string, unknown>;
}

/**
 * Mock connector implementation for testing
 * @deprecated Use MockConnector with MockConnectorConfig instead of ConnectorImplementationConfig
 */
export type LegacyMockConfig = {
  type: string;
  name: string;
  options?: {
    address?: string;
    chainId?: number;
    shouldFail?: boolean;
    responseDelay?: number;
  };
};

/**
 * Mock connector implementation for testing
 */
export class MockConnector extends BaseConnector<MockMessageTypes> {
  protected override currentWallet: ConnectedWallet | null = null;
  private _connected = false;
  private readonly config: Required<Omit<MockConnectorConfig, 'options'>>;

  constructor(config: MockConnectorConfig | LegacyMockConfig = {}) {
    // Handle legacy config format
    const options = 'type' in config ? config.options || {} : config;

    const normalizedConfig = {
      address: options.address || '0x1234567890123456789012345678901234567890',
      chainId: options.chainId || 1,
      shouldFail: options.shouldFail || false,
      responseDelay: options.responseDelay || 0,
    };

    const transport: Transport = {
      connect: async () => {
        if (normalizedConfig.shouldFail) {
          throw new TransportError('Connection failed', TransportErrorCode.CONNECTION_FAILED);
        }
        if (normalizedConfig.responseDelay) {
          await new Promise((resolve) => setTimeout(resolve, normalizedConfig.responseDelay));
        }
      },
      disconnect: async () => {},
      isConnected: () => this._connected,
      getState: () => (this._connected ? 'connected' : 'disconnected'),
      send: async <T = unknown, R = unknown>(message: Message<T>): Promise<Message<R>> => {
        if (normalizedConfig.responseDelay) {
          await new Promise((resolve) => setTimeout(resolve, normalizedConfig.responseDelay));
        }
        return {
          id: message.id,
          type: MessageType.RESPONSE,
          timestamp: Date.now(),
          payload: {
            result: true,
          } as unknown as R,
        };
      },
      subscribe: () => () => {},
      addErrorHandler: () => {},
      removeErrorHandler: () => {},
    };

    const protocol = {
      createRequest: <M extends string>(method: M, params: MockRequest): Message<MockRequest> => ({
        id: String(Date.now()),
        type: MessageType.REQUEST,
        payload: { method, params: params.params },
        timestamp: Date.now(),
      }),
      createResponse: (id: string, result: MockResponse): Message<MockResponse> => ({
        id,
        type: MessageType.RESPONSE,
        payload: { result: result.result },
        timestamp: Date.now(),
      }),
      createError: (id: string, error: Error): Message<MockRequest> => ({
        id,
        type: MessageType.ERROR,
        payload: { method: 'error', params: [error.message] },
        timestamp: Date.now(),
      }),
      formatMessage: <K extends keyof MockMessageTypes>(message: Message<MockMessageTypes[K]>): unknown =>
        message,
      validateMessage: <K extends keyof MockMessageTypes>(
        message: unknown,
      ): { success: true; data: Message<MockMessageTypes[K]> } | { success: false; error: ProtocolError } => {
        if (!message) {
          return {
            success: false,
            error: new ProtocolError('Invalid message', ProtocolErrorCode.INVALID_FORMAT),
          };
        }
        return {
          success: true,
          data: message as Message<MockMessageTypes[K]>,
        };
      },
      parseMessage: <K extends keyof MockMessageTypes>(
        data: unknown,
      ): { success: true; data: Message<MockMessageTypes[K]> } => ({
        success: true,
        data: data as Message<MockMessageTypes[K]>,
      }),
    };

    super(transport, protocol);
    this.config = normalizedConfig;
  }

  protected async handleProtocolMessage(
    message: Message<MockMessageTypes[keyof MockMessageTypes]>,
  ): Promise<void> {
    if (
      message.type === MessageType.REQUEST &&
      'method' in message.payload &&
      message.payload.method === 'connect'
    ) {
      this._connected = true;
    }
  }

  protected createConnectedWallet(_info: WalletInfo, state?: WalletState): ConnectedWallet {
    return {
      address: this.config.address,
      chainId: state?.networkId || this.config.chainId,
      publicKey: '0x',
      connected: true,
    };
  }

  public override isConnected(): boolean {
    return this._connected;
  }

  public async getProvider() {
    return {
      request: async <T>() => ({}) as T,
      connect: async () => {
        this._connected = true;
      },
      disconnect: async () => {
        this._connected = false;
      },
      isConnected: () => this._connected,
    };
  }

  protected async doConnect(walletInfo: WalletInfo): Promise<void> {
    if (this.config.shouldFail) {
      throw new TransportError('Connection failed', TransportErrorCode.CONNECTION_FAILED);
    }
    if (this.config.responseDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.responseDelay));
    }
    this._connected = true;
    this.currentWallet = this.createConnectedWallet(walletInfo);
  }

  protected async doDisconnect(): Promise<void> {
    this._connected = false;
    this.currentWallet = null;
  }

  /**
   * Test utility method for processing protocol messages
   * @param message The message to process
   */
  public processTestMessage(message: Message<MockMessageTypes[keyof MockMessageTypes]>): void {
    this.handleProtocolMessage(message);
  }
}

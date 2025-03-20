/**
 * @packageDocumentation
 * Mock connector implementation for testing.
 */

import { BaseConnector } from './base.js';
import { MessageType, type Message } from '../transport/index.js';
import type { Transport, ProtocolMessage } from './types.js';
import type { ConnectedWallet, WalletInfo, WalletState, ConnectorImplementationConfig } from '../types.js';
import { ProtocolError, ProtocolErrorCode } from '../transport/errors.js';

interface MockRequest {
  method: string;
  params: unknown[];
}

interface MockResponse {
  result: unknown;
}

export interface MockMessages extends ProtocolMessage {
  request: MockRequest;
  response: MockResponse;
}

/**
 * Mock connector implementation for testing
 */
export class MockConnector extends BaseConnector<MockMessages> {
  protected override currentWallet: ConnectedWallet | null = null;
  private readonly config: {
    address: string;
    chainId: number;
    shouldFail: boolean;
    responseDelay: number;
  };
  private _connected = false;

  constructor(config: ConnectorImplementationConfig) {
    const defaults = {
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      shouldFail: false,
      responseDelay: 0,
      ...(config.options || {})
    };

    const mockTransport: Transport = {
      connect: async () => {
        if (defaults.shouldFail) {
          throw new Error('Connection failed');
        }
        if (defaults.responseDelay) {
          await new Promise(resolve => setTimeout(resolve, defaults.responseDelay));
        }
      },
      disconnect: async () => {},
      isConnected: () => this._connected,
      getState: () => this._connected ? 'connected' : 'disconnected',
      send: async <T = unknown, R = unknown>(message: Message<T>): Promise<Message<R>> => {
        if (defaults.responseDelay) {
          await new Promise(resolve => setTimeout(resolve, defaults.responseDelay));
        }
        return {
          id: message.id,
          type: MessageType.RESPONSE,
          timestamp: Date.now(),
          payload: {
            result: true
          } as unknown as R
        };
      },
      subscribe: () => () => {},
      addErrorHandler: () => {},
      removeErrorHandler: () => {}
    };

    const protocol = {
      createRequest: <M extends string>(method: M, params: MockRequest): Message<MockRequest> => ({
        id: String(Date.now()),
        type: MessageType.REQUEST,
        payload: { method, params: params.params },
        timestamp: Date.now()
      }),
      createResponse: (id: string, result: MockResponse): Message<MockResponse> => ({
        id,
        type: MessageType.RESPONSE,
        payload: { result: result.result },
        timestamp: Date.now()
      }),
      createError: (id: string, error: Error): Message<MockRequest> => ({
        id,
        type: MessageType.ERROR,
        payload: { method: 'error', params: [error.message] },
        timestamp: Date.now()
      }),
      formatMessage: <K extends keyof MockMessages>(message: Message<MockMessages[K]>): unknown => message,
      validateMessage: <K extends keyof MockMessages>(
        message: unknown
      ): { success: true; data: Message<MockMessages[K]> } | { success: false; error: ProtocolError } => {
        if (!message) {
          return {
            success: false,
            error: new ProtocolError('Invalid message', ProtocolErrorCode.INVALID_FORMAT)
          };
        }
        return { 
          success: true, 
          data: message as Message<MockMessages[K]>
        };
      },
      parseMessage: <K extends keyof MockMessages>(
        data: unknown
      ): { success: true; data: Message<MockMessages[K]> } => ({ 
        success: true, 
        data: data as Message<MockMessages[K]>
      })
    };

    super(mockTransport, protocol);
    this.config = defaults;
  }

  protected createConnectedWallet(_info: WalletInfo, state?: WalletState): ConnectedWallet {
    return {
      address: this.config.address,
      chainId: state?.networkId || this.config.chainId,
      publicKey: '0x',
      connected: true
    };
  }

  protected async doConnect(walletInfo: WalletInfo): Promise<void> {
    const provider = await this.getProvider();
    await provider.connect();
    this.currentWallet = this.createConnectedWallet(walletInfo);
  }

  protected async doDisconnect(): Promise<void> {
    const provider = await this.getProvider();
    await provider.disconnect();
    this.currentWallet = null;
  }

  public override isConnected(): boolean {
    return this._connected;
  }

  public getConnectedWallet(): ConnectedWallet | null {
    return this.currentWallet;
  }

  public processTestMessage(message: Message<MockMessages[keyof MockMessages]>): void {
    this.handleProtocolMessage(message);
  }

  protected async handleProtocolMessage(message: Message<MockMessages[keyof MockMessages]>): Promise<void> {
    if (message.type === MessageType.REQUEST && 
        'method' in message.payload && 
        message.payload.method === 'connect') {
      this._connected = true;
    }
  }

  public async getProvider() {
    return {
      request: async <T>() => ({} as T),
      connect: async () => { this._connected = true; },
      disconnect: async () => { this._connected = false; },
      isConnected: () => this._connected
    };
  }
}
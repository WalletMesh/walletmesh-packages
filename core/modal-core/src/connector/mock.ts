/**
 * @packageDocumentation
 * Mock connector implementation for testing.
 */

import { BaseConnector, type ConnectorMessages } from './base.js';
import { 
  MessageType, 
  type Message,
  ProtocolError,
  ProtocolErrorCode,
  TransportError,
  TransportErrorCode,
  type ValidationResult,
  ProtocolValidator
} from '../transport/index.js';
import type { ConnectedWallet, WalletInfo, WalletState } from '../types.js';

/**
 * Mock provider interface
 */
export interface MockProvider {
  isConnected: boolean;
  address: string;
  chainId: string;
}

/**
 * Mock connector messages
 */
export interface MockMessages extends ConnectorMessages {
  request: {
    method: string;
    params: unknown;
  };
  response: {
    address?: string;
    chainId?: string;
    connected?: boolean;
    error?: string;
  };
}

/**
 * Mock connector configuration
 */
export interface MockConnectorConfig {
  /** Default address to return */
  address?: string;
  /** Default chain ID */
  chainId?: string;
  /** Whether to simulate connection failures */
  shouldFail?: boolean;
  /** Simulated response delay in ms */
  responseDelay?: number;
}

/**
 * Mock connector implementation for testing.
 */
export class MockConnector extends BaseConnector<MockMessages> {
  private provider: MockProvider;
  private config: Required<MockConnectorConfig>;
  private validator: ProtocolValidator<MockMessages>;

  constructor(config: MockConnectorConfig = {}) {
    // Initialize validator
    const validator = new ProtocolValidator<MockMessages>();

    // Initialize with mock transport and protocol
    super({
      type: 'mock',
      transport: {
        connect: async () => {
          if (config.shouldFail) {
            throw new TransportError(
              'Failed to connect wallet',
              TransportErrorCode.CONNECTION_FAILED,
              { 
                error: 'Simulated connection failure'
              }
            );
          }
        },
        disconnect: async () => {},
        send: async <T, R>(message: Message<T>): Promise<Message<R>> => {
          // Simulate delay
          await new Promise((resolve) => setTimeout(resolve, this.config.responseDelay));

          if (this.config.shouldFail) {
            throw new TransportError(
              'Request failed',
              TransportErrorCode.TRANSPORT_ERROR,
              {
                error: 'Simulated failure'
              }
            );
          }

          const wallet = this.createConnectedWallet();
          // Return success response
          return {
            id: message.id,
            type: MessageType.RESPONSE,
            payload: {
              address: wallet.state.address,
              chainId: wallet.state.networkId,
              connected: true,
            } as R,
            timestamp: Date.now(),
          };
        },
        subscribe: () => () => {},
        isConnected: () => true,
      },
      protocol: {
        validator,
        parseMessage: (data: unknown): ValidationResult<Message<MockMessages['request']>> => {
          try {
            return {
              success: true,
              data: data as Message<MockMessages['request']>
            };
          } catch (error) {
            return {
              success: false as const,
              error: new ProtocolError(
                'Failed to parse message',
                ProtocolErrorCode.INVALID_FORMAT
              )
            };
          }
        },
        formatMessage: (message: Message<MockMessages['request']>) => message,
        validateMessage: (message: unknown): ValidationResult<Message<MockMessages>> => {
          try {
            const validated = message as Message<MockMessages>;
            return {
              success: true,
              data: validated
            };
          } catch (error) {
            return {
              success: false as const,
              error: new ProtocolError(
                'Failed to validate message',
                ProtocolErrorCode.VALIDATION_FAILED
              )
            };
          }
        },
        createRequest: (method, params): Message<MockMessages['request']> => ({
          id: String(Date.now()),
          type: MessageType.REQUEST,
          payload: { method, params },
          timestamp: Date.now(),
        }),
        createResponse: (id, result): Message<MockMessages['response']> => ({
          id,
          type: MessageType.RESPONSE,
          payload: result as MockMessages['response'],
          timestamp: Date.now(),
        }),
        createError: (id, error): Message<MockMessages['request']> => ({
          id,
          type: MessageType.ERROR,
          payload: {
            method: 'error',
            params: { error: error.message }
          },
          timestamp: Date.now(),
        }),
      },
    });

    this.validator = validator;
    
    this.config = {
      address: config.address || '0x1234567890123456789012345678901234567890',
      chainId: config.chainId || '1',
      shouldFail: config.shouldFail || false,
      responseDelay: config.responseDelay || 100,
    };

    this.provider = {
      isConnected: false,
      address: this.config.address,
      chainId: this.config.chainId,
    };
  }

  /**
   * Gets the mock provider instance
   */
  override async getProvider(): Promise<MockProvider> {
    return this.provider;
  }

  /**
   * Override connect to ensure proper wallet info
   */
  override async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    await this.transport.connect();
    await super.connect(walletInfo);
    
    const wallet = this.createConnectedWallet();
    this.provider.isConnected = true;
    this.currentWallet = wallet;
    return wallet;
  }

  /**
   * Override resume to ensure proper wallet state
   */
  override async resume(walletInfo: WalletInfo, state: WalletState): Promise<ConnectedWallet> {
    await this.transport.connect();
    await super.resume(walletInfo, state);
    
    const wallet = this.createConnectedWallet();
    this.provider.isConnected = true;
    this.currentWallet = wallet;
    return wallet;
  }

  /**
   * Override disconnect to update provider state
   */
  override async disconnect(): Promise<void> {
    await super.disconnect();
    this.provider.isConnected = false;
  }

  protected override handleProtocolMessage(message: Message<MockMessages>): void {
    if (message.type === MessageType.REQUEST && 
        'method' in message.payload &&
        message.payload.method === 'connect') {
      this.provider.isConnected = true;
    } else if (message.type === MessageType.REQUEST && 
              'method' in message.payload && message.payload.method === 'disconnect') {
      this.provider.isConnected = false;
    }
  }

  private createWalletInfo(): WalletInfo {
    return {
      id: 'mock',
      name: 'Mock Wallet',
      icon: 'data:image/svg+xml;base64,mock',
      connector: {
        type: 'mock',
        options: this.config,
      },
    };
  }

  private createConnectedWallet(): ConnectedWallet {
    return {
      info: this.createWalletInfo(),
      state: {
        address: this.config.address,
        networkId: this.config.chainId,
        sessionId: String(Date.now()),
      },
    };
  }
}

/**
 * Default mock connector instance for testing
 */
export const defaultMockConnector = new MockConnector({
  address: '0x0000000000000000000000000000000000000000',
  chainId: '1',
  responseDelay: 0,
});

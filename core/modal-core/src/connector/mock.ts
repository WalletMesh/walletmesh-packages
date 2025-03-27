import type { Protocol, Transport } from '../transport/types.js';
import { BaseConnector } from './base.js';
import type { ConnectedWallet, Provider, WalletInfo } from '../types.js';

export interface MockConnectorConfig {
  mockResponses?: Record<string, unknown>;
}

export type MockRequest = {
  method: string;
  params?: unknown[];
};

export type MockResponse = {
  result: unknown;
};

export class MockConnector extends BaseConnector<MockRequest> {
  private mockResponses: Record<string, unknown>;

  constructor(transport: Transport, protocol: Protocol<MockRequest>, config: MockConnectorConfig = {}) {
    super(transport, protocol);
    this.mockResponses = config.mockResponses ?? {};
  }

  protected async doConnect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    const state = {
      address: walletInfo.address,
      networkId: 1,
      sessionId: 'mock',
      lastActive: Date.now(),
    };

    return {
      address: walletInfo.address,
      chainId: walletInfo.chainId,
      publicKey: walletInfo.publicKey,
      connected: true,
      type: 'mock',
      info: walletInfo,
      state,
    };
  }

  protected async createProvider(): Promise<Provider> {
    return {
      isConnected: () => false,
      request: async <T>(method: string): Promise<T> => {
        const response = this.mockResponses[method];
        if (!response) {
          throw new Error(`No mock response for method: ${method}`);
        }
        return response as T;
      },
      connect: async () => undefined,
      disconnect: async () => undefined,
    };
  }

  protected async handleProtocolMessage(message: MockRequest): Promise<MockResponse> {
    const { method } = message;
    const response = this.mockResponses[method];

    if (!response) {
      throw new Error(`No mock response for method: ${method}`);
    }

    return {
      result: response,
    };
  }
}

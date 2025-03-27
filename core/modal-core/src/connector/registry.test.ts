import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectorRegistry } from './registry.js';
import { BaseConnector } from './base.js';
import type { ConnectorImplementationConfig, Provider, WalletInfo } from '../types.js';

interface TestRequest {
  method: string;
  params: unknown[];
}

describe('ConnectorRegistry', () => {
  let connectorRegistry: ConnectorRegistry;
  let mockConfig: ConnectorImplementationConfig;
  let mockProvider: Provider;

  beforeEach(() => {
    mockProvider = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      request: vi.fn().mockImplementation(async <T>(): Promise<T> => ({}) as T),
      isConnected: vi.fn().mockReturnValue(true),
    };

    mockConfig = {
      type: 'test',
      name: 'Test Connector',
      factory: vi.fn().mockResolvedValue(mockProvider),
    };

    connectorRegistry = new ConnectorRegistry();
  });

  describe('Registration', () => {
    it('registers a connector', () => {
      class TestConnector extends BaseConnector<TestRequest> {
        protected async doConnect(walletInfo: WalletInfo) {
          return {
            address: walletInfo.address,
            chainId: walletInfo.chainId,
            publicKey: walletInfo.publicKey,
            connected: true,
            type: 'test',
            info: walletInfo,
            state: {
              address: walletInfo.address,
              networkId: 1,
              sessionId: 'test',
              lastActive: Date.now(),
            },
          };
        }

        protected async createProvider(): Promise<Provider> {
          return mockProvider;
        }

        protected async handleProtocolMessage(message: TestRequest) {
          return { result: message.params };
        }
      }

      expect(() => {
        connectorRegistry.register('test', mockConfig, TestConnector);
      }).not.toThrow();
    });

    it('prevents duplicate registration', () => {
      class TestConnector extends BaseConnector<TestRequest> {
        protected async doConnect(walletInfo: WalletInfo) {
          return {
            address: walletInfo.address,
            chainId: walletInfo.chainId,
            publicKey: walletInfo.publicKey,
            connected: true,
            type: 'test',
            state: {
              address: walletInfo.address,
              networkId: 1,
              sessionId: 'test',
              lastActive: Date.now(),
            },
          };
        }

        protected async createProvider(): Promise<Provider> {
          return mockProvider;
        }

        protected async handleProtocolMessage(message: TestRequest) {
          return { result: message.params };
        }
      }

      connectorRegistry.register('test', mockConfig, TestConnector);
      expect(() => {
        connectorRegistry.register('test', mockConfig, TestConnector);
      }).toThrow('Connector type already registered: test');
    });
  });

  describe('Creation', () => {
    it('creates registered connector', async () => {
      class TestConnector extends BaseConnector<TestRequest> {
        protected async doConnect(walletInfo: WalletInfo) {
          return {
            address: walletInfo.address,
            chainId: walletInfo.chainId,
            publicKey: walletInfo.publicKey,
            connected: true,
            type: 'test',
            state: {
              address: walletInfo.address,
              networkId: 1,
              sessionId: 'test',
              lastActive: Date.now(),
            },
          };
        }

        protected async createProvider(): Promise<Provider> {
          return mockProvider;
        }

        protected async handleProtocolMessage(message: TestRequest) {
          return { result: message.params };
        }
      }

      connectorRegistry.register('test', mockConfig, TestConnector);
      const connector = await connectorRegistry.create('test');
      expect(connector).toBeDefined();
      expect(mockConfig.factory).toHaveBeenCalled();
    });

    it('creates mock connector', async () => {
      const connector = await connectorRegistry.create('mock');
      expect(connector).toBeDefined();
    });

    it('throws for unknown connector type', async () => {
      await expect(connectorRegistry.create('unknown')).rejects.toThrow(
        'Connector type not registered: unknown',
      );
    });
  });
});

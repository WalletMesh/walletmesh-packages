import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BaseConnector, ConnectionState } from './base.js';
import type { Protocol, Transport } from '../transport/types.js';
import type { ConnectedWallet, Provider, WalletInfo } from '../types.js';

interface TestRequest {
  method: string;
  data: unknown;
}

interface TestResponse {
  result: unknown;
}

class TestConnector extends BaseConnector<TestRequest> {
  protected async doConnect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
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
    return {
      isConnected: () => false,
      request: async <T>(): Promise<T> => ({}) as T,
      connect: async () => undefined,
      disconnect: async () => undefined,
    };
  }

  protected async handleProtocolMessage(message: TestRequest): Promise<TestResponse> {
    return { result: message.data };
  }
}

describe('BaseConnector', () => {
  let connector: TestConnector;
  let mockTransport: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    isConnected: ReturnType<typeof vi.fn>;
    getState: ReturnType<typeof vi.fn>;
    addErrorHandler: ReturnType<typeof vi.fn>;
    removeErrorHandler: ReturnType<typeof vi.fn>;
  } & Transport;
  let mockProtocol: Protocol<TestRequest>;
  let mockWalletInfo: WalletInfo;

  beforeEach(() => {
    mockWalletInfo = {
      address: '0xtest',
      chainId: 1,
      publicKey: '0x123',
    };

    mockTransport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockImplementation((message) =>
        Promise.resolve({
          ...message,
          payload: { result: message.payload.data },
        }),
      ),
      isConnected: vi.fn().mockReturnValue(true),
      getState: vi.fn().mockReturnValue(ConnectionState.CONNECTED),
      addErrorHandler: vi.fn(),
      removeErrorHandler: vi.fn(),
    };

    mockProtocol = {
      validate: vi.fn().mockReturnValue({ success: true }),
      validateMessage: vi.fn().mockReturnValue({ success: true }),
      parseMessage: vi.fn().mockReturnValue({ success: true }),
      formatMessage: vi.fn(),
      createRequest: vi.fn().mockImplementation((method, params) => ({
        id: 'test',
        type: 'request',
        payload: { method, data: params },
        timestamp: Date.now(),
      })),
      createResponse: vi.fn().mockImplementation((id, result) => ({
        id,
        type: 'response',
        payload: { result },
        timestamp: Date.now(),
      })),
      createError: vi.fn().mockImplementation((id, error) => ({
        id,
        type: 'error',
        payload: { method: 'error', data: error.message },
        timestamp: Date.now(),
      })),
    };

    connector = new TestConnector(mockTransport, mockProtocol);
  });

  describe('initialization', () => {
    it('initializes in disconnected state', () => {
      expect(connector.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(connector.getWallet()).toBeNull();
      expect(connector.getWalletState()).toBeNull();
    });
  });

  describe('connection management', () => {
    it('connects successfully', async () => {
      const wallet = await connector.connect(mockWalletInfo);

      expect(wallet).toBeDefined();
      expect(wallet.address).toBe(mockWalletInfo.address);
      expect(connector.getState()).toBe(ConnectionState.CONNECTED);
      expect(connector.getWallet()).toEqual(wallet);
      expect(connector.getWalletState()).toEqual(wallet.state);
    });

    it('handles connection errors', async () => {
      class ErrorConnector extends TestConnector {
        protected override async doConnect(): Promise<ConnectedWallet> {
          throw new Error('Failed to connect to wallet');
        }
      }

      const errorConnector = new ErrorConnector(mockTransport, mockProtocol);
      await expect(errorConnector.connect(mockWalletInfo)).rejects.toThrow('Failed to connect to wallet');
      expect(errorConnector.getState()).toBe(ConnectionState.ERROR);
      expect(errorConnector.getWallet()).toBeNull();
      expect(errorConnector.getWalletState()).toBeNull();
    });

    it('disconnects properly', async () => {
      await connector.connect(mockWalletInfo);
      await connector.disconnect();

      expect(connector.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(connector.getWallet()).toBeNull();
      expect(connector.getWalletState()).toBeNull();
    });

    it('handles disconnect errors', async () => {
      class ErrorConnector extends TestConnector {
        protected override async doDisconnect(): Promise<void> {
          throw new Error('Failed to disconnect from wallet');
        }
      }

      const errorConnector = new ErrorConnector(mockTransport, mockProtocol);
      await errorConnector.connect(mockWalletInfo);
      await expect(errorConnector.disconnect()).rejects.toThrow('Failed to disconnect from wallet');
      expect(errorConnector.getState()).toBe(ConnectionState.ERROR);
    });
  });

  describe('message handling', () => {
    it('sends messages successfully', async () => {
      await connector.connect(mockWalletInfo);
      const request: TestRequest = {
        method: 'test',
        data: { value: 123 },
      };

      const result = await connector['sendMessage'](request);
      expect(result).toEqual({ result: request.data });
      expect(mockProtocol.createRequest).toHaveBeenCalledWith('request', request);
      expect(mockTransport.send).toHaveBeenCalled();
    });

    it('handles message errors', async () => {
      await connector.connect(mockWalletInfo);
      mockTransport.send.mockRejectedValueOnce(new Error('Failed to send message'));

      const request: TestRequest = {
        method: 'test',
        data: { value: 123 },
      };

      await expect(connector['sendMessage'](request)).rejects.toMatchObject({
        message: 'Failed to send message',
        code: 'send_failed',
        details: {
          cause: expect.any(Error),
        },
      });
    });
  });
});

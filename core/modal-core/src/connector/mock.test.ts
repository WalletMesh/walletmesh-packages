import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockConnector, type MockRequest } from './mock.js';
import { ConnectionState, type Message } from '../transport/types.js';
import type { Protocol, Transport } from '../transport/types.js';
import type { WalletInfo } from '../types.js';

describe('MockConnector', () => {
  let connector: MockConnector;
  let mockTransport: Transport;
  let mockProtocol: Protocol<MockRequest>;
  let walletInfo: WalletInfo;

  beforeEach(() => {
    mockTransport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue({
        id: 'test',
        type: 'response',
        payload: { result: 'success' },
        timestamp: Date.now(),
      }),
      isConnected: vi.fn().mockReturnValue(true),
      getState: vi.fn().mockReturnValue(ConnectionState.CONNECTED),
      addErrorHandler: vi.fn(),
      removeErrorHandler: vi.fn(),
    };

    mockProtocol = {
      validate: vi.fn().mockReturnValue({ success: true, data: {} as Message<MockRequest> }),
      validateMessage: vi.fn().mockReturnValue({ success: true, data: {} as Message<MockRequest> }),
      parseMessage: vi.fn().mockReturnValue({ success: true, data: {} as Message<MockRequest> }),
      formatMessage: vi.fn().mockReturnValue({}),
      createRequest: vi.fn().mockImplementation((method, params) => ({
        id: 'test',
        type: 'request',
        payload: { method, params },
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
        payload: { method: 'error', params: [error.message] },
        timestamp: Date.now(),
      })),
    };

    walletInfo = {
      address: '0xtest',
      chainId: 1,
      publicKey: '0x123',
    };

    connector = new MockConnector(mockTransport, mockProtocol, {
      mockResponses: {
        test: 'success',
      },
    });
  });

  describe('Connection', () => {
    it('should initialize in disconnected state', () => {
      expect(connector.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(connector.getWallet()).toBeNull();
    });

    it('should connect successfully', async () => {
      const wallet = await connector.connect(walletInfo);

      expect(wallet).toBeDefined();
      expect(wallet.address).toBe(walletInfo.address);
      expect(wallet.chainId).toBe(walletInfo.chainId);
      expect(wallet.publicKey).toBe(walletInfo.publicKey);
      expect(wallet.connected).toBe(true);
      expect(wallet.type).toBe('mock');
      expect(wallet.state).toBeDefined();
      expect(connector.getState()).toBe(ConnectionState.CONNECTED);
    });

    it('should handle connection failure', async () => {
      vi.mocked(mockTransport.connect).mockRejectedValueOnce(new Error('Failed to connect to wallet'));
      await expect(connector.connect(walletInfo)).rejects.toThrow('Failed to connect to wallet');
      expect(connector.getState()).toBe(ConnectionState.ERROR);
    });
  });

  describe('Provider', () => {
    it('should create provider', async () => {
      await connector.connect(walletInfo);
      const provider = await connector.getProvider();

      expect(provider).toBeDefined();
      expect(provider.isConnected()).toBe(false);
      expect(typeof provider.request).toBe('function');
    });

    it('should handle provider requests', async () => {
      await connector.connect(walletInfo);
      const provider = await connector.getProvider();
      const result = await provider.request('test');

      expect(result).toBe('success');
    });

    it('should handle provider failures', async () => {
      await connector.connect(walletInfo);
      const provider = await connector.getProvider();

      await expect(provider.request('unknown')).rejects.toThrow('No mock response for method: unknown');
    });
  });

  describe('Protocol handling', () => {
    it('should handle protocol messages', async () => {
      await connector.connect(walletInfo);

      const message: MockRequest = {
        method: 'test',
        params: ['param1', 'param2'],
      };

      const result = await connector['handleProtocolMessage'](message);
      expect(result).toEqual({ result: 'success' });
    });

    it('should handle missing mock responses', async () => {
      await connector.connect(walletInfo);

      const message: MockRequest = {
        method: 'unknown',
      };

      await expect(connector['handleProtocolMessage'](message)).rejects.toThrow(
        'No mock response for method: unknown',
      );
    });
  });
});

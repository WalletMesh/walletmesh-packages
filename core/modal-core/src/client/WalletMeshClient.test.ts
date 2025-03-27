import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionState, type ConnectedWallet, type WalletConnectorConfig } from '../types.js';
import { WalletMeshClient } from './WalletMeshClient.js';
import { createConnector } from './createConnector.js';
import { createClientError } from './errors.js';

vi.mock('./createConnector.js', () => ({
  createConnector: vi.fn(),
}));

describe('WalletMeshClient', () => {
  let client: WalletMeshClient;
  let mockConnector: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    getProvider: ReturnType<typeof vi.fn>;
    getState: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
  };
  let mockWallet: ConnectedWallet;
  let config: WalletConnectorConfig;

  beforeEach(() => {
    mockWallet = {
      address: '0x123',
      chainId: 1,
      publicKey: '0x456',
      connected: true,
      type: 'mock',
      state: {
        address: '0x123',
        networkId: 1,
        sessionId: 'test',
        lastActive: Date.now(),
      },
    };

    mockConnector = {
      connect: vi.fn().mockResolvedValue(mockWallet),
      disconnect: vi.fn().mockResolvedValue(undefined),
      getProvider: vi.fn(),
      getState: vi.fn().mockReturnValue(ConnectionState.CONNECTED),
      resume: vi.fn(),
    };

    config = {
      type: 'mock',
      defaultChainId: 1,
    };

    vi.mocked(createConnector).mockResolvedValue(mockConnector);

    client = new WalletMeshClient();
  });

  describe('Connection', () => {
    it('should connect successfully', async () => {
      const result = await client.connect(config);
      expect(result).toBe(mockWallet);
      expect(client.isConnected).toBe(true);
      expect(client.getState()).toBe(ConnectionState.CONNECTED);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      vi.mocked(createConnector).mockRejectedValueOnce(error);

      await expect(client.connect(config)).rejects.toEqual(
        createClientError.connectFailed('Failed to connect wallet', { cause: error }),
      );
    });

    it('should handle disconnect', async () => {
      await client.connect(config);
      await client.disconnect();
      expect(client.isConnected).toBe(false);
      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
    });
  });

  describe('State Management', () => {
    it('should track connection state', async () => {
      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(client.isConnected).toBe(false);

      await client.connect(config);
      expect(client.getState()).toBe(ConnectionState.CONNECTED);
      expect(client.isConnected).toBe(true);

      await client.disconnect();
      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(client.isConnected).toBe(false);
    });
  });
});

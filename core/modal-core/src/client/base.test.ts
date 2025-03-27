import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletMeshClient } from './WalletMeshClient.js';
import { createConnector } from './createConnector.js';
import { ConnectionState, type ConnectedWallet, type WalletConnectorConfig } from '../types.js';
import { createClientError } from './errors.js';

// Mock createConnector module
vi.mock('./createConnector', () => ({
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

  beforeEach(() => {
    mockConnector = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getProvider: vi.fn(),
      getState: vi.fn(),
      resume: vi.fn(),
    };

    client = new WalletMeshClient();
    vi.mocked(createConnector).mockResolvedValue(mockConnector);
  });

  it('should create instance', () => {
    expect(client).toBeInstanceOf(WalletMeshClient);
    expect(client.isConnected).toBe(false);
    expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
  });

  it('should handle wallet connection', async () => {
    const mockConfig: WalletConnectorConfig = {
      type: 'mock',
      defaultChainId: 1,
    };

    const mockWallet: ConnectedWallet = {
      address: '0xtest',
      chainId: 1,
      publicKey: '0x123',
      connected: true,
      type: 'mock',
      state: {
        address: '0xtest',
        networkId: 1,
        sessionId: 'test',
        lastActive: Date.now(),
      },
    };

    mockConnector.connect.mockResolvedValue(mockWallet);

    const wallet = await client.connect(mockConfig);

    expect(createConnector).toHaveBeenCalledWith(mockConfig);
    expect(mockConnector.connect).toHaveBeenCalledWith({
      address: '',
      chainId: 1,
      publicKey: '',
    });
    expect(wallet).toEqual(mockWallet);
    expect(client.isConnected).toBe(true);
    expect(client.getState()).toBe(ConnectionState.CONNECTED);
  });

  it('should handle connection failures', async () => {
    const mockConfig: WalletConnectorConfig = {
      type: 'mock',
      defaultChainId: 1,
    };

    const mockError = new Error('Connection failed');
    mockConnector.connect.mockRejectedValue(mockError);

    await expect(client.connect(mockConfig)).rejects.toThrow(
      createClientError.connectFailed('Failed to connect wallet', { cause: mockError }),
    );
    expect(client.isConnected).toBe(false);
    expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
  });

  it('should handle disconnection', async () => {
    // First connect
    const mockConfig: WalletConnectorConfig = {
      type: 'mock',
      defaultChainId: 1,
    };

    const mockWallet: ConnectedWallet = {
      address: '0xtest',
      chainId: 1,
      publicKey: '0x123',
      connected: true,
      type: 'mock',
      state: {
        address: '0xtest',
        networkId: 1,
        sessionId: 'test',
        lastActive: Date.now(),
      },
    };

    mockConnector.connect.mockResolvedValue(mockWallet);
    await client.connect(mockConfig);

    // Then disconnect
    await client.disconnect();
    expect(client.isConnected).toBe(false);
    expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
  });
});

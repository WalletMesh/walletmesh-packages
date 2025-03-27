import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createConnector, registerConnector, clearConnectorRegistry } from './createConnector.js';
import { ConnectionState, type ConnectedWallet, type WalletConnectorConfig } from '../types.js';
import type { Connector, ConnectorFactory } from './types.js';

describe('createConnector', () => {
  const mockState = {
    address: '0xtest',
    networkId: 1,
    sessionId: 'test',
    lastActive: Date.now(),
  };

  const mockWallet: ConnectedWallet = {
    address: '0xtest',
    chainId: 1,
    publicKey: '0x123',
    connected: true,
    type: 'mock',
    state: mockState,
  };

  const createMockConnector = (): Connector => ({
    connect: vi.fn().mockResolvedValue(mockWallet),
    disconnect: vi.fn().mockResolvedValue(undefined),
    getProvider: vi.fn().mockResolvedValue({}),
    getState: vi.fn().mockReturnValue(ConnectionState.DISCONNECTED),
    resume: vi.fn().mockResolvedValue(mockWallet),
  });

  const mockFactory: ConnectorFactory = vi.fn().mockImplementation(() => createMockConnector());

  beforeEach(() => {
    registerConnector('mock', mockFactory);
  });

  afterEach(() => {
    clearConnectorRegistry();
    vi.clearAllMocks();
  });

  it('should create connector for valid config', () => {
    const config: WalletConnectorConfig = {
      type: 'mock',
      defaultChainId: 1,
    };

    const connector = createConnector(config);
    expect(connector).toBeDefined();
    expect(mockFactory).toHaveBeenCalledWith(config);
  });

  it('should throw for invalid connector type', () => {
    const config: WalletConnectorConfig = {
      type: 'invalid',
      defaultChainId: 1,
    };

    expect(() => createConnector(config)).toThrow('No connector factory registered for type: invalid');
  });

  it('should create functional connector', async () => {
    const config: WalletConnectorConfig = {
      type: 'mock',
      defaultChainId: 1,
    };

    const connector = createConnector(config);
    const state = connector.getState();
    expect(state).toBe(ConnectionState.DISCONNECTED);

    const wallet = await connector.connect({
      address: '0xtest',
      chainId: 1,
      publicKey: '0x123',
    });

    expect(wallet).toEqual(mockWallet);
  });

  it('should handle provider interactions', async () => {
    const config: WalletConnectorConfig = {
      type: 'mock',
      defaultChainId: 1,
    };

    const connector = createConnector(config);
    const provider = await connector.getProvider();
    expect(provider).toBeDefined();
  });

  it('should handle multiple registrations', () => {
    const anotherFactory = vi.fn().mockImplementation(() => createMockConnector());
    registerConnector('another', anotherFactory);

    const config1: WalletConnectorConfig = { type: 'mock', defaultChainId: 1 };
    const config2: WalletConnectorConfig = { type: 'another', defaultChainId: 1 };

    const connector1 = createConnector(config1);
    const connector2 = createConnector(config2);

    expect(connector1).toBeDefined();
    expect(connector2).toBeDefined();
    expect(mockFactory).toHaveBeenCalledWith(config1);
    expect(anotherFactory).toHaveBeenCalledWith(config2);
  });

  it('should handle registry clearing', () => {
    clearConnectorRegistry();

    const config: WalletConnectorConfig = {
      type: 'mock',
      defaultChainId: 1,
    };

    expect(() => createConnector(config)).toThrow('No connector factory registered for type: mock');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseWalletConnector } from './index.js';
import { ChainType } from '../../types/chains.js';
import { ClientEventType } from '../../types/events.js';
import { ProviderInterface, type ProviderCapability } from '../../types/providers.js';
import type { ConnectOptions, ConnectionResult } from '../types.js';

class TestConnector extends BaseWalletConnector {
  readonly id = 'test';
  readonly name = 'Test Connector';
  readonly icon = 'test-icon.png';
  readonly description = 'Test connector for unit tests';
  readonly supportedChains = [ChainType.ETHEREUM];
  readonly supportedProviders = [ProviderInterface.EIP1193];

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async detect(): Promise<boolean> {
    return true;
  }

  getProvider<T = unknown>(
    interfaceType: ProviderInterface = ProviderInterface.EIP1193,
    chain: ChainType = ChainType.ETHEREUM,
  ): T {
    this.validateProvider(interfaceType);
    this.validateChain(chain);
    return {} as T;
  }

  getProviderCapabilities(interfaceType: ProviderInterface): ProviderCapability | null {
    this.validateProvider(interfaceType);
    return null;
  }

  protected async performConnect(chain: ChainType, _options?: ConnectOptions): Promise<ConnectionResult> {
    return {
      chain,
      provider: ProviderInterface.EIP1193,
      accounts: ['0x123'],
    };
  }

  protected async performDisconnect(): Promise<void> {
    // No-op
  }
}

describe('BaseWalletConnector', () => {
  let connector: TestConnector;

  beforeEach(() => {
    connector = new TestConnector();
  });

  it('should require initialization before connect', async () => {
    await expect(connector.connect()).rejects.toThrow('Connector not initialized');
  });

  it('should emit events during connection flow', async () => {
    const events: string[] = [];
    connector.on(ClientEventType.CONNECTING, () => events.push('connecting'));
    connector.on(ClientEventType.CONNECTED, () => events.push('connected'));

    await connector.initialize();
    await connector.connect();

    expect(events).toHaveLength(2);
    expect(events[0]).toBe('connecting');
    expect(events[1]).toBe('connected');
  });

  it('should not allow connection with unsupported chain', async () => {
    await connector.initialize();
    const invalidChain = 'invalid-chain';
    await expect(connector.connect(invalidChain as ChainType)).rejects.toThrow(
      `Chain type ${invalidChain} is not supported`,
    );
  });

  it('should not allow getting unsupported provider', () => {
    const unsupportedProvider = ProviderInterface.ETHERS;
    expect(() => {
      connector.getProvider(unsupportedProvider);
    }).toThrow(`Provider interface ${unsupportedProvider} is not supported`);
  });

  it('should track connection state', async () => {
    const states: string[] = [];
    connector.on(ClientEventType.CONNECTING, () => states.push('connecting'));
    connector.on(ClientEventType.CONNECTED, () => states.push('connected'));
    connector.on(ClientEventType.DISCONNECTED, () => states.push('disconnected'));

    await connector.initialize();
    await connector.connect();
    await connector.disconnect();

    expect(states).toEqual(['connecting', 'connected', 'disconnected']);
  });

  it('should handle initialization errors', async () => {
    class ErrorConnector extends TestConnector {
      override async initialize(): Promise<void> {
        throw new Error('Init failed');
      }
    }

    const errorConnector = new ErrorConnector();
    await expect(errorConnector.initialize()).rejects.toThrow('Init failed');
  });

  it('should handle connection errors', async () => {
    class ErrorConnector extends TestConnector {
      protected override async performConnect(): Promise<ConnectionResult> {
        throw new Error('Connect failed');
      }
    }

    const errorConnector = new ErrorConnector();
    await errorConnector.initialize();
    await expect(errorConnector.connect()).rejects.toThrow('Connect failed');
  });

  it('should handle disconnection errors', async () => {
    class ErrorConnector extends TestConnector {
      protected override async performDisconnect(): Promise<void> {
        throw new Error('Disconnect failed');
      }
    }

    const errorConnector = new ErrorConnector();
    await errorConnector.initialize();
    await expect(errorConnector.disconnect()).rejects.toThrow('Disconnect failed');
  });
});

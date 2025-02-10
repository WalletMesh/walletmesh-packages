import type { WalletInfo, ConnectedWallet } from '../../types.js';
import type { Adapter, AztecAdapterOptions } from './types.js';
import { AdapterType } from './types.js';
import { WalletError } from '../client/types.js';

interface AztecProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getAccount(): Promise<string>;
  sendMessage(data: unknown): Promise<void>;
}

export class WalletMeshAztecAdapter implements Adapter {
  private provider: AztecProvider | null = null;
  private connected = false;
  private readonly options: AztecAdapterOptions;

  constructor(options: AztecAdapterOptions = {}) {
    this.options = {
      chainId: '1',
      rpcUrl: 'https://aztec.network/rpc',
      ...options
    };
  }

  async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (this.connected) {
      throw new WalletError('Already connected', 'adapter');
    }

    try {
      // Mock provider for now - will be replaced with actual implementation
      this.provider = {
        connect: async () => {},
        disconnect: async () => {},
        getAccount: async () => '0x1234567890abcdef',
        sendMessage: async () => {}
      };

      await this.provider.connect();
      const address = await this.provider.getAccount();
      this.connected = true;

      return {
        ...walletInfo,
        chain: this.options.chainId ?? 'aztec-testnet',
        address,
        sessionId: Date.now().toString(),
        adapterOptions: this.options,
        adapter: {
          type: AdapterType.WalletMeshAztec,
          options: this.options
        }
      } as ConnectedWallet;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      throw new WalletError(error.message, 'adapter', error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      if (this.provider) {
        await this.provider.disconnect();
      }
      this.provider = null;
      this.connected = false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to disconnect');
      throw new WalletError(error.message, 'adapter', error);
    }
  }

  async getProvider(): Promise<AztecProvider> {
    if (!this.connected || !this.provider) {
      throw new WalletError('Not connected', 'adapter');
    }
    return this.provider;
  }

  handleMessage(data: unknown): void {
    if (!this.connected || !this.provider) {
      console.warn('Received message while not connected');
      return;
    }

    // Forward message to provider
    this.provider.sendMessage(data).catch((err) => {
      console.error('Failed to send message to provider:', err);
    });
  }
}

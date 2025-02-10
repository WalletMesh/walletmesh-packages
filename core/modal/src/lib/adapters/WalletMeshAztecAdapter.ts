import { AztecChainProvider } from '@walletmesh/aztec-rpc-wallet';
import type { Adapter, WalletInfo, ConnectedWallet, AdapterOptions } from '../types.js';
import { messageValidation, errorMessages } from '../utils/validation.js';

export class WalletMeshAztecAdapter implements Adapter {
  private provider: AztecChainProvider | null = null;
  private connectedWallet: ConnectedWallet | null = null;
  private readonly options: AdapterOptions;

  constructor(options: AdapterOptions = {}) {
    this.options = options;
  }

  async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (this.provider) {
      throw new Error('Already connected');
    }

    // Create provider with message sending capability
    this.provider = new AztecChainProvider({
      send: async (request) => {
        throw new Error('Transport not set. Messages should be sent through WalletMeshClient.');
      }
    });

    try {
      // Attempt connection
      const connected = await this.provider.connect();
      if (!connected) {
        throw new Error('Failed to connect to wallet');
      }

      // Get account info
      const account = await this.provider.getAccount();
      
      // Create connected wallet info
      this.connectedWallet = {
        ...walletInfo,
        chain: 'aztec',
        address: account
      };

      return this.connectedWallet;
    } catch (error) {
      this.provider = null;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // Reset state
    this.provider = null;
    this.connectedWallet = null;
  }

  async getProvider(): Promise<AztecChainProvider> {
    if (!this.provider) {
      throw new Error('Not connected to wallet');
    }
    return this.provider;
  }

  handleMessage(data: unknown): void {
    // Validate incoming messages
    if (!messageValidation.isValidMessage(data)) {
      console.warn(errorMessages.invalidMessage);
      return;
    }

    // Pass message to provider if connected
    if (this.provider) {
      this.provider.receiveMessage(data);
    }
  }
}

import { AztecChainProvider } from '@walletmesh/aztec-rpc-wallet';
import type { Adapter, AdapterOptions, ConnectedWallet, WalletInfo } from '../../types.js';
import { PostMessageConnector } from '../connectors/PostMessageConnector.js';

export class WalletMeshAztecAdapter implements Adapter {
  protected provider: AztecChainProvider | null = null;
  protected connectedWallet: ConnectedWallet | null = null;
  protected connector: PostMessageConnector;
  protected options: AdapterOptions;

  constructor(options: AdapterOptions = {}) {
    this.options = options;
    this.connector = new PostMessageConnector();
  }

  /**
   * Connects to the wallet.
   * @param wallet - The wallet information.
   * @returns The connected wallet information.
   * @throws Will throw an error if the connection fails.
   */
  async connect(wallet: WalletInfo): Promise<ConnectedWallet> {
    const provider = new AztecChainProvider({
      send: async (request) => {
        await this.connector.send(request);
      }
    });

    // Set up provider to receive messages from connector
    this.connector.onMessage((data) => {
      provider.receiveMessage(data);
    });

    // Connect both connector and provider
    await this.connector.connect(wallet);

    const connected = await provider.connect();
    if (!connected) {
      throw new Error('Failed to connect to wallet');
    }

    const account = await provider.getAccount();
    this.provider = provider;
    
    const connectedWallet: ConnectedWallet = {
      ...wallet,
      chain: 'aztec',
      address: account,
    };

    this.connectedWallet = connectedWallet;
    return connectedWallet;
  }

  /**
   * Disconnects the wallet.
   */
  async disconnect(): Promise<void> {
    await this.connector.disconnect();
    this.provider = null;
    this.connectedWallet = null;
  }

  /**
   * Gets the provider for the wallet.
   * @returns The provider instance.
   * @throws Will throw an error if not connected.
   */
  async getProvider(): Promise<AztecChainProvider> {
    if (!this.provider) {
      throw new Error('Not connected to wallet');
    }
    return this.provider;
  }

  /**
   * Resumes the wallet session.
   * @param sessionData - The session data.
   * @returns The connected wallet information.
   */
  async resumeSession(sessionData: ConnectedWallet): Promise<ConnectedWallet> {
    await this.connector.resumeSession(sessionData);
    this.connectedWallet = sessionData;
    return sessionData;
  }

}

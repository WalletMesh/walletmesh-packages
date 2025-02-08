import type { Adapter, AdapterOptions, ConnectedWallet, WalletInfo } from '../../types.js';

export class WalletMeshAztecAdapter implements Adapter {
  protected connectedWallet: ConnectedWallet | null = null;
  protected options: AdapterOptions;

  constructor(options: AdapterOptions = {}) {
    this.options = options;
  }

  /**
   * Connects to the wallet.
   * @param wallet - The wallet information.
   * @returns The connected wallet information.
   * @throws Will throw an error if the connection fails.
   */
  async connect(wallet: WalletInfo): Promise<ConnectedWallet> {
    return this.mockConnect(wallet);
  }

  /**
   * Disconnects the wallet.
   */
  async disconnect(): Promise<void> {
    this.connectedWallet = null;
  }

  /**
   * Gets the provider for the wallet.
   * @returns The provider.
   * @throws Will throw an error if not implemented.
   */
  async getProvider(): Promise<undefined> {
    throw new Error('Not implemented');
  }

  /**
   * Resumes the wallet session.
   * @param sessionData - The session data.
   * @returns The connected wallet information.
   */
  async resumeSession(sessionData: ConnectedWallet): Promise<ConnectedWallet> {
    this.connectedWallet = sessionData;
    return sessionData;
  }

  /**
   * Mock method to simulate wallet connection.
   * @param wallet - The wallet information.
   * @returns The connected wallet information.
   * @throws Will throw an error if the connection fails.
   */
  protected async mockConnect(wallet: WalletInfo): Promise<ConnectedWallet> {
    // Simulating wallet connection
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate a random connection error (30% chance)
    if (Math.random() < 0.3) {
      throw new Error(`Failed to connect to ${wallet.name}. Please try again.`);
    }

    const connectedWallet: ConnectedWallet = {
      ...wallet,
      chain: 'Ethereum Mainnet',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    };

    this.connectedWallet = connectedWallet;
    return connectedWallet;
  }
}

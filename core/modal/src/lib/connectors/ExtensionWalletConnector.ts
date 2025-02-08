import type { Adapter, WalletInfo, ConnectedWallet, ConnectorOptions, Connector } from '../../types.js';

export class ExtensionWalletConnector implements Connector {
  adapter: Adapter;
  connectedWallet: ConnectedWallet | null;
  options: ConnectorOptions;

  constructor(adapter: Adapter, options: ConnectorOptions = {}) {
    this.adapter = adapter;
    this.connectedWallet = null;
    this.options = options;
  }

  /**
   * Connects to the wallet.
   * @param wallet - The wallet information.
   * @returns The connected wallet information.
   * @throws Will throw an error if the connection fails.
   */
  async connect(wallet: WalletInfo): Promise<ConnectedWallet> {
    const connectedWallet = await this.adapter.connect(wallet);
    this.connectedWallet = connectedWallet;
    return connectedWallet;
  }

  /**
   * Disconnects the wallet.
   */
  async disconnect(): Promise<void> {
    await this.adapter.disconnect();
    this.connectedWallet = null;
  }

  /**
   * Gets the provider for the wallet.
   * @returns The provider.
   */
  async getProvider(): Promise<unknown> {
    return this.adapter.getProvider();
  }

  /**
   * Resumes the wallet session.
   * @param sessionData - The session data.
   * @returns The connected wallet information.
   * @throws Will throw an error if the session validation fails.
   */
  async resumeSession(sessionData: ConnectedWallet): Promise<ConnectedWallet> {
    console.log(`Resuming web wallet session for: ${sessionData.name}`);
    if (!sessionData.sessionId) {
      throw new Error('Cannot resume session: missing sessionId');
    }

    // Add web wallet specific session resumption logic here
    // This would typically involve:
    // 1. Validating the session ID with the wallet
    // 2. Checking if the chain matches
    // 3. Verifying the wallet is still accessible

    // For now simulate the validation
    const isValid = Math.random() > 0.1; // 90% success rate for testing
    if (!isValid) {
      throw new Error('Session validation failed');
    }

    this.connectedWallet = sessionData;
    return sessionData;
  }
}

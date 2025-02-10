import type { Connector, ConnectedWallet, WalletInfo } from '../../types.js';

type MessageHandler = (data: unknown) => void;

export class PostMessageConnector implements Connector {
  private messageHandler: MessageHandler | null = null;
  private cleanup: (() => void) | null = null;
  private walletInfo: WalletInfo | null = null;
  private connectedWallet: ConnectedWallet | null = null;
  private provider: unknown | null = null;

  async connect(wallet: WalletInfo): Promise<ConnectedWallet> {
    this.walletInfo = wallet;

    const receiveResponse = (event: MessageEvent) => {
      if (event.source === window && event.data?.type === 'wallet_response' && this.messageHandler) {
        this.messageHandler(event.data.data);
      }
    };

    window.addEventListener('message', receiveResponse);
    this.cleanup = () => window.removeEventListener('message', receiveResponse);

    // Mock connected wallet for now - this should be updated with real data from the wallet
    this.connectedWallet = {
      ...wallet,
      chain: 'aztec',
      address: '0x...' // This should be replaced with actual address from wallet
    };

    return this.connectedWallet;
  }

  async disconnect(): Promise<void> {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    this.messageHandler = null;
    this.walletInfo = null;
    this.connectedWallet = null;
    this.provider = null;
  }

  async getProvider(): Promise<unknown> {
    return this.provider;
  }

  async resumeSession(sessionData: ConnectedWallet): Promise<ConnectedWallet> {
    this.connectedWallet = sessionData;
    return sessionData;
  }

  async send(message: unknown): Promise<void> {
    window.postMessage({
      type: 'wallet_request',
      data: message,
      origin: window.location.origin
    }, '*');
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }
}

import { ConnectionState, type Protocol, type Transport } from '../transport/types.js';
import { createTransportError } from '../transport/errors.js';
import type { ConnectedWallet, Provider, WalletInfo } from '../types.js';

export { ConnectionState } from '../transport/types.js';
export type { ConnectedWallet, Provider, WalletInfo };

/**
 * Base class for wallet connectors
 */
export abstract class BaseConnector<TRequest> {
  protected state: ConnectionState;
  protected wallet: ConnectedWallet | undefined;
  protected provider: Provider | undefined;
  protected readonly protocol: Protocol<TRequest>;
  protected readonly transport: Transport;

  constructor(transport: Transport, protocol: Protocol<TRequest>) {
    this.transport = transport;
    this.protocol = protocol;
    this.state = ConnectionState.DISCONNECTED;
  }

  /**
   * Connect to the wallet
   */
  public async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (this.isConnected() && this.wallet) {
      return this.wallet;
    }

    try {
      this.setState(ConnectionState.CONNECTING);
      this.wallet = await this.doConnect(walletInfo);
      this.setState(ConnectionState.CONNECTED);
      return this.wallet;
    } catch (error) {
      this.setState(ConnectionState.ERROR);
      throw createTransportError.connectionFailed('Failed to connect to wallet', { cause: error });
    }
  }

  /**
   * Disconnect from the wallet
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected()) {
      return;
    }

    try {
      await this.doDisconnect();
      this.setState(ConnectionState.DISCONNECTED);
      this.wallet = undefined;
      this.provider = undefined;
    } catch (error) {
      this.setState(ConnectionState.ERROR);
      throw createTransportError.error('Failed to disconnect from wallet', { cause: error });
    }
  }

  /**
   * Get the wallet provider
   */
  public async getProvider(): Promise<Provider> {
    if (!this.isConnected()) {
      throw createTransportError.notConnected('Not connected to wallet');
    }

    if (!this.provider) {
      this.provider = await this.createProvider();
    }

    return this.provider;
  }

  /**
   * Get the wallet instance
   */
  public getWallet(): ConnectedWallet | null {
    return this.wallet ?? null;
  }

  /**
   * Get the wallet state
   */
  public getWalletState(): ConnectedWallet['state'] | null {
    return this.wallet?.state ?? null;
  }

  /**
   * Get the current connection state
   */
  public getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected to wallet
   */
  public isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED && Boolean(this.wallet);
  }

  /**
   * Handle protocol messages
   */
  protected abstract handleProtocolMessage(message: TRequest): Promise<unknown>;

  /**
   * Create wallet connection
   */
  protected abstract doConnect(walletInfo: WalletInfo): Promise<ConnectedWallet>;

  /**
   * Create wallet provider
   */
  protected abstract createProvider(): Promise<Provider>;

  /**
   * Disconnect implementation
   */
  protected async doDisconnect(): Promise<void> {
    // Optional override
  }

  /**
   * Update connection state
   */
  protected setState(state: ConnectionState): void {
    this.state = state;
  }

  /**
   * Send a message to the wallet
   */
  protected async sendMessage<TResponse>(request: TRequest): Promise<TResponse> {
    try {
      const message = this.protocol.createRequest('request', request);
      await this.transport.send<TRequest, TResponse>(message);
      const result = await this.handleProtocolMessage(request);
      return result as TResponse;
    } catch (error) {
      throw createTransportError.sendFailed('Failed to send message', { cause: error });
    }
  }
}

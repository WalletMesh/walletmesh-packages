import {
  TransportType,
  AdapterType,
  ConnectionStatus
} from '../types.js';
import type {
  Adapter,
  Transport,
  WalletInfo,
  ConnectedWallet,
} from '../types.js';
import { PostMessageTransport } from '../transports/index.js';

export class WalletMeshClient {
  private transport: Transport | null = null;
  private adapter: Adapter | null = null;
  private connectionStatus: ConnectionStatus = ConnectionStatus.Idle;
  private connectedWallet: ConnectedWallet | null = null;

  /**
   * Creates a transport based on the specified type
   */
  private createTransport(type: TransportType, options = {}): Transport {
    switch (type) {
      case TransportType.PostMessage:
        return new PostMessageTransport(options);
      case TransportType.WebSocket:
        throw new Error('WebSocket transport not implemented');
      case TransportType.Extension:
        throw new Error('Extension transport not implemented');
      default:
        throw new Error(`Unsupported transport type: ${type}`);
    }
  }

  /**
   * Creates an adapter based on the specified type
   */
  private createAdapter(type: AdapterType, options = {}): Adapter {
    switch (type) {
      case AdapterType.WalletMeshAztec:
        // This will be implemented when we create the adapter
        throw new Error('WalletMeshAztec adapter not implemented');
      default:
        throw new Error(`Unsupported adapter type: ${type}`);
    }
  }

  /**
   * Connects to a wallet using the specified transport and adapter
   */
  async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (this.connectionStatus === ConnectionStatus.Connected) {
      throw new Error('Already connected to a wallet');
    }

    this.connectionStatus = ConnectionStatus.Connecting;

    try {
      // Create and connect transport
      this.transport = this.createTransport(
        walletInfo.transportType,
        walletInfo.transportOptions
      );
      await this.transport.connect();

      // Create adapter
      this.adapter = this.createAdapter(
        walletInfo.adapterType,
        walletInfo.adapterOptions
      );

      // Set up message routing
      this.transport.onMessage((data) => {
        if (this.adapter) {
          this.adapter.handleMessage(data);
        }
      });

      // Connect adapter
      const connectedWallet = await this.adapter.connect(walletInfo);
      this.connectedWallet = connectedWallet;
      this.connectionStatus = ConnectionStatus.Connected;

      return connectedWallet;
    } catch (error) {
      this.connectionStatus = ConnectionStatus.Idle;
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Disconnects from the current wallet
   */
  async disconnect(): Promise<void> {
    if (this.connectionStatus !== ConnectionStatus.Connected) {
      return;
    }

    this.connectionStatus = ConnectionStatus.Disconnecting;

    try {
      await this.cleanup();
    } finally {
      this.connectionStatus = ConnectionStatus.Idle;
      this.connectedWallet = null;
    }
  }

  /**
   * Gets the current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Gets the currently connected wallet info
   */
  getConnectedWallet(): ConnectedWallet | null {
    return this.connectedWallet;
  }

  /**
   * Gets the current chain-specific provider
   */
  async getProvider(): Promise<unknown> {
    if (!this.adapter) {
      throw new Error('No wallet connected');
    }
    return this.adapter.getProvider();
  }

  /**
   * Sends data through the transport
   */
  async send(data: unknown): Promise<void> {
    if (!this.transport) {
      throw new Error('No transport available');
    }
    await this.transport.send(data);
  }

  /**
   * Cleans up transport and adapter
   */
  private async cleanup(): Promise<void> {
    if (this.adapter) {
      await this.adapter.disconnect();
      this.adapter = null;
    }

    if (this.transport) {
      await this.transport.disconnect();
      this.transport = null;
    }
  }
}

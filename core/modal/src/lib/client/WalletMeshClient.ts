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
  TransportDefinition,
  AdapterDefinition
} from '../types.js';
import { PostMessageTransport } from '../transports/index.js';

export class WalletMeshClient {
  private connections: Map<string, {
    transport: Transport;
    adapter: Adapter;
    wallet: ConnectedWallet;
  }> = new Map();

  private createTransport(definition: TransportDefinition): Transport {
    switch (definition.type) {
      case TransportType.PostMessage:
        return new PostMessageTransport(definition.options);
      case TransportType.WebSocket:
        throw new Error('WebSocket transport not implemented');
      case TransportType.Extension:
        throw new Error('Extension transport not implemented');
      default:
        throw new Error(`Unsupported transport type: ${definition.type}`);
    }
  }

  /**
   * Creates an adapter based on the specified type
   */
  private createAdapter(definition: AdapterDefinition): Adapter {
    switch (definition.type) {
      case AdapterType.WalletMeshAztec:
        // This will be implemented when we create the adapter
        throw new Error('WalletMeshAztec adapter not implemented');
      default:
        throw new Error(`Unsupported adapter type: ${definition.type}`);
    }
  }

  /**
   * Connects to a wallet using the specified transport and adapter
   */
  async connectWallet(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (this.connections.has(walletInfo.id)) {
      throw new Error(`Wallet ${walletInfo.id} is already connected`);
    }

    try {
      // Create and connect transport
      const transport = this.createTransport(walletInfo.transport);
      await transport.connect();

      // Create adapter
      const adapter = this.createAdapter(walletInfo.adapter);

      // Set up message routing
      transport.onMessage((data) => {
        adapter.handleMessage(data);
      });

      // Connect adapter
      const connectedWallet = await adapter.connect(walletInfo);

      // Store connection
      this.connections.set(walletInfo.id, {
        transport,
        adapter,
        wallet: connectedWallet
      });

      return connectedWallet;
    } catch (error) {
      // Clean up any partial connections on error
      await this.disconnectWallet(walletInfo.id);
      throw error;
    }
  }

  /**
   * Disconnects a specific wallet
   */
  async disconnectWallet(walletId: string): Promise<void> {
    const connection = this.connections.get(walletId);
    if (connection) {
      try {
        await connection.adapter.disconnect();
        await connection.transport.disconnect();
      } finally {
        this.connections.delete(walletId);
      }
    }
  }

  /**
   * Lists all connected wallets
   */
  getConnectedWallets(): ConnectedWallet[] {
    return Array.from(this.connections.values()).map(c => c.wallet);
  }

  /**
   * Gets a specific wallet's provider
   */
  async getProvider(walletId: string): Promise<unknown> {
    const connection = this.connections.get(walletId);
    if (!connection) {
      throw new Error(`Wallet ${walletId} not connected`);
    }
    return connection.adapter.getProvider();
  }
}

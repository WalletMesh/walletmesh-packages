/**
 * Solana wallet provider using JSONRPCNode
 *
 * @module internal/providers/SolanaProvider
 * @packageDocumentation
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { SolanaTransaction, SolanaWalletProvider } from '../../../api/types/providers.js';
import type { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { Logger } from '../../core/logger/logger.js';
import { BaseWalletProvider } from '../base/BaseWalletProvider.js';

/**
 * Solana-specific provider for Solana blockchain wallets
 *
 * Implements the Solana Wallet Standard interface using JSON-RPC communication.
 * Supports Solana wallet operations including account management, transaction signing,
 * and message signing.
 *
 * @public
 * @example
 * ```typescript
 * // Create Solana provider with transport
 * const transport = new TransportToJsonrpcAdapter(extensionTransport);
 * const provider = new SolanaProvider(transport);
 *
 * // Connect to wallet
 * const connection = await provider.connect();
 * console.log('Connected to:', connection.publicKey);
 *
 * // Sign transaction
 * const signature = await provider.signTransaction({
 *   recentBlockhash: 'recent-blockhash',
 *   feePayer: connection.publicKey,
 *   instructions: []
 * });
 * ```
 */
export class SolanaProvider extends BaseWalletProvider implements SolanaWalletProvider {
  private publicKey: string | null = null;

  /**
   * Create a new Solana provider
   *
   * @param chainType - Chain type (should be ChainType.Solana)
   * @param transport - JSONRPCTransport for communication with the wallet
   * @param initialChainId - Initial chain ID (defaults to 'solana-mainnet')
   */
  constructor(
    chainType: ChainType,
    transport: JSONRPCTransport,
    initialChainId: string | undefined,
    logger: Logger,
  ) {
    super(chainType, transport, initialChainId || 'solana-mainnet', logger);
  }

  /**
   * Connect to the Solana wallet
   *
   * This method prompts the user to connect their Solana wallet and returns
   * the public key of the selected account.
   *
   * @returns Promise resolving to connection info with public key
   * @throws If user rejects connection or wallet is not available
   */
  async connect(): Promise<{ publicKey: string }> {
    try {
      const result = await this.jsonrpcNode.callMethod('solana_connect', undefined);
      this.publicKey = result.publicKey;
      this.updateContext({
        accounts: [result.publicKey],
        isConnected: true,
      });
      return result;
    } catch (error) {
      throw ErrorFactory.connectionFailed('Failed to connect to Solana wallet', {
        chainType: this.context.chainType,
        originalError: error,
      });
    }
  }

  /**
   * Get the connected public key
   *
   * @returns The public key of the connected account, or null if not connected
   */
  getPublicKey(): string | null {
    return this.publicKey ?? null;
  }

  /**
   * Update the public key (called by adapter when wallet events occur)
   *
   * @param publicKey - New public key or null if disconnected
   * @internal
   */
  updatePublicKey(publicKey: string | null): void {
    this.publicKey = publicKey;
    this.updateContext({
      accounts: publicKey ? [publicKey] : [],
      isConnected: publicKey !== null,
    });
  }

  /**
   * Sign a Solana transaction
   *
   * @param transaction - Solana transaction object to sign
   * @returns Promise resolving to signed transaction signature
   * @throws If signing fails or user rejects
   */
  async signTransaction(transaction: SolanaTransaction): Promise<string> {
    if (!this.context.isConnected || !this.publicKey) {
      throw ErrorFactory.connectionFailed('Solana provider not connected');
    }

    // Validate transaction input
    if (!transaction || typeof transaction !== 'object') {
      throw ErrorFactory.transportError('Invalid transaction object provided for signing');
    }

    try {
      return await this.jsonrpcNode.callMethod('solana_signTransaction', [transaction]);
    } catch (error) {
      throw ErrorFactory.transportError(
        `Failed to sign Solana transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Sign a message with the connected account
   *
   * @param message - Message to sign (string or Uint8Array)
   * @returns Promise resolving to signature string
   * @throws If signing fails or user rejects or message is invalid
   */
  async signMessage(message: string): Promise<string> {
    if (!this.context.isConnected || !this.publicKey) {
      throw ErrorFactory.connectionFailed('Solana provider not connected');
    }

    // Validate message input
    if (message === null || message === undefined) {
      throw ErrorFactory.transportError('Message parameter is required for signing');
    }

    if (typeof message !== 'string') {
      throw ErrorFactory.transportError(
        `Invalid message type: expected string, got ${typeof message}`,
      );
    }

    if (message.length === 0) {
      throw ErrorFactory.transportError('Message cannot be empty');
    }

    try {
      return await this.jsonrpcNode.callMethod('solana_signMessage', [message]);
    } catch (error) {
      throw ErrorFactory.transportError(
        `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Disconnect from the Solana wallet
   *
   * @returns Promise that resolves when disconnection is complete
   */
  override async disconnect(): Promise<void> {
    try {
      await this.jsonrpcNode.callMethod('solana_disconnect', undefined);
      this.publicKey = null;
      this.updateContext({
        accounts: [],
        isConnected: false,
      });
    } catch (error) {
      // Still clean up local state even if wallet disconnect fails
      this.publicKey = null;
      this.updateContext({
        accounts: [],
        isConnected: false,
      });
      throw ErrorFactory.transportError(
        `Failed to disconnect from Solana wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Implement abstract methods from BaseWalletProvider

  /**
   * Handle getting accounts via solana_getAccounts method
   *
   * @returns Promise resolving to array of account addresses
   * @throws If request fails
   * @protected
   */
  protected async handleGetAccounts(): Promise<string[]> {
    const accounts = await this.jsonrpcNode.callMethod('solana_getAccounts', undefined);
    // Update the public key if we got accounts
    if (accounts.length > 0 && accounts[0] !== undefined) {
      this.publicKey = accounts[0];
    } else {
      this.publicKey = null;
    }
    return accounts;
  }

  /**
   * Handle getting chain ID - Solana uses a fixed chain identifier
   *
   * @returns Promise resolving to chain ID string
   * @protected
   */
  protected async handleGetChainId(): Promise<string> {
    // Solana doesn't have traditional chain IDs like EVM
    // Return the current network/cluster identifier
    return this.context.chainId || 'solana-mainnet';
  }

  /**
   * Handle disconnection via solana_disconnect method
   *
   * @returns Promise that resolves when disconnection is complete
   * @throws If disconnection fails
   * @protected
   */
  protected async handleDisconnect(): Promise<void> {
    await this.jsonrpcNode.callMethod('solana_disconnect', undefined);
    this.publicKey = null;
  }
}

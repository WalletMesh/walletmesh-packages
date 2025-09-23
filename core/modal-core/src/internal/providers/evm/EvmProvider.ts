/**
 * EVM Provider - Blockchain API layer for Ethereum and EVM-compatible chains
 *
 * ARCHITECTURAL ROLE: This provider implements the blockchain API that dApps use
 * to interact with EVM chains. It handles the WHAT (blockchain operations),
 * while adapters handle the HOW (connection to wallets).
 *
 * @see ADAPTER_PROVIDER_ARCHITECTURE.md for architecture details
 * @module internal/providers/EvmProvider
 * @packageDocumentation
 */

import type { EvmTransaction, EvmWalletProvider } from '../../../api/types/providers.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { BaseWalletProvider } from '../base/BaseWalletProvider.js';

/**
 * EVM Provider - API implementation for Ethereum and EVM-compatible chains
 *
 * PURPOSE: This provider implements the blockchain API layer for EVM chains.
 * It provides the standard EIP-1193 interface that dApps use to interact with
 * Ethereum and compatible blockchains.
 *
 * ARCHITECTURAL SEPARATION:
 * - Providers (this class): Implement blockchain operations and standards
 * - Adapters: Handle wallet connection and transport establishment
 * - Transport: The communication channel (provided by adapter)
 *
 * KEY RESPONSIBILITIES:
 * - Implement EIP-1193 provider standard
 * - Handle blockchain method calls (sendTransaction, signMessage, etc.)
 * - Manage blockchain state (accounts, chain ID)
 * - Translate dApp requests to JSON-RPC calls
 *
 * @public
 * @example
 * ```typescript
 * // Provider is created by adapter with established transport
 * // (You typically don't create providers directly)
 * const provider = new EvmProvider(
 *   ChainType.Evm,
 *   transport,      // Transport established by adapter
 *   '0x1',          // Ethereum mainnet
 *   logger
 * );
 *
 * // dApp uses provider for blockchain operations
 * const accounts = await provider.requestAccounts();
 * const txHash = await provider.sendTransaction({
 *   from: accounts[0],
 *   to: '0x742d35Cc6634C0532925a3b8D9C0AC79C0C44B03',
 *   value: '0x1000000000000000000' // 1 ETH in wei
 * });
 * ```
 *
 * @remarks
 * - This provider can be reused by ANY wallet that supports EVM
 * - It doesn't know HOW to connect to wallets (that's the adapter's job)
 * - It only knows HOW to perform EVM blockchain operations
 *
 * @see EvmAdapter for the connection layer implementation
 * @see ADAPTER_PROVIDER_ARCHITECTURE.md for architecture details
 */
export class EvmProvider extends BaseWalletProvider implements EvmWalletProvider {
  /**
   * Request account access from the wallet (EIP-1102)
   *
   * This method prompts the user to connect their wallet and grant access
   * to their accounts. It automatically updates the provider's connected state.
   *
   * @returns Promise resolving to array of account addresses
   * @throws If user rejects request or wallet is not available
   */
  async requestAccounts(): Promise<string[]> {
    try {
      const accounts = await this.jsonrpcNode.callMethod('eth_requestAccounts', undefined);
      this.updateContext({
        accounts,
        isConnected: accounts.length > 0,
      });
      return accounts;
    } catch (error) {
      throw ErrorFactory.connectionFailed('Failed to request accounts from EVM wallet', {
        chainType: this.context.chainType,
        originalError: error,
      });
    }
  }

  /**
   * Send a transaction to the blockchain
   *
   * @param transaction - Transaction object to send
   * @returns Promise resolving to transaction hash
   * @throws If transaction fails or user rejects
   */
  async sendTransaction(transaction: EvmTransaction): Promise<string> {
    if (!this.context.isConnected) {
      throw ErrorFactory.connectionFailed('EVM provider not connected');
    }

    try {
      return await this.jsonrpcNode.callMethod('eth_sendTransaction', [transaction]);
    } catch (error) {
      throw ErrorFactory.transportError(
        `Failed to send EVM transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Sign a message with the user's private key
   *
   * @param account - Account address to sign with
   * @param message - Message to sign
   * @returns Promise resolving to signature string
   * @throws If signing fails or user rejects
   */
  async signMessage(account: string, message: string): Promise<string> {
    if (!this.context.isConnected) {
      throw ErrorFactory.connectionFailed('EVM provider not connected');
    }

    if (!this.context.accounts.includes(account)) {
      throw ErrorFactory.transportError(`Account not connected: ${account}`);
    }

    try {
      return await this.jsonrpcNode.callMethod('eth_signMessage', [account, message]);
    } catch (error) {
      throw ErrorFactory.transportError(
        `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get account balance in wei
   *
   * @param account - Account address to get balance for
   * @param blockTag - Block tag (latest, earliest, pending, or block number)
   * @returns Promise resolving to balance in wei as string
   * @throws If request fails
   */
  async getBalance(account: string, blockTag = 'latest'): Promise<string> {
    if (!this.context.isConnected) {
      throw ErrorFactory.connectionFailed('EVM provider not connected');
    }

    try {
      return await this.jsonrpcNode.callMethod('eth_getBalance', [account, blockTag]);
    } catch (error) {
      throw ErrorFactory.transportError(
        `Failed to get account balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Switch to a different EVM chain
   *
   * @param chainId - Chain ID to switch to (e.g., '0x1' for Ethereum)
   * @returns Promise that resolves when chain switch is complete
   * @throws If chain switch fails or chain is not supported
   */
  async switchChain(chainId: string): Promise<void> {
    if (!this.context.isConnected) {
      throw ErrorFactory.connectionFailed('EVM provider not connected');
    }

    try {
      await this.jsonrpcNode.callMethod('wallet_switchEthereumChain', [{ chainId }]);
      this.updateContext({ chainId });
    } catch (error) {
      throw ErrorFactory.transportError(
        `Failed to switch EVM chain: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * EVM request method following EIP-1193 provider interface
   *
   * This method implements the standard Ethereum provider request interface,
   * allowing EVM wallets to use their natural communication pattern.
   *
   * @param args - Request arguments with method and params
   * @returns Promise resolving to method result
   * @throws If request fails or wallet is not available
   * @example
   * ```typescript
   * // Request accounts
   * const accounts = await provider.request({ method: 'eth_requestAccounts' });
   *
   * // Send transaction
   * const txHash = await provider.request({
   *   method: 'eth_sendTransaction',
   *   params: [{ to: '0x...', value: '0x...' }]
   * });
   * ```
   */
  async request<T = unknown>(args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }): Promise<T> {
    const { method, params } = args;

    try {
      return (await this.jsonrpcNode.callMethod(method, params)) as T;
    } catch (error) {
      throw ErrorFactory.transportError(
        `EVM request failed for method ${method}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Implement abstract methods from BaseWalletProvider

  /**
   * Handle getting accounts via eth_accounts method
   *
   * @returns Promise resolving to array of account addresses
   * @throws If request fails
   * @protected
   */
  protected async handleGetAccounts(): Promise<string[]> {
    return await this.jsonrpcNode.callMethod('eth_accounts', undefined);
  }

  /**
   * Handle getting chain ID via eth_chainId method
   *
   * @returns Promise resolving to chain ID string
   * @throws If request fails
   * @protected
   */
  protected async handleGetChainId(): Promise<string> {
    return await this.jsonrpcNode.callMethod('eth_chainId', undefined);
  }

  /**
   * Handle disconnection by notifying the wallet
   *
   * EVM wallets typically don't have a specific disconnect method,
   * so this primarily updates internal state and cleans up resources.
   *
   * @returns Promise that resolves when disconnection is complete
   * @protected
   */
  protected async handleDisconnect(): Promise<void> {
    // EVM wallets don't typically have a disconnect method
    // The disconnection is handled by state updates in the base class
    // Some wallets might support a disconnect method in the future
    try {
      // Try to call a generic wallet disconnect method if available
      // wallet_disconnect is not in the type definition but some wallets support it
      await this.jsonrpcNode.callMethod('wallet_disconnect' as string, undefined);
    } catch {
      // Ignore errors - many EVM wallets don't support explicit disconnect
      // The state update in the base class is sufficient
    }
  }
}

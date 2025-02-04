import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { RouterEventMap } from '@walletmesh/router';
import { WalletRouterProvider } from '@walletmesh/router';
import { AztecWalletError, AztecWalletErrorType } from './errors.js';
import type { AztecChainId, AztecWalletMethodMap, TransactionParams } from './types.js';

/**
 * Provider for interacting with multiple Aztec chains through WalletMesh router.
 *
 * This class implements the client-side interface for dApps to communicate with Aztec wallets.
 * It handles:
 * - Connection management for multiple chains
 * - Session tracking
 * - Method calls with proper context
 * - Event handling for wallet state changes
 *
 * @example
 * ```typescript
 * // Create provider with transport
 * const provider = new AztecProvider(transport);
 *
 * // Connect to chains
 * await provider.connect(['aztec:testnet', 'aztec:devnet']);
 *
 * // Single operation using convenience method
 * const address = await provider.getAccount('aztec:testnet');
 *
 * // Single operation using chain builder
 * const txHash = await provider.chain('aztec:testnet')
 *   .call('aztec_sendTransaction', {
 *     functionCalls: [{
 *       contractAddress: "0x...",
 *       functionName: "transfer",
 *       args: [recipient, amount]
 *     }]
 *   })
 *   .execute();
 *
 * // Multiple operations in one call
 * const [account, contracts, blockNumber] = await provider
 *   .chain('aztec:testnet')
 *   .call('aztec_getAccount')
 *   .call('aztec_getContracts')
 *   .call('aztec_getBlockNumber')
 *   .execute();
 * ```
 */
export class AztecProvider extends WalletRouterProvider {
  private connectedChains: Set<AztecChainId>;
  private requestedChains: Set<AztecChainId>;

  constructor(transport: JSONRPCTransport) {
    super(transport);
    this.connectedChains = new Set();
    this.requestedChains = new Set();

    // Bind event handlers
    this.handleWalletStateChanged = this.handleWalletStateChanged.bind(this);
    this.handleSessionTerminated = this.handleSessionTerminated.bind(this);

    // Register event handlers
    this.on('wm_walletStateChanged', this.handleWalletStateChanged);
    this.on('wm_sessionTerminated', this.handleSessionTerminated);
  }

  /**
   * Handles wallet state change events from the router.
   * Updates the set of connected chains based on account availability.
   * @param params - Event parameters containing chain ID and changes
   */
  private handleWalletStateChanged(params: RouterEventMap['wm_walletStateChanged']): void {
    const { chainId, changes } = params;
    const aztecChainId = chainId as AztecChainId;

    // Only handle events for requested chains
    if (this.requestedChains.has(aztecChainId)) {
      if (changes.accounts && changes.accounts.length > 0) {
        this.connectedChains.add(aztecChainId);
        console.log('Chain connected:', aztecChainId);
      } else {
        this.connectedChains.delete(aztecChainId);
        console.log('Chain disconnected:', aztecChainId);
      }
      console.log('Connected chains:', Array.from(this.connectedChains));
    }
  }

  /**
   * Handles session termination events from the router.
   * Cleans up session state and connected chains.
   * @param params - Event parameters containing session ID
   */
  private handleSessionTerminated(params: RouterEventMap['wm_sessionTerminated']): void {
    const { sessionId } = params;
    if (sessionId === this.sessionId) {
      this.connectedChains.clear();
      this.requestedChains.clear();
      console.log('Session terminated, all chains cleared');
    }
  }

  /**
   * Gets the list of currently connected chain IDs.
   * @returns Array of connected chain IDs
   */
  public getSupportedChains(): AztecChainId[] {
    return Array.from(this.connectedChains);
  }

  public async getAccount(chainId: AztecChainId): Promise<string> {
    const result = await this.chain(chainId).call('aztec_getAccount').execute();
    if (typeof result !== 'string' || !result) {
      throw new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Invalid account address returned');
    }
    return result;
  }

  /**
   * Sends a transaction to the specified chain.
   * @param chainId - ID of the chain to send transaction to
   * @param params - Transaction parameters including function calls and optional auth witnesses
   * @returns Transaction hash
   * @throws {AztecWalletError} If transaction fails or response invalid
   */
  public async sendTransaction(chainId: AztecChainId, params: TransactionParams): Promise<string> {
    const result = await this.chain(chainId).call('aztec_sendTransaction', params).execute();
    if (typeof result !== 'string' || !result) {
      throw new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Invalid transaction hash returned');
    }
    return result;
  }

  /**
   * Simulates a transaction without submitting it.
   * @param chainId - ID of the chain to simulate on
   * @param params - Transaction parameters to simulate
   * @returns Simulation result
   * @throws {AztecWalletError} If simulation fails
   */
  public async simulateTransaction(
    chainId: AztecChainId,
    params: TransactionParams['functionCalls'][0],
  ): Promise<unknown> {
    const result = await this.chain(chainId).call('aztec_simulateTransaction', params).execute();
    if (result === undefined || result === null) {
      throw new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Invalid simulation result returned');
    }
    return result;
  }

  /**
   * Registers a contract instance with the wallet.
   * @param chainId - ID of the chain where contract is deployed
   * @param params - Contract registration parameters
   * @throws {AztecWalletError} If registration fails
   */
  public async registerContract(
    chainId: AztecChainId,
    params: AztecWalletMethodMap['aztec_registerContract']['params'],
  ): Promise<void> {
    await this.chain(chainId).call('aztec_registerContract', params).execute();
  }

  /**
   * Registers a contract class with the wallet.
   * @param chainId - ID of the chain to register on
   * @param params - Contract class registration parameters
   * @throws {AztecWalletError} If registration fails
   */
  public async registerContractClass(
    chainId: AztecChainId,
    params: AztecWalletMethodMap['aztec_registerContractClass']['params'],
  ): Promise<void> {
    await this.chain(chainId).call('aztec_registerContractClass', params).execute();
  }

  /**
   * Registers a transaction sender with the wallet.
   * @param chainId - ID of the chain to register on
   * @param params - Sender registration parameters
   * @throws {AztecWalletError} If registration fails
   */
  public async registerSender(
    chainId: AztecChainId,
    params: AztecWalletMethodMap['aztec_registerSender']['params'],
  ): Promise<void> {
    await this.chain(chainId).call('aztec_registerSender', params).execute();
  }
}

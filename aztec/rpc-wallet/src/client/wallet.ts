import type { AztecAddress } from '@aztec/aztec.js/addresses';
import type { AuthWitness, CallIntent, IntentInnerHash } from '@aztec/aztec.js/authorization';
import type { Fr } from '@aztec/aztec.js/fields';
import type { ExecutionPayload } from '@aztec/aztec.js/tx';
import type {
  Aliased,
  BatchableMethods,
  BatchedMethod,
  BatchResults,
  ProfileOptions,
  SendOptions,
  SimulateOptions,
  Wallet,
} from '@aztec/aztec.js/wallet';
import type { ChainInfo } from '@aztec/entrypoints/interfaces';
import type { ContractArtifact, EventMetadataDefinition, FunctionCall } from '@aztec/stdlib/abi';
import type {
  ContractClassMetadata,
  ContractInstanceWithAddress,
  ContractMetadata,
} from '@aztec/stdlib/contract';
import type {
  TxHash,
  TxProfileResult,
  TxReceipt,
  TxSimulationResult,
  UtilitySimulationResult,
} from '@aztec/stdlib/tx';
import type { AztecChainId } from '../types.js';
import type { AztecWalletRouterProvider } from './aztec-router-provider.js';

/**
 * Client-side wallet implementation that provides access to an Aztec wallet via JSON-RPC.
 *
 * This class implements the `aztec.js` {@link Wallet} interface, allowing dApps to interact
 * with remote Aztec wallets through the WalletMesh router system. All method calls are
 * automatically serialized/deserialized by the underlying {@link AztecWalletRouterProvider}.
 *
 * Instances are typically created using the {@link connectAztec} helper function, which
 * establishes a connection and returns an initialized wallet instance.
 *
 * @example
 * ```typescript
 * import { AztecWalletRouterProvider, connectAztec } from '@walletmesh/aztec-rpc-wallet/client';
 *
 * const provider = new AztecWalletRouterProvider(transport);
 * const { wallet } = await connectAztec(provider, 'aztec:testnet');
 *
 * // Use the wallet
 * const chainInfo = await wallet.getChainInfo();
 * const accounts = await wallet.getAccounts();
 * ```
 *
 * @see {@link connectAztec} for creating wallet instances
 * @see {@link AztecWalletRouterProvider} for the underlying provider
 * @see {@link Wallet} from aztec.js for the interface this implements
 */
export class AztecWalletProvider implements Wallet {
  /**
   * Creates a new `AztecWalletProvider` instance.
   *
   * @param routerProvider - The router provider used for JSON-RPC communication
   * @param chainId - The Aztec chain ID this wallet is connected to
   */
  constructor(
    protected routerProvider: AztecWalletRouterProvider,
    protected chainId: AztecChainId,
  ) {}

  protected async callMethod<T>(method: string, params: unknown[]): Promise<T> {
    return this.routerProvider.call(this.chainId, {
      method,
      params,
    }) as Promise<T>;
  }

  /**
   * Gets metadata for a contract class.
   *
   * @param id - The contract class ID
   * @param includeArtifact - Whether to include the full contract artifact in the response
   * @returns The contract class metadata
   */
  async getContractClassMetadata(id: Fr, includeArtifact?: boolean): Promise<ContractClassMetadata> {
    return this.callMethod('aztec_getContractClassMetadata', [id, includeArtifact ?? false]);
  }

  /**
   * Gets metadata for a deployed contract instance.
   *
   * @param address - The contract address
   * @returns The contract metadata
   */
  async getContractMetadata(address: AztecAddress): Promise<ContractMetadata> {
    return this.callMethod('aztec_getContractMetadata', [address]);
  }

  /**
   * Queries private (encrypted) events for a contract.
   *
   * @param contractAddress - The contract address to query events from
   * @param eventMetadata - Metadata definition for the event type
   * @param from - Starting block number
   * @param numBlocks - Number of blocks to query
   * @param recipients - Array of recipient addresses to decrypt events for
   * @returns Array of decoded event data
   */
  async getPrivateEvents<T>(
    contractAddress: AztecAddress,
    eventMetadata: EventMetadataDefinition,
    from: number,
    numBlocks: number,
    recipients: AztecAddress[],
  ): Promise<T[]> {
    return this.callMethod('aztec_getPrivateEvents', [
      contractAddress,
      eventMetadata,
      from,
      numBlocks,
      recipients,
    ]);
  }

  /**
   * Gets information about the connected Aztec chain.
   *
   * @returns Chain information including chain ID, version, and other metadata
   */
  async getChainInfo(): Promise<ChainInfo> {
    return this.callMethod('aztec_getChainInfo', []);
  }

  /**
   * Gets the receipt for a transaction.
   *
   * @param txHash - The transaction hash
   * @returns The transaction receipt
   */
  async getTxReceipt(txHash: TxHash): Promise<TxReceipt> {
    return this.callMethod('aztec_getTxReceipt', [txHash]);
  }

  /**
   * Registers an authorized sender address.
   *
   * @param address - The sender address to register
   * @param alias - Optional alias for the sender
   * @returns The registered sender address
   */
  async registerSender(address: AztecAddress, alias?: string): Promise<AztecAddress> {
    return this.callMethod('aztec_registerSender', [address, alias]);
  }

  /**
   * Gets the address book containing all registered addresses with their aliases.
   *
   * @returns Array of aliased addresses
   */
  async getAddressBook(): Promise<Aliased<AztecAddress>[]> {
    return this.callMethod('aztec_getAddressBook', []);
  }

  /**
   * Gets all available accounts.
   *
   * @returns Array of aliased account addresses
   */
  async getAccounts(): Promise<Aliased<AztecAddress>[]> {
    return this.callMethod('aztec_getAccounts', []);
  }

  /**
   * Registers a deployed contract instance with the wallet.
   *
   * @param instance - The contract instance with its address
   * @param artifact - Optional contract artifact
   * @param secretKey - Optional secret key for the contract
   * @returns The registered contract instance
   */
  async registerContract(
    instance: ContractInstanceWithAddress,
    artifact?: ContractArtifact,
    secretKey?: Fr,
  ): Promise<ContractInstanceWithAddress> {
    return this.callMethod('aztec_registerContract', [instance, artifact, secretKey]);
  }

  /**
   * Simulates a transaction without sending it to the network.
   *
   * @param exec - The execution payload to simulate
   * @param opts - Simulation options
   * @returns The simulation result including gas usage and execution details
   */
  async simulateTx(exec: ExecutionPayload, opts: SimulateOptions): Promise<TxSimulationResult> {
    return this.callMethod('aztec_simulateTx', [exec, opts]);
  }

  /**
   * Simulates a utility (view/pure) function call.
   *
   * @param call - The function call to simulate
   * @param authwits - Optional authorization witnesses
   * @returns The utility simulation result
   */
  async simulateUtility(call: FunctionCall, authwits?: AuthWitness[]): Promise<UtilitySimulationResult> {
    return this.callMethod('aztec_simulateUtility', [call, authwits]);
  }

  /**
   * Profiles a transaction for performance analysis.
   *
   * @param exec - The execution payload to profile
   * @param opts - Profiling options
   * @returns The profiling result with performance metrics
   */
  async profileTx(exec: ExecutionPayload, opts: ProfileOptions): Promise<TxProfileResult> {
    return this.callMethod('aztec_profileTx', [exec, opts]);
  }

  /**
   * Sends a transaction to the network.
   *
   * @param exec - The execution payload to send
   * @param opts - Send options including fee configuration
   * @returns The transaction hash
   */
  async sendTx(exec: ExecutionPayload, opts: SendOptions): Promise<TxHash> {
    return this.callMethod('aztec_sendTx', [exec, opts]);
  }

  /**
   * Creates an authorization witness for a message hash or intent.
   *
   * @param from - The address creating the authorization
   * @param messageHashOrIntent - The message hash, intent inner hash, or call intent to authorize
   * @returns The created authorization witness
   */
  async createAuthWit(
    from: AztecAddress,
    messageHashOrIntent: Fr | IntentInnerHash | CallIntent,
  ): Promise<AuthWitness> {
    return this.callMethod('aztec_createAuthWit', [from, messageHashOrIntent]);
  }

  /**
   * Executes multiple operations in a single batch transaction.
   *
   * @param methods - Array of batched method calls to execute
   * @returns Results for each batched method call
   */
  async batch<const T extends readonly BatchedMethod<keyof BatchableMethods>[]>(
    methods: T,
  ): Promise<BatchResults<T>> {
    return this.callMethod('aztec_batch', [methods]);
  }
}

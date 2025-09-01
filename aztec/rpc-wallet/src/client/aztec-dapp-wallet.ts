import type {
  AuthWitness,
  AztecAddress,
  CompleteAddress,
  ContractArtifact,
  ContractFunctionInteraction,
  ContractInstanceWithAddress,
  Fr,
  L2Block,
  Tx,
  TxExecutionRequest,
  TxHash,
  TxReceipt,
  Wallet,
} from '@aztec/aztec.js';
import { Contract, DeploySentTx, SentTx } from '@aztec/aztec.js';
import type { IntentAction, IntentInnerHash } from '@aztec/aztec.js/utils';
import { DefaultAccountEntrypoint } from '@aztec/entrypoints/account';
import type { AuthWitnessProvider, FeeOptions, TxExecutionOptions } from '@aztec/entrypoints/interfaces';
import type { ExecutionPayload } from '@aztec/entrypoints/payload';
import { createLogger } from '@aztec/foundation/log';
import type { NodeInfo } from '@aztec/stdlib/contract';
import type { GasFees } from '@aztec/stdlib/gas';
import type {
  ContractClassMetadata,
  ContractMetadata,
  EventMetadataDefinition,
  PXEInfo,
} from '@aztec/stdlib/interfaces/client';
import type {
  PrivateExecutionResult,
  SimulationOverrides,
  TxProfileResult,
  TxProvingResult,
  TxSimulationResult,
  UtilitySimulationResult,
} from '@aztec/stdlib/tx';

import type { AztecChainId } from '../types.js';
import type { AztecRouterProvider } from './aztec-router-provider.js';

const logger = createLogger('aztec-rpc-wallet:dapp-wallet');

/**
 * RPC-based AuthWitnessProvider that delegates auth witness creation to the wallet via RPC.
 * This allows the DefaultAccountEntrypoint to create auth witnesses through the remote wallet.
 * @internal
 */
class RPCAuthWitnessProvider implements AuthWitnessProvider {
  constructor(private wallet: AztecDappWallet) {}

  /**
   * Creates an authorization witness for the given message hash.
   * Delegates the call to the underlying AztecDappWallet instance.
   * @param messageHash - The message hash to authorize.
   * @returns A promise that resolves to the AuthWitness.
   */
  async createAuthWit(messageHash: Fr | Buffer): Promise<AuthWitness> {
    return this.wallet.createAuthWit(messageHash);
  }
}

/**
 * Aztec DApp Wallet that implements the aztec.js {@link Wallet} interface.
 * This class provides a client-side representation of an Aztec wallet,
 * interacting with a remote wallet implementation (typically an {@link AccountWallet}
 * managed by a {@link JSONRPCNode} created via `createAztecWalletNode`)
 * through the WalletMesh router system.
 *
 * It requires an {@link AztecRouterProvider} instance to handle the
 * serialization and deserialization of Aztec-specific types (e.g., `AztecAddress`, `Fr`)
 * when communicating with the router.
 *
 * An instance of this wallet should typically be created using the
 * {@link createAztecWallet} helper function, which also handles initialization.
 *
 * @example
 * ```typescript
 * // Assuming 'provider' is an initialized AztecRouterProvider
 * const wallet = await createAztecWallet(provider, 'aztec:mainnet');
 * const address = wallet.getAddress(); // Synchronous access after initialization
 * const txHash = await wallet.sendTx(someTx);
 * ```
 */
export class AztecDappWallet implements Wallet {
  private cachedAddress?: AztecAddress;
  private cachedCompleteAddress?: CompleteAddress;
  private cachedChainId?: Fr;
  private cachedVersion?: Fr;
  private entrypoint?: DefaultAccountEntrypoint;
  private authProvider?: RPCAuthWitnessProvider;

  /**
   * Creates an instance of AztecDappWallet.
   * Note: Prefer using the {@link createAztecWallet} helper function for creating
   * and initializing wallet instances.
   *
   * @param routerProvider - The AztecRouterProvider instance used for communication.
   * @param chainId - The Aztec chain ID this wallet is associated with.
   */
  constructor(
    private routerProvider: AztecRouterProvider,
    private chainId: AztecChainId,
  ) {}

  /**
   * Gets the chain ID for this wallet.
   * This value is cached during initialization.
   * @returns The chain ID as an Fr.
   * @throws If the wallet is not initialized (e.g., if not created via `createAztecWallet`).
   */
  getChainId(): Fr {
    if (!this.cachedChainId) {
      throw new Error(
        'Chain ID not initialized. Call createAztecWallet() to properly initialize the wallet.',
      );
    }
    return this.cachedChainId;
  }

  /**
   * Asynchronously fetches the chain ID from the remote wallet via an RPC call.
   * This method directly queries the connected wallet node.
   *
   * @returns A promise that resolves to the chain ID as an {@link Fr}.
   * @see {@link AztecWalletMethodMap.aztec_getChainId}
   */
  async getChainIdAsync(): Promise<Fr> {
    const chainId = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getChainId',
    });
    return chainId as unknown as Fr;
  }

  /**
   * Gets the version of the wallet (typically PXE version).
   * This value is cached during initialization.
   * @returns The wallet version as an Fr.
   * @throws If the wallet is not initialized.
   */
  getVersion(): Fr {
    if (!this.cachedVersion) {
      throw new Error(
        'Wallet version not initialized. Call createAztecWallet() to properly initialize the wallet.',
      );
    }
    return this.cachedVersion;
  }

  /**
   * Asynchronously fetches the wallet version (typically the PXE version) from the remote wallet via an RPC call.
   * This method directly queries the connected wallet node.
   *
   * @returns A promise that resolves to the wallet version as an {@link Fr}.
   * @see {@link AztecWalletMethodMap.aztec_getVersion}
   */
  async getVersionAsync(): Promise<Fr> {
    const version = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getVersion',
    });
    return version as unknown as Fr;
  }

  /**
   * Gets the primary Aztec address for this wallet.
   * This value is cached during initialization.
   * Implements {@link Wallet.getAddress}.
   * @returns The wallet's AztecAddress.
   * @throws If the wallet is not initialized.
   */
  getAddress(): AztecAddress {
    if (!this.cachedAddress) {
      throw new Error('Wallet not initialized. Call createAztecWallet() to properly initialize the wallet.');
    }
    return this.cachedAddress;
  }

  /**
   * Asynchronously fetches the primary Aztec address from the remote wallet via an RPC call.
   * This method directly queries the connected wallet node.
   *
   * @returns A promise that resolves to the wallet's {@link AztecAddress}.
   * @see {@link AztecWalletMethodMap.aztec_getAddress}
   */
  async getAddressAsync(): Promise<AztecAddress> {
    const address = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getAddress',
    });
    return address as AztecAddress;
  }

  /**
   * Gets the complete address (including public keys) for this wallet.
   * This value is cached during initialization.
   * Implements {@link Wallet.getCompleteAddress}.
   * @returns The wallet's CompleteAddress.
   * @throws If the wallet is not initialized.
   */
  getCompleteAddress(): CompleteAddress {
    if (!this.cachedCompleteAddress) {
      throw new Error('Wallet not initialized. Call createAztecWallet() to properly initialize the wallet.');
    }
    return this.cachedCompleteAddress;
  }

  /**
   * Asynchronously fetches the complete address (including public keys) from the remote wallet via an RPC call.
   * This method directly queries the connected wallet node.
   *
   * @returns A promise that resolves to the wallet's {@link CompleteAddress}.
   * @see {@link AztecWalletMethodMap.aztec_getCompleteAddress}
   */
  async getCompleteAddressAsync(): Promise<CompleteAddress> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getCompleteAddress',
    });
    return result as CompleteAddress;
  }

  /**
   * Fetches and caches values (address, chain ID, version) that are accessed synchronously.
   * @internal
   */
  private async fetchCachedValues(): Promise<void> {
    const completeAddress = await this.getCompleteAddressAsync();

    this.cachedCompleteAddress = completeAddress;
    this.cachedAddress = completeAddress.address;
    this.cachedChainId = await this.getChainIdAsync();
    this.cachedVersion = await this.getVersionAsync();
  }

  /**
   * Initializes the wallet instance by fetching and caching necessary values.
   * This method is called by {@link createAztecWallet}.
   * @internal
   */
  async initialize(): Promise<void> {
    try {
      await this.fetchCachedValues();

      // Initialize the auth provider and entrypoint
      if (!this.cachedAddress || !this.cachedChainId || !this.cachedVersion) {
        throw new Error('Failed to initialize wallet: missing required cached values');
      }
      this.authProvider = new RPCAuthWitnessProvider(this);
      this.entrypoint = new DefaultAccountEntrypoint(
        this.cachedAddress,
        this.authProvider,
        this.cachedChainId.toNumber(),
        this.cachedVersion.toNumber(),
      );

      logger.debug(`AztecDappWallet initialized: ${this.cachedAddress?.toString()}`);
    } catch (error) {
      logger.warn('AztecDappWallet.initialize: Failed to initialize wallet addresses:', error);
      throw error;
    }
  }

  /**
   * Registers an authorized sender for this account by making an RPC call to the remote wallet.
   * Implements {@link Wallet.registerSender}.
   * @param address - The {@link AztecAddress} of the sender to register.
   * @returns A promise that resolves to the registered sender's {@link AztecAddress}.
   * @see {@link AztecWalletMethodMap.aztec_registerSender}
   */
  async registerSender(address: AztecAddress): Promise<AztecAddress> {
    await this.routerProvider.call(this.chainId, {
      method: 'aztec_registerSender',
      params: { sender: address },
    });
    return address; // Return the registered address
  }

  /**
   * Retrieves the list of registered senders for this account by making an RPC call to the remote wallet.
   * Implements {@link Wallet.getSenders}.
   * @returns A promise that resolves to an array of {@link AztecAddress} objects.
   * @see {@link AztecWalletMethodMap.aztec_getSenders}
   */
  async getSenders(): Promise<AztecAddress[]> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getSenders',
    });
    return result as AztecAddress[];
  }

  /**
   * Removes an authorized sender from this account by making an RPC call to the remote wallet.
   * Implements {@link Wallet.removeSender}.
   * @param sender - The {@link AztecAddress} of the sender to remove.
   * @returns A promise that resolves when the sender is removed by the remote wallet.
   * @see {@link AztecWalletMethodMap.aztec_removeSender}
   */
  async removeSender(sender: AztecAddress): Promise<void> {
    await this.routerProvider.call(this.chainId, {
      method: 'aztec_removeSender',
      params: { sender },
    });
  }

  /**
   * Registers a deployed contract instance with the remote wallet via an RPC call.
   * Implements {@link Wallet.registerContract}.
   * @param contract - An object containing the contract's {@link ContractInstanceWithAddress} and optionally its {@link ContractArtifact}.
   * @returns A promise that resolves when the contract is registered by the remote wallet.
   * @see {@link AztecWalletMethodMap.aztec_registerContract}
   */
  async registerContract(contract: {
    artifact?: ContractArtifact;
    instance: ContractInstanceWithAddress;
  }): Promise<void> {
    const params: { instance: ContractInstanceWithAddress; artifact?: ContractArtifact } = {
      instance: contract.instance,
    };
    if (contract.artifact !== undefined) {
      params.artifact = contract.artifact;
    }
    await this.routerProvider.call(this.chainId, {
      method: 'aztec_registerContract',
      params,
    });
  }

  /**
   * Registers a contract class (artifact/bytecode) with the remote wallet via an RPC call.
   * Implements {@link Wallet.registerContractClass}.
   * @param artifact - The {@link ContractArtifact} to register.
   * @returns A promise that resolves when the class is registered by the remote wallet.
   * @see {@link AztecWalletMethodMap.aztec_registerContractClass}
   */
  async registerContractClass(artifact: ContractArtifact): Promise<void> {
    await this.routerProvider.call(this.chainId, {
      method: 'aztec_registerContractClass',
      params: { artifact },
    });
  }

  /**
   * Retrieves information about the connected Aztec node via an RPC call.
   * Implements {@link Wallet.getNodeInfo}.
   * @returns A promise that resolves to the {@link NodeInfo}.
   * @see {@link AztecWalletMethodMap.aztec_getNodeInfo}
   */
  async getNodeInfo(): Promise<NodeInfo> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getNodeInfo',
    });
    return result as NodeInfo;
  }

  /**
   * Retrieves information about the PXE service via an RPC call.
   * Implements {@link Wallet.getPXEInfo}.
   * @returns A promise that resolves to the {@link PXEInfo}.
   * @see {@link AztecWalletMethodMap.aztec_getPXEInfo}
   */
  async getPXEInfo(): Promise<PXEInfo> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getPXEInfo',
    });
    return result as PXEInfo;
  }

  /**
   * Retrieves a specific L2 block by its number via an RPC call.
   * Implements {@link Wallet.getBlock}.
   * @param number - The block number to retrieve.
   * @returns A promise that resolves to the {@link L2Block} or `undefined` if not found.
   * @see {@link AztecWalletMethodMap.aztec_getBlock}
   */
  async getBlock(number: number): Promise<L2Block | undefined> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getBlock',
      params: { number },
    });
    return result as L2Block | undefined;
  }

  /**
   * Retrieves the current L2 block number via an RPC call.
   * Implements {@link Wallet.getBlockNumber}.
   * @returns A promise that resolves to the current block number.
   * @see {@link AztecWalletMethodMap.aztec_getBlockNumber}
   */
  async getBlockNumber(): Promise<number> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getBlockNumber',
    });
    return result as number;
  }

  /**
   * Retrieves the current base gas fees on the network via an RPC call.
   * Implements {@link Wallet.getCurrentBaseFees}.
   * @returns A promise that resolves to the {@link GasFees}.
   * @see {@link AztecWalletMethodMap.aztec_getCurrentBaseFees}
   */
  async getCurrentBaseFees(): Promise<GasFees> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getCurrentBaseFees',
    });
    return result as GasFees;
  }

  /**
   * Creates a transaction execution request using the wallet's entrypoint.
   * Implements {@link Wallet.createTxExecutionRequest}.
   * @param exec - The execution payload.
   * @param fee - Fee payment options.
   * @param options - Transaction execution options.
   * @returns A promise that resolves to the TxExecutionRequest.
   * @throws If the wallet or its entrypoint is not initialized.
   */
  async createTxExecutionRequest(
    exec: ExecutionPayload,
    fee: FeeOptions,
    options: TxExecutionOptions,
  ): Promise<TxExecutionRequest> {
    if (!this.entrypoint) {
      throw new Error('Wallet not initialized. Call createAztecWallet() to properly initialize the wallet.');
    }

    // Use the local entrypoint to create the transaction execution request
    // The entrypoint will use the RPCAuthWitnessProvider to create auth witnesses via RPC
    return this.entrypoint.createTxExecutionRequest(exec, fee, options);
  }

  /**
   * Creates an authorization witness for a given message hash or intent by making an RPC call to the remote wallet.
   * Implements {@link Wallet.createAuthWit}.
   * @param intent - The message hash ({@link Fr} or {@link Buffer}) or intent object ({@link IntentInnerHash} or {@link IntentAction}) to authorize.
   * @returns A promise that resolves to the {@link AuthWitness}.
   * @see {@link AztecWalletMethodMap.aztec_createAuthWit}
   */
  // Overloaded createAuthWit methods to match Wallet interface
  async createAuthWit(messageHash: Fr | Buffer): Promise<AuthWitness>;
  async createAuthWit(intent: IntentInnerHash | IntentAction): Promise<AuthWitness>;
  async createAuthWit(intent: Fr | Buffer | IntentInnerHash | IntentAction): Promise<AuthWitness> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_createAuthWit',
      params: { intent },
    });
    return result as AuthWitness;
  }

  /**
   * Proves a transaction execution request by making an RPC call to the remote wallet.
   * Implements {@link Wallet.proveTx}.
   * @param txRequest - The {@link TxExecutionRequest} to prove.
   * @param privateExecutionResult - Optional {@link PrivateExecutionResult} from a private execution phase.
   * @returns A promise that resolves to the {@link TxProvingResult}.
   * @see {@link AztecWalletMethodMap.aztec_proveTx}
   */
  async proveTx(
    txRequest: TxExecutionRequest,
    privateExecutionResult?: PrivateExecutionResult,
  ): Promise<TxProvingResult> {
    logger.debug('AztecDappWallet.proveTx: Proving transaction with request:', txRequest);
    if (privateExecutionResult) {
      logger.debug(
        'AztecDappWallet.proveTx: Proving transaction with privateExecutionResult:',
        privateExecutionResult,
      );
    } else {
      logger.debug('AztecDappWallet.proveTx: Proving transaction without privateExecutionResult.');
    }

    const params: { txRequest: TxExecutionRequest; privateExecutionResult?: PrivateExecutionResult } = {
      txRequest,
    };
    if (privateExecutionResult) {
      params.privateExecutionResult = privateExecutionResult;
    }

    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_proveTx',
      params,
    });
    return result as TxProvingResult;
  }

  /**
   * Sends a proven transaction to the network via an RPC call to the remote wallet.
   * Implements {@link Wallet.sendTx}.
   * @param tx - The proven {@link Tx} to send.
   * @returns A promise that resolves to the {@link TxHash}.
   * @see {@link AztecWalletMethodMap.aztec_sendTx}
   */
  async sendTx(tx: Tx): Promise<TxHash> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_sendTx',
      params: { tx },
    });
    return result as TxHash;
  }

  /**
   * Retrieves the receipt for a given transaction hash via an RPC call to the remote wallet.
   * Implements {@link Wallet.getTxReceipt}.
   * @param txHash - The {@link TxHash} of the transaction.
   * @returns A promise that resolves to the {@link TxReceipt}.
   * @see {@link AztecWalletMethodMap.aztec_getTxReceipt}
   */
  async getTxReceipt(txHash: TxHash): Promise<TxReceipt> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getTxReceipt',
      params: { txHash },
    });
    return result as TxReceipt;
  }

  /**
   * Simulates a transaction by making an RPC call to the remote wallet.
   * Implements {@link Wallet.simulateTx}.
   * @param txRequest - The {@link TxExecutionRequest} to simulate.
   * @param simulatePublic - Whether to simulate public parts of the transaction.
   * @param skipTxValidation - Optional flag to skip transaction validation during simulation.
   * @param skipFeeEnforcement - Optional flag to skip fee enforcement during simulation.
   * @param overrides - Optional {@link SimulationOverrides} for simulation context (includes msgSender).
   * @param scopes - Optional array of {@link AztecAddress} scopes for the simulation.
   * @returns A promise that resolves to the {@link TxSimulationResult}.
   * @see {@link AztecWalletMethodMap.aztec_simulateTx}
   */
  async simulateTx(
    txRequest: TxExecutionRequest,
    simulatePublic: boolean,
    skipTxValidation?: boolean,
    skipFeeEnforcement?: boolean,
    overrides?: SimulationOverrides,
    scopes?: AztecAddress[],
  ): Promise<TxSimulationResult> {
    const params: {
      txRequest: TxExecutionRequest;
      simulatePublic?: boolean;
      skipTxValidation?: boolean;
      skipFeeEnforcement?: boolean;
      overrides?: SimulationOverrides;
      scopes?: AztecAddress[];
    } = {
      txRequest,
    };
    if (simulatePublic !== undefined) params.simulatePublic = simulatePublic;
    if (skipTxValidation !== undefined) params.skipTxValidation = skipTxValidation;
    if (skipFeeEnforcement !== undefined) params.skipFeeEnforcement = skipFeeEnforcement;
    if (overrides !== undefined) params.overrides = overrides;
    if (scopes !== undefined) params.scopes = scopes;

    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_simulateTx',
      params,
    });
    return result as TxSimulationResult;
  }

  /**
   * Profiles a transaction for performance analysis by making an RPC call to the remote wallet.
   * Implements {@link Wallet.profileTx}.
   * @param txRequest - The {@link TxExecutionRequest} to profile.
   * @param profileMode - The mode for profiling: 'gates', 'execution-steps', or 'full'.
   * @param skipProofGeneration - Optional flag to skip proof generation during profiling.
   * @param msgSender - Optional {@link AztecAddress} of the message sender for profiling context.
   * @returns A promise that resolves to the {@link TxProfileResult}.
   * @see {@link AztecWalletMethodMap.aztec_profileTx}
   */
  async profileTx(
    txRequest: TxExecutionRequest,
    profileMode: 'gates' | 'execution-steps' | 'full',
    skipProofGeneration?: boolean,
    msgSender?: AztecAddress,
  ): Promise<TxProfileResult> {
    const params: {
      txRequest: TxExecutionRequest;
      profileMode?: 'gates' | 'execution-steps' | 'full';
      skipProofGeneration?: boolean;
      msgSender?: AztecAddress;
    } = {
      txRequest,
    };
    if (profileMode !== undefined) params.profileMode = profileMode;
    if (skipProofGeneration !== undefined) params.skipProofGeneration = skipProofGeneration;
    if (msgSender !== undefined) params.msgSender = msgSender;

    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_profileTx',
      params,
    });
    return result as TxProfileResult;
  }

  /**
   * Simulates a utility function call (view function) by making an RPC call to the remote wallet.
   * Implements {@link Wallet.simulateUtility}.
   * @param functionName - The name of the utility function to call.
   * @param args - Arguments for the function call.
   * @param to - The {@link AztecAddress} of the contract or account to call.
   * @param authWits - Optional array of {@link AuthWitness} for authorization.
   * @param from - Optional {@link AztecAddress} of the sender.
   * @returns A promise that resolves to the {@link UtilitySimulationResult}.
   * @see {@link AztecWalletMethodMap.aztec_simulateUtility}
   */
  async simulateUtility(
    functionName: string,
    args: unknown[],
    to: AztecAddress,
    authWits?: AuthWitness[],
    from?: AztecAddress,
  ): Promise<UtilitySimulationResult> {
    const params: {
      functionName: string;
      args: unknown[];
      to: AztecAddress;
      authWits?: AuthWitness[];
      from?: AztecAddress;
    } = {
      functionName,
      args,
      to,
    };
    if (authWits !== undefined) params.authWits = authWits;
    if (from !== undefined) params.from = from;

    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_simulateUtility',
      params,
    });
    return result as UtilitySimulationResult;
  }

  /**
   * Retrieves private events (encrypted logs) by making an RPC call to the remote wallet.
   * Implements {@link Wallet.getPrivateEvents}.
   * @template T - The expected type of the decoded event data.
   * @param contractAddress - The {@link AztecAddress} of the contract emitting the events.
   * @param eventMetadata - {@link EventMetadataDefinition} of the event to query.
   * @param from - Starting block number (inclusive).
   * @param numBlocks - Number of blocks to query from the `from` block.
   * @param recipients - Array of {@link AztecAddress} recipients for the events.
   * @returns A promise that resolves to an array of decoded event data of type `T`.
   * @see {@link AztecWalletMethodMap.aztec_getPrivateEvents}
   */
  async getPrivateEvents<T>(
    contractAddress: AztecAddress,
    eventMetadata: EventMetadataDefinition,
    from: number,
    numBlocks: number,
    recipients: AztecAddress[],
  ): Promise<T[]> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getPrivateEvents',
      params: { contractAddress, eventMetadata, from, numBlocks, recipients },
    });
    return result as T[];
  }

  /**
   * Retrieves public events (unencrypted logs) by making an RPC call to the remote wallet.
   * Implements {@link Wallet.getPublicEvents}.
   * @template T - The expected type of the decoded event data.
   * @param eventMetadata - {@link EventMetadataDefinition} of the event to query.
   * @param from - Starting block number (inclusive).
   * @param limit - Maximum number of events to return.
   * @returns A promise that resolves to an array of decoded event data of type `T`.
   * @see {@link AztecWalletMethodMap.aztec_getPublicEvents}
   */
  async getPublicEvents<T>(
    eventMetadata: EventMetadataDefinition,
    from: number,
    limit: number,
  ): Promise<T[]> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getPublicEvents',
      params: { eventMetadata, from, limit },
    });
    return result as T[];
  }

  /**
   * Retrieves metadata for a specific contract by making an RPC call to the remote wallet.
   * Implements {@link Wallet.getContractMetadata}.
   * @param address - The {@link AztecAddress} of the contract.
   * @returns A promise that resolves to the {@link ContractMetadata}.
   * @see {@link AztecWalletMethodMap.aztec_getContractMetadata}
   */
  async getContractMetadata(address: AztecAddress): Promise<ContractMetadata> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getContractMetadata',
      params: { address },
    });
    return result as ContractMetadata;
  }

  /**
   * Retrieves metadata for a contract class by making an RPC call to the remote wallet.
   * Implements {@link Wallet.getContractClassMetadata}.
   * @param id - The {@link Fr} ID of the contract class.
   * @param includeArtifact - Optional flag to include the {@link ContractArtifact} in the metadata.
   * @returns A promise that resolves to the {@link ContractClassMetadata}.
   * @see {@link AztecWalletMethodMap.aztec_getContractClassMetadata}
   */
  async getContractClassMetadata(id: Fr, includeArtifact?: boolean): Promise<ContractClassMetadata> {
    const params: { id: Fr; includeArtifact?: boolean } = { id };
    if (includeArtifact !== undefined) {
      params.includeArtifact = includeArtifact;
    }
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getContractClassMetadata',
      params,
    });
    return result as ContractClassMetadata;
  }

  /**
   * Updates a contract's artifact by re-registering its class with the remote wallet via an RPC call.
   * Implements {@link Wallet.updateContract}.
   * @param _contractAddress - The {@link AztecAddress} of the contract to update (often unused if primarily updating the class).
   * @param artifact - The new {@link ContractArtifact}.
   * @returns A promise that resolves when the update is complete on the remote wallet.
   * @see {@link AztecWalletMethodMap.aztec_registerContractClass} (as this is what it typically calls)
   */
  async updateContract(_contractAddress: AztecAddress, artifact: ContractArtifact): Promise<void> {
    await this.routerProvider.call(this.chainId, {
      method: 'aztec_registerContractClass',
      params: { artifact },
    });
  }

  /**
   * Retrieves a list of all contracts registered with the remote wallet via an RPC call.
   * Implements {@link Wallet.getContracts}.
   * @returns A promise that resolves to an array of {@link AztecAddress} objects for the contracts.
   * @see {@link AztecWalletMethodMap.aztec_getContracts}
   */
  async getContracts(): Promise<AztecAddress[]> {
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_getContracts',
    });
    return result as AztecAddress[];
  }

  /**
   * Executes a transaction based on a {@link ContractFunctionInteraction}.
   * This WalletMesh-specific helper method simplifies sending a transaction by deriving
   * the necessary {@link ExecutionPayload} from the interaction and making an RPC call
   * to the `aztec_wmExecuteTx` method on the remote wallet.
   * The remote wallet is expected to handle fee configuration, proof generation, and submission.
   *
   * @param interaction - The {@link ContractFunctionInteraction} representing the desired contract call.
   * @returns A {@link SentTx} object that can be used to track the transaction.
   * @see {@link AztecWalletMethodMap.aztec_wmExecuteTx}
   */
  async wmExecuteTx(
    interaction: ContractFunctionInteraction, // as returned from contract.methods.myMethod(arg0, arg1)
  ): Promise<SentTx> {
    // Extract the execution payload which contains the encoded function call
    const executionPayload = await interaction.request();

    // Send the high-level interaction details to the remote wallet
    // Note: opts is not sent - the server-side wallet will handle fee configuration
    const result = await this.routerProvider.call(this.chainId, {
      method: 'aztec_wmExecuteTx',
      params: {
        executionPayload,
      },
    });

    const txHashPromise = () => Promise.resolve(result as TxHash);
    return new SentTx(this, txHashPromise);
  }

  /**
   * Simulates a transaction based on a {@link ContractFunctionInteraction}.
   * This WalletMesh-specific helper method simplifies simulating a transaction by deriving
   * the necessary {@link ExecutionPayload} from the interaction and making an RPC call
   * to the `aztec_wmSimulateTx` method on the remote wallet.
   *
   * @param interaction - The {@link ContractFunctionInteraction} representing the desired contract call.
   * @returns A promise that resolves to the {@link TxSimulationResult}.
   * @remarks TODO(twt): This should return a more useful result, not the raw TxSimulationResult.
   *   Copying the logic from `aztec.js/src/contract/contract_function_interaction.ts`
   *   could work if we can get the Function ABI or maybe have `aztec_wmSimulateTx` return hints
   *   about how to interpret the result.
   * @see {@link AztecWalletMethodMap.aztec_wmSimulateTx}
   */
  async wmSimulateTx(interaction: ContractFunctionInteraction): Promise<TxSimulationResult> {
    // Extract the execution payload which contains the encoded function call
    const executionPayload = await interaction.request();

    // Send the high-level interaction details to the remote wallet for simulation
    const result = (await this.routerProvider.call(this.chainId, {
      method: 'aztec_wmSimulateTx',
      params: {
        executionPayload,
      },
    })) as TxSimulationResult;

    // TODO(twt): This should return a more useful result, not the raw TxSimulationResult
    // Copying the logic from https://github.com/AztecProtocol/aztec-packages/blob/next/yarn-project/aztec.js/src/contract/contract_function_interaction.ts
    // could work if we can get the Function ABI or maybe have aztec_wmSimulateTx return hints about how to interpret the result.
    return result;
  }

  /**
   * Deploys a contract using its artifact and constructor arguments.
   * This WalletMesh-specific helper method makes an RPC call to the `aztec_wmDeployContract`
   * method on the remote wallet. The remote wallet handles the deployment process.
   *
   * @param artifact - The {@link ContractArtifact} of the contract to deploy.
   * @param args - An array of arguments for the contract's constructor.
   * @param constructorName - Optional name of the constructor function if the artifact has multiple.
   * @returns A {@link DeploySentTx} object that can be used to track the deployment transaction
   *          and get the deployed contract instance.
   * @see {@link AztecWalletMethodMap.aztec_wmDeployContract}
   */
  async deployContract(
    artifact: ContractArtifact,
    args: unknown[],
    constructorName?: string,
  ): Promise<DeploySentTx> {
    // Send the deployment request to the remote wallet
    const result = (await this.routerProvider.call(this.chainId, {
      method: 'aztec_wmDeployContract',
      params: {
        artifact,
        args,
        constructorName,
      },
    })) as { txHash: TxHash; contractAddress: AztecAddress };

    // Create a promise that resolves with the transaction hash
    const txHashPromise = () => Promise.resolve(result.txHash);

    // Create the post-deploy constructor function
    const postDeployCtor = async (address: AztecAddress, wallet: Wallet) => {
      return Contract.at(address, artifact, wallet);
    };

    // Create the instance getter function
    // This will compute the contract address from the artifact and deployment args
    const instanceGetter = async () => {
      // Use the deployed contract address returned by the server
      // Only the address is used from this result by DeploySentTx
      return {
        address: result.contractAddress,
      } as ContractInstanceWithAddress;
    };

    // Return a DeploySentTx instance
    return new DeploySentTx(this, txHashPromise, postDeployCtor, instanceGetter);
  }
}

/**
 * Helper function to create and initialize an AztecDappWallet instance.
 * This is the recommended way to instantiate an Aztec wallet for dApp use,
 * as it ensures all necessary asynchronous setup (like fetching initial
 * address and chain ID) is completed.
 *
 * @param provider - An {@link AztecRouterProvider} instance, which handles Aztec-specific type serialization.
 * @param chainId - The Aztec chain ID (e.g., 'aztec:mainnet', 'aztec:31337') for the wallet. Defaults to 'aztec:mainnet'.
 * @returns A promise that resolves to a fully initialized {@link AztecDappWallet} instance.
 *
 * @example
 * ```typescript
 * const dAppTransport = { send: ..., onMessage: ... }; // User-defined transport
 * const provider = new AztecRouterProvider(dAppTransport);
 * await provider.connect({ 'aztec:mainnet': ['aztec_getAddress'] }); // Connect first
 * const wallet = await createAztecWallet(provider, 'aztec:mainnet');
 * const address = wallet.getAddress(); // Now usable
 * ```
 */
export async function createAztecWallet(
  provider: AztecRouterProvider,
  chainId: AztecChainId = 'aztec:mainnet',
): Promise<AztecDappWallet> {
  const wallet = new AztecDappWallet(provider, chainId);
  await wallet.initialize();
  return wallet;
}

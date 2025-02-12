import type {
  AuthWitness,
  AztecAddress,
  ContractArtifact,
  ContractInstanceWithAddress,
  ExtendedNote,
  TxExecutionRequest,
  TxHash,
  TxReceipt,
  L2Block,
  LogFilter,
  Point,
  SiblingPath,
  PartialAddress,
  CompleteAddress,
  NodeInfo,
  Tx,
  Wallet,
} from '@aztec/aztec.js';

import type { IntentAction, IntentInnerHash } from '@aztec/aztec.js/utils';
import type { ExecutionRequestInit } from '@aztec/aztec.js/entrypoint';
import type { AbiDecoded } from '@aztec/foundation/abi';
import type {
  NotesFilter,
  EventMetadataDefinition,
  PrivateExecutionResult,
  TxProvingResult,
  UniqueNote,
  PXEInfo,
  TxSimulationResult,
  InBlock,
  TxEffect,
  GetPublicLogsResponse,
  GetContractClassLogsResponse,
  ContractMetadata,
  ContractClassMetadata,
} from '@aztec/circuit-types';
import type { GasFees, L1_TO_L2_MSG_TREE_HEIGHT } from '@aztec/circuits.js';

import { Fr } from '@aztec/aztec.js';

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { AztecProvider } from './provider.js';
import type { AztecChainId, AztecWalletMethodMap } from './types.js';

export class AztecRemoteWallet implements Wallet {
  private _address: AztecAddress | undefined;
  private _completeAddress: CompleteAddress | undefined;
  private _chainId: Fr | undefined;
  private _version: Fr | undefined;
  private _scopes: AztecAddress[] | undefined;

  constructor(
    private _provider: AztecProvider,
    private _providerChainId: AztecChainId,
  ) {}

  async isL1ToL2MessageSynced(l1ToL2Message: Fr): Promise<boolean> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_isL1ToL2MessageSynced', { l1ToL2Message })
      .execute() as Promise<AztecWalletMethodMap['aztec_isL1ToL2MessageSynced']['result']>;
  }

  getAddress(): AztecAddress {
    if (!this._address) {
      this._provider
        .chain(this._providerChainId)
        .call('aztec_getAddress')
        .execute()
        .then((result) => {
          this._address = result as AztecWalletMethodMap['aztec_getAddress']['result'];
        });
      throw new Error('Address not yet available');
    }
    return this._address;
  }

  getCompleteAddress(): CompleteAddress {
    if (!this._completeAddress) {
      this._provider
        .chain(this._providerChainId)
        .call('aztec_getCompleteAddress')
        .execute()
        .then((result) => {
          this._completeAddress = result as AztecWalletMethodMap['aztec_getCompleteAddress']['result'];
        });
      throw new Error('Complete address not yet available');
    }
    return this._completeAddress;
  }

  getChainId(): Fr {
    if (!this._chainId) {
      this._provider
        .chain(this._providerChainId)
        .call('aztec_getChainId')
        .execute()
        .then((result) => {
          const chainId = result as AztecWalletMethodMap['aztec_getChainId']['result'];
          this._chainId = Fr.fromString(chainId.toString(10));
        });
      throw new Error('Chain ID not yet available');
    }
    return this._chainId;
  }

  getVersion(): Fr {
    if (!this._version) {
      this._provider
        .chain(this._providerChainId)
        .call('aztec_getVersion')
        .execute()
        .then((result) => {
          const version = result as AztecWalletMethodMap['aztec_getVersion']['result'];
          this._version = Fr.fromString(version.toString(10));
        });
      throw new Error('Version not yet available');
    }
    return this._version;
  }

  async createTxExecutionRequest(exec: ExecutionRequestInit): Promise<TxExecutionRequest> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_createTxExecutionRequest', { exec })
      .execute() as Promise<AztecWalletMethodMap['aztec_createTxExecutionRequest']['result']>;
  }

  async createAuthWit(intent: Fr | Buffer | IntentAction | IntentInnerHash): Promise<AuthWitness> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_createAuthWit', { intent })
      .execute() as Promise<AztecWalletMethodMap['aztec_createAuthWit']['result']>;
  }

  setScopes(scopes: AztecAddress[]): void {
    // TODO: would be nice to return a promise here
    this._scopes = scopes;
    this._provider
      .chain(this._providerChainId)
      .call('aztec_setScopes', { scopes })
      .execute()
      .then((result) => {
        const success = result as AztecWalletMethodMap['aztec_setScopes']['result'];
        console.debug(`setScopes(${scopes}) result: ${success}`);
      });
  }

  getScopes(): AztecAddress[] {
    // TODO: would be nice to return a promise here
    if (!this._scopes) {
      this._provider
        .chain(this._providerChainId)
        .call('aztec_getScopes')
        .execute()
        .then((result) => {
          this._scopes = result as AztecWalletMethodMap['aztec_getScopes']['result'];
        });
      throw new Error('Scopes not yet available');
    }
    return this._scopes;
  }

  async getScopesAsync(): Promise<AztecAddress[]> {
    const scopes = (await this._provider
      .chain(this._providerChainId)
      .call('aztec_getScopes')
      .execute()) as AztecWalletMethodMap['aztec_getScopes']['result'];
    this._scopes = scopes;
    return scopes;
  }

  async getContractMetadata(address: AztecAddress): Promise<ContractMetadata> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getContractMetadata', { address })
      .execute() as Promise<AztecWalletMethodMap['aztec_getContractMetadata']['result']>;
  }

  async getContractClassMetadata(id: Fr, includeArtifact?: boolean): Promise<ContractClassMetadata> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getContractClassMetadata', { id, includeArtifact })
      .execute() as Promise<AztecWalletMethodMap['aztec_getContractClassMetadata']['result']>;
  }

  async addCapsule(contract: AztecAddress, storageSlot: Fr, capsule: Fr[]): Promise<void> {
    const result = (await this._provider
      .chain(this._providerChainId)
      .call('aztec_addCapsule', { contract, storageSlot, capsule })
      .execute()) as AztecWalletMethodMap['aztec_addCapsule']['result'];
    if (!result) throw new Error('Failed to add capsule');
  }

  async registerAccount(secretKey: Fr, partialAddress: PartialAddress): Promise<CompleteAddress> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_registerAccount', { secretKey, partialAddress })
      .execute() as Promise<AztecWalletMethodMap['aztec_registerAccount']['result']>;
  }

  async getRegisteredAccounts(): Promise<CompleteAddress[]> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getRegisteredAccounts')
      .execute() as Promise<AztecWalletMethodMap['aztec_getRegisteredAccounts']['result']>;
  }

  async registerSender(address: AztecAddress): Promise<AztecAddress> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_registerSender', { sender: address })
      .execute() as Promise<AztecWalletMethodMap['aztec_registerSender']['result']>;
  }

  async getSenders(): Promise<AztecAddress[]> {
    return this._provider.chain(this._providerChainId).call('aztec_getSenders').execute() as Promise<
      AztecWalletMethodMap['aztec_getSenders']['result']
    >;
  }

  async removeSender(address: AztecAddress): Promise<void> {
    const result = (await this._provider
      .chain(this._providerChainId)
      .call('aztec_removeSender', { sender: address })
      .execute()) as AztecWalletMethodMap['aztec_removeSender']['result'];
    if (!result) throw new Error('Failed to remove sender');
  }

  async registerContract(contract: {
    instance: ContractInstanceWithAddress;
    artifact?: ContractArtifact;
  }): Promise<void> {
    const result = (await this._provider
      .chain(this._providerChainId)
      .call('aztec_registerContract', { instance: contract.instance, artifact: contract.artifact })
      .execute()) as AztecWalletMethodMap['aztec_registerContract']['result'];
    if (!result) throw new Error('Failed to register contract');
  }

  async registerContractClass(artifact: ContractArtifact): Promise<void> {
    const result = (await this._provider
      .chain(this._providerChainId)
      .call('aztec_registerContractClass', { artifact })
      .execute()) as AztecWalletMethodMap['aztec_registerContractClass']['result'];
    if (!result) throw new Error('Failed to register contract class');
  }

  async getContracts(): Promise<AztecAddress[]> {
    return this._provider.chain(this._providerChainId).call('aztec_getContracts').execute() as Promise<
      AztecWalletMethodMap['aztec_getContracts']['result']
    >;
  }

  async proveTx(
    txRequest: TxExecutionRequest,
    privateExecutionResult: PrivateExecutionResult,
  ): Promise<TxProvingResult> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_proveTx', { txRequest, privateExecutionResult })
      .execute() as Promise<AztecWalletMethodMap['aztec_proveTx']['result']>;
  }

  async simulateTx(
    txRequest: TxExecutionRequest,
    simulatePublic: boolean,
    msgSender?: AztecAddress,
    skipTxValidation?: boolean,
    enforceFeePayment?: boolean,
    profile?: boolean,
  ): Promise<TxSimulationResult> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_simulateTx', {
        txRequest,
        simulatePublic,
        msgSender,
        skipTxValidation,
        enforceFeePayment,
        profile,
      })
      .execute() as Promise<AztecWalletMethodMap['aztec_simulateTx']['result']>;
  }

  async sendTx(tx: Tx): Promise<TxHash> {
    return this._provider.chain(this._providerChainId).call('aztec_sendTx', { tx }).execute() as Promise<
      AztecWalletMethodMap['aztec_sendTx']['result']
    >;
  }

  async getTxEffect(txHash: TxHash): Promise<InBlock<TxEffect>> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getTxEffect', { txHash })
      .execute() as Promise<AztecWalletMethodMap['aztec_getTxEffect']['result']>;
  }

  async getTxReceipt(txHash: TxHash): Promise<TxReceipt> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getTxReceipt', { txHash })
      .execute() as Promise<AztecWalletMethodMap['aztec_getTxReceipt']['result']>;
  }

  async getNotes(filter: NotesFilter): Promise<UniqueNote[]> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getNotes', { filter })
      .execute() as Promise<AztecWalletMethodMap['aztec_getNotes']['result']>;
  }

  async getPublicStorageAt(contract: AztecAddress, storageSlot: Fr): Promise<Fr> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getPublicStorageAt', { contract, storageSlot })
      .execute() as Promise<AztecWalletMethodMap['aztec_getPublicStorageAt']['result']>;
  }

  async addNote(note: ExtendedNote): Promise<void> {
    const result = (await this._provider
      .chain(this._providerChainId)
      .call('aztec_addNote', { note })
      .execute()) as AztecWalletMethodMap['aztec_addNote']['result'];
    if (!result) throw new Error('Failed to add note');
  }

  async addNullifiedNote(note: ExtendedNote): Promise<void> {
    const result = (await this._provider
      .chain(this._providerChainId)
      .call('aztec_addNullifiedNote', { note })
      .execute()) as AztecWalletMethodMap['aztec_addNullifiedNote']['result'];
    if (!result) throw new Error('Failed to add nullified note');
  }

  async getBlock(number: number): Promise<L2Block | undefined> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getBlock', { number })
      .execute() as Promise<AztecWalletMethodMap['aztec_getBlock']['result']>;
  }

  async getCurrentBaseFees(): Promise<GasFees> {
    return this._provider.chain(this._providerChainId).call('aztec_getCurrentBaseFees').execute() as Promise<
      AztecWalletMethodMap['aztec_getCurrentBaseFees']['result']
    >;
  }

  async simulateUnconstrained(
    functionName: string,
    args: unknown[],
    to: AztecAddress,
    from?: AztecAddress,
  ): Promise<AbiDecoded> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_simulateUnconstrained', { functionName, args, to, from })
      .execute() as Promise<AztecWalletMethodMap['aztec_simulateUnconstrained']['result']>;
  }

  async getPublicLogs(filter: LogFilter): Promise<GetPublicLogsResponse> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getPublicLogs', { filter })
      .execute() as Promise<AztecWalletMethodMap['aztec_getPublicLogs']['result']>;
  }

  async getContractClassLogs(filter: LogFilter): Promise<GetContractClassLogsResponse> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getContractClassLogs', { filter })
      .execute() as Promise<GetContractClassLogsResponse>;
  }

  async getBlockNumber(): Promise<number> {
    return this._provider.chain(this._providerChainId).call('aztec_getBlockNumber').execute() as Promise<
      AztecWalletMethodMap['aztec_getBlockNumber']['result']
    >;
  }

  async getProvenBlockNumber(): Promise<number> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getProvenBlockNumber')
      .execute() as Promise<AztecWalletMethodMap['aztec_getProvenBlockNumber']['result']>;
  }

  async getNodeInfo(): Promise<NodeInfo> {
    return this._provider.chain(this._providerChainId).call('aztec_getNodeInfo').execute() as Promise<
      AztecWalletMethodMap['aztec_getNodeInfo']['result']
    >;
  }

  async addAuthWitness(authWitness: AuthWitness): Promise<void> {
    const result = (await this._provider
      .chain(this._providerChainId)
      .call('aztec_addAuthWitness', { authWitness })
      .execute()) as AztecWalletMethodMap['aztec_addAuthWitness']['result'];
    if (!result) throw new Error('Failed to add auth witness');
  }

  async getAuthWitness(messageHash: Fr): Promise<Fr[]> {
    return (await this._provider
      .chain(this._providerChainId)
      .call('aztec_getAuthWitness', { messageHash })
      .execute()) as Promise<AztecWalletMethodMap['aztec_getAuthWitness']['result']>;
  }

  async getPXEInfo(): Promise<PXEInfo> {
    return this._provider.chain(this._providerChainId).call('aztec_getPXEInfo').execute() as Promise<
      AztecWalletMethodMap['aztec_getPXEInfo']['result']
    >;
  }

  getPrivateEvents<T>(
    event: EventMetadataDefinition,
    from: number,
    limit: number,
    vpks: Point[] = [],
  ): Promise<T[]> {
    const completeAddress = this.getCompleteAddress();
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getPrivateEvents', {
        event,
        from,
        limit,
        vpks: vpks.length ? vpks : [completeAddress.publicKeys.masterIncomingViewingPublicKey],
      })
      .execute() as Promise<T[]>;
  }

  getPublicEvents<T>(event: EventMetadataDefinition, from: number, limit: number): Promise<T[]> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getPublicEvents', { event, from, limit })
      .execute() as Promise<T[]>;
  }

  async getL1ToL2MembershipWitness(
    contractAddress: AztecAddress,
    messageHash: Fr,
    secret: Fr,
  ): Promise<[bigint, SiblingPath<typeof L1_TO_L2_MSG_TREE_HEIGHT>]> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getL1ToL2MembershipWitness', { contractAddress, messageHash, secret })
      .execute() as Promise<AztecWalletMethodMap['aztec_getL1ToL2MembershipWitness']['result']>;
  }

  async getL2ToL1MembershipWitness(
    blockNumber: number,
    l2Tol1Message: Fr,
  ): Promise<[bigint, SiblingPath<number>]> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getL2ToL1MembershipWitness', { blockNumber, l2Tol1Message })
      .execute() as Promise<[bigint, SiblingPath<number>]>;
  }
}

export function createAztecRPCWallet(transport: JSONRPCTransport, chainId: AztecChainId): AztecRemoteWallet {
  const provider = new AztecProvider(transport);
  return new AztecRemoteWallet(provider, chainId);
}

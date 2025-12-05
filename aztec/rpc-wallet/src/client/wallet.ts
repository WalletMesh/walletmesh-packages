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

export class AztecWalletProvider implements Wallet {
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

  async getContractClassMetadata(id: Fr, includeArtifact?: boolean): Promise<ContractClassMetadata> {
    return this.callMethod('aztec_getContractClassMetadata', [id, includeArtifact ?? false]);
  }

  async getContractMetadata(address: AztecAddress): Promise<ContractMetadata> {
    return this.callMethod('aztec_getContractMetadata', [address]);
  }

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

  async getChainInfo(): Promise<ChainInfo> {
    return this.callMethod('aztec_getChainInfo', []);
  }

  async getTxReceipt(txHash: TxHash): Promise<TxReceipt> {
    return this.callMethod('aztec_getTxReceipt', [txHash]);
  }

  async registerSender(address: AztecAddress, alias?: string): Promise<AztecAddress> {
    return this.callMethod('aztec_registerSender', [address, alias]);
  }

  async getAddressBook(): Promise<Aliased<AztecAddress>[]> {
    return this.callMethod('aztec_getAddressBook', []);
  }

  async getAccounts(): Promise<Aliased<AztecAddress>[]> {
    return this.callMethod('aztec_getAccounts', []);
  }

  async registerContract(
    instance: ContractInstanceWithAddress,
    artifact?: ContractArtifact,
    secretKey?: Fr,
  ): Promise<ContractInstanceWithAddress> {
    return this.callMethod('aztec_registerContract', [instance, artifact, secretKey]);
  }

  async simulateTx(exec: ExecutionPayload, opts: SimulateOptions): Promise<TxSimulationResult> {
    return this.callMethod('aztec_simulateTx', [exec, opts]);
  }

  async simulateUtility(call: FunctionCall, authwits?: AuthWitness[]): Promise<UtilitySimulationResult> {
    return this.callMethod('aztec_simulateUtility', [call, authwits]);
  }

  async profileTx(exec: ExecutionPayload, opts: ProfileOptions): Promise<TxProfileResult> {
    return this.callMethod('aztec_profileTx', [exec, opts]);
  }

  async sendTx(exec: ExecutionPayload, opts: SendOptions): Promise<TxHash> {
    return this.callMethod('aztec_sendTx', [exec, opts]);
  }

  async createAuthWit(
    from: AztecAddress,
    messageHashOrIntent: Fr | IntentInnerHash | CallIntent,
  ): Promise<AuthWitness> {
    return this.callMethod('aztec_createAuthWit', [from, messageHashOrIntent]);
  }

  async batch<const T extends readonly BatchedMethod<keyof BatchableMethods>[]>(
    methods: T,
  ): Promise<BatchResults<T>> {
    return this.callMethod('aztec_batch', [methods]);
  }
}

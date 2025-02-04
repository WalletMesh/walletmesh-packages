import { JSONRPCNode } from '@walletmesh/jsonrpc';
import { AztecWalletError, AztecWalletErrorType } from './errors.js';
import type { AztecWalletMethodMap, TransactionParams, TransactionFunctionCall } from './types.js';
import type { ContractInstanceWithAddress, ContractArtifact } from '@aztec/aztec.js';

/**
 * Provider for directly interacting with an Aztec chain wallet.
 * This is a minimal implementation that supports core Aztec operations
 * without the complexity of multi-chain routing.
 */
export class AztecChainProvider extends JSONRPCNode<AztecWalletMethodMap> {
  protected async makeRequest<M extends keyof AztecWalletMethodMap>(
    method: M,
    params?: AztecWalletMethodMap[M]['params'],
  ): Promise<AztecWalletMethodMap[M]['result']> {
    try {
      return await this.callMethod(method, params);
    } catch (error) {
      throw new AztecWalletError(
        AztecWalletErrorType.invalidResponse,
        error instanceof Error ? error.message : 'Invalid response received',
      );
    }
  }

  public async connect(): Promise<boolean> {
    try {
      await this.makeRequest('aztec_connect');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the account address from the wallet.
   * @returns The account address as a string
   * @throws {AztecWalletError} If response is invalid
   */
  public async getAccount(): Promise<string> {
    const result = await this.makeRequest('aztec_getAccount');
    if (typeof result !== 'string' || !result) {
      throw new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Invalid account address returned');
    }
    return result;
  }

  /**
   * Sends a transaction to the chain.
   * @param params - Transaction parameters including function calls
   * @returns Transaction hash
   * @throws {AztecWalletError} If transaction fails or response invalid
   */
  public async sendTransaction(params: TransactionParams): Promise<string> {
    const result = await this.makeRequest('aztec_sendTransaction', params);
    if (typeof result !== 'string' || !result) {
      throw new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Invalid transaction hash returned');
    }
    return result;
  }

  /**
   * Simulates a transaction without submitting it.
   * @param params - Transaction parameters to simulate
   * @returns Simulation result
   * @throws {AztecWalletError} If simulation fails
   */
  public async simulateTransaction(params: TransactionFunctionCall): Promise<unknown> {
    const result = await this.makeRequest('aztec_simulateTransaction', params);
    if (result === undefined || result === null) {
      throw new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Invalid simulation result returned');
    }
    return result;
  }

  /**
   * Registers a contract instance with the wallet.
   * @param params - Contract registration parameters
   * @throws {AztecWalletError} If registration fails
   */
  public async registerContract(params: {
    instance: ContractInstanceWithAddress;
    artifact?: ContractArtifact;
  }): Promise<void> {
    const result = await this.makeRequest('aztec_registerContract', params);
    if (result !== true) {
      throw new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Contract registration failed');
    }
  }

  /**
   * Registers a contract class with the wallet.
   * @param params - Contract class registration parameters
   * @throws {AztecWalletError} If registration fails
   */
  public async registerContractClass(params: {
    artifact: ContractArtifact;
  }): Promise<void> {
    const result = await this.makeRequest('aztec_registerContractClass', params);
    if (result !== true) {
      throw new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Contract class registration failed');
    }
  }

  /**
   * Registers a sender with the wallet.
   * @param params - Sender registration parameters
   * @throws {AztecWalletError} If registration fails
   */
  public async registerSender(params: AztecWalletMethodMap['aztec_registerSender']['params']): Promise<void> {
    const result = await this.makeRequest('aztec_registerSender', params);
    if (!result) {
      throw new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Sender registration failed');
    }
  }
}

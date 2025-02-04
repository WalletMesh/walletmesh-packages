import {
  AuthWitness,
  AztecAddress,
  Contract,
  NoFeePaymentMethod,
  type ContractArtifact,
} from '@aztec/aztec.js';

import { GasSettings } from '@aztec/circuits.js';
import type { ExecutionRequestInit } from '@aztec/aztec.js/entrypoint';

import type { AztecWalletContext, TransactionFunctionCall, TransactionParams } from '../types.js';
import { AztecWalletError } from '../errors.js';

/**
 * Handles the 'aztec_sendTransaction' JSON-RPC method.
 * Sends transactions to the Aztec network and returns the transaction hash.
 * @param params - The transaction parameters
 * @param params.functionCalls - Array of function calls to execute
 * @param params.authwits - Optional array of authorization witnesses for the transaction
 * @returns A Promise that resolves to the transaction hash string
 */
export async function sendTransaction(
  context: AztecWalletContext,
  params: TransactionParams,
): Promise<string> {
  try {
    // Setup the execution request without the calls for now
    const executionRequestInit: ExecutionRequestInit = {
      calls: [],
      authWitnesses: params.authwits?.map(AuthWitness.fromString) ?? [],
      // TODO: Figure out what we should be doing with this fee parameter
      fee: {
        paymentMethod: new NoFeePaymentMethod(),
        gasSettings: GasSettings.default({ maxFeesPerGas: await context.wallet.getCurrentBaseFees() }),
      },
    };

    // Get artifacts and contracts first
    const contractMap = new Map<string, { contract: Contract; artifact: ContractArtifact }>();
    for (const c of params.functionCalls) {
      const contractAddress = AztecAddress.fromString(c.contractAddress);
      if (!contractMap.has(c.contractAddress)) {
        const artifact = await context.contractArtifactCache.getContractArtifact(contractAddress);
        const contract = await Contract.at(contractAddress, artifact, context.wallet);
        contractMap.set(c.contractAddress, { contract, artifact });
      }
    }

    // Now build the execution request
    for (const c of params.functionCalls) {
      // biome-ignore lint/style/noNonNullAssertion: we know the contract is in the map
      const { contract } = contractMap.get(c.contractAddress)!;
      const method = contract.methods[c.functionName];
      if (!method) {
        throw new AztecWalletError(
          'invalidParams',
          `Unknown function for contract ${c.contractAddress}: ${c.functionName}`,
        );
      }
      const functionCall = method(...c.args);
      executionRequestInit.calls.push(await functionCall.request());
    }
    const txExecutionRequest = await context.wallet.createTxExecutionRequest(executionRequestInit);
    const simulatedTx = await context.wallet.simulateTx(txExecutionRequest, true /* simulatePublic */);
    const txProvingResult = await context.wallet.proveTx(
      txExecutionRequest,
      simulatedTx.privateExecutionResult,
    );
    const txHash = await context.wallet.sendTx(txProvingResult.toTx());
    return txHash.toString();
  } catch (error) {
    throw new AztecWalletError('unknownInternalError');
  }
}

/**
 * Handles the 'aztec_simulateTransaction' JSON-RPC method.
 * Simulates a transaction without submitting it to the network.
 * @param params - The transaction parameters to simulate
 * @param params.contractAddress - The target contract address
 * @param params.functionName - The contract function to call
 * @param params.args - The function arguments
 * @returns A Promise that resolves to the simulation result
 */
export async function simulateTransaction(
  context: AztecWalletContext,
  params: TransactionFunctionCall,
): Promise<unknown> {
  try {
    const { contractAddress, functionName, args } = params;
    const addr = AztecAddress.fromString(contractAddress);
    const artifact = await context.contractArtifactCache.getContractArtifact(addr);
    const contract = await Contract.at(addr, artifact, context.wallet);
    const method = contract.methods[functionName];
    if (!method) {
      throw new AztecWalletError(
        'invalidParams',
        `Unknown function for contract ${contractAddress}: ${functionName}`,
      );
    }
    const result = await method(...args).simulate();
    // TODO: Is this sufficient for serializing the result?
    switch (typeof result) {
      case 'string':
        return result;
      case 'bigint':
        return result.toString();
      case 'object':
        if (result instanceof Uint8Array) {
          return Buffer.from(result).toString('hex');
        }
        return result;
      default:
        return result;
    }
  } catch (error) {
    if (error instanceof AztecWalletError) {
      throw error;
    }
    console.error('Error simulating transaction:', error);
    throw new AztecWalletError('unknownInternalError', 'aztec_simulateTransaction');
  }
}

/**
 * Aztec contract interaction utilities
 *
 * Provides high-level utilities for interacting with Aztec contracts
 * in a way that's familiar to aztec.js developers while working with
 * remote wallets through WalletMesh.
 *
 * @module providers/aztec/contract
 * @packageDocumentation
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { AztecDappWallet, ContractFunctionInteraction, TxReceipt } from './types.js';

/**
 * Get a contract instance at a specific address
 *
 * This is a wrapper around the aztec.js Contract.at() pattern that works
 * with remote wallets. The contract instance can be used to call methods
 * and interact with the deployed contract.
 *
 * @param wallet - The Aztec wallet instance
 * @param address - The contract address
 * @param artifact - The contract artifact containing ABI
 * @returns A Contract instance for interaction
 *
 * @example
 * ```typescript
 * const contract = await getContractAt(
 *   wallet,
 *   contractAddress,
 *   TokenContractArtifact
 * );
 *
 * // Use the contract instance
 * const balance = await contract.methods.balance_of(userAddress).simulate();
 * const interaction = contract.methods.transfer(recipient, amount);
 * const txRequest = await interaction.request();
 * const provenTx = await wallet.proveTx(txRequest);
 * const txHash = await wallet.sendTx(provenTx);
 * ```
 *
 * @public
 */
export async function getContractAt(
  wallet: AztecDappWallet | null,
  address: unknown,
  artifact: unknown,
): Promise<unknown> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Dynamically import Contract from aztec.js to avoid forcing the dependency
    const { Contract } = await import('@aztec/aztec.js');

    // Create contract instance using the wallet
    // Cast to any because AztecDappWallet has a subset of Wallet methods
    // Type assertion to match expected Contract.at signature
    // Convert to unknown first to avoid type overlap issues
    const contract = await Contract.at(
      address as Parameters<typeof Contract.at>[0],
      artifact as Parameters<typeof Contract.at>[1],
      wallet as unknown as Parameters<typeof Contract.at>[2],
    );
    return contract;
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to get contract at address: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Execute multiple contract interactions in a batch
 *
 * This utility allows executing multiple transactions together, which can
 * be more efficient than executing them one by one. All transactions are
 * sent sequentially but tracked together.
 *
 * @param wallet - The Aztec wallet instance
 * @param interactions - Array of contract function interactions to execute
 * @returns Array of transaction receipts in the same order as interactions
 *
 * @example
 * ```typescript
 * const receipts = await executeBatch(wallet, [
 *   contract1.methods.transfer(recipient1, amount1),
 *   contract2.methods.approve(spender, amount2),
 *   contract3.methods.mint(recipient3, amount3)
 * ]);
 *
 * console.log('All transactions completed:', receipts);
 * ```
 *
 * @public
 */
export async function executeBatch(
  wallet: AztecDappWallet | null,
  interactions: ContractFunctionInteraction[],
): Promise<TxReceipt[]> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  if (!Array.isArray(interactions) || interactions.length === 0) {
    throw ErrorFactory.transportError('No interactions provided for batch execution');
  }

  const receipts: TxReceipt[] = [];
  const errors: Array<{ index: number; error: unknown }> = [];

  try {
    // Execute each interaction sequentially
    for (let i = 0; i < interactions.length; i++) {
      try {
        const interaction = interactions[i];
        if (!interaction) continue;
        // Use native Aztec flow
        const contractInteraction = interaction as ContractFunctionInteraction & {
          request(): Promise<unknown>;
        };
        const txRequest = await contractInteraction.request();
        const provenTx = await wallet.proveTx(txRequest);
        const txHash = await wallet.sendTx(provenTx);
        const receipt = await wallet.getTxReceipt(txHash);
        if (!receipt) {
          throw new Error('Transaction receipt not found');
        }
        receipts.push(receipt);
      } catch (error) {
        errors.push({ index: i, error });
        // Continue with other transactions even if one fails
      }
    }

    // If all transactions failed, throw an error
    if (errors.length === interactions.length) {
      throw ErrorFactory.transportError(
        `All ${interactions.length} transactions failed. First error: ${
          errors[0] && errors[0].error instanceof Error ? errors[0].error.message : 'Unknown error'
        }`,
      );
    }

    // If some transactions failed, include error info in the response
    if (errors.length > 0) {
      const errorIndices = errors.map((e) => e.index).join(', ');
      console.warn(`Batch execution partially failed. Failed transaction indices: ${errorIndices}`);
    }

    return receipts;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('All')) {
      throw error; // Re-throw if it's our "all failed" error
    }
    throw ErrorFactory.transportError(
      `Failed to execute batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Call a view function on a contract
 *
 * View functions are read-only contract methods that don't modify state.
 * This utility provides a convenient way to call them and get the result.
 *
 * @param wallet - The Aztec wallet instance
 * @param contractAddress - The contract address
 * @param artifact - The contract artifact
 * @param methodName - Name of the view method to call
 * @param args - Arguments to pass to the method
 * @returns The result of the view function call
 *
 * @example
 * ```typescript
 * // Get token balance
 * const balance = await callViewFunction(
 *   wallet,
 *   tokenAddress,
 *   TokenArtifact,
 *   'balance_of',
 *   [userAddress]
 * );
 *
 * // Get token metadata
 * const name = await callViewFunction(
 *   wallet,
 *   tokenAddress,
 *   TokenArtifact,
 *   'name',
 *   []
 * );
 * ```
 *
 * @public
 */
export async function callViewFunction(
  wallet: AztecDappWallet | null,
  contractAddress: unknown,
  artifact: unknown,
  methodName: string,
  args?: unknown[],
): Promise<unknown> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Get the contract instance
    const contract = await getContractAt(wallet, contractAddress, artifact);

    // Access the method
    // Access methods dynamically
    const contractWithMethods = contract as unknown as {
      methods: Record<string, (...args: unknown[]) => unknown>;
    };
    const method = contractWithMethods.methods[methodName];
    if (!method) {
      throw ErrorFactory.notFound(`Method ${methodName} not found on contract`);
    }

    // Call the method with arguments and simulate using native Aztec flow
    const interaction = method(...(args || [])) as ContractFunctionInteraction & {
      request(): Promise<unknown>;
    };
    const txRequest = await interaction.request();
    const result = await wallet.simulateTx(txRequest, true);

    // Extract the return value from simulation result
    // Extract return values from simulation result
    const resultWithReturnValues = result as { returnValues?: unknown } & unknown;
    return resultWithReturnValues.returnValues || result;
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to call view function ${methodName}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
}

/**
 * Get the transaction request from a contract interaction
 *
 * This utility extracts the transaction request object from a contract
 * function interaction, which can be useful for inspection or modification
 * before execution.
 *
 * @param interaction - The contract function interaction
 * @returns The transaction request object
 *
 * @example
 * ```typescript
 * const interaction = contract.methods.transfer(recipient, amount);
 * const txRequest = await getTxRequest(interaction);
 * console.log('Transaction will call:', txRequest);
 * ```
 *
 * @public
 */
export async function getTxRequest(interaction: ContractFunctionInteraction): Promise<unknown> {
  try {
    return await interaction.request();
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to get transaction request: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

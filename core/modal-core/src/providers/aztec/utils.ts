/**
 * Aztec blockchain helper utilities
 *
 * Provides convenient helper functions for common Aztec operations.
 * Uses dynamic imports to avoid forcing Aztec dependencies on consumers.
 *
 * @module providers/aztec/utils
 * @packageDocumentation
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type {
  AztecDappWallet,
  ContractFunctionInteraction,
  DeploySentTx,
  SentTx,
  TxReceipt,
} from './types.js';
import { TX_STATUS } from './types.js';

/**
 * Deploy an Aztec contract using the wallet
 *
 * @param wallet - The Aztec wallet instance
 * @param artifact - The contract artifact containing ABI and bytecode
 * @param args - Constructor arguments for the contract
 * @param constructorName - Optional constructor name if multiple exist
 * @returns A DeploySentTx object for tracking deployment
 *
 * @example
 * ```typescript
 * const deployTx = await deployContract(
 *   wallet,
 *   TokenContractArtifact,
 *   [ownerAddress, 'MyToken', 'MTK', 18]
 * );
 * const deployed = await deployTx.deployed();
 * console.log('Contract deployed at:', deployed.address);
 * ```
 *
 * @public
 */
export async function deployContract(
  wallet: AztecDappWallet | null,
  artifact: unknown,
  args: unknown[],
  constructorName?: string,
): Promise<DeploySentTx> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    return await wallet.deployContract(artifact, args, constructorName);
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to deploy contract: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Execute a transaction on the Aztec network
 *
 * @param wallet - The Aztec wallet instance
 * @param interaction - The contract function interaction to execute
 * @returns A SentTx object for tracking the transaction
 *
 * @example
 * ```typescript
 * const contract = await Contract.at(address, artifact, wallet);
 * const tx = await executeTx(
 *   wallet,
 *   contract.methods.transfer(recipient, amount)
 * );
 * const receipt = await tx.wait();
 * ```
 *
 * @public
 */
export async function executeTx(
  wallet: AztecDappWallet | null,
  interaction: ContractFunctionInteraction,
): Promise<SentTx> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    return await wallet.wmExecuteTx(interaction);
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to execute transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Simulate a transaction without executing it
 *
 * @param wallet - The Aztec wallet instance
 * @param interaction - The contract function interaction to simulate
 * @returns The simulation result
 *
 * @example
 * ```typescript
 * const contract = await Contract.at(address, artifact, wallet);
 * const result = await simulateTx(
 *   wallet,
 *   contract.methods.balanceOf(address)
 * );
 * ```
 *
 * @public
 */
export async function simulateTx(
  wallet: AztecDappWallet | null,
  interaction: ContractFunctionInteraction,
): Promise<unknown> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    return await wallet.wmSimulateTx(interaction);
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to simulate transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Wait for a transaction receipt with proper status checking
 *
 * @param wallet - The Aztec wallet instance
 * @param txHash - The transaction hash to wait for
 * @returns The transaction receipt
 * @throws If the transaction fails
 *
 * @example
 * ```typescript
 * const receipt = await waitForTxReceipt(wallet, txHash);
 * if (receipt.status === TX_STATUS.SUCCESS) {
 *   console.log('Transaction succeeded');
 * }
 * ```
 *
 * @public
 */
export async function waitForTxReceipt(wallet: AztecDappWallet | null, txHash: string): Promise<TxReceipt> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Poll for transaction receipt
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout

    while (attempts < maxAttempts) {
      const receipt = await wallet.getTxReceipt(txHash);

      if (receipt && receipt.status !== TX_STATUS.PENDING) {
        return receipt;
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw ErrorFactory.timeoutError('Transaction receipt timeout');
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to get transaction receipt: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get the current Aztec account address
 *
 * @param wallet - The Aztec wallet instance
 * @returns The account address
 *
 * @example
 * ```typescript
 * const address = getAddress(wallet);
 * console.log('Current address:', address.toString());
 * ```
 *
 * @public
 */
export function getAddress(wallet: AztecDappWallet | null): unknown {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  return wallet.getAddress();
}

/**
 * Get the complete address including public keys
 *
 * @param wallet - The Aztec wallet instance
 * @returns The complete address
 *
 * @example
 * ```typescript
 * const completeAddress = getCompleteAddress(wallet);
 * console.log('Public key:', completeAddress.publicKey);
 * ```
 *
 * @public
 */
export function getCompleteAddress(wallet: AztecDappWallet | null): unknown {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  return wallet.getCompleteAddress();
}

/**
 * Check if a wallet is available and ready to use
 *
 * @param wallet - The Aztec wallet instance
 * @returns Whether the wallet is available
 *
 * @public
 */
export function isWalletAvailable(wallet: AztecDappWallet | null): wallet is AztecDappWallet {
  return wallet !== null;
}

/**
 * Helper to handle common Aztec transaction patterns
 *
 * @param wallet - The Aztec wallet instance
 * @param operation - The async operation to perform
 * @param errorMessage - Custom error message prefix
 * @returns The result of the operation
 *
 * @example
 * ```typescript
 * const result = await withAztecWallet(
 *   wallet,
 *   async (w) => {
 *     const contract = await Contract.at(address, artifact, w);
 *     return w.wmExecuteTx(contract.methods.mint(amount));
 *   },
 *   'Minting failed'
 * );
 * ```
 *
 * @public
 */
export async function withAztecWallet<T>(
  wallet: AztecDappWallet | null,
  operation: (wallet: AztecDappWallet) => Promise<T>,
  errorMessage = 'Aztec operation failed',
): Promise<T> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    return await operation(wallet);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw ErrorFactory.transportError(`${errorMessage}: ${message}`);
  }
}

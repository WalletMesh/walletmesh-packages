/**
 * Aztec blockchain helper utilities
 *
 * Provides convenient helper functions for common Aztec operations.
 * Uses dynamic imports to avoid forcing Aztec dependencies on consumers.
 *
 * @module providers/aztec/utils
 * @packageDocumentation
 */

import { AztecAddress } from '@aztec/aztec.js';
import type { Fr } from '@aztec/foundation/fields';
import { decodeFromAbi, FunctionType, type FunctionAbi } from '@aztec/stdlib/abi';
import type { TxSimulationResult } from '@aztec/stdlib/tx';

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type {
  AztecContractArtifact,
  AztecDappWallet,
  AztecDeploymentStage,
  AztecSendOptions,
  ContractFunctionInteraction,
  DeploySentTx,
  SentTx,
  TxReceipt,
} from './types.js';
import { TX_STATUS } from './types.js';

type ContractFunctionInteractionInternal = ContractFunctionInteraction & {
  functionDao?: FunctionAbi;
  simulate?: () => Promise<unknown>;
};

const registeredContractClasses = new Set<string>();

export function normalizeArtifact(artifact: AztecContractArtifact): AztecContractArtifact {
  if (!artifact) {
    throw new Error('Artifact is required');
  }

  if (artifact.notes) {
    return artifact;
  }

  return {
    ...artifact,
    notes: {},
  } satisfies AztecContractArtifact;
}

export async function ensureContractClassRegistered(
  wallet: AztecDappWallet | null,
  artifact: AztecContractArtifact,
): Promise<void> {
  if (!wallet) {
    return;
  }

  const { getContractClassFromArtifact } = await import('@aztec/stdlib/contract');
  const { id } = await getContractClassFromArtifact(artifact as any);
  const key = id.toString();

  if (registeredContractClasses.has(key)) {
    return;
  }

  try {
    await wallet.registerContractClass(artifact as Parameters<typeof wallet.registerContractClass>[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!message.includes('already registered')) {
      throw error;
    }
  }

  registeredContractClasses.add(key);
}

type NativeSentTx = {
  txHash?: string | { toString(): string };
  getTxHash?: () => Promise<{ toString(): string }>;
  wait?: () => Promise<TxReceiptLike>;
};

type TxReceiptLike = TxReceipt | (Omit<TxReceipt, 'txHash'> & { txHash: string | { toString(): string } });

export function isAztecAddressValue(value: unknown): value is AztecAddress {
  return value instanceof AztecAddress;
}

export function normalizeAztecAddress(value: unknown, label = 'address'): AztecAddress {
  if (value === undefined || value === null) {
    throw ErrorFactory.invalidParams(`No ${label} provided`);
  }

  if (isAztecAddressValue(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return AztecAddress.fromString(value);
    } catch (error) {
      throw ErrorFactory.invalidParams(`Invalid ${label}: ${(error as Error).message}`);
    }
  }

  if (typeof value === 'object') {
    const stringValue = (value as { toString?: () => unknown }).toString?.();
    if (typeof stringValue === 'string') {
      try {
        return AztecAddress.fromString(stringValue);
      } catch (error) {
        throw ErrorFactory.invalidParams(`Invalid ${label}: ${(error as Error).message}`);
      }
    }
  }

  throw ErrorFactory.invalidParams(`Invalid ${label}: expected Aztec address-like input`);
}

export function formatAztecAddress(value: unknown, label = 'address'): string {
  return normalizeAztecAddress(value, label).toString();
}

function normalizeHash(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof (value as { toString(): unknown }).toString === 'function') {
    const stringified = (value as { toString(): unknown }).toString();
    if (typeof stringified === 'string') {
      return stringified;
    }
  }
  return undefined;
}

function hasSendOptions(options?: AztecSendOptions): options is AztecSendOptions {
  if (!options) {
    return false;
  }
  return Object.values(options).some((value) => value !== undefined);
}

async function resolveNativeHash(nativeTx: NativeSentTx): Promise<string> {
  const directHash = normalizeHash(nativeTx.txHash);
  if (directHash) {
    return directHash;
  }
  if (typeof nativeTx.getTxHash === 'function') {
    const hash = await nativeTx.getTxHash();
    const normalized = normalizeHash(hash);
    if (normalized) {
      return normalized;
    }
  }
  throw ErrorFactory.transactionFailed('Transaction hash unavailable from send() result');
}

async function waitForNativeReceipt(nativeTx: NativeSentTx): Promise<TxReceiptLike> {
  if (typeof nativeTx.wait !== 'function') {
    throw ErrorFactory.transactionFailed('Transaction wait() unavailable');
  }
  return (await nativeTx.wait()) as TxReceiptLike;
}

function normalizeReceipt(receipt: TxReceiptLike, fallbackHash: string): TxReceipt {
  const normalizedHash = normalizeHash(receipt.txHash) ?? fallbackHash;
  return {
    ...receipt,
    txHash: normalizedHash,
  } satisfies TxReceipt;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

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
  options?: AztecSendOptions,
): Promise<SentTx> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    const useCustomSend = hasSendOptions(options);

    if (!useCustomSend && typeof wallet.wmExecuteTx === 'function') {
      const aztecSentTx = (await wallet.wmExecuteTx(interaction)) as NativeSentTx;
      const txHash = await resolveNativeHash(aztecSentTx);

      return {
        txHash,
        wait: async (): Promise<TxReceipt> => {
          const receipt = await waitForNativeReceipt(aztecSentTx);
          return normalizeReceipt(receipt, txHash);
        },
      } satisfies SentTx;
    }

    const sendableInteraction = interaction as ContractFunctionInteraction & {
      send?: (opts?: AztecSendOptions) => Promise<NativeSentTx>;
    };

    if (typeof sendableInteraction.send === 'function') {
      const nativeTx = await sendableInteraction.send(options) as NativeSentTx;
      const txHash = await resolveNativeHash(nativeTx);

      return {
        txHash,
        wait: async (): Promise<TxReceipt> => {
          const receipt = await waitForNativeReceipt(nativeTx);
          return normalizeReceipt(receipt, txHash);
        },
      } satisfies SentTx;
    }

    if (useCustomSend) {
      throw ErrorFactory.invalidParams('Custom send options are not supported for this interaction');
    }

    // Fallback: request → proveTx → sendTx
    const contractInteraction = interaction as ContractFunctionInteraction & {
      request(): Promise<unknown>;
    };
    const txRequest = await contractInteraction.request();
    const provenTx = await wallet.proveTx(txRequest);
    const rawTxHash = await wallet.sendTx(provenTx);
    const txHash = normalizeHash(rawTxHash);

    if (!txHash) {
      throw ErrorFactory.transactionFailed('Transaction hash unavailable from wallet.sendTx');
    }

    return {
      txHash,
      wait: async () => {
        const receipt = await wallet.getTxReceipt(rawTxHash);
        if (!receipt) {
          throw new Error('Transaction receipt not found');
        }
        return normalizeReceipt(receipt as TxReceiptLike, txHash);
      },
    } satisfies SentTx;
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to execute transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export interface ExecuteInteractionOptions {
  sendOptions?: AztecSendOptions;
  onSent?: (hash: string) => void;
}

export interface ExecuteInteractionResult {
  hash: string;
  receipt: TxReceipt;
  status: string;
}

export async function executeInteraction(
  wallet: AztecDappWallet | null,
  interaction: ContractFunctionInteraction,
  options: ExecuteInteractionOptions = {},
): Promise<ExecuteInteractionResult> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  const sentTx = await executeTx(wallet, interaction, options.sendOptions);
  options.onSent?.(sentTx.txHash);
  const receiptRaw = (await sentTx.wait()) as TxReceipt;
  const receipt = normalizeReceipt(receiptRaw, sentTx.txHash);

  if (receipt.error) {
    throw ErrorFactory.transactionFailed(`Transaction failed: ${receipt.error}`);
  }

  const status = receipt.status ?? 'SUCCESS';
  const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : status;
  if (normalizedStatus === '0' || normalizedStatus === '0X0' || normalizedStatus === 'FAILED') {
    throw ErrorFactory.transactionFailed(`Transaction failed with status: ${status}`);
  }

  return {
    hash: sentTx.txHash,
    receipt,
    status,
  };
}

export interface ExecuteBatchCallbacks {
  onSending?: (index: number) => void;
  onSent?: (index: number, hash: string) => void;
  onSuccess?: (index: number, result: ExecuteInteractionResult) => void;
  onError?: (index: number, error: Error) => void;
}

export interface ExecuteBatchOptions {
  sendOptions?: AztecSendOptions;
  callbacks?: ExecuteBatchCallbacks;
}

export async function executeBatchInteractions(
  wallet: AztecDappWallet | null,
  interactions: ContractFunctionInteraction[],
  options: ExecuteBatchOptions = {},
): Promise<{ receipts: TxReceipt[]; errors: Array<{ index: number; error: Error }> }> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  if (!Array.isArray(interactions) || interactions.length === 0) {
    throw ErrorFactory.invalidParams('No interactions provided');
  }

  const receipts: TxReceipt[] = [];
  const errors: Array<{ index: number; error: Error }> = [];
  const sendOptions = options.sendOptions;
  const callbacks = options.callbacks;

  for (let index = 0; index < interactions.length; index++) {
    const interaction = interactions[index];
    if (!interaction) {
      continue;
    }

    callbacks?.onSending?.(index);

    try {
      const result = await executeInteraction(wallet, interaction, {
        ...(sendOptions && { sendOptions }),
        onSent: (hash) => callbacks?.onSent?.(index, hash),
      });

      receipts.push(result.receipt);
      callbacks?.onSuccess?.(index, result);
    } catch (error) {
      const err = error instanceof Error
        ? error
        : ErrorFactory.transactionFailed('Transaction failed');
      errors.push({ index, error: err });
      callbacks?.onError?.(index, err);
    }
  }

  return { receipts, errors };
}

export async function simulateInteraction(
  wallet: AztecDappWallet | null,
  interaction: ContractFunctionInteraction,
): Promise<unknown> {
  return await simulateTx(wallet, interaction);
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

  const errors: Error[] = [];
  let undecodedResult: unknown;

  if (typeof wallet.wmSimulateTx === 'function') {
    try {
      const simulationResult = await wallet.wmSimulateTx(interaction);
      const decoded = tryDecodeSimulationResult(interaction, simulationResult);
      if (decoded !== undefined) {
        return decoded;
      }
      console.warn('wmSimulateTx returned undecodable result; falling back to native simulation.');
      undecodedResult = simulationResult;
    } catch (error) {
      console.warn('wmSimulateTx failed, attempting native simulation fallback.', error);
      errors.push(toError(error));
    }
  }

  const maybeSimulate = (interaction as ContractFunctionInteractionInternal).simulate;
  if (typeof maybeSimulate === 'function') {
    try {
      return await maybeSimulate.call(interaction);
    } catch (error) {
      errors.push(toError(error));
    }
  }

  try {
    const contractInteraction = interaction as ContractFunctionInteraction & {
      request(): Promise<unknown>;
    };
    const txRequest = await contractInteraction.request();
    const simulationResult = await wallet.simulateTx(txRequest, true);
    const decoded = tryDecodeSimulationResult(interaction, simulationResult);
    return decoded !== undefined ? decoded : simulationResult;
  } catch (error) {
    errors.push(toError(error));
  }

  if (undecodedResult !== undefined) {
    return undecodedResult;
  }

  const firstError = errors[0];
  const message = firstError ? firstError.message : 'Unknown error';
  throw ErrorFactory.transportError(`Failed to simulate transaction: ${message}`);
}

function isTxSimulationResult(value: unknown): value is TxSimulationResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as TxSimulationResult).getPublicReturnValues === 'function' &&
    typeof (value as TxSimulationResult).getPrivateReturnValues === 'function'
  );
}

function tryDecodeSimulationResult(
  interaction: ContractFunctionInteraction,
  result: unknown,
): unknown | undefined {
  if (!isTxSimulationResult(result)) {
    return undefined;
  }

  const { functionDao } = interaction as ContractFunctionInteractionInternal;
  if (!functionDao) {
    return undefined;
  }

  try {
    let rawReturnValues: Fr[] | undefined;

    if (functionDao.functionType === FunctionType.PRIVATE) {
      const privateReturnValues = result.getPrivateReturnValues();
      rawReturnValues =
        privateReturnValues.nested.length > 0
          ? (privateReturnValues.nested[0]?.values as Fr[] | undefined)
          : (privateReturnValues.values as Fr[] | undefined);
    } else {
      const publicReturnValues = result.getPublicReturnValues();
      rawReturnValues = publicReturnValues?.[0]?.values as Fr[] | undefined;
    }

    if (!rawReturnValues || rawReturnValues.length === 0) {
      return functionDao.returnTypes.length === 0 ? [] : undefined;
    }

    return decodeFromAbi(functionDao.returnTypes, rawReturnValues);
  } catch (error) {
    console.debug('Failed to decode Aztec simulation result', error);
    return undefined;
  }
}

export const DEPLOYMENT_STAGE_LABELS: Record<AztecDeploymentStage, string> = {
  idle: 'Ready to deploy',
  preparing: '📝 Preparing deployment...',
  computing: '🔢 Computing contract address...',
  proving: '🔐 Generating proof...',
  sending: '\uD83D\uDCE4 Sending transaction...',
  confirming: '⏳ Waiting for confirmation...',
  success: '✅ Deployment complete!',
  error: '❌ Deployment failed',
};

export function getDeploymentStageLabel(stage: AztecDeploymentStage): string {
  return DEPLOYMENT_STAGE_LABELS[stage] ?? DEPLOYMENT_STAGE_LABELS.idle;
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
 *     const interaction = contract.methods.mint(amount);
 *     const txRequest = await interaction.request();
 *     const provenTx = await w.proveTx(txRequest);
 *     return await w.sendTx(provenTx);
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

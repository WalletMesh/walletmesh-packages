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
      // wmExecuteTx now returns { txHash: TxHash; txStatusId: string }
      const result = await wallet.wmExecuteTx(interaction);
      const txHash = normalizeHash(result.txHash);

      if (!txHash) {
        throw ErrorFactory.transactionFailed('Transaction hash unavailable from wmExecuteTx');
      }

      return {
        txHash,
        txStatusId: result.txStatusId, // Include wallet's transaction status ID
        wait: async (): Promise<TxReceipt> => {
          // Use wallet's getTxReceipt to wait for confirmation
          const receipt = await waitForTxReceipt(wallet, txHash);
          return normalizeReceipt(receipt as TxReceiptLike, txHash);
        },
      } satisfies SentTx;
    }

    const sendableInteraction = interaction as ContractFunctionInteraction & {
      send?: (opts?: AztecSendOptions) => Promise<NativeSentTx>;
    };

    if (typeof sendableInteraction.send === 'function') {
      const nativeTx = (await sendableInteraction.send(options)) as NativeSentTx;
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

/**
 * Execute multiple contract interactions as a single atomic batch transaction
 *
 * This function uses Aztec's native BatchCall to execute all interactions
 * atomically - all operations succeed together or all fail together. This is
 * more efficient than sequential execution and provides better UX by allowing
 * users to approve all operations at once.
 *
 * @param wallet - The Aztec wallet instance
 * @param interactions - Array of contract function interactions to batch
 * @param options - Optional send options for the batch transaction
 * @returns A SentTx object for tracking the batch transaction
 *
 * @example
 * ```typescript
 * const contract = await Contract.at(address, artifact, wallet);
 * const batchTx = await executeAtomicBatch(wallet, [
 *   contract.methods.transfer(recipient1, amount1),
 *   contract.methods.approve(spender, amount2),
 *   contract.methods.mint(recipient3, amount3)
 * ]);
 * const receipt = await batchTx.wait();
 * console.log('All operations completed atomically:', receipt);
 * ```
 *
 * @public
 */
export async function executeAtomicBatch(
  wallet: AztecDappWallet | null,
  interactions: ContractFunctionInteraction[],
  options?: AztecSendOptions,
): Promise<SentTx> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  if (!Array.isArray(interactions) || interactions.length === 0) {
    throw ErrorFactory.invalidParams('No interactions provided for atomic batch execution');
  }

  try {
    // Check if wallet supports atomic batch execution
    if (typeof wallet.wmBatchExecute !== 'function') {
      throw ErrorFactory.transportError(
        'Wallet does not support atomic batch execution (wmBatchExecute method not available)',
      );
    }

    // Convert interactions to execution payloads
    const executionPayloads: unknown[] = [];
    for (let i = 0; i < interactions.length; i++) {
      const interaction = interactions[i];
      if (!interaction) continue;

      const contractInteraction = interaction as ContractFunctionInteraction & {
        request(): Promise<unknown>;
      };

      if (typeof contractInteraction.request !== 'function') {
        throw ErrorFactory.invalidParams(`Interaction at index ${i} does not have a request() method`);
      }

      const payload = await contractInteraction.request();
      executionPayloads.push(payload);
    }

    if (executionPayloads.length === 0) {
      throw ErrorFactory.invalidParams('No valid execution payloads could be created from interactions');
    }

    // Execute the atomic batch using wmBatchExecute
    const result = await wallet.wmBatchExecute(executionPayloads, options);
    const txHash = normalizeHash(result.txHash);

    if (!txHash) {
      throw ErrorFactory.transactionFailed('Transaction hash unavailable from wmBatchExecute');
    }

    // Return SentTx compatible object
    // The receipt is already available from the batch execution
    return {
      txHash,
      wait: async (): Promise<TxReceipt> => {
        // Normalize the receipt
        const receipt = normalizeReceipt(result.receipt as TxReceiptLike, txHash);

        // Check for explicit error message (mirrors executeInteraction validation)
        if (receipt.error) {
          throw ErrorFactory.transactionFailed(`Atomic batch failed: ${receipt.error}`);
        }

        // Check for failure status codes (mirrors executeInteraction validation)
        const status = receipt.status ?? 'SUCCESS';
        const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : status;
        if (normalizedStatus === '0' || normalizedStatus === '0X0' || normalizedStatus === 'FAILED') {
          throw ErrorFactory.transactionFailed(`Atomic batch failed with status: ${status}`);
        }

        return receipt;
      },
    } satisfies SentTx;
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to execute atomic batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      const err = error instanceof Error ? error : ErrorFactory.transactionFailed('Transaction failed');
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

  const interactionInternal = interaction as ContractFunctionInteractionInternal;
  const errors: Error[] = [];
  let undecodedResult: unknown;
  let preparedExecutionPayload: unknown | null = null;

  const getExecutionPayload = async (): Promise<unknown | undefined> => {
    if (preparedExecutionPayload !== null) {
      return preparedExecutionPayload;
    }
    const requestFn = (
      interactionInternal as ContractFunctionInteraction & {
        request?: () => Promise<unknown>;
      }
    ).request;
    if (typeof requestFn !== 'function') {
      preparedExecutionPayload = undefined;
      return undefined;
    }
    const payload = await requestFn.call(interaction);
    preparedExecutionPayload = payload ?? undefined;
    return preparedExecutionPayload;
  };

  // Strategy 1: Try the interaction's native simulate() method FIRST
  const maybeSimulate = interactionInternal.simulate;
  if (typeof maybeSimulate === 'function') {
    try {
      console.debug('[simulateTx] Trying interaction.simulate()');

      // Get wallet address to pass as 'from' parameter (required for utility/view functions)
      const from = wallet.getAddress();

      // Pass options with 'from' parameter as required by Aztec.js simulate() method
      // Type cast needed because TypeScript types don't include the options parameter
      // but it's supported at runtime according to Aztec.js docs
      const result = await (maybeSimulate as (options?: { from?: unknown }) => Promise<unknown>).call(
        interaction,
        { from },
      );
      console.debug('[simulateTx] interaction.simulate() succeeded');
      return result;
    } catch (error) {
      console.warn('[simulateTx] interaction.simulate() failed:', error);
      errors.push(toError(error));
      // Continue to try other strategies
    }
  } else {
    console.debug('[simulateTx] No native simulate() method found on interaction');
  }

  // Detect function type for remaining strategies
  let functionType: FunctionType | string | undefined = interactionInternal.functionDao?.functionType;
  let detectedPayload: unknown | undefined;
  let payloadDetectionFailed = false;

  if (!functionType) {
    try {
      detectedPayload = await getExecutionPayload();
      if (detectedPayload && typeof detectedPayload === 'object') {
        const calls = (detectedPayload as { calls?: Array<{ type?: string }> }).calls;
        const detectedType = calls?.[0]?.type;
        if (typeof detectedType === 'string') {
          functionType = detectedType;
          console.debug('[simulateTx] Detected function type from payload:', detectedType);
        }
      }
    } catch (error) {
      const resolvedError = toError(error);
      console.warn('[simulateTx] Failed to get execution payload:', resolvedError.message);
      errors.push(resolvedError);
      payloadDetectionFailed = true;
    }
  }

  // Detect utility function based on payload
  const isUtilityFunction = functionType === FunctionType.UTILITY || functionType === 'utility';

  // Additional heuristic: Check if payload lacks transaction-required fields
  let likelyUtilityByStructure = false;
  if (detectedPayload && typeof detectedPayload === 'object') {
    const payload = detectedPayload as { authWitnesses?: unknown[]; capsules?: unknown[]; calls?: unknown[] };
    const hasNoAuthWitnesses = !payload.authWitnesses || payload.authWitnesses.length === 0;
    const hasNoCapsules = !payload.capsules || payload.capsules.length === 0;
    const hasCalls = !!(payload.calls && payload.calls.length > 0);

    // Only consider it likely a utility function if it has calls but no auth/capsules
    likelyUtilityByStructure = hasNoAuthWitnesses && hasNoCapsules && hasCalls;

    if (likelyUtilityByStructure) {
      console.debug('[simulateTx] Detected likely utility function from payload structure');
    }
  }

  // If we failed to detect the payload and have no other success, this is likely a utility function
  // Utility functions don't have a request() method to generate ExecutionPayloads
  if (payloadDetectionFailed && !isUtilityFunction) {
    console.debug(
      '[simulateTx] Payload detection failed - likely a utility function without request() method',
    );
    // Don't try remaining strategies that require a payload
    const firstError = errors[0];
    const message = firstError ? firstError.message : 'Unknown error';
    throw ErrorFactory.transportError(`Failed to simulate transaction: ${message}`);
  }

  // Exit early for confirmed utility functions - don't try transaction simulation strategies
  if (isUtilityFunction || likelyUtilityByStructure) {
    console.debug('[simulateTx] Detected utility/view function - skipping transaction simulation strategies');

    // If we got here, interaction.simulate() failed above - throw meaningful error
    const firstError = errors[0];
    if (firstError) {
      throw ErrorFactory.transportError(
        `Utility function simulation failed: ${firstError.message}. ` +
          'Utility functions require interaction.simulate({ from: address }) to be called correctly.',
      );
    }

    throw ErrorFactory.transportError(
      'Unable to simulate utility function. The interaction.simulate() method is not available or failed.',
    );
  }

  // Strategy 2: Try wmSimulateTx for NON-utility functions (state-changing transactions)
  if (!isUtilityFunction && !likelyUtilityByStructure && typeof wallet.wmSimulateTx === 'function') {
    try {
      console.debug('[simulateTx] Trying wmSimulateTx');
      const simulationResult = await wallet.wmSimulateTx(interaction);

      // Check if this is a UnifiedSimulationResult (new format)
      if (isUnifiedSimulationResult(simulationResult)) {
        console.debug('[simulateTx] Received UnifiedSimulationResult from wmSimulateTx');
        // If we have a decoded result, use it; otherwise fall back to trying to decode the original
        if (simulationResult.decodedResult !== undefined) {
          return simulationResult.decodedResult;
        }
        // Try to decode the original result
        const decoded = tryDecodeSimulationResult(interaction, simulationResult.originalResult);
        if (decoded !== undefined) {
          return decoded;
        }
        console.warn(
          '[simulateTx] wmSimulateTx returned undecodable result; falling back to native simulation.',
        );
        undecodedResult = simulationResult.originalResult;
      } else {
        // Legacy format (TxSimulationResult) - try to decode directly
        const decoded = tryDecodeSimulationResult(interaction, simulationResult);
        if (decoded !== undefined) {
          return decoded;
        }
        console.warn(
          '[simulateTx] wmSimulateTx returned undecodable result; falling back to native simulation.',
        );
        undecodedResult = simulationResult;
      }
    } catch (error) {
      console.warn('[simulateTx] wmSimulateTx failed, attempting native simulation fallback.', error);
      errors.push(toError(error));
    }
  }

  // Strategy 3: Try wallet.simulateTx with txRequest ONLY for confirmed NON-utility functions
  // Skip this for utility functions or suspected utility functions to avoid authWitnesses errors
  if (!isUtilityFunction && !likelyUtilityByStructure && !payloadDetectionFailed) {
    try {
      console.debug('[simulateTx] Trying wallet.simulateTx with txRequest');
      const txRequest = await getExecutionPayload();
      if (!txRequest) {
        throw new Error('Unable to prepare execution payload for simulation.');
      }

      // Additional validation: ensure txRequest has required transaction fields
      const payload = txRequest as { authWitnesses?: unknown; calls?: unknown };
      if (!payload.authWitnesses || !payload.calls) {
        console.warn(
          '[simulateTx] ExecutionPayload missing required transaction fields - skipping wallet.simulateTx',
        );
        throw new Error('ExecutionPayload missing required transaction fields (authWitnesses or calls)');
      }

      const simulationResult = await wallet.simulateTx(txRequest, true);
      const decoded = tryDecodeSimulationResult(interaction, simulationResult);
      return decoded !== undefined ? decoded : simulationResult;
    } catch (error) {
      console.warn('[simulateTx] wallet.simulateTx failed:', error);
      errors.push(toError(error));
    }
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

/**
 * Type guard to check if a value is a UnifiedSimulationResult.
 * UnifiedSimulationResult has simulationType and originalResult fields.
 */
function isUnifiedSimulationResult(value: unknown): value is {
  simulationType: 'transaction' | 'utility';
  decodedResult?: unknown;
  stats?: unknown;
  originalResult: unknown;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'simulationType' in value &&
    'originalResult' in value &&
    (value.simulationType === 'transaction' || value.simulationType === 'utility')
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

/**
 * Simulate a utility (view) function call on an Aztec contract.
 *
 * This is optimized for read-only operations like balance queries. Unlike simulateTx,
 * this returns a smaller payload containing only the function result, making it suitable
 * for operations that go through Chrome extension messaging which has size limits.
 *
 * @param wallet - The Aztec wallet instance
 * @param contractAddress - The address of the contract to call
 * @param functionName - The name of the utility function to call
 * @param args - Arguments for the function call
 * @returns The result of the utility function call
 *
 * @example
 * ```typescript
 * const balance = await simulateUtility(
 *   wallet,
 *   tokenContractAddress,
 *   'balance_of_public',
 *   [ownerAddress]
 * );
 * ```
 *
 * @public
 */
export async function simulateUtility(
  wallet: AztecDappWallet | null,
  contractAddress: unknown,
  functionName: string,
  args: unknown[] = [],
): Promise<unknown> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  if (!wallet.simulateUtility) {
    throw ErrorFactory.transportError(
      'Wallet does not support simulateUtility. This may be an older wallet version.',
    );
  }

  try {
    const result = await wallet.simulateUtility(functionName, args, contractAddress);
    // UtilitySimulationResult contains a 'values' array with the return values
    // Return the raw result and let the caller extract what they need
    return result;
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to simulate utility function ${functionName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

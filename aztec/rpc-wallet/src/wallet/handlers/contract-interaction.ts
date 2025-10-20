import {
  type AztecAddress,
  Contract,
  type DeployOptions,
  FeeJuicePaymentMethod,
  Fr,
  type ProvenTx,
  type SentTx,
  type TxHash,
} from '@aztec/aztec.js';
import type { FeeOptions, TxExecutionOptions } from '@aztec/entrypoints/interfaces';
import type { ExecutionPayload } from '@aztec/entrypoints/payload';
import type { AztecSendOptions } from '../../types.js';
import { createLogger } from '@aztec/foundation/log';
import { GasSettings } from '@aztec/stdlib/gas';
import type { TxExecutionRequest, TxReceipt, TxSimulationResult } from '@aztec/stdlib/tx';
import { JSONRPCError } from '@walletmesh/jsonrpc';
import type { AztecWalletMethodMap } from '../../types.js';
import type { AztecHandlerContext } from './index.js';
import { notifyTransactionStatus } from './transactionStatusNotifications.js';

const logger = createLogger('aztec-rpc-wallet:contract-interaction:handler');

/**
 * @module @walletmesh/aztec-rpc-wallet/wallet/handlers/contract-interaction
 * This module provides handlers for WalletMesh-specific high-level contract
 * interaction and deployment methods (e.g., `aztec_wmExecuteTx`, `aztec_wmDeployContract`).
 * These methods simplify common contract operations for dApp developers by accepting
 * an {@link ExecutionPayload} or deployment parameters, with the wallet-side
 * handling more of the transaction construction, simulation, proving, and sending flow.
 */

/**
 * Creates handlers for WalletMesh-specific contract interaction and deployment JSON-RPC methods.
 *
 * These handlers manage high-level contract operations such as:
 * - `aztec_wmExecuteTx`: Executing a pre-constructed {@link ExecutionPayload}.
 * - `aztec_wmSimulateTx`: Simulating an {@link ExecutionPayload}.
 * - `aztec_wmDeployContract`: Deploying a new contract from its artifact and arguments.
 *
 * The primary goal of these "wm" (WalletMesh) methods is to simplify the dApp's
 * interaction with the wallet by abstracting parts of the standard Aztec transaction
 * lifecycle (e.g., fee estimation, `createTxExecutionRequest`, `proveTx`, `sendTx`).
 * The wallet takes on more responsibility, which can lead to a better user experience
 * as the wallet can provide more context or apply its own policies.
 *
 * @returns An object where keys are "wm" prefixed method names and values are their
 *          corresponding handler functions.
 * @see {@link AztecWalletMethodMap} for method definitions.
 */
export function createContractInteractionHandlers() {
  /** @internal Helper to configure fee options. TODO: Make this more configurable. */
  async function getFeeOptions(ctx: AztecHandlerContext): Promise<FeeOptions> {
    // TODO: Provide gas settings from the context
    logger.debug('Getting current base fees...');
    const baseFees = await ctx.wallet.getCurrentBaseFees();
    logger.debug('Base fees:', baseFees);

    const maxFeesPerGas = baseFees.mul(1.5);
    logger.debug('Calculated max fees per gas:', maxFeesPerGas);

    const feeOpts: FeeOptions = {
      paymentMethod: new FeeJuicePaymentMethod(ctx.wallet.getAddress()),
      gasSettings: GasSettings.default({ maxFeesPerGas }),
    };
    logger.debug('Fee options configured:', feeOpts);

    return feeOpts;
  }

  /** @internal Helper to configure transaction execution options. TODO: Make this more configurable. */
  async function getTxOptions(_ctx: AztecHandlerContext): Promise<TxExecutionOptions> {
    // TODO(twt): Enable setting cancellable flag & nonce in the options
    const txOpts: TxExecutionOptions = {};
    return txOpts;
  }

  async function createTxExecutionRequest(
    ctx: AztecHandlerContext,
    executionPayload: ExecutionPayload,
  ): Promise<TxExecutionRequest> {
    logger.debug('Creating transaction execution request...');
    try {
      // TODO(twt): Provide gas settings from the context
      logger.debug('Getting current base fees...');
      const baseFees = await ctx.wallet.getCurrentBaseFees();
      logger.debug('Base fees:', baseFees);

      const maxFeesPerGas = baseFees.mul(1.5);
      logger.debug('Calculated max fees per gas:', maxFeesPerGas);

      const feeOpts = await getFeeOptions(ctx);
      const txOpts = await getTxOptions(ctx);

      // Create a transaction execution request from the payload
      const txRequest = await ctx.wallet.createTxExecutionRequest(executionPayload, feeOpts, txOpts);

      return txRequest;
    } catch (error) {
      logger.error('Failed to create transaction execution request:', error);
      throw error;
    }
  }

  async function simulateTransaction(
    ctx: AztecHandlerContext,
    executionPayload: ExecutionPayload,
    txExecutionRequest?: TxExecutionRequest,
  ): Promise<TxSimulationResult> {
    try {
      const txRequest = txExecutionRequest || (await createTxExecutionRequest(ctx, executionPayload));
      // Execute the transaction using the standard flow
      logger.debug('Starting transaction simulation...');
      const simStartTime = Date.now();
      const simulationResult = await ctx.wallet.simulateTx(txRequest, true);
      logger.debug(`Transaction simulation completed in ${Date.now() - simStartTime}ms`);
      return simulationResult;
    } catch (error) {
      logger.error('Transaction simulation failed:', error);
      throw error;
    }
  }

  /**
   * @internal
   * Helper function to execute a transaction from an {@link ExecutionPayload}.
   * This consolidates the common flow:
   * 1. Generate unique transaction status ID
   * 2. Send 'initiated' notification
   * 3. Create TxExecutionRequest and simulate transaction
   * 4. Prove transaction
   * 5. Send transaction
   *
   * Transaction status notifications (initiated/simulating/proving/sending/pending/failed) are
   * automatically sent at each lifecycle stage. The backend generates a unique `txStatusId` that
   * is returned along with the transaction hash to allow frontend correlation.
   *
   * @param ctx - The {@link AztecHandlerContext}.
   * @param executionPayload - The {@link ExecutionPayload} for the transaction.
   * @returns A promise resolving to an object containing both the blockchain tx hash and status tracking ID.
   */
  async function executeTransaction(
    ctx: AztecHandlerContext,
    executionPayload: ExecutionPayload,
  ): Promise<{ txHash: TxHash; txStatusId: string }> {
    const startTime = Date.now();

    // Generate unique transaction status ID for tracking
    const txStatusId = crypto.randomUUID();

    logger.debug(
      `Starting transaction execution. StatusId: ${txStatusId}, Wallet: ${ctx.wallet.getAddress().toString()}, Payload: ${executionPayload.calls.length} calls`,
    );
    logger.debug('Execution payload:', executionPayload);

    try {
      // Stage 0: Initiated (transaction received, ID generated)
      logger.debug('Transaction initiated, sending initial notification...');
      await notifyTransactionStatus(ctx, { txStatusId, status: 'initiated' });

      // Stage 1: Simulating (maps to Aztec's simulate())
      logger.debug('Starting transaction simulation...');
      await notifyTransactionStatus(ctx, { txStatusId, status: 'simulating' });

      const txRequest = await createTxExecutionRequest(ctx, executionPayload);
      const simulationResult = await simulateTransaction(ctx, executionPayload, txRequest);
      logger.debug('Transaction simulation completed');

      // Stage 2: Proving (zero-knowledge proof generation)
      logger.debug('Starting transaction proving...');
      await notifyTransactionStatus(ctx, { txStatusId, status: 'proving' });

      const proveStartTime = Date.now();
      const provingResult = await ctx.wallet.proveTx(txRequest, simulationResult.privateExecutionResult);
      const provingTime = Date.now() - proveStartTime;
      logger.debug(`Transaction proving completed in ${provingTime}ms`);
      logger.debug('Proving result:', provingResult);

      logger.debug('Creating transaction from proving result...');
      const tx = await provingResult.toTx();
      logger.debug('Transaction created:', tx);

      let txHashString: string | undefined;
      try {
        txHashString = tx?.getTxHash?.()?.toString?.();
      } catch (hashError) {
        logger.debug('Unable to derive tx hash after proving', {
          error: hashError instanceof Error ? hashError.message : hashError,
        });
      }

      // Stage 3: Sending (maps to Aztec's send())
      logger.debug('Sending transaction to network...');
      await notifyTransactionStatus(ctx, {
        txStatusId,
        status: 'sending',
        ...(txHashString && { txHash: txHashString }), // ← Blockchain hash now available
      });

      const sendStartTime = Date.now();
      const txHash = await ctx.wallet.sendTx(tx);
      logger.debug(`Transaction sent in ${Date.now() - sendStartTime}ms, hash: ${txHash.toString()}`);

      // Stage 4: Pending (waiting for confirmation)
      await notifyTransactionStatus(ctx, {
        txStatusId, // ← Tracking ID for frontend coordination
        status: 'pending',
        txHash: txHash.toString(), // ← Blockchain hash
      });

      return { txHash, txStatusId };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      logger.error(`Transaction execution failed after ${totalTime}ms}`);
      logger.error('Error details:', error);

      // Send failed notification
      await notifyTransactionStatus(ctx, {
        txStatusId,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * @internal
   * Validates an array of {@link ExecutionPayload} objects for batch execution.
   * Throws an error if the batch is invalid (e.g., empty array, inconsistent state).
   *
   * @param executionPayloads - Array of {@link ExecutionPayload} objects to validate.
   * @throws {JSONRPCError} If validation fails.
   */
  function validateBatchPayloads(executionPayloads: ExecutionPayload[]): void {
    if (!Array.isArray(executionPayloads)) {
      throw new JSONRPCError(-32602, 'Invalid params: executionPayloads must be an array');
    }

    if (executionPayloads.length === 0) {
      throw new JSONRPCError(-32602, 'Invalid params: executionPayloads array cannot be empty');
    }

    // Validate each payload has required fields
    for (let i = 0; i < executionPayloads.length; i++) {
      const payload = executionPayloads[i];
      if (!payload || typeof payload !== 'object') {
        throw new JSONRPCError(-32602, `Invalid params: executionPayloads[${i}] must be an object`);
      }
      if (!Array.isArray(payload.calls)) {
        throw new JSONRPCError(-32602, `Invalid params: executionPayloads[${i}].calls must be an array`);
      }
      if (payload.calls.length === 0) {
        throw new JSONRPCError(-32602, `Invalid params: executionPayloads[${i}].calls array cannot be empty`);
      }
    }

    logger.debug(`Validated ${executionPayloads.length} execution payloads`);
  }

  /**
   * @internal
   * Merges multiple {@link ExecutionPayload} objects into a single payload suitable
   * for atomic batch execution using Aztec's BatchCall.
   *
   * The merge strategy follows the plan's payload merging specification:
   * - Concatenates all calls arrays
   * - Concatenates all authWitnesses arrays
   * - Concatenates all capsules arrays
   * - Concatenates all extraHashedArgs arrays
   *
   * @param executionPayloads - Array of {@link ExecutionPayload} objects to merge.
   * @returns A single merged {@link ExecutionPayload}.
   */
  function mergeExecutionPayloads(executionPayloads: ExecutionPayload[]): ExecutionPayload {
    logger.debug(`Merging ${executionPayloads.length} execution payloads into atomic batch`);

    const mergedPayload: ExecutionPayload = {
      calls: [],
      authWitnesses: [],
      capsules: [],
      extraHashedArgs: [],
    };

    for (const payload of executionPayloads) {
      mergedPayload.calls.push(...payload.calls);
      mergedPayload.authWitnesses.push(...payload.authWitnesses);
      mergedPayload.capsules.push(...payload.capsules);
      mergedPayload.extraHashedArgs.push(...(payload.extraHashedArgs ?? []));
    }

    logger.debug(
      `Merged payload: ${mergedPayload.calls.length} calls, ${mergedPayload.authWitnesses.length} authWitnesses, ${mergedPayload.capsules.length} capsules, ${mergedPayload.extraHashedArgs.length} extraHashedArgs`,
    );

    return mergedPayload;
  }

  /**
   * @internal
   * Helper function to execute a batch of transactions atomically from multiple {@link ExecutionPayload} objects.
   * This consolidates the batch flow:
   * 1. Generate unique transaction status ID
   * 2. Send 'initiated' notification
   * 3. Validate all payloads
   * 4. Merge payloads into single atomic batch
   * 5. Create TxExecutionRequest using BatchCall
   * 6. Simulate, prove, and send the batch transaction
   * 7. Wait for receipt
   *
   * All operations succeed together or all fail together (atomic execution).
   *
   * @param ctx - The {@link AztecHandlerContext}.
   * @param executionPayloads - Array of {@link ExecutionPayload} objects to execute as batch.
   * @param sendOptions - Optional {@link AztecSendOptions} for fee configuration.
   * @returns A promise resolving to an object containing the blockchain tx hash, receipt, and status tracking ID.
   */
  async function executeBatchTransaction(
    ctx: AztecHandlerContext,
    executionPayloads: ExecutionPayload[],
    _sendOptions?: AztecSendOptions,
  ): Promise<{ txHash: TxHash; receipt: TxReceipt; txStatusId: string }> {
    const startTime = Date.now();

    // Generate unique transaction status ID for tracking
    const txStatusId = crypto.randomUUID();

    logger.debug(
      `Starting batch transaction execution. StatusId: ${txStatusId}, Wallet: ${ctx.wallet.getAddress().toString()}, Payloads: ${executionPayloads.length}`,
    );
    logger.debug('Execution payloads:', executionPayloads);

    try {
      // Stage 0: Initiated (batch received, ID generated)
      logger.debug('Batch transaction initiated, sending initial notification...');
      await notifyTransactionStatus(ctx, { txStatusId, status: 'initiated' });

      // Validate all payloads
      validateBatchPayloads(executionPayloads);

      // Merge payloads into single atomic batch
      const mergedPayload = mergeExecutionPayloads(executionPayloads);

      // Stage 1: Simulating (maps to Aztec's simulate())
      logger.debug('Starting batch transaction simulation...');
      await notifyTransactionStatus(ctx, { txStatusId, status: 'simulating' });

      const txRequest = await createTxExecutionRequest(ctx, mergedPayload);
      const simulationResult = await simulateTransaction(ctx, mergedPayload, txRequest);
      logger.debug('Batch transaction simulation completed');

      // Stage 2: Proving (zero-knowledge proof generation for entire batch)
      logger.debug('Starting batch transaction proving...');
      await notifyTransactionStatus(ctx, { txStatusId, status: 'proving' });

      const proveStartTime = Date.now();
      const provingResult = await ctx.wallet.proveTx(txRequest, simulationResult.privateExecutionResult);
      const provingTime = Date.now() - proveStartTime;
      logger.debug(
        `Batch transaction proving completed in ${provingTime}ms (single proof for all operations)`,
      );
      logger.debug('Proving result:', provingResult);

      logger.debug('Creating transaction from proving result...');
      const tx = await provingResult.toTx();
      logger.debug('Transaction created:', tx);

      let txHashString: string | undefined;
      try {
        txHashString = tx?.getTxHash?.()?.toString?.();
      } catch (hashError) {
        logger.debug('Unable to derive tx hash after proving', {
          error: hashError instanceof Error ? hashError.message : hashError,
        });
      }

      // Stage 3: Sending (maps to Aztec's send())
      logger.debug('Sending batch transaction to network...');
      await notifyTransactionStatus(ctx, {
        txStatusId,
        status: 'sending',
        ...(txHashString && { txHash: txHashString }),
      });

      const sendStartTime = Date.now();
      const txHash = await ctx.wallet.sendTx(tx);
      logger.debug(`Batch transaction sent in ${Date.now() - sendStartTime}ms, hash: ${txHash.toString()}`);

      // Stage 4: Pending (waiting for confirmation)
      await notifyTransactionStatus(ctx, {
        txStatusId,
        status: 'pending',
        txHash: txHash.toString(),
      });

      // Wait for transaction receipt
      logger.debug('Waiting for batch transaction receipt...');
      const receipt = await ctx.wallet.getTxReceipt(txHash);
      logger.debug('Batch transaction receipt received:', receipt);

      return { txHash, receipt, txStatusId };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      logger.error(`Batch transaction execution failed after ${totalTime}ms}`);
      logger.error('Error details:', error);

      // Send failed notification
      await notifyTransactionStatus(ctx, {
        txStatusId,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  return {
    /**
     * Handles the "aztec_wmExecuteTx" JSON-RPC method.
     * This WalletMesh-specific method takes an {@link ExecutionPayload} and handles
     * the full lifecycle of simulating, proving, and sending the transaction.
     *
     * The backend automatically generates a unique `txStatusId` and sends status notifications
     * (initiated/simulating/proving/sending/pending/failed) throughout the transaction lifecycle.
     * The frontend can listen to `aztec_transactionStatus` events and correlate them using the
     * returned `txStatusId`.
     *
     * @param ctx - The {@link AztecHandlerContext}.
     * @param paramsTuple - A tuple containing the {@link ExecutionPayload}.
     *                      Defined by {@link AztecWalletMethodMap.aztec_wmExecuteTx.params}.
     * @param paramsTuple.0 - The {@link ExecutionPayload} to execute.
     * @returns A promise that resolves to an object containing the blockchain transaction hash
     *          and the status tracking ID. Type defined by {@link AztecWalletMethodMap.aztec_wmExecuteTx.result}.
     */
    aztec_wmExecuteTx: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_wmExecuteTx']['params'],
    ): Promise<AztecWalletMethodMap['aztec_wmExecuteTx']['result']> => {
      const [executionPayload] = paramsTuple;
      return executeTransaction(ctx, executionPayload);
    },

    /**
     * Handles the "aztec_wmBatchExecute" JSON-RPC method.
     * This WalletMesh-specific method executes multiple contract interactions as a single atomic batch.
     *
     * Uses Aztec's native batch execution to create one transaction with one proof for all operations.
     * All operations succeed together or all fail together (atomic execution).
     *
     * The wallet receives the complete batch upfront, allowing it to display all operations
     * to the user for approval before execution. This provides better security UX compared
     * to approving operations one-by-one.
     *
     * The backend automatically generates a unique `txStatusId` and sends status notifications
     * (initiated/simulating/proving/sending/pending/failed) throughout the batch lifecycle.
     * The frontend can listen to `aztec_transactionStatus` events and correlate them using the
     * returned `txStatusId`.
     *
     * @param ctx - The {@link AztecHandlerContext}.
     * @param paramsTuple - A tuple containing an array of {@link ExecutionPayload} objects and optional {@link AztecSendOptions}.
     *                      Defined by {@link AztecWalletMethodMap.aztec_wmBatchExecute.params}.
     * @param paramsTuple.0 executionPayloads - Array of {@link ExecutionPayload} objects to execute as batch.
     * @param paramsTuple.1 sendOptions - Optional {@link AztecSendOptions} for fee configuration.
     * @returns A promise that resolves to an object containing the blockchain transaction hash,
     *          receipt, and status tracking ID. Type defined by {@link AztecWalletMethodMap.aztec_wmBatchExecute.result}.
     */
    aztec_wmBatchExecute: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_wmBatchExecute']['params'],
    ): Promise<AztecWalletMethodMap['aztec_wmBatchExecute']['result']> => {
      const [executionPayloads, sendOptions] = paramsTuple;
      return executeBatchTransaction(ctx, executionPayloads, sendOptions);
    },

    /**
     * Handles the "aztec_wmSimulateTx" JSON-RPC method.
     * This WalletMesh-specific method takes an {@link ExecutionPayload} and simulates
     * the transaction, returning the {@link TxSimulationResult}.
     *
     * @param ctx - The {@link AztecHandlerContext}.
     * @param paramsTuple - A tuple containing the {@link ExecutionPayload}.
     *                      Defined by {@link AztecWalletMethodMap.aztec_wmSimulateTx.params}.
     * @param paramsTuple.0 - The {@link ExecutionPayload} to simulate.
     * @returns A promise that resolves to the {@link TxSimulationResult}.
     *          Type defined by {@link AztecWalletMethodMap.aztec_wmSimulateTx.result}.
     */
    aztec_wmSimulateTx: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_wmSimulateTx']['params'],
    ): Promise<AztecWalletMethodMap['aztec_wmSimulateTx']['result']> => {
      const [executionPayload] = paramsTuple;
      return await simulateTransaction(ctx, executionPayload);
    },

    /**
     * Handles the "aztec_wmDeployContract" JSON-RPC method.
     * This WalletMesh-specific method deploys a new contract using its {@link ContractArtifact}
     * and constructor arguments. It manages the deployment transaction lifecycle, including
     * computing the contract address, proving, and sending the deployment transaction.
     *
     * Fee configuration is determined internally by the `getFeeOptions` helper.
     *
     * @param ctx - The {@link AztecHandlerContext}.
     * @param paramsTuple - A tuple containing the deployment parameters (artifact, args, constructorName).
     *                      Defined by {@link AztecWalletMethodMap.aztec_wmDeployContract.params}.
     * @param paramsTuple.0.artifact - The {@link ContractArtifact} of the contract to deploy.
     * @param paramsTuple.0.args - An array of arguments for the contract's constructor.
     * @param paramsTuple.0.constructorName - Optional name of the constructor function if the artifact has multiple.
     * @returns A promise that resolves to an object containing the `txHash` ({@link TxHash})
     *          of the deployment transaction and the `contractAddress` ({@link AztecAddress})
     *          of the newly deployed contract.
     *          Type defined by {@link AztecWalletMethodMap.aztec_wmDeployContract.result}.
     */
    aztec_wmDeployContract: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_wmDeployContract']['params'],
    ): Promise<AztecWalletMethodMap['aztec_wmDeployContract']['result']> => {
      const [params] = paramsTuple;
      const { artifact, args, constructorName } = params;

      // Generate unique transaction status ID for tracking
      const txStatusId = crypto.randomUUID();

      logger.debug(
        `aztec_wmDeployContract: deploying ${artifact.name} with ${args.length} args. StatusId: ${txStatusId}`,
      );

      try {
        // Stage 0: Initiated (deployment request received, ID generated)
        logger.debug('Deployment initiated, sending initial notification...');
        await notifyTransactionStatus(ctx, { txStatusId, status: 'initiated' });

        // Create deployment method using the server-side wallet
        const deployMethod = Contract.deploy(ctx.wallet, artifact, args, constructorName);

        const contractAddressSalt = Fr.random();
        const txOpts = await getTxOptions(ctx);
        const opts: DeployOptions = {
          from: ctx.wallet.getAddress(),
          contractAddressSalt,
          fee: await getFeeOptions(ctx),
        };
        if (txOpts.txNonce) {
          opts.txNonce = txOpts.txNonce;
        }
        if (txOpts.cancellable) {
          opts.cancellable = txOpts.cancellable;
        }

        // Compute the contract address
        let contractAddress: AztecAddress | undefined;
        try {
          const instance = await deployMethod.getInstance(opts);
          contractAddress = instance.address;
          logger.debug(`Computed contract address: ${contractAddress.toString()}`);
        } catch (error) {
          logger.error(`Failed to compute contract address for ${artifact.name}:`, error);

          // Send failed notification
          await notifyTransactionStatus(ctx, {
            txStatusId,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
          });

          throw new JSONRPCError(-32603, `Failed to compute contract address for ${artifact.name}`, {
            stage: 'address_computation',
            contractName: artifact.name,
            error:
              error instanceof Error
                ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                  }
                : String(error),
          });
        }

        // Stage 1: Proving (zero-knowledge proof generation)
        logger.debug('Starting deployment proving...');
        await notifyTransactionStatus(ctx, { txStatusId, status: 'proving' });

        // Prove the deployment transaction
        let deployProvenTx: ProvenTx | undefined;
        try {
          const proveStartTime = Date.now();
          deployProvenTx = await deployMethod.prove(opts);
          logger.debug(`Deployment proving completed in ${Date.now() - proveStartTime}ms`);
        } catch (error) {
          logger.error(`Failed to prove deployment for ${artifact.name}:`, error);

          // Send failed notification
          await notifyTransactionStatus(ctx, {
            txStatusId,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
          });

          throw new JSONRPCError(-32603, `Failed to prove contract deployment for ${artifact.name}`, {
            stage: 'proof_generation',
            contractName: artifact.name,
            contractAddress: contractAddress?.toString(),
            error:
              error instanceof Error
                ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                  }
                : String(error),
          });
        }

        // Stage 2: Sending (submitting deployment transaction to network)
        logger.debug('Sending deployment transaction to network...');
        await notifyTransactionStatus(ctx, { txStatusId, status: 'sending' });

        // Send the deployment transaction
        let deploySentTx: SentTx | undefined;
        let txHash: TxHash | undefined;
        try {
          const sendStartTime = Date.now();
          deploySentTx = await deployProvenTx.send();
          txHash = await deploySentTx.getTxHash();
          logger.debug(
            `Deployment transaction sent in ${Date.now() - sendStartTime}ms, hash: ${txHash.toString()}`,
          );
        } catch (error) {
          logger.error(`Failed to send deployment transaction for ${artifact.name}:`, error);

          // Send failed notification
          await notifyTransactionStatus(ctx, {
            txStatusId,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
          });

          throw new JSONRPCError(-32603, `Failed to send deployment transaction for ${artifact.name}`, {
            stage: 'transaction_send',
            contractName: artifact.name,
            contractAddress: contractAddress?.toString(),
            error:
              error instanceof Error
                ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                  }
                : String(error),
          });
        }

        if (!txHash) {
          // Send failed notification
          await notifyTransactionStatus(ctx, {
            txStatusId,
            status: 'failed',
            error: 'Failed to get transaction hash after deployment',
          });

          throw new JSONRPCError(-32603, 'Failed to get transaction hash after deployment', {
            stage: 'transaction_hash',
            contractName: artifact.name,
            contractAddress: contractAddress?.toString(),
          });
        }

        // Stage 3: Pending (waiting for confirmation)
        await notifyTransactionStatus(ctx, {
          txStatusId,
          status: 'pending',
          txHash: txHash.toString(),
        });

        return {
          txHash,
          contractAddress,
          txStatusId,
        };
      } catch (error) {
        // If error is already a JSONRPCError, re-throw it
        if (error instanceof JSONRPCError) {
          throw error;
        }

        // Otherwise wrap it with general deployment error and send failed notification
        logger.error(`Contract deployment failed for ${artifact.name}:`, error);

        await notifyTransactionStatus(ctx, {
          txStatusId,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        });

        throw new JSONRPCError(-32603, `Contract deployment failed for ${artifact.name}`, {
          stage: 'general',
          contractName: artifact.name,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name,
                }
              : String(error),
        });
      }
    },
  };
}

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
import { createLogger } from '@aztec/foundation/log';
import { GasSettings } from '@aztec/stdlib/gas';
import type { TxExecutionRequest, TxSimulationResult } from '@aztec/stdlib/tx';
import { JSONRPCError } from '@walletmesh/jsonrpc';
import type { AztecWalletMethodMap } from '../../types.js';
import type { AztecHandlerContext } from './index.js';

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
   * 1. Create TxExecutionRequest (if needed, though typically done by `aztec_wmExecuteTx` caller or here).
   * 2. Simulate transaction.
   * 3. Prove transaction.
   * 4. Send transaction.
   *
   * @param ctx - The {@link AztecHandlerContext}.
   * @param executionPayload - The {@link ExecutionPayload} for the transaction.
   * @returns A promise resolving to the {@link TxHash} of the sent transaction.
   */
  async function executeTransaction(
    ctx: AztecHandlerContext,
    executionPayload: ExecutionPayload,
  ): Promise<TxHash> {
    const startTime = Date.now();
    logger.debug(
      `Starting transaction execution. Wallet: ${ctx.wallet.getAddress().toString()}, Payload: ${executionPayload.calls.length} calls`,
    );
    logger.debug('Execution payload:', executionPayload);

    try {
      const txRequest = await createTxExecutionRequest(ctx, executionPayload);
      const simulationResult = await simulateTransaction(ctx, executionPayload, txRequest);

      logger.debug('Starting transaction proving...');
      const proveStartTime = Date.now();
      const provingResult = await ctx.wallet.proveTx(txRequest, simulationResult.privateExecutionResult);
      logger.debug(`Transaction proving completed in ${Date.now() - proveStartTime}ms`);
      logger.debug('Proving result:', provingResult);

      logger.debug('Creating transaction from proving result...');
      const tx = await provingResult.toTx();
      logger.debug('Transaction created:', tx);

      logger.debug('Sending transaction to network...');
      const sendStartTime = Date.now();
      const txHash = await ctx.wallet.sendTx(tx);
      logger.debug(`Transaction sent in ${Date.now() - sendStartTime}ms, hash: ${txHash.toString()}`);

      return txHash;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      logger.error(`Transaction execution failed after ${totalTime}ms}`);
      logger.error('Error details:', error);
      throw error;
    }
  }

  return {
    /**
     * Handles the "aztec_wmExecuteTx" JSON-RPC method.
     * This WalletMesh-specific method takes an {@link ExecutionPayload} and handles
     * the full lifecycle of simulating, proving, and sending the transaction.
     *
     * @param ctx - The {@link AztecHandlerContext}.
     * @param paramsTuple - A tuple containing the {@link ExecutionPayload}.
     *                      Defined by {@link AztecWalletMethodMap.aztec_wmExecuteTx.params}.
     * @param paramsTuple.0 - The {@link ExecutionPayload} to execute.
     * @returns A promise that resolves to the {@link TxHash} of the sent transaction.
     *          Type defined by {@link AztecWalletMethodMap.aztec_wmExecuteTx.result}.
     */
    aztec_wmExecuteTx: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_wmExecuteTx']['params'],
    ): Promise<AztecWalletMethodMap['aztec_wmExecuteTx']['result']> => {
      const [executionPayload] = paramsTuple;
      return executeTransaction(ctx, executionPayload);
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

      logger.debug(`aztec_wmDeployContract: deploying ${artifact.name} with ${args.length} args`);

      try {
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

        // Prove the deployment transaction
        let deployProvenTx: ProvenTx | undefined;
        try {
          deployProvenTx = await deployMethod.prove(opts);
        } catch (error) {
          logger.error(`Failed to prove deployment for ${artifact.name}:`, error);
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

        // Send the deployment transaction
        let deploySentTx: SentTx | undefined;
        let txHash: TxHash | undefined;
        try {
          deploySentTx = await deployProvenTx.send();
          txHash = await deploySentTx.getTxHash();
          logger.debug(`Contract deployed, hash: ${txHash.toString()}`);
        } catch (error) {
          logger.error(`Failed to send deployment transaction for ${artifact.name}:`, error);
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
          throw new JSONRPCError(-32603, 'Failed to get transaction hash after deployment', {
            stage: 'transaction_hash',
            contractName: artifact.name,
            contractAddress: contractAddress?.toString(),
          });
        }

        return {
          txHash,
          contractAddress,
        };
      } catch (error) {
        // If error is already a JSONRPCError, re-throw it
        if (error instanceof JSONRPCError) {
          throw error;
        }

        // Otherwise wrap it with general deployment error
        logger.error(`Contract deployment failed for ${artifact.name}:`, error);
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

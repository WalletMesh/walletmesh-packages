import { createLogger } from '@aztec/foundation/log';
import type { AztecWalletMethodMap } from '../../types.js';
import type { AztecHandlerContext } from './index.js';

const logger = createLogger('aztec-rpc-wallet:transaction');

/**
 * Creates handlers for transaction-related Aztec wallet JSON-RPC methods.
 * These handlers are responsible for the core lifecycle of an Aztec transaction,
 * including proving, sending, simulating, and retrieving receipts.
 *
 * Each handler function receives an {@link AztecHandlerContext}, providing access to the
 * {@link AccountWallet} and {@link PXE} client instances necessary for these operations.
 *
 * @returns An object where keys are transaction-related method names
 *          (e.g., "aztec_proveTx", "aztec_sendTx") and values are their
 *          corresponding handler functions.
 * @see {@link AztecWalletMethodMap} for method definitions.
 */
export function createTransactionHandlers() {
  return {
    /**
     * Handles the "aztec_proveTx" JSON-RPC method.
     * Generates zero-knowledge proofs for a given {@link TxExecutionRequest}.
     * If the {@link PrivateExecutionResult} is not provided, this handler will first
     * simulate the private execution of the transaction to obtain it.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the transaction execution request and an optional private execution result.
     *                      Defined by {@link AztecWalletMethodMap.aztec_proveTx.params}.
     * @param paramsTuple.0 - The {@link TxExecutionRequest} to prove.
     * @param paramsTuple.1 - Optional: The {@link PrivateExecutionResult} from a prior private simulation.
     *                        If not provided, a private simulation will be performed internally.
     * @returns A promise that resolves to the {@link TxProvingResult}, which includes the proven transaction.
     *          Type defined by {@link AztecWalletMethodMap.aztec_proveTx.result}.
     * @throws {Error} If `txRequest` is missing, or if simulation is needed but fails to produce a `PrivateExecutionResult`.
     */
    aztec_proveTx: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_proveTx']['params'],
    ): Promise<AztecWalletMethodMap['aztec_proveTx']['result']> => {
      let [txRequest, privateExecutionResult] = paramsTuple; // privateExecutionResult can now be undefined
      logger.debug(`[HANDLER] aztec_proveTx: txRequest received = ${!!txRequest}`);
      if (!txRequest) {
        // Only txRequest is mandatory now
        throw new Error('Invalid parameters received in tuple for aztec_proveTx: txRequest is missing');
      }

      if (!privateExecutionResult) {
        logger.debug(
          '[HANDLER] aztec_proveTx: privateExecutionResult not provided, simulating transaction first.',
        );
        // Simulate the private part of the transaction to get the PrivateExecutionResult
        // Pass false for simulatePublic, as we only need the private execution.
        // Pass undefined for msgSender, skipTxValidation, skipFeeEnforcement to use defaults.
        const simulationResult = await ctx.wallet.simulateTx(
          txRequest,
          false,
          undefined,
          undefined,
          undefined,
        );
        privateExecutionResult = simulationResult.privateExecutionResult;
        if (!privateExecutionResult) {
          throw new Error('Failed to obtain PrivateExecutionResult from simulation for aztec_proveTx');
        }
        logger.debug('[HANDLER] aztec_proveTx: privateExecutionResult obtained from simulation.');
      }

      return await ctx.wallet.proveTx(txRequest, privateExecutionResult);
    },

    /**
     * Handles the "aztec_sendTx" JSON-RPC method.
     * Sends a proven {@link Tx} (transaction object) to the Aztec network via the
     * {@link AccountWallet} in the context.
     *
     * This is typically the final step in submitting a transaction after it has been
     * successfully proven by `aztec_proveTx`.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the proven transaction.
     *                      Defined by {@link AztecWalletMethodMap.aztec_sendTx.params}.
     * @param paramsTuple.0 - The proven {@link Tx} object to send.
     * @returns A promise that resolves to the {@link TxHash} of the sent transaction.
     *          Type defined by {@link AztecWalletMethodMap.aztec_sendTx.result}.
     * @throws {Error} If the `tx` parameter is missing or invalid.
     */
    aztec_sendTx: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_sendTx']['params'],
    ): Promise<AztecWalletMethodMap['aztec_sendTx']['result']> => {
      const [tx] = paramsTuple;
      logger.debug(`[HANDLER] aztec_sendTx: tx hash = ${tx?.getTxHash()?.toString()}`);
      if (!tx) {
        // tx is mandatory
        throw new Error('Invalid tx parameter received in tuple');
      }
      return await ctx.wallet.sendTx(tx);
    },

    /**
     * Handles the "aztec_getTxReceipt" JSON-RPC method.
     * Retrieves the {@link TxReceipt} for a transaction identified by its {@link TxHash},
     * using the {@link AccountWallet} in the context.
     *
     * The receipt provides information about the transaction's execution status
     * (e.g., success, failure, reverted), block inclusion, and any emitted events.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the transaction hash.
     *                      Defined by {@link AztecWalletMethodMap.aztec_getTxReceipt.params}.
     * @param paramsTuple.0 - The {@link TxHash} of the transaction.
     * @returns A promise that resolves to the {@link TxReceipt}.
     *          Type defined by {@link AztecWalletMethodMap.aztec_getTxReceipt.result}.
     * @throws {Error} If the `txHash` parameter is missing or invalid.
     */
    aztec_getTxReceipt: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_getTxReceipt']['params'],
    ): Promise<AztecWalletMethodMap['aztec_getTxReceipt']['result']> => {
      const [txHash] = paramsTuple;
      logger.debug(`[HANDLER] aztec_getTxReceipt: txHash = ${txHash?.toString()}`);
      if (!txHash) {
        // txHash is mandatory
        throw new Error('Invalid txHash parameter received in tuple');
      }
      return await ctx.wallet.getTxReceipt(txHash);
    },

    /**
     * Handles the "aztec_simulateTx" JSON-RPC method.
     * Simulates the execution of a {@link TxExecutionRequest} without actually proving
     * or sending it to the network. This is useful for estimating gas, verifying
     * correctness, or debugging.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the parameters for simulation.
     *                      Defined by {@link AztecWalletMethodMap.aztec_simulateTx.params}.
     * @param paramsTuple.0 - The {@link TxExecutionRequest} to simulate.
     * @param paramsTuple.1 - Optional: Boolean indicating whether to simulate public parts of the transaction. Defaults to `false`.
     * @param paramsTuple.2 - Optional: Boolean flag to skip transaction validation during simulation.
     * @param paramsTuple.3 - Optional: Boolean flag to skip fee enforcement during simulation.
     * @param paramsTuple.4 - Optional: {@link SimulationOverrides} for simulation context (includes msgSender).
     * @param paramsTuple.5 - Optional: Array of {@link AztecAddress} scopes for the simulation.
     * @returns A promise that resolves to the {@link TxSimulationResult}.
     *          Type defined by {@link AztecWalletMethodMap.aztec_simulateTx.result}.
     * @throws {Error} If the `txRequest` parameter is missing or invalid.
     */
    aztec_simulateTx: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_simulateTx']['params'],
    ): Promise<AztecWalletMethodMap['aztec_simulateTx']['result']> => {
      const [
        txRequest,
        simulatePublicInput, // simulatePublic is optional in PXE interface
        skipTxValidation,
        skipFeeEnforcementInput, // skipFeeEnforcement is optional in PXE interface
        overrides, // SimulationOverrides which may contain msgSender
      ] = paramsTuple;
      // Handle optional params with defaults if necessary, matching PXE behavior
      const simulatePublic = simulatePublicInput === undefined ? false : simulatePublicInput;
      const skipFeeEnforcement = skipFeeEnforcementInput === undefined ? false : skipFeeEnforcementInput;

      logger.debug(`[HANDLER] aztec_simulateTx: txRequest received = ${!!txRequest}`);
      if (!txRequest) {
        // txRequest is mandatory
        throw new Error('Invalid txRequest parameter received in tuple');
      }

      // Call with the parameters that the underlying wallet expects
      return await ctx.wallet.simulateTx(
        txRequest,
        simulatePublic,
        skipTxValidation,
        skipFeeEnforcement,
        overrides,
      );
    },

    /**
     * Handles the "aztec_profileTx" JSON-RPC method.
     * Profiles a {@link TxExecutionRequest} to gather performance metrics, such as
     * gate counts and execution steps, without sending it to the network.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the parameters for profiling.
     *                      Defined by {@link AztecWalletMethodMap.aztec_profileTx.params}.
     * @param paramsTuple.0 - The {@link TxExecutionRequest} to profile.
     * @param paramsTuple.1 - Optional: The profiling mode ('gates', 'execution-steps', or 'full'). Defaults to 'gates'.
     * @param paramsTuple.2 - Optional: Boolean flag to skip proof generation during profiling.
     * @param paramsTuple.3 - Optional: The {@link AztecAddress} of the message sender for profiling context.
     * @returns A promise that resolves to the {@link TxProfileResult}.
     *          Type defined by {@link AztecWalletMethodMap.aztec_profileTx.result}.
     * @throws {Error} If the `txRequest` parameter is missing or invalid.
     */
    aztec_profileTx: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_profileTx']['params'],
    ): Promise<AztecWalletMethodMap['aztec_profileTx']['result']> => {
      const [txRequest, profileModeInput, skipProofGeneration, msgSender] = paramsTuple;
      const profileMode = profileModeInput === undefined ? 'gates' : profileModeInput; // Default for optional

      logger.debug(`[HANDLER] aztec_profileTx: txRequest received = ${!!txRequest}`);
      if (!txRequest) {
        // txRequest is mandatory
        throw new Error('Invalid txRequest parameter received in tuple');
      }
      return await ctx.wallet.profileTx(txRequest, profileMode, skipProofGeneration, msgSender);
    },

    /**
     * Handles the "aztec_simulateUtility" JSON-RPC method.
     * Simulates a call to a utility (view) function on a contract. Utility functions
     * are read-only and do not modify state or require a transaction.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the parameters for the utility function call.
     *                      Defined by {@link AztecWalletMethodMap.aztec_simulateUtility.params}.
     * @param paramsTuple.0 - The name of the utility function to call.
     * @param paramsTuple.1 - An array of arguments for the function call.
     * @param paramsTuple.2 - The {@link AztecAddress} of the contract or account to call.
     * @param paramsTuple.3 - Optional: An array of {@link AuthWitness} for authorization, if needed.
     * @param paramsTuple.4 - Optional: The {@link AztecAddress} of the sender, if relevant for the utility call.
     * @returns A promise that resolves to the {@link UtilitySimulationResult}.
     *          Type defined by {@link AztecWalletMethodMap.aztec_simulateUtility.result}.
     * @throws {Error} If required parameters like `functionName`, `args`, or `to` are missing or invalid.
     */
    aztec_simulateUtility: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_simulateUtility']['params'],
    ): Promise<AztecWalletMethodMap['aztec_simulateUtility']['result']> => {
      const [functionName, args, to, authWits, from] = paramsTuple;
      logger.debug(`[HANDLER] aztec_simulateUtility: functionName = ${functionName}, to = ${to?.toString()}`);
      if (!functionName || !args || !to) {
        // Mandatory params
        throw new Error('Invalid parameters received in tuple for aztec_simulateUtility');
      }
      return await ctx.wallet.simulateUtility(functionName, args, to, authWits, from);
    },
  };
}

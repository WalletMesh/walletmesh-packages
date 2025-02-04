/**
 * @module handlers
 *
 * This module provides the core RPC method handling logic for the Aztec wallet.
 * It routes incoming RPC requests to appropriate specialized handlers based on the method type.
 *
 * The handlers are organized into categories:
 * - Base wallet methods (connect, getAccount, etc.)
 * - Account wallet methods (chain operations, contract management, etc.)
 * - Transaction methods (send, simulate)
 *
 * Each method handler validates inputs, performs the requested operation through the wallet,
 * and returns properly formatted responses.
 */

import type { AztecWalletMethodMap } from './types.js';
import { type AztecWalletContext, BASE_WALLET_METHODS } from './types.js';
import { AztecWalletError } from './errors.js';
import { sendTransaction, simulateTransaction } from './handlers/transactions.js';
import { aztecWalletHandler, AZTEC_WALLET_METHODS } from './handlers/aztecAccountWallet.js';

/**
 * Main handler function that routes RPC method calls to appropriate specialized handlers.
 *
 * @param context - The wallet context containing PXE and wallet instances
 * @param method - The RPC method being called
 * @param params - Parameters passed to the method
 * @returns Result from the method handler
 * @throws {AztecWalletError} If method not supported or handler fails
 */

export async function handler<M extends keyof AztecWalletMethodMap>(
  context: AztecWalletContext,
  method: M,
  params: AztecWalletMethodMap[M]['params'],
): Promise<AztecWalletMethodMap[M]['result']> {
  if (AZTEC_WALLET_METHODS.includes(method)) {
    return aztecWalletHandler(context, method, params);
  }
  switch (method) {
    // Base wallet methods
    case 'wm_getSupportedMethods': {
      // Return combined list of supported methods from all handlers
      return [...BASE_WALLET_METHODS, ...AZTEC_WALLET_METHODS] as string[];
    }
    case 'aztec_connect': {
      // Basic connection validation
      // Note: Main connection logic handled by provider
      return true;
    }
    // Core wallet methods
    case 'aztec_getAccount':
      return (await context.wallet.getAddress()).toString();

    // Transaction methods
    case 'aztec_sendTransaction':
      return await sendTransaction(
        context,
        params as AztecWalletMethodMap['aztec_sendTransaction']['params'],
      );
    case 'aztec_simulateTransaction':
      return await simulateTransaction(
        context,
        params as AztecWalletMethodMap['aztec_simulateTransaction']['params'],
      );

    default:
      throw new AztecWalletError('invalidRequest', `Method not supported: ${String(method)}`);
  }
}

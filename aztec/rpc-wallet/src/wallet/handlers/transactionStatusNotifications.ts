import { createLogger } from '@aztec/foundation/log';
import type { AztecTransactionStatusNotification } from '../../types.js';
import type { AztecHandlerContext } from './index.js';

const logger = createLogger('aztec-rpc-wallet:transaction-status-notifications');

/**
 * Payload for transaction status notification (before timestamp is added)
 */
type TransactionStatusPayload = Omit<AztecTransactionStatusNotification, 'timestamp'> & {
  timestamp?: number;
};

/**
 * Send a transaction status notification to the frontend.
 *
 * The backend automatically generates a `txStatusId` at the start of transaction execution
 * and sends status notifications throughout the transaction lifecycle. The frontend listens
 * to `aztec_transactionStatus` events and correlates them using the `txStatusId`.
 *
 * Gracefully handles errors - notification failures do not block transaction execution.
 *
 * @param ctx - The Aztec handler context with notify function
 * @param payload - The notification payload with backend-generated txStatusId
 */
export async function notifyTransactionStatus(
  ctx: AztecHandlerContext,
  payload: TransactionStatusPayload,
): Promise<void> {
  if (typeof ctx.notify !== 'function') {
    logger.debug('ctx.notify is not a function, skipping transaction status notification');
    return;
  }

  const resolvedTimestamp = payload.timestamp ?? Date.now();

  const notification: AztecTransactionStatusNotification = {
    ...payload,
    timestamp: resolvedTimestamp,
  };

  logger.debug('Sending aztec_transactionStatus notification', notification);

  try {
    await ctx.notify('aztec_transactionStatus', notification);
    logger.debug('Successfully sent aztec_transactionStatus notification', {
      txStatusId: payload.txStatusId,
      status: payload.status,
      txHash: payload.txHash,  // Log blockchain hash if available
    });
  } catch (error) {
    logger.warn('Failed to emit aztec_transactionStatus notification', {
      error: error instanceof Error ? error.message : error,
      txStatusId: payload.txStatusId,
      status: payload.status,
    });
    // Don't throw - notification failures should not block transaction execution
  }
}
